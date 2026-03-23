# CORTHEX v2/v3 — UXUI Redesign Technical Spec

**Phase:** 0-Foundation, Step 0-1
**Date:** 2026-03-23
**Source of Truth:** Codebase scan + architecture.md + PRD + v1-feature-spec

---

## 1. System Overview

### 1.1 Platform Identity

CORTHEX is a multi-tenant AI Agent Orchestration Platform where a CEO (human user) commands a dynamic hierarchy of AI agents through a web interface. Agents are organized into departments with N-tier hierarchy (Manager → Specialist → Worker), each with a "Soul" (system prompt) that defines personality, capabilities, and orchestration rules.

### 1.2 Architecture Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Bun | 1.3.10 |
| **Backend** | Hono (Web Standards API) | 4.12.3 |
| **Frontend** | React 19 + Vite 6.4 SPA | 19.2.4 / 6.4.1 |
| **Styling** | Tailwind CSS v4 (CSS-first config) | 4.2.1 |
| **State (client)** | Zustand | 5.0.11 |
| **State (server)** | @tanstack/react-query | 5.90.21 |
| **Routing** | react-router-dom | 7.13.1 |
| **ORM** | Drizzle ORM | 0.39.3 |
| **Database** | PostgreSQL + pgvector (Neon serverless) | — |
| **AI SDK** | @anthropic-ai/claude-agent-sdk | 0.2.72 (exact pin) |
| **Monorepo** | Turborepo + Bun workspaces | 2.8.12 |
| **Icons** | Lucide React | — |
| **Fonts** | Inter (UI) + JetBrains Mono (code) + Noto Serif KR (Korean serif) | Google Fonts CDN |

> **CDN Gap:** `packages/admin/index.html` loads JetBrains Mono via Google Fonts CDN, but `packages/app/index.html` does NOT include the JetBrains Mono `<link>`. App CSS (`font-family: 'JetBrains Mono'`) references it but the font never loads — falls back to system monospace. **Must fix in Phase 1.**

### 1.3 Package Structure

```
packages/
├── app/          # CEO SPA (React + Vite) — 23 pages + login + onboarding
├── admin/        # Admin Console (React + Vite) — company/agent/tool CRUD
├── server/       # Hono API server (Bun runtime)
├── shared/       # TypeScript types shared across packages
├── ui/           # Shared UI components (Skeleton, ToastProvider, etc.)
├── landing/      # Marketing site (Vite SSG)
└── office/       # [v3] OpenClaw virtual office (PixiJS 8) — React.lazy isolated
```

### 1.4 Current Design Tokens (Pre-Reset Baseline — Natural Organic Theme)

> **Context:** The v2 codebase has a known 428-location color-mix inconsistency (raw hex literals, mixed Tailwind utility classes, inline styles, and remnants of 5 abandoned themes from `themes.css`). The UXUI redesign will perform a complete token reset. The values below document the **current as-built state** to inform the reset — they are NOT the target design system.

| Token | Value | CSS Usage |
|-------|-------|-----------|
| Background | `#faf8f5` | `bg-[#faf8f5]` — cream |
| Surface | `#e5e1d3` | `border-[#e5e1d3]` — sand |
| Primary (olive dark) | `#283618` | Sidebar `bg-[#283618]` |
| Primary (olive mid) | `#606C38` | Active indicators, avatar bg |
| Primary (olive light) | `#5a7247` | Secondary accents |
| Text primary | `#1a1a1a` | `text-[#1a1a1a]` |
| Text secondary | `#6b705c` | `text-[#6b705c]` — muted |
| Text tertiary | `#a3a08e` | `text-[#a3a08e]` — placeholder |
| Sidebar text | `#a3c48a` | Nav labels, section headers |
| Sidebar text dim | `#a3c48a/50` | Build number |
| Surface hover | `#f5f0e8` | `hover:bg-[#f5f0e8]` |
| Focus ring | `#606C38` | `focus:ring-[#606C38]` |
| White overlay | `white/10` | Sidebar active/hover states |
| Error | `red-500` | Notification badge |

### 1.5 Authentication Model

| Flow | Method | Token | Storage |
|------|--------|-------|---------|
| CEO/Employee login | `POST /api/auth/login` | JWT | `localStorage` via Zustand `auth-store` |
| Admin login | `POST /api/auth/admin/login` | JWT | `localStorage` separate key |
| App switching | `POST /api/auth/switch-app` | Cross-app JWT | Written to target app's localStorage |
| API key (public) | Header `X-API-Key` | SHA-256 hashed | `company_api_keys` table |
| CLI token | AES-256 encrypted | Per-user credential | `cli_credentials` table |
| Invitation | Token URL | 64-char random | `invitations` table |

---

## 2. User-Facing Pages (23 Active Routes)

### 2.1 COMMAND Group

#### 2.1.1 Hub (`/hub` — `pages/hub/index.tsx`)

**Purpose:** Primary AI command interface. CEO sends commands to agents; agents respond via streaming.

**Layout:** Conditional — checks `hasSecretary`:

**Mode A — With Secretary:**
```
┌──────────────────────────────────────────────────────────┐
│ SecretaryHubLayout (full-width)                          │
│ ┌──────────┬─────────────────────────────────────────┐   │
│ │ Session  │  Chat Area (secretary auto-routing)     │   │
│ │ Sidebar  │  - Message thread                       │   │
│ │ w-280px  │  - Command input (bottom)               │   │
│ │          │  - Handoff tracker (side overlay)        │   │
│ └──────────┴─────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Mode B — Without Secretary:**
```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────────────┬─────────────────────────────────┐   │
│ │ AgentPickerPanel │  ChatArea                       │   │
│ │ w-320px          │  flex-1                         │   │
│ │                  │                                 │   │
│ │ - Dept filter    │  - Selected agent chat          │   │
│ │ - Agent cards    │  - Command input                │   │
│ │ - Search         │  - Streaming responses          │   │
│ └──────────────────┴─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Natural language command input with `@mention` (agent targeting), `/slash` commands (8 types), preset shortcuts
- SSE streaming responses (`POST /api/workspace/hub/stream`)
- Handoff tracker sidebar (`hub/handoff-tracker.tsx`) — real-time delegation chain visualization
- Session sidebar (`hub/session-sidebar.tsx`) — conversation history per session
- File attachment support
- Markdown rendering of agent responses
- Pipeline visualization for multi-step orchestration

**API Endpoints:**
- `POST /api/workspace/hub/stream` — SSE streaming agent execution
- `GET /api/workspace/chat/sessions` — session list
- `POST /api/workspace/chat/sessions` — create session
- `PATCH /api/workspace/chat/sessions/:id` — rename session
- `DELETE /api/workspace/chat/sessions/:id` — delete session
- `GET /api/workspace/chat/sessions/:id/messages` — message history (paginated via `?before=&limit=`)
- `GET /api/workspace/chat/sessions/:id/delegations` — delegation chain
- `GET /api/workspace/chat/sessions/:id/tool-calls` — tool usage log
- `POST /api/workspace/chat/sessions/:id/cancel` — abort running task

**Real-time:** SSE for agent streaming + WebSocket for handoff status updates

**Component Files:** `hub/index.tsx`, `hub/secretary-hub-layout.tsx`, `hub/session-sidebar.tsx`, `hub/handoff-tracker.tsx`

---

#### 2.1.2 Dashboard (`/dashboard` — `pages/dashboard.tsx`)

**Purpose:** Central workspace overview — metrics, AI usage, budget, quick actions, satisfaction.

**Layout:** Grid of metric cards + charts

**Key Features:**
- Summary cards: today's tasks (total/completed/in-progress), today's cost ($X.XXXX), agent count, integration status
- AI usage bar chart by provider (Anthropic `#d97706` / OpenAI `#10b981` / Google `#6366f1`)
- Budget progress bar (green → yellow → red gradient)
- Quick action buttons (routine + system commands)
- CEO satisfaction donut chart (thumbs up/down feedback)
- Custom CSS pulse animations for live data

**API Endpoints:**
- `GET /api/workspace/dashboard/summary` — overview metrics
- `GET /api/workspace/dashboard/usage` — provider-level API call counts
- `GET /api/workspace/dashboard/budget` — daily/monthly limits + current spend
- `GET /api/workspace/dashboard/costs` — cost breakdown
- `GET /api/workspace/dashboard/costs/daily` — daily trend
- `GET /api/workspace/dashboard/costs/by-agent` — per-agent costs
- `GET /api/workspace/dashboard/costs/by-tier` — per-tier costs
- `GET /api/workspace/dashboard/agents` — agent status summary
- `GET /api/workspace/dashboard/stats` — system stats
- `GET /api/workspace/dashboard/quick-actions` — saved quick actions
- `PUT /api/workspace/dashboard/quick-actions` — update quick actions
- `GET /api/workspace/dashboard/satisfaction` — feedback metrics

**Real-time:** WebSocket via `useDashboardWs` hook — live metric updates

---

#### 2.1.3 NEXUS (`/nexus` — `pages/nexus.tsx`)

**Purpose:** Visual org chart editor using React Flow — hierarchical view of departments, agents, and reporting lines.

**Layout:** Full-canvas React Flow editor with info panel overlay

**Key Features:**
- React Flow canvas with custom node types: `CompanyNode`, `DepartmentNode`, `AgentNode`
- Drag-and-drop repositioning
- Agent status indicators (online/working/error/offline)
- Info panel for selected node details
- Layout persistence (save/load positions)
- Export capability

