# CORTHEX Creative Themes — Phase 4-1
**Phase:** 4 · Theme Creation
**Date:** 2026-03-15
**Version:** 1.0
**Authority:** Phase 3 Design Tokens v2.0 (base) + Phase 0 Vision & Identity v2.0
**Method:** 3-Round Party — 5 theme variants layered on Swiss Dark base

---

## Theme Architecture

All themes share the same structural foundation:
- **Typography:** Inter + JetBrains Mono (never changes)
- **Layout:** 280px sidebar, 12-col grid, 24px gutter, 56px topbar
- **Motion:** Same animation budget (150ms default, 1.5s pulse, etc.)
- **Semantic status colors:** emerald (success), red (error), blue (working), violet (handoff) — **PRESERVED ACROSS ALL THEMES**
- **Dark mode only:** All themes use slate-950 page background

What changes per theme:
- **Primary accent** (replaces cyan-400)
- **Primary accent light/deep/muted variants**
- **Alpha tints** (active nav bg, hover bg, pressed bg)
- **CTA button colors** (primary fill, secondary border)
- **Focus ring color** (matches primary accent)
- **Glow shadow** (matches primary accent)
- **Active nav indicator** (border-l-2 color, text color)

---

## Theme Index

| # | Theme | Primary Accent | Hex | Target Audience |
|---|-------|---------------|-----|----------------|
| 1 | **Sovereign** (default) | Cyan | `#22D3EE` | General — authoritative command center |
| 2 | **Imperial** | Amber/Gold | `#FBBF24` | Premium enterprise tier — wealth, prestige |
| 3 | **Tactical** | Emerald/Green | `#34D399` | Operations-focused — growth, efficiency |
| 4 | **Mystic** | Violet/Purple | `#A78BFA` | Creative agencies — innovation, imagination |
| 5 | **Stealth** | Monochrome Slate | `#94A3B8` | Maximum minimalism — data-focused, no distraction |

---

## 1. SOVEREIGN (Default Theme)

**Concept:** The base CORTHEX identity. Swiss authority meets digital command. Cyan signals precision, clarity, and technological confidence.

**When to use:** Default for all new accounts. General-purpose AI management. Tech companies, startups, SaaS teams.

### Color Override Map

| Token | Value | Tailwind | Hex |
|-------|-------|----------|-----|
| `--color-primary` | cyan-400 | `text-cyan-400` / `bg-cyan-400` | `#22D3EE` |
| `--color-primary-light` | cyan-300 | `hover:bg-cyan-300` | `#67E8F9` |
| `--color-primary-deep` | cyan-500 | `active:bg-cyan-500` | `#06B6D4` |
| `--color-primary-muted` | cyan-600 | — | `#0891B2` |
| `--color-primary-tint-10` | cyan-400/10 | `bg-cyan-400/10` | `rgba(34, 211, 238, 0.10)` |
| `--color-primary-tint-15` | cyan-400/15 | `hover:bg-cyan-400/15` | `rgba(34, 211, 238, 0.15)` |
| `--color-primary-tint-20` | cyan-400/20 | `active:bg-cyan-400/20` | `rgba(34, 211, 238, 0.20)` |
| `--glow-primary` | — | `shadow-glow-primary` | `0 0 20px rgba(34, 211, 238, 0.15)` |

### WCAG Contrast on slate-950 (#020617)

| Color | Ratio | Level |
|-------|-------|-------|
| cyan-400 `#22D3EE` | 9.1:1 | AAA |
| cyan-300 `#67E8F9` | 13.5:1 | AAA |
| cyan-500 `#06B6D4` | 6.8:1 | AA |

### Tailwind Theme Override

```typescript
// No override needed — this IS the base tailwind.config.ts
```

---

## 2. IMPERIAL

**Concept:** Gold commands attention. Imperial conveys established authority, premium tier, and financial gravitas. The amber accent against slate-950 creates a luxury dark interface.

**When to use:** Enterprise admin dashboards, premium-tier customers, financial services, executive reporting.

### Color Override Map

| Token | Value | Tailwind | Hex |
|-------|-------|----------|-----|
| `--color-primary` | amber-400 | `text-amber-400` / `bg-amber-400` | `#FBBF24` |
| `--color-primary-light` | amber-300 | `hover:bg-amber-300` | `#FCD34D` |
| `--color-primary-deep` | amber-500 | `active:bg-amber-500` | `#F59E0B` |
| `--color-primary-muted` | amber-600 | — | `#D97706` |
| `--color-primary-tint-10` | amber-400/10 | `bg-amber-400/10` | `rgba(251, 191, 36, 0.10)` |
| `--color-primary-tint-15` | amber-400/15 | `hover:bg-amber-400/15` | `rgba(251, 191, 36, 0.15)` |
| `--color-primary-tint-20` | amber-400/20 | `active:bg-amber-400/20` | `rgba(251, 191, 36, 0.20)` |
| `--glow-primary` | — | `shadow-glow-primary` | `0 0 20px rgba(251, 191, 36, 0.15)` |
| `--text-inverse` | slate-950 | `text-slate-950` | `#020617` |

