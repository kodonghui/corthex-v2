# Phase 1-Step 1 Context Snapshot — Web Layout Research
**Date:** 2026-03-15
**Status:** PASS (Score: 8.0/10 — threshold 7.0)
**Review:** `_corthex_full_redesign/party-logs/phase1-step1-critic-review.md`
**Source:** `phase-1-research/web-dashboard/web-layout-research.md`

---

## Winning Option Recommendation

**Primary: Option C — Sovereign Lens** (9.1/10 in research scoring)
**Fallback / Phase 2 starting point: Option A — Command Shell** (9.0/10)

**Recommended implementation path:**
1. Build Option A shell first (proven, lowest risk, Phase 0 spec-exact)
2. Add context panel mechanism as progressive enhancement
3. Context panel becomes the differentiating "premium" feature of v2

**Rationale for Option C as ultimate target:**
- Best NEXUS canvas quality: icon-only sidebar (64px) → 1376px canvas (vs 1160px in A)
- Most aligned with Sovereign Sage: interface adapts intelligently to user context
- Context panel replaces col-span-4 Tracker at shell level (cleaner than grid juggling)

**Why Option A is the Phase 2 starting point:**
- Option C has 3 high-severity technical issues requiring engineering work before implementation
- Option A is structurally identical to Option C minus the context panel mechanism
- Migrating A → C is additive (no structural rework)

---

## Key Layout Specs (Exact Tailwind)

### Shell Structure (Option A — implements first)

```tsx
// Root shell
<div className="flex h-screen bg-slate-950 overflow-hidden">

  {/* Sidebar — 280px, fixed */}
  <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0
                    w-[280px] z-50
                    bg-slate-950 border-r border-slate-800">
    <SidebarContent />
  </aside>

  {/* Main area */}
  <div className="flex flex-1 flex-col lg:pl-[280px] min-h-screen">

    {/* Top bar — 56px */}
    <header className="sticky top-0 z-40 flex h-14 items-center
                       border-b border-slate-800 bg-slate-950/95
                       px-6 gap-x-4">
      <TopBarContent />
    </header>

    {/* Scrollable content */}
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1160px] px-6 py-6">
        {children}
      </div>
    </main>
  </div>
</div>
```

### Active Nav Item

```tsx
isActive
  ? "bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400 -ml-[2px] pl-[10px]"
  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
```

### Hub Page Grid (Phase 0 exact spec)

```tsx
<div className="grid grid-cols-12 gap-6 h-[calc(100vh-56px-48px)]">
  <div className="col-span-12 lg:col-span-8 flex flex-col">
    {/* Output: 765px at 1160px content width */}
    <HubOutputPanel />
  </div>
  <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
    {/* Tracker: 371px — grid-derived (col-span-4) */}
    <HubTrackerPanel />
  </div>
</div>
```

### NEXUS Full-Bleed (Option A)

```tsx
const isNexus = pathname === '/nexus';
<main className={cn("flex-1", isNexus ? "overflow-hidden p-0" : "overflow-y-auto")}>
  {isNexus ? children : (
    <div className="mx-auto max-w-[1160px] px-6 py-6">{children}</div>
  )}
</main>
// Canvas: 1440 - 280 = 1160px × 100vh
```

### CSS Design Tokens

```css
:root {
  --color-bg: #020617;        /* slate-950 */
  --color-surface: #0F172A;   /* slate-900 */
  --color-border: #1E293B;    /* slate-800 */
  --color-text-1: #FFFFFF;
  --color-text-2: #CBD5E1;    /* slate-300 */
  --color-text-3: #94A3B8;    /* slate-400 */
  --color-text-4: #64748B;    /* slate-500 — NOT for small text (WCAG fail) */

  --color-cyan: #22D3EE;      /* active/primary */
  --color-violet: #A78BFA;    /* handoff */
  --color-emerald: #34D399;   /* success */
  --color-amber: #FBBF24;     /* warning */
  --color-red: #F87171;       /* error */
  --color-blue: #60A5FA;      /* working */

  --sidebar-width: 280px;
  --topbar-height: 56px;      /* h-14 */
  --content-max-width: 1160px;
  --grid-cols: 12;
  --grid-gap: 24px;            /* gap-6 */
}
```

