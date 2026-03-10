# 20. Tools (도구 관리) — Design Specification

## 1. Page Overview

- **Purpose**: Admin-only page for viewing the complete tool catalog and managing agent-tool permissions via an interactive matrix. Tools are grouped by category (common, finance, legal, marketing, tech). Admins toggle individual tool access per agent or batch-toggle entire categories.
- **Key User Goals**: (1) See all registered tools and their categories, (2) Assign/revoke tool permissions per agent, (3) Batch-assign entire categories, (4) Save pending changes.
- **Data Dependencies**:
  - `GET /admin/tools/catalog` → `{ data: CatalogGroup[] }` where `CatalogGroup = { category: string, tools: CatalogTool[] }` and `CatalogTool = { name: string, description: string | null, category: string, registered: boolean }`
  - `GET /admin/agents?companyId={id}` → `{ data: Agent[] }` where `Agent = { id: string, name: string, tier: string, allowedTools: string[] | null }`
  - `PATCH /admin/agents/{id}/allowed-tools` → Body: `{ allowedTools: string[] }`
- **Current State**: Functional page at `packages/admin/src/pages/tools.tsx` (385 lines). Uses native checkboxes, basic table layout, indigo/zinc color scheme. Needs dark-mode-first redesign with slate palette, improved matrix UX, and consistent design system tokens.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ "도구 관리"  ·  "42개 도구 · 12개 에이전트"   [Save] [Cancel] │
├─────────────────────────────────────────────────────────────┤
│ Category Filter Tabs                                         │
│ [전체(42)] [Common(12)] [Finance(8)] [Legal(6)] [Mkt(9)] ... │
├─────────────────────────────────────────────────────────────┤
│ Tool Catalog Table (collapsible section)                      │
│ ┌──────────┬──────────┬──────────────────────┬───────┐       │
│ │ Name     │ Category │ Description          │ Status│       │
│ └──────────┴──────────┴──────────────────────┴───────┘       │
├─────────────────────────────────────────────────────────────┤
│ Agent × Tool Permission Matrix (horizontally scrollable)     │
│ ┌─────────────┬───┬───┬───┬───┬───┬───┬───┬───┬───┐        │
│ │ Agent Name  │Cat│ T1│ T2│ T3│ T4│ T5│ T6│ T7│...│        │
│ │ (sticky col)│btg│   │   │   │   │   │   │   │   │        │
│ ├─────────────┼───┼───┼───┼───┼───┼───┼───┼───┼───┤        │
│ │ Agent A (M) │[✓]│ ☑ │ ☑ │ ☐ │ ☑ │ ☐ │ ☑ │ ☐ │   │        │
│ │ Agent B (S) │[−]│ ☑ │ ☐ │ ☑ │ ☐ │ ☐ │ ☐ │ ☑ │   │        │
│ │ Agent C (W)•│[✓]│ ☑ │ ☑ │ ☑ │ ☑ │ ☑ │ ☑ │ ☑ │   │        │
│ └─────────────┴───┴───┴───┴───┴───┴───┴───┴───┴───┘        │
├─────────────────────────────────────────────────────────────┤
│ Sticky Bottom Save Bar (only when pending changes exist)     │
│ "변경사항 8건"                            [취소] [저장]       │
└─────────────────────────────────────────────────────────────┘
```

- **Container**: `max-w-[1400px] mx-auto px-6 py-6 space-y-6`
- **Responsive**:
  - Desktop (>1024px): Full matrix with horizontal scroll
  - Tablet (768-1024px): Matrix with horizontal scroll, narrower catalog
  - Mobile (<768px): Catalog as card list, matrix hidden or agent-focused single-column view

## 3. Component Breakdown

### 3.1 PageHeader

- **Purpose**: Shows page title, subtitle with counts, and save/cancel controls when changes exist
- **Container**: `flex items-center justify-between`
- **Content**:
  - Left side:
    - `<h1 className="text-2xl font-bold tracking-tight text-white">도구 관리</h1>`
    - `<p className="text-sm text-slate-400 mt-1">{toolCount}개 도구 · {agentCount}개 에이전트</p>`
  - Right side (conditional, only when `changeCount > 0`):
    - Change badge: `<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">변경사항 {changeCount}건</span>`
    - Cancel button: `<button className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors">취소</button>`
    - Save button: `<button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>{saving ? '저장 중...' : '저장'}</button>`

