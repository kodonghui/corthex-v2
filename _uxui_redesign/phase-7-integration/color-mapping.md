# Phase 7-1 Color Mapping: Stitch → CORTHEX

**Purpose:** Reference table for page rebuild agents converting Stitch HTML to CORTHEX React components.
**Source:** `phase-3-design-system/design-tokens.md` (CORTHEX tokens) + `phase-6-generated/web/*.html` (Stitch output)
**Date:** 2026-03-23

---

## 1. Background Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Notes |
|-------------------------------|---------------|-------------|-------|
| `bg-background` / `bg-surface` / `#fbf9f6` / `#fef9f1` | `--bg-primary` | `#faf8f5` | Page background. Stitch varies per page; always map to cream. |
| `bg-[#faf8f5]` | `--bg-primary` | `#faf8f5` | Direct hex match — already correct. |
| `bg-surface-container-lowest` / `#ffffff` | `--bg-primary` | `#faf8f5` | Stitch uses pure white; CORTHEX uses warm cream. |
| `bg-surface-container-low` / `#f5f3f0` / `#f8f3eb` | `--bg-surface` | `#f5f0e8` | Cards, panels. Close match — use our warmer surface. |
| `bg-[#f5f0e8]` | `--bg-surface` | `#f5f0e8` | Direct hex match — already correct. |
| `bg-surface-container` / `#f2ede5` | `--bg-surface` | `#f5f0e8` | Mid-elevation surface → our single surface token. |
| `bg-surface-container-high` / `#eae8e5` / `#ece8e0` | `--bg-nexus` | `#f0ebe0` | Higher-contrast surface (NEXUS canvas, nested cards). |
| `bg-surface-container-highest` / `#e7e2da` | `--bg-nexus` | `#f0ebe0` | Deepest surface level → our alt surface. |
| `bg-surface-dim` / `#ded9d2` | `--bg-nexus` | `#f0ebe0` | Dimmed surface → use nexus bg (closest warm tone). |
| `bg-surface-bright` / `#fef9f1` | `--bg-primary` | `#faf8f5` | Bright surface variant → page background. |
| `bg-surface-variant` | `--bg-surface` | `#f5f0e8` | Generic surface variant → our standard surface. |
| `bg-[#283618]` / `bg-primary` (dark contexts) | `--bg-chrome` | `#283618` | Sidebar, dark cards. Direct hex match. |
| `bg-primary-container` / `#606c38` / `#5c6c49` | `--accent-primary` | `#606C38` | Accent containers → our accent background. |
| `hover:bg-white/50` | `--hover-light` | `rgba(0,0,0,0.04)` | Light hover. Stitch uses white overlay; we use subtle dark overlay on cream. |
| `hover:bg-[#606C38]` | `--accent-hover` | `#4e5a2b` | Button hover → use our darkened accent hover. |

## 2. Surface & Card Colors

| Stitch Pattern | CORTHEX Pattern | Notes |
|----------------|-----------------|-------|
| `bg-surface-container-low border border-outline-variant` | `bg-[--bg-surface] border border-[--border-primary]` | Standard card |
| `bg-[#f5f0e8] border border-[#e5e1d3]` | `bg-corthex-surface border border-corthex-border` | Already matches — keep as-is |
| `bg-surface-container-high` (nested card) | `bg-[--bg-nexus]` | Nested/inset elements use alt surface |
| `bg-[#283618]` (inverted card) | `bg-corthex-chrome` | Dark accent cards (e.g., Daily Cost widget) |

## 3. Primary & Accent Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Notes |
|-------------------------------|---------------|-------------|-------|
| `text-primary` / `#485422` / `#455433` | `--accent-primary` | `#606C38` | Stitch "primary" = our accent. Hex varies per page; normalize to `#606C38`. |
| `bg-primary` (button context) | `--accent-primary` | `#606C38` | Primary button bg. |
| `bg-primary-container` / `#606c38` | `--accent-primary` | `#606C38` | Container variant → same accent. |
| `text-on-primary-container` / `#dfedac` / `#daedc1` | `--text-chrome` | `#a3c48a` | Light text on accent bg. Use our chrome text (better contrast on `#283618`). |
| `text-on-primary` / `#ffffff` | `--text-on-accent` | `#ffffff` | White text on accent buttons. Direct match. |
| `bg-on-primary` | (context-dependent) | — | Stitch uses this for icon containers; map to `--bg-surface` or `--accent-muted`. |
| `text-on-primary-fixed` | `--text-on-accent` | `#ffffff` | Fixed surface text → white on accent. |
| `border-primary-container` | `--accent-primary` with opacity | `#606C38/30` | Accent-tinted borders (e.g., outline buttons). Use `border-[#606C38]/30`. |
| `hover:text-white` (on accent hover) | `--text-on-accent` | `#ffffff` | Direct match. |
| `text-primary font-bold` (trend indicator) | `--accent-primary` | `#606C38` | Positive trend color. |

