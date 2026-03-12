# Phase 2-2: App Mobile Options — CRITIC-A Review (Round 1)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/app-analysis.md`
**Round**: 1 — Initial Review

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| S (Blocking) | 2 | Must fix before approval |
| M (Required) | 2 | Must fix before approval |
| L (Minor) | 2 | Fix preferred, non-blocking |

**Overall**: Cannot approve Round 1. 4 required fixes (2 blocking, 2 required) before Round 2.

---

## Writer Checklist — Verification Results

| # | Item | Status |
|---|------|--------|
| 1 | MD3 tab widths (97.5px vs 78px) | ✅ Correct |
| 2 | ARIA specs (role="status", tablist/tab, dialog/aria-modal) | ⚠️ 2 issues (see S1, S2) |
| 3 | NEXUS SVG rationale | ✅ Sound |
| 4 | Zustand store (no .tier, expanded on complete, no timer) | ✅ Correct |
| 5 | `pb-[env(safe-area-inset-bottom)]` @theme claim | ⚠️ Overstated (see L1) |
| 6 | `border-zinc-700` consistency | ✅ No zinc-800 found |
| 7 | `duration-[250ms]` consistency | ⚠️ Inconsistency (see M2) |
| 8 | `motion-reduce` coverage | ✅ All animate-pulse + transitions covered |
| 9 | Scoring logic (A=45, B=42, C=41) | ✅ Arithmetic verified |
| 10 | Option B no auto-collapse timer | ✅ Confirmed — no autoCollapseTimer anywhere |

---

## Issues

### S1 — BLOCKING: Option A notification badge missing `aria-label`

**Location**: `BottomTabBar.tsx` — badge span, lines 284-288

**Current code** (Option A):
```tsx
{tab.badge && (
  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] ...">
    {tab.badge}
  </span>
)}
```
No `aria-label`. The badge renders a raw number (e.g., `3`) with no screen-reader context.

**Option C `BottomTabBar5.tsx`** (line 1270) correctly has:
```tsx
<span
  aria-label={`${tab.badge}개의 알림`}
  className="absolute -top-1 -right-2 ..."
>
```

**Why blocking**: Option A is the RECOMMENDED implementation. Shipping a spec with an accessible badge in Option C but not in the recommended Option A is a direct inconsistency that will become a bug in Phase 6.

**Required fix**: Add `aria-label={`${tab.badge}개의 알림`}` to the Option A badge span, matching Option C.

---

### S2 — BLOCKING: Dual `role="status"` in TrackerStrip creates duplicate live regions

**Location**: `TrackerStrip.tsx`, lines 319 and 331

**Current code**:
```tsx
{/* Screen-reader announcement — separate from visual tracker */}
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">  {/* line 319 */}
  {lastStep && sseStatus === 'streaming' ? `${lastStep.agentName}이(가) 처리 중 (D${lastStep.depth})` : ...}
</div>

<div
  className={cn("bg-zinc-900 border-t border-zinc-700", ...)}
  role="status"          {/* line 331 — SECOND role="status" */}
  aria-atomic="false"
  aria-label="Agent delegation tracker"
  aria-expanded={isExpanded}
>
```

**Why blocking**: Two elements with `role="status"` = two separate ARIA live regions. Screen readers (NVDA, VoiceOver) may announce both when content changes. The visual container div at line 331 should NOT be a live region — it already has `aria-label` and `aria-expanded` for structural description. Only the sr-only div should be the announcement point.

Additionally, `aria-expanded` belongs on an interactive element (button), not on a container `div`. The container is not the toggle — the button inside it is.

**Required fix**:
1. Remove `role="status"` from the visual container div (line 331). Keep `aria-label` and `aria-expanded` if semantically useful, but `aria-expanded` should move to the toggle button.
2. Keep the sr-only announcement div (line 319) as-is — this is the correct live region.

**Corrected visual container**:
```tsx
<div
  className={cn("bg-zinc-900 border-t border-zinc-700", ...)}
  aria-label="Agent delegation tracker"
>
```

---

### M1 — REQUIRED: `h-18` is not a valid Tailwind utility class

**Location**: `SessionRow.tsx` line 384, and IA diagram references at lines 98, 136, 175, 221

**Current code**:
```tsx
isActive ? "h-18 py-3" : "h-16 py-2"  // h-18 = 72px for active, h-16 = 64px standard
```

**Why required**: Tailwind's built-in spacing scale goes `h-16` (64px) → `h-20` (80px). `h-18` does not exist. At build time this class is silently ignored — the active session row will NOT render at 72px; it will collapse to auto height.

**Required fix**: Replace `h-18` with `h-[72px]` (Tailwind v4 arbitrary syntax):
```tsx
isActive ? "h-[72px] py-3" : "h-16 py-2"  // h-[72px] = 72px for active, h-16 = 64px standard
```

IA diagram text at lines 98, 136, 175, 221 (`h-18`) should also be updated to `h-[72px]` for spec accuracy.

---

### M2 — REQUIRED: `duration-[150ms]` in tab transitions contradicts Section 5.3 universal decision

**Location**: `BottomTabBar.tsx` line 278, `BottomTabBar5.tsx` lines 1257 + 1263, `HubMoreMenu.tsx` line 865 + line 1310

**Current**: Tab color transitions use `duration-[150ms]`, drawer list items use `duration-[150ms]`.

**Section 5.3 universal decision** (line 1420):
> "Durations: `duration-[250ms]` (Tailwind v4 arbitrary syntax)."

