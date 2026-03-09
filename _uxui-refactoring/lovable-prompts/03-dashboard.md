# 03. Dashboard — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Dashboard is the CEO's at-a-glance overview of the entire AI organization — a single screen showing key performance indicators, costs, agent health, and quick actions. It's the landing page the CEO sees when they log in, designed to answer: "How is my AI company doing right now?"

This is an executive dashboard, not an analytics deep-dive. Every piece of data should be scannable in seconds. The CEO should be able to glance at it on their phone during a meeting and immediately know if anything needs attention.

---

### Data Displayed — In Detail

**1. Summary Cards (top section — highest visual priority)**
Four KPI cards showing today's snapshot. These are display-only — no click-through navigation. They are the first thing the CEO should see:

- **작업 현황 (Task Status)**:
  - Total commands today
  - Completed count
  - Failed count
  - In-progress count

- **비용 (Cost)**:
  - Today's total spend in USD
  - Breakdown by AI provider displayed with friendly names (e.g., "Anthropic", "OpenAI", "Google" — not raw API keys)
  - Budget usage percentage (how much of the monthly budget has been used)

- **에이전트 (Agents)**:
  - Total agent count
  - Active (currently working) count
  - Idle (online but not working) count
  - Error (in error state) count

- **연동 상태 (Integrations)**:
  - Each AI provider with its status (up / down)
  - Tool system status (ok / not ok)

**2. AI 사용량 차트 (Usage Chart)**
- A chart showing AI usage over time (default: last 7 days, switchable to 30 days)
- Data is grouped by date
- Each date shows usage broken down by AI provider
- The Y-axis represents cost in USD
- The chart should make it easy to spot trends (increasing costs, provider shifts)

**3. 예산 현황 (Budget Bar — high visual priority, alongside summary cards)**
- Visual progress bar showing current month's spend vs. monthly budget
- Data shown:
  - Current month spend (USD)
  - Monthly budget limit (USD)
  - Usage percentage
  - Projected month-end spend (estimated — linear extrapolation from current daily spending; less reliable early in the month)
  - Whether the budget is the default ($500) or custom-set. If still on default, suggest the CEO can set a custom budget (links to Admin settings)
- **Department breakdown**: Below the main bar, show cost per department
  - Each department: name and cost in USD

**4. 퀵 액션 (Quick Actions)**
- A set of shortcut buttons for common commands
- Each button shows: label and icon
- Clicking a quick action either:
  - Executes a saved preset command directly, OR
  - Navigates to Command Center with the preset pre-filled
- Quick actions are customizable (CEO can set up their own via settings)
- Default quick actions are provided for new accounts

**5. 만족도 (Satisfaction Chart — secondary visual priority)**
- A donut/pie chart showing command feedback distribution
- Three categories: positive (thumbs up), negative (thumbs down), neutral (CEO gave no feedback on the command — this is NOT a third feedback option, just the absence of feedback)
- Period selector: 7일 (7 days), 30일 (30 days), 전체 (all time)
- Satisfaction rate percentage displayed prominently
- Data comes from CEO's feedback on command results

---

### User Actions

**Primary:**
1. **Scan KPIs** — quickly read the 4 summary cards to understand today's status
2. **Execute a quick action** — click a shortcut button to run a common command
3. **Check budget** — see if spending is on track or over budget

**Secondary:**
4. **Switch usage chart period** — toggle between 7-day and 30-day views
5. **Switch satisfaction period** — toggle between 7d, 30d, and all-time views
6. **Navigate to Command Center** — via quick actions or by wanting to issue a new command

**Tertiary:**
7. **Review department costs** — expand the budget section to see per-department breakdown
8. **Check integration health** — glance at provider status in the integrations card

---

### UX Considerations

- **Glanceability**: This page must be readable in 3 seconds. The CEO should not need to click or expand anything to get the big picture. KPI cards use large numbers, clear labels, and status indicators.
- **Real-time updates**: Dashboard data refreshes via WebSocket. Agent statuses, cost numbers, and task counts update live without page reload. The CEO should see agent status changes (e.g., agent goes from idle to working) reflected immediately.
- **Budget alerts**: When budget usage is high (e.g., >80%), the budget bar should convey urgency. When projected spend exceeds the budget, this should be visually distinct.
- **Provider status at a glance**: Integration status (up/down) should be immediately scannable — the CEO cares about "is everything working?" not technical details.
- **Quick actions are personal**: Each CEO can customize their quick action buttons. Show a sensible default set for new users so the dashboard isn't empty.
- **Mobile-first for dashboard**: The CEO frequently checks the dashboard on mobile. Cards should stack vertically. Charts should be readable on small screens. Quick actions should be thumb-friendly.
- **Loading states**: Each section loads independently. Show skeleton/placeholder for each section while data loads. Don't block the entire page waiting for the slowest query.
- **Empty states**:
  - No commands today → task card shows zeros
  - No feedback yet → satisfaction chart shows empty state with message
  - No custom quick actions → show defaults
- **Data caching**: Dashboard data is cached (30 seconds for summary, 5 minutes for charts/budget). The page should feel fast on repeat visits. Data is still accurate enough for executive decision-making.
- **Role-based scoping**: Employees see a dashboard scoped to their assigned departments only. Their KPIs, costs, and agent counts are filtered to their departments.

---

### What NOT to Include on This Page

- No command input or chat (that's Command Center / Chat)
- No detailed cost analytics with drill-down (that's Admin cost management)
- No agent configuration or management (that's Admin)
- No trading or portfolio data (that's Strategy Room)
- No individual command history or results (that's Command Center)
- No notification center or activity feed (those are separate components)
