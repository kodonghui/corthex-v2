/**
 * LLM Provider Adapters -- Unit Tests
 * Story 3-1: Claude/GPT/Gemini adapter + types + models.yaml + factory
 *
 * bun test src/__tests__/unit/llm-provider-adapters.test.ts
 */
import { describe, test, expect, beforeEach } from 'bun:test'

// === 1. Shared Types Tests ===
describe('LLM Shared Types', () => {
  test('LLMProviderName type covers 3 providers', () => {
    const providers: import('@corthex/shared').LLMProviderName[] = ['anthropic', 'openai', 'google']
    expect(providers).toHaveLength(3)
  })

  test('LLMRequest type has required fields', () => {
    const request: import('@corthex/shared').LLMRequest = {
      model: 'claude-sonnet-4-6',
      messages: [{ role: 'user', content: 'hello' }],
    }
    expect(request.model).toBe('claude-sonnet-4-6')
    expect(request.messages).toHaveLength(1)
  })

  test('LLMResponse type has required fields', () => {
    const response: import('@corthex/shared').LLMResponse = {
      content: 'hello',
      toolCalls: [],
      usage: { inputTokens: 100, outputTokens: 50 },
      model: 'claude-sonnet-4-6',
      provider: 'anthropic',
      finishReason: 'stop',
    }
    expect(response.provider).toBe('anthropic')
    expect(response.usage.inputTokens).toBe(100)
  })

  test('LLMError type has required fields', () => {
    const error: import('@corthex/shared').LLMError = {
      provider: 'openai',
      code: 'rate_limit',
      message: 'Too many requests',
      retryable: true,
    }
    expect(error.retryable).toBe(true)
    expect(error.code).toBe('rate_limit')
  })

  test('LLMToolCall type has id, name, arguments', () => {
    const tc: import('@corthex/shared').LLMToolCall = {
      id: 'call_123',
      name: 'web_search',
      arguments: { query: 'test' },
    }
    expect(tc.id).toBe('call_123')
    expect(tc.arguments.query).toBe('test')
  })

  test('LLMStreamChunk types cover all variants', () => {
    const textChunk: import('@corthex/shared').LLMStreamChunk = { type: 'text', content: 'hi' }
    const toolStart: import('@corthex/shared').LLMStreamChunk = { type: 'tool_call_start', toolCall: { id: '1', name: 'fn' } }
    const done: import('@corthex/shared').LLMStreamChunk = { type: 'done', usage: { inputTokens: 10, outputTokens: 5 } }
    expect(textChunk.type).toBe('text')
    expect(toolStart.type).toBe('tool_call_start')
    expect(done.type).toBe('done')
  })

  test('LLMRequest supports optional fields', () => {
    const request: import('@corthex/shared').LLMRequest = {
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: 'test' }],
      systemPrompt: 'You are helpful',
      tools: [{ name: 'calc', description: 'Calculator', parameters: { type: 'object' } }],
      maxTokens: 2048,
      temperature: 0.7,
      stream: true,
    }
    expect(request.systemPrompt).toBe('You are helpful')
    expect(request.tools).toHaveLength(1)
    expect(request.maxTokens).toBe(2048)
    expect(request.temperature).toBe(0.7)
    expect(request.stream).toBe(true)
  })

  test('LLMMessage supports tool role with toolCallId', () => {
    const msg: import('@corthex/shared').LLMMessage = {
      role: 'tool',
      content: '42',
      toolCallId: 'call_abc',
    }
    expect(msg.role).toBe('tool')
    expect(msg.toolCallId).toBe('call_abc')
  })

  test('LLMMessage supports assistant role with toolCalls', () => {
    const msg: import('@corthex/shared').LLMMessage = {
      role: 'assistant',
      content: '',
      toolCalls: [{ id: 'call_1', name: 'search', arguments: { q: 'test' } }],
    }
    expect(msg.toolCalls).toHaveLength(1)
    expect(msg.toolCalls![0].name).toBe('search')
  })
})

// === 2. LLMProvider Interface Tests ===
describe('LLMProvider interface', () => {
  test('interface has name, supportsBatch, call, stream, estimateCost', () => {
    // Type-level test: verify interface shape
    type HasName = import('../../lib/llm/types').LLMProvider['name']
    type HasBatch = import('../../lib/llm/types').LLMProvider['supportsBatch']

    const name: HasName = 'anthropic'
    const batch: HasBatch = true
    expect(name).toBe('anthropic')
    expect(batch).toBe(true)
  })
})

