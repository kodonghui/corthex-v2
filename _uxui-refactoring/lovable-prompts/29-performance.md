# 29. Performance (전력분석) — CEO App

> **Route**: `/performance`
> **App**: CEO App (`app.corthex-hq.com`)

---

## 복사할 프롬프트:

Design the **Performance (전력분석)** page for the CEO App. This page is the CEO's analytics command center for monitoring how well every AI agent in the organization is performing, plus a quality dashboard for reviewing output quality.

---

### Page Purpose

The CEO needs a single place to:
1. See an at-a-glance summary of all agents' performance (total agents, average success rate, monthly cost, average response time) with month-over-month change indicators
2. Drill into individual agent performance with sorting, filtering, and detail modals
3. Receive and act on AI-generated improvement suggestions ("Soul Gym")
4. Review a quality dashboard showing pass/fail rates of the built-in quality gate system

This page has **two tabs**: "에이전트 성능" (Agent Performance) and "품질 대시보드" (Quality Dashboard).

---

### Tab 1: Agent Performance (에이전트 성능)

**Summary Cards (4 cards in a row)**
- 총 에이전트 (Total Agents): count with month-over-month change in absolute number
- 평균 성공률 (Avg Success Rate): percentage with change in percentage points
- 이번 달 비용 (Monthly Cost): dollar amount with change percentage
- 평균 응답시간 (Avg Response Time): displayed as seconds or milliseconds depending on magnitude, with change percentage

Each card shows:
- An icon representing the metric
- The metric label
- The current value (large, prominent)
- The change indicator (positive = green text, negative = red text, zero = neutral)

**Agent Performance Table**
A sortable, filterable data table showing every agent:
- Columns: 에이전트 (name), 부서 (department), 역할 (role — 팀장/전문가/실무자), 호출 수 (total calls), 성공률 (success rate with badge), 평균 비용 (avg cost in USD), 평균 시간 (avg response time), Soul Gym (status badge)
- Sortable columns: name, department, total calls, success rate, avg cost, avg response time. Clicking toggles asc/desc, shows arrow indicator
- Filters: department dropdown (optional), role dropdown (전체 역할 / 팀장 / 전문가 / 실무자), and performance level dropdown (전체 수준 / 우수 ≥80% / 보통 50-79% / 개선 필요 <50%)
- Active filters show as removable chips below the filter row
- Performance badges: 우수 (green), 보통 (amber), 개선 필요 (red) — based on success rate thresholds
- Soul Gym status badges: 최적 (green), 제안 있음 (amber), 주의 필요 (red)
- Pagination: previous/next buttons, page number buttons, total count display
- Clicking a row opens the Agent Detail Modal

**Agent Detail Modal**
When the user clicks a table row, a modal opens showing deep performance data for that agent:
- Agent header: name, department, role, performance badge
- 4 metric cards: 호출 수, 성공률, 평균 비용, 평균 시간
- Performance trend chart (last 30 days): vertical bar chart where each bar represents one day's success rate. Bar color reflects performance level (green ≥80%, amber ≥50%, red <50%). Hovering a bar shows tooltip with date and exact percentage
- Quality score distribution: shows count per quality label (e.g., Excellent, Good, Fair, Poor)
- Recent tasks list (10 items): each shows command text (truncated), status (성공/실패), and duration
- Soul info section: model name, allowed tools count, system prompt summary (truncated preview)

**Soul Gym Panel**
Below the table, a dedicated section for AI-generated improvement suggestions:
- Header with count badge showing number of pending suggestions
- Each suggestion card shows:
  - Agent name
  - Current success rate
  - Suggestion type: 시스템 프롬프트 개선 / 도구 추가 / 모델 변경
  - Expected improvement percentage and confidence level
  - Description text explaining the suggestion
  - Estimated tokens (if applicable)
  - Two action buttons: "적용" (Apply — shows confirmation dialog first) and "무시" (Dismiss)
- Empty state: "모든 에이전트가 최적 상태입니다" with subtext
- Confirmation dialog before applying: shows agent name, suggestion type, expected improvement, and confidence

---

### Tab 2: Quality Dashboard (품질 대시보드)

A dashboard for the built-in quality gate that auto-reviews agent output.

**Filters**
- Period selector: 7일 / 30일 / 전체 (segmented button group)
- Department dropdown filter

**Quality Summary Cards (3 cards)**
- 총 리뷰 수 (Total Reviews): count with pass/fail breakdown subtext
- 통과율 (Pass Rate): percentage with progress bar (green ≥80%, amber ≥60%, red <60%)
- 평균 점수 (Avg Score): X.X / 5.0 with progress bar

**Quality Trend Chart**
- Stacked vertical bar chart showing daily pass/fail counts over the selected period
- Green bars = pass, red bars = fail. Stacked so total bar height = total reviews that day
- Hovering shows tooltip with date, pass count, and fail count
- Legend below chart: 통과 (green) / 실패 (red)

**Department Pass Rate Chart**
- Horizontal bar chart showing each department's pass rate
- Each row: department name on the left, pass rate percentage + review count on the right, progress bar in between
- Bar color reflects rate (green/amber/red thresholds)

**Agent Quality Table**
- Sortable table showing per-agent quality stats
- Columns: 에이전트 (sortable), 부서, 리뷰 (count, sortable), 통과율 (badge, sortable), 평균 점수 (sortable), 최근 실패 (count badge, sortable)
- Sort indicator arrows on each sortable column
- On smaller screens, some columns (부서, 사유, 일시) are hidden to fit the viewport — the most essential columns (에이전트, 통과율, 평균 점수) always remain visible

**Failed Task List**
- Table of individual failed quality reviews
- Columns: 명령 (command text, truncated), 에이전트, 점수 (colored by score), 사유 (feedback, truncated), 시도 (attempt number), 일시 (date/time)
- Clicking a row navigates to the activity log filtered by that command

---

### Data & API Behavior

- Summary data auto-refreshes every 30 seconds
- Quality dashboard auto-refreshes every 60 seconds
- All data comes from server API (not mocked)
- Page title updates to "전력분석 - CORTHEX" while on this page

---

### UX Considerations

- This is a data-heavy analytics page — prioritize scannability and clear visual hierarchy
- The CEO is not a data scientist: use intuitive color coding (green = good, amber = caution, red = bad) consistently
- Performance and quality badges should be immediately readable at a glance
- Charts should be simple (bar charts, progress bars) — no complex visualizations needed
- The Soul Gym section is actionable: make the apply/dismiss actions clear but require confirmation for apply
- Mobile: summary cards should stack, tables should scroll horizontally, modal should be full-screen on small screens
- Loading states: skeleton placeholders for summary cards and tables
- Empty states: helpful messages directing users to the command center to generate data
- Sort state should be visually obvious (which column, which direction)
- Filter chips should be easy to remove individually or all at once
