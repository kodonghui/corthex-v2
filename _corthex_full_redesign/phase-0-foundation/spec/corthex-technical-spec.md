# CORTHEX v2 — Technical Specification for UXUI Redesign

_Source of truth for all design decisions. Every route, type, column, and constraint is exact._

---

## 1. System Overview

### Monorepo Structure (Turborepo)

```
corthex-v2/
├── packages/
│   ├── server/          # Hono + Bun HTTP/WebSocket server
│   │   └── src/
│   │       ├── engine/  # Agent execution engine (agent-loop.ts + types.ts — public API only)
│   │       ├── db/      # Drizzle ORM schema + migrations + scoped-query.ts
│   │       ├── routes/  # HTTP route handlers
│   │       │   ├── workspace/   # /api/workspace/* — authenticated user routes
│   │       │   ├── admin/       # /api/admin/* — company admin routes
│   │       │   ├── super-admin/ # /api/super-admin/* — platform admin routes
│   │       │   ├── public-api/  # /api/public/* — API key authenticated
│   │       │   ├── auth.ts      # /api/auth/*
│   │       │   ├── health.ts    # /api/health
│   │       │   ├── commands.ts  # /api/commands/*
│   │       │   ├── onboarding.ts
│   │       │   └── telegram-webhook.ts
│   │       ├── ws/      # WebSocket channel management
│   │       ├── lib/     # Shared utilities (AI, notifier, tool-cache, etc.)
│   │       ├── services/ # Domain services (orchestrator, knowledge-injector, etc.)
│   │       ├── middleware/ # auth, error, department-scope
│   │       └── mcp/     # SketchVibe MCP stdio server
│   ├── app/             # React 19 + Vite 6 — User-facing SPA
│   │   └── src/
│   │       ├── pages/   # Page components (lazy-loaded)
│   │       ├── components/ # Feature components
│   │       ├── stores/  # Zustand stores
│   │       ├── hooks/   # TanStack Query hooks
│   │       └── ui/      # Local UI primitives
│   ├── admin/           # React 19 + Vite 6 — Admin SPA (served at /admin)
│   │   └── src/
│   │       ├── pages/   # Admin page components
│   │       └── components/ # Admin-specific components
│   ├── ui/              # @corthex/ui — shared CVA-based component library
│   └── shared/          # @corthex/shared — types shared between app/server
```

### Tech Stack (Exact Versions)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Bun | ARM64 Oracle Cloud, 4 cores, 24GB RAM |
| Backend Framework | Hono | createBunWebSocket, RBAC middleware, Zod validators |
| Frontend Framework | React 19 + Vite 6 | Two SPAs: app + admin |
| Styling | Tailwind CSS 4 | Dark-mode class strategy (`document.documentElement.classList`) |
| Component Primitives | @corthex/ui (CVA-based) | Skeleton, Button, Badge, etc. |
| ORM | Drizzle ORM | PostgreSQL dialect, drizzle-zod integration |
| Database | PostgreSQL + pgvector | Neon serverless (remote) + pgvector extension |
| Agent SDK | @anthropic-ai/claude-agent-sdk 0.2.x | Pinned — no `^`. Isolated to `engine/agent-loop.ts` |
| Auth | JWT sessions | Separate user/admin token stores |
| State Management | Zustand + TanStack Query | Zustand = UI state, TanStack = server cache |
| Real-time | WebSocket (Hono) + SSE | WS: 7 channels, SSE: 6 event types |
| Embedding | @google/genai (Gemini) | Semantic cache + knowledge search |
| Caching | 3-layer (Semantic/Prompt/Tool) | D17-D20 in architecture.md |
| CI/CD | GitHub Actions self-hosted | Same server as app — CPU contention during deploy |
| CDN | Cloudflare | Auto cache purge on main push |
| Container | Docker (ARM64) | graceful shutdown on deploy |

### Deploy Pipeline

```
git push main
  → GitHub Actions (self-hosted, same Oracle ARM64 server)
    → turbo build (compiles server + app + admin)
    → tsc --noEmit (type check — blocks commit if fails via hook)
    → Docker build + replace container
    → Cloudflare cache purge via API
```

---

## 2. User-Facing Pages (App — packages/app/src)

Base URL: `https://corthex.app/` (React Router v6, SPA)
Auth: JWT stored in `localStorage` (`useAuthStore` via Zustand)
All protected routes wrapped in `<ProtectedRoute>` → redirect to `/login` if unauthenticated

### Route Index

| Route | Page Component | File |
|-------|---------------|------|
| `/login` | LoginPage | `pages/login.tsx` |
| `/onboarding` | OnboardingPage | `pages/onboarding.tsx` |
| `/` (index) | HomePage | `pages/home.tsx` |
| `/hub` | HubPage | `pages/hub.tsx` |
| `/command-center` | CommandCenterPage | `pages/command-center/` |
| `/chat` | ChatPage | (not shown in app — uses ChatPage) |
| `/jobs` | JobsPage | `pages/jobs.tsx` |
| `/reports` | ReportsPage | `pages/reports.tsx` |
| `/reports/:id` | ReportsPage | `pages/reports.tsx` (detail view) |
| `/sns` | SnsPage | `pages/sns.tsx` |
| `/messenger` | MessengerPage | `pages/messenger.tsx` |
| `/dashboard` | DashboardPage | `pages/dashboard.tsx` |
| `/ops-log` | OpsLogPage | `pages/ops-log.tsx` |
| `/nexus` | NexusPage | `pages/nexus.tsx` |
| `/trading` | TradingPage | `pages/trading.tsx` |
| `/files` | FilesPage | `pages/files.tsx` |
| `/org` | OrgPage | `pages/org.tsx` |
| `/notifications` | NotificationsPage | `pages/notifications.tsx` |
| `/activity-log` | ActivityLogPage | `pages/activity-log.tsx` |
| `/costs` | CostsPage | `pages/costs.tsx` |
| `/cron` | CronBasePage | `pages/cron-base.tsx` |
| `/argos` | ArgosPage | `pages/argos.tsx` |
| `/agora` | AgoraPage | `pages/agora.tsx` |
| `/classified` | ClassifiedPage | `pages/classified.tsx` |
| `/knowledge` | KnowledgePage | (not shown — KnowledgePage) |
| `/performance` | PerformancePage | `pages/performance.tsx` |
| `/departments` | DepartmentsPage | `pages/departments.tsx` |
| `/agents` | AgentsPage | `pages/agents.tsx` |
| `/tiers` | TiersPage | (TiersPage) |
| `/settings` | SettingsPage | `pages/settings.tsx` |

All pages are `React.lazy()` + `<Suspense fallback={<PageSkeleton />}>` — route-level code splitting.

---

### Page Details

#### `/login` — Login (LoginPage)

**Purpose:** Authentication entry point. Single form — no company slug field; company is resolved server-side from username uniqueness.

**Key Components:** Inline form in `pages/login.tsx` (no shared component). `useAuthStore` (Zustand) manages token + user object.

**Form Fields:**
- `username` — `type="text"`, `autocomplete="username"`, required
- `password` — `type="password"`, `autocomplete="current-password"`, required
- Submit button: `bg-indigo-600 hover:bg-indigo-700` (different from main dark theme — this page is `bg-white dark:bg-zinc-950`)

**API Call:**
- `POST /api/auth/login` — body: `{ username: string, password: string }` → `{ data: { token: string, user: { id: string, name: string, role: 'admin'|'user', companyId: string } } }`
- On success: `useAuthStore.login(token, user)` → navigate to `redirectTo`

**Error States:**
- General error: server error message or `'로그인 실패'` — shown as `text-red-600 dark:text-red-400` paragraph below fields
- Rate limit (`RateLimitError`): countdown timer activates. Button label changes to `"{N}초 후 재시도"`, button `disabled`. Timer decrements 1/s.

**Redirect Flow:**
- Already authenticated on mount → `navigate(redirectTo, { replace: true })` immediately
- `redirectTo` = `?redirect=` query param, default `'/'`
- Protected route unauthenticated: `navigate('/login?redirect=/original-path')`

---

#### `/onboarding` — Onboarding (OnboardingPage)

**Purpose:** First-run wizard for new users. Guides through org template selection then marks setup complete. Redirects to `/` on completion.

**Wizard Steps (2 steps):**

**Step 1: Template Selection**
- Displays grid of `OrgTemplate[]` cards (name, description, dept count, agent count)
- Each card opens a preview modal with full dept/agent breakdown (tier badges, modelName)
- "이 템플릿으로 시작" button triggers apply
- Template icon mapping: 기본→🏢, 기술→💻, 마케팅→📢, 투자→📈

**Step 2: Completion**
- Shows `ApplyResult` summary: `departmentsCreated`, `departmentsSkipped`, `agentsCreated`, `agentsSkipped`
- "완료" button calls complete API then navigates to `'/'`

**API Calls:**
- `GET /onboarding/status` → `{ data: { completed: boolean } }` — on mount; redirect to `/` if already completed
- `GET /onboarding/templates` → `{ data: OrgTemplate[] }` — template list
- `POST /onboarding/select-template` — body: `{ templateId: string }` → `{ data: { templateId, templateName, departmentsCreated, departmentsSkipped, agentsCreated, agentsSkipped } }`
- `POST /onboarding/complete` → `{ data: { message: string } }` — marks setup complete

**Data Displayed:** `OrgTemplate` shape: `{ id, name, description, templateData: { departments: [{ name, description, agents: [{ name, nameEn, role, tier, modelName }] }] }, isBuiltin, tags }`

---

#### `/` — Home (HomePage)

**Purpose:** Landing dashboard after login. Shows greeting, overnight job results, agent team grid, recent notifications, quick-start shortcuts.

**Key Components:**
- `RecentNotifications` (inline component in `pages/home.tsx`)
- Agent status grid (up to 8 agents, sorted: secretary first, then by status: online→working→error→offline)
- Overnight jobs card (visible only if `notifications.total > 0`)
- Quick-start grid: Chat → `/chat`, 야간작업 → `/jobs`, 보고서 → `/reports`

