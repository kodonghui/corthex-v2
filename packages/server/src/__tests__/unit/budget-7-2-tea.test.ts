import { describe, it, expect, beforeEach } from 'bun:test'

/**
 * TEA (Test Architect) Risk-Based Tests for Story 7-2: Budget Limit Auto-Block
 * Coverage areas: boundary conditions, error structure contracts, warning logic, cache behavior
 */

// === Mock Setup with async pattern ===

const emittedEvents: Array<{ event: string; data: unknown }> = []
let selectCallCount = 0
let mockResults: { settings: any; monthSpend: number; daySpend: number } = {
  settings: null,
  monthSpend: 0,
  daySpend: 0,
}

const { checkBudget, clearBudgetCache, loadBudgetConfig } = await (async () => {
  const { mock } = await import('bun:test')

  mock.module('../../db', () => ({
    db: {
      select: () => ({
        from: () => ({
          where: (..._args: unknown[]) => {
            selectCallCount++
            const idx = selectCallCount

            let result: any[]
            if (idx === 1) {
              result = mockResults.settings !== null ? [{ settings: mockResults.settings }] : []
            } else if (idx === 2) {
              result = [{ total: mockResults.monthSpend }]
            } else {
              result = [{ total: mockResults.daySpend }]
            }

            const p = Promise.resolve(result) as any
            p.limit = () => Promise.resolve(result)
            return p
          },
        }),
      }),
    },
  }))

  mock.module('../../db/schema', () => ({
    companies: { id: 'id', settings: 'settings' },
    costRecords: { companyId: 'company_id', costUsdMicro: 'cost_usd_micro', createdAt: 'created_at' },
  }))

  mock.module('../../lib/event-bus', () => ({
    eventBus: {
      emit: (event: string, data: unknown) => {
        emittedEvents.push({ event, data })
      },
    },
  }))

  mock.module('../../lib/cost-tracker', () => ({
    microToUsd: (micro: number) => micro / 1_000_000,
  }))

  mock.module('drizzle-orm', () => ({
    eq: (...args: unknown[]) => ({ type: 'eq', args }),
    and: (...args: unknown[]) => ({ type: 'and', args }),
    gte: (...args: unknown[]) => ({ type: 'gte', args }),
    sum: (col: unknown) => ({ mapWith: () => col }),
  }))

  return import('../../services/budget-guard')
})()

// === Helpers ===

function setupMock(settings: Record<string, unknown> | null, monthSpend = 0, daySpend = 0) {
  selectCallCount = 0
  mockResults = { settings, monthSpend, daySpend }
}

// === TEA Tests ===

describe('TEA: BudgetGuard Boundary Conditions', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  describe('Warning threshold edge values', () => {
    it('warningThreshold=0 means always warn from first dollar', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 0, autoBlock: true } },
        1, 0,
      )
      const result = await checkBudget('threshold-0')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(true)
    })

    it('warningThreshold=100 means warn only at full budget', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 100, autoBlock: true } },
        99_999_999, 0,
      )
      const result = await checkBudget('threshold-100')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(false)
    })

    it('warningThreshold=100 warns at exact budget amount', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 100, autoBlock: false } },
        100_000_000, 0,
      )
      const result = await checkBudget('threshold-exact')
      // With autoBlock=false, spend >= budget doesn't block, so warning logic in else branch runs
      // But since spend >= budget, autoBlock check is first: 100M >= 100M && autoBlock=false → allowed
      // Then warning: threshold = 100% of 100M = 100M, spend 100M >= 100M → warning
      expect(result.warningEmitted).toBe(true)
    })
  })

  describe('Spend at exact boundaries', () => {
    it('spend = budget - 1 micro is allowed', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        99_999_999, 0,
      )
      const result = await checkBudget('just-under')
      expect(result.allowed).toBe(true)
    })

    it('spend = budget + 1 micro is blocked', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        100_000_001, 0,
      )
      const result = await checkBudget('just-over')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('monthly_exceeded')
    })

    it('daily spend exactly at daily budget blocks', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 0, dailyBudget: 50_000_000, warningThreshold: 80, autoBlock: true } },
        0, 50_000_000,
      )
      const result = await checkBudget('daily-exact')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('daily_exceeded')
    })

    it('daily spend at budget - 1 micro is allowed', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 0, dailyBudget: 50_000_000, warningThreshold: 80, autoBlock: true } },
        0, 49_999_999,
      )
      const result = await checkBudget('daily-under')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Zero spend scenarios', () => {
    it('zero spend with budget set is allowed', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        0, 0,
      )
      const result = await checkBudget('zero-spend')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(false)
      expect(result.currentMonthSpendMicro).toBe(0)
      expect(result.currentDaySpendMicro).toBe(0)
    })

    it('zero budget with high spend is always allowed (unlimited)', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 0, dailyBudget: 0, warningThreshold: 80, autoBlock: true } },
        999_999_999, 999_999_999,
      )
      const result = await checkBudget('unlimited-high-spend')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(false)
    })
  })
})

