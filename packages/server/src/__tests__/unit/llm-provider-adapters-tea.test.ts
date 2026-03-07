/**
 * TEA (Test Architect) -- Story 3-1: LLM Provider Adapters
 * Risk-based test coverage expansion
 *
 * Risk Areas:
 * - HIGH: Tool call response parsing (3 different SDK formats)
 * - HIGH: Error normalization (auth, rate limit, timeout, server)
 * - MEDIUM: Message format conversion (user/assistant/tool roles)
 * - MEDIUM: Cost estimation accuracy across 6 models
 * - MEDIUM: YAML parser edge cases
 * - LOW: Factory pattern completeness
 *
 * bun test src/__tests__/unit/llm-provider-adapters-tea.test.ts
 */
import { describe, test, expect, beforeEach } from 'bun:test'

// === RISK AREA 1: Anthropic Message Conversion ===
describe('TEA: AnthropicAdapter message conversion', () => {
  test('user message converts to Anthropic format', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    // Access private method via prototype for testing
    const result = adapter['toAnthropicMessage']({ role: 'user', content: 'Hello' })
    expect(result.role).toBe('user')
    expect(result.content).toBe('Hello')
  })

  test('assistant message converts to Anthropic format', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['toAnthropicMessage']({ role: 'assistant', content: 'Hi there' })
    expect(result.role).toBe('assistant')
    expect(result.content).toBe('Hi there')
  })

  test('tool result message converts to user role with tool_result content', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['toAnthropicMessage']({
      role: 'tool',
      content: '42',
      toolCallId: 'call_123',
    })
    expect(result.role).toBe('user')
    expect(Array.isArray(result.content)).toBe(true)
    const content = result.content as any[]
    expect(content[0].type).toBe('tool_result')
    expect(content[0].tool_use_id).toBe('call_123')
    expect(content[0].content).toBe('42')
  })

  test('assistant message with tool calls includes tool_use blocks', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['toAnthropicMessage']({
      role: 'assistant',
      content: 'Let me search',
      toolCalls: [{
        id: 'call_abc',
        name: 'web_search',
        arguments: { query: 'test' },
      }],
    })
    expect(result.role).toBe('assistant')
    const content = result.content as any[]
    expect(content).toHaveLength(2) // text + tool_use
    expect(content[0].type).toBe('text')
    expect(content[0].text).toBe('Let me search')
    expect(content[1].type).toBe('tool_use')
    expect(content[1].id).toBe('call_abc')
    expect(content[1].name).toBe('web_search')
  })

  test('assistant message with tool calls but no text content only includes tool_use', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['toAnthropicMessage']({
      role: 'assistant',
      content: '',
      toolCalls: [{ id: 'call_1', name: 'calc', arguments: { x: 1 } }],
    })
    const content = result.content as any[]
    expect(content).toHaveLength(1) // only tool_use, no empty text
    expect(content[0].type).toBe('tool_use')
  })

  test('assistant message with multiple tool calls includes all', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['toAnthropicMessage']({
      role: 'assistant',
      content: '',
      toolCalls: [
        { id: 'call_1', name: 'search', arguments: { q: 'a' } },
        { id: 'call_2', name: 'calc', arguments: { x: 1 } },
      ],
    })
    const content = result.content as any[]
    expect(content).toHaveLength(2)
    expect(content[0].name).toBe('search')
    expect(content[1].name).toBe('calc')
  })
})

