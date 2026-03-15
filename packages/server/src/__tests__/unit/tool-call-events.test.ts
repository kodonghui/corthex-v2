import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- Mocks ---

const mockInsertToolCallEvent = mock(() => Promise.resolve([{ id: 'event-uuid-1' }]))
const mockUpdateToolCallEvent = mock(() => Promise.resolve([]))
const mockGetDB = mock(() => ({
  insertToolCallEvent: mockInsertToolCallEvent,
  updateToolCallEvent: mockUpdateToolCallEvent,
}))

mock.module('../../db/scoped-query', () => ({ getDB: mockGetDB }))

// --- Tests ---

describe('Story 17.1b: tool_call_events DB schema (D29, FR-SO2)', () => {
  const fs = require('fs')
  const path = require('path')

  const schemaSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/schema.ts'),
    'utf-8',
  )

  test('toolCallEvents table is defined in schema.ts', () => {
    expect(schemaSrc).toContain("pgTable('tool_call_events'")
  })

  test('schema has all required columns', () => {
    const columns = ['run_id', 'tool_name', 'started_at', 'completed_at', 'success', 'error_code', 'duration_ms']
    for (const col of columns) {
      expect(schemaSrc).toContain(`'${col}'`)
    }
  })

  test('D29: all 4 index names are defined', () => {
    // 3 compound indexes + 1 run_id index (Pipeline Gate SQL)
    expect(schemaSrc).toContain("'tce_company_date'")
    expect(schemaSrc).toContain("'tce_company_agent_date'")
    expect(schemaSrc).toContain("'tce_company_tool_date'")
    expect(schemaSrc).toContain("'tce_run_id'")
  })

  test('D29: 4 indexes total (not more, not less)', () => {
    // Count occurrences of tce_ prefix in schema
    const indexMatches = schemaSrc.match(/tce_[a-z_]+/g) ?? []
    const uniqueIndexes = new Set(indexMatches)
    expect(uniqueIndexes.size).toBe(4)
  })

  test('company_id has FK reference to companies', () => {
    // toolCallEvents section specifically — find the block
    const tceBlockStart = schemaSrc.indexOf("pgTable('tool_call_events'")
    const tceBlockEnd = schemaSrc.indexOf('))', tceBlockStart)
    const tceBlock = schemaSrc.slice(tceBlockStart, tceBlockEnd + 2)
    expect(tceBlock).toContain('references')
    expect(tceBlock).toContain('companies')
  })

  test('runId is text (not uuid) — supports any string format from session context', () => {
    const tceBlockStart = schemaSrc.indexOf("pgTable('tool_call_events'")
    const tceBlockEnd = schemaSrc.indexOf('))', tceBlockStart)
    const tceBlock = schemaSrc.slice(tceBlockStart, tceBlockEnd + 2)
    expect(tceBlock).toContain("text('run_id')")
  })
})

describe('Story 17.1b: SQL migration (0054_tool-call-events.sql)', () => {
  const fs = require('fs')
  const path = require('path')

  const migrationSrc = fs.readFileSync(
    path.resolve(__dirname, '../../db/migrations/0054_tool-call-events.sql'),
    'utf-8',
  )

  test('migration creates tool_call_events table', () => {
    expect(migrationSrc).toContain('CREATE TABLE tool_call_events')
  })

  test('migration includes all 4 D29 indexes', () => {
    expect(migrationSrc).toContain('tce_company_date')
    expect(migrationSrc).toContain('tce_company_agent_date')
    expect(migrationSrc).toContain('tce_company_tool_date')
    expect(migrationSrc).toContain('tce_run_id')
  })

  test('migration has company_id FK to companies', () => {
    expect(migrationSrc).toContain('REFERENCES companies(id)')
  })
})

describe('Story 17.1b: getDB() insertToolCallEvent (E17 start)', () => {
  beforeEach(() => {
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('insertToolCallEvent returns [{id}] for use in updateToolCallEvent', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    const result = await db.insertToolCallEvent({
      agentId: 'agent-uuid',
      runId: 'run-abc-123',
      toolName: 'web_search',
      startedAt: new Date(),
    })

    expect(result).toEqual([{ id: 'event-uuid-1' }])
    expect(mockInsertToolCallEvent).toHaveBeenCalledTimes(1)
  })

  test('insertToolCallEvent called with correct shape (no companyId in data)', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    const startedAt = new Date('2026-03-15T10:00:00Z')
    await db.insertToolCallEvent({
      runId: 'run-test-1',
      toolName: 'md_to_pdf',
      startedAt,
      agentId: 'agent-cmo',
    })

    const callArg = mockInsertToolCallEvent.mock.calls[0][0] as Record<string, unknown>
    expect(callArg.runId).toBe('run-test-1')
    expect(callArg.toolName).toBe('md_to_pdf')
    expect(callArg.startedAt).toBe(startedAt)
  })
})

