# Phase 1-1: Web Dashboard Layout Research

**Date**: 2026-03-12
**Step**: Phase 1 — Research, Step 1-1
**Status**: Round 2 — Fixes Applied
**Output**: Web dashboard layout reference analysis + TOP 3 layout options for CORTHEX

---

## CORTHEX Design Constraints Recap (from Phase 0)

Before analysis: key constraints that filter all references:

| Constraint | Value |
|------------|-------|
| Viewport minimum | 1280px — desktop-only, no mobile/responsive layouts |
| Primary product | Hub: 3-column `[SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80]` |
| Admin product | 2-column `[Sidebar w-60][Main flex-1]` with optional right detail panel |
| Brand | Military Precision × AI Intelligence — NOT chatbot, NOT playful |
| Primary accent | Indigo-600 `#4F46E5` |
| Dark mode | First-class reference design |
| Sidebar palette | App: `bg-zinc-900`, Admin: `bg-zinc-900 border-r` |
| Font | Work Sans (NOT Inter) |
| Information density | Dense — `p-4` standard, no `p-12` decorative whitespace |

---

## Part 1: Reference Products — 10 Analyzed

---

### 1. Anthropic Console (`console.anthropic.com`)

**URL**: https://console.anthropic.com/dashboard
**Source**: Live platform + Anthropic UI Kit (Figma community: `figma.com/community/file/1445575023384366559/anthropic-ui-kit`)

**Layout Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│ Logo + Nav tabs (top)    │  User/org switcher (top-right)   │
├──────────────────────────┴─────────────────────────────────┤
│  Left sidebar (project list, ~240px fixed)                  │
│  ├── Workbench split-screen:                                │
│  │   [Left: Prompt input + system prompt + model params]   │
│  │   [Right: Response stream, cost badge, token count]     │
└─────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Warm cream (`#F5F0E8`) background with terracotta orange accent. NOT dark-first — diverges from CORTHEX's direction. Theme variable system (CSS custom properties, `data-theme="claude"`).

**Navigation**: Top-level tabs (Dashboard, Workbench, Models, API Keys, Settings) + left sidebar for project/workspace switching.

**Key UX Pattern**:
- **Workbench split-screen** is the standout design: left side = configuration (system prompt, model selection, parameters), right side = live response with streaming. This "configure + observe" split maps directly to CORTHEX's Soul editor + agent response flow.
- Cost badge on response completion (token count + cost shown inline) — CORTHEX must replicate this pattern in Tracker.

**What works for CORTHEX**:
- The configure-left / observe-right split is the DNA of CORTHEX's Hub: Session history (configure context) + ChatArea (observe response). The Tracker panel extends this to three columns.
- Inline cost metadata on completion (never buried) = CORTHEX's Principle 2 (Depth is Data).

**What to avoid**:
- Warm/cream palette (CORTHEX uses cool zinc dark).
- Top navigation tabs as primary nav (CORTHEX uses sidebar-first navigation).

---

### 2. OpenAI Platform (`platform.openai.com`)

**URL**: https://platform.openai.com
**Source**: Public platform + developer documentation

**Layout Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~240px)  │  Main content area (flex-1)       │
│  ├── API Keys           │  ┌─────────────────────────────┐  │
│  ├── Usage & Billing    │  │ Usage dashboard:            │  │
│  ├── Projects           │  │ [KPI cards top row]         │  │
│  ├── Team               │  │ [Time-series chart middle]  │  │
│  └── Settings           │  │ [Filterable table bottom]   │  │
│                         │  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Light default with dark sidebar (`#1a1a2e`). Monochrome with green accent for active/success states.

**Navigation**: Left sidebar (flat list, ~12 items) + breadcrumbs in content header.

**Key UX Pattern**:
- **Hierarchical cost tracking**: project-level → model-level → time-interval drill-down. Granular filters (1-minute TPM resolution). CORTHEX's Dashboard/Cost Analytics should match this granularity.
- **RBAC-gated views**: certain menu items only appear for organization owners vs. project members. CORTHEX admin vs. app sidebar split already handles this via separate SPAs.

**What works for CORTHEX**:
- KPI cards → time-series chart → filterable table = standard enterprise data layout. Correct for CORTHEX's Dashboard (`/dashboard`) and Cost Analytics (`/cost-analytics`).
- Flat sidebar structure with ~12 items = manageable. CORTHEX admin sidebar has 18 items (flat), which is within range.

---

### 3. Weights & Biases (W&B) Dashboard

**URL**: https://wandb.ai / https://docs.wandb.ai/guides/app/
**Source**: Product docs + W&B LEET terminal UI documentation

**Layout Pattern** (web dashboard: 2-column sidebar + charts; LEET terminal: 3-pane TUI):
```
┌──────────────────────────────────────────────────────────────────────┐
│  LEFT PANE (run overview)  │  CENTER PANE (metrics grid)  │  RIGHT   │
│  Run config, metadata      │  Real-time loss/accuracy     │  System  │
│  Hyperparameter summary    │  charts (auto-refresh)       │  CPU/GPU │
│  ~280px fixed              │  flex-1                      │  ~240px  │
└──────────────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Dark-first (`#0a0a0f` near-black background), yellow `#FFC933` accent for active runs, monochrome metric labels.

**Navigation**: Left sidebar (project/team switcher + flat run list) + tabbed top navigation for workspace sections.

