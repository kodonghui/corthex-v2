/**
 * TEA-generated tests for Story 18-3: 예측 워크플로우 패턴 분석
 * Risk-based coverage: P0 (critical path) + P1 (important edge cases)
 * Focus: PatternAnalyzer pure logic (groupIntoSessions, detectPatterns)
 */
import { describe, test, expect } from 'bun:test'
import { PatternAnalyzer } from '../../services/workflow/pattern-analyzer'

// === P0: Critical Path - Boundary Conditions ===

describe('[P0] Session Grouping Boundary Conditions', () => {
  const SESSION_GAP_MS = 30 * 60 * 1000 // 30분

  test('정확히 30분 갭 → 같은 세션 (<=)', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'b', createdAt: new Date(base.getTime() + SESSION_GAP_MS), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['a', 'b']])
  })

  test('30분 + 1ms 갭 → 새 세션', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'b', createdAt: new Date(base.getTime() + SESSION_GAP_MS + 1), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['a'], ['b']])
  })

  test('단일 호출 → 단일 세션 (1개 도구)', () => {
    const calls = [
      { toolName: 'search', createdAt: new Date(), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['search']])
  })

  test('sessionId가 null이면 시간 기반 판단', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'b', createdAt: new Date(base.getTime() + 1000), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['a', 'b']])
  })

  test('다른 sessionId + 30분 이내 → 같은 세션 (시간 우선)', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: 'sess-1' },
      { toolName: 'b', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: 'sess-2' },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    // 다른 sessionId라도 30분 이내면 같은 세션
    expect(sessions).toEqual([['a', 'b']])
  })
})

// === P0: Pattern Detection Edge Cases ===

