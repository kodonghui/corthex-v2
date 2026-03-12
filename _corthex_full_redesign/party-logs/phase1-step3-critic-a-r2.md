# Phase 1 Step 1-3 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md` (rewrite, ~900 lines)
**Round**: 1 (rewritten document — fresh review)

---

## Sally (UX Designer) — User Journey & Cognitive Load

The rewrite is a substantial improvement. The Route Architecture section (pre-login `/` vs post-login `/hub`, auth guard redirect) is the kind of structural clarity that was entirely absent in the original. The 5-Second Value Prop Test (4-question checklist) is genuinely useful for validating copy decisions. The auth integration comparison table — Separate Page vs Modal vs Inline — correctly maps the 3 patterns to reference products and is the best cross-option analysis in Phase 1 so far. Option C's inline tab panel (NEXUS preview ↔ login form toggle) is a creative, CORTHEX-specific solution that no reference product does exactly — it shows the product thinking at work.

**Issue 1 (High — Implementation Gap)**: Option B's `<dialog>` code block (lines 677–756) references `dialogRef.current?.close()` in the close button but **`dialogRef` is never defined**. There is no `const dialogRef = useRef<HTMLDialogElement>(null)` and no `ref={dialogRef}` on the `<dialog>` element. More critically, `.showModal()` is never called anywhere. Without `.showModal()`, the native `<dialog>` element renders inline (not as a modal), the `::backdrop` pseudo-element is not activated, and focus is NOT trapped. The CSS `backdrop:bg-black/60` class only works when `.showModal()` is called — not for inline rendering.

The correct React pattern must be specified:
```tsx
// Ref + open/close
const dialogRef = useRef<HTMLDialogElement>(null)

useEffect(() => {
  if (open) {
    dialogRef.current?.showModal()
    // Move focus to first input
    dialogRef.current?.querySelector('input')?.focus()
  }
}, [open])

// JSX
<dialog ref={dialogRef} ...>
```
Without this, a developer implementing Option B from this spec will produce a broken non-modal overlay.

**Issue 2 (Moderate — Focus Management Unspecified)**: The cons section for Option B says "Modal login requires JavaScript and focus-trap implementation (keyboard nav)" — acknowledged — but no implementation spec is provided. The WCAG APG Dialog Pattern requires: (1) focus moves to first focusable element on `.showModal()`, (2) Tab/Shift+Tab cycle within dialog only, (3) Escape key closes dialog. For Option C, the cons say "Inline auth requires active focus management when tab switches" — also unspecified. At minimum, note: "Use `react-focus-lock` or manual `tabIndex` cycling; on tab switch to login, `useEffect(() => { inputRef.current?.focus() }, [activeHeroTab])`."

---

## Marcus (Visual Designer) — Specificity & Technical Accuracy

Option A's code is the most complete in Phase 1: nav ARIA, section aria-labelledby, h1 id, NEXUS preview role="img" with Korean aria-label, dot grid with `aria-hidden="true"` and `motion-reduce:hidden` — all correct. Option C's tab implementation is excellent: `role="tablist"` with `aria-label`, `role="tab"` with `aria-selected` + `aria-controls`, `role="tabpanel"` with `aria-labelledby` + `hidden` attribute — this is textbook correct per WCAG APG Tabs Pattern.

**Issue 3 (Moderate — Inconsistency)**: The Option A dot grid ASCII label still reads "░░ ANIMATED DOT GRID bg ░░" (line 375), but the code comment (line 491) explicitly says "CSS only, no JS animation." This contradiction between the ASCII diagram and the code comment was partially addressed from the previous version — the comment is now correct — but the ASCII heading still calls it "animated." The pros section (line 569) also says "Dot grid animation = military radar aesthetic." If the grid is static CSS, all three references to "animated" must be changed to "static dot grid pattern" for consistency. The approach itself is valid (static CSS dot grid with `motion-reduce:hidden` fallback is clean), but calling static dots "animated" sets incorrect developer expectations.

**Issue 4 (Moderate — Code Coverage Gap)**: Option B's code block covers ONLY the `<dialog>` modal (lines 677–756). Options A and C each have complete code for their nav + hero section + key structural elements. Option B provides NO code for: (1) the minimal nav, (2) the full-viewport hero section, (3) the problem section (before/after grid), (4) the sticky feature scroll. The sticky feature nav (Section 4) was flagged in the previous round as needing scroll implementation spec — it was added to the wireframe ASCII but still has no code. For a research doc where Option B is one of the recommended 3 options, this is a structural gap.

**Issue 5 (Moderate — Form Implementation)**: Option B's modal form uses `action="/api/auth/login" method="POST"` (line 705). In a React SPA, this triggers a full page reload on submit — the form data is sent via traditional HTML form submission rather than `fetch`/`XMLHttpRequest`. The landing page is a marketing page and the login would jump the user to a new page. This breaks the "no page navigation" benefit of the modal pattern (listed as the main pro for Option B). Fix: either remove the `action`/`method` attributes and specify `onSubmit={async (e) => { e.preventDefault(); await login(formData) }}`, or explicitly note that this form is intentionally server-side (traditional form submit → redirect to `/hub`).

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Conversion

