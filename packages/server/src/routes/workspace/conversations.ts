import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, sql, lt } from 'drizzle-orm'
import { db } from '../../db'
import { conversations, conversationParticipants, messages, users, reports } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { broadcastToChannel } from '../../ws/channels'
import { ConversationService } from '../../services/messenger/conversation'
import type { AppEnv } from '../../types'

export const conversationsRoute = new Hono<AppEnv>()

conversationsRoute.use('*', authMiddleware)

const conversationService = new ConversationService()

// === Zod Schemas ===

const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']),
  participantIds: z.array(z.string().uuid()).min(2),
  name: z.string().max(255).optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'system', 'ai_report']).default('text'),
})

const addParticipantSchema = z.object({
  userId: z.string().uuid(),
})

const shareReportSchema = z.object({
  reportId: z.string().uuid(),
})

// === Helper: 참여자 검증 ===

async function assertParticipant(conversationId: string, userId: string, companyId: string) {
  const [participant] = await db
    .select({ participantUserId: conversationParticipants.userId })
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId),
      eq(conversationParticipants.companyId, companyId),
    ))
    .limit(1)

  if (!participant) throw new HTTPError(403, '대화방 참여자가 아닙니다', 'CONV_002')
}

// === 대화방 API ===

// POST /conversations — 대화방 생성
conversationsRoute.post(
  '/',
  zValidator('json', createConversationSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    // 본인이 참여자에 포함되어 있는지 확인
    if (!body.participantIds.includes(tenant.userId)) {
      body.participantIds.push(tenant.userId)
    }

    try {
      const conv = await conversationService.create(
        tenant.companyId,
        body.type,
        body.participantIds,
        body.name,
      )
      return c.json({ success: true, data: conv }, 201)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new HTTPError(400, message, 'CONV_001')
    }
  },
)

// GET /conversations — 대화방 목록
conversationsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const list = await conversationService.list(tenant.companyId, tenant.userId)
  return c.json({ success: true, data: list })
})

// GET /conversations/unread — 각 대화방별 unread count
conversationsRoute.get('/unread', async (c) => {
  const tenant = c.get('tenant')

  const participantRows = await db
    .select({
      conversationId: conversationParticipants.conversationId,
      lastReadAt: conversationParticipants.lastReadAt,
    })
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.companyId, tenant.companyId),
      eq(conversationParticipants.userId, tenant.userId),
    ))

  const unreadCounts: Array<{ conversationId: string; unreadCount: number }> = []

  for (const row of participantRows) {
    let unreadCount = 0
    if (row.lastReadAt) {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, row.conversationId),
          eq(messages.isDeleted, false),
          sql`${messages.createdAt} > ${row.lastReadAt}`,
        ))
      unreadCount = result?.count ?? 0
    } else {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, row.conversationId),
          eq(messages.isDeleted, false),
        ))
      unreadCount = result?.count ?? 0
    }
    if (unreadCount > 0) {
      unreadCounts.push({ conversationId: row.conversationId, unreadCount })
    }
  }

  return c.json({ success: true, data: unreadCounts })
})

// GET /conversations/:id — 대화방 상세
conversationsRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const conv = await conversationService.getById(id, tenant.companyId)
  if (!conv) throw new HTTPError(404, '대화방을 찾을 수 없습니다', 'CONV_003')

  // 참여자만 조회 가능
  const isParticipant = conv.participants.some((p) => p.userId === tenant.userId)
  if (!isParticipant) throw new HTTPError(403, '대화방 참여자가 아닙니다', 'CONV_002')

  return c.json({ success: true, data: conv })
})

// === 메시지 API ===

// POST /conversations/:id/messages — 메시지 전송
conversationsRoute.post(
  '/:id/messages',
  zValidator('json', sendMessageSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const conversationId = c.req.param('id')
    const body = c.req.valid('json')

    // 참여자 검증
    await assertParticipant(conversationId, tenant.userId, tenant.companyId)

    // 메시지 INSERT
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: tenant.userId,
        companyId: tenant.companyId,
        content: body.content,
        type: body.type,
      })
      .returning()

    // 대화방 updatedAt 갱신
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))

    // 본인 lastReadAt 자동 갱신
    await conversationService.markAsRead(conversationId, tenant.userId, tenant.companyId)

    const messageData = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      companyId: msg.companyId,
      content: msg.content,
      type: msg.type,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }

    // WebSocket 브로드캐스트
    broadcastToChannel(`conversation::${conversationId}`, {
      type: 'new-message',
      message: messageData,
    })

    return c.json({ success: true, data: messageData }, 201)
  },
)

