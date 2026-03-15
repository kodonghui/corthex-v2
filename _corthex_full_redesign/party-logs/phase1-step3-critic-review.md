# Phase 1 — Step 3 Critic Review
**File Reviewed:** `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md`
**Reference:** `_corthex_full_redesign/context-snapshots/phase-0-step-2-snapshot.md`
**Date:** 2026-03-15
**Reviewer:** Combined Critic-A + Critic-B + Critic-C

---

## CRITIC-A — UX + Brand

### Alignment: Sovereign Sage Archetype
Overall structure and dark-hero-first approach strongly matches the Sovereign Sage archetype. All three concepts project authority, intelligence, and premium positioning. The product-first hero of Concept A is on-brand for a Ruler/Sage combination — it commands the visitor with competence rather than asking for their attention.

### Issue A-1 (BLOCKING): Typography Contradicts Phase 0 Final Decision
**Severity: Critical**

The research document builds all three concepts on **Geist (display) + Pretendard (body)**. However, Phase 0 Step 2 explicitly finalized:
- **Inter** — primary typeface (all display and body)
- **JetBrains Mono** — technical/code contexts only
- Rationale: Vignelli 2-typeface constraint. "Inter handles mixed Korean/Latin at small sizes better than Pretendard."
- Both Geist and Pretendard are **rejected fonts** per the final vision.

The alignment table in Part 4 shows `Geist display font ✓` and `Pretendard body ✓` — but these were not in scope for the Phase 0 final output. This appears to reference an earlier draft of Phase 0, not the v2.0 final. Every code spec in all three concepts must be re-checked and updated to use Inter throughout, JetBrains Mono for the eyebrow in Concept C only.

**Impact:** Hero H1 specs like `className="font-geist text-6xl..."` are non-deployable as-is. Concept B auth card H2, feature list body copy — all need correcting.

### Issue A-2 (BLOCKING): CTA Color System Mismatch
**Severity: Critical**

All three concepts use `bg-indigo-600 hover:bg-indigo-700` as the primary CTA color. Phase 0 Step 2 changed the primary accent to:
- **Primary action: `bg-cyan-400 text-slate-950`** (filled)
- **Secondary: `border border-cyan-400/50 text-cyan-400`** (outlined)
- **Exception: Login page only** — `indigo-600` CTA retained

The question for Phase 2 is: does the "login exception" extend to the landing page hero CTAs? If the landing page hero CTA is "무료로 시작하기" (not login), it should be `cyan-400`, not `indigo-600`. The indigo CTAs in all three concepts are likely wrong for the primary hero action.

Note: The final CTA in Concept B uses `bg-indigo-600` for the full-width block — this is clearly wrong per Phase 0. Only the auth-card login button warrants the `indigo-600` exception.

### A-Positive Findings
- <5-second value communication works for all concepts. Concept A's "AI 조직을 설계하고, 지휘하라" is the strongest — imperative verb form aligns with "Command, Don't Chat" principle.
- Dark hero → light body transition is well-justified: cold visitors need product education, light sections aid long-scroll readability, reduces cognitive fatigue after dense hero.
- Feature naming in wireframes (NEXUS, ARGOS, Hub, Handoff) correctly uses the PRD terminology.

---

## CRITIC-B — Visual + A11y

### Issue B-1: Placeholder Text Contrast Fails WCAG AA
**Severity: Moderate**

Concept B auth card input fields specify:
```tsx
placeholder-slate-500  // #64748B
// on bg-slate-800     // #1E293B
```
Contrast ratio: `#64748B` vs `#1E293B` ≈ **3.4:1**.

WCAG AA requires 4.5:1 for text at 14px (the `text-sm` input). Placeholder text at this contrast fails for users with low vision. The spec should use `placeholder-slate-400` (`#94A3B8`) minimum, which yields ~5.5:1 against slate-800.

