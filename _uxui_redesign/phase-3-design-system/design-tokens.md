# CORTHEX v3 — Design Tokens

**Phase:** 3-Design System, Step 3-1
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 3 Design System)
**Input:** Vision & Identity (Phase 0), Web/App/Landing Analysis (Phase 2 — Option C winner), Brand Systems Skill (60-30-10), Design System Context Skill (compressed LLM format)
**Target Grade:** A (avg >= 8.0)

---

## 1. Color System — "Sovereign Sage"

### 1.1 Design Philosophy

CORTHEX uses the **"Controlled Nature"** philosophy: structural precision wrapped in organic warmth. The color system embodies this through a constrained palette derived from natural materials — olive leaf, cream linen, warm sand — applied with Swiss Design rigor.

**Archetype → Color Mapping** (Vision §9.4):

| Archetype | Color Expression | Rationale |
|-----------|-----------------|-----------|
| **The Ruler** | Dark olive `#283618` sidebar — authority, command | The CEO's domain boundary. Dense, grounding, like dark earth beneath a structured garden. |
| **The Sage** | Cream `#faf8f5` content area — wisdom, parchment | The workspace of knowledge. Open, warm, like aged paper where insights are recorded. |
| **Ruler + Sage tension** | Sage accent `#606C38` — where control meets growth | The living element. Olive leaf green bridges dark authority and warm wisdom. |

**60-30-10 Rule Application:**

| Zone | Proportion | Colors | Where |
|------|-----------|--------|-------|
| **60% Dominant** | Backgrounds, surfaces, content areas | Cream `#faf8f5`, Surface `#f5f0e8`, Sand border `#e5e1d3` | Page bg, cards, panels, dividers |
| **30% Secondary** | Chrome, structural elements | Olive dark `#283618`, Chrome hover `rgba(255,255,255,0.10)` | Sidebar bg, drawer bg, CTA sections |
| **10% Accent** | Interactive highlights, focus states | Sage `#606C38`, Sage secondary `#5a7247` | Buttons, active indicators, focus rings |

**60-30-10 on Mobile** (bottom nav replaces sidebar):