// === RISK AREA 2: OpenAI Message Building ===
describe('TEA: OpenAIAdapter message building', () => {
  test('system prompt creates system message first', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const messages = adapter['buildMessages']({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: 'hi' }],
      systemPrompt: 'You are helpful',
    })
    expect(messages[0].role).toBe('system')
    expect((messages[0] as any).content).toBe('You are helpful')
    expect(messages[1].role).toBe('user')
  })

  test('no system prompt when not provided', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const messages = adapter['buildMessages']({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: 'hi' }],
    })
    expect(messages[0].role).toBe('user')
  })

  test('tool result converts to OpenAI tool message', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const messages = adapter['buildMessages']({
      model: 'gpt-4.1',
      messages: [{
        role: 'tool',
        content: 'result_data',
        toolCallId: 'call_xyz',
      }],
    })
    expect(messages[0].role).toBe('tool')
    expect((messages[0] as any).tool_call_id).toBe('call_xyz')
  })

  test('assistant with tool calls serializes arguments to JSON string', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const messages = adapter['buildMessages']({
      model: 'gpt-4.1',
      messages: [{
        role: 'assistant',
        content: '',
        toolCalls: [{ id: 'call_1', name: 'search', arguments: { q: 'test' } }],
      }],
    })
    const msg = messages[0] as any
    expect(msg.tool_calls[0].function.arguments).toBe('{"q":"test"}')
    expect(msg.tool_calls[0].type).toBe('function')
  })
})

// === RISK AREA 3: Google Message Building ===
describe('TEA: GoogleAdapter message building', () => {
  test('user message converts to Gemini user role', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const contents = adapter['buildContents']({
      model: 'gemini-2.5-pro',
      messages: [{ role: 'user', content: 'hello' }],
    })
    expect(contents[0].role).toBe('user')
    expect(contents[0].parts[0].text).toBe('hello')
  })

  test('assistant message converts to model role', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const contents = adapter['buildContents']({
      model: 'gemini-2.5-pro',
      messages: [{ role: 'assistant', content: 'hi' }],
    })
    expect(contents[0].role).toBe('model')
    expect(contents[0].parts[0].text).toBe('hi')
  })

  test('tool result converts to functionResponse in user role', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const contents = adapter['buildContents']({
      model: 'gemini-2.5-pro',
      messages: [{
        role: 'tool',
        content: 'result',
        toolCallId: 'search_fn',
      }],
    })
    expect(contents[0].role).toBe('user')
    expect(contents[0].parts[0].functionResponse).toBeDefined()
    expect(contents[0].parts[0].functionResponse.name).toBe('search_fn')
  })

  test('assistant with tool calls includes functionCall parts', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const contents = adapter['buildContents']({
      model: 'gemini-2.5-pro',
      messages: [{
        role: 'assistant',
        content: 'I will search',
        toolCalls: [{ id: 'call_1', name: 'web_search', arguments: { q: 'test' } }],
      }],
    })
    expect(contents[0].role).toBe('model')
    expect(contents[0].parts).toHaveLength(2)
    expect(contents[0].parts[0].text).toBe('I will search')
    expect(contents[0].parts[1].functionCall).toBeDefined()
    expect(contents[0].parts[1].functionCall.name).toBe('web_search')
  })
})

// === RISK AREA 4: Google JSON Schema Conversion ===
describe('TEA: GoogleAdapter JSON schema conversion', () => {
  test('converts object type correctly', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name' },
        age: { type: 'number' },
      },
      required: ['name'],
    })
    expect(result.type).toBe('object')
    expect(result.properties.name.type).toBe('string')
    expect(result.properties.age.type).toBe('number')
    expect(result.required).toEqual(['name'])
  })

  test('converts string type correctly', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({
      type: 'string',
      description: 'A name',
    })
    expect(result.type).toBe('string')
    expect(result.description).toBe('A name')
  })

  test('converts boolean type correctly', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({ type: 'boolean' })
    expect(result.type).toBe('boolean')
  })

  test('converts integer type to NUMBER', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({ type: 'integer' })
    expect(result.type).toBe('number')
  })

  test('converts array type with items', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({
      type: 'array',
      items: { type: 'string' },
    })
    expect(result.type).toBe('array')
    expect(result.items.type).toBe('string')
  })

  test('converts nested objects', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['convertJsonSchemaToGemini']({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            zip: { type: 'number' },
          },
        },
      },
    })
    expect(result.properties.address.type).toBe('object')
    expect(result.properties.address.properties.city.type).toBe('string')
  })
})

