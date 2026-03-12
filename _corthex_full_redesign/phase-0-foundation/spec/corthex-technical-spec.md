# CORTHEX v2 — Technical Specification for UXUI Redesign

> This document is the canonical technical reference for all UXUI redesign work.
> Every design decision must be grounded in the actual system described here.

---

## 1. System Overview

### 1.1 Monorepo Structure (Turborepo)

```
corthex-v2/
├── packages/
│   ├── server/          # Hono + Bun — REST API + SSE + WebSocket
│   ├── app/             # React 19 + Vite 6 — User-facing SPA (CEO/Employee)
│   ├── admin/           # React 19 + Vite 6 — Admin SPA (Company Admin)
│   ├── ui/              # @corthex/ui — Shared component library (CVA + Tailwind)
│   └── shared/          # @corthex/shared — Shared TypeScript types
├── Dockerfile
└── .github/workflows/   # GitHub Actions CI/CD
```

### 1.2 Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Runtime | Bun | ARM64 Oracle VPS |
| Backend Framework | Hono | REST + SSE + WebSocket |
| Database | PostgreSQL + Drizzle ORM | Neon serverless |
| Vector Search | pgvector | Semantic caching + knowledge RAG |
| Frontend | React 19 + Vite 6 | Two SPAs: app (user) + admin |
| Styling | Tailwind CSS 4 | @corthex/ui CVA components |
| State | Zustand + TanStack Query | UI state + server cache |
| Auth | JWT | RBAC: see role mapping below |
| Realtime | SSE + WebSocket | SSE for agent streams, WS for handoff tracking |
| AI Engine | @anthropic-ai/claude-agent-sdk 0.2.x | engine/agent-loop.ts single entry point |
| Embedding | Google Gemini API | pgvector knowledge embeddings |
| Infra | Oracle Cloud ARM64 24GB 4-core | Docker + GitHub Actions self-hosted runner |
| CDN | Cloudflare | Cache purge on deploy |

> **RBAC Role Mapping (UX label → DB enum)**
>
> | UX Label | DB Table | DB Enum Value | Notes |
> |----------|----------|---------------|-------|
> | CEO / Employee | `users` | `role: 'admin'` or `role: 'user'` | `user_role` enum: `['admin','user']`. "CEO" = user with `role:'user'`. No `ceo` or `employee` enum at DB level. |
> | Company Admin | `admin_users` | `role: 'admin'` | `admin_role` enum: `['superadmin','admin']` |
> | Super Admin | `admin_users` | `role: 'superadmin'` | Platform-wide admin, `companyId: null` |
>
> **Never use `ceo` or `employee` in code-level role checks.** Use `users.role: 'user'` for all non-admin workspace users.

### 1.3 Deploy Pipeline

```
git push main
  → GitHub Actions (self-hosted runner on same VPS)
    → turbo build (server + app + admin)
    → npx tsc --noEmit (type check — fails build on error)
    → Docker image build + restart
    → Cloudflare cache purge
```

---

## 2. User-Facing Pages (App — packages/app)

Base URL: `https://[domain]/` (React SPA, React Router)

### 2.1 `/login` — Login Page
- **Purpose**: JWT authentication for CEO and employee users
- **Key Components**: Login form (username + password)
- **API Endpoints**: `POST /api/auth/login`
- **Data**: Issues JWT stored in localStorage

### 2.2 `/onboarding` — Onboarding Page ⚠️ DEFERRED
> **Out of scope for this redesign phase.** Memory note: "온보딩 X (나중에)". Do NOT design this screen now.

- **Purpose**: First-time setup wizard for new users
- **Key Components**: OnboardingPage
- **API Endpoints**: `POST /api/onboarding/*`
- **Data**: Company setup, initial org structure

### 2.3 `/` (index) — Home Page
- **Purpose**: Landing page shown immediately after login. Renders its own content (not a redirect). Shows quick-start links to Hub, Dashboard, and recent activity. Does NOT auto-redirect to /hub.
- **Key Components**: HomePage
- **API Endpoints**: `GET /api/workspace/dashboard/summary` (stats), `GET /api/workspace/activity-log?limit=5` (recent)
- **Data**: Summary stats (task count, cost, agent count), recent activity list, quick action buttons linking to /hub, /dashboard, /knowledge

### 2.4 `/hub` — Hub (허브)
- **Purpose**: PRIMARY work surface. CEO types commands; AI agents respond via SSE stream. Supports @mention (direct agent), secretary routing, slash commands, presets. Real-time handoff chain tracking.
- **Key Components**: `HubPage`, `AgentPickerPanel`, `ChatArea`, `SessionPanel`, `ToolCallCard`, `MarkdownRenderer`
- **API Endpoints**:
  - `POST /api/workspace/hub/stream` — SSE streaming (agent execution, returns text/event-stream)
  - `GET /api/workspace/conversations` — list past sessions
  - `GET /api/workspace/agents` — agent list for picker
  - `GET /api/workspace/presets` — saved command presets
- **Data Flow**: User message → resolve agent (@mention / secretary) → render Soul → SessionContext → runAgent() → SSE events (accepted → processing → handoff → message → done)
- **SSE Events**:
  - `accepted` — command received (instant)
  - `processing` — SDK spawned, agent thinking
  - `handoff` — delegation chain step: `{ from, to, depth }`
  - `message` — streaming text chunks
  - `error` — `{ code, message, agentName? }`
  - `done` — `{ costUsd, tokensUsed }`

#### 2.4.1 Tracker Panel (핸드오프 트래커)
CORTHEX's most distinctive real-time UI element. Visualizes the live delegation chain as agents pass tasks to sub-agents.

> **Layout constraint**: Hub is a **3-column layout** when Tracker is expanded: `[SessionPanel (left)] [ChatArea (flex-1 center)] [TrackerPanel (right w-80)]`. This determines all element width calculations for Hub — designers MUST design Hub with this 3-column structure.

- **Placement**: **Persistent right sidebar within Hub, `w-80` (320px).** Always rendered in the DOM during an active agent session. Collapses to icon-only strip (`w-12`) when there are no active handoffs. Expands automatically on first `handoff` SSE event.
- **Visibility logic**:
  - No active session → icon-only strip (collapsed, w-12)
  - Active session, no handoffs (single agent) → still present as icon strip — shows agent name + elapsed time
  - Active session, handoffs occurring → auto-expands to full w-80
  - User can manually toggle between expanded/collapsed at any time
- **Data Shape** (accumulated from SSE `handoff` events):
  ```typescript
  [
    { from: "비서실장", to: "CTO", depth: 1, timestamp: 1234567890, status: 'completed' },
    { from: "CTO", to: "백엔드전문가", depth: 2, timestamp: 1234567895, status: 'active' },
  ]
  ```
- **Visual Pattern**: Vertical linear timeline (not a tree). Each step = one row: agent name (from) → arrow icon → agent name (to) + depth badge (e.g., "D2"). Active step has animated pulse. Completed steps show ✓ checkmark. Failed steps show ✕ in red.
- **Deep Work Steps**: For single-agent autonomous tasks (계획수립→데이터수집→분석→초안→최종보고서), `processing` event content updates a "current step" subtitle below the agent name in real-time.
- **Cost Display**: On `done` SSE event, shows total cost badge (`$X.XXXX`) and token count at the bottom of the tracker panel.

### 2.5 `/command-center` — Command Center
- **Purpose**: Advanced command interface with slash commands, preset management, AGORA debate trigger
- **Key Components**: CommandCenterPage
- **API Endpoints**: `POST /api/commands/*`, `GET/POST /api/workspace/presets`
- **Data**: Slash commands (/전체, /순차, /토론, /심층토론, /도구점검, /배치실행, /배치상태, /명령어), presets CRUD

