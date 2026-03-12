# Phase 2-3: Landing Page Options — CRITIC-A Final Approval (Round 2 Final)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Round**: 2 Final — All Cross-talk Fixes Verified

---

## Final Verification Results

| ID | Issue | Status |
|----|-------|--------|
| S1 | Tab widget ArrowLeft/ArrowRight + roving tabindex | ✅ FIXED (Round 2) |
| S2 | BrowserRouter SPA — `<Link to>` + auth store | ✅ FIXED (Round 2 Final) |
| M1 | AuthModal focus not restored on close | ✅ FIXED (Round 2 Final) |
| M2 | Option A hero blank `<div>` → `<img>` | ✅ FIXED (Round 2) |
| M3 | AuthModal exit animation / close button bypass | ✅ FIXED (Round 2 Final) |
| L1–L6 | Landmarks, aria-current, LandingFooter, etc. | ✅ FIXED (Round 2) |
| NEW (R2) | Auth token not stored before `/hub` redirect | ✅ FIXED (replaced with loginToStore + navigate) |
| L-NEW | §5.5 AUTH INVARIANTS ↔ LINK STRATEGY contradiction | ⚠️ Minor doc inconsistency (see below) |

**Zero S/M issues remaining. One L-level documentation inconsistency.**

---

## Verified Fixed — Detail

### S2 + NEW — ✅ SPA auth pattern: complete

**LandingNav.tsx** (lines 221–254): All CTAs use `<Link to>`:
- `<Link to="/login">로그인</Link>` ✅
- `<Link to="/signup">무료 체험 →</Link>` ✅

**AuthModal.tsx** — auth form submit (lines 766–770):
```tsx
if (res.ok) {
  const json = await res.json()
  loginToStore(json.data.token, json.data.user)  // auth store — matches login.tsx pattern
  navigate('/hub')  // SPA navigation — no page reload
}
```
Matches `packages/app/src/pages/login.tsx` exactly. ✅

**HeroTabPanel.tsx** — login panel form submit (lines 1163–1167):
```tsx
if (res.ok) {
  const json = await res.json()
  loginToStore(json.data.token, json.data.user)  // auth store — matches login.tsx pattern
  navigate('/hub')  // SPA navigation — no page reload
}
```
`<Link to="/signup">` inside login panel (line 1218). ✅

`useNavigate()` + `useAuthStore(s => s.login)` declared in both components. ✅

**§5.5 LINK STRATEGY** (lines 1401–1415): Documents BrowserRouter SPA decision, `<Link to>` for all internal CTAs, `loginToStore(token, user) + navigate('/hub')`, explicit `Do NOT use window.location.href`. ✅

---

### M1/M3 — ✅ AuthModal exit animation: fully resolved

**`cancel` event listener** (lines 691–696): Separate `useEffect([onClose])`:
```tsx
const handleCancel = (e: Event) => { e.preventDefault(); onClose() }
dialog?.addEventListener('cancel', handleCancel)
return () => dialog?.removeEventListener('cancel', handleCancel)
```
Escape key → `cancel` event → `e.preventDefault()` blocks native `.close()` → `onClose()` → parent `setOpen(false)` → `useEffect([open])` else-branch → animation gate runs. ✅

**Close button** (line 745): `onClick={() => onClose()}` with comment explaining the routing:
```tsx
<button
  onClick={() => onClose()}  // route through parent — triggers useEffect gate → animation → focus restore
  aria-label="모달 닫기"
>✕</button>
```
No longer calls `dialogRef.current?.close()` directly. ✅

**`transitionend` listener** (lines 716–719):
```tsx
dialog.addEventListener('transitionend', () => {
  dialog.close()
  ;(prevFocusRef.current as HTMLElement)?.focus?.()
}, { once: true })
```
`{ once: true }` prevents double-fire from multiple CSS properties transitioning simultaneously. ✅

**`prefers-reduced-motion` fallback** (lines 710–712): Immediate `dialog.close()` + `focus()` restore. ✅

**All close paths** (button click, Escape, programmatic) now go through `onClose()` → parent state → `useEffect([open])` → `transitionend` → `.close()` + focus restore. WCAG 2.4.3 compliant. ✅

