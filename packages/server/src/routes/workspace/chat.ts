import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { chatSessions, chatMessages, agents, delegations } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { generateAgentResponse } from '../../lib/ai'
import { orchestrateSecretary } from '../../lib/orchestrator'
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

    // 세션 소유권 + 에이전트 정보 확인
    const [session] = await db
      .select({ id: chatSessions.id, agentId: chatSessions.agentId })
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, tenant.userId)))
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

    // AI 응답 생성 — 비서면 오케스트레이션, 아니면 직접 대화
    let aiContent: string
    try {
      if (agent?.isSecretary) {
        // 비서 오케스트레이션: 분석 → 부서 위임 → 종합 보고서
        aiContent = await orchestrateSecretary({
          secretaryAgentId: session.agentId,
          sessionId,
          companyId: tenant.companyId,
          userMessage: content,
        })
      } else {
        // 일반 에이전트: 직접 대화
        aiContent = await generateAgentResponse({
          agentId: session.agentId,
          sessionId,
          companyId: tenant.companyId,
          userMessage: content,
        })
      }
    } catch (err) {
      aiContent = `[AI 연결 오류] ${err instanceof Error ? err.message : '알 수 없는 오류'}. 관리자에게 ANTHROPIC_API_KEY 설정을 확인해주세요.`
    }

    const [agentMsg] = await db
      .insert(chatMessages)
      .values({
        companyId: tenant.companyId,
        sessionId,
        sender: 'agent',
        content: aiContent,
      })
      .returning()

    return c.json({ data: { userMessage: userMsg, agentMessage: agentMsg } }, 201)
  },
)

// GET /api/workspace/chat/sessions/:sessionId/delegations — 세션 위임 내역 조회
chatRoute.get('/sessions/:sessionId/delegations', async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const sessionId = c.req.param('sessionId')

  // 세션 소유권 확인
  const [session] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, tenant.userId)))
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
    .where(eq(delegations.sessionId, sessionId))
    .orderBy(delegations.createdAt)

  return c.json({ data: result })
})
