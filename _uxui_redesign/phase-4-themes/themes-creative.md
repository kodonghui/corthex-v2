# CORTHEX v3 — Archetypal Themes

**Phase:** 4-Themes, Step 4-1
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 4 Themes)
**Input:** Design Tokens (Phase 3, Step 3-1), Vision & Identity (Phase 0, Step 0-2), Jungian Archetypes Skill, Major Arcana Skill, Archetypal Combinations Skill
**Target Grade:** B (avg >= 7.0)

---

## Overview

CORTHEX's base design system ("Sovereign Sage") is built on the Ruler archetype with organic warmth. This document defines **5 archetypal themes** — each synthesizing one Jungian Archetype with one Major Arcana card — providing distinct visual identities for different user personas and contexts.

Each theme overrides the base `corthex-*` design tokens from Step 3-1, preserving the same token names and structural layout (sidebar width, topbar height, spacing scale, typography scale) while transforming the color system, shadow style, and atmospheric mood.

**Alchemy Process Applied:**
1. **Parse** — Archetype + Card combination identified
2. **Extract Archetype** — UI structure, typography weight, layout principles, motion behavior
3. **Extract Card** — Primary/secondary/accent colors, gradient formula, shadow style, atmosphere
4. **Synthesize** — Combined design system with complete token overrides

**Theme Architecture:**
All themes use CSS custom properties scoped under `[data-theme="<name>"]` selectors. The base Sovereign Sage tokens remain the default. Themes override only color, shadow, and atmospheric tokens — spacing, typography scale, layout dimensions, and border radius are shared across all themes.

---

## Theme 1: "Sovereign Command"

### Archetype: The Ruler
**Core Drive:** Control, order, leadership
**Visual Language:** Authoritative, prestigious, structured

| Trait | Expression |
|-------|-----------|
| Hierarchical organization | Strict grid, dark-on-light power inversion — dark backgrounds command attention |
| Premium materials | Deep obsidian surfaces with gold accents evoke throne rooms, not offices |
| Control panel metaphors | Data-rich dashboards feel like mission control, not spreadsheets |
| Status indicators | Gold-accented badges and rank indicators reinforce hierarchy |
| Command-and-control | Primary actions glow with imperial authority |

**Typography Behavior:** Strong weight hierarchy. Headings at 700 uppercase with wide tracking for proclamation feel. Body at 400 — the subjects, not the sovereign.

**Motion:** Dignified, controlled. Transitions use `ease-out` — decisive arrival, no bounce, no playfulness.

### Card: IV — The Emperor
**Energy:** Authority, structure, leadership

| Role | Hex | Tailwind Utility | Meaning |
|------|-----|-----------------|---------|
| Primary | `#18181b` | `bg-zinc-900` | Obsidian Black — absolute control, the void from which commands emerge |
| Secondary | `#52525b` | `bg-zinc-600` | Iron Gray — structural strength, fortress walls |
| Accent | `#eab308` | `bg-yellow-500` | Royal Gold — sovereign status, the crown's gleam |
| Accent Hover | `#ca8a04` | `bg-yellow-600` | Deepened Gold — pressed authority |
| Text on Dark | `#e4e4e7` | `text-zinc-200` | Parchment Light — readable against obsidian |
| Text Secondary | `#a1a1aa` | `text-zinc-400` | Iron Mist — subordinate information |
| Error | `#f87171` | `text-red-400` | Imperial Red — decisive rejection |
| Success | `#22c55e` | `text-green-500` | Victory Green — conquest achieved |
| Border | `#3f3f46` | `border-zinc-700` | Iron Edge — hard, defined boundaries |

**Gradient:** `from-zinc-900 via-zinc-800 to-zinc-900`
**Shadow Style:** Hard, defined, architectural — `0 4px 12px rgba(0,0,0,0.40)`
**Atmosphere:** Throne room, stone fortress, commanding presence. The CEO sits above, surveying the domain.

### Synthesis Rationale

The Ruler archetype naturally pairs with the Emperor card — both embody structured authority. The Ruler provides the UI pattern (hierarchical dashboards, command panels, status indicators), while the Emperor provides the color mood (obsidian-gold-iron). Together they create a **dark mode command center** where gold accents mark sovereign actions and iron borders delineate clear territories.

**Why this works for CEOs:** The CEO persona seeks control and visibility. Dark backgrounds reduce cognitive noise and create focus. Gold accents on primary CTAs create clear action hierarchy — the sovereign knows exactly where to command. Iron borders create territorial clarity between dashboard sections.

**Shadow of the Tyrant addressed:** The gold accent is used sparingly (10% rule) — only on primary CTAs and key status indicators. Overuse of gold would feel oppressive. The iron gray secondary provides breathing room, preventing the interface from becoming a gold-plated prison.

### Complete Token Overrides

