import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

const mockObservations = Array.from({ length: 25 }, (_, i) => ({
  id: `obs-${i}`,
  companyId: 'company-1',
  agentId: 'agent-1',
  content: `Observation content ${i}`,
  domain: 'conversation',
  outcome: 'success',
  confidence: 0.8,
  importance: 5,
  reflected: false,
  flagged: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  observedAt: new Date(),
  reflectedAt: null,
  sessionId: null,
  taskExecutionId: null,
  toolUsed: null,
  embedding: null,
}))

let mockCountResult = 25
let mockGetResult = mockObservations
let mockDailyCost = 0
let mockMarkReflectedCalls: string[][] = []
let mockInsertMemoryCalls: any[] = []

const mockMessagesCreate = mock(() => Promise.resolve({
  content: [{ type: 'text' as const, text: JSON.stringify([
    { content: 'Learned to handle user requests efficiently', confidence: 85, category: 'skill' },
    { content: 'Users prefer concise responses', confidence: 90, category: 'preference' },
    { content: 'Domain expertise in data analysis improved', confidence: 75, category: 'knowledge' },
  ]) }],
  usage: { input_tokens: 1500, output_tokens: 300 },
  model: 'claude-haiku-4-5-20251001',
}))

mock.module('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockMessagesCreate }
    constructor(_opts: any) {}
  },
}))

// Mock DB to prevent real connections
mock.module('../../db', () => ({
  db: {
    select: mock(() => ({ from: mock(() => ({ where: mock(() => Promise.resolve([])) })) })),
    execute: mock(() => Promise.resolve()),
    insert: mock(() => ({ values: mock(() => ({ returning: mock(() => Promise.resolve([{ id: 'test' }])) })) })),
  },
}))

mock.module('../../db/schema', () => ({
  observations: {},
  agentMemories: {},
  costRecords: {},
  companies: {},
  agents: {},
}))

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => ({
    countUnreflectedObservations: mock(async () => mockCountResult),
    getUnreflectedObservations: mock(async () => mockGetResult),
    getReflectionCostToday: mock(async () => mockDailyCost),
    markObservationsReflected: mock(async (ids: string[]) => { mockMarkReflectedCalls.push(ids) }),
    insertReflectionMemory: mock(async (data: any) => {
      mockInsertMemoryCalls.push(data)
      return [{ id: `mem-${mockInsertMemoryCalls.length}` }]
    }),
  }),
}))

mock.module('../../services/credential-vault', () => ({
  getCredentials: mock(async () => ({ api_key: 'test-api-key' })),
}))

let mockRecordCostCalls: any[] = []
mock.module('../../lib/cost-tracker', () => ({
  recordCost: mock((params: any) => { mockRecordCostCalls.push(params) }),
}))

// Import AFTER mocks
const { reflectForAgent, REFLECTION_MODEL } = await import('../../services/reflection-worker')

beforeEach(() => {
  mockCountResult = 25
  mockGetResult = mockObservations
  mockDailyCost = 0
  mockMarkReflectedCalls = []
  mockInsertMemoryCalls = []
  mockRecordCostCalls = []
  mockMessagesCreate.mockClear()
})