// === 3. Models Config Tests ===
describe('Models Config', () => {
  beforeEach(() => {
    // Reset cache before each test
    const { resetModelsCache } = require('../../config/models')
    resetModelsCache()
  })

  test('loadModelsConfig loads all 6 models', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    expect(config.models).toHaveLength(6)
  })

  test('loadModelsConfig has correct fallback order', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    expect(config.fallbackOrder).toEqual(['anthropic', 'openai', 'google'])
  })

  test('loadModelsConfig has correct tier defaults', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    expect(config.tierDefaults.manager).toBe('claude-sonnet-4-6')
    expect(config.tierDefaults.specialist).toBe('claude-haiku-4-5')
    expect(config.tierDefaults.worker).toBe('claude-haiku-4-5')
  })

  test('getModelConfig returns correct model', () => {
    const { getModelConfig } = require('../../config/models')
    const model = getModelConfig('claude-sonnet-4-6')
    expect(model).toBeDefined()
    expect(model.provider).toBe('anthropic')
    expect(model.inputPricePer1M).toBe(3)
    expect(model.outputPricePer1M).toBe(15)
    expect(model.supportsBatch).toBe(true)
  })

  test('getModelConfig returns undefined for unknown model', () => {
    const { getModelConfig } = require('../../config/models')
    const model = getModelConfig('nonexistent-model')
    expect(model).toBeUndefined()
  })

  test('getModelsByProvider returns correct models for anthropic', () => {
    const { getModelsByProvider } = require('../../config/models')
    const models = getModelsByProvider('anthropic')
    expect(models).toHaveLength(2)
    expect(models.map((m: any) => m.id)).toContain('claude-sonnet-4-6')
    expect(models.map((m: any) => m.id)).toContain('claude-haiku-4-5')
  })

  test('getModelsByProvider returns correct models for openai', () => {
    const { getModelsByProvider } = require('../../config/models')
    const models = getModelsByProvider('openai')
    expect(models).toHaveLength(2)
    expect(models.map((m: any) => m.id)).toContain('gpt-4.1')
    expect(models.map((m: any) => m.id)).toContain('gpt-4.1-mini')
  })

  test('getModelsByProvider returns correct models for google', () => {
    const { getModelsByProvider } = require('../../config/models')
    const models = getModelsByProvider('google')
    expect(models).toHaveLength(2)
    expect(models.map((m: any) => m.id)).toContain('gemini-2.5-pro')
    expect(models.map((m: any) => m.id)).toContain('gemini-2.5-flash')
  })

  test('getTierDefaultModel returns correct defaults', () => {
    const { getTierDefaultModel } = require('../../config/models')
    expect(getTierDefaultModel('manager')).toBe('claude-sonnet-4-6')
    expect(getTierDefaultModel('specialist')).toBe('claude-haiku-4-5')
    expect(getTierDefaultModel('worker')).toBe('claude-haiku-4-5')
  })

  test('getTierDefaultModel returns haiku for unknown tier', () => {
    const { getTierDefaultModel } = require('../../config/models')
    expect(getTierDefaultModel('intern')).toBe('claude-haiku-4-5')
  })

  test('getFallbackOrder returns 3 providers in order', () => {
    const { getFallbackOrder } = require('../../config/models')
    const order = getFallbackOrder()
    expect(order).toEqual(['anthropic', 'openai', 'google'])
  })

  test('model pricing values are positive numbers', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    for (const model of config.models) {
      expect(model.inputPricePer1M).toBeGreaterThan(0)
      expect(model.outputPricePer1M).toBeGreaterThan(0)
      expect(model.maxTokens).toBeGreaterThan(0)
    }
  })

  test('all models have required fields', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    for (const model of config.models) {
      expect(model.id).toBeTruthy()
      expect(model.provider).toBeTruthy()
      expect(model.displayName).toBeTruthy()
      expect(typeof model.inputPricePer1M).toBe('number')
      expect(typeof model.outputPricePer1M).toBe('number')
      expect(typeof model.maxTokens).toBe('number')
      expect(typeof model.supportsBatch).toBe('boolean')
    }
  })

  test('cache is reused on second call', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config1 = loadModelsConfig()
    const config2 = loadModelsConfig()
    expect(config1).toBe(config2) // same reference
  })

  test('resetModelsCache clears cache', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    const config1 = loadModelsConfig()
    resetModelsCache()
    const config2 = loadModelsConfig()
    expect(config1).not.toBe(config2) // different reference
    expect(config1.models).toEqual(config2.models) // same content
  })
})

