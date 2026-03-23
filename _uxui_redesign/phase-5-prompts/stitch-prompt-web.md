# CORTHEX v3 — Web Stitch Prompts (Desktop)

**Phase:** 5-Prompts, Step 5-2
**Date:** 2026-03-23
**Target:** All 24 web routes from `project-context.yaml`
**Output Format:** React JSX + Tailwind CSS v4
**Design System:** DESIGN.md (Sovereign Sage tokens)
**App Shell:** Pre-built — generate CONTENT AREA ONLY

---

## Global Instructions (Apply to ALL Batches)

### Design System Reference
- Load `DESIGN.md` as the design system for this project
- All colors use `corthex-*` token classes — NO hardcoded hex, NO Tailwind default palette
- Icons: Lucide React only (`lucide-react`), 2px stroke, `currentColor`
- Typography: Inter (UI), JetBrains Mono (`font-mono`) for costs/IDs/code
- Border radius: `rounded-sm`=4px, `rounded-lg`=8px, `rounded-xl`=12px, `rounded-2xl`=16px
- Touch targets: minimum 44px height on interactive elements

### Output Rules
1. Generate **content area only** — NO sidebar, NO topbar, NO app shell
2. Wrap all content in: `<div className="p-8 max-w-[1440px] mx-auto">`
3. Use `bg-corthex-bg` as implicit page background (do not set it on content wrapper)
4. Cards: `bg-corthex-surface border border-corthex-border rounded-xl p-4`
5. Buttons: `bg-corthex-accent text-corthex-text-on-accent rounded-lg h-11 px-4`
6. Inputs: `border-corthex-border-input` (NOT `border-corthex-border`)
7. Focus rings: `focus:ring-2 focus:ring-corthex-focus focus:ring-offset-2`
8. All icon buttons must have `aria-label`
9. All decorative icons must have `aria-hidden="true"`
10. Status indicators: color + icon + text label (never color alone)
11. **prefers-reduced-motion:** All animations (pulse dots, streaming text, transitions) MUST be wrapped in `prefers-reduced-motion` check. Reduced-motion fallback = instant state change (no animation). Add this CSS globally:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```
12. **ARIA directives** (mandatory on every page):
    - `<main role="main">` wrapping content area
    - `<nav aria-label="...">` on all navigation sections
    - `aria-current="page"` on active nav items
    - `aria-live="polite"` on notification counters and streaming text containers
    - `aria-live="assertive"` on error alert containers
    - `aria-busy="true/false"` on loading containers
    - `aria-describedby` linking form inputs to their error messages
    - `aria-label` on icon-only buttons (mandatory — no exceptions)
    - `aria-hidden="true"` on decorative icons
    - Skip-to-content link as first focusable element: `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`
13. **Success ≈ Accent disambiguation:** Success (#4d7c0f) and accent (#606C38) are both olive-green. When both could appear together (e.g., table rows with status dots + selected row highlight), success MUST use `CheckCircle` icon + text label, while active/selected uses `bg-corthex-accent-muted` background tint without a dot.

### Archetype Context
- **Primary:** The Ruler — control, command, accountability, hierarchy
- **Secondary:** The Sage — wisdom, analysis, knowledge, data precision
- The CEO sees everything, delegates anything, tracks every cost
- Interface should feel like looking through glass into a functioning organization

---

## Batch 1: Command Center (5 pages)

### Page 1: Hub (`/hub`)
**Layout type:** Dashboard (auto-fit grid)
**Archetype emphasis:** Ruler (command center) + Sage (data overview)

**Content description:**
The CEO's primary command center. This is the first page after login — the CEO's desk.

**Sections to generate:**
1. **Welcome header** — Greeting with CEO name, current date/time, quick stats summary
   - `text-3xl font-bold text-corthex-text-primary` for greeting
   - `text-corthex-text-secondary text-sm` for date
2. **Quick action bar** — 4-5 primary action buttons (New Agent, New Task, View Reports, Open Chat)
   - Horizontal row of ghost/outline buttons with icons
3. **Active agents feed** — Real-time streaming card showing currently working agents
   - Agent avatar, name, current task, status pulse dot
   - `font-mono` for agent IDs
   - Status: pulse dot (`animate-pulse`) for working agents
4. **Today's metrics row** — 4 metric cards (Active Agents, Tasks Today, Daily Cost, Success Rate)
   - Primary metric card (Daily Cost) should be `col-span-2` for emphasis
   - Cost values in `font-mono`
   - Trend indicator (up/down arrow + percentage)
5. **Recent activity feed** — Last 10 events with timestamps
   - Timeline-style list with semantic color dots
   - `text-xs text-corthex-text-tertiary` for timestamps
6. **Pending approvals** — Cards requiring CEO action (handoffs, budget alerts)
   - `border-l-4 border-corthex-warning` for attention items

**Responsive:** 3-col grid on xl, 2-col on lg, 1-col stacked on mobile.

---

### Page 2: Dashboard (`/dashboard`)
**Layout type:** Dashboard (auto-fit grid)
**Archetype emphasis:** Sage (analytics, data visualization)

**Content description:**
Analytics overview with charts and metrics. The Sage's observatory — data-rich, clean, structured.

**Sections to generate:**
1. **Date range selector** — Dropdown or segmented control (Today, 7d, 30d, Custom)
   - Positioned top-right of page
2. **KPI cards row** — 6 metric cards in auto-fit grid
   - Total Agents, Active Tasks, Completion Rate, Total Cost, Avg Response Time, Knowledge Items
   - Each card: value in `text-3xl font-bold font-mono`, label in `text-xs text-corthex-text-secondary uppercase tracking-wide`
   - Trend badge (green up / red down) using semantic colors + icons
3. **Cost chart** — Area/line chart showing daily cost over selected period
   - Chart uses `corthex-chart-*` palette (NO provider brand colors)
   - Y-axis: dollar values in `font-mono`
   - Card wrapper with title "비용 추이" (Cost Trend)
4. **Agent activity chart** — Bar chart of tasks per agent/department
   - Horizontal bars, sorted by count
5. **Task status breakdown** — Donut/pie chart of task statuses
   - Completed (success), In Progress (accent), Failed (error), Pending (tertiary)
6. **Recent completions table** — Last 20 completed tasks
   - Columns: Agent, Task, Duration, Cost, Status
   - Cost in `font-mono`, status as badge with icon

**Responsive:** Charts stack vertically on mobile. KPI cards: 3-col → 2-col → 1-col.

---

### Page 3: Chat (`/chat`)
**Layout type:** Panels (sidebar + main chat)
**Archetype emphasis:** Ruler (commanding agents through conversation)

**Content description:**
Direct chat interface with AI agents. The CEO speaks, agents respond. Like a private office intercom.

**Sections to generate:**
1. **Agent selector panel** (left, 280px on desktop)
   - List of available agents with avatar, name, status dot
   - Search input at top
   - Active chat highlighted with `bg-corthex-accent-muted`
2. **Chat area** (flex-1)
   - Message bubbles: CEO messages right-aligned (`bg-corthex-accent text-corthex-text-on-accent rounded-2xl`), agent messages left-aligned (`bg-corthex-surface rounded-2xl`)
   - Agent avatar beside agent messages
   - **Timestamps OUTSIDE bubbles** — positioned below each message bubble, not inside. `text-xs text-corthex-text-tertiary mt-1` beneath the bubble element. CEO timestamps right-aligned, agent timestamps left-aligned (matching bubble alignment). Group consecutive same-sender messages — show timestamp only on last message in cluster.
   - Streaming indicator: three pulsing dots for agent typing (respects `prefers-reduced-motion` — static dots when reduced)
3. **Input area** (bottom fixed)
   - Textarea with `border-corthex-border-input`
   - Send button (`bg-corthex-accent` with `Send` icon)
   - Attachment button (ghost, `Paperclip` icon)
4. **Agent info header** (top of chat area)
   - Agent name, department, tier, status dot
   - "View Profile" link button

**Responsive:** Agent selector becomes overlay drawer on mobile. Full-width chat.

---

### Page 4: NEXUS (`/nexus`)
**Layout type:** Canvas (full-bleed, no max-width)
**Archetype emphasis:** Ruler (organizational hierarchy visualization)

**Content description:**
Interactive organizational chart using React Flow. The Ruler's map of their domain — who reports to whom, which departments contain which agents.

**Sections to generate:**
1. **Canvas** — Full viewport height minus topbar (`h-[calc(100vh-56px)]`)
   - No padding, no max-width — full bleed
   - Background: `bg-corthex-elevated` with subtle dot grid pattern
2. **Toolbar** (floating, top-left of canvas)
   - Zoom in/out, fit-to-view, export buttons
   - `bg-corthex-surface border border-corthex-border rounded-xl shadow-md p-2`
   - Buttons: `size="sm"` ghost variant
3. **Node cards** (React Flow nodes)
   - Department nodes: `bg-corthex-chrome text-corthex-text-chrome rounded-xl p-3`
   - Agent nodes: `bg-corthex-surface border border-corthex-border rounded-xl p-3`
   - Agent: avatar, name, tier badge (`rounded-full`), status dot
   - Department: icon, name, agent count
4. **Edge connections** — Lines connecting nodes
   - Color: `corthex-border-strong`
   - Animated dashes for active handoff connections
5. **Minimap** (bottom-right)
   - Small overview of entire graph
6. **Detail panel** (right side, slides in on node click)
   - Agent/department details, recent activity, quick actions
   - `bg-corthex-surface border-l border-corthex-border w-[360px]`

**Responsive:** On mobile, show zoomed-out overview with pinch-to-zoom. No detail panel — tap opens modal instead.

---

### Page 5: Notifications (`/notifications`)
**Layout type:** Master-Detail (list + detail)
**Archetype emphasis:** Sage (information management)

**Content description:**
Notification center. All system alerts, handoff requests, budget warnings, task completions.

**Sections to generate:**
1. **Filter bar** (top)
   - Filter chips: All, Unread, Handoffs, Budget, Tasks, System
   - `bg-corthex-accent text-corthex-text-on-accent` for active filter
   - Ghost style for inactive filters
2. **Notification list** (left, 380px)
   - Each notification: icon (semantic color), title, preview text, timestamp
   - Unread: `border-l-4 border-corthex-accent` + bold title
   - Read: normal weight, `text-corthex-text-secondary`
   - Grouped by date: "오늘", "어제", "이번 주"
3. **Notification detail** (right, flex-1)
   - Full notification content
   - Action buttons if applicable (Approve Handoff, Review Budget, etc.)
   - Related context (agent info, cost details)
4. **Mark all read** button (top-right, ghost variant)
5. **Empty state** — When no notifications
   - `Bell` icon at 48px, muted text "새로운 알림이 없습니다"

**Responsive:** List-only on mobile. Tapping opens detail in full-screen view.

---

## Batch 2: Organization (5 pages)

### Page 6: Agents (`/agents`)
**Layout type:** Master-Detail (list + detail panel)
**Archetype emphasis:** Ruler (managing subordinates)

**Content description:**
Agent management. The Ruler's personnel department — view, create, edit, and monitor all AI agents.

**Sections to generate:**
1. **Header bar** — Title "에이전트", agent count badge, "새 에이전트" primary button
2. **View toggle** — Grid/List view switcher (icon buttons)
3. **Filter/search bar** — Search input + department filter dropdown + status filter dropdown
4. **Agent grid/list** (left panel or full-width in grid mode)
   - **Grid view:** Cards with avatar, name, department, tier badge (`rounded-full`), status dot, model name
     - Card: `bg-corthex-surface border border-corthex-border rounded-xl p-4 hover:border-corthex-border-strong transition-colors`
     - Status dot with label (Online/Working/Offline/Error)
     - Model name in `font-mono text-xs`
   - **List view:** Table with columns: Name, Department, Tier, Model, Status, Actions
5. **Detail panel** (right, slides in on agent selection, 400px)
   - Agent avatar (large), name, description
   - Stats: tasks completed, success rate, total cost
   - Cost values in `font-mono`
   - System prompt preview (truncated)
   - Quick actions: Edit, Duplicate, Delete (destructive variant)
   - Recent task history list
6. **Create agent dialog** — Modal with form
   - Fields: Name, Description, Department (select), Tier (select), Model (select), System Prompt (textarea)
   - All inputs use `border-corthex-border-input`

**Responsive:** Grid becomes single column. Detail panel becomes bottom sheet.

---

### Page 7: Departments (`/departments`)
**Layout type:** Master-Detail
**Archetype emphasis:** Ruler (organizational structure)

**Content description:**
Department management. Organizing the kingdom — creating divisions, assigning agents to teams.

**Sections to generate:**
1. **Header** — "부서 관리", department count, "새 부서" button
2. **Department list** (left, 320px)
   - Each department: icon, name, agent count badge, description preview
   - Active: `bg-corthex-accent-muted border-l-4 border-corthex-accent`
   - Search input at top
3. **Department detail** (right, flex-1)
   - **Overview section:** Name, description, created date, total cost
   - **Agent roster:** Grid of agent cards assigned to this department
     - Mini agent card: avatar, name, status dot, tier
   - **Performance metrics:** Tasks completed, avg response time, total cost
     - Values in `font-mono`
   - **Knowledge section:** Linked knowledge items count
   - **Actions:** Edit Department, Assign Agents, Delete
4. **Empty state** — When no departments exist
   - `Building2` icon at 48px, "첫 번째 부서를 만들어보세요"

**Responsive:** List becomes horizontal scroll on tablet, full-screen list on mobile with tap-to-detail.

---

### Page 8: Tiers (`/tiers`)
**Layout type:** CRUD (single centered column)
**Archetype emphasis:** Ruler (hierarchy, rank system)

**Content description:**
Tier management. The hierarchy system — defining rank levels, model assignments, permissions.

**Sections to generate:**
1. **Header** — "티어 관리", tier count, "새 티어" button
2. **Tier list** — Vertical list of tier cards, ordered by level (highest first)
   - Each tier card: `bg-corthex-surface border border-corthex-border rounded-xl p-4`
     - Level number (large, `text-2xl font-bold font-mono`)
     - Tier name
     - Assigned model (in `font-mono text-xs bg-corthex-elevated rounded-sm px-2 py-0.5`)
     - Max depth setting
     - Agent count using this tier
     - Edit/Delete actions (icon buttons with `aria-label`)
   - Visual hierarchy line connecting tiers (vertical line on left)
3. **Create/Edit form** — Inline or modal
   - Fields: Level (number), Name, Model (select), Max Depth (number), Description
4. **Tier relationship visualization** — Simple vertical tree showing tier hierarchy
   - Highest tier at top, descending

**Responsive:** Cards stack vertically. Form inputs full-width.

---

### Page 9: Jobs (`/jobs`)
**Layout type:** Dashboard + Tabbed
**Archetype emphasis:** Ruler (task delegation and monitoring)

**Content description:**
Background jobs and scheduled tasks (ARGOS). The Ruler's operations board — what's running, what's scheduled, what failed.

**Sections to generate:**
1. **Tab bar** — Active Jobs, Scheduled (ARGOS), History
2. **Active Jobs tab:**
   - Running jobs list with progress indicators
   - Each job: agent avatar, task name, progress bar (`bg-corthex-accent`), elapsed time, cancel button
   - Status: Running (pulse dot), Queued (static dot), Failed (error icon)
3. **Scheduled (ARGOS) tab:**
   - Cron job list with next run time
   - Each: name, schedule (cron expression in `font-mono`), last run status, toggle (Switch)
   - "새 ARGOS 작업" button
4. **History tab:**
   - Table: Job Name, Agent, Start Time, Duration, Cost, Status
   - Timestamps and costs in `font-mono`
   - Status badges (completed/failed/cancelled)
   - Pagination at bottom
5. **Job detail slide-over** — On click, panel slides in from right
   - Full job details, logs output, cost breakdown

**Responsive:** Tabs remain. Tables become card lists on mobile.

---

### Page 10: Workflows (`/workflows`)
**Layout type:** Dashboard (grid of workflow cards)
**Archetype emphasis:** Ruler (process design) + Sage (systematic thinking)

**Content description:**
n8n-style workflow builder. Visual workflow editor for creating multi-step agent processes.

**Sections to generate:**
1. **Header** — "워크플로우", count, "새 워크플로우" button, search input
2. **Workflow grid** — Cards showing saved workflows
   - Each card: name, description preview, step count, last run time, status badge
   - Card: `bg-corthex-surface border border-corthex-border rounded-xl p-4`
   - Hover: `hover:border-corthex-border-strong hover:shadow-sm transition-all`
   - Status: Active (success), Draft (tertiary), Error (error)
3. **Quick stats row** — Total workflows, active count, total runs today
4. **Workflow editor** (opens on card click or new)
   - Canvas area for node-based editing (similar to NEXUS but for workflow steps)
   - Node types: Trigger, Agent Action, Condition, Loop, Output
   - Sidebar toolbox: draggable node types
   - Properties panel: selected node configuration
5. **Empty state** — "첫 번째 워크플로우를 만들어보세요", with template suggestions

**Responsive:** Grid becomes list on mobile. Editor is desktop-only with mobile warning.

---

## Batch 3: Intelligence (5 pages)

### Page 11: Knowledge (`/knowledge`)
**Layout type:** Master-Detail
**Archetype emphasis:** Sage (knowledge management, wisdom)

**Content description:**
Knowledge base with RAG (pgvector). The Sage's library — documents, embeddings, semantic search.

**Sections to generate:**
1. **Header** — "지식 관리", item count, "새 지식 추가" button
2. **Search bar** — Semantic search input with `Search` icon
   - Placeholder: "의미 기반 검색..."
   - Results show relevance score in `font-mono`
3. **Filter tabs** — All, Documents, URLs, Text Snippets
4. **Knowledge list** (left, 360px)
   - Each item: icon (by type: `FileText`/`Link`/`Type`), title, source, date added
   - Department tag if assigned
   - Active item highlighted
5. **Knowledge detail** (right, flex-1)
   - Full content preview
   - Metadata: source URL, word count, embedding status
   - Assigned departments list
   - "관련 지식" section — semantically similar items
   - Actions: Edit, Re-embed, Delete
6. **Upload area** — Drag & drop zone
   - `border-2 border-dashed border-corthex-border-input rounded-xl p-8`
   - `Upload` icon, "파일을 여기에 끌어다 놓으세요"

**Responsive:** List only on mobile, detail opens full-screen.

---

### Page 12: Reports (`/reports`)
**Layout type:** Tabbed
**Archetype emphasis:** Sage (analysis, truth-seeking)

**Content description:**
Quality reviews and performance reports. The Sage analyzing agent performance with scholarly precision.

**Sections to generate:**
1. **Tab bar** — Quality Reviews, Performance Reports, Cost Reports
2. **Quality Reviews tab:**
   - List of A/B quality test results
   - Each: test name, agents compared, winner, score differential
   - Expandable detail: full comparison breakdown
3. **Performance Reports tab:**
   - Agent performance cards with metrics
   - Sortable by: success rate, avg response time, total tasks
   - Each card: agent name, metrics grid (4 values), trend sparklines
4. **Cost Reports tab:**
   - Cost breakdown by department, agent, model
   - Table with sortable columns
   - Cost values in `font-mono`
   - Total row at bottom with `font-semibold`
5. **Export button** — "내보내기" (CSV/PDF)
6. **Date range selector** — Same style as Dashboard

**Responsive:** Tabs remain. Tables become responsive card view.

---

### Page 13: Trading (`/trading`)
**Layout type:** Panels (2×2 quad layout)
**Archetype emphasis:** Sage (data analysis, market intelligence)

**Content description:**
Trading analysis dashboard. 4-panel layout for market monitoring — charts, orderbook, positions, history.

**Sections to generate:**
1. **Timeframe selector** (top bar) — 1m, 5m, 15m, 1h, 4h, 1d buttons
   - Active: `bg-corthex-accent text-corthex-text-on-accent`
   - Inactive: ghost variant
2. **Chart panel** (top-left, largest)
   - Candlestick/line chart area using `lightweight-charts`
   - Price in `font-mono text-2xl`
   - Chart uses `corthex-chart-*` colors
3. **Order book panel** (top-right)
   - Buy/sell depth with color-coded rows
   - Buy: `text-corthex-success`, Sell: `text-corthex-error`
   - Prices and quantities in `font-mono`
4. **Positions panel** (bottom-left)
   - Open positions table
   - P&L with semantic colors (green profit, red loss)
   - All numbers in `font-mono`
5. **History panel** (bottom-right)
   - Recent trade history list
   - Timestamps, prices, amounts in `font-mono`

**Responsive:** 4 panels → tab navigation on mobile (Chart, Book, Positions, History tabs).

---

### Page 14: Performance (`/performance`)
**Layout type:** Dashboard (metric-heavy)
**Archetype emphasis:** Sage (performance analytics)

**Content description:**
Detailed performance analytics. Deep-dive metrics for agent operations, response times, error rates.

**Sections to generate:**
1. **Date range + agent filter** — Top bar with date picker and agent/department multi-select
2. **KPI strip** — 5 large metric cards
   - Avg Response Time, Error Rate, Total Tasks, Uptime, Throughput
   - Large values in `text-3xl font-bold font-mono`
   - Trend indicators with semantic colors
3. **Response time chart** — Line chart over time
   - P50, P95, P99 lines in different `corthex-chart-*` colors
   - Y-axis in `font-mono` (milliseconds)
4. **Error breakdown** — Stacked bar chart by error type
5. **Agent leaderboard** — Ranked table of agents by performance score
   - Rank number, agent name, score bar, key metrics
   - Top 3 highlighted with subtle `bg-corthex-accent-muted`
6. **Comparison mode** — Side-by-side agent comparison (2 agents)

**Responsive:** Charts stack vertically. Leaderboard stays as table with horizontal scroll.

---

### Page 15: Costs (`/costs`)
**Layout type:** Dashboard + Table
**Archetype emphasis:** Sage (financial accountability) + Ruler (budget control)

**Content description:**
Cost tracking and budget management. Every dollar tracked, every model cost visible. Financial transparency.

**Sections to generate:**
1. **Budget summary bar** — Total spend, budget limit, remaining, utilization percentage
   - Progress bar: `bg-corthex-accent` (normal), `bg-corthex-warning` (>80%), `bg-corthex-error` (>95%)
   - All money values in `font-mono`
2. **Cost breakdown cards** — By model, by department, by agent (3-col grid)
   - Each card: model/dept/agent name, total cost, percentage of total
   - Mini bar chart inside each card
3. **Daily cost chart** — Area chart showing daily spend
   - Chart palette from `corthex-chart-*`
   - Budget limit line (dashed, `corthex-warning`)
4. **Detailed cost table** — Full transaction log
   - Columns: Date, Agent, Model, Tokens (in/out), Cost
   - All numeric values in `font-mono`
   - Sortable columns with sort icons
   - Pagination
5. **Cost alerts section** — Budget threshold warnings
   - Cards with `border-l-4 border-corthex-warning` for approaching limit
   - Cards with `border-l-4 border-corthex-error` for exceeded limit

**Responsive:** Cards stack. Table becomes card list on mobile.

---

## Batch 4: Social & Communication (5 pages)

### Page 16: Messenger (`/messenger`)
**Layout type:** Panels (3-column: channels + messages + members)
**Archetype emphasis:** Ruler (organizational communication)

**Content description:**
Team messaging platform. Channels for department communication, direct messages between agents and CEO.

**Sections to generate:**
1. **Channel list** (left, 280px)
   - Channel name with `#` prefix, unread count badge
   - Direct messages section below channels
   - Search input at top
   - "새 채널" button
   - Active channel: `bg-corthex-accent-muted`
