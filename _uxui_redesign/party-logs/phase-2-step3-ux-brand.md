# Phase 2, Step 2-3 — Critic-A (UX & Brand) Review

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-2-analysis/landing-analysis.md`
**Date:** 2026-03-23
**Grade Step:** A (rigorous)

---

## Overall Assessment

**Verdict: CONDITIONAL PASS — 4 issues must be addressed (1 Major, 3 Minor)**

The landing analysis is the strongest of the three Phase 2 documents. The Agent Showcase section analysis is the document's crown jewel — it identifies CORTHEX's genuine differentiator and evaluates it with appropriate depth (Big Five personality, observation→reflection→planning memory cycle, performance tracking). The sticky header CTA analysis with scroll-depth retention table (§3.6) quantifies the conversion advantage clearly. The `prefers-reduced-motion` handling (§3.7 CSS) and ARIA tablist spec are production-ready accessibility implementations.

Option C "Natural Organic Storyteller" recommendation at 50/60 (83.3%) with 8-point lead is well-supported and the scoring is defensible for a landing page context. However, the zero-variance pattern recurs for the third consecutive time, and several empirical claims lack verification.

---

## MAJOR Issues (Must Fix)

### M1. Option B Zero-Variance Scoring — THIRD Consecutive Occurrence (σ=0.00)

**Location:** §2.1-2.6, §4 Comparison Matrix

Option B scores **exactly 7/10 in all 6 categories** (σ=0.00). This is the identical pattern flagged and corrected in:
- **Web Analysis R1 (M1):** Option B all 7/10 → Fixed in R2 to σ=0.63
- **App Analysis R1 (M1):** Option A all 6/10 → Fixed in R2 to σ=0.75
- **Landing Analysis R1 (M1):** Option B all 7/10 → **Not yet fixed**

Three consecutive zero-variance occurrences in three documents is a systematic methodology failure, not an oversight. The writer demonstrably knows how to fix this (both R2 revisions showed honest variance) but defaults to anchored scoring in first drafts.

**Evidence of non-independent scoring:**
- §2.2 Hierarchy: The Before/After section creates an "explicit narrative hierarchy" with visual weight differentiation (muted BEFORE with ✗ items vs sage-accented AFTER with ✓ items). This is described as a "key strength" — yet Hierarchy scores the same 7 as every other category. The Before/After hierarchy is a genuine improvement over Option A's flat feature grid and should score higher than Option A's Hierarchy (6). It does — but by exactly +1, the same +1 applied to every single category.
- §2.6 UX: The writer explicitly identifies "no mid-page CTAs is a conversion gap" as a weakness. A category with an explicitly identified weakness should not score identically to categories without identified weaknesses (Gestalt, Golden Ratio).
- §2.5 White Space: "Section padding consistent at 96px" is identical to Option C's treatment. If Options B and C share the same section padding, why does B score 7 and C score 8? The delta should come from a specific difference (C's narrower 1200px max-width, C's cross-product unity with app sidebar palette) — but the analysis doesn't articulate what subtracts from B's White Space.

**Fix:** Re-evaluate Option B categories independently. Expected realistic distribution:

| Category | Current | Expected | Rationale |
|----------|---------|----------|-----------|
| Gestalt | 7 | 7 | Narrative sections well-grouped, Before/After closure strong |
| Hierarchy | 7 | **8** | Before/After + feature tabs create genuine hierarchy depth |
| Golden Ratio | 7 | 7 | Feature tab 1:1 ratio, consistent rhythm |
| Contrast | 7 | **6** | No sage gradient, no olive bookend — flat cream→surface only |
| White Space | 7 | 7 | Consistent padding, testimonial carousel adequate |
| UX | 7 | **6** | No sticky CTA = conversion gap (writer's own finding); no mid-page conversion point |

Expected total: ~41 (σ=0.75). Direction unchanged, but variance is honest.

---

## MINOR Issues (Should Fix)

### m1. Sticky Header Conversion Lift Claim Unverified

**Location:** §3.6, §6 Sources

The document states: *"This pattern is used by Vercel, Stripe, and Linear — proven to increase conversion by 15-25% over non-sticky headers."* (§3.6) and repeats in §6 Sources: *"Sticky header CTA: 15-25% conversion lift (Stripe, Vercel pattern)"*.

This is a specific quantitative claim (15-25%) attributed to named companies (Stripe, Vercel) but:
- No source link or study reference provided
- No WebSearch verification performed
- "Proven" is a strong word for an uncited claim

Per CLAUDE.md: *"기술 결정/라이브러리 선택/아키텍처 패턴 논의 시 반드시 WebSearch로 최신 정보 확인."* Design pattern claims with specific percentages are empirical assertions that should be verified or qualified.

**Fix:** Either verify the 15-25% range with a WebSearch and cite the source, or soften the language to "commonly reported to increase conversion" without a specific percentage.

### m2. No Dedicated "Controlled Nature" Evaluation Section

**Location:** Entire document (absent)

The web analysis R2 added a new §4C "Controlled Nature" evaluation after I flagged it in R1 (m2). This section systematically evaluated how each option expresses the tension between **structure** (precision, grid, systematic) and **organicism** (natural materials, warmth, growth) — the brand's core design philosophy from Vision §2.3.

The landing analysis mentions "Controlled Nature" only once — in Option C's philosophy intro: *"Controlled Nature expressed in every section."* This is an assertion, not an evaluation. For cross-document consistency and brand fidelity, a landing-specific evaluation should exist.

**Suggested content:**
- **Structure on landing:** Grid layouts, CTA hierarchy, consistent section rhythm, type scale progression
- **Organicism on landing:** Sage radial gradient "glow," cream↔surface wave (natural color alternation), scroll reveal "rising to meet the reader" animation, olive section as "earth zone"
- **Per-option evaluation:** Which option best expresses the Structure↔Organicism tension? (Option A = all structure; Option B = structure + narrative warmth; Option C = structure + gradient warmth + scroll organicism)

**Impact:** Does not affect scoring or recommendation. Improves brand fidelity analysis and cross-document consistency.

### m3. Agent Showcase Retention Claim Unverified

**Location:** §3.6 UX, line ~798

*"This novelty increases engagement and may improve retention at the 170vh mark by 5-10%."*

The "may" qualifier is appropriate, but attaching a specific range (5-10%) to an unverified, speculative assertion creates false precision. Without A/B test data or industry benchmarks for "novel section types," this number is fabricated.

**Fix:** Remove the specific percentage: *"This novelty may improve engagement and retention at the 170vh scroll depth"* — the qualitative claim is sound, the quantitative claim is not.

---

## Positive Findings (What Works Well)

### P1. Agent Showcase — The Differentiator Analysis
The Agent Showcase section (§3.1 Proximity, §3.2 Hierarchy, §3.6 UX) is the strongest competitive analysis in all three Phase 2 documents. It correctly identifies that no competitor (CrewAI, Dify, Langflow, Relevance AI) shows agents with personality, memory, or hierarchy on their landing page. This is genuine differentiation, not marketing fluff.

### P2. Scroll-Depth Retention Table
The retention analysis table (§3.6) mapping visitor retention percentage to CTA availability at each scroll position is exactly the kind of quantitative UX analysis that elevates this document. The "Header CTA" column showing "available" at every row makes the sticky header advantage visually undeniable.

### P3. Scroll Reveal Accessibility
The `prefers-reduced-motion` media query (§3.7 CSS) that disables all scroll-reveal animation is correct and production-ready:
```css
@media (prefers-reduced-motion: reduce) {
  .reveal → opacity-100 translate-y-0 transition-none
}
```
This meets WCAG 2.1 SC 2.3.3 (Animation from Interactions). Many landing page implementations miss this.

### P4. Korean-First Hero Copy
"당신의 AI 조직, 살아있고 책임지는" matching Vision §1.3 verbatim is the only option where the hero copy IS the brand promise rather than a paraphrase of it. This is a genuine brand fidelity strength.

### P5. Component Tree Quality
The TypeScript interfaces (`AgentCardProps`, `FeatureTab`, `CompareCardProps`) are well-typed and production-ready. The `useScrollReveal` hook with `IntersectionObserver` is the correct lightweight approach — no heavy scroll libraries.

### P6. Feature Tab Korean Labels
The feature tabs use Korean labels (허브, 대시보드, NEXUS, OpenClaw, 워크플로우) with English brand terms kept where appropriate (NEXUS, OpenClaw). This is consistent with the Korean-first mandate and the hybrid approach established in web analysis R2.

---

## Score Verification

Writer's scores for Option C: Gestalt 9, Hierarchy 9, Golden Ratio 8, Contrast 8, White Space 8, UX 8 = **50/60**

My assessment:

| Category | Writer | ux-brand | Delta | Rationale |
|----------|--------|----------|-------|-----------|
| Gestalt | 9 | 9 | 0 | 8-section proximity, Agent Showcase grouping, no sidebar-dominance issue (landing has no sidebar) |
| Hierarchy | 9 | 9 | 0 | Sticky header CTA (always visible), 4 CTA placements, Agent Showcase hero+support hierarchy, temporal scroll-reveal hierarchy |
| Golden Ratio | 8 | 8 | 0 | Hero near golden split, consistent 96px rhythm, type scale 40→24→20→16 settling progression |
| Contrast | 8 | 8 | 0 | Sage gradient adds hero warmth, cream↔surface↔olive wave, CTA inverted bookend |
| White Space | 8 | 8 | 0 | 1200px max-width creates premium breathing room, consistent section padding, highest cross-product unity |
| UX | 8 | 8 | 0 | Sticky CTA eliminates conversion gap, Agent Showcase novelty, SSG performance, good mobile adaptation |
| **TOTAL** | **50** | **50** | **0** | **Agree — strongest Option C performance across all three analyses** |

**Note:** Landing page Gestalt 9/10 is justified where web/app Gestalt 9/10 was not. The web/app analyses had a shared sidebar-dominance figure/ground issue that applied to all options but was only penalized in A/B. The landing page has no persistent sidebar — each section uses full-width background alternation for clear figure/ground. The 9/10 reflects a genuinely near-perfect Gestalt implementation on this page type.

---

## Verdict

**CONDITIONAL PASS.** The analysis is strong and Option C recommendation is correct. The scoring is the most defensible of the three Phase 2 documents — I agree with all Option C scores. Address M1 (Option B zero-variance, third occurrence) before promoting to Phase 3. Minor issues can be resolved in Phase 3 design spec.

| Priority | Issue | Impact |
|----------|-------|--------|
| **M1** | Option B zero-variance (σ=0.00) — 3rd occurrence | Methodology credibility (systematic, not accidental) |
| m1 | Sticky header conversion claim unverified | Source integrity |
| m2 | No "Controlled Nature" evaluation section | Cross-document consistency |
| m3 | Agent Showcase retention percentage unverified | Claim precision |

---

*Critic-A (ux-brand) — Phase 2, Step 2-3 Review Complete*
