# Web Dashboard Layout Research — Phase 1, Step 1-1

**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 1 Research)
**Sources:** 12 live SaaS products analyzed, 15 benchmark screenshots (Phase 0.5), Premium SaaS Design Framework
**Target:** CORTHEX v3 CEO App — 23-page AI Agent Orchestration Dashboard

---

## 1. Context & Constraints

### 1.1 Product Identity (from Vision & Identity)
- **Archetype:** The Ruler (command & control) + The Sage (data & analysis)
- **Design Direction:** Natural Organic — "Controlled Nature"
- **Color Palette:** Sovereign Sage — cream `#faf8f5`, olive `#283618`, sage `#606C38`
- **Typography:** Inter (UI) + JetBrains Mono (data) + Noto Serif KR (Korean serif)
- **Theme:** Single theme (Sovereign Sage). No dark mode for v3 initial launch.

### 1.2 Technical Constraints
| Constraint | Value | Source |
|-----------|-------|--------|
| Runtime | Bun 1.3.10 | Tech Spec §1.2 |
| Frontend | React 19 + Vite 6.4 SPA | Tech Spec §1.2 |
| Styling | Tailwind CSS v4 (CSS-first config) | Tech Spec §1.2 |
| State | Zustand (client) + @tanstack/react-query (server) | Tech Spec §1.2 |
| Icons | Lucide React (2px stroke, `currentColor`) | Vision §6.1 |
| Grid base | 8px | Vision §5.1 |
| Components | Radix UI + Tailwind (zero-runtime) | Vision §10.1 |
| Server | Oracle ARM 4-core 24GB VPS | Benchmark Report |
| Pages | 23 active routes | Tech Spec §2 |
| Korean text | Requires wider sidebar (Korean text ~20% longer than English) | Vision §5.2 |

### 1.3 Page Groups (from Tech Spec)
| Group | Pages | Key Layout Need |
|-------|-------|----------------|
| COMMAND | Hub, Dashboard, NEXUS, Chat | Streaming, canvas, real-time data |
| ORGANIZATION | Agents, Departments, Jobs, Tiers, Reports | CRUD cards/lists, modals, tabs |
| TOOLS | Workflows, Knowledge, Files, SketchVibe | Editors, file managers, visual builders |
| INTELLIGENCE | Performance, Costs, Trading, Activity Log, Ops Log | Charts, tables, time-series data |
| SOCIAL | Messenger, SNS, Agora, Notifications | Multi-column chat, feeds, threads |
| SETTINGS | Settings (10 tabs) | Forms, configuration panels |
| CLASSIFIED | Classified | Restricted access, archive |

---

## 2. Competitive Landscape Analysis

### 2.1 AI Agent Management Platforms (Direct Competitors)

