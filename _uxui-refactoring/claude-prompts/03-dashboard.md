# 03. Dashboard (작전현황) — Design Specification

## 1. Page Overview

- **Purpose**: CEO's at-a-glance executive dashboard showing KPIs (tasks, costs, agents, integrations), usage charts, budget tracking, satisfaction metrics, and quick action shortcuts.
- **Key User Goals**: Scan today's status in 3 seconds, check budget health, execute quick actions, monitor AI provider status.
- **Route**: `/dashboard`
- **Data Dependencies**:
  - `GET /workspace/dashboard/summary` → tasks/cost/agents/integrations (30s cache)
  - `GET /workspace/dashboard/usage?days={7|30}` → usage chart data (5min cache)
  - `GET /workspace/dashboard/budget` → budget progress + dept breakdown (5min cache)
  - `GET /workspace/dashboard/quick-actions` → quick action buttons (1min cache)
  - `GET /workspace/dashboard/satisfaction?period={7d|30d|all}` → satisfaction donut (30s cache)
  - `POST /workspace/presets/:id/execute` → execute quick action
  - WebSocket channels: `cost`, `agent-status`, `command` (auto-invalidate queries)
- **Current State**: Functional 630-line page with custom charts. Needs slate token consistency, refined card styling, and better mobile stacking.

## 2. Page Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│ Page Header                                                     │
│ "작전현황" + WS status indicator                                │
├────────────────────────────────────────────────────────────────┤
│ Summary Cards (4-col grid, responsive)                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ 작업현황 │ │ 비용현황 │ │ 에이전트 │ │ 연동상태 │           │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├───────────────────────────────┬────────────────────────────────┤
│ Usage Chart (AI 사용량)       │ Budget Bar (월 예산 진행률)    │
│ [7일 | 30일 toggle]          │ [Progress bar + projected]     │
│ [Stacked bar chart]          │ [Dept breakdown table]         │
├───────────────────────────────┼────────────────────────────────┤
│ Quick Actions (2x2 grid)      │ Satisfaction (donut chart)     │
│ [📋 일일브리핑] [🔍 시스템]  │ [7일|30일|전체 toggle]        │
│ [📊 비용리포트] [▶️ 루틴]    │ [Donut + legend]              │
└───────────────────────────────┴────────────────────────────────┘

Mobile: all sections stack vertically, cards 2-col then 1-col
```

- **Page container**: `space-y-6 pb-8`
- **Header**: `flex items-center justify-between`
- **Cards grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- **Lower grid**: `grid grid-cols-1 lg:grid-cols-2 gap-4`

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between mb-2`
- **Left**:
  - Title: `<h1 className="text-2xl font-bold tracking-tight text-slate-50">작전현황</h1>`
  - Subtitle: `<p className="text-sm text-slate-400 mt-0.5">조직 전체 현황을 한눈에 파악합니다</p>`
- **Right**: WS status indicator
  - Connected: `<span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 실시간</span>`
  - Disconnected: `<span className="flex items-center gap-1.5 text-xs text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 연결 끊김 (재시도 {n})</span>`

- **data-testid**: `dashboard-header`

### 3.2 SummaryCards (4 cards)

**Card template**: `<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">`
- Icon row: `<div className="flex items-center justify-between mb-3">`
  - Icon: `<span className="text-2xl">{emoji}</span>`
  - Title: `<span className="text-sm font-medium uppercase tracking-wider text-slate-400">{title}</span>`

#### TaskCard
- Total: `<p className="text-3xl font-bold text-slate-50 mb-3">{total}</p>`
- Stats row: `<div className="flex items-center gap-4 text-xs">`
  - Completed: `<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 완료 {completed}</span>`
  - Failed: `<span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 실패 {failed}</span>`
  - In progress: `<span className="flex items-center gap-1 text-blue-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 진행중 {inProgress}</span>`
- **data-testid**: `card-tasks`

#### CostCard (clickable → /costs)
- Container adds: `cursor-pointer hover:border-blue-500/50 transition-colors`
- Today spend: `<p className="text-3xl font-bold text-slate-50 mb-3">${todayUsd.toFixed(2)}</p>`
- Budget usage: `<div className="flex items-center justify-between text-xs text-slate-400 mb-2"><span>월 예산</span><span>{budgetUsagePercent}%</span></div>`
- Mini progress bar: `<div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full rounded-full transition-all duration-500 {pct < 60 ? 'bg-emerald-500' : pct < 80 ? 'bg-amber-500' : 'bg-red-500'}" style="width: {pct}%" /></div>`
- Provider breakdown: `<div className="flex items-center gap-3 mt-2 text-xs">`
  - Each: `<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style="background: {color}" />{name}</span>`
  - Anthropic: #3B82F6, OpenAI: #22C55E, Google: #F97316
- **data-testid**: `card-cost`

#### AgentCard
- Total: `<p className="text-3xl font-bold text-slate-50 mb-3">{total}</p>`
- Stats: same pattern as TaskCard
  - Active: `emerald-500, 활성 {active}`
  - Idle: `slate-500, 대기 {idle}`
  - Error: `red-500, 오류 {error}`
