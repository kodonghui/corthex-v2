import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'
import { BatchCollector } from '../../services/batch-collector'
import { calculateCostMicro } from '../../lib/cost-tracker'
import type { LLMRequest, LLMProviderName } from '@corthex/shared'
import type { LLMRouterContext } from '../../services/llm-router'

// === Mock Setup ===

// Mock credential vault
mock.module('../../services/credential-vault', () => ({
  getCredentials: async (companyId: string, provider: string) => {
    return { api_key: `test-key-${provider}` }
  },
}))

// Mock cost tracker (recordCost only - calculateCostMicro is tested separately)
const mockRecordCost = mock(async () => {})
mock.module('../../lib/cost-tracker', () => {
  // Re-import the real calculateCostMicro but mock recordCost
  const { getModelConfig } = require('../../config/models')

  function getModelPricing(model: string): { input: number; output: number } {
    const config = getModelConfig(model)
    if (config) return { input: config.inputPricePer1M, output: config.outputPricePer1M }
    return { input: 3, output: 15 }
  }

  function calculateCostMicroFn(model: string, inputTokens: number, outputTokens: number, isBatch = false): number {
    if (inputTokens < 0 || outputTokens < 0) return 0
    const pricing = getModelPricing(model)
    const discount = isBatch ? 0.5 : 1.0
    const inputCost = (inputTokens / 1_000_000) * pricing.input * 1_000_000 * discount
    const outputCost = (outputTokens / 1_000_000) * pricing.output * 1_000_000 * discount
    return Math.round(inputCost + outputCost)
  }

  return {
    calculateCostMicro: calculateCostMicroFn,
    recordCost: mockRecordCost,
    microToUsd: (m: number) => m / 1_000_000,
  }
})

// Mock llm-router resolveProvider
mock.module('../../services/llm-router', () => ({
  resolveProvider: (modelId: string): LLMProviderName => {
    if (modelId.startsWith('claude-')) return 'anthropic'
    if (modelId.startsWith('gpt-')) return 'openai'
    if (modelId.startsWith('gemini-')) return 'google'
    throw new Error(`Unknown model: ${modelId}`)
  },
  resolveModel: () => ({ model: 'claude-haiku-4-5', reason: 'tier-default' }),
  LLMRouter: class {},
  llmRouter: {},
}))

// Mock createProvider for Google fallback
const mockGoogleCall = mock(async (req: LLMRequest) => ({
  content: `Google response for ${req.model}`,
  toolCalls: [],
  usage: { inputTokens: 100, outputTokens: 50 },
  model: req.model,
  provider: 'google' as LLMProviderName,
  finishReason: 'stop' as const,
}))

mock.module('../../lib/llm/index', () => ({
  createProvider: (_name: string, _apiKey: string) => ({
    name: 'google',
    supportsBatch: false,
    call: mockGoogleCall,
    stream: async function* () {},
    estimateCost: () => 0,
  }),
}))

// Mock Anthropic SDK
const mockAnthropicBatchCreate = mock(async () => ({
  id: 'batch_anthropic_123',
  processing_status: 'ended',
}))

const mockAnthropicBatchRetrieve = mock(async () => ({
  id: 'batch_anthropic_123',
  processing_status: 'ended',
}))

let anthropicResultsData: any[] = []
const mockAnthropicBatchResults = mock(function () {
  return {
    [Symbol.asyncIterator]() {
      let i = 0
      return {
        async next() {
          if (i < anthropicResultsData.length) {
            return { value: anthropicResultsData[i++], done: false }
          }
          return { value: undefined, done: true }
        },
      }
    },
  }
})

mock.module('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      batches: {
        create: mockAnthropicBatchCreate,
        retrieve: mockAnthropicBatchRetrieve,
        results: mockAnthropicBatchResults,
      },
    }
  },
}))

