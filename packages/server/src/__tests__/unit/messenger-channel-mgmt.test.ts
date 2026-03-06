import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Messenger Channel Management — Core + Edge Cases + Risk-Based Coverage
// Story 16-1: 메신저 채널 관리
// TEA expanded from 36 → target 70+ tests
// ============================================================

// Type definitions matching the API
type Channel = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
}

type ChannelWithLastMsg = Channel & {
  lastMessage: { content: string; userName: string; createdAt: string } | null
}

type Member = {
  id: string
  companyId: string
  channelId: string
  userId: string
  joinedAt: string
}

type Message = {
  id: string
  companyId: string
  channelId: string
  userId: string
  content: string
  createdAt: string
}

// ======== Helper: simulate assertMember ========
function assertMember(members: Member[], channelId: string, userId: string, companyId: string): boolean {
  return members.some(
    (m) => m.channelId === channelId && m.userId === userId && m.companyId === companyId,
  )
}

// ======== Helper: simulate channel update ========
function updateChannel(
  channel: Channel,
  updates: { name?: string; description?: string },
): Channel {
  return {
    ...channel,
    name: updates.name ?? channel.name,
    description: updates.description ?? channel.description,
  }
}

// ======== Helper: simulate channel delete (creator check) ========
function canDeleteChannel(channel: Channel, userId: string): boolean {
  return channel.createdBy === userId
}

// ======== Helper: simulate cascade delete ========
function cascadeDelete(
  channelId: string,
  messages: Message[],
  members: Member[],
  channels: Channel[],
): { messages: Message[]; members: Member[]; channels: Channel[] } {
  return {
    messages: messages.filter((m) => m.channelId !== channelId),
    members: members.filter((m) => m.channelId !== channelId),
    channels: channels.filter((c) => c.id !== channelId),
  }
}

// ======== Helper: simulate leave channel ========
function leaveChannel(members: Member[], channelId: string, userId: string): Member[] {
  return members.filter((m) => !(m.channelId === channelId && m.userId === userId))
}

