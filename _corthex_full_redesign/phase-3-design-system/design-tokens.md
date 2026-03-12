# Phase 3-1: CORTHEX Design Tokens

**Date**: 2026-03-12
**Step**: Phase 3 — Design System, Step 3-1
**Status**: APPROVED — 3 rounds, 17 issues resolved. Critic-A: 49/50 · Critic-B: 9.5/10
**Based on**: Phase 0 Vision & Identity + Phase 2 Option A specs (Web 45/50, App 45/50, Landing 46/50)

---

## 0. Token Philosophy

CORTHEX uses a **single-source token system**: CSS custom properties (`--`) defined in `packages/app/src/index.css` via Tailwind 4's `@theme` directive. Tailwind classes are the primary authoring interface in JSX. CSS tokens are the only interface in `.css` files. No third system.

**Dark mode is the ONLY mode.** CORTHEX is dark-mode only (`zinc-950` base). No light mode token variants needed for the app or admin. Landing page is also dark. This simplifies the token set significantly.

**Token authority hierarchy:**
1. This document (Phase 3-1) — canonical source
2. Phase 2 snapshots — confirmed decisions
3. Phase 0 Vision doc — principles and color targets

---

## 1. Color System

### 1.1 Primary Palette — Indigo (Intelligence / Active / Selection)

CORTHEX identity color. "The thinking color." Used for: active states, accents, CTAs, selected nav items, TrackerPanel active step, submit buttons.

| Shade | Hex | OKLCH | Tailwind Class | Primary Use |
|-------|-----|-------|----------------|-------------|
| indigo-50 | `#EEF2FF` | `oklch(0.962 0.018 272)` | `bg-indigo-50` | Active nav bg (light mode only — not used) |
| indigo-100 | `#E0E7FF` | `oklch(0.930 0.034 272)` | `bg-indigo-100` | AGORA Manager badge bg (light) |
| indigo-200 | `#C7D2FE` | `oklch(0.870 0.065 274)` | `text-indigo-200` | Subtle indigo text on indigo-900 bg |
| indigo-300 | `#A5B4FC` | `oklch(0.785 0.115 274)` | `text-indigo-300` | Active nav text (dark) · AGORA Manager text (dark) |
| indigo-400 | `#818CF8` | `oklch(0.673 0.182 276)` | `text-indigo-400` | Subtle accent on dark backgrounds |
| indigo-500 | `#6366F1` | `oklch(0.585 0.233 264)` | `bg-indigo-500` | Primary hover (dark mode) · Active session dot |
| **indigo-600** | **`#4F46E5`** | **`oklch(0.511 0.262 276)`** | **`bg-indigo-600`** | **PRIMARY ACCENT — buttons, CTAs, Tracker active step** |
| indigo-700 | `#4338CA` | `oklch(0.457 0.240 277)` | `bg-indigo-700` | Primary button hover (dark) |
| indigo-800 | `#3730A3` | `oklch(0.398 0.195 277)` | `bg-indigo-800` | Primary button active/pressed |
| indigo-900 | `#312E81` | `oklch(0.359 0.144 278)` | `bg-indigo-900` | Deep indigo backgrounds |
| indigo-950 | `#1E1B4B` | `oklch(0.257 0.090 281)` | `bg-indigo-950` | **Active nav bg (dark mode)** · AGORA Manager badge bg (dark) |

