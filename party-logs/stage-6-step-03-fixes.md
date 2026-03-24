# Stage 6 Step 3 — Fixes Applied

**Writer:** bob (SM)
**Date:** 2026-03-24
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md`

## Summary

4 critic reviews received (all PASS). 34 raw issues deduplicated into **22 unique fixes**. All applied. Story count: 68 → **69** (23.19 split).

| Critic | Score | Issues | Unique Fixes |
|--------|-------|--------|-------------|
| winston | 8.60/10 | 5 | 5 (all unique) |
| john | 8.45/10 | 4 | 3 (1 overlap with winston) |
| dev | 7.80/10 | 8 | 6 (2 overlap) |
| quinn | 7.55/10 | 13 (2 CRITICAL) | 11 (2 overlap) |
| **Avg** | **8.10/10** | **30 raw** | **22 unique** |

## Fixes Applied

### CRITICAL Fixes (quinn)

#### Fix 1: MEM-6 Layer 3 "prompt hardening" undefined (quinn I1)
- Story 28.2 Layer 3: added specific technique — "keyword blocklist + regex pattern matching (minimum 10 patterns: system prompt override, role confusion, instruction injection, delimiter abuse, context manipulation, encoding attacks, nested injection, markdown abuse, XML/JSON injection, Unicode tricks)"
- Layer 4: specified "keyword blocklist + regex pattern matching (same approach as TOOLSANITIZE — not ML, to keep complexity low)"

#### Fix 2: TOOLSANITIZE extensibility mechanism undefined (quinn I2)
- Story 27.1: "extensible framework: patterns can be added without code changes" → **"patterns stored in `config/tool-sanitizer-patterns.json`, loaded at startup, Admin can add/edit patterns via Admin API without server restart"**

### HIGH Fixes (quinn)

#### Fix 3: NFR-O6 missing from Story 24.8 (quinn I3)
- Added to 24.8 AC: "Soul reflection rate: 3 rule scenarios (prohibition compliance, tool restriction, scope boundary) × 10 requests = 30 tests, 24/30+ pass (NFR-O6)"

#### Fix 4: Sprite asset pipeline gap 29.4→29.8 (quinn I4)
- Added to 29.4 AC: "placeholder sprites (colored rectangles per department color) used for development. Final AI-generated sprites integrated in Story 29.8"

#### Fix 5: Capability evaluation categories undefined (quinn I5)
- Story 28.10: "5 categories" → **(information retrieval, creative writing, code analysis, multi-step reasoning, tool usage)**
- "3+ iterations" → **(each iteration = full corpus run of all 10 tasks)**

#### Fix 6: Marketing gate criteria vague (quinn I6)
- Story 26.5: "full pipeline success" defined as "topic input → AI content generation → human approval → at least 1 platform posting completed without error"
- Fallback test: "primary engine deliberately disabled → secondary engine completes generation"

#### Fix 7: NFR-COST1/COST2 no verification story (quinn I7)
- Story 22.6 AC added: "infrastructure cost estimate documented: VPS + Neon Pro + Voyage AI projected ≤$10/month (NFR-COST1), Voyage embedding budget ≤$5/month (NFR-COST2)"

### MEDIUM Fixes (quinn)

#### Fix 8: Advisory lock failure path (quinn I8)
- Story 28.4: added "lock acquisition failure → skip this cycle, log warning, retry next scheduled run"

#### Fix 9: Connection drop protocol (quinn I9)
- Story 29.2: "oldest dropped + client reconnect notice" → **"excess connections closed with code 4001 (capacity exceeded), client implements exponential backoff: 1s→2s→4s→max 30s"**

#### Fix 10: MEM-6 Layer 4 classification (quinn I10)
- Addressed together with Fix 1 — Layer 4 now specified as "keyword blocklist + regex pattern matching (same as TOOLSANITIZE, not ML)"

#### Fix 11: NFR-O10 not in story AC (quinn I11)
- Story 28.4 references updated to include NFR-O10

### LOW Fixes (quinn)

#### Fix 12: Confidence decay timing (quinn I12)
- Story 28.3: "0.1/week" → **"calculated at read time (not cron): `effective_confidence = stored_confidence - (weeks_since_last_update * 0.1), floor 0.1`"**

### MODERATE Fixes (winston/john/dev shared)

#### Fix 13: Story 22.4 false premise (winston #1, dev #1)
- "Given the Hono server currently has no security headers" → **"Given the Hono server has existing security headers (secureHeaders, loginRateLimit, CORS) that need hardening for v3 SaaS requirements"**
- Framed as hardening, not greenfield

#### Fix 14: Story 23.19 split (winston #5, john #1, dev #2)
- Split into 23.19 (Documents + ARGOS + Activity) and 23.20 (Organization with NexusCanvas dependency)
- Old 23.20 → renumbered to 23.21
- Epic 23: 20 → **21 stories**. Total: 68 → **69 stories**
- Epic Summary Table updated

### MINOR Fixes

#### Fix 15: Story 24.7 "single story" wording (winston #2)
- "single story, AR73+AR28 coordination" → **"coordinates with Story 24.2 which handles call-agent.ts soul-enricher migration"**

#### Fix 16: Story 28.4 confidence trigger (winston #3)
- "confidence ≥0.7" → **"per-observation: individual observations with confidence ≥0.7 count toward the 20 threshold"**

#### Fix 17: Epic 23 story count delta (winston #4)
- Added explanation in Stories intro: "Epic 23 expanded from 12-15 to 20 stories per Step 2 critic feedback — 120+ UXRs + page consolidation + 3 custom components"

#### Fix 18: Sprint 2 internal sequencing (john #2)
- Added to Sprint 2 Overload section: "Sprint 2a (E25+E27 parallel) → Story 25.6 Go/No-Go #3 gates E26 start → Sprint 2b (E26 sequential)"

#### Fix 19: Story 23.17 bundling (john #3)
- AC now has sub-section labels: _Search:_, _Performance:_, _Migration:_ for clarity

#### Fix 20: Epic 23 internal dependencies (john #4)
- Added dependency map at Epic 23 header: "Foundation (23.1→23.2→23.3) → parallel tracks: Pages, Components, Patterns, Infrastructure → 23.21 last"

#### Fix 21: Story 25.5 file enumeration (dev #3)
- AC now lists specific files: `routes/workspace/workflows.ts`, `services/workflow/`, `lib/workflow/`
- Explicit: "migration files (0037, 0056, 0059) are NOT deleted — schema history must be preserved"

#### Fix 22: "485 API endpoints" stale count (dev #4)
- Stories 29.8 and 29.9: "485 API endpoints" → **"all existing API endpoints"**

#### Fix 23: Story 29.3 states clarification (dev #5, winston supplement #6)
- "5 states + degraded" → **"6 states: idle, working, speaking, tool_calling, error, degraded (NRT-1 base + NRT-2 heartbeat timeout: 15s→degraded, 30s→error). 4-color mapping: idle→blue, active→green, error→red, degraded→orange"**
- *(Corrected post-fixes: winston architecture ruling — degraded IS a 6th state, not a modifier)*

#### Fix 24: Story 24.7 AR74 separation (dev #6)
- AR73 and AR74 AC now clearly separated within story with label "_AR74 (cost-aware model routing) handled separately:_"

#### Fix 25: Haiku model version (dev #7)
- "Haiku API" → **"`claude-haiku-4-5-20251001`"** in Stories 28.4 and 24.7

#### Fix 26: "67 pages" clarification (dev #8)
- Story 23.21: clarified "67 pages = UX Design specification route count (pre-consolidation); post-consolidation ~59 routes. Measurement: routes with zero hardcoded violations / total routes"

## Not Fixed (accepted as-is)

- **quinn I13**: Epic 23 concentration (20/69 = 29%) — noted as observation, no actionable fix needed
