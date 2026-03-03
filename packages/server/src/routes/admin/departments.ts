import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { departments } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'

export const departmentsRoute = new Hono()

departmentsRoute.use('*', authMiddleware, adminOnly)

const createDepartmentSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})

// GET /api/admin/departments?companyId=xxx
departmentsRoute.get('/departments', async (c) => {
  const companyId = c.req.query('companyId')
  const query = db.select().from(departments)
  const result = companyId
    ? await query.where(eq(departments.companyId, companyId))
    : await query
  return c.json({ data: result })
})

// POST /api/admin/departments
departmentsRoute.post('/departments', zValidator('json', createDepartmentSchema), async (c) => {
  const body = c.req.valid('json')
  const [dept] = await db.insert(departments).values(body).returning()
  return c.json({ data: dept }, 201)
})

// PATCH /api/admin/departments/:id
departmentsRoute.patch('/departments/:id', zValidator('json', updateDepartmentSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [dept] = await db
    .update(departments)
    .set(body)
    .where(eq(departments.id, id))
    .returning()
  if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
  return c.json({ data: dept })
})

// DELETE /api/admin/departments/:id
departmentsRoute.delete('/departments/:id', async (c) => {
  const id = c.req.param('id')
  const [dept] = await db.delete(departments).where(eq(departments.id, id)).returning()
  if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
  return c.json({ data: { message: '삭제되었습니다' } })
})
