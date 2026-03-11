import { describe, test, expect } from 'bun:test'
import { toSql, fromSql } from 'pgvector'

// === Task 2.4 + Task 6: pgvector customType + schema tests ===

describe('pgvector utils — toSql/fromSql', () => {
  test('toSql converts number[] to JSON string', () => {
    const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    const result = toSql(embedding)
    expect(result).toBe('[0.1,0.2,0.3,0.4,0.5]')
  })

  test('toSql handles large 768-dim vector', () => {
    const embedding = Array.from({ length: 768 }, (_, i) => i / 768)
    const result = toSql(embedding)
    expect(result).toStartWith('[')
    expect(result).toEndWith(']')
    // Parse back to verify roundtrip
    const parsed = JSON.parse(result)
    expect(parsed).toHaveLength(768)
    expect(parsed[0]).toBeCloseTo(0, 5)
    expect(parsed[767]).toBeCloseTo(767 / 768, 5)
  })

  test('fromSql parses vector string back to number[]', () => {
    const sqlStr = '[0.1,0.2,0.3,0.4,0.5]'
    const result = fromSql(sqlStr)
    expect(result).toEqual([0.1, 0.2, 0.3, 0.4, 0.5])
  })

  test('fromSql returns null for null input', () => {
    const result = fromSql(null as any)
    expect(result).toBeNull()
  })

  test('toSql returns null for null input', () => {
    const result = toSql(null as any)
    expect(result).toBeNull()
  })

  test('roundtrip: toSql -> fromSql preserves values', () => {
    const original = [0.123456, -0.789012, 0.0, 1.0, -1.0]
    const sql = toSql(original)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(original.length)
    for (let i = 0; i < original.length; i++) {
      expect(restored![i]).toBeCloseTo(original[i], 5)
    }
  })

  test('roundtrip: 768-dim vector preserves all values', () => {
    const original = Array.from({ length: 768 }, () => Math.random() * 2 - 1)
    const sql = toSql(original)
    const restored = fromSql(sql)
    expect(restored).toHaveLength(768)
    for (let i = 0; i < 768; i++) {
      expect(restored![i]).toBeCloseTo(original[i], 5)
    }
  })

  test('toSql handles zero vector', () => {
    const zeros = Array(768).fill(0)
    const result = toSql(zeros)
    const restored = fromSql(result)
    expect(restored).toHaveLength(768)
    expect(restored!.every(v => v === 0)).toBe(true)
  })

  test('toSql handles negative values', () => {
    const negatives = [-0.5, -1.0, -0.001]
    const result = toSql(negatives)
    const restored = fromSql(result)
    expect(restored).toEqual([-0.5, -1.0, -0.001])
  })
})

describe('Drizzle vector customType', () => {
  test('customType module exports vector function', async () => {
    const mod = await import('../../db/pgvector')
    expect(mod.vector).toBeDefined()
    expect(typeof mod.vector).toBe('function')
  })

  test('customType module exports cosineDistance helper', async () => {
    const mod = await import('../../db/pgvector')
    expect(mod.cosineDistance).toBeDefined()
    expect(typeof mod.cosineDistance).toBe('function')
  })

  test('customType module exports l2Distance helper', async () => {
    const mod = await import('../../db/pgvector')
    expect(mod.l2Distance).toBeDefined()
    expect(typeof mod.l2Distance).toBe('function')
  })

  test('customType module exports innerProduct helper', async () => {
    const mod = await import('../../db/pgvector')
    expect(mod.innerProduct).toBeDefined()
    expect(typeof mod.innerProduct).toBe('function')
  })
})

describe('knowledge_docs schema — embedding columns', () => {
  test('knowledgeDocs table has embedding column', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embedding).toBeDefined()
  })

  test('knowledgeDocs table has embeddingModel column', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embeddingModel).toBeDefined()
  })

  test('knowledgeDocs table has embeddedAt column', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    expect(knowledgeDocs.embeddedAt).toBeDefined()
  })

  test('embedding column allows NULL (no notNull constraint)', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    // Drizzle columns without .notNull() have notNull = false in config
    const col = knowledgeDocs.embedding
    expect(col.notNull).toBe(false)
  })

  test('embeddingModel column allows NULL', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    const col = knowledgeDocs.embeddingModel
    expect(col.notNull).toBe(false)
  })

  test('embeddedAt column allows NULL', async () => {
    const { knowledgeDocs } = await import('../../db/schema')
    const col = knowledgeDocs.embeddedAt
    expect(col.notNull).toBe(false)
  })
})

describe('scoped-query — vector search methods', () => {
  test('getDB exports knowledgeDocsWithEmbedding method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const scopedDb = getDB('test-company-id')
    expect(scopedDb.knowledgeDocsWithEmbedding).toBeDefined()
    expect(typeof scopedDb.knowledgeDocsWithEmbedding).toBe('function')
  })

  test('getDB exports searchSimilarDocs method', async () => {
    const { getDB } = await import('../../db/scoped-query')
    const scopedDb = getDB('test-company-id')
    expect(scopedDb.searchSimilarDocs).toBeDefined()
    expect(typeof scopedDb.searchSimilarDocs).toBe('function')
  })
})

describe('migration file — 0049_pgvector-extension.sql', () => {
  test('migration file exists', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  test('migration contains CREATE EXTENSION vector', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('CREATE EXTENSION IF NOT EXISTS vector')
  })

  test('migration adds embedding vector(768) column', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('embedding vector(768)')
  })

  test('migration adds embedding_model column', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('embedding_model varchar(50)')
  })

  test('migration adds embedded_at column', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('embedded_at timestamp')
  })

  test('migration creates HNSW index with cosine ops', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const migrationPath = path.resolve(import.meta.dir, '../../db/migrations/0049_pgvector-extension.sql')
    const content = fs.readFileSync(migrationPath, 'utf-8')
    expect(content).toContain('USING hnsw')
    expect(content).toContain('vector_cosine_ops')
  })

  test('journal file includes 0049 entry', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const journalPath = path.resolve(import.meta.dir, '../../db/migrations/meta/_journal.json')
    const content = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
    const entry = content.entries.find((e: any) => e.tag === '0049_pgvector-extension')
    expect(entry).toBeDefined()
    expect(entry.idx).toBe(49)
  })
})
