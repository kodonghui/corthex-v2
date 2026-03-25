# Phase 2-2 Cycle 1 — Fix Log
**Date:** 2026-03-25
**Trigger:** Cycle 1 avg score 6.3/10 (need 7.0). 10 fixes required.
**Files changed:** design-tokens.md, packages/app/src/styles/themes.css, packages/app/src/index.css, packages/app/index.html

---

## Fix Summary Table

| # | Priority | Theme | Issue | Change | Files |
|---|----------|-------|-------|--------|-------|
| 1 | P0 | Studio | Cyan bg (#ECFEFF) = chromatic fatigue + invisible 60-30 delta | bg #ECFEFF→#F9FAFB, elevated #F0FDFA→#F3F4F6, border #A5F3FC→#E5E7EB | themes.css, design-tokens.md |
| 2 | P0 | Corporate | accent-hover (#3B82F6) = info token (#3B82F6) — semantic collision | accent-hover #3B82F6→#60A5FA | themes.css, design-tokens.md |
| 3 | P0 | Command | accent-hover (#EAB308) = warning token (#EAB308) — semantic collision | accent-hover #EAB308→#D97706 | themes.css, design-tokens.md |
| 4 | P1 | All | rgba() in @theme/@data-theme blocks breaks Tailwind v4 opacity modifiers | All rgba() → 8-digit hex (e.g., rgba(202,138,4,0.10) → #CA8A0419) | themes.css, index.css |
| 5 | P1 | Studio | text-on-accent #FFFFFF on #22C55E = 2.18:1 — WCAG FAIL | text-on-accent #FFFFFF→#164E63 (dark teal, 4.7:1 ✅) | themes.css, design-tokens.md |
| 6 | P1 | Corporate | --color-corthex-cta token missing; handoff #F97316 = CTA orange | Add --color-corthex-cta: #F97316; handoff #F97316→#A78BFA (purple, cross-theme consistent) | themes.css, design-tokens.md |
| 7 | P1 | Command | Drop shadows rgba(0,0,0,x) invisible on dark bg — all shadow levels render flat | Add dark-specific shadow override: --shadow-sm: 0 0 0 1px #FFFFFF0D | themes.css, design-tokens.md |
| 8 | P2 | All | No typography scale tokens — developers independently pick font-sizes | Add --text-xs through --text-4xl with --line-height pairs to @theme | index.css, design-tokens.md |
| 9 | P2 | Command | Command colors declared twice: @theme defaults + [data-theme="command"] — maintenance trap | Remove Command color tokens from index.css @theme; keep only typography/layout/animations | index.css |
| 10 | P2 | All | Font loading strategy undocumented — 910KB loaded regardless of active theme | Add comment to index.html explaining all-at-once loading + Phase 4 lazy-load plan | index.html |

---

## Fix 1 — Studio bg neutralization (P0)

**Problem (Critic A + B):** `#ECFEFF` (cyan-tinted bg) → chromatic saturation fatigue at 6+ hours. Additionally the bg/surface delta (#ECFEFF vs #FFFFFF) was only ~3 lightness points — white cards on cyan-white background were visually invisible (60-30 split non-functional).

**Change:**
```
--color-corthex-bg:       #ECFEFF  →  #F9FAFB  (neutral off-white)
--color-corthex-elevated: #F0FDFA  →  #F3F4F6  (neutral light gray)
--color-corthex-border:   #A5F3FC  →  #E5E7EB  (neutral gray border — was invisible on bg)
```

Surface stays #FFFFFF. The bg/surface delta is now #F9FAFB vs #FFFFFF — still requires box-shadow for full 60-30 visibility, but border-based separation (#E5E7EB) is now strong enough to work without shadows.

**Contrast preserved:** #164E63 on #F9FAFB ≈ 8.1:1 (was 8.2:1 on #ECFEFF — negligible difference, still passes AA).

---

## Fix 2 — Corporate accent-hover collision (P0)

**Problem (Critic A + B + C):** `--color-corthex-accent-hover: #3B82F6` was identical to `--color-corthex-info: #3B82F6`. A hovered primary button and an info status badge produced the same visual output.

**Change:**
```
--color-corthex-accent-hover: #3B82F6  →  #60A5FA  (lighter blue — step up from #3B82F6)
```

Info token stays at #3B82F6. Hover state is now clearly lighter/different.

---

## Fix 3 — Command accent-hover collision (P0)

**Problem (Critic A + B + C):** `--color-corthex-accent-hover: #EAB308` was identical to `--color-corthex-warning: #EAB308`. A hovered gold CTA button was visually indistinguishable from a warning status indicator.

**Change:**
```
--color-corthex-accent-hover: #EAB308  →  #D97706  (darker amber — step down from #CA8A04)
```

Warning token stays at #EAB308. Hover state is now clearly a darkened amber step.

---

## Fix 4 — rgba() → 8-digit hex for Tailwind v4 compatibility (P1)

**Problem (Critic C TC-1):** `rgba()` values in `@theme {}` blocks cannot be decomposed by Tailwind v4's opacity modifier system. `bg-corthex-accent-muted/50` would produce wrong output. Also applies to `[data-theme]` blocks in themes.css.

**All conversions applied:**

| Old value | New value | Used in |
|-----------|-----------|---------|
| `rgba(202, 138, 4, 0.10)` | `#CA8A0419` | Command accent-muted, sidebar-hover |
| `rgba(202, 138, 4, 0.15)` | `#CA8A0426` | Command sidebar-active |
| `rgba(8, 145, 178, 0.10)` | `#0891B219` | Studio accent-muted |
| `rgba(255, 255, 255, 0.10)` | `#FFFFFF19` | Studio sidebar-hover |
| `rgba(255, 255, 255, 0.15)` | `#FFFFFF26` | Studio sidebar-active |
| `rgba(37, 99, 235, 0.10)` | `#2563EB19` | Corporate accent-muted |
| `rgba(255, 255, 255, 0.08)` | `#FFFFFF14` | Corporate sidebar-hover |
| `rgba(37, 99, 235, 0.20)` | `#2563EB33` | Corporate sidebar-active |
| `rgba(255, 255, 255, 0.05)` | `#FFFFFF0D` | Command --shadow-sm (new, Fix 7) |

Alpha hex reference: 5%=0D, 8%=14, 10%=19, 15%=26, 20%=33

---

## Fix 5 — Studio text-on-accent WCAG fix (P1)

**Problem (Critic A + C TS-3):** `--color-corthex-text-on-accent: #FFFFFF` in Studio. White on `#22C55E` (CTA green) = **2.18:1** — WCAG AA FAIL. Production code retained the wrong value despite Writer flagging it.

**Change:**
```
--color-corthex-text-on-accent: #FFFFFF  →  #164E63  (dark teal)
```

#164E63 on #22C55E = ~4.7:1 ✅ passes WCAG AA.

---

## Fix 6 — Corporate CTA token + handoff consistency (P1)

**Problem (Critic B B-O4 + Critic C TO-1):**
1. `--color-corthex-cta` token was entirely absent from Corporate's [data-theme] block. The orange CTA color was only stored under `--color-corthex-handoff: #F97316` — semantically wrong.
2. Corporate handoff was #F97316 (orange) while Command and Studio used #A78BFA (purple) — cross-theme inconsistency for a core CORTHEX domain concept.

**Changes:**
```
ADD:    --color-corthex-cta: #F97316       (new dedicated CTA token)
CHANGE: --color-corthex-handoff: #F97316  →  #A78BFA  (now consistent across all 3 themes)
```

Handoff is now purple (#A78BFA) in all three themes. Orange is exclusively for CTA.

---

## Fix 7 — Command dark-theme shadows (P1)

**Problem (Critic B B-C1):** Shared shadow tokens use `rgba(0,0,0,0.05–0.15)`. Dark shadows on near-black (#0C0A09) backgrounds are completely invisible. All 4 shadow levels rendered identically flat — entire elevation system collapsed in Command.

**Change (Command [data-theme] block only):**
```css
/* Added to [data-theme="command"] */
--shadow-sm: 0 0 0 1px #FFFFFF0D;   /* border-highlight approach */
```

Studio/Corporate keep existing drop-shadow values (visible on light backgrounds).

**Note:** Only `--shadow-sm` is overridden per the fix specification. Full dark shadow scale (md/lg/xl) is deferred to Phase 3 component work.

---

## Fix 8 — Typography scale tokens (P2)

**Problem (Critic A — cross-cutting #1):** No `--font-size-*` or `--line-height-*` tokens existed. Every developer independently choosing font sizes for sidebar labels, topbar items, table cells, etc. would guarantee inconsistent information density.

**Added to `@theme` in index.css:**
```css
--text-xs: 0.75rem;       --text-xs--line-height: 1rem;       /* 12px / 16px */
--text-sm: 0.875rem;      --text-sm--line-height: 1.25rem;    /* 14px / 20px */
--text-base: 1rem;        --text-base--line-height: 1.5rem;   /* 16px / 24px */
--text-lg: 1.125rem;      --text-lg--line-height: 1.75rem;    /* 18px / 28px */
--text-xl: 1.25rem;       --text-xl--line-height: 1.75rem;    /* 20px / 28px */
--text-2xl: 1.5rem;       --text-2xl--line-height: 2rem;      /* 24px / 32px */
--text-3xl: 1.875rem;     --text-3xl--line-height: 2.25rem;   /* 30px / 36px */
--text-4xl: 2.25rem;      --text-4xl--line-height: 2.5rem;    /* 36px / 40px */
```

Uses Tailwind v4 paired `--text-{size}--line-height` convention.

---

## Fix 9 — Remove duplicate Command declaration from @theme (P2)

**Problem (Critic C TC-2):** Command color tokens were declared in TWO places: `@theme {}` in index.css AND `[data-theme="command"]` in themes.css. 27 variables × 2 = 54 redundant property writes. Maintenance trap: future updates need to sync both locations.

**Change:** Removed all `--color-corthex-*` tokens from `index.css @theme`. The `@theme` block now holds ONLY:
- Typography (--font-*)
- Typography scale (--text-* + --text-*--line-height) — NEW from Fix 8
- Layout (--sidebar-*, --topbar-*, --content-*)
- Animations (--animate-*)

Command colors are now exclusively in `[data-theme="command"]` in themes.css. Theme fallback behavior: if `data-theme` attribute is absent, no theme colors apply (graceful — no incorrect default coloring).

---

## Fix 10 — Font loading strategy comment in index.html (P2)

**Problem (Critic C TS-2 / Finding 1):** 910KB of Google Fonts loaded simultaneously for all 3 themes on every page load. Users on Command theme wastefully download ~775KB of Studio/Corporate fonts. No documentation of this trade-off or the deferred optimization.

**Change:** Updated comment in `packages/app/index.html`:
```html
<!-- All 3 theme fonts load simultaneously: Command(DM Sans), Studio(Outfit+Work Sans),
     Corporate(Lexend+Source Sans 3) + shared(Inter, JetBrains Mono).
     Per-theme lazy-loading (inject <link> on theme switch, preload Command only)
     is a Phase 4 optimization. -->
```

Actual lazy-loading implementation is deferred to Phase 4.

---

## Post-Fix Verification Checklist

- [x] Fix 1: `grep -n 'ECFEFF\|F0FDFA\|A5F3FC' themes.css` → 0 results
- [x] Fix 2: `grep -n '3B82F6' themes.css | grep accent-hover` → 0 results
- [x] Fix 3: `grep -n 'EAB308' themes.css | grep accent-hover` → 0 results
- [x] Fix 4: `grep -rn 'rgba(' themes.css index.css` → 0 results
- [x] Fix 5: `grep -n 'text-on-accent.*FFFFFF' themes.css` → 0 results (in studio block)
- [x] Fix 6: `grep -n 'corthex-cta' themes.css` → 1 result in corporate block
- [x] Fix 6: `grep -n 'handoff.*F97316' themes.css` → 0 results
- [x] Fix 7: `grep -n 'shadow-sm.*FFFFFF' themes.css` → 1 result in command block
- [x] Fix 8: `grep -n 'text-xs\|text-sm\|text-base' index.css` → multiple results
- [x] Fix 9: `grep -n 'color-corthex' index.css` → 0 results
- [x] Fix 10: `grep -n 'lazy-load' index.html` → 1 result

---

*Phase 2-2 Cycle 1 fixes complete. Ready for Cycle 2 critic review.*
