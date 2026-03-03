import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { tools, agentTools, reportLines } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'

export const toolsRoute = new Hono()

toolsRoute.use('*', authMiddleware, adminOnly)

// === Tools ===

const createToolSchema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scope: z.enum(['platform', 'company', 'department']).default('platform'),
  config: z.record(z.unknown()).optional(),
})

// GET /api/admin/tools
toolsRoute.get('/tools', async (c) => {
  const companyId = c.req.query('companyId')
  const result = companyId
    ? await db.select().from(tools).where(eq(tools.companyId, companyId))
    : await db.select().from(tools)
  return c.json({ data: result })
})

// POST /api/admin/tools
toolsRoute.post('/tools', zValidator('json', createToolSchema), async (c) => {
  const body = c.req.valid('json')
  const [tool] = await db.insert(tools).values(body).returning()
  return c.json({ data: tool }, 201)
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

// === Report Lines (보고 라인) ===

const createReportLineSchema = z.object({
  companyId: z.string().uuid(),
  reporterId: z.string().uuid(),
  supervisorId: z.string().uuid(),
})

// GET /api/admin/report-lines?companyId=xxx
toolsRoute.get('/report-lines', async (c) => {
  const companyId = c.req.query('companyId')
  if (!companyId) throw new HTTPError(400, 'companyId 파라미터가 필요합니다', 'RPT_001')
  const result = await db.select().from(reportLines).where(eq(reportLines.companyId, companyId))
  return c.json({ data: result })
})

// POST /api/admin/report-lines
toolsRoute.post('/report-lines', zValidator('json', createReportLineSchema), async (c) => {
  const body = c.req.valid('json')
  const [line] = await db.insert(reportLines).values(body).returning()
  return c.json({ data: line }, 201)
})

// DELETE /api/admin/report-lines/:id
toolsRoute.delete('/report-lines/:id', async (c) => {
  const id = c.req.param('id')
  const [line] = await db.delete(reportLines).where(eq(reportLines.id, id)).returning()
  if (!line) throw new HTTPError(404, '보고 라인을 찾을 수 없습니다', 'RPT_002')
  return c.json({ data: { message: '삭제되었습니다' } })
})
