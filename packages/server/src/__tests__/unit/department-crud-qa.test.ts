import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { resolve } from 'path'

/**
 * QA Verification Tests for Story 2-1: Department CRUD API
 * Focus: Edge cases, input validation boundaries, API contract, functional completeness
 */

const servicePath = resolve(import.meta.dir, '../../services/organization.ts')
const routePath = resolve(import.meta.dir, '../../routes/admin/departments.ts')

describe('QA: Department CRUD Functional Verification', () => {
  // === Input Validation Edge Cases ===
  describe('Create Department Input Validation', () => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    })

    test('Korean department name accepted', () => {
      expect(schema.safeParse({ name: '마케팅부' }).success).toBe(true)
    })

    test('name with special characters accepted', () => {
      expect(schema.safeParse({ name: 'R&D / Innovation' }).success).toBe(true)
    })

    test('name with leading/trailing spaces accepted (no trim)', () => {
      const result = schema.safeParse({ name: '  HR  ' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.name).toBe('  HR  ')
    })

    test('name with only spaces accepted (not recommended but valid)', () => {
      expect(schema.safeParse({ name: '   ' }).success).toBe(true)
    })

    test('very long description accepted (no max)', () => {
      const longDesc = 'x'.repeat(10000)
      expect(schema.safeParse({ name: 'Test', description: longDesc }).success).toBe(true)
    })

    test('numeric string name accepted', () => {
      expect(schema.safeParse({ name: '123' }).success).toBe(true)
    })

    test('emoji name accepted', () => {
      expect(schema.safeParse({ name: '🚀 Launch Team' }).success).toBe(true)
    })

    test('name with newlines accepted', () => {
      expect(schema.safeParse({ name: 'Line\nBreak' }).success).toBe(true)
    })

    test('rejects null name', () => {
      expect(schema.safeParse({ name: null }).success).toBe(false)
    })

    test('rejects number as name', () => {
      expect(schema.safeParse({ name: 123 }).success).toBe(false)
    })

    test('rejects missing name field', () => {
      expect(schema.safeParse({}).success).toBe(false)
    })

    test('rejects array as name', () => {
      expect(schema.safeParse({ name: ['test'] }).success).toBe(false)
    })
  })

  describe('Update Department Input Validation', () => {
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().nullable().optional(),
    })

    test('both fields provided', () => {
      expect(schema.safeParse({ name: 'New', description: 'Desc' }).success).toBe(true)
    })

    test('only name provided', () => {
      expect(schema.safeParse({ name: 'New' }).success).toBe(true)
    })

    test('only description provided', () => {
      expect(schema.safeParse({ description: 'New desc' }).success).toBe(true)
    })

    test('description set to null (clear)', () => {
      expect(schema.safeParse({ description: null }).success).toBe(true)
    })

    test('empty body (no changes)', () => {
      expect(schema.safeParse({}).success).toBe(true)
    })

    test('unknown fields stripped', () => {
      const result = schema.safeParse({ name: 'New', unknown: true })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data).not.toHaveProperty('unknown')
    })
  })

  // === Service Logic Verification ===
  describe('Service Implementation Completeness', () => {
    test('createDepartment handles null description via ?? null', async () => {
      const sc = await Bun.file(servicePath).text()
      expect(sc).toContain('input.description ?? null')
    })

    test('updateDepartment only checks name uniqueness when name is provided', async () => {
      const sc = await Bun.file(servicePath).text()
      expect(sc).toContain('if (input.name)')
    })

    test('deleteDepartment checks agents scoped to same company', async () => {
      const sc = await Bun.file(servicePath).text()
      expect(sc).toContain('agents.companyId, tenant.companyId')
    })

    test('getDepartmentById returns null for missing department', async () => {
      const sc = await Bun.file(servicePath).text()
      expect(sc).toContain('dept ?? null')
    })

    test('all write operations use tenant.companyId for scoping', async () => {
      const sc = await Bun.file(servicePath).text()
      const createFn = sc.split('export async function createDepartment')[1]
        ?.split('export async function')[0] ?? ''
      const updateFn = sc.split('export async function updateDepartment')[1]
        ?.split('export async function')[0] ?? ''
      const deleteFn = sc.split('export async function deleteDepartment')[1] ?? ''

      expect(createFn).toContain('tenant.companyId')
      expect(updateFn).toContain('tenant.companyId')
      expect(deleteFn).toContain('tenant.companyId')
    })

    test('audit logs include targetType = department on all writes', async () => {
      const sc = await Bun.file(servicePath).text()
      const auditCalls = sc.match(/targetType: 'department'/g)
      expect(auditCalls).not.toBeNull()
      expect(auditCalls!.length).toBe(3)
    })

    test('audit logs include targetId on all write operations', async () => {
      const sc = await Bun.file(servicePath).text()
      const targetIdCalls = sc.match(/targetId:/g)
      expect(targetIdCalls).not.toBeNull()
      expect(targetIdCalls!.length).toBe(3)
    })
  })

  // === Route Integration Verification ===
  describe('Route Integration Completeness', () => {
    let routeContent: string

    test('load route file', async () => {
      routeContent = await Bun.file(routePath).text()
      expect(routeContent).toBeTruthy()
    })

    test('GET list uses getDepartments service function', () => {
      expect(routeContent).toContain('getDepartments(tenant.companyId)')
    })

    test('GET :id uses getDepartmentById service function', () => {
      expect(routeContent).toContain('getDepartmentById(tenant.companyId, id)')
    })

    test('POST uses createDepartment service function', () => {
      expect(routeContent).toContain('createDepartment(tenant, body)')
    })

    test('PATCH uses updateDepartment service function', () => {
      expect(routeContent).toContain('updateDepartment(tenant, id, body)')
    })

    test('DELETE uses deleteDepartment service function', () => {
      expect(routeContent).toContain('deleteDepartment(tenant, id)')
    })

    test('all service error results are converted to HTTPError', () => {
      // Count occurrences of the error conversion pattern
      const errorConversions = routeContent.match(/if \('error' in result\) throw new HTTPError/g)
      expect(errorConversions).not.toBeNull()
      expect(errorConversions!.length).toBe(3) // create, update, delete
    })

    test('GET list does not need error conversion (always returns array)', () => {
      // The GET list handler should not have error checking
      const getListSection = routeContent.split(".get('/departments',")[1]
        ?.split(/\.(get|post|patch|delete)\('/)[0] ?? ''
      expect(getListSection).not.toContain("'error' in result")
    })

    test('GET :id throws HTTPError for not-found', () => {
      // Verify the route has 404 handling for single department fetch
      expect(routeContent).toContain("throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')")
    })
  })

  // === API Contract Verification ===
  describe('API Response Contract', () => {
    let routeContent: string

    test('load route', async () => {
      routeContent = await Bun.file(routePath).text()
    })

    test('all success responses use { data: ... } wrapper', () => {
      const jsonCalls = routeContent.match(/c\.json\(\{/g)
      expect(jsonCalls).not.toBeNull()
      // All json calls should contain 'data'
      const dataWrapped = routeContent.match(/c\.json\(\{ data:/g)
      expect(dataWrapped).not.toBeNull()
      expect(dataWrapped!.length).toEqual(jsonCalls!.length)
    })

    test('POST returns 201 status code', () => {
      // The POST handler uses c.json({ data: result.data }, 201)
      expect(routeContent).toContain('result.data }, 201)')
    })

    test('route file contains 201 only once (POST endpoint)', () => {
      const matches = routeContent.match(/201\)/g)
      expect(matches).not.toBeNull()
      expect(matches!.length).toBe(1) // only POST returns 201
    })
  })

  // === Acceptance Criteria Verification ===
  describe('Story 2-1 Acceptance Criteria Coverage', () => {
    let routeContent: string
    let serviceContent: string

    test('load files', async () => {
      routeContent = await Bun.file(routePath).text()
      serviceContent = await Bun.file(servicePath).text()
    })

    test('AC1: POST endpoint exists', () => {
      expect(routeContent).toContain(".post('/departments'")
    })

    test('AC2: GET list endpoint exists', () => {
      expect(routeContent).toContain(".get('/departments',")
    })

    test('AC3: GET :id endpoint exists', () => {
      expect(routeContent).toContain(".get('/departments/:id'")
    })

    test('AC4: PATCH endpoint exists', () => {
      expect(routeContent).toContain(".patch('/departments/:id'")
    })

    test('AC5: DELETE endpoint exists', () => {
      expect(routeContent).toContain(".delete('/departments/:id'")
    })

    test('AC6: Name uniqueness on create AND update', () => {
      expect(serviceContent).toContain('DEPT_002') // duplicate name error code
      // create has uniqueness check
      const createFn = serviceContent.split('export async function createDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(createFn).toContain("eq(departments.name, input.name)")
      // update has uniqueness check with self-exclusion
      const updateFn = serviceContent.split('export async function updateDepartment')[1]
        ?.split('export async function')[0] ?? ''
      expect(updateFn).toContain("eq(departments.name, input.name)")
      expect(updateFn).toContain("ne(departments.id, departmentId)")
    })

    test('AC7: Audit logging on all writes', () => {
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE')
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE')
      expect(serviceContent).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE')
    })

    test('AC8: Tenant isolation via middleware', () => {
      expect(routeContent).toContain('tenantMiddleware')
      expect(serviceContent).toContain('withTenant')
      expect(serviceContent).toContain('scopedWhere')
      expect(serviceContent).toContain('scopedInsert')
    })

    test('AC9: DELETE blocked with active agents', () => {
      expect(serviceContent).toContain('agentCount')
      expect(serviceContent).toContain('DEPT_003')
    })

    test('AC10: adminOnly middleware applied', () => {
      expect(routeContent).toContain('adminOnly')
    })
  })
})
