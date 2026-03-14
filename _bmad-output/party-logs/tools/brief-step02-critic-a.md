# CRITIC-A Review: Product Brief Step 02 — Executive Summary + Core Vision
> Reviewer: Critic-A (John/Sally/Mary)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines 1–148
> Date: 2026-03-14

---

## Score: 6.5/10

---

## John (PM) — "WHY should the user care? Where's the evidence?"

**Positive:** The Problem Statement (lines 23–31) is genuinely strong — the 3 capability gaps (document generation, content publishing, web data acquisition) are named with specific tool names rather than vague categories. The workflow pipeline example (lines 103–108) is exactly the kind of concrete evidence that helps stakeholders understand the value proposition in one read.

**Issue 1 (HIGH — Missing Tool): `publish_instagram` is absent from Pillar 3's tool list.**
The marketing SaaS replacement story leads with Predis.ai ($59/month) — which is specifically an Instagram content + auto-posting tool. The pipeline example on line 107 calls `publish_instagram (carousel)`, but Pillar 3's defined tool inventory (lines 76–83) lists `publish_tistory`, `publish_x`, `publish_youtube`, `generate_video`, `generate_card_news`, `upload_media`, `content_calendar` — NO `publish_instagram`. An implementer reading only the tool spec would miss the most-cited replacement target entirely. This is a direct contradiction between the Problem Impact section and the Proposed Solution.

**Issue 2 (MEDIUM — Misleading Cost Comparison): Line 98 cost math creates false impression.**
"Estimated tool infrastructure cost: $267/month for 10 agents (vs. $387/month without caching)" — this compares CORTHEX's OWN infrastructure costs with and without caching. But the surrounding context frames it as a replacement for the "$100–200/month SaaS stack." The research doc (10-team-recommendations.md) shows the SaaS "all-in-one" stack is ~$127–150/month. CORTHEX infrastructure at $267/month appears MORE expensive than what it's supposed to replace. The ROI argument requires explicit clarification: is the $267/month covering 10 teams (i.e., $26.70/team) or one team? Without this breakdown, the business case reverses.

---

## Sally (UX) — "A real user would never do it this way."

**Positive:** The credential security model (`{{credential:key}}`) in Differentiator #3 (lines 111–112) is exactly what an enterprise admin would want to see spelled out — no admin will approve a system where API keys are hardcoded or visible in logs.

**Issue 3 (MEDIUM — Phase 2 Roadmap Disguised as Current Differentiator): Differentiator #5 (lines 117–119) says "Phase 2 adds Activepieces (280+ services) and Pipedream (2,500 APIs)" as a Key Differentiator.** A real admin reading this brief today would think they're getting Activepieces + Pipedream. But these are Phase 2 features — not part of this integration. The differentiator should be labeled clearly as "Roadmap" or split into a separate Future State section. As written, it creates a scope commitment the current brief cannot fulfill.

**Issue 4 (LOW — `crawl_site` / CLI-Anything is undefined for implementers):** Line 87 says "`crawl_site` — Crawlee via CLI-Anything (deep crawl, CSS selector extraction, change monitoring)." Unlike every other tool in the Proposed Solution (which has package names, API names, or GitHub stars), `crawl_site` has zero technical anchors. No npm package, no GitHub URL, no CLI command signature. Research doc #7 covers Crawlee extensively but CLI-Anything itself is not explained — implementers need to know if this means "Crawlee exposed as an MCP server via CLI-Anything" or "a custom CLI wrapper." A sentence like "Crawlee (npm: crawlee) exposed as MCP stdio server via CLI-Anything MCP bridge" would fix this.

---

## Mary (BA) — "The business case doesn't hold."

**Positive:** The three Problem Impact categories (wasted capability / fragmented spending / lost compounding value) map cleanly to three distinct buyer pain points: operations manager (30–60min daily waste), finance (SaaS consolidation), and C-suite (ROI on multi-agent org). This is well-structured for a multi-stakeholder pitch.

