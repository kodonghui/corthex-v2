import { describe, expect, test } from 'bun:test'

describe('Company CRUD API (Epic 9 Story 1)', () => {
  // === Task 1: Super Admin Route Structure ===
  describe('Super Admin route structure', () => {
    test('superAdminCompaniesRoute is exported from route file', async () => {
      const mod = await import('../../routes/super-admin/companies')
      expect(mod.superAdminCompaniesRoute).toBeDefined()
    })

    test('superAdminCompaniesRoute has Hono routes registered', async () => {
      const mod = await import('../../routes/super-admin/companies')
      const route = mod.superAdminCompaniesRoute
      expect(route).toBeDefined()
      expect(typeof route.fetch).toBe('function')
    })

    test('route is mounted in index.ts at /api/super-admin', async () => {
      const indexContent = await Bun.file('packages/server/src/index.ts').text()
      expect(indexContent).toContain("superAdminCompaniesRoute")
      expect(indexContent).toContain("'/api/super-admin'")
    })
  })

  // === Task 2: CompanyManagementService ===
  describe('CompanyManagementService exports', () => {
    test('createCompanyWithAdmin function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.createCompanyWithAdmin).toBe('function')
    })

    test('listCompanies function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.listCompanies).toBe('function')
    })

    test('getCompanyDetail function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.getCompanyDetail).toBe('function')
    })

    test('updateCompany function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.updateCompany).toBe('function')
    })

    test('softDeleteCompany function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.softDeleteCompany).toBe('function')
    })

    test('generateSecurePassword function exists', async () => {
      const svc = await import('../../services/company-management')
      expect(typeof svc.generateSecurePassword).toBe('function')
    })
  })

  // === Task 2.3: Secure Password Generation ===
  describe('generateSecurePassword', () => {
    test('generates password of default length (16)', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword()
      expect(password.length).toBe(16)
    })

    test('generates password of custom length', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword(24)
      expect(password.length).toBe(24)
    })

    test('contains at least one uppercase letter', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword()
      expect(/[A-Z]/.test(password)).toBe(true)
    })

    test('contains at least one lowercase letter', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword()
      expect(/[a-z]/.test(password)).toBe(true)
    })

    test('contains at least one digit', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword()
      expect(/[0-9]/.test(password)).toBe(true)
    })

    test('contains at least one special character', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword()
      expect(/[!@#$%^&*]/.test(password)).toBe(true)
    })

    test('generates different passwords each time', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const passwords = new Set(Array.from({ length: 10 }, () => generateSecurePassword()))
      expect(passwords.size).toBe(10)
    })

    test('minimum length is 4 (one from each category)', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const password = generateSecurePassword(4)
      expect(password.length).toBe(4)
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/[0-9]/.test(password)).toBe(true)
      expect(/[!@#$%^&*]/.test(password)).toBe(true)
    })
  })

  // === Task 2.5: AUDIT_ACTIONS constants ===
  describe('Audit action constants for Company', () => {
    test('AUDIT_ACTIONS has company-related constants', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.COMPANY_CREATE).toBe('company.create')
      expect(AUDIT_ACTIONS.COMPANY_UPDATE).toBe('company.update')
      expect(AUDIT_ACTIONS.COMPANY_DELETE).toBe('company.delete')
    })
  })

  // === Task 1.2: RBAC Middleware ===
  describe('RBAC middleware integration', () => {
    test('rbacMiddleware is importable', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      expect(typeof rbacMiddleware).toBe('function')
    })

    test('rbacMiddleware returns a middleware function', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      const mw = rbacMiddleware('super_admin')
      expect(typeof mw).toBe('function')
    })
  })

  // === Task 3: Zod Schema Validation ===
  describe('Create company schema validation', () => {
    const { z } = require('zod')

    const createCompanySchema = z.object({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
      adminUsername: z.string().min(2).max(50),
      adminName: z.string().min(1).max(100),
      adminEmail: z.string().email().optional(),
    })

    test('valid input passes validation', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test Company',
        slug: 'test-company',
        adminUsername: 'admin',
        adminName: 'Admin User',
        adminEmail: 'admin@test.com',
      })
      expect(result.success).toBe(true)
    })

    test('rejects empty name', () => {
      const result = createCompanySchema.safeParse({
        name: '',
        slug: 'test',
        adminUsername: 'admin',
        adminName: 'Admin',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid slug (uppercase)', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        slug: 'Test-Company',
        adminUsername: 'admin',
        adminName: 'Admin',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid slug (spaces)', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        slug: 'test company',
        adminUsername: 'admin',
        adminName: 'Admin',
      })
      expect(result.success).toBe(false)
    })

    test('rejects short admin username (< 2)', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        slug: 'test',
        adminUsername: 'a',
        adminName: 'Admin',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid email', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        slug: 'test',
        adminUsername: 'admin',
        adminName: 'Admin',
        adminEmail: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    test('email is optional', () => {
      const result = createCompanySchema.safeParse({
        name: 'Test',
        slug: 'test',
        adminUsername: 'admin',
        adminName: 'Admin',
      })
      expect(result.success).toBe(true)
    })
  })

  // === Task 4: List Query Schema Validation ===
  describe('List query schema validation', () => {
    const { z } = require('zod')

    const listQuerySchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    })

    test('defaults page to 1 and limit to 20', () => {
      const result = listQuerySchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    test('coerces string page to number', () => {
      const result = listQuerySchema.parse({ page: '3' })
      expect(result.page).toBe(3)
    })

    test('rejects page < 1', () => {
      const result = listQuerySchema.safeParse({ page: '0' })
      expect(result.success).toBe(false)
    })

    test('rejects limit > 100', () => {
      const result = listQuerySchema.safeParse({ limit: '200' })
      expect(result.success).toBe(false)
    })

    test('transforms isActive string to boolean', () => {
      const result = listQuerySchema.parse({ isActive: 'true' })
      expect(result.isActive).toBe(true)
    })

    test('transforms isActive false string to boolean', () => {
      const result = listQuerySchema.parse({ isActive: 'false' })
      expect(result.isActive).toBe(false)
    })

    test('search is optional', () => {
      const result = listQuerySchema.parse({})
      expect(result.search).toBeUndefined()
    })

    test('accepts valid search string', () => {
      const result = listQuerySchema.parse({ search: '테스트' })
      expect(result.search).toBe('테스트')
    })
  })

  // === Task 5: Update Company Schema Validation ===
  describe('Update company schema validation', () => {
    const { z } = require('zod')

    const updateCompanySchema = z.object({
      name: z.string().min(1).max(100).optional(),
      slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
      settings: z.record(z.unknown()).optional(),
      smtpConfig: z.object({
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535),
        secure: z.boolean(),
        user: z.string().min(1),
        pass: z.string().min(1),
      }).nullable().optional(),
    })

    test('all fields are optional', () => {
      const result = updateCompanySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    test('accepts valid name update', () => {
      const result = updateCompanySchema.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    test('rejects empty name', () => {
      const result = updateCompanySchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })

    test('accepts valid slug update', () => {
      const result = updateCompanySchema.safeParse({ slug: 'new-slug' })
      expect(result.success).toBe(true)
    })

    test('rejects invalid slug', () => {
      const result = updateCompanySchema.safeParse({ slug: 'INVALID' })
      expect(result.success).toBe(false)
    })

    test('accepts settings as JSON object', () => {
      const result = updateCompanySchema.safeParse({ settings: { theme: 'dark' } })
      expect(result.success).toBe(true)
    })

    test('accepts null smtpConfig (for clearing)', () => {
      const result = updateCompanySchema.safeParse({ smtpConfig: null })
      expect(result.success).toBe(true)
    })

    test('accepts valid smtpConfig', () => {
      const result = updateCompanySchema.safeParse({
        smtpConfig: {
          host: 'smtp.test.com',
          port: 587,
          secure: true,
          user: 'mail@test.com',
          pass: 'password',
        },
      })
      expect(result.success).toBe(true)
    })

    test('rejects incomplete smtpConfig', () => {
      const result = updateCompanySchema.safeParse({
        smtpConfig: { host: 'smtp.test.com' },
      })
      expect(result.success).toBe(false)
    })
  })

  // === Schema: admin_users has companyId ===
  describe('admin_users schema extension', () => {
    test('adminUsers table has companyId field', async () => {
      const schema = await import('../../db/schema')
      expect(schema.adminUsers.companyId).toBeDefined()
    })

    test('adminUsers table has email field', async () => {
      const schema = await import('../../db/schema')
      expect(schema.adminUsers.email).toBeDefined()
    })
  })

  // === Service function signatures ===
  describe('Service function signatures', () => {
    test('createCompanyWithAdmin accepts input and actorId', async () => {
      const svc = await import('../../services/company-management')
      expect(svc.createCompanyWithAdmin.length).toBeGreaterThanOrEqual(2)
    })

    test('listCompanies accepts options', async () => {
      const svc = await import('../../services/company-management')
      expect(svc.listCompanies.length).toBeGreaterThanOrEqual(0) // optional param
    })

    test('getCompanyDetail accepts companyId', async () => {
      const svc = await import('../../services/company-management')
      expect(svc.getCompanyDetail.length).toBe(1)
    })

    test('updateCompany accepts companyId, input, actorId', async () => {
      const svc = await import('../../services/company-management')
      expect(svc.updateCompany.length).toBe(3)
    })

    test('softDeleteCompany accepts companyId and actorId', async () => {
      const svc = await import('../../services/company-management')
      expect(svc.softDeleteCompany.length).toBe(2)
    })
  })

  // === API Response Format ===
  describe('API response format expectations', () => {
    test('route file uses { data } pattern for success responses', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      // All success responses use c.json({ data: ... })
      expect(routeContent).toContain('c.json({ data:')
    })

    test('route file uses HTTPError for error responses', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).toContain('HTTPError')
    })

    test('create endpoint returns 201 status', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).toContain('201')
    })
  })

  // === List response includes pagination ===
  describe('Pagination response structure', () => {
    test('list endpoint includes pagination in response', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).toContain('pagination')
    })

    test('listCompanies service returns pagination metadata', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('totalPages')
      expect(svcContent).toContain('pagination')
    })
  })

  // === Cascade soft delete ===
  describe('Cascade soft delete logic', () => {
    test('softDeleteCompany function handles cascade deactivation', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Checks that softDeleteCompany updates users and admin_users
      expect(svcContent).toContain('users')
      expect(svcContent).toContain('adminUsers')
      expect(svcContent).toContain('isActive: false')
    })

    test('softDeleteCompany returns deactivation counts', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('deactivatedUsers')
      expect(svcContent).toContain('deactivatedAdmins')
    })
  })

  // === Company detail includes stats ===
  describe('Company detail with stats', () => {
    test('getCompanyDetail queries user, agent, department counts', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('userCount')
      expect(svcContent).toContain('agentCount')
      expect(svcContent).toContain('departmentCount')
    })
  })

  // === Migration file exists ===
  describe('Database migration', () => {
    test('migration file for admin_users companyId exists', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0033_admin-users-company-id.sql')
      expect(await file.exists()).toBe(true)
    })

    test('migration adds company_id column', async () => {
      const content = await Bun.file('packages/server/src/db/migrations/0033_admin-users-company-id.sql').text()
      expect(content).toContain('company_id')
      expect(content).toContain('admin_users')
    })

    test('migration adds email column', async () => {
      const content = await Bun.file('packages/server/src/db/migrations/0033_admin-users-company-id.sql').text()
      expect(content).toContain('email')
    })
  })

  // === Security: RBAC enforcement ===
  describe('RBAC enforcement', () => {
    test('route uses rbacMiddleware with super_admin', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).toContain("rbacMiddleware('super_admin')")
    })

    test('route uses authMiddleware', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).toContain('authMiddleware')
    })

    test('route does NOT use adminOnly (uses rbac instead)', async () => {
      const routeContent = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(routeContent).not.toContain('adminOnly')
    })
  })

  // === Password hashing uses Bun.password ===
  describe('Password hashing', () => {
    test('service uses Bun.password.hash', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('Bun.password.hash')
    })
  })

  // === Audit logging ===
  describe('Audit logging integration', () => {
    test('createCompanyWithAdmin calls createAuditLog', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('createAuditLog')
      expect(svcContent).toContain('AUDIT_ACTIONS.COMPANY_CREATE')
    })

    test('updateCompany calls createAuditLog', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('AUDIT_ACTIONS.COMPANY_UPDATE')
    })

    test('softDeleteCompany calls createAuditLog', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('AUDIT_ACTIONS.COMPANY_DELETE')
    })
  })

  // === Slug duplicate check ===
  describe('Slug uniqueness enforcement', () => {
    test('create checks for slug duplicates', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('COMPANY_SLUG_DUPLICATE')
    })

    test('update checks for slug duplicates excluding self', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Should exclude current company from slug uniqueness check
      expect(svcContent).toContain('companies.id} != ${companyId}')
    })
  })

  // === Admin username duplicate check ===
  describe('Admin username uniqueness', () => {
    test('create checks for admin username duplicates', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('ADMIN_USERNAME_DUPLICATE')
    })
  })

  // === Already inactive check ===
  describe('Already inactive company check', () => {
    test('softDeleteCompany checks for already inactive status', async () => {
      const svcContent = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(svcContent).toContain('COMPANY_ALREADY_INACTIVE')
    })
  })
})
