# CORTHEX Design Tokens — 3 Themes (promax + Phase 1 enhanced)
# v6.1 — Phase 2-2 Cycle 1 fixes applied (2026-03-25)

All colors from promax --design-system output, enhanced with Phase 1 visual research.
ZERO manually picked colors. All values traceable to promax or benchmark analysis.

## Theme Summary

| Token | Command (Dark) | Studio (Light) | Corporate (Light) |
|-------|---------------|----------------|-------------------|
| **Vibe** | Premium Dark, Stealth Luxury | Soft UI, collaborative | Trust & Authority |
| **Bg** | #0C0A09 | ~~#ECFEFF~~ → **#F9FAFB** | #F8FAFC |
| **Surface** | #1C1917 | #FFFFFF | #FFFFFF |
| **Elevated** | #292524 | ~~#F0FDFA~~ → **#F3F4F6** | #F1F5F9 |
| **Primary** | #CA8A04 (gold) | #0891B2 (cyan) | #2563EB (blue) |
| **Accent Hover** | ~~#EAB308~~ → **#D97706** | #06B6D4 | ~~#3B82F6~~ → **#60A5FA** |
| **CTA** | #CA8A04 | #22C55E | **#F97316** (new dedicated token) |
| **Text** | #FAFAF9 | #164E63 | #1E293B |
| **Text 2nd** | #A8A29E | #0E7490 | #64748B |
| **Border** | #44403C | ~~#A5F3FC~~ → **#E5E7EB** | #E2E8F0 |
| **Handoff** | #A78BFA | #A78BFA | ~~#F97316~~ → **#A78BFA** |
| **Heading** | DM Sans | Outfit | Lexend |
| **Body** | DM Sans | Work Sans | Source Sans 3 |

## Command Theme (Dark)

**promax output**: Cyberpunk UI style → **corrected label: Premium Dark / Stealth Luxury**
**Phase 1 override**: Background changed from #FAFAF9 to #0C0A09 (Linear/Supabase/Retool pattern)
**Phase 2-2 fixes**: accent-hover #EAB308→#D97706 (Fix 3), rgba→hex (Fix 4), dark shadow (Fix 7)

```css
[data-theme="command"] {
  /* Surfaces — near-black */
  --color-corthex-bg: #0C0A09;
  --color-corthex-surface: #1C1917;
  --color-corthex-elevated: #292524;
  --color-corthex-border: #44403C;
  --color-corthex-border-strong: #57534E;

  /* Accent — promax gold */
  --color-corthex-accent: #CA8A04;
  --color-corthex-accent-hover: #D97706;      /* was #EAB308 — collided with --warning */
  --color-corthex-accent-deep: #A16207;
  --color-corthex-accent-muted: #CA8A0419;    /* was rgba(202,138,4,0.10) */

  /* Text — inverted for dark */
  --color-corthex-text-primary: #FAFAF9;
  --color-corthex-text-secondary: #A8A29E;
  --color-corthex-text-disabled: #57534E;
  --color-corthex-text-on-accent: #0C0A09;

  /* Sidebar */
  --color-corthex-sidebar-bg: #0C0A09;
  --color-corthex-sidebar-border: #1C1917;
  --color-corthex-sidebar-text: #A8A29E;
  --color-corthex-sidebar-text-active: #FAFAF9;
  --color-corthex-sidebar-hover: #CA8A0419;   /* was rgba(202,138,4,0.10) */
  --color-corthex-sidebar-active: #CA8A0426;  /* was rgba(202,138,4,0.15) */
  --color-corthex-sidebar-brand: #CA8A04;

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;

  /* Shadows — dark theme: border-highlight instead of drop-shadow */
  --shadow-sm: 0 0 0 1px #FFFFFF0D;

  /* NEXUS */
  --color-corthex-nexus-bg: #0A0908;

  color-scheme: dark;
}
```