## 4. Secondary Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Notes |
|-------------------------------|---------------|-------------|-------|
| `text-secondary` / `#546341` | `--text-secondary` | `#6b705c` | Secondary text. Stitch is greener; use our neutral olive. |
| `bg-secondary` / `#546341` | `--accent-secondary` | `#5a7247` | Secondary button/tag bg. |
| `bg-secondary-container` / `#d7e9bd` | `--accent-muted` | `rgba(96,108,56,0.10)` | Badges/tags. Stitch uses opaque green tint; we use transparent accent overlay. |
| `text-on-secondary-container` / `#5a6947` | `--accent-secondary` | `#5a7247` | Badge text on secondary container. Near-match. |
| `text-on-secondary` / `#ffffff` | `--text-on-accent` | `#ffffff` | White text on secondary bg. |
| `bg-secondary-fixed` / `#dbe9a9` | `--accent-muted` | `rgba(96,108,56,0.10)` | Fixed secondary surface → accent muted overlay. |
| `text-on-secondary-fixed` | `--text-primary` | `#1a1a1a` | Text on light fixed surface → primary text. |

## 5. Tertiary Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Notes |
|-------------------------------|---------------|-------------|-------|
| `text-tertiary` / `#654367` / `#4c513e` | `--text-tertiary` | `#756e5a` | Stitch tertiary = purple or muted green (inconsistent). Use our warm olive-gray. |
| `bg-tertiary` | `--bg-surface` | `#f5f0e8` | Tertiary bg has no CORTHEX equivalent; map to surface. |
| `bg-tertiary-container` | `--accent-muted` | `rgba(96,108,56,0.10)` | Tertiary container → accent muted. |
| `text-tertiary-container` | `--text-secondary` | `#6b705c` | Tertiary container text → secondary text. |
| `border-tertiary-container` | `--border-primary` | `#e5e1d3` | Tertiary borders → our decorative border. |

## 6. Text Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | WCAG |
|-------------------------------|---------------|-------------|------|
| `text-[#1a1a1a]` / `text-on-surface` / `text-on-background` | `--text-primary` | `#1a1a1a` | 16.42:1 |
| `text-[#283618]` (headings on cream) | `--text-primary` | `#1a1a1a` | Use neutral dark, not olive for body headings. Exception: brand "CORTHEX" can use `#283618`. |
| `text-[#756e5a]` (labels) | `--text-tertiary` | `#756e5a` | 4.79:1 |
| `text-[#6b705c]` | `--text-secondary` | `#6b705c` | 4.83:1 |
| `text-outline` / `#77786b` | `--text-secondary` | `#6b705c` | Stitch "outline" as text → our secondary text (similar contrast). |
| `text-outline-variant` / `#c7c8b9` | `--text-disabled` | `#a3a08e` | Low-contrast text → disabled (decorative only). |
| `text-on-surface-variant` / `#46483c` | `--text-primary` | `#1a1a1a` | High-contrast variant → primary text. |
| `text-[#d7e9bd]` (on dark bg) | `--text-chrome` | `#a3c48a` | Light green on olive chrome. |
| `text-[#faf8f5]` (on dark bg) | `--text-on-accent` | `#ffffff` | Cream on dark → just use white for max contrast. |
| `text-surface` (on dark bg) | `--text-chrome` | `#a3c48a` | Light text on chrome bg. |

## 7. Border & Outline Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Notes |
|-------------------------------|---------------|-------------|-------|
| `border-[#e5e1d3]` | `--border-primary` | `#e5e1d3` | Direct match. Decorative only. |
| `border-[#e5e1d3]/50` | `--border-primary` with opacity | `#e5e1d3/50` | Subtle dividers — keep opacity. |
| `border-outline` / `#77786b` | `--border-input` | `#908a78` | Interactive boundaries (inputs, selects). |
| `border-outline-variant` / `#c7c8b9` | `--border-primary` | `#e5e1d3` | Decorative borders. Our sand border is warmer. |
| `border-surface-container` | `--border-primary` | `#e5e1d3` | Surface-level dividers. |
| `border-primary` (accent context) | `--accent-primary` | `#606C38` | Accent-colored borders (active states). |
| `border-error` / `#ba1a1a` | `--semantic-error` | `#dc2626` | Error borders. Use our error red. |

