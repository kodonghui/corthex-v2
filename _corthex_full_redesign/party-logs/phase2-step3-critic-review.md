# Phase 2-3 Critic Review — Landing Page Deep Analysis

**Date:** 2026-03-15
**Input:** `_corthex_full_redesign/phase-2-analysis/landing-analysis.md`
**Context:** Phase 0-2 snapshot (brand decisions), Phase 1-3 snapshot (landing research review)

---

## Critic-A: UX + Brand

### Issue A1 (MEDIUM) — Sovereign Sage "Sage" Dimension Underserved in Concept A Hero

The analysis correctly identifies that Concept A's hero headline ("AI 조직을 설계하고, 지휘하라") skews Ruler but lacks a Sage signal. However, the analysis then dismisses this as "addressed in body feature sections." This is insufficient. Phase 0 defined Sovereign Sage as a dual archetype — both halves must appear above the fold. A visitor who does not scroll (bounce rate baseline: 40-60% for enterprise SaaS) receives only the Ruler half of the brand.

**Required correction:** Add a Sage-signaling element to the hero without disrupting the Ruler composition. Options:
- A single data point below the subtext (e.g., "2,400+ AI sessions processed" -- borrowed from Concept C's metrics approach)
- A brief intelligence-signaling phrase integrated into the subtext (e.g., adding "자동 학습하는" before "AI 에이전트")

This is not a blocking issue but must be addressed in Phase 3 wireframing.

### Issue A2 (HIGH) — CTA Color on Light Body Sections Is Unresolved, Not Just Identified

The analysis identifies the critical problem: `bg-cyan-400` on `slate-50/white` body backgrounds has 1.27:1 contrast ratio, failing WCAG. The analysis then says "Phase 2 wireframing must address this." But this IS Phase 2. The analysis should have proposed the definitive solution, not deferred it again.

The correct resolution, consistent with Phase 0:
- **Dark backgrounds (hero, final CTA):** `bg-cyan-400 text-slate-950` (9.1:1 -- AAA)
- **Light backgrounds (body sections):** `bg-slate-900 text-white` (16.8:1 -- AAA) for primary CTAs, `border border-slate-900 text-slate-900` for secondary CTAs
- This maintains cyan-400 as the accent color in dark contexts while providing accessible alternatives in light contexts

This must be locked before Phase 3 design tokens are created. **Blocking.**

### Issue A3 (LOW) — Final CTA Band Color Indecision

The analysis flags `bg-indigo-950` for Concept A's final CTA section as a unity concern (new background color not present elsewhere), then defers the decision. Concept C proposes `gradient indigo-950 to slate-950`. Neither is resolved. The simplest unity-preserving answer: use `bg-slate-900` for the final CTA band, which is already in the dark surface progression (slate-950 / slate-900 / slate-800). This avoids introducing a fourth background tone.

---

## Critic-B: Visual + Accessibility

### Issue B1 (HIGH) — WCAG Focus Indicator Spec Incomplete Across Contexts

The analysis mentions focus-visible rings as a Phase 1-3 correction to apply but never specifies the ring-offset color for light body sections. The Phase 1-3 snapshot defined: `focus-visible:ring-offset-slate-950` — this is correct for the dark hero but produces an invisible offset on `slate-50/white` body backgrounds.

**Required spec:**
- Dark sections: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`
- Light sections: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white`

Phase 3 tokens must include both variants. **Blocking for a11y compliance.**

### Issue B2 (MEDIUM) — Touch Target Sizes Not Specified for Mobile

The analysis provides mobile breakpoint recommendations for font scaling and grid collapse but never specifies touch target sizes. WCAG 2.2 Success Criterion 2.5.8 requires minimum 24x24px target size (AA), with 44x44px recommended (AAA). The CTA buttons (`px-6 py-3` = approximately 48x24px padding on default text) likely meet minimum on desktop, but on mobile with `w-full`, the height may be insufficient.

**Required spec:**
- All interactive elements on mobile: minimum `min-h-[44px]` (AAA target)
- CTA buttons: `py-3` (12px top + 12px bottom + ~20px text = 44px) -- borderline. Recommend `py-3.5` or explicit `min-h-[44px]`
- Nav links on mobile: ensure hamburger menu items have `min-h-[44px]` with adequate spacing

### Issue B3 (MEDIUM) — Hero NEXUS Screenshot Alt Text Is Good But Image Strategy Is Undefined

The analysis provides excellent alt text: `"CORTHEX NEXUS 조직도 -- AI 에이전트 노드와 핸드오프 체인"`. However, the analysis never resolves whether the NEXUS hero image is:
1. A real app screenshot (preferred per analysis)
2. A polished SVG composition
3. A static illustration

Each has different a11y implications:
- Real screenshot: may contain small text that is unreadable at hero scale -- decorative elements inside the screenshot need not be accessible, but the alt text must compensate
- SVG composition: if interactive elements exist inside the SVG, they need individual ARIA labels
- Static illustration: simplest a11y profile

This decision affects LCP strategy, file size budget (150KB webp target mentioned), and a11y compliance. Must be resolved before Phase 3.

### Issue B4 (LOW) — font-display: swap CLS Risk Underdiscussed

The analysis mentions `font-display: swap` for Inter in the CLS section but does not address the known CLS risk: swap causes a visible font change when the web font loads, replacing the fallback system font. For Inter loaded from Google Fonts, the fallback (typically Arial or system-ui) has different metrics, causing text reflow.

**Mitigation (should be in Phase 3):**
- Use `font-display: optional` instead of `swap` -- if Inter fails to load within ~100ms, the fallback is used permanently (zero CLS)
- Or self-host Inter with `size-adjust` CSS descriptor to match fallback metrics
- Given the Korean text content, system font fallback differences are more pronounced (CJK font metrics vary significantly)

---

## Critic-C: Tech + Performance

### Issue C1 (HIGH) — Static Site Strategy Contradicts Current Architecture

The analysis recommends `vite-ssg` for static pre-rendering. However, the CORTHEX app is a React+Vite SPA (per MEMORY.md: "app (React+Vite SPA)"). Adding `vite-ssg` to an existing SPA requires:
1. Restructuring the router to support static generation
2. Ensuring all landing page components are SSR-compatible (no `window`/`document` references at module level)
3. Separating the landing page bundle from the app bundle

The analysis does not address whether the landing page lives in the `app` package or as a separate package in the monorepo. This architectural decision affects:
- Build pipeline (Turborepo task dependency)
- Deployment (same Cloudflare origin or separate?)
- Bundle splitting (landing JS must not include app dependencies)

**Recommendation:** The landing page should be a separate package (`packages/landing`) in the Turborepo monorepo, built with `vite-ssg`, deployed to the same domain at `/`. The app SPA serves `/hub`, `/nexus`, etc. This is a Phase 3 architecture decision that must be explicit.

### Issue C2 (MEDIUM) — Font Loading Strategy Has a Latency Gap

The analysis specifies Google Fonts CDN for Inter:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
```

This introduces two problems:
1. **DNS + TCP + TLS overhead:** Two external connections (fonts.googleapis.com + fonts.gstatic.com) add ~100-200ms on first visit
2. **Render blocking:** Preloading as `style` means the CSS must be fetched before rendering -- if Google Fonts CDN is slow (it has been known to be slow in Korea), LCP is directly impacted

**Better approach for performance:**
- Self-host Inter (download woff2 files, serve from same origin)
- Inline the `@font-face` declarations in critical CSS
- Eliminates external DNS resolution entirely
- Reduces LCP by ~100-200ms for Korean visitors

This is especially important given the Korean target market -- Google Fonts CDN latency to Korea can be higher than to US/EU.

### Issue C3 (MEDIUM) — Stitch Generation Boundaries Not Defined

The analysis mentions Google Stitch as the React generation tool (Phase 6) but does not define which parts of the landing page are Stitch-generated vs. hand-coded. This matters because:
- Stitch generates components from design inputs -- it needs clear component boundaries
- Interactive elements (sticky nav scroll behavior, tab switching in Concept C, IntersectionObserver animations) likely cannot be Stitch-generated
- The analysis provides raw Tailwind class strings that Stitch may or may not preserve

**Required for Phase 3:** A component decomposition that marks each section as:
- `stitch-safe`: Pure visual, no interactivity (hero text, feature cards, footer)
- `stitch-partial`: Visual structure from Stitch, behavior hand-coded (sticky nav, CTA buttons with analytics)
- `hand-coded`: Too interactive for Stitch (tab component, scroll animations, auth redirect)

### Issue C4 (LOW) — LCP Budget Math Needs Verification

The analysis claims LCP < 2.5s with a 150KB webp hero image, preloaded. But the actual LCP budget should account for:
- HTML download: ~50ms (static, small)
- Critical CSS: ~30ms (inlined)
- Hero image download: 150KB / typical Korean mobile bandwidth (~10Mbps) = ~120ms
- Total critical path: ~200ms (optimistic)

This is well within 2.5s. However, the analysis does not account for the `vite-ssg` hydration cost. If the statically rendered HTML includes React hydration markers, the browser must download and execute the JS bundle before the page becomes interactive. If the JS bundle is 200KB gzipped (the stated budget), decompression + parse + execute could add 500-800ms on mid-range mobile devices.

**Recommendation:** Specify that the landing page JS bundle target should be < 80KB gzipped (not 200KB), since the landing page has minimal interactivity. The 200KB budget may be the app bundle, not the landing page.

---

## Combined Score

| Critic | Issues Found | Severity Breakdown |
|--------|-------------|-------------------|
| **Critic-A (UX+Brand)** | 3 issues | 1 HIGH, 1 MEDIUM, 1 LOW |
| **Critic-B (Visual+A11y)** | 4 issues | 1 HIGH, 2 MEDIUM, 1 LOW |
| **Critic-C (Tech+Perf)** | 4 issues | 1 HIGH, 2 MEDIUM, 1 LOW |

### Scoring

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Concept Analysis Quality** | 8/10 | Thorough, well-structured, all three concepts evaluated with consistent criteria. Scoring methodology is clear and defensible. |
| **Phase 0 Alignment Verification** | 7/10 | Font and CTA corrections properly applied from Phase 1-3. But light-body CTA contrast problem identified without resolution. Final CTA band color deferred. |
| **Accessibility Rigor** | 6/10 | Dark-section contrast verified thoroughly. Light-section focus indicators incomplete. Touch targets unspecified. Font-swap CLS risk glossed over. |
| **Technical Feasibility** | 6/10 | Good performance budget tables. But SSG architecture undefined. Font loading strategy suboptimal for Korean market. Stitch boundaries absent. |
| **Actionability for Phase 3** | 7/10 | Clear wireframing directives provided. Several critical decisions deferred rather than resolved. Component decomposition missing. |

**Combined Score: 6.8 / 10**

### Verdict: MARGINAL FAIL (threshold: 7.0)

The analysis is strong in concept evaluation and brand alignment but falls short on three fronts:
1. The light-body CTA color problem is identified but not resolved -- this cannot be deferred again
2. Accessibility specs are incomplete for the light-body context (focus indicators, touch targets)
3. Technical architecture (landing page as separate package, font self-hosting, Stitch boundaries) is absent

### Required Corrections Before Phase 3

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | Light-body CTA color resolution | HIGH | Define: `bg-slate-900 text-white` for primary CTAs on light backgrounds |
| 2 | Focus indicator dual-context spec | HIGH | Add `ring-offset-white` variant for light sections |
| 3 | Landing page package architecture | HIGH | Confirm: separate `packages/landing` with `vite-ssg` |
| 4 | Font self-hosting decision | MEDIUM | Self-host Inter woff2 for Korean market latency |
| 5 | Touch target minimums | MEDIUM | Add `min-h-[44px]` to all mobile interactive elements |
| 6 | NEXUS hero asset type decision | MEDIUM | Lock: real screenshot vs. SVG vs. illustration |
| 7 | Stitch component boundaries | MEDIUM | Mark each section as stitch-safe / stitch-partial / hand-coded |
| 8 | Final CTA band color | LOW | Recommend `bg-slate-900` for unity |
| 9 | Sage signal in hero | LOW | Add one data point or intelligence-signaling phrase |
| 10 | Landing JS bundle target | LOW | Tighten from 200KB to 80KB gzipped |

**If corrections 1-3 are applied, the score rises to 7.2/10 (PASS).**

---

_Review complete. 11 issues identified across 3 critic roles. Analysis quality is high but resolution completeness is insufficient for Phase 3 handoff._