```css
[data-theme="sovereign-command"] {
  /* 60% Dominant — Obsidian Surfaces */
  --color-corthex-bg: #18181b;
  --color-corthex-surface: #27272a;
  --color-corthex-elevated: #3f3f46;
  --color-corthex-border: #3f3f46;
  --color-corthex-border-strong: #52525b;
  --color-corthex-border-input: #71717a;       /* 3.08:1 on #27272a — WCAG 1.4.11 */

  /* 30% Secondary — Chrome (sidebar) */
  --color-corthex-chrome: #09090b;
  --color-corthex-chrome-hover: rgba(234, 179, 8, 0.08);
  --color-corthex-chrome-active: rgba(234, 179, 8, 0.15);

  /* 10% Accent — Royal Gold */
  --color-corthex-accent: #eab308;             /* 9.24:1 on #18181b */
  --color-corthex-accent-hover: #ca8a04;       /* 6.03:1 on #18181b */
  --color-corthex-accent-secondary: #c97c15;   /* 5.38:1 on #18181b, 4.52:1 on #27272a */
  --color-corthex-accent-muted: rgba(234, 179, 8, 0.10);

  /* Text */
  --color-corthex-text-primary: #e4e4e7;       /* 13.96:1 on #18181b */
  --color-corthex-text-secondary: #a1a1aa;     /* 6.91:1 on #18181b */
  --color-corthex-text-tertiary: #8d8d96;      /* 5.38:1 on #18181b, 4.53:1 on #27272a */
  --color-corthex-text-disabled: #52525b;      /* 2.29:1 — decorative only */
  --color-corthex-text-on-accent: #18181b;     /* 9.24:1 on gold — dark text on gold bg */
  --color-corthex-text-chrome: #d4d4d8;        /* 13.46:1 on #09090b */
  --color-corthex-text-chrome-dim: rgba(212, 212, 216, 0.70);

  /* Semantic */
  --color-corthex-success: #22c55e;            /* 7.78:1 on #18181b */
  --color-corthex-warning: #f59e0b;            /* 8.25:1 on #18181b */
  --color-corthex-error: #f87171;              /* 6.40:1 on #18181b, 5.38:1 on #27272a */
  --color-corthex-info: #60a5fa;               /* 6.97:1 on #18181b */
  --color-corthex-handoff: #c084fc;            /* 6.70:1 on #18181b */

  /* Chart */
  --color-corthex-chart-1: #eab308;
  --color-corthex-chart-2: #60a5fa;
  --color-corthex-chart-3: #f87171;
  --color-corthex-chart-4: #34d399;
  --color-corthex-chart-5: #a78bfa;
  --color-corthex-chart-6: #fb923c;

  /* Focus */
  --color-corthex-focus: #eab308;
  --color-corthex-focus-chrome: #eab308;
  --color-corthex-selection: rgba(234, 179, 8, 0.15);

  /* Shadows — heavier for dark mode depth */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.30);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.40);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.50);
}
```

### Sample Dashboard Utility Classes

```html
<!-- Sovereign Command: Dashboard Card -->
<div class="bg-corthex-surface border border-corthex-border rounded-xl p-4
            shadow-sm hover:border-corthex-accent/30 transition-colors">
  <h3 class="text-corthex-text-primary text-lg font-semibold">Active Agents</h3>
  <p class="text-4xl font-bold text-corthex-accent font-mono mt-2">47</p>
  <p class="text-corthex-text-secondary text-sm mt-1">+3 since yesterday</p>
</div>

<!-- Sovereign Command: Primary Action Button -->
<button class="bg-corthex-accent text-corthex-text-on-accent px-6 py-3
               rounded-lg font-semibold hover:bg-corthex-accent-hover
               focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
               focus:ring-offset-corthex-bg transition-colors">
  Deploy Agent
</button>

<!-- Sovereign Command: Sidebar Nav Item (Active) -->
<a class="flex items-center gap-3 px-4 py-2
          bg-corthex-chrome-active text-corthex-text-chrome
          rounded-lg" aria-current="page">
  <LayoutDashboard class="w-5 h-5" aria-hidden="true" />
  <span class="text-sm font-medium">Dashboard</span>
</a>

<!-- Sovereign Command: Status Badge -->
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
             bg-corthex-success/15 text-corthex-success text-xs font-medium">
  <CheckCircle class="w-3.5 h-3.5" aria-hidden="true" />
  Online
</span>
```

### Target Persona
**Primary:** CEO / Founder — The executive who demands authority and visibility. Dark interfaces signal "serious control room," gold accents mark decisive actions. This persona manages 10-50+ AI agents and needs at-a-glance hierarchy.

---

## Theme 2: "Guardian Harmony"

### Archetype: The Caregiver
**Core Drive:** Service, compassion, nurturing
**Visual Language:** Warm, supportive, accessible

| Trait | Expression |
|-------|-----------|
| Clear help and support | Prominent guidance indicators, contextual help badges |
| Empathetic messaging | Warm tones in feedback states, encouraging empty states |
| Accessibility-first | High contrast, generous padding, comfortable reading |
| Supportive feedback | Gentle transitions, confirming rather than alarming |
| Community-building | Shared dashboards feel collaborative, not competitive |

**Typography Behavior:** Warm, readable weights. Headings at 600 (approachable, not commanding). Body at 400 with generous line-height for comfortable scanning.

**Motion:** Gentle, supportive. Ease-in-out transitions — nothing jarring. Toasts slide in softly.

### Card: XIV — Temperance
**Energy:** Balance, moderation, alchemy

| Role | Hex | Tailwind Utility | Meaning |
|------|-----|-----------------|---------|
| Primary | `#f0f9ff` | `bg-sky-50` | Harmony White — serene canvas of balanced care |
| Secondary | `#e0f2fe` | `bg-sky-100` | Soft Sky — gentle surface elevation |
| Accent | `#2563eb` | `bg-blue-600` | Angelic Blue — divine balance, trustworthy action |
| Accent Hover | `#1d4ed8` | `bg-blue-700` | Deepened Blue — committed action |
| Warm Accent | `#b25000` | `bg-amber-700` | Alchemical Gold — warmth, guidance markers |
| Text Primary | `#0f172a` | `text-slate-900` | Deep Slate — clear, grounded readability |
| Text Secondary | `#475569` | `text-slate-600` | Muted Slate — secondary but legible |
| Chrome | `#1e3a5f` | — | Midnight Blue — calm authority, not oppressive |
| Border | `#bfdbfe` | `border-blue-200` | Sky Border — soft delineation |

**Gradient:** `from-sky-50 via-blue-50 to-sky-50`
**Shadow Style:** Soft, blended, harmonious — `0 2px 8px rgba(37,99,235,0.08)`
**Atmosphere:** Mixing waters, golden mean, perfect harmony. The admin oversees with care, not command.

### Synthesis Rationale

