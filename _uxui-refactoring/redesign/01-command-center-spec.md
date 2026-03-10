# Redesign Spec: 01-command-center

**Page:** Command Center
**Domain Color:** Blue
**Layout Template:** Template C (Split View) — Enhanced with KPI header + gradient pipeline
**Date:** 2026-03-10

---

## New Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: "작전현황" text-3xl font-black  [WS Status Pill] [Stats]│
│   subtitle: text-sm text-slate-500                              │
├─────────────────────────────────────────────────────────────────┤
│ KPI CARDS (4 gradient cards)                                     │
│ [Total Cmds|blue] [Active Agents|cyan] [Pipeline|emerald] [Lat] │
├─────────────────────────────────────────────────────────────────┤
│ PIPELINE (gradient stage cards with animated connectors)         │
│ ○ Manager → ○ Analyst → ○ Writer → ○ Designer                  │
├────────────────────┬────────────────────────────────────────────┤
│ MESSAGE THREAD     │ DELIVERABLE VIEWER                         │
│ (w-[420px])        │ (flex-1)                                   │
│                    │ gradient header + Subframe Tabs             │
│ enhanced messages  │ overview / deliverable content              │
│ time separators    │                                            │
│ better avatars     │                                            │
├────────────────────┴────────────────────────────────────────────┤
│ COMMAND INPUT (gradient border glow, prominent send)             │
│ [/] [@] [preset]  [textarea with glow]  [SEND button primary]  │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────────────┐
│ Header (compact)        │
├─────────────────────────┤
│ Pipeline (scroll)       │
├─────────────────────────┤
│ [Chat] [Report] tabs    │
├─────────────────────────┤
│ Content (tab-switched)  │
├─────────────────────────┤
│ Command Input           │
└─────────────────────────┘
```

---

## Component Breakdown

### 1. Page Header
```jsx
<div className="px-6 py-5 border-b border-slate-800/80">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-black tracking-tight text-white">작전현황</h1>
      <p className="text-sm text-slate-500 mt-1">AI 에이전트에게 명령을 내리고 결과를 확인합니다</p>
    </div>
    <div className="flex items-center gap-3">
      {/* WS Status Pill */}
      <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 실시간 연결됨
      </span>
    </div>
  </div>
</div>
```

### 2. KPI Summary Cards (4-col grid)
```jsx
<div className="grid grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4">
  {/* Each card: gradient summary card pattern */}
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all duration-300 group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <svg .../>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">명령 수</span>
      </div>
      <p className="text-3xl font-black text-white tracking-tight">{messages.filter(m=>m.role==='user').length}</p>
      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 완료
        </span>
      </div>
    </div>
  </div>
  {/* Repeat for: Active Agents (cyan), Pipeline Status (emerald), Latest Activity (amber) */}
