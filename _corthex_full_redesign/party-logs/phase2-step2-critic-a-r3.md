# Phase 2-2: App Mobile Options — CRITIC-A Review (Round 3)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/app-analysis.md`
**Round**: 3 — Final Verification

---

## Verification Results

| ID | Issue | Status |
|----|-------|--------|
| S3 | BottomTabBar5 navigate undeclared | ✅ FIXED |
| M5 | DrawerSection h-10 fix not shown | ✅ FIXED |
| L1 | BottomTabBar5 "알림 알림" duplication | ✅ FIXED |
| L2 (new) | BottomTabBar5 badge missing aria-hidden | ✅ FIXED |
| ADD-1 | API endpoint table wrong paths | ✅ FIXED |
| ADD-2 | pb-[calc(56px)] static, ignores TrackerStrip height | ✅ FIXED |
| ADD-3 | Stitch prompts missing for Options B/C | ✅ FIXED |
| **NEW** | **JSX comment between props — compile error** | ❌ NOT FIXED |

**7 fixed ✅, 1 blocking still open.**

---

## Verified Fixed — Detail

### S3 — ✅ BottomTabBar5 navigate

`const navigate = useNavigate()` at line 1539, with import comment ✅

### M5 — ✅ DrawerSection h-12 full component

Lines 1158–1185: complete `DrawerSection` implementation showing `h-12` (48px) headers on both collapsible (`<button>`) and static (`<p>`) variants ✅
`aria-expanded={collapsible ? !collapsed : undefined}` on the button ✅
Option B UX score deduction updated — no longer penalizes for h-10 issue ✅

### L1 — ✅ aria-label "알림 N개" (no duplication)

Lines 1553–1554:
```tsx
aria-label={tab.id === 'notifications' && notificationCount
  ? `알림 ${notificationCount}개` : tab.label}
```
Drops `${tab.label}` prefix for the notification case — no more "알림 알림 N개" ✅

### L2 (new) — ✅ Badge aria-hidden="true"

Line 1576: `aria-hidden="true"` with explanatory comment:
`// count is in button aria-label — badge is purely visual` ✅
Matches Option A pattern ✅

### ADD-1 — ✅ API endpoint table: all /workspace/ paths correct

Lines 89–103: all 11 endpoints now use `/api/workspace/...` prefix ✅
SSE endpoint correctly shows `POST /api/workspace/hub/stream` ✅
Explanatory note (lines 105–106) clarifies SSE body format and confirms it is NOT a separate GET endpoint ✅
Verified against `packages/server/src/routes/workspace/hub.ts` line 29.

### ADD-2 — ✅ HubHomeScreen dynamic paddingBottom

Lines 1044–1050: replaces static `pb-[calc(56px+...)]` with dynamic inline style:
```tsx
style={{
  paddingBottom: `calc(${
    hasActiveHandoff ? (isTrackerExpanded ? 192 : 48) : 0
  }px + 56px + env(safe-area-inset-bottom))`
}}
```
192px = h-48 expanded TrackerStrip ✅
48px = h-12 compact TrackerStrip ✅
0 when no active handoff ✅
`transition-[padding-bottom] duration-[250ms]` for smooth animation ✅

### ADD-3 — ✅ Stitch Session Prompts for Options B and C

§3.8 (Option B, line 1270): 5 sessions with machine-readable Stitch prompts covering hub home, drawer nav, chat, dashboard, NEXUS ✅
§4.8 (Option C, line 1671): matching session prompt structure ✅
Both follow the same specificity standard as Option A §2.9 — pixel values, Tailwind classes, Korean labels, component descriptions inline ✅

---

## Remaining Issue

### NEW — BLOCKING: JSX comment between JSX props — compile error

**Location**: `BottomTabBar5`, lines 1555–1556

**Current code**:
```tsx
<button
  key={tab.id}
  role="tab"
  aria-selected={activeTab === tab.id}
  aria-label={tab.id === 'notifications' && notificationCount
    ? `알림 ${notificationCount}개` : tab.label}
  {/* Note: for notifications tab, use just "알림 N개" NOT "${tab.label} 알림 N개"
      because tab.label IS "알림" → would produce "알림 알림 N개" duplicate */}   ← COMPILE ERROR
  onClick={() => navigate(tab.path)}
```

**Why blocking**: `{/* ... */}` is valid JSX **between children** (between opening and closing tags). When placed **between props**, it is a syntax error — the JSX parser sees `{` and expects a valid expression, gets a comment, and fails. This code will not compile at all: every Option C tab tap target is broken.

**Required fix**: Move the comment to inside the button element — between the opening `>` and the first child:

```tsx
<button
  key={tab.id}
  role="tab"
  aria-selected={activeTab === tab.id}
  aria-label={tab.id === 'notifications' && notificationCount
    ? `알림 ${notificationCount}개` : tab.label}
  onClick={() => navigate(tab.path)}
  className={cn(
    "flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]",
    "transition-colors duration-[150ms] motion-reduce:transition-none",
    activeTab === tab.id ? "text-indigo-400" : "text-zinc-500"
  )}
>
  {/* Note: for notifications tab, use just "알림 N개" NOT "${tab.label} 알림 N개"
      because tab.label IS "알림" → would produce "알림 알림 N개" duplicate */}
  <div className="relative">
```

This is a one-line relocation. The comment content is excellent — keep it.

---

## Round 3 Assessment

**Score**: 9.5/10 (conditional — pending single JSX compile error fix)

**Deduction**:
- (-0.5) JSX comment between props at lines 1555–1556 — Option C `BottomTabBar5` does not compile

**After fix**: **Approved at 9.7/10**

Deduction from 10:
- (-0.2) Three rounds required before reaching approval — blocking issues S3, ADD-1, ADD-2 could have been caught earlier; ADD-2 (dynamic TrackerStrip height) in particular represents a significant architectural correction in the dynamic `paddingBottom` calculation

**What is excellent in this version**:
- ADD-1 fix: `/api/workspace/` prefix throughout + SSE clarification note — now spec-accurate and developer-safe
- ADD-2 fix: dynamic `paddingBottom` with 192/48/0 height constants is the correct architectural pattern; the `transition-[padding-bottom] duration-[250ms]` animation is a nice touch
- ADD-3: Options B/C Stitch prompts match Option A's specificity standard — machine-readable, pixel-level, Korean labels inline
- DrawerSection h-12 component is well-structured with `aria-expanded` on the button correctly
- TrackerStrip ARIA pattern (role="region" + two sr-only divs) — correct and better than minimal fix

**Conditional approval**: Fix the JSX comment location (1 minute change) → document is approved.

**Round 4 required** (minimal — single fix only).

---

*CRITIC-A — Phase 2-2 App Mobile Analysis — Round 3*
*2026-03-12*
