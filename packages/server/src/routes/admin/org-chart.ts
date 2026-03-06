import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const orgChartRoute = new Hono<AppEnv>()

orgChartRoute.use('*', authMiddleware, adminOnly)

// GET /org-chart?companyId=xxx
orgChartRoute.get('/org-chart', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) throw new HTTPError(400, 'companyId가 필요합니다', 'ORG_001')

  const [company] = await db
    .select({ id: companies.id, name: companies.name, slug: companies.slug })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) throw new HTTPError(404, '회사를 찾을 수 없습니다', 'ORG_002')

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
      status: agents.status,
      isSecretary: agents.isSecretary,
    })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))

  const deptTree = allDepts.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: allAgents.filter((a) => a.departmentId === d.id),
  }))

  const unassignedAgents = allAgents.filter((a) => !a.departmentId)

  return c.json({
    data: {
      company,
      departments: deptTree,
      unassignedAgents,
    },
  })
})
