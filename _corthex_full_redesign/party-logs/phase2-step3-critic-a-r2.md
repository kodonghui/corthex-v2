# Phase 2-3: Landing Page Options — CRITIC-A Review (Round 2)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Round**: 2 — Verification Review

---

## Verification Results

| ID | Issue | Status |
|----|-------|--------|
| S1 | Tab widget — no ArrowLeft/ArrowRight + roving tabindex | ✅ FIXED |
| S2 | `<a href>` → `<Link to>` (architectural clarification) | ✅ RESOLVED (separate build decision accepted) |
| M1 | AuthModal focus not restored on close | ⚠️ PARTIALLY FIXED (see below) |
| M2 | Option A hero blank `<div>` → `<img>` placeholder | ✅ FIXED |
| M3 | AuthModal exit animation broken | ⚠️ PARTIALLY FIXED (same issue as M1) |
| L1 | §1.4 `role="dialog"` redundant for `<dialog>` | ✅ FIXED |
| L2 | No `<header>` banner landmark | ✅ FIXED |
| L3 | FeatureNav no `aria-current` | ✅ FIXED |
| L4 | LandingFooter not implemented | ✅ FIXED |
| L5 | Option C no page assembly | ✅ FIXED |
| L6 | TrustRail flex-wrap layout | ✅ FIXED |
| **NEW** | **`window.location.href = '/hub'` without storing localStorage token** | ❌ NOT FIXED |

**9 fixed ✅, 1 new blocking issue, M1/M3 partially fixed.**

---

## Verified Fixed — Detail

### S1 — ✅ Tab keyboard nav: excellent implementation

`onKeyDown` on `role="tablist"` div (lines 1032–1043): ArrowLeft/ArrowRight intercepts correctly. Key event naturally bubbles from focused `<button>` to the `tablist` div. ✅

`tabIndex={activeTab === tab ? 0 : -1}` on each tab button (line 1052): roving tabindex correct. Only active tab in natural Tab order. ✅

`document.getElementById(\`tab-${next}\`)?.focus()` called after `setActiveTab(next)` ✅

Option C Accessibility score updated 8 → 9/10 ✅

### S2 — ✅ Architectural decision accepted

§5.5 LINK STRATEGY block (lines 1357–1362) documents: "Landing is a SEPARATE static/SSG build from packages/app." `<a href>` is correct for a static build context. `window.location.href = '/hub'` is the correct cross-site navigation.

This resolves the `<Link>` vs `<a href>` ambiguity by making an explicit architectural decision. Accepted.

### M2 — ✅ Option A hero `<img>`

Lines 315–319: `<img src="/assets/nexus-screenshot.png" alt="CORTHEX NEXUS 조직도 캔버스 — ..." className="w-full" />` ✅
Wrapper div: `role="img"` removed ✅. Placeholder comment retained ✅.

### L1–L6 — ✅ All minor issues fixed

- §1.4: `<dialog>` implicit role note ✅
- All 3 assemblies: `<header>` wrapping `<LandingNav />` ✅
- FeatureNav: `aria-current={activeIndex === i ? 'true' : undefined}` ✅
- LandingFooter: implemented with `<footer>`, 2-col nav, legal row ✅
- LandingPageC §4.6: full assembly added ✅
- TrustRail: `flex-col lg:flex-row lg:justify-between` responsive fix ✅

---

## Remaining Issues

### NEW — BLOCKING: Auth token not stored in localStorage before `window.location.href = '/hub'`

**Locations**:
- `AuthModal.tsx` form submit, line 732: `if (res.ok) window.location.href = '/hub'`
- `HeroTabPanel.tsx` form submit, line 1121: `if (res.ok) window.location.href = '/hub'`
- §5.5 AUTH INVARIANTS (line 1351): documents pattern without token storage step

**Why blocking**: Verified from `packages/app/src/stores/auth-store.ts` lines 22–24:
```tsx
token: localStorage.getItem('corthex_token'),
user: JSON.parse(localStorage.getItem('corthex_user') || 'null'),
isAuthenticated: !!localStorage.getItem('corthex_token'),
```

The app initializes auth state from `localStorage.getItem('corthex_token')`. When the separate landing page fetches `/api/auth/login` and receives the JWT, it must store it in localStorage BEFORE `window.location.href = '/hub'`. Without this, the app at `/hub` reads `localStorage.getItem('corthex_token')` = null → `isAuthenticated: false` → `ProtectedRoute` redirects to `/login`. The user is never authenticated.

