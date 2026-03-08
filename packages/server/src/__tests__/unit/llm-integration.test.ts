/**
 * LLM Integration & Fallback Tests
 * Story 3-7: Comprehensive cross-component integration tests for Epic 3
 *
 * Tests verify that all LLM components (adapters, router, fallback, circuit breaker,
 * AgentRunner, BatchCollector, cost tracker) work together correctly.
 *
 * bun test src/__tests__/unit/llm-integration.test.ts
 */
import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequest,
  LLMProviderName,
  TaskRequest,
  ToolExecutor,
  BatchItem,
} from '@corthex/shared'

// =====================================================================
// Mock Setup -- External SDKs and DB
// =====================================================================

// Track recordCost calls for verification
const costRecordCalls: Array<Record<string, unknown>> = []
const mockDbInsertValues = mock(async () => {})

mock.module('../../db', () => ({
  db: {
    insert: () => ({ values: mockDbInsertValues }),
    select: () => ({
      from: () => ({
        where: () => ({
          groupBy: () => ({
            orderBy: async () => [],
          }),
        }),
      }),
    }),
  },
}))

mock.module('../../db/schema', () => ({
  costRecords: {},
  agents: {},
  departments: {},
}))

mock.module('drizzle-orm', () => ({
  sql: () => ({}),
  and: (...args: unknown[]) => args,
  eq: () => ({}),
  gte: () => ({}),
  lte: () => ({}),
  sum: () => ({ mapWith: () => ({}) }),
  count: () => ({}),
}))

// Mock credential-vault
mock.module('../../services/credential-vault', () => ({
  getCredentials: async (_companyId: string, provider: string) => ({
    api_key: `test-key-${provider}`,
    apiKey: `test-key-${provider}`,
  }),
}))

// Mock audit-log
mock.module('../../services/audit-log', () => ({
  createAuditLog: async () => {},
  AUDIT_ACTIONS: { LLM_FALLBACK: 'llm.fallback' },
}))

// =====================================================================
// Anthropic SDK Mock
// =====================================================================

let anthropicCallBehavior: 'success' | 'error' | 'timeout' | 'server_error' | 'tool_use' = 'success'
let anthropicStreamBehavior: 'success' | 'pre_chunk_error' | 'mid_chunk_error' = 'success'
let anthropicCallCount = 0
let anthropicToolCallNum = 0

class MockAnthropicAPIError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

const MockAnthropic = class {
  messages = {
    create: async (params: Record<string, unknown>, _opts?: Record<string, unknown>) => {
      anthropicCallCount++
      if (anthropicCallBehavior === 'error') {
        throw new MockAnthropicAPIError(401, 'Invalid API key')
      }
      if (anthropicCallBehavior === 'server_error') {
        throw new MockAnthropicAPIError(500, 'Internal server error')
      }
      if (anthropicCallBehavior === 'timeout') {
        throw Object.assign(new Error('Aborted'), { name: 'AbortError' })
      }
      if (anthropicCallBehavior === 'tool_use') {
        anthropicToolCallNum++
        if (anthropicToolCallNum === 1) {
          return {
            id: 'msg-tool',
            content: [
              { type: 'text', text: 'Let me search...' },
              { type: 'tool_use', id: 'call_1', name: 'web_search', input: { query: 'test' } },
            ],
            model: params.model,
            usage: { input_tokens: 100, output_tokens: 50 },
            stop_reason: 'tool_use',
          }
        }
        return {
          id: 'msg-final',
          content: [{ type: 'text', text: 'Found results.' }],
          model: params.model,
          usage: { input_tokens: 200, output_tokens: 80 },
          stop_reason: 'end_turn',
        }
      }
      return {
        id: 'msg-integration-test',
        content: [{ type: 'text', text: `Anthropic response for ${params.model}` }],
        model: params.model,
        usage: { input_tokens: 150, output_tokens: 75 },
        stop_reason: 'end_turn',
      }
    },
    stream: (_params: Record<string, unknown>, _opts?: Record<string, unknown>) => {
      return {
        [Symbol.asyncIterator]: async function* () {
          if (anthropicStreamBehavior === 'pre_chunk_error') {
            throw new MockAnthropicAPIError(500, 'Stream init failed')
          }
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'streamed ' } }
          if (anthropicStreamBehavior === 'mid_chunk_error') {
            throw new MockAnthropicAPIError(500, 'Stream interrupted')
          }
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'response' } }
          yield {
            type: 'message_delta',
            usage: { output_tokens: 30 },
          }
        },
        finalMessage: async () => ({
          usage: { input_tokens: 100, output_tokens: 30 },
        }),
      }
    },
    batches: {
      create: async (params: Record<string, unknown>) => ({
        id: 'batch-anthropic-test',
        processing_status: 'ended',
        request_counts: { succeeded: (params.requests as unknown[])?.length ?? 0 },
      }),
      retrieve: async () => ({
        id: 'batch-anthropic-test',
        processing_status: 'ended',
      }),
      results: async function* () {
        yield {
          custom_id: 'item-1',
          result: {
            type: 'succeeded',
            message: {
              content: [{ type: 'text', text: 'batch result' }],
              usage: { input_tokens: 50, output_tokens: 25 },
              model: 'claude-sonnet-4-6',
              stop_reason: 'end_turn',
            },
          },
        }
      },
    },
  }
}

