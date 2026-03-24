# Stage 6 Step 2 — Fixes Applied

**Writer:** bob (SM)
**Date:** 2026-03-24
**File:** `_bmad-output/planning-artifacts/epics-and-stories.md`

## Summary

4 critic reviews received (all PASS). 22 raw issues deduplicated into **15 unique fixes**. All applied.

| Critic | Score | Issues | Unique Fixes |
|--------|-------|--------|-------------|
| winston | 8.60/10 | 5 (3 original + 2 cross-talk) | 4 (1 overlap with john) |
| john | 8.35/10 | 4 | 4 (1 overlap with winston, 1 with quinn) |
| dev | 8.00/10 | 7 (1 withdrawn) | 5 (1 overlap with john) |
| quinn | 8.15/10 | 8 (1 deferred) | 6 (2 overlap with john/winston) |
| **Avg** | **8.28/10** | **24 raw** | **15 unique** |

## Fixes Applied

### Fix 1: NFR count inconsistency (winston #1, john #3)
- **Overview L16**: "76 active NFRs" → **"81 active NFRs"**
- **Section header**: "NFR-P1 to NFR-P17" → **"NFR-P1 to NFR-P18"**
- **Section header**: "NFR-S1 to NFR-S10" → **"NFR-S1 to NFR-S14"**
- **Delta summary**: "15 new" → **"20 new"**

### Fix 2: NFR source tags (winston #3)
- NFR-P18, S11-S14 tagged with `_[Added: Step 1 review — quinn]_` to distinguish from source-extracted NFRs

### Fix 3: UXR56-62 Epic split (john #1, winston #2→#5, quinn I1)
- **UXR Coverage Map**: "UXR56-62 → Epic 29" → **"UXR56, 59, 62 → Epic 29"** + **"UXR57-58, 60-61 → Epic 23"**
- **Epic 23 Key UXRs**: Added UXR57 (WS auto-reconnect), UXR58 (refresh fallback), UXR60 (Chat SSE), UXR61 (disconnect banner)
- **Epic 29 Key UXRs**: "UXR56-62" → **"UXR56, UXR59, UXR62"** (OpenClaw-specific only)

### Fix 4: Epic 23 story estimate (john #2, dev #2, quinn I7)
- **Epic 23**: "12-15 stories" → **"18-22 stories"**
- **Epic Summary Table**: Updated 12-15 → 18-22, total 57-73 → **63-79**
- Added ≥60% measurement criteria: ~40/67 pages with Natural Organic tokens + responsive + a11y
- Added parallel risk fallback: "If <60% at Sprint 2 exit → Sprint 3 includes catch-up. Sprint 4 cannot start with <80%"

### Fix 5: Epic 24 AR28/AR73 coordination (dev #3)
- "coordinate carefully" → **"Single story handles both changes"** (lines 57-82 non-overlapping but same file)
- AR28 (L57-68 soul-enricher) + AR73 (L79-82 response format) in one story to avoid merge conflicts

### Fix 6: renderSoul call site count (dev #4, winston #4)
- AR28: "9 callers (10 call sites)" → **"9 callers (12 call sites)"**
- Missing: hub.ts ×2 (ternary), call-agent.ts ×2 (ternary), agora-engine.ts ×2 (direct + cache fallback)

### Fix 7: AR37 line references (dev #5)
- "L265/L277" → **"MCP error/success tool_result paths"** (descriptive instead of fragile line numbers)

### Fix 8: Epic 23 parallel execution risk (dev #6)
- Added fallback plan: If Layer 0 <60% at Sprint 2 exit → Sprint 3 catch-up. Sprint 4 blocked if <80%

### Fix 9: Epic 28 AR75 testing workstream (dev #7)
- AR75 noted as **"distinct testing workstream"** — separate stories with different acceptance criteria patterns

### Fix 10: Epic 22 NFR-O4/O5 baseline (quinn I2)
- Added NFR-O4 (quality-baseline.md) and NFR-O5 (routing-scenarios.md) to Epic 22 Key NFRs and Implementation Notes
- Both flagged as Pre-Sprint prerequisite tasks that must be created before Sprint 1

### Fix 11: Epic 28 gate concentration strategy (quinn I3)
- Added **early verification strategy**: #7 (cost) and #9 (poisoning) verified mid-sprint
- #4 (zero regression) and #14 (capability eval) at Sprint 3 exit

### Fix 12: Epic 26 Go/No-Go gate (john #4, quinn I4)
- "None specific" → **marketing E2E verification** at Sprint 2 exit
- Added: "n8n E2E: marketing preset execution success + MKT-2 fallback test"

### Fix 13: Epic 27 cross-sprint test span (quinn I5)
- Added note: Sprint 2 implementation + Sprint 3 OWASP expansion scope explicitly documented

### Fix 14: Sprint 2 Overload Risk section (quinn I6)
- NEW section added between Epic 26 and Epic 27
- Documents 14-19 stories across 3 epics with mitigation: E27 independent, E26 sequential after E25

### Fix 15: Sprint 2 overload (dev #1) — RESOLVED
- Dev withdrew after Winston cross-talk confirmed D32 "분할 안 함" decision
- L1940 is stale pre-resolution text. No change needed (already resolved in architecture)

## Deferred

- **quinn I8** (Epic 22 NFR test methods): Deferred to Step 3 story-level acceptance criteria — appropriate granularity for stories, not epics
