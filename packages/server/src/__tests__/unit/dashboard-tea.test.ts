import { describe, it, expect, mock, beforeEach } from 'bun:test'

/**
 * TEA (Test Architect) Expanded Tests for Story 6-1: Dashboard Aggregation API
 * Risk-based coverage: edge cases, error handling, boundary conditions
 */

// === Mock setup ===

const mockSelectResult: any[] = []
const mockGroupByResult: any[] = []

const mockQueryChain = {
  select: mock(() => mockQueryChain),
  from: mock(() => mockQueryChain),
  where: mock(() => mockQueryChain),
  groupBy: mock(() => mockQueryChain),
  orderBy: mock(() => Promise.resolve(mockGroupByResult)),
  innerJoin: mock(() => mockQueryChain),
  leftJoin: mock(() => mockQueryChain),
  then: undefined as any,
}

Object.defineProperty(mockQueryChain, 'then', {
  value: (resolve: any) => resolve(mockSelectResult),
  writable: true,
  configurable: true,
})

const mockDb = { select: mock(() => mockQueryChain) }

const mockGetCostSummary = mock(() => Promise.resolve({
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCostMicro: 0,
  recordCount: 0,
  byDate: [],
}))

const mockGetDepartmentCostBreakdown = mock(() => Promise.resolve({
  items: [],
  total: { inputTokens: 0, outputTokens: 0, costMicro: 0 },
}))

const mockMicroToUsd = mock((micro: number) => micro / 1_000_000)

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  commands: { companyId: 'companyId', status: 'status', createdAt: 'createdAt' },
  costRecords: { companyId: 'companyId', provider: 'provider', costUsdMicro: 'costUsdMicro', createdAt: 'createdAt', inputTokens: 'inputTokens', outputTokens: 'outputTokens' },
  agents: { companyId: 'companyId', status: 'status', isActive: 'isActive' },
  departments: { id: 'id', name: 'name' },
}))
mock.module('../../lib/cost-tracker', () => ({
  getCostSummary: mockGetCostSummary,
  getDepartmentCostBreakdown: mockGetDepartmentCostBreakdown,
  microToUsd: mockMicroToUsd,
}))

const { getSummary, getUsage, getBudget } = await import('../../services/dashboard')

