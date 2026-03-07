# Story 2.4: Org Template Apply API

Status: done

## Story

As a company admin (company_admin or super_admin),
I want to apply an organization template to bulk-create departments and agents in one API call,
so that I can quickly set up my organization structure from predefined templates without manually creating each department and agent.

## Acceptance Criteria

1. POST /api/admin/org-templates/:id/apply -> bulk-creates departments + agents defined in the template
2. GET /api/admin/org-templates -> lists all available templates (builtin + company-custom)
3. All 3 builtin templates ("투자분석", "마케팅", "올인원") each apply correctly, creating the expected departments and agents
4. Template apply completes in < 2 minutes (NFR35) -- the "올인원" template creates 4 departments + 12 agents
5. When applying a template to a company that already has departments/agents, a merge strategy is used:
   - If a department with the same name already exists (active), skip creating that department but still create new agents under it
   - If an agent with the same name already exists in the company, skip creating that agent (no duplicates)
6. The apply endpoint returns a summary: { departmentsCreated, departmentsSkipped, agentsCreated, agentsSkipped }
7. Each created department and agent has proper companyId tenant isolation
8. Each created agent gets the userId from the requesting admin's tenant context
9. Audit log records the template application with template name, summary counts, and mode
10. All endpoints enforce tenant isolation via tenantMiddleware + scopedWhere
11. Only super_admin and company_admin roles can access (via adminOnly middleware)
12. If template not found, return 404; if template is inactive, return 409
13. GET /api/admin/org-templates/:id returns a single template by ID (for preview before apply)

## Tasks / Subtasks

