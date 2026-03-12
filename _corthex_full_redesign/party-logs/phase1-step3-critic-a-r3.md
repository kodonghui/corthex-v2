# Phase 1 Step 1-3 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md` (Round 2 fixes applied)
**Round**: 2

---

## Round 2 Verification — Issue-by-Issue

### FIXED (6 of 11)

| # | Issue | Status |
|---|-------|--------|
| 2 | Options B+C Pricing + Final CTA sections filled with ASCII + placeholder comments | ✅ Fixed |
| 3 | Option B Section 3: `<video autoPlay muted loop playsInline className="...motion-reduce:hidden">` + `<img>` static fallback | ✅ Fixed |
| 7 | ASCII label changed to "dot grid pattern bg (static CSS radial-gradient, no animation)" | ✅ Fixed |
| 8 | Option B Section 3 (video impl) + Section 4 (sticky nav scroll) code added | ✅ Partial |
| 9 | Option A nav: `{ label: '제품', href: '/features' }` etc. — real routes | ✅ Fixed |
| 10 | All 3 options: `{/* ⚠️ 가격 미정 — 런칭 전 실제 가격으로 교체 필요 */}` in pricing section | ✅ Fixed |

---

### NOT FIXED (5 of 11)

---

## Sally (UX Designer) — User Journey & Cognitive Load

Round 2 is a meaningful improvement. The Option B wireframe now has all 7 sections including Pricing (before/after grid contrast) and Final CTA. Section 3's NEXUS video spec with motion-reduce fallback closes the biggest implementation gap. The sticky feature nav code now has `scrollIntoView` + `data-[active=true]` + prefers-reduced-motion note — actionable.

**Issue 1 (HIGH — Still Open)**: Option B `<dialog>` still has `dialogRef.current?.close()` on the close button (line 766) but `dialogRef` is NEVER declared. There is no `const dialogRef = useRef<HTMLDialogElement>(null)`, no `ref={dialogRef}` on the `<dialog>` element, and no `useEffect` calling `.showModal()` when `open` changes. The modal will not function as a modal — it renders inline, no backdrop, no focus trap. This was the #1 HIGH issue from Round 1 and it remains unfixed. Required spec:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null)

useEffect(() => {
  if (open) {
    dialogRef.current?.showModal()
    // Move focus to first input on open
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
  } else {
    dialogRef.current?.close()
  }
}, [open])

// <dialog ref={dialogRef} ...>
```

**Issue 2 (MEDIUM — Still Open)**: Option B cons (line 846) still say "Modal login requires JavaScript and focus-trap implementation (keyboard nav)." This is technically misleading: the native `<dialog>` element with `.showModal()` provides built-in focus trapping — Tab/Shift+Tab cycles within the dialog, Escape closes it — all browser-native, zero JS. The correct con is: "Modal requires `useRef` + `useEffect` for React integration with `.showModal()` / `.close()` API." The focus-trap con is only true for non-native implementations. As written, it may lead a developer to unnecessarily install `react-focus-lock` or similar when `.showModal()` already handles this.

---

## Marcus (Visual Designer) — Specificity & Technical Accuracy

Option B Section 4 sticky nav code is correct: `sticky top-[64px] z-40` clears the `h-16` (64px) fixed main nav, `data-[active=true]:border-b-2 data-[active=true]:border-indigo-500` is the proper Tailwind v4 data-attribute active state, and the `prefers-reduced-motion` scrollIntoView note is a good implementation comment. Option C bento grid now correctly has SECTION 4 (tabbed product preview), SECTION 5 (testimonials), SECTION 6 (pricing), SECTION 7 (final CTA) — all sections are now filled.

**Issue 3 (MEDIUM — Still Open)**: Option C outer wrapper div at line 975 still has `role="tabpanel"` wrapping both the `role="tablist"` and the two `role="tabpanel"` children:

```tsx
<div
  className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
  role="tabpanel"   {/* ← WRONG: this div contains a tablist + 2 tabpanels */}
>
  <div role="tablist" ...>
  <div id="panel-preview" role="tabpanel" ...>
  <div id="panel-login" role="tabpanel" ...>
