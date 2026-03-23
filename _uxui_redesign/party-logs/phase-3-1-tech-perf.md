# Phase 3-1 Tech-Perf Review: Design Tokens

**Reviewer:** tech-perf (Critic-C)
**Date:** 2026-03-23
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md`
**Focus:** Tailwind config validity, CSS variable naming, bundle impact, token completeness
**Target Grade:** A (avg >= 8.0)

---

## Verdict: CONDITIONAL PASS

The document is thorough — color system, typography, spacing, shadows, motion, and accessibility are all covered with clear rationale. The Tailwind v4 CSS-first approach is correctly identified. However, there are **3 Major** and **5 Minor** issues that need resolution before Grade A.

---

## MAJOR Issues

### M1: Missing migration strategy for `theme.css` parallel token system — BLOCKING

**Evidence:** The document specifies `--color-corthex-*` tokens in the `@theme` block (Section 8.1) and diffs only against `index.css` (Appendix A). But the codebase has a **second** token system in `packages/app/src/ui/theme.css`:

```
theme.css defines: --color-brand-50~900, --color-neutral-0~950, --color-error-50~900,
                   --color-success-50~900, --color-warning-50~900, --color-brand-primary,
                   --color-default-font, --color-subtext-color, --color-neutral-border,
                   --color-white, --color-default-background
                   + typography scale (--text-caption, --text-body, --text-heading-1~3, etc.)
                   + shadows, radii, spacing
```

**Usage scope:** 204 occurrences of `bg-brand-*`, `text-brand-*`, `bg-neutral-*`, etc. across **36 Subframe UI component files** (`packages/app/src/ui/components/`). Plus 86 occurrences of `bg-default-*`, `text-subtext-*`, etc. across 31 files.

**Impact:** The spec defines `--color-corthex-success: #4d7c0f` but the UI Button component uses `bg-error-600`, `bg-brand-500`, etc. from theme.css's `--color-brand-*` scale. These are **two parallel, overlapping token systems**. The spec must address:

