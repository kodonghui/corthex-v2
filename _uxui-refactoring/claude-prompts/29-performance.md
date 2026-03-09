# 29. Performance (전력분석) — Claude Design Spec

## 복사할 프롬프트:

### What This Page Is For

The Performance page is the CEO's **analytics hub for AI agent performance** — tracking success rates, costs, response times, and quality scores across all agents. It includes Soul Gym (AI improvement suggestions) and a Quality Dashboard for reviewing work quality.

Think of it as: **An HR performance review system for AI agents** — the CEO sees who's performing well, who needs improvement, and gets AI-driven recommendations to optimize their team.

Two tabs:
1. **에이전트 성능**: Agent-level metrics + Soul Gym suggestions
2. **품질 대시보드**: Quality review analytics (pass/fail rates, trends, department comparisons)

---

### Design System Tokens

```
Page bg: bg-slate-900
Card bg: bg-slate-800/50 border border-slate-700 rounded-xl
Text primary: text-slate-50
Text secondary: text-slate-400
Border: border-slate-700
Action: blue-500/blue-600
Performance levels:
  high (>=80%): emerald-500
  mid (50-79%): amber-500
  low (<50%): red-500
```

---

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Header: "전력분석" + subtitle                         │
├──────────────────────────────────────────────────────┤
│ [에이전트 성능]  [품질 대시보드]    ← Tab bar          │
├──────────────────────────────────────────────────────┤
│                                                        │
│ === Tab 1: 에이전트 성능 ===                           │
│                                                        │
│ Summary Cards (4 cards)                                │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │ 🤖   │ │ 🎯   │ │ 💰   │ │ ⏱️   │                 │
│ │ 14명 │ │ 85%  │ │$12.4 │ │340ms │                 │
│ │ +2   │ │ +5%  │ │ -$3  │ │ -20  │                 │
│ └──────┘ └──────┘ └──────┘ └──────┘                 │
│                                                        │
│ Agent Performance Table                                │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [역할 ▼] [수준 ▼]                                 │ │
│ │ Name  │ Dept │ Role │ Calls│ Rate │ Cost │ Time  │ │
│ │ ──────┼──────┼──────┼──────┼──────┼──────┼────── │ │
│ │ A1    │ 개발 │ Mgr  │  45  │ 92%  │$0.02│ 280ms │ │
│ │ A2    │ 분석 │ Spec │  32  │ 78%  │$0.01│ 350ms │ │
│ └──────────────────────────────────────────────────┘ │
│ [pagination]                                           │
│                                                        │
│ Soul Gym Panel                                         │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 💪 Soul Gym 개선 제안  [2]                        │ │
│ │ ┌────────────────────────────────────────────┐   │ │
│ │ │ Agent: 분석관 · 현재 45% · 프롬프트 개선     │   │ │
│ │ │ +35% 예상 (90% 신뢰도)                      │   │ │
│ │ │ [적용] [무시]                                │   │ │
│ │ └────────────────────────────────────────────┘   │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ === Tab 2: 품질 대시보드 ===                           │
│                                                        │
│ Period: [7일] [30일] [전체]  DeptFilter: [▼]           │
│                                                        │
│ Quality Summary (3 cards)                              │
│ Trend Chart (stacked bar)                              │
│ Department Chart (horizontal bars)                     │
│ Agent Quality Table                                    │
│ Failed Reviews List                                    │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Container**: `min-h-screen bg-slate-900 text-slate-50`
**Inner**: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6`

---

### Component Specifications

#### 1. Page Header

```
Container: mb-2
Title: text-2xl font-bold text-slate-50, "전력분석"
Subtitle: text-sm text-slate-400 mt-1, "에이전트 성능 분석, Soul Gym 개선 제안, 품질 대시보드"
```

#### 2. Tab Bar

```
Container: flex bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-6
Tab: flex-1 text-center text-sm py-2.5 rounded-lg transition-colors font-medium cursor-pointer
  Active: bg-slate-700 text-slate-50 shadow-sm
  Inactive: text-slate-400 hover:text-slate-300
Tabs: "에이전트 성능", "품질 대시보드"
```

---

### Tab 1: 에이전트 성능

#### 3. Summary Cards (4 cards)

```
Container: grid grid-cols-2 sm:grid-cols-4 gap-3