- **data-testid**: `card-agents`

#### IntegrationCard
- Provider list: `<div className="space-y-2 mt-2">`
  - Row: `<div className="flex items-center justify-between text-xs">`
    - Name: `<span className="text-slate-300">{name}</span>`
    - Status:
      - up: `<span className="flex items-center gap-1 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 정상</span>`
      - down: `<span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 중단</span>`
  - Providers: Anthropic, OpenAI, Google
  - Tool system: separate row with label "도구 시스템"
- **data-testid**: `card-integrations`

### 3.3 UsageChart

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Header**: `<div className="flex items-center justify-between mb-4">`
  - Title: `<h3 className="text-sm font-medium text-slate-300">AI 사용량 ({days}일)</h3>`
  - Toggle: `<button className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">{days === 7 ? '30일 보기' : '7일 보기'}</button>`

**Chart area**: `h-48 relative`
- Stacked bars per day: `<div className="flex items-end gap-1 h-full">`
  - Day column: `<div className="flex-1 flex flex-col justify-end">`
    - Segments stacked bottom-up per provider
    - Each segment: `<div className="w-full rounded-t-sm transition-all duration-300" style="height: {pct}%; background: {providerColor}" />`
    - Min height 2px if value > 0
  - Tooltip (on hover): `<div className="absolute bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl z-10 pointer-events-none">`
    - `<p className="font-medium">{date}</p><p className="text-slate-400">${cost.toFixed(2)}</p>`

**X-axis labels**: `<div className="flex justify-between mt-2 text-xs text-slate-600">`
- Show first, last, and every 5th label if 10+ days

**Legend**: `<div className="flex items-center justify-center gap-4 mt-3">`
- Each: `<span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style="background: {color}" />{name}</span>`

**Empty state**: `<div className="flex items-center justify-center h-48 text-sm text-slate-600">사용량 데이터가 없습니다</div>`

- **data-testid**: `usage-chart`

### 3.4 BudgetBar

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Header**: `<div className="flex items-center justify-between mb-3">`
  - Title: `<h3 className="text-sm font-medium text-slate-300">월 예산 진행률</h3>`
  - Amount: `<span className="text-sm text-slate-400">${spend.toFixed(2)} / ${budget.toFixed(2)} {isDefault && <span className="text-xs text-slate-600">(기본값)</span>}</span>`

**Progress bar**: `<div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">`
- Fill: `<div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 {color}" style="width: {clampedPct}%" />`
  - Color: `pct < 60 ? 'bg-emerald-500' : pct < 80 ? 'bg-amber-500' : 'bg-red-500'`
- Projected marker: `<div className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-400" style="left: {projectedPct}%">`
  - Label: `<span className="absolute -top-5 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">예상 ${projected.toFixed(2)}</span>`

**Percentage labels**: `<div className="flex items-center justify-between mt-1 text-xs text-slate-600"><span>0%</span><span className="font-medium text-slate-400">{usagePercent}%</span><span>100%</span></div>`

**Department breakdown** (if departments exist):
- Label: `<h4 className="text-xs font-medium text-slate-500 mt-4 mb-2">부서별 비용</h4>`
- Table: `<div className="space-y-1.5">`
  - Row: `<div className="flex items-center justify-between text-xs"><span className="text-slate-400">{deptName}</span><span className="text-slate-300 font-mono">${costUsd.toFixed(2)}</span></div>`

- **data-testid**: `budget-bar`

### 3.5 QuickActionsPanel

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Header**: `<h3 className="text-sm font-medium text-slate-300 mb-3">퀵 액션</h3>`
- **Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-2`
- **Button**: `<button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all text-left disabled:opacity-50 disabled:cursor-wait">`
  - Icon: `<span className="text-lg">{emoji}</span>`
  - Label: `<span className="text-sm font-medium text-slate-200">{label}</span>`
  - Loading: icon replaced with `<Loader2 className="w-4 h-4 animate-spin text-slate-400" />`

- **data-testid**: `quick-actions`

