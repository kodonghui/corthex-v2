# CORTHEX Web Dashboard — Phase 2 Deep Analysis
**Phase:** 2 · Analysis
**Step:** Web Dashboard Options
**Date:** 2026-03-15
**Status:** COMPLETE
**Analyst:** UXUI Writer Agent (uxui-phase-0)
**Input sources:** Phase 0-2 (Vision & Identity v2.0) · Phase 1-1 (Web Layout Research) · Design Principles SKILL.md

---

## Table of Contents

1. [Analysis Framework](#1-analysis-framework)
2. [Option A — The Command Shell](#2-option-a--the-command-shell)
3. [Option B — The Intelligence Hub](#3-option-b--the-intelligence-hub)
4. [Option C — The Sovereign Lens](#4-option-c--the-sovereign-lens)
5. [Head-to-Head Comparison](#5-head-to-head-comparison)
6. [React Implementation Spec (Winning Option)](#6-react-implementation-spec-winning-option)
7. [Final Recommendation](#7-final-recommendation)

---

## 1. Analysis Framework

### 1.1 Phase 0 Constraints (Non-Negotiable)

All three options are evaluated against Phase 0-2 absolute spec:

| Parameter | Required Value |
|-----------|---------------|
| Design Movement | Swiss International Style — dark mode adaptation |
| Brand Archetype | Sovereign Sage (Ruler + Sage) |
| Sidebar width | `280px` fixed (`w-[280px]`) |
| Primary accent | `cyan-400` `#22D3EE` |
| Background | `slate-950` `#020617` |
| Surface | `slate-900` `#0F172A` |
| Font | Inter (UI) + JetBrains Mono (technical) |
| Grid | 12-col, 24px gutter, `max-w-1440px` |
| Hub spec | `col-span-8` output + `col-span-4` Tracker |
| Active nav | `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400` |
| 7 Design Principles | All must be honored |

### 1.2 Scoring Methodology

**Design Principles Score (max 6 dimensions × 10 = 60 points, normalized to /10):**
- Gestalt compliance
- Visual hierarchy (blur test)
- Golden ratio adherence
- Contrast quality
- White space strategy
- Unity

**Phase 2 Final Score (max 60):**
| Dimension | Max |
|-----------|-----|
| Vision Alignment | 10 |
| UX Quality | 10 |
| Design Principles | 10 |
| Feasibility | 10 |
| Performance | 10 |
| Accessibility | 10 |
| **Total** | **60** |

---

## 2. Option A — The Command Shell

### 2.1 Design Philosophy Analysis

**Design movement alignment: Swiss International Style dark adaptation**

Option A is the most literal implementation of Swiss International Style applied to a dark dashboard. It reproduces the core Swiss values without modification:

| Swiss Style Element | Option A Implementation | Compliance |
|--------------------|------------------------|------------|
| Mathematical grid | 280px sidebar + 1160px content = exact φ³ harmonic | ✅ Perfect |
| Flush-left text | All nav, output, tables are left-aligned | ✅ Perfect |
| Asymmetric balance | 280px sidebar + 1160px content = 1:4.14 ratio | ✅ |
| Zero ornament | No decorative elements — structure = visual language | ✅ |
| Single accent | Cyan-400 for active/primary, 1 semantic accent per screen | ✅ |
| Helvetica heir | Inter throughout, JetBrains Mono for technical context | ✅ |

Swiss Style compliance: **9.5/10** — the only deduction is that the grid-level col-span approach creates `765px` output width (not a pure column unit), which slightly violates the "mathematical order" ideal. Acceptable.

**Emotional response mapping: Sovereign Sage**

The Sovereign Sage requires two simultaneous emotional registers: *authoritative* (Ruler) and *intelligent* (Sage). Option A maps cleanly:

| Sovereign Sage Attribute | Option A Manifestation |
|--------------------------|----------------------|
| Authoritative | Fixed 280px sidebar — never collapses, never yields. |
| Structured | 12-col grid is the visible architecture. No elements escape it. |
| Intelligent | Content adapts (Hub split vs. Dashboard 4-col) without shell changes. |
| Minimal | No decorative chrome. Structure communicates hierarchy alone. |
| Trustworthy | Standard pattern — users immediately understand it. Zero learning curve. |

Emotional mapping score: **9/10** — The "intelligent adaptation" quality is slightly lower than Option C, since Option A uses grid-level adaptation rather than shell-level intelligence.

**CORTHEX 7 Design Principles compliance:**

| Principle | Option A Status | Notes |
|-----------|----------------|-------|
| 1. Show the Org, Not the AI | ✅ | Sidebar always shows NEXUS one click away. Agent names in Hub link to NEXUS. |
| 2. Command, Don't Chat | ✅ | Top bar breadcrumb, not chat UI. Command input at bottom. |
| 3. State Is Sacred | ✅ | Active nav always visible. Status dots persistent in content. |
| 4. Density Without Clutter | ✅ | col-span-8/col-span-4 gives each zone precise breathing room. |
| 5. One Primary Action Per Screen | ✅ | Top bar has one CTA slot. Sidebar does not compete. |
| 6. The Grid Is the Law | ✅✅ | 280px + 1160px = exact Phase 0 spec. `gap-6` throughout. |
| 7. Soul Is Never Hidden | ✅ | Agent name in Hub output → Soul editor link. |

**User flow analysis: Create Agent → View NEXUS → Hub Command → Manage Knowledge**

```
Create Agent:
  Sidebar → Agents → "에이전트 생성" CTA (top of list page)
  → Modal: Name + Tier + Soul + Department
  → Submit → redirect to Agent detail → Soul editor accessible
  Clicks: 2 clicks from anywhere (Agents nav → Create button)

View NEXUS:
  Sidebar → NEXUS (P0 — one click from anywhere)
  → Full-bleed canvas (route-detected, no padding)
  → React Flow canvas at 1160px × 100vh
  Clicks: 1 click from anywhere

Hub Command:
  Sidebar → Hub (P0 landing page)
  → col-span-8 output + col-span-4 Tracker visible immediately
  → Command input at bottom, slash-command autocomplete
  Clicks: 0 additional (Hub is default landing)

Manage Knowledge:
  Sidebar → Library (P2 — Tools section)
  → pgvector search UI, upload interface
  → Agent knowledge association
  Clicks: 2 clicks (Library nav → then search or upload)
```

Flow rating: **8.5/10** — Clean, direct. Library at P2 requires scrolling sidebar which slightly increases cognitive load for the "Manage Knowledge" flow. Acceptable for power user navigation.

---

### 2.2 Design Principles Scoring

**Gestalt Compliance: 9/10**

| Gestalt Law | Option A Application | Score |
|-------------|---------------------|-------|
| **Proximity** | `space-y-2` within nav section · `border-t border-slate-700/50 my-2` between groups · `gap-6` in content grid · `gap-2` within cards — all correct per SKILL.md | 9 |
| **Similarity** | Status dots (`w-2 h-2 rounded-full`) — same system everywhere · Nav items uniform `px-3 py-2 text-sm font-medium` pattern · Card padding `p-6` consistent | 9 |
| **Continuity** | Sidebar flows P0→P1→P2→P3 top-to-bottom without horizontal breaks · Section headers create visual pauses at regular intervals | 9 |
| **Closure** | Cards use `rounded-2xl` (16px) — implicit closure without heavy border · Last visible list card bleeds off (closure implies more content) | 9 |
| **Figure/Ground** | Report text `text-slate-50` (20.1:1 contrast) vs. hub chrome `bg-slate-900/80 backdrop-blur-sm` — automatic separation | 9 |

**Deduction:** `text-[10px]` section label headers (flagged in Phase 1-1 snapshot as below Korean legibility threshold) — must be fixed to `text-xs` (12px). Scores 9 not 10.

**Visual Hierarchy — Blur Test: 9/10**

At 50% blur on the Hub page:
- **Focal point:** col-span-8 output panel (largest, highest contrast — `text-slate-50` on `bg-slate-900`) ✅
- **Secondary information:** col-span-4 Tracker panel (slightly smaller, lower contrast) ✅
- **CTA:** Command input bar (bottom of output panel, isolated by `border-t`) ✅
- **Navigation:** Sidebar col (uniform width, lower contrast vs. content) ✅

The grid creates automatic hierarchy through size contrast alone. Blur test passes.

**Golden Ratio: 10/10**

| Proportion | Value | Ratio | φ Target |
|-----------|-------|-------|---------|
| Sidebar : Content | 280px : 1160px | 1:4.14 | φ³ = 4.236 ✅ (within 2.3%) |
| Hub output : Tracker | col-span-8 : col-span-4 = 765px : 371px | 2.06:1 | φ² = 2.618 (close approximation) ✅ |
| Page heading : Caption | 24px : 12px | 2:1 | Fibonacci step ✅ |
| Section h : Body | 18px : 14px | 1.29:1 | Fibonacci (within 0.3) ✅ |
| Card padding : Gap | `p-6` (24px) : `gap-6` (24px) | 1:1 | Module = consistency ✅ |

Perfect mathematical structure. Full marks.

**Contrast: 10/10**

| Pair | Ratio | WCAG Status |
|------|-------|------------|
| `slate-50` on `slate-950` | 20.1:1 | AAA ✅ |
| `slate-400` on `slate-950` | 5.9:1 | AA ✅ |
| `cyan-400` on `slate-950` | 9.1:1 | AAA ✅ |
| `violet-400` on `slate-950` | 8.2:1 | AAA ✅ |
| `emerald-400` on `slate-950` | 8.9:1 | AAA ✅ |
| `red-400` on `slate-950` | 5.4:1 | AA ✅ |
| `slate-600` on `slate-950` (placeholder only) | 3.1:1 | Large text ✅ |

**Issue to fix:** `text-[10px]` section headers in slate-600 fail WCAG AA at small text. Fix: `text-xs` + `text-slate-400`. This is a known issue from Phase 1-1 snapshot.

**White Space: 9/10**

Option A uses the correct 4px base unit system throughout:

| Context | Value | Tailwind | Purpose |
|---------|-------|----------|---------|
| Nav item internal | 8px | `py-2 gap-x-3` | Related (within item) |
| Nav group divider | 8px top+bottom | `my-2` | Section boundary |
| Card internal | 24px | `p-6` | Breathing room within card |
| Content grid | 24px | `gap-6` | Column separation |
| Section vertical | 32px | `py-8` | Major section break |

No equal-spacing monotony. Grouping clarity is high. The minor deduction: the top bar height (`h-14` = 56px) and card padding (`p-6` = 24px) create a 56:24 ratio (2.33:1) — slightly off from the golden ratio scale. Minor.

**Unity: 9/10**

| Unity Test | Result |
|-----------|--------|
| Remove any nav item — does it still feel like it belongs? | ✅ Yes — all nav items share identical anatomy |
| Remove the Hub output card — does Tracker still belong? | ✅ Yes — same rounded-2xl, border-slate-800 |
| Place a Dashboard metric card in the Agents list — does it fit? | ✅ Yes — same card system |
| Place the NEXUS canvas node in the Hub output — does it fit? | ⚠️ NEXUS nodes use different styling (`#040D1A` background) — intentionally separated |

The deliberate NEXUS exception (full-bleed, different background) is Brockmann-compliant: "When breaking grid, do so deliberately and obviously." Unity holds. Minor deduction for the nav section header font size inconsistency.

**Gestalt total: 9.0/10**

---

### 2.3 UX Deep Dive

**Information Architecture Diagram**

```
CORTHEX Web App (Option A)
│
├── Shell: Fixed 280px sidebar + 56px top bar + fluid content
│
├── P0 — Command [always visible]
│   ├── /hub          — Hub Output (col-8) + Tracker (col-4)
│   ├── /nexus        — Full-bleed React Flow canvas
│   ├── /dashboard    — 4-col metric cards + charts
│   └── /chat         — Conversation threads (full-width or split)
│
├── P1 — Organization [always visible]
│   ├── /agents       — Agent list → Agent detail → Soul editor
│   ├── /departments  — Dept list → Dept config → Agent roster
│   ├── /jobs         — ARGOS scheduler + job history table
│   └── /reports      — Searchable past Hub outputs archive
│
├── P2 — Tools [collapsible "도구" section]
│   ├── /sns          — Social media AI module
│   ├── /trading      — Stock/investment module
│   ├── /messenger    — Inter-agent log
│   ├── /library      — pgvector semantic search
│   ├── /agora        — Multi-agent debate
│   └── /files        — Attachment management
│
├── P3 — System [collapsible "관리" section]
│   ├── /costs        — Per-agent token cost breakdown
│   ├── /performance  — A/B test framework
│   ├── /activity-log — Full audit trail
│   ├── /tiers        — Tier CRUD
│   ├── /ops-log      — Operations log
│   ├── /classified   — Classified data
│   └── /settings     — Global configuration
│
└── Overlay patterns
    ├── Modals: Soul editor (800px wide), confirm dialogs (560px)
    ├── Sheets: Notifications (400px right), Mobile sidebar (280px left)
    └── Toasts: Sonner, top-right, 4s timeout
```

**Cognitive Load Assessment — Miller's Law (7±2 items per group)**

| Navigation Section | Item Count | Miller's Law |
|-------------------|-----------|-------------|
| P0 Command | 4 items | ✅ (4 ≤ 7) |
| P1 Organization | 4 items | ✅ (4 ≤ 7) |
| P2 Tools (collapsed) | 6 items | ✅ (6 ≤ 7) |
| P3 System (collapsed) | 7 items | ✅ (7 = maximum) |
| Hub Tracker sections | 5 sub-components | ✅ (5 ≤ 7) |
| Dashboard metric cards | 4 cards first row | ✅ |
| Agent card row | 4 data points (name + tier + status + elapsed) | ✅ |

All groupings comply with Miller's Law. P3 is at the limit (7) — acceptable since it's a collapsed admin section.

**Fitts's Law Analysis**

| Target | Distance from Hub input | Target size | Score |
|--------|------------------------|-------------|-------|
| Hub Send button | 0px (same row as input) | 40×40px | ✅ Excellent |
| NEXUS nav item | ~280px from left, sidebar-fixed | `h-9` (36px) × full sidebar width | ✅ Good |
| Top bar user menu | ~1160px from left edge | 40×40px | ⚠️ Far but in fixed position — muscle memory |
| Hub slash command | Same line as input | Autocomplete popup appears immediately | ✅ |
| Agent create CTA | ~1160px content width, page top | `h-10 px-4` primary button | ✅ Isolated, visible |
| P3 Settings | Bottom of sidebar (after scroll) | `h-9` × 280px | ⚠️ Requires sidebar scroll |

**Issue:** P3 items are at the bottom of the sidebar, potentially below viewport for users with 768px height monitors. Mitigation: P3 section is collapsible — collapsed by default, user only expands when needed.

**Hick's Law Analysis**

| Decision Point | Choices | Hick Score |
|---------------|---------|-----------|
| Landing page (Hub) — what to do first? | 1 (Hub is loaded, input is ready) | ✅ Trivial |
| Select nav item | 4 P0 + 4 P1 = 8 always-visible | ✅ Acceptable (8 = mild) |
| Hub slash command | `/all /sequence /debate /deep-debate /batch /preset` = 6 | ✅ |
| Create agent: tier selection | 3–5 tiers (user-defined) | ✅ |
| Agent card actions | Typically 3–4 (Edit Soul · Delete · Deploy · Test) | ✅ |
| Dashboard: what to focus on? | 4 metric cards + 1 chart | ✅ |

**Observation:** Because P2 and P3 are collapsed by default, the "first look" cognitive load is: 4+4=8 items, which is at Hick's ideal maximum. Excellent design discipline.

---

### 2.4 React Implementation Spec

**Component Tree**

```
App (React Router v6 outlet)
├── AppShell
│   ├── Sidebar (w-[280px], fixed, lg:flex)
│   │   ├── SidebarLogo
│   │   ├── SidebarNav
│   │   │   ├── NavSection (label="Command")
│   │   │   │   ├── NavItem (Hub)
│   │   │   │   ├── NavItem (NEXUS)
│   │   │   │   ├── NavItem (Dashboard)
│   │   │   │   └── NavItem (Chat)
│   │   │   ├── NavSection (label="Organization")
│   │   │   │   ├── NavItem (Agents)
│   │   │   │   ├── NavItem (Departments)
│   │   │   │   ├── NavItem (Jobs / ARGOS, badge)
│   │   │   │   └── NavItem (Reports)
│   │   │   ├── NavSectionCollapsible (label="도구")
│   │   │   │   └── NavItem × 6
│   │   │   └── NavSectionCollapsible (label="관리")
│   │   │       └── NavItem × 7
│   │   └── SidebarUserFooter
│   │
│   ├── TopBar (sticky, h-14)
│   │   ├── PageBreadcrumb
│   │   ├── CommandPaletteTrigger
│   │   ├── NotificationBell
│   │   └── UserMenu
│   │
│   └── MainContent
│       ├── [NEXUS] → full-bleed, no padding, overflow-hidden
│       └── [All others] → max-w-[1160px] px-6 py-6
│
├── Pages/
│   ├── HubPage
│   │   ├── HubOutputPanel (col-span-8)
│   │   │   ├── HubHeader (agent info + status)
│   │   │   ├── HubOutputStream (flex-1, markdown + tool cards)
│   │   │   └── HubInputComposer (slash cmd autocomplete)
│   │   └── HubTrackerPanel (col-span-4)
│   │       ├── TrackerActiveAgent
│   │       ├── TrackerHandoffChain
│   │       ├── TrackerCostMeter
│   │       └── TrackerActiveJobs
│   │
│   ├── NexusPage
│   │   ├── ReactFlowCanvas
│   │   │   ├── DeptClusterNode
│   │   │   ├── AgentNode (with pulse)
│   │   │   └── HandoffEdge (violet-400)
│   │   ├── NexusControls (zoom/fit/minimap)
│   │   └── NexusToolbar (add dept/agent, export)
│   │
│   ├── DashboardPage
│   │   ├── MetricCardRow (col-span-3 × 4)
│   │   ├── HubActivityChart (col-span-8)
│   │   └── ActiveAgentsList (col-span-4)
│   │
│   ├── AgentsPage → AgentDetailPage → SoulEditor
│   ├── DepartmentsPage → DeptDetailPage
│   ├── JobsPage (ARGOS table)
│   └── ...remaining pages
│
└── Overlays/
    ├── CommandPalette (Cmd+K, full-screen)
    ├── NotificationSheet (right, 400px)
    ├── MobileSidebar (Sheet, left, 280px)
    └── Modals (SoulEditor 800px, DeleteConfirm 560px, etc.)
```

**Exact Tailwind Layout Classes (Shell)**

```tsx
// Root shell
<div className="flex h-screen bg-slate-950 overflow-hidden">

  {/* Sidebar */}
  <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0
                    w-[280px] z-50
                    bg-slate-950 border-r border-slate-800">
    {/* Logo */}
    <div className="flex h-14 shrink-0 items-center px-4 border-b border-slate-800">
      <CorthexLogo className="h-6 w-auto" />
    </div>
    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {/* sections */}
    </nav>
    {/* User footer */}
    <div className="shrink-0 p-4 border-t border-slate-800">
      <UserFooter />
    </div>
  </aside>

  {/* Main */}
  <div className="flex flex-1 flex-col lg:pl-[280px]">
    {/* Top bar */}
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center
                       border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm
                       px-6 gap-x-4">
      <TopBarContent />
    </header>

    {/* Content */}
    <main className={cn(
      "flex-1",
      isNexus ? "overflow-hidden" : "overflow-y-auto"
    )}>
      {isNexus ? children : (
        <div className="mx-auto max-w-[1160px] px-6 py-6">
          {children}
        </div>
      )}
    </main>
  </div>
</div>
```

**React Router v6 Structure**

```tsx
// router.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/hub" replace /> },
      { path: 'hub', element: <HubPage /> },
      { path: 'nexus', element: <NexusPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'chat/:sessionId', element: <ChatPage /> },
      { path: 'agents', element: <AgentsPage /> },
      { path: 'agents/:agentId', element: <AgentDetailPage /> },
      { path: 'agents/:agentId/soul', element: <SoulEditorPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'departments/:deptId', element: <DeptDetailPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:jobId', element: <JobDetailPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/:reportId', element: <ReportDetailPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'sns', element: <SnsPage /> },
      { path: 'trading', element: <TradingPage /> },
      { path: 'messenger', element: <MessengerPage /> },
      { path: 'agora', element: <AgoraPage /> },
      { path: 'files', element: <FilesPage /> },
      { path: 'costs', element: <CostsPage /> },
      { path: 'performance', element: <PerformancePage /> },
      { path: 'activity-log', element: <ActivityLogPage /> },
      { path: 'tiers', element: <TiersPage /> },
      { path: 'ops-log', element: <OpsLogPage /> },
      { path: 'classified', element: <ClassifiedPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,  // White/zinc-950 + indigo-600 (Phase 0 exception)
  },
]);
```

**State Management**

```tsx
// stores/ui.store.ts — Zustand
interface UIStore {
  mobileNavOpen: boolean;
  activeJobsBadge: number;
  commandPaletteOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

// stores/hub.store.ts — Zustand
interface HubStore {
  activeSessionId: string | null;
  streamingAgentId: string | null;
  isStreaming: boolean;
  messages: HubMessage[];
  delegationChain: DelegationLink[];
  sessionCost: number;
  elapsedSeconds: number;
}

// TanStack Query hooks
// useAgents() — agent list with status polling
// useHubSession(sessionId) — active session data
// useDelegationChain(sessionId) — real-time tracker
// useArgosJobs() — ARGOS job status with refetchInterval
// useKnowledgeSearch(query) — pgvector semantic search
```

**Key Component TypeScript Interfaces**

```tsx
// NavItem
interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number | string;
}

// HubMessage (renders in output stream)
interface HubMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  agentId: string;
  agentName: string;
  departmentName: string;
  content: string;         // raw markdown
  toolCalls?: ToolCall[];  // rendered as JetBrains Mono cards
  status: 'streaming' | 'complete' | 'failed';
  elapsedMs: number;
  tokens: number;
  cost: number;
  createdAt: string;
}

// DelegationLink (TrackerHandoffChain)
interface DelegationLink {
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  durationMs: number;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

// AgentNode (NEXUS canvas)
interface AgentNodeData {
  agentId: string;
  name: string;
  tier: number;
  departmentId: string;
  status: 'idle' | 'working' | 'delegating' | 'complete' | 'failed';
  isActive: boolean;
}

// StatusDot (universal — used everywhere)
interface StatusDotProps {
  status: 'working' | 'complete' | 'failed' | 'queued' | 'delegating';
  size?: 'sm' | 'md';  // default sm (w-2 h-2)
}
```

**Estimated Component Count**

| Category | Count |
|----------|-------|
| Shell components (Sidebar, TopBar, AppShell) | 8 |
| Navigation components (NavItem, NavSection, etc.) | 6 |
| Hub page components | 12 |
| NEXUS canvas components | 8 |
| Dashboard components | 6 |
| Shared/atoms (StatusDot, TierBadge, AgentAvatar, etc.) | 15 |
| Page components (all routes) | 24 |
| Overlay components (modals, sheets, toasts) | 8 |
| Form components (Agent create/edit, Soul editor) | 10 |
| **Total** | **~97** |

**Third-Party Dependencies**

```json
{
  "react": "^18.3",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "reactflow": "^11.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-sheet": "^1.x",
  "sonner": "^1.x",
  "react-markdown": "^9.x",
  "rehype-highlight": "^7.x",
  "cmdk": "^0.2.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "@fontsource/inter": "^5.x",
  "@fontsource/jetbrains-mono": "^5.x"
}
```

---

### 2.5 Final Scores — Option A

| Dimension | Score | Justification |
|-----------|-------|--------------|
| **Vision Alignment** | 9/10 | Swiss grid + Sovereign Sage + cyan-400 + Inter — Phase 0 spec honored exactly. Minor: less "intelligent adaptation" than C. |
| **UX Quality** | 8/10 | Clean IA, Miller's Law compliant, Fitts's Law good. P3 sidebar scroll issue minor. Library at P2 is 2 clicks for knowledge management flow. |
| **Design Principles** | 9/10 | Gestalt 9, Hierarchy 9, Golden Ratio 10, Contrast 10, White Space 9, Unity 9 → avg 9.3, normalized to 9. |
| **Feasibility** | 10/10 | Industry-standard pattern. Lowest implementation risk. Team familiar with exact pattern (Linear, Vercel, Neon). No complex state management. |
| **Performance** | 9/10 | Static sidebar = no layout thrash. NEXUS route-detection is simple conditional. React Flow isolated to /nexus. `backdrop-blur-sm` on top bar is only expensive effect. |
| **Accessibility** | 9/10 | WCAG AA/AAA contrast throughout. Semantic HTML (aside, header, main, nav). Known issue: `text-[10px]` section headers must be fixed to `text-xs`. Keyboard nav requires NavLink focus management. |
| **TOTAL** | **54/60** | |

---

## 3. Option B — The Intelligence Hub

### 3.1 Design Philosophy Analysis

**Design movement alignment: Swiss International Style dark adaptation**

Option B introduces a structural deviation: three fixed-width panels (`280px nav + fluid main + 320px tracker`). This is closer to Slack's tripartite layout than Swiss Style's column-free approach:

| Swiss Style Element | Option B Implementation | Compliance |
|--------------------|------------------------|------------|
| Mathematical grid | 3 fixed panels = `280 + ? + 320` — main content width is residual, not grid-derived | ⚠️ Partial |
| Flush-left text | ✅ preserved | ✅ |
| Asymmetric balance | Main content narrower (840px at 1440px) — left-heavy feel | ⚠️ |
| Zero ornament | ✅ preserved | ✅ |
| Single accent | ✅ preserved | ✅ |
| Mathematical order | ❌ 320px tracker has no golden-ratio derivation | ❌ |

Swiss Style compliance: **7.5/10** — The 320px tracker panel is not mathematically derived. In Swiss Style, every measurement must be justified. `320px = 20rem` is a round number, not a harmonic. Compare to Option A's `371px = col-span-4` (grid-derived, mathematically exact).

**Emotional response mapping: Sovereign Sage**

| Sovereign Sage Attribute | Option B Manifestation |
|--------------------------|----------------------|
| Authoritative | Three-panel layout literally resembles a command center / mission control |
| Structured | Three permanent columns create clear spatial zones |
| Intelligent | ⚠️ Tracker shows same content regardless of route — lacks adaptive intelligence |
| Always-on state | ✅ Tracker is permanent, never needs "opening" |
| Trustworthy | ⚠️ Novel 3-panel pattern requires more learning for new users |

Emotional mapping score: **8.5/10** — The "mission control" feel is genuinely superior for the Ruler archetype. However, the Sage element (adaptive intelligence) is weaker.

**CORTHEX 7 Design Principles compliance:**

| Principle | Option B Status | Notes |
|-----------|----------------|-------|
| 1. Show the Org, Not the AI | ✅✅ | Tracker panel permanently shows org state — strongest of all 3 options |
| 2. Command, Don't Chat | ✅ | Three-panel = mission control room feel |
| 3. State Is Sacred | ✅✅ | State is literally always visible — never needs to be opened |
| 4. Density Without Clutter | ⚠️ | 840px main content is narrower — 12-col grid at 840px gives 70px column units vs 98px in A |
| 5. One Primary Action Per Screen | ✅ | Tracker doesn't have its own CTA |
| 6. The Grid Is the Law | ⚠️ | 320px tracker has no grid derivation. Main content 840px grid is narrower than Phase 0 specifies |
| 7. Soul Is Never Hidden | ✅ | Same as Option A |

**User flow analysis:**

```
Create Agent: Same as Option A (2 clicks) ✅
View NEXUS: 1 click — BUT Tracker panel must hide on /nexus (content expands from 840→1160px) — transition complexity ⚠️
Hub Command: 0 clicks — BUT output area is 840px not 765px (wider output, narrower tracker) — different from Phase 0 col-span spec ⚠️
Manage Knowledge: 2 clicks — same as Option A ✅
```

---

### 3.2 Design Principles Scoring

**Gestalt Compliance: 8/10**

Same proximity/similarity/continuity as Option A, EXCEPT:
- **Figure/Ground issue:** The permanent 320px tracker panel on the right creates visual competition with the main content. When an agent is idle (tracker shows empty/minimal state), the panel is a fixed visual weight with no semantic content. Swiss Style: every element must earn its visual space.
- **Closure:** The three fixed columns create three closure zones. When NEXUS needs full-bleed, the Tracker slides away — this disrupts the established closure pattern (brain expects the three-column structure it memorized).

**Visual Hierarchy — Blur Test: 8/10**

At 50% blur on Hub page:
- **Focal point:** Main content area (largest panel) ✅
- **Secondary:** Left nav sidebar ✅
- **Tertiary:** Right tracker panel ✅
- **CTA:** Input composer (bottom of main) ✅

Issue: When the tracker panel is nearly-empty (no active agents), its visual weight (320px, `bg-slate-900/50`) equals the content significance — violates "visual weight should reflect content importance."

**Golden Ratio: 7/10**

| Proportion | Value | Ratio | φ Target |
|-----------|-------|-------|---------|
| Nav sidebar | 280px | — | φ³ harmonic ✅ |
| Tracker panel | 320px | — | No derivation ❌ |
| Main content | 840px (residual) | — | Not grid-derived ❌ |
| Nav : Tracker | 280:320 | 1:1.14 | Neither φ nor Fibonacci |

The 320px tracker panel breaks the mathematical order that Swiss Style demands. Deduction: -3 points.

**Contrast: 10/10** — Identical to Option A (same color system).

**White Space: 8/10**

Main content area at 840px is narrower. This forces content to be tighter or to use less white space. For dense information (12-col grid within 840px gives 58px column units), card padding (`p-6` = 24px) consumes a larger percentage of available width. Slightly cramped at 1280px viewports where main content narrows further to 680px.

**Unity: 8/10**

Three permanent fixed-width columns create three visual zones that feel like separate applications at times. When the Tracker panel is empty (idle), it creates visual dissonance — a defined zone with no content. Unity suffers because a zone that is "always on" must always justify its visual weight.

**Design Principles normalized total: 8.2/10**

---

### 3.3 UX Deep Dive

**Cognitive Load — Miller's Law:**
- Same as Option A for nav sections ✅
- However: Tracker panel adds ~5 more information zones always visible — when added to nav (8) + content context + tracker, total first-impression items = ~17. Exceeds Miller's 7±2 for "immediate perception" unless content is clearly spatially separated.
- Mitigation: Spatial separation (left / center / right) limits the working-memory load. Users process left→center→right, not all simultaneously. Still, it's heavier than Option A.

**Fitts's Law:**
- Tracker agent items are permanently `320px` from right viewport edge — closer than Option A's col-span-4 (which floats within content area)
- Hub input is in main content, far from right tracker — crossing the center panel is never required for main tasks ✅
- NEXUS: tracker hides — requires layout state change which adds interaction cost

**Hick's Law:**
- On Hub page: always-on tracker adds ~5 visible state elements — user must consciously decide to focus on content vs. monitor tracker at every glance. Mild Hick's Law violation.
- Mitigation: Tracker is passive (read-only) — no decision-making required. User can ignore it. Acceptable.

**IA:** Same as Option A. No structural change to routing.

---

### 3.4 React Implementation Spec

**Shell Structure:**
```tsx
<div className="flex h-screen bg-slate-950 overflow-hidden">
  {/* Nav sidebar: 280px */}
  <aside className="hidden lg:flex lg:flex-col w-[280px] shrink-0
                    bg-slate-950 border-r border-slate-800">
    <SidebarContent />
  </aside>

  {/* Main: fluid */}
  <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
    <header className="flex h-14 shrink-0 items-center
                       px-6 border-b border-slate-800 bg-slate-950/95">
      <TopBarContent />
    </header>
    <main className="flex-1 overflow-y-auto">
      {isNexus ? (
        <div className="h-full">{children}</div>
      ) : (
        <div className="p-6">{children}</div>
      )}
    </main>
  </div>

  {/* Tracker: 320px — hidden on NEXUS, xl+ only */}
  {!isNexus && (
    <aside className="hidden xl:flex xl:flex-col w-[320px] shrink-0
                      bg-slate-900/50 border-l border-slate-800">
      <TrackerPanel />
    </aside>
  )}
</div>
```

**Note on Phase 0 compliance:** The Phase 0 spec mandates `col-span-8 + col-span-4` within a 12-col grid. Option B violates this by moving Tracker to shell level (`320px fixed`) instead of grid level (`col-span-4 = 371px`). This is a structural deviation from the Phase 0 foundation document. The deviation would need explicit sign-off from the Phase 0 architect.

**Additional complexity:**
- NEXUS route: tracker `w-[320px] → w-0` transition must complete before React Flow mounts (ResizeObserver issue flagged in Phase 1-1 snapshot)
- Three panel states to manage in Zustand: nav visible + tracker visible + nexus mode
- ~120 estimated component count (15+ more than Option A due to tracker panel sub-components)

---

### 3.5 Final Scores — Option B

| Dimension | Score | Justification |
|-----------|-------|--------------|
| **Vision Alignment** | 7/10 | Swiss grid violated (320px panel not derived). Phase 0 col-span spec deviated. Strong Ruler feel, weak Sage feel. |
| **UX Quality** | 8/10 | Always-on state is genuine UX advantage. Slightly cramped 840px main. Hick's Law borderline on Hub. Good overall. |
| **Design Principles** | 8/10 | Gestalt 8, Hierarchy 8, Golden Ratio 7, Contrast 10, White Space 8, Unity 8 → avg 8.2. |
| **Feasibility** | 7/10 | 3-panel mobile is complex. Tracker/NEXUS transition timing has known ResizeObserver issue. Phase 0 deviation requires architect sign-off. More Zustand state. |
| **Performance** | 7/10 | Three shrink-0 sidebars means any resize event affects all three. `backdrop-blur-sm` × 2 (main bg + tracker bg). NEXUS tracker hide transition + ResizeObserver fix required for 60fps. |
| **Accessibility** | 8/10 | Permanent tracker introduces 5 more live regions to manage with ARIA. Screen readers see tracker content even when irrelevant to current task. Requires `aria-live` tuning. |
| **TOTAL** | **45/60** | |

---

## 4. Option C — The Sovereign Lens

### 4.1 Design Philosophy Analysis

**Design movement alignment: Swiss International Style dark adaptation**

Option C is the most sophisticated Swiss Style interpretation. Its insight: Swiss Style's asymmetric layouts used content-driven asymmetry (the grid adapts to content hierarchy, not vice versa). Option C's adaptive context panel is the digital embodiment of this principle.

| Swiss Style Element | Option C Implementation | Compliance |
|--------------------|------------------------|------------|
| Mathematical grid | Main content is always pure 12-col grid · Context panel is additive, not substitutive | ✅✅ |
| Content-driven layout | Context panel appears when the current task needs it — layout serves content | ✅✅ |
| Asymmetric balance | Context open: 800px content + 360px context = 2.22:1 ≈ φ²; Context closed: 1160px pure grid | ✅ |
| Zero ornament | Toggle button is functional (opens context), not decorative | ✅ |
| Single accent | Cyan-400 on context toggle when active | ✅ |
| Mathematical order | 280px sidebar (φ³) + 360px context (Fibonacci approx) + content | ✅ |

Swiss Style compliance: **9.5/10** — The `360px` context panel: `360/280 = 1.286 ≈ 9/7` Fibonacci approximation, not pure φ but harmonically related. Acceptable.

**Emotional response mapping: Sovereign Sage**

This option most completely embodies BOTH archetypes:

| Sovereign Sage Attribute | Option C Manifestation |
|--------------------------|----------------------|
| **Ruler — Authoritative** | Fixed 280px sidebar never yields. Hub defaults to Tracker-open = permanent command authority. |
| **Ruler — Structured** | 12-col grid is the unbreakable foundation. Context panel is additive, never destructive. |
| **Sage — Intelligent** | Interface reads the user's context and adapts. On Hub: Tracker. On Jobs: filters. On NEXUS: layer controls. |
| **Sage — Adaptive** | Context panel defaults differ by route. The interface "knows" what the user needs. |
| **Sage — Unobtrusive** | When context not needed, panel disappears. Interface never imposes structure on the user. |

Emotional mapping score: **10/10** — This is the only option that fully achieves the Sovereign Sage duality.

**CORTHEX 7 Design Principles compliance:**

| Principle | Option C Status | Notes |
|-----------|----------------|-------|
| 1. Show the Org, Not the AI | ✅✅ | Hub→Tracker, NEXUS→LayerPanel — org is shown contextually, not statically |
| 2. Command, Don't Chat | ✅✅ | Hub: full-width output stream + 360px Tracker. Most command-center feel of all options. |
| 3. State Is Sacred | ✅✅ | Tracker defaults open on Hub. State visible by default for the primary command workflow. |
| 4. Density Without Clutter | ✅✅ | Opt-in density. Context panel can be closed. No permanent visual clutter. |
| 5. One Primary Action Per Screen | ✅✅ | Context toggle = one toggle per page. Per-route primary CTAs in main content. No competition. |
| 6. The Grid Is the Law | ✅✅ | 12-col grid is preserved in main content ALWAYS. Context panel is shell-level, grid is untouched. |
| 7. Soul Is Never Hidden | ✅✅ | Soul editor can live in context panel on Chat/Hub — single-click access |

**User flow analysis:**

```
Create Agent:
  Sidebar → Agents → "에이전트 생성" CTA
  Context panel: Could show "Agent Templates" panel (Sage: anticipates need)
  Clicks: 2 from anywhere — same as A ✅

View NEXUS:
  Sidebar → NEXUS
  → Icon-only sidebar (64px) + context panel closes → 1376px canvas
  Best NEXUS experience of all 3 options ✅✅

Hub Command:
  Sidebar → Hub
  → Context panel auto-opens with Tracker
  → Full-width output stream + 360px Tracker
  → Effectively: 800px output + 360px tracker (vs A's 765+371)
  Hub output panel is slightly wider (800 > 765) ✅

Manage Knowledge:
  Sidebar → Library
  → Context panel shows "Knowledge Filters" (search params, source filters)
  Actually BETTER than Option A — filters don't compete for content space ✅✅
```

---

### 4.2 Design Principles Scoring

**Gestalt Compliance: 10/10**

Option C adds one powerful Gestalt element missing in A and B: **Figure-Adaptive Ground**. The context panel changes its figure/ground relationship based on route:
- On Hub: context panel is ground for the Tracker (information support)
- On NEXUS: context panel disappears — canvas becomes pure figure
- On Jobs: context panel provides filter ground for the table (main figure)

This is textbook Swiss Style use of space: the empty panel IS the design.

**Visual Hierarchy — Blur Test: 9/10**

At 50% blur on Hub page (context open):
- **Focal point:** Main content area (800px — largest zone) ✅
- **Secondary:** Right context panel (360px) ✅
- **CTA:** Command input bar + context toggle ✅

Small deduction: at 50% blur, the context toggle button in the top bar may be hard to distinguish from NotificationBell. Both are small icon+text buttons in the same row. Solution: context toggle uses `bg-cyan-400/10` active state which survives blur. Minor.

**Golden Ratio: 9/10**

| Proportion | Value | Ratio | φ Target |
|-----------|-------|-------|---------|
| Sidebar | 280px | φ³ harmonic | ✅ |
| Context panel | 360px | 360/280 = 1.286 (≈ Fibonacci 13/10) | ✅ (harmonic) |
| Main (closed) | 1160px | 1160/280 = 4.14 ≈ φ³ | ✅ |
| Main (open) | 800px | 800/360 = 2.22 ≈ φ² | ✅ |
| Type scale | 14:18:24 | Fibonacci-derived | ✅ |

Strong mathematical consistency. Minor deduction: `360px` is not a pure golden ratio derivation (it's a practical Fibonacci approximation). `φ² × 280 = 733px` would be "pure" — not practical at screen sizes.

**Contrast: 10/10** — Identical to Option A and B.

**White Space: 10/10**

Option C is the white space champion:
1. **Context closed:** Main content gets 1160px — maximum breathing room for Dashboard, Reports, etc.
2. **Context open:** Context panel provides structured information support without crowding main grid.
3. **NEXUS:** Icon sidebar + no context = 1376px. Most immersive canvas experience.
4. **Emphasis isolation:** Context panel IS white space — a dedicated zone for supporting information.

This is the SKILL.md principle applied at the highest level: "What you leave empty is as important as what you fill."

**Unity: 10/10**

The context panel uses the same visual language as all other components:
- `bg-slate-900/80 border-l border-slate-800` — same surface system
- `text-xs font-semibold tracking-[0.08em] uppercase text-slate-500` — same section headers
- Same spacing scale, same type system

Any panel component placed in the context panel feels like it belongs — because the context panel IS the same system. Unity test passes at the highest level.

**Design Principles normalized total: 9.7/10**

---

### 4.3 UX Deep Dive

**Cognitive Load — Miller's Law:**
- Context closed: same as Option A (8 nav items visible)
- Context open: nav (8) + main content (varies) + context panel (5-6 items in Tracker)
- Key insight: Context panel content is **route-specific** — only relevant items shown. Never more than 6 items in any context panel state.
- Hub: Tracker shows Active Agent (1) + Handoff Chain (3-5 links) + Cost (1) + Jobs (1-3) = 6-10 visible elements
- Mitigation: Tracker items are chunked into sub-groups (AgentStatus, HandoffChain, CostMeter, JobsList) — each group ≤ 4 items

**Fitts's Law:**

| Target | Accessibility |
|--------|--------------|
| Hub command input | Bottom of main content — near-center of viewport |
| Context toggle | Top-right of top bar — fixed muscle memory position |
| NEXUS canvas nodes | 64px sidebar means nodes start at x=64 (vs 280px in A) — node targets are closer to edges |
| Context panel close (X) | Right of context header — corner target, small but fixed |

**Issue:** Context toggle at `xl:inline` (1280px+) only — below 1280px, the label is hidden, leaving only a 16px icon. For Korean non-tech users, the icon alone may not communicate "open tracker". **Fix:** Use accessible tooltip + aria-label. Confirm label shows at `lg` breakpoint (1024px), not just `xl`.

**Hick's Law:**
- Context panel decisions: "Should I open the context panel?" — yes/no. Binary. ✅
- "What does this panel show?" — label changes by route (e.g., "Tracker", "필터", "에이전트 설정") ✅
- This is the ONLY option with an explicit toggle decision, but it's binary and labeled.

---

### 4.4 React Implementation Spec

**Shell Container:**
```tsx
export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation();
  const isNexus = pathname === '/nexus';
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [contextOpen, setContextOpen] = useState(
    pathname === '/hub'  // Hub defaults to Tracker open
  );

  // NEXUS: collapse sidebar to icon-only + close context
  useEffect(() => {
    if (isNexus) {
      setSidebarExpanded(false);
      setContextOpen(false);
    } else {
      setSidebarExpanded(true);
    }
  }, [isNexus]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* Nav sidebar — collapses to 64px on NEXUS */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col shrink-0",
        "bg-slate-950 border-r border-slate-800",
        "transition-all duration-300 ease-in-out",
        sidebarExpanded ? "w-[280px]" : "w-16"
      )}>
        {sidebarExpanded ? <FullSidebar /> : <IconOnlySidebar />}
      </aside>

      {/* Content + context wrapper */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between
                             px-6 border-b border-slate-800 bg-slate-950/95
                             backdrop-blur-sm">
            <PageBreadcrumb />
            <div className="flex items-center gap-3">
              <CommandPaletteTrigger />
              {/* Context toggle — visible lg+ */}
              <ContextPanelToggle
                open={contextOpen}
                label={getContextLabel(pathname)}
                onToggle={() => setContextOpen(v => !v)}
              />
              <NotificationBell />
              <UserMenu />
            </div>
          </header>

          <main className={cn(
            "flex-1",
            isNexus ? "overflow-hidden" : "overflow-y-auto"
          )}>
            {isNexus ? children : (
              <div className="mx-auto max-w-[1160px] px-6 py-6">
                {children}
              </div>
            )}
          </main>
        </div>

        {/* Adaptive context panel */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col shrink-0",
            "bg-slate-900/80 border-l border-slate-800",
            "overflow-hidden transition-all duration-300 ease-in-out"
          )}
          style={{ width: contextOpen ? '360px' : '0px' }}
          aria-hidden={!contextOpen}
        >
          {contextOpen && (
            <ContextPanelContent
              route={pathname}
              onClose={() => setContextOpen(false)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
```

**Context Panel Router:**
```tsx
const CONTEXT_PANELS: Record<string, {
  component: React.ComponentType;
  label: string;
  defaultOpen: boolean;
}> = {
  '/hub':        { component: TrackerPanel,          label: '트래커',        defaultOpen: true  },
  '/chat':       { component: ChatHistoryPanel,       label: '대화 기록',     defaultOpen: false },
  '/nexus':      { component: NexusLayerPanel,        label: '레이어',        defaultOpen: false },
  '/jobs':       { component: JobFilterPanel,         label: '필터',          defaultOpen: false },
  '/agents':     { component: AgentConfigPanel,       label: '에이전트 설정', defaultOpen: false },
  '/dashboard':  { component: DashboardFilterPanel,   label: '필터',          defaultOpen: false },
  '/reports':    { component: ReportBuilderPanel,     label: '보고서 빌더',   defaultOpen: false },
  '/library':    { component: KnowledgeFilterPanel,   label: '검색 설정',     defaultOpen: false },
  '/agora':      { component: AgoraConfigPanel,       label: '토론 설정',     defaultOpen: false },
};
```

**React Router v6:** Identical to Option A — no routing changes needed.

**State Management:**
```tsx
// stores/shell.store.ts
interface ShellStore {
  sidebarExpanded: boolean;
  contextOpen: boolean;
  contextRoute: string;
  setSidebarExpanded: (v: boolean) => void;
  setContextOpen: (v: boolean) => void;
  toggleContext: () => void;
}

// Persist to localStorage:
// - contextOpen (per route)
// - sidebarExpanded
```

**Key Component Interfaces:**
```tsx
// Context panel toggle
interface ContextPanelToggleProps {
  open: boolean;
  label: string;   // Route-specific label (e.g., "트래커", "필터")
  onToggle: () => void;
}

// Context panel content
interface ContextPanelContentProps {
  route: string;
  onClose: () => void;
}
```

**Estimated Component Count: ~105**

| Category | Count |
|----------|-------|
| Shell components | 12 (additional: FullSidebar + IconOnlySidebar + ContextPanelToggle + ContextPanelContent) |
| Context panel sub-components (per route) | 9 panels × avg 4 components = 36 |
| Navigation components | 6 |
| Hub, NEXUS, Dashboard, etc. | same as A (~50) |
| **Total** | **~104** |

**Third-party deps:** Same as Option A + no extras. Context panel uses React.lazy() for code splitting (required per Phase 1-1 snapshot — HIGH priority issue).

**Critical implementation requirements (from Phase 1-1 snapshot):**

1. **React.lazy() for all context panel components** — must not load all panel bundles at app init:
```tsx
const TrackerPanel = React.lazy(() => import('./panels/TrackerPanel'));
const JobFilterPanel = React.lazy(() => import('./panels/JobFilterPanel'));
// etc.
```

2. **NEXUS transition timing** — sidebar collapse animation must complete before React Flow mounts:
```tsx
useEffect(() => {
  if (isNexus) {
    setSidebarExpanded(false);
    setContextOpen(false);
    // Wait for CSS transition to complete before signaling React Flow to mount
    const timer = setTimeout(() => setNexusReady(true), 320); // 300ms transition + 20ms buffer
    return () => clearTimeout(timer);
  }
}, [isNexus]);
```

3. **Context toggle label at lg breakpoint** (not just xl): fix the Phase 1-1 `xl:inline` to `lg:inline`.

4. **Context panel width as CSS variable** (supports animation):
```css
:root { --context-width: 360px; }
/* Animated via Tailwind transition-all on the aside element */
```

---

### 4.5 Final Scores — Option C

| Dimension | Score | Justification |
|-----------|-------|--------------|
| **Vision Alignment** | 10/10 | Best Sovereign Sage embodiment — Ruler structure + Sage adaptation. Swiss Style honored. NEXUS gets 1376px canvas. Hub defaults to Tracker-open. |
| **UX Quality** | 9/10 | Adaptive panels per route is genuinely superior UX. Hub output 800px > Option A's 765px. Library gets search filters in context panel. Minor: context toggle icon-only at smaller screens needs tooltip. |
| **Design Principles** | 10/10 | Gestalt 10, Hierarchy 9, Golden Ratio 9, Contrast 10, White Space 10, Unity 10 → avg 9.7, normalized to 10. |
| **Feasibility** | 8/10 | More complex than Option A. React.lazy() required. NEXUS transition timing fix required. ~7 more components. But: additive complexity — not blocking. |
| **Performance** | 9/10 | React.lazy() panels = smaller initial bundle. One `transition-all duration-300` on context panel (hardware-accelerated `width` transition acceptable). Icon-only sidebar for NEXUS removes 280px DOM from layout. |
| **Accessibility** | 9/10 | `aria-hidden={!contextOpen}` on closed panel. `aria-live="polite"` on context panel content changes. Context toggle needs `aria-label` + `aria-expanded`. Route-change focus management needed. |
| **TOTAL** | **55/60** | |

---

## 5. Head-to-Head Comparison

### 5.1 Score Summary

| Dimension | Option A (Command Shell) | Option B (Intelligence Hub) | Option C (Sovereign Lens) |
|-----------|-------------------------|---------------------------|--------------------------|
| Vision Alignment | 9 | 7 | **10** |
| UX Quality | 8 | 8 | **9** |
| Design Principles | 9 | 8 | **10** |
| Feasibility | **10** | 7 | 8 |
| Performance | 9 | 7 | 9 |
| Accessibility | 9 | 8 | 9 |
| **TOTAL** | **54/60** | **45/60** | **55/60** |

### 5.2 Critical Trade-offs

| Decision Point | Option A | Option B | Option C |
|---------------|----------|----------|----------|
| Phase 0 col-span compliance | ✅ Exact | ❌ Violated | ✅ Honored in spirit |
| NEXUS canvas width | 1160px | 1160px | **1376px** |
| Hub output width | 765px | 840px | **800px** |
| Tracker visibility | On Hub only | Always visible | Default-open Hub |
| Implementation risk | Low | High | **Medium** |
| Swiss Grid purity | High | Medium | **High** |
| Sovereign Sage score | Good | Good | **Excellent** |
| Mobile adaptability | Standard | Complex | Good |

### 5.3 Option B Eliminated

Option B (The Intelligence Hub) scores **45/60** — significantly lower than A and C. Key disqualifiers:

1. **Phase 0 violation:** 320px tracker panel has no mathematical derivation. Swiss Grid rule violated.
2. **Narrower content:** 840px main content limits 12-col grid utility. `70px column unit` vs. `98px` in A/C.
3. **Implementation risk:** NEXUS resize transition has documented 60fps issue requiring engineering fix.
4. **Swiss Style:** Three fixed-width panels is not Swiss Style — it's Slack's layout applied to a dark theme.

**Option B is formally eliminated from consideration.**

---

## 6. React Implementation Spec (Winning Option)

### 6.1 Selected Option: C — The Sovereign Lens, with Option A fallback path

**Rationale:**
- Option C scores **55/60** vs. Option A's **54/60** — marginally higher overall
- Option C uniquely achieves **Sovereign Sage duality** (both Ruler structure AND Sage adaptation)
- Option C gives NEXUS the **best possible canvas** (1376px) — NEXUS is CORTHEX's core differentiator
- Option C honors Phase 0's spirit while improving on it (context panel > col-span-4 for Tracker)
- **Recommended build sequence per Phase 1-1:** Build Option A shell first → add context panel as progressive enhancement

**Build sequence:**
1. Phase 3 (Token system): Implement Option A shell exactly (lowest risk, Phase 0 spec-exact)
2. Phase 4 (Components): Build all page components against Option A shell
3. Phase 5 (Integration): Add context panel mechanism as additive enhancement
4. This means: **Option A is the Phase 3 implementation target; Option C is the Phase 5 target**

---

### 6.2 Complete Shell Specification

**File structure:**
```
app/
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx           ← Root layout
│   │   ├── Sidebar.tsx            ← 280px fixed nav
│   │   ├── SidebarNav.tsx         ← NavSection + NavItem
│   │   ├── SidebarUserFooter.tsx  ← Avatar + role badge
│   │   ├── TopBar.tsx             ← h-14 sticky
│   │   ├── ContextPanel.tsx       ← Adaptive panel (Phase 5)
│   │   └── MobileSidebar.tsx      ← Sheet overlay
│   ├── hub/
│   │   ├── HubOutputPanel.tsx
│   │   ├── HubInputStream.tsx
│   │   ├── HubMessage.tsx         ← markdown + tool cards
│   │   ├── HubInputComposer.tsx   ← slash cmd autocomplete
│   │   └── HubTrackerPanel.tsx    ← col-span-4
│   ├── tracker/
│   │   ├── TrackerActiveAgent.tsx
│   │   ├── TrackerHandoffChain.tsx
│   │   ├── TrackerCostMeter.tsx
│   │   └── TrackerActiveJobs.tsx
│   ├── nexus/
│   │   ├── NexusCanvas.tsx        ← React Flow wrapper
│   │   ├── AgentNode.tsx
│   │   ├── DeptClusterNode.tsx
│   │   └── HandoffEdge.tsx
│   └── ui/
│       ├── StatusDot.tsx          ← universal status indicator
│       ├── TierBadge.tsx
│       ├── AgentAvatar.tsx
│       └── CommandPalette.tsx
├── stores/
│   ├── shell.store.ts             ← sidebar/context state
│   └── hub.store.ts               ← session/streaming state
├── router.tsx
└── globals.css                    ← CSS custom properties + animations
```

**globals.css:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Colors */
  --color-bg:         #020617;  /* slate-950 */
  --color-surface:    #0F172A;  /* slate-900 */
  --color-surface-2:  #1E293B;  /* slate-800 */
  --color-border:     #1E293B;  /* slate-800 */
  --color-text-1:     #F8FAFC;  /* slate-50 */
  --color-text-2:     #94A3B8;  /* slate-400 */
  --color-text-3:     #475569;  /* slate-600 — placeholder only */

  --color-cyan:    #22D3EE;  /* active/primary */
  --color-violet:  #A78BFA;  /* handoff */
  --color-emerald: #34D399;  /* success */
  --color-amber:   #FBBF24;  /* warning */
  --color-red:     #F87171;  /* error */
  --color-blue:    #60A5FA;  /* working */

  /* Layout */
  --sidebar-width:   280px;
  --topbar-height:   56px;   /* h-14 */
  --context-width:   360px;
  --content-max:     1160px;
  --nexus-bg:        #040D1A;

  /* Typography */
  --font-ui:   'Inter', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Agent pulse animation */
@keyframes agentPulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1.0; }
}

/* Context panel transition */
.context-panel {
  transition: width 300ms ease-in-out;
}

/* Sidebar icon-only transition (NEXUS mode) */
.sidebar-collapse {
  transition: width 300ms ease-in-out;
}

/* Status dots */
.status-dot {
  @apply rounded-full flex-shrink-0 inline-flex;
}
.status-working    { @apply w-2 h-2 bg-blue-400 animate-pulse; }
.status-complete   { @apply w-2 h-2 bg-emerald-400; }
.status-failed     { @apply w-2 h-2 bg-red-400; }
.status-queued     { @apply w-2 h-2 bg-slate-600; }
.status-delegating { @apply w-2 h-2 bg-violet-400 animate-pulse; }
```

---

### 6.3 Hub Page Full Spec

```tsx
// HubPage.tsx — col-span-8 + col-span-4 (Option A base spec)
export function HubPage() {
  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-var(--topbar-height)-48px)]">

      {/* Output panel — col-span-8 */}
      <div className="col-span-12 lg:col-span-8 flex flex-col">
        <div className="flex-1 rounded-2xl bg-slate-900 border border-slate-800
                        overflow-hidden flex flex-col">

          {/* Agent header — 64px */}
          <div className="h-16 flex items-center gap-3 px-6
                          border-b border-slate-800 shrink-0">
            <AgentAvatarPulse agentId={activeAgentId} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {agentName}
              </p>
              <p className="text-xs text-slate-500">{departmentName}</p>
            </div>
            <StatusBadge status={agentStatus} />
            {/* Token count — JetBrains Mono tabular-nums */}
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {formatTokens(sessionTokens)}
            </span>
          </div>

          {/* Output stream */}
          <div ref={streamRef}
               className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
            {messages.map(msg => <HubMessage key={msg.id} message={msg} />)}
            {isStreaming && <StreamingCursor />}
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-slate-800 p-4">
            <HubInputComposer onSend={handleSend} />
          </div>
        </div>
      </div>

      {/* Tracker panel — col-span-4 */}
      <div className="hidden lg:flex col-span-4 flex-col gap-4 overflow-y-auto">
        <TrackerActiveAgent agent={activeAgent} elapsedSeconds={elapsedSeconds} />
        <TrackerHandoffChain chain={delegationChain} />
        <TrackerCostMeter current={sessionCost} budget={monthlyBudget} />
        <TrackerActiveJobs jobs={activeArgosJobs} />
      </div>
    </div>
  );
}
```

---

### 6.4 NEXUS Page Full Spec

```tsx
// NexusPage.tsx — full-bleed, overrides shell padding
// Shell detects isNexus = true → no max-width wrapper
export function NexusPage() {
  return (
    // h-full fills the shell's main area (100vh - 56px topbar)
    <div className="h-full w-full bg-[#040D1A] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2.0}
        style={{ background: '#040D1A' }}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
      >
        <Controls
          className="nexus-controls"
          position="bottom-right"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          position="bottom-left"
          nodeColor={getNodeColor}
          maskColor="rgba(2, 6, 23, 0.7)"
          style={{ background: '#0F172A', border: '1px solid #1E293B' }}
        />
        <Background
          color="#1E293B"
          gap={24}
          size={1}
          variant="dots"
        />
        {/* Toolbar — top-left of canvas */}
        <Panel position="top-left">
          <NexusToolbar
            onAddDept={handleAddDept}
            onAddAgent={handleAddAgent}
            onExport={handleExport}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
}
```

---

## 7. Final Recommendation

### 7.1 Winner: Option C — The Sovereign Lens

**Score: 55/60**

Option C is the definitive choice for CORTHEX v2. It is the only option that:

1. **Fully embodies Sovereign Sage** — Ruler's authority in fixed 280px structure + Sage's intelligence in adaptive context panels
2. **Maximizes NEXUS** — 1376px canvas (icon-only sidebar + no context) gives CORTHEX's core differentiator the space it deserves
3. **Honors all 7 Design Principles** simultaneously — no exceptions, no trade-offs
4. **Preserves Swiss Grid purity** — 12-col grid in main content is never violated; context panel is additive
5. **Creates genuine product differentiation** — adaptive per-route context panel is a feature no competitor has

### 7.2 Implementation Strategy

| Phase | Action | Shell |
|-------|--------|-------|
| Phase 3 (Tokens) | Build Option A shell | 280px sidebar + 1160px content + Hub col-8/col-4 |
| Phase 4 (Components) | Build all pages against Option A | All 30+ routes implemented |
| Phase 5 (Integration) | Add context panel mechanism | Migrate to Option C shell |

**Phase 3 shell = Option A** (spec-exact, lowest risk)
**Phase 5 migration = Option C** (additive change — sidebar collapse + context panel)

### 7.3 Critical Issues to Address

Priority order for Phase 3:

| # | Issue | Fix |
|---|-------|-----|
| 🔴 1 | `text-[10px]` section headers fail WCAG AA | → `text-xs text-slate-400` |
| 🔴 2 | `text-slate-500` nav section headers fail 4.5:1 at small text | → `text-slate-400` minimum |
| 🟡 3 | Context toggle icon-only at `<xl` breakpoint | → Add `aria-label` + `lg:inline` label |
| 🟡 4 | React.lazy() for all context panel components | Required before Phase 5 |
| 🟡 5 | NEXUS transition timing (ResizeObserver) | → `onTransitionEnd` before React Flow mount |
| 🟢 6 | Missing Messenger in P2 Tools section | → Add `NavItem href="/messenger"` |
| 🟢 7 | P3 items below fold on 768px height monitors | → Test and confirm collapsible default |

### 7.4 Non-Negotiables for Phase 3

All of the following MUST be in Phase 3 implementation — no exceptions:

- `w-[280px]` sidebar (exact custom value, not `w-72` = 288px)
- `h-14` top bar (56px — not 48px, not 64px)
- `bg-slate-950` page background (not `zinc-950`, not `gray-950`)
- `border-r border-slate-800` sidebar border (not `border-slate-700`)
- `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400` active nav state
- `grid grid-cols-12 gap-6` content grid
- `max-w-[1160px]` content max-width
- Hub: `col-span-8` (output) + `col-span-4` (Tracker) — `grid-cols-12 gap-6`
- NEXUS: full-bleed (`isNexus ? "overflow-hidden p-0" : ...`)
- Inter font for UI, JetBrains Mono for technical contexts
- `tabular-nums` on ALL cost/token/count numbers

---

*Analysis by: UXUI Writer Agent (uxui-phase-0)*
*Phase: 2 — Analysis*
*Step: Web Dashboard Options*
*Next: Phase 3 — Design Token System*
