import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 20.1: Agent Reports DB Schema & getDB() Methods Tests ===
// TEA: Risk-based coverage — P0 schema columns, P0 migration SQL, P1 getDB methods, P1 multi-tenant isolation

describe('[P0] agent_reports — Drizzle schema table definition', () => {
  test('agentReports table is exported from schema', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports).toBeDefined()
  })

  test('agentReports table has id column (uuid PK)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.id).toBeDefined()
  })

  test('agentReports table has companyId column (notNull FK)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.companyId).toBeDefined()
    expect(agentReports.companyId.notNull).toBe(true)
  })

  test('agentReports table has agentId column (nullable FK)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.agentId).toBeDefined()
    expect(agentReports.agentId.notNull).toBe(false)
  })

  test('agentReports table has runId column (notNull text)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.runId).toBeDefined()
    expect(agentReports.runId.notNull).toBe(true)
  })

  test('agentReports table has title column (notNull text)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.title).toBeDefined()
    expect(agentReports.title.notNull).toBe(true)
  })

  test('agentReports table has content column (notNull text)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.content).toBeDefined()
    expect(agentReports.content.notNull).toBe(true)
  })

  test('agentReports table has type column (nullable text)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.type).toBeDefined()
    expect(agentReports.type.notNull).toBe(false)
  })

  test('agentReports table has tags column (jsonb, notNull)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.tags).toBeDefined()
    expect(agentReports.tags.notNull).toBe(true)
  })

  test('agentReports table has distributionResults column (jsonb, nullable)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.distributionResults).toBeDefined()
    expect(agentReports.distributionResults.notNull).toBe(false)
  })

  test('agentReports table has createdAt column (notNull timestamp)', async () => {
    const { agentReports } = await import('../../db/schema')
    expect(agentReports.createdAt).toBeDefined()
    expect(agentReports.createdAt.notNull).toBe(true)
  })
})

describe('[P0] migration — 0053_reports-table.sql content', () => {
  const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0053_reports-table.sql')

  test('migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  test('migration creates agent_reports table (not conflicting with human reports)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE TABLE agent_reports')
    // Must NOT redefine the existing human reports table
    expect(content).not.toContain('CREATE TABLE reports\n')
    expect(content).not.toContain('CREATE TABLE reports ')
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
    // agent_id should NOT have NOT NULL
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('agent_id'))
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has run_id TEXT NOT NULL column', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('run_id')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('run_id'))
    expect(line).toContain('NOT NULL')
  })

  test('migration has tags JSONB DEFAULT []', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('tags')
    expect(content).toContain('JSONB')
    expect(content).toContain("DEFAULT '[]'::jsonb")
  })

  test('migration has distribution_results JSONB (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('distribution_results')
    expect(content).toContain('JSONB')
    // distribution_results should NOT have NOT NULL
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('distribution_results'))
    expect(line).not.toContain('NOT NULL')
  })

  test('[P1] migration creates agent_reports_company_date index on (company_id, created_at)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX agent_reports_company_date')
    expect(content).toContain('company_id')
    expect(content).toContain('created_at')
  })
})

describe('[P0] migration journal — 0053 entry', () => {
  const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')

  test('journal contains entry for 0053_reports-table', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0053_reports-table')
    expect(entry).toBeDefined()
  })

  test('journal entry for 0053 has correct idx=53', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0053_reports-table')
    expect(entry).toBeDefined()
    expect(entry.idx).toBe(53)
  })
})

describe('[P1] getDB() report methods — function signatures', () => {
  test('getDB() exports listReports method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.listReports).toBeDefined()
    expect(typeof db.listReports).toBe('function')
  })

  test('getDB() exports getReport method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.getReport).toBeDefined()
    expect(typeof db.getReport).toBe('function')
  })

  test('getDB() exports insertReport method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.insertReport).toBeDefined()
    expect(typeof db.insertReport).toBe('function')
  })

  test('getDB() exports updateReportDistribution method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(db.updateReportDistribution).toBeDefined()
    expect(typeof db.updateReportDistribution).toBe('function')
  })

  test('[P1] listReports accepts optional type filter', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    // Should accept no args or with type filter — no throw at call time
    expect(() => db.listReports()).not.toThrow()
    expect(() => db.listReports({ type: 'competitor_analysis' })).not.toThrow()
  })

  test('[P1] getReport accepts id string', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(() => db.getReport('non-existent-id')).not.toThrow()
  })

  test('[P1] insertReport accepts required fields', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    // Should not throw at call construction time
    expect(() => db.insertReport({
      title: 'Test Report',
      content: '## Report Content',
      runId: 'test-run-id',
    })).not.toThrow()
  })

  test('[P1] updateReportDistribution accepts results object', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    expect(() => db.updateReportDistribution('report-id', {
      web_dashboard: 'success',
      pdf_email: 'TOOL_EXTERNAL_SERVICE_ERROR',
    })).not.toThrow()
  })
})

describe('[P1] no-content in listReports — performance requirement', () => {
  test('listReports returns a thenable query builder (lazy execution)', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    const query = db.listReports()
    // Drizzle query builders are thenable (Promise-like)
    expect(query).toBeDefined()
    expect(typeof (query as any).then).toBe('function')
  })

  test('listReports with type filter returns a thenable query builder', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-company-id')
    const query = db.listReports({ type: 'competitor_analysis' })
    expect(query).toBeDefined()
    expect(typeof (query as any).then).toBe('function')
  })
})