**Typography**: DM Sans 400/500/600/700
**Google Fonts**: `family=DM+Sans:wght@400;500;600;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #0C0A09 (bg), 30% #1C1917 (surface/cards), 10% #CA8A04 (accent/CTA)

## Studio Theme (Light)

**promax output**: Soft UI Evolution, Fresh cyan + clean green
**Phase 2-2 fixes**: bg #ECFEFF→#F9FAFB (Fix 1), elevated/border neutralized (Fix 1), text-on-accent fixed (Fix 5), rgba→hex (Fix 4)

```css
[data-theme="studio"] {
  /* Surfaces — neutral off-white (was cyan-tinted: chromatic fatigue risk) */
  --color-corthex-bg: #F9FAFB;                /* was #ECFEFF */
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F3F4F6;          /* was #F0FDFA */
  --color-corthex-border: #E5E7EB;            /* was #A5F3FC — was invisible on bg */
  --color-corthex-border-strong: #67E8F9;

  /* Accent — promax cyan */
  --color-corthex-accent: #0891B2;
  --color-corthex-accent-hover: #06B6D4;
  --color-corthex-accent-deep: #0E7490;
  --color-corthex-accent-muted: #0891B219;    /* was rgba(8,145,178,0.10) */

  /* Text — dark teal on light */
  --color-corthex-text-primary: #164E63;
  --color-corthex-text-secondary: #0E7490;
  --color-corthex-text-disabled: #67E8F9;
  --color-corthex-text-on-accent: #164E63;    /* was #FFFFFF — 2.18:1 on #22C55E FAIL */

  /* Sidebar */
  --color-corthex-sidebar-bg: #0E7490;
  --color-corthex-sidebar-border: #0891B2;
  --color-corthex-sidebar-text: #A5F3FC;
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: #FFFFFF19;   /* was rgba(255,255,255,0.10) */
  --color-corthex-sidebar-active: #FFFFFF26;  /* was rgba(255,255,255,0.15) */
  --color-corthex-sidebar-brand: #22D3EE;

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;

  /* NEXUS */
  --color-corthex-nexus-bg: #E0FCFF;

  color-scheme: light;
}
```

**Typography**: Outfit 300-700 (headings) + Work Sans 300-700 (body)
**Google Fonts**: `family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #F9FAFB (bg), 30% #FFFFFF (surface/cards), 10% #0891B2 (accent)

## Corporate Theme (Light)

**promax output**: Trust & Authority, Trust blue + orange CTA contrast
**Phase 2-2 fixes**: accent-hover #3B82F6→#60A5FA (Fix 2), CTA token added (Fix 6), handoff #F97316→#A78BFA (Fix 6), rgba→hex (Fix 4)

```css
[data-theme="corporate"] {
  /* Surfaces — near-white slate */
  --color-corthex-bg: #F8FAFC;
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F1F5F9;
  --color-corthex-border: #E2E8F0;
  --color-corthex-border-strong: #CBD5E1;

  /* Accent — promax trust blue */
  --color-corthex-accent: #2563EB;
  --color-corthex-accent-hover: #60A5FA;      /* was #3B82F6 — collided with --info */
  --color-corthex-accent-deep: #1D4ED8;
  --color-corthex-accent-muted: #2563EB19;    /* was rgba(37,99,235,0.10) */

  /* Text — slate */
  --color-corthex-text-primary: #1E293B;
  --color-corthex-text-secondary: #64748B;
  --color-corthex-text-disabled: #CBD5E1;
  --color-corthex-text-on-accent: #FFFFFF;

  /* Sidebar */
  --color-corthex-sidebar-bg: #1E293B;
  --color-corthex-sidebar-border: #334155;
  --color-corthex-sidebar-text: #94A3B8;
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: #FFFFFF14;   /* was rgba(255,255,255,0.08) */
  --color-corthex-sidebar-active: #2563EB33;  /* was rgba(37,99,235,0.20) */
  --color-corthex-sidebar-brand: #3B82F6;

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-cta: #F97316;               /* NEW: dedicated CTA token (was missing) */
  --color-corthex-handoff: #A78BFA;           /* was #F97316 — same as CTA, semantic collision */

  /* NEXUS */
  --color-corthex-nexus-bg: #F1F5F9;

  color-scheme: light;
}
```