**Key UX Pattern**:
- **W&B web dashboard** (wandb.ai): primarily 2-column (sidebar run list + main chart area with auto-refresh metrics panels). The web UI is information-dense but not a 3-column persistent layout.
- **W&B LEET terminal UI** (separate product, NOT the web dashboard): a TUI (text user interface) for terminal-based ML run monitoring. Its 3-pane layout (Context left + Live metrics center + System right) is a relevant *conceptual* reference for real-time 3-column monitoring — but it runs in a terminal, not a browser. The web precedent for 3-pane always-visible layout is better drawn from **Grafana** (https://grafana.com): dashboards with left panel explorer + center time-series grid + right variable/annotation panel — confirmed web-based 3-column pattern.
- **Real-time streaming metrics**: W&B auto-refresh without full page reload. Step-by-step cascading updates = direct analog to CORTHEX Tracker SSE events.

**What works for CORTHEX**: W&B's real-time streaming pattern validates the SSE update model. Grafana's web-based 3-panel layout validates the always-visible 3-column approach for professional monitoring tools at ≥1280px.

---

### 4. Linear App Dashboard (2025 Redesign)

**URL**: https://linear.app / https://linear.app/now/how-we-redesigned-the-linear-ui
**Source**: Linear's official redesign retrospective (2025)

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~220px)  │  Header tabs (top of content)       │
│  Team/Project tree      │  ┌───────────────────────────────┐  │
│  Inbox, Triage          │  │ Content area                  │  │
│  Projects               │  │ (issues list / board / chart) │  │
│  Cycles                 │  │ Modular dashboard widgets     │  │
│  Roadmap                │  │ Charts + tables + KPI rows    │  │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Inverted L-navigation. LCH color space (not HSL) — 3 core variables: base color, accent, contrast. Reduced from 98 theme variables to 3. Both light and dark modes. Inter Display (headings) + Inter Regular (body).

**Navigation**: Sidebar-primary (team/project hierarchy) + horizontal tabs in content area for sub-views (All Issues / Active / Backlog / etc.).

**Key UX Pattern**:
- **Visual noise reduction**: 2025 redesign specifically reduced icon proliferation, cleaned up spacing, standardized component library. Result: same density, less visual clutter.
- **Modular dashboard widgets**: Drag-and-drop charts, tables, and single-number metrics on a configurable dashboard surface. Not fixed-layout.
- **Global filters + saved filters**: Applied across all views, reducing repetitive interaction.

**What works for CORTHEX**:
- Sidebar + content tabs pattern works well for Admin (Departments → sub-tabs: List | NEXUS | Budget).
- Visual noise reduction principle = CORTHEX's "Hierarchy Through Typography, Not Color."
- Modular dashboard idea applies to `/dashboard` page.

---

### 5. Vercel Dashboard (New Dashboard 2026)

**URL**: https://vercel.com/try/new-dashboard
**Source**: Vercel official announcement + rollout documentation

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~220px collapsible)  │  Main content (flex-1)  │
│  Team switcher (top)                │  Sticky header tabs:    │
│  Project list                       │  Projects / Deploy /    │
│  Deployments                        │  Logs / Analytics /     │
│  Analytics                          │  Observability / etc.   │
│  [Collapse button]                  │                         │
│                                     │  Content grid:          │
│                                     │  [Project cards / list] │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Light default, near-black sidebar when dark. `#000000` / `#ffffff` — minimal chrome, content-forward.

**Navigation**: Collapsible sidebar (saves ~220px for main content). "Find" search for fast project/tab navigation. Three-dot settings menu per item. Jump navigation (keyboard-first).

**Key UX Pattern**:
- **Context-preserving project switching**: switching between projects keeps current tab/page (e.g., stay on Logs when switching from project A to B). CORTHEX Admin's company switcher should do the same.
- **Collapsible sidebar**: when collapsed, sidebar icon-strip `w-12` frees up 200px for content. CORTHEX's TrackerPanel collapses similarly.
- **Consistent tab behavior**: tabs persist across team and project context — reduces disorientation.

**What works for CORTHEX**:
- Company dropdown (Admin sidebar top) + context-preserving navigation = Vercel's project switcher model.
- Collapsible sidebar icon-strip pattern = CORTHEX TrackerPanel collapse to `w-12`.

---

### 6. Supabase Dashboard

**URL**: https://supabase.com
**Source**: Supabase UI component library docs + platform

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~240px)  │  Main area (flex-1)                 │
│  Project switcher (top) │  ┌──────────────────────────────┐  │
│  Table Editor           │  │ Header: page title + actions  │  │
│  SQL Editor             │  ├──────────────────────────────┤  │
│  Auth                   │  │ Content: table / editor /     │  │
│  Storage                │  │ chart depending on section    │  │
│  Edge Functions         │  └──────────────────────────────┘  │
│  Settings               │                                     │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Dark-first (`#1c1c1c` background, `#3ecf8e` green accent for Supabase brand). Tailwind CSS 4 + Radix UI component system. Customizable dashboard widgets.

**Navigation**: Flat sidebar (~10 major items) + project switcher dropdown at top. Content area header has breadcrumb + action buttons.

**Key UX Pattern**:
- **SQL Editor as primary power tool**: full-screen split (editor left, results table right). Tabbed saved queries. This is the archetype for CORTHEX's Soul Editor (CodeMirror left, preview right).
- **Flat sidebar with clear section separation**: no accordion groups — all items visible. Works because ≤12 items. CORTHEX Admin has 18 items (may need light grouping or section dividers).

**What works for CORTHEX**:
- SQL Editor split-screen = Soul Editor pattern (CodeMirror left + live preview right).
- Dark-first with accent color for interactive elements.

---

### 7. Neon Serverless Console

**URL**: https://neon.tech
**Source**: Neon documentation + console UI

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~240px)  │  Main SQL editor + result panel     │
│  Project list (top)     │  ┌──────────────────────────────┐  │
│  Branches               │  │ SQL editor (flex-1)           │  │
│  Tables                 │  ├──────────────────────────────┤  │
│  Roles                  │  │ Results table (flex bottom)   │  │
│  Settings               │  └──────────────────────────────┘  │
│                         │  Right panel: metrics / history     │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Dark with cool neutrals (`#0d0d0d` bg, `#00e699` green accent). Clean, developer-focused.

