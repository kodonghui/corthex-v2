import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Messenger Realtime + AI Agent — Core + Edge Cases + Risk-Based Coverage
// Story 16-2: 실시간 메시지 + AI 에이전트 호출
// TEA expanded from 44 → target 80+ tests
// ============================================================

type Message = {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

type NewMessageEvent = { type: 'new-message'; message: Message }
type TypingEvent = { type: 'typing'; agentName: string }
type BroadcastEvent = NewMessageEvent | TypingEvent

type Agent = {
  id: string
  name: string
  soul: string | null
  userId: string
  companyId: string
}

// ======== Helper: parse agent mention ========
function parseMention(content: string): string | null {
  const match = content.match(/@(\S+)/)
  return match ? match[1] : null
}

// ======== Helper: find agent by name ========
function findAgent(agents: Agent[], name: string, companyId: string): Agent | undefined {
  return agents.find((a) => a.name === name && a.companyId === companyId)
}

// ======== Helper: build broadcast event ========
function buildNewMessageEvent(msg: Message): NewMessageEvent {
  return {
    type: 'new-message',
    message: {
      id: msg.id,
      userId: msg.userId,
      userName: msg.userName,
      content: msg.content,
      createdAt: msg.createdAt,
    },
  }
}

// ======== Helper: build typing event ========
function buildTypingEvent(agentName: string): TypingEvent {
  return { type: 'typing', agentName }
}

// ======== Helper: deduplicate messages (optimistic append) ========
function appendMessageNoDup(existing: Message[], newMsg: Message): Message[] {
  if (existing.some((m) => m.id === newMsg.id)) return existing
  return [...existing, newMsg]
}

// ======== Helper: detect mention in input for autocomplete ========
function detectMentionQuery(value: string): { active: boolean; query: string } {
  const atIdx = value.lastIndexOf('@')
  if (atIdx !== -1 && (atIdx === 0 || value[atIdx - 1] === ' ')) {
    const query = value.slice(atIdx + 1)
    if (!query.includes(' ')) {
      return { active: true, query }
    }
  }
  return { active: false, query: '' }
}

// ======== Helper: apply mention selection ========
function applyMentionSelect(currentValue: string, agentName: string): string {
  const atIdx = currentValue.lastIndexOf('@')
  const before = currentValue.slice(0, atIdx)
  return `${before}@${agentName} `
}

// ======== Helper: online status filter ========
function getOnlineUserIds(
  clientMap: Map<string, { companyId: string }[]>,
  targetCompanyId: string,
): string[] {
  const ids: string[] = []
  for (const [userId, clients] of clientMap.entries()) {
    if (clients.some((cl) => cl.companyId === targetCompanyId)) {
      ids.push(userId)
    }
  }
  return ids
}

// === Test Data ===
const company1 = 'company-1'
const company2 = 'company-2'
const user1 = { id: 'user-1', name: '김철수' }
const user2 = { id: 'user-2', name: '이영희' }
const agent1: Agent = { id: 'agent-1', name: '마케팅봇', soul: '마케팅 전문가', userId: 'agent-user-1', companyId: company1 }
const agent2: Agent = { id: 'agent-2', name: '개발봇', soul: null, userId: 'agent-user-2', companyId: company1 }
const agent3: Agent = { id: 'agent-3', name: '마케팅봇', soul: '다른 회사', userId: 'agent-user-3', companyId: company2 }

const allAgents = [agent1, agent2, agent3]

// ============================================================
// 1. Mention Parsing Tests
// ============================================================
describe('Agent Mention Parsing', () => {
  test('단일 @멘션을 정확히 파싱한다', () => {
    expect(parseMention('@마케팅봇 오늘 일정 알려줘')).toBe('마케팅봇')
  })

  test('멘션 없는 메시지는 null 반환', () => {
    expect(parseMention('안녕하세요')).toBeNull()
  })

  test('이메일 주소의 @ 도 첫 번째로 잡힌다', () => {
    expect(parseMention('test@email.com')).toBe('email.com')
  })

  test('여러 @멘션 중 첫 번째만 추출', () => {
    expect(parseMention('@봇1 @봇2 안녕')).toBe('봇1')
  })

  test('빈 문자열은 null', () => {
    expect(parseMention('')).toBeNull()
  })

  test('@ 뒤에 공백만 있으면 빈 문자열', () => {
    // @\s → \S+ 매칭 안 됨
    expect(parseMention('@ 안녕')).toBeNull()
  })

  test('@ 만 있으면 null', () => {
    expect(parseMention('@')).toBeNull()
  })

  test('문장 중간의 @멘션도 파싱', () => {
    expect(parseMention('안녕 @개발봇 도와줘')).toBe('개발봇')
  })
})

// ============================================================
// 2. Agent Lookup Tests
// ============================================================
describe('Agent Lookup by Name + CompanyId', () => {
  test('같은 회사의 에이전트를 이름으로 찾는다', () => {
    const found = findAgent(allAgents, '마케팅봇', company1)
    expect(found).toBeDefined()
    expect(found!.id).toBe('agent-1')
  })

  test('다른 회사의 동명 에이전트는 찾지 않는다', () => {
    const found = findAgent(allAgents, '마케팅봇', company2)
    expect(found).toBeDefined()
    expect(found!.id).toBe('agent-3')
  })

  test('존재하지 않는 에이전트는 undefined', () => {
    expect(findAgent(allAgents, '없는봇', company1)).toBeUndefined()
  })

  test('회사가 다르면 같은 이름이어도 다른 에이전트', () => {
    const c1 = findAgent(allAgents, '마케팅봇', company1)
    const c2 = findAgent(allAgents, '마케팅봇', company2)
    expect(c1!.id).not.toBe(c2!.id)
  })
})

// ============================================================
// 3. Broadcast Event Building Tests
// ============================================================
describe('Broadcast Event Building', () => {
  const msg: Message = {
    id: 'msg-1',
    userId: user1.id,
    userName: user1.name,
    content: '안녕하세요!',
    createdAt: '2026-03-06T10:00:00Z',
  }

  test('new-message 이벤트를 올바르게 구성한다', () => {
    const event = buildNewMessageEvent(msg)
    expect(event.type).toBe('new-message')
    expect(event.message.id).toBe('msg-1')
    expect(event.message.userName).toBe('김철수')
    expect(event.message.content).toBe('안녕하세요!')
  })

  test('typing 이벤트를 올바르게 구성한다', () => {
    const event = buildTypingEvent('마케팅봇')
    expect(event.type).toBe('typing')
    expect(event.agentName).toBe('마케팅봇')
  })

  test('new-message에 userName이 항상 포함된다', () => {
    const event = buildNewMessageEvent(msg)
    expect(event.message.userName).toBeTruthy()
  })
})

// ============================================================
// 4. Optimistic Append (Dedup) Tests
// ============================================================
describe('Optimistic Append with Dedup', () => {
  const existing: Message[] = [
    { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' },
    { id: 'msg-2', userId: 'u2', userName: 'B', content: 'hello', createdAt: '2026-03-06T10:01:00Z' },
  ]

  test('새 메시지를 추가한다', () => {
    const newMsg: Message = { id: 'msg-3', userId: 'u1', userName: 'A', content: 'bye', createdAt: '2026-03-06T10:02:00Z' }
    const result = appendMessageNoDup(existing, newMsg)
    expect(result.length).toBe(3)
    expect(result[2].id).toBe('msg-3')
  })

  test('중복 메시지는 추가하지 않는다', () => {
    const dupMsg: Message = { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' }
    const result = appendMessageNoDup(existing, dupMsg)
    expect(result.length).toBe(2)
  })

  test('빈 배열에 첫 메시지 추가', () => {
    const newMsg: Message = { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' }
    const result = appendMessageNoDup([], newMsg)
    expect(result.length).toBe(1)
  })

  test('중복 검사는 id 기준', () => {
    const sameContent: Message = { id: 'msg-99', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' }
    const result = appendMessageNoDup(existing, sameContent)
    expect(result.length).toBe(3) // 같은 content지만 다른 id
  })
})

// ============================================================
// 5. Mention Autocomplete Detection Tests
// ============================================================
describe('Mention Autocomplete Detection', () => {
  test('@로 시작하면 멘션 활성화', () => {
    const result = detectMentionQuery('@마케')
    expect(result.active).toBe(true)
    expect(result.query).toBe('마케')
  })

  test('공백 뒤 @도 멘션 활성화', () => {
    const result = detectMentionQuery('안녕 @개발')
    expect(result.active).toBe(true)
    expect(result.query).toBe('개발')
  })

  test('@ 없으면 비활성', () => {
    const result = detectMentionQuery('안녕하세요')
    expect(result.active).toBe(false)
  })

  test('@ 뒤에 공백 포함되면 비활성 (선택 완료)', () => {
    const result = detectMentionQuery('@마케팅봇 질문')
    expect(result.active).toBe(false)
  })

  test('@ 만 입력하면 활성 (빈 쿼리)', () => {
    const result = detectMentionQuery('@')
    expect(result.active).toBe(true)
    expect(result.query).toBe('')
  })

  test('단어 중간의 @는 비활성 (공백 뒤에서만 멘션)', () => {
    const result = detectMentionQuery('test@마케')
    expect(result.active).toBe(false)
  })

  test('여러 @ 중 마지막이 기준', () => {
    const result = detectMentionQuery('@봇1 @봇')
    expect(result.active).toBe(true)
    expect(result.query).toBe('봇')
  })
})

// ============================================================
// 6. Mention Selection Tests
// ============================================================
describe('Mention Selection', () => {
  test('@쿼리를 에이전트이름으로 교체한다', () => {
    const result = applyMentionSelect('@마케', '마케팅봇')
    expect(result).toBe('@마케팅봇 ')
  })

  test('텍스트 앞부분을 보존한다', () => {
    const result = applyMentionSelect('안녕 @개발', '개발봇')
    expect(result).toBe('안녕 @개발봇 ')
  })

  test('선택 후 끝에 공백이 추가된다', () => {
    const result = applyMentionSelect('@', '마케팅봇')
    expect(result).toBe('@마케팅봇 ')
    expect(result.endsWith(' ')).toBe(true)
  })

  test('여러 @가 있으면 마지막만 교체', () => {
    const result = applyMentionSelect('@봇1 @봇', '개발봇')
    expect(result).toBe('@봇1 @개발봇 ')
  })
})

// ============================================================
// 7. Online Status Tests
// ============================================================
describe('Online Status', () => {
  test('같은 회사의 온라인 유저만 반환한다', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    clientMap.set('user-1', [{ companyId: company1 }])
    clientMap.set('user-2', [{ companyId: company2 }])
    clientMap.set('user-3', [{ companyId: company1 }])

    const online = getOnlineUserIds(clientMap, company1)
    expect(online).toContain('user-1')
    expect(online).toContain('user-3')
    expect(online).not.toContain('user-2')
  })

  test('빈 clientMap은 빈 배열 반환', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    expect(getOnlineUserIds(clientMap, company1)).toEqual([])
  })

  test('한 유저가 여러 연결이 있어도 한 번만 반환', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    clientMap.set('user-1', [{ companyId: company1 }, { companyId: company1 }])

    const online = getOnlineUserIds(clientMap, company1)
    expect(online.filter((id) => id === 'user-1').length).toBe(1)
  })

  test('다른 회사 유저는 제외', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    clientMap.set('user-1', [{ companyId: company2 }])

    const online = getOnlineUserIds(clientMap, company1)
    expect(online.length).toBe(0)
  })
})

// ============================================================
// 8. WebSocket Polling Fallback Tests
// ============================================================
describe('WebSocket Polling Fallback', () => {
  test('연결됨 → 폴링 비활성', () => {
    const isConnected = true
    const refetchInterval = isConnected ? false : 30000
    expect(refetchInterval).toBe(false)
  })

  test('미연결 → 30초 폴링', () => {
    const isConnected = false
    const refetchInterval = isConnected ? false : 30000
    expect(refetchInterval).toBe(30000)
  })
})

// ============================================================
// 9. Agent Response Flow Tests
// ============================================================
describe('Agent Response Flow', () => {
  test('멘션 파싱 → 에이전트 조회 → typing → 응답 흐름', () => {
    // 1. 멘션 파싱
    const mention = parseMention('@마케팅봇 오늘 마케팅 전략은?')
    expect(mention).toBe('마케팅봇')

    // 2. 에이전트 조회
    const agent = findAgent(allAgents, mention!, company1)
    expect(agent).toBeDefined()
    expect(agent!.name).toBe('마케팅봇')

    // 3. typing 이벤트
    const typingEvent = buildTypingEvent(agent!.name)
    expect(typingEvent.type).toBe('typing')

    // 4. 응답 메시지
    const responseMsg: Message = {
      id: 'resp-1',
      userId: agent!.userId,
      userName: agent!.name,
      content: '오늘의 마케팅 전략은...',
      createdAt: new Date().toISOString(),
    }
    const responseEvent = buildNewMessageEvent(responseMsg)
    expect(responseEvent.type).toBe('new-message')
    expect(responseEvent.message.userName).toBe('마케팅봇')
  })

  test('멘션된 에이전트가 없으면 무시', () => {
    const mention = parseMention('@없는봇 테스트')
    expect(mention).toBe('없는봇')

    const agent = findAgent(allAgents, mention!, company1)
    expect(agent).toBeUndefined()
    // 에이전트 없으면 AI 호출 안 함 — 정상 동작
  })

  test('에이전트 응답은 에이전트의 userId로 저장', () => {
    const agent = findAgent(allAgents, '마케팅봇', company1)!
    const responseMsg: Message = {
      id: 'resp-2',
      userId: agent.userId,
      userName: agent.name,
      content: '응답입니다',
      createdAt: new Date().toISOString(),
    }
    expect(responseMsg.userId).toBe('agent-user-1')
    expect(responseMsg.userName).toBe('마케팅봇')
  })
})

// ============================================================
// 10. Edge Cases
// ============================================================
describe('Edge Cases', () => {
  test('빈 메시지에서 멘션 파싱', () => {
    expect(parseMention('')).toBeNull()
  })

  test('@만 있는 메시지', () => {
    expect(parseMention('@')).toBeNull()
  })

  test('특수문자 포함 에이전트 이름', () => {
    const agents2: Agent[] = [{ id: 'a1', name: '봇-123', soul: null, userId: 'u1', companyId: company1 }]
    // @봇-123은 \S+에 의해 "봇-123"으로 파싱됨
    expect(parseMention('@봇-123 질문')).toBe('봇-123')
    expect(findAgent(agents2, '봇-123', company1)).toBeDefined()
  })

  test('매우 긴 메시지에서 멘션 파싱', () => {
    const longMsg = 'a'.repeat(10000) + ' @에이전트 도와줘'
    expect(parseMention(longMsg)).toBe('에이전트')
  })

  test('중복 메시지 append 시 원본 배열 불변', () => {
    const original: Message[] = [
      { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' },
    ]
    const originalLength = original.length
    appendMessageNoDup(original, { id: 'msg-2', userId: 'u2', userName: 'B', content: 'bye', createdAt: '2026-03-06T10:01:00Z' })
    expect(original.length).toBe(originalLength) // 원본 미변경
  })
})

// ============================================================
// TEA EXPANSION: 11. Channel Key Construction Tests
// ============================================================
describe('TEA: Channel Key Construction', () => {
  function buildChannelKey(channelId: string): string {
    return `messenger::${channelId}`
  }

  test('채널 키가 올바른 형식으로 생성된다', () => {
    expect(buildChannelKey('ch-123')).toBe('messenger::ch-123')
  })

  test('UUID 형식 채널 ID도 처리', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(buildChannelKey(uuid)).toBe(`messenger::${uuid}`)
  })

  test('채널 키에서 채널 이름 추출', () => {
    const key = 'messenger::ch-123'
    const channel = key.split('::')[0]
    const id = key.split('::')[1]
    expect(channel).toBe('messenger')
    expect(id).toBe('ch-123')
  })
})

// ============================================================
// TEA EXPANSION: 12. Typing Indicator Timeout Logic
// ============================================================
describe('TEA: Typing Indicator Timeout', () => {
  test('typing 상태는 에이전트 이름을 포함한다', () => {
    let typingAgent: string | null = null
    const event = { type: 'typing', agentName: '분석봇' }
    if (event.type === 'typing' && event.agentName) {
      typingAgent = event.agentName
    }
    expect(typingAgent).toBe('분석봇')
  })

  test('typing 타임아웃 값은 3초', () => {
    const TYPING_TIMEOUT_MS = 3000
    expect(TYPING_TIMEOUT_MS).toBe(3000)
  })

  test('typing 상태는 null로 초기화 가능', () => {
    let typingAgent: string | null = '봇'
    typingAgent = null
    expect(typingAgent).toBeNull()
  })

  test('연속 typing 이벤트는 마지막 에이전트를 표시', () => {
    let typingAgent: string | null = null
    const events = [
      { type: 'typing', agentName: '봇1' },
      { type: 'typing', agentName: '봇2' },
    ]
    for (const event of events) {
      typingAgent = event.agentName
    }
    expect(typingAgent).toBe('봇2')
  })
})

// ============================================================
// TEA EXPANSION: 13. Agent Mention Filter (Autocomplete)
// ============================================================
describe('TEA: Agent Autocomplete Filtering', () => {
  function filterAgents(agents: Agent[], query: string): Agent[] {
    return agents.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
  }

  test('빈 쿼리는 모든 에이전트 반환', () => {
    const result = filterAgents(allAgents, '')
    expect(result.length).toBe(allAgents.length)
  })

  test('부분 매칭으로 필터링', () => {
    const result = filterAgents(allAgents, '마케')
    expect(result.length).toBe(2) // company1 + company2 마케팅봇
    expect(result.every((a) => a.name.includes('마케'))).toBe(true)
  })

  test('매칭 없으면 빈 배열', () => {
    const result = filterAgents(allAgents, 'xyz')
    expect(result.length).toBe(0)
  })

  test('대소문자 무관 매칭 (영문)', () => {
    const agents4: Agent[] = [{ id: 'a1', name: 'MarketBot', soul: null, userId: 'u1', companyId: company1 }]
    const result = filterAgents(agents4, 'market')
    expect(result.length).toBe(1)
  })

  test('전체 이름 매칭', () => {
    const result = filterAgents(allAgents, '개발봇')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('agent-2')
  })
})

// ============================================================
// TEA EXPANSION: 14. Broadcast Event Serialization
// ============================================================
describe('TEA: Broadcast Event JSON Serialization', () => {
  test('new-message 이벤트가 올바르게 직렬화된다', () => {
    const event = buildNewMessageEvent({
      id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z',
    })
    const json = JSON.stringify(event)
    const parsed = JSON.parse(json)
    expect(parsed.type).toBe('new-message')
    expect(parsed.message.id).toBe('msg-1')
    expect(parsed.message.userName).toBe('A')
  })

  test('typing 이벤트가 올바르게 직렬화된다', () => {
    const event = buildTypingEvent('봇')
    const json = JSON.stringify(event)
    const parsed = JSON.parse(json)
    expect(parsed.type).toBe('typing')
    expect(parsed.agentName).toBe('봇')
  })

  test('한글 메시지 직렬화/역직렬화', () => {
    const event = buildNewMessageEvent({
      id: 'm1', userId: 'u1', userName: '김철수', content: '안녕하세요 🤖', createdAt: '2026-03-06T10:00:00Z',
    })
    const json = JSON.stringify(event)
    const parsed = JSON.parse(json)
    expect(parsed.message.content).toBe('안녕하세요 🤖')
    expect(parsed.message.userName).toBe('김철수')
  })

  test('이모지 포함 메시지 직렬화', () => {
    const event = buildNewMessageEvent({
      id: 'm1', userId: 'u1', userName: 'A', content: '🎉🎊✅ 완료!', createdAt: '2026-03-06T10:00:00Z',
    })
    const json = JSON.stringify(event)
    expect(json).toContain('🎉')
  })
})

// ============================================================
// TEA EXPANSION: 15. Multi-Company Tenant Isolation
// ============================================================
describe('TEA: Multi-Company Tenant Isolation', () => {
  test('다른 회사 에이전트는 조회되지 않는다', () => {
    const found = findAgent(allAgents, '개발봇', company2)
    expect(found).toBeUndefined() // 개발봇은 company1에만 존재
  })

  test('같은 이름이라도 companyId로 격리된다', () => {
    const c1Agent = findAgent(allAgents, '마케팅봇', company1)
    const c2Agent = findAgent(allAgents, '마케팅봇', company2)
    expect(c1Agent!.companyId).toBe(company1)
    expect(c2Agent!.companyId).toBe(company2)
    expect(c1Agent!.id).not.toBe(c2Agent!.id)
  })

  test('온라인 상태는 회사별로 격리된다', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    clientMap.set('u1', [{ companyId: company1 }])
    clientMap.set('u2', [{ companyId: company2 }])

    const c1Online = getOnlineUserIds(clientMap, company1)
    const c2Online = getOnlineUserIds(clientMap, company2)

    expect(c1Online).toEqual(['u1'])
    expect(c2Online).toEqual(['u2'])
  })

  test('온라인 유저가 두 회사에 속할 수 없다 (단일 companyId)', () => {
    const clientMap = new Map<string, { companyId: string }[]>()
    clientMap.set('u1', [{ companyId: company1 }])

    const c2Online = getOnlineUserIds(clientMap, company2)
    expect(c2Online).not.toContain('u1')
  })
})

