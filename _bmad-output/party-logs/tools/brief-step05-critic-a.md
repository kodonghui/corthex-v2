# CRITIC-A Review: Product Brief Step 05 — MVP Scope
> Reviewer: Critic-A (John/Sally/Mary)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines 560–691
> Date: 2026-03-14

---

## Score: 8/10

---

## John (PM) — "WHY should the user care? Where's the evidence?"

**Positive:** The deferral reasoning is the section's strongest feature — every deferred item has a specific, non-generic reason: "Puppeteer concurrent headless browser pressure — Phase 2 after concurrency limits validated in Phase 1" (not "lower priority"), "Firecrawl API $99/month — Phase 1 covers read_web_page (free, Jina Reader)" (cost-justified deferral). The go/no-go gates map directly to Layer 1/3 metrics from Step-04 with named measurement methods — not aspirational "success looks like" language.

**Issue 1 (HIGH — Scope Error): `publish_x` is Phase 1 P0 but its $200/month barrier conflicts with the pilot adoption gate.**
`publish_x` appears in Phase 1 (line 575) as a P0 tool. But X API Basic costs $200/month — more expensive than the entire SaaS stack Phase 1 claims to replace (per Step-02 TCO table). The brief's own deferral logic for `web_crawl` was: "Phase 1 covers `read_web_page` (free) for basic web data needs" — deferring the paid API when a free alternative exists. The same logic applies here: `publish_tistory` (free, just OAuth token) covers basic publishing for the Phase 1 Aha! Moments. None of the Phase 1 persona Aha! Moments require X publishing specifically:
- 최민준: `read_web_page` → `save_report` → PDF email (no X)
- 김지은: `publish_tistory` blog posts (no X required)
- CEO 김대표: ARGOS report delivery via `save_report` + `send_email` (no X)

Including `publish_x` as Phase 1 P0 means every pilot company must commit $200/month just to complete Phase 1 setup. This directly undermines Go/No-Go Gate 4 ("≥3 pilot companies complete setup journey") because most won't have X API Basic credentials available or approved. Recommendation: downgrade `publish_x` to Phase 2 (P1), alongside `publish_instagram`. Add brief rationale: "Deferred to Phase 2 — X API Basic $200/month cost barrier; Phase 1 Aha! Moments achievable via `publish_tistory` alone."

**Issue 2 (HIGH — Critical Path Gap): `send_email` attachment capability not verified.**
`save_report(distribute_to: ['pdf_email'])` chains to `md_to_pdf` → `send_email`. This is the primary delivery mechanism for 최민준 (Go/No-Go Gate 5) and CEO 김대표 (ARGOS scheduled PDF delivery). But the brief never verifies that the existing `send_email` builtin tool (one of the 56 existing tools) supports **binary attachments** (base64 PDF + MIME multipart). Standard `send_email` implementations typically support text and HTML bodies only — PDF attachment requires explicit `attachments: [{filename, content, encoding: 'base64'}]` support in the tool schema.

If `send_email` cannot attach files, `save_report(distribute_to: ['pdf_email'])` silently fails or sends a blank email, and both Go/No-Go Gates 5 and CEO 김대표's Layer 3 "weekly report automation rate" metric are permanently unmeetable. This is a Phase 1 critical path dependency. Add a scope note: "**Prerequisite:** Verify existing `send_email` tool supports binary file attachments (base64 PDF). If not, `send_email` must be upgraded as part of `save_report` implementation to support `attachments: [{filename, content, encoding: 'base64'}]` parameter."

---

## Sally (UX) — "A real user would never do it this way."

**Positive:** The `/reports` (Human-accessible) vs `/admin/reports` (Admin only) split is correctly maintained from Step-03 (lines 596–597). The agent tool toggle extension of "existing agent edit UI" (line 586) is the right UX approach — don't create a new page when the behavior can extend an existing one. The persona Aha! Moment cross-references in the tool table (lines 570–577) make this spec immediately readable without referring back to Step-03.