2. **Message area** (center, flex-1)
   - Channel header: name, description, member count
   - Message list: avatar, name, timestamp, content
   - Timestamps in `text-xs text-corthex-text-tertiary`
   - Message input at bottom with toolbar (attach, emoji)
3. **Member list** (right, 240px)
   - Channel members with status dots
   - Role badges (Owner, Member)
   - Agent vs Human indicator
4. **Thread view** — Slide-over for message threads

**Responsive:** Only message area visible. Channel list = hamburger drawer. Member list hidden (icon to toggle).

---

### Page 17: SNS (`/sns`)
**Layout type:** Feed (centered 720px column)
**Archetype emphasis:** Sage (knowledge sharing)

**Content description:**
Social feed where agents share insights, discoveries, and updates. An internal knowledge-sharing timeline.

**Sections to generate:**
1. **Post composer** (top)
   - Textarea with agent selector (who posts)
   - Attach files, add tags
   - "게시" primary button
2. **Feed** — Centered column, max-width 720px
   - Each post: agent avatar, name, department, timestamp
   - Post content (text, images, code blocks)
   - Reaction bar (like, insightful, question)
   - Comment count, share button
   - Card: `bg-corthex-surface border border-corthex-border rounded-xl p-4 mb-4`
3. **Trending tags** (sidebar on desktop, hidden on mobile)
   - Popular hashtags with post counts