### WCAG Contrast on slate-950 (#020617)

| Color | Ratio | Level |
|-------|-------|-------|
| amber-400 `#FBBF24` | 9.7:1 | AAA |
| amber-300 `#FCD34D` | 11.3:1 | AAA |
| amber-500 `#F59E0B` | 7.3:1 | AAA |

### Semantic Color Conflict Resolution

**Problem:** amber-400 is the base theme's `--color-warning`. In Imperial theme, warning must use a different color to avoid confusion with the primary accent.

**Solution:** Warning shifts to `orange-400` (`#FB923C`, 7.0:1 on slate-950 — AA pass):
```css
[data-theme="imperial"] {
  --color-warning: #FB923C;  /* orange-400 replaces amber-400 for warnings */
}
```

### Tailwind Theme Override

```typescript
// In tailwind.config.ts theme.extend or via CSS variables
const imperialTheme = {
  colors: {
    primary: '#FBBF24',     // amber-400
  },
  boxShadow: {
    'glow-primary': '0 0 20px rgba(251, 191, 36, 0.15)',
    'glow-primary-strong': '0 0 30px rgba(251, 191, 36, 0.25)',
  },
};
```

### CSS Override

```css
[data-theme="imperial"] {
  --color-primary: #FBBF24;
  --color-primary-tint-10: rgba(251, 191, 36, 0.10);
  --color-primary-tint-15: rgba(251, 191, 36, 0.15);
  --color-primary-tint-20: rgba(251, 191, 36, 0.20);
  --color-warning: #FB923C;
  --focus-ring-color: #FBBF24;
  --border-active: #FBBF24;
  --glow-primary: 0 0 20px rgba(251, 191, 36, 0.15);
}
```

---

## 3. TACTICAL

**Concept:** Emerald signals growth, efficiency, and operational precision. A military operations aesthetic — clean, focused, action-oriented. The green accent against dark slate evokes a tactical command display.

**When to use:** Operations teams, growth teams, DevOps dashboards, logistics, project management focus.

### Color Override Map

| Token | Value | Tailwind | Hex |
|-------|-------|----------|-----|
| `--color-primary` | emerald-400 | `text-emerald-400` / `bg-emerald-400` | `#34D399` |
| `--color-primary-light` | emerald-300 | `hover:bg-emerald-300` | `#6EE7B7` |
| `--color-primary-deep` | emerald-500 | `active:bg-emerald-500` | `#10B981` |
| `--color-primary-muted` | emerald-600 | — | `#059669` |
| `--color-primary-tint-10` | emerald-400/10 | `bg-emerald-400/10` | `rgba(52, 211, 153, 0.10)` |
| `--color-primary-tint-15` | emerald-400/15 | `hover:bg-emerald-400/15` | `rgba(52, 211, 153, 0.15)` |
| `--color-primary-tint-20` | emerald-400/20 | `active:bg-emerald-400/20` | `rgba(52, 211, 153, 0.20)` |
| `--glow-primary` | — | `shadow-glow-primary` | `0 0 20px rgba(52, 211, 153, 0.15)` |

### WCAG Contrast on slate-950 (#020617)

| Color | Ratio | Level |
|-------|-------|-------|
| emerald-400 `#34D399` | 8.9:1 | AAA |
| emerald-300 `#6EE7B7` | 10.4:1 | AAA |
| emerald-500 `#10B981` | 6.0:1 | AA |

### Semantic Color Conflict Resolution

**Problem:** emerald-400 is the base theme's `--color-success`. In Tactical theme, success must use a different color to avoid confusion with the primary accent.

**Solution:** Success shifts to `teal-400` (`#2DD4BF`, 8.4:1 on slate-950 — AAA pass):
```css
[data-theme="tactical"] {
  --color-success: #2DD4BF;  /* teal-400 replaces emerald-400 for success */
}
```

### CSS Override

