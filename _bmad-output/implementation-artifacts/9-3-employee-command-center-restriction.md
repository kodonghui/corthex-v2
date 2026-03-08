# Story 9.3: Employee Command Center Restriction

Status: done

## Story

As a Human Employee (role='employee'),
I want to only see commands, agents, costs, and activity from my assigned departments,
so that I work within my permitted scope without accessing other departments' data.

## Acceptance Criteria

1. **AC1: Department-Scoped Middleware**
   - New middleware `departmentScopeMiddleware` that checks `tenant.role`
   - If role is `employee`: query `employee_departments` to get assigned departmentIds
   - Inject `tenant.departmentIds: string[]` into context for downstream handlers
   - If role is `ceo`, `company_admin`, or `super_admin`: bypass (no departmentIds filter, see all)
   - If employee has NO department assignments: return empty arrays (no data access)

2. **AC2: @Mention Restriction — Only Assigned-Department Agents**
   - GET `/api/workspace/agents` for employee users: filter agents by `departmentId IN employee's departmentIds`
   - Employee can only @mention managers/specialists/workers from their departments
   - CEO/admin sees all agents (no filter)

3. **AC3: Command History Restriction**
   - GET `/api/workspace/commands` for employee: only show commands created by that employee (already userId-filtered)
   - POST `/api/workspace/commands`: employee can only target agents from assigned departments
   - If `targetAgentId` specified and agent not in employee's departments → 403

4. **AC4: Cost View Restriction — Department Only**
   - GET `/api/workspace/dashboard/costs`: for employee, filter `costRecords` to only include agents belonging to employee's departments
   - GET `/api/workspace/dashboard/budget`: for employee, filter `byDepartment` to only assigned departments
   - GET `/api/workspace/dashboard/summary`: for employee, scope task/cost/agent counts to assigned departments

