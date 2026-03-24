# Phase E (QA Verification) — Story 22.3: Vector Migration 768→1024

**Reviewer:** Quinn (Critic-B, QA+Security)

## AC-by-AC Verification

### AC-1: Column dimension change ✅
- **Migration SQL** (`0061_voyage_vector_1024.sql`):
  - Line 11: `UPDATE knowledge_docs SET embedding = NULL WHERE embedding IS NOT NULL` ✅
  - Line 17: `ALTER TABLE knowledge_docs ALTER COLUMN embedding TYPE vector(1024)` ✅
  - Line 27: `TRUNCATE semantic_cache` ✅ (ephemeral data, better than NULLing)
  - Line 33: `ALTER TABLE semantic_cache ALTER COLUMN query_embedding TYPE vector(1024)` ✅
- **Schema.ts**:
  - Line 1556: `vector('embedding', { dimensions: 1024 })` ✅ (was 768)
  - Line 1888: `vector('query_embedding', { dimensions: 1024 })` ✅ (was 768)

### AC-2: HNSW index rebuild ✅
- Migration SQL:
  - Line 14: `DROP INDEX IF EXISTS knowledge_docs_embedding_idx` ✅ (correct name from 0049)
  - Line 21-22: `CREATE INDEX knowledge_docs_embedding_idx ON knowledge_docs USING hnsw (embedding vector_cosine_ops)` ✅
  - Line 30: `DROP INDEX IF EXISTS semantic_cache_embedding_idx` ✅ (correct name from 0051)
  - Line 36-37: `CREATE INDEX semantic_cache_embedding_idx ON semantic_cache USING hnsw (query_embedding vector_cosine_ops)` ✅
  - Sequential: knowledge_docs (Steps 1-4) → semantic_cache (Steps 5-8) ✅
  - Line 6: `SET LOCAL work_mem = '512MB'` ✅ (scoped to transaction)

### AC-3: Batch re-embedding ✅
- Script (`migrate-embeddings-1024.ts`):
  - Imports `getEmbeddingBatch`, `prepareText`, `updateDocEmbedding`, `EMBEDDING_MODEL` from `voyage-embedding.ts` ✅
  - Idempotent query: `isNull(knowledgeDocs.embedding), eq(knowledgeDocs.isActive, true)` (line 59) ✅
  - Paginated: `BATCH_SIZE = 500`, `.limit(BATCH_SIZE)`, loop until empty (lines 62, 173-176) ✅
  - Groups by companyId for per-company credentials (lines 65-75) ✅
  - Embedding batch size = 32 (line 23, matches `getEmbeddingBatch` default) ✅
  - Rate limiting: `BATCH_DELAY_MS = 100` with setTimeout between batches (lines 114-117) ✅
  - Skips docs with no title and no content (lines 85-88) ✅
  - Per-company logging (lines 187-189) ✅

### AC-4: Go/No-Go #10 ✅
- `verifyGoNoGo10()` function (lines 123-154):
  - `SELECT count(*)::int FROM knowledge_docs WHERE embedding IS NULL AND is_active = true` ✅
  - `SELECT count(*)::int FROM knowledge_docs WHERE vector_dims(embedding) != 1024` ✅ (not array_length)
  - `SELECT count(*)::int FROM semantic_cache WHERE vector_dims(query_embedding) != 1024` ✅
  - All must be 0 for pass (line 152) ✅
  - `process.exit(1)` on failure (line 210) ✅

### AC-5: Semantic search works with 1024d ✅
- `searchSimilarDocs` in `scoped-query.ts:154` uses Drizzle `cosineDistance` — dimension-agnostic ✅
- `getEmbedding()` now returns 1024d (Story 22.2) → query embedding dimension matches column ✅
- No changes needed in `semantic-search.ts` or `scoped-query.ts` ✅

### AC-6: Schema definitions updated ✅
- `schema.ts:1556`: `dimensions: 1024`, comment: "Voyage AI voyage-3 1024-dim" ✅
- `schema.ts:1888`: `dimensions: 1024`, comment: "Voyage AI voyage-3 1024-dim" ✅

### AC-7: Staging verification ✅
- Migration SQL header: "PRE-REQUISITE: pg_dump --table=knowledge_docs --table=semantic_cache before execution" ✅
- Script includes Go/No-Go verification at end ✅
- Story spec AC-7 documents staging-first requirement ✅

## Security & Data Integrity Checks

| Check | Status | Detail |
|-------|--------|--------|
| Advisory lock (concurrent safety) | ✅ | `pg_try_advisory_lock` at start, `pg_advisory_unlock` in finally block |
| Lock failure = abort | ✅ | `process.exit(1)` if lock not acquired (line 164) |
| SQL injection | ✅ | All SQL via Drizzle `sql` tagged template (parameterized) |
| Pre-migration backup | ✅ | pg_dump documented in migration header |
| Idempotent re-run | ✅ | WHERE embedding IS NULL — reruns safe after partial failure |
| vector_dims vs array_length | ✅ | Correct pgvector function used throughout |
| No Gemini imports | ✅ | `@google/generative-ai` not present in schema or service files |
| EMBEDDING_DIMENSIONS const | ✅ | `1024` in voyage-embedding.ts (line 9) |

## Edge Case Assessment

| Scenario | Handling | Status |
|----------|----------|--------|
| Empty table (0 docs) | `fetchNullEmbeddingDocs` returns [], loop breaks immediately | ✅ |
| All docs have null content | `!doc.title && !doc.content` → skipped++ | ✅ |
| API failure mid-batch | `getEmbeddingBatch` returns null entries → failed++, continues | ✅ |
| Partial failure (crash after 50%) | Rerun: WHERE embedding IS NULL picks up remaining | ✅ |
| Concurrent script execution | Advisory lock prevents second instance | ✅ |
| Connection pool lock persistence | Advisory lock released by session close on process exit | ✅ |

## Minor Observations (non-blocking)

1. **schema.ts:1557** — `embeddingModel` column comment still says `// e.g. 'gemini-embedding-001'`. Should be `'voyage-3'`. Cosmetic only.
2. **process.exit(1) in try block** — Line 210 exits without running `finally` (Node.js behavior). Advisory lock is released by DB session close anyway, but explicit cleanup is cleaner. Non-blocking since PG handles this.

## Verdict: ✅ ALL ACs VERIFIED — Ready for commit.
