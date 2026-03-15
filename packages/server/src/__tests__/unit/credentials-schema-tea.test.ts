import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 16.2: Credentials DB Schema & Migration Tests ===
// TEA: Risk-based coverage — P0 schema columns, P0 migration SQL, P1 multi-tenant isolation

describe('[P0] credentials — Drizzle schema table definition', () => {
  test('credentials table is exported from schema', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials).toBeDefined()
  })

  test('credentials table has id column (uuid PK)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.id).toBeDefined()
  })

  test('credentials table has companyId column (notNull FK)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.companyId).toBeDefined()
    expect(credentials.companyId.notNull).toBe(true)
  })

  test('credentials table has keyName column (notNull text)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.keyName).toBeDefined()
    expect(credentials.keyName.notNull).toBe(true)
  })

  test('credentials table has encryptedValue column (notNull text)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.encryptedValue).toBeDefined()
    expect(credentials.encryptedValue.notNull).toBe(true)
  })

  test('credentials table has createdByUserId column (nullable)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.createdByUserId).toBeDefined()
    // nullable — notNull should be false
    expect(credentials.createdByUserId.notNull).toBe(false)
  })

  test('credentials table has updatedByUserId column (nullable)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.updatedByUserId).toBeDefined()
    expect(credentials.updatedByUserId.notNull).toBe(false)
  })

  test('credentials table has createdAt column (notNull timestamp)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.createdAt).toBeDefined()
    expect(credentials.createdAt.notNull).toBe(true)
  })

  test('credentials table has updatedAt column (notNull timestamp)', async () => {
    const { credentials } = await import('../../db/schema')
    expect(credentials.updatedAt).toBeDefined()
    expect(credentials.updatedAt.notNull).toBe(true)
  })
})

describe('[P0] migration — 0052_credentials-table.sql content', () => {
  const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0052_credentials-table.sql')

  test('migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  test('migration creates credentials table', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE TABLE credentials')
  })

  test('migration has id uuid primary key', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('UUID')
    expect(content).toContain('PRIMARY KEY')
  })

  test('migration has company_id NOT NULL FK to companies', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('company_id')
    expect(content).toContain('NOT NULL')
    expect(content).toContain('REFERENCES companies(id)')
  })

  test('migration has key_name TEXT column', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('key_name')
    expect(content).toContain('TEXT')
  })

  test('migration has encrypted_value TEXT column', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('encrypted_value')
    expect(content).toContain('TEXT')
  })

  test('migration has created_by_user_id column (nullable — no NOT NULL)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('created_by_user_id')
    // Should exist but NOT have NOT NULL after it
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('created_by_user_id'))
    expect(line).toBeDefined()
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has updated_by_user_id column (nullable)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('updated_by_user_id')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('updated_by_user_id'))
    expect(line).toBeDefined()
    expect(line).not.toContain('NOT NULL')
  })

  test('migration has created_at TIMESTAMP NOT NULL', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('created_at')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('created_at'))
    expect(line).toBeDefined()
    expect(line).toContain('NOT NULL')
  })

  test('migration has updated_at TIMESTAMP NOT NULL', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('updated_at')
    const lines = content.split('\n')
    const line = lines.find(l => l.includes('updated_at'))
    expect(line).toBeDefined()
    expect(line).toContain('NOT NULL')
  })

  test('[P1] migration has UNIQUE constraint on (company_id, key_name)', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    // Must have unique constraint covering both company_id and key_name
    expect(content).toContain('UNIQUE')
    expect(content).toContain('company_id')
    expect(content).toContain('key_name')
  })

  test('[P1] unique constraint name is credentials_company_key_uniq', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('credentials_company_key_uniq')
  })

  test('[P1] migration creates company index for fast lookups', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE INDEX')
    expect(content).toContain('credentials_company_idx')
    expect(content).toContain('company_id')
  })
})

describe('[P1] multi-tenant isolation — unique constraint semantics', () => {
  test('UNIQUE constraint is scoped to (company_id, key_name) — not just key_name', () => {
    // This test validates the constraint covers BOTH columns (per-company uniqueness)
    // so different companies CAN have the same key_name
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0052_credentials-table.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    // The constraint must reference both columns together
    const constraintMatch = content.match(/UNIQUE\s*\([^)]+\)/i)
    expect(constraintMatch).not.toBeNull()
    const constraintDef = constraintMatch![0]
    expect(constraintDef).toContain('company_id')
    expect(constraintDef).toContain('key_name')
  })

  test('encryptedValue column is text (ciphertext only, no length limit)', async () => {
    // TEXT type ensures no truncation of base64-encoded ciphertext
    const { credentials } = await import('../../db/schema')
    expect(credentials.encryptedValue).toBeDefined()
    // TEXT type in drizzle has dataType 'string'
    expect(credentials.encryptedValue.dataType).toBe('string')
  })
})

describe('[P0] migration journal — 0052 entry', () => {
  const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')

  test('journal file exists', () => {
    expect(fs.existsSync(journalPath)).toBe(true)
  })

  test('journal contains entry for 0052_credentials-table', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0052_credentials-table')
    expect(entry).toBeDefined()
  })

  test('journal entry for 0052 has correct idx=52', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0052_credentials-table')
    expect(entry).toBeDefined()
    expect(entry.idx).toBe(52)
  })

  test('journal entry for 0052 has version "7"', () => {
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: { tag: string }) => e.tag === '0052_credentials-table')
    expect(entry).toBeDefined()
    expect(entry.version).toBe('7')
  })
})
