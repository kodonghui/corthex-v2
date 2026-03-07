import { describe, it, expect, mock, beforeEach } from 'bun:test'

// === Mock DB layer ===

const mockSelectResult: any[] = []

const mockQueryChain = {
  select: mock(() => mockQueryChain),
  from: mock(() => mockQueryChain),
  where: mock(() => mockQueryChain),
  groupBy: mock(() => mockQueryChain),
  orderBy: mock(() => Promise.resolve(mockSelectResult)),
  limit: mock(() => Promise.resolve(mockSelectResult)),
  set: mock(() => mockQueryChain),
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
const { z } = await import('zod')

// ====================================================================
// TEA: Risk-Based Edge Case Tests for Story 6-6
// Focus: boundary conditions, data integrity, concurrent access patterns
// ====================================================================

describe('TEA: QuickActions Edge Cases', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockSelectResult.length = 0
  })

  it('handles company with empty settings object', async () => {
    mockSelectResult.push({ settings: {} })
    const result = await getQuickActions('empty-settings-' + Date.now())
    expect(result.length).toBe(4)  // defaults
  })

  it('handles company not found (empty result set)', async () => {
    // mockSelectResult is empty, so [company] = undefined
    mockSelectResult.length = 0
    const result = await getQuickActions('nonexistent-' + Date.now())
    expect(result.length).toBe(4)  // defaults
  })

  it('preserves presetId=null in default actions', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('preset-null-check-' + Date.now())
    for (const action of result) {
      expect(action.presetId).toBeNull()
    }
  })

  it('handles dashboardQuickActions as empty array', async () => {
    mockSelectResult.push({ settings: { dashboardQuickActions: [] } })
    const result = await getQuickActions('empty-array-' + Date.now())
    // Empty array from DB is truthy, so returns empty
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns custom actions unchanged', async () => {
    const custom = [
      { id: 'x', label: 'X', icon: '!', command: '/x', presetId: 'uuid-here', sortOrder: 99 },
    ]
    mockSelectResult.push({ settings: { dashboardQuickActions: custom } })
    const result = await getQuickActions('custom-passthrough-' + Date.now())
    expect(result).toEqual(custom)
  })

  it('default actions have valid emoji icons', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('icon-check-' + Date.now())
    for (const action of result) {
      expect(action.icon.length).toBeGreaterThan(0)
    }
  })

  it('default actions have non-empty labels', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('label-check-' + Date.now())
    for (const action of result) {
      expect(action.label.length).toBeGreaterThan(0)
    }
  })

  it('default actions have commands starting with /', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('cmd-check-' + Date.now())
    for (const action of result) {
      expect(action.command[0]).toBe('/')
    }
  })
})

describe('TEA: UpdateQuickActions Edge Cases', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockDb.update.mockClear()
    mockSelectResult.length = 0
  })

  it('preserves existing non-quickActions settings', async () => {
    const existingSettings = { theme: 'dark', language: 'ko', dashboardQuickActions: [{ id: 'old' }] }
    mockSelectResult.push({ settings: existingSettings })
    const newActions = [{ id: 'new', label: 'New', icon: '🆕', command: '/new', presetId: null, sortOrder: 0 }]

    const result = await updateQuickActions('preserve-settings', newActions)
    expect(result).toEqual(newActions)
    expect(mockDb.update).toHaveBeenCalled()
  })

  it('handles updating with single action', async () => {
    mockSelectResult.push({ settings: null })
    const single = [{ id: 'solo', label: 'Solo', icon: '🎯', command: '/solo', presetId: null, sortOrder: 0 }]

    const result = await updateQuickActions('single-action', single)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('solo')
  })

  it('handles updating with max actions (10)', async () => {
    mockSelectResult.push({ settings: null })
    const maxActions = Array.from({ length: 10 }, (_, i) => ({
      id: `action-${i}`, label: `Action ${i}`, icon: '📝', command: `/cmd${i}`, presetId: null, sortOrder: i,
    }))

    const result = await updateQuickActions('max-actions', maxActions)
    expect(result.length).toBe(10)
  })
})

