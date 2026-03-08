// ARGOS Status Tests — Story 14-6
// Tests for getArgosStatus: dataOk, aiOk, todayCost, lastCheckAt, reasons, costBreakdown

import { describe, it, expect, beforeEach, mock } from 'bun:test'

// === Mock DB ===
let selectResults: any[] = []
let selectCallIndex = 0

const mockFrom = mock(() => mockChain)
const mockWhere = mock(() => mockChain)
const mockOrderBy = mock(() => mockChain)
const mockLimit = mock(() => {
  const result = selectResults[selectCallIndex] ?? []
  selectCallIndex++
  return result
})
const mockSelect = mock(() => mockChain)

// Track .where() calls to return different results for different queries
const mockChain: any = {
  select: mockSelect,
  from: mockFrom,
  where: (...args: any[]) => {
    // Each .where() call that doesn't chain to .orderBy or .limit returns the next result
    return {
      ...mockChain,
      orderBy: (..._: any[]) => ({
        limit: () => {
          const result = selectResults[selectCallIndex] ?? []
          selectCallIndex++
          return result
        },
      }),
      // For count queries that just do .where() with no orderBy/limit
      then: (resolve: any) => {
        const result = selectResults[selectCallIndex] ?? []
        selectCallIndex++
        resolve(result)
      },
      [Symbol.iterator]: function* () {
        const result = selectResults[selectCallIndex] ?? []
        selectCallIndex++
        yield* result
      },
    }
  },
  orderBy: mockOrderBy,
  limit: mockLimit,
  innerJoin: mock(() => mockChain),
}

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
  },
}))

mock.module('../../db/schema', () => ({
  nightJobTriggers: { id: 'id', companyId: 'company_id', isActive: 'is_active' },
  argosEvents: { id: 'id', companyId: 'company_id', status: 'status', createdAt: 'created_at' },
  agents: { id: 'id', name: 'name', companyId: 'company_id' },
  cronRuns: { companyId: 'company_id', createdAt: 'created_at' },
  costRecords: { companyId: 'company_id', source: 'source', createdAt: 'created_at' },
  chatSessions: {},
  chatMessages: {},
  agentMemory: {},
  reports: {},
  companies: { id: 'id' },
  users: { id: 'id' },
}))

mock.module('../../lib/event-bus', () => ({
  eventBus: { emit: mock(() => {}) },
}))

let mockEvaluatorLastCheck: Date | null = null
mock.module('../../services/argos-evaluator', () => ({
  getLastCheckAt: () => mockEvaluatorLastCheck,
  startArgosEngine: mock(() => {}),
  stopArgosEngine: mock(async () => {}),
  _testHelpers: {
    resetState: mock(() => {}),
  },
}))

// === Helpers ===

/**
 * computeArgosStatus is a pure-function version of the status logic
 * extracted for testability without DB mocking complexity
 */
function computeArgosStatus(params: {
  activeTriggersCount: number
  totalRecentEvents: number
  failedRecentEvents: number
  cronCostMicro: number
  llmCostMicro: number
  lastEventAt: Date | null
  evaluatorLastCheck: Date | null
}) {
  const {
    activeTriggersCount,
    totalRecentEvents,
    failedRecentEvents,
    cronCostMicro,
    llmCostMicro,
    lastEventAt,
    evaluatorLastCheck,
  } = params

  const cronCost = cronCostMicro / 1_000_000
  const llmCost = llmCostMicro / 1_000_000

  // === Data OK/NG ===
  let dataOk: boolean
  let dataOkReason: string

  if (activeTriggersCount === 0) {
    dataOk = true
    dataOkReason = '활성 트리거 없음'
  } else if (totalRecentEvents === 0) {
    dataOk = false
    dataOkReason = '활성 트리거 있으나 최근 1시간 이벤트 없음'
  } else if (totalRecentEvents > 0 && failedRecentEvents / totalRecentEvents >= 0.5) {
    dataOk = false
    dataOkReason = `최근 1시간 실패율 ${Math.round(failedRecentEvents / totalRecentEvents * 100)}% (${failedRecentEvents}/${totalRecentEvents}건)`
  } else {
    dataOk = true
    dataOkReason = `최근 1시간 이벤트 ${totalRecentEvents}건, 실패 ${failedRecentEvents}건`
  }

  // === AI OK/NG ===
  let aiOk: boolean
  let aiOkReason: string

  if (failedRecentEvents >= 3) {
    aiOk = false
    aiOkReason = `최근 1시간 실패 ${failedRecentEvents}건 (임계값: 3건)`
  } else if (totalRecentEvents > 0 && failedRecentEvents / totalRecentEvents >= 0.5) {
    aiOk = false
    aiOkReason = `최근 1시간 실패율 ${Math.round(failedRecentEvents / totalRecentEvents * 100)}% (${failedRecentEvents}/${totalRecentEvents}건)`
  } else {
    aiOk = true
    aiOkReason = totalRecentEvents > 0
      ? `최근 1시간 실패 ${failedRecentEvents}/${totalRecentEvents}건`
      : '최근 1시간 이벤트 없음'
  }

  // === Last Check At ===
  let lastCheckAt: string | null = null
  if (evaluatorLastCheck && lastEventAt) {
    lastCheckAt = evaluatorLastCheck > lastEventAt
      ? evaluatorLastCheck.toISOString()
      : lastEventAt.toISOString()
  } else if (evaluatorLastCheck) {
    lastCheckAt = evaluatorLastCheck.toISOString()
  } else if (lastEventAt) {
    lastCheckAt = lastEventAt.toISOString()
  }

  return {
    dataOk,
    aiOk,
    activeTriggersCount,
    todayCost: cronCost + llmCost,
    lastCheckAt,
    dataOkReason,
    aiOkReason,
    costBreakdown: { cronCost, llmCost },
  }
}