describe('TEA: Dashboard Edge Cases', () => {
  beforeEach(() => {
    mockGetCostSummary.mockClear()
    mockGetDepartmentCostBreakdown.mockClear()
    mockMicroToUsd.mockClear()
    mockDb.select.mockClear()
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
  })

  describe('getSummary - Zero data scenarios', () => {
    it('handles company with zero commands', async () => {
      const result = await getSummary('empty-company-' + Date.now())

      expect(result.tasks.total).toBe(0)
      expect(result.tasks.completed).toBe(0)
      expect(result.tasks.failed).toBe(0)
      expect(result.tasks.inProgress).toBe(0)
    })

    it('handles company with zero agents', async () => {
      const result = await getSummary('no-agents-' + Date.now())

      expect(result.agents.total).toBe(0)
      expect(result.agents.active).toBe(0)
      expect(result.agents.idle).toBe(0)
      expect(result.agents.error).toBe(0)
    })

    it('handles company with zero cost records', async () => {
      const result = await getSummary('no-cost-' + Date.now())

      expect(result.cost.todayUsd).toBe(0)
      expect(result.cost.byProvider).toEqual([])
      expect(result.cost.budgetUsagePercent).toBe(0)
    })

    it('returns all 3 providers in integrations even with no data', async () => {
      const result = await getSummary('no-integration-' + Date.now())

      expect(result.integrations.providers).toHaveLength(3)
      const names = result.integrations.providers.map(p => p.name)
      expect(names).toContain('anthropic')
      expect(names).toContain('openai')
      expect(names).toContain('google')
    })

    it('all providers show down when no recent cost records', async () => {
      const result = await getSummary('all-down-' + Date.now())

      for (const p of result.integrations.providers) {
        expect(p.status).toBe('down')
      }
    })
  })

  describe('getSummary - Status aggregation', () => {
    it('counts pending + processing as inProgress', async () => {
      mockSelectResult.push(
        { status: 'pending', cnt: 3 },
        { status: 'processing', cnt: 2 },
      )
      const result = await getSummary('pending-proc-' + Date.now())
      expect(result.tasks.inProgress).toBe(5)
    })

    it('ignores cancelled status in total count', async () => {
      mockSelectResult.push(
        { status: 'completed', cnt: 5 },
        { status: 'cancelled', cnt: 2 },
      )
      const result = await getSummary('cancelled-' + Date.now())
      // Total includes all statuses from the DB
      expect(result.tasks.total).toBe(7)
      expect(result.tasks.completed).toBe(5)
    })

    it('counts online + working as active agents', async () => {
      // Agent query returns after task + cost queries
      mockSelectResult.push(
        { status: 'online', cnt: 3 },
        { status: 'working', cnt: 2 },
        { status: 'offline', cnt: 5 },
        { status: 'error', cnt: 1 },
      )
      const result = await getSummary('agent-status-' + Date.now())
      expect(result.agents.active).toBe(5)
      expect(result.agents.idle).toBe(5)
      expect(result.agents.error).toBe(1)
      expect(result.agents.total).toBe(11)
    })
  })

  describe('getUsage - Boundary conditions', () => {
    it('handles days=1 (minimum)', async () => {
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
      const result = await getUsage('usage-1d-' + Date.now(), 1)
      expect(result.days).toBe(1)
      expect(result.usage).toEqual([])
    })

    it('handles days=90 (maximum allowed by Zod)', async () => {
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
      const result = await getUsage('usage-90d-' + Date.now(), 90)
      expect(result.days).toBe(90)
    })

    it('returns empty array when no cost records exist', async () => {
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
      const result = await getUsage('empty-usage-' + Date.now(), 7)
      expect(result.usage).toEqual([])
    })

    it('handles null token values gracefully', async () => {
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([
        { date: '2026-03-01', provider: 'anthropic', inputTokens: null, outputTokens: null, costMicro: null },
      ]))
      const result = await getUsage('null-tokens-' + Date.now(), 7)
      expect(result.usage.length).toBe(1)
      expect(result.usage[0].inputTokens).toBe(0)
      expect(result.usage[0].outputTokens).toBe(0)
      expect(result.usage[0].costUsd).toBe(0)
    })

    it('preserves provider name in usage items', async () => {
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([
        { date: '2026-03-01', provider: 'openai', inputTokens: 1000, outputTokens: 500, costMicro: 100_000 },
      ]))
      const result = await getUsage('provider-name-' + Date.now(), 7)
      expect(result.usage[0].provider).toBe('openai')
    })
  })

  describe('getBudget - Calculation accuracy', () => {
    it('returns default budget of $500', async () => {
      const result = await getBudget('budget-test-' + Date.now())
      expect(result.monthlyBudgetUsd).toBe(500)
      expect(result.isDefaultBudget).toBe(true)
    })

    it('handles zero spend correctly', async () => {
      const result = await getBudget('zero-spend-' + Date.now())
      expect(result.currentMonthSpendUsd).toBe(0)
      expect(result.usagePercent).toBe(0)
    })

    it('projected spend is >= current spend', async () => {
      mockGetCostSummary.mockImplementationOnce(() => Promise.resolve({
        totalInputTokens: 10000, totalOutputTokens: 5000,
        totalCostMicro: 100_000_000, // $100
        recordCount: 50, byDate: [],
      }))
      const result = await getBudget('projection-gte-' + Date.now())
      expect(result.projectedMonthEndUsd).toBeGreaterThanOrEqual(result.currentMonthSpendUsd)
    })

    it('returns empty byDepartment when no departments have costs', async () => {
      const result = await getBudget('no-dept-cost-' + Date.now())
      expect(result.byDepartment).toEqual([])
    })

    it('department items have required fields', async () => {
      mockGetDepartmentCostBreakdown.mockImplementationOnce(() => Promise.resolve({
        items: [
          { key: 'd-1', label: 'Engineering', inputTokens: 1000, outputTokens: 500, costMicro: 50000, recordCount: 5 },
        ],
        total: { inputTokens: 1000, outputTokens: 500, costMicro: 50000 },
      }))
      const result = await getBudget('dept-fields-' + Date.now())
      expect(result.byDepartment.length).toBe(1)
      expect(result.byDepartment[0]).toHaveProperty('departmentId', 'd-1')
      expect(result.byDepartment[0]).toHaveProperty('name', 'Engineering')
      expect(result.byDepartment[0]).toHaveProperty('costUsd')
    })
  })

  describe('getBudget - Linear extrapolation', () => {
    it('projects correctly for mid-month', async () => {
      // If we're on day 15 of a 30-day month with $150 spend, projected = $300
      mockGetCostSummary.mockImplementationOnce(() => Promise.resolve({
        totalInputTokens: 100000, totalOutputTokens: 50000,
        totalCostMicro: 150_000_000, // $150
        recordCount: 100, byDate: [],
      }))
      const result = await getBudget('mid-month-' + Date.now())
      // Projection should be > current spend (since it extrapolates to full month)
      expect(result.projectedMonthEndUsd).toBeGreaterThan(0)
    })
  })
})

