# Phase 4-2 CRITIC-A: API Binding Verification

**Critic**: CRITIC-A
**Date**: 2026-03-25
**Phase**: 4-2 — 4 Core Pages API Binding Review
**Files Reviewed**: dashboard.tsx, hub/index.tsx, agents.tsx, jobs.tsx

---

## Methodology

- Read each page file from disk (with offset/limit for large files)
- Cross-checked every `useQuery` queryKey + queryFn against server route files
- Cross-checked every `useMutation` mutationFn endpoint against server route files
- Verified type safety for data → JSX mapping
- Checked WS hook usage (useDashboardWs, useWsStore)
- Verified `@corthex/shared` type imports for correctness

---

## 1. dashboard.tsx

### Score: 7 / 10

### useQuery Hooks

| queryKey | queryFn endpoint | Server route | Status |
|----------|-----------------|--------------|--------|
| `['dashboard-summary']` | `GET /workspace/dashboard/summary` | `dashboardRoute.get('/dashboard/summary', ...)` | ✅ OK |
| `['dashboard-usage', usageDays]` | `GET /workspace/dashboard/usage?days=N` | `dashboardRoute.get('/dashboard/usage', ...)` (zValidator query) | ✅ OK |
| `['dashboard-budget']` | `GET /workspace/dashboard/budget` | `dashboardRoute.get('/dashboard/budget', ...)` | ✅ OK |
| `['dashboard-agents']` | `GET /workspace/agents` | `workspaceAgentsRoute.get('/agents', ...)` | ✅ OK |

### useMutation Hooks

None — dashboard.tsx is read-only. Correct.

### WS / Real-time

- `useDashboardWs()` — hook file confirmed at `hooks/use-dashboard-ws.ts` ✅
- `useWsStore` provides `isConnected`, `addListener`, `removeListener` ✅
- Listeners registered: `'agent-status'`, `'cost'`, `'command'` (bare keys, no `::companyId`)

### Type Imports from @corthex/shared

| Import | In shared/types.ts | Status |
|--------|--------------------|--------|
| `LLMProviderName` | ✅ | OK |
| `DashboardSummary` | ✅ (line 366, has `tasks`, `cost`, `agents`, `integrations`) | OK |
| `DashboardUsageDay` | ✅ (line 390) | OK |
| `DashboardUsage` | ✅ (line 398) | OK |
| `DashboardBudget` | ✅ (line 403, has `currentMonthSpendUsd`, `byDepartment`) | OK |
| `QuickAction` | ✅ (line 472) | OK |
| `DashboardSatisfaction` | ✅ (line 481) | OK |
| `Agent` | ✅ (line 83, has `id, name, nameEn, role, tier, tierLevel, modelName, status`) | OK |

### Issues Found

**Issue 1 (Medium): Stale API comment header**
The top-of-file comment lists endpoints that are never fetched:
```
// API: GET /workspace/dashboard/quick-actions  ← NOT FETCHED
// API: GET /workspace/dashboard/satisfaction   ← NOT FETCHED
// API: POST /workspace/presets/:presetId/execute ← NOT FETCHED
```
Server confirms these routes exist (`dashboardRoute.get('/dashboard/quick-actions', ...)`, etc.) but the redesigned page doesn't call them. Comment misleads future maintainers about what the page actually does.

**Issue 2 (Medium): WS listener key inconsistency — potential missing events**
`dashboard.tsx` registers: `addListener('agent-status', handler)` (bare key)
`jobs.tsx` registers: `addListener('night-job::${user.companyId}', handler)` (scoped key)

If the WS server broadcasts on `agent-status::${companyId}` (scoped), the bare-key listener in dashboard will never fire. No real-time agent status updates would appear in the "Live Event Stream" section. This is a silent failure.

**Issue 3 (Medium): Non-functional pagination in Active Units table**
Lines 623-633: ChevronLeft/ChevronRight buttons and page number buttons (1, 2) are decorative — no onClick handlers or state. `activeAgentsList.slice(0, 5)` is always hardcoded to first 5 agents. Cannot navigate to page 2 even if 6+ agents exist.

**Issue 4 (Low): Navigate to `/agents/${agent.id}` has no matching route**
Line 605: `onClick={() => navigate('/agents/${agent.id}')}` — but agents.tsx is a list page with no `:id` sub-route. The SPA router will fall through to 404/NotFound. Button is non-functional.

