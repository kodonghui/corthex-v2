# Phase 1-3 Context Snapshot — Landing Page Critic Review

**Date:** 2026-03-15
**Status:** MARGINAL PASS (7.0/10) — corrections required before Phase 2
**Output:** `_corthex_full_redesign/party-logs/phase1-step3-critic-review.md`

---

## Winning Concept

**Concept A — "The Command Bridge"**
*(Inspired by: Vercel + Linear | Archetype: Ruler/Authority)*

Selected for:
- Perfect structural alignment with Phase 0 (dark hero → light body)
- NEXUS screenshot as hero visual = strongest product differentiator
- Swiss grid composition matches brand archetype
- Conservative motion budget fully respected
- Most implementation-friendly for Stitch/React generation
- Login in nav only (product-first, no hero clutter)

---

## Critical Spec Corrections Required Before Phase 2

### 1. Font System (BLOCKING)
Research used Geist + Pretendard — **both rejected by Phase 0 v2.0.**

| Research Spec | Corrected Phase 0 Spec |
|---------------|----------------------|
| `font-geist` hero H1 | `font-inter` (Inter, all display) |
| Pretendard body text | Inter (same family, weight variation) |
| JetBrains Mono eyebrow (Concept C) | ✓ Keep — approved for technical contexts |

All `font-geist` and `Pretendard` references in concept code specs must be replaced with `Inter`.

### 2. CTA Color System (BLOCKING)
Research used indigo-600 for all CTAs — **Phase 0 changed primary to cyan-400.**

| CTA Type | Research Spec | Corrected Phase 0 Spec |
|----------|---------------|----------------------|
| Primary hero CTA | `bg-indigo-600 text-white` | `bg-cyan-400 text-slate-950` |
| Secondary outline CTA | `border-slate-700 text-slate-300` | `border border-cyan-400/50 text-cyan-400` |
| Auth card login button | `bg-indigo-600 text-white` | ✓ Keep — indigo-600 is the Login exception |
| Final CTA block | `bg-indigo-950` / `bg-indigo-600` | Needs design review — may use cyan gradient |

**Indigo-600 exception scope:** Auth card login actions only (Concept B embedded form, and future dedicated /login page).

---

## Key Specs: Concept A — Corrected

```tsx
// Hero H1 — corrected
<h1 className="font-inter text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
  AI 조직을 설계하고,<br />지휘하라.
</h1>

// Subtext — corrected font
<p className="font-inter text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
  부서·직원·AI 에이전트를 자유롭게 구성하고, NEXUS로 한눈에 지휘하세요.
</p>

// Primary CTA — corrected color
<button className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg transition-colors duration-150 text-base">
  무료로 시작하기 →
</button>

// Secondary CTA — corrected to Phase 0 outlined style
<button className="px-6 py-3 border border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-semibold rounded-lg transition-colors duration-150 text-base">
  데모 요청
</button>
```

### Background — corrected color token
```tsx
// Hero bg: slate-950 (#020617) per Phase 0 — not zinc-950 (#09090B)
<section className="relative min-h-screen bg-slate-950 ...">
```

---

## Confirmed Specs (No Changes)

| Element | Spec | Status |
|---------|------|--------|
| Hero background | `bg-slate-950` (#020617) | ✓ confirmed (corrected from zinc) |
| Grid overlay | `bg-[linear-gradient(...#ffffff0D...)] bg-[size:64px_64px]` | ✓ (opacity bumped to 0D) |
| Radial glow | `bg-indigo-600/10 rounded-full blur-[120px]` | ✓ confirmed |
| Product preview frame | Browser chrome + `rounded-2xl border border-slate-800` | ✓ confirmed |
| Body sections | `bg-slate-50` / `bg-white` alternating | ✓ confirmed |
| Final CTA section | `bg-indigo-950` (dark, not cyan) | ✓ design TBD in Phase 2 |
| Scroll animation budget | fade-up 150–200ms, stagger 100ms, hover 0.3s | ✓ Phase 0 compliant |
| Login integration | Nav-only, ghost link "로그인" + primary "시작하기" | ✓ confirmed |
| Label badge | `border-indigo-500/30 bg-indigo-500/10 text-indigo-300` | ✓ (indigo accent allowed for decorative) |

---

## A11y Corrections for Phase 2

1. **Placeholder contrast**: use `placeholder-slate-400` minimum (not slate-500) in any input fields
2. **Focus indicators**: add `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` to all interactive elements
3. **Product preview image**: add `width`, `height`, `fetchpriority="high"`, `loading="eager"` to hero LCP image

---

## Phase 0 Alignment: Concept A (Post-Correction)

| Phase 0 Decision | Concept A Status |
|-----------------|-----------------|
| Light theme for landing (body) | ✓ slate-50/white |
| Dark hero section | ✓ slate-950 |
| cyan-400 primary CTA | ✓ (after correction) |
| Inter display + body | ✓ (after correction) |
| JetBrains Mono technical | N/A (no technical eyebrow in Concept A) |
| Conservative motion | ✓ |
| No parallax/particles/lottie | ✓ |
| Swiss 12-col grid structure | ✓ |
| Sovereign Sage archetype | ✓ |

---

## Connections to Phase 2

**Phase 2 Wireframing** should:
1. Use Concept A layout as the starting wireframe — full page, all sections
2. Apply corrected Inter font system throughout
3. Apply cyan-400 primary CTA system (indigo retained only for login/auth flows)
4. Resolve: does the final CTA band use indigo-950 or a cyan/slate dark gradient?
5. Define the NEXUS screenshot: real screenshot vs illustrated mockup vs SVG composition
6. Add focus-visible ring system to all interactive elements
7. Specify product preview image loading strategy (LCP optimization)
8. Evaluate Concept B hybrid option: Concept A hero + modal login (not embedded) for returning users

**Phase 3 Design Tokens** will formalize:
- `--color-cta-primary: cyan-400` + `--color-cta-primary-text: slate-950`
- `--font-display: Inter` (weights 400, 500, 600, 700)
- `--hero-bg: #020617` (slate-950)
- `--grid-overlay-opacity: 0.05` (#ffffff0D)