### 3.2 CategoryFilterTabs

- **Purpose**: Filter catalog and matrix columns by tool category
- **Container**: `flex items-center gap-2 overflow-x-auto pb-1`
- **Tab (inactive)**: `px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap`
- **Tab (active)**: `px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 cursor-pointer whitespace-nowrap`
- **Tab content**: Category name + count badge
  - Count badge per category:
    - `전체`: `<span className="ml-1.5 text-xs opacity-70">(42)</span>`
    - `common`: blue badge `<span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">12</span>`
    - `finance`: emerald badge `<span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">8</span>`
    - `legal`: purple badge `<span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">6</span>`
    - `marketing`: amber badge `<span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">9</span>`
    - `tech`: cyan badge `<span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">7</span>`

### 3.3 ToolCatalogTable

- **Purpose**: Read-only catalog of all tools with name, category, description, registration status
- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Table Header**:
  ```
  <thead>
    <tr className="border-b border-slate-700">
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이름</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">카테고리</th>
      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">설명</th>
      <th className="text-center text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3 w-20">상태</th>
    </tr>
  </thead>
  ```
- **Table Row**:
  ```
  <tr className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
    <td className="px-4 py-3 font-mono text-sm text-slate-200">{tool.name}</td>
    <td className="px-4 py-3">
      <span className="px-2 py-0.5 rounded text-xs font-medium {categoryColorClasses}">{tool.category}</span>
    </td>
    <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{tool.description}</td>
    <td className="px-4 py-3 text-center">
      {tool.registered
        ? <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="등록됨" />
        : <span className="inline-block w-2 h-2 rounded-full bg-slate-500" title="미등록" />
      }
    </td>
  </tr>
  ```
- **Category color classes**:
  - common: `bg-blue-500/20 text-blue-400`
  - finance: `bg-emerald-500/20 text-emerald-400`
  - legal: `bg-purple-500/20 text-purple-400`
  - marketing: `bg-amber-500/20 text-amber-400`
  - tech: `bg-cyan-500/20 text-cyan-400`

### 3.4 AgentPermissionMatrix

