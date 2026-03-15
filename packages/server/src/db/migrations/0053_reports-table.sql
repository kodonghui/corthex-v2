-- Story 20.1: Agent Reports DB Schema (D27, E15, FR-RM1~4)
-- AI agent-generated report storage with company-scoped isolation and distribution tracking
-- NOTE: Distinct from human `reports` table — this stores AI markdown reports

CREATE TABLE agent_reports (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID        NOT NULL REFERENCES companies(id),
  agent_id             UUID        REFERENCES agents(id),
  run_id               TEXT        NOT NULL,
  title                TEXT        NOT NULL,
  content              TEXT        NOT NULL,
  type                 TEXT,
  tags                 JSONB       NOT NULL DEFAULT '[]'::jsonb,
  distribution_results JSONB,
  created_at           TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Compound index for company-scoped date-ordered queries (FR-RM3: listReports)
CREATE INDEX agent_reports_company_date ON agent_reports(company_id, created_at DESC);
