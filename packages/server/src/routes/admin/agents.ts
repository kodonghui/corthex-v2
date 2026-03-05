import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { agents } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const agentsRoute = new Hono<AppEnv>()

agentsRoute.use('*', authMiddleware, adminOnly)

const createAgentSchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid(),
  departmentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  role: z.string().max(200).optional(),
  soul: z.string().optional(),
})

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().max(200).nullable().optional(),
  soul: z.string().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  status: z.enum(['online', 'working', 'error', 'offline']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/agents?companyId=xxx
agentsRoute.get('/agents', async (c) => {
  const companyId = c.req.query('companyId')
  const query = db.select().from(agents)
  const result = companyId
    ? await query.where(eq(agents.companyId, companyId))
    : await query
  return c.json({ data: result })
})

// GET /api/admin/agents/:id
agentsRoute.get('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [agent] = await db.select().from(agents).where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId))).limit(1)
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  return c.json({ data: agent })
})

// POST /api/admin/agents
agentsRoute.post('/agents', zValidator('json', createAgentSchema), async (c) => {
  const body = c.req.valid('json')
  const [agent] = await db
    .insert(agents)
    .values({ ...body, adminSoul: body.soul || null, status: 'offline' })
    .returning()
  return c.json({ data: agent }, 201)
})

// PATCH /api/admin/agents/:id
agentsRoute.patch('/agents/:id', zValidator('json', updateAgentSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const tenant = c.get('tenant')
  // 관리자가 soul을 변경하면 admin_soul도 동시 업데이트
  const [agent] = await db
    .update(agents)
    .set({
      ...body,
      ...(body.soul !== undefined ? { adminSoul: body.soul } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .returning()
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  return c.json({ data: agent })
})

// DELETE /api/admin/agents/:id — 비활성화
agentsRoute.delete('/agents/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [agent] = await db
    .update(agents)
    .set({ isActive: false, status: 'offline', updatedAt: new Date() })
    .where(and(eq(agents.id, id), eq(agents.companyId, tenant.companyId)))
    .returning()
  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')
  return c.json({ data: { message: '비활성화되었습니다' } })
})
