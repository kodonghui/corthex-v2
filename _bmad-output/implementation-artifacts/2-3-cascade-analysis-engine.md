# Story 2.3: Cascade Analysis Engine

Status: done

## Story

As a company admin (company_admin or super_admin),
I want the system to analyze cascade impact before department deletion and support "wait for completion" or "force terminate" modes,
so that I can make informed decisions about department deletion and safely handle in-progress tasks, agent reassignment, and data preservation.

## Acceptance Criteria

1. GET /api/admin/departments/:id/cascade-analysis returns impact report: agent count, active task count, accumulated cost, memory/knowledge count
2. DELETE /api/admin/departments/:id?mode=wait_completion -- marks department as "pending deletion", waits for active tasks to complete, then processes cascade
3. DELETE /api/admin/departments/:id?mode=force -- immediately terminates active tasks (saves partial results), then processes cascade
4. DELETE /api/admin/departments/:id (no mode, no active tasks) -- proceeds with immediate cascade if no active tasks exist
5. Cascade processing: all agents in department are unassigned (departmentId=null, isActive=false, status='offline') -- reuses deactivateAgent pattern
6. Cascade processing: department_knowledge records for the department are preserved (NOT deleted) -- read-only archive
7. Cascade processing: cost_records referencing department agents are preserved permanently (never deleted)
8. Cascade processing: department itself is soft-deleted (isActive=false)
9. Audit log records cascade operation with full before/after snapshot including impact analysis
10. All endpoints enforce tenant isolation via tenantMiddleware + scopedWhere
11. Only super_admin and company_admin roles can access (via adminOnly middleware)
12. If department not found, return 404; if department already inactive, return 409
13. Impact analysis response includes breakdown per agent (name, tier, activeTaskCount, totalCost)

## Tasks / Subtasks

