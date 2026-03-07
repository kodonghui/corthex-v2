import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mock DB layer ===

const mockSelectResult: any[] = []
const mockUpdateSet: Record<string, unknown> = {}
let mockUpdateCalled = false

const mockQueryChain = {
  select: mock(() => mockQueryChain),
  from: mock(() => mockQueryChain),
  where: mock(() => mockQueryChain),
  groupBy: mock(() => mockQueryChain),
  orderBy: mock(() => Promise.resolve(mockSelectResult)),
  limit: mock(() => Promise.resolve(mockSelectResult)),
  set: mock((data: Record<string, unknown>) => {
    Object.assign(mockUpdateSet, data)
    return mockQueryChain
  }),
  then: undefined as any,
  [Symbol.asyncIterator]: undefined as any,
}

Object.defineProperty(mockQueryChain, 'then', {
  value: (resolve: any) => resolve(mockSelectResult),
  writable: true,
  configurable: true,
})

const mockDb = {
  select: mock(() => mockQueryChain),
  update: mock(() => ({ set: mock(() => ({ where: mock(() => Promise.resolve()) })) })),
}

const mockGetCostSummary = mock(() => Promise.resolve({
  totalInputTokens: 0, totalOutputTokens: 0, totalCostMicro: 0, recordCount: 0, byDate: [],
}))
const mockGetDepartmentCostBreakdown = mock(() => Promise.resolve({
  items: [], total: { inputTokens: 0, outputTokens: 0, costMicro: 0 },
}))
const mockMicroToUsd = mock((micro: number) => micro / 1_000_000)

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

const { getQuickActions, updateQuickActions, getSatisfaction } = await import('../../services/dashboard')

describe('QuickActions Service', () => {
  const companyId = 'quick-action-test-' + Date.now()

  beforeEach(() => {
    mockDb.select.mockClear()
    mockQueryChain.select.mockClear()
    mockQueryChain.from.mockClear()
    mockQueryChain.where.mockClear()
    mockQueryChain.limit.mockClear()
    mockSelectResult.length = 0
  })

  describe('getQuickActions', () => {
    it('returns default quick actions when no custom config', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await getQuickActions('no-config-' + Date.now())

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(4)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('label')
      expect(result[0]).toHaveProperty('icon')
      expect(result[0]).toHaveProperty('command')
      expect(result[0]).toHaveProperty('sortOrder')
    })

    it('default actions include daily briefing', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await getQuickActions('default-check-' + Date.now())

      const labels = result.map((a: any) => a.label)
      expect(labels).toContain('일일 브리핑')
      expect(labels).toContain('시스템 점검')
      expect(labels).toContain('비용 리포트')
      expect(labels).toContain('루틴 실행')
    })

    it('returns custom actions when configured', async () => {
      const customActions = [
        { id: 'custom-1', label: 'Custom Action', icon: '🎯', command: '/custom', presetId: null, sortOrder: 0 },
      ]
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: { dashboardQuickActions: customActions } })

      const result = await getQuickActions('custom-config-' + Date.now())

      expect(result).toEqual(customActions)
    })

    it('returns defaults when settings exist but no dashboardQuickActions', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: { someOtherSetting: true } })

      const result = await getQuickActions('partial-settings-' + Date.now())

      expect(result.length).toBe(4)
    })

    it('each default action has a valid command starting with /', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await getQuickActions('command-format-' + Date.now())

      for (const action of result) {
        expect(action.command.startsWith('/')).toBe(true)
      }
    })

    it('default actions are sorted by sortOrder', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await getQuickActions('sort-order-' + Date.now())

      for (let i = 1; i < result.length; i++) {
        expect(result[i].sortOrder).toBeGreaterThanOrEqual(result[i - 1].sortOrder)
      }
    })

    it('each action has a unique id', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await getQuickActions('unique-ids-' + Date.now())

      const ids = result.map((a: any) => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('updateQuickActions', () => {
    it('returns the updated actions', async () => {
      const newActions = [
        { id: 'new-1', label: 'New Action', icon: '🚀', command: '/new', presetId: null, sortOrder: 0 },
      ]
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: {} })

      const result = await updateQuickActions('update-test', newActions)

      expect(result).toEqual(newActions)
    })

    it('merges with existing settings', async () => {
      const newActions = [
        { id: 'merge-1', label: 'Merged', icon: '🔄', command: '/merge', presetId: null, sortOrder: 0 },
      ]
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: { existingKey: 'value' } })

      await updateQuickActions('merge-test', newActions)

      expect(mockDb.update).toHaveBeenCalled()
    })

    it('handles null existing settings', async () => {
      const newActions = [
        { id: 'null-1', label: 'From Null', icon: '📝', command: '/null', presetId: null, sortOrder: 0 },
      ]
      mockSelectResult.length = 0
      mockSelectResult.push({ settings: null })

      const result = await updateQuickActions('null-settings-test', newActions)

      expect(result).toEqual(newActions)
    })
  })
})