---

## Critical Issues for Phase 2 to Resolve

### 🔴 High Priority (must fix before implementation)

1. **WCAG AA contrast failure** — `text-slate-500` (`#64748B`) on `slate-950` (`#020617`) = ~3.55:1 contrast ratio (fails 4.5:1 for small text). Nav section headers must use `text-slate-400` minimum.

2. **Tailwind CSS4 compatibility** — All research code uses CSS3 API. If project targets CSS4, `globals.css` custom properties must move to `@theme` directive. Custom animation syntax `animate-[...]` may change. Must verify before implementation.

3. **Option C code splitting** — If Option C is implemented, all context panel components (`TrackerPanel`, `NexusLayerPanel`, etc.) MUST use `React.lazy()` to preserve route-level code splitting. Without this, all panel bundles load at app init.

4. **Option C NEXUS transition timing** — The 300ms sidebar-collapse animation causes React Flow container to continuously resize, triggering ResizeObserver on every frame. Solution: use `onTransitionEnd` callback before mounting/resizing React Flow canvas to preserve 60fps NFR.

### 🟡 Medium Priority (address in Phase 2 spec)

5. **`text-[10px]` section labels** — Replace with `text-xs` (12px) minimum. Korean text at 10px is below legibility threshold.

6. **Missing nav items** — Add to sidebar design: P3 items (Costs, Performance, Activity Log, Classified, Tiers, Ops Log) and P2 item (Messenger). Decide whether these are sub-items under existing sections or separate nav entries.

7. **Phase 0 col-span-8/col-span-4 literal compliance** — Confirm whether Phase 2 should treat the Hub's Tracker as:
   - Grid-level (col-span-4 = 371px) — Option A only
   - Shell-level (320px or 360px fixed panel) — Options B, C
   - **Recommendation:** Grid-level (Option A) is the only mathematically justified approach

8. **Option C context panel toggle UX** — If Option C proceeds, the `PanelRight` icon needs clear labeling per-route ("Tracker", "Filters", "Agent Config", etc.) visible at `xl:inline` breakpoint, and the panel should default-open on Hub with a persistent state preference.

---

## Sidebar Nav Structure (Complete — fills Phase 0 P0–P3 hierarchy)

```
COMMAND (P0)
  ├─ Hub
  ├─ NEXUS
  ├─ Dashboard
  └─ Chat

ORGANIZATION (P1)
  ├─ Agents
  ├─ Departments
  ├─ Jobs / ARGOS  [badge: active count]
  └─ Reports

TOOLS (P2)
  ├─ SNS
  ├─ Trading
  ├─ Messenger
  ├─ Library
  ├─ AGORA
  └─ Files

SYSTEM (P3)
  ├─ Costs
  ├─ Performance
  ├─ Activity Log
  ├─ Tiers
  ├─ Ops Log
  ├─ Classified
  └─ Settings

[User Avatar + Role Badge]
```

---

## Connections to Phase 2

Phase 2 will receive this snapshot and must:

1. **Confirm winning option** (A or C) — Phase 2 architect makes final call based on timeline
2. **Define full Hub page spec** with exact pixel measurements for output panel, input area, and tracker
3. **Define mobile page specs** — NEXUS is "not available on mobile" per research; this must be confirmed and the redirect message designed
4. **Define context panel spec (if Option C)** — What does each route's context panel contain? This requires design decisions for all ~20 routes
5. **Score options against 7 Design Principles** (this is Phase 2's primary job per pipeline)

**Phase 2 research inputs:**
- This snapshot (layout decisions)
- Phase 0-2 snapshot (brand/color/typography)
- Phase 0-1 snapshot (technical constraints)

---

## Discarded Options

**Option B — Intelligence Hub (7.75/10):** Not recommended.
- 840px main content at 1440px is too narrow for 12-col grid usage
- 3-panel mobile is architecturally complex
- The Tracker permanence advantage is achievable via Option C's context panel (defaults open on Hub)
- 320px tracker panel has no mathematical derivation

---

*Snapshot by: Combined Critic Panel*
*Phase: 1 — Research*
*Step: 1 — Web Layout*
*Next step: Phase 1-Step 2 — Mobile/Responsive or Component Research*