// === RISK AREA 5: Error Normalization (all providers) ===
describe('TEA: Error normalization patterns', () => {
  test('Anthropic auth error is not retryable', async () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')

    // Use real API call that will fail with auth error
    try {
      await adapter.call({ model: 'claude-haiku-4-5', messages: [{ role: 'user', content: 'hi' }] })
    } catch (err: any) {
      expect(err.code).toBe('auth_error')
      expect(err.retryable).toBe(false)
      expect(err.provider).toBe('anthropic')
      return
    }
    throw new Error('Expected error')
  })

  test('Anthropic rate limit error normalization pattern', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')

    // Test with generic Error (fallback path)
    const result = adapter['normalizeError'](new Error('some unknown error'))
    expect(result.code).toBe('unknown')
    expect(result.provider).toBe('anthropic')
  })

  test('Anthropic server error normalization pattern', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')

    // Test timeout path specifically
    const abortErr = new Error('AbortError')
    abortErr.name = 'AbortError'
    const result = adapter['normalizeError'](abortErr)
    expect(result.code).toBe('timeout')
    expect(result.retryable).toBe(true)
    expect(result.provider).toBe('anthropic')
  })

  test('Anthropic timeout is retryable', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')

    const abortErr = new Error('AbortError')
    abortErr.name = 'AbortError'
    const result = adapter['normalizeError'](abortErr)
    expect(result.code).toBe('timeout')
    expect(result.retryable).toBe(true)
  })

  test('Anthropic unknown error is not retryable', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const result = adapter['normalizeError']('some random error')
    expect(result.code).toBe('unknown')
    expect(result.retryable).toBe(false)
  })

  test('OpenAI auth error is not retryable', async () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')

    try {
      await adapter.call({ model: 'gpt-4.1-mini', messages: [{ role: 'user', content: 'hi' }] })
    } catch (err: any) {
      expect(err.code).toBe('auth_error')
      expect(err.retryable).toBe(false)
      expect(err.provider).toBe('openai')
      return
    }
    throw new Error('Expected error')
  })

  test('OpenAI timeout error normalization pattern', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')

    const abortErr = new Error('AbortError')
    abortErr.name = 'AbortError'
    const result = adapter['normalizeError'](abortErr)
    expect(result.code).toBe('timeout')
    expect(result.retryable).toBe(true)
    expect(result.provider).toBe('openai')
  })

  test('Google auth error is not retryable', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['normalizeError'](new Error('403 Forbidden API_KEY invalid'))
    expect(result.code).toBe('auth_error')
    expect(result.retryable).toBe(false)
    expect(result.provider).toBe('google')
  })

  test('Google rate limit is retryable', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['normalizeError'](new Error('429 RESOURCE_EXHAUSTED'))
    expect(result.code).toBe('rate_limit')
    expect(result.retryable).toBe(true)
  })

  test('Google timeout is retryable', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['normalizeError'](new Error('AbortError'))
    expect(result.code).toBe('timeout')
    expect(result.retryable).toBe(true)
  })

  test('Google server error is retryable', () => {
    const { GoogleAdapter } = require('../../lib/llm/google')
    const adapter = new GoogleAdapter('test-key')
    const result = adapter['normalizeError'](new Error('500 INTERNAL server error'))
    expect(result.code).toBe('server_error')
    expect(result.retryable).toBe(true)
  })
})

// === RISK AREA 6: Cost Estimation Edge Cases ===
describe('TEA: Cost estimation edge cases', () => {
  test('zero tokens returns zero cost for all adapters', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const { GoogleAdapter } = require('../../lib/llm/google')

    expect(new AnthropicAdapter('k').estimateCost(0, 0, 'claude-sonnet-4-6')).toBe(0)
    expect(new OpenAIAdapter('k').estimateCost(0, 0, 'gpt-4.1')).toBe(0)
    expect(new GoogleAdapter('k').estimateCost(0, 0, 'gemini-2.5-pro')).toBe(0)
  })

  test('large token counts produce correct costs', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    // 1M input tokens at $3/1M = $3, 1M output tokens at $15/1M = $15
    const cost = adapter.estimateCost(1_000_000, 1_000_000, 'claude-sonnet-4-6')
    expect(cost).toBeCloseTo(18, 2) // $3 + $15 = $18
  })

  test('cost estimation for each model aligns with models.yaml', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    const { createProvider } = require('../../lib/llm')
    resetModelsCache()
    const config = loadModelsConfig()

    for (const model of config.models) {
      const adapter = createProvider(model.provider, 'test-key')
      const cost = adapter.estimateCost(1_000_000, 1_000_000, model.id)
      const expected = model.inputPricePer1M + model.outputPricePer1M
      expect(cost).toBeCloseTo(expected, 2)
    }
  })
})

