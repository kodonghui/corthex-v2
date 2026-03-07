import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents, canvasLayouts, nexusWorkflows, nexusExecutions } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { isCeoOrAbove } from '@corthex/shared'
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
    if (!isCeoOrAbove(tenant.role)) {
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
    if (!isCeoOrAbove(tenant.role)) {
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

// ========================================
// 워크플로우 CRUD + 실행 API
// ========================================

// GET /api/workspace/nexus/workflows — 워크플로우 목록 (filter: mine/templates)
nexusRoute.get('/nexus/workflows', async (c) => {
  const tenant = c.get('tenant')
  const filter = c.req.query('filter')

  const conditions = [eq(nexusWorkflows.companyId, tenant.companyId)]

  if (filter === 'mine') {
    conditions.push(eq(nexusWorkflows.createdBy, tenant.userId))
  } else if (filter === 'templates') {
    conditions.push(eq(nexusWorkflows.isTemplate, true))
  }

  const workflows = await db
    .select()
    .from(nexusWorkflows)
    .where(and(...conditions))
    .orderBy(desc(nexusWorkflows.updatedAt))

  return c.json({ data: workflows })
})

// POST /api/workspace/nexus/workflows — 워크플로우 생성
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
})

nexusRoute.post(
  '/nexus/workflows',
  zValidator('json', createWorkflowSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    const [created] = await db
      .insert(nexusWorkflows)
      .values({
        companyId: tenant.companyId,
        name: body.name,
        description: body.description ?? null,
        nodes: body.nodes,
        edges: body.edges,
        createdBy: tenant.userId,
      })
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `NEXUS: 워크플로우 생성 — ${body.name}`,
    })

    return c.json({ data: created }, 201)
  },
)

// PUT /api/workspace/nexus/workflows/:id — 워크플로우 수정
const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
})

nexusRoute.put(
  '/nexus/workflows/:id',
  zValidator('json', updateWorkflowSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const id = c.req.param('id')
    const body = c.req.valid('json')

    const [existing] = await db
      .select({ id: nexusWorkflows.id })
      .from(nexusWorkflows)
      .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WORKFLOW_001')

    const [updated] = await db
      .update(nexusWorkflows)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(nexusWorkflows.id, id))
      .returning()

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/nexus/workflows/:id — 워크플로우 삭제
nexusRoute.delete('/nexus/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: nexusWorkflows.id, name: nexusWorkflows.name })
    .from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WORKFLOW_001')

  // 실행 기록 + 워크플로우를 트랜잭션으로 삭제
  await db.transaction(async (tx) => {
    await tx
      .delete(nexusExecutions)
      .where(eq(nexusExecutions.workflowId, id))
    await tx
      .delete(nexusWorkflows)
      .where(eq(nexusWorkflows.id, id))
  })

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `NEXUS: 워크플로우 삭제 — ${existing.name}`,
  })

  return c.json({ data: { deleted: true } })
})

// POST /api/workspace/nexus/workflows/:id/execute — 워크플로우 실행 (stub)
nexusRoute.post('/nexus/workflows/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [workflow] = await db
    .select()
    .from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WORKFLOW_001')
  if (!workflow.isActive) throw new HTTPError(400, '비활성 워크플로우는 실행할 수 없습니다', 'WORKFLOW_002')

  // 실행 레코드 생성
  const [execution] = await db
    .insert(nexusExecutions)
    .values({
      companyId: tenant.companyId,
      workflowId: id,
      status: 'running',
    })
    .returning()

  // Stub: 즉시 완료 처리
  const nodes = workflow.nodes as unknown[]
  const edges = workflow.edges as unknown[]
  const [completed] = await db
    .update(nexusExecutions)
    .set({
      status: 'completed',
      result: {
        message: '워크플로우 실행 완료 (stub)',
        nodeCount: Array.isArray(nodes) ? nodes.length : 0,
        edgeCount: Array.isArray(edges) ? edges.length : 0,
        executedAt: new Date().toISOString(),
      },
      completedAt: new Date(),
    })
    .where(eq(nexusExecutions.id, execution.id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `NEXUS: 워크플로우 실행 — ${workflow.name}`,
  })

  return c.json({ data: completed })
})

// GET /api/workspace/nexus/workflows/:id/executions — 실행 기록 조회
nexusRoute.get('/nexus/workflows/:id/executions', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // 워크플로우 존재 확인
  const [workflow] = await db
    .select({ id: nexusWorkflows.id })
    .from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WORKFLOW_001')

  const executions = await db
    .select()
    .from(nexusExecutions)
    .where(and(eq(nexusExecutions.workflowId, id), eq(nexusExecutions.companyId, tenant.companyId)))
    .orderBy(desc(nexusExecutions.startedAt))
    .limit(20)

  return c.json({ data: executions })
})

// POST /api/workspace/nexus/workflows/:id/clone — 워크플로우 복제
nexusRoute.post('/nexus/workflows/:id/clone', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [source] = await db
    .select()
    .from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)

  if (!source) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'WORKFLOW_001')

  const [cloned] = await db
    .insert(nexusWorkflows)
    .values({
      companyId: tenant.companyId,
      name: `${source.name} (복사)`.slice(0, 200),
      description: source.description,
      nodes: source.nodes,
      edges: source.edges,
      isTemplate: false,
      createdBy: tenant.userId,
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `NEXUS: 워크플로우 복제 — ${source.name}`,
  })

  return c.json({ data: cloned }, 201)
})