**Issue 5 (Low): DashboardSummary.cost.budgetUsagePercent vs DashboardBudget.usagePercent dual source**
`cpuLoad` (line 457) uses `budgetPercent = summary?.cost.budgetUsagePercent`. `DeptLoadChart` uses `budget?.byDepartment`. Both exist in their types but represent slightly different calculations — no reconciliation.

---

## 2. hub/index.tsx

### Score: 8 / 10

### useQuery Hooks

| queryKey | queryFn endpoint | Server route | Status |
|----------|-----------------|--------------|--------|
| `['org-chart']` | `GET /workspace/org-chart` | `workspaceOrgChartRoute.get('/org-chart', ...)` | ✅ OK |
| `['sessions']` | `GET /workspace/chat/sessions` | `chatRoute` at `/api/workspace/chat` | ✅ OK |

### useMutation Hooks

| mutationFn | Endpoint | onSuccess | Status |
|-----------|----------|-----------|--------|
| `createSession` | `POST /workspace/chat/sessions` `{ agentId }` | `selectSession(res.data.id)` + invalidate `['sessions']` | ✅ OK |

`res.data.id` access is safe — `Session` type (chat/types.ts) has `id: string` ✓.

### WS / Real-time

No direct WS in HubPage. ChatArea (child) handles streaming internally. Correct.

### Type Imports

| Import | Source | Status |
|--------|--------|--------|
| `Agent` | `../../components/chat/types` (local) | Different from @corthex/shared `Agent` — this local type has `{id, name, role, status, isSecretary}`. |
| `Session` | `../../components/chat/types` (local) | Has `id, agentId, lastMessageAt (string|null)` ✅ |

### Issues Found

**Issue 1 (Medium): handleAgentSelect callback — stale closure risk**
Line 136-146: `useCallback` deps include `createSession` (a mutation object). `useMutation` returns a new object reference on each render by default. If `createSession` changes reference, the callback is recreated — not a bug per se, but `createSession.mutate` is included in the deps which is redundant and can cause unnecessary callback re-creation.

**Issue 2 (Medium): No error state for org-chart query failure**
Only `orgLoading` is checked (renders spinner). If `orgData` is undefined due to error (network fail, 500), the component silently falls into the "no secretary" → "no chat" → empty dashboard branch with empty agent lists. User sees empty page with no error message.

**Issue 3 (Low): Local OrgAgent / OrgDept types duplicate shared types**
`OrgAgent` (line 27-37) and `OrgDept` (line 39-44) are defined locally and match the server response shape, but they duplicate fields from `@corthex/shared Agent` type. If shared type changes (e.g., a field rename), local type won't catch it at compile time.

**Issue 4 (Low): `Session.lastMessageAt` null safety**
Used correctly with ternary on line 411, so this is safe. ✅ (Noted as OK.)

---

## 3. agents.tsx

### Score: 6 / 10

### useQuery Hooks

| queryKey | queryFn endpoint | Server route | Status |
|----------|-----------------|--------------|--------|
| `['workspace-agents', filterDept, filterActive]` | `GET /workspace/agents?departmentId=...&isActive=...` | `workspaceAgentsRoute.get('/agents', ...)` | ✅ OK |
| `['workspace-departments']` | `GET /workspace/departments` | `workspaceDepartmentsRoute` | ✅ OK |
| `['workspace-employees']` | `GET /workspace/employees` | `workspaceEmployeesRoute` | ✅ OK |

### useMutation Hooks

| mutation | Endpoint | onSuccess | Status |
|---------|----------|-----------|--------|
| `createMutation` | `POST /workspace/agents` | invalidate `['workspace-agents']`, close modal | ✅ OK |
| `updateMutation` | `PATCH /workspace/agents/:id` | invalidate `['workspace-agents']` | ✅ OK (updateAgentSchema includes `soul: z.string().nullable().optional()`) |
| `deleteMutation` | `DELETE /workspace/agents/:id` | invalidate, clear selection | ✅ OK |

### Type Imports from @corthex/shared

| Import | Status |
|--------|--------|
| `PersonalityTraits` | ✅ (shared/types.ts line 51) |
| `PERSONALITY_PRESETS` | ✅ (shared/constants.ts line 50) |

### Issues Found

**Issue 1 (Critical): Stale API comment header — completely wrong endpoints**
Top of file (lines 1-10):
```
// - GET    /api/admin/agents     : List agents
// - POST   /api/admin/agents     : Create a new agent
// - GET    /api/admin/departments : List departments
// - GET    /api/admin/users      : List users
```
Actual code uses `/workspace/agents`, `/workspace/departments`, `/workspace/employees`.
The `/api/admin/agents` route exists but requires admin auth. The `/workspace/agents` route is what's actually called. This is a documentation lie that would cause confusion in security reviews and audits (wrong auth level implied).