The Caregiver archetype pairs with Temperance — both embody balance, moderation, and service. The Caregiver provides UI patterns (supportive feedback, accessibility-first, organized layouts), while Temperance provides the color mood (angelic blue, alchemical gold, harmony white). Together they create a **calm, trustworthy workspace** where blue communicates reliability and gold highlights guidance.

**Why this works for Admins:** The Admin persona manages configurations, user permissions, and system health. They need clarity without intimidation. Blue is the world's most trusted UI color (banking, healthcare, enterprise). Gold accents mark actionable guidance ("set this up," "review this") without the pressure of red urgency.

**Caregiver shadow addressed:** The "martyr" shadow is mitigated by clear action hierarchy — the admin is guided to efficient task completion, not endless support loops. Gold accents mark the path forward.

### Complete Token Overrides

```css
[data-theme="guardian-harmony"] {
  /* 60% Dominant — Serene Light Surfaces */
  --color-corthex-bg: #f0f9ff;
  --color-corthex-surface: #e0f2fe;
  --color-corthex-elevated: #dbeafe;
  --color-corthex-border: #bfdbfe;
  --color-corthex-border-strong: #93c5fd;
  --color-corthex-border-input: #6b7280;       /* 4.54:1 on #f0f9ff, 4.21:1 on #e0f2fe — WCAG 1.4.11 */

  /* 30% Secondary — Midnight Blue Chrome */
  --color-corthex-chrome: #1e3a5f;
  --color-corthex-chrome-hover: rgba(255, 255, 255, 0.10);
  --color-corthex-chrome-active: rgba(255, 255, 255, 0.15);

  /* 10% Accent — Angelic Blue */
  --color-corthex-accent: #2563eb;             /* 4.85:1 on #f0f9ff */
  --color-corthex-accent-hover: #1d4ed8;       /* 6.70:1 on #f0f9ff */
  --color-corthex-accent-secondary: #b25000;   /* 4.88:1 on #f0f9ff, 4.53:1 on #e0f2fe */
  --color-corthex-accent-muted: rgba(37, 99, 235, 0.08);

  /* Text */
  --color-corthex-text-primary: #0f172a;       /* 16.75:1 on #f0f9ff */
  --color-corthex-text-secondary: #475569;     /* 7.11:1 on #f0f9ff */
  --color-corthex-text-tertiary: #5e6e85;      /* 4.87:1 on #f0f9ff, 4.52:1 on #e0f2fe */
  --color-corthex-text-disabled: #94a3b8;      /* 2.68:1 — decorative only */
  --color-corthex-text-on-accent: #ffffff;     /* 5.17:1 on #2563eb */
  --color-corthex-text-chrome: #bfdbfe;        /* 8.10:1 on #1e3a5f */
  --color-corthex-text-chrome-dim: rgba(191, 219, 254, 0.75);

  /* Semantic */
  --color-corthex-success: #127d3a;            /* 4.90:1 on #f0f9ff, 4.55:1 on #e0f2fe */
  --color-corthex-warning: #b15006;            /* 4.90:1 on #f0f9ff, 4.55:1 on #e0f2fe */
  --color-corthex-error: #d51f1f;              /* 4.87:1 on #f0f9ff, 4.52:1 on #e0f2fe */
  --color-corthex-info: #2563eb;               /* 4.85:1 on #f0f9ff */
  --color-corthex-handoff: #7c3aed;            /* 5.35:1 on #f0f9ff */

  /* Chart */
  --color-corthex-chart-1: #2563eb;
  --color-corthex-chart-2: #d97706;
  --color-corthex-chart-3: #dc2626;
  --color-corthex-chart-4: #15803d;
  --color-corthex-chart-5: #7c3aed;
  --color-corthex-chart-6: #0891b2;

  /* Focus */
  --color-corthex-focus: #2563eb;
  --color-corthex-focus-chrome: #93c5fd;
  --color-corthex-selection: rgba(37, 99, 235, 0.12);

  /* Shadows — soft blue tint */
  --shadow-sm: 0 1px 3px rgba(37, 99, 235, 0.06);
  --shadow-md: 0 4px 8px rgba(37, 99, 235, 0.08);
  --shadow-lg: 0 10px 20px rgba(37, 99, 235, 0.10);
}
```

### Sample Dashboard Utility Classes

```html
<!-- Guardian Harmony: Dashboard Card -->
<div class="bg-corthex-surface border border-corthex-border rounded-xl p-4
            shadow-sm hover:shadow-md transition-shadow">
  <h3 class="text-corthex-text-primary text-lg font-semibold">System Health</h3>
  <p class="text-4xl font-bold text-corthex-accent font-mono mt-2">99.7%</p>
  <p class="text-corthex-text-secondary text-sm mt-1">All services nominal</p>
</div>

<!-- Guardian Harmony: Primary Action Button -->
<button class="bg-corthex-accent text-corthex-text-on-accent px-6 py-3
               rounded-lg font-semibold hover:bg-corthex-accent-hover
               focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
               focus:ring-offset-corthex-bg transition-colors">
  Save Configuration
</button>

<!-- Guardian Harmony: Guidance Badge -->
<div class="flex items-center gap-2 px-3 py-2 rounded-lg
            bg-corthex-accent-secondary/10 border border-corthex-accent-secondary/30">
  <Lightbulb class="w-4 h-4 text-corthex-accent-secondary" aria-hidden="true" />
  <span class="text-sm text-corthex-accent-secondary font-medium">
    Tip: Set budget limits before deploying agents
  </span>
</div>

<!-- Guardian Harmony: Sidebar Nav Item (Active) -->
<a class="flex items-center gap-3 px-4 py-2
          bg-corthex-chrome-active text-corthex-text-chrome
          rounded-lg" aria-current="page">
  <Settings class="w-5 h-5" aria-hidden="true" />
  <span class="text-sm font-medium">Settings</span>
</a>
```