**API Calls:**
- `GET /api/workspace/agents` → `{ data: Agent[] }` — agent list with status
- `GET /api/workspace/jobs/notifications` → `{ data: { total, completedCount, failedCount, jobs: JobNotification[] } }` — polled every 30s
- `PUT /api/workspace/jobs/read-all` → mark all read
- `GET /api/workspace/notifications?limit=5` → `{ data: RecentNotif[] }` — polled every 300s

**Data Displayed:**
- Agent cards: `id`, `name`, `role`, `status` (`online|working|error|offline`), `isSecretary`
- Status colors: `online` = `bg-emerald-400 animate-pulse`, `working` = `bg-blue-400 animate-pulse`, `error` = `bg-red-400`, `offline` = `bg-slate-500`
- Secretary badge: `bg-amber-500/15 text-amber-400` "COS"
- Overnight jobs: up to 5 shown, with `✓` (emerald) / `✗` (red) status icons

---

#### `/hub` — Hub (HubPage)

**Purpose:** Primary AI command interface. SSE-streaming chat with agents. Secretary auto-routing or direct agent selection via @mention/agentId.

**Key Components:**
- SSE stream consumer (reads `event: accepted/processing/handoff/message/error/done`)
- Message input with @mention support and preset shortcut detection
- Tracker panel showing handoff chain depth

**API Calls:**
- `POST /api/workspace/hub/stream` (SSE) — body: `{ message: string, sessionId?: string (UUID), agentId?: string (UUID) }` → streaming SSE response
- SSE events: `accepted { sessionId }` → `processing { agentName }` → `handoff { from, to, depth }` → `message { content }` → `done { costUsd, tokensUsed }`

**Data Flow:**
1. Server resolves target: explicit `agentId` > @mention > `isSecretary=true` agent
2. Soul template rendered via `renderSoul(soul, agentId, companyId, extraVars)`
3. `SessionContext` built: `{ cliToken, userId, companyId, depth:0, sessionId, startedAt, maxDepth, visitedAgents:[agentId], runId }`
4. `runAgent()` → engine/agent-loop.ts (single entry point D6)

---

#### `/command-center` — Command Center (CommandCenterPage)

**Purpose:** Advanced command interface. Slash commands (`/전체`, `/순차`, `/토론`, `/심층토론`, `/배치실행`, `/배치상태`, `/도구점검`, `/명령어`), presets, batch execution.

**Key Components:**
- `pages/command-center/components/slash-popup.tsx` — slash command picker UI
- Command history display
- Preset management

**API Calls:**
- `POST /api/commands` — create command
- `GET /api/commands` — command history
- `GET /api/workspace/presets` — user presets
- `POST /api/workspace/presets` — create preset

**Data:** `commands` table: `type` enum `['direct','mention','slash','preset','batch','all','sequential','deepwork']`

---

#### `/chat` — Chat (ChatPage)

**Purpose:** Session-based chat with individual agents. Persists full message history. Supports file attachments (up to 5 per message).

**Key Components:**
- `components/chat/session-panel.tsx` — session list sidebar
- `components/chat/chat-area.tsx` — message stream, tool call cards
- `components/chat/agent-list-modal.tsx` — agent picker
- `components/chat/tool-call-card.tsx` — tool call visualization
- `components/markdown-renderer.tsx` — markdown rendering with syntax highlight
- `components/chat/report-view.tsx` — report render within chat
- WebSocket channel: `chat-stream::{sessionId}` for real-time token streaming

**API Calls:**
- `GET /api/workspace/chat/sessions` → `{ data: ChatSession[] }`
- `POST /api/workspace/chat/sessions` — body: `{ agentId: UUID, title?: string (max 200) }` → `201 { data: ChatSession }`
- `GET /api/workspace/chat/sessions/:sessionId/messages?before=UUID&limit=50` → `{ data: Message[], hasMore: bool }` (cursor pagination, max limit 100)
- `POST /api/workspace/chat/sessions/:sessionId/messages` — body: `{ content: string (min 1), attachmentIds?: UUID[] (max 5) }` → `201 { data: { userMessage } }`
- `PATCH /api/workspace/chat/sessions/:sessionId` — body: `{ title: string (min 1, max 200) }` → update title
- `DELETE /api/workspace/chat/sessions/:sessionId` — cascade delete toolCalls → delegations → messages → session
- `GET /api/workspace/chat/sessions/:sessionId/delegations` → delegation chain
- `GET /api/workspace/chat/sessions/:sessionId/tool-calls` → tool call history

**Data:** `chat_sessions` + `chat_messages` + `delegations` + `tool_calls` tables
**Real-time:** WebSocket channel `chat-stream::{sessionId}` — events: `token`, `tool-start`, `tool-end`, `done`, `error`
**autoLearn:** After AI response, if `agent.autoLearn !== false`, calls `extractAndSaveMemories()` → saves to `agent_memory` table

---

#### `/jobs` — Jobs (JobsPage)

**Purpose:** Night job queue management. Create one-time or recurring jobs. View results of background agent tasks.

**Key Components:**
- Job status grid (queued/processing/completed/failed/blocked)
- Schedule management (cron expressions)
- Job chain visualization

**API Calls:**
- `GET /api/workspace/jobs` — job list with status filters
- `POST /api/workspace/jobs` — create job: `{ agentId, instruction, scheduledFor }`
- `GET /api/workspace/jobs/notifications` — unread results
- `PUT /api/workspace/jobs/read-all` — mark all read
- `GET /api/workspace/schedules` — recurring schedules
- `POST /api/workspace/schedules` — create schedule with cron expression
- `DELETE /api/workspace/schedules/:id` — delete schedule

**Data:** `night_jobs` table: `status` enum `['queued','processing','completed','failed','blocked']`, `retryCount`, `maxRetries:3`, `chainId` (job chain grouping)

---

#### `/reports` + `/reports/:id` — Reports (ReportsPage)

**Purpose:** Business report management. Draft/submit/review lifecycle. CEO reviews H-submitted reports with inline comments.

**Key Components:**
- Report list with status badges (draft/submitted/reviewed)
- Full-page report editor (markdown)
- `components/chat/report-detail-modal.tsx` — modal detail view
- Comment thread (CEO ↔ H feedback)

**API Calls:**
- `GET /api/workspace/reports` — report list
- `POST /api/workspace/reports` — create: `{ title, content }`
- `PATCH /api/workspace/reports/:id` — update
- `POST /api/workspace/reports/:id/submit` — submit to supervisor
- `GET /api/workspace/reports/:id/comments` — comments
- `POST /api/workspace/reports/:id/comments` — add comment

**Data:** `reports` table: `status` enum `['draft','submitted','reviewed']`, `submittedTo` (FK users), `report_comments`

---

#### `/sns` — SNS (SnsPage)

**Purpose:** Multi-platform social content management. AI-generated content with approval workflow. Platforms: instagram, tistory, daum_cafe, twitter, facebook, naver_blog.

**Key Components:**
- `components/sns/content-tab.tsx` — content list with status kanban
- `components/sns/queue-tab.tsx` — approval queue
- `components/sns/stats-tab.tsx` — publishing stats
- `components/sns/accounts-tab.tsx` — SNS account management
- `components/sns/card-news-tab.tsx` — card news series view
- `components/sns/card-news-detail.tsx` — card series editor
- `components/sns/status-stepper.tsx` — draft→pending→approved→scheduled→published flow

**API Calls:**
- `GET /api/workspace/sns` — content list with status filter
- `POST /api/workspace/sns` — create content
- `PATCH /api/workspace/sns/:id` — update (content, status)
- `POST /api/workspace/sns/:id/approve` — approve content
- `POST /api/workspace/sns/:id/reject` — reject with reason
- `GET /api/workspace/sns/accounts` — SNS accounts
- `POST /api/workspace/sns/accounts` — add account

**Data:** `sns_contents` table: `status` enum `['draft','pending','approved','scheduled','rejected','published','failed']`, `platform` enum `['instagram','tistory','daum_cafe','twitter','facebook','naver_blog']`, `isCardNews`, `cardSeriesId`, `cardIndex`, `variantOf` (A/B test FK)

---

#### `/messenger` — Messenger (MessengerPage)

**Purpose:** Internal company messaging. 1:1 and group conversations with file sharing and emoji reactions.

**Key Components:**
- `components/messenger/conversations-panel.tsx` — conversation list sidebar
- `components/messenger/conversations-view.tsx` — conversation layout
- `components/messenger/conversation-chat.tsx` — chat area with reactions
- `components/messenger/new-conversation-modal.tsx` — create DM/group
- `components/messenger/share-to-conversation-modal.tsx` — share content to chat

**API Calls:**
- `GET /api/workspace/messenger/conversations` — conversation list
- `POST /api/workspace/messenger/conversations` — create: `{ type: 'direct'|'group', participantIds, name? }`
- `GET /api/workspace/messenger/conversations/:id/messages` — message history
- `POST /api/workspace/messenger/conversations/:id/messages` — send: `{ content, attachmentIds? }`
- `POST /api/workspace/messenger/messages/:id/reactions` — add emoji reaction
- `DELETE /api/workspace/messenger/messages/:id/reactions` — remove reaction

**Data:** `conversations` (type: `'direct'|'group'`), `conversation_participants`, `messages` (type: `'text'|'system'|'ai_report'`)

---

#### `/dashboard` — Dashboard (DashboardPage)

**Purpose:** KPI summary dashboard. Task counts, cost tracking, usage charts by LLM provider, budget alerts, quick actions.

**Key Components:**
- `SummaryCards` — 4 metric cards (tasks, cost, agents, satisfaction)
- Usage chart (provider breakdown: anthropic `#8B5CF6`, openai `#10B981`, google `#F59E0B`)
- Budget gauge
- `useDashboardWs` hook — WebSocket real-time updates

**API Calls:**
- `GET /api/workspace/dashboard` → `{ data: { summary: DashboardSummary, usageDays: DashboardUsageDay[], budget: DashboardBudget, quickActions: QuickAction[], satisfaction: DashboardSatisfaction } }`
- WebSocket channel: `dashboard` — live cost/task updates

**Data Types (from @corthex/shared):** `DashboardSummary`, `DashboardUsageDay`, `DashboardUsage`, `DashboardBudget`, `QuickAction`, `DashboardSatisfaction`, `LLMProviderName`