**Secondary issue:** The auth card's `focus:border-indigo-500` ring is the only focus indicator. No `focus:ring` or `focus-visible` offset specified. Keyboard navigation will produce non-compliant focus visibility.

### Issue B-2: Grid Background Pattern — Phase 0 Conflicts with Hero Spec
**Severity: Moderate**

Phase 0 specifies page background `#020617` (slate-950). Concepts A and C use `bg-zinc-950` which is `#09090B` — a different dark. This is a minor but real divergence from the finalized color token. The grid overlay in Concept A:
```tsx
bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px)...]
```
`#ffffff08` = white at 3.1% opacity on `#09090B` produces grid lines at approximately 0.35 contrast — visually barely present. On the correct `#020617` it would be even lower. The decorative grid needs a minimum opacity of `#ffffff0D` (5%) for the lines to be visible at all without being distracting, and a contrast audit confirming it stays below the 3:1 non-text decorative threshold.

### Issue B-3: Dark-to-Light Gradient Transition (Concept B) — CLS Risk
Concept B uses an 80px gradient band (`bg-gradient zinc-950→slate-50`). Unless this element has a fixed height declared in the initial HTML, it can cause Cumulative Layout Shift as the gradient renders after fonts load. This is both a visual A11y concern (abrupt reflow) and a Core Web Vitals issue (covered further in Critic-C).

### B-Positive Findings
- Concept A's hero contrast is solid: `text-white` / `text-slate-400` (5.5:1) on zinc-950 — both pass AA.
- Secondary button `text-slate-300` on zinc-950 (~8.5:1) — passes AAA.
- The pill badge (`text-indigo-300 bg-indigo-500/10 border-indigo-500/30`) is decorative — contrast check on the text: indigo-300 `#A5B4FC` vs indigo-500/10 on zinc-950 ≈ zinc-950 effective background → ~7.2:1, passes.
- CTA button padding specs (px-6 py-3 = 24×12px) meet minimum touch target guidance of 44px height when font-size base is considered.

---

## CRITIC-C — Tech + Performance

### Issue C-1: Concept C Animation Budget Exceeds Phase 0 Constraints
**Severity: High**

Phase 0 specifies "conservative motion: no parallax/particles/lottie." Concept C includes:
1. **Animated typewriter eyebrow** — `animate-pulse` + cursor blink = technically looping animation on load, not scroll-triggered.
2. **SVG path draw animation** (600ms, architecture flow section) — continuous/triggered SVG animation is not parallax but is architecturally complex and GPU-consuming at scroll time.
3. **Metrics count-up** (800ms IntersectionObserver) — this is within budget, but combined with (1) and (2) the total motion budget per page is exceeded.
4. **Multi-layer radial blur** (`blur-[100px]` + `blur-[80px]` stacked) — two large blur filters in the hero are expensive for GPU compositing, especially on mid-range devices.

Phase 0 explicitly prohibits Lottie and particles, and the "conservative" qualifier means scroll-reveals (150–200ms) and micro-interactions (0.3s hover) only. Concept C's architecture needs a motion audit before it can be considered Phase 0-compliant.

### Issue C-2: Hero Height + Product Preview = LCP/CLS Double Risk
**Severity: Moderate**

Concept A: `min-h-screen` hero (100vh) followed by a product UI preview block (`aspect-[16/9]`, ~480px) containing a placeholder `[NEXUS Canvas Screenshot]`. The LCP candidate for this hero will be either:
- The H1 text (best case) — LCP ≈ fast if fonts are preloaded
- The NEXUS screenshot image (worst case) — LCP depends entirely on asset optimization

If the NEXUS screenshot is loaded as an `<img>` without `loading="eager"` + `fetchpriority="high"` + proper `width`/`height` attributes, it will both delay LCP and cause CLS as the `aspect-[16/9]` wrapper reflowes. The spec does not address image optimization strategy.

