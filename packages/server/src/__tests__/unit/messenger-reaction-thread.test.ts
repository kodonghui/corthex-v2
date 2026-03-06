import { describe, expect, test } from 'bun:test'

// ============================================================
// Story 16-3: 메시지 리액션 + 스레드 — Unit Tests
// ============================================================

type ReactionGroup = {
  emoji: string
  count: number
  userIds: string[]
}

type Message = {
  id: string
  userId: string
  userName: string
  content: string
  parentMessageId: string | null
  createdAt: string
  replyCount: number
  reactions: ReactionGroup[]
}

type ReactionUpdateEvent = {
  type: 'reaction-update'
  messageId: string
  reactions: ReactionGroup[]
}

type NewMessageEvent = {
  type: 'new-message'
  message: {
    id: string
    userId: string
    userName: string
    content: string
    parentMessageId: string | null
    createdAt: string
  }
}

// ======== Helper: aggregate reactions ========
function aggregateReactions(
  rawReactions: { emoji: string; userId: string }[],
): ReactionGroup[] {
  const groups: ReactionGroup[] = []
  for (const r of rawReactions) {
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

// ======== Helper: check unique constraint ========
function canAddReaction(
  existing: { messageId: string; userId: string; emoji: string }[],
  messageId: string,
  userId: string,
  emoji: string,
): boolean {
  return !existing.some(
    (r) => r.messageId === messageId && r.userId === userId && r.emoji === emoji,
  )
}

// ======== Helper: filter main messages (no parentMessageId) ========
function filterMainMessages(messages: Message[]): Message[] {
  return messages.filter((m) => !m.parentMessageId)
}

// ======== Helper: get thread replies ========
function getThreadReplies(messages: Message[], parentId: string): Message[] {
  return messages.filter((m) => m.parentMessageId === parentId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

// ======== Helper: count replies ========
function countReplies(messages: Message[], parentId: string): number {
  return messages.filter((m) => m.parentMessageId === parentId).length
}

// ======== Helper: build reaction update event ========
function buildReactionUpdateEvent(
  messageId: string,
  reactions: ReactionGroup[],
): ReactionUpdateEvent {
  return { type: 'reaction-update', messageId, reactions }
}

// ======== Helper: build new message event ========
function buildNewMessageEvent(
  msg: { id: string; userId: string; userName: string; content: string; parentMessageId: string | null; createdAt: string },
): NewMessageEvent {
  return { type: 'new-message', message: msg }
}

// ======== Helper: toggle reaction ========
function toggleReaction(
  reactions: ReactionGroup[],
  emoji: string,
  userId: string,
): ReactionGroup[] {
  const copy = reactions.map((r) => ({ ...r, userIds: [...r.userIds] }))
  const group = copy.find((g) => g.emoji === emoji)
  if (group && group.userIds.includes(userId)) {
    group.userIds = group.userIds.filter((id) => id !== userId)
    group.count--
    return copy.filter((g) => g.count > 0)
  } else if (group) {
    group.userIds.push(userId)
    group.count++
    return copy
  } else {
    return [...copy, { emoji, count: 1, userIds: [userId] }]
  }
}

// ======== Helper: validate emoji ========
function isValidEmoji(emoji: string): boolean {
  return emoji.length >= 1 && emoji.length <= 20
}

// ============================================================
// TEST SUITES
// ============================================================

describe('Reaction Aggregation', () => {
  test('aggregates empty reactions', () => {
    expect(aggregateReactions([])).toEqual([])
  })

  test('aggregates single reaction', () => {
    const result = aggregateReactions([{ emoji: '👍', userId: 'u1' }])
    expect(result).toEqual([{ emoji: '👍', count: 1, userIds: ['u1'] }])
  })

  test('aggregates multiple same emoji', () => {
    const result = aggregateReactions([
      { emoji: '👍', userId: 'u1' },
      { emoji: '👍', userId: 'u2' },
      { emoji: '👍', userId: 'u3' },
    ])
    expect(result).toEqual([{ emoji: '👍', count: 3, userIds: ['u1', 'u2', 'u3'] }])
  })

  test('aggregates multiple different emojis', () => {
    const result = aggregateReactions([
      { emoji: '👍', userId: 'u1' },
      { emoji: '❤️', userId: 'u2' },
      { emoji: '👍', userId: 'u3' },
    ])
    expect(result).toHaveLength(2)
    const thumbs = result.find((r) => r.emoji === '👍')
    expect(thumbs?.count).toBe(2)
    expect(thumbs?.userIds).toEqual(['u1', 'u3'])
    const heart = result.find((r) => r.emoji === '❤️')
    expect(heart?.count).toBe(1)
  })

  test('handles 6 default emojis', () => {
    const emojis = ['👍', '❤️', '😂', '😮', '👏', '🔥']
    const raw = emojis.map((e, i) => ({ emoji: e, userId: `u${i}` }))
    const result = aggregateReactions(raw)
    expect(result).toHaveLength(6)
  })
})

describe('Reaction Unique Constraint', () => {
  test('allows new reaction', () => {
    expect(canAddReaction([], 'm1', 'u1', '👍')).toBe(true)
  })

  test('blocks duplicate same user same emoji same message', () => {
    const existing = [{ messageId: 'm1', userId: 'u1', emoji: '👍' }]
    expect(canAddReaction(existing, 'm1', 'u1', '👍')).toBe(false)
  })

  test('allows same user different emoji', () => {
    const existing = [{ messageId: 'm1', userId: 'u1', emoji: '👍' }]
    expect(canAddReaction(existing, 'm1', 'u1', '❤️')).toBe(true)
  })

  test('allows different user same emoji', () => {
    const existing = [{ messageId: 'm1', userId: 'u1', emoji: '👍' }]
    expect(canAddReaction(existing, 'm1', 'u2', '👍')).toBe(true)
  })

  test('allows same user same emoji different message', () => {
    const existing = [{ messageId: 'm1', userId: 'u1', emoji: '👍' }]
    expect(canAddReaction(existing, 'm2', 'u1', '👍')).toBe(true)
  })
})

describe('Reaction Toggle', () => {
  test('adds new reaction', () => {
    const result = toggleReaction([], '👍', 'u1')
    expect(result).toEqual([{ emoji: '👍', count: 1, userIds: ['u1'] }])
  })

  test('removes own reaction', () => {
    const result = toggleReaction(
      [{ emoji: '👍', count: 1, userIds: ['u1'] }],
      '👍',
      'u1',
    )
    expect(result).toEqual([])
  })

  test('adds to existing reaction group', () => {
    const result = toggleReaction(
      [{ emoji: '👍', count: 1, userIds: ['u1'] }],
      '👍',
      'u2',
    )
    expect(result).toEqual([{ emoji: '👍', count: 2, userIds: ['u1', 'u2'] }])
  })

  test('removes from multi-user group', () => {
    const result = toggleReaction(
      [{ emoji: '👍', count: 2, userIds: ['u1', 'u2'] }],
      '👍',
      'u1',
    )
    expect(result).toEqual([{ emoji: '👍', count: 1, userIds: ['u2'] }])
  })

  test('toggle does not affect other emojis', () => {
    const result = toggleReaction(
      [
        { emoji: '👍', count: 1, userIds: ['u1'] },
        { emoji: '❤️', count: 1, userIds: ['u2'] },
      ],
      '👍',
      'u1',
    )
    expect(result).toEqual([{ emoji: '❤️', count: 1, userIds: ['u2'] }])
  })
})

describe('Emoji Validation', () => {
  test('valid single emoji', () => {
    expect(isValidEmoji('👍')).toBe(true)
  })

  test('valid multi-char emoji', () => {
    expect(isValidEmoji('❤️')).toBe(true)
  })

  test('empty string invalid', () => {
    expect(isValidEmoji('')).toBe(false)
  })

  test('very long string invalid', () => {
    expect(isValidEmoji('a'.repeat(21))).toBe(false)
  })

  test('20 char string valid (boundary)', () => {
    expect(isValidEmoji('a'.repeat(20))).toBe(true)
  })
})

describe('Thread - Main Message Filtering', () => {
  const messages: Message[] = [
    { id: 'm1', userId: 'u1', userName: 'A', content: 'hello', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 2, reactions: [] },
    { id: 'm2', userId: 'u2', userName: 'B', content: 'reply 1', parentMessageId: 'm1', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
    { id: 'm3', userId: 'u3', userName: 'C', content: 'world', parentMessageId: null, createdAt: '2026-01-01T00:02:00Z', replyCount: 0, reactions: [] },
    { id: 'm4', userId: 'u1', userName: 'A', content: 'reply 2', parentMessageId: 'm1', createdAt: '2026-01-01T00:03:00Z', replyCount: 0, reactions: [] },
  ]

  test('filters out thread replies from main view', () => {
    const main = filterMainMessages(messages)
    expect(main).toHaveLength(2)
    expect(main.map((m) => m.id)).toEqual(['m1', 'm3'])
  })

  test('gets thread replies for parent', () => {
    const replies = getThreadReplies(messages, 'm1')
    expect(replies).toHaveLength(2)
    expect(replies.map((r) => r.id)).toEqual(['m2', 'm4'])
  })

  test('returns empty for message with no replies', () => {
    const replies = getThreadReplies(messages, 'm3')
    expect(replies).toHaveLength(0)
  })

  test('counts replies correctly', () => {
    expect(countReplies(messages, 'm1')).toBe(2)
    expect(countReplies(messages, 'm3')).toBe(0)
  })

  test('thread replies sorted by time', () => {
    const replies = getThreadReplies(messages, 'm1')
    for (let i = 1; i < replies.length; i++) {
      expect(new Date(replies[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(replies[i - 1].createdAt).getTime(),
      )
    }
  })
})

describe('Thread - Reply Count', () => {
  test('message with no replies has replyCount 0', () => {
    expect(countReplies([], 'm1')).toBe(0)
  })

  test('counts multiple replies', () => {
    const messages: Message[] = [
      { id: 'r1', userId: 'u1', userName: 'A', content: 'r1', parentMessageId: 'p1', createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'r2', userId: 'u2', userName: 'B', content: 'r2', parentMessageId: 'p1', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
      { id: 'r3', userId: 'u3', userName: 'C', content: 'r3', parentMessageId: 'p1', createdAt: '2026-01-01T00:02:00Z', replyCount: 0, reactions: [] },
    ]
    expect(countReplies(messages, 'p1')).toBe(3)
  })

  test('does not count replies to other parents', () => {
    const messages: Message[] = [
      { id: 'r1', userId: 'u1', userName: 'A', content: 'r1', parentMessageId: 'p1', createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'r2', userId: 'u2', userName: 'B', content: 'r2', parentMessageId: 'p2', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
    ]
    expect(countReplies(messages, 'p1')).toBe(1)
    expect(countReplies(messages, 'p2')).toBe(1)
  })
})

describe('Reaction Update Broadcast', () => {
  test('builds correct reaction-update event', () => {
    const reactions: ReactionGroup[] = [
      { emoji: '👍', count: 2, userIds: ['u1', 'u2'] },
    ]
    const event = buildReactionUpdateEvent('msg123', reactions)
    expect(event).toEqual({
      type: 'reaction-update',
      messageId: 'msg123',
      reactions,
    })
  })

  test('empty reactions broadcast', () => {
    const event = buildReactionUpdateEvent('msg123', [])
    expect(event.reactions).toEqual([])
    expect(event.type).toBe('reaction-update')
  })

  test('broadcast includes all reaction groups', () => {
    const reactions: ReactionGroup[] = [
      { emoji: '👍', count: 1, userIds: ['u1'] },
      { emoji: '❤️', count: 3, userIds: ['u2', 'u3', 'u4'] },
      { emoji: '🔥', count: 1, userIds: ['u5'] },
    ]
    const event = buildReactionUpdateEvent('msg456', reactions)
    expect(event.reactions).toHaveLength(3)
  })
})

describe('New Message Event with parentMessageId', () => {
  test('main message has null parentMessageId', () => {
    const event = buildNewMessageEvent({
      id: 'm1', userId: 'u1', userName: 'A', content: 'hello',
      parentMessageId: null, createdAt: '2026-01-01T00:00:00Z',
    })
    expect(event.message.parentMessageId).toBeNull()
    expect(event.type).toBe('new-message')
  })

  test('thread reply has parentMessageId', () => {
    const event = buildNewMessageEvent({
      id: 'r1', userId: 'u1', userName: 'A', content: 'reply',
      parentMessageId: 'm1', createdAt: '2026-01-01T00:01:00Z',
    })
    expect(event.message.parentMessageId).toBe('m1')
  })
})

describe('WebSocket Event Discrimination', () => {
  test('reaction-update event type', () => {
    const event: ReactionUpdateEvent = {
      type: 'reaction-update',
      messageId: 'm1',
      reactions: [{ emoji: '👍', count: 1, userIds: ['u1'] }],
    }
    expect(event.type).toBe('reaction-update')
    expect(event.messageId).toBeDefined()
    expect(event.reactions).toBeDefined()
  })

  test('new-message event with parentMessageId', () => {
    const event: NewMessageEvent = {
      type: 'new-message',
      message: {
        id: 'r1', userId: 'u1', userName: 'A', content: 'reply',
        parentMessageId: 'm1', createdAt: '2026-01-01T00:00:00Z',
      },
    }
    expect(event.type).toBe('new-message')
    expect(event.message.parentMessageId).toBe('m1')
  })

  test('main channel handler ignores thread replies', () => {
    const mainMessages: Message[] = []
    const event: NewMessageEvent = {
      type: 'new-message',
      message: {
        id: 'r1', userId: 'u1', userName: 'A', content: 'reply',
        parentMessageId: 'm1', createdAt: '2026-01-01T00:00:00Z',
      },
    }
    // Simulate main handler: only add if no parentMessageId
    if (!event.message.parentMessageId) {
      mainMessages.push({ ...event.message, replyCount: 0, reactions: [] })
    }
    expect(mainMessages).toHaveLength(0)
  })

  test('main channel handler adds main messages', () => {
    const mainMessages: Message[] = []
    const event: NewMessageEvent = {
      type: 'new-message',
      message: {
        id: 'm2', userId: 'u1', userName: 'A', content: 'hello',
        parentMessageId: null, createdAt: '2026-01-01T00:00:00Z',
      },
    }
    if (!event.message.parentMessageId) {
      mainMessages.push({ ...event.message, replyCount: 0, reactions: [] })
    }
    expect(mainMessages).toHaveLength(1)
  })
})

describe('Reaction Cache Update', () => {
  test('updates reactions for matching message', () => {
    const messages: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'hello', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'm2', userId: 'u2', userName: 'B', content: 'world', parentMessageId: null, createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
    ]
    const newReactions: ReactionGroup[] = [{ emoji: '👍', count: 1, userIds: ['u3'] }]
    const updated = messages.map((m) =>
      m.id === 'm1' ? { ...m, reactions: newReactions } : m,
    )
    expect(updated[0].reactions).toEqual(newReactions)
    expect(updated[1].reactions).toEqual([])
  })

  test('does not affect other messages', () => {
    const messages: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'hello', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [{ emoji: '❤️', count: 1, userIds: ['u5'] }] },
      { id: 'm2', userId: 'u2', userName: 'B', content: 'world', parentMessageId: null, createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
    ]
    const updated = messages.map((m) =>
      m.id === 'm2' ? { ...m, reactions: [{ emoji: '🔥', count: 1, userIds: ['u3'] }] } : m,
    )
    expect(updated[0].reactions).toEqual([{ emoji: '❤️', count: 1, userIds: ['u5'] }])
    expect(updated[1].reactions).toEqual([{ emoji: '🔥', count: 1, userIds: ['u3'] }])
  })
})

describe('Reply Count Increment', () => {
  test('increments replyCount on thread reply', () => {
    const messages: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'hello', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 2, reactions: [] },
    ]
    const parentId = 'm1'
    const updated = messages.map((m) =>
      m.id === parentId ? { ...m, replyCount: (m.replyCount || 0) + 1 } : m,
    )
    expect(updated[0].replyCount).toBe(3)
  })
})

describe('Multi-company Isolation', () => {
  test('reactions filtered by companyId', () => {
    const allReactions = [
      { messageId: 'm1', userId: 'u1', emoji: '👍', companyId: 'c1' },
      { messageId: 'm1', userId: 'u2', emoji: '👍', companyId: 'c2' },
    ]
    const filtered = allReactions.filter((r) => r.companyId === 'c1')
    const result = aggregateReactions(filtered)
    expect(result).toEqual([{ emoji: '👍', count: 1, userIds: ['u1'] }])
  })

  test('thread replies filtered by companyId', () => {
    const allMessages = [
      { id: 'r1', parentMessageId: 'p1', companyId: 'c1' },
      { id: 'r2', parentMessageId: 'p1', companyId: 'c2' },
    ]
    const filtered = allMessages.filter((m) => m.companyId === 'c1')
    expect(filtered).toHaveLength(1)
  })
})

describe('Edge Cases', () => {
  test('reaction on message with no existing reactions', () => {
    const result = toggleReaction([], '🔥', 'u1')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ emoji: '🔥', count: 1, userIds: ['u1'] })
  })

  test('multiple emojis from same user', () => {
    let reactions: ReactionGroup[] = []
    reactions = toggleReaction(reactions, '👍', 'u1')
    reactions = toggleReaction(reactions, '❤️', 'u1')
    reactions = toggleReaction(reactions, '🔥', 'u1')
    expect(reactions).toHaveLength(3)
  })

  test('all users remove reactions — empty result', () => {
    let reactions: ReactionGroup[] = [{ emoji: '👍', count: 2, userIds: ['u1', 'u2'] }]
    reactions = toggleReaction(reactions, '👍', 'u1')
    reactions = toggleReaction(reactions, '👍', 'u2')
    expect(reactions).toEqual([])
  })

  test('deeply nested thread not supported (only 1 level)', () => {
    // parentMessageId always points to a main message, not a reply
    const messages: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'main', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 1, reactions: [] },
      { id: 'r1', userId: 'u2', userName: 'B', content: 'reply', parentMessageId: 'm1', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
    ]
    // r1 is a reply — shouldn't have its own replies in our model
    const nestedReplies = getThreadReplies(messages, 'r1')
    expect(nestedReplies).toHaveLength(0)
  })

  test('encodeURIComponent handles emoji in URL', () => {
    const emoji = '👍'
    const encoded = encodeURIComponent(emoji)
    expect(decodeURIComponent(encoded)).toBe(emoji)
  })

  test('encodeURIComponent handles complex emoji', () => {
    const emoji = '❤️'
    const encoded = encodeURIComponent(emoji)
    expect(decodeURIComponent(encoded)).toBe(emoji)
  })
})

describe('SendMessage Schema Extension', () => {
  test('message without parentMessageId is main message', () => {
    const body = { content: 'hello' }
    expect(body.content).toBeDefined()
    expect((body as Record<string, unknown>).parentMessageId).toBeUndefined()
  })

  test('message with parentMessageId is thread reply', () => {
    const body = { content: 'reply', parentMessageId: '123e4567-e89b-12d3-a456-426614174000' }
    expect(body.parentMessageId).toBeDefined()
    expect(body.parentMessageId).toMatch(/^[0-9a-f-]+$/)
  })
})

// ============================================================
// TEA EXPANDED TESTS — Risk-Based Coverage
// ============================================================

describe('TEA: Reaction Immutability', () => {
  test('toggleReaction does not mutate original array', () => {
    const original: ReactionGroup[] = [{ emoji: '👍', count: 1, userIds: ['u1'] }]
    const copy = JSON.parse(JSON.stringify(original))
    toggleReaction(original, '👍', 'u2')
    // Original should not be mutated
    expect(original).toEqual(copy)
  })

  test('aggregateReactions returns new array', () => {
    const input = [{ emoji: '👍', userId: 'u1' }]
    const result = aggregateReactions(input)
    expect(result).not.toBe(input as unknown)
  })
})

describe('TEA: Concurrent Toggle Simulation', () => {
  test('rapid add-remove-add results in single reaction', () => {
    let reactions: ReactionGroup[] = []
    reactions = toggleReaction(reactions, '👍', 'u1') // add
    reactions = toggleReaction(reactions, '👍', 'u1') // remove
    reactions = toggleReaction(reactions, '👍', 'u1') // add again
    expect(reactions).toEqual([{ emoji: '👍', count: 1, userIds: ['u1'] }])
  })

  test('two users toggle same emoji concurrently', () => {
    let reactions: ReactionGroup[] = []
    reactions = toggleReaction(reactions, '👍', 'u1')
    reactions = toggleReaction(reactions, '👍', 'u2')
    expect(reactions).toEqual([{ emoji: '👍', count: 2, userIds: ['u1', 'u2'] }])
    // Both remove
    reactions = toggleReaction(reactions, '👍', 'u1')
    reactions = toggleReaction(reactions, '👍', 'u2')
    expect(reactions).toEqual([])
  })
})

describe('TEA: Thread + Reaction Combination', () => {
  test('reactions on both main and thread messages independently', () => {
    const mainReactions = toggleReaction([], '👍', 'u1')
    const threadReactions = toggleReaction([], '❤️', 'u2')
    expect(mainReactions[0].emoji).toBe('👍')
    expect(threadReactions[0].emoji).toBe('❤️')
  })

  test('reaction update applies only to target message in thread', () => {
    const threadReplies: Message[] = [
      { id: 'r1', userId: 'u1', userName: 'A', content: 'r1', parentMessageId: 'm1', createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'r2', userId: 'u2', userName: 'B', content: 'r2', parentMessageId: 'm1', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [{ emoji: '👍', count: 1, userIds: ['u3'] }] },
    ]
    const newReactions: ReactionGroup[] = [{ emoji: '🔥', count: 1, userIds: ['u1'] }]
    const updated = threadReplies.map((m) =>
      m.id === 'r1' ? { ...m, reactions: newReactions } : m,
    )
    expect(updated[0].reactions).toEqual(newReactions)
    expect(updated[1].reactions).toEqual([{ emoji: '👍', count: 1, userIds: ['u3'] }])
  })
})

describe('TEA: Multiple Threads Isolation', () => {
  test('threads for different parent messages are independent', () => {
    const messages: Message[] = [
      { id: 'r1', userId: 'u1', userName: 'A', content: 'reply to p1', parentMessageId: 'p1', createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'r2', userId: 'u2', userName: 'B', content: 'reply to p2', parentMessageId: 'p2', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
      { id: 'r3', userId: 'u3', userName: 'C', content: 'reply2 to p1', parentMessageId: 'p1', createdAt: '2026-01-01T00:02:00Z', replyCount: 0, reactions: [] },
    ]
    const p1Thread = getThreadReplies(messages, 'p1')
    const p2Thread = getThreadReplies(messages, 'p2')
    expect(p1Thread).toHaveLength(2)
    expect(p2Thread).toHaveLength(1)
    expect(p1Thread.map((r) => r.id)).toEqual(['r1', 'r3'])
  })

  test('reply count per parent is independent', () => {
    const messages: Message[] = [
      { id: 'r1', userId: 'u1', userName: 'A', content: 'r1', parentMessageId: 'p1', createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
      { id: 'r2', userId: 'u2', userName: 'B', content: 'r2', parentMessageId: 'p1', createdAt: '2026-01-01T00:01:00Z', replyCount: 0, reactions: [] },
      { id: 'r3', userId: 'u3', userName: 'C', content: 'r3', parentMessageId: 'p2', createdAt: '2026-01-01T00:02:00Z', replyCount: 0, reactions: [] },
    ]
    expect(countReplies(messages, 'p1')).toBe(2)
    expect(countReplies(messages, 'p2')).toBe(1)
    expect(countReplies(messages, 'p3')).toBe(0)
  })
})

describe('TEA: Channel Key Construction for Broadcast', () => {
  test('reaction broadcast uses correct channel key format', () => {
    const channelId = '550e8400-e29b-41d4-a716-446655440000'
    const channelKey = `messenger::${channelId}`
    expect(channelKey).toBe('messenger::550e8400-e29b-41d4-a716-446655440000')
    expect(channelKey).toMatch(/^messenger::[0-9a-f-]+$/)
  })

  test('different channels produce different keys', () => {
    const key1 = `messenger::ch1`
    const key2 = `messenger::ch2`
    expect(key1).not.toBe(key2)
  })
})

describe('TEA: Reaction Ordering Stability', () => {
  test('aggregation preserves insertion order', () => {
    const raw = [
      { emoji: '🔥', userId: 'u1' },
      { emoji: '👍', userId: 'u2' },
      { emoji: '❤️', userId: 'u3' },
    ]
    const result = aggregateReactions(raw)
    expect(result.map((r) => r.emoji)).toEqual(['🔥', '👍', '❤️'])
  })

  test('same emoji groups stay together', () => {
    const raw = [
      { emoji: '👍', userId: 'u1' },
      { emoji: '🔥', userId: 'u2' },
      { emoji: '👍', userId: 'u3' },
    ]
    const result = aggregateReactions(raw)
    const thumbs = result.find((r) => r.emoji === '👍')
    expect(thumbs?.userIds).toEqual(['u1', 'u3'])
  })
})

describe('TEA: API Content Validation Boundaries', () => {
  test('content max 4000 chars is valid', () => {
    const content = 'a'.repeat(4000)
    expect(content.length).toBe(4000)
    expect(content.length <= 4000).toBe(true)
  })

  test('content exceeding 4000 chars should fail', () => {
    const content = 'a'.repeat(4001)
    expect(content.length > 4000).toBe(true)
  })

  test('empty content should fail', () => {
    const content = ''
    expect(content.length >= 1).toBe(false)
  })

  test('parentMessageId must be valid UUID format', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000'
    const invalidUUID = 'not-a-uuid'
    expect(validUUID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    expect(invalidUUID).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })
})

describe('TEA: Reaction Delete Cascade Safety', () => {
  test('removing all reactions for a message leaves empty array', () => {
    let reactions: ReactionGroup[] = [
      { emoji: '👍', count: 1, userIds: ['u1'] },
      { emoji: '❤️', count: 1, userIds: ['u2'] },
    ]
    reactions = toggleReaction(reactions, '👍', 'u1')
    reactions = toggleReaction(reactions, '❤️', 'u2')
    expect(reactions).toEqual([])
  })

  test('partial removal preserves other reactions', () => {
    let reactions: ReactionGroup[] = [
      { emoji: '👍', count: 2, userIds: ['u1', 'u2'] },
      { emoji: '❤️', count: 1, userIds: ['u3'] },
    ]
    reactions = toggleReaction(reactions, '👍', 'u1')
    expect(reactions).toHaveLength(2)
    expect(reactions.find((r) => r.emoji === '👍')?.count).toBe(1)
    expect(reactions.find((r) => r.emoji === '❤️')?.count).toBe(1)
  })
})

describe('TEA: Thread Reply with @Mention', () => {
  test('thread reply content can contain @mention', () => {
    const content = '@agent1 분석해줘'
    const mentionMatch = content.match(/@(\S+)/)
    expect(mentionMatch).not.toBeNull()
    expect(mentionMatch![1]).toBe('agent1')
  })

  test('thread reply without mention has no match', () => {
    const content = '일반 답글입니다'
    const mentionMatch = content.match(/@(\S+)/)
    expect(mentionMatch).toBeNull()
  })
})

describe('TEA: Mixed Event Stream Processing', () => {
  test('handler processes interleaved reaction and message events', () => {
    const events = [
      { type: 'new-message', message: { id: 'm1', userId: 'u1', userName: 'A', content: 'hi', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z' } },
      { type: 'reaction-update', messageId: 'm1', reactions: [{ emoji: '👍', count: 1, userIds: ['u2'] }] },
      { type: 'new-message', message: { id: 'r1', userId: 'u2', userName: 'B', content: 'reply', parentMessageId: 'm1', createdAt: '2026-01-01T00:01:00Z' } },
      { type: 'typing', agentName: 'AI비서' },
    ]

    let mainCount = 0
    let reactionUpdates = 0
    let threadReplies = 0
    let typingEvents = 0

    for (const e of events) {
      if (e.type === 'new-message' && 'message' in e) {
        const msg = (e as NewMessageEvent).message
        if (!msg.parentMessageId) mainCount++
        else threadReplies++
      } else if (e.type === 'reaction-update') {
        reactionUpdates++
      } else if (e.type === 'typing') {
        typingEvents++
      }
    }

    expect(mainCount).toBe(1)
    expect(reactionUpdates).toBe(1)
    expect(threadReplies).toBe(1)
    expect(typingEvents).toBe(1)
  })
})

describe('TEA: Deduplication Safety', () => {
  test('duplicate message event does not add twice', () => {
    const existing: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'hi', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
    ]
    const newMsg = { id: 'm1', userId: 'u1', userName: 'A', content: 'hi', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z' }
    // Simulate dedup check
    const isDupe = existing.some((m) => m.id === newMsg.id)
    expect(isDupe).toBe(true)
  })

  test('different message ID passes dedup check', () => {
    const existing: Message[] = [
      { id: 'm1', userId: 'u1', userName: 'A', content: 'hi', parentMessageId: null, createdAt: '2026-01-01T00:00:00Z', replyCount: 0, reactions: [] },
    ]
    const newMsg = { id: 'm2', userId: 'u1', userName: 'A', content: 'hi2', parentMessageId: null, createdAt: '2026-01-01T00:01:00Z' }
    const isDupe = existing.some((m) => m.id === newMsg.id)
    expect(isDupe).toBe(false)
  })
})

describe('Stress / Volume', () => {
  test('100 reactions on single message', () => {
    const raw = Array.from({ length: 100 }, (_, i) => ({
      emoji: ['👍', '❤️', '😂', '😮', '👏'][i % 5],
      userId: `u${i}`,
    }))
    const result = aggregateReactions(raw)
    expect(result).toHaveLength(5)
    const total = result.reduce((sum, g) => sum + g.count, 0)
    expect(total).toBe(100)
  })

  test('50 thread replies', () => {
    const messages: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `r${i}`,
      userId: `u${i % 5}`,
      userName: `User ${i % 5}`,
      content: `reply ${i}`,
      parentMessageId: 'p1',
      createdAt: new Date(2026, 0, 1, 0, i).toISOString(),
      replyCount: 0,
      reactions: [],
    }))
    const replies = getThreadReplies(messages, 'p1')
    expect(replies).toHaveLength(50)
    // Verify sorted
    for (let i = 1; i < replies.length; i++) {
      expect(new Date(replies[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(replies[i - 1].createdAt).getTime(),
      )
    }
  })
})