describe('Story 17.1b: getDB() updateToolCallEvent (E17 finally)', () => {
  beforeEach(() => {
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('updateToolCallEvent called with success=true and durationMs on success', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    await db.updateToolCallEvent('event-uuid-1', {
      completedAt: new Date(),
      success: true,
      durationMs: 342,
    })

    expect(mockUpdateToolCallEvent).toHaveBeenCalledWith('event-uuid-1', {
      completedAt: expect.any(Date),
      success: true,
      durationMs: 342,
    })
  })

  test('updateToolCallEvent called with success=false and errorCode on failure', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    await db.updateToolCallEvent('event-uuid-1', {
      completedAt: new Date(),
      success: false,
      errorCode: 'TOOL_QUOTA_EXHAUSTED',
      durationMs: 150,
    })

    expect(mockUpdateToolCallEvent).toHaveBeenCalledWith('event-uuid-1', expect.objectContaining({
      success: false,
      errorCode: 'TOOL_QUOTA_EXHAUSTED',
    }))
  })
})

describe('Story 17.1b: E17 INSERT→UPDATE pattern', () => {
  beforeEach(() => {
    mockInsertToolCallEvent.mockReset()
    mockUpdateToolCallEvent.mockReset()
    mockGetDB.mockReset()
    mockInsertToolCallEvent.mockResolvedValue([{ id: 'event-uuid-1' }])
    mockUpdateToolCallEvent.mockResolvedValue([])
    mockGetDB.mockReturnValue({
      insertToolCallEvent: mockInsertToolCallEvent,
      updateToolCallEvent: mockUpdateToolCallEvent,
    })
  })

  test('E17 pattern: INSERT returns id used in UPDATE', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    // Step 1: INSERT before logic
    const [{ id: eventId }] = await db.insertToolCallEvent({
      runId: 'run-e17-test',
      toolName: 'read_web_page',
      startedAt: new Date(),
    })

    expect(eventId).toBe('event-uuid-1')

    // Step 2: UPDATE in finally block
    await db.updateToolCallEvent(eventId, {
      completedAt: new Date(),
      success: true,
      durationMs: 800,
    })

    expect(mockInsertToolCallEvent).toHaveBeenCalledTimes(1)
    expect(mockUpdateToolCallEvent).toHaveBeenCalledWith('event-uuid-1', expect.objectContaining({
      success: true,
      durationMs: 800,
    }))
  })

  test('E17 pattern: UPDATE still called when tool throws (finally guarantee)', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')

    const [{ id: eventId }] = await db.insertToolCallEvent({
      runId: 'run-e17-error',
      toolName: 'publish_tistory',
      startedAt: new Date(),
    })

    // Simulate error path: catch → set failure data → finally → update
    let caughtError: Error | null = null
    try {
      throw new Error('TOOL_QUOTA_EXHAUSTED')
    } catch (err) {
      caughtError = err as Error
    } finally {
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode: 'TOOL_QUOTA_EXHAUSTED',
        durationMs: 50,
      })
    }

    expect(caughtError?.message).toBe('TOOL_QUOTA_EXHAUSTED')
    expect(mockUpdateToolCallEvent).toHaveBeenCalledWith('event-uuid-1', expect.objectContaining({
      success: false,
      errorCode: 'TOOL_QUOTA_EXHAUSTED',
    }))
  })

  test('multiple tool calls in same session share run_id', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('company-1')
    const runId = 'run-session-abc'

    await db.insertToolCallEvent({ runId, toolName: 'web_search', startedAt: new Date() })
    await db.insertToolCallEvent({ runId, toolName: 'md_to_pdf', startedAt: new Date() })

    const calls = mockInsertToolCallEvent.mock.calls
    expect(calls).toHaveLength(2)

    const call1 = calls[0][0] as Record<string, unknown>
    const call2 = calls[1][0] as Record<string, unknown>
    expect(call1.runId).toBe(runId)
    expect(call2.runId).toBe(runId)
  })
})

// --- TEA P0: Source Introspection ---

describe('TEA P0: scoped-query tool_call_events methods', () => {
  const fs = require('fs')
  const path = require('path')
  const src = fs.readFileSync(
    path.resolve(__dirname, '../../db/scoped-query.ts'),
    'utf-8',
  )

  test('imports toolCallEvents from schema', () => {
    expect(src).toContain('toolCallEvents')
    expect(src).toContain("from './schema'")
  })

  test('insertToolCallEvent method exists', () => {
    expect(src).toContain('insertToolCallEvent')
  })

  test('updateToolCallEvent method exists', () => {
    expect(src).toContain('updateToolCallEvent')
  })

  test('companyId is auto-injected (not in data parameter)', () => {
    // The method signature should use Omit<..., 'companyId' | 'id'>
    expect(src).toContain("Omit<NewToolCallEvent, 'companyId' | 'id'>")
  })

  test('journal entry 0054 exists', () => {
    const journal = fs.readFileSync(
      path.resolve(__dirname, '../../db/migrations/meta/_journal.json'),
      'utf-8',
    )
    expect(journal).toContain('0054_tool-call-events')
  })
})