4. **Filter** — All, Following, Department, Bookmarked

**Responsive:** Feed is already mobile-friendly at 720px. Trending tags hidden on mobile.

---

### Page 18: Agora (`/agora`)
**Layout type:** Feed (centered 720px column)
**Archetype emphasis:** Sage (democratic discourse, debate)

**Content description:**
Debate platform where agents discuss topics. The Greek agora — structured discourse between AI agents.

**Sections to generate:**
1. **Header** — "AGORA", active debate count, "새 토론" button
2. **Debate list** — Cards for each debate topic
   - Topic title, description preview
   - Participant count (with avatars stacked)
   - Status: Active (pulse dot), Concluded, Voting
   - Created date, comment count
3. **Active debate view** (on click)
   - Topic header with full description
   - Argument threads: Pro vs Con columns (on desktop)
   - Each argument: agent avatar, name, argument text, vote count
   - Vote buttons (agree/disagree/abstain)
   - Moderator controls (if CEO)
4. **Debate results** — Summary card when concluded
   - Winning position, vote breakdown chart
   - Key arguments highlighted

**Responsive:** Pro/Con columns stack vertically on mobile. Full-width arguments.

---

### Page 19: Activity Log (`/activity-log`)
**Layout type:** Feed (centered 720px column)
**Archetype emphasis:** Sage (audit trail, accountability)