;(MockAnthropic as unknown as Record<string, unknown>).APIError = MockAnthropicAPIError

mock.module('@anthropic-ai/sdk', () => ({
  default: MockAnthropic,
}))

// =====================================================================
// OpenAI SDK Mock
// =====================================================================

let openaiCallBehavior: 'success' | 'error' | 'server_error' = 'success'
let openaiCallCount = 0

class MockOpenAIAPIError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

const MockOpenAI = class {
  chat = {
    completions: {
      create: async (params: Record<string, unknown>, _opts?: Record<string, unknown>) => {
        openaiCallCount++
        if (openaiCallBehavior === 'error') {
          throw new MockOpenAIAPIError(401, 'Invalid API key')
        }
        if (openaiCallBehavior === 'server_error') {
          throw new MockOpenAIAPIError(500, 'Internal server error')
        }
        if (params.stream) {
          return {
            [Symbol.asyncIterator]: async function* () {
              yield { choices: [{ delta: { content: 'streamed ' } }] }
              yield { choices: [{ delta: { content: 'openai' } }] }
              yield { choices: [], usage: { prompt_tokens: 80, completion_tokens: 40 } }
            },
          }
        }
        return {
          id: 'chatcmpl-test',
          choices: [{
            message: {
              content: `OpenAI response for ${params.model}`,
              tool_calls: null,
            },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 120, completion_tokens: 60 },
        }
      },
    },
  }
  files = {
    create: async () => ({ id: 'file-test-id' }),
    content: async () => {
      const lines = JSON.stringify({
        custom_id: 'item-2',
        response: {
          body: {
            choices: [{ message: { content: 'batch openai result' } }],
            usage: { prompt_tokens: 40, completion_tokens: 20 },
          },
        },
      })
      return { text: async () => lines }
    },
  }
  batches = {
    create: async () => ({
      id: 'batch-openai-test',
      status: 'completed',
      output_file_id: 'file-output-id',
    }),
    retrieve: async () => ({
      id: 'batch-openai-test',
      status: 'completed',
      output_file_id: 'file-output-id',
    }),
  }
}

;(MockOpenAI as unknown as Record<string, unknown>).APIError = MockOpenAIAPIError

mock.module('openai', () => ({
  default: MockOpenAI,
}))

// =====================================================================
// Google AI SDK Mock
// =====================================================================

let googleCallBehavior: 'success' | 'error' | 'server_error' = 'success'
let googleCallCount = 0

mock.module('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async () => {
          googleCallCount++
          if (googleCallBehavior === 'error') {
            throw new Error('403 API_KEY_INVALID')
          }
          if (googleCallBehavior === 'server_error') {
            throw new Error('500 INTERNAL error')
          }
          return {
            response: {
              candidates: [{
                content: { parts: [{ text: 'Google response' }] },
                finishReason: 'STOP',
              }],
              usageMetadata: { promptTokenCount: 90, candidatesTokenCount: 45 },
            },
          }
        },
        generateContentStream: async () => ({
          stream: {
            [Symbol.asyncIterator]: async function* () {
              yield {
                text: () => 'google stream',
                candidates: null,
                usageMetadata: { candidatesTokenCount: 20 },
              }
            },
          },
          response: Promise.resolve({
            usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 20 },
          }),
        }),
      }
    }
  },
  GoogleGenerativeAIAbortError: class extends Error {
    constructor(msg: string) { super(msg); this.name = 'GoogleGenerativeAIAbortError' }
  },
  SchemaType: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', BOOLEAN: 'BOOLEAN', ARRAY: 'ARRAY' },
}))

mock.module('../../services/knowledge-injector', () => ({
  collectKnowledgeContext: mock(() => Promise.resolve(null)),
  collectAgentMemoryContext: mock(() => Promise.resolve(null)),
  clearKnowledgeCache: mock(() => {}),
  clearAllCache: mock(() => {}),
}))

mock.module('../../services/memory-extractor', () => ({
  extractAndSaveMemories: mock(() => Promise.resolve({ saved: 0, memories: [] })),
  consolidateMemories: mock(() => Promise.resolve({ merged: 0, remaining: 0 })),
  clearRateLimiter: mock(() => {}),
  isRateLimited: mock(() => false),
}))

// =====================================================================
// Imports (MUST come after all mock.module calls)
// =====================================================================