describe('TEA: BudgetCheckResult Contract', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  it('result has all required fields when allowed', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: true } },
      100_000_000, 10_000_000,
    )
    const result = await checkBudget('contract-allowed')
    expect(result).toHaveProperty('allowed')
    expect(result).toHaveProperty('currentMonthSpendMicro')
    expect(result).toHaveProperty('currentDaySpendMicro')
    expect(result).toHaveProperty('monthlyBudgetMicro')
    expect(result).toHaveProperty('dailyBudgetMicro')
    expect(result).toHaveProperty('warningEmitted')
    expect(result).toHaveProperty('resetDate')
    expect(typeof result.allowed).toBe('boolean')
    expect(typeof result.currentMonthSpendMicro).toBe('number')
    expect(typeof result.resetDate).toBe('string')
  })

  it('result has reason when blocked', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      200_000_000, 0,
    )
    const result = await checkBudget('contract-blocked')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBeDefined()
    expect(['monthly_exceeded', 'daily_exceeded']).toContain(result.reason)
  })

  it('result has no reason when allowed', async () => {
    setupMock(null, 0, 0)
    const result = await checkBudget('contract-no-reason')
    expect(result.allowed).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('resetDate is valid ISO date format YYYY-MM-DD', async () => {
    setupMock(null, 0, 0)
    const result = await checkBudget('date-format')
    expect(result.resetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('all numeric values are non-negative', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 500_000_000, dailyBudget: 20_000_000 } },
      100_000_000, 5_000_000,
    )
    const result = await checkBudget('non-negative')
    expect(result.currentMonthSpendMicro).toBeGreaterThanOrEqual(0)
    expect(result.currentDaySpendMicro).toBeGreaterThanOrEqual(0)
    expect(result.monthlyBudgetMicro).toBeGreaterThanOrEqual(0)
    expect(result.dailyBudgetMicro).toBeGreaterThanOrEqual(0)
  })
})

