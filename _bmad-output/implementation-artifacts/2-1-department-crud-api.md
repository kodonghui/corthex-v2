# Story 2.1: Department CRUD API

Status: done

## Story

As a company admin (company_admin or super_admin),
I want to create, read, update, and delete departments via REST API,
so that I can dynamically manage the organizational structure of my AI agent team.

## Acceptance Criteria

1. POST /api/admin/departments -- creates a department with name, description; returns 201 with created department
2. GET /api/admin/departments -- returns all active departments for the tenant (companyId-scoped)
3. GET /api/admin/departments/:id -- returns a single department by ID (tenant-scoped)
4. PATCH /api/admin/departments/:id -- updates department name/description; returns updated department
5. DELETE /api/admin/departments/:id -- soft-deletes (isActive=false); returns confirmation
6. Department name uniqueness enforced within the same company (on both create AND update)
7. All write operations (create/update/delete) produce audit log entries via `createAuditLog` from `services/audit-log.ts`
8. All endpoints enforce tenant isolation via `tenantMiddleware` + `withTenant`/`scopedWhere`/`scopedInsert` helpers
9. DELETE blocked if department has active agents (409 with agent count) -- agents must be moved/deactivated first
10. Only `super_admin` and `company_admin` roles can access (via `adminOnly` middleware)

## Tasks / Subtasks