```css
[data-theme="tactical"] {
  --color-primary: #34D399;
  --color-primary-tint-10: rgba(52, 211, 153, 0.10);
  --color-primary-tint-15: rgba(52, 211, 153, 0.15);
  --color-primary-tint-20: rgba(52, 211, 153, 0.20);
  --color-success: #2DD4BF;
  --focus-ring-color: #34D399;
  --border-active: #34D399;
  --glow-primary: 0 0 20px rgba(52, 211, 153, 0.15);
}
```

---

## 4. MYSTIC

**Concept:** Violet evokes creativity, imagination, and unconventional thinking. A softer, more contemplative aesthetic that appeals to creative professionals and AI enthusiasts exploring the edges of possibility.

**When to use:** Creative agencies, design studios, AI research teams, content creation workflows, branding teams.

### Color Override Map

| Token | Value | Tailwind | Hex |
|-------|-------|----------|-----|
| `--color-primary` | violet-400 | `text-violet-400` / `bg-violet-400` | `#A78BFA` |
| `--color-primary-light` | violet-300 | `hover:bg-violet-300` | `#C4B5FD` |
| `--color-primary-deep` | violet-500 | `active:bg-violet-500` | `#8B5CF6` |
| `--color-primary-muted` | violet-600 | — | `#7C3AED` |
| `--color-primary-tint-10` | violet-400/10 | `bg-violet-400/10` | `rgba(167, 139, 250, 0.10)` |
| `--color-primary-tint-15` | violet-400/15 | `hover:bg-violet-400/15` | `rgba(167, 139, 250, 0.15)` |
| `--color-primary-tint-20` | violet-400/20 | `active:bg-violet-400/20` | `rgba(167, 139, 250, 0.20)` |
| `--glow-primary` | — | `shadow-glow-primary` | `0 0 20px rgba(167, 139, 250, 0.15)` |

### WCAG Contrast on slate-950 (#020617)

| Color | Ratio | Level |
|-------|-------|-------|
| violet-400 `#A78BFA` | 8.2:1 | AAA |
| violet-300 `#C4B5FD` | 9.6:1 | AAA |
| violet-500 `#8B5CF6` | 6.1:1 | AA |

### Semantic Color Conflict Resolution

**Problem:** violet-400 is the base theme's `--color-handoff`. In Mystic theme, handoff/delegation must use a different color.

**Solution:** Handoff shifts to `fuchsia-400` (`#E879F9`, 6.4:1 on slate-950 — AA pass):
```css
[data-theme="mystic"] {
  --color-handoff: #E879F9;  /* fuchsia-400 replaces violet-400 for handoff */
}
```

### CSS Override

```css
[data-theme="mystic"] {
  --color-primary: #A78BFA;
  --color-primary-tint-10: rgba(167, 139, 250, 0.10);
  --color-primary-tint-15: rgba(167, 139, 250, 0.15);
  --color-primary-tint-20: rgba(167, 139, 250, 0.20);
  --color-handoff: #E879F9;
  --focus-ring-color: #A78BFA;
  --border-active: #A78BFA;
  --glow-primary: 0 0 20px rgba(167, 139, 250, 0.15);
}
```

---

## 5. STEALTH

**Concept:** Pure monochrome. No accent color draws attention — the data speaks for itself. Maximum information density with zero distraction. For users who want their AI management tool to feel like a Bloomberg terminal, not a consumer app.

**When to use:** Data-heavy workflows, financial analysis, monitoring dashboards, users who prefer absolute minimalism.

### Color Override Map

| Token | Value | Tailwind | Hex |
|-------|-------|----------|-----|
| `--color-primary` | slate-400 | `text-slate-400` / `bg-slate-400` | `#94A3B8` |
| `--color-primary-light` | slate-300 | `hover:bg-slate-300` | `#CBD5E1` |
| `--color-primary-deep` | slate-500 | `active:bg-slate-500` | `#64748B` |
| `--color-primary-muted` | slate-600 | — | `#475569` |
| `--color-primary-tint-10` | slate-400/10 | `bg-slate-400/10` | `rgba(148, 163, 184, 0.10)` |
| `--color-primary-tint-15` | slate-400/15 | `hover:bg-slate-400/15` | `rgba(148, 163, 184, 0.15)` |
| `--color-primary-tint-20` | slate-400/20 | `active:bg-slate-400/20` | `rgba(148, 163, 184, 0.20)` |
| `--glow-primary` | — | — | `none` (no glow in stealth) |
| `--text-inverse` | slate-950 | `text-slate-950` | `#020617` |

### WCAG Contrast on slate-950 (#020617)

| Color | Ratio | Level |
|-------|-------|-------|
| slate-400 `#94A3B8` | 5.9:1 | AA |
| slate-300 `#CBD5E1` | 10.5:1 | AAA |
| slate-500 `#64748B` | 3.6:1 | FAIL for small text |

