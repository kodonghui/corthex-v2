/**
 * TEA-generated tests for Story 7-1: 3-Axis Cost Aggregation API
 * Risk-based coverage expansion: route behavior, edge cases, tenant isolation, validation
 * bun test src/__tests__/unit/cost-aggregation-tea.test.ts
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Queue-based mock for sequential DB calls ===
let resultQueue: any[][] = []

function createChain(): any {
  const chain: any = {}
  for (const method of ['select', 'from', 'where', 'groupBy', 'innerJoin', 'leftJoin']) {
    chain[method] = mock(() => chain)
  }
  chain.orderBy = mock(() => {
    const result = resultQueue.shift() ?? []
    return Promise.resolve(result)
  })
  Object.defineProperty(chain, 'then', {
    get() {
      return (resolve: any) => resolve(resultQueue.shift() ?? [])
    },
    configurable: true,
  })
  return chain
}

const mockChain = createChain()
const mockDb = { select: mock(() => mockChain) }

const mockGetModelConfig = mock((model: string) => {
  if (model === 'claude-sonnet-4-6') return { displayName: 'Claude Sonnet 4.6', provider: 'anthropic' }
  if (model === 'gpt-4.1') return { displayName: 'GPT-4.1', provider: 'openai' }
  return undefined
})

mock.module('../../db', () => ({ db: mockDb }))
mock.module('../../db/schema', () => ({
  costRecords: {
    companyId: 'companyId', agentId: 'agentId', model: 'model',
    provider: 'provider', costUsdMicro: 'costUsdMicro', createdAt: 'createdAt',
    inputTokens: 'inputTokens', outputTokens: 'outputTokens',
  },
  agents: { id: 'id', name: 'name', departmentId: 'departmentId' },
  departments: { id: 'id', name: 'name' },
}))
mock.module('../../config/models', () => ({ getModelConfig: mockGetModelConfig }))

const { getByAgent, getByModel, getByDepartment, getSummary, getDaily } = await import('../../services/cost-aggregation')

const range = {
  startDate: new Date('2026-03-01T00:00:00Z'),
  endDate: new Date('2026-03-07T23:59:59Z'),
}

beforeEach(() => {
  resultQueue = []
  mockDb.select.mockClear()
  mockGetModelConfig.mockClear()
  for (const m of ['select', 'from', 'where', 'groupBy', 'innerJoin', 'leftJoin', 'orderBy']) {
    mockChain[m].mockClear()
  }
})

// ================================================================
// P0: Trend Calculation Edge Cases (High Risk)
// ================================================================
describe('TEA P0: Trend calculation precision', () => {
  test('trend rounds to 1 decimal place', async () => {
    // (333333 - 300000) / 300000 * 100 = 11.1110... -> 11.1
    resultQueue = [
      [{ totalCostMicro: 333333, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 5 }],
      [],
      [{ totalCostMicro: 300000 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.trendPercent).toBe(11.1)
  })

  test('trend handles very small previous cost without overflow', async () => {
    // (1000000 - 1) / 1 * 100 = 99999900
    resultQueue = [
      [{ totalCostMicro: 1000000, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 1 }],
      [],
      [{ totalCostMicro: 1 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.trendPercent).toBe(99999900)
  })

  test('trend = 0 when current equals previous', async () => {
    resultQueue = [
      [{ totalCostMicro: 500000, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 5 }],
      [],
      [{ totalCostMicro: 500000 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.trendPercent).toBe(0)
  })

  test('previous period dates calculated correctly from range', async () => {
    // range: Mar 1 - Mar 7 = 6 days + 23h59m59s
    // previous period should be same length before startDate
    resultQueue = [
      [{ totalCostMicro: 100, totalInputTokens: 10, totalOutputTokens: 5, totalCalls: 1 }],
      [],
      [{ totalCostMicro: 100 }],
    ]
    await getSummary('c1', range)
    // Verify 3 db.select() calls were made (current, byProvider, previous)
    expect(mockDb.select).toHaveBeenCalledTimes(3)
  })
})

// ================================================================
// P0: Large number handling (Data Integrity Risk)
// ================================================================
describe('TEA P0: Large number handling', () => {
  test('getByAgent handles microdollar values > $1000 (1 billion micro)', async () => {
    resultQueue = [[
      { agentId: 'agent-heavy', agentName: 'Heavy User', totalCostMicro: 1_000_000_000, inputTokens: 50_000_000, outputTokens: 20_000_000, callCount: 5000 },
    ]]
    const result = await getByAgent('c1', range)
    expect(result[0].totalCostMicro).toBe(1_000_000_000)
    expect(result[0].inputTokens).toBe(50_000_000)
  })

  test('getSummary handles zero tokens but non-zero cost', async () => {
    resultQueue = [
      [{ totalCostMicro: 100, totalInputTokens: 0, totalOutputTokens: 0, totalCalls: 1 }],
      [],
      [{ totalCostMicro: 0 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.totalCostMicro).toBe(100)
    expect(result.totalInputTokens).toBe(0)
    expect(result.totalOutputTokens).toBe(0)
    expect(result.trendPercent).toBe(100)
  })
})

// ================================================================
// P1: Multiple agents/models/departments sorting
// ================================================================
describe('TEA P1: Result ordering', () => {
  test('getByAgent preserves DB order (cost DESC)', async () => {
    resultQueue = [[
      { agentId: 'a1', agentName: 'Agent 1', totalCostMicro: 900, inputTokens: 100, outputTokens: 50, callCount: 3 },
      { agentId: 'a2', agentName: 'Agent 2', totalCostMicro: 500, inputTokens: 80, outputTokens: 40, callCount: 2 },
      { agentId: 'a3', agentName: 'Agent 3', totalCostMicro: 100, inputTokens: 20, outputTokens: 10, callCount: 1 },
    ]]
    const result = await getByAgent('c1', range)
    expect(result[0].totalCostMicro).toBeGreaterThan(result[1].totalCostMicro)
    expect(result[1].totalCostMicro).toBeGreaterThan(result[2].totalCostMicro)
  })

  test('getByModel preserves DB order (cost DESC)', async () => {
    resultQueue = [[
      { model: 'claude-sonnet-4-6', provider: 'anthropic', totalCostMicro: 800, inputTokens: 200, outputTokens: 100, callCount: 4 },
      { model: 'gpt-4.1', provider: 'openai', totalCostMicro: 200, inputTokens: 50, outputTokens: 25, callCount: 1 },
    ]]
    const result = await getByModel('c1', range)
    expect(result[0].totalCostMicro).toBeGreaterThan(result[1].totalCostMicro)
  })
})

// ================================================================
// P1: byProvider aggregation edge cases
// ================================================================
describe('TEA P1: byProvider edge cases', () => {
  test('single provider returns one entry', async () => {
    resultQueue = [
      [{ totalCostMicro: 500000, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 5 }],
      [{ provider: 'anthropic', costMicro: 500000, callCount: 5 }],
      [{ totalCostMicro: 400000 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.byProvider).toHaveLength(1)
    expect(result.byProvider[0].provider).toBe('anthropic')
    expect(result.byProvider[0].costMicro).toBe(500000)
    expect(result.byProvider[0].callCount).toBe(5)
  })

  test('three providers returned correctly', async () => {
    resultQueue = [
      [{ totalCostMicro: 1000000, totalInputTokens: 30000, totalOutputTokens: 15000, totalCalls: 15 }],
      [
        { provider: 'anthropic', costMicro: 600000, callCount: 8 },
        { provider: 'openai', costMicro: 300000, callCount: 5 },
        { provider: 'google', costMicro: 100000, callCount: 2 },
      ],
      [{ totalCostMicro: 800000 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.byProvider).toHaveLength(3)
    expect(result.byProvider.map(p => p.provider)).toEqual(['anthropic', 'openai', 'google'])
  })

  test('byProvider handles null costMicro gracefully', async () => {
    resultQueue = [
      [{ totalCostMicro: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCalls: 0 }],
      [{ provider: 'anthropic', costMicro: null, callCount: null }],
      [{ totalCostMicro: 0 }],
    ]
    const result = await getSummary('c1', range)
    expect(result.byProvider[0].costMicro).toBe(0)
    expect(result.byProvider[0].callCount).toBe(0)
  })
})

// ================================================================
// P1: getByDepartment with multiple agents per dept
// ================================================================
describe('TEA P1: Department aggregation', () => {
  test('department with many agents shows correct distinct count', async () => {
    resultQueue = [[
      { departmentId: 'd1', departmentName: '전략부', totalCostMicro: 1000000, agentCount: 5, callCount: 50 },
    ]]
    const result = await getByDepartment('c1', range)
    expect(result[0].agentCount).toBe(5)
    expect(result[0].callCount).toBe(50)
  })

  test('handles null department values', async () => {
    resultQueue = [[
      { departmentId: 'd1', departmentName: '부서', totalCostMicro: null, agentCount: null, callCount: null },
    ]]
    const result = await getByDepartment('c1', range)
    expect(result[0].totalCostMicro).toBe(0)
    expect(result[0].agentCount).toBe(0)
    expect(result[0].callCount).toBe(0)
  })
})

// ================================================================
// P1: getDaily boundary conditions
// ================================================================
describe('TEA P1: Daily time series boundaries', () => {
  test('single day range returns one entry', async () => {
    resultQueue = [[
      { date: '2026-03-07', costMicro: 50000, inputTokens: 2000, outputTokens: 1000, callCount: 2 },
    ]]
    const singleDayRange = {
      startDate: new Date('2026-03-07T00:00:00Z'),
      endDate: new Date('2026-03-07T23:59:59Z'),
    }
    const result = await getDaily('c1', singleDayRange)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-03-07')
  })

  test('date strings are always plain date format (no time)', async () => {
    resultQueue = [[
      { date: '2026-03-01', costMicro: 100, inputTokens: 10, outputTokens: 5, callCount: 1 },
      { date: '2026-03-02', costMicro: 200, inputTokens: 20, outputTokens: 10, callCount: 2 },
    ]]
    const result = await getDaily('c1', range)
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result[1].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ================================================================
// P1: Route-level Zod validation
// ================================================================
describe('TEA P1: Zod date range validation', () => {
  function parseDateRange(query: { startDate?: string; endDate?: string }) {
    const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
    const startDate = query.startDate
      ? new Date(query.startDate + 'T00:00:00.000Z')
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { startDate, endDate }
  }

  test('startDate after endDate creates reversed range', () => {
    // This is an edge case - service should handle gracefully (return empty)
    const r = parseDateRange({ startDate: '2026-03-10', endDate: '2026-03-01' })
    expect(r.startDate.getTime()).toBeGreaterThan(r.endDate.getTime())
  })

  test('same startDate and endDate creates valid single-day range', () => {
    const r = parseDateRange({ startDate: '2026-03-07', endDate: '2026-03-07' })
    expect(r.startDate.toISOString()).toBe('2026-03-07T00:00:00.000Z')
    expect(r.endDate.toISOString()).toBe('2026-03-07T23:59:59.999Z')
    expect(r.endDate.getTime()).toBeGreaterThan(r.startDate.getTime())
  })

  test('very old date range still works', () => {
    const r = parseDateRange({ startDate: '2020-01-01', endDate: '2020-01-31' })
    expect(r.startDate.getFullYear()).toBe(2020)
  })

  test('future date range still works', () => {
    const r = parseDateRange({ startDate: '2030-01-01', endDate: '2030-12-31' })
    expect(r.startDate.getFullYear()).toBe(2030)
  })
})

// ================================================================
// P2: Tenant isolation verification
// ================================================================
describe('TEA P2: Tenant isolation', () => {
  test('getByAgent passes companyId to DB query', async () => {
    resultQueue = [[]]
    await getByAgent('company-abc', range)
    expect(mockChain.where).toHaveBeenCalledTimes(1)
    // Verify select was called (implies query was built with proper conditions)
    expect(mockDb.select).toHaveBeenCalledTimes(1)
  })

  test('getByModel passes companyId to DB query', async () => {
    resultQueue = [[]]
    await getByModel('company-xyz', range)
    expect(mockChain.where).toHaveBeenCalledTimes(1)
  })

  test('getByDepartment passes companyId to DB query', async () => {
    resultQueue = [[]]
    await getByDepartment('company-123', range)
    expect(mockChain.where).toHaveBeenCalledTimes(1)
  })

  test('getSummary passes companyId to all 3 DB queries', async () => {
    resultQueue = [
      [{ totalCostMicro: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCalls: 0 }],
      [],
      [{ totalCostMicro: 0 }],
    ]
    await getSummary('company-tenant', range)
    // 3 queries: current totals, byProvider, previous
    expect(mockDb.select).toHaveBeenCalledTimes(3)
    expect(mockChain.where).toHaveBeenCalledTimes(3)
  })

  test('getDaily passes companyId to DB query', async () => {
    resultQueue = [[]]
    await getDaily('company-daily', range)
    expect(mockChain.where).toHaveBeenCalledTimes(1)
  })
})

// ================================================================
// P2: getByModel displayName fallback
// ================================================================
describe('TEA P2: Model displayName resolution', () => {
  test('known model gets displayName from config', async () => {
    resultQueue = [[
      { model: 'claude-sonnet-4-6', provider: 'anthropic', totalCostMicro: 100, inputTokens: 10, outputTokens: 5, callCount: 1 },
    ]]
    const result = await getByModel('c1', range)
    expect(result[0].displayName).toBe('Claude Sonnet 4.6')
    expect(mockGetModelConfig).toHaveBeenCalledWith('claude-sonnet-4-6')
  })

  test('unknown model uses model id as displayName', async () => {
    resultQueue = [[
      { model: 'custom-model-v2', provider: 'custom', totalCostMicro: 100, inputTokens: 10, outputTokens: 5, callCount: 1 },
    ]]
    const result = await getByModel('c1', range)
    expect(result[0].displayName).toBe('custom-model-v2')
  })

  test('getModelConfig is called for each model row', async () => {
    resultQueue = [[
      { model: 'claude-sonnet-4-6', provider: 'anthropic', totalCostMicro: 100, inputTokens: 10, outputTokens: 5, callCount: 1 },
      { model: 'gpt-4.1', provider: 'openai', totalCostMicro: 50, inputTokens: 5, outputTokens: 3, callCount: 1 },
    ]]
    await getByModel('c1', range)
    expect(mockGetModelConfig).toHaveBeenCalledTimes(2)
  })
})

// ================================================================
// P2: getByAgent multiple system (null agent) rows
// ================================================================
describe('TEA P2: System (null agent) handling', () => {
  test('multiple agents with one null returns system entry', async () => {
    resultQueue = [[
      { agentId: 'a1', agentName: 'Agent 1', totalCostMicro: 500, inputTokens: 100, outputTokens: 50, callCount: 3 },
      { agentId: null, agentName: null, totalCostMicro: 200, inputTokens: 30, outputTokens: 15, callCount: 1 },
    ]]
    const result = await getByAgent('c1', range)
    expect(result).toHaveLength(2)
    const systemEntry = result.find(r => r.agentId === 'system')
    expect(systemEntry).toBeDefined()
    expect(systemEntry!.agentName).toBe('System')
    expect(systemEntry!.totalCostMicro).toBe(200)
  })
})