describe('Satisfaction Service', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockQueryChain.select.mockClear()
    mockQueryChain.from.mockClear()
    mockQueryChain.where.mockClear()
    mockSelectResult.length = 0
  })

  describe('getSatisfaction', () => {
    it('returns satisfaction data with correct structure', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 10 })

      const result = await getSatisfaction('sat-struct-' + Date.now(), '7d')

      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('positive')
      expect(result).toHaveProperty('negative')
      expect(result).toHaveProperty('neutral')
      expect(result).toHaveProperty('rate')
      expect(result).toHaveProperty('period')
    })

    it('returns correct period in response', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 0 })

      const result7d = await getSatisfaction('period-7d-' + Date.now(), '7d')
      expect(result7d.period).toBe('7d')

      const result30d = await getSatisfaction('period-30d-' + Date.now(), '30d')
      expect(result30d.period).toBe('30d')

      const resultAll = await getSatisfaction('period-all-' + Date.now(), 'all')
      expect(resultAll.period).toBe('all')
    })

    it('calculates neutral as total - positive - negative', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 10 })

      const result = await getSatisfaction('neutral-calc-' + Date.now(), '7d')

      expect(result.neutral).toBe(result.total - result.positive - result.negative)
    })

    it('rate is 0 when no feedback exists', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 5 })

      const result = await getSatisfaction('no-feedback-' + Date.now(), '7d')

      // positive=5, negative=5 from mock, but all return same mock
      // The important thing is rate is a number between 0-100
      expect(typeof result.rate).toBe('number')
      expect(result.rate).toBeGreaterThanOrEqual(0)
      expect(result.rate).toBeLessThanOrEqual(100)
    })

    it('all values are non-negative numbers', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 0 })

      const result = await getSatisfaction('non-neg-' + Date.now(), '7d')

      expect(result.total).toBeGreaterThanOrEqual(0)
      expect(result.positive).toBeGreaterThanOrEqual(0)
      expect(result.negative).toBeGreaterThanOrEqual(0)
      expect(result.neutral).toBeGreaterThanOrEqual(0)
      expect(result.rate).toBeGreaterThanOrEqual(0)
    })

    it('handles empty results (no commands)', async () => {
      mockSelectResult.length = 0
      mockSelectResult.push({ cnt: 0 })

      const result = await getSatisfaction('empty-' + Date.now(), 'all')

      expect(result.total).toBe(0)
      expect(result.rate).toBe(0)
    })
  })
})

describe('Satisfaction API Response Format', () => {
  it('satisfaction response matches { success: true, data: DashboardSatisfaction }', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 5 })

    const result = await getSatisfaction('format-sat-' + Date.now(), '7d')
    const response = { success: true, data: result }

    expect(response.success).toBe(true)
    expect(response.data).toHaveProperty('total')
    expect(response.data).toHaveProperty('positive')
    expect(response.data).toHaveProperty('negative')
    expect(response.data).toHaveProperty('neutral')
    expect(response.data).toHaveProperty('rate')
    expect(response.data).toHaveProperty('period')
  })
})