- [x] Task 1: Enhance existing department route file (AC: #1-#10)
  - [x] 1.1 Add GET /:id endpoint (single department fetch, tenant-scoped)
  - [x] 1.2 Add audit logging to POST (create) using `createAuditLog`
  - [x] 1.3 Add audit logging to PATCH (update) with before/after snapshot
  - [x] 1.4 Add audit logging to DELETE (soft-delete) with before snapshot
  - [x] 1.5 Add name uniqueness check on PATCH (update) -- exclude self from duplicate check
  - [x] 1.6 Use AUDIT_ACTIONS constants (ORG_DEPARTMENT_CREATE, ORG_DEPARTMENT_UPDATE, ORG_DEPARTMENT_DELETE)
  - [x] 1.7 Set `updatedAt` on PATCH operations
  - [x] 1.8 DELETE returns `{ data: { message: '...' } }` matching API response pattern

- [x] Task 2: Add OrganizationService layer (AC: #1-#9)
  - [x] 2.1 Create `packages/server/src/services/organization.ts` with department service functions
  - [x] 2.2 Move business logic from route handlers into service (validation, audit logging, tenant scoping)
  - [x] 2.3 Service functions: createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment

- [x] Task 3: Validate API response format consistency (AC: #1-#5, #8)
  - [x] 3.1 All success responses use `{ data: ... }` wrapper
  - [x] 3.2 All error responses use `{ error: { code, message } }` via HTTPError

## Dev Notes

### Existing Code (MUST build on, NOT rewrite)

The department CRUD route **already exists** at `packages/server/src/routes/admin/departments.ts`:
- Already has POST, GET (list), PATCH, DELETE endpoints
- Already has tenant isolation via `tenantMiddleware` + `withTenant`/`scopedWhere`/`scopedInsert`
- Already has `adminOnly` middleware
- Already has name uniqueness check on CREATE
- Already has agent count check on DELETE
- Already has `/departments/tree` endpoint (bonus, not in this story's scope)

**What's MISSING (this story adds):**
1. GET /:id (single department by ID) endpoint
2. Audit log integration on all write operations
3. Name uniqueness check on UPDATE (currently only on CREATE)
4. `updatedAt` field setting on PATCH
5. OrganizationService abstraction layer (business logic in service, not route)

### Architecture Patterns & Constraints

- **Middleware chain:** `authMiddleware` -> `adminOnly` -> `tenantMiddleware` (already applied)
- **Tenant context:** `c.get('tenant')` returns `{ companyId, userId, role, isAdminUser? }`
- **DB ORM:** Drizzle ORM with `db.select().from(table).where(...)` pattern
- **Audit logging:** Use `createAuditLog` or `withAuditLog` wrapper from `packages/server/src/services/audit-log.ts`
- **Audit actions:** Use constants from `AUDIT_ACTIONS` object (e.g., `AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE`)
- **Error handling:** Throw `HTTPError(status, message, code)` -- global error handler formats response
- **Validation:** Use `zValidator('json', schema)` with Zod schemas
- **API response format:** `{ data: ... }` for success, `{ error: { code, message } }` for errors

### Database Schema (departments table)

```typescript
// packages/server/src/db/schema.ts lines 102-112
pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Tenant Helpers (packages/server/src/db/tenant-helpers.ts)

- `withTenant(column, companyId)` -- eq condition for SELECT/UPDATE/DELETE
- `scopedWhere(column, companyId, ...conditions)` -- AND with tenant filter
- `scopedInsert(companyId, data)` -- injects companyId into INSERT data

### Audit Log Service (packages/server/src/services/audit-log.ts)

```typescript
// Use these action constants:
AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE  // 'org.department.create'
AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE  // 'org.department.update'
AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE  // 'org.department.delete'

// createAuditLog input:
{
  companyId: string,
  actorType: 'admin_user' | 'user',  // use tenant.isAdminUser to determine
  actorId: string,                    // tenant.userId
  action: string,                     // AUDIT_ACTIONS constant
  targetType: 'department',
  targetId: string,                   // department ID
  before?: unknown,                   // previous state (update/delete)
  after?: unknown,                    // new state (create/update)
  metadata?: Record<string, unknown>
}
```

### Project Structure Notes

- Route file: `packages/server/src/routes/admin/departments.ts` (EXISTING -- enhance, don't rewrite)
- New service file: `packages/server/src/services/organization.ts` (NEW)
- Route is mounted at `app.route('/api/admin', departmentsRoute)` in `packages/server/src/index.ts` line 79
- Test files should go in `packages/server/src/__tests__/unit/` directory
- Import paths are relative (e.g., `../../db`, `../../services/audit-log`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S1] -- Story definition and acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#FR1] -- "Admin은 웹 UI에서 부서를 생성/수정/삭제할 수 있다"
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-5] -- Dynamic Organization Management + Cascade Engine
- [Source: packages/server/src/routes/admin/departments.ts] -- Existing route implementation
- [Source: packages/server/src/services/audit-log.ts] -- Audit log service with AUDIT_ACTIONS constants
- [Source: packages/server/src/db/tenant-helpers.ts] -- Tenant isolation helpers
- [Source: packages/server/src/middleware/rbac.ts] -- RBAC middleware
- [Source: packages/server/src/middleware/auth.ts] -- Auth + adminOnly middleware

### Anti-Patterns to Avoid

- Do NOT recreate the departments route from scratch -- enhance the existing file
- Do NOT skip audit logging -- it's a core requirement for organization changes
- Do NOT use raw SQL -- use Drizzle ORM patterns established in Epic 1
- Do NOT duplicate tenant isolation logic -- use existing helpers
- Do NOT forget `updatedAt` on PATCH operations
- Do NOT allow duplicate department names within the same company on UPDATE

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- Created OrganizationService (`services/organization.ts`) with 5 functions: getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment
- Enhanced department route to use service layer instead of inline DB logic
- Added GET /departments/:id endpoint for single department fetch
- Added audit logging to all write operations (create/update/delete) using AUDIT_ACTIONS constants
- Added name uniqueness check on UPDATE (excluding self via `ne(departments.id, departmentId)`)
- Added `updatedAt` timestamp on PATCH operations
- Fixed route ordering: /departments/tree before /departments/:id to prevent param capture
- Added AppEnv type to Hono instance for proper TypeScript typing
- 19 unit tests passing, no regressions in related tests

### File List

- packages/server/src/services/organization.ts (NEW)
- packages/server/src/routes/admin/departments.ts (MODIFIED)
- packages/server/src/__tests__/unit/department-crud.test.ts (NEW)
- packages/server/src/__tests__/unit/department-crud-tea.test.ts (NEW - TEA)
- packages/server/src/__tests__/unit/department-crud-qa.test.ts (NEW - QA)