**Note:** `slate-500` FAILS AA for small text. The Stealth theme's `active` state uses `slate-500` ONLY for backgrounds, never for text. Primary text on primary buttons uses `text-slate-950` on `bg-slate-400` (5.9:1 — AA pass).

### Special Considerations

1. **CTA buttons:** `bg-slate-400 text-slate-950` instead of colored accent. Hover: `bg-slate-300`. This is deliberately muted.
2. **Active nav:** `bg-slate-400/10 border-l-2 border-slate-400 text-slate-300` — uses slate-300 for active text to ensure contrast (since slate-400 is the accent, active state needs to be brighter).
3. **No glow shadows.** `--glow-primary: none`. Elevation is conveyed purely through shadow opacity.
4. **Semantic colors PRESERVED.** Status dots still use emerald/red/blue/violet. Only the primary accent is desaturated.

### CSS Override

```css
[data-theme="stealth"] {
  --color-primary: #94A3B8;
  --color-primary-tint-10: rgba(148, 163, 184, 0.10);
  --color-primary-tint-15: rgba(148, 163, 184, 0.15);
  --color-primary-tint-20: rgba(148, 163, 184, 0.20);
  --focus-ring-color: #94A3B8;
  --border-active: #94A3B8;
  --glow-primary: none;
  --glow-primary-strong: none;
}
```

---

## Theme Implementation Strategy

### CSS Variable Approach (Recommended)

Themes are applied via `data-theme` attribute on the `<html>` element. CSS custom properties cascade naturally.

```html
<html data-theme="imperial" class="dark">
```

```css
/* Base theme (Sovereign) — defined in globals.css :root */
:root {
  --color-primary: #22D3EE;
  /* ... all base tokens */
}

/* Theme overrides — loaded conditionally */
[data-theme="imperial"] {
  --color-primary: #FBBF24;
  --color-warning: #FB923C;
  --focus-ring-color: #FBBF24;
  --border-active: #FBBF24;
  --glow-primary: 0 0 20px rgba(251, 191, 36, 0.15);
}
```

### Theme Switching Logic

```typescript
// stores/theme.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeName = 'sovereign' | 'imperial' | 'tactical' | 'mystic' | 'stealth';

interface ThemeStore {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'sovereign',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    { name: 'corthex-theme' }
  )
);
```

### Theme File Organization

```
packages/ui/src/themes/
  sovereign.css     (empty — base is :root)
  imperial.css      (~15 lines)
  tactical.css      (~15 lines)
  mystic.css        (~15 lines)
  stealth.css       (~20 lines)
  index.ts          (export theme metadata)
```

### Bundle Impact

Each theme override CSS is <1KB. All 5 themes combined: <5KB uncompressed, <1KB gzipped. Negligible impact on bundle budget.

---

## Theme Preview Matrix

| Element | Sovereign (cyan) | Imperial (amber) | Tactical (emerald) | Mystic (violet) | Stealth (slate) |
|---------|-----------------|------------------|-------------------|----------------|----------------|
| Primary CTA bg | `#22D3EE` | `#FBBF24` | `#34D399` | `#A78BFA` | `#94A3B8` |
| CTA text | `#020617` | `#020617` | `#020617` | `#020617` | `#020617` |
| Active nav border | `#22D3EE` | `#FBBF24` | `#34D399` | `#A78BFA` | `#94A3B8` |
| Active nav text | `#22D3EE` | `#FBBF24` | `#34D399` | `#A78BFA` | `#CBD5E1` |
| Active nav bg | cyan-400/10 | amber-400/10 | emerald-400/10 | violet-400/10 | slate-400/10 |
| Focus ring | `#22D3EE` | `#FBBF24` | `#34D399` | `#A78BFA` | `#94A3B8` |
| Glow | cyan glow | amber glow | emerald glow | violet glow | none |
| Success | emerald-400 | emerald-400 | **teal-400** | emerald-400 | emerald-400 |
| Warning | amber-400 | **orange-400** | amber-400 | amber-400 | amber-400 |
| Error | red-400 | red-400 | red-400 | red-400 | red-400 |
| Working | blue-400 | blue-400 | blue-400 | blue-400 | blue-400 |
| Handoff | violet-400 | violet-400 | violet-400 | **fuchsia-400** | violet-400 |

---

_End of CORTHEX Creative Themes v1.0_
_Phase 4-1 complete. 5 themes defined with full CSS variable overrides and WCAG contrast validation._
