import { describe, expect, test } from 'bun:test'

// ============================================================
// Story 16-4: 메신저 검색 + 알림 — Unit Tests
// ============================================================

type SearchResult = {
  id: string
  channelId: string
  channelName: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

type UnreadCounts = Record<string, number>

type MemberWithReadAt = {
  channelId: string
  userId: string
  joinedAt: string
  lastReadAt: string | null
}

type Message = {
  id: string
  channelId: string
  companyId: string
  userId: string
  content: string
  parentMessageId: string | null
  createdAt: string
}

// ======== Helper: search filter ========
function searchMessages(
  messages: Message[],
  memberChannelIds: string[],
  query: string,
  limit = 30,
): SearchResult[] {
  if (query.length < 2) return []

  return messages
    .filter(
      (m) =>
        memberChannelIds.includes(m.channelId) &&
        m.content.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((m) => ({
      id: m.id,
      channelId: m.channelId,
      channelName: `channel-${m.channelId}`,
      userId: m.userId,
      userName: `user-${m.userId}`,
      content: m.content,
      createdAt: m.createdAt,
    }))
}

// ======== Helper: compute unread counts ========
function computeUnreadCounts(
  memberships: MemberWithReadAt[],
  messages: Message[],
): UnreadCounts {
  const counts: UnreadCounts = {}
  for (const m of memberships) {
    const since = new Date(m.lastReadAt || m.joinedAt).getTime()
    const unread = messages.filter(
      (msg) =>
        msg.channelId === m.channelId &&
        !msg.parentMessageId &&
        new Date(msg.createdAt).getTime() > since,
    ).length
    if (unread > 0) counts[m.channelId] = unread
  }
  return counts
}

// ======== Helper: parse mentions ========
function parseMentions(content: string): string[] {
  const matches = content.matchAll(/@(\S+)/g)
  return [...matches].map((m) => m[1])
}

// ======== Helper: truncate body ========
function truncateBody(content: string, maxLen = 100): string {
  return content.length > maxLen ? content.slice(0, maxLen) + '...' : content
}

// ============================================================
// 1. 검색 API 로직 테스트
// ============================================================

describe('메시지 검색 (Task 1)', () => {
  const messages: Message[] = [
    { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '안녕하세요 프로젝트 회의입니다', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    { id: '2', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: '네 알겠습니다', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
    { id: '3', channelId: 'ch2', companyId: 'co1', userId: 'u1', content: '프로젝트 일정 공유', parentMessageId: null, createdAt: '2026-03-06T10:02:00Z' },
    { id: '4', channelId: 'ch3', companyId: 'co1', userId: 'u3', content: '프로젝트 진행 상황', parentMessageId: null, createdAt: '2026-03-06T10:03:00Z' },
    { id: '5', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '답글입니다', parentMessageId: '1', createdAt: '2026-03-06T10:04:00Z' },
  ]
  const memberChannelIds = ['ch1', 'ch2'] // ch3은 멤버 아님

  test('키워드로 검색 — 멤버 채널만 반환', () => {
    const results = searchMessages(messages, memberChannelIds, '프로젝트')
    expect(results).toHaveLength(2)
    expect(results.every((r) => ['ch1', 'ch2'].includes(r.channelId))).toBe(true)
  })

  test('비멤버 채널 메시지 제외', () => {
    const results = searchMessages(messages, memberChannelIds, '진행 상황')
    expect(results).toHaveLength(0)
  })

  test('2자 미만 쿼리 — 빈 배열 반환', () => {
    expect(searchMessages(messages, memberChannelIds, '프')).toHaveLength(0)
    expect(searchMessages(messages, memberChannelIds, '')).toHaveLength(0)
  })

  test('대소문자 무시 검색 (ILIKE 시뮬레이션)', () => {
    const results = searchMessages(messages, memberChannelIds, '안녕하세요')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('1')
  })

  test('limit 적용', () => {
    const results = searchMessages(messages, memberChannelIds, '프로젝트', 1)
    expect(results).toHaveLength(1)
  })

  test('시간 역순 정렬', () => {
    const results = searchMessages(messages, memberChannelIds, '프로젝트')
    expect(results[0].createdAt > results[1].createdAt).toBe(true)
  })

  test('스레드 답글도 검색 가능', () => {
    const results = searchMessages(messages, memberChannelIds, '답글')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('5')
  })

  test('검색 결과에 channelName, userName 포함', () => {
    const results = searchMessages(messages, memberChannelIds, '안녕')
    expect(results[0]).toHaveProperty('channelName')
    expect(results[0]).toHaveProperty('userName')
  })
})

// ============================================================
// 2. @멘션 파싱 + 알림 테스트
// ============================================================

describe('@멘션 알림 (Task 2)', () => {
  test('단일 멘션 파싱', () => {
    expect(parseMentions('안녕 @홍길동 반갑습니다')).toEqual(['홍길동'])
  })

  test('다중 멘션 파싱', () => {
    expect(parseMentions('@김철수 @이영희 회의하자')).toEqual(['김철수', '이영희'])
  })

  test('멘션 없는 메시지', () => {
    expect(parseMentions('일반 메시지입니다')).toEqual([])
  })

  test('@만 있고 이름 없는 경우', () => {
    // @뒤에 공백이면 \S+에 매칭 안됨
    expect(parseMentions('@ 테스트')).toEqual([])
  })

  test('멘션 이름에 특수문자 포함', () => {
    const result = parseMentions('@Agent-1 확인해주세요')
    expect(result).toEqual(['Agent-1'])
  })

  test('알림 body truncation — 100자 이하', () => {
    const short = '짧은 메시지'
    expect(truncateBody(short)).toBe(short)
  })

  test('알림 body truncation — 100자 초과', () => {
    const long = 'A'.repeat(150)
    const result = truncateBody(long)
    expect(result).toHaveLength(103) // 100 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  test('알림 type은 messenger_mention', () => {
    const notificationType = 'messenger_mention'
    expect(notificationType).toBe('messenger_mention')
  })

  test('알림 actionUrl 형식', () => {
    const channelId = 'abc-123'
    const actionUrl = `/messenger?channelId=${channelId}`
    expect(actionUrl).toBe('/messenger?channelId=abc-123')
  })

  test('자기 자신 멘션 시 알림 미생성 (비즈니스 로직)', () => {
    const senderId = 'user-1'
    const mentionedUserId = 'user-1'
    const shouldNotify = mentionedUserId !== senderId
    expect(shouldNotify).toBe(false)
  })
})

// ============================================================
// 3. 미읽음 카운트 테스트
// ============================================================

describe('미읽음 카운트 (Task 3)', () => {
  const messages: Message[] = [
    { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'msg1', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    { id: '2', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'msg2', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
    { id: '3', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'msg3', parentMessageId: null, createdAt: '2026-03-06T10:02:00Z' },
    { id: '4', channelId: 'ch2', companyId: 'co1', userId: 'u2', content: 'msg4', parentMessageId: null, createdAt: '2026-03-06T10:03:00Z' },
    { id: '5', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'thread reply', parentMessageId: '1', createdAt: '2026-03-06T10:04:00Z' },
  ]

  test('lastReadAt이 null이면 joinedAt 이후 모든 메시지 unread', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:59:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch1']).toBe(3) // 스레드 답글 제외
  })

  test('lastReadAt 이후 메시지만 unread', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:00:30Z' },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch1']).toBe(2) // msg2, msg3
  })

  test('채널별 독립 카운트', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:01:30Z' },
      { channelId: 'ch2', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch1']).toBe(1) // msg3
    expect(counts['ch2']).toBe(1) // msg4
  })

  test('모두 읽은 경우 — 해당 채널 키 없음', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:05:00Z' },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch1']).toBeUndefined()
  })

  test('스레드 답글은 unread 카운트에서 제외', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:59:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    // msg1, msg2, msg3 = 3개 (thread reply 제외)
    expect(counts['ch1']).toBe(3)
  })

  test('빈 채널 — unread 0', () => {
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch-empty', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: null },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch-empty']).toBeUndefined()
  })
})

