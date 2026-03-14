# CRITIC-A Review: Product Brief Step 04 — Success Metrics
> Reviewer: Critic-A (John/Sally/Mary)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines 482–555
> Date: 2026-03-14

---

## Score: 7.5/10

---

## John (PM) — "WHY should the user care? Where's the evidence?"

**Positive:** The 4-layer structure (Adoption → Performance → Business Outcome → Guardrails) is exactly the right framework. The Layer 3 Business Outcome metrics are the section's strongest element — each maps to a named persona with a specific before/after claim ("2 hours → ≤4 minutes," "2–3 hours/week → ≤10 minutes"). The `compose_video` exclusion from the 60s E2E NFR is correctly called out. Cross-referencing against architecture.md E2E NFR, research doc #07 Firecrawl limits, and Step-02 ARM64 constraint shows thorough integration.

**Issue 1 (HIGH — Unmeasurable Metric): Layer 3 "SaaS substitution events" metric (line 524) cannot be measured as specified.**
Target: "≥1 SaaS subscription cancelled within 90 days." Measurement: "Customer interview / billing cancellation survey."

Problems: (a) CORTHEX has zero visibility into customers' external billing — there is no event in any CORTHEX log when a customer cancels Predis.ai. (b) "Customer interview" is a qualitative CS activity, not a product telemetry metric — it cannot be auto-collected or tracked in a dashboard. (c) 90-day lag is too long for iteration — by the time this signal comes back, it's too late to course-correct Phase 1.

Fix: Replace with a measurable proxy: "% of companies with Predis.ai-equivalent tool credentials registered (`instagram_access_token` + `replicate_api_token`) AND ≥10 successful `publish_instagram` calls in 30 days." This is observable from existing telemetry and is a reasonable behavioral proxy for SaaS substitution. Keep the customer interview as a qualitative supplement, not the primary measurement method.

**Issue 2 (HIGH — DB Schema Mismatch): Layer 1 measurement queries inconsistent with defined schema.**
- Line 493: `DB: 'mcp_servers' table` — but Step-02 schema defines the table as `mcp_server_configs`. A query against `mcp_servers` returns zero rows.
- Line 492: `DB query: 'agent_tools' table` — this table is never defined in any schema section of the brief. Step-02 defines `mcp_server_configs` and `agent_mcp_access`, but there is no `agent_tools` or `agent_allowed_tools` table. Implementers writing telemetry queries will not know what table to target.

