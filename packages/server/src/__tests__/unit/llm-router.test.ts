/**
 * LLM Router + 3-Tier Model Assignment -- Unit Tests
 * Story 3-2: LLMRouter routing, resolveModel, resolveProvider, cost recording
 *
 * bun test src/__tests__/unit/llm-router.test.ts
 */
import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProviderName } from '@corthex/shared'

// === Mock modules BEFORE imports ===

// Mock credential-vault
const mockGetCredentials = mock(() =>
  Promise.resolve({ api_key: 'test-api-key-123' }),
)

// Mock cost-tracker
const mockRecordCost = mock(() => Promise.resolve())

// Mock createProvider -- returns a mock adapter
const mockAdapterCall = mock((): Promise<LLMResponse> =>
  Promise.resolve({
    content: 'Hello from mock',
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 50 },
    model: 'claude-sonnet-4-6',
    provider: 'anthropic' as LLMProviderName,
    finishReason: 'stop' as const,
  }),
)

const mockAdapterStream = mock(function* (): Generator<LLMStreamChunk> {
  yield { type: 'text', content: 'Hello' }
  yield { type: 'text', content: ' world' }
  yield { type: 'done', usage: { inputTokens: 80, outputTokens: 40 } }
})

const mockCreateProvider = mock(() => ({
  name: 'anthropic' as LLMProviderName,
  supportsBatch: true,
  call: mockAdapterCall,
  stream: mockAdapterStream,
  estimateCost: () => 0.001,
}))

// Apply mocks
mock.module('../../services/credential-vault', () => ({
  getCredentials: mockGetCredentials,
}))

mock.module('../../lib/cost-tracker', () => ({
  recordCost: mockRecordCost,
  calculateCostMicro: () => 450,
  microToUsd: (m: number) => m / 1_000_000,
}))

mock.module('../../lib/llm/index', () => ({
  createProvider: mockCreateProvider,
}))

// NOW import the module under test
import { LLMRouter, resolveModel, resolveProvider, llmRouter } from '../../services/llm-router'
import type { LLMRouterContext } from '../../services/llm-router'

// === Test Helpers ===

function makeContext(overrides?: Partial<LLMRouterContext>): LLMRouterContext {
  return {
    companyId: 'company-uuid-1234',
    agentId: 'agent-uuid-5678',
    agentName: 'TestAgent',
    sessionId: 'session-uuid-9012',
    source: 'chat',
    ...overrides,
  }
}

function makeRequest(overrides?: Partial<LLMRequest>): LLMRequest {
  return {
    model: 'claude-sonnet-4-6',
    messages: [{ role: 'user', content: 'Hello' }],
    ...overrides,
  }
}

// === Tests ===

describe('resolveModel', () => {
  test('manager tier gets claude-sonnet-4-6 by default', () => {
    const result = resolveModel({ tier: 'manager', modelName: null })
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.reason).toBe('tier-default')
  })

  test('manager with schema default modelName still gets sonnet (tier default)', () => {
    const result = resolveModel({ tier: 'manager', modelName: 'claude-haiku-4-5' })
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.reason).toBe('tier-default')
  })

  test('specialist tier gets claude-haiku-4-5 by default', () => {
    const result = resolveModel({ tier: 'specialist', modelName: null })
    expect(result.model).toBe('claude-haiku-4-5')
    expect(result.reason).toBe('tier-default')
  })

  test('worker tier gets claude-haiku-4-5 by default', () => {
    const result = resolveModel({ tier: 'worker', modelName: null })
    expect(result.model).toBe('claude-haiku-4-5')
    expect(result.reason).toBe('tier-default')
  })

  test('specialist with schema default modelName uses tier default', () => {
    const result = resolveModel({ tier: 'specialist', modelName: 'claude-haiku-4-5' })
    expect(result.model).toBe('claude-haiku-4-5')
    expect(result.reason).toBe('tier-default')
  })

  test('manual override: agent with explicit non-default model', () => {
    const result = resolveModel({ tier: 'specialist', modelName: 'gpt-4.1' })
    expect(result.model).toBe('gpt-4.1')
    expect(result.reason).toBe('manual-override')
  })

  test('manual override: manager set to haiku explicitly', () => {
    // If admin explicitly sets a manager to gpt-4.1-mini, it's an override
    const result = resolveModel({ tier: 'manager', modelName: 'gpt-4.1-mini' })
    expect(result.model).toBe('gpt-4.1-mini')
    expect(result.reason).toBe('manual-override')
  })

  test('manual override: worker set to sonnet', () => {
    const result = resolveModel({ tier: 'worker', modelName: 'claude-sonnet-4-6' })
    expect(result.model).toBe('claude-sonnet-4-6')
    expect(result.reason).toBe('manual-override')
  })

  test('null modelName falls back to tier default', () => {
    const result = resolveModel({ tier: 'manager', modelName: null })
    expect(result.reason).toBe('tier-default')
  })

  test('empty string modelName falls back to tier default', () => {
    const result = resolveModel({ tier: 'specialist', modelName: '' as any })
    expect(result.reason).toBe('tier-default')
  })
})

