# Phase 1 Step 2 Context Snapshot — App Layout Research Review

**Date:** 2026-03-15
**Status:** PASS (Score 7.5/10 — threshold 7.0)
**Output:** `_corthex_full_redesign/party-logs/phase1-step2-critic-review.md`

---

## Winning Option

**OPTION A — "Command Hub"** (recommended, 9.2/10 by researcher, confirmed by Critic-A)

### Why Option A Wins
- Directly embodies Phase 0-2 Design Principle 2: "Command, Don't Chat" — Hub is 80% of user time
- 5-tab structure (Hub / Chat / NEXUS / Jobs / You) covers all P0+P1 features without overflow
- Linear mobile (9/10 precedent) proves dark+dense+tab-first works for power users
- Swiss grid discipline maintained in card layouts
- Sovereign Sage archetype = command center metaphor, not conversational metaphor

### Why Options B and C Were Rejected
- **Option B "Conversational Core"**: Explicitly contradicts Phase 0-2 Principle 2 by making Chat primary. NEXUS becomes buried. Jobs/ARGOS visibility too low.
- **Option C "Swiss Command"**: Architecturally sound but "Squad" naming is confusing, numbered list feels bureaucratic on mobile. Option A achieves same Swiss discipline with cleaner naming.

---

## Key Specs Confirmed (Option A)

### Navigation
```
Bottom Tab Bar — 5 tabs:
Hub | Chat | NEXUS | Jobs | You
```
- Tab height: 49px + `env(safe-area-inset-bottom)`
- Tab item width: 75pt (5 tabs, 375pt screen)
- Active indicator: primary accent color fill

### Touch Targets (mandatory minimums)
- Tab items: 75pt × 49pt ✓
- Agent cards: 72pt height minimum ✓
- FAB (NEXUS add node): 56pt diameter ✓
- All buttons: 44×44pt minimum ✓
- Input bar: 44pt height + safe area ✓

### Safe Area CSS (confirmed correct)
```css
.bottom-nav {
  height: calc(49px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}
.main-content {
  padding-top: calc(44px + env(safe-area-inset-top));
  padding-bottom: calc(49px + env(safe-area-inset-bottom));
}
```

### Stitch Generation Boundaries
| Screen | Stitch Handles | Manual Code Required |
|--------|---------------|---------------------|
| Hub | Card grid, activity feed, header chrome | Real-time badge updates |
| Chat | Message bubble variants, input bar shell | SSE streaming, scroll behavior |
| NEXUS | Canvas chrome, header, FAB | React Flow entirely |
| Jobs | List rows, progress bars | Filter/sort logic |
| You | Settings rows, profile header | Auth/session logic |

---

## Critical Corrections Required Before Phase 2

These 3 issues must be fixed in `app-layout-research.md` before Phase 2 scoring proceeds:

### Correction 1: Primary Color (CRITICAL)
- **Wrong:** `indigo-600` primary, `indigo-400` active icon
- **Correct:** `cyan-400` (#22D3EE) primary/active everywhere
- **Exception:** Login screen only — indigo-600 CTA (Phase 0-2 explicit exception)
- **Affects:** Lines 23, 648 of research doc + all Option A/C ASCII wireframe color references

### Correction 2: Typography (CRITICAL)
- **Wrong:** Geist (display) + Pretendard (body) + JetBrains Mono
- **Correct:** Inter (all UI text) + JetBrains Mono (technical only)
- **Rationale:** Vignelli 2-typeface constraint; Inter handles Korean/Latin at mobile sizes
- **Affects:** Line 24, Tab Bar Token Spec (line 651)

### Correction 3: Page Background (CRITICAL)
- **Wrong:** zinc-950 (`#09090b`) — warm cast
- **Correct:** slate-950 (`#020617`) — cool/blue, consistent with NEXUS deep navy
- **Affects:** Line 22, Tab Bar Token Spec `zinc-950` background reference (line 648)

---

## Additional Specs to Add Before Phase 5

### WCAG Contrast — Must Validate
- `slate-500` on `slate-950` for inactive tab labels — likely fails AA
- `cyan-400` on `slate-950` for active state — validate 4.5:1
- `slate-100` on `slate-900` for card text — validate

### Performance Specs Needed
- **NEXUS on mobile**: Define node count budget (recommended: <50 nodes full render, >50 virtualize)
- **React Flow version**: Specify `@xyflow/react` v12 (touch-optimized)
- **NEXUS tab**: Lazy-load (code-split) — React Flow ~200KB should not be in initial bundle
- **Streaming chat**: Use SSE + `useRef` + rAF batching pattern (not naive `useState`)

### backdrop-blur Fallback
```css
@supports not (backdrop-filter: blur(12px)) {
  .bottom-nav { background: #020617; }
}
```

---

## Phase 0-2 Design Principles — Option A Compliance

| Principle | Option A Compliance |
|-----------|-------------------|
| 1. Show the Org, Not the AI | ✓ NEXUS dedicated tab, dept scoping on Hub |
| 2. Command, Don't Chat | ✓ Hub is tab 1, Chat is tab 2 |
| 3. State Is Sacred | ✓ Agent status visible on Hub cards |
| 4. Density Without Clutter | ✓ Card grid with clear section headers |
| 5. One Primary Action Per Screen | ✓ FAB on NEXUS, compose on Chat |
| 6. The Grid Is the Law | ✓ Card grid discipline in Hub |
| 7. Soul Is Never Hidden | Deferred to Phase 3 token work |

---

## Connections to Phase 2

Phase 2 (Analysis) must:
1. Score all 3 options against 7 Design Principles + Rams' 10 principles using **corrected** color/font specs
2. Validate WCAG contrast for proposed color pairs before token finalization
3. Define NEXUS mobile performance budget as a P0 design constraint
4. Define streaming chat render pattern as a P0 technical constraint
5. Confirm Option A winner with corrected specs applied

**Input to Phase 2:** This snapshot + corrected `app-layout-research.md` (post-fixes)

**Token Spec preparation (Phase 3):** All Phase 0-2 colors (cyan-400, slate-950, slate-900) confirmed. Typography: Inter + JetBrains Mono confirmed. Tab bar spec template ready pending WCAG validation.
