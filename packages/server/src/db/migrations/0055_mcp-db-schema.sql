-- Story 18.1: MCP DB Schema (FR-MCP1~3, FR-SO3, D22, D25, NFR-I3, NFR-R3)
-- 3 tables: mcp_server_configs, agent_mcp_access, mcp_lifecycle_events

-- === mcp_server_configs: MCP Server Registry ===
-- Admin-managed. transport: 'stdio' (Phase 1 active), 'sse'/'http' (Phase 2+)
CREATE TABLE mcp_server_configs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES companies(id),
  display_name  TEXT        NOT NULL,
  transport     TEXT        NOT NULL,      -- 'stdio' | 'sse' | 'http'
  command       TEXT,                      -- e.g., 'npx' (stdio only)
  args          JSONB       NOT NULL DEFAULT '[]'::jsonb,   -- e.g., ['-y', '@notionhq/notion-mcp-server']
  env           JSONB       NOT NULL DEFAULT '{}'::jsonb,   -- {'NOTION_TOKEN': '{{credential:xxx}}'}
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX mcp_server_configs_company_idx ON mcp_server_configs(company_id);

-- === agent_mcp_access: Per-Agent MCP Access Control (D22: default OFF) ===
-- Composite PK ensures unique (agent, server) pair. Cascade delete for FK cleanup.
CREATE TABLE agent_mcp_access (
  agent_id      UUID        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  mcp_server_id UUID        NOT NULL REFERENCES mcp_server_configs(id) ON DELETE CASCADE,
  granted_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  PRIMARY KEY (agent_id, mcp_server_id)
);

-- === mcp_lifecycle_events: MCP Process Lifecycle Audit (FR-SO3, NFR-R3) ===
-- event values: 'spawn'|'init'|'discover'|'execute'|'teardown'|'error'
-- NFR-R3 zombie detection: WHERE event != 'teardown' AND created_at < NOW() - INTERVAL '30 seconds'
--   AND session_id NOT IN (SELECT session_id WHERE event = 'teardown')
CREATE TABLE mcp_lifecycle_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES companies(id),
  mcp_server_id UUID        REFERENCES mcp_server_configs(id),
  session_id    TEXT        NOT NULL,      -- SessionContext.sessionId for zombie detection
  event         TEXT        NOT NULL,      -- 'spawn'|'init'|'discover'|'execute'|'teardown'|'error'
  latency_ms    INTEGER,                   -- NFR-P2 warm start latency
  error_code    TEXT,                      -- e.g., 'AGENT_MCP_CREDENTIAL_MISSING'
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Compound index: company + server + time for Admin Audit UI
CREATE INDEX mle_company_mcp ON mcp_lifecycle_events(company_id, mcp_server_id, created_at);
-- Session index: NFR-R3 zombie process detection (SELECT WHERE session_id = $1)
CREATE INDEX mle_session ON mcp_lifecycle_events(session_id);