---

#### `/ops-log` — Operations Log (OpsLogPage)

**Purpose:** Activity log viewer. Filterable stream of all system events (chat, delegation, tool_call, job, sns, error, system, login).

**API Calls:**
- `GET /api/workspace/activity-log` — paginated log with type/phase/actor filters

**Data:** `activity_logs` table: `type` enum `['chat','delegation','tool_call','job','sns','error','system','login']`, `phase` enum `['start','end','error']`, `actorType` `'user'|'agent'|'system'`

---

#### `/nexus` — NEXUS (NexusPage)

**Purpose:** Interactive org chart canvas. React Flow + ELK.js. Drag-and-drop node positioning, agent/department node editing, workflow visualization.

**Key Components:**
- `components/nexus/CompanyNode.tsx` — root company node
- `components/nexus/DepartmentNode.tsx` — department container node
- `components/nexus/AgentNode.tsx` — individual agent node
- `components/nexus/NodeDetailPanel.tsx` — right panel: edit selected node
- `components/nexus/NexusInfoPanel.tsx` — left panel: org stats
- `components/nexus/WorkflowListPanel.tsx` — saved workflows list
- `components/nexus/WorkflowEditor.tsx` — workflow step editor
- `components/nexus/ExecutionHistoryPanel.tsx` — workflow run history
- `components/nexus/editable-edge.tsx` — edge with label
- `components/nexus/export-knowledge-dialog.tsx` — export to knowledge base

**API Calls:**
- `GET /api/workspace/nexus/layout` → canvas layout from `canvas_layouts` table
- `PUT /api/workspace/nexus/layout` — save node positions
- `GET /api/workspace/nexus/workflows` → `{ data: NexusWorkflow[] }`
- `POST /api/workspace/nexus/workflows` — create workflow
- `POST /api/workspace/nexus/workflows/:id/execute` — trigger execution
- `GET /api/workspace/nexus/executions` — execution history

**Data:** `canvas_layouts` (JSON `layoutData`), `nexus_workflows` (`nodes` JSONB, `edges` JSONB), `nexus_executions`

---

#### `/trading` — Trading (TradingPage)

**Purpose:** Stock trading dashboard. Watchlist, portfolio, orders, backtest, strategy chat with CIO agents. Paper/real mode toggle.

**Key Components:**
- `components/strategy/stock-chart.tsx` — candlestick chart

**API Calls:**
- `GET /api/workspace/strategy/watchlists` — watchlist with real-time prices
- `POST /api/workspace/strategy/watchlists` — add stock: `{ stockCode, stockName, market }`
- `GET /api/workspace/strategy/portfolios` — portfolio list
- `POST /api/workspace/strategy/portfolios/:id/orders` — place order
- `GET /api/workspace/strategy/backtests` — backtest results

**Data:** `strategy_watchlists`, `strategy_portfolios` (`tradingMode: 'real'|'paper'`, `holdings` JSONB array), `strategy_orders` (`side: 'buy'|'sell'`, `orderType: 'market'|'limit'`, `status: 'pending_approval'|'pending'|'submitted'|'executed'|'cancelled'|'rejected'|'failed'`), `strategy_backtest_results`

---

#### `/files` — Files (FilesPage)

**Purpose:** File manager. Upload, browse, and attach files to chat messages. Supported in chat as `attachmentIds` (max 5 per message).

**API Calls:**
- `GET /api/workspace/files` → file list
- `POST /api/workspace/files/upload` — multipart upload
- `DELETE /api/workspace/files/:id` — soft delete (`is_active = false`)

**Data:** `files` table: `filename`, `mimeType`, `sizeBytes`, `storagePath`, `isActive`

---

#### `/org` — Organization Chart (OrgPage)

**Purpose:** Read-only org chart view for users. Shows agent hierarchy (reportTo tree).

**API Calls:**
- `GET /api/workspace/agents/hierarchy` → tree of agents `{ id, name, nameEn, role, tier, modelName, status, isSecretary, departmentId, reportTo, children: AgentNode[] }`

---

#### `/notifications` — Notifications (NotificationsPage)

**Purpose:** Full notification inbox. Types: `chat_complete`, `delegation_complete`, `tool_error`, `job_complete`, `job_error`, `system`.

**API Calls:**
- `GET /api/workspace/notifications?limit=N` → paginated notifications
- `PATCH /api/workspace/notifications/:id/read` — mark single read
- `PUT /api/workspace/notifications/read-all` — mark all read

**Data:** `notifications` table: `type` (`chat_complete|delegation_complete|tool_error|job_complete|job_error|system`), `isRead`, `actionUrl`

---

#### `/activity-log` — Activity Log (ActivityLogPage)

**Purpose:** Full operational monitoring log. 4-tab interface covering agent activities, inter-agent communications (delegations), QA gate results, and tool invocations. Includes security alert feed. WebSocket for real-time append.

**Key Components:**
- Tab switcher: 활동 / 통신 / QA / 도구 (value: `agents|delegations|quality|tools`)
- `WsStatusIndicator` — WebSocket connection health badge
- `useActivityWs` hook — WebSocket subscription for real-time log append
- Filters: date range, agentId, status, conclusionFilter (QA tab), toolName (tools tab)
- Hallucination report sub-panel: shows `claims`, `verdict: 'clean'|'warning'|'critical'`, `score`

**API Calls:**
- `GET /api/workspace/activity/agents` — `?page&limit&agentId=&dateFrom=&dateTo=` → `{ data: { items: AgentActivity[], page, limit, total } }`
- `GET /api/workspace/activity/delegations` — same params → `{ data: { items: Delegation[], ... } }`
- `GET /api/workspace/activity/quality` — `?conclusion=pass|fail&...` → `{ data: { items: QualityReview[], ... } }`
- `GET /api/workspace/activity/tools` — `?toolName=&...` → `{ data: { items: ToolInvocation[], ... } }`
- `GET /api/workspace/activity/security-alerts` — → `{ data: { items: SecurityAlert[], page, limit, total, count24h } }`

**Data Types:**
- `AgentActivity`: `{ agentId, agentName, type, action, detail, phase, metadata, createdAt }`
- `Delegation`: `{ commandId, agentId, agentName, parentTaskId, type, input, output, status, durationMs, metadata, createdAt }`
- `QualityReview`: `{ reviewerAgentName, conclusion: 'pass'|'fail', scores: MergedScores, feedback, attemptNumber, commandText, createdAt }` — `MergedScores` includes `ruleResults` (severity: `'critical'|'major'|'minor'`, result: `'pass'|'warn'|'fail'`), `rubricScores`, `hallucinationReport` (verdict: `'clean'|'warning'|'critical'`)
- `ToolInvocation`: `{ agentName, toolName, input, output, status, durationMs, createdAt }`
- `SecurityAlert`: `{ action, actorType, actorId, targetType, metadata, createdAt }` — count24h shown in header
- Status badge colors: completed/done/end/success=emerald, failed/error=red, working/start/running=blue, pass=emerald, fail=red, warning=amber

---

#### `/costs` — Costs (CostsPage)

**Purpose:** AI cost breakdown. Cost by agent, by provider, by date. Budget vs actual.

**API Calls:**
- `GET /api/workspace/costs` → cost records grouped by agent/provider/day

**Data:** `cost_records`: `provider`, `model`, `inputTokens`, `outputTokens`, `costUsdMicro` (1 = $0.000001), `source` (`'chat'|'delegation'|'job'|'sns'`)

---

#### `/cron` — Cron Base (CronBasePage)

**Purpose:** Cron schedule management. Create/edit/delete recurring agent tasks.

**API Calls:**
- `GET /api/workspace/schedules` → `{ data: NightJobSchedule[] }`
- `POST /api/workspace/schedules` — `{ agentId, name, instruction, cronExpression }`
- `DELETE /api/workspace/schedules/:id`
- `GET /api/workspace/argos/cron-runs` → execution history

**Data:** `night_job_schedules`: `cronExpression`, `nextRunAt`, `lastRunAt`, `isActive`; `cron_runs`: `status` enum `['running','success','failed']`

---

#### `/argos` — ARGOS (ArgosPage)

**Purpose:** Event-driven trigger management. Configure conditions that automatically fire agent tasks.

**API Calls:**
- `GET /api/workspace/triggers` → trigger list
- `POST /api/workspace/triggers` — `{ agentId, name, instruction, triggerType, condition, cooldownMinutes }`
- `GET /api/workspace/argos/events` → event history

**Data:** `night_job_triggers`: `triggerType`, `condition` JSONB, `cooldownMinutes`, `lastTriggeredAt`; `argos_events`: `status` enum `['detected','executing','completed','failed']`

---

#### `/agora` — AGORA (AgoraPage)

**Purpose:** Multi-agent debate engine. Create debate topics, watch agents argue in real-time, view consensus results.

**Key Components:**
- `components/agora/debate-list-panel.tsx` — debate list
- `components/agora/debate-timeline.tsx` — round-by-round speech timeline
- `components/agora/speech-card.tsx` — individual agent speech
- `components/agora/consensus-card.tsx` — final consensus/dissent display
- `components/agora/debate-info-panel.tsx` — debate metadata
- `components/agora/create-debate-modal.tsx` — new debate creation
- `components/agora/diff-view.tsx` — position diff between rounds
- `components/agora/debate-result-card.tsx` — final result summary

**API Calls:**
- `GET /api/workspace/debates` → debate list
- `POST /api/workspace/debates` — `{ topic, type: 'debate'|'deep-debate', agentIds }`
- `GET /api/workspace/debates/:id` → debate detail with speeches
- `POST /api/workspace/debates/:id/start` — start execution

**Data:** `debate_status` enum `['pending','in-progress','completed','failed']`, `debate_type` enum `['debate','deep-debate']`, `consensus_result` enum `['consensus','dissent','partial']`

---

#### `/classified` — Archive / Classified (ClassifiedPage)

**Purpose:** Classified document archive. Stores all AI-generated outputs from commands with 4-level classification. Supports folder organization, semantic similarity search (pgvector), and per-document quality/cost breakdown.

