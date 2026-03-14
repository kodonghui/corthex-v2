# Fix Summary: Product Brief Step 02 — Post-Critic Review
> Applied: 2026-03-14 | Writer: BMAD Writer

---

## Issues Fixed: 9 total (3 Critical + 4 High + 2 Medium/Low)

---

### CRITICAL FIX 1: `publish_instagram` added to Pillar 3

**Critics:** Both (Critic-A Issue 1, Critic-B A1)
**Original problem:** `publish_instagram` appeared in the pipeline example (line 107) but was completely absent from Pillar 3's tool list — implementer trap.
**Fix applied:**
- Added `publish_instagram` to Pillar 3 bullet list as **refactored existing tool** (correctly classified, not counted as one of 18 new tools per research doc #06 section 2.2)
- Specified: Instagram Graph API, carousel (up to 10 images), Reels support, `upload_media` dependency for public URLs, business account requirement, 25 API calls/hour rate limit
- Also added a dedicated "Refactored Existing Tools" table (~5 items) to distinguish new vs. refactored

---

### CRITICAL FIX 2: MCP architecture — redesigned for `messages.create()` path (v2, expanded after critic addendum)

**Critics:** Both (Critic-A/Mary Issue 5 → CRITICAL + addendum, Critic-B W1)
**Original problem:** Brief stated "Dynamic MCP loading via `createSdkMcpServer()`" assuming `query()` path. Epic 15 (D17) rewrote agent-loop.ts to `messages.create()`. `messages.create()` has no native `mcpServers` parameter — entire MCP loading mechanism needs a new design.
**Fix applied (v2 — concrete redesign, not just flag):**
- Removed all references to `createSdkMcpServer()` as an active solution
- Added "Manual MCP integration pattern for `messages.create()`" with explicit 6-step sequence:
  1. SPAWN: child_process.spawn(command, args, env) with credential template resolved pre-spawn
  2. DISCOVER: JSON-RPC `tools/list` → receive MCP tools schema from server
  3. MERGE: convert to Anthropic tool format + namespace ("notion__create_page") → inject into `tools[]`
  4. EXECUTE: route tool_use blocks for MCP-namespaced tools to MCP client JSON-RPC `tools/call`
  5. RETURN: MCP response → tool_result block for next messages.create() call
  6. TEARDOWN: terminate child processes at session end
- Architecture phase validation items specified: stdio vs SSE transport, process lifecycle, credential-scrubber hook coverage for MCP results
- Credential missing failure mode: typed `AGENT_MCP_CREDENTIAL_MISSING` error (no silent passthrough)

---

### CRITICAL FIX 3: X API $200/month — honest TCO table

**Critics:** Both (Critic-A cross-talk Q3, Critic-B Q3)
**Original problem:** $267/month figure was misread as "cheaper than SaaS" when: (1) it already included X API Basic ($200), making X the dominant cost driver; (2) $267 vs $387 compared internal caching savings, not SaaS stack replacement; (3) no per-team breakdown.
**Fix applied:**
- Added a two-column honest TCO table: "Without X Publishing ($67/mo)" vs "With X API Basic ($267/mo)"
- Shows per-team cost if 5 teams share infrastructure ($13.40/team vs $53.40/team)
- Reframed Key Differentiator #1 as **capability consolidation** not cost savings
- Added SaaS replacement table mapping each SaaS tool to its CORTHEX equivalent
- Added explicit guidance: teams not using Twitter should disable `publish_x` and pay $67/month

---

### HIGH FIX 4: "18 new tools" verified with itemized numbered list

**Critics:** Critic-B (B1)
**Original problem:** "18 new built-in tools" stated in Executive Summary but not itemized — count was 16 in pillar lists because `compose_video` and `publish_daum_cafe` were missing.
**Fix applied:**
- Added full numbered table: 18 tools × columns: #, Tool, Pillar, Priority, Complexity
- Added `compose_video` (P2, High) and `publish_daum_cafe` (P3, High) which were missing from original Pillar 3
- `publish_instagram` correctly classified as refactor, not counted in the 18

---

### HIGH FIX 5: Phase delivery boundaries defined

**Critics:** Critic-B (B2)
**Original problem:** All tools listed in flat Pillar list with no Phase 1/Phase 2/Phase 3 distinction.
**Fix applied:**
- Added "Phase Delivery Boundaries" table in Proposed Solution with 4 phases: Phase 1 (P0 MVP), Phase 2 (P1), Phase 3 (P2), Phase 4+ (P3)
- Each phase includes specific tool names + milestone description
- Implementers can now derive Sprint 1 scope from Phase 1 row

---

### HIGH FIX 6: Missing tools added to Pillar 3

**Follow-up from tool count fix:** `compose_video` and `publish_daum_cafe` added to Pillar 3 with:
- `compose_video`: Remotion + CLI-Anything bridge + **async job pattern required** (Remotion 30s render = 2–5min, incompatible with 60s E2E NFR; fix specifies job_id + poll/webhook pattern)
- `publish_daum_cafe`: Playwright MCP automation, P3, flagged as unstable

---

### MEDIUM FIX 7: Phase 2 Activepieces/Pipedream moved to Roadmap

**Critics:** Critic-A (Issue 3/Sally)
**Original problem:** Key Differentiator #5 presented Phase 2 Activepieces + Pipedream as current capability.
**Fix applied:**
- Key Differentiator #5 rewritten to describe current Phase 1 MCP marketplace foundation
- Activepieces + Pipedream moved to `> Phase 2 Roadmap (not current scope)` callout block

---

### MEDIUM FIX 8: `crawl_site` technical anchor + risk flag

**Critics:** Critic-A (Issue 4/Sally), Critic-B (A2)
**Original problem:** `crawl_site` had no npm package, no CLI-Anything explanation, no risk disclosure.
**Fix applied:**
- Added: "Crawlee (`npm: crawlee`, 16,000+ ★, Apache 2.0) via CLI-Anything MCP bridge (`HKUDS/CLI-Anything`, 13,242 ★)"
- Added explicit risk: "CLI-Anything validated mainly for C/C++/Python, not TypeScript/Node.js. Crawlee CLI generation quality must be validated. Fallback: manual thin TypeScript wrapper."
- P2 priority flagged

---

### LOW FIX 9: Puppeteer concurrency + async job patterns noted

**Critics:** Critic-B (W2, W3)
**Fix applied:**
- Added resource note in Pillar 1: "Concurrent marketing pipelines may spawn multiple headless browser instances (~200MB Chromium each). Architecture phase must define concurrency limit against 24GB ARM64 / 20-session E-constraint."
- `compose_video` bullet explicitly states async job pattern required for Remotion (60s NFR incompatible with 2–5min render)

---

## Issues NOT Fixed (deferred to Architecture phase)

| Issue | Reason |
|-------|---------|
| W1 MCP/messages.create() exact integration pattern | Flagged as open question for Architecture phase — cannot be resolved in Product Brief without implementation verification |
| Q1 Secret scrubber MCP coverage in messages.create() flow | Flagged as "to be verified in Architecture phase" in MCP section |
| Q2 Credential missing failure mode (exact behavior) | Added specification direction (abort with AGENT_ error) in MCP section |

---

*Fix count: 9 applied / 3 deferred to Architecture phase*