**API Endpoints:**
- `GET /api/workspace/org-chart` — full org hierarchy
- `GET /api/workspace/nexus/org-data` — detailed org data
- `GET /api/workspace/nexus/layout` — saved positions
- `PUT /api/workspace/nexus/layout` — save positions
- `GET /api/workspace/nexus/graph` — graph structure
- `PATCH /api/workspace/nexus/graph` — update graph
- `GET /api/workspace/nexus/workflows` — NEXUS workflows
- `POST /api/workspace/nexus/workflows` — create workflow
- `POST /api/workspace/nexus/workflows/:id/execute` — run workflow

**Real-time:** None (manual refresh)

---

#### 2.1.4 Chat (`/chat` — `pages/chat.tsx`)

**Purpose:** Multi-session direct chat with individual agents (bypass secretary routing).

**Layout:** 3-column — session list (left) + chat area (center) + agent list modal

**Key Features:**
- Multi-session management (create/rename/delete)
- Agent selection modal for new sessions
- Message streaming with markdown rendering
- Session-scoped conversation history
- Agent avatar and status display

**API Endpoints:** Same as Hub chat session endpoints + `POST /api/workspace/chat/sessions/:id/messages`

**Real-time:** SSE streaming for agent responses

---

### 2.2 ORGANIZATION Group

#### 2.2.1 Agents (`/agents` — `pages/agents.tsx`)

**Purpose:** AI agent management — create, edit, delete agents with full CRUD.

**Layout:** Card grid/list with creation modal

**Key Features:**
- Agent form: name, role, department, tier, model, soul (markdown editor), allowed tools
- Soul preview (`POST /agents/:id/soul-preview`) — rendered system prompt preview
- Department filter
- Status display (online/working/error/offline)
- Tier badge visualization

**API Endpoints:**
- `GET /api/workspace/agents` — list all
- `GET /api/workspace/agents/:id` — detail
- `POST /api/workspace/agents` — create
- `PATCH /api/workspace/agents/:id` — update
- `DELETE /api/workspace/agents/:id` — delete
- `PATCH /api/workspace/agents/:id/soul` — update soul only
- `POST /api/workspace/agents/:id/soul/reset` — reset to adminSoul
- `GET /api/workspace/agents/hierarchy` — tree view
- `GET /api/workspace/agents/delegation-rules` — routing rules
- `POST /api/workspace/agents/delegation-rules` — create rule
- `DELETE /api/workspace/agents/delegation-rules/:id` — delete rule

**Real-time:** None

---

#### 2.2.2 Departments (`/departments` — `pages/departments.tsx`)

**Purpose:** Organization structure management with cascade deletion analysis.

**Layout:** List/card view with create/edit modals

**Key Features:**
- Department CRUD (name, description, active toggle)
- Cascade analysis modal — shows affected agents before deletion
- Agent count per department
- Department-agent breakdown view

**API Endpoints:**
- `GET /api/workspace/departments` — list
- `GET /api/workspace/departments/:id` — detail
- `GET /api/workspace/departments/:id/cascade-analysis` — impact analysis
- `POST /api/workspace/departments` — create
- `PATCH /api/workspace/departments/:id` — update
- `DELETE /api/workspace/departments/:id` — delete

**Real-time:** None

---

#### 2.2.3 Jobs (`/jobs` — `pages/jobs.tsx`)

**Purpose:** Night job scheduling, ARGOS triggers, cron management, and job chains.

**Layout:** Tabbed interface — Jobs queue + Schedules + Triggers + Chains

**Key Features:**
- Job queue with status tracking (queued/processing/completed/failed/blocked)
- Schedule editor with cron expression builder + presets (daily 9am, daily 6pm, weekly Mon 10am)
- ARGOS trigger builder (event-based with cooldown)
- Job chaining (sequential execution via parentJobId/chainId)
- Notification badges for completed/failed jobs

**API Endpoints:**
- `POST /api/workspace/jobs` — create job
- `GET /api/workspace/jobs` — list jobs
- `GET /api/workspace/jobs/notifications` — job notifications
- `PUT /api/workspace/jobs/:id/read` — mark read
- `PUT /api/workspace/jobs/read-all` — mark all read
- `DELETE /api/workspace/jobs/:id` — delete
- `POST /api/workspace/jobs/chain` — create chain
- `DELETE /api/workspace/jobs/chain/:chainId` — delete chain
- `GET /api/workspace/schedules` — list schedules
- `POST /api/workspace/schedules` — create schedule
- `PATCH /api/workspace/schedules/:id` — update
- `PATCH /api/workspace/schedules/:id/toggle` — enable/disable
- `DELETE /api/workspace/schedules/:id` — delete
- `GET /api/workspace/schedules/:id/runs` — execution history
- `GET /api/workspace/argos/status` — ARGOS system status
- `GET /api/workspace/argos/triggers` — list triggers
- `POST /api/workspace/argos/triggers` — create trigger
- `PATCH /api/workspace/argos/triggers/:id` — update
- `PATCH /api/workspace/argos/triggers/:id/toggle` — enable/disable
- `DELETE /api/workspace/argos/triggers/:id` — delete
- `GET /api/workspace/argos/triggers/:id/events` — trigger events

**Real-time:** WebSocket via `useWsStore` — job status updates

---

#### 2.2.4 Tiers (`/tiers` — `pages/tiers.tsx`)

**Purpose:** N-tier hierarchy configuration — model preferences and tool limits per tier level.

**Layout:** Ordered list with inline editing

**Key Features:**
- Tier CRUD: level number, name, model preference dropdown, max tools
- Drag reorder (`PUT /tier-configs/reorder`)
- Model selection: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5, gpt-5, etc.

**API Endpoints:**
- `GET /api/workspace/tier-configs` — list
- `POST /api/workspace/tier-configs` — create
- `PATCH /api/workspace/tier-configs/:id` — update
- `DELETE /api/workspace/tier-configs/:id` — delete
- `PUT /api/workspace/tier-configs/reorder` — reorder

**Real-time:** None

---

#### 2.2.5 Reports (`/reports` — `pages/reports.tsx`)

**Purpose:** Report creation, submission, and review workflow with comments.

**Layout:** List view with detail modal + markdown editor

**Key Features:**
- Report CRUD with markdown editor
- Submission workflow: draft → submitted → reviewed
- Comment thread per report
- Share to conversation (cross-feature)
- PDF download
- Route param support: `/reports/:id` for deep linking

**API Endpoints:**
- `GET /api/workspace/reports` — list
- `POST /api/workspace/reports` — create
- `GET /api/workspace/reports/:id` — detail
- `PUT /api/workspace/reports/:id` — update
- `POST /api/workspace/reports/:id/submit` — submit
- `POST /api/workspace/reports/:id/review` — review
- `DELETE /api/workspace/reports/:id` — delete
- `GET /api/workspace/reports/:id/comments` — comments
- `POST /api/workspace/reports/:id/comments` — add comment
- `GET /api/workspace/reports/:id/download` — PDF

**Real-time:** None

---

### 2.3 TOOLS Group

#### 2.3.1 Workflows (`/workflows` — `pages/workflows.tsx`)

**Purpose:** Workflow builder and execution management.

**Layout:** List + step editor + execution history panel

**Key Features:**
- Workflow CRUD with multi-step definition
- Step editor (data collection → analysis → report generation)
- Execution tracking (currentStep, done, error)
- AI-generated workflow suggestions (accept/reject)
- Workflow analysis

**API Endpoints:**
- `GET /api/workspace/workflows` — list
- `POST /api/workspace/workflows` — create
- `GET /api/workspace/workflows/:id` — detail
- `DELETE /api/workspace/workflows/:id` — delete
- `POST /api/workspace/workflows/:id/execute` — run
- `POST /api/workspace/workflows/analyze` — AI analysis
- `POST /api/workspace/workflows/suggestions/:id/accept` — accept suggestion
- `POST /api/workspace/workflows/suggestions/:id/reject` — reject suggestion

**Real-time:** None

---

#### 2.3.2 SNS (`/sns` — `pages/sns.tsx`)

**Purpose:** Multi-platform social media management — content creation, approval, scheduling, publishing.

**Layout:** 5-tab interface — Content Library + Queue + Card News + Stats + Accounts

**Key Features:**
- AI-generated content (text + image generation)
- Platform support: Instagram, Tistory, Daum Cafe, Twitter, Facebook, Naver Blog
- Approval workflow: draft → pending → approved/rejected → scheduled → published
- Card news series (5-10 slide batches)
- A/B variant testing
- Scheduling queue with batch operations
- Publishing engine integration
- Per-account stats

**API Endpoints:** 35+ endpoints under `/api/workspace/sns/*` and `/api/workspace/sns-accounts/*`

**Real-time:** None

---

#### 2.3.3 Trading (`/trading` — `pages/trading.tsx`)

**Purpose:** Stock trading strategy interface — portfolio, watchlist, chart, and AI analysis.

**Layout:** 4-panel complex layout:
```
┌──────────────┬────────────────────────────┬──────────────┐
│ StockSidebar │     ChartPanel             │ Comparison   │
│ w-280px      │     flex-1                 │ Panel        │
│              │                            │ w-320px      │
│ - Watchlist  ├────────────────────────────┤              │
│ - Portfolio  │     ChatPanel              │ - Side-by-   │
│ - Filters    │     (AI analysis chat)     │   side view  │
│              │     h-[40%]                │              │
└──────────────┴────────────────────────────┴──────────────┘
```
**Responsive:** On mobile (`<lg`), collapses to single-column with tab navigation between panels.

