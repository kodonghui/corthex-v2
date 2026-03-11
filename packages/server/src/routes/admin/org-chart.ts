import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents, users, employeeDepartments, cliCredentials } from '../../db/schema'
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
      tier: agents.tier,
      tierLevel: agents.tierLevel,
      modelName: agents.modelName,
      departmentId: agents.departmentId,
      status: agents.status,
      isSecretary: agents.isSecretary,
      isSystem: agents.isSystem,
      soul: agents.soul,
      allowedTools: agents.allowedTools,
      reportTo: agents.reportTo,
      ownerUserId: agents.ownerUserId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))

  // Fetch human staff (users)
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))

  // Fetch employee-department assignments
  const empDepts = await db
    .select({
      userId: employeeDepartments.userId,
      departmentId: employeeDepartments.departmentId,
    })
    .from(employeeDepartments)
    .where(eq(employeeDepartments.companyId, companyId))

  // Fetch CLI credential status per user (has active token?)
  const cliStatus = await db
    .select({
      userId: cliCredentials.userId,
      count: sql<number>`count(*)::int`,
    })
    .from(cliCredentials)
    .where(and(eq(cliCredentials.companyId, companyId), eq(cliCredentials.isActive, true)))
    .groupBy(cliCredentials.userId)

  const cliTokenMap = new Map(cliStatus.map((c) => [c.userId, true]))

  // Count owned agents per user (ownerUserId)
  const ownerCounts = new Map<string, number>()
  for (const a of allAgents) {
    if (a.ownerUserId) {
      ownerCounts.set(a.ownerUserId, (ownerCounts.get(a.ownerUserId) ?? 0) + 1)
    }
  }

  // Build employee-department mapping
  const empDeptMap = new Map<string, string[]>()
  for (const ed of empDepts) {
    const list = empDeptMap.get(ed.userId) ?? []
    list.push(ed.departmentId)
    empDeptMap.set(ed.userId, list)
  }

  // Build OrgEmployee objects
  const orgEmployees = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    hasCliToken: cliTokenMap.has(u.id),
    agentCount: ownerCounts.get(u.id) ?? 0,
  }))

  const tierOrder: Record<string, number> = { manager: 0, specialist: 1, worker: 2 }
  const sortByTier = <T extends { tier: string }>(list: T[]) =>
    [...list].sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9))

  const deptTree = allDepts.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    agents: sortByTier(allAgents.filter((a) => a.departmentId === d.id)),
    employees: orgEmployees.filter((e) => (empDeptMap.get(e.id) ?? []).includes(d.id)),
  }))

  const assignedUserIds = new Set(empDepts.map((ed) => ed.userId))
  const unassignedAgents = allAgents.filter((a) => !a.departmentId)
  const unassignedEmployees = orgEmployees.filter((e) => !assignedUserIds.has(e.id))

  return c.json({
    data: {
      company,
      departments: deptTree,
      unassignedAgents,
      unassignedEmployees,
    },
  })
})
