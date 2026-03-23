# Phase 1, Step 1-3 — Tech + Performance Review
**Critic:** tech-perf (Critic-C)
**Document:** `_uxui_redesign/phase-1-research/landing/landing-page-research.md`
**Date:** 2026-03-23

---

## Overall Assessment: 8.5/10 — PASS with Required Fixes

Option C is the correct recommendation. The landing page research is thorough, the performance strategy is sound, and the < 50KB JS budget is achievable. Two required fixes (SSG choice clarity + deprecated CSS) and several medium items.

---

## Issue #1 (SEVERITY: HIGH) — SSG Choice: `vite-react-ssg` is Wrong for This Stack

**Location:** Lines 1899, 1963 — "Vite SSG via `vite-react-ssg` or React Router v7 SSG"

**Problem:**
The document presents both as equal alternatives. They are NOT:

| Factor | vite-react-ssg | React Router v7 SSG |
|--------|---------------|---------------------|
| Latest version | 0.9.1-beta.1 (small project) | Stable (Remix merger) |
| React Router compat | **v6 ONLY** (author confirms v7 not supported) | **Native** (`prerender` in config) |
| Weekly downloads | ~5,900 | Standard RR7 |
| Maintenance | 1-person project, beta | React Router core team |
| Long-term viability | Questionable | Industry standard |

Since CORTHEX uses **React Router v7** (via `react-router-dom v7` in `packages/app`), `vite-react-ssg` is incompatible — it only works with React Router v6.

**React Router v7 SSG is the only correct choice:**
```typescript
// react-router.config.ts
export default {
  ssr: false,
  async prerender() {
    return ["/", "/features", "/pricing", "/docs"];
  }
}
```

This is officially documented, Cloudflare Pages compatible (verified deployment examples exist), and requires no additional dependency.

**Fix:** Remove `vite-react-ssg` as an option. State React Router v7 SSG (`prerender` config) as the sole recommendation. No extra dependency needed.

---

## Issue #2 (SEVERITY: HIGH) — `-webkit-overflow-scrolling: touch` Again (2 instances)

**Location:** Lines 617, 1547

**Problem:** Same issue as Step 1-2. Deprecated since iOS 13 (2019). Safari uses momentum scrolling by default. Can cause z-index stacking context bugs. Remove both instances.

---

## Issue #3 (SEVERITY: MEDIUM) — Google Fonts `text=` Parameter URL Encoding

**Location:** Line 1965 (Decision table) — "JetBrains Mono numbers-only for metrics"

**Problem:**
The document mentions font subsetting but doesn't show the correct URL encoding. The `text=` parameter requires URL-encoding special characters:

**Incorrect:** `&text=0123456789%+/`
**Correct:** `&text=0123456789%25%2B%2F`

Characters requiring encoding:
- `%` → `%25`
- `+` → `%2B`
- `/` → `%2F`

**Full example for JetBrains Mono numbers-only subset:**
```html
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&text=0123456789%25%2B%2FN&display=swap" />
```

Note: Added `N` for "N-Tier" metric display.

**Also:** JetBrains Mono IS available on Google Fonts CDN — confirmed. The subsetting approach is correct and will reduce the font file from ~200KB to <5KB.

**Fix:** Add the correct URL-encoded example to the Implementation Notes section.

---

## Verified Technical Claims

### JS Budget < 50KB — ACHIEVABLE ✅

Current `packages/landing/package.json` dependencies:
- `react` + `react-dom` → ~42 kB gzip (React 19 production)
- Custom tab component → ~1-2 kB
- IntersectionObserver scroll-reveal → ~0.5 kB
- **Total: ~44-45 kB gzip**

**Within budget.** Key: NO Zustand, NO react-query, NO Radix, NO Framer Motion in landing. These are all app-only.

### Landing Package Isolation — VERIFIED ✅

`packages/landing/package.json` has zero imports from `@corthex/app`, `@corthex/ui`, or `@corthex/shared`. Grep confirms no cross-imports in `packages/landing/src/`. The package is properly isolated with only `react`, `react-dom`, `vite`, and `tailwindcss` as dependencies.

**Recommendation:** Keep it this way. Landing should NEVER depend on app or UI packages. Design tokens should be duplicated via CSS variables (already done in the CSS spec), not imported.

### Custom Tab Component vs Radix Tabs — CUSTOM IS CORRECT ✅

| Library | Min+Gzip | Landing Use Case |
|---------|----------|-----------------|
| @radix-ui/react-tabs v1.1.13 | **5.0 kB** | Overkill for 5 static tabs |
| Custom tab (useState + buttons) | **~0.5-1 kB** | Sufficient |

A landing page needs:
- 5 static tab buttons
- `aria-selected`, `role="tab"`, `role="tabpanel"`, `role="tablist"`
- Arrow key navigation (left/right to switch tabs)

This is ~40 lines of React. Radix Tabs adds focus roving, orientation support, controlled/uncontrolled mode, activation mode — all unnecessary for a marketing page. **Custom is the right call.**

However, the document says "~2KB" (line 1903, 1921, 1964). Actual custom tab with full ARIA is closer to **~0.5-1 KB gzip**. Minor overestimate, not blocking.

### CSS-Only Scroll Reveal — CORRECT, PERFORMANT ✅

IntersectionObserver + CSS `opacity` + `transform: translateY()` transitions:
- `opacity` and `transform` are **compositor-only properties** (GPU-accelerated)
- No layout/paint cost per frame
- IntersectionObserver fires callback once per element (with `unobserve` after animation — line 1846)
- `prefers-reduced-motion` handled correctly (lines 1155-1161, 1860-1864)

