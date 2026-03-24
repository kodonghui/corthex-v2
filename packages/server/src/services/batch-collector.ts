import { randomUUID } from 'crypto'
import { resolveProvider } from './llm-router'
import { getCredentials } from './credential-vault'
import { createProvider } from '../lib/llm/index'
import { recordCost, calculateCostMicro } from '../lib/cost-tracker'
import { getModelConfig } from '../config/models'
import type { LLMRequest, LLMResponse, LLMProviderName, BatchItem, BatchItemStatus, BatchStatus, BatchFlushResult } from '@corthex/shared'
import type { LLMRouterContext } from './llm-router'

// === Constants ===

const MAX_QUEUE_SIZE = 1000 // NFR19
const BATCH_POLL_INTERVAL_MS = 10_000

// === BatchCollector ===

export class BatchCollector {
  private queues: Map<string, BatchItem[]> = new Map()

  /**
   * Add a non-urgent LLM request to the batch queue.
   * Returns the batch item ID for tracking.
   */
  enqueue(request: LLMRequest, context: LLMRouterContext): BatchItem {
    const companyId = context.companyId
    const queue = this.getOrCreateQueue(companyId)

    // Count pending+processing items (not completed/failed)
    const activeCount = queue.filter(i => i.status === 'pending' || i.status === 'processing').length
    if (activeCount >= MAX_QUEUE_SIZE) {
      throw new Error(`Batch queue full (${MAX_QUEUE_SIZE} items). Run /배치실행 to flush or wait for completion.`)
    }

    const item: BatchItem = {
      id: randomUUID(),
      companyId,
      request,
      context: {
        companyId: context.companyId,
        agentId: context.agentId,
        agentName: context.agentName,
        sessionId: context.sessionId,
        source: context.source,
      },
      status: 'pending',
      enqueuedAt: new Date().toISOString(),
    }

    queue.push(item)
    return item
  }

  /**
   * Get queue statistics for a company.
   */
  getStatus(companyId: string): BatchStatus {
    const queue = this.queues.get(companyId) ?? []
    let pending = 0
    let processing = 0
    let completed = 0
    let failed = 0
    let estimatedSavingsMicro = 0

    for (const item of queue) {
      switch (item.status) {
        case 'pending':
          pending++
          // Estimate savings: 50% of the cost that would be charged at full price
          estimatedSavingsMicro += this.estimateItemCostMicro(item) * 0.5
          break
        case 'processing':
          processing++
          break
        case 'completed':
          completed++
          break
        case 'failed':
          failed++
          break
      }
    }

    return {
      pending,
      processing,
      completed,
      failed,
      totalItems: queue.length,
      estimatedSavingsMicro: Math.round(estimatedSavingsMicro),
    }
  }

  /**
   * Get queue items for a company, optionally filtered by status.
   */
  getItems(companyId: string, status?: BatchItemStatus): BatchItem[] {
    const queue = this.queues.get(companyId) ?? []
    if (status) return queue.filter(i => i.status === status)
    return [...queue]
  }

  /**
   * Remove completed and failed items from the queue.
   */
  clearCompleted(companyId: string): number {
    const queue = this.queues.get(companyId)
    if (!queue) return 0

    const before = queue.length
    const active = queue.filter(i => i.status === 'pending' || i.status === 'processing')
    this.queues.set(companyId, active)
    return before - active.length
  }

  /**
   * Flush all pending items for a company via Batch APIs.
   * Anthropic + OpenAI items use their Batch APIs, Gemini falls back to individual calls.
   */
  async flush(companyId: string): Promise<BatchFlushResult[]> {
    const queue = this.queues.get(companyId)
    if (!queue) return []

    const pendingItems = queue.filter(i => i.status === 'pending')
    if (pendingItems.length === 0) return []

    // Mark all as processing
    for (const item of pendingItems) {
      item.status = 'processing'
    }

    // Partition by provider
    const byProvider = new Map<LLMProviderName, BatchItem[]>()
    for (const item of pendingItems) {
      let provider: LLMProviderName
      try {
        provider = resolveProvider(item.request.model)
      } catch {
        item.status = 'failed'
        item.error = `Unknown model: ${item.request.model}`
        item.completedAt = new Date().toISOString()
        continue
      }
      const list = byProvider.get(provider) ?? []
      list.push(item)
      byProvider.set(provider, list)
    }

    const results: BatchFlushResult[] = []

    // Process each provider's batch
    const flushTasks: Promise<BatchFlushResult>[] = []

    const anthropicItems = byProvider.get('anthropic')
    if (anthropicItems?.length) {
      flushTasks.push(this.flushAnthropic(anthropicItems, companyId))
    }

    const openaiItems = byProvider.get('openai')
    if (openaiItems?.length) {
      flushTasks.push(this.flushOpenAI(openaiItems, companyId))
    }

    const settled = await Promise.allSettled(flushTasks)
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }

