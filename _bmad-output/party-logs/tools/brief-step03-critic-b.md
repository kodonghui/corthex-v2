# CRITIC-B Review: Product Brief Step 03 — Target Users
> Reviewer: CRITIC-B (Winston / Amelia / Quinn / Bob)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines ~242–391
> Cross-checked against: architecture.md (D1–D21), prd.md (대상 사용자 + user roles), step-02 Vision section
> Date: 2026-03-14

---

## Winston (Architect) — "This will break under load."

**Overall:** The personas are architecturally grounded — `AGENT_MCP_CREDENTIAL_MISSING` error code used correctly in 박현우's monitoring step (line 295), `/admin/mcp-servers` UI referenced correctly, credential injection pattern consistent with step-02. No architecture regressions introduced.

**Issue W1 — MCP "connection test" UI implies a new architecture requirement not defined in step-02.**
박현우's step 3 says "verifies connection status indicator shows green" (line 293). A connection health check requires running the step-02 Manual MCP Integration Pattern steps 1–2 (SPAWN child_process + JSON-RPC `tools/list`) from the admin UI — a real-time subprocess spawn triggered by a UI action. This is a non-trivial architecture decision: subprocess spawn from HTTP request, timeout handling, error display, and security scope (admin-only). Step-02 did not define this. The Architecture phase must specify whether MCP connection test is synchronous (blocking HTTP, risky) or async (job queue + poll), and what the timeout is.

**Issue W2 — Marketing Director agent holding `publish_tistory`, `publish_x`, etc. conflicts with step-02 pipeline design.**
김지은's step 2 (line 264) assigns `publish_tistory`, `publish_x`, `generate_card_news`, `upload_media`, `content_calendar` to the Marketing Director agent. But step-02's pipeline example (line 199–204 of the Vision) shows a publisher *specialist* agent executing publish tools after the Director delegates via `call_agent`. Directors in the tier hierarchy should orchestrate, not publish directly. This creates ambiguity: if the journey shows Director holding publish tools, implementers may configure it this way and miss the handoff architecture. The journey should note "this example uses a single orchestrating agent; production deployment would split tools across specialist agents per the step-02 pipeline."

---

## Amelia (Dev) — "This is untestable."

**Issue A1 — CRITICAL: `read_web_page` URL parameter bug in power use journey.**
Line 366: `read_web_page(url: "https://r.jina.ai/https://samsung.com/ai")` — this is wrong. The tool's internal implementation prepends `r.jina.ai/` to the URL (per step-02 Pillar 4 spec: `fetch('https://r.jina.ai/{url}')`). The agent should call `read_web_page(url: "https://samsung.com/ai")` and the tool handler handles the Jina prefix internally. Passing the full `r.jina.ai/...` URL as the parameter leaks the implementation detail into the agent call, doubles the prefix (`r.jina.ai/r.jina.ai/...`), and would likely return a 404 or unexpected content. This is a concrete implementation error in the journey spec that would cause implementers to build the wrong interface.

**Issue A2 — `save_report(distribute_to: ['pdf_email', 'notion'])` partial failure mode not specified in journey.**
The power use journey (lines 375–383) shows `save_report` distributing to both `pdf_email` and `notion` in a single call. If Notion MCP `create_page` succeeds but `send_email` fails (network error, wrong recipient), what does the agent see? Does `save_report` return partial success? Does it retry? Is the report saved to DB even if all distribution fails? The journey implies atomic success ("Total wall time: ~4 minutes") but `save_report` is a multi-step chain tool. Implementers need to know the failure contract.

---

## Quinn (QA) — "What happens when X is null/empty/concurrent?"

**Issue Q1 — HIGH: Credential acquisition time completely absent from the 19-minute setup journey.**
The setup journey (lines 346–357) shows "Credential Setup: 5 min" for pasting the Tistory OAuth token. But acquiring that token requires: creating a Tistory Developer App, getting client_id/secret, doing the OAuth redirect flow, extracting the access_token. For Instagram Graph API: Facebook Business Manager account + Facebook App creation + Instagram Business Account linking + token generation. These are **15–60 minute external processes per platform**, completely outside CORTHEX. The journey ambiguously implies the entire credential setup including token acquisition takes 5 minutes.

Fix: split into two rows: (1) "Platform Token Acquisition (external, one-time per platform): 15–60 min" and (2) "Paste token into CORTHEX Credentials UI: 5 min." Otherwise, first-time users will feel lied to when step 1 alone takes 30 minutes.

