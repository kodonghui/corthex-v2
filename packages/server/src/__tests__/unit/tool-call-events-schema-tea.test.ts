import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 17.1b: tool_call_events DB Schema & getDB() Methods Tests ===
// TEA: Risk-based coverage — P0 schema columns, P0 migration SQL, P1 getDB methods, P1 D29 indexes

describe('[P0] toolCallEvents — Drizzle schema table definition', () => {
  test('toolCallEvents table is exported from schema', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents).toBeDefined()
  })

  test('toolCallEvents table has id column (uuid PK)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.id).toBeDefined()
  })

  test('toolCallEvents table has companyId column (notNull FK)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.companyId).toBeDefined()
    expect(toolCallEvents.companyId.notNull).toBe(true)
  })

  test('toolCallEvents table has agentId column (nullable FK)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.agentId).toBeDefined()
    expect(toolCallEvents.agentId.notNull).toBe(false)
  })

  test('toolCallEvents table has runId column (notNull text)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.runId).toBeDefined()
    expect(toolCallEvents.runId.notNull).toBe(true)
  })

  test('toolCallEvents table has toolName column (notNull text)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.toolName).toBeDefined()
    expect(toolCallEvents.toolName.notNull).toBe(true)
  })

  test('toolCallEvents table has startedAt column (notNull timestamp)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.startedAt).toBeDefined()
    expect(toolCallEvents.startedAt.notNull).toBe(true)
  })

  test('toolCallEvents table has completedAt column (nullable timestamp)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.completedAt).toBeDefined()
    expect(toolCallEvents.completedAt.notNull).toBe(false)
  })

  test('toolCallEvents table has success column (nullable boolean)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.success).toBeDefined()
    expect(toolCallEvents.success.notNull).toBe(false)
  })

  test('toolCallEvents table has errorCode column (nullable text)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.errorCode).toBeDefined()
    expect(toolCallEvents.errorCode.notNull).toBe(false)
  })

  test('toolCallEvents table has durationMs column (nullable integer)', async () => {
    const { toolCallEvents } = await import('../../db/schema')
    expect(toolCallEvents.durationMs).toBeDefined()
    expect(toolCallEvents.durationMs.notNull).toBe(false)
  })
})

describe('[P0] agents.allowedTools — Drizzle schema column', () => {
  test('agents table has allowedTools column (jsonb)', async () => {
    const { agents } = await import('../../db/schema')
    expect(agents.allowedTools).toBeDefined()
  })
})

describe('[P0] migration — 0054_tool-call-events.sql content', () => {
  const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0054_tool-call-events.sql')

  test('migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  test('migration creates tool_call_events table', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE TABLE tool_call_events')
  })

  test('migration has company_id NOT NULL FK to companies', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('company_id')
    expect(content).toContain('NOT NULL')
    expect(content).toContain('REFERENCES companies(id)')
  })

  test('migration has agent_id nullable FK to agents', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('agent_id')
    expect(content).toContain('REFERENCES agents(id)')
    // agent_id line must NOT have NOT NULL
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('agent_id') && l.includes('REFERENCES agents'))
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has run_id TEXT NOT NULL', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('run_id')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('run_id') && !l.startsWith('--'))
    expect(line).toContain('NOT NULL')
  })

  test('migration has tool_name TEXT NOT NULL', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('tool_name')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('tool_name') && !l.startsWith('--'))
    expect(line).toContain('NOT NULL')
  })

  test('migration has started_at TIMESTAMP NOT NULL', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('started_at')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('started_at') && !l.startsWith('--'))
    expect(line).toContain('NOT NULL')
  })

  test('migration has completed_at TIMESTAMP (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('completed_at')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('completed_at'))
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has success BOOLEAN (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('success')
    const lines = content.split('\n')
    const line = lines.find(l => l.trim().startsWith('success') || l.includes('  success '))
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has error_code TEXT (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('error_code')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('error_code'))
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has duration_ms INTEGER (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('duration_ms')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('duration_ms'))
    expect(line).not.toContain('NOT NULL')
  })

  test('[P1] migration creates tce_company_date index on (company_id, started_at)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX tce_company_date')
    expect(content).toContain('company_id')
    expect(content).toContain('started_at')
  })

  test('[P1] migration creates tce_company_agent_date index on (company_id, agent_id, started_at)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX tce_company_agent_date')
  })

  test('[P1] migration creates tce_company_tool_date index on (company_id, tool_name, started_at)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX tce_company_tool_date')
  })

  test('[P1] migration creates tce_run_id index on (run_id)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX tce_run_id')
    expect(content).toContain('run_id')
  })

  test('[P1] migration adds allowed_tools JSONB column to agents', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('ALTER TABLE agents')
    expect(content).toContain('allowed_tools')
    expect(content).toContain('JSONB')
    expect(content).toContain("DEFAULT '[]'::jsonb")
  })
})

describe('[P0] migration journal — 0054 entry', () => {
  const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')

  test('journal contains entry for 0054_tool-call-events', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0054_tool-call-events')
    expect(entry).toBeDefined()
  })

  test('journal entry for 0054 has correct idx=54', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0054_tool-call-events')
    expect(entry).toBeDefined()
    expect(entry.idx).toBe(54)
  })
})

describe('[P1] getDB() tool call event methods — function signatures', () => {
  test('getDB() exports insertToolCallEvent method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.insertToolCallEvent).toBeDefined()
    expect(typeof db.insertToolCallEvent).toBe('function')
  })

  test('getDB() exports updateToolCallEvent method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.updateToolCallEvent).toBeDefined()
    expect(typeof db.updateToolCallEvent).toBe('function')
  })

  test('[P1] insertToolCallEvent accepts required fields without throwing', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(() => db.insertToolCallEvent({
      runId: 'test-run-id',
      toolName: 'read_web_page',
      startedAt: new Date(),
      agentId: null,
      completedAt: null,
      success: null,
      errorCode: null,
      durationMs: null,
    })).not.toThrow()
  })

  test('[P1] updateToolCallEvent accepts completion fields without throwing', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(() => db.updateToolCallEvent('event-id', {
      completedAt: new Date(),
      success: true,
      durationMs: 150,
    })).not.toThrow()
  })

  test('[P1] updateToolCallEvent accepts errorCode for failure case without throwing', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(() => db.updateToolCallEvent('event-id', {
      completedAt: new Date(),
      success: false,
      durationMs: 50,
      errorCode: 'TOOL_QUOTA_EXHAUSTED',
    })).not.toThrow()
  })

  test('[P1] insertToolCallEvent returns a thenable (lazy execution)', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    const query = db.insertToolCallEvent({
      runId: 'test-run-id',
      toolName: 'md_to_pdf',
      startedAt: new Date(),
      agentId: null,
      completedAt: null,
      success: null,
      errorCode: null,
      durationMs: null,
    })
    expect(query).toBeDefined()
    expect(typeof (query as any).then).toBe('function')
  })
})