// GET /conversations/:id/messages — 메시지 목록 (커서 페이지네이션)
conversationsRoute.get('/:id/messages', async (c) => {
  const tenant = c.get('tenant')
  const conversationId = c.req.param('id')
  const cursor = c.req.query('cursor') // ISO date string
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)

  // 참여자 검증
  await assertParticipant(conversationId, tenant.userId, tenant.companyId)

  const conditions = [
    eq(messages.conversationId, conversationId),
    eq(messages.companyId, tenant.companyId),
    eq(messages.isDeleted, false),
  ]

  if (cursor) {
    conditions.push(lt(messages.createdAt, new Date(cursor)))
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit + 1) // 다음 페이지 존재 여부 확인

  const hasMore = rows.length > limit
  const items = rows.slice(0, limit).map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    companyId: m.companyId,
    content: m.content,
    type: m.type,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }))

  const nextCursor = hasMore ? items[items.length - 1].createdAt : null

  return c.json({ success: true, data: { items, nextCursor, hasMore } })
})

// DELETE /conversations/:id/messages/:msgId — 메시지 soft delete
conversationsRoute.delete('/:id/messages/:msgId', async (c) => {
  const tenant = c.get('tenant')
  const conversationId = c.req.param('id')
  const msgId = c.req.param('msgId')

  // 참여자 검증
  await assertParticipant(conversationId, tenant.userId, tenant.companyId)

  // 본인 메시지만 삭제 가능
  const [msg] = await db
    .select({ senderId: messages.senderId })
    .from(messages)
    .where(and(
      eq(messages.id, msgId),
      eq(messages.conversationId, conversationId),
      eq(messages.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!msg) throw new HTTPError(404, '메시지를 찾을 수 없습니다', 'CONV_004')
  if (msg.senderId !== tenant.userId) {
    throw new HTTPError(403, '본인 메시지만 삭제할 수 있습니다', 'CONV_005')
  }

  await db
    .update(messages)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(messages.id, msgId))

  // WebSocket 브로드캐스트
  broadcastToChannel(`conversation::${conversationId}`, {
    type: 'message-deleted',
    messageId: msgId,
  })

  return c.json({ success: true, data: { id: msgId } })
})

// === 참여자 API ===

// POST /conversations/:id/participants — 참여자 추가 (그룹만)
conversationsRoute.post(
  '/:id/participants',
  zValidator('json', addParticipantSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const conversationId = c.req.param('id')
    const { userId } = c.req.valid('json')

    // 요청자가 참여자인지 검증
    await assertParticipant(conversationId, tenant.userId, tenant.companyId)

    try {
      await conversationService.addParticipant(conversationId, userId, tenant.companyId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new HTTPError(400, message, 'CONV_006')
    }

    // 사용자 이름 조회 (시스템 메시지용)
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    // 시스템 메시지 삽입
    const [sysMsg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: tenant.userId,
        companyId: tenant.companyId,
        content: `${user?.name || '알 수 없는 사용자'} 님이 참여했습니다`,
        type: 'system',
      })
      .returning()

    // WebSocket 브로드캐스트
    broadcastToChannel(`conversation::${conversationId}`, {
      type: 'participant-added',
      userId,
      systemMessage: {
        id: sysMsg.id,
        content: sysMsg.content,
        type: 'system',
        createdAt: sysMsg.createdAt.toISOString(),
      },
    })

    return c.json({ success: true, data: { userId } }, 201)
  },
)

// DELETE /conversations/:id/participants/me — 그룹 대화방 나가기
conversationsRoute.delete('/:id/participants/me', async (c) => {
  const tenant = c.get('tenant')
  const conversationId = c.req.param('id')

  // 대화방 타입 확인
  const conv = await conversationService.getById(conversationId, tenant.companyId)
  if (!conv) throw new HTTPError(404, '대화방을 찾을 수 없습니다', 'CONV_003')
  if (conv.type !== 'group') {
    throw new HTTPError(400, '1:1 대화방에서는 나갈 수 없습니다', 'CONV_007')
  }

  // 참여자 확인
  const isParticipant = conv.participants.some((p) => p.userId === tenant.userId)
  if (!isParticipant) throw new HTTPError(403, '대화방 참여자가 아닙니다', 'CONV_002')

  // 참여자 삭제 (companyId 격리 포함)
  await db.delete(conversationParticipants).where(and(
    eq(conversationParticipants.conversationId, conversationId),
    eq(conversationParticipants.userId, tenant.userId),
    eq(conversationParticipants.companyId, tenant.companyId),
  ))

  // 사용자 이름 조회
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, tenant.userId))
    .limit(1)

  // 시스템 메시지 삽입
  const [sysMsg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: tenant.userId,
      companyId: tenant.companyId,
      content: `${user?.name || '알 수 없는 사용자'} 님이 나갔습니다`,
      type: 'system',
    })
    .returning()

  // WebSocket 브로드캐스트
  broadcastToChannel(`conversation::${conversationId}`, {
    type: 'participant-left',
    userId: tenant.userId,
    systemMessage: {
      id: sysMsg.id,
      content: sysMsg.content,
      type: 'system',
      createdAt: sysMsg.createdAt.toISOString(),
    },
  })

  return c.json({ success: true, data: { userId: tenant.userId } })
})

