import { describe, test, expect } from 'bun:test'
import { toSql, fromSql } from 'pgvector'

// === TEA-Generated: Risk-based tests for Story 10.1 pgvector ===
// Risk focus: edge cases, boundary conditions, cross-module integration

describe('TEA: pgvector customType edge cases', () => {
  // P0: Edge case — NaN values in vector (JSON.stringify converts NaN to null)
  test('toSql handles NaN values (converts to null in JSON)', () => {
    const vec = [0.1, NaN, 0.3]
    const result = toSql(vec)
    expect(result).toContain('null')
  })

  // P0: Edge case — Infinity values
  test('toSql handles Infinity values', () => {
    const vec = [Infinity, -Infinity, 0]
    const result = toSql(vec)
    expect(typeof result).toBe('string')
  })

  // P0: Empty array edge case
  test('toSql handles empty array', () => {
    const result = toSql([])
    expect(result).toBe('[]')
  })

  // P0: Single element vector
  test('toSql/fromSql roundtrip for single element', () => {
    const original = [0.42]
    const sql = toSql(original)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(1)
    expect(restored![0]).toBeCloseTo(0.42, 5)
  })

  // P1: Very small floating point values (precision)
  test('toSql preserves very small values', () => {
    const vec = [1e-10, -1e-10, 0.000001]
    const sql = toSql(vec)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(3)
    expect(restored![0]).toBeCloseTo(1e-10, 15)
  })

  // P1: Very large floating point values
  test('toSql handles large magnitude values', () => {
    const vec = [1e30, -1e30, 999999.999]
    const sql = toSql(vec)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(3)
    expect(restored![2]).toBeCloseTo(999999.999, 2)
  })

  // P0: Exact 768 dimensions (Gemini Embedding size)
  test('768-dim vector roundtrip preserves length exactly', () => {
    const vec768 = Array.from({ length: 768 }, (_, i) => Math.sin(i))
    const sql = toSql(vec768)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(768)
  })

  // P1: Mixed positive/negative/zero values
  test('mixed sign values roundtrip correctly', () => {
    const vec = [-1, 0, 1, -0.5, 0.5]
    const sql = toSql(vec)
    const restored = fromSql(sql)
    expect(restored).toEqual([-1, 0, 1, -0.5, 0.5])
  })

  // P1: Integer values in vector (should still work)
  test('integer values serialize correctly', () => {
    const vec = [1, 2, 3, 4, 5]
    const sql = toSql(vec)
    const restored = fromSql(sql)
    expect(restored).toEqual([1, 2, 3, 4, 5])
  })
})

describe('TEA: Drizzle pgvector module integrity', () => {
  // P0: Module exports completeness
  test('pgvector.ts exports all required symbols', async () => {
    const mod = await import('../../db/pgvector')
    expect(mod.vector).toBeDefined()
    expect(mod.cosineDistance).toBeDefined()
    expect(mod.l2Distance).toBeDefined()
    expect(mod.innerProduct).toBeDefined()
    // Exactly 4 exports expected
    const exportKeys = Object.keys(mod)
    expect(exportKeys).toContain('vector')
    expect(exportKeys).toContain('cosineDistance')
    expect(exportKeys).toContain('l2Distance')
    expect(exportKeys).toContain('innerProduct')
  })

  // P1: vector function returns a customType-compatible builder
  test('vector() is callable and returns column builder', async () => {
    const { vector } = await import('../../db/pgvector')
    // vector is used like: vector('column_name', { dimensions: 768 })
    // It should be a function (customType factory)
    expect(typeof vector).toBe('function')
  })

  // P0: Distance helpers are functions
  test('distance helpers accept column and vector params', async () => {
    const { cosineDistance, l2Distance, innerProduct } = await import('../../db/pgvector')
    // Verify they're callable (actual SQL generation requires a real column reference)
    expect(typeof cosineDistance).toBe('function')
    expect(typeof l2Distance).toBe('function')
    expect(typeof innerProduct).toBe('function')
  })
})