- [x] Task 1: Add applyTemplate() function to organization.ts service (AC: #1, #4, #5, #6, #7, #8, #9)
  - [x] 1.1 Accept tenant + templateId, load template from org_templates table
  - [x] 1.2 Validate template exists and is active
  - [x] 1.3 Iterate template departments: check existing by name, create if new (via createDepartment pattern)
  - [x] 1.4 Iterate template agents per department: check existing by name, create if new (via createAgent pattern)
  - [x] 1.5 Return summary { departmentsCreated, departmentsSkipped, agentsCreated, agentsSkipped, details[] }
  - [x] 1.6 Audit log with ORG_TEMPLATE_APPLY action + summary in metadata
- [x] Task 2: Add getOrgTemplates() and getOrgTemplateById() to organization.ts (AC: #2, #13)
  - [x] 2.1 getOrgTemplates(companyId): returns builtin templates + company-specific templates
  - [x] 2.2 getOrgTemplateById(companyId, templateId): returns single template with full data
- [x] Task 3: Create org-templates admin route file (AC: #1, #2, #10, #11, #12, #13)
  - [x] 3.1 GET /org-templates -- list all available templates
  - [x] 3.2 GET /org-templates/:id -- single template detail
  - [x] 3.3 POST /org-templates/:id/apply -- apply template to company
  - [x] 3.4 Apply authMiddleware + adminOnly + tenantMiddleware
- [x] Task 4: Register route in index.ts (AC: #10)
  - [x] 4.1 Import and register orgTemplatesRoute in app
- [x] Task 5: Verify existing seed data works with apply API (AC: #3)
  - [x] 5.1 Ensure seed.service.ts BUILTIN_TEMPLATES templateData matches TemplateData interface
  - [x] 5.2 Test all 3 templates apply correctly

## Dev Notes

### Existing Code (MUST build on, NOT rewrite)

**Organization Service** (`packages/server/src/services/organization.ts`):
- Already has `createDepartment()` and `createAgent()` -- DO NOT duplicate logic, reuse these functions directly
- TenantActor interface, actorType() helper already defined
- Import helpers: withTenant, scopedWhere, scopedInsert from tenant-helpers.ts
- Error return pattern: `{ data: ... }` or `{ error: { status, message, code } }`

**Seed Service** (`packages/server/src/services/seed.service.ts`):
- Defines `TemplateData`, `TemplateDepartment`, `TemplateAgent` interfaces
- 3 builtin templates: INVESTMENT_TEMPLATE (1 dept, 5 agents), MARKETING_TEMPLATE (1 dept, 4 agents), ALL_IN_ONE_TEMPLATE (4 depts, 12 agents)
- Templates stored in `org_templates.templateData` as JSONB -- uses these interfaces

**Audit Log** (`packages/server/src/services/audit-log.ts`):
- `ORG_TEMPLATE_APPLY` action already exists -- use it
- createAuditLog supports metadata field for extra context

**DB Schema** (`packages/server/src/db/schema.ts`):
- `orgTemplates` table: id, companyId (nullable=builtin), name, description, templateData (JSONB), isBuiltin, isActive, createdBy, createdAt, updatedAt
- `agents` table: userId is NOT NULL -- must provide userId when creating agents from template
- `departments` table: companyId, name, description, isActive

### Architecture Compliance

From Architecture Decision #5 (Dynamic Organization Management):
- Template apply creates departments + agents in bulk
- Must complete in < 2 minutes (NFR35)
- Merge strategy: skip existing departments/agents by name

From PRD FR10:
- POST /api/org-templates/:id/apply -> 부서 + 에이전트 일괄 생성
- 3종 템플릿 각각 정상 적용
- 중복 적용 시 기존 조직과 병합 옵션 제공

### Implementation Strategy

**applyTemplate() approach:**
1. Load template from DB by ID (check existence + isActive)
2. For each department in templateData.departments:
   - Query existing departments by name + companyId
   - If exists: use existing department ID, increment departmentsSkipped
   - If not: INSERT new department (scopedInsert), increment departmentsCreated
3. For each agent in each department:
   - Query existing agents by name + companyId
   - If exists: skip, increment agentsSkipped
   - If not: INSERT new agent with departmentId, userId from tenant, increment agentsCreated
4. Create audit log with ORG_TEMPLATE_APPLY + summary
5. Return summary

**Why reuse createDepartment/createAgent?**
- These already handle scopedInsert, audit logging individually
- BUT for bulk operations, calling them individually means N+1 audit logs and N+1 name checks
- Better approach: do batch name check upfront, then direct inserts for performance
- Create a single audit log for the entire template application

**Template access control:**
- Builtin templates (companyId=null): visible to ALL companies
- Company templates (companyId=X): visible only to that company
- Query: WHERE companyId IS NULL OR companyId = :companyId

### Anti-Patterns to Avoid

- Do NOT call createDepartment/createAgent in a loop (too many individual audit logs) -- use direct batch inserts instead
- Do NOT skip name uniqueness checks during template apply
- Do NOT forget to set userId on created agents (agents.userId is NOT NULL)
- Do NOT create a separate service file -- add to existing organization.ts
- Do NOT skip tenant isolation -- every query must include companyId scope
- Do NOT accept companyId from request body -- always from tenant context
- Do NOT hard-code template IDs -- always look up by ID from the request param
- Do NOT modify seed.service.ts -- template data is already correctly structured
- Do NOT forget to handle the case where template has agents for a department that was skipped (still assign to existing dept)

### Testing Approach

Test file: `packages/server/src/__tests__/unit/org-template-apply.test.ts`

Key test scenarios:
1. getOrgTemplates returns builtin templates for any company
2. getOrgTemplates returns company-specific templates filtered by companyId
3. getOrgTemplateById returns single template with full data
4. getOrgTemplateById returns null for non-existent template
5. applyTemplate creates all departments and agents from investment template (1 dept, 5 agents)
6. applyTemplate creates all departments and agents from marketing template (1 dept, 4 agents)
7. applyTemplate creates all departments and agents from all-in-one template (4 depts, 12 agents)
8. applyTemplate skips existing department by name, still creates agents under it
9. applyTemplate skips existing agent by name (no duplicate)
10. applyTemplate with full merge: some depts exist, some agents exist
11. applyTemplate returns correct summary counts
12. applyTemplate on non-existent template returns 404
13. applyTemplate on inactive template returns 409
14. applyTemplate creates audit log with ORG_TEMPLATE_APPLY action + summary
15. Created agents have correct userId from tenant context
16. Created departments/agents have correct companyId
17. Tenant isolation: company A cannot access company B's custom templates
18. All agents have correct tier, modelName, soul, allowedTools from template

### Project Structure Notes

- Service file: `packages/server/src/services/organization.ts` (MODIFY -- add template apply functions)
- Route file: `packages/server/src/routes/admin/org-templates.ts` (NEW -- org template admin routes)
- Main app: `packages/server/src/index.ts` (MODIFY -- register orgTemplatesRoute)
- Test file: `packages/server/src/__tests__/unit/org-template-apply.test.ts` (NEW)
- Schema imports: orgTemplates from db/schema
- Seed service: `packages/server/src/services/seed.service.ts` (READ ONLY -- import TemplateData interface)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S4] -- Story definition: 조직 템플릿 적용 API
- [Source: _bmad-output/planning-artifacts/prd.md#FR10] -- Template apply requirement
- [Source: _bmad-output/planning-artifacts/prd.md#NFR35] -- Performance < 2 min
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-5] -- Dynamic Organization Management
- [Source: packages/server/src/services/organization.ts] -- Existing dept/agent service (build on this)
- [Source: packages/server/src/services/seed.service.ts] -- Template data interfaces + BUILTIN_TEMPLATES
- [Source: packages/server/src/services/audit-log.ts] -- ORG_TEMPLATE_APPLY already defined
- [Source: packages/server/src/db/schema.ts#orgTemplates] -- org_templates table definition
- [Source: _bmad-output/implementation-artifacts/2-3-cascade-analysis-engine.md] -- Previous story patterns

### Previous Story Intelligence (Story 2-3)

Key patterns from Story 2-3 (Cascade Analysis Engine):
- Service functions return `{ data: ... }` or `{ error: { status, message, code } }` -- follow same pattern
- TenantActor interface: `{ companyId, userId, isAdminUser? }` -- reuse
- actorType() helper for audit log actor type -- reuse
- Audit log with metadata for complex operations -- follow same pattern for template apply summary
- Route file pattern: separate route file with authMiddleware + adminOnly + tenantMiddleware
- throwIfError() helper in route for error handling
- Test pattern: mock db operations, test service functions directly

### Git Intelligence

Recent commit patterns:
- `feat: Story 2-3 Cascade analysis engine -- impact analysis + 3 deletion modes, 111 tests`
- `feat: Story 2-2 Agent CRUD API -- system agent protection, soft deactivation, 90 tests`
- All stories add to organization.ts service, create new route/test files
- Test counts: 90-111 tests per story is the established baseline

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Added getOrgTemplates() to organization.ts: returns builtin (companyId=null) + company-specific templates using OR query
- Added getOrgTemplateById() to organization.ts: returns single template filtered by company access
- Added applyTemplate() to organization.ts: bulk-creates departments + agents with merge strategy (skip existing by name)
- TemplateApplySummary interface: departmentsCreated/Skipped, agentsCreated/Skipped, details per department
- Created org-templates admin route: GET /org-templates, GET /org-templates/:id, POST /org-templates/:id/apply
- Registered orgTemplatesRoute in index.ts under /api/admin
- Audit log uses existing ORG_TEMPLATE_APPLY action with summary metadata
- Merge strategy: existing departments reused (agents still created under them), existing agents skipped by name
- 55 unit tests passing, no regressions

### File List

- packages/server/src/services/organization.ts (MODIFIED -- added getOrgTemplates, getOrgTemplateById, applyTemplate, TemplateApplySummary)
- packages/server/src/routes/admin/org-templates.ts (NEW -- org template admin routes)
- packages/server/src/index.ts (MODIFIED -- import + register orgTemplatesRoute)
- packages/server/src/__tests__/unit/org-template-apply.test.ts (NEW -- 55 tests)