// === 4. Adapter Construction Tests ===
describe('AnthropicAdapter', () => {
  test('has correct name and supportsBatch', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    expect(adapter.name).toBe('anthropic')
    expect(adapter.supportsBatch).toBe(true)
  })

  test('estimateCost for claude-sonnet-4-6', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    // 1000 input * (3/1M) + 500 output * (15/1M) = 0.003 + 0.0075 = 0.0105
    const cost = adapter.estimateCost(1000, 500, 'claude-sonnet-4-6')
    expect(cost).toBeCloseTo(0.0105, 6)
  })

  test('estimateCost for claude-haiku-4-5', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    // 1000 * (0.8/1M) + 500 * (4/1M) = 0.0008 + 0.002 = 0.0028
    const cost = adapter.estimateCost(1000, 500, 'claude-haiku-4-5')
    expect(cost).toBeCloseTo(0.0028, 6)
  })

  test('estimateCost for unknown model uses default', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const cost = adapter.estimateCost(1000, 500, 'unknown')
    // default: 3/15
    expect(cost).toBeCloseTo(0.0105, 6)
  })
})

describe('OpenAIAdapter', () => {
  test('has correct name and supportsBatch', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    expect(adapter.name).toBe('openai')
    expect(adapter.supportsBatch).toBe(true)
  })

  test('estimateCost for gpt-4.1', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    // 1000 * (2.5/1M) + 500 * (10/1M) = 0.0025 + 0.005 = 0.0075
    const cost = adapter.estimateCost(1000, 500, 'gpt-4.1')
    expect(cost).toBeCloseTo(0.0075, 6)
  })

  test('estimateCost for gpt-4.1-mini', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    // 1000 * (0.4/1M) + 500 * (1.6/1M) = 0.0004 + 0.0008 = 0.0012
    const cost = adapter.estimateCost(1000, 500, 'gpt-4.1-mini')
    expect(cost).toBeCloseTo(0.0012, 6)
  })
})

describe('GoogleAdapter', () => {
  test('has correct name and supportsBatch', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    expect(adapter.name).toBe('google')
    expect(adapter.supportsBatch).toBe(false)
  })

  test('estimateCost for gemini-2.5-pro', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    // 1000 * (1.25/1M) + 500 * (10/1M) = 0.00125 + 0.005 = 0.00625
    const cost = adapter.estimateCost(1000, 500, 'gemini-2.5-pro')
    expect(cost).toBeCloseTo(0.00625, 6)
  })

  test('estimateCost for gemini-2.5-flash', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    // 1000 * (0.075/1M) + 500 * (0.3/1M) = 0.000075 + 0.00015 = 0.000225
    const cost = adapter.estimateCost(1000, 500, 'gemini-2.5-flash')
    expect(cost).toBeCloseTo(0.000225, 6)
  })
})

// === 5. Factory Tests ===
describe('createProvider factory', () => {
  test('creates AnthropicAdapter for "anthropic"', () => {
    const { createProvider } = require('../../lib/llm')
    const adapter = createProvider('anthropic', 'test-key')
    expect(adapter.name).toBe('anthropic')
    expect(adapter.supportsBatch).toBe(true)
  })

  test('creates OpenAIAdapter for "openai"', () => {
    const { createProvider } = require('../../lib/llm')
    const adapter = createProvider('openai', 'test-key')
    expect(adapter.name).toBe('openai')
    expect(adapter.supportsBatch).toBe(true)
  })

  test('creates GoogleAdapter for "google"', () => {
    const { createProvider } = require('../../lib/llm')
    const adapter = createProvider('google', 'test-key')
    expect(adapter.name).toBe('google')
    expect(adapter.supportsBatch).toBe(false)
  })

  test('throws for unknown provider', () => {
    const { createProvider } = require('../../lib/llm')
    expect(() => createProvider('azure' as any, 'key')).toThrow('Unknown LLM provider: azure')
  })
})

