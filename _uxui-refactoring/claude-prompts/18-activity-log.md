# 18. Activity Log (통신로그) — Claude Design Spec

## Page Overview
The Activity Log is a comprehensive, tabbed log viewer for all agent activities, delegations, quality reviews, and tool invocations. Features real-time WebSocket updates, security alerts, and expandable QA detail panels. Route: `/activity-log`. File: `packages/app/src/pages/activity-log.tsx`.

---

## Layout Structure

```
+------------------------------------------------------------------+
| HEADER: "통신로그" + WS Status Indicator                         |
+------------------------------------------------------------------+
| TABS: 활동 | 통신 | QA | 도구                                    |
+------------------------------------------------------------------+
| [Security Alert Banner — QA tab only, conditional]               |
+------------------------------------------------------------------+
| FILTERS: Search + Date Range + Tab-specific filters              |
+------------------------------------------------------------------+
| TABLE CONTENT (tab-specific)                                      |
+------------------------------------------------------------------+
| PAGINATION: count + prev/next                                     |
+------------------------------------------------------------------+
```

### Root Container
```html
<div className="h-full flex flex-col bg-slate-900">
```

---

## Component Specifications

### 1. Header
```html
<div className="px-4 md:px-6 py-4 border-b border-slate-700 flex items-center justify-between">
  <h2 className="text-lg font-semibold text-slate-50">통신로그</h2>
  <!-- WS Status Indicator -->
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    <span className="text-xs text-slate-400">실시간</span>
  </div>
</div>
```

#### WS Status States
| State | Indicator |
|-------|-----------|
| Connected | `bg-emerald-500 animate-pulse` + "실시간" |
| Reconnecting | `bg-amber-500 animate-pulse` + "재연결 중" |
| Disconnected | `bg-red-500` + "오프라인" |

---

### 2. Tabs
```html
<div className="px-4 md:px-6 border-b border-slate-700">
  <div className="flex gap-0">
    <!-- Active tab -->
    <button className="px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-400 transition-colors">
      활동
    </button>
    <!-- Inactive tab -->
    <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
      통신
    </button>
    <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
      QA
    </button>
    <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
      도구
    </button>
  </div>
</div>
```

---

### 3. Security Alert Banner (QA tab only)

```html
<!-- Collapsed -->
<div className="mx-4 md:mx-6 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl cursor-pointer flex items-center justify-between hover:bg-red-500/15 transition-colors">
  <div className="flex items-center gap-2">
    <ShieldAlertIcon className="w-4 h-4 text-red-400" />
    <span className="text-red-400 text-sm font-medium">보안 알림: 최근 24시간 3건 차단</span>
  </div>
  <span className="text-xs text-red-500">상세 보기</span>
</div>

<!-- Expanded detail -->
<div className="mx-4 md:mx-6 mb-2 p-3 bg-red-500/5 border border-red-500/20 rounded-b-xl">
  <table className="w-full text-xs">
    <thead>
      <tr className="text-slate-500 border-b border-red-500/20">
        <th className="text-left py-1 pr-2 font-medium">시간</th>
        <th className="text-left py-1 pr-2 font-medium">유형</th>
        <th className="text-left py-1 pr-2 font-medium">심각도</th>
        <th className="text-left py-1 font-medium">상세</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-red-500/10">
        <td className="py-1.5 pr-2 text-slate-500 whitespace-nowrap">03/09 14:32</td>
        <td className="py-1.5 pr-2"><Badge variant="error">입력 차단</Badge></td>
        <td className="py-1.5 pr-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">critical</span>
        </td>
        <td className="py-1.5 text-slate-400 truncate max-w-[300px]">SQL injection attempt</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4. Filter Bar
```html
<div className="px-4 md:px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-2 items-center">
  <!-- Search -->
  <div className="relative">
    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
    <input
      className="bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 outline-none w-40 md:w-48 transition-colors"
      placeholder="검색..."
    />
  </div>
  <!-- Date range -->
  <input type="date" className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none focus:border-blue-500" />
  <span className="text-xs text-slate-500">~</span>
  <input type="date" className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none focus:border-blue-500" />
  <!-- Tab-specific: Tool name filter (도구 tab) -->
  <input className="... w-32 md:w-40" placeholder="도구명 필터..." />
  <!-- Tab-specific: Conclusion filter (QA tab) -->
  <select className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none">
    <option value="">전체 판정</option>
    <option value="pass">PASS</option>
    <option value="fail">FAIL</option>
  </select>