SummaryCard:
  Container: bg-slate-800/50 border border-slate-700 rounded-xl p-4
  Icon: text-lg mb-1 (🤖, 🎯, 💰, ⏱️)
  Label: text-xs text-slate-400 font-medium
  Value: text-xl font-bold text-slate-50 mt-0.5
  Change (flex items-center gap-1 mt-1):
    Positive: text-[10px] text-emerald-400, "↑ +{change}"
    Negative: text-[10px] text-red-400, "↓ {change}"
    Neutral: text-[10px] text-slate-500, "— 0"

Cards:
  1. Label: "전체 에이전트", Value: "{totalAgents}명", Change: agent count diff
  2. Label: "평균 성공률", Value: "{avgSuccessRate}%", Change: success rate diff
  3. Label: "이번 달 비용", Value: "${totalCostThisMonth}", Change: cost diff
  4. Label: "평균 응답 시간", Value: "{avgResponseTimeMs}ms", Change: response time diff
```

#### 4. Agent Performance Table

**Filter Bar**:
```
Container: flex items-center gap-2 mb-3

RoleFilter:
  bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  Options: "전체 역할", "Manager", "Specialist", "Worker"

LevelFilter:
  bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  Options: "전체 수준", "우수 (≥80%)", "보통 (50-79%)", "개선 필요 (<50%)"

ActiveFilters (flex gap-1 ml-2):
  Chip: bg-blue-500/10 text-blue-400 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1
    RemoveBtn: "×"
```

**Table**:
```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden

Thead:
  Row: bg-slate-800/80 border-b border-slate-700
  Th: text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3 text-left cursor-pointer hover:text-slate-300 select-none
    Active sort: text-slate-300 + arrow icon (↑ or ↓)

Tbody:
  Row: border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors
  Td: px-4 py-3 text-xs

Columns:
  Name:
    text-xs font-medium text-slate-200
    Below: text-[10px] text-slate-500, department name

  Role:
    TierBadge (same as org page): text-[10px] font-medium px-1.5 py-0.5 rounded

  Calls:
    text-xs text-slate-300 font-mono text-right

  Success Rate:
    PerformanceBadge + percentage
    Badge: text-[10px] font-medium px-2 py-0.5 rounded-full
      >=80%: bg-emerald-500/15 text-emerald-400, "우수"
      50-79%: bg-amber-500/15 text-amber-400, "보통"
      <50%: bg-red-500/15 text-red-400, "개선 필요"
    Value: text-xs font-mono ml-1

  Avg Cost:
    text-xs text-slate-300 font-mono text-right, "$X.XXX"

  Avg Time:
    text-xs text-slate-300 font-mono text-right, "{ms}ms"

  Soul Gym:
    StatusDot:
      optimal: w-2 h-2 rounded-full bg-emerald-500
      has-suggestions: w-2 h-2 rounded-full bg-amber-500
      needs-attention: w-2 h-2 rounded-full bg-red-500 animate-pulse
```

**Pagination**:
```
Container: px-4 py-3 border-t border-slate-700 flex items-center justify-between
Left: text-[10px] text-slate-500, "총 {total}명"
Right (flex items-center gap-1):
  PageButton: w-8 h-8 text-xs rounded-lg transition-colors
    Active: bg-blue-600 text-white
    Inactive: text-slate-400 hover:bg-slate-700
  Show max 5 page buttons
```

#### 5. Agent Detail Modal (click row)

**Overlay**: `fixed inset-0 z-50 flex items-center justify-center`
**Backdrop**: `absolute inset-0 bg-black/60 backdrop-blur-sm`
**Modal**: `relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl`

**Header**:
```
px-5 py-4 border-b border-slate-700
AgentName: text-lg font-semibold text-slate-50
Meta: text-xs text-slate-400 mt-0.5, "{departmentName} · {role}"
CloseBtn: absolute top-4 right-4 text-slate-400 hover:text-slate-200, "✕"
```

**Key Metrics Grid**:
```
Container: grid grid-cols-4 gap-3 px-5 py-4
MetricCard: bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-center
  Label: text-[10px] text-slate-500 font-medium
  Value: text-sm font-bold text-slate-50 mt-1
Cards: "호출 수", "성공률", "평균 비용", "평균 시간"
```

**Performance Trend Chart** (30-day bar chart):
```
Container: px-5 py-4
Title: text-xs font-medium text-slate-300 mb-3, "30일 성능 추이"

Chart: flex items-end gap-0.5 h-32 bg-slate-900/30 border border-slate-700 rounded-lg p-3
  Bar (each day):
    w-full (flex-1) rounded-t
    Height: proportional to successRate (0-100%)
    Color: bg-blue-500/60 hover:bg-blue-500
    Tooltip on hover: "{date}: {successRate}%"

