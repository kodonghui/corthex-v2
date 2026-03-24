-- Observations table — raw agent task execution recordings (D22)
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id UUID,
  task_execution_id UUID,
  content TEXT NOT NULL CHECK (length(content) <= 10240),
  domain VARCHAR(50) NOT NULL DEFAULT 'conversation',
  outcome VARCHAR(20) NOT NULL DEFAULT 'unknown',
  tool_used VARCHAR(100),
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  embedding VECTOR(1024),
  reflected BOOLEAN NOT NULL DEFAULT false,
  reflected_at TIMESTAMPTZ,
  flagged BOOLEAN NOT NULL DEFAULT false,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR43: Three indexes
CREATE INDEX idx_observations_unreflected
  ON observations (company_id, agent_id, importance DESC)
  WHERE reflected = false;

CREATE INDEX idx_observations_embedding
  ON observations USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_observations_ttl
  ON observations (reflected_at)
  WHERE reflected = true;