## 8. Semantic Colors

| Stitch (Tailwind class / hex) | CORTHEX Token | CORTHEX Hex | Paired Icon (Lucide) |
|-------------------------------|---------------|-------------|----------------------|
| `text-error` / `bg-error` / `#ba1a1a` | `--semantic-error` | `#dc2626` | `AlertCircle` |
| `bg-error-container` / `#ffdad6` | `--semantic-error` with opacity | `rgba(220,38,38,0.10)` | Error bg tint. |
| `text-error-container` | `--semantic-error` | `#dc2626` | Error icon/text on light bg. |
| `text-[#4d7c0f]` (success) | `--semantic-success` | `#4d7c0f` | `CheckCircle` |
| `text-[#b45309]` (warning/pinned) | `--semantic-warning` | `#b45309` | `AlertTriangle` |
| `text-[#2563eb]` (info) | `--semantic-info` | `#2563eb` | `Info` |
| `text-[#7c3aed]` (handoff/delegation) | `--semantic-handoff` | `#7c3aed` | `ArrowRightLeft` |

## 9. Interaction States

| Stitch Pattern | CORTHEX Token | CORTHEX Value |
|----------------|---------------|---------------|
| `hover:bg-white/50` | `--hover-light` | `rgba(0,0,0,0.04)` |
| `hover:bg-[#606C38]` | `--accent-hover` | `#4e5a2b` |
| `hover:shadow-md` | (keep as-is) | Tailwind `shadow-md` |
| `focus:ring-2 ring-primary` | `--focus-ring` | `2px solid #606C38` |
| `transition-colors` / `transition-all duration-200` | (keep as-is) | Standard Tailwind transitions |
| `bg-[rgba(96,108,56,0.7)]` (pulsing dot) | `--accent-primary` | `#606C38` with animation opacity |

## 10. Chrome (Sidebar/Dark) Colors

| Stitch Pattern | CORTHEX Token | CORTHEX Hex |
|----------------|---------------|-------------|
| `bg-[#283618]` | `--bg-chrome` | `#283618` |
| `text-[#a3c48a]` / `text-[#d7e9bd]` | `--text-chrome` | `#a3c48a` |
| `text-[rgba(163,196,138,0.80)]` | `--text-chrome-dim` | `rgba(163,196,138,0.80)` |
| `hover:bg-[rgba(255,255,255,0.10)]` | `--bg-chrome-hover` | `rgba(255,255,255,0.10)` |
| Active nav item bg | `--bg-chrome-active` | `rgba(255,255,255,0.15)` |
| Focus ring on sidebar | `--focus-ring-chrome` | `2px solid #a3c48a` |

---

## 11. Material Symbols → Lucide React Icon Mapping

All 57 unique Material Symbols icons found across Stitch HTML pages, mapped to Lucide React equivalents.

### Navigation & Actions

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `add` | `Plus` | `lucide-react` |
| `close` | `X` | `lucide-react` |
| `chevron_left` | `ChevronLeft` | `lucide-react` |
| `chevron_right` | `ChevronRight` | `lucide-react` |
| `first_page` | `ChevronsLeft` | `lucide-react` |
| `last_page` | `ChevronsRight` | `lucide-react` |
| `fullscreen` | `Maximize` | `lucide-react` |
| `more_vert` | `MoreVertical` | `lucide-react` |
| `search` | `Search` | `lucide-react` |
| `download` | `Download` | `lucide-react` |
| `share` | `Share2` | `lucide-react` |
| `visibility` | `Eye` | `lucide-react` |

### Data & Charts

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `bar_chart` | `BarChart3` | `lucide-react` |
| `trending_up` | `TrendingUp` | `lucide-react` |
| `trending_down` | `TrendingDown` | `lucide-react` |
| `analytics` | `LineChart` | `lucide-react` |
| `monitoring` | `Activity` | `lucide-react` |
| `query_stats` | `BarChartBig` | `lucide-react` |
| `overview` | `LayoutDashboard` | `lucide-react` |
| `speed` | `Gauge` | `lucide-react` |
| `add_chart` | `PlusSquare` | `lucide-react` |
| `layers` | `Layers` | `lucide-react` |