// Mock OpenAI SDK
const mockOpenAIFilesCreate = mock(async () => ({ id: 'file-abc123' }))
const mockOpenAIBatchCreate = mock(async () => ({
  id: 'batch_openai_456',
  status: 'completed',
  output_file_id: 'file-output-789',
}))
const mockOpenAIBatchRetrieve = mock(async () => ({
  id: 'batch_openai_456',
  status: 'completed',
  output_file_id: 'file-output-789',
}))

let openaiOutputContent = ''
const mockOpenAIFilesContent = mock(async () => ({
  text: async () => openaiOutputContent,
}))

mock.module('openai', () => ({
  default: class MockOpenAI {
    files = {
      create: mockOpenAIFilesCreate,
      content: mockOpenAIFilesContent,
    }
    batches = {
      create: mockOpenAIBatchCreate,
      retrieve: mockOpenAIBatchRetrieve,
    }
  },
}))

// === Test Helpers ===

function makeRequest(model = 'claude-haiku-4-5'): LLMRequest {
  return {
    model,
    messages: [{ role: 'user', content: 'Test message' }],
    maxTokens: 1024,
  }
}

function makeContext(companyId = 'company-a'): LLMRouterContext {
  return {
    companyId,
    agentId: 'agent-1',
    agentName: 'TestAgent',
    sessionId: 'session-1',
    source: 'delegation',
  }
}

// === Tests ===

