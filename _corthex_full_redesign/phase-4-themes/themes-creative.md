# Phase 4-1: CORTHEX Creative Themes

**Date**: 2026-03-12
**Step**: Phase 4 — Theme Creation, Step 4-1
**Status**: APPROVED — Party Review Complete (avg 8.0/10: Critic-A 8.5 + Critic-B 7.5). Ready for Phase 5.
**Based on**: Phase 3-1 Design Tokens + Phase 3-2 Component Strategy + Phase 0 Vision & Identity + Phase 2 Option A specs

---

## Overview

Five dramatically distinct creative themes for CORTHEX. Each overrides the Phase 3-1 base token system while preserving the component architecture (CVA patterns, zinc token framework, Hub 3-column layout, accessibility baselines).

**Base token system** (Phase 3-1, carried into every theme unless explicitly overridden):
- Layout: `bg-zinc-950` page / `bg-zinc-900` sidebar / `border-zinc-700` borders
- Primary: `indigo-600` (#4F46E5)
- Status: green-500 / amber-500 / red-500
- Typography: Work Sans (primary) + system-mono
- Dark mode only — no light mode variants

Each theme overrides: primary palette, secondary/accent, surface colors, typography fonts, motion character, component aesthetics.

---

## Theme 1: Synaptic Cortex

### Concept

**One-line pitch**: Your AI organization visualized as a living, firing neural network — every agent interaction is a synapse.

**Visual metaphor**: A scanning electron microscope image of real brain tissue — deep black voids, silver-gray neural bodies, and electric-blue axon connections forming complex webs of light. Not science-fiction; real biology made beautiful.

**Mood board** (4 images):
1. Fluorescence microscopy of hippocampal neurons — cyan glowing cell bodies on pure black, filaments reaching like starlight
2. MIT Lincoln Lab's neural simulation render — dark navy field with branching white-hot pathways
3. A real-time fMRI activation map — isolated dark brain slice with indigo-to-cyan gradient activation zones
4. A fiber-optic bundle cross-section photographed end-on — each fiber glowing individual electric blue, surrounded by total darkness

**Design movement influence**: Biomorphic Data Visualization (Hans Rosling era) × Dark Science Aesthetics (Nature journal covers, 2020–2024)

---

### Color Override

**Philosophy**: Replace indigo-600 primary with neural-fire electric cyan. Keep zinc base surfaces (the dark "brain matter") but introduce a cold electric glow that makes every active element feel like a firing neuron.

#### Primary Colors

| Token | Name | Hex | OKLCH | Tailwind override | Rationale |
|-------|------|-----|-------|-------------------|-----------|
| `--color-primary` | Neural Cyan | `#00C8E8` | `oklch(0.763 0.128 198)` | `bg-[#00C8E8]` | Electric cyan = axon signal color; not ice-cold (not #00FFFF), not too blue — pure neural fire |
| `--color-primary-hover` | Cyan Bright | `#22D8F5` | `oklch(0.830 0.112 196)` | `hover:bg-[#22D8F5]` | Brightens on interaction, like voltage spike |
| `--color-primary-dark` | Neural Glow Dim | `#0094AB` | `oklch(0.590 0.100 199)` | — | Active state, selected borders |
| `--color-accent` | Synapse Violet | `#7C3AED` | `oklch(0.553 0.249 278)` | — | Secondary signals, T2 badge, secondary CTAs |
| `--color-accent-bright` | Cortex Purple | `#A78BFA` | `oklch(0.720 0.163 280)` | `text-[#A78BFA]` | Accent text on dark bg |

#### Background Surfaces

| Layer | Hex | OKLCH | Tailwind class | Context |
|-------|-----|-------|----------------|---------|
| Page base | `#060B14` | `oklch(0.090 0.022 245)` | `bg-[#060B14]` | Deeper than zinc-950 — pure neural black with a blue undertone |
| Sidebar / Panel | `#0D1526` | `oklch(0.138 0.033 246)` | `bg-[#0D1526]` | Like zinc-900 but with cold blue cast |
| Card surface | `#111D30` | `oklch(0.168 0.038 245)` | `bg-[#111D30]` | Slightly elevated panel |
| Elevated/hover | `#1A2D47` | `oklch(0.230 0.055 248)` | `bg-[#1A2D47]` | Hover states, elevated cards |
| Border | `#1E3050` | `oklch(0.255 0.058 248)` | `border-[#1E3050]` | Subtle panel borders, visible on card backgrounds |
| Border active | `#00C8E8` | `oklch(0.763 0.128 198)` | `border-[#00C8E8]` | Active selection rings, focused inputs |

#### Full Token Override Table

```css
/* packages/app/src/index.css — Synaptic Cortex theme override */
@theme {
  /* Page */
  --color-bg-page:          oklch(0.090 0.022 245);   /* #060B14 */
  --color-bg-sidebar:       oklch(0.138 0.033 246);   /* #0D1526 */
  --color-bg-card:          oklch(0.168 0.038 245);   /* #111D30 */
  --color-bg-elevated:      oklch(0.230 0.055 248);   /* #1A2D47 */

  /* Borders */
  --color-border-default:   oklch(0.255 0.058 248);   /* #1E3050 */
  --color-border-active:    oklch(0.763 0.128 198);   /* #00C8E8 */

  /* Primary (replaces indigo-600) */
  --color-corthex-accent:   oklch(0.763 0.128 198);   /* #00C8E8 — Neural Cyan */
  --color-corthex-accent-dark: oklch(0.590 0.100 199); /* #0094AB */

  /* Text */
  --color-text-primary:     oklch(0.940 0.012 240);   /* #E8F1F8 — near-white with cold undertone */
  --color-text-secondary:   oklch(0.700 0.030 240);   /* #97ADC4 */
  --color-text-muted:       oklch(0.530 0.025 240);   /* #647A91 */

  /* Status (unchanged) */
  --color-corthex-success:  oklch(0.647 0.196 152);   /* green-500 */
  --color-corthex-warning:  oklch(0.769 0.177 82);    /* amber-500 */
  --color-corthex-error:    oklch(0.627 0.257 29);    /* red-500 */
}
```

#### WCAG AA Contrast Ratios

| Text | Background | Hex pair | Contrast ratio | WCAG result |
|------|-----------|----------|---------------|-------------|
| `#E8F1F8` (primary text) | `#060B14` (page) | — | **18.4:1** | ✅ AAA |
| `#E8F1F8` (primary text) | `#111D30` (card) | — | **12.1:1** | ✅ AAA |
| `#97ADC4` (secondary text) | `#060B14` (page) | — | **7.8:1** | ✅ AA |
| `#97ADC4` (secondary text) | `#111D30` (card) | — | **5.1:1** | ✅ AA |
| `#00C8E8` (cyan primary) | `#060B14` (page) | — | **9.2:1** | ✅ AAA |
| `#00C8E8` (cyan primary) | `#111D30` (card bg) | — | **6.0:1** | ✅ AA |
| `#060B14` (dark text) | `#00C8E8` (cyan bg) | — | **9.2:1** | ✅ AAA (button labels) |
| `#647A91` (muted) | `#060B14` (page) | — | **4.44:1** | ✅ AA (large text) |
| `#647A91` (muted) | `#111D30` (card) | — | **3.80:1** | ⚠️ large text only — no `text-xs`, restrict to `text-sm` minimum |
| `#A78BFA` (accent text) | `#060B14` (page) | — | **8.1:1** | ✅ AAA |
| `#22C55E` (green-500) | `#060B14` (page) | — | **7.3:1** | ✅ AA |

---

### Typography Override

| Role | Font | Weight | Google Fonts URL |
|------|------|--------|-----------------|
| Heading | **Space Grotesk** | 500/600/700 | `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700` |
| Body | **Inter** | 400/500 | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500` |
| Monospace | **JetBrains Mono** | 400/500 | `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500` |

**Why Space Grotesk**: Geometric sans-serif with slightly irregular letterforms that feel engineered but organic — like neural tissue under a microscope. The slightly non-uniform character geometry (notice the "a", "G", "6") reads as precision with a biological undercurrent. Headings at 600 weight look like circuit labels.

**Why Inter**: Industry-standard legibility at small sizes. Neutral enough to not fight Space Grotesk in mixed contexts. Perfect for dense data labels, form fields, the TrackerPanel step rows.

**Why JetBrains Mono**: Ligatures for `->`, `=>`, `!=` make the cost badges and agent IDs feel like live code execution output. The slightly taller x-height vs. standard system-mono improves legibility at `text-xs`.

**Character/personality**: Scientific authority. A research lab that also ships products. Feels like the dashboard aboard a deep-sea research vessel — precise instruments in a cold, dark environment.

---

### Visual Details

| Element | Style | Tailwind classes |
|---------|-------|-----------------|
| **Sidebar** | Glassy deep-blue with a left neural-glow border | `bg-[#0D1526] border-r border-[#1E3050] relative after:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gradient-to-b after:from-transparent after:via-[#00C8E8]/30 after:to-transparent` |
| **Card** | Flat with cold blue border + subtle inner glow on hover | `bg-[#111D30] border border-[#1E3050] rounded-lg hover:border-[#00C8E8]/40 hover:shadow-[0_0_24px_rgba(0,200,232,0.08)] transition-[border-color,box-shadow] duration-200` |
| **Primary Button** | Solid cyan fill, dark text, no radius adjustment | `bg-[#00C8E8] text-[#060B14] font-medium px-4 py-2 rounded-lg hover:bg-[#22D8F5] active:bg-[#0094AB] transition-colors duration-150` |
| **Ghost Button** | Cyan border with transparent fill, glows on hover | `border border-[#1E3050] text-[#97ADC4] px-4 py-2 rounded-lg hover:border-[#00C8E8]/60 hover:text-[#E8F1F8] hover:bg-[#00C8E8]/5 transition-all duration-150` |
| **Input** | Cold-border, focus spawns a cyan glow ring | `bg-[#0D1526] border border-[#1E3050] rounded-lg px-3 py-2 text-sm text-[#E8F1F8] focus:outline-none focus:ring-2 focus:ring-[#00C8E8]/60 focus:border-[#00C8E8]` |
| **Icon style** | Lucide outlined, stroke-width 1.5, cyan tint on active | `text-[#647A91] group-hover:text-[#00C8E8] stroke-[1.5]` |
| **Animation mood** | Deliberate + electric — 200ms snappy micro, 300ms SSE step glow-in | New step: `translate-y-2 opacity-0 → translate-y-0 opacity-100` + faint cyan glow pulse `shadow-[0_0_12px_rgba(0,200,232,0.4)]` |
| **TrackerPanel active step** | Pulsing cyan dot (not indigo) + left rail of `#00C8E8` | `border-l-2 border-[#00C8E8] pl-3 shadow-[inset_4px_0_8px_rgba(0,200,232,0.15)]` |
| **TierBadge T1** | Cyan glow instead of indigo | `bg-[#00C8E8]/10 border border-[#00C8E8]/30 text-[#00C8E8] font-mono text-xs px-1.5 py-0.5 rounded` |
| **TierBadge T2** | Violet | `bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#A78BFA] font-mono text-xs px-1.5 py-0.5 rounded` |
| **StatusDot working** | Cyan animate-pulse (not indigo) | `h-2 w-2 rounded-full bg-[#00C8E8] animate-pulse motion-reduce:animate-none` |

---

### Sample Dashboard Screen

**Hub Main — Synaptic Cortex theme**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ bg-[#060B14] (neural black page) — 4-column horizontal layout                                    │
│                                                                                                  │
│ ┌─────────────────┐  ┌──────────────────────┐  ┌───────────────────────────┐  ┌───────────────┐ │
│ │ AppSidebar w-60  │  │ SessionPanel w-64     │  │ ChatArea  flex-1           │  │TrackerPanel   │ │
│ │ bg-[#0D1526]    │  │ bg-[#0D1526]          │  │ bg-[#060B14]               │  │w-80           │ │
│ │ border-r         │  │ border-r              │  │                            │  │bg-[#0D1526]   │ │
│ │ border-[#1E3050]│  │ border-[#1E3050]      │  │ ...messages...             │  │border-l       │ │
│ │ + right glow    │  │                       │  │                            │  │border-[#1E3050│ │
│ │ overlay         │  │ Session items:        │  │ Input:                     │  │               │ │
│ │                  │  │ bg-[#111D30]          │  │ border-[#1E3050]           │  │ ACTIVE CHAIN  │ │
│ │ Active nav:     │  │ rounded-lg            │  │ rounded-lg                 │  │               │ │
│ │ bg-[#00C8E8]/8  │  │ border-[#1E3050]      │  │ focus:ring-[#00C8E8]/40    │  │ Step rows:    │ │
│ │ text-[#00C8E8]  │  │                       │  │                            │  │ bg-[#111D30]  │ │
│ │ border-l-2      │  │ Active session:       │  │                            │  │ active:       │ │
│ │ border-[#00C8E8]│  │ border-[#00C8E8]/50   │  │                            │  │ border-l-2    │ │
│ └─────────────────┘  │ + cyan left-bar       │  │                            │  │ border-[cyan] │ │
│                      │                       │  │                            │  │ + glow shadow │ │
│                      │ StatusDot cyan        │  │                            │  │               │ │
│                      │ animate-pulse         │  │                            │  │               │ │
│                      └──────────────────────┘  └───────────────────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**AgentCard (in Session list)**:
```html
<div class="bg-[#111D30] border border-[#1E3050] rounded-lg p-3
            hover:border-[#00C8E8]/40 hover:shadow-[0_0_24px_rgba(0,200,232,0.06)]
            transition-[border-color,box-shadow] duration-200">
  <!-- Agent name: Space Grotesk 500 text-[#E8F1F8] text-sm -->
  <!-- TierBadge: bg-[#00C8E8]/10 border-[#00C8E8]/30 text-[#00C8E8] -->
  <!-- StatusDot working: bg-[#00C8E8] animate-pulse -->
  <!-- Cost: JetBrains Mono text-xs text-[#647A91] -->
</div>
```

**TrackerPanel step (active, Synaptic theme)**:
```html
<div class="border-l-2 border-[#00C8E8] pl-3 py-2 bg-[#00C8E8]/5
            shadow-[inset_4px_0_12px_rgba(0,200,232,0.12)]
            rounded-r-lg mb-1">
  <!-- AgentBadge: cyan StatusDot + Space Grotesk text-[#E8F1F8] text-xs + TierBadge cyan -->
  <!-- Depth: bg-[#1A2D47] text-[#00C8E8] font-mono text-xs rounded px-1.5 -->
  <!-- Elapsed: text-[#647A91] font-mono text-xs -->
</div>
```

**NEXUS org chart (Synaptic theme)**:
- Canvas background: `bg-[#060B14]`
- Node fill: `#111D30`, border: `#1E3050`, selected border: `#00C8E8`
- Node glow on select: `filter: drop-shadow(0 0 8px rgba(0,200,232,0.6))`
- Edge lines: `stroke: #1E3050`, active edge: `stroke: #00C8E8`, opacity: 0.7
- Mini-map: `bg-[#0D1526]`

---

### Who This Theme Is For

**User type**: Technical founders, data scientists turned entrepreneurs, hedge fund quants managing AI research teams. Users who feel at home in dark IDEs (VS Code + One Dark Pro), who associate the glow of `console.log()` output with productivity.

**Emotion evoked**: Deep focus. The kind of clarity you feel at 2am in a quiet office when a complex system is finally working. Reverent toward complexity.

**Best industries**: Fintech / quantitative trading, biotech AI research, security/intelligence platforms, deep-tech SaaS, academic AI labs commercializing research.

---
---

## Theme 2: Terminal Command

### Concept

**One-line pitch**: CORTHEX as the Bloomberg Terminal of AI — uncompromising information density, zero decoration, pure function.

**Visual metaphor**: A Bloomberg Terminal workstation photographed from above at 3am during a market event — pure black screens, amber ticker text cascading in columns, red/green flash alerts, the operator's reflection barely visible in the glass. Power through extreme restraint.

**Mood board** (4 images):
1. A real Bloomberg Terminal — black bezels, amber text, dozens of data columns with no wasted pixel
2. A 1980s VT100 terminal running stock quotes — green phosphor glow on black CRT glass
3. An air traffic control radar room — operators at dark consoles, each with dense tabular data, orange glow from screens
4. NORAD command center — military black consoles, amber status boards, zero decorative chrome

**Design movement influence**: Pre-GUI Professional Computing (1975–1985 terminal aesthetics) × Swiss International Style information architecture — maximally functional, zero ornament

---

### Color Override

**Philosophy**: Amber-on-black. The definitive information terminal palette. Amber (#FFB000) was chosen for CRT phosphor displays because it's the most legible color at high pixel density on dark backgrounds — and it communicates unambiguous authority.

#### Primary Colors

| Token | Name | Hex | OKLCH | Rationale |
|-------|------|-----|-------|-----------|
| `--color-primary` | Terminal Amber | `#FFB000` | `oklch(0.805 0.181 73)` | Classic phosphor amber — authority, urgency, precision |
| `--color-primary-hover` | Amber Bright | `#FFC833` | `oklch(0.862 0.167 79)` | Voltage increase on hover |
| `--color-primary-dark` | Amber Dim | `#CC8C00` | `oklch(0.673 0.163 68)` | Active/pressed state |
| `--color-accent` | Enterprise Green | `#22C55E` | `oklch(0.647 0.196 152)` | Secondary: enterprise confirmation green, 7.3:1 on black ✅ — mission-complete signal, not Matrix aesthetic |
| `--color-accent-alt` | Alert Red | `#FF3131` | `oklch(0.629 0.263 27)` | Errors — not Tailwind red-500, this is hotter |

#### Background Surfaces

| Layer | Hex | OKLCH | Tailwind class | Context |
|-------|-----|-------|----------------|---------|
| Page base | `#000000` | `oklch(0 0 0)` | `bg-black` | True black — terminal glass |
| Sidebar / Panel | `#0A0A0A` | `oklch(0.070 0 0)` | `bg-[#0A0A0A]` | 1 step up from pure black |
| Card surface | `#111111` | `oklch(0.125 0 0)` | `bg-[#111111]` | Data panels |
| Elevated/hover | `#1C1C1C` | `oklch(0.180 0 0)` | `bg-[#1C1C1C]` | Hover rows, selected items |
| Border | `#2A2A2A` | `oklch(0.240 0 0)` | `border-[#2A2A2A]` | Panel separation |
| Border active | `#FFB000` | `oklch(0.805 0.181 73)` | `border-[#FFB000]` | Active selection |
| Subtle amber bg | `#FFB000/8` | — | `bg-[#FFB000]/8` | Active nav, selected rows |

#### WCAG AA Contrast Ratios

| Text | Background | Contrast ratio | WCAG result |
|------|-----------|---------------|-------------|
| `#FFB000` (amber) | `#000000` (black) | **11.8:1** | ✅ AAA |
| `#FFB000` (amber) | `#111111` (card) | **9.7:1** | ✅ AAA |
| `#F5F5F5` (near-white) | `#000000` (black) | **20.0:1** | ✅ AAA |
| `#F5F5F5` (near-white) | `#111111` (card) | **16.4:1** | ✅ AAA |
| `#808080` (mid-gray) | `#000000` (black) | **5.3:1** | ✅ AA |
| `#22C55E` (green-500 success) | `#000000` (black) | **7.3:1** | ✅ AA |
| `#FF3131` (alert red) | `#000000` (black) | **5.8:1** | ✅ AA |
| `#000000` (dark) | `#FFB000` (amber bg) | **11.8:1** | ✅ AAA (button text) |

#### Full Token Override

```css
@theme {
  --color-bg-page:          oklch(0 0 0);              /* #000000 */
  --color-bg-sidebar:       oklch(0.070 0 0);          /* #0A0A0A */
  --color-bg-card:          oklch(0.125 0 0);          /* #111111 */
  --color-bg-elevated:      oklch(0.180 0 0);          /* #1C1C1C */
  --color-border-default:   oklch(0.240 0 0);          /* #2A2A2A */
  --color-border-active:    oklch(0.805 0.181 73);     /* #FFB000 */
  --color-corthex-accent:   oklch(0.805 0.181 73);     /* #FFB000 — Terminal Amber */
  --color-text-primary:     oklch(0.965 0 0);          /* #F5F5F5 */
  --color-text-secondary:   oklch(0.700 0 0);          /* #B0B0B0 */
  --color-text-muted:       oklch(0.500 0 0);          /* #808080 */
  --color-corthex-success:  oklch(0.647 0.196 152);    /* #22C55E — green-500, mission-complete signal (phosphor green #00FF41 reads as "Matrix hacking" culture, not enterprise confirmation) */
  --color-corthex-warning:  oklch(0.769 0.177 82);     /* amber-500 — same, fits perfectly */
  --color-corthex-error:    oklch(0.629 0.263 27);     /* #FF3131 alert red */
}
```

---

### Typography Override

| Role | Font | Weight | Google Fonts URL |
|------|------|--------|-----------------|
| Heading | **JetBrains Mono** | 400/500/700 | `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700` |
| Body | **JetBrains Mono** | 400 | (same) |
| Labels | **IBM Plex Mono** | 400/500 | `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500` |

**Why full monospace stack**: Terminal Command breaks the standard heading/body split — everything is monospace. This IS the Bloomberg Terminal choice. Every character occupies the same width; columns align perfectly without CSS column rules. Agent names become labels. Cost figures feel native, not bolted on.

**Root font override required**: Individual `font-mono` Tailwind classes are insufficient — Tailwind applies font to individual elements, not the document root. This theme requires a root-level font override in the `@theme` block:
```css
[data-theme="terminal-command"] {
  --font-sans: 'JetBrains Mono', monospace;
}
```
This makes JetBrains Mono the default sans font for the entire app when this theme is active, so every text element renders in monospace without requiring per-element `font-mono` classes.

**Character/personality**: A machine that doesn't apologize for being a machine. Zero-latency information delivery. The font choice says: "I am a professional operator of a professional system."

---

### Visual Details

| Element | Style | Tailwind / CSS classes |
|---------|-------|----------------------|
| **Sidebar** | Pure black, amber accent line on active, no decorative gradients | `bg-[#0A0A0A] border-r border-[#2A2A2A]` |
| **Card** | Flat black with 1px gray border — never rounded more than `rounded` (4px) | `bg-[#111111] border border-[#2A2A2A] rounded` |
| **Primary Button** | Sharp `rounded` corners, amber fill, black text — like a function key | `bg-[#FFB000] text-black font-mono font-medium text-sm px-4 py-1.5 rounded hover:bg-[#FFC833] active:bg-[#CC8C00] transition-colors duration-100` |
| **Ghost Button** | Amber border, amber text — same weight as data | `border border-[#FFB000]/50 text-[#FFB000] font-mono text-sm px-4 py-1.5 rounded hover:bg-[#FFB000]/8 hover:border-[#FFB000] transition-all duration-100` |
| **Input** | Black bg, 1px gray border, amber focus ring | `bg-black border border-[#2A2A2A] rounded text-[#F5F5F5] font-mono text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FFB000] focus:border-[#FFB000]` |
| **Icon style** | Lucide outlined, stroke-width 1.5, amber on active | `text-[#808080] group-hover:text-[#FFB000]` |
| **Animation mood** | Near-instantaneous — 100ms max. No easing curves. Hard cuts with brief flash | Step appear: `opacity-0 → opacity-100`, 100ms linear. No translate. Just a typewriter reveal. |
| **TrackerPanel active** | Amber left border, amber text on agent name | `border-l-2 border-[#FFB000] pl-3 bg-[#FFB000]/5` |
| **Nav active item** | Amber text + amber left bar, no background fill | `text-[#FFB000] border-l-2 border-[#FFB000] pl-2` |
| **Section labels** | ALL CAPS monospace, like a terminal section header | `font-mono text-xs text-[#808080] uppercase tracking-widest` |
| **Table rows** | Striped: `#000000` / `#111111`, amber on hover | `odd:bg-black even:bg-[#111111] hover:bg-[#FFB000]/5` |

---

### Sample Dashboard Screen

**Hub Main — Terminal Command theme**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ bg-black                                                                             │
│                                                                                      │
│ ┌────────────────────┐  ┌─────────────────────────────────┐  ┌────────────────────┐ │
│ │ CORTHEX v2.0       │  │ [SESSIONS]                      │  │ [ACTIVE CHAIN]     │ │
│ │ ──────────────────  │  │ ──────────────────────────────  │  │ ──────────────────  │ │
│ │ ▶ HUB              │  │ ● SEC-0041  삼성 분석            │  │ D0 비서실장        │ │
│ │   NEXUS            │  │   $0.0042 · 1,240 tok           │  │    ✓ 완료  0.3s    │ │
│ │   AGORA            │  │                                 │  │ D1 CIO ▶▶▶        │ │
│ │   LIBRARY          │  │ ○ SEC-0040  리포트 생성          │  │    처리중  12.4s   │ │
│ │   DASHBOARD        │  │   $0.1201 · 34,200 tok          │  │ D2 시황분석...     │ │
│ │ ──────────────────  │  │                                 │  │    대기중          │ │
│ │   ARGOS            │  │ ○ SEC-0039  전략 수립            │  │ ──────────────────  │ │
│ │   TRADING          │  │   $0.0890 · 22,100 tok          │  │ $0.0042 · 1,240    │ │
│ └────────────────────┘  └─────────────────────────────────┘  └────────────────────┘ │
│   Font: JetBrains Mono     All text: #F5F5F5 / #B0B0B0        Amber: #FFB000        │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**AgentCard (Terminal theme)**:
```html
<div class="bg-[#111111] border border-[#2A2A2A] rounded p-2
            hover:bg-[#FFB000]/5 hover:border-[#FFB000]/30
            transition-colors duration-100 font-mono">
  <!-- [●] 비서실장  [T1]  처리중 -->
  <!-- StatusDot: bg-[#FFB000] animate-pulse (working) -->
  <!-- Name: text-[#F5F5F5] text-xs -->
  <!-- TierBadge: border-[#2A2A2A] text-[#808080] bg-transparent -->
</div>
```

**NEXUS org chart (Terminal theme)**:
- Canvas: `bg-black` with faint dot grid `bg-[radial-gradient(#2A2A2A_1px,transparent_1px)] bg-[size:24px_24px]`
- Node: `bg-[#111111] border border-[#2A2A2A] rounded font-mono text-[#F5F5F5]`
- Selected node: `border-[#FFB000] shadow-[0_0_0_1px_#FFB000]`
- Edges: `stroke: #2A2A2A`, selected: `stroke: #FFB000`
- The grid gives the canvas an analog punch-card feeling

---

### Who This Theme Is For

**User type**: Experienced professionals who distrust anything "pretty". System traders, former Bloomberg employees, CTOs who built their first server in a data center at age 22. Users who maximize information per pixel and feel that animations are a waste of render budget.

**Emotion evoked**: Absolute authority. The feeling that this tool was built by people who take no shortcuts. "No UX tricks, no gradients — just data."

**Best industries**: Quantitative finance, algorithmic trading, cybersecurity operations, professional market intelligence, enterprise SaaS for financial services.

---
---

## Theme 3: Arctic Intelligence

### Concept

**One-line pitch**: CORTHEX as a Scandinavian research institute — rigorous, calm, and built for the long haul.

**Visual metaphor**: The interior of Svalbard Global Seed Vault photographed mid-winter — cool concrete walls with frost-blue uplighting, clean industrial typography on specimen labels, the quiet authority of a place that holds civilization's most important information. Precise. Cold. Absolutely trustworthy.

**Mood board** (4 images):
1. Svalbard vault interior — blue-white lights on concrete, systematic organization, near-silence
2. Finnish government report cover design — crisp white paper, black Helvetica headlines, one blue accent line
3. A laboratory bench photographed from above — white surface, tools arranged with geometric precision, nothing extraneous
4. The CERN control room — cool blue-white fluorescent lighting, clean white consoles, scientists in focus

**Design movement influence**: Scandinavian Minimalism (Dieter Rams principles applied to digital) × Swiss Grid Typography (Müller-Brockmann systematic layout)

---

### Color Override

**Philosophy**: Flip the base surfaces from zinc's warm near-black to a cooler blue-slate dark. Keep high contrast but replace orange-warm zinc with cold steel-blue zinc. Primary accent shifts from indigo-purple to a dignified steel blue.

#### Primary Colors

| Token | Name | Hex | OKLCH | Rationale |
|-------|------|-----|-------|-----------|
| `--color-primary` | Fjord Blue | `#1B81D4` | `oklch(0.623 0.210 222)` | Blue-teal at OKLCH 222° — distinctively blue-teal, not Tailwind blue-500 (259°) |
| `--color-primary-hover` | Fjord Light | `#1470BC` | `oklch(0.560 0.190 222)` | Darker Fjord on hover |
| `--color-primary-dark` | Fjord Deep | `#0F5A9C` | `oklch(0.490 0.175 222)` | Pressed state |
| `--color-accent` | Ice White | `#E2EEFF` | `oklch(0.940 0.035 250)` | Near-white with blue cast for text highlights |
| `--color-accent-secondary` | Steel | `#94A3B8` | `oklch(0.668 0.033 256)` | Slate-400 for secondary text, nav labels |

#### Background Surfaces

| Layer | Hex | OKLCH | Tailwind class | Context |
|-------|-----|-------|----------------|---------|
| Page base | `#080C14` | `oklch(0.095 0.025 250)` | `bg-[#080C14]` | Cold dark — darker than zinc-950, blue undertone |
| Sidebar / Panel | `#0E1624` | `oklch(0.145 0.035 248)` | `bg-[#0E1624]` | Slightly lighter with cold cast |
| Card surface | `#141E2E` | `oklch(0.180 0.040 248)` | `bg-[#141E2E]` | Cold panel bg |
| Elevated/hover | `#1C2B3F` | `oklch(0.235 0.050 250)` | `bg-[#1C2B3F]` | Hover state |
| Border | `#253347` | `oklch(0.280 0.048 250)` | `border-[#253347]` | Panel borders |
| Border active | `#1B81D4` | `oklch(0.623 0.210 222)` | `border-[#1B81D4]` | Active/selected — Fjord Blue (OKLCH 222°) |

#### WCAG AA Contrast Ratios

| Text | Background | Contrast ratio | WCAG result |
|------|-----------|---------------|-------------|
| `#E2EEFF` (primary text) | `#080C14` (page) | **18.1:1** | ✅ AAA |
| `#E2EEFF` (primary text) | `#141E2E` (card) | **11.8:1** | ✅ AAA |
| `#94A3B8` (secondary) | `#080C14` (page) | **7.2:1** | ✅ AA |
| `#94A3B8` (secondary) | `#141E2E` (card) | **4.7:1** | ✅ AA |
| `#1B81D4` (Fjord Blue) | `#080C14` (page) | **5.8:1** | ✅ AA |
| `#1B81D4` (Fjord Blue) | `#141E2E` (card) | **4.6:1** | ✅ AA |
| `#080C14` (dark text) | `#1B81D4` (blue bg) | **5.8:1** | ✅ AA (button text — dark per Swiss Typography) |
| `#60A5FA` (blue-400) | `#080C14` (page) | **9.4:1** | ✅ AAA |

#### Full Token Override

```css
@theme {
  --color-bg-page:          oklch(0.095 0.025 250);   /* #080C14 */
  --color-bg-sidebar:       oklch(0.145 0.035 248);   /* #0E1624 */
  --color-bg-card:          oklch(0.180 0.040 248);   /* #141E2E */
  --color-bg-elevated:      oklch(0.235 0.050 250);   /* #1C2B3F */
  --color-border-default:   oklch(0.280 0.048 250);   /* #253347 */
  --color-border-active:    oklch(0.623 0.210 222);   /* #1B81D4 — Fjord Blue (210° OKLCH, distinct from Tailwind blue-500's 259°) */
  --color-corthex-accent:   oklch(0.623 0.210 222);   /* #1B81D4 — Fjord Blue */
  --color-text-primary:     oklch(0.940 0.035 250);   /* #E2EEFF */
  --color-text-secondary:   oklch(0.668 0.033 256);   /* #94A3B8 */
  --color-text-muted:       oklch(0.530 0.028 252);   /* #687A8F */
  --color-corthex-success:  oklch(0.647 0.196 152);   /* green-500 */
  --color-corthex-warning:  oklch(0.769 0.177 82);    /* amber-500 */
  --color-corthex-error:    oklch(0.627 0.257 29);    /* red-500 */
}
```

---

### Typography Override

| Role | Font | Weight | Google Fonts URL |
|------|------|--------|-----------------|
| Heading | **Plus Jakarta Sans** | 600/700 | `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700` |
| Body | **Nunito Sans** | 400/500/600 | `https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600` |
| Monospace | **Fira Code** | 400/500 | `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500` |

**Why Plus Jakarta Sans**: Geometric humanist sans with clean optical balance — inspired by Swiss style but with a contemporary refinement. Large x-height ensures legibility at `text-xs` for dense tables. Letterforms are authoritative without being aggressive.

**Why Nunito Sans**: Rounded terminals on body text add subtle warmth to what could otherwise feel too clinical. Works perfectly at 14px/400 in dense text paragraphs (TrackerPanel labels, session descriptions, agent Soul excerpts).

**Character/personality**: A Scandinavian management consultant's laptop screen. Organized, thoughtful, respects your time, never explains more than necessary. Reading this UI feels like reading a well-designed annual report.

---

### Visual Details

| Element | Style | Tailwind / CSS classes |
|---------|-------|----------------------|
| **Sidebar** | Cold steel-blue dark, subtle top border accent line | `bg-[#0E1624] border-r border-[#253347]` |
| **Card** | Thin border, `rounded-lg` (Swiss Grid rigor — `rounded-xl` is too casual per Vision anti-patterns) | `bg-[#141E2E] border border-[#253347] rounded-lg` |
| **Primary Button** | `rounded-lg`, distinctive Fjord Blue `#1B81D4` (not Tailwind blue-500), dark text per Swiss Typography convention (WCAG: `#080C14` on `#1B81D4` = 5.8:1 ✅) | `bg-[#1B81D4] text-[#080C14] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1470BC] active:bg-[#0F5A9C] transition-colors duration-150` |
| **Ghost Button** | `rounded-lg`, thin steel border | `border border-[#253347] text-[#94A3B8] px-5 py-2.5 rounded-lg hover:bg-[#1B81D4]/8 hover:border-[#1B81D4]/40 hover:text-[#E2EEFF] transition-all duration-150` |
| **Input** | Cold-surface bg, thin border, Fjord Blue focus | `bg-[#0E1624] border border-[#253347] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B81D4]/50 focus:border-[#1B81D4]` |
| **Icon style** | Lucide outlined, stroke-width 1.5, blue tint on active | `text-[#687A8F] hover:text-[#1B81D4]` |
| **Animation mood** | Smooth and measured — 250ms ease-out with gentle fade | 300ms steps, opacity-based, no bold translate movements |
| **TrackerPanel active** | Fjord Blue left rail, cool blue bg tint | `border-l-2 border-[#1B81D4] pl-3 bg-[#1B81D4]/5 rounded-r-lg` |
| **Card border on hover** | Subtle blue shift — like a light turning on | `hover:border-[#1B81D4]/30 transition-colors duration-200` |
| **Section headers** | Spaced uppercase, steel color — Swiss Grid: 24px column gutters, 32px section spacing, 0.12em heading tracking | `text-xs font-semibold uppercase tracking-[0.12em] text-[#94A3B8]` |

---

### Sample Dashboard Screen

**Hub Main — Arctic Intelligence theme**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ bg-[#080C14] (arctic dark)                                                           │
│                                                                                      │
│ ┌─────────────────────┐  ┌──────────────────────────────────┐  ┌──────────────────┐ │
│ │ AppSidebar w-60      │  │ SessionPanel w-64                │  │ TrackerPanel w-80 │ │
│ │ bg-[#0E1624]        │  │ bg-[#0E1624]                     │  │ bg-[#0E1624]      │ │
│ │ border-[#253347]    │  │ border-r border-[#253347]        │  │ border-l          │ │
│ │                      │  │                                  │  │ border-[#253347]  │ │
│ │ Plus Jakarta Sans   │  │ SESSIONS                         │  │ ACTIVE CHAIN      │ │
│ │ headings            │  │ text-[#94A3B8] uppercase 11px    │  │ text-[#94A3B8]    │ │
│ │                      │  │                                  │  │                   │ │
│ │ Active nav:         │  │ Session cards:                   │  │ Step rows:        │ │
│ │ bg-[#1B81D4]/8      │  │ bg-[#141E2E] rounded-lg          │  │ bg-[#141E2E]      │ │
│ │ text-[#60A5FA]      │  │ hover:border-[#1B81D4]/30        │  │ rounded-lg        │ │
│ │ border-l-2          │  │                                  │  │ active: border-l-2│ │
│ │ border-[#1B81D4]    │  │ Nunito Sans body text            │  │ border-[#1B81D4]  │ │
│ └─────────────────────┘  └──────────────────────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**AgentCard (Arctic theme)**:
```html
<div class="bg-[#141E2E] border border-[#253347] rounded-lg p-3
            hover:border-[#1B81D4]/30 transition-colors duration-200">
  <!-- Plus Jakarta Sans 600 text-[#E2EEFF] text-sm — agent name -->
  <!-- TierBadge: bg-[#1B81D4]/10 border border-[#1B81D4]/30 text-[#60A5FA] font-mono text-xs -->
  <!-- Nunito Sans 400 text-[#94A3B8] text-xs — department -->
</div>
```

**NEXUS org chart (Arctic theme)**:
- Canvas bg: `bg-[#080C14]` with subtle dot grid
- Node: `bg-[#141E2E] border border-[#253347] rounded-lg text-[#E2EEFF]`
- Selected: `border-[#1B81D4] shadow-[0_0_0_2px_rgba(27,129,212,0.2)]`
- Edges: `stroke: #253347`, active: `stroke: #1B81D4`
- Overall: feels like a clean diagram from a McKinsey slide deck

---

### Who This Theme Is For

**User type**: Operations directors, strategy consultants managing AI teams, legal or compliance-focused companies that need their software to look credible in boardrooms. A user who prints dashboards to bring to meetings.

**Emotion evoked**: Trust without excitement. Confident calm. The feeling of reading a well-written briefing document from a competent team.

**Best industries**: Management consulting, enterprise B2B SaaS, legal tech, healthcare administration, government digital transformation, institutional banking.

---
---

## Theme 4: Neon Citadel

### Concept

**One-line pitch**: Your AI command center as a cyberpunk fortress — maximum visual aggression, neon precision, no mercy for the ordinary.

**Visual metaphor**: Akihabara district photographed at 2am from above — deep purple-black streets, electric pink and lime signage cutting through rain-wet surfaces, reflections doubling every neon source. Controlled chaos that is, on inspection, perfectly ordered. The chaos IS the signal.

**Mood board** (4 images):
1. Blade Runner 2049 ops center — deep purple-blue rooms, hot-pink LAPD holograms, perfectly functional
2. Akihabara at night from above — deep black streets turned mirror by rain, electric pink/white/green signs
3. A cyberpunk data center render — server racks lit with magenta and cyan LED strips, total darkness between racks
4. A high-frequency trading floor at night — ultra-wide monitors glowing purple-pink, operators in dark silhouette

**Design movement influence**: Cyberpunk Aesthetic (1984 Gibson-era visual language) × Memphis Design Group aggressive pattern energy — but applied with technical restraint

---

### Color Override

**Philosophy**: Replace indigo-600 with electric magenta. Introduce neon lime as the success/secondary accent. Deep purple-black replaces zinc's warm near-black. The result: extreme visual intensity contained in a rigorous grid — controlled aggression.

#### Primary Colors

| Token | Name | Hex | OKLCH | Rationale |
|-------|------|-----|-------|-----------|
| `--color-primary` | Electric Magenta | `#E91E8C` | `oklch(0.572 0.272 337)` | Hot pink-magenta — the cyberpunk signal color. Not pastel, not neon — precisely electric. |
| `--color-primary-hover` | Neon Pink | `#FF2DA0` | `oklch(0.630 0.280 336)` | Voltage increase on hover |
| `--color-primary-dark` | Deep Fuchsia | `#C4146E` | `oklch(0.492 0.253 338)` | Pressed state, active borders |
| `--color-accent` | Neon Lime | `#39FF14` | `oklch(0.868 0.253 130)` | The counterpoint to magenta — success, phosphor green reborn |
| `--color-accent-secondary` | Cyan Ghost | `#00F5FF` | `oklch(0.890 0.133 196)` | Tertiary — data highlights, TrackerPanel depth badges |

#### Background Surfaces

| Layer | Hex | OKLCH | Tailwind class | Context |
|-------|-----|-------|----------------|---------|
| Page base | `#080010` | `oklch(0.075 0.040 298)` | `bg-[#080010]` | Deep purple-black — the night sky of the citadel |
| Sidebar / Panel | `#0F0020` | `oklch(0.100 0.055 298)` | `bg-[#0F0020]` | Slightly elevated purple-black |
| Card surface | `#150A2A` | `oklch(0.135 0.060 296)` | `bg-[#150A2A]` | Panel bg |
| Elevated/hover | `#1F1040` | `oklch(0.178 0.072 294)` | `bg-[#1F1040]` | Hover, selected rows |
| Border | `#2D1558` | `oklch(0.228 0.085 290)` | `border-[#2D1558]` | Default panel borders |
| Border active | `#E91E8C` | `oklch(0.572 0.272 337)` | `border-[#E91E8C]` | Active selection |
| Border neon | `#E91E8C/50` | — | `border-[#E91E8C]/50` | Hover state borders |

#### WCAG AA Contrast Ratios

| Text | Background | Contrast ratio | WCAG result |
|------|-----------|---------------|-------------|
| `#F0E6FF` (primary text) | `#080010` (page) | **19.8:1** | ✅ AAA |
| `#F0E6FF` (primary text) | `#150A2A` (card) | **14.2:1** | ✅ AAA |
| `#B08ACC` (secondary text) | `#080010` (page) | **9.1:1** | ✅ AAA |
| `#B08ACC` (secondary text) | `#150A2A` (card) | **6.5:1** | ✅ AA |
| `#E91E8C` (magenta) | `#080010` (page) | **4.7:1** | ✅ AA |
| `#FF2DA0` (bright magenta) | `#080010` (page) | **5.8:1** | ✅ AA |
| `#39FF14` (neon lime) | `#080010` (page) | **14.8:1** | ✅ AAA |
| `#1A0030` (near-black) | `#E91E8C` (magenta bg) | **4.77:1** | ✅ AA (button text) |
| `#080010` (dark) | `#39FF14` (lime bg) | **14.8:1** | ✅ AAA |

#### Full Token Override

```css
@theme {
  --color-bg-page:          oklch(0.075 0.040 298);   /* #080010 */
  --color-bg-sidebar:       oklch(0.100 0.055 298);   /* #0F0020 */
  --color-bg-card:          oklch(0.135 0.060 296);   /* #150A2A */
  --color-bg-elevated:      oklch(0.178 0.072 294);   /* #1F1040 */
  --color-border-default:   oklch(0.228 0.085 290);   /* #2D1558 */
  --color-border-active:    oklch(0.572 0.272 337);   /* #E91E8C */
  --color-corthex-accent:   oklch(0.572 0.272 337);   /* #E91E8C — Electric Magenta */
  --color-text-primary:     oklch(0.935 0.030 290);   /* #F0E6FF */
  --color-text-secondary:   oklch(0.680 0.060 288);   /* #B08ACC */
  --color-text-muted:       oklch(0.510 0.050 288);   /* #7D5E99 */
  --color-corthex-success:  oklch(0.868 0.253 130);   /* #39FF14 — neon lime */
  --color-corthex-warning:  oklch(0.769 0.177 82);    /* amber-500 */
  --color-corthex-error:    oklch(0.627 0.257 29);    /* red-500 */
}
```

---

### Typography Override

| Role | Font | Weight | Google Fonts URL |
|------|------|--------|-----------------|
| Heading | **Exo 2** | 600/700/800 | `https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800` |
| Body | **Source Sans 3** | 400/500/600 | `https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600` |
| Monospace | **Share Tech Mono** | 400 | `https://fonts.googleapis.com/css2?family=Share+Tech+Mono` |

**Why Exo 2**: Science-fiction geometric sans with sharp diagonal cuts — designed specifically for cyberpunk/tech contexts (the movie *Ex Machina*'s title uses the same visual DNA). At 700+ weight, headings look like HUD overlays. Expressive without sacrificing readability.

**Why Source Sans 3**: Adobe's open-source humanist sans — maximum legibility at small sizes. Neutral body text that lets the Exo 2 headings dominate. The contrast between Exo 2's aggressive character and Source Sans 3's quiet professionalism creates the theme's visual tension.

**Character/personality**: A sentient defense contractor's internal software. Looks like it was designed to survive an EMP. The agent names feel like call signs. The cost figures feel like fuel consumption readings.

---

### Visual Details

| Element | Style | Tailwind / CSS classes |
|---------|-------|----------------------|
| **Sidebar** | Deep purple-black with a magenta left-edge glow on active items | `bg-[#0F0020] border-r border-[#2D1558]` |
| **Card** | Sharp edges (`rounded-lg` max), neon border on hover, subtle inner glow | `bg-[#150A2A] border border-[#2D1558] rounded-lg hover:border-[#E91E8C]/40 hover:shadow-[0_0_20px_rgba(233,30,140,0.12)] transition-all duration-200` |
| **Primary Button** | Magenta fill, sharp `rounded-md`, dark text (WCAG AA: `#1A0030` on `#E91E8C` = 4.77:1 ✅) | `bg-[#E91E8C] text-[#1A0030] font-semibold px-4 py-2 rounded-md hover:bg-[#FF2DA0] active:bg-[#C4146E] transition-colors duration-100` |
| **Ghost Button** | Magenta border, text matches, fills on hover | `border border-[#E91E8C]/50 text-[#E91E8C] px-4 py-2 rounded-md hover:bg-[#E91E8C]/10 hover:border-[#E91E8C] transition-all duration-100` |
| **Input** | Dark purple bg, default border, magenta focus ring | `bg-[#0F0020] border border-[#2D1558] rounded-md px-3 py-2 text-sm text-[#F0E6FF] focus:outline-none focus:ring-2 focus:ring-[#E91E8C]/50 focus:border-[#E91E8C]` |
| **Icon style** | Lucide outlined, stroke-width 1.5, magenta on active | `text-[#7D5E99] hover:text-[#E91E8C]` |
| **Animation mood** | Snappy + aggressive — 150ms with subtle glow flashes | Step appear: `opacity-0 → opacity-100 + shadow glow burst` 150ms. Snappy, no gentle easing. |
| **TrackerPanel active** | Magenta left rail, inner magenta glow | `border-l-2 border-[#E91E8C] pl-3 bg-[#E91E8C]/8 shadow-[inset_4px_0_8px_rgba(233,30,140,0.2)]` |
| **TierBadge T1** | Magenta — highest authority | `bg-[#E91E8C]/10 border border-[#E91E8C]/40 text-[#FF2DA0] font-mono text-xs px-1.5 py-0.5 rounded` |
| **TierBadge T2** | Cyan ghost — specialist | `bg-[#00F5FF]/8 border border-[#00F5FF]/30 text-[#00F5FF] font-mono text-xs px-1.5 py-0.5 rounded` |
| **StatusDot working** | Magenta pulsing | `h-2 w-2 rounded-full bg-[#E91E8C] animate-pulse motion-reduce:animate-none` |
| **Section labels** | Exo 2 uppercase, spaced, magenta tint | `font-[Exo_2] text-xs font-semibold uppercase tracking-[0.14em] text-[#E91E8C]/70` |

---

### Sample Dashboard Screen

**Hub Main — Neon Citadel theme**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ bg-[#080010] (citadel deep purple-black)                                             │
│                                                                                      │
│ ┌─────────────────────┐  ┌──────────────────────────────────┐  ┌──────────────────┐ │
│ │ CORTHEX             │  │ SESSION PANEL                    │  │ ACTIVE CHAIN     │ │
│ │ AppSidebar w-60      │  │ w-64 bg-[#0F0020]               │  │ TrackerPanel w-80 │ │
│ │ bg-[#0F0020]        │  │ border-r border-[#2D1558]        │  │ bg-[#0F0020]      │ │
│ │                      │  │                                  │  │                   │ │
│ │ Active nav:         │  │ Active session:                  │  │ D0 비서실장       │ │
│ │ bg-[#E91E8C]/10     │  │ border-[#E91E8C]/40 + glow       │  │ ✓ bg-[#39FF14]/5 │ │
│ │ text-[#FF2DA0]      │  │                                  │  │                   │ │
│ │ border-l-2          │  │ Cards: bg-[#150A2A]              │  │ D1 CIO ▶▶▶       │ │
│ │ border-[#E91E8C]    │  │ rounded-lg                       │  │ border-[#E91E8C]  │ │
│ │                      │  │ hover: magenta glow shadow       │  │ magenta glow      │ │
│ │ Inactive:           │  │                                  │  │                   │ │
│ │ text-[#B08ACC]      │  │ Exo 2 headings                   │  │ D2 waiting        │ │
│ └─────────────────────┘  └──────────────────────────────────┘  │ text-[#7D5E99]   │ │
│                                                                 └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**NEXUS org chart (Neon Citadel theme)**:
- Canvas bg: `bg-[#080010]` with faint radial grid (`#2D1558` dot grid)
- Node: `bg-[#150A2A] border border-[#2D1558] rounded-lg text-[#F0E6FF]`
- Selected: `border-[#E91E8C] shadow-[0_0_16px_rgba(233,30,140,0.4)]`
- Edges: `stroke: #2D1558`
- Active/selected edge only: `stroke: #E91E8C` with `filter: drop-shadow(0 0 4px rgba(233,30,140,0.4))` — apply to **selected edge only, not all edges** (20+ filtered SVG elements at opacity 0.8 = 200MB+ VRAM on mobile GPUs)
- The NEXUS in this theme looks like a circuit board powered by neon — electric and precise

---

### Who This Theme Is For

**User type**: Startups in deep-tech, crypto infrastructure, cybersecurity, gaming AI, or any team that considers their AI org chart an actual competitive weapon. Users whose personal desktop background is a cyberpunk city render.

**Emotion evoked**: Unstoppable momentum. The feeling that you're running the most advanced system in the industry and you know it. "We built this. It's live. It's ours."

**Best industries**: Cybersecurity, Web3/crypto infrastructure, gaming companies, deep-tech startups competing against legacy enterprises, advanced DeFi trading platforms, AI research labs that ship.

> **Brand Guardrail (Neon Citadel)**: This theme targets a specific niche audience — it is NOT the default CORTHEX brand expression. Electric magenta primary and neon lime success color read as "cyberpunk" or "gaming," which conflicts with CORTHEX's primary persona (김대표 — non-developer CEO in enterprise AI). This theme must not be the default or recommended theme. Suitable as an optional theme selection for deep-tech, crypto, and gaming customers who explicitly want a bold cyberpunk aesthetic. All admin documentation and onboarding should highlight Arctic Intelligence or Synaptic Cortex as the primary brand expression.

---
---

## Theme 5: Bioluminescent Deep

### Concept

**One-line pitch**: CORTHEX as a deep-ocean research station — your AI team glows like living organisms in the dark, each one a distinct light source.

**Visual metaphor**: The ROV Hercules at 800 meters depth — the camera captures pure darkness, and from that darkness, creatures glow in vivid greens, blues, and soft whites: a ctenophore trailing light, an anglerfish's bait glowing steady, a sea firefly pulsing. Each agent on CORTHEX is one of these creatures — independent, luminous, alive in the deep.

**Mood board** (4 images):
1. Monterey Bay Aquarium Research Institute deep-sea footage — total black water, teal-green bioluminescent organism centered in frame
2. A time-lapse of fireflies in a Japanese forest — pure black, dozens of independent soft-white-green light points drifting
3. Deep-sea coral at UV wavelengths — coral structures glowing turquoise and lime on a pure black bg
4. Jellyfish in the Monterey Bay Aquarium — translucent bodies with blue-teal internal glow, total black environment

**Design movement influence**: Biomimicry Design (Janine Benyus / IDEO Bio) × Contemporary Data Art (Refik Anadol's data sculptures) — organic intelligence made visible

---

### Color Override

**Philosophy**: The darkest backgrounds in any of the five themes — true oceanic black. From this void, agent activity glows like bioluminescence. The primary accent is deep-sea teal-green. Secondary is cerulean blue. Success is a warmer yellow-green (the color of deep-sea bacteria colonies). Every "active" state glows.

#### Primary Colors

| Token | Name | Hex | OKLCH | Rationale |
|-------|------|-----|-------|-----------|
| `--color-primary` | Bioluminescent Teal | `#00E5A0` | `oklch(0.825 0.163 163)` | The exact color of bioluminescent dinoflagellates photographed by MBARI — not a corporate teal, a living one |
| `--color-primary-hover` | Luminous Green | `#1AFFC4` | `oklch(0.891 0.148 166)` | Brightness surge on hover — like shaking a jar of dinos |
| `--color-primary-dark` | Deep Glow | `#00A872` | `oklch(0.640 0.136 163)` | Pressed state |
| `--color-accent` | Cerulean Depth | `#0096FF` | `oklch(0.627 0.215 231)` | Ocean blue for secondary actions, T2 badges |
| `--color-accent-soft` | Phosphor Blue | `#5BB8FF` | `oklch(0.748 0.145 228)` | Lighter cerulean for text on dark surfaces |

#### Background Surfaces

| Layer | Hex | OKLCH | Tailwind class | Context |
|-------|-----|-------|----------------|---------|
| Page base | `#020A10` | `oklch(0.065 0.018 222)` | `bg-[#020A10]` | Near-total-black with the faintest ocean-blue cast |
| Sidebar / Panel | `#071420` | `oklch(0.110 0.030 224)` | `bg-[#071420]` | Deep water panel |
| Card surface | `#0D1E2E` | `oklch(0.160 0.040 225)` | `bg-[#0D1E2E]` | Slightly elevated — like a pressure vessel |
| Elevated/hover | `#142A3E` | `oklch(0.210 0.048 224)` | `bg-[#142A3E]` | Hover state |
| Border | `#1A3550` | `oklch(0.255 0.060 225)` | `border-[#1A3550]` | Panel borders — like the separation between water layers |
| Border active | `#00E5A0` | `oklch(0.825 0.163 163)` | `border-[#00E5A0]` | Active state — organism lighting up |
| Glow bg | `#00E5A0/8` | — | `bg-[#00E5A0]/8` | Active item subtle glow background |

#### WCAG AA Contrast Ratios

| Text | Background | Contrast ratio | WCAG result |
|------|-----------|---------------|-------------|
| `#D4F4EE` (primary text) | `#020A10` (page) | **19.2:1** | ✅ AAA |
| `#D4F4EE` (primary text) | `#0D1E2E` (card) | **12.8:1** | ✅ AAA |
| `#7BBFAC` (secondary text) | `#020A10` (page) | **7.5:1** | ✅ AA |
| `#7BBFAC` (secondary text) | `#0D1E2E` (card) | **5.0:1** | ✅ AA |
| `#00E5A0` (teal primary) | `#020A10` (page) | **14.2:1** | ✅ AAA |
| `#00E5A0` (teal primary) | `#0D1E2E` (card) | **9.5:1** | ✅ AAA |
| `#020A10` (dark) | `#00E5A0` (teal bg) | **14.2:1** | ✅ AAA (button text) |
| `#5BB8FF` (cerulean text) | `#020A10` (page) | **9.8:1** | ✅ AAA |
| `#4B8568` (muted) | `#020A10` (page) | **4.6:1** | ✅ AA (large text) |

#### Full Token Override

```css
@theme {
  --color-bg-page:          oklch(0.065 0.018 222);   /* #020A10 */
  --color-bg-sidebar:       oklch(0.110 0.030 224);   /* #071420 */
  --color-bg-card:          oklch(0.160 0.040 225);   /* #0D1E2E */
  --color-bg-elevated:      oklch(0.210 0.048 224);   /* #142A3E */
  --color-border-default:   oklch(0.255 0.060 225);   /* #1A3550 */
  --color-border-active:    oklch(0.825 0.163 163);   /* #00E5A0 */
  --color-corthex-accent:   oklch(0.825 0.163 163);   /* #00E5A0 — Bioluminescent Teal */
  --color-text-primary:     oklch(0.940 0.025 170);   /* #D4F4EE — slight teal warmth in white */
  --color-text-secondary:   oklch(0.700 0.060 168);   /* #7BBFAC */
  --color-text-muted:       oklch(0.530 0.055 168);   /* #4B8568 */
  --color-corthex-success:  oklch(0.850 0.228 122);   /* #A3E635 — lime-400, warm yellow-green distinct from primary teal */
  --color-corthex-warning:  oklch(0.769 0.177 82);    /* amber-500 unchanged */
  --color-corthex-error:    oklch(0.627 0.257 29);    /* red-500 unchanged */
}
```

> **Note on success color**: Bioluminescent Deep uses a distinct warm lime-green (`#A3E635`) for success — bioluminescent organisms emit different spectral wavelengths to signal different states. `--color-corthex-success` (`#A3E635`) is visually distinguishable from the primary teal (`#00E5A0`), ensuring `D0 비서실장 ✓ 완료` (lime-green confirmation) is unmistakably different from `D1 CIO ●●● 처리중` (teal active glow) in the TrackerPanel. All success states must also include a ✓ icon to satisfy WCAG 1.3.3 (not color alone).

---

### Typography Override

| Role | Font | Weight | Google Fonts URL |
|------|------|--------|-----------------|
| Heading | **Outfit** | 500/600/700 | `https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700` |
| Body | **DM Sans** | 400/500 | `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500` |
| Monospace | **Inconsolata** | 400/500 | `https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500` |

**Why Outfit**: Geometric rounded sans with smooth, organic letter curves — designed to feel friendly and future-ready simultaneously. At 700 weight, headings feel confident but never aggressive. The rounded 'O', 'C', 'G' letterforms echo the curved shapes of deep-sea organisms.

**Why DM Sans**: Subtle optical corrections at small sizes make it the highest-legibility body font for dense UIs in 2024. Feels warmer than Inter, more organic — like it breathes.

**Why Inconsolata**: Excellent readability for long mono strings (cost: `$0.0042 · 1,240 tok`). Narrower than JetBrains Mono, fits TrackerPanel constraints better. The slightly humanist mono letterforms feel right for an organic theme.

**Character/personality**: A marine biologist's favorite data-visualization tool. Serious about data, beautiful about presentation. The kind of software featured in a Nature paper figure caption: "Figure 3C — real-time delegation trace."

---

### Visual Details

| Element | Style | Tailwind / CSS classes |
|---------|-------|----------------------|
| **Sidebar** | Darkest panel with a right border that glows teal on active items | `bg-[#071420] border-r border-[#1A3550]` |
| **Card** | Dark panel, rounded-xl, glows teal on hover like a bioluminescent creature waking | `bg-[#0D1E2E] border border-[#1A3550] rounded-xl hover:border-[#00E5A0]/30 hover:shadow-[0_0_28px_rgba(0,229,160,0.08)] transition-all duration-300` |
| **Primary Button** | Teal fill, near-black text, soft rounded | `bg-[#00E5A0] text-[#020A10] font-semibold px-4 py-2 rounded-xl hover:bg-[#1AFFC4] active:bg-[#00A872] transition-colors duration-150` |
| **Ghost Button** | Teal border + text, deep bg, glows on hover | `border border-[#00E5A0]/30 text-[#00E5A0] px-4 py-2 rounded-xl hover:bg-[#00E5A0]/8 hover:border-[#00E5A0]/60 transition-all duration-200` |
| **Input** | Deep ocean bg, light border, teal focus glow | `bg-[#071420] border border-[#1A3550] rounded-xl px-3 py-2 text-sm text-[#D4F4EE] focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/50 focus:border-[#00E5A0] transition-[border-color,box-shadow] duration-200` |
| **Icon style** | Lucide outlined, stroke-width 1.5, teal on active — like a creature lighting up | `text-[#4B8568] group-hover:text-[#00E5A0] transition-colors duration-200` |
| **Animation mood** | Breathing, organic — step entry: 200ms ease-out (Principle 3 compliant); StatusDot slow-pulse: 2s cycle (breathing character only on the indicator, not the full row) | Active step appear: 200ms `opacity-0 → opacity-100`. StatusDot: 2s `animate-[pulse_2s_ease-in-out_infinite]`. Glow pseudo-element: 3s breathing cycle. |
| **StatusDot working** | Slow teal pulse (longer cycle — `animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none`) | Custom keyframe: 0% brightness(100%), 50% brightness(170%), 100% brightness(100%) |
| **TrackerPanel active** | Teal left border + slow-breathing background glow | `border-l-2 border-[#00E5A0] pl-3 bg-[#00E5A0]/6 rounded-r-xl shadow-[inset_4px_0_16px_rgba(0,229,160,0.15)]` |
| **TierBadge T1** | Teal (primary organism) | `bg-[#00E5A0]/10 border border-[#00E5A0]/30 text-[#00E5A0] font-mono text-xs px-1.5 py-0.5 rounded-md` |
| **TierBadge T2** | Cerulean (secondary organism) | `bg-[#0096FF]/10 border border-[#0096FF]/30 text-[#5BB8FF] font-mono text-xs px-1.5 py-0.5 rounded-md` |
| **Section headers** | Outfit, spaced, teal at low opacity | `font-[Outfit] text-xs font-semibold uppercase tracking-[0.1em] text-[#00E5A0]/60` |
| **ARGOS schedule** | Special treatment: "eyes" metaphor gets teal status dots in a breathing pattern | Each scheduled job: a `rounded-full h-2 w-2 bg-[#00E5A0]` breathing (slow pulse) — 100 eyes, always watching |

---

### Sample Dashboard Screen

**Hub Main — Bioluminescent Deep theme**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ bg-[#020A10] (oceanic black)                                                         │
│                                                                                      │
│ ┌─────────────────────┐  ┌──────────────────────────────────┐  ┌──────────────────┐ │
│ │ AppSidebar w-60      │  │ SessionPanel w-64                │  │ TrackerPanel w-80 │ │
│ │ bg-[#071420]        │  │ bg-[#071420] border-r            │  │ bg-[#071420]      │ │
│ │ border-[#1A3550]    │  │ border-[#1A3550]                 │  │ border-l          │ │
│ │                      │  │                                  │  │ border-[#1A3550]  │ │
│ │ Nav active:         │  │ SESSIONS                         │  │ ACTIVE CHAIN      │ │
│ │ bg-[#00E5A0]/8      │  │ text-[#00E5A0]/60 tracking       │  │ text-[#00E5A0]/60 │ │
│ │ text-[#00E5A0]      │  │                                  │  │                   │ │
│ │ border-l-2          │  │ Session cards:                   │  │ D0 비서실장 ✓     │ │
│ │ border-[#00E5A0]    │  │ bg-[#0D1E2E] rounded-xl          │  │ teal glow confirm │ │
│ │                      │  │ hover: teal glow (300ms)         │  │                   │ │
│ │ Inactive:           │  │                                  │  │ D1 CIO ●●●        │ │
│ │ text-[#7BBFAC]      │  │ Outfit headings                  │  │ border-[#00E5A0]  │ │
│ └─────────────────────┘  │ DM Sans body                     │  │ breathing shadow  │ │
│                          └──────────────────────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**AgentCard (Bioluminescent Deep theme)**:
```html
<div class="bg-[#0D1E2E] border border-[#1A3550] rounded-xl p-3
            hover:border-[#00E5A0]/30 hover:shadow-[0_0_28px_rgba(0,229,160,0.07)]
            transition-all duration-300">
  <!-- Outfit 600 text-[#D4F4EE] text-sm — agent name -->
  <!-- TierBadge: bg-[#00E5A0]/10 border-[#00E5A0]/30 text-[#00E5A0] font-mono -->
  <!-- StatusDot: bg-[#00E5A0] animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none working -->
  <!-- Inconsolata text-[#4B8568] text-xs — cost data -->
</div>
```

**TrackerPanel step (active, Bioluminescent theme)**:
```html
<div class="bioluminescent-step relative border-l-2 border-[#00E5A0] pl-3 py-2.5 bg-[#00E5A0]/6
            rounded-r-xl mb-1.5">
  <!-- AgentBadge: teal StatusDot (slow pulse) + Outfit text-[#D4F4EE] text-xs + teal TierBadge -->
  <!-- Depth: bg-[#142A3E] text-[#5BB8FF] font-mono text-xs rounded-md px-1.5 -->
  <!-- Elapsed: Inconsolata text-[#4B8568] text-xs -->
</div>
```

```css
/* GPU-composited glow: opacity-only animation on ::before pseudo-element (no box-shadow paint).
   box-shadow triggers full repaint on every frame; opacity runs on the GPU compositor thread.
   animation: on ::before only — parent div content (text, borders) stays fully visible. */
.bioluminescent-step::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #00E5A0;
  border-radius: inherit;
  pointer-events: none;
  animation: bioluminescent-pulse 3s ease-in-out infinite;
}
@keyframes bioluminescent-pulse {
  0%, 100% { opacity: 0.15; }
  50%       { opacity: 0.35; }
}
```

**NEXUS org chart (Bioluminescent Deep theme)**:
- Canvas bg: `bg-[#020A10]` — pure ocean dark, no dot grid (organic, not mechanical)
- Node: `bg-[#0D1E2E] border border-[#1A3550] rounded-2xl text-[#D4F4EE]` — organic nodes like cells
- Selected node: `border-[#00E5A0] shadow-[0_0_20px_rgba(0,229,160,0.5)]` — creature lighting up
- Edges: `stroke: #1A3550`, active edge: `stroke: #00E5A0` with `filter: drop-shadow(0 0 3px rgba(0,229,160,0.7))`
- Depth glow: nodes at D0 slightly larger, D1 medium, D2 smaller — like pressure depth

---

### Who This Theme Is For

**User type**: Life science AI researchers, sustainability-focused tech companies, creative directors at design-forward startups. Users who feel that technology and nature are not in opposition. Teams that want their software to feel alive, not industrial.

**Emotion evoked**: Awe at the depth of your own organization. The feeling that watching your agents work is like watching a living ecosystem process information — each agent is an organism, perfectly evolved for its role.

**Best industries**: Life science / biotech AI, environmental tech, sustainability platforms, creative agencies managing AI content teams, digital health, academic research institutions that want beautiful tooling.

---

## Implementation Notes

### CSS Custom Property Implementation Pattern

All 5 themes use the same CSS custom property override pattern via Tailwind 4's `@theme` directive. Theme switching can be implemented as:

```css
/* Default theme (Phase 3-1 baseline = Synaptic Cortex or Arctic Intelligence) */
:root { ... }

/* Neon Citadel theme */
[data-theme="neon-citadel"] { ... }

/* Terminal Command theme */
[data-theme="terminal-command"] { ... }

/* Bioluminescent Deep theme */
[data-theme="bioluminescent-deep"] { ... }
```

### Google Fonts Loading Pattern

Each theme requires a specific font `<link>` in `packages/app/index.html`. Implementation via `data-theme` attribute swap + dynamic `<link>` injection, or preload all 5 at build time with `media="print" onload="this.media='all'"` pattern to avoid FOIT.

**Default theme fonts — `<link rel="preload">`** (eager, above-the-fold):
```html
<!-- Synaptic Cortex (default theme) — preload only these 3 -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap">
<link rel="stylesheet" href="[same URL]">
```

**All other theme fonts — `media="print" onload` lazy pattern** (deferred, no render-block):
```html
<link rel="stylesheet" media="print"
  onload="this.media='all'"
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500...">
<!-- One <link> per non-default theme, all using media="print" pattern -->
```
Total: ~30 font files (5 themes × avg 2 weights × 3 families). Only the 3 default-theme files block rendering; all others load in background.

### Animation Budget Compliance

All new keyframes (`bioluminescent-pulse`, etc.) must include `@media (prefers-reduced-motion: reduce)` overrides. **CRITICAL**: the media query override must target the **same CSS class that triggers the animation** — not inline `style=""` attributes (inline styles bypass CSS class selectors entirely). Use CSS classes, never inline style for animations:

```css
/* CORRECT — animation on ::before only (parent div content stays visible at full opacity) */
.bioluminescent-step::before { animation: bioluminescent-pulse 3s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .bioluminescent-step::before { animation: none; }
  .slow-pulse { animation: none; }
}
```

Tailwind `motion-reduce:animate-none` must be added to **all `animate-*` classes** in HTML examples (including `animate-[pulse_...]` arbitrary values):
```html
<!-- CORRECT — motion-reduce applied -->
<span class="animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none ..."></span>
```

---

*Generated: 2026-03-12*
*Step 4-1 — Creative Themes*
*Status: DRAFT — Awaiting 3-round party review*
