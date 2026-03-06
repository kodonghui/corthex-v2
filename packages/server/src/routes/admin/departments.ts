import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, count } from 'drizzle-orm'
import { db } from '../../db'
import { departments, agents } from '../../db/schema'
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

  // 같은 회사 내 중복 이름 체크
  const [existing] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.companyId, body.companyId), eq(departments.name, body.name)))
    .limit(1)
  if (existing) throw new HTTPError(409, '같은 이름의 부서가 이미 있습니다', 'DEPT_002')

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

  // 소속 에이전트 수 체크
  const [{ agentCount }] = await db
    .select({ agentCount: count() })
    .from(agents)
    .where(eq(agents.departmentId, id))

  if (Number(agentCount) > 0) {
    throw new HTTPError(409, `소속 에이전트가 ${agentCount}명 있어 삭제할 수 없습니다`, 'DEPT_003')
  }

  const [dept] = await db
    .update(departments)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(departments.id, id))
    .returning()
  if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
  return c.json({ data: { message: '비활성화되었습니다' } })
})

// GET /api/admin/departments/tree?companyId=xxx — 부서 계층 트리
departmentsRoute.get('/departments/tree', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) throw new HTTPError(400, 'companyId가 필요합니다', 'DEPT_004')

  const allDepts = await db
    .select()
    .from(departments)
    .where(and(eq(departments.companyId, companyId), eq(departments.isActive, true)))

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      departmentId: agents.departmentId,
      isSecretary: agents.isSecretary,
    })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))

  const tree = allDepts.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: allAgents.filter(a => a.departmentId === d.id),
  }))

  return c.json({ data: tree })
})