### 2.6 `/chat` — Chat Page
- **Purpose**: Direct 1:1 conversation with a specific agent (persistent session history)
- **Key Components**: ChatArea, SessionPanel, ToolCallCard, ReportDetailModal, MarkdownRenderer
- **API Endpoints**:
  - `GET /api/workspace/chat/sessions` — session list
  - `POST /api/workspace/chat/sessions` — create session
  - `GET /api/workspace/chat/sessions/:id/messages` — message history
  - `POST /api/workspace/hub/stream` — send message (SSE)
- **Data**: ChatSession, ChatMessage[], agent info

### 2.7 `/dashboard` — Dashboard (작전현황)
- **Purpose**: Operations overview — today's tasks, costs, agent count, AI usage charts, quick actions, CEO satisfaction tracking
- **Key Components**: DashboardPage
- **API Endpoints**:
  - `GET /api/workspace/dashboard/summary` — stats cards (tasks, costs, agents, integrations)
  - `GET /api/workspace/dashboard/usage` — AI provider call counts
  - `GET /api/workspace/dashboard/budget` — daily/monthly limits + progress
- **Data**: 4 summary cards (today tasks, today cost, agent count, external integrations), provider bar chart, budget progress bars (green→yellow→red), quick action buttons, recent commands

### 2.8 `/reports` and `/reports/:id` — Reports Page (기밀문서 / Archive)
- **Purpose**: Report archive — browse, filter (dept/grade), similarity search, A/B compare
- **Key Components**: ReportsPage, ReportDetailModal
- **API Endpoints**: `GET /api/workspace/reports`, `GET /api/workspace/archive`
- **Data**: Report list, report content, metadata (department, classification level)

### 2.9 `/jobs` — Jobs Page (배치 작업)
- **Purpose**: Batch job queue — pending/processing/completed/failed jobs, batch status tracking
- **Key Components**: JobsPage
- **API Endpoints**: `GET /api/workspace/jobs`, `POST /api/workspace/jobs`
- **Data**: Job status (queued/processing/completed/failed/blocked), currentStep, cost

### 2.10 `/sns` — SNS Page (SNS 통신국)
- **Purpose**: Multi-platform SNS content management — create, approve, schedule, publish to Instagram/Tistory/Daum/Twitter/Facebook/Naver Blog
- **Key Components**: SnsPage, ContentTab, QueueTab, CardNewsTab, AccountsTab, StatsTab, StatusStepper
- **API Endpoints**:
  - `GET/POST /api/workspace/sns/content` — content CRUD
  - `GET /api/workspace/sns/queue` — publish queue
  - `GET /api/workspace/sns/accounts` — SNS account list
- **Data**: SnsContent (status: draft→pending→approved→scheduled→published/failed), platform, card series (5–10 cards), metrics (views/likes/shares)

### 2.11 `/messenger` — Messenger (사내 메신저)
- **Purpose**: Internal human-to-human messaging within same company
- **Key Components**: ConversationsView, ConversationChat, ConversationsPanel, NewConversationModal, ShareToConversationModal
- **API Endpoints**: `GET/POST /api/workspace/messenger/conversations`, WebSocket for real-time
- **Data**: Conversations, messages (text + shared reports)

### 2.12 `/ops-log` — Operations Log (통신로그)
- **Purpose**: 4-tab activity log — Activity (agent activity), Communication (delegation chain from→to, cost, tokens), QA (quality gate results), Tools (tool call records)
- **Key Components**: OpsLogPage, ActivityLogPage
- **API Endpoints**: `GET /api/workspace/activity-log`, `GET /api/workspace/activity-tabs`
- **Data**: activity_log_type: chat/delegation/tool_call/job/sns/error/system/login

### 2.13 `/nexus` — NEXUS (조직도 + SketchVibe)
- **Purpose**: Org chart visualization (React Flow) + AI-powered canvas drawing (SketchVibe with Cytoscape.js + MCP SSE)
- **Key Components**: NexusPage, AgentNode, DepartmentNode, CompanyNode, WorkflowEditor, SketchVibeNodes, ExecutionHistoryPanel, NexusInfoPanel, NodeDetailPanel
- **API Endpoints**:
  - `GET /api/workspace/nexus/org` — org tree
  - `POST /api/workspace/nexus/layout` — save layout
  - `GET/POST /api/workspace/sketches` — SketchVibe save/load
  - MCP SSE for AI canvas editing
- **Data**: Org hierarchy (company → departments → agents + humans), canvas state (Mermaid↔Cytoscape), 8 node types (agent/system/api/decide/db/start/end/note)

### 2.14 `/trading` — Trading (전략실)
- **Purpose**: Investment portfolio dashboard — real-time watchlist (60s refresh), portfolio P&L, auto-trading (KIS API), paper trading, CIO analysis chat
- **Key Components**: TradingPage, ChartPanel, BacktestPanel, ApprovalQueue, ComparisonPanel, ChatPanel, ExportDialog
- **API Endpoints**: `GET/POST /api/workspace/strategy/*`
- **Data**: Portfolio (cash/holdings/returns), watchlist (KR/US markets), orders (pending_approval→executed), paper trading

### 2.15 `/files` — Files Page
- **Purpose**: File attachment management for AI context
- **Key Components**: FilesPage
- **API Endpoints**: `GET/POST /api/workspace/files`
- **Data**: Uploaded files for agent context injection

### 2.16 `/org` — Org Page (조직도 뷰어)
- **Purpose**: Read-only org structure visualization
- **Key Components**: OrgPage
- **API Endpoints**: `GET /api/workspace/org-chart`
- **Data**: Department tree, agent roster

### 2.17 `/activity-log` — Activity Log
- **Purpose**: Full historical activity log with search/filter
- **Key Components**: ActivityLogPage
- **API Endpoints**: `GET /api/workspace/activity-log`
- **Data**: All activity events with timestamp, type, cost, tokens

### 2.18 `/costs` — Costs Page (비용 관리)
- **Purpose**: AI usage cost tracking — by agent, model, department. Donut chart (dept), bar chart (agent). Daily/monthly budget alerts.
- **Key Components**: CostsPage
- **API Endpoints**: `GET /api/workspace/dashboard/costs`, `GET /api/admin/costs`
- **Data**: CostRecord (provider/model/tokens/cost), budget limits, threshold alerts

### 2.19 `/cron` — Cron Base (크론기지 / ARGOS Schedule)
- **Purpose**: Cron job management — schedule recurring agent tasks, presets (daily 9am, weekly Mon 10am), custom cron expressions, enable/disable, last_run/next_run
- **Key Components**: CronBasePage
- **API Endpoints**: `GET/POST /api/workspace/schedules`
- **Data**: Schedule (cron expression, agentId, command, isActive, lastRun, nextRun)

### 2.20 `/argos` — ARGOS Page (정보 수집)
- **Purpose**: Automated information collection — trigger-based (condition-fire), real-time status bar (Data OK / AI OK / trigger count / today cost), activity log, error log
- **Key Components**: ArgosPage
- **API Endpoints**: `GET/POST /api/workspace/argos/*`, `GET /api/workspace/triggers`
- **Data**: ArgosEvent (status: detected→executing→completed/failed), trigger conditions

