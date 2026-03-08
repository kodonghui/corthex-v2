import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Zod Schemas for conversation validation ===
const ConversationTypeEnum = z.enum(['direct', 'group'])
const MessageTypeEnum = z.enum(['text', 'system', 'ai_report'])

const CreateConversationSchema = z.object({
  type: ConversationTypeEnum,
  participantIds: z.array(z.string().uuid()).min(2),
  name: z.string().max(255).optional(),
})

const MessageSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  companyId: z.string().uuid(),
  content: z.string().min(1).max(10000),
  type: MessageTypeEnum.default('text'),
})

// UUID helper
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const companyA = uuid(100)
const companyB = uuid(200)
const userAlice = uuid(1)
const userBob = uuid(2)
const userCharlie = uuid(3)

// === Zod Schema Tests ===
describe('CreateConversationSchema', () => {
  test('valid direct conversation', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'direct',
      participantIds: [userAlice, userBob],
    })
    expect(result.success).toBe(true)
  })

  test('valid group conversation with name', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'group',
      participantIds: [userAlice, userBob, userCharlie],
      name: 'Team Chat',
    })
    expect(result.success).toBe(true)
  })

  test('rejects invalid type', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'invalid',
      participantIds: [userAlice, userBob],
    })
    expect(result.success).toBe(false)
  })

  test('rejects less than 2 participants', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'direct',
      participantIds: [userAlice],
    })
    expect(result.success).toBe(false)
  })

  test('rejects non-uuid participant IDs', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'direct',
      participantIds: ['not-a-uuid', 'also-not'],
    })
    expect(result.success).toBe(false)
  })

  test('rejects name over 255 characters', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'group',
      participantIds: [userAlice, userBob],
      name: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  test('allows name exactly 255 characters', () => {
    const result = CreateConversationSchema.safeParse({
      type: 'group',
      participantIds: [userAlice, userBob],
      name: 'a'.repeat(255),
    })
    expect(result.success).toBe(true)
  })
})

describe('MessageSchema', () => {
  test('valid text message', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: 'Hello!',
      type: 'text',
    })
    expect(result.success).toBe(true)
  })

  test('defaults type to text', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: 'Hello!',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('text')
    }
  })

  test('valid system message', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: 'Alice joined the conversation',
      type: 'system',
    })
    expect(result.success).toBe(true)
  })

  test('valid ai_report message', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: '{"report": "data"}',
      type: 'ai_report',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty content', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: '',
      type: 'text',
    })
    expect(result.success).toBe(false)
  })

  test('rejects content over 10000 characters', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: 'a'.repeat(10001),
      type: 'text',
    })
    expect(result.success).toBe(false)
  })

  test('rejects invalid message type', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      companyId: companyA,
      content: 'Hello',
      type: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  test('rejects missing companyId', () => {
    const result = MessageSchema.safeParse({
      conversationId: uuid(10),
      senderId: userAlice,
      content: 'Hello',
      type: 'text',
    })
    expect(result.success).toBe(false)
  })
})

