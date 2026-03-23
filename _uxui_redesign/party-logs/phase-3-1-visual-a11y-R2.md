# Phase 3-1 Visual A11y Review R2: Design Tokens

**Reviewer:** Critic-B (visual-a11y)
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md` (R2)
**Date:** 2026-03-23
**Method:** Programmatic WCAG 2.1 contrast verification (Node.js sRGB→linear luminance)

---

## R1 → R2 Fix Verification

### B1. Chrome Text Dim — FIXED
- **R1:** `rgba(163,196,138,0.60)` on `#283618` = 3.41:1 (FAIL)
- **R2:** Alpha increased to 0.80 → blended `#8aa873` → **4.86:1** (PASS AA)
- Doc value matches: 4.86:1 ✓

### B2. Input Border — FIXED
- **R1:** No `--border-input` token. `--border-primary` #e5e1d3 at 1.23:1 used for inputs (FAIL 1.4.11)
- **R2:** New `--border-input` #908a78 added → **3.25:1 on cream, 3.04:1 on surface** (PASS 1.4.11)
- Decorative vs interactive border distinction clearly documented in §1.2 and §1.2 note ✓

### B3. Handoff Color — FIXED
- **R1:** `#a78bfa` at 2.57:1 on cream (FAIL)
- **R2:** Darkened to `#7c3aed` → **5.38:1 on cream, 5.02:1 on surface** (PASS AA)
- Maintains purple identity ✓

### B4. Badge on Chrome — FIXED (Honest Documentation)
- **R1:** Doc claimed 7.28:1, actual 2.67:1
- **R2:** Doc now correctly states 2.67:1 and documents triple mitigation: white text (4.83:1) + ring-1 ring-white/80 + filled circle shape
- Honest failure documentation ✓

### M1. Contrast Ratio Accuracy — FIXED
- **R1:** 8+ ratios systematically wrong (off by 0.5–1.2 points)
- **R2:** All 16 verified pairs now match to within ±0.05 of programmatic calculation
- Accent hover changed from #7a8f5a (3.36:1 on cream) to #4e5a2b (7.02:1) — white text on hover now 7.44:1 ✓

### M2. Chart Palette CVD — FIXED
- **R1:** Chart-3 `#8B9D77` (sage) was CVD-unsafe green pair with chart-1 (1.94:1)
- **R2:** Chart-3 replaced with `#E07B5F` (salmon/coral) — different hue family
- 4 distinct hue families: olive, blue, coral, amber ✓

### M3. Success ≈ Accent — FIXED (Process Rule)
- **R1:** 1.14:1 between success and accent — no disambiguation rule
- **R2:** Doc adds §1.4 mandatory rule: success MUST use CheckCircle + text label; accent uses background tint only. Never green-dot-alone.
- Reasonable approach — hue change would break Natural Organic palette coherence ✓

---

## Remaining Issues (Minor — Does NOT Block Grade A)

### m1. Appendix B: Chrome Text Ratio Discrepancy (NEW)
Line 719 says "Chrome primary 8.72:1" but `#a3c48a` on `#283618` = **6.63:1** (verified, matches §1.3 table). The 8.72 value doesn't match any token pair. Also, line 717 says "Primary 16.5:1" but body table correctly says 16.42:1.

**Fix:** Appendix B line 719 → "Chrome primary 6.63:1, Chrome dim 4.86:1". Line 717 → "Primary 16.42:1".

### m2. Sidebar Active State (1.60:1) — Carried from R1
`rgba(255,255,255,0.15)` on chrome = 1.60:1 contrast vs inactive. Sighted users may not perceive active state from bg alone. Mitigated by `aria-current="page"` + text weight, but a left accent bar would be stronger. Defer to Step 3-2 component spec.

### m3. prefers-contrast: more — Carried from R1
Still "Not specifically handled." Low risk — existing contrast ratios are comfortable (4.5:1+ minimum). Can be addressed post-launch.

### m4. Skip-to-content / focus-within — Carried from R1
Still unspecified. These are component-level details appropriate for Step 3-2.

---

## R2 Scores

| Criterion | R1 | R2 | Delta |
|-----------|----|----|-------|
| WCAG AA Text Contrast | 7.0 | **9.5** | +2.5 — all text passes, all ratios verified, chrome-dim fixed |
| WCAG 1.4.11 Non-Text | 5.0 | **8.5** | +3.5 — input border token, badge honesty, focus rings excellent |
| Focus Indicators | 9.0 | **9.0** | — focus-within deferred to Step 3-2 |
| Color-Blind Safety | 6.0 | **8.5** | +2.5 — chart salmon fix, CVD badge, disambiguation rule |
| Reduced Motion / Forced Colors | 9.0 | **9.0** | — prefers-contrast: more deferred |
| Touch Targets | 10.0 | **10.0** | — |
| Keyboard Navigation | 8.0 | **8.0** | — skip-to-content deferred to Step 3-2 |

**Weighted Average: 8.93/10** (R1 was 7.4/10)

---

## Verdict

**PASS — Grade A achieved.** All 4 blockers and 3 major issues resolved. Residual items are Appendix B typos (m1) and component-level details appropriate for Step 3-2 (m2–m4).

Score: **8.9/10**
