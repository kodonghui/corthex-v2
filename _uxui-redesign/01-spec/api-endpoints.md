# CORTHEX v2 — API Endpoints Reference

> Auto-extracted from `packages/server/src/routes/`. Total: ~300 endpoints.
> Base URL: `/api`

---

## Table of Contents

1. [Health](#1-health)
2. [Auth](#2-auth)
3. [Workspace — Command Center](#3-workspace--command-center)
4. [Workspace — Chat](#4-workspace--chat)
5. [Workspace — Conversations](#5-workspace--conversations)
6. [Workspace — Messenger](#6-workspace--messenger)
7. [Workspace — Dashboard](#7-workspace--dashboard)
8. [Workspace — Agents](#8-workspace--agents)
9. [Workspace — Reports](#9-workspace--reports)
10. [Workspace — Jobs](#10-workspace--jobs)
11. [Workspace — SNS](#11-workspace--sns)
12. [Workspace — SNS Accounts](#12-workspace--sns-accounts)
13. [Workspace — Strategy (Trading)](#13-workspace--strategy-trading)
14. [Workspace — Knowledge](#14-workspace--knowledge)
15. [Workspace — Files](#15-workspace--files)
16. [Workspace — Nexus](#16-workspace--nexus)
17. [Workspace — Workflows](#17-workspace--workflows)
18. [Workspace — Schedules (Cron)](#18-workspace--schedules-cron)
19. [Workspace — Triggers](#19-workspace--triggers)
20. [Workspace — Debates (Agora)](#20-workspace--debates-agora)
21. [Workspace — Sketches](#21-workspace--sketches)
22. [Workspace — Notifications](#22-workspace--notifications)
23. [Workspace — Push Notifications](#23-workspace--push-notifications)
24. [Workspace — Activity Log](#24-workspace--activity-log)
25. [Workspace — Activity Tabs](#25-workspace--activity-tabs)
26. [Workspace — Operation Log](#26-workspace--operation-log)
27. [Workspace — Performance](#27-workspace--performance)
28. [Workspace — Quality Dashboard](#28-workspace--quality-dashboard)
29. [Workspace — Argos (Monitoring)](#29-workspace--argos-monitoring)
30. [Workspace — Archive (Classified)](#30-workspace--archive-classified)
31. [Workspace — Profile](#31-workspace--profile)
32. [Workspace — Presets](#32-workspace--presets)
33. [Workspace — Credentials](#33-workspace--credentials)
34. [Workspace — Invitations](#34-workspace--invitations)
35. [Workspace — Org Chart](#35-workspace--org-chart)
36. [Workspace — Telegram](#36-workspace--telegram)
37. [Workspace — Settings MCP](#37-workspace--settings-mcp)
38. [Workspace — Soul Templates](#38-workspace--soul-templates)
39. [Workspace — Template Market](#39-workspace--template-market)
40. [Workspace — Agent Marketplace](#40-workspace--agent-marketplace)
41. [Admin — Companies](#41-admin--companies)
42. [Admin — Users](#42-admin--users)
43. [Admin — Employees](#43-admin--employees)
44. [Admin — Departments](#44-admin--departments)
45. [Admin — Agents](#45-admin--agents)
46. [Admin — Credentials](#46-admin--credentials)
47. [Admin — Tools](#47-admin--tools)
48. [Admin — Soul Templates](#48-admin--soul-templates)
49. [Admin — Org Templates](#49-admin--org-templates)
50. [Admin — Report Lines](#50-admin--report-lines)
51. [Admin — Org Chart](#51-admin--org-chart)
52. [Admin — Costs](#52-admin--costs)
53. [Admin — Budget](#53-admin--budget)
54. [Admin — Quality Rules](#54-admin--quality-rules)
55. [Admin — Security](#55-admin--security)
56. [Admin — Audit Logs](#56-admin--audit-logs)
57. [Admin — Tool Invocations](#57-admin--tool-invocations)
58. [Admin — Monitoring](#58-admin--monitoring)
59. [Admin — Public API Keys](#59-admin--public-api-keys)
60. [Super Admin — Companies](#60-super-admin--companies)
61. [Public API v1](#61-public-api-v1)
62. [WebSocket](#62-websocket)

---

## 1. Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check with DB connectivity status |

**Response:** `{ status: "ok", db: "connected" | "error", timestamp }`

---

## 2. Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register company + admin account |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/login` | Admin-only login |
| GET | `/api/auth/invite-info/:token` | Get invitation info (public, no auth) |
| POST | `/api/auth/accept-invite` | Accept invitation + create account |
| POST | `/api/auth/switch-app` | Switch between Admin/CEO apps |
| GET | `/api/auth/can-switch-admin` | Check if user can switch to admin |
| GET | `/api/auth/me` | Get current authenticated user info |

### POST /api/auth/register
```
Body: { companyName, email, password, name }
Response: { success, data: { token, user, company } }
```

### POST /api/auth/login
```
Body: { email, password }
Response: { success, data: { token, user } }
```

### POST /api/auth/admin/login
```
Body: { email, password }
Response: { success, data: { token, user } }
```

### POST /api/auth/accept-invite
```
Body: { token, name, password }
Response: { success, data: { token, user } }
```

### POST /api/auth/switch-app
```
Body: { targetApp: "admin" | "workspace" }
Response: { success, data: { token } }
```

---

## 3. Workspace — Command Center

Mount: `/api/workspace/commands`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/commands` | Submit command + auto classify |
| GET | `/api/workspace/commands` | Command history list |
| GET | `/api/workspace/commands/:id` | Single command detail |
| PATCH | `/api/workspace/commands/:id/feedback` | Submit feedback on command |
| GET | `/api/workspace/commands/:id/cost` | Command cost aggregation |
| GET | `/api/workspace/commands/:id/delegation` | Delegation chain for command |

### POST /api/workspace/commands
```
Body: { content, presetId?, agentId?, departmentId?, attachments?[] }
Response: { success, data: { id, status, classifiedDepartment, assignedAgent, ... } }
```

### GET /api/workspace/commands
```
Query: { page?, limit?, status?, departmentId? }
Response: { success, data: Command[], meta: { page, limit, total, totalPages } }
```

### PATCH /api/workspace/commands/:id/feedback
```
Body: { rating: 1-5, comment? }
Response: { success, data }
```

---

## 4. Workspace — Chat

Mount: `/api/workspace/chat`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/chat/sessions` | List chat sessions |
| POST | `/api/workspace/chat/sessions` | Create chat session |
| GET | `/api/workspace/chat/sessions/:sessionId/messages` | Get session messages |
| POST | `/api/workspace/chat/sessions/:sessionId/messages` | Send message (streaming via SSE) |
| PATCH | `/api/workspace/chat/sessions/:sessionId` | Update session (rename) |
| DELETE | `/api/workspace/chat/sessions/:sessionId` | Delete session |
| GET | `/api/workspace/chat/sessions/:sessionId/delegations` | Get delegations in session |
| GET | `/api/workspace/chat/sessions/:sessionId/tool-calls` | Get tool calls in session |

### POST /api/workspace/chat/sessions
```
Body: { agentId, title? }
Response: { success, data: { id, agentId, title, ... } }
```

### POST /api/workspace/chat/sessions/:sessionId/messages
```
Body: { content, role?: "user" }
Response: SSE stream (text/event-stream) with assistant response chunks
```

---

## 5. Workspace — Conversations

Mount: `/api/workspace/conversations`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/conversations` | Create conversation (group chat) |
| GET | `/api/workspace/conversations` | List conversations |
| GET | `/api/workspace/conversations/unread` | Get unread counts per conversation |
| GET | `/api/workspace/conversations/:id` | Get conversation detail |
| POST | `/api/workspace/conversations/:id/messages` | Send message to conversation |
| GET | `/api/workspace/conversations/:id/messages` | Get conversation messages |
| DELETE | `/api/workspace/conversations/:id/messages/:msgId` | Delete message |
| POST | `/api/workspace/conversations/:id/participants` | Add participants |
| DELETE | `/api/workspace/conversations/:id/participants/me` | Leave conversation |
| POST | `/api/workspace/conversations/:id/read` | Mark conversation as read |
| POST | `/api/workspace/conversations/:id/typing` | Send typing indicator |
| POST | `/api/workspace/conversations/:id/share-report` | Share report into conversation |

### POST /api/workspace/conversations
```
Body: { title?, participantIds: string[], type?: "group" | "direct" }
Response: { data: Conversation }
```

### POST /api/workspace/conversations/:id/messages
```
Body: { content, attachments?[] }
Response: { data: Message }
```

---

## 6. Workspace — Messenger

Mount: `/api/workspace/messenger`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/messenger/online-status` | Get online user statuses |
| GET | `/api/workspace/messenger/channels` | List channels |
| GET | `/api/workspace/messenger/channels/unread` | Get unread counts per channel |
| GET | `/api/workspace/messenger/channels/:id` | Get channel detail |
| GET | `/api/workspace/messenger/channels/:id/members` | Get channel members |
| PUT | `/api/workspace/messenger/channels/:id` | Update channel |
| DELETE | `/api/workspace/messenger/channels/:id` | Delete channel |
| POST | `/api/workspace/messenger/channels` | Create channel |
| GET | `/api/workspace/messenger/channels/:id/messages` | Get channel messages |
| POST | `/api/workspace/messenger/channels/:id/messages` | Send message |
| POST | `/api/workspace/messenger/channels/:id/members` | Add member |
| DELETE | `/api/workspace/messenger/channels/:id/members/me` | Leave channel |
| DELETE | `/api/workspace/messenger/channels/:id/members/:uid` | Remove member |
| GET | `/api/workspace/messenger/channels/:id/messages/:msgId/thread` | Get message thread |
| POST | `/api/workspace/messenger/channels/:id/messages/:msgId/reactions` | Add reaction |
| DELETE | `/api/workspace/messenger/channels/:id/messages/:msgId/reactions/:emoji` | Remove reaction |
| GET | `/api/workspace/messenger/search` | Search messages |
| POST | `/api/workspace/messenger/channels/:id/read` | Mark channel as read |
| GET | `/api/workspace/messenger/users` | List messenger users |

### POST /api/workspace/messenger/channels
```
Body: { name, description?, type?: "public" | "private", memberIds?[] }
Response: { data: Channel }
```

### POST /api/workspace/messenger/channels/:id/messages
```
Body: { content, parentMessageId? (for threads), attachments?[] }
Response: { data: Message }
```

---

## 7. Workspace — Dashboard

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/dashboard/summary` | Dashboard summary (agent count, command count, etc.) |
| GET | `/api/workspace/dashboard/usage` | Usage stats by period |
| GET | `/api/workspace/dashboard/budget` | Budget overview |
| GET | `/api/workspace/dashboard/costs` | Cost breakdown |
| GET | `/api/workspace/dashboard/costs/by-agent` | Costs grouped by agent |
| GET | `/api/workspace/dashboard/costs/daily` | Daily cost trend |
| GET | `/api/workspace/dashboard/agents` | Agent status list |
| GET | `/api/workspace/dashboard/stats` | General statistics |
| GET | `/api/workspace/dashboard/quick-actions` | Get quick actions config |
| PUT | `/api/workspace/dashboard/quick-actions` | Update quick actions config |
| GET | `/api/workspace/dashboard/satisfaction` | Satisfaction metrics |

### GET /api/workspace/dashboard/usage
```
Query: { period: "day" | "week" | "month" }
Response: { data: { totalCommands, totalCost, ... } }
```

### GET /api/workspace/dashboard/costs/by-agent
```
Query: { startDate, endDate }
Response: { data: [{ agentId, agentName, totalCost, tokenCount }] }
```

### PUT /api/workspace/dashboard/quick-actions
```
Body: { actions: [{ id, label, command, icon? }] }
Response: { data }
```

---

## 8. Workspace — Agents

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/agents` | List agents (tenant-scoped) |
| GET | `/api/workspace/agents/hierarchy` | Get agent hierarchy tree |
| GET | `/api/workspace/agents/delegation-rules` | List delegation rules |
| GET | `/api/workspace/agents/:id` | Get agent detail |
| PATCH | `/api/workspace/agents/:id/soul` | Update agent soul (personality/prompt) |
| POST | `/api/workspace/agents/:id/soul/reset` | Reset agent soul to template default |
| POST | `/api/workspace/agents/delegation-rules` | Create delegation rule |
| DELETE | `/api/workspace/agents/delegation-rules/:id` | Delete delegation rule |

### PATCH /api/workspace/agents/:id/soul
```
Body: { systemPrompt?, personality?, instructions? }
Response: { success, data }
```

### POST /api/workspace/agents/delegation-rules
```
Body: { fromAgentId, toAgentId, condition, priority? }
Response: { success, data }
```

---

## 9. Workspace — Reports

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/reports` | List reports |
| POST | `/api/workspace/reports` | Create report |
| GET | `/api/workspace/reports/:id` | Get report detail |
| PUT | `/api/workspace/reports/:id` | Update report |
| POST | `/api/workspace/reports/:id/submit` | Submit report for review |
| POST | `/api/workspace/reports/:id/review` | Review (approve/reject) report |
| DELETE | `/api/workspace/reports/:id` | Delete report |
| GET | `/api/workspace/reports/:id/comments` | Get report comments |
| POST | `/api/workspace/reports/:id/comments` | Add report comment |
| GET | `/api/workspace/reports/:id/download` | Download report as file |

### POST /api/workspace/reports
```
Body: { title, content, type?, departmentId?, agentId? }
Response: { success, data: Report }
```

### POST /api/workspace/reports/:id/review
```
Body: { decision: "approved" | "rejected", comment? }
Response: { success, data }
```

---

## 10. Workspace — Jobs

Mount: `/api/workspace/jobs`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/jobs` | Queue a job |
| GET | `/api/workspace/jobs` | List jobs |
| GET | `/api/workspace/jobs/notifications` | Get job notifications |
| PUT | `/api/workspace/jobs/:id/read` | Mark job as read |
| PUT | `/api/workspace/jobs/read-all` | Mark all jobs as read |
| DELETE | `/api/workspace/jobs/:id` | Delete job |
| POST | `/api/workspace/jobs/chain` | Create chained job sequence |
| DELETE | `/api/workspace/jobs/chain/:chainId` | Delete chain |

### POST /api/workspace/jobs
```
Body: { type, payload, agentId?, priority?, scheduledAt? }
Response: { success, data: Job }
```

### POST /api/workspace/jobs/chain
```
Body: { jobs: [{ type, payload, agentId? }] }
Response: { success, data: { chainId, jobs: Job[] } }
```

---

## 11. Workspace — SNS

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/sns` | List SNS posts |
| GET | `/api/workspace/sns/stats` | SNS statistics |
| POST | `/api/workspace/sns` | Create SNS post |
| POST | `/api/workspace/sns/generate` | AI-generate SNS content |
| POST | `/api/workspace/sns/generate-with-image` | AI-generate content + image |
| POST | `/api/workspace/sns/:id/generate-image` | Generate image for existing post |
| GET | `/api/workspace/sns/:id` | Get SNS post detail |
| PUT | `/api/workspace/sns/:id` | Update SNS post |
| POST | `/api/workspace/sns/:id/submit` | Submit for approval |
| POST | `/api/workspace/sns/:id/approve` | Approve post |
| POST | `/api/workspace/sns/:id/reject` | Reject post |
| POST | `/api/workspace/sns/:id/publish` | Publish post |
| POST | `/api/workspace/sns/:id/cancel-schedule` | Cancel scheduled post |
| DELETE | `/api/workspace/sns/:id` | Delete post |
| POST | `/api/workspace/sns/:id/create-variant` | Create A/B variant |
| POST | `/api/workspace/sns/:id/generate-variants` | AI-generate variants |
| PUT | `/api/workspace/sns/:id/metrics` | Update post metrics |
| GET | `/api/workspace/sns/:id/ab-results` | Get A/B test results |
| POST | `/api/workspace/sns/:id/engine-publish` | Publish via engine |
| POST | `/api/workspace/sns/:id/retry-publish` | Retry failed publish |
| GET | `/api/workspace/sns/:id/publish-result` | Get publish result |
| GET | `/api/workspace/sns/queue` | Get publish queue |
| GET | `/api/workspace/sns/queue/stats` | Queue statistics |
| POST | `/api/workspace/sns/batch-schedule` | Batch schedule posts |
| POST | `/api/workspace/sns/batch-cancel` | Batch cancel scheduled posts |
| POST | `/api/workspace/sns/card-series` | Create card series |
| GET | `/api/workspace/sns/card-series/:id` | Get card series |
| PUT | `/api/workspace/sns/card-series/:id/cards/:index` | Update card in series |
| DELETE | `/api/workspace/sns/card-series/:id` | Delete card series |
| POST | `/api/workspace/sns/card-series/:id/reorder` | Reorder cards |
| POST | `/api/workspace/sns/card-series/generate` | AI-generate card series |
| POST | `/api/workspace/sns/card-series/:id/submit` | Submit card series for approval |
| POST | `/api/workspace/sns/card-series/:id/approve` | Approve card series |
| POST | `/api/workspace/sns/card-series/:id/reject` | Reject card series |

### POST /api/workspace/sns
```
Body: { platform, content, mediaUrls?[], scheduledAt?, accountId? }
Response: { data: SnsPost }
```

### POST /api/workspace/sns/generate
```
Body: { platform, topic, tone?, language?, hashtags? }
Response: { data: { content, hashtags } }
```

---

## 12. Workspace — SNS Accounts

Mount: `/api/workspace/sns-accounts`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/sns-accounts` | List SNS accounts |
| POST | `/api/workspace/sns-accounts` | Create SNS account |
| PUT | `/api/workspace/sns-accounts/:id` | Update SNS account |
| DELETE | `/api/workspace/sns-accounts/:id` | Delete SNS account |

### POST /api/workspace/sns-accounts
```
Body: { platform, accountName, accessToken?, accessTokenSecret?, ... }
Response: { data: SnsAccount }
```

---

## 13. Workspace — Strategy (Trading)

Mount: `/api/workspace/strategy`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/strategy/watchlist` | Get watchlist |
| POST | `/api/workspace/strategy/watchlist` | Add to watchlist |
| DELETE | `/api/workspace/strategy/watchlist/:id` | Remove from watchlist |
| PATCH | `/api/workspace/strategy/watchlist/reorder` | Reorder watchlist |
| GET | `/api/workspace/strategy/chat/session` | Get/create strategy chat session |
| POST | `/api/workspace/strategy/chat/sessions` | Create chat session |
| PATCH | `/api/workspace/strategy/chat/sessions/:id` | Update chat session |
| GET | `/api/workspace/strategy/prices` | Get stock/crypto prices |
| GET | `/api/workspace/strategy/shares` | Get portfolio shares |
| GET | `/api/workspace/strategy/shares/:symbol/chart` | Get share chart data |
| POST | `/api/workspace/strategy/notes` | Create research note |
| PATCH | `/api/workspace/strategy/notes/:id` | Update note |
| DELETE | `/api/workspace/strategy/notes/:id` | Delete note |
| POST | `/api/workspace/strategy/shares/:symbol/analyze` | Analyze a share |
| DELETE | `/api/workspace/strategy/shares/:symbol/analysis` | Delete analysis |
| GET | `/api/workspace/strategy/shares/:symbol/analysis` | Get analysis result |
| GET | `/api/workspace/strategy/export` | Export data |
| GET | `/api/workspace/strategy/backtest-results` | List backtest results |
| POST | `/api/workspace/strategy/backtest-results` | Create backtest result |
| DELETE | `/api/workspace/strategy/backtest-results/:id` | Delete backtest result |
| GET | `/api/workspace/strategy/portfolios` | List portfolios |
| POST | `/api/workspace/strategy/portfolios` | Create portfolio |
| GET | `/api/workspace/strategy/portfolios/:id` | Get portfolio detail |
| PATCH | `/api/workspace/strategy/portfolios/:id` | Update portfolio |
| GET | `/api/workspace/strategy/portfolios/:id/performance` | Portfolio performance |
| POST | `/api/workspace/strategy/orders` | Create order |
| GET | `/api/workspace/strategy/orders` | List orders |
| GET | `/api/workspace/strategy/orders/:id` | Get order detail |
| POST | `/api/workspace/strategy/execute-order` | Execute order |
| GET | `/api/workspace/strategy/orders/pending` | List pending orders |
| POST | `/api/workspace/strategy/orders/:id/approve` | Approve order |
| POST | `/api/workspace/strategy/orders/:id/reject` | Reject order |
| POST | `/api/workspace/strategy/orders/bulk-approve` | Bulk approve orders |
| POST | `/api/workspace/strategy/orders/bulk-reject` | Bulk reject orders |
| GET | `/api/workspace/strategy/settings` | Get trading settings |
| GET | `/api/workspace/strategy/settings/history` | Settings change history |
| GET | `/api/workspace/strategy/settings/profiles` | Settings profiles |
| PUT | `/api/workspace/strategy/settings` | Update trading settings |
| PUT | `/api/workspace/strategy/settings/trading-mode` | Change trading mode |
| GET | `/api/workspace/strategy/trading-status` | Get trading status |
| POST | `/api/workspace/strategy/portfolio/reset` | Reset portfolio |
| PUT | `/api/workspace/strategy/portfolio/initial-capital` | Set initial capital |

### POST /api/workspace/strategy/watchlist
```
Body: { symbol, market?, name? }
Response: { data: WatchlistItem }
```

### POST /api/workspace/strategy/orders
```
Body: { portfolioId, symbol, side: "buy"|"sell", quantity, price?, orderType? }
Response: { data: Order }
```

---

## 14. Workspace — Knowledge

Mount: `/api/workspace/knowledge`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/knowledge/folders` | Create folder |
| GET | `/api/workspace/knowledge/folders` | List folders |
| GET | `/api/workspace/knowledge/folders/:id` | Get folder detail |
| PATCH | `/api/workspace/knowledge/folders/:id` | Update folder |
| DELETE | `/api/workspace/knowledge/folders/:id` | Delete folder |
| POST | `/api/workspace/knowledge/docs` | Create document |
| GET | `/api/workspace/knowledge/docs` | List documents |
| GET | `/api/workspace/knowledge/docs/:id` | Get document detail |
| PATCH | `/api/workspace/knowledge/docs/:id` | Update document |
| DELETE | `/api/workspace/knowledge/docs/:id` | Delete document |
| POST | `/api/workspace/knowledge/docs/upload` | Upload document file |
| GET | `/api/workspace/knowledge/docs/:id/download` | Download document |
| GET | `/api/workspace/knowledge/docs/:id/versions` | Get document version history |
| POST | `/api/workspace/knowledge/docs/:id/versions/:versionId/restore` | Restore document version |
| POST | `/api/workspace/knowledge/folders/:id/move` | Move docs to folder |
| POST | `/api/workspace/knowledge/folders/bulk-delete` | Bulk delete folders |
| GET | `/api/workspace/knowledge/folders/:id/stats` | Folder statistics |
| GET | `/api/workspace/knowledge/templates` | List document templates |
| POST | `/api/workspace/knowledge/docs/from-template` | Create doc from template |
| GET | `/api/workspace/knowledge/tags` | List all tags |
| POST | `/api/workspace/knowledge/docs/:id/tags` | Add tags to document |
| DELETE | `/api/workspace/knowledge/docs/:id/tags` | Remove tags from document |
| GET | `/api/workspace/knowledge/search` | Search documents |
| POST | `/api/workspace/knowledge/memories` | Create agent memory |
| GET | `/api/workspace/knowledge/memories` | List agent memories |
| GET | `/api/workspace/knowledge/memories/context/:agentId` | Get memory context for agent |
| GET | `/api/workspace/knowledge/memories/:id` | Get memory detail |
| PATCH | `/api/workspace/knowledge/memories/:id` | Update memory |
| DELETE | `/api/workspace/knowledge/memories/:id` | Delete memory |
| POST | `/api/workspace/knowledge/memories/:id/used` | Mark memory as used |
| GET | `/api/workspace/knowledge/injection-preview/:agentId` | Preview knowledge injection |
| POST | `/api/workspace/knowledge/memories/consolidate/:agentId` | Consolidate agent memories |

### POST /api/workspace/knowledge/folders
```
Body: { name, parentId?, description? }
Response: { data: Folder }
```

### POST /api/workspace/knowledge/docs
```
Body: { title, content, folderId?, tags?[], format?: "markdown"|"text" }
Response: { data: Document }
```

### POST /api/workspace/knowledge/docs/upload
```
Body: multipart/form-data { file, folderId? }
Response: { data: Document }
```

### POST /api/workspace/knowledge/memories
```
Body: { agentId, content, type?, importance?, tags?[] }
Response: { data: Memory }
```

---

## 15. Workspace — Files

Mount: `/api/workspace/files`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/files` | Upload file |
| GET | `/api/workspace/files` | List files |
| GET | `/api/workspace/files/:id/download` | Download file |
| DELETE | `/api/workspace/files/:id` | Delete file |

### POST /api/workspace/files
```
Body: multipart/form-data { file }
Response: { data: { id, filename, size, mimeType, url } }
```

---

## 16. Workspace — Nexus

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/nexus/org-data` | Get org data for nexus visualization |
| GET | `/api/workspace/nexus/layout` | Get saved nexus layout |
| PUT | `/api/workspace/nexus/layout` | Save nexus layout |
| GET | `/api/workspace/nexus/graph` | Get relationship graph data |
| PATCH | `/api/workspace/nexus/agents/:id/reassign` | Reassign agent to department |
| GET | `/api/workspace/nexus/workflows` | List nexus workflows |
| POST | `/api/workspace/nexus/workflows` | Create nexus workflow |
| PUT | `/api/workspace/nexus/workflows/:id` | Update nexus workflow |
| DELETE | `/api/workspace/nexus/workflows/:id` | Delete nexus workflow |
| POST | `/api/workspace/nexus/workflows/:id/execute` | Execute nexus workflow |
| GET | `/api/workspace/nexus/workflows/:id/executions` | Get workflow executions |
| POST | `/api/workspace/nexus/workflows/:id/clone` | Clone workflow |

### PUT /api/workspace/nexus/layout
```
Body: { nodes: [{ id, x, y }], zoom?, panX?, panY? }
Response: { success, data }
```

---

## 17. Workspace — Workflows

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/workflows` | Create workflow (CEO/Admin) |
| GET | `/api/workspace/workflows` | List workflows |
| GET | `/api/workspace/workflows/suggestions` | List pending suggestions |
| POST | `/api/workspace/workflows/suggestions/:id/accept` | Accept suggestion → create workflow |
| POST | `/api/workspace/workflows/suggestions/:id/reject` | Reject suggestion |
| POST | `/api/workspace/workflows/analyze` | On-demand pattern analysis (CEO/Admin) |
| GET | `/api/workspace/workflows/:id` | Get workflow detail |
| PUT | `/api/workspace/workflows/:id` | Update workflow (CEO/Admin) |
| POST | `/api/workspace/workflows/:id/execute` | Execute workflow |
| GET | `/api/workspace/workflows/:workflowId/executions` | Get execution history |
| DELETE | `/api/workspace/workflows/:id` | Soft delete workflow (CEO/Admin) |

### POST /api/workspace/workflows
```
Body: {
  name: string,
  description?: string,
  steps: [{
    id: uuid, name, type: "tool"|"llm"|"condition",
    action, params?, agentId?, dependsOn?[], timeout?, retryCount?
  }]
}
Response: { success, data: Workflow } (201)
```

---

## 18. Workspace — Schedules (Cron)

Mount: `/api/workspace/schedules` (mapped from internal route paths like `/`)

Note: Internal routes use `/` but mounted at `/api/workspace/schedules`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/schedules` | List schedules |
| GET | `/api/workspace/schedules/:id` | Get schedule detail |
| POST | `/api/workspace/schedules` | Create schedule |
| PATCH | `/api/workspace/schedules/:id` | Update schedule |
| PATCH | `/api/workspace/schedules/:id/toggle` | Toggle schedule active/inactive |
| DELETE | `/api/workspace/schedules/:id` | Delete schedule |
| GET | `/api/workspace/schedules/:id/runs` | List schedule runs |
| GET | `/api/workspace/schedules/:id/runs/:runId` | Get run detail |

### POST /api/workspace/schedules
```
Body: { name, cronExpression, command, agentId?, timezone?, description? }
Response: { data: Schedule }
```

---

## 19. Workspace — Triggers

Mount: `/api/workspace/triggers` (mapped from internal route paths like `/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/triggers` | List triggers |
| POST | `/api/workspace/triggers` | Create trigger |
| PATCH | `/api/workspace/triggers/:id` | Update trigger |
| PATCH | `/api/workspace/triggers/:id/toggle` | Toggle trigger active/inactive |
| DELETE | `/api/workspace/triggers/:id` | Delete trigger |

### POST /api/workspace/triggers
```
Body: { name, eventType, condition?, action, agentId? }
Response: { data: Trigger }
```

---

## 20. Workspace — Debates (Agora)

Mount: `/api/workspace/debates`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/debates` | Create debate |
| POST | `/api/workspace/debates/:id/start` | Start debate |
| GET | `/api/workspace/debates` | List debates |
| GET | `/api/workspace/debates/:id` | Get debate detail |
| GET | `/api/workspace/debates/:id/timeline` | Get debate timeline |

### POST /api/workspace/debates
```
Body: { topic, description?, agentIds: uuid[], format?: "free"|"structured", rounds? }
Response: { data: Debate }
```

---

## 21. Workspace — Sketches

Mount: `/api/workspace/sketches`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/sketches` | List sketches |
| GET | `/api/workspace/sketches/:id` | Get sketch detail |
| POST | `/api/workspace/sketches` | Create sketch |
| PUT | `/api/workspace/sketches/:id` | Update sketch |
| DELETE | `/api/workspace/sketches/:id` | Delete sketch |
| POST | `/api/workspace/sketches/:id/import-mermaid` | Import Mermaid diagram |
| POST | `/api/workspace/sketches/:id/duplicate` | Duplicate sketch |
| POST | `/api/workspace/sketches/:id/export-knowledge` | Export sketch to knowledge base |
| GET | `/api/workspace/sketches/:id/versions` | Get version history |
| POST | `/api/workspace/sketches/:id/versions/:versionId/restore` | Restore version |
| POST | `/api/workspace/sketches/:id/ai-command` | Execute AI command on sketch |

### POST /api/workspace/sketches
```
Body: { title, content?, type?: "diagram"|"whiteboard"|"flowchart" }
Response: { data: Sketch }
```

---

## 22. Workspace — Notifications

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/notifications` | List notifications |
| GET | `/api/workspace/notifications/count` | Get unread notification count |
| PATCH | `/api/workspace/notifications/:id/read` | Mark notification as read |
| POST | `/api/workspace/notifications/read-all` | Mark all as read |
| GET | `/api/workspace/notifications/email-configured` | Check if email notifications configured |
| GET | `/api/workspace/notification-prefs` | Get notification preferences |
| PUT | `/api/workspace/notification-prefs` | Update notification preferences |

---

## 23. Workspace — Push Notifications

Mount: `/api/workspace/push`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/push/vapid-key` | Get VAPID public key |
| POST | `/api/workspace/push/subscribe` | Subscribe to push notifications |
| DELETE | `/api/workspace/push/subscribe` | Unsubscribe from push notifications |

### POST /api/workspace/push/subscribe
```
Body: { endpoint, keys: { p256dh, auth } }
Response: { success }
```

---

## 24. Workspace — Activity Log

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/activity-log` | List activity logs (cursor pagination) |
| GET | `/api/workspace/activity-log/summary` | Activity summary stats |

### GET /api/workspace/activity-log
```
Query: { cursor?, limit?, type?, agentId?, action? }
Response: { data: Activity[], nextCursor?, hasMore }
```

---

## 25. Workspace — Activity Tabs

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/activity/agents` | Agent activity summary |
| GET | `/api/workspace/activity/delegations` | Delegation activity |
| GET | `/api/workspace/activity/quality` | Quality metrics |
| GET | `/api/workspace/activity/tools` | Tool usage stats |
| GET | `/api/workspace/activity/security-alerts` | Security alert list |

---

## 26. Workspace — Operation Log

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/operation-log` | List operation logs |
| GET | `/api/workspace/operation-log/export` | Export logs (CSV/JSON) |
| GET | `/api/workspace/operation-log/bookmarks` | List bookmarked entries |
| POST | `/api/workspace/operation-log/bookmarks` | Create bookmark |
| PATCH | `/api/workspace/operation-log/bookmarks/:id` | Update bookmark |
| DELETE | `/api/workspace/operation-log/bookmarks/:id` | Delete bookmark |
| GET | `/api/workspace/operation-log/:id` | Get single log entry detail |

---

## 27. Workspace — Performance

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/performance/summary` | Performance summary (overall metrics) |
| GET | `/api/workspace/performance/agents` | Performance by agent list |
| GET | `/api/workspace/performance/agents/:id` | Single agent performance detail |
| GET | `/api/workspace/performance/soul-gym` | Get Soul Gym suggestions |
| POST | `/api/workspace/performance/soul-gym/:id/apply` | Apply Soul Gym suggestion |
| POST | `/api/workspace/performance/soul-gym/:id/dismiss` | Dismiss Soul Gym suggestion |

---

## 28. Workspace — Quality Dashboard

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/quality-dashboard` | Quality dashboard data (mounted at `/`) |

**Response:** `{ data: { overallScore, rubricScores[], agentScores[], trends } }`

---

## 29. Workspace — Argos (Monitoring)

Mount: `/api/workspace/argos`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/argos/status` | Get Argos monitoring status |
| GET | `/api/workspace/argos/triggers` | List Argos triggers |
| GET | `/api/workspace/argos/triggers/:id` | Get trigger detail |
| POST | `/api/workspace/argos/triggers` | Create trigger |
| PATCH | `/api/workspace/argos/triggers/:id` | Update trigger |
| PATCH | `/api/workspace/argos/triggers/:id/toggle` | Toggle trigger |
| DELETE | `/api/workspace/argos/triggers/:id` | Delete trigger |
| GET | `/api/workspace/argos/triggers/:id/events` | Get trigger events |

### POST /api/workspace/argos/triggers
```
Body: { name, type, condition, action, threshold?, agentId? }
Response: { data: ArgosTrigger }
```

---

## 30. Workspace — Archive (Classified)

Mount: `/api/workspace/archive`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/archive/folders` | List archive folders |
| POST | `/api/workspace/archive/folders` | Create folder |
| PATCH | `/api/workspace/archive/folders/:id` | Update folder |
| DELETE | `/api/workspace/archive/folders/:id` | Delete folder |
| GET | `/api/workspace/archive/stats` | Archive statistics |
| GET | `/api/workspace/archive` | List archived items |
| POST | `/api/workspace/archive` | Create archive item |
| GET | `/api/workspace/archive/:id/similar` | Find similar items |
| GET | `/api/workspace/archive/:id` | Get archive item detail |
| PATCH | `/api/workspace/archive/:id` | Update archive item |
| DELETE | `/api/workspace/archive/:id` | Delete archive item |

### POST /api/workspace/archive
```
Body: { title, content, folderId?, tags?[], classification? }
Response: { data: ArchiveItem }
```

---

## 31. Workspace — Profile

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/profile` | Get current user profile |
| PATCH | `/api/workspace/profile` | Update profile |
| GET | `/api/workspace/profile/api-keys` | List user API keys |
| POST | `/api/workspace/profile/api-keys` | Register API key |
| DELETE | `/api/workspace/profile/api-keys/:id` | Delete API key |
| GET | `/api/workspace/profile/tool-calls` | Get user tool call history |

### PATCH /api/workspace/profile
```
Body: { name?, avatar?, language?, timezone? }
Response: { data: UserProfile }
```

---

## 32. Workspace — Presets

Mount: `/api/workspace/presets`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/presets` | Create preset |
| GET | `/api/workspace/presets` | List presets |
| PATCH | `/api/workspace/presets/:id` | Update preset |
| DELETE | `/api/workspace/presets/:id` | Delete preset |
| POST | `/api/workspace/presets/:id/execute` | Execute preset |

### POST /api/workspace/presets
```
Body: { name, command, icon?, category?, agentId?, departmentId? }
Response: { data: Preset }
```

---

## 33. Workspace — Credentials

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/credentials` | List credentials |
| POST | `/api/workspace/credentials` | Create credential (API key) |
| PUT | `/api/workspace/credentials/:id` | Update credential |
| DELETE | `/api/workspace/credentials/:id` | Delete credential |

### POST /api/workspace/credentials
```
Body: { name, provider, apiKey, description? }
Response: { data: Credential }
```

---

## 34. Workspace — Invitations

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/invitations` | Create invitation |
| GET | `/api/workspace/invitations` | List invitations |
| DELETE | `/api/workspace/invitations/:id` | Delete/revoke invitation |

### POST /api/workspace/invitations
```
Body: { email, role?, departmentId? }
Response: { data: { id, token, email, expiresAt } }
```

---

## 35. Workspace — Org Chart

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/org-chart` | Get org chart (read-only) |

**Response:** `{ data: { departments[], agents[], reportLines[] } }`

---

## 36. Workspace — Telegram

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/telegram/config` | Get Telegram bot config |
| POST | `/api/workspace/telegram/config` | Set Telegram bot config |
| DELETE | `/api/workspace/telegram/config` | Remove Telegram config |
| POST | `/api/workspace/telegram/test` | Test Telegram connection |
| PUT | `/api/workspace/telegram/webhook` | Set webhook URL |
| DELETE | `/api/workspace/telegram/webhook` | Remove webhook |

### POST /api/workspace/telegram/config
```
Body: { botToken, chatId? }
Response: { data: TelegramConfig }
```

---

## 37. Workspace — Settings MCP

Mount: `/api/workspace/settings`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/settings/mcp` | List MCP servers |
| POST | `/api/workspace/settings/mcp` | Register MCP server (admin only, max 10) |
| DELETE | `/api/workspace/settings/mcp/:id` | Delete MCP server (admin only, soft delete) |
| POST | `/api/workspace/settings/mcp/test` | Test MCP server connection (admin only) |
| GET | `/api/workspace/settings/mcp/:id/tools` | List tools from MCP server |
| POST | `/api/workspace/settings/mcp/execute` | Execute MCP tool (rate limited: 20/min) |
| GET | `/api/workspace/settings/mcp/:id/ping` | Ping MCP server |

### POST /api/workspace/settings/mcp
```
Body: { name, url }
Response: { data: McpServer } (201)
```

### POST /api/workspace/settings/mcp/execute
```
Body: { serverId: uuid, toolName: string, arguments: {} }
Response: { result }
```

---

## 38. Workspace — Soul Templates

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/soul-templates` | List soul templates (read-only) |

**Response:** `{ data: SoulTemplate[] }`

---

## 39. Workspace — Template Market

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/template-market` | Browse published org templates (excludes own company) |
| GET | `/api/workspace/template-market/:id` | Get template detail |
| POST | `/api/workspace/template-market/:id/clone` | Clone template to own company |

### GET /api/workspace/template-market
```
Query: { q?, tag? }
Response: { data: OrgTemplate[] }
```

### POST /api/workspace/template-market/:id/clone
```
Body: { name? }
Response: { data: OrgTemplate } (201)
```

---

## 40. Workspace — Agent Marketplace

Mount: `/api/workspace`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workspace/agent-marketplace` | Browse published soul templates |
| GET | `/api/workspace/agent-marketplace/:id` | Get template detail |
| POST | `/api/workspace/agent-marketplace/:id/import` | Import template to own company |

### GET /api/workspace/agent-marketplace
```
Query: { q?, category?, tier? }
Response: { data: SoulTemplate[] }
```

### POST /api/workspace/agent-marketplace/:id/import
```
Body: { name? }
Response: { data: SoulTemplate } (201)
```

---

## 41. Admin — Companies

Mount: `/api/admin`
Auth: `authMiddleware` + `adminOnly` or `companyAdminOnly`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/companies` | List companies |
| GET | `/api/admin/companies/stats` | Company statistics |
| GET | `/api/admin/companies/:id` | Get company detail |
| POST | `/api/admin/companies` | Create company |
| PATCH | `/api/admin/companies/:id` | Update company |
| DELETE | `/api/admin/companies/:id` | Delete company |
| PUT | `/api/admin/companies/:id/smtp` | Set SMTP config |
| DELETE | `/api/admin/companies/:id/smtp` | Remove SMTP config |

### POST /api/admin/companies
```
Body: { name, plan?, domain?, maxAgents?, maxUsers? }
Response: { data: Company }
```

### PUT /api/admin/companies/:id/smtp
```
Body: { host, port, user, pass, from }
Response: { data }
```

---

## 42. Admin — Users

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Get user detail |
| POST | `/api/admin/users` | Create user |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/users/:id/reset-password` | Reset user password |
| POST | `/api/admin/users/:id/terminate-session` | Terminate user session |

### POST /api/admin/users
```
Body: { email, password, name, role: "ceo"|"employee", departmentIds?[] }
Response: { data: User }
```

---

## 43. Admin — Employees

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/employees` | Create employee (human staff) |
| GET | `/api/admin/employees` | List employees |
| GET | `/api/admin/employees/:id` | Get employee detail |
| PUT | `/api/admin/employees/:id` | Update employee |
| DELETE | `/api/admin/employees/:id` | Deactivate employee |
| POST | `/api/admin/employees/:id/reactivate` | Reactivate employee |
| POST | `/api/admin/employees/:id/reset-password` | Reset employee password |

### POST /api/admin/employees
```
Body: { name, email, password, departmentId, role?, position? }
Response: { data: Employee }
```

---

## 44. Admin — Departments

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/departments` | List departments (flat) |
| GET | `/api/admin/departments/tree` | Department tree hierarchy |
| GET | `/api/admin/departments/:id/cascade-analysis` | Cascade impact analysis |
| GET | `/api/admin/departments/:id` | Get department detail |
| POST | `/api/admin/departments` | Create department |
| PATCH | `/api/admin/departments/:id` | Update department |
| DELETE | `/api/admin/departments/:id` | Delete department |

### POST /api/admin/departments
```
Body: { name, parentId?, description?, headAgentId? }
Response: { data: Department }
```

---

## 45. Admin — Agents

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/agents` | List agents |
| GET | `/api/admin/agents/:id` | Get agent detail |
| POST | `/api/admin/agents` | Create agent |
| PATCH | `/api/admin/agents/:id` | Update agent |
| DELETE | `/api/admin/agents/:id` | Delete agent |

### POST /api/admin/agents
```
Body: { name, departmentId, soulTemplateId?, role?, description? }
Response: { data: Agent }
```

---

## 46. Admin — Credentials

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/cli-credentials` | List CLI credentials |
| POST | `/api/admin/cli-credentials` | Create CLI credential |
| DELETE | `/api/admin/cli-credentials/:id` | Delete CLI credential |
| GET | `/api/admin/api-keys/providers` | List supported providers |
| GET | `/api/admin/api-keys` | List API keys |
| POST | `/api/admin/api-keys` | Create API key |
| PUT | `/api/admin/api-keys/:id` | Update API key |
| DELETE | `/api/admin/api-keys/:id` | Delete API key |

### POST /api/admin/cli-credentials
```
Body: { name, token, description? }
Response: { data: CliCredential }
```

### POST /api/admin/api-keys
```
Body: { provider, apiKey, name?, isDefault? }
Response: { data: ApiKey }
```

---

## 47. Admin — Tools

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/tools` | List tools |
| GET | `/api/admin/tools/catalog` | Get tool catalog (all available tools) |
| GET | `/api/admin/tools/:id` | Get tool detail |
| POST | `/api/admin/tools` | Create tool |
| PUT | `/api/admin/tools/:id` | Update tool |
| PATCH | `/api/admin/agents/:id/allowed-tools` | Update agent allowed tools |
| PATCH | `/api/admin/agents/:id/allowed-tools/batch` | Batch update agent allowed tools |
| GET | `/api/admin/agent-tools` | List agent-tool assignments |
| POST | `/api/admin/agent-tools` | Assign tool to agent |
| PATCH | `/api/admin/agent-tools/:id` | Update agent-tool assignment |
| DELETE | `/api/admin/agent-tools/:id` | Remove tool from agent |

### POST /api/admin/tools
```
Body: { name, description, type, schema?, endpoint? }
Response: { data: Tool }
```

---

## 48. Admin — Soul Templates

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/soul-templates` | List soul templates |
| POST | `/api/admin/soul-templates` | Create soul template |
| PATCH | `/api/admin/soul-templates/:id` | Update soul template |
| DELETE | `/api/admin/soul-templates/:id` | Delete soul template |
| POST | `/api/admin/soul-templates/:id/publish` | Publish to marketplace |
| POST | `/api/admin/soul-templates/:id/unpublish` | Unpublish from marketplace |

### POST /api/admin/soul-templates
```
Body: { name, content, description?, category?, tier?, allowedTools?[] }
Response: { data: SoulTemplate }
```

---

## 49. Admin — Org Templates

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/org-templates` | List org templates |
| GET | `/api/admin/org-templates/:id` | Get org template detail |
| POST | `/api/admin/org-templates` | Create org template |
| POST | `/api/admin/org-templates/:id/apply` | Apply template to company |
| POST | `/api/admin/org-templates/:id/publish` | Publish to marketplace |
| POST | `/api/admin/org-templates/:id/unpublish` | Unpublish from marketplace |

### POST /api/admin/org-templates
```
Body: { name, description?, templateData: { departments[], agents[], reportLines[] }, tags?[] }
Response: { data: OrgTemplate }
```

---

## 50. Admin — Report Lines

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/report-lines` | List report lines |
| PUT | `/api/admin/report-lines` | Bulk upsert report lines |

### PUT /api/admin/report-lines
```
Body: { lines: [{ fromId, toId, type }] }
Response: { data }
```

---

## 51. Admin — Org Chart

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/org-chart` | Get org chart |

**Response:** `{ data: { departments[], agents[], employees[], reportLines[] } }`

---

## 52. Admin — Costs

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/costs/by-agent` | Costs grouped by agent |
| GET | `/api/admin/costs/by-model` | Costs grouped by model |
| GET | `/api/admin/costs/by-department` | Costs grouped by department |
| GET | `/api/admin/costs/summary` | Cost summary |
| GET | `/api/admin/costs/daily` | Daily cost trend |

All cost endpoints accept:
```
Query: { startDate, endDate }
Response: { data: [...] }
```

---

## 53. Admin — Budget

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/budget` | Get current budget |
| PUT | `/api/admin/budget` | Update budget |

### PUT /api/admin/budget
```
Body: { monthlyLimit?, dailyLimit?, alertThreshold? }
Response: { data: Budget }
```

---

## 54. Admin — Quality Rules

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/quality-rules` | List quality rules |
| GET | `/api/admin/quality-rules/rubrics` | Get rubric definitions |
| GET | `/api/admin/quality-rules/active` | Get active quality config |
| GET | `/api/admin/quality-rules/investment` | Get quality investment data |
| PUT | `/api/admin/quality-rules/overrides` | Set quality rule overrides |

### PUT /api/admin/quality-rules/overrides
```
Body: { overrides: [{ rubricId, weight?, threshold? }] }
Response: { data }
```

---

## 55. Admin — Security

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/security/prompt-guard` | Get prompt guard settings |
| PUT | `/api/admin/security/prompt-guard` | Update prompt guard settings |

### PUT /api/admin/security/prompt-guard
```
Body: { enabled, rules?[], blockedPatterns?[] }
Response: { data }
```

---

## 56. Admin — Audit Logs

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/audit-logs` | List audit logs |

```
Query: { page?, limit?, type?, userId?, action?, startDate?, endDate? }
Response: { data: AuditLog[], pagination }
```

---

## 57. Admin — Tool Invocations

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/tool-invocations` | List tool invocation logs |
| GET | `/api/admin/tool-invocations/stats` | Tool invocation statistics |

---

## 58. Admin — Monitoring

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/monitoring/status` | System monitoring status |

**Response:** `{ data: { server, db, workers, queues, uptime } }`

---

## 59. Admin — Public API Keys

Mount: `/api/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/public-api-keys` | List public API keys |
| POST | `/api/admin/public-api-keys` | Create public API key |
| DELETE | `/api/admin/public-api-keys/:id` | Delete public API key |
| POST | `/api/admin/public-api-keys/:id/rotate` | Rotate API key |

### POST /api/admin/public-api-keys
```
Body: { name, permissions?[], expiresAt? }
Response: { data: { id, key, name, ... } }
```

---

## 60. Super Admin — Companies

Mount: `/api/super-admin`
Auth: `super_admin` role only

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/super-admin/companies` | Create company |
| GET | `/api/super-admin/companies` | List all companies |
| GET | `/api/super-admin/companies/:id` | Get company detail |
| PUT | `/api/super-admin/companies/:id` | Update company |
| DELETE | `/api/super-admin/companies/:id` | Delete company |

### POST /api/super-admin/companies
```
Body: { name, plan?, domain?, maxAgents?, maxUsers? }
Response: { data: Company }
```

---

## 61. Public API v1

Mount: `/api/v1`
Auth: API key via `X-API-Key` header

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/agents` | List agents |
| GET | `/api/v1/agents/:id` | Get agent detail |
| POST | `/api/v1/commands` | Submit command |

### POST /api/v1/commands
```
Body: { content, agentId?, departmentId? }
Response: { success, data }
```

---

## 62. WebSocket

| Path | Description |
|------|-------------|
| `ws://host/ws` | WebSocket connection (auth via query token) |

### Channels (server → client broadcasts)

| Channel | Description |
|---------|-------------|
| `activity-log` | Real-time activity events |
| `agent-status` | Agent online/offline status changes |
| `notifications` | Push notification events |
| `night-job` | Night job progress updates |
| `command` | Command execution events |
| `delegation` | Delegation chain events |
| `tool` | Tool call events |
| `cost` | Cost tracking events |
| `argos` | Argos monitoring alerts |
| `debate` | Debate progress (per debate room: `debate::{debateId}`) |

---

## Common Patterns

### Authentication
All workspace/admin routes require `Authorization: Bearer <token>` header.
Auth middleware extracts tenant context: `{ companyId, userId, role, departmentIds, isAdminUser? }`.

### Response Shapes
```
Success: { success: true, data: ... }
or:      { data: ... }

Error:   { success: false, error: { code: string, message: string } }

Paginated (offset): { data: [], meta: { page, limit, total, totalPages } }
or:                  { data: [], pagination: { page, limit, total, totalPages } }

Paginated (cursor): { data: [], nextCursor?: string, hasMore: boolean }
```

### Rate Limits
- General API: 100 requests/min
- Login/Register: 5 requests/min
- MCP tool execute: 20 requests/min

### Role Hierarchy
- `super_admin` — platform-level admin
- `company_admin` — company admin (Admin app)
- `ceo` — company CEO (Workspace app, elevated permissions)
- `employee` — regular employee