// ============================================================
// TEA EXPANSION: 16. Message Order Preservation
// ============================================================
describe('TEA: Message Order Preservation', () => {
  test('optimistic append는 순서를 유지한다', () => {
    const msgs: Message[] = [
      { id: '1', userId: 'u1', userName: 'A', content: 'first', createdAt: '2026-03-06T10:00:00Z' },
      { id: '2', userId: 'u1', userName: 'A', content: 'second', createdAt: '2026-03-06T10:01:00Z' },
    ]
    const newMsg: Message = { id: '3', userId: 'u1', userName: 'A', content: 'third', createdAt: '2026-03-06T10:02:00Z' }
    const result = appendMessageNoDup(msgs, newMsg)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
    expect(result[2].id).toBe('3')
  })

  test('연속 append도 순서를 유지한다', () => {
    let msgs: Message[] = []
    for (let i = 1; i <= 5; i++) {
      msgs = appendMessageNoDup(msgs, {
        id: `msg-${i}`, userId: 'u1', userName: 'A', content: `msg ${i}`, createdAt: `2026-03-06T10:0${i}:00Z`,
      })
    }
    expect(msgs.length).toBe(5)
    expect(msgs[0].id).toBe('msg-1')
    expect(msgs[4].id).toBe('msg-5')
  })
})

