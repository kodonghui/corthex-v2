import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import { HTTPError } from '../../middleware/error'
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
import { isCeoOrAbove } from '@corthex/shared'

function throwIfError(result: { error?: { status: number; message: string; code: string } }): void {
  if (result.error) {
    throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  }
}

export const workspaceDepartmentsRoute = new Hono<AppEnv>()

workspaceDepartmentsRoute.use('*', authMiddleware)
workspaceDepartmentsRoute.use('*', departmentScopeMiddleware)

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})

// GET /api/workspace/departments — tenant-scoped department list
workspaceDepartmentsRoute.get('/departments', async (c) => {
  const tenant = c.get('tenant')
  const result = await getDepartments(tenant.companyId)

  // Employee: filter to assigned departments only
  if (tenant.departmentIds) {
    const scopedIds = new Set(tenant.departmentIds)
    const filtered = result.filter((d: { id: string }) => scopedIds.has(d.id))
    return c.json({ success: true, data: filtered })
  }

  return c.json({ success: true, data: result })
})

// GET /api/workspace/departments/:id — single department
workspaceDepartmentsRoute.get('/departments/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Employee: verify access
  if (tenant.departmentIds && !tenant.departmentIds.includes(id)) {
    throw new HTTPError(403, '해당 부서에 접근할 수 없습니다', 'SCOPE_001')
  }

  const dept = await getDepartmentById(tenant.companyId, id)
  if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
  return c.json({ success: true, data: dept })
})

// GET /api/workspace/departments/:id/cascade-analysis — cascade impact report
workspaceDepartmentsRoute.get('/departments/:id/cascade-analysis', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '부서 영향 분석은 관리자만 가능합니다', 'AUTH_003')
  }

  const result = await analyzeCascade(tenant.companyId, id)
  throwIfError(result as any)
  return c.json({ success: true, data: (result as any).data })
})

// POST /api/workspace/departments — create department (admin/ceo only)
workspaceDepartmentsRoute.post('/departments', zValidator('json', createDepartmentSchema), async (c) => {
  const tenant = c.get('tenant')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '부서 생성은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')
  const result = await createDepartment(tenant, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data }, 201)
})

// PATCH /api/workspace/departments/:id — update department (admin/ceo only)
workspaceDepartmentsRoute.patch('/departments/:id', zValidator('json', updateDepartmentSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '부서 수정은 관리자만 가능합니다', 'AUTH_003')
  }

  const body = c.req.valid('json')
  const result = await updateDepartment(tenant, id, body)
  if ('error' in result) throw new HTTPError(result.error!.status, result.error!.message, result.error!.code)
  return c.json({ success: true, data: result.data })
})

// DELETE /api/workspace/departments/:id?mode=force|wait_completion — delete department (admin/ceo only)
workspaceDepartmentsRoute.delete('/departments/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '부서 삭제는 관리자만 가능합니다', 'AUTH_003')
  }

  const modeParam = c.req.query('mode') as CascadeMode | undefined

  if (modeParam && !['force', 'wait_completion'].includes(modeParam)) {
    throw new HTTPError(400, 'mode는 force 또는 wait_completion만 가능합니다', 'CASCADE_003')
  }

  const result = await executeCascade(tenant, id, modeParam)
  throwIfError(result as any)
  return c.json({ success: true, data: (result as any).data })
})