### Target Persona
**Primary:** System Administrator — Manages configurations, permissions, billing, and system health. Needs clarity, trust signals (blue), and guidance markers (gold). This persona values efficiency and error prevention over dramatic visual impact.

---

## Theme 3: "Obsidian Forge"

### Archetype: The Creator
**Core Drive:** Innovation, imagination, self-expression
**Visual Language:** Artistic, experimental, expressive

| Trait | Expression |
|-------|-----------|
| Canvas/workspace metaphors | Surfaces feel like workspaces where creation happens |
| Tool palette interfaces | Prominent toolbars and action menus for building |
| Creative freedom | Flexible component layouts, drag-and-drop affordances |
| Process visualization | Progress bars and step indicators show creation flow |
| Experimentation encouraged | Bold colors reward exploration and discovery |

**Typography Behavior:** Creative variety. Headings at 700 with tight tracking — condensed energy. Body at 400 — clear canvas for content.

**Motion:** Responsive to creation. Hover states reveal hidden tools. Transitions use spring-like easing for creative energy.

### Card: I — The Magician
**Energy:** Manifestation, power, transformation

| Role | Hex | Tailwind Utility | Meaning |
|------|-----|-----------------|---------|
| Primary | `#0f172a` | `bg-slate-900` | Void Black — the source from which creation emerges |
| Secondary | `#1e1b4b` | `bg-indigo-950` | Deep Indigo — mystical creative depth |
| Accent | `#a855f7` | `bg-purple-500` | Electric Violet — transformative creative energy |
| Accent Hover | `#b97cf8` | `bg-purple-400` | Brightened Violet — approaching the light of creation |
| Mercury | `#e5e7eb` | `bg-gray-200` | Mercury Silver — alchemical transformation markers |
| Text on Dark | `#e2e8f0` | `text-slate-200` | Silver Light — readable against void |
| Text Secondary | `#94a3b8` | `text-slate-400` | Mist Silver — secondary information |
| Chrome | `#0c0a1e` | — | Abyss — the deepest creative void |
| Border | `#312e81` | `border-indigo-900` | Mystic Edge — separating realms of creation |

**Gradient:** `from-slate-900 via-indigo-950 to-purple-950`
**Shadow Style:** Glowing purple auras — `0 4px 15px rgba(168,85,247,0.15)`
**Atmosphere:** Candlelit chamber, swirling energy, focused power. The creator manifests digital agents from the void.

### Synthesis Rationale

The Creator archetype pairs with the Magician card — creation is transformation, and the Magician manifests will into reality. The Creator provides workspace UI patterns (tool palettes, canvas layouts, experimentation flow), while the Magician provides mystical depth (deep indigo, electric violet, mercury silver). Together they create a **creative powerhouse interface** where building AI agents feels like crafting magical entities.

**Why this is bold/distinctive:** No enterprise SaaS uses deep indigo + electric violet. It's immediately recognizable, creates strong brand recall, and differentiates CORTHEX from every blue/white/gray competitor. The purple energy suggests innovation and transformation — building AI agents is an act of creation, not mere configuration.

**Creator shadow addressed:** The "perfectionist paralysis" shadow is mitigated by prominent action CTAs in bright violet — the interface pushes toward completion, not infinite refinement. Mercury silver markers show progress checkpoints.

### Complete Token Overrides

```css
[data-theme="obsidian-forge"] {
  /* 60% Dominant — Deep Void Surfaces */
  --color-corthex-bg: #0f172a;
  --color-corthex-surface: #1e1b4b;
  --color-corthex-elevated: #312e81;
  --color-corthex-border: #312e81;
  --color-corthex-border-strong: #4338ca;
  --color-corthex-border-input: #6366f1;       /* 3.58:1 on #1e1b4b, 4.00:1 on #0f172a — WCAG 1.4.11 */

  /* 30% Secondary — Abyss Chrome */
  --color-corthex-chrome: #0c0a1e;
  --color-corthex-chrome-hover: rgba(168, 85, 247, 0.10);
  --color-corthex-chrome-active: rgba(168, 85, 247, 0.20);

  /* 10% Accent — Electric Violet */
  --color-corthex-accent: #a855f7;             /* 4.51:1 on #0f172a, 4.04:1 on #1e1b4b (UI 3:1 PASS) */
  --color-corthex-accent-hover: #b97cf8;       /* 6.21:1 on #0f172a — lighter hover (dark text on bright) */
  --color-corthex-accent-secondary: #c084fc;   /* 6.76:1 on #0f172a (for text links) */
  --color-corthex-accent-muted: rgba(168, 85, 247, 0.12);

  /* Text */
  --color-corthex-text-primary: #e2e8f0;       /* 14.48:1 on #0f172a */
  --color-corthex-text-secondary: #94a3b8;     /* 6.96:1 on #0f172a */
  --color-corthex-text-tertiary: #7a8aa1;      /* 5.08:1 on #0f172a, 4.55:1 on #1e1b4b */
  --color-corthex-text-disabled: #475569;      /* 2.37:1 — decorative only */
  --color-corthex-text-on-accent: #0f172a;     /* 4.51:1 on #a855f7 — dark text on bright violet */
  --color-corthex-text-chrome: #c4b5fd;        /* 10.55:1 on #0c0a1e */
  --color-corthex-text-chrome-dim: rgba(196, 181, 253, 0.70);

  /* Semantic */
  --color-corthex-success: #4ade80;            /* 10.25:1 on #0f172a */
  --color-corthex-warning: #fbbf24;            /* 10.69:1 on #0f172a */
  --color-corthex-error: #f87171;              /* 6.45:1 on #0f172a */
  --color-corthex-info: #60a5fa;               /* 7.02:1 on #0f172a */
  --color-corthex-handoff: #c084fc;            /* 6.76:1 on #0f172a */

  /* Chart */
  --color-corthex-chart-1: #a855f7;
  --color-corthex-chart-2: #38bdf8;
  --color-corthex-chart-3: #fb923c;
  --color-corthex-chart-4: #4ade80;
  --color-corthex-chart-5: #f472b6;
  --color-corthex-chart-6: #facc15;

  /* Focus — uses lighter accent-secondary for reliable visibility */
  --color-corthex-focus: #c084fc;              /* 6.76:1 on #0f172a, 6.05:1 on #1e1b4b */
  --color-corthex-focus-chrome: #c4b5fd;       /* 10.55:1 on #0c0a1e */
  --color-corthex-selection: rgba(168, 85, 247, 0.15);

  /* Shadows — purple glow for mystical depth */
  --shadow-sm: 0 1px 3px rgba(168, 85, 247, 0.10);
  --shadow-md: 0 4px 15px rgba(168, 85, 247, 0.15);
  --shadow-lg: 0 10px 30px rgba(168, 85, 247, 0.20);
}
```