**Key Components:**
- `MarkdownRenderer` — renders `content` field of `ArchiveDetail`
- Folder tree sidebar (nested `ArchiveFolder[]`)
- Stats bar: `ArchiveStats` (totalDocuments, byClassification counts, byDepartment breakdown, recentWeekCount)
- Sort: date / classification / qualityScore
- Detail panel: shows `delegationChain`, `qualityReview`, `costRecords`, `similarDocuments`

**API Calls:**
- `GET /api/workspace/archive` — paginated list: `?page&limit=20&sort=date|classification|qualityScore&classification=public|internal|confidential|secret&folderId=UUID&q=` → `{ data: { items: ArchiveItem[], page, limit, total } }`
- `GET /api/workspace/archive/:id` — detail: `{ data: ArchiveDetail }` with `delegationChain`, `qualityReview`, `costRecords`, `similarDocuments`
- `PATCH /api/workspace/archive/:id` — update classification/tags/title
- `DELETE /api/workspace/archive/:id` — delete document
- `POST /api/workspace/archive/folders` — `{ name, parentId? }`
- `PATCH /api/workspace/archive/folders/:id` — `{ name }`
- `DELETE /api/workspace/archive/folders/:id`

**Data Types:**
- `ArchiveItem`: `{ id, title, classification: 'public'|'internal'|'confidential'|'secret', summary, tags, folderId, agentName, qualityScore, commandType, createdAt }`
- `ArchiveDetail` extends `ArchiveItem`: `{ content, commandText, delegationChain: [{agentName, role, status}], qualityReview: {score, conclusion, feedback}, costRecords: [{model, inputTokens, outputTokens, costMicro}], similarDocuments: [{id, title, similarityScore, ...}] }`
- Classification badges: public=`bg-emerald-500/15 text-emerald-400`, internal=`bg-blue-500/15 text-blue-400`, confidential=`bg-amber-500/15 text-amber-400`, secret=`bg-red-500/15 text-red-400`
- Quality score color: ≥4=emerald, ≥3=amber, <3=red

---

#### `/knowledge` — Knowledge (KnowledgePage)

**Purpose:** Department knowledge base. Create/edit/delete documents and folders. Manage agent auto-learned memories. Supports markdown/text/html/mermaid content. Gemini embedding for semantic search. Version history per document.

**Key Components:**
- `MarkdownRenderer` — renders `KnowledgeDoc.content`
- Folder tree sidebar (nested `KnowledgeFolder[]` with `documentCount`)
- 2-tab view: Documents tab + Agent Memories tab
- Embedding status badge: `done` / `pending` / `none` — shows `embeddedAt`, `embeddingModel`

**API Calls:**
- `GET /api/workspace/knowledge/docs` — `?page&limit=20&folderId=UUID&q=&tags=` → `{ data: { items: KnowledgeDoc[], total } }`
- `POST /api/workspace/knowledge/docs` — `{ title, content, contentType: 'markdown'|'text'|'html'|'mermaid', folderId?, tags? }` → triggers Gemini embedding async
- `PATCH /api/workspace/knowledge/docs/:id` — update title/content/tags
- `DELETE /api/workspace/knowledge/docs/:id`
- `GET /api/workspace/knowledge/docs/:id/versions` → `{ data: DocVersion[] }` — `{ id, version, title, contentType, changeNote, editedBy, createdAt }`
- `POST /api/workspace/knowledge/docs/:docId/versions/:versionId/restore` — restore to version
- `POST /api/workspace/knowledge/folders` — `{ name, parentId? }`
- `PATCH /api/workspace/knowledge/folders/:id` — `{ name }`
- `DELETE /api/workspace/knowledge/folders/:id`
- `GET /api/workspace/knowledge/memories` — agent memory list: `{ data: AgentMemory[] }`
- `POST /api/workspace/knowledge/memories` — create memory
- `PATCH /api/workspace/knowledge/memories/:id` — update
- `DELETE /api/workspace/knowledge/memories/:id`

**Data Types:**
- `KnowledgeDoc`: `{ id, title, content, contentType: 'markdown'|'text'|'html'|'mermaid', folderId, tags: string[], fileUrl, embeddingStatus: 'done'|'pending'|'none', embeddedAt, embeddingModel }`
- `AgentMemory`: `{ agentId, agentName, memoryType: 'learning'|'insight'|'preference'|'fact', key, content, context, source, confidence: number, usageCount, lastUsedAt, isActive }`
- Content type colors: markdown=`bg-blue-500/20 text-blue-400`, text=`bg-slate-600/50 text-slate-300`

---

#### `/performance` — Performance (PerformancePage)

**Purpose:** Agent performance analytics. Per-agent success rates, Soul Gym AI improvement suggestions (prompt/tool/model changes), and quality dashboard with rubric scores, hallucination detection, and claim verification.

**Key Components:**
- `SummaryCards` — totalAgents, summary stats with period-over-period changes
- Agent list table: per-agent successRate → performance level (high ≥80%, mid ≥50%, low <50%)
- Detail modal: `AgentPerformanceDetail` with full quality breakdown
- Soul Gym panel: `SoulGymSuggestion[]` — dismissible AI suggestions
- Quality dashboard: rubric scores, rule results (`critical|major|minor` severity), hallucination report (`clean|warning|critical` verdict)

**API Calls:**
- `GET /api/workspace/performance/summary` → `{ data: PerformanceSummary }` — aggregate stats with `changes` (period-over-period)
- `GET /api/workspace/performance/agents/:id` → `{ data: AgentPerformanceDetail }` — per-agent detail
- `GET /api/workspace/performance/soul-gym` → `{ data: SoulGymSuggestion[] }` — improvement suggestions: types `'prompt-improve'|'add-tool'|'change-model'`
- `POST /api/workspace/performance/soul-gym/:id/apply` — apply suggestion to agent soul
- `POST /api/workspace/performance/soul-gym/:id/dismiss` — dismiss suggestion
- `GET /api/workspace/quality-dashboard` — `?agentId=&dateFrom=&dateTo=` → `{ data: QualityDashboardData }` — rubric scores, rule results, hallucination reports

**Data Types (from @corthex/shared):** `PerformanceSummary`, `AgentPerformance`, `AgentPerformanceDetail`, `SoulGymSuggestion`
- Performance badges: high=`bg-emerald-500/15 text-emerald-400`, mid=`bg-amber-500/15 text-amber-400`, low=`bg-red-500/15 text-red-400`
- Suggestion badges: prompt-improve=`bg-purple-500/15 text-purple-400`, add-tool=`bg-blue-500/15 text-blue-400`, change-model=`bg-amber-500/15 text-amber-400`

---

#### `/departments`, `/agents`, `/tiers` — Department/Agent/Tier Management

**Purpose:** User-level management pages for the company's dynamic org structure. Admin freely creates/edits/deletes departments, agents, tier configs.

**API Calls:**
- `GET/POST/PATCH/DELETE /api/workspace/agents`
- `PATCH /api/workspace/agents/:id/soul` — soul editor (max 50,000 chars)
- `POST /api/workspace/agents/:id/soul/reset` — restore to `adminSoul`
- `GET/POST/DELETE /api/workspace/agents/delegation-rules` — delegation rules (max 50 per company)
- `GET/POST /api/workspace/agents/hierarchy`

---

#### `/settings` — Settings (SettingsPage)

**Purpose:** User profile, notification preferences, MCP server config, theme toggle.

**Key Components:**
- `components/settings/soul-editor.tsx` — soul text editor
- `components/settings/settings-mcp.tsx` — MCP server list

**API Calls:**
- `GET/PATCH /api/workspace/profile` — user profile
- `GET/PATCH /api/workspace/notification-preferences` — per-type notification settings
- `GET /api/workspace/settings-mcp` — MCP servers list

---

## 3. Admin Pages (packages/admin/src)

Base URL: `/admin` (React Router v6 basename="/admin")
Auth: Separate JWT for admin users (`admin_users` + `admin_sessions` tables)
Roles: `superadmin` (platform-wide) | `admin` (company-scoped)

### Route Index

| Route | Page Component |
|-------|---------------|
| `/admin/login` | LoginPage |
| `/admin/` | DashboardPage |
| `/admin/users` | UsersPage |
| `/admin/employees` | EmployeesPage |
| `/admin/departments` | DepartmentsPage |
| `/admin/agents` | AgentsPage |
| `/admin/credentials` | CredentialsPage |
| `/admin/companies` | CompaniesPage |
| `/admin/tools` | ToolsPage |
| `/admin/costs` | CostsPage |
| `/admin/report-lines` | ReportLinesPage |
| `/admin/soul-templates` | SoulTemplatesPage |
| `/admin/monitoring` | MonitoringPage |
| `/admin/org-chart` | OrgChartPage |
| `/admin/nexus` | NexusPage |
| `/admin/org-templates` | OrgTemplatesPage |
| `/admin/workflows` | WorkflowsPage |
| `/admin/template-market` | TemplateMarketPage |
| `/admin/agent-marketplace` | AgentMarketplacePage |
| `/admin/api-keys` | ApiKeysPage |
| `/admin/agent-reports` | AgentReportsPage |
| `/admin/mcp-servers` | McpServersPage |
| `/admin/mcp-access` | McpAccessPage |
| `/admin/mcp-credentials` | McpCredentialsPage |
| `/admin/settings` | SettingsPage |
| `/admin/onboarding` | OnboardingWizardPage |

---

### Admin Page Details

#### `/admin/` — Dashboard

**Purpose:** Platform-wide metrics. Active companies, agent counts, total API cost, system health.

**API Calls:** `GET /api/admin/dashboard`

---

#### `/admin/users` — User Management

**Purpose:** CRUD for company users (CEO + Human employees).
**CRUD:** Create user, assign role (`admin|user`), activate/deactivate, invite via email.

**API Calls:**
- `GET /api/admin/users`
- `POST /api/admin/users` — `{ username, name, email, role }`
- `PATCH /api/admin/users/:id` — update role/status
- `DELETE /api/admin/users/:id` — soft delete (`is_active = false`)

**Data:** `users`: `role` enum `['admin','user']`

---

#### `/admin/employees` — Employee Department Assignment

**Purpose:** Map users to departments. Controls which agents they can see (`departmentScopeMiddleware`).

