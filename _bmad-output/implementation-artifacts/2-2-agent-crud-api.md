# Story 2.2: Agent CRUD API

Status: done

## Story

As a company admin (company_admin or super_admin),
I want to create, read, update, and delete AI agents via REST API with system agent protection and soft deactivation,
so that I can dynamically manage AI agent workforce including tier assignment, model selection, Soul editing, and tool permissions.

## Acceptance Criteria

1. POST /api/admin/agents -- creates an agent with name, tier, modelName, allowedTools, soulMarkdown, departmentId; returns 201
2. GET /api/admin/agents -- returns all agents for the tenant (companyId-scoped), filterable by departmentId and isActive
3. GET /api/admin/agents/:id -- returns a single agent by ID (tenant-scoped)
4. PATCH /api/admin/agents/:id -- updates agent fields (name, tier, modelName, allowedTools, soul, departmentId); returns updated agent
5. DELETE /api/admin/agents/:id -- soft-deactivates: sets departmentId=null, isActive=false, status='offline' (NOT hard delete)
6. isSystem=true agents return 403 on DELETE attempt (FR5: system agent protection)
7. Agent name uniqueness enforced within the same company (on both create AND update)
8. All write operations (create/update/delete) produce audit log entries via AUDIT_ACTIONS constants
9. All endpoints enforce tenant isolation via tenantMiddleware + withTenant/scopedWhere/scopedInsert helpers
10. Only super_admin and company_admin roles can access (via adminOnly middleware)
11. When admin updates soul, adminSoul is also updated (soul reset baseline)
12. PATCH supports allowedTools as string[] (JSON array of tool names)
13. Agent deactivation preserves cost_records and all historical data (no cascade delete)

## Tasks / Subtasks