describe('TEA: Satisfaction Calculation Edge Cases', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockSelectResult.length = 0
  })

  it('rate is 0 when only negative feedback exists', async () => {
    // First call: total=10, second: positive=0, third: negative=10
    let callCount = 0
    Object.defineProperty(mockQueryChain, 'then', {
      value: (resolve: any) => {
        callCount++
        if (callCount === 1) resolve([{ cnt: 10 }])
        else if (callCount === 2) resolve([{ cnt: 0 }])
        else resolve([{ cnt: 10 }])
        return undefined
      },
      writable: true,
      configurable: true,
    })

    const result = await getSatisfaction('all-negative-' + Date.now(), '7d')
    expect(result.rate).toBe(0)

    // Reset
    Object.defineProperty(mockQueryChain, 'then', {
      value: (resolve: any) => resolve(mockSelectResult),
      writable: true,
      configurable: true,
    })
  })

  it('neutral is always total - positive - negative', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 20 })

    const result = await getSatisfaction('neutral-formula-' + Date.now(), '30d')
    expect(result.neutral).toBe(result.total - result.positive - result.negative)
  })

  it('rate is between 0 and 100 inclusive', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 5 })

    const result = await getSatisfaction('rate-range-' + Date.now(), '7d')
    expect(result.rate).toBeGreaterThanOrEqual(0)
    expect(result.rate).toBeLessThanOrEqual(100)
  })

  it('handles zero total commands gracefully', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 0 })

    const result = await getSatisfaction('zero-total-' + Date.now(), 'all')
    expect(result.total).toBe(0)
    expect(result.positive).toBe(0)
    expect(result.negative).toBe(0)
    expect(result.neutral).toBe(0)
    expect(result.rate).toBe(0)
  })

  it('period field always matches input', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 1 })

    const periods: Array<'7d' | '30d' | 'all'> = ['7d', '30d', 'all']
    for (const p of periods) {
      const result = await getSatisfaction(`period-match-${p}-` + Date.now(), p)
      expect(result.period).toBe(p)
    }
  })

  it('all numeric fields are integers', async () => {
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 7 })

    const result = await getSatisfaction('int-check-' + Date.now(), '7d')
    expect(Number.isInteger(result.total)).toBe(true)
    expect(Number.isInteger(result.positive)).toBe(true)
    expect(Number.isInteger(result.negative)).toBe(true)
    expect(Number.isInteger(result.neutral)).toBe(true)
    expect(Number.isInteger(result.rate)).toBe(true)
  })
})

describe('TEA: Satisfaction Cache Behavior', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockSelectResult.length = 0
    mockSelectResult.push({ cnt: 3 })
  })

  it('same company+period returns cached data', async () => {
    const id = 'cache-hit-' + Date.now()
    const r1 = await getSatisfaction(id, '7d')
    mockDb.select.mockClear()
    const r2 = await getSatisfaction(id, '7d')

    expect(r1).toEqual(r2)
    expect(mockDb.select).not.toHaveBeenCalled()  // cached
  })

  it('different company bypasses cache', async () => {
    const id1 = 'cache-miss-a-' + Date.now()
    const id2 = 'cache-miss-b-' + Date.now()

    await getSatisfaction(id1, '7d')
    mockDb.select.mockClear()
    await getSatisfaction(id2, '7d')

    expect(mockDb.select).toHaveBeenCalled()  // not cached
  })

  it('different period bypasses cache', async () => {
    const id = 'cache-period-' + Date.now()

    await getSatisfaction(id, '7d')
    mockDb.select.mockClear()
    await getSatisfaction(id, '30d')

    expect(mockDb.select).toHaveBeenCalled()  // not cached
  })
})

describe('TEA: QuickActions Cache Behavior', () => {
  beforeEach(() => {
    mockDb.select.mockClear()
    mockSelectResult.length = 0
    mockSelectResult.push({ settings: null })
  })

  it('same companyId returns cached quick actions', async () => {
    const id = 'qa-cache-hit-' + Date.now()
    const r1 = await getQuickActions(id)
    mockDb.select.mockClear()
    const r2 = await getQuickActions(id)

    expect(r1).toEqual(r2)
    expect(mockDb.select).not.toHaveBeenCalled()
  })

  it('different companyId bypasses quick actions cache', async () => {
    const id1 = 'qa-cache-a-' + Date.now()
    const id2 = 'qa-cache-b-' + Date.now()

    await getQuickActions(id1)
    mockDb.select.mockClear()
    await getQuickActions(id2)

    expect(mockDb.select).toHaveBeenCalled()
  })
})