### People & Agents

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `person_add` | `UserPlus` | `lucide-react` |
| `smart_toy` | `Bot` | `lucide-react` |
| `handshake` | `Handshake` | `lucide-react` |

### Tasks & Status

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `check_circle` | `CheckCircle` | `lucide-react` |
| `task_alt` | `CheckCircle2` | `lucide-react` |
| `play_arrow` | `Play` | `lucide-react` |
| `playlist_add` | `ListPlus` | `lucide-react` |
| `schedule` | `Clock` | `lucide-react` |
| `history` | `History` | `lucide-react` |
| `calendar_today` | `Calendar` | `lucide-react` |

### Communication

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `chat_bubble` | `MessageCircle` | `lucide-react` |
| `forum` | `MessagesSquare` | `lucide-react` |

### Security & Access

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `shield` | `Shield` | `lucide-react` |
| `shield_with_house` | `ShieldCheck` | `lucide-react` |
| `security` | `ShieldAlert` | `lucide-react` |
| `lock` | `Lock` | `lucide-react` |
| `key` | `KeyRound` | `lucide-react` |
| `policy` | `FileCheck` | `lucide-react` |

### Finance

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `account_balance_wallet` | `Wallet` | `lucide-react` |
| `payments` | `CreditCard` | `lucide-react` |

### Content & Files

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `description` | `FileText` | `lucide-react` |
| `cloud_download` | `CloudDownload` | `lucide-react` |
| `database` | `Database` | `lucide-react` |

### Alerts & Info

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `warning` | `AlertTriangle` | `lucide-react` |
| `lightbulb` | `Lightbulb` | `lucide-react` |

### Workflow & Structure

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `account_tree` | `GitBranch` | `lucide-react` |
| `auto_awesome` | `Sparkles` | `lucide-react` |
| `settings_input_component` | `Settings2` | `lucide-react` |
| `terminal` | `Terminal` | `lucide-react` |
| `bolt` | `Zap` | `lucide-react` |
| `rocket_launch` | `Rocket` | `lucide-react` |
| `push_pin` | `Pin` | `lucide-react` |
| `delete_forever` | `Trash2` | `lucide-react` |

### Zoom

| Material Symbols | Lucide React | Import |
|-----------------|-------------|--------|
| `zoom_in` | `ZoomIn` | `lucide-react` |
| `zoom_out` | `ZoomOut` | `lucide-react` |

---

## 12. Quick Reference — Tailwind Config

For `tailwind.config.ts`, define CORTHEX colors under the `corthex` namespace:

```ts
colors: {
  corthex: {
    bg:        '#faf8f5',  // --bg-primary
    surface:   '#f5f0e8',  // --bg-surface
    nexus:     '#f0ebe0',  // --bg-nexus
    border:    '#e5e1d3',  // --border-primary
    'border-strong': '#d4cfc4',
    'border-input':  '#908a78',
    chrome:    '#283618',  // --bg-chrome
    accent:    '#606C38',  // --accent-primary
    'accent-hover':  '#4e5a2b',
    'accent-secondary': '#5a7247',
    'accent-muted': 'rgba(96,108,56,0.10)',
  },
  // Text colors in theme.extend.textColor or via CSS vars
}
```

---

## 13. Conversion Checklist (per page)

When converting a Stitch HTML page to CORTHEX React:

1. **Replace `<link>` for Material Symbols** — remove entirely; use Lucide React imports instead.
2. **Replace `<span class="material-symbols-outlined" data-icon="X">`** — use `<X size={20} />` from Lucide.
3. **Replace Stitch's `tailwind.config` colors** — use CORTHEX tokens per mappings above.
4. **Replace `bg-background` / `bg-surface`** — use `bg-corthex-bg` / `bg-corthex-surface`.
5. **Replace `text-primary`** (Stitch accent) — use `text-corthex-accent` for accent or `text-[#1a1a1a]` for body text.
6. **Replace `text-outline`** — use `text-corthex-text-secondary` (`#6b705c`).
7. **Replace `border-outline-variant`** — use `border-corthex-border` (`#e5e1d3`).
8. **Replace `text-error` / `bg-error`** — use `text-semantic-error` (`#dc2626`).
9. **Replace `bg-secondary-container`** (badges) — use `bg-corthex-accent-muted`.
10. **Verify all interactive borders** use `--border-input` (`#908a78`), not decorative `--border-primary`.
