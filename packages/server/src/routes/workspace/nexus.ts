import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents, canvasLayouts } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const nexusRoute = new Hono<AppEnv>()

nexusRoute.use('*', authMiddleware)

// GET /api/workspace/nexus/org-data — 전체 조직 트리
nexusRoute.get('/nexus/org-data', async (c) => {
  const tenant = c.get('tenant')

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
  const tenant = c.get('tenant')

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
    const tenant = c.get('tenant')
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

// GET /api/workspace/nexus/graph — 통합 그래프 데이터 (노드+엣지+좌표)
nexusRoute.get('/nexus/graph', async (c) => {
  const tenant = c.get('tenant')

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
      soul: agents.soul,
    })
    .from(agents)
    .where(and(eq(agents.companyId, tenant.companyId), eq(agents.isActive, true)))

  const [layout] = await db
    .select()
    .from(canvasLayouts)
    .where(and(eq(canvasLayouts.companyId, tenant.companyId), eq(canvasLayouts.isDefault, true)))
    .limit(1)

  const saved = (layout?.layoutData as { nodes?: Record<string, { x: number; y: number }> } | null)?.nodes || {}

  // Pre-group agents by departmentId (O(n) instead of O(n*m))
  const agentsByDept = new Map<string, typeof allAgents>()
  const unassignedAgents: typeof allAgents = []
  for (const agent of allAgents) {
    if (agent.departmentId) {
      const list = agentsByDept.get(agent.departmentId) || []
      list.push(agent)
      agentsByDept.set(agent.departmentId, list)
    } else {
      unassignedAgents.push(agent)
    }
  }

  const nodes: Array<Record<string, unknown>> = []
  const edges: Array<Record<string, unknown>> = []

  // Company node
  const companyNodeId = `company-${company.id}`
  nodes.push({
    id: companyNodeId,
    type: 'company',
    label: company.name,
    x: saved[companyNodeId]?.x ?? 0,
    y: saved[companyNodeId]?.y ?? 0,
    slug: company.slug,
  })

  // Department nodes + edges
  for (const dept of depts) {
    const deptNodeId = `dept-${dept.id}`
    const deptAgents = agentsByDept.get(dept.id) || []
    nodes.push({
      id: deptNodeId,
      type: 'department',
      label: dept.name,
      description: dept.description,
      agentCount: deptAgents.length,
      x: saved[deptNodeId]?.x ?? 0,
      y: saved[deptNodeId]?.y ?? 0,
    })
    edges.push({
      id: `e-company-${dept.id}`,
      source: companyNodeId,
      target: deptNodeId,
      type: 'smoothstep',
    })

    // Agent nodes in department
    for (const agent of deptAgents) {
      const agentNodeId = `agent-${agent.id}`
      nodes.push({
        id: agentNodeId,
        type: 'agent',
        label: agent.name,
        agentId: agent.id,
        role: agent.role,
        status: agent.status,
        isSecretary: agent.isSecretary,
        soul: agent.soul ? agent.soul.split('\n')[0].slice(0, 100) : null,
        x: saved[agentNodeId]?.x ?? 0,
        y: saved[agentNodeId]?.y ?? 0,
      })
      edges.push({
        id: `e-dept-${agent.id}`,
        source: deptNodeId,
        target: agentNodeId,
        type: 'smoothstep',
      })
    }
  }

  // Unassigned agents
  for (const agent of unassignedAgents) {
    const agentNodeId = `agent-${agent.id}`
    nodes.push({
      id: agentNodeId,
      type: 'agent',
      label: agent.name,
      agentId: agent.id,
      role: agent.role,
      status: agent.status,
      isSecretary: agent.isSecretary,
      soul: agent.soul ? agent.soul.split('\n')[0].slice(0, 100) : null,
      x: saved[agentNodeId]?.x ?? 0,
      y: saved[agentNodeId]?.y ?? 0,
    })
    edges.push({
      id: `e-unassigned-${agent.id}`,
      source: companyNodeId,
      target: agentNodeId,
      type: 'smoothstep',
      style: { strokeDasharray: '5 5' },
    })
  }

  return c.json({
    data: {
      nodes,
      edges,
      updatedAt: layout?.updatedAt?.toISOString() ?? null,
    },
  })
})

// PATCH /api/workspace/nexus/agent/:id/department — 에이전트 부서 이동
const reassignSchema = z.object({
  departmentId: z.string().uuid().nullable(),
})

nexusRoute.patch(
  '/nexus/agent/:id/department',
  zValidator('json', reassignSchema),
  async (c) => {
    const tenant = c.get('tenant')
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
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `NEXUS: 에이전트 부서 이동 — ${agent.name}`,
      detail: departmentId ? `부서 ID: ${departmentId}` : '미배정',
    })

    return c.json({ data: updated })
  },
)