// === 읽음 처리 API ===

// POST /conversations/:id/read — 읽음 처리
conversationsRoute.post('/:id/read', async (c) => {
  const tenant = c.get('tenant')
  const conversationId = c.req.param('id')

  await assertParticipant(conversationId, tenant.userId, tenant.companyId)
  await conversationService.markAsRead(conversationId, tenant.userId, tenant.companyId)

  // WebSocket read-receipt 브로드캐스트
  broadcastToChannel(`conversation::${conversationId}`, {
    type: 'read-receipt',
    userId: tenant.userId,
    lastReadAt: new Date().toISOString(),
  })

  return c.json({ success: true, data: { conversationId } })
})

// === 타이핑 표시 API ===

// POST /conversations/:id/typing — 타이핑 이벤트
conversationsRoute.post('/:id/typing', async (c) => {
  const tenant = c.get('tenant')
  const conversationId = c.req.param('id')

  // 참여자 검증은 WebSocket 구독 시 이미 완료되지만, REST로도 호출 가능하므로 검증
  await assertParticipant(conversationId, tenant.userId, tenant.companyId)

  broadcastToChannel(`conversation::${conversationId}`, {
    type: 'typing',
    userId: tenant.userId,
  })

  return c.json({ success: true })
})

// === 보고서 공유 API ===

// POST /conversations/:id/share-report — 보고서를 대화방에 공유
conversationsRoute.post(
  '/:id/share-report',
  zValidator('json', shareReportSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const conversationId = c.req.param('id')
    const { reportId } = c.req.valid('json')

    // 참여자 검증
    await assertParticipant(conversationId, tenant.userId, tenant.companyId)

    // 보고서 존재 + 접근 권한 확인
    const [report] = await db
      .select({
        id: reports.id,
        title: reports.title,
        content: reports.content,
      })
      .from(reports)
      .where(and(
        eq(reports.id, reportId),
        eq(reports.companyId, tenant.companyId),
      ))
      .limit(1)

    if (!report) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'CONV_008')

    // 보고서 요약 생성 (최대 200자)
    const summary = report.content
      ? report.content.replace(/[#*`\n]/g, ' ').trim().slice(0, 200)
      : ''

    const contentJson = JSON.stringify({
      reportId: report.id,
      title: report.title,
      summary,
    })

    // ai_report 메시지 INSERT
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: tenant.userId,
        companyId: tenant.companyId,
        content: contentJson,
        type: 'ai_report',
      })
      .returning()

    // 대화방 updatedAt 갱신
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))

    // 본인 lastReadAt 자동 갱신
    await conversationService.markAsRead(conversationId, tenant.userId, tenant.companyId)

    const messageData = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      companyId: msg.companyId,
      content: msg.content,
      type: msg.type,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }

    // WebSocket 브로드캐스트
    broadcastToChannel(`conversation::${conversationId}`, {
      type: 'new-message',
      message: messageData,
    })

    return c.json({ success: true, data: messageData }, 201)
  },
)