**Issue 3 (MEDIUM — Misleading Section Title): "Explicitly Out of Scope (all phases)" section (line 636) mislabels deferred items.**
The section title says "Explicitly Out of Scope (all phases)" but the items are:
- Per-department tool access control: "Not Phase 1. Architecture/Epics will assign scope."
- Manager approval workflow: "Architecture phase must scope Phase 1 vs Phase 2."
- Tool usage audit log admin UI: "Phase 2."

None of these are "out of scope for all phases" — they're Phase 2+ features pending Architecture phase scope assignment. "Out of scope" in product terminology means "will not be built." These WILL be built (Persona 6 팀장 박과장 depends on them). The title creates confusion about whether these are permanently excluded or just deferred.

Fix: Rename section to "Deferred — Scope to Be Assigned in Architecture Phase" and add a note: "These features are in the product backlog but not Phase 1. Architecture phase will assign them to Phase 2 or Phase 3 epics."

**Issue 4 (MEDIUM — Undocumented Phase 1 Value): `upload_media` Phase 1 inclusion has no standalone Phase 1 use case.**
Line 576: `upload_media` — "Required for Instagram + YouTube publishing (public URL)." Both Instagram (`publish_instagram`) and YouTube (`publish_youtube`) are Phase 2. So in Phase 1, `upload_media` has no consumer that ships in the same phase. An agent in Phase 1 can call `upload_media` but nothing in Phase 1 uses the public URL it returns (Instagram and YouTube are Phase 2).

This is the right strategic decision (ship the dependency before the dependent tools), but it needs an explicit note or it will confuse implementers who ask "why does this Phase 1 story exist if nothing uses it?" Fix: Add note to `upload_media` row: "Ships Phase 1 to enable Phase 2 Instagram/YouTube publishing. Phase 1 agents may also use it to embed media in Tistory posts or X tweets via public URL."

---

## Mary (BA) — "The business case doesn't hold."

**Positive:** The Platform Moat section (lines 685–687) is concise and precisely stated: "the compounding value of tool chains is the long-term competitive moat that point SaaS tools cannot replicate." This is the right framing and doesn't overstate. The 2–3 year AI Business OS vision correctly ties back to Persona 6 (팀장 박과장 governance vision) and Persona 2 (박현우 tool marketplace) — not generic AI future-state claims.

**Issue 5 (MEDIUM — Gate Measurement Gap): Go/No-Go Gate 5 measures pipeline completion to `send_email`, not to PDF receipt.**
Gate 5 (line 658): "≥1 company achieves 최민준's pipeline: Hub command → `read_web_page` × N → `save_report(distribute_to: ['pdf_email'])` → PDF in email inbox, total ≤5 min."

The measurement is "Pipeline end-to-end timer log" — this measures agent-side time from first tool call to final `send_email` completion. But "PDF in email inbox" implies email delivery, which is outside CORTHEX's control (SMTP delivery, spam filters, etc.). The gate should acknowledge the measurement boundary: "≤5 min measured to `send_email` success response (CORTHEX boundary). Actual inbox delivery may add 1–2 minutes depending on SMTP provider. Gate passes if CORTHEX-side pipeline completes ≤5 min regardless of external delivery delay."

Without this clarification, Gate 5 could fail due to an SMTP delay even when the CORTHEX pipeline performed correctly.

---

## Cross-Reference Findings

| Brief Claim | Source Checked | Status |
|-------------|---------------|--------|
| P0/P1/P2/P3 priorities | Step-02 tool inventory table | ✅ Consistent |
| `agents.allowed_tools JSONB` per D7 | Step-04 fix | ✅ Carried forward |
| `mcp_server_configs` table | Step-02 schema | ✅ Consistent |
| `agent_mcp_access` join table | Step-02 schema | ✅ Named correctly |
| Go/No-Go Gates from Layer 1/3 | Step-04 metrics | ✅ Derived correctly |
| `send_email` attachment support | 56 existing tools | ❌ Not verified — critical path assumption |
| `publish_x` P0 vs Aha! Moments | Step-03 persona journeys | ❌ No Phase 1 Aha! Moment requires X |
| `upload_media` Phase 1 consumer | Step-02 Pillar 3 | ⚠️ Consumers are Phase 2 only |