</div>
```

---

### 5. Table — 활동 (Agents) Tab

```html
<div className="overflow-x-auto">
  <table className="w-full text-sm min-w-[640px]">
    <thead>
      <tr className="text-xs text-slate-500 border-b border-slate-700">
        <th className="text-left py-2 pr-3 font-medium">시간</th>
        <th className="text-left py-2 pr-3 font-medium">에이전트</th>
        <th className="text-left py-2 pr-3 font-medium">명령</th>
        <th className="text-left py-2 pr-3 font-medium">상태</th>
        <th className="text-right py-2 pr-3 font-medium">소요시간</th>
        <th className="text-right py-2 font-medium">토큰</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">03/09 14:32</td>
        <td className="py-2.5 pr-3 text-xs font-medium text-slate-200">김비서</td>
        <td className="py-2.5 pr-3 text-xs text-slate-300 truncate max-w-[200px]">마케팅 보고서 작성</td>
        <td className="py-2.5 pr-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400">완료</span>
        </td>
        <td className="py-2.5 pr-3 text-xs text-right text-slate-500">2.3s</td>
        <td className="py-2.5 text-xs text-right text-slate-500">1,234</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Status Badge Colors
| Status | Classes |
|--------|---------|
| completed/done/success/pass | `bg-emerald-500/20 text-emerald-400` |
| failed/error/fail | `bg-red-500/20 text-red-400` |
| working/start/running | `bg-blue-500/20 text-blue-400` |
| warning | `bg-amber-500/20 text-amber-400` |
| default | `bg-slate-600/50 text-slate-400` |

---

### 6. Table — 통신 (Delegations) Tab

Columns: 시간 | 발신 → 수신 | 명령 요약 | 비용 | 토큰

```html
<td className="py-2.5 pr-3 text-xs">
  <span className="font-medium text-slate-200">김비서</span>
  <span className="text-slate-500 mx-1">→</span>
  <span className="font-medium text-cyan-400">마케팅팀장</span>
</td>
```

---

### 7. Table — QA (Quality) Tab

Expandable rows with detail panel:

```html
<!-- Row header (clickable) -->
<div className="flex items-center cursor-pointer hover:bg-slate-800/50 transition-colors py-2.5">
  <div className="pr-3 text-xs text-slate-500 whitespace-nowrap min-w-[90px]">03/09 14:32</div>
  <div className="pr-3 text-xs text-slate-300 truncate max-w-[200px] flex-1">마케팅 보고서 분석</div>
  <!-- Score bar -->
  <div className="pr-3 min-w-[120px]">
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style="width: 85%" />
      </div>
      <span className="text-xs font-bold text-emerald-400">85%</span>
    </div>
  </div>
  <div className="pr-3 min-w-[60px]"><Badge>PASS</Badge></div>
  <div className="text-xs text-right min-w-[50px] text-slate-400">0</div>
</div>

<!-- Expanded detail panel -->
<div className="bg-slate-800/30 border-b border-slate-700">
  <!-- Sub-tabs: 규칙별 결과 | 루브릭 | 환각 보고서 | 기존 점수 -->
  <div className="px-4 pt-2 flex gap-1 border-b border-slate-700">
    <button className="px-3 py-1.5 text-[11px] font-medium rounded-t border-b-2 border-blue-500 text-blue-400 bg-slate-800">
      규칙별 결과 (5)
    </button>
    <button className="px-3 py-1.5 text-[11px] font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-300">
      루브릭
    </button>
  </div>
  <!-- Content area -->
  <div className="px-4 py-3">
    <!-- Rule Results -->
    <div className="space-y-3">
      <h4 className="text-[11px] font-semibold text-slate-300 mb-1.5">완전성</h4>
      <div className="space-y-1">
        <div className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-slate-900/50">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 shrink-0">critical</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 shrink-0">PASS</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-300">필수 섹션 포함 여부</span>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">모든 필수 섹션이 포함됨</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Feedback (if exists) -->
  <div className="px-4 pb-3">
    <p className="text-[11px] text-slate-400 whitespace-pre-wrap border-t border-slate-700 pt-2">
      전반적으로 양호하나, 리스크 분석 부분의 근거가 부족합니다.
    </p>
  </div>
</div>
```