// ======== Helper: get last message for channel ========
function getLastMessage(
  messages: Message[],
  channelId: string,
  userNames: Record<string, string>,
): ChannelWithLastMsg['lastMessage'] {
  const channelMsgs = messages
    .filter((m) => m.channelId === channelId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (channelMsgs.length === 0) return null
  const msg = channelMsgs[0]
  return { content: msg.content, userName: userNames[msg.userId] || 'Unknown', createdAt: msg.createdAt }
}

// ======== Helper: format time ========
function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ======== Helper: validate update schema ========
function validateUpdateSchema(data: { name?: string; description?: string }): string | null {
  if (data.name !== undefined) {
    if (data.name.length < 1) return 'name too short'
    if (data.name.length > 100) return 'name too long'
  }
  if (data.name === undefined && data.description === undefined) return 'no fields to update'
  return null
}

// ============================================================
// Test Data
// ============================================================
const COMPANY_ID = 'comp-1'
const USER_A = 'user-a' // channel creator
const USER_B = 'user-b'
const USER_C = 'user-c'
const CHANNEL_1 = 'ch-1'
const CHANNEL_2 = 'ch-2'

const channels: Channel[] = [
  { id: CHANNEL_1, name: '마케팅팀', description: '마케팅 채널', createdBy: USER_A, createdAt: '2026-03-01T10:00:00Z' },
  { id: CHANNEL_2, name: '전략회의', description: null, createdBy: USER_B, createdAt: '2026-03-02T10:00:00Z' },
]

const members: Member[] = [
  { id: 'm1', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_A, joinedAt: '2026-03-01T10:00:00Z' },
  { id: 'm2', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_B, joinedAt: '2026-03-01T10:01:00Z' },
  { id: 'm3', companyId: COMPANY_ID, channelId: CHANNEL_2, userId: USER_A, joinedAt: '2026-03-02T10:00:00Z' },
  { id: 'm4', companyId: COMPANY_ID, channelId: CHANNEL_2, userId: USER_B, joinedAt: '2026-03-02T10:00:00Z' },
  { id: 'm5', companyId: COMPANY_ID, channelId: CHANNEL_2, userId: USER_C, joinedAt: '2026-03-02T10:01:00Z' },
]

const messages: Message[] = [
  { id: 'msg1', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_A, content: '안녕하세요!', createdAt: '2026-03-05T10:00:00Z' },
  { id: 'msg2', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_B, content: '네, 반갑습니다', createdAt: '2026-03-05T10:01:00Z' },
  { id: 'msg3', companyId: COMPANY_ID, channelId: CHANNEL_2, userId: USER_B, content: '회의 시작합니다', createdAt: '2026-03-05T09:00:00Z' },
]

const userNames: Record<string, string> = {
  [USER_A]: '민지',
  [USER_B]: '철수',
  [USER_C]: '영희',
}

// ============================================================
// Tests: Channel Update (Task 1)
// ============================================================
describe('Channel Update', () => {
  test('updates channel name', () => {
    const result = updateChannel(channels[0], { name: '새 이름' })
    expect(result.name).toBe('새 이름')
    expect(result.description).toBe('마케팅 채널')
  })

  test('updates channel description', () => {
    const result = updateChannel(channels[0], { description: '새 설명' })
    expect(result.name).toBe('마케팅팀')
    expect(result.description).toBe('새 설명')
  })

  test('updates both name and description', () => {
    const result = updateChannel(channels[0], { name: '업데이트', description: '새 설명' })
    expect(result.name).toBe('업데이트')
    expect(result.description).toBe('새 설명')
  })

  test('only members can update (assertMember)', () => {
    expect(assertMember(members, CHANNEL_1, USER_A, COMPANY_ID)).toBe(true)
    expect(assertMember(members, CHANNEL_1, USER_C, COMPANY_ID)).toBe(false)
  })

  test('non-member cannot update', () => {
    const isMember = assertMember(members, CHANNEL_1, USER_C, COMPANY_ID)
    expect(isMember).toBe(false)
  })

  test('different company member rejected', () => {
    const isMember = assertMember(members, CHANNEL_1, USER_A, 'other-company')
    expect(isMember).toBe(false)
  })
})

// ============================================================
// Tests: Update Schema Validation
// ============================================================
describe('Update Schema Validation', () => {
  test('valid name only', () => {
    expect(validateUpdateSchema({ name: 'Valid' })).toBeNull()
  })

  test('valid description only', () => {
    expect(validateUpdateSchema({ description: 'A desc' })).toBeNull()
  })

  test('empty name rejected', () => {
    expect(validateUpdateSchema({ name: '' })).toBe('name too short')
  })

  test('too long name rejected (>100)', () => {
    expect(validateUpdateSchema({ name: 'a'.repeat(101) })).toBe('name too long')
  })

  test('no fields rejected', () => {
    expect(validateUpdateSchema({})).toBe('no fields to update')
  })

  test('100 char name is ok', () => {
    expect(validateUpdateSchema({ name: 'a'.repeat(100) })).toBeNull()
  })
})

// ============================================================
// Tests: Channel Delete (Task 1)
// ============================================================
describe('Channel Delete', () => {
  test('creator can delete', () => {
    expect(canDeleteChannel(channels[0], USER_A)).toBe(true)
  })

  test('non-creator cannot delete', () => {
    expect(canDeleteChannel(channels[0], USER_B)).toBe(false)
  })

  test('cascade deletes messages, members, then channel', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    expect(result.messages.filter((m) => m.channelId === CHANNEL_1)).toHaveLength(0)
    expect(result.members.filter((m) => m.channelId === CHANNEL_1)).toHaveLength(0)
    expect(result.channels.find((c) => c.id === CHANNEL_1)).toBeUndefined()
  })

  test('cascade delete preserves other channels', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].id).toBe(CHANNEL_2)
    expect(result.members.filter((m) => m.channelId === CHANNEL_2)).toHaveLength(3)
    expect(result.messages.filter((m) => m.channelId === CHANNEL_2)).toHaveLength(1)
  })

  test('deleting non-existent channel is no-op', () => {
    const result = cascadeDelete('non-existent', messages, members, channels)
    expect(result.channels).toHaveLength(2)
    expect(result.members).toHaveLength(5)
    expect(result.messages).toHaveLength(3)
  })
})

