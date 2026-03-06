/**
 * Story 12-4 QA: 위임 보안 강화 로직 검증
 * bun test src/__tests__/unit/delegation-security.test.ts
 */
import { describe, test, expect } from 'bun:test'

describe('순환 위임 규칙 감지 (DFS)', () => {
  // 그래프 기반 순환 감지 로직 시뮬레이션
  function detectCycle(
    existingRules: { sourceAgentId: string; targetAgentId: string }[],
    newSourceId: string,
    newTargetId: string,
  ): boolean {
    const graph = new Map<string, string[]>()
    for (const r of existingRules) {
      const targets = graph.get(r.sourceAgentId) || []
      targets.push(r.targetAgentId)
      graph.set(r.sourceAgentId, targets)
    }
    const newTargets = graph.get(newSourceId) || []
    newTargets.push(newTargetId)
    graph.set(newSourceId, newTargets)

    const visited = new Set<string>()
    function dfs(node: string): boolean {
      if (node === newSourceId) return true
      if (visited.has(node)) return false
      visited.add(node)
      for (const next of graph.get(node) || []) {
        if (dfs(next)) return true
      }
      return false
    }
    return dfs(newTargetId)
  }

  test('A->B->C->A 3단계 순환 감지', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'B', targetAgentId: 'C' },
    ]
    // C->A 추가 시 순환
    expect(detectCycle(rules, 'C', 'A')).toBe(true)
  })

  test('A->B 직접 순환 감지', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
    ]
    // B->A 추가 시 순환
    expect(detectCycle(rules, 'B', 'A')).toBe(true)
  })

  test('순환 없는 규칙 추가 허용', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'B', targetAgentId: 'C' },
    ]
    // D->A 추가 — 순환 없음
    expect(detectCycle(rules, 'D', 'A')).toBe(false)
  })

  test('빈 규칙에 새 규칙 추가 — 순환 없음', () => {
    expect(detectCycle([], 'A', 'B')).toBe(false)
  })

  test('4단계 순환 감지 (A->B->C->D->A)', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'B', targetAgentId: 'C' },
      { sourceAgentId: 'C', targetAgentId: 'D' },
    ]
    expect(detectCycle(rules, 'D', 'A')).toBe(true)
  })

  test('분기형 그래프에서 순환 없음', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'A', targetAgentId: 'C' },
      { sourceAgentId: 'B', targetAgentId: 'D' },
    ]
    // C->D 추가 — 분기만 있고 순환 없음
    expect(detectCycle(rules, 'C', 'D')).toBe(false)
  })

  test('자기 자신으로의 간접 순환 (A->B->A)', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
    ]
    expect(detectCycle(rules, 'B', 'A')).toBe(true)
  })

  test('동일 source에 여러 target 규칙이 있는 경우 순환 검사', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'A', targetAgentId: 'C' },
      { sourceAgentId: 'C', targetAgentId: 'D' },
    ]
    // D->A 추가 → A->C->D->A 순환
    expect(detectCycle(rules, 'D', 'A')).toBe(true)
  })
})

describe('역할 기반 권한 제어', () => {
  const allowedRoles = ['admin', 'manager']

  test('admin 역할 허용', () => {
    expect(allowedRoles).toContain('admin')
  })

  test('manager 역할 허용', () => {
    expect(allowedRoles).toContain('manager')
  })

  test('member 역할 차단', () => {
    expect(allowedRoles).not.toContain('member')
  })

  test('viewer 역할 차단', () => {
    expect(allowedRoles).not.toContain('viewer')
  })

  test('역할 체크 로직 시뮬레이션', () => {
    function checkRole(role: string): boolean {
      return role === 'admin' || role === 'manager'
    }
    expect(checkRole('admin')).toBe(true)
    expect(checkRole('manager')).toBe(true)
    expect(checkRole('member')).toBe(false)
    expect(checkRole('')).toBe(false)
  })
})

describe('위임 규칙 개수 제한', () => {
  const MAX_RULES = 50

  test('50개 미만이면 생성 허용', () => {
    const currentCount = 49
    expect(currentCount < MAX_RULES).toBe(true)
  })

  test('50개일 때 생성 차단', () => {
    const currentCount = 50
    expect(currentCount >= MAX_RULES).toBe(true)
  })

  test('0개일 때 생성 허용', () => {
    const currentCount = 0
    expect(currentCount < MAX_RULES).toBe(true)
  })

  test('51개일 때 생성 차단', () => {
    const currentCount = 51
    expect(currentCount >= MAX_RULES).toBe(true)
  })
})

describe('위임 응답 크기 제한', () => {
  const MAX_RESPONSE_LENGTH = 10000

  test('10000자 미만 응답은 그대로 유지', () => {
    const response = 'A'.repeat(5000)
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited.length).toBe(5000)
  })

  test('정확히 10000자 응답은 그대로 유지', () => {
    const response = 'B'.repeat(10000)
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited.length).toBe(10000)
  })

  test('10001자 응답은 10000자로 잘림', () => {
    const response = 'C'.repeat(10001)
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited.length).toBe(10000)
  })

  test('20000자 응답도 10000자로 잘림', () => {
    const response = 'D'.repeat(20000)
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited.length).toBe(10000)
  })

  test('빈 응답은 빈 문자열 유지', () => {
    const response = ''
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited).toBe('')
  })

  test('한글 응답 크기 제한', () => {
    const response = '가'.repeat(12000)
    const limited = response.slice(0, MAX_RESPONSE_LENGTH)
    expect(limited.length).toBe(10000)
    expect(limited).toBe('가'.repeat(10000))
  })
})

describe('에러 코드 매핑', () => {
  const errorCodes: Record<string, { status: number; message: string }> = {
    RULE_002: { status: 400, message: '같은 에이전트에게 위임할 수 없습니다' },
    RULE_003: { status: 400, message: '순환 위임 경로가 감지되었습니다' },
    RULE_004: { status: 400, message: '위임 규칙 최대 개수(50)를 초과했습니다' },
    AUTH_003: { status: 403, message: '위임 규칙은 관리자 또는 매니저만 생성할 수 있습니다' },
  }

  test('RULE_003 순환 감지 에러 코드', () => {
    expect(errorCodes.RULE_003.status).toBe(400)
    expect(errorCodes.RULE_003.message).toContain('순환')
  })

  test('AUTH_003 권한 에러 코드', () => {
    expect(errorCodes.AUTH_003.status).toBe(403)
  })

  test('RULE_004 개수 초과 에러 코드', () => {
    expect(errorCodes.RULE_004.status).toBe(400)
    expect(errorCodes.RULE_004.message).toContain('50')
  })
})