**Key Features:**
- Watchlist with drag-sort and market filter (KR/US)
- Stock chart integration
- AI-powered analysis chat (CIO agent)
- Portfolio dashboard (cash, holdings, P&L)
- Paper trading mode with initial capital setting
- Order management (pending approval, bulk approve/reject)
- Backtest results
- Strategy notes with sharing

**API Endpoints:** 20+ endpoints under `/api/workspace/strategy/*`

**Real-time:** None (manual refresh for prices)

---

#### 2.3.4 Messenger (`/messenger` — `pages/messenger.tsx`)

**Purpose:** Internal team communication — channels, threads, reactions, file sharing.

**Layout:** 3-column Discord-style:
```
┌──────────────┬────────────────────────────┬──────────────┐
│ Channel List │     Message Area           │ Member List  │
│ w-240px      │     flex-1                 │ w-200px      │
│              │                            │              │
│ - Channels   │  - Message bubbles         │ - Online     │
│ - DMs        │  - Thread replies          │ - Offline    │
│ - Unread     │  - Reactions               │ - Roles      │
│   badges     │  - Composer (bottom)       │              │
└──────────────┴────────────────────────────┴──────────────┘
```
**Responsive:** On mobile (`<lg`), channel list becomes overlay drawer, member list hidden.

**Key Features:**
- Channel CRUD (create/rename/delete)
- Real-time messaging
- Thread replies
- Emoji reactions (unique per user+emoji)
- File attachment + download
- Online status indicators
- Unread count tracking
- Search across messages

**API Endpoints:** 17+ endpoints under `/api/workspace/messenger/*`

**Real-time:** WebSocket channel `messenger::{channelId}` — live messages, typing indicators

---

#### 2.3.5 Library / Knowledge (`/knowledge` — `pages/knowledge.tsx`)

**Purpose:** RAG document storage with semantic search, versioning, and agent memory injection.

**Layout:** Folder tree (left) + document list/editor (center) + version history (right)

