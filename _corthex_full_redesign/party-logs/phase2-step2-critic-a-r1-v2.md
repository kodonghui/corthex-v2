# Phase 2-2: App Mobile Options — CRITIC-A Review (Round 1, Updated Document)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/app-analysis.md` (expanded version)
**Round**: 1 (fresh review of expanded document — supersedes previous review request)

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| S (Blocking) | 3 | Must fix before approval |
| M (Required) | 5 | Must fix before approval |
| L (Minor) | 2 | Fix preferred, non-blocking |

**One fix carried forward as resolved**: S1 (Option A badge `aria-label`) ✅ — correctly fixed with `aria-label="알림 ${tab.badge}개"`.

**Cannot approve Round 1. 8 required fixes before Round 2.**

---

## Writer Checklist — Verification Results

| # | Item | Status |
|---|------|--------|
| 1 | Option A MD3 tab width 97.5px > 80dp ✅, Option C 78px violation ✅ | ✅ Correct |
| 2 | Option C 78px < 80dp correctly identified as violation | ✅ Correct |
| 3 | Option B DrawerSection h-10 < 44pt noted | ⚠️ Documented but no fix shown (see M5) |
| 4 | TrackerStrip invariants (WCAG 2.2.2, no auto-collapse, sr-only) | ⚠️ S1 — partially wrong |
| 5 | `border-zinc-700` on `bg-zinc-900` consistently applied | ✅ No zinc-800 found |
| 6 | `duration-[250ms]` syntax — consistent | ✅ Section 5.5 correctly frames as syntax standard, not mandatory value |
| 7 | `pb-[env(safe-area-inset-bottom)]` with @theme requirement | ❌ M2 — 6 locations say "requires" or "MUST be" — incorrect |
| 8 | NEXUS mobile: SVG, NOT @xyflow/react — correct justification | ✅ Correct |
| 9 | Scores A=45, B=41, C=40 — logic verified | ✅ Arithmetic correct |
| 10 | Task flow tap counts accurate | ✅ Reasonable and internally consistent |

**@theme verification — 6 locations (all wrong)**:
- Line 29 (spec table): "requires `@theme`"
- Line 385 (ChatScreen comment): "requires @theme"
- Line 542 (BottomTabBar comment): "requires: @theme ... in index.css"
- Line 1100 (InputBar comment): "requires @theme in index.css"
- Line 1406 (BottomTabBar5 comment): "requires @theme in index.css"
- Line 1613 (Section 5.5 universal decisions): "@theme MUST be in index.css"

Line 1613 now uses "MUST be" — stronger and more incorrect than previous "requires."

---

## Issues

### S1 — BLOCKING: TrackerStrip THREE `role="status"` — regression from previous fix attempt

**Location**: `TrackerStrip.tsx`, lines 606–625

**Current code** (3 live regions):
```tsx
{/* Region 1: SSE announcements */}
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">  {/* line 606 */}
  {lastStep && sseStatus === 'streaming' ? `${lastStep.agentName}이(가) 처리 중...` : ...}
</div>

{/* Region 2: expand/collapse announcements — NEWLY ADDED */}
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">  {/* line 611 */}
  {isExpanded ? '핸드오프 트래커가 열렸습니다' : ''}
</div>

{/* Region 3: visual container — SHOULD NOT HAVE role="status" */}
<div
  className={cn("bg-zinc-900 border-t border-zinc-700", ...)}
  role="status"          {/* line 622 — STILL PRESENT — causes live region flooding */}
  aria-atomic="false"
  aria-label="Agent delegation tracker"
  aria-expanded={isExpanded}  {/* line 625 — WRONG ELEMENT: belongs on toggle button, not container */}
>
```

**Why blocking**: The writer added a second sr-only div (line 611) for expand/collapse announcements — this is the correct pattern — but then left `role="status"` on the visual container (line 622). The result is THREE simultaneous live regions. Screen readers will attempt to announce from all three on every state change.

**Section 5.5 line 1602** actively documents this wrong design: `"role="status" aria-atomic="false" on visual div"` — this must be corrected in the spec text too.

**Additionally**: `aria-expanded` at line 625 is on the container `div`, not on the toggle button inside it. `aria-expanded` communicates an interactive element's state. A passive container should not carry `aria-expanded`.

**Required fix**:
1. Remove `role="status"` from the visual container div (line 622). Keep `aria-label` only.
2. Move `aria-expanded` to the toggle buttons (the chevron-up/chevron-down buttons inside).
3. Keep BOTH sr-only announcement divs (lines 606 + 611) — they are correct.
4. Update Section 5.5 line 1602 to: `"Separate sr-only divs for live announcements. Visual container: aria-label only, no role=status."`

**After fix, TrackerStrip has**: 2 sr-only live regions (SSE events + expand/collapse) + 1 visual container with `aria-label` + toggle buttons with `aria-expanded`. No live region flooding.

---

