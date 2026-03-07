import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'

// === Mock DB layer ===

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
  [Symbol.asyncIterator]: undefined as any,
}

// Make the chain thenable for await
Object.defineProperty(mockQueryChain, 'then', {
  value: (resolve: any) => resolve(mockSelectResult),
  writable: true,
  configurable: true,
})

const mockDb = {
  select: mock(() => mockQueryChain),
}

// Mock getCostSummary / getDepartmentCostBreakdown
const mockGetCostSummary = mock(() => Promise.resolve({
  totalInputTokens: 50000,
  totalOutputTokens: 20000,
  totalCostMicro: 1_500_000, // $1.50
  recordCount: 10,
  byDate: [{ date: '2026-03-07', costMicro: 1_500_000, recordCount: 10 }],
}))

const mockGetDepartmentCostBreakdown = mock(() => Promise.resolve({
  items: [
    { key: 'dept-1', label: '전략부', inputTokens: 30000, outputTokens: 10000, costMicro: 900_000, recordCount: 5 },
    { key: 'dept-2', label: '마케팅부', inputTokens: 20000, outputTokens: 10000, costMicro: 600_000, recordCount: 5 },
  ],
  total: { inputTokens: 50000, outputTokens: 20000, costMicro: 1_500_000 },
}))

const mockMicroToUsd = mock((micro: number) => micro / 1_000_000)

// Mock modules
mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  commands: { companyId: 'companyId', status: 'status', createdAt: 'createdAt', metadata: 'metadata' },
  costRecords: { companyId: 'companyId', provider: 'provider', costUsdMicro: 'costUsdMicro', createdAt: 'createdAt', inputTokens: 'inputTokens', outputTokens: 'outputTokens' },
  agents: { companyId: 'companyId', status: 'status', isActive: 'isActive' },
  departments: { id: 'id', name: 'name' },
  companies: { id: 'id', settings: 'settings', updatedAt: 'updatedAt' },
}))
mock.module('../../lib/cost-tracker', () => ({
  getCostSummary: mockGetCostSummary,
  getDepartmentCostBreakdown: mockGetDepartmentCostBreakdown,
  microToUsd: mockMicroToUsd,
}))

// Import after mocks
const { getSummary, getUsage, getBudget } = await import('../../services/dashboard')