| Product | URL | Layout Pattern | Theme | Sidebar | Topbar |
|---------|-----|---------------|-------|---------|--------|
| **CrewAI Enterprise** | crewai.com | Sidebar + canvas editor | Dark (#1a1a2e) | ~240px, icons+text | Deployment tabs |
| **Dify.ai** | dify.ai | Sidebar + Prompt IDE canvas | Light (white) | ~240px, section tabs | Minimal |
| **Langflow** | langflow.org | Component panel + React Flow | Light (white) | ~280px component lib | Playground CTA |
| **Relevance AI** | relevanceai.com | Sidebar + conversational | Light (white) | ~240px, grouped | Activity center |
| **Lindy.ai** | lindy.ai | Dashboard + Flow editor | Light (purple accent) | Minimal | Template picker |
| **Vellum AI** | vellum.ai | Sandbox UI (Edit/Run/Code) | Dark support | ~240px | Mode tabs |
| **Kore.ai XO** | docs.kore.ai | Enterprise nav + widget panels | Light (blue accent) | ~260px hierarchical | App dropdown + search |

### 2.2 Premium SaaS Dashboards (Design Benchmarks)

| Product | URL | Layout Pattern | Sidebar Width | Topbar Height | Special |
|---------|-----|---------------|---------------|---------------|---------|
| **Linear** | linear.app | Sidebar + content-first | ~224px, collapsible | ~48px | Cmd+K gold standard |
| **Notion** | notion.com | Sidebar + block editor | 224px, resizable | ~64px | 8px grid precision |
| **Vercel** | vercel.com | Sidebar + deployments | ~240px, collapsible | ~48px | Minimal perfection |
| **shadcn/ui** | ui.shadcn.com | Reference implementation | 256px (16rem) / 48px collapsed | 56px | CSS variable standard |
| **Retool** | retool.com | 3-frame (main+header+sidebar) | ~260px | ~56px | Filter-in-sidebar |

### 2.3 Key Insights from Competitive Analysis

1. **All AI agent platforms use left sidebar** — no exceptions. This is the universal pattern for 10+ page apps.
2. **Light themes dominate** in 2025-2026 AI platforms (Dify, Langflow, Relevance, Lindy, Kore.ai). Only CrewAI and Vellum offer dark.
3. **CORTHEX's Natural Organic palette is unique** — no competitor uses olive/sage/cream. Strong differentiator.
4. **Canvas-based editors** (React Flow, node graphs) are standard for workflow/orchestration views.
5. **Cmd+K command palette** is now a baseline expectation for 10+ page SaaS apps.
6. **Sidebar collapse** is expected for power users (Linear's `[` shortcut is gold standard).

---

## 3. Layout Options

### Option A: "Linear Classic" — Fixed Sidebar + Minimal Topbar

**Inspiration:** Linear, Notion, Vercel
**Philosophy:** Maximum content area. Sidebar is primary navigation; topbar is utility only.

#### ASCII Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┬───────────────────────────────────────────────────┐ │
│ │ SIDEBAR  │ TOPBAR                                           │ │
│ │ 280px    │ h-56px  [Breadcrumbs]          [🔍] [🔔] [👤]   │ │
│ │          ├───────────────────────────────────────────────────┤ │
│ │ ┌──────┐ │ CONTENT AREA                                     │ │
│ │ │CORTEX│ │ max-w-1440px, mx-auto                            │ │
│ │ │ v3   │ │ p-6 (24px)                                       │ │
│ │ └──────┘ │                                                   │ │
│ │          │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │
│ │ ──────── │  │ Card 1  │ │ Card 2  │ │ Card 3  │            │ │
│ │ COMMAND  │  └─────────┘ └─────────┘ └─────────┘            │ │
│ │  Hub     │                                                   │ │
│ │  Dash    │  ┌──────────────────────────────────┐            │ │
│ │  NEXUS   │  │ Chart / Table / Editor           │            │ │
│ │  Chat    │  │                                  │            │ │
│ │ ──────── │  │                                  │            │ │
│ │ ORGANIZE │  └──────────────────────────────────┘            │ │
│ │  Agents  │                                                   │ │
│ │  Depts   │                                                   │ │
│ │  Jobs    │                                                   │ │
│ │ ──────── │                                                   │ │
│ │ TOOLS    │                                                   │ │
│ │ ──────── │                                                   │ │
│ │ INTEL    │                                                   │ │
│ │ ──────── │                                                   │ │
│ │ SOCIAL   │                                                   │ │
│ │ ──────── │                                                   │ │
│ │ ⚙ Set   │                                                   │ │
│ │ 👤 User  │                                                   │ │
│ └──────────┴───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### CSS Grid Structure
```css
:root {
  --sidebar-width: 280px;        /* Korean text needs 280px (Vision §5.2) */
  --sidebar-width-collapsed: 56px;
  --topbar-height: 56px;         /* 8px × 7 (Vision §5.2) */
  --content-max-width: 1440px;
  --content-padding: 24px;       /* 8px × 3 */
}

.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-areas:
    "sidebar topbar"
    "sidebar content";
  height: 100dvh;
  overflow: hidden;
}

.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  background: var(--bg-chrome);          /* #283618 olive dark */
  color: var(--text-chrome);             /* #a3c48a sage light */
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;                    /* dark sidebar = no border needed */
}

.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--bg-primary);         /* #faf8f5 cream */
  border-bottom: 1px solid var(--border-primary); /* #e5e1d3 sand */
}

.content {
  grid-area: content;
  overflow-y: auto;
  background: var(--bg-primary);         /* #faf8f5 cream */
}

.content-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--content-padding);
}
```

#### Responsive Behavior
```css
/* Mobile: < 1024px — overlay sidebar */
@media (max-width: 1023px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "content";
  }
  .sidebar {
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 200ms ease;
  }
  .sidebar[data-open="true"] {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
}

/* Desktop collapsed: keyboard shortcut `[` */
.app-shell[data-sidebar="collapsed"] {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}
```

#### Navigation Grouping (23 pages into 6 groups)
```
┌────────────────────────┐
│ CORTHEX v3        [◀]  │  ← brand + collapse toggle
│────────────────────────│
│ 🔍 Search... (⌘K)      │  ← command palette trigger
│────────────────────────│
│ COMMAND                 │  ← section header (12px, uppercase, dim)
│  🏠 Hub                 │
│  📊 Dashboard           │
│  🔗 NEXUS              │
│  💬 Chat               │
│────────────────────────│
│ ORGANIZATION            │
│  🤖 Agents             │
│  🏢 Departments        │
│  📋 Jobs / ARGOS       │
│  📐 Tiers              │
│  📄 Reports            │
│────────────────────────│
│ TOOLS                   │
│  ⚡ Workflows           │
│  📚 Knowledge          │
│  📁 Files              │
│  🎨 SketchVibe         │
│────────────────────────│
│ INTELLIGENCE            │
│  📈 Performance        │
│  💰 Costs              │
│  📉 Trading            │
│  📝 Activity Log       │
│────────────────────────│
│ SOCIAL                  │
│  💬 Messenger          │
│  📱 SNS                │
│  🏛 Agora              │
│  🔔 Notifications      │
│════════════════════════│
│ 🔒 Classified     ← bottom-fixed
│ ⚙ Settings        ← bottom-fixed
│ 👤 User Profile    ← bottom-fixed
└────────────────────────┘
```

#### Pros
- **Proven pattern** — Linear, Notion, Vercel all use this; users know it instantly
- **Content maximization** — topbar is thin (56px), sidebar is primary navigation
- **Keyboard-first** — Cmd+K, `[` sidebar toggle, arrow key navigation
- **8px grid aligned** — sidebar 280px, topbar 56px, padding 24px all on grid
- **Korean text friendly** — 280px sidebar accommodates longer Korean labels
- **Collapsible** — power users can hide sidebar for full-screen canvas views (NEXUS, SketchVibe)

#### Cons
- **23 pages in sidebar is long** — requires scrolling on smaller screens
- **Section headers add visual weight** — 6 groups with dividers can feel dense
- **No page-level tabs** — all navigation is sidebar-only; pages like Jobs (4 tabs) need internal tab systems
- **Sidebar scroll conflict** — sidebar and content both scroll independently; can confuse trackpad users

*(See Section 4 Comparison Matrix for weighted scoring)*

---

### Option B: "Notion Hybrid" — Collapsible Sidebar + Contextual Topbar

**Inspiration:** Notion, Kore.ai XO, Retool
**Philosophy:** Sidebar handles navigation; topbar adapts per page (breadcrumbs, filters, page actions).

#### ASCII Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┬───────────────────────────────────────────────────┐ │
│ │ SIDEBAR  │ TOPBAR (contextual per page)                     │ │
│ │ 280px    │ h-56px                                           │ │
│ │ hover-   │ [☰] [Hub > Session #12]    [Filter▾] [🔍] [🔔] │ │
│ │ expand   ├───────────────────────────────────────────────────┤ │
│ │ on       │ CONTENT AREA                                     │ │
│ │ collapsed│ max-w-1440px, mx-auto                            │ │
│ │          │ p-6 (24px)                                       │ │
│ │ ┌──────┐ │                                                   │ │
│ │ │CORTEX│ │  ┌─────────────────────────────────────────────┐ │ │
│ │ └──────┘ │  │ PAGE-SPECIFIC LAYOUT                        │ │ │
│ │          │  │                                             │ │ │
│ │ Primary  │  │  Dashboard: 3-col grid of metric cards      │ │ │
│ │ nav      │  │  Hub: session sidebar + chat area           │ │ │
│ │ (5-7     │  │  NEXUS: full-canvas React Flow              │ │ │
│ │  items)  │  │  Agents: card grid + detail drawer          │ │ │
│ │          │  │  Jobs: tab bar + content                    │ │ │
│ │ ──────── │  │  Messenger: 3-col (channels+chat+members)   │ │ │
│ │ Overflow │  │  Trading: 4-panel grid                      │ │ │
│ │ (groups  │  │  Costs: chart + table combo                 │ │ │
│ │  behind  │  │                                             │ │ │
│ │  "More") │  └─────────────────────────────────────────────┘ │ │
│ │          │                                                   │ │
│ │ ──────── │                                                   │ │
│ │ ⚙ Set   │                                                   │ │
│ │ 👤 User  │                                                   │ │
│ └──────────┴───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### CSS Grid Structure
```css
:root {
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 56px;
  --sidebar-width-mobile: 280px;
  --topbar-height: 56px;
  --content-max-width: 1440px;
  --content-padding: 24px;
  --transition-speed: 200ms;
}

.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-areas:
    "sidebar topbar"
    "sidebar content";
  height: 100dvh;
  overflow: hidden;
}

/* Collapsed: shrink grid column, sidebar uses width transition (GPU-friendly) */
.app-shell[data-sidebar="collapsed"] {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  transition: width var(--transition-speed) ease;  /* width, NOT grid-template-columns */
  background: var(--bg-chrome);
  color: var(--text-chrome);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 20;
}

/* Hover-expand: sidebar expands on hover when collapsed */
.app-shell[data-sidebar="collapsed"] .sidebar:hover {
  width: var(--sidebar-width);
  position: absolute;
  height: 100dvh;
  box-shadow: var(--shadow-lg);     /* 0 10px 15px rgba(0,0,0,0.10) */
  z-index: 30;
}

/* Contextual topbar: adapts content per route */
.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;  /* allow text truncation */
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Breadcrumbs in topbar */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumbs .current {
  color: var(--text-primary);
  font-weight: 500;
}

.content {
  grid-area: content;
  overflow-y: auto;
  background: var(--bg-primary);
}
```

#### Navigation Strategy: "Primary + More" Pattern
```
┌────────────────────────┐
│ CORTHEX v3        [◀]  │
│────────────────────────│
│ 🔍 Search... (⌘K)      │
│────────────────────────│
│  🏠 Hub                 │  ← PRIMARY (always visible, 7 items)
│  📊 Dashboard           │
│  🔗 NEXUS              │
│  💬 Chat               │
│  🤖 Agents             │
│  📋 Jobs               │
│  📈 Performance        │
│────────────────────────│
│  ▸ More...             │  ← EXPANDABLE SECTION
│    🏢 Departments      │
│    📐 Tiers            │
│    📄 Reports          │
│    ⚡ Workflows         │
│    📚 Knowledge        │
│    📁 Files            │
│    🎨 SketchVibe       │
│    💰 Costs            │
│    📉 Trading          │
│    📝 Activity Log     │
│────────────────────────│
│  💬 Messenger          │  ← SOCIAL (always visible)
│  📱 SNS                │
│  🏛 Agora              │
│  🔔 Notifications  [3] │  ← badge count
│════════════════════════│
│ 🔒 Classified          │
│ ⚙ Settings             │
│ 👤 Ko Donghui          │
└────────────────────────┘
```

#### Contextual Topbar Examples
```
Hub page:    [☰] [Hub > Morning Briefing #12]         [Filter▾] [🔍] [🔔]
Dashboard:   [☰] [Dashboard]              [Today▾] [Refresh] [🔍] [🔔]
Agents:      [☰] [Agents]          [+ New Agent] [Grid|List] [🔍] [🔔]
NEXUS:       [☰] [NEXUS]    [Zoom] [Layout] [Export] [Save]  [🔍] [🔔]
Costs:       [☰] [Costs]    [This Month▾] [By Agent▾]        [🔍] [🔔]
Messenger:   [☰] [Messenger > #general]                      [🔍] [🔔]
```

#### Pros
- **Reduced sidebar density** — only 7 primary items visible; rest behind "More"
- **Contextual topbar** — page-specific actions (filters, view toggles, CTAs) where users expect them
- **Hover-expand** — collapsed sidebar shows icons; hover temporarily reveals full labels (Notion pattern)
- **Breadcrumbs** — clear wayfinding for deep pages (Hub > Session > Handoff)
- **Bottom-pinned social** — Messenger/SNS/Notifications always accessible
- **Scalable** — can add more pages without sidebar growing visually

#### Cons
- **"More" menu hides functionality** — less discoverable; new users may not find Departments, Tiers
- **Hover-expand can be janky** — accidental triggers, z-index conflicts with content
- **Contextual topbar requires per-page config** — more development effort (23 topbar variations)
- **Two levels of hierarchy** — primary + more creates a mental model split

*(See Section 4 Comparison Matrix for weighted scoring)*

---

### Option C: "Command Center" — Dual-Zone Sidebar + Floating Action Bar (RECOMMENDED)

**Inspiration:** CrewAI Enterprise + Linear keyboard-first + Kore.ai widget system
**Philosophy:** CEO as commander. Sidebar is the organizational hierarchy; content area is the operational view. A floating command bar provides quick access without leaving the current page.

#### ASCII Layout
```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌────────────┬─────────────────────────────────────────────────────┐ │
│ │ SIDEBAR    │ TOPBAR                                             │ │
│ │ 280px      │ h-56px                                             │ │
│ │            │ [Page Title]              [⌘K Search] [🔔 3] [👤] │ │
│ │ ┌────────┐ ├─────────────────────────────────────────────────────┤ │
│ │ │CORTHEX │ │ CONTENT AREA                                       │ │
│ │ │  v3    │ │ max-w-1440px, mx-auto, p-6                        │ │
│ │ └────────┘ │                                                     │ │
│ │            │  ┌─────────┐ ┌─────────┐ ┌─────────┐              │ │
│ │ ┌────────┐ │  │ Metric  │ │ Metric  │ │ Metric  │              │ │
│ │ │ ZONE A │ │  │ Card    │ │ Card    │ │ Card    │              │ │
│ │ │ Core   │ │  └─────────┘ └─────────┘ └─────────┘              │ │
│ │ │ Nav    │ │                                                     │ │
│ │ │        │ │  ┌────────────────────┬──────────────────┐         │ │
│ │ │ Hub    │ │  │ Primary Chart /    │ Secondary Panel  │         │ │
│ │ │ Dash   │ │  │ Table / Editor     │ (optional, page  │         │ │
│ │ │ NEXUS  │ │  │                    │  dependent)      │         │ │
│ │ │ Chat   │ │  │                    │                  │         │ │
│ │ │ Agents │ │  └────────────────────┴──────────────────┘         │ │
│ │ │ Jobs   │ │                                                     │ │
│ │ └────────┘ │  ┌───────────────────────────────────────┐         │ │
│ │ ┌────────┐ │  │ Data Table / Feed / Activity          │         │ │
│ │ │ ZONE B │ │  │                                       │         │ │
│ │ │ Quick  │ │  └───────────────────────────────────────┘         │ │
│ │ │ Access │ │                                                     │ │
│ │ │        │ │  ┌─────────────────────────────────────────────┐   │ │
│ │ │ 💬 Msnr│ │  │ ⌘K — FLOATING COMMAND BAR                  │   │ │
│ │ │ 📱 SNS │ │  │ "Type command or search..."                │   │ │
│ │ │ 🏛 Agra│ │  │ Recent | Navigation | Actions | Agents     │   │ │
│ │ │ 🔔 Noti│ │  └─────────────────────────────────────────────┘   │ │
│ │ └────────┘ │                                                     │ │
│ │ ──────────│                                                     │ │
│ │ ⚙ Settings│                                                     │ │
│ │ 👤 Profile │                                                     │ │
│ └────────────┴─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

#### CSS Grid Structure
```css
:root {
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 56px;
  --topbar-height: 56px;
  --content-max-width: 1440px;
  --content-padding: 24px;
  --transition-speed: 200ms;
  --z-sidebar: 20;
  --z-command-palette: 100;
}

/* ===== APP SHELL ===== */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-areas:
    "sidebar topbar"
    "sidebar content";
  height: 100dvh;
  overflow: hidden;
  /* NOTE: No grid-template-columns transition — triggers full Layout→Paint
     pipeline every frame (not GPU-accelerated). Sidebar uses width transition
     instead, and the 1fr column auto-adjusts. */
}

.app-shell[data-sidebar="collapsed"] {
  grid-template-columns: var(--sidebar-width-collapsed) 1fr;
}

/* ===== SIDEBAR — Dual Zone ===== */
.sidebar {
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  transition: width var(--transition-speed) ease; /* width transition, not grid */
  background: var(--bg-chrome);          /* #283618 */
  color: var(--text-chrome);             /* #a3c48a */
  overflow: hidden;
  z-index: var(--z-sidebar);
}

.app-shell[data-sidebar="collapsed"] .sidebar {
  width: var(--sidebar-width-collapsed);
}

/* Zone A: Core navigation — scrollable */
.sidebar-zone-a {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

/* Zone B: Quick-access utilities — fixed at bottom */
.sidebar-zone-b {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.4); /* WCAG 1.4.11: 3:1 for functional separators */
}

/* Sidebar scrollbar styling (dark background) */
.sidebar-zone-a::-webkit-scrollbar {
  width: 4px;
}
.sidebar-zone-a::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-zone-a::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}
.sidebar-zone-a {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

/* Nav items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;                    /* --radius-md */
  font-size: 14px;
  font-weight: 400;
  color: var(--text-chrome);
  transition: background var(--duration-fast) ease-out;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);  /* white/10 */
}

.nav-item[aria-current="page"] {
  background: rgba(255, 255, 255, 0.15); /* white/15 */
  font-weight: 500;
  color: #ffffff;
}

/* Focus-visible: keyboard-only focus ring (WCAG 2.4.7) */
.nav-item:focus-visible {
  outline: 2px solid var(--accent-primary);  /* #606C38 */
  outline-offset: -2px;
  border-radius: 8px;
}

.nav-item .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Section headers */
.nav-section-header {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(163, 196, 138, 0.8);      /* text-chrome-dim — 80% for WCAG AA 4.82:1 */
  padding: 16px 12px 4px;
}

/* ===== TOPBAR ===== */
.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--content-padding);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.topbar-title {
  font-size: 18px;                       /* --text-lg */
  font-weight: 600;
  color: var(--text-primary);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== CONTENT AREA ===== */
.content {
  grid-area: content;
  overflow-y: auto;
  background: var(--bg-primary);
}

.content-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--content-padding);
}