**API Calls:**
- `GET /api/admin/employees`
- `POST /api/admin/employees` — `{ userId, departmentId }`
- `DELETE /api/admin/employees/:id`

**Data:** `employee_departments` table (userId + departmentId junction)

---

#### `/admin/departments` — Department CRUD

**Purpose:** Create/edit/delete company departments.

**API Calls:**
- `GET/POST /api/admin/departments`
- `PATCH/DELETE /api/admin/departments/:id`

**Data:** `departments`: `name` (max 100), `description`, `is_active`

---

#### `/admin/agents` — Agent CRUD

**Purpose:** Full agent management. Create agents, set tier/model/soul/allowed_tools/isSecretary. Assign to departments. Set reportTo for org hierarchy.

**API Calls:**
- `GET /api/admin/agents`
- `POST /api/admin/agents` — `{ name, nameEn, role, tier, tierLevel, modelName, soul, adminSoul, departmentId, reportTo, allowedTools, isSecretary, autoLearn, enableSemanticCache }`
- `PATCH /api/admin/agents/:id`
- `DELETE /api/admin/agents/:id` — blocked if `isSystem=true`

**Key Constraints:**
- Secretary (`isSecretary=true`): deletion blocked if it is the sole secretary
- `tierLevel`: integer (1=Manager, 2=Specialist, 3=Worker, but dynamic N-tier possible)
- `modelName`: e.g., `'claude-haiku-4-5'`, `'claude-sonnet-4-6'`
- `allowedTools`: JSONB array of tool name strings
- `autoLearn`: bool, default true
- `enableSemanticCache`: bool, default false

---

#### `/admin/credentials` — CLI Credential Management

**Purpose:** Store AES-256 encrypted CLI tokens. One token per user, maps to agent execution.

**API Calls:**
- `GET /api/admin/credentials`
- `POST /api/admin/credentials` — `{ userId, label, token }` → encrypted before insert
- `DELETE /api/admin/credentials/:id`

**Data:** `cli_credentials`: `encryptedToken` (AES-256), `label` (max 100)

---

#### `/admin/companies` — Company Management (superadmin only)

**Purpose:** Platform-level company CRUD. Create tenants, set SMTP, configure settings.

**API Calls:**
- `GET /api/super-admin/companies`
- `POST /api/super-admin/companies` — `{ name, slug }`
- `PATCH /api/super-admin/companies/:id`

**Data:** `companies`: `slug` (unique, max 50), `smtpConfig` JSONB, `settings` JSONB

---

#### `/admin/tools` — Tool Definition Management

**Purpose:** Platform and company tool catalog. Create custom tools with JSON Schema input definitions.

**API Calls:**
- `GET /api/admin/tools`
- `POST /api/admin/tools`
- `PATCH /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`

**Data:** `tool_definitions`: `scope` enum `['platform','company','department']`, `inputSchema` JSONB (Claude tool_use format), `handler` (server function name), `category` (`'search'|'finance'|'content'|'utility'|'communication'`), `tags` JSONB

---

#### `/admin/costs` — Cost Management

**Purpose:** Cost analytics and budget configuration. Set monthly budget thresholds.

**API Calls:**
- `GET /api/admin/costs`
- `GET /api/admin/budget`
- `PATCH /api/admin/budget` — set budget limit

---

#### `/admin/report-lines` — Report Line Configuration

**Purpose:** Set who reports to whom (Human reporting hierarchy, independent of agent hierarchy).

**API Calls:**
- `GET/POST/DELETE /api/admin/report-lines`

**Data:** `report_lines`: `reporter_id` FK users, `supervisor_id` FK users

---

#### `/admin/soul-templates` — Soul Template Library

**Purpose:** Manage reusable agent Soul templates. Publish to template marketplace.

**API Calls:**
- `GET /api/admin/soul-templates`
- `POST /api/admin/soul-templates` — `{ name, description, content, category, tier, allowedTools }`
- `POST /api/admin/soul-templates/:id/publish` — set `isPublished=true`

**Data:** `soul_templates`: `isBuiltin`, `isPublished`, `downloadCount`, `tier`, `allowedTools` JSONB

---

#### `/admin/monitoring` — System Monitoring

**Purpose:** Active session monitoring. WebSocket connection counts, memory usage, CPU load, active agent sessions.

**API Calls:**
- `GET /api/admin/monitoring` — system stats
- WebSocket channel: `monitoring` — live metrics

---

#### `/admin/nexus` — Admin NEXUS Canvas

**Purpose:** Full-edit NEXUS canvas for admin. Drag-and-drop org structure, assign agents to departments, set reportTo.

**Key Components:**
- `components/nexus/company-node.tsx`
- `components/nexus/human-node.tsx`
- `components/nexus/agent-node.tsx`
- `components/nexus/department-node.tsx`
- `components/nexus/unassigned-group-node.tsx`
- `components/nexus/property-panel.tsx`
- `components/nexus/nexus-toolbar.tsx`
- `components/nexus/panels/` (agent-panel, department-panel, human-panel, company-panel)

**API Calls:**
- `GET /api/admin/nexus/layout`
- `PUT /api/admin/nexus/layout`
- `PATCH /api/admin/agents/:id` — update agent position/dept via drag

---

#### `/admin/org-templates` — Org Template Management

**Purpose:** Save/load org structure templates (departments + agents as a bundle).

---

#### `/admin/workflows` — Workflow Builder

**Purpose:** Visual workflow editor using `components/workflow-canvas.tsx`. Create agent workflows with node/edge graph.

---

#### `/admin/api-keys` — API Key Management

**Purpose:** Manage external API credentials (KIS, Notion, email, Telegram). JSONB stored with per-field AES-256-GCM encryption.

**Data:** `api_keys`: `provider` (`'kis'|'notion'|'email'|'telegram'`), `scope` enum `['company','user']`, `credentials` JSONB

---

#### `/admin/mcp-servers` + `/admin/mcp-access` + `/admin/mcp-credentials`

**Purpose:** MCP server registration, access control, and credential management for external MCP integrations.

**Data:** `mcp_servers`: `transport` (default `'stdio'`), `config` JSONB

---

#### `/admin/onboarding` — Onboarding Wizard

**Purpose:** Step-by-step company setup. Company → departments → agents → CLI token → complete.

---

## 4. API Endpoint Map

All endpoints follow `{ success: true, data: T }` / `{ success: false, error: { code: string, message: string } }` response shape.

### Auth Routes (`/api/auth`)

| Method | Path | Request | Response | Auth |
|--------|------|---------|----------|------|
| POST | `/api/auth/login` | `{ username, password, companySlug }` | `{ token, user }` | None |
| POST | `/api/auth/logout` | — | `{ ok: true }` | JWT |
| GET | `/api/auth/me` | — | `{ user: { id, name, role, companyId } }` | JWT |
| POST | `/api/auth/admin/login` | `{ username, password }` | `{ token, admin }` | None |

### Workspace Routes (`/api/workspace/*`) — User JWT required

#### Hub
| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/api/workspace/hub/stream` | `{ message, sessionId?, agentId? }` | SSE stream (6 event types) |

#### Chat
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/chat/sessions` | Ordered by `lastMessageAt DESC` |
| POST | `/api/workspace/chat/sessions` | `{ agentId: UUID, title? }` |
| GET | `/api/workspace/chat/sessions/:id/messages` | `?before=UUID&limit=50` cursor pagination |
| POST | `/api/workspace/chat/sessions/:id/messages` | `{ content, attachmentIds?: UUID[max5] }` — fires background streamTask |
| PATCH | `/api/workspace/chat/sessions/:id` | `{ title: string(max200) }` |
| DELETE | `/api/workspace/chat/sessions/:id` | Cascades: toolCalls→delegations→messages→session |
| GET | `/api/workspace/chat/sessions/:id/delegations` | Inner join with agents for names |
| GET | `/api/workspace/chat/sessions/:id/tool-calls` | All tool calls for session |

#### Agents (Workspace)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/agents` | Active agents; Employee: filtered by `departmentIds` |
| GET | `/api/workspace/agents/hierarchy` | Tree with `children[]` |
| GET | `/api/workspace/agents/delegation-rules` | With `sourceAgentName`, `targetAgentName` |
| GET | `/api/workspace/agents/:id` | Employee: dept scope check |
| PATCH | `/api/workspace/agents/:id/soul` | `{ soul: string(max50000) }` — own agent or CEO |
| POST | `/api/workspace/agents/:id/soul/reset` | Restore `soul = adminSoul` |
| POST | `/api/workspace/agents/delegation-rules` | CEO+ only; cycle detection; max 50 rules |
| DELETE | `/api/workspace/agents/delegation-rules/:id` | CEO+ only |

#### Knowledge
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/knowledge` | Dept-scoped |
| POST | `/api/workspace/knowledge` | Upload + Gemini embedding |
| GET | `/api/workspace/knowledge/search` | `?q=...` semantic search cosine ≥ 0.95 |

#### Dashboard
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/dashboard` | Full stats bundle |

#### Strategy/Trading
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/strategy/watchlists` | With real-time KIS prices |
| POST | `/api/workspace/strategy/watchlists` | `{ stockCode, stockName, market }` |
| DELETE | `/api/workspace/strategy/watchlists/:id` | |
| GET/POST | `/api/workspace/strategy/portfolios` | Paper or real mode |
| POST | `/api/workspace/strategy/portfolios/:id/orders` | FR62: orders are permanent (no DELETE) |

#### Jobs/Schedules/Triggers
| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/workspace/jobs` | Job queue |
| GET | `/api/workspace/jobs/notifications` | Unread results |
| PUT | `/api/workspace/jobs/read-all` | Bulk mark read |
| GET/POST/DELETE | `/api/workspace/schedules` | Cron expressions |
| GET/POST/DELETE | `/api/workspace/triggers` | Event-based ARGOS triggers |

