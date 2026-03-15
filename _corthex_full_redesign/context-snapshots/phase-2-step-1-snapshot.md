# Phase 2 Step 1 Context Snapshot — Web Dashboard Deep Analysis Review

**Date:** 2026-03-15
**Status:** PASS (Score 8.5/10 — threshold 7.0)
**Review:** `_corthex_full_redesign/party-logs/phase2-step1-critic-review.md`
**Source:** `_corthex_full_redesign/phase-2-analysis/web-analysis.md`

---

## Winner Confirmed

**Option C "Sovereign Lens" — 55/60**
Build path: **Option A shell (Phase 3) → Option C enhancement (Phase 5)**

### Why C Wins
- Best Sovereign Sage embodiment (Ruler structure + Sage adaptation)
- NEXUS canvas: 1376px (icon-only sidebar 64px → collapses 280px)
- Adaptive context panel per route (Hub defaults to Tracker-open)
- Swiss Grid purity maintained (12-col in main content, panel is additive)
- 55/60 vs 54/60 (Option A) — margin is slim but context panel is genuine differentiator

### Build Sequence
| Phase | Action | Shell |
|-------|--------|-------|
| Phase 3 | Build Option A shell (lowest risk) | 280px sidebar + 1160px content |
| Phase 4 | Build all page components | Against Option A shell |
| Phase 5 | Add context panel mechanism | Migrate to Option C |

---

## Key Specs Confirmed (from Analysis + Critic Review)

### Shell Structure
```
280px sidebar (fixed) + 1160px content (max-width) + 56px top bar
Hub: col-span-8 (output 765px) + col-span-4 (tracker 371px)
NEXUS: full-bleed (sidebar collapses to 64px → 1376px canvas)
```

### Color System (all validated at WCAG AA+)
| Pair | Ratio | Level |
|------|-------|-------|
| slate-50 on slate-950 | 20.1:1 | AAA |
| slate-400 on slate-950 | 5.9:1 | AA |
| cyan-400 on slate-950 | 9.1:1 | AAA |
| violet-400 on slate-950 | 8.2:1 | AAA |
| emerald-400 on slate-950 | 8.9:1 | AAA |
| red-400 on slate-950 | 5.4:1 | AA |

### CSS Custom Properties (confirmed)
```css
:root {
  --color-bg: #020617;        /* slate-950 */
  --color-surface: #0F172A;   /* slate-900 */
  --color-border: #1E293B;    /* slate-800 */
  --color-cyan: #22D3EE;      /* active/primary */
  --sidebar-width: 280px;
  --topbar-height: 56px;
  --content-max: 1160px;
  --nexus-bg: #040D1A;
  --font-ui: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Non-Negotiables for Phase 3
- `w-[280px]` sidebar (NOT `w-72` = 288px)
- `h-14` top bar (56px)
- `bg-slate-950` page background
- `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400` active nav
- `grid grid-cols-12 gap-6` content grid
- Hub: `col-span-8` + `col-span-4`
- NEXUS: full-bleed with route detection
- `tabular-nums` on all numeric displays

---

## Corrections Required for Phase 3

### HIGH Priority (must fix before implementation)

1. **text-slate-500 → text-slate-400**: Hub agent header `{departmentName}` and token count display use slate-500 (3.55:1 fails AA). Replace with slate-400 (5.9:1 passes AA).

2. **prefers-reduced-motion**: Add to globals.css for agent pulse animation and all status-dot animations:
```css
@media (prefers-reduced-motion: reduce) {
  .status-working, .status-delegating { animation: none; opacity: 1; }
}
```

3. **Color-blind safety for status dots**: Status dots use color-only differentiation (blue/emerald/red/slate/violet). Add secondary visual indicator (icon shape, checkmark, X, etc.) per WCAG 1.4.1 (Use of Color).

4. **Font loading**: Replace `@import url(...)` Google Fonts with `@fontsource/inter` and `@fontsource/jetbrains-mono` npm packages. CSS @import is render-blocking.

### MEDIUM Priority (Phase 3 design decisions)

5. **Hub vs Chat visual differentiation**: Hub output stream looks like chat (message bubbles + streaming cursor). Need visual spec that differentiates Hub (command output, terminal-style) from Chat (conversation bubbles). Phase 0-2 Principle 2: "Command, Don't Chat."

6. **CSS width transition → transform**: Context panel and sidebar collapse use `transition: width` which triggers layout reflow every frame. Replace with `transform: translateX()` or CSS grid-template-columns animation for GPU acceleration.

7. **Keyboard focus management**: Skip-to-content link, mobile sidebar focus trap, NEXUS canvas keyboard interaction, context panel focus return — all need specs before Phase 4-2 accessibility audit.

8. **backdrop-filter fallback**:
```css
@supports not (backdrop-filter: blur(4px)) {
  .app-header { background: var(--color-bg); }
}
@media (prefers-reduced-transparency: reduce) {
  .app-header { background: var(--color-bg); backdrop-filter: none; }
}
```

### LOW Priority (specify before implementation)

9. React Router version: pin v6 or v7
10. React Flow: `@xyflow/react` v12 with named imports
11. Sidebar P2/P3 sections: collapsible (25+ items exceeds 712px viewport on 768px monitors)
12. State management: Zustand store structure + TanStack Query integration pattern for streaming/polling

---

## Sidebar Nav Structure (Confirmed — ~25 items)

```
COMMAND (P0)     — Hub, NEXUS, Dashboard, Chat
ORGANIZATION (P1) — Agents, Departments, Jobs/ARGOS [badge], Reports
TOOLS (P2)       — SNS, Trading, Messenger, Library, AGORA, Files
SYSTEM (P3)      — Costs, Performance, Activity Log, Tiers, Ops Log, Classified, Settings
[User Footer]    — Avatar + Role Badge
```

Note: P2+P3 sections should be collapsible by default on <900px viewport height.

---

## Connections to Phase 3

Phase 3 (Design System) receives:
1. **Token definitions**: All CSS custom properties above → `tailwind.config.ts` theme extension
2. **Component inventory**: ~97 web components (from analysis Section 6.2 file structure)
3. **Shell first**: AppShell.tsx, Sidebar.tsx, TopBar.tsx as first implementation targets
4. **Phase 0 guard rails**: Non-negotiables list must be enforced as Phase 3 lint rules

Phase 3 must produce:
- `tailwind.config.ts` with all CORTHEX custom values
- `globals.css` with corrected font loading + animations + accessibility
- Shell component structure (Option A spec-exact)
- Design token documentation for Stitch prompt engineering (Phase 5)