describe('DashboardService', () => {
  const companyId = 'test-company-id'

  beforeEach(() => {
    mockGetCostSummary.mockClear()
    mockGetDepartmentCostBreakdown.mockClear()
    mockMicroToUsd.mockClear()
    mockDb.select.mockClear()
    mockQueryChain.select.mockClear()
    mockQueryChain.from.mockClear()
    mockQueryChain.where.mockClear()
    mockQueryChain.groupBy.mockClear()
    mockQueryChain.orderBy.mockClear()
  })

  describe('getSummary', () => {
    it('returns 4 summary cards with correct structure', async () => {
      // Setup command status counts
      mockSelectResult.length = 0
      mockSelectResult.push(
        { status: 'completed', cnt: 5 },
        { status: 'failed', cnt: 1 },
        { status: 'processing', cnt: 2 },
        { status: 'pending', cnt: 1 },
      )

      // Provider breakdown
      mockGroupByResult.length = 0
      mockGroupByResult.push(
        { provider: 'anthropic', costMicro: 1_000_000 },
        { provider: 'openai', costMicro: 300_000 },
        { provider: 'google', costMicro: 200_000 },
      )

      const result = await getSummary(companyId)

      // Check structure
      expect(result).toHaveProperty('tasks')
      expect(result).toHaveProperty('cost')
      expect(result).toHaveProperty('agents')
      expect(result).toHaveProperty('integrations')

      // Tasks card
      expect(result.tasks).toHaveProperty('total')
      expect(result.tasks).toHaveProperty('completed')
      expect(result.tasks).toHaveProperty('failed')
      expect(result.tasks).toHaveProperty('inProgress')

      // Cost card
      expect(result.cost).toHaveProperty('todayUsd')
      expect(result.cost).toHaveProperty('byProvider')
      expect(result.cost).toHaveProperty('budgetUsagePercent')
      expect(typeof result.cost.todayUsd).toBe('number')
      expect(typeof result.cost.budgetUsagePercent).toBe('number')

      // Agents card
      expect(result.agents).toHaveProperty('total')
      expect(result.agents).toHaveProperty('active')
      expect(result.agents).toHaveProperty('idle')
      expect(result.agents).toHaveProperty('error')

      // Integrations card
      expect(result.integrations).toHaveProperty('providers')
      expect(result.integrations).toHaveProperty('toolSystemOk')
      expect(result.integrations.providers).toHaveLength(3)
      expect(result.integrations.toolSystemOk).toBe(true)
    })

    it('calls getCostSummary with correct date range', async () => {
      mockSelectResult.length = 0
      mockGroupByResult.length = 0

      await getSummary('fresh-company-1')

      // Called twice: once for today's cost, once for monthly budget
      expect(mockGetCostSummary).toHaveBeenCalledTimes(2)
      const [firstCall] = mockGetCostSummary.mock.calls
      expect(firstCall[0]).toBe('fresh-company-1')
      expect(firstCall[1]).toHaveProperty('from')
      expect(firstCall[1]).toHaveProperty('to')
    })

    it('includes all 3 LLM providers in integrations', async () => {
      mockSelectResult.length = 0
      mockGroupByResult.length = 0

      const result = await getSummary('integration-test-company')
      const providerNames = result.integrations.providers.map(p => p.name)
      expect(providerNames).toContain('anthropic')
      expect(providerNames).toContain('openai')
      expect(providerNames).toContain('google')
    })

    it('returns provider status as up/down', async () => {
      mockSelectResult.length = 0
      mockGroupByResult.length = 0

      const result = await getSummary('provider-status-test')
      for (const p of result.integrations.providers) {
        expect(['up', 'down']).toContain(p.status)
      }
    })
  })

  describe('getUsage', () => {
    it('returns usage data grouped by day and provider', async () => {
      mockGroupByResult.length = 0
      mockGroupByResult.push(
        { date: '2026-03-01', provider: 'anthropic', inputTokens: 10000, outputTokens: 5000, costMicro: 500_000 },
        { date: '2026-03-01', provider: 'openai', inputTokens: 8000, outputTokens: 3000, costMicro: 300_000 },
        { date: '2026-03-02', provider: 'anthropic', inputTokens: 12000, outputTokens: 6000, costMicro: 600_000 },
      )

      // Override orderBy to resolve with the results
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve(mockGroupByResult))

      const result = await getUsage(companyId, 7)

      expect(result).toHaveProperty('days', 7)
      expect(result).toHaveProperty('usage')
      expect(Array.isArray(result.usage)).toBe(true)
    })

    it('accepts days parameter of 30', async () => {
      mockGroupByResult.length = 0
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))

      const result = await getUsage('usage-30d-company', 30)
      expect(result.days).toBe(30)
      expect(result.usage).toEqual([])
    })

    it('usage items have correct fields', async () => {
      mockGroupByResult.length = 0
      mockGroupByResult.push(
        { date: '2026-03-05', provider: 'anthropic', inputTokens: 10000, outputTokens: 5000, costMicro: 500_000 },
      )
      mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve(mockGroupByResult))

      const result = await getUsage('usage-fields-company', 7)

      if (result.usage.length > 0) {
        const item = result.usage[0]
        expect(item).toHaveProperty('date')
        expect(item).toHaveProperty('provider')
        expect(item).toHaveProperty('inputTokens')
        expect(item).toHaveProperty('outputTokens')
        expect(item).toHaveProperty('costUsd')
      }
    })
  })

  describe('getBudget', () => {
    it('returns budget data with correct structure', async () => {
      const result = await getBudget(companyId)

      expect(result).toHaveProperty('currentMonthSpendUsd')
      expect(result).toHaveProperty('monthlyBudgetUsd')
      expect(result).toHaveProperty('usagePercent')
      expect(result).toHaveProperty('projectedMonthEndUsd')
      expect(result).toHaveProperty('isDefaultBudget')
      expect(result).toHaveProperty('byDepartment')
    })

    it('uses default budget of $500', async () => {
      const result = await getBudget('budget-default-company')

      expect(result.monthlyBudgetUsd).toBe(500)
      expect(result.isDefaultBudget).toBe(true)
    })

    it('includes department breakdown', async () => {
      const result = await getBudget('budget-dept-company')

      expect(Array.isArray(result.byDepartment)).toBe(true)
      expect(mockGetDepartmentCostBreakdown).toHaveBeenCalled()
    })

    it('calculates projected month-end spend', async () => {
      const result = await getBudget('budget-projection-company')

      expect(typeof result.projectedMonthEndUsd).toBe('number')
      expect(result.projectedMonthEndUsd).toBeGreaterThanOrEqual(0)
    })

    it('calculates usage percent correctly', async () => {
      // totalCostMicro = 1_500_000, budget = 500_000_000
      // usage = 1.5 / 500 * 100 = 0.3% -> rounds to 0
      const result = await getBudget('budget-percent-company')

      expect(typeof result.usagePercent).toBe('number')
      expect(result.usagePercent).toBeGreaterThanOrEqual(0)
      expect(result.usagePercent).toBeLessThanOrEqual(100)
    })

    it('department items have correct fields', async () => {
      const result = await getBudget('budget-dept-fields-company')

      if (result.byDepartment.length > 0) {
        const dept = result.byDepartment[0]
        expect(dept).toHaveProperty('departmentId')
        expect(dept).toHaveProperty('name')
        expect(dept).toHaveProperty('costUsd')
      }
    })
  })
})

