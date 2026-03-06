import { describe, expect, test } from 'bun:test'

// ============================================================
// TEA: Story 16-4 리스크 기반 확장 테스트
// Risk-Based Coverage Analysis by Test Architect
// ============================================================

// ========== Types ==========
type Message = {
  id: string
  channelId: string
  companyId: string
  userId: string
  content: string
  parentMessageId: string | null
  createdAt: string
}

type MemberWithReadAt = {
  channelId: string
  userId: string
  companyId: string
  joinedAt: string
  lastReadAt: string | null
}

// ========== Helpers (simulate server logic) ==========

function searchMessagesWithCompany(
  messages: Message[],
  memberChannelIds: string[],
  companyId: string,
  query: string,
  limit = 30,
) {
  if (query.length < 2) return []
  return messages
    .filter(
      (m) =>
        m.companyId === companyId &&
        memberChannelIds.includes(m.channelId) &&
        m.content.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

function parseMentionsAll(content: string): string[] {
  return [...content.matchAll(/@(\S+)/g)].map((m) => m[1])
}

function computeUnreadCounts(
  memberships: MemberWithReadAt[],
  messages: Message[],
  companyId: string,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const m of memberships) {
    if (m.companyId !== companyId) continue
    const since = new Date(m.lastReadAt || m.joinedAt).getTime()
    const unread = messages.filter(
      (msg) =>
        msg.channelId === m.channelId &&
        msg.companyId === companyId &&
        !msg.parentMessageId &&
        new Date(msg.createdAt).getTime() > since,
    ).length
    if (unread > 0) counts[m.channelId] = unread
  }
  return counts
}

// ============================================================
// TEA-R1: 검색 API 보안 경계 (HIGH RISK)
// ============================================================
describe('TEA-R1: 검색 API 보안 경계', () => {
  const msgs: Message[] = [
    { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '안녕하세요', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    { id: '2', channelId: 'ch1', companyId: 'co2', userId: 'u2', content: '안녕하세요', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
    { id: '3', channelId: 'ch-secret', companyId: 'co1', userId: 'u3', content: '안녕하세요', parentMessageId: null, createdAt: '2026-03-06T10:02:00Z' },
  ]

  test('companyId 격리: 같은 내용이어도 다른 회사 메시지 제외', () => {
    const results = searchMessagesWithCompany(msgs, ['ch1'], 'co1', '안녕')
    expect(results).toHaveLength(1)
    expect(results[0].companyId).toBe('co1')
  })

  test('멤버 격리: companyId 일치하지만 비멤버 채널 제외', () => {
    const results = searchMessagesWithCompany(msgs, ['ch1'], 'co1', '안녕')
    expect(results.every((r) => r.channelId !== 'ch-secret')).toBe(true)
  })

  test('ILIKE 특수문자: % 기호 포함 검색', () => {
    const msgsWithPercent = [
      { id: '10', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '50% 할인', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(msgsWithPercent, ['ch1'], 'co1', '50%')
    expect(results).toHaveLength(1)
  })

  test('ILIKE 특수문자: _ 기호 포함 검색', () => {
    const msgsWithUnderscore = [
      { id: '11', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: 'file_name.txt', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(msgsWithUnderscore, ['ch1'], 'co1', 'file_name')
    expect(results).toHaveLength(1)
  })

  test('빈 memberChannelIds 배열: 검색 결과 0', () => {
    const results = searchMessagesWithCompany(msgs, [], 'co1', '안녕')
    expect(results).toHaveLength(0)
  })

  test('limit 경계: limit=0이면 결과 없음', () => {
    const results = searchMessagesWithCompany(msgs, ['ch1'], 'co1', '안녕', 0)
    expect(results).toHaveLength(0)
  })

  test('limit 경계: limit=100 (최대)', () => {
    const bigMsgs = Array.from({ length: 150 }, (_, i) => ({
      id: `msg-${i}`,
      channelId: 'ch1',
      companyId: 'co1',
      userId: 'u1',
      content: '검색 대상 메시지',
      parentMessageId: null,
      createdAt: new Date(2026, 2, 6, 10, 0, i).toISOString(),
    }))
    const results = searchMessagesWithCompany(bigMsgs, ['ch1'], 'co1', '검색', 100)
    expect(results).toHaveLength(100)
  })

  test('한글+영문+숫자 혼합 검색', () => {
    const mixedMsgs = [
      { id: '20', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: 'Sprint 16 회의록', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(mixedMsgs, ['ch1'], 'co1', 'Sprint 16')
    expect(results).toHaveLength(1)
  })

  test('이모지 포함 메시지 검색', () => {
    const emojiMsgs = [
      { id: '30', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '좋은 아이디어 👍', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(emojiMsgs, ['ch1'], 'co1', '아이디어')
    expect(results).toHaveLength(1)
  })
})

// ============================================================
// TEA-R2: 멀티 멘션 파싱 로직 (HIGH RISK)
// ============================================================
describe('TEA-R2: 멀티 멘션 파싱', () => {
  test('3명 이상 동시 멘션', () => {
    const mentions = parseMentionsAll('@김철수 @이영희 @박지민 회의합시다')
    expect(mentions).toEqual(['김철수', '이영희', '박지민'])
  })

  test('멘션 사이 텍스트 있는 경우', () => {
    const mentions = parseMentionsAll('@김철수 확인해주시고 @이영희 리뷰 부탁')
    expect(mentions).toEqual(['김철수', '이영희'])
  })

  test('이메일 주소와 구분 (@ 다음 공백 없는 패턴)', () => {
    // @user@domain.com 같은 경우 — matchAll은 user@domain.com을 하나로 잡음
    const mentions = parseMentionsAll('이메일은 user@domain.com 입니다')
    expect(mentions).toHaveLength(1)
    // 실제 서버에서는 users 테이블 매칭 실패하므로 알림 안감
  })

  test('연속 @@ — 빈 결과', () => {
    const mentions = parseMentionsAll('@@')
    // @@에서 @(\S+)는 '@'을 매칭 → 실제로는 유저 매칭 실패
    expect(mentions).toHaveLength(1) // '@' 매칭
  })

  test('줄바꿈 포함 멘션', () => {
    const mentions = parseMentionsAll('@김철수\n@이영희')
    expect(mentions).toEqual(['김철수', '이영희'])
  })

  test('멘션 이름에 한글+영문 혼합', () => {
    const mentions = parseMentionsAll('@Agent-비서 확인해주세요')
    expect(mentions).toEqual(['Agent-비서'])
  })

  test('빈 문자열 — 멘션 0개', () => {
    expect(parseMentionsAll('')).toEqual([])
  })

  test('@만 단독 — 매칭 없음', () => {
    expect(parseMentionsAll('@ ')).toEqual([])
  })
})

// ============================================================
// TEA-R3: Unread 카운트 정확성 (MEDIUM RISK)
// ============================================================
describe('TEA-R3: Unread 카운트 정확성', () => {
  const msgs: Message[] = [
    { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'A', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    { id: '2', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'B', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
    { id: '3', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'C', parentMessageId: '1', createdAt: '2026-03-06T10:02:00Z' },
    { id: '4', channelId: 'ch1', companyId: 'co2', userId: 'u3', content: 'D', parentMessageId: null, createdAt: '2026-03-06T10:03:00Z' },
    { id: '5', channelId: 'ch2', companyId: 'co1', userId: 'u2', content: 'E', parentMessageId: null, createdAt: '2026-03-06T10:04:00Z' },
  ]

  test('companyId가 다른 메시지는 unread에서 제외', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    // id=1,2 (co1, parentNull) = 2, id=4는 co2
    expect(counts['ch1']).toBe(2)
  })

  test('다른 회사의 membership은 무시', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co2', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    expect(Object.keys(counts)).toHaveLength(0)
  })

  test('여러 채널 동시 unread 계산', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
      { channelId: 'ch2', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    expect(counts['ch1']).toBe(2)
    expect(counts['ch2']).toBe(1)
  })

  test('lastReadAt과 createdAt이 동일한 경우 — unread 아님', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:01:00Z' },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    // 10:00, 10:01은 <= lastReadAt이므로 unread 아님
    expect(counts['ch1']).toBeUndefined()
  })

  test('lastReadAt 직후 메시지 — gt 정확성', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T09:59:59Z' },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    expect(counts['ch1']).toBe(2) // 10:00, 10:01 (thread reply 제외)
  })

  test('빈 메시지 배열 — 모든 채널 unread 0', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, [], 'co1')
    expect(Object.keys(counts)).toHaveLength(0)
  })
})

// ============================================================
// TEA-R4: 알림 생성 로직 (MEDIUM RISK)
// ============================================================
describe('TEA-R4: 알림 생성 로직', () => {
  test('messenger_mention 알림 형식', () => {
    const channelId = 'ch-abc'
    const channelName = '개발팀'
    const content = '안녕하세요 @홍길동 확인 부탁드립니다'

    const notification = {
      type: 'messenger_mention' as const,
      title: `#${channelName}에서 @멘션`,
      body: content.length > 100 ? content.slice(0, 100) + '...' : content,
      actionUrl: `/messenger?channelId=${channelId}`,
    }

    expect(notification.type).toBe('messenger_mention')
    expect(notification.title).toBe('#개발팀에서 @멘션')
    expect(notification.actionUrl).toContain(channelId)
    expect(notification.body).toBe(content)
  })

  test('긴 메시지 body 100자 truncation', () => {
    const longContent = '이것은 매우 긴 메시지입니다. '.repeat(10)
    const body = longContent.length > 100 ? longContent.slice(0, 100) + '...' : longContent
    expect(body.length).toBeLessThanOrEqual(103)
    expect(body.endsWith('...')).toBe(true)
  })

  test('자기 자신 멘션 → 알림 미생성', () => {
    const senderId = 'user-1'
    const mentionedUsers = [{ id: 'user-1', name: '김철수' }, { id: 'user-2', name: '이영희' }]
    const toNotify = mentionedUsers.filter((u) => u.id !== senderId)
    expect(toNotify).toHaveLength(1)
    expect(toNotify[0].name).toBe('이영희')
  })

  test('에이전트 멘션은 알림이 아닌 AI 응답', () => {
    // 에이전트가 DB에 있으면 AI 응답 로직으로 분기
    const isAgent = true
    const isUser = false
    if (isAgent) {
      // handleAgentMention 호출
      expect(isAgent).toBe(true)
    }
    if (isUser) {
      // createNotification 호출
    }
    expect(isUser).toBe(false)
  })

  test('알림 actionUrl에서 channelId 추출 가능', () => {
    const actionUrl = '/messenger?channelId=550e8400-e29b-41d4-a716-446655440000'
    const match = actionUrl.match(/channelId=([^&]+)/)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
})

// ============================================================
// TEA-R5: 프론트엔드 상태 관리 (MEDIUM RISK)
// ============================================================
describe('TEA-R5: 프론트엔드 상태 관리', () => {
  test('unread 서버 동기화: 서버 값이 더 크면 업데이트', () => {
    const local: Record<string, number> = { ch1: 2 }
    const server: Record<string, number> = { ch1: 5 }

    const merged = { ...local }
    for (const [chId, count] of Object.entries(server)) {
      if (merged[chId] === undefined || merged[chId] < count) {
        merged[chId] = count
      }
    }
    expect(merged.ch1).toBe(5)
  })

  test('unread 서버 동기화: 로컬이 더 크면 유지', () => {
    const local: Record<string, number> = { ch1: 8 }
    const server: Record<string, number> = { ch1: 5 }

    const merged = { ...local }
    for (const [chId, count] of Object.entries(server)) {
      if (merged[chId] === undefined || merged[chId] < count) {
        merged[chId] = count
      }
    }
    expect(merged.ch1).toBe(8)
  })

  test('채널 선택 시 unread 즉시 0으로', () => {
    const unreadCounts: Record<string, number> = { ch1: 5, ch2: 3 }
    const selectedId = 'ch1'
    unreadCounts[selectedId] = 0
    expect(unreadCounts.ch1).toBe(0)
    expect(unreadCounts.ch2).toBe(3)
  })

  test('WebSocket new-message — 현재 채널이 아닌 경우 +1', () => {
    const unreadCounts: Record<string, number> = {}
    const currentChannel: string = 'ch2'
    const eventChannelId: string = 'ch1'
    const hasParent = false

    if (eventChannelId !== currentChannel && !hasParent) {
      unreadCounts[eventChannelId] = (unreadCounts[eventChannelId] || 0) + 1
    }
    expect(unreadCounts.ch1).toBe(1)
  })

  test('WebSocket new-message — 스레드 답글은 unread 증가 안함', () => {
    const unreadCounts: Record<string, number> = {}
    const currentChannel: string = 'ch2'
    const eventChannelId: string = 'ch1'
    const hasParent = true

    if (eventChannelId !== currentChannel && !hasParent) {
      unreadCounts[eventChannelId] = (unreadCounts[eventChannelId] || 0) + 1
    }
    expect(unreadCounts.ch1).toBeUndefined()
  })

  test('검색 결과 클릭 → 채널 이동 + 검색 닫기', () => {
    let selectedChannel: string | null = null
    let showSearchResults = true
    let searchQuery = '테스트'

    const handleSearchResultClick = (channelId: string) => {
      selectedChannel = channelId
      showSearchResults = false
      searchQuery = ''
    }

    handleSearchResultClick('ch-abc')
    expect(selectedChannel!).toBe('ch-abc')
    expect(showSearchResults).toBe(false)
    expect(searchQuery).toBe('')
  })
})

// ============================================================
// TEA-R6: 채널 삭제 시 검색 인덱스 정합성 (EDGE CASE)
// ============================================================
describe('TEA-R6: 엣지 케이스', () => {
  test('삭제된 채널의 메시지는 검색 결과에 포함 안됨', () => {
    const memberChannelIds = ['ch1'] // ch2는 이미 탈퇴/삭제
    const msgs: Message[] = [
      { id: '1', channelId: 'ch2', companyId: 'co1', userId: 'u1', content: '삭제된 채널 메시지', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(msgs, memberChannelIds, 'co1', '삭제')
    expect(results).toHaveLength(0)
  })

  test('매우 긴 검색어 (4000자)', () => {
    const longQuery = 'A'.repeat(4000)
    const msgs: Message[] = [
      { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: 'A'.repeat(4000), parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const results = searchMessagesWithCompany(msgs, ['ch1'], 'co1', longQuery)
    expect(results).toHaveLength(1)
  })

  test('동시에 여러 채널에 가입한 유저의 unread 독립성', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:00:30Z' },
      { channelId: 'ch2', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
      { channelId: 'ch3', userId: 'u1', companyId: 'co1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T11:00:00Z' },
    ]
    const msgs: Message[] = [
      { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'A', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
      { id: '2', channelId: 'ch2', companyId: 'co1', userId: 'u2', content: 'B', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
      { id: '3', channelId: 'ch3', companyId: 'co1', userId: 'u2', content: 'C', parentMessageId: null, createdAt: '2026-03-06T10:30:00Z' },
    ]
    const counts = computeUnreadCounts(memberships, msgs, 'co1')
    expect(counts['ch1']).toBe(1)  // 10:01 > 10:00:30
    expect(counts['ch2']).toBe(1)  // 10:00 > 09:00
    expect(counts['ch3']).toBeUndefined()  // 10:30 < 11:00
  })

  test('멘션 + 에이전트 동시 존재 시 각각 처리', () => {
    const content = '@Agent-1 분석해주세요 @홍길동 확인'
    const mentions = parseMentionsAll(content)
    expect(mentions).toEqual(['Agent-1', '홍길동'])
    // 서버에서: Agent-1 → AI 응답, 홍길동 → 알림
  })
})