describe('resolveProvider', () => {
  test('claude-sonnet-4-6 resolves to anthropic', () => {
    expect(resolveProvider('claude-sonnet-4-6')).toBe('anthropic')
  })

  test('claude-haiku-4-5 resolves to anthropic', () => {
    expect(resolveProvider('claude-haiku-4-5')).toBe('anthropic')
  })

  test('gpt-4.1 resolves to openai', () => {
    expect(resolveProvider('gpt-4.1')).toBe('openai')
  })

  test('gpt-4.1-mini resolves to openai', () => {
    expect(resolveProvider('gpt-4.1-mini')).toBe('openai')
  })

  test('gemini-2.5-pro resolves to google', () => {
    expect(resolveProvider('gemini-2.5-pro')).toBe('google')
  })

  test('gemini-2.5-flash resolves to google', () => {
    expect(resolveProvider('gemini-2.5-flash')).toBe('google')
  })

  test('unknown model throws LLMError', () => {
    expect(() => resolveProvider('unknown-model-xyz')).toThrow('Unknown model: unknown-model-xyz')
  })
})

describe('LLMRouter.call', () => {
  let router: LLMRouter

  beforeEach(() => {
    router = new LLMRouter()
    mockGetCredentials.mockClear()
    mockRecordCost.mockClear()
    mockCreateProvider.mockClear()
    mockAdapterCall.mockClear()

    // Reset default mock returns
    mockGetCredentials.mockImplementation(() => Promise.resolve({ api_key: 'test-key' }))
    mockAdapterCall.mockImplementation(() =>
      Promise.resolve({
        content: 'Hello',
        toolCalls: [],
        usage: { inputTokens: 100, outputTokens: 50 },
        model: 'claude-sonnet-4-6',
        provider: 'anthropic' as LLMProviderName,
        finishReason: 'stop' as const,
      }),
    )
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mockAdapterCall,
      stream: mockAdapterStream,
      estimateCost: () => 0.001,
    }))
  })

  test('routes claude model to anthropic adapter', async () => {
    const response = await router.call(makeRequest(), makeContext())

    expect(response.content).toBe('Hello')
    expect(mockGetCredentials).toHaveBeenCalledWith('company-uuid-1234', 'anthropic')
    expect(mockCreateProvider).toHaveBeenCalledWith('anthropic', 'test-key')
    expect(mockAdapterCall).toHaveBeenCalledTimes(1)
  })

  test('routes gpt model to openai adapter', async () => {
    const request = makeRequest({ model: 'gpt-4.1' })
    await router.call(request, makeContext())

    expect(mockGetCredentials).toHaveBeenCalledWith('company-uuid-1234', 'openai')
    expect(mockCreateProvider).toHaveBeenCalledWith('openai', 'test-key')
  })

  test('routes gemini model to google adapter with google_ai credential key', async () => {
    const request = makeRequest({ model: 'gemini-2.5-pro' })
    await router.call(request, makeContext())

    // Should map 'google' -> 'google_ai' for credential vault
    expect(mockGetCredentials).toHaveBeenCalledWith('company-uuid-1234', 'google_ai')
    expect(mockCreateProvider).toHaveBeenCalledWith('google', 'test-key')
  })

  test('records cost after successful call', async () => {
    await router.call(makeRequest(), makeContext())

    // Wait for fire-and-forget to settle
    await new Promise(r => setTimeout(r, 10))

    expect(mockRecordCost).toHaveBeenCalledWith({
      companyId: 'company-uuid-1234',
      agentId: 'agent-uuid-5678',
      sessionId: 'session-uuid-9012',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })
  })

  test('propagates adapter errors as LLMError', async () => {
    mockAdapterCall.mockImplementation(() =>
      Promise.reject(new Error('Rate limit exceeded')),
    )

    try {
      await router.call(makeRequest(), makeContext())
      expect(true).toBe(false) // should not reach
    } catch (err: any) {
      expect(err.message).toBe('Rate limit exceeded')
      expect(err.provider).toBe('anthropic')
      expect(err.code).toBe('unknown')
    }
  })

  test('throws when no API key found', async () => {
    mockGetCredentials.mockImplementation(() => Promise.resolve({}))

    try {
      await router.call(makeRequest(), makeContext())
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).toBe('auth_error')
      expect(err.message).toContain('No API key found')
    }
  })

  test('credential lookup uses companyId from context', async () => {
    const ctx = makeContext({ companyId: 'different-company-id' })
    await router.call(makeRequest(), ctx)

    expect(mockGetCredentials).toHaveBeenCalledWith('different-company-id', 'anthropic')
  })

  test('does not expose API keys in error messages', async () => {
    mockAdapterCall.mockImplementation(() =>
      Promise.reject(new Error('Invalid API key: sk-ant-api-abc123xyz')),
    )

    try {
      await router.call(makeRequest(), makeContext())
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.message).not.toContain('sk-ant-api-abc123xyz')
      expect(err.message).toContain('sk-***')
    }
  })

  test('handles credentials with apiKey field (camelCase)', async () => {
    mockGetCredentials.mockImplementation(() =>
      Promise.resolve({ apiKey: 'camel-case-key' }),
    )

    await router.call(makeRequest(), makeContext())
    expect(mockCreateProvider).toHaveBeenCalledWith('anthropic', 'camel-case-key')
  })

  test('returns full LLMResponse with all fields', async () => {
    const response = await router.call(makeRequest(), makeContext())

    expect(response).toHaveProperty('content')
    expect(response).toHaveProperty('toolCalls')
    expect(response).toHaveProperty('usage')
    expect(response).toHaveProperty('model')
    expect(response).toHaveProperty('provider')
    expect(response).toHaveProperty('finishReason')
  })
})