5. **AC5: Activity Log Restriction**
   - GET `/api/workspace/activity-log`: for employee, filter activity to only events from assigned departments (by actorId matching agents in employee's departments)
   - GET `/activity/agents`, `/activity/delegations`, `/activity/quality`, `/activity/tools`: scope to employee's departments

6. **AC6: Edge Cases**
   - Employee with 0 departments: gets empty results for all queries (no error)
   - Employee deactivated (isActive=false): auth middleware already blocks login
   - Super admin impersonating: bypasses all restrictions
   - Agent moved to different department: employee immediately loses/gains visibility

## Tasks / Subtasks

- [x] Task 1: Create `departmentScopeMiddleware` (AC: #1)
  - [x] 1.1 New file `packages/server/src/middleware/department-scope.ts`
  - [x] 1.2 Query `employeeDepartments` for employee role users
  - [x] 1.3 Inject `departmentIds` into tenant context (extend `TenantContext` type in shared)
  - [x] 1.4 CEO/admin bypass: skip query, leave `departmentIds` undefined (means "all")

- [x] Task 2: Restrict Agent Listing (AC: #2)
  - [x] 2.1 In `workspace/agents.ts` GET `/agents`: if `tenant.departmentIds` exists, filter agents by `departmentId IN departmentIds`
  - [x] 2.2 GET `/agents/hierarchy`: same filter
  - [x] 2.3 GET `/agents/:id`: verify agent's department is in scope

- [x] Task 3: Restrict Command Submission (AC: #3)
  - [x] 3.1 In `commands.ts` POST `/`: if employee and `targetAgentId` specified, verify agent belongs to assigned department
  - [x] 3.2 Reject with 403 if agent not in scope

- [x] Task 4: Restrict Cost/Dashboard Views (AC: #4)
  - [x] 4.1 In `dashboard.ts` cost routes: pass `departmentIds` to service functions
  - [x] 4.2 Service functions filter `costRecords` by agents in scoped departments
  - [x] 4.3 Budget route: filter `byDepartment` to only assigned departments

- [x] Task 5: Restrict Activity Logs (AC: #5)
  - [x] 5.1 In `activity-log.ts`: filter by department-scoped agent IDs
  - [x] 5.2 In `activity-tabs.ts`: auto-inject departmentId filter for employee users

- [x] Task 6: Apply middleware to workspace routes (AC: #1)
  - [x] 6.1 Add `departmentScopeMiddleware` after `authMiddleware` on workspace routes that need scoping

## Dev Notes

### Middleware Design: `departmentScopeMiddleware`

```typescript
// packages/server/src/middleware/department-scope.ts
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { employeeDepartments } from '../db/schema'
import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'

export const departmentScopeMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')

  // CEO/admin bypass -- see everything
  if (tenant.role !== 'employee') {
    await next()
    return
  }

  // Employee: query assigned departments
  const assignments = await db
    .select({ departmentId: employeeDepartments.departmentId })
    .from(employeeDepartments)
    .where(eq(employeeDepartments.userId, tenant.userId))

  // Inject into tenant context
  const deptIds = assignments.map(a => a.departmentId)
  c.set('tenant', { ...tenant, departmentIds: deptIds })

  await next()
}
```

### TenantContext Extension (shared/types.ts)

Add optional field:
```typescript
export type TenantContext = {
  companyId: string
  userId: string
  role: UserRole
  isAdminUser?: boolean
  departmentIds?: string[]  // NEW: employee's assigned department IDs (undefined = all)
}
```

### Key Pattern: Undefined = All Access

- `tenant.departmentIds === undefined` → CEO/admin, no filter needed
- `tenant.departmentIds.length === 0` → employee with no departments, empty results
- `tenant.departmentIds.length > 0` → employee, filter by these department IDs

### Existing Code to Modify

| File | Change |
|------|--------|
| `packages/shared/src/types.ts` | Add `departmentIds?: string[]` to TenantContext |
| `packages/server/src/middleware/department-scope.ts` | NEW middleware |
| `packages/server/src/routes/workspace/agents.ts` | Filter agents by departmentIds |
| `packages/server/src/routes/commands.ts` | Validate targetAgent department on POST |
| `packages/server/src/routes/workspace/dashboard.ts` | Pass departmentIds to service functions |
| `packages/server/src/routes/workspace/activity-log.ts` | Filter by department-scoped agents |
| `packages/server/src/routes/workspace/activity-tabs.ts` | Auto-inject departmentId filter |

### Do NOT Touch

- `packages/server/src/routes/admin/*` — admin routes already use adminOnly middleware
- `packages/server/src/services/employee-management.ts` — no changes needed
- `packages/server/src/middleware/auth.ts` — leave unchanged, department scope is separate concern

### Agent-Department Relationship

Agents have `departmentId` column in `agents` table. To get agents in employee's departments:
```sql
SELECT * FROM agents WHERE department_id IN (employee's departmentIds) AND company_id = ?
```

### Testing Strategy

- Test middleware with employee, ceo, admin roles
- Test each restricted endpoint with employee (scoped) vs ceo (unscoped)
- Test edge case: employee with 0 departments → empty results
- Test employee targeting agent outside department → 403
- Test that admin routes are NOT affected

### Project Structure Notes

- New middleware follows existing pattern: `packages/server/src/middleware/department-scope.ts`
- Middleware is composable: `authMiddleware` → `departmentScopeMiddleware` → handler
- Tests: `packages/server/src/__tests__/unit/department-scope.test.ts`

### Previous Story Intelligence (9-2)

- `employeeDepartments` table already exists with `userId + departmentId + companyId`
- `getEmployeeDepartments(userId)` helper exists in `employee-management.ts` — can reference pattern but middleware should do its own lean query
- All employee queries filter `role='user'` to prevent admin manipulation
- `employee-management.ts` has `validateDepartmentOwnership()` — not needed here but good pattern reference
- 151 tests passing from 9-2, no regressions

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR45] Human 직원은 자기 워크스페이스 내에서만 명령/비용/이력 확인
- [Source: _bmad-output/planning-artifacts/epics.md#E9-S3] 직원 사령관실 접근 제한 (2 SP)
- [Source: packages/server/src/db/schema.ts] employeeDepartments table
- [Source: packages/server/src/services/employee-management.ts] getEmployeeDepartments pattern
- [Source: packages/server/src/routes/commands.ts] Command submission routes
- [Source: packages/server/src/routes/workspace/agents.ts] Agent listing routes
- [Source: packages/server/src/routes/workspace/dashboard.ts] Dashboard/cost routes
- [Source: packages/server/src/routes/workspace/activity-log.ts] Activity log routes
- [Source: packages/server/src/routes/workspace/activity-tabs.ts] Activity tabs routes
- [Source: packages/shared/src/types.ts] TenantContext type definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Implemented departmentScopeMiddleware that queries employee_departments and injects departmentIds into TenantContext
- CEO/admin/super_admin bypass (departmentIds stays undefined = all access)
- Employee with 0 departments gets empty array (no data access)
- Agent listing (GET /agents, /agents/hierarchy) filtered by departmentIds via inArray
- Agent detail (GET /agents/:id) validates department scope, returns 403 SCOPE_001 if out of scope
- Command POST validates targetAgentId department, returns 403 SCOPE_002 if out of scope
- Dashboard costs filtered by scoped agent IDs (agents in employee's departments)
- Budget byDepartment filtered to only show assigned departments
- Dashboard summary agent counts scoped to departments
- Activity log filtered by scoped actor IDs (agents in departments + employee's own userId)
- Activity tabs (agents, delegations, quality, tools) pass departmentIds to service filters
- 35 unit tests covering all 6 ACs + edge cases
- No regressions in existing tests

### File List

- packages/server/src/middleware/department-scope.ts (existing, complete)
- packages/shared/src/types.ts (departmentIds already in TenantContext)
- packages/server/src/routes/workspace/agents.ts (added middleware + department filtering)
- packages/server/src/routes/commands.ts (added middleware + targetAgent validation)
- packages/server/src/routes/workspace/dashboard.ts (added middleware + cost/budget scoping)
- packages/server/src/routes/workspace/activity-log.ts (added middleware + actor ID scoping)
- packages/server/src/routes/workspace/activity-tabs.ts (added middleware + departmentIds passthrough)
- packages/server/src/services/dashboard.ts (getSummary/getBudget accept departmentIds)
- packages/server/src/services/cost-aggregation.ts (getByAgent accepts departmentIds)
- packages/server/src/services/activity-log-service.ts (all 4 functions accept departmentIds)
- packages/server/src/__tests__/unit/department-scope.test.ts (NEW - 35 tests)
