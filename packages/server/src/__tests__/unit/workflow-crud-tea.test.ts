import { describe, test, expect } from 'bun:test'
import { validateDag, type WorkflowStep } from '../../services/workflow/engine'
import { z } from 'zod'

/**
 * TEA (Test Architect) 자동 생성 테스트
 * Story 18-1: 워크플로우 CRUD API + 다단계 스텝 정의
 *
 * 리스크 기반 커버리지 분석:
 * - HIGH: DAG 에러 누적, 최대 스텝 경계, 다중 에러 동시 발생
 * - MEDIUM: 비연결 서브그래프, UpdateSchema 검증, 복잡한 의존성
 * - LOW: 빈 params, 모든 optional 필드 동시 사용
 */

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

function makeStep(overrides: Partial<WorkflowStep> & { id: string; name: string }): WorkflowStep {
  return { type: 'tool', action: 'test_action', ...overrides }
}

// UpdateWorkflowSchema (라우트와 동일)
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

const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  steps: z.array(StepSchema).min(1).max(20).optional(),
}).refine(
  (data) => data.name !== undefined || data.description !== undefined || data.steps !== undefined,
  { message: '최소 하나의 필드(name, description, steps)가 필요합니다' }
)

// ==============================
// HIGH RISK: DAG 에러 누적
// ==============================
describe('TEA HIGH: DAG 다중 에러 동시 발생', () => {
  test('중복 stepId + 존재하지 않는 참조 동시 발생 -- 모든 에러 반환', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(1), name: 'B' }), // 중복
      makeStep({ id: uuid(2), name: 'C', dependsOn: [uuid(99)] }), // 없는 참조
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
    expect(result.errors.some(e => e.includes('중복'))).toBe(true)
    expect(result.errors.some(e => e.includes('존재하지 않는'))).toBe(true)
  })

  test('condition 분기 에러 + 자기 참조 동시 발생', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A', type: 'condition', action: 'check', trueBranch: uuid(99), falseBranch: uuid(98) }),
      makeStep({ id: uuid(2), name: 'B', dependsOn: [uuid(2)] }), // 자기 참조
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })
})

// ==============================
// HIGH RISK: 최대 스텝 경계
// ==============================
describe('TEA HIGH: 최대 스텝 경계 테스트', () => {
  test('20개 스텝 순차 체인 -- 유효 (경계값)', () => {
    const steps: WorkflowStep[] = Array.from({ length: 20 }, (_, i) =>
      makeStep({
        id: uuid(i + 1),
        name: `S${i + 1}`,
        ...(i > 0 ? { dependsOn: [uuid(i)] } : {}),
      })
    )
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(20) // 20레이어 순차
  })

  test('20개 스텝 모두 병렬 -- 유효 (1레이어)', () => {
    const steps: WorkflowStep[] = Array.from({ length: 20 }, (_, i) =>
      makeStep({ id: uuid(i + 1), name: `P${i + 1}` })
    )
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(1)
    expect(result.layers![0].length).toBe(20)
  })
})

