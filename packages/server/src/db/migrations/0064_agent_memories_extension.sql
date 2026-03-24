-- Story 28.5: Extend agent_memories for reflection support + HNSW vector search

-- Embedding column for semantic memory search (Voyage AI voyage-3 1024d)
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS embedding VECTOR(1024);

-- Category: 'insight', 'fact', 'preference', 'skill', 'pattern', 'knowledge', 'relationship'
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Links memory back to source observations (JSON array of UUIDs for traceability)
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS observation_ids TEXT;

-- HNSW index for semantic memory search (AR43)
CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding
  ON agent_memories USING hnsw (embedding vector_cosine_ops);

-- Partial index: reflection memories by company+agent (fast lookup)
CREATE INDEX IF NOT EXISTS idx_agent_memories_reflection
  ON agent_memories (company_id, agent_id, created_at DESC)
  WHERE source = 'reflection';
