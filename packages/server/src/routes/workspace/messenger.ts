import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, inArray, sql, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { messengerChannels, messengerMembers, messengerMessages, messengerReactions, users, agents } from '../../db/schema'
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
  parentMessageId: z.string().uuid().optional(),
})

const reactionSchema = z.object({
  emoji: z.string().min(1).max(20),
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

  // FK 순서: reactions → messages → members → channel
  // reactions가 messages에 FK 참조하므로 먼저 삭제해야 함
  const channelMsgIds = await db
    .select({ id: messengerMessages.id })
    .from(messengerMessages)
    .where(and(eq(messengerMessages.channelId, channelId), eq(messengerMessages.companyId, tenant.companyId)))
  if (channelMsgIds.length > 0) {
    await db.delete(messengerReactions).where(and(
      inArray(messengerReactions.messageId, channelMsgIds.map((m) => m.id)),
      eq(messengerReactions.companyId, tenant.companyId),
    ))
  }
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

// GET /messenger/channels/:id/messages — 메시지 조회 (메인 메시지만, replyCount 포함)
messengerRoute.get('/channels/:id/messages', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const limitNum = Math.min(Number(c.req.query('limit')) || 50, 100)

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const messages = await db
    .select({
      id: messengerMessages.id,
      userId: messengerMessages.userId,
      userName: users.name,
      content: messengerMessages.content,
      parentMessageId: messengerMessages.parentMessageId,
      createdAt: messengerMessages.createdAt,
      replyCount: sql<number>`(SELECT count(*)::int FROM messenger_messages r WHERE r.parent_message_id = ${messengerMessages.id})`,
    })
    .from(messengerMessages)
    .innerJoin(users, eq(messengerMessages.userId, users.id))
    .where(and(
      eq(messengerMessages.channelId, channelId),
      eq(messengerMessages.companyId, tenant.companyId),
      isNull(messengerMessages.parentMessageId),
    ))
    .orderBy(desc(messengerMessages.createdAt))
    .limit(limitNum)

  // 각 메시지의 리액션 집계
  const messageIds = messages.map((m) => m.id)
  const reactionsMap = await getReactionsMap(messageIds, tenant.companyId)

  const result = messages.reverse().map((m) => ({
    ...m,
    reactions: reactionsMap[m.id] || [],
  }))

  return c.json({ data: result })
})

// POST /messenger/channels/:id/messages — 메시지 전송
messengerRoute.post('/channels/:id/messages', zValidator('json', sendMessageSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const { content, parentMessageId } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  // parentMessageId 제공 시 해당 메시지가 같은 채널에 존재하는지 검증
  if (parentMessageId) {
    const [parentMsg] = await db
      .select({ id: messengerMessages.id })
      .from(messengerMessages)
      .where(and(
        eq(messengerMessages.id, parentMessageId),
        eq(messengerMessages.channelId, channelId),
        eq(messengerMessages.companyId, tenant.companyId),
      ))
      .limit(1)
    if (!parentMsg) throw new HTTPError(404, '원본 메시지를 찾을 수 없습니다', 'MSG_011')
  }

  const [message] = await db
    .insert(messengerMessages)
    .values({
      companyId: tenant.companyId,
      channelId,
      userId: tenant.userId,
      content,
      parentMessageId: parentMessageId || null,
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
      parentMessageId: message.parentMessageId,
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

// GET /messenger/channels/:id/messages/:msgId/thread — 스레드 답글 조회
messengerRoute.get('/channels/:id/messages/:msgId/thread', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const msgId = c.req.param('msgId')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  const replies = await db
    .select({
      id: messengerMessages.id,
      userId: messengerMessages.userId,
      userName: users.name,
      content: messengerMessages.content,
      parentMessageId: messengerMessages.parentMessageId,
      createdAt: messengerMessages.createdAt,
    })
    .from(messengerMessages)
    .innerJoin(users, eq(messengerMessages.userId, users.id))
    .where(and(
      eq(messengerMessages.channelId, channelId),
      eq(messengerMessages.companyId, tenant.companyId),
      eq(messengerMessages.parentMessageId, msgId),
    ))
    .orderBy(messengerMessages.createdAt)

  // 각 답글의 리액션도 포함
  const replyIds = replies.map((r) => r.id)
  const reactionsMap = await getReactionsMap(replyIds, tenant.companyId)

  const result = replies.map((r) => ({
    ...r,
    reactions: reactionsMap[r.id] || [],
  }))

  return c.json({ data: result })
})

// POST /messenger/channels/:id/messages/:msgId/reactions — 리액션 추가
messengerRoute.post('/channels/:id/messages/:msgId/reactions', zValidator('json', reactionSchema), async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const msgId = c.req.param('msgId')
  const { emoji } = c.req.valid('json')

  await assertMember(channelId, tenant.userId, tenant.companyId)

  try {
    await db
      .insert(messengerReactions)
      .values({
        companyId: tenant.companyId,
        messageId: msgId,
        userId: tenant.userId,
        emoji,
      })
  } catch (err: unknown) {
    // unique constraint violation (duplicate reaction)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('unique') || message.includes('duplicate') || message.includes('23505')) {
      throw new HTTPError(409, '이미 같은 리액션을 추가했습니다', 'MSG_010')
    }
    throw err
  }

  // 해당 메시지의 전체 리액션 상태를 브로드캐스트
  const reactions = await getMessageReactions(msgId, tenant.companyId)
  broadcastToChannel(`messenger::${channelId}`, {
    type: 'reaction-update',
    messageId: msgId,
    reactions,
  })

  return c.json({ data: { added: true } }, 201)
})

// DELETE /messenger/channels/:id/messages/:msgId/reactions/:emoji — 리액션 제거
messengerRoute.delete('/channels/:id/messages/:msgId/reactions/:emoji', async (c) => {
  const tenant = c.get('tenant')
  const channelId = c.req.param('id')
  const msgId = c.req.param('msgId')
  const emoji = decodeURIComponent(c.req.param('emoji'))

  await assertMember(channelId, tenant.userId, tenant.companyId)

  await db
    .delete(messengerReactions)
    .where(and(
      eq(messengerReactions.messageId, msgId),
      eq(messengerReactions.userId, tenant.userId),
      eq(messengerReactions.emoji, emoji),
      eq(messengerReactions.companyId, tenant.companyId),
    ))

  const reactions = await getMessageReactions(msgId, tenant.companyId)
  broadcastToChannel(`messenger::${channelId}`, {
    type: 'reaction-update',
    messageId: msgId,
    reactions,
  })

  return c.json({ data: { removed: true } })
})

// 리액션 집계 헬퍼
async function getMessageReactions(messageId: string, companyId: string) {
  const allReactions = await db
    .select({
      emoji: messengerReactions.emoji,
      userId: messengerReactions.userId,
    })
    .from(messengerReactions)
    .where(and(
      eq(messengerReactions.messageId, messageId),
      eq(messengerReactions.companyId, companyId),
    ))

  const groups: { emoji: string; count: number; userIds: string[] }[] = []
  for (const r of allReactions) {
    const existing = groups.find((g) => g.emoji === r.emoji)
    if (existing) {
      existing.count++
      existing.userIds.push(r.userId)
    } else {
      groups.push({ emoji: r.emoji, count: 1, userIds: [r.userId] })
    }
  }
  return groups
}

// 여러 메시지의 리액션을 한번에 집계하는 헬퍼
async function getReactionsMap(messageIds: string[], companyId: string) {
  const map: Record<string, { emoji: string; count: number; userIds: string[] }[]> = {}
  if (messageIds.length === 0) return map

  const allReactions = await db
    .select({
      messageId: messengerReactions.messageId,
      emoji: messengerReactions.emoji,
      userId: messengerReactions.userId,
    })
    .from(messengerReactions)
    .where(and(
      inArray(messengerReactions.messageId, messageIds),
      eq(messengerReactions.companyId, companyId),
    ))

  for (const r of allReactions) {
    if (!map[r.messageId]) map[r.messageId] = []
    const group = map[r.messageId]
    const existing = group.find((g) => g.emoji === r.emoji)
    if (existing) {
      existing.count++
      existing.userIds.push(r.userId)
    } else {
      group.push({ emoji: r.emoji, count: 1, userIds: [r.userId] })
    }
  }
  return map
}

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
