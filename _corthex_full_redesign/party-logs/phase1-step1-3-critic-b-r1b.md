# Phase 1-3 Landing Page Research — CRITIC-B Review (Rewritten Version)
**Date**: 2026-03-12
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**File reviewed**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md` (lines 1–1057)
**Round**: 1 (rewritten document)

---

## Amelia (Frontend Dev) — Implementation Feasibility

**Overall**: Major improvement over previous draft. 9 reference products all with real direct-observation URLs. Option A is now fully specified with correct nav ARIA, hero `aria-labelledby`, NEXUS canvas `role="img"`, and motion-reduce handling. Login/signup integration is a genuine addition. However two HIGH issues from the previous round remain unresolved, and the new `<dialog>` implementation has a critical omission.

**Issue 1 — Option B `<dialog>`: `ref={dialogRef}` not assigned + `.showModal()` not shown**:

Line 697: `onClick={() => dialogRef.current?.close()}` references `dialogRef` but the code block never shows:
```tsx
const dialogRef = useRef<HTMLDialogElement>(null)
```
And `<dialog>` element (line 679) has no `ref={dialogRef}` attribute. Most critically, the spec never shows the trigger:
```tsx
dialogRef.current?.showModal()
```
This matters because:
- `<dialog>` opened with `.showModal()` creates the native `::backdrop` pseudo-element (enabling `backdrop:bg-black/60 backdrop:backdrop-blur-sm` at line 684)
- `.showModal()` enables native focus-trap and Escape-key-close behavior
- Without `.showModal()`, the `backdrop:` CSS classes do nothing, and focus-trap is absent

The line 685 class `"open:flex open:flex-col"` uses the CSS `open:` variant (applies when dialog has `[open]` attribute) which requires `.showModal()` to set that attribute. The transition logic at line 688 uses a JavaScript `open` state prop — these two patterns conflict unless the `open` state is synchronized with the native dialog's `[open]` attribute via `.showModal()`.

**Fix**: Add at minimum a `useRef` + trigger pattern to the code block:
```tsx
const dialogRef = useRef<HTMLDialogElement>(null)
// Trigger (on CTA click):
const openModal = () => dialogRef.current?.showModal()
// On dialog:
<dialog ref={dialogRef} ...>
```

**Issue 2 — Options B and C: incomplete — empty sections for Pricing + Final CTA**:

**Option B**: Lines 647–648: `SECTION 6 — PRICING` and `SECTION 7 — FINAL CTA (bg-zinc-900)` are still label-only. No ASCII wireframe, no Tailwind code.

**Option C**: Lines 831–833: `SECTION 5 — TESTIMONIALS`, `SECTION 6 — PRICING`, `SECTION 7 — FINAL CTA` are still label-only.

Pricing is the primary conversion section of every landing page. This was flagged as HIGH in the previous round and remains unresolved. Option A has full spec through all 9 sections — Options B and C must match. At minimum: ASCII diagram + reference to "same 3-tier structure as Option A" with any Option-specific differences (e.g., Option B modal CTA vs. Option A inline link).

**Issue 3 — Option B Section 3 (NEXUS Solution Reveal): still unspecified**:

Line 624: `[NEXUS canvas animation/screenshot — full width, bg gradient]` — still says "animation/screenshot" without choosing one. No Tailwind code, no `<video>` tag, no `<img>` tag. This is Option B's most visually important section and it has no implementation spec.

The writer chose to hedge with "animation/screenshot" but this is not a spec. Must pick one and code it:
- **Video**: `<video autoPlay muted loop playsInline aria-hidden="true"><source src="/nexus-demo.mp4" type="video/mp4" /></video>` + `<img>` fallback for `prefers-reduced-motion`
- **Screenshot only**: `<img src="/nexus-canvas.png" alt="NEXUS 조직도 캔버스" className="w-full rounded-xl" />`

---

## Quinn (QA + A11y) — WCAG AA Compliance

**Issue 4 — Option C: outer container div has `role="tabpanel"` incorrectly wrapping the entire tab widget**:

Lines 889–892:
```tsx
<div
  className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
  role="tabpanel"
>
  {/* Tab strip */}
  <div role="tablist" aria-label="미리보기 또는 로그인" className="flex border-b border-zinc-800">
```

This outer container has `role="tabpanel"` but it wraps the ENTIRE tab widget — tablist + two tabpanels. A `role="tabpanel"` element should only contain the content of ONE tab, not the tablist and multiple panels. Screen readers will announce "tabpanel" when entering this outer div, before the user reaches the tablist, creating confusing nested structure.

The individual panels (lines 919–928 and 931–975) already correctly carry `role="tabpanel"`. The outer container should have no role (or `role="region"` with an `aria-label` if you want it as a landmark). Fix:

```tsx
{/* Outer container — no role, just visual styling */}
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
  <div role="tablist" aria-label="미리보기 또는 로그인" className="flex border-b border-zinc-800">
    ...
  </div>
  <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" ...>
    ...
  </div>
  <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" ...>
    ...
  </div>