**Issue Q2 — Human role user (이수진) accessing `/admin/reports` is a permission inconsistency.**
Line 317: 이수진's touchpoints include "Reports page (`/admin/reports` read-only)". But 이수진 has `Human` role, not `Admin`. The PRD's RBAC model gives Admin-level access to the `/admin/` prefix. A Human user accessing an `/admin/` route would either be blocked (403) or requires special permission. Either: (a) the reports page should be at `/reports` (non-admin route) for Human users, or (b) the brief should explicitly specify that the reports page has a public read-only mode accessible by Human roles. Neither is stated.

**Issue Q3 — "4-minute wall time" in power use journey is internally inconsistent with step counts.**
Breaking down the power use pipeline (lines 363–387):
- 3× `read_web_page` (Jina Reader, ~7s each) = ~21s
- `web_crawl` (Firecrawl scrape) = ~15s
- `search_web` = ~3s
- LLM analysis generation (2,000+ word competitive matrix, 3 companies) = ~45–90s
- `md_to_pdf` (Puppeteer launch + A4 render) = ~10s
- `send_email` = ~3s
- Notion MCP `create_page` = ~5s
- Total: ~1.7–2.5 minutes — plausible if LLM is fast. "~4 minutes" is actually pessimistic (generous), not optimistic. This is fine — err on the side of honesty. But the 30-second human time investment claim is correct only if the user types fast. Minor.

---

## Bob (SM) — "This scope is unrealistic."

**Issue B1 — HIGH: CEO 김대표 persona is absent — primary PRD user not covered.**
PRD `대상 사용자` section (line 186) lists CEO 김대표 as the primary user: "1인 사업가, 비개발자, 자연어 한 줄 지휘, 음성 브리핑." The brief's 4 personas cover Admin (김지은), Technical Admin (박현우), Marketing Human (이수진), Intelligence Consumer (최민준). CEO is not represented.

As a Tool Integration user, CEO 김대표 is the primary *consumer* of outputs: weekly Notion summary reports, PDF briefings emailed by research agents, published content status. CEO would represent the "I never touch tools, I just see results" perspective — the ultimate validation that the pipeline works end-to-end. Without this persona, the brief doesn't close the loop from setup (박현우) → operation (김지은) → direction (이수진) → consumption (최민준) → CEO-level value.

Also missing: **팀장 박과장** (PRD line 187) who manages 10+ Human employees using AI. His concerns for Tool Integration would be: which agents get X API access (cost $200/month), per-department tool budgets, who can assign `publish_instagram` to an agent. This is a permission and cost governance angle absent from all 4 personas.

**Issue B2 — Secondary personas' journeys are thin compared to primary personas.**
이수진 has 3 touchpoints (Hub + Reports page + content_calendar output). 최민준 has a well-specified power use journey. But 이수진's journey has no Aha moment timing, no concrete task sequence, and no failure scenario. For a secondary user, this is acceptable — but the asymmetry is notable and the Reports page permission issue (Q2) makes her journey partially invalid.

---

## Summary

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| A1 | **CRITICAL** | `read_web_page` URL bug: agent passes `r.jina.ai/...` URL instead of raw URL; would double-prefix and fail | Power Use Journey line 366 |
| B1 | **HIGH** | CEO 김대표 (PRD primary user) absent — no persona for the pipeline's ultimate value consumer | Target Users section |
| Q1 | **HIGH** | Credential acquisition time (15–60 min external) conflated with CORTHEX paste time (5 min) in 19-min journey | Setup Path table |
| Q2 | **HIGH** | Human-role user 이수진 accessing `/admin/reports` — permission inconsistency | Persona 3 touchpoints |
| W1 | **MEDIUM** | MCP "connection test" UI implies async subprocess spawn from admin UI — new architecture requirement not in step-02 | Persona 2 step 3 |
| W2 | **MEDIUM** | Director agent holding `publish_*` tools conflicts with step-02's specialist-agent pipeline design | Persona 1 step 2 |
| A2 | **MEDIUM** | `save_report` partial distribution failure mode unspecified | Power Use Journey lines 375–383 |
| B2 | **LOW** | 이수진's journey is thin (3 touchpoints, no Aha moment, no timing) | Persona 3 |
| Q3 | **LOW** | "~4 min wall time" is plausible but should note LLM generation is the dominant variable | Power Use Journey |

**Preliminary score: 7.5/10**

Rationale: Strong specificity overall — concrete names, specific tool calls, Korean-context Aha moments are excellent. 박현우's journey is the most implementer-useful persona in the document. Score held down by: one concrete implementation bug (A1 — read_web_page URL), a PRD alignment gap (B1 — CEO absent), a journey timing credibility issue (Q1 — token acquisition), and a permission inconsistency (Q2).

---

---

## Cross-Talk Outcomes (with Critic-A)

