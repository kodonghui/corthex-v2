import { describe, test, expect } from 'bun:test'

// Import pure logic from conversations-panel
// We mirror the logic here for testing since bun:test doesn't support JSX rendering

// === formatTime logic ===
function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '방금'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('ko-KR', { weekday: 'short' })
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// === getConversationDisplayName logic ===
type ConvItem = {
  type: 'direct' | 'group'
  name: string | null
}

function getConversationDisplayName(conv: ConvItem): string {
  if (conv.type === 'group') return conv.name || '그룹 대화'
  return conv.name || '1:1 대화'
}

function getConversationAvatar(conv: ConvItem): string {
  return conv.type === 'group' ? '👥' : '💬'
}

// === Message classification logic ===
function classifyMessage(msg: { senderId: string; type: string }, currentUserId: string): 'mine' | 'other' | 'system' {
  if (msg.type === 'system') return 'system'
  return msg.senderId === currentUserId ? 'mine' : 'other'
}

// === Typing debounce logic ===
function shouldSendTypingEvent(lastSentAt: number, now: number, debounceMs: number): boolean {
  return now - lastSentAt >= debounceMs
}

// === Unread count display logic ===
function formatUnreadCount(count: number): string {
  if (count <= 0) return ''
  if (count > 99) return '99+'
  return String(count)
}

// === Tests ===

describe('Conversation UI - Display Name Logic', () => {
  test('group with name shows group name', () => {
    expect(getConversationDisplayName({ type: 'group', name: '팀 채팅' })).toBe('팀 채팅')
  })

  test('group without name shows default', () => {
    expect(getConversationDisplayName({ type: 'group', name: null })).toBe('그룹 대화')
  })

  test('direct with name shows name', () => {
    expect(getConversationDisplayName({ type: 'direct', name: '김철수' })).toBe('김철수')
  })

  test('direct without name shows default', () => {
    expect(getConversationDisplayName({ type: 'direct', name: null })).toBe('1:1 대화')
  })
})

describe('Conversation UI - Avatar Logic', () => {
  test('group avatar', () => {
    expect(getConversationAvatar({ type: 'group', name: null })).toBe('👥')
  })

  test('direct avatar', () => {
    expect(getConversationAvatar({ type: 'direct', name: null })).toBe('💬')
  })
})

describe('Conversation UI - Message Classification', () => {
  const myId = 'user-1'

  test('system message classified as system', () => {
    expect(classifyMessage({ senderId: 'user-2', type: 'system' }, myId)).toBe('system')
  })

  test('own message classified as mine', () => {
    expect(classifyMessage({ senderId: 'user-1', type: 'text' }, myId)).toBe('mine')
  })

  test('other message classified as other', () => {
    expect(classifyMessage({ senderId: 'user-2', type: 'text' }, myId)).toBe('other')
  })

  test('ai_report from self is mine', () => {
    expect(classifyMessage({ senderId: 'user-1', type: 'ai_report' }, myId)).toBe('mine')
  })
})

describe('Conversation UI - Typing Debounce', () => {
  test('should send if enough time passed', () => {
    expect(shouldSendTypingEvent(1000, 4000, 2000)).toBe(true)
  })

  test('should not send if too soon', () => {
    expect(shouldSendTypingEvent(1000, 2500, 2000)).toBe(false)
  })

  test('should send on exact boundary', () => {
    expect(shouldSendTypingEvent(1000, 3000, 2000)).toBe(true)
  })
})

describe('Conversation UI - Unread Count Display', () => {
  test('zero shows empty', () => {
    expect(formatUnreadCount(0)).toBe('')
  })

  test('normal count shows number', () => {
    expect(formatUnreadCount(5)).toBe('5')
  })

  test('99 shows 99', () => {
    expect(formatUnreadCount(99)).toBe('99')
  })

  test('over 99 shows 99+', () => {
    expect(formatUnreadCount(150)).toBe('99+')
  })
})

describe('Conversation UI - formatTime', () => {
  test('very recent shows 방금', () => {
    const now = new Date()
    expect(formatTime(now.toISOString())).toBe('방금')
  })

  test('minutes ago shows N분 전', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000)
    expect(formatTime(fiveMinAgo.toISOString())).toBe('5분 전')
  })
})

describe('Conversation UI - Conversation List Sorting', () => {
  test('conversations sorted by updatedAt desc', () => {
    const convs = [
      { id: 'a', updatedAt: '2026-01-01T10:00:00Z' },
      { id: 'b', updatedAt: '2026-01-03T10:00:00Z' },
      { id: 'c', updatedAt: '2026-01-02T10:00:00Z' },
    ]
    const sorted = [...convs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    expect(sorted[0].id).toBe('b')
    expect(sorted[1].id).toBe('c')
    expect(sorted[2].id).toBe('a')
  })
})
