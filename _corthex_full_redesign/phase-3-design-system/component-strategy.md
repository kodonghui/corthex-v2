# CORTHEX Component Strategy — Phase 3-2
**Phase:** 3 · Design System
**Step:** 3-2 · Component Strategy
**Date:** 2026-03-15
**Version:** 2.0
**Authority:** Phase 0-2 Vision & Identity v2.0 + Phase 2 Analysis Winners + Design Tokens v1.0
**Movement:** Swiss International Style — Dark Mode Adaptation

---

## Table of Contents

1. [Component Library Decision](#1-component-library-decision)
2. [Web Dashboard Components (~97 total)](#2-web-dashboard-components-97-total)
3. [App (Capacitor) Components (~40 total)](#3-app-capacitor-components-40-total)
4. [Landing Page Components](#4-landing-page-components)
5. [Shared Components (packages/ui)](#5-shared-components-packagesui)
6. [Stitch Generation Strategy](#6-stitch-generation-strategy)
7. [State Management Strategy](#7-state-management-strategy)
8. [Code Splitting Strategy](#8-code-splitting-strategy)

---

## 1. Component Library Decision

### 1.1 Recommendation: shadcn/ui

**Winner: shadcn/ui** — confirmed by Phase 2 summary ("shadcn/ui base recommended").

### 1.2 Evaluation Matrix

| Criterion | Weight | shadcn/ui | Headless UI | Radix Only | Custom |
|-----------|--------|-----------|-------------|------------|--------|
| Tailwind 4 compat | x2 | 10 | 7 | 8 | 10 |
| Dark-mode first | x2 | 9 | 8 | 8 | 10 |
| Accessibility (a11y) | x1.5 | 9 | 10 | 10 | 6 |
| Bundle size | x1 | 8 | 9 | 9 | 10 |
| Customization depth | x2 | 10 | 8 | 9 | 10 |
| Community / ecosystem | x1.5 | 10 | 4 | 7 | 2 |
| **Weighted total** | — | **56.5** | **46** | **51.5** | **48** |

### 1.3 Justification

1. **Unstyled primitives + Tailwind = perfect for CORTHEX dark theme.** shadcn/ui components are CSS-variable-driven wrappers over Radix Primitives. Every class is overridable. CORTHEX's `slate-950` background, `cyan-400` accent, and Inter typography slot directly into shadcn/ui's CSS variable system with zero friction.
2. **Copy-paste, not npm dependency.** Components live in `packages/ui/src/` as owned source code. No black-box runtime. Every Tailwind class, every ARIA attribute is directly editable. This is critical for CORTHEX's exact pixel-spec (280px sidebar, not 288px; slate-950, not zinc-950).
3. **Radix accessibility underneath.** Dialog, Select, Tooltip, DropdownMenu, Sheet — all inherit WAI-ARIA roles, keyboard navigation, and focus management from Radix. WCAG 2.1 AA covered by default.
4. **CVA variant system.** The existing `packages/ui/` already uses `class-variance-authority`. shadcn/ui is the standard origin of CVA patterns — zero architectural friction.
5. **21st.dev ecosystem.** Premium SaaS patterns (animated buttons, AI chat inputs, gradient cards) are built on shadcn/ui. Drop-in compatibility.

### 1.4 shadcn/ui Components to Use vs. Custom-Build

#### Use from shadcn/ui (with CORTHEX token overrides)

| Component | shadcn/ui Source | CORTHEX Override |
|-----------|-----------------|-----------------|
| Button | `components/ui/button.tsx` | CVA variants: primary (cyan-400), secondary, ghost, destructive per Phase 0 |
| Input | `components/ui/input.tsx` | `border-slate-700 bg-slate-900` base |
| Select | `components/ui/select.tsx` | Radix Select with slate-900 dropdown |
| Checkbox | `components/ui/checkbox.tsx` | `data-[state=checked]:bg-cyan-400` |
| Switch | `components/ui/switch.tsx` | Track: `slate-700 → cyan-400` |
| Dialog (Modal) | `components/ui/dialog.tsx` | Overlay: `bg-slate-950/80 backdrop-blur-sm` |
| Sheet | `components/ui/sheet.tsx` | MobileSidebar + bottom sheets |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | `bg-slate-900 border-slate-700` |
| Tooltip | `components/ui/tooltip.tsx` | `bg-slate-800 text-slate-200` |
| Popover | `components/ui/popover.tsx` | Command palette results |
| Tabs | `components/ui/tabs.tsx` | `data-[state=active]:text-cyan-400` |
| Table | `components/ui/table.tsx` | DataTable base with `tabular-nums` |
| Badge | `components/ui/badge.tsx` | CVA semantic variants (active, success, error, etc.) |
| Separator | `components/ui/separator.tsx` | `bg-slate-800` |
| ScrollArea | `components/ui/scroll-area.tsx` | Radix ScrollArea for Hub output |
| Avatar | `components/ui/avatar.tsx` | AgentAvatar base |
| Progress | `components/ui/progress.tsx` | `bg-cyan-400` track |
| Skeleton | `components/ui/skeleton.tsx` | `bg-slate-800 animate-pulse` |
| Toast | `components/ui/toast.tsx` | Notification system |
| Command | `components/ui/command.tsx` | CommandPalette (cmdk) |
| Label | `components/ui/label.tsx` | Form labels |
| Textarea | `components/ui/textarea.tsx` | HubInputComposer base |

#### Custom-Build (no shadcn/ui equivalent)

| Component | Reason |
|-----------|--------|
| StatusDot | CORTHEX-specific semantic status with color-blind safe shapes |
| TierBadge | Custom tier hierarchy display |
| AgentAvatar | Avatar + StatusDot + pulse composite |
| AgentAvatarPulse | Agent working animation (`opacity 0.7→1.0 1.5s`) |
| StreamingCursor | SSE text streaming with rAF batching |
| ToolCallCard | Expandable tool execution display |
| MarkdownRenderer | Hub output markdown with code highlighting |
| NexusCanvas | React Flow wrapper (full custom) |
| AgentNode | React Flow custom node |
| DeptClusterNode | React Flow custom group node |
| HandoffEdge | React Flow custom animated edge |
| HubInputComposer | Slash-command autocomplete + file attach |
| TrackerActiveAgent | Real-time SSE-connected agent state |
| TrackerHandoffChain | Animated delegation visualization |
| TrackerCostMeter | Budget progress with `tabular-nums` |
| CommandPalette | cmdk-based global search (wraps shadcn Command) |
| DataTable | TanStack Table + shadcn Table composite |
| StatCard | Dashboard metric card with sparkline |

---

## 2. Web Dashboard Components (~97 total)

### 2.1 Shell Components (10)

#### AppShell
```
File:    components/shell/app-shell.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface AppShellProps {
  children: React.ReactNode;
}
```
Root layout container. `flex h-screen bg-slate-950 overflow-hidden`. Detects `/nexus` route to toggle sidebar collapse and full-bleed mode. Phase 3 builds Option A shell (280px sidebar + 1160px content). Phase 5 adds context panel (Option C migration).

**Dependencies:** React Router `useLocation`, Zustand `useShellStore`

---

#### Sidebar
```
File:    components/shell/sidebar.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}
```
Fixed 280px sidebar (`w-[280px]`, NOT `w-72`). Collapses to 64px icon rail on NEXUS route. `bg-slate-950 border-r border-slate-800`. Contains SidebarNav + SidebarUserFooter.

**Dependencies:** `cn()` utility, Zustand `useShellStore`

---

#### SidebarNav
```
File:    components/shell/sidebar-nav.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SidebarNavProps {
  sections: SidebarNavSectionData[];
  currentPath: string;
}
```
Renders 4 nav sections (COMMAND, ORGANIZATION, TOOLS, SYSTEM). P2+P3 sections collapsible by default when viewport height < 900px.

**Dependencies:** SidebarNavSection, SidebarNavItem

---

#### SidebarNavSection
```
File:    components/shell/sidebar-nav-section.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SidebarNavSectionProps {
  label: string;          // e.g., "COMMAND", "ORGANIZATION"
  items: NavItemData[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}
```
Section header: `text-xs font-semibold tracking-[0.08em] uppercase text-slate-400`. Collapsible for P2/P3 groups.

---

#### SidebarNavItem
```
File:    components/shell/sidebar-nav-item.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SidebarNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;         // Notification count badge
  isActive: boolean;
}
```
Active state: `bg-cyan-400/10 border-l-2 border-cyan-400 text-cyan-400`. Inactive: `text-slate-400 hover:text-slate-200 hover:bg-slate-800/50`. Touch target: 44px min height.

---

#### SidebarUserFooter
```
File:    components/shell/sidebar-user-footer.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SidebarUserFooterProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
}
```
Bottom of sidebar. Avatar (32px) + name + role badge. `border-t border-slate-800 p-4`.

---

#### TopBar
```
File:    components/shell/top-bar.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface TopBarProps {
  children?: React.ReactNode;
}
```
`h-14` (56px) sticky header. `bg-slate-950/95 backdrop-blur-sm border-b border-slate-800`. Contains TopBarBreadcrumb (left) + TopBarActions (right). Includes `@supports` fallback for `backdrop-filter`.

**Dependencies:** TopBarBreadcrumb, TopBarActions

---

#### TopBarBreadcrumb
```
File:    components/shell/top-bar-breadcrumb.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface TopBarBreadcrumbProps {
  segments: Array<{ label: string; href?: string }>;
}
```
Route-aware breadcrumb. `text-sm text-slate-400`. Active segment: `text-slate-50`.

---

#### TopBarActions
```
File:    components/shell/top-bar-actions.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface TopBarActionsProps {
  children?: React.ReactNode;
}
```
Right side of TopBar. Contains CommandPaletteTrigger, NotificationBell, and (Phase 5) ContextPanelToggle. `flex items-center gap-3`.

---

#### ContextPanel
```
File:    components/shell/context-panel.tsx
Stitch:  hand-coded
Base:    Custom layout
```
```tsx
interface ContextPanelProps {
  route: string;
  open: boolean;
  onClose: () => void;
}
```
**Phase 5 enhancement.** 360px adaptive panel. Route-aware content: Hub → TrackerPanel, Jobs → JobFilterPanel, Library → KnowledgeFilterPanel. `bg-slate-900/80 border-l border-slate-800`. Transition: `transform: translateX()` (GPU-accelerated, not `width` transition). All sub-panel components loaded via `React.lazy()`.

**Dependencies:** Zustand `useShellStore`, React.lazy per-panel components

---

#### MobileSidebar
```
File:    components/shell/mobile-sidebar.tsx
Stitch:  stitch-partial
Base:    shadcn/ui Sheet
```
```tsx
interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```
Sheet overlay from left on `<lg` breakpoints. Contains same SidebarNav content. Focus trap active when open. `aria-modal="true"`.

**Dependencies:** shadcn/ui Sheet, SidebarNav, SidebarUserFooter

---

### 2.2 Hub Components (10)

#### HubPage
```
File:    components/hub/hub-page.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface HubPageProps {}
```
`grid grid-cols-12 gap-6`. col-span-8 (HubOutputPanel) + col-span-4 (HubTrackerPanel). Full height: `h-[calc(100vh-var(--topbar-height)-48px)]`. Mobile: single column, tracker hidden.

**Dependencies:** HubOutputPanel, HubTrackerPanel

---

#### HubOutputPanel
```
File:    components/hub/hub-output-panel.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface HubOutputPanelProps {
  sessionId: string;
  messages: HubMessageData[];
  isStreaming: boolean;
  activeAgent: AgentSummary | null;
}
```
`col-span-8` output stream. Contains agent header (64px), scrollable message area (Radix ScrollArea), and HubInputComposer. `rounded-2xl bg-slate-900 border border-slate-800`.

**Dependencies:** AgentAvatarPulse, HubMessage, StreamingCursor, HubInputComposer, shadcn/ui ScrollArea

---

#### HubInputStream
```
File:    components/hub/hub-input-stream.tsx
Stitch:  hand-coded
Base:    Custom
```
```tsx
interface HubInputStreamProps {
  messages: HubMessageData[];
  isStreaming: boolean;
  onScrollToBottom: () => void;
}
```
Scroll-locked message list. Uses `useRef` + `scrollIntoView` for auto-scroll on new messages. `overflow-y-auto px-6 py-4 space-y-4 scroll-smooth`.

**Dependencies:** HubMessage, StreamingCursor

---

#### HubMessage
```
File:    components/hub/hub-message.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface HubMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: ToolCallData[];
    timestamp: string;
    agentId?: string;
    agentName?: string;
  };
}
```
Hub output is command-output style (NOT chat bubbles). User commands: monospace, `bg-slate-800/50 rounded-lg p-3 font-mono text-sm`. Agent output: rendered markdown. Visually differentiated from Chat page bubbles per Phase 2 critic fix #5.

**Dependencies:** MarkdownRenderer, ToolCallCard

---

#### HubInputComposer
```
File:    components/hub/hub-input-composer.tsx
Stitch:  hand-coded
Base:    shadcn/ui Textarea + Command
```
```tsx
interface HubInputComposerProps {
  onSend: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}
```
Slash-command autocomplete input. `/` triggers command palette dropdown. Auto-resize textarea. `border-t border-slate-800 p-4`. Supports file attachment button.

**Dependencies:** shadcn/ui Command (cmdk), shadcn/ui Textarea

---

#### HubTrackerPanel
```
File:    components/hub/hub-tracker-panel.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface HubTrackerPanelProps {
  activeAgent: AgentSummary | null;
  handoffChain: HandoffLink[];
  sessionCost: number;
  monthlyBudget: number;
  activeJobs: JobSummary[];
}
```
`col-span-4` right panel. Contains 4 stacked tracker sub-components. `flex flex-col gap-4 overflow-y-auto`. Hidden on mobile (`hidden lg:flex`).

**Dependencies:** TrackerActiveAgent, TrackerHandoffChain, TrackerCostMeter, TrackerActiveJobs

---

#### TrackerActiveAgent
```
File:    components/tracker/tracker-active-agent.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface TrackerActiveAgentProps {
  agent: {
    id: string;
    name: string;
    department: string;
    tier: number;
    status: AgentStatus;
    soul: string;
  } | null;
  elapsedSeconds: number;
}
```
Active agent card with pulse animation. Shows agent name, department, tier badge, status dot, elapsed time (`JetBrains Mono tabular-nums`). `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** AgentAvatarPulse, TierBadge, StatusDot

---

#### TrackerHandoffChain
```
File:    components/tracker/tracker-handoff-chain.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface TrackerHandoffChainProps {
  chain: Array<{
    agentId: string;
    agentName: string;
    status: 'completed' | 'active' | 'pending';
    durationMs?: number;
  }>;
}
```
Vertical chain visualization. Connected dots with lines. Active: `border-cyan-400`, completed: `border-emerald-400`, pending: `border-slate-600`. `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** StatusDot, AgentAvatar

---

#### TrackerCostMeter
```
File:    components/tracker/tracker-cost-meter.tsx
Stitch:  stitch-safe
Base:    shadcn/ui Progress
```
```tsx
interface TrackerCostMeterProps {
  current: number;         // Current session cost in USD
  budget: number;          // Monthly budget in USD
  currency?: string;       // Default "USD"
}
```
Budget progress bar. `JetBrains Mono tabular-nums` for all numbers. Color shifts: <70% cyan-400, 70-90% amber-400, >90% red-400. `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** shadcn/ui Progress

---

#### TrackerActiveJobs
```
File:    components/tracker/tracker-active-jobs.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface TrackerActiveJobsProps {
  jobs: Array<{
    id: string;
    name: string;
    status: 'running' | 'scheduled' | 'completed' | 'failed';
    progress?: number;
    nextRunAt?: string;
  }>;
  maxVisible?: number;     // Default 3
}
```
Compact job list in tracker. Shows top N active/scheduled jobs. Link to full Jobs page. `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** StatusDot, shadcn/ui Progress

---

#### StreamingCursor
```
File:    components/hub/streaming-cursor.tsx
Stitch:  hand-coded
Base:    Custom
```
```tsx
interface StreamingCursorProps {
  text?: string;           // Currently streaming text chunk
  agentName?: string;
}
```
Blinking cursor at end of streaming text. Uses `requestAnimationFrame` for smooth character-by-character render. `animate-pulse` opacity blink on cursor block. `@media (prefers-reduced-motion: reduce)` disables animation.

---

#### ToolCallCard
```
File:    components/hub/tool-call-card.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface ToolCallCardProps {
  toolCall: {
    id: string;
    toolName: string;
    input: Record<string, unknown>;
    output?: string;
    status: 'running' | 'completed' | 'failed';
    durationMs?: number;
  };
  defaultExpanded?: boolean;
}
```
Expandable card showing tool execution. Header shows tool name + status. Collapsed: 1 line. Expanded: input JSON + output. `bg-slate-800/50 rounded-lg border border-slate-700 p-3`. `JetBrains Mono` for JSON content.

**Dependencies:** StatusDot, shadcn/ui Collapsible (Radix)

---

#### MarkdownRenderer
```
File:    components/hub/markdown-renderer.tsx
Stitch:  hand-coded
Base:    Custom (react-markdown + remark-gfm)
```
```tsx
interface MarkdownRendererProps {
  content: string;
  className?: string;
}
```
Renders agent markdown output. Supports GFM tables, code blocks (syntax highlighting), lists, links. Code blocks: `bg-slate-800 rounded-lg p-4 font-mono text-sm`. Uses `remark-gfm` + `rehype-highlight`.

---

### 2.3 NEXUS Components (7)

#### NexusCanvas
```
File:    components/nexus/nexus-canvas.tsx
Stitch:  hand-coded
Base:    @xyflow/react v12
```
```tsx
interface NexusCanvasProps {
  nodes: NexusNode[];
  edges: NexusEdge[];
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  editable?: boolean;
}
```
Full-bleed React Flow canvas. `bg-[#040D1A]`. Shell detects `/nexus` → removes padding, collapses sidebar to 64px. `minZoom={0.1} maxZoom={2.0} fitView`. Background: dot pattern `#1E293B gap-24`.

**Dependencies:** `@xyflow/react` v12, AgentNode, DeptClusterNode, HandoffEdge, NexusToolbar, NexusMiniMap, NexusControls

---

#### AgentNode
```
File:    components/nexus/agent-node.tsx
Stitch:  stitch-partial
Base:    React Flow custom node
```
```tsx
interface AgentNodeProps {
  data: {
    agentId: string;
    name: string;
    department: string;
    tier: number;
    status: AgentStatus;
    soul: string;
    avatar?: string;
  };
  selected: boolean;
}
```
Custom React Flow node. `w-[200px] rounded-2xl bg-slate-900 border border-slate-800 p-3`. Selected: `border-cyan-400 shadow-lg shadow-cyan-400/10`. Shows AgentAvatar, name, TierBadge, StatusDot. Draggable.

**Dependencies:** AgentAvatar, TierBadge, StatusDot, React Flow `Handle`

---

#### DeptClusterNode
```
File:    components/nexus/dept-cluster-node.tsx
Stitch:  stitch-partial
Base:    React Flow custom group node
```
```tsx
interface DeptClusterNodeProps {
  data: {
    deptId: string;
    name: string;
    color: string;          // Department accent color
    agentCount: number;
  };
  selected: boolean;
}
```
Group node that contains agent nodes. `border border-violet-400/20 rounded-3xl` with department label. Semi-transparent background. Acts as React Flow parent node for child AgentNodes.

**Dependencies:** React Flow group node API

---

#### HandoffEdge
```
File:    components/nexus/handoff-edge.tsx
Stitch:  hand-coded
Base:    React Flow custom edge
```
```tsx
interface HandoffEdgeProps {
  data: {
    status: 'active' | 'completed' | 'idle';
    handoffCount: number;
  };
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}
```
Custom animated edge. Active: `stroke-violet-400 strokeWidth-2` with animated dash pattern. Completed: `stroke-emerald-400`. Idle: `stroke-slate-600`. Label shows handoff count.

**Dependencies:** React Flow custom edge API, SVG animation

---

#### NexusToolbar
```
File:    components/nexus/nexus-toolbar.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface NexusToolbarProps {
  onAddDept: () => void;
  onAddAgent: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onFitView: () => void;
}
```
Top-left floating toolbar. `bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-800 p-2 flex gap-1`. Icon buttons for add department, add agent, export, fit view.

**Dependencies:** shadcn/ui Button (icon variant), shadcn/ui DropdownMenu (export format)

---

#### NexusMiniMap
```
File:    components/nexus/nexus-mini-map.tsx
Stitch:  hand-coded
Base:    React Flow MiniMap
```
```tsx
interface NexusMiniMapProps {
  nodeColor: (node: NexusNode) => string;
}
```
Bottom-left overview minimap. `bg-slate-900 border border-slate-800 rounded-xl`. Mask: `rgba(2, 6, 23, 0.7)`. Node colors map to status colors.

**Dependencies:** React Flow `MiniMap` component

---

#### NexusControls
```
File:    components/nexus/nexus-controls.tsx
Stitch:  stitch-partial
Base:    React Flow Controls
```
```tsx
interface NexusControlsProps {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
}
```
Bottom-right zoom/fit controls. Styled to match CORTHEX theme: `bg-slate-900 border border-slate-800 rounded-xl`. Overrides React Flow default Controls styling.

**Dependencies:** React Flow `Controls` component

---

### 2.4 Agent/Department Management (8)

#### AgentList
```
File:    components/agents/agent-list.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface AgentListProps {
  agents: AgentSummary[];
  onSelect: (agentId: string) => void;
  view: 'grid' | 'list';
  filters?: AgentFilters;
}
```
Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) or list view. Filterable by department, tier, status. Contains AgentCards.

**Dependencies:** AgentCard, SearchInput, shadcn/ui Select (filters)

---

#### AgentCard
```
File:    components/agents/agent-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    department: string;
    tier: number;
    status: AgentStatus;
    soul: string;
    avatar?: string;
    lastActiveAt?: string;
    totalTokens?: number;
  };
  onClick: (agentId: string) => void;
  selected?: boolean;
}
```
`rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-colors`. Shows avatar, name, department, tier badge, status dot, last active time.

**Dependencies:** AgentAvatar, TierBadge, StatusDot

---

#### AgentDetail
```
File:    components/agents/agent-detail.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface AgentDetailProps {
  agentId: string;
}
```
Full agent detail view. Sections: profile header, system prompt, tool assignments, performance stats, activity log. Uses TanStack Query for data fetching.

**Dependencies:** AgentAvatar, TierBadge, StatusDot, StatCard, DataTable, shadcn/ui Tabs

---

#### AgentForm
```
File:    components/agents/agent-form.tsx
Stitch:  stitch-partial
Base:    shadcn/ui form primitives
```
```tsx
interface AgentFormProps {
  mode: 'create' | 'edit';
  agent?: AgentData;
  departments: DeptSummary[];
  tiers: TierData[];
  onSubmit: (data: AgentFormData) => void;
  onCancel: () => void;
}
```
Create/edit agent form. Fields: name, department (Select), tier (Select), system prompt (Textarea), model (Select), tools (multi-select), soul description. Validation with react-hook-form + zod.

**Dependencies:** shadcn/ui Input, Select, Textarea, Button, Label; react-hook-form, zod

---

#### DeptList
```
File:    components/departments/dept-list.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface DeptListProps {
  departments: DeptSummary[];
  onSelect: (deptId: string) => void;
}
```
Department list with agent count badges. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.

**Dependencies:** DeptCard

---

#### DeptCard
```
File:    components/departments/dept-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface DeptCardProps {
  department: {
    id: string;
    name: string;
    agentCount: number;
    headAgent?: string;
    color?: string;
  };
  onClick: (deptId: string) => void;
}
```
Department card with agent count, head agent preview, department color accent. `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** AgentAvatar, shadcn/ui Badge

---

#### DeptDetail
```
File:    components/departments/dept-detail.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface DeptDetailProps {
  deptId: string;
}
```
Department detail view. Shows department agents, hierarchy, performance metrics. Inline agent list with drag-reorder for hierarchy.

**Dependencies:** AgentCard, StatCard, DataTable

---

#### DeptForm
```
File:    components/departments/dept-form.tsx
Stitch:  stitch-partial
Base:    shadcn/ui form primitives
```
```tsx
interface DeptFormProps {
  mode: 'create' | 'edit';
  department?: DeptData;
  onSubmit: (data: DeptFormData) => void;
  onCancel: () => void;
}
```
Create/edit department form. Fields: name, description, color, head agent assignment.

**Dependencies:** shadcn/ui Input, Select, Button, Label; react-hook-form, zod

---

### 2.5 Jobs/ARGOS Components (4)

#### JobsList
```
File:    components/jobs/jobs-list.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface JobsListProps {
  jobs: JobSummary[];
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
  onSelect: (jobId: string) => void;
}
```
Filterable job list. Sections: active, scheduled, completed, failed. Status badges, progress bars, next-run timestamps.

**Dependencies:** JobCard, SearchInput, shadcn/ui Select

---

#### JobCard
```
File:    components/jobs/job-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface JobCardProps {
  job: {
    id: string;
    name: string;
    type: 'argos' | 'manual' | 'handoff';
    status: 'running' | 'scheduled' | 'completed' | 'failed';
    progress?: number;
    nextRunAt?: string;
    assignedAgent?: string;
    duration?: number;
  };
  onClick: (jobId: string) => void;
}
```
Job summary card. `rounded-2xl bg-slate-900 border border-slate-800 p-4`. Shows type icon, name, status badge, progress bar (if running), next run (JetBrains Mono tabular-nums).

**Dependencies:** StatusDot, shadcn/ui Badge, shadcn/ui Progress

---

#### JobDetail
```
File:    components/jobs/job-detail.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface JobDetailProps {
  jobId: string;
}
```
Full job detail. Execution history, logs, assigned agent, cron expression, output preview.

**Dependencies:** DataTable, StatCard, ToolCallCard, shadcn/ui Tabs

---

#### ArgosScheduler
```
File:    components/jobs/argos-scheduler.tsx
Stitch:  hand-coded
Base:    Custom
```
```tsx
interface ArgosSchedulerProps {
  schedule?: string;       // Cron expression
  onScheduleChange: (cron: string) => void;
  timezone?: string;
  nextRuns?: Date[];       // Preview of next N run times
}
```
ARGOS cron job scheduler. Cron expression builder with human-readable preview. Shows next 5 run times. `JetBrains Mono` for cron expression display.

**Dependencies:** Custom cron parser, shadcn/ui Select, shadcn/ui Input

---

### 2.6 Shared UI Primitives (18)

#### StatusDot
```
File:    components/ui/status-dot.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
type AgentStatus = 'working' | 'complete' | 'failed' | 'queued' | 'delegating' | 'idle';

interface StatusDotProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';   // 6px | 8px | 10px
  showLabel?: boolean;
  className?: string;
}
```
Universal status indicator. Color-blind safe: each status has a secondary visual (shape/icon) in addition to color. Working: blue-400 + pulse + circle, Complete: emerald-400 + checkmark, Failed: red-400 + X, Queued: slate-600 + hollow circle, Delegating: violet-400 + pulse + arrow. `@media (prefers-reduced-motion: reduce)` disables pulse.

---

#### TierBadge
```
File:    components/ui/tier-badge.tsx
Stitch:  stitch-safe
Base:    Custom CVA
```
```tsx
interface TierBadgeProps {
  tier: number;            // 1-5
  label?: string;          // Optional tier name
  size?: 'sm' | 'md';
}
```
Tier level badge. `rounded font-mono text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5`. Tier colors: T1 cyan-400, T2 violet-400, T3 emerald-400, T4 amber-400, T5 slate-400.

---

#### AgentAvatar
```
File:    components/ui/agent-avatar.tsx
Stitch:  stitch-safe
Base:    shadcn/ui Avatar
```
```tsx
interface AgentAvatarProps {
  agentId: string;
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';  // 24 | 32 | 40 | 56 px
  showStatus?: boolean;
  status?: AgentStatus;
  className?: string;
}
```
Agent avatar with optional status dot overlay. Fallback: initials on `bg-slate-700` circle. Status dot positioned bottom-right.

**Dependencies:** shadcn/ui Avatar, StatusDot

---

#### AgentAvatarPulse
```
File:    components/ui/agent-avatar-pulse.tsx
Stitch:  stitch-partial
Base:    Custom + shadcn/ui Avatar
```
```tsx
interface AgentAvatarPulseProps {
  agentId: string;
  name: string;
  avatarUrl?: string;
  isWorking: boolean;
  size?: 'md' | 'lg';
}
```
AgentAvatar with working pulse animation ring. `opacity 0.7→1.0 over 1.5s ease-in-out`. Ring: `ring-2 ring-cyan-400/50 animate-[agentPulse_1.5s_ease-in-out_infinite]`. Reduced motion: static ring, no animation.

**Dependencies:** AgentAvatar

---

#### CommandPalette
```
File:    components/ui/command-palette.tsx
Stitch:  hand-coded
Base:    shadcn/ui Command (cmdk)
```
```tsx
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```
Global command palette. `Cmd+K` / `Ctrl+K` trigger. Searches agents, departments, pages, recent commands. `bg-slate-900 border border-slate-700 rounded-xl shadow-2xl`. Overlay: `bg-slate-950/80 backdrop-blur-sm`.

**Dependencies:** shadcn/ui Command (cmdk), shadcn/ui Dialog

---

#### NotificationBell
```
File:    components/ui/notification-bell.tsx
Stitch:  stitch-partial
Base:    Custom + shadcn/ui Popover
```
```tsx
interface NotificationBellProps {
  unreadCount: number;
  notifications: NotificationData[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}
```
TopBar notification icon with unread badge. Popover shows notification list. Badge: `bg-red-400 text-white text-[10px] rounded-full min-w-[16px] h-4`.

**Dependencies:** shadcn/ui Popover, shadcn/ui Button

---

#### SearchInput
```
File:    components/ui/search-input.tsx
Stitch:  stitch-safe
Base:    shadcn/ui Input
```
```tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  debounceMs?: number;     // Default 300ms
}
```
Search input with magnifying glass icon and clear button. Debounced onChange. `bg-slate-900 border-slate-700 rounded-lg`.

**Dependencies:** shadcn/ui Input

---

#### DataTable
```
File:    components/ui/data-table.tsx
Stitch:  stitch-partial
Base:    TanStack Table + shadcn/ui Table
```
```tsx
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  onRowClick?: (row: TData) => void;
  emptyState?: React.ReactNode;
}
```
Reusable data table. `bg-slate-900 rounded-2xl border border-slate-800`. Header: `text-xs font-semibold uppercase tracking-wide text-slate-400`. Rows: `hover:bg-slate-800/50 border-b border-slate-800`. All numeric columns: `tabular-nums font-mono`.

**Dependencies:** `@tanstack/react-table`, shadcn/ui Table, SearchInput

---

#### StatCard
```
File:    components/ui/stat-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  format?: 'number' | 'currency' | 'percent' | 'duration';
  className?: string;
}
```
Dashboard metric card. `rounded-2xl bg-slate-900 border border-slate-800 p-6`. Value: `text-2xl font-semibold text-slate-50 tabular-nums`. Change indicator: up=emerald-400, down=red-400.

---

#### ProgressBar
```
File:    components/ui/progress-bar.tsx
Stitch:  stitch-safe
Base:    shadcn/ui Progress
```
```tsx
interface ProgressBarProps {
  value: number;           // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';     // 4px | 8px height
  color?: 'cyan' | 'emerald' | 'amber' | 'red';
  className?: string;
}
```
Progress bar with CORTHEX colors. Default: `bg-cyan-400`. Track: `bg-slate-800 rounded-full`.

**Dependencies:** shadcn/ui Progress

---

#### Modal
```
File:    components/ui/modal.tsx
Stitch:  stitch-partial
Base:    shadcn/ui Dialog
```
```tsx
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';   // 400px | 500px | 640px
  showClose?: boolean;
}
```
Modal dialog. Overlay: `bg-slate-950/80 backdrop-blur-sm`. Content: `bg-slate-900 border border-slate-800 rounded-2xl`. Focus trap active. `aria-modal="true"`.

**Dependencies:** shadcn/ui Dialog

---

#### Sheet
```
File:    components/ui/sheet.tsx
Stitch:  stitch-partial
Base:    shadcn/ui Sheet
```
```tsx
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: 'left' | 'right' | 'top' | 'bottom';
  title?: string;
  children: React.ReactNode;
}
```
Slide-over panel. Used for MobileSidebar (left), mobile NEXUS node detail (bottom), mobile filters (bottom). `bg-slate-900 border-slate-800`.

**Dependencies:** shadcn/ui Sheet

---

#### DropdownMenu
```
File:    components/ui/dropdown-menu.tsx
Stitch:  stitch-safe
Base:    shadcn/ui DropdownMenu
```
```tsx
interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    icon?: React.ComponentType;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }>;
  align?: 'start' | 'center' | 'end';
}
```
Context menu / action menu. `bg-slate-900 border border-slate-700 rounded-xl shadow-lg`. Destructive items: `text-red-400`.

**Dependencies:** shadcn/ui DropdownMenu

---

#### Tooltip
```
File:    components/ui/tooltip.tsx
Stitch:  stitch-safe
Base:    shadcn/ui Tooltip
```
```tsx
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;        // Default 200ms
}
```
Hover tooltip. `bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 shadow-lg`. `animate-in fade-in-0 zoom-in-95`.

**Dependencies:** shadcn/ui Tooltip

---

#### EmptyState
```
File:    components/ui/empty-state.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```
Empty state placeholder for lists/tables with no data. Centered layout with icon, title, description, optional CTA button.

---

#### LoadingSpinner
```
File:    components/ui/loading-spinner.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';   // 16 | 24 | 32 px
  className?: string;
}
```
Animated spinner. `border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin`. `@media (prefers-reduced-motion: reduce)`: shows static "loading" text instead.

---

#### ConfirmDialog
```
File:    components/ui/confirm-dialog.tsx
Stitch:  stitch-safe
Base:    shadcn/ui AlertDialog
```
```tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;    // Default "확인"
  cancelLabel?: string;     // Default "취소"
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}
```
Confirmation dialog for destructive actions (delete agent, remove department). Destructive variant uses red-400 confirm button.

**Dependencies:** shadcn/ui AlertDialog

---

### 2.7 Page-Level Components (30)

Each page-level component is a route-matched container that composes feature and primitive components.

#### P0 — Command Pages

| Component | File | Stitch | Description |
|-----------|------|--------|-------------|
| DashboardPage | `pages/dashboard-page.tsx` | stitch-safe | Stat cards grid (agents active, jobs running, tokens used, costs). `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`. |
| HubPage | `pages/hub-page.tsx` | stitch-partial | See Section 2.2. Hub output + tracker grid. |
| NexusPage | `pages/nexus-page.tsx` | hand-coded | See Section 2.3. Full-bleed React Flow canvas. |
| ChatPage | `pages/chat-page.tsx` | stitch-partial | Agent conversation view. Message bubbles (NOT command output). User: `bg-cyan-400/10 rounded-2xl`, Agent: `bg-slate-800 rounded-2xl`. |

```tsx
// DashboardPage
interface DashboardPageProps {}
// Dependencies: StatCard, DataTable, AgentCard (top agents), JobCard (recent jobs)