### 2.21 `/agora` — AGORA Page (토론 엔진)
- **Purpose**: Multi-agent group debate — 2-round (debate) or 3-round (deep-debate). Async polling-based (NOT streaming). Diff view, book format summary, consensus/dissent result.
- **Key Components**: `AgoraPage`, `SpeechCard`, `DebateTimeline`, `DebateResultCard`, `ConsensusCard`, `DiffView`, `CreateDebateModal`, `DebateInfoPanel`, `DebateListPanel`
- **API Endpoints**:
  - `POST /api/workspace/debates` — create debate (returns debate ID)
  - `POST /api/workspace/debates/:id/start` — async start (returns immediately; execution runs in background)
  - `GET /api/workspace/debates/:id` — poll for status (`pending → in-progress → completed/failed`)
  - `GET /api/workspace/debates/:id/timeline` — fetch full speech array for replay after completion
  - `GET /api/workspace/debates` — list all debates
- **Interaction model (NOT streaming)**:
  1. User creates debate via CreateDebateModal → `POST /`
  2. User starts → `POST /:id/start` → server returns immediately (async)
  3. UI polls `GET /:id` every 2s until `status === 'completed'`
  4. On completed: render all speeches from `GET /:id/timeline` (JSON array, all at once)
  5. Optionally animate speeches in sequence UI-side (typewriter effect driven by client, not server stream)
- **Data**: Debate (`status: pending|in-progress|completed|failed`, `type: debate|deep-debate`, `consensusResult: consensus|dissent|partial`), speeches array, timeline events, diff view between positions

### 2.22 `/classified` — Classified (기밀문서)
- **Purpose**: Archive of completed reports — filter by department and classification level (confidential etc.), similarity search
- **Key Components**: ClassifiedPage
- **API Endpoints**: `GET /api/workspace/archive`
- **Data**: Archived reports with metadata

### 2.23 `/knowledge` — Knowledge Page (정보국 / Library)
- **Purpose**: RAG knowledge base — folder structure, drag-and-drop upload, CRUD, pgvector semantic search, auto-injection into agent soul context
- **Key Components**: KnowledgePage
- **API Endpoints**: `GET/POST/DELETE /api/workspace/knowledge`
- **Data**: KnowledgeDoc (content, vector embedding, department scope, folder path)

### 2.24 `/performance` — Performance Page (전력분석)
- **Purpose**: Agent quality + Soul Gym — quality dashboard (total reviews, pass rate, avg score), failed task list, agent-level stats (calls/success/cost/time), Soul improvement suggestions
- **Key Components**: PerformancePage
- **API Endpoints**: `GET /api/workspace/quality-dashboard`, `GET /api/workspace/performance`
- **Data**: QualityResult (pass/fail), agent performance metrics, Soul Gym suggestions

### 2.25 `/departments` — Departments Page
- **Purpose**: Department list/CRUD for the user's company
- **Key Components**: DepartmentsPage
- **API Endpoints**: `GET /api/workspace/agents` (dept filter)
- **Data**: Department list with agent counts

### 2.26 `/agents` — Agents Page
- **Purpose**: Agent roster — view/manage own company's agents
- **Key Components**: AgentsPage
- **API Endpoints**: `GET /api/workspace/agents`
- **Data**: Agent list (name, tier, department, model, status)

### 2.27 `/tiers` — Tiers Page (티어 관리)
- **Purpose**: View/configure dynamic N-tier hierarchy settings
- **Key Components**: TiersPage
- **API Endpoints**: `GET /api/workspace/tiers` or `GET /api/admin/tier-configs`
- **Data**: TierConfig (tierLevel, name, modelPreference, maxTools)

### 2.28 `/settings` — Settings Page
- **Purpose**: User profile, notifications, MCP settings, theme, Soul editor
- **Key Components**: SettingsPage, SoulEditor, SettingsMcp, NotificationSettings
- **API Endpoints**: `GET/PUT /api/workspace/profile`, `GET/POST /api/workspace/settings-mcp`
- **Data**: User profile, notification preferences, MCP server configs

### 2.29 `/notifications` — Notifications Page
- **Purpose**: In-app notification center — budget alerts, night job completions, system events
- **Key Components**: NotificationsPage, BudgetAlertListener, NightJobListener, NotificationListener
- **API Endpoints**: `GET /api/workspace/notifications`, WebSocket push
- **Data**: Notification (type, message, isRead, createdAt)

---

## 3. Admin Pages (packages/admin)

Base URL: `https://[domain]/admin/` (React SPA, basename="/admin")

### 3.1 `/admin/` (index) — Admin Dashboard
- **Purpose**: Platform/company overview — agent count, user count, cost summary, system health
- **Key Components**: DashboardPage
- **API Endpoints**: `GET /api/admin/monitoring`, `GET /api/admin/costs`
- **CRUD**: Read-only stats

### 3.2 `/admin/users` — Users Management
- **Purpose**: Manage CEO and employee accounts within a company
- **Key Components**: UsersPage
- **API Endpoints**: `GET/POST/PUT/DELETE /api/admin/users`
- **CRUD**: Create, invite, activate/deactivate, role change (admin/user)

### 3.3 `/admin/employees` — Employees Management
- **Purpose**: Human staff (employees) management and department assignment
- **Key Components**: EmployeesPage
- **API Endpoints**: `GET/POST/PUT /api/admin/employees`
- **CRUD**: Create employee profiles, assign to departments, manage invitations

### 3.4 `/admin/departments` — Departments Management
- **Purpose**: Full CRUD for company departments
- **Key Components**: DepartmentsPage
- **API Endpoints**: `GET/POST/PUT/DELETE /api/admin/departments`
- **CRUD**: Create/rename/delete departments, assign agents/humans

### 3.5 `/admin/agents` — Agents Management
- **Purpose**: Full CRUD for AI agents — name, role, tier, model, soul, department, report-to, allowed tools, semantic cache toggle
- **Key Components**: AgentsPage
- **API Endpoints**: `GET/POST/PUT/DELETE /api/admin/agents`
- **CRUD**: Create/edit/delete agents; set secretary flag, isSystem protection, autoLearn, enableSemanticCache, allowedTools[]

### 3.6 `/admin/credentials` — Credentials Management
- **Purpose**: CLI token (Claude API key) management — AES-256 encrypted storage, per-user assignment
- **Key Components**: CredentialsPage
- **API Endpoints**: `GET/POST/DELETE /api/admin/credentials`
- **CRUD**: Register CLI token (triggers SDK validation), assign to user, deactivate

### 3.7 `/admin/companies` — Companies (Super Admin only)
- **Purpose**: Multi-tenant company management (superadmin only)
- **Key Components**: CompaniesPage
- **API Endpoints**: `GET/POST/PUT /api/super-admin/companies`
- **CRUD**: Create company, set slug, activate/deactivate

### 3.8 `/admin/tools` — Tools Management
- **Purpose**: Tool definition registry — 125+ tools, category/scope management, enable/disable per company
- **Key Components**: ToolsPage
- **API Endpoints**: `GET/POST/PUT /api/admin/tools`
- **CRUD**: Create tool definitions (inputSchema JSON, handler, category, tags), manage platform vs company scope

### 3.9 `/admin/costs` — Cost Analytics (Admin)
- **Purpose**: Detailed cost analytics by company, agent, model, time period
- **Key Components**: CostsPage
- **API Endpoints**: `GET /api/admin/costs`, `GET /api/admin/budget`
- **CRUD**: View only. Set budget limits.

### 3.10 `/admin/report-lines` — Report Lines
- **Purpose**: Configure agent reporting hierarchy (reportTo relationships)
- **Key Components**: ReportLinesPage
- **API Endpoints**: `GET/PUT /api/admin/report-lines`
- **CRUD**: Edit parent-child reporting relationships for agents

