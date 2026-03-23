# Phase 3-1 Tech-Perf R2 Review: Design Tokens

**Reviewer:** tech-perf (Critic-C)
**Date:** 2026-03-23
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md` (R2)
**Previous:** R1 → CONDITIONAL PASS (B+ / 7.2) — 3 Major + 5 Minor

---

## R1 Fix Verification

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| M1 | theme.css migration strategy missing | **FIXED** | Appendix A-2 added — deprecate-in-place strategy, Phase 4 component replacement, ~54KB savings, coexistence alignment documented |
| M2 | WCAG contrast ratios miscalculated | **FIXED** | All 6 values corrected (accent 5.35:1, text-on-accent 5.68:1, accent-secondary 5.04:1, chrome 12.15:1, badge 4.83:1, text-primary 16.42:1). Inline comments added in @theme block. |
| M3 | Width animation contradicts Rule 3 | **FIXED** | Section 5.3 now uses `translateX(-216px) + opacity` for nav labels with fixed 64px icon column. Explicitly cites §5.1. No layout-triggering animation. |
| m1 | content-max missing from diff | **FIXED** | Appendix A row: `--content-max: 1160px → 1440px (+280px, 24% increase)` with rationale |
| m2 | Radius naming mismatch | **FIXED** | `--radius-*` overrides added to @theme block (sm:4px, md:8px, lg:12px, xl:16px) with TW4 default comparison comments |
| m3 | @theme incomplete + no guidance | **FIXED** | Clarifying note added: "@theme generates utilities; z-index/duration are plain CSS vars via var()" |
| m4 | Sidebar collapsed math wrong | **FIXED** | Now: "8px grid × 8 = 64px; 22px padding around 20px nav icons" |
| m5 | @subframe/core unaddressed | **FIXED** | Covered in Appendix A-2 with ~54KB CSS savings estimate |

**All 8 R1 issues resolved.**

---

## New R2 Value Verification

The R2 introduced several new/changed values. All verified via WCAG sRGB formula:

| New Value | Claimed | Verified | Status |
|-----------|---------|----------|--------|
| accent-hover `#4e5a2b` on cream | 7.02:1 | **7.02:1** | ✅ |
| white on accent-hover `#4e5a2b` | 7.44:1 | **7.44:1** | ✅ |
| handoff `#7c3aed` on cream | 5.38:1 | **5.38:1** | ✅ |
| border-input `#908a78` on cream | 3.25:1 | **3.25:1** | ✅ |
| chrome-dim 0.80 alpha (blended) on chrome | 4.86:1 | **4.86:1** | ✅ |
| badge red on chrome | 2.67:1 | **2.67:1** | ✅ (correctly flagged as MITIGATED, not PASS) |

**All new R2 ratios are correct.**

---

## R2 Bonus Improvements (Not Requested, Well-Executed)

| Addition | Assessment |
|----------|-----------|
| `--border-input` (#908a78, 3.25:1) for WCAG 1.4.11 form boundaries | **Excellent** — catches a real gap not flagged in R1 |
| accent-hover darkened #7a8f5a → #4e5a2b (white text: 3.36:1→7.44:1) | **Excellent** — proactive AA fix for button hover |
| handoff darkened #a78bfa → #7c3aed (2.57:1→5.38:1 on cream) | **Excellent** — was a silent WCAG failure |
| chrome-dim alpha 0.60→0.80 (3.41:1→4.86:1) | **Good** — marginal pass at 0.60 is now comfortable |
| chart-3 #8B9D77→#E07B5F (green→salmon, CVD-safe hue separation) | **Good** — eliminates green-on-green CVD risk |
| Section 1.8 Accent Color Usage Restrictions | **Excellent** — clear decision matrix for where accent colors may/may not appear |
| Success ≈ accent disambiguation rule (§1.4) | **Excellent** — proactively addresses a subtle UX confusion |
| @fontsource self-hosting (replaces Google Fonts CDN) | **Good** — eliminates external dependency, GDPR risk, FOIT |
| Mobile 60-30-10 mapping table (§1.1) | **Good** — addresses mobile-specific zone proportions |
| "Controlled Nature" philosophy threads | Nice — ties design decisions to brand archetype consistently |

---

## Residual Minor Issues (Non-Blocking)

### r1: Section 4.1 radius Tailwind column inconsistent with new @theme overrides

The @theme block now defines `--radius-md: 8px`, which means `rounded-md` = 8px. But Section 4.1 still maps:

| Token | Value | Section 4.1 Says | @theme Makes It |
|-------|-------|------------------|-----------------|
| `--radius-md` | 8px | `rounded-lg` | `rounded-md` |
| `--radius-lg` | 12px | `rounded-xl` | `rounded-lg` |
| `--radius-xl` | 16px | `rounded-2xl` | `rounded-xl` |

Section 4.1's Tailwind column reflects the OLD TW4 defaults, not the new @theme overrides. With the overrides active, developers should use `rounded-md` for 8px, not `rounded-lg`.

**Fix:** Update Section 4.1 Tailwind column to match the @theme-overridden values: `rounded-sm`=4px, `rounded-md`=8px, `rounded-lg`=12px, `rounded-xl`=16px.

### r2: Appendix B has 3 stale contrast numbers

| Appendix B Claim | Actual (verified) | Issue |
|-----------------|-------------------|-------|
| "Primary 16.5:1" (line ~717) | **16.42:1** | Stale from R1 |
| "Chrome primary 8.72:1" (line ~719) | **6.63:1** | Wrong — no source for 8.72 |
| "Warning 5.91:1" (line ~721) | **5.02:1** (white on #b45309) or **4.74:1** (on cream) | Wrong — neither matches 5.91 |

**Fix:** Update Appendix B to match verified Section 1.x values.

---

## Scoring (R2)

| Criterion | R1 | R2 | Notes |
|-----------|----|----|-------|
| Tailwind v4 config validity | 7 | **9** | @theme complete with radius overrides, clear @theme vs var() guidance. Only Section 4.1 table mismatch. |
| CSS variable naming | 8 | **9** | `corthex-*` namespace excellent + theme.css migration strategy + coexistence alignment |
| Bundle impact | 6 | **8** | @subframe/core Phase 4 removal plan, @fontsource self-hosting, Lucide pinning |
| Token completeness | 8 | **9** | border-input, accent restrictions, success≈accent disambiguation, mobile 60-30-10 all added |
| Technical accuracy | 7 | **8** | All R2 contrast ratios verified correct. Only Appendix B has 3 stale numbers. |
| **Average** | **7.2** | **8.6** | |

---

## Verdict: **PASS — Grade A (8.6/10)**

All 3 Major and 5 Minor issues from R1 are resolved. R2 introduced substantial bonus improvements (border-input, accent-hover fix, handoff fix, @fontsource, mobile 60-30-10, accent usage restrictions) that go beyond the requested fixes.

Two non-blocking residual issues (r1: Section 4.1 radius column, r2: Appendix B stale numbers) should be cleaned up but do not block Grade A.

---

*End of tech-perf R2 review — Phase 3-1 PASSED*