- [x] Task 1: Add tenantMiddleware to agents route + fix tenant isolation (AC: #9, #10)
  - [x] 1.1 Import and apply tenantMiddleware to agents route middleware chain
  - [x] 1.2 Fix GET /agents to use tenant.companyId instead of query param
  - [x] 1.3 Fix POST /agents to use scopedInsert instead of raw body.companyId
  - [x] 1.4 Verify all endpoints use tenant-scoped queries

- [x] Task 2: Add agent service functions to OrganizationService (AC: #1-#8)
  - [x] 2.1 Add getAgents(companyId, filters?) -- list with optional departmentId/isActive filter
  - [x] 2.2 Add getAgentById(companyId, agentId) -- single agent fetch
  - [x] 2.3 Add createAgent(tenant, input) -- with name uniqueness check + audit log
  - [x] 2.4 Add updateAgent(tenant, agentId, input) -- with name uniqueness (exclude self) + audit log + adminSoul sync
  - [x] 2.5 Add deactivateAgent(tenant, agentId) -- isSystem check (403) + soft deactivation + audit log

- [x] Task 3: Update agents route to use service layer (AC: #1-#13)
  - [x] 3.1 Update Zod schemas: createAgentSchema (add tier, modelName, allowedTools), updateAgentSchema (add tier, modelName, allowedTools)
  - [x] 3.2 Rewrite route handlers to call OrganizationService functions
  - [x] 3.3 Add query param filtering to GET /agents (departmentId, isActive)
  - [x] 3.4 Remove companyId/userId from createAgentSchema body (injected from tenant context)

## Dev Notes

### Existing Code (MUST build on, NOT rewrite)

The agent route **already exists** at `packages/server/src/routes/admin/agents.ts`:
- Already has POST, GET (list), GET /:id, PATCH, DELETE endpoints
- Already has authMiddleware + adminOnly middleware
- Already has basic Zod validation schemas
- Already handles adminSoul sync on soul update (PATCH)

**What's MISSING (this story adds):**
1. tenantMiddleware -- currently NOT applied (critical security gap!)
2. GET /agents uses query param companyId instead of tenant context (WRONG)
3. POST /agents accepts companyId in body instead of from tenant (WRONG)
4. No audit logging on any write operation
5. No isSystem=true protection on DELETE (FR5)
6. DELETE does basic deactivation but doesn't set departmentId=null (unassign)
7. No name uniqueness validation
8. createAgentSchema missing tier, modelName, allowedTools fields
9. updateAgentSchema missing tier, modelName, allowedTools fields
10. No query filtering on GET /agents (departmentId, isActive)

### Architecture Patterns & Constraints

- **Follow Story 2-1 pattern exactly:** Service layer in organization.ts, route calls service, service handles validation + audit
- **Middleware chain:** `authMiddleware` -> `adminOnly` -> `tenantMiddleware` (departments.ts pattern)
- **Tenant context:** `c.get('tenant')` returns `{ companyId, userId, role, isAdminUser? }`
- **DB ORM:** Drizzle ORM with `db.select().from(table).where(...)` pattern
- **Tenant helpers:** withTenant, scopedWhere, scopedInsert from `db/tenant-helpers.ts`
- **Audit logging:** createAuditLog from `services/audit-log.ts` with AUDIT_ACTIONS constants
- **Error handling:** Throw `HTTPError(status, message, code)` or return `{ error: { status, message, code } }`
- **API response format:** `{ data: ... }` for success, `{ error: { code, message } }` for errors

### Database Schema (agents table)

```typescript
// packages/server/src/db/schema.ts lines 115-137
agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  departmentId: uuid('department_id').references(() => departments.id),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 200 }),
  tier: agentTierEnum('tier').notNull().default('specialist'),  // 'manager' | 'specialist' | 'worker'
  nameEn: varchar('name_en', { length: 100 }),
  modelName: varchar('model_name', { length: 100 }).notNull().default('claude-haiku-4-5'),
  reportTo: uuid('report_to'),
  soul: text('soul'),             // current soul markdown
  adminSoul: text('admin_soul'),  // admin-set baseline soul (for reset)
  status: agentStatusEnum('status').notNull().default('offline'),  // 'online' | 'working' | 'error' | 'offline'
  isSecretary: boolean('is_secretary').notNull().default(false),
  isSystem: boolean('is_system').notNull().default(false),
  allowedTools: jsonb('allowed_tools').default([]),  // string[]
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Audit Actions (already defined)

```typescript
// packages/server/src/services/audit-log.ts
AUDIT_ACTIONS.ORG_AGENT_CREATE      // 'org.agent.create'
AUDIT_ACTIONS.ORG_AGENT_UPDATE      // 'org.agent.update'
AUDIT_ACTIONS.ORG_AGENT_DELETE      // 'org.agent.delete'
AUDIT_ACTIONS.ORG_AGENT_DEACTIVATE  // 'org.agent.deactivate'
```

### Agent Deactivation Logic (FR5, FR8)

DELETE endpoint does NOT delete -- it "unassigns":
1. Check isSystem=true -> return 403 ("system agent cannot be deleted")
2. Set departmentId=null (unassign from department)
3. Set isActive=false
4. Set status='offline'
5. Audit log with ORG_AGENT_DEACTIVATE action
6. Cost records, memory, learning data are preserved (no cascade delete)

### userId Requirement

The agents table has a required `userId` column (FK to users table). For agent creation:
- Each AI agent needs a corresponding user record
- In Story 2-1 context, the admin creates the agent; the userId should be provided or auto-created
- For this story: accept userId in createAgentSchema as required field (the admin UI will handle user creation separately)

### Project Structure Notes

- Route file: `packages/server/src/routes/admin/agents.ts` (EXISTING -- enhance, don't rewrite)
- Service file: `packages/server/src/services/organization.ts` (EXISTING -- add agent functions)
- Test files: `packages/server/src/__tests__/unit/` directory
- Import paths are relative (e.g., `../../db`, `../../services/audit-log`)
- Route is mounted in `packages/server/src/index.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S2] -- Story definition and acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR2-FR5] -- Agent CRUD + system agent protection
- [Source: _bmad-output/planning-artifacts/prd.md#FR8] -- Memory archive + cost preservation on deactivation
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-5] -- Dynamic Org + Cascade Engine
- [Source: packages/server/src/routes/admin/agents.ts] -- Existing bare-bones route (MISSING tenant isolation!)
- [Source: packages/server/src/services/organization.ts] -- Existing department service (pattern to follow)
- [Source: packages/server/src/services/audit-log.ts] -- Audit log service with ORG_AGENT_* constants
- [Source: packages/server/src/db/tenant-helpers.ts] -- Tenant isolation helpers
- [Source: _bmad-output/implementation-artifacts/2-1-department-crud-api.md] -- Previous story patterns

### Anti-Patterns to Avoid

- Do NOT accept companyId from request body -- inject from tenant context via tenantMiddleware
- Do NOT hard-delete agents -- always soft deactivate (isActive=false, departmentId=null)
- Do NOT skip isSystem check on DELETE -- this is a security requirement (FR5)
- Do NOT skip audit logging -- every write operation must be logged
- Do NOT create separate agent service file -- add to existing organization.ts
- Do NOT skip name uniqueness check -- enforce within same company on create AND update
- Do NOT forget updatedAt on PATCH operations
- Do NOT forget to sync adminSoul when soul is updated

### Previous Story Intelligence (Story 2-1)

Key patterns established:
- Service functions return `{ data: ... }` or `{ error: { status, message, code } }` -- route handlers check and respond
- TenantActor interface: `{ companyId, userId, isAdminUser? }` -- reuse existing interface
- actorType() helper: `tenant.isAdminUser ? 'admin_user' : 'user'` -- reuse existing function
- Audit log always includes before/after snapshots for updates
- Name uniqueness: check with scopedWhere + ne(table.id, entityId) to exclude self on update
- Route ordering matters (specific routes before :id param routes)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- Added tenantMiddleware to agents route (critical security fix -- was completely missing!)
- Added 5 agent service functions to OrganizationService: getAgents, getAgentById, createAgent, updateAgent, deactivateAgent
- Rewrote agents route to use service layer pattern (matching departments.ts)
- Added agent name uniqueness validation (within same company) on both create and update
- Added isSystem=true protection on DELETE (returns 403, FR5)
- Soft deactivation on DELETE: sets departmentId=null, isActive=false, status='offline' (no hard delete)
- Audit logging on all write operations (create=ORG_AGENT_CREATE, update=ORG_AGENT_UPDATE, deactivate=ORG_AGENT_DEACTIVATE)
- adminSoul synced when soul is updated via PATCH
- Zod schemas updated: added tier, modelName, allowedTools, nameEn fields
- Removed companyId from createAgentSchema body (now injected from tenant context)
- GET /agents supports ?departmentId= and ?isActive= query param filtering
- GET /agents supports ?departmentId=unassigned for filtering unassigned agents
- 33 unit tests passing, 19 department tests still passing (no regressions)

### File List

- packages/server/src/services/organization.ts (MODIFIED -- added AgentInput, AgentUpdateInput, getAgents, getAgentById, createAgent, updateAgent, deactivateAgent)
- packages/server/src/routes/admin/agents.ts (MODIFIED -- added tenantMiddleware, updated Zod schemas, rewrote handlers to use service layer)
- packages/server/src/__tests__/unit/agent-crud.test.ts (NEW -- 33 tests)