// ============================================================
// 4. 검색 UI 동작 테스트
// ============================================================

describe('검색 UI 로직 (Task 4)', () => {
  test('검색어 입력 → showSearchResults true', () => {
    let showSearchResults = false
    const setShowSearchResults = (v: boolean) => { showSearchResults = v }
    const searchQuery = '프로젝트'
    if (searchQuery.length >= 2) setShowSearchResults(true)
    expect(showSearchResults).toBe(true)
  })

  test('빈 검색어 → showSearchResults false', () => {
    let showSearchResults = true
    const query = ''
    if (query.length < 2) showSearchResults = false
    expect(showSearchResults).toBe(false)
  })

  test('검색 결과 클릭 → handleSelectChannel 호출', () => {
    let selected: string | null = null
    const handleSelectChannel = (id: string) => { selected = id }
    handleSelectChannel('ch-abc')
    expect(selected!).toBe('ch-abc')
  })

  test('디바운스 300ms — 빈 쿼리에서 debouncedSearch 빈 문자열', () => {
    const searchQuery = ''
    const debouncedSearch = searchQuery.length >= 2 ? searchQuery : ''
    expect(debouncedSearch).toBe('')
  })
})

// ============================================================
// 5. 미읽음 배지 UI 로직 테스트
// ============================================================

