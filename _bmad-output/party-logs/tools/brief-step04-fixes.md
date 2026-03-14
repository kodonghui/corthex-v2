# Fix Summary: Product Brief Step 04 — Post-Critic Review
> Applied: 2026-03-14 | Writer: BMAD Writer

---

## Issues Fixed: 10 total (1 Critical + 3 High + 6 Medium)

---

### CRITICAL FIX 1: 60s NFR scope conflict — split into call_agent chain vs multi-tool pipeline

**Critics:** Both (Critic-A Critical #1, Critic-B W1)
**Original problem:** Layer 2 had a single row "Agent E2E pipeline time (60s NFR)" applying PRD NFR-P6 to "total wall time for agent run including all tool calls." PRD NFR-P6 governs `call_agent` handoff chain latency — NOT single-agent multi-tool pipelines. The research pipeline from Step-03 Journey 2 (~4 minutes for 3× read_web_page + web_crawl + md_to_pdf + send_email) would have been incorrectly classified as an NFR violation.
**Fix applied:**
- Removed the single incorrect row
- Added Row A: "`call_agent` handoff chain E2E | <60s (PRD NFR-P6) — governs agent-to-agent delegation chains only"
- Added Row B: "Multi-tool single-agent pipeline | NOT governed by 60s NFR — see Layer 3 per-pipeline targets (≤4 min simple / ≤5 min competitive analysis)"

---

### HIGH FIX 2: `agent_tools` table does not exist — corrected to `agents.allowed_tools JSONB`

**Critics:** Both (Critic-A High #2, Critic-B A1)
**Original problem:** Layer 1 "Tool activation rate" measurement referenced `agent_tools` table. Per D7, tools are stored as `allowed_tools JSONB` in the `agents` table — no separate `agent_tools` table exists.
**Fix applied:**
- Changed measurement to: `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0`
- Added parenthetical: `(agents.allowed_tools JSONB per D7 — no separate agent_tools table)`

---

### HIGH FIX 3: `mcp_servers` table name wrong — corrected to `mcp_server_configs`

**Critics:** Both (Critic-A High #3, Critic-B A2)
**Original problem:** Layer 1 "MCP server registration rate" measurement referenced `mcp_servers` table. Step-02 defines the schema as `mcp_server_configs`.
**Fix applied:**
- Changed `mcp_servers` → `mcp_server_configs` in measurement method

---

### HIGH FIX 4: "SaaS substitution events" metric unmeasurable — replaced with behavioral proxy

**Critics:** Critic-A High #4
**Original problem:** Measurement was "customer interview / billing cancellation survey" — CORTHEX has no visibility into external SaaS billing. 90-day lag is too slow for Phase 1 iteration. The metric was aspirational but unmeasurable from within the platform.
**Fix applied:**
- Replaced primary measurement with behavioral proxy: "% of companies with `instagram_access_token` OR `tistory_access_token` registered AND ≥10 successful `publish_instagram`/`publish_tistory` calls in 30 days"
- Phase 1 target changed to: "≥40% of companies meeting the proxy criteria"
- Customer interview kept as qualitative supplement in footnote, not primary measurement
- Renamed row to "SaaS substitution proxy" to be honest about what's being measured

---

### MEDIUM FIX 5: MCP discovery target — warm start caveat added

**Critics:** Critic-B A3
**Original problem:** `<3s/<5s` MCP discovery targets are only achievable after `npx` package is cached. `npx -y @notionhq/notion-mcp-server` on first run downloads the package (10–30 seconds cold start). Targets implied applicability to all starts.
**Fix applied:**
- Added warm start qualifier: "*(warm start, package pre-cached)*. Cold start (`npx -y` first run downloads package: 10–30 seconds) — pre-warming strategy to be defined in Architecture phase."

---

### MEDIUM FIX 6: `ocr_document` missing from Layer 2 SLAs — added

**Critics:** Critic-A Medium #6
**Original problem:** `ocr_document` (Claude Vision API) was absent from Layer 2 latency SLAs. Document size significantly affects latency: single image ~2s vs 20-page scanned PDF ~15–20s. Implementers need explicit targets.
**Fix applied:**
- Added new Layer 2 row: "`ocr_document` p95 latency | <8 seconds (single image / 1-page PDF), <20 seconds (10-page scanned PDF) | >30 seconds → flag for document chunking review"

---

### MEDIUM FIX 7: CEO 김대표 ARGOS metric — added AND send_email success check

**Critics:** Critic-A Medium #5
**Original problem:** "Weekly report automation rate" measured by "ARGOS scheduled run completion log" — but ARGOS recording a completed run does not confirm that the PDF was delivered. `send_email` could fail while ARGOS shows success.
**Fix applied:**
- Measurement changed to: "ARGOS scheduled run completion log **AND** `save_report(distribute_to includes 'pdf_email')` success event within same `run_id`"
- Added explanatory note: "ARGOS completion alone does not confirm email delivery"

---

### MEDIUM FIX 8: 최민준 Layer 3 dual pipeline targets — explained difference

**Critics:** Critic-A Medium #7
**Original problem:** Two Layer 3 rows both targeted 최민준: "Time-to-PDF ≤4 min" and "Competitive analysis pipeline ≤5 min" with no explanation of the 1-minute difference.
**Fix applied:**
- Added note to "Competitive analysis pipeline time" row: "≤4 min = simple pipeline with 1 source. ≤5 min = competitive analysis with 3 sources × read_web_page + web_crawl each (Journey 2 pattern)."

---

### MEDIUM FIX 9: Credential `{{template}}` literal — relabeled from P0 security to HIGH config failure

**Critics:** Critic-B Q1
**Original problem:** Layer 4 listed credential `{{template}}` literal in output as "P0 security alert." This is a config failure (template not resolved = credential key not registered or typo) — no actual credential value is exposed. The real P0 is raw API key value in output, already covered by Layer 2 scrubber metric.
**Fix applied:**
- Relabeled as: "HIGH bug: log error `CREDENTIAL_TEMPLATE_UNRESOLVED: key_name`; block tool call; surface as admin config error"
- Added explicit distinction: "Not a P0 security incident — no real credential value is exposed"
- Layer 2 "Credential-scrubber coverage" metric clarified to distinguish: `{{template}}` literal = config failure vs actual API key value = P0

---

### MEDIUM FIX 10: `compose_video` async job timeout SLA — added

**Critics:** Critic-B Q2
**Original problem:** Layer 4 had a guardrail for queue depth >10 but no explicit timeout SLA for individual jobs. If a single Remotion render hangs indefinitely, the agent waiting for `job_id` resolution has no defined error behavior.
**Fix applied:**
- Added new Layer 4 row: "`compose_video` async job timeout | Single Remotion render job exceeds 15 minutes | Return `TOOL_TIMEOUT: compose_video` error to agent with `job_id` for status poll. Architecture phase must define max retry count and worker failure mode."

---

*Fix count: 10 applied*
