import { describe, test, expect } from 'bun:test'
import { validateDag, type WorkflowStep } from '../../services/workflow/engine'
import { z } from 'zod'

// === StepSchema (라우트와 동일한 스키마 재정의 -- 단위 테스트용) ===
const StepSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['tool', 'llm', 'condition']),
  action: z.string().min(1),
  params: z.record(z.any()).optional(),
  agentId: z.string().uuid().optional(),
  dependsOn: z.array(z.string().uuid()).optional(),
  trueBranch: z.string().uuid().optional(),
  falseBranch: z.string().uuid().optional(),
  systemPrompt: z.string().optional(),
  timeout: z.number().int().min(1000).max(300000).optional(),
  retryCount: z.number().int().min(0).max(3).optional(),
})

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  steps: z.array(StepSchema).min(1).max(20),
})

// UUID 헬퍼
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

// 스텝 헬퍼
function makeStep(overrides: Partial<WorkflowStep> & { id: string; name: string }): WorkflowStep {
  return {
    type: 'tool',
    action: 'test_action',
    ...overrides,
  }
}

// ==============================
// 1. DAG 유효성 검증 테스트
// ==============================
describe('validateDag', () => {
  test('단일 스텝 -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: '스텝1' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(1)
    expect(result.layers![0].length).toBe(1)
  })

  test('순차 체인 (A->B->C) -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(2), name: 'B', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(3), name: 'C', dependsOn: [uuid(2)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(3) // 3레이어 (순차)
  })

  test('병렬 스텝 (A+B -> C) -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(2), name: 'B' }),
      makeStep({ id: uuid(3), name: 'C', dependsOn: [uuid(1), uuid(2)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(2) // 2레이어 (A,B 병렬 -> C)
    expect(result.layers![0].length).toBe(2) // A, B 병렬
    expect(result.layers![1].length).toBe(1) // C만
  })

  test('순환 참조 (A->B->A) -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', dependsOn: [uuid(2)] }),
      makeStep({ id: uuid(2), name: 'B', dependsOn: [uuid(1)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('순환')
  })

  test('자기 참조 -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', dependsOn: [uuid(1)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('자기 자신'))).toBe(true)
  })

  test('존재하지 않는 stepId 참조 -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', dependsOn: [uuid(99)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('존재하지 않는'))).toBe(true)
  })

  test('중복 stepId -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(1), name: 'B' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('중복'))).toBe(true)
  })

  test('condition 타입 trueBranch 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', type: 'condition', action: 'check', trueBranch: uuid(2), falseBranch: uuid(3) }),
      makeStep({ id: uuid(2), name: 'B' }),
      makeStep({ id: uuid(3), name: 'C' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
  })

  test('condition 타입 trueBranch 존재하지 않는 stepId -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', type: 'condition', action: 'check', trueBranch: uuid(99) }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('trueBranch'))).toBe(true)
  })

  test('condition 타입 falseBranch 존재하지 않는 stepId -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', type: 'condition', action: 'check', falseBranch: uuid(99) }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('falseBranch'))).toBe(true)
  })

  test('빈 dependsOn 배열 -- 유효 (루트 노드)', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', dependsOn: [] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
  })

  test('복잡한 DAG (다이아몬드) -- 유효', () => {
    // A -> B, A -> C, B -> D, C -> D (다이아몬드 패턴)
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(2), name: 'B', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(3), name: 'C', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(4), name: 'D', dependsOn: [uuid(2), uuid(3)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(3) // A -> B,C -> D
  })

  test('3단 순환 (A->B->C->A) -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', dependsOn: [uuid(3)] }),
      makeStep({ id: uuid(2), name: 'B', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(3), name: 'C', dependsOn: [uuid(2)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('순환')
  })
})