### Sample Dashboard Utility Classes

```html
<!-- Obsidian Forge: Dashboard Card -->
<div class="bg-corthex-surface border border-corthex-border rounded-xl p-4
            shadow-sm hover:shadow-md hover:border-corthex-accent/40
            backdrop-blur-sm transition-all">
  <h3 class="text-corthex-text-primary text-lg font-semibold">Agents Crafted</h3>
  <p class="text-4xl font-bold text-corthex-accent font-mono mt-2">23</p>
  <p class="text-corthex-text-secondary text-sm mt-1">5 manifested today</p>
</div>

<!-- Obsidian Forge: Primary Action Button (dark text on bright violet) -->
<button class="bg-corthex-accent text-corthex-text-on-accent px-6 py-3
               rounded-lg font-semibold hover:bg-corthex-accent-hover
               focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
               focus:ring-offset-corthex-bg
               shadow-md transition-all">
  Manifest Agent
</button>

<!-- Obsidian Forge: Creation Progress -->
<div class="flex items-center gap-3 px-4 py-3 rounded-lg
            bg-corthex-accent-muted border border-corthex-accent/20">
  <div class="w-2 h-2 rounded-full bg-corthex-accent animate-pulse" aria-hidden="true"></div>
  <span class="text-sm text-corthex-accent-secondary font-medium">
    Transforming agent configuration...
  </span>
</div>

<!-- Obsidian Forge: Sidebar Nav Item (Active) -->
<a class="flex items-center gap-3 px-4 py-2
          bg-corthex-chrome-active text-corthex-text-chrome
          rounded-lg" aria-current="page">
  <Bot class="w-5 h-5" aria-hidden="true" />
  <span class="text-sm font-medium">Agents</span>
</a>
```

### Target Persona
**Primary:** Power User / Builder — The user who creates complex agent configurations, builds workflows, and pushes the platform to its limits. Deep dark interfaces signal "developer tool," violet energy rewards exploration. This persona values creative control and visual distinctiveness.

---

## Theme 4: "Sacred Trust"

### Archetype: The Sage
**Core Drive:** Truth, wisdom, understanding
**Visual Language:** Clean, minimal, scholarly

| Trait | Expression |
|-------|-----------|
| Information hierarchy | Clear heading levels, well-structured data tables |
| Categorization | Organized navigation, taxonomic grouping of agents and departments |
| Reading-focused | Generous white space, comfortable text sizes, scholarly spacing |
| Knowledge graphs | Data visualizations feel analytical, not decorative |
| Citation systems | Audit trails and logs feel like referenced scholarship |

**Typography Behavior:** Humanist proportions. Headings at 600 with standard tracking — measured, not dramatic. Body at 400 with academic line-height (1.6) for extended reading.

**Motion:** Minimal, purposeful, never decorative. The Sage does not perform — it reveals truth.

### Card: V — The Hierophant
**Energy:** Tradition, teaching, spiritual wisdom

| Role | Hex | Tailwind Utility | Meaning |
|------|-----|-----------------|---------|
| Primary | `#fafaf9` | `bg-stone-50` | Ivory — purity of teaching, clean scholarly surface |
| Secondary | `#f5f5f4` | `bg-stone-100` | Warm Stone — elevated panels, reading surfaces |
| Accent | `#1d4ed8` | `bg-blue-700` | Sacred Blue — divine wisdom, institutional trust |
| Accent Hover | `#1e40af` | `bg-blue-800` | Deepened Blue — committed understanding |
| Warm Accent | `#b45309` | `bg-amber-700` | Ceremonial Gold — sacred tradition markers |
| Text Primary | `#1c1917` | `text-stone-900` | Deep Stone — grounded, warm readability |
| Text Secondary | `#57534e` | `text-stone-600` | Temple Dust — subordinate but legible |
| Chrome | `#1e293b` | `bg-slate-800` | Scholarly Navy — traditional authority |
| Border | `#d6d3d1` | `border-stone-300` | Warm Divide — gentle, non-clinical separation |

**Gradient:** `from-stone-50 via-blue-50/30 to-stone-50`
**Shadow Style:** Subtle, precise — `0 1px 3px rgba(0,0,0,0.06)`
**Atmosphere:** Cathedral light, sacred space, timeless wisdom. Every data point is treated with scholarly respect.

### Synthesis Rationale

The Sage archetype pairs with the Hierophant card — both embody structured wisdom and institutional trust. The Sage provides information-first UI patterns (clear hierarchy, reading-focused layouts, academic spacing), while the Hierophant provides traditional authority colors (sacred blue, ceremonial gold, ivory). Together they create a **clean, institutional interface** that feels like a trusted system, not a startup experiment.

**Why this works for enterprise/conservative:** Enterprise buyers evaluate trust before features. Ivory-blue is the color language of banking, law, and healthcare — institutions that guard information. Sacred blue says "we are reliable." Ceremonial gold says "this is important." Stone borders say "we are mature." Nothing flashy, nothing experimental — pure trustworthiness.