**Key UX Pattern**: Vertical split (editor top, results bottom) with optional right metrics panel. Contextual action buttons in header aligned right. Branch/version indicator always visible.

---

### 8. shadcn/ui Dashboard Examples

**URL**: https://ui.shadcn.com/examples/dashboard
**Source**: Official shadcn/ui component showcase

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Header (sticky h-14, z-50, bg-background border-b)            │
│  Logo + Nav tabs          │  Breadcrumb + User menu (right)   │
├───────────────────────────┴───────────────────────────────────┤
│ Sidebar (SidebarProvider, collapsible ~220px)                  │
│  Inbox / Triage           │  Main: SidebarInset               │
│  Projects (nested)        │  px-6 padding                     │
│  Team / Settings          │  12-column grid or flex cards     │
└───────────────────────────────────────────────────────────────┘
```

**CSS Variables**:
- `--header-height: calc(var(--spacing) * 14)` = 56px
- Dark bg: `#09090b` (near-black), light: `#ffffff`
- Z-layer: header `z-50`, layout `z-10`
- `SidebarProvider` handles collapse state

**Color Scheme**: System-neutral (Geist/Inter fonts). Zinc-based neutrals, CSS variable theme tokens. Closest OSS reference to CORTHEX's zinc palette.

**Key UX Pattern**:
- Component-level collapse via `SidebarProvider` — no custom state logic needed.
- Nested folder structures in sidebar (Projects → sub-items) = CORTHEX's nav group hierarchy.
- Metric cards: `Total Revenue / New Customers / Active Accounts / Growth Rate` = CORTHEX's Dashboard cost/usage cards.

**What works for CORTHEX**: shadcn/ui's zinc palette, component-driven sidebar, and card grid are the closest OSS match. CORTHEX's `@corthex/ui` library should be compatible with shadcn patterns.

---

### 9. CrewAI Studio

**URL**: https://crewai.com
**Source**: CrewAI documentation + platform screenshots

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Sidebar (left, ~260px)  │  Visual workflow canvas (flex-1)    │
│  Crews list             │  ┌──────────────────────────────┐  │
│  Agents                 │  │ Drag-drop node editor        │  │
│  Tasks                  │  │ [Agent nodes + connections]  │  │
│  Tools                  │  └──────────────────────────────┘  │
│  Deployments            │  Bottom panel: execution logs       │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Light primary with dark canvas area. Blue `#2563eb` accent. Material-adjacent component style.

**Key UX Pattern**:
- **Canvas-split layout**: sidebar for entity list + main canvas for visual workflow. Closest competitor to CORTHEX NEXUS layout.
- **Execution logs bottom panel**: when a crew runs, logs stream in bottom panel without leaving canvas. CORTHEX Hub's Tracker is a more refined version (full right column vs. bottom drawer).
- **Agent configuration right panel**: clicking an agent node opens a right-side config panel (name, role, backstory, tools). This is CORTHEX's Agent detail drawer pattern.

**What works for CORTHEX**: Canvas + sidebar + execution panel trifecta = NEXUS architecture reference. The right-panel-for-entity-config pattern is confirmed by multiple products.

---

### 10. AutoGen Studio

**URL**: https://microsoft.github.io/autogen/stable/
**Source**: Microsoft AutoGen documentation

**Layout Pattern**:
```
┌───────────────────────────────────────────────────────────────┐
│ Top header (Microsoft branding)                               │
├───────────────────────────────────────────────────────────────┤
│ Left tabs (vertical) │  Config panel (center)  │  Test (right)│
│  Team                │  Agent list + settings  │  Chat panel  │
│  Agent               │  Tool assignments       │  Debug view  │
│  Tool                │  Model config           │              │
│  Model               │                         │              │
└───────────────────────────────────────────────────────────────┘
```

**Color Scheme**: Light Microsoft Fluent design. Professional but generic.

**Key UX Pattern**:
- **3-panel setup → test flow**: configure left/center, test right. This matches CORTHEX Admin's "Configure agent → Preview Soul → Test response" flow.
- **Vertical tab strip**: Icon-only left strip for section switching saves horizontal space. CORTHEX Admin doesn't need this (has 18 items in full sidebar) but icon strip pattern is relevant for TrackerPanel collapse.

---

## Part 2: Cross-Reference Analysis

### Layout Patterns Frequency

| Pattern | Products Using It | CORTHEX Relevance |
|---------|-----------------|-------------------|
| 2-column fixed sidebar + main | OpenAI, Supabase, Neon, shadcn | Admin SPA standard |
| 3-column persistent | Grafana (web), Anthropic Workbench, W&B LEET (terminal TUI reference) | Hub SPA — PRIMARY TARGET |
| Collapsible sidebar | Vercel, shadcn SidebarProvider | TrackerPanel collapse pattern |
| Canvas + sidebar + config panel | CrewAI Studio, LangFlow | NEXUS Canvas layout |
| Inverted L (sidebar + top tabs) | Linear, Vercel | Admin sub-navigation pattern |

### Dark Mode Usage

| Product | Dark Mode Priority |
|---------|------------------|
| W&B | Dark-first (analytics / professional) |
| Neon | Dark-first (developer tool) |
| Supabase | Dark-first (database admin) |
| Anthropic Console | Light-default (warm cream) |
| Linear | Both equally (user-selected) |
| shadcn/ui | Both equally (CSS variables) |

**Conclusion**: Dark-first is the standard for developer-grade and monitoring-grade tools. CORTHEX's dark-first positioning is confirmed by competitive precedent.

### Information Density Comparison