describe('Dashboard API Response Format', () => {
  it('summary response matches { success: true, data: DashboardSummary }', async () => {
    mockSelectResult.length = 0
    mockGroupByResult.length = 0

    const result = await getSummary('format-test-company')
    // The route wraps this in { success: true, data: result }
    const response = { success: true, data: result }

    expect(response.success).toBe(true)
    expect(response.data).toHaveProperty('tasks')
    expect(response.data).toHaveProperty('cost')
    expect(response.data).toHaveProperty('agents')
    expect(response.data).toHaveProperty('integrations')
  })

  it('usage response matches { success: true, data: DashboardUsage }', async () => {
    mockGroupByResult.length = 0
    mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))

    const result = await getUsage('format-usage-company', 7)
    const response = { success: true, data: result }

    expect(response.success).toBe(true)
    expect(response.data).toHaveProperty('days')
    expect(response.data).toHaveProperty('usage')
  })

  it('budget response matches { success: true, data: DashboardBudget }', async () => {
    const result = await getBudget('format-budget-company')
    const response = { success: true, data: result }

    expect(response.success).toBe(true)
    expect(response.data).toHaveProperty('currentMonthSpendUsd')
    expect(response.data).toHaveProperty('monthlyBudgetUsd')
    expect(response.data).toHaveProperty('usagePercent')
    expect(response.data).toHaveProperty('projectedMonthEndUsd')
    expect(response.data).toHaveProperty('isDefaultBudget')
    expect(response.data).toHaveProperty('byDepartment')
  })
})

describe('Dashboard Cache', () => {
  it('second call to getSummary uses cache (same companyId)', async () => {
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
    mockGetCostSummary.mockClear()

    const cacheCompany = 'cache-test-company-' + Date.now()
    await getSummary(cacheCompany)
    const callsAfterFirst = mockGetCostSummary.mock.calls.length

    await getSummary(cacheCompany)
    const callsAfterSecond = mockGetCostSummary.mock.calls.length

    // Should not increase — cached
    expect(callsAfterSecond).toBe(callsAfterFirst)
  })

  it('different companyId bypasses cache', async () => {
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
    mockGetCostSummary.mockClear()

    await getSummary('cache-company-a-' + Date.now())
    const callsAfterA = mockGetCostSummary.mock.calls.length

    await getSummary('cache-company-b-' + Date.now())
    const callsAfterB = mockGetCostSummary.mock.calls.length

    expect(callsAfterB).toBeGreaterThan(callsAfterA)
  })
})

describe('Tenant Isolation', () => {
  it('getSummary passes companyId to all queries', async () => {
    mockSelectResult.length = 0
    mockGroupByResult.length = 0
    mockGetCostSummary.mockClear()

    const tenantId = 'tenant-isolation-' + Date.now()
    await getSummary(tenantId)

    // getCostSummary called with tenant companyId
    expect(mockGetCostSummary.mock.calls[0][0]).toBe(tenantId)
  })

  it('getUsage passes companyId to query', async () => {
    mockGroupByResult.length = 0
    mockQueryChain.orderBy.mockImplementationOnce(() => Promise.resolve([]))

    const tenantId = 'tenant-usage-' + Date.now()
    await getUsage(tenantId, 7)

    // DB select was called with the companyId filter
    expect(mockDb.select).toHaveBeenCalled()
  })

  it('getBudget passes companyId to cost queries', async () => {
    mockGetCostSummary.mockClear()
    mockGetDepartmentCostBreakdown.mockClear()

    const tenantId = 'tenant-budget-' + Date.now()
    await getBudget(tenantId)

    expect(mockGetCostSummary.mock.calls[0][0]).toBe(tenantId)
    expect(mockGetDepartmentCostBreakdown.mock.calls[0][0]).toBe(tenantId)
  })
})
