import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { companies, departments, agents, canvasLayouts, nexusWorkflows, nexusExecutions } from '../../db/schema'
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

// === 17-2/3: 워크플로우 CRUD + 실행 ===

// GET /api/workspace/nexus/workflows — 워크플로우 목록
nexusRoute.get('/nexus/workflows', async (c) => {
  const tenant = c.get('tenant')
  const result = await db.select({
    id: nexusWorkflows.id,
    name: nexusWorkflows.name,
    description: nexusWorkflows.description,
    isTemplate: nexusWorkflows.isTemplate,
    createdAt: nexusWorkflows.createdAt,
    updatedAt: nexusWorkflows.updatedAt,
  }).from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.companyId, tenant.companyId), eq(nexusWorkflows.isActive, true)))
    .orderBy(desc(nexusWorkflows.updatedAt))
  return c.json({ data: result })
})

// POST /api/workspace/nexus/workflows — 워크플로우 생성
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
})

nexusRoute.post('/nexus/workflows', zValidator('json', createWorkflowSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const [workflow] = await db.insert(nexusWorkflows).values({
    companyId: tenant.companyId,
    createdBy: tenant.userId,
    name: body.name,
    description: body.description,
    nodes: body.nodes || [],
    edges: body.edges || [],
  }).returning()
  return c.json({ data: workflow }, 201)
})

// GET /api/workspace/nexus/templates — 공유 템플릿 목록
nexusRoute.get('/nexus/templates', async (c) => {
  const tenant = c.get('tenant')
  const result = await db.select({
    id: nexusWorkflows.id,
    name: nexusWorkflows.name,
    description: nexusWorkflows.description,
    createdAt: nexusWorkflows.createdAt,
  }).from(nexusWorkflows)
    .where(and(
      eq(nexusWorkflows.companyId, tenant.companyId),
      eq(nexusWorkflows.isTemplate, true),
      eq(nexusWorkflows.isActive, true),
    ))
  return c.json({ data: result })
})

// POST /api/workspace/nexus/templates/:id/clone — 템플릿으로부터 복사
nexusRoute.post('/nexus/templates/:id/clone', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [template] = await db.select().from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.isTemplate, true)))
    .limit(1)
  if (!template) throw new HTTPError(404, '템플릿을 찾을 수 없습니다', 'NEXUS_002')

  const [cloned] = await db.insert(nexusWorkflows).values({
    companyId: tenant.companyId,
    createdBy: tenant.userId,
    name: `${template.name} (복사)`,
    description: template.description,
    nodes: template.nodes,
    edges: template.edges,
    isTemplate: false,
  }).returning()

  return c.json({ data: cloned }, 201)
})

// GET /api/workspace/nexus/workflows/:id — 워크플로우 상세
nexusRoute.get('/nexus/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [workflow] = await db.select().from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)
  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NEXUS_001')
  return c.json({ data: workflow })
})

// PUT /api/workspace/nexus/workflows/:id — 워크플로우 수정
nexusRoute.put('/nexus/workflows/:id', zValidator('json', createWorkflowSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [updated] = await db.update(nexusWorkflows)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .returning()
  if (!updated) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NEXUS_001')
  return c.json({ data: updated })
})

// DELETE /api/workspace/nexus/workflows/:id
nexusRoute.delete('/nexus/workflows/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  await db.update(nexusWorkflows).set({ isActive: false })
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
  return c.json({ data: { message: '삭제되었습니다' } })
})

// POST /api/workspace/nexus/workflows/:id/execute — 워크플로우 실행 (stub)
nexusRoute.post('/nexus/workflows/:id/execute', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [workflow] = await db.select().from(nexusWorkflows)
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .limit(1)

  if (!workflow) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NEXUS_001')

  const [execution] = await db.insert(nexusExecutions).values({
    companyId: tenant.companyId,
    workflowId: id,
    status: 'completed',
    result: { message: '워크플로우 실행 완료 (스텁)', nodeCount: (workflow.nodes as any[]).length },
    completedAt: new Date(),
  }).returning()

  return c.json({ data: execution }, 201)
})

// GET /api/workspace/nexus/workflows/:id/executions — 실행 이력
nexusRoute.get('/nexus/workflows/:id/executions', async (c) => {
  const tenant = c.get('tenant')
  const workflowId = c.req.param('id')
  const result = await db.select().from(nexusExecutions)
    .where(and(eq(nexusExecutions.workflowId, workflowId), eq(nexusExecutions.companyId, tenant.companyId)))
    .orderBy(desc(nexusExecutions.startedAt))
    .limit(20)
  return c.json({ data: result })
})

// POST /api/workspace/nexus/workflows/:id/share — 템플릿 공유
nexusRoute.post('/nexus/workflows/:id/share', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [updated] = await db.update(nexusWorkflows)
    .set({ isTemplate: true, updatedAt: new Date() })
    .where(and(eq(nexusWorkflows.id, id), eq(nexusWorkflows.companyId, tenant.companyId)))
    .returning()
  if (!updated) throw new HTTPError(404, '워크플로우를 찾을 수 없습니다', 'NEXUS_001')
  return c.json({ data: updated })
})
