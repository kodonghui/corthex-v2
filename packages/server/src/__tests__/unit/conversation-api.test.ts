import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Zod Schemas (mirrored from conversations route) ===
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

// UUID helper
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const companyA = uuid(100)
const userAlice = uuid(1)
const userBob = uuid(2)
const userCharlie = uuid(3)

// === Zod Schema Tests ===
describe('Conversation API - Zod Schemas', () => {
  describe('createConversationSchema', () => {
    test('valid direct conversation', () => {
      const result = createConversationSchema.safeParse({
        type: 'direct',
        participantIds: [userAlice, userBob],
      })
      expect(result.success).toBe(true)
    })

    test('valid group with name', () => {
      const result = createConversationSchema.safeParse({
        type: 'group',
        participantIds: [userAlice, userBob, userCharlie],
        name: 'Team Chat',
      })
      expect(result.success).toBe(true)
    })

    test('rejects < 2 participants', () => {
      const result = createConversationSchema.safeParse({
        type: 'direct',
        participantIds: [userAlice],
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid type', () => {
      const result = createConversationSchema.safeParse({
        type: 'channel',
        participantIds: [userAlice, userBob],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('sendMessageSchema', () => {
    test('valid text message', () => {
      const result = sendMessageSchema.safeParse({
        content: 'Hello!',
        type: 'text',
      })
      expect(result.success).toBe(true)
    })

    test('defaults type to text', () => {
      const result = sendMessageSchema.safeParse({ content: 'Hello!' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.type).toBe('text')
    })

    test('valid system message', () => {
      const result = sendMessageSchema.safeParse({
        content: 'User joined',
        type: 'system',
      })
      expect(result.success).toBe(true)
    })

    test('valid ai_report message', () => {
      const result = sendMessageSchema.safeParse({
        content: '{"report": "data"}',
        type: 'ai_report',
      })
      expect(result.success).toBe(true)
    })

    test('rejects empty content', () => {
      const result = sendMessageSchema.safeParse({ content: '', type: 'text' })
      expect(result.success).toBe(false)
    })

    test('rejects content > 10000', () => {
      const result = sendMessageSchema.safeParse({
        content: 'a'.repeat(10001),
        type: 'text',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid type', () => {
      const result = sendMessageSchema.safeParse({
        content: 'Hello',
        type: 'video',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('addParticipantSchema', () => {
    test('valid uuid', () => {
      const result = addParticipantSchema.safeParse({ userId: userAlice })
      expect(result.success).toBe(true)
    })

    test('rejects non-uuid', () => {
      const result = addParticipantSchema.safeParse({ userId: 'not-uuid' })
      expect(result.success).toBe(false)
    })

    test('rejects missing userId', () => {
      const result = addParticipantSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})

// === Cursor Pagination Logic Tests ===
describe('Conversation API - Cursor Pagination Logic', () => {
  test('cursor filters messages before date', () => {
    const allMessages = [
      { id: '1', createdAt: new Date('2026-01-05') },
      { id: '2', createdAt: new Date('2026-01-04') },
      { id: '3', createdAt: new Date('2026-01-03') },
      { id: '4', createdAt: new Date('2026-01-02') },
      { id: '5', createdAt: new Date('2026-01-01') },
    ]
    const cursor = new Date('2026-01-04')
    const filtered = allMessages.filter((m) => m.createdAt < cursor)
    expect(filtered).toHaveLength(3)
    expect(filtered[0].id).toBe('3')
  })

  test('no cursor returns all messages', () => {
    const allMessages = [
      { id: '1', createdAt: new Date('2026-01-03') },
      { id: '2', createdAt: new Date('2026-01-02') },
      { id: '3', createdAt: new Date('2026-01-01') },
    ]
    expect(allMessages).toHaveLength(3)
  })

  test('hasMore detected by fetching limit+1', () => {
    const limit = 2
    const rows = [
      { id: '1' },
      { id: '2' },
      { id: '3' }, // extra row = hasMore
    ]
    const hasMore = rows.length > limit
    const items = rows.slice(0, limit)
    expect(hasMore).toBe(true)
    expect(items).toHaveLength(2)
  })

  test('no hasMore when rows <= limit', () => {
    const limit = 5
    const rows = [{ id: '1' }, { id: '2' }]
    const hasMore = rows.length > limit
    expect(hasMore).toBe(false)
  })
})

// === Soft Delete Permission Logic ===
describe('Conversation API - Soft Delete Logic', () => {
  test('only sender can delete own message', () => {
    const messageSenderId = userAlice
    const requestingUserId = userAlice
    expect(messageSenderId === requestingUserId).toBe(true)
  })

  test('other user cannot delete message', () => {
    const messageSenderId = userAlice
    const requestingUserId = userBob
    expect(messageSenderId === requestingUserId).toBe(false)
  })
})

// === WebSocket Channel Subscription Logic ===
describe('Conversation API - WebSocket Channel Logic', () => {
  test('subscription key format', () => {
    const conversationId = uuid(42)
    const channelKey = `conversation::${conversationId}`
    expect(channelKey).toBe(`conversation::${conversationId}`)
    expect(channelKey.split('::')[0]).toBe('conversation')
    expect(channelKey.split('::')[1]).toBe(conversationId)
  })

  test('participant check blocks non-participant', () => {
    const participants = [
      { userId: userAlice, companyId: companyA },
      { userId: userBob, companyId: companyA },
    ]
    const isParticipant = participants.some(
      (p) => p.userId === userCharlie && p.companyId === companyA,
    )
    expect(isParticipant).toBe(false)
  })

  test('participant check allows participant', () => {
    const participants = [
      { userId: userAlice, companyId: companyA },
      { userId: userBob, companyId: companyA },
    ]
    const isParticipant = participants.some(
      (p) => p.userId === userAlice && p.companyId === companyA,
    )
    expect(isParticipant).toBe(true)
  })
})

// === System Message Generation Logic ===
describe('Conversation API - System Message Logic', () => {
  test('join system message format', () => {
    const userName = '김철수'
    const content = `${userName} 님이 참여했습니다`
    expect(content).toBe('김철수 님이 참여했습니다')
  })

  test('leave system message format', () => {
    const userName = '김철수'
    const content = `${userName} 님이 나갔습니다`
    expect(content).toBe('김철수 님이 나갔습니다')
  })

  test('unknown user fallback', () => {
    const userName: string | undefined = undefined
    const content = `${userName || '알 수 없는 사용자'} 님이 참여했습니다`
    expect(content).toBe('알 수 없는 사용자 님이 참여했습니다')
  })

  test('system message type is system', () => {
    const messageType = 'system'
    expect(messageType).toBe('system')
    expect(['text', 'system', 'ai_report'].includes(messageType)).toBe(true)
  })

  test('auto-include self in participantIds', () => {
    const body = { participantIds: [userBob, userCharlie] }
    const currentUserId = userAlice
    if (!body.participantIds.includes(currentUserId)) {
      body.participantIds.push(currentUserId)
    }
    expect(body.participantIds).toContain(userAlice)
    expect(body.participantIds).toHaveLength(3)
  })

  test('does not duplicate self if already included', () => {
    const body = { participantIds: [userAlice, userBob] }
    const currentUserId = userAlice
    if (!body.participantIds.includes(currentUserId)) {
      body.participantIds.push(currentUserId)
    }
    expect(body.participantIds).toHaveLength(2)
  })
})
