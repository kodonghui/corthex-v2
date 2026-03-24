import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

let mockDeleteExpiredCalls: any[] = []
let mockDecayConfidenceCalls: any[] = []
let mockDeleteWeakCalls: any[] = []
let mockDeleteExpiredResult = 10
let mockDecayResult = 5
let mockDeleteWeakResult = 2
let mockMemoryStats: any[] = []

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({ from: mock(() => ({ where: mock(() => Promise.resolve([])) })) })),
    execute: mock(() => Promise.resolve([{ acquired: true }])),
  },
}))

mock.module('../../db/schema', () => ({
  observations: {},
  agentMemories: {},
  companies: {},
  agents: {},
}))

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => ({
    deleteExpiredObservations: mock(async (params: any) => {
      mockDeleteExpiredCalls.push(params)
      return mockDeleteExpiredResult
    }),
    decayMemoryConfidence: mock(async (staleBefore: Date, decayFactor: number) => {
      mockDecayConfidenceCalls.push({ staleBefore, decayFactor })
      return mockDecayResult
    }),
    deleteWeakMemories: mock(async (minConfidence: number) => {
      mockDeleteWeakCalls.push({ minConfidence })
      return mockDeleteWeakResult
    }),
    getMemoryStats: mock(async () => mockMemoryStats),
  }),
}))

// Import AFTER mocks
const {
  cleanupExpiredObservations,
  decayStaleMemories,
  REFLECTED_TTL_DAYS,
  UNREFLECTED_TTL_DAYS,
  BATCH_SIZE,
  STALE_MEMORY_DAYS,
  DECAY_FACTOR,
  MIN_CONFIDENCE,
} = await import('../../services/observation-cleanup')

beforeEach(() => {
  mockDeleteExpiredCalls = []
  mockDecayConfidenceCalls = []
  mockDeleteWeakCalls = []
  mockDeleteExpiredResult = 10
  mockDecayResult = 5
  mockDeleteWeakResult = 2
  mockMemoryStats = []
})

describe('Story 28.7: Observation TTL Cleanup', () => {

  // === P0: Core TTL constants ===

  test('P0: REFLECTED_TTL_DAYS is 30', () => {
    expect(REFLECTED_TTL_DAYS).toBe(30)
  })

  test('P0: UNREFLECTED_TTL_DAYS is 90', () => {
    expect(UNREFLECTED_TTL_DAYS).toBe(90)
  })

  test('P0: BATCH_SIZE is 500', () => {
    expect(BATCH_SIZE).toBe(500)
  })

  // === P0: Reflected observations deleted after 30 days ===

  test('P0: reflected observations deleted after 30 days', async () => {
    const result = await cleanupExpiredObservations('company-1')

    // Should call deleteExpiredObservations with reflected=true
    const reflectedCall = mockDeleteExpiredCalls.find(c => c.reflected === true)
    expect(reflectedCall).toBeDefined()
    expect(reflectedCall.batchSize).toBe(500)

    // Cutoff should be ~30 days ago
    const expectedCutoff = Date.now() - 30 * 86400000
    const actualCutoff = reflectedCall.before.getTime()
    expect(Math.abs(actualCutoff - expectedCutoff)).toBeLessThan(5000)

    expect(result.reflectedDeleted).toBe(10)
  })

  // === P0: Unreflected observations deleted after 90 days ===

  test('P0: unreflected observations deleted after 90 days', async () => {
    const result = await cleanupExpiredObservations('company-1')

    // Should call deleteExpiredObservations with reflected=false
    const unreflectedCall = mockDeleteExpiredCalls.find(c => c.reflected === false)
    expect(unreflectedCall).toBeDefined()
    expect(unreflectedCall.batchSize).toBe(500)

    // Cutoff should be ~90 days ago
    const expectedCutoff = Date.now() - 90 * 86400000
    const actualCutoff = unreflectedCall.before.getTime()
    expect(Math.abs(actualCutoff - expectedCutoff)).toBeLessThan(5000)

    expect(result.unreflectedDeleted).toBe(10)
  })

  // === P0: Batch deletion limits ===

  test('P0: batch deletion passes BATCH_SIZE limit', async () => {
    await cleanupExpiredObservations('company-1')

    for (const call of mockDeleteExpiredCalls) {
      expect(call.batchSize).toBe(BATCH_SIZE)
    }
  })

  // === P0: Total count is sum of both ===

  test('P0: totalDeleted is sum of reflected + unreflected', async () => {
    const result = await cleanupExpiredObservations('company-1')
    expect(result.totalDeleted).toBe(result.reflectedDeleted + result.unreflectedDeleted)
    expect(result.totalDeleted).toBe(20) // 10 + 10
  })

  // === P1: Empty state — nothing to clean ===

  test('P1: empty state — returns zeros when nothing to clean', async () => {
    mockDeleteExpiredResult = 0
    const result = await cleanupExpiredObservations('company-1')
    expect(result.reflectedDeleted).toBe(0)
    expect(result.unreflectedDeleted).toBe(0)
    expect(result.totalDeleted).toBe(0)
  })

  // === P1: Recent observations NOT deleted (implicit via cutoff) ===

  test('P1: cutoff dates ensure recent observations are not targeted', async () => {
    await cleanupExpiredObservations('company-1')

    const reflectedCall = mockDeleteExpiredCalls.find(c => c.reflected === true)
    const unreflectedCall = mockDeleteExpiredCalls.find(c => c.reflected === false)

    // Reflected cutoff: 30 days ago — anything newer would NOT be in the query
    const now = Date.now()
    expect(reflectedCall.before.getTime()).toBeLessThan(now - 29 * 86400000)

    // Unreflected cutoff: 90 days ago
    expect(unreflectedCall.before.getTime()).toBeLessThan(now - 89 * 86400000)
  })
})

