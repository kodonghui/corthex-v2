/**
 * cost-aggregation service unit tests
 * Tests 3-axis cost aggregation: by-agent, by-model, by-department, summary, daily
 * bun test src/__tests__/unit/cost-aggregation.test.ts
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock DB layer ===
// Queue-based mock: each db.select() call returns the next result in the queue
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
  // Make chain thenable for await without orderBy (e.g., destructuring [row])
  Object.defineProperty(chain, 'then', {
    get() {
      return (resolve: any) => {
        const result = resultQueue.shift() ?? []
        return resolve(result)
      }
    },
    configurable: true,
  })
  return chain
}

const mockChain = createChain()
const mockDb = { select: mock(() => mockChain) }

// Mock getModelConfig
const mockGetModelConfig = mock((model: string) => {
  const configs: Record<string, any> = {
    'claude-sonnet-4-6': { displayName: 'Claude Sonnet 4.6', provider: 'anthropic' },
    'gpt-4.1': { displayName: 'GPT-4.1', provider: 'openai' },
    'claude-haiku-4-5': { displayName: 'Claude Haiku 4.5', provider: 'anthropic' },
  }
  return configs[model] ?? undefined
})

// Mock modules
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

const defaultRange = {
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

// =====================
// getByAgent
// =====================
describe('getByAgent', () => {
  test('returns aggregated costs per agent', async () => {
    resultQueue = [[
      { agentId: 'agent-1', agentName: '비서관', totalCostMicro: 500000, inputTokens: 10000, outputTokens: 5000, callCount: 3 },
      { agentId: 'agent-2', agentName: '전략분석관', totalCostMicro: 300000, inputTokens: 8000, outputTokens: 3000, callCount: 2 },
    ]]
    const result = await getByAgent('c1', defaultRange)
    expect(result).toHaveLength(2)
    expect(result[0].agentId).toBe('agent-1')
    expect(result[0].agentName).toBe('비서관')
    expect(result[0].totalCostMicro).toBe(500000)
    expect(result[0].inputTokens).toBe(10000)
    expect(result[0].outputTokens).toBe(5000)
    expect(result[0].callCount).toBe(3)
  })

  test('returns "System" for null agentId', async () => {
    resultQueue = [[
      { agentId: null, agentName: null, totalCostMicro: 100000, inputTokens: 2000, outputTokens: 1000, callCount: 1 },
    ]]
    const result = await getByAgent('c1', defaultRange)
    expect(result[0].agentId).toBe('system')
    expect(result[0].agentName).toBe('System')
  })

  test('returns empty array when no records', async () => {
    resultQueue = [[]]
    expect(await getByAgent('c1', defaultRange)).toEqual([])
  })

  test('handles null aggregation values', async () => {
    resultQueue = [[
      { agentId: 'a1', agentName: 'Test', totalCostMicro: null, inputTokens: null, outputTokens: null, callCount: null },
    ]]
    const r = await getByAgent('c1', defaultRange)
    expect(r[0].totalCostMicro).toBe(0)
    expect(r[0].inputTokens).toBe(0)
    expect(r[0].outputTokens).toBe(0)
    expect(r[0].callCount).toBe(0)
  })

  test('uses LEFT JOIN for agents table', async () => {
    resultQueue = [[]]
    await getByAgent('c1', defaultRange)
    expect(mockChain.leftJoin).toHaveBeenCalledTimes(1)
    expect(mockChain.groupBy).toHaveBeenCalledTimes(1)
  })
})

// =====================
// getByModel
// =====================
describe('getByModel', () => {
  test('returns costs per model with displayName from models.yaml', async () => {
    resultQueue = [[
      { model: 'claude-sonnet-4-6', provider: 'anthropic', totalCostMicro: 800000, inputTokens: 20000, outputTokens: 10000, callCount: 5 },
      { model: 'gpt-4.1', provider: 'openai', totalCostMicro: 200000, inputTokens: 5000, outputTokens: 2000, callCount: 2 },
    ]]
    const result = await getByModel('c1', defaultRange)
    expect(result).toHaveLength(2)
    expect(result[0].displayName).toBe('Claude Sonnet 4.6')
    expect(result[0].provider).toBe('anthropic')
    expect(result[1].displayName).toBe('GPT-4.1')
  })

  test('uses model id as displayName for unknown models', async () => {
    resultQueue = [[
      { model: 'unknown-model', provider: 'custom', totalCostMicro: 100000, inputTokens: 1000, outputTokens: 500, callCount: 1 },
    ]]
    const result = await getByModel('c1', defaultRange)
    expect(result[0].displayName).toBe('unknown-model')
  })

  test('returns empty array when no records', async () => {
    resultQueue = [[]]
    expect(await getByModel('c1', defaultRange)).toEqual([])
  })

  test('groups by model AND provider', async () => {
    resultQueue = [[]]
    await getByModel('c1', defaultRange)
    expect(mockChain.groupBy).toHaveBeenCalledTimes(1)
  })
})

// =====================
// getByDepartment
// =====================
describe('getByDepartment', () => {
  test('returns costs per department with agent count', async () => {
    resultQueue = [[
      { departmentId: 'dept-1', departmentName: '전략부', totalCostMicro: 600000, agentCount: 3, callCount: 8 },
      { departmentId: 'dept-2', departmentName: '마케팅부', totalCostMicro: 400000, agentCount: 2, callCount: 5 },
    ]]
    const result = await getByDepartment('c1', defaultRange)
    expect(result).toHaveLength(2)
    expect(result[0].departmentId).toBe('dept-1')
    expect(result[0].departmentName).toBe('전략부')
    expect(result[0].agentCount).toBe(3)
  })

  test('uses INNER JOIN to exclude system calls without agent/dept', async () => {
    resultQueue = [[]]
    await getByDepartment('c1', defaultRange)
    expect(mockChain.innerJoin).toHaveBeenCalledTimes(2)
  })

  test('returns empty array when no records', async () => {
    resultQueue = [[]]
    expect(await getByDepartment('c1', defaultRange)).toEqual([])
  })
})

// =====================
// getSummary
// =====================
describe('getSummary', () => {
  test('returns totals, byProvider, and positive trend', async () => {
    // getSummary makes 3 DB calls: totals, byProvider, previous period
    resultQueue = [
      [{ totalCostMicro: 1000000, totalInputTokens: 50000, totalOutputTokens: 20000, totalCalls: 10 }],
      [
        { provider: 'anthropic', costMicro: 700000, callCount: 7 },
        { provider: 'openai', costMicro: 300000, callCount: 3 },
      ],
      [{ totalCostMicro: 800000 }],
    ]
    const result = await getSummary('c1', defaultRange)
    expect(result.totalCostMicro).toBe(1000000)
    expect(result.totalInputTokens).toBe(50000)
    expect(result.totalOutputTokens).toBe(20000)
    expect(result.totalCalls).toBe(10)
    expect(result.byProvider).toHaveLength(2)
    expect(result.byProvider[0].provider).toBe('anthropic')
    expect(result.trendPercent).toBe(25) // (1M - 800K) / 800K * 100
  })

  test('trend = 100 when previous is 0 but current > 0', async () => {
    resultQueue = [
      [{ totalCostMicro: 500000, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 5 }],
      [],
      [{ totalCostMicro: 0 }],
    ]
    expect((await getSummary('c1', defaultRange)).trendPercent).toBe(100)
  })

  test('trend = 0 when both periods are 0', async () => {
    resultQueue = [
      [{ totalCostMicro: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCalls: 0 }],
      [],
      [{ totalCostMicro: 0 }],
    ]
    expect((await getSummary('c1', defaultRange)).trendPercent).toBe(0)
  })

  test('negative trend when cost decreased', async () => {
    resultQueue = [
      [{ totalCostMicro: 400000, totalInputTokens: 10000, totalOutputTokens: 5000, totalCalls: 5 }],
      [{ provider: 'anthropic', costMicro: 400000, callCount: 5 }],
      [{ totalCostMicro: 800000 }],
    ]
    expect((await getSummary('c1', defaultRange)).trendPercent).toBe(-50)
  })

  test('handles null totals gracefully', async () => {
    resultQueue = [
      [{ totalCostMicro: null, totalInputTokens: null, totalOutputTokens: null, totalCalls: 0 }],
      [],
      [{ totalCostMicro: null }],
    ]
    const result = await getSummary('c1', defaultRange)
    expect(result.totalCostMicro).toBe(0)
    expect(result.totalInputTokens).toBe(0)
    expect(result.totalOutputTokens).toBe(0)
    expect(result.byProvider).toEqual([])
    expect(result.trendPercent).toBe(0)
  })

  test('handles empty DB result (no rows)', async () => {
    resultQueue = [[], [], []]
    const result = await getSummary('c1', defaultRange)
    expect(result.totalCostMicro).toBe(0)
    expect(result.totalCalls).toBe(0)
  })
})

// =====================
// getDaily
// =====================
describe('getDaily', () => {
  test('returns daily time series', async () => {
    resultQueue = [[
      { date: '2026-03-01', costMicro: 100000, inputTokens: 5000, outputTokens: 2000, callCount: 3 },
      { date: '2026-03-02', costMicro: 200000, inputTokens: 8000, outputTokens: 3000, callCount: 5 },
      { date: '2026-03-03', costMicro: 150000, inputTokens: 6000, outputTokens: 2500, callCount: 4 },
    ]]
    const result = await getDaily('c1', defaultRange)
    expect(result).toHaveLength(3)
    expect(result[0].date).toBe('2026-03-01')
    expect(result[0].costMicro).toBe(100000)
    expect(result[2].date).toBe('2026-03-03')
  })

  test('empty array for no data', async () => {
    resultQueue = [[]]
    expect(await getDaily('c1', defaultRange)).toEqual([])
  })

  test('handles null values', async () => {
    resultQueue = [[
      { date: '2026-03-01', costMicro: null, inputTokens: null, outputTokens: null, callCount: null },
    ]]
    const r = await getDaily('c1', defaultRange)
    expect(r[0].costMicro).toBe(0)
    expect(r[0].inputTokens).toBe(0)
    expect(r[0].outputTokens).toBe(0)
    expect(r[0].callCount).toBe(0)
  })
})

// =====================
// parseDateRange (route helper)
// =====================
describe('parseDateRange', () => {
  function parseDateRange(query: { startDate?: string; endDate?: string }) {
    const endDate = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
    const startDate = query.startDate
      ? new Date(query.startDate + 'T00:00:00.000Z')
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { startDate, endDate }
  }

  test('both dates provided', () => {
    const r = parseDateRange({ startDate: '2026-03-01', endDate: '2026-03-07' })
    expect(r.startDate.toISOString()).toBe('2026-03-01T00:00:00.000Z')
    expect(r.endDate.toISOString()).toBe('2026-03-07T23:59:59.999Z')
  })

  test('only endDate -> startDate defaults to 30 days before', () => {
    const r = parseDateRange({ endDate: '2026-03-07' })
    expect(r.endDate.toISOString()).toBe('2026-03-07T23:59:59.999Z')
    const diff = r.endDate.getTime() - r.startDate.getTime()
    expect(diff).toBe(30 * 24 * 60 * 60 * 1000)
  })

  test('no dates -> endDate=now, startDate=30d ago', () => {
    const before = Date.now()
    const r = parseDateRange({})
    expect(r.endDate.getTime()).toBeGreaterThanOrEqual(before)
    expect(r.endDate.getTime() - r.startDate.getTime()).toBe(30 * 24 * 60 * 60 * 1000)
  })

  test('only startDate -> endDate defaults to now', () => {
    const before = Date.now()
    const r = parseDateRange({ startDate: '2026-02-01' })
    expect(r.startDate.toISOString()).toBe('2026-02-01T00:00:00.000Z')
    expect(r.endDate.getTime()).toBeGreaterThanOrEqual(before)
  })
})

// =====================
// Response format validation
// =====================
describe('response format', () => {
  test('list endpoints: { success, data: { items, meta } }', () => {
    const resp = {
      success: true as const,
      data: {
        items: [{ agentId: 'a1', agentName: 'T', totalCostMicro: 100, inputTokens: 50, outputTokens: 30, callCount: 1 }],
        meta: { startDate: '2026-03-01T00:00:00.000Z', endDate: '2026-03-07T23:59:59.999Z' },
      },
    }
    expect(resp.success).toBe(true)
    expect(resp.data.items).toBeInstanceOf(Array)
    expect(resp.data.meta.startDate).toBeDefined()
    expect(resp.data.meta.endDate).toBeDefined()
  })

  test('summary endpoint: { success, data: { ...summary, meta } }', () => {
    const resp = {
      success: true as const,
      data: {
        totalCostMicro: 1000000, totalInputTokens: 50000, totalOutputTokens: 20000, totalCalls: 10,
        byProvider: [{ provider: 'anthropic', costMicro: 700000, callCount: 7 }],
        trendPercent: 25,
        meta: { startDate: '2026-03-01T00:00:00.000Z', endDate: '2026-03-07T23:59:59.999Z' },
      },
    }
    expect(resp.data.totalCostMicro).toBe(1000000)
    expect(resp.data.byProvider).toBeInstanceOf(Array)
    expect(resp.data.trendPercent).toBe(25)
  })
})

// =====================
// Type safety
// =====================
describe('type fields', () => {
  test('AdminCostByAgent fields', async () => {
    resultQueue = [[{ agentId: 'a1', agentName: 'T', totalCostMicro: 100, inputTokens: 50, outputTokens: 30, callCount: 1 }]]
    const r = (await getByAgent('c1', defaultRange))[0]
    expect(typeof r.agentId).toBe('string')
    expect(typeof r.agentName).toBe('string')
    expect(typeof r.totalCostMicro).toBe('number')
    expect(typeof r.inputTokens).toBe('number')
    expect(typeof r.outputTokens).toBe('number')
    expect(typeof r.callCount).toBe('number')
  })

  test('AdminCostByModel fields', async () => {
    resultQueue = [[{ model: 'claude-sonnet-4-6', provider: 'anthropic', totalCostMicro: 100, inputTokens: 50, outputTokens: 30, callCount: 1 }]]
    const r = (await getByModel('c1', defaultRange))[0]
    expect(typeof r.model).toBe('string')
    expect(typeof r.provider).toBe('string')
    expect(typeof r.displayName).toBe('string')
    expect(typeof r.totalCostMicro).toBe('number')
  })

  test('AdminCostByDepartment fields', async () => {
    resultQueue = [[{ departmentId: 'd1', departmentName: '전략부', totalCostMicro: 100, agentCount: 2, callCount: 3 }]]
    const r = (await getByDepartment('c1', defaultRange))[0]
    expect(typeof r.departmentId).toBe('string')
    expect(typeof r.departmentName).toBe('string')
    expect(typeof r.totalCostMicro).toBe('number')
    expect(typeof r.agentCount).toBe('number')
    expect(typeof r.callCount).toBe('number')
  })
})