**Content description:**
Comprehensive audit trail. Every action logged — agent operations, system events, user actions. The Sage's historical record.

**Sections to generate:**
1. **Filter bar** — Date range, agent filter, event type filter (dropdown)
   - Event types: Agent Action, System, User, Handoff, Error
2. **Timeline feed** — Vertical timeline with event cards
   - Each event: timestamp (left), connector dot (colored by type), event card (right)
   - Timestamp: `font-mono text-xs text-corthex-text-tertiary`
   - Event card: icon (semantic color), title, description, agent name
   - Expandable details on click
3. **Date separators** — "2026-03-23 (오늘)", "2026-03-22 (어제)"
   - `text-xs font-semibold text-corthex-text-secondary uppercase`
4. **Load more** — Button at bottom or infinite scroll
5. **Export** — "내보내기" button (CSV)
6. **Empty state** — "이 기간에 활동이 없습니다"

**Responsive:** Timeline simplifies to stacked cards without left timestamps on mobile.

---

### Page 20: Ops Log (`/ops-log`)
**Layout type:** Feed (centered 720px column)
**Archetype emphasis:** Sage (operational intelligence)

**Content description:**
Operational log focused on system-level events — deployments, errors, configuration changes, health checks.

**Sections to generate:**
1. **Severity filter** — All, Info, Warning, Error, Critical
   - Color-coded filter chips using semantic colors
