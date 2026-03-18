import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import {
  createEmployee,
  listEmployees,
  getEmployeeDetail,
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
  resetEmployeePassword,
} from '../../services/employee-management'

export const employeesRoute = new Hono<AppEnv>()

employeesRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// === Zod Schemas ===

const createEmployeeSchema = z.object({
  username: z.string().min(2).max(50),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  departmentIds: z.array(z.string().uuid()).optional().default([]),
})

const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
})

// === Routes ===

// POST /api/admin/employees — 직원 초대 (생성)
employeesRoute.post('/employees', zValidator('json', createEmployeeSchema), async (c) => {
  const tenant = c.get('tenant')
  const input = c.req.valid('json')
  const companyId = tenant.companyId

  const result = await createEmployee(companyId, input, tenant.userId)

  if ('error' in result && result.error) {
    throw new HTTPError(409, result.error.message, result.error.code)
  }

  return c.json({ data: result.data }, 201)
})

// GET /api/admin/employees — 직원 목록
employeesRoute.get('/employees', async (c) => {
  const tenant = c.get('tenant')
  const companyId = tenant.companyId

  const page = c.req.query('page') ? parseInt(c.req.query('page')!, 10) : undefined
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined
  const search = c.req.query('search') || undefined
  const departmentId = c.req.query('departmentId') || undefined
  const isActiveParam = c.req.query('isActive')
  const isActive = isActiveParam !== undefined ? isActiveParam === 'true' : undefined

  const result = await listEmployees(companyId, { page, limit, search, departmentId, isActive })

  return c.json(result)
})

// GET /api/admin/employees/:id — 직원 상세
employeesRoute.get('/employees/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const companyId = tenant.companyId

  const employee = await getEmployeeDetail(id, companyId)

  if (!employee) {
    throw new HTTPError(404, '직원을 찾을 수 없습니다', 'EMPLOYEE_NOT_FOUND')
  }

  return c.json({ data: employee })
})

// PUT /api/admin/employees/:id — 직원 수정
employeesRoute.put('/employees/:id', zValidator('json', updateEmployeeSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const input = c.req.valid('json')
  const companyId = tenant.companyId

  const result = await updateEmployee(id, companyId, input, tenant.userId)

  if (result === null) {
    throw new HTTPError(404, '직원을 찾을 수 없습니다', 'EMPLOYEE_NOT_FOUND')
  }

  if ('error' in result && result.error) {
    throw new HTTPError(400, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})

// DELETE /api/admin/employees/:id — 직원 비활성화
employeesRoute.delete('/employees/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const companyId = tenant.companyId

  const result = await deactivateEmployee(id, companyId, tenant.userId)

  if ('error' in result && result.error) {
    const status = result.error.code === 'EMPLOYEE_NOT_FOUND' ? 404 : 409
    throw new HTTPError(status, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})

// POST /api/admin/employees/:id/reactivate — 직원 재활성화
employeesRoute.post('/employees/:id/reactivate', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const companyId = tenant.companyId

  const result = await reactivateEmployee(id, companyId, tenant.userId)

  if ('error' in result && result.error) {
    const status = result.error.code === 'EMPLOYEE_NOT_FOUND' ? 404 : 409
    throw new HTTPError(status, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})

// POST /api/admin/employees/:id/reset-password — 비밀번호 초기화
employeesRoute.post('/employees/:id/reset-password', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const companyId = tenant.companyId

  const result = await resetEmployeePassword(id, companyId, tenant.userId)

  if ('error' in result && result.error) {
    throw new HTTPError(404, result.error.message, result.error.code)
  }

  return c.json({ data: result.data })
})