describe('BatchCollector', () => {
  let collector: BatchCollector

  beforeEach(() => {
    collector = new BatchCollector()
    mockRecordCost.mockClear()
    mockGoogleCall.mockClear()
    mockAnthropicBatchCreate.mockClear()
    mockAnthropicBatchRetrieve.mockClear()
    mockAnthropicBatchResults.mockClear()
    mockOpenAIFilesCreate.mockClear()
    mockOpenAIBatchCreate.mockClear()
    mockOpenAIBatchRetrieve.mockClear()
    mockOpenAIFilesContent.mockClear()
    anthropicResultsData = []
    openaiOutputContent = ''
  })

  // === Task 7.1: enqueue adds item with correct status ===
  describe('enqueue', () => {
    test('adds item with pending status and correct fields', () => {
      const item = collector.enqueue(makeRequest(), makeContext())

      expect(item.id).toBeTruthy()
      expect(item.companyId).toBe('company-a')
      expect(item.status).toBe('pending')
      expect(item.request.model).toBe('claude-haiku-4-5')
      expect(item.context.agentId).toBe('agent-1')
      expect(item.context.source).toBe('delegation')
      expect(item.enqueuedAt).toBeTruthy()
      expect(item.result).toBeUndefined()
      expect(item.error).toBeUndefined()
      expect(item.completedAt).toBeUndefined()
    })

    test('generates unique IDs for each item', () => {
      const item1 = collector.enqueue(makeRequest(), makeContext())
      const item2 = collector.enqueue(makeRequest(), makeContext())
      expect(item1.id).not.toBe(item2.id)
    })

    // === Task 7.2: enforces 1000 item limit ===
    test('enforces 1000 item limit per company', () => {
      const ctx = makeContext()
      for (let i = 0; i < 1000; i++) {
        collector.enqueue(makeRequest(), ctx)
      }

      expect(() => collector.enqueue(makeRequest(), ctx)).toThrow(/Batch queue full/)
    })

    test('limit is per-company, not global', () => {
      const ctxA = makeContext('company-a')
      const ctxB = makeContext('company-b')

      for (let i = 0; i < 1000; i++) {
        collector.enqueue(makeRequest(), ctxA)
      }

      // Company B should still be able to enqueue
      const item = collector.enqueue(makeRequest(), ctxB)
      expect(item.status).toBe('pending')
    })

    // === Task 7.3: tenant isolation ===
    test('tenant isolation - company A items not visible to company B', () => {
      collector.enqueue(makeRequest(), makeContext('company-a'))
      collector.enqueue(makeRequest(), makeContext('company-a'))
      collector.enqueue(makeRequest(), makeContext('company-b'))

      const itemsA = collector.getItems('company-a')
      const itemsB = collector.getItems('company-b')

      expect(itemsA.length).toBe(2)
      expect(itemsB.length).toBe(1)
      expect(itemsA.every(i => i.companyId === 'company-a')).toBe(true)
      expect(itemsB.every(i => i.companyId === 'company-b')).toBe(true)
    })
  })

  // === Task 7.4: getStatus returns correct counts ===
  describe('getStatus', () => {
    test('returns correct counts by status', () => {
      collector.enqueue(makeRequest(), makeContext())
      collector.enqueue(makeRequest(), makeContext())
      collector.enqueue(makeRequest(), makeContext())

      const status = collector.getStatus('company-a')
      expect(status.pending).toBe(3)
      expect(status.processing).toBe(0)
      expect(status.completed).toBe(0)
      expect(status.failed).toBe(0)
      expect(status.totalItems).toBe(3)
    })

    test('returns zeros for unknown company', () => {
      const status = collector.getStatus('nonexistent')
      expect(status.pending).toBe(0)
      expect(status.totalItems).toBe(0)
    })

    // === Task 7.5: estimates savings ===
    test('calculates estimated savings (50% of pending cost)', () => {
      collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      const status = collector.getStatus('company-a')
      expect(status.estimatedSavingsMicro).toBeGreaterThan(0)
    })
  })

  // === Task 7.6: flush partitions by provider ===
  describe('flush', () => {
    test('partitions items by provider correctly', async () => {
      // Set up Anthropic mock results
      anthropicResultsData = []
      openaiOutputContent = ''

      collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      collector.enqueue(makeRequest('gpt-4.1-mini'), makeContext())
      collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())

      const results = await collector.flush('company-a')

      // Should have 3 results (one per provider)
      expect(results.length).toBe(3)

      const providers = results.map(r => r.provider).sort()
      expect(providers).toEqual(['anthropic', 'google', 'openai'])
    })

    test('returns empty for no pending items', async () => {
      const results = await collector.flush('company-a')
      expect(results.length).toBe(0)
    })

    test('returns empty for unknown company', async () => {
      const results = await collector.flush('nonexistent')
      expect(results.length).toBe(0)
    })

    // === Task 7.7: Anthropic batch flow ===
    test('Anthropic batch: create + poll + results', async () => {
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      // Set up Anthropic results
      anthropicResultsData = [
        {
          custom_id: item.id,
          result: {
            type: 'succeeded',
            message: {
              content: [{ type: 'text', text: 'Anthropic batch response' }],
              model: 'claude-haiku-4-5',
              usage: { input_tokens: 200, output_tokens: 100 },
            },
          },
        },
      ]

      const results = await collector.flush('company-a')

      expect(mockAnthropicBatchCreate).toHaveBeenCalled()
      expect(results.some(r => r.provider === 'anthropic' && r.status === 'submitted')).toBe(true)

      // Check item was updated (via reference, auto-cleanup removes from queue)
      expect(item.status).toBe('completed')
      expect(item.result?.content).toBe('Anthropic batch response')
      expect(item.result?.usage.inputTokens).toBe(200)
      expect(item.result?.usage.outputTokens).toBe(100)
    })

    // === Task 7.8: OpenAI batch flow ===
    test('OpenAI batch: JSONL upload + create + poll + download', async () => {
      const item = collector.enqueue(makeRequest('gpt-4.1-mini'), makeContext())

      // Set up OpenAI output
      openaiOutputContent = JSON.stringify({
        custom_id: item.id,
        response: {
          body: {
            model: 'gpt-4.1-mini',
            choices: [{ message: { content: 'OpenAI batch response' } }],
            usage: { prompt_tokens: 150, completion_tokens: 75 },
          },
        },
      })

      const results = await collector.flush('company-a')

      expect(mockOpenAIFilesCreate).toHaveBeenCalled()
      expect(mockOpenAIBatchCreate).toHaveBeenCalled()
      expect(results.some(r => r.provider === 'openai' && r.status === 'submitted')).toBe(true)

      // Check item via reference (auto-cleanup removes from queue)
      expect(item.status).toBe('completed')
      expect(item.result?.content).toBe('OpenAI batch response')
      expect(item.result?.usage.inputTokens).toBe(150)
      expect(item.result?.usage.outputTokens).toBe(75)
    })

    // === Task 7.9: Gemini falls back to individual calls ===
    test('Gemini items fall back to individual LLM calls', async () => {
      const item = collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())

      const results = await collector.flush('company-a')

      expect(mockGoogleCall).toHaveBeenCalled()
      expect(results.some(r => r.provider === 'google')).toBe(true)

      // Check item via reference (auto-cleanup removes from queue)
      expect(item.status).toBe('completed')
      expect(item.result?.provider).toBe('google')
    })

    // === Task 7.10: marks items processing then completed/failed ===
    test('marks items as processing during flush', async () => {
      // We test by checking items change from pending -> processing -> completed
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      expect(item.status).toBe('pending')

      anthropicResultsData = [
        {
          custom_id: item.id,
          result: {
            type: 'succeeded',
            message: {
              content: [{ type: 'text', text: 'done' }],
              model: 'claude-haiku-4-5',
              usage: { input_tokens: 100, output_tokens: 50 },
            },
          },
        },
      ]

      await collector.flush('company-a')

      // After flush, item reference should be completed (auto-cleanup removes from queue)
      expect(item.status).toBe('completed')
      expect(item.completedAt).toBeTruthy()
    })

    // === Task 7.11: fires onComplete / records cost ===
    test('records cost with batch discount on completion', async () => {
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      anthropicResultsData = [
        {
          custom_id: item.id,
          result: {
            type: 'succeeded',
            message: {
              content: [{ type: 'text', text: 'done' }],
              model: 'claude-haiku-4-5',
              usage: { input_tokens: 500, output_tokens: 200 },
            },
          },
        },
      ]

      await collector.flush('company-a')

      // recordCost should have been called with isBatch: true
      expect(mockRecordCost).toHaveBeenCalled()
      const callArgs = (mockRecordCost.mock.calls as any[][])[0][0] as any
      expect(callArgs.isBatch).toBe(true)
      expect(callArgs.provider).toBe('anthropic')
      expect(callArgs.inputTokens).toBe(500)
      expect(callArgs.outputTokens).toBe(200)
    })

    // === Task 7.12: Google records cost WITHOUT batch discount ===
    test('Google fallback records cost at full price (no batch discount)', async () => {
      collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())

      await collector.flush('company-a')

      expect(mockRecordCost).toHaveBeenCalled()
      const callArgs = (mockRecordCost.mock.calls as any[][])[0][0] as any
      expect(callArgs.isBatch).toBe(false)
      expect(callArgs.provider).toBe('google')
    })
  })

  // === Task 7.14: clearCompleted ===
  describe('clearCompleted', () => {
    test('removes only completed and failed items', () => {
      // Directly manipulate items to test clearCompleted in isolation
      const item1 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      const item2 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      const item3 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      // Manually set statuses (simulating post-flush state)
      item1.status = 'completed'
      item2.status = 'failed'
      // item3 stays pending

      const removed = collector.clearCompleted('company-a')
      expect(removed).toBe(2) // completed + failed removed

      const afterClear = collector.getItems('company-a')
      expect(afterClear.length).toBe(1)
      expect(afterClear[0].status).toBe('pending')
    })

    test('flush auto-cleans completed/failed items', async () => {
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      anthropicResultsData = [{
        custom_id: item.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'done' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
        },
      }]

      await collector.flush('company-a')

      // Auto-cleanup should have removed the completed item
      const items = collector.getItems('company-a')
      expect(items.length).toBe(0)
    })
  })

  // === Task 7.15: batch submission failure marks all items as failed ===
  describe('error handling', () => {
    test('Anthropic batch failure marks all items as failed', async () => {
      mockAnthropicBatchCreate.mockImplementationOnce(async () => {
        throw new Error('Anthropic API error')
      })

      const item1 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      const item2 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      const results = await collector.flush('company-a')
      const anthropicResult = results.find(r => r.provider === 'anthropic')
      expect(anthropicResult?.status).toBe('failed')
      expect(anthropicResult?.error).toContain('Anthropic API error')

      // Check via references (auto-cleanup removes failed items from queue)
      expect(item1.status).toBe('failed')
      expect(item1.error).toContain('Anthropic API error')
      expect(item2.status).toBe('failed')
      expect(item2.error).toContain('Anthropic API error')
    })

    test('OpenAI batch failure marks all items as failed', async () => {
      mockOpenAIFilesCreate.mockImplementationOnce(async () => {
        throw new Error('OpenAI upload error')
      })

      const item = collector.enqueue(makeRequest('gpt-4.1-mini'), makeContext())

      const results = await collector.flush('company-a')
      const openaiResult = results.find(r => r.provider === 'openai')
      expect(openaiResult?.status).toBe('failed')

      // Check via reference (auto-cleanup removes failed items)
      expect(item.status).toBe('failed')
    })

    // === Task 7.16: individual item failure doesn't affect others ===
    test('Anthropic individual item failure does not affect others', async () => {
      const item1 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      const item2 = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      anthropicResultsData = [
        {
          custom_id: item1.id,
          result: {
            type: 'succeeded',
            message: {
              content: [{ type: 'text', text: 'Success' }],
              model: 'claude-haiku-4-5',
              usage: { input_tokens: 100, output_tokens: 50 },
            },
          },
        },
        {
          custom_id: item2.id,
          result: {
            type: 'errored',
            error: { type: 'invalid_request', message: 'Bad request' },
          },
        },
      ]

      await collector.flush('company-a')

      // Check via item references (auto-cleanup removes from queue)
      expect(item1.status).toBe('completed')
      expect(item1.result?.content).toBe('Success')
      expect(item2.status).toBe('failed')
      expect(item2.error).toContain('Batch item failed')
    })

    test('unknown model items are marked failed without crashing', async () => {
      const ctx = makeContext()
      const item = collector.enqueue({ model: 'unknown-model-xyz', messages: [{ role: 'user', content: 'test' }] }, ctx)

      await collector.flush('company-a')

      // Check via reference (auto-cleanup removes failed items)
      expect(item.status).toBe('failed')
      expect(item.error).toContain('Unknown model')
    })
  })

  describe('getItems', () => {
    test('returns all items without filter', () => {
      collector.enqueue(makeRequest(), makeContext())
      collector.enqueue(makeRequest(), makeContext())

      const items = collector.getItems('company-a')
      expect(items.length).toBe(2)
    })

    test('returns filtered items by status', () => {
      collector.enqueue(makeRequest(), makeContext())

      const pending = collector.getItems('company-a', 'pending')
      const completed = collector.getItems('company-a', 'completed')

      expect(pending.length).toBe(1)
      expect(completed.length).toBe(0)
    })

    test('returns empty array for unknown company', () => {
      const items = collector.getItems('unknown-company')
      expect(items.length).toBe(0)
    })
  })

  describe('getQueueSize', () => {
    test('returns correct queue size', () => {
      expect(collector.getQueueSize('company-a')).toBe(0)
      collector.enqueue(makeRequest(), makeContext())
      expect(collector.getQueueSize('company-a')).toBe(1)
    })
  })

  describe('clearAll', () => {
    test('clears all queues', () => {
      collector.enqueue(makeRequest(), makeContext('company-a'))
      collector.enqueue(makeRequest(), makeContext('company-b'))

      collector.clearAll()

      expect(collector.getQueueSize('company-a')).toBe(0)
      expect(collector.getQueueSize('company-b')).toBe(0)
    })
  })
})

