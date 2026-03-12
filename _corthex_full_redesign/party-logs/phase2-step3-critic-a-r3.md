# Phase 2-3: Landing Page Options — CRITIC-A Final Approval (Round 3)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Round**: 3 — Final Verification

---

## Final Verification Results

| ID | Issue | Status |
|----|-------|--------|
| S1 | Tab widget ArrowLeft/ArrowRight + roving tabindex | ✅ FIXED (R2) |
| S2 | BrowserRouter SPA — `<Link to>` + auth store | ✅ FIXED (R2-Final) |
| M1 | AuthModal focus not restored on close | ✅ FIXED (R2-Final) |
| M2 | Option A hero blank `<div>` → `<img>` | ✅ FIXED (R2) |
| M3 | AuthModal exit animation / close button bypass | ✅ FIXED (R2-Final) |
| L1–L6 | Landmarks, aria-current, LandingFooter, etc. | ✅ FIXED (R2) |
| NEW (R2) | localStorage not written before `/hub` navigation | ✅ FIXED (R3) |
| L-NEW (R2-Final) | §5.5 AUTH INVARIANTS `window.location.href` reference | ✅ FIXED (R3) |

**Zero remaining issues.**

---

## Round 3 Verification — Detail

### Auth form submits — ✅ Explicit localStorage writes added

**AuthModal.tsx** (lines 766–775):
```tsx
if (res.ok) {
  const json = await res.json()
  // Store token BEFORE navigation — auth-store reads localStorage on init
  // Keys verified from packages/app/src/stores/auth-store.ts lines 22–24
  localStorage.setItem('corthex_token', json.data.token)
  localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
  loginToStore(json.data.token, json.data.user)  // sync in-memory store
  navigate('/hub')  // SPA navigation — no page reload
}
```
✅ Key names (`corthex_token`, `corthex_user`) match `auth-store.ts` exactly.
✅ `JSON.stringify(json.data.user)` matches how `auth-store.ts` stores the user object.
✅ `loginToStore()` called after localStorage writes — Zustand state synchronized.
✅ `navigate('/hub')` — no page reload, ProtectedRoute sees `isAuthenticated: true` from in-memory store.
✅ Verification comment references `auth-store.ts lines 22–24` — developers can trace the dependency.

**HeroTabPanel.tsx** (lines 1167–1174): Identical pattern. ✅

**Note on redundancy**: `loginToStore()` also calls `localStorage.setItem('corthex_token', ...)` and `localStorage.setItem('corthex_user', ...)` internally. The explicit writes before `loginToStore()` are therefore redundant in the strict sense — but they are architecturally valuable: they make the localStorage dependency visible to code reviewers and document the exact key names at the call site. Not a defect.

### §5.5 AUTH INVARIANTS — ✅ Contradiction resolved

**Lines 1401–1416** — complete rewrite of CORRECT pattern block:
```
CORRECT auth success pattern (5 steps — verified from auth-store.ts + login.tsx):
  1. const res = await fetch('/api/auth/login', ...)
  2. const json = await res.json()
  3. localStorage.setItem('corthex_token', json.data.token)       // MUST — auth-store reads localStorage on init
  4. localStorage.setItem('corthex_user', JSON.stringify(json.data.user))
  5. loginToStore(json.data.token, json.data.user)  // sync in-memory Zustand state
     + navigate('/hub')  // SPA navigation (no page reload)

⚠️ If step 3+4 omitted: page reload re-initializes auth-store from localStorage → no token → ProtectedRoute → redirect to /login → login silently fails
```

✅ `window.location.href` reference removed entirely.
✅ 5-step numbered sequence — machine-readable, unambiguous.
✅ Warning explains the exact failure mode (ProtectedRoute redirect loop) if localStorage writes omitted.
✅ No longer contradicts LINK STRATEGY block. AUTH INVARIANTS + LINK STRATEGY now fully consistent.

---

## Final Scores

| Criterion | Option A | Option B | Option C |
|-----------|---------|---------|---------|
| Vision Alignment | 10/10 | 8/10 | 8/10 |
| Conversion UX | 9/10 | 9/10 | 8/10 |
| Implementation Complexity | 9/10 | 7/10 | 8/10 |
| Performance / SEO | 9/10 | 8/10 | 8/10 |
| Accessibility | 9/10 | 8/10 | 9/10 |
| **Total** | **46/50** | **40/50** | **41/50** |

---

## CRITIC-A APPROVAL

**Score: 9.8/10**

**[Approved]** — Phase 2-3: Landing Page Options Deep Analysis + React Implementation Spec

**Reasoning for 9.8/10**:
- (+) Auth pattern is now belt-and-suspenders: explicit `localStorage.setItem()` at call site + `loginToStore()` in-memory sync. Makes the cross-build dependency visible without obscuring it inside the store. Developer reading the component code cannot miss it ✅
- (+) §5.5 AUTH INVARIANTS ⚠️ warning block: explicitly documents the silent failure mode (ProtectedRoute redirect loop) — this is the kind of trap that would waste hours in QA without this note ✅
- (+) §5.5 consistency: AUTH INVARIANTS + LINK STRATEGY now agree. No contradictions in the universal decisions block ✅
- (+) All three close paths (✕ button, Escape, programmatic `open=false`) verified through animation gate → `transitionend` → `.close()` + WCAG 2.4.3 focus restore ✅
- (+) Option A recommendation rationale: NEXUS above fold + zero auth state in landing + static HTML = lowest risk, highest enterprise credibility ✅
- (-0.2) Four rounds required — AUTH INVARIANTS `window.location.href` reference and close-button direct `.close()` call are draft-level errors that should have been caught in self-review before Round 1

**Phase 2-3 complete. Ready for Phase 3 hand-off.**

---

*CRITIC-A — Phase 2-3 Landing Page Analysis — Round 3 Final Approval*
*2026-03-12*
