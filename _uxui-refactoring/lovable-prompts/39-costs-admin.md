# 39. Costs Admin (비용 관리 — Admin) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Cost Management** page in the Admin app. It gives company administrators a comprehensive cost analytics dashboard with 3-axis analysis (by agent, by model, by department), daily cost trends, and budget configuration. Unlike the CEO app's cost page which is view-only, this admin page includes budget settings that control spending limits and automatic blocking.

This page requires a company to be selected in the sidebar. If no company is selected, a message prompts the admin to select one.

### Data Displayed — In Detail

**Page header:**
- Title: "비용 관리"
- Date range filter: Two date pickers (start date ~ end date), defaulting to the last 30 days

**Summary cards (4 cards in a row):**
- **총 비용** (Total Cost): Total spending in USD for the selected period, with total API call count as subtitle
- **Anthropic**: Cost in USD from Anthropic (Claude) calls
- **OpenAI**: Cost in USD from OpenAI (GPT) calls
- Note: Only Anthropic and OpenAI get dedicated summary cards. Other providers (e.g. Google) are included in the total but not shown individually.
- **전월 대비** (vs. Previous Period): Percentage change compared to the equivalent prior period. Positive = increase (shown with alert severity), negative = decrease (shown with positive/success severity), zero = no change

**3-Axis Cost Analysis section (tabbed interface):**
Three tabs allow switching between analysis views:

1. **에이전트별** (By Agent) tab:
   - Sortable table with columns: 에이전트 (Agent Name), 비용 USD, 입력 토큰 (Input Tokens), 출력 토큰 (Output Tokens), 호출 수 (Call Count)
   - Default sort: cost descending
   - Each column header is clickable to toggle sort direction
   - Empty state: "데이터가 없습니다"

2. **모델별** (By Model) tab:
   - Sortable table with columns: 모델 (Model Display Name), 프로바이더 (Provider), 비용 USD, 입력 토큰, 출력 토큰, 호출 수
   - Default sort: cost descending

3. **부서별** (By Department) tab:
   - Sortable table with columns: 부서 (Department Name), 비용 USD, 에이전트 수 (Agent Count), 호출 수
   - Default sort: cost descending

**Budget Settings panel (alongside 3-axis analysis):**
- Title: "예산 설정"
- **Budget usage progress bar**: Shows current month spending vs. monthly budget limit (e.g. "$12.50 / $100.00") with a visual progress indicator. Only shown if a monthly budget is set (> 0).
- Editable fields:
  - 월간 예산 (Monthly Budget): Number input in microdollars, 0 = unlimited
  - 일일 예산 (Daily Budget): Number input in microdollars, 0 = unlimited
  - 경고 임계값 (Warning Threshold): Percentage (0-100%)
  - 초과 시 자동 차단 (Auto-block on Exceed): Toggle switch
- Save button: "설정 저장" (shows "저장 중..." while saving)
- Validation: threshold must be 0-100, all values must be valid numbers

**Daily Cost Chart:**
- Title: "일일 비용 추이"
- Period toggle buttons: 7일 / 30일
- Bar chart showing daily cost for each day in the selected period
- Each bar shows the date (MM/DD format) below
- Hover tooltip shows exact USD amount for that day
- Empty state: "데이터가 없습니다" centered message

### User Actions

1. **Adjust date range** — change start/end dates to filter all cost data and the 3-axis analysis
2. **View summary metrics** — see total costs and provider breakdown at a glance
3. **Switch analysis axis** — tab between agent, model, and department cost views
4. **Sort cost tables** — click column headers to sort ascending/descending by any column
5. **Configure budget** — set monthly/daily budgets, warning thresholds, and auto-block behavior
6. **Monitor budget usage** — see current spending against budget limit with progress visualization
7. **View daily trend** — switch between 7-day and 30-day views of the cost bar chart
8. **Hover on chart bars** — see exact daily cost amounts in tooltips

### UX Considerations

- **Budget is the admin's primary concern**: The budget panel sits alongside the analysis tables so admins can see spending patterns and adjust limits in the same view.
- **Microdollar inputs**: Budget input fields accept microdollars (the raw stored unit), with labels indicating "microdollars, 0 = 무제한". The progress bar and summary cards display human-readable USD. This is an admin-level tool where technical units are acceptable.
- **3-axis analysis answers different questions**: By-agent identifies expensive agents; by-model helps with model selection decisions; by-department shows organizational cost distribution.
- **Sort is essential**: Tables default to cost-descending so the biggest cost drivers are always visible first without manual sorting.
- **Date range affects summary and 3-axis data**: Changing the header date range updates summary cards and all 3-axis tabs. Budget settings and the daily chart operate independently — the daily chart has its own 7/30 day period toggle separate from the header date range.
- **Auto-block is a powerful setting**: Enabling auto-block means agents will be prevented from making API calls when budget is exceeded. This should be clearly communicated — it's not just a warning.
- **Empty state for new companies**: If no API calls have been made, all sections show empty states gracefully.
- **Loading states**: Summary cards, each analysis tab, budget panel, and daily chart each have independent loading skeletons.
- **Korean language**: All labels, headers, empty states, and button text in Korean.
- **Mobile**: Summary cards stack; the 3-axis section and budget panel stack vertically; tables scroll horizontally if needed.
- **Dark mode**: All text, borders, chart bars, and progress bars must be readable in both light and dark themes.

### What NOT to Include on This Page

- No real-time cost streaming via WebSocket
- No cost alerts or notification configuration
- No export/download of cost data
- No billing or payment management
- No per-agent detail drill-down pages
- No historical budget comparison (month-over-month budget tracking)
- No token pricing configuration