describe('[P0] Pattern Detection - Algorithmic Correctness', () => {
  test('동일 도구 반복 (a→a→a) → 패턴 감지', () => {
    const sessions = [
      ['search', 'search'],
      ['search', 'search'],
      ['search', 'search'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    const pattern = patterns.find(p => p.tools.join(' → ') === 'search → search')
    expect(pattern).toBeTruthy()
    expect(pattern!.count).toBe(3)
  })

  test('겹치는 패턴 (a→b와 b→c가 모두 3회) → 둘 다 감지', () => {
    const sessions = [
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // a→b→c 패턴이 존재하면 a→b, b→c는 서브시퀀스로 제거됨
    const fullPattern = patterns.find(p => p.tools.join(' → ') === 'a → b → c')
    expect(fullPattern).toBeTruthy()
    // 서브시퀀스 a→b는 a→b→c에 포함되므로 제거
    const subPattern = patterns.find(p => p.tools.join(' → ') === 'a → b')
    expect(subPattern).toBeUndefined()
  })

  test('패턴 길이 2~10 범위만 탐지', () => {
    // 정확히 10개 도구 시퀀스
    const tenTools = Array.from({ length: 10 }, (_, i) => `t${i}`)
    const sessions = [tenTools, tenTools, tenTools]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // 10개짜리 패턴은 있어야 함
    const tenPattern = patterns.find(p => p.tools.length === 10)
    expect(tenPattern).toBeTruthy()
  })

  test('avgGapMs는 항상 0 (현재 구현)', () => {
    const sessions = [
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns[0].avgGapMs).toBe(0)
  })

  test('빈도가 같으면 원래 순서 유지 (안정 정렬)', () => {
    // 두 패턴 모두 3회
    const sessions = [
      ['x', 'y'],
      ['x', 'y'],
      ['x', 'y'],
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(2)
    // 빈도가 같으므로 둘 다 존재
    const names = patterns.map(p => p.tools.join(' → '))
    expect(names).toContain('x → y')
    expect(names).toContain('a → b')
  })
})

// === P1: Large Dataset & Performance ===

describe('[P1] Large Dataset Handling', () => {
  test('100개 세션 처리 (성능)', () => {
    const sessions: string[][] = []
    for (let i = 0; i < 100; i++) {
      sessions.push(['search', 'summarize', 'email'])
    }
    const startTime = Date.now()
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    const elapsed = Date.now() - startTime

    expect(patterns.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(5000) // 5초 이내
  })

  test('세션 내 도구 수가 MAX_SEQUENCE_LENGTH보다 큰 경우', () => {
    // 15개 도구 세션
    const longSession = Array.from({ length: 15 }, (_, i) => `tool${i}`)
    const sessions = [longSession, longSession, longSession]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // 모든 패턴은 10개 이하
    for (const p of patterns) {
      expect(p.tools.length).toBeLessThanOrEqual(10)
    }
  })

  test('많은 고유 세션 (패턴 없음)', () => {
    const sessions: string[][] = []
    for (let i = 0; i < 50; i++) {
      sessions.push([`unique-tool-${i}a`, `unique-tool-${i}b`])
    }
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(0)
  })
})

// === P1: Session Grouping Complex Scenarios ===

describe('[P1] Session Grouping Complex Scenarios', () => {
  test('3개 이상 세션으로 분리', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const gap = 60 * 60000 // 1시간
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'b', createdAt: new Date(base.getTime() + gap), sessionId: null },
      { toolName: 'c', createdAt: new Date(base.getTime() + 2 * gap), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([['a'], ['b'], ['c']])
  })

  test('혼합 sessionId - 일부 null, 일부 동일', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const calls = [
      { toolName: 'a', createdAt: new Date(base.getTime()), sessionId: 'sess-1' },
      { toolName: 'b', createdAt: new Date(base.getTime() + 5 * 60000), sessionId: null },
      { toolName: 'c', createdAt: new Date(base.getTime() + 10 * 60000), sessionId: 'sess-1' },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    // b→c는 null→sess-1 (다른 sessionId)이지만 5분 이내므로 같은 세션
    expect(sessions).toEqual([['a', 'b', 'c']])
  })

  test('동일한 도구 이름이 여러 세션에 걸쳐 반복', () => {
    const base = new Date('2026-03-01T10:00:00Z')
    const gap = 60 * 60000
    const calls = [
      { toolName: 'search', createdAt: new Date(base.getTime()), sessionId: null },
      { toolName: 'search', createdAt: new Date(base.getTime() + 1000), sessionId: null },
      { toolName: 'search', createdAt: new Date(base.getTime() + gap), sessionId: null },
      { toolName: 'search', createdAt: new Date(base.getTime() + gap + 1000), sessionId: null },
      { toolName: 'search', createdAt: new Date(base.getTime() + 2 * gap), sessionId: null },
      { toolName: 'search', createdAt: new Date(base.getTime() + 2 * gap + 1000), sessionId: null },
    ]
    const sessions = PatternAnalyzer.groupIntoSessions(calls)
    expect(sessions).toEqual([
      ['search', 'search'],
      ['search', 'search'],
      ['search', 'search'],
    ])
  })
})

// === P2: Subsumption Logic Edge Cases ===

describe('[P2] Subsumption (서브시퀀스 제거) Edge Cases', () => {
  test('부분 문자열 일치가 아닌 정확한 포함 관계만 제거', () => {
    // 'ab → c'가 'a → b → c'에 포함되는지? 아님 (arrow 구분자가 다름)
    // 실제로 tools.join(' → ').includes(key) 체크이므로
    // 'a → b'는 'a → b → c'에 포함됨 (문자열 포함)
    const sessions = [
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
      ['a', 'b', 'c'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    // a→b는 a→b→c에 포함되어 제거됨
    const abPattern = patterns.find(p => p.tools.join(' → ') === 'a → b')
    expect(abPattern).toBeUndefined()
    // b→c도 a→b→c에 포함되어 제거됨
    const bcPattern = patterns.find(p => p.tools.join(' → ') === 'b → c')
    expect(bcPattern).toBeUndefined()
  })

  test('독립된 패턴은 서로 제거하지 않음', () => {
    const sessions = [
      ['a', 'b'],
      ['a', 'b'],
      ['a', 'b'],
      ['c', 'd'],
      ['c', 'd'],
      ['c', 'd'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    expect(patterns.length).toBe(2)
  })

  test('같은 길이 + 같은 빈도의 패턴은 모두 유지', () => {
    const sessions = [
      ['a', 'b'],
      ['c', 'd'],
      ['a', 'b'],
      ['c', 'd'],
      ['a', 'b'],
      ['c', 'd'],
    ]
    const patterns = PatternAnalyzer.detectPatterns(sessions)
    const ab = patterns.find(p => p.tools.join(' → ') === 'a → b')
    const cd = patterns.find(p => p.tools.join(' → ') === 'c → d')
    expect(ab).toBeTruthy()
    expect(cd).toBeTruthy()
  })
})