| Product | Density Level | Sidebar Items | Columns |
|---------|-------------|--------------|---------|
| W&B 3-pane | Very High | ~8 | 3 |
| Linear | High | ~12 | 2 |
| Vercel | Medium-High | ~10 | 2 |
| OpenAI | Medium | ~8 | 2 |
| CORTHEX App target | High | 27 (grouped) | 3 (Hub) / 2 (others) |
| CORTHEX Admin target | High | 18 (flat) | 2 + optional right panel |

---

## Part 3: TOP 3 Layout Options for CORTHEX

---

### Option A: Fixed Command Center (3-Column Persistent)

**Inspired by**: W&B 3-pane terminal, Anthropic Workbench split, command center monitoring tools

**Core philosophy**: All mission-critical panels always visible. No hide/show toggling for primary panels at working viewport. The commander sees everything simultaneously.

```
ASCII Layout Diagram (1440px viewport, Hub page):

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ APP SIDEBAR (w-60 = 240px)   SESSION PANEL (w-64 = 256px)   CHAT AREA (flex-1 ≈ 624px) TRACKER (w-80 = 320px)│
│                              │                              │                              │
│ 🏠 홈                        │ ┌──── Sessions ────────┐    │ ┌──── ChatArea ──────────┐  │ ┌── Tracker ────────┐ │
│ 🔗 허브 ←active              │ │ Session 1 (active)   │    │ │                        │  │ │ LIVE CHAIN        │ │
│ 🎖️ 티어                      │ │ Session 2            │    │ │ [AI response stream]   │  │ │                   │ │
│ ─────────────────            │ │ Session 3            │    │ │                        │  │ │ ●비서실장 (D1)   │ │
│ 💬 AGORA                     │ └──────────────────────┘    │ │ [Message 1]            │  │ │  → CIO (D2) ✓     │ │
│ 📈 대시보드                   │                              │ │ [Message 2]            │  │ │  → 전문가 (D3) ●  │ │
│ 🗣️ ARGOS                     │ ┌──── Agent Status ────┐    │ │                        │  │ │                   │ │
│ 📄 라이브러리                 │ │ 비서실장 ● online    │    │ └────────────────────────┘  │ │ Cost: $0.0042     │ │
│ 📁 파일                       │ │ CIO ● online         │    │                              │ │ Tokens: 1,240     │ │
│ ...                          │ │ 전문가 ○ idle        │    │ ┌──── Input ─────────────┐  │ └───────────────────┘ │
│                              │ └──────────────────────┘    │ │ [textarea]     [submit]│  │                       │
│                              │                              │ └────────────────────────┘  │ (expanded w-80 on    │
│                              │                              │                              │  first handoff SSE)  │
└────────────────────────────────────────────────────────────────────────────────────────┘

Width math at 1440px:
App Sidebar: w-60 = 240px
Session Panel: w-64 = 256px
Tracker Panel: w-80 = 320px (expanded) OR w-12 = 48px (collapsed)
Chat Area (expanded tracker): flex-1 = 1440 - 240 - 256 - 320 = 624px ✓
Chat Area (collapsed tracker): flex-1 = 1440 - 240 - 256 - 48 = 896px ✓
```

**Tailwind CSS Grid Structure**:
```tsx
// Root app shell (non-Hub pages)
<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar className="w-60 shrink-0" />
  <main className="flex-1 overflow-auto">
    {/* Page content */}
  </main>
</div>

// Hub page (3-column override)
<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar className="w-60 shrink-0" />
  {/* ARIA: nav for session list, main for primary chat, aside for live tracker */}
  <nav aria-label="Sessions" className="w-64 shrink-0 border-r border-zinc-800">
    <SessionPanel />
  </nav>
  <main className="flex-1 min-w-0 flex flex-col">
    <ChatArea />
  </main>
  <aside
    role="complementary"
    aria-label="Handoff Tracker"
    aria-live="polite"
    aria-atomic="false"
    className={cn(
      "shrink-0 border-l border-zinc-800",
      "transition-[width] duration-250 ease-in-out motion-reduce:transition-none",
      hasActiveHandoff ? "w-80" : "w-12"
    )}
  >
    <TrackerPanel />
  </aside>
</div>

// SSE step rows within TrackerPanel (motion-reduce applied):
// className="transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"

// Admin shell (2-column with optional right detail)
<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AdminSidebar className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-800" />
  <main className="flex-1 overflow-auto">
    {/* Admin page content */}
  </main>
</div>
```

**Option A — NEXUS Canvas State** (1440px viewport, Admin NEXUS page):

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN SIDEBAR (w-60 = 240px)  │  CANVAS AREA (flex-1 = 1200px)  │  CONFIG (w-96*)  │
│                                │                                  │  *slide-in only  │
│ Company: ACME Corp ▼           │ ┌─────────────────────────────┐ │                  │
│ ─────────────────────          │ │   ReactFlow Canvas          │ │ ┌─────────────┐  │
│ 🏗️ 조직관리                    │ │                             │ │ │ Agent: CTO  │  │
│ 🤖 에이전트 ←active            │ │  [비서실장]──────[CIO]      │ │ │ Tier: T1    │  │
│ 👥 직원관리                    │ │       │            │         │ │ │ Soul: ...   │  │
│ 🎖️ 티어설정                    │ │  [전략팀장]  [CTO]──[개발자] │ │ │ [Edit Soul] │  │
│ ⏰ ARGOS                       │ │                             │ │ │ [Save] [X]  │  │
│ 🔍 NEXUS ←active               │ │  [zoom controls bottom-left]│ │ └─────────────┘  │
│ ...                            │ └─────────────────────────────┘ │                  │
│                                │  bg-zinc-950 (canvas bg)        │  (w-96=384px     │
│                                │                                  │   visible when   │
│                                │  Canvas only: 1440-240=1200px    │   node selected) │
└─────────────────────────────────────────────────────────────────────────────────────┘

