# CORTHEX v2 — Phase 7 API Binding Map

**Phase:** 7 · Frontend Integration
**Date:** 2026-03-15
**Authority:** Phase 3-2 Component Strategy + Phase 5 Stitch Prompts + Server Route Files
**Purpose:** Map every new UI component to its backend API endpoint, identify existing vs. new bindings

---

## Table of Contents

1. [Dashboard Screen](#1-dashboard-screen)
2. [Hub Screen (Secretary Hub)](#2-hub-screen-secretary-hub)
3. [Agents Screen](#3-agents-screen)
4. [Departments Screen](#4-departments-screen)
5. [Jobs Screen (ARGOS + Night Jobs)](#5-jobs-screen)
6. [Chat Screen](#6-chat-screen)
7. [Settings Screen](#7-settings-screen)
8. [Activity Log Screen](#8-activity-log-screen)
9. [Shared / Shell Components](#9-shared--shell-components)
10. [SSE / WebSocket Real-time Bindings](#10-sse--websocket-real-time-bindings)
11. [Summary: Existing vs. New](#11-summary-existing-vs-new)

---

## API Base

All endpoints are prefixed with `/api`. The `api` client (`packages/app/src/lib/api.ts`) handles:
- Bearer token from `localStorage`
- Auto-redirect to `/login` on 401
- Rate limit (429) handling with `RateLimitError`
- Standard response: `{ success, data }` or `{ success, error: { code, message } }`

---

## 1. Dashboard Screen

New components: `MetricCard` (x4), `ActivityFeed`, `UsageChart`, `BudgetGauge`, `SatisfactionChart`, `QuickActionGrid`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| MetricCard (Tasks) | `/workspace/dashboard/summary` | GET | — | `{ tasks: { total, completed, failed, inProgress }, agents: {...}, cost: {...} }` | `['dashboard-summary']` | EXISTS |
| MetricCard (Cost) | `/workspace/dashboard/summary` | GET | — | (same, `cost` field) | `['dashboard-summary']` | EXISTS |
| MetricCard (Agents) | `/workspace/dashboard/summary` | GET | — | (same, `agents` field) | `['dashboard-summary']` | EXISTS |
| MetricCard (Budget) | `/workspace/dashboard/budget` | GET | — | `{ monthlyBudget, spent, usagePercent }` | `['dashboard-budget']` | EXISTS |
| UsageChart | `/workspace/dashboard/usage` | GET | `?days=7\|30` | `{ days: [{ date, cost, tokens }] }` | `['dashboard-usage', days]` | EXISTS |
| SatisfactionChart | `/workspace/dashboard/satisfaction` | GET | `?period=7d\|30d\|all` | `{ data: [...] }` | `['dashboard-satisfaction', period]` | EXISTS |
| QuickActionGrid | `/workspace/dashboard/quick-actions` | GET | — | `{ actions: QuickAction[] }` | `['dashboard-quick-actions']` | EXISTS |
| QuickActionGrid (save) | `/workspace/dashboard/quick-actions` | PUT | `{ actions: [...] }` | `{ actions: QuickAction[] }` | mutation | EXISTS |
| ActivityFeed | `/workspace/activity-log` | GET | `?limit=20&type=...` | `{ data: ActivityLog[], nextCursor }` | `['activity-log']` | **NEW** (dashboard feed variant) |
| StatsOverview | `/workspace/dashboard/stats` | GET | `?days=7` | `{ messages, delegations, toolCalls, nightJobs }` | `['dashboard-stats']` | **NEW** |
| CostsByAgent chart | `/workspace/dashboard/costs/by-agent` | GET | `?startDate&endDate` | `{ items: [{ agentId, agentName, costUsd }] }` | `['costs-by-agent']` | **NEW** (page exists at /costs, not dashboard) |
| CostsByTier chart | `/workspace/dashboard/costs/by-tier` | GET | `?startDate&endDate` | `{ items: [...] }` | `['costs-by-tier']` | **NEW** |

### Real-time Updates
- **WebSocket channels:** `cost`, `agent-status`, `command`
- **Hook:** `useDashboardWs()` — already exists, auto-invalidates `dashboard-summary`, `dashboard-usage`, `dashboard-budget`

---

## 2. Hub Screen (Secretary Hub)

New components: `HubOutputStream`, `HubInputComposer`, `TrackerActiveAgent`, `TrackerSessionCost`, `TrackerHandoffChain`, `TrackerActiveJobs`, `ToolCallCard`, `StreamingCursor`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| HubOutputStream (stream) | `/workspace/hub/stream` | POST (SSE) | `{ message, sessionId?, agentId? }` | SSE events: `accepted`, `processing`, `handoff`, `token`, `tool-start`, `tool-end`, `done`, `error` | `useHubStream()` → `useSSEStateMachine()` | EXISTS |
| TrackerActiveAgent | (derived from SSE `processing` event) | — | — | `{ agentName }` from SSE | `useHubStream().processingAgent` | EXISTS |
| TrackerSessionCost | (derived from SSE `done` event) | — | — | `{ costUsd, tokensUsed }` from SSE | `useHubStream().costUsd` | EXISTS |
| TrackerHandoffChain | (derived from SSE `handoff` / `handoff-complete` events) | — | — | `HandoffEntry[]` from SSE | `useHubStream().handoffChain` | EXISTS |
| TrackerActiveJobs | `/workspace/jobs` | GET | — | `{ data: NightJob[] }` | `['night-jobs']` | EXISTS (but needs filtered "active only" variant) |
| ToolCallCard | (derived from SSE `tool-start` / `tool-progress` / `tool-end`) | — | — | `HubToolCall[]` from SSE | `useHubStream().toolCalls` | EXISTS |
| HubInputComposer (presets) | `/workspace/presets` | GET | — | `{ data: Preset[] }` | `['presets']` | EXISTS |
| SessionSidebar (sessions) | `/workspace/chat/sessions` | GET | — | `{ data: Session[] }` | `['sessions']` | EXISTS |
| SessionSidebar (messages) | `/workspace/chat/sessions/:id/messages` | GET | `?before=&limit=50` | `{ data: Message[], hasMore }` | `['messages', sessionId]` | EXISTS |
| AgentSelector | `/workspace/agents` | GET | — | `{ data: Agent[] }` | `['agents']` | EXISTS |

### Real-time
- **SSE:** `POST /api/workspace/hub/stream` — fetch-based ReadableStream (not EventSource, supports POST)
- **State machine:** `idle → connecting → accepted → processing → streaming → done/error`
- **Retry:** 2x with exponential backoff (3s → 6s)

---

## 3. Agents Screen

New components: `AgentCard`, `AgentDetail`, `AgentAvatar`, `TierBadge`, `StatusDot`, `DelegationRulesPanel`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| AgentCard list | `/admin/agents` | GET | `?departmentId=&isActive=` | `{ data: Agent[] }` | `['admin-agents', dept, active]` | EXISTS |
| AgentCard list (workspace) | `/workspace/agents` | GET | — | `{ data: Agent[] }` (scoped) | `['agents']` | EXISTS |
| AgentDetail | `/workspace/agents/:id` | GET | — | `{ data: Agent }` | `['agent-detail', id]` | **NEW** (endpoint exists, no hook) |
| AgentHierarchy (tree) | `/workspace/agents/hierarchy` | GET | — | `{ data: AgentNode[] }` (tree) | `['agent-hierarchy']` | **NEW** (endpoint exists, no hook) |
| DelegationRulesPanel | `/workspace/agents/delegation-rules` | GET | — | `{ data: Rule[] }` | `['delegation-rules']` | **NEW** (endpoint exists, no hook) |
| DelegationRulesPanel (create) | `/workspace/agents/delegation-rules` | POST | `{ sourceAgentId, targetAgentId, condition, priority }` | `{ data: Rule }` | mutation | **NEW** |
| DelegationRulesPanel (delete) | `/workspace/agents/delegation-rules/:id` | DELETE | — | `{ success }` | mutation | **NEW** |
| SoulEditor | `/workspace/agents/:id/soul` | PATCH | `{ soul }` | `{ data: Agent }` | mutation | EXISTS |
| SoulReset | `/workspace/agents/:id/soul/reset` | POST | — | `{ data: Agent }` | mutation | EXISTS |
| AgentCreate | `/admin/agents` | POST | `AgentFormData` | `{ data: Agent }` | mutation | EXISTS |
| AgentUpdate | `/admin/agents/:id` | PATCH | `Partial<AgentFormData>` | `{ data: Agent }` | mutation | EXISTS |
| AgentDelete | `/admin/agents/:id` | DELETE | — | `{ success }` | mutation | EXISTS |

---

## 4. Departments Screen

New components: `DepartmentCard`, `DepartmentDetail`, `DepartmentTree`, `CascadeAnalysisModal`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| DepartmentCard list | `/admin/departments` | GET | — | `{ data: Department[] }` | `['admin-departments']` | EXISTS |
| DepartmentDetail | `/admin/departments/:id` | GET | — | `{ data: Department }` | `['department-detail', id]` | **NEW** (endpoint exists, no hook) |
| DepartmentTree | `/admin/departments/tree` | GET | — | `{ data: [{ ...dept, agents: [...] }] }` | `['department-tree']` | **NEW** (endpoint exists, no hook) |
| CascadeAnalysisModal | `/admin/departments/:id/cascade-analysis` | GET | — | `{ data: CascadeAnalysis }` | `['cascade-analysis', id]` | EXISTS |
| DepartmentCreate | `/admin/departments` | POST | `{ name, description? }` | `{ data: Department }` | mutation | EXISTS |
| DepartmentUpdate | `/admin/departments/:id` | PATCH | `{ name?, description? }` | `{ data: Department }` | mutation | EXISTS |
| DepartmentDelete | `/admin/departments/:id` | DELETE | `?mode=force\|wait_completion` | `{ success }` | mutation | EXISTS |

---

## 5. Jobs Screen

New components: `JobCard`, `ScheduleCard`, `TriggerCard`, `JobQueueForm`, `ScheduleForm`, `TriggerForm`

### 5a. Night Jobs Tab

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| JobCard list | `/workspace/jobs` | GET | — | `{ data: NightJob[] }` | `['night-jobs']` | EXISTS |
| JobQueueForm (create) | `/workspace/jobs` | POST | `{ agentId, instruction, scheduledFor? }` | `{ data: Job }` | mutation | EXISTS |
| JobNotifications | `/workspace/jobs/notifications` | GET | — | `{ data: { items, total } }` | `['job-notifications']` | EXISTS |
| JobMarkRead | `/workspace/jobs/:id/read` | PATCH | — | `{ success }` | mutation | EXISTS |
| JobRetry | `/workspace/jobs/:id/retry` | POST | — | `{ data: Job }` | mutation | EXISTS |
| JobCancel | `/workspace/jobs/:id/cancel` | POST | — | `{ success }` | mutation | EXISTS |

### 5b. Schedules Tab

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| ScheduleCard list | `/workspace/jobs/schedules` | GET | — | `{ data: Schedule[] }` | `['night-schedules']` | EXISTS |
| ScheduleForm (create) | `/workspace/jobs/schedules` | POST | `{ agentId, instruction, cronExpression, description }` | `{ data: Schedule }` | mutation | EXISTS |
| ScheduleUpdate | `/workspace/jobs/schedules/:id` | PATCH | `{ ...partial }` | `{ data: Schedule }` | mutation | EXISTS |
| ScheduleToggle | `/workspace/jobs/schedules/:id/toggle` | POST | — | `{ data: Schedule }` | mutation | EXISTS |
| ScheduleDelete | `/workspace/jobs/schedules/:id` | DELETE | — | `{ success }` | mutation | EXISTS |

### 5c. Triggers Tab (ARGOS)

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| TriggerCard list | `/workspace/argos/triggers` | GET | — | `{ data: Trigger[] }` | `['night-triggers']` | EXISTS |
| TriggerForm (create) | `/workspace/argos/triggers` | POST | `{ agentId, instruction, triggerType, condition, ... }` | `{ data: Trigger }` | mutation | EXISTS |
| TriggerUpdate | `/workspace/argos/triggers/:id` | PATCH | `{ ...partial }` | `{ data: Trigger }` | mutation | EXISTS |
| TriggerToggle | `/workspace/argos/triggers/:id/toggle` | POST | — | `{ data: Trigger }` | mutation | EXISTS |
| TriggerDelete | `/workspace/argos/triggers/:id` | DELETE | — | `{ success }` | mutation | EXISTS |
| ARGOSStatus | `/workspace/argos/status` | GET | — | `{ data: { activeTriggers, firedToday, ... } }` | `['argos-status']` | **NEW** (endpoint exists, no hook) |

---

## 6. Chat Screen

New components: `ChatBubble`, `ChatSessionList`, `ChatAgentPicker`, `ToolCallInline`, `DelegationChainView`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| ChatSessionList | `/workspace/chat/sessions` | GET | — | `{ data: Session[] }` | `['sessions']` | EXISTS |
| ChatSessionCreate | `/workspace/chat/sessions` | POST | `{ agentId, title? }` | `{ data: Session }` | mutation | EXISTS |
| ChatSessionDelete | `/workspace/chat/sessions/:id` | DELETE | — | `{ success }` | mutation | EXISTS |
| ChatBubble list | `/workspace/chat/sessions/:id/messages` | GET | `?before=&limit=50` | `{ data: Message[], hasMore }` | `['messages', sessionId]` | EXISTS |
| ChatBubble (send) | `/workspace/chat/sessions/:id/messages` | POST | `{ content, attachmentIds? }` | `{ data: Message }` | mutation | EXISTS |
| ChatAgentPicker | `/workspace/agents` | GET | — | `{ data: Agent[] }` | `['agents']` | EXISTS |
| ToolCallInline | `/workspace/chat/sessions/:id/tool-calls` | GET | — | `{ data: ToolCall[] }` | `['tool-calls', sessionId]` | EXISTS |
| DelegationChainView | `/workspace/chat/sessions/:id/delegations` | GET | — | `{ data: Delegation[] }` | `['delegations', sessionId]` | EXISTS |

### Real-time (WebSocket)
- **Channel:** `chat-stream::{sessionId}`
- **Events:** `token`, `tool-start`, `tool-progress`, `tool-end`, `delegation-start`, `delegation-end`, `delegation-chain`, `done`, `error`
- **Hook:** `useChatStream(sessionId)` — EXISTS

---

## 7. Settings Screen

New components: `ProfileForm`, `ApiKeyManager`, `TelegramConfig`, `NotificationPrefs`, `SoulEditor`, `McpConfig`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| ProfileForm (read) | `/workspace/profile` | GET | — | `{ data: { id, username, name, email, role } }` | `['profile']` | EXISTS |
| ProfileForm (update) | `/workspace/profile` | PATCH | `{ name?, email?, password? }` | `{ data: User }` | mutation | EXISTS |
| ApiKeyManager (list) | `/workspace/profile/api-keys` | GET | — | `{ data: ApiKey[] }` | `['api-keys']` | EXISTS |
| ApiKeyManager (register) | `/workspace/profile/api-keys` | POST | `{ provider, credentials, label?, scope? }` | `{ data: ApiKey }` | mutation | EXISTS |
| ApiKeyManager (delete) | `/workspace/profile/api-keys/:id` | DELETE | — | `{ success }` | mutation | EXISTS |
| TelegramConfig (read) | `/workspace/telegram/config` | GET | — | `{ data: TelegramConfig }` | `['telegram-config']` | EXISTS |
| TelegramConfig (update) | `/workspace/telegram/config` | PUT | `{ ceoChatId, isActive }` | `{ data: TelegramConfig }` | mutation | EXISTS |
| TelegramConfig (test) | `/workspace/telegram/test` | POST | — | `{ success }` | mutation | EXISTS |
| NotificationPrefs | `/workspace/notifications/preferences` | GET/PUT | `{ inApp, email, settings }` | `{ data: Prefs }` | `['notification-prefs']` | EXISTS |
| SoulEditor | `/workspace/agents/:id/soul` | PATCH | `{ soul }` | `{ data: Agent }` | mutation | EXISTS |
| McpConfig (list) | `/workspace/settings/mcp` | GET | — | `{ data: McpServer[] }` | `['mcp-servers']` | EXISTS |
| McpConfig (CRUD) | `/workspace/settings/mcp/:id` | POST/PATCH/DELETE | varies | varies | mutations | EXISTS |
| HandoffDepth | `/admin/company-settings/handoff-depth` | GET/PUT | `{ maxHandoffDepth: 1-10 }` | `{ data: { maxHandoffDepth } }` | `['handoff-depth']` | **NEW** (endpoint exists, no hook) |
| DisplaySettings | (localStorage only) | — | — | — | — | N/A (no API) |

---

## 8. Activity Log Screen

New components: `ActivityTable`, `AgentActivityTab`, `DelegationTab`, `QualityTab`, `ToolTab`, `SecurityTab`

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| AgentActivityTab | `/workspace/activity/agents` | GET | `?page&limit&agentId&departmentId&status&search` | `{ data: { items, total, page } }` | `['activity-agents', ...]` | EXISTS |
| DelegationTab | `/workspace/activity/delegations` | GET | `?page&limit&departmentId&search` | `{ data: { items, total, page } }` | `['activity-delegations', ...]` | EXISTS |
| QualityTab | `/workspace/activity/quality` | GET | `?page&limit&conclusion&reviewerAgentId&search` | `{ data: { items, total, page } }` | `['activity-quality', ...]` | EXISTS |
| ToolTab | `/workspace/activity/tools` | GET | `?page&limit&toolName&search` | `{ data: { items, total, page } }` | `['activity-tools', ...]` | EXISTS |
| SecurityTab | `/workspace/activity/security` | GET | `?startDate&endDate` | `{ data: { items } }` | `['security-alerts', ...]` | EXISTS |
| ActivityFeed (legacy) | `/workspace/activity-log` | GET | `?type&limit&cursor&search&from` | `{ data: [...], nextCursor }` | `['activity-log']` | EXISTS |

### Real-time
- **WebSocket channels:** `activity-log`, `delegation`, `tool`, `command`
- **Hook:** `useActivityWs(activeTab)` — EXISTS

---

## 9. Shared / Shell Components

| Component | API Endpoint | Method | Request | Response | Hook / QueryKey | Status |
|-----------|-------------|--------|---------|----------|-----------------|--------|
| AppShell (user info) | `/workspace/profile` | GET | — | `{ data: User }` | `['profile']` | EXISTS |
| Sidebar (notification count) | `/workspace/notifications/count` | GET | — | `{ data: { unread } }` | `['notifications-count']` | EXISTS |
| Sidebar (recent notifications) | `/workspace/notifications` | GET | `?limit=5&filter=unread` | `{ data: Notification[] }` | `['recent-notifications']` | EXISTS |
| CommandPalette (org chart) | `/workspace/org-chart` | GET | — | `{ data: { company, departments, agents } }` | `['org-chart']` | EXISTS |
| CommandPalette (submit) | `/workspace/commands` | POST | `{ text, targetAgentId? }` | `{ data: { id, type, status } }` | mutation | EXISTS |
| BudgetAlert | (WebSocket `cost` channel) | — | — | `budget-warning` / `budget-exceeded` events | `useBudgetAlerts()` | EXISTS |

---

## 10. SSE / WebSocket Real-time Bindings

### 10a. SSE Endpoints

| Endpoint | Method | Purpose | Hook |
|----------|--------|---------|------|
| `/workspace/hub/stream` | POST (SSE) | Hub secretary streaming response | `useHubStream()` → `useSSEStateMachine()` |

**SSE Events:**
| Event | Data | Used By |
|-------|------|---------|
| `accepted` | `{ sessionId }` | TrackerActiveAgent |
| `processing` | `{ agentName }` | TrackerActiveAgent |
| `handoff` | `{ fromAgent, toAgent, toAgentId, depth }` | TrackerHandoffChain |
| `handoff-complete` | `{ toAgentId, status, durationMs }` | TrackerHandoffChain |
| `token` | `{ content }` | HubOutputStream / StreamingCursor |
| `tool-start` | `{ toolId, toolName, input }` | ToolCallCard |
| `tool-progress` | `{ toolId, content }` | ToolCallCard |
| `tool-end` | `{ toolId, result, durationMs, error }` | ToolCallCard |
| `done` | `{ costUsd, tokensUsed, learnedCount }` | TrackerSessionCost |
| `error` | `{ code, message, agentName? }` | Error display |

### 10b. WebSocket Channels

| Channel | Events | Subscribed By | Hook |
|---------|--------|--------------|------|
| `cost` | cost updates, `budget-warning`, `budget-exceeded` | Dashboard, BudgetAlert | `useDashboardWs()`, `useBudgetAlerts()` |
| `agent-status` | agent online/offline/working | Dashboard | `useDashboardWs()` |
| `command` | `COMPLETED`, `FAILED` | CommandCenter, Dashboard | `useCommandCenter()`, `useDashboardWs()` |
| `chat-stream::{sessionId}` | `token`, `tool-*`, `delegation-*`, `done`, `error` | Chat | `useChatStream(sessionId)` |
| `activity-log` | new activity entries | Activity Log | `useActivityWs(tab)` |
| `delegation` | delegation start/end | CommandCenter, Activity Log | `useCommandCenter()`, `useActivityWs(tab)` |
| `tool` | tool invocations | CommandCenter, Activity Log | `useCommandCenter()`, `useActivityWs(tab)` |
| `nexus` | canvas AI events | CommandCenter (sketch) | `useCommandCenter()` |
| `job` | job status changes | Jobs page | `useWsStore` (inline) |
| `notification` | new notifications | NotificationListener | `useWsStore` (inline) |

---

## 11. Summary: Existing vs. New

### Bindings That Already Exist (React Query hooks wired)

All core CRUD and streaming hooks are implemented:

- Dashboard: summary, usage, budget, satisfaction, quick-actions
- Hub: SSE stream, tool calls, handoff chain, cost tracking
- Chat: sessions, messages, send, tool-calls, delegations
- Agents (admin): list, create, update, delete
- Agents (workspace): list, soul edit/reset
- Departments: list, create, update, delete, cascade analysis
- Jobs: list, create, retry, cancel, mark-read
- Schedules: list, create, update, toggle, delete
- Triggers (ARGOS): list, create, update, toggle, delete
- Settings: profile, api-keys, telegram, notification prefs, MCP, soul editor
- Activity Log: all 5 tabs
- WebSocket: dashboard, activity, chat-stream, budget alerts, command center

### New Hooks/Bindings to Create for Phase 7

| # | Binding | Endpoint | Priority |
|---|---------|----------|----------|
| 1 | `useAgentDetail(id)` | `GET /workspace/agents/:id` | HIGH — AgentDetail component |
| 2 | `useAgentHierarchy()` | `GET /workspace/agents/hierarchy` | MEDIUM — tree view |
| 3 | `useDelegationRules()` | `GET /workspace/agents/delegation-rules` | MEDIUM — delegation rules panel |
| 4 | `useDelegationRuleMutations()` | `POST/DELETE /workspace/agents/delegation-rules` | MEDIUM |
| 5 | `useDepartmentDetail(id)` | `GET /admin/departments/:id` | HIGH — DepartmentDetail |
| 6 | `useDepartmentTree()` | `GET /admin/departments/tree` | MEDIUM — tree visualization |
| 7 | `useArgosStatus()` | `GET /workspace/argos/status` | LOW — status card |
| 8 | `useDashboardStats(days)` | `GET /workspace/dashboard/stats` | MEDIUM — stats overview |
| 9 | `useCostsByAgent(range)` | `GET /workspace/dashboard/costs/by-agent` | LOW — dashboard chart |
| 10 | `useCostsByTier(range)` | `GET /workspace/dashboard/costs/by-tier` | LOW — dashboard chart |
| 11 | `useHandoffDepth()` | `GET/PUT /admin/company-settings/handoff-depth` | LOW — settings |
| 12 | `useDashboardActivityFeed()` | `GET /workspace/activity-log?limit=20` | MEDIUM — dashboard feed |
| 13 | `usePerformanceSummary()` | `GET /workspace/performance/summary` | LOW — performance page |

### Implementation Notes

1. **All new hooks** should follow the existing pattern: `useQuery` from `@tanstack/react-query`, using the `api.get()` client from `packages/app/src/lib/api.ts`.

2. **Recommended file:** Create `packages/app/src/hooks/use-queries.ts` (or per-domain files like `use-agent-queries.ts`) to centralize the 13 new hooks.

3. **No new API endpoints needed.** All endpoints already exist on the server. Phase 7 only needs frontend hooks + component wiring.

4. **WebSocket subscriptions** are already comprehensive. No new WS channels are needed.

5. **SSE state machine** (`useSSEStateMachine`) is fully built and handles retry, timeout, and error transparency. The new UI just needs to consume the existing `useHubStream()` return values.