### S2 — BLOCKING: HubMoreMenu `navigate` still undeclared (Issue 7 from previous review, not fixed)

**Location**: `HubMoreMenu.tsx`, line 1464

**Evidence**: `export function HubMoreMenu(...) { return isOpen ? (` — no `const navigate = useNavigate()` before the return. Line 1482 calls `navigate(item.path)` — runtime ReferenceError.

Note: `BottomTabBar.tsx` (line 536) correctly has `const navigate = useNavigate()` — HubMoreMenu was not updated in the same pass.

**Required fix**:
```tsx
export function HubMoreMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()   // ADD THIS
  return isOpen ? (
```

---

### S3 — BLOCKING (NEW): BottomTabBar5 `navigate` undeclared

**Location**: `BottomTabBar5`, lines 1401–1450

`BottomTabBar5` at line 1401 has no `const navigate = useNavigate()` declaration, but calls `navigate(tab.path)` at line 1419. Same bug as S2 — runtime crash on any tab tap in Option C.

**Required fix**: Add `const navigate = useNavigate()` at the top of `BottomTabBar5`:
```tsx
export function BottomTabBar5({ activeTab, notificationCount }: ...) {
  const navigate = useNavigate()   // ADD THIS
  return (
```

---

### M1 — REQUIRED: `h-18` invalid Tailwind class (not fixed from previous review)

**Location**: Line 257 (touch target table), line 345 (JSX comment)

Line 257: `| Session rows active | h-18 = 72px | full width | ✅ |`
Line 345: `<ActiveSessionCard />  {/* h-18, pulsing dot, live chain text */}`

`h-18` does not exist in Tailwind's built-in spacing scale (goes h-16=64px → h-20=80px). Silently ignored at build time.

**Required fix**: Replace both with `h-[72px]` throughout. Also update the `SessionRow.tsx` code block if it appears in this version (check for `isActive ? "h-18"` pattern).

---

### M2 — REQUIRED: `@theme` described as required/MUST in 6 locations — incorrect (not fixed from previous review)

**Locations**: Lines 29, 385, 542, 1100, 1406, 1613 (all say "requires" or "MUST be")

`pb-[env(safe-area-inset-bottom)]` generates valid CSS in Tailwind v4 without any `@theme` registration. The `@theme` entry only enables the named shorthand `pb-safe`. Since all code blocks use `pb-[env(safe-area-inset-bottom)]` (the arbitrary syntax), not `pb-safe`, the `@theme` entry is optional in this implementation.

Line 1613 says "MUST be in index.css" — this is a **false requirement**. Developers copying this spec would add unnecessary config and might be confused when the app works without it.

**Required fix**: Update all 6 locations to:
```
// pb-[env(safe-area-inset-bottom)] works directly without @theme.
// Optional: add @theme { --spacing-safe: env(safe-area-inset-bottom) } to index.css
// only if you want the shorthand pb-safe for DRY reuse.
```

---

### M3 — REQUIRED: DrawerNav close animation dead code (Issue 5 from previous review, not fixed)

**Location**: `DrawerNav.tsx`, line 1043

`return isOpen ? (...) : null` — conditional rendering unmounts the DOM immediately when `isOpen` becomes false. The `-translate-x-full` class at line 1052 is unreachable during close: the element is already unmounted before the transition can play. Drawer just disappears with no slide-out.

**Required fix**: Keep the DOM mounted and toggle visibility:
```tsx
export function DrawerNav({ isOpen, onClose }: ...) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "transition-opacity duration-[250ms] motion-reduce:transition-none",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      role="dialog" aria-label="Navigation" aria-modal="true"
      aria-hidden={!isOpen}  // hide from AT when closed
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <nav className={cn(
        "absolute left-0 top-0 bottom-0 w-72 ...",
        "transition-transform duration-[250ms] ease-in-out motion-reduce:transition-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
```

---

### M4 — REQUIRED: DrawerNav focus trap still not implemented (Issue 2 from previous review, not fixed)

**Location**: `DrawerNav.tsx`, lines 1042–1095

`role="dialog" aria-modal="true"` is present but there is no focus trap. Keyboard users can Tab out of the drawer into the backdrop/background content. WCAG 2.1 SC 2.1.2.

**Required fix**: Add focus management. Minimal implementation:
```tsx
const trapRef = useRef<HTMLDivElement>(null)
const prevFocusRef = useRef<Element | null>(null)

useEffect(() => {
  if (isOpen) {
    prevFocusRef.current = document.activeElement
    // Focus first focusable element in drawer
    const firstFocusable = trapRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  } else {
    // Return focus to trigger element
    ;(prevFocusRef.current as HTMLElement)?.focus?.()
  }
}, [isOpen])
```
Then add `ref={trapRef}` to the `<nav>` element and a `keydown` listener for Tab cycling.

---

### M5 — REQUIRED: DrawerSection h-10 < 44pt documented but no component code shown

