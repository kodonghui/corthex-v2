# Phase 3-1 Visual A11y Review: Design Tokens

**Reviewer:** Critic-B (visual-a11y)
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md`
**Date:** 2026-03-23
**Method:** Programmatic WCAG 2.1 contrast verification (Node.js sRGB→linear luminance calculator)

---

## Overall Assessment

The design tokens document is thorough in scope and demonstrates strong a11y awareness (semantic color pairing, prefers-reduced-motion, forced-colors, touch targets, CVD badge fix). However, **programmatic verification reveals 4 BLOCKER issues and 3 MAJOR issues** — primarily around incorrect contrast ratio calculations and missing WCAG 1.4.11 compliance for interactive component boundaries.

---

## BLOCKER Issues (4)

### B1. Chrome Text Dim Fails WCAG AA — Claimed ~4.5:1, Actual 3.41:1

| Token | Claimed | Actual | Requirement | Verdict |
|-------|---------|--------|-------------|---------|
| `--text-chrome-dim` rgba(163,196,138,0.60) on `#283618` | ~4.5:1 | **3.41:1** | 4.5:1 (AA normal text) | **FAIL** |

**Impact:** Sidebar secondary labels/timestamps using this token are illegible for low-vision users.

**Fix:** Increase alpha to 0.80 → blended `#8aa873` → 4.86:1 (PASS). Or 0.75 → `#84a16e` → 4.48:1 (marginal fail — use 0.80).

### B2. Input Border Fails WCAG 1.4.11 (Non-Text Contrast)

| Token | On Cream | On Surface | Requirement | Verdict |
|-------|----------|-----------|-------------|---------|
| `--border-primary` #e5e1d3 | 1.23:1 | 1.15:1 | 3:1 | **FAIL** |
| `--border-strong` #d4cfc4 | 1.47:1 | 1.37:1 | 3:1 | **FAIL** |

**Impact:** The document marks these as "decorative" but WCAG 1.4.11 requires 3:1 contrast for boundaries of interactive UI components (input fields, select boxes, checkboxes). If the only visual boundary of an `<input>` is `--border-primary`, it fails WCAG.

**Fix:** Add a `--border-input` token at ≈`#908a78` (3.25:1 on cream, 3.04:1 on surface). Keep `--border-primary` for decorative dividers but mandate `--border-input` for form control boundaries.

### B3. Handoff Semantic Color #a78bfa Fails on Light Backgrounds

| Pair | Ratio | Requirement | Verdict |
|------|-------|-------------|---------|
| #a78bfa on cream | 2.57:1 | 4.5:1 text / 3:1 UI | **FAIL** |
| #a78bfa on surface | 2.40:1 | 4.5:1 text / 3:1 UI | **FAIL** |

**Impact:** Handoff delegation events, handoff indicator text, and handoff icons are invisible at low contrast on light backgrounds. This is the ONLY semantic color that fails.

**Fix:** Darken to `#7c3aed` (5.38:1 on cream) or `#7e57c2` (4.92:1). Both maintain purple identity.

### B4. Error Badge on Chrome — Contrast Claim is WRONG (Actual 2.67:1, Doc Claims 7.28:1)

| Pair | Claimed | Actual |
|------|---------|--------|
| #dc2626 on #283618 | 7.28:1 | **2.67:1** |

**Impact:** The doc claims 7.28:1 which would be excellent, but actual = 2.67:1 which fails WCAG 1.4.11 (3:1). The CVD fix (ring-1 ring-white/80) partially mitigates by adding a white ring shape cue, but the base red-on-olive contrast is documented with a major calculation error. The badge must not rely on color contrast alone.

**Mitigation already in place:** The badge uses white text on red (4.83:1 PASS) + shape (filled circle + number). But the stated ratio must be corrected and the WCAG 1.4.11 failure documented honestly.

---

## MAJOR Issues (3)

### M1. Systematic Contrast Ratio Calculation Errors

Multiple stated ratios do not match programmatic verification:

| Pair | Claimed | Actual | Delta |
|------|---------|--------|-------|
| Accent #606C38 on cream | 4.14:1 | **5.35:1** | +1.21 |
| White on #606C38 | 4.53:1 | **5.68:1** | +1.15 |
| Accent secondary #5a7247 on cream | 4.53:1 | **5.04:1** | +0.51 |
| Accent hover #7a8f5a on cream | 2.84:1 | **3.36:1** | +0.52 |
| Chrome bg vs cream | 12.64:1 | **12.15:1** | -0.49 |
| Tertiary #756e5a on cream | 4.5:1 | **4.79:1** | +0.29 |
| Secondary #6b705c on cream | 4.7:1 | **4.83:1** | +0.13 |
| White on #dc2626 | 4.63:1 | **4.83:1** | +0.20 |

**Impact:** While all these tokens still PASS their respective WCAG thresholds, understated ratios create a false impression that values are marginal when they're actually comfortable. The accent-primary is a solid 5.35:1, not a borderline 4.14:1. Correcting these builds developer confidence and prevents unnecessary future "fixes."

