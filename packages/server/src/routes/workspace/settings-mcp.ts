import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../../db'
import { mcpServers } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { mcpListTools, mcpCallTool, isPrivateUrl } from '../../lib/mcp-client'
import { checkMcpRateLimit } from '../../lib/mcp-rate-limit'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const settingsMcpRoute = new Hono<AppEnv>()

settingsMcpRoute.use('*', authMiddleware)

const MAX_SERVERS = 10

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url().refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' },
  ),
})

const testSchema = z.object({
  url: z.string().url().refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' },
  ),
})

// GET /settings/mcp — 서버 목록
settingsMcpRoute.get('/mcp', async (c) => {
  const { companyId } = c.get('tenant')

  const servers = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .orderBy(asc(mcpServers.createdAt))

  return c.json({ data: servers })
})

// POST /settings/mcp — 서버 등록 (관리자 전용)
settingsMcpRoute.post('/mcp', adminOnly, zValidator('json', createSchema), async (c) => {
  const { companyId, userId } = c.get('tenant')
  const body = c.req.valid('json')

  // 10개 제한 체크
  const existing = await db
    .select({ id: mcpServers.id })
    .from(mcpServers)
    .where(and(eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))

  if (existing.length >= MAX_SERVERS) {
    throw new HTTPError(400, `최대 ${MAX_SERVERS}개까지 등록 가능합니다`, 'MCP_001')
  }

  const [server] = await db
    .insert(mcpServers)
    .values({
      companyId,
      name: body.name,
      url: body.url,
      transport: 'http',
    })
    .returning()

  // 감사 로그
  logActivity({
    companyId,
    userId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: userId,
    action: 'mcp-server-register',
    detail: `MCP 서버 등록: ${body.name} (${body.url})`,
    metadata: { serverName: body.name, url: body.url, serverId: server.id },
  })

  return c.json({ data: server }, 201)
})

// DELETE /settings/mcp/:id — 서버 삭제 (관리자 전용, soft delete)
settingsMcpRoute.delete('/mcp/:id', adminOnly, async (c) => {
  const { companyId, userId } = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_002')

  const [deleted] = await db
    .update(mcpServers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(mcpServers.id, id))
    .returning()

  // 감사 로그
  logActivity({
    companyId,
    userId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: userId,
    action: 'mcp-server-delete',
    detail: `MCP 서버 삭제: ${existing.name} (${existing.url})`,
    metadata: { serverName: existing.name, url: existing.url, serverId: id },
  })

  return c.json({ data: deleted })
})

// POST /settings/mcp/test — 연결 테스트 (관리자 전용, 실제 MCP tools/list 호출)
settingsMcpRoute.post('/mcp/test', adminOnly, zValidator('json', testSchema), async (c) => {
  const { url } = c.req.valid('json')

  if (isPrivateUrl(url)) {
    return c.json({ success: false, toolCount: 0, message: '내부 네트워크 주소는 사용할 수 없습니다' })
  }

  try {
    const tools = await mcpListTools(url)
    return c.json({
      success: true,
      toolCount: tools.length,
      message: `연결 성공 (도구 ${tools.length}개 발견)`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '서버에 접근할 수 없습니다'
    return c.json({
      success: false,
      toolCount: 0,
      message: `연결 실패: ${msg}`,
    })
  }
})

// GET /settings/mcp/:id/tools — 도구 목록 (MCP tools/list 호출)
settingsMcpRoute.get('/mcp/:id/tools', async (c) => {
  const { companyId } = c.get('tenant')
  const id = c.req.param('id')

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_002')

  try {
    const tools = await mcpListTools(server.url)
    return c.json({ tools })
  } catch {
    return c.json({ tools: [], error: 'MCP 서버에서 도구 목록을 가져올 수 없습니다' })
  }
})

const executeSchema = z.object({
  serverId: z.string().uuid(),
  toolName: z.string().min(1),
  arguments: z.record(z.unknown()).default({}),
})

// POST /settings/mcp/execute — MCP 도구 실행
settingsMcpRoute.post('/mcp/execute', zValidator('json', executeSchema), async (c) => {
  const { companyId, userId } = c.get('tenant')
  const { serverId, toolName, arguments: args } = c.req.valid('json')

  // 속도 제한 체크
  const rateCheck = checkMcpRateLimit(userId)
  if (!rateCheck.allowed) {
    c.header('Retry-After', String(rateCheck.retryAfterSec || 60))
    throw new HTTPError(429, 'MCP 도구 실행 속도 제한 (분당 20회)', 'MCP_003')
  }

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, serverId), eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_002')

  try {
    const result = await mcpCallTool(server.url, toolName, args)

    // 감사 로그
    logActivity({
      companyId,
      userId,
      type: 'tool_call',
      phase: 'end',
      actorType: 'user',
      actorId: userId,
      action: 'mcp-tool-execute',
      detail: `MCP 도구 실행: ${toolName} (${server.name})`,
      metadata: { serverName: server.name, toolName, serverId },
    })

    return c.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'MCP 도구 실행 실패'

    logActivity({
      companyId,
      userId,
      type: 'tool_call',
      phase: 'error',
      actorType: 'user',
      actorId: userId,
      action: 'mcp-tool-execute',
      detail: `MCP 도구 실행 실패: ${toolName} (${server.name}) — ${msg}`,
      metadata: { serverName: server.name, toolName, serverId, error: msg },
    })

    return c.json({ result: null, error: msg }, 500)
  }
})

// GET /settings/mcp/:id/ping — 연결 상태 확인
settingsMcpRoute.get('/mcp/:id/ping', async (c) => {
  const { companyId } = c.get('tenant')
  const id = c.req.param('id')

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_002')

  // SSRF 방지: 등록 후 isPrivateUrl 정책이 강화될 수 있으므로 실행 시점에도 체크
  if (isPrivateUrl(server.url)) {
    return c.json({ status: 'error' })
  }

  try {
    // 가벼운 연결 확인: tools/list 대신 간단 HTTP POST로 MCP 서버 응답 여부만 확인
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    try {
      const res = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }),
        signal: controller.signal,
      })
      return c.json({ status: res.ok || res.status < 500 ? 'connected' : 'error' })
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    return c.json({ status: 'disconnected' })
  }
})