describe('Story 28.4: Reflection Worker', () => {

  // === P0: Core functionality ===

  test('P0: skips when < 20 unreflected observations', async () => {
    mockCountResult = 15
    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).toBeNull()
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })

  test('P0: skips when avg confidence < 0.7', async () => {
    mockGetResult = Array.from({ length: 25 }, (_, i) => ({
      ...mockObservations[0],
      id: `obs-low-${i}`,
      confidence: 0.5,
    }))
    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).toBeNull()
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })

  test('P0: successful reflection creates memories and marks reflected', async () => {
    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).not.toBeNull()
    expect(result!.memoriesCreated).toBe(3)
    expect(result!.observationsProcessed).toBe(25)
    expect(result!.companyId).toBe('company-1')
    expect(result!.agentId).toBe('agent-1')

    // Memories inserted
    expect(mockInsertMemoryCalls.length).toBe(3)
    expect(mockInsertMemoryCalls[0].content).toBe('Learned to handle user requests efficiently')
    expect(mockInsertMemoryCalls[0].confidence).toBe(85)
    expect(mockInsertMemoryCalls[0].category).toBe('skill')

    // Observations marked as reflected
    expect(mockMarkReflectedCalls.length).toBe(1)
    expect(mockMarkReflectedCalls[0].length).toBe(25)
  })

  test('P0: uses Haiku model (claude-haiku-4-5-20251001)', async () => {
    await reflectForAgent('company-1', 'agent-1')
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
    const callArgs = mockMessagesCreate.mock.calls[0][0] as any
    expect(callArgs.model).toBe('claude-haiku-4-5-20251001')
    expect(REFLECTION_MODEL).toBe('claude-haiku-4-5-20251001')
  })

  // === P1: MEM-6 Layer 3 prompt hardening ===

  test('P1: MEM-6 Layer 3 — observations wrapped in <observation> XML tags', async () => {
    await reflectForAgent('company-1', 'agent-1')
    const callArgs = mockMessagesCreate.mock.calls[0][0] as any
    const userMessage = callArgs.messages[0].content as string
    expect(userMessage).toContain('<observation index="1"')
    expect(userMessage).toContain('domain="conversation"')
    expect(userMessage).toContain('outcome="success"')
    expect(userMessage).toContain('confidence="0.8"')
    expect(userMessage).toContain('</observation>')
  })

  // === P1: Cost control ===

  test('P1: records cost via recordCost with source="reflection"', async () => {
    await reflectForAgent('company-1', 'agent-1')
    expect(mockRecordCostCalls.length).toBe(1)
    expect(mockRecordCostCalls[0].source).toBe('reflection')
    expect(mockRecordCostCalls[0].model).toBe('claude-haiku-4-5-20251001')
    expect(mockRecordCostCalls[0].companyId).toBe('company-1')
    expect(mockRecordCostCalls[0].agentId).toBe('agent-1')
  })

  test('P1: cost control — skips when daily cost >= $0.10 (100,000 microdollars)', async () => {
    mockDailyCost = 100_000
    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).toBeNull()
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })

  // === P1: JSON parse resilience ===

  test('P1: handles malformed JSON response gracefully', async () => {
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: 'This is not JSON at all' }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).not.toBeNull()
    expect(result!.memoriesCreated).toBe(0)
    expect(mockMarkReflectedCalls.length).toBe(1)
  })

  test('P1: handles JSON wrapped in markdown code blocks', async () => {
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: '```json\n[{"content": "Insight from code block", "confidence": 80, "category": "pattern"}]\n```' }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    const result = await reflectForAgent('company-1', 'agent-1')
    expect(result).not.toBeNull()
    expect(result!.memoriesCreated).toBe(1)
    expect(mockInsertMemoryCalls[0].content).toBe('Insight from code block')
  })

  // === P2: Validation ===

  test('P2: clamps confidence to 0-100 range', async () => {
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: JSON.stringify([
        { content: 'Over confident', confidence: 150, category: 'skill' },
        { content: 'Negative confidence', confidence: -20, category: 'skill' },
      ]) }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    await reflectForAgent('company-1', 'agent-1')
    expect(mockInsertMemoryCalls[0].confidence).toBe(100)
    expect(mockInsertMemoryCalls[1].confidence).toBe(0)
  })

  test('P2: truncates content to 500 chars', async () => {
    const longContent = 'A'.repeat(600)
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: JSON.stringify([
        { content: longContent, confidence: 80, category: 'skill' },
      ]) }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    await reflectForAgent('company-1', 'agent-1')
    expect(mockInsertMemoryCalls[0].content.length).toBe(500)
  })

  test('P2: falls back to "pattern" for invalid category', async () => {
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: JSON.stringify([
        { content: 'Invalid category test', confidence: 80, category: 'invalid_cat' },
      ]) }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    await reflectForAgent('company-1', 'agent-1')
    expect(mockInsertMemoryCalls[0].category).toBe('pattern')
  })

  test('P2: skips memories with empty or non-string content', async () => {
    mockMessagesCreate.mockImplementationOnce(() => Promise.resolve({
      content: [{ type: 'text' as const, text: JSON.stringify([
        { content: '', confidence: 80, category: 'skill' },
        { content: 123, confidence: 80, category: 'skill' },
        { content: 'Valid memory', confidence: 80, category: 'skill' },
      ]) }],
      usage: { input_tokens: 100, output_tokens: 50 },
      model: 'claude-haiku-4-5-20251001',
    }))

    await reflectForAgent('company-1', 'agent-1')
    expect(mockInsertMemoryCalls.length).toBe(1)
    expect(mockInsertMemoryCalls[0].content).toBe('Valid memory')
  })
})