Fix: (a) Change `mcp_servers` → `mcp_server_configs` everywhere. (b) Define the agent tool assignment table name (e.g., `agent_tool_assignments` or confirm it's stored in agent config JSONB) so measurement queries are executable.

---

## Sally (UX) — "A real user would never do it this way."

**Positive:** The Guardrail Metrics (Layer 4) are the section's most practically useful addition — especially "Credential `{{template}}` literal appearing in tool output → P0 security alert" (line 536). This is exactly the kind of failure mode that a real admin would encounter and need a clear signal for. The Metric Collection Requirements section (lines 542–551) correctly identifies telemetry as a backend implementation requirement, not UI — this prevents the common mistake of treating metrics as post-MVP additions.

**Issue 3 (MEDIUM — Incomplete Measurement Method): Layer 3 "Weekly report automation rate" for CEO 김대표 (line 523) measures the wrong thing.**
Target: "≥80% of weekly reports delivered without human touch (ARGOS-scheduled)." Measurement: "ARGOS scheduled run completion log."

But ARGOS completion ≠ report delivery. A scheduled job can complete (ARGOS: run success) but `send_email` fails (network timeout) or `save_report` errors — the report was NOT delivered even though ARGOS ran. The metric should measure actual delivery, not scheduler execution.

Fix: Measurement method → `ARGOS run completion log AND (save_report success event with distribute_to containing 'pdf_email') within the same run_id`. Both conditions must be true for a "delivered without human touch" count.

**Issue 4 (MEDIUM — Missing SLA): `ocr_document` is absent from Layer 2 Performance SLAs.**
Layer 2 covers `md_to_pdf`, `read_web_page`, `web_crawl`, MCP discovery. But `ocr_document` (Claude Vision API call) is absent. Claude Vision has its own latency profile — a high-resolution scanned invoice or a 20-page PDF can take 5–15 seconds. For agents running OCR as part of a pipeline, this directly affects the E2E 60s NFR.

Fix: Add row: `ocr_document p95 latency | 95th percentile Claude Vision API response for image/PDF OCR | <8 seconds (single page) / <20 seconds (10-page PDF) | >30 seconds → flag for chunking review`.

---

## Mary (BA) — "The business case doesn't hold."

**Positive:** The Metric Collection Requirements section (lines 542–551) is what separates a real spec from a wish list. Explicitly calling out "these are backend logging requirements, not Phase 1 UI features" and specifying the exact event schema `{ company_id, agent_id, tool_name, started_at, completed_at, success, error_code }` means engineering can implement these without another requirements session. The D20 companyId isolation reference and credential-scrubber audit note (never log actual credential value) show the author cross-checked the architecture.

**Issue 5 (MEDIUM — Duplicate Metrics Unexplained): Two 최민준 Layer 3 metrics with different targets for the same pipeline (lines 522 and 525).**
- "Time-to-PDF from hub command" → ≤4 minutes
- "Competitive analysis pipeline time" → ≤5 minutes

Both are attributed to 최민준. The competitive analysis IS the canonical time-to-PDF scenario (Journey 2 in Step-03 is the competitive analysis pipeline). The 1-minute difference (4 min vs 5 min) is unexplained — if competitive analysis requires more tool calls (3× `read_web_page` + 2× `web_crawl` + `search_web`), then 5 min is the correct target for that specific pipeline, and 4 min applies to simpler pipelines. But this needs to be stated explicitly.

Fix: Either (a) merge into one metric with pipeline-type differentiation ("≤4 min for single-URL analysis, ≤5 min for 3-competitor comparative analysis"), or (b) keep separate but add a brief note: "4 min = simple pipeline (1 web source). 5 min = competitive analysis (3 sources × 2 tools each)."

**Issue 6 (LOW — False Positive Risk): Layer 4 MCP zombie process guardrail (line 535) conflicts with session reuse option.**
The 6-step MCP pattern (Step-02) defines TEARDOWN as: "terminate child processes at session end **(or keep alive for session reuse)**." If MCP processes are kept alive for reuse, the guardrail "flag if MCP child process exceeds session end + 30 seconds" would fire continuously as a false positive.

Fix: Add conditional: "Alert only if MCP server has `session_reuse: false` config; persistent processes with `session_reuse: true` require a different liveness check (heartbeat ping)."

---

## Cross-Reference Findings

| Claim | Source Checked | Status |
|-------|---------------|--------|
| E2E <60s NFR (line 509) | architecture.md | ✅ Cross-referenced correctly |
| compose_video excluded from 60s NFR | Step-02 async job pattern | ✅ Correct |
| Firecrawl 100,000 pages/month at 80% alert | Research doc #07 Growth plan | ✅ Accurate |
| ARM64 24GB → Puppeteer OOM concern | Step-02 concurrency note | ✅ Correct |
| D20 companyId key format for telemetry isolation | MEMORY.md D20 | ✅ Referenced |
| `mcp_server_configs` table name | Step-02 schema | ❌ Metrics say `mcp_servers` |
| `agent_tools` table | Step-02 schema | ❌ Not defined anywhere |
| `ocr_document` SLA | Layer 2 | ❌ Missing |

---

## Priority Issues for Writer

1. **[HIGH]** Fix "SaaS substitution events" measurement: replace customer interview with proxy metric (Instagram credential registered + ≥10 publish calls in 30 days)
2. **[HIGH]** Fix DB table names: `mcp_servers` → `mcp_server_configs`; define or name the agent tool assignment table
3. **[MEDIUM]** Fix CEO 김대표 metric measurement: ARGOS completion log → ARGOS completion AND save_report success (same run_id)
4. **[MEDIUM]** Add `ocr_document` p95 SLA to Layer 2
5. **[MEDIUM]** Clarify or merge duplicate 최민준 metrics (4 min vs 5 min)
6. **[LOW]** Add session-reuse conditional to MCP zombie process guardrail

---

---

## Cross-Talk Update (with Critic-B)

**W1 — 60s NFR scope conflict [UPGRADED TO CRITICAL from Critic-B]:**
PRD NFR-P6 governs `call_agent` handoff chain latency, NOT single-agent multi-tool pipeline duration. Layer 2 line 509 applies the 60s NFR to "total wall time for agent run including all tool calls" — this would incorrectly classify the research pipeline (3× read_web_page + web_crawl + md_to_pdf + send_email = ~4 minutes per Step-03 Journey 2) as a 60s NFR violation. These are architecturally different things. Fix must distinguish: (a) `call_agent` handoff chain E2E ≤60s (PRD NFR-P6 scope), (b) single-agent multi-tool pipeline uses Layer 3 per-pipeline targets (≤4 min, ≤5 min) instead.

**A1+A2 — DB table precision [UPGRADED specificity from Critic-B]:**
My finding was "`agent_tools` table is undefined in schema." Critic-B adds the precise D7 reference: tools are stored as `allowed_tools JSONB` in the `agents` table — there is NO separate `agent_tools` table. The metric measurement must be a JSONB query on `agents` table (e.g., `WHERE allowed_tools != '[]'`), not a row count on a non-existent table.

**Confirmed issues (both critics agree):**
1. 60s NFR conflated with multi-tool pipeline duration — CRITICAL
2. "SaaS substitution events" unmeasurable — HIGH (my finding)
3. `agent_tools` → `allowed_tools JSONB` in `agents` table — HIGH (both critics, D7 precision from Critic-B)
4. `mcp_servers` → `mcp_server_configs` — HIGH (both critics)
5. ARGOS completion ≠ report delivery — MEDIUM (my finding)
6. `ocr_document` missing from Layer 2 — MEDIUM (my finding)
7. Duplicate 최민준 metrics unexplained — MEDIUM (my finding)

**Score: 7.5/10 (both critics aligned)**

---

*Review finalized: 2026-03-14 | Post-cross-talk version*