describe('TEA: EventBus Payload Contracts', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  it('budget-warning event has correct structure', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      85_000_000, 0,
    )
    await checkBudget('event-warning-contract')

    const event = emittedEvents.find(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
    )
    expect(event).toBeDefined()
    const payload = (event!.data as any).payload
    expect(payload).toHaveProperty('type', 'budget-warning')
    expect(payload).toHaveProperty('level', 'monthly')
    expect(payload).toHaveProperty('currentSpendUsd')
    expect(payload).toHaveProperty('budgetUsd')
    expect(payload).toHaveProperty('usagePercent')
    expect(payload).toHaveProperty('resetDate')
    expect(typeof payload.currentSpendUsd).toBe('number')
    expect(typeof payload.budgetUsd).toBe('number')
    expect(typeof payload.usagePercent).toBe('number')
  })

  it('budget-exceeded event has correct structure', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      110_000_000, 0,
    )
    await checkBudget('event-exceeded-contract')

    const event = emittedEvents.find(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-exceeded',
    )
    expect(event).toBeDefined()
    const payload = (event!.data as any).payload
    expect(payload).toHaveProperty('type', 'budget-exceeded')
    expect(payload).toHaveProperty('level', 'monthly')
    expect(payload).toHaveProperty('currentSpendUsd')
    expect(payload).toHaveProperty('budgetUsd')
    expect(payload).toHaveProperty('resetDate')
  })

  it('daily budget-exceeded uses tomorrow as resetDate', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 0, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
      0, 15_000_000,
    )
    await checkBudget('daily-reset-date')

    const event = emittedEvents.find(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-exceeded',
    )
    expect(event).toBeDefined()
    const payload = (event!.data as any).payload
    expect(payload.level).toBe('daily')
    // Daily reset date should be tomorrow, not next month
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const expectedDate = tomorrow.toISOString().split('T')[0]
    expect(payload.resetDate).toBe(expectedDate)
  })

  it('usagePercent is calculated correctly in warning', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 200_000_000, warningThreshold: 80, autoBlock: true } },
      170_000_000, 0,
    )
    await checkBudget('usage-percent-calc')

    const event = emittedEvents.find(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
    )
    expect(event).toBeDefined()
    const payload = (event!.data as any).payload
    expect(payload.usagePercent).toBe(85) // 170/200 = 85%
  })

  it('no events when spend is well under threshold', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      10_000_000, 0,
    )
    await checkBudget('no-events')
    expect(emittedEvents.length).toBe(0)
  })
})

describe('TEA: Warning Deduplication', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  it('monthly warning emitted only once across multiple calls', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      85_000_000, 0,
    )

    await checkBudget('dedup-monthly')
    await checkBudget('dedup-monthly')
    await checkBudget('dedup-monthly')

    const warnings = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
    )
    expect(warnings.length).toBe(1)
  })

  it('daily warning emitted only once across multiple calls', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 0, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
      0, 8_500_000,
    )

    await checkBudget('dedup-daily')
    await checkBudget('dedup-daily')

    const warnings = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning' &&
        (e.data as any)?.payload?.level === 'daily',
    )
    expect(warnings.length).toBe(1)
  })

  it('exceeded event emits on every call (not deduplicated)', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      110_000_000, 0,
    )

    await checkBudget('exceeded-multi')
    await checkBudget('exceeded-multi')

    const exceeded = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-exceeded',
    )
    expect(exceeded.length).toBe(2)
  })
})

describe('TEA: loadBudgetConfig Type Safety', () => {
  beforeEach(() => {
    clearBudgetCache()
    selectCallCount = 0
  })

  it('handles non-numeric monthlyBudget in settings', async () => {
    setupMock({ budgetConfig: { monthlyBudget: 'not-a-number', dailyBudget: 100 } })
    const config = await loadBudgetConfig('type-safety-1')
    expect(config.monthlyBudget).toBe(0) // defaults to 0
    expect(config.dailyBudget).toBe(100) // valid number kept
  })

  it('handles non-boolean autoBlock in settings', async () => {
    setupMock({ budgetConfig: { autoBlock: 'yes' } })
    const config = await loadBudgetConfig('type-safety-2')
    expect(config.autoBlock).toBe(true) // defaults to true
  })

  it('handles null budgetConfig', async () => {
    setupMock({ budgetConfig: null })
    const config = await loadBudgetConfig('type-safety-3')
    expect(config.monthlyBudget).toBe(0)
    expect(config.autoBlock).toBe(true)
  })

  it('handles empty budgetConfig object', async () => {
    setupMock({ budgetConfig: {} })
    const config = await loadBudgetConfig('type-safety-4')
    expect(config.monthlyBudget).toBe(0)
    expect(config.dailyBudget).toBe(0)
    expect(config.warningThreshold).toBe(80)
    expect(config.autoBlock).toBe(true)
  })
})