**Location**: Line 936 (touch target table ⚠️), line 938 (fix note), line 1175 (Option B scoring still deducts for it)

The issue is correctly identified — `h-10 = 40px < 44pt minimum`. Line 938 presumably says "Fix needed: increase to h-12." However:
1. No `DrawerSection` component code is shown anywhere in the document (only usage at lines 1075, 1084 as `<DrawerSection />` calls)
2. Option B's UX score (line 1175) still carries "DrawerSection headers h-10 < 44pt (fix required)" as an active deduction

If this is a known fix direction, the spec must either:
- Show the corrected `DrawerSection` implementation with `h-12` headers, OR
- Document it as a "post-Stitch custom fix" in the Stitch cannot-generate list

As long as the scoring deduction remains, the spec is penalizing Option B for a bug the spec itself hasn't fixed.

**Required fix**: Add a `DrawerSection` component code block showing `h-12` (48px) section headers with `aria-expanded` on the collapsible trigger. Remove or update the scoring deduction line accordingly (either "-1: hamburger ergonomics" OR "DrawerSection h-12 ✅ fixed" — but not penalize for an issue the spec intends to fix).

---

### L1 — MINOR: BottomTabBar5 notification badge button `aria-label` duplicates "알림"

**Location**: `BottomTabBar5`, lines 1417–1418

**Current**:
```tsx
aria-label={tab.id === 'notifications' && notificationCount
  ? `${tab.label} 알림 ${notificationCount}개` : tab.label}
```

For the notifications tab, `tab.label = '알림'`. Result: `"알림 알림 103개"` — duplicated word.

**Required fix**: Change to `"알림 ${notificationCount}개"` (drop tab.label for the notification case):
```tsx
aria-label={tab.id === 'notifications' && notificationCount
  ? `알림 ${notificationCount}개` : tab.label}
```

---

### L2 — MINOR: `useAgentStore` referenced in MobileHubStore but no store file listed

**Location**: Line 700 (comment), no component tree entry

`useMobileHubStore` at line 726 calls `useAgentStore.getState().agentTiers` — but `useAgentStore` is imported from nowhere visible in the spec, and no `mobile-agent-store.ts` or equivalent file appears in any component tree. Developers will ask: what file does this come from?

**Required fix**: Add a comment at the top of `mobile-hub-store.ts`: `// import { useAgentStore } from './mobile-agent-store'` and note that `mobile-agent-store.ts` holds a mirrored agent list from `GET /api/agents`.

---

## Verified OK — New Expanded Content

**Excellent additions in this version**:
- Vision principle alignment analysis per option (Part 1.3 + 2.3, 3.3, 4.3) — specific, principle-by-principle ✅
- Thumb zone ASCII diagrams — concrete, correctly identifies Option B's hamburger risk ✅
- User flow task analysis × 4 tasks × 3 options — tap counts and friction points accurate ✅
- Option B `pb-[calc(56px+env(safe-area-inset-bottom))]` at line 1020 — **correct**: 56px = `h-14` input bar + safe area. Content scrolls to bottom of bar ✅
- Google Stitch session prompts — specific, concrete, machine-readable ✅
- NEXUS sr-only `<ul>` accessibility fallback (line 454-457) — correct pattern ✅
- Option C MD3 violation documented at 390px with 430px as compliant ✅
- Option B scoring deductions logically justified (hamburger ergonomics, no position indicator) ✅
- Scoring A=45, B=41, C=40 — all criterion totals verified ✅
- `useNavigate` in `BottomTabBar.tsx` (line 536) — ✅ correctly added
- Option A badge `aria-label="알림 ${tab.badge}개"` (line 565) — ✅ fixed

---

## Round 1 Assessment

**Score**: 7.3/10 (pending fixes)

**Deductions**:
- (-0.8) S1: TrackerStrip THREE role="status" — regression from partial fix; Section 5.5 documents wrong design
- (-0.7) S2+S3: `navigate` undeclared in HubMoreMenu + BottomTabBar5 — two runtime crashes
- (-0.5) M2: @theme "MUST be" in 6 locations — false requirement, worsened from previous version
- (-0.3) M3+M4: DrawerNav animation dead code + no focus trap — unchanged
- (-0.2) M1+M5: h-18 not fixed + DrawerSection fix not shown in code

**Pass threshold**: ≥7/10. Current: 7.3/10 — borderline pass on score, but S1/S2/S3 are blocking regardless.

**Required before Round 2**: Fix all 8 required issues (S1–S3, M1–M5). Estimated time: ~30 minutes.

The document's design architecture is excellent — the expanded content covering vision principles, thumb zone analysis, task flows, Stitch prompts, and scoring justifications is thorough and Phase 2 quality. All issues are implementation-spec accuracy errors, not design concept problems.

---

*CRITIC-A — Phase 2-2 App Mobile Analysis — Round 1 (Updated Document)*
*2026-03-12*