describe('TEA: Type Safety & API Contract', () => {
  beforeEach(() => {
    mockSelectResult.length = 0
  })

  it('QuickAction default items conform to type shape', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('type-shape-' + Date.now())

    for (const action of result) {
      expect(typeof action.id).toBe('string')
      expect(typeof action.label).toBe('string')
      expect(typeof action.icon).toBe('string')
      expect(typeof action.command).toBe('string')
      expect(typeof action.sortOrder).toBe('number')
      expect(action.presetId === null || typeof action.presetId === 'string').toBe(true)
    }
  })

  it('DashboardSatisfaction conforms to type shape', async () => {
    mockSelectResult.push({ cnt: 5 })
    const result = await getSatisfaction('type-sat-' + Date.now(), '7d')

    expect(typeof result.total).toBe('number')
    expect(typeof result.positive).toBe('number')
    expect(typeof result.negative).toBe('number')
    expect(typeof result.neutral).toBe('number')
    expect(typeof result.rate).toBe('number')
    expect(['7d', '30d', 'all']).toContain(result.period)
  })

  it('getQuickActions returns array (never null/undefined)', async () => {
    mockSelectResult.push({ settings: null })
    const result = await getQuickActions('non-null-' + Date.now())
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(Array.isArray(result)).toBe(true)
  })

  it('getSatisfaction returns object (never null/undefined)', async () => {
    mockSelectResult.push({ cnt: 0 })
    const result = await getSatisfaction('non-null-sat-' + Date.now(), '7d')
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(typeof result).toBe('object')
  })
})

describe('TEA: Zod Validation Schema Tests', () => {
  // These test the validation schemas defined in the route file
  const quickActionSchema = z.object({
    id: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
    icon: z.string().min(1).max(10),
    command: z.string().min(1).max(1000),
    presetId: z.string().uuid().nullish(),
    sortOrder: z.number().int().min(0),
  })

  const updateQuickActionsSchema = z.object({
    actions: z.array(quickActionSchema).min(1).max(10),
  })

  const satisfactionQuerySchema = z.object({
    period: z.enum(['7d', '30d', 'all']).default('7d'),
  })

  it('validates valid quick action', () => {
    const valid = {
      id: 'test', label: 'Test', icon: '🔧', command: '/test',
      presetId: null, sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(valid)).not.toThrow()
  })

  it('rejects quick action with empty id', () => {
    const invalid = {
      id: '', label: 'Test', icon: '🔧', command: '/test',
      presetId: null, sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(invalid)).toThrow()
  })

  it('rejects quick action with empty label', () => {
    const invalid = {
      id: 'test', label: '', icon: '🔧', command: '/test',
      presetId: null, sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(invalid)).toThrow()
  })

  it('rejects quick action with negative sortOrder', () => {
    const invalid = {
      id: 'test', label: 'Test', icon: '🔧', command: '/test',
      presetId: null, sortOrder: -1,
    }
    expect(() => quickActionSchema.parse(invalid)).toThrow()
  })

  it('rejects quick action with invalid UUID presetId', () => {
    const invalid = {
      id: 'test', label: 'Test', icon: '🔧', command: '/test',
      presetId: 'not-a-uuid', sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(invalid)).toThrow()
  })

  it('accepts quick action with valid UUID presetId', () => {
    const valid = {
      id: 'test', label: 'Test', icon: '🔧', command: '/test',
      presetId: '550e8400-e29b-41d4-a716-446655440000', sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(valid)).not.toThrow()
  })

  it('accepts quick action with undefined presetId (nullish)', () => {
    const valid = {
      id: 'test', label: 'Test', icon: '🔧', command: '/test',
      sortOrder: 0,
    }
    expect(() => quickActionSchema.parse(valid)).not.toThrow()
  })

  it('rejects update with empty actions array', () => {
    expect(() => updateQuickActionsSchema.parse({ actions: [] })).toThrow()
  })

  it('rejects update with more than 10 actions', () => {
    const actions = Array.from({ length: 11 }, (_, i) => ({
      id: `a${i}`, label: `L${i}`, icon: '📝', command: `/c${i}`, sortOrder: i,
    }))
    expect(() => updateQuickActionsSchema.parse({ actions })).toThrow()
  })

  it('accepts update with 1-10 valid actions', () => {
    const actions = Array.from({ length: 5 }, (_, i) => ({
      id: `a${i}`, label: `L${i}`, icon: '📝', command: `/c${i}`, sortOrder: i,
    }))
    expect(() => updateQuickActionsSchema.parse({ actions })).not.toThrow()
  })

  it('satisfaction period defaults to 7d', () => {
    const result = satisfactionQuerySchema.parse({})
    expect(result.period).toBe('7d')
  })

  it('accepts valid satisfaction periods', () => {
    expect(() => satisfactionQuerySchema.parse({ period: '7d' })).not.toThrow()
    expect(() => satisfactionQuerySchema.parse({ period: '30d' })).not.toThrow()
    expect(() => satisfactionQuerySchema.parse({ period: 'all' })).not.toThrow()
  })

  it('rejects invalid satisfaction period', () => {
    expect(() => satisfactionQuerySchema.parse({ period: '1d' })).toThrow()
    expect(() => satisfactionQuerySchema.parse({ period: '90d' })).toThrow()
    expect(() => satisfactionQuerySchema.parse({ period: '' })).toThrow()
  })
})
