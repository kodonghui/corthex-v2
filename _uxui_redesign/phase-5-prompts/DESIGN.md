# CORTHEX v3 — Design System for Stitch 2

**Project:** CORTHEX — AI Agent Orchestration Platform
**Design Language:** "Controlled Nature" — structural precision wrapped in organic warmth
**Palette Name:** Sovereign Sage
**Framework:** React 19 + Tailwind CSS v4 + Radix UI primitives
**Component System:** shadcn/ui pattern (CVA + cn() + Radix)
**Icon Library:** Lucide React (pinned version, tree-shaken)
**Target:** WCAG 2.1 AA compliant, light mode only

---

## 1. Brand Identity

### Brand Name
**CORTHEX** — AI Agent Orchestration Platform

### Tagline
> "Your AI organization, alive and accountable."

### Brand Personality

| Trait | Expression | Anti-Pattern |
|-------|-----------|-------------|
| **Authoritative** | Dark olive sidebar, structured grid, command-center layout | Not militaristic — warm, not cold |
| **Organic** | Cream/olive/sage palette derived from natural materials | Not sterile — living, not clinical |
| **Intelligent** | Clean Inter typography, precise 8px grid, data-rich dashboards | Not cluttered — curated, not overwhelming |
| **Trustworthy** | Consistent token usage, clear feedback, honest error states | Not opaque — transparent, not hidden |

### Archetype
- **Primary:** The Ruler — control, order, leadership, accountability
- **Secondary:** The Sage — wisdom, analysis, knowledge, precision

### Design Philosophy
**"Controlled Nature"** — The precision of a command center wrapped in the warmth of natural materials. Inspired by Dieter Rams ("Less, but better"), Massimo Vignelli (systematic grid), and Wabi-sabi (beauty in natural materials).

### Brand Typography Treatment
- Brand name "CORTHEX": `text-lg` (18px), `font-semibold` (600 weight), Inter
- Always rendered in Latin characters, never translated

---

## 2. Color Palette

### 2.1 Primary Palette — 60-30-10 Rule

#### 60% Dominant — Backgrounds & Surfaces

| Role | Token | Hex | RGB | Tailwind Class |
|------|-------|-----|-----|----------------|
| Page background | `--color-corthex-bg` | `#faf8f5` | 250, 248, 245 | `bg-corthex-bg` |
| Card/panel surface | `--color-corthex-surface` | `#f5f0e8` | 245, 240, 232 | `bg-corthex-surface` |
| Elevated surface | `--color-corthex-elevated` | `#f0ebe0` | 240, 235, 224 | `bg-corthex-elevated` |
| Decorative border | `--color-corthex-border` | `#e5e1d3` | 229, 225, 211 | `border-corthex-border` |
| Hover border | `--color-corthex-border-strong` | `#d4cfc4` | 212, 207, 196 | `border-corthex-border-strong` |
| Input border | `--color-corthex-border-input` | `#908a78` | 144, 138, 120 | `border-corthex-border-input` |

#### 30% Secondary — Chrome (Sidebar, Drawers)

| Role | Token | Hex | Tailwind Class |
|------|-------|-----|----------------|
| Sidebar background | `--color-corthex-chrome` | `#283618` | `bg-corthex-chrome` |
| Sidebar hover | `--color-corthex-chrome-hover` | `rgba(255,255,255,0.10)` | `bg-corthex-chrome-hover` |
| Sidebar active | `--color-corthex-chrome-active` | `rgba(255,255,255,0.15)` | `bg-corthex-chrome-active` |

#### 10% Accent — Interactive Elements

| Role | Token | Hex | Tailwind Class |
|------|-------|-----|----------------|
| Primary accent | `--color-corthex-accent` | `#606C38` | `bg-corthex-accent` |
| Accent hover | `--color-corthex-accent-hover` | `#4e5a2b` | `bg-corthex-accent-hover` |
| Secondary accent | `--color-corthex-accent-secondary` | `#5a7247` | `bg-corthex-accent-secondary` |
| Accent muted | `--color-corthex-accent-muted` | `rgba(96,108,56,0.10)` | `bg-corthex-accent-muted` |

### 2.2 Text Colors

| Role | Token | Hex | Contrast on `#faf8f5` | Tailwind Class |
|------|-------|-----|-----------------------|----------------|
| Primary text | `--color-corthex-text-primary` | `#1a1a1a` | 16.42:1 | `text-corthex-text-primary` |
| Secondary text | `--color-corthex-text-secondary` | `#6b705c` | 4.83:1 | `text-corthex-text-secondary` |
| Tertiary/placeholder | `--color-corthex-text-tertiary` | `#756e5a` | 4.79:1 | `text-corthex-text-tertiary` |
| Disabled text | `--color-corthex-text-disabled` | `#a3a08e` | 2.48:1 (decorative only) | `text-corthex-text-disabled` |
| Text on accent bg | `--color-corthex-text-on-accent` | `#ffffff` | 5.68:1 on `#606C38` | `text-corthex-text-on-accent` |
| Chrome text | `--color-corthex-text-chrome` | `#a3c48a` | 6.63:1 on `#283618` | `text-corthex-text-chrome` |
| Chrome text dim | `--color-corthex-text-chrome-dim` | `rgba(163,196,138,0.80)` | 4.86:1 on `#283618` | `text-corthex-text-chrome-dim` |