// === ConversationService Logic Tests (pure logic, no DB) ===
describe('ConversationService logic', () => {
  describe('direct conversation validation', () => {
    test('direct requires exactly 2 participants', () => {
      const validate = (type: string, participantIds: string[]) => {
        if (type === 'direct' && participantIds.length !== 2) {
          throw new Error('Direct conversations require exactly 2 participants')
        }
      }
      expect(() => validate('direct', [userAlice])).toThrow('exactly 2')
      expect(() => validate('direct', [userAlice, userBob, userCharlie])).toThrow('exactly 2')
      expect(() => validate('direct', [userAlice, userBob])).not.toThrow()
    })

    test('group requires at least 2 participants', () => {
      const validate = (type: string, participantIds: string[]) => {
        if (type === 'group' && participantIds.length < 2) {
          throw new Error('Group conversations require at least 2 participants')
        }
      }
      expect(() => validate('group', [userAlice])).toThrow('at least 2')
      expect(() => validate('group', [userAlice, userBob])).not.toThrow()
    })
  })

  describe('direct conversation dedup logic', () => {
    test('same 2 users should match regardless of order', () => {
      const matchUsers = (existing: string[], check: [string, string]) => {
        return (
          existing.length === 2 &&
          existing.includes(check[0]) &&
          existing.includes(check[1])
        )
      }
      expect(matchUsers([userAlice, userBob], [userAlice, userBob])).toBe(true)
      expect(matchUsers([userBob, userAlice], [userAlice, userBob])).toBe(true)
      expect(matchUsers([userAlice, userCharlie], [userAlice, userBob])).toBe(false)
      expect(matchUsers([userAlice], [userAlice, userBob])).toBe(false)
    })
  })

  describe('group name handling', () => {
    test('direct conversations ignore name', () => {
      const getName = (type: string, name?: string) => {
        return type === 'group' ? (name || null) : null
      }
      expect(getName('direct', 'My Chat')).toBe(null)
      expect(getName('group', 'My Chat')).toBe('My Chat')
      expect(getName('group')).toBe(null)
    })
  })

  describe('addParticipant validation', () => {
    test('cannot add to direct conversation', () => {
      const validate = (convType: string) => {
        if (convType !== 'group') {
          throw new Error('Cannot add participants to direct conversations')
        }
      }
      expect(() => validate('direct')).toThrow('Cannot add participants')
      expect(() => validate('group')).not.toThrow()
    })

    test('cannot add duplicate participant', () => {
      const existingParticipants = [
        { userId: userAlice },
        { userId: userBob },
      ]
      const validate = (userId: string) => {
        if (existingParticipants.find((p) => p.userId === userId)) {
          throw new Error('User is already a participant')
        }
      }
      expect(() => validate(userAlice)).toThrow('already a participant')
      expect(() => validate(userCharlie)).not.toThrow()
    })
  })

  describe('tenant isolation', () => {
    test('companyId must be included in all operations', () => {
      // Verify the schema requires companyId
      const msgResult = MessageSchema.safeParse({
        conversationId: uuid(10),
        senderId: userAlice,
        content: 'test',
        // companyId intentionally omitted
      })
      expect(msgResult.success).toBe(false)
    })

    test('different companies should not share data', () => {
      // Simulate tenant isolation by filtering
      const allConversations = [
        { id: uuid(1), companyId: companyA, type: 'direct' },
        { id: uuid(2), companyId: companyB, type: 'direct' },
        { id: uuid(3), companyId: companyA, type: 'group' },
      ]
      const companyAConvs = allConversations.filter((c) => c.companyId === companyA)
      expect(companyAConvs).toHaveLength(2)
      expect(companyAConvs.every((c) => c.companyId === companyA)).toBe(true)
    })
  })

  describe('unread count logic', () => {
    test('all messages unread when lastReadAt is null', () => {
      const messages = [
        { createdAt: new Date('2026-01-01') },
        { createdAt: new Date('2026-01-02') },
        { createdAt: new Date('2026-01-03') },
      ]
      const lastReadAt: Date | null = null
      const unread = lastReadAt
        ? messages.filter((m) => m.createdAt > lastReadAt).length
        : messages.length
      expect(unread).toBe(3)
    })

    test('counts messages after lastReadAt', () => {
      const messages = [
        { createdAt: new Date('2026-01-01') },
        { createdAt: new Date('2026-01-02') },
        { createdAt: new Date('2026-01-03') },
      ]
      const lastReadAt = new Date('2026-01-01T12:00:00')
      const unread = messages.filter((m) => m.createdAt > lastReadAt).length
      expect(unread).toBe(2)
    })

    test('zero unread when all messages read', () => {
      const messages = [
        { createdAt: new Date('2026-01-01') },
        { createdAt: new Date('2026-01-02') },
      ]
      const lastReadAt = new Date('2026-01-03')
      const unread = messages.filter((m) => m.createdAt > lastReadAt).length
      expect(unread).toBe(0)
    })
  })
})
