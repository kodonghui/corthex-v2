# CRITIC-B Review: Product Brief Step 02 — Executive Summary + Core Vision
> Reviewer: CRITIC-B (Winston / Amelia / Quinn / Bob)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines 1–148
> Cross-checked against: architecture.md (D1–D21, E1–E10), research tool-reports 01/02/03/04/07
> Date: 2026-03-14

---

## Winston (Architect) — "This will break under load."

**Overall:** The brief is architecturally aware and correctly identifies `agent-loop.ts` as the MCP loading point. The `{{credential:key}}` pattern is consistent with existing credential-scrubber Hook (D4). However, three architectural gaps stand out.

**Issue W1 — Agent-loop.ts query() was rewritten to messages.create() in Epic 15 (D13/D17).** The brief references `createSdkMcpServer()` and SDK `query()` for MCP loading (line 92: "Dynamic MCP loading in `agent-loop.ts` via `createSdkMcpServer()`"). This is inconsistent: Epic 15 D17 explicitly states that agent-loop.ts was refactored from `query()` to `messages.create()` precisely because `query()` Path A was incompatible with cache_control. If MCP integration assumes `query()`, this is a Phase-1 breaking conflict that the brief does not address. The brief must state which execution path (messages.create vs query) MCP servers will attach to.