**Issue 2 (Critical): `personalityTraits` silently dropped on agent create**
`AgentForm` collects `personalityTraits` via `BigFiveSliderGroup` and submits it in `formData.personalityTraits`. But `handleCreate` (lines 741-750) never includes it in the request body:
```ts
const body: Record<string, unknown> = {
  userId, name, tier, modelName, isSecretary,
  // ← personalityTraits MISSING
}
```
Result: Every newly created agent has `personalityTraits: null` regardless of what the user sets. The `BigFiveSliderGroup` UI is a no-op on create. Feature silently broken.

**Issue 3 (Critical): Hardcoded stub data in AgentDetailPanel**
Lines 455-458 define static `recentActivities`:
```ts
const recentActivities = [
  { id: '1', icon: 'success', title: '작업 완료', detail: '최근 처리 완료', time: '방금 전' },
  { id: '2', icon: 'message', title: '문의 응답', detail: '사용자 대화', time: '15분 전' },
  { id: '3', icon: 'success', title: '일정 조율 완료', detail: '자동 처리', time: '1시간 전' },
]
```
These are static strings that display for every agent regardless of actual history. The "작업 이력" tab content is fake. Violates no-stub/mock rule.

**Issue 4 (Medium): SoulEditor preview bypasses React Query**
`handlePreview` (lines 299-326) in `SoulEditor` uses raw `api.post` + try/catch, not `useMutation`. This means: no loading indicator via React Query state, no automatic retry, no cache integration, no error/success toast standardization matching the rest of the page.

**Issue 5 (Low): queryClient.invalidateQueries partial key match**
All mutations invalidate `{ queryKey: ['workspace-agents'] }` (no `exact: true`). This correctly invalidates `['workspace-agents', filterDept, filterActive]`. Behavior is correct but could cause extra refetches on filters that haven't changed.

---

## 4. jobs.tsx

### Score: 6 / 10

### useQuery Hooks

| queryKey | queryFn endpoint | Server route | Status |
|----------|-----------------|--------------|--------|
| `['agents']` | `GET /workspace/agents` | `workspaceAgentsRoute.get('/agents', ...)` | ✅ OK |
| `['night-jobs']` | `GET /workspace/jobs` | `jobsRoute.get('/', ...)` (refetchInterval 10s) | ✅ OK |
| `['night-schedules']` | `GET /workspace/jobs/schedules` | `schedulesRoute.get('/', ...)` | ✅ OK |
| `['night-triggers']` | `GET /workspace/jobs/triggers` | `triggersRoute.get('/', ...)` | ✅ OK |

### useMutation Hooks

| mutation | Endpoint | Body sent | Required by schema | Status |
|---------|----------|-----------|-------------------|--------|
| `queueJob` | `POST /workspace/jobs` | `{agentId, instruction, scheduledFor?}` | `{agentId, instruction, scheduledFor?}` | ✅ OK |
| `createSchedule` | `POST /workspace/jobs/schedules` | `{agentId, instruction, frequency, time, days?}` | `{name (req!), agentId, instruction, cronExpression OR (frequency+time)}` | ❌ FAIL |
| `updateSchedule` | `PATCH /workspace/jobs/schedules/:id` | `{id, instruction?, frequency?, time?, days?}` | All optional | ✅ OK |
| `toggleSchedule` | `PATCH /workspace/jobs/schedules/:id/toggle` | `{}` | — | ✅ OK |
| `deleteSchedule` | `DELETE /workspace/jobs/schedules/:id` | — | — | ✅ OK |
| `createTrigger` | `POST /workspace/jobs/triggers` | `{agentId, instruction, triggerType, condition}` | Same fields | ✅ OK |
| `updateTrigger` | `PATCH /workspace/jobs/triggers/:id` | `{id, instruction?, triggerType?, condition?}` | All optional | ✅ OK |
| `toggleTrigger` | `PATCH /workspace/jobs/triggers/:id/toggle` | `{}` | — | ✅ OK |
| `deleteTrigger` | `DELETE /workspace/jobs/triggers/:id` | — | — | ✅ OK |
| `cancelJob` | `DELETE /workspace/jobs/:id` | — | — | ✅ OK |
| `markRead` | `PUT /workspace/jobs/:id/read` | `{}` | — | ✅ OK |
| `createChain` | `POST /workspace/jobs/chain` | `{steps}` | `{steps}` | ✅ OK |
| `cancelChain` | `DELETE /workspace/jobs/chain/:chainId` | — | — | ✅ OK |