### 3.11 `/admin/soul-templates` — Soul Templates
- **Purpose**: Manage AI agent Soul (personality document) templates — builtin and company-custom
- **Key Components**: SoulTemplatesPage
- **API Endpoints**: `GET/POST/PUT/DELETE /api/admin/soul-templates`
- **CRUD**: Create/edit/delete templates, assign category, mark builtin

### 3.12 `/admin/monitoring` — System Monitoring
- **Purpose**: Real-time system health — active sessions, CPU/RAM, error rates, WebSocket connections
- **Key Components**: MonitoringPage
- **API Endpoints**: `GET /api/admin/monitoring`
- **CRUD**: Read-only metrics

### 3.13 `/admin/org-chart` — Org Chart (Static View)
- **Purpose**: Visual org chart — read-only tree view of company org structure
- **Key Components**: OrgChartPage
- **API Endpoints**: `GET /api/admin/org-chart`
- **CRUD**: Read-only

### 3.14 `/admin/nexus` — NEXUS Canvas (Admin)
- **Purpose**: Interactive org editing — drag-and-drop React Flow canvas to restructure agents/departments/humans. 4 node types: Agent, Department, Company, Human. Property panel for node editing.
- **Key Components**: NexusPage, AgentNode, DepartmentNode, CompanyNode, HumanNode, NexusToolbar, PropertyPanel, UnassignedGroupNode, panels/AgentPanel, DepartmentPanel, HumanPanel, CompanyPanel
- **API Endpoints**:
  - `GET /api/admin/nexus-layout` — saved canvas layout
  - `PUT /api/admin/nexus-layout` — save layout
  - `GET /api/admin/org-chart` — org data
  - `PUT /api/admin/agents/:id` — update agent via canvas
  - `PUT /api/admin/departments/:id` — update dept via canvas
- **CRUD**: Full org restructuring via visual canvas (drag agents between departments, set report-to, rename)

### 3.15 `/admin/org-templates` — Org Templates
- **Purpose**: Pre-built organization structure templates for quick company setup
- **Key Components**: OrgTemplatesPage
- **API Endpoints**: `GET/POST /api/admin/org-templates`
- **CRUD**: Browse and apply org templates

### 3.16 `/admin/workflows` — Workflows Management
- **Purpose**: Workflow CRUD — multi-step task definitions (data collection → analysis → report), execution tracking
- **Key Components**: WorkflowsPage, WorkflowCanvas
- **API Endpoints**: `GET/POST/PUT/DELETE /api/workspace/workflows`
- **CRUD**: Define workflow steps, track status (currentStep/done/error)

### 3.17 `/admin/template-market` — Template Market
- **Purpose**: Marketplace for org/soul templates — browse, import
- **Key Components**: TemplateMarketPage
- **API Endpoints**: `GET /api/workspace/template-market`
- **CRUD**: Browse and import templates

### 3.18 `/admin/agent-marketplace` — Agent Marketplace
- **Purpose**: Pre-built agent templates to import into company
- **Key Components**: AgentMarketplacePage
- **API Endpoints**: `GET /api/workspace/agent-marketplace`
- **CRUD**: Browse and import agent configs

### 3.19 `/admin/api-keys` — API Keys Management
- **Purpose**: External service credentials — KIS (trading), Notion, Email, Telegram. AES-256-GCM encrypted JSONB storage.
- **Key Components**: ApiKeysPage
- **API Endpoints**: `GET/POST/DELETE /api/admin/public-api-keys`
- **CRUD**: Create (company or user scope), delete. Never returns raw credentials.

### 3.20 `/admin/settings` — Settings (Admin)
- **Purpose**: Company-level settings — SMTP, quality rules, company profile
- **Key Components**: SettingsPage
- **API Endpoints**: `GET/PUT /api/admin/company-settings`
- **CRUD**: Update SMTP config, quality rules, general company settings

### 3.21 `/admin/onboarding` — Onboarding Wizard ⚠️ DEFERRED
> **Out of scope for this redesign phase.** Memory note: "온보딩 X (나중에)". Do NOT design this screen now.

- **Purpose**: Guided first-time company setup — create departments, agents, configure secretary
- **Key Components**: OnboardingWizardPage
- **API Endpoints**: `POST /api/onboarding/*`
- **CRUD**: Sequential setup steps

### 3.22 `/admin/audit-logs` — Audit Logs
- **Purpose**: Immutable audit trail of all admin actions — org changes, agent CRUD, credential registration, permission changes. Filter by action type, target type/ID, and date range. Paginated table view.
- **Key Components**: AuditLogsPage (to be designed)
- **API Endpoints**: `GET /api/admin/audit-logs?companyId=&action=&targetType=&startDate=&endDate=&page=&limit=`
- **CRUD**: Read-only (audit logs are immutable — no DELETE/PUT endpoints)
- **Data**: `{ action: string, targetType: string, targetId: UUID, companyId: UUID, timestamp: DateTime }`, paginated with `{ page, total }`
- **Example actions**: `org.department.create`, `org.agent.delete`, `auth.credential.register`

---

## 4. API Endpoint Map

### 4.1 Auth Routes (`/api/auth/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/auth/login` | User login → JWT | None |
| POST | `/api/auth/logout` | Invalidate session | JWT |
| GET | `/api/auth/me` | Current user info | JWT |
| POST | `/api/auth/switch-app` | Switch between CEO/admin apps | JWT |

### 4.2 Workspace — Hub (`/api/workspace/hub/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/workspace/hub/stream` | **CORE**: SSE agent execution | JWT (CEO/employee) |

**Request**: `{ message: string, sessionId?: UUID, agentId?: UUID }`
**Response**: `text/event-stream` — events: `accepted`, `processing`, `handoff`, `message`, `error`, `done`

### 4.3 Workspace — Chat (`/api/workspace/chat/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/workspace/chat/sessions` | List sessions | JWT |
| POST | `/api/workspace/chat/sessions` | Create session | JWT |
| GET | `/api/workspace/chat/sessions/:id/messages` | Message history | JWT |
| DELETE | `/api/workspace/chat/sessions/:id` | Delete session | JWT |

### 4.4 Workspace — Agents (`/api/workspace/agents/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/workspace/agents` | List agents (company-scoped) | JWT |
| GET | `/api/workspace/agents/:id` | Agent detail | JWT |

### 4.5 Admin — Agents (`/api/admin/agents/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/agents` | List all agents | Admin JWT |
| POST | `/api/admin/agents` | Create agent | Admin JWT |
| PUT | `/api/admin/agents/:id` | Update agent (incl. soul) | Admin JWT |
| DELETE | `/api/admin/agents/:id` | Delete agent (no isSystem) | Admin JWT |

### 4.6 Admin — Departments (`/api/admin/departments/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/departments` | List departments | Admin JWT |
| POST | `/api/admin/departments` | Create department | Admin JWT |
| PUT | `/api/admin/departments/:id` | Update department | Admin JWT |
| DELETE | `/api/admin/departments/:id` | Delete department | Admin JWT |

### 4.7 Admin — Tier Configs (`/api/admin/tier-configs/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/tier-configs` | List tier configs | Admin JWT |
| POST | `/api/admin/tier-configs` | Create tier level | Admin JWT |
| PUT | `/api/admin/tier-configs/:id` | Update tier | Admin JWT |
| DELETE | `/api/admin/tier-configs/:id` | Delete tier | Admin JWT |