**Issue W2 — Puppeteer/Chromium resource constraint not quantified against D-constraint.** The architecture notes ARM64 Oracle VPS with 4 cores and 24GB RAM, CI/CD on the same server. `md_to_pdf` uses Puppeteer (~200MB Chromium per instance, per Research #1). `generate_card_news` also uses Puppeteer. `crawl_site` (Crawlee) adds another Playwright process. Running 3 concurrent marketing pipelines = potentially 3× Puppeteer + 3× Playwright = 6 headless browser instances × ~200MB = 1.2GB RAM plus CPU spikes. The brief lists the cost table for Replicate/R2/X API but provides **zero resource budget analysis** for headless browser concurrency against the D-constraint of 20 concurrent sessions max.

**Issue W3 — `compose_video` (Remotion rendering) timeout not mapped to session NFR.** NFR specifies `call_agent` E2E ≤ 60 seconds. Remotion 30-second video render takes 2–5 minutes (per Research #3 section 11.4). The brief mentions this in the detailed research but the Vision section presents the full pipeline ("zero human completion steps") as if it runs within normal session bounds. No timeout exception or async job pattern is mentioned.

---

## Amelia (Dev) — "This is untestable."

**Issue A1 — `publish_instagram` is listed as "existing tool refactoring" but brief treats it as solved.** Research #3 line 472 marks `publish_instagram` as a tool to refactor. The brief's Pillar 3 lists it as part of the 18-tool count but does not distinguish implemented vs new. The Proposed Solution (line 63) says "18 new built-in tools" — if `publish_instagram` was already in the 56 existing tools, the actual new count may be 17 or fewer. This number is cited in the Executive Summary and Key Differentiators — if wrong, it undermines the whole count claim.

**Issue A2 — `crawl_site` via CLI-Anything is categorized as a built-in tool but depends on an unvalidated external dependency.** Research #7 section 12.7 explicitly flags: "CLI-Anything는 주로 C/C++/Python 소프트웨어에서 검증됨. Crawlee CLI 생성 품질 사전 테스트 필수" and "CLI-Anything이 Crawlee를 제대로 래핑 못하면 → thin wrapper 수동 작성". The brief presents `crawl_site` as a confirmed Pillar 4 tool (line 87) without surfacing this validation risk. For implementation, this is untestable until CLI-Anything successfully generates the Crawlee CLI — which could fail or require manual fallback. This should be marked as a risk item, not a confirmed deliverable.

**File paths implied by brief:**
- `packages/server/src/lib/tool-handlers/builtins/ocr-document.ts` ✅ (per Research #1)
- `packages/server/src/lib/tool-handlers/builtins/md-to-pdf.ts` ✅
- MCP infra in `engine/agent-loop.ts` — **conflicted by D17 rewrite**

---

## Quinn (QA) — "What happens when X is null/empty/concurrent?"

**Issue Q1 — Secret scrubber coverage for MCP tool outputs not explicitly confirmed.** The brief correctly states `@zapier/secret-scrubber` scrubs MCP output (line 112). But the Hook pipeline (D4) defines: PostToolUse: credential-scrubber → output-redactor → delegation-tracker. MCP tool results are returned through the SDK, not directly through the builtin tool handler pipeline. The brief does not confirm whether the existing credential-scrubber hook intercepts MCP tool call results in the new messages.create() flow. If MCP tools return API keys (e.g., Notion MCP echoing back config), they bypass scrubbing. This is a security gap, not just an edge case.

**Issue Q2 — `{{credential:key}}` template injection: what happens when credential is missing at runtime?** The brief describes runtime injection (line 112) but does not specify the failure mode. If `notion_integration_token` is not registered in the credentials table, does the MCP server launch with a literal `{{credential:notion_integration_token}}` string (which Notion would reject silently), or does agent-loop.ts abort with an AGENT_ error code? The distinction matters for user-facing error transparency (NFR: "블랙박스 에러 0건"). Neither the brief nor the research spec this behavior.

**Issue Q3 — Rate limits for X API Basic ($200/month, 3,000 tweets/month) not surfaced in Vision.** The Executive Summary positions X publishing as part of replacing a $200/month SaaS stack — but X API Basic **itself costs $200/month**. The brief's cost table (line 98) does not include X API Basic plan cost. The $267/month estimate covers Replicate + R2 but omits X API cost, making the total TCO comparison misleading.

---

## Bob (SM) — "This scope is unrealistic."

**Issue B1 — "18 new built-in tools" count is not itemized and may be wrong.** The brief states 18 new tools in the Executive Summary (line 15) and Key Differentiators (line 97). Counting from Pillars 1–4:
- Pillar 1: `ocr_document`, `md_to_pdf`, `pdf_to_md` = 3
- Pillar 2: `save_report`, `list_reports`, `get_report` = 3
- Pillar 3: `publish_tistory`, `publish_x`, `publish_youtube`, `generate_video`, `generate_card_news`, `upload_media`, `content_calendar` = 7 (but `publish_instagram` is listed as refactor in Research #3)
- Pillar 4: `read_web_page`, `web_crawl`, `crawl_site` = 3

That's 16 confirmed new + 1 refactor + MCP infra (not a "tool"). The "18" number is unverified and the brief does not itemize them in a single numbered list. Story authors cannot confirm scope from this.

**Issue B2 — Phase boundaries not defined in the Vision section.** The research reports define Phase 1 / Phase 2 / Phase 3 priority tiers per tool (P0/P1/P2/P3). The brief's Proposed Solution lists all tools in a single flat list with no phasing. A reader cannot tell which tools land in Phase 1 (MVP) vs Phase 2–4. This creates ambiguity at the epic/story breakdown stage and risks scope creep in Sprint 1.

---

## Summary

| # | Severity | Issue | Section |
|---|----------|-------|---------|
| W1 | **CRITICAL** | MCP loading assumes `query()` but agent-loop.ts was rewritten to `messages.create()` in Epic 15 | Proposed Solution |
| Q3 | **HIGH** | X API Basic $200/month omitted from cost comparison — TCO claim is misleading | Key Differentiators |
| A1 | **HIGH** | "18 new tools" count includes refactored `publish_instagram` — number may be 17 or fewer | Executive Summary + Proposed Solution |
| B2 | **HIGH** | No Phase 1 / Phase 2 / Phase 3 boundary defined — all tools listed flat | Proposed Solution |
| W2 | **MEDIUM** | Puppeteer/Chromium concurrency resource impact not analyzed against 4-core ARM64 | Proposed Solution |
| A2 | **MEDIUM** | `crawl_site` via CLI-Anything presented as confirmed but flagged as unvalidated in research | Pillar 4 |
| Q1 | **MEDIUM** | MCP tool output scrubbing coverage in messages.create() flow unconfirmed | Key Differentiators |
| Q2 | **LOW** | Missing credential failure mode specification for `{{credential:key}}` injection | Key Differentiators |
| W3 | **LOW** | Remotion render time (2–5 min) incompatible with 60s E2E NFR — no async job exception noted | Key Differentiators |

**Preliminary score: 6.5/10**

Rationale: The brief is detailed and well-researched. The problem statement, impact analysis, and differentiators are strong and specific. It earns high marks for concrete data ($59/Predis.ai, 85,000★ Firecrawl, etc.). Score is held down by: one critical architectural conflict (W1 — query() vs messages.create()), a misleading TCO claim (X API cost omission), an inaccurate tool count claim, and no phase boundary definition which directly impacts epic planning.

---

---

## Re-Verification v2 (post [Fixes Applied v2])

| Issue | Fix Applied? | Notes |
|-------|-------------|-------|
| W1 — MCP query() conflict | ✅ RESOLVED (upgraded) | Lines 146–167: concrete 6-step Manual MCP Integration Pattern. Correctly identifies messages.create() lacks native mcpServers. Pattern: SPAWN→DISCOVER(tools/list)→MERGE(namespace)→EXECUTE(JSON-RPC tools/call)→RETURN(tool_result)→TEARDOWN. Architecture validation items itemized (stdio/SSE transport, process lifecycle, scrubber hook coverage). No longer a deferral — this is an actionable design. |
| A1 — publish_instagram missing | ✅ VERIFIED (carried from v1) | Line 136: unchanged, full spec intact. |
| Q3 — TCO broken | ✅ VERIFIED (carried from v1) | Lines 201–213: unchanged, honest table intact. |
| B2 — Phase boundaries | ✅ VERIFIED (carried from v1) | Lines 98–105: unchanged. |
| B1 — 18 tools count | ✅ VERIFIED (carried from v1) | Lines 66–88: unchanged. |
| W2 — Puppeteer concurrency | ✅ VERIFIED (carried from v1) | Line 113: unchanged. |
| W3 — Remotion async job | ✅ VERIFIED (carried from v1) | Line 132: unchanged. |
| A2 — crawl_site risk | ✅ VERIFIED (carried from v1) | Line 142: unchanged. |
| Q1/Q2 — Credential scrubbing + failure mode | ✅ RESOLVED (upgraded) | Line 173: `AGENT_MCP_CREDENTIAL_MISSING` error code explicitly named. Line 167: scrubber hook coverage flagged with specific validation question for Architecture phase. |

**One remaining observation (non-blocking):**
The Manual MCP Integration Pattern (6 steps) adds substantial new implementation complexity to `agent-loop.ts` — MCP child process management, JSON-RPC client, tool schema conversion, tool_result routing. The tools-that-depend-on-MCP (`pdf_to_md`, `crawl_site`) are marked "Low (MCP)" / "Medium" in complexity, but the underlying MCP plumbing is itself High complexity. This complexity belongs in the MCP infra epic, not the individual tool stories — but it should be surfaced during epic planning to avoid surprise.

**Final score v2: 9/10** (up from 8.5/10)

Rationale: W1 is now actively resolved with a concrete implementable pattern, not just deferred. `AGENT_MCP_CREDENTIAL_MISSING` error code is specified. All 9 issues addressed. Score held at 9 (not 10) because: (a) the MCP plumbing complexity is understated in individual tool complexity estimates, and (b) Q1 scrubber hook coverage on the MCP path still requires Architecture validation — but both are correctly surfaced, not hidden.

---

## Re-Verification (post [Fixes Applied])

| Issue | Fix Applied? | Notes |
|-------|-------------|-------|
| W1 — MCP query() conflict | ✅ RESOLVED | Lines 146–154: explicit "⚠️ Open Architectural Question (Epic 15/D17)" block. Correctly deferred to Architecture phase. Right call at product brief level. |
| A1 — publish_instagram missing | ✅ RESOLVED | Line 136: full spec in Pillar 3. Line 93: in refactored tools table. Carousel 10-image + Reels + upload_media dependency + 25 calls/hour rate limit. |
| Q3 — TCO broken | ✅ RESOLVED | Lines 182–194: honest 2-column TCO table (without X: $67/mo vs with X Basic: $267/mo). X API $200 explicitly called out. Per-team breakdown at 5 teams. Differentiator correctly reframed as "capability consolidation." |
| B2 — No phase boundaries | ✅ RESOLVED | Lines 98–105: Phase Delivery Boundaries table with Phase 1 MVP / Phase 2 / Phase 3 / Phase 4+ and specific tools per phase. |
| B1 — "18 tools" count | ✅ RESOLVED | Lines 66–88: itemized numbered table, tools 1–18. compose_video + publish_daum_cafe added to reach 18. publish_instagram correctly shown as refactor. Executive Summary updated to "18 new + ~5 refactored." |
| W2 — Puppeteer concurrency | ✅ RESOLVED | Line 113: resource note with ~200MB per instance, concurrency impact, Architecture phase must define limit. |
| W3 — Remotion render timeout | ✅ RESOLVED | Line 132: explicit "Async job pattern required" + job_id + poll/webhook. 60s E2E NFR incompatibility stated. |
| A2 — crawl_site CLI-Anything risk | ✅ RESOLVED | Lines 142: explicit validation risk flag + fallback plan (thin TS wrapper referencing Research #7 §5.1). |
| Q1/Q2 — Credential scrubbing + failure mode | ✅ RESOLVED | Lines 153–154: scrubbing coverage "to be verified in Architecture phase"; missing credential failure mode = AGENT_ error abort (no silent pass-through). |

**Minor observation:** Refactored tools table (lines 91–96) lists 4 tools; Executive Summary says "~5". Discrepancy is within the `~` margin — not blocking.

**Final score: 8.5/10** (up from 6.5/10)

Rationale: All 9 issues addressed. W1 correctly deferred (right answer at brief level). Cost section is now honest and informative. Tool inventory is complete and phase-bounded. Score held below 9 because W1 remains an open architectural question that could still cause implementation friction if Architecture phase misses it.

---

## Cross-Talk Outcomes (with Critic-A)

**Critic-A's key findings:** (1) `publish_instagram` is completely missing from Pillar 3's tool list — appears in pipeline example (line 107) but not in the deliverable spec; (2) MCP `createSdkMcpServer()` assumes `query()` path stale per Epic 15; (3) $267/month compares internal caching savings, not SaaS replacement — looks MORE expensive than the $127–150 SaaS stack.

**Agreement / Upgrades:**

- **A1 upgraded to CRITICAL:** Critic-A's framing is sharper than mine. `publish_instagram` is not just miscounted — it is *absent from the deliverable list* while appearing in the pipeline example. This is an implementer trap, not a counting error.

- **W1 confirmed as spec-level problem (not just docs):** Both critics agree. Research report #04 was written assuming `query()` with `mcpServers` option. `messages.create()` has a different interface — `mcpServers` parameter compatibility is unverified. The brief must either confirm compatibility or redesign MCP loading for `messages.create()`.

- **Cost section broken in two directions (complementary findings):**
  - My Q3: X API Basic ($200/month) omitted from $267/month estimate
  - Critic-A's finding: $267 compares internal cost savings (with/without caching), not vs SaaS stack — making CORTHEX look MORE expensive
  - Combined: the cost comparison claim in Key Differentiators is unreliable on multiple axes.

**Final score: 6.5/10** (unchanged — critical issues confirmed, not resolved)

Issues requiring Writer fixes (priority order):
1. **CRITICAL/W1:** Clarify MCP loading path for `messages.create()` — confirm `mcpServers` param compatibility or redesign
2. **CRITICAL/A1:** Add `publish_instagram` to Pillar 3 tool list explicitly
3. **HIGH/Q3:** Fix cost comparison: add X API Basic ($200/month) to TCO; reframe $267 as infra cost, not SaaS replacement comparison
4. **HIGH/B2:** Define Phase 1 / Phase 2 / Phase 3 boundary for which tools ship when
5. **HIGH/A1 count:** Provide itemized list of exactly 18 tools (or correct the number)