2. **Log entries** — Chronological list
   - Each entry: severity icon (semantic color), message, source, timestamp
   - Severity badge: `bg-corthex-info/15 text-corthex-info` (info), etc.
   - Expandable stack trace or details for errors
   - Source in `font-mono text-xs`
   - Timestamps in `font-mono text-xs`
3. **Auto-refresh toggle** — Switch to enable live log streaming
4. **Search** — Full-text search through log entries
5. **Statistics bar** — Error count, warning count, last error timestamp

**Responsive:** Feed is naturally responsive. Entries stack cleanly.

---

## Batch 5: Tools & System (4 pages + redirect)

### Page 21: Settings (`/settings`)
**Layout type:** Tabbed (10 tabs)
**Archetype emphasis:** Ruler (system configuration)

**Content description:**
Comprehensive settings with 10 tabs. All system configuration in one place.

**Sections to generate:**
1. **Tab navigation** (vertical on desktop left sidebar within content, horizontal on mobile)
   - Tabs: Profile, Company, API Keys, Models, Budget, Notifications, Security, Integrations, Appearance, About
   - Active tab: `text-corthex-accent font-medium` + left border indicator
   - Vertical tab list: 200px width, `bg-corthex-surface rounded-xl p-2`
2. **Profile tab** — User info form (name, email, avatar upload, language)
3. **Company tab** — Company name, plan, onboarding status
4. **API Keys tab** — Key list with masked values, copy button, rotate button
   - Keys in `font-mono`, masked: `sk-...a1b2`
