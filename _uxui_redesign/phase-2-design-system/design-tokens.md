# CORTHEX Design Tokens — 3 Themes (promax + Phase 1 enhanced)

All colors from promax --design-system output, enhanced with Phase 1 visual research.
ZERO manually picked colors. All values traceable to promax or benchmark analysis.

## Theme Summary

| Token | Command (Dark) | Studio (Light) | Corporate (Light) |
|-------|---------------|----------------|-------------------|
| **Vibe** | Cyberpunk HUD, power user | Soft UI, collaborative | Trust & Authority |
| **Bg** | #0C0A09 | #ECFEFF | #F8FAFC |
| **Surface** | #1C1917 | #FFFFFF | #FFFFFF |
| **Elevated** | #292524 | #F0FDFA | #F1F5F9 |
| **Primary** | #CA8A04 (gold) | #0891B2 (cyan) | #2563EB (blue) |
| **Secondary** | #44403C | #22D3EE | #3B82F6 |
| **CTA** | #CA8A04 | #22C55E | #F97316 |
| **Text** | #FAFAF9 | #164E63 | #1E293B |
| **Text 2nd** | #A8A29E | #0E7490 | #64748B |
| **Border** | #292524 | #A5F3FC | #E2E8F0 |
| **Heading** | DM Sans | Outfit | Lexend |
| **Body** | DM Sans | Work Sans | Source Sans 3 |

## Command Theme (Dark)

**promax output**: Cyberpunk UI style, Premium dark + gold accent
**Phase 1 override**: Background changed from #FAFAF9 to #0C0A09 (Linear/Supabase/Retool pattern)

```css
[data-theme="command"] {
  /* Surfaces — near-black (promax #1C1917 primary as surface, Phase 1 dark bg pattern) */
  --color-corthex-bg: #0C0A09;
  --color-corthex-surface: #1C1917;
  --color-corthex-elevated: #292524;
  --color-corthex-border: #44403C;
  --color-corthex-border-strong: #57534E;

  /* Accent — promax gold #CA8A04 */
  --color-corthex-accent: #CA8A04;
  --color-corthex-accent-hover: #EAB308;
  --color-corthex-accent-deep: #A16207;
  --color-corthex-accent-muted: rgba(202, 138, 4, 0.10);

  /* Text — inverted for dark (promax bg #FAFAF9 becomes text color) */
  --color-corthex-text-primary: #FAFAF9;
  --color-corthex-text-secondary: #A8A29E;
  --color-corthex-text-disabled: #57534E;
  --color-corthex-text-on-accent: #0C0A09;

  /* Sidebar */
  --color-corthex-sidebar-bg: #0C0A09;
  --color-corthex-sidebar-border: #1C1917;
  --color-corthex-sidebar-text: #A8A29E;
  --color-corthex-sidebar-text-active: #FAFAF9;
  --color-corthex-sidebar-hover: rgba(202, 138, 4, 0.10);
  --color-corthex-sidebar-active: rgba(202, 138, 4, 0.15);

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;

  /* NEXUS */
  --color-corthex-nexus-bg: #0A0908;

  /* Color mode */
  color-scheme: dark;
}
```

**Typography**: DM Sans 400/500/700 (promax fallback for Satoshi/General Sans)
**Google Fonts**: `family=DM+Sans:wght@400;500;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #0C0A09 (bg), 30% #1C1917 (surface/cards), 10% #CA8A04 (accent/CTA)

## Studio Theme (Light)

**promax output**: Soft UI Evolution, Fresh cyan + clean green
**No Phase 1 override needed** — light theme matches Notion/Plane/Dub patterns.

```css
[data-theme="studio"] {
  /* Surfaces — fresh cyan tint (promax #ECFEFF) */
  --color-corthex-bg: #ECFEFF;
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F0FDFA;
  --color-corthex-border: #A5F3FC;
  --color-corthex-border-strong: #67E8F9;

  /* Accent — promax cyan #0891B2 */
  --color-corthex-accent: #0891B2;
  --color-corthex-accent-hover: #06B6D4;
  --color-corthex-accent-deep: #0E7490;
  --color-corthex-accent-muted: rgba(8, 145, 178, 0.10);

  /* Text — promax dark teal #164E63 */
  --color-corthex-text-primary: #164E63;
  --color-corthex-text-secondary: #0E7490;
  --color-corthex-text-disabled: #67E8F9;
  --color-corthex-text-on-accent: #FFFFFF;

  /* Sidebar */
  --color-corthex-sidebar-bg: #0E7490;
  --color-corthex-sidebar-border: #0891B2;
  --color-corthex-sidebar-text: #A5F3FC;
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: rgba(255, 255, 255, 0.10);
  --color-corthex-sidebar-active: rgba(255, 255, 255, 0.15);

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #A78BFA;

  /* NEXUS */
  --color-corthex-nexus-bg: #E0FCFF;

  /* Color mode */
  color-scheme: light;
}
```

**Typography**: Outfit 300-700 (headings) + Work Sans 300-700 (body)
**Google Fonts**: `family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #ECFEFF (bg), 30% #FFFFFF (surface/cards), 10% #0891B2 (accent/CTA)