- **Purpose**: Interactive matrix showing agents (rows) × tools (columns) with checkboxes
- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-x-auto`
- **Sticky left column**: Agent name column is `sticky left-0 z-10 bg-slate-800`
- **Column header (tool name)**:
  ```
  <th className="px-2 py-3 text-center min-w-[44px]">
    <span className="text-xs text-slate-400 [writing-mode:vertical-lr] transform -rotate-45 inline-block origin-bottom-left whitespace-nowrap">{tool.name}</span>
    <!-- Note: writing-mode requires arbitrary value syntax [writing-mode:vertical-lr] or custom CSS -->
  </th>
  ```
- **Row (agent)**:
  - Normal: `border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors`
  - Modified (pending changes): `border-b border-slate-700/50 bg-amber-500/5 hover:bg-amber-500/10`
- **Agent name cell (sticky)**:
  ```
  <td className="sticky left-0 z-10 bg-slate-800 px-4 py-3 whitespace-nowrap border-r border-slate-700">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white">{agent.name}</span>
      <span className="text-xs text-slate-500">({tier})</span>
      {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
    </div>
  </td>
  ```
- **Category batch toggle cell**:
  ```
  <td className="px-2 py-3 text-center border-r border-slate-700/30">
    <button className="w-6 h-6 rounded border flex items-center justify-center transition-colors {stateClasses}" title="Toggle all {category} tools">
      {allEnabled ? '✓' : someEnabled ? '−' : ''}
    </button>
  </td>
  ```
  - All enabled: `bg-blue-600 border-blue-500 text-white`
  - Some enabled: `bg-blue-600/30 border-blue-500/50 text-blue-400`
  - None enabled: `bg-slate-700 border-slate-600 text-transparent hover:border-slate-500`
- **Individual tool checkbox**:
  ```
  <td className="px-2 py-3 text-center">
    <button
      className="w-5 h-5 rounded border flex items-center justify-center transition-colors {checked ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}"
      onClick={() => handleToggleTool(agentId, toolName)}
    >
      {checked && <svg className="w-3 h-3">✓</svg>}
    </button>
  </td>
  ```

### 3.5 StickyBottomSaveBar

- **Purpose**: Persistent save controls when scrolled past header, only visible when changes exist
- **Container**: `fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-6 py-3` (conditional on `changeCount > 0`)
- **Content**:
  ```
  <div className="max-w-[1400px] mx-auto flex items-center justify-between">
    <span className="text-sm text-amber-400 font-medium">변경사항 {changeCount}건</span>
    <div className="flex items-center gap-3">
      <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium">취소</button>
      <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50" disabled={saving}>저장</button>
    </div>
  </div>
  ```

## 4. States

### 4.1 Loading State
- Page header visible with title only (no counts)
- CategoryFilterTabs: `<div className="flex gap-2">{[...Array(6)].map(() => <div className="bg-slate-700 animate-pulse rounded-lg h-8 w-20" />)}</div>`
- Catalog table: `<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8"><div className="bg-slate-700 animate-pulse rounded h-40 w-full" /></div>`
- Matrix: Same skeleton

### 4.2 Empty State (no tools)
- Container: `bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center`
- Icon: `<div className="text-4xl mb-3">🔧</div>`
- Title: `<h3 className="text-lg font-semibold text-white mb-2">등록된 도구가 없습니다</h3>`
- Description: `<p className="text-sm text-slate-400">tool_definitions 테이블에 도구를 등록하세요.</p>`

### 4.3 No Company Selected
- Container: `flex items-center justify-center h-64`
- Message: `<p className="text-sm text-slate-400">회사를 선택하세요</p>`

### 4.4 Error State
- Container: `bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center`
- Message: `<p className="text-sm text-red-400">{error.message}</p>`

## 5. Interactions & Animations

- **Checkbox toggle**: `transition-colors duration-150` on click
- **Row highlight on modify**: Smooth `transition-colors` from transparent to `bg-amber-500/5`
- **Save bar slide-in**: `transition-transform duration-300 translate-y-0` (from `translate-y-full`)
- **Tab switch**: Instant re-render, no animation needed
- **Save success**: Toast notification via `addToast({ type: 'success', message: '도구 권한이 저장되었습니다' })`

## 6. Responsive Behavior

- **Desktop (>1024px)**: Full layout as described. Matrix scrolls horizontally if needed.
- **Tablet (768-1024px)**: Same layout, catalog table may scroll. Matrix definitely scrolls.
- **Mobile (<768px)**:
  - Category tabs: horizontal scroll with `overflow-x-auto`
  - Catalog: Cards instead of table rows — each tool as `bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between`
  - Matrix: Full-width horizontal scroll, sticky agent column still works. Font sizes reduced to `text-xs`.
  - Bottom save bar: Full-width, buttons stack if needed

## 7. Accessibility

- All checkboxes use `<button>` with `role="checkbox"` and `aria-checked`
- Batch toggle buttons have descriptive `title` attributes
- Table uses semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col|row">`
- Focus states: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900`
- Keyboard: Tab navigation through matrix, Space/Enter to toggle

## 8. Data Flow Summary

```
selectedCompanyId (Zustand store)
  ↓
  ├─ useQuery(['tool-catalog', companyId]) → catalogGroups
  └─ useQuery(['agents', companyId]) → agents
       ↓
       pendingChanges: Map<agentId, string[]> (local state)
       ↓
       ├─ changeCount (derived, compares pending vs original)
       ├─ handleToggleTool(agentId, toolName) → update pendingChanges
       ├─ handleBatchToggle(agentId, category) → update pendingChanges
       ├─ handleSave() → Promise.all(PATCH per agent) → invalidate queries
       └─ handleCancel() → clear pendingChanges
```