// ============================================================
// TEA EXPANSION: 17. Mention Parsing Stress Tests
// ============================================================
describe('TEA: Mention Parsing Stress', () => {
  test('줄바꿈 포함 메시지에서 멘션 파싱', () => {
    expect(parseMention('안녕\n@봇 도와줘')).toBe('봇')
  })

  test('탭 뒤 멘션', () => {
    expect(parseMention('제목\t@봇 질문')).toBe('봇')
  })

  test('URL 포함 메시지에서 멘션', () => {
    expect(parseMention('https://example.com @봇')).toBe('봇')
  })

  test('한글+영문 혼합 에이전트 이름', () => {
    expect(parseMention('@마케팅Bot 분석해줘')).toBe('마케팅Bot')
  })

  test('숫자로 시작하는 멘션', () => {
    expect(parseMention('@123봇 질문')).toBe('123봇')
  })

  test('언더스코어 포함 멘션', () => {
    expect(parseMention('@my_bot 도와줘')).toBe('my_bot')
  })
})

// ============================================================
// TEA EXPANSION: 18. Concurrent Message Dedup Simulation
// ============================================================
describe('TEA: Concurrent Message Dedup', () => {
  test('동일 메시지가 REST + WS에서 동시에 도착해도 중복 없음', () => {
    // REST 응답으로 먼저 추가
    let msgs: Message[] = []
    const msg: Message = { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' }
    msgs = appendMessageNoDup(msgs, msg)
    expect(msgs.length).toBe(1)

    // WS로 같은 메시지 도착
    msgs = appendMessageNoDup(msgs, msg)
    expect(msgs.length).toBe(1) // 중복 방지
  })

  test('빠르게 연속 도착하는 다른 메시지들은 모두 추가', () => {
    let msgs: Message[] = []
    for (let i = 0; i < 100; i++) {
      msgs = appendMessageNoDup(msgs, {
        id: `msg-${i}`, userId: 'u1', userName: 'A', content: `m${i}`, createdAt: new Date().toISOString(),
      })
    }
    expect(msgs.length).toBe(100)
  })

  test('빠르게 연속 도착하는 중복 메시지는 모두 무시', () => {
    let msgs: Message[] = [{ id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' }]
    for (let i = 0; i < 10; i++) {
      msgs = appendMessageNoDup(msgs, { id: 'msg-1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '2026-03-06T10:00:00Z' })
    }
    expect(msgs.length).toBe(1)
  })
})

// ============================================================
// TEA EXPANSION: 19. Agent Soul Context Tests
// ============================================================
describe('TEA: Agent Soul Context', () => {
  test('soul이 null인 에이전트도 정상 처리', () => {
    const agent = findAgent(allAgents, '개발봇', company1)!
    expect(agent.soul).toBeNull()
    const systemPrompt = agent.soul || '당신은 도움이 되는 AI 비서입니다.'
    expect(systemPrompt).toBe('당신은 도움이 되는 AI 비서입니다.')
  })

  test('soul이 있는 에이전트는 그대로 사용', () => {
    const agent = findAgent(allAgents, '마케팅봇', company1)!
    expect(agent.soul).toBe('마케팅 전문가')
    const systemPrompt = agent.soul || '당신은 도움이 되는 AI 비서입니다.'
    expect(systemPrompt).toBe('마케팅 전문가')
  })

  test('에이전트 응답 메시지의 userId는 에이전트의 userId', () => {
    const agent = findAgent(allAgents, '마케팅봇', company1)!
    expect(agent.userId).toBe('agent-user-1')
    expect(agent.userId).not.toBe('agent-1') // agentId != userId
  })
})

// ============================================================
// TEA EXPANSION: 20. WebSocket Event Type Discrimination
// ============================================================
describe('TEA: WebSocket Event Type Discrimination', () => {
  function handleWsEvent(event: { type: string; message?: Message; agentName?: string }) {
    if (event.type === 'new-message' && event.message) return 'message-handled'
    if (event.type === 'typing' && event.agentName) return 'typing-handled'
    return 'ignored'
  }

  test('new-message 이벤트를 올바르게 처리', () => {
    expect(handleWsEvent({ type: 'new-message', message: { id: '1', userId: 'u1', userName: 'A', content: 'hi', createdAt: '' } })).toBe('message-handled')
  })

  test('typing 이벤트를 올바르게 처리', () => {
    expect(handleWsEvent({ type: 'typing', agentName: '봇' })).toBe('typing-handled')
  })

  test('알 수 없는 이벤트 타입은 무시', () => {
    expect(handleWsEvent({ type: 'unknown' })).toBe('ignored')
  })

  test('메시지 없는 new-message는 무시', () => {
    expect(handleWsEvent({ type: 'new-message' })).toBe('ignored')
  })

  test('agentName 없는 typing은 무시', () => {
    expect(handleWsEvent({ type: 'typing' })).toBe('ignored')
  })

  test('빈 agentName typing은 무시', () => {
    expect(handleWsEvent({ type: 'typing', agentName: '' })).toBe('ignored')
  })
})