5. **Models tab** — Available AI models, default model selection
   - Model names in `font-mono`
6. **Budget tab** — Budget limits, alert thresholds, per-department limits
   - Money values in `font-mono`
7. **Notifications tab** — Notification preferences (email, in-app)
   - Toggle switches for each category
8. **Security tab** — Password change, 2FA setup, session management
9. **Integrations tab** — Connected services list
10. **Appearance tab** — Theme selector (6 themes with preview swatches)
11. **About tab** — Version, build number, support links
    - Build number in `font-mono`

**Responsive:** Vertical tabs become horizontal scrollable tab bar on mobile.

---

### Page 22: Classified (`/classified`)
**Layout type:** Master-Detail
**Archetype emphasis:** Ruler (secure information management)

**Content description:**
Classified/archived documents and sensitive data. Restricted access area with clear security indicators.

**Sections to generate:**
1. **Header** — "CLASSIFIED" with `Lock` icon, document count
   - Subtle security banner: `bg-corthex-warning/10 border border-corthex-warning/30 rounded-lg p-3`
   - "접근이 제한된 영역입니다" warning text
2. **Document list** (left, 320px)
   - Each: `Lock` icon, title, classification level badge, date
   - Classification badges: Confidential, Secret, Top Secret (different shades)
3. **Document viewer** (right, flex-1)
   - Full document content with metadata
   - Access log: who viewed, when
   - Actions: Declassify, Share, Delete
