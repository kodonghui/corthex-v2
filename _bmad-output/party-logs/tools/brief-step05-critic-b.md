# CRITIC-B Review: Product Brief Step 05 — MVP Scope
> Reviewer: CRITIC-B (Winston / Amelia / Quinn / Bob)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` — "## MVP Scope" section (lines ~560–691)
> Cross-checked against: architecture.md (D1–D21), step-02 Vision (Phase Delivery Boundaries, MCP Integration Pattern, 18-tool table), step-04 Success Metrics (Metric Collection Requirements telemetry schema), prd.md (RBAC, user personas)
> Date: 2026-03-14

---

## Winston (Architect) — "This will break under load."

**Overall:** Phase delivery boundaries are consistent with what was established in step-02 and verified in step-02 critic review. The MCP infrastructure list correctly references the Manual MCP Integration Pattern (SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN) and uses the correct table names (`mcp_server_configs`, `agents.allowed_tools JSONB`). Two architectural gaps stand out.

**Issue W1 — MEDIUM: `agent_mcp_access` join table is new schema not defined in any prior document.**
Line 585: "Per-agent assignment of MCP server access; no-code grid of checkboxes — Join table: `agent_mcp_access`." Neither architecture.md (D1–D21) nor step-02's MCP design section defines this table. Step-02 defined `mcp_server_configs (id, company_id, name, transport, command, args JSONB, env JSONB)` — per-agent MCP access control was not addressed. The built-in tool toggle uses `agents.allowed_tools JSONB` (D7), but MCP access is fundamentally different: it's a many-to-many relationship between agents and MCP server configs. An `agent_mcp_access` join table requires schema definition: columns (agent_id, mcp_server_config_id, company_id for isolation, created_at?), indexes, and foreign key constraints. The Architecture phase must define this table before it can be implemented. Currently it's named but unspecified.

**Issue W2 — MEDIUM: `upload_media` Phase 1 persona value states users that are entirely Phase 2.**
Line 576: "`upload_media` — Required for Instagram + YouTube publishing (public URL)." Both `publish_instagram` refactor (Phase 2) and `publish_youtube` (Phase 2) are the stated reasons for including `upload_media` in Phase 1. If both consumers are Phase 2, the justification for Phase 1 inclusion is weakened. The actual Phase 1 value case exists: `publish_x` can attach media (X API v2 supports `media.media_ids` via upload endpoint) and `publish_tistory` can embed image URLs from R2. But neither use case is stated in the table. As written, `upload_media` appears to be in Phase 1 solely for Phase 2 consumers — an implementer reading this table would question why it's MVP.

---

## Amelia (Dev) — "This is untestable."

**Issue A1 — HIGH: Gate 2 measurement references `pipeline_id` field not defined in Step-04 telemetry schema.**
Line 655 (Gate 2 — Pipeline completion): Measurement: "Tool call event log: `pipeline_id` with ≥2 sequential tool calls, final call success." But the Step-04 Metric Collection Requirements define the tool call event log schema as: `{ company_id, agent_id, tool_name, started_at, completed_at, success: bool, error_code?: string }` — no `pipeline_id` field. Without `pipeline_id`, a sequence of tool calls from the same agent run cannot be grouped into a pipeline. The metric is unmeasurable from the defined schema. Either: (a) `pipeline_id` (or `run_id`) must be added to the tool call event log schema in Step-04, or (b) the measurement method must use `agent_id + time window` as a proxy for sequential pipeline grouping.

**Issue A2 — HIGH: Gate 4 measurement references "Admin session log" not defined anywhere.**
Line 657 (Gate 4 — Time-to-value): Measurement: "Admin session log: credential registration timestamp → first successful tool call timestamp." The Step-04 Metric Collection Requirements define 4 telemetry items: tool call event log, MCP lifecycle log, pipeline end-to-end timer, credential-scrubber audit. No "Admin session log" is defined. An admin session log tracking credential registration timestamps requires either (a) timestamps stored in the `credentials` table (created_at column) + tool call event log first-success query, or (b) a separate session event log. The measurement path is plausible but requires the `credentials` table to have a `created_at` timestamp column — which should be assumed standard but isn't explicitly confirmed in any schema definition. The measurement description must reference existing telemetry or add a new schema requirement.

**Issue A3 — LOW: `send_email` listed as dependency of `save_report` but absent from Phase 1 tool inventory.**
Line 571: `save_report` key dependency: "`md_to_pdf` + `send_email` chain." `send_email` does not appear in the 8 Phase 1 new tools table. If `send_email` is an existing tool from the current 56-tool set, this is fine — but the brief should note "(existing tool)" to prevent implementers from treating this as an undiscovered Phase 1 scope addition. If `send_email` is not in the existing 56 tools, it is missing from Phase 1 scope entirely and `save_report`'s distribute_to `['pdf_email']` mode cannot be implemented.

---

## Quinn (QA) — "What happens when X is null/empty/concurrent?"

**Issue Q1 — MEDIUM: "Explicitly Out of Scope (all phases)" section header contradicts the annotations inside the table.**
Line 636 section header: "Explicitly Out of Scope (all phases)." But two table rows directly contradict this:
- "Manager approval workflow for `publish_x`" — annotation says "Architecture phase must scope Phase 1 vs Phase 2." If it might be Phase 1 or Phase 2, it is NOT "all phases" out of scope.
- "Tool usage audit log" — annotation says "admin UI for audit log is Phase 2." Again, Phase 2 ≠ never.
- "Per-department tool access control" — annotation says "implementation scope assigned to Architecture/Epics phase." Phase assignment pending ≠ all phases out of scope.

The section header should be "Explicitly Out of Scope for Phase 1 MVP" not "all phases." As written, it mislabels features that are simply not Phase 1 as "never shipping," which directly contradicts the Future Vision section and the 팀장 박과장 persona stories.

**Issue Q2 — MEDIUM: Go/No-Go decision logic names only 2 of 6 gates as action triggers.**
Line 661: "If Activation or Reliability gates fail, diagnose root cause and fix before Phase 2 investment." But the Security gate (Gate 6: 0 raw API key values) should be an equally hard stop — a credential leak in production is not a "diagnose and consider Phase 2" situation, it's an immediate rollback and security incident. The decision logic should explicitly state: "Security gate failure → immediate rollback + P0 incident response." Additionally, if the Persona value delivery gate (Gate 5 — 최민준's pipeline ≤5 min) fails, that is the primary product promise of the brief. It should also trigger a hold. As written, 4 of the 6 gates can fail without triggering any defined action.

---

## Bob (SM) — "This scope is unrealistic."

**Issue B1 — MEDIUM: Activepieces/Pipedream phase assignment is contradictory between section header and table row.**
Line 629 section header: "Deferred to Phase 4+ (P3 tools)." Line 632 table row: "Activepieces / Pipedream — Phase 2 Roadmap — 280+ services (Activepieces), 2,500 APIs (Pipedream); significant integration scope." Phase 4+ in the section header vs. "Phase 2 Roadmap" in the row. A story author building the Epic 4+ backlog and a PM reading the Phase 2 roadmap will get inconsistent signals. Must be one or the other. Given the scope (280+ services, 2,500 APIs), Phase 4+ is more credible — "Phase 2 Roadmap" in the row is probably a copy error from an earlier draft.

**Issue B2 — LOW: 12-month vision refers to "Phase 2–3 completion" delivering the full Korean content stack, but the Future Vision section mixes Phase numbering with calendar time ambiguously.**
Line 669: "By Phase 2–3 completion, CORTHEX Tool Integration delivers a complete autonomous business operations platform." No timeline estimate for Phase 2–3 completion is given. If Phase 1 is a 30-day evaluation window + development sprint, and Phase 2–3 each add comparable development cycles, "Phase 2–3 completion" could be 6 months or 18 months. The "12-Month Vision" label implies a calendar target but the body text references phases — readers may conflate them. Minor, but the label "12-Month Vision" should note whether this is aspirational calendar target or phase completion target.

---

## Summary

| # | Severity | Issue | Section |
|---|----------|-------|---------|
| A1 | **HIGH** | Gate 2 uses `pipeline_id` field not in Step-04 telemetry schema — unmeasurable as written | Success Criteria |
| A2 | **HIGH** | Gate 4 uses "Admin session log" not defined in Step-04 telemetry requirements | Success Criteria |
| W2 | **HIGH** | `upload_media` Persona Value justifies Phase 1 inclusion via Phase 2 consumers only — Phase 1 use case unstated | Phase 1 tools table |
| W1 | **MEDIUM** | `agent_mcp_access` join table: new schema not in architecture.md D1-D21 or step-02 | MCP Infrastructure |
| Q1 | **MEDIUM** | "Explicitly Out of Scope (all phases)" header contradicts rows that say Architecture phase must scope Phase 1 vs Phase 2 | Out of Scope section |
| B1 | **MEDIUM** | Activepieces/Pipedream: "Phase 4+" in section header but "Phase 2 Roadmap" in table row | Phase 4+ deferred table |
| Q2 | **MEDIUM** | Go/No-Go logic names only 2 of 6 gates — Security gate failure should be explicit rollback trigger | Success Criteria |
| A3 | **LOW** | `send_email` dependency of `save_report` not in Phase 1 tool list — unclear if existing tool | Phase 1 tools table |
| B2 | **LOW** | "12-Month Vision" label mixes calendar time with phase numbering ambiguously | Future Vision |

**Preliminary score: 7.5/10**

Rationale: Strong section overall. Phase delivery boundaries consistent with step-02. MCP infrastructure list is technically correct and uses verified table names and error codes. Out-of-scope decisions are well-reasoned. Score held down by two unmeasurable success gates (A1, A2 — `pipeline_id` and Admin session log both reference undefined telemetry), a weak Phase 1 justification for `upload_media`, and a section header that contradicts its own content (Q1). The Go/No-Go logic gap (Q2) could leave the team without a defined response to the most critical failure mode (credential leak).

---

## Cross-Talk Outcomes (with Critic-A)

**Critic-A's additional findings (2 new issues not in my review):**

**New Issue CA1 (HIGH — upgrading from undetected):** `publish_x` is Phase 1 P0 but has a $200/month X API Basic cost barrier. No Phase 1 persona Aha! Moment requires X specifically (최민준 = PDF email, 김지은 = Tistory blog, CEO = ARGOS reports). The brief's own free-first deferral logic — "Phase 1 covers `read_web_page` (free) for basic web data needs" re: `web_crawl` — applies equally here. `publish_tistory` covers Phase 1 publishing without the $200/month commitment. Including X as P0 Phase 1 means every pilot company must have X API Basic credentials at setup, threatening Gate 4 (≥3 pilot companies complete journey). Recommendation: downgrade `publish_x` to Phase 2 (P1), alongside `publish_instagram`.

**New Issue CA2 (MEDIUM):** Gate 5 measures "PDF in email inbox, total ≤5 min" but the measurement method is "Pipeline end-to-end timer log" which only measures to `send_email` success response. Email inbox delivery is outside CORTHEX's control (SMTP, spam filters, +1–2 min). Gate 5 could fail due to external delivery delay even when the CORTHEX pipeline performed correctly within the 5-min window. Fix: "≤5 min measured to `send_email` success response (CORTHEX boundary); actual inbox delivery outside CORTHEX control."

**Alignments and upgrades:**

- **A3 upgraded from LOW to HIGH:** Both critics caught `send_email` attachment gap. Critic-A's framing is sharper and definitive: existing `send_email` likely only supports text/HTML — PDF attachment requires `attachments: [{filename, content, encoding: 'base64'}]` which must be explicitly verified and potentially added. If unverified, Gate 5 and CEO Layer 3 weekly report metric are permanently unmeetable. Upgrading A3 from LOW to HIGH.
- **Q1 confirmed MEDIUM:** Both critics agree "Explicitly Out of Scope (all phases)" section header is wrong. Per-dept access control, manager approval, audit log UI are Phase 2+ deferred features not permanent exclusions. Consistent fix: rename section to "Deferred — Scope Assigned in Architecture Phase."
- **W2 confirmed MEDIUM:** Both critics flagged `upload_media` Phase 1 lacking a stated Phase 1 consumer. Fix: add note "(Phase 1 agents may use for Tistory image embedding and X tweet media; ships Phase 1 to enable Phase 2 Instagram/YouTube)."

**Final consolidated issue count: 11 (4 high, 6 medium, 1 low)**

| # | Severity | Source | Issue | Section |
|---|----------|--------|-------|---------|
| CA1 | **HIGH** | Critic-A (new) | `publish_x` P0 — $200/month X API Basic barrier; no Phase 1 Aha! Moment requires X; contradicts free-first deferral logic | Phase 1 tools table |
| A3 (upgraded) | **HIGH** | Both | `send_email` binary attachment capability unverified — critical path for Gate 5 + CEO Layer 3 metric | Phase 1 tools + Success Criteria |
| A1 | **HIGH** | Mine | Gate 2 references `pipeline_id` field not in Step-04 telemetry event log schema | Success Criteria |
| A2 | **HIGH** | Mine | Gate 4 references "Admin session log" not in Step-04 telemetry requirements | Success Criteria |
| W1 | **MEDIUM** | Mine | `agent_mcp_access` join table: new schema, no column/index definition in any prior document | MCP Infrastructure |
| Q1 | **MEDIUM** | Both | "Explicitly Out of Scope (all phases)" header mislabels Phase 2+ deferred features as permanently excluded | Out of Scope section |
| B1 | **MEDIUM** | Mine | Activepieces/Pipedream: "Phase 4+" section header vs "Phase 2 Roadmap" in table row — contradictory | Phase 4+ deferred table |
| Q2 | **MEDIUM** | Mine | Go/No-Go names only Activation + Reliability — Security gate failure needs explicit rollback/P0 trigger | Success Criteria |
| W2 | **MEDIUM** | Both | `upload_media` Phase 1: stated consumers (Instagram/YouTube) are Phase 2; Phase 1 use case (Tistory/X media) unstated | Phase 1 tools table |
| CA2 | **MEDIUM** | Critic-A (new) | Gate 5 measurement boundary: CORTHEX measures to `send_email` success, not email inbox delivery | Success Criteria |
| B2 | **LOW** | Mine | "12-Month Vision" mixes calendar time with phase numbering | Future Vision |

**Score holds at 7.5/10** (Critic-A: 8/10; consolidated: 7.5/10 weighted by additional HIGH issues found in cross-talk)

---

## Re-Verification (post [Fixes Applied] v2)

| Issue | Fix Applied? | Notes |
|-------|-------------|-------|
| CA1 — `publish_x` Phase 2 | ✅ RESOLVED | L615: moved with $200/month + Gate 4 rationale. Phase 1 = 7 tools (L566). Manager approval workflow correctly co-deferred. |
| A3 — `send_email` attachment | ✅ RESOLVED | L571: prerequisite note with exact `attachments: [{filename, content, encoding: 'base64'}]` schema + Gates 5/CEO consequence stated. Codebase-confirmed gap now in spec. |
| A1 — Gate 2 `pipeline_id` | ✅ RESOLVED | L658: rewritten to agent_id + 10-min window proxy. Retroactive Step-04 `run_id` field note added. Implementer-actionable. |
| A2 — Gate 4 Admin session log | ✅ RESOLVED | L660: `credentials.created_at` + first success=true for same company_id. No undefined telemetry. |
| Q1 — Section header | ✅ RESOLVED | L636: "Deferred — Scope Assigned in Architecture Phase" + explicit backlog note (L638). |
| W2 — `upload_media` Phase 1 | ✅ RESOLVED | L575: Tistory image embedding stated. X tweet correctly removed since `publish_x` is Phase 2. |
| CA2 — Gate 5 boundary | ✅ RESOLVED | L661: CORTHEX boundary to `send_email` success; inbox delivery caveat explicit. |
| B1 — Activepieces phase | ✅ RESOLVED (minor observation) | L632: "Phase 2 Roadmap (post-Architecture review)" canonical. Section header still says "Phase 4+" — minor inconsistency remains but row text is unambiguous. Non-blocking. |
| Q2 — Security gate | ✅ RESOLVED | L666: P0 halt + rollback + blocks Phase 2. Explicit and complete. |
| W1 — `agent_mcp_access` schema | ✅ RESOLVED | L645: full column spec + FK/indexes/cascades deferred to Architecture phase. |
| B2 — 12-month label | ✅ RESOLVED | L674: calendar horizon explicit (Phase 2: 3–4 mo, Phase 3: 8–10 mo post-Phase 1). |

**Remaining minor (non-blocking):** B1 — Activepieces/Pipedream row says "Phase 2 Roadmap" but sits inside the "Deferred to Phase 4+" section header. Intent is clear from row text; implementers won't be confused. Acceptable at this stage.

**Final score v2: 9/10** (up from 7.5/10)

All 11 issues resolved. Phase 1 scope is now 7 tools (correct after `publish_x` demotion). `send_email` attachment gap is codebase-confirmed and formally in scope. Go/No-Go gates are all measurable from defined telemetry. Step-05 is implementation-ready.