**WCAG Contrast (dark mode critical combos):**
| Text | Background | Ratio | WCAG Level |
|------|-----------|-------|-----------|
| `text-white` | `bg-indigo-600` (#4F46E5) | **5.6:1** | ✅ AA (normal text) |
| `text-indigo-300` (#A5B4FC) | `bg-indigo-950` (#1E1B4B) | **5.4:1** | ✅ AA (normal text) |
| `text-indigo-400` (#818CF8) | `bg-zinc-900` (#18181B) | **4.8:1** | ✅ AA (normal text) |
| `text-indigo-300` (#A5B4FC) | `bg-zinc-900` (#18181B) | **8.1:1** | ✅ AAA |

---

### 1.2 Secondary Palette — Violet (AGORA Specialist Tier)

Used ONLY for AGORA Specialist tier badges. Not a general UI accent.

| Shade | Hex | OKLCH | Tailwind Class | Primary Use |
|-------|-----|-------|----------------|-------------|
| violet-100 | `#EDE9FE` | `oklch(0.943 0.029 294)` | `bg-violet-100` | Specialist badge bg (light — not used) |
| violet-300 | `#C4B5FD` | `oklch(0.811 0.111 293)` | `text-violet-300` | Specialist badge text (dark) |
| violet-700 | `#6D28D9` | `oklch(0.491 0.270 292)` | `text-violet-700` | Specialist badge text (light — not used) |
| violet-950 | `#2E1065` | `oklch(0.231 0.127 292)` | `bg-violet-950` | Specialist badge bg (dark) |
| violet-400 | `#A78BFA` | `oklch(0.702 0.183 293)` | `text-violet-400` | Specialist accent text |

**WCAG:**
| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| `text-violet-300` (#C4B5FD) | `bg-violet-950` (#2E1065) | **5.1:1** | ✅ AA |

---

### 1.3 Neutral Palette — Zinc (Structure / Foundation)

**Zinc is the foundation of all CORTHEX surfaces.** NEVER use slate in new code (Phase 2-1 confirmed). The existing Hub uses slate — the redesign migrates all slate → zinc.

| Shade | Hex | OKLCH | Tailwind Class | Role |
|-------|-----|-------|----------------|------|
| zinc-50 | `#FAFAFA` | `oklch(0.985 0.002 248)` | `bg-zinc-50` | App sidebar (light — not used in dark-only) |
| zinc-100 | `#F4F4F5` | `oklch(0.967 0.003 264)` | `bg-zinc-100` | Tier badge bg · code inline bg (light) |
| zinc-200 | `#E4E4E7` | `oklch(0.920 0.004 286)` | `border-zinc-200` | Light mode borders (not used) |
| zinc-300 | `#D4D4D8` | `oklch(0.872 0.006 285)` | `text-zinc-300` | **Primary body text in dark mode** |
| zinc-400 | `#A1A1AA` | `oklch(0.705 0.015 286)` | `text-zinc-400` | **Secondary text · disabled · offline** |
| zinc-500 | `#71717A` | `oklch(0.552 0.016 285)` | `text-zinc-500` | ⚠️ 18px+ or 16px bold+ ONLY (3.4:1 — fails AA at small sizes). Use `text-zinc-400` for any text under 18px. |
| zinc-600 | `#52525B` | `oklch(0.442 0.017 285)` | `text-zinc-600` | Inactive NEXUS edges |
| zinc-700 | `#3F3F46` | `oklch(0.370 0.013 285)` | `border-zinc-700` | **STANDARD BORDER on dark surfaces** |
| zinc-800 | `#27272A` | `oklch(0.274 0.006 286)` | `bg-zinc-800` | **Elevated panel** · hover state bg |
| zinc-900 | `#18181B` | `oklch(0.210 0.006 285)` | `bg-zinc-900` | **Sidebar / Card / Panel background** |
| zinc-950 | `#09090B` | `oklch(0.141 0.005 285)` | `bg-zinc-950` | **Page background (root)** |

> ⚠️ **CRITICAL BORDER RULE** (Phase 2-1 §9.5 confirmed):
> - `border-zinc-700` (#3F3F46) on `bg-zinc-900` (#18181B) → **visible border** ✅
> - `border-zinc-800` (#27272A) on `bg-zinc-900` (#18181B) → **invisible** ❌ (same perceived tone)
> - **ALWAYS**: `border-zinc-700` on dark surface cards/panels
> - **NEVER**: `border-zinc-800` in dark mode

**WCAG Contrast (dark mode — critical combos):**
| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| `text-zinc-100` (#F4F4F5) | `bg-zinc-950` (#09090B) | **16.5:1** | ✅ AAA |
| `text-zinc-100` (#F4F4F5) | `bg-zinc-900` (#18181B) | **13.9:1** | ✅ AAA |
| `text-zinc-300` (#D4D4D8) | `bg-zinc-900` (#18181B) | **10.3:1** | ✅ AAA |
| `text-zinc-300` (#D4D4D8) | `bg-zinc-950` (#09090B) | **12.7:1** | ✅ AAA |
| `text-zinc-400` (#A1A1AA) | `bg-zinc-900` (#18181B) | **5.7:1** | ✅ AA |
| `text-zinc-400` (#A1A1AA) | `bg-zinc-950` (#09090B) | **6.7:1** | ✅ AA |
| `text-zinc-500` (#71717A) | `bg-zinc-900` (#18181B) | **3.4:1** | ⚠️ AA large text only (use for 18px+/16px bold+) |

---

### 1.4 Semantic Color Tokens

#### Success — Green (Online / Completed / Budget Safe)

| Shade | Hex | OKLCH | Tailwind | Use |
|-------|-----|-------|----------|-----|
| green-400 | `#4ADE80` | `oklch(0.792 0.209 151)` | `text-green-400` | Success on zinc-950 (higher contrast variant) |
| **green-500** | **`#22C55E`** | **`oklch(0.723 0.219 149)`** | **`text-green-500`** | **Agent online · task success · budget safe** |
| green-600 | `#16A34A` | `oklch(0.627 0.194 149)` | `text-green-600` | Budget bar fill (safe zone) |

**WCAG:**
| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| `text-green-500` (#22C55E) | `bg-zinc-900` (#18181B) | **6.8:1** | ✅ AA |
| `text-green-500` (#22C55E) | `bg-zinc-950` (#09090B) | **8.2:1** | ✅ AAA |
| `text-green-400` (#4ADE80) | `bg-zinc-900` (#18181B) | **9.1:1** | ✅ AAA |

#### Warning — Amber (Budget 70%+ / Advisory / Pending)

| Shade | Hex | OKLCH | Tailwind | Use |
|-------|-----|-------|----------|-----|
| amber-400 | `#FBBF24` | `oklch(0.828 0.189 84)` | `text-amber-400` | Warning text on dark (high contrast) |
| **amber-500** | **`#F59E0B`** | **`oklch(0.769 0.188 78)`** | **`text-amber-500`** | **Budget 70–90% · slow response · attention** |
| amber-600 | `#D97706` | `oklch(0.666 0.179 58)` | `bg-amber-600` | Budget bar fill (warning zone) |

**WCAG:**
| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| `text-amber-500` (#F59E0B) | `bg-zinc-900` (#18181B) | **8.3:1** | ✅ AAA |
| `text-amber-500` (#F59E0B) | `bg-zinc-950` (#09090B) | **10.1:1** | ✅ AAA |

#### Error — Red (Failed / Exceeded Budget / Critical)

| Shade | Hex | OKLCH | Tailwind | Use |
|-------|-----|-------|----------|-----|
| red-400 | `#F87171` | `oklch(0.704 0.191 22)` | `text-red-400` | **Error text on dark backgrounds (14px body text)** |
| **red-500** | **`#EF4444`** | **`oklch(0.637 0.237 25)`** | **`text-red-500`** | **Error icons · budget bar 90%+ · focus ring error** |
| red-600 | `#DC2626` | `oklch(0.577 0.245 27)` | `bg-red-600` | Budget bar fill (critical zone) |

> ⚠️ **WCAG NOTE for Red**: `text-red-500` (#EF4444) on `bg-zinc-900` = **3.8:1** (fails AA for 14px normal text). Use `text-red-400` (#F87171) for small text on dark: **5.8:1** ✅ AA. Reserve `text-red-500` for 18px+ or 14px+ bold text, icons, and border accents where the text contrast requirement is relaxed.

**WCAG:**
| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| `text-red-400` (#F87171) | `bg-zinc-900` (#18181B) | **5.8:1** | ✅ AA (normal text) |
| `text-red-500` (#EF4444) | `bg-zinc-900` (#18181B) | **3.8:1** | ⚠️ AA large text only |
| `text-red-400` (#F87171) | `bg-zinc-950` (#09090B) | **7.2:1** | ✅ AAA |

#### Info — Indigo (same as primary accent, see §1.1)
Used for informational badges: `bg-indigo-950 text-indigo-300`.

---

### 1.5 Surface Colors (Layer System)

CORTHEX dark surfaces use a 4-layer system. Each layer must be visually distinct.

| Layer | Token Name | Tailwind Class | Hex | OKLCH | Description |
|-------|-----------|----------------|-----|-------|-------------|
| L0 | `surface-page` | `bg-zinc-950` | `#09090B` | `oklch(0.141 0.005 285)` | Root page, route background |
| L1 | `surface-sidebar` | `bg-zinc-900` | `#18181B` | `oklch(0.210 0.006 285)` | Sidebar, card, panel bg |
| L2 | `surface-elevated` | `bg-zinc-800` | `#27272A` | `oklch(0.274 0.006 286)` | Nested panel, hover state, sub-card |
| L3 | `surface-overlay` | `bg-zinc-800/50` | `#27272A` at 50% opacity | — | Subtle nesting within L2 |

**Borders between layers:**
- L0→L1: `border-zinc-700` (#3F3F46) — always visible
- L1→L2: Background contrast is sufficient (no explicit border needed between zinc-900 and zinc-800)
- Modal backdrop: `bg-black/60` (black at 60% opacity)
- Drawer backdrop: `bg-black/40`

---

### 1.6 Text Colors

| Token Name | Tailwind Class | Hex | OKLCH | Use |
|-----------|----------------|-----|-------|-----|
| `text-primary` | `text-zinc-100` | `#F4F4F5` | `oklch(0.967 0.003 264)` | Page titles, primary headings, agent names |
| `text-secondary` | `text-zinc-300` | `#D4D4D8` | `oklch(0.872 0.006 285)` | Body text, card content, labels |
| `text-muted` | `text-zinc-400` | `#A1A1AA` | `oklch(0.705 0.015 286)` | Secondary text, disabled, section headers |
| `text-faint` | ~~`text-zinc-400`~~ | — | — | **MERGED INTO `text-muted`** — both resolved to zinc-400; semantic duplicate removed. Use `text-muted` (`text-zinc-400`) for timestamps, placeholders, and empty state sub-text. |
| `text-inverse` | `text-zinc-900` | `#18181B` | `oklch(0.210 0.006 285)` | Text on light surfaces (not used in dark-only) |
| `text-accent` | `text-indigo-400` | `#818CF8` | `oklch(0.673 0.182 276)` | Inline accent text links |
| `text-mono` | `text-zinc-400 font-mono` | — | — | Cost figures, IDs, build numbers |

---

### 1.7 Border Colors

| Token Name | Tailwind Class | Hex | OKLCH | When to Use |
|-----------|----------------|-----|-------|-------------|
| `border-default` | `border-zinc-700` | `#3F3F46` | `oklch(0.370 0.013 285)` | **Standard border on ALL dark surfaces (cards, panels, sidebars, inputs)** |
| `border-hover` | `border-zinc-600` | `#52525B` | `oklch(0.442 0.017 285)` | Interactive element hover border |
| `border-active` | `border-indigo-500` | `#6366F1` | `oklch(0.585 0.233 264)` | Input focus · selected card border |
| `border-error` | `border-red-500` | `#EF4444` | `oklch(0.637 0.237 25)` | Input error state |
| `border-success` | `border-green-500` | `#22C55E` | `oklch(0.723 0.219 149)` | Success indicator border |

---

### 1.8 Feature-Specific Color Rules

| Feature | Rule | Classes |
|---------|------|---------|
| Tracker step — Active | Indigo pulse dot + text | `bg-indigo-500 animate-pulse motion-reduce:animate-none` + `text-zinc-100` |
| Tracker step — Completed | Green checkmark | `text-green-500` + `✓` checkmark (Lucide `Check` icon) |
| Tracker step — Failed | Red X | `text-red-400` + Lucide `X` icon |
| AGORA Manager tier badge | Dark | `bg-indigo-950 text-indigo-300 border border-indigo-800` |
| AGORA Specialist tier badge | Dark | `bg-violet-950 text-violet-300 border border-violet-800` |
| AGORA Worker tier badge | Dark | `bg-zinc-800 text-zinc-400 border border-zinc-700` |
| Budget bar — Safe (0–70%) | Green fill | `bg-green-500` |
| Budget bar — Warning (70–90%) | Amber fill | `bg-amber-500` |
| Budget bar — Critical (90–100%) | Red fill | `bg-red-500` |
| AGORA consensus badge | Consensus=green, Dissent=red, Partial=amber | `text-green-500`, `text-red-400`, `text-amber-500` |
| Tier badge text | Mono text pill | `font-mono text-xs bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400` |
| Active session dot | Indigo pulse | `h-2 w-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none` |
| Cost/token display | Mono on dark | `font-mono text-xs text-zinc-400` |
| "명령 접수됨" badge | Dark indigo | `inline-flex items-center bg-indigo-950 text-indigo-300 text-xs px-2 py-0.5 rounded border border-indigo-800` |

---

## 2. Typography Scale

### 2.1 Font Families

```css
/* packages/app/src/index.css — add to @theme */
/* Tailwind v4: --font-sans (NOT --font-family-sans) maps to font-sans utility class */
--font-sans: 'Work Sans', -apple-system, 'Apple SD Gothic Neo', BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
```

**Work Sans loading** (`packages/app/index.html` line 14 — update to include preconnect + remove unused weight 300):
```html
<!-- Preconnect hints: must appear BEFORE the stylesheet link. 100-300ms cold-load savings. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<!-- Weight 300 (light) removed: ~15-20KB payload, zero usage in component specs -->
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

> ⚠️ **Admin action required**: `packages/admin/index.html` has NO custom font. Add identical Work Sans link to admin for visual consistency.

**Soul editor font**: CodeMirror 6 (system monospace stack). The `<textarea>` is prohibited.

**Existing CodeMirror wrappers** (do NOT recreate):
- `packages/app/src/components/codemirror-editor.tsx`
- `packages/app/src/components/settings/soul-editor.tsx`

---

### 2.2 Type Scale

Base unit: `1rem = 16px` (browser default).

| Token | Size | Line Height | Tailwind | Weight Options | Use |
|-------|------|-------------|---------|---------------|-----|
| `text-xs` | 12px / 0.75rem | 16px / 1rem | `text-xs leading-4` | 400, 500 | Badges, timestamps, tier tags, cost mono, captions |
| `text-sm` | 14px / 0.875rem | 20px / 1.25rem | `text-sm leading-5` | 400, 500, 600 | **Body primary** · nav items · table cells · form labels |
| `text-base` | 16px / 1rem | 24px / 1.5rem | `text-base leading-6` | 500, 600 | Agent names · card titles · empty state headings |
| `text-lg` | 18px / 1.125rem | 28px / 1.75rem | `text-lg leading-7` | 600 | Section headings · drawer titles |
| `text-xl` | 20px / 1.25rem | 28px / 1.75rem | `text-xl leading-7` | 600 | **Page titles** (top of each page) |
| `text-2xl` | 24px / 1.5rem | 32px / 2rem | `text-2xl leading-8` | 700 | Landing hero sub-headings · large card metrics |
| `text-3xl` | 30px / 1.875rem | 36px / 2.25rem | `text-3xl leading-9` | 700 | Dashboard KPI numbers |
| `text-4xl` | 36px / 2.25rem | 40px / 2.5rem | `text-4xl leading-10` | 700 | Landing `h1` — "조직도를 그리면 AI 팀이 움직인다." |

### 2.3 Weight Scale

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| ~~`font-light`~~ | ~~300~~ | ~~`font-light`~~ | **REMOVED** — weight 300 not loaded in Google Fonts request (~15-20KB saved). Do not use. |
| `font-normal` | 400 | `font-normal` | Body text, nav items (inactive), table content |
| `font-medium` | 500 | `font-medium` | Agent names, card titles, nav items (active), cost figures |
| `font-semibold` | 600 | `font-semibold` | Page titles, section headers, buttons, drawer titles |
| `font-bold` | 700 | `font-bold` | Report h1, landing headline, KPI numbers |

### 2.4 Letter Spacing

| Size | Spacing | Tailwind | Rule |
|------|---------|----------|------|
| xs (12px) | +0.025em | `tracking-wide` | Small caps labels, section headers |
| sm (14px) | 0 | `tracking-normal` | Body text — neutral |
| base (16px) | 0 | `tracking-normal` | Standard prose |
| lg+ | -0.01em | `tracking-tight` | Large headings — tighter for authority |
| Section headers | +0.05em | `tracking-wider` | `text-xs font-semibold uppercase tracking-wider text-zinc-400` — sidebar groups |

### 2.5 Semantic Type Ramp

| Role | Full Tailwind Classes | Size/Weight |
|------|-----------------------|-------------|
| Page title | `text-xl font-semibold text-zinc-100` | 20px/600 |
| Section header (sidebar group) | `text-xs font-semibold uppercase tracking-wider text-zinc-400 px-3 py-2` | 12px/600 — zinc-400 ✅ AA at 12px/600 bold |
| Agent name (prominent) | `text-base font-medium text-zinc-100` | 16px/500 |
| Body primary | `text-sm text-zinc-300` | 14px/400 |
| Body secondary | `text-xs text-zinc-400` | 12px/400 |
| Nav item (inactive) | `text-sm text-zinc-300` | 14px/400 |
| Nav item (active) | `text-sm font-medium text-indigo-300` | 14px/500 |
| Monospace data | `font-mono text-xs text-zinc-400` | 12px/400 mono |
| Cost figure | `font-mono text-sm font-medium text-zinc-300` | 14px/500 mono |
| Empty state heading | `text-base font-medium text-zinc-400` | 16px/500 — zinc-400 (5.7:1 ✅ AA), NOT zinc-500 (3.4:1 ❌ fails at 16px/500) |
| Button (primary) | `text-sm font-medium text-white` | 14px/500 |
| Tier badge | `font-mono text-xs text-zinc-400` | 12px/400 mono |
| Table header | `text-xs font-semibold uppercase tracking-wide text-zinc-400` | 12px/600 |
| Table cell | `text-sm text-zinc-300` | 14px/400 |
| Toast message | `text-sm font-medium text-zinc-100` | 14px/500 |

### 2.6 Markdown Rendering Scale

Applied to `MarkdownRenderer` component — AI agent responses in Hub ChatArea, Reports, Soul Gym.

| Element | Tailwind Classes | Notes |
|---------|----------------|-------|
| `h1` | `text-2xl font-bold text-zinc-100 mt-6 mb-3` | Report title level |
| `h2` | `text-xl font-semibold text-zinc-100 mt-5 mb-2` | Section headers |
| `h3` | `text-lg font-semibold text-zinc-200 mt-4 mb-2` | Sub-sections |
| `h4` | `text-base font-semibold text-zinc-200 mt-3 mb-1` | Deep sections |
| `p` | `text-sm text-zinc-300 leading-relaxed mb-3` | Body paragraphs |
| `ul` / `ol` | `text-sm text-zinc-300 pl-4 mb-3 space-y-1` | Lists |
| `li` | (inherits ul/ol) | `list-disc` or `list-decimal` via parent |
| `code` (inline) | `font-mono text-xs bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300` | Inline code spans |
| `pre > code` (block) | `font-mono text-xs bg-zinc-950 border border-zinc-700 text-zinc-300 p-4 rounded-lg overflow-x-auto block` | Code blocks |
| `blockquote` | `border-l-4 border-indigo-500 pl-4 text-zinc-400 italic my-3` | Quoted context |
| `table` | `w-full text-sm border-collapse my-4` | Data tables |
| `thead tr` | `bg-zinc-800` | Table header row |
| `th` | `px-3 py-2 text-left font-semibold text-zinc-300 border border-zinc-700` | Header cells |
| `td` | `px-3 py-2 text-zinc-300 border border-zinc-700` | Body cells |
| `hr` | `border-zinc-700 my-4` | Horizontal rules |

---

## 3. Spacing Scale

### 3.1 Base Scale

Base unit: **4px**. All spacing values are multiples.

| Token | px | rem | Tailwind | Primary Use |
|-------|-----|-----|----------|-------------|
| `space-0` | 0 | 0 | `p-0` `m-0` | Reset |
| `space-1` | 4px | 0.25rem | `p-1` `gap-1` | Icon internal padding · tight badge padding |
| `space-2` | 8px | 0.5rem | `p-2` `gap-2` | Button padding (compact) · badge padding · icon gap |
| `space-3` | 12px | 0.75rem | `p-3` `gap-3` | Nav item: `px-3 py-2` · compact card padding |
| **space-4** | **16px** | **1rem** | **`p-4` `gap-4`** | **Standard card padding · section padding · STANDARD UNIT** |
| `space-5` | 20px | 1.25rem | `p-5` `gap-5` | Medium section spacing |
| `space-6` | 24px | 1.5rem | `p-6` `gap-6` | Page content padding · between major cards |
| `space-8` | 32px | 2rem | `p-8` `gap-8` | Between major page sections only |
| `space-10` | 40px | 2.5rem | `p-10` | Large section gaps (landing page sections only) |
| `space-12` | 48px | 3rem | `p-12` | ⚠️ **AVOID in app/admin** — decorative excess. Use only landing hero spacing |
| `space-16` | 64px | 4rem | `p-16` | Landing hero vertical padding |
| `space-20` | 80px | 5rem | `p-20` | Landing between sections |
| `space-24` | 96px | 6rem | `p-24` | Landing hero section py |
| `space-32` | 128px | 8rem | `p-32` | Landing hero max-height context |

> **Rule**: In app/admin — `p-4` and `gap-4` are standard. `p-6`/`gap-6` for page-level padding. Never `p-12` decorative whitespace. Landing page uses larger spacing (p-16, p-20, p-24) for visual breathing room.

### 3.2 Component-Specific Spacing

| Component | Spec | Notes |
|-----------|------|-------|
| App sidebar width | `w-60` (240px) | Fixed, all pages |
| SessionPanel width | `w-64` (256px) | Hub left column |
| TrackerPanel expanded | `w-80` (320px) | Hub right column, active |
| TrackerPanel collapsed | `w-12` (48px) | Hub right column, idle icon strip |
| Admin sidebar width | `w-60` (240px) | Fixed, all admin pages |
| Drawer width (agent/doc) | `w-[520px]` | Slide-in from right |
| NEXUS config panel | `w-96` (384px) | Absolute overlay on canvas |
| Card padding (standard) | `p-4` (16px) | All cards in app/admin |
| Card padding (compact) | `p-3` (12px) | Dense tables, list items |
| Page-level padding | `p-6` (24px) | Main content area `<main>` |
| Sidebar nav item | `px-3 py-2` | All nav items (current standard) |
| Button (primary, large) | `px-4 py-2` | Default button |
| Button (submit, Hub) | `h-12 w-12` (48×48px) | ChatArea submit button |
| Input padding | `px-3 py-2` | Text inputs, textareas |
| Modal dialog | `p-6` | Dialog element content padding |
| Table cell | `px-3 py-2` | Dense table standard |
| Toast | `px-4 py-3` | Bottom-right toast |
| Section gap (cards) | `gap-4` (16px) | Grid between cards |
| Section gap (major) | `gap-6` (24px) | Between card groups |

---

## 4. Border & Shadow

### 4.1 Border Radius Scale

| Token | px | Tailwind Class | Use |
|-------|-----|----------------|-----|
| `radius-none` | 0 | `rounded-none` | Tables, full-bleed elements |
| `radius-sm` | 2px | `rounded-sm` | Tags, tiny badges |
| `radius-md` | 6px | `rounded-md` | Buttons · inputs · small cards |
| `radius-lg` | 8px | `rounded-lg` | **Standard card radius** · drawers |
| `radius-xl` | 12px | `rounded-xl` | Modal dialogs · large panels |
| `radius-2xl` | 16px | `rounded-2xl` | Landing page hero cards · feature showcase cards |
| `radius-full` | 9999px | `rounded-full` | Status dots · badges · avatar circles · pills |

**Component-specific radius:**
| Component | Radius |
|-----------|--------|
| Primary button | `rounded-lg` (8px) |
| Input / textarea | `rounded-lg` (8px) |
| Card (app/admin) | `rounded-lg` (8px) |
| Modal dialog | `rounded-xl` (12px) |
| Landing feature card | `rounded-2xl` (16px) |
| Toast notification | `rounded-lg` (8px) |
| Status dot | `rounded-full` |
| Tier badge pill | `rounded` (4px) |
| NEXUS canvas node | `rounded-lg` (8px) |
| Budget bar track | `rounded-full` |
| Drawer (slide-in) | `rounded-none` (flush with viewport edge) |

### 4.2 Border Width

| Token | Tailwind | Use |
|-------|----------|-----|
| `border-1` | `border` (1px) | Standard — cards, inputs, buttons (secondary), panels |
| `border-2` | `border-2` (2px) | Active input focus enhancement · dashed file upload zone |

### 4.3 Shadow Scale

CORTHEX dark mode uses subtle shadows with OKLCH-based colors. Shadows are understated — surfaces are defined primarily by background contrast, not drop shadows.

| Token | Value | Tailwind | OKLCH Shadow Color | Use |
|-------|-------|----------|-------------------|-----|
| `shadow-sm` | `0 1px 2px 0 oklch(0.141 0.005 285 / 0.5)` | `shadow-sm` | zinc-950 at 50% | Subtle elevation — buttons, badges |
| `shadow-md` | `0 4px 6px -1px oklch(0.141 0.005 285 / 0.7), 0 2px 4px -2px oklch(0.141 0.005 285 / 0.4)` | `shadow-md` | zinc-950 at 70%/40% | Cards on zinc-950 · floating elements |
| `shadow-lg` | `0 10px 15px -3px oklch(0.141 0.005 285 / 0.8), 0 4px 6px -4px oklch(0.141 0.005 285 / 0.5)` | `shadow-lg` | zinc-950 at 80%/50% | Drawers · panels above page |
| `shadow-xl` | `0 20px 25px -5px oklch(0.141 0.005 285 / 0.85), 0 8px 10px -6px oklch(0.141 0.005 285 / 0.6)` | `shadow-xl` | zinc-950 at 85%/60% | Modals · elevated overlays |
| `shadow-2xl` | `0 25px 50px -12px oklch(0.141 0.005 285 / 0.9)` | `shadow-2xl` | zinc-950 at 90% | Auth modal · full-overlay dialogs |

> **Note**: In dark mode, shadows appear on darker backgrounds, making them less visible. The primary layer distinction mechanism is **background color contrast** (`bg-zinc-950` → `bg-zinc-900` → `bg-zinc-800`), not shadows. Use shadows only for overlay elements (modals, drawers, tooltips, toasts).

**Component shadow rules:**
| Component | Shadow |
|-----------|--------|
| Static cards | None (rely on `border-zinc-700` for definition) |
| Floating toast | `shadow-xl` |
| Modal dialog | `shadow-2xl` |
| Drawer (slide-in) | `shadow-xl` on left/right edge |
| Tooltip | `shadow-lg` |
| NEXUS node (selected) | `shadow-md` with `ring-2 ring-indigo-500` |
| Dropdown menu | `shadow-lg border border-zinc-700` |
| TrackerPanel (expanded) | `shadow-none` (defined by `border-l border-zinc-700`) |

---

## 5. Motion & Animation

### 5.1 Duration Scale

| Token | ms | Tailwind Class | Use |
|-------|----|----------------|-----|
| `duration-fast` | 100ms | `duration-100` | Immediate feedback · opacity toggles · simple state changes |
| `duration-micro` | 150ms | `duration-150` | Hover color changes · tab active state · badge flash · page transitions |
| **`duration-normal`** | **200ms** | **`duration-200`** | **Status dot transitions · tooltip appear · inline confirmations** |
| **`duration-panel`** | **250ms** | **`duration-[250ms]`** | **Panel expand/collapse · drawer slide · TrackerPanel width transition** |
| `duration-step` | 300ms | `duration-300` | SSE Tracker step slide-in · AGORA consensus badge |
| `duration-speech` | 400ms | `duration-[400ms]` | AGORA speech card entrance — arbitrary syntax required (not a Tailwind built-in) |
| `duration-slow` | 500ms | `duration-500` | Budget bar fill on page load · skeleton pulse cycle |

> ⚠️ **Tailwind v4 note**: Custom durations require arbitrary syntax: `duration-[250ms]` NOT `duration-250`. This was a confirmed Phase 2-1 fix.

### 5.2 Easing Curves

| Token | CSS Value | Tailwind | When |
|-------|-----------|----------|------|
| `ease-out-primary` | `cubic-bezier(0, 0, 0.2, 1)` | `ease-out` | **Primary easing** — elements entering the screen, expanding |
| `ease-in-out-secondary` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out` | Panel expand/collapse · width transitions · bilateral movements |
| `ease-in-exit` | `cubic-bezier(0.4, 0, 1, 1)` | `ease-in` | Elements leaving screen, collapsing |

### 5.3 Animation Definitions

#### TrackerPanel Width Transition (MOST CRITICAL)
```tsx
className={cn(
  "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col",
  "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
  isTrackerExpanded ? "w-80" : "w-12"
)}
```
- Use `transition-[width]` NOT `transition-all` (prevents padding/color repaints)
- `duration-[250ms]` (NOT `duration-250` — Tailwind v4 arbitrary syntax)
- **No auto-collapse timer** — WCAG 2.2.2 violation. Stays expanded until manual toggle.

#### TrackerPanel Expand — Step Row Enter (on each `handoff` SSE event)
```css
/* Applied to each new HandoffStep row */
transform: translateY(20px) → translateY(0)
opacity: 0 → 1
transition-property: transform, opacity
transition-duration: 300ms
transition-timing-function: ease-out
/* Tailwind: transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none */
```

#### TrackerPanel Collapse Sequence
**Total budget: 250ms** (Vision §12.1 cap for panel transitions — sequential approach exceeded this).

Run fade and width collapse **in parallel**:
1. Width collapse: `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none` on the container
2. Content fade: `transition-opacity duration-[200ms] ease-in-out motion-reduce:transition-none` on the inner content div (separate element — see code below)
2. Icon strip appear: after parent transition ends, `opacity: 0 → 1`, 150ms ease-out

```tsx
// TrackerPanel container — width transition only (opacity stays 100% — inner content div handles fade):
className={cn(
  "shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col overflow-hidden",
  "transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none",
  isTrackerExpanded ? "w-80" : "w-12"
)}
// Inner content div — separate opacity fade, parallel to width:
// <div className={cn(
//   "transition-opacity duration-[200ms] ease-in-out motion-reduce:transition-none",
//   isTrackerExpanded ? "opacity-100" : "opacity-0"
// )}>
```

#### AGORA Speech Card Entrance
Requires custom keyframe — add to `packages/app/src/index.css`:
```css
@keyframes speech-enter {
  from { transform: translateX(-16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```
```tsx
// Applied to each speech card
style={{ animation: `speech-enter 400ms ease-out forwards`, animationDelay: `${index * 200}ms` }}
// OR with Framer Motion:
// initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: index * 0.2 }}
```

#### AGORA Consensus Badge
```tsx
className="transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
// Initial state: scale-75 opacity-0 → Final: scale-100 opacity-100
```

#### Tracker Depth Badge (D2, D3) Scale
```tsx
// On appear: scale-[1.2] → scale-100, 150ms ease-out
```

#### Skeleton Pulse
```tsx
className="animate-pulse bg-zinc-800 rounded-lg motion-reduce:animate-none"
// Tailwind's built-in animate-pulse uses @keyframes pulse { 50%: opacity: 0.5 }
// Duration: ~2s (Tailwind default)
```

#### Budget Bar Fill
```tsx
// On page load: width 0% → actual%
// transition: [width] 500ms ease-out
// CSS: style={{ width: `${pct}%`, transition: 'width 500ms ease-out' }}
// motion-reduce: no transition, set width directly
```

#### Status Dot Color Change
```tsx
className="h-2 w-2 rounded-full transition-colors duration-200 ease-in-out motion-reduce:transition-none"
// online: bg-green-500 | working: bg-indigo-500 animate-pulse | offline: bg-zinc-600
```

#### Drawer Slide-In (Agent Config, Document Upload)
```tsx
// translate-x-full → translate-x-0, duration-[250ms] ease-out
className="transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none"
```

#### Page Transition (Route Change)
```tsx
// Fade: opacity 0 → 1, 150ms ease-out
className="transition-opacity duration-150 ease-out motion-reduce:transition-none"
```

### 5.4 Prefers-Reduced-Motion

**Every animated element must include `motion-reduce:`** class. This is an absolute requirement.

```tsx
// Pattern for all transitions:
className="transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none"

// Pattern for animations:
className="animate-pulse motion-reduce:animate-none"

// Pattern for keyframe animations (CSS):
@media (prefers-reduced-motion: reduce) {
  .speech-card { animation: none; opacity: 1; transform: none; }
}
```

---

## 6. Icon System

### 6.1 Primary Library — Lucide React

All non-navigation component icons use **Lucide React**. Navigation uses emoji (established convention — do not replace).

Package: `lucide-react` (already installed — verify with `grep lucide packages/app/package.json`)

### 6.2 Icon Size Scale

| Token | px | Tailwind | Use |
|-------|----|----------|-----|
| `icon-xs` | 12px | `h-3 w-3` | Inline indicators · tiny status dots |
| **`icon-sm`** | **16px** | **`h-4 w-4`** | **Compact buttons · table actions · inline icons** |
| **`icon-md`** | **20px** | **`h-5 w-5`** | **Standard — most component icons** |
| `icon-lg` | 24px | `h-6 w-6` | Primary action buttons · card headers |
| `icon-xl` | 32px | `h-8 w-8` | Empty states · feature icons |
| `icon-2xl` | 48px | `h-12 w-12` | Landing feature illustrations |

### 6.3 Stroke Width

| Variant | strokeWidth | When |
|---------|------------|------|
| Default | `1.5` | All standard usage (Lucide default) |
| Emphasis | `2` | Important status icons · error/warning icons |
| Thin | `1` | Decorative icons · large ornamental icons |

### 6.4 Icon Color Rules

Icons inherit text color from parent (`currentColor`). Use Tailwind text utilities:
- Active/accent: `text-indigo-400`
- Primary content: `text-zinc-400`
- Secondary: `text-zinc-500`
- Success: `text-green-500`
- Warning: `text-amber-500`
- Error: `text-red-400`
- Destructive action: `text-red-500`

### 6.5 CORTHEX Icon Assignments

| Icon | Lucide Name | Context |
|------|------------|---------|
| Expand/Collapse | `ChevronRight` / `ChevronDown` | TrackerPanel toggle, accordion |
| Handoff direction | `ArrowRight` | Tracker chain `A → B` |
| Step complete | `Check` | Tracker step finished (strokeWidth 2) |
| Step failed | `X` | Tracker step error (strokeWidth 2) |
| Working | `Loader2` + `animate-spin motion-reduce:animate-none` | Active agent processing — motion-reduce required (§5.4 absolute rule) |
| AI / Soul | `Brain` | Soul editor, agent context |
| Org chart | `Network` | NEXUS context |
| Cost | `BarChart3` | Dashboard cost analytics |
| Add | `Plus` | Create department/agent/session |
| Delete | `Trash2` | Destructive — always `text-red-500` |
| Edit | `Pencil` | Edit agent/department |
| Search | `Search` | Knowledge search bar |
| Close/Dismiss | `X` | Modal close, toast dismiss |
| Settings | `Settings` | Settings gear (supplement nav emoji) |
| Clock/Schedule | `Clock` | ARGOS schedule times |
| Human employee | `User` | Human employee context (org member — not AI) |
| AI Agent | `CircleUser` | AI agent context — ⚠️ **NEVER `Bot`** (robot icon violates Vision §5.3: "Do NOT use robots") |
| Send/Submit | `Send` | Alternative to text "전송" button |
| Copy | `Copy` | Copy cost ID, agent ID |
| Eye | `Eye` / `EyeOff` | Soul preview toggle |
| Download | `Download` | Export org chart |

---

## 7. Dark Mode

### 7.1 Core Principle

**CORTHEX is dark-mode ONLY.** The app, admin, and landing page all use dark mode as the single design target. No light mode toggle. No dual-mode tokens.

**Root surface**: `bg-zinc-950` (`#09090B`) — applied to `<body>` and all page root containers.

### 7.2 Layer Nesting (Dark Mode Only)

```
bg-zinc-950 (page)
└── bg-zinc-900 (sidebar, card, panel)
    border: border-zinc-700 ← REQUIRED for visible definition
    └── bg-zinc-800 (elevated panel, hover bg, sub-card)
        └── bg-zinc-800/50 (subtle sub-panel, inset section)
```

**Pattern in JSX:**
```tsx
// Page root
<div className="flex h-screen bg-zinc-950 overflow-hidden">

// Sidebar
<aside className="w-60 bg-zinc-900 border-r border-zinc-700 flex flex-col shrink-0">

// Card
<div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">

// Elevated sub-panel inside card
<div className="bg-zinc-800 rounded-md p-3">

// Sub-panel (subtle)
<div className="bg-zinc-800/50 rounded p-2">
```

### 7.3 Semantic Tokens (CSS Custom Properties)

These are defined in `packages/app/src/index.css` under `@theme`. Use in CSS files only; use Tailwind classes in JSX.

```css
@theme {
  /* Primary accent */
  --color-corthex-accent: oklch(0.511 0.262 276);         /* indigo-600 #4F46E5 */
  --color-corthex-accent-hover: oklch(0.457 0.240 277);   /* indigo-700 #4338CA */
  --color-corthex-accent-dark: oklch(0.673 0.182 276);    /* indigo-400 #818CF8 */

  /* Semantic colors */
  --color-corthex-success: oklch(0.723 0.219 149);        /* green-500 #22C55E */
  --color-corthex-warning: oklch(0.769 0.188 78);         /* amber-500 #F59E0B */
  --color-corthex-error: oklch(0.637 0.237 25);           /* red-500 #EF4444 */
  --color-corthex-error-text: oklch(0.704 0.191 22);      /* red-400 #F87171 — for small text AA */

  /* Surfaces */
  --color-corthex-bg: oklch(0.141 0.005 285);             /* zinc-950 #09090B — page */
  --color-corthex-surface: oklch(0.210 0.006 285);        /* zinc-900 #18181B — card/panel */
  --color-corthex-elevated: oklch(0.274 0.006 286);       /* zinc-800 #27272A — elevated */
  --color-corthex-border: oklch(0.370 0.013 285);         /* zinc-700 #3F3F46 — standard border */

  /* Text */
  --color-corthex-text-primary: oklch(0.967 0.003 264);   /* zinc-100 #F4F4F5 */
  --color-corthex-text-secondary: oklch(0.872 0.006 285); /* zinc-300 #D4D4D8 */
  --color-corthex-text-muted: oklch(0.705 0.015 286);     /* zinc-400 #A1A1AA */

  /* Animations */
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-speech-enter: speech-enter 0.4s ease-out forwards;
}
```

---

## 8. Tailwind Config

### 8.1 CSS @theme Extension (`packages/app/src/index.css`)

Tailwind CSS 4 uses `@theme` in CSS instead of a JS config file for design tokens. Add to the existing `@theme` block:

```css
@import "tailwindcss";

@theme {
  /* === FONTS === */
  /* Tailwind v4: --font-sans maps to font-sans utility. NOT --font-family-sans */
  --font-sans: 'Work Sans', -apple-system, 'Apple SD Gothic Neo', BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  /* === CORTHEX SEMANTIC TOKENS === */
  --color-corthex-accent: oklch(0.511 0.262 276);
  --color-corthex-accent-hover: oklch(0.457 0.240 277);
  --color-corthex-accent-muted: oklch(0.257 0.090 281);   /* indigo-950 */
  --color-corthex-accent-text: oklch(0.785 0.115 274);    /* indigo-300 */
  --color-corthex-success: oklch(0.723 0.219 149);
  --color-corthex-warning: oklch(0.769 0.188 78);
  --color-corthex-error: oklch(0.637 0.237 25);
  --color-corthex-error-text: oklch(0.704 0.191 22);
  --color-corthex-bg: oklch(0.141 0.005 285);
  --color-corthex-surface: oklch(0.210 0.006 285);
  --color-corthex-elevated: oklch(0.274 0.006 286);
  --color-corthex-border: oklch(0.370 0.013 285);
  --color-corthex-text-primary: oklch(0.967 0.003 264);
  --color-corthex-text-secondary: oklch(0.872 0.006 285);
  --color-corthex-text-muted: oklch(0.705 0.015 286);

  /* === CUSTOM DURATIONS (Tailwind v4 arbitrary class equivalents) === */
  /* Use duration-[250ms], duration-[400ms] directly in JSX */

  /* === ANIMATIONS === */
  /* Tailwind v4: --animate-* in @theme generates animate-* utility class */
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-speech-enter: speech-enter 0.4s ease-out forwards;
  --animate-fade-in: fade-in 0.15s ease-out;
  --animate-scale-in: scale-in 0.3s ease-out;
}

/* === CUSTOM KEYFRAMES === */
@keyframes speech-enter {
  from { transform: translateX(-16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* === PREFERS-REDUCED-MOTION === */
@media (prefers-reduced-motion: reduce) {
  .speech-card {
    animation: none !important;  /* !important required — primary pattern uses inline style={{ animation: '...' }} */
    opacity: 1 !important;
    transform: none !important;
  }
}
/* NOTE: If using Framer Motion, useReducedMotion() hook is preferred over this CSS block — CSS cannot
   override inline styles without !important. Framer Motion's useReducedMotion() handles this at JS level. */
```

### 8.2 TypeScript Config (`tailwind.config.ts`) — For Tooling Support

Even though Tailwind CSS 4 uses CSS `@theme`, providing a `tailwind.config.ts` ensures IDE autocomplete and PostCSS tooling works. This file should extend, not replace, the `@theme` tokens.

```typescript
// tailwind.config.ts (at monorepo root or per-package)
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './packages/app/src/**/*.{ts,tsx}',
    './packages/admin/src/**/*.{ts,tsx}',
    './packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CORTHEX semantic tokens — mirrors @theme CSS vars
        corthex: {
          accent: 'oklch(0.511 0.262 276)',           // indigo-600 #4F46E5
          'accent-hover': 'oklch(0.457 0.240 277)',   // indigo-700 #4338CA
          'accent-muted': 'oklch(0.257 0.090 281)',   // indigo-950 #1E1B4B
          'accent-text': 'oklch(0.785 0.115 274)',    // indigo-300 #A5B4FC
          success: 'oklch(0.723 0.219 149)',           // green-500 #22C55E
          warning: 'oklch(0.769 0.188 78)',            // amber-500 #F59E0B
          error: 'oklch(0.637 0.237 25)',              // red-500 #EF4444
          'error-text': 'oklch(0.704 0.191 22)',      // red-400 #F87171
          bg: 'oklch(0.141 0.005 285)',                // zinc-950 #09090B
          surface: 'oklch(0.210 0.006 285)',           // zinc-900 #18181B
          elevated: 'oklch(0.274 0.006 286)',          // zinc-800 #27272A
          border: 'oklch(0.370 0.013 285)',            // zinc-700 #3F3F46
          'text-primary': 'oklch(0.967 0.003 264)',   // zinc-100 #F4F4F5
          'text-secondary': 'oklch(0.872 0.006 285)', // zinc-300 #D4D4D8
          'text-muted': 'oklch(0.705 0.015 286)',     // zinc-400 #A1A1AA
        },
      },
      fontFamily: {
        sans: [
          'Work Sans',
          '-apple-system',
          'Apple SD Gothic Neo',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'Cascadia Code',
          'Source Code Pro',
          'Menlo',
          'Consolas',
          'DejaVu Sans Mono',
          'monospace',
        ],
      },
      // borderRadius: NOT overriding — Tailwind built-ins already match §4.1 table intent:
      // rounded-sm = 2px ✅, rounded-md = 6px ✅, rounded-lg = 8px ✅, rounded-xl = 12px ✅, rounded-2xl = 16px ✅
      // Overriding would break the mapping (e.g., rounded-sm → 6px would contradict the doc). Use Tailwind defaults.
      transitionProperty: {
        // Named composite transition properties for common patterns
        'tracker': 'width',                          // TrackerPanel only
        'step': 'transform, opacity',                // SSE step rows
        'panel': 'width, height',                    // General panel resize
        'color-only': 'color, background-color, border-color', // Status changes
      },
      transitionDuration: {
        // Tailwind v4 still supports these for IDE autocomplete
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',   // Use duration-[250ms] in class — this for reference
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      keyframes: {
        'speech-enter': {
          from: { transform: 'translateX(-16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'speech-enter': 'speech-enter 400ms ease-out forwards',
        'slide-in': 'slide-in 300ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 300ms ease-out',
      },
      width: {
        // Named widths for CORTHEX layout system
        'sidebar': '15rem',       // w-60 — App sidebar
        'session': '16rem',       // w-64 — SessionPanel
        'tracker': '20rem',       // w-80 — TrackerPanel (expanded)
        'tracker-icon': '3rem',   // w-12 — TrackerPanel (icon strip)
        'drawer': '32.5rem',      // w-[520px] — Agent/Doc drawer
        'nexus-panel': '24rem',   // w-96 — NEXUS config overlay
      },
    },
  },
  plugins: [],
}

export default config
```

### 8.3 CSS Custom Property Usage Reference

```tsx
// ✅ CORRECT — Tailwind class in JSX:
<div className="bg-zinc-900 border border-zinc-700 text-zinc-300" />

// ✅ CORRECT — CSS token in .css file:
.my-component { background-color: var(--color-corthex-surface); }

// ❌ WRONG — CSS token in JSX (defeats Tailwind):
<div style={{ backgroundColor: 'var(--color-corthex-surface)' }} />

// ❌ WRONG — Tailwind class in CSS file:
.my-component { @apply bg-zinc-900; }  /* acceptable but discouraged — use token instead */
```

---

## 9. Interactive State Specs

### 9.1 Primary Button

| State | Classes |
|-------|---------|
| Default | `bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium` |
| Hover | `hover:bg-indigo-700` |
| Active/Pressed | `active:bg-indigo-800` |
| Disabled | `disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed` |
| Loading | `opacity-70 cursor-not-allowed` + `<Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />` |
| Focus | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900` (match local bg — see §9.4) |

### 9.2 Secondary / Ghost Button

| State | Classes |
|-------|---------|
| Default | `border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium bg-transparent` |
| Hover | `hover:bg-zinc-800 hover:border-zinc-600` |
| Active/Pressed | `active:bg-zinc-700` |
| Disabled | `disabled:opacity-40 disabled:cursor-not-allowed` |
| Focus | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900` (match local bg — see §9.4) |

### 9.3 Input / Textarea

| State | Classes |
|-------|---------|
| Default | `border border-zinc-700 bg-zinc-900 text-zinc-100 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500` — ⚠️ `placeholder:text-zinc-500` = 3.4:1 (below AA). Intentional tradeoff: WCAG 1.4.3 exempts placeholder text from contrast requirement (it is not content). Acceptable per spec. |
| Focus | `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent` |
| Error | `border-red-500 focus:ring-red-500` |
| Disabled | `disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed` |

### 9.4 Focus Ring Standard (Keyboard Navigation)

```tsx
// Use focus-visible: NOT focus: (avoids rings on mouse clicks)
// Required for WCAG AA keyboard navigation (2.4.7)
// ring-offset color must match the LOCAL background the element sits on, NOT always zinc-950.

// Context 1: Element on page root (bg-zinc-950)
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950

// Context 2: Element inside card/panel (bg-zinc-900) — buttons in cards, nav items, inputs
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900

// Context 3: Element inside elevated sub-panel (bg-zinc-800) — nested controls
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800

// Default (most common in app/admin — elements live on cards bg-zinc-900):
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
```

> **Rule**: Match `ring-offset-*` to the LOCAL background color of the element's immediate parent container. The ring-offset gap renders as the local bg — using `ring-offset-zinc-950` inside a `bg-zinc-900` card creates a dark gap that looks unintentional.

### 9.5 Nav Item States

| State | Classes |
|-------|---------|
| Default | `flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md` |
| Hover | `hover:bg-zinc-800 hover:text-zinc-100` |
| Active | `bg-indigo-950 text-indigo-300 font-medium` |
| Transition | `transition-colors duration-150 ease-out motion-reduce:transition-none` |

---

## 10. Component Composite Tokens

### 10.1 Toast / Notification

```tsx
// Positions: fixed bottom-4 right-4 z-50
// Variants:
// Success: bg-zinc-900 border-l-4 border-green-500 text-zinc-100
// Error: bg-zinc-900 border-l-4 border-red-500 text-zinc-100
// Warning: bg-zinc-900 border-l-4 border-amber-500 text-zinc-100
// Info: bg-zinc-900 border-l-4 border-indigo-500 text-zinc-100
// Container: shadow-xl rounded-lg p-4 flex items-center gap-3 min-w-[280px] max-w-sm
// Title: text-sm font-medium text-zinc-100
// Message: text-xs text-zinc-400 mt-0.5
```

### 10.2 Modal Dialog

```tsx
// Backdrop: fixed inset-0 z-50 bg-black/60 flex items-center justify-center
// Dialog: bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto shadow-2xl
// Header: flex items-center justify-between mb-4
// Title: text-lg font-semibold text-zinc-100
// Close button: text-zinc-400 hover:text-zinc-100 p-1 rounded
// Footer: flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-700  ← MUST be zinc-700, not zinc-800 (invisible on zinc-900)
```

### 10.3 Card

```tsx
// Standard: bg-zinc-900 border border-zinc-700 rounded-lg p-4
// Interactive (hoverable): hover:border-zinc-600 hover:bg-zinc-900/80 cursor-pointer transition-colors duration-150
// Selected: ring-2 ring-indigo-500 border-indigo-500
// Header: text-base font-medium text-zinc-100 mb-1
// Sub: text-xs text-zinc-400
```

### 10.4 Table

```tsx
// Container: overflow-hidden rounded-lg border border-zinc-700
// Table: w-full text-sm
// thead: bg-zinc-800
// th: px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-700
// tr (body): border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors duration-100
// td: px-3 py-2 text-zinc-300
// tr (last): border-b-0
```

---

*Document generated: 2026-03-12*
*Based on: Phase 0 Vision & Identity + Phase 2 Option A specs (Web 45/50, App 45/50, Landing 46/50)*
*Phase 2 critical decisions incorporated: border-zinc-700 rule, WCAG 2.2.2 no auto-collapse, duration-[250ms] syntax*