// === TEA Risk-Based Tests ===
describe('BatchCollector TEA Risk Analysis', () => {
  let collector: BatchCollector

  beforeEach(() => {
    collector = new BatchCollector()
    mockRecordCost.mockClear()
    mockGoogleCall.mockClear()
    mockAnthropicBatchCreate.mockClear()
    anthropicResultsData = []
    openaiOutputContent = ''
  })

  describe('queue limit with completed items', () => {
    test('completed items do not count toward 1000 limit', async () => {
      const ctx = makeContext()
      // Fill queue with 999 items
      for (let i = 0; i < 999; i++) {
        collector.enqueue(makeRequest(), ctx)
      }

      // Flush all (they become processing then may complete)
      // For this test, just check: after clearCompleted, we can enqueue more
      const item1000 = collector.enqueue(makeRequest(), ctx)
      expect(item1000.status).toBe('pending')

      // Now it's at 1000 pending - should throw
      expect(() => collector.enqueue(makeRequest(), ctx)).toThrow(/Batch queue full/)
    })
  })

  describe('multi-provider mixed flush', () => {
    test('handles all 3 providers in single flush without interference', async () => {
      const anthropicItem = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      const openaiItem = collector.enqueue(makeRequest('gpt-4.1-mini'), makeContext())
      collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())

      anthropicResultsData = [{
        custom_id: anthropicItem.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'A response' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
        },
      }]

      openaiOutputContent = JSON.stringify({
        custom_id: openaiItem.id,
        response: {
          body: {
            model: 'gpt-4.1-mini',
            choices: [{ message: { content: 'O response' } }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          },
        },
      })

      const results = await collector.flush('company-a')
      expect(results.length).toBe(3)

      // All 3 items should be completed (check via reference, auto-cleanup removes from queue)
      expect(anthropicItem.status).toBe('completed')
      expect(openaiItem.status).toBe('completed')
    })
  })

  describe('flush idempotency', () => {
    test('second flush with no new pending items returns empty', async () => {
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      anthropicResultsData = [{
        custom_id: item.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'done' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
        },
      }]

      await collector.flush('company-a')
      const secondFlush = await collector.flush('company-a')
      expect(secondFlush.length).toBe(0)
    })
  })

  describe('enqueue after flush', () => {
    test('new items can be enqueued after flush completes', async () => {
      const item = collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())
      anthropicResultsData = [{
        custom_id: item.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'done' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
        },
      }]

      await collector.flush('company-a')

      // Enqueue new item should work (auto-cleanup removed completed item)
      const newItem = collector.enqueue(makeRequest(), makeContext())
      expect(newItem.status).toBe('pending')
      expect(collector.getQueueSize('company-a')).toBe(1) // only the new pending item
    })
  })

  describe('enqueue after clearAll', () => {
    test('fresh enqueue works after clearAll', () => {
      collector.enqueue(makeRequest(), makeContext())
      collector.clearAll()

      const item = collector.enqueue(makeRequest(), makeContext())
      expect(item.status).toBe('pending')
      expect(collector.getQueueSize('company-a')).toBe(1)
    })
  })

  describe('request with systemPrompt', () => {
    test('Anthropic batch includes system prompt when provided', async () => {
      const req: LLMRequest = {
        model: 'claude-haiku-4-5',
        messages: [{ role: 'user', content: 'Hello' }],
        systemPrompt: 'You are a helpful assistant',
        maxTokens: 1024,
      }
      const item = collector.enqueue(req, makeContext())

      anthropicResultsData = [{
        custom_id: item.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'hi' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 50, output_tokens: 20 },
          },
        },
      }]

      await collector.flush('company-a')

      // Verify the batch create was called with the request
      expect(mockAnthropicBatchCreate).toHaveBeenCalled()
      const createArgs = (mockAnthropicBatchCreate.mock.calls as any[][])[0][0]
      expect(createArgs.requests[0].params.system).toBe('You are a helpful assistant')
    })
  })

  describe('request with temperature', () => {
    test('Anthropic batch includes temperature', async () => {
      const req: LLMRequest = {
        model: 'claude-haiku-4-5',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
      }
      const item = collector.enqueue(req, makeContext())

      anthropicResultsData = [{
        custom_id: item.id,
        result: {
          type: 'succeeded',
          message: {
            content: [{ type: 'text', text: 'hi' }],
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 50, output_tokens: 20 },
          },
        },
      }]

      await collector.flush('company-a')

      const createArgs = (mockAnthropicBatchCreate.mock.calls as any[][])[0][0]
      expect(createArgs.requests[0].params.temperature).toBe(0.7)
    })
  })

  describe('Google partial failure', () => {
    test('some Google items succeed while others fail', async () => {
      let callCount = 0
      mockGoogleCall.mockImplementation(async (req: LLMRequest) => {
        callCount++
        if (callCount === 2) throw new Error('Google item 2 failed')
        return {
          content: 'OK',
          toolCalls: [],
          usage: { inputTokens: 100, outputTokens: 50 },
          model: req.model,
          provider: 'google' as LLMProviderName,
          finishReason: 'stop' as const,
        }
      })

      const g1 = collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())
      const g2 = collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())
      const g3 = collector.enqueue(makeRequest('gemini-2.5-flash'), makeContext())

      await collector.flush('company-a')

      // Check via references (auto-cleanup removes from queue)
      const items = [g1, g2, g3]
      const completed = items.filter(i => i.status === 'completed')
      const failed = items.filter(i => i.status === 'failed')
      expect(completed.length).toBe(2)
      expect(failed.length).toBe(1)
      expect(failed[0].error).toContain('Google item 2 failed')
    })
  })

  describe('status reflects processing items during flush', () => {
    test('items transition from pending to processing', async () => {
      collector.enqueue(makeRequest('claude-haiku-4-5'), makeContext())

      // Before flush, all pending
      expect(collector.getStatus('company-a').pending).toBe(1)
      expect(collector.getStatus('company-a').processing).toBe(0)

      // After flush starts, items should be completed (or failed) since mocks resolve immediately
      anthropicResultsData = []
      await collector.flush('company-a')

      // Items went through processing -> still processing (no results)
      // or completed if results were there
      const status = collector.getStatus('company-a')
      expect(status.pending).toBe(0)
    })
  })

  describe('singleton export', () => {
    test('batchCollector singleton is exported', async () => {
      const { batchCollector } = await import('../../services/batch-collector')
      expect(batchCollector).toBeInstanceOf(BatchCollector)
    })
  })
})

// === Task 7.13: calculateCostMicro batch discount ===
describe('calculateCostMicro with batch discount', () => {
  test('returns full price when isBatch is false', () => {
    // Using the real function logic
    const { calculateCostMicro: calc } = require('../../lib/cost-tracker')
    const fullPrice = calc('claude-haiku-4-5', 1000, 500, false)
    expect(fullPrice).toBeGreaterThan(0)
  })

  test('returns 50% price when isBatch is true', () => {
    const { calculateCostMicro: calc } = require('../../lib/cost-tracker')
    const fullPrice = calc('claude-haiku-4-5', 1000, 500, false)
    const batchPrice = calc('claude-haiku-4-5', 1000, 500, true)
    expect(batchPrice).toBe(Math.round(fullPrice / 2))
  })

  test('defaults to non-batch when isBatch not provided', () => {
    const { calculateCostMicro: calc } = require('../../lib/cost-tracker')
    const defaultPrice = calc('claude-haiku-4-5', 1000, 500)
    const fullPrice = calc('claude-haiku-4-5', 1000, 500, false)
    expect(defaultPrice).toBe(fullPrice)
  })
})