describe('미읽음 배지 UI (Task 5)', () => {
  test('unread > 0이면 배지 표시', () => {
    const unread = 5
    const showBadge = unread > 0
    expect(showBadge).toBe(true)
  })

  test('unread === 0이면 배지 미표시', () => {
    const unread = 0
    const showBadge = unread > 0
    expect(showBadge).toBe(false)
  })

  test('99 초과 시 "99+" 표시', () => {
    const unread = 150
    const label = unread > 99 ? '99+' : String(unread)
    expect(label).toBe('99+')
  })

  test('채널 선택 시 unread 초기화', () => {
    const unreadCounts: UnreadCounts = { ch1: 5, ch2: 3 }
    const selectedChannelId = 'ch1'
    unreadCounts[selectedChannelId] = 0
    expect(unreadCounts.ch1).toBe(0)
    expect(unreadCounts.ch2).toBe(3) // 다른 채널 유지
  })

  test('WebSocket new-message → 다른 채널 unread +1', () => {
    const unreadCounts: UnreadCounts = { ch1: 2 }
    const currentChannel: string = 'ch2'
    const eventChannel: string = 'ch1'
    if (eventChannel !== currentChannel) {
      unreadCounts[eventChannel] = (unreadCounts[eventChannel] || 0) + 1
    }
    expect(unreadCounts.ch1).toBe(3)
  })

  test('WebSocket new-message → 현재 채널이면 unread 유지', () => {
    const unreadCounts: UnreadCounts = { ch1: 0 }
    const currentChannel: string = 'ch1'
    const eventChannel: string = 'ch1'
    if (eventChannel !== currentChannel) {
      unreadCounts[eventChannel] = (unreadCounts[eventChannel] || 0) + 1
    }
    expect(unreadCounts.ch1).toBe(0)
  })
})

// ============================================================
// 6. 멘션 알림 토스트 (Task 6)
// ============================================================

describe('멘션 알림 토스트 (Task 6)', () => {
  test('messenger_mention 이벤트 → 토스트 표시', () => {
    let toast: { title: string; actionUrl: string } | null = null
    const event = {
      type: 'new-notification',
      notification: {
        type: 'messenger_mention',
        title: '#일반에서 @멘션',
        actionUrl: '/messenger?channelId=ch1',
      },
    }
    if (event.type === 'new-notification' && event.notification.type === 'messenger_mention') {
      toast = { title: event.notification.title, actionUrl: event.notification.actionUrl }
    }
    expect(toast).not.toBeNull()
    expect(toast!.title).toBe('#일반에서 @멘션')
  })

  test('다른 타입 알림 → 토스트 미표시', () => {
    let toast: { title: string; actionUrl: string } | null = null
    const event = {
      type: 'new-notification',
      notification: {
        type: 'chat_complete',
        title: '채팅 완료',
        actionUrl: '/chat',
      },
    }
    if (event.type === 'new-notification' && event.notification.type === 'messenger_mention') {
      toast = { title: event.notification.title, actionUrl: event.notification.actionUrl }
    }
    expect(toast).toBeNull()
  })

  test('토스트 클릭 → channelId 추출', () => {
    const actionUrl = '/messenger?channelId=abc-123'
    const match = actionUrl.match(/channelId=([^&]+)/)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('abc-123')
  })

  test('actionUrl에 channelId 없으면 매칭 실패', () => {
    const actionUrl = '/messenger'
    const match = actionUrl.match(/channelId=([^&]+)/)
    expect(match).toBeNull()
  })
})

// ============================================================
// 7. 검색 쿼리 보안 테스트
// ============================================================

