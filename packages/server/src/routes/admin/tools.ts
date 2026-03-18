import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, or, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { toolDefinitions, agentTools, agents } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { registry } from '../../lib/tool-handlers'
import { createAuditLog } from '../../services/audit-log'

import type { AppEnv } from '../../types'

export const toolsRoute = new Hono<AppEnv>()

toolsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

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
  const tenant = c.get('tenant')
  const result = await db.select().from(toolDefinitions).where(
    or(isNull(toolDefinitions.companyId), eq(toolDefinitions.companyId, tenant.companyId)),
  )

  const data = result.map((t) => ({
    ...t,
    handlerRegistered: t.handler ? !!registry.get(t.handler) : false,
  }))
  return c.json({ success: true, data })
})

// GET /api/admin/tools/catalog -- grouped by category (MUST be before /tools/:id)
toolsRoute.get('/tools/catalog', async (c) => {
  const tenant = c.get('tenant')

  // Get tools from DB (with category metadata)
  const dbTools = await db.select().from(toolDefinitions).where(
    or(isNull(toolDefinitions.companyId), eq(toolDefinitions.companyId, tenant.companyId)),
  )

  // Get handler names from registry
  const registeredHandlers = new Set(registry.list())

  // Build catalog grouped by category
  const categoryMap = new Map<string, Array<{
    name: string
    description: string | null
    category: string
    registered: boolean
  }>>()

  for (const tool of dbTools) {
    if (!tool.isActive) continue
    const cat = tool.category || 'common'
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push({
      name: tool.handler || tool.name,
      description: tool.description,
      category: cat,
      registered: tool.handler ? registeredHandlers.has(tool.handler) : false,
    })
  }

  // Sort categories and tools
  const categories = ['common', 'finance', 'legal', 'marketing', 'tech']
  const data = categories
    .filter((cat) => categoryMap.has(cat))
    .map((cat) => ({
      category: cat,
      tools: categoryMap.get(cat)!.sort((a, b) => a.name.localeCompare(b.name)),
    }))

  // Add any unknown categories at the end
  for (const [cat, tools] of categoryMap) {
    if (!categories.includes(cat)) {
      data.push({ category: cat, tools: tools.sort((a, b) => a.name.localeCompare(b.name)) })
    }
  }

  return c.json({ success: true, data })
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
    success: true,
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
    success: true,
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
    success: true,
    data: {
      ...updated,
      handlerRegistered: updated.handler ? !!registry.get(updated.handler) : false,
    },
  })
})

// === Agent Allowed Tools Management ===

const updateAllowedToolsSchema = z.object({
  allowedTools: z.array(z.string()),
})

const batchAllowedToolsSchema = z.object({
  category: z.string().min(1),
  action: z.enum(['add', 'remove']),
})

// PATCH /api/admin/agents/:id/allowed-tools -- replace allowedTools
toolsRoute.patch('/agents/:id/allowed-tools', zValidator('json', updateAllowedToolsSchema), async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('id')
  const { allowedTools } = c.req.valid('json')

  // Get current agent
  const [current] = await db.select()
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!current) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const before = (current.allowedTools as string[]) || []
  const added = allowedTools.filter((t) => !before.includes(t))
  const removed = before.filter((t) => !allowedTools.includes(t))

  // Update
  const [updated] = await db.update(agents)
    .set({ allowedTools, updatedAt: new Date() })
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .returning()

  // Audit log
  if (added.length > 0 || removed.length > 0) {
    createAuditLog({
      companyId: tenant.companyId,
      actorType: tenant.isAdminUser ? 'admin_user' : 'user',
      actorId: tenant.userId,
      action: 'agent.allowedTools.update',
      targetType: 'agent',
      targetId: agentId,
      before: { allowedTools: before },
      after: { allowedTools },
      metadata: { added, removed },
    }).catch(() => {})
  }

  return c.json({ success: true, data: { id: updated.id, name: updated.name, allowedTools: updated.allowedTools } })
})

