# Phase 3-2 Visual A11y Review R2: Component Strategy

**Reviewer:** Critic-B (visual-a11y)
**Document:** `_uxui_redesign/phase-3-design-system/component-strategy.md` (R2)
**Date:** 2026-03-23

---

## R1 → R2 Fix Verification

### M1. TreeView ARIA Semantics — FIXED
- **R1:** TreeView described as "recursive Accordion" with no ARIA tree distinction
- **R2:**
  - §3.3 table line 355: TreeView flagged with "**requires custom tree ARIA** (see note below)" ✓
  - §3.3 note (line 373): Comprehensive warning — `role="tree"`/`role="treeitem"`, `aria-expanded`, arrow-key navigation (up/down/left/right), Home/End, typeahead. References React Aria's `useTreeView` as option. ✓
  - One residual: §7.1 line 645 comment still says `# Custom (recursive Radix Accordion)` — should ideally say `# Custom (Accordion visual + tree ARIA)` but this is a directory listing comment, not a spec. Non-blocking.

### M2. Migration Checklist — FIXED
- **R1:** 12 items, missing reduced-motion, forced-colors, touch targets
- **R2:** Items 13-15 added (lines 475-477):
  - □ 13. `prefers-reduced-motion` — all transitions disabled ✓
  - □ 14. `forced-colors: active` — borders visible ✓
  - □ 15. Touch targets ≥ 44px on mobile ✓

### m1. Destructive Button Hardcoded Color — FIXED
- **R1:** `hover:bg-red-700` (hardcoded Tailwind)
- **R2:** `hover:bg-corthex-error/90` (opacity modifier on design token) ✓
- API rule #1 updated: "Opacity modifiers (`bg-corthex-error/90`) are acceptable." ✓

### m2. Link Variant Hover Color — FIXED
- **R1:** `hover:underline` only, no color change
- **R2:** `underline underline-offset-4 hover:text-corthex-accent` ✓
- Now matches Step 3-1 §1.8 exactly: base `accent-secondary` + `underline` + hover `accent` ✓

### m3. Dark-Background Component Variant — FIXED
- **R1:** No systematic pattern for dark-bg components
- **R2:** New `inverse` variant added (line 285):
  - `bg-white/15 text-corthex-text-chrome hover:bg-white/25 focus-visible:ring-corthex-focus-chrome`
  - Uses chrome focus ring ✓
  - Variant mapping documented in §4.5 (line 503) ✓

### m4. Calendar A11y — FIXED
- **R1:** No a11y mention for react-day-picker
- **R2:** §6.7 note (line 595): "react-day-picker v9 provides built-in ARIA grid pattern, arrow-key date navigation, month navigation, and locale support. Implementers must verify `aria-label` on date cells and arrow-key behavior during migration." ✓

### m5. Chart Pattern Fills — FIXED
- **R1:** Token integration mentioned but pattern fill requirement not carried forward
- **R2:** §6.1 (line 569): "Charts with >3 series must support pattern fills (dashed, dotted, hatched) per Step 3-1 CVD safety requirement." ✓

---

## Bonus Improvements (Not Requested)

| Improvement | Assessment |
|------------|-----------|
| Button default size `h-10` → `h-11` (44px) | Meets WCAG AAA touch target ✓ |
| Icon button `w-10 h-10` → `w-11 h-11` | Same ✓ |
| `transition-all` → `transition-colors` with §5.1 note | Avoids animating layout properties ✓ |
| CommandPalette added (cmdk) | New v3 feature, z-index 100 per Step 3-1 ✓ |
| recharts transitive dependency documented | Prevents removal breakage ✓ |
| radix-ui version pinning note | Acknowledges CLAUDE.md pin rule ✓ |

---

## R2 Scores

| Criterion | R1 | R2 | Delta |
|-----------|----|----|-------|
| Component a11y framework | 8.0 | **9.0** | +1.0 — inverse variant, correct touch targets |
| Migration a11y checklist | 6.5 | **9.0** | +2.5 — all 3 items added |
| Token consistency in examples | 7.0 | **9.0** | +2.0 — destructive, link, inverse all fixed |
| Complex widget a11y guidance | 6.0 | **8.5** | +2.5 — TreeView ARIA, Calendar a11y |
| Strategy-level a11y coverage | 8.0 | **9.0** | +1.0 — chart fills, recharts, cmdk |

**Weighted Average: 8.9/10** (R1 was 7.3/10)

---

## Verdict

**PASS — Exceeds Grade B, meets Grade A threshold (8.0).** All 2 major and 5 minor issues resolved. Only residual is a directory listing comment (§7.1 tree-view.tsx) that could be more precise — non-blocking.

Score: **8.9/10**