### 4.8 Admin — Org Chart / NEXUS
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/org-chart` | Full org tree | Admin JWT |
| GET | `/api/admin/nexus-layout` | Saved canvas layout | Admin JWT |
| PUT | `/api/admin/nexus-layout` | Save canvas layout | Admin JWT |

### 4.9 Workspace — AGORA (`/api/workspace/debates/*`)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/workspace/debates` | Create debate (topic + participants) | JWT |
| POST | `/api/workspace/debates/:id/start` | Start debate execution (async) | JWT |
| GET | `/api/workspace/debates` | List debates | JWT |
| GET | `/api/workspace/debates/:id` | Debate detail + speeches (poll for updates) | JWT |
| GET | `/api/workspace/debates/:id/timeline` | Timeline event log (playback) | JWT |

> **Note**: AGORA does NOT have an SSE streaming endpoint. Real-time debate updates are received via **polling** `GET /:id` (frontend polls until `status: 'completed'`) or via **WebSocket** (channel #1: `handoff` events from agent-loop delegation). The `debate-timeline.tsx` component uses polling pattern.

### 4.10 Workspace — Knowledge
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/workspace/knowledge` | List docs (with folder) | JWT |
| POST | `/api/workspace/knowledge` | Upload / create doc | JWT |
| PUT | `/api/workspace/knowledge/:id` | Update doc | JWT |
| DELETE | `/api/workspace/knowledge/:id` | Delete doc | JWT |
| POST | `/api/workspace/knowledge/search` | Semantic search (pgvector) | JWT |

### 4.11 Workspace — SNS
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/workspace/sns/content` | List SNS content |
| POST | `/api/workspace/sns/content` | Create content |
| PUT | `/api/workspace/sns/content/:id` | Update (status change, approval) |
| GET | `/api/workspace/sns/queue` | Publish queue |
| GET | `/api/workspace/sns/accounts` | SNS account list |

### 4.12 Workspace — Trading (불가침 서비스)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/workspace/strategy/portfolio` | Portfolio summary |
| GET | `/api/workspace/strategy/watchlist` | Watchlist |
| POST | `/api/workspace/strategy/orders` | Place order |
| GET | `/api/workspace/strategy/orders` | Order history |

### 4.13 Admin — Credentials (CLI Tokens)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/credentials` | List credentials | Admin JWT |
| POST | `/api/admin/credentials` | Register CLI token (AES-256) | Admin JWT |
| DELETE | `/api/admin/credentials/:id` | Delete credential | Admin JWT |

### 4.14 Other Key Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Server health check |
| GET | `/api/workspace/dashboard/summary` | Dashboard stats |
| GET | `/api/workspace/dashboard/costs` | Cost breakdown (note: under /dashboard/) |
| GET | `/api/workspace/activity-log` | Activity log |
| GET | `/api/workspace/schedules` | ARGOS schedule list |
| POST | `/api/workspace/schedules` | Create schedule |
| GET | `/api/workspace/argos` | ARGOS event list |
| GET | `/api/workspace/presets` | Command preset list |
| POST | `/api/workspace/presets` | Create preset |
| GET | `/api/workspace/performance` | Agent performance stats |
| GET | `/api/workspace/quality-dashboard` | QA dashboard |
| GET | `/api/admin/audit-logs` | Admin audit log (paginated, immutable) |

---

## 5. Data Model Summary

### 5.1 Core Tables

| Table | Purpose | Key Columns | FK Relationships |
|-------|---------|-------------|-----------------|
| `companies` | Tenant root | id, name, slug, settings (JSONB), isActive | — |
| `users` | CEO + employee accounts | id, companyId, username, name, email, role (admin\|user) | → companies |
| `admin_users` | Admin console accounts | id, companyId (null=superadmin), username, role (superadmin\|admin) | → companies |
| `sessions` | JWT session store | id, userId, companyId, token, expiresAt | → users, companies |
| `admin_sessions` | Admin JWT session store | id, adminUserId, token, expiresAt | → admin_users |
| `departments` | Org departments | id, companyId, name, description, isActive | → companies |
| `agents` | AI agents | id, companyId, **userId (NOT NULL)** — creator, **ownerUserId (nullable)** — CLI token owner, name, **tierLevel** (1=Mgr/2=Spec/3=Worker, ⚠️ `tier` enum deprecated — use `tierLevel` only), modelName, soul, adminSoul, isSecretary, isSystem, allowedTools (JSONB[]), autoLearn, enableSemanticCache | → companies, departments, users |
| `tier_configs` | Dynamic N-tier config | id, companyId, tierLevel, name, modelPreference, maxTools | → companies |
| `cli_credentials` | Claude API tokens | id, companyId, userId, encryptedToken (AES-256), isActive | → companies, users |
| `api_keys` | External service creds | id, companyId, provider (kis/notion/email/telegram), credentials (JSONB encrypted), scope (company\|user) | → companies, users |

### 5.2 Conversation Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `chat_sessions` | Conversation sessions | id, companyId, userId, agentId, title, lastMessageAt |
| `chat_messages` | Message history | id, companyId, sessionId, sender (user/agent), content, attachmentIds |
| `agent_memory` | Agent long-term memory | id, companyId, agentId, key, value, metadata |

### 5.3 Operations Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `activity_logs` | All system activity | id, companyId, type (chat/delegation/tool_call/job/sns/error), phase (start/end/error) |
| `tool_definitions` | Tool registry | id, companyId (null=platform), name, scope, inputSchema (JSONB), handler, category |
| `agent_tools` | Agent↔tool mapping | id, companyId, agentId, toolId, isEnabled |
| `delegation_records` | Handoff chain log | id, companyId, sessionId, fromAgent, toAgent, depth, status |
| `cost_records` | API usage costs | id, companyId, agentId, model, inputTokens, outputTokens, costUsd |

### 5.4 Content Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `knowledge_docs` | RAG knowledge base | id, companyId, content, embedding (vector), departmentId, folderPath |
| `semantic_cache` | Semantic response cache | id, companyId, agentId, queryEmbedding (vector), response, ttl |
| `soul_templates` | Agent soul templates | id, companyId (null=builtin), name, content, category, isBuiltin |
| `sns_content` | SNS posts | id, companyId, platform, status (draft→published), isCardNews, cardSeriesId |
| `sns_accounts` | SNS account credentials | id, companyId, platform, accountName, isActive |
| `reports` | Completed work reports | id, companyId, agentId, content, classification |

### 5.5 Automation Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `schedules` | ARGOS cron schedules | id, companyId, cronExpression, agentId, command, isActive, lastRun, nextRun |
| `argos_events` | ARGOS trigger events | id, companyId, status (detected→completed/failed) |
| `debates` | AGORA debate sessions | id, companyId, status, type (debate/deep-debate), consensusResult |
| `debate_speeches` | Individual speeches | id, debateId, agentId, round, content |
| `jobs` | Batch job queue | id, companyId, status (queued/processing/completed/failed/blocked), currentStep |
| `workflows` | Workflow definitions | id, companyId, steps (JSONB), currentStep, status |

### 5.6 Supporting Tables (UI-relevant)

| Table | Purpose | Key Columns | UI Impact |
|-------|---------|-------------|-----------|
| `invitations` | Employee invite flow | id, companyId, email, role, token, status (pending\|accepted\|expired\|revoked), invitedBy, expiresAt, acceptedAt | Employees page — invite status badges, resend/revoke actions |
| `employee_departments` | Employee↔dept assignment | id, userId, departmentId, companyId | Employees page — multi-dept chips; Departments page — member count |
| `notification_preferences` | Per-user notification settings | id, userId, companyId, inApp (bool), email (bool), push (bool), settings (JSONB per event type) | Settings page notifications tab — toggle per channel per event |
| `audit_logs` | Immutable admin action log | id, companyId, action (string e.g. `org.agent.create`), targetType, targetId, actorId, metadata (JSONB), createdAt | Admin `/audit-logs` page — paginated read-only table |

### 5.7 Trading Tables (불가침)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `portfolios` | Investment portfolios | id, companyId, userId, mode (real/paper), cash, totalValue |
| `watchlist_items` | Stock watchlist | id, companyId, stockCode, market (KR/US) |
| `orders` | Trade orders | id, companyId, status (pending_approval→executed), side (buy/sell), type (market/limit) |

---

## 6. Engine Architecture

### 6.1 agent-loop.ts — Single Entry Point (D6)

```
All callers (hub, telegram, ARGOS, AGORA, trading, SketchVibe MCP)
       ↓
engine/agent-loop.ts → runAgent(options)
  1. Build SessionContext (companyId, userId, cliToken, depth=0, sessionId, startedAt, maxDepth, visitedAgents)
  2. Emit SSE "accepted" (instant — before SDK spawn)
  3. Render Soul via soul-renderer.ts (template var substitution: {{agent_list}}, {{subordinate_list}}, {{tool_list}}, {{department_name}}, {{owner_name}}, {{specialty}}, {{knowledge_context}})
  4. [Layer 1] Check Semantic Cache (if agent.enableSemanticCache=true) → cosine similarity ≥ 0.95 AND TTL 24h → return cached response
  5. Emit SSE "processing"
  6. [Layer 2] Call Anthropic messages.create() with systemPrompt cache_control:{type:'ephemeral'} (Prompt Cache)
  7. Stream SDK response → sse-adapter.ts → SSE "message" chunks
  8. On tool_use event → PreToolUse Hook pipeline:
     - tool-permission-guard: check agent.allowedTools[] → deny if not permitted
  9. [Layer 3] On external tool call → withCache() (Tool Cache, lib/tool-cache.ts, TTL varies)
  10. Execute tool → tool result
  11. PostToolUse Hook pipeline (in order):
      - credential-scrubber: @zapier/secret-scrubber (SECURITY FIRST)
      - output-redactor: additional pattern masking
      - delegation-tracker: if call_agent tool → emit WebSocket "handoff" event
  12. On call_agent tool → recursively call runAgent() with new SessionContext:
      - depth: ctx.depth + 1
      - visitedAgents: [...ctx.visitedAgents, newAgentId]
      - maxDepth guard: emit HANDOFF_DEPTH_EXCEEDED if exceeded
      - circular guard: emit HANDOFF_CIRCULAR if agentId in visitedAgents
  13. On Stop → cost-tracker Hook: record cost to DB
  14. Emit SSE "done" { costUsd, tokensUsed }
  15. On error → emit SSE "error" { code, message, agentName? }
```

### 6.2 SessionContext (E1 — Immutable)

```typescript
interface SessionContext {
  readonly cliToken: string;        // Claude API key (process.env.ANTHROPIC_API_KEY currently)
  readonly userId: string;          // Request user
  readonly companyId: string;       // Multi-tenancy isolation
  readonly depth: number;           // Current handoff depth
  readonly sessionId: string;       // Full chain trace ID
  readonly startedAt: number;       // Epoch ms — 120s timeout guard
  readonly maxDepth: number;        // Company-configured (default 5)
  readonly visitedAgents: readonly string[]; // Circular detection per branch
}
```

### 6.3 Hook Pipeline (D4 — Order is Security-Critical)

```
PreToolUse:
  1. tool-permission-guard → deny if tool not in agent.allowedTools[]

PostToolUse:
  1. credential-scrubber → @zapier/secret-scrubber (MUST be first — masks tokens before any other processing)
  2. output-redactor → additional regex pattern masking
  3. delegation-tracker → emit WebSocket handoff event (after masking — safe data only)

Stop:
  1. cost-tracker → record llm-cost-tracker usage to DB
```

**WARNING**: Swapping steps 1 and 3 in PostToolUse = security incident (raw tokens broadcast via WebSocket).

### 6.4 3-Layer Caching Architecture (Epic 15)

| Layer | Name | Location | Trigger | Benefit |
|-------|------|----------|---------|---------|
| 1 | Semantic Cache | `engine/semantic-cache.ts` (E8 boundary) | Before LLM call, agent.enableSemanticCache=true | Skip LLM entirely if similar query cached (cosine ≥ 0.95) |
| 2 | Prompt Cache | `engine/agent-loop.ts` | Every messages.create() call | Soul in cache_control:{type:'ephemeral'} → TTFT 85% shorter, cost ×0.1 for cached tokens |
| 3 | Tool Cache | `lib/tool-cache.ts` (outside E8) | On tool execution | withCache(toolName, ttlMs, fn) → skip external API if cached |

**Multi-tenant isolation**:
- Tool Cache key: `${companyId}:${toolName}:${JSON.stringify(params_sorted)}`
- Semantic Cache: `getDB(companyId)` proxy + `WHERE company_id = $1`

### 6.5 E8 Engine Boundary Rules

Only 2 files may be imported from outside `engine/`:
- `engine/agent-loop.ts` — exports `runAgent()`, `sseStream()`
- `engine/types.ts` — exports `SessionContext`, `SSEEvent`, `RunAgentOptions`

All hooks, soul-renderer, model-selector, sse-adapter are **internal only**.
CI enforces this via `ci/engine-boundary-check.sh`.

### 6.6 Error Code System (D3)

| Prefix | Domain | Examples |
|--------|--------|---------|
| `AUTH_` | Auth | `AUTH_TOKEN_EXPIRED`, `AUTH_FORBIDDEN` |
| `AGENT_` | Agent execution | `AGENT_NOT_FOUND`, `AGENT_TIMEOUT`, `AGENT_SPAWN_FAILED` |
| `SESSION_` | Session | `SESSION_LIMIT_EXCEEDED`, `SESSION_MEMORY_LIMIT` |
| `HANDOFF_` | Handoff chain | `HANDOFF_DEPTH_EXCEEDED`, `HANDOFF_CIRCULAR`, `HANDOFF_TARGET_NOT_FOUND` |
| `TOOL_` | Tools | `TOOL_PERMISSION_DENIED`, `TOOL_EXECUTION_FAILED` |
| `ORG_` | Organization | `ORG_SECRETARY_DELETE_DENIED`, `ORG_TIER_LIMIT_EXCEEDED` |

---

## 7. Real-time Features

### 7.1 SSE Streams (Server-Sent Events)

**Primary SSE Endpoint**: `POST /api/workspace/hub/stream`
- Content-Type: `text/event-stream`
- Headers: `Cache-Control: no-cache`, `X-Accel-Buffering: no`
- 6 event types: `accepted` → `processing` → `handoff` → `message` (N chunks) → `done` / `error`

> **AGORA**: Does NOT use SSE. Debate progress is received via polling `GET /api/workspace/debates/:id` until `status: 'completed'`.
> **ARGOS**: Does NOT use SSE. Live ARGOS trigger events come via WebSocket channel #6 (see 7.2).

### 7.2 WebSocket (Hono createBunWebSocket)

7 WebSocket channels multiplexed. **Message envelope format**:
```typescript
{
  channel: 'handoff' | 'notifications' | 'presence' | 'trading' | 'messenger' | 'argos' | 'system',
  type: string,       // event type within channel (e.g., 'delegation_step', 'budget_alert')
  payload: unknown    // channel-specific data object
}
```

| # | Channel | Events | Consumer |
|---|---------|--------|---------|
| 1 | `handoff` | `delegation_step { from, to, depth, sessionId }` | Hub Tracker Panel |
| 2 | `notifications` | `budget_alert`, `job_complete`, `system_event` | Notification bell, BudgetAlertListener |
| 3 | `presence` | `agent_status { agentId, status: online\|working\|offline }` | Org chart, Hub agent picker |
| 4 | `trading` | `price_update { stockCode, price, change }` | Trading watchlist |
| 5 | `messenger` | `new_message { conversationId, message }` | MessengerPage chat |
| 6 | `argos` | `trigger_fired { triggerId, event }`, `collection_complete` | ARGOS page live feed |
| 7 | `system` | `session_count`, `memory_usage`, `error_rate` | Admin monitoring page |

### 7.3 Polling Patterns

| Feature | Polling Interval | Implementation |
|---------|-----------------|----------------|
| Trading Watchlist | 60 seconds | TanStack Query refetchInterval |
| Dashboard Stats | 30 seconds | TanStack Query staleTime: 30_000 |
| Batch Job Status | On-demand | Manual refetch |
| ARGOS Status | WebSocket push | No polling |

---

## 8. Design Constraints for UXUI

### 8.1 Non-Negotiable Features (from v1-feature-spec — ALL must work in v2)

| Feature | v2 Implementation Status |
|---------|------------------------|
| @mention routing (`@AgentName message`) | ✅ hub.ts parseMention() |
| Secretary auto-routing | ✅ agents.isSecretary |
| Slash commands (8 types: /전체, /순차, /토론, /심층토론, /도구점검, /배치실행, /배치상태, /명령어) | ✅ command-center |
| Preset shortcuts | ✅ presets table, hub.ts expansion |
| Real-time handoff tracking | ✅ SSE handoff events + WebSocket |
| Agent 3-tier (Manager/Specialist/Worker) | ✅ tierLevel + tier_configs |
| Soul system (markdown personality) | ✅ soul-renderer.ts |
| 125+ tools | ✅ tool_definitions table + handlers |
| Tool permission control per agent | ✅ agents.allowedTools[] JSONB |
| AGORA group debate (2/3 rounds) | ✅ debates table + async polling (POST /:id/start → poll GET /:id → render /:id/timeline) |
| Trading portfolio + watchlist | ✅ strategy/* routes (untouchable) |
| SketchVibe canvas (Cytoscape + MCP SSE) | ✅ sketches + MCP server |
| SNS multi-platform publishing | ✅ sns/* routes |
| Knowledge RAG with semantic search | ✅ knowledge_docs + pgvector |
| Conversation history (unlimited) | ✅ chat_messages |
| Auto-learn memory | ✅ agent_memory + autoLearn flag |
| Batch API queue | ✅ jobs table |
| Cron scheduler (ARGOS) | ✅ schedules table |
| Cost tracking per agent/model | ✅ cost_records + budget |
| Telegram integration | ✅ telegram/* routes (untouchable) |
| A/B quality test framework | ✅ quality_rules + quality_results |

### 8.2 Performance Budgets (from Architecture NFRs)

| Metric | Requirement | Source |
|--------|-------------|--------|
| Agent E2E latency (call_agent chain) | ≤ 60 seconds | NFR-P1 |
| API P95 response time | ≤ 300ms (±10% baseline) | NFR-P2 |
| NEXUS canvas (React Flow) | 60fps drag-and-drop | NFR-P3 |
| SSE first byte (accepted event) | ≤ 50ms | Architecture D5 |
| Concurrent sessions | Max 20 | NFR-SC1 (24GB 4-core VPS) |
| Session memory | ≤ 200MB per session | NFR-SC2 |
| Initial bundle | Route-level lazy loading (React.lazy) | Architecture S18 |
| Accessibility | WCAG 2.1 AA | NFR-A1 |

### 8.3 Data Flow Patterns the UI Must Accommodate

**Hub SSE Flow** (most complex UI pattern):
```
User types message → Submit
  → POST /api/workspace/hub/stream
  → SSE "accepted" (≤50ms) → UI: "명령 접수됨" spinner
  → SSE "processing" (~2s) → UI: "비서실장 분석 중..."
  → SSE "handoff" { from: "비서실장", to: "CTO", depth: 1 } → Tracker updates
  → SSE "message" (N chunks) → Streamed markdown render
  → SSE "done" { costUsd, tokensUsed } → Show cost + close stream
```

**Multi-tenant Auth**:
- All API calls include JWT with embedded companyId, userId, role
- Admin app: `Authorization: Bearer <adminJWT>` → `/api/admin/*` routes
- User app: `Authorization: Bearer <userJWT>` → `/api/workspace/*` routes
- Role check (DB enum): `admin_role: 'superadmin'` > `admin_role: 'admin'` (company) > `user_role: 'user'` (see Section 1.2 for full UX label → DB enum mapping)

**NEXUS Canvas**:
- React Flow: admin only (full edit)
- App NEXUS: read-only viewer + SketchVibe AI canvas
- Node types: AgentNode, DepartmentNode, CompanyNode, HumanNode (admin) + SketchVibe custom nodes (app)

**Dynamic Org Management** (v2 core difference from v1):
- No fixed 29-agent org — admin can freely create/delete/restructure agents, departments, tiers
- tier_configs define the hierarchy dynamically
- UI must handle 1 to 100+ agents gracefully (agent picker uses dept grouping + lastUsedAt sort)

### 8.4 State Management Patterns

| State Type | Tool | Notes |
|------------|------|-------|
| Server state (agents, org, costs) | TanStack Query | staleTime: 30s, WebSocket invalidation |
| Local UI state (sidebar, modals) | Zustand | Persists in memory |
| SSE chat stream | Custom hook + ReadableStream | Not in query cache |
| Auth/tenant context | Zustand (auth-store) | JWT in localStorage |
| Theme | localStorage | `corthex_theme`: system/light/dark |

### 8.5 API Response Format (CLAUDE.md Spec)

```typescript
// Success (all routes)
{ success: true, data: T }

// Success with pagination
{ success: true, data: T[], meta: { page: number, total: number } }

// Error
{ success: false, error: { code: string, message: string } }
```

All routes use the `success` field. The `{ data: T, meta }` shape from `shared/types.ts` (`ApiResponse<T>`) is the inner structure — the outer envelope always includes `success: true`.

### 8.6 Desktop-Only Design Constraint

> **The app SPA (`packages/app`) is designed for desktop-only.** Memory note: "앱: Stitch 앱용 별도 (반응형 X)".

- **Minimum width**: 1280px (no responsive breakpoints needed)
- **Mobile layout**: Out of scope for this redesign phase
- **Admin SPA** (`packages/admin`): Same constraint — desktop-only, min-width 1280px
- **Do NOT design**: Mobile navigation, hamburger menus, touch interactions, small viewport layouts

### 8.7 UI Terminology Map (Canonical Names)

Use these exact strings in UI labels, page titles, breadcrumbs, and sidebar items. Korean subtitles are optional in parentheses.

| Screen | Page Title | Sidebar Label | Korean Subtitle |
|--------|-----------|---------------|-----------------|
| `/hub` | Hub | 허브 | (사령관실) |
| `/dashboard` | Operations | 작전현황 | — |
| `/agora` | AGORA | AGORA 토론 | — |
| `/nexus` | NEXUS | NEXUS | — |
| `/knowledge` | Library | 정보국 | (라이브러리) |
| `/tiers` | Tiers | 계층 관리 | (티어) |
| `/cron` | ARGOS Schedule | 크론기지 | — |
| `/argos` | ARGOS | ARGOS | — |
| `/trading` | Strategy Room | 전략실 | — |
| `/classified` | Classified | 기밀문서 | — |
| `/performance` | Performance | 전력분석 | — |
| `/activity-log` | Activity Log | 통신로그 | — |
| `/ops-log` | Operations Log | 작전일지 | — |
| `/command-center` | Command Center | 사령관실 | — |
| `/jobs` | Night Jobs | 야간작업 | — |

> **Rule**: The `허브(Hub)`, `라이브러리(Library)`, `티어(Tier)` terminology from the PRD is the v2 canonical standard. In UI code and labels, use the Korean label from the sidebar (e.g., "허브", "정보국") for nav items and the English title for page headings.

### 8.8 UI States Catalogue

For each major feature area, designers must provide empty/loading/error variants:

| Feature Area | Empty State | Loading State | Error State |
|-------------|-------------|---------------|-------------|
| Hub chat | "첫 명령을 입력하세요" + placeholder suggestions (예: "시황 분석해줘") | Tracker panel spinner + SSE `accepted` event triggers "명령 접수됨" text | SSE `error` event → inline error card in chat with error code + retry button |
| Agent picker | "에이전트가 없습니다. 관리자에게 문의하세요." + link to admin | Skeleton list (3 rows) | "에이전트 목록을 불러올 수 없습니다" + retry |
| Knowledge page | "아직 문서가 없습니다. 파일을 드래그하거나 업로드 버튼을 클릭하세요." + upload CTA | Skeleton grid | "문서를 불러올 수 없습니다" |
| AGORA debates | "아직 토론이 없습니다. 새 토론을 시작하세요." + CTA button | Skeleton list | API error inline |
| Trading watchlist | "관심종목이 없습니다. 종목을 추가하세요." | Price loading skeleton | "시세를 불러올 수 없습니다 (60초 후 재시도)" |
| Cost chart | "이번 달 비용 내역이 없습니다." | Chart skeleton | API error |
| NEXUS canvas | "조직 구조가 없습니다. 관리자 콘솔에서 에이전트를 추가하세요." | Canvas loading spinner | "조직도를 불러올 수 없습니다" |
| Activity log | "활동 기록이 없습니다." | Skeleton rows | API error |

---

---

## 9. Navigation Sidebar Structure

### 9.1 App Sidebar (`packages/app/src/components/sidebar.tsx`)

**Layout**: Fixed left sidebar, `w-60` (240px), `bg-zinc-50 dark:bg-zinc-900`. Logo header (h-14) + scrollable nav + user footer.

**Active item style**: `bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium`
**Inactive item style**: `text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800`

| Group Label | Display Order | Route | Label | Icon |
|-------------|--------------|-------|-------|------|
| _(ungrouped)_ | 1 | `/` | 홈 | 🏠 |
| _(ungrouped)_ | 2 | `/hub` | 허브 | 🔗 |
| _(ungrouped)_ | 3 | `/command-center` | 사령관실 | 🎖️ |
| **업무** | 4 | `/chat` | 채팅 | 💬 |
| **업무** | 5 | `/trading` | 전략실 | 📈 |
| **업무** | 6 | `/agora` | AGORA 토론 | 🗣️ |
| **업무** | 7 | `/jobs` | 야간작업 | 🌙 |
| **업무** | 8 | `/reports` | 보고서 | 📄 |
| **업무** | 9 | `/files` | 파일 | 📁 |
| **운영** | 10 | `/org` | 조직도 | 🏢 |
| **운영** | 11 | `/departments` | 부서 관리 | 🏗️ |
| **운영** | 12 | `/agents` | 에이전트 관리 | 🤖 |
| **운영** | 13 | `/tiers` | 계층 관리 | 📊 |
| **운영** | 14 | `/sns` | SNS | 📱 |
| **운영** | 15 | `/messenger` | 메신저 | 💭 |
| **운영** | 16 | `/dashboard` | 작전현황 | 📊 |
| **운영** | 17 | `/costs` | 비용 분석 | 💰 |
| **운영** | 18 | `/activity-log` | 통신로그 | 📞 |
| **운영** | 19 | `/ops-log` | 작전일지 | 📋 |
| **운영** | 20 | `/classified` | 기밀문서 | 🔒 |
| **운영** | 21 | `/performance` | 전력분석 | 💪 |
| **운영** | 22 | `/knowledge` | 정보국 | 📚 |
| **운영** | 23 | `/cron` | 크론기지 | ⏰ |
| **운영** | 24 | `/argos` | ARGOS | 🔍 |
| **운영** | 25 | `/nexus` | NEXUS | 🔗 |
| **시스템** | 26 | `/notifications` | 알림 | 🔔 |
| **시스템** | 27 | `/settings` | 설정 | ⚙️ |

**Special behaviors**:
- `/notifications` item shows unread badge (indigo pill, `bg-indigo-600 text-white`) when unread count > 0 (polls every 30s)
- Bottom footer: "Switch to Admin Console" button (visible only to users with `canSwitch: true`), user name + role, logout button, build number

### 9.2 Admin Sidebar (`packages/admin/src/components/sidebar.tsx`)

**Layout**: Fixed left sidebar, `w-60` (240px), `bg-white dark:bg-zinc-900 border-r`. Logo header with company dropdown selector + flat nav list + footer.

**Special feature**: Company dropdown at top — admin selects which company to manage. Selected `companyId` flows into all API calls via `useAdminStore`.

| Display Order | Route | Label | Icon |
|--------------|-------|-------|------|
| 1 | `/` | 대시보드 | 📊 |
| 2 | `/companies` | 회사 관리 | 🏛️ |
| 3 | `/employees` | 직원 관리 | 👥 |
| 4 | `/departments` | 부서 관리 | 🏢 |
| 5 | `/agents` | AI 에이전트 | 🤖 |
| 6 | `/tools` | 도구 관리 | 🔧 |
| 7 | `/costs` | 비용 관리 | 💰 |
| 8 | `/credentials` | CLI / API 키 | 🔑 |
| 9 | `/report-lines` | 보고 라인 | 📋 |
| 10 | `/soul-templates` | 소울 템플릿 | ✨ |
| 11 | `/monitoring` | 시스템 모니터링 | 🖥️ |
| 12 | `/org-chart` | 조직도 | 🏗️ |
| 13 | `/nexus` | NEXUS 조직도 | 🔮 |
| 14 | `/org-templates` | 조직 템플릿 | 📋 |
| 15 | `/template-market` | 템플릿 마켓 | 🛒 |
| 16 | `/agent-marketplace` | 에이전트 마켓 | 🧠 |
| 17 | `/api-keys` | 공개 API 키 | 🔐 |
| 18 | `/workflows` | 워크플로우 | ⚡ |
| _(footer)_ | `/settings` | 회사 설정 | ⚙️ |

**Note**: `/admin/audit-logs` (Section 3.22) exists as a backend route but is NOT yet in the admin sidebar nav array. The redesign should add it.

**Special behaviors**:
- Company selector dropdown at top (populated from `GET /api/admin/companies`)
- "Switch to CEO App" button in footer (requires `companyId` to be selected)
- User name + role in footer, logout button, build number

---

*Document generated: 2026-03-12*
*Source files: architecture.md, prd.md, v1-feature-spec.md, packages/server/src/routes/**, packages/app/src/App.tsx, packages/admin/src/App.tsx, packages/app/src/components/sidebar.tsx, packages/admin/src/components/sidebar.tsx, packages/shared/src/types.ts, packages/server/src/db/schema.ts*