</div>
```

ARIA prohibits a container with `role="tabpanel"` from directly containing a `role="tablist"`. The outer div is just a visual container — it should have NO role attribute (or `role="presentation"` if a role is required for CSS targeting). Fix: remove `role="tabpanel"` from line 975.

**Issue 4 (MEDIUM — Still Open)**: Both Option B (line 774) and Option C (line 1029) login forms still use `action="/api/auth/login" method="POST"`. This causes a full page reload on submit — the form data is sent via native HTML form submission, not fetch. For Option B this defeats the entire benefit of the modal pattern (listed as the primary pro: "no page navigation"). For Option C it causes the inline tab form to reload the full page. Fix for both forms:

```tsx
// Replace: <form action="/api/auth/login" method="POST" ...>
// With:
<form
  onSubmit={async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', { method: 'POST', body: data })
    if (res.ok) {
      window.location.href = '/hub'
    } else {
      setError('로그인 실패. 다시 시도해주세요.')
    }
  }}
  className="space-y-4"
>
```

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Conversion

Option B's Pricing section ASCII (lines 653–661) now has 3-tier cards with placeholder comment — correct. Option C Pricing (lines 906–913) same. Final CTA sections for both B and C are now specified with `bg-indigo-950 border-t border-indigo-900` — consistent with Option A's final CTA. The Option B Section 3 video spec has correct `aria-hidden="true"` on the `<video>` and a proper alt text on the `<img>` fallback: "CORTHEX NEXUS 조직도 캔버스 — 드래그로 에이전트를 배치하는 화면." This is production-ready.

**Issue 5 (LOW — Still Open)**: Sources table (line 1136) still contains:
```
| Apple ARIA Dialog Pattern | https://developer.apple.com/design/human-interface-guidelines/dialogs |
```
This is Apple HIG for **native iOS/macOS dialogs**, not web `<dialog>` ARIA. The two correct web authorities are already in the table (MDN `<dialog>` + W3C ARIA APG). Remove this row.

---

## Summary of Remaining Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **HIGH** | Implementation | Option B `<dialog>`: `dialogRef` undefined — missing `useRef` + `ref` + `useEffect showModal()` |
| 2 | **Medium** | Misleading Con | Option B cons: "focus-trap implementation" misleading — `.showModal()` is browser-native |
| 3 | **Medium** | ARIA | Option C line 975: outer div `role="tabpanel"` wraps tablist + panels — invalid nesting |
| 4 | **Medium** | Implementation | Both B+C forms: `method="POST"` causes full page reload — need `onSubmit` + fetch |
| 5 | **Low** | Source Quality | Apple HIG dialog URL in Sources — wrong authority for web `<dialog>` |

---

## What's Fixed Since Round 1

- Option B + C Pricing sections: ASCII + placeholder comment ✅
- Option C Final CTA: `bg-indigo-950` with full CTAs ✅
- Option B Section 3 (NEXUS visual): `<video>` + `<img>` fallback + `motion-reduce:hidden` ✅
- Option B Section 4 (sticky scroll): `sticky top-[64px]` + `scrollIntoView` + `data-[active=true]` ✅
- Option A nav: real placeholder routes `/features` `/pricing` `/docs` `/blog` ✅
- All 3 options: pricing `{/* ⚠️ 가격 미정 */}` comments ✅
- ASCII: "dot grid pattern bg (static CSS radial-gradient, no animation)" ✅

---

## Round 2 Score: **8.5 / 10**

**Improvement**: +0.5 from Round 1 (8.0 → 8.5).

**Strengths**: Six of eleven issues resolved. Option B's two most complex unspecified elements (animated NEXUS canvas + sticky scroll) are now fully specified. All sections filled across all 3 options. Static dot grid terminology consistent throughout.

**Weaknesses**: The `<dialog>` ref/showModal spec remains unresolved — a developer following Option B will produce a broken non-modal. Both B and C forms still reload on submit. Option C's outer `role="tabpanel"` ARIA error persists.

**Priority fixes for Round 3:**
1. Add `useRef<HTMLDialogElement>` + `ref={dialogRef}` + `useEffect showModal()/close()` to Option B dialog (this is the only HIGH remaining)
2. Fix both B and C forms: `onSubmit` + `e.preventDefault()` + fetch
3. Remove `role="tabpanel"` from Option C line 975 outer div
4. Update Option B cons: remove "focus-trap implementation" — replace with `.showModal()` native focus behavior note
5. Remove Apple HIG URL from Sources

---
*Critic A review complete (Round 2). Sending to Critic B for cross-talk.*