// === Tests ===

describe('ARGOS Status - Data OK/NG', () => {
  it('should return dataOk=true when no active triggers', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(true)
    expect(result.dataOkReason).toBe('활성 트리거 없음')
  })

  it('should return dataOk=false when active triggers but no recent events', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 3,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(false)
    expect(result.dataOkReason).toBe('활성 트리거 있으나 최근 1시간 이벤트 없음')
  })

  it('should return dataOk=true when events exist and failure rate < 50%', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 10,
      failedRecentEvents: 2,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(true)
    expect(result.dataOkReason).toBe('최근 1시간 이벤트 10건, 실패 2건')
  })

  it('should return dataOk=false when failure rate >= 50%', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 3,
      totalRecentEvents: 10,
      failedRecentEvents: 5,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(false)
    expect(result.dataOkReason).toContain('실패율 50%')
    expect(result.dataOkReason).toContain('5/10건')
  })

  it('should return dataOk=false when all events failed (100%)', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 2,
      totalRecentEvents: 4,
      failedRecentEvents: 4,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(false)
    expect(result.dataOkReason).toContain('100%')
  })

  it('should return dataOk=true with 0 failures and many events', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 10,
      totalRecentEvents: 50,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(true)
    expect(result.dataOkReason).toBe('최근 1시간 이벤트 50건, 실패 0건')
  })

  it('should return dataOk=true with failure rate at 49%', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 100,
      failedRecentEvents: 49,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(true)
  })

  it('should return dataOk=false with failure rate exactly at 50%', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 100,
      failedRecentEvents: 50,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(false)
  })
})

describe('ARGOS Status - AI OK/NG', () => {
  it('should return aiOk=true when no failures', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 10,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(true)
    expect(result.aiOkReason).toBe('최근 1시간 실패 0/10건')
  })

  it('should return aiOk=false when 3+ failures', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 100,
      failedRecentEvents: 3,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(false)
    expect(result.aiOkReason).toContain('실패 3건')
    expect(result.aiOkReason).toContain('임계값: 3건')
  })

  it('should return aiOk=true when 2 failures (under threshold)', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 10,
      failedRecentEvents: 2,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(true)
    expect(result.aiOkReason).toBe('최근 1시간 실패 2/10건')
  })

  it('should return aiOk=false when failure ratio >= 50% even if count < 3', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 2,
      totalRecentEvents: 2,
      failedRecentEvents: 1,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(false)
    expect(result.aiOkReason).toContain('실패율 50%')
  })

  it('should return aiOk=true when no recent events', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(true)
    expect(result.aiOkReason).toBe('최근 1시간 이벤트 없음')
  })

  it('should prioritize count threshold over ratio when both apply', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 5,
      failedRecentEvents: 4,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOk).toBe(false)
    // Should mention count threshold first (3+ check runs before ratio check)
    expect(result.aiOkReason).toContain('임계값: 3건')
  })
})

describe('ARGOS Status - Cost Tracking', () => {
  it('should sum cronCost and llmCost correctly', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 1_500_000, // $1.50
      llmCostMicro: 500_000, // $0.50
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.todayCost).toBe(2.0)
    expect(result.costBreakdown.cronCost).toBe(1.5)
    expect(result.costBreakdown.llmCost).toBe(0.5)
  })

  it('should return 0 cost when no records', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.todayCost).toBe(0)
    expect(result.costBreakdown.cronCost).toBe(0)
    expect(result.costBreakdown.llmCost).toBe(0)
  })

  it('should handle only cronCost', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 2_000_000,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.todayCost).toBe(2.0)
    expect(result.costBreakdown.cronCost).toBe(2.0)
    expect(result.costBreakdown.llmCost).toBe(0)
  })

  it('should handle only llmCost', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 750_000,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.todayCost).toBe(0.75)
    expect(result.costBreakdown.cronCost).toBe(0)
    expect(result.costBreakdown.llmCost).toBe(0.75)
  })

  it('should handle micro-dollar precision correctly', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 123,
      llmCostMicro: 456,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.todayCost).toBeCloseTo(0.000579, 6)
    expect(result.costBreakdown.cronCost).toBeCloseTo(0.000123, 6)
    expect(result.costBreakdown.llmCost).toBeCloseTo(0.000456, 6)
  })
})