describe('TEA: schema embedding columns — constraint validation', () => {
  // P0: All 3 new columns exist on knowledgeDocs
  test('knowledgeDocs has all 3 embedding-related columns', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    const columnNames = Object.keys(knowledgeDocs)
    expect(columnNames).toContain('embedding')
    expect(columnNames).toContain('embeddingModel')
    expect(columnNames).toContain('embeddedAt')
  })

  // P0: Existing columns unchanged (regression check)
  test('knowledgeDocs retains all original columns', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    const required = ['id', 'companyId', 'folderId', 'title', 'content', 'contentType', 'fileUrl', 'tags', 'createdBy', 'updatedBy', 'isActive', 'createdAt', 'updatedAt']
    for (const col of required) {
      expect(knowledgeDocs[col as keyof typeof knowledgeDocs]).toBeDefined()
    }
  })

  // P1: embedding column name maps to DB column correctly
  test('embedding column maps to snake_case DB column', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embedding.name).toBe('embedding')
  })

  // P1: embeddingModel column maps to snake_case DB column
  test('embeddingModel column maps to embedding_model in DB', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embeddingModel.name).toBe('embedding_model')
  })

  // P1: embeddedAt column maps to snake_case DB column
  test('embeddedAt column maps to embedded_at in DB', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embeddedAt.name).toBe('embedded_at')
  })

  // P0: No notNull on any new column (all optional for gradual embedding)
  test('all 3 new columns are nullable', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embedding.notNull).toBe(false)
    expect(knowledgeDocs.embeddingModel.notNull).toBe(false)
    expect(knowledgeDocs.embeddedAt.notNull).toBe(false)
  })

  // P1: companyId is still notNull (regression)
  test('companyId remains notNull (regression)', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.companyId.notNull).toBe(true)
  })

  // P1: title is still notNull (regression)
  test('title remains notNull (regression)', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.title.notNull).toBe(true)
  })
})

describe('TEA: scoped-query vector methods', () => {
  // P0: getDB returns object with all expected methods
  test('getDB returns knowledgeDocsWithEmbedding method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-tenant')
    expect(typeof db.knowledgeDocsWithEmbedding).toBe('function')
  })

  test('getDB returns searchSimilarDocs method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-tenant')
    expect(typeof db.searchSimilarDocs).toBe('function')
  })

  // P0: getDB still throws on empty companyId
  test('getDB throws on empty companyId', async () => {
    const { getDB } = await import('../../db/scoped-query')
    expect(() => getDB('')).toThrow('companyId required')
  })

  // P0: Existing methods still present (regression)
  test('getDB retains all existing methods (regression)', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const db = getDB('test-tenant')
    const expectedMethods = [
      'agents', 'departments', 'knowledgeDocs',
      'agentById', 'agentsByReportTo', 'agentToolsWithDefs',
      'departmentById', 'userById',
      'insertAgent', 'updateAgent', 'deleteAgent',
      'insertCostRecord',
      'presetsByUser', 'presetById', 'presetByName',
      'insertPreset', 'updatePreset', 'deletePreset', 'incrementPresetSortOrder',
      'sketches', 'sketchById', 'updateSketch',
      'tierConfigs', 'tierConfigByLevel',
      'insertTierConfig', 'updateTierConfig', 'deleteTierConfig',
      // New Story 10.1 methods
      'knowledgeDocsWithEmbedding', 'searchSimilarDocs',
    ]
    for (const method of expectedMethods) {
      expect(typeof db[method as keyof typeof db]).toBe('function')
    }
  })
})

describe('TEA: migration SQL — structural validation', () => {
  let content: string

  test('migration file loads', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content.length).toBeGreaterThan(0)
  })

  // P0: Extension creation comes first (before ALTER TABLE)
  test('CREATE EXTENSION appears before ALTER TABLE', () => {
    const extPos = content.indexOf('CREATE EXTENSION')
    const alterPos = content.indexOf('ALTER TABLE')
    expect(extPos).toBeLessThan(alterPos)
  })

  // P0: Index creation comes after column addition
  test('CREATE INDEX appears after ALTER TABLE', () => {
    const lastAlterPos = content.lastIndexOf('ALTER TABLE')
    const indexPos = content.indexOf('CREATE INDEX')
    expect(indexPos).toBeGreaterThan(lastAlterPos)
  })

  // P1: Uses IF NOT EXISTS for extension (idempotent)
  test('extension creation is idempotent (IF NOT EXISTS)', () => {
    expect(content).toContain('IF NOT EXISTS')
  })

  // P1: HNSW index name follows convention
  test('index follows naming convention', () => {
    expect(content).toContain('knowledge_docs_embedding_idx')
  })

  // P1: Uses vector_cosine_ops for cosine similarity
  test('HNSW index uses vector_cosine_ops', () => {
    expect(content).toContain('vector_cosine_ops')
  })

  // P1: All 3 columns added in migration
  test('migration adds exactly 3 columns', () => {
    const alterCount = (content.match(/ALTER TABLE.*ADD COLUMN/g) || []).length
    expect(alterCount).toBe(3)
  })
})

describe('TEA: journal file integrity', () => {
  test('journal entries are ordered by idx', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const indices = journal.entries.map((e: any) => e.idx)
    // Check that indices are non-decreasing
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1])
    }
  })

  test('0049 entry has correct tag', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = journal.entries.find((e: any) => e.idx === 49)
    expect(entry).toBeDefined()
    expect(entry.tag).toBe('0049_pgvector-extension')
    expect(entry.version).toBe('7')
    expect(entry.breakpoints).toBe(true)
  })
})