NEXUS width math at 1440px:
Admin sidebar: w-60 = 240px
Canvas (no config panel): flex-1 = 1440 - 240 = 1200px ✓
Canvas (with config panel): flex-1 = 1440 - 240 - 384 = 816px ✓ (sufficient for org chart)
Config panel: absolute positioned w-96, does NOT reflow canvas layout
```

**How it handles CORTHEX-specific features**:

| Feature | Solution |
|---------|---------|
| **Sidebar nav** | App sidebar: emoji icons + grouped nav (업무/운영/시스템). Admin sidebar: flat 18 items with section dividers (`hr border-zinc-800`). Both `w-60 fixed` |
| **Hub 3-column** | Exact spec: `flex [w-60][nav w-64][main flex-1][aside w-80]`. TrackerPanel auto-expands on first `handoff` SSE event. Collapses to icon strip `w-12` when idle |
| **Modals** | Headless UI dialog: `fixed inset-0 z-50 bg-black/50 flex items-center justify-center`. Entity detail drawers slide in from right: `fixed right-0 top-0 h-full w-[480px] bg-zinc-900 border-l border-zinc-700 z-40 translate-x-full → translate-x-0 transition-transform duration-250 motion-reduce:transition-none` |
| **Notifications** | Toast stack: `fixed bottom-4 right-4 z-50 flex flex-col gap-2`. Agent alerts: red/amber/green inline in TrackerPanel |
| **NEXUS canvas** | Full-bleed: `flex-1 overflow-hidden relative` container with `ReactFlow` filling 100%. Config panel: `absolute right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-800 z-10 transition-transform duration-250 motion-reduce:transition-none` |

**Breakpoint strategy** (desktop-only, no responsive collapse):
- `min-width: 1280px` enforced at root. Below 1280px: "Please use desktop" overlay.
- Only collapsing: TrackerPanel `w-80 ↔ w-12` (based on handoff state, not viewport).
- No other responsive behavior.

**Pros for CORTHEX**:
- Exact match to Phase 0 Hub 3-column spec
- Always-visible Tracker = CORTHEX's #1 emotional moment (Principle 4: Commander's View)
- W&B 3-pane precedent validates this pattern for professional real-time monitoring tools
- Simple `flex` layout — no complex grid math, no hydration issues
- TrackerPanel auto-expand creates natural moment of product discovery

**Cons for CORTHEX**:
- At 1280px minimum viewport, Chat area = only 464px (tight). For context: GitHub renders markdown prose at ~740px; comfortable minimum for CORTHEX's 12-page investment reports with tables and code blocks is ~600px. At 464px, markdown tables will wrap aggressively. Recommendation: treat 1440px as the soft-minimum for Hub (`min-width: 1440px` on the Hub route with a "best viewed at 1440px+" notice below), while 1280px remains the app-wide minimum for non-Hub pages
- TrackerPanel always reserves space (even when collapsed to 48px) — at 1280px this leaves Chat area only 464px even when tracker is idle
- Requires disciplined width discipline: sidebar + session panel + tracker all fixed means ChatArea must be flexible enough

---

### Option B: Adaptive Commander Dashboard (Context-Aware Panels)

**Inspired by**: Linear 2025 redesign, Vercel new dashboard collapsible sidebar, shadcn SidebarProvider

**Core philosophy**: Panel widths adapt to context. When user is in Hub idle (no active handoffs), ChatArea maximizes. When NEXUS is active, sidebar can compress. Panels respond to task, not just user toggle.

```
ASCII Layout Diagram (1440px, Hub page — active state):

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  APP SIDEBAR (w-60=240px fixed)                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐│
│  │ INNER LAYOUT (flex h-[calc(100vh)])                                                  ││
│  │ SESSION PANEL (w-64=256px)  │  CHAT AREA (flex-1 adaptive)  │  TRACKER (w-80 = 320) ││
│  │                             │                               │                        ││
│  │ [Sessions + Agent Status]   │  [Chat messages]              │  [Handoff chain]       ││
│  │                             │  [Input bar]                  │  [Cost: $0.0042]       ││
│  └──────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                          │
│  HUB IDLE STATE (no active handoffs):                                                    │
│  SESSION(w-64) │ CHAT AREA (expands to flex-1 + 320px absorbed) │ TRACKER(icon w-12)    │
│                                                                                          │
│  NEXUS CANVAS (full content area):                                                       │
│  [App Sidebar w-60] │ [Canvas flex-1 ReactFlow] │ [Entity Config Panel w-96 slide-in]   │
└──────────────────────────────────────────────────────────────────────────────────────────┘

Hub idle: Chat area = 1440 - 240 - 256 - 48 = 896px (generous)
Hub active: Chat area = 1440 - 240 - 256 - 320 = 624px (working)
NEXUS: Canvas = 1440 - 240 = 1200px (full canvas) or 1200 - 384 = 816px with config panel
```

**Option B — NEXUS Canvas State** (1440px viewport, Admin NEXUS page):

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN SIDEBAR (w-60 = 240px)  │  CANVAS (flex-1 = 1200px → 816px when config open)  │
│                                │                                                      │
│ Company: ACME Corp ▼           │ ┌─────────────────────────────────────────────────┐ │
│ ─────────────────────          │ │   ReactFlow Canvas (bg-zinc-950)                │ │
│ 🔍 NEXUS ←active               │ │                                                 │ │
│ 🤖 에이전트                    │ │  [비서실장]──────[CIO]                          │ │
│ ...                            │ │       │            │                             │ │
│                                │ │  [전략팀장]  [CTO]──[개발자]                    │ │
│                                │ │                                                 │ │
│                                │ │  [zoom/fit controls bottom-left of canvas]      │ │
│                                │ └─────────────────────────────────────────────────┘ │
│                                │                          ┌──────────────────────┐   │
│                                │  (node click →)          │ Config Panel (w-96)  │   │
│                                │  slide-in from right     │ Agent: CTO           │   │
│                                │  canvas reflows to 816px │ Tier: T1 Manager     │   │
│                                │                          │ [Edit Soul]          │   │
│                                │                          │ [Save] [Delete]      │   │
│                                │                          └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘

NEXUS width math at 1440px:
Admin sidebar: w-60 = 240px
Canvas (no config panel): flex-1 = 1440 - 240 = 1200px ✓
Canvas (with config panel): flex-1 reflows to 1440 - 240 - 384 = 816px ✓
Difference from Option A: config panel REFLOWS canvas (flex layout) vs Option A's absolute overlay
```

