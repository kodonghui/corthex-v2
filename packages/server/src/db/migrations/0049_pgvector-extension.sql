-- Story 10.1: pgvector 확장 설치 + 스키마
-- Gemini Embedding 768차원 벡터 컬럼 + HNSW 인덱스

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE knowledge_docs ADD COLUMN embedding vector(768);
ALTER TABLE knowledge_docs ADD COLUMN embedding_model varchar(50);
ALTER TABLE knowledge_docs ADD COLUMN embedded_at timestamp;

CREATE INDEX knowledge_docs_embedding_idx
  ON knowledge_docs USING hnsw (embedding vector_cosine_ops);
