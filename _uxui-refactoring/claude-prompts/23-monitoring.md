# 23. Monitoring (시스템 모니터링) — Design Specification

## 1. Page Overview

- **Purpose**: Read-only system health dashboard for admins. Shows server status, memory usage, database connectivity, and recent errors. Auto-refreshes every 30 seconds. No company selection required (system-wide metrics).
- **Key User Goals**: (1) Verify server is healthy at a glance, (2) Check memory pressure, (3) Confirm database is responsive, (4) Review recent errors for debugging.
- **Data Dependencies**:
  - `GET /admin/monitoring/status` → `{ data: MonitoringData }`
  - `MonitoringData = { server: { status, uptime, version: { build, hash, runtime } }, memory: { rss, heapUsed, heapTotal, usagePercent }, db: { status, responseTimeMs }, errors: { count24h, recent: { timestamp, message }[] } }`
  - Auto-refetch: `refetchInterval: 30_000`
- **Current State**: `packages/admin/src/pages/monitoring.tsx`. Uses Card/Badge/Skeleton from @corthex/ui, zinc color scheme, basic 2-col grid. Needs slate dark-mode redesign with better visual hierarchy and status indicators.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Page Header                                                  │
│ "시스템 모니터링"                              [새로고침]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │ 서버 상태               │ │ 메모리                      │ │
│ │ ● ok        3일 14시간  │ │ 67.2%  ████████░░░░         │ │
│ │ Bun 1.x     #142·a3f7  │ │ RSS: 312MB  Heap: 128/256MB │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │ 데이터베이스            │ │ 에러 (24시간)               │ │
│ │ ● ok         12ms      │ │ 3건                         │ │
│ │                         │ │ 10:23 — TypeError: ...      │ │
│ │                         │ │ 09:15 — RangeError: ...     │ │
│ │                         │ │ 08:02 — NetworkError: ...   │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- **Container**: `max-w-4xl mx-auto px-6 py-6 space-y-6`
- **Card grid**: `grid grid-cols-1 lg:grid-cols-2 gap-4`
- **Responsive**:
  - Desktop (>1024px): 2×2 card grid
  - Mobile (<1024px): Single column stack

## 3. Component Breakdown

### 3.1 PageHeader

- **Container**: `flex items-center justify-between`
- **Left**:
  - `<h1 className="text-2xl font-bold tracking-tight text-white">시스템 모니터링</h1>`
- **Right**:
  - `<button className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2" disabled={isFetching}>`
  - Refresh icon: `<svg className="w-4 h-4 {isFetching ? 'animate-spin' : ''}" />` (circular arrow)
  - Text: `{isFetching ? '새로고침 중...' : '새로고침'}`

### 3.2 ServerStatusCard

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl`
- **Header**: `<div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">`
  - Title: `<h3 className="text-sm font-semibold text-slate-200">서버 상태</h3>`
  - Status badge:
    - OK: `<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />정상</span>`
    - Error: `<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />오류</span>`
- **Body**: `<div className="px-5 py-4 space-y-3">`
  - **Uptime row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">업타임</span>
      <span className="text-sm font-medium text-white">{formatUptime(uptime)}</span>
    </div>
    ```
  - **Runtime row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">런타임</span>
      <span className="text-sm font-mono text-slate-300">{version.runtime}</span>
    </div>
    ```
  - **Build row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">빌드</span>
      <span className="text-sm font-mono text-slate-300">#{version.build} · <span className="text-slate-500">{version.hash}</span></span>
    </div>
    ```

### 3.3 MemoryCard

- **Container**: Same card base as ServerStatusCard
- **Header**: `<div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">`
  - Title: `<h3 className="text-sm font-semibold text-slate-200">메모리</h3>`
  - Usage badge:
    - `< 80%`: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">{usagePercent}%</span>`
    - `80-89%`: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">{usagePercent}%</span>`
    - `≥ 90%`: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">{usagePercent}%</span>`