**Tailwind CSS Grid Structure**:
```tsx
// Hub with adaptive TrackerPanel
const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);

// SSE handoff event auto-expands
useEffect(() => {
  if (sseEvent?.type === 'handoff') setIsTrackerExpanded(true);
  // ⚠️ ASSUMPTION — requires user testing validation:
  // 3s delay before auto-collapse on 'complete' event.
  // Alternative: remove auto-collapse entirely (user manually collapses).
  // Risk: user may want to review the full chain after completion.
  if (sseEvent?.type === 'complete') {
    setTimeout(() => setIsTrackerExpanded(false), 3000);
  }
}, [sseEvent]);

<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar className="w-60 shrink-0" />
  <nav aria-label="Sessions" className="w-64 shrink-0 border-r border-zinc-800">
    <SessionPanel />
  </nav>
  <main className="flex-1 min-w-0">
    <ChatArea />
  </main>
  <aside
    role="complementary"
    aria-label="Handoff Tracker"
    aria-live="polite"
    aria-atomic="false"
    className={cn(
      "shrink-0 overflow-hidden border-l border-zinc-800",
      "transition-[width] duration-250 ease-in-out motion-reduce:transition-none",
      isTrackerExpanded ? "w-80" : "w-12"
    )}
  >
    <TrackerPanel />
    {/* SSE step rows: transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none */}
  </aside>
</div>

// NEXUS Canvas with slide-in config panel
const [selectedNode, setSelectedNode] = useState(null);

<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar className="w-60 shrink-0" />
  <div className="flex-1 relative overflow-hidden">
    <ReactFlowCanvas className="w-full h-full" />
    {/* Slide-in config panel */}
    <div className={cn(
      "absolute right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-700",
      "transition-transform duration-250 ease-in-out motion-reduce:transition-none",
      selectedNode ? "translate-x-0" : "translate-x-full"
    )}>
      <AgentConfigPanel node={selectedNode} />
    </div>
  </div>
</div>
```

**How it handles CORTHEX-specific features**:

| Feature | Solution |
|---------|---------|
| **Sidebar nav** | Same as Option A. Fixed `w-60` with grouped emoji nav |
| **Hub 3-column** | TrackerPanel auto-expands on `handoff` SSE → auto-collapses 3s after `complete`. Manual toggle also available (`ChevronRight` button at panel edge) |
| **Modals** | Full-screen entity detail drawers preferred over centered modals (more screen real-estate for dense admin forms) |
| **Notifications** | Inline within TrackerPanel during active runs. Toast for errors/completions when Hub is not active view |
| **NEXUS canvas** | Slide-in right panel for node config. Canvas fills remaining space. No persistent right sidebar for NEXUS |

**Breakpoint strategy**: Same desktop-only enforcement. Only adaptive behavior is TrackerPanel width (state-driven, not viewport-driven).

**Pros for CORTHEX**:
- Hub idle state has 896px chat area (more generous markdown rendering width)
- NEXUS canvas gets maximum real estate when no node selected
- Adaptive behavior teaches users the product: TrackerPanel expanding IS the product demo
- Matches Linear's "visual noise reduction" philosophy — only show what's needed

**Cons for CORTHEX**:
- TrackerPanel auto-collapse after completion may feel abrupt — user might want to review chain
- More state to manage (expansion/collapse lifecycle with SSE events)
- Less consistent layout (panels shift when tracker expands) — may cause disorientation initially

---

### Option C: Resizable Commander Panels (User-Controlled Column Widths)

**Inspired by**: `react-resizable-panels` library, VS Code multi-panel layout, Grafana dashboard panel resizing

**Core philosophy**: All 4 panels (AppSidebar, SessionPanel, ChatArea, TrackerPanel) are user-resizable within min/max constraints. The user decides how much space each panel gets — a power user who monitors the Tracker closely can widen it to `w-96`; a user focused on reading long reports can collapse the SessionPanel to `w-52`. The layout adapts to the individual's working style rather than forcing a single fixed width.

