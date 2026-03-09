# Gemini 이미지 생성 프롬프트 — 1순위 9개 페이지

> 사용법: 각 프롬프트를 **하나씩** Gemini에 복사-붙여넣기 하세요.
> 생성된 이미지는 `_uxui-refactoring/designs/` 폴더에 저장하세요.

>
> 파일명 규칙:
> - `01-command-center-desktop.png`
> - `01-command-center-mobile.png`
> - `04-trading-tablet.png` (태블릿 버전이 있는 경우)

---

## 01. Command Center (사령부) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: The primary workspace where the user gives natural language instructions to AI agents and monitors their progress. It's the most-used page in the entire product.

User workflow:
1. User types an instruction in natural language (e.g., "Analyze our Q3 sales data and create a presentation")
2. The system routes the task through a chain of AI agents — each specializing in different roles. The user sees this chain progress in real-time.
3. When agents complete their work, the user reads the deliverables (reports, diagrams, documents) right here.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Message thread — user's instructions and AI agent responses, chat-style. Agent messages show: agent name, role/department tag, and the response content.
2. Task delegation pipeline — real-time visualization of which AI agent is currently working. Shows a chain like: "Manager → Analyst → Writer" with status per step (waiting / working / done / failed).
3. Deliverable viewer — when an agent produces a report or diagram, the user can read it here. Supports rendered markdown, Mermaid diagrams, and sketch previews.
4. Input area — a text input at the bottom where the user types instructions. Has a send button. Auto-expands for longer text.
5. Quick command popup — when user types "/" in the input, a popup shows categorized commands (like Slack's slash commands).
6. Agent mention popup — when user types "@", a popup shows available AI agents grouped by department.
7. Saved templates — quick access to frequently-used instruction templates (the user can create/edit/delete these).
8. Quality indicators — PASS/FAIL badges on agent outputs showing quality check results.
9. Empty state — when there's no history yet, show a welcoming onboarding with example instructions the user can click to try.
10. Loading state — skeleton UI while history loads.
11. Error state — clear message when something goes wrong.

Design tone — YOU DECIDE:
- This is NOT a military/command center app. It's a modern productivity platform for managing AI workers.
- Choose whatever visual tone fits best for a professional tool that a CEO or team lead would use daily.
- Light theme, dark theme, or mixed — your choice. Pick what makes the most sense.
- Status colors should be clearly distinguishable (processing vs complete vs failed).
- Clean and functional. This is a tool people use 8 hours a day — it should feel effortless, not flashy.

Design priorities (in order):
1. The input area must be immediately accessible — this is what the user interacts with most.
2. The delegation pipeline must be visible at a glance — the user needs to know task progress without scrolling.
3. Deliverables must be readable — reports can be long, diagrams can be complex.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 01. Command Center (사령부) — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents by giving natural language instructions and monitoring task delegation in real-time.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Message thread (user instructions + AI agent responses)
2. Task delegation status (compact real-time visualization)
3. Deliverable viewing area
4. Input area (bottom-positioned, above the app's tab bar, with send button)
5. "/" command popup and "@" mention popup (mobile-friendly format — bottom sheets, not dropdowns)
6. Saved templates quick-access
7. Quality badges (PASS/FAIL)
8. Loading / empty / error states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Input must be reachable with one thumb at the bottom of the screen.
2. Delegation status visible at a glance without scrolling.
3. Reading deliverables should feel comfortable despite smaller screen.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 02. Chat (1:1 대화) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A 1:1 chat interface where the user has direct conversations with individual AI agents. Similar to Slack DMs or iMessage — the user picks an AI agent and chats with them privately.

User workflow:
1. User sees a list of past conversations (sessions) in a left panel
2. User clicks a session to continue an existing conversation, or clicks "New Chat" to start fresh
3. When starting a new chat, a modal shows all available AI agents grouped by department — user picks one
4. The chat area shows the message thread with that specific agent
5. User types a message, agent responds

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Session list panel — left side, shows past conversations grouped by date (Today, Yesterday, This Week, Older). Each session shows: agent name, agent avatar/icon, last message preview, timestamp. Has a "New Chat" button at top. Groups are collapsible.
2. Chat area — the main message thread. User messages on the right (highlighted), agent messages on the left (neutral). Agent messages show agent name and role tag. Some agent messages contain "tool call cards" — small inline cards showing which tools the agent used (tool name, status, duration).
3. Chat header — shows the selected agent's name, role, department, and online status indicator. For "secretary" agents, shows delegation status as subtitle (e.g., "Delegating to Marketing dept...").
4. Input area — text input at the bottom with a file attach button (paperclip icon) on the left and send button on the right. When files are attached, small preview chips appear above the input. During AI streaming, the send button changes to a red "Stop" button.
5. Agent selection modal — when starting a new chat, shows agents grouped by department with search. Each agent shows avatar, name, role, and department color.
6. Empty state — when no session is selected, show a welcoming prompt encouraging the user to start a conversation or pick an agent. When session list is empty, show "No conversations yet" message.
7. Session management — each session has a "..." action button (visible on hover on desktop, always visible on mobile) with rename and delete options. Delete shows a confirmation dialog.
8. Loading state — skeleton UI while messages load. Spinner when loading older messages at top.
9. Error state — error message with a "Retry" link below it.
10. Connection status — a thin banner at the top of chat area showing "Disconnected, reconnecting..." (yellow) or "Connected" (green, auto-hides after 2 seconds).
11. Delegation panel — for secretary agents only, a toggle in the header switches between chat view and delegation history view. Delegation history shows each delegated task with target agent name, status badge (pending/completed/failed), prompt, response, and timing.
12. File attachments in messages — messages can contain file attachments. Image attachments show inline thumbnails, other files show filename + size with download link.

Design tone — YOU DECIDE:
- This is a modern professional messaging tool for talking to AI coworkers.
- Choose whatever visual tone fits best — it should feel as natural as using Slack or Teams.
- Light theme, dark theme, or mixed — your choice.
- Clean, fast, and functional. This is a tool people use frequently throughout the day.

Design priorities (in order):
1. The chat input must be immediately accessible — this is a messaging app.
2. Switching between conversations must be fast and obvious.
3. It should be clear who you're talking to (agent identity visible at all times).

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 02. Chat (1:1 대화) — 모바일

```
Mobile version (375x812) of the same page described above.

Same product context: a 1:1 chat interface where users have direct conversations with individual AI agents.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Mobile-specific behavior:
- Two views that toggle: Session List view and Chat view (not side-by-side)
- Session List: full-width list of past conversations with "New Chat" button
- Chat: full-width chat with a back arrow to return to session list
- Agent selection: full-screen modal with search

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 03. Dashboard (대시보드) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: The main dashboard — an overview of the entire AI organization's status. The CEO opens this page to quickly understand what's happening across all AI agents, costs, and task completion.

User workflow:
1. CEO opens the dashboard first thing in the morning
2. Scans summary cards to see today's task count, costs, agent status, and system health
3. Checks the AI usage chart to monitor spending trends
4. Reviews the monthly budget progress bar
5. Glances at satisfaction trends
6. Optionally clicks a "quick action" button to trigger a common command

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Page header — title and a small real-time connection status indicator.
2. Summary cards (4) — Tasks (total/completed/failed/in-progress), Costs (today's spend + budget %), Agents (total/active/idle/error), Integrations (provider status: up/down for Anthropic/OpenAI/Google + tool system).
3. AI usage chart — stacked bar chart showing daily spend (cost in dollars) by provider (Anthropic=blue, OpenAI=green, Google=orange). Toggleable between 7-day and 30-day views. Hoverable bars with tooltip showing date, cost, and call count. Note: the primary metric is cost, but tooltip should also show call count for reference.
4. Monthly budget progress bar — horizontal bar showing current spend vs budget. Color changes: green (0-59%), yellow (60-79%), red (80%+). Shows projected month-end spend as a dashed marker with tooltip "Projected based on current spending trend". Department-level cost breakdown below. If budget is not set, show a placeholder message instead of the bar.
5. Satisfaction donut chart — shows positive/negative/neutral feedback ratio. Period selector (7d / 30d / all). Shows satisfaction rate percentage in center. IMPORTANT: The period selector UI pattern must match the usage chart's 7/30-day toggle (use the same component style for consistency).
6. Quick action buttons — grid of action buttons with icons and labels. Some trigger preset commands, others navigate to other pages.
7. Loading skeleton — skeleton UI matching the layout of all cards and charts.
8. Error state — clear message when data cannot be loaded.
9. Empty state — when there is no data yet (zero tasks, zero agents, no usage history), show a friendly placeholder instead of blank space. Each card/chart should have its own empty state message.

Design tone — YOU DECIDE:
- This is a data-rich executive dashboard for monitoring an AI workforce.
- Choose whatever visual tone fits best — clean data visualization, professional analytics feel.
- Light theme, dark theme, or mixed — your choice.
- Information density is important — the CEO wants to see everything at a glance without scrolling.

Design priorities (in order):
1. Summary cards must be scannable in under 2 seconds.
2. Budget status must be immediately obvious (safe vs danger).
3. Charts should be visually polished but not overwhelming.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

---

## 03. Dashboard (대시보드) — 모바일

```
Mobile version (375x812) of the same dashboard page described above.

Same product context: CEO dashboard showing AI organization overview.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Mobile-specific adaptations:
- Summary cards: 1 or 2 columns (not 4)
- Charts: full width, vertically stacked
- Quick actions: 2-column grid
- All content scrollable vertically

Design tone: Same as desktop version. YOU DECIDE the tone.

Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 04. Trading (투자 워크스테이션) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A trading workstation where the user monitors stocks and discusses investment strategies with AI analysts. Three-panel layout combining a stock watchlist, price charts, and an AI chat for analysis.

User workflow:
1. User browses their watchlist of stocks in the left panel (real-time prices, drag-to-reorder)
2. Clicking a stock opens its chart in the center panel (candlestick/line chart with portfolio summary)
3. In the right panel, user chats with an AI investment analyst about the selected stock
4. User can switch to "comparison mode" to compare multiple stocks side-by-side

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Stock watchlist panel (left, ~240px) — search bar, market filter (KR/US), list of watched stocks with: ticker, name, current price, change %, mini sparkline chart. Drag-to-reorder handles.
2. Chart panel (center, flexible width) — stock price chart (candlestick or line), time period selector, portfolio summary (cash, holdings, total return, auto-trade ON/OFF badge, investment style badge: conservative/balanced/aggressive, last 3 trade executions summary, "PAPER" watermark when in paper trading mode). Clean, data-rich but not overwhelming.
3. AI chat panel (right, ~360px) — conversation with AI analyst about investment strategy. Message thread + input area. Context-aware: shows which stock is being discussed.
4. Compare mode — alternative center panel showing multiple stocks side-by-side with comparison charts.
5. Empty state — when no stock is selected, show a prompt to pick one from the watchlist.
6. Loading state — skeleton while price data loads.
7. Error state — when price data fails to load, show an error message with a retry button.

Design tone — YOU DECIDE:
- This is a financial analysis tool. Think TradingView meets AI chat.
- Professional, data-dense, but not intimidating for non-traders.
- Numbers must be highly readable. Use appropriate colors for gains/losses.
- Light or dark theme — your choice (dark is common in trading apps).

Design priorities:
1. Stock prices and changes must be instantly scannable.
2. The chart must be the visual focal point.
3. The AI chat should feel integrated, not bolted on.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 04. Trading (투자 워크스테이션) — 태블릿

```
Tablet version (768x1024) of the same trading page.

IMPORTANT — Tablet app shell context:
- LEFT SIDEBAR for navigation (don't include). TOP HEADER (don't include).
- Content area only (approximately 700px wide).

Tablet-specific:
- Two-panel layout: stock sidebar (200px) + chart/comparison panel (flexible)
- Chat is accessed via a floating action button (bottom-right corner) that opens a slide-in panel from the right (360px wide, position: fixed, full height)
- Slide-in has a close button (X) at top-right and a semi-transparent backdrop
- Comparison mode available via toggle button
- Stock sidebar slightly narrower than desktop

Design tone: Same as desktop. YOU DECIDE.
Resolution: 768x1024, pixel-perfect UI screenshot style.
```

---

## 04. Trading (투자 워크스테이션) — 모바일

```
Mobile version (375x812) of the same trading page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR for navigation (don't include).
- Compact TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Compact watchlist at top (scrollable, max ~180px height)
- Tab switcher below: "Chart" and "Chat"
- Selected tab fills remaining space
- No comparison mode on mobile

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 05. Agora (토론장) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A debate arena where AI agents (team leaders) hold structured, round-based discussions on topics chosen by the user. The user watches as multiple AI agents present their arguments, counter-arguments, and reach consensus (or disagreement).

User workflow:
1. User sees a list of past and ongoing debates in the left panel
2. User can create a new debate by specifying a topic and type (standard: 2 rounds, deep: 3 rounds)
3. The center panel shows the debate timeline — each round, each agent's statement, and the progression toward consensus
4. If a debate is in-progress, it updates in real-time (auto-refresh every 5 seconds)
5. The right panel shows debate metadata: participants, status, type, round progress

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Debate list panel (left, ~280px) — list of debates with: topic (truncated), status (in-progress with live indicator / completed), date, participant count, round progress (e.g., "Round 2/3").
2. Debate timeline (center, flexible) — the main content. Shows: debate topic as header, status badge, round separators, and individual agent statements as cards. Each statement shows agent name, department, and their argument text. Live debates show a pulsing indicator.
3. Debate info panel (right, ~280px, desktop only) — participants with avatars, debate type (standard/deep), status, creation date, round count.
4. "New Debate" button — opens a modal where user sets topic and debate type.
5. Empty state — when no debate is selected, show a welcoming message encouraging the user to start or select a debate.
6. In-progress indicator — clearly visible live indicator for ongoing debates.
7. Diff view toggle — a button at the top of the timeline that, when activated, shows a side-by-side comparison of how each participant's opinion changed between rounds.
8. Loading state (skeleton cards for debate list, spinner for timeline), error state (error message + retry button).

Design tone — YOU DECIDE:
- This is a structured discussion/debate viewer. Think of it like a courtroom or academic panel discussion viewer.
- Each agent's contribution should be visually distinct (unique color/avatar per agent).
- Round transitions should feel like chapter breaks.
- Light or dark theme — your choice.

Design priorities:
1. The debate timeline must be the visual focal point — easy to read and follow.
2. Round boundaries must be obvious (which statements belong to which round).
3. Live status must be immediately visible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 05. Agora (토론장) — 태블릿

```
Tablet version (768x1024) of the same debate arena page.

IMPORTANT — Tablet app shell context:
- LEFT SIDEBAR for navigation (don't include). TOP HEADER (don't include).
- Content area only (approximately 700px wide).

Tablet-specific:
- Two-column layout: debate list (~240px) + debate timeline (flexible)
- Info panel is HIDDEN on tablet. Instead, the timeline header area shows a compact summary: participant avatars (stacked), debate type badge, round progress (e.g., "Round 2/3")
- "New Debate" button in the list panel header
- Debate list items show: topic, status indicator, date, participant count

Design tone: Same as desktop. YOU DECIDE.
Resolution: 768x1024, pixel-perfect UI screenshot style.
```

---

## 05. Agora (토론장) — 모바일

```
Mobile version (375x812) of the same debate arena page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Two views that toggle: Debate List and Debate Detail
- Debate Detail shows timeline only (info panel hidden)
- Back button to return to list
- "New Debate" button accessible from list view

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 06. Nexus (다이어그램 캔버스) — 데스크톱

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A visual diagramming canvas combined with AI chat — like Figma or Miro but with an AI assistant that can modify the canvas through natural language commands. Users draw system architectures, workflows, and knowledge graphs by placing nodes and connecting them with edges.

User workflow:
1. User adds nodes from a palette (8 types: start, end, agent, system, API, decision, database, note — each with unique color/shape)
2. Drags nodes to position them, connects them with edges by dragging from node handles
3. Double-clicks nodes to rename them, right-clicks for context menu (duplicate, delete)
4. Types AI commands like "Add a database node and connect it to the API server" — AI generates a preview that user can accept or reject
5. Can import/export Mermaid code, save/load canvases, and export to knowledge base
6. An AI chat panel on the right provides context-aware conversation about the diagram

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Toolbar/header bar — compact toolbar with grouped actions: file operations (save, canvas list, new), edit operations (undo, redo, auto-layout, clear), import/export (Mermaid import, export, knowledge base save), agent selector dropdown.
2. Canvas area (center, majority of space) — infinite canvas with dot grid background. Nodes are colored shapes (each of 8 types has a distinct color). Edges are arrows between nodes. Zoom controls and minimap in corner.
3. Node palette — accessible way to add nodes. Could be a floating toolbar, sidebar panel, or contextual menu. Shows all 8 node types with their icons and colors.
4. AI command input — a compact input bar at the bottom of the canvas for typing natural language commands to the AI. Shows processing state.
5. AI preview overlay — when AI suggests changes, a floating card shows the description with Accept/Cancel buttons.
6. Chat panel (right, ~380px) — AI chat area for discussing the diagram. Can be toggled open/closed.
7. Status bar — shows node count, edge count, unsaved indicator, auto-save status.
8. Empty canvas state — welcoming guide on how to start (add nodes, use AI commands).
9. Canvas list sidebar (optional, togglable) — list of saved canvases to load.

Design tone — YOU DECIDE:
- This is a creative design tool. Think Figma, Excalidraw, or Miro.
- The canvas should be the hero — maximum space for drawing.
- UI controls should be minimal and non-intrusive.
- Light or dark theme — your choice.

Design priorities:
1. Canvas must dominate the screen — controls should be compact.
2. The node palette must be accessible but not always visible.
3. The AI input should be always visible but not take too much space.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 06. Nexus (다이어그램 캔버스) — 모바일

```
Mobile version (375x812) of the same canvas + AI chat page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Two-view toggle: Canvas view and Chat view
- Canvas view: simplified toolbar, touch-friendly node manipulation
- AI command input at bottom of canvas view
- Chat view: full-screen chat
- Compact header with essential controls only

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 07. Agents (AI 직원 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. This is the ADMIN panel where the administrator manages the AI workforce.

This page: An agent management page where the admin creates, configures, and manages AI employees. Each agent has: name, role, tier (Manager/Specialist/Worker), AI model assignment, department, and a "Soul" (personality definition in markdown).

User workflow:
1. Admin sees a table/list of all AI agents with their status, tier, model, and department
2. Filters agents by department, tier, status, or search by name
3. Clicks "+ New AI Employee" to create a new agent (name, role, tier, model, department, soul template)
4. Clicks an agent row to open a detail panel (slides in from right or modal)
5. Detail panel has 3 tabs: Basic Info (edit name/role/tier/model/dept), Soul Editor (markdown editor + live preview side-by-side), Tools (read-only list of allowed tools)
6. System agents are marked with a special badge and cannot be deleted
7. Admin can deactivate non-system agents (with confirmation)

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — title "Agent Management", agent count, "+ New AI Employee" button.
2. Filter bar — search input, department dropdown, tier dropdown (Manager/Specialist/Worker), status dropdown (online/working/error/offline).
3. Agent table — columns: Name (with avatar/icon, role subtitle, system badge if applicable), Tier, Model, Department, Status (colored badge), Actions (edit, deactivate).
4. Create form — expandable form or modal for creating new agents. Fields: name, role, tier (with auto model suggestion), model selector, department, soul template dropdown + textarea.
5. Detail panel — slide-in panel from right (or wide modal) with 3 tabs:
   - Basic Info: form fields for name, role, tier, model, department
   - Soul Editor: split view with markdown editor (left) and rendered preview (right)
   - Tools: read-only list of allowed tools as badges/chips
6. Deactivation confirmation modal — shows agent name and impact description.
7. Empty state — when no agents exist, CTA to create first one.
8. Loading state, error state.

Design tone — YOU DECIDE:
- This is an admin management panel. Think Linear settings, Vercel dashboard, or Stripe dashboard.
- Professional, clean, data-focused.
- The table should be scannable and the detail panel should be spacious for editing.
- Light or dark theme — your choice.

Design priorities:
1. The agent list must be scannable — status and tier at a glance.
2. The Soul editor needs enough space for comfortable markdown editing.
3. System agents must be visually distinct from regular agents.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 07. Agents (AI 직원 관리) — 모바일 [ADMIN]

```
Mobile version (375x812) of the same agent management page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Agent list as cards instead of table (name, tier badge, status badge, dept)
- Detail panel as full-screen overlay
- Create form as full-screen modal
- Filters collapsible or in a filter drawer

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 08. Departments (부서 관리) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — admin panel for managing an AI agent organization.

This page: A department management page where the admin creates, edits, and deletes departments. Each department groups AI agents together. Deleting a department requires impact analysis showing how many agents, tasks, and costs will be affected.

User workflow:
1. Admin sees a list/table of departments with name, description, agent count, and status
2. Clicks "+ New Department" to create (name + description)
3. Clicks "Edit" on a row to inline-edit the name and description
4. Clicks "Delete" to open a cascade analysis modal showing: affected agent count, active tasks, knowledge records, and accumulated costs, plus agent breakdown list
5. Chooses deletion mode: "Wait for completion" (recommended) or "Force terminate"

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — "Department Management", department count, "+ New Department" button.
2. Department table — columns: Name, Description, Agent Count (as badge), Status (active/inactive badge), Actions (edit, delete).
3. Inline editing — when editing, the row transforms to show input fields with save/cancel buttons. Highlighted background to indicate edit mode.
4. Create form — modal dialog. Fields: name (required), description (optional). Modal avoids layout shift.
5. Cascade analysis modal — opened when deleting. Shows: 4 impact summary cards (agents, active tasks, knowledge records, cost). Agent breakdown list. Deletion mode selector (radio buttons with descriptions). Confirmation info. Cancel/Delete buttons.
6. Empty state — when no departments exist (icon + message + "Create your first department" CTA button).
7. Loading state — skeleton placeholder rows (3-5 shimmer rows) while data loads.
8. Error state — centered error message with retry button when API call fails.
9. Department color indicators — each department row has a small colored dot or left border stripe, color determined by department ID hash (colors[id % paletteLength]), purely decorative, no data stored. Colors remain stable when departments are deleted or reordered.

Design tone — YOU DECIDE:
- Admin management panel, clean and professional.
- The cascade analysis modal is the most complex part — it needs to clearly communicate the impact of deletion.
- Light or dark theme — your choice.

Design priorities:
1. The department list must be scannable.
2. The cascade modal must clearly communicate risk before deletion.
3. Inline editing should feel seamless.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 08. Departments (부서 관리) — 모바일 [ADMIN]

```
Mobile version (375x812) of the same department management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Mobile-specific:
- Departments as cards instead of table. Each card shows: department name, agent count badge, status badge. Edit/delete actions behind a kebab (⋮) menu.
- Create form as full-screen modal
- Cascade modal: full-screen with scrollable content
- Editing: prefer edit modal over inline card expansion (more consistent with create modal UX). Kebab menu opens a dropdown or action sheet with edit/delete options.

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 09. Credentials (CLI 토큰 / API 키) — 데스크톱 [ADMIN]

```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — admin panel for managing an AI agent organization.

This page: A security/credentials management page where the admin registers and manages authentication tokens and API keys for each employee. AI agents need human employees' CLI tokens to operate. Also manages external API keys (stock broker, email, etc.).

User workflow:
1. Admin sees a list of employees (human users) in the left panel
2. Selects an employee to see their registered tokens and API keys
3. A helpful guide box explains how to find the Claude OAuth token
4. Admin can register new CLI OAuth tokens (label + token value)
5. Admin can register external API keys (provider: KIS/Notion/Email/Telegram, scope: personal/company, key value)
6. Admin can deactivate CLI tokens or delete API keys

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — "CLI Token / API Key Management" with subtitle.
2. Guide box — informational callout explaining how to find the Claude OAuth token (step-by-step instructions). Should feel helpful, not alarming.
3. Employee list (left, ~1/3 width) — list of employees with name and username. Selected employee is highlighted. Optional: search/filter input at the top if the list is long.
4. Token section (right, ~2/3 width) — for the selected employee:
   a. CLI OAuth Tokens — header with employee name, "+ Register Token" button. List of tokens showing: label, registration date, active/inactive badge, deactivate button.
   b. External API Keys — header, "+ Register API Key" button. List of keys showing: provider badge (KIS/Notion/etc.), scope badge (personal/company), label, registration date, delete button.
5. Registration forms — modal dialogs (not inline). Token form: label + textarea for token value. API key form: provider selector, scope (personal/company radio), label, key input (password field). Modals prevent layout shift.
6. Empty state — "No registered tokens" / "No registered API keys" with icon and CTA button.
7. Security indicators — visual cues that this is sensitive data (lock icons, masked token preview like "sk-ant-oat01-***", etc.).
8. Loading state — skeleton placeholders while data loads (employee list, token list, API key list each independently).
9. Error state — error message with retry button when API call fails.
10. Guide box — collapsible (with toggle button) so experienced admins can hide it.

Design tone — YOU DECIDE:
- This is a security settings page. Think GitHub Settings > Personal Access Tokens, or AWS IAM credentials.
- Should feel secure and professional. Sensitive data handling should be visually communicated.
- Light or dark theme — your choice.

Design priorities:
1. It must be clear which employee's credentials you're viewing.
2. The guide box should be helpful for first-time setup.
3. Token/key status (active/inactive) must be immediately visible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

---

## 09. Credentials (CLI 토큰 / API 키) — 모바일 [ADMIN]

```
Mobile version (375x812) of the same credentials management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Mobile-specific:
- Employee list as a full-width master view (NOT dropdown). Employee list IS the initial screen on mobile -- no placeholder needed.
- After selecting an employee, navigate to detail view showing token/key sections stacked vertically
- Back button ("< Employee List") in content area to return to master view. Navigating back clears selectedUserId (prevents stale data).
- Registration forms as full-screen modals
- Guide box collapsible

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 이미지 저장 위치 체크리스트

| # | 페이지 | 데스크톱 | 모바일 | 태블릿 |
|---|--------|---------|--------|--------|
| 01 | command-center | `01-command-center-desktop.png` | `01-command-center-mobile.png` | — |
| 02 | chat | `02-chat-desktop.png` | `02-chat-mobile.png` | — |
| 03 | dashboard | `03-dashboard-desktop.png` | `03-dashboard-mobile.png` | — |
| 04 | trading | `04-trading-desktop.png` | `04-trading-mobile.png` | `04-trading-tablet.png` |
| 05 | agora | `05-agora-desktop.png` | `05-agora-mobile.png` | `05-agora-tablet.png` |
| 06 | nexus | `06-nexus-desktop.png` | `06-nexus-mobile.png` | — |
| 07 | agents | `07-agents-desktop.png` | `07-agents-mobile.png` | — |
| 08 | departments | `08-departments-desktop.png` | `08-departments-mobile.png` | — |
| 09 | credentials | `09-credentials-desktop.png` | `09-credentials-mobile.png` | — |

**총 20장** (데스크톱 9 + 모바일 9 + 태블릿 2)

모든 이미지는 `_uxui-refactoring/designs/` 폴더에 저장하세요.
