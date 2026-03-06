import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'
import { db } from '../../db'
import { messengerChannels, messengerMembers, messengerMessages, users, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import { broadcastToChannel } from '../../ws/channels'
import { clientMap } from '../../ws/server'
import { getClientForUser } from '../../lib/ai'
import type { AppEnv } from '../../types'

export const messengerRoute = new Hono<AppEnv>()

messengerRoute.use('*', authMiddleware)

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
})

const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
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

// AI 에이전트 멘션 → 비동기 응답 생성
async function handleAgentMention(
  agent: { id: string; name: string; soul: string | null; userId: string },
  channelId: string,
  userMessage: string,
  userId: string,
  companyId: string,
) {
  // typing 인디케이터 브로드캐스트
  broadcastToChannel(`messenger::${channelId}`, { type: 'typing', agentName: agent.name })

  try {
    const client = await getClientForUser(userId, companyId)

    // 최근 채널 메시지 10건을 컨텍스트로 사용
    const recentMsgs = await db
      .select({ userName: users.name, content: messengerMessages.content })
      .from(messengerMessages)
      .innerJoin(users, eq(messengerMessages.userId, users.id))
      .where(and(eq(messengerMessages.channelId, channelId), eq(messengerMessages.companyId, companyId)))
      .orderBy(desc(messengerMessages.createdAt))
      .limit(10)
    recentMsgs.reverse()

    const contextMessages = recentMsgs.map((m) => `${m.userName}: ${m.content}`).join('\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20241022',
      max_tokens: 1024,
      system: `${agent.soul || '당신은 도움이 되는 AI 비서입니다.'}\n\n이름: ${agent.name}\n한국어로 답변. 간결하게.`,
      messages: [
        {
          role: 'user',
          content: `다음은 메신저 채널의 최근 대화입니다:\n\n${contextMessages}\n\n위 대화에서 당신(@${agent.name})에게 질문했습니다. 답변해주세요.`,
        },
      ],
    })

    const responseText = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')

    // 에이전트 응답을 메시지로 저장 (에이전트의 userId 사용)
    const [agentMessage] = await db
      .insert(messengerMessages)
      .values({
        companyId,
        channelId,
        userId: agent.userId,
        content: responseText,
      })
      .returning()

    // WebSocket 브로드캐스트
    broadcastToChannel(`messenger::${channelId}`, {
      type: 'new-message',
      message: {
        id: agentMessage.id,
        userId: agentMessage.userId,
        userName: agent.name,
        content: responseText,
        createdAt: agentMessage.createdAt,
      },
    })
  } catch {
    // AI 호출 실패 시 에러 메시지를 DB에 저장 후 브로드캐스트
    const errorContent = '죄송합니다, 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.'
    const [errorMsg] = await db
      .insert(messengerMessages)
      .values({ companyId, channelId, userId: agent.userId, content: errorContent })
      .returning()

    broadcastToChannel(`messenger::${channelId}`, {
      type: 'new-message',
      message: {
        id: errorMsg.id,
        userId: errorMsg.userId,
        userName: agent.name,
        content: errorContent,
        createdAt: errorMsg.createdAt,
      },
    })
  }
}

// GET /messenger/online-status — 같은 회사의 온라인 유저 ID 목록
messengerRoute.get('/online-status', async (c) => {
  const tenant = c.get('tenant')

  const onlineUserIds: string[] = []
  for (const [userId, clients] of clientMap.entries()) {
    if (clients.some((cl) => cl.companyId === tenant.companyId)) {
      onlineUserIds.push(userId)
    }
  }

  return c.json({ data: onlineUserIds })
})

// GET /messenger/channels — 내가 참여한 채널 목록 (lastMessage 포함)
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
    ))
    .orderBy(messengerChannels.createdAt)

  // 각 채널의 마지막 메시지 가져오기
  const channelsWithLastMsg = await Promise.all(
    channels.map(async (ch) => {
      const [lastMsg] = await db
        .select({
          content: messengerMessages.content,
          userName: users.name,
          createdAt: messengerMessages.createdAt,
        })
        .from(messengerMessages)
        .innerJoin(users, eq(messengerMessages.userId, users.id))
        .where(and(
          eq(messengerMessages.channelId, ch.id),
          eq(messengerMessages.companyId, tenant.companyId),
        ))
        .orderBy(desc(messengerMessages.createdAt))
        .limit(1)

      return { ...ch, lastMessage: lastMsg || null }
    }),
  )

  return c.json({ data: channelsWithLastMsg })
})

