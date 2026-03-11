import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { canvasLayouts, agents, departments } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const nexusLayoutRoute = new Hono<AppEnv>()

nexusLayoutRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

const layoutDataSchema = z.object({
  nodePositions: z.record(z.string(), z.object({ x: z.number(), y: z.number() })),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
})

// GET /api/admin/nexus/layout — load saved NEXUS layout for tenant
nexusLayoutRoute.get('/nexus/layout', async (c) => {
  const tenant = c.get('tenant')

  const [layout] = await db
    .select()
    .from(canvasLayouts)
    .where(
      and(
        eq(canvasLayouts.companyId, tenant.companyId),
        eq(canvasLayouts.name, 'nexus'),
      ),
    )
    .limit(1)

  if (!layout) {
    return c.json({ success: true, data: null })
  }

  return c.json({ success: true, data: layout.layoutData })
})

// PUT /api/admin/nexus/layout — save/upsert NEXUS layout
nexusLayoutRoute.put(
  '/nexus/layout',
  zValidator('json', layoutDataSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    // Check if layout exists
    const [existing] = await db
      .select({ id: canvasLayouts.id })
      .from(canvasLayouts)
      .where(
        and(
          eq(canvasLayouts.companyId, tenant.companyId),
          eq(canvasLayouts.name, 'nexus'),
        ),
      )
      .limit(1)

    if (existing) {
      await db
        .update(canvasLayouts)
        .set({
          layoutData: body,
          updatedAt: new Date(),
        })
        .where(eq(canvasLayouts.id, existing.id))
    } else {
      await db.insert(canvasLayouts).values({
        companyId: tenant.companyId,
        name: 'nexus',
        layoutData: body,
        isDefault: true,
      })
    }

    return c.json({ success: true, data: { saved: true } })
  },
)

// PATCH /api/admin/nexus/agent/:id/department — 단일 에이전트 부서 이동
const reassignSchema = z.object({
  departmentId: z.string().uuid().nullable(),
})

nexusLayoutRoute.patch(
  '/nexus/agent/:id/department',
  zValidator('json', reassignSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const agentId = c.req.param('id')

    // Find agent and verify ownership
    const [agent] = await db
      .select({
        id: agents.id,
        name: agents.name,
        isSecretary: agents.isSecretary,
        departmentId: agents.departmentId,
      })
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
      .limit(1)

    if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

    // Secretary agents cannot be moved
    if (agent.isSecretary) {
      throw new HTTPError(403, '비서 에이전트는 이동할 수 없습니다', 'NEXUS_001')
    }

    const { departmentId } = c.req.valid('json')

    // Validate target department exists and belongs to same company
    if (departmentId) {
      const [dept] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(and(eq(departments.id, departmentId), eq(departments.companyId, tenant.companyId)))
        .limit(1)

      if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
    }

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

    return c.json({ success: true, data: updated })
  },
)

// PATCH /api/admin/nexus/agents/department — 일괄 에이전트 부서 이동
const batchReassignSchema = z.object({
  agentIds: z.array(z.string().uuid()).min(1).max(50),
  departmentId: z.string().uuid().nullable(),
})

nexusLayoutRoute.patch(
  '/nexus/agents/department',
  zValidator('json', batchReassignSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { agentIds, departmentId } = c.req.valid('json')

    // Validate target department if not null
    if (departmentId) {
      const [dept] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(and(eq(departments.id, departmentId), eq(departments.companyId, tenant.companyId)))
        .limit(1)

      if (!dept) throw new HTTPError(404, '부서를 찾을 수 없습니다', 'DEPT_001')
    }

    // Fetch all agents to check ownership and secretary status
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        isSecretary: agents.isSecretary,
        companyId: agents.companyId,
      })
      .from(agents)
      .where(eq(agents.companyId, tenant.companyId))

    const agentMap = new Map(allAgents.map((a) => [a.id, a]))

    const skippedReasons: string[] = []
    const movableIds: string[] = []

    for (const agentId of agentIds) {
      const agent = agentMap.get(agentId)
      if (!agent) {
        skippedReasons.push(`${agentId}: 에이전트를 찾을 수 없습니다`)
        continue
      }
      if (agent.isSecretary) {
        skippedReasons.push(`${agent.name}: 비서 에이전트는 이동할 수 없습니다`)
        continue
      }
      movableIds.push(agentId)
    }

    // Single DB query for all movable agents
    if (movableIds.length > 0) {
      await db
        .update(agents)
        .set({ departmentId, updatedAt: new Date() })
        .where(inArray(agents.id, movableIds))
    }

    const moved = movableIds.length

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `NEXUS: 에이전트 일괄 이동 — ${moved}명`,
      detail: departmentId ? `부서 ID: ${departmentId}` : '미배정',
    })

    return c.json({
      success: true,
      data: { moved, skipped: skippedReasons.length, skippedReasons },
    })
  },
)