### 2.3 Semantic Colors

| Role | Token | Hex | Contrast | Paired Icon | Tailwind Class |
|------|-------|-----|----------|-------------|----------------|
| Success | `--color-corthex-success` | `#4d7c0f` | 4.71:1 | `CheckCircle` | `text-corthex-success` |
| Warning | `--color-corthex-warning` | `#b45309` | 4.74:1 | `AlertTriangle` | `text-corthex-warning` |
| Error | `--color-corthex-error` | `#dc2626` | 4.56:1 | `AlertCircle` | `text-corthex-error` |
| Info | `--color-corthex-info` | `#2563eb` | 4.88:1 | `Info` | `text-corthex-info` |
| Handoff | `--color-corthex-handoff` | `#7c3aed` | 5.38:1 | `ArrowRightLeft` | `text-corthex-handoff` |

**Rule:** Never use color alone to convey information. Every semantic color must be paired with an icon AND text label.

**Success ≈ Accent disambiguation:** `--color-corthex-success` (#4d7c0f) and `--color-corthex-accent` (#606C38) are both olive-family greens at only 1.14:1 contrast. This is intentional (Natural Organic palette), but requires mandatory disambiguation:
- **Success indicators** MUST use `CheckCircle` icon + text label ("완료"/"온라인") + `bg-corthex-success/15` background tint
- **Accent/active indicators** use `bg-corthex-accent-muted` background tint WITHOUT a dot or icon
- Never rely on a green dot alone to distinguish "online" from "selected"

### 2.4 Chart Palette (Data Visualization)

| Index | Token | Hex | Hue Family |
|-------|-------|-----|------------|
| 1 | `--color-corthex-chart-1` | `#606C38` | Olive (green) |
| 2 | `--color-corthex-chart-2` | `#2563eb` | Blue |
| 3 | `--color-corthex-chart-3` | `#E07B5F` | Salmon/coral (red) |
| 4 | `--color-corthex-chart-4` | `#b45309` | Amber (orange) |
| 5 | `--color-corthex-chart-5` | `#D4C5A9` | Sand |
| 6 | `--color-corthex-chart-6` | `#A68A64` | Warm brown |

**Color-blind safety:** 4 distinct hue families. Charts with >3 series must support pattern fills (dashed, dotted, hatched) as secondary differentiator.

**No provider colors:** Dashboard AI usage charts use this chart palette, NOT hardcoded Anthropic/OpenAI/Google brand colors.

### 2.5 Focus & Interaction States

| State | Token | Value | Tailwind |
|-------|-------|-------|----------|
| Focus ring (light bg) | `--color-corthex-focus` | `#606C38` (5.35:1) | `ring-corthex-focus` |
| Focus ring (dark bg) | `--color-corthex-focus-chrome` | `#a3c48a` (6.63:1) | `ring-corthex-focus-chrome` |
| Focus ring offset | — | `2px` | `ring-offset-2` |
| Selection bg | `--color-corthex-selection` | `rgba(96,108,56,0.15)` | `bg-corthex-selection` |
| Hover (light surface) | — | `rgba(0,0,0,0.04)` | `hover:bg-black/4` |
| Hover (dark chrome) | — | `rgba(255,255,255,0.10)` | `hover:bg-white/10` |

---

## 3. Typography

### 3.1 Font Stack

| Role | Font Family | Weights | Fallback Chain | Source |
|------|------------|---------|----------------|--------|
| UI (primary) | Inter | 400, 500, 600, 700 | Pretendard, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif | `@fontsource/inter` (self-hosted) |
| Code/monospace | JetBrains Mono | 400, 500 | Fira Code, Cascadia Code, monospace | `@fontsource/jetbrains-mono` (self-hosted) |
| Korean serif | Noto Serif KR | 400, 700 | Batang, serif | `@fontsource-variable/noto-serif-kr` (self-hosted, long-form Korean only) |

**Self-hosted via @fontsource.** No Google Fonts CDN — no external network dependency, no GDPR tracking, no FOIT/FOUT.

**Two-font rule:** Maximum 2 fonts in any single view — Inter for UI, JetBrains Mono for data/code.

### 3.2 Type Scale (Major Third — 1.250 ratio)

| Token | Size | Line Height | Letter Spacing | Weight | Usage |
|-------|------|-------------|----------------|--------|-------|
| `text-xs` | 12px (0.75rem) | 1.5 (18px) | 0 | 400–600 | Labels, badges, timestamps, section headers |
| `text-sm` | 14px (0.875rem) | 1.5 (21px) | 0 | 400–500 | Body text, nav items, form inputs, table cells |
| `text-base` | 16px (1rem) | 1.5 (24px) | 0 | 400–500 | Emphasized body, card descriptions |
| `text-lg` | 18px (1.125rem) | 1.5 (27px) | 0 | 500–600 | Section headings, card titles, brand "CORTHEX" |
| `text-xl` | 20px (1.25rem) | 1.4 (28px) | -0.01em | 600 | Page subtitles |
| `text-2xl` | 24px (1.5rem) | 1.3 (31px) | -0.02em | 600 | Page titles |
| `text-3xl` | 32px (2rem) | 1.2 (38px) | -0.02em | 700 | Hero headings (Dashboard, Hub welcome) |
| `text-4xl` | 40px (2.5rem) | 1.1 (44px) | -0.03em | 700 | Landing page hero only |
| `text-5xl` | 48px (3rem) | 1.1 (53px) | -0.03em | 700 | Landing hero override |

### 3.3 Typography Rules

| Rule | Application |
|------|------------|
| Weight hierarchy | 400 (body) → 500 (emphasis/nav active) → 600 (headings) → 700 (brand/hero). Never skip. |
| Monospace for data | Agent IDs, cost values (`$0.0042`), API endpoints, code blocks, build numbers — always `font-mono` (JetBrains Mono) |
| Brand "CORTHEX" | `text-lg` (18px) / `font-semibold` (600). Uppercase letters, no stylization. |
| Negative tracking | Headings >=20px use negative `letter-spacing` for tighter display type feel |
| Section headers (sidebar) | `text-xs` / `font-semibold` (600) / `uppercase` / `tracking-widest` (0.05em) |
| Korean text | Inter handles Korean glyphs via fallback chain. No font switch for mixed KR/EN content. |

---

## 4. Spacing

### 4.1 Base Grid: 8px

All spacing values are multiples of 8px with a 4px half-step for tight contexts.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-0.5` | 4px | `p-1` / `gap-1` | Icon-text gap, inline badge padding |
| `space-1` | 8px | `p-2` / `gap-2` | Tight padding (pills, tags), compact button padding |
| `space-1.5` | 12px | `p-3` / `gap-3` | Nav item horizontal padding, input padding |
| `space-2` | 16px | `p-4` / `gap-4` | Card internal padding, form field gap |
| `space-3` | 24px | `p-6` / `gap-6` | Content area padding, section gap, card grid gap |
| `space-4` | 32px | `p-8` / `gap-8` | Page content padding (2:1 ratio vs card padding) |
| `space-6` | 48px | `p-12` | Major section dividers |
| `space-8` | 64px | `p-16` | Page top/bottom margins |
| `space-12` | 96px | `p-24` | Landing page section vertical padding |

### 4.2 Spacing Ratios

| Context | Inner | Outer | Ratio |
|---------|-------|-------|-------|
| Nav items within section | 4px | 20px (section gap) | 5:1 |
| Card content → page padding | 16px | 32px | 2:1 |
| Dashboard card gap → section gap | 24px | 48px | 2:1 |
| Table rows → table section | 8px | 24px | 3:1 |

### 4.3 Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-sm` | 4px | `rounded-sm` | Small pills, inline badges |
| `--radius-md` | 8px | `rounded-lg` | Buttons, inputs, small cards |
| `--radius-lg` | 12px | `rounded-xl` | Cards, panels, modals |
| `--radius-xl` | 16px | `rounded-2xl` | Large feature cards, hero sections |
| `--radius-full` | 9999px | `rounded-full` | Avatars, status dots, FAB, tier badges |

### 4.4 Shadow / Elevation

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--shadow-none` | `none` | `shadow-none` | Flat surfaces (default) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Cards on cream bg, dropdowns |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `shadow-md` | Modals, drawers, floating panels |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.10)` | `shadow-lg` | Toasts, popovers, command palette |

**Rules:**
- Shadows indicate z-order ONLY — never decorative
- Never combine shadow + border on the same element
- **Mobile exception:** Cards on mobile MAY use `shadow-sm` alongside `border-corthex-border` for outdoor visibility — the cream→surface contrast (3% luminance) is insufficient in bright ambient light. This is the ONLY permitted shadow+border combination.
- Borders (`border-corthex-border`) handle same-level visual separation

### 4.5 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Content area elements |
| `z-sticky` | 10 | Sticky headers, sticky table headers |
| `z-sidebar` | 20 | Sidebar (desktop) |
| `z-overlay` | 30 | Drawer/sheet backdrop, bottom nav, FAB |
| `z-drawer` | 40 | Mobile drawer, bottom sheet |
| `z-dropdown` | 50 | Dropdown menus, select popover |
| `z-modal` | 60 | Dialog modals |
| `z-toast` | 70 | Toast notifications |
| `z-tooltip` | 80 | Tooltips |
| `z-command` | 100 | Cmd+K command palette (supreme) |

---

## 5. Component Rules

### 5.1 Component Architecture

All components use the **shadcn/ui pattern**: CVA (class-variance-authority) + `cn()` (clsx + tailwind-merge) + Radix UI primitives where applicable.

```tsx
// Pattern: every component follows this structure
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva('base-classes-using-corthex-tokens', {
  variants: {
    variant: { default: '...', secondary: '...', ghost: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
```

### 5.2 Button Variants

| Variant | Background | Text | Hover | Usage |
|---------|-----------|------|-------|-------|
| `default` | `bg-corthex-accent` | `text-corthex-text-on-accent` | `hover:bg-corthex-accent-hover` | Primary actions |
| `secondary` | `bg-corthex-accent-secondary` | `text-corthex-text-on-accent` | `hover:bg-corthex-accent-hover` | Secondary actions |
| `outline` | `bg-transparent` + `border-corthex-border-input` | `text-corthex-text-primary` | `hover:bg-corthex-surface` | Tertiary actions |
| `ghost` | `bg-transparent` | `text-corthex-text-primary` | `hover:bg-corthex-surface` | Subtle actions |
| `destructive` | `bg-corthex-error` | `text-white` | `hover:bg-corthex-error/90` | Dangerous actions |
| `inverse` | `bg-white/15` | `text-corthex-text-chrome` | `hover:bg-white/25` | On dark chrome surfaces |
| `link` | `bg-transparent` | `text-corthex-accent-secondary` + `underline` | `hover:text-corthex-accent` | Inline text links |

### 5.3 Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `default` | 44px (`h-11`) | `px-4 py-2` | `text-sm` (14px) |
| `sm` | 32px (`h-8`) | `px-3` | `text-xs` (12px) |
| `lg` | 48px (`h-12`) | `px-6` | `text-base` (16px) |
| `icon` | 44px (`h-11 w-11`) | — | — |

**Touch target rule:** Default button height is 44px (WCAG AAA). `size="sm"` is desktop-only; mobile must override to 44px minimum.

### 5.4 Card Pattern

```tsx
<div className="bg-corthex-surface border border-corthex-border rounded-xl p-4">
  <h3 className="text-corthex-text-primary text-lg font-semibold">Title</h3>
  <p className="text-corthex-text-secondary text-sm mt-1">Description</p>
</div>
```

### 5.5 Input Pattern

```tsx
<input className="w-full h-11 px-3 rounded-lg border border-corthex-border-input
                  bg-corthex-bg text-corthex-text-primary text-sm
                  placeholder:text-corthex-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
                  disabled:opacity-50 disabled:pointer-events-none" />
```

**Critical:** Input borders MUST use `border-corthex-border-input` (`#908a78`, 3.25:1) — NOT `border-corthex-border` (`#e5e1d3`, 1.23:1 FAILS WCAG 1.4.11).

### 5.6 Badge Pattern

```tsx
<!-- Status badge with icon + text (never color alone) -->
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                 bg-corthex-success/15 text-corthex-success text-xs font-medium">
  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
  Online
</span>
```

### 5.7 ARIA Directives

All generated pages must include correct ARIA semantics:

| Element | ARIA Requirement |
|---------|-----------------|
| Main content area | `<main role="main">` (one per page) |
| Navigation sections | `<nav aria-label="Main navigation">` (sidebar), `<nav aria-label="Breadcrumb">` (breadcrumbs) |
| Active nav item | `aria-current="page"` on the active link |
| Sidebar sections | `role="group"` + `aria-labelledby` referencing section header ID |
| Dialog/Modal | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (title) |
| Live notification count | `aria-live="polite"` on notification badge counter |
| Error alerts | `aria-live="assertive"` on error toast/banner containers |
| Streaming text output | `aria-live="polite"` + `aria-atomic="false"` on chat message container |
| Loading states | `aria-busy="true"` on container while loading, `aria-busy="false"` when done |
| Icon-only buttons | `aria-label="descriptive text"` (mandatory — no icon-only buttons without label) |
| Decorative icons | `aria-hidden="true"` |
| Status indicators | Pair `aria-label` on the status container (e.g., `aria-label="Status: Online"`) |
| Form error messages | `aria-describedby` linking input to error message element |
| Skip navigation link | `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` as first element |
| Reduced motion | Wrap all animations in `prefers-reduced-motion` media query (see Section 9.4) |

### 5.8 Dialog/Drawer Overlay

Overlay color: `bg-corthex-chrome/40` (olive-tinted translucent). Maintains Natural Organic warmth. Never use pure black overlay.

### 5.9 Component Token Rules

1. All color classes use `corthex-*` tokens — never hardcoded hex, never `indigo-*` / `zinc-*`
2. Opacity modifiers on tokens are acceptable: `bg-corthex-error/90`, `bg-corthex-accent/15`
3. Focus rings: `ring-corthex-focus` on light bg, `ring-corthex-focus-chrome` on dark bg
4. Transition scope: Use `transition-colors` for color-only effects, `transition-[transform,opacity]` for layout. Never `transition-all`
5. Inverse variant required for components on chrome surfaces (sidebar, drawer)

---

## 6. Layout Rules

### 6.1 App Shell Dimensions

| Element | Value | Token |
|---------|-------|-------|
| Sidebar width | 280px | `--sidebar-width` |
| Sidebar collapsed | 64px | `--sidebar-collapsed` |
| Topbar height | 56px (h-14) | `--topbar-height` |
| Content max-width | 1440px | `--content-max` |
| Content padding | 32px (p-8) | — |
| Feed max-width | 720px | `--feed-max` |
| Master-detail list width | 280px | `--master-width` |

### 6.2 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile (sm) | < 640px | Single column, hamburger nav, stacked cards |
| Tablet (md) | 640–1023px | Single column wider, hamburger nav |
| Desktop (lg) | 1024–1439px | Sidebar visible, 2-column grids |
| Wide (xl) | >= 1440px | Sidebar visible, 3-column grids, max-width container |

### 6.3 Seven Layout Types

| Type | Structure | Pages Using It |
|------|-----------|---------------|
| **Dashboard** | Auto-fit grid (`grid-cols-[repeat(auto-fit,minmax(320px,1fr))]`) | Hub, Dashboard |
| **Master-Detail** | 280px list + flex content | Agents, Departments, Messenger, Notifications |
| **Canvas** | Full-bleed viewport (no max-width) | NEXUS |
| **CRUD** | Single centered column (max-width 720–960px) | Settings, Tiers |
| **Tabbed** | Tab bar + content panel | Settings (10 tabs), Reports |
| **Panels** | 2×2 or side-by-side panels | Trading (4 panels), Chat |
| **Feed** | Centered 720px column | Activity Log, SNS, Agora, Ops Log |

### 6.4 Mobile Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed left panel (280px) | Hamburger → overlay slide-in (backdrop blur) |
| Trading 4-panel | Side-by-side | Tab navigation between panels |
| Messenger 3-column | All three visible | Channel list = overlay drawer |
| Dashboard grid | 3-column metric cards | Single column stacked |
| NEXUS canvas | Full viewport with pan/zoom | Pinch-to-zoom |
| Tables | Full columns | Horizontal scroll or card view |

### 6.5 Touch Targets

| Context | Minimum Size | Implementation |
|---------|-------------|----------------|
| Desktop nav items | 36px height | `py-2` + 20px content |
| Mobile/touch nav items | 44px height | `py-3` + 20px content |
| Buttons | 44px height | `h-11` minimum |
| Bottom nav tabs | 56px height | Full 1/5 viewport width |
| FAB | 56px diameter | `w-14 h-14 rounded-full` |

---

## 7. Icon Library

### 7.1 System: Lucide React

**Lucide React exclusively.** No Material Symbols, no custom SVGs for standard UI. Tree-shaken per-icon — only imported icons are bundled.

| Property | Value |
|----------|-------|
| Library | `lucide-react` (pinned version, no ^) |
| Stroke width | 2px (Lucide default) |
| Color | `currentColor` — inherits from parent text color |
| Rendering | Inline SVG (not font icons) |

### 7.2 Icon Sizes

| Context | Size | Tailwind |
|---------|------|----------|
| Inline / button icon | 16px | `w-4 h-4` |
| Navigation items | 20px | `w-5 h-5` |
| Page headers | 24px | `w-6 h-6` |
| Empty state illustrations | 48px | `w-12 h-12` |

### 7.3 Icon Accessibility

| Context | Rule |
|---------|------|
| Decorative icons | `aria-hidden="true"` — hidden from screen readers |
| Interactive icons (icon-only buttons) | `aria-label="Description"` — accessible name required |
| Status icons | Paired with text label + color — never icon + color alone |
| Active nav item | Visual styling + `aria-current="page"` |

### 7.4 Status Indicators

| Status | Visual | Color Token | Icon | Animation |
|--------|--------|-------------|------|-----------|
| Online | Solid dot | `--color-corthex-success` | `Circle` (filled) | None |
| Working | Pulse dot | `--color-corthex-accent` | `Circle` (filled) | `pulse-dot` 2s infinite |
| Error | Solid dot + icon | `--color-corthex-error` | `AlertCircle` | None |
| Offline | Ring dot | `--color-corthex-text-tertiary` | `Circle` (stroke only) | None |

### 7.5 Sidebar Navigation Icon Map

| Page | Icon | Import |
|------|------|--------|
| Hub | `LayoutDashboard` | `lucide-react` |
| Dashboard | `BarChart3` | `lucide-react` |
| Chat | `MessageSquare` | `lucide-react` |
| Agents | `Bot` | `lucide-react` |
| Departments | `Building2` | `lucide-react` |
| Tiers | `Layers` | `lucide-react` |
| NEXUS | `Network` | `lucide-react` |
| Jobs | `Clock` | `lucide-react` |
| Reports | `FileText` | `lucide-react` |
| Knowledge | `BookOpen` | `lucide-react` |
| SNS | `Share2` | `lucide-react` |
| Trading | `TrendingUp` | `lucide-react` |
| Costs | `DollarSign` | `lucide-react` |
| Settings | `Settings` | `lucide-react` |
| Notifications | `Bell` | `lucide-react` |
| Messenger | `MessagesSquare` | `lucide-react` |
| Agora | `Users` | `lucide-react` |
| Performance | `Activity` | `lucide-react` |
| Workflows | `Workflow` | `lucide-react` |
| Activity Log | `ScrollText` | `lucide-react` |
| Ops Log | `Terminal` | `lucide-react` |
| Classified | `Lock` | `lucide-react` |
| Files | `FolderOpen` | `lucide-react` |

---

## 8. Dark/Light Mode

### Declaration

```
color-mode: "light"
```

**CORTHEX v3 ships with light mode only.** The Natural Organic palette (cream, olive, sage, sand) is optimized for light backgrounds.

### Rationale

1. The 5-theme system from v2 is **deprecated** — caused the 428-location `color-mix` incident
2. The olive sidebar provides the "dark element" — structural contrast without inverting the entire UI
3. Dark mode can be added later as a single alternative theme

### System Preferences

| Preference | Behavior |
|-----------|----------|
| `prefers-color-scheme: dark` | Ignored — light theme always applied |
| `prefers-reduced-motion: reduce` | All animations disabled (see Section 9) |
| `prefers-contrast: more` | Rely on existing 4.5:1+ text contrast |
| `forced-colors: active` | Border fallbacks applied for Windows High Contrast Mode |

### Forced Colors Fallback

```css
@media (forced-colors: active) {
  .sidebar { border-right: 1px solid ButtonText; }
  .card { border: 1px solid ButtonText; }
  .bottom-sheet { border-top: 2px solid ButtonText; }
}
```

---

## 9. Animation

### 9.1 Principles

1. **Purposeful only.** Animation communicates state change (open/close, enter/exit, loading) — not decoration.
2. **Respect user preference.** All animations wrapped in `prefers-reduced-motion` media query.
3. **Performance budget.** Only `transform` and `opacity` properties animated — never layout-triggering properties (width, height, top, left, margin, padding).
4. **No page transitions.** Route changes are instant swaps via React.lazy.

### 9.2 Duration Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | 0ms | — | Route changes, reduced-motion fallback |
| `--duration-fast` | 100ms | `ease-out` | Hover states, focus rings, button press |
| `--duration-normal` | 200ms | `ease-in-out` | Modal open/close, command palette, sidebar collapse |
| `--duration-slow` | 300ms | `ease-in-out` | Mobile drawer slide, bottom sheet snap |
| `--duration-scroll-reveal` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Landing page scroll reveal (landing only) |
| `--duration-pulse` | 2000ms | `ease-in-out` (infinite) | Working status indicator pulse |

### 9.3 Transition Patterns

| Context | Animation | Reduced-Motion Fallback |
|---------|-----------|------------------------|
| Sidebar mobile open | `translateX(-100% → 0)` 300ms | Instant show |
| Modal open | `opacity(0→1) + scale(0.95→1)` 200ms | Instant show |
| Bottom sheet snap | `translateY` to snap point, 300ms | Instant position |
| Toast enter | `translateY(100% → 0)` 200ms | Instant show |
| Command palette open | `opacity(0→1) + scale(0.98→1)` 200ms | Instant show |
| Streaming text | Character-by-character reveal | Instant paragraph show |
| Agent status pulse | `opacity 1→0.5→1` cycle 2s | Static dot (no pulse) |
| Hover state | `background-color` 100ms | Instant color change |
| Page route change | None (instant swap) | Same |

### 9.4 Reduced Motion Override

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 10. Do's and Don'ts

### DO

| Category | Rule |
|----------|------|
| **Colors** | Use `corthex-*` token classes for ALL colors (`bg-corthex-accent`, `text-corthex-text-primary`) |
| **Colors** | Use opacity modifiers on tokens when needed (`bg-corthex-error/90`, `bg-corthex-accent/15`) |
| **Colors** | Apply 60-30-10 rule: 60% cream surfaces, 30% olive chrome, 10% sage accent |
| **Borders** | Use `border-corthex-border-input` (`#908a78`) for form control boundaries (inputs, selects, textareas) |
| **Borders** | Use `border-corthex-border` (`#e5e1d3`) for decorative dividers and card outlines |
| **Typography** | Use `font-mono` (JetBrains Mono) for all machine-readable data: costs, IDs, code |
| **Typography** | Follow weight hierarchy: 400 → 500 → 600 → 700, never skip |
| **Icons** | Use Lucide React exclusively with `currentColor` inheritance |
| **Icons** | Add `aria-hidden="true"` on decorative icons, `aria-label` on interactive |
| **Status** | Always pair semantic color with icon AND text label |
| **Focus** | Use `ring-corthex-focus` on light backgrounds, `ring-corthex-focus-chrome` on dark |
| **Spacing** | Follow 8px grid strictly. Card padding 16px, page padding 32px (2:1 ratio) |
| **Shadows** | Use shadows ONLY for z-order (elements floating above surface) |
| **Motion** | Use `transition-colors` for color-only hover effects |
| **A11y** | Maintain minimum 4.5:1 contrast for normal text, 3:1 for UI components |
| **Overlay** | Use `bg-corthex-chrome/40` (olive-tinted) for dialog/drawer overlays |

### DON'T

| Category | Anti-Pattern |
|----------|-------------|
| **Colors** | Never hardcode hex values in component classes (`bg-[#606C38]`) |
| **Colors** | Never use Tailwind default palette colors (`bg-indigo-600`, `bg-zinc-800`, `bg-blue-500`) |
| **Colors** | Never use color alone to convey information — always pair with icon + text |
| **Colors** | Never use provider brand colors in charts (no Anthropic purple, no OpenAI green) |
| **Borders** | Never use `border-corthex-border` for input/form control boundaries (1.23:1 FAILS WCAG) |
| **Borders** | Never combine shadow + border on the same element (exception: mobile cards may use `shadow-sm` + border for outdoor visibility) |
| **Typography** | Never use more than 2 fonts in a single view |
| **Typography** | Never skip font weights (e.g., jumping from 400 directly to 700) |
| **Typography** | Never use `text-4xl` or `text-5xl` in the CEO app — these are landing page only |
| **Icons** | Never use Material Symbols, Font Awesome, or custom SVGs for standard UI |
| **Icons** | Never create icon-only buttons without `aria-label` |
| **Motion** | Never animate layout-triggering properties (width, height, margin, padding) |
| **Motion** | Never use `transition-all` — specify exact properties |
| **Motion** | Never add page transition animations between routes |
| **Overlay** | Never use pure black (`bg-black/50`) for dialog overlays |
| **Spacing** | Never use arbitrary spacing values outside the 8px grid |
| **Focus** | Never use `accent-primary` (#606C38) for focus rings on dark chrome (2.27:1 FAILS) |

---

## 11. App Shell Rule (CRITICAL)

### Content Area Only

**When generating page designs, generate ONLY the content area.** The App Shell (sidebar + topbar) is pre-built and must NOT be included in page-level designs.

### What the App Shell Provides (DO NOT GENERATE)

- **Left sidebar** (280px, `#283618` olive dark background) with navigation
- **Top bar** (56px height) with page title, search, notifications bell, user avatar
- **Mobile hamburger** menu (below 1024px breakpoint)
- **Bottom navigation** bar (mobile only)

### What You MUST Generate (Content Area Only)

- Everything inside the content area: `<main>` element
- Content padding: 32px (`p-8`)
- Content max-width: 1440px (`max-w-[1440px] mx-auto`)
- Page title heading (if separate from topbar)
- All page-specific components, grids, cards, tables, charts

### App Shell Structure Reference

```
┌──────────────────────────────────────────────┐
│ ┌──────┬───────────────────────────────────┐  │
│ │      │         TOPBAR (56px)             │  │
│ │      ├───────────────────────────────────┤  │
│ │ SIDE │                                   │  │
│ │ BAR  │     CONTENT AREA (generate this)  │  │
│ │      │     max-width: 1440px             │  │
│ │ 280px│     padding: 32px                 │  │
│ │      │                                   │  │
│ │      │                                   │  │
│ └──────┴───────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Content Area Template

```tsx
// Every page content starts with this structure:
<div className="p-8 max-w-[1440px] mx-auto">
  {/* Page-specific content here */}
</div>

// For feed-type pages (Activity Log, SNS, Agora):
<div className="p-8 max-w-[720px] mx-auto">
  {/* Centered feed content */}
</div>

// For canvas pages (NEXUS):
<div className="h-[calc(100vh-56px)] w-full">
  {/* Full-bleed canvas, no padding, no max-width */}
</div>
```

---

## 12. No Hardcoded Colors

### The Rule

**Every color in every component must reference a `corthex-*` design token.** Zero hardcoded hex values. Zero Tailwind default palette colors.

### Why

1. **Theme switching:** All 5 archetypal themes (Sovereign Command, Guardian Harmony, Obsidian Forge, Sacred Trust, Stellar Horizon) override `corthex-*` tokens via `[data-theme]` CSS selectors. Hardcoded colors break theme switching.
2. **Consistency:** 428-location `color-mix` incident in v2 was caused by scattered hardcoded colors.
3. **Maintainability:** One source of truth for every color value.

### Token Mapping Reference

| Instead of... | Use... |
|---------------|--------|
| `bg-white` | `bg-corthex-bg` |
| `bg-gray-50` | `bg-corthex-surface` |
| `bg-gray-100` | `bg-corthex-elevated` |
| `border-gray-200` | `border-corthex-border` |
| `border-gray-400` | `border-corthex-border-input` |
| `bg-green-600` | `bg-corthex-accent` |
| `bg-green-700` | `bg-corthex-accent-hover` |
| `text-gray-900` | `text-corthex-text-primary` |
| `text-gray-500` | `text-corthex-text-secondary` |
| `text-gray-400` | `text-corthex-text-tertiary` |
| `text-red-600` | `text-corthex-error` |
| `text-green-600` | `text-corthex-success` |
| `text-yellow-600` | `text-corthex-warning` |
| `text-blue-600` | `text-corthex-info` |
| `bg-black/50` (overlay) | `bg-corthex-chrome/40` |
| `ring-green-500` (focus) | `ring-corthex-focus` |

### Acceptable Exceptions

| Pattern | When Allowed |
|---------|-------------|
| `bg-white` / `text-white` | Only when creating text on accent backgrounds (`text-corthex-text-on-accent` preferred) |
| `bg-black/4` | Hover state on light surfaces (too subtle for a token) |
| `bg-white/10`, `bg-white/15` | Chrome hover/active states (already tokenized as `bg-corthex-chrome-hover/active`) |
| Opacity modifiers | `bg-corthex-accent/15`, `text-corthex-success/80` — these reference tokens with opacity, which is fine |

### Validation

Before finalizing any component, scan for:
- Any `bg-` class not prefixed with `corthex-` (except `bg-white`, `bg-black` with opacity)
- Any `text-` class not prefixed with `corthex-text-` (except `text-white`, `text-black`)
- Any `border-` class not prefixed with `corthex-border` or `corthex-`
- Any `ring-` class not prefixed with `corthex-`
- Any inline `style={{ color: '#...' }}` or `style={{ backgroundColor: '#...' }}`

---

## Tailwind v4 CSS Theme Block (Complete)

This is the complete `@theme` block for `index.css`. Copy-paste ready.

```css
@import "tailwindcss";

@theme {
  /* === COLOR SYSTEM: Sovereign Sage === */

  /* 60% Dominant — Backgrounds & Surfaces */
  --color-corthex-bg: #faf8f5;
  --color-corthex-surface: #f5f0e8;
  --color-corthex-elevated: #f0ebe0;
  --color-corthex-border: #e5e1d3;
  --color-corthex-border-strong: #d4cfc4;
  --color-corthex-border-input: #908a78;

  /* 30% Secondary — Chrome */
  --color-corthex-chrome: #283618;
  --color-corthex-chrome-hover: rgba(255, 255, 255, 0.10);
  --color-corthex-chrome-active: rgba(255, 255, 255, 0.15);

  /* 10% Accent */
  --color-corthex-accent: #606C38;
  --color-corthex-accent-hover: #4e5a2b;
  --color-corthex-accent-secondary: #5a7247;
  --color-corthex-accent-muted: rgba(96, 108, 56, 0.10);

  /* Text */
  --color-corthex-text-primary: #1a1a1a;
  --color-corthex-text-secondary: #6b705c;
  --color-corthex-text-tertiary: #756e5a;
  --color-corthex-text-disabled: #a3a08e;
  --color-corthex-text-on-accent: #ffffff;
  --color-corthex-text-chrome: #a3c48a;
  --color-corthex-text-chrome-dim: rgba(163, 196, 138, 0.80);

  /* Semantic */
  --color-corthex-success: #4d7c0f;
  --color-corthex-warning: #b45309;
  --color-corthex-error: #dc2626;
  --color-corthex-info: #2563eb;
  --color-corthex-handoff: #7c3aed;

  /* Chart (CVD-safe: 4 distinct hue families) */
  --color-corthex-chart-1: #606C38;
  --color-corthex-chart-2: #2563eb;
  --color-corthex-chart-3: #E07B5F;
  --color-corthex-chart-4: #b45309;
  --color-corthex-chart-5: #D4C5A9;
  --color-corthex-chart-6: #A68A64;

  /* Focus */
  --color-corthex-focus: #606C38;
  --color-corthex-focus-chrome: #a3c48a;
  --color-corthex-selection: rgba(96, 108, 56, 0.15);

  /* === TYPOGRAPHY === */
  --font-ui: 'Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-serif: 'Noto Serif KR', 'Batang', serif;

  /* === BORDER RADIUS (override TW4 defaults) === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* === LAYOUT === */
  --sidebar-width: 280px;
  --sidebar-collapsed: 64px;
  --topbar-height: 56px;
  --content-max: 1440px;
  --feed-max: 720px;
  --master-width: 280px;

  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10);

  /* === ANIMATIONS === */
  --animate-slide-in: slide-in 200ms ease-out;
  --animate-slide-up: slide-up 200ms ease-out;
  --animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
  --animate-cursor-blink: cursor-blink 1s step-end infinite;
}
```

---

*End of DESIGN.md — Phase 5-Prompts, Step 5-1*
*Sovereign Sage Design System for Stitch 2*