```
ASCII Layout Diagram (1440px viewport, Hub page — resizable handles shown as ‖):

┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ APP SIDEBAR (w-60 fixed)  ‖  SESSION (min-w-52, default w-64)  ‖  CHAT (flex-1)  ‖  TRACKER│
│  [not resizable]          ‖  [drag handle to resize ←→]       ‖               ‖  (min-w-12)│
│                           ‖                                    ‖               ‖  max-w-96  │
│ 🏠 홈                     ‖ ┌── Sessions ──────────────┐       ‖ ┌── Chat ───┐ ‖ ┌─Track──┐│
│ 🔗 허브 ←active           ‖ │ Session 1 (active)       │       ‖ │           │ ‖ │LIVE    ││
│ 🎖️ 티어                   ‖ │ Session 2                │       ‖ │ [stream]  │ ‖ │●비서실 ││
│ ─────────────             ‖ └──────────────────────────┘       ‖ │           │ ‖ │→CIO✓  ││
│ 💬 AGORA                  ‖                                    ‖ │ [msg 1]   │ ‖ │→전문가●││
│ 📈 대시보드                ‖ ┌── Agent Status ──────────┐       ‖ └───────────┘ ‖ │       ││
│ ...                       ‖ │ 비서실장 ● online         │       ‖               ‖ │$0.0042││
│                           ‖ └──────────────────────────┘       ‖ ┌── Input ──┐ ‖ └───────┘│
│                           ‖                                    ‖ │[textarea] │ ‖           │
└────────────────────────────────────────────────────────────────────────────────────────────┘

Width constraints:
AppSidebar: fixed w-60 = 240px (not resizable)
SessionPanel: min-w-52 (208px) / default w-64 (256px) / max-w-80 (320px)
ChatArea: flex-1 (fills remaining, min-w-96 = 384px)
TrackerPanel: min-w-12 (48px, icon-strip) / default w-80 (320px) / max-w-96 (384px)

Width math at 1440px default state:
240 + 256 + flex-1 + 320 = same as Option A: ChatArea = 624px
User can widen Tracker to 384px → ChatArea = 560px
User can collapse SessionPanel to 208px → ChatArea = 672px
```

**Tailwind CSS Grid Structure** (using `react-resizable-panels` library):
```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Hub page with resizable panels
<div className="flex h-screen bg-zinc-950 overflow-hidden">
  <AppSidebar className="w-60 shrink-0" /> {/* Fixed, not resizable */}

  <PanelGroup direction="horizontal" className="flex-1">
    {/* SessionPanel */}
    <Panel
      defaultSize={20}   /* ~256px of ~1200px remaining */
      minSize={17}        /* 208px minimum */
      maxSize={27}        /* 320px maximum */
    >
      <nav
        aria-label="Sessions"
        className="h-full border-r border-zinc-800"
      >
        <SessionPanel />
      </nav>
    </Panel>

    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-600 transition-colors duration-150 cursor-col-resize" />

    {/* ChatArea */}
    <Panel minSize={30} /* 384px minimum */>
      <main className="h-full flex flex-col">
        <ChatArea />
      </main>
    </Panel>

    <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-600 transition-colors duration-150 cursor-col-resize" />

    {/* TrackerPanel */}
    <Panel
      defaultSize={25}   /* ~320px */
      minSize={4}         /* 48px icon-strip */
      maxSize={32}        /* 384px */
      collapsible={true}
    >
      <aside
        role="complementary"
        aria-label="Handoff Tracker"
        aria-live="polite"
        aria-atomic="false"
        className="h-full border-l border-zinc-800"
      >
        <TrackerPanel />
        {/* SSE step rows: transition-[transform,opacity] duration-300 motion-reduce:transition-none */}
      </aside>
    </Panel>
  </PanelGroup>
</div>

// Persist panel sizes to localStorage
const [layout, setLayout] = useLocalStorage('hub-panel-layout', [20, 51, 25]);
// Pass defaultSize from layout array; onLayout saves new sizes
```

**Option C — NEXUS Canvas State** (1440px viewport, Admin NEXUS page):

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN SIDEBAR (w-60 fixed)  ‖  CANVAS (flex-1 resizable) ‖  CONFIG (min-w-0, default)│
│                              ‖                            ‖  slide-in only            │
│ Company: ACME Corp ▼         ‖  ReactFlow Canvas          ‖                           │
│ 🔍 NEXUS ←active             ‖  (bg-zinc-950)             ‖  ┌──────────────────────┐ │
│ 🤖 에이전트                  ‖                            ‖  │ Agent: CTO           │ │
│ ...                          ‖  [비서실장]──[CIO]         ‖  │ Tier: T1 Manager     │ │
│                              ‖       │       │            ‖  │ Soul: ...            │ │
│                              ‖  [전략팀장] [CTO]──[개발자] ‖  │ [Edit Soul]          │ │
│                              ‖                            ‖  └──────────────────────┘ │
│                              ‖  Canvas: 1440-240=1200px   ‖  (w-96 when node selected)│
└──────────────────────────────────────────────────────────────────────────────────────┘