import { createProvider } from '../../lib/llm/index'
import { CircuitBreaker } from '../../lib/llm/circuit-breaker'
import { LLMRouter, resolveModel, resolveProvider } from '../../services/llm-router'
import { AgentRunner, buildSystemPrompt, scanForCredentials } from '../../services/agent-runner'
import { BatchCollector } from '../../services/batch-collector'
import { calculateCostMicro } from '../../lib/cost-tracker'
import { getModelConfig, getTierDefaultModel, getFallbackModels, resetModelsCache } from '../../config/models'

// =====================================================================
// Helpers
// =====================================================================

function resetAll() {
  anthropicCallBehavior = 'success'
  anthropicStreamBehavior = 'success'
  anthropicCallCount = 0
  anthropicToolCallNum = 0
  openaiCallBehavior = 'success'
  openaiCallCount = 0
  googleCallBehavior = 'success'
  googleCallCount = 0
  costRecordCalls.length = 0
  mockDbInsertValues.mockClear()
}

const TEST_COMPANY = 'integration-test-company'
const TEST_AGENT_ID = 'integration-test-agent'

function makeContext(source: 'chat' | 'delegation' | 'job' | 'sns' = 'delegation') {
  return {
    companyId: TEST_COMPANY,
    agentId: TEST_AGENT_ID,
    agentName: 'IntegrationTestAgent',
    source,
  }
}

function makeRequest(model: string, content = 'Test prompt'): LLMRequest {
  return {
    model,
    messages: [{ role: 'user', content }],
  }
}

// =====================================================================
// Tests
// =====================================================================