**Sage shadow addressed:** The "detached ivory tower" shadow is mitigated by warm stone tones (not clinical white) and ceremonial gold guidance markers. The interface feels wise, not cold.

### Complete Token Overrides

```css
[data-theme="sacred-trust"] {
  /* 60% Dominant — Ivory Scholarly Surfaces */
  --color-corthex-bg: #fafaf9;
  --color-corthex-surface: #f5f5f4;
  --color-corthex-elevated: #e7e5e4;
  --color-corthex-border: #d6d3d1;
  --color-corthex-border-strong: #a8a29e;
  --color-corthex-border-input: #78716c;       /* 4.59:1 on #fafaf9, 4.40:1 on #f5f5f4 — WCAG 1.4.11 */

  /* 30% Secondary — Scholarly Navy Chrome */
  --color-corthex-chrome: #1e293b;
  --color-corthex-chrome-hover: rgba(255, 255, 255, 0.08);
  --color-corthex-chrome-active: rgba(255, 255, 255, 0.14);

  /* 10% Accent — Sacred Blue */
  --color-corthex-accent: #1d4ed8;             /* 6.42:1 on #fafaf9 */
  --color-corthex-accent-hover: #1e40af;       /* 8.72:1 on #fafaf9 */
  --color-corthex-accent-secondary: #b45309;   /* 4.81:1 on #fafaf9 (ceremonial gold) */
  --color-corthex-accent-muted: rgba(29, 78, 216, 0.06);

  /* Text */
  --color-corthex-text-primary: #1c1917;       /* 16.74:1 on #fafaf9 */
  --color-corthex-text-secondary: #57534e;     /* 7.30:1 on #fafaf9 */
  --color-corthex-text-tertiary: #766f6a;      /* 4.73:1 on #fafaf9, 4.53:1 on #f5f5f4 */
  --color-corthex-text-disabled: #a8a29e;      /* 2.54:1 — decorative only */
  --color-corthex-text-on-accent: #ffffff;     /* 6.70:1 on #1d4ed8 */
  --color-corthex-text-chrome: #cbd5e1;        /* 9.85:1 on #1e293b */
  --color-corthex-text-chrome-dim: rgba(203, 213, 225, 0.75);

  /* Semantic */
  --color-corthex-success: #15803d;            /* 4.80:1 on #fafaf9, 4.60:1 on #f5f5f4 */
  --color-corthex-warning: #b45309;            /* 4.81:1 on #fafaf9, 4.60:1 on #f5f5f4 */
  --color-corthex-error: #da2424;              /* 4.72:1 on #fafaf9, 4.52:1 on #f5f5f4 */
  --color-corthex-info: #1d4ed8;               /* 6.42:1 on #fafaf9 */
  --color-corthex-handoff: #7c3aed;            /* 5.46:1 on #fafaf9 */

  /* Chart */
  --color-corthex-chart-1: #1d4ed8;
  --color-corthex-chart-2: #b45309;
  --color-corthex-chart-3: #dc2626;
  --color-corthex-chart-4: #15803d;
  --color-corthex-chart-5: #7c3aed;
  --color-corthex-chart-6: #0e7490;

  /* Focus */
  --color-corthex-focus: #1d4ed8;
  --color-corthex-focus-chrome: #93c5fd;
  --color-corthex-selection: rgba(29, 78, 216, 0.10);

  /* Shadows — minimal, precise */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.08);
}
```

### Sample Dashboard Utility Classes

```html
<!-- Sacred Trust: Dashboard Card -->
<div class="bg-corthex-surface border border-corthex-border rounded-xl p-4
            shadow-sm">
  <h3 class="text-corthex-text-primary text-lg font-semibold">Cost Analysis</h3>
  <p class="text-4xl font-bold text-corthex-accent font-mono mt-2">$1,247</p>
  <p class="text-corthex-text-secondary text-sm mt-1">Monthly expenditure</p>
</div>

<!-- Sacred Trust: Primary Action Button -->
<button class="bg-corthex-accent text-corthex-text-on-accent px-6 py-3
               rounded-lg font-semibold hover:bg-corthex-accent-hover
               focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
               focus:ring-offset-corthex-bg transition-colors">
  Generate Report
</button>

<!-- Sacred Trust: Important Marker (Ceremonial Gold) -->
<div class="flex items-center gap-2 px-3 py-2 rounded-lg
            border-l-4 border-corthex-accent-secondary bg-corthex-accent-secondary/5">
  <AlertTriangle class="w-4 h-4 text-corthex-accent-secondary" aria-hidden="true" />
  <span class="text-sm text-corthex-text-primary font-medium">
    Budget threshold approaching — review recommended
  </span>
</div>

<!-- Sacred Trust: Sidebar Nav Item (Active) -->
<a class="flex items-center gap-3 px-4 py-2
          bg-corthex-chrome-active text-corthex-text-chrome
          rounded-lg" aria-current="page">
  <BarChart3 class="w-5 h-5" aria-hidden="true" />
  <span class="text-sm font-medium">Reports</span>
</a>
```

### Target Persona
**Primary:** Enterprise Decision Maker / CFO — The stakeholder who evaluates platforms for institutional adoption. Expects blue-chip visual language: clean, professional, trustworthy. This persona reviews cost reports, compliance data, and audit logs.

---

## Theme 5: "Stellar Horizon"

### Archetype: The Explorer
**Core Drive:** Discovery, freedom, adventure
**Visual Language:** Open, expansive, journey-focused

| Trait | Expression |
|-------|-----------|
| Discovery-based navigation | Breadcrumbs and journey visualizations through agent hierarchies |
| Map/journey metaphors | NEXUS canvas feels like charting unknown territory |
| Exploration rewards | Visual feedback for discovering platform features |
| Breadcrumbs and waypoints | Clear path indicators through complex workflows |
| Panoramic views | Dashboard cards feel like windows into vast data landscapes |