| Zone | Desktop Expression | Mobile Expression |
|------|-------------------|-------------------|
| **60% Dominant** | Cream content area | Cream content area (same) |
| **30% Secondary** | Olive sidebar (280px) | Olive drawer (on-demand) + bottom nav bar (cream with border-top) |
| **10% Accent** | Sage buttons, active indicators | Sage FAB, active bottom tab (#1a1a1a + 2px indicator), active drawer items |

> **Mobile note:** The bottom nav is part of the 60% zone (cream background), not 30% chrome. The olive 30% appears only when the drawer is open. This preserves the "open sky" metaphor on mobile — the CEO sees expansive content, not structural chrome.

### 1.2 Primary Palette

| Role | Token | Hex | RGB | Usage | WCAG on `#faf8f5` (verified) |
|------|-------|-----|-----|-------|-------------------------------|
| Background | `--bg-primary` | `#faf8f5` | 250, 248, 245 | Page background, content area | N/A (base) |
| Surface | `--bg-surface` | `#f5f0e8` | 245, 240, 232 | Cards, panels, elevated elements | N/A (surface) |
| Surface Alt | `--bg-nexus` | `#f0ebe0` | 240, 235, 224 | NEXUS canvas, mobile card bg (higher contrast) | N/A (surface) |
| Border (decorative) | `--border-primary` | `#e5e1d3` | 229, 225, 211 | Card borders, dividers, **non-interactive** separators | 1.23:1 (decorative only — NOT for input boundaries) |
| Border Strong | `--border-strong` | `#d4cfc4` | 212, 207, 196 | Hover borders on decorative elements | 1.47:1 (decorative) |
| **Border (input)** | `--border-input` | `#908a78` | 144, 138, 120 | **Form control boundaries** — inputs, selects, checkboxes, textareas | **3.25:1** (WCAG 1.4.11 — interactive UI component boundary) |
| Chrome | `--bg-chrome` | `#283618` | 40, 54, 24 | Sidebar bg, olive dark chrome | 12.15:1 (vs cream text) |
| Chrome Hover | `--bg-chrome-hover` | `rgba(255,255,255,0.10)` | — | Sidebar hover/active states | N/A (overlay) |
| Chrome Active | `--bg-chrome-active` | `rgba(255,255,255,0.15)` | — | Sidebar current page indicator | N/A (overlay) |
| Accent Primary | `--accent-primary` | `#606C38` | 96, 108, 56 | Primary buttons, active indicators, **UI components only** | **5.35:1** (AA for normal text + UI — **NOT for body text links** — see §1.8) |
| Accent Hover | `--accent-hover` | `#4e5a2b` | 78, 90, 43 | Button hover state | **7.02:1** (AA — darkened from `#7a8f5a` which failed at 3.36:1 with white text) |
| Accent Secondary | `--accent-secondary` | `#5a7247` | 90, 114, 71 | Secondary buttons, tags, subtle highlights | **5.04:1** (AA) |
| Accent Muted | `--accent-muted` | `rgba(96,108,56,0.10)` | — | Hover backgrounds, selected row tint | N/A (overlay) |

> **Input border rule (WCAG 1.4.11):** `--border-primary` (#e5e1d3) at 1.23:1 is for **decorative dividers only**. All interactive form control boundaries MUST use `--border-input` (#908a78) at 3.25:1. This includes `<input>`, `<select>`, `<textarea>`, checkboxes, radio buttons, and any element with an interactive boundary.

### 1.3 Text Colors

| Role | Token | Hex | On `#faf8f5` | On `#283618` | WCAG AA |
|------|-------|-----|-------------|-------------|---------|
| Primary text | `--text-primary` | `#1a1a1a` | **16.42:1** | — | PASS |
| Secondary text | `--text-secondary` | `#6b705c` | **4.83:1** | — | PASS |
| Tertiary / placeholder | `--text-tertiary` | `#756e5a` | **4.79:1** | — | PASS (corrected from `#a3a08e` at 2.48:1) |
| Disabled text | `--text-disabled` | `#a3a08e` | 2.48:1 | — | FAIL (decorative only — never sole info carrier) |
| Text on accent | `--text-on-accent` | `#ffffff` | — | — | **5.68:1** on `#606C38` — PASS |
| Chrome text | `--text-chrome` | `#a3c48a` | — | **6.63:1** | PASS |
| Chrome text dim | `--text-chrome-dim` | `rgba(163,196,138,0.80)` | — | **4.86:1** (blended `#8aa873`) | PASS (alpha increased from 0.60 → 0.80; 0.60 was 3.41:1 — FAIL) |

### 1.4 Semantic Colors

| Role | Token | Hex | On cream (verified) | Usage | Paired Icon |
|------|-------|-----|---------------------|-------|-------------|
| Success | `--semantic-success` | `#4d7c0f` | **4.71:1** | Completed tasks, online status, pass indicators | `CheckCircle` |
| Warning | `--semantic-warning` | `#b45309` | **4.74:1** | Budget threshold, approaching limits | `AlertTriangle` |
| Error | `--semantic-error` | `#dc2626` | **4.56:1** | Failed tasks, error states, offline status | `AlertCircle` |
| Info | `--semantic-info` | `#2563eb` | **4.88:1** | Informational banners, help text | `Info` |
| Handoff | `--semantic-handoff` | `#7c3aed` | **5.38:1** | Delegation events, handoff indicators | `ArrowRightLeft` |

> **Rule:** Never use color alone to convey information. Every semantic color is paired with an icon + text label. Status indicators use color + icon + shape.

> **Handoff fix:** Darkened from `#a78bfa` (2.57:1 on cream — FAIL) to `#7c3aed` (5.38:1 — PASS). Maintains purple identity for delegation events.

> **Success ≈ Accent awareness:** `--semantic-success` (#4d7c0f) and `--accent-primary` (#606C38) are both olive-family greens at only 1.14:1 contrast. This is intentional — both derive from the Natural Organic palette. **Mandatory disambiguation rule:** In any context where a success indicator and an accent/active indicator could co-exist (e.g., table rows with status dots + selected-row highlighting), success MUST use `CheckCircle` icon + "완료"/"온라인" text label, while accent/active uses background tint (`--accent-muted`) WITHOUT a dot. Never rely on green dot alone to distinguish "online" from "selected."

### 1.5 Chart Palette (Data Visualization)

| Index | Token | Hex | Usage | Color-Blind Safe? |
|-------|-------|-----|-------|--------------------|
| 1 | `--chart-1` | `#606C38` | Primary data series | Base olive |
| 2 | `--chart-2` | `#2563eb` | Secondary data series | Cool blue (deuteranopia safe) |
| 3 | `--chart-3` | `#E07B5F` | Tertiary data series | **Salmon/coral** (replaces sage `#8B9D77` — was 1.94:1 vs chart-1, CVD-unsafe green pair) |
| 4 | `--chart-4` | `#b45309` | Quaternary data series | Warm amber (deuteranopia safe) |
| 5 | `--chart-5` | `#D4C5A9` | Fifth series | Sand |
| 6 | `--chart-6` | `#A68A64` | Sixth series | Warm brown |

> **Color-blind safety:** Positions 1-4 now use four distinct hue families: olive (green), blue, coral (red), amber (orange). Under deuteranopia: olive→brown, blue→blue, coral→gold-pink, amber→dark-gold — all distinguishable. Charts with >3 series must additionally support **pattern fills** (dashed, dotted, hatched) as secondary differentiator.

> **No provider colors:** Dashboard AI usage charts use this chart palette, NOT hardcoded Anthropic/OpenAI/Google brand colors.

### 1.6 Focus & Interaction States

| State | Token | Value | Context |
|-------|-------|-------|---------|
| Focus ring (light bg) | `--focus-ring` | `2px solid #606C38` | Focus ring on cream/surface backgrounds |
| Focus ring (dark bg) | `--focus-ring-chrome` | `2px solid #a3c48a` | Focus ring on olive sidebar (6.63:1 — WCAG 1.4.11 compliant) |
| Focus ring offset | `--focus-ring-offset` | `2px` | Offset from element edge |
| Selection bg | `--selection-bg` | `rgba(96,108,56,0.15)` | Text selection, selected rows |
| Hover (light) | `--hover-light` | `rgba(0,0,0,0.04)` | Hover on light surfaces |
| Hover (dark) | `--hover-dark` | `rgba(255,255,255,0.10)` | Hover on dark chrome |

> **Critical a11y fix (from Phase 2):** `accent-primary` (#606C38) on olive sidebar (#283618) = 2.27:1 — FAILS WCAG 1.4.11. Sidebar must use `--focus-ring-chrome` (#a3c48a at 6.63:1). Focus ring on cream: #606C38 at 5.35:1 (PASS).

### 1.7 Zone B Badge Colors (Sidebar Communication Zone)

| Element | Foreground | Background | Contrast (verified) | CVD Fix |
|---------|-----------|-----------|---------------------|---------|
| Notification badge text | `#ffffff` | `#dc2626` | **4.83:1** (white on red — PASS AA) | `ring-1 ring-white/80` (luminance fallback for protanopia — red→brown on olive) |
| Badge on olive bg | — | `#dc2626` on `#283618` | **2.67:1** (FAILS 3:1 for UI component) | **Mitigated by:** (1) white text on red at 4.83:1, (2) `ring-1 ring-white/80` white outline ring, (3) filled circle shape + number — not hue-dependent. Red-on-olive alone is insufficient; the badge relies on shape + text + ring, not color contrast. |

### 1.8 Accent Color Usage Restrictions

| Usage | Allowed? | Reason (verified ratios) |
|-------|----------|-------------------------|
| Primary button background | YES | `#606C38` bg + `#ffffff` text = **5.68:1** (AA pass) |
| Button hover background | YES | `#4e5a2b` bg + `#ffffff` text = **7.44:1** (AA pass) |
| Active indicator dot/bar | YES | UI component ≥ 3:1 (**5.35:1** on cream — pass) |
| Focus ring | YES | UI component ≥ 3:1 (**5.35:1** on cream — pass) |
| **Body text links (≤17px)** | **Allowed but use `accent-secondary` instead** | `#606C38` at 5.35:1 technically passes AA, but `#5a7247` at 5.04:1 is preferred for links to visually distinguish interactive text from button accent. Consistency rule, not a contrast failure. |
| Large text (≥18px bold or ≥24px) | YES | Large text requires only 3:1 (5.35:1 — pass comfortably) |
| Text on accent bg | YES | White (#fff) on `#606C38` = **5.68:1** (AA pass) |

> **Link style rule:** All text links use `text-corthex-accent-secondary` (#5a7247 at 5.04:1) + `underline` + `hover:text-corthex-accent` (#606C38). This differentiates link color from button accent color while maintaining WCAG compliance.

---

## 2. Typography Scale

### 2.1 Font Stack

**"Controlled Nature" in typography:** Inter's geometric precision represents **Structure** (the Ruler's systematic grid). JetBrains Mono's fixed-width columns represent **Precision** (the Sage's analytical data). Noto Serif KR's flowing serifs represent **Organicism** (the warmth of traditional Korean brush calligraphy). Together they balance the mechanical and the natural.

| Role | Font | Weights | Fallback | Source |
|------|------|---------|----------|--------|
| **UI (primary)** | Inter | 400, 500, 600, 700 | 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif | `@fontsource/inter` (self-hosted, no external CDN) |
| **Code / monospace** | JetBrains Mono | 400, 500 | 'Fira Code', 'Cascadia Code', monospace | `@fontsource/jetbrains-mono` (self-hosted) |
| **Korean serif** | Noto Serif KR | 400, 700 | 'Batang', serif | `@fontsource-variable/noto-serif-kr` (self-hosted, reserved for long-form Korean content only) |

> **Self-hosted fonts via @fontsource.** No Google Fonts CDN — eliminates external network dependency, GDPR tracking concerns, and FOIT/FOUT caused by CDN latency. Fonts are bundled with the app build and served from the same origin. Import in `main.tsx`:
> ```tsx
> import '@fontsource/inter/400.css';
> import '@fontsource/inter/500.css';
> import '@fontsource/inter/600.css';
> import '@fontsource/inter/700.css';
> import '@fontsource/jetbrains-mono/400.css';
> import '@fontsource/jetbrains-mono/500.css';
> ```

> **Two-font rule:** Maximum 2 fonts in any single view — Inter for UI, JetBrains Mono for data/code. Noto Serif KR appears only in Korean long-form content (e.g., Knowledge library documents).

### 2.2 Type Scale (Major Third Ratio — 1.250)

| Token | Size | Line Height | Letter Spacing | Weight | Usage |
|-------|------|-------------|----------------|--------|-------|
| `--text-xs` | 12px (0.75rem) | 1.5 (18px) | 0 | 400–600 | Labels, badges, timestamps, build number, section headers |
| `--text-sm` | 14px (0.875rem) | 1.5 (21px) | 0 | 400–500 | Body text, nav items, form inputs, table cells |
| `--text-base` | 16px (1rem) | 1.5 (24px) | 0 | 400–500 | Emphasized body, card descriptions, landing body |
| `--text-lg` | 18px (1.125rem) | 1.5 (27px) | 0 | 500–600 | Section headings, card titles, brand "CORTHEX" |
| `--text-xl` | 20px (1.25rem) | 1.4 (28px) | -0.01em | 600 | Page subtitles, mobile content headings |
| `--text-2xl` | 24px (1.5rem) | 1.3 (31px) | -0.02em | 600 | Page titles (topbar), section titles (landing) |
| `--text-3xl` | 32px (2rem) | 1.2 (38px) | -0.02em | 700 | Hero headings (Dashboard welcome, Hub greeting) |
| `--text-4xl` | 40px (2.5rem) | 1.1 (44px) | -0.03em | 700 | Landing page hero (CEO app max: `--text-3xl`) |
| `--text-5xl` | 48px (3rem) | 1.1 (53px) | -0.03em | 700 | Landing hero override (Phase 2 recommendation: 48px for landing) |

### 2.3 Typography Rules

| Rule | Application |
|------|------------|
| **Weight hierarchy** | 400 (body) → 500 (emphasis/nav active) → 600 (headings) → 700 (brand/hero). Never skip. |
| **Monospace for data** | Agent IDs, cost values (`$0.0042`), API endpoints, code blocks, build numbers — always JetBrains Mono |
| **Brand "CORTHEX"** | `text-lg` (18px) / weight 600. Upgraded from v2's 14px for brand presence |
| **Negative tracking** | Headings `>=20px` use negative letter-spacing for tighter display type feel |
| **Section headers (sidebar)** | `text-xs` / weight 600 / uppercase / `letter-spacing: 0.05em` — clearly subordinate to nav items |
| **Korean text** | Inter handles Korean glyphs via fallback chain. No font switch needed for mixed KR/EN |

### 2.4 Heading:Body Ratios (Golden Ratio Alignment)

| Ratio | Value | Golden? |
|-------|-------|---------|
| Page heading (24px) : body (14px) | 1.714:1 | Close (1.618) |
| Section heading (18px) : body (14px) | 1.286:1 | Below (Perfect Fourth range) |
| Hero heading (32px) : body (14px) | 2.286:1 | Above (double golden) |
| Landing hero (48px) : body (16px) | 3.0:1 | Triple — appropriate for marketing drama |

---

## 3. Spacing Scale

**"Controlled Nature" in spacing:** The 8px grid is pure **Structure** — mathematical, predictable, Dieter Rams's "less, but better." The spacing *ratios* express **Organicism** — the 5:1 inter/intra-group ratio mirrors natural growth patterns (Fibonacci-adjacent), creating groupings the eye parses instinctively, like clusters of leaves on a branch.

### 3.1 Base Grid: 8px

All spacing values are multiples of 8px with a 4px half-step for tight contexts. The 8px grid creates predictable visual rhythm and simplifies developer decision-making.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--space-0.5` | 4px | `p-1` / `gap-1` | Icon-text gap, inline badge padding, intra-group nav item gap |
| `--space-1` | 8px | `p-2` / `gap-2` | Tight padding (pills, tags), compact button padding |
| `--space-1.5` | 12px | `p-3` / `gap-3` | Nav item horizontal padding, input padding |
| `--space-2` | 16px | `p-4` / `gap-4` | Card internal padding, form field gap, sidebar padding |
| `--space-3` | 24px | `p-6` / `gap-6` | Content area padding, section gap within pages, card grid gap |
| `--space-4` | 32px | `p-8` / `gap-8` | Page content padding (2:1 ratio vs card padding — Phase 2 fix) |
| `--space-6` | 48px | `p-12` | Major section dividers |
| `--space-8` | 64px | `p-16` | Page top/bottom margins |
| `--space-12` | 96px | `p-24` | Landing page section vertical padding |

### 3.2 Spacing Ratios (Perceptual Grouping)

| Context | Inner Spacing | Outer Spacing | Ratio | Meets 2:1 Minimum? |
|---------|--------------|---------------|-------|---------------------|
| Nav items within section | 4px (`space-y-1`) | 20px (section gap) | 5:1 | YES |
| Card content → page padding | 16px | 32px | 2:1 | YES (Phase 2 fix applied) |
| Dashboard card gap → section gap | 24px | 48px | 2:1 | YES |
| Table rows → table section | 8px | 24px | 3:1 | YES |

> **Phase 2 fix applied:** Card padding (16px) to page margin was 1.5:1 — corrected to 32px page padding for 2:1 ratio.

### 3.3 App Shell Dimensions

| Element | Token | Value | Rationale |
|---------|-------|-------|-----------|
| Sidebar width | `--sidebar-width` | 280px | Accommodates Korean text (+20% longer than English) |
| Sidebar collapsed | `--sidebar-collapsed` | 64px | Icon-only mode (8px grid × 8 = 64px; 22px padding around 20px nav icons) |
| Topbar height | `--topbar-height` | 56px (h-14) | 8px grid x 7 — room for breadcrumb + search + bell |
| Content max-width | `--content-max` | 1440px | Optimal reading width for dashboard grids |
| Content padding | — | 32px (p-8) | 4 x 8px — breathing room (corrected from 24px) |
| Feed max-width | `--feed-max` | 720px | Centered feed column (Activity Log, SNS, Agora) |
| Master-detail list | `--master-width` | 280px | Matches sidebar width — spatial rhyme (Phase 2 finding) |
| Mobile breakpoint | — | 1024px (lg) | Below: sidebar collapses to overlay |

### 3.4 Responsive Breakpoints

| Breakpoint | Token | Width | Layout |
|-----------|-------|-------|--------|
| Mobile | `sm` | < 640px | Single column, bottom nav, stacked cards |
| Tablet | `md` | 640–1023px | Single column wider, bottom nav, 2-col cards possible |
| Desktop | `lg` | 1024–1439px | Sidebar visible, 2-column grids |
| Wide | `xl` | >= 1440px | Sidebar visible, 3-column grids, max-width container |

### 3.5 Touch Targets

| Context | Minimum Size | Implementation | WCAG Level |
|---------|-------------|----------------|------------|
| Desktop nav items | 36px height | `py-2` (8px) + 20px content | AA |
| Mobile/touch nav items | 44px height | `py-3` (12px) + 20px content | AAA (Phase 2 fix) |
| Buttons | 44px height | `h-11` minimum | AAA |
| Bottom nav tabs | 56px height | Full width of 1/5 viewport | AAA |
| FAB | 56px diameter | `w-14 h-14 rounded-full` | AAA |

---

## 4. Border & Shadow

**"Controlled Nature" in borders:** Flat surfaces with real borders embody Arts & Crafts "honest construction" — no faux-3D, no gradients simulating material. Shadows indicate z-order (structural truth), never decoration. The radius progression (4→8→12→16→9999px) moves from tight precision (small pills = Structure) to full circles (avatars = Organicism — the human face is round, not rectangular).

### 4.1 Border Radius System

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-sm` | 4px | `rounded-sm` | Small pills, inline badges |
| `--radius-md` | 8px | `rounded-lg` | Buttons, inputs, small cards |
| `--radius-lg` | 12px | `rounded-xl` | Cards, panels, modals, bottom sheet top corners |
| `--radius-xl` | 16px | `rounded-2xl` | Large feature cards, hero sections, landing screenshots |
| `--radius-full` | 9999px | `rounded-full` | Avatars, status dots, FAB, notification badges |

### 4.2 Shadow / Elevation System

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--shadow-none` | `none` | `shadow-none` | Flat surfaces (default — most elements) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Subtle lift: cards on cream, dropdown menus, mobile cards (outdoor visibility fix) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `shadow-md` | Modals, drawers, floating panels, bottom sheets |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.10)` | `shadow-lg` | Toasts, popovers, command palette, landing screenshots |

> **Rule:** Shadows are used **only for z-order** (indicating float above surface). Never for decoration. Borders (`--border-primary`) handle same-level visual separation. **Never combine shadow + border on the same element.**

> **Mobile exception (Phase 2):** Cards on mobile may use `shadow-sm` for outdoor visibility since the cream→surface contrast (3% luminance) is insufficient in bright ambient light.

### 4.3 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Content area elements |
| `--z-sticky` | 10 | Sticky header, sticky table headers |
| `--z-sidebar` | 20 | Sidebar (desktop) |
| `--z-overlay-backdrop` | 30 | Drawer/sheet backdrop overlay |
| `--z-bottom-nav` | 30 | Mobile bottom navigation |
| `--z-fab` | 30 | Floating action button |
| `--z-drawer` | 40 | Mobile olive drawer |
| `--z-sheet` | 40 | Bottom sheet |
| `--z-dropdown` | 50 | Dropdown menus, select popover |
| `--z-modal` | 60 | Dialog modals |
| `--z-toast` | 70 | Toast notifications |
| `--z-tooltip` | 80 | Tooltips |
| `--z-command-palette` | 100 | Cmd+K command palette (supreme) |

---

## 5. Motion & Animation

**"Controlled Nature" in motion:** Structure = no page transitions (instant swap, zero indulgence). Organicism = the agent status pulse breathes like a living organism (opacity 1→0.5→1), and the landing scroll-reveal rises like a growing plant (translateY upward). The tension: animation exists only to signal life (state change), never as ornament.

### 5.1 Animation Principles

1. **Purposeful only.** Animation must communicate state change (open/close, enter/exit, loading), not decorate.
2. **Respect user preference.** All animations wrapped in `prefers-reduced-motion` media query. Reduced-motion fallback = instant state change (0.01ms duration).
3. **Performance budget.** Only `transform` and `opacity` properties animated — never layout-triggering properties (width, height, top, left, margin, padding).
4. **No page transition animations.** Route changes are instant swaps via React.lazy. No fade/slide between pages.

### 5.2 Duration Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | 0ms | — | Route changes, reduced-motion fallback |
| `--duration-fast` | 100ms | `ease-out` | Hover states, focus rings, button press |
| `--duration-normal` | 200ms | `ease-in-out` | Modal open/close, command palette, sidebar collapse/expand |
| `--duration-slow` | 300ms | `ease-in-out` | Mobile drawer slide, bottom sheet snap, sidebar mobile overlay |
| `--duration-scroll-reveal` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Landing page scroll reveal (landing only, not CEO app) |
| `--duration-pulse` | 2000ms | `ease-in-out` (infinite) | Working status indicator pulse |

### 5.3 Transition Patterns

| Context | Animation | Reduced-Motion Fallback |
|---------|-----------|------------------------|
| Sidebar mobile open | `translateX(-100% → 0)` 300ms | Instant show |
| Sidebar collapse/expand | `translateX(0) + opacity(1)` ↔ `translateX(-216px) + opacity(0)` for nav labels; icon column stays fixed at 64px. 200ms. (No width animation — §5.1 rule: never animate layout-triggering properties.) | Instant state change |
| Modal open | `opacity(0→1) + scale(0.95→1)` 200ms | Instant show |
| Bottom sheet snap | `translateY` to snap point, 300ms | Instant position |
| Toast enter | `translateY(100% → 0)` 200ms | Instant show |
| Command palette open | `opacity(0→1) + scale(0.98→1)` 200ms | Instant show |
| Streaming text | Character-by-character reveal | Instant paragraph show |
| Agent status pulse | `opacity 1→0.5→1` cycle 2s | Static dot (no pulse) |
| Hover state | `background-color` 100ms | Instant color change |
| Landing scroll reveal | `opacity(0→1) + translateY(20px→0)` 600ms | Instant show |
| Page route change | None (instant swap) | Same |

### 5.4 Reduced Motion & High Contrast

```css
/* prefers-reduced-motion — MANDATORY on all animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Windows High Contrast Mode — border fallbacks */
@media (forced-colors: active) {
  .sidebar { border-right: 1px solid ButtonText; }
  .card { border: 1px solid ButtonText; }
  .sidebar-zone-b { border-top-color: ButtonText; }
  .bottom-sheet { border-top: 2px solid ButtonText; }
}
```

---

## 6. Icons

**"Controlled Nature" in iconography:** Lucide's 2px uniform stroke is **Structure** — every icon follows the same geometric grid, same weight, same rhythm. The `currentColor` inheritance is **Organicism** — icons adapt to their environment's color, like chameleons in a garden, rather than imposing their own color (no hardcoded fills).

### 6.1 Icon System: Lucide React

**Lucide React exclusively.** No Material Symbols, no custom SVGs for standard UI. Lucide is tree-shaken per-icon — only imported icons are bundled.

| Property | Value |
|----------|-------|
| Library | `lucide-react` (pinned version, no ^) |
| Stroke width | 2px (Lucide default) — consistent across all icons |
| Color | `currentColor` — inherits from parent text color |
| Rendering | Inline SVG (not font icons) |

### 6.2 Icon Sizes

| Context | Size | Tailwind | Example |
|---------|------|----------|---------|
| Inline / button icon | 16px | `w-4 h-4` | Button icons, inline indicators |
| Navigation | 20px | `w-5 h-5` | Sidebar nav items, bottom nav |
| Page headers | 24px | `w-6 h-6` | Page title icons, bottom nav mobile |
| Feature cards | 24px | `w-6 h-6` | Landing feature icons |
| Empty state | 48px | `w-12 h-12` | Empty state illustrations |

### 6.3 Icon Accessibility

| Principle | Rule |
|-----------|------|
| Decorative icons | `aria-hidden="true"` — hidden from screen readers |
| Interactive icons (icon-only buttons) | `aria-label="Description"` — accessible name required |
| Status icons | Paired with text label + color — never icon + color alone |
| Active nav item | Visual styling + `aria-current="page"` |

### 6.4 Status Indicators

| Status | Visual | Color Token | Icon | Animation |
|--------|--------|-------------|------|-----------|
| Online | Solid dot | `--semantic-success` | `Circle` (filled via `fill="currentColor"`) | None |
| Working | Pulse dot | `--accent-primary` | `Circle` (filled) | `pulse-dot` 2s infinite |
| Error | Solid dot + icon | `--semantic-error` | `AlertCircle` | None |
| Offline | Ring dot | `--text-tertiary` | `Circle` (stroke only) | None |

---

## 7. Color Mode

### 7.1 Declaration

```
color-mode: "light"
```

**CORTHEX v3 ships with light mode only.** The Natural Organic palette (cream, olive, sage, sand) is optimized for light backgrounds. Dark mode is deferred — not planned for v3 initial launch.

### 7.2 Rationale

1. **The 5-theme system (Sovereign/Imperial/Tactical/Mystic/Stealth) from v2 is deprecated.** Maintaining 5 themes caused the 428-location `color-mix` incident. v3 ships with Sovereign Sage only.
2. **Natural Organic palette is inherently light.** The olive sidebar provides the "dark element" that many dark-mode users seek — structural contrast without inverting the entire UI.
3. **Dark mode can be added later** as a single alternative theme (not 5), with a dedicated token mapping layer.

### 7.3 System Preferences Respected

| Preference | Behavior |
|-----------|----------|
| `prefers-color-scheme: dark` | Ignored (no dark mode) — light theme always applied |
| `prefers-reduced-motion: reduce` | All animations disabled (Section 5.4) |
| `prefers-contrast: more` | Not specifically handled — rely on existing 4.5:1+ text contrast |
| `forced-colors: active` | Border fallbacks applied (Section 5.4) — Windows High Contrast Mode |

### 7.4 Future Dark Mode Token Mapping (Reference Only)

If dark mode is added post-launch, the mapping would follow:

| Token | Light Value | Dark Value (hypothetical) |
|-------|------------|--------------------------|
| `--bg-primary` | `#faf8f5` | `#1a1f14` (dark olive-tinted) |
| `--bg-surface` | `#f5f0e8` | `#242b1c` |
| `--bg-chrome` | `#283618` | `#1a1f14` (sidebar blends with bg) |
| `--text-primary` | `#1a1a1a` | `#e8e6e1` |
| `--accent-primary` | `#606C38` | `#8fa65e` (lightened for contrast) |

> This mapping is **not implemented** — it is documented for future reference only.

---

## 8. Tailwind Configuration & LLM Context

### 8.1 Tailwind v4 CSS Theme Block

CORTHEX uses Tailwind CSS v4 with the `@theme` directive in `index.css` (no `tailwind.config.ts` file — Tailwind v4 uses CSS-first configuration).

```css
/* packages/app/src/index.css */
@import "tailwindcss";

@theme {
  /* === COLOR SYSTEM: Sovereign Sage (all ratios verified via WCAG sRGB formula) === */

  /* 60% Dominant — Backgrounds & Surfaces */
  --color-corthex-bg: #faf8f5;
  --color-corthex-surface: #f5f0e8;
  --color-corthex-elevated: #f0ebe0;
  --color-corthex-border: #e5e1d3;          /* decorative only (1.23:1) — NOT for inputs */
  --color-corthex-border-strong: #d4cfc4;   /* decorative hover (1.47:1) */
  --color-corthex-border-input: #908a78;    /* interactive input boundaries (3.25:1 — WCAG 1.4.11) */

  /* 30% Secondary — Chrome */
  --color-corthex-chrome: #283618;
  --color-corthex-chrome-hover: rgba(255, 255, 255, 0.10);
  --color-corthex-chrome-active: rgba(255, 255, 255, 0.15);

  /* 10% Accent */
  --color-corthex-accent: #606C38;           /* 5.35:1 on cream */
  --color-corthex-accent-hover: #4e5a2b;     /* 7.02:1 on cream, 7.44:1 white-on */
  --color-corthex-accent-secondary: #5a7247; /* 5.04:1 on cream */
  --color-corthex-accent-muted: rgba(96, 108, 56, 0.10);

  /* Text */
  --color-corthex-text-primary: #1a1a1a;     /* 16.42:1 on cream */
  --color-corthex-text-secondary: #6b705c;   /* 4.83:1 on cream */
  --color-corthex-text-tertiary: #756e5a;    /* 4.79:1 on cream */
  --color-corthex-text-disabled: #a3a08e;    /* 2.48:1 — decorative only */
  --color-corthex-text-on-accent: #ffffff;   /* 5.68:1 on accent */
  --color-corthex-text-chrome: #a3c48a;      /* 6.63:1 on chrome */
  --color-corthex-text-chrome-dim: rgba(163, 196, 138, 0.80); /* 4.86:1 on chrome */

  /* Semantic */
  --color-corthex-success: #4d7c0f;          /* 4.71:1 on cream */
  --color-corthex-warning: #b45309;          /* 4.74:1 on cream */
  --color-corthex-error: #dc2626;            /* 4.56:1 on cream */
  --color-corthex-info: #2563eb;             /* 4.88:1 on cream */
  --color-corthex-handoff: #7c3aed;          /* 5.38:1 on cream (was #a78bfa at 2.57:1) */

  /* Chart (CVD-safe: 4 distinct hue families) */
  --color-corthex-chart-1: #606C38;          /* olive */
  --color-corthex-chart-2: #2563eb;          /* blue */
  --color-corthex-chart-3: #E07B5F;          /* salmon/coral (was #8B9D77 sage — CVD-unsafe green pair) */
  --color-corthex-chart-4: #b45309;          /* amber */
  --color-corthex-chart-5: #D4C5A9;          /* sand */
  --color-corthex-chart-6: #A68A64;          /* warm brown */

  /* Focus */
  --color-corthex-focus: #606C38;            /* 5.35:1 on cream */
  --color-corthex-focus-chrome: #a3c48a;     /* 6.63:1 on chrome */
  --color-corthex-selection: rgba(96, 108, 56, 0.15);

  /* === TYPOGRAPHY (self-hosted via @fontsource) === */
  --font-ui: 'Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-serif: 'Noto Serif KR', 'Batang', serif;

  /* === BORDER RADIUS (custom overrides — differ from TW4 defaults) === */
  --radius-sm: 4px;     /* TW default rounded-sm=2px → our sm=4px */
  --radius-md: 8px;     /* TW default rounded-md=6px → our md=8px */
  --radius-lg: 12px;    /* TW default rounded-lg=8px → our lg=12px */
  --radius-xl: 16px;    /* TW default rounded-xl=12px → our xl=16px */

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

/*
 * NOTE: @theme vs plain CSS custom properties
 * - Tokens in @theme generate Tailwind utility classes (e.g., bg-corthex-bg, text-corthex-text-primary)
 * - Z-index (--z-*) and duration (--duration-*) tokens are plain CSS vars used via var() in custom CSS
 *   They are NOT registered in @theme because z-index and transition-duration utilities
 *   use Tailwind's built-in scale (z-10, duration-200, etc.)
 * - Radius tokens ARE in @theme to override TW4 defaults with our custom values
 */
```

### 8.2 Usage Examples (Tailwind v4 Classes)

```tsx
// Background
<div className="bg-corthex-bg" />              // #faf8f5
<div className="bg-corthex-surface" />          // #f5f0e8
<div className="bg-corthex-chrome" />           // #283618

// Text
<p className="text-corthex-text-primary" />     // #1a1a1a
<span className="text-corthex-text-secondary" /> // #6b705c

// Accent
<button className="bg-corthex-accent text-corthex-text-on-accent" />

// Border
<div className="border border-corthex-border rounded-xl" />

// Semantic
<span className="text-corthex-success" />       // #4d7c0f
<span className="text-corthex-error" />         // #dc2626

// Chart
<div className="bg-corthex-chart-1" />          // #606C38

// Focus ring
<button className="focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2" />

// Layout
<aside style={{ width: 'var(--sidebar-width)' }} />
```

### 8.3 LLM Context Block (Compressed Format)

This compressed context block is designed for efficient loading into LLM context windows when generating UI code. It contains all tokens needed to produce brand-consistent output in ~600 tokens.

````markdown
<!-- CORTHEX_DESIGN_CONTEXT_START -->
## CORTHEX v3 Design Tokens (Compressed)

### Identity
brand: CORTHEX | philosophy: "Controlled Nature" | archetype: Ruler+Sage
palette: Sovereign Sage | mode: light-only | framework: Tailwind v4 + Radix UI

### Colors (60-30-10) — all ratios verified via WCAG sRGB formula
60%: bg:#faf8f5 surface:#f5f0e8 elevated:#f0ebe0 border:#e5e1d3(decorative) border-input:#908a78(3.25:1)
30%: chrome:#283618 chrome-hover:white/10 chrome-active:white/15
10%: accent:#606C38(5.35:1) accent-hover:#4e5a2b(7.02:1) accent-secondary:#5a7247(5.04:1) accent-muted:accent/10
links: use accent-secondary + underline (not accent-primary — visual distinction from buttons)
text: primary:#1a1a1a(16.42:1) secondary:#6b705c(4.83:1) tertiary:#756e5a(4.79:1) disabled:#a3a08e on-accent:#fff(5.68:1)
chrome-text: #a3c48a(6.63:1) dim:chrome-text/80(4.86:1)
semantic: success:#4d7c0f(4.71:1) warning:#b45309(4.74:1) error:#dc2626(4.56:1) info:#2563eb(4.88:1) handoff:#7c3aed(5.38:1)
chart: [#606C38, #2563eb, #E07B5F, #b45309, #D4C5A9, #A68A64] (4 hue families, CVD-safe)
focus: light:#606C38(5.35:1) dark:#a3c48a(6.63:1) (sidebar focus MUST use dark variant)
input-borders: MUST use border-input (#908a78) not border (#e5e1d3) — WCAG 1.4.11

### Typography
fonts: Inter(400-700) | JetBrains Mono(400,500) | Noto Serif KR(400,700) — all @fontsource (self-hosted, no CDN)
scale: xs:12 sm:14 base:16 lg:18 xl:20 2xl:24 3xl:32 4xl:40 5xl:48
rules: 2-font max per view | mono for data/code | weight 400→500→600→700 never skip
brand: "CORTHEX" = text-lg/600 | section-headers = text-xs/600/uppercase/tracking-wide

### Spacing (8px grid)
tokens: 0.5:4px 1:8px 1.5:12px 2:16px 3:24px 4:32px 6:48px 8:64px 12:96px
shell: sidebar:280px collapsed:64px topbar:56px content-max:1440px feed:720px
touch: min 44px on mobile (py-3 + 20px content)

### Borders & Shadows
radius: sm:4px md:8px lg:12px xl:16px full:9999px
shadow: none(default) sm(cards) md(modals) lg(toasts/popovers/cmd-palette)
rule: shadow=z-order ONLY, never decorative | never shadow+border on same element

### Motion
fast:100ms(hover) normal:200ms(modal) slow:300ms(drawer) pulse:2s(status)
rule: transform+opacity ONLY | prefers-reduced-motion:0.01ms | no page transitions

### Icons
lib: lucide-react(pinned) | stroke:2px | color:currentColor
sizes: inline:16px nav:20px header:24px empty:48px
a11y: decorative=aria-hidden | interactive=aria-label | status=icon+text+color

### Layout Types (7)
dashboard(auto-fit grid) | master-detail(280px+flex) | canvas(full-bleed)
crud(single-col) | tabbed(tabs+content) | panels(2x2) | feed(720px centered)

### A11y
WCAG 2.1 AA | contrast>=4.5:1 text, >=3:1 UI | keyboard-first
focus-ring: 2px solid accent (light bg) / #a3c48a (dark bg)
color: never alone — always icon+text | badges: ring-1 ring-white/80 (CVD)
landmarks: single <nav> + role="group" per section (3 stops not 7)
forced-colors: border fallbacks for sidebar, cards, zone-b
<!-- CORTHEX_DESIGN_CONTEXT_END -->
````

---

## Appendix A: Token Diff from Current Codebase

The current `packages/app/src/index.css` has design tokens that differ from this specification. Key changes:

| Token | Current (`index.css`) | This Spec | Change Reason |
|-------|----------------------|-----------|---------------|
| `--color-corthex-success` | `#34D399` (emerald-400) | `#4d7c0f` (lime-700) | Align with olive palette; #34D399 is too vivid for Natural Organic |
| `--color-corthex-warning` | `#FBBF24` (amber-400) | `#b45309` (amber-700) | Darken for WCAG contrast on cream background |
| `--color-corthex-error` | `#c4622d` (custom burnt orange) | `#dc2626` (red-600) | Standard red for error — #c4622d is too close to warning amber |
| `--color-corthex-info` | `#60A5FA` (blue-400) | `#2563eb` (blue-600) | Darken for WCAG contrast on cream |
| `--color-corthex-handoff` | `#A78BFA` (violet-400) | `#7c3aed` (violet-600) | Darkened: #a78bfa on cream = 2.57:1 (FAIL). #7c3aed = 5.38:1 (PASS) |
| `--color-corthex-surface` | `#ffffff` (pure white) | `#f5f0e8` (warm sand) | Vision spec: surface = warm sand, not white. White breaks Natural Organic warmth |
| `--text-tertiary` | (not defined) | `#756e5a` (4.79:1) | Vision spec authoritative value. Tech Spec's `#a3a08e` (2.48:1) is WCAG-failing — demoted to `--text-disabled` |
| `--text-chrome-dim` alpha | 0.60 (3.41:1 — FAIL) | 0.80 (4.86:1 — PASS) | Increased alpha for WCAG AA compliance on chrome bg |
| `--color-corthex-chrome-active` | (not defined) | `rgba(255,255,255,0.15)` | New: distinct active state for sidebar current page |
| `--color-corthex-focus-chrome` | (not defined) | `#a3c48a` | New: WCAG-compliant focus ring for dark chrome (Phase 2 critical fix) |
| `--color-corthex-border-input` | (not defined) | `#908a78` (3.25:1) | New: WCAG 1.4.11 compliant input boundaries (border-primary 1.23:1 FAILS for inputs) |
| `--color-corthex-accent-hover` | `#7a8f5a` | `#4e5a2b` | Darkened: `#7a8f5a` + white text = 3.36:1 (FAIL AA). `#4e5a2b` + white = 7.44:1 (PASS) |
| Chart 3 | (not defined) | `#E07B5F` (salmon/coral) | Replaces `#8B9D77` (sage) — was CVD-unsafe green pair with chart-1 (1.94:1) |
| Chart palette | (not defined) | 6 colors, 4 hue families | New: dedicated chart palette (no provider brand colors), CVD-safe |
| `--content-max` | **1160px** | **1440px** | **+280px (24% increase)** — matches Vision spec's "optimal reading width for dashboard grids". Affects all page layouts. |
| Content padding | 24px (p-6) | 32px (p-8) | Phase 2 fix: 2:1 ratio vs card padding (16px) |
| `--feed-max` | (not defined) | 720px | New: centered column width for feed layouts |
| `--master-width` | (not defined) | 280px | New: master-detail list width (spatial rhyme with sidebar) |
| Font source | Google Fonts CDN | `@fontsource/*` (self-hosted) | Eliminates external CDN dependency, GDPR concern, FOIT/FOUT |
| Radius overrides | TW4 defaults | Custom `@theme` | sm:4px, md:8px, lg:12px, xl:16px (differ from TW4 defaults 2/6/8/12px) |

### Appendix A-2: `theme.css` / Subframe UI Migration Strategy

The codebase contains a **second token system** in `packages/app/src/ui/theme.css` powering 36 Subframe UI components (`packages/app/src/ui/components/`) with ~290 usages of `bg-brand-*`, `text-brand-*`, `bg-neutral-*`, `bg-error-*`, `bg-default-*` etc.

**Strategy: Deprecate-in-Place → Phase 4 Migration**

| Layer | Token System | Status | Migration |
|-------|-------------|--------|-----------|
| **Page / Layout** | `--color-corthex-*` (this spec) | **Active** — new development uses these | All new pages, layout.tsx, sidebar.tsx use `corthex-*` tokens |
| **Subframe UI** | `--color-brand-*` / `--color-neutral-*` (theme.css) | **Frozen** — no new additions | Subframe components continue using theme.css until replaced in Phase 4 |

**Phase 4 migration plan:**
1. Replace Subframe UI components one-by-one with Radix UI + Tailwind equivalents (see Step 3-2 Component Strategy)
2. Each replaced component drops `theme.css` tokens and uses `corthex-*` tokens directly
3. When all 36 components are replaced, `theme.css` and `@subframe/core` are removed (~54KB CSS savings)
4. During coexistence, `theme.css` values are aligned to match `corthex-*` values where they overlap:
   - `--color-brand-500` (#606C38) = `--color-corthex-accent` (#606C38) — already identical
   - `--color-brand-primary` = `--color-corthex-accent` — same
   - `--color-default-background` = `--color-corthex-bg` — align to #faf8f5

> **No duplicate token systems post-Phase 4.** The `corthex-*` namespace is the single source of truth. `theme.css` is a legacy bridge, not a parallel design system.

---

## Appendix B: WCAG Compliance Matrix

| Check | Requirement | Status |
|-------|-------------|--------|
| Text contrast (normal) | >= 4.5:1 | PASS — Primary 16.5:1, Secondary 4.83:1, Tertiary 4.79:1 |
| Text contrast (large) | >= 3:1 | PASS — All headings exceed 3:1 |
| Chrome text contrast | >= 4.5:1 | PASS — Chrome primary 8.72:1, Chrome dim 4.86:1 (alpha 0.80) |
| UI component contrast | >= 3:1 (WCAG 1.4.11) | PASS — Focus rings: 5.35:1 (light), 6.63:1 (dark); `--border-input` #908a78: 3.25:1 on cream |
| Semantic color contrast | >= 4.5:1 text / 3:1 UI | PASS — Error 4.83:1 (white on red), Warning 5.91:1, Handoff #7c3aed 5.38:1 on cream |
| Badge on chrome | >= 3:1 (WCAG 1.4.11) | MITIGATED — Base #dc2626 on #283618 = 2.67:1 (FAIL); mitigated by white text 4.83:1 + ring-1 ring-white/80 + filled circle shape |
| Chart CVD safety | Distinguishable under CVD | PASS — 4 hue families (olive, blue, salmon, amber); no adjacent green pairs |
| Success ≈ accent disambiguation | Not color-alone | PASS — Success requires CheckCircle icon + text; accent uses background tint only |
| Focus visible | Visible ring on all interactive | Specified — 2px solid ring with 2px offset |
| Reduced motion | `prefers-reduced-motion` respected | Specified — all animations have 0.01ms override |
| Forced colors | Windows High Contrast fallbacks | Specified — border fallbacks for sidebar, cards, zone-b |
| Color alone | Never sole info carrier | Specified — semantic colors paired with icon + text |
| Touch targets | >= 44x44px on touch devices | Specified — nav items py-3 (44px), buttons h-11, FAB 56px |
| Keyboard navigation | Full operability | Specified — focus management, skip-to-content link |

---

*End of Design Tokens — Phase 3-Design System, Step 3-1*
