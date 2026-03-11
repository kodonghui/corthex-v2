import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const workspaceOrgChartRoute = new Hono<AppEnv>()

workspaceOrgChartRoute.use('*', authMiddleware)

// GET /org-chart -- CEO/직원용 조직도 (읽기 전용, tenant companyId 자동)
workspaceOrgChartRoute.get('/org-chart', async (c) => {
  const tenant = c.get('tenant')

  const [company] = await db
    .select({ id: companies.id, name: companies.name, slug: companies.slug })
    .from(companies)
    .where(eq(companies.id, tenant.companyId))
    .limit(1)

  if (!company) {
    return c.json({ success: false, error: { code: 'ORG_002', message: '회사를 찾을 수 없습니다' } }, 404)
  }

  const allDepts = await db
    .select()
    .from(departments)
    .where(and(eq(departments.companyId, tenant.companyId), eq(departments.isActive, true)))

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      tier: agents.tier,
      modelName: agents.modelName,
      departmentId: agents.departmentId,
      status: agents.status,
      isSecretary: agents.isSecretary,
      isActive: agents.isActive,
      isSystem: agents.isSystem,
      soul: agents.soul,
      allowedTools: agents.allowedTools,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  const tierOrder: Record<string, number> = { manager: 0, specialist: 1, worker: 2 }
  const sortByTier = <T extends { tier: string }>(list: T[]) =>
    [...list].sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9))

  const deptTree = allDepts.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: sortByTier(allAgents.filter((a) => a.departmentId === d.id)),
  }))

  const unassignedAgents = sortByTier(allAgents.filter((a) => !a.departmentId))

  return c.json({
    success: true,
    data: {
      company,
      departments: deptTree,
      unassignedAgents,
    },
  })
})