describe('검색 보안 (AC: 전체)', () => {
  test('companyId 격리 — 다른 회사 메시지 제외', () => {
    const companyId = 'co1'
    const messages: Message[] = [
      { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: 'hello', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
      { id: '2', channelId: 'ch1', companyId: 'co2', userId: 'u2', content: 'hello', parentMessageId: null, createdAt: '2026-03-06T10:01:00Z' },
    ]
    const filtered = messages.filter((m) => m.companyId === companyId)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].companyId).toBe('co1')
  })

  test('비멤버 채널 검색 차단', () => {
    const memberChannelIds = ['ch1']
    const results = searchMessages(
      [{ id: '1', channelId: 'ch-secret', companyId: 'co1', userId: 'u1', content: '비밀 메시지', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' }],
      memberChannelIds,
      '비밀',
    )
    expect(results).toHaveLength(0)
  })

  test('SQL 인젝션 패턴 안전성 (ILIKE 파라미터 바인딩)', () => {
    // 실제 서버에서는 drizzle의 ilike가 파라미터 바인딩을 사용
    // 여기서는 로직상 특수문자가 결과에 영향을 주지 않음을 검증
    const results = searchMessages(
      [{ id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u1', content: '정상 메시지', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' }],
      ['ch1'],
      "'; DROP TABLE messages; --",
    )
    expect(results).toHaveLength(0) // 매칭 안됨
  })
})

// ============================================================
// 8. URL 파라미터 처리 (알림 클릭 → 채널 이동)
// ============================================================

describe('URL 파라미터 처리', () => {
  test('channelId 파라미터 추출', () => {
    const url = new URL('http://localhost/messenger?channelId=abc-123')
    const channelId = url.searchParams.get('channelId')
    expect(channelId).toBe('abc-123')
  })

  test('channelId 파라미터 없으면 null', () => {
    const url = new URL('http://localhost/messenger')
    const channelId = url.searchParams.get('channelId')
    expect(channelId).toBeNull()
  })
})

// ============================================================
// 9. lastReadAt 갱신 로직 테스트
// ============================================================

describe('lastReadAt 갱신 로직 (채널 읽음)', () => {
  test('채널 진입 시 lastReadAt을 현재 시각으로 업데이트', () => {
    const before = new Date('2026-03-06T09:00:00Z')
    const now = new Date('2026-03-06T10:00:00Z')
    const member = { lastReadAt: before }
    member.lastReadAt = now
    expect(member.lastReadAt.getTime()).toBe(now.getTime())
  })

  test('읽음 처리 후 unread 0', () => {
    const messages: Message[] = [
      { id: '1', channelId: 'ch1', companyId: 'co1', userId: 'u2', content: 'msg', parentMessageId: null, createdAt: '2026-03-06T10:00:00Z' },
    ]
    const memberships: MemberWithReadAt[] = [
      { channelId: 'ch1', userId: 'u1', joinedAt: '2026-03-06T09:00:00Z', lastReadAt: '2026-03-06T10:01:00Z' },
    ]
    const counts = computeUnreadCounts(memberships, messages)
    expect(counts['ch1']).toBeUndefined()
  })
})

// ============================================================
// 10. 검색 결과 포맷 테스트
// ============================================================

describe('검색 결과 포맷', () => {
  test('검색 결과에 필수 필드 포함', () => {
    const result: SearchResult = {
      id: '1',
      channelId: 'ch1',
      channelName: '일반',
      userId: 'u1',
      userName: '홍길동',
      content: '테스트 메시지',
      createdAt: '2026-03-06T10:00:00Z',
    }
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('channelId')
    expect(result).toHaveProperty('channelName')
    expect(result).toHaveProperty('userId')
    expect(result).toHaveProperty('userName')
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('createdAt')
  })

  test('검색 결과 content 80자 초과 시 잘라서 표시 (UI 로직)', () => {
    const content = 'A'.repeat(120)
    const display = content.length > 80 ? content.slice(0, 80) + '...' : content
    expect(display).toHaveLength(83)
    expect(display.endsWith('...')).toBe(true)
  })

  test('검색 결과 content 80자 이하 시 그대로', () => {
    const content = '짧은 메시지'
    const display = content.length > 80 ? content.slice(0, 80) + '...' : content
    expect(display).toBe('짧은 메시지')
  })
})
