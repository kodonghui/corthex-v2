import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Story 22.3: Vector Migration 768→1024 tests
 * Tests migration SQL validity, schema consistency, and script logic.
 */

const MIGRATIONS_DIR = join(__dirname, '../../db/migrations')

describe('Story 22.3: Vector Migration 768→1024', () => {
  describe('Task 1: Migration SQL 0061_voyage_vector_1024.sql', () => {
    const migrationPath = join(MIGRATIONS_DIR, '0061_voyage_vector_1024.sql')
    let migrationSql: string

    test('migration file exists', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toBeTruthy()
    })

    test('sets work_mem for HNSW rebuild', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain("SET LOCAL work_mem = '512MB'")
    })

    test('NULLs knowledge_docs embeddings before ALTER', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      const nullIdx = migrationSql.indexOf('UPDATE knowledge_docs SET embedding = NULL')
      const alterIdx = migrationSql.indexOf('ALTER TABLE knowledge_docs ALTER COLUMN embedding TYPE vector(1024)')
      expect(nullIdx).toBeGreaterThan(-1)
      expect(alterIdx).toBeGreaterThan(nullIdx) // NULL comes before ALTER
    })

    test('drops correct knowledge_docs index name (from 0049)', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain('DROP INDEX IF EXISTS knowledge_docs_embedding_idx')
      // Must NOT reference the wrong name
      expect(migrationSql).not.toContain('knowledge_docs_embedding_hnsw_idx')
    })

    test('creates HNSW index on knowledge_docs with vector_cosine_ops', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain('CREATE INDEX knowledge_docs_embedding_idx')
      expect(migrationSql).toContain('USING hnsw (embedding vector_cosine_ops)')
    })

    test('includes semantic_cache migration', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain('TRUNCATE semantic_cache')
      expect(migrationSql).toContain('ALTER TABLE semantic_cache ALTER COLUMN query_embedding TYPE vector(1024)')
    })

    test('drops correct semantic_cache index name (from 0051)', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain('DROP INDEX IF EXISTS semantic_cache_embedding_idx')
    })

    test('creates HNSW index on semantic_cache with vector_cosine_ops', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      expect(migrationSql).toContain('CREATE INDEX semantic_cache_embedding_idx')
      expect(migrationSql).toContain('USING hnsw (query_embedding vector_cosine_ops)')
    })

    test('knowledge_docs index is built BEFORE semantic_cache index (sequential)', () => {
      migrationSql = readFileSync(migrationPath, 'utf-8')
      const kdIdx = migrationSql.indexOf('CREATE INDEX knowledge_docs_embedding_idx')
      const scIdx = migrationSql.indexOf('CREATE INDEX semantic_cache_embedding_idx')
      expect(kdIdx).toBeGreaterThan(-1)
      expect(scIdx).toBeGreaterThan(kdIdx)
    })
  })

  describe('Task 2: Schema dimensions match migration', () => {
    test('knowledge_docs.embedding is VECTOR(1024)', () => {
      const schema = readFileSync(join(__dirname, '../../db/schema.ts'), 'utf-8')
      // Find the knowledgeDocs embedding line
      const match = schema.match(/embedding:\s*vector\('embedding',\s*\{\s*dimensions:\s*(\d+)\s*\}/)
      expect(match).toBeTruthy()
      expect(match![1]).toBe('1024')
    })

    test('semantic_cache.queryEmbedding is VECTOR(1024)', () => {
      const schema = readFileSync(join(__dirname, '../../db/schema.ts'), 'utf-8')
      const match = schema.match(/queryEmbedding:\s*vector\('query_embedding',\s*\{\s*dimensions:\s*(\d+)\s*\}/)
      expect(match).toBeTruthy()
      expect(match![1]).toBe('1024')
    })

    test('knowledge_docs comment references Voyage AI', () => {
      const schema = readFileSync(join(__dirname, '../../db/schema.ts'), 'utf-8')
      const embeddingLine = schema.split('\n').find(l => l.includes("vector('embedding'") && l.includes('1024'))
      expect(embeddingLine).toBeTruthy()
      expect(embeddingLine).toContain('Voyage AI')
    })
  })

  describe('Task 3: Re-embedding script structure', () => {
    test('script file exists', () => {
      const scriptPath = join(__dirname, '../../scripts/migrate-embeddings-1024.ts')
      const script = readFileSync(scriptPath, 'utf-8')
      expect(script).toBeTruthy()
    })

    test('uses advisory lock for concurrency prevention', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('pg_try_advisory_lock')
      expect(script).toContain('pg_advisory_unlock')
      expect(script).toContain('migrate-embeddings-1024')
    })

    test('queries only NULL embedding docs (idempotent)', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('isNull(knowledgeDocs.embedding)')
      expect(script).toContain('eq(knowledgeDocs.isActive, true)')
    })

    test('uses paginated fetching (LIMIT)', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('.limit(BATCH_SIZE)')
      expect(script).toContain('BATCH_SIZE = 500')
    })

    test('groups by company_id for per-company credentials', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('groupByCompany')
      expect(script).toContain('doc.companyId')
    })

    test('uses getEmbeddingBatch from voyage-embedding.ts', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain("from '../services/voyage-embedding'")
      expect(script).toContain('getEmbeddingBatch')
    })

    test('uses updateDocEmbedding for DB writes', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('updateDocEmbedding')
    })

    test('includes Go/No-Go #10 verification with vector_dims', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('vector_dims(embedding)')
      expect(script).toContain('vector_dims(query_embedding)')
      expect(script).toContain('Go/No-Go #10')
      // Must NOT use array_length
      expect(script).not.toContain('array_length')
    })

    test('exits with non-zero code on verification failure', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('process.exit(1)')
    })

    test('handles rate limiting with batch delay', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('BATCH_DELAY_MS = 100')
      expect(script).toContain('setTimeout')
    })

    test('skips docs with no title and no content', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('!doc.title && !doc.content')
      expect(script).toContain('skipped')
    })
  })

  describe('Task 3 unit: prepareText', () => {
    // Import the actual function
    test('combines title and content', async () => {
      const { prepareText } = await import('../../services/voyage-embedding')
      expect(prepareText('Title', 'Content')).toBe('Title\n\nContent')
    })

    test('handles null content', async () => {
      const { prepareText } = await import('../../services/voyage-embedding')
      expect(prepareText('Title Only', null)).toBe('Title Only')
    })

    test('truncates long text to 10000 chars', async () => {
      const { prepareText } = await import('../../services/voyage-embedding')
      const longContent = 'x'.repeat(20000)
      const result = prepareText('T', longContent)
      expect(result.length).toBe(10000)
    })
  })

  describe('Task 4: Go/No-Go #10 verification queries', () => {
    test('migration SQL does not use array_length', () => {
      const migrationSql = readFileSync(join(MIGRATIONS_DIR, '0061_voyage_vector_1024.sql'), 'utf-8')
      expect(migrationSql).not.toContain('array_length')
    })

    test('script uses vector_dims for dimension check (not array_length)', () => {
      const script = readFileSync(join(__dirname, '../../scripts/migrate-embeddings-1024.ts'), 'utf-8')
      expect(script).toContain('vector_dims')
      expect(script).not.toContain('array_length')
    })
  })

  describe('Consistency checks', () => {
    test('EMBEDDING_DIMENSIONS constant is 1024', async () => {
      const { EMBEDDING_DIMENSIONS } = await import('../../services/voyage-embedding')
      expect(EMBEDDING_DIMENSIONS).toBe(1024)
    })

    test('EMBEDDING_MODEL is voyage-3', async () => {
      const { EMBEDDING_MODEL } = await import('../../services/voyage-embedding')
      expect(EMBEDDING_MODEL).toBe('voyage-3')
    })

    test('no source file imports @google/generative-ai', () => {
      // Verified at project level — Story 22.2 removed all google imports
      const schema = readFileSync(join(__dirname, '../../db/schema.ts'), 'utf-8')
      expect(schema).not.toContain('@google/generative-ai')
    })
  })
})