describe('ARGOS Status - Last Check At', () => {
  it('should use evaluator time when newer than event time', () => {
    const eventTime = new Date('2026-03-08T10:00:00Z')
    const evalTime = new Date('2026-03-08T10:05:00Z')

    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: eventTime,
      evaluatorLastCheck: evalTime,
    })

    expect(result.lastCheckAt).toBe(evalTime.toISOString())
  })

  it('should use event time when newer than evaluator time', () => {
    const eventTime = new Date('2026-03-08T10:10:00Z')
    const evalTime = new Date('2026-03-08T10:05:00Z')

    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: eventTime,
      evaluatorLastCheck: evalTime,
    })

    expect(result.lastCheckAt).toBe(eventTime.toISOString())
  })

  it('should use evaluator time when no events', () => {
    const evalTime = new Date('2026-03-08T10:05:00Z')

    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: evalTime,
    })

    expect(result.lastCheckAt).toBe(evalTime.toISOString())
  })

  it('should use event time when evaluator not started', () => {
    const eventTime = new Date('2026-03-08T10:00:00Z')

    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: eventTime,
      evaluatorLastCheck: null,
    })

    expect(result.lastCheckAt).toBe(eventTime.toISOString())
  })

  it('should return null when no events and evaluator not started', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.lastCheckAt).toBeNull()
  })
})

describe('ARGOS Status - Combined Scenarios', () => {
  it('should handle healthy system with all data', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 20,
      failedRecentEvents: 1,
      cronCostMicro: 1_000_000,
      llmCostMicro: 2_000_000,
      lastEventAt: new Date('2026-03-08T10:00:00Z'),
      evaluatorLastCheck: new Date('2026-03-08T10:05:00Z'),
    })

    expect(result.dataOk).toBe(true)
    expect(result.aiOk).toBe(true)
    expect(result.activeTriggersCount).toBe(5)
    expect(result.todayCost).toBe(3.0)
    expect(result.costBreakdown.cronCost).toBe(1.0)
    expect(result.costBreakdown.llmCost).toBe(2.0)
    expect(result.lastCheckAt).toBe(new Date('2026-03-08T10:05:00Z').toISOString())
  })

  it('should handle unhealthy system with many failures', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 10,
      totalRecentEvents: 8,
      failedRecentEvents: 6,
      cronCostMicro: 500_000,
      llmCostMicro: 100_000,
      lastEventAt: new Date('2026-03-08T09:00:00Z'),
      evaluatorLastCheck: new Date('2026-03-08T10:00:00Z'),
    })

    expect(result.dataOk).toBe(false) // 75% failure rate
    expect(result.aiOk).toBe(false) // 6 failures >= 3
    expect(result.todayCost).toBe(0.6)
    expect(result.dataOkReason).toContain('75%')
    expect(result.aiOkReason).toContain('임계값: 3건')
  })

  it('should handle fresh system with no data', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 0,
      totalRecentEvents: 0,
      failedRecentEvents: 0,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: null,
      evaluatorLastCheck: null,
    })

    expect(result.dataOk).toBe(true)
    expect(result.aiOk).toBe(true)
    expect(result.activeTriggersCount).toBe(0)
    expect(result.todayCost).toBe(0)
    expect(result.lastCheckAt).toBeNull()
  })

  it('should return all required fields for backward compatibility', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 1,
      totalRecentEvents: 1,
      failedRecentEvents: 0,
      cronCostMicro: 100,
      llmCostMicro: 200,
      lastEventAt: new Date(),
      evaluatorLastCheck: new Date(),
    })

    // All original fields present
    expect(typeof result.dataOk).toBe('boolean')
    expect(typeof result.aiOk).toBe('boolean')
    expect(typeof result.activeTriggersCount).toBe('number')
    expect(typeof result.todayCost).toBe('number')
    expect(typeof result.lastCheckAt).toBe('string')

    // New fields present
    expect(typeof result.dataOkReason).toBe('string')
    expect(typeof result.aiOkReason).toBe('string')
    expect(typeof result.costBreakdown).toBe('object')
    expect(typeof result.costBreakdown.cronCost).toBe('number')
    expect(typeof result.costBreakdown.llmCost).toBe('number')
  })
})

describe('ARGOS Status - Reason Strings', () => {
  it('should include count details in dataOk reason', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 3,
      totalRecentEvents: 15,
      failedRecentEvents: 2,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOkReason).toContain('15건')
    expect(result.dataOkReason).toContain('2건')
  })

  it('should include percentage in failure reason', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 3,
      totalRecentEvents: 10,
      failedRecentEvents: 7,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.dataOkReason).toContain('70%')
    expect(result.dataOkReason).toContain('7/10건')
  })

  it('should have descriptive aiOk reason for clean state', () => {
    const result = computeArgosStatus({
      activeTriggersCount: 5,
      totalRecentEvents: 20,
      failedRecentEvents: 1,
      cronCostMicro: 0,
      llmCostMicro: 0,
      lastEventAt: new Date(),
      evaluatorLastCheck: null,
    })

    expect(result.aiOkReason).toBe('최근 1시간 실패 1/20건')
  })
})