**Conflict**: The spec declares a single universal duration standard of 250ms but the code blocks use 150ms for tab and list-item transitions. This creates an implementation ambiguity — a developer reading the spec would not know which value to apply.

**Required fix**: Either:
1. Update Section 5.3 to explicitly state that color micro-transitions use `duration-[150ms]` and height/transform layout transitions use `duration-[250ms]` — with rationale (150ms = snappy micro-interaction; 250ms = perceptible layout shift needs visibility). This is the better approach.
2. Or standardize all transitions to `duration-[250ms]` uniformly.

Option 1 is recommended — the distinction is architecturally sound and the document should make it explicit rather than hiding it.

---

### L1 — MINOR: `@theme` claimed as required for `pb-[env(safe-area-inset-bottom)]` — overstated

**Location**: Section 5.3 universal decisions, line 1418

**Current text**:
> `pb-[env(safe-area-inset-bottom)]` — requires `@theme { --spacing-safe: env(safe-area-inset-bottom) }` in `index.css`. NOT `pb-safe`.

**Issue**: In Tailwind v4, arbitrary value syntax `pb-[env(safe-area-inset-bottom)]` works **without** any `@theme` registration. The `@theme` entry creates the named token `--spacing-safe` which enables the shorthand `pb-safe` — but the arbitrary bracket syntax operates independently.

**Evidence**: The code blocks already use `pb-[env(safe-area-inset-bottom)]` directly (e.g., Option C line 1242) and would render correctly in any Tailwind v4 project without touching `index.css`.

**Required fix**: Rephrase to:
> `pb-[env(safe-area-inset-bottom)]` works directly in Tailwind v4 without @theme registration. Add `@theme { --spacing-safe: env(safe-area-inset-bottom) }` to `index.css` only if you want the shorthand token `pb-safe` for DRY reuse. The arbitrary syntax is always available without it.

---

### L2 — MINOR: `aria-controls` absent from tab buttons (acceptable given mobile nav pattern)

**Location**: All `role="tab"` button implementations — `BottomTabBar.tsx`, `BottomTabBar5.tsx`

**ARIA 1.2 Tab pattern**: Each `role="tab"` should include `aria-controls="[panel-id]"` pointing to its `role="tabpanel"`.

**Nuance for mobile route-based navigation**: When tabs control page-level routes (entire screen content), the "panel" is the router outlet — not a DOM sibling element. Wiring `aria-controls` to the active route container requires a stable `id` on the router outlet and React-router-aware panel management. This is a known implementation gap in most mobile tab bar implementations.

**Assessment**: Non-blocking for Phase 2 spec. However, the spec should acknowledge this gap rather than implying full ARIA compliance. Add a note to the `BottomTabBar` component comments:

```tsx
// ARIA Note: aria-controls omitted — tab panels are router-managed screens (not DOM siblings).
// Full ARIA tab pattern requires stable panel IDs on router outlet. Consider for Phase 5 a11y pass.
```

---

## Verified OK — What Works Well

- **MD3 tab widths**: Option A at 390px ÷ 4 = 97.5px > 80dp minimum ✅. Option C 390px ÷ 5 = 78px < 80dp → correctly penalized in scoring ✅
- **Zustand `MobileHubStore`**: `lastError: string | null` present ✅. `onErrorEvent` stores error string ✅. `onCompleteEvent` does NOT collapse tracker ✅. No `autoCollapseTimer` anywhere in store ✅
- **HandoffStepSSE**: No `.tier` field — derived via `useAgentStore.getState().agentTiers[agentId]` ✅
- **NEXUS SVG rationale**: `@xyflow/react` excluded with valid reasoning (WebGL overhead, Capacitor WebView, Stitch incompatibility) ✅. SVG simplified tree with CSS transform pinch-zoom is correct approach ✅
- **`border-zinc-700`**: No `border-zinc-800` found in any code block ✅
- **`motion-reduce` coverage**: All `animate-pulse` instances have `motion-reduce:animate-none` ✅. All transition classes have `motion-reduce:transition-none` ✅
- **`role="dialog" aria-modal="true"`** on DrawerNav ✅. FocusTrap.tsx referenced separately ✅
- **Scoring arithmetic**: A=45/50, B=42/50, C=41/50 — individual criterion sums verified ✅
- **Option B no auto-collapse**: No `autoCollapseTimer` state, no `setTimeout` in `onCompleteEvent` ✅

---

## Round 1 Assessment

**Score**: 7.5/10 (pending fixes)

**Deductions**:
- (-1.0) S1: Option A badge missing `aria-label` — recommended implementation has accessibility gap not present in Option C
- (-0.8) S2: Dual `role="status"` — creates redundant live region; `aria-expanded` on container div incorrect
- (-0.5) M1: `h-18` invalid Tailwind class — silently broken at build time
- (-0.2) M2: Duration inconsistency — 150ms in code vs 250ms in universal spec creates implementation ambiguity

**Pass threshold**: ≥7/10 average. Current: 7.5/10 — above threshold. However, S1 and S2 are ARIA accuracy issues that would survive into the Phase 6 implementation, so they are treated as blockers regardless of score.

**Recommendation**: Round 2 required. Focus: 4 targeted fixes (S1, S2, M1, M2) + L1 clarification. Document is structurally strong — Zustand store design, Stitch rationale, MD3 analysis, and vision alignment are all solid.

**Estimated fix time**: ~20 minutes. No design decisions required — all mechanical corrections.

---

*CRITIC-A — Phase 2-2 App Mobile Analysis — Round 1*
*2026-03-12*