    // Auto-cleanup: remove completed/failed items to prevent memory leak
    this.clearCompleted(companyId)

    return results
  }

  // === Provider-Specific Flush Methods ===

  /**
   * Submit Anthropic items via Message Batches API.
   */
  async flushAnthropic(items: BatchItem[], companyId: string): Promise<BatchFlushResult> {
    try {
      const credentials = await getCredentials(companyId, 'anthropic')
      const apiKey = credentials.api_key || credentials.apiKey || Object.values(credentials)[0]
      if (!apiKey) throw new Error('No Anthropic API key found')

      // Dynamic import to avoid bundling SDK when not needed
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey })

      // Build batch requests
      const batchRequests = items.map(item => {
        const apiMessages = item.request.messages
          .filter(m => m.role !== 'tool')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

        if (apiMessages.length === 0) {
          apiMessages.push({ role: 'user' as const, content: '(no input)' })
        }

        const params: Record<string, unknown> = {
          model: item.request.model,
          max_tokens: item.request.maxTokens || 8192,
          messages: apiMessages,
        }
        if (item.request.systemPrompt) {
          params.system = item.request.systemPrompt
        }
        if (item.request.temperature !== undefined) {
          params.temperature = item.request.temperature
        }

        return {
          custom_id: item.id,
          params,
        }
      })

      // Create batch
      const batch = await (client.messages.batches as any).create({
        requests: batchRequests,
      })
      const batchId = batch.id as string

      console.log(`[BatchCollector] Anthropic batch submitted: ${batchId} (${items.length} items)`)

      // Poll until ended
      let currentBatch = batch
      while ((currentBatch as any).processing_status !== 'ended') {
        await sleep(BATCH_POLL_INTERVAL_MS)
        currentBatch = await (client.messages.batches as any).retrieve(batchId)
      }

      // Collect results
      const results = (client.messages.batches as any).results(batchId)
      for await (const result of results) {
        const item = items.find(i => i.id === (result as any).custom_id)
        if (!item) continue

        const res = (result as any).result
        if (res.type === 'succeeded') {
          const msg = res.message
          let content = ''
          for (const block of msg.content) {
            if (block.type === 'text') {
              content = block.text
              break
            }
          }
          const inputTokens = msg.usage.input_tokens
          const outputTokens = msg.usage.output_tokens

          item.result = {
            content,
            toolCalls: [],
            usage: { inputTokens, outputTokens },
            model: msg.model,
            provider: 'anthropic',
            finishReason: 'stop',
          }
          item.status = 'completed'
          item.completedAt = new Date().toISOString()

          // Record cost with 50% batch discount
          recordCost({
            companyId,
            agentId: item.context.agentId,
            sessionId: item.context.sessionId,
            provider: 'anthropic',
            model: msg.model,
            inputTokens,
            outputTokens,
            source: item.context.source,
            isBatch: true,
          }).catch(() => {})
        } else {
          item.status = 'failed'
          item.error = `Batch item failed: ${res.type}`
          item.completedAt = new Date().toISOString()
        }
      }

      return { batchId, provider: 'anthropic', itemCount: items.length, status: 'submitted' }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[BatchCollector] Anthropic batch error: ${message}`)

      // Mark all items as failed
      for (const item of items) {
        if (item.status === 'processing') {
          item.status = 'failed'
          item.error = message
          item.completedAt = new Date().toISOString()
        }
      }

      return { batchId: 'error', provider: 'anthropic', itemCount: items.length, status: 'failed', error: message }
    }
  }

  /**
   * Submit OpenAI items via Batch API (JSONL upload).
   */
  async flushOpenAI(items: BatchItem[], companyId: string): Promise<BatchFlushResult> {
    try {
      const credentials = await getCredentials(companyId, 'openai')
      const apiKey = credentials.api_key || credentials.apiKey || Object.values(credentials)[0]
      if (!apiKey) throw new Error('No OpenAI API key found')

      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey })

      // Build JSONL content
      const jsonlLines = items.map(item => {
        const body: Record<string, unknown> = {
          model: item.request.model,
          messages: item.request.messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: item.request.maxTokens || 16384,
        }
        if (item.request.temperature !== undefined) {
          body.temperature = item.request.temperature
        }

        return JSON.stringify({
          custom_id: item.id,
          method: 'POST',
          url: '/v1/chat/completions',
          body,
        })
      })

      const jsonlContent = jsonlLines.join('\n')

      // Upload file
      const file = await client.files.create({
        file: new File([jsonlContent], 'batch.jsonl', { type: 'application/jsonl' }),
        purpose: 'batch' as any,
      })

      console.log(`[BatchCollector] OpenAI batch file uploaded: ${file.id}`)

      // Create batch
      const batch = await client.batches.create({
        input_file_id: file.id,
        endpoint: '/v1/chat/completions',
        completion_window: '24h',
      })
      const batchId = batch.id

      console.log(`[BatchCollector] OpenAI batch submitted: ${batchId} (${items.length} items)`)

      // Poll until done
      let currentBatch = batch
      const terminalStates = ['completed', 'failed', 'expired', 'cancelled']
      while (!terminalStates.includes(currentBatch.status)) {
        await sleep(BATCH_POLL_INTERVAL_MS)
        currentBatch = await client.batches.retrieve(batchId)
      }

      if (currentBatch.status !== 'completed') {
        throw new Error(`OpenAI batch failed: ${currentBatch.status}`)
      }

      // Download results
      if (currentBatch.output_file_id) {
        const outputFile = await client.files.content(currentBatch.output_file_id)
        const outputText = await outputFile.text()

        for (const line of outputText.trim().split('\n')) {
          if (!line.trim()) continue
          const result = JSON.parse(line)
          const item = items.find(i => i.id === result.custom_id)
          if (!item) continue

          if (result.error) {
            item.status = 'failed'
            item.error = JSON.stringify(result.error)
            item.completedAt = new Date().toISOString()
            continue
          }

          const respBody = result.response?.body ?? {}
          const choice = respBody.choices?.[0] ?? {}
          const usage = respBody.usage ?? {}
          const content = choice.message?.content ?? ''
          const inputTokens = usage.prompt_tokens ?? 0
          const outputTokens = usage.completion_tokens ?? 0

          item.result = {
            content,
            toolCalls: [],
            usage: { inputTokens, outputTokens },
            model: respBody.model ?? item.request.model,
            provider: 'openai',
            finishReason: 'stop',
          }
          item.status = 'completed'
          item.completedAt = new Date().toISOString()

          // Record cost with 50% batch discount
          recordCost({
            companyId,
            agentId: item.context.agentId,
            sessionId: item.context.sessionId,
            provider: 'openai',
            model: respBody.model ?? item.request.model,
            inputTokens,
            outputTokens,
            source: item.context.source,
            isBatch: true,
          }).catch(() => {})
        }
      }

      return { batchId, provider: 'openai', itemCount: items.length, status: 'submitted' }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[BatchCollector] OpenAI batch error: ${message}`)

      for (const item of items) {
        if (item.status === 'processing') {
          item.status = 'failed'
          item.error = message
          item.completedAt = new Date().toISOString()
        }
      }

      return { batchId: 'error', provider: 'openai', itemCount: items.length, status: 'failed', error: message }
    }
  }

  // === Helpers ===

  private getOrCreateQueue(companyId: string): BatchItem[] {
    let queue = this.queues.get(companyId)
    if (!queue) {
      queue = []
      this.queues.set(companyId, queue)
    }
    return queue
  }

  private estimateItemCostMicro(item: BatchItem): number {
    // Rough estimate: assume 1000 input + 500 output tokens per request
    const estimatedInput = 1000
    const estimatedOutput = 500
    return calculateCostMicro(item.request.model, estimatedInput, estimatedOutput)
  }

  /** Get queue size (for testing) */
  getQueueSize(companyId: string): number {
    return this.queues.get(companyId)?.length ?? 0
  }

  /** Clear all queues (for testing) */
  clearAll(): void {
    this.queues.clear()
  }
}

// === Utility ===

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Singleton instance
export const batchCollector = new BatchCollector()