**Issue 5 (HIGH — MCP Architecture May Be Stale Post-Epic 15): Lines 92–93 and line 34 describe the MCP integration using `createSdkMcpServer()` and implicitly assume `query()` is the engine call.**
Research doc #4 (line 50) confirms this was the original design: `query({ ..., mcpServers })`. However, MEMORY.md records that Epic 15 (3-Layer Caching) fully rewrote `agent-loop.ts` from `query()` to `messages.create()` (Decision D17). If `query()` no longer exists in the live engine, the MCP server integration approach described in this brief is based on a removed code path. Implementers hitting this mismatch will waste significant time. The brief must either confirm `createSdkMcpServer()` still works with `messages.create()` or specify a revised integration pattern.

---

## Cross-Reference Findings

| Source | Brief Claim | Research Doc Says | Status |
|--------|------------|-------------------|--------|
| Line 25 | "56 existing tools" | Not contradicted | Unverified (needs codebase check) |
| Line 44 | Firecrawl $99/month = 100,000 pages | Report #7 confirms Growth plan | ✅ Accurate |
| Line 87 | `crawl_site` via CLI-Anything | Report #7 covers Crawlee but not CLI-Anything bridge | ⚠️ Incomplete |
| Lines 76–83 | Pillar 3 tool list | Report #3 lists Instagram as primary target platform | ❌ `publish_instagram` MISSING |
| Line 98 | $267/month infra cost | 10-team-recommendations shows SaaS stack $127–150/month | ⚠️ Comparison context unclear |
| Lines 92–93 | MCP via `createSdkMcpServer()` | Report #4 uses `query()` + mcpServers; Epic 15 removed `query()` | ❌ Architecture may be stale |

---

## Priority Issues for Writer

1. **[CRITICAL]** Add `publish_instagram` to Pillar 3 tool list with spec (Instagram Graph API, carousel support, business account requirement)
2. **[HIGH]** Fix cost comparison: clarify $267/month is per-N-teams not per-team, or show per-team cost vs. SaaS stack per-team cost
3. **[HIGH]** Validate MCP integration approach against current `messages.create()`-based engine — confirm or update `createSdkMcpServer()` compatibility
4. **[MEDIUM]** Move Phase 2 Activepieces/Pipedream out of Key Differentiators → label as "Phase 2 Roadmap"
5. **[LOW]** Specify `crawl_site` technical anchor: npm package + CLI-Anything bridge explanation

---

---

## Cross-Talk Update (with Critic-B)

**W1 — MCP/query() conflict [UPGRADED TO CRITICAL — spec-level, not docs]:**
Critic-B confirmed independently: Epic 15 / D17 explicitly documented `query()` Path A as incompatible with `cache_control`, causing a full rewrite to `messages.create()`. Critic-B adds a critical technical detail: research doc #04 was written assuming `query({ mcpServers })` — but `messages.create()` may NOT have a native `mcpServers` parameter at all. If that's the case, the entire MCP dynamic loading mechanism requires a new design pattern for the `messages.create()` engine path, not just a documentation update. The brief must either (a) confirm `messages.create()` supports `mcpServers` identically, or (b) provide a redesigned MCP loading pattern. This is a spec-level obligation, not a wording fix. Both critics agree this is the single most dangerous technical issue in the brief.

**Q3 — X API Basic $200/month [NEW ISSUE ADDED]:**
Critic-B identified a specific cost omission that validates and sharpens my Issue 2: X API Basic tier required for `publish_x` costs **$200/month alone** — which already exceeds the entire "$100–200/month fragmented SaaS stack" the brief claims to replace. Combined with Firecrawl Growth ($99/month), Replicate AI video generation (~$30–50/month variable), and Cloudflare R2, the actual CORTHEX tool infrastructure cost could reach $350–450/month per team — making CORTHEX 2–3x MORE expensive than status quo, not cheaper. The "unified platform replaces $100–200/month SaaS" differentiator requires an honest TCO table or it actively misleads customers.

**Confirmed Critical Issues (both critics agree):**
1. `publish_instagram` missing from Pillar 3 tool spec
2. MCP `createSdkMcpServer()` + `messages.create()` architecture conflict
3. X API $200/month omitted from TCO — cost comparison is inverted

---

*Review finalized: 2026-03-14 | Post-cross-talk version*