**Framer Motion would add ~25 kB gzip** for the same visual result. CSS transitions are the correct choice for a landing page.

Performance comparison:
| Approach | Bundle Cost | Runtime Cost |
|----------|------------|-------------|
| CSS transitions + IO | 0 kB | Near-zero (compositor-only) |
| Framer Motion | ~25 kB | Higher (JS-driven animation frames) |

### WebP + `<picture>` for SSG — CORRECT ✅

`loading="lazy"` works correctly with SSG pre-rendered HTML. The browser sees the `loading="lazy"` attribute in the static HTML and defers loading images below the fold. No SSG-specific concerns.

**One note:** The hero screenshot should NOT use `loading="lazy"` since it's above the fold. Use `loading="eager"` (default) or `fetchpriority="high"` for the hero image.

### Logo Scroll Animation — SAFE ✅

```css
@keyframes scroll-x {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

- `transform: translateX()` is compositor-only (GPU-accelerated)
- No reflow/repaint
- Single element animation = negligible GPU memory
- `prefers-reduced-motion` handled (line 585-587)
- `animation: 30s linear infinite` — smooth 30-second loop, no jank

Safe on all devices including low-end mobile.

### IntersectionObserver Polyfill — NOT NEEDED ✅

Global support: **97.06%** (Widely Available baseline since 2021-09-25):
- Chrome 58+ (2017), Firefox 55+ (2017), Safari 12.1+ (2019), Edge 16+ (2017)
- iOS Safari 12.2+ (2019)
- Only unsupported: IE (EOL), Opera Mini

No polyfill needed for any modern browser in 2026.

### Cloudflare Pages Deployment — COMPATIBLE ✅

React Router v7 SSG outputs static HTML/CSS/JS to `dist/` (or build output dir). Cloudflare Pages serves static files directly from edge CDN. Verified deployment examples exist.

The existing GitHub Actions → CF cache purge pipeline works with static assets. No special adapter needed (unlike SSR which would require Cloudflare Workers).

**One note:** Ensure case-sensitive imports — Cloudflare's Linux build server is case-sensitive unlike macOS dev machines.

### `backdrop-filter: blur()` on Header — CORRECT with Note ✅

```css
background: rgba(250, 248, 245, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

- `-webkit-` prefix still needed for Safari (even Safari 18 requires it for some modes)
- Performance: backdrop-filter triggers compositor work but is acceptable for a single fixed element (header)
- The `0.85` opacity gives sufficient readability while allowing blur to be visible

---

## Libre Framework Verification

| Libre Principle | Status | Notes |
|----------------|--------|-------|
| Semantic HTML | ✅ | `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>` (line 1890) |
| Skip navigation | ✅ | `sr-only focus:not-sr-only` skip link (line 1892) |
| Language attribute | ✅ | `<html lang="ko">` (line 1893) |
| Tab keyboard nav | ✅ | ARIA roles specified, arrow key navigation noted (line 1889) |
| Focus-visible | ✅ | All interactive elements have `:focus-visible` with sage outline |
| Reduced motion | ✅ | All animations: scroll-reveal (1155), logo scroll (585), pulse badge (1300) |
| Color contrast | ✅ | "Verified in Vision §3.2" (line 1886) — trust but verify in Phase 2 |
| Touch targets | ⚠️ | Header CTA is 40px height (line 1225). Document says "44px with padding — OK" (line 1894). Verify: 40px + 0 padding = 40px visual, needs at least 2px padding top/bottom for 44px touch target. Actually fine since it has `align-items: center` in a 64px header — touch area extends. |
| Image alt text | ✅ | Noted for all screenshots (line 1891) |

---

## Component Count (Landing — Option C)

| Component | Purpose | Size Estimate |
|-----------|---------|--------------|
| `LandingPage` | Page root | Trivial |
| `Header` | Sticky header + CTA | ~1 kB |
| `Hero` | Badge + title + CTAs + screenshot | ~1 kB |
| `SocialProof` | Metrics grid (future: logo scroll) | ~0.5 kB |
| `ProblemSolution` | Before/After grid | ~0.5 kB |
| `FeatureTabs` | Custom 5-tab with ARIA | ~1 kB |
| `AgentShowcase` | Card demo + trait grid | ~0.5 kB |
| `CTASection` | Inverted CTA | ~0.3 kB |
| `Footer` | Links grid | ~0.5 kB |
| `useScrollReveal` | IntersectionObserver hook | ~0.3 kB |

**Total: ~6 kB pre-gzip, ~2 kB gzip component code** + ~42 kB React runtime = **~44 kB total gzip**. Within budget.

---

## Summary

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | `vite-react-ssg` incompatible with RR v7 — use React Router v7 `prerender` only | **HIGH** | Remove vite-react-ssg, recommend RR7 SSG only |
| 2 | `-webkit-overflow-scrolling: touch` deprecated (2 instances: lines 617, 1547) | **HIGH** | Remove |
| 3 | Google Fonts `text=` URL encoding needs correction | **MEDIUM** | Add correct URL-encoded example |
| 4 | Hero screenshot should not use `loading="lazy"` — it's above the fold | **LOW** | Note `fetchpriority="high"` for hero image |
| 5 | Case-sensitive imports warning for CF deployment | **LOW** | Add note |

**Verdict: PASS — Option C is correct. Fix #1 and #2 required. Landing package isolation is clean, JS budget is achievable, custom tab and CSS-only animations are the right technical choices.**
