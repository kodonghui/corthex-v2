import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, lt } from 'drizzle-orm'
import { db } from '../../db'
import { chatSessions, chatMessages, agents, delegations, toolCalls } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { generateAgentResponse, generateAgentResponseStream } from '../../lib/ai'
import type { StreamEvent } from '../../lib/ai'
import { orchestrateSecretary } from '../../lib/orchestrator'
import { logActivity } from '../../lib/activity-logger'
import { broadcastToChannel } from '../../ws/channels'
import type { AppEnv } from '../../types'

export const chatRoute = new Hono<AppEnv>()

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
  const tenant = c.get('tenant')

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
  const tenant = c.get('tenant')
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

// GET /api/workspace/chat/sessions/:sessionId/messages — 세션 메시지 조회 (cursor 페이지네이션)
chatRoute.get('/sessions/:sessionId/messages', async (c) => {
  const tenant = c.get('tenant')
  const sessionId = c.req.param('sessionId')
  const before = c.req.query('before') // cursor: 이 메시지 ID보다 이전
  const rawLimit = Number(c.req.query('limit')) || 50
  const limit = Math.min(Math.max(rawLimit, 1), 100)

  // 세션이 내 것인지 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .limit(1)

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  // cursor가 있으면 해당 메시지의 createdAt보다 이전 것 조회
  const conditions = [eq(chatMessages.sessionId, sessionId)]
  if (before) {
    const [cursorMsg] = await db
      .select({ createdAt: chatMessages.createdAt })
      .from(chatMessages)
      .where(and(eq(chatMessages.id, before), eq(chatMessages.sessionId, sessionId)))
      .limit(1)
    if (cursorMsg) {
      conditions.push(lt(chatMessages.createdAt, cursorMsg.createdAt))
    }
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit + 1) // +1로 hasMore 판별

  const hasMore = messages.length > limit
  if (hasMore) messages.pop()
  messages.reverse() // createdAt ASC로 반환

  return c.json({ data: messages, hasMore })
})

// POST /api/workspace/chat/sessions/:sessionId/messages — 메시지 전송
chatRoute.post(
  '/sessions/:sessionId/messages',
  zValidator('json', sendMessageSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const sessionId = c.req.param('sessionId')
    const { content } = c.req.valid('json')

    // 세션 소유권 + 에이전트 정보 확인
    const [session] = await db
      .select({ id: chatSessions.id, agentId: chatSessions.agentId })
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
      .limit(1)

    if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

    // 에이전트가 비서인지 확인
    const [agent] = await db
      .select({ isSecretary: agents.isSecretary })
      .from(agents)
      .where(eq(agents.id, session.agentId))
      .limit(1)

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

    logActivity({
      companyId: tenant.companyId,
      type: 'chat',
      phase: 'start',
      actorType: 'user',
      actorId: tenant.userId,
      action: '채팅 메시지 전송',
      detail: content.slice(0, 100),
    })

    // AI 응답을 백그라운드에서 스트리밍 생성
    const chatCtx = {
      agentId: session.agentId,
      sessionId,
      companyId: tenant.companyId,
      userMessage: content,
      userId: tenant.userId,
    }

    const channelKey = `chat-stream::${sessionId}`

    const streamTask = async () => {
      try {
        let aiContent: string

        if (agent?.isSecretary) {
          // 비서: 기존 동기 방식 유지 (오케스트레이션은 스트리밍 불가)
          aiContent = await orchestrateSecretary({
            secretaryAgentId: session.agentId,
            ...chatCtx,
          })
          broadcastToChannel(channelKey, { type: 'token', content: aiContent })
          broadcastToChannel(channelKey, { type: 'done', sessionId })
        } else {
          // 일반 에이전트: 스트리밍
          aiContent = await generateAgentResponseStream(chatCtx, (event: StreamEvent) => {
            broadcastToChannel(channelKey, event)
          })
        }

        // 에이전트 메시지 DB 저장
        await db.insert(chatMessages).values({
          companyId: tenant.companyId,
          sessionId,
          sender: 'agent',
          content: aiContent,
        })

        // 첫 응답이면 세션 제목 업데이트
        const msgCount = await db
          .select({ id: chatMessages.id })
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, sessionId))
          .limit(3)
        if (msgCount.length <= 3) {
          const keywords = aiContent.match(/[가-힣a-zA-Z0-9]+/g)?.slice(0, 3).join(' ')
          if (keywords) {
            await db.update(chatSessions).set({ title: keywords.slice(0, 20) }).where(eq(chatSessions.id, sessionId))
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : '알 수 없는 오류'
        broadcastToChannel(channelKey, { type: 'error', code: 'AI_ERROR', message: errMsg })

        // 에러 메시지도 DB에 저장
        await db.insert(chatMessages).values({
          companyId: tenant.companyId,
          sessionId,
          sender: 'agent',
          content: `[AI 연결 오류] ${errMsg}`,
        })
      }
    }

    // 백그라운드 실행 — 응답을 기다리지 않음
    streamTask()

    return c.json({ data: { userMessage: userMsg } }, 201)
  },
)

