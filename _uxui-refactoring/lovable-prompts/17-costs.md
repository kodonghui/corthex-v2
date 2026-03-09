# 17. Costs (비용 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Costs** page in the CEO app. It gives the CEO a comprehensive view of how much the AI organization costs to run. It shows total spending, breakdowns by AI model, by agent, and by usage source (chat, delegation, scheduled jobs, SNS). It also includes daily cost trends and budget tracking. Employees see costs scoped to their assigned departments only.

### Data Displayed — In Detail

**Cost summary header:**
- **Total cost** (총 비용): Total spending in USD for the selected period (default: last 30 days)
- Period selector: Adjustable time range (7 days, 14 days, 30 days)

**Budget overview section:**
- **Current month spending** (이번 달 지출): How much has been spent this month in USD
- **Monthly budget** (월 예산): The set budget limit for the month
- **Usage percentage** (사용률): Current spending as a percentage of the budget, visually represented
- **Projected month-end spending** (예상 월말 지출): Estimated total by end of month based on current rate
- **Default budget indicator**: Whether the budget is the system default or custom-set
- **By department breakdown** (부서별): List of departments with their cost contribution
  - Department name
  - Cost in USD

**Cost by model breakdown:**
- A breakdown of costs per AI model used
- Each entry shows:
  - **Model name** (모델): e.g. Claude Sonnet 4.6, GPT-4.1, Gemini 2.5 Pro
  - **Cost** (비용): USD amount
  - **Input tokens** (입력 토큰): Total input tokens consumed
  - **Output tokens** (출력 토큰): Total output tokens generated
  - **Call count** (호출 수): Number of API calls

**Cost by agent breakdown:**
- A breakdown of costs per AI agent
- Each entry shows:
  - **Agent name** (에이전트명): The agent's display name
  - **Cost** (비용): USD amount
  - **Call count** (호출 수): Number of API calls made by this agent

**Cost by source breakdown:**
- A breakdown of costs by what generated them
- Sources: chat (채팅), delegation (위임), job (예약 작업), sns (SNS 발행), other (기타)
- Each shows: source label, cost in USD, call count

**Daily cost trend:**
- A time-series view of daily costs over the selected period
- Each data point shows:
  - **Date** (날짜)
  - **Cost** (비용): USD amount for that day
  - **Input/output tokens**: Token usage for that day
  - **Call count** (호출 수): API calls for that day

**Cost by agent (detailed, with date range):**
- A more detailed agent-level breakdown with configurable date range
- Each agent entry shows:
  - Agent name
  - Total cost (in micro USD, displayed as USD)
  - Input tokens, output tokens
  - Call count

### User Actions

1. **View cost summary** — see total spending at a glance
2. **Change time period** — select 7 / 14 / 30 day ranges to adjust all cost data
3. **View budget status** — check how spending compares to the monthly budget
4. **Analyze costs by model** — see which AI models cost the most
5. **Analyze costs by agent** — identify which agents are the most expensive
6. **Analyze costs by source** — understand where costs originate (chat, delegation, jobs, SNS)
7. **View daily trend** — track spending patterns over time
8. **Adjust date range** for detailed agent costs — set custom start/end dates

### UX Considerations

- **CEO needs quick answers**: The most important questions are "How much am I spending?" and "Am I within budget?" These should be immediately visible without scrolling.
- **Budget warning states**: When budget usage exceeds certain thresholds (e.g. 80%, 100%), the display should communicate urgency clearly.
- **Projected spending is critical**: If the projection exceeds the budget, this should be prominently flagged. CEOs need to know before they overspend, not after.
- **Model cost comparison**: The CEO needs to quickly see if switching models could save money. The by-model breakdown should make relative costs easy to compare.
- **Agent cost accountability**: High-cost agents should stand out. Consider sorting by cost descending by default so the biggest spenders are visible first.
- **Department scoping for employees**: When an employee (non-CEO) views this page, they only see costs for their assigned departments. The UI should not show empty sections — hide data that's not available for their scope.
- **Currency display**: All costs are stored in micro-USD internally but should be displayed as human-readable USD (e.g. "$12.50", not "12500000").
- **Token counts for context**: Showing token usage alongside costs helps technically-minded users understand the relationship between usage volume and cost.
- **Empty state**: If no costs have been incurred yet (new company), show an informative empty state explaining that costs will appear once agents start working.
- **Daily trend readability**: The time series should be easy to read with clear date labels. Weekends or inactive days should still show as zero, not be skipped.
- **Mobile layout**: Summary and breakdowns should remain readable on narrow screens.
- **Korean language**: All labels, section titles, and explanatory text must be in Korean.
- **Loading states**: Each section (summary, budget, by-model, by-agent, by-source, daily trend) loads independently and needs its own loading indicator.
- **Period consistency**: When the user changes the time period, all sections should update together to reflect the same date range.

### What NOT to Include on This Page

- No cost editing or budget setting — that's in Admin settings
- No agent creation or configuration — that's the Admin Agents page
- No billing or payment information — this is usage analytics, not billing
- No real-time cost streaming — data is fetched on page load and period change
- No cost alerts or notification configuration
- No export/download of cost data