// PATCH /api/admin/agents/:id/allowed-tools/batch -- category bulk add/remove
toolsRoute.patch('/agents/:id/allowed-tools/batch', zValidator('json', batchAllowedToolsSchema), async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('id')
  const { category, action } = c.req.valid('json')

  // Get tools in this category from DB
  const categoryTools = await db.select({ handler: toolDefinitions.handler })
    .from(toolDefinitions)
    .where(
      and(
        eq(toolDefinitions.category, category),
        eq(toolDefinitions.isActive, true),
        or(isNull(toolDefinitions.companyId), eq(toolDefinitions.companyId, tenant.companyId)),
      ),
    )

  const categoryToolNames = categoryTools
    .map((t) => t.handler)
    .filter((h): h is string => !!h)

  if (categoryToolNames.length === 0) {
    throw new HTTPError(404, `카테고리 "${category}"에 도구가 없습니다`, 'TOOL_005')
  }

  // Get current agent
  const [current] = await db.select()
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!current) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const before = (current.allowedTools as string[]) || []
  let newAllowed: string[]

  if (action === 'add') {
    newAllowed = [...new Set([...before, ...categoryToolNames])]
  } else {
    const removeSet = new Set(categoryToolNames)
    newAllowed = before.filter((t) => !removeSet.has(t))
  }

  const added = newAllowed.filter((t) => !before.includes(t))
  const removed = before.filter((t) => !newAllowed.includes(t))

  // Update
  const [updated] = await db.update(agents)
    .set({ allowedTools: newAllowed, updatedAt: new Date() })
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .returning()

  // Audit log
  if (added.length > 0 || removed.length > 0) {
    createAuditLog({
      companyId: tenant.companyId,
      actorType: tenant.isAdminUser ? 'admin_user' : 'user',
      actorId: tenant.userId,
      action: 'agent.allowedTools.batch',
      targetType: 'agent',
      targetId: agentId,
      before: { allowedTools: before },
      after: { allowedTools: newAllowed },
      metadata: { category, batchAction: action, added, removed },
    }).catch(() => {})
  }

  return c.json({ success: true, data: { id: updated.id, name: updated.name, allowedTools: updated.allowedTools } })
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
  const tenant = c.get('tenant')
  const agentId = c.req.query('agentId')
  if (!agentId) throw new HTTPError(400, 'agentId 파라미터가 필요합니다', 'TOOL_001')
  const result = await db.select().from(agentTools).where(
    and(eq(agentTools.agentId, agentId), eq(agentTools.companyId, tenant.companyId)),
  )
  return c.json({ success: true, data: result })
})

// POST /api/admin/agent-tools — 도구 할당
toolsRoute.post('/agent-tools', zValidator('json', assignToolSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  if (body.companyId !== tenant.companyId) throw new HTTPError(403, '다른 회사의 도구를 할당할 수 없습니다', 'TOOL_004')
  const [mapping] = await db.insert(agentTools).values(body).returning()
  return c.json({ success: true, data: mapping }, 201)
})

// PATCH /api/admin/agent-tools/:id — 토글 on/off
toolsRoute.patch('/agent-tools/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { isEnabled } = await c.req.json<{ isEnabled: boolean }>()
  const [mapping] = await db
    .update(agentTools)
    .set({ isEnabled })
    .where(and(eq(agentTools.id, id), eq(agentTools.companyId, tenant.companyId)))
    .returning()
  if (!mapping) throw new HTTPError(404, '매핑을 찾을 수 없습니다', 'TOOL_002')
  return c.json({ success: true, data: mapping })
})

// DELETE /api/admin/agent-tools/:id
toolsRoute.delete('/agent-tools/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [mapping] = await db.delete(agentTools).where(
    and(eq(agentTools.id, id), eq(agentTools.companyId, tenant.companyId)),
  ).returning()
  if (!mapping) throw new HTTPError(404, '매핑을 찾을 수 없습니다', 'TOOL_002')
  return c.json({ success: true, data: { message: '삭제되었습니다' } })
})
