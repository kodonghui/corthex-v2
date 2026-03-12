# Phase 3-2: CORTHEX Component Strategy

**Date**: 2026-03-12
**Step**: Phase 3 — Design System, Step 3-2
**Status**: APPROVED — 3 rounds, 10 issues resolved
**Based on**: Phase 3-1 Design Tokens + Phase 2 Option A specs + existing codebase audit

---

## 0. Strategy Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Base library | `@corthex/ui` (CVA + Tailwind CSS 4) — **extend, not replace** | Already in production. 20 existing components. shadcn/ui would add dependency with no net gain. |
| Component authoring pattern | Class Variance Authority (CVA) | Confirmed from `button.tsx`, `badge.tsx` — `cva()` + `VariantProps` + `cn()` pattern |
| Styling system | Tailwind CSS 4 + Phase 3-1 design tokens | `@theme` CSS vars + Tailwind classes — no CSS modules, no styled-components |
| State management | Zustand (UI state) + TanStack Query (server state) | Confirmed from tech spec — existing, do not change |
| Mobile strategy | New `packages/mobile/` — Stitch-generated React + Tailwind, then manual integration | Confirmed Phase 2-2: Stitch → React + Tailwind CSS (NOT React Native) |
| Icon library | Lucide React (non-nav) + Emoji (nav sidebar) | Phase 3-1 §6 — do not change nav emoji convention |
| CodeMirror | `codemirror-editor.tsx` + `soul-editor.tsx` — existing wrappers | DO NOT recreate — already implemented |
| React Flow | `@xyflow/react` 12.x — 24 NEXUS components (13 in `app` SketchVibe + 11 in `admin` org chart) | DO NOT recreate either set — use/extend only |

---

## 1. Base Library: @corthex/ui

### 1.1 Architecture

```
packages/ui/src/
├── index.ts          ← public API — only export from here
├── utils.ts          ← cn() utility (clsx + tailwind-merge)
├── [component].tsx   ← one file per component
└── [component].tsx
```

**Import rule**: All apps import exclusively from `@corthex/ui`:
```tsx
import { Button, Badge, Card, StatusDot } from '@corthex/ui'
// NEVER: import { Button } from '../../ui/src/button'
```

### 1.2 CVA Pattern (Canonical)

All `@corthex/ui` components follow this exact pattern — no deviations:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

