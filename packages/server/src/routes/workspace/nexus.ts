import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents, canvasLayouts } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { TenantContext } from '@corthex/shared'

export const nexusRoute = new Hono()

nexusRoute.use('*', authMiddleware)

// GET /api/workspace/nexus/org-data — 전체 조직 트리
nexusRoute.get('/nexus/org-data', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const [company] = await db
    .select({ id: companies.id, name: companies.name, slug: companies.slug })
    .from(companies)
    .where(eq(companies.id, tenant.companyId))
    .limit(1)

  const depts = await db
    .select({ id: departments.id, name: departments.name, description: departments.description })
    .from(departments)
    .where(eq(departments.companyId, tenant.companyId))

  const allAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      status: agents.status,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  const deptList = depts.map((d) => ({
    ...d,
    agents: allAgents
      .filter((a) => a.departmentId === d.id)
      .map(({ departmentId: _, ...rest }) => rest),
  }))

  const unassigned = allAgents
    .filter((a) => !a.departmentId)
    .map(({ departmentId: _, ...rest }) => rest)

  return c.json({ data: { company, departments: deptList, unassignedAgents: unassigned } })
})

// GET /api/workspace/nexus/layout — 저장된 레이아웃 로드
nexusRoute.get('/nexus/layout', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const [layout] = await db
    .select()
    .from(canvasLayouts)
    .where(and(eq(canvasLayouts.companyId, tenant.companyId), eq(canvasLayouts.isDefault, true)))
    .limit(1)

  return c.json({ data: layout || null })
})

// PUT /api/workspace/nexus/layout — 레이아웃 저장 (upsert)
const saveLayoutSchema = z.object({
  nodes: z.record(
    z.object({ x: z.number(), y: z.number() }),
  ),
  viewport: z
    .object({ x: z.number(), y: z.number(), zoom: z.number() })
    .optional(),
})

nexusRoute.put(
  '/nexus/layout',
  zValidator('json', saveLayoutSchema),
  async (c) => {
    const tenant = c.get('tenant') as TenantContext
    if (tenant.role !== 'admin') {
      throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
    }

    const layoutData = c.req.valid('json')

    const [existing] = await db
      .select({ id: canvasLayouts.id })
      .from(canvasLayouts)
      .where(and(eq(canvasLayouts.companyId, tenant.companyId), eq(canvasLayouts.isDefault, true)))
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(canvasLayouts)
        .set({ layoutData, updatedAt: new Date() })
        .where(eq(canvasLayouts.id, existing.id))
        .returning()
      return c.json({ data: updated })
    }

    const [created] = await db
      .insert(canvasLayouts)
      .values({ companyId: tenant.companyId, name: 'default', layoutData, isDefault: true })
      .returning()
    return c.json({ data: created }, 201)
  },
)

// PATCH /api/workspace/nexus/agent/:id/department — 에이전트 부서 이동
const reassignSchema = z.object({
  departmentId: z.string().uuid().nullable(),
})

nexusRoute.patch(
  '/nexus/agent/:id/department',
  zValidator('json', reassignSchema),
  async (c) => {
    const tenant = c.get('tenant') as TenantContext
    if (tenant.role !== 'admin') {
      throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
    }

    const agentId = c.req.param('id')

    const [agent] = await db
      .select({ id: agents.id, name: agents.name })
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
      .limit(1)

    if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

    const { departmentId } = c.req.valid('json')

    const [updated] = await db
      .update(agents)
      .set({ departmentId, updatedAt: new Date() })
      .where(eq(agents.id, agentId))
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      actorType: 'user',
      actorId: tenant.userId,
      action: `NEXUS: 에이전트 부서 이동 — ${agent.name}`,
      detail: departmentId ? `부서 ID: ${departmentId}` : '미배정',
    })

    return c.json({ data: updated })
  },
)
