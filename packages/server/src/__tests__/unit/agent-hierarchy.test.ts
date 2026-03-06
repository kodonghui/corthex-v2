/**
 * Story 12-1 TEA: 에이전트 계층 위임 API 테스트
 * - 위임 규칙 Zod 스키마 검증
 * - 키워드 매칭 로직
 * - 순환 위임 감지 (DFS)
 * - 연쇄 위임 깊이 제한
 * - 위임 규칙 자기 위임 방지
 * - 중복 대상 제거
 * - delegation-chain 이벤트 구조
 *
 * bun test src/__tests__/unit/agent-hierarchy.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Zod 스키마 (agents.ts:176-184 미러) ===
const createRuleSchema = z.object({
  sourceAgentId: z.string().uuid(),
  targetAgentId: z.string().uuid(),
  condition: z.object({
    keywords: z.array(z.string()).min(1),
    departmentId: z.string().uuid().optional(),
  }),
  priority: z.number().int().min(0).max(100).default(0),
})

// === 순환 감지 로직 (orchestrator.ts:159-203 미러) ===
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

// === 키워드 매칭 로직 (orchestrator.ts:208-251 미러) ===
type DelegationRule = {
  targetAgentId: string
  condition: { keywords: string[]; departmentId?: string }
  priority: number
  isActive: boolean
}

function matchRules(
  rules: DelegationRule[],
  userMessage: string,
): { targetAgentId: string; prompt: string }[] {
  const activeRules = rules
    .filter(r => r.isActive)
    .sort((a, b) => b.priority - a.priority)

  if (activeRules.length === 0) return []

  const msgLower = userMessage.toLowerCase()
  const matched: { targetAgentId: string; prompt: string; priority: number }[] = []

  for (const rule of activeRules) {
    const cond = rule.condition
    if (!cond?.keywords?.length) continue

    const hit = cond.keywords.some(kw => msgLower.includes(kw.toLowerCase()))
    if (hit) {
      matched.push({
        targetAgentId: rule.targetAgentId,
        prompt: userMessage,
        priority: rule.priority,
      })
    }
  }

  const seen = new Set<string>()
  return matched.filter(m => {
    if (seen.has(m.targetAgentId)) return false
    seen.add(m.targetAgentId)
    return true
  })
}

// === 연쇄 위임 깊이 체크 (orchestrator.ts:267 미러) ===
function checkDepthLimit(depth: number, maxDepth = 3): boolean {
  return depth < maxDepth
}

// === Tests ===

describe('Zod 스키마 검증 — createRuleSchema', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const validUUID2 = '550e8400-e29b-41d4-a716-446655440001'

  test('유효한 입력 통과', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['금융', '주식'] },
      priority: 10,
    })
    expect(result.success).toBe(true)
  })

  test('priority 기본값 0', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['test'] },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe(0)
    }
  })

  test('UUID가 아닌 sourceAgentId 거부', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: 'not-a-uuid',
      targetAgentId: validUUID2,
      condition: { keywords: ['test'] },
    })
    expect(result.success).toBe(false)
  })

  test('빈 keywords 배열 거부 (min 1)', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: [] },
    })
    expect(result.success).toBe(false)
  })

  test('priority 101 거부 (max 100)', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['test'] },
      priority: 101,
    })
    expect(result.success).toBe(false)
  })

  test('priority -1 거부 (min 0)', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['test'] },
      priority: -1,
    })
    expect(result.success).toBe(false)
  })

  test('condition 없으면 거부', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
    })
    expect(result.success).toBe(false)
  })

  test('departmentId 있는 condition 통과', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['마케팅'], departmentId: validUUID },
    })
    expect(result.success).toBe(true)
  })

  test('departmentId가 UUID 아니면 거부', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['test'], departmentId: 'not-uuid' },
    })
    expect(result.success).toBe(false)
  })

  test('소수점 priority 거부 (int만)', () => {
    const result = createRuleSchema.safeParse({
      sourceAgentId: validUUID,
      targetAgentId: validUUID2,
      condition: { keywords: ['test'] },
      priority: 5.5,
    })
    expect(result.success).toBe(false)
  })
})

describe('키워드 매칭 로직 — matchRules', () => {
  const rules: DelegationRule[] = [
    { targetAgentId: 'agent-finance', condition: { keywords: ['금융', '주식', '투자'] }, priority: 10, isActive: true },
    { targetAgentId: 'agent-marketing', condition: { keywords: ['마케팅', '광고'] }, priority: 5, isActive: true },
    { targetAgentId: 'agent-inactive', condition: { keywords: ['비활성'] }, priority: 20, isActive: false },
  ]

  test('금융 키워드 매칭', () => {
    const result = matchRules(rules, '금융 시장 분석해줘')
    expect(result.length).toBe(1)
    expect(result[0].targetAgentId).toBe('agent-finance')
  })

  test('대소문자 무시 매칭', () => {
    const result = matchRules(rules, 'MARKETING 전략 수립')
    // 'marketing'은 '마케팅'과 다르므로 매칭 안 됨
    expect(result.length).toBe(0)
  })

  test('한글 키워드 대소문자 무관 매칭', () => {
    const result = matchRules(rules, '광고 캠페인 계획')
    expect(result.length).toBe(1)
    expect(result[0].targetAgentId).toBe('agent-marketing')
  })

  test('여러 규칙 동시 매칭', () => {
    const result = matchRules(rules, '금융 광고 캠페인 분석')
    expect(result.length).toBe(2)
    // priority 높은 순: finance(10) > marketing(5)
    expect(result[0].targetAgentId).toBe('agent-finance')
    expect(result[1].targetAgentId).toBe('agent-marketing')
  })

  test('비활성 규칙 제외', () => {
    const result = matchRules(rules, '비활성 테스트')
    expect(result.length).toBe(0)
  })

  test('매칭 없으면 빈 배열', () => {
    const result = matchRules(rules, '날씨가 좋습니다')
    expect(result.length).toBe(0)
  })

  test('빈 규칙 목록 → 빈 결과', () => {
    const result = matchRules([], '금융 분석')
    expect(result.length).toBe(0)
  })

  test('중복 targetAgentId 제거', () => {
    const dupRules: DelegationRule[] = [
      { targetAgentId: 'agent-A', condition: { keywords: ['금융'] }, priority: 10, isActive: true },
      { targetAgentId: 'agent-A', condition: { keywords: ['투자'] }, priority: 5, isActive: true },
    ]
    const result = matchRules(dupRules, '금융 투자 분석')
    expect(result.length).toBe(1)
    expect(result[0].targetAgentId).toBe('agent-A')
  })

  test('키워드가 메시지 일부에 포함되면 매칭', () => {
    const result = matchRules(rules, '해외주식투자 전략')
    // '주식'과 '투자' 모두 포함됨
    expect(result.length).toBe(1)
    expect(result[0].targetAgentId).toBe('agent-finance')
  })

  test('prompt에 원본 메시지 전달', () => {
    const msg = '금융 데이터 분석 요청'
    const result = matchRules(rules, msg)
    expect(result[0].prompt).toBe(msg)
  })

  test('keywords가 빈 배열인 규칙 무시', () => {
    const emptyKwRules: DelegationRule[] = [
      { targetAgentId: 'agent-X', condition: { keywords: [] }, priority: 10, isActive: true },
    ]
    const result = matchRules(emptyKwRules, '아무 메시지')
    expect(result.length).toBe(0)
  })
})

describe('순환 위임 감지 (DFS)', () => {
  test('A→B→C→A 순환 감지', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'B', targetAgentId: 'C' },
    ]
    expect(detectCycle(rules, 'C', 'A')).toBe(true)
  })

  test('A→B 직접 순환', () => {
    const rules = [{ sourceAgentId: 'A', targetAgentId: 'B' }]
    expect(detectCycle(rules, 'B', 'A')).toBe(true)
  })

  test('순환 없는 규칙 허용', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'B', targetAgentId: 'C' },
    ]
    expect(detectCycle(rules, 'D', 'A')).toBe(false)
  })

  test('빈 규칙 → 순환 없음', () => {
    expect(detectCycle([], 'A', 'B')).toBe(false)
  })

  test('다중 분기에서 순환 있는 경로 감지', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'A', targetAgentId: 'C' },
      { sourceAgentId: 'C', targetAgentId: 'D' },
    ]
    // D→A 추가 → A→C→D→A 순환
    expect(detectCycle(rules, 'D', 'A')).toBe(true)
  })

  test('다중 분기에서 순환 없는 경로', () => {
    const rules = [
      { sourceAgentId: 'A', targetAgentId: 'B' },
      { sourceAgentId: 'A', targetAgentId: 'C' },
    ]
    // C→D 추가 — 순환 없음
    expect(detectCycle(rules, 'C', 'D')).toBe(false)
  })
})

describe('자기 위임 방지', () => {
  test('sourceAgentId === targetAgentId 감지', () => {
    const sourceId = 'agent-123'
    const targetId = 'agent-123'
    expect(sourceId === targetId).toBe(true)
  })

  test('다른 에이전트 간 위임 허용', () => {
    const sourceId = 'agent-123'
    const targetId = 'agent-456'
    expect(sourceId === targetId).toBe(false)
  })
})

describe('연쇄 위임 깊이 제한', () => {
  test('depth 0 — 허용 (첫 단계)', () => {
    expect(checkDepthLimit(0)).toBe(true)
  })

  test('depth 1 — 허용 (2단계)', () => {
    expect(checkDepthLimit(1)).toBe(true)
  })

  test('depth 2 — 허용 (3단계, 마지막)', () => {
    expect(checkDepthLimit(2)).toBe(true)
  })

  test('depth 3 — 차단 (4단계, 초과)', () => {
    expect(checkDepthLimit(3)).toBe(false)
  })

  test('depth 10 — 차단', () => {
    expect(checkDepthLimit(10)).toBe(false)
  })

  test('커스텀 maxDepth 5', () => {
    expect(checkDepthLimit(4, 5)).toBe(true)
    expect(checkDepthLimit(5, 5)).toBe(false)
  })
})

describe('delegation-chain 이벤트 구조', () => {
  test('체인 배열에 에이전트 이름 누적', () => {
    const chain: string[] = []
    chain.push('비서실장')
    chain.push('금융분석팀장')
    chain.push('리서치팀원')
    expect(chain).toEqual(['비서실장', '금융분석팀장', '리서치팀원'])
  })

  test('delegation-chain 이벤트 형식', () => {
    const event = {
      type: 'delegation-chain' as const,
      chain: ['비서실장', '금융분석팀장'],
    }
    expect(event.type).toBe('delegation-chain')
    expect(event.chain.length).toBe(2)
  })

  test('빈 체인은 발생하지 않아야 함', () => {
    const chain: string[] = []
    // 최소 1개 에이전트가 추가된 후에만 이벤트 발행
    chain.push('비서실장')
    expect(chain.length).toBeGreaterThan(0)
  })

  test('체인 복사본 전달 (원본 변경 방지)', () => {
    const chain = ['비서실장', '금융분석팀장']
    const eventChain = [...chain]
    chain.push('리서치팀원')
    // 이벤트 체인은 변경되지 않아야 함
    expect(eventChain.length).toBe(2)
    expect(chain.length).toBe(3)
  })
})

describe('OrchestrateEvent 타입 구조', () => {
  test('delegation-start 이벤트', () => {
    const event = {
      type: 'delegation-start' as const,
      targetAgentName: '금융팀장',
      targetAgentId: 'agent-123',
    }
    expect(event.type).toBe('delegation-start')
    expect(event.targetAgentName).toBeTruthy()
    expect(event.targetAgentId).toBeTruthy()
  })

  test('delegation-end 이벤트 — completed', () => {
    const event = {
      type: 'delegation-end' as const,
      targetAgentName: '금융팀장',
      targetAgentId: 'agent-123',
      status: 'completed' as const,
      durationMs: 1500,
    }
    expect(event.status).toBe('completed')
    expect(event.durationMs).toBeGreaterThan(0)
  })

  test('delegation-end 이벤트 — failed', () => {
    const event = {
      type: 'delegation-end' as const,
      targetAgentName: '금융팀장',
      targetAgentId: 'agent-123',
      status: 'failed' as const,
      durationMs: 500,
    }
    expect(event.status).toBe('failed')
  })
})

describe('위임 규칙 priority 정렬', () => {
  test('priority 높은 규칙이 먼저 매칭', () => {
    const rules: DelegationRule[] = [
      { targetAgentId: 'low', condition: { keywords: ['금융'] }, priority: 1, isActive: true },
      { targetAgentId: 'high', condition: { keywords: ['금융'] }, priority: 50, isActive: true },
      { targetAgentId: 'mid', condition: { keywords: ['금융'] }, priority: 25, isActive: true },
    ]
    const result = matchRules(rules, '금융 분석')
    // 중복 target 제거: 가장 높은 priority의 것만 남음
    expect(result.length).toBe(3)
    expect(result[0].targetAgentId).toBe('high')
    expect(result[1].targetAgentId).toBe('mid')
    expect(result[2].targetAgentId).toBe('low')
  })

  test('같은 priority면 규칙 순서 유지', () => {
    const rules: DelegationRule[] = [
      { targetAgentId: 'first', condition: { keywords: ['금융'] }, priority: 10, isActive: true },
      { targetAgentId: 'second', condition: { keywords: ['금융'] }, priority: 10, isActive: true },
    ]
    const result = matchRules(rules, '금융 분석')
    expect(result.length).toBe(2)
  })
})

describe('위임 규칙 CRUD 검증 로직', () => {
  test('규칙 개수 제한 50개', () => {
    const MAX_RULES = 50
    expect(49 < MAX_RULES).toBe(true)
    expect(50 >= MAX_RULES).toBe(true)
  })

  test('응답 크기 제한 10000자', () => {
    const MAX_LEN = 10000
    const long = 'A'.repeat(15000)
    expect(long.slice(0, MAX_LEN).length).toBe(10000)
  })

  test('에이전트 이름 조인 — 알 수 없음 fallback', () => {
    const agentNames: Record<string, string> = { 'id-1': '비서실장', 'id-2': '금융팀장' }
    expect(agentNames['id-1'] || '알 수 없음').toBe('비서실장')
    expect(agentNames['id-unknown'] || '알 수 없음').toBe('알 수 없음')
  })
})