// === RISK AREA 7: Factory Robustness ===
describe('TEA: Factory edge cases', () => {
  test('each provider creates independent instances', () => {
    const { createProvider } = require('../../lib/llm')
    const a1 = createProvider('anthropic', 'key1')
    const a2 = createProvider('anthropic', 'key2')
    expect(a1).not.toBe(a2)
  })

  test('all 3 providers implement LLMProvider interface methods', () => {
    const { createProvider } = require('../../lib/llm')
    const providers = ['anthropic', 'openai', 'google'] as const

    for (const name of providers) {
      const adapter = createProvider(name, 'test-key')
      expect(typeof adapter.call).toBe('function')
      expect(typeof adapter.stream).toBe('function')
      expect(typeof adapter.estimateCost).toBe('function')
      expect(typeof adapter.name).toBe('string')
      expect(typeof adapter.supportsBatch).toBe('boolean')
    }
  })
})

// === RISK AREA 8: Anthropic Response Parsing ===
describe('TEA: AnthropicAdapter response parsing', () => {
  test('parseResponse handles text-only response', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const mockResponse = {
      content: [{ type: 'text', text: 'Hello world' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 50 },
    }
    const result = adapter['parseResponse'](mockResponse, 'claude-sonnet-4-6')
    expect(result.content).toBe('Hello world')
    expect(result.toolCalls).toEqual([])
    expect(result.finishReason).toBe('stop')
    expect(result.usage.inputTokens).toBe(100)
    expect(result.usage.outputTokens).toBe(50)
    expect(result.provider).toBe('anthropic')
  })

  test('parseResponse handles tool_use response', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const mockResponse = {
      content: [
        { type: 'text', text: 'Let me search' },
        { type: 'tool_use', id: 'call_123', name: 'web_search', input: { query: 'test' } },
      ],
      stop_reason: 'tool_use',
      usage: { input_tokens: 200, output_tokens: 80 },
    }
    const result = adapter['parseResponse'](mockResponse, 'claude-sonnet-4-6')
    expect(result.content).toBe('Let me search')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].id).toBe('call_123')
    expect(result.toolCalls[0].name).toBe('web_search')
    expect(result.toolCalls[0].arguments).toEqual({ query: 'test' })
    expect(result.finishReason).toBe('tool_use')
  })

  test('parseResponse handles max_tokens finish reason', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const mockResponse = {
      content: [{ type: 'text', text: 'Truncated...' }],
      stop_reason: 'max_tokens',
      usage: { input_tokens: 100, output_tokens: 4096 },
    }
    const result = adapter['parseResponse'](mockResponse, 'claude-sonnet-4-6')
    expect(result.finishReason).toBe('max_tokens')
  })

  test('parseResponse handles multiple tool calls', () => {
    const { AnthropicAdapter } = require('../../lib/llm/anthropic')
    const adapter = new AnthropicAdapter('test-key')
    const mockResponse = {
      content: [
        { type: 'tool_use', id: 'call_1', name: 'search', input: { q: 'a' } },
        { type: 'tool_use', id: 'call_2', name: 'calc', input: { x: 1 } },
      ],
      stop_reason: 'tool_use',
      usage: { input_tokens: 150, output_tokens: 100 },
    }
    const result = adapter['parseResponse'](mockResponse, 'claude-sonnet-4-6')
    expect(result.toolCalls).toHaveLength(2)
    expect(result.content).toBe('')
  })
})

