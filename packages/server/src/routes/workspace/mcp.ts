import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { mcpServers } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const mcpRoute = new Hono<AppEnv>()
mcpRoute.use('*', authMiddleware)

const createMcpSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().min(1),
  transport: z.enum(['stdio', 'sse']).optional(),
  config: z.record(z.any()).optional(),
})

const updateMcpSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().min(1).optional(),
  transport: z.enum(['stdio', 'sse']).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/workspace/mcp/servers — MCP 서버 목록
mcpRoute.get('/servers', async (c) => {
  const tenant = c.get('tenant')
  const result = await db.select().from(mcpServers)
    .where(and(eq(mcpServers.companyId, tenant.companyId), eq(mcpServers.isActive, true)))
  return c.json({ data: result })
})

// POST /api/workspace/mcp/servers — MCP 서버 등록
mcpRoute.post('/servers', zValidator('json', createMcpSchema), async (c) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') throw new HTTPError(403, '관리자만 MCP 서버를 등록할 수 있습니다', 'AUTH_003')

  const body = c.req.valid('json')
  const [server] = await db.insert(mcpServers).values({
    companyId: tenant.companyId,
    ...body,
  }).returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `MCP 서버 등록: ${body.name}`,
  })

  return c.json({ data: server }, 201)
})

// PATCH /api/workspace/mcp/servers/:id — MCP 서버 수정
mcpRoute.patch('/servers/:id', zValidator('json', updateMcpSchema), async (c) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') throw new HTTPError(403, '관리자만 수정할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')
  const body = c.req.valid('json')
  const [updated] = await db.update(mcpServers)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, tenant.companyId)))
    .returning()

  if (!updated) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_001')
  return c.json({ data: updated })
})

// DELETE /api/workspace/mcp/servers/:id — MCP 서버 삭제
mcpRoute.delete('/servers/:id', async (c) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') throw new HTTPError(403, '관리자만 삭제할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')
  await db.update(mcpServers).set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, tenant.companyId)))
  return c.json({ data: { message: '삭제되었습니다' } })
})

// POST /api/workspace/mcp/servers/:id/test — MCP 서버 연결 테스트 (stub)
mcpRoute.post('/servers/:id/test', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [server] = await db.select().from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, tenant.companyId)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_001')

  // Stub: 실제로는 MCP 프로토콜로 연결 테스트
  return c.json({ data: { status: 'ok', tools: ['stub-tool-1', 'stub-tool-2'], latencyMs: 42 } })
})

// POST /api/workspace/mcp/servers/:id/execute — MCP 도구 실행 (stub)
const executeMcpSchema = z.object({
  toolName: z.string().min(1),
  input: z.record(z.any()).optional(),
})

mcpRoute.post('/servers/:id/execute', zValidator('json', executeMcpSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { toolName, input } = c.req.valid('json')

  const [server] = await db.select().from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, tenant.companyId)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_001')

  logActivity({
    companyId: tenant.companyId,
    type: 'tool_call',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `MCP 도구 실행: ${toolName} (${server.name})`,
  })

  // Stub response
  return c.json({
    data: {
      toolName,
      result: { message: `MCP 도구 '${toolName}' 실행 완료 (스텁)`, input },
      serverName: server.name,
    },
  })
})