/* Content grid for dashboard-style pages */
.content-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.content-grid-2 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* Full-bleed for canvas pages (NEXUS, SketchVibe) */
.content-canvas {
  padding: 0;
  max-width: none;
}

/* ===== COMMAND PALETTE (⌘K) ===== */
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-command-palette);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
}

.command-palette {
  width: min(640px, 90vw);
  max-height: 60vh;
  background: var(--bg-surface);         /* #f5f0e8 */
  border-radius: 12px;                   /* --radius-lg */
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* A11y: role="combobox" on input, role="listbox" on list,
   role="option" on items. Focus trap via Radix Dialog.
   aria-activedescendant tracks highlighted item.
   ESC closes palette. (Vision §11.2) */
.command-palette-input {
  height: 48px;
  padding: 0 16px;
  font-size: 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-primary);
  width: 100%;
  color: var(--text-primary);
}

.command-palette-list {
  overflow-y: auto;
  max-height: calc(60vh - 48px);
}

.command-palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
}

.command-palette-item:hover,
.command-palette-item[data-selected] {
  background: var(--bg-primary);
}

.command-palette-item:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.command-palette-group-header {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  padding: 8px 16px 4px;
}

/* ===== SEMANTIC HTML ===== */
/* Sidebar: <aside role="navigation" aria-label="Main navigation">
   Topbar:  <header role="banner">
   Content: <main role="main" id="main-content">
   Zone A nav groups: <nav aria-label="Command"> etc.
   Skip link: <a href="#main-content" class="sr-only focus:not-sr-only"> */

