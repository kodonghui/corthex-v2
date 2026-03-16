import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import { listEmployees, getEmployeeDetail } from '../../services/employee-management'

export const workspaceEmployeesRoute = new Hono<AppEnv>()

workspaceEmployeesRoute.use('*', authMiddleware)

// GET /api/workspace/employees — tenant-scoped employee list
workspaceEmployeesRoute.get('/employees', async (c) => {
  const tenant = c.get('tenant')

  const page = c.req.query('page') ? parseInt(c.req.query('page')!, 10) : undefined
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined
  const search = c.req.query('search') || undefined
  const departmentId = c.req.query('departmentId') || undefined
  const isActiveParam = c.req.query('isActive')
  const isActive = isActiveParam !== undefined ? isActiveParam === 'true' : undefined

  const result = await listEmployees(tenant.companyId, { page, limit, search, departmentId, isActive })

  return c.json({ success: true, ...result })
})

// GET /api/workspace/employees/:id — employee detail
workspaceEmployeesRoute.get('/employees/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const employee = await getEmployeeDetail(id, tenant.companyId)

  if (!employee) {
    throw new HTTPError(404, '직원을 찾을 수 없습니다', 'EMPLOYEE_NOT_FOUND')
  }

  return c.json({ success: true, data: employee })
})