4. **Access denied state** — For documents above user's clearance

**Responsive:** List-only on mobile, detail opens full-screen.

---

### Page 23: Files (`/files`)
**Layout type:** Master-Detail (folder tree + file grid)
**Archetype emphasis:** Sage (organized knowledge)

**Content description:**
File manager. Browse, upload, and manage files across departments.

**Sections to generate:**
1. **Header** — "파일 관리", storage usage indicator, "업로드" button
2. **Breadcrumb navigation** — Current path (Home > Department > Subfolder)
3. **Folder tree** (left, 240px)
   - Expandable folder structure with `ChevronRight` toggle icons
   - Active folder highlighted
4. **File grid** (right, flex-1)
   - Grid of file cards with icon (by type), name, size, modified date
   - File type icons: `FileText` (doc), `Image` (img), `FileCode` (code), `File` (other)
   - Size and dates in `font-mono text-xs`
   - Right-click context menu: Download, Rename, Move, Delete
5. **View toggle** — Grid/List view
6. **Drag & drop upload zone** — Overlay when dragging files
7. **Storage quota** — Progress bar showing used/total space

**Responsive:** Folder tree hidden on mobile (breadcrumb navigation only). File grid becomes list view.

---

### Page 24: Redirect (`/` → `/hub`)
**No page to generate.** This route simply redirects to `/hub`.

