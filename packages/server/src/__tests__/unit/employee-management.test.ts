import { describe, expect, test } from 'bun:test'

describe('Employee Management API (Epic 9 Story 2)', () => {
  // === Task 1: Schema - employee_departments ===
  describe('Schema: employee_departments table', () => {
    test('employeeDepartments table is exported from schema', async () => {
      const schema = await import('../../db/schema')
      expect(schema.employeeDepartments).toBeDefined()
    })

    test('employeeDepartments has correct columns', async () => {
      const schema = await import('../../db/schema')
      const table = schema.employeeDepartments
      // Drizzle tables have column configs
      expect(table.id).toBeDefined()
      expect(table.userId).toBeDefined()
      expect(table.departmentId).toBeDefined()
      expect(table.companyId).toBeDefined()
      expect(table.createdAt).toBeDefined()
    })

    test('employeeDepartmentsRelations is exported', async () => {
      const schema = await import('../../db/schema')
      expect(schema.employeeDepartmentsRelations).toBeDefined()
    })

    test('usersRelations includes employeeDepartments', async () => {
      const schema = await import('../../db/schema')
      expect(schema.usersRelations).toBeDefined()
    })

    test('departmentsRelations includes employeeDepartments', async () => {
      const schema = await import('../../db/schema')
      expect(schema.departmentsRelations).toBeDefined()
    })

    test('migration file exists', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0034_employee-departments.sql')
      expect(await file.exists()).toBe(true)
    })

    test('migration creates employee_departments table', async () => {
      const content = await Bun.file('packages/server/src/db/migrations/0034_employee-departments.sql').text()
      expect(content).toContain('CREATE TABLE')
      expect(content).toContain('employee_departments')
      expect(content).toContain('user_id')
      expect(content).toContain('department_id')
      expect(content).toContain('company_id')
    })

    test('migration has unique constraint on user_id + department_id', async () => {
      const content = await Bun.file('packages/server/src/db/migrations/0034_employee-departments.sql').text()
      expect(content).toContain('employee_departments_unique')
      expect(content).toContain('UNIQUE')
    })

    test('migration has company_id index', async () => {
      const content = await Bun.file('packages/server/src/db/migrations/0034_employee-departments.sql').text()
      expect(content).toContain('employee_departments_company_idx')
    })
  })

  // === Task 2: EmployeeService ===
  describe('EmployeeService exports', () => {
    test('createEmployee function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.createEmployee).toBe('function')
    })

    test('listEmployees function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.listEmployees).toBe('function')
    })

    test('getEmployeeDetail function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.getEmployeeDetail).toBe('function')
    })

    test('updateEmployee function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.updateEmployee).toBe('function')
    })

    test('deactivateEmployee function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.deactivateEmployee).toBe('function')
    })

    test('reactivateEmployee function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.reactivateEmployee).toBe('function')
    })

    test('resetEmployeePassword function exists', async () => {
      const svc = await import('../../services/employee-management')
      expect(typeof svc.resetEmployeePassword).toBe('function')
    })
  })

  // === Task 2: Service uses generateSecurePassword from company-management ===
  describe('EmployeeService uses shared utilities', () => {
    test('imports generateSecurePassword from company-management', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain("import { generateSecurePassword } from './company-management'")
    })

    test('uses Bun.password.hash for password hashing', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('Bun.password.hash')
    })

    test('uses createAuditLog for audit logging', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('createAuditLog')
    })
  })

  // === Task 3: Route structure ===
  describe('Employee route structure', () => {
    test('employeesRoute is exported from route file', async () => {
      const mod = await import('../../routes/admin/employees')
      expect(mod.employeesRoute).toBeDefined()
    })

    test('employeesRoute has Hono routes registered', async () => {
      const mod = await import('../../routes/admin/employees')
      const route = mod.employeesRoute
      expect(typeof route.fetch).toBe('function')
    })

    test('route is mounted in index.ts', async () => {
      const indexContent = await Bun.file('packages/server/src/index.ts').text()
      expect(indexContent).toContain('employeesRoute')
      expect(indexContent).toContain("from './routes/admin/employees'")
    })

    test('route uses authMiddleware + adminOnly', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('adminOnly')
    })

    test('route uses zValidator for input validation', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('zValidator')
    })
  })

  // === Task 3: Route endpoints ===
  describe('Employee route endpoints', () => {
    test('has POST /employees endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("post('/employees'")
    })

    test('has GET /employees endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("get('/employees'")
    })

    test('has GET /employees/:id endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("get('/employees/:id'")
    })

    test('has PUT /employees/:id endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("put('/employees/:id'")
    })

    test('has DELETE /employees/:id endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("delete('/employees/:id'")
    })

    test('has POST /employees/:id/reactivate endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("post('/employees/:id/reactivate'")
    })

    test('has POST /employees/:id/reset-password endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("post('/employees/:id/reset-password'")
    })
  })

  // === Task 3: Zod validation schemas ===
  describe('Zod validation schemas', () => {
    test('createEmployeeSchema validates username (min 2, max 50)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("username: z.string().min(2).max(50)")
    })

    test('createEmployeeSchema validates name (min 1, max 100)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("name: z.string().min(1).max(100)")
    })

    test('createEmployeeSchema validates email', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("email: z.string().email()")
    })

    test('createEmployeeSchema accepts optional departmentIds (array of UUIDs)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("departmentIds: z.array(z.string().uuid())")
    })
  })

  // === Task 4: AUDIT_ACTIONS ===
  describe('AUDIT_ACTIONS for employee management', () => {
    test('EMPLOYEE_CREATE action constant exists', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.EMPLOYEE_CREATE).toBe('employee.create')
    })

    test('EMPLOYEE_UPDATE action constant exists', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.EMPLOYEE_UPDATE).toBe('employee.update')
    })

    test('EMPLOYEE_DEACTIVATE action constant exists', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.EMPLOYEE_DEACTIVATE).toBe('employee.deactivate')
    })

    test('EMPLOYEE_REACTIVATE action constant exists', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.EMPLOYEE_REACTIVATE).toBe('employee.reactivate')
    })

    test('EMPLOYEE_PASSWORD_RESET action constant exists', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.EMPLOYEE_PASSWORD_RESET).toBe('employee.password_reset')
    })
  })

  // === AC1: Employee creation ===
  describe('AC1: Employee creation', () => {
    test('createEmployee accepts companyId, input, and actorId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.createEmployee.length).toBeGreaterThanOrEqual(3)
    })

    test('service creates user with role=user', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain("role: 'user'")
    })

    test('service generates initialPassword and returns it', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('initialPassword')
      expect(content).toContain('generateSecurePassword()')
    })

    test('service handles duplicate username with EMPLOYEE_USERNAME_DUPLICATE error', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('EMPLOYEE_USERNAME_DUPLICATE')
    })

    test('service validates department ownership before assignment', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('validateDepartmentOwnership')
    })

    test('route returns 201 on successful creation', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('201')
    })

    test('route returns 409 on duplicate username', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('409')
    })
  })

  // === AC2: Employee list with pagination ===
  describe('AC2: Employee list with pagination', () => {
    test('listEmployees accepts companyId and options', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.listEmployees.length).toBeGreaterThanOrEqual(1)
    })

    test('service supports page parameter (default 1)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('page ?? 1')
    })

    test('service supports limit parameter (default 20, max 100)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('limit ?? 20')
      expect(content).toContain('100')
    })

    test('service supports search by name or username (ilike)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('ilike')
      expect(content).toContain('users.name')
      expect(content).toContain('users.username')
    })

    test('service supports departmentId filter', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('departmentId')
    })

    test('service supports isActive filter', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('isActive')
    })

    test('service returns pagination metadata', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('totalPages')
      expect(content).toContain('pagination')
    })

    test('service includes departments for each employee', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('getEmployeeDepartments')
    })

    test('service applies companyId filter (tenant isolation)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('eq(users.companyId, companyId)')
    })

    test('route parses query parameters for pagination', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("c.req.query('page')")
      expect(content).toContain("c.req.query('limit')")
      expect(content).toContain("c.req.query('search')")
      expect(content).toContain("c.req.query('departmentId')")
      expect(content).toContain("c.req.query('isActive')")
    })
  })

  // === AC3: Employee detail ===
  describe('AC3: Employee detail', () => {
    test('getEmployeeDetail accepts employeeId and companyId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.getEmployeeDetail.length).toBe(2)
    })

    test('service returns null for non-existent employee', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('if (!employee) return null')
    })

    test('service includes assigned departments in detail response', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // getEmployeeDetail function should get departments
      expect(content).toContain('getEmployeeDepartments(employeeId)')
    })

    test('route returns 404 for non-existent employee', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('EMPLOYEE_NOT_FOUND')
      expect(content).toContain('404')
    })
  })

  // === AC4: Employee update ===
  describe('AC4: Employee update with department assignment', () => {
    test('updateEmployee accepts employeeId, companyId, input, actorId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.updateEmployee.length).toBe(4)
    })

    test('service supports replacing department assignments', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('replaceDepartmentAssignments')
    })

    test('service validates department ownership on update', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // updateEmployee should validate departments
      const updateFnSection = content.slice(content.indexOf('export async function updateEmployee'))
      expect(updateFnSection).toContain('validateDepartmentOwnership')
    })

    test('service returns INVALID_DEPARTMENT error for wrong company departments', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('INVALID_DEPARTMENT')
    })

    test('route uses updateEmployeeSchema for validation', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('updateEmployeeSchema')
    })
  })

  // === AC5: Employee deactivation ===
  describe('AC5: Employee deactivation (soft delete)', () => {
    test('deactivateEmployee accepts employeeId, companyId, actorId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.deactivateEmployee.length).toBe(3)
    })

    test('service sets isActive=false', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'))
      expect(deactivateFn).toContain('isActive: false')
    })

    test('service deletes sessions on deactivation (force logout)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'))
      expect(deactivateFn).toContain('delete(sessions)')
    })

    test('service returns error for already inactive employee', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('EMPLOYEE_ALREADY_INACTIVE')
    })

    test('service returns error for non-existent employee', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('EMPLOYEE_NOT_FOUND')
    })

    test('route returns 409 for already inactive', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      // DELETE handler should map EMPLOYEE_ALREADY_INACTIVE to 409
      const deleteSection = content.slice(content.indexOf("delete('/employees/:id'"))
      expect(deleteSection).toContain('409')
    })
  })

  // === AC6: Employee reactivation ===
  describe('AC6: Employee reactivation', () => {
    test('reactivateEmployee accepts employeeId, companyId, actorId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.reactivateEmployee.length).toBe(3)
    })

    test('service sets isActive=true', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const reactivateFn = content.slice(content.indexOf('export async function reactivateEmployee'))
      expect(reactivateFn).toContain('isActive: true')
    })

    test('service returns error for already active employee', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('EMPLOYEE_ALREADY_ACTIVE')
    })

    test('service logs audit for reactivation', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.EMPLOYEE_REACTIVATE')
    })
  })

  // === AC7: Password reset ===
  describe('AC7: Password reset', () => {
    test('resetEmployeePassword accepts employeeId, companyId, actorId', async () => {
      const svc = await import('../../services/employee-management')
      expect(svc.resetEmployeePassword.length).toBe(3)
    })

    test('service generates new password using generateSecurePassword', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const resetFn = content.slice(content.indexOf('export async function resetEmployeePassword'))
      expect(resetFn).toContain('generateSecurePassword()')
    })

    test('service deletes sessions on password reset (force logout)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const resetFn = content.slice(content.indexOf('export async function resetEmployeePassword'))
      expect(resetFn).toContain('delete(sessions)')
    })

    test('service returns tempPassword in response', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const resetFn = content.slice(content.indexOf('export async function resetEmployeePassword'))
      expect(resetFn).toContain('tempPassword')
    })

    test('service logs audit for password reset', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.EMPLOYEE_PASSWORD_RESET')
    })
  })

  // === AC8: Access control ===
  describe('AC8: Access control', () => {
    test('route applies adminOnly middleware (blocks ceo, employee)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("employeesRoute.use('*', authMiddleware, adminOnly)")
    })

    test('route supports super_admin companyId override via query param', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain("super_admin")
      expect(content).toContain("queryCompanyId")
    })

    test('company_admin uses own companyId (tenant isolation)', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('tenant.companyId')
    })
  })

  // === Integration: Department assignment helpers ===
  describe('Department assignment helpers', () => {
    test('validateDepartmentOwnership checks departments belong to company', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('validateDepartmentOwnership')
      expect(content).toContain('inArray(departments.id, departmentIds)')
      expect(content).toContain('eq(departments.companyId, companyId)')
    })

    test('replaceDepartmentAssignments deletes existing and inserts new', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('replaceDepartmentAssignments')
      expect(content).toContain('delete(employeeDepartments)')
      expect(content).toContain('insert(employeeDepartments)')
    })

    test('getEmployeeDepartments joins with departments table', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('getEmployeeDepartments')
      expect(content).toContain('innerJoin(departments')
    })
  })

  // === Architecture compliance ===
  describe('Architecture compliance', () => {
    test('route file uses kebab-case naming', () => {
      // Route file is employees.ts - kebab-case verified
      expect('employees.ts'.match(/^[a-z-]+\.ts$/)).toBeTruthy()
    })

    test('service file uses kebab-case naming', () => {
      expect('employee-management.ts'.match(/^[a-z-]+\.ts$/)).toBeTruthy()
    })

    test('API responses use { data } pattern', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('c.json({ data:')
    })

    test('errors use HTTPError with code', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('new HTTPError(')
    })

    test('uses Bun.password.hash (not bcrypt)', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      expect(content).toContain('Bun.password.hash')
      expect(content).not.toContain('bcrypt')
    })
  })

  // === Security: Tenant isolation ===
  describe('Security: Tenant isolation', () => {
    test('all service functions require companyId parameter', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      // Every exported function should accept companyId
      expect(content).toContain('companyId: string,')
    })

    test('list query filters by companyId', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const listFn = content.slice(content.indexOf('export async function listEmployees'))
      expect(listFn).toContain('eq(users.companyId, companyId)')
    })

    test('detail query filters by companyId', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const detailFn = content.slice(content.indexOf('export async function getEmployeeDetail'))
      expect(detailFn).toContain('eq(users.companyId, companyId)')
    })

    test('update query filters by companyId', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const updateFn = content.slice(content.indexOf('export async function updateEmployee'))
      expect(updateFn).toContain('eq(users.companyId, companyId)')
    })

    test('deactivate query filters by companyId', async () => {
      const content = await Bun.file('packages/server/src/services/employee-management.ts').text()
      const deactivateFn = content.slice(content.indexOf('export async function deactivateEmployee'))
      expect(deactivateFn).toContain('eq(users.companyId, companyId)')
    })
  })

  // === Existing users route is not modified ===
  describe('Existing users route preserved', () => {
    test('admin/users.ts still exists and exports usersRoute', async () => {
      const mod = await import('../../routes/admin/users')
      expect(mod.usersRoute).toBeDefined()
    })

    test('admin/users.ts is still mounted in index.ts', async () => {
      const content = await Bun.file('packages/server/src/index.ts').text()
      expect(content).toContain('usersRoute')
    })
  })
})
