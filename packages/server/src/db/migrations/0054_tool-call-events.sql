-- Story 17.1b: tool_call_events Telemetry Table (D29, FR-SO2, E17)
-- 4 indexes required: 3 compound (Audit Log UI) + 1 run_id (Pipeline Gate SQL)

CREATE TABLE tool_call_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES companies(id),
  agent_id      UUID        REFERENCES agents(id),
  run_id        TEXT        NOT NULL,
  tool_name     TEXT        NOT NULL,
  started_at    TIMESTAMP   NOT NULL,
  completed_at  TIMESTAMP,
  success       BOOLEAN,
  error_code    TEXT,
  duration_ms   INTEGER
);

-- D29: 3 compound indexes for Phase 2 Audit Log UI queries
CREATE INDEX tce_company_date       ON tool_call_events(company_id, started_at);
CREATE INDEX tce_company_agent_date ON tool_call_events(company_id, agent_id, started_at);
CREATE INDEX tce_company_tool_date  ON tool_call_events(company_id, tool_name, started_at);

-- D29: run_id index for Pipeline Gate SQL (O(log n) GROUP BY run_id)
-- Pipeline Gate: SELECT run_id, COUNT(*) FROM tool_call_events WHERE run_id = $1 GROUP BY run_id HAVING COUNT(*) >= 2
CREATE INDEX tce_run_id ON tool_call_events(run_id);

-- Story 17.1b: agents.allowed_tools — string[] JSONB column (D28: tool allowlist enforcement)
-- Empty array default = no tools permitted; populated by Admin Tool Toggle UI (Story 19.2)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS allowed_tools JSONB NOT NULL DEFAULT '[]'::jsonb;