const updateSessionSchema = z.object({
  title: z.string().min(1).max(200),
})

// PATCH /api/workspace/chat/sessions/:sessionId — 세션 제목 수정
chatRoute.patch('/sessions/:sessionId', zValidator('json', updateSessionSchema), async (c) => {
  const tenant = c.get('tenant')
  const sessionId = c.req.param('sessionId')
  const { title } = c.req.valid('json')

  const [session] = await db
    .update(chatSessions)
    .set({ title })
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .returning()

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  return c.json({ data: session })
})

// DELETE /api/workspace/chat/sessions/:sessionId — 세션 삭제
chatRoute.delete('/sessions/:sessionId', async (c) => {
  const tenant = c.get('tenant')
  const sessionId = c.req.param('sessionId')

  // 세션 소유권 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .limit(1)

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  // 종속 레코드 삭제: toolCalls → delegations → messages → session 순서
  await db.delete(toolCalls).where(eq(toolCalls.sessionId, sessionId))
  await db.delete(delegations).where(eq(delegations.sessionId, sessionId))
  await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId))
  await db.delete(chatSessions).where(eq(chatSessions.id, sessionId))

  return c.json({ data: { deleted: true } })
})

// GET /api/workspace/chat/sessions/:sessionId/delegations — 세션 위임 내역 조회
chatRoute.get('/sessions/:sessionId/delegations', async (c) => {
  const tenant = c.get('tenant')
  const sessionId = c.req.param('sessionId')

  // 세션 소유권 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .limit(1)

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  const result = await db
    .select({
      id: delegations.id,
      targetAgentId: delegations.targetAgentId,
      targetAgentName: agents.name,
      delegationPrompt: delegations.delegationPrompt,
      agentResponse: delegations.agentResponse,
      status: delegations.status,
      createdAt: delegations.createdAt,
      completedAt: delegations.completedAt,
    })
    .from(delegations)
    .innerJoin(agents, eq(delegations.targetAgentId, agents.id))
    .where(and(eq(delegations.sessionId, sessionId), eq(delegations.companyId, tenant.companyId)))
    .orderBy(delegations.createdAt)

  return c.json({ data: result })
})

// GET /api/workspace/chat/sessions/:sessionId/tool-calls — 세션 도구 호출 이력
chatRoute.get('/sessions/:sessionId/tool-calls', async (c) => {
  const tenant = c.get('tenant')
  const sessionId = c.req.param('sessionId')

  // 세션 소유권 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .limit(1)

  if (!session) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'CHAT_002')

  const result = await db
    .select({
      id: toolCalls.id,
      toolName: toolCalls.toolName,
      input: toolCalls.input,
      output: toolCalls.output,
      status: toolCalls.status,
      durationMs: toolCalls.durationMs,
      createdAt: toolCalls.createdAt,
    })
    .from(toolCalls)
    .where(and(eq(toolCalls.sessionId, sessionId), eq(toolCalls.companyId, tenant.companyId)))
    .orderBy(toolCalls.createdAt)

  return c.json({ data: result })
})