describe('Story 28.7: Memory Confidence Decay', () => {

  // === P0: Decay constants ===

  test('P0: STALE_MEMORY_DAYS is 60', () => {
    expect(STALE_MEMORY_DAYS).toBe(60)
  })

  test('P0: DECAY_FACTOR is 0.9', () => {
    expect(DECAY_FACTOR).toBe(0.9)
  })

  test('P0: MIN_CONFIDENCE is 10', () => {
    expect(MIN_CONFIDENCE).toBe(10)
  })

  // === P0: Stale memories decayed ===

  test('P0: stale memories decayed with 0.9 multiplier after 60 days', async () => {
    const result = await decayStaleMemories('company-1')

    expect(mockDecayConfidenceCalls.length).toBe(1)
    const call = mockDecayConfidenceCalls[0]

    // Cutoff should be ~60 days ago
    const expectedCutoff = Date.now() - 60 * 86400000
    expect(Math.abs(call.staleBefore.getTime() - expectedCutoff)).toBeLessThan(5000)

    // Decay factor should be 0.9
    expect(call.decayFactor).toBe(0.9)

    expect(result.decayed).toBe(5)
  })

  // === P0: Weak memories deleted ===

  test('P0: weak memories below confidence 10 are deleted', async () => {
    const result = await decayStaleMemories('company-1')

    expect(mockDeleteWeakCalls.length).toBe(1)
    expect(mockDeleteWeakCalls[0].minConfidence).toBe(10)

    expect(result.deleted).toBe(2)
  })

  // === P1: Empty state ===

  test('P1: empty state — returns zeros when no stale/weak memories', async () => {
    mockDecayResult = 0
    mockDeleteWeakResult = 0
    const result = await decayStaleMemories('company-1')
    expect(result.decayed).toBe(0)
    expect(result.deleted).toBe(0)
  })
})

describe('Story 28.7: Cleanup Cron Infrastructure', () => {

  test('P0: cron exports startObservationCleanupCron and stopObservationCleanupCron', async () => {
    const cronSource = await Bun.file('packages/server/src/services/observation-cleanup-cron.ts').text()
    expect(cronSource).toContain('export function startObservationCleanupCron')
    expect(cronSource).toContain('export function stopObservationCleanupCron')
  })

  test('P0: cron runs at 4:00 AM UTC (1h after reflection)', async () => {
    const cronSource = await Bun.file('packages/server/src/services/observation-cleanup-cron.ts').text()
    expect(cronSource).toContain('CRON_TARGET_HOUR_UTC = 4')
  })

  test('P0: stagger hash for company isolation', async () => {
    const cronSource = await Bun.file('packages/server/src/services/observation-cleanup-cron.ts').text()
    expect(cronSource).toContain('getStaggerMinutes')
    expect(cronSource).toContain('% STAGGER_WINDOW_MINUTES')
  })

  test('P0: advisory lock prevents concurrent cleanup', async () => {
    const cronSource = await Bun.file('packages/server/src/services/observation-cleanup-cron.ts').text()
    expect(cronSource).toContain('pg_try_advisory_xact_lock')
  })

  test('P0: registered in index.ts startup and shutdown', async () => {
    const indexSource = await Bun.file('packages/server/src/index.ts').text()
    expect(indexSource).toContain("import { startObservationCleanupCron, stopObservationCleanupCron } from './services/observation-cleanup-cron'")
    expect(indexSource).toContain('startObservationCleanupCron()')
    expect(indexSource).toContain('stopObservationCleanupCron()')
  })
})