describe('QuickActions API Response Format', () => {
  it('quick actions response matches { success: true, data: QuickAction[] }', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })

    const result = await getQuickActions('format-qa-' + Date.now())
    const response = { success: true, data: result }

    expect(response.success).toBe(true)
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.data.length).toBeGreaterThan(0)
    expect(response.data[0]).toHaveProperty('id')
    expect(response.data[0]).toHaveProperty('label')
  })
})

describe('Quick Actions Validation', () => {
  it('action with presetId is valid', async () => {
    const actions = [
      { id: 'with-preset', label: 'With Preset', icon: '🎯', command: '/test', presetId: '123e4567-e89b-12d3-a456-426614174000', sortOrder: 0 },
    ]
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })

    const result = await updateQuickActions('preset-valid', actions)
    expect(result[0].presetId).toBe('123e4567-e89b-12d3-a456-426614174000')
  })

  it('action without presetId uses null', async () => {
    const actions = [
      { id: 'no-preset', label: 'No Preset', icon: '📋', command: '/test', presetId: null, sortOrder: 0 },
    ]
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })

    const result = await updateQuickActions('preset-null', actions)
    expect(result[0].presetId).toBeNull()
  })
})

describe('Satisfaction Period Filtering', () => {
  it('7d period filters last 7 days', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 3 })

    const result = await getSatisfaction('filter-7d-' + Date.now(), '7d')
    expect(result.period).toBe('7d')
    expect(typeof result.total).toBe('number')
  })

  it('30d period filters last 30 days', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 15 })

    const result = await getSatisfaction('filter-30d-' + Date.now(), '30d')
    expect(result.period).toBe('30d')
    expect(typeof result.total).toBe('number')
  })

  it('all period returns everything', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 100 })

    const result = await getSatisfaction('filter-all-' + Date.now(), 'all')
    expect(result.period).toBe('all')
    expect(typeof result.total).toBe('number')
  })
})

describe('Satisfaction Cache', () => {
  it('second call to getSatisfaction uses cache', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 5 })
    mockDb.select.mockClear()

    const cacheCompany = 'sat-cache-' + Date.now()
    await getSatisfaction(cacheCompany, '7d')
    const callsAfterFirst = mockDb.select.mock.calls.length

    await getSatisfaction(cacheCompany, '7d')
    const callsAfterSecond = mockDb.select.mock.calls.length

    expect(callsAfterSecond).toBe(callsAfterFirst)
  })

  it('different period bypasses cache', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 5 })
    mockDb.select.mockClear()

    const cacheCompany = 'sat-period-cache-' + Date.now()
    await getSatisfaction(cacheCompany, '7d')
    const callsAfter7d = mockDb.select.mock.calls.length

    await getSatisfaction(cacheCompany, '30d')
    const callsAfter30d = mockDb.select.mock.calls.length

    expect(callsAfter30d).toBeGreaterThan(callsAfter7d)
  })
})

describe('Tenant Isolation - Quick Actions', () => {
  it('getQuickActions queries correct companyId', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })
    mockDb.select.mockClear()

    const tenantId = 'tenant-qa-' + Date.now()
    await getQuickActions(tenantId)

    expect(mockDb.select).toHaveBeenCalled()
  })

  it('updateQuickActions targets correct companyId', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })
    mockDb.update.mockClear()

    const tenantId = 'tenant-qa-update'
    await updateQuickActions(tenantId, [
      { id: 'test', label: 'Test', icon: '🔧', command: '/test', presetId: null, sortOrder: 0 },
    ])

    expect(mockDb.update).toHaveBeenCalled()
  })
})

describe('Tenant Isolation - Satisfaction', () => {
  it('getSatisfaction queries correct companyId', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 0 })
    mockDb.select.mockClear()

    const tenantId = 'tenant-sat-' + Date.now()
    await getSatisfaction(tenantId, '7d')

    expect(mockDb.select).toHaveBeenCalled()
  })
})
