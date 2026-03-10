# 17. Costs (비용 분석) — Claude Design Spec

## Page Overview
The Costs page provides detailed AI operations cost analytics for the CEO. Shows total spending, budget usage, provider breakdown (donut chart), agent ranking by cost, and daily cost trend chart. Route: `/costs`. File: `packages/app/src/pages/costs.tsx`.

---

## Layout Structure

```
+------------------------------------------------------------------+
| HEADER: "← 비용 분석" + subtitle + PeriodSelector                |
+------------------------------------------------------------------+
| Budget Warning Banner (conditional)                               |
+------------------------------------------------------------------+
| 3-Column Summary Cards: Total Cost | Budget % | Provider Donut   |
+------------------------------------------------------------------+
| 2-Column: Top Agents by Cost  |  Daily Cost Trend Chart          |
+------------------------------------------------------------------+
```

### Root Container
```html
<div className="h-full overflow-y-auto bg-slate-900">
  <!-- Header -->
  <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
    <div className="flex items-center gap-3">
      <button className="text-slate-400 hover:text-slate-200 transition-colors" aria-label="대시보드로 돌아가기">
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <div>
        <h2 className="text-lg font-semibold text-slate-50">비용 분석</h2>
        <p className="text-xs text-slate-500 mt-0.5">AI 운영 비용을 상세하게 분석합니다</p>
      </div>
    </div>
    <!-- Period Selector -->
  </div>
  <!-- Content -->
  <div className="px-6 py-4 space-y-6 max-w-6xl">
    ...
  </div>
</div>
```

---

## Component Specifications

### 1. Period Selector
```html
<div className="flex items-center gap-2 flex-wrap">
  <!-- Active pill -->
  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 transition-colors">7일</button>
  <!-- Inactive pill -->
  <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">30일</button>
  <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">직접 설정</button>
  <!-- Custom date pickers (shown when "직접 설정" active) -->
  <div className="flex items-center gap-1.5">
    <input type="date" className="px-2 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 text-slate-200 outline-none focus:border-blue-500" />
    <span className="text-slate-500 text-xs">~</span>
    <input type="date" className="px-2 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 text-slate-200 outline-none focus:border-blue-500" />
  </div>
</div>
```

---

### 2. Budget Warning Banner

#### 80–99% Usage
```html
<div className="px-4 py-3 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
  예산 85% 사용 중 — 주의가 필요합니다
</div>
```

#### 100%+ Usage (Exceeded)
```html
<div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
  예산 초과! 현재 112% 사용 — 자동 차단이 활성화될 수 있습니다
</div>
```

---

### 3. Summary Cards (3-column grid)

```html
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
```

#### Total Cost Card
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">총 비용</p>
  <p className="text-3xl font-bold text-slate-50">$127.45</p>
  <p className="text-xs text-slate-500 mt-1">최근 7일 합계</p>
</div>
```

#### Budget Usage Card
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">예산 사용률</p>
  <p className="text-3xl font-bold text-emerald-400">62%</p>
  <!-- Color logic: >= 100 text-red-500, >= 80 text-amber-400, < 80 text-emerald-400 -->
  <p className="text-xs text-slate-500 mt-1">$127.45 / $200</p>
</div>
```

#### Provider Donut Card
```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">프로바이더별 비용</p>
  <div className="flex items-center gap-4">
    <!-- CSS Donut Chart -->
    <div className="relative w-20 h-20 shrink-0">
      <div className="w-full h-full rounded-full" style="background: conic-gradient(#3B82F6 0deg 216deg, #22C55E 216deg 288deg, #F97316 288deg 360deg)" />
      <div className="absolute inset-2.5 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-200">$127</span>
      </div>
    </div>
    <!-- Legend -->
    <div className="flex-1 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-500" />
          <span className="text-slate-400">Anthropic</span>
        </span>
        <span className="font-medium text-slate-200">$76.20</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span className="text-slate-400">OpenAI</span>
        </span>
        <span className="font-medium text-slate-200">$38.10</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-orange-500" />
          <span className="text-slate-400">Google</span>
        </span>
        <span className="font-medium text-slate-200">$13.15</span>
      </div>
    </div>
  </div>
</div>
```

#### Provider Colors
| Provider | Color |
|----------|-------|
| Anthropic (Claude) | `#3B82F6` (blue-500) |
| OpenAI (GPT) | `#22C55E` (green-500) |
| Google (Gemini) | `#F97316` (orange-500) |
| Other | `#9CA3AF` (gray-400) |

---

### 4. Top Agents by Cost (Left Column)

```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
  <h3 className="text-sm font-semibold text-slate-300 mb-3">에이전트별 비용 순위</h3>
  <div className="space-y-2">
    <!-- Agent row -->
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-5 text-right font-mono">1</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm text-slate-100 truncate">김비서</span>
          <span className="text-xs font-mono text-slate-300 ml-2 shrink-0">$42.30</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all" style="width: 100%" />
        </div>
        <span className="text-[10px] text-slate-500">1,234 호출</span>
      </div>
    </div>
  </div>
  <!-- Show more button -->
  <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 hover:underline">
    더보기 (15개)
  </button>
</div>
```

---

### 5. Daily Cost Trend Chart (Right Column)

```html
<div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
  <h3 className="text-sm font-semibold text-slate-300 mb-4">일일 비용 추이</h3>
  <!-- Bar Chart -->
  <div className="flex items-end gap-[2px] h-40">
    <!-- Each bar -->
    <div className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative">
      <div
        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400 min-h-[2px]"
        style="height: 75%"
      />
      <span className="text-[8px] text-slate-500 mt-1 truncate w-full text-center">03/01</span>
      <!-- Tooltip (on hover) -->
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-slate-100 text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
        $18.45
      </div>
    </div>
  </div>
</div>
```

---

## States

### Loading Skeleton
```html
<div className="space-y-6">
  <!-- Summary cards skeleton -->
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 space-y-2">
        <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-32 bg-slate-700 rounded animate-pulse" />
      </div>
    ))}
  </div>
  <!-- Chart skeletons -->
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
      <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mb-3" />
      <div className="h-40 w-full bg-slate-700 rounded animate-pulse" />
    </div>
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
      <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mb-3" />
      <div className="h-40 w-full bg-slate-700 rounded animate-pulse" />
    </div>
  </div>
</div>
```

### Empty State (No data)
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <BarChart3Icon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-base font-medium text-slate-300 mb-2">데이터가 없습니다</h3>
  <p className="text-sm text-slate-500">선택한 기간에 해당하는 비용 데이터가 없습니다</p>
</div>
```

### No Budget Set
When `budget` is undefined, show in budget card: `<p className="text-xs text-slate-500 mt-1">예산 미설정</p>` and usage shows `0%` in `text-slate-400`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspace/dashboard/costs?days=N` | Cost overview (by model, agent, source) |
| GET | `/workspace/dashboard/budget` | Budget info |
| GET | `/workspace/dashboard/costs/daily?startDate=&endDate=` | Daily cost trend |
| GET | `/workspace/dashboard/costs/by-agent?startDate=&endDate=` | Agent cost breakdown |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `>= lg` | 2-col chart area |
| `sm – lg` | 3-col summary, 1-col charts stacked |
| `< sm` | 1-col everything stacked |

---

## Accessibility
- Donut chart: `role="img" aria-label="프로바이더별 비용 비율"`
- Bar chart tooltips accessible via keyboard focus
- Budget warning banner: `role="alert"` for screen readers
- Period selector: toggle group with `aria-pressed` states