describe('LLMRouter.stream', () => {
  let router: LLMRouter

  beforeEach(() => {
    router = new LLMRouter()
    mockGetCredentials.mockClear()
    mockRecordCost.mockClear()
    mockCreateProvider.mockClear()

    mockGetCredentials.mockImplementation(() => Promise.resolve({ api_key: 'test-key' }))

    // Create async generator mock for stream
    const streamMock = async function* (): AsyncGenerator<LLMStreamChunk> {
      yield { type: 'text', content: 'Hello' }
      yield { type: 'text', content: ' world' }
      yield { type: 'done', usage: { inputTokens: 80, outputTokens: 40 } }
    }

    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mockAdapterCall,
      stream: streamMock,
      estimateCost: () => 0.001,
    }))
  })

  test('yields all chunks from adapter', async () => {
    const chunks: LLMStreamChunk[] = []
    for await (const chunk of router.stream(makeRequest(), makeContext())) {
      chunks.push(chunk)
    }

    expect(chunks).toHaveLength(3)
    expect(chunks[0].type).toBe('text')
    expect(chunks[0].content).toBe('Hello')
    expect(chunks[1].content).toBe(' world')
    expect(chunks[2].type).toBe('done')
  })

  test('records cost after stream completes', async () => {
    const chunks: LLMStreamChunk[] = []
    for await (const chunk of router.stream(makeRequest(), makeContext())) {
      chunks.push(chunk)
    }

    // Wait for fire-and-forget
    await new Promise(r => setTimeout(r, 10))

    expect(mockRecordCost).toHaveBeenCalledWith({
      companyId: 'company-uuid-1234',
      agentId: 'agent-uuid-5678',
      sessionId: 'session-uuid-9012',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: 80,
      outputTokens: 40,
      source: 'chat',
    })
  })

  test('routes streaming to correct provider', async () => {
    const request = makeRequest({ model: 'gpt-4.1' })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of router.stream(request, makeContext())) {
      // consume
    }

    expect(mockGetCredentials).toHaveBeenCalledWith('company-uuid-1234', 'openai')
  })
})