// === 6. Updated CostTracker Tests ===
describe('CostTracker (models.yaml integration)', () => {
  test('calculateCostMicro for claude-sonnet-4-6 (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 3 * 1M = 3000 micro
    // output: (500/1M) * 15 * 1M = 7500 micro
    const cost = calculateCostMicro('claude-sonnet-4-6', 1000, 500)
    expect(cost).toBe(10500)
  })

  test('calculateCostMicro for claude-haiku-4-5 (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 0.8 * 1M = 800 micro
    // output: (500/1M) * 4 * 1M = 2000 micro
    const cost = calculateCostMicro('claude-haiku-4-5', 1000, 500)
    expect(cost).toBe(2800)
  })

  test('calculateCostMicro for gpt-4.1 (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 2.5 * 1M = 2500 micro
    // output: (500/1M) * 10 * 1M = 5000 micro
    const cost = calculateCostMicro('gpt-4.1', 1000, 500)
    expect(cost).toBe(7500)
  })

  test('calculateCostMicro for gpt-4.1-mini (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 0.4 * 1M = 400 micro
    // output: (500/1M) * 1.6 * 1M = 800 micro
    const cost = calculateCostMicro('gpt-4.1-mini', 1000, 500)
    expect(cost).toBe(1200)
  })

  test('calculateCostMicro for gemini-2.5-pro (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 1.25 * 1M = 1250 micro
    // output: (500/1M) * 10 * 1M = 5000 micro
    const cost = calculateCostMicro('gemini-2.5-pro', 1000, 500)
    expect(cost).toBe(6250)
  })

  test('calculateCostMicro for gemini-2.5-flash (from models.yaml)', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // input: (1000/1M) * 0.075 * 1M = 75 micro
    // output: (500/1M) * 0.3 * 1M = 150 micro
    const cost = calculateCostMicro('gemini-2.5-flash', 1000, 500)
    expect(cost).toBe(225)
  })

  test('calculateCostMicro for unknown model uses default pricing', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    // default: input 3, output 15 (sonnet-level)
    const cost = calculateCostMicro('unknown-future-model', 1000, 500)
    expect(cost).toBe(10500)
  })

  test('calculateCostMicro 0 tokens = 0 cost', () => {
    const { calculateCostMicro } = require('../../lib/cost-tracker')
    const cost = calculateCostMicro('claude-sonnet-4-6', 0, 0)
    expect(cost).toBe(0)
  })

  test('microToUsd converts correctly', () => {
    const { microToUsd } = require('../../lib/cost-tracker')
    expect(microToUsd(1_000_000)).toBe(1)
    expect(microToUsd(0)).toBe(0)
    expect(microToUsd(10500)).toBe(0.0105)
  })
})

// === 7. Error Normalization Tests ===
describe('Error normalization', () => {
  test('LLMError codes are valid', () => {
    const validCodes = ['auth_error', 'rate_limit', 'timeout', 'server_error', 'invalid_request', 'unknown']
    const error: import('@corthex/shared').LLMError = {
      provider: 'anthropic',
      code: 'rate_limit',
      message: 'test',
      retryable: true,
    }
    expect(validCodes).toContain(error.code)
  })

  test('LLMResponse finishReason values are valid', () => {
    const validReasons = ['stop', 'tool_use', 'max_tokens', 'error']
    const response: import('@corthex/shared').LLMResponse = {
      content: '',
      toolCalls: [],
      usage: { inputTokens: 0, outputTokens: 0 },
      model: 'test',
      provider: 'anthropic',
      finishReason: 'tool_use',
    }
    expect(validReasons).toContain(response.finishReason)
  })
})

// === 8. Models Config Edge Cases ===
describe('Models Config edge cases', () => {
  test('gemini models have supportsBatch = false', () => {
    const { getModelsByProvider } = require('../../config/models')
    const models = getModelsByProvider('google')
    for (const model of models) {
      expect(model.supportsBatch).toBe(false)
    }
  })

  test('anthropic and openai models have supportsBatch = true', () => {
    const { getModelsByProvider } = require('../../config/models')
    for (const provider of ['anthropic', 'openai']) {
      const models = getModelsByProvider(provider)
      for (const model of models) {
        expect(model.supportsBatch).toBe(true)
      }
    }
  })

  test('model IDs are unique', () => {
    const { loadModelsConfig } = require('../../config/models')
    const config = loadModelsConfig()
    const ids = config.models.map((m: any) => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