</div>
```

---

## Bob (Performance) — Load Time, Animation, Assets

**Issue 5 — Option B cons "requires focus-trap implementation" is misleading — native `<dialog>.showModal()` handles this**:

Line 777: "Modal login requires JavaScript and focus-trap implementation (keyboard nav)". This is misleading for developers who may import a third-party focus-trap library unnecessarily. Native `<dialog>` opened with `.showModal()` provides:
- Focus trap (Tab/Shift+Tab cycle within dialog) — free, no library
- Escape key closes dialog — free, no library
- Focus restoration to trigger element on close — free, no library

The cons note should read: "Modal login requires `.showModal()` API (not `open` attribute) — native focus-trap included. Browser support: Chrome 76+, Firefox 98+, Safari 15.4+."

---

## Summary of Issues (Priority Order)

| # | Issue | Severity | Status vs prev |
|---|-------|----------|----------------|
| 1 | Option B `<dialog>`: `ref={dialogRef}` absent + `.showModal()` not shown | High — implementation | New |
| 2 | Options B/C: Pricing + Final CTA sections empty | High — structural | Carried from R1 |
| 3 | Option B Section 3 NEXUS: "animation/screenshot" hedge — no code | High — implementation | Carried from R1 |
| 4 | Option C outer container: `role="tabpanel"` incorrectly wraps tablist + panels | Medium — ARIA | New |
| 5 | Option B cons: "requires focus-trap" misleading — native `.showModal()` handles it | Low | New |
| 6 | ASCII "ANIMATED DOT GRID" label misleading — code correctly says "CSS only, no JS animation" | Low | Partial fix |
| 7 | Option A nav links: `href="#"` not updated to real routes | Low | Carried from R1 |
| 8 | Pricing values ₩99,000/₩299,000 not marked as placeholder | Low | Carried from R1 |

**RESOLVED from previous round** (confirm ✅):
- ✅ Option A nav `aria-label="Main navigation"` — fixed (line 460)
- ✅ Option A hero `aria-labelledby="hero-heading"` + h1 `id` — fixed (lines 489, 504)
- ✅ Option A NEXUS canvas `role="img"` + `aria-label` — fixed (lines 539–540)
- ✅ Dot grid: `motion-reduce:hidden` class added (line 494) — static pattern acknowledged in comment
- ✅ Option C interactive NEXUS: resolved as tab panel (not ReactFlow) — correct
- ✅ 9 reference products with real URLs (Supabase added as 9th) — all verified
- ✅ Route architecture clearly documented (lines 34–47)
- ✅ All motion-reduce on transitions across all 3 options

---

## Score (Round 1 — Rewritten)

| Criterion | Score | Notes |
|-----------|-------|-------|
| Real URLs (9 products) | 10/10 | All direct-observation, no fabricated URLs |
| ASCII diagrams (all 3 options) | 7/10 | Option A complete; B/C missing 2–3 sections |
| Tailwind code completeness | 8/10 | Option A + C excellent; Option B missing .showModal(), Section 3 unspec'd |
| ARIA landmarks + roles | 8/10 | Option A/B good; Option C outer tabpanel error |
| motion-reduce coverage | 10/10 | All transitions and animations covered |
| Dialog/Tab implementation accuracy | 7/10 | .showModal() absent; focus-trap guidance misleading |
| Login integration (all 3 options) | 9/10 | Auth integration tables excellent |
| Route architecture | 10/10 | Pre/post-login routes clearly documented |
| Recommendation justification | 10/10 | Launch feasibility (1 vs 4 screenshots) clearly argued |

**Overall Score: 8.0 / 10** (vs 7.5/10 previous draft)

**Minimum required fixes for Round 2 approval:**
1. Option B `<dialog>`: add `const dialogRef = useRef<HTMLDialogElement>(null)` + `ref={dialogRef}` + `dialogRef.current?.showModal()` trigger
2. Option B Sections 6–7 (Pricing, Final CTA): ASCII + at minimum "same structure as Option A" reference
3. Option C Sections 5–7 (Testimonials, Pricing, Final CTA): ASCII + at minimum "same structure as Option A" reference
4. Option B Section 3 (NEXUS canvas): choose video or screenshot, provide code block
5. Option C outer container: remove `role="tabpanel"` from the outer wrapping div

Issues 6–8 are low priority, non-blocking.

---

*CRITIC-B sign-off: Amelia / Quinn / Bob — Round 1 (rewritten)*