Additionally: `shadow-2xl shadow-black/50` on a large container triggers GPU layer promotion. Combined with the grid gradient background div and the radial glow div, Concept A has **3 composited layers** in the hero before the product preview — acceptable but should be noted for performance profiling.

### Issue C-3: Concept B `backdrop-blur-xl` in Critical Viewport
**Severity: Low-Moderate**

The auth card uses `backdrop-blur-xl` (Chrome: `blur(24px)`) on a card that is in the **critical above-the-fold viewport**. Backdrop filters force GPU compositing on all content behind the element. On Chrome desktop this is typically fine; on Safari mobile (<15.4) `backdrop-filter` had significant performance issues. Given CORTHEX is enterprise-targeted (likely desktop-primary), this is low risk but should include a Safari performance check in Phase 7.

### C-Positive Findings
- Concept A's animation specs are cleanly within budget: 200ms fade-up on scroll, 100ms stagger, 0.3s hover transitions — all Phase 0 compliant.
- IntersectionObserver for scroll reveals (Concepts A, B) is the correct implementation pattern — no scroll event listeners.
- All three concepts correctly avoid: parallax, particles, hero video, Lottie.
- `transition-colors duration-150` on CTA hover is optimal — faster than the 200ms scroll transitions, which correctly prioritizes immediate feedback.
- The max-w-5xl / max-w-7xl container constraints ensure content doesn't stretch at 4K+ viewports, preventing runaway line-lengths.

---

## CONSOLIDATED FINDINGS SUMMARY

| ID | Severity | Critic | Issue |
|----|----------|--------|-------|
| A-1 | **BLOCKING** | Brand | Geist + Pretendard used; Phase 0 requires Inter + JetBrains Mono only |
| A-2 | **BLOCKING** | Brand | indigo-600 CTA throughout; Phase 0 changed primary to cyan-400 |
| B-1 | Moderate | A11y | Concept B placeholder-slate-500 fails AA (3.4:1 < 4.5:1); missing focus-visible rings |
| B-2 | Moderate | Visual | Grid overlay contrast too low (<0.35); zinc-950 vs slate-950 background mismatch |
| C-1 | High | Perf/Motion | Concept C animation stack exceeds Phase 0 conservative budget |
| C-2 | Moderate | Perf/LCP | Hero product preview image strategy unspecified; LCP/CLS risk unmitigated |
| C-3 | Low | Perf | Concept B backdrop-blur-xl in critical viewport; Safari risk unaddressed |
| B-3 | Low | A11y/CLS | Concept B gradient transition band needs fixed height to prevent CLS |

### Required Before Phase 2 Proceeds
1. **Update all font references**: `font-geist` → `font-inter`, `Pretendard` → `Inter` throughout all concept specs
2. **Update all primary CTA colors**: `bg-indigo-600 hover:bg-indigo-700` → `bg-cyan-400 hover:bg-cyan-500 text-slate-950` for non-login actions
3. **Clarify scope of indigo-600 exception**: Does it cover the embedded auth card in Concept B only, or all hero CTAs?
4. **Concept C motion audit**: Remove typewriter animation (non-scroll-triggered), reduce SVG animation scope

---

## FINAL SCORE

**Raw Scores:**
- Research Depth & Reference Quality: 9.5/10
- Concept Structural Soundness: 8.0/10
- Phase 0 Spec Alignment: 5.0/10 ← dragged down by font + CTA issues
- A11y Coverage: 7.0/10
- Implementation Feasibility: 8.0/10

**Combined Score: 7.0 / 10 — MARGINAL PASS**

The research quality is genuinely excellent — 10+ referenced sources, industry pattern analysis, detailed wireframes with working TSX code, and accurate Phase 0 compliance checks on structure/motion. The two BLOCKING issues (font and CTA color) do not invalidate the research direction but **must be corrected in the concept specs before Phase 2 wireframing begins**.

Winning concept confirmed as **Concept A "The Command Bridge"** — proceed with required corrections.