// 1. Define variants with cva()
const componentVariants = cva(
  'base-classes-that-always-apply',
  {
    variants: {
      variant: { default: '...', ... },
      size: { sm: '...', md: '...', lg: '...' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

// 2. Props interface extends HTML element props + VariantProps
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,  // or HTMLButtonElement, etc.
    VariantProps<typeof componentVariants> {
  // Additional custom props go here
  isLoading?: boolean
}

// 3. Component function
export function Component({ className, variant, size, isLoading, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

**Rules:**
- Base classes go in `cva()` first argument — things that always apply regardless of variant
- `className` prop is ALWAYS last in CVA call (`cn(variants({ ..., className }))`) — allows consumer override
- `...props` spreads onto the underlying HTML element — never block it
- Export the variants const with `export const` if external consumers need it (e.g., for `asChild` patterns)

### 1.3 Required Token Updates to Existing Components

The existing components use mixed dark mode tokens that violate Phase 3-1 rules. These must be updated before Phase 4 implementation:

| Component | Current Issue | Required Fix |
|-----------|--------------|--------------|
| `button.tsx` | `dark:border-zinc-800` in outline variant | → `dark:border-zinc-700` (Phase 3-1 border rule) |
| `button.tsx` | `focus-visible:ring-offset-2` — no offset color specified | → `focus-visible:ring-offset-zinc-900` (Phase 3-1 §9.4 context variant) |
| `button.tsx` | `dark:bg-indigo-500` for default — hover is indigo-600 | → `bg-indigo-600 hover:bg-indigo-700` (Phase 3-1: indigo-600 is primary) |
| `badge.tsx` | `dark:bg-emerald-500/10 dark:text-emerald-400` for success | → `dark:bg-green-500/10 dark:text-green-500` (align with Phase 3-1 green-500) |
| `badge.tsx` | `dark:bg-blue-500/10 dark:text-blue-400` for info | → `dark:bg-indigo-950 dark:text-indigo-300` (CORTHEX info = indigo, not blue) |
| `badge.tsx` | Missing `indigo` variant for CORTHEX active/selected state | → Add `indigo: 'dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800'` |

---

## 2. Component Inventory

### 2.1 Atoms (20 existing → 22 target)

Atoms are the smallest indivisible UI elements. All live in `packages/ui/src/`.

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| `Button` | ✅ Exists — needs token update | `button.tsx` | Update indigo-600 primary, border-zinc-700, focus ring |
| `Badge` | ✅ Exists — needs token update | `badge.tsx` | Add `indigo` variant, fix `info`→indigo, fix `success`→green-500 |
| `Input` | ✅ Exists | `input.tsx` | Verify border-zinc-700 + focus ring per Phase 3-1 §9.3 |
| `Textarea` | ✅ Exists | `textarea.tsx` | Same as Input |
| `Select` | ✅ Exists | `select.tsx` | Verify dark mode tokens |
| `Toggle` | ✅ Exists | `toggle.tsx` | — |
| `Spinner` | ✅ Exists | `spinner.tsx` | Add `motion-reduce:animate-none` (Phase 3-1 B-2 fix) |
| `StatusDot` | ✅ Exists | `status-dot.tsx` | Verify: online=green-500, working=indigo-500 animate-pulse, offline=zinc-600 |
| `Avatar` | ✅ Exists | `avatar.tsx` | — |
| `Skeleton` / `SkeletonCard` / `SkeletonTable` | ✅ Exists | `skeleton.tsx` | Add `motion-reduce:animate-none` |
| `FilterChip` | ✅ Exists | `filter-chip.tsx` | — |
| **`TierBadge`** | 🆕 New | `tier-badge.tsx` | T1/T2/T3 pill: `font-mono text-xs bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400` |
| **`CostBadge`** | 🆕 New | `cost-badge.tsx` | `$X.XXXX · N,NNN 토큰` — `font-mono text-xs text-zinc-400`. Shown after `done` SSE event. |
| **`Tooltip`** | 🆕 New | `tooltip.tsx` | Stateless hover tooltip — wraps a single trigger element. `bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 px-2 py-1 rounded shadow-lg`. |

#### TierBadge Spec
```tsx
// packages/ui/src/tier-badge.tsx
const tierBadgeVariants = cva(
  'font-mono text-xs border px-1.5 py-0.5 rounded inline-flex items-center',
  {
    variants: {
      tier: {
        manager:    'bg-indigo-950 border-indigo-800 text-indigo-300',  // T1 — most authority
        specialist: 'bg-violet-950 border-violet-800 text-violet-300',  // T2 Specialist
        worker:     'bg-zinc-800 border-zinc-700 text-zinc-400',        // T3 Worker
      },
    },
    defaultVariants: { tier: 'worker' },
  }
)

// String keys ('manager'|'specialist'|'worker') avoid CVA numeric-literal type issues.
// API data typed as number must be mapped: tier === 1 ? 'manager' : tier === 2 ? 'specialist' : 'worker'
export interface TierBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tierBadgeVariants> {
  showLabel?: boolean  // false: "T1" | true: "T1 관리자" — className inherited from HTMLAttributes
}
```

#### CostBadge Spec
```tsx
// packages/ui/src/cost-badge.tsx
export interface CostBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  costUsd: number       // e.g. 0.0042
  tokensUsed: number    // e.g. 1240
  // className inherited from HTMLAttributes
}
// Renders: "비용 $0.0042 · 1,240 토큰"
// Classes: font-mono text-xs text-zinc-400
```

---

### 2.2 Molecules (11 existing → 17 target)

Molecules combine atoms with specific interaction logic. Mix of `@corthex/ui` and app-level components.

#### Existing (in @corthex/ui)

| Component | Status | File | Notes |
|-----------|--------|------|-------|
| `Card` / `CardHeader` / `CardContent` / `CardFooter` | ✅ Exists | `card.tsx` | Verify `border-zinc-700` dark mode |
| `Modal` | ✅ Exists | `modal.tsx` | Verify footer `border-zinc-700` (Phase 3-1 Q-2 fix) |
| `ConfirmDialog` | ✅ Exists | `confirm-dialog.tsx` | — |
| `Toast` / `ToastProvider` | ✅ Exists | `toast.tsx` | Verify 4 semantic variants (success/error/warning/info) |
| `Tabs` | ✅ Exists | `tabs.tsx` | — |
| `ProgressBar` | ✅ Exists | `progress-bar.tsx` | Verify 3-zone color: green-500→amber-500→red-500 |
| `TimelineGroup` | ✅ Exists | `timeline.tsx` | — |
| `EmptyState` | ✅ Exists | `empty-state.tsx` | Verify `text-zinc-400` (not zinc-500) per Phase 3-1 |

#### New (add to @corthex/ui)

| Component | Status | Notes |
|-----------|--------|-------|
| **`Drawer`** | 🆕 New | Slide-in panel. `w-[520px] bg-zinc-900 border-l border-zinc-700`. `transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none`. Always-mounted pattern. |
| **`DataTable`** | 🆕 New | Standard CRUD table. Renders `thead/th/tr/td` with Phase 3-1 §10.4 classes. Sort, select, pagination. Max 100 rows — pagination required above 100 (`overflow-auto max-h-[60vh]`). |
| **`SearchBar`** | 🆕 New | `bg-zinc-900 border border-zinc-700 rounded-lg` + Lucide `Search` icon (h-4 w-4 text-zinc-400). |
| **`PageHeader`** | 🆕 New | `text-xl font-semibold text-zinc-100` title + optional subtitle + right-side action slot. |
| **`AgentBadge`** | 🆕 New | Compound: `[StatusDot][AgentName][TierBadge]`. Size variants: `sm` (TrackerPanel density) / `md` (MessageBubble header). |

#### Drawer Spec (Most Important New Molecule)
```tsx
// packages/ui/src/drawer.tsx
export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  width?: 'default' | 'wide'  // default=w-[520px], wide=w-[720px]
  children: React.ReactNode
  footer?: React.ReactNode     // renders in sticky footer with border-t border-zinc-700
}

// Always mounted (never {open && <Drawer>}) — preserves close animation
// REQUIRED: inert={!open} + aria-hidden={!open} on panel root div.
// Without these, keyboard Tab and screen readers access all focusable elements inside
// the hidden panel — WCAG 2.4.3 violation (Focus Order).
//
// Structure:
// <div                                 ← backdrop: fixed inset-0 bg-black/40 z-40
//   className={cn(
//     "fixed inset-0 bg-black/40 z-40 transition-opacity duration-[250ms] motion-reduce:transition-none",
//     open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//   )}
// />
// <div                                 ← panel
//   inert={!open}
//   aria-hidden={!open}
//   className={cn(
//     "fixed right-0 top-0 h-full bg-zinc-900 border-l border-zinc-700 z-50",
//     "transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none",
//     open ? "translate-x-0" : "translate-x-full"
//   )}
// >
//   ...content
// </div>
// NOTE: DO NOT use `open:translate-x-0` — `open:` is a CSS [open] attribute variant
//       (for <details> only) and does NOT respond to a React `open` prop.
```

#### AgentBadge Spec
```tsx
// packages/ui/src/agent-badge.tsx
// Compound component: [StatusDot] [AgentName] [TierBadge]

const agentBadgeVariants = cva('inline-flex items-center gap-1.5', {
  variants: {
    size: {
      sm: 'text-xs',  // TrackerPanel density: name text-xs, StatusDot h-1.5 w-1.5
      md: 'text-sm',  // MessageBubble header: name text-sm, StatusDot h-2 w-2
    },
  },
  defaultVariants: { size: 'md' },
})

export interface AgentBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof agentBadgeVariants> {
  name: string                                // agent display name e.g. "리서치 에이전트"
  tier: 'manager' | 'specialist' | 'worker'  // maps to TierBadge tier prop
  status: 'online' | 'working' | 'offline'   // maps to StatusDot status prop
  showTier?: boolean    // default true — false hides TierBadge in compact contexts
  showStatus?: boolean  // default true — false hides StatusDot
}

// Visual layout (size=md):
//   [StatusDot h-2 w-2] [name text-sm text-zinc-200] [TierBadge tier="manager"]
//
// Visual layout (size=sm):
//   [StatusDot h-2 w-2] [name text-xs text-zinc-300 truncate max-w-[120px]] [TierBadge tier="specialist"]
//   NOTE: StatusDot stays h-2 w-2 (8px) in sm — WCAG 1.4.11 non-text contrast unreliable at 6px.
//   TrackerPanel density is fine with 8px dot.
```

#### DataTable ARIA Spec
```tsx
// packages/ui/src/data-table.tsx
// ARIA requirements for sortable + selectable table:
//
// <table role="grid" aria-label="[descriptor e.g. '에이전트 목록']">
//   <thead>
//     <tr>
//       <th aria-sort="ascending" | "descending" | "none">이름</th>  ← sortable columns
//       <th>상태</th>                                                 ← non-sortable: no aria-sort
//     </tr>
//   </thead>
//   <tbody>
//     <tr aria-selected="true" | "false">   ← all selectable rows get aria-selected
//       ...
//     </tr>
//   </tbody>
// </table>
//
// Keyboard interactions:
//   Space        → toggle row selection
//   Enter        → activate row (open drawer / navigate)
//   ArrowUp/Down → move focus between rows
//
// Row limit: max 100 rows per page — add pagination above 100.
// Container: overflow-auto max-h-[60vh] to prevent layout overflow.
```

---

### 2.3 Organisms (App-level — NOT in @corthex/ui)

Organisms are complex components that contain business logic, store connections, or multiple molecules. They live in `packages/app/src/components/` or `packages/admin/src/components/`.

> **Rule**: Organisms are NEVER added to `@corthex/ui`. They are app-specific and may depend on Zustand stores, TanStack Query, or SSE connections.

#### Hub Organisms

| Component | Location | Status | Key Spec |
|-----------|---------|--------|----------|
| `HubLayout` | `pages/hub/` | 🔄 Redesign | 3-column: `[SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80↔w-12]`. Replaces 2-column slate layout. |
| `SessionPanel` | `components/hub/` | 🔄 Redesign | Left column. Session list + agent status. `w-64 bg-zinc-900 border-r border-zinc-700`. Migrate slate→zinc. |
| `ChatArea` | `components/hub/` | 🔄 Redesign | Center column. MessageList + InputBar. `flex-1 min-w-0 bg-zinc-950`. |
| `TrackerPanel` | `components/hub/handoff-tracker.tsx` | 🔄 Redesign | Right column (migrate from horizontal bar). `w-80↔w-12 bg-zinc-900 border-l border-zinc-700`. |
| `HandoffStep` | `components/hub/` | 🔄 Redesign | Single step row in TrackerPanel. AgentBadge + depth badge + elapsed time. `transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none`. |
| `MessageBubble` | `components/hub/` | 🔄 Redesign | User (right-aligned) + Agent (left-aligned) bubble. Agent bubble includes agent name + TierBadge above. |
| `InputBar` | `components/hub/` | 🔄 Redesign | Textarea (auto-resize) + SubmitButton (`h-12 w-12 bg-indigo-600 aria-label="메시지 전송"` — icon-only, no visible text). |
| `MarkdownRenderer` | `components/` | 🔄 Redesign | Renders AI responses. Apply Phase 3-1 §2.6 full spec. Uses `react-markdown: ^10.1.0` (existing). |

#### Admin Organisms

| Component | Location | Status | Key Spec |
|-----------|---------|--------|----------|
| `AdminSidebar` | `packages/admin/src/components/` | 🔄 Redesign | `w-60 bg-zinc-900 border-r border-zinc-700`. Company dropdown at top. Flat nav (18 items). |
| `AgentDrawer` | `packages/admin/src/components/` | 🔄 Redesign | Uses new `Drawer` molecule. Form + Soul tab (CodeMirror 6). `w-[520px]`. |
| `NexusCanvas` | `packages/admin/src/components/nexus/` | ✅ Exists (11 components) | @xyflow/react org chart editor — DO NOT recreate. Only update node/edge colors to zinc palette. Separate from app NEXUS (SketchVibe). |
| `AgentConfigPanel` | `packages/admin/src/components/nexus/` | 🔄 Redesign | Absolute overlay on NEXUS canvas. `w-96 bg-zinc-900 border-l border-zinc-700`. |
| `SoulEditor` | `packages/app/src/components/settings/soul-editor.tsx` | ✅ Exists | CodeMirror 6 wrapper — DO NOT recreate. Only update container bg to `bg-zinc-950`. |

#### AGORA Organisms

| Component | Location | Status | Key Spec |
|-----------|---------|--------|----------|
| `SpeechCard` | `pages/agora/` | 🔄 Redesign | Debate speech card. Left-slide entrance animation (`speech-enter` keyframe). AgentBadge (name + tier) in header. |
| `ConsensusCard` | `pages/agora/` | 🔄 Redesign | Final outcome badge. `scale-in` 300ms after all speeches rendered. consensus=green/dissent=red/partial=amber. |
| `DebateTimeline` | `pages/agora/` | 🔄 Redesign | Polling-based (not SSE). Single `setSpeechCards(data.speeches)` after `GET /:id/timeline`. CSS `animationDelay: index * 200ms` per card (not N setTimeouts). |

#### Shared App Organisms

| Component | Location | Status | Key Spec |
|-----------|---------|--------|----------|
| `AppSidebar` | `packages/app/src/components/sidebar.tsx` | 🔄 Redesign | `w-60 bg-zinc-900 border-r border-zinc-700`. Emoji nav. 3 groups: 업무/운영/시스템. |
| `KnowledgeGrid` | `pages/knowledge/` | 🔄 Redesign | 3-column card grid. `grid grid-cols-3 gap-4`. Each card: `bg-zinc-900 border border-zinc-700 rounded-lg p-4`. |
| `BudgetBar` | `components/` | 🔄 Redesign | Progress track + fill. green-500→amber-500→red-500 threshold transitions. `transition-[width] duration-500 ease-out motion-reduce:transition-none`. |
| `DashboardKPI` | `pages/dashboard/` | 🔄 Redesign | 4 KPI cards. Large numbers `text-3xl font-bold text-zinc-100`. |

---

### 2.4 Layouts

Layouts are structural shell components that define the page-level grid. They live in `packages/app/src/layouts/` or `packages/admin/src/layouts/`.

#### App Layouts

| Layout | Component | Spec |
|--------|-----------|------|
| `HubLayout` | Hub-specific | `flex h-screen bg-zinc-950 overflow-hidden` → `[AppSidebar w-60][SessionPanel w-64][ChatArea flex-1][TrackerPanel w-80↔w-12]` |
| `StandardLayout` | All other app pages | `flex h-screen bg-zinc-950 overflow-hidden` → `[AppSidebar w-60][<main> flex-1 overflow-auto p-6]` |

#### Admin Layouts

| Layout | Component | Spec |
|--------|-----------|------|
| `AdminLayout` | All admin pages | `flex h-screen bg-zinc-950 overflow-hidden` → `[AdminSidebar w-60][<main> flex-1 overflow-auto p-6]` |
| `NexusLayout` | NEXUS page only | `flex h-screen bg-zinc-950 overflow-hidden` → `[AdminSidebar w-60][<main> flex-1 relative overflow-hidden]` (no p-6 — canvas fills edge-to-edge) |

#### Hub Layout Width Math (1440px viewport)

```
AppSidebar:    w-60  = 240px
SessionPanel:  w-64  = 256px
TrackerPanel:  w-80  = 320px (expanded) | w-12 = 48px (icon strip)
               ─────────────────────────────────────
Total fixed:         816px (expanded) | 544px (collapsed)
ChatArea flex-1:     624px (expanded) | 896px (collapsed)

At 1280px minimum:
ChatArea (expanded): 1280 - 816 = 464px minimum ← acceptable
```

#### Mobile Layout (packages/mobile/)

```
Stitch→React output structure:
packages/mobile/src/
├── App.tsx                    ← BrowserRouter root
├── layouts/
│   └── MobileLayout.tsx       ← [TabBar h-14 fixed bottom] + [<main> pb-safe]
├── screens/
│   ├── HubScreen.tsx
│   ├── ChatScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── NexusScreen.tsx        ← SVG simplified tree (NOT @xyflow/react)
│   └── MoreScreen.tsx
├── components/
│   ├── BottomTabBar.tsx        ← 4-tab: [허브|대시보드|NEXUS|더보기]
│   ├── TrackerStrip.tsx        ← h-12 compact / h-48 expanded (above BottomTabBar)
│   └── InputBar.tsx
└── stores/
    ├── mobile-hub-store.ts
    └── mobile-agent-store.ts
```

---

## 3. Component API Standards

### 3.1 Prop Interface Rules

```tsx
// ✅ CORRECT — all components follow this pattern:
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,    // or specific element
    VariantProps<typeof componentVariants> {
  // 1. Required props first
  // 2. Optional props with defaults
  isLoading?: boolean
  // 3. Never omit className — always allow consumer override
  // className is inherited from HTMLAttributes
}

// ❌ WRONG — blocking className:
export function Component({ className, ...props }: { label: string }) { ... }
// ❌ WRONG — not extending HTML element attributes:
export interface ComponentProps { variant: string; label: string }
```

### 3.2 Variant Naming Conventions

```tsx
// variant names: descriptive intent, not visual description
// ✅ variant: { default, destructive, success, warning }  ← intent-based
// ❌ variant: { blue, red, green }                        ← visual description

// size names: always t-shirt sizes
// ✅ size: { sm, md, lg, icon }
// ❌ size: { small, medium, large, 'icon-only' }

// All variant values: kebab-case strings
// ✅ 'indigo-muted', 'zinc-ghost'
// ❌ 'indigoMuted', 'ZincGhost'
```

### 3.3 TypeScript Strictness

```tsx
// All component files must compile with strict mode.
// No `any` types.
// Ref forwarding when element needs direct DOM access:
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants({ className }))} {...props} />
  )
)
Input.displayName = 'Input'

// Display names required on all forwardRef components (aids DevTools debugging).
```

### 3.4 Accessibility Baseline (All Components)

Every component must include:

| Requirement | Implementation |
|-------------|----------------|
| Keyboard nav | `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` (context-appropriate offset) |
| ARIA labels | Interactive elements without visible text get `aria-label` |
| Disabled state | `disabled:opacity-50 disabled:pointer-events-none` (or `disabled:cursor-not-allowed`) |
| Loading state | `aria-busy="true"` on loading containers; spinner gets `role="status" aria-label="로딩 중"` |
| Reduced motion | All `animate-*` classes include `motion-reduce:animate-none`. All `transition-*` include `motion-reduce:transition-none`. |
| Color-not-sole | Status (success/error/warning) must use BOTH color AND icon/text — never color alone. |

### 3.5 Component File Structure

```tsx
// packages/ui/src/[component-name].tsx
// ─────────────────────────────────────
// 1. Imports
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'
// (Lucide icons imported only if component uses them internally)

// 2. CVA variants definition
const componentVariants = cva(...)

// 3. Props interface (exported)
export interface ComponentProps extends ... {}

// 4. Component function (exported)
export function Component({ ... }: ComponentProps) { ... }

// 5. Sub-components (if compound component)
export function ComponentHeader({ ... }: ComponentHeaderProps) { ... }
export function ComponentContent({ ... }: ComponentContentProps) { ... }
```

---

## 4. CORTHEX-Specific Component Rules

### 4.1 The "Never Bot" Rule

```tsx
// AI Agents are represented as ORG MEMBERS, not robots.
// ✅ CORRECT — show org structure:
<CircleUser className="h-4 w-4 text-zinc-400" />  // AI agent icon
<User className="h-4 w-4 text-zinc-400" />         // Human employee icon

// ❌ FORBIDDEN — robot metaphor:
<Bot className="h-4 w-4" />     // Vision §5.3: "Do NOT use: robots"
<Cpu className="h-4 w-4" />
```

### 4.2 TrackerPanel SSE Integration Pattern

```tsx
// TrackerPanel consumes SSE handoff events.
// Tier data is NOT in the SSE event — must derive from agentStore:
import { useAgentStore } from '../stores/agent-store'

// ✅ REACTIVE selector — re-renders when agentTiers[step.to] changes:
const tier = useAgentStore(state => state.agentTiers[step.to] ?? null)
// ❌ WRONG — getState() is a snapshot, does NOT trigger re-render:
// const tier = useAgentStore.getState().agentTiers[step.to] ?? null

// ARIA live regions — separate sr-only divs, NOT on container:
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {lastStep && sseStatus === 'streaming'
    ? `${lastStep.agentName}이(가) 처리 중 (D${lastStep.depth})`
    : sseStatus === 'complete' ? '작업이 완료되었습니다' : ''}
</div>
// Container: role="region" aria-live="off" aria-label="Agent delegation tracker"
```

### 4.3 AGORA Speech Card Pattern

```tsx
// SpeechCard is CLIENT-SIDE ANIMATED — not server-driven.
// After GET /:id/timeline returns full array:
//
// ❌ WRONG — N setTimeouts = N React re-renders, redundant with CSS delay:
// speeches.forEach((speech, index) => {
//   setTimeout(() => setSpeechCards(prev => [...prev, speech]), index * 200)
// })
//
// ✅ CORRECT — 1 setState → CSS animationDelay handles visual stagger:
setSpeechCards(timelineData.speeches)

// CSS animation on each card (keyframe required for translateX — not a transition):
<div
  className="speech-card"  // CSS fallback for prefers-reduced-motion
  style={{
    animation: `speech-enter 400ms ease-out forwards`,
    animationDelay: `${index * 200}ms`,
    opacity: 0,  // start hidden — animation fills to 1
  }}
>
```

### 4.4 Slate → Zinc Migration Rule

The existing Hub uses the slate palette. **All new/redesigned Hub components use zinc.**

```
Migrate: slate-900 → zinc-900
Migrate: slate-800 → zinc-800
Migrate: slate-700 → zinc-700
Migrate: slate-400 → zinc-400
Migrate: slate-300 → zinc-300
NEVER introduce slate in any new component.
```

Affected files:
- `packages/app/src/pages/hub/secretary-hub-layout.tsx`
- `packages/app/src/components/hub/session-sidebar.tsx`
- `packages/app/src/components/hub/handoff-tracker.tsx`

### 4.5 MarkdownRenderer Spec

```tsx
// packages/app/src/components/markdown-renderer.tsx
// Uses: react-markdown ^10.1.0 (already installed)
// Props:
interface MarkdownRendererProps {
  content: string
  className?: string
}

// Component map applies Phase 3-1 §2.6 classes to each element.
// h1→text-2xl font-bold text-zinc-100, h2→text-xl font-semibold, etc.
// Code blocks use bg-zinc-950 border border-zinc-700 (dark bg inside panel).
// Tables: overflow-x-auto wrapper required for wide tables on 464px ChatArea.
```

---

## 5. Stitch → React Migration Strategy

### 5.1 Overview

Google Stitch generates **React + Tailwind CSS** (confirmed Phase 2-2). Output goes into `packages/mobile/src/` (NEW package — not yet created).

### 5.2 Session Plan (6 Stitch Sessions)

| Session | Screen | Priority | Confidence |
|---------|--------|----------|-----------|
| S1 | HubScreen — session list + empty chat state | HIGH | ⭐⭐⭐ |
| S2 | ChatScreen — MessageBubble + InputBar + TrackerStrip (compact) | HIGH | ⭐⭐⭐ |
| S3 | TrackerStrip — expanded h-48 state with HandoffStep rows | HIGH | ⭐⭐⭐ |
| S4 | BottomTabBar — 4-tab with badge indicators | HIGH | ⭐⭐⭐ |
| S5 | DashboardScreen — KPI cards + budget bars | MEDIUM | ⭐⭐ |
| S6 | MoreScreen + DrawerNav — full nav list | MEDIUM | ⭐⭐ |

> NexusScreen (SVG simplified tree) requires MANUAL coding — Stitch cannot generate @xyflow/react or complex SVG canvas.

### 5.3 Stitch Output → Integration Checklist

After each Stitch session, before committing to `packages/mobile/src/`:

```
[ ] Token alignment: Stitch-generated colors match Phase 3-1 tokens (zinc-950/900/800, indigo-600)
[ ] Slate removed: no slate-* classes in output
[ ] Duration syntax: duration-[250ms] NOT duration-250
[ ] motion-reduce: added to all animate-*/transition-* classes
[ ] Border: border-zinc-700 on all dark surface panels
[ ] ARIA: interactive elements have proper labels
[ ] Safe area: pb-[env(safe-area-inset-bottom)] on BottomTabBar
[ ] navigate: useNavigate() declared in all routing components
[ ] TrackerStrip: role="region" aria-live="off" on visual container
[ ] Loader2: animate-spin motion-reduce:animate-none
```

### 5.4 Stitch Prompt Template

```
Design [SCREEN_NAME] for CORTHEX — an AI organization management platform.

Dark mode only. Base: bg-zinc-950 page, bg-zinc-900 panels, border-zinc-700 borders.
Primary accent: indigo-600 (#4F46E5). Font: Work Sans.

[SCREEN-SPECIFIC DESCRIPTION]

Component spec:
- [Exact component list from Phase 2-2 analysis]
- All text min text-zinc-400 for readability
- Status: green-500 (success), amber-500 (warning), red-400 (error text)
- No rounded-full on non-circular elements; cards use rounded-lg
```

---

## 6. New Component Priority Queue

Ordered by Phase 2 importance (P0→P3):

| Priority | Component | Type | Target Package |
|----------|-----------|------|----------------|
| P0 | `TrackerPanel` redesign (slate→zinc, horizontal→right column) | Organism | `packages/app` |
| P0 | `SessionPanel` redesign (slate→zinc) | Organism | `packages/app` |
| P0 | `ChatArea` redesign | Organism | `packages/app` |
| P0 | `AppSidebar` redesign (zinc confirmed) | Organism | `packages/app` |
| P0 | `MarkdownRenderer` with full §2.6 spec | Organism | `packages/app` |
| P1 | `TierBadge` (new atom) | Atom | `@corthex/ui` |
| P1 | `CostBadge` (new atom) | Atom | `@corthex/ui` |
| P1 | `AgentBadge` (compound: name+tier+status) | Molecule | `@corthex/ui` |
| P1 | `Drawer` (new molecule) | Molecule | `@corthex/ui` |
| P1 | `PageHeader` (new molecule) | Molecule | `@corthex/ui` |
| P1 | `DataTable` (new molecule) | Molecule | `@corthex/ui` |
| P1 | `SearchBar` (new molecule) | Molecule | `@corthex/ui` |
| P1 | `Tooltip` (new atom) | Atom | `@corthex/ui` |
| P1 | `NexusCanvas` color update (node/edge zinc tokens) | Organism | `packages/admin` |
| P1 | `SpeechCard` + `ConsensusCard` + `DebateTimeline` | Organism | `packages/app` |
| P2 | `AdminSidebar` token update | Organism | `packages/admin` |
| P2 | `AgentDrawer` (uses new Drawer) | Organism | `packages/admin` |
| P2 | `BudgetBar` (3-zone transitions) | Organism | `packages/app` |
| P2 | `KnowledgeGrid` | Organism | `packages/app` |
| P3 | Mobile: `BottomTabBar` (Stitch S4) | Molecule | `packages/mobile` |
| P3 | Mobile: `TrackerStrip` | Molecule | `packages/mobile` |
| P3 | Mobile: all screens (Stitch S1-S6) | Organism | `packages/mobile` |

---

## 7. Existing Components — Do Not Recreate

These components are already correctly implemented. Redesign work must NOT replace them — only update tokens:

| Component | Location | Why Protected |
|-----------|---------|---------------|
| `codemirror-editor.tsx` | `packages/app/src/components/` | CodeMirror 6 wrapper — complex, existing |
| `soul-editor.tsx` | `packages/app/src/components/settings/` | CodeMirror 6 + Soul-specific logic |
| 13 app NEXUS components (SketchVibe canvas) | `packages/app/src/components/nexus/` | @xyflow/react — SketchVibe graph editor, 13 files |
| 11 admin NEXUS components (org chart editor) | `packages/admin/src/components/nexus/` | @xyflow/react — org chart editor, 11 files. Do NOT recreate; only update node/edge zinc tokens. |
| `react-markdown` usage | Throughout `packages/app/` | Library already installed — wrap, don't replace |
| Auth store integration | `packages/app/src/stores/auth-store.ts` | Login/JWT pattern verified Phase 2-3 |

---

*Document generated: 2026-03-12*
*Based on: Phase 3-1 Design Tokens + Phase 2 Option A specs (Web/App/Landing) + codebase audit (packages/ui/src/)*
*Existing @corthex/ui: 20 components. Target: 22 atoms + 14 molecules in ui, + app/admin organisms*
