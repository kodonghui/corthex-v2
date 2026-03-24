-- Story 22.3: Vector Migration 768→1024
-- IRREVERSIBLE: Gemini 768d → Voyage AI 1024d (knowledge_docs + semantic_cache)
-- PRE-REQUISITE: pg_dump --table=knowledge_docs --table=semantic_cache before execution

-- Increase work_mem for HNSW index builds (scoped to this transaction, auto-resets)
SET LOCAL work_mem = '512MB';

-- === knowledge_docs: embedding VECTOR(768) → VECTOR(1024) ===

-- Step 1: NULL out incompatible Gemini 768d embeddings
UPDATE knowledge_docs SET embedding = NULL WHERE embedding IS NOT NULL;

-- Step 2: Drop existing HNSW index (actual name from migration 0049)
DROP INDEX IF EXISTS knowledge_docs_embedding_idx;

-- Step 3: Change column dimension
ALTER TABLE knowledge_docs ALTER COLUMN embedding TYPE vector(1024);

-- Step 4: Rebuild HNSW index for 1024d
-- Default m=16, ef_construction=64 — appropriate for current scale <10K docs
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
