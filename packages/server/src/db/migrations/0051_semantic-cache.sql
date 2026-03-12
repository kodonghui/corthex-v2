-- Story 15.3: Semantic Caching (D19/D20)

-- Migration A: semantic_cache table with VECTOR(768) + HNSW index
CREATE TABLE semantic_cache (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID        NOT NULL,
  query_text      TEXT        NOT NULL,
  query_embedding VECTOR(768) NOT NULL,
  response        TEXT        NOT NULL,
  ttl_hours       INT         DEFAULT 24 NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX semantic_cache_embedding_idx
  ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);

CREATE INDEX semantic_cache_company_id_idx
  ON semantic_cache (company_id);

-- Migration B: enableSemanticCache column on agents table
ALTER TABLE agents ADD COLUMN enable_semantic_cache BOOLEAN NOT NULL DEFAULT FALSE;