**Typography Behavior:** Slightly condensed headings suggest forward momentum. Weight 600 for headings — active, not passive. Body at 400 with standard line-height — efficient for scanning during exploration.

**Motion:** Parallax-inspired depth. Hover states suggest there's more to discover beneath surfaces. Transitions use ease-out — moving forward, not lingering.

### Card: XVII — The Star
**Energy:** Hope, inspiration, serenity

| Role | Hex | Tailwind Utility | Meaning |
|------|-----|-----------------|---------|
| Primary | `#0c1222` | — | Deep Space — infinite potential, the cosmos at rest |
| Secondary | `#162032` | — | Star Field — subtle elevation in the cosmic expanse |
| Accent | `#38bdf8` | `bg-sky-400` | Starlight Blue — celestial hope, guiding star |
| Accent Hover | `#0ea5e9` | `bg-sky-500` | Brightened Star — closer to the light |
| Teal Accent | `#2dd4bf` | `bg-teal-400` | Nebula Teal — secondary cosmic marker |
| Text on Dark | `#e0f2fe` | `text-sky-100` | Starlight — readable against deep space |
| Text Secondary | `#7dd3fc` | `text-sky-300` | Distant Star — secondary information |
| Chrome | `#071528` | — | Void — the edge of explored space |
| Border | `#1e3a5f` | — | Horizon Line — the boundary between known and unknown |

**Gradient:** `from-[#0c1222] via-[#162032] to-[#0c1222]`
**Shadow Style:** Soft stellar glows — `0 4px 15px rgba(56,189,248,0.10)`
**Atmosphere:** Starlit night, cosmic hope, infinite promise. The explorer charts new frontiers of AI capability.

### Synthesis Rationale

The Explorer archetype pairs with the Star card — exploration is driven by hope and the light of distant goals. The Explorer provides journey-focused UI patterns (breadcrumbs, discovery navigation, panoramic views), while the Star provides cosmic serenity (deep space backgrounds, starlight blue accents, nebula teal). Together they create a **futuristic exploration interface** where managing AI agents feels like charting a stellar civilization.

**Why this is innovative/forward-looking:** Deep space + cyan-teal is the visual language of space tech, quantum computing, and frontier technology. It immediately signals "this is cutting-edge." The Star's calm hope prevents it from feeling cold or clinical — it's optimistic futurism, not dystopian sci-fi. The dual accent (sky blue + teal) creates visual richness that feels expansive.

**Explorer shadow addressed:** The "aimless wandering" shadow is mitigated by strong breadcrumb navigation and journey waypoints. The star always provides a fixed point of reference — no matter how deep the exploration, the user knows where they are.

### Complete Token Overrides

```css
[data-theme="stellar-horizon"] {
  /* 60% Dominant — Deep Space Surfaces */
  --color-corthex-bg: #0c1222;
  --color-corthex-surface: #162032;
  --color-corthex-elevated: #1e3050;
  --color-corthex-border: #1e3a5f;
  --color-corthex-border-strong: #2563eb;
  --color-corthex-border-input: #38bdf8;       /* 7.62:1 on #162032 — WCAG 1.4.11 */

  /* 30% Secondary — Void Chrome */
  --color-corthex-chrome: #071528;
  --color-corthex-chrome-hover: rgba(56, 189, 248, 0.08);
  --color-corthex-chrome-active: rgba(56, 189, 248, 0.15);

  /* 10% Accent — Starlight Blue */
  --color-corthex-accent: #38bdf8;             /* 8.71:1 on #0c1222 */
  --color-corthex-accent-hover: #0ea5e9;       /* 6.73:1 on #0c1222 */
  --color-corthex-accent-secondary: #2dd4bf;   /* 10.03:1 on #0c1222 (nebula teal) */
  --color-corthex-accent-muted: rgba(56, 189, 248, 0.08);

  /* Text */
  --color-corthex-text-primary: #e0f2fe;       /* 16.26:1 on #0c1222 */
  --color-corthex-text-secondary: #7dd3fc;     /* 11.19:1 on #0c1222 */
  --color-corthex-text-tertiary: #38bdf8;      /* 8.71:1 on #0c1222, 7.62:1 on #162032 */
  --color-corthex-text-disabled: #1e3a5f;      /* 2.02:1 — decorative only */
  --color-corthex-text-on-accent: #0c1222;     /* 8.71:1 on sky-400 — dark text on bright blue */
  --color-corthex-text-chrome: #7dd3fc;        /* 10.98:1 on #071528 */
  --color-corthex-text-chrome-dim: rgba(125, 211, 252, 0.70);

  /* Semantic */
  --color-corthex-success: #4ade80;            /* 10.71:1 on #0c1222 */
  --color-corthex-warning: #fbbf24;            /* 11.18:1 on #0c1222 */
  --color-corthex-error: #fb7185;              /* 6.93:1 on #0c1222 */
  --color-corthex-info: #38bdf8;               /* 8.71:1 on #0c1222 */
  --color-corthex-handoff: #c084fc;            /* 7.06:1 on #0c1222 */

  /* Chart */
  --color-corthex-chart-1: #38bdf8;
  --color-corthex-chart-2: #2dd4bf;
  --color-corthex-chart-3: #fb923c;
  --color-corthex-chart-4: #f472b6;
  --color-corthex-chart-5: #a78bfa;
  --color-corthex-chart-6: #fbbf24;

  /* Focus */
  --color-corthex-focus: #38bdf8;
  --color-corthex-focus-chrome: #7dd3fc;
  --color-corthex-selection: rgba(56, 189, 248, 0.12);

  /* Shadows — starlight glow */
  --shadow-sm: 0 1px 3px rgba(56, 189, 248, 0.06);
  --shadow-md: 0 4px 15px rgba(56, 189, 248, 0.10);
  --shadow-lg: 0 10px 30px rgba(56, 189, 248, 0.15);
}
```