**Root cause:** Likely a buggy contrast checker tool or manual calculation error. Chrome-on-chrome ratios (dark pairs) are correct; light-background pairs are systematically understated.

**Fix:** Re-run all ratios through a verified tool (WebAIM contrast checker or the sRGB formula used in this review). Update the tables.

### M2. Chart Palette — CVD-Unsafe Pairs (Positions 1 & 3)

| Pair | Colors | Contrast | CVD Risk |
|------|--------|----------|----------|
| Chart 1 vs 3 | #606C38 vs #8B9D77 | 1.94:1 | **HIGH** — both green-family, collapse under deuteranopia |
| Chart 1 vs 6 | #606C38 vs #A68A64 | 1.74:1 | **HIGH** — green→brown under protanopia |
| Chart 3 vs 6 | #8B9D77 vs #A68A64 | 1.12:1 | **HIGH** — sage→brown virtually identical under deuteranopia |

**Impact:** The doc says "Charts with >3 series must support pattern fills" but even a 3-series chart using positions 1, 3, and 6 would be indistinguishable for ~8% of male users.

**Fix:** Replace Chart 3 (`#8B9D77` sage) with a non-green hue. Consider `#8B5E3C` (warm brown) or `#C2649A` (rose/pink) — both maintain CVD distinctness from the olive and blue.

### M3. Success (#4d7c0f) vs Accent (#606C38) — Color Confusion

| Pair | Contrast |
|------|----------|
| Success vs Accent | 1.14:1 |

**Impact:** "Success" (completed task, online) and "Accent" (active button, focus) are virtually identical greens. The doc correctly mandates icon+text pairing, but in contexts where a green dot appears without label context (e.g., status indicator in a table row), users cannot distinguish "online" from "active/selected."

**Fix:** Consider shifting success to `#2d6a06` (deeper green) or `#15803d` (blue-green) for more visual separation. Or strengthen the "never color alone" rule to explicitly cover status dots in tables.

---

## MINOR Issues (4)

### m1. Sidebar Active State Barely Perceptible (1.60:1)

`rgba(255,255,255,0.15)` on `#283618` blends to `#48543b` — only 1.60:1 contrast against the inactive chrome. Users may not perceive which nav item is active from background color alone. The doc specifies `aria-current="page"` (good for screen readers), but sighted users need more.

**Fix already partial:** The doc mentions using text weight and `aria-current`. Recommend adding a visible left accent bar (e.g., 3px `--accent-primary` or `--text-chrome` left border) as the primary active indicator rather than relying on subtle background shift.

### m2. `prefers-contrast: more` Not Handled

The doc says "Not specifically handled — rely on existing 4.5:1+ text contrast." This misses the intent of `prefers-contrast: more`:

- Secondary text should darken (e.g., `#6b705c` → `#4a4d3e`)
- Borders should strengthen (use `--border-input` everywhere)
- Surface/bg distinction should increase

**Recommendation:** Add a brief `prefers-contrast: more` section with override tokens, similar to the `forced-colors` section.

### m3. Skip-to-Content Link — Mentioned but Not Specified

Keyboard a11y section references "skip-to-content" but doesn't specify:
- Visual appearance (hidden until focused? visible?)
- Target (`#main-content`? `#content`?)
- Style (should match focus ring tokens)

### m4. No `focus-within` for Composite Components

Focus ring tokens cover individual elements but don't address composite widgets (dropdown + trigger, combobox, date picker). These need `focus-within` styling to show which group has focus.

---

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| WCAG AA Text Contrast | 7/10 | Core text passes, but chrome-dim and handoff fail. Stated ratios have errors. |
| WCAG 1.4.11 Non-Text | 5/10 | Input borders fail 3:1. Badge contrast claim wrong. Active state imperceptible. |
| Focus Indicators | 9/10 | Excellent light/dark split. Missing focus-within for composites. |
| Color-Blind Safety | 6/10 | Good badge CVD fix, but chart palette has 3 confusable green pairs. Success ≈ accent confusion. |
| Reduced Motion / Forced Colors | 9/10 | Comprehensive. Missing prefers-contrast: more. |
| Touch Targets | 10/10 | 44px minimum, AAA level specified. |
| Keyboard Navigation | 8/10 | aria-current, landmarks good. Skip link and focus-within unspecified. |

**Weighted Average: 7.4/10**

---

## Required Fixes Summary (for Grade A ≥ 8.0)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| B1 | Chrome text dim 3.41:1 | BLOCKER | Increase alpha to 0.80 |
| B2 | Input border 1.23:1 | BLOCKER | Add `--border-input` ≈ #908a78 |
| B3 | Handoff #a78bfa 2.57:1 | BLOCKER | Darken to #7c3aed or #7e57c2 |
| B4 | Badge on chrome 2.67:1 (claimed 7.28:1) | BLOCKER | Correct ratio; document mitigation |
| M1 | 8+ wrong contrast ratios | MAJOR | Re-verify all with sRGB formula |
| M2 | Chart 1 vs 3 CVD-unsafe | MAJOR | Replace Chart 3 with non-green hue |
| M3 | Success ≈ accent (1.14:1) | MAJOR | Shift success hue or strengthen pairing rule |
