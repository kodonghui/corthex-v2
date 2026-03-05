import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'
import { db } from '../../db'
import { messengerChannels, messengerMembers, messengerMessages, messengerReactions, users } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const messengerRoute = new Hono<AppEnv>()

messengerRoute.use('*', authMiddleware)

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1),
  parentMessageId: z.string().uuid().optional(),
  fileId: z.string().uuid().optional(),
})

const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid(),
})

// 멤버 확인 헬퍼
async function assertMember(channelId: string, userId: string, companyId: string) {
  const [member] = await db
    .select({ id: messengerMembers.id })
    .from(messengerMembers)
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.userId, userId),
      eq(messengerMembers.companyId, companyId),
    ))
    .limit(1)

  if (!member) throw new HTTPError(403, '채널 멤버가 아닙니다', 'MSG_002')
}

// GET /messenger/channels — 내가 참여한 채널 목록
messengerRoute.get('/channels', async (c) => {
  const tenant = c.get('tenant')

  // 내가 멤버인 채널 ID 찾기
  const myMemberships = await db
    .select({ channelId: messengerMembers.channelId })
    .from(messengerMembers)
    .where(and(
      eq(messengerMembers.userId, tenant.userId),
      eq(messengerMembers.companyId, tenant.companyId),
    ))

  if (myMemberships.length === 0) return c.json({ data: [] })

  const channelIds = myMemberships.map((m) => m.channelId)

  const channels = await db
    .select({
      id: messengerChannels.id,
      name: messengerChannels.name,
      description: messengerChannels.description,
      createdBy: messengerChannels.createdBy,
      createdAt: messengerChannels.createdAt,
    })
    .from(messengerChannels)
    .where(and(
      inArray(messengerChannels.id, channelIds),
      eq(messengerChannels.companyId, tenant.companyId),
      eq(messengerChannels.isActive, true),
    ))
    .orderBy(messengerChannels.createdAt)

  return c.json({ data: channels })
})

// POST /messenger/channels — 채널 생성
messengerRoute.post('/channels', zValidator('json', createChannelSchema), async (c) => {
  const tenant = c.get('tenant')
  const { name, description, memberIds } = c.req.valid('json')

  const [channel] = await db
    .insert(messengerChannels)
    .values({
      companyId: tenant.companyId,
      name,
      description,
      createdBy: tenant.userId,
    })
    .returning()

  // 생성자를 자동으로 멤버에 추가
  const membersToAdd = [tenant.userId, ...(memberIds || []).filter((id) => id !== tenant.userId)]

  await db.insert(messengerMembers).values(
    membersToAdd.map((uid) => ({
      companyId: tenant.companyId,
      channelId: channel.id,
      userId: uid,
    })),
  )

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `메신저 채널 생성: ${name}`,
  })

  return c.json({ data: channel }, 201)
})

// GET /messenger/channels/:id/messages — 메시지 조회
messengerRoute.get('/channels/:id/messages', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const before = c.req.query('before')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  let query = db
    .select({
      id: messengerMessages.id,
      userId: messengerMessages.userId,
      userName: users.name,
      content: messengerMessages.content,
      createdAt: messengerMessages.createdAt,
    })
    .from(messengerMessages)
    .innerJoin(users, eq(messengerMessages.userId, users.id))
    .where(and(
      eq(messengerMessages.channelId, channelId),
      eq(messengerMessages.companyId, tenant.companyId),
    ))
    .orderBy(desc(messengerMessages.createdAt))
    .limit(limit)

  const messages = await query

  // 최신순으로 가져왔으므로 뒤집어서 반환 (오래된 것 먼저)
  return c.json({ data: messages.reverse() })
})

// POST /messenger/channels/:id/messages — 메시지 전송
messengerRoute.post('/channels/:id/messages', zValidator('json', sendMessageSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const { content, parentMessageId, fileId } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const [message] = await db
    .insert(messengerMessages)
    .values({
      companyId: tenant.companyId,
      channelId,
      userId: tenant.userId,
      content,
      parentMessageId,
      fileId,
    })
    .returning()

  return c.json({ data: message }, 201)
})

// POST /messenger/channels/:id/members — 멤버 추가
messengerRoute.post('/channels/:id/members', zValidator('json', addMemberSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const { userId } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  // 이미 멤버인지 확인
  const [existing] = await db
    .select({ id: messengerMembers.id })
    .from(messengerMembers)
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.userId, userId),
    ))
    .limit(1)

  if (existing) return c.json({ data: { already: true } })

  const [member] = await db
    .insert(messengerMembers)
    .values({
      companyId: tenant.companyId,
      channelId,
      userId,
    })
    .returning()

  return c.json({ data: member }, 201)
})

// DELETE /messenger/channels/:id/members/:uid — 멤버 제거
messengerRoute.delete('/channels/:id/members/:uid', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const targetUserId = c.req.param('uid')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  await db
    .delete(messengerMembers)
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.userId, targetUserId),
      eq(messengerMembers.companyId, tenant.companyId),
    ))

  return c.json({ data: { removed: true } })
})

// GET /messenger/users — 같은 회사 유저 목록 (멤버 추가용)
messengerRoute.get('/users', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.companyId, tenant.companyId), eq(users.isActive, true)))
    .orderBy(users.name)

  return c.json({ data: result })
})

// ========== Story 16-1: Channel Management ==========