- [x] Task 1: Add cascade audit actions to audit-log.ts (AC: #9)
  - [x] 1.1 Add ORG_CASCADE_ANALYZE and ORG_CASCADE_EXECUTE to AUDIT_ACTIONS
- [x] Task 2: Add CascadeAnalysis interface and analyzeCascade() to organization.ts (AC: #1, #10, #13)
  - [x] 2.1 Define CascadeAnalysis interface (departmentId, departmentName, agentCount, activeTaskCount, totalCostUsdMicro, knowledgeCount, agentBreakdown[])
  - [x] 2.2 Implement analyzeCascade(companyId, departmentId) -- queries agents, orchestration_tasks (status='pending'|'processing'), cost_records (SUM), department_knowledge (COUNT)
  - [x] 2.3 Build per-agent breakdown: for each agent in department, count active tasks + sum costs
- [x] Task 3: Add executeCascade() to organization.ts (AC: #2-#8, #9, #12)
  - [x] 3.1 Implement executeCascade(tenant, departmentId, mode) with validation (dept exists, dept is active)
  - [x] 3.2 mode='force': update active orchestration_tasks for department agents to status='failed' with metadata.reason='cascade_force_stop', save partial output
  - [x] 3.3 mode='wait_completion': mark department pendingDeletion=true (use metadata or separate flag), return { status: 'pending', message } -- actual deletion deferred
  - [x] 3.4 Unassign all department agents: batch update departmentId=null, isActive=false, status='offline' (reuse deactivateAgent logic but skip isSystem check -- system agents in deleted dept also get unassigned)
  - [x] 3.5 Soft-delete department: isActive=false
  - [x] 3.6 Audit log with cascade analysis snapshot in metadata
- [x] Task 4: Add cascade routes to departments route (AC: #1-#4, #10, #11)
  - [x] 4.1 GET /departments/:id/cascade-analysis -- calls analyzeCascade, returns impact report
  - [x] 4.2 Update DELETE /departments/:id -- accept ?mode= query param, call executeCascade instead of current deleteDepartment
  - [x] 4.3 Zod validation for mode query param: z.enum(['wait_completion', 'force']).optional()
- [x] Task 5: Update existing deleteDepartment or replace with executeCascade (AC: #4)
  - [x] 5.1 Current deleteDepartment blocks if agents exist -- replace with cascade logic
  - [x] 5.2 If no active tasks and no mode specified, proceed with immediate cascade (no agents blocking)

## Dev Notes

### Existing Code (MUST build on, NOT rewrite)

**Organization Service** (`packages/server/src/services/organization.ts`):
- Already has department CRUD + agent CRUD functions
- Current `deleteDepartment()` blocks deletion if ANY agents exist (returns 409 with agent count) -- THIS MUST BE REPLACED with cascade logic
- `deactivateAgent()` pattern: sets departmentId=null, isActive=false, status='offline' -- REUSE this pattern for batch agent unassignment
- TenantActor interface, actorType() helper already defined
- Import helpers: withTenant, scopedWhere, scopedInsert from tenant-helpers.ts

**Department Route** (`packages/server/src/routes/admin/departments.ts`):
- Already has GET/POST/PATCH/DELETE with authMiddleware + adminOnly + tenantMiddleware
- DELETE currently calls deleteDepartment(tenant, id) -- update to support cascade
- Route ordering: `/departments/tree` before `/departments/:id` -- add `/departments/:id/cascade-analysis` BEFORE `/:id` param route

**Audit Log** (`packages/server/src/services/audit-log.ts`):
- AUDIT_ACTIONS already has ORG_DEPARTMENT_DELETE -- add ORG_CASCADE_ANALYZE and ORG_CASCADE_EXECUTE
- createAuditLog supports metadata field for extra context

### Database Schema References

**agents table** (schema.ts lines 115-137):
- departmentId: nullable FK to departments
- isActive, status, isSystem fields
- companyId for tenant isolation

**orchestration_tasks table** (schema.ts lines 728-748):
- companyId, commandId, agentId
- status: orchestrationTaskStatusEnum (pending, processing, completed, failed, cancelled)
- Has companyAgentIdx index on (companyId, agentId) -- efficient for per-agent task queries

**cost_records table** (schema.ts lines 468-481):
- companyId, agentId (nullable FK)
- costUsdMicro: integer (1 = $0.000001)
- No departmentId column -- must join through agents.departmentId to get department costs

**department_knowledge table** (schema.ts lines 303-314):
- companyId, departmentId (NOT NULL FK)
- These records are PRESERVED on cascade (read-only archive, not deleted)

**departments table**:
- id, companyId, name, description, isActive, createdAt, updatedAt

### Architecture Compliance

From Architecture Decision #5 (Dynamic Organization Management + Cascade Engine):
```typescript
interface CascadeAnalysis {
  departmentId: string;
  activeTaskCount: number;
  agentCount: number;
  totalCost: number;
  memoryCount: number;
}
```

The architecture specifies:
1. `analyzeCascade(deptId)` -- returns impact report
2. `mode='wait'` -- waitForActiveTasks(deptId)
3. `mode='force'` -- forceStopTasks(deptId)
4. `archiveMemories(deptId)` -- preserve knowledge (department_knowledge stays as-is)
5. Cost records permanently preserved (never deleted)
6. `unassignAgents(deptId)` -- batch departmentId=null, isActive=false
7. `softDeleteDepartment(deptId)` -- isActive=false

### Implementation Strategy

**For mode='force':**
- Query all agents in department
- Find active orchestration_tasks (status IN ('pending', 'processing')) for those agents
- UPDATE tasks: status='failed', metadata.reason='cascade_force_stop', completedAt=now()
- Batch unassign all agents
- Soft-delete department

**For mode='wait_completion':**
- Since we don't have a background job system yet, this mode should:
  - Check if there are active tasks
  - If YES: return { status: 'pending', activeTaskCount, message: 'Active tasks must complete first' } -- do NOT delete yet
  - The admin must retry DELETE after tasks complete, or switch to mode=force
  - This is a polling-based approach (simpler than background workers for P0)

**For no mode specified:**
- Run analyzeCascade first
- If activeTaskCount === 0: proceed with immediate cascade (unassign agents + soft-delete dept)
- If activeTaskCount > 0: return 409 with analysis, requiring admin to choose a mode

### Anti-Patterns to Avoid

- Do NOT hard-delete anything -- all operations are soft-delete or preserve
- Do NOT delete cost_records -- they must be permanently preserved
- Do NOT delete department_knowledge -- they are archived in-place
- Do NOT create a separate cascade service file -- add to existing organization.ts
- Do NOT skip tenant isolation -- every query must include companyId scope
- Do NOT skip audit logging on cascade operations
- Do NOT use cascading FK deletes -- all cascade logic is application-level
- Do NOT forget to handle isSystem agents during cascade -- they get unassigned too (department is being deleted, system agents survive as unassigned)
- Do NOT accept companyId from request body -- always from tenant context

### Testing Approach

Test file: `packages/server/src/__tests__/unit/cascade-analysis.test.ts`

Key test scenarios:
1. analyzeCascade returns correct counts (agents, tasks, costs, knowledge)
2. analyzeCascade returns per-agent breakdown
3. analyzeCascade returns zeros for empty department
4. executeCascade mode=force stops active tasks
5. executeCascade mode=force unassigns all agents (including isSystem)
6. executeCascade mode=force soft-deletes department
7. executeCascade mode=wait_completion with active tasks returns pending status
8. executeCascade mode=wait_completion with no active tasks proceeds immediately
9. executeCascade without mode and no active tasks proceeds immediately
10. executeCascade without mode and active tasks returns 409
11. executeCascade on non-existent department returns 404
12. executeCascade on inactive department returns 409
13. cost_records preserved after cascade (verify they still exist)
14. department_knowledge preserved after cascade
15. Audit log created with cascade analysis in metadata
16. Tenant isolation enforced on all operations

### Project Structure Notes

- Service file: `packages/server/src/services/organization.ts` (MODIFY -- add cascade functions)
- Audit log: `packages/server/src/services/audit-log.ts` (MODIFY -- add cascade audit actions)
- Route file: `packages/server/src/routes/admin/departments.ts` (MODIFY -- add cascade-analysis route, update DELETE)
- Test file: `packages/server/src/__tests__/unit/cascade-analysis.test.ts` (NEW)
- Schema imports needed: agents, departments, orchestrationTasks, costRecords, departmentKnowledge from db/schema
- ORM imports needed: eq, and, count, sum, inArray, sql from drizzle-orm

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S3] -- Story definition: Cascade analysis/processing engine
- [Source: _bmad-output/planning-artifacts/prd.md#FR6] -- cascade impact analysis display
- [Source: _bmad-output/planning-artifacts/prd.md#FR7] -- wait_completion / force modes
- [Source: _bmad-output/planning-artifacts/prd.md#FR8] -- memory archive + cost preservation + agent unassignment
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-5] -- CascadeAnalysis interface + OrganizationService methods
- [Source: packages/server/src/services/organization.ts] -- Existing department/agent service (build on this)
- [Source: packages/server/src/routes/admin/departments.ts] -- Existing department routes (add cascade-analysis, update DELETE)
- [Source: packages/server/src/services/audit-log.ts] -- Audit log with AUDIT_ACTIONS constants
- [Source: _bmad-output/implementation-artifacts/2-2-agent-crud-api.md] -- Previous story patterns

### Previous Story Intelligence (Story 2-2)

Key patterns from Story 2-2 (Agent CRUD API):
- Service functions return `{ data: ... }` or `{ error: { status, message, code } }` -- follow same pattern
- TenantActor interface: `{ companyId, userId, isAdminUser? }` -- reuse
- actorType() helper for audit log actor type -- reuse
- Audit log with before/after snapshots -- follow same pattern, add cascade analysis in metadata
- Zod validation on route input -- follow same pattern for mode query param
- Test pattern: mock db operations, test service functions directly
- Route ordering: specific paths (like /tree) before parameterized paths (/:id)

### Git Intelligence

Recent commit patterns:
- `feat: Story 2-2 Agent CRUD API -- system agent protection, soft deactivation, 90 tests`
- `feat: Story 2-1 Department CRUD API -- OrganizationService + audit logging, 132 tests`
- All stories add to organization.ts service, modify route files, create new test files
- Test counts: 90+ tests per story is the established baseline

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Added ORG_CASCADE_ANALYZE and ORG_CASCADE_EXECUTE audit action constants
- Implemented analyzeCascade() in OrganizationService: queries agents, orchestration_tasks, cost_records, department_knowledge per department
- Implemented executeCascade() in OrganizationService with 3 modes: force (stop tasks + cascade), wait_completion (defer if active tasks), immediate (no active tasks)
- Updated DELETE /api/admin/departments/:id to use executeCascade with ?mode= query param
- Added GET /api/admin/departments/:id/cascade-analysis endpoint for impact preview
- Per-agent breakdown in analysis: name, tier, isSystem, activeTaskCount, totalCostUsdMicro
- Audit log records full cascade analysis in metadata (mode, analysis snapshot)
- Data preservation: cost_records never deleted, department_knowledge preserved, agents soft-deactivated
- 53 unit tests passing, all existing tests pass (no regressions)

### File List

- packages/server/src/services/organization.ts (MODIFIED -- added CascadeAnalysis, AgentCascadeBreakdown, analyzeCascade, executeCascade, CascadeMode)
- packages/server/src/services/audit-log.ts (MODIFIED -- added ORG_CASCADE_ANALYZE, ORG_CASCADE_EXECUTE constants)
- packages/server/src/routes/admin/departments.ts (MODIFIED -- added cascade-analysis route, updated DELETE to use executeCascade)
- packages/server/src/__tests__/unit/cascade-analysis.test.ts (NEW -- 53 tests)
