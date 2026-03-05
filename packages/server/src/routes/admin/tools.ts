import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { toolDefinitions, agentTools } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { registry } from '../../lib/tool-handlers'

import type { AppEnv } from '../../types'

export const toolsRoute = new Hono<AppEnv>()

toolsRoute.use('*', authMiddleware, adminOnly)

// === Tools ===

const createToolSchema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scope: z.enum(['platform', 'company', 'department']).default('platform'),
  handler: z.string().max(100).optional(),
  inputSchema: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
})

const updateToolSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  handler: z.string().max(100).nullable().optional(),
  inputSchema: z.record(z.unknown()).nullable().optional(),
  config: z.record(z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/tools
toolsRoute.get('/tools', async (c) => {
  const companyId = c.req.query('companyId')
  const result = companyId
    ? await db.select().from(toolDefinitions).where(eq(toolDefinitions.companyId, companyId))
    : await db.select().from(toolDefinitions)

  const data = result.map((t) => ({
    ...t,
    handlerRegistered: t.handler ? !!registry.get(t.handler) : false,
  }))
  return c.json({ data })
})

// GET /api/admin/tools/:id
toolsRoute.get('/tools/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [tool] = await db.select().from(toolDefinitions).where(and(
    eq(toolDefinitions.id, id),
    or(isNull(toolDefinitions.companyId), eq(toolDefinitions.companyId, tenant.companyId)),
  )).limit(1)
  if (!tool) throw new HTTPError(404, '도구를 찾을 수 없습니다', 'TOOL_003')

  return c.json({
    data: {
      ...tool,
      handlerRegistered: tool.handler ? !!registry.get(tool.handler) : false,
    },
  })
})

// POST /api/admin/tools
toolsRoute.post('/tools', zValidator('json', createToolSchema), async (c) => {
  const body = c.req.valid('json')
  const [tool] = await db.insert(toolDefinitions).values(body).returning()

  return c.json({
    data: {
      ...tool,
      handlerRegistered: tool.handler ? !!registry.get(tool.handler) : false,
    },
  }, 201)
})

// PUT /api/admin/tools/:id
toolsRoute.put('/tools/:id', zValidator('json', updateToolSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const companyFilter = and(
    eq(toolDefinitions.id, id),
    or(isNull(toolDefinitions.companyId), eq(toolDefinitions.companyId, tenant.companyId)),
  )
  const [existing] = await db.select({ id: toolDefinitions.id }).from(toolDefinitions).where(companyFilter).limit(1)
  if (!existing) throw new HTTPError(404, '도구를 찾을 수 없습니다', 'TOOL_003')

  const [updated] = await db.update(toolDefinitions).set(body).where(companyFilter).returning()

  return c.json({
    data: {
      ...updated,
      handlerRegistered: updated.handler ? !!registry.get(updated.handler) : false,
    },
  })
})

// === Agent-Tool Mapping ===

const assignToolSchema = z.object({
  companyId: z.string().uuid(),
  agentId: z.string().uuid(),
  toolId: z.string().uuid(),
  isEnabled: z.boolean().default(true),
})

// GET /api/admin/agent-tools?agentId=xxx
toolsRoute.get('/agent-tools', async (c) => {
  const agentId = c.req.query('agentId')
  if (!agentId) throw new HTTPError(400, 'agentId 파라미터가 필요합니다', 'TOOL_001')
  const result = await db.select().from(agentTools).where(eq(agentTools.agentId, agentId))
  return c.json({ data: result })
})

// POST /api/admin/agent-tools — 도구 할당
toolsRoute.post('/agent-tools', zValidator('json', assignToolSchema), async (c) => {
  const body = c.req.valid('json')
  const [mapping] = await db.insert(agentTools).values(body).returning()
  return c.json({ data: mapping }, 201)
})

// PATCH /api/admin/agent-tools/:id — 토글 on/off
toolsRoute.patch('/agent-tools/:id', async (c) => {
  const id = c.req.param('id')
  const { isEnabled } = await c.req.json<{ isEnabled: boolean }>()
  const [mapping] = await db
    .update(agentTools)
    .set({ isEnabled })
    .where(eq(agentTools.id, id))
    .returning()
  if (!mapping) throw new HTTPError(404, '매핑을 찾을 수 없습니다', 'TOOL_002')
  return c.json({ data: mapping })
})

// DELETE /api/admin/agent-tools/:id
toolsRoute.delete('/agent-tools/:id', async (c) => {
  const id = c.req.param('id')
  const [mapping] = await db.delete(agentTools).where(eq(agentTools.id, id)).returning()
  if (!mapping) throw new HTTPError(404, '매핑을 찾을 수 없습니다', 'TOOL_002')
  return c.json({ data: { message: '삭제되었습니다' } })
})