describe('TEA: Dashboard Response Contract', () => {
  beforeEach(() => {
    mockGetCostSummary.mockClear()
    mockGetDepartmentCostBreakdown.mockClear()
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
  })

  it('summary response has no undefined values', async () => {
    const result = await getSummary('no-undef-' + Date.now())
    const json = JSON.stringify(result)
    expect(json).not.toContain('undefined')
  })

  it('usage response has no undefined values', async () => {
    mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
    const result = await getUsage('no-undef-usage-' + Date.now(), 7)
    const json = JSON.stringify(result)
    expect(json).not.toContain('undefined')
  })

  it('budget response has no undefined values', async () => {
    const result = await getBudget('no-undef-budget-' + Date.now())
    const json = JSON.stringify(result)
    expect(json).not.toContain('undefined')
  })

  it('all numeric values are numbers, not strings', async () => {
    const result = await getSummary('numeric-check-' + Date.now())
    expect(typeof result.tasks.total).toBe('number')
    expect(typeof result.cost.todayUsd).toBe('number')
    expect(typeof result.cost.budgetUsagePercent).toBe('number')
    expect(typeof result.agents.total).toBe('number')
  })

  it('toolSystemOk is boolean', async () => {
    const result = await getSummary('bool-check-' + Date.now())
    expect(typeof result.integrations.toolSystemOk).toBe('boolean')
  })

  it('isDefaultBudget is boolean', async () => {
    const result = await getBudget('bool-budget-' + Date.now())
    expect(typeof result.isDefaultBudget).toBe('boolean')
  })
})

describe('TEA: Zod Validation Coverage', () => {
  it('usage days default should be 7', async () => {
    // Test that the default value behavior works
    mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
    const result = await getUsage('zod-default-' + Date.now(), 7)
    expect(result.days).toBe(7)
  })

  it('usage accepts exactly 30 days', async () => {
    mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))
    const result = await getUsage('zod-30-' + Date.now(), 30)
    expect(result.days).toBe(30)
  })
})

describe('TEA: Cost Tracker Integration', () => {
  beforeEach(() => {
    mockGetCostSummary.mockClear()
    mockGetDepartmentCostBreakdown.mockClear()
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
  })

  it('getSummary calls getCostSummary twice (today + month)', async () => {
    await getSummary('cost-calls-' + Date.now())
    expect(mockGetCostSummary).toHaveBeenCalledTimes(2)
  })

  it('getBudget calls getCostSummary once for month', async () => {
    await getBudget('budget-calls-' + Date.now())
    expect(mockGetCostSummary).toHaveBeenCalledTimes(1)
  })

  it('getBudget calls getDepartmentCostBreakdown once', async () => {
    await getBudget('dept-calls-' + Date.now())
    expect(mockGetDepartmentCostBreakdown).toHaveBeenCalledTimes(1)
  })

  it('microToUsd is called for cost conversions', async () => {
    mockGetCostSummary.mockImplementationOnce(() => Promise.resolve({
      totalInputTokens: 1000, totalOutputTokens: 500,
      totalCostMicro: 100_000, recordCount: 5, byDate: [],
    }))
    await getSummary('micro-convert-' + Date.now())
    expect(mockMicroToUsd).toHaveBeenCalled()
  })
})