---

## Priority Issues for Writer

1. **[HIGH]** Downgrade `publish_x` to Phase 2 (P1) — $200/month barrier + no Phase 1 Aha! Moment dependency + consistent with free-first deferral pattern
2. **[HIGH]** Add `send_email` attachment verification note as Phase 1 prerequisite for `save_report(distribute_to: ['pdf_email'])` critical path
3. **[MEDIUM]** Rename "Explicitly Out of Scope (all phases)" → "Deferred — Scope Assigned in Architecture Phase" with backlog note
4. **[MEDIUM]** Add Phase 1 standalone use case note for `upload_media` (embed media in Tistory/X posts)
5. **[MEDIUM]** Clarify Gate 5 measurement boundary: CORTHEX measures to `send_email` success, not inbox delivery

---

---

## Cross-Talk Update (with Critic-B)

**A1 — Gate 2 pipeline_id telemetry gap [NEW — added from Critic-B, HIGH]:**
Gate 2 measurement: "Tool call event log: pipeline_id with ≥2 sequential tool calls, final call success." But Step-04 telemetry event log schema only defines: `{ company_id, agent_id, tool_name, started_at, completed_at, success, error_code }` — no `run_id` or `pipeline_id` field. Gate 2 is unmeasurable as written. Fix: either (a) add `run_id` to Step-04 event log schema, or (b) rewrite Gate 2 measurement as agent_id + time-window proxy. Requires Step-04 schema update OR Step-05 Gate 2 measurement rewrite.

**A2 — Gate 4 Admin session log undefined [NEW precision — added from Critic-B, HIGH]:**
Gate 4 measurement references "Admin session log: credential registration timestamp → first successful tool call timestamp." But Step-04's 4 defined telemetry items have no "Admin session log" item — this would be a 5th telemetry requirement. Gate 4 is structurally broken without this. Fix: add Admin session log to Step-04 Metric Collection Requirements, OR rewrite Gate 4 measurement using existing telemetry (credentials.created_at + tool call event log join).

**B1 — Activepieces phase assignment contradiction [NEW — added from Critic-B, MEDIUM]:**
Scope section lists Activepieces/Pipedream under "Phase 4+ (P3 tools)" but Step-02 Key Differentiator #5 (confirmed in Step-02) explicitly labels them "Phase 2 Roadmap." Direct contradiction in phase assignment. Fix: align to a single phase number; recommend "Phase 2 Roadmap (post-Architecture review)" as established in Step-02.

**Q2 — Security gate needs P0 rollback wording [NEW — added from Critic-B, MEDIUM]:**
Go/No-Go decision (line 661) says "If Activation or Reliability gates fail, diagnose root cause and fix before Phase 2 investment." Security gate (0 raw API key values in output) is absent from this decision logic. A security gate failure is not "diagnose and fix" — it is a P0 incident requiring rollback before any further usage. Fix: add explicit sentence: "If Security gate fails (any raw API key value in output), halt all agent tool execution and treat as P0 incident (rollback, not iterate)."

**Confirmed issues (both critics agree):**
1. `publish_x` P0 in Phase 1 — $200/month barrier (my Issue 1)
2. `send_email` attachment support unverified (my Issue 2)
3. Gate 2 `pipeline_id` telemetry gap (Critic-B A1) — HIGH
4. Gate 4 Admin session log undefined (Critic-B A2) — HIGH
5. `upload_media` Phase 1 consumers undocumented (both critics)
6. "Out of scope (all phases)" section title wrong (both critics)
7. Activepieces phase contradiction (Critic-B B1) — MEDIUM
8. Security gate needs P0 rollback (Critic-B Q2) — MEDIUM

**Score: 7.5/10 (revised down from 8/10 based on new HIGH issues from Critic-B)**

---

*Review finalized: 2026-03-14 | Post-cross-talk version*