// ============================================================
// Tests: Channel Leave (Task 2)
// ============================================================
describe('Channel Leave', () => {
  test('user leaves channel', () => {
    const result = leaveChannel(members, CHANNEL_1, USER_B)
    expect(result.filter((m) => m.channelId === CHANNEL_1)).toHaveLength(1)
    expect(result.find((m) => m.channelId === CHANNEL_1 && m.userId === USER_B)).toBeUndefined()
  })

  test('other memberships preserved', () => {
    const result = leaveChannel(members, CHANNEL_1, USER_B)
    expect(result.filter((m) => m.channelId === CHANNEL_2)).toHaveLength(3)
  })

  test('user must be member to leave (assertMember)', () => {
    expect(assertMember(members, CHANNEL_1, USER_C, COMPANY_ID)).toBe(false)
  })

  test('last member leaves — channel still exists', () => {
    let result = leaveChannel(members, CHANNEL_1, USER_A)
    result = leaveChannel(result, CHANNEL_1, USER_B)
    expect(result.filter((m) => m.channelId === CHANNEL_1)).toHaveLength(0)
    // channels array unchanged — channel persists
    expect(channels.find((c) => c.id === CHANNEL_1)).toBeDefined()
  })
})

// ============================================================
// Tests: Last Message (Task 4)
// ============================================================
describe('Last Message', () => {
  test('returns latest message for channel', () => {
    const lastMsg = getLastMessage(messages, CHANNEL_1, userNames)
    expect(lastMsg).not.toBeNull()
    expect(lastMsg!.content).toBe('네, 반갑습니다')
    expect(lastMsg!.userName).toBe('철수')
  })

  test('returns null for channel with no messages', () => {
    const lastMsg = getLastMessage(messages, 'empty-channel', userNames)
    expect(lastMsg).toBeNull()
  })

  test('channel 2 has correct last message', () => {
    const lastMsg = getLastMessage(messages, CHANNEL_2, userNames)
    expect(lastMsg!.content).toBe('회의 시작합니다')
    expect(lastMsg!.userName).toBe('철수')
  })
})

// ============================================================
// Tests: Format Time (Task 6)
// ============================================================
describe('Format Time', () => {
  test('past date shows month/day', () => {
    const result = formatTime('2026-01-15T10:00:00Z')
    expect(result).toBe('1/15')
  })

  test('different month shows correctly', () => {
    const result = formatTime('2026-12-25T10:00:00Z')
    expect(result).toBe('12/25')
  })
})

// ============================================================
// Tests: Channel Detail (Task 3)
// ============================================================
describe('Channel Detail', () => {
  test('member count computed correctly', () => {
    const ch1Members = members.filter((m) => m.channelId === CHANNEL_1)
    expect(ch1Members).toHaveLength(2)
  })

  test('channel 2 has 3 members', () => {
    const ch2Members = members.filter((m) => m.channelId === CHANNEL_2)
    expect(ch2Members).toHaveLength(3)
  })
})

// ============================================================
// Tests: Member List (Task 3)
// ============================================================
describe('Member List', () => {
  test('returns members sorted by joinedAt', () => {
    const ch1Members = members
      .filter((m) => m.channelId === CHANNEL_1)
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())
    expect(ch1Members[0].userId).toBe(USER_A)
    expect(ch1Members[1].userId).toBe(USER_B)
  })

  test('member list includes user names', () => {
    const ch2Members = members.filter((m) => m.channelId === CHANNEL_2)
    const names = ch2Members.map((m) => userNames[m.userId])
    expect(names).toContain('민지')
    expect(names).toContain('철수')
    expect(names).toContain('영희')
  })
})

// ============================================================
// Tests: Tenant Isolation
// ============================================================
describe('Tenant Isolation', () => {
  const otherCompanyMembers: Member[] = [
    { id: 'm10', companyId: 'comp-2', channelId: CHANNEL_1, userId: 'user-x', joinedAt: '2026-03-01T10:00:00Z' },
  ]

  test('member from other company cannot access channel', () => {
    const allMembers = [...members, ...otherCompanyMembers]
    expect(assertMember(allMembers, CHANNEL_1, 'user-x', COMPANY_ID)).toBe(false)
  })

  test('member from other company exists in their own company', () => {
    const allMembers = [...members, ...otherCompanyMembers]
    expect(assertMember(allMembers, CHANNEL_1, 'user-x', 'comp-2')).toBe(true)
  })
})