## Corporate Theme (Light)

**promax output**: Trust & Authority, Trust blue + orange CTA contrast
**No Phase 1 override needed** — matches Vercel/Clerk/Stripe professional patterns.

```css
[data-theme="corporate"] {
  /* Surfaces — near-white slate (promax #F8FAFC) */
  --color-corthex-bg: #F8FAFC;
  --color-corthex-surface: #FFFFFF;
  --color-corthex-elevated: #F1F5F9;
  --color-corthex-border: #E2E8F0;
  --color-corthex-border-strong: #CBD5E1;

  /* Accent — promax blue #2563EB */
  --color-corthex-accent: #2563EB;
  --color-corthex-accent-hover: #3B82F6;
  --color-corthex-accent-deep: #1D4ED8;
  --color-corthex-accent-muted: rgba(37, 99, 235, 0.10);

  /* Text — promax slate #1E293B */
  --color-corthex-text-primary: #1E293B;
  --color-corthex-text-secondary: #64748B;
  --color-corthex-text-disabled: #CBD5E1;
  --color-corthex-text-on-accent: #FFFFFF;

  /* Sidebar */
  --color-corthex-sidebar-bg: #1E293B;
  --color-corthex-sidebar-border: #334155;
  --color-corthex-sidebar-text: #94A3B8;
  --color-corthex-sidebar-text-active: #FFFFFF;
  --color-corthex-sidebar-hover: rgba(255, 255, 255, 0.08);
  --color-corthex-sidebar-active: rgba(37, 99, 235, 0.20);

  /* Semantic */
  --color-corthex-success: #22C55E;
  --color-corthex-warning: #EAB308;
  --color-corthex-error: #EF4444;
  --color-corthex-info: #3B82F6;
  --color-corthex-handoff: #F97316;

  /* NEXUS */
  --color-corthex-nexus-bg: #F1F5F9;

  /* Color mode */
  color-scheme: light;
}
```

**Typography**: Lexend 300-700 (headings) + Source Sans 3 300-700 (body)
**Google Fonts**: `family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700`
**Mono**: JetBrains Mono (existing, keep)
**60-30-10**: 60% #F8FAFC (bg), 30% #FFFFFF (surface/cards), 10% #2563EB (accent/CTA)

## Shared Tokens (All Themes)

```css
:root {
  /* Layout */
  --sidebar-width: 280px;
  --sidebar-collapsed: 64px;
  --topbar-height: 56px;
  --content-max: 1160px;

  /* Spacing (4px base) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

  /* Motion */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* Animations */
  --animate-slide-in: slide-in 200ms ease-out;
  --animate-slide-up: slide-up 200ms ease-out;

  /* Icon library: Lucide React (existing) */
  /* Mono font: JetBrains Mono (existing) */
}
```

## WCAG AA Contrast Ratios

| Theme | Text on Bg | Text on Surface | Accent on Bg | Status |
|-------|-----------|----------------|-------------|--------|
| Command | #FAFAF9 on #0C0A09 = 19.8:1 | #FAFAF9 on #1C1917 = 14.7:1 | #CA8A04 on #0C0A09 = 5.8:1 | PASS |
| Studio | #164E63 on #ECFEFF = 8.2:1 | #164E63 on #FFFFFF = 9.4:1 | #0891B2 on #ECFEFF = 3.4:1 | PASS (large text) |
| Corporate | #1E293B on #F8FAFC = 12.3:1 | #1E293B on #FFFFFF = 14.0:1 | #2563EB on #F8FAFC = 4.6:1 | PASS |
