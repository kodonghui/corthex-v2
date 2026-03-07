import { describe, it, expect, beforeEach } from 'bun:test'
import type { LLMRequest, LLMStreamChunk } from '@corthex/shared'

// === Mock Setup with async pattern ===

let budgetCheckResult = { allowed: true, reason: undefined as string | undefined }

const mockCallResult = {
  content: 'Hello world',
  usage: { inputTokens: 100, outputTokens: 50 },
  toolCalls: [],
  finishReason: 'end_turn' as const,
}

const { LLMRouter } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../services/budget-guard', () => ({
    checkBudget: async () => ({
      allowed: budgetCheckResult.allowed,
      reason: budgetCheckResult.reason,
      currentMonthSpendMicro: 400_000_000,
      currentDaySpendMicro: 15_000_000,
      monthlyBudgetMicro: 500_000_000,
      dailyBudgetMicro: 20_000_000,
      warningEmitted: false,
      resetDate: '2026-04-01',
    }),
  }))

  mock.module('../../config/models', () => ({
    getModelConfig: (model: string) => ({
      provider: 'anthropic',
      displayName: model,
      inputPricePer1M: 3,
      outputPricePer1M: 15,
    }),
    getTierDefaultModel: () => 'claude-haiku-4-5',
    getFallbackModels: () => [],
  }))

  mock.module('../../lib/llm/index', () => ({
    createProvider: () => ({
      call: async () => mockCallResult,
      stream: async function* () {
        yield { type: 'text', content: 'Hello' }
        yield { type: 'done', usage: { inputTokens: 100, outputTokens: 50 } }
      },
    }),
  }))

  mock.module('../../services/credential-vault', () => ({
    getCredentials: async () => ({ api_key: 'sk-test-key' }),
  }))

  mock.module('../../lib/cost-tracker', () => ({
    recordCost: async () => {},
    microToUsd: (micro: number) => micro / 1_000_000,
  }))

  mock.module('../../services/audit-log', () => ({
    createAuditLog: async () => {},
    AUDIT_ACTIONS: { LLM_FALLBACK: 'llm_fallback' },
  }))

  mock.module('../../lib/llm/circuit-breaker', () => ({
    CircuitBreaker: class {
      isAvailable() { return true }
      recordSuccess() {}
      recordFailure() {}
      getStatus() { return {} }
    },
  }))

  return import('../../services/llm-router')
})()

// === Tests ===

describe('LLM Router Budget Integration', () => {
  let router: InstanceType<typeof LLMRouter>

  const context = {
    companyId: 'test-company',
    agentId: 'test-agent',
    source: 'chat' as const,
  }

  const request: LLMRequest = {
    model: 'claude-haiku-4-5',
    systemPrompt: 'Test',
    messages: [{ role: 'user' as const, content: 'Hi' }],
  }

  beforeEach(() => {
    router = new LLMRouter()
    budgetCheckResult = { allowed: true, reason: undefined }
  })

  describe('call()', () => {
    it('proceeds normally when budget is allowed', async () => {
      budgetCheckResult = { allowed: true, reason: undefined }
      const response = await router.call(request, context)
      expect(response.content).toBe('Hello world')
    })

    it('throws BUDGET_EXCEEDED when monthly budget exceeded', async () => {
      budgetCheckResult = { allowed: false, reason: 'monthly_exceeded' }

      try {
        await router.call(request, context)
        throw new Error('Should have thrown')
      } catch (err: any) {
        expect(err.code).toBe('BUDGET_EXCEEDED')
        expect(err.retryable).toBe(false)
        expect(err.currentSpend).toBeDefined()
        expect(err.budget).toBeDefined()
        expect(err.resetDate).toBe('2026-04-01')
      }
    })

    it('throws BUDGET_EXCEEDED when daily budget exceeded', async () => {
      budgetCheckResult = { allowed: false, reason: 'daily_exceeded' }

      try {
        await router.call(request, context)
        throw new Error('Should have thrown')
      } catch (err: any) {
        expect(err.code).toBe('BUDGET_EXCEEDED')
        expect(err.message).toContain('일일')
      }
    })
  })

  describe('stream()', () => {
    it('streams normally when budget is allowed', async () => {
      budgetCheckResult = { allowed: true, reason: undefined }
      const chunks: LLMStreamChunk[] = []
      for await (const chunk of router.stream(request, context)) {
        chunks.push(chunk)
      }
      expect(chunks.length).toBeGreaterThan(0)
    })

    it('throws BUDGET_EXCEEDED when budget exceeded on stream', async () => {
      budgetCheckResult = { allowed: false, reason: 'monthly_exceeded' }

      try {
        const gen = router.stream(request, context)
        await gen.next()
        throw new Error('Should have thrown')
      } catch (err: any) {
        expect(err.code).toBe('BUDGET_EXCEEDED')
      }
    })
  })
})
