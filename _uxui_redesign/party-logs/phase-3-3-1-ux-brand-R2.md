# Phase 3, Step 3-1 — Critic-A (UX & Brand) R2 Verification

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-3-design-system/design-tokens.md` (R2)
**Date:** 2026-03-23
**R1 Score:** 8.25/10 (4 blocking, 3 important, 4 minor)
**Fixes Claimed:** 17 total (B1-B4 mine + a11y blockers + tech-perf M1-M3)

---

## Blocking Issue Verification

### B1. Font CDN → @fontsource — RESOLVED ✅

**R1:** §2.1 said "CDN: Google Fonts" for all fonts.
**R2:** §2.1 now reads:
- `@fontsource/inter` (self-hosted, no external CDN)
- `@fontsource/jetbrains-mono` (self-hosted)
- `@fontsource-variable/noto-serif-kr` (self-hosted)

Plus concrete import examples in `main.tsx` code block and a self-hosting rationale note (GDPR, FOIT/FOUT, reliability). Tailwind config comment updated to "self-hosted via @fontsource". Phase 2 critical fix #4 fully honored.

### B2. Accent-Primary Text Usage Restriction — RESOLVED ✅

**R1:** Listed 4.14:1 on cream — fails WCAG AA for normal text.
**R2:** Recalculated to **5.35:1** (verified via WCAG sRGB formula). My R1 estimate of 4.14:1 was incorrect — I acknowledge this error. 5.35:1 passes WCAG AA for all text sizes.

However, the writer went beyond mere correction and added the excellent **§1.8 Accent Color Usage Restrictions** table — a comprehensive matrix of every accent usage context with verified ratios and allow/deny status. The link style rule (`accent-secondary` #5a7247 + underline for body links, `accent-primary` for buttons) is a smart design decision that maintains visual distinction between interactive text and button accent even though both technically pass contrast. This is design maturity, not just compliance.

**Correction note:** I owe the writer an apology on the contrast math. The R2 value of 5.35:1 aligns with my independent sRGB calculation (~5.40:1). My R1 assertion of 4.14:1 was a significant error that incorrectly flagged a passing color as failing.

### B3. Accent-Hover White Text Contrast — RESOLVED ✅

**R1:** `#7a8f5a` (lighter hover) — white text ≈ 3.37:1, likely fails.
**R2:** Changed to `#4e5a2b` — **7.44:1 white-on** (confirmed) and **7.02:1 on cream**.

This is a direction reversal: R1 had buttons LIGHTENING on hover (7a8f5a > 606C38 in luminance), R2 has buttons DARKENING (4e5a2b < 606C38). The darkening direction is actually **better for the brand**: pressing a button should feel like pressing into earth — darker, denser, more grounded. This aligns with the "Controlled Nature" philosophy where interaction reveals the deeper layer, not the lighter surface. Excellent fix that improves both accessibility AND emotional tone.

### B4. Sidebar Collapse Animation — RESOLVED ✅

**R1:** §5.3 animated width (280px ↔ 64px), contradicting §5.1's "never animate layout-triggering properties."
**R2:** §5.3 now reads: `translateX(0) + opacity(1)` ↔ `translateX(-216px) + opacity(0)` for nav labels; icon column stays fixed at 64px. Parenthetical explicitly cites §5.1 rule.

Math check: 280px - 64px = 216px ✓. The approach (icon column stays, text labels translate out + fade) is clean, performant, and eliminates the layout-trigger violation. No internal contradiction remains.

---

## Non-Blocking Issue Verification

### N1. Archetype → Token Rationale — RESOLVED ✅

§1.1 now has a 3-row "Archetype → Color Mapping (Vision §9.4)" table:
- Ruler → Dark olive sidebar (authority, command)
- Sage → Cream content area (wisdom, parchment)
- Ruler+Sage tension → Sage accent (where control meets growth)

The prose rationale is evocative and meaningful: *"Dense, grounding, like dark earth beneath a structured garden"* (Ruler), *"Open, warm, like aged paper where insights are recorded"* (Sage). This gives developers the WHY behind the tokens.

### N2. Mobile 60-30-10 — RESOLVED ✅

§1.1 now has "60-30-10 on Mobile" table mapping each zone to its mobile expression. Key decision: bottom nav is part of the 60% cream zone, NOT 30% chrome. The olive 30% appears only when the drawer is open. Rationale: *"preserves the 'open sky' metaphor on mobile — the CEO sees expansive content, not structural chrome."*

This is a defensible design choice. Alternative (olive bottom nav) would have made mobile feel heavier. The "open sky" metaphor maintains brand warmth on the platform where the CEO is most likely to be casual/mobile.

### N3. "Controlled Nature" Threading — RESOLVED ✅

Every remaining section now opens with a "Controlled Nature in [topic]" paragraph:
- §2.1 Typography: Inter = Structure/Ruler, JetBrains Mono = Precision/Sage, Noto Serif KR = Organicism
- §3 Spacing: 8px grid = Structure, 5:1 ratios = Fibonacci/natural growth patterns
- §4 Borders: Flat + honest borders = Arts & Crafts, radius progression = precision→organicism
- §5 Motion: Instant route swap = Structure, status pulse = breathing organism
- §6 Icons: Uniform 2px stroke = Structure, currentColor inheritance = Organicism/adaptation

These are not filler — each mapping is specific and defensible. The radius progression metaphor (4px tight precision → 9999px human face) is particularly elegant.

---

## Minor Issue Verification

### m1. Handoff Purple Justification — PARTIALLY RESOLVED ⚠️

Color darkened from #a78bfa (2.57:1 FAIL) to #7c3aed (5.38:1 PASS) — excellent fix. But the note says only *"Maintains purple identity for delegation events."* Still missing the max-hue-distance rationale. Very minor — not blocking.