// PATCH /messenger/channels/:id — 채널 수정
messengerRoute.patch('/channels/:id', zValidator('json', updateChannelSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const body = c.req.valid('json')

  const [channel] = await db.select({ id: messengerChannels.id, createdBy: messengerChannels.createdBy })
    .from(messengerChannels)
    .where(and(eq(messengerChannels.id, channelId), eq(messengerChannels.companyId, tenant.companyId)))
    .limit(1)

  if (!channel) throw new HTTPError(404, '채널을 찾을 수 없습니다', 'MSG_001')
  if (channel.createdBy !== tenant.userId && tenant.role !== 'admin') {
    throw new HTTPError(403, '채널 생성자 또는 관리자만 수정할 수 있습니다', 'AUTH_003')
  }

  const [updated] = await db.update(messengerChannels)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(messengerChannels.id, channelId))
    .returning()

  return c.json({ data: updated })
})

// DELETE /messenger/channels/:id — 채널 삭제 (soft)
messengerRoute.delete('/channels/:id', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')

  const [channel] = await db.select({ id: messengerChannels.id, createdBy: messengerChannels.createdBy })
    .from(messengerChannels)
    .where(and(eq(messengerChannels.id, channelId), eq(messengerChannels.companyId, tenant.companyId)))
    .limit(1)

  if (!channel) throw new HTTPError(404, '채널을 찾을 수 없습니다', 'MSG_001')
  if (channel.createdBy !== tenant.userId && tenant.role !== 'admin') {
    throw new HTTPError(403, '채널 생성자 또는 관리자만 삭제할 수 있습니다', 'AUTH_003')
  }

  await db.update(messengerChannels)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(messengerChannels.id, channelId))

  return c.json({ data: { message: '삭제되었습니다' } })
})

// ========== Story 16-2: Agent Integration ==========

// POST /messenger/channels/:id/agent — 에이전트 멘션/호출
const agentMentionSchema = z.object({
  agentId: z.string().uuid(),
  message: z.string().min(1),
})

messengerRoute.post('/channels/:id/agent', zValidator('json', agentMentionSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const { agentId, message } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const { generateAgentResponse } = await import('../../lib/ai')
  const response = await generateAgentResponse({
    agentId,
    sessionId: '',
    companyId: tenant.companyId,
    userMessage: message,
    userId: tenant.userId,
  })

  const [agentMsg] = await db.insert(messengerMessages).values({
    companyId: tenant.companyId,
    channelId,
    userId: tenant.userId,
    content: `[AI] ${response}`,
  }).returning()

  return c.json({ data: agentMsg }, 201)
})

// ========== Story 16-3: Reactions + Threads ==========

// POST /messenger/messages/:id/react — 반응 추가
messengerRoute.post('/messages/:id/react', zValidator('json', z.object({ emoji: z.string().min(1).max(10) })), async (c) => {
  const tenant = c.get('tenant')
  const messageId = c.req.param('id')
  const { emoji } = c.req.valid('json')

  const [reaction] = await db.insert(messengerReactions).values({
    companyId: tenant.companyId,
    messageId,
    userId: tenant.userId,
    emoji,
  }).returning()

  return c.json({ data: reaction }, 201)
})

// DELETE /messenger/messages/:id/react — 반응 제거
messengerRoute.delete('/messages/:id/react', async (c) => {
  const tenant = c.get('tenant')
  const messageId = c.req.param('id')

  await db.delete(messengerReactions)
    .where(and(
      eq(messengerReactions.messageId, messageId),
      eq(messengerReactions.userId, tenant.userId),
      eq(messengerReactions.companyId, tenant.companyId),
    ))

  return c.json({ data: { removed: true } })
})

// GET /messenger/messages/:id/thread — 스레드 조회
messengerRoute.get('/messages/:id/thread', async (c) => {
  const tenant = c.get('tenant')
  const parentId = c.req.param('id')

  const replies = await db
    .select({
      id: messengerMessages.id,
      userId: messengerMessages.userId,
      userName: users.name,
      content: messengerMessages.content,
      createdAt: messengerMessages.createdAt,
    })
    .from(messengerMessages)
    .innerJoin(users, eq(messengerMessages.userId, users.id))
    .where(and(
      eq(messengerMessages.parentMessageId, parentId),
      eq(messengerMessages.companyId, tenant.companyId),
    ))
    .orderBy(messengerMessages.createdAt)

  return c.json({ data: replies })
})

// ========== Story 16-4: Search ==========

// GET /messenger/search?q=keyword — 메시지 검색
messengerRoute.get('/search', async (c) => {
  const tenant = c.get('tenant')
  const q = c.req.query('q')
  if (!q) return c.json({ data: [] })

  const results = await db
    .select({
      id: messengerMessages.id,
      content: messengerMessages.content,
      channelId: messengerMessages.channelId,
      channelName: messengerChannels.name,
      userName: users.name,
      createdAt: messengerMessages.createdAt,
    })
    .from(messengerMessages)
    .innerJoin(users, eq(messengerMessages.userId, users.id))
    .innerJoin(messengerChannels, eq(messengerMessages.channelId, messengerChannels.id))
    .where(and(
      eq(messengerMessages.companyId, tenant.companyId),
      sql`${messengerMessages.content} ILIKE ${'%' + q + '%'}`,
    ))
    .orderBy(desc(messengerMessages.createdAt))
    .limit(50)

  return c.json({ data: results })
})