---

## Appendix: Stitch Generation Checklist

Before submitting each batch to Stitch 2:

- [ ] DESIGN.md loaded as design system
- [ ] All colors use `corthex-*` tokens — zero hardcoded hex
- [ ] All icons from Lucide React — zero Material Symbols
- [ ] Content area only — no sidebar or topbar generated
- [ ] `font-mono` applied to all costs, IDs, timestamps, code
- [ ] `aria-hidden="true"` on all decorative icons
- [ ] `aria-label` on all icon-only buttons
- [ ] Status indicators use color + icon + text (never color alone)
- [ ] Input borders use `border-corthex-border-input` (not `border-corthex-border`)
- [ ] Focus rings use `ring-corthex-focus` (light bg) or `ring-corthex-focus-chrome` (dark bg)
- [ ] Touch targets minimum 44px on interactive elements
- [ ] Cards use `bg-corthex-surface border border-corthex-border rounded-xl`
- [ ] Responsive breakpoints considered (xl → lg → md → sm)
- [ ] `prefers-reduced-motion` CSS block included (all animations have reduced-motion fallback)
- [ ] `<main role="main">` wrapping content area
- [ ] `aria-current="page"` on active navigation items
- [ ] `aria-live="polite"` on streaming text and notification counters
- [ ] Skip-to-content link as first focusable element
- [ ] Success ≈ accent disambiguation applied (success = icon+text, active = bg tint only)
- [ ] Chat timestamps positioned OUTSIDE message bubbles
- [ ] Tier badges use `rounded-full`
- [ ] Placeholder text uses `placeholder:text-corthex-text-tertiary` (#756e5a)

---

*End of Web Stitch Prompts — Phase 5-Prompts, Step 5-2*
