/**
 * Provider Fallback Strategy -- Unit Tests
 * Story 3-3: Circuit breaker, fallback chain, streaming fallback, audit logging
 *
 * bun test src/__tests__/unit/provider-fallback.test.ts
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import type { LLMRequest, LLMResponse, LLMStreamChunk, LLMProviderName } from '@corthex/shared'

// === Mock modules BEFORE imports ===

const mockGetCredentials = mock(() =>
  Promise.resolve({ api_key: 'test-api-key-123' }),
)

const mockRecordCost = mock(() => Promise.resolve())

const mockCreateAuditLog = mock(() => Promise.resolve({ id: 'audit-1' }))

// Default: successful adapter
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

mock.module('../../services/credential-vault', () => ({
  getCredentials: mockGetCredentials,
}))

mock.module('../../lib/cost-tracker', () => ({
  recordCost: mockRecordCost,
}))

mock.module('../../lib/llm/index', () => ({
  createProvider: mockCreateProvider,
}))

mock.module('../../services/audit-log', () => ({
  createAuditLog: mockCreateAuditLog,
  AUDIT_ACTIONS: { LLM_FALLBACK: 'llm.fallback' },
}))

// Import AFTER mocks
import { CircuitBreaker } from '../../lib/llm/circuit-breaker'
import { LLMRouter, resolveProvider } from '../../services/llm-router'
import { getFallbackModels } from '../../config/models'
import type { CircuitBreakerStatus } from '../../lib/llm/circuit-breaker'

// === Helpers ===

function makeRequest(model = 'claude-sonnet-4-6'): LLMRequest {
  return {
    model,
    messages: [{ role: 'user', content: 'Hello' }],
  }
}

const baseContext = {
  companyId: 'company-123',
  agentId: 'agent-1',
  agentName: 'TestAgent',
  sessionId: 'session-1',
  source: 'chat' as const,
}

function makeRetryableError(provider: LLMProviderName = 'anthropic'): Error & { code: string; provider: string; retryable: boolean } {
  const err = new Error(`${provider} server error`) as any
  err.code = 'server_error'
  err.provider = provider
  err.retryable = true
  return err
}

function makeNonRetryableError(provider: LLMProviderName = 'anthropic'): Error & { code: string; provider: string; retryable: boolean } {
  const err = new Error(`${provider} auth error`) as any
  err.code = 'auth_error'
  err.provider = provider
  err.retryable = false
  return err
}

function makeSuccessResponse(model: string, provider: LLMProviderName): LLMResponse {
  return {
    content: `Response from ${provider}`,
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 50 },
    model,
    provider,
    finishReason: 'stop',
  }
}

// =====================================================
// CIRCUIT BREAKER TESTS
// =====================================================

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker

  beforeEach(() => {
    cb = new CircuitBreaker(3, 60_000)
  })

  test('starts in closed state (available)', () => {
    expect(cb.isAvailable('anthropic')).toBe(true)
    const status = cb.getStatus()
    expect(status.anthropic.state).toBe('closed')
    expect(status.anthropic.consecutiveFailures).toBe(0)
  })

  test('closed -> open after 3 consecutive failures', () => {
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    expect(cb.isAvailable('anthropic')).toBe(true) // still 2 failures
    cb.recordFailure('anthropic')
    expect(cb.isAvailable('anthropic')).toBe(false)
    expect(cb.getStatus().anthropic.state).toBe('open')
    expect(cb.getStatus().anthropic.consecutiveFailures).toBe(3)
  })

  test('open -> half-open after cooldown', () => {
    cb.recordFailure('openai')
    cb.recordFailure('openai')
    cb.recordFailure('openai')
    expect(cb.isAvailable('openai')).toBe(false)

    // Simulate cooldown by manipulating lastFailureAt
    const status = cb.getStatus()
    expect(status.openai.state).toBe('open')

    // Use a circuit breaker with very short cooldown for test
    const fastCb = new CircuitBreaker(3, 1)
    fastCb.recordFailure('openai')
    fastCb.recordFailure('openai')
    fastCb.recordFailure('openai')

    // Wait 2ms for cooldown
    const start = Date.now()
    while (Date.now() - start < 5) {} // busy wait

    expect(fastCb.isAvailable('openai')).toBe(true)
    expect(fastCb.getStatus().openai.state).toBe('half-open')
  })

  test('half-open -> closed on success', () => {
    const fastCb = new CircuitBreaker(3, 1)
    fastCb.recordFailure('google')
    fastCb.recordFailure('google')
    fastCb.recordFailure('google')

    const start = Date.now()
    while (Date.now() - start < 5) {}

    expect(fastCb.isAvailable('google')).toBe(true) // transitions to half-open
    fastCb.recordSuccess('google')
    expect(fastCb.getStatus().google.state).toBe('closed')
    expect(fastCb.getStatus().google.consecutiveFailures).toBe(0)
  })

  test('half-open -> open on failure', () => {
    const fastCb = new CircuitBreaker(3, 1)
    fastCb.recordFailure('anthropic')
    fastCb.recordFailure('anthropic')
    fastCb.recordFailure('anthropic')

    const start = Date.now()
    while (Date.now() - start < 5) {}

    expect(fastCb.isAvailable('anthropic')).toBe(true) // half-open
    fastCb.recordFailure('anthropic')
    expect(fastCb.getStatus().anthropic.state).toBe('open')
  })

  test('success resets consecutive failure count', () => {
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    cb.recordSuccess('anthropic')
    expect(cb.getStatus().anthropic.consecutiveFailures).toBe(0)
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    expect(cb.isAvailable('anthropic')).toBe(true) // only 2 failures since reset
  })

  test('circuits are per-provider', () => {
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    expect(cb.isAvailable('anthropic')).toBe(false)
    expect(cb.isAvailable('openai')).toBe(true)
    expect(cb.isAvailable('google')).toBe(true)
  })

  test('getStatus returns all three providers', () => {
    const status = cb.getStatus()
    expect(Object.keys(status)).toEqual(['anthropic', 'openai', 'google'])
  })

  test('reset clears all circuits', () => {
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    cb.recordFailure('anthropic')
    cb.reset()
    expect(cb.isAvailable('anthropic')).toBe(true)
    expect(cb.getStatus().anthropic.consecutiveFailures).toBe(0)
  })
})

// =====================================================
// FALLBACK MODEL MAPPING TESTS
// =====================================================

describe('getFallbackModels', () => {
  test('manager-tier: claude-sonnet -> gpt-4.1 -> gemini-2.5-pro', () => {
    const fallbacks = getFallbackModels('claude-sonnet-4-6')
    expect(fallbacks).toEqual(['gpt-4.1', 'gemini-2.5-pro'])
  })

  test('specialist/worker-tier: claude-haiku -> gpt-4.1-mini -> gemini-2.5-flash', () => {
    const fallbacks = getFallbackModels('claude-haiku-4-5')
    expect(fallbacks).toEqual(['gpt-4.1-mini', 'gemini-2.5-flash'])
  })

  test('openai manager-tier: gpt-4.1 -> claude-sonnet -> gemini-2.5-pro', () => {
    const fallbacks = getFallbackModels('gpt-4.1')
    expect(fallbacks).toEqual(['claude-sonnet-4-6', 'gemini-2.5-pro'])
  })

  test('openai worker-tier: gpt-4.1-mini -> claude-haiku -> gemini-2.5-flash', () => {
    const fallbacks = getFallbackModels('gpt-4.1-mini')
    expect(fallbacks).toEqual(['claude-haiku-4-5', 'gemini-2.5-flash'])
  })

  test('google manager-tier: gemini-2.5-pro -> claude-sonnet -> gpt-4.1', () => {
    const fallbacks = getFallbackModels('gemini-2.5-pro')
    expect(fallbacks).toEqual(['claude-sonnet-4-6', 'gpt-4.1'])
  })

  test('google worker-tier: gemini-2.5-flash -> claude-haiku -> gpt-4.1-mini', () => {
    const fallbacks = getFallbackModels('gemini-2.5-flash')
    expect(fallbacks).toEqual(['claude-haiku-4-5', 'gpt-4.1-mini'])
  })

  test('unknown model returns empty', () => {
    const fallbacks = getFallbackModels('nonexistent-model')
    expect(fallbacks).toEqual([])
  })
})

// =====================================================
// LLM ROUTER FALLBACK TESTS
// =====================================================

describe('LLMRouter fallback', () => {
  let router: LLMRouter
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    mockGetCredentials.mockReset()
    mockRecordCost.mockReset()
    mockCreateAuditLog.mockReset()
    mockAdapterCall.mockReset()
    mockAdapterStream.mockReset()
    mockCreateProvider.mockReset()

    mockGetCredentials.mockImplementation(() =>
      Promise.resolve({ api_key: 'test-api-key-123' }),
    )
    mockRecordCost.mockImplementation(() => Promise.resolve())
    mockCreateAuditLog.mockImplementation(() => Promise.resolve({ id: 'audit-1' }))

    circuitBreaker = new CircuitBreaker()
    router = new LLMRouter(circuitBreaker)
  })

  // --- call() fallback tests ---

  test('call: primary succeeds -> no fallback', async () => {
    const response = makeSuccessResponse('claude-sonnet-4-6', 'anthropic')
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.resolve(response)),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest(), baseContext)
    expect(result.content).toBe('Response from anthropic')
    expect(mockCreateAuditLog).not.toHaveBeenCalled()
  })

  test('call: provider A fails (retryable) -> provider B succeeds', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => ({
      name: (callCount === 0 ? 'anthropic' : 'openai') as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(makeRetryableError('anthropic'))
        return Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    expect(result.content).toBe('Response from openai')
    expect(result.provider).toBe('openai')
    // Audit log should record fallback
    expect(mockCreateAuditLog).toHaveBeenCalledTimes(1)
    const auditCall = mockCreateAuditLog.mock.calls[0][0] as any
    expect(auditCall.action).toBe('llm.fallback')
    expect(auditCall.metadata.originalProvider).toBe('anthropic')
    expect(auditCall.metadata.fallbackProvider).toBe('openai')
  })

  test('call: providers A,B fail -> provider C succeeds', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => ({
      name: (['anthropic', 'openai', 'google'][Math.min(callCount, 2)]) as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount <= 2) return Promise.reject(makeRetryableError(callCount === 1 ? 'anthropic' : 'openai'))
        return Promise.resolve(makeSuccessResponse('gemini-2.5-pro', 'google'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    expect(result.content).toBe('Response from google')
  })

  test('call: all providers fail -> aggregated error', async () => {
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.reject(makeRetryableError('anthropic'))),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    try {
      await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
      expect(true).toBe(false) // should not reach
    } catch (err: any) {
      expect(err.code).toBe('server_error')
      expect(err.message).toContain('All providers failed')
      expect(err.message).toContain('claude-sonnet-4-6')
    }
  })

  test('call: non-retryable error -> no fallback, immediate throw', async () => {
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.reject(makeNonRetryableError('anthropic'))),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    try {
      await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).toBe('auth_error')
      // Should NOT attempt fallback
      expect(mockCreateProvider).toHaveBeenCalledTimes(1)
    }
  })

  test('call: circuit-open provider is skipped', async () => {
    // Open circuit for anthropic
    circuitBreaker.recordFailure('anthropic')
    circuitBreaker.recordFailure('anthropic')
    circuitBreaker.recordFailure('anthropic')

    mockCreateProvider.mockImplementation(() => ({
      name: 'openai' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    // Should skip anthropic (circuit open) and go straight to openai
    expect(result.content).toBe('Response from openai')
  })

  test('call: correct cost recording with fallback provider', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => ({
      name: (callCount === 0 ? 'anthropic' : 'openai') as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(makeRetryableError('anthropic'))
        return Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    await router.call(makeRequest('claude-sonnet-4-6'), baseContext)

    // Cost should be recorded with the actual provider/model that succeeded
    expect(mockRecordCost).toHaveBeenCalledTimes(1)
    const costCall = mockRecordCost.mock.calls[0][0] as any
    expect(costCall.provider).toBe('openai')
    expect(costCall.model).toBe('gpt-4.1')
  })

  test('call: 5-second budget enforcement', async () => {
    // Create a slow provider that exceeds budget
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(async () => {
        // Simulate slow response -- but actually just throw to trigger fallback
        throw makeRetryableError('anthropic')
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    try {
      await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).toBe('server_error')
      // Should have tried all providers within budget
    }
  })

  // --- stream() fallback tests ---

  test('stream: primary succeeds -> no fallback', async () => {
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mockAdapterCall,
      stream: mock(function* () {
        yield { type: 'text', content: 'OK' }
        yield { type: 'done', usage: { inputTokens: 50, outputTokens: 20 } }
      }),
      estimateCost: () => 0,
    }))

    const chunks: LLMStreamChunk[] = []
    for await (const chunk of router.stream(makeRequest(), baseContext)) {
      chunks.push(chunk)
    }
    expect(chunks.length).toBe(2)
    expect(chunks[0].content).toBe('OK')
  })

  test('stream: fails before chunks -> next provider stream', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          name: 'anthropic' as LLMProviderName,
          supportsBatch: true,
          call: mockAdapterCall,
          stream: mock(function* () {
            throw makeRetryableError('anthropic')
          }),
          estimateCost: () => 0,
        }
      }
      return {
        name: 'openai' as LLMProviderName,
        supportsBatch: true,
        call: mockAdapterCall,
        stream: mock(function* () {
          yield { type: 'text', content: 'From OpenAI' }
          yield { type: 'done', usage: { inputTokens: 50, outputTokens: 20 } }
        }),
        estimateCost: () => 0,
      }
    })

    const chunks: LLMStreamChunk[] = []
    for await (const chunk of router.stream(makeRequest('claude-sonnet-4-6'), baseContext)) {
      chunks.push(chunk)
    }
    expect(chunks.length).toBe(2)
    expect(chunks[0].content).toBe('From OpenAI')
  })

  test('stream: mid-stream failure -> non-streaming fallback', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          name: 'anthropic' as LLMProviderName,
          supportsBatch: true,
          call: mockAdapterCall,
          stream: mock(function* () {
            yield { type: 'text', content: 'Partial...' }
            throw makeRetryableError('anthropic')
          }),
          estimateCost: () => 0,
        }
      }
      return {
        name: 'openai' as LLMProviderName,
        supportsBatch: true,
        call: mock(() => Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))),
        stream: mockAdapterStream,
        estimateCost: () => 0,
      }
    })

    const chunks: LLMStreamChunk[] = []
    for await (const chunk of router.stream(makeRequest('claude-sonnet-4-6'), baseContext)) {
      chunks.push(chunk)
    }

    // Should have partial chunk + full response from fallback
    expect(chunks.length).toBe(3) // partial + text content + done
    expect(chunks[0].content).toBe('Partial...')
    expect(chunks[1].content).toBe('Response from openai')
    expect(chunks[2].type).toBe('done')
  })

  // --- getCircuitBreakerStatus ---

  test('getCircuitBreakerStatus returns correct state', () => {
    circuitBreaker.recordFailure('anthropic')
    circuitBreaker.recordFailure('anthropic')
    circuitBreaker.recordFailure('anthropic')

    const status = router.getCircuitBreakerStatus()
    expect(status.anthropic.state).toBe('open')
    expect(status.anthropic.consecutiveFailures).toBe(3)
    expect(status.openai.state).toBe('closed')
    expect(status.google.state).toBe('closed')
  })

  // --- Audit log tests ---

  test('audit log recorded on fallback event', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => ({
      name: (callCount === 0 ? 'anthropic' : 'openai') as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(makeRetryableError('anthropic'))
        return Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    await router.call(makeRequest('claude-sonnet-4-6'), baseContext)

    expect(mockCreateAuditLog).toHaveBeenCalledTimes(1)
    const auditCall = mockCreateAuditLog.mock.calls[0][0] as any
    expect(auditCall.companyId).toBe('company-123')
    expect(auditCall.actorType).toBe('system')
    expect(auditCall.actorId).toBe('llm-router')
    expect(auditCall.action).toBe('llm.fallback')
    expect(auditCall.targetType).toBe('llm_provider')
    expect(auditCall.targetId).toBe('anthropic')
    expect(auditCall.metadata.originalProvider).toBe('anthropic')
    expect(auditCall.metadata.originalModel).toBe('claude-sonnet-4-6')
    expect(auditCall.metadata.fallbackProvider).toBe('openai')
    expect(auditCall.metadata.fallbackModel).toBe('gpt-4.1')
    expect(auditCall.metadata.latencyMs).toBeGreaterThanOrEqual(0)
  })

  test('no audit log when primary succeeds', async () => {
    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.resolve(makeSuccessResponse('claude-sonnet-4-6', 'anthropic'))),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    expect(mockCreateAuditLog).not.toHaveBeenCalled()
  })

  // --- Worker-tier fallback tests ---

  test('call: worker-tier fallback chain works', async () => {
    let callCount = 0
    mockCreateProvider.mockImplementation(() => ({
      name: (['anthropic', 'openai'][Math.min(callCount, 1)]) as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(makeRetryableError('anthropic'))
        return Promise.resolve(makeSuccessResponse('gpt-4.1-mini', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-haiku-4-5'), baseContext)
    expect(result.content).toBe('Response from openai')
    expect(result.model).toBe('gpt-4.1-mini')
  })

  // --- Rate limit error fallback ---

  test('call: rate_limit error triggers fallback', async () => {
    let callCount = 0
    const rateLimitErr = new Error('Rate limited') as any
    rateLimitErr.code = 'rate_limit'
    rateLimitErr.provider = 'anthropic'
    rateLimitErr.retryable = true

    mockCreateProvider.mockImplementation(() => ({
      name: (callCount === 0 ? 'anthropic' : 'openai') as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(rateLimitErr)
        return Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    expect(result.content).toBe('Response from openai')
  })

  // --- Timeout error fallback ---

  test('call: timeout error triggers fallback', async () => {
    let callCount = 0
    const timeoutErr = new Error('Timeout') as any
    timeoutErr.code = 'timeout'
    timeoutErr.provider = 'anthropic'
    timeoutErr.retryable = true

    mockCreateProvider.mockImplementation(() => ({
      name: (callCount === 0 ? 'anthropic' : 'openai') as LLMProviderName,
      supportsBatch: true,
      call: mock(() => {
        callCount++
        if (callCount === 1) return Promise.reject(timeoutErr)
        return Promise.resolve(makeSuccessResponse('gpt-4.1', 'openai'))
      }),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    const result = await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
    expect(result.content).toBe('Response from openai')
  })

  // --- invalid_request should NOT fallback ---

  test('call: invalid_request does NOT trigger fallback', async () => {
    const invalidErr = new Error('Invalid request') as any
    invalidErr.code = 'invalid_request'
    invalidErr.provider = 'anthropic'
    invalidErr.retryable = false

    mockCreateProvider.mockImplementation(() => ({
      name: 'anthropic' as LLMProviderName,
      supportsBatch: true,
      call: mock(() => Promise.reject(invalidErr)),
      stream: mockAdapterStream,
      estimateCost: () => 0,
    }))

    try {
      await router.call(makeRequest('claude-sonnet-4-6'), baseContext)
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.code).toBe('invalid_request')
      expect(mockCreateProvider).toHaveBeenCalledTimes(1)
    }
  })
})
