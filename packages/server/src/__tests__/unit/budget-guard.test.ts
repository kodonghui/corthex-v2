import { describe, it, expect, beforeEach } from 'bun:test'

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

// === Tests ===

describe('BudgetGuard', () => {
  beforeEach(() => {
    clearBudgetCache()
    emittedEvents.length = 0
    selectCallCount = 0
  })

  describe('loadBudgetConfig', () => {
    it('returns defaults when no settings exist', async () => {
      setupMock(null)
      const config = await loadBudgetConfig('company-1')
      expect(config.monthlyBudget).toBe(0)
      expect(config.dailyBudget).toBe(0)
      expect(config.warningThreshold).toBe(80)
      expect(config.autoBlock).toBe(true)
    })

    it('returns defaults when no budgetConfig in settings', async () => {
      setupMock({ dashboardQuickActions: [] })
      const config = await loadBudgetConfig('company-1')
      expect(config.monthlyBudget).toBe(0)
      expect(config.autoBlock).toBe(true)
    })

    it('loads budget config from settings', async () => {
      setupMock({
        budgetConfig: {
          monthlyBudget: 500_000_000,
          dailyBudget: 20_000_000,
          warningThreshold: 90,
          autoBlock: false,
        },
      })
      const config = await loadBudgetConfig('company-1')
      expect(config.monthlyBudget).toBe(500_000_000)
      expect(config.dailyBudget).toBe(20_000_000)
      expect(config.warningThreshold).toBe(90)
      expect(config.autoBlock).toBe(false)
    })

    it('handles partial budget config', async () => {
      setupMock({ budgetConfig: { monthlyBudget: 100_000_000 } })
      const config = await loadBudgetConfig('company-1')
      expect(config.monthlyBudget).toBe(100_000_000)
      expect(config.dailyBudget).toBe(0)
      expect(config.warningThreshold).toBe(80)
      expect(config.autoBlock).toBe(true)
    })
  })

  describe('checkBudget', () => {
    it('allows when no budget is set (unlimited)', async () => {
      setupMock(null, 999_999_999, 999_999_999)
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('allows when spend is under monthly budget', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: true } },
        200_000_000, 10_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(true)
      expect(result.currentMonthSpendMicro).toBe(200_000_000)
    })

    it('blocks when monthly budget exceeded with autoBlock=true', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: true } },
        600_000_000, 10_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('monthly_exceeded')
    })

    it('allows when monthly budget exceeded with autoBlock=false', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: false } },
        600_000_000, 10_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(true)
    })

    it('blocks when daily budget exceeded', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 0, dailyBudget: 20_000_000, warningThreshold: 80, autoBlock: true } },
        50_000_000, 25_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('daily_exceeded')
    })

    it('emits budget-warning when threshold reached for monthly', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        85_000_000, 5_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(true)

      const warningEvent = emittedEvents.find(
        e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
      )
      expect(warningEvent).toBeDefined()
      expect((warningEvent!.data as any).payload.level).toBe('monthly')
    })

    it('emits budget-exceeded when blocked', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        110_000_000, 5_000_000,
      )
      await checkBudget('company-1')

      const exceededEvent = emittedEvents.find(
        e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-exceeded',
      )
      expect(exceededEvent).toBeDefined()
      expect((exceededEvent!.data as any).payload.level).toBe('monthly')
    })

    it('does not emit warning twice for same company (cached)', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        85_000_000, 5_000_000,
      )

      const result1 = await checkBudget('company-1')
      expect(result1.warningEmitted).toBe(true)

      const result2 = await checkBudget('company-1')
      expect(result2.warningEmitted).toBe(false)

      const warningEvents = emittedEvents.filter(
        e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
      )
      expect(warningEvents.length).toBe(1)
    })

    it('uses cache on second call within TTL', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: true } },
        100_000_000, 10_000_000,
      )

      await checkBudget('company-1')
      const callsBefore = selectCallCount

      await checkBudget('company-1')
      const callsAfter = selectCallCount

      expect(callsAfter).toBe(callsBefore) // no additional DB calls
    })

    it('returns correct resetDate (first of next month)', async () => {
      setupMock(null, 0, 0)
      const result = await checkBudget('company-1')

      const resetDate = new Date(result.resetDate)
      const now = new Date()
      const expectedMonth = now.getUTCMonth() === 11 ? 0 : now.getUTCMonth() + 1
      expect(resetDate.getUTCDate()).toBe(1)
      expect(resetDate.getUTCMonth()).toBe(expectedMonth)
    })

    it('monthly budget takes priority over daily when both exceeded', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
        150_000_000, 15_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('monthly_exceeded')
    })

    it('blocks exact boundary (spend === budget)', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 100_000_000, warningThreshold: 80, autoBlock: true } },
        100_000_000, 5_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('monthly_exceeded')
    })

    it('clears cache properly', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 500_000_000, warningThreshold: 80, autoBlock: true } },
        100_000_000, 10_000_000,
      )
      await checkBudget('company-1')
      clearBudgetCache()

      setupMock(
        { budgetConfig: { monthlyBudget: 200_000_000, warningThreshold: 90, autoBlock: false } },
        100_000_000, 10_000_000,
      )
      const result = await checkBudget('company-1')
      expect(result.monthlyBudgetMicro).toBe(200_000_000)
    })

    it('emits daily budget warning', async () => {
      setupMock(
        { budgetConfig: { monthlyBudget: 0, dailyBudget: 10_000_000, warningThreshold: 80, autoBlock: true } },
        50_000_000, 8_500_000,
      )
      const result = await checkBudget('company-1')
      expect(result.allowed).toBe(true)
      expect(result.warningEmitted).toBe(true)

      const warningEvent = emittedEvents.find(
        e => e.event === 'cost' && (e.data as any)?.payload?.type === 'budget-warning',
      )
      expect(warningEvent).toBeDefined()
      expect((warningEvent!.data as any).payload.level).toBe('daily')
    })
  })
})