**Required fix** — both AuthModal and HeroTabPanel form onSubmit handlers:
```tsx
if (res.ok) {
  const json = await res.json()
  // Store auth state in localStorage — app reads these keys on init (auth-store.ts lines 22-24)
  localStorage.setItem('corthex_token', json.data.token)
  localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
  window.location.href = '/hub'
}
```

Also update §5.5 AUTH INVARIANTS to document the localStorage storage step:
```
CORRECT pattern (separate landing build):
  1. fetch('/api/auth/login', { method: 'POST', body: { username, password } })
  2. const json = await res.json()
  3. localStorage.setItem('corthex_token', json.data.token)      // app reads this key
  4. localStorage.setItem('corthex_user', JSON.stringify(json.data.user))  // app reads this key
  5. window.location.href = '/hub'
```

---

### M1/M3 — PARTIALLY FIXED: Close button bypasses animation gate and focus restoration

**Location**: `AuthModal.tsx`, line 711

**The `isClosing` + `onTransitionEnd` approach is correct** when triggered by the parent:
- `open` prop → `false` → `useEffect` → `setIsClosing(true)` → exit animation → `onTransitionEnd` fires → `.close()` + focus restore ✅

**Problem**: Close button at line 711 calls `dialogRef.current?.close()` directly:
```tsx
<button
  onClick={() => dialogRef.current?.close()}  ← calls .close() directly
  ...
>✕</button>
```

This immediately closes the dialog (`display:none`) BEFORE the animation gate can run. Sequence:
1. Button click → `dialogRef.current?.close()` → native `close` event → `onClose()` → `setOpen(false)`
2. `useEffect` → `setIsClosing(true)` → re-render
3. But dialog is already `display:none` — `onTransitionEnd` never fires
4. Focus is NOT restored

Same issue applies to Escape key (native `close` event bypasses the gate).

**Fix**: Close button should trigger `onClose()` (the prop), not `dialogRef.current?.close()` directly. Then the animation gate runs first:
```tsx
<button
  onClick={() => onClose()}  // Goes through parent → setOpen(false) → useEffect → animation → onTransitionEnd
  aria-label="모달 닫기"
>✕</button>
```

For Escape key, add a `cancel` event listener in `useEffect` to preventDefault and route through the same gate:
```tsx
useEffect(() => {
  const dialog = dialogRef.current
  if (!dialog) return
  const handleCancel = (e: Event) => {
    e.preventDefault()  // Prevent native Escape-to-close
    onClose()           // Route through parent → animation gate
  }
  dialog.addEventListener('cancel', handleCancel)
  return () => dialog.removeEventListener('cancel', handleCancel)
}, [onClose])
```

This ensures ALL close paths (button click, Escape, programmatic) go through the animation gate → `onTransitionEnd` → focus restore.

**Severity note**: M-level (required but non-blocking). The dialog IS functional — it opens, submits login, and closes. The exit animation and focus restoration are polish + WCAG 2.4.3 compliance. Given the new blocking localStorage issue, prioritize that fix first.

---

## Round 2 Assessment

**Score: 8.5/10** (pending NEW blocking fix + M1/M3 close-button fix)

**Deductions from 10**:
- (-1.0) NEW: localStorage token not stored before `/hub` redirect — functional login breakage in Options B and C
- (-0.5) M1/M3 partial: Close button bypasses `isClosing` gate — exit animation + focus restore don't fire on button click or Escape

**What's excellent in this version**:
- S1 Tab keyboard implementation: `onKeyDown` on tablist div (correct event delegation pattern) + roving tabindex — ARIA 1.2 compliant ✅
- AuthModal `isClosing` + `onTransitionEnd` concept: architecturally correct pattern; only needs close-button routing fix to work fully ✅
- §5.5 LINK STRATEGY: makes the separate-build architectural decision explicit — developers won't be confused about `<Link>` vs `<a href>` ✅
- All L1–L6 fixes: clean, correct implementations ✅
- LandingPageC assembly: well-organized, references Option A sections appropriately ✅

**Round 3 required** (minimal): NEW localStorage fix (both forms + §5.5) is ~5 lines each. M1/M3 close-button is ~8 lines + Escape handler. Estimated time: ~15 minutes.

---

*CRITIC-A — Phase 2-3 Landing Page Analysis — Round 2*
*2026-03-12*