/* ===== RESPONSIVE ===== */

/* Mobile: < 1024px — overlay sidebar (aligned with Vision §13.1) */
@media (max-width: 1023px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "topbar"
      "content";
  }
  /* Mobile sidebar: role="dialog" aria-modal="true" aria-label="Navigation"
     Focus trap: first focusable on open, return focus on close.
     ESC key closes. Backdrop click closes. (Vision §11.2) */
  .sidebar {
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 280px;
    transform: translateX(-100%);
    transition: transform var(--transition-speed) ease;
  }
  .sidebar[data-open="true"] {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
  .content-grid-3,
  .content-grid-2 {
    grid-template-columns: 1fr;
  }
}

/* ===== REDUCED MOTION (Vision §7.1) ===== */
@media (prefers-reduced-motion: reduce) {
  .app-shell {
    transition: none;
  }
  .sidebar {
    transition: none;
  }
  .nav-item {
    transition: none;
  }
  .command-palette-overlay {
    animation: none;
  }
}
```

#### Sidebar Navigation — Dual Zone
```
┌─────────────────────────────┐
│ CORTHEX v3             [◀]  │  ← brand (18px, 600 weight) + collapse
│─────────────────────────────│
│ 🔍 Search... (⌘K)           │  ← command palette trigger
│─────────────────────────────│
│                              │
│ ┌─ ZONE A (scrollable) ───┐ │
│ │                          │ │
│ │ COMMAND                  │ │  ← section header
│ │  🏠 Hub                  │ │
│ │  📊 Dashboard            │ │
│ │  🔗 NEXUS               │ │
│ │  💬 Chat                │ │
│ │                          │ │
│ │ ORGANIZATION             │ │
│ │  🤖 Agents              │ │
│ │  🏢 Departments         │ │
│ │  📋 Jobs / ARGOS        │ │
│ │  📐 Tiers               │ │
│ │  📄 Reports             │ │
│ │                          │ │
│ │ TOOLS                    │ │
│ │  ⚡ Workflows            │ │
│ │  📚 Knowledge           │ │
│ │  📁 Files               │ │
│ │  🎨 SketchVibe          │ │
│ │                          │ │
│ │ INTELLIGENCE             │ │
│ │  📈 Performance         │ │
│ │  💰 Costs               │ │
│ │  📉 Trading             │ │
│ │  📝 Activity Log        │ │
│ │  🔐 Ops Log             │ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ ┌─ ZONE B (fixed bottom) ─┐ │
│ │  💬 Messenger        [2] │ │  ← unread badge
│ │  📱 SNS                  │ │
│ │  🏛 Agora               │ │
│ │  🔔 Notifications   [5]  │ │  ← notification count
│ └──────────────────────────┘ │
│═════════════════════════════│
│ 🔒 Classified                │
│ ⚙ Settings                  │
│ 👤 Ko Donghui               │
└─────────────────────────────┘
```

#### Why Dual-Zone?
1. **Zone A scrolls independently** — 18 pages in 5 groups, scrollable when viewport is short
2. **Zone B stays pinned** — Messenger, Notifications always visible. CEO always sees unread counts without scrolling.
3. **Real-time badges** — WebSocket-driven unread counts on Messenger, Notifications
4. **Settings/Profile at absolute bottom** — standard convention, always accessible

#### Command Palette Contents (⌘K)
```
Recent
  Dashboard                          ⌘D
  Hub > Morning Briefing #12