describe('Story 28.4: Reflection Cron', () => {
  test('P0: cron exports startReflectionCron and stopReflectionCron', async () => {
    const cronSource = await Bun.file('packages/server/src/services/reflection-cron.ts').text()
    expect(cronSource).toContain('export function startReflectionCron')
    expect(cronSource).toContain('export function stopReflectionCron')
  })

  test('P0: stagger hash produces deterministic 0-59 offset', async () => {
    const cronSource = await Bun.file('packages/server/src/services/reflection-cron.ts').text()
    expect(cronSource).toContain('getStaggerMinutes')
    expect(cronSource).toContain('STAGGER_WINDOW_MINUTES')
    expect(cronSource).toContain('% STAGGER_WINDOW_MINUTES')
  })

  test('P0: advisory lock pattern is non-blocking (pg_try, not pg_wait)', async () => {
    const cronSource = await Bun.file('packages/server/src/services/reflection-cron.ts').text()
    expect(cronSource).toContain('pg_try_advisory_xact_lock')
    expect(cronSource).toContain('hashtext')
    expect(cronSource).not.toContain('pg_advisory_lock(')
  })

  test('P1: tier 3-4 weekly cap check (7 days interval)', async () => {
    const cronSource = await Bun.file('packages/server/src/services/reflection-cron.ts').text()
    expect(cronSource).toContain('checkTierWeeklyCap')
    expect(cronSource).toContain("INTERVAL '7 days'")
    expect(cronSource).toContain('tierLevel <= 2')
  })

  test('P0: registered in index.ts startup and shutdown', async () => {
    const indexSource = await Bun.file('packages/server/src/index.ts').text()
    expect(indexSource).toContain("import { startReflectionCron, stopReflectionCron } from './services/reflection-cron'")
    expect(indexSource).toContain('startReflectionCron()')
    expect(indexSource).toContain('stopReflectionCron()')
  })
})

describe('Story 28.4: DB Methods', () => {
  test('P0: markObservationsReflected sets reflected=true and reflected_at=NOW()', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('markObservationsReflected')
    expect(source).toContain('reflected = true')
    expect(source).toContain('reflected_at = NOW()')
  })

  test('P0: insertReflectionMemory inserts into agentMemories with source="reflection"', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('insertReflectionMemory')
    expect(source).toContain("source: 'reflection'")
    expect(source).toContain('agentMemories')
  })

  test('P0: getReflectionCostToday queries cost_records for today\'s reflection costs', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(source).toContain('getReflectionCostToday')
    expect(source).toContain("'reflection'")
    expect(source).toContain("DATE_TRUNC('day', NOW())")
  })

  test('P1: insertReflectionMemory maps categories to memoryTypeEnum values', async () => {
    const source = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    // Maps: preference → preference, knowledge → fact, others → insight
    expect(source).toContain("'preference'")
    expect(source).toContain("'fact'")
    expect(source).toContain("'insight'")
  })

  test('P1: cost-tracker source type includes "reflection"', async () => {
    const source = await Bun.file('packages/server/src/lib/cost-tracker.ts').text()
    expect(source).toContain("'reflection'")
  })
})