DateLabels (flex justify-between mt-1):
  text-[9px] text-slate-600, show start/middle/end dates
```

**Quality Distribution**:
```
Container: px-5 py-3
Title: text-xs font-medium text-slate-300 mb-2, "품질 점수 분포"
Bars (horizontal, space-y-1):
  Each score level:
    Label: text-[10px] text-slate-400 w-12, "5점" / "4점" / etc.
    Bar: flex-1 h-4 bg-slate-700 rounded-full overflow-hidden
      Fill: h-full bg-blue-500/60 rounded-full, width proportional to count
    Count: text-[10px] text-slate-500 w-8 text-right, "{count}건"
```

**Recent Tasks**:
```
Container: px-5 py-3
Title: text-xs font-medium text-slate-300 mb-2, "최근 작업 (10건)"
Table:
  Row: text-[10px] py-1.5 border-b border-slate-700/30 flex items-center justify-between
  Left: text-slate-300 truncate max-w-[250px], commandText
  Right (flex items-center gap-2):
    StatusBadge: success/failed
    Cost: text-slate-500 font-mono, "$X.XXX"
    Duration: text-slate-500 font-mono, "X.Xs"
```

**Soul Info**:
```
Container: px-5 py-3 border-t border-slate-700
Title: text-xs font-medium text-slate-300 mb-2, "에이전트 정보"
Info (grid grid-cols-3 gap-3):
  Item:
    Label: text-[10px] text-slate-500
    Value: text-xs text-slate-300
  Items: "모델" (modelName), "도구 수" (allowedToolsCount), "프롬프트 요약" (systemPromptSummary)
```

#### 6. Soul Gym Panel

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden

Header (px-4 py-3 flex items-center justify-between border-b border-slate-700):
  Left (flex items-center gap-2):
    Icon: "💪"
    Title: text-sm font-semibold text-slate-50, "Soul Gym 개선 제안"
  Badge: text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full, "{count}"

Body (p-4 space-y-3):

SuggestionCard (each):
  Container: bg-slate-900/50 border border-slate-700 rounded-lg p-4

  Header (flex items-center justify-between):
    Left:
      AgentName: text-sm font-medium text-slate-200
      CurrentRate: text-[10px] text-slate-500 ml-2, "현재 {successRate}%"
    TypeBadge: text-[10px] font-medium px-2 py-0.5 rounded-full
      prompt-improve: bg-purple-500/15 text-purple-400, "프롬프트 개선"
      add-tool: bg-blue-500/15 text-blue-400, "도구 추가"
      change-model: bg-amber-500/15 text-amber-400, "모델 변경"

  ImprovementBar (mt-2, flex items-center gap-2):
    Label: text-[10px] text-slate-500, "예상 개선"
    Bar: w-24 h-2 bg-slate-700 rounded-full overflow-hidden
      Fill: h-full bg-emerald-500 rounded-full, width = expectedImprovement%
    Value: text-[10px] text-emerald-400 font-mono, "+{expectedImprovement}%"
    Confidence: text-[10px] text-slate-500, "(신뢰도 {confidence}%)"

  Description:
    text-xs text-slate-400 mt-2 leading-relaxed

  Actions (flex justify-end gap-2 mt-3):
    DismissBtn: text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50, "무시"
    ApplyBtn: bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg, "적용"

Empty (no suggestions):
  text-xs text-slate-500 text-center py-6
  Icon: "✨"
  Text: "현재 개선이 필요한 에이전트가 없습니다"
```

**Apply Confirmation Dialog**:
```
Same dialog pattern:
Title: "Soul Gym 제안 적용"
Message: "{agentName}에게 '{suggestionType}' 제안을 적용하시겠습니까? 이 작업은 에이전트의 설정을 변경합니다."
Actions: "취소" + "적용" (emerald)
```

---

### Tab 2: 품질 대시보드

#### 7. Quality Controls

```
Container: flex items-center justify-between mb-4

PeriodButtons (flex bg-slate-800/50 rounded-lg p-0.5):
  Button: text-xs px-3 py-1.5 rounded-md transition-colors
    Active: bg-slate-700 text-slate-50
    Inactive: text-slate-400 hover:text-slate-300
  Options: "7일", "30일", "전체"

DepartmentFilter:
  bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  Options: "전체 부서" + department list
```

#### 8. Quality Summary Cards (3 cards)

