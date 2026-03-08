import { describe, test, expect } from 'bun:test'
import { PatternAnalyzer, type ToolSequence } from '../../services/workflow/pattern-analyzer'

// === PatternAnalyzer.groupIntoSessions ===

describe('PatternAnalyzer.groupIntoSessions', () => {
  test('빈 배열 → 빈 세션', () => {
    expect(PatternAnalyzer.groupIntoSessions([])).toEqual([])
  })

  test('연속 호출 (30분 이내) → 같은 세션', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: null },
      { toolName: 'email', createdAt: new Date(base.getTime() + 10 * 60000), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['search', 'summarize', 'email']])
  })

  test('30분 초과 갭 → 새로운 세션', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: null },
      { toolName: 'email', createdAt: new Date(base.getTime() + 60 * 60000), sessionId: null }, // 1시간 후
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['search', 'summarize'], ['email']])
  })

  test('동일 sessionId → 같은 세션 (갭과 무관)', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: 'sess-1' },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 60 * 60000), sessionId: 'sess-1' }, // 1시간 후지만 같은 세션
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['search', 'summarize']])
  })

  test('다른 sessionId + 30분 초과 → 새 세션', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: 'sess-1' },
      { toolName: 'email', createdAt: new Date(base.getTime() + 60 * 60000), sessionId: 'sess-2' },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['search'], ['email']])
  })
})

// === PatternAnalyzer.detectPatterns ===

describe('PatternAnalyzer.detectPatterns', () => {
  test('빈 세션 → 패턴 없음', () => {
    expect(PatternAnalyzer.detectPatterns([])).toEqual([])
  })

  test('짧은 세션 (1개 도구) → 패턴 없음', () => {
    const sessions = [['search'], ['search'], ['search']]
    expect(PatternAnalyzer.detectPatterns(sessions)).toEqual([])
  })

  test('3회 이상 반복된 2-도구 시퀀스 → 패턴 감지', () => {
    const sessions = [
      ['search', 'summarize'],
      ['search', 'summarize'],
      ['search', 'summarize'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(1)
    expect(patterns[0].tools).toEqual(['search', 'summarize'])
    expect(patterns[0].count).toBe(3)
  })

  test('2회만 반복 → MIN_PATTERN_OCCURRENCES 미만, 감지 안 됨', () => {
    const sessions = [
      ['search', 'summarize'],
      ['search', 'summarize'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(0)
  })

  test('더 긴 시퀀스가 있으면 짧은 서브시퀀스 제거', () => {
    // 'search → summarize → email'이 3회 반복되면
    // 'search → summarize'도 3회 이상이지만 서브시퀀스이므로 제거
    const sessions = [
      ['search', 'summarize', 'email'],
      ['search', 'summarize', 'email'],
      ['search', 'summarize', 'email'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // 긴 시퀀스만 남아야 함
    const longPattern = patterns.find(p => p.tools.length === 3)
    expect(longPattern).toBeTruthy()
    expect(longPattern!.tools).toEqual(['search', 'summarize', 'email'])
    // 짧은 서브시퀀스는 제거
    const shortPattern = patterns.find(p =>
      p.tools.join(' → ') === 'search → summarize'
    )
    expect(shortPattern).toBeUndefined()
  })

  test('빈도 내림차순 정렬', () => {
    // 패턴 A: 5회, 패턴 B: 3회
    const sessions = [
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
      ['x', 'y'],
      ['x', 'y'],
      ['x', 'y'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(2)
    expect(patterns[0].count).toBeGreaterThanOrEqual(patterns[1].count)
    expect(patterns[0].tools).toEqual(['a', 'b'])
  })

  test('같은 세션 내 중복 서브시퀀스는 1회만 카운트', () => {
    // 세션: [search, summarize, search, summarize]
    // 'search → summarize'는 이 세션에서 2번 나타나지만 1회만 카운트
    const sessions = [
      ['search', 'summarize', 'search', 'summarize'],
      ['search', 'summarize'],
      ['search', 'summarize'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    const pattern = patterns.find(p => p.tools.join(' → ') === 'search → summarize')
    expect(pattern).toBeTruthy()
    expect(pattern!.count).toBe(3) // 3 세션에서 각 1회
  })

  test('여러 독립 패턴 동시 감지', () => {
    const sessions = [
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
      ['x', 'y'],
      ['x', 'y'],
      ['x', 'y'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBeGreaterThanOrEqual(2)
  })

  test('MAX_SEQUENCE_LENGTH 초과 시퀀스는 탐지 안 함', () => {
    // 11개 도구 시퀀스 (MAX_SEQUENCE_LENGTH = 10)
    const longSession = Array.from({ length: 11 }, (_, i) => `tool${i}`)
    const sessions = [longSession, longSession, longSession]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // 11개짜리 패턴은 없어야 함
    const elevenPattern = patterns.find(p => p.tools.length === 11)
    expect(elevenPattern).toBeUndefined()
    // 10개 이하 패턴은 있을 수 있음
    if (patterns.length > 0) {
      expect(patterns[0].tools.length).toBeLessThanOrEqual(10)
    }
  })
})

// === 통합 시나리오 ===

describe('PatternAnalyzer integration scenarios', () => {
  test('세션 그룹핑 → 패턴 탐지 파이프라인', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    // 3개 세션, 각각 동일 패턴
    const calls = [
      // 세션 1
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: null },
      // 1시간 갭
      // 세션 2
      { toolName: 'search', createdAt: new Date(base.getTime() + 60 * 60000), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 65 * 60000), sessionId: null },
      // 1시간 갭
      // 세션 3
      { toolName: 'search', createdAt: new Date(base.getTime() + 120 * 60000), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 125 * 60000), sessionId: null },
    ]

    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions.length).toBe(3)

    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(1)
    expect(patterns[0].tools).toEqual(['search', 'summarize'])
    expect(patterns[0].count).toBe(3)
  })

  test('혼합 세션에서 여러 패턴 탐지', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const gap = 60 * 60000 // 1시간
    const calls = [
      // 세션 1: search → summarize → email
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: null },
      { toolName: 'email', createdAt: new Date(base.getTime() + 10 * 60000), sessionId: null },
      // 세션 2: search → summarize → email
      { toolName: 'search', createdAt: new Date(base.getTime() + gap), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + gap + 5 * 60000), sessionId: null },
      { toolName: 'email', createdAt: new Date(base.getTime() + gap + 10 * 60000), sessionId: null },
      // 세션 3: search → summarize → email
      { toolName: 'search', createdAt: new Date(base.getTime() + 2 * gap), sessionId: null },
      { toolName: 'summarize', createdAt: new Date(base.getTime() + 2 * gap + 5 * 60000), sessionId: null },
      { toolName: 'email', createdAt: new Date(base.getTime() + 2 * gap + 10 * 60000), sessionId: null },
    ]

    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    const patterns = PatternAnalyzer.detectPatterns(sessions)

    // 'search → summarize → email' 패턴이 감지되어야 함
    const fullPattern = patterns.find(p =>
      p.tools.join(' → ') === 'search → summarize → email'
    )
    expect(fullPattern).toBeTruthy()
    expect(fullPattern!.count).toBe(3)
  })

  test('데이터 부족 시 빈 결과', () => {
    // MIN_SEQUENCE_LENGTH * MIN_PATTERN_OCCURRENCES = 2 * 3 = 6 미만
    const sessions = PatternAnalyzer.groupIntoSessions([
      { toolName: 'search', createdAt: new Date(), sessionId: null },
    ])
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(0)
  })
})
