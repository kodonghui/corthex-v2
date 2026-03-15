# Phase 2 Step 2 Context Snapshot — App Deep Analysis Review

**Date:** 2026-03-15
**Status:** PASS (Score 8.2/10 — threshold 7.0)
**Output:** `_corthex_full_redesign/party-logs/phase2-step2-critic-review.md`

---

## Winning Option Confirmed

**OPTION A — "Command Hub"** (51.1/60, confirmed by all 3 critics)

### Why Option A Wins (Final)
- Hub-first tab (Tab 1) = Sovereign Sage authority. CEO opens app, sees live agents, not aggregate stats.
- Live SSE-connected agent cards show org in motion (vs. Option C's 30s-stale polling).
- All Phase 0-2 terminology correct: Hub / Chat / NEXUS / Jobs / You. No naming corrections needed.
- 5-tab structure covers all P0+P1 features. Max 2 taps to any feature.
- Option B rejected: 2/7 Phase 0-2 principles violated (Principles 1 and 2). Structural misalignment, not cosmetic.
- Option C close second (50.25/60): stronger Swiss discipline and Stitch compatibility, but stat dashboard < live agent cards for Sovereign Sage identity.

---

## Key Specs (Option A — Confirmed)

### Navigation
```
Bottom Tab Bar — 5 tabs:
Hub | Chat | NEXUS | Jobs | You
Tab height: 49px + env(safe-area-inset-bottom)
Active: cyan-400 (#22D3EE)
Inactive: slate-400 (#94A3B8) — corrected from slate-500
Tab bg: rgba(2, 6, 23, 0.92) + backdrop-blur(12px)
```

### Touch Targets
```
All buttons: 44px minimum
Agent cards: 72px height minimum
FAB (NEXUS): 56px diameter
Tab items: full-width / 5 x 49px
Input bar: 44px + safe area
```

### Color Pairs (WCAG Validated)
| Pair | Ratio | Grade |
|------|-------|-------|
| cyan-400 on slate-950 | 9.1:1 | AAA |
| slate-400 on slate-950 | 5.9:1 | AA |
| slate-50 on slate-900 | 19.3:1 | AAA |
| blue-400 on slate-950 | 4.6:1 | AA |
| emerald-400 on slate-950 | 8.9:1 | AAA |
| red-400 on slate-950 | 5.4:1 | AA |

### Typography
```
Page title: Inter 17px Medium
Section header: Inter 12px SemiBold Uppercase
Agent name: Inter 14px Medium
Metadata: JetBrains Mono 11px tabular-nums
Tab label: Inter 10px Medium
```

### Spacing
```
Content margin: 16px horizontal
Card gap: 12px (gap-3)
Section gap: 32px (gap-8)
Card padding: 16px (p-4)
Card radius: 16px (rounded-2xl)
Card bg: slate-900 (#0F172A)
```

### Stitch Boundaries
- 60% Stitch-generatable (card grids, headers, list layouts, input bar shells)
- 40% manual (SSE streaming, React Flow canvas, safe areas, gestures, scroll behavior)

### Performance
```
NEXUS node cap: 50 (hard cap before virtualization)
NEXUS zoom: 0.3 - 2.0
NEXUS bundle: lazy-loaded (~200KB excluded from initial)
Chat streaming: SSE + useRef + rAF batching
```

---

## Corrections Required (from Critic Review)

### Must Fix Before Phase 3 (4 items)

| # | Issue | What to Fix | Where |
|---|-------|-------------|-------|
| 1 | Principle 2 overstatement | Mobile Hub is dashboard, not command terminal. Mark Principle 2 as PARTIAL. Command input is in ChatScreen only. | Phase 3 design principles reference |
| 2 | prefers-reduced-motion missing | Add motion override: `animate-pulse: none`, `transition-duration: 0.01ms` under `prefers-reduced-motion: reduce` | Phase 3 motion tokens |
| 3 | Focus management missing | Define: focus ring (`ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950`), tab order, modal focus trap | Phase 3 a11y tokens |
| 4 | Bundle size budget missing | Define: initial bundle <150KB gzipped, TTI <3s on mid-range Android | Phase 3 perf tokens |

### Should Fix Before Phase 5 (5 items)

| # | Issue | What to Fix |
|---|-------|-------------|
| 5 | SSE lifecycle | Background/foreground reconnect, single multiplexed endpoint |
| 6 | Tab state preservation | Persistent layout (display:none toggle), not unmount/remount |
| 7 | You tab internal IA | Define section grouping for 8+ menu items |
| 8 | Chat bubble contrast | Validate user message bubble bg + text WCAG pair |
| 9 | Principle 7 mobile fix | Inline soul indicator on agent cards (1-tap access) |

---

## Connections to Phase 3

Phase 3 (Design Token Specification) must:

1. **Encode all confirmed specs above as design tokens** — navigation, touch targets, color pairs, typography scale, spacing primitives
2. **Add the 4 must-fix items** — reduced-motion tokens, focus tokens, bundle budget, corrected Principle 2 note
3. **Define token naming convention** — recommend `corthex-{category}-{property}` (e.g., `corthex-nav-tab-height`, `corthex-color-primary`)
4. **Prepare Stitch-compatible token format** — tokens must export to both Tailwind config and CSS custom properties for Stitch Phase 6 handoff
5. **NEXUS-specific tokens** — node sizes, edge styles, cluster border (violet-400/20 rounded-3xl), zoom thresholds
6. **Mobile-specific overrides** — tokens that differ from desktop (card padding 16px vs 24px, 4-col vs 12-col grid, bottom tab bar vs sidebar)

**Input to Phase 3:** This snapshot + `app-analysis.md` (confirmed specs) + Phase 0-2 snapshot (brand foundation)
**Input to Phase 4:** Phase 3 tokens + theme override system (accent palette swaps preserving Swiss structure)
