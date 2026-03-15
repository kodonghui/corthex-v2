# Phase 3-1 Context Snapshot: Design Tokens

**Date:** 2026-03-15
**Status:** COMPLETE
**Critic Score:** 8.9/10 (post-fix)

## What Was Built

`phase-3-design-system/design-tokens.md` v2.0 — the single source of truth for all CORTHEX visual values.

## Key Decisions

1. **Color system:** 60-30-10 rule (slate backgrounds / text hierarchy / semantic accents). Max 2 accent colors per screen (Vignelli discipline).
2. **Text:** slate-50 (primary), slate-400 (secondary), slate-600 (placeholder only, 18px+). slate-500 BANNED (3.6:1 fails WCAG AA).
3. **Fonts:** Inter (UI, 400/500/600/700) + JetBrains Mono (technical, 400/500). Self-hosted via @fontsource. Google Fonts CDN BANNED.
4. **Layout:** 280px sidebar (exact, not w-72=288px), 56px topbar, 12-col grid, 24px gutter, max-w-1160px content.
5. **Motion:** All animations have `prefers-reduced-motion: reduce` blanket disable. Context panel uses `transform: translateX()` (GPU), never `width` animation.
6. **Accessibility:** WCAG contrast audit for 27 text/bg pairs. Color-blind status dots with secondary indicators. Dual-context focus rings (dark/light). Skip-to-content link. Touch targets 44x44pt minimum.
7. **Landing:** Dual-context CTA (cyan-400 on dark, slate-900 on light). Body sections alternate slate-50/white.

## Fixes Applied (from critic review)
- Added budget threshold tokens (`--budget-warning-threshold`, `--budget-danger-threshold`)
- Added disabled opacity token (`--opacity-disabled: 0.4`)
- Added `tailwindcss-animate` plugin (required for shadcn/ui)
- Added `font-display: swap` documentation

## Production-Ready Outputs
- `tailwind.config.ts` — complete, copy-paste ready
- `globals.css` — complete with @fontsource imports, CSS custom properties, @layer definitions, keyframes, media queries

## Connections to Next Phase
- Phase 3-2 (Component Strategy) uses these tokens for every component spec
- Phase 4-1 (Creative Themes) overrides accent palette while preserving structure
- Phase 4-2 (Accessibility Audit) validates all token pairs against WCAG 2.1/2.2
- Phase 5 (Stitch Prompts) references exact hex values and Tailwind classes from this document