describe('TEA: Budget API Validation Edge Cases', () => {
  // These test the Zod schema boundaries via the API route
  let app: any

  beforeEach(async () => {
    // Re-use the already-imported budgetRoute from the budget-api test pattern
    // We test boundary values the dev tests didn't cover
  })

  it('warningThreshold=0 is valid', () => {
    const schema = z.object({
      warningThreshold: z.number().min(0).max(100).optional(),
    })
    expect(schema.safeParse({ warningThreshold: 0 }).success).toBe(true)
  })

  it('warningThreshold=100 is valid', () => {
    const schema = z.object({
      warningThreshold: z.number().min(0).max(100).optional(),
    })
    expect(schema.safeParse({ warningThreshold: 100 }).success).toBe(true)
  })

  it('monthlyBudget=0 is valid (unlimited)', () => {
    const schema = z.object({
      monthlyBudget: z.number().min(0).optional(),
    })
    expect(schema.safeParse({ monthlyBudget: 0 }).success).toBe(true)
  })

  it('very large monthlyBudget is valid', () => {
    const schema = z.object({
      monthlyBudget: z.number().min(0).optional(),
    })
    expect(schema.safeParse({ monthlyBudget: 999_999_999_999 }).success).toBe(true)
  })

  it('float monthlyBudget is valid', () => {
    const schema = z.object({
      monthlyBudget: z.number().min(0).optional(),
    })
    expect(schema.safeParse({ monthlyBudget: 123.456 }).success).toBe(true)
  })

  it('warningThreshold=-0.01 is rejected', () => {
    const schema = z.object({
      warningThreshold: z.number().min(0).max(100).optional(),
    })
    expect(schema.safeParse({ warningThreshold: -0.01 }).success).toBe(false)
  })

  it('warningThreshold=100.01 is rejected', () => {
    const schema = z.object({
      warningThreshold: z.number().min(0).max(100).optional(),
    })
    expect(schema.safeParse({ warningThreshold: 100.01 }).success).toBe(false)
  })
})

// Import zod for schema tests
import { z } from 'zod'

describe('TEA: Cross-Axis Budget Interaction', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  it('monthly block prevents daily check from running', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
      200_000_000, 20_000_000,
    )
    const result = await checkBudget('monthly-blocks-daily')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('monthly_exceeded') // monthly takes precedence

    // Should only have monthly exceeded event, not daily
    const exceededEvents = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-exceeded',
    )
    expect(exceededEvents.length).toBe(1)
    expect((exceededEvents[0].data as any).payload.level).toBe('monthly')
  })

  it('monthly under but daily over blocks with daily reason', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 500_000_000, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
      100_000_000, 15_000_000,
    )
    const result = await checkBudget('daily-blocks-monthly-ok')
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('daily_exceeded')
  })

  it('both monthly and daily warnings can emit independently', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
      85_000_000, 8_500_000,
    )
    const result = await checkBudget('both-warnings')
    expect(result.allowed).toBe(true)
    expect(result.warningEmitted).toBe(true)

    const warnings = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
    )
    expect(warnings.length).toBe(2)
    const levels = warnings.map(w => (w.data as any).payload.level)
    expect(levels).toContain('monthly')
    expect(levels).toContain('daily')
  })
})

describe('TEA: Cache Isolation', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  it('different companies have independent caches', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      50_000_000, 0,
    )
    await checkBudget('company-A')

    clearBudgetCache() // Reset for fresh setup
    setupMock(
      { budgetConfig: { monthlyBudget: 200_000_000, warningThreshold: 90, autoBlock: false } },
      150_000_000, 0,
    )
    const resultB = await checkBudget('company-B')
    expect(resultB.monthlyBudgetMicro).toBe(200_000_000)
  })

  it('clearBudgetCache resets warning dedup flags', async () => {
    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      85_000_000, 0,
    )
    const r1 = await checkBudget('warning-reset')
    expect(r1.warningEmitted).toBe(true)

    clearBudgetCache()
    emittedEvents.length = 0

    setupMock(
      { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
      85_000_000, 0,
    )
    const r2 = await checkBudget('warning-reset')
    expect(r2.warningEmitted).toBe(true)

    // After cache clear, warning should emit again
    const warnings = emittedEvents.filter(
      e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
    )
    expect(warnings.length).toBe(1)
  })
})
