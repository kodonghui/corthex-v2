/**
 * Story 6.4: 대화 기록 + autoLearn 유닛 테스트
 *
 * 1. autoLearn 트리거 조건 검증
 * 2. learnedCount done 이벤트 포함 검증
 * 3. 세션 페이지네이션 관련 로직
 *
 * bun test src/__tests__/unit/conversation-history-autolearn.test.ts
 */
import { describe, test, expect } from 'bun:test'

// =============================================
// autoLearn 트리거 조건 (chat.ts에서 추출한 로직)
// =============================================

function shouldAutoLearn(params: {
  autoLearn: boolean | undefined | null
  aiContent: string | null
}): boolean {
  return params.autoLearn !== false && !!params.aiContent
}

describe('autoLearn 트리거 조건', () => {
  test('autoLearn=true, 응답 있음 → 트리거', () => {
    expect(shouldAutoLearn({ autoLearn: true, aiContent: '응답입니다' })).toBe(true)
  })

  test('autoLearn=undefined (기본값), 응답 있음 → 트리거', () => {
    expect(shouldAutoLearn({ autoLearn: undefined, aiContent: '응답입니다' })).toBe(true)
  })

  test('autoLearn=null, 응답 있음 → 트리거 (null !== false)', () => {
    expect(shouldAutoLearn({ autoLearn: null, aiContent: '응답입니다' })).toBe(true)
  })

  test('autoLearn=false → 스킵', () => {
    expect(shouldAutoLearn({ autoLearn: false, aiContent: '응답입니다' })).toBe(false)
  })

  test('aiContent 빈 문자열 → 스킵', () => {
    expect(shouldAutoLearn({ autoLearn: true, aiContent: '' })).toBe(false)
  })

  test('aiContent null → 스킵', () => {
    expect(shouldAutoLearn({ autoLearn: true, aiContent: null })).toBe(false)
  })
})

// =============================================
// done 이벤트 learnedCount 포함 로직
// =============================================

function buildDoneEvent(params: {
  sessionId: string
  learnedCount: number
}): Record<string, unknown> {
  return {
    type: 'done',
    sessionId: params.sessionId,
    ...(params.learnedCount > 0 ? { learnedCount: params.learnedCount } : {}),
  }
}

describe('done 이벤트 learnedCount 포함', () => {
  test('learnedCount=0 → learnedCount 필드 없음', () => {
    const event = buildDoneEvent({ sessionId: 'abc', learnedCount: 0 })
    expect(event.type).toBe('done')
    expect(event.sessionId).toBe('abc')
    expect(event).not.toHaveProperty('learnedCount')
  })

  test('learnedCount=2 → learnedCount 필드 포함', () => {
    const event = buildDoneEvent({ sessionId: 'abc', learnedCount: 2 })
    expect(event.learnedCount).toBe(2)
  })

  test('learnedCount=3 → learnedCount 필드 포함', () => {
    const event = buildDoneEvent({ sessionId: 'abc', learnedCount: 3 })
    expect(event.learnedCount).toBe(3)
  })
})

// =============================================
// 상대 시간 포맷 (session-sidebar.tsx에서 추출)
// =============================================

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

describe('세션 상대 시간 포맷', () => {
  test('null → 빈 문자열', () => {
    expect(formatRelativeTime(null)).toBe('')
  })

  test('방금 전 → "방금"', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('방금')
  })

  test('5분 전 → "5분 전"', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe('5분 전')
  })

  test('3시간 전 → "3시간 전"', () => {
    const threeHrsAgo = new Date(Date.now() - 3 * 3600000).toISOString()
    expect(formatRelativeTime(threeHrsAgo)).toBe('3시간 전')
  })

  test('2일 전 → "2일 전"', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
    expect(formatRelativeTime(twoDaysAgo)).toBe('2일 전')
  })
})

// =============================================
// SSECostInfo learnedCount 파싱 (use-sse-state-machine.ts 로직)
// =============================================

interface SSECostInfo {
  costUsd: number
  tokensUsed: number
  learnedCount: number
}

function parseDoneEvent(data: Record<string, unknown>): SSECostInfo {
  return {
    costUsd: (data.costUsd as number) || 0,
    tokensUsed: (data.tokensUsed as number) || 0,
    learnedCount: (data.learnedCount as number) || 0,
  }
}

describe('SSE done 이벤트 파싱', () => {
  test('learnedCount 포함된 이벤트 → 정확히 파싱', () => {
    const info = parseDoneEvent({ costUsd: 0.01, tokensUsed: 500, learnedCount: 2 })
    expect(info.learnedCount).toBe(2)
    expect(info.costUsd).toBe(0.01)
    expect(info.tokensUsed).toBe(500)
  })

  test('learnedCount 없는 이벤트 → 0 기본값', () => {
    const info = parseDoneEvent({ costUsd: 0.005, tokensUsed: 200 })
    expect(info.learnedCount).toBe(0)
  })

  test('모든 필드 없는 이벤트 → 모두 0', () => {
    const info = parseDoneEvent({})
    expect(info.costUsd).toBe(0)
    expect(info.tokensUsed).toBe(0)
    expect(info.learnedCount).toBe(0)
  })
})