### WS / Real-time

- `useWsStore` provides `subscribe`, `addListener`, `removeListener`, `isConnected` ✅
- `subscribe('night-job', {})` — subscribes to WS channel
- `addListener('night-job::${user.companyId}', wsHandler)` — listens on scoped key ✅
- Handler correctly handles: `job-progress`, `job-completed`, `job-failed`, `job-retrying`, `job-queued`, `chain-failed` ✅
- `useAuthStore` used for `user.companyId` ✅

### Issues Found

**Issue 1 (Critical): `createSchedule` mutation missing required `name` field**
Server's `createScheduleSchema` (schedules.ts lines 32-45):
```ts
const createScheduleSchema = z.object({
  name: z.string().min(1).max(200),  // ← REQUIRED, no default
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  ...
})
```
`createSchedule.mutationFn` sends `{ agentId, instruction, frequency, time, days? }` — **no `name` field**.
Result: Every schedule creation attempt returns HTTP 400 Bad Request. Schedules tab is completely non-functional for creating new schedules. The `modalInstruction` value exists and could serve as the name, but it's not wired up.

**Issue 2 (Medium): `updateSchedule` cannot update schedule name**
The edit form has no `name` input field (not collected in modal state). `updateScheduleSchema` allows `name` as optional, so it won't fail, but users cannot change a schedule's name after creation.

**Issue 3 (Medium): WS `subscribe` vs `addListener` channel key mismatch risk**
`subscribe('night-job', {})` sends `{ type: 'subscribe', channel: 'night-job' }` to WS server.
`addListener('night-job::${user.companyId}', wsHandler)` listens on a scoped key.
If the WS server broadcasts events on `night-job::${companyId}` but the subscription is on bare `'night-job'`, event routing depends entirely on server-side behavior. This is a convention mismatch that should be verified.

**Issue 4 (Low): `['agents']` queryKey conflicts with hub/index.tsx `['sessions']` but is different from dashboard.tsx `['dashboard-agents']`**
All three files query `GET /workspace/agents` but use different queryKeys: `['agents']` (jobs), `['dashboard-agents']` (dashboard), `['workspace-agents', ...]` (agents page). Three separate cache entries for the same endpoint. Minor duplication, not a bug.

**Issue 5 (Low): typeFilter state + activeTab state are independent — confusing UX state**
If user sets `typeFilter = 'schedule'` while on `activeTab = 'oneTime'`, the jobs list becomes empty with no explanation (the jobs are filtered out by `typeFilter !== 'oneTime'` check). No validation or sync between the two state values.

---

## Overall Scores

| File | Score | Critical Issues |
|------|-------|-----------------|
| dashboard.tsx | 7/10 | WS bare key listener may miss events; navigate to undefined route |
| hub/index.tsx | 8/10 | No error state; stale callback deps |
| agents.tsx | 6/10 | personalityTraits silently dropped; hardcoded stub history data |
| jobs.tsx | 6/10 | createSchedule always 400 (missing `name`); WS subscription mismatch |
| **Overall** | **6.75 / 10** | 2 blocking bugs (jobs#1, agents#2), 1 stub violation (agents#3) |

---

## Blocking Issues (Must Fix Before Ship)

1. **jobs.tsx L353-355**: `createSchedule.mutate(body)` — add `name: modalInstruction.trim()` (or a dedicated `modalScheduleName` state) to the body. All schedule creation currently fails with HTTP 400.
2. **agents.tsx L741-750**: `handleCreate` — add `personalityTraits: formData.personalityTraits` to the create body. Big Five personality feature is silently non-functional on create.
3. **agents.tsx L455-458**: `recentActivities` hardcoded stub — replace with real API call or clearly mark as `// TODO: fetch from /workspace/activity-log?agentId=`. No stub/mock as done.

## Non-Blocking But Should Fix

4. **dashboard.tsx L605**: Navigate to `/agents/${agent.id}` → either wire up agent detail route or change to `/agents` with the agent pre-selected.
5. **dashboard.tsx WS listener keys**: Verify whether WS broadcasts use bare `'agent-status'` or scoped `'agent-status::companyId'` key.
6. **agents.tsx header comment**: Update to reflect actual `/workspace/agents` endpoints, not `/admin/agents`.