```
Container: grid grid-cols-3 gap-3

Card: bg-slate-800/50 border border-slate-700 rounded-xl p-4
  Label: text-xs text-slate-400 font-medium
  Value: text-xl font-bold text-slate-50 mt-1

Cards:
  1. "전체 리뷰": totalReviews count
  2. "통과율": passRate% + progress bar
    ProgressBar: w-full h-2 bg-slate-700 rounded-full mt-2
      Fill: h-full rounded-full
        >=80%: bg-emerald-500
        >=50%: bg-amber-500
        <50%: bg-red-500
      Width: passRate%
  3. "평균 점수": avgScore/10 + progress bar (same style, width = avgScore*10%)
```

#### 9. Quality Trend Chart (Stacked Bar)

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4
Title: text-xs font-medium text-slate-300 mb-3, "품질 추이"

Legend (flex items-center gap-4 mb-2):
  Each: flex items-center gap-1.5 text-[10px]
    Dot: w-2.5 h-2.5 rounded-full
    Label: text-slate-400
  Items:
    bg-emerald-500, "통과"
    bg-red-500, "실패"

Chart: flex items-end gap-1 h-40
  StackedBar (each day):
    Container: flex-1 flex flex-col justify-end
    PassSegment: bg-emerald-500/70 rounded-t (height proportional)
    FailSegment: bg-red-500/70 (height proportional, below pass)
    Hover tooltip: "{date}: 통과 {pass}건, 실패 {fail}건"

DateLabels (flex justify-between mt-2):
  text-[9px] text-slate-600
```

#### 10. Department Chart (Horizontal Bars)

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4
Title: text-xs font-medium text-slate-300 mb-3, "부서별 품질"

Rows (space-y-2):
  Row (flex items-center gap-3):
    DeptName: text-xs text-slate-400 w-24 truncate text-right
    Bar: flex-1 h-5 bg-slate-700 rounded-full overflow-hidden
      Fill: h-full rounded-full
        >=80%: bg-emerald-500/70
        >=50%: bg-amber-500/70
        <50%: bg-red-500/70
      Width: passRate%
    Stats: text-[10px] text-slate-500 w-20 text-right
      Content: "{passRate}% ({reviewCount}건)"
```

#### 11. Agent Quality Table

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4
Title (px-4 py-3 border-b border-slate-700): text-xs font-medium text-slate-300, "에이전트별 품질"

Table:
  Thead:
    Th: text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5 cursor-pointer
  Tbody:
    Row: border-b border-slate-700/30 hover:bg-slate-800/50
    Td: px-4 py-2.5 text-xs

Columns:
  Agent Name: text-xs font-medium text-slate-200
  Total Reviews: text-xs text-slate-300 font-mono
  Pass Rate: PerformanceBadge + %
  Avg Score: text-xs font-mono, "{score}/10"
  Recent Fails: text-xs font-mono
    0: text-slate-500
    >0: text-red-400
```

#### 12. Failed Reviews List

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4
Title (px-4 py-3 border-b border-slate-700): text-xs font-medium text-slate-300, "최근 실패 리뷰"

Rows:
  Row: px-4 py-2.5 border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors
    (click navigates to /activity-log?commandId=...)

  Layout (flex items-center justify-between):
    Left:
      Command: text-xs text-slate-300 truncate max-w-[250px]
      Agent: text-[10px] text-slate-500 mt-0.5
    Right (flex items-center gap-3):
      Score: text-xs font-mono text-red-400, "{score}/10"
      Reason: text-[10px] text-slate-500 truncate max-w-[150px]
      Date: text-[10px] text-slate-500 font-mono

Empty: text-xs text-slate-500 text-center py-6, "실패한 리뷰가 없습니다 ✨"
```

---

### State Management

**React Query Keys**:
- `['performance-summary']` — Summary cards
- `['performance-agents', page, sortBy, sortOrder, roleFilter, levelFilter]` — Agent table
- `['performance-agent-detail', agentId]` — Agent detail modal
- `['soul-gym-suggestions']` — Soul Gym suggestions
- `['quality-dashboard', period, departmentId]` — Quality data (60s refetch)

**Local State**:
- `activeTab: 'agent' | 'quality'`
- `selectedAgentId: string | null` — For detail modal
- `page, sortConfig, roleFilter, levelFilter` — Table controls
- `period: '7d' | '30d' | 'all'` — Quality period
- `departmentFilter: string` — Quality department filter

---

### What NOT to Include

- No agent CRUD operations (that's Admin)
- No cost breakdown by model (that's Costs page)
- No command execution (that's Command Center)
- No real-time agent monitoring (that's Dashboard)
- No org chart (that's Org page)