Navigation
  Go to Agents                       ⌘⇧A
  Go to Jobs                         ⌘⇧J
  Go to NEXUS                        ⌘⇧N

Actions
  Create new Agent                   ⌘N
  Start new Hub session
  Run Night Job
  Export NEXUS diagram

Agents (search by name)
  @Secretary — 온라인
  @Analyst-1 — 작업 중
  @Writer-3 — 오프라인
```

#### Content Area Layout Variants (per page type)
```css
/* Type 1: Dashboard grid (Dashboard, Performance) */
.layout-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

/* Type 2: Master-detail (Hub, Chat, Messenger) */
.layout-master-detail {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
  height: calc(100dvh - var(--topbar-height));
}

/* Type 3: Full canvas (NEXUS, SketchVibe) */
.layout-canvas {
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--topbar-height));
  overflow: hidden;
}

/* Type 4: CRUD list/cards (Agents, Departments, Tiers, Reports) */
.layout-crud {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Type 5: Tabbed (Jobs, Settings) */
.layout-tabbed {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Type 6: Multi-panel (Trading — 4 panels) */
.layout-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: calc(100dvh - var(--topbar-height));
}

/* Type 7: Feed (SNS, Agora, Activity Log) */
.layout-feed {
  max-width: 720px;
  margin: 0 auto;
}
```

#### Pros
- **CEO command metaphor** — sidebar = organization hierarchy, content = operational view
- **Dual-zone solves density** — 18 pages scroll in Zone A, 4 real-time items always visible in Zone B
- **Command palette centralizes access** — all 23 pages + actions + agent search in ⌘K
- **7 content layout types** — each page type gets optimal layout without forcing one pattern
- **Full canvas support** — NEXUS, SketchVibe get zero-padding canvas mode
- **Badge integration** — Messenger/Notification unread counts always visible (Zone B pinned)
- **8px grid compliant** — all dimensions align (280px sidebar, 56px topbar, 24px padding, 8px gaps)
- **Natural Organic palette maps well** — dark olive sidebar (authority) vs cream content (openness)
- **Keyboard-first** — ⌘K for everything, `[` for sidebar, page-specific shortcuts
- **Korean-optimized** — 280px sidebar, 14px nav text, no truncation on Korean labels

#### Cons
- **Dual-zone adds complexity** — two scroll contexts in sidebar (Zone A + content) plus content scroll = 3 scroll areas
- **Zone A overflow on 1080p** — 18 nav items + 5 section headers = ~820px needed, but Zone A gets ~640px on 1080p viewport. **Mitigation:** collapsible section groups (click section header to toggle children) + subtle scroll indicator (gradient fade at bottom of Zone A)
- **Zone B item count is fixed** — adding more "always visible" items breaks the layout
- **Command palette is a dev investment** — cmdk library + route integration + agent search = 2-3 story points

*(See Section 4 Comparison Matrix for weighted scoring)*

---

## 4. Comparison Matrix

| Criterion | Weight | Option A (Linear) | Option B (Notion) | Option C (Command) |
|-----------|--------|-------------------|-------------------|---------------------|
| **Brand alignment** (Ruler+Sage archetype) | 15% | 7/10 — generic | 8/10 — contextual | **9/10 — command center** |
| **Information architecture** (23 pages) | 15% | 7/10 — all visible, dense | 7/10 — hidden "More" | **9/10 — dual-zone** |
| **Content area flexibility** | 15% | 8/10 — single pattern | 8/10 — single pattern | **9/10 — 7 layout types** |
| **Mobile responsiveness** | 10% | 8/10 — overlay | 8/10 — overlay | 8/10 — overlay |
| **Keyboard accessibility** | 10% | 7/10 — basic Cmd+K | 8/10 — Cmd+K + breadcrumbs | **9/10 — Cmd+K + shortcuts** |
| **Development complexity** | 10% | **9/10** — simplest | 7/10 — per-page topbar | 7/10 — dual-zone + palette |
| **Real-time integration** | 10% | 7/10 — no badge zone | 8/10 — bottom-pinned | **9/10 — Zone B badges** |
| **Premium SaaS feel ($5k+)** | 10% | 7/10 — proven but generic | 8/10 — contextual polish | **9/10 — distinctive** |
| **Korean text support** | 5% | 8/10 — 280px | 8/10 — 280px | 8/10 — 280px |
| **Weighted Total** | 100% | **7.55** | **7.75** | **8.75** |

---

## 5. Recommendation

**Option C: "Command Center" — Dual-Zone Sidebar + Floating Command Bar** is recommended for CORTHEX v3.

### Rationale

1. **Brand-perfect:** The dual-zone sidebar maps directly to the Ruler archetype — the CEO sees their entire organization (Zone A) and stays connected to real-time communications (Zone B) simultaneously.

2. **Scalability:** 23 pages fit cleanly into 5 section groups in Zone A without "More" menus or hidden navigation. Zone B's 4 pinned items (Messenger, SNS, Agora, Notifications) match the SOCIAL page group exactly.

3. **Content flexibility:** The 7 layout types (dashboard grid, master-detail, canvas, CRUD, tabbed, multi-panel, feed) ensure each of the 23 pages gets an optimal content layout rather than forcing everything into one pattern.

4. **Real-time first:** The Zone B pinned section with WebSocket-driven badges means the CEO always sees communication status — critical for an agent orchestration platform.

5. **Command palette (⌘K):** With 23 pages + agent search + quick actions, the command palette is not a luxury but a necessity. The cmdk library (used by shadcn/ui) integrates cleanly with React Router.

6. **Natural Organic palette synergy:** Dark olive sidebar (#283618) as the command authority zone, cream content (#faf8f5) as the working space — this is "Controlled Nature" in layout form.

### Implementation Notes for Phase 2

- **Command palette library:** cmdk (pacocoursey) — unstyled, shadcn/ui compatible, fuzzy search built-in
- **Sidebar state:** Persist collapse/expand in `localStorage` via Zustand
- **Sidebar animation:** `width` transition on `.sidebar` (not `grid-template-columns` — triggers full Layout→Paint pipeline, not GPU-accelerated). The `1fr` content column auto-adjusts when sidebar width changes. Mobile overlay uses `transform: translateX()` for 60fps.
- **Sidebar keyboard shortcut:** `[` key (Linear convention) for toggle
- **Zone B height:** Fixed 4 items × 40px + padding = ~192px. Zone A gets `calc(100dvh - brand - search - zone-b - settings - profile)`
- **Deferred to Phase 2:** Sidebar focus ring color — `#606C38` on `#283618` = 2.27:1 (WCAG 1.4.11 needs 3:1). Use `var(--text-chrome)` (`#a3c48a` = 6.63:1) as sidebar-specific focus ring override.

---

## 6. Sources

### Live Products Analyzed
1. CrewAI Enterprise — crewai.com
2. Linear — linear.app
3. Dify.ai — dify.ai
4. Langflow — langflow.org
5. n8n — n8n.io
6. Kore.ai XO — docs.kore.ai
7. Relevance AI — relevanceai.com
8. Lindy.ai — lindy.ai
9. Vellum AI — vellum.ai
10. Vercel Dashboard — vercel.com
11. Notion — notion.com
12. Retool — retool.com

### Design References
- shadcn/ui Sidebar Component (2026) — ui.shadcn.com/docs/components/radix/sidebar
- Linear Dashboard UI Redesign (2025) — linear.app/now/how-we-redesigned-the-linear-ui
- SaaS Dashboard Anatomy (2026) — saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns
- Notion Sidebar UI Breakdown — medium.com/@quickmasum/ui-breakdown-of-notions-sidebar-2121364ec78d
- CSS Grid Sidebar Layout — MDN Web Docs

### Internal References
- Vision & Identity Document — `_uxui_redesign/phase-0-foundation/vision/vision-identity.md`
- Technical Spec — `_uxui_redesign/phase-0-foundation/spec/technical-spec.md`
- Benchmark Report — `_uxui_redesign/phase-0.5-benchmark/benchmark-report.md`
- Premium SaaS Design Framework — `.claude/plugins/design-mastery/skills/premium-saas-design/SKILL.md`

---

*End of Web Dashboard Layout Research — Phase 1, Step 1-1*
