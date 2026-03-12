# Phase 1 Step 1-3 — Critic A Review (Sally / Marcus / Luna)

**Date**: 2026-03-12
**Document reviewed**: `_corthex_full_redesign/phase-1-research/landing/landing-page-research.md`
**Round**: 1

---

## Sally (UX Designer) — User Journey & Cognitive Load

The three options address the CEO persona well — the Constraints table correctly identifies 김대표 and 이팀장 as targets, and the "How it works (01→02→03)" section in Option A gives the non-developer CEO a clear mental model in under 10 seconds. The recommendation table is the best in Phase 1 so far: it directly compares all 3 options against criteria that map to actual CORTHEX conversion goals (time-to-understand, 2-CTA model, screenshot dependency). Option A's recommendation justification correctly identifies why Option B loses enterprise buyers ("no Demo path") and when to prefer Option C (4+ screenshots ready).

**Issue 1 (Moderate — Completeness)**: Options B and C both have empty Pricing and Final CTA sections. Option B shows "SECTION 6 — PRICING:" and "SECTION 7 — FINAL CTA:" as bare one-liners with no ASCII diagram, no code. Option C has "SECTION 5 — TESTIMONIALS (3 col): SECTION 6 — PRICING (3 tiers): SECTION 7 — FINAL CTA:" — all three on one line with zero content. For a CEO who would scroll to pricing on the landing page, these are the most conversion-critical sections and both options give them nothing. Option A shows all sections with ASCII art. Fix: add at minimum the 3-tier pricing card ASCII diagram (consistent with Option A's format) to Options B and C, and a final CTA section spec.

**Issue 2 (Moderate — Spec Gap)**: Option B Section 3 says "[ANIMATED: NEXUS canvas drawing → agents activate] ← looping animation or video" with zero implementation spec. This is the single most technically complex visual element in Option B — and also the most important brand moment. The document gives no guidance on whether this is (a) a `<video autoplay muted loop playsinline>` element (simplest), (b) a Lottie animation, or (c) a CSS/SVG keyframe animation. There is no `prefers-reduced-motion` fallback specified. Without this, a developer implementing Option B has no idea what to build. Fix: specify the implementation type — recommend `<video autoplay muted loop playsinline>` + `@media (prefers-reduced-motion: reduce) { video { display: none } }` + static NEXUS screenshot fallback.

---

## Marcus (Visual Designer) — Specificity & Technical Accuracy

Option A's hero code is the strongest in Phase 1 research so far. The dot grid CSS (`bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.15)_1px,transparent_0)] bg-[length:32px_32px]`) is the correct CSS `background-image` approach — not canvas, not WebGL, not JavaScript. The `[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,...)]` vignette is a precise touch that fades the dots toward the bottom. The trust rail metrics and logo wall code are complete and actionable. Option C's bento grid with `bg-indigo-950 border-indigo-900` for Hub card vs `bg-zinc-900 border-zinc-800` for other features correctly reflects the P0 priority hierarchy from Phase 0 Vision doc.

**Issue 3 (Moderate — Spec Disconnect)**: Option A's cons section (line ~651) warns: "Animated dot grid needs `prefers-reduced-motion: reduce` media query to disable." But the Option A code block shows ONLY a static CSS background pattern — there is no animation defined in the code. The cons are warning about an animation that doesn't exist in the spec. Either: (a) the code should show the animated version (opacity cycling per Linear's pattern) plus the `@media (prefers-reduced-motion: reduce)` fallback, OR (b) the con should be removed since the static CSS grid has nothing to disable. As written, the code is fine for motion-reduce but the cons are inaccurate. Fix: add the animation to the code or remove the motion-reduce mention from cons.

Suggested Option A dot grid with animation:
```tsx
{/* Animated dot grid — disable for reduced motion */}
<div className="absolute inset-0 [&>span]:animate-[dot-pulse_3.2s_ease-in-out_infinite] motion-reduce:[&>span]:animate-none bg-[radial-gradient(circle_at_1px_1px,rgb(99_102_241/0.15)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
```
Or simply: keep static and remove the motion-reduce con.

**Issue 4 (Minor — Code Quality)**: Option A's nav maps `['제품', '가격', '문서', '블로그']` to `href="#"` for all items. `href="#"` causes scroll-to-top behavior and is semantically wrong for navigation links. Fix: use real placeholder routes `[{ label: '제품', href: '/features' }, { label: '가격', href: '/pricing' }, ...]`. This affects implementation accuracy when this code is used for the actual landing page.

---

## Luna (Brand Strategist) — CORTHEX Brand Fit & Conversion

The brand positioning throughout all 3 options is excellent. "Military Precision × AI Intelligence" translates correctly to the dark zinc-950 background, the indigo accent, the left-aligned copy (Stripe/Linear authority pattern). Option A's eyebrow copy "AI 조직 관리 플랫폼" + headline "조직도를 그리면 AI 팀이 움직인다" is the strongest brand statement in all of Phase 1. Option C's use of `role="img" aria-label="NEXUS 조직도 캔버스 미리보기"` is precise Korean localization of the ARIA label. The recommendation correctly identifies that Option B best serves SEO-driven traffic (blog/search "how to manage AI teams") while Option A serves direct/referral visits from CEO buyers.

**Issue 5 (Minor — ARIA Inconsistency)**: Option A's `<nav>` element is missing `aria-label="Main navigation"`. Options B (line 734) and C (line 894) both have `aria-label="Main navigation"` on their nav elements. Option A's nav (line 534) is bare: `<nav className="fixed top-0...">` — no aria-label. WCAG 2.4.1 requires distinguishable navigation landmarks when multiple nav elements exist. Fix: add `aria-label="Main navigation"` to Option A's nav element.

**Issue 6 (Minor — Clarity)**: Pricing values (₩99,000/월, ₩299,000/월) appear in the Option A pricing ASCII diagram without an explicit "(placeholder)" marker. The constraints table says "3 tiers (inferred)" which is good, but the pricing section itself presents specific numbers as if factual. The cons section (line 652) acknowledges aspirational trust metrics but does NOT specifically call out pricing as placeholder. For a research document that may be handed to a developer, this could lead to hardcoded placeholder prices appearing in production. Fix: add `{/* 가격 미정 — 런칭 전 확정 필요 */}` comment to pricing section or add "(placeholder)" to the pricing tier values.

---

## Summary of Issues

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | **Moderate** | Completeness | Options B and C: Pricing + Final CTA sections completely empty |
| 2 | **Moderate** | Spec Gap | Option B Section 3: animated NEXUS canvas — no implementation type, no motion-reduce fallback |
| 3 | **Moderate** | Spec Disconnect | Option A dot grid: cons warn about motion-reduce but code has no animation to disable |
| 4 | **Minor** | Code Quality | Option A nav links use `href="#"` — should be real placeholder routes |
| 5 | **Minor** | ARIA | Option A `<nav>` missing `aria-label="Main navigation"` — inconsistent with B and C |
| 6 | **Minor** | Clarity | Pricing values (₩99,000/₩299,000) not marked as placeholder in option sections |

---

## What's Working Well

- All 8 reference products use real direct-observation URLs (linear.app, cursor.com, etc.) ✅
- Dot grid correctly specified as CSS `background-image` radial-gradient (NOT canvas/WebGL) ✅
- `backdrop-blur-sm` with `/90` opacity on all sticky navs — correct dark mode treatment ✅
- Primary CTA `bg-indigo-600 hover:bg-indigo-500` consistent across all 3 options ✅
- Ghost CTA `border border-zinc-700 hover:border-zinc-500` consistent across A and C ✅
- Options B and C have `aria-label="Main navigation"` on nav ✅
- All section code blocks have `aria-labelledby` correctly linked to heading IDs ✅
- `motion-reduce:transition-none` on all defined transitions ✅
- Option B scroll indicator correctly has `animate-pulse motion-reduce:animate-none` ✅
- `bg-zinc-950` (#09090b) used throughout — not "professional dark" ✅
- Recommendation table covers all decision criteria with CORTHEX-specific reasoning ✅
- Brand copy (Korean) is precise: "조직도를 그리면 AI 팀이 움직인다" is excellent ✅
- Option C bento grid correctly differentiates Hub card (`bg-indigo-950`) from others ✅

---

## Round 1 Score: **7.5 / 10**

**Strengths**: 8 real references, CSS-only dot grid, consistent CTA spec, strong ARIA in B and C, brand positioning strong, recommendation is the best cross-option analysis in Phase 1.

**Weaknesses**: Options B/C have empty Pricing and Final CTA sections, Option B Section 3 animation is completely unspecified, Option A dot grid motion-reduce disconnect.

**Priority fixes for Round 2:**
1. Add Pricing + Final CTA specs to Options B and C (at minimum ASCII diagram matching Option A's format)
2. Specify Option B Section 3 animated canvas: `<video autoplay muted loop>` + `motion-reduce` static fallback
3. Fix Option A dot grid: either add the animation CSS or remove motion-reduce con
4. Add `aria-label="Main navigation"` to Option A nav
5. Fix Option A nav `href="#"` → real placeholder routes
6. Add `{/* placeholder */}` comment to pricing values in all 3 options

---
*Critic A review complete. Sending to Critic B for cross-talk.*
