# Story 22.3: Vector Migration 768→1024

Status: ready-for-dev

## Story

As a developer,
I want the knowledge_docs vector column migrated from 768 to 1024 dimensions,
so that Voyage AI's full-precision embeddings can be stored and searched.

## Acceptance Criteria

1. **AC-1: Column dimension change (knowledge_docs + semantic_cache)**
   **Given** `knowledge_docs` has `embedding VECTOR(768)` and `semantic_cache` has `query_embedding VECTOR(768)`
   **When** migration `0061_voyage_vector_1024.sql` is executed
   **Then** both columns are altered to `VECTOR(1024)`
   **And** all existing 768-dim embeddings are set to NULL (incompatible dimensions)

2. **AC-2: HNSW index rebuild**
   **Given** the columns are now `VECTOR(1024)`
   **When** the migration completes
   **Then** HNSW indexes using `vector_cosine_ops` are rebuilt on both `knowledge_docs.embedding` and `semantic_cache.query_embedding`
   **And** the indexes support 1024-dimension cosine similarity queries
   **And** indexes are rebuilt SEQUENTIALLY (not concurrent — ~2GB PG memory per rebuild)

3. **AC-3: Batch re-embedding**
   **Given** all existing docs have NULL embeddings after dimension change
   **When** a migration script runs `getEmbeddingBatch()` from `voyage-embedding.ts`
   **Then** all active `knowledge_docs` are re-embedded with Voyage AI `voyage-3` (1024d)
   **And** `embedding_model` is updated to `'voyage-3'`
   **And** `embedded_at` is set to current timestamp

4. **AC-4: Go/No-Go #10 — zero NULL embeddings**
   **Given** batch re-embedding has completed
   **When** running `SELECT count(*) FROM knowledge_docs WHERE embedding IS NULL AND is_active = true`
   **Then** the result is 0
   **And** `SELECT count(*) FROM knowledge_docs WHERE vector_dims(embedding) != 1024` = 0
   **And** `SELECT count(*) FROM semantic_cache WHERE vector_dims(query_embedding) != 1024` = 0

5. **AC-5: Semantic search works with 1024d**
   **Given** docs are re-embedded with 1024d vectors
   **When** a semantic search query is executed via `semanticSearch()`
   **Then** results are returned with cosine similarity scores using 1024d vectors
   **And** `searchSimilarDocs()` in `scoped-query.ts` works without changes (Drizzle `cosineDistance` is dimension-agnostic)

6. **AC-6: Schema definitions updated**
   **Given** migration is applied
   **When** checking `schema.ts`
   **Then** `knowledgeDocs.embedding` reads `vector('embedding', { dimensions: 1024 })` (line 1556)
   **And** `semanticCache.queryEmbedding` reads `vector('query_embedding', { dimensions: 1024 })` (line 1888)
   **And** comments reflect `Voyage AI voyage-3 1024-dim`

7. **AC-7: Pre-migration backup + staging verification**
   **Given** this is an IRREVERSIBLE operation (dimension change + data loss of old embeddings)
   **When** the migration is ready
   **Then** `pg_dump --table=knowledge_docs --table=semantic_cache` is run before migration (backup of 768d state)
   **And** it is tested on a staging/branch database first
   **And** Go/No-Go #10 verification queries pass on staging before production execution

## Tasks / Subtasks