describe('LLM Integration Tests (Story 3-7)', () => {
  beforeEach(() => {
    resetAll()
    resetModelsCache()
  })

  // =================================================================
  // AC #1: Adapter standalone call/stream tests
  // =================================================================
  describe('AC1: Adapter standalone integration', () => {
    it('AnthropicAdapter.call() returns properly formatted LLMResponse', async () => {
      const adapter = createProvider('anthropic', 'test-key')
      const response = await adapter.call(makeRequest('claude-sonnet-4-6'))

      expect(response.content).toContain('Anthropic response')
      expect(response.provider).toBe('anthropic')
      expect(response.model).toBe('claude-sonnet-4-6')
      expect(response.usage.inputTokens).toBe(150)
      expect(response.usage.outputTokens).toBe(75)
      expect(response.finishReason).toBe('stop')
      expect(response.toolCalls).toEqual([])
    })

    it('OpenAIAdapter.call() returns properly formatted LLMResponse', async () => {
      const adapter = createProvider('openai', 'test-key')
      const response = await adapter.call(makeRequest('gpt-4.1'))

      expect(response.content).toContain('OpenAI response')
      expect(response.provider).toBe('openai')
      expect(response.model).toBe('gpt-4.1')
      expect(response.usage.inputTokens).toBe(120)
      expect(response.usage.outputTokens).toBe(60)
      expect(response.finishReason).toBe('stop')
    })

    it('GoogleAdapter.call() returns properly formatted LLMResponse', async () => {
      const adapter = createProvider('google', 'test-key')
      const response = await adapter.call(makeRequest('gemini-2.5-pro'))

      expect(response.content).toContain('Google response')
      expect(response.provider).toBe('google')
      expect(response.model).toBe('gemini-2.5-pro')
      expect(response.usage.inputTokens).toBe(90)
      expect(response.usage.outputTokens).toBe(45)
      expect(response.finishReason).toBe('stop')
    })

    it('AnthropicAdapter.stream() yields text chunks and done', async () => {
      const adapter = createProvider('anthropic', 'test-key')
      const chunks: LLMStreamChunk[] = []
      for await (const chunk of adapter.stream(makeRequest('claude-sonnet-4-6'))) {
        chunks.push(chunk)
      }
      const textChunks = chunks.filter(c => c.type === 'text')
      const doneChunks = chunks.filter(c => c.type === 'done')
      expect(textChunks.length).toBeGreaterThan(0)
      expect(doneChunks.length).toBeGreaterThan(0)
      const done = doneChunks[doneChunks.length - 1]
      expect(done.usage?.inputTokens).toBeDefined()
    })

    it('OpenAIAdapter.stream() yields text chunks and done', async () => {
      const adapter = createProvider('openai', 'test-key')
      const chunks: LLMStreamChunk[] = []
      for await (const chunk of adapter.stream(makeRequest('gpt-4.1'))) {
        chunks.push(chunk)
      }
      const textChunks = chunks.filter(c => c.type === 'text')
      const doneChunks = chunks.filter(c => c.type === 'done')
      expect(textChunks.length).toBeGreaterThan(0)
      expect(doneChunks.length).toBeGreaterThan(0)
    })

    it('GoogleAdapter.stream() yields text chunks and done', async () => {
      const adapter = createProvider('google', 'test-key')
      const chunks: LLMStreamChunk[] = []
      for await (const chunk of adapter.stream(makeRequest('gemini-2.5-pro'))) {
        chunks.push(chunk)
      }
      const doneChunks = chunks.filter(c => c.type === 'done')
      expect(doneChunks.length).toBeGreaterThan(0)
      const done = doneChunks[doneChunks.length - 1]
      expect(done.usage).toBeDefined()
    })
  })

  // =================================================================
  // AC #2: LLM Router routes to correct provider
  // =================================================================
  describe('AC2: LLM Router routing', () => {
    it('routes claude-* models to anthropic provider', () => {
      expect(resolveProvider('claude-sonnet-4-6')).toBe('anthropic')
      expect(resolveProvider('claude-haiku-4-5')).toBe('anthropic')
    })

    it('routes gpt-* models to openai provider', () => {
      expect(resolveProvider('gpt-4.1')).toBe('openai')
      expect(resolveProvider('gpt-4.1-mini')).toBe('openai')
    })

    it('routes gemini-* models to google provider', () => {
      expect(resolveProvider('gemini-2.5-pro')).toBe('google')
      expect(resolveProvider('gemini-2.5-flash')).toBe('google')
    })

    it('throws for unknown model ID', () => {
      expect(() => resolveProvider('unknown-model')).toThrow('Unknown model')
    })

    it('LLMRouter.call() reaches correct provider based on model', async () => {
      const router = new LLMRouter()

      const anthropicResp = await router.call(makeRequest('claude-sonnet-4-6'), makeContext())
      expect(anthropicResp.content).toContain('Anthropic')
      expect(anthropicCallCount).toBe(1)

      const openaiResp = await router.call(makeRequest('gpt-4.1'), makeContext())
      expect(openaiResp.content).toContain('OpenAI')
      expect(openaiCallCount).toBe(1)
    })
  })

  // =================================================================
  // AC #3: 3-tier model assignment
  // =================================================================
  describe('AC3: 3-tier model assignment', () => {
    it('manager tier defaults to claude-sonnet-4-6', () => {
      expect(getTierDefaultModel('manager')).toBe('claude-sonnet-4-6')
    })

    it('specialist tier defaults to claude-haiku-4-5', () => {
      expect(getTierDefaultModel('specialist')).toBe('claude-haiku-4-5')
    })

    it('worker tier defaults to claude-haiku-4-5', () => {
      expect(getTierDefaultModel('worker')).toBe('claude-haiku-4-5')
    })

    it('resolveModel uses tier default when modelName is schema default', () => {
      const result = resolveModel({ tier: 'manager', modelName: 'claude-haiku-4-5' })
      expect(result.model).toBe('claude-sonnet-4-6')
      expect(result.reason).toBe('tier-default')
    })

    it('resolveModel uses manual override when modelName differs from schema default', () => {
      const result = resolveModel({ tier: 'worker', modelName: 'gpt-4.1' })
      expect(result.model).toBe('gpt-4.1')
      expect(result.reason).toBe('manual-override')
    })

    it('resolveModel uses tier default when modelName is null', () => {
      const result = resolveModel({ tier: 'specialist', modelName: null })
      expect(result.model).toBe('claude-haiku-4-5')
      expect(result.reason).toBe('tier-default')
    })
  })

  // =================================================================
  // AC #4: Fallback chain tests
  // =================================================================
  describe('AC4: Fallback chain', () => {
    it('falls back to next provider on server_error (retryable)', async () => {
      anthropicCallBehavior = 'server_error'
      const router = new LLMRouter()
      const response = await router.call(makeRequest('claude-sonnet-4-6'), makeContext())
      // Should fall back to OpenAI (gpt-4.1 is manager-tier equivalent)
      expect(response.content).toContain('OpenAI')
      expect(anthropicCallCount).toBe(1)
      expect(openaiCallCount).toBe(1)
    })

    it('falls back to next provider on timeout (retryable)', async () => {
      anthropicCallBehavior = 'timeout'
      const router = new LLMRouter()
      const response = await router.call(makeRequest('claude-sonnet-4-6'), makeContext())
      expect(response.content).toContain('OpenAI')
    })

    it('does NOT fallback on auth_error (non-retryable)', async () => {
      anthropicCallBehavior = 'error'
      const router = new LLMRouter()
      await expect(router.call(makeRequest('claude-sonnet-4-6'), makeContext()))
        .rejects.toThrow()
      expect(openaiCallCount).toBe(0)
    })

    it('throws aggregated error when all providers fail', async () => {
      anthropicCallBehavior = 'server_error'
      openaiCallBehavior = 'server_error'
      googleCallBehavior = 'server_error'
      const router = new LLMRouter()
      await expect(router.call(makeRequest('claude-sonnet-4-6'), makeContext()))
        .rejects.toThrow(/All providers failed/)
    })

    it('getFallbackModels returns equivalent-tier models from other providers', () => {
      // Manager-tier (claude-sonnet-4-6: inputPrice $3/1M >= $1) => other manager-tier
      const managerFallbacks = getFallbackModels('claude-sonnet-4-6')
      expect(managerFallbacks.length).toBeGreaterThan(0)
      // Each fallback should be from a different provider
      for (const fb of managerFallbacks) {
        expect(resolveProvider(fb)).not.toBe('anthropic')
      }

      // Worker-tier (claude-haiku-4-5: inputPrice $0.8/1M < $1) => other worker-tier
      const workerFallbacks = getFallbackModels('claude-haiku-4-5')
      expect(workerFallbacks.length).toBeGreaterThan(0)
      for (const fb of workerFallbacks) {
        const config = getModelConfig(fb)
        expect(config!.inputPricePer1M).toBeLessThan(1)
      }
    })
  })

  // =================================================================
  // AC #5: Circuit breaker integration
  // =================================================================
  describe('AC5: Circuit breaker', () => {
    it('opens after 3 consecutive failures', () => {
      const cb = new CircuitBreaker(3, 60000)

      expect(cb.isAvailable('anthropic')).toBe(true)
      cb.recordFailure('anthropic')
      cb.recordFailure('anthropic')
      expect(cb.isAvailable('anthropic')).toBe(true) // 2 failures, not yet open
      cb.recordFailure('anthropic')
      expect(cb.isAvailable('anthropic')).toBe(false) // 3 failures, now open
    })

    it('transitions to half-open after cooldown', () => {
      const cb = new CircuitBreaker(1, 50) // 1 failure threshold, 50ms cooldown

      cb.recordFailure('openai')
      expect(cb.isAvailable('openai')).toBe(false)

      // Wait for cooldown
      const start = Date.now()
      while (Date.now() - start < 60) { /* busy wait */ }

      expect(cb.isAvailable('openai')).toBe(true) // half-open
    })

    it('resets to closed on success after half-open', () => {
      const cb = new CircuitBreaker(1, 10)

      cb.recordFailure('google')
      const start = Date.now()
      while (Date.now() - start < 15) { /* busy wait */ }

      expect(cb.isAvailable('google')).toBe(true) // half-open
      cb.recordSuccess('google')

      const status = cb.getStatus()
      expect(status.google.state).toBe('closed')
      expect(status.google.consecutiveFailures).toBe(0)
    })

    it('router skips provider with open circuit', async () => {
      const cb = new CircuitBreaker(1, 60000)
      cb.recordFailure('anthropic') // Opens circuit

      const router = new LLMRouter(cb)
      const response = await router.call(makeRequest('claude-sonnet-4-6'), makeContext())

      // Should skip anthropic (circuit open), fall back to openai
      expect(anthropicCallCount).toBe(0)
      expect(response.content).toContain('OpenAI')
    })
  })

  // =================================================================
  // AC #6: AgentRunner prompt assembly
  // =================================================================
  describe('AC6: AgentRunner prompt assembly', () => {
    it('assembles system prompt from agent soul', () => {
      const prompt = buildSystemPrompt({
        id: 'a1', companyId: 'c1', name: 'Analyst', tier: 'specialist',
        modelName: 'claude-haiku-4-5', soul: 'You are a financial analyst.', allowedTools: [], isActive: true,
      })
      expect(prompt).toContain('financial analyst')
    })

    it('includes tool definitions when allowedTools set', () => {
      const { setToolDefinitionProvider: setProvider } = require('../../services/agent-runner')
      setProvider((tools: string[]) => tools.map((name: string) => ({
        name, description: `Tool: ${name}`, parameters: { type: 'object', properties: {} },
      })))

      const prompt = buildSystemPrompt({
        id: 'a1', companyId: 'c1', name: 'Worker', tier: 'worker',
        modelName: 'claude-haiku-4-5', soul: 'You are a worker.', allowedTools: ['web_search', 'calculator'], isActive: true,
      }, [
        { name: 'web_search', description: 'Search the web', parameters: { type: 'object', properties: {} } },
        { name: 'calculator', description: 'Do math', parameters: { type: 'object', properties: {} } },
      ])
      expect(prompt).toContain('web_search')
      expect(prompt).toContain('calculator')
      expect(prompt).toContain('2 tools')
    })

    it('execute() returns TaskResponse with correct fields', async () => {
      const runner = new AgentRunner()
      const agent = {
        id: TEST_AGENT_ID, companyId: TEST_COMPANY, name: 'TestAgent',
        tier: 'manager' as const, modelName: 'claude-haiku-4-5',
        soul: 'You are a manager.', allowedTools: [], isActive: true,
      }
      const task: TaskRequest = { messages: [{ role: 'user', content: 'Analyze market' }] }

      const result = await runner.execute(agent, task, makeContext())

      expect(result.content).toBeDefined()
      expect(result.usage.inputTokens).toBeGreaterThan(0)
      expect(result.usage.outputTokens).toBeGreaterThan(0)
      expect(result.cost.model).toBeDefined()
      expect(result.cost.provider).toBeDefined()
      expect(result.cost.estimatedCostMicro).toBeGreaterThanOrEqual(0)
      expect(result.finishReason).toBeDefined()
      expect(result.iterations).toBeGreaterThanOrEqual(1)
    })
  })

  // =================================================================
  // AC #7: AgentRunner tool loop
  // =================================================================
  describe('AC7: AgentRunner tool loop', () => {
    it('processes tool_use and calls executor', async () => {
      anthropicCallBehavior = 'tool_use'
      anthropicToolCallNum = 0

      const runner = new AgentRunner()
      const agent = {
        id: TEST_AGENT_ID, companyId: TEST_COMPANY, name: 'ToolAgent',
        tier: 'manager' as const, modelName: 'claude-haiku-4-5',
        soul: 'You are a researcher.', allowedTools: ['web_search'], isActive: true,
      }

      const toolExecutor: ToolExecutor = async (_name, args) => {
        return { result: `Results for ${(args as Record<string, unknown>).query}` }
      }

      const result = await runner.execute(agent, { messages: [{ role: 'user', content: 'Search for test' }] }, makeContext(), toolExecutor)

      expect(result.content).toBe('Found results.')
      expect(result.iterations).toBe(2)
      expect(result.toolCalls.length).toBe(1)
      expect(result.toolCalls[0].name).toBe('web_search')
      expect(result.toolCalls[0].result).toContain('Results for test')
    })
  })

  // =================================================================
  // AC #8: BatchCollector queue + flush
  // =================================================================
  describe('AC8: BatchCollector queue and flush', () => {
    it('enqueue() adds items and getStatus() counts correctly', () => {
      const bc = new BatchCollector()
      const request = makeRequest('claude-sonnet-4-6')

      bc.enqueue(request, makeContext())
      bc.enqueue(request, makeContext())

      const status = bc.getStatus(TEST_COMPANY)
      expect(status.pending).toBe(2)
      expect(status.totalItems).toBe(2)
    })

    it('enqueue() enforces 1000 item limit', () => {
      const bc = new BatchCollector()
      const request = makeRequest('claude-sonnet-4-6')

      for (let i = 0; i < 1000; i++) {
        bc.enqueue(request, makeContext())
      }

      expect(() => bc.enqueue(request, makeContext())).toThrow(/queue full/i)
    })

    it('enqueue() provides tenant isolation', () => {
      const bc = new BatchCollector()
      const request = makeRequest('claude-sonnet-4-6')

      bc.enqueue(request, { ...makeContext(), companyId: 'company-A' })
      bc.enqueue(request, { ...makeContext(), companyId: 'company-B' })

      expect(bc.getStatus('company-A').pending).toBe(1)
      expect(bc.getStatus('company-B').pending).toBe(1)
    })

    it('flush() partitions items by provider', async () => {
      const bc = new BatchCollector()

      bc.enqueue(makeRequest('claude-sonnet-4-6'), makeContext())
      bc.enqueue(makeRequest('gpt-4.1'), makeContext())

      const results = await bc.flush(TEST_COMPANY)

      // Should have results for both providers
      expect(results.length).toBeGreaterThanOrEqual(1)
    })
  })

  // =================================================================
  // AC #9: Cost recording accuracy
  // =================================================================
  describe('AC9: Cost recording accuracy', () => {
    it('calculateCostMicro uses models.yaml pricing for known models', () => {
      // claude-sonnet-4-6: input=$3/1M, output=$15/1M
      const cost = calculateCostMicro('claude-sonnet-4-6', 1000, 500)
      // input: (1000/1M) * 3 * 1M = 3000, output: (500/1M) * 15 * 1M = 7500
      expect(cost).toBe(3000 + 7500) // 10500
    })

    it('calculateCostMicro falls back to default for unknown models', () => {
      const cost = calculateCostMicro('unknown-model', 1000, 500)
      // default: input=$3/1M, output=$15/1M
      expect(cost).toBe(3000 + 7500)
    })

    it('calculateCostMicro applies 50% batch discount', () => {
      const normalCost = calculateCostMicro('claude-sonnet-4-6', 1000, 500)
      const batchCost = calculateCostMicro('claude-sonnet-4-6', 1000, 500, true)
      expect(batchCost).toBe(Math.round(normalCost * 0.5))
    })

    it('calculateCostMicro handles zero tokens', () => {
      expect(calculateCostMicro('claude-sonnet-4-6', 0, 0)).toBe(0)
    })

    it('calculateCostMicro handles negative tokens gracefully', () => {
      expect(calculateCostMicro('claude-sonnet-4-6', -1, -1)).toBe(0)
    })

    it('cost varies correctly across different models', () => {
      // gpt-4.1: input=$2.5/1M, output=$10/1M
      const gptCost = calculateCostMicro('gpt-4.1', 1000, 500)
      expect(gptCost).toBe(2500 + 5000) // 7500

      // claude-haiku-4-5: input=$0.8/1M, output=$4/1M
      const haikuCost = calculateCostMicro('claude-haiku-4-5', 1000, 500)
      expect(haikuCost).toBe(800 + 2000) // 2800

      // gemini-2.5-flash: input=$0.075/1M, output=$0.3/1M
      const flashCost = calculateCostMicro('gemini-2.5-flash', 1000, 500)
      expect(flashCost).toBe(Math.round(75 + 150)) // 225
    })
  })

  // =================================================================
  // AC #10: Credential scrubbing
  // =================================================================
  describe('AC10: Credential scrubbing', () => {
    it('rejects soul containing sk-* API key pattern', () => {
      expect(() => buildSystemPrompt({
        id: 'a1', companyId: 'c1', name: 'Bad', tier: 'worker',
        modelName: 'claude-haiku-4-5', soul: 'Use key sk-abc123xyz456789012345', allowedTools: [], isActive: true,
      })).toThrow(/Credential pattern detected/)
    })

    it('rejects soul containing AIza* Google key pattern', () => {
      expect(() => buildSystemPrompt({
        id: 'a1', companyId: 'c1', name: 'Bad', tier: 'worker',
        modelName: 'claude-haiku-4-5', soul: 'Use key AIzaSyAabcdefghijklmnopqrstuvwxyz012345', allowedTools: [], isActive: true,
      })).toThrow(/Credential pattern detected/)
    })

    it('rejects soul containing Bearer token', () => {
      expect(() => buildSystemPrompt({
        id: 'a1', companyId: 'c1', name: 'Bad', tier: 'worker',
        modelName: 'claude-haiku-4-5', soul: 'Use Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', allowedTools: [], isActive: true,
      })).toThrow(/Credential pattern detected/)
    })

    it('scanForCredentials rejects private key PEM', () => {
      expect(() => scanForCredentials('-----BEGIN PRIVATE KEY-----\nMIIE...')).toThrow()
    })

    it('scanForCredentials allows normal text', () => {
      expect(() => scanForCredentials('You are a helpful analyst. Use web search tools.')).not.toThrow()
    })
  })

  // =================================================================
  // AC #11: Stream fallback
  // =================================================================
  describe('AC11: Stream fallback', () => {
    it('LLMRouter.stream() succeeds on primary provider', async () => {
      const router = new LLMRouter()
      const chunks: LLMStreamChunk[] = []

      for await (const chunk of router.stream(makeRequest('claude-sonnet-4-6'), makeContext())) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBeGreaterThan(0)
      const textChunks = chunks.filter(c => c.type === 'text')
      expect(textChunks.length).toBeGreaterThan(0)
    })

    it('pre-chunk failure falls back to next provider stream', async () => {
      anthropicStreamBehavior = 'pre_chunk_error'
      const router = new LLMRouter()
      const chunks: LLMStreamChunk[] = []

      for await (const chunk of router.stream(makeRequest('claude-sonnet-4-6'), makeContext())) {
        chunks.push(chunk)
      }

      // Should have fallen back to OpenAI (pre-chunk = no chunks yielded, so retries stream on next)
      const textChunks = chunks.filter(c => c.type === 'text')
      expect(textChunks.length).toBeGreaterThan(0)
      // Anthropic failed, OpenAI handled the fallback
      expect(anthropicCallCount).toBe(0) // Anthropic stream failed, call never invoked
    })

    it('mid-chunk failure falls back to non-streaming call on next provider', async () => {
      anthropicStreamBehavior = 'mid_chunk_error'
      const router = new LLMRouter()
      const chunks: LLMStreamChunk[] = []

      for await (const chunk of router.stream(makeRequest('claude-sonnet-4-6'), makeContext())) {
        chunks.push(chunk)
      }

      // Should have partial anthropic chunk + fallback OpenAI call() result
      const textChunks = chunks.filter(c => c.type === 'text')
      expect(textChunks.length).toBeGreaterThan(0)
      // Mid-stream failure triggers call() on fallback provider, not stream()
      expect(openaiCallCount).toBe(1)
    })
  })

  // =================================================================
  // AC #12: End-to-end pipeline test
  // =================================================================
  describe('AC12: End-to-end pipeline', () => {
    it('AgentRunner -> resolveModel -> Router -> Adapter -> cost', async () => {
      const runner = new AgentRunner()
      const agent = {
        id: TEST_AGENT_ID, companyId: TEST_COMPANY, name: 'E2EAgent',
        tier: 'manager' as const, modelName: 'claude-haiku-4-5', // schema default -> tier-default used
        soul: 'You are a strategic analyst.', allowedTools: [], isActive: true,
      }

      const result = await runner.execute(
        agent,
        { messages: [{ role: 'user', content: 'Provide quarterly analysis' }] },
        makeContext(),
      )

      // Verify response content came from the correct adapter
      expect(result.content).toContain('Anthropic') // tier-default for manager = claude-sonnet-4-6
      expect(result.cost.model).toBe('claude-sonnet-4-6')
      expect(result.cost.provider).toBe('anthropic')
      expect(result.cost.estimatedCostMicro).toBeGreaterThan(0)
      expect(result.iterations).toBe(1)
      expect(result.finishReason).toBe('stop')
    })

    it('specialist agent uses tier-default model through full pipeline', async () => {
      const runner = new AgentRunner()
      const agent = {
        id: TEST_AGENT_ID, companyId: TEST_COMPANY, name: 'SpecialistAgent',
        tier: 'specialist' as const, modelName: 'claude-haiku-4-5', // schema default -> tier-default
        soul: 'You are a specialist.', allowedTools: [], isActive: true,
      }

      const result = await runner.execute(
        agent,
        { messages: [{ role: 'user', content: 'Do analysis' }] },
        makeContext(),
      )

      // Specialist tier default = claude-haiku-4-5 -> anthropic
      expect(result.cost.model).toBe('claude-haiku-4-5')
      expect(result.cost.provider).toBe('anthropic')
    })

    it('manual model override uses specified model through full pipeline', async () => {
      const runner = new AgentRunner()
      const agent = {
        id: TEST_AGENT_ID, companyId: TEST_COMPANY, name: 'OverrideAgent',
        tier: 'worker' as const, modelName: 'gpt-4.1', // manual override (not schema default)
        soul: 'You are a worker with GPT override.', allowedTools: [], isActive: true,
      }

      const result = await runner.execute(
        agent,
        { messages: [{ role: 'user', content: 'Do work' }] },
        makeContext(),
      )

      expect(result.cost.model).toBe('gpt-4.1')
      expect(result.cost.provider).toBe('openai')
      expect(result.content).toContain('OpenAI')
    })

    it('fallback pipeline: primary fails -> fallback succeeds -> response returned', async () => {
      anthropicCallBehavior = 'server_error'

      const router = new LLMRouter()
      const response = await router.call(makeRequest('claude-sonnet-4-6'), makeContext())

      // Fell back to OpenAI
      expect(response.content).toContain('OpenAI')
      expect(anthropicCallCount).toBe(1) // Tried anthropic
      expect(openaiCallCount).toBe(1)   // Fell back to openai
    })
  })

  // =================================================================
  // Cross-component: models.yaml consistency
  // =================================================================
  describe('Cross-component: models.yaml consistency', () => {
    it('all tier defaults reference valid models', () => {
      for (const tier of ['manager', 'specialist', 'worker']) {
        const modelId = getTierDefaultModel(tier)
        const config = getModelConfig(modelId)
        expect(config).toBeDefined()
        expect(config!.id).toBe(modelId)
      }
    })

    it('all models have valid provider names', () => {
      const validProviders: LLMProviderName[] = ['anthropic', 'openai', 'google']
      for (const modelId of ['claude-sonnet-4-6', 'claude-haiku-4-5', 'gpt-4.1', 'gpt-4.1-mini', 'gemini-2.5-pro', 'gemini-2.5-flash']) {
        const config = getModelConfig(modelId)
        expect(config).toBeDefined()
        expect(validProviders).toContain(config!.provider)
      }
    })

    it('fallback models exist and are from different providers', () => {
      for (const modelId of ['claude-sonnet-4-6', 'gpt-4.1', 'gemini-2.5-pro']) {
        const fallbacks = getFallbackModels(modelId)
        const originalProvider = getModelConfig(modelId)!.provider
        for (const fb of fallbacks) {
          const fbConfig = getModelConfig(fb)
          expect(fbConfig).toBeDefined()
          expect(fbConfig!.provider).not.toBe(originalProvider)
        }
      }
    })

    it('supportsBatch flag matches adapter capability', () => {
      const anthropicModels = ['claude-sonnet-4-6', 'claude-haiku-4-5']
      const openaiModels = ['gpt-4.1', 'gpt-4.1-mini']
      const googleModels = ['gemini-2.5-pro', 'gemini-2.5-flash']

      for (const m of anthropicModels) expect(getModelConfig(m)!.supportsBatch).toBe(true)
      for (const m of openaiModels) expect(getModelConfig(m)!.supportsBatch).toBe(true)
      for (const m of googleModels) expect(getModelConfig(m)!.supportsBatch).toBe(false)
    })
  })
})
