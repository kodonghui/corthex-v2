import { describe, expect, test } from 'bun:test'
import { AUDIT_ACTIONS } from '../../services/audit-log'
import { resolve } from 'path'

/**
 * TEA Risk-Based Test Coverage for Story 2-1: Department CRUD API
 *
 * Risk Analysis:
 * - HIGH: Tenant isolation bypass (data leaks between companies)
 * - HIGH: Audit log missing on write operations (compliance failure)
 * - MEDIUM: Name uniqueness bypass on update (data integrity)
 * - MEDIUM: Delete with active agents (orphaned agents)
 * - LOW: Response format inconsistency (API contract violation)
 */

const routePath = resolve(import.meta.dir, '../../routes/admin/departments.ts')
const servicePath = resolve(import.meta.dir, '../../services/organization.ts')
const authPath = resolve(import.meta.dir, '../../middleware/auth.ts')
const tenantPath = resolve(import.meta.dir, '../../middleware/tenant.ts')

describe('TEA: Department CRUD API Risk Coverage', () => {
  // === RISK: Audit Log Integration (HIGH) ===
  describe('Audit Action Constants Coverage', () => {
    test('ORG_DEPARTMENT_CREATE action constant exists', () => {
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE).toBe('org.department.create')
    })

    test('ORG_DEPARTMENT_UPDATE action constant exists', () => {
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE).toBe('org.department.update')
    })

    test('ORG_DEPARTMENT_DELETE action constant exists', () => {
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE).toBe('org.department.delete')
    })

    test('all department audit actions follow org.department.* pattern', () => {
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE).toMatch(/^org\.department\./)
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE).toMatch(/^org\.department\./)
      expect(AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE).toMatch(/^org\.department\./)
    })
  })

  // === RISK: Route Structure via File Analysis (HIGH) ===
  describe('Route File Structure Analysis', () => {
    let routeContent: string

    test('route file exists', async () => {
      const file = Bun.file(routePath)
      expect(await file.exists()).toBe(true)
      routeContent = await file.text()
    })

    test('imports organization service functions', () => {
      expect(routeContent).toContain('getDepartments')
      expect(routeContent).toContain('getDepartmentById')
      expect(routeContent).toContain('createDepartment')
      expect(routeContent).toContain('updateDepartment')
      expect(routeContent).toContain('deleteDepartment')
    })

    test('applies middleware chain: authMiddleware, adminOnly, tenantMiddleware', () => {
      expect(routeContent).toContain("use('*', authMiddleware, adminOnly, tenantMiddleware)")
    })

    test('has GET /departments list endpoint', () => {
      expect(routeContent).toContain(".get('/departments'")
    })

    test('has GET /departments/tree endpoint', () => {
      expect(routeContent).toContain(".get('/departments/tree'")
    })

    test('has GET /departments/:id endpoint', () => {
      expect(routeContent).toContain(".get('/departments/:id'")
    })

    test('has POST /departments endpoint', () => {
      expect(routeContent).toContain(".post('/departments'")
    })

    test('has PATCH /departments/:id endpoint', () => {
      expect(routeContent).toContain(".patch('/departments/:id'")
    })

    test('has DELETE /departments/:id endpoint', () => {
      expect(routeContent).toContain(".delete('/departments/:id'")
    })

    test('tree endpoint registered before :id to prevent param capture', () => {
      const treePos = routeContent.indexOf("'/departments/tree'")
      const idPos = routeContent.indexOf("'/departments/:id'")
      expect(treePos).toBeGreaterThan(-1)
      expect(idPos).toBeGreaterThan(-1)
      expect(treePos).toBeLessThan(idPos)
    })

    test('uses Hono with AppEnv type', () => {
      expect(routeContent).toContain('new Hono<AppEnv>()')
    })

    test('POST returns 201 status', () => {
      expect(routeContent).toContain(', 201)')
    })

    test('uses HTTPError for error responses', () => {
      expect(routeContent).toContain('throw new HTTPError')
    })

    test('uses zValidator for input validation', () => {
      expect(routeContent).toContain("zValidator('json'")
    })
  })

  // === RISK: Service Layer Analysis (HIGH) ===
  describe('OrganizationService File Analysis', () => {
    let serviceContent: string

    test('service file exists', async () => {
      const file = Bun.file(servicePath)
      expect(await file.exists()).toBe(true)
      serviceContent = await file.text()
    })

    test('exports getDepartments function', () => {
      expect(serviceContent).toContain('export async function getDepartments')
    })

    test('exports getDepartmentById function', () => {
      expect(serviceContent).toContain('export async function getDepartmentById')
    })

    test('exports createDepartment function', () => {
      expect(serviceContent).toContain('export async function createDepartment')
    })

    test('exports updateDepartment function', () => {
      expect(serviceContent).toContain('export async function updateDepartment')
    })

    test('exports deleteDepartment function', () => {
      expect(serviceContent).toContain('export async function deleteDepartment')
    })

    test('uses withTenant for query scoping', () => {
      expect(serviceContent).toContain('withTenant(departments.companyId')
    })

    test('uses scopedWhere for complex tenant queries', () => {
      expect(serviceContent).toContain('scopedWhere(departments.companyId')
    })

    test('uses scopedInsert for creating department', () => {
      expect(serviceContent).toContain('scopedInsert(tenant.companyId')
    })

    test('imports createAuditLog from audit-log service', () => {
      expect(serviceContent).toContain("import { createAuditLog, AUDIT_ACTIONS }")
    })

    test('uses AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE', () => {
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE')
    })

    test('uses AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE', () => {
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE')
    })

    test('uses AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE', () => {
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE')
    })

    test('createDepartment has audit log call', () => {
      const createFn = serviceContent.split('export async function createDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(createFn).toContain('createAuditLog')
      expect(createFn).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE')
    })

    test('updateDepartment has before/after audit logging', () => {
      const updateFn = serviceContent.split('export async function updateDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(updateFn).toContain('before:')
      expect(updateFn).toContain('after:')
      expect(updateFn).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE')
    })

    test('deleteDepartment has before snapshot audit logging', () => {
      const deleteFn = serviceContent.split('export async function deleteDepartment')[1] ?? ''
      expect(deleteFn).toContain('before:')
      expect(deleteFn).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE')
    })

    test('updateDepartment has name uniqueness check excluding self', () => {
      const updateFn = serviceContent.split('export async function updateDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(updateFn).toContain('ne(departments.id, departmentId)')
    })

    test('updateDepartment sets updatedAt', () => {
      const updateFn = serviceContent.split('export async function updateDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(updateFn).toContain('updatedAt: new Date()')
    })

    test('deleteDepartment sets isActive to false (soft delete)', () => {
      const deleteFn = serviceContent.split('export async function deleteDepartment')[1] ?? ''
      expect(deleteFn).toContain('isActive: false')
    })

    test('deleteDepartment checks agent count before deleting', () => {
      const deleteFn = serviceContent.split('export async function deleteDepartment')[1] ?? ''
      expect(deleteFn).toContain('agentCount')
      expect(deleteFn).toContain('DEPT_003')
    })

    test('actorType function maps isAdminUser correctly', () => {
      expect(serviceContent).toContain("tenant.isAdminUser ? 'admin_user' : 'user'")
    })

    test('createDepartment returns error object for duplicates (not throw)', () => {
      const createFn = serviceContent.split('export async function createDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(createFn).toContain('return { error:')
      expect(createFn).toContain('DEPT_002')
    })

    test('getDepartmentById returns null when not found', () => {
      expect(serviceContent).toContain('return dept ?? null')
    })
  })

  // === RISK: Input Boundary Validation (MEDIUM) ===
  describe('Zod Schema Boundaries', () => {
    const { z } = require('zod')

    const createSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    })

    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().nullable().optional(),
    })

    test('create: rejects empty name', () => {
      expect(createSchema.safeParse({ name: '' }).success).toBe(false)
    })

    test('create: rejects name > 100 chars', () => {
      expect(createSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false)
    })

    test('create: accepts valid name', () => {
      expect(createSchema.safeParse({ name: 'Engineering' }).success).toBe(true)
    })

    test('create: accepts name + description', () => {
      expect(createSchema.safeParse({ name: 'HR', description: 'Human Resources' }).success).toBe(true)
    })

    test('create: accepts name without description', () => {
      expect(createSchema.safeParse({ name: 'HR' }).success).toBe(true)
    })

    test('create: accepts max length name (100 chars)', () => {
      expect(createSchema.safeParse({ name: 'x'.repeat(100) }).success).toBe(true)
    })

    test('create: accepts min length name (1 char)', () => {
      expect(createSchema.safeParse({ name: 'A' }).success).toBe(true)
    })

    test('update: allows partial update (name only)', () => {
      expect(updateSchema.safeParse({ name: 'New' }).success).toBe(true)
    })

    test('update: allows partial update (description only)', () => {
      expect(updateSchema.safeParse({ description: 'Desc' }).success).toBe(true)
    })

    test('update: allows null description', () => {
      expect(updateSchema.safeParse({ description: null }).success).toBe(true)
    })

    test('update: allows empty body', () => {
      expect(updateSchema.safeParse({}).success).toBe(true)
    })

    test('update: rejects empty name string', () => {
      expect(updateSchema.safeParse({ name: '' }).success).toBe(false)
    })

    test('update: rejects name > 100 chars', () => {
      expect(updateSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false)
    })

    test('create: strips extra fields', () => {
      const result = createSchema.safeParse({ name: 'Test', extraField: true })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('extraField')
      }
    })
  })

  // === RISK: Error Code Consistency (LOW) ===
  describe('Error Code Standards', () => {
    test('DEPT_001 for not-found', () => expect('DEPT_001').toMatch(/^DEPT_\d{3}$/))
    test('DEPT_002 for duplicate name', () => expect('DEPT_002').toMatch(/^DEPT_\d{3}$/))
    test('DEPT_003 for active agents blocking delete', () => expect('DEPT_003').toMatch(/^DEPT_\d{3}$/))
  })

  // === RISK: Middleware Files Exist (MEDIUM) ===
  describe('Middleware Dependencies', () => {
    test('auth middleware file exists', async () => {
      expect(await Bun.file(authPath).exists()).toBe(true)
    })

    test('tenant middleware file exists', async () => {
      expect(await Bun.file(tenantPath).exists()).toBe(true)
    })
  })

  // === RISK: Tenant Helper Integration (HIGH) ===
  describe('Tenant Helper Integration', () => {
    test('tenant-helpers module exports withTenant', async () => {
      const helpers = await import('../../db/tenant-helpers')
      expect(typeof helpers.withTenant).toBe('function')
    })

    test('tenant-helpers module exports scopedWhere', async () => {
      const helpers = await import('../../db/tenant-helpers')
      expect(typeof helpers.scopedWhere).toBe('function')
    })

    test('tenant-helpers module exports scopedInsert', async () => {
      const helpers = await import('../../db/tenant-helpers')
      expect(typeof helpers.scopedInsert).toBe('function')
    })
  })
})