describe('LLMRouter singleton', () => {
  test('llmRouter is an instance of LLMRouter', () => {
    expect(llmRouter).toBeInstanceOf(LLMRouter)
  })
})

describe('3-Tier Model Assignment Integration', () => {
  test('manager agent resolves to sonnet, routes to anthropic', () => {
    const resolution = resolveModel({ tier: 'manager', modelName: null })
    expect(resolution.model).toBe('claude-sonnet-4-6')

    const provider = resolveProvider(resolution.model)
    expect(provider).toBe('anthropic')
  })

  test('specialist agent resolves to haiku, routes to anthropic', () => {
    const resolution = resolveModel({ tier: 'specialist', modelName: null })
    expect(resolution.model).toBe('claude-haiku-4-5')

    const provider = resolveProvider(resolution.model)
    expect(provider).toBe('anthropic')
  })

  test('worker agent resolves to haiku, routes to anthropic', () => {
    const resolution = resolveModel({ tier: 'worker', modelName: null })
    expect(resolution.model).toBe('claude-haiku-4-5')

    const provider = resolveProvider(resolution.model)
    expect(provider).toBe('anthropic')
  })

  test('manual override to gpt-4.1 routes to openai', () => {
    const resolution = resolveModel({ tier: 'specialist', modelName: 'gpt-4.1' })
    expect(resolution.model).toBe('gpt-4.1')
    expect(resolution.reason).toBe('manual-override')

    const provider = resolveProvider(resolution.model)
    expect(provider).toBe('openai')
  })

  test('manual override to gemini routes to google', () => {
    const resolution = resolveModel({ tier: 'worker', modelName: 'gemini-2.5-flash' })
    expect(resolution.model).toBe('gemini-2.5-flash')
    expect(resolution.reason).toBe('manual-override')

    const provider = resolveProvider(resolution.model)
    expect(provider).toBe('google')
  })
})

describe('Routing Decision Logging', () => {
  let router: LLMRouter
  let logSpy: ReturnType<typeof mock>

  beforeEach(() => {
    router = new LLMRouter()
    logSpy = mock(() => {})
    console.log = logSpy as any

    mockGetCredentials.mockImplementation(() => Promise.resolve({ api_key: 'test-key' }))
    mockAdapterCall.mockImplementation(() =>
      Promise.resolve({
        content: 'ok',
        toolCalls: [],
        usage: { inputTokens: 10, outputTokens: 5 },
        model: 'claude-sonnet-4-6',
        provider: 'anthropic' as LLMProviderName,
        finishReason: 'stop' as const,
      }),
    )
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mockAdapterCall,
      stream: mockAdapterStream,
      estimateCost: () => 0.001,
    }))
  })

  test('logs routing decision after successful call', async () => {
    await router.call(makeRequest(), makeContext({ agentName: 'CFO' }))

    const logCalls = (logSpy as any).mock.calls as any[][]
    const routingLog = logCalls.find((c: any[]) => typeof c[0] === 'string' && c[0].includes('[LLMRouter]'))
    expect(routingLog).toBeDefined()
    expect(routingLog![0]).toContain('model=claude-sonnet-4-6')
    expect(routingLog![0]).toContain('provider=anthropic')
    expect(routingLog![0]).toContain('agent=CFO')
  })
})
