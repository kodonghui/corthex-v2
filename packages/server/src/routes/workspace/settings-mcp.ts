import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../../db'
import { mcpServers } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
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

// POST /settings/mcp — 서버 등록
settingsMcpRoute.post('/mcp', zValidator('json', createSchema), async (c) => {
  const { companyId } = c.get('tenant')
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
      transport: 'stdio',
    })
    .returning()

  return c.json({ data: server }, 201)
})

// DELETE /settings/mcp/:id — 서버 삭제 (soft delete)
settingsMcpRoute.delete('/mcp/:id', async (c) => {
  const { companyId } = c.get('tenant')
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

  return c.json({ data: deleted })
})

// SSRF 방지: 내부 네트워크 IP 차단
function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (host === '0.0.0.0' || host === '[::]') return true
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host)) return true
    if (host === '169.254.169.254') return true // AWS metadata
    return false
  } catch {
    return false
  }
}

async function safeFetch(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    return res
  } catch {
    const controller2 = new AbortController()
    const timeout2 = setTimeout(() => controller2.abort(), timeoutMs)
    try {
      const res = await fetch(url, { method: 'GET', signal: controller2.signal })
      return res
    } finally {
      clearTimeout(timeout2)
    }
  } finally {
    clearTimeout(timeout)
  }
}

// POST /settings/mcp/test — 연결 테스트 (stub)
settingsMcpRoute.post('/mcp/test', zValidator('json', testSchema), async (c) => {
  const { url } = c.req.valid('json')

  if (isPrivateUrl(url)) {
    return c.json({ success: false, toolCount: 0, message: '내부 네트워크 주소는 사용할 수 없습니다' })
  }

  try {
    const res = await safeFetch(url, 5000)
    return c.json({
      success: res.ok || res.status < 500,
      toolCount: 0,
      message: '연결 성공',
    })
  } catch {
    return c.json({
      success: false,
      toolCount: 0,
      message: '연결 실패: 서버에 접근할 수 없습니다',
    })
  }
})

// GET /settings/mcp/:id/tools — 도구 목록 (stub)
settingsMcpRoute.get('/mcp/:id/tools', async (c) => {
  const { companyId } = c.get('tenant')
  const id = c.req.param('id')

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(and(eq(mcpServers.id, id), eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))
    .limit(1)

  if (!server) throw new HTTPError(404, 'MCP 서버를 찾을 수 없습니다', 'MCP_002')

  // Stub: 실제 MCP 프로토콜 연동은 Story 18-2에서 구현
  return c.json({ tools: [] })
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

  try {
    const res = await safeFetch(server.url, 3000)
    return c.json({ status: res.ok || res.status < 500 ? 'connected' : 'error' })
  } catch {
    return c.json({ status: 'disconnected' })
  }
})
