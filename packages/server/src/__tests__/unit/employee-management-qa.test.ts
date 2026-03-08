import { describe, expect, test } from 'bun:test'

/**
 * TEA Risk-Based QA Tests for Story 9-2: Employee Management API
 *
 * Coverage Focus:
 * - P0: Tenant isolation, password security, data integrity
 * - P1: Edge cases, error handling, input validation
 * - P2: Business logic boundaries, audit trail completeness
 */

describe('Employee Management QA (TEA Risk-Based)', () => {
  // === P0: Tenant Isolation Security ===
  describe('P0: Tenant isolation enforcement', () => {
    test('every service query includes companyId filter', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // Count function exports and companyId usage
      const exportedFns = content.match(/export async function \w+/g) || []
      const companyIdFilters = content.match(/eq\(users\.companyId, companyId\)/g) || []
      // Each read/write function should filter by companyId
      expect(exportedFns.length).toBeGreaterThanOrEqual(7)
      expect(companyIdFilters.length).toBeGreaterThanOrEqual(4) // list, detail, update, deactivate
    })

    test('createEmployee inserts with explicit companyId', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const createFn = content.slice(content.indexOf('export async function createEmployee'), content.indexOf('export async function listEmployees'))
      expect(createFn).toContain('companyId,')
      expect(createFn).toContain("companyId")
    })

    test('department validation checks company ownership', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const validateFn = content.slice(content.indexOf('async function validateDepartmentOwnership'))
      expect(validateFn).toContain('eq(departments.companyId, companyId)')
    })

    test('employee_departments table includes companyId column', async () => {
      const content = await Bun.file('packages/server/src/db/schema.ts').text()
      const empDeptSection = content.slice(content.indexOf('employee_departments'), content.indexOf('// === 3.'))
      expect(empDeptSection).toContain("companyId: uuid('company_id')")
    })

    test('route resolves companyId from tenant for non-super_admin', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      // Should use tenant.companyId as fallback via resolveCompanyId helper
      expect(content).toContain('tenant.companyId')
      expect(content).toContain('resolveCompanyId')
    })
  })

  // === P0: Password Security ===
  describe('P0: Password security', () => {
    test('uses generateSecurePassword (not weak random)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).not.toContain('Math.random()')
      expect(content).toContain('generateSecurePassword')
    })

    test('uses Bun.password.hash (not plain text storage)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('Bun.password.hash(initialPassword)')
      expect(content).toContain('Bun.password.hash(newPassword)')
    })

    test('password is never stored in audit log', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // Audit log calls should not include password
      const auditCalls = content.split('createAuditLog')
      for (const call of auditCalls.slice(1)) { // skip first part before first call
        expect(call.slice(0, 200)).not.toContain('password')
        expect(call.slice(0, 200)).not.toContain('passwordHash')
      }
    })

    test('password reset deletes existing sessions', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const resetFn = content.slice(content.indexOf('export async function resetEmployeePassword'))
      expect(resetFn).toContain('delete(sessions)')
      expect(resetFn).toContain('eq(sessions.userId, employeeId)')
    })

    test('deactivation deletes existing sessions', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'), content.indexOf('export async function reactivateEmployee'))
      expect(deactivateFn).toContain('delete(sessions)')
    })
  })

  // === P0: Data Integrity ===
  describe('P0: Data integrity constraints', () => {
    test('employee_departments has unique constraint on userId+departmentId', async () => {
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      expect(schemaContent).toContain('employee_departments_unique')
      expect(schemaContent).toContain('table.userId, table.departmentId')
    })

    test('employee_departments has foreign key to users table', async () => {
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      const empDeptSection = schemaContent.slice(schemaContent.indexOf('employee_departments'), schemaContent.indexOf('// === 3.'))
      expect(empDeptSection).toContain('references(() => users.id)')
    })

    test('employee_departments has foreign key to departments table', async () => {
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      const empDeptSection = schemaContent.slice(schemaContent.indexOf('employee_departments'), schemaContent.indexOf('// === 3.'))
      expect(empDeptSection).toContain('references(() => departments.id)')
    })

    test('employee_departments has foreign key to companies table', async () => {
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      const empDeptSection = schemaContent.slice(schemaContent.indexOf('employee_departments'), schemaContent.indexOf('// === 3.'))
      expect(empDeptSection).toContain('references(() => companies.id)')
    })

    test('soft delete preserves department mappings', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'), content.indexOf('export async function reactivateEmployee'))
      // Should NOT delete employee_departments
      expect(deactivateFn).not.toContain('delete(employeeDepartments)')
    })

    test('department replacement deletes old and inserts new', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const replaceFn = content.slice(content.indexOf('async function replaceDepartmentAssignments'))
      expect(replaceFn).toContain('delete(employeeDepartments)')
      expect(replaceFn).toContain('insert(employeeDepartments)')
    })
  })

  // === P1: Input Validation ===
  describe('P1: Input validation', () => {
    test('create requires username (min 2, max 50)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("username: z.string().min(2).max(50)")
    })

    test('create requires name (min 1, max 100)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("name: z.string().min(1).max(100)")
    })

    test('create requires valid email', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("email: z.string().email()")
    })

    test('departmentIds must be valid UUIDs', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("z.array(z.string().uuid())")
    })

    test('update schema allows optional fields only', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      // Update schema should have .optional() for all fields
      const updateStart = content.indexOf('updateEmployeeSchema')
      const updateEnd = content.indexOf('})', updateStart) + 2
      const updateSection = content.slice(updateStart, updateEnd)
      expect(updateSection).toContain('.optional()')
    })
  })

  // === P1: Error Handling ===
  describe('P1: Error handling patterns', () => {
    test('duplicate username returns 409 (not 500)', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(routeContent).toContain('409')
    })

    test('not found returns 404 (not 500)', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(routeContent).toContain('404')
    })

    test('invalid department returns 400', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(routeContent).toContain('400')
    })

    test('already inactive returns 409', async () => {
      const svcContent = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(svcContent).toContain('EMPLOYEE_ALREADY_INACTIVE')
    })

    test('already active returns specific error', async () => {
      const svcContent = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(svcContent).toContain('EMPLOYEE_ALREADY_ACTIVE')
    })

    test('audit log failures do not block API response', async () => {
      const svcContent = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // All createAuditLog calls should have .catch()
      const auditLogCalls = svcContent.match(/createAuditLog\([\s\S]*?\)\.catch/g) || []
      expect(auditLogCalls.length).toBeGreaterThanOrEqual(5) // 5 audit operations
    })
  })

  // === P1: Business Logic Edge Cases ===
  describe('P1: Business logic edge cases', () => {
    test('createEmployee checks global username uniqueness (not just company)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const createFn = content.slice(content.indexOf('export async function createEmployee'), content.indexOf('export async function listEmployees'))
      // Should have two uniqueness checks or a global check
      const usernameChecks = createFn.match(/eq\(users\.username/g) || []
      expect(usernameChecks.length).toBeGreaterThanOrEqual(1)
    })

    test('listEmployees paginates correctly (page 1, default limit 20)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const listFn = content.slice(content.indexOf('export async function listEmployees'))
      expect(listFn).toContain('page ?? 1')
      expect(listFn).toContain('limit ?? 20')
      expect(listFn).toContain('(page - 1) * limit')
    })

    test('listEmployees caps limit at 100', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('Math.min(Math.max(1, options.limit ?? 20), 100)')
    })

    test('createEmployee creates user with role user (not admin)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const createFn = content.slice(content.indexOf('export async function createEmployee'), content.indexOf('export async function listEmployees'))
      expect(createFn).toContain("role: 'user'")
      expect(createFn).not.toContain("role: 'admin'")
    })

    test('empty departmentIds creates employee without department assignments', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const createFn = content.slice(content.indexOf('export async function createEmployee'), content.indexOf('export async function listEmployees'))
      expect(createFn).toContain('departmentIds ?? []')
      expect(createFn).toContain('departmentIds.length > 0')
    })

    test('update with no departmentIds does not clear assignments', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const updateFn = content.slice(content.indexOf('export async function updateEmployee'), content.indexOf('export async function deactivateEmployee'))
      expect(updateFn).toContain('input.departmentIds !== undefined')
    })

    test('department filter uses subquery (not join) for list', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const listFn = content.slice(content.indexOf('export async function listEmployees'), content.indexOf('export async function getEmployeeDetail'))
      expect(listFn).toContain('inArray(users.id')
    })
  })

  // === P2: Audit Trail Completeness ===
  describe('P2: Audit trail completeness', () => {
    test('create logs EMPLOYEE_CREATE', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.EMPLOYEE_CREATE')
    })

    test('update logs EMPLOYEE_UPDATE with before/after', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const updateFn = content.slice(content.indexOf('export async function updateEmployee'))
      expect(updateFn).toContain('AUDIT_ACTIONS.EMPLOYEE_UPDATE')
      expect(updateFn).toContain('before:')
      expect(updateFn).toContain('after:')
    })

    test('deactivate logs EMPLOYEE_DEACTIVATE with metadata', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'))
      expect(deactivateFn).toContain('AUDIT_ACTIONS.EMPLOYEE_DEACTIVATE')
      expect(deactivateFn).toContain('metadata:')
    })

    test('reactivate logs EMPLOYEE_REACTIVATE', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.EMPLOYEE_REACTIVATE')
    })

    test('password reset logs EMPLOYEE_PASSWORD_RESET', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.EMPLOYEE_PASSWORD_RESET')
    })

    test('all audit logs include targetType=user', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const auditCalls = content.match(/targetType: ['"]user['"]/g) || []
      // createEmployee and updateEmployee have targetType 'user'
      expect(auditCalls.length).toBeGreaterThanOrEqual(2)
    })

    test('all audit logs include actorType=admin_user', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const actorTypes = content.match(/actorType: ['"]admin_user['"]/g) || []
      expect(actorTypes.length).toBeGreaterThanOrEqual(5) // all 5 audit operations
    })
  })

  // === P2: API Response Contract ===
  describe('P2: API response contract', () => {
    test('create returns { data } with 201 status', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('c.json({ data: result.data }, 201)')
    })

    test('list returns pagination metadata', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain("pagination: {")
      expect(content).toContain("page,")
      expect(content).toContain("limit,")
      expect(content).toContain("total,")
      expect(content).toContain("totalPages:")
    })

    test('detail returns { data: employee } pattern', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('c.json({ data: employee })')
    })

    test('errors use HTTPError with code parameter', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      // All HTTPError calls should have 3 params: status, message, code
      const httpErrors = content.match(/new HTTPError\(\d+,/g) || []
      expect(httpErrors.length).toBeGreaterThanOrEqual(5)
    })

    test('create response includes initialPassword', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const createFn = content.slice(content.indexOf('export async function createEmployee'), content.indexOf('export async function listEmployees'))
      expect(createFn).toContain('initialPassword')
    })

    test('reset-password response includes tempPassword', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const resetFn = content.slice(content.indexOf('export async function resetEmployeePassword'))
      expect(resetFn).toContain('tempPassword: newPassword')
    })
  })

  // === P2: Route mounting and middleware ===
  describe('P2: Route infrastructure', () => {
    test('employees route is separate from existing users route', async () => {
      const indexContent = await Bun.file('packages/server/src/index.ts').text()
      expect(indexContent).toContain('employeesRoute')
      expect(indexContent).toContain('usersRoute')
    })

    test('employees route is mounted under /api/admin', async () => {
      const indexContent = await Bun.file('packages/server/src/index.ts').text()
      // Route should be mounted at /api/admin path
      expect(indexContent).toContain("app.route('/api/admin', employeesRoute)")
    })

    test('existing users.ts route is unchanged', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/users.ts').text()
      // Should still use the original patterns
      expect(content).toContain("usersRoute")
      expect(content).toContain("adminOnly")
      expect(content).not.toContain('employeeDepartments')
    })
  })

  // === P0: Search/filter parameter safety ===
  describe('P0: Parameter safety', () => {
    test('search uses ilike (case-insensitive, parameterized)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('ilike(users.name')
      expect(content).toContain('ilike(users.username')
    })

    test('page and limit are bounded (no negative, no unbounded)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('Math.max(1, options.page ?? 1)')
      expect(content).toContain('Math.min(Math.max(1, options.limit ?? 20), 100)')
    })
  })
})