// ==============================
// 2. Zod 스키마 검증 테스트
// ==============================
describe('Zod StepSchema', () => {
  test('유효한 tool 스텝 -- 통과', () => {
    const step = {
      id: uuid(1),
      name: '웹 검색',
      type: 'tool',
      action: 'real_web_search',
      params: { query: 'test' },
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('유효한 llm 스텝 -- 통과', () => {
    const step = {
      id: uuid(1),
      name: 'AI 분석',
      type: 'llm',
      action: '데이터를 분석해주세요',
      systemPrompt: '당신은 데이터 분석가입니다',
      agentId: uuid(10),
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('유효한 condition 스텝 -- 통과', () => {
    const step = {
      id: uuid(1),
      name: '결과 분기',
      type: 'condition',
      action: 'result.score > 0.8',
      trueBranch: uuid(2),
      falseBranch: uuid(3),
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('type 필드 누락 -- 실패', () => {
    const step = { id: uuid(1), name: 'test', action: 'do_something' }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('action 필드 누락 -- 실패', () => {
    const step = { id: uuid(1), name: 'test', type: 'tool' }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('name 필드 빈 문자열 -- 실패', () => {
    const step = { id: uuid(1), name: '', type: 'tool', action: 'test' }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('잘못된 type enum -- 실패', () => {
    const step = { id: uuid(1), name: 'test', type: 'unknown', action: 'test' }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('id가 UUID 형식이 아닌 경우 -- 실패', () => {
    const step = { id: 'not-a-uuid', name: 'test', type: 'tool', action: 'test' }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('timeout 1000ms 미만 -- 실패', () => {
    const step = { id: uuid(1), name: 'test', type: 'tool', action: 'test', timeout: 500 }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('timeout 300000ms 초과 -- 실패', () => {
    const step = { id: uuid(1), name: 'test', type: 'tool', action: 'test', timeout: 500000 }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })

  test('retryCount 3 초과 -- 실패', () => {
    const step = { id: uuid(1), name: 'test', type: 'tool', action: 'test', retryCount: 5 }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })
})

describe('Zod CreateWorkflowSchema', () => {
  test('유효한 워크플로우 -- 통과', () => {
    const workflow = {
      name: '일일 시장 분석',
      description: '매일 아침 데이터 수집 -> 분석 -> 보고서',
      steps: [
        { id: uuid(1), name: '데이터 수집', type: 'tool', action: 'real_web_search', params: { query: '시장 동향' } },
        { id: uuid(2), name: '분석', type: 'llm', action: '분석해주세요', dependsOn: [uuid(1)] },
      ],
    }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(true)
  })

  test('name 빈 문자열 -- 실패', () => {
    const workflow = {
      name: '',
      steps: [{ id: uuid(1), name: 'test', type: 'tool', action: 'test' }],
    }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  test('name 200자 초과 -- 실패', () => {
    const workflow = {
      name: 'x'.repeat(201),
      steps: [{ id: uuid(1), name: 'test', type: 'tool', action: 'test' }],
    }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  test('steps 빈 배열 -- 실패', () => {
    const workflow = { name: 'test', steps: [] }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  test('steps 20개 초과 -- 실패', () => {
    const steps = Array.from({ length: 21 }, (_, i) => ({
      id: uuid(i + 1),
      name: `스텝${i + 1}`,
      type: 'tool' as const,
      action: 'test',
    }))
    const workflow = { name: 'test', steps }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  test('steps 정확히 20개 -- 통과', () => {
    const steps = Array.from({ length: 20 }, (_, i) => ({
      id: uuid(i + 1),
      name: `스텝${i + 1}`,
      type: 'tool' as const,
      action: 'test',
    }))
    const workflow = { name: 'test', steps }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(true)
  })

  test('description 2000자 초과 -- 실패', () => {
    const workflow = {
      name: 'test',
      description: 'x'.repeat(2001),
      steps: [{ id: uuid(1), name: 'test', type: 'tool', action: 'test' }],
    }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(false)
  })

  test('추가 필드 무시 (strip) -- 통과', () => {
    const workflow = {
      name: 'test',
      steps: [{ id: uuid(1), name: 'test', type: 'tool', action: 'test' }],
      extraField: 'ignored',
    }
    const result = CreateWorkflowSchema.safeParse(workflow)
    expect(result.success).toBe(true)
  })
})

// ==============================
// 3. 엣지케이스 테스트
// ==============================
describe('Edge Cases', () => {
  test('모든 스텝이 독립 (dependsOn 없음) -- 모두 1레이어', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(2), name: 'B' }),
      makeStep({ id: uuid(3), name: 'C' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(1)
    expect(result.layers![0].length).toBe(3)
  })

  test('모든 스텝이 순차 (긴 체인) -- 스텝 수만큼 레이어', () => {
    const steps: WorkflowStep[] = Array.from({ length: 5 }, (_, i) =>
      makeStep({
        id: uuid(i + 1),
        name: `Step${i + 1}`,
        ...(i > 0 ? { dependsOn: [uuid(i)] } : {}),
      })
    )
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(5)
  })

  test('스텝에 다양한 타입 혼합 -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: '수집', type: 'tool', action: 'web_search' }),
      makeStep({ id: uuid(2), name: '분석', type: 'llm', action: '분석 프롬프트', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(3), name: '분기', type: 'condition', action: 'score > 80', dependsOn: [uuid(2)], trueBranch: uuid(4), falseBranch: uuid(5) }),
      makeStep({ id: uuid(4), name: '보고서', type: 'llm', action: '보고서 작성' }),
      makeStep({ id: uuid(5), name: '재시도', type: 'tool', action: 'retry_analysis' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
  })

  test('agentId가 있는 스텝 -- 유효', () => {
    const step = {
      id: uuid(1),
      name: '에이전트 할당',
      type: 'tool' as const,
      action: 'real_web_search',
      agentId: uuid(100),
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('agentId가 UUID 형식이 아닌 경우 -- 실패', () => {
    const step = {
      id: uuid(1),
      name: '에이전트 할당',
      type: 'tool' as const,
      action: 'test',
      agentId: 'not-uuid',
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(false)
  })
})
