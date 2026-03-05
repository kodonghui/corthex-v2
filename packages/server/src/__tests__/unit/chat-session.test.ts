/**
 * 채팅 세션 로직 유닛 테스트 — 커서 페이지네이션, 세션 제목 생성, 메시지 limit 클램핑
 * 서버 없이 실행 가능: bun test src/__tests__/unit/chat-session.test.ts
 */
import { describe, test, expect } from 'bun:test'

// =============================================
// limit 클램핑 로직 (chat.ts에서 추출)
// =============================================
function clampLimit(rawLimit: number): number {
  return Math.min(Math.max(rawLimit, 1), 100)
}

describe('메시지 limit 클램핑 (1-100)', () => {
  test('정상 값 50 → 50', () => {
    expect(clampLimit(50)).toBe(50)
  })

  test('최소값 경계: 1 → 1', () => {
    expect(clampLimit(1)).toBe(1)
  })

  test('최대값 경계: 100 → 100', () => {
    expect(clampLimit(100)).toBe(100)
  })

  test('0 이하 → 1로 클램핑', () => {
    expect(clampLimit(0)).toBe(1)
    expect(clampLimit(-5)).toBe(1)
    expect(clampLimit(-100)).toBe(1)
  })

  test('100 초과 → 100으로 클램핑', () => {
    expect(clampLimit(101)).toBe(100)
    expect(clampLimit(999)).toBe(100)
    expect(clampLimit(10000)).toBe(100)
  })

  test('NaN → 1로 클램핑 (Math.max(NaN,1) = NaN이므로 Math.min(NaN,100) = NaN)', () => {
    // Number('abc') || 50 → 50 이 되므로 실제 NaN은 전달되지 않음
    // 하지만 직접 호출 시 NaN 동작 확인
    const result = clampLimit(NaN)
    expect(result).toBeNaN()
  })

  test('소수점 → 소수점 그대로 (정수 변환 없음)', () => {
    expect(clampLimit(50.7)).toBe(50.7)
  })
})

// =============================================
// rawLimit 파싱 로직 (chat.ts에서 추출: Number(query) || 50)
// =============================================
function parseRawLimit(queryValue: string | undefined): number {
  return Number(queryValue) || 50
}

describe('rawLimit 쿼리 파라미터 파싱', () => {
  test('숫자 문자열 → 해당 숫자', () => {
    expect(parseRawLimit('30')).toBe(30)
  })

  test('undefined → 기본값 50', () => {
    expect(parseRawLimit(undefined)).toBe(50)
  })

  test('빈 문자열 → 기본값 50', () => {
    expect(parseRawLimit('')).toBe(50)
  })

  test('비숫자 문자열 → 기본값 50', () => {
    expect(parseRawLimit('abc')).toBe(50)
  })

  test('0 → 기본값 50 (falsy)', () => {
    expect(parseRawLimit('0')).toBe(50)
  })

  test('음수 → 해당 음수 (클램핑은 별도)', () => {
    expect(parseRawLimit('-5')).toBe(-5)
  })
})

// =============================================
// 세션 제목 자동 생성 로직 (chat.ts에서 추출)
// =============================================
function generateSessionTitle(aiContent: string): string | null {
  const keywords = aiContent.match(/[가-힣a-zA-Z0-9]+/g)?.slice(0, 3).join(' ')
  if (!keywords) return null
  return keywords.slice(0, 20)
}

describe('세션 제목 자동 생성', () => {
  test('한국어 키워드 추출', () => {
    const title = generateSessionTitle('안녕하세요! 오늘 날씨가 좋네요.')
    expect(title).not.toBeNull()
    expect(title!.length).toBeLessThanOrEqual(20)
  })

  test('영어 키워드 추출', () => {
    const title = generateSessionTitle('Hello world test message')
    expect(title).toBe('Hello world test')
  })

  test('혼합 키워드 (한영숫자)', () => {
    const title = generateSessionTitle('2024년 매출 report 분석')
    expect(title).not.toBeNull()
    expect(title!.length).toBeLessThanOrEqual(20)
  })

  test('특수문자만 → null', () => {
    const title = generateSessionTitle('!@#$%^&*()')
    expect(title).toBeNull()
  })

  test('빈 문자열 → null', () => {
    const title = generateSessionTitle('')
    expect(title).toBeNull()
  })

  test('20자 초과 시 잘림', () => {
    const title = generateSessionTitle('가나다라마바사아자차카타파하 두번째단어 세번째단어입니다')
    expect(title).not.toBeNull()
    expect(title!.length).toBeLessThanOrEqual(20)
  })

  test('3개 키워드만 사용', () => {
    const title = generateSessionTitle('first second third fourth fifth')
    expect(title).toBe('first second third')
  })
})

// =============================================
// 기본 제목 생성 (에이전트 이름 기반)
// =============================================
function defaultSessionTitle(agentName: string, customTitle?: string): string {
  return customTitle || `${agentName}와의 대화`
}

describe('세션 기본 제목', () => {
  test('사용자 제목 있으면 그대로 사용', () => {
    expect(defaultSessionTitle('비서', '주간 보고')).toBe('주간 보고')
  })

  test('사용자 제목 없으면 에이전트 이름 + "와의 대화"', () => {
    expect(defaultSessionTitle('비서')).toBe('비서와의 대화')
  })

  test('빈 문자열 제목 → 에이전트 이름 사용 (falsy)', () => {
    expect(defaultSessionTitle('마케팅봇', '')).toBe('마케팅봇와의 대화')
  })
})

// =============================================
// hasMore 페이지네이션 판별 로직 (chat.ts에서 추출)
// =============================================
function checkHasMore<T>(messages: T[], limit: number): { data: T[]; hasMore: boolean } {
  const hasMore = messages.length > limit
  const result = hasMore ? messages.slice(0, limit) : [...messages]
  result.reverse() // createdAt ASC로 반환
  return { data: result, hasMore }
}

describe('커서 페이지네이션 hasMore 판별', () => {
  test('결과가 limit+1개 → hasMore true, 마지막 제거', () => {
    const messages = [1, 2, 3, 4, 5, 6] // limit=5, 6개 반환됨
    const result = checkHasMore(messages, 5)
    expect(result.hasMore).toBe(true)
    expect(result.data.length).toBe(5)
  })

  test('결과가 limit 이하 → hasMore false', () => {
    const messages = [1, 2, 3]
    const result = checkHasMore(messages, 5)
    expect(result.hasMore).toBe(false)
    expect(result.data.length).toBe(3)
  })

  test('결과가 정확히 limit개 → hasMore false', () => {
    const messages = [1, 2, 3, 4, 5]
    const result = checkHasMore(messages, 5)
    expect(result.hasMore).toBe(false)
    expect(result.data.length).toBe(5)
  })

  test('빈 결과 → hasMore false', () => {
    const result = checkHasMore([], 50)
    expect(result.hasMore).toBe(false)
    expect(result.data.length).toBe(0)
  })

  test('결과가 reverse 되어 반환됨 (createdAt ASC)', () => {
    const messages = ['newest', 'middle', 'oldest']
    const result = checkHasMore(messages, 5)
    expect(result.data).toEqual(['oldest', 'middle', 'newest'])
  })
})
