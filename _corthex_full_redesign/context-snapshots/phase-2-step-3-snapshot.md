# Phase 2-3 Context Snapshot — Landing Analysis Critic Review

**Date:** 2026-03-15
**Status:** MARGINAL FAIL (6.8/10 — threshold 7.0)
**Output:** `_corthex_full_redesign/party-logs/phase2-step3-critic-review.md`

---

## Winning Concept Confirmation

**Concept A — "The Command Bridge" (53/60)** confirmed as winner.

- Concept B (42/60) rejected: split-attention hero, auth-before-education pattern unsuitable for cold traffic
- Concept C (51/60) strong alternative: purest Sovereign Sage expression, but higher implementation complexity (animated SVG, tabs, count-up) makes it risky for Stitch generation pipeline
- Concept B's auth card pattern to be reused for dedicated `/login` page design

**Phase 0 "light body" decision upheld.** Concept C's full-dark case is noted but not overriding. Dark hero + light body remains the spec.

---

## Key Specs (Locked)

| Element | Spec | Source |
|---------|------|--------|
| Hero bg | `bg-slate-950` (#020617) | Phase 0 v2.0 |
| Body sections | `slate-50` / `white` alternating | Phase 0 v2.0 |
| Primary CTA (dark bg) | `bg-cyan-400 text-slate-950` | Phase 0 v2.0 |
| Font | Inter (all display + body) | Phase 0 v2.0 |
| Hero H1 | `font-inter text-4xl sm:text-5xl xl:text-7xl font-bold text-white` | Analysis + mobile correction |
| Hero content width | `max-w-4xl` (896px on 1440) = 0.622 ratio | Analysis |
| Scroll transition | `slate-950 -> slate-900 (trust band) -> slate-50` | Analysis |
| Motion budget | fade-up 150-200ms, hover 0.3s, no parallax/particles/lottie | Phase 0 |
| Grid overlay | CSS-only, `rgba(255,255,255,0.05)`, 64px grid | Analysis |
| Hero visual | NEXUS screenshot in browser chrome frame, `rounded-2xl border-slate-800` | Analysis |
| Login placement | Nav-only: ghost "로그인" + primary "시작하기" | Analysis |

---

## Corrections Required Before Phase 3

### Blocking (must resolve)

1. **Light-body CTA color:** `bg-cyan-400` on `slate-50/white` fails (1.27:1). Resolution:
   - Dark backgrounds: `bg-cyan-400 text-slate-950` (keep)
   - Light backgrounds: `bg-slate-900 text-white` (primary), `border border-slate-900 text-slate-900` (secondary)

2. **Focus indicator dual-context:**
   - Dark sections: `focus-visible:ring-offset-slate-950`
   - Light sections: `focus-visible:ring-offset-white`

3. **Landing page architecture:** Separate `packages/landing` in Turborepo monorepo, built with `vite-ssg`, deployed at `/` on same domain. App SPA serves `/hub` and beyond.

### Important (should resolve)

4. **Font loading:** Self-host Inter (woff2) instead of Google Fonts CDN. Korean market latency concern. Inline `@font-face` in critical CSS.

5. **Touch targets:** All mobile interactive elements: `min-h-[44px]` (WCAG 2.2 AAA).

6. **NEXUS hero asset:** Must decide -- real screenshot (preferred), polished SVG, or illustration. Affects LCP strategy and file size budget (target: 150KB webp).

7. **Stitch component boundaries:** Each landing page section must be classified as `stitch-safe`, `stitch-partial`, or `hand-coded`.

### Minor (nice to have)

8. Final CTA band: `bg-slate-900` instead of `bg-indigo-950` for unity.
9. Add one Sage-signaling element to hero (data point or intelligence phrase).
10. Landing JS bundle: tighten to 80KB gzipped (not 200KB app-level budget).

---

## Connections to Phase 3 (Design System / Tokens)

Phase 3 must formalize the following tokens, incorporating critic corrections:

### Color Tokens
```
--color-cta-primary: cyan-400           (dark backgrounds)
--color-cta-primary-text: slate-950     (dark backgrounds)
--color-cta-primary-light: slate-900    (light backgrounds) [NEW]
--color-cta-primary-light-text: white   (light backgrounds) [NEW]
--color-hero-bg: #020617               (slate-950)
--color-body-bg: #F8FAFC               (slate-50)
--color-body-bg-alt: #FFFFFF           (white)
--color-trust-band-bg: #0F172A         (slate-900)
--color-final-cta-bg: #0F172A          (slate-900, not indigo-950) [CHANGED]
```

### Typography Tokens
```
--font-display: Inter (self-hosted woff2) [CHANGED from Google Fonts]
--font-display-weights: 400, 500, 600, 700
--font-mono: JetBrains Mono (technical contexts only)
--font-display-swap: optional [CHANGED from swap for CLS prevention]
```

### Focus Tokens
```
--focus-ring-color: cyan-400
--focus-ring-width: 2px
--focus-ring-offset: 2px
--focus-ring-offset-dark: slate-950
--focus-ring-offset-light: white [NEW]
```

### Interaction Tokens
```
--touch-target-min: 44px [NEW]
--landing-js-budget: 80KB gzipped [NEW]
--hero-image-budget: 150KB webp
```

### Component Classification for Stitch (Phase 6)
```
stitch-safe:    Hero text block, feature cards, trust logos, social proof, footer
stitch-partial: Sticky nav (visual from Stitch, scroll behavior hand-coded)
hand-coded:     Scroll animations (IntersectionObserver), CTA analytics hooks
```

---

## Score Path to PASS

Current: 6.8/10.
If blocking corrections 1-3 are applied to the analysis before Phase 3 begins: estimated 7.2/10 (PASS).

The analysis document itself is NOT modified (per review rules). Corrections are carried forward as Phase 3 input requirements.

---

_Snapshot complete. Phase 3 (Design System) should consume this snapshot as its primary input alongside the Phase 0-2 and Phase 2 summary snapshots._
