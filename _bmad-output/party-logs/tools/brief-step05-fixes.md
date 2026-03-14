# Fix Summary: Product Brief Step 05 — Post-Critic Review
> Applied: 2026-03-14 | Writer: BMAD Writer

---

## Issues Fixed: 11 total (4 High + 6 Medium + 1 Low)

---

### HIGH FIX 1: `publish_x` downgraded from Phase 1 to Phase 2

**Critics:** Both (Critic-A High #1, Critic-B CA1)
**Original problem:** `publish_x` was listed as Phase 1 P0. X API Basic costs $200/month — the same "free-first deferral" logic applied to `web_crawl` (Firecrawl $99/month → use `read_web_page` free first) applies equally here: `publish_tistory` covers all Phase 1 publishing Aha! Moments without the $200/month barrier. Including X in Phase 1 forces every pilot company to commit $200/month at setup, threatening Gate 4 (≥3 pilot companies complete journey <30 min in-app).
**Fix applied:**
- Removed `publish_x` from Phase 1 Built-in Tools table (now 7 tools, not 8)
- Added to Phase 2 deferral table with explicit rationale: "Downgraded from Phase 1. X API Basic $200/month cost barrier; publish_tistory covers all Phase 1 Aha! Moments."
- Note added: "Manager approval workflow for publish_x (Persona 6) deferred alongside this."
- Phase 1 intro updated: now 7 built-in tools, not 8

---

### HIGH FIX 2: `send_email` binary attachment prerequisite added to `save_report` row

**Critics:** Both (Critic-A High #2, Critic-B A3)
**Original problem:** `save_report(distribute_to: ['pdf_email'])` chains to `md_to_pdf` → `send_email`. But the existing `send_email` tool (one of 56 builtins) was never verified to support binary attachment (`attachments: [{filename, content, encoding: 'base64'}]`, MIME multipart). If it only supports text/HTML body, Gate 5 (최민준's pipeline) and CEO 김대표's Layer 3 weekly report metric are permanently unmeetable.
**Fix applied:**
- Added prerequisite note to `save_report` row: "Verify `send_email` supports `attachments: [{filename, content, encoding: 'base64'}]` (binary MIME multipart). If not, upgrade `send_email` as part of `save_report` implementation."
- Key Dependency column updated to "`md_to_pdf` + `send_email` (attachment-capable) chain"

---

### HIGH FIX 3: Gate 2 `pipeline_id` field — rewritten with agent_id + time-window proxy

**Critics:** Both (Critic-A High #3, Critic-B A1)
**Original problem:** Gate 2 measurement referenced "Tool call event log: `pipeline_id` with ≥2 sequential tool calls." But Step-04 Metric Collection Requirement #1 defines the event log schema as `{ company_id, agent_id, tool_name, started_at, completed_at, success, error_code }` — no `pipeline_id` field. Gate 2 was unmeasurable.
**Fix applied:**
- Rewrote Gate 2 measurement: "Tool call event log: ≥2 rows with same `agent_id` within a 10-minute window, final row `success=true`"
- Added retroactive Step-04 note: "add `run_id` field to Step-04 Metric Collection Requirement #1 event log schema to enable strict pipeline grouping"

---

### HIGH FIX 4: Gate 4 measurement rewritten using existing DB fields

**Critics:** Both (Critic-A High #4, Critic-B A2)
**Original problem:** Gate 4 measurement referenced "Admin session log: credential registration timestamp → first successful tool call timestamp." No Admin session log exists in Step-04 telemetry. Gate 4 was structurally broken.
**Fix applied:**
- Rewrote Gate 4 measurement: "DB: `credentials.created_at` (first credential registered for company) → tool call event log: first `success=true` row for same `company_id`. Delta = time-to-first-successful-tool-call."
- Added note: "(No separate Admin session log — derived from existing Step-04 telemetry fields.)"

---

### MEDIUM FIX 5: "Explicitly Out of Scope (all phases)" section renamed + improved

**Critics:** Both (Critic-A Medium #5, Critic-B Q1)
**Original problem:** Title "Explicitly Out of Scope (all phases)" was wrong — per-dept access control, manager approval, audit log UI are Phase 2+ features in the product backlog, not permanently excluded.
**Fix applied:**
- Renamed to "Deferred — Scope Assigned in Architecture Phase"
- Added header note: "These features are in the product backlog. They are NOT permanently excluded — Architecture phase will assign them to Phase 2 or Phase 3 epics."
- Added `agent_mcp_access` schema row (Fix 10): "Architecture phase must define: `agent_mcp_access(agent_id, mcp_server_config_id, company_id, created_at)` — FK constraints, indexes, cascade deletes TBD."

---

### MEDIUM FIX 6: `upload_media` Phase 1 consumer documented

**Critics:** Both (Critic-A Medium #6, Critic-B W2)
**Original problem:** `upload_media` row said "Required for Instagram + YouTube publishing (public URL)" — both Phase 2. No Phase 1 consumer was documented.
**Fix applied:**
- Updated row: "**Phase 1 use:** embed images in Tistory posts via public URL. Ships Phase 1 to enable Phase 2 Instagram/YouTube publishing."
- Note: X tweet media attachment removed as Phase 1 use case since `publish_x` was downgraded to Phase 2.

---

### MEDIUM FIX 7: Gate 5 measurement boundary clarified

**Critics:** Both (Critic-A Low #9, Critic-B CA2)
**Original problem:** Gate 5 said "PDF in email inbox, total ≤5 min" — inbox delivery is outside CORTHEX control (SMTP latency, spam filters, +1–2 min).
**Fix applied:**
- Added boundary note: "≤5 min measured to `send_email` success response (CORTHEX system boundary). Actual inbox delivery may add 1–2 min depending on SMTP provider; gate passes if CORTHEX-side pipeline completes within 5 min."
- "PDF in email inbox" changed to "→ `send_email` success response, CORTHEX-side total ≤5 min"

---

### MEDIUM FIX 8: Activepieces/Pipedream — aligned to Step-02 canonical "Phase 2 Roadmap"

**Critics:** Critic-A Medium #7
**Original problem:** Scope table had Activepieces/Pipedream under "Phase 4+" (section header) but row label said "Phase 2 Roadmap" — internal contradiction. Step-02 MEDIUM FIX 7 canonically established these as "Phase 2 Roadmap" in Key Differentiator #5.
**Fix applied:**
- Row label updated to "**Phase 2 Roadmap** (post-Architecture review)" — consistent with Step-02 decision
- Added note: "Architecture phase must scope MCP bridge design before committing to delivery phase."
- Note: Critic-B suggested moving to Phase 4+ to match section header — not applied; Step-02 canonical reference takes precedence.

---

### MEDIUM FIX 9: Security gate failure → P0 rollback wording added

**Critics:** Both (Critic-A Medium #8, Critic-B Q2)
**Original problem:** Go/No-Go decision only listed "Activation or Reliability gate failure → diagnose + fix." Security gate failure (raw API key in output) required stronger action.
**Fix applied:**
- Added explicit security gate failure protocol: "If Security gate fails: immediate halt of all agent tool execution; treat as P0 security incident; rollback Phase 1 tool deployment and do not proceed until credential-scrubber is verified at 100% coverage. Security gate failure blocks Phase 2 regardless of other gate results."

---

### MEDIUM FIX 10: `agent_mcp_access` schema note added

**Critics:** Critic-B W1
**Original problem:** "Agent MCP access matrix" component was listed without schema detail, leaving FK constraints and indexes undefined.
**Fix applied:**
- Added to "Deferred — Scope Assigned in Architecture Phase" section: "`agent_mcp_access` schema — Architecture phase must define: `agent_mcp_access(agent_id, mcp_server_config_id, company_id, created_at)` — FK constraints, indexes, and cascade deletes TBD."

---

### LOW FIX 11: "12-Month Vision" calendar horizon clarified

**Critics:** Critic-B B2
**Original problem:** "12-Month Vision" label ambiguous — could mean 12 months from now, 12 months from Phase 1, or after 12 phases.
**Fix applied:**
- Added clarifying note: "'12-month' = target calendar horizon from Phase 1 release, assuming Phase 2 ships within 3–4 months and Phase 3 within 8–10 months of Phase 1 release. Not a Phase completion count."

---

## Issues NOT Fixed (deferred)

| Issue | Reason |
|-------|---------|
| Step-04 Metric Collection Requirement #1 `run_id` field (retroactive) | Noted as retroactive enhancement in Gate 2 measurement; does not require Step-04 re-review — additive field only |
| `agent_mcp_access` full schema design | Deferred to Architecture phase by design |
| MCP cold start pre-caching strategy | Architecture phase item |

---

*Fix count: 11 applied*
