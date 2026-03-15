# CORTHEX Archetypal Themes — Creative Direction
**Phase:** 4 · Themes
**Date:** 2026-03-15
**Version:** 1.0
**Method:** Jungian Archetype (Structure) × Major Arcana (Color/Mood) Alchemy
**Base tokens:** phase-3-design-system/design-tokens.md (all overrides layer on top)

---

## Alchemy Formula

```
ARCHETYPE (behavioral/structural pattern)
  + MAJOR ARCANA CARD (color/mood modifier)
  = Complete Theme Design System
```

Each theme overrides the base CORTHEX design tokens (Swiss International Style, slate-950 dark)
with a distinct archetype+card personality. Status semantics (emerald=success, red=error,
blue=working, violet=handoff) are preserved across all themes — only accent, surface, and
typographic tokens change.

---

## Theme Index

| # | Theme Name | Archetype | Card | Primary | Target |
|---|-----------|-----------|------|---------|--------|
| 1 | [IMPERIAL COMMAND](#1-imperial-command) | Ruler | Emperor | `#dc2626` Imperial Red | Enterprise admins |
| 2 | [CONTEMPLATIVE DEPTHS](#2-contemplative-depths) | Sage | Hermit | `#4338ca` Deep Indigo | Knowledge workers |
| 3 | [LUNAR ALCHEMY](#3-lunar-alchemy) | Magician | Moon | `#cbd5e1` Moonlight Silver | AI enthusiasts |
| 4 | [SOLAR CONQUEST](#4-solar-conquest) | Hero | Sun | `#fbbf24` Solar Gold | Startup teams |
| 5 | [STELLAR FORGE](#5-stellar-forge) | Creator | Star | `#38bdf8` Starlight Blue | Creative teams |

---

---

## 1. IMPERIAL COMMAND

**Archetype:** THE RULER · **Card:** IV THE EMPEROR
**Formula:** Ruler + Emperor = Sovereign authority in imperial red and obsidian

---

### 1.1 Archetype Personality — THE RULER

**Core drive:** Control, order, absolute leadership. The Ruler does not ask — it commands.
Every UI decision reinforces hierarchy, permanence, and sovereign authority.

**UI structure rules (from Jungian skill):**
- **Layout:** Strict formal symmetry. Sidebar is fixed, immovable, presidential. Never collapses.
- **Information architecture:** Explicit hierarchical levels — Tier 1 commanders always at top; Tier 4 specialists at bottom. Rank is always visible.
- **Control panel metaphor:** Every screen feels like an instrument panel in a war room. Data before aesthetics.
- **Status indicators:** Must radiate urgency. A failed task is not a subtle red dot — it demands attention with solid filled badges.
- **CTAs:** Imperial commands. Single word, uppercase, no ambiguity. "EXECUTE", "DEPLOY", "DISMISS".
- **Component patterns:** `border-l-4` left accent bars on all cards (marks rank/authority). Premium surface depth with subtle material texture.
- **Spacing:** Precise, authoritative — `p-6` cards, `gap-6` grid, generous but not soft.
- **Typography:** Prestigious serifs for headings (signals institutional weight). Strong weight hierarchy.

**Motion behavior:**
- Transitions: `duration-200 ease-in-out` — fast, decisive, no hesitation
- Active elements: No bounce, no spring. Linear movement with purpose.
- Hover: `scale-[1.01]` — power expands, never shrinks
- Page transitions: Instant `opacity-0 → opacity-100 duration-150` — command center doesn't fade in

---

### 1.2 Card Color Palette — IV THE EMPEROR

**Energy:** Authority, structure, leadership. Stone fortress. Absolute control.

| Role | Name | Hex | Tailwind | RGB |
|------|------|-----|----------|-----|
| **Primary** | Imperial Red | `#dc2626` | `red-600` | 220, 38, 38 |
| **Secondary** | Iron Gray | `#52525b` | `zinc-600` | 82, 82, 91 |
| **Accent** | Royal Gold | `#eab308` | `yellow-500` | 234, 179, 8 |
| **Accent Light** | Pale Gold | `#fef08a` | `yellow-200` | 254, 240, 138 |
| **Dark Base** | Obsidian Black | `#18181b` | `zinc-900` | 24, 24, 27 |
| **Surface** | Fortress Stone | `#27272a` | `zinc-800` | 39, 39, 42 |
| **Deep** | Throne Dark | `#09090b` | `zinc-950` | 9, 9, 11 |

**Gradient formula:** `from-zinc-950 via-zinc-900 to-red-950`
**Card gradient:** `from-red-600/15 via-zinc-900/80 to-zinc-900/80`
**Shadow style:** Hard, defined, architectural — `shadow-2xl shadow-red-900/40`
**Border treatment:** `border border-red-700/40` — contained authority, not glowing
**Atmosphere:** Throne room, stone fortress, commanding presence

```tailwind
/* Emperor card shadow */
shadow-2xl shadow-red-950/60

/* Emperor active border */
border-l-4 border-red-600

/* Emperor glow on primary CTA hover */
hover:shadow-xl hover:shadow-red-700/50
```

---

### 1.3 Synthesis Rationale

**How Ruler structure + Emperor color create meaning:**

The Ruler archetype demands **hierarchical clarity and absolute control** — every element must
signal rank. The Emperor card provides **imperial red** (the color of sovereign power in both
Roman and East Asian imperial traditions) layered over **obsidian black** (absolute authority,
no compromise). Together they create a war room aesthetic where:

- Red `#dc2626` replaces cyan-400 as the primary active accent — but red here is not danger.
  In the Emperor's palace, red is **power and presence**. Active elements glow imperial red.
- Gold `#eab308` replaces violet-400 for delegation/handoff — gold chains of command.
  A handoff is not a purple delegation; it is a golden order passing through the ranks.
- Stone `zinc-900` replaces slate-900 for surfaces — colder, harder, more fortress-like.
- The sidebar becomes the throne room wall: dark, permanent, immovable.

**The CORTHEX application:** An enterprise admin managing 50+ AI agents across a conglomerate
will feel the weight of their authority in every interaction. Tier 1 commanders glow red on the
NEXUS canvas. Gold delegation chains trace the order of battle. The Hub is not a chat interface
— it is a command terminal in obsidian and fire.

---

### 1.4 Complete Token Overrides

All tokens layer on top of base `design-tokens.md`. Only listed tokens change; everything else
inherits from base.

```css
/* ══════════════════════════════════════════════════
   THEME 1: IMPERIAL COMMAND — Ruler + Emperor
   Override file: themes/imperial-command.css
   ══════════════════════════════════════════════════ */

:root[data-theme="imperial-command"] {

  /* ── Surfaces ────────────────────────────────── */
  --surface-page:        #09090b;   /* zinc-950 → colder, harder than slate-950 */
  --surface-card:        #18181b;   /* zinc-900 → fortress stone */
  --surface-elevated:    #27272a;   /* zinc-800 → iron elevated surface */
  --surface-input:       #18181b;   /* zinc-900 → iron input */
  --surface-overlay:     rgba(9, 9, 11, 0.85);  /* zinc-950/85 → heavier modal */
  --surface-nexus:       #0a0a0b;   /* near-black NEXUS canvas */

  /* ── Borders ─────────────────────────────────── */
  --border-default:      #3f3f46;   /* zinc-700 → cooler structural divider */
  --border-subtle:       rgba(63, 63, 70, 0.50); /* zinc-700/50 */
  --border-active:       #dc2626;   /* red-600 → imperial active */
  --border-focus:        #dc2626;   /* red-600 → focus ring: power, not accessibility color */

  /* ── Primary Accent (Imperial Red) ────────────── */
  --color-primary-light: #f87171;   /* red-400 → hover brightening */
  --color-primary-base:  #dc2626;   /* red-600 → imperial command */
  --color-primary-mid:   #b91c1c;   /* red-700 → secondary use */
  --color-primary-deep:  #991b1b;   /* red-800 → disabled / background */
  --color-primary-dark:  #7f1d1d;   /* red-900 → deepest authority */
  --color-primary-tint-10: rgba(220, 38, 38, 0.10);
  --color-primary-tint-15: rgba(220, 38, 38, 0.15);
  --color-primary-tint-20: rgba(220, 38, 38, 0.20);

  /* ── Delegation/Handoff (Royal Gold instead of Violet) ── */
  --color-handoff-light: #fef08a;   /* yellow-200 */
  --color-handoff-base:  #eab308;   /* yellow-500 → gold chains of command */
  --color-handoff-deep:  #ca8a04;   /* yellow-600 */

  /* ── Text ────────────────────────────────────── */
  --text-primary:        #fafaf9;   /* stone-50 → warmer white, parchment quality */
  --text-secondary:      #a1a1aa;   /* zinc-400 → iron gray secondary */
  --text-disabled:       #52525b;   /* zinc-600 → iron disabled */
  --text-inverse:        #fafaf9;   /* stone-50 → text on red CTA (not slate-950) */
  --text-link:           #dc2626;   /* red-600 → imperial links */

  /* ── Typography Overrides ────────────────────── */
  --font-display:  'Playfair Display', 'Georgia', serif;  /* prestigious serif for H1/H2 */
  --font-ui:       'Inter', 'Helvetica Neue', sans-serif; /* unchanged for UI labels */
  --font-heading-weight: 700;
  --font-heading-tracking: -0.02em;  /* tight — authority doesn't sprawl */

  /* ── Border Radius ───────────────────────────── */
  --radius-card:   8px;    /* 0.5rem — sharper corners, more authoritative than base 16px */
  --radius-button: 4px;    /* 0.25rem — near-square: commands, not invitations */
  --radius-badge:  4px;
  --radius-input:  6px;

  /* ── Shadows ─────────────────────────────────── */
  --shadow-card:    0 4px 24px rgba(220, 38, 38, 0.08), 0 1px 4px rgba(0,0,0,0.6);
  --shadow-active:  0 0 0 2px #dc2626, 0 4px 16px rgba(220, 38, 38, 0.30);
  --shadow-modal:   0 25px 80px rgba(0, 0, 0, 0.80);
  --shadow-nexus-node: 0 0 12px rgba(220, 38, 38, 0.20);
  --shadow-nexus-node-active: 0 0 24px rgba(220, 38, 38, 0.60);

  /* ── Motion ──────────────────────────────────── */
  --motion-fast:    150ms ease-in-out;  /* faster than base (200ms) — decisive */
  --motion-base:    200ms ease-in-out;
  --motion-slow:    300ms ease-in-out;
  --motion-spring:  none;               /* no spring — power moves linearly */
}
```

---

### 1.5 Sample Dashboard Snippet

```tsx
/* ─────────────────────────────────────────────────
   IMPERIAL COMMAND — Dashboard Components
   All classes are Tailwind, data-theme="imperial-command"
   ───────────────────────────────────────────────── */

/* SIDEBAR */
<aside className="
  w-[280px] flex-shrink-0 flex flex-col
  bg-zinc-950 border-r border-zinc-700/50
  h-screen
">
  {/* Logo / Brand */}
  <div className="px-6 py-5 border-b border-zinc-700/50">
    <span className="text-lg font-bold tracking-tight text-stone-50 font-serif">
      CORTHEX
    </span>
    <span className="ml-2 text-[11px] text-red-600 font-medium uppercase tracking-widest">
      Imperial
    </span>
  </div>

  {/* Active nav item */}
  <a className="
    flex items-center gap-3 px-6 py-3
    bg-red-600/10 border-l-4 border-red-600
    text-stone-50 font-medium text-[13px]
  ">
    <TerminalIcon className="w-5 h-5 text-red-600" />
    허브
  </a>

  {/* Inactive nav item */}
  <a className="
    flex items-center gap-3 px-6 py-3
    text-zinc-400 hover:text-stone-50 hover:bg-zinc-800/50
    text-[13px] font-medium transition-colors duration-150
    border-l-4 border-transparent
  ">
    <NetworkIcon className="w-5 h-5" />
    넥서스
  </a>
</aside>

/* AGENT CARD */
<div className="
  rounded-[8px] p-6
  bg-gradient-to-br from-red-600/10 via-zinc-900/80 to-zinc-900/80
  border border-zinc-700/60
  hover:border-red-700/50 hover:shadow-xl hover:shadow-red-950/40
  transition-all duration-200
">
  {/* Header row */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-stone-50 font-serif">
        전략분석처장
      </span>
      <span className="
        text-[11px] font-medium uppercase tracking-wide
        bg-red-600/15 text-red-400 border border-red-700/40
        px-2 py-0.5 rounded-[4px]
      ">
        TIER 1
      </span>
    </div>
    {/* Status dot */}
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-xs text-zinc-400 font-mono tabular-nums">47s</span>
    </div>
  </div>
  <p className="text-sm text-zinc-400 leading-relaxed">
    글로벌 시장 동향 분석 및 전략 보고서 작성 전문
  </p>
</div>

/* NEXUS CANVAS NODE (Active Agent) */
<div className="
  w-16 h-16 rounded-[8px]
  bg-zinc-900 border-2 border-red-600
  shadow-[0_0_24px_rgba(220,38,38,0.60)]
  flex items-center justify-center
  relative
">
  <div className="w-8 h-8 text-red-400" /> {/* agent icon */}
  {/* Tier crown */}
  <span className="
    absolute -top-2 -right-2
    text-[10px] font-bold text-yellow-500
    bg-zinc-900 border border-yellow-600/40
    w-5 h-5 rounded-full flex items-center justify-center
  ">
    I
  </span>
</div>

/* PRIMARY BUTTON */
<button className="
  bg-red-600 hover:bg-red-500
  text-stone-50 font-semibold text-sm uppercase tracking-wide
  px-5 py-2.5 rounded-[4px]
  shadow-lg shadow-red-900/50
  hover:shadow-xl hover:shadow-red-800/60
  transition-all duration-150
  border border-red-500/20
">
  실행
</button>
```

---

### 1.6 Target User Persona

**User:** Enterprise conglomerate administrator. Oversees 3–5 subsidiary companies, each with
their own AI org structure. Has hierarchical sensibility from decades in Korean chaebol culture.
Expects software to match the gravity of their work. Will dismiss tools that feel casual.

**Emotion evoked:** Sovereign authority. Gravitas. The interface matches the weight of the decisions being made. "이 도구는 나의 권위에 걸맞다."

**Industry fit:**
- Korean conglomerates (재벌 계열사)
- Defense contractors and government procurement
- Law firms and financial advisory
- C-suite-only executive tools
- Enterprise risk management platforms

---
---

## 2. CONTEMPLATIVE DEPTHS

**Archetype:** THE SAGE · **Card:** IX THE HERMIT
**Formula:** Sage + Hermit = Deep wisdom in solitary indigo and lantern light

---

### 2.1 Archetype Personality — THE SAGE

**Core drive:** Truth, wisdom, understanding through systematic inquiry. The Sage does not
command — it illuminates. Every UI decision reinforces clarity of thought and depth of knowledge.

**UI structure rules (from Jungian skill):**
- **Layout:** Information hierarchy is the primary design decision. Content taxonomy is explicit.
  The hierarchy reads top-to-bottom like a well-organized research paper.
- **Information architecture:** Reading-focused. Long text renders beautifully. Tables over cards
  for list views (the Sage counts and compares). Citation and reference systems visible.
- **Categorization:** Every agent, department, and session has a clear category and tag.
  Knowledge graphs show connections. The Library (라이브러리) is the hero feature.
- **Knowledge connection metaphors:** Agent Soul summaries visible in hover tooltips. Library
  entries show semantic distance (similarity scores). The org chart is also a knowledge map.
- **Spacing:** Academic spacing ratios — `leading-relaxed` (1.625) everywhere, not just reports.
  Comfortable margins. Breathing room for complex information.
- **Typography:** Humanist serif for headings (scholarly authority). Geometric sans for UI labels.
  The visual difference between "this is knowledge" and "this is navigation" is typography.

**Motion behavior:**
- Transitions: `duration-300 ease-out` — measured, deliberate, not rushed
- No sudden movements — the Sage considers before acting
- Content reveals: fade in with `opacity-0 → opacity-100 duration-400` — ideas emerge gently
- Hover: subtle `brightness-110` — illumination, not transformation
- Scroll: smooth, continuous — the search for knowledge continues

---

### 2.2 Card Color Palette — IX THE HERMIT

**Energy:** Solitude, introspection, inner guidance. A lone lantern on a mountain peak.
The journey inward illuminates what external noise conceals.

| Role | Name | Hex | Tailwind | RGB |
|------|------|-----|----------|-----|
| **Primary** | Deep Indigo | `#4338ca` | `indigo-700` | 67, 56, 202 |
| **Primary Light** | Indigo Mid | `#6366f1` | `indigo-500` | 99, 102, 241 |
| **Secondary** | Twilight Purple | `#6d28d9` | `violet-700` | 109, 40, 217 |
| **Accent** | Lantern Gray | `#d1d5db` | `gray-300` | 209, 213, 219 |
| **Accent Warm** | Parchment | `#fef3c7` | `amber-100` | 254, 243, 199 |
| **Dark** | Cave Black | `#111827` | `gray-900` | 17, 24, 39 |
| **Deep** | Abyss | `#030712` | `gray-950` | 3, 7, 18 |

**Gradient formula:** `from-indigo-950 via-gray-900 to-purple-950`
**Card gradient:** `from-indigo-700/12 via-gray-900/80 to-gray-900/80`
**Shadow style:** Deep, focused, single light source — `shadow-2xl shadow-indigo-950/50`
**Border treatment:** `border border-indigo-700/30` — quiet structural delineation
**Atmosphere:** Mountain peak, lone lantern, inner sanctuary, library at midnight

```tailwind
/* Hermit card shadow — single source, directional */
shadow-[0_4px_32px_rgba(67,56,202,0.12),0_1px_4px_rgba(0,0,0,0.70)]

/* Hermit glow on knowledge items — lantern light */
hover:shadow-[0_0_24px_rgba(99,102,241,0.20)]

/* Hermit focus ring */
ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-gray-950
```

---

### 2.3 Synthesis Rationale

**How Sage structure + Hermit color create meaning:**

The Sage archetype demands **knowledge hierarchy and reading comfort** — the UI must support
deep, sustained engagement with complex information. The Hermit card provides **deep indigo**
(the color of contemplative inner knowing, associated with the third eye and introspection)
over **cave black** backgrounds (the solitary depths where understanding is born). Together:

- Indigo `#4338ca` replaces cyan-400 as the primary active accent — indigo signals not
  "action" but "depth" and "insight." Clicking an indigo element feels like going deeper.
- Lantern Gray `#d1d5db` replaces amber for warnings — in this world, a warning is a
  lantern raised, not an alarm. Gentle, directional illumination.
- The sidebar is a library stacks — organized, vertical, navigated with purpose.
- Typography shifts to Playfair Display for H1/H2 — the voice of deep scholarship.
- Generous spacing honors complexity; never crammed, always considered.

**The CORTHEX application:** A knowledge management architect configuring AI agents for
research departments will feel the depth of their information architecture in every screen.
The Library feature becomes the primary navigation destination. Agent Soul previews appear
like research abstracts. The Hub output formats like a scholarly report. NEXUS looks like
a knowledge graph, not an org chart.

---

### 2.4 Complete Token Overrides

```css
/* ══════════════════════════════════════════════════
   THEME 2: CONTEMPLATIVE DEPTHS — Sage + Hermit
   Override file: themes/contemplative-depths.css
   ══════════════════════════════════════════════════ */

:root[data-theme="contemplative-depths"] {

  /* ── Surfaces ────────────────────────────────── */
  --surface-page:        #030712;   /* gray-950 → deeper than slate-950 */
  --surface-card:        #111827;   /* gray-900 → cave stone */
  --surface-elevated:    #1f2937;   /* gray-800 → lantern-lit elevated */
  --surface-input:       #111827;   /* gray-900 */
  --surface-overlay:     rgba(3, 7, 18, 0.88);
  --surface-nexus:       #020617;   /* absolute dark for knowledge graph */

  /* ── Borders ─────────────────────────────────── */
  --border-default:      #374151;   /* gray-700 → quiet delineation */
  --border-subtle:       rgba(55, 65, 81, 0.40);
  --border-active:       #4338ca;   /* indigo-700 → active = depth */
  --border-focus:        #6366f1;   /* indigo-500 → focus: glow of understanding */

  /* ── Primary Accent (Deep Indigo) ─────────────── */
  --color-primary-light: #a5b4fc;   /* indigo-300 */
  --color-primary-base:  #6366f1;   /* indigo-500 → active nav, primary CTA */
  --color-primary-mid:   #4f46e5;   /* indigo-600 */
  --color-primary-deep:  #4338ca;   /* indigo-700 → deep accent */
  --color-primary-dark:  #3730a3;   /* indigo-800 */
  --color-primary-tint-10: rgba(99, 102, 241, 0.10);
  --color-primary-tint-15: rgba(99, 102, 241, 0.15);
  --color-primary-tint-20: rgba(99, 102, 241, 0.20);

  /* ── Delegation/Handoff (Twilight Purple) ────── */
  --color-handoff-light: #c4b5fd;   /* violet-300 */
  --color-handoff-base:  #8b5cf6;   /* violet-500 → slightly different from base violet-400 */
  --color-handoff-deep:  #7c3aed;   /* violet-600 */

  /* ── Text ────────────────────────────────────── */
  --text-primary:        #f9fafb;   /* gray-50 → clean white */
  --text-secondary:      #9ca3af;   /* gray-400 → scholarly secondary */
  --text-disabled:       #4b5563;   /* gray-600 */
  --text-inverse:        #f9fafb;   /* on indigo primary button */
  --text-link:           #818cf8;   /* indigo-400 → lantern glow on links */

  /* ── Typography Overrides ────────────────────── */
  --font-display:  'Playfair Display', 'Merriweather', Georgia, serif;
  --font-ui:       'Inter', 'Helvetica Neue', sans-serif;
  --font-heading-weight: 600;        /* scholarly, not aggressive */
  --font-heading-tracking: 0em;      /* neutral tracking — academic, not stylistic */
  --line-height-body: 1.75;          /* more generous than base 1.625 — reading comfort */

  /* ── Border Radius ───────────────────────────── */
  --radius-card:   12px;   /* softer than imperial — contemplation, not command */
  --radius-button: 8px;    /* approachable but not round */
  --radius-badge:  6px;
  --radius-input:  8px;

  /* ── Shadows ─────────────────────────────────── */
  --shadow-card:    0 4px 32px rgba(67, 56, 202, 0.08), 0 1px 4px rgba(0,0,0,0.70);
  --shadow-active:  0 0 0 2px #6366f1, 0 4px 20px rgba(99, 102, 241, 0.25);
  --shadow-modal:   0 32px 80px rgba(3, 7, 18, 0.90);
  --shadow-nexus-node: 0 0 16px rgba(67, 56, 202, 0.15);
  --shadow-nexus-node-active: 0 0 32px rgba(99, 102, 241, 0.50);

  /* ── Motion ──────────────────────────────────── */
  --motion-fast:    200ms ease-out;
  --motion-base:    350ms ease-out;  /* slower — the Sage is deliberate */
  --motion-slow:    500ms ease-out;
  --motion-enter:   400ms cubic-bezier(0.16, 1, 0.3, 1); /* knowledge emerges gently */
}
```

---

### 2.5 Sample Dashboard Snippet

```tsx
/* ─────────────────────────────────────────────────
   CONTEMPLATIVE DEPTHS — Dashboard Components
   ───────────────────────────────────────────────── */

/* SIDEBAR */
<aside className="
  w-[280px] flex-shrink-0 flex flex-col
  bg-gray-950 border-r border-gray-700/40
  h-screen
">
  <div className="px-6 py-5 border-b border-gray-700/40">
    <span className="text-lg font-semibold tracking-tight text-gray-50 font-serif">
      CORTHEX
    </span>
    <span className="ml-2 text-[11px] text-indigo-400 font-medium uppercase tracking-widest">
      Depths
    </span>
  </div>

  {/* Active nav item */}
  <a className="
    flex items-center gap-3 px-6 py-3
    bg-indigo-500/10 border-l-4 border-indigo-500
    text-gray-50 font-medium text-[13px]
  ">
    <BookIcon className="w-5 h-5 text-indigo-400" />
    라이브러리
  </a>

  {/* Inactive */}
  <a className="
    flex items-center gap-3 px-6 py-3
    text-gray-400 hover:text-gray-100 hover:bg-gray-800/40
    text-[13px] font-medium transition-all duration-300
    border-l-4 border-transparent
  ">
    <TerminalIcon className="w-5 h-5" />
    허브
  </a>
</aside>

/* AGENT CARD */
<article className="
  rounded-xl p-6
  bg-gradient-to-br from-indigo-700/10 via-gray-900/80 to-gray-900/80
  border border-gray-700/50
  hover:border-indigo-700/40
  hover:shadow-[0_4px_32px_rgba(67,56,202,0.12)]
  transition-all duration-350
">
  <header className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-sm font-semibold text-gray-50 font-serif mb-1">
        법률연구 전문가
      </h3>
      <span className="
        text-[11px] font-medium uppercase tracking-wide
        bg-indigo-500/10 text-indigo-300 border border-indigo-700/30
        px-2 py-0.5 rounded-md
      ">
        TIER 2
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span className="text-xs text-gray-400">완료</span>
    </div>
  </header>

  {/* Soul preview — scholarly abstract */}
  <blockquote className="
    text-sm text-gray-400 leading-relaxed
    border-l-2 border-indigo-700/40 pl-3
    italic
  ">
    "판례 분석 및 법률 리서치 전문. 상법, 노동법, 지식재산권 영역 특화..."
  </blockquote>
</article>

/* NEXUS CANVAS NODE */
<div className="
  w-14 h-14 rounded-xl
  bg-gray-900 border border-indigo-700/40
  shadow-[0_0_16px_rgba(67,56,202,0.20)]
  flex items-center justify-center
  relative
">
  <div className="w-7 h-7 text-indigo-400" />
  {/* Knowledge connection indicator */}
  <div className="
    absolute -bottom-1 -right-1
    w-4 h-4 rounded-full
    bg-indigo-500 text-[8px] text-white
    flex items-center justify-center font-bold
  ">
    7
  </div>
</div>

/* PRIMARY BUTTON */
<button className="
  bg-indigo-600 hover:bg-indigo-500
  text-gray-50 font-medium text-sm
  px-5 py-2.5 rounded-lg
  shadow-md shadow-indigo-950/60
  hover:shadow-lg hover:shadow-indigo-900/50
  transition-all duration-350
">
  저장
</button>
```

---

### 2.6 Target User Persona

**User:** Chief Knowledge Officer or Research Director at a knowledge-intensive firm: legal,
consulting, academic institution, think tank, or investment research house. Manages a team
of AI agents that process documents, synthesize research, and generate structured analyses.
Values thoroughness over speed. Trusts depth over flash.

**Emotion evoked:** Quiet mastery. The satisfaction of organized knowledge and illuminated
understanding. "지식이 정돈된 공간에서 일하는 느낌." Calm authority through expertise.

**Industry fit:**
- Legal research firms and law firms (문서 분석, 판례 검색)
- Management consulting (보고서 생성, 시장 분석)
- Academic institutions and think tanks
- Investment research and financial analysis
- Pharmaceutical research and regulatory affairs

---
---

## 3. LUNAR ALCHEMY

**Archetype:** THE MAGICIAN · **Card:** XVIII THE MOON
**Formula:** Magician + Moon = Transformative illusion in silver and dream-blue depths

---

### 3.1 Archetype Personality — THE MAGICIAN

**Core drive:** Transformation, knowledge as power, the ability to manifest will into reality.
The Magician does not follow rules — it bends them through understanding. Every UI interaction
is an act of transformation, not merely navigation.

**UI structure rules (from Jungian skill):**
- **Layout:** Centered compositions with radial symmetry. Layered depth. The canvas reveals
  itself progressively — not everything is visible at once (sacred geometry of disclosure).
- **Progressive disclosure:** "Behind the curtain" reveals. Agent capabilities unfold on hover.
  Soul editor reveals system prompt layers in sequence. Transformation metaphors: before/after.
- **Sacred geometry:** Component sizes follow harmonic proportions. Sidebar width: the
  golden ratio of content width. Cards use `aspect-[1.618/1]` (golden rectangle).
- **Layered depth:** Multiple translucency layers. Backdrop blur. Glass panels that reveal
  what's beneath. Information that appears when you look closely.
- **Transformation metaphors:** Active states aren't just highlights — elements *transform*.
  A loading state doesn't spin — it morphs. A completed task doesn't just go green — it
  *resolves* with a ripple.
- **Motion:** Smooth morphing, not jumps. Elements ease in and out of existence with
  `cubic-bezier(0.34, 1.56, 0.64, 1)` spring physics. Magical reveals.

**Motion behavior:**
- Transitions: `duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)` — smooth morphing, spring
- Hover: elements shift in 3D perspective (`perspective-1000 hover:rotate-y-3`)
- Reveals: content appears from opacity-0 scale-95 → opacity-100 scale-100
- Active: ripple effect `after:animate-ping` on primary button click
- NEXUS: edges animate with gradient flow along the delegation path

---

### 3.2 Card Color Palette — XVIII THE MOON

**Energy:** Illusion, intuition, the unconscious, liminal space between knowing and not-knowing.
The Moon casts light but also shadow — nothing is as it seems.

| Role | Name | Hex | Tailwind | RGB |
|------|------|-----|----------|-----|
| **Primary** | Moonlight Silver | `#cbd5e1` | `slate-300` | 203, 213, 225 |
| **Primary Deep** | Lunar Glow | `#94a3b8` | `slate-400` | 148, 163, 184 |
| **Secondary** | Mystery Blue | `#1e40af` | `blue-800` | 30, 64, 175 |
| **Secondary Light** | Midnight Indigo | `#3730a3` | `indigo-800` | 55, 48, 163 |
| **Accent** | Dream Purple | `#c084fc` | `purple-400` | 192, 132, 252 |
| **Accent Deep** | Amethyst | `#a855f7` | `purple-500` | 168, 85, 247 |
| **Dark** | Shadow Navy | `#0f172a` | `slate-900` | 15, 23, 42 |
| **Deep** | Void | `#020617` | `slate-950` | 2, 6, 23 |

**Gradient formula:** `from-slate-950 via-blue-950 to-purple-950`
**Card gradient:** `from-purple-400/10 via-slate-900/70 to-blue-950/70`
**Shadow style:** Soft, mysterious, shape-shifting — `shadow-2xl shadow-purple-900/30`
**Border treatment:** `border border-purple-400/20` — barely visible, like moonlight on water
**Atmosphere:** Moonlit path, shifting shadows, dreamscape, liminal transformation

```tailwind
/* Moon backdrop blur container */
backdrop-blur-xl bg-slate-900/60 border border-purple-400/20

/* Dream glow on active elements */
shadow-[0_0_20px_rgba(192,132,252,0.30),0_0_60px_rgba(192,132,252,0.10)]

/* Silver text shimmer — silver primary on dark */
text-slate-300 hover:text-white transition-colors duration-500
```

---

### 3.3 Synthesis Rationale

**How Magician structure + Moon color create meaning:**

The Magician archetype demands **layered revelation and transformative interaction** — the
UI should feel like discovering what was always there, hidden. The Moon card provides
**silver moonlight** (ambiguous, shifting, revealing hidden truths) over **dream purple**
(the unconscious, AI intuition, the space between input and output). Together:

- Silver `#cbd5e1` replaces cyan-400 as the primary text accent — silver is not actionable
  orange but *illuminating* silver. It catches the eye without demanding it.
- Dream Purple `#c084fc` replaces violet for handoff — delegation as dream logic, agents
  passing tasks like thoughts traveling through the unconscious mind.
- Glass morphism (backdrop-blur) is intentional here — unlike base theme where it would feel
  dated, the Moon's illusory atmosphere makes glass *meaningful*: seeing through surfaces.
- The NEXUS canvas becomes a star map — agents as moons in orbit, their delegation edges
  as tidal forces.
- Progressive disclosure unlocks meaning: the Magician's "behind the curtain" philosophy
  means agent details unfold on hover, Soul reveals in layers.

**The CORTHEX application:** An AI systems architect who thinks of their AI workforce as an
intelligent organism will feel the systemic intelligence in every interaction. Agents feel alive
— pulsing with lunar rhythm. The delegation network feels like a neural cortex. The hub output
feels like receiving transmissions from a collective unconscious.

---

### 3.4 Complete Token Overrides

```css
/* ══════════════════════════════════════════════════
   THEME 3: LUNAR ALCHEMY — Magician + Moon
   Override file: themes/lunar-alchemy.css
   ══════════════════════════════════════════════════ */

:root[data-theme="lunar-alchemy"] {

  /* ── Surfaces ────────────────────────────────── */
  --surface-page:        #020617;   /* slate-950 → same as base — the void */
  --surface-card:        rgba(15, 23, 42, 0.70);   /* slate-900/70 → glass panel */
  --surface-elevated:    rgba(30, 41, 59, 0.60);   /* slate-800/60 → elevated glass */
  --surface-input:       rgba(15, 23, 42, 0.80);
  --surface-overlay:     rgba(2, 6, 23, 0.75);
  --surface-nexus:       #010409;   /* deeper void for dream-space canvas */

  /* ── Borders ─────────────────────────────────── */
  --border-default:      rgba(100, 116, 139, 0.30); /* slate-500/30 — barely visible */
  --border-subtle:       rgba(100, 116, 139, 0.15);
  --border-active:       #c084fc;   /* purple-400 → dream active */
  --border-focus:        rgba(192, 132, 252, 0.60); /* purple-400/60 — soft focus ring */

  /* ── Primary Accent (Moonlight Silver) ─────────── */
  --color-primary-light: #e2e8f0;   /* slate-200 — brightest silver */
  --color-primary-base:  #cbd5e1;   /* slate-300 — moonlight silver CTA text */
  --color-primary-mid:   #94a3b8;   /* slate-400 — secondary silver */
  --color-primary-deep:  #64748b;   /* slate-500 — deep silver (use carefully) */
  --color-primary-dark:  #475569;   /* slate-600 */
  /* Note: primary button uses dream-purple bg with silver text */
  --color-primary-button-bg:   #7c3aed;  /* violet-600 */
  --color-primary-button-text: #e2e8f0;  /* slate-200 — silver on purple */
  --color-primary-tint-10: rgba(192, 132, 252, 0.10);
  --color-primary-tint-15: rgba(192, 132, 252, 0.15);
  --color-primary-tint-20: rgba(192, 132, 252, 0.20);

  /* ── Delegation/Handoff (Dream Purple) ─────────── */
  --color-handoff-light: #e9d5ff;   /* purple-200 */
  --color-handoff-base:  #c084fc;   /* purple-400 → dream delegation */
  --color-handoff-deep:  #a855f7;   /* purple-500 */

  /* ── Text ────────────────────────────────────── */
  --text-primary:        #f1f5f9;   /* slate-100 — moonlit white */
  --text-secondary:      #94a3b8;   /* slate-400 — silver secondary */
  --text-disabled:       #475569;   /* slate-600 */
  --text-inverse:        #f1f5f9;   /* on purple CTA */
  --text-link:           #c084fc;   /* purple-400 — dream links */

  /* ── Typography Overrides ────────────────────── */
  --font-display:  'Cormorant Garamond', 'Garamond', Georgia, serif; /* mystical, elegant */
  --font-ui:       'Inter', 'Helvetica Neue', sans-serif;
  --font-heading-weight: 300;     /* light display — moonlight is thin and sharp */
  --font-heading-tracking: 0.04em; /* slightly wider — mystery breathes */
  --line-height-body: 1.625;

  /* ── Border Radius ───────────────────────────── */
  --radius-card:   16px;   /* same as base — smooth like water surface */
  --radius-button: 12px;   /* slightly rounded — the Magician is not square */
  --radius-badge:  999px;  /* pill badges — fluid, not angular */
  --radius-input:  12px;

  /* ── Shadows ─────────────────────────────────── */
  --shadow-card:    0 8px 32px rgba(15, 23, 42, 0.60), 0 0 0 1px rgba(192,132,252,0.08);
  --shadow-active:  0 0 0 1px rgba(192,132,252,0.40), 0 0 24px rgba(192,132,252,0.20);
  --shadow-modal:   0 32px 80px rgba(2, 6, 23, 0.90), 0 0 80px rgba(124, 58, 237, 0.10);
  --shadow-nexus-node: 0 0 20px rgba(192, 132, 252, 0.15);
  --shadow-nexus-node-active: 0 0 40px rgba(192, 132, 252, 0.50), 0 0 80px rgba(192, 132, 252, 0.15);

  /* ── Backdrop Blur ───────────────────────────── */
  --backdrop-card:   blur(12px);  /* glass panel effect */
  --backdrop-modal:  blur(20px);

  /* ── Motion ──────────────────────────────────── */
  --motion-fast:    300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion-base:    500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --motion-slow:    700ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-reveal:  600ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### 3.5 Sample Dashboard Snippet

```tsx
/* ─────────────────────────────────────────────────
   LUNAR ALCHEMY — Dashboard Components
   ───────────────────────────────────────────────── */

/* SIDEBAR */
<aside className="
  w-[280px] flex-shrink-0 flex flex-col
  bg-slate-950/90 backdrop-blur-xl
  border-r border-purple-400/10
  h-screen
">
  <div className="px-6 py-5 border-b border-purple-400/10">
    <span className="
      text-lg font-light tracking-widest text-slate-200
      font-['Cormorant_Garamond']
    ">
      CORTHEX
    </span>
  </div>

  {/* Active nav — dream glow */}
  <a className="
    flex items-center gap-3 px-6 py-3
    bg-purple-400/10 border-l-2 border-purple-400
    text-slate-200 font-medium text-[13px]
    shadow-[inset_0_0_20px_rgba(192,132,252,0.05)]
  ">
    <NetworkIcon className="w-5 h-5 text-purple-400" />
    넥서스
  </a>

  {/* Inactive */}
  <a className="
    flex items-center gap-3 px-6 py-3
    text-slate-400 hover:text-slate-200
    hover:bg-purple-400/5
    text-[13px] font-medium transition-all duration-500
    border-l-2 border-transparent
  ">
    <TerminalIcon className="w-5 h-5" />
    허브
  </a>
</aside>

/* AGENT CARD — glass morphism */
<div className="
  rounded-2xl p-6
  bg-gradient-to-br from-purple-400/10 via-slate-900/70 to-blue-950/70
  backdrop-blur-xl
  border border-purple-400/20
  hover:border-purple-400/40
  hover:shadow-[0_0_32px_rgba(192,132,252,0.15)]
  transition-all duration-500
  relative overflow-hidden
">
  {/* Subtle shimmer overlay */}
  <div className="
    absolute inset-0 rounded-2xl
    bg-gradient-to-br from-white/[0.03] to-transparent
    pointer-events-none
  " />

  <div className="flex items-center justify-between mb-3 relative">
    <span className="text-sm font-medium text-slate-200">AI 전략 분석가</span>
    <div className="flex items-center gap-1.5">
      <span className="
        w-2 h-2 rounded-full bg-purple-400 animate-pulse
        shadow-[0_0_6px_rgba(192,132,252,0.80)]
      " />
      <span className="text-xs text-slate-400 font-mono">위임중</span>
    </div>
  </div>

  <span className="
    text-[11px] font-medium uppercase tracking-wide
    bg-purple-400/10 text-purple-300 border border-purple-400/20
    px-2 py-0.5 rounded-full
  ">
    TIER 1
  </span>
</div>

/* NEXUS CANVAS NODE — lunar orbit */
<div className="
  w-14 h-14 rounded-full
  bg-slate-900/80 backdrop-blur-lg
  border border-purple-400/30
  shadow-[0_0_24px_rgba(192,132,252,0.30)]
  flex items-center justify-center
  relative
">
  <div className="w-7 h-7 text-purple-300" />
  {/* Orbital ring for active agent */}
  <div className="
    absolute inset-[-6px] rounded-full
    border border-purple-400/20
    animate-[spin_8s_linear_infinite]
  " />
</div>

/* PRIMARY BUTTON */
<button className="
  relative
  bg-gradient-to-r from-violet-700 to-purple-600
  hover:from-purple-600 hover:to-violet-700
  text-slate-200 font-medium text-sm
  px-5 py-2.5 rounded-xl
  shadow-xl shadow-purple-900/50
  hover:shadow-[0_8px_24px_rgba(124,58,237,0.40)]
  transition-all duration-500
  overflow-hidden
  after:absolute after:inset-0
  after:bg-gradient-to-r after:from-white/[0.08] after:to-transparent
  after:rounded-xl
">
  실행
</button>
```

---

### 3.6 Target User Persona

**User:** AI systems architect, machine learning engineer turned product builder, or technical
co-founder obsessed with emergent AI behavior. Thinks of AI agents as entities with personality,
not just tools. Builds organizations to explore what AI can *become*, not just what it *does*.
Aesthetic sensibility leans toward science fiction interfaces.

**Emotion evoked:** Awe at emergent complexity. The feeling of orchestrating something
intelligent and alive. "이 시스템은 단순한 도구가 아니라 의식이 있는 것 같다."

**Industry fit:**
- AI research labs and startups
- Science fiction and creative technology studios
- Biotech and pharmaceutical AI applications
- Advanced analytics and intelligence platforms
- Human-AI collaboration research

---
---

## 4. SOLAR CONQUEST

**Archetype:** THE HERO · **Card:** XIX THE SUN
**Formula:** Hero + Sun = Bold achievement in radiant gold and triumphant orange

---

### 4.1 Archetype Personality — THE HERO

**Core drive:** Mastery, courage, achievement. The Hero conquers obstacles through decisive
action. Every UI interaction is a small victory. The interface must celebrate progress and
make the user feel capable.

**UI structure rules (from Jungian skill):**
- **Layout:** Asymmetric grids with diagonal energy. Progress is always visible.
  Achievement metrics dominate the dashboard. No hiding wins.
- **Visual language:** Bold, angular, high contrast. Sharp geometric shapes.
  Strong shadows that suggest depth and dimension.
- **Action-oriented affordances:** CTAs are impossible to miss. Verb-first labels everywhere.
  Every dead end has an escape hatch labeled with an active verb.
- **Achievement displays:** Completion rates, task counts, delegation success metrics.
  The Hero needs to see their score. Progress bars fill with satisfying animation.
- **Competitive context:** Leaderboard-style agent rankings. Tier 1 agents displayed with
  visual prominence. Fast agents earn visual distinction.
- **Spacing:** Tight, energetic, purposeful. Dense with information but never cramped.
  Every pixel earns its place.

**Motion behavior:**
- Transitions: `duration-150 ease-out` — fast, snappy, decisive
- CTAs: `transform hover:scale-105 active:scale-[0.98]` — kinetic response
- Progress: Fills animate left-to-right in `duration-300 ease-out`
- Achievement unlocks: `animate-bounce` once, then settle — victory lap
- Hover: Bold shadow expansion — power radiates outward

---

### 4.2 Card Color Palette — XIX THE SUN

**Energy:** Joy, success, vitality. Blazing sun at high noon. Pure achievement, no shadows.

| Role | Name | Hex | Tailwind | RGB |
|------|------|-----|----------|-----|
| **Primary** | Solar Gold | `#fbbf24` | `amber-400` | 251, 191, 36 |
| **Primary Bright** | Midday Sun | `#fcd34d` | `amber-300` | 252, 211, 77 |
| **Secondary** | Sunshine Orange | `#fb923c` | `orange-400` | 251, 146, 60 |
| **Secondary Deep** | Conquest Bronze | `#ea580c` | `orange-600` | 234, 88, 12 |
| **Accent** | Daylight Yellow | `#fef08a` | `yellow-200` | 254, 240, 138 |
| **Background** | Deep Amber | `#78350f` | `amber-900` | 120, 53, 15 |
| **Surface** | Solar Dark | `#1c1008` | custom | 28, 16, 8 |
| **Page** | Victory Dark | `#0a0601` | custom | 10, 6, 1 |

**Gradient formula:** `from-amber-950 via-orange-950 to-amber-950`
**Card gradient:** `from-amber-400/15 via-orange-950/80 to-amber-950/80`
**Shadow style:** Warm, glowing, radiant — `shadow-2xl shadow-amber-900/60`
**Border treatment:** `border border-amber-600/40` — warm golden frame
**Atmosphere:** Blazing sun, golden hour, victory parade, pure vitality

```tailwind
/* Solar radiance glow */
shadow-[0_0_40px_rgba(251,191,36,0.20),0_4px_16px_rgba(0,0,0,0.60)]

/* Achievement pulse — victory moment */
animate-[pulse_0.5s_ease-in-out_3]

/* Solar button shine */
hover:shadow-[0_8px_32px_rgba(251,191,36,0.50)]
```

---

### 4.3 Synthesis Rationale

**How Hero structure + Sun color create meaning:**

The Hero archetype demands **visible progress and decisive action** — the UI must make
winning visible and make the next action obvious. The Sun card provides **solar gold**
(the color of achievement, triumph, and optimistic energy) over **deep amber-dark**
backgrounds (the warm darkness that makes the sun shine brighter by contrast). Together:

- Gold `#fbbf24` replaces cyan-400 as the primary active accent — gold signals not
  "technical/digital active" but "achieved, won, superior." Active elements glow golden.
- Orange `#fb923c` replaces violet for handoff — delegation is not ethereal purple but
  kinetic orange, the color of energy transferred and momentum building.
- Typography: bold, uppercase headings. The Hero speaks loudly.
- Dashboard metrics are front and center — the Hero needs the scoreboard visible.
- Progress visualization is a first-class feature: task completion rates, agent response
  times, delegation chain speed — all displayed as achievable metrics.

**The CORTHEX application:** A startup founder who is running their entire AI workforce
at startup speed will feel the velocity in every interaction. Commands execute. Delegations
cascade. Metrics climb. The NEXUS canvas glows gold when agents succeed. The dashboard
celebrates daily output. The Hub output feels like mission reports coming in from the field.

---

### 4.4 Complete Token Overrides

```css
/* ══════════════════════════════════════════════════
   THEME 4: SOLAR CONQUEST — Hero + Sun
   Override file: themes/solar-conquest.css
   ══════════════════════════════════════════════════ */

:root[data-theme="solar-conquest"] {

  /* ── Surfaces ────────────────────────────────── */
  --surface-page:        #0a0601;   /* near-black with warm amber tint */
  --surface-card:        #1c1008;   /* warm dark — the golden darkness */
  --surface-elevated:    #2d1c0e;   /* elevated warm — bronze-dark */
  --surface-input:       #1c1008;
  --surface-overlay:     rgba(10, 6, 1, 0.85);
  --surface-nexus:       #050301;   /* victory dark canvas */

  /* ── Borders ─────────────────────────────────── */
  --border-default:      #44250a;   /* amber-brown border — forge metal */
  --border-subtle:       rgba(68, 37, 10, 0.50);
  --border-active:       #fbbf24;   /* amber-400 → solar active */
  --border-focus:        #fcd34d;   /* amber-300 → focus: sunlight */

  /* ── Primary Accent (Solar Gold) ──────────────── */
  --color-primary-light: #fef08a;   /* yellow-200 → brightest sun */
  --color-primary-base:  #fbbf24;   /* amber-400 → primary CTA / active */
  --color-primary-mid:   #f59e0b;   /* amber-500 */
  --color-primary-deep:  #d97706;   /* amber-600 */
  --color-primary-dark:  #b45309;   /* amber-700 */
  --color-primary-tint-10: rgba(251, 191, 36, 0.10);
  --color-primary-tint-15: rgba(251, 191, 36, 0.15);
  --color-primary-tint-20: rgba(251, 191, 36, 0.20);

  /* ── Delegation/Handoff (Orange Conquest) ─────── */
  --color-handoff-light: #fed7aa;   /* orange-200 */
  --color-handoff-base:  #fb923c;   /* orange-400 → kinetic handoff */
  --color-handoff-deep:  #ea580c;   /* orange-600 */

  /* ── Text ────────────────────────────────────── */
  --text-primary:        #fffbeb;   /* amber-50 → warm white */
  --text-secondary:      #d97706;   /* amber-600 → warm secondary */
  --text-disabled:       #78350f;   /* amber-900 → muted bronze */
  --text-inverse:        #0a0601;   /* solar dark on gold button */
  --text-link:           #fbbf24;   /* amber-400 → golden links */

  /* ── Typography Overrides ────────────────────── */
  --font-display:  'Inter', 'Helvetica Neue', sans-serif; /* Hero uses tight sans */
  --font-ui:       'Inter', 'Helvetica Neue', sans-serif;
  --font-heading-weight: 800;       /* extra bold — the Hero speaks loudly */
  --font-heading-tracking: -0.03em; /* very tight tracking — decisive, no air */
  --font-heading-transform: uppercase; /* all caps — commands, not requests */

  /* ── Border Radius ───────────────────────────── */
  --radius-card:   10px;  /* slightly sharp — active, angular */
  --radius-button: 6px;   /* functional square-ish */
  --radius-badge:  4px;   /* rank badge is a hard rectangle */
  --radius-input:  6px;

  /* ── Shadows ─────────────────────────────────── */
  --shadow-card:    0 4px 20px rgba(10, 6, 1, 0.70), 0 0 0 1px rgba(251,191,36,0.05);
  --shadow-active:  0 0 0 2px #fbbf24, 0 4px 20px rgba(251, 191, 36, 0.30);
  --shadow-modal:   0 25px 80px rgba(10, 6, 1, 0.90);
  --shadow-nexus-node: 0 0 12px rgba(251, 191, 36, 0.15);
  --shadow-nexus-node-active: 0 0 30px rgba(251, 191, 36, 0.70), 0 0 60px rgba(251, 191, 36, 0.20);

  /* ── Motion ──────────────────────────────────── */
  --motion-fast:    100ms ease-out;  /* fastest theme — the Hero doesn't wait */
  --motion-base:    150ms ease-out;
  --motion-slow:    250ms ease-out;
  --motion-spring:  200ms cubic-bezier(0.34, 1.56, 0.64, 1); /* kinetic bounce */
}
```

---

### 4.5 Sample Dashboard Snippet

```tsx
/* ─────────────────────────────────────────────────
   SOLAR CONQUEST — Dashboard Components
   ───────────────────────────────────────────────── */

/* SIDEBAR */
<aside className="
  w-[280px] flex-shrink-0 flex flex-col
  bg-[#0a0601] border-r border-[#44250a]/60
  h-screen
">
  <div className="px-6 py-5 border-b border-[#44250a]/60">
    <span className="
      text-lg font-black tracking-tight uppercase text-amber-50
    ">
      CORTHEX
    </span>
    <span className="ml-2 text-[11px] text-amber-500 font-bold uppercase tracking-widest">
      Conquest
    </span>
  </div>

  {/* Active nav — golden victory */}
  <a className="
    flex items-center gap-3 px-6 py-3
    bg-amber-400/10 border-l-4 border-amber-400
    text-amber-50 font-semibold text-[13px]
  ">
    <TerminalIcon className="w-5 h-5 text-amber-400" />
    허브
  </a>

  {/* Inactive */}
  <a className="
    flex items-center gap-3 px-6 py-3
    text-amber-900 hover:text-amber-200
    hover:bg-amber-400/5
    text-[13px] font-medium transition-all duration-150
    border-l-4 border-transparent uppercase tracking-wide
  ">
    <ChartIcon className="w-5 h-5" />
    대시보드
  </a>
</aside>

/* AGENT CARD — bold achievement display */
<div className="
  rounded-[10px] p-6
  bg-gradient-to-br from-amber-400/12 via-[#1c1008]/90 to-[#1c1008]/90
  border border-[#44250a]/80
  hover:border-amber-600/60
  hover:shadow-[0_8px_32px_rgba(251,191,36,0.15)]
  transition-all duration-150
">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <span className="
        text-sm font-bold uppercase tracking-tight text-amber-50
      ">
        마케팅 지휘관
      </span>
      {/* Achievement badge */}
      <span className="
        text-[11px] font-bold uppercase tracking-wide
        bg-amber-400/15 text-amber-400 border border-amber-600/40
        px-2 py-0.5 rounded-[4px]
      ">
        TIER 1
      </span>
    </div>
    {/* Live execution metric */}
    <span className="text-xs font-bold text-amber-400 font-mono tabular-nums">
      94% ↑
    </span>
  </div>

  {/* Progress bar — Hero always has a progress indicator */}
  <div className="mt-3 h-1.5 bg-amber-950/60 rounded-full overflow-hidden">
    <div
      className="h-full bg-amber-400 rounded-full transition-all duration-300"
      style={{ width: '94%' }}
    />
  </div>
  <p className="text-xs text-amber-900 mt-1.5 font-mono">23 tasks completed today</p>
</div>

/* NEXUS CANVAS NODE — blazing active agent */
<div className="
  w-16 h-16 rounded-[10px]
  bg-[#1c1008] border-2 border-amber-400
  shadow-[0_0_30px_rgba(251,191,36,0.70)]
  flex items-center justify-center
  relative
">
  <div className="w-8 h-8 text-amber-400" />
  {/* Victory indicator */}
  <div className="
    absolute -top-2 -right-2 w-5 h-5
    bg-amber-400 rounded-[4px]
    text-[9px] font-black text-[#0a0601]
    flex items-center justify-center
  ">
    #1
  </div>
</div>

/* PRIMARY BUTTON — the battle cry */
<button className="
  bg-amber-400 hover:bg-amber-300
  text-[#0a0601] font-black text-sm uppercase tracking-wide
  px-5 py-2.5 rounded-[6px]
  shadow-lg shadow-amber-900/60
  hover:shadow-xl hover:shadow-amber-400/50
  hover:scale-105 active:scale-[0.98]
  transition-all duration-150
">
  실행
</button>
```

---

### 4.6 Target User Persona

**User:** Startup founder or growth-phase executive running lean with AI leverage. Obsessed
with velocity. Measures everything. Celebrates small wins loudly. Treats their AI org like a
startup team — every agent has a job and a metric. Doesn't tolerate slow interfaces.

**Emotion evoked:** Unstoppable momentum. The satisfaction of watching the numbers climb.
"AI 팀이 나를 위해 전력으로 달리고 있다." Energized, victorious, moving at full speed.

**Industry fit:**
- Series A/B startups at growth phase
- E-commerce operations and marketing teams
- Sales and revenue operations
- Growth hacking and digital marketing agencies
- Competitive analysis and intelligence platforms

---
---

## 5. STELLAR FORGE

**Archetype:** THE CREATOR · **Card:** XVII THE STAR
**Formula:** Creator + Star = Inspired craftsmanship in celestial blue and stellar hope

---

### 5.1 Archetype Personality — THE CREATOR

**Core drive:** Innovation, imagination, self-expression. The Creator builds not because it
must but because it envisions. Every UI interaction is an act of making — creating a new agent
is not administration, it is *authorship*.

**UI structure rules (from Jungian skill):**
- **Layout:** Workspace/canvas metaphor dominates. The NEXUS canvas is the primary screen,
  not the Hub. Building the organization *is* the product.
- **Tool palette metaphor:** Sidebar as maker's toolbox. Agent types as building blocks.
  Department groupings as component libraries. Soul editor as the creative brief.
- **Flexibility:** Flexible grids that adapt to the creative work in progress. No rigid
  column constraints — the canvas expands to fill the creative vision.
- **Process visualization:** The delegation chain is not just a status display — it is a
  beautiful illustration of the created system working. Creation made visible.
- **Creative feedback:** Every action confirms that something was *made*. Creating an agent
  feels like sculpting. Connecting agents feels like composing.
- **Experimentation:** A/B test framework (SketchVibe) is front-and-center. Creation implies
  iteration. Multiple versions are first-class objects.
- **Typography:** Expressive variety is acceptable — the Creator can mix display sizes.
  But never chaotic. Expressive with underlying harmony.

**Motion behavior:**
- Transitions: `duration-300 cubic-bezier(0.16, 1, 0.3, 1)` — responsive, satisfying
- Creation actions: Elements appear with `scale-95 → scale-100` spring — things are born
- NEXUS node placement: Drop with a satisfying settle animation
- Connection drawing: The edge draws itself in real-time as you drag
- Completion: Subtle sparkle or ripple — the creator's reward

---

### 5.2 Card Color Palette — XVII THE STAR

**Energy:** Hope, inspiration, serenity. Starlit night after the storm. The promise of what
can be made. Infinite potential looking down from an infinite sky.

| Role | Name | Hex | Tailwind | RGB |
|------|------|-----|----------|-----|
| **Primary** | Starlight Blue | `#38bdf8` | `sky-400` | 56, 189, 248 |
| **Primary Light** | Stellar Glow | `#7dd3fc` | `sky-300` | 125, 211, 252 |
| **Secondary** | Night Sky | `#0c4a6e` | `sky-900` | 12, 74, 110 |
| **Secondary Deep** | Deep Space | `#082f49` | `sky-950` | 8, 47, 73 |
| **Accent** | Stellar White | `#f0f9ff` | `sky-50` | 240, 249, 255 |
| **Accent Warm** | Nebula Teal | `#2dd4bf` | `teal-400` | 45, 212, 191 |
| **Dark** | Cosmos | `#0a1628` | custom | 10, 22, 40 |
| **Deepest** | Void Blue | `#050c17` | custom | 5, 12, 23 |

**Gradient formula:** `from-sky-950 via-[#0a1628] to-sky-950`
**Card gradient:** `from-sky-400/12 via-[#0a1628]/80 to-sky-950/80`
**Shadow style:** Soft stellar halos — `shadow-2xl shadow-sky-950/60`
**Border treatment:** `border border-sky-400/25` — starlight boundary
**Atmosphere:** Starlit night, cosmic forge, infinite creative potential, constellation building

```tailwind
/* Stellar halo glow */
shadow-[0_0_32px_rgba(56,189,248,0.15),0_4px_16px_rgba(5,12,23,0.80)]

/* Active constellation node */
shadow-[0_0_24px_rgba(56,189,248,0.60),0_0_48px_rgba(56,189,248,0.20)]

/* Nebula card shimmer */
bg-gradient-to-br from-sky-400/10 via-[#0a1628]/80 to-teal-400/5
```

---

### 5.3 Synthesis Rationale

**How Creator structure + Star color create meaning:**

The Creator archetype demands **a workspace that celebrates making** — every interaction
should feel like craftsmanship, not administration. The Star card provides **starlight blue**
(the color of infinite creative possibility, of looking at a blank night sky and seeing
potential constellations) over **deep space darkness** (the canvas on which stars are placed).
Together:

- Starlight Blue `#38bdf8` replaces cyan-400 as the primary active accent — sky-400 is
  close to cyan but with a celestial quality. Creating a new agent means adding a star
  to the NEXUS constellation. The active state glows like a freshly placed star.
- Nebula Teal `#2dd4bf` replaces violet for handoff — delegation is not purple-mysterious
  but teal-cosmic: a nebula of activity, creative energy flowing between stars.
- The NEXUS canvas is the hero feature — it is literally a star field where agents are stars
  and departments are constellations. Tier 1 agents burn brightest.
- Soul editor is a creative brief — it has generous padding, a writing-friendly font size,
  and a character count that feels like a creative constraint, not a technical limit.
- The workspace metaphor extends: sidebar is the toolbox, agent catalog is the component
  library, department templates are composition presets.

**The CORTHEX application:** A creative director building an AI content studio will feel
the creative joy of constellation-building in every session. Adding an agent is naming a
new star. Connecting agents is drawing a constellation. The NEXUS canvas exports as a
beautiful visual artifact. The Hub output renders like a portfolio piece.

---

### 5.4 Complete Token Overrides

```css
/* ══════════════════════════════════════════════════
   THEME 5: STELLAR FORGE — Creator + Star
   Override file: themes/stellar-forge.css
   ══════════════════════════════════════════════════ */

:root[data-theme="stellar-forge"] {

  /* ── Surfaces ────────────────────────────────── */
  --surface-page:        #050c17;   /* void blue — the cosmic canvas */
  --surface-card:        #0a1628;   /* cosmos — card surfaces float in space */
  --surface-elevated:    #112036;   /* elevated: brighter cosmos */
  --surface-input:       #0a1628;
  --surface-overlay:     rgba(5, 12, 23, 0.85);
  --surface-nexus:       #020810;   /* deepest void — the NEXUS star field */

  /* ── Borders ─────────────────────────────────── */
  --border-default:      #1e3a5f;   /* sky-900 adjacent — cosmic structural */
  --border-subtle:       rgba(30, 58, 95, 0.40);
  --border-active:       #38bdf8;   /* sky-400 → stellar active */
  --border-focus:        #7dd3fc;   /* sky-300 → focus: starlight */

  /* ── Primary Accent (Starlight Blue) ──────────── */
  --color-primary-light: #bae6fd;   /* sky-200 */
  --color-primary-base:  #38bdf8;   /* sky-400 → primary CTA / active */
  --color-primary-mid:   #0ea5e9;   /* sky-500 */
  --color-primary-deep:  #0284c7;   /* sky-600 */
  --color-primary-dark:  #0369a1;   /* sky-700 */
  --color-primary-tint-10: rgba(56, 189, 248, 0.10);
  --color-primary-tint-15: rgba(56, 189, 248, 0.15);
  --color-primary-tint-20: rgba(56, 189, 248, 0.20);

  /* ── Delegation/Handoff (Nebula Teal) ─────────── */
  --color-handoff-light: #99f6e4;   /* teal-200 */
  --color-handoff-base:  #2dd4bf;   /* teal-400 → cosmic delegation */
  --color-handoff-deep:  #0d9488;   /* teal-600 */

  /* ── Text ────────────────────────────────────── */
  --text-primary:        #f0f9ff;   /* sky-50 — stellar white */
  --text-secondary:      #7dd3fc;   /* sky-300 — secondary starlight */
  --text-disabled:       #1e3a5f;   /* sky-900 adjacent — dim star */
  --text-inverse:        #050c17;   /* cosmos on starlight button */
  --text-link:           #38bdf8;   /* sky-400 — hyperlinks: stellar blue */

  /* ── Typography Overrides ────────────────────── */
  --font-display:  'Plus Jakarta Sans', 'DM Sans', 'Inter', sans-serif;
  --font-ui:       'Plus Jakarta Sans', 'DM Sans', 'Inter', sans-serif;
  /* Plus Jakarta Sans: modern, humanist, optimistic — the Creator's voice */
  --font-heading-weight: 700;
  --font-heading-tracking: -0.01em;
  --letter-spacing-display: -0.02em;

  /* ── Border Radius ───────────────────────────── */
  --radius-card:   20px;  /* generous curves — creation is organic */
  --radius-button: 10px;  /* rounded rectangle — approachable tool */
  --radius-badge:  999px; /* pill — constellation labels are soft */
  --radius-input:  12px;

  /* ── Shadows ─────────────────────────────────── */
  --shadow-card:    0 4px 24px rgba(5, 12, 23, 0.70), 0 0 0 1px rgba(56,189,248,0.06);
  --shadow-active:  0 0 0 2px #38bdf8, 0 0 20px rgba(56, 189, 248, 0.25);
  --shadow-modal:   0 32px 80px rgba(5, 12, 23, 0.90), 0 0 60px rgba(56, 189, 248, 0.05);
  --shadow-nexus-node: 0 0 16px rgba(56, 189, 248, 0.20);
  --shadow-nexus-node-active: 0 0 32px rgba(56, 189, 248, 0.70), 0 0 80px rgba(56, 189, 248, 0.20);
  --shadow-nexus-edge: 0 0 8px rgba(45, 212, 191, 0.40);

  /* ── Motion ──────────────────────────────────── */
  --motion-fast:    200ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-base:    300ms cubic-bezier(0.16, 1, 0.3, 1);  /* satisfying spring */
  --motion-slow:    500ms cubic-bezier(0.16, 1, 0.3, 1);
  --motion-birth:   400ms cubic-bezier(0.34, 1.56, 0.64, 1); /* node creation spring */
  --motion-connect: 600ms cubic-bezier(0.16, 1, 0.3, 1);  /* edge drawing */
}
```

---

### 5.5 Sample Dashboard Snippet

```tsx
/* ─────────────────────────────────────────────────
   STELLAR FORGE — Dashboard Components
   ───────────────────────────────────────────────── */

/* SIDEBAR — the creative toolbox */
<aside className="
  w-[280px] flex-shrink-0 flex flex-col
  bg-[#050c17] border-r border-sky-900/40
  h-screen
">
  <div className="px-6 py-5 border-b border-sky-900/40">
    <span className="
      text-lg font-bold tracking-tight text-sky-50
      font-['Plus_Jakarta_Sans']
    ">
      CORTHEX
    </span>
    <span className="ml-2 text-[11px] text-sky-400 font-medium">Forge</span>
  </div>

  {/* Tool category header */}
  <div className="px-6 pt-4 pb-1">
    <span className="text-[11px] font-medium uppercase tracking-widest text-sky-400/60">
      Builder
    </span>
  </div>

  {/* Active nav — stellar blue */}
  <a className="
    flex items-center gap-3 px-6 py-3
    bg-sky-400/10 border-l-2 border-sky-400
    text-sky-50 font-medium text-[13px]
  ">
    <NetworkIcon className="w-5 h-5 text-sky-400" />
    넥서스
  </a>

  {/* Inactive */}
  <a className="
    flex items-center gap-3 px-6 py-3
    text-sky-300/50 hover:text-sky-100
    hover:bg-sky-400/5
    text-[13px] font-medium transition-all duration-300
    border-l-2 border-transparent
  ">
    <UsersIcon className="w-5 h-5" />
    에이전트
  </a>
</aside>

/* AGENT CARD — stellar workspace tile */
<div className="
  rounded-[20px] p-6
  bg-gradient-to-br from-sky-400/10 via-[#0a1628]/80 to-teal-400/5
  border border-sky-400/20
  hover:border-sky-400/40
  hover:shadow-[0_0_32px_rgba(56,189,248,0.15)]
  transition-all duration-300
  group
">
  {/* Star indicator */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      {/* Agent avatar as star */}
      <div className="
        w-10 h-10 rounded-full
        bg-sky-950 border border-sky-400/30
        shadow-[0_0_12px_rgba(56,189,248,0.30)]
        flex items-center justify-center
        group-hover:shadow-[0_0_20px_rgba(56,189,248,0.50)]
        transition-all duration-300
      ">
        <div className="w-5 h-5 text-sky-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-sky-50">콘텐츠 크리에이터</h3>
        <span className="
          text-[11px] text-sky-400/70 font-medium
        ">
          Creative Department
        </span>
      </div>
    </div>
    <span className="
      text-[11px] font-medium uppercase tracking-wide
      bg-sky-400/10 text-sky-300 border border-sky-400/20
      px-2.5 py-1 rounded-full
    ">
      TIER 2
    </span>
  </div>

  {/* Soul preview */}
  <p className="text-sm text-sky-300/60 leading-relaxed">
    브랜드 스토리텔링, SNS 콘텐츠 전략, 크리에이티브 브리프 작성 전문...
  </p>
</div>

/* NEXUS CANVAS NODE — constellation star */
<div className="
  relative w-14 h-14 flex items-center justify-center
">
  {/* Star glow rings — multiple halos */}
  <div className="
    absolute inset-0 rounded-full
    bg-sky-400/5
    animate-[ping_3s_ease-in-out_infinite]
  " />
  <div className="
    absolute inset-1 rounded-full
    bg-sky-400/10
  " />

  {/* Core node */}
  <div className="
    w-10 h-10 rounded-full
    bg-[#0a1628] border-2 border-sky-400
    shadow-[0_0_24px_rgba(56,189,248,0.70)]
    flex items-center justify-center
    relative z-10
  ">
    <div className="w-5 h-5 text-sky-300" />
  </div>
</div>

/* PRIMARY BUTTON — the forge action */
<button className="
  bg-sky-400 hover:bg-sky-300
  text-[#050c17] font-semibold text-sm
  px-5 py-2.5 rounded-[10px]
  shadow-lg shadow-sky-950/60
  hover:shadow-[0_8px_24px_rgba(56,189,248,0.40)]
  hover:scale-[1.02]
  active:scale-[0.98]
  transition-all duration-300
">
  에이전트 생성
</button>
```

---

### 5.6 Target User Persona

**User:** Creative director, content strategist, or brand manager using AI agents as a
creative production team. Thinks in campaigns, not reports. Builds for aesthetics as well
as function. Values beautiful tools as much as powerful ones. Needs the NEXUS canvas to
feel like an inspiration board, not a technical diagram.

**Emotion evoked:** Creative possibility. The feeling of looking at a blank canvas with all
the tools ready. "내가 만든 AI 팀이 하나의 예술 작품 같다." Inspired, capable, building something beautiful.

**Industry fit:**
- Creative and content agencies
- Brand management and marketing departments
- Media production companies
- Design studios with AI-assisted production
- Social media management and influencer platforms
- Publishing and editorial teams

---
---

## Appendix: Cross-Theme Reference

### Preserved Semantic Colors (All Themes)

These status colors do not change across any theme — they are system-semantic:

| Meaning | Hex | Tailwind | Preserved because |
|---------|-----|----------|------------------|
| Working / in-progress | `#60a5fa` | `blue-400` | Universal "active process" signal |
| Complete / success | `#34d399` | `emerald-400` | Universal "done" signal |
| Error / failed | `#f87171` | `red-400` | Universal "problem" signal |
| Queued / waiting | `#475569` | `slate-600` | Universal "not started" signal |

### Theme Selection Decision Tree

```
Is the primary user focused on HIERARCHY and AUTHORITY?
  → Yes → IMPERIAL COMMAND (Ruler + Emperor)

Is the primary user focused on KNOWLEDGE and DEPTH?
  → Yes → CONTEMPLATIVE DEPTHS (Sage + Hermit)

Is the primary user focused on AI INTELLIGENCE and TRANSFORMATION?
  → Yes → LUNAR ALCHEMY (Magician + Moon)

Is the primary user focused on SPEED and ACHIEVEMENT?
  → Yes → SOLAR CONQUEST (Hero + Sun)

Is the primary user focused on CREATION and EXPRESSION?
  → Yes → STELLAR FORGE (Creator + Star)
```

### Token Override Hierarchy

```
base/design-tokens.md        ← Phase 3 foundation (Swiss, slate-950, cyan-400)
  └── themes/[theme].css     ← Phase 4 theme override (only changed tokens)
        └── component.tsx    ← data-theme="[name]" on :root or top container
```

### Applying a Theme

```tsx
// Apply at root level
<html data-theme="imperial-command">

// Or at component/page level for demo
<div data-theme="stellar-forge" className="min-h-screen">
  {/* All children inherit theme tokens */}
</div>
```

---

_Phase 4 · Themes · Complete_
_Five themes · Minimum 600 lines · All tokens specified_
_Next: Phase 4b — Competitive Analysis (themes vs. existing market)_
