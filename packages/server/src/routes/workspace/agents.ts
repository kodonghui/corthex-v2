import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../../db'
import { agents, departments, soulTemplates } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const workspaceAgentsRoute = new Hono<AppEnv>()

workspaceAgentsRoute.use('*', authMiddleware)

// GET /api/workspace/agents — 내 회사의 활성 에이전트 목록
workspaceAgentsRoute.get('/agents', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      status: agents.status,
      level: agents.level,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  return c.json({ data: result })
})

// GET /api/workspace/agents/hierarchy — 부서별 에이전트 계층
workspaceAgentsRoute.get('/agents/hierarchy', async (c) => {
  const tenant = c.get('tenant')

  const allDepts = await db
    .select({ id: departments.id, name: departments.name, parentDepartmentId: departments.parentDepartmentId })
    .from(departments)
    .where(and(eq(departments.companyId, tenant.companyId), eq(departments.isActive, true)))

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      level: agents.level,
      status: agents.status,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  // 레벨 우선순위: director > lead > member
  const levelOrder: Record<string, number> = { director: 0, lead: 1, member: 2 }

  const hierarchy = allDepts.map(dept => ({
    department: dept,
    agents: allAgents
      .filter(a => a.departmentId === dept.id)
      .sort((a, b) => (levelOrder[a.level] ?? 9) - (levelOrder[b.level] ?? 9)),
  }))

  // 부서 없는 에이전트
  const unassigned = allAgents.filter(a => !a.departmentId)

  return c.json({ data: { departments: hierarchy, unassigned } })
})

// GET /api/workspace/agents/soul-templates — 소울 템플릿 목록
workspaceAgentsRoute.get('/agents/soul-templates', async (c) => {
  const tenant = c.get('tenant')
  const result = await db.select().from(soulTemplates)
    .where(and(eq(soulTemplates.companyId, tenant.companyId), eq(soulTemplates.isActive, true)))
  return c.json({ data: result })
})

// GET /api/workspace/agents/:id — 에이전트 상세 (내 회사만)
workspaceAgentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      soul: agents.soul,
      adminSoul: agents.adminSoul,
      status: agents.status,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  return c.json({ data: agent })
})

// PATCH /api/workspace/agents/:id/soul — 에이전트 소울 수정 (자기 에이전트만)
const updateSoulSchema = z.object({
  soul: z.string().min(1).max(2000),
})

workspaceAgentsRoute.patch('/agents/:id/soul', zValidator('json', updateSoulSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { soul } = c.req.valid('json')

  // 자기 에이전트만 수정 가능
  const [agent] = await db
    .select({ id: agents.id, userId: agents.userId, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  if (agent.userId !== tenant.userId && tenant.role !== 'admin') {
    throw new HTTPError(403, '본인 에이전트만 수정할 수 있습니다', 'AUTH_003')
  }

  const [updated] = await db
    .update(agents)
    .set({ soul, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `에이전트 소울 수정: ${agent.name}`,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/agents/:id/soul/reset — 에이전트 소울 초기화 (admin_soul로 복원)
workspaceAgentsRoute.post('/agents/:id/soul/reset', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [agent] = await db
    .select({ id: agents.id, userId: agents.userId, name: agents.name, adminSoul: agents.adminSoul })
    .from(agents)
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  if (agent.userId !== tenant.userId && tenant.role !== 'admin') {
    throw new HTTPError(403, '본인 에이전트만 수정할 수 있습니다', 'AUTH_003')
  }

  if (!agent.adminSoul) {
    throw new HTTPError(400, '초기화할 원본 소울이 없습니다', 'AGENT_002')
  }

  const [updated] = await db
    .update(agents)
    .set({ soul: agent.adminSoul, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `에이전트 소울 초기화: ${agent.name}`,
  })

  return c.json({ data: updated })
})