// ChatPage
interface ChatPageProps {}
// Dependencies: MessageBubble, ToolCallCard, ChatInputBar, AgentAvatar, StreamingCursor
```

#### P1 — Organization Pages

| Component | File | Stitch | Description |
|-----------|------|--------|-------------|
| AgentsPage | `pages/agents-page.tsx` | stitch-safe | Agent list/grid + create CTA. |
| DepartmentsPage | `pages/departments-page.tsx` | stitch-safe | Department cards + create CTA. |
| JobsPage | `pages/jobs-page.tsx` | stitch-safe | Jobs list with filters + ARGOS scheduler access. |
| ReportsPage | `pages/reports-page.tsx` | stitch-partial | Report builder + generated report viewer. DataTable heavy. |

```tsx
// AgentsPage
interface AgentsPageProps {}
// Dependencies: AgentList, AgentCard, SearchInput, Button (create)

// DepartmentsPage
interface DepartmentsPageProps {}
// Dependencies: DeptList, DeptCard, Button (create)

// JobsPage
interface JobsPageProps {}
// Dependencies: JobsList, JobCard, ArgosScheduler, SearchInput

// ReportsPage
interface ReportsPageProps {}
// Dependencies: DataTable, StatCard, shadcn/ui Select (report type), shadcn/ui DatePicker
```

#### P2 — Tool Pages

| Component | File | Stitch | Description |
|-----------|------|--------|-------------|
| SNSPage | `pages/sns-page.tsx` | stitch-partial | Social media management dashboard. Post queue, analytics cards. |
| TradingPage | `pages/trading-page.tsx` | stitch-partial | Trading bot dashboard. Position cards, P&L display (tabular-nums). |
| MessengerPage | `pages/messenger-page.tsx` | stitch-partial | Messaging integration management. Channel list, message preview. |
| LibraryPage | `pages/library-page.tsx` | stitch-partial | Knowledge base management. Document list, search, embedding status. |
| AgoraPage | `pages/agora-page.tsx` | stitch-partial | Multi-agent debate/discussion view. Thread-style layout. |
| FilesPage | `pages/files-page.tsx` | stitch-safe | File manager. List/grid view, upload, folder navigation. |

```tsx
// All P2 pages follow the same pattern:
interface P2PageProps {}
// Dependencies: DataTable, SearchInput, StatCard, shadcn/ui Tabs
```

#### P3 — System Pages

| Component | File | Stitch | Description |
|-----------|------|--------|-------------|
| CostsPage | `pages/costs-page.tsx` | stitch-safe | Cost breakdown by agent/department/model. All numbers `tabular-nums font-mono`. |
| PerformancePage | `pages/performance-page.tsx` | stitch-safe | Agent performance metrics. Response time, success rate, token efficiency. |
| ActivityLogPage | `pages/activity-log-page.tsx` | stitch-safe | Chronological activity feed. Filterable by agent, type, date. |
| TiersPage | `pages/tiers-page.tsx` | stitch-safe | Tier hierarchy management. Tier CRUD + model assignment. |
| OpsLogPage | `pages/ops-log-page.tsx` | stitch-safe | System operations log. Error tracking, API call history. |
| ClassifiedPage | `pages/classified-page.tsx` | stitch-partial | Restricted access content. Requires elevated permissions. |
| SettingsPage | `pages/settings-page.tsx` | stitch-safe | Company settings. General, billing, API keys, integrations. |

```tsx
// CostsPage
interface CostsPageProps {}
// Dependencies: DataTable, StatCard, ProgressBar, shadcn/ui Select (period), shadcn/ui Tabs