---

## Remaining Issue — L-level

### L-NEW — §5.5 AUTH INVARIANTS contradicts LINK STRATEGY

**Location**: §5.5 line 1395

```
CORRECT pattern: onSubmit + e.preventDefault() + fetch('/api/auth/login', ...) + window.location.href
```

The `AUTH INVARIANTS` block still references `window.location.href` as the correct pattern. The `LINK STRATEGY` block (10 lines later in the same §5.5) explicitly contradicts this:
```
Auth success: loginToStore(token, user) + navigate('/hub') — matches login.tsx pattern
Do NOT use window.location.href (bypasses auth store and router context)
```

**Impact**: Non-blocking. A developer reading §5.5 in full would find the contradiction and follow the more specific LINK STRATEGY guidance. The code itself (`AuthModal.tsx` and `HeroTabPanel.tsx`) is correct. However, `AUTH INVARIANTS` is a machine-readable summary block at the top of §5.5 — a developer who reads only that block gets the wrong pattern.

**Required fix**: Update AUTH INVARIANTS line 1395:
```
CORRECT pattern: onSubmit + e.preventDefault() + fetch('/api/auth/login', ...)
                 → loginToStore(json.data.token, json.data.user) + navigate('/hub')
                 (NOT window.location.href — bypasses auth store + router context)
```

**Severity**: L (minor). Does not block approval — code is correct, §5.5 LINK STRATEGY is correct, only the AUTH INVARIANTS summary text needs to catch up.

---

## Final Scores (updated)

| Criterion | Option A | Option B | Option C |
|-----------|---------|---------|---------|
| Vision Alignment | 10/10 | 8/10 | 8/10 |
| Conversion UX | 9/10 | 9/10 | 8/10 |
| Implementation Complexity | 9/10 | 7/10 | 8/10 |
| Performance / SEO | 9/10 | 8/10 | 8/10 |
| Accessibility | 9/10 | 8/10 | 9/10 |
| **Total** | **46/50** | **40/50** | **41/50** |

*(Option C accessibility score 9→9: ArrowLeft/ArrowRight implementation correct.)*

---

## CRITIC-A APPROVAL

**Score: 9.5/10**

**[Approved]** — Phase 2-3: Landing Page Options Deep Analysis + React Implementation Spec

**Reasoning for 9.5/10**:
- (+) AuthModal exit animation pattern: `transitionend` listener with `{ once: true }` + `cancel` event listener for Escape routing — the correct, precise implementation. Both close paths (button + Escape) provably go through the animation gate ✅
- (+) `prevFocusRef.current = document.activeElement` on open + restore on both `prefersReduced` + `transitionend` paths — WCAG 2.4.3 fully compliant ✅
- (+) BrowserRouter SPA architecture verified against App.tsx: `<Link to>`, `useNavigate()`, `loginToStore()` — correct and consistent with `packages/app/src/pages/login.tsx` ✅
- (+) HeroTabPanel `onKeyDown` on `role="tablist"` div (correct event delegation) + roving tabindex — ARIA 1.2 compliant ✅
- (+) §5.5 LINK STRATEGY: explicit `Do NOT use window.location.href` with reasoning — developer-safe ✅
- (+) Option A 46/50 recommendation: four-point rationale with concrete specifics (NEXUS above fold, zero modal state, SSR compatibility, enterprise depth) is well-argued and defensible ✅
- (-0.3) Three rounds required (R1 → R2 → R2-Final cross-talk) — S2 architectural ambiguity (separate static build vs SPA route) should have been resolved in draft by verifying App.tsx before writing
- (-0.2) §5.5 AUTH INVARIANTS text still references `window.location.href` — contradicts LINK STRATEGY in the same block. One-line fix needed but code is correct

**Recommendation confirmed**: Option A (Signal — Dark Command Center) for launch. Option B pattern (zero-nav modal) available as upgrade path post-analytics. Option C inline tab login appropriate for returning-user optimization post-MVP.

---

*CRITIC-A — Phase 2-3 Landing Page Analysis — Final Approval*
*2026-03-12*