### m2. text-5xl Deviation Note — RESOLVED ✅

§2.2 usage column now reads: "Landing hero override (Phase 2 recommendation: 48px for landing)."

### m3. Z-Index 30 Collision — NOT ADDRESSED ⚠️

Three elements still share z-30 (overlay-backdrop, bottom-nav, fab). Acceptable in practice since backdrop covers full screen, but stacking within the tier is undefined. Truly minor.

### m4. Missing --bg-input Token — PARTIALLY RESOLVED ⚠️

`--border-input` (#908a78, 3.25:1) was added for input boundaries — addressing WCAG 1.4.11. But the input BACKGROUND color question (white vs cream vs surface) remains unanswered. Developers will likely default to white for typing contrast, which breaks the Natural Organic warmth. Recommend defining `--bg-input: #ffffff` or `--bg-input: #faf8f5` in Phase 3-2 component strategy.

---

## Additional Fixes Observed (from other critics)

These fixes were not in my R1 review but strengthen the document:

| Fix | Before | After | Impact |
|-----|--------|-------|--------|
| Chrome-dim alpha | 0.60 (3.41:1 FAIL) | 0.80 (4.86:1 PASS) | a11y — sidebar dim text now AA compliant |
| Handoff color | #a78bfa (2.57:1 FAIL) | #7c3aed (5.38:1 PASS) | a11y — was the worst contrast failure in R1 |
| Chart-3 | #8B9D77 sage (CVD-unsafe green pair with chart-1) | #E07B5F salmon/coral | CVD — 4 distinct hue families now |
| Border-input token | (not defined) | #908a78 (3.25:1) | WCAG 1.4.11 — input boundaries now compliant |
| Badge contrast | Unverified | 2.67:1 + triple redundancy (shape+text+ring) | Documented mitigation for red-on-olive |
| Success ≈ Accent rule | Not addressed | Mandatory disambiguation (icon+text vs bg tint) | Prevents 1.14:1 same-family green confusion |
| Subframe migration | Not addressed | Appendix A-2: deprecate-in-place strategy | Clarifies dual token system coexistence |
| TW4 @theme vs CSS var | Not explained | Explanatory note in §8.1 | Developer clarity on which tokens generate utilities |
| Border radius TW overrides | Not documented | Explicit diff from TW4 defaults | Prevents developer confusion (our sm ≠ TW sm) |
| Content-max 1160→1440 | Missing from diff | Documented in Appendix A | 24% layout width increase now explicit |
| All contrast ratios | Some unverified | All marked "(verified)" | Systematic verification pass — trustworthy |

The Success ≈ Accent disambiguation rule (§1.4) is particularly valuable — catching that #4d7c0f and #606C38 are only 1.14:1 apart and mandating icon+text differentiation is a proactive accessibility catch that no WCAG scanner would flag.

---

## R2 Score Breakdown

| Focus Area | R1 Score | R2 Score | Delta | Key Improvements |
|-----------|----------|----------|-------|-----------------|
| **Brand Consistency** | 8/10 | **9.5/10** | +1.5 | Archetype mapping, @fontsource, accent usage table, "Controlled Nature" threading |
| **60-30-10 Rule** | 9/10 | **9.5/10** | +0.5 | Mobile adaptation table, "open sky" rationale |
| **Typography Pairing** | 8/10 | **10/10** | +2.0 | @fontsource with imports, self-hosting rationale, deviation documented |
| **Emotional Tone** | 8/10 | **9/10** | +1.0 | Archetype table, philosophy threading in all sections, hover-darkens metaphor |
| **WEIGHTED AVERAGE** | **8.25/10** | **9.5/10** | **+1.25** | |

### Score Justification

**Brand Consistency 9.5:** Every Vision Identity value reproduced. Archetype rationale table bridges WHY to WHAT. @fontsource honors Phase 2. Accent usage matrix prevents misapplication. Only deduction: handoff purple justification is minimal (-0.5).

**60-30-10 Rule 9.5:** Desktop zones impeccable. Mobile adaptation is thoughtful with "open sky" defense. Three-tier background justified. Only deduction: tablet breakpoint zone behavior not explicitly mapped (-0.5).

**Typography Pairing 10:** Cannot find fault. @fontsource with concrete imports. Two-font rule. Weight hierarchy. Korean fallback chain. Golden ratio analysis. Philosophy connection. text-5xl documented deviation. This section is exemplary.

**Emotional Tone 9:** "Controlled Nature" now threads through every section with specific, non-generic metaphors. The hover-darkening (pressing into earth) is a brand-aligned improvement. Sidebar collapse uses transform (no more self-contradiction). Deductions: z-index collision undocumented (-0.5), input background unspecified leaves a tonal gap (-0.5).

---

## Verdict

**CLEAN PASS — 9.5/10**

All 4 blocking issues resolved. All 3 non-blocking important issues addressed. Most minor issues fixed. 11 additional fixes from other critics further strengthen the document.

**Remaining minor items (non-blocking, can carry to Phase 3-2):**
1. Handoff purple: add 1-line hue-distance justification
2. Z-index 30 tier: document stacking order within tier
3. Input background: define `--bg-input` token in component strategy

This design tokens document is now production-ready. The systematic contrast verification, the "Controlled Nature" philosophy threading, and the comprehensive accent usage restrictions make this one of the strongest design token specs I've reviewed in this pipeline.

**R1 → R2 improvement: 8.25 → 9.5 (+1.25 points).** Grade A confirmed.

---

*Critic-A (ux-brand) — Phase 3, Step 3-1 R2 Verification Complete*
