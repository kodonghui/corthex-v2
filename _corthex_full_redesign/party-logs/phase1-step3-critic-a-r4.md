# Phase 1 Step 1-3 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md` (Round 3 fixes applied, 1250 lines)
**Round**: 3

---

## Round 3 Verification — Issue-by-Issue

### FIXED — All Critical Issues Resolved

| # | Issue | Status |
|---|-------|--------|
| 1 | Option B `<dialog>`: `useRef<HTMLDialogElement>(null)` + `useEffect showModal()/close()` + `ref={dialogRef}` | ✅ Fixed |
| 4 | Option B form: `onSubmit` + `e.preventDefault()` + fetch (line 855) | ✅ Fixed |
| 4b | Option C inline form: same `onSubmit` + fetch pattern (line 1123) | ✅ Fixed |
| 5 | Option B nav + hero code block added (minimal nav + typography-dominant hero) | ✅ Fixed |
| 6 | Option C outer div `role="tabpanel"` removed — comment explains ARIA intent | ✅ Fixed |
| 8 | Option B cons: "requires `.showModal()` API — provides native focus-trap (no library needed)" | ✅ Fixed |
| 11 | Apple HIG URL removed from Sources — zero matches for `developer.apple.com` | ✅ Fixed |

---

## Sally (UX Designer) — User Journey & Cognitive Load

Round 3 closes all HIGH and MEDIUM issues. The `<dialog>` spec is now production-complete: `useRef<HTMLDialogElement>(null)` + `useEffect` with `.showModal()` / `.close()` + `requestAnimationFrame` for post-open focus move to first input. The comment at line 809 — "showModal() activates ::backdrop, native focus-trap, and Escape-to-close" — is precisely what a developer needs to understand the browser-native behavior without reaching for a library. This is the correct spec.

Option B nav + hero code (lines 745–799) is clean: minimal 2-item nav (CORTHEX logo + `setOpen(true)` buttons for 로그인 + 무료 체험), centered full-viewport hero with `text-7xl font-bold text-zinc-50 leading-[1.0]`, scroll indicator with `animate-bounce motion-reduce:animate-none aria-hidden`. The `aria-labelledby="hero-heading"` on the section + `id="hero-heading"` on the `<h1>` is correct. Option B's landmark structure is now complete.

**Remaining LOW item — Option C tab-switch focus**: Option C cons (line 1195) correctly notes "Inline auth requires active focus management when tab switches (keyboard accessibility)" but no implementation spec is provided. This is the only unresolved item. For full keyboard accessibility, the login tab activation should focus the first input:

```tsx
useEffect(() => {
  if (activeHeroTab === 'login') {
    document.getElementById('inline-username')?.focus()
  }
}, [activeHeroTab])
```

This is LOW — the cons note accurately identifies the gap, and a competent developer can implement this. Not a blocking issue for approval.

---

## Marcus (Visual Designer) — Specificity & Technical Accuracy

Option B form (lines 855–866) uses `FormData(e.currentTarget)` + `JSON.stringify({ username, password })` + `Content-Type: application/json`. This matches CORTHEX's existing `/api/auth/login` API signature. Option C form (lines 1123–1132) uses the same pattern consistently. Both forms redirect to `/hub` on `res.ok` — correct for the JWT-authenticated dashboard. The `// else: show inline error (add error state as needed)` comment in Option B (line 865) is an appropriate deferral for production error UI.

Option C ARIA is now fully correct:
- Outer container (line 1068): plain `<div>` — no role
- Comment (line 1067): `{/* No role on outer container — role="tablist" + role="tabpanel" children handle ARIA */}` — developer rationale documented
- `role="tablist"` on strip (line 1070) ✅
- `role="tab"` + `aria-selected` + `aria-controls` on each button ✅
- `role="tabpanel"` + `aria-labelledby` + `hidden` on both panels (lines 1097, 1115) ✅

This is textbook-correct WAI-ARIA Tabs pattern.

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Conversion

The final sources table is clean: 9 product references + 4 technical references (WCAG APG, MDN dialog, MDN prefers-reduced-motion, Tailwind arbitrary values). The Apple HIG removal is correct — all remaining references are authoritative for web development decisions.

Option B cons update (line 940) is the best version across all rounds: it accurately states `.showModal()` API, notes native focus-trap, and lists browser support (Chrome 76+, Firefox 98+, Safari 15.4+) — the exact data a developer needs for a browser compatibility check before recommending Option B to a client. The cons section now correctly positions Option B's modal as a viable modern-web pattern, not a complex accessibility problem.

No new issues found.

---

## Summary

All 5 HIGH/MEDIUM issues from Round 2 are resolved:
- Option B `<dialog>`: fully correct React integration spec ✅
- Both forms: `onSubmit` + `e.preventDefault()` + fetch ✅
- Option B nav + hero code: complete ✅
- Option C outer `role="tabpanel"`: removed with explanatory comment ✅
- Apple HIG source: removed ✅

**One LOW item remains** (acceptable for approval): Option C tab-switch focus `useEffect` spec not provided — noted in cons but no code. Developer can infer from the cons note.

---

## Round 3 Score: **9.2 / 10**

**Improvement**: +0.7 from Round 2 (8.5 → 9.2).

**Strengths**: All 11 issues fully resolved across 3 rounds. Option B `<dialog>` spec is production-ready (ref + showModal + requestAnimationFrame focus). All three options have complete code coverage for their structural patterns. ARIA correct across all 3 options. Forms use SPA-appropriate fetch patterns. Sources table clean and authoritative. Pricing marked as placeholder in all 3 options.

**Remaining gap** (LOW, not blocking): Option C: no `useEffect` spec for focus-on-login-tab-switch — cons note describes the requirement correctly.

**Phase 1-3 Landing Page Research: APPROVED for Phase 2 progression.**

---
*Critic A Round 3 review complete — Phase 1-3 approved.*