describe('Story 28.7: DB Methods', () => {

  test('P0: deleteExpiredObservations exists in scoped-query', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('deleteExpiredObservations')
    expect(source).toContain('DELETE FROM observations')
    expect(source).toContain('LIMIT')
  })

  test('P0: deleteExpiredObservations uses batch LIMIT for performance', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    // Should use subquery with LIMIT for batched deletion
    expect(source).toContain('WHERE id IN')
    expect(source).toContain('LIMIT ${batchSize}')
  })

  test('P0: decayMemoryConfidence exists in scoped-query', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('decayMemoryConfidence')
    expect(source).toContain('confidence * ${decayFactor}')
    expect(source).toContain('GREATEST(0')
  })

  test('P0: deleteWeakMemories soft-deletes via is_active=false', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('deleteWeakMemories')
    expect(source).toContain('is_active = false')
    expect(source).toContain('confidence < ${minConfidence}')
  })

  test('P0: getMemoryStats returns per-agent observation and memory counts', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('getMemoryStats')
    expect(source).toContain('total_observations')
    expect(source).toContain('reflected_observations')
    expect(source).toContain('unreflected_observations')
    expect(source).toContain('total_memories')
    expect(source).toContain('active_memories')
    expect(source).toContain('avg_confidence')
  })

  test('P1: reflected observations use reflected_at for cutoff', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('reflected_at')
  })

  test('P1: unreflected observations use created_at for cutoff', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('created_at')
  })
})

describe('Story 28.7: Admin API Endpoints', () => {

  test('P0: GET /memory-stats endpoint exists', async () => {
    const source = await Bun.file('packages/server/src/routes/admin/company-settings.ts').text()
    expect(source).toContain("'/company-settings/memory-stats'")
    expect(source).toContain('getMemoryStats')
  })

  test('P0: POST /memory-cleanup endpoint exists', async () => {
    const source = await Bun.file('packages/server/src/routes/admin/company-settings.ts').text()
    expect(source).toContain("'/company-settings/memory-cleanup'")
    expect(source).toContain('cleanupExpiredObservations')
    expect(source).toContain('decayStaleMemories')
  })

  test('P0: cleanup endpoint returns both observation and memory results', async () => {
    const source = await Bun.file('packages/server/src/routes/admin/company-settings.ts').text()
    expect(source).toContain('observations: cleanup')
    expect(source).toContain('memories: decay')
  })

  test('P1: admin routes use authMiddleware + adminOnly + tenantMiddleware', async () => {
    const source = await Bun.file('packages/server/src/routes/admin/company-settings.ts').text()
    expect(source).toContain('authMiddleware, adminOnly, tenantMiddleware')
  })
})

describe('Story 28.7: Cleanup Result Interface', () => {

  test('P0: CleanupResult has correct shape', async () => {
    const result = await cleanupExpiredObservations('company-1')
    expect(result).toHaveProperty('reflectedDeleted')
    expect(result).toHaveProperty('unreflectedDeleted')
    expect(result).toHaveProperty('totalDeleted')
    expect(typeof result.reflectedDeleted).toBe('number')
    expect(typeof result.unreflectedDeleted).toBe('number')
    expect(typeof result.totalDeleted).toBe('number')
  })

  test('P0: DecayResult has correct shape', async () => {
    const result = await decayStaleMemories('company-1')
    expect(result).toHaveProperty('decayed')
    expect(result).toHaveProperty('deleted')
    expect(typeof result.decayed).toBe('number')
    expect(typeof result.deleted).toBe('number')
  })
})
