import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { chatSessions, chatMessages, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { TenantContext } from '@corthex/shared'

export const chatRoute = new Hono()

chatRoute.use('*', authMiddleware)

const createSessionSchema = z.object({
  agentId: z.string().uuid(),
  title: z.string().max(200).optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1),
})

// GET /api/workspace/chat/sessions — 내 채팅 세션 목록
chatRoute.get('/sessions', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const result = await db
    .select({
      id: chatSessions.id,
      agentId: chatSessions.agentId,
      title: chatSessions.title,
      lastMessageAt: chatSessions.lastMessageAt,
      createdAt: chatSessions.createdAt,
    })
    .from(chatSessions)
    .where(and(eq(chatSessions.userId, tenant.userId), eq(chatSessions.companyId, tenant.companyId)))
    .orderBy(desc(chatSessions.lastMessageAt))

  return c.json({ data: result })
})

// POST /api/workspace/chat/sessions — 새 채팅 세션 생성
chatRoute.post('/sessions', zValidator('json', createSessionSchema), async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const { agentId, title } = c.req.valid('json')

  // 에이전트가 내 회사 소속인지 확인
  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'CHAT_001')

  const [session] = await db
    .insert(chatSessions)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId,
      title: title || `${agent.name}와의 대화`,
    })
    .returning()

  return c.json({ data: session }, 201)
})

// GET /api/workspace/chat/sessions/:sessionId/messages — 세션 메시지 조회
chatRoute.get('/sessions/:sessionId/messages', async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const sessionId = c.req.param('sessionId')

  // 세션이 내 것인지 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, tenant.userId)))
    .limit(1)

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)

  return c.json({ data: messages })
})

// POST /api/workspace/chat/sessions/:sessionId/messages — 메시지 전송
chatRoute.post(
  '/sessions/:sessionId/messages',
  zValidator('json', sendMessageSchema),
  async (c) => {
    const tenant = c.get('tenant') as TenantContext
    const sessionId = c.req.param('sessionId')
    const { content } = c.req.valid('json')

    // 세션 소유권 확인
    const [session] = await db
      .select({ id: chatSessions.id, agentId: chatSessions.agentId })
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, tenant.userId)))
      .limit(1)

    if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

    // 유저 메시지 저장
    const [userMsg] = await db
      .insert(chatMessages)
      .values({
        companyId: tenant.companyId,
        sessionId,
        sender: 'user',
        content,
      })
      .returning()

    // 세션 lastMessageAt 업데이트
    await db
      .update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.id, sessionId))

    // TODO: E4에서 Claude CLI 연동 후 실제 AI 응답 생성
    // 지금은 placeholder 응답
    const [agentMsg] = await db
      .insert(chatMessages)
      .values({
        companyId: tenant.companyId,
        sessionId,
        sender: 'agent',
        content: `[AI 응답 준비 중] "${content}"에 대한 답변을 준비하고 있습니다. E4 에픽에서 Claude CLI 연동 후 실제 AI 응답이 제공됩니다.`,
      })
      .returning()

    return c.json({ data: { userMessage: userMsg, agentMessage: agentMsg } }, 201)
  },
)