</div>
```

### 3. Enhanced Pipeline Bar
```jsx
<div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800/80 overflow-x-auto">
  {stages.map((stage, idx) => (
    <div key={stage.id} className="flex items-center gap-3 shrink-0">
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300
        ${stage.status === 'done' ? 'bg-gradient-to-br from-emerald-600/20 via-slate-800 to-slate-800 border-emerald-500/30' :
          stage.status === 'working' ? 'bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border-blue-500/30 shadow-lg shadow-blue-500/5' :
          stage.status === 'failed' ? 'bg-gradient-to-br from-red-600/20 via-slate-800 to-slate-800 border-red-500/30' :
          'bg-slate-800/40 border-slate-700/50'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
          ${stage.status === 'done' ? 'bg-emerald-500/20' :
            stage.status === 'working' ? 'bg-blue-500/20' :
            stage.status === 'failed' ? 'bg-red-500/20' :
            'bg-slate-700/50'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        </div>
        <div>
          <span className="text-xs font-semibold text-white">{stage.role}</span>
          <p className="text-xs text-slate-500">{stage.description}</p>
        </div>
      </div>
      {/* Connector */}
      {idx < stages.length - 1 && (
        <div className="flex items-center">
          <div className={`w-8 h-px ${stage.status === 'done' ? 'bg-emerald-500/40' : 'bg-slate-700/50'}`} />
          <svg className="w-3 h-3 text-slate-600" ...>arrow right</svg>
        </div>
      )}
    </div>
  ))}
</div>
```

### 4. Enhanced Command Input
```jsx
<div className="relative shrink-0 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-slate-900/95 backdrop-blur-sm p-4">
  <div className="flex items-end gap-3">
    <div className="flex items-center gap-1.5 pb-1.5">
      {/* Action buttons with tooltips */}
    </div>
    <div className="flex-1 relative">
      <textarea className="w-full bg-slate-800/80 border border-slate-600/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none transition-all" />
    </div>
    <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
      <svg .../>  전송
    </button>
  </div>
</div>
```

### 5. Deliverable Viewer (Right Panel)
- Gradient header: `bg-gradient-to-r from-blue-600/10 via-slate-800/80 to-slate-800/80`
- Subframe `Tabs` component for overview/deliverable switching
- Quality gate badge using Subframe `Badge` component

---

## Subframe Components Used (minimum 3)

1. **Badge** (`@/ui/components/Badge`) — for quality gate pills (PASS/FAIL), status indicators
2. **Tabs** (`@/ui/components/Tabs`) — for deliverable viewer tab switching
3. **Loader** (`@/ui/components/Loader`) — for loading states
4. **Tooltip** (`@/ui/components/Tooltip`) — for action button tooltips
5. **IconWithBackground** (`@/ui/components/IconWithBackground`) — for KPI card icons

---

## New Visualizations

1. **KPI Summary Cards** (4-col gradient cards with animated counters)
2. **Enhanced Pipeline** (gradient stage cards with animated connectors, not flat dots)
3. **Connection Status Pill** (real-time WS status with pulsing dot)
4. **Progress connectors** (line + arrow between pipeline stages)

---

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| 375px | Single column, KPI cards 2x2, pipeline scrollable, tab switching |
| 768px | Split view appears, KPI cards 2x2, pipeline visible |
| 1024px | Full split view, KPI cards 4-col |
| 1440px | Same as 1024px with more breathing room |

---

## States

### Loading Skeleton
```jsx
<div className="space-y-4 px-6 py-4">
  {/* Header skeleton */}
  <div className="flex items-center justify-between">
    <div>
      <div className="h-8 w-40 bg-slate-700/50 animate-pulse rounded" />
      <div className="h-4 w-64 bg-slate-700/30 animate-pulse rounded mt-2" />
    </div>
    <div className="h-8 w-32 bg-slate-700/30 animate-pulse rounded-full" />
  </div>
  {/* KPI skeletons */}
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
    {[1,2,3,4].map(i => (
      <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 animate-pulse" />
          <div className="h-3 w-16 bg-slate-700/50 animate-pulse rounded" />
        </div>
        <div className="h-8 w-16 bg-slate-700/50 animate-pulse rounded" />
      </div>
    ))}
  </div>
</div>
```

### Error State
```jsx
<div className="flex flex-col items-center justify-center py-24">
  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
    <svg className="w-8 h-8 text-slate-600" ...>warning icon</svg>
  </div>
  <p className="text-base font-medium text-slate-300">연결할 수 없습니다</p>
  <p className="text-sm text-slate-600 mt-1">잠시 후 자동으로 재시도합니다</p>
</div>
```

### Empty State (Enhanced)
```jsx
<div className="flex flex-col items-center justify-center h-full">
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border border-blue-500/20 flex items-center justify-center mb-4">
    <svg className="w-8 h-8 text-blue-400" ...>command icon</svg>
  </div>
  <p className="text-sm font-medium text-slate-400 mb-4">아직 명령이 없습니다</p>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md">
    {EXAMPLE_COMMANDS.map(cmd => (
      <button className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 text-left transition-all group">
        <p className="text-xs font-medium text-slate-300 group-hover:text-blue-300">{cmd.label}</p>
        <p className="text-xs text-slate-600 mt-1">{cmd.text}</p>
      </button>
    ))}
  </div>
</div>
```

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `command-center-page` |
| Page header | `command-center-header` |
| KPI card (each) | `kpi-card-{type}` |
| WS status pill | `ws-status-pill` |
| Pipeline bar | `pipeline-bar` |
| Pipeline stage | `pipeline-stage-{role}` |
| Mobile tab chat | `mobile-tab-chat` |
| Mobile tab report | `mobile-tab-report` |
| Message thread | `message-thread` |
| Message loading | `message-loading-skeleton` |
| Empty state | `empty-state` |
| Example command | `example-command` |
| User message | `msg-user-{id}` |
| Agent message | `msg-agent-{id}` |
| System message | `msg-system-{id}` |
| Quality badge | `quality-badge-{id}` |
| Scroll bottom btn | `scroll-bottom-btn` |
| Deliverable viewer | `deliverable-viewer` |
| Viewer tab overview | `viewer-tab-overview` |
| Viewer tab deliverable | `viewer-tab-deliverable` |
| Command input | `command-input` |
| Send button | `send-button` |
| Target chip | `target-chip` |
| Slash popup | `slash-popup` |
| Mention popup | `mention-popup` |
| Preset manager btn | `preset-manager-btn` |
| Preset manager modal | `preset-manager-modal` |