// GET /messenger/channels/:id — 채널 상세
messengerRoute.get('/channels/:id', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const [channel] = await db
    .select({
      id: messengerChannels.id,
      name: messengerChannels.name,
      description: messengerChannels.description,
      createdBy: messengerChannels.createdBy,
      createdAt: messengerChannels.createdAt,
    })
    .from(messengerChannels)
    .where(and(
      eq(messengerChannels.id, channelId),
      eq(messengerChannels.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!channel) throw new HTTPError(404, '채널을 찾을 수 없습니다', 'MSG_004')

  const memberCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messengerMembers)
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.companyId, tenant.companyId),
    ))

  return c.json({ data: { ...channel, memberCount: memberCount[0].count } })
})

// GET /messenger/channels/:id/members — 채널 멤버 목록
messengerRoute.get('/channels/:id/members', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      joinedAt: messengerMembers.joinedAt,
    })
    .from(messengerMembers)
    .innerJoin(users, eq(messengerMembers.userId, users.id))
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.companyId, tenant.companyId),
    ))
    .orderBy(messengerMembers.joinedAt)

  return c.json({ data: members })
})

// PUT /messenger/channels/:id — 채널 수정
messengerRoute.put('/channels/:id', zValidator('json', updateChannelSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const updates = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const setValues: Record<string, unknown> = {}
  if (updates.name !== undefined) setValues.name = updates.name
  if (updates.description !== undefined) setValues.description = updates.description

  if (Object.keys(setValues).length === 0) {
    throw new HTTPError(400, '수정할 내용이 없습니다', 'MSG_005')
  }

  const [updated] = await db
    .update(messengerChannels)
    .set(setValues)
    .where(and(
      eq(messengerChannels.id, channelId),
      eq(messengerChannels.companyId, tenant.companyId),
    ))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `메신저 채널 수정: ${updated.name}`,
  })

  return c.json({ data: updated })
})

// DELETE /messenger/channels/:id — 채널 삭제 (생성자만)
messengerRoute.delete('/channels/:id', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')

  // 채널 정보 가져오기
  const [channel] = await db
    .select({ id: messengerChannels.id, name: messengerChannels.name, createdBy: messengerChannels.createdBy })
    .from(messengerChannels)
    .where(and(
      eq(messengerChannels.id, channelId),
      eq(messengerChannels.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!channel) throw new HTTPError(404, '채널을 찾을 수 없습니다', 'MSG_004')
  if (channel.createdBy !== tenant.userId) {
    throw new HTTPError(403, '채널 생성자만 삭제할 수 있습니다', 'MSG_006')
  }

  // FK 순서: messages → members → channel
  await db.delete(messengerMessages).where(and(
    eq(messengerMessages.channelId, channelId),
    eq(messengerMessages.companyId, tenant.companyId),
  ))
  await db.delete(messengerMembers).where(and(
    eq(messengerMembers.channelId, channelId),
    eq(messengerMembers.companyId, tenant.companyId),
  ))
  await db.delete(messengerChannels).where(and(
    eq(messengerChannels.id, channelId),
    eq(messengerChannels.companyId, tenant.companyId),
  ))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `메신저 채널 삭제: ${channel.name}`,
  })

  return c.json({ data: { deleted: true } })
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
  const { content } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const [message] = await db
    .insert(messengerMessages)
    .values({
      companyId: tenant.companyId,
      channelId,
      userId: tenant.userId,
      content,
    })
    .returning()

  // 유저 이름 조회 후 WebSocket 실시간 브로드캐스트
  const [sender] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, tenant.userId))
    .limit(1)

  broadcastToChannel(`messenger::${channelId}`, {
    type: 'new-message',
    message: {
      id: message.id,
      userId: message.userId,
      userName: sender?.name || 'Unknown',
      content: message.content,
      createdAt: message.createdAt,
    },
  })

  // @에이전트 멘션 파싱 → 비동기 AI 응답 (fire-and-forget, DB 조회 포함)
  const mentionMatch = content.match(/@(\S+)/)
  if (mentionMatch) {
    const agentName = mentionMatch[1]
    const cId = tenant.companyId
    const uId = tenant.userId
    ;(async () => {
      const [agent] = await db
        .select({ id: agents.id, name: agents.name, soul: agents.soul, userId: agents.userId })
        .from(agents)
        .where(and(eq(agents.name, agentName), eq(agents.companyId, cId)))
        .limit(1)
      if (agent) await handleAgentMention(agent, channelId, content, uId, cId)
    })().catch(() => {})
  }

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

// DELETE /messenger/channels/:id/members/me — 채널 나가기
messengerRoute.delete('/channels/:id/members/me', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  await db
    .delete(messengerMembers)
    .where(and(
      eq(messengerMembers.channelId, channelId),
      eq(messengerMembers.userId, tenant.userId),
      eq(messengerMembers.companyId, tenant.companyId),
    ))

  return c.json({ data: { left: true } })
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