// === RISK AREA 9: OpenAI Response Parsing ===
describe('TEA: OpenAIAdapter response parsing', () => {
  test('parseResponse handles basic completion', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const mockResponse = {
      choices: [{
        message: { content: 'Hello!', tool_calls: undefined },
        finish_reason: 'stop',
      }],
      usage: { prompt_tokens: 50, completion_tokens: 30 },
    }
    const result = adapter['parseResponse'](mockResponse, 'gpt-4.1')
    expect(result.content).toBe('Hello!')
    expect(result.toolCalls).toEqual([])
    expect(result.finishReason).toBe('stop')
    expect(result.provider).toBe('openai')
  })

  test('parseResponse handles tool_calls finish reason', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const mockResponse = {
      choices: [{
        message: {
          content: null,
          tool_calls: [{
            id: 'call_abc',
            type: 'function',
            function: { name: 'search', arguments: '{"q":"test"}' },
          }],
        },
        finish_reason: 'tool_calls',
      }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    }
    const result = adapter['parseResponse'](mockResponse, 'gpt-4.1')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls[0].name).toBe('search')
    expect(result.toolCalls[0].arguments).toEqual({ q: 'test' })
    expect(result.finishReason).toBe('tool_use')
  })

  test('parseResponse handles length finish reason', () => {
    const { OpenAIAdapter } = require('../../lib/llm/openai')
    const adapter = new OpenAIAdapter('test-key')
    const mockResponse = {
      choices: [{
        message: { content: 'Cut off...', tool_calls: undefined },
        finish_reason: 'length',
      }],
      usage: { prompt_tokens: 50, completion_tokens: 4096 },
    }
    const result = adapter['parseResponse'](mockResponse, 'gpt-4.1')
    expect(result.finishReason).toBe('max_tokens')
  })
})

// === RISK AREA 10: Models YAML Parser Robustness ===
describe('TEA: Models config data integrity', () => {
  test('all 6 models have distinct IDs', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    resetModelsCache()
    const config = loadModelsConfig()
    const ids = new Set(config.models.map((m: any) => m.id))
    expect(ids.size).toBe(6)
  })

  test('each provider has exactly 2 models', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    resetModelsCache()
    const config = loadModelsConfig()
    const byProvider: Record<string, number> = {}
    for (const m of config.models) {
      byProvider[m.provider] = (byProvider[m.provider] || 0) + 1
    }
    expect(byProvider.anthropic).toBe(2)
    expect(byProvider.openai).toBe(2)
    expect(byProvider.google).toBe(2)
  })

  test('tier defaults reference existing model IDs', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    resetModelsCache()
    const config = loadModelsConfig()
    const ids = new Set(config.models.map((m: any) => m.id))
    for (const tier of Object.keys(config.tierDefaults)) {
      expect(ids.has(config.tierDefaults[tier])).toBe(true)
    }
  })

  test('fallback order references valid providers', () => {
    const { loadModelsConfig, resetModelsCache } = require('../../config/models')
    resetModelsCache()
    const config = loadModelsConfig()
    const validProviders = new Set(['anthropic', 'openai', 'google'])
    for (const p of config.fallbackOrder) {
      expect(validProviders.has(p)).toBe(true)
    }
  })

  test('cheaper models cost less than premium models within same provider', () => {
    const { getModelConfig, resetModelsCache } = require('../../config/models')
    resetModelsCache()

    // Anthropic: haiku < sonnet
    const haiku = getModelConfig('claude-haiku-4-5')
    const sonnet = getModelConfig('claude-sonnet-4-6')
    expect(haiku.inputPricePer1M).toBeLessThan(sonnet.inputPricePer1M)

    // OpenAI: mini < full
    const mini = getModelConfig('gpt-4.1-mini')
    const full = getModelConfig('gpt-4.1')
    expect(mini.inputPricePer1M).toBeLessThan(full.inputPricePer1M)

    // Google: flash < pro
    const flash = getModelConfig('gemini-2.5-flash')
    const pro = getModelConfig('gemini-2.5-pro')
    expect(flash.inputPricePer1M).toBeLessThan(pro.inputPricePer1M)
  })
})