NEXUS: No resizable panels for canvas — canvas fills full flex-1.
Config panel is absolute-positioned (same as Option A).
```

**How it handles CORTHEX-specific features**:

| Feature | Solution |
|---------|---------|
| **Sidebar nav** | Same as Options A & B. Fixed `w-60`, not part of resizable group |
| **Hub 3-column** | All 3 inner panels resizable within constraints. TrackerPanel collapses to `w-12` (4% of ~1200px) when user collapses or auto-collapses on idle |
| **Layout persistence** | `useLocalStorage('hub-panel-layout')` — user's preferred widths persist across sessions |
| **Modals** | Same as Option A — `fixed inset-0 z-50` overlay drawers with `motion-reduce:transition-none` |
| **Notifications** | Same as Option A |
| **NEXUS canvas** | Fixed layout (no resize handles on NEXUS page) — canvas needs stable dimensions for React Flow |

**Breakpoint strategy**: Same desktop-only enforcement. `react-resizable-panels` does not participate in CSS breakpoints — panel widths are percentage-based within the available flex space.

**Pros for CORTHEX**:
- Power users (like 이팀장) can optimize their layout for their workflow
- Solves the 464px ChatArea problem: user can collapse SessionPanel to reclaim width
- Panel persistence via localStorage = product feels custom-fit after first session
- `react-resizable-panels` is already cited in sources — proven OSS library (GitHub: bvaughn/react-resizable-panels)
- Resize handles become a subtle affordance that signals "this is a professional tool"

**Cons for CORTHEX**:
- Layout persistence complexity: if an agent demo is recorded or shared, different panel widths may show in each context
- Resize handles (`w-1` drag bars) are small targets — need `cursor-col-resize` + hover highlight (`hover:bg-indigo-600`) to be discoverable
- Percentage-based sizing in `react-resizable-panels` requires converting CORTHEX's fixed `w-60/64/80` pixel specs to percentages relative to available space (240px sidebar out, ~1200px remaining → SessionPanel 20%, Tracker 25%)
- Risk of layout thrash: a user who accidentally drags TrackerPanel to 4% during an active SSE stream loses visibility of the Tracker

---

### Alternative Considered: Mission Control with Status Rail

> ⚠️ **NOT RECOMMENDED** — Demoted from TOP 3. This option violates the Phase 0 3-column Hub spec and regresses to the current implementation being replaced (horizontal HandoffTracker bar inside main area). Included for completeness only.

**Concept**: Persistent `h-10` status rail at top showing all agent statuses + ARGOS countdown + daily cost. Sidebar for navigation. Hub inner layout uses 2 panels (SessionPanel + ChatArea) with Tracker as a bottom-expanding horizontal bar.

**Why it was rejected**: The Phase 0 Technical Spec explicitly establishes TrackerPanel as a right-column sidebar (`w-80`). The current implementation (HandoffTracker as horizontal `border-b` bar) is the regression this redesign is replacing. Adopting this pattern as a "new" option would undo the Phase 0 architectural decision. The status rail's ambient awareness value (agent dots visible on all pages) can be extracted as an enhancement to Option A or B's sidebar header without adopting the full regressive Hub layout.

**One salvageable element**: The global agent status dots in the rail are worth preserving as an additive enhancement — place them in the App sidebar header area (`bg-zinc-900 border-b border-zinc-800 px-4 py-2`) instead of a full-width top rail, avoiding the vertical space cost.

---

## Part 4: Recommendation Summary

| Criterion | Option A (Fixed Command Center) | Option B (Adaptive) | Option C (Resizable Panels) |
|-----------|--------------------------------|---------------------|-----------------------------|
| Matches Phase 0 Hub 3-column spec | ✅ Perfect | ✅ Perfect | ✅ Perfect |
| Commander's View (always visible) | ✅ Highest — always fixed | ⚠️ Conditional on SSE event | ✅ User-controlled, persistent |
| Chat area at 1280px min viewport | ⚠️ 464px (tight, see note) | ✅ 464–896px (adaptive) | ✅ User can collapse SessionPanel |
| NEXUS canvas real estate | ✅ Full flex-1 | ✅ Full flex-1 | ✅ Full flex-1 |
| Implementation complexity | Low (flex only) | Medium (SSE state) | High (react-resizable-panels) |
| UX precedent in products | ✅ Grafana, Anthropic Workbench | ✅ Linear 2025, Vercel | ✅ VS Code, Grafana resize |
| Brand alignment | ✅ Strongest (military discipline) | ✅ Strong | ✅ Strong (power user tool) |
| Layout persistence | ❌ Fixed — no customization | ⚠️ Resets on page refresh | ✅ localStorage persistence |
| WCAG motion compliance | ✅ `motion-reduce:transition-none` | ✅ `motion-reduce:transition-none` | ✅ No animations on handles |
| ARIA landmarks | ✅ Defined in code spec | ✅ Defined in code spec | ✅ Defined in code spec |

**Research conclusion**: All three options satisfy the Phase 0 3-column Hub spec. Option A (Fixed Command Center) best embodies "Commander's View" — predictable, always-visible, zero cognitive load for panel state. Option B (Adaptive) creates the best product reveal moment (TrackerPanel expanding IS the demo) and maximizes ChatArea in idle state. Option C (Resizable) is the most power-user-friendly and solves the 464px Chat width problem via user control — appropriate if CORTHEX's user base skews toward 이팀장 (admin power users) rather than 김대표 (non-developer CEOs). For the target persona (non-developer CEO), Option A or B are preferred; Option C adds discoverability risk for accidental layout breakage.

---

## Sources

| Product | URL |
|---------|-----|
| Anthropic Console | https://console.anthropic.com |
| Anthropic UI Kit (Figma) | https://www.figma.com/community/file/1445575023384366559/anthropic-ui-kit |
| OpenAI Platform | https://platform.openai.com |
| Weights & Biases App | https://docs.wandb.ai/guides/app/ |
| W&B LEET Terminal UI | https://app.getbeamer.com/wandb/en/meet-wb-leet-a-new-terminal-ui-for-weights-biases-JXSFhyt2 |
| Linear UI Redesign 2025 | https://linear.app/now/how-we-redesigned-the-linear-ui |
| Linear Dashboards | https://linear.app/docs/dashboards |
| Vercel New Dashboard | https://vercel.com/try/new-dashboard |
| Supabase UI | https://supabase.com/ui |
| Neon Console | https://neon.tech |
| shadcn/ui Dashboard | https://ui.shadcn.com/examples/dashboard |
| shadcn Sidebar Component | https://ui.shadcn.com/docs/components/sidebar |
| Grafana Dashboard UI | https://grafana.com/grafana/ |
| CrewAI Studio | https://docs.crewai.com/en/enterprise/features/crew-studio |
| AutoGen Studio | https://microsoft.github.io/autogen/stable/ |
| react-resizable-panels | https://react-resizable-panels.vercel.app/examples/collapsible |

---

*Document: Phase 1-1 Web Dashboard Layout Research*
*Round 2 — 8 issues fixed (Option C replaced with Resizable Panels, motion-reduce, ARIA, NEXUS diagrams, W&B clarification, shadcn URL, 464px con, Option C SessionPanel w-72→w-64)*
*Status: Awaiting critic verification scores*