**Critic-A's key additional findings:**
1. `read_web_page` URL bug — confirmed, same finding as A1
2. CEO 김대표 absent — confirmed, same finding as B1
3. `/admin/reports` RBAC violation — confirmed, same finding as Q2. Upgraded to HIGH.
4. **팀장 박과장 absent (new standalone issue):** I mentioned this at the end of B1 but Critic-A correctly identifies it as a distinct PRD persona needing its own treatment. 팀장 박과장 governs per-department tool access (which agents get `publish_x`, `web_crawl`, what budget they have). This requires product stories that aren't in scope if the persona is absent.
5. MCP Notion setup "4 min" unrealistic for non-developer — Critic-A's specific focus. My Q1 covers this broadly (credential acquisition time), but the Notion integration setup (create integration → copy token → grant page access) deserves explicit mention as a 15-20 min process.

**Agreements:**
- Both critics: A1 (URL bug) CRITICAL, B1 (CEO absent) HIGH, Q2 (RBAC) HIGH
- Score holds at **7.5/10** for both critics

---

## Re-Verification v2 (post [Fixes Applied])

| Issue | Fix Applied? | Notes |
|-------|-------------|-------|
| A1 — read_web_page URL bug | ✅ RESOLVED | Lines 452–453: `read_web_page(url: "https://samsung.com/ai")` + inline comment `[Tool internally prepends r.jina.ai/ — agent passes raw target URL only]`. All 3 occurrences fixed. |
| B1 — CEO 김대표 absent | ✅ RESOLVED | Lines 347–371: Full Persona 5 with 1인 사업가 background, ARGOS-scheduled report delivery, PRD mapping note. Aha moment: wakes to investor-ready PDF already sent. |
| B1-B — 팀장 박과장 absent | ✅ RESOLVED | Lines 374–399: Full Persona 6 with per-dept tool governance, X API cost decision gating, audit log, credential isolation. "Tool Integration stories owned by this persona" section is implementer-useful. |
| Q1 — Credential acquisition time | ✅ RESOLVED | Line 434: "Platform Token Acquisition (external, 15–60 min per platform)" row added. Line 435: "Credential Paste: 5 min" row separate. X API Basic $200/mo mentioned explicitly. MCP setup row (line 439) updated to "4 min if token ready / ~20 min first-time Notion setup." |
| Q2 — 이수진 RBAC violation | ✅ RESOLVED | Line 317: Changed to `/reports` with `(Human-accessible non-admin route)` annotation. |
| W1 — MCP connection test arch | ✅ RESOLVED | Line 439: "Architecture phase must specify: synchronous subprocess spawn vs. async job queue + poll." |
| W2 — Director + publish tools | ✅ RESOLVED | Line 436: Note added distinguishing single-agent simplicity vs. production specialist-agent pattern per step-02. |
| B2 — 이수진 thin journey | ✅ RESOLVED | Line 320: Completion notification added with specific counts. |
| A2 — save_report partial failure | ✅ RESOLVED | Lines 470–472: DB-first contract specified; partial-success response on failure; retry deferred to Architecture phase. |
| PRD Alignment Map | ✅ ADDED | Lines 417–425: All 5 PRD personas mapped to brief personas. Complete coverage. |
| Tertiary Users | ✅ ADDED | Lines 402–413: Board member/investor drives md_to_pdf CSS spec. Correct framing. |

**One new observation (non-blocking):** Persona 6's "approval workflow" for enabling publish_x (lines 390–391) implies a new product feature (notification + approval system for tool activation) not in step-02 scope. This is appropriate for a product brief to surface — just needs to be flagged as new scope during epic planning.

**Final score: 9/10** (up from 7.5/10)

All 9 original issues resolved. PRD persona alignment is now complete. Journey timing is honest. The brief's user section is now more comprehensive than the PRD's own user table. Score held at 9 (not 10): the approval workflow for tool activation (Persona 6) introduces implicit new scope that hasn't been acknowledged explicitly.

---

**Issues for Writer (final priority list):**
1. **CRITICAL/A1:** Fix `read_web_page` URL in Journey 2 — remove `r.jina.ai/` prefix from the parameter (tool handles it internally). Fix all 3 occurrences.
2. **HIGH/B1:** Add CEO 김대표 persona or explicitly map to an existing persona. Show CEO as end-state value consumer (receives reports, doesn't configure anything).
3. **HIGH/Q1:** Split credential setup in journey table: "Platform token acquisition (external): 15–60 min per platform" vs "Paste into CORTHEX UI: 5 min total." Note that Notion MCP setup (create integration + grant access) takes 15–20 min for non-developers.
4. **HIGH/Q2:** Change 이수진's touchpoint from `/admin/reports` to `/reports` or specify a Human-accessible non-admin reports URL.
5. **HIGH/B1-B:** Add 팀장 박과장 as a standalone persona or note: per-department tool governance stories need this perspective.