**Key Features:**
- Nested folder structure with department assignment
- Document CRUD with markdown editor
- File upload (drag & drop)
- Semantic search via pgvector embeddings
- Similar document discovery
- Version history with restore
- Tag management
- Agent memory CRUD (learning, insight, preference, fact types)
- Memory consolidation per agent
- Knowledge injection preview (what gets injected into agent's Soul)
- Template-based document creation

**API Endpoints:** 30+ endpoints under `/api/workspace/knowledge/*`

**Real-time:** None

---

#### 2.3.6 AGORA (`/agora` — `pages/agora.tsx`)

**Purpose:** AI debate platform — multi-agent round-based discussions with consensus tracking.

**Layout:** Debate list (left) + timeline (center) + info panel (right)

**Key Features:**
- Debate creation with topic and participant selection
- 2-round (regular) or 3-round (deep) debate types
- Timeline view of speeches per round
- Consensus result: consensus / dissent / partial
- Key arguments extraction
- Create debate modal with agent selection

**API Endpoints:**
- `POST /api/workspace/debates` — create
- `POST /api/workspace/debates/:id/start` — start
- `GET /api/workspace/debates` — list
- `GET /api/workspace/debates/:id` — detail
- `GET /api/workspace/debates/:id/timeline` — timeline

**Real-time:** 5-second polling for in-progress debates via `refetchInterval`

---

#### 2.3.7 Files (`/files` — `pages/files.tsx`)

**Purpose:** File storage and management with type-based filtering.

**Layout:** File list with upload area

**Key Features:**
- File upload (multi-file)
- Type-based icons and metadata display
- Download + delete
- Company-scoped file isolation

**API Endpoints:**
- `POST /api/workspace/files` — upload
- `GET /api/workspace/files` — list
- `GET /api/workspace/files/:id/download` — download
- `DELETE /api/workspace/files/:id` — delete

**Real-time:** None

---

### 2.4 SYSTEM Group

#### 2.4.1 Costs (`/costs` — `pages/costs.tsx`)

**Purpose:** Cost analysis and budget tracking dashboard.

**Layout:** Summary cards + chart panels

**Key Features:**
- Total cost display (today / month / all-time)
- Budget progress bars (daily + monthly limits)
- Daily cost trend line chart
- Per-agent cost breakdown (donut/bar chart)
- Per-model cost breakdown

**API Endpoints:**
- `GET /api/workspace/dashboard/costs` — summary
- `GET /api/workspace/dashboard/costs/daily` — daily trend
- `GET /api/workspace/dashboard/costs/by-agent` — agent breakdown
- `GET /api/workspace/dashboard/budget` — budget limits

**Real-time:** None

---

#### 2.4.2 Performance (`/performance` — `pages/performance.tsx`)

**Purpose:** Agent analytics — soul gym suggestions, quality dashboard, performance metrics.

**Layout:** Summary cards + agent list + detail modal

**Key Features:**
- Performance summary: total reviews, pass rate, average score
- Per-agent metrics: call count, success rate, avg cost, avg time
- Soul Gym: AI-generated improvement suggestions per agent
- Apply/dismiss suggestions
- Quality dashboard with period and department filters

**API Endpoints:**
- `GET /api/workspace/performance/summary` — overview
- `GET /api/workspace/performance/agents` — agent list
- `GET /api/workspace/performance/agents/:id` — detail
- `GET /api/workspace/performance/soul-gym` — suggestions
- `POST /api/workspace/performance/soul-gym/:id/apply` — apply
- `POST /api/workspace/performance/soul-gym/:id/dismiss` — dismiss
- `GET /api/workspace/quality-dashboard` — quality metrics

**Real-time:** None

---

#### 2.4.3 Activity Log (`/activity-log` — `pages/activity-log.tsx`)

**Purpose:** Real-time monitoring of agent activity, delegations, quality reviews, tool calls, and security alerts.

**Layout:** 5-tab interface — Agents + Delegations + Quality + Tools + Security Alerts

**Key Features:**
- Tabbed log viewer with per-tab filters
- WebSocket connection status indicator
- Agent activity stream (start/end/error phases)
- Delegation chain tracking (from → to, message, cost, tokens)
- QA review results (pass/fail with scores)
- Tool call logs (name, input, output, duration)
- Security alert feed

**API Endpoints:**
- `GET /api/workspace/activity/agents` — agent logs
- `GET /api/workspace/activity/delegations` — delegation logs
- `GET /api/workspace/activity/quality` — QA logs
- `GET /api/workspace/activity/tools` — tool call logs
- `GET /api/workspace/activity/security-alerts` — security logs

**Real-time:** WebSocket via `useActivityWs` hook — live log streaming

---

#### 2.4.4 Ops Log (`/ops-log` — `pages/ops-log.tsx`)

**Purpose:** Complete operation history with bookmarks, search, and export.

**Layout:** Operation list + detail modal

**Key Features:**
- Full operation history (all CEO commands + results)
- Search and date/status filters
- Bookmark management
- Export to file
- Detail view with full command/response

**API Endpoints:**
- `GET /api/workspace/operation-log` — list
- `GET /api/workspace/operation-log/:id` — detail
- `GET /api/workspace/operation-log/export` — export
- `GET /api/workspace/operation-log/bookmarks` — bookmarks
- `POST /api/workspace/operation-log/bookmarks` — add bookmark
- `PATCH /api/workspace/operation-log/bookmarks/:id` — update
- `DELETE /api/workspace/operation-log/bookmarks/:id` — delete

**Real-time:** None

---

#### 2.4.5 Classified (`/classified` — `pages/classified.tsx`)

**Purpose:** Classified document archive with security levels and folder organization.

**Layout:** Folder tree + document list with classification filter

**Key Features:**
- Folder-based archive organization
- Security classification levels
- Similar document discovery
- Archive stats
- CRUD operations

**API Endpoints:**
- `GET /api/workspace/archive` — list
- `POST /api/workspace/archive` — create
- `GET /api/workspace/archive/:id` — detail
- `GET /api/workspace/archive/:id/similar` — similar docs
- `PATCH /api/workspace/archive/:id` — update
- `DELETE /api/workspace/archive/:id` — delete
- `GET /api/workspace/archive/stats` — stats
- `GET /api/workspace/archive/folders` — folders
- `POST /api/workspace/archive/folders` — create folder
- `PATCH /api/workspace/archive/folders/:id` — update folder
- `DELETE /api/workspace/archive/folders/:id` — delete folder

**Real-time:** None

---

#### 2.4.6 Settings (`/settings` — `pages/settings.tsx`)

**Purpose:** User profile, API keys, Telegram, MCP servers, notification preferences.

**Layout:** Multi-section settings page (vertically stacked sections or tabs)

**Key Features:**
- Profile editing (name, email, password)
- API key management (provider credentials: KIS, Notion, Telegram, etc.)
- Telegram bot configuration + test
- MCP server management (add/remove/test external tool servers)
- Notification preferences (in-app, email, push per event type)
- Soul editor (personal secretary soul customization)
- App switching (CEO ↔ Admin console)

**API Endpoints:**
- `GET/PATCH /api/workspace/profile` — profile
- `GET/POST/DELETE /api/workspace/profile/api-keys` — API keys
- `GET/POST /api/workspace/telegram/config` — Telegram
- `POST /api/workspace/telegram/test` — test bot
- `GET/POST/DELETE /api/workspace/settings/mcp` — MCP servers
- `POST /api/workspace/settings/mcp/test` — test MCP
- `GET/PUT /api/workspace/notification-prefs` — notification prefs
- `GET /api/auth/can-switch-admin` — switch check
- `POST /api/auth/switch-app` — switch app

**Real-time:** None

---

#### 2.4.7 Notifications (`/notifications` — `pages/notifications.tsx`)

**Purpose:** Unified notification center.

**Layout:** Notification list with category grouping

**Key Features:**
- Category-based styling (chat_complete, delegation_complete, tool_error, job_complete, system)
- Unread filter
- Mark as read (individual + all)
- Action URL navigation
- Unread count badge (sidebar + topbar)

**API Endpoints:**
- `GET /api/workspace/notifications` — list (paginated, `?filter=unread`)
- `GET /api/workspace/notifications/count` — unread count (30s polling)
- `PATCH /api/workspace/notifications/:id/read` — mark read
- `POST /api/workspace/notifications/read-all` — mark all read

**Real-time:** WebSocket via `useWsStore` — push notifications

---

### 2.5 Special Pages (Not in Sidebar)

| Route | File | Purpose |
|-------|------|---------|
| `/login` | `pages/login.tsx` | JWT authentication form |
| `/onboarding` | `pages/onboarding.tsx` | First-time setup wizard (template selection) |
| `/notifications` | `pages/notifications.tsx` | Topbar bell icon only — not in sidebar navSections |
| `/command-center` | `pages/command-center/index.tsx` | Legacy hub (redirects to `/hub`) |

### 2.6 Active Redirects

| From | To | Method |
|------|-----|--------|
| `/` | `/hub` | `<Navigate replace>` |
| `/command-center` | `/hub` | `<Navigate replace>` |
| `/org` | `/nexus` | `<Navigate replace>` |
| `/cron` | `/jobs` | `<Navigate replace>` |
| `/argos` | `/jobs` | `<Navigate replace>` |

---

## 2B. Admin Console Pages (27 Pages — `packages/admin/`)

The Admin Console is a separate React SPA (`packages/admin/`) with its own layout, sidebar, and auth (admin JWT). It shares the same Natural Organic theme (olive sidebar `bg-[#283618]`, cream content `bg-[#faf8f5]`).

### 2B.1 Admin Sidebar (21 Items)

| Section | Items |
|---------|-------|
| OVERVIEW | Dashboard |
| ORGANIZATION | Companies, Employees, Users, Departments, Report Lines |
| AI AGENTS | Agents, Soul Templates, Org Templates, Agent Marketplace |
| TOOLS & CONFIG | Tools, Credentials (CLI/API), Public API Keys, MCP Servers, MCP Access, MCP Credentials |
| MONITORING | Costs, System Monitoring, Agent Reports |
| VISUALIZATION | NEXUS Org Chart, SketchVibe |
| AUTOMATION | Workflows, Template Market |
| FOOTER | Company Settings, CEO App Switch |

### 2B.2 Admin Pages Summary

**Authentication & Onboarding:**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/login` | `login.tsx` | Admin login | Username/password, admin JWT |
| `/onboarding` | `onboarding.tsx` | Company setup wizard | Company info → API keys → departments → employees |

**Organization Management (5 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/` | `dashboard.tsx` | Admin overview | User count, agent count, dept count, system health cards |
| `/companies` | `companies.tsx` | Multi-company CRUD | Create/edit/delete companies, user/agent stats |
| `/departments` | `departments.tsx` | Department CRUD | Cascade analysis (agents per dept, cost breakdown) |
| `/employees` | `employees.tsx` | Employee management | Assignment, bulk actions, dept/status filter |
| `/users` | `users.tsx` | User account CRUD | Role assignment, password reset, pagination |
| `/report-lines` | `report-lines.tsx` | Reporting hierarchy | Manager assignment per user |

**AI Agent Management (4 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/agents` | `agents.tsx` | Agent CRUD | Tier selection, model dropdown, soul assignment |
| `/soul-templates` | `soul-templates.tsx` | Soul template library | Publish/unpublish, category tags, download count |
| `/org-templates` | `org-templates.tsx` | Org structure templates | Pre-built dept+agent configs, apply to company |
| `/agent-marketplace` | `agent-marketplace.tsx` | Template browser | Published souls by tier, detail view |

**System Configuration (4 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/credentials` | `credentials.tsx` | CLI/API key management | Per-user token management |
| `/api-keys` | `api-keys.tsx` | Public API keys | Scopes, rate limits, expiry, rotation |
| `/tools` | `tools.tsx` | Tool catalog | Category filter (common/finance/legal/marketing/tech), agent assignment |
| `/settings` | `settings.tsx` | Company settings | Name, slug, API providers, handoff depth |

**MCP Integration (3 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/mcp-servers` | `mcp-servers.tsx` | MCP server CRUD | Stdio/HTTP transport, connection test (green/red), tool detection |
| `/mcp-access` | `mcp-access.tsx` | Agent-MCP access matrix | Checkbox grid (agent × server), default OFF |
| `/mcp-credentials` | `mcp-credentials.tsx` | MCP credential store | AES-256-GCM encrypted, masked display |

**Monitoring & Analytics (3 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/costs` | `costs.tsx` | Cost analytics | Summary, by-agent, by-model, by-dept, daily trend, budget config |
| `/monitoring` | `monitoring.tsx` | System health | Uptime, memory/CPU, DB response time, error count, recent logs |
| `/agent-reports` | `agent-reports.tsx` | AI reports viewer | Read-only (competitor analysis, market research, AI analysis) |

**Visualization (2 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/nexus` | `nexus.tsx` | Org chart editor | React Flow, drag-drop agents, dept reassignment, zoom/pan |
| `/sketchvibe` | `sketchvibe.tsx` | Code analysis canvas | MCP CLI integration (Phase 4 planned) |

**Automation (2 pages):**

| Route | File | Purpose | Key Features |
|-------|------|---------|--------------|
| `/workflows` | `workflows.tsx` | Workflow CRUD | Visual canvas editor, execution history, AI suggestions |
| `/template-market` | `template-market.tsx` | Template browser | Org template import/download |

---

## 2C. Empty, Error, and Loading States

Every page must handle these states. Current implementation patterns:

### 2C.1 Loading States

| Pattern | Current Implementation | Components |
|---------|----------------------|------------|
| Page skeleton | `<PageSkeleton />` — Suspense fallback | `Skeleton` from `@corthex/ui` (animated pulse) |
| Data loading | React Query `isLoading` → shimmer cards or spinner | Per-page implementation |
| Streaming | SSE placeholder → content fills progressively | Hub/Chat pages |

### 2C.2 Empty States (Zero-Data)

| Context | Expected Behavior | Redesign Impact |
|---------|-------------------|-----------------|
| No agents created | Empty illustration + "Create your first agent" CTA | High — first-time UX |
| No departments | Empty state + "Create department" CTA | High |
| No chat sessions | Welcome message + agent picker prompt | High — Hub is primary entry |
| No jobs/schedules | Empty card + "Schedule your first job" | Medium |
| No knowledge docs | Empty folder tree + "Upload or create" | Medium |
| No notifications | "All caught up" message | Low |
| No reports | Empty list + "Create report" CTA | Medium |
| No messenger channels | "Create a channel to start chatting" | Medium |
| No watchlist items | "Add stocks to watch" + search prompt | Medium |
| No workflows | "Create a workflow" CTA | Medium |
| Dashboard with 0 data | Cards showing $0.00, 0 agents, 0 tasks (not empty — shows zeros) | Low |
| No debate history | "Start a debate" CTA | Low |

### 2C.3 Error States

| Error Type | Current Pattern | Redesign Needs |
|-----------|-----------------|----------------|
| API error (4xx/5xx) | Toast notification via `ToastProvider` | Consistent error card with retry action |
| WebSocket disconnect | Status indicator dot in Activity Log | Global reconnect indicator (topbar or toast) |
| Auth expired (401) | Redirect to `/login` with `?redirect=` | Session expiry warning before hard redirect |
| Rate limit | Toast error message | Backoff indicator with countdown |
| Network offline | No current handling | Offline banner + cached data indication |
| Page-level crash | No error boundary in CEO app | `PageErrorBoundary` (Admin has one, CEO app does not) |

### 2C.4 Transition States

| State | Behavior |
|-------|----------|
| Agent processing | Pulse animation + elapsed time display (Hub) |
| Delegation chain | Step-by-step progress visualization (Handoff Tracker) |
| File uploading | Progress bar |
| Debate in progress | 5s polling with round counter |
| Job executing | Status badge: queued → processing → completed/failed |

---

## 2D. Navigation IA Analysis

### 2D.1 Current IA Concern: 22-Item Sidebar

The CEO app sidebar has **22 navigation items** across 4 sections. This exceeds the 7±2 cognitive load threshold per section. Analysis:

| Section | Items | Concern |
|---------|-------|---------|
| COMMAND | 4 | Acceptable |
| ORGANIZATION | 5 | Acceptable |
| TOOLS | 7 | At threshold — 7 items requires scanning |
| SYSTEM | 6 | Above threshold — low-frequency pages mixed with daily-use |

### 2D.2 v3 FR-UX Page Consolidation Plan

PRD FR-UX specifies 23→6 group consolidation (existing routes preserved via redirects):

| Group | Merged Pages | Primary Route |
|-------|-------------|---------------|
| Hub (Command) | Hub + Chat | `/hub` |
| Operations | Jobs + Activity Log + Ops Log | `/jobs` or `/operations` |
| Organization | Agents + Departments + Tiers + NEXUS | `/organization` |
| Intelligence | Knowledge + Performance + Classified | `/intelligence` |
| Strategy | Trading + SNS + Workflows | `/strategy` |
| System | Costs + Settings + Notifications | `/system` |

### 2D.3 Usage Frequency Tiers (Estimated)

| Frequency | Pages | Redesign Priority |
|-----------|-------|-------------------|
| Daily | Hub, Dashboard, Chat, Notifications, Messenger | P0 — optimize for speed |
| Weekly | Jobs, Agents, Reports, Activity Log, Knowledge | P1 — optimize for efficiency |
| Monthly | Departments, Tiers, SNS, Trading, Performance, Costs, Settings | P2 — optimize for discoverability |
| Rare | Workflows, AGORA, Files, Classified, Ops Log, NEXUS | P3 — accessible but not prominent |

---

## 3. API Endpoint Map

### 3.1 Summary Statistics

| Domain | Prefix | Route Files | Endpoint Count |
|--------|--------|-------------|----------------|
| Auth | `/api/auth` | 1 | 8 |
| Health | `/api/health` | 1 | 1 |
| Onboarding | `/api/onboarding` | 1 | 4 |
| Commands | `/api/workspace/commands` | 1 | 3 |
| Admin | `/api/admin` | 24 | ~150 |
| Workspace | `/api/workspace` | 51 | ~280 |
| Public API | `/api/v1` | 1 | 4 |
| Super Admin | `/api/super-admin` | 1 | 5 |
| Telegram Webhook | `/api/telegram/webhook` | 1 | 1 |
| WebSocket | `/ws` | 1 | 1 (upgrade) |
| **Total** | — | **~83** | **~450+** |

### 3.2 API Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

### 3.3 Middleware Stack

| Middleware | Scope | Purpose |
|-----------|-------|---------|
| `authMiddleware` | Workspace routes | JWT validation, sets `c.set('userId', ...)` and `c.set('companyId', ...)` |
| `adminAuthMiddleware` | Admin routes | Admin JWT validation |
| `tenantMiddleware` | Select routes | Ensures companyId isolation on queries |
| `superAdminMiddleware` | Super admin routes | Superadmin role check |
| `apiKeyMiddleware` | Public API routes | API key + scope validation |

---

## 4. Data Model

### 4.1 Table Inventory (50+ Tables)

**Core Identity (6 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 1 | `companies` | Tenant root | id, name, slug, settings(JSONB), smtpConfig |
| 2 | `users` | Human users (CEO/employees) | id, companyId, username, passwordHash, role(admin/user) |
| 2a | `admin_users` | Admin console users | id, companyId(nullable=superadmin), role(superadmin/admin) |
| 2b | `sessions` | User JWT sessions | userId, companyId, token, expiresAt |
| 2c | `admin_sessions` | Admin JWT sessions | adminUserId, token, expiresAt |
| 2d | `invitations` | Employee invitations | companyId, email, token(64), status(pending/accepted/expired/revoked) |

**Organization (6 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 2e | `employee_departments` | User-department mapping | userId, departmentId (unique pair) |
| 3 | `departments` | Departments | companyId, name, description, isActive |
| 4 | `agents` | AI agents | companyId, departmentId, name, tier(enum), tierLevel(int), modelName, soul(text), reportTo, ownerUserId, isSecretary, allowedTools(JSONB), autoLearn, enableSemanticCache |
| 4a | `tier_configs` | Per-company tier settings | companyId, tierLevel, name, modelPreference, maxTools |
| 4b | `notification_preferences` | Per-user notification settings | userId, inApp, email, push, settings(JSONB) |
| 5 | `cli_credentials` | CLI tokens (AES-256) | companyId, userId, encryptedToken |

**Credentials & Security (4 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 6 | `api_keys` | External API credentials | companyId, provider, credentials(JSONB encrypted), scope(company/user) |
| P1-6 | `audit_logs` | Immutable audit trail (INSERT ONLY) | companyId, actorType, action, targetType, before/after(JSONB) |
| P3-20 | `company_api_keys` | Public API keys (SHA-256) | companyId, keyHash, scopes, rateLimitPerMin |
| 31 | `push_subscriptions` | Web Push endpoints | companyId, userId, endpoint, p256dh, auth |

**Chat & Communication (10 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 7 | `chat_sessions` | AI chat sessions | companyId, userId, agentId, title |
| 8 | `chat_messages` | Chat message history | sessionId, sender(user/agent), content, attachmentIds |
| 13 | `delegations` | Secretary delegation chain | sessionId, secretaryAgentId, targetAgentId, parentDelegationId, depth |
| 23 | `messenger_channels` | Internal messenger channels | companyId, name, createdBy |
| 24 | `messenger_members` | Channel membership | channelId, userId, lastReadAt |
| 25 | `messenger_messages` | Channel messages | channelId, userId, parentMessageId, content, attachmentIds |
| 25a | `messenger_reactions` | Message reactions | messageId, userId, emoji (unique triple) |
| 25b | `conversations` | 1:1/group conversations | companyId, type(direct/group), name |
| 25c | `conversation_participants` | Conversation members | conversationId, userId, lastReadAt |
| 25d | `messages` | Conversation messages | conversationId, senderId, content, type(text/system/ai_report) |

**Orchestration & Jobs (8 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| P1-1 | `commands` | CEO command history | companyId, userId, type(8 enum values), text, status |
| P1-2 | `orchestration_tasks` | Task execution tracking | commandId, agentId, parentTaskId, type(classify/delegate/execute/synthesize/review), status |
| P1-3 | `quality_reviews` | QA gate results | commandId, reviewerAgentId, conclusion(pass/fail), scores(JSONB) |
| P1-4 | `presets` | Command shortcuts | companyId, userId, name, command, category |
| 18 | `night_jobs` | Night job queue | companyId, agentId, instruction, status, parentJobId, chainId |
| 18b | `night_job_schedules` | Cron schedules | cronExpression, nextRunAt, lastRunAt, isActive |
| 18c | `night_job_triggers` | ARGOS event triggers | triggerType, condition(JSONB), cooldownMinutes |
| 18d | `cron_runs` | Cron execution history | cronJobId, status, durationMs, tokensUsed, costMicro |
| 18e | `argos_events` | Trigger event log | triggerId, eventType, status, result |

**Content & Knowledge (8 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 14 | `reports` | Reports | authorId, title, content, status(draft/submitted/reviewed) |
| 15 | `report_comments` | Report comments | reportId, authorId, content |
| K-1 | `knowledge_folders` | Nested folder tree | companyId, name, parentId, departmentId |
| K-2 | `knowledge_docs` | Knowledge documents | folderId, title, content, embedding(VECTOR 768), tags(JSONB) |
| K-2a | `doc_versions` | Document version history | docId, version, title, content, changeNote |
| K-3 | `agent_memories` | Agent learning memories | agentId, memoryType(learning/insight/preference/fact), content |

> **Note:** `agent_memories` does NOT have an `embedding` vector column. Only `knowledge_docs` has `embedding(VECTOR 768)`. Agent memory search is keyword-based, not semantic. v3 Sprint 3 (Agent Memory 3-stage) may add embeddings — verify architecture.md D-series decisions before assuming.
| 16 | `department_knowledge` | Department-scoped knowledge | departmentId, title, content, category |
| 9 | `agent_memory` | Agent key-value memory (legacy) | agentId, key, value, metadata |

**Tools & Integration (5 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 10 | `tool_definitions` | Tool catalog | name, scope(platform/company/department), inputSchema(JSONB), handler |
| 11 | `agent_tools` | Agent-tool mapping | agentId, toolId, isEnabled |
| 17 | `tool_calls` | Tool execution log | agentId, toolName, input, output, status, durationMs |
| 34 | `mcp_servers` | MCP server registry | companyId, name, url, transport(stdio), config |
| 22 | `telegram_configs` | Telegram bot config | companyId, botToken(encrypted), ceoChatId, webhookSecret |

**SNS (2 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 19a | `sns_accounts` | Platform accounts | platform(6 enum values), accountName, credentials(encrypted) |
| 19 | `sns_contents` | Content entries | platform, title, body, status(7 enum values), scheduledAt, variantOf, isCardNews, cardSeriesId |

**Trading (5 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 27 | `strategy_watchlists` | Watchlist items | stockCode, stockName, market, sortOrder |
| 28a | `strategy_notes` | Trading notes | stockCode, title, content |
| 28a-1 | `strategy_note_shares` | Note sharing | noteId, sharedWithUserId |
| 28b | `strategy_backtest_results` | Backtest output | stockCode, strategyType, signals(JSONB), metrics(JSONB) |
| 28c | `strategy_portfolios` | Portfolios | tradingMode(real/paper), initialCash, cashBalance, holdings(JSONB) |
| 28d | `strategy_orders` | Trade orders (permanent) | ticker, side(buy/sell), quantity, price, status(7 enum values), tradingMode |

**System (6 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 20 | `activity_logs` | Activity log (eventId dedup) | type(8 enum values), phase(start/end/error), actorType, action, metadata(JSONB GIN) |
| 20b | `notifications` | User notifications | userId, type, title, body, actionUrl, isRead |
| 21 | `cost_records` | AI cost tracking | agentId, provider, model, inputTokens, outputTokens, costUsdMicro |
| 26 | `files` | File metadata | filename, mimeType, sizeBytes, storagePath |
| 12 | `report_lines` | Reporting structure | reporterId, supervisorId |
| 29 | `agent_delegation_rules` | Routing rules | sourceAgentId, targetAgentId, condition(JSONB), priority |

**Canvas & Templates (6 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 28 | `canvas_layouts` | NEXUS layout persistence | layoutData(JSONB), isDefault |
| 30 | `soul_templates` | Soul template library | name, content, category, isPublished, downloadCount |
| 32 | `nexus_workflows` | NEXUS visual workflows | nodes(JSONB), edges(JSONB) |
| 33 | `nexus_executions` | Workflow execution log | workflowId, status, result(JSONB) |
| 35 | `sketches` | SketchVibe diagrams | graphData(JSONB), knowledgeDocId |
| 35b | `sketch_versions` | Sketch version history | sketchId, version, graphData |

**Evolution (4 tables):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| P1-5 | `org_templates` | Org structure templates | templateData(JSONB), isPublished, downloadCount |
| P2-17 | `soul_gym_rounds` | Soul Gym A/B test rounds | agentId, scoreBefore, scoreAfter, winner, variantsJson |
| P2-18 | `soul_evolution_proposals` | AI improvement proposals | agentId, status(pending/approved/rejected), proposalText |
| P2-19 | `soul_backups` | Soul rollback snapshots | agentId, soulMarkdown, version, source(soul-gym/evolution/manual) |

**AGORA (1 table):**

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| debates | `debates` | Debate sessions | topic, debateType(debate/deep-debate), status, maxRounds, participants(JSONB), rounds(JSONB), result(JSONB), timeline(JSONB) |

### 4.2 Key Relationships

```
companies (tenant root)
├── users → sessions, invitations, employee_departments
│   └── cli_credentials, api_keys, push_subscriptions
├── departments → agents, department_knowledge
│   └── employee_departments
├── agents → chat_sessions → chat_messages, delegations
│   ├── agent_memory, agent_memories, agent_tools
│   ├── orchestration_tasks, quality_reviews
│   ├── tool_calls, cost_records
│   └── soul_gym_rounds, soul_evolution_proposals, soul_backups
├── commands → orchestration_tasks → quality_reviews
├── night_jobs ←→ night_job_schedules ←→ cron_runs
│   └── night_job_triggers ←→ argos_events
├── messenger_channels → messenger_members, messenger_messages → messenger_reactions
├── conversations → conversation_participants, messages
├── knowledge_folders → knowledge_docs → doc_versions
├── tool_definitions → agent_tools
├── sns_accounts → sns_contents
├── strategy_watchlists, strategy_portfolios → strategy_orders
├── debates
├── canvas_layouts, nexus_workflows → nexus_executions
├── sketches → sketch_versions
└── activity_logs, notifications, cost_records, audit_logs, files
```

### 4.3 Multi-Tenancy Pattern

Every table with user data has a `company_id` column indexed. All queries use `getDB(ctx.companyId)` pattern — Drizzle ORM `where(eq(table.companyId, companyId))` enforced at route level via middleware.

---

## 5. Architecture

### 5.1 App Shell Structure

```
┌─────────────────────────────────────────────────────────┐
│                    BrowserRouter                         │
│  ┌──────────┐  ┌──────────────────────────────────────┐ │
│  │          │  │  Desktop Topbar (h-14)               │ │
│  │          │  │  breadcrumb + search + notifications  │ │
│  │  Sidebar │  ├──────────────────────────────────────┤ │
│  │  w-280px │  │                                      │ │
│  │          │  │  <Outlet /> (page content)           │ │
│  │  4 nav   │  │  flex-1 overflow-auto                │ │
│  │  sections│  │                                      │ │
│  │          │  │                                      │ │
│  └──────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Mobile:** Sidebar collapses to hamburger overlay (w-280px slide-in, backdrop-blur).

**Topbar Features:**
- Breadcrumb: "CORTHEX > {pageName}" (click CORTHEX → /dashboard)
- Global search: `Ctrl+K` shortcut (read-only placeholder currently)
- Notification bell with unread badge

### 5.2 Sidebar Navigation (4 Sections, 22 Items)

Notifications is NOT in sidebar — accessible only via topbar bell icon.

| Section | Count | Items |
|---------|-------|-------|
| COMMAND | 4 | Dashboard, 허브(Hub), NEXUS, 채팅(Chat) |
| ORGANIZATION | 5 | 에이전트(Agents), 부서(Departments), 작업(Jobs), 티어(Tiers), 보고서(Reports) |
| TOOLS | 7 | 워크플로우(Workflows), SNS, 전략실(Trading), 메신저(Messenger), 라이브러리(Knowledge), AGORA, 파일(Files) |
| SYSTEM | 6 | 비용(Costs), 전력분석(Performance), 통신로그(Activity Log), 작전일지(Ops Log), 기밀문서(Classified), 설정(Settings) |

**Sidebar Footer:**
- Admin console switch button (conditional on `canSwitch`)
- User avatar + name + role
- Logout button
- Build number display (`#BUILD_NUMBER · HASH`)

### 5.3 Lazy Loading Pattern

All pages use React.lazy + Suspense with `PageSkeleton` fallback:

```tsx
const HubPage = lazy(() => import('./pages/hub').then(m => ({ default: m.HubPage })))

// In routes:
<Route path="hub" element={<Suspense fallback={<PageSkeleton />}><HubPage /></Suspense>} />
```

### 5.4 State Management

#### 5.4.1 Zustand Stores (6 Stores)

| Store | File | Persistence | Key State |
|-------|------|-------------|-----------|
| `auth-store` | `stores/auth-store.ts` | None (JWT in localStorage) | `isAuthenticated`, `user`, `token`, `checkAuth()`, `login()`, `logout()` |
| `activity-store` | `stores/activity-store.ts` | None (in-memory, max 200) | `logs[]`, `addLog()`, `clearLogs()` — activity feed buffer |
| `command-store` | `stores/command-store.ts` | None | `messages[]`, `delegationSteps[]`, `viewMode`, `setViewMode()` — Hub command state |
| `notification-store` | `stores/notification-store.ts` | None (in-memory, max 50) | `notifications[]`, `unreadCount`, `addNotification()`, `markRead()` |
| `theme-store` | `stores/theme-store.ts` | `localStorage` (persisted) | `currentTheme` (5 themes: sovereign/imperial/tactical/mystic/stealth), `setTheme()` |
| `ws-store` | `stores/ws-store.ts` | None | `isConnected`, `channelListeners{}`, `connect()`, `disconnect()`, `subscribe()` — exponential backoff 3s→30s max |

#### 5.4.2 Custom Hooks (11 Hooks)

| Hook | File | Purpose | Dependencies |
|------|------|---------|-------------|
| `useActivityWs` | `hooks/use-activity-ws.ts` | WebSocket → React Query cache invalidation for activity feed | `ws-store`, `react-query` |
| `useAgoraWs` | `hooks/use-agora-ws.ts` | WebSocket for live debate updates | `ws-store` |
| `useAutoSave` | `hooks/use-auto-save.ts` | Auto-save with 30s debounce (SketchVibe) | `setTimeout` |
| `useBudgetAlerts` | `hooks/use-budget-alerts.ts` | Cost WebSocket → budget threshold modal trigger | `ws-store`, modal state |
| `useChatStream` | `hooks/use-chat-stream.ts` | SSE streaming for direct chat page | `EventSource` |
| `useCommandCenter` | `hooks/use-command-center.ts` | Command submission + delegation step tracking | `command-store`, API |
| `useDashboardWs` | `hooks/use-dashboard-ws.ts` | WebSocket → dashboard React Query cache invalidation | `ws-store`, `react-query` |
| `useHubStream` | `hooks/use-hub-stream.ts` | SSE streaming via state machine for Hub page | `useSseStateMachine` |
| `usePresets` | `hooks/use-presets.ts` | Preset CRUD operations | API, `react-query` |
| `useQueries` | `hooks/use-queries.ts` | 13+ React Query bundles (agents, depts, jobs, etc.) | `react-query` |
| `useSseStateMachine` | `hooks/use-sse-state-machine.ts` | FSM: idle→connecting→accepted→processing→streaming→done/error | `EventSource`, `useState` |

#### 5.4.3 Lib Modules (5 Modules)

| Module | File | Purpose |
|--------|------|---------|
| `api` | `lib/api.ts` | Fetch wrapper — auto JWT header, 401→redirect to `/login`, 429→`RateLimitError` |
| `error-messages` | `lib/error-messages.ts` | Error code → Korean translation map (user-facing messages) |
| `canvas-to-mermaid` | `lib/canvas-to-mermaid.ts` | React Flow → Mermaid diagram syntax conversion |
| `mermaid-to-canvas` | `lib/mermaid-to-canvas.ts` | Mermaid syntax → React Flow node/edge conversion |
| `dagre-layout` | `lib/dagre-layout.ts` | Dagre auto-layout for React Flow (NEXUS org chart) |

#### 5.4.4 Server State (React Query)

| Layer | Tool | Usage |
|-------|------|-------|
| Server state | @tanstack/react-query | API data fetching, caching, refetching |
| Page-local state | React `useState` | Form state, modals, filters |

### 5.5 Engine Boundary (E8)

All AI execution goes through `engine/agent-loop.ts` — single file SDK dependency:

```
Hub/Chat/Jobs UI
  → POST /api/workspace/hub/stream (or commands, jobs)
    → route handler → renderSoul() + extraVars
      → engine/agent-loop.ts → messages.create() (SDK)
        → Hooks: PreToolUse, PostToolUse, Stop
          → tool-sanitizer.ts (PreToolResult injection defense)
        → SSE stream back to client
```

Engine public API: `agent-loop.ts` + `types.ts` only. All other engine internals are private.

---

## 6. Real-time Features

### 6.1 WebSocket Channels

Entry point: `GET /ws` (JWT authenticated upgrade)

| Channel | Purpose | Data Shape |
|---------|---------|-----------|
| `activity-log` | Live agent activity events | `{type, phase, actorName, action, detail}` |
| `agent-status` | Agent online/working/error/offline | `{agentId, status, task?}` |
| `notifications` | Push notifications | `{type, title, body, actionUrl}` |
| `night-job` | Job completion/failure | `{jobId, status, result?}` |
| `command` | Command status updates | `{commandId, status, progress?}` |
| `delegation` | Delegation chain events | `{delegationId, status, from, to}` |
| `tool` | Tool execution events | `{toolName, status, durationMs}` |
| `cost` | Real-time cost updates | `{costUsdMicro, model, source}` |
| `argos` | ARGOS trigger events | `{triggerId, eventType, status}` |
| `debate` | Debate progress | `{debateId, roundNum, speakerName}` |
| `dashboard` | Dashboard metric updates | `{type, data}` |
| `messenger::{channelId}` | Per-channel messaging | `{messageId, userId, content}` |
| `budget-alert` | Budget threshold warnings | `{threshold, current, limit}` |

**Total active channels:** 16 (v3 adds `office` = 17)

### 6.2 SSE Streaming

Used for agent response streaming in Hub/Chat:
- `POST /api/workspace/hub/stream` — returns `text/event-stream`
- Events: `agent_start`, `content_delta`, `tool_use`, `delegation_start`, `delegation_end`, `done`
- Done event includes `costUsd` for cost tracking

### 6.3 Polling

| Page | Endpoint | Interval |
|------|----------|----------|
| Notifications count | `GET /notifications/count` | 30s (`refetchInterval`) |
| AGORA debates | `GET /debates/:id` | 5s (only during `in-progress`) |

---

## 7. Design Constraints

### 7.1 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `< 1024px (lg)` | Mobile: sidebar hidden, hamburger menu, stacked topbar |
| `≥ 1024px` | Desktop: sidebar visible (w-280px), horizontal layout |

### 7.2 Typography

| Element | Font | Weight | Current Size |
|---------|------|--------|------|
| Brand "CORTHEX" | Inter | 700 (bold) | 14px (`text-sm`) |
| Brand subtitle | Inter mono | 400 | 10px (`text-[10px]`) |
| Nav section label | Inter mono | 400 | 11px (`text-[11px]`) |
| Nav item | Inter | 400/500 | 14px (`text-sm`) |
| Topbar breadcrumb | Inter | 400/500 | 14px (`text-sm`) |
| Page heading | Inter | 600 (semibold) | Varies by page |
| Body text | Inter | 400 | 14px |
| Code / monospace | JetBrains Mono | 400 | Context-dependent |
| Korean serif | Noto Serif KR | 400/700 | Special use |

### 7.3 Spacing System

| Context | Value |
|---------|-------|
| Sidebar width | 280px (`w-[280px]`) |
| Topbar height | 56px (`h-14`) |
| Sidebar padding | 12px horizontal (`px-3`), 16px vertical (`py-4`) |
| Nav section gap | 24px (`gap-6`) |
| Nav item padding | 12px horizontal (`px-3`), 8px vertical (`py-2`) |
| Nav item gap | 4px (`gap-1`) |
| Icon size (nav) | 20px (`w-5 h-5`) |
| Content padding | 24px (`p-6`) |
| Mobile safe area | `env(safe-area-inset-top)` |
| Border radius (buttons) | 8px (`rounded-lg`) |
| Border radius (avatar) | 50% (`rounded-full`) |

### 7.4 Icon System

Lucide React exclusively. 22 icons currently imported in sidebar:

```
LayoutDashboard, Terminal, MessageSquare, TrendingUp, Users,
Clock, FileText, FolderOpen, Network, Building2, Bot, Layers,
Share2, Send, DollarSign, History, Shield, Lock, BookOpen,
Settings, BarChart3, Workflow, Hexagon, Menu, ChevronRight,
Search, Bell
```

### 7.5 Component Library

#### 7.5a Shared Components (`packages/ui` = `@corthex/ui`)

- `Skeleton` — loading placeholder (animated pulse)
- `ToastProvider` — toast notification context

#### 7.5b Subframe Component Library (44 Components — Migration Required)

> **DEPRECATION:** Confirmed Decisions Stage 1 #4 mandates Subframe → Stitch 2 migration. 40 of 44 components import `@subframe/core` (runtime dependency). All 44 must be migrated or replaced before v3 launch.

**Form Components (10):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| TextField | `text-field.tsx` | Yes | label, placeholder, error state, icon prefix |
| TextArea | `text-area.tsx` | Yes | label, rows, maxLength |
| Checkbox | `checkbox.tsx` | Yes | checked, indeterminate |
| CheckboxGroup | `checkbox-group.tsx` | Yes | Multi-select group |
| CheckboxCard | `checkbox-card.tsx` | Yes | Card-style checkbox with description |
| RadioGroup | `radio-group.tsx` | Yes | Single-select group |
| RadioCardGroup | `radio-card-group.tsx` | Yes | Card-style radio with description |
| Select | `select.tsx` | Yes | Dropdown with search, multi-select variant |
| Switch | `switch.tsx` | Yes | Toggle with label |
| Slider | `slider.tsx` | Yes | Range input with min/max |

**Data Display (7):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| Table | `table.tsx` | Yes | Sortable columns, pagination |
| BarChart | `bar-chart.tsx` | Yes | Recharts wrapper |
| LineChart | `line-chart.tsx` | Yes | Recharts wrapper |
| AreaChart | `area-chart.tsx` | Yes | Recharts wrapper |
| PieChart | `pie-chart.tsx` | Yes | Recharts wrapper |
| Badge | `badge.tsx` | Yes | Status/count badges |
| Avatar | `avatar.tsx` | Yes | Image + fallback initials |

**Navigation (5):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| SidebarWithSections | `sidebar-with-sections.tsx` | Yes | Grouped nav items with collapse |
| TopbarWithRightNav | `topbar-with-right-nav.tsx` | Yes | Logo + nav + right actions |
| Breadcrumbs | `breadcrumbs.tsx` | Yes | Path breadcrumb trail |
| TreeView | `tree-view.tsx` | Yes | Nested folder/file tree |
| Tabs | `tabs.tsx` | Yes | Tab panels with lazy render |

**Feedback (5):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| Alert | `alert.tsx` | Yes | Success/warning/error/info variants |
| Toast | `toast.tsx` | Yes | Auto-dismiss notifications |
| Loader | `loader.tsx` | Yes | Spinner variants |
| Progress | `progress.tsx` | Yes | Determinate/indeterminate bar |
| Tooltip | `tooltip.tsx` | Yes | Hover/focus tooltip |

**Dialog (5):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| Dialog | `dialog.tsx` | Yes | Modal with backdrop |
| FullscreenDialog | `fullscreen-dialog.tsx` | Yes | Full-viewport modal |
| Drawer | `drawer.tsx` | Yes | Slide-in panel (left/right/bottom) |
| DropdownMenu | `dropdown-menu.tsx` | Yes | Context dropdown |
| ContextMenu | `context-menu.tsx` | Yes | Right-click menu |

**Interaction (3):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| Button | `button.tsx` | Yes | Primary/secondary/ghost/destructive variants |
| IconButton | `icon-button.tsx` | Yes | Icon-only button with tooltip |
| LinkButton | `link-button.tsx` | Yes | Anchor-styled button |

**Compound (3):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| Accordion | `accordion.tsx` | Yes | Expand/collapse sections |
| VerticalStepper | `vertical-stepper.tsx` | Yes | Multi-step form indicator |
| Stepper | `stepper.tsx` | Yes | Horizontal step indicator |

**Utility (4):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| IconWithBackground | `icon-with-background.tsx` | Yes | Icon in colored circle |
| SkeletonText | `skeleton-text.tsx` | No | Text placeholder shimmer |
| SkeletonCircle | `skeleton-circle.tsx` | No | Circle placeholder shimmer |
| CopyToClipboardButton | `copy-to-clipboard-button.tsx` | No | Click-to-copy with feedback |

**Layout (1):**

| Component | File | @subframe/core | Key Props/Features |
|-----------|------|:--------------:|-------------------|
| DefaultPageLayout | `ui/layouts/default-page-layout.tsx` | No | Standard page wrapper (padding, max-width) |
**Migration Strategy:**
1. **Phase 1:** Replace `@subframe/core` runtime with Tailwind CSS utility classes (zero-runtime approach)
2. **Phase 2:** Rebuild component APIs using shadcn/ui patterns (headless + Tailwind)
3. **Priority:** Form components (10) → Dialog (5) → Data Display (7) → rest
4. **Risk:** 40 components with `@subframe/core` = if package is removed or breaks, 40 components fail simultaneously

### 7.6 Accessibility Baseline

#### 7.6.1 Current State Audit

| Metric | Value | Target (WCAG 2.1 AA) | Gap |
|--------|-------|----------------------|-----|
| ARIA attributes | 78 attributes across 26 files | — | Present but inconsistent — no systematic audit |
| `prefers-reduced-motion` | **0 instances** in entire codebase | Must respect user preference | **Critical gap** — pulse animations, transitions all play regardless |
| Color contrast (text tertiary `#a3a08e` on cream `#faf8f5`) | **2.46:1** | 4.5:1 (AA normal text) | **FAIL** — tertiary text is unreadable for low-vision users |
| Color contrast (sidebar text `#a3c48a` on olive `#283618`) | **6.63:1** | 4.5:1 (AA normal text) | **PASS** — meets AA for normal text |
| Focus indicators | `focus:ring-[#606C38]` present | Visible focus ring on all interactive elements | Partial — not all buttons/links have visible focus |
| Keyboard navigation | Tab order follows visual order (sidebar → topbar → content) | Full keyboard operability | Untested — no skip-to-content link |
| Screen reader landmarks | `<main>`, `<nav>` present in layout | Correct landmark hierarchy | Partial — sidebar uses `<nav>`, content area is `<main>` |

#### 7.6.2 ARIA Usage Map

| Category | Count | Files | Notes |
|----------|-------|-------|-------|
| `role` attributes | 12 | Layout, sidebar, modals | `role="dialog"`, `role="navigation"`, `role="main"` |
| `aria-label` | 28 | Buttons, inputs, icons | Icon buttons need labels |
| `aria-hidden` | 15 | Decorative icons, backdrops | Correct usage |
| `aria-live` | 5 | Notification areas, streaming (4 files) | Used in Hub/Chat for live updates |
| `aria-expanded` | 8 | Accordion, dropdowns, mobile menu | Sidebar sections |
| `aria-describedby` | 7 | Form inputs with error messages | Present in Subframe form components |

#### 7.6.3 Required Accessibility Fixes (Phase 1)

1. **Add `prefers-reduced-motion` media query** — wrap all `animate-pulse`, `transition-*`, and custom keyframes
2. **Fix color contrast** — tertiary text `#a3a08e` → min `#756e5a` on cream background (4.5:1+)
3. **Add skip-to-content link** — hidden visually, visible on focus, jumps to `<main>`
4. **Audit all icon buttons** — ensure `aria-label` on every `<IconButton>` (currently inconsistent)
5. **Add `aria-current="page"`** — sidebar active nav item (currently uses visual styling only)
6. **Test keyboard navigation** — full tab-through of all interactive elements per page

### 7.7 Global Listeners (Layout-mounted)

| Listener | Purpose |
|----------|---------|
| `NotificationListener` | WebSocket → toast notifications |
| `NightJobListener` | WebSocket → job completion alerts |
| `BudgetAlertListener` | WebSocket → budget threshold warnings |
| `InstallBanner` | PWA install prompt |
| `PushPermission` | Web Push permission request |

### 7.8 Build & Deploy

```
git push main
  → GitHub Actions (self-hosted runner, same Oracle ARM64 VPS)
    → bun install --frozen-lockfile
    → npx tsc --noEmit (pre-commit hook also)
    → turbo build
    → Cloudflare cache purge
```

### 7.9 Browser Support

| Browser | Priority |
|---------|----------|
| Chrome | P0 (primary) |
| Safari | P1 |
| Firefox | P2 |
| Edge | P2 |

### 7.10 Bundle Size Baseline

| Package | dist Size | Key Contributors |
|---------|-----------|-----------------|
| `packages/app` | **2.5 MB** | React 19, React Flow (NEXUS), Recharts (charts), Subframe core (40 components), Zustand, React Query |
| `packages/admin` | **2.4 MB** | React 19, React Flow (NEXUS), Recharts, Subframe core, admin CRUD forms |
| `packages/server` | **15 MB** | Anthropic SDK, Drizzle ORM, Hono, Google GenAI (to be removed), n8n client |

**Optimization Targets for Redesign:**
- Subframe `@subframe/core` removal → estimate -200-400KB (runtime + unused components)
- React Flow already lazy-loaded (NEXUS only) — correct pattern
- Recharts used in 4+ pages — keep as shared dependency
- v3 OpenClaw PixiJS: must stay ≤200KB gzip, `packages/office/` lazy-loaded

### 7.11 Performance Targets

| Metric | Target |
|--------|--------|
| API P95 response | ±10% of baseline |
| NEXUS canvas | 60fps rendering |
| Page lazy load | Skeleton fallback < 100ms |
| WebSocket reconnect | Automatic with backoff |
| Concurrent sessions | 20 max (server constraint) |

### 7.12 Design System Analysis (Libre Framework Lens)

#### 7.12.1 Gestalt Principles Assessment

| Principle | Current State | Redesign Impact |
|-----------|--------------|-----------------|
| **Proximity** | Sidebar groups use section headers + 24px gaps — clear grouping | Maintain. v3 FR-UX consolidation (22→~6 groups) will strengthen proximity |
| **Similarity** | Inconsistent — 428 color-mix locations break visual similarity | **Critical fix needed.** Token reset must enforce consistent surface/text/accent usage |
| **Continuity** | Layout flow: sidebar (fixed) → topbar (anchored) → content (scrollable) | Good. Maintain left-to-right scan order |
| **Closure** | Cards and panels use borders (`border-[#e5e1d3]`) for enclosure | Needs audit — some pages use shadows, others use borders, inconsistent closure signals |
| **Figure-Ground** | Cream background `#faf8f5` vs white cards — weak contrast (ΔE < 3) | **Improve.** Increase card-to-background contrast or use subtle shadows |

#### 7.12.2 Typography Scale

Current type scale is **ad-hoc** (no mathematical ratio):

| Element | Size | Ratio to Base (14px) |
|---------|------|---------------------|
| Brand "CORTHEX" | 14px | 1.0 (same as body — weak brand hierarchy) |
| Nav section label | 11px | 0.79 |
| Body text | 14px | 1.0 (base) |
| Nav item | 14px | 1.0 |
| Topbar breadcrumb | 14px | 1.0 |
| Page heading | Varies (18-24px) | 1.28-1.71 (inconsistent) |

**Recommendation:** Adopt a Major Third ratio (1.250) or Perfect Fourth (1.333) type scale:
- `11px` → `12px` (xs)
- `14px` → `14px` (sm/base)
- `18px` → `18px` (lg)
- `24px` → `24px` (xl)
- `30px` → `32px` (2xl)
- `36px` → `40px` (3xl — page titles)

#### 7.12.3 Color Distribution (60-30-10 Analysis)

Current distribution does NOT follow the 60-30-10 rule:

| Zone | Target | Current Color | Current % | Issue |
|------|--------|--------------|-----------|-------|
| Dominant (60%) | Background/surface | cream `#faf8f5` + white cards | ~50% | Close but diluted by 428 raw hex variations |
| Secondary (30%) | Structure/UI | olive `#283618` (sidebar) + sand `#e5e1d3` (borders) | ~25% | Under-represented — sidebar is only olive element |
| Accent (10%) | Interactive/status | Mixed: `#606C38`, `red-500`, `#d97706`, `#10b981`, `#6366f1` | ~25% | **Over-represented.** 5+ accent colors compete for attention |

**Recommendation:** Consolidate accent palette to 1 primary accent + semantic colors only:
- Primary accent: 1 color (TBD in Phase 1 — currently olive `#606C38`)
- Semantic: success (green), warning (amber), error (red), info (blue)
- Remove: provider-specific colors from Dashboard (`#d97706`/`#10b981`/`#6366f1`) → use chart palette instead

#### 7.12.4 Design Masters Reference (Applicable Principles)

| Master | Principle | Application to CORTHEX |
|--------|-----------|----------------------|
| **Dieter Rams** | "Less, but better" — remove ornament, focus on utility | 22-item sidebar → 6-group consolidation. Strip decorative elements. |
| **Massimo Vignelli** | Systematic grid, limited typefaces (max 3), strict color palette | Enforce 8px grid, Inter + JetBrains Mono only (drop Noto Serif KR unless Korean serif needed), 5-color max palette |
| **Josef Müller-Brockmann** | Grid-based layout, mathematical proportions | NEXUS canvas, Dashboard card grid — enforce consistent column/row ratios |
| **Paul Rand** | Brand identity through simplicity and geometric reduction | CORTHEX brand mark — currently text-only at 14px. Needs a proper logomark. |

---

## 8. v3 Additions (Upcoming)

These are planned v3 features that the UXUI redesign must accommodate:

| Feature | Sprint | UI Impact |
|---------|--------|-----------|
| Big Five Personality (OCEAN) | Sprint 1 | 5 sliders (0-100) on agent edit form, 3+ presets |
| n8n Workflow Integration | Sprint 2 | Admin page for n8n management, replace /workflows |
| Agent Memory (3-stage) | Sprint 3 | Memory visualization on agent detail, observation feed |
| OpenClaw Virtual Office | Sprint 4 | New `/office` route, PixiJS canvas (≤200KB gzip), `packages/office/` isolated package |
| Page Consolidation (FR-UX) | Parallel | 23 pages → ~6 groups (existing routes preserved via redirects) |
| Tool Response Sanitization | Sprint 2-3 | Security alert feed in activity-log |
| Voyage AI Embeddings | Pre-Sprint | 768d → 1024d migration (backend only, no UI change) |

### 8.2 Known Codebase Violations

| Issue | Location | Decision Reference | Action Required |
|-------|----------|-------------------|-----------------|
| `@google/generative-ai` import | `packages/server/src/lib/llm/google.ts`, `packages/server/src/services/embedding-service.ts` | Confirmed Decisions Stage 1 #1: "Embedding Provider — Voyage AI (voyage-3-large, 1024d)" | Remove Google GenAI SDK, replace with Voyage AI embedding API |
| 428 color-mix locations | Spread across `packages/app/src/` | Phase 0 design token reset planned | Full audit + consolidation during Phase 1 theme implementation |
| Subframe `@subframe/core` dependency | 40 of 44 UI components (`packages/app/src/ui/components/`) | Confirmed Decisions Stage 1 #4: Subframe → Stitch 2 migration | Migrate or replace all 44 components before v3 launch |

---

*End of Technical Spec — Phase 0-Foundation, Step 0-1*