// SettingsPage
interface SettingsPageProps {}
// Dependencies: shadcn/ui Input, Select, Switch, Button, Tabs; react-hook-form
```

#### P0 — Additional Chat Components

| Component | File | Stitch | Description |
|-----------|------|--------|-------------|
| MessageBubble | `components/chat/message-bubble.tsx` | stitch-safe | Chat message bubble. User: right-aligned cyan tint. Agent: left-aligned slate bg. |
| ChatInputBar | `components/chat/chat-input-bar.tsx` | stitch-partial | Chat text input with send button + attach. `border-t border-slate-800 p-4`. |
| ChatAgentHeader | `components/chat/chat-agent-header.tsx` | stitch-safe | Agent info header in chat. Avatar + name + status + soul button. |

```tsx
interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  disabled?: boolean;
}
```

---

### 2.8 Web Component Count Summary

| Category | Count |
|----------|-------|
| Shell Components | 10 |
| Hub Components | 12 (including StreamingCursor, ToolCallCard, MarkdownRenderer) |
| NEXUS Components | 7 |
| Agent/Department Management | 8 |
| Jobs/ARGOS | 4 |
| Shared UI Primitives | 18 |
| Page-Level Components (P0-P3) | 30 |
| Chat-specific Components | 3 |
| **Total** | **92** |

Additional Phase 5 components (context panel sub-components): ~9 panels x ~2 sub-components = ~18 more. Grand total with Phase 5: ~110.

---

## 3. App (Capacitor) Components (~40 total)

### 3.1 Tab Bar + Navigation (4)

#### AppShellMobile
```
File:    app-mobile/components/shell/app-shell-mobile.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface AppShellMobileProps {
  children: React.ReactNode;
}
```
Root mobile layout. `bg-slate-950 min-h-screen`. Contains StatusBarSpacer (top), Routes (center), BottomTabBar (bottom). Tab state preservation: `display:none` toggle, not unmount/remount.

**Dependencies:** StatusBarSpacer, BottomTabBar, React Router (hash mode)

---

#### BottomTabBar
```
File:    app-mobile/components/shell/bottom-tab-bar.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface BottomTabBarProps {
  activeTab: 'hub' | 'chat' | 'nexus' | 'jobs' | 'you';
}
```
5-tab bottom navigation: Hub / Chat / NEXUS / Jobs / You. Height: `49px + env(safe-area-inset-bottom)`. Active: `text-cyan-400`. Inactive: `text-slate-400`. `bg-slate-950/92 backdrop-blur-[12px] border-t border-slate-800`. All tab targets: 44px minimum. `@supports` fallback for `backdrop-filter`.

**Dependencies:** `@capacitor-community/safe-area`

---

#### StatusBarSpacer
```
File:    app-mobile/components/shell/status-bar-spacer.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface StatusBarSpacerProps {
  className?: string;
}
```
`height: env(safe-area-inset-top)`. Transparent spacer for iOS/Android status bar.

---

#### AppHeader
```
File:    app-mobile/components/shell/app-header.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface AppHeaderProps {
  title: string;
  left?: React.ReactNode;         // BackButton or null
  actions?: React.ReactNode[];    // NotificationBell, OverflowMenu, etc.
}
```
Screen header bar. `h-11 px-4 flex items-center justify-between`. Title: `text-[17px] font-medium text-white`. Back button on sub-screens.

---

### 3.2 Hub Screen (5)

#### HubScreen
```
File:    app-mobile/screens/hub-screen.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface HubScreenProps {}
```
Mobile hub is a status dashboard (NOT command terminal). Shows SecretaryCard (priority), department sections with agent cards, recent activity feed. Pull-to-refresh for data reload. SSE-connected for live agent status updates.

**Dependencies:** AppHeader, SecretaryCard, DepartmentSection, MobileAgentCard, RecentActivitySection, PullToRefresh

---

#### SecretaryCard
```
File:    app-mobile/components/hub/secretary-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SecretaryCardProps {
  agent: {
    id: string;
    name: string;
    status: AgentStatus;
    lastMessage?: string;
  };
  onPress: () => void;
}
```
Priority card for secretary/primary agent. `rounded-2xl bg-amber-400/5 border border-amber-400/20 p-4`. Tinted amber to signal priority.

**Dependencies:** AgentAvatar, StatusDot

---

#### DepartmentSection
```
File:    app-mobile/components/hub/department-section.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface DepartmentSectionProps {
  department: {
    id: string;
    name: string;
    agentCount: number;
  };
  children: React.ReactNode;
}
```
Collapsible department group header. `text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3`.

---

#### MobileAgentCard
```
File:    app-mobile/components/hub/mobile-agent-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface MobileAgentCardProps {
  agent: {
    id: string;
    name: string;
    department: string;
    tier: number;
    status: AgentStatus;
    lastMessage?: string;
    elapsedSeconds?: number;
  };
  onPress: () => void;
  onLongPress: () => void;
}
```
Agent card optimized for mobile. Min height: 72px. Shows avatar, name, status, last message preview. Long-press triggers context menu (with haptic feedback via `@capacitor/haptics`). `rounded-2xl bg-slate-900 border border-slate-800 p-4`.

**Dependencies:** AgentAvatar, StatusDot, TierBadge

---

#### RecentActivitySection
```
File:    app-mobile/components/hub/recent-activity-section.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface RecentActivitySectionProps {
  activities: Array<{
    id: string;
    type: 'command' | 'handoff' | 'job_complete' | 'error';
    summary: string;
    timestamp: string;
    agentName?: string;
  }>;
  maxVisible?: number;
}
```
Recent activity feed at bottom of Hub screen. Compact activity items with timestamp.

---

### 3.3 Chat Screen (4)

#### ChatScreen
```
File:    app-mobile/screens/chat-screen.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface ChatScreenProps {
  agentId: string;
}
```
Mobile chat with agent. Message list (SSE streaming), input bar with keyboard avoidance. Back button returns to Hub. Scroll-to-bottom on new messages via `useRef + scrollIntoView`.

**Dependencies:** AppHeader, MobileMessageList, MobileMessageBubble, MobileChatInputBar, StreamingIndicator

---

#### MobileMessageBubble
```
File:    app-mobile/components/chat/mobile-message-bubble.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface MobileMessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}
```
Chat bubble. User: `bg-cyan-400/10 rounded-2xl ml-12 p-3`. Agent: `bg-slate-800 rounded-2xl mr-12 p-3`. Max width constrained for readability.

---

#### MobileChatInputBar
```
File:    app-mobile/components/chat/mobile-chat-input-bar.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface MobileChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}
```
Mobile chat input with send button. `h-[44px] + safe-area-bottom`. Keyboard-aware positioning. Auto-resize up to 4 lines.

---

#### StreamingIndicator
```
File:    app-mobile/components/chat/streaming-indicator.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface StreamingIndicatorProps {
  agentName: string;
  elapsedSeconds: number;
}
```
Shows "{agentName} 응답 중... {elapsed}s" with animated dots. `JetBrains Mono tabular-nums` for elapsed time.

---

### 3.4 NEXUS Screen — Mobile-Adapted (4)

#### NexusScreen
```
File:    app-mobile/screens/nexus-screen.tsx
Stitch:  hand-coded
Base:    @xyflow/react v12
```
```tsx
interface NexusScreenProps {}
```
Mobile NEXUS canvas. React Flow v12 with touch optimization. Node cap: 50 (hard limit). Zoom: 0.3-2.0. Edge labels hidden when zoom < 0.5. Lasso multi-select disabled (conflicts with scroll). Lazy-loaded (~200KB excluded from initial bundle).

**Dependencies:** `@xyflow/react` v12 (lazy), MobileAgentNode, FAB

---

#### MobileAgentNode
```
File:    app-mobile/components/nexus/mobile-agent-node.tsx
Stitch:  stitch-partial
Base:    React Flow custom node
```
```tsx
interface MobileAgentNodeProps {
  data: {
    agentId: string;
    name: string;
    status: AgentStatus;
    tier: number;
  };
}
```
Simplified mobile node. Smaller than web version. `w-[160px] rounded-xl`. Touch-optimized: 44px minimum touch target. Long-press opens node detail sheet.

**Dependencies:** AgentAvatar, StatusDot, React Flow Handle

---

#### NodeDetailSheet
```
File:    app-mobile/components/nexus/node-detail-sheet.tsx
Stitch:  stitch-partial
Base:    Custom bottom sheet
```
```tsx
interface NodeDetailSheetProps {
  node: NexusNode | null;
  open: boolean;
  onClose: () => void;
  onNavigateToAgent: (agentId: string) => void;
}
```
Bottom sheet showing node details. Slide-up animation, swipe-down to dismiss. Shows agent info, connections, actions (edit, remove, view chat).

---

#### FAB
```
File:    app-mobile/components/ui/fab.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface FABProps {
  icon: React.ComponentType<{ className?: string }>;
  onPress: () => void;
  label?: string;
}
```
Floating action button. 56px diameter. `bg-cyan-400 text-slate-950 rounded-full shadow-lg`. Positioned bottom-right above tab bar. NEXUS screen only.

---

### 3.5 Jobs Screen (3)

#### JobsScreen
```
File:    app-mobile/screens/jobs-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface JobsScreenProps {}
```
Mobile job list. Sections: Active, Scheduled, Completed. Pull-to-refresh. Tap to view detail.

**Dependencies:** AppHeader, MobileJobCard

---

#### MobileJobCard
```
File:    app-mobile/components/jobs/mobile-job-card.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface MobileJobCardProps {
  job: JobSummary;
  onPress: () => void;
}
```
Compact job card. Status badge, progress bar, next run time. `rounded-2xl bg-slate-900 border border-slate-800 p-4`. Min height: 72px.

**Dependencies:** StatusDot, ProgressBar, shadcn/ui Badge

---

#### JobDetailScreen
```
File:    app-mobile/screens/job-detail-screen.tsx
Stitch:  stitch-partial
Base:    Custom layout
```
```tsx
interface JobDetailScreenProps {
  jobId: string;
}
```
Full job detail on mobile. Execution history, logs, assigned agent. Back button to Jobs list.

---

### 3.6 You/Profile Screen (6)

#### YouScreen
```
File:    app-mobile/screens/you-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface YouScreenProps {}
```
Profile/settings hub. Menu sections: Organization (Agents, Departments, Library), System (Costs, Activity Log, Settings), Account (Profile, Logout). Grouped menu items with section headers.

---

#### AgentListScreen
```
File:    app-mobile/screens/agent-list-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface AgentListScreenProps {}
```
Full agent list on mobile. Search + filter. Tap to view detail, swipe actions (edit, delete).

---

#### AgentCreateScreen
```
File:    app-mobile/screens/agent-create-screen.tsx
Stitch:  stitch-partial
Base:    Custom form layout
```
```tsx
interface AgentCreateScreenProps {}
```
Mobile agent creation form. Scrollable form with section headers. Keyboard-aware input positioning.

---

#### CostsScreen
```
File:    app-mobile/screens/costs-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface CostsScreenProps {}
```
Cost dashboard on mobile. Summary stat cards + breakdown list. All numbers `tabular-nums font-mono`.

---

#### ActivityLogScreen
```
File:    app-mobile/screens/activity-log-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface ActivityLogScreenProps {}
```
Activity feed on mobile. Filterable chronological list. Infinite scroll.

---

#### SettingsScreen
```
File:    app-mobile/screens/settings-screen.tsx
Stitch:  stitch-safe
Base:    Custom layout
```
```tsx
interface SettingsScreenProps {}
```
Settings form on mobile. Toggle switches, input fields, save button. Grouped sections.

---

### 3.7 Shared Mobile UI (5)

#### PullToRefresh
```
File:    app-mobile/components/ui/pull-to-refresh.tsx
Stitch:  hand-coded
Base:    Custom
```
```tsx
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}
```
Pull-to-refresh wrapper for ScrollView. 100% manual implementation — no Stitch equivalent.

---

#### ContextMenu (Mobile)
```
File:    app-mobile/components/ui/mobile-context-menu.tsx
Stitch:  stitch-partial
Base:    Custom bottom sheet
```
```tsx
interface MobileContextMenuProps {
  open: boolean;
  onClose: () => void;
  items: Array<{
    label: string;
    icon?: React.ComponentType;
    onPress: () => void;
    variant?: 'default' | 'destructive';
  }>;
}
```
Long-press context menu. Bottom sheet with action items. Haptic feedback on open (`@capacitor/haptics`).

---

#### SafeAreaSpacer
```
File:    app-mobile/components/ui/safe-area-spacer.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SafeAreaSpacerProps {
  side: 'top' | 'bottom';
}
```
Dynamic spacer for safe area insets. Uses `@capacitor-community/safe-area`.

---

#### MobileSearchInput
```
File:    app-mobile/components/ui/mobile-search-input.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface MobileSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCancel: () => void;
}
```
iOS-style search with cancel button. Full-width. `bg-slate-800 rounded-xl px-4 h-[36px]`.

---

#### OverflowMenu
```
File:    app-mobile/components/ui/overflow-menu.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface OverflowMenuProps {
  items: Array<{
    label: string;
    onPress: () => void;
    icon?: React.ComponentType;
  }>;
}
```
Three-dot overflow menu in AppHeader. Opens bottom sheet with action items.

---

### 3.8 App Component Count Summary

| Category | Count |
|----------|-------|
| Tab Bar + Navigation | 4 |
| Hub Screen | 5 |
| Chat Screen | 4 |
| NEXUS Screen (mobile) | 4 |
| Jobs Screen | 3 |
| You/Profile Screen | 6 |
| Shared Mobile UI | 5 |
| **Total** | **31** |

Note: Mobile reuses shared `packages/ui` components (StatusDot, TierBadge, AgentAvatar, etc.) adding ~9 shared primitives to the effective total = **~40 components** when counting shared.

---

## 4. Landing Page Components

Organized by scroll section. Separate `packages/landing` package (Vite SSG).

### 4.1 Navigation

#### StickyNav
```
File:    packages/landing/components/sticky-nav.tsx
Stitch:  stitch-partial
Base:    Custom
```
```tsx
interface StickyNavProps {
  currentSection?: string;
}
```
Sticky navigation bar. Logo (left) + section links (center) + login/CTA (right). `bg-slate-950/90 backdrop-blur-sm border-b border-slate-800`. Scroll-aware: transparent at top, solidifies on scroll. Login: ghost button "로그인". Primary: "시작하기" `bg-cyan-400 text-slate-950`. `@supports` fallback for `backdrop-filter`.

Visual from Stitch; scroll behavior (IntersectionObserver for active section) hand-coded.

---

### 4.2 Hero Section

#### HeroSection
```
File:    packages/landing/components/hero-section.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface HeroSectionProps {
  headline: string;
  subtext: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  heroImageSrc: string;
}
```
Dark hero (`bg-slate-950`). Content: `max-w-4xl` centered (896px = 0.622 viewport ratio = 1/phi). H1: `font-inter text-4xl sm:text-5xl xl:text-7xl font-bold text-white`. Subtext: `text-xl text-slate-400`. Primary CTA: `bg-cyan-400 text-slate-950`. Secondary CTA: `border border-cyan-400/50 text-cyan-400`. NEXUS screenshot in browser chrome frame below CTAs. Grid overlay: `rgba(255,255,255,0.05) 64px grid`.

---

### 4.3 Trust Band

#### TrustBand
```
File:    packages/landing/components/trust-band.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface TrustBandProps {
  logos: Array<{ src: string; alt: string; width: number }>;
  label?: string;
}
```
Social proof logo strip. `bg-slate-900` (transition buffer between dark hero and light body). Grayscale logos, `opacity-60 hover:opacity-100`. Label: "신뢰받는 파트너들" or similar.

---

### 4.4 Feature Sections

#### FeatureSection
```
File:    packages/landing/components/feature-section.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface FeatureSectionProps {
  id: string;
  title: string;
  description: string;
  features: Array<{
    icon: React.ComponentType;
    title: string;
    description: string;
  }>;
  imageSrc?: string;
  imagePosition?: 'left' | 'right';
  background: 'light' | 'white';    // slate-50 | white alternating
}
```
Feature showcase section. Alternating `slate-50` / `white` backgrounds. `py-24` section spacing. Feature cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`. Title: `text-2xl font-semibold text-slate-900`. Body: `text-base text-slate-600`.