### 3.6 SatisfactionChart

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl p-5`
- **Header**: `<div className="flex items-center justify-between mb-4">`
  - Title: `<h3 className="text-sm font-medium text-slate-300">명령 만족도</h3>`
  - Period toggles: `<div className="flex items-center gap-1">`
    - Button: `<button className="text-xs px-2 py-1 rounded {active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'} transition-colors">{label}</button>`
    - Labels: 7일, 30일, 전체

**Donut chart** (CSS conic-gradient):
- Container: `flex items-center justify-center`
- Donut: `<div className="w-32 h-32 rounded-full relative" style="background: conic-gradient(#10b981 0% {posPct}%, #ef4444 {posPct}% {posPct+negPct}%, #3f3f46 {posPct+negPct}% 100%)">`
  - Center circle: `<div className="absolute inset-3 rounded-full bg-slate-800 flex flex-col items-center justify-center">`
    - Rate: `<span className="text-2xl font-bold text-slate-50">{rate}%</span>`
    - Label: `<span className="text-xs text-slate-500">만족도</span>`

**Legend**: `<div className="space-y-2 mt-4">`
- Row: `<div className="flex items-center justify-between text-xs">`
  - Positive: `<span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> 긍정</span><span className="text-slate-300">{positive} ({posPct}%)</span>`
  - Negative: `<span className="..."><span className="... bg-red-500" /> 부정</span><span>{negative} ({negPct}%)</span>`
  - Neutral: `<span className="..."><span className="... bg-slate-600" /> 무응답</span><span className="text-slate-500">{neutral}</span>`
  - Total: `<div className="border-t border-slate-700 pt-1 mt-1 flex justify-between text-xs text-slate-500"><span>전체</span><span>{total}</span></div>`

- **data-testid**: `satisfaction-chart`

### 3.7 DashboardSkeleton

- **Purpose**: Loading state for entire dashboard
- Cards: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"><div className="bg-slate-700 animate-pulse rounded h-5 w-20 mb-3" /><div className="bg-slate-700 animate-pulse rounded h-10 w-24 mb-3" /><div className="bg-slate-700 animate-pulse rounded h-3 w-full" /></div>)}</div>`
- Chart: `<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 h-64"><div className="bg-slate-700/50 animate-pulse rounded h-full" /></div>`
- Budget: `<div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 h-24"><div className="bg-slate-700/50 animate-pulse rounded h-3 w-full" /></div>`

**Error fallback**:
- Container: `flex flex-col items-center justify-center py-16`
- Icon: `<AlertCircle className="w-10 h-10 text-slate-600 mb-3" />`
- Title: `<p className="text-sm text-slate-400">데이터를 불러올 수 없습니다</p>`
- Hint: `<p className="text-xs text-slate-500 mt-1">잠시 후 자동으로 재시도합니다</p>`

## 4. Interaction Specifications

| Action | Trigger | Result |
|--------|---------|--------|
| Navigate to costs | Click cost card | Navigate to /costs |
| Toggle usage period | Click toggle button | Re-fetch with days=7 or 30 |
| Toggle satisfaction | Click period button | Re-fetch with period param |
| Execute quick action | Click action button | POST execute preset OR navigate to /command-center |
| Hover chart bar | Mouseover bar segment | Show tooltip with date + cost |
| WS cost event | Automatic | Invalidate summary, usage, budget queries |
| WS agent-status | Automatic | Invalidate summary query |
| WS command event | Automatic | Invalidate summary query |

## 5. Responsive Design

### Desktop (≥ 1024px)
- Summary: 4-col grid
- Lower sections: 2-col grid (usage+budget left, quick+satisfaction right)
- Chart: h-48

### Tablet (768px - 1023px)
- Summary: 2-col grid
- Lower sections: 1-col stacked
- Chart: h-40

### Mobile (< 768px)
- Summary: 1-col stacked
- All sections: 1-col stacked
- Quick actions: 2-col grid still (small buttons)
- Chart: h-36, smaller labels
- Donut: w-28 h-28

## 6. Animation & Transitions

- Card hover (cost): `transition-colors duration-200`
- Progress bar fill: `transition-all duration-500`
- Chart bar height: `transition-all duration-300`
- Donut gradient: no transition (instant render)
- Skeleton: `animate-pulse`
- Quick action loading spinner: `animate-spin`
- Period button active: `transition-colors duration-150`
- WS status dot: connected = static, disconnected = no pulse

## 7. Accessibility

- **ARIA**: Cards `role="region" aria-label="{title}"`, chart `role="img" aria-label="AI usage chart"`
- **Labels**: Toggle buttons `aria-pressed`, period buttons `aria-current`
- **Contrast**: Large numbers (slate-50 on slate-800/50) exceed 12:1
- **Screen reader**: Provider status `aria-label="{provider} {status}"`
- **Keyboard**: All buttons focusable, quick actions activatable via Enter/Space
- **Reduced motion**: Respect `prefers-reduced-motion` for chart animations

## 8. data-testid Map

| Element | data-testid |
|---------|-------------|
| Dashboard page | `dashboard-page` |
| Header | `dashboard-header` |
| WS indicator | `ws-status` |
| Task card | `card-tasks` |
| Cost card | `card-cost` |
| Agent card | `card-agents` |
| Integration card | `card-integrations` |
| Provider status | `provider-{name}` |
| Usage chart | `usage-chart` |
| Usage toggle | `usage-toggle` |
| Chart bar | `chart-bar-{date}` |
| Budget bar | `budget-bar` |
| Budget fill | `budget-fill` |
| Projected marker | `budget-projected` |
| Dept breakdown row | `dept-cost-{id}` |
| Quick actions panel | `quick-actions` |
| Quick action button | `quick-action-{id}` |
| Satisfaction chart | `satisfaction-chart` |
| Satisfaction period | `satisfaction-period-{label}` |
| Donut | `donut-chart` |
| Skeleton | `dashboard-skeleton` |
| Error fallback | `dashboard-error` |
