import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { departments, agents } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { scopedWhere } from '../../db/tenant-helpers'
import type { AppEnv } from '../../types'
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  analyzeCascade,
  executeCascade,
} from '../../services/organization'
import type { CascadeMode } from '../../services/organization'

function throwIfError(result: { error?: { status: number; message: string; code: string } }): void {
  if (result.error) {
    throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  }
}

export const departmentsRoute = new Hono<AppEnv>()

departmentsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})

// GET /api/admin/departments -- tenant-scoped list
departmentsRoute.get('/departments', async (c) => {
  const tenant = c.get('tenant')
  const result = await getDepartments(tenant.companyId)
  return c.json({ data: result })
})

// GET /api/admin/departments/tree -- tenant-scoped tree view (must be before :id)
departmentsRoute.get('/departments/tree', async (c) => {
  const tenant = c.get('tenant')

  const allDepts = await db
    .select()
    .from(departments)
    .where(scopedWhere(departments.companyId, tenant.companyId, eq(departments.isActive, true)))

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      departmentId: agents.departmentId,
      isSecretary: agents.isSecretary,
    })
    .from(agents)
    .where(scopedWhere(agents.companyId, tenant.companyId, eq(agents.isActive, true)))

  const tree = allDepts.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: allAgents.filter(a => a.departmentId === d.id),
  }))

  return c.json({ data: tree })
})

// GET /api/admin/departments/:id/cascade-analysis -- cascade impact report (must be before :id)
departmentsRoute.get('/departments/:id/cascade-analysis', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const result = await analyzeCascade(tenant.companyId, id)
  throwIfError(result as any)
  return c.json({ data: (result as any).data })
})

// GET /api/admin/departments/:id -- single department by ID
departmentsRoute.get('/departments/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const dept = await getDepartmentById(tenant.companyId, id)
  if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
  return c.json({ data: dept })
})

// POST /api/admin/departments
departmentsRoute.post('/departments', zValidator('json', createDepartmentSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const result = await createDepartment(tenant, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ data: result.data }, 201)
})

// PATCH /api/admin/departments/:id
departmentsRoute.patch('/departments/:id', zValidator('json', updateDepartmentSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const result = await updateDepartment(tenant, id, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ data: result.data })
})

// DELETE /api/admin/departments/:id?mode=force|wait_completion
departmentsRoute.delete('/departments/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const modeParam = c.req.query('mode') as CascadeMode | undefined

  // Validate mode if provided
  if (modeParam && !['force', 'wait_completion'].includes(modeParam)) {
    throw new HTTPError(400, 'mode는 force 또는 wait_completion만 가능합니다', 'CASCADE_003')
  }

  const result = await executeCascade(tenant, id, modeParam)
  throwIfError(result as any)
  return c.json({ data: (result as any).data })
})