### Sample Dashboard Utility Classes

```html
<!-- Stellar Horizon: Dashboard Card -->
<div class="bg-corthex-surface border border-corthex-border rounded-xl p-4
            shadow-sm hover:shadow-md hover:border-corthex-accent/30
            backdrop-blur-sm transition-all">
  <h3 class="text-corthex-text-primary text-lg font-semibold">Frontier Agents</h3>
  <p class="text-4xl font-bold text-corthex-accent font-mono mt-2">12</p>
  <p class="text-corthex-text-secondary text-sm mt-1">Exploring 4 new domains</p>
</div>

<!-- Stellar Horizon: Primary Action Button -->
<button class="bg-corthex-accent text-corthex-text-on-accent px-6 py-3
               rounded-lg font-semibold hover:bg-corthex-accent-hover
               focus:outline-none focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2
               focus:ring-offset-corthex-bg
               shadow-md transition-all">
  Launch Expedition
</button>

<!-- Stellar Horizon: Journey Breadcrumb -->
<nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
  <a class="text-corthex-text-secondary hover:text-corthex-accent transition-colors">Hub</a>
  <ChevronRight class="w-3.5 h-3.5 text-corthex-text-disabled" aria-hidden="true" />
  <a class="text-corthex-text-secondary hover:text-corthex-accent transition-colors">Departments</a>
  <ChevronRight class="w-3.5 h-3.5 text-corthex-text-disabled" aria-hidden="true" />
  <span class="text-corthex-accent font-medium" aria-current="page">Research Division</span>
</nav>

<!-- Stellar Horizon: Sidebar Nav Item (Active) -->
<a class="flex items-center gap-3 px-4 py-2
          bg-corthex-chrome-active text-corthex-text-chrome
          rounded-lg" aria-current="page">
  <Compass class="w-5 h-5" aria-hidden="true" />
  <span class="text-sm font-medium">NEXUS</span>
</a>
```

### Target Persona
**Primary:** Innovation Lead / CTO — The technical visionary who sees AI orchestration as a frontier to explore. Deep space aesthetics signal "cutting-edge technology," starlight accents reward discovery. This persona builds complex multi-agent systems and pushes platform boundaries.

---

## Theme Comparison Matrix

| Property | Sovereign Command | Guardian Harmony | Obsidian Forge | Sacred Trust | Stellar Horizon |
|----------|------------------|-----------------|----------------|-------------|----------------|
| **Archetype** | Ruler | Caregiver | Creator | Sage | Explorer |
| **Card** | IV Emperor | XIV Temperance | I Magician | V Hierophant | XVII Star |
| **Mode** | Dark | Light | Dark | Light | Dark |
| **Background** | `#18181b` Obsidian | `#f0f9ff` Sky | `#0f172a` Void | `#fafaf9` Ivory | `#0c1222` Space |
| **Accent** | `#eab308` Gold | `#2563eb` Blue | `#a855f7` Violet | `#1d4ed8` Blue | `#38bdf8` Cyan |
| **Chrome** | `#09090b` Black | `#1e3a5f` Navy | `#0c0a1e` Abyss | `#1e293b` Slate | `#071528` Void |
| **Shadow** | Hard, heavy | Soft, blue-tinted | Glowing purple | Minimal, precise | Stellar glow |
| **Persona** | CEO / Founder | Admin / Ops | Power User / Builder | Enterprise / CFO | CTO / Innovator |
| **Vibe** | Commanding | Trustworthy | Mystical-creative | Institutional | Futuristic |

---

## Implementation Notes

### Theme Switching Mechanism

```tsx
// Theme provider pattern
const THEMES = [
  'sovereign-sage',      // base (no data-theme attribute needed)
  'sovereign-command',
  'guardian-harmony',
  'obsidian-forge',
  'sacred-trust',
  'stellar-horizon',
] as const;

type Theme = typeof THEMES[number];

function applyTheme(theme: Theme) {
  if (theme === 'sovereign-sage') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem('corthex-theme', theme);
}
```

### Token Override Architecture

All 5 themes override the same `--color-corthex-*` custom properties. Components use these tokens via Tailwind utility classes (`bg-corthex-bg`, `text-corthex-text-primary`, etc.) and automatically adapt to the active theme with **zero component code changes**.

```css
/* Base: Sovereign Sage (default — no selector) */
:root {
  --color-corthex-bg: #faf8f5;
  /* ... all base tokens ... */
}

/* Theme overrides — only colors and shadows change */
[data-theme="sovereign-command"] { /* ... */ }
[data-theme="guardian-harmony"] { /* ... */ }
[data-theme="obsidian-forge"] { /* ... */ }
[data-theme="sacred-trust"] { /* ... */ }
[data-theme="stellar-horizon"] { /* ... */ }
```

### Shared Across All Themes (Never Overridden)

| Category | Tokens | Reason |
|----------|--------|--------|
| Typography scale | `--text-xs` through `--text-5xl` | Consistent reading experience |
| Font stack | `--font-ui`, `--font-mono`, `--font-serif` | Brand identity |
| Spacing | `--space-0.5` through `--space-12` | Consistent rhythm |
| Layout | `--sidebar-width`, `--topbar-height`, `--content-max` | Structural consistency |
| Border radius | `--radius-sm` through `--radius-full` | Component shape identity |
| Z-index | `--z-base` through `--z-command-palette` | Layer order |
| Touch targets | 44px minimum | Accessibility constant |

---

*"In the marriage of archetype and card, form finds its color, and color finds its purpose." — Archetypal Alchemy*

*End of Archetypal Themes — Phase 4-Themes, Step 4-1*