// ==============================
// MEDIUM RISK: 비연결 서브그래프
// ==============================
describe('TEA MEDIUM: 비연결 서브그래프', () => {
  test('2개의 독립 체인 -- 유효', () => {
    const steps: WorkflowStep[] = [
      // 체인 1: A -> B
      makeStep({ id: uuid(1), name: 'A1' }),
      makeStep({ id: uuid(2), name: 'A2', dependsOn: [uuid(1)] }),
      // 체인 2: C -> D
      makeStep({ id: uuid(3), name: 'B1' }),
      makeStep({ id: uuid(4), name: 'B2', dependsOn: [uuid(3)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(2) // 각 체인의 첫 스텝이 1레이어, 두번째가 2레이어
    expect(result.layers![0].length).toBe(2) // A1, B1 병렬
    expect(result.layers![1].length).toBe(2) // A2, B2 병렬
  })

  test('1개 독립 + 1개 체인 -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: '독립' }),
      makeStep({ id: uuid(2), name: '체인1' }),
      makeStep({ id: uuid(3), name: '체인2', dependsOn: [uuid(2)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(2)
  })
})

// ==============================
// MEDIUM RISK: UpdateWorkflowSchema
// ==============================
describe('TEA MEDIUM: UpdateWorkflowSchema 검증', () => {
  test('name만 업데이트 -- 통과', () => {
    const result = UpdateWorkflowSchema.safeParse({ name: '새 이름' })
    expect(result.success).toBe(true)
  })

  test('description만 업데이트 -- 통과', () => {
    const result = UpdateWorkflowSchema.safeParse({ description: '새 설명' })
    expect(result.success).toBe(true)
  })

  test('steps만 업데이트 -- 통과', () => {
    const result = UpdateWorkflowSchema.safeParse({
      steps: [{ id: uuid(1), name: 'test', type: 'tool', action: 'test' }],
    })
    expect(result.success).toBe(true)
  })

  test('빈 객체 -- 실패 (최소 1필드 필요)', () => {
    const result = UpdateWorkflowSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('steps 빈 배열 -- 실패 (min 1)', () => {
    const result = UpdateWorkflowSchema.safeParse({ steps: [] })
    expect(result.success).toBe(false)
  })

  test('name 빈 문자열 -- 실패', () => {
    const result = UpdateWorkflowSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  test('알 수 없는 필드 추가 -- 통과 (Zod strip)', () => {
    const result = UpdateWorkflowSchema.safeParse({ name: 'test', unknownField: true })
    expect(result.success).toBe(true)
  })
})

// ==============================
// MEDIUM RISK: 복잡한 의존성 패턴
// ==============================
describe('TEA MEDIUM: 복잡한 의존성 패턴', () => {
  test('팬아웃 + 팬인 (1->3->1) -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'Start' }),
      makeStep({ id: uuid(2), name: 'P1', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(3), name: 'P2', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(4), name: 'P3', dependsOn: [uuid(1)] }),
      makeStep({ id: uuid(5), name: 'Merge', dependsOn: [uuid(2), uuid(3), uuid(4)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(3)
    expect(result.layers![1].length).toBe(3) // P1, P2, P3 병렬
  })

  test('다중 의존성 체인 -- 유효', () => {
    // A -> C, B -> C, C -> D, C -> E
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'A' }),
      makeStep({ id: uuid(2), name: 'B' }),
      makeStep({ id: uuid(3), name: 'C', dependsOn: [uuid(1), uuid(2)] }),
      makeStep({ id: uuid(4), name: 'D', dependsOn: [uuid(3)] }),
      makeStep({ id: uuid(5), name: 'E', dependsOn: [uuid(3)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
    expect(result.layers!.length).toBe(3)
  })

  test('부분 순환 (일부만 순환, 나머지는 정상) -- 에러', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'OK' }),
      makeStep({ id: uuid(2), name: 'CycA', dependsOn: [uuid(3)] }),
      makeStep({ id: uuid(3), name: 'CycB', dependsOn: [uuid(2)] }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(false)
  })
})

// ==============================
// LOW RISK: 모든 optional 필드
// ==============================
describe('TEA LOW: 전체 필드 조합', () => {
  test('모든 optional 필드 사용 -- 유효', () => {
    const step = {
      id: uuid(1),
      name: '풀 옵션 스텝',
      type: 'tool' as const,
      action: 'full_test',
      params: { key: 'value', nested: { a: 1 } },
      agentId: uuid(50),
      dependsOn: [],
      timeout: 60000,
      retryCount: 2,
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('최소 필수 필드만 -- 유효', () => {
    const step = {
      id: uuid(1),
      name: 'minimal',
      type: 'tool' as const,
      action: 'test',
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })

  test('condition 스텝에 trueBranch만 (falseBranch 없음) -- 유효', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: uuid(1), name: 'C', type: 'condition', action: 'check', trueBranch: uuid(2) }),
      makeStep({ id: uuid(2), name: 'T' }),
    ]
    const result = validateDag(steps)
    expect(result.valid).toBe(true)
  })

  test('llm 스텝에 systemPrompt + agentId -- 유효', () => {
    const step = {
      id: uuid(1),
      name: 'AI Analysis',
      type: 'llm' as const,
      action: '분석 요청',
      systemPrompt: '전문 분석가 역할',
      agentId: uuid(10),
      timeout: 120000,
      retryCount: 1,
    }
    const result = StepSchema.safeParse(step)
    expect(result.success).toBe(true)
  })
})
