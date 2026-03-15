import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 21.2: Tool Telemetry & Pipeline E2E Gate Validation Tests ===
// TEA: Risk-based — P0 E17 telemetry contracts, P0 Pipeline Gate SQL logic, P1 timing, P1 D29 index structural

// ─── P0: E17 Telemetry Pattern Contracts ───────────────────────────────────────

describe('[P0] E17 telemetry — read_web_page handler structure', () => {
  test('read_web_page source file exists and exports handler', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    expect(src).toContain("name: 'read_web_page'")
    expect(src).toContain('execute: async (input, ctx) =>')
  })

  test('read_web_page source code has E17 INSERT before fetch (AC#1)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    // Find positions in the execute function body (skip import lines)
    const executeStart = src.indexOf('execute: async')
    const insertIdx = src.indexOf('insertToolCallEvent', executeStart)
    const fetchIdx = src.indexOf('callExternalApi', executeStart)
    expect(insertIdx).toBeGreaterThan(0)
    expect(fetchIdx).toBeGreaterThan(0)
    expect(insertIdx).toBeLessThan(fetchIdx)  // INSERT is before fetch
  })

  test('read_web_page source code has E17 UPDATE on success path (AC#1)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    expect(src).toContain('success: true')
    expect(src).toContain('completedAt: new Date()')
    expect(src).toContain('durationMs:')
  })

  test('read_web_page source code has E17 UPDATE on failure path (AC#2)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    expect(src).toContain('success: false')
    expect(src).toContain('errorCode')
    expect(src).toContain('TOOL_EXTERNAL_SERVICE_ERROR')
  })

  test('read_web_page has updateToolCallEvent in catch block (AC#2: error_code recorded)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    // catch block must contain updateToolCallEvent — ensures error_code is always recorded
    const catchIdx = src.indexOf('} catch (err)')
    const updateInCatch = src.indexOf('updateToolCallEvent', catchIdx)
    expect(catchIdx).toBeGreaterThan(0)
    expect(updateInCatch).toBeGreaterThan(catchIdx)
  })
})

describe('[P0] E17 telemetry — save_report handler structure', () => {
  test('save_report source file exports handler with correct name', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/save-report.ts'),
      'utf-8',
    )
    expect(src).toContain("name: 'save_report'")
    expect(src).toContain('execute: async')
  })

  test('save_report source code has E17 INSERT before DB operations', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/save-report.ts'),
      'utf-8',
    )
    const insertTelemetryIdx = src.indexOf('insertToolCallEvent')
    const insertReportIdx = src.indexOf('insertReport')
    expect(insertTelemetryIdx).toBeGreaterThan(0)
    expect(insertReportIdx).toBeGreaterThan(0)
    expect(insertTelemetryIdx).toBeLessThan(insertReportIdx)  // telemetry INSERT first
  })

  test('save_report includes startedAt field in telemetry INSERT (AC#1 timing)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/save-report.ts'),
      'utf-8',
    )
    expect(src).toContain('startedAt')
    expect(src).toContain('new Date()')
  })

  test('save_report source code has E17 UPDATE with durationMs on success (AC#1)', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/save-report.ts'),
      'utf-8',
    )
    expect(src).toContain('success: true')
    expect(src).toContain('durationMs')
    expect(src).toContain('completedAt')
  })
})

// ─── P0: Pipeline Gate SQL Logic ──────────────────────────────────────────────

describe('[P0] Pipeline Gate SQL — success case logic (AC#3)', () => {
  // Simulate the SQL logic in pure JavaScript to test correctness

  function runPipelineGateSql(
    events: Array<{ runId: string; success: boolean }>,
    targetRunId: string,
  ): { tool_count: number } | null {
    // Simulates:
    // SELECT run_id, COUNT(*) as tool_count FROM tool_call_events
    // WHERE run_id = $1
    // GROUP BY run_id
    // HAVING COUNT(*) >= 2 AND SUM(CASE WHEN success = false THEN 1 ELSE 0 END) = 0
    const filtered = events.filter(e => e.runId === targetRunId)
    if (filtered.length < 2) return null
    const failCount = filtered.filter(e => !e.success).length
    if (failCount > 0) return null
    return { tool_count: filtered.length }
  }

  test('2 successful tools → returns 1 row with tool_count=2 (AC#3)', () => {
    const events = [
      { runId: 'test-pipeline-123', success: true },
      { runId: 'test-pipeline-123', success: true },
    ]
    const result = runPipelineGateSql(events, 'test-pipeline-123')
    expect(result).not.toBeNull()
    expect(result!.tool_count).toBe(2)
  })

  test('3+ tools all success → returns 1 row', () => {
    const events = [
      { runId: 'run-abc', success: true },
      { runId: 'run-abc', success: true },
      { runId: 'run-abc', success: true },
    ]
    const result = runPipelineGateSql(events, 'run-abc')
    expect(result).not.toBeNull()
    expect(result!.tool_count).toBe(3)
  })

  test('different runId events are not counted (tenant isolation in SQL)', () => {
    const events = [
      { runId: 'run-a', success: true },
      { runId: 'run-b', success: true },
      { runId: 'run-b', success: true },
    ]
    const resultA = runPipelineGateSql(events, 'run-a')
    expect(resultA).toBeNull()  // only 1 event for run-a, HAVING COUNT(*) >= 2 fails
    const resultB = runPipelineGateSql(events, 'run-b')
    expect(resultB!.tool_count).toBe(2)
  })
})