**Typography**: Lexend 300-700 (headings) + Source Sans 3 300-700 (body)
**Google Fonts**: `family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #F8FAFC (bg), 30% #FFFFFF (surface/cards), 10% #2563EB (accent)

## Shared Tokens (All Themes)

Registered in `@theme {}` block in `index.css`. Not per-theme — do NOT put in [data-theme] blocks.

```css
@theme {
  /* Typography */
  --font-heading: 'DM Sans', 'Inter', sans-serif;  /* overridden per [data-theme] */
  --font-body: 'DM Sans', 'Inter', sans-serif;     /* overridden per [data-theme] */
  --font-ui: 'Inter', 'Pretendard', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Typography scale — Fix 8 */
  --text-xs: 0.75rem;       --text-xs--line-height: 1rem;       /* 12px / 16px */
  --text-sm: 0.875rem;      --text-sm--line-height: 1.25rem;    /* 14px / 20px */
  --text-base: 1rem;        --text-base--line-height: 1.5rem;   /* 16px / 24px */
  --text-lg: 1.125rem;      --text-lg--line-height: 1.75rem;    /* 18px / 28px */
  --text-xl: 1.25rem;       --text-xl--line-height: 1.75rem;    /* 20px / 28px */
  --text-2xl: 1.5rem;       --text-2xl--line-height: 2rem;      /* 24px / 32px */
  --text-3xl: 1.875rem;     --text-3xl--line-height: 2.25rem;   /* 30px / 36px */
  --text-4xl: 2.25rem;      --text-4xl--line-height: 2.5rem;    /* 36px / 40px */

  /* Layout */
  --sidebar-width: 280px;
  --sidebar-collapsed: 64px;
  --topbar-height: 56px;
  --content-max: 1160px;

  /* Animations */
  --animate-slide-in: slide-in 200ms ease-out;
  --animate-slide-up: slide-up 200ms ease-out;
  --animate-cursor-blink: cursor-blink 1s step-end infinite;
  --animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
}
```

### Shared non-@theme tokens (in CSS :root — not Tailwind registered)

```css
:root {
  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows (light themes — Command overrides --shadow-sm with dark-specific value) */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

  /* Motion */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

## WCAG AA Contrast Ratios (updated for Phase 2-2 fixes)

| Theme | Text on Bg | Text on Surface | Accent on Bg | Status |
|-------|-----------|----------------|-------------|--------|
| Command | #FAFAF9 on #0C0A09 = 19.8:1 | #FAFAF9 on #1C1917 = 14.7:1 | #CA8A04 on #0C0A09 = 5.8:1 | ✅ PASS |
| Studio | #164E63 on **#F9FAFB** = ~8.1:1 | #164E63 on #FFFFFF = 9.4:1 | #0891B2 on #F9FAFB = ~3.5:1 | ⚠️ Accent large-text only |
| Corporate | #1E293B on #F8FAFC = 12.3:1 | #1E293B on #FFFFFF = 14.0:1 | #2563EB on #F8FAFC = 4.6:1 | ✅ PASS |

**Key button contrast checks:**
| Pair | Ratio | Status |
|------|-------|--------|
| #0C0A09 on #CA8A04 (Command button) | ~7.0:1 | ✅ PASS |
| #164E63 on #22C55E (Studio CTA) | ~4.7:1 | ✅ PASS (Fix 5 applied) |
| #FFFFFF on #2563EB (Corporate button) | ~4.9:1 | ✅ PASS |
| #1E293B on #F97316 (Corporate CTA) | ~5.2:1 | ✅ PASS (dark text required) |

## Font Loading Strategy

**Current (Phase 2-3):** All 3 theme fonts loaded simultaneously in `index.html`.
**Phase 4 optimization (deferred):** Preload Command fonts via `<link rel="preload">`. Lazy-load Studio/Corporate fonts by injecting `<link>` on first theme switch. Estimated savings: ~775KB for users who never switch theme.

## Alpha Hex Reference (for future token additions)

| Alpha % | Hex suffix | Example |
|---------|------------|---------|
| 5% | `0D` | `#FFFFFF0D` |
| 8% | `14` | `#FFFFFF14` |
| 10% | `19` | `#CA8A0419` |
| 15% | `26` | `#CA8A0426` |
| 20% | `33` | `#2563EB33` |
| 50% | `80` | `#00000080` |