#### Hallucination Report Panel
```html
<div className="space-y-3">
  <!-- Summary -->
  <div className="flex items-center gap-3 flex-wrap">
    <Badge variant="success">정상</Badge>
    <div className="flex gap-4 text-xs">
      <span className="text-slate-500">총 주장: <span className="font-medium text-slate-200">12</span></span>
      <span className="text-slate-500">검증: <span className="font-medium text-emerald-400">10</span></span>
      <span className="text-slate-500">불일치: <span className="font-medium text-red-400">1</span></span>
      <span className="text-slate-500">미확인: <span className="font-medium text-amber-400">1</span></span>
    </div>
  </div>
  <!-- Score bar -->
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-slate-500 w-16">환각 점수</span>
    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-emerald-500" style="width: 92%" />
    </div>
    <span className="text-xs font-bold text-emerald-400">92%</span>
  </div>
</div>
```

#### Score Color Logic
```
>= 80% → bg-emerald-500, text-emerald-400
>= 60% → bg-amber-500, text-amber-400
< 60%  → bg-red-500, text-red-400
```

---

### 8. Table — 도구 (Tools) Tab

Columns: 시간 | 도구명 | 에이전트 | 소요시간 | 상태 | Input 요약

```html
<td className="py-2.5 pr-3 text-xs font-medium font-mono text-cyan-400">search_web</td>
```

---

### 9. Pagination
```html
<div className="px-4 md:px-6 py-3 border-t border-slate-700 flex items-center justify-between">
  <span className="text-xs text-slate-500">1,234건</span>
  <div className="flex items-center gap-2">
    <button disabled className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-700 transition-colors">이전</button>
    <span className="text-xs text-slate-400">1 / 62</span>
    <button className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">다음</button>
  </div>
</div>
```

---

## States

### Loading
```html
<SkeletonTable rows={8} />
<!-- Each row: 6 skeleton cells with bg-slate-700/50 animate-pulse -->
```

### Empty
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <ClipboardListIcon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-base font-medium text-slate-300 mb-2">데이터가 없습니다</h3>
  <p className="text-sm text-slate-500">선택한 기간에 해당하는 기록이 없습니다</p>
</div>
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspace/activity/agents?page=&limit=&search=&startDate=&endDate=` | Agent activities |
| GET | `/workspace/activity/delegations?page=&limit=&search=&startDate=&endDate=` | Delegations |
| GET | `/workspace/activity/quality?page=&limit=&conclusion=` | Quality reviews |
| GET | `/workspace/activity/tools?page=&limit=&toolName=` | Tool invocations |
| GET | `/workspace/activity/security-alerts` | Security alerts |

WebSocket channel: `activity-log` for real-time updates.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `>= md` | `px-6`, full table with all columns |
| `< md` | `px-4`, horizontal scroll on tables (`min-w-[640px]`) |

---

## Accessibility
- Tables: proper `<thead>/<tbody>` structure, `scope="col"` on `<th>`
- Expandable QA rows: `aria-expanded`, `aria-controls`
- Security alert banner: `role="alert"`
- WS status indicator: `aria-label="연결 상태: 실시간"`
- Tab navigation: `role="tablist"`, `role="tab"`, `aria-selected`