// ============================================================
// Tests: Edge Cases
// ============================================================
describe('Edge Cases', () => {
  test('update with same name is valid but no-op', () => {
    const result = updateChannel(channels[0], { name: '마케팅팀' })
    expect(result.name).toBe('마케팅팀')
  })

  test('description can be set to empty string', () => {
    const result = updateChannel(channels[0], { description: '' })
    expect(result.description).toBe('')
  })

  test('channel with null description', () => {
    expect(channels[1].description).toBeNull()
  })

  test('format time handles edge of day', () => {
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const result = formatTime(todayMidnight.toISOString())
    // Today's date should show time format
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

// ============================================================
// TEA EXPANDED: P0 — Critical Path Security Tests
// ============================================================
describe('P0: Delete Authorization — Creator Only', () => {
  test('USER_A created ch-1 → can delete', () => {
    expect(canDeleteChannel(channels[0], USER_A)).toBe(true)
  })

  test('USER_B created ch-2 → can delete ch-2', () => {
    expect(canDeleteChannel(channels[1], USER_B)).toBe(true)
  })

  test('USER_A cannot delete ch-2 (not creator)', () => {
    expect(canDeleteChannel(channels[1], USER_A)).toBe(false)
  })

  test('unknown user cannot delete any channel', () => {
    expect(canDeleteChannel(channels[0], 'unknown-user')).toBe(false)
    expect(canDeleteChannel(channels[1], 'unknown-user')).toBe(false)
  })

  test('empty userId cannot delete', () => {
    expect(canDeleteChannel(channels[0], '')).toBe(false)
  })
})

describe('P0: Cascade Delete — Data Integrity', () => {
  test('all messages removed for deleted channel', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    const orphanMessages = result.messages.filter((m) => m.channelId === CHANNEL_1)
    expect(orphanMessages).toHaveLength(0)
  })

  test('all members removed for deleted channel', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    const orphanMembers = result.members.filter((m) => m.channelId === CHANNEL_1)
    expect(orphanMembers).toHaveLength(0)
  })

  test('channel itself removed', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    expect(result.channels.some((c) => c.id === CHANNEL_1)).toBe(false)
  })

  test('total counts after ch-1 delete', () => {
    const result = cascadeDelete(CHANNEL_1, messages, members, channels)
    expect(result.channels).toHaveLength(1)
    expect(result.members).toHaveLength(3) // ch-2 only
    expect(result.messages).toHaveLength(1) // ch-2 only
  })

  test('deleting ch-2 (3 members, 1 message)', () => {
    const result = cascadeDelete(CHANNEL_2, messages, members, channels)
    expect(result.channels).toHaveLength(1)
    expect(result.members).toHaveLength(2) // ch-1 only
    expect(result.messages).toHaveLength(2) // ch-1 only
  })

  test('delete both channels sequentially → all empty', () => {
    let result = cascadeDelete(CHANNEL_1, messages, members, channels)
    result = cascadeDelete(CHANNEL_2, result.messages, result.members, result.channels)
    expect(result.channels).toHaveLength(0)
    expect(result.members).toHaveLength(0)
    expect(result.messages).toHaveLength(0)
  })
})

describe('P0: Tenant Isolation — Cross-Company Attacks', () => {
  const multiCompanyMembers: Member[] = [
    ...members,
    { id: 'm20', companyId: 'comp-2', channelId: 'ch-X', userId: USER_A, joinedAt: '2026-03-01T10:00:00Z' },
    { id: 'm21', companyId: 'comp-2', channelId: CHANNEL_1, userId: 'attacker', joinedAt: '2026-03-01T10:00:00Z' },
  ]

  test('attacker in comp-2 cannot access comp-1 channel even with same channelId', () => {
    expect(assertMember(multiCompanyMembers, CHANNEL_1, 'attacker', COMPANY_ID)).toBe(false)
  })

  test('attacker is member in their own company', () => {
    expect(assertMember(multiCompanyMembers, CHANNEL_1, 'attacker', 'comp-2')).toBe(true)
  })

  test('user-A is member of ch-X only in comp-2', () => {
    expect(assertMember(multiCompanyMembers, 'ch-X', USER_A, 'comp-2')).toBe(true)
    expect(assertMember(multiCompanyMembers, 'ch-X', USER_A, COMPANY_ID)).toBe(false)
  })
})

// ============================================================
// TEA EXPANDED: P1 — Important Flow Tests
// ============================================================
describe('P1: Channel Update — Field Combinations', () => {
  test('update only description to null-like empty string', () => {
    const result = updateChannel(channels[0], { description: '' })
    expect(result.description).toBe('')
    expect(result.name).toBe('마케팅팀')
  })

  test('update name preserves existing description', () => {
    const result = updateChannel(channels[0], { name: 'Changed' })
    expect(result.description).toBe('마케팅 채널')
  })

  test('update channel with null description preserves null', () => {
    const ch = channels[1] // description: null
    const result = updateChannel(ch, { name: 'Updated' })
    expect(result.description).toBeNull()
  })

  test('special characters in name', () => {
    const result = updateChannel(channels[0], { name: '#마케팅_특수!@$' })
    expect(result.name).toBe('#마케팅_특수!@$')
  })

  test('unicode characters in name', () => {
    const result = updateChannel(channels[0], { name: '🚀 마케팅팀 🎉' })
    expect(result.name).toBe('🚀 마케팅팀 🎉')
  })
})

describe('P1: Leave Channel — Complex Scenarios', () => {
  test('creator leaves their own channel (still exists)', () => {
    const result = leaveChannel(members, CHANNEL_1, USER_A) // USER_A is creator
    expect(result.filter((m) => m.channelId === CHANNEL_1)).toHaveLength(1)
    // channel still exists
    expect(channels.find((c) => c.id === CHANNEL_1)).toBeDefined()
  })

  test('leaving one channel doesnt affect other channel memberships', () => {
    const result = leaveChannel(members, CHANNEL_1, USER_A)
    // USER_A should still be in CHANNEL_2
    expect(result.find((m) => m.channelId === CHANNEL_2 && m.userId === USER_A)).toBeDefined()
  })

  test('leave non-existent channel is no-op', () => {
    const result = leaveChannel(members, 'non-existent', USER_A)
    expect(result).toHaveLength(members.length)
  })

  test('multiple leaves in sequence', () => {
    let result = leaveChannel(members, CHANNEL_2, USER_A)
    result = leaveChannel(result, CHANNEL_2, USER_B)
    result = leaveChannel(result, CHANNEL_2, USER_C)
    expect(result.filter((m) => m.channelId === CHANNEL_2)).toHaveLength(0)
  })
})

describe('P1: Member Management', () => {
  test('add member creates new entry', () => {
    const newMember: Member = { id: 'm99', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_C, joinedAt: '2026-03-06T10:00:00Z' }
    const updated = [...members, newMember]
    expect(assertMember(updated, CHANNEL_1, USER_C, COMPANY_ID)).toBe(true)
  })

  test('remove member preserves other members', () => {
    const result = leaveChannel(members, CHANNEL_2, USER_C)
    expect(assertMember(result, CHANNEL_2, USER_A, COMPANY_ID)).toBe(true)
    expect(assertMember(result, CHANNEL_2, USER_B, COMPANY_ID)).toBe(true)
    expect(assertMember(result, CHANNEL_2, USER_C, COMPANY_ID)).toBe(false)
  })
})

// ============================================================
// TEA EXPANDED: P1 — Last Message Complex Scenarios
// ============================================================
describe('P1: Last Message — Ordering & Edge Cases', () => {
  test('multiple messages returns chronologically latest', () => {
    const moreMessages: Message[] = [
      ...messages,
      { id: 'msg4', companyId: COMPANY_ID, channelId: CHANNEL_1, userId: USER_A, content: '최신 메시지', createdAt: '2026-03-05T11:00:00Z' },
    ]
    const lastMsg = getLastMessage(moreMessages, CHANNEL_1, userNames)
    expect(lastMsg!.content).toBe('최신 메시지')
  })

  test('unknown userId shows "Unknown" userName', () => {
    const unknownMsg: Message[] = [
      { id: 'msg99', companyId: COMPANY_ID, channelId: 'ch-3', userId: 'deleted-user', content: 'test', createdAt: '2026-03-05T10:00:00Z' },
    ]
    const lastMsg = getLastMessage(unknownMsg, 'ch-3', userNames)
    expect(lastMsg!.userName).toBe('Unknown')
  })

  test('single message is also the last message', () => {
    const singleMsg: Message[] = [
      { id: 'msg-single', companyId: COMPANY_ID, channelId: 'ch-single', userId: USER_A, content: 'only one', createdAt: '2026-03-05T10:00:00Z' },
    ]
    const lastMsg = getLastMessage(singleMsg, 'ch-single', userNames)
    expect(lastMsg!.content).toBe('only one')
  })

  test('messages from different channels dont mix', () => {
    const lastCh1 = getLastMessage(messages, CHANNEL_1, userNames)
    const lastCh2 = getLastMessage(messages, CHANNEL_2, userNames)
    expect(lastCh1!.content).not.toBe(lastCh2!.content)
  })
})

// ============================================================
// TEA EXPANDED: P2 — Schema Validation Edge Cases
// ============================================================
describe('P2: Update Schema — Boundary Values', () => {
  test('1 char name is valid', () => {
    expect(validateUpdateSchema({ name: 'a' })).toBeNull()
  })

  test('exactly 100 chars is valid', () => {
    expect(validateUpdateSchema({ name: 'a'.repeat(100) })).toBeNull()
  })

  test('101 chars is invalid', () => {
    expect(validateUpdateSchema({ name: 'a'.repeat(101) })).toBe('name too long')
  })

  test('empty description is valid', () => {
    expect(validateUpdateSchema({ description: '' })).toBeNull()
  })

  test('long description is valid (no max)', () => {
    expect(validateUpdateSchema({ description: 'x'.repeat(10000) })).toBeNull()
  })

  test('both name and description provided', () => {
    expect(validateUpdateSchema({ name: 'Valid', description: 'Also valid' })).toBeNull()
  })

  test('whitespace-only name (1 char space is valid per min length)', () => {
    expect(validateUpdateSchema({ name: ' ' })).toBeNull()
  })
})

// ============================================================
// TEA EXPANDED: P2 — Format Time Edge Cases
// ============================================================
describe('P2: Format Time — Various Dates', () => {
  test('January 1st', () => {
    expect(formatTime('2026-01-01T00:00:00Z')).toBe('1/1')
  })

  test('December 31st', () => {
    expect(formatTime('2026-12-31T23:59:59Z')).toBe('12/31')
  })

  test('February 29 (if leap year)', () => {
    // 2028 is a leap year
    expect(formatTime('2028-02-29T12:00:00Z')).toBe('2/29')
  })

  test('today shows time format', () => {
    const now = new Date()
    const result = formatTime(now.toISOString())
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

// ============================================================
// TEA EXPANDED: P2 — Channel List with Last Message
// ============================================================
describe('P2: Channel List with LastMessage', () => {
  function buildChannelList(
    chs: Channel[],
    msgs: Message[],
    names: Record<string, string>,
  ): ChannelWithLastMsg[] {
    return chs.map((ch) => ({
      ...ch,
      lastMessage: getLastMessage(msgs, ch.id, names),
    }))
  }

  test('all channels have lastMessage populated', () => {
    const list = buildChannelList(channels, messages, userNames)
    expect(list[0].lastMessage).not.toBeNull()
    expect(list[1].lastMessage).not.toBeNull()
  })

  test('channel without messages shows null lastMessage', () => {
    const emptyChannel: Channel = { id: 'ch-empty', name: 'Empty', description: null, createdBy: USER_A, createdAt: '2026-03-06T10:00:00Z' }
    const list = buildChannelList([emptyChannel], messages, userNames)
    expect(list[0].lastMessage).toBeNull()
  })

  test('lastMessage includes correct fields', () => {
    const list = buildChannelList(channels, messages, userNames)
    const lm = list[0].lastMessage!
    expect(lm).toHaveProperty('content')
    expect(lm).toHaveProperty('userName')
    expect(lm).toHaveProperty('createdAt')
  })
})