#### Debates (AGORA)
| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/workspace/debates` | |
| GET | `/api/workspace/debates/:id` | With speeches |
| POST | `/api/workspace/debates/:id/start` | Kicks off multi-agent debate |

#### SNS
| Method | Path | Notes |
|--------|------|-------|
| GET/POST/PATCH | `/api/workspace/sns` | Content management |
| POST | `/api/workspace/sns/:id/approve` | Approval workflow |
| POST | `/api/workspace/sns/:id/reject` | `{ reason }` |
| GET/POST | `/api/workspace/sns/accounts` | Platform account credentials |

#### Messenger
| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/workspace/messenger/conversations` | DM + group |
| GET/POST | `/api/workspace/messenger/conversations/:id/messages` | |
| POST/DELETE | `/api/workspace/messenger/messages/:id/reactions` | Emoji reactions |

#### Files
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/files` | Company files for current user |
| POST | `/api/workspace/files/upload` | Multipart |
| DELETE | `/api/workspace/files/:id` | Soft delete |

#### Costs
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/costs` | Grouped by agent/day/provider |

#### Notifications
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/workspace/notifications` | `?limit=N` |
| PATCH | `/api/workspace/notifications/:id/read` | |
| PUT | `/api/workspace/notifications/read-all` | |

#### Reports
| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/workspace/reports` | |
| PATCH | `/api/workspace/reports/:id` | |
| POST | `/api/workspace/reports/:id/submit` | `submittedTo` set to supervisor |
| GET/POST | `/api/workspace/reports/:id/comments` | |

#### Settings
| Method | Path | Notes |
|--------|------|-------|
| GET/PATCH | `/api/workspace/profile` | |
| GET/PATCH | `/api/workspace/notification-preferences` | Per-event-type settings |
| GET | `/api/workspace/settings-mcp` | MCP servers visible to user |