- **Body**: `<div className="px-5 py-4 space-y-4">`
  - **Memory bar (MemoryBar component)**:
    ```
    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 {colorClass}"
        style={{ width: `${Math.min(usagePercent, 100)}%` }}
      />
    </div>
    ```
    - Color class: `< 80%` → `bg-emerald-500`, `80-89%` → `bg-amber-500`, `≥ 90%` → `bg-red-500`
  - **RSS row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">RSS</span>
      <span className="text-sm font-mono text-slate-300">{rss} MB</span>
    </div>
    ```
  - **Heap row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">Heap</span>
      <span className="text-sm font-mono text-slate-300">{heapUsed} / {heapTotal} MB</span>
    </div>
    ```

### 3.4 DatabaseCard

- **Container**: Same card base
- **Header**: Title "데이터베이스" + status badge (same styling as server status)
- **Body**: `<div className="px-5 py-4">`
  - **Response time row**:
    ```
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">응답 시간</span>
      <span className="text-sm font-mono text-slate-300">{responseTimeMs} ms</span>
    </div>
    ```
  - Color coding for response time (optional enhancement):
    - `< 50ms`: `text-emerald-400`
    - `50-200ms`: `text-amber-400`
    - `> 200ms`: `text-red-400`

### 3.5 ErrorCard

- **Container**: Same card base
- **Header**: Title "에러 (24시간)" + count badge:
  - Zero: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">0건</span>`
  - Non-zero: `<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">{count}건</span>`
- **Body**: `<div className="px-5 py-4">`
  - **If no errors**:
    ```
    <div className="text-center py-4">
      <p className="text-sm text-slate-500">에러 없음</p>
    </div>
    ```
  - **Error list** (up to 5 recent):
    ```
    <div className="space-y-2">
      {errors.recent.map(err => (
        <div className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
          <span className="text-xs text-slate-500 font-mono whitespace-nowrap mt-0.5">
            {new Date(err.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <p className="text-xs text-red-400/80 leading-relaxed line-clamp-2">{err.message}</p>
        </div>
      ))}
    </div>
    ```

## 4. States

### 4.1 Loading State
- Header visible with title + disabled refresh button
- Card grid: `<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(4)].map(() => <div className="bg-slate-800/50 border border-slate-700 rounded-xl h-40 animate-pulse" />)}</div>`

### 4.2 Error State (API failure)
- Single card spanning full width:
  ```
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
    <p className="text-sm text-red-400">모니터링 데이터를 불러올 수 없습니다.</p>
    <p className="text-xs text-slate-500 mt-1">{error.message}</p>
    <button className="mt-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm" onClick={refetch}>다시 시도</button>
  </div>
  ```

### 4.3 Fetching (background refetch)
- Refresh button shows spinning icon + "새로고침 중..."
- Cards remain visible with current data (no skeleton)

## 5. Interactions & Animations

- **Auto-refresh**: Every 30s via React Query `refetchInterval`
- **Manual refresh**: Click refresh button → `refetch()`
- **Memory bar animation**: `transition-all duration-500` on width change
- **Refresh icon spin**: `animate-spin` class while `isFetching`
- **No hover effects on cards** (read-only dashboard)

## 6. Responsive Behavior

- **Desktop (>1024px)**: 2×2 grid of cards
- **Mobile (<1024px)**: Single column, all cards full-width
- All cards maintain same internal padding and structure at all sizes
- Page padding: `px-4 md:px-6`

## 7. Accessibility

- Status badges use both color AND text (not color-alone)
- Memory bar has percentage value visible (not color-alone)
- Refresh button has clear label text
- Semantic HTML structure within cards

## 8. Data Flow Summary

```
(No company selection needed)
  ↓
  useQuery({
    queryKey: ['monitoring'],
    queryFn: () => api.get<MonitoringData>('/admin/monitoring/status'),
    refetchInterval: 30_000
  })
  ↓
  ├─ data.server → ServerStatusCard
  ├─ data.memory → MemoryCard + MemoryBar
  ├─ data.db → DatabaseCard
  └─ data.errors → ErrorCard
```