- [ ] Task 1: Create migration SQL `0061_voyage_vector_1024.sql` (AC: #1, #2)
  - [ ] 1.1 NULL out existing knowledge_docs embeddings, then ALTER to `vector(1024)`
  - [ ] 1.2 `DROP INDEX IF EXISTS knowledge_docs_embedding_idx` (actual name from migration 0049)
  - [ ] 1.3 `CREATE INDEX knowledge_docs_embedding_idx ON knowledge_docs USING hnsw (embedding vector_cosine_ops)`
  - [ ] 1.4 NULL out existing semantic_cache query_embeddings, then ALTER to `vector(1024)`
  - [ ] 1.5 `DROP INDEX IF EXISTS semantic_cache_embedding_idx` (actual name from migration 0051)
  - [ ] 1.6 `CREATE INDEX semantic_cache_embedding_idx ON semantic_cache USING hnsw (query_embedding vector_cosine_ops)`
  - [ ] 1.7 Place file: `packages/server/src/db/migrations/0061_voyage_vector_1024.sql`

- [ ] Task 2: Update Drizzle schema definitions (AC: #6)
  - [ ] 2.1 In `packages/server/src/db/schema.ts` line 1556: change `vector('embedding', { dimensions: 768 })` → `vector('embedding', { dimensions: 1024 })`
  - [ ] 2.2 Update knowledge_docs comment: `// pgvector: Voyage AI voyage-3 1024-dim, NULL = not yet embedded`
  - [ ] 2.3 In `packages/server/src/db/schema.ts` line 1888: change `vector('query_embedding', { dimensions: 768 })` → `vector('query_embedding', { dimensions: 1024 })`
  - [ ] 2.4 Update semantic_cache comment to reflect Voyage AI 1024-dim

- [ ] Task 3: Create batch re-embedding migration script (AC: #3, #4)
  - [ ] 3.1 Create `packages/server/src/scripts/migrate-embeddings-1024.ts`
  - [ ] 3.2 Query docs in paginated batches: `WHERE embedding IS NULL AND is_active = true ORDER BY id LIMIT 500 OFFSET ?` (idempotent + memory-safe — follows `BATCH_MAX_DOCS = 500` pattern from `embedAllDocuments`)
  - [ ] 3.3 Group docs by `company_id` (credential vault is per-company)
  - [ ] 3.4 For each company: call `getEmbeddingBatch(companyId, texts, 32)` with `prepareText(title, content)`
  - [ ] 3.5 For each successful embedding: call `updateDocEmbedding(docId, companyId, embedding)`
  - [ ] 3.6 Log progress: `{companyId, total, succeeded, failed}` per company
  - [ ] 3.7 Final verification: run Go/No-Go #10 queries and log results
  - [ ] 3.8 Handle rate limits: use existing `BATCH_DELAY_MS` (100ms between batches) + backoff in `getEmbeddingBatch`
  - [ ] 3.9 Acquire `pg_advisory_lock(hashtext('migrate-embeddings-1024'))` at start to prevent concurrent execution

- [ ] Task 4: Go/No-Go #10 verification (AC: #4, #7)
  - [ ] 4.1 Add verification queries at end of migration script:
    - `SELECT count(*) FROM knowledge_docs WHERE embedding IS NULL AND is_active = true` — must be 0
    - `SELECT count(*) FROM knowledge_docs WHERE vector_dims(embedding) != 1024` — must be 0
    - `SELECT count(*) FROM semantic_cache WHERE vector_dims(query_embedding) != 1024` — must be 0 (stale cache entries were NULLed by migration)
  - [ ] 4.2 Script exits with non-zero code if verification fails
  - [ ] 4.3 Pre-migration backup: `pg_dump --table=knowledge_docs --table=semantic_cache --column-inserts > pre-migration-backup.sql`
  - [ ] 4.4 Run on staging first, verify, then production

- [ ] Task 5: Tests (AC: #1-#6)
  - [ ] 5.1 Test migration SQL syntax is valid (parse check), includes both knowledge_docs and semantic_cache
  - [ ] 5.2 Test re-embedding script handles: empty table, all-null content docs, API failures, partial failures (50% success then crash → rerun processes remainder)
  - [ ] 5.3 Test schema.ts dimensions match migration (1024) for both tables
  - [ ] 5.4 Verify existing `semantic-search.test.ts` passes (cosineDistance is dimension-agnostic)
  - [ ] 5.5 Test idempotency: running re-embedding script twice produces same result (already-embedded docs skipped)
  - [ ] 5.6 Test advisory lock prevents concurrent script execution

## Dev Notes

### Architecture References

**D31 (Voyage AI client):** `services/voyage-embedding.ts` is the ONLY file that imports `voyageai` SDK directly. All embedding operations go through `getEmbedding()` or `getEmbeddingBatch()`. Already created in Story 22.2.
[Source: architecture.md#D31]

**E18 (Voyage AI consistency rule):** All vectors must be 1024d. Post-migration verification: `SELECT count(*) FROM knowledge_docs WHERE vector_dims(embedding) != 1024` = 0. Note: pgvector `vector` type is NOT a PG array — use `vector_dims()`, not `array_length()`.
[Source: architecture.md#E18]

**Go/No-Go #10:** 768d→1024d complete + HNSW rebuild + search quality maintained. Blocks Sprint 1.
[Source: architecture.md line 1879]

### HNSW Build Configuration
- Architecture warns: VECTOR(1024) HNSW rebuild uses ~2GB of PG's 4GB allocation. Sequential rebuild only — no concurrent index builds.
- `SET LOCAL work_mem = '512MB'` before CREATE INDEX (scoped to transaction, auto-resets).
- HNSW parameters: default `m=16`, `ef_construction=64` are appropriate for current scale (<10K docs). For >100K docs, consider `WITH (m = 24, ef_construction = 200)`.
- semantic_cache HNSW rebuild is lightweight (ephemeral data, 24h TTL, small table). Sequential after knowledge_docs is safe within 4GB PG allocation.
[Source: architecture.md line 154]

### Key Files to Modify

| File | Action |
|------|--------|
| `packages/server/src/db/schema.ts:1556` | Change `dimensions: 768` → `dimensions: 1024`, update comment |
| `packages/server/src/db/schema.ts:1888` | Change `dimensions: 768` → `dimensions: 1024` (semantic_cache) |
| `packages/server/src/db/migrations/0061_voyage_vector_1024.sql` | NEW — ALTER both columns + DROP/CREATE HNSW indexes |
| `packages/server/src/scripts/migrate-embeddings-1024.ts` | NEW — batch re-embedding script |

### Files NOT to Modify (already correct)

| File | Why |
|------|-----|
| `services/voyage-embedding.ts` | Already outputs 1024d vectors (Story 22.2) |
| `services/semantic-search.ts` | Uses `getEmbedding()` → already 1024d. `cosineDistance` is dimension-agnostic |
| `db/scoped-query.ts:154` | `searchSimilarDocs` uses Drizzle `cosineDistance` — works with any dimension |

### IRREVERSIBILITY Warning & Rollback Plan
- Changing VECTOR(768) → VECTOR(1024) NULLs all existing embeddings (PG cannot cast between dimensions)
- Old Gemini 768d embeddings are permanently lost
- This is by design — Gemini is banned (확정 결정 #1), all embeddings must be Voyage AI 1024d
- **Pre-migration backup required**: `pg_dump --table=knowledge_docs --table=semantic_cache --column-inserts > pre-migration-backup.sql`
- **Rollback path**: If migration itself fails mid-way, restore from pg_dump. If re-embedding fails partway, script is idempotent (WHERE embedding IS NULL) — just rerun.
- Must verify on staging branch database before production

### agent_memories.embedding — NOT in scope
- Architecture (Sprint 3) plans `agent_memories` extension with `embedding VECTOR(1024)` — but that column does NOT exist yet in current schema.
- This migration only covers existing VECTOR(768) columns: `knowledge_docs.embedding` and `semantic_cache.query_embedding`.

### Migration SQL Pattern

```sql
-- 0061_voyage_vector_1024.sql
-- IRREVERSIBLE: Gemini 768d → Voyage AI 1024d (knowledge_docs + semantic_cache)
-- PRE-REQUISITE: pg_dump --table=knowledge_docs --table=semantic_cache before execution

-- Increase work_mem for HNSW index builds (scoped to this transaction, auto-resets)
SET LOCAL work_mem = '512MB';

-- === knowledge_docs: embedding VECTOR(768) → VECTOR(1024) ===

-- Step 1: NULL out incompatible embeddings
UPDATE knowledge_docs SET embedding = NULL WHERE embedding IS NOT NULL;

-- Step 2: Drop existing HNSW index (actual name from migration 0049)
DROP INDEX IF EXISTS knowledge_docs_embedding_idx;

-- Step 3: Change column dimension
ALTER TABLE knowledge_docs ALTER COLUMN embedding TYPE vector(1024);

-- Step 4: Rebuild HNSW index for 1024d (default m=16, ef_construction=64 — appropriate for current scale <10K docs)
CREATE INDEX knowledge_docs_embedding_idx
  ON knowledge_docs USING hnsw (embedding vector_cosine_ops);

-- === semantic_cache: query_embedding VECTOR(768) → VECTOR(1024) ===

-- Step 5: Clear stale cache (all entries have wrong-dimension embeddings, ephemeral 24h TTL data)
TRUNCATE semantic_cache;

-- Step 6: Drop existing HNSW index (actual name from migration 0051)
DROP INDEX IF EXISTS semantic_cache_embedding_idx;

-- Step 7: Change column dimension
ALTER TABLE semantic_cache ALTER COLUMN query_embedding TYPE vector(1024);

-- Step 8: Rebuild HNSW index for 1024d (sequential after Step 4 — never concurrent)
CREATE INDEX semantic_cache_embedding_idx
  ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
```

### Re-embedding Script Pattern

```typescript
// scripts/migrate-embeddings-1024.ts
import { db } from '../db'
import { knowledgeDocs } from '../db/schema'
import { getEmbeddingBatch, prepareText, updateDocEmbedding, EMBEDDING_MODEL } from '../services/voyage-embedding'
import { eq, isNull, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// 0. Acquire advisory lock: pg_advisory_lock(hashtext('migrate-embeddings-1024'))
// 1. Paginated fetch: WHERE embedding IS NULL AND is_active = true ORDER BY id LIMIT 500
// 2. Group by company_id (credential vault is per-company)
// 3. For each company: batch embed via getEmbeddingBatch(companyId, texts, 32)
// 4. updateDocEmbedding for each success
// 5. Loop until no more NULL embedding docs remain
// 6. Verify Go/No-Go #10 (vector_dims checks)
// 7. Release advisory lock
```

### Existing voyage-embedding.ts API (from Story 22.2)

- `getEmbedding(companyId, text)` → `number[] | null` (1024d)
- `getEmbeddingBatch(companyId, texts[], batchSize=32)` → `(number[] | null)[]`
- `prepareText(title, content)` → `string` (title + content, truncated to 10KB)
- `updateDocEmbedding(docId, companyId, embedding, model?)` → raw SQL UPDATE
- `embedAllDocuments(companyId)` → existing batch function (limit 500, NULL embeddings only)
- Constants: `EMBEDDING_MODEL = 'voyage-3'`, `EMBEDDING_DIMENSIONS = 1024`, `BATCH_DELAY_MS = 100`

### Testing Standards

- Framework: `bun:test`
- Test migration SQL parse validity
- Test re-embedding script edge cases (empty table, partial failures)
- Existing tests in `semantic-search.test.ts` and `semantic-search-tea.test.ts` should still pass

### Project Structure Notes

- Migration file: `packages/server/src/db/migrations/0061_voyage_vector_1024.sql` (next sequential after 0060)
- Script file: `packages/server/src/scripts/migrate-embeddings-1024.ts` (one-time operational script)
- Schema: `packages/server/src/db/schema.ts` (existing file, line 1556)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#D31] — Voyage AI client decision
- [Source: _bmad-output/planning-artifacts/architecture.md#E18] — Voyage AI consistency rule
- [Source: _bmad-output/planning-artifacts/architecture.md line 1879] — Go/No-Go #10
- [Source: _bmad-output/planning-artifacts/architecture.md line 154] — HNSW memory warning
- [Source: _bmad-output/planning-artifacts/architecture.md line 2507] — File tree: 0061 migration
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md lines 1364-1381] — Story definition
- [Source: packages/server/src/services/voyage-embedding.ts] — Voyage AI SDK wrapper (Story 22.2)
- [Source: packages/server/src/services/semantic-search.ts] — Semantic search (dimension-agnostic)
- [Source: packages/server/src/db/scoped-query.ts:154] — searchSimilarDocs (cosineDistance)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