### Admin Routes (`/api/admin/*`) — Admin JWT required

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/dashboard` | Platform KPIs |
| GET/POST/PATCH/DELETE | `/api/admin/agents` | Full agent CRUD |
| GET/POST/PATCH/DELETE | `/api/admin/departments` | |
| GET/POST/PATCH/DELETE | `/api/admin/users` | `{ username, name, email, role }` |
| GET/POST/DELETE | `/api/admin/employees` | User-department mapping |
| GET/POST/DELETE | `/api/admin/credentials` | AES-256 CLI tokens |
| GET/POST/PATCH/DELETE | `/api/admin/tools` | Tool definitions |
| GET | `/api/admin/costs` | Cost analytics |
| GET/PATCH | `/api/admin/budget` | Monthly budget setting |
| GET/POST/DELETE | `/api/admin/report-lines` | Reporting hierarchy |
| GET/POST/PATCH | `/api/admin/soul-templates` | Soul template library |
| POST | `/api/admin/soul-templates/:id/publish` | |
| GET | `/api/admin/monitoring` | System health stats |
| GET/PUT | `/api/admin/nexus/layout` | Canvas layout |
| GET/POST/DELETE | `/api/admin/api-keys` | External API credentials |
| GET/POST/PATCH/DELETE | `/api/admin/mcp-servers` | MCP server management |
| GET/POST/DELETE | `/api/admin/mcp-access` | MCP access control |

### Super-Admin Routes (`/api/super-admin/*`) — Superadmin only

| Method | Path | Notes |
|--------|------|-------|
| GET/POST/PATCH | `/api/super-admin/companies` | Tenant management |

### Health
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | `{ status: 'ok', db: bool, timestamp }` |

### Telegram Webhook
| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/telegram/webhook` | Validates `secret_token`, routes to agent |

---

## 5. Data Model Summary

### Enums

```typescript
userRoleEnum: 'admin' | 'user'
adminRoleEnum: 'superadmin' | 'admin'
agentStatusEnum: 'online' | 'working' | 'error' | 'offline'
messageSenderEnum: 'user' | 'agent'
toolScopeEnum: 'platform' | 'company' | 'department'
delegationStatusEnum: 'pending' | 'processing' | 'completed' | 'failed'
reportStatusEnum: 'draft' | 'submitted' | 'reviewed'
jobStatusEnum: 'queued' | 'processing' | 'completed' | 'failed' | 'blocked'
snsStatusEnum: 'draft' | 'pending' | 'approved' | 'scheduled' | 'rejected' | 'published' | 'failed'
snsPlatformEnum: 'instagram' | 'tistory' | 'daum_cafe' | 'twitter' | 'facebook' | 'naver_blog'
activityLogTypeEnum: 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'
activityPhaseEnum: 'start' | 'end' | 'error'
apiKeyScopeEnum: 'company' | 'user'
invitationStatusEnum: 'pending' | 'accepted' | 'expired' | 'revoked'
agentTierEnum: 'manager' | 'specialist' | 'worker'  // deprecated — use tierLevel integer
commandTypeEnum: 'direct' | 'mention' | 'slash' | 'preset' | 'batch' | 'all' | 'sequential' | 'deepwork'
orchestrationTaskStatusEnum: 'pending' | 'running' | 'completed' | 'failed' | 'timeout'
qualityResultEnum: 'pass' | 'fail'
memoryTypeEnum: 'learning' | 'insight' | 'preference' | 'fact'
tradingModeEnum: 'real' | 'paper'
orderSideEnum: 'buy' | 'sell'
orderStatusEnum: 'pending_approval' | 'pending' | 'submitted' | 'executed' | 'cancelled' | 'rejected' | 'failed'
orderTypeEnum: 'market' | 'limit'
cronRunStatusEnum: 'running' | 'success' | 'failed'
debateStatusEnum: 'pending' | 'in-progress' | 'completed' | 'failed'
debateTypeEnum: 'debate' | 'deep-debate'
argosEventStatusEnum: 'detected' | 'executing' | 'completed' | 'failed'
consensusResultEnum: 'consensus' | 'dissent' | 'partial'
```

### Tables

#### `companies` — Tenant root unit
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, defaultRandom() |
| name | varchar(100) | NOT NULL |
| slug | varchar(50) | NOT NULL, UNIQUE |
| smtp_config | jsonb | NULL — `{ host, port, secure, user, pass }` |
| settings | jsonb | NULL — dashboardQuickActions, etc. |
| is_active | boolean | NOT NULL, default true |
| created_at | timestamp | NOT NULL, defaultNow() |
| updated_at | timestamp | NOT NULL, defaultNow() |

#### `users` — Human users (CEO, H)
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK |
| company_id | uuid | NOT NULL, FK companies.id |
| username | varchar(50) | NOT NULL, UNIQUE |
| password_hash | text | NOT NULL |
| name | varchar(100) | NOT NULL |
| email | varchar(255) | NULL |
| role | user_role | NOT NULL, default 'user' |
| is_active | boolean | NOT NULL, default true |
| created_at, updated_at | timestamp | NOT NULL |
| **Index:** users_company_idx on (company_id) | | |

#### `admin_users` — Admin accounts (separate auth)
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK |
| company_id | uuid | NULL = superadmin; FK companies.id |
| username | varchar(50) | NOT NULL, UNIQUE |
| password_hash | text | NOT NULL |
| name | varchar(100) | NOT NULL |
| email | varchar(255) | NULL |
| role | admin_role | NOT NULL, default 'admin' |
| is_active | boolean | NOT NULL, default true |

#### `sessions` + `admin_sessions` — JWT session tokens
- `sessions`: userId, companyId, token (UNIQUE), expiresAt
- `admin_sessions`: adminUserId, token (UNIQUE), expiresAt

#### `invitations` — Employee invite tokens
- email, role, token (varchar(64), UNIQUE), status (invitation_status), invitedBy FK users, expiresAt, acceptedAt

#### `employee_departments` — User-department junction
- userId FK users, departmentId FK departments, companyId FK companies
- UNIQUE(userId, departmentId)

#### `departments`
| Column | Type |
|--------|------|
| id | uuid PK |
| company_id | uuid NOT NULL FK companies |
| name | varchar(100) NOT NULL |
| description | text |
| is_active | boolean default true |

#### `agents` — AI Agents
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| company_id | uuid FK companies | NOT NULL |
| user_id | uuid FK users | NOT NULL — owner user |
| department_id | uuid FK departments | NULL = unassigned |
| name | varchar(100) | NOT NULL |
| role | varchar(200) | NULL |
| tier | agent_tier | DEPRECATED — use tier_level |
| tier_level | integer | NOT NULL, default 2 (1=Manager, 2=Specialist, 3=Worker) |
| name_en | varchar(100) | NULL — English name for @mention |
| model_name | varchar(100) | NOT NULL, default 'claude-haiku-4-5' |
| report_to | uuid | NULL — self-reference for hierarchy |
| soul | text | NULL — markdown personality (max 50,000 chars) |
| admin_soul | text | NULL — original soul for reset |
| status | agent_status | NOT NULL, default 'offline' |
| owner_user_id | uuid FK users | NULL — CLI token owner mapping |
| is_secretary | boolean | NOT NULL, default false |
| is_system | boolean | NOT NULL, default false — deletion protected |
| allowed_tools | jsonb | default [] — string[] of tool names |
| auto_learn | boolean | NOT NULL, default true |
| enable_semantic_cache | boolean | NOT NULL, default false |
| is_active | boolean | NOT NULL, default true |

#### `tier_configs` — Dynamic N-Tier configuration
| Column | Type |
|--------|------|
| company_id | uuid NOT NULL FK |
| tier_level | integer NOT NULL |
| name | varchar(100) NOT NULL |
| model_preference | varchar(100) NOT NULL default 'claude-haiku-4-5' |
| max_tools | integer NOT NULL default 10 |
| UNIQUE(company_id, tier_level) | |

#### `cli_credentials` — CLI tokens (AES-256)
- company_id, user_id FK users, label (max 100), encrypted_token text, is_active

#### `api_keys` — External API credentials
- provider varchar(50), label, credentials JSONB (per-field AES-256-GCM), scope (api_key_scope)

#### `chat_sessions`
- company_id, user_id, agent_id FK agents, title (max 200), metadata JSONB, last_message_at

#### `chat_messages`
- session_id FK chat_sessions, sender (message_sender), content text, attachment_ids text (JSON array of UUIDs)
- **Index:** (session_id, created_at)

#### `agent_memory` — Long-term agent memory
- agent_id FK agents, key varchar(200), value text, metadata JSONB

#### `tool_definitions`
- company_id (NULL=platform), name (max 100), scope (tool_scope), input_schema JSONB (Claude format), handler varchar(100), category varchar(50), tags JSONB

#### `agent_tools` — Agent-tool mapping
- agent_id, tool_id FK tool_definitions, is_enabled

#### `report_lines` — Human reporting hierarchy
- reporter_id FK users, supervisor_id FK users, company_id

#### `delegations` — Secretary delegation tracking
- session_id, secretary_agent_id, target_agent_id FK agents, parent_delegation_id (self-ref), user_message, delegation_prompt, agent_response, status (delegation_status), depth integer (0=direct)

#### `reports` + `report_comments`
- reports: author_id, title (max 200), content text, status (report_status), submitted_to FK users
- report_comments: report_id FK reports, author_id FK users, content text

#### `department_knowledge`
- department_id FK departments, title (max 200), content text, category, created_by FK users

#### `tool_calls` — Tool execution log
- session_id, agent_id, tool_id, tool_name varchar(100), input JSONB, output text, status varchar(20) ('success'|'error'|'timeout'), duration_ms
- **Index:** (company_id, created_at), (agent_id), (tool_name)

#### `night_jobs` — Background job queue
- user_id, agent_id, session_id, schedule_id, trigger_id, instruction text, status (job_status), result text, result_data JSONB, error text, retry_count (default 0), max_retries (default 3), scheduled_for, started_at, completed_at, is_read, parent_job_id (self-ref chain), chain_id uuid

#### `night_job_schedules` — Recurring schedules
- agent_id, name (max 200), instruction, cron_expression (max 100), next_run_at, last_run_at, is_active

#### `night_job_triggers` — ARGOS event triggers
- agent_id, name, instruction, trigger_type varchar(50), condition JSONB, cooldown_minutes (default 30), last_triggered_at

#### `cron_runs` — Schedule execution log
- cron_job_id FK night_job_schedules CASCADE, status (cron_run_status), command_text, started_at, completed_at, result, error, duration_ms, tokens_used, cost_micro

#### `argos_events` — ARGOS trigger event log
- trigger_id FK night_job_triggers CASCADE, event_type, event_data JSONB, status (argos_event_status), result, error, duration_ms

#### `sns_accounts`
- platform (sns_platform), account_name, account_id (max 200), credentials text (AES-256-GCM JSON), is_active

#### `sns_contents`
- agent_id, sns_account_id FK sns_accounts, created_by FK users, platform (sns_platform), title (max 200), body text, hashtags, image_url, status (sns_status), reviewed_by, reviewed_at, reject_reason, published_url, published_at, publish_error, scheduled_at, variant_of (self-ref A/B), priority (default 0), is_card_news, card_series_id (self-ref), card_index

#### `activity_logs` — Activity audit log
- event_id uuid UNIQUE (idempotent INSERT), type (activity_log_type), phase (activity_phase), actor_type varchar(20), actor_id uuid, actor_name varchar(100), action varchar(200), detail text, metadata JSONB
- **Index:** (company_id, created_at), (type), GIN on metadata

#### `notifications`
- user_id, type varchar(30), title (max 200), body, action_url (max 500), is_read
- **Index:** (company_id, user_id, created_at), (user_id, is_read)

#### `cost_records`
- agent_id, session_id, provider varchar(50) default 'anthropic', model varchar(100), input_tokens, output_tokens, cost_usd_micro integer (1 = $0.000001), source varchar(50), is_batch

#### `telegram_configs`
- company_id FK UNIQUE, bot_token text (encrypted), ceo_chat_id varchar(50), webhook_secret varchar(100), webhook_url text, is_active

#### `messenger_channels`, `messenger_members`, `messenger_messages`, `messenger_reactions`
- channels: name (max 100), created_by FK users
- members: channel_id, user_id, last_read_at
- messages: channel_id, user_id, parent_message_id (self-ref), content, attachment_ids text (JSON)
- reactions: message_id, user_id, emoji varchar(20) — UNIQUE(message_id, user_id, emoji)

#### `conversations` + `conversation_participants` + `messages` — 1:1/group chat
- conversations: type varchar(20) ('direct'|'group'), name varchar(255), is_active
- conversation_participants: PK(conversation_id, user_id), last_read_at
- messages: conversation_id, sender_id FK users, content text, type varchar(20) ('text'|'system'|'ai_report'), is_deleted

#### `files`
- user_id FK users, filename (max 255), mime_type (max 100), size_bytes integer, storage_path text, is_active

#### `strategy_watchlists`
- user_id, stock_code varchar(20), stock_name varchar(100), market varchar(10) default 'KOSPI', sort_order
- UNIQUE(company_id, user_id, stock_code)

#### `strategy_notes` + `strategy_note_shares`
- notes: user_id, stock_code, title (max 200), content text
- shares: note_id CASCADE, shared_with_user_id FK users — UNIQUE(note_id, shared_with_user_id)

#### `strategy_backtest_results`
- user_id, stock_code, strategy_type varchar(50), strategy_params JSONB, signals JSONB, metrics JSONB, data_range varchar(50)

#### `strategy_portfolios`
- user_id, name (max 100), trading_mode (trading_mode), initial_cash integer (default 50_000_000), cash_balance integer, holdings JSONB array `[{ticker, name, market, quantity, avgPrice, currentPrice?}]`, total_value integer, memo text

#### `strategy_orders` — Permanent (no DELETE — FR62)
- portfolio_id, agent_id, ticker varchar(20), ticker_name varchar(100), side (order_side), quantity, price, total_amount, order_type (order_type), trading_mode (trading_mode), status (order_status), reason text, kis_order_no varchar(50), executed_at

#### `agent_delegation_rules`
- source_agent_id FK agents, target_agent_id FK agents, condition JSONB `{ keywords: string[], departmentId?: string }`, priority (default 0), is_active
- Max 50 rules per company (enforced in API)

#### `canvas_layouts` — NEXUS canvas state
- name (max 100) default 'default', layout_data JSONB, is_default

#### `soul_templates`
- company_id (NULL=platform builtin), name (max 100), content text NOT NULL, category varchar(50), is_builtin, is_active, is_published, published_at, download_count (default 0), tier varchar(20), allowed_tools JSONB

#### `push_subscriptions` — Web Push (PWA)
- user_id, endpoint text NOT NULL, p256dh text, auth text — UNIQUE(endpoint)

#### `nexus_workflows` + `nexus_executions`
- workflows: name (max 200), nodes JSONB, edges JSONB, is_template, created_by FK users
- executions: workflow_id FK, status varchar(20), result JSONB, started_at, completed_at

#### `mcp_servers`
- name (max 100), url text, transport varchar(20) default 'stdio', config JSONB, is_active

#### `sketches` + `sketch_versions` — SketchVibe canvas
- sketches: name (max 200), graph_data JSONB `{"nodes":[],"edges":[]}`, knowledge_doc_id (FK to knowledge docs — linked knowledge)
- sketch_versions: sketch_id CASCADE, version integer, graph_data JSONB — UNIQUE(sketch_id, version)

#### `commands` — CEO command history
- user_id, type (command_type), text NOT NULL, target_agent_id FK agents, status varchar(20), result text, metadata JSONB

#### `orchestration_tasks` — Task tracking
- command_id FK commands, agent_id FK agents, parent_task_id (self-ref chain), type varchar(30), input text, output text, status (orchestration_task_status), started_at, completed_at, duration_ms, metadata JSONB

#### `quality_reviews` — QA gate results
- command_id FK commands, task_id FK orchestration_tasks, reviewer_agent_id FK agents, conclusion (quality_result), scores JSONB `{conclusionQuality, evidenceSources, riskAssessment, formatCompliance, logicalCoherence}`, feedback text, attempt_number (default 1)

#### `presets` — Command presets
- user_id FK users, name, command (expanded text), sort_order (tracks frequency)

---

## 6. Engine Architecture

### Single Entry Point (D6)

All agent execution goes through `packages/server/src/engine/agent-loop.ts`. No exceptions.

```
Hub → POST /api/workspace/hub/stream
Telegram → POST /api/telegram/webhook
Night Jobs → services/job-runner.ts
AGORA Debates → services/debate-runner.ts
Auto Trading → services/trading-executor.ts
SketchVibe MCP → src/mcp/sketchvibe-mcp.ts
          ↓ (all paths)
  engine/agent-loop.ts
    → runAgent(options: RunAgentOptions)
    → SessionContext creation
    → soul-renderer.ts (template variable substitution)
    → model-selector.ts (tierLevel → Claude model string)
    → SDK messages.create() with cache_control (Prompt Cache — D17)
    → Hook pipeline
    → sse-adapter.ts → SSE events to client
```

### SessionContext (E1 — Immutable, Readonly)

```typescript
// engine/types.ts — SERVER INTERNAL ONLY (never re-export to shared)
interface SessionContext {
  readonly cliToken: string;        // Anthropic API key
  readonly userId: string;          // User UUID
  readonly companyId: string;       // Tenant isolation
  readonly depth: number;           // Current handoff depth (max = maxDepth)
  readonly sessionId: string;       // Full chain trace ID
  readonly startedAt: number;       // Unix ms — 120s timeout check
  readonly maxDepth: number;        // Company-configured (default 5)
  readonly visitedAgents: readonly string[];  // Branch-level cycle detection
  readonly runId: string;           // Groups all tool calls in one session
}
```

**Spread copy rule:** `{ ...ctx, depth: ctx.depth + 1, visitedAgents: [...ctx.visitedAgents, newId] }`
Mutation (`ctx.depth += 1`) = compile error. Created only in `agent-loop.ts`.

### Soul Renderer (E4)

6 template variables: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}`
Plus dynamic: `{{knowledge_context}}` (injected by `collectKnowledgeContext()` when soul contains it)
**Rule:** Double curly braces only. Failed substitution → empty string (not error). User input never injected.

### Hook Pipeline (D4 — security-ordered, violations = security incident)

```
PreToolUse:
  1. tool-permission-guard.ts — deny if toolName not in agent.allowedTools[]

PostToolUse:
  1. credential-scrubber.ts — @zapier/secret-scrubber masking
  2. output-redactor.ts — additional pattern masking
  3. delegation-tracker.ts — WebSocket handoff event (uses already-masked data)

Stop:
  1. cost-tracker.ts — record to cost_records table
```

**Hook signatures (E2):**
```typescript
PreToolUse: (ctx: SessionContext, toolName: string, toolInput: unknown) => PreToolHookResult
PostToolUse: (ctx: SessionContext, toolName: string, toolOutput: string) => string
Stop:       (ctx: SessionContext, usage: { inputTokens: number; outputTokens: number }) => void
```

### Engine Boundary (E8)

**Public API (importable from outside engine/):**
- `engine/agent-loop.ts` → `runAgent()`
- `engine/types.ts` → `SessionContext`, `SSEEvent`, `RunAgentOptions`

**Internal only (never import from routes/ or lib/):**
- `engine/soul-renderer.ts`
- `engine/model-selector.ts`
- `engine/sse-adapter.ts`
- `engine/hooks/*`
- `engine/semantic-cache.ts`

**CI check (`ci/engine-boundary-check.sh`):**
```bash
grep -rn "from.*engine/hooks/" packages/server/src/routes/ packages/server/src/lib/
# → any match = CI failure
```

### Error Code System (D3)

```typescript
// lib/error-codes.ts
AUTH_INVALID_CREDENTIALS, AUTH_TOKEN_EXPIRED, AUTH_FORBIDDEN
AGENT_NOT_FOUND, AGENT_SPAWN_FAILED, AGENT_TIMEOUT
SESSION_LIMIT_EXCEEDED, SESSION_MEMORY_LIMIT
HANDOFF_DEPTH_EXCEEDED, HANDOFF_CIRCULAR, HANDOFF_TARGET_NOT_FOUND
TOOL_PERMISSION_DENIED, TOOL_EXECUTION_FAILED
HOOK_PIPELINE_ERROR
ORG_SECRETARY_DELETE_DENIED, ORG_TIER_LIMIT_EXCEEDED
```

---

## 7. Real-time Features

### SSE Reconnection Strategy

**Hub SSE uses `POST`, not `EventSource`.** The browser `EventSource` API only supports `GET` requests and cannot send a request body. The Hub requires `POST /api/workspace/hub/stream` with `{ message, sessionId?, agentId? }` in the body.

**Client Implementation Pattern:**
```typescript
// Hub page uses fetch() with ReadableStream reader — NOT EventSource
const response = await fetch('/api/workspace/hub/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message, sessionId, agentId }),
})
const reader = response.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const text = decoder.decode(value)
  // parse "event: type\ndata: {...}\n\n" chunks
}
```

**Reconnection:** Because it's a POST, there is no browser-native auto-reconnect (EventSource handles that automatically). The UXUI must handle reconnection manually:
- On network error mid-stream: surface error to user; do NOT auto-retry silently (the agent may have already executed)
- On `event: error` received: stream is considered terminated — show error state, allow user to retry manually
- On `event: done`: stream complete — clear loading state
- Session continuity: `sessionId` (UUID) is passed back in `event: accepted` and can be reused in subsequent messages to continue the same conversation context

### SSE Events (6 types — E5)

All SSE responses use headers:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

```typescript
type SSEEvent =
  | { type: 'accepted';   sessionId: string }                                          // Server received message (~50ms)
  | { type: 'processing'; agentName: string }                                          // SDK ready (~2s)
  | { type: 'handoff';    from: string; to: string; depth: number }                   // call_agent fired
  | { type: 'message';    content: string }                                            // streaming chunk
  | { type: 'error';      code: string; message: string; agentName?: string }         // failure
  | { type: 'done';       costUsd: number; tokensUsed: number }                       // session complete
```

**Pre-spawn event sequence:**
```
User sends message → server receives (0ms)
  → emit 'accepted' (≤50ms) → UI shows "명령 접수됨" + spinner
  → SDK spawn (~2s)
  → emit 'processing' { agentName } → UI shows "에이전트명 분석 중..."
  → emit 'message' chunks (streaming)
  → emit 'done' { costUsd, tokensUsed }
```

### WebSocket Channels

Hono WebSocket (`createBunWebSocket`). Channel multiplexing via `broadcastToChannel(channelKey, event)`.

| Channel Pattern | Data | Consumer |
|-----------------|------|---------|
| `chat-stream::{sessionId}` | `token`, `tool-start`, `tool-end`, `done`, `error` | ChatPage |
| `dashboard` | Live cost/task updates | DashboardPage |
| `monitoring` | System health stats | Admin monitoring |
| `notifications::{userId}` | New notification events | Layout notification badge |
| `nexus::{companyId}` | Canvas state changes | NexusPage |
| `trading::{userId}` | Price updates, order fills | TradingPage |
| `delegation::{sessionId}` | Handoff chain events | Hub tracker panel |

### Polling Patterns (fallback to SSE/WS)

- Job notifications: 30s interval (`useQuery refetchInterval: 30_000`)
- Recent notifications: 300s interval (`refetchInterval: 300_000`)
- Dashboard: WebSocket preferred, polling fallback
- Watchlist prices: 60s auto-refresh

---

## 8. Design Constraints for UXUI

### v1 Must-Have Features (Non-Negotiable)

1. **Command Center**: Text input → @mention → slash commands (8 types) → presets. Real-time SSE streaming with handoff tracker.
2. **Soul Editor**: Markdown text editor with 50,000 char limit. Reset to adminSoul button. No page reload required.
3. **autoLearn**: After every chat response, UI shows "학습됨 N건" if `learnedCount > 0` in done event.
4. **Conversation History**: Infinite scroll (cursor pagination) with `hasMore` flag. `before=UUID` cursor.
5. **File Attachments**: Drag-drop upload, max 5 files per message, file type shown in message.
6. **Tool Call Cards**: Every tool call must be visually distinct (`components/chat/tool-call-card.tsx` pattern). Shows toolName, input/output, durationMs, status.
7. **Markdown Rendering**: Full CommonMark + code blocks with syntax highlighting (`components/markdown-renderer.tsx`).
8. **Delegation Chain Visualization**: Real-time "비서실장 → CMO → 콘텐츠 전문가" tracker. Depth shown.
9. **NEXUS Canvas**: 60fps. React Flow. Drag-and-drop. ELK.js auto-layout button.
10. **AGORA Debate**: Round-by-round speech stream. Diff view. Consensus/dissent result display.
11. **Trading**: Watchlist with 60s refresh. Paper/real toggle clearly distinct. Order history permanent (no delete UI).
12. **Budget Alert**: Modal `components/budget-exceeded-modal.tsx` — fires when cost exceeds threshold.

### NFR Budgets (Design Must Respect)

| Constraint | Value |
|-----------|-------|
| Concurrent sessions | 20 max (rate limiter returns 429) |
| Session memory | ≤ 200MB |
| Agent E2E response | ≤ 60s (120s hard timeout in SessionContext.startedAt) |
| NEXUS canvas | 60fps (Canvas rendering — React Flow) |
| API P95 latency | ≤ 200ms (excluding LLM) |
| Browser support | Chrome P0, Safari P1, Firefox/Edge P2 |
| Accessibility | WCAG 2.1 AA — aria-live on SSE regions, color contrast ratios |
| Conversation storage | Unlimited — never auto-delete chat_messages |
| Orders | Permanent — never show delete UI for strategy_orders |

### Data Flow Patterns for UXUI

**Agent Status Sorting (home.tsx pattern):**
```
secretary first → online → working → error → offline → alphabetical
```

**Department Scope:**
- Users with `employee_departments` records: only see agents in their departments
- Users without records (CEO): see all agents
- This means agent lists may be empty — UI must handle empty states gracefully

**Tenant Isolation:**
- `companyId` is always injected server-side from JWT
- UI never sends companyId in request body
- All queries are automatically scoped via `getDB(ctx.companyId)` or `WHERE company_id = ?`

**Auth Architecture:**
- App (`/`): JWT in `localStorage`, key `corthex_auth_token` (managed by `useAuthStore`)
- Admin (`/admin`): Separate JWT, separate localStorage key
- Theme: `localStorage` key `corthex_theme` — `'system'|'light'|'dark'`, applied via `document.documentElement.classList`

**Existing Color System (actual Tailwind classes in use):**

| Color | Usage | Class Examples |
|-------|-------|---------------|
| Slate 900/950 | Page backgrounds | `bg-slate-900`, `bg-slate-950` |
| Slate 800 | Card backgrounds | `bg-slate-800/40`, `bg-slate-800/80` |
| Slate 700 | Borders | `border-slate-700/50` |
| White | Primary text | `text-white` |
| Slate 400/500 | Secondary text | `text-slate-400`, `text-slate-500` |
| Cyan 400 | Active/online state, section headings | `text-cyan-400`, `bg-cyan-500/15` |
| Violet 400 | Jobs/overnight/special features | `text-violet-400`, `bg-violet-500/20` |
| Emerald 400 | Success/completed/online | `text-emerald-400`, `bg-emerald-500/10` |
| Amber 400 | Secretary badge, quick-start section | `text-amber-400`, `bg-amber-500/15` |
| Red 400 | Error/failed | `text-red-400`, `bg-red-500/10` |
| Blue 400 | Working state, tasks | `text-blue-400`, `bg-blue-500/20` |

**Card Layout Pattern (home.tsx):**
```
rounded-2xl + bg-gradient-to-br from-{color}-600/15 via-slate-800/80 to-slate-800/80
+ border border-{color}-500/15 hover:border-{color}-500/30
+ overflow-hidden (decorative circle: absolute top-0 right-0 w-N h-N rounded-full)
```

**Status Dot Pattern:**
- `online`: `bg-emerald-400 animate-pulse`
- `working`: `bg-blue-400 animate-pulse`
- `error`: `bg-red-400` (no pulse)
- `offline`: `bg-slate-500` (no pulse)

**PWA:** Service worker registered in `packages/app/src/main.tsx`. Push subscriptions stored in `push_subscriptions` table.

---

_End of CORTHEX Technical Specification_
_Generated: 2026-03-15 | Source: packages/server/src/db/schema.ts, packages/app/src/App.tsx, packages/admin/src/App.tsx, packages/server/src/routes/*, _bmad-output/planning-artifacts/architecture.md_