1. Is `theme.css` being replaced, kept alongside, or merged?
2. What is the migration path for 204+ Subframe component class usages?
3. Do `--color-brand-500` (#606C38) and `--color-corthex-accent` (#606C38) remain duplicated, or is one deprecated?

**Fix:** Add a Section 8.4 "Token Migration Strategy" that explicitly maps `theme.css` tokens → `corthex-*` tokens, or declares `theme.css` as the Subframe UI layer (kept intact) while `corthex-*` is the page/layout layer.

---

### M2: WCAG contrast ratios are miscalculated — 6 errors

**Verification method:** WCAG 2.1 relative luminance formula (sRGB → linear → weighted sum).

| Token Pair | Document Claims | Actual Computed | Delta |
|-----------|----------------|-----------------|-------|
| accent `#606C38` on cream `#faf8f5` | 4.14:1 | **5.35:1** | +1.21 |
| text-on-accent `#fff` on `#606C38` | 4.53:1 | **5.68:1** | +1.15 |
| accent-secondary `#5a7247` on cream | 4.53:1 | **5.04:1** | +0.51 |
| accent-hover `#7a8f5a` on cream | 2.84:1 | **3.36:1** | +0.52 |
| chrome `#283618` on cream | 12.64:1 | **12.15:1** | -0.49 |
| notification badge white on `#dc2626` | 4.63:1 | **4.83:1** | +0.20 |

All are underestimates (actual contrast is better than claimed), so no WCAG failures are masked. But **a design token spec's contrast ratios must be verifiably correct** — downstream implementers will use these numbers for compliance audits.

**Fix:** Recalculate all contrast ratios using the standard WCAG 2.1 formula. The 4.14→5.35 error on accent-primary is especially significant because the document characterizes it as "AA for UI" when it actually passes AA for normal text too.

---

### M3: Internal contradiction — width animation violates own performance rule

**Section 5.1, Rule 3** states:
> "Only `transform` and `opacity` properties animated — never layout-triggering properties (width, height, top, left, margin, padding)."

**Section 5.3** specifies:
> "Sidebar collapse/expand: `width: 280px ↔ 64px` 200ms"

`width` is a layout-triggering property. Animating width causes reflow on every frame — exactly what Rule 3 prohibits.

**Fix:** Either:
- (a) Change sidebar collapse to `transform: translateX(-216px)` + `overflow: hidden` (transform-only, no reflow), or
- (b) Amend Rule 3 to explicitly carve out sidebar collapse as an accepted exception with rationale (e.g., "width animation accepted for sidebar only because transform-based collapse breaks flex layout"), or
- (c) Use `width` with `will-change: width` and document the deliberate exception.

---

## MINOR Issues

### m1: `--content-max` change (1160px → 1440px) missing from Appendix A diff

**Evidence:** Current `index.css` line 42: `--content-max: 1160px`. Spec Section 3.3: `--content-max: 1440px`. This is a **24% increase** in max content width. Appendix A documents 12 token changes but omits this one.

**Impact:** A 280px increase affects every page layout. Pages like Hub, Dashboard, and Settings that reference `--content-max` will reflow. This is arguably the most impactful single token change.

**Fix:** Add to Appendix A diff table with rationale for the change.

---

### m2: Radius token names don't match Tailwind utility names — causes developer confusion

Section 4.1 maps:
| Token | Value | Mapped to TW |
|-------|-------|-------------|
| `--radius-sm` | 4px | `rounded-sm` |

But Tailwind v4's default `rounded-sm` is **2px** (0.125rem). The document's `--radius-sm: 4px` actually maps to Tailwind's `rounded` (0.25rem). Similarly, `--radius-md: 8px` is mapped to `rounded-lg` which IS correct for TW4 defaults but the naming mismatch (doc "md" = TW "lg") will confuse developers.

Furthermore, these radius tokens are **not included** in the Section 8.1 `@theme` block, so they won't generate custom utility classes. Developers must use TW default classes, making the custom token names documentation-only.

**Fix:** Either:
- (a) Add `--radius-*` overrides to the `@theme` block so `rounded-sm` maps to 4px, or
- (b) Remove custom token names and document only "use TW defaults: `rounded` for 4px, `rounded-lg` for 8px, etc."

---

### m3: `@theme` block (Section 8.1) is incomplete — missing several token categories

The `@theme` block includes colors, fonts, layout dimensions, shadows, and animations. **Missing from @theme:**

| Token Category | Section | Needed in @theme? | Why |
|---------------|---------|-------------------|-----|
| Radius overrides | 4.1 | YES — if custom values differ from TW defaults | Current block uses TW defaults verbatim but document claims custom values |
| Z-index scale | 4.3 | OPTIONAL — can use CSS custom properties directly | But `z-corthex-modal` etc. won't work as utilities without @theme |
| Duration tokens | 5.2 | OPTIONAL — most used via inline CSS or custom classes | `duration-fast` etc. need @theme for `duration-*` utilities |
| Type scale | 2.2 | NO — TW v4 default scale matches | xs:12, sm:14, base:16 etc. are TW4 defaults |

**Fix:** Add a note in Section 8.1 clarifying which tokens are registered in `@theme` (for utility generation) vs. which are plain CSS custom properties (used via `var()`).

---

### m4: Sidebar collapsed rationale is arithmetically wrong

Section 3.3: `--sidebar-collapsed: 64px` with rationale "56px icon + 8px padding".

But Section 6.2 defines nav icons as **20px** (`w-5 h-5`). If the collapsed sidebar shows 20px icons, the math is 20px icon + 44px total padding = 64px — not "56px icon + 8px padding."

**Fix:** Correct the rationale. Perhaps: "64px = 8px grid × 8 — provides 22px padding around 20px nav icons."

---

### m5: No mention of `@subframe/core` dependency or its CSS footprint

`package.json` includes `@subframe/core: ^1.154.0` which generates the 36 UI components using `theme.css` tokens. The spec doesn't mention whether Subframe's CSS layer is kept, replaced, or how its ~54KB (estimated) CSS footprint factors into the bundle.

**Fix:** Add a note in Section 6 or a new Section 8.4 acknowledging the Subframe UI layer and how it coexists with the corthex token system.

---

## Positive Findings (What Works Well)

| Aspect | Assessment |
|--------|-----------|
| **Tailwind v4 approach** | Correct — CSS-first `@theme`, no `tailwind.config.ts`, `@tailwindcss/vite` plugin. Implementation-ready. |
| **`--color-corthex-*` naming** | Excellent — consistent namespace prevents collision with TW defaults. Generates `bg-corthex-*`, `text-corthex-*` utilities correctly. |
| **60-30-10 rule** | Well-documented with explicit zone assignments. Each color has clear "where" context. |
| **Semantic color redesign** | Smart — `#34D399` → `#4d7c0f` (success) aligns with olive palette. `#c4622d` → `#dc2626` (error) eliminates warning/error confusion. All semantic colors now pass WCAG AA on cream. |
| **Text tertiary resolution** | Correctly resolves the Phase 2 deferred ambiguity: `#756e5a` (4.79:1 actual) beats `#a3a08e` (2.48:1). Clean decision. |
| **Chart palette** | Thoughtful CVD-safe design with blue (#2563eb) and amber (#b45309) at positions 2 and 4. Pattern fill requirement for >3 series is good practice. |
| **LLM context block** | Practical — ~600 tokens is efficient for AI code generation. Covers all necessary tokens. |
| **Reduced motion / forced colors** | Complete and correct. The `0.01ms !important` override is the standard pattern. `forced-colors: active` border fallbacks cover Windows High Contrast. |
| **Animation performance** | Transform+opacity constraint is correct (compositor-only). Duration scale is reasonable (100→300ms production range). |
| **Font loading** | Google Fonts CDN with explicit weight ranges. Korean fallback chain (Pretendard → Apple SD Gothic Neo → Malgun Gothic) is comprehensive. |

---

## Scoring

| Criterion | Score | Notes |
|-----------|-------|-------|
| Tailwind v4 config validity | 7/10 | @theme structure correct but incomplete (missing radius, z-index, duration) |
| CSS variable naming | 8/10 | Consistent `corthex-*` namespace, but parallel `theme.css` system unaddressed |
| Bundle impact | 6/10 | Lucide tree-shaking noted, but @subframe/core footprint ignored, no bundle estimates |
| Token completeness | 8/10 | Thorough color/typo/spacing/shadow/motion. Gaps: theme.css migration, content-max diff |
| Technical accuracy | 7/10 | 6 contrast ratio errors (all underestimates), sidebar math wrong, width animation contradiction |
| **Average** | **7.2/10** | |

**Grade: B+ — CONDITIONAL PASS. Fix M1-M3 to reach Grade A.**

---

## Required Fixes for Grade A

| # | Type | Fix | Impact |
|---|------|-----|--------|
| M1 | MAJOR | Add theme.css migration strategy (Section 8.4) | Addresses 204+ component usages |
| M2 | MAJOR | Recalculate all WCAG contrast ratios | 6 values need correction |
| M3 | MAJOR | Resolve width animation vs. Rule 3 contradiction | Internal consistency |
| m1 | MINOR | Add `--content-max` 1160→1440 to Appendix A | Diff completeness |
| m2 | MINOR | Align radius token names with TW utilities or add to @theme | Developer clarity |
| m3 | MINOR | Document @theme vs plain CSS var distinction | Implementation guidance |
| m4 | MINOR | Fix sidebar collapsed rationale math | Accuracy |
| m5 | MINOR | Acknowledge @subframe/core CSS layer | Bundle awareness |

---

*End of tech-perf review — Phase 3-1*