Used 3-4 times for:
1. Feature Overview (3-column feature card grid)
2. Hub Deep Dive (screenshot + feature list, image-right)
3. NEXUS Deep Dive (screenshot + feature list, image-left)
4. AI Organization (icon grid showing agent capabilities)

**CTA on light backgrounds:** `bg-slate-900 text-white` (NOT `bg-cyan-400` — fails contrast on light backgrounds per Phase 2-3 correction #1).

---

### 4.5 Social Proof

#### SocialProof
```
File:    packages/landing/components/social-proof.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface SocialProofProps {
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company: string;
    avatarSrc?: string;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}
```
Testimonial cards + optional stat counters. `bg-white py-24`. Cards: `rounded-2xl border border-slate-200 p-6`. Stats: `text-4xl font-bold text-slate-900 tabular-nums`.

---

### 4.6 Final CTA

#### FinalCTA
```
File:    packages/landing/components/final-cta.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface FinalCTAProps {
  headline: string;
  subtext: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
}
```
Full-width CTA band. `bg-slate-900` (changed from indigo-950 per Phase 2-3 correction #8 for unity). Dual CTA: self-serve "무료로 시작하기" (`bg-cyan-400 text-slate-950`) + enterprise "영업팀 문의" (secondary outlined).

---

### 4.7 Footer

#### Footer
```
File:    packages/landing/components/footer.tsx
Stitch:  stitch-safe
Base:    Custom
```
```tsx
interface FooterProps {
  links: Array<{
    section: string;
    items: Array<{ label: string; href: string }>;
  }>;
  copyright: string;
}
```
`bg-slate-950 border-t border-slate-800 py-16`. Multi-column link grid. Logo + copyright at bottom. `text-slate-400` links. `hover:text-slate-200`.

---

### 4.8 Landing Component Count Summary

| Component | Stitch Classification |
|-----------|-----------------------|
| StickyNav | stitch-partial |
| HeroSection | stitch-safe |
| TrustBand | stitch-safe |
| FeatureSection (x3-4) | stitch-safe |
| SocialProof | stitch-safe |
| FinalCTA | stitch-safe |
| Footer | stitch-safe |
| **Total: 8-9 components** | **87.5% stitch-safe** |

---

## 5. Shared Components (packages/ui)

Components shared between web + app + landing. Located in `packages/ui/src/`.

### 5.1 Shared Component Registry

| Component | Web | App | Landing | File |
|-----------|-----|-----|---------|------|
| StatusDot | yes | yes | no | `packages/ui/src/status-dot.tsx` |
| TierBadge | yes | yes | no | `packages/ui/src/tier-badge.tsx` |
| AgentAvatar | yes | yes | no | `packages/ui/src/agent-avatar.tsx` |
| Button | yes | yes | yes | `packages/ui/src/button.tsx` |
| Badge | yes | yes | no | `packages/ui/src/badge.tsx` |
| LoadingSpinner | yes | yes | yes | `packages/ui/src/loading-spinner.tsx` |
| ProgressBar | yes | yes | no | `packages/ui/src/progress-bar.tsx` |
| EmptyState | yes | yes | no | `packages/ui/src/empty-state.tsx` |
| Tooltip | yes | no | no | `packages/ui/src/tooltip.tsx` |

### 5.2 Typography Components

No dedicated typography components. Typography is applied via Tailwind utility classes to maintain Swiss Style simplicity:

| Usage | Tailwind Classes |
|-------|-----------------|
| Page title | `text-lg font-semibold text-slate-50` |
| Section header | `text-xs font-semibold tracking-[0.08em] uppercase text-slate-400` |
| Body text | `text-sm text-slate-300` |
| Metadata | `text-xs font-mono tabular-nums text-slate-400` |
| Code/technical | `font-mono text-sm` (JetBrains Mono) |

This is intentional: Swiss International Style prescribes typography through systematic application of a limited type scale, not through abstraction layers. Adding `<Heading level={2}>` components introduces unnecessary indirection.

### 5.3 Icon System Recommendation

**Winner: Lucide React** (`lucide-react`)

| Criterion | Lucide | Heroicons | Phosphor |
|-----------|--------|-----------|----------|
| Style fit | 10 — 1.5px stroke matches Inter's optical weight | 8 — slightly heavier (2px) | 9 — good, multiple weights |
| Tree-shaking | 10 — named exports, dead-code eliminated | 10 | 10 |
| React support | 10 — first-class React package | 9 — JSX components | 9 |
| Icon count | 1400+ | 300+ | 800+ |
| Size per icon | ~200B gzipped | ~250B | ~220B |
| Community | shadcn/ui default | Tailwind Labs default | Smaller community |

**Justification:**
1. Lucide is the default icon set for shadcn/ui — zero configuration needed.
2. 1.5px stroke weight visually harmonizes with Inter's light-to-medium weight range.
3. Tree-shakeable named imports: `import { Terminal, Network, Briefcase } from 'lucide-react'`.
4. All CORTHEX UI icons available: Terminal (Hub), Network (NEXUS), Briefcase (Jobs), User (You), MessageSquare (Chat), Settings, Bell, Search, Plus, ChevronRight, etc.

**Usage pattern:**
```tsx
import { Terminal } from 'lucide-react';

<Terminal className="h-5 w-5 text-slate-400" />
<Terminal className="h-5 w-5 text-cyan-400" />  // active state
```

**Size constraint:** Icon size locked to `h-4 w-4` (16px inline), `h-5 w-5` (20px nav), `h-6 w-6` (24px mobile tab). No other sizes permitted (Swiss Style: limited scale).

---

## 6. Stitch Generation Strategy

### 6.1 Classification Summary

| Classification | Definition | Count (Web) | Count (App) | Count (Landing) |
|---------------|-----------|-------------|-------------|-----------------|
| `stitch-safe` | Stitch generates the full component. Copy output directly. | 48 | 22 | 7 |
| `stitch-partial` | Stitch generates visual shell. Logic (SSE, state, gestures) hand-coded after. | 32 | 12 | 1 |
| `hand-coded` | No Stitch generation. Fully manual implementation. | 12 | 6 | 0 |

### 6.2 Stitch-Safe Components (Full List)

Components where Stitch generates the complete, production-ready component:

**Web (48):**
- Shell: SidebarNav, SidebarNavSection, SidebarNavItem, SidebarUserFooter, TopBarBreadcrumb, TopBarActions
- Hub: TrackerCostMeter, TrackerActiveJobs
- NEXUS: NexusToolbar
- Management: AgentList, AgentCard, DeptList, DeptCard
- Jobs: JobsList, JobCard
- UI Primitives: StatusDot, TierBadge, AgentAvatar, SearchInput, StatCard, ProgressBar, Tooltip, DropdownMenu, EmptyState, LoadingSpinner, ConfirmDialog
- Pages: DashboardPage, AgentsPage, DepartmentsPage, JobsPage, SNSPage, CostsPage, PerformancePage, ActivityLogPage, TiersPage, OpsLogPage, SettingsPage, FilesPage
- Chat: MessageBubble, ChatAgentHeader

**App (22):**
- Shell: StatusBarSpacer, AppHeader
- Hub: SecretaryCard, DepartmentSection, MobileAgentCard, RecentActivitySection
- Chat: MobileMessageBubble
- Jobs: JobsScreen, MobileJobCard
- You: YouScreen, AgentListScreen, CostsScreen, ActivityLogScreen, SettingsScreen
- UI: FAB, SafeAreaSpacer, MobileSearchInput, OverflowMenu

**Landing (7):**
- HeroSection, TrustBand, FeatureSection, SocialProof, FinalCTA, Footer

### 6.3 Stitch-Partial Components

Components where Stitch generates the visual structure, but interactive logic is hand-coded:

**Web (32):**
- Shell: AppShell (layout detection), Sidebar (collapse logic), TopBar (backdrop-filter), MobileSidebar (focus trap)
- Hub: HubPage (grid layout), HubOutputPanel (scroll management), HubMessage (markdown), HubTrackerPanel (SSE data), TrackerActiveAgent (elapsed timer), TrackerHandoffChain (chain animation), ToolCallCard (expand/collapse)
- NEXUS: AgentNode (React Flow node wrapper), DeptClusterNode (group node), NexusControls (React Flow styling)
- Management: AgentDetail (data fetching), AgentForm (form validation), DeptDetail, DeptForm
- Jobs: JobDetail, ArgosScheduler (cron logic)
- UI: AgentAvatarPulse (animation), NotificationBell (popover state), DataTable (TanStack Table), Modal, Sheet
- Pages: ChatPage (streaming), ReportsPage (report builder), SNSPage, TradingPage, MessengerPage, LibraryPage, AgoraPage, ClassifiedPage
- Chat: ChatInputBar (auto-resize)

**App (12):**
- Shell: AppShellMobile (tab persistence), BottomTabBar (safe area)
- Hub: HubScreen (SSE + pull-to-refresh)
- Chat: ChatScreen (streaming), MobileChatInputBar (keyboard), StreamingIndicator (animation)
- NEXUS: MobileAgentNode, NodeDetailSheet (gesture dismiss)
- Jobs: JobDetailScreen
- You: AgentCreateScreen (form)
- UI: MobileContextMenu (haptics)

**Landing (1):**
- StickyNav (scroll behavior)

### 6.4 Hand-Coded Components

Components with no Stitch generation — fully manual implementation:

**Web (12):**
- Hub: HubInputStream (scroll lock + rAF), HubInputComposer (slash-command autocomplete), StreamingCursor (rAF rendering), MarkdownRenderer (remark/rehype)
- NEXUS: NexusCanvas (React Flow wrapper), HandoffEdge (SVG animation), NexusMiniMap (React Flow MiniMap)
- Shell: ContextPanel (Phase 5 — route-aware lazy loading)
- UI: CommandPalette (cmdk integration)
- Jobs: ArgosScheduler (cron parsing)

**App (6):**
- NEXUS: NexusScreen (React Flow mobile), all React Flow related
- UI: PullToRefresh (native scroll behavior)

### 6.5 Stitch Coverage Estimate

| Surface | Total Components | Stitch-Safe | Stitch-Partial | Hand-Coded | Coverage |
|---------|-----------------|-------------|----------------|------------|----------|
| Web | 92 | 48 (52%) | 32 (35%) | 12 (13%) | **87% Stitch-touched** |
| App | 40 | 22 (55%) | 12 (30%) | 6 (15%) | **85% Stitch-touched** |
| Landing | 8 | 7 (87.5%) | 1 (12.5%) | 0 (0%) | **100% Stitch-touched** |
| **Total** | **140** | **77 (55%)** | **45 (32%)** | **18 (13%)** | **87% Stitch-touched** |

"Stitch-touched" = stitch-safe + stitch-partial. 87% of all components receive some Stitch-generated output.

### 6.6 Stitch Prompt Strategy

**One prompt per screen, not per component.**

Rationale:
1. Screen-level prompts capture component relationships (spacing between cards, grid layout, section ordering).
2. Stitch generates a full screen mockup, which is then decomposed into individual components during Phase 7 integration.
3. Individual component prompts lose context: a `StatusDot` in isolation has no visual reference for size relative to its parent `AgentCard`.

**Prompt structure:**

```
Screen: {ScreenName}
Design system: CORTHEX Swiss Dark (see design-tokens.md)
Background: slate-950 (#020617)
Surface: slate-900 (#0F172A)
Primary accent: cyan-400 (#22D3EE)
Font: Inter (UI), JetBrains Mono (technical)
Grid: 12-column, 24px gutter, max-w-1440px

Layout: {describe the screen layout with exact measurements}

Components on this screen:
1. {ComponentName}: {description with exact Tailwind classes}
2. {ComponentName}: {description with exact Tailwind classes}
...

Interactions: {hover states, active states, transitions}
Data: {mock data for realistic preview}
```

**Phase 5 generates these prompts.** Phase 6 feeds them to Stitch. Phase 7 extracts components from Stitch output.

---

## 7. State Management Strategy

### 7.1 Zustand Stores

| Store | File | Contents | Persistence |
|-------|------|----------|-------------|
| `useShellStore` | `stores/shell.store.ts` | `sidebarExpanded`, `contextOpen`, `contextRoute`, `mobileSidebarOpen` | localStorage (per user) |
| `useHubStore` | `stores/hub.store.ts` | `activeSessionId`, `isStreaming`, `streamingText`, `messages[]`, `activeAgentId` | None (session-scoped) |
| `useNexusStore` | `stores/nexus.store.ts` | `nodes[]`, `edges[]`, `selectedNodeId`, `selectedEdgeId`, `viewport`, `editMode` | None (API-synced) |
| `useAuthStore` | `stores/auth.store.ts` | `user`, `token`, `companyId`, `isAuthenticated` | localStorage (secure) |
| `useNotificationStore` | `stores/notification.store.ts` | `notifications[]`, `unreadCount` | None (SSE-fed) |

**Store rules:**
1. Stores hold UI state only. Server state lives in TanStack Query cache.
2. No store-to-store dependencies. Each store is independent.
3. Zustand `persist` middleware for stores that need localStorage.
4. Zustand `devtools` middleware in development only.

```tsx
// Example: shell.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShellStore {
  sidebarExpanded: boolean;
  contextOpen: boolean;
  mobileSidebarOpen: boolean;
  setSidebarExpanded: (v: boolean) => void;
  setContextOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleContext: () => void;
}

export const useShellStore = create<ShellStore>()(
  persist(
    (set) => ({
      sidebarExpanded: true,
      contextOpen: false,
      mobileSidebarOpen: false,
      setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
      setContextOpen: (v) => set({ contextOpen: v }),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
      toggleContext: () => set((s) => ({ contextOpen: !s.contextOpen })),
    }),
    { name: 'corthex-shell' }
  )
);
```

### 7.2 TanStack Query — API Data Fetching

| Query Key | Endpoint | Stale Time | Refetch |
|-----------|----------|-----------|---------|
| `['agents', companyId]` | `GET /api/agents` | 30s | On window focus |
| `['agents', agentId]` | `GET /api/agents/:id` | 30s | On window focus |
| `['departments', companyId]` | `GET /api/departments` | 60s | On window focus |
| `['jobs', companyId]` | `GET /api/jobs` | 10s | On window focus + 30s interval |
| `['hub', 'session', sessionId]` | `GET /api/hub/sessions/:id` | 0s (always fresh) | Manual |
| `['costs', companyId, period]` | `GET /api/costs` | 300s | Manual |
| `['nexus', companyId]` | `GET /api/nexus/graph` | 60s | On window focus |
| `['activity', companyId]` | `GET /api/activity` | 30s | On window focus |

**Mutation pattern:**
```tsx
const createAgent = useMutation({
  mutationFn: (data: AgentFormData) => api.post('/api/agents', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] });
    queryClient.invalidateQueries({ queryKey: ['nexus'] });
  },
});
```

**Query key convention:** `[resource, ...identifiers, ...filters]`

### 7.3 SSE / Streaming — Hub Real-Time Updates

**Architecture:**

```
Browser ──SSE──> /api/hub/stream?sessionId=xxx
                  │
                  ├─ event: agent_status    → useHubStore.setActiveAgent()
                  ├─ event: message_chunk   → useHubStore.appendStreamingText()
                  ├─ event: message_complete → useHubStore.commitMessage()
                  ├─ event: tool_call_start → useHubStore.addToolCall()
                  ├─ event: tool_call_end   → useHubStore.updateToolCall()
                  ├─ event: handoff         → useHubStore.updateHandoffChain()
                  ├─ event: cost_update     → useHubStore.updateCost()
                  └─ event: session_end     → useHubStore.endSession()
```

**SSE hook pattern:**
```tsx
function useHubStream(sessionId: string) {
  const store = useHubStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const es = new EventSource(`/api/hub/stream?sessionId=${sessionId}`);
    eventSourceRef.current = es;

    es.addEventListener('message_chunk', (e) => {
      const data = JSON.parse(e.data);
      // Batch DOM updates with requestAnimationFrame
      requestAnimationFrame(() => {
        store.appendStreamingText(data.text);
      });
    });

    es.addEventListener('message_complete', (e) => {
      const data = JSON.parse(e.data);
      store.commitMessage(data);
    });

    // ... other event handlers

    es.onerror = () => {
      // Exponential backoff reconnect
      setTimeout(() => {
        es.close();
        // Reconnect logic
      }, 1000);
    };

    return () => es.close();
  }, [sessionId]);
}
```

**Mobile (Capacitor) SSE lifecycle:**
- Foreground: SSE connection active.
- Background: SSE connection closed (battery preservation). On resume: reconnect + fetch missed messages via REST API.
- Pattern: `@capacitor/app` `appStateChange` listener triggers disconnect/reconnect.

### 7.4 React Flow State — NEXUS Node/Edge Management

```tsx
// stores/nexus.store.ts
interface NexusStore {
  // React Flow managed state
  nodes: NexusNode[];
  edges: NexusEdge[];
  viewport: { x: number; y: number; zoom: number };

  // Selection state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Edit mode
  editMode: boolean;

  // Actions
  setNodes: (nodes: NexusNode[]) => void;
  setEdges: (edges: NexusEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addAgentNode: (agent: AgentData, position: XYPosition) => void;
  addDeptCluster: (dept: DeptData, position: XYPosition) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  saveLayout: () => Promise<void>;  // Persist to API
  loadLayout: (companyId: string) => Promise<void>;
}
```

**React Flow integration:**
```tsx
function NexusCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useNexusStore();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}    // { agent: AgentNode, dept: DeptClusterNode }
      edgeTypes={edgeTypes}    // { handoff: HandoffEdge }
      fitView
      minZoom={0.1}
      maxZoom={2.0}
    >
      {/* ... */}
    </ReactFlow>
  );
}
```

**Node position persistence:** On drag-end, debounce (500ms) save node positions to API via `useMutation`. Layout is company-scoped.

---

## 8. Code Splitting Strategy

### 8.1 React.lazy() Boundaries

| Component | Trigger | Estimated Size |
|-----------|---------|---------------|
| NexusCanvas | Route `/nexus` | ~200KB (React Flow) |
| ContextPanel | Context toggle click | ~50KB (panel content) |
| CommandPalette | `Cmd+K` keypress | ~30KB (cmdk) |
| ArgosScheduler | Jobs page → "Schedule" tab | ~15KB |
| MarkdownRenderer | First Hub message render | ~40KB (remark + rehype) |
| AgentForm | "Create Agent" / "Edit" click | ~20KB (react-hook-form + zod) |
| DeptForm | "Create Department" / "Edit" click | ~15KB |
| DataTable | Page-level tables | ~25KB (TanStack Table) |

**Implementation:**
```tsx
// Lazy load with Suspense fallback
const NexusCanvas = React.lazy(() => import('./components/nexus/nexus-canvas'));
const CommandPalette = React.lazy(() => import('./components/ui/command-palette'));
const ContextPanel = React.lazy(() => import('./components/shell/context-panel'));

// In router:
<Suspense fallback={<LoadingSpinner size="lg" />}>
  <NexusCanvas />
</Suspense>
```

### 8.2 Route-Level Code Splits

| Route | Chunk | Estimated Size | Notes |
|-------|-------|---------------|-------|
| `/hub` | `hub-page.chunk.js` | ~45KB | Includes HubOutputStream, Tracker |
| `/nexus` | `nexus-page.chunk.js` | ~220KB | React Flow + custom nodes/edges |
| `/dashboard` | `dashboard-page.chunk.js` | ~20KB | StatCards + mini charts |
| `/chat/:id` | `chat-page.chunk.js` | ~35KB | Message renderer + streaming |
| `/agents` | `agents-page.chunk.js` | ~15KB | Card grid |
| `/departments` | `departments-page.chunk.js` | ~12KB | Card grid |
| `/jobs` | `jobs-page.chunk.js` | ~25KB | DataTable + ArgosScheduler |
| `/reports` | `reports-page.chunk.js` | ~30KB | DataTable + report builder |
| `/sns` | `sns-page.chunk.js` | ~20KB | |
| `/trading` | `trading-page.chunk.js` | ~25KB | |
| `/messenger` | `messenger-page.chunk.js` | ~18KB | |
| `/library` | `library-page.chunk.js` | ~20KB | |
| `/agora` | `agora-page.chunk.js` | ~22KB | |
| `/files` | `files-page.chunk.js` | ~15KB | |
| `/costs` | `costs-page.chunk.js` | ~18KB | |
| `/performance` | `performance-page.chunk.js` | ~18KB | |
| `/activity` | `activity-page.chunk.js` | ~12KB | |
| `/settings` | `settings-page.chunk.js` | ~20KB | |

**Router configuration:**
```tsx
// router.tsx
import { lazy, Suspense } from 'react';

const HubPage = lazy(() => import('./pages/hub-page'));
const NexusPage = lazy(() => import('./pages/nexus-page'));
const DashboardPage = lazy(() => import('./pages/dashboard-page'));
const ChatPage = lazy(() => import('./pages/chat-page'));
// ... all routes lazy

export function AppRouter() {
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/hub" element={<HubPage />} />
          <Route path="/nexus" element={<NexusPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat/:agentId" element={<ChatPage />} />
          {/* ... */}
        </Routes>
      </Suspense>
    </AppShell>
  );
}
```

### 8.3 React Flow Isolation

React Flow (`@xyflow/react` v12) is the largest dependency (~200KB). It is isolated to the NEXUS route only:

1. **Web:** `NexusCanvas` loaded via `React.lazy()` only when `/nexus` route is active.
2. **App:** `NexusScreen` loaded via `React.lazy()` only when NEXUS tab is tapped. Not included in initial bundle.
3. **Landing:** React Flow is NOT used on the landing page. NEXUS hero uses a static screenshot (`.webp`), not a live canvas.

```tsx
// nexus-page.tsx — ensures React Flow only loads on NEXUS route
const NexusCanvas = lazy(() =>
  import('./components/nexus/nexus-canvas').then(mod => ({
    default: mod.NexusCanvas,
  }))
);
```

### 8.4 Context Panel Lazy Loading

All context panel sub-components are lazy-loaded to prevent bloating the shell bundle:

```tsx
// context-panel.tsx
const CONTEXT_PANELS: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/hub':       () => import('../tracker/tracker-panel'),
  '/chat':      () => import('../chat/chat-history-panel'),
  '/jobs':      () => import('../jobs/job-filter-panel'),
  '/agents':    () => import('../agents/agent-config-panel'),
  '/dashboard': () => import('../dashboard/dashboard-filter-panel'),
  '/reports':   () => import('../reports/report-builder-panel'),
  '/library':   () => import('../library/knowledge-filter-panel'),
  '/agora':     () => import('../agora/agora-config-panel'),
};
```

### 8.5 Bundle Budget Summary

| Target | Budget | Measurement |
|--------|--------|-------------|
| Web initial bundle (shell + first route) | < 120KB gzipped | Vite build analyzer |
| Web NEXUS chunk | < 250KB gzipped | Isolated React Flow |
| App initial bundle | < 150KB gzipped | Per Phase 2-2 requirement |
| App TTI | < 3s on mid-range Android | Lighthouse mobile |
| Landing JS bundle | < 80KB gzipped | Per Phase 2-3 requirement |
| Landing LCP | < 2.5s | Hero image: .webp, fetchpriority="high" |

---

## Appendix A: Full Component Index

### Web Dashboard (92 components)

| # | Component | Category | File | Stitch | Base |
|---|-----------|----------|------|--------|------|
| 1 | AppShell | Shell | `shell/app-shell.tsx` | partial | Custom |
| 2 | Sidebar | Shell | `shell/sidebar.tsx` | partial | Custom |
| 3 | SidebarNav | Shell | `shell/sidebar-nav.tsx` | safe | Custom |
| 4 | SidebarNavSection | Shell | `shell/sidebar-nav-section.tsx` | safe | Custom |
| 5 | SidebarNavItem | Shell | `shell/sidebar-nav-item.tsx` | safe | Custom |
| 6 | SidebarUserFooter | Shell | `shell/sidebar-user-footer.tsx` | safe | Custom |
| 7 | TopBar | Shell | `shell/top-bar.tsx` | partial | Custom |
| 8 | TopBarBreadcrumb | Shell | `shell/top-bar-breadcrumb.tsx` | safe | Custom |
| 9 | TopBarActions | Shell | `shell/top-bar-actions.tsx` | safe | Custom |
| 10 | ContextPanel | Shell | `shell/context-panel.tsx` | hand-coded | Custom |
| 11 | MobileSidebar | Shell | `shell/mobile-sidebar.tsx` | partial | shadcn Sheet |
| 12 | HubPage | Hub | `hub/hub-page.tsx` | partial | Custom |
| 13 | HubOutputPanel | Hub | `hub/hub-output-panel.tsx` | partial | Custom |
| 14 | HubInputStream | Hub | `hub/hub-input-stream.tsx` | hand-coded | Custom |
| 15 | HubMessage | Hub | `hub/hub-message.tsx` | partial | Custom |
| 16 | HubInputComposer | Hub | `hub/hub-input-composer.tsx` | hand-coded | shadcn |
| 17 | HubTrackerPanel | Hub | `hub/hub-tracker-panel.tsx` | partial | Custom |
| 18 | TrackerActiveAgent | Tracker | `tracker/tracker-active-agent.tsx` | partial | Custom |
| 19 | TrackerHandoffChain | Tracker | `tracker/tracker-handoff-chain.tsx` | partial | Custom |
| 20 | TrackerCostMeter | Tracker | `tracker/tracker-cost-meter.tsx` | safe | shadcn Progress |
| 21 | TrackerActiveJobs | Tracker | `tracker/tracker-active-jobs.tsx` | safe | Custom |
| 22 | StreamingCursor | Hub | `hub/streaming-cursor.tsx` | hand-coded | Custom |
| 23 | ToolCallCard | Hub | `hub/tool-call-card.tsx` | partial | Custom |
| 24 | MarkdownRenderer | Hub | `hub/markdown-renderer.tsx` | hand-coded | Custom |
| 25 | NexusCanvas | NEXUS | `nexus/nexus-canvas.tsx` | hand-coded | React Flow |
| 26 | AgentNode | NEXUS | `nexus/agent-node.tsx` | partial | React Flow |
| 27 | DeptClusterNode | NEXUS | `nexus/dept-cluster-node.tsx` | partial | React Flow |
| 28 | HandoffEdge | NEXUS | `nexus/handoff-edge.tsx` | hand-coded | React Flow |
| 29 | NexusToolbar | NEXUS | `nexus/nexus-toolbar.tsx` | safe | Custom |
| 30 | NexusMiniMap | NEXUS | `nexus/nexus-mini-map.tsx` | hand-coded | React Flow |
| 31 | NexusControls | NEXUS | `nexus/nexus-controls.tsx` | partial | React Flow |
| 32 | AgentList | Agents | `agents/agent-list.tsx` | safe | Custom |
| 33 | AgentCard | Agents | `agents/agent-card.tsx` | safe | Custom |
| 34 | AgentDetail | Agents | `agents/agent-detail.tsx` | partial | Custom |
| 35 | AgentForm | Agents | `agents/agent-form.tsx` | partial | shadcn |
| 36 | DeptList | Depts | `departments/dept-list.tsx` | safe | Custom |
| 37 | DeptCard | Depts | `departments/dept-card.tsx` | safe | Custom |
| 38 | DeptDetail | Depts | `departments/dept-detail.tsx` | partial | Custom |
| 39 | DeptForm | Depts | `departments/dept-form.tsx` | partial | shadcn |
| 40 | JobsList | Jobs | `jobs/jobs-list.tsx` | safe | Custom |
| 41 | JobCard | Jobs | `jobs/job-card.tsx` | safe | Custom |
| 42 | JobDetail | Jobs | `jobs/job-detail.tsx` | partial | Custom |
| 43 | ArgosScheduler | Jobs | `jobs/argos-scheduler.tsx` | hand-coded | Custom |
| 44 | StatusDot | UI | `ui/status-dot.tsx` | safe | Custom |
| 45 | TierBadge | UI | `ui/tier-badge.tsx` | safe | Custom CVA |
| 46 | AgentAvatar | UI | `ui/agent-avatar.tsx` | safe | shadcn Avatar |
| 47 | AgentAvatarPulse | UI | `ui/agent-avatar-pulse.tsx` | partial | Custom |
| 48 | CommandPalette | UI | `ui/command-palette.tsx` | hand-coded | shadcn Command |
| 49 | NotificationBell | UI | `ui/notification-bell.tsx` | partial | shadcn Popover |
| 50 | SearchInput | UI | `ui/search-input.tsx` | safe | shadcn Input |
| 51 | DataTable | UI | `ui/data-table.tsx` | partial | TanStack + shadcn |
| 52 | StatCard | UI | `ui/stat-card.tsx` | safe | Custom |
| 53 | ProgressBar | UI | `ui/progress-bar.tsx` | safe | shadcn Progress |
| 54 | Modal | UI | `ui/modal.tsx` | partial | shadcn Dialog |
| 55 | Sheet | UI | `ui/sheet.tsx` | partial | shadcn Sheet |
| 56 | DropdownMenu | UI | `ui/dropdown-menu.tsx` | safe | shadcn |
| 57 | Tooltip | UI | `ui/tooltip.tsx` | safe | shadcn |
| 58 | EmptyState | UI | `ui/empty-state.tsx` | safe | Custom |
| 59 | LoadingSpinner | UI | `ui/loading-spinner.tsx` | safe | Custom |
| 60 | ConfirmDialog | UI | `ui/confirm-dialog.tsx` | safe | shadcn AlertDialog |
| 61 | DashboardPage | Pages | `pages/dashboard-page.tsx` | safe | Custom |
| 62 | HubPage (route) | Pages | `pages/hub-page.tsx` | partial | Custom |
| 63 | NexusPage | Pages | `pages/nexus-page.tsx` | hand-coded | React Flow |
| 64 | ChatPage | Pages | `pages/chat-page.tsx` | partial | Custom |
| 65 | AgentsPage | Pages | `pages/agents-page.tsx` | safe | Custom |
| 66 | DepartmentsPage | Pages | `pages/departments-page.tsx` | safe | Custom |
| 67 | JobsPage | Pages | `pages/jobs-page.tsx` | safe | Custom |
| 68 | ReportsPage | Pages | `pages/reports-page.tsx` | partial | Custom |
| 69 | SNSPage | Pages | `pages/sns-page.tsx` | partial | Custom |
| 70 | TradingPage | Pages | `pages/trading-page.tsx` | partial | Custom |
| 71 | MessengerPage | Pages | `pages/messenger-page.tsx` | partial | Custom |
| 72 | LibraryPage | Pages | `pages/library-page.tsx` | partial | Custom |
| 73 | AgoraPage | Pages | `pages/agora-page.tsx` | partial | Custom |
| 74 | FilesPage | Pages | `pages/files-page.tsx` | safe | Custom |
| 75 | CostsPage | Pages | `pages/costs-page.tsx` | safe | Custom |
| 76 | PerformancePage | Pages | `pages/performance-page.tsx` | safe | Custom |
| 77 | ActivityLogPage | Pages | `pages/activity-log-page.tsx` | safe | Custom |
| 78 | TiersPage | Pages | `pages/tiers-page.tsx` | safe | Custom |
| 79 | OpsLogPage | Pages | `pages/ops-log-page.tsx` | safe | Custom |
| 80 | ClassifiedPage | Pages | `pages/classified-page.tsx` | partial | Custom |
| 81 | SettingsPage | Pages | `pages/settings-page.tsx` | safe | Custom |
| 82 | MessageBubble | Chat | `chat/message-bubble.tsx` | safe | Custom |
| 83 | ChatInputBar | Chat | `chat/chat-input-bar.tsx` | partial | Custom |
| 84 | ChatAgentHeader | Chat | `chat/chat-agent-header.tsx` | safe | Custom |
| 85-92 | Context panel sub-components | Shell | `shell/context-panels/*.tsx` | partial | Custom |

### App (Capacitor) (31 + 9 shared = ~40)

| # | Component | Category | File |
|---|-----------|----------|------|
| 1-4 | Shell components | Navigation | `shell/*.tsx` |
| 5-9 | Hub screen components | Hub | `hub/*.tsx`, `screens/hub-screen.tsx` |
| 10-13 | Chat screen components | Chat | `chat/*.tsx`, `screens/chat-screen.tsx` |
| 14-17 | NEXUS screen components | NEXUS | `nexus/*.tsx`, `screens/nexus-screen.tsx` |
| 18-20 | Jobs screen components | Jobs | `jobs/*.tsx`, `screens/jobs-screen.tsx` |
| 21-26 | You/Profile screens | You | `screens/you-*.tsx` |
| 27-31 | Shared mobile UI | UI | `ui/*.tsx` |

### Landing (8 components)

| # | Component | Stitch |
|---|-----------|--------|
| 1 | StickyNav | partial |
| 2 | HeroSection | safe |
| 3 | TrustBand | safe |
| 4-7 | FeatureSection (x4) | safe |
| 8 | SocialProof | safe |
| 9 | FinalCTA | safe |
| 10 | Footer | safe |

---

## Appendix B: Key Dependencies

| Package | Version | Purpose | Surface |
|---------|---------|---------|---------|
| `react` | 18.x (pin exact) | Core | All |
| `react-dom` | 18.x (pin exact) | Web DOM | Web, Landing |
| `react-router-dom` | 6.x (pin exact) | Routing | Web, App |
| `@xyflow/react` | 12.x (pin exact) | NEXUS canvas | Web, App |
| `zustand` | 4.x (pin exact) | State management | Web, App |
| `@tanstack/react-query` | 5.x (pin exact) | API data fetching | Web, App |
| `@tanstack/react-table` | 8.x (pin exact) | DataTable | Web |
| `class-variance-authority` | 0.x (pin exact) | CVA variants | All |
| `clsx` | 2.x (pin exact) | Class merging | All |
| `tailwind-merge` | 2.x (pin exact) | Tailwind class dedup | All |
| `cmdk` | 1.x (pin exact) | Command palette | Web |
| `lucide-react` | 0.x (pin exact) | Icons | All |
| `react-markdown` | 9.x (pin exact) | Markdown rendering | Web |
| `remark-gfm` | 4.x (pin exact) | GFM tables/lists | Web |
| `rehype-highlight` | 7.x (pin exact) | Code syntax highlight | Web |
| `@fontsource/inter` | 5.x (pin exact) | Inter font (self-hosted) | All |
| `@fontsource/jetbrains-mono` | 5.x (pin exact) | JetBrains Mono (self-hosted) | All |
| `@capacitor/core` | latest (pin exact) | Native bridge | App |
| `@capacitor-community/safe-area` | latest (pin exact) | Safe area insets | App |
| `@capacitor/haptics` | latest (pin exact) | Haptic feedback | App |
| `react-hook-form` | 7.x (pin exact) | Form state | Web, App |
| `zod` | 3.x (pin exact) | Schema validation | Web, App |
| `vite-ssg` | latest (pin exact) | Static site generation | Landing |

All versions pinned exact (no `^`) per CLAUDE.md SDK pin rule.

---

*Phase 3-2 Component Strategy — Version 2.0*
*Input: Phase 0-2 Vision v2.0 + Phase 2 Analysis Winners + Phase 2 Critic Reviews*
*Output to: Phase 5 (Stitch prompt engineering) + Phase 7 (integration)*
*Next: Phase 4 (Themes)*
