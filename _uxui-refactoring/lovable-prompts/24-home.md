# 24. Home — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Home page is the CEO's landing page — the first screen they see after logging in. It provides a personalized daily briefing: a greeting, a quick glance at overnight job results, the status of their AI team, recent notifications, and quick navigation shortcuts.

This is NOT a dashboard with charts or analytics. It is a warm, personal "morning briefing" page that answers the CEO's most immediate questions: "What happened while I was away?" and "What can I do right now?"

---

### Data Displayed — In Detail

**1. Greeting Header**
- Personalized greeting using the logged-in user's name (e.g., "안녕하세요, 김대표님")
- Today's date in Korean format (e.g., "2026년 3월 9일 일요일")

**2. Overnight Job Notifications Card (conditional — only shown when there are unread overnight results)**
- A highlighted card summarizing background jobs that completed while the CEO was away
- Shows: total count of completed jobs, count of successes, count of failures
- Lists up to 5 recent job results, each showing:
  - Status indicator (success or failure)
  - Agent name who executed the job
  - The instruction that was given (truncated)
- If more than 5 jobs exist, shows "+N건 더..." link
- Two actions: "모두 읽음" (mark all as read) and "자세히 →" (navigate to the full Jobs page)

**3. My Team Section**
- Grid of AI agent cards showing the CEO's assigned agents (up to 8 visible)
- Agents are sorted: secretary first, then by status (online > working > error > offline), then alphabetically
- Each agent card shows:
  - Status indicator (online/working/error/offline with appropriate visual treatment)
  - Agent name
  - Secretary badge (star icon) if the agent is the secretary
  - Agent role description
  - "채팅 →" link for online agents (clicking navigates to the Chat page's agent list)
  - Offline agents are visually dimmed and not clickable
- If more than 8 agents exist, shows "+N명 더 보기" overflow indicator
- Loading state: skeleton cards while data loads
- Empty state: message saying no agents are assigned yet with guidance to contact admin

**4. Recent Notifications Section (conditional — only shown when notifications exist)**
- Shows up to 5 most recent system notifications
- Each notification shows:
  - Unread indicator dot for unread notifications
  - Icon based on notification type (chat completion, delegation, tool error, job completion/failure, system)
  - Notification title text (bold if unread, muted if read)
  - Timestamp in HH:MM format
- "모두 보기 →" link to navigate to the full Notifications page
- Auto-refreshes every 5 minutes

**5. Quick Start Section**
- Three shortcut cards for the most common actions:
  - "채팅" — navigate to Chat page (talk to an agent)
  - "야간 작업" — navigate to Jobs page (set up overnight tasks)
  - "보고서" — navigate to Reports page (view work reports)
- Each card shows: icon, label, and brief description

---

### User Actions

**Primary:**
1. **Scan overnight results** — see at a glance what jobs completed and whether they succeeded
2. **Mark overnight results as read** — dismiss the overnight notification card
3. **Navigate to an agent's chat** — click an agent card to start chatting
4. **Check recent notifications** — scan for important system events

**Secondary:**
5. **Navigate to Jobs page** — click "자세히" on the overnight card for full details
6. **Navigate to Notifications** — click "모두 보기" for complete notification list
7. **Use quick start shortcuts** — jump to Chat, Jobs, or Reports with one click

---

### UX Considerations

- **Morning briefing feel**: This page should feel like a personal daily summary, not a data-heavy dashboard. The tone is warm and informative.
- **Conditional sections**: The overnight job card only appears when there are results to report. If the CEO opens the app and nothing happened overnight, the card is simply absent — no "0 jobs completed" message.
- **Agent status at a glance**: The team grid lets the CEO quickly see who's online and available. The sort order (secretary first, online agents prioritized) ensures the most actionable agents are visible first.
- **Mobile responsiveness**: The agent grid should adapt from 4 columns on desktop to 2 columns on mobile. Quick start cards should remain in a single row of 3 on all sizes (compact on mobile).
- **Loading states**: Skeleton cards for the team section while agents load. Other sections can appear progressively.
- **Empty states**: If no agents are assigned, the empty state should reassure the CEO and tell them what to do next (contact admin).
- **Auto-refresh**: Notifications refresh every 5 minutes to stay current without overwhelming the connection.
- **Navigation hub**: Every section of this page exists to funnel the CEO to a deeper feature page. The home page itself has no heavy interactions — it's a launchpad.
- **Role-based access**: Employees (non-CEO users) also see this page, but their team section only shows agents assigned to their departments. The greeting and quick start remain the same.

---

### What NOT to Include on This Page

- No analytics charts or usage graphs (that's Dashboard)
- No command input or orchestration (that's Command Center)
- No agent configuration or editing (that's Admin)
- No detailed job management or scheduling (that's Jobs/Cron)
- No cost tracking or budget info (that's Costs)
- No org chart (that's Org page)