The auth integration patterns are correctly scoped to CORTHEX's JWT-only architecture (no OAuth). The constraint table explicitly notes "Auth system: JWT, username + password. No OAuth." — this saves a developer from implementing the wrong auth. The brand copy is strong throughout: "이미 계정이 있으신가요? 로그인" (Option A tertiary link) is the correct Korean UX pattern for returning users. Option C's "혼자서도 50인 팀처럼" mirrors the Notion "a team of 7 feels like 70" pattern correctly localized. The recommendation correctly identifies Option A as launch choice and Option C as upgrade path when 4 screenshots are ready.

**Issue 6 (Minor — Source Quality)**: Line 1046: `https://developer.apple.com/design/human-interface-guidelines/dialogs` — this URL documents Apple's **native iOS/macOS** dialog design patterns, not web ARIA dialog patterns. It is NOT a valid authority for the HTML `<dialog>` element or `role="dialog"` ARIA implementation. The correct web authority for the `<dialog>` ARIA pattern is already listed at line 1047: `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/`. Replace the Apple HIG link with `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog` (already in the sources at line 1048) or remove the Apple HIG link as redundant and incorrect for web context.

**Issue 7 (Minor — Persistent Gaps)**: Two issues from the previous review remain unfixed:
- Option A nav links still use `href="#"` for 제품/가격/문서/블로그 (line 466). Fix: `href="/features"`, `href="/pricing"`, `href="/docs"`, `href="/blog"`.
- Pricing values (₩99,000/₩299,000) still appear in Option A Section 8 ASCII without explicit "(placeholder)" markers. Add `{/* ⚠️ 가격 미정 — 런칭 전 확정 필요 */}` comment.

---

## Summary of Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **High** | Implementation | Option B `<dialog>`: `ref`, `useRef`, `.showModal()` all missing — modal won't function |
| 2 | **Moderate** | A11y / Spec | Focus management unspecified for Option B (focus-trap) and Option C (tab-switch focus) |
| 3 | **Moderate** | Inconsistency | "ANIMATED DOT GRID" ASCII label contradicts "CSS only, no JS animation" comment |
| 4 | **Moderate** | Code Coverage | Option B has code for modal only — nav, hero, problem section, sticky scroll all unspecified |
| 5 | **Moderate** | Implementation | Option B modal form `method="POST"` causes full page reload — defeats modal auth benefit |
| 6 | **Minor** | Source Quality | `developer.apple.com/design/human-interface-guidelines/dialogs` = iOS native, not web ARIA |
| 7 | **Minor** | Carryover | Option A nav `href="#"` + pricing not marked as placeholder — both unfixed from previous |

---

## What's Working Well

- All 9 reference products use direct-observation URLs ✅
- Route architecture (pre vs post login, auth guard) clearly documented ✅
- Auth integration comparison table (3 patterns × 9 products) is excellent ✅
- Option A: full ARIA set — nav `aria-label`, section `aria-labelledby`, h1 `id`, NEXUS `role="img"` ✅
- Option A: `motion-reduce:hidden` on dot grid (clean motion-reduce approach) ✅
- Option C: textbook-correct tablist/tab/tabpanel implementation ✅
- Option B: `<dialog aria-modal="true" aria-labelledby>` ARIA correct (minus ref/showModal) ✅
- Password visibility toggle with `aria-label` on toggle button ✅
- `autoComplete="username"` and `autoComplete="current-password"` on form inputs ✅
- `bg-zinc-950 (#09090b)` used throughout — CLAUDE.md vagueness rule passes ✅
- Bento grid Hub card: `bg-indigo-950 border-indigo-900` correctly differentiates P0 ✅
- 5-second value prop test section — useful new addition ✅
- WCAG focus row added to recommendation table ✅
- `active:bg-indigo-700` added to CTAs — correct 3-state button spec ✅
- `flex-wrap` on CTA container — responsive overflow handled ✅

---

## Round 1 Score: **8.0 / 10**

**Strengths**: Major improvement. Full-page wireframes, auth integration, correct ARIA across all three options, route architecture, 5-second test framework, Korean copy quality.

**Weaknesses**: Option B's `<dialog>` spec is critically incomplete (no ref/showModal), form causes page reload, code only covers modal. Focus management for both modal and tab panel patterns not specified.

**Priority fixes for Round 2:**
1. Add `useRef + showModal()` spec to Option B dialog (with `useEffect` open/close hook)
2. Fix Option B modal form: `onSubmit` + `event.preventDefault()` + fetch pattern
3. Add focus management spec for Option B (focus-trap) and Option C (focus on tab switch)
4. Add Option B code for nav + hero section (at minimum)
5. Change "ANIMATED DOT GRID" → "STATIC DOT GRID PATTERN" in ASCII + pros section
6. Fix Option A nav `href="#"` → real routes
7. Replace Apple HIG dialog source with correct web ARIA reference

---
*Critic A review complete. Sending to Critic B for cross-talk.*