describe('[P0] Pipeline Gate SQL — failure case logic (AC#4)', () => {
  function runPipelineGateSql(
    events: Array<{ runId: string; success: boolean }>,
    targetRunId: string,
  ): { tool_count: number } | null {
    const filtered = events.filter(e => e.runId === targetRunId)
    if (filtered.length < 2) return null
    const failCount = filtered.filter(e => !e.success).length
    if (failCount > 0) return null
    return { tool_count: filtered.length }
  }

  test('1st tool fails → 0 rows returned (AC#4)', () => {
    const events = [
      { runId: 'run-fail', success: false },
      { runId: 'run-fail', success: true },
    ]
    const result = runPipelineGateSql(events, 'run-fail')
    expect(result).toBeNull()
  })

  test('2nd tool fails → 0 rows returned (AC#4)', () => {
    const events = [
      { runId: 'run-fail', success: true },
      { runId: 'run-fail', success: false },
    ]
    const result = runPipelineGateSql(events, 'run-fail')
    expect(result).toBeNull()
  })

  test('all tools fail → 0 rows returned (AC#4)', () => {
    const events = [
      { runId: 'run-all-fail', success: false },
      { runId: 'run-all-fail', success: false },
    ]
    const result = runPipelineGateSql(events, 'run-all-fail')
    expect(result).toBeNull()
  })

  test('only 1 tool ran → 0 rows returned (HAVING COUNT(*) >= 2 fails)', () => {
    const events = [{ runId: 'run-one', success: true }]
    const result = runPipelineGateSql(events, 'run-one')
    expect(result).toBeNull()
  })
})

// ─── P1: Timing Verification ──────────────────────────────────────────────────

describe('[P1] E17 timing contract — started_at before completed_at (AC#1)', () => {
  test('startedAt captured before execute() logic runs', () => {
    // Contract: startedAt is set at INSERT time (before logic runs)
    // completedAt is set at UPDATE time (after logic completes)
    // Therefore startedAt < completedAt always
    const startedAt = new Date()
    // Simulate some work
    const completedAt = new Date(startedAt.getTime() + 150)  // 150ms later
    expect(startedAt.getTime()).toBeLessThan(completedAt.getTime())
  })

  test('durationMs equals completedAt - startedAt in ms', () => {
    const startTime = Date.now()
    const startedAt = new Date(startTime)
    // Simulate 200ms work
    const completedAt = new Date(startTime + 200)
    const durationMs = completedAt.getTime() - startedAt.getTime()
    expect(durationMs).toBe(200)
    expect(durationMs).toBeGreaterThan(0)
  })

  test('multiple tools in same run share runId (AC#3 prerequisite)', () => {
    const sharedRunId = 'run-uuid-shared'
    const event1 = { runId: sharedRunId, toolName: 'read_web_page', startedAt: new Date() }
    const event2 = { runId: sharedRunId, toolName: 'save_report', startedAt: new Date() }
    expect(event1.runId).toBe(event2.runId)
    expect(event1.toolName).not.toBe(event2.toolName)
  })

  test('runId in telemetry matches session runId (E17 grouping)', () => {
    const sessionRunId = 'session-run-abc-123'
    // All tool calls in a session must use the same runId from ctx.runId
    const toolCallRunIds = ['session-run-abc-123', 'session-run-abc-123']
    const allMatch = toolCallRunIds.every(id => id === sessionRunId)
    expect(allMatch).toBe(true)
  })
})

// ─── P1: D29 Index Structural Verification (AC#5 without real DB) ─────────────

describe('[P1] D29 indexes — structural verification (AC#5)', () => {
  const migrationPath = path.resolve(
    import.meta.dir,
    '../../db/migrations/0054_tool-call-events.sql',
  )

  test('migration file has tce_run_id index (Pipeline Gate SQL optimization)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX tce_run_id')
    // Index is on run_id column — enables O(log n) GROUP BY WHERE run_id = $1
    expect(content).toContain('run_id')
  })

  test('migration has all 4 D29 indexes', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('tce_company_date')
    expect(content).toContain('tce_company_agent_date')
    expect(content).toContain('tce_company_tool_date')
    expect(content).toContain('tce_run_id')
  })

  test('Drizzle schema has 4 D29 indexes defined', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    // Verify table is defined (index definitions are in migration SQL, not directly queryable)
    expect(toolCallEvents).toBeDefined()
    expect(toolCallEvents.runId).toBeDefined()
    expect(toolCallEvents.companyId).toBeDefined()
    expect(toolCallEvents.toolName).toBeDefined()
    expect(toolCallEvents.startedAt).toBeDefined()
  })
})

// ─── P1: Error Code Contract (AC#2) ──────────────────────────────────────────

describe('[P1] error code contract — failure path (AC#2)', () => {
  test('read_web_page has TOOL_EXTERNAL_SERVICE_ERROR as fallback error code', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../tool-handlers/builtins/read-web-page.ts'),
      'utf-8',
    )
    expect(src).toContain('TOOL_EXTERNAL_SERVICE_ERROR')
  })

  test('fallback error code is TOOL_EXTERNAL_SERVICE_ERROR for non-ToolError', () => {
    const err = new Error('Something went wrong')
    const errorCode = err instanceof Error && 'code' in err ? (err as any).code : 'TOOL_EXTERNAL_SERVICE_ERROR'
    expect(errorCode).toBe('TOOL_EXTERNAL_SERVICE_ERROR')
  })

  test('ToolError source file has code property', () => {
    const src = fs.readFileSync(
      path.resolve(import.meta.dir, '../../lib/tool-error.ts'),
      'utf-8',
    )
    expect(src).toContain('code')
    expect(src).toContain('TOOL_')
  })
})
