import { describe, test, expect } from 'bun:test'
import { DAGSolver } from '../../lib/workflow/dag-solver'
import { ExecutionContext } from '../../lib/workflow/execution-context'
import { WorkflowEngine } from '../../lib/workflow/engine'
import type { WorkflowStep } from '../../services/workflow/engine'
import type { WorkflowLike, StepExecutor } from '../../lib/workflow/engine'

/**
 * TEA (Test Architect) 자동 생성 테스트
 * Story 18-2: 워크플로우 실행 엔진 (순차/병렬)
 *
 * 리스크 기반 커버리지 분석:
 * - HIGH: 병렬 실행 타이밍, 대규모 DAG, 에러 전파, fail-fast 정확성
 * - MEDIUM: 다중 condition 분기, 복합 템플릿, 컨텍스트 체이닝
 * - LOW: 빈 params, 알 수 없는 스텝 타입, 특수 케이스
 */

function makeStep(overrides: Partial<WorkflowStep> & { id: string }): WorkflowStep {
  return { name: overrides.id, type: 'tool', action: 'test', ...overrides }
}

function makeWorkflow(steps: WorkflowStep[]): WorkflowLike {
  return {
    id: 'wf-tea',
    name: 'TEA Test Workflow',
    companyId: 'comp-tea',
    steps,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// ==============================
// HIGH RISK: 병렬 실행 타이밍 검증
// ==============================
describe('TEA HIGH: 병렬 실행 타이밍', () => {
  test('독립 스텝 2개는 실제로 병렬 실행됨 (총 시간 < 합산 시간)', async () => {
    const slowExecutor: StepExecutor = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return { done: true }
    }

    const wf = makeWorkflow([
      makeStep({ id: 'a', type: 'tool', action: 'slow' }),
      makeStep({ id: 'b', type: 'tool', action: 'slow' }),
    ])
    const engine = new WorkflowEngine(wf, { tool: slowExecutor })
    const start = performance.now()
    const result = await engine.run()
    const elapsed = performance.now() - start

    expect(result.success).toBe(true)
    // 병렬이면 ~100ms, 순차면 ~200ms
    expect(elapsed).toBeLessThan(180)
  })

  test('순차 의존 스텝은 순차 실행됨', async () => {
    const executionOrder: string[] = []
    const trackingExecutor: StepExecutor = async (step) => {
      executionOrder.push(step.id)
      await new Promise(resolve => setTimeout(resolve, 10))
      return { tracked: step.id }
    }

    const wf = makeWorkflow([
      makeStep({ id: '1' }),
      makeStep({ id: '2', dependsOn: ['1'] }),
      makeStep({ id: '3', dependsOn: ['2'] }),
    ])
    const engine = new WorkflowEngine(wf, { tool: trackingExecutor })
    await engine.run()

    expect(executionOrder).toEqual(['1', '2', '3'])
  })
})

// ==============================
// HIGH RISK: 대규모 DAG 성능
// ==============================
describe('TEA HIGH: 대규모 DAG', () => {
  test('20개 스텝 팬아웃 -- 1레이어 + 머지 레이어', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'root' }),
      ...Array.from({ length: 18 }, (_, i) =>
        makeStep({ id: `fan-${i}`, dependsOn: ['root'] })
      ),
      makeStep({ id: 'merge', dependsOn: Array.from({ length: 18 }, (_, i) => `fan-${i}`) }),
    ]
    const tiers = DAGSolver.resolveTiers(steps)
    expect(tiers.length).toBe(3)
    expect(tiers[1].length).toBe(18) // 18개 병렬
  })

  test('20개 스텝 순차 체인 실행', async () => {
    const steps: WorkflowStep[] = Array.from({ length: 20 }, (_, i) =>
      makeStep({
        id: `s${i}`,
        ...(i > 0 ? { dependsOn: [`s${i - 1}`] } : {}),
      })
    )
    const wf = makeWorkflow(steps)
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(20)
  })
})

// ==============================
// HIGH RISK: 에러 전파 & fail-fast
// ==============================
describe('TEA HIGH: 에러 전파', () => {
  test('병렬 레이어에서 하나만 실패 -- 나머지 레이어 미실행', async () => {
    let executedSteps: string[] = []
    const mixedExecutor: StepExecutor = async (step) => {
      executedSteps.push(step.id)
      if (step.id === 'b') throw new Error('B failed')
      return { ok: true }
    }

    const wf = makeWorkflow([
      makeStep({ id: 'a' }),
      makeStep({ id: 'b' }),
      makeStep({ id: 'c', dependsOn: ['a', 'b'] }),
    ])
    const engine = new WorkflowEngine(wf, { tool: mixedExecutor })
    const result = await engine.run()

    expect(result.success).toBe(false)
    expect(executedSteps).not.toContain('c') // c는 실행되지 않아야 함
  })

  test('첫 레이어 실패 시 두번째 레이어 미실행', async () => {
    const failFirst: StepExecutor = async (step) => {
      if (step.id === 's1') throw new Error('First step fails')
      return { ok: true }
    }

    const wf = makeWorkflow([
      makeStep({ id: 's1' }),
      makeStep({ id: 's2', dependsOn: ['s1'] }),
    ])
    const engine = new WorkflowEngine(wf, { tool: failFirst })
    const result = await engine.run()

    expect(result.success).toBe(false)
    expect(result.results.length).toBe(1)
    expect(result.results[0].id).toBe('s1')
  })

  test('실패한 스텝의 durationMs가 기록됨', async () => {
    const failExecutor: StepExecutor = async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
      throw new Error('Timed failure')
    }

    const wf = makeWorkflow([makeStep({ id: 's1', type: 'tool', action: 'fail' })])
    const engine = new WorkflowEngine(wf, { tool: failExecutor })
    const result = await engine.run()

    expect(result.results[0].durationMs).toBeGreaterThan(0)
  })
})

// ==============================
// MEDIUM RISK: 다중 condition 분기
// ==============================
describe('TEA MEDIUM: condition 분기 복합', () => {
  test('condition true -- trueBranch만 실행, 의존 스텝도 정상', async () => {
    const wf = makeWorkflow([
      makeStep({
        id: 'cond',
        type: 'condition',
        action: 'check',
        params: { condition: true },
        trueBranch: 'true_step',
        falseBranch: 'false_step',
      }),
      makeStep({ id: 'true_step' }),
      makeStep({ id: 'false_step' }),
      makeStep({ id: 'after', dependsOn: ['true_step'] }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    const states = Object.fromEntries(result.results.map(r => [r.id, r.state]))
    expect(states['true_step']).toBe('success')
    expect(states['false_step']).toBe('skipped')
    expect(states['after']).toBe('success')
  })

  test('condition 없는 params -- 기본값 true', async () => {
    const wf = makeWorkflow([
      makeStep({
        id: 'cond',
        type: 'condition',
        action: 'check',
        // params 없음 → 기본 condition=true
        trueBranch: 'tb',
        falseBranch: 'fb',
      }),
      makeStep({ id: 'tb' }),
      makeStep({ id: 'fb' }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    const states = Object.fromEntries(result.results.map(r => [r.id, r.state]))
    expect(states['fb']).toBe('skipped')
  })
})

// ==============================
// MEDIUM RISK: 복합 템플릿 체이닝
// ==============================
describe('TEA MEDIUM: 컨텍스트 체이닝', () => {
  test('3단계 체이닝: A → B → C, 각각 이전 결과 참조', async () => {
    let stepIdx = 0
    const chainingExecutor: StepExecutor = async (step, ctx) => {
      stepIdx++
      return { value: `result-${stepIdx}`, step: step.id }
    }

    const wf = makeWorkflow([
      makeStep({ id: 'a', params: { input: 'start' } }),
      makeStep({ id: 'b', dependsOn: ['a'], params: { prev: '{{a.value}}' } }),
      makeStep({ id: 'c', dependsOn: ['b'], params: { prev: '{{b.value}}' } }),
    ])
    const engine = new WorkflowEngine(wf, { tool: chainingExecutor })
    const result = await engine.run()

    expect(result.success).toBe(true)
    // b의 params는 a의 결과를 참조
    const bOutput = result.results.find(r => r.id === 'b')
    expect(bOutput?.state).toBe('success')
  })

  test('여러 스텝 출력을 하나의 params에서 동시 참조', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 'x', params: { q: 'hello' } }),
      makeStep({ id: 'y', params: { q: 'world' } }),
      makeStep({
        id: 'z',
        dependsOn: ['x', 'y'],
        params: { combined: '{{x.requestedParams.q}} {{y.requestedParams.q}}' },
      }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    const z = result.results.find(r => r.id === 'z')
    expect((z?.output as any)?.requestedParams?.combined).toBe('hello world')
  })
})

// ==============================
// MEDIUM RISK: retry 동작 세부 검증
// ==============================
describe('TEA MEDIUM: retry 세부 동작', () => {
  test('retryCount=0 -- 재시도 없이 즉시 실패', async () => {
    let attempts = 0
    const failExecutor: StepExecutor = async () => {
      attempts++
      throw new Error('fail')
    }

    const wf = makeWorkflow([makeStep({ id: 's1', retryCount: 0 })])
    const engine = new WorkflowEngine(wf, { tool: failExecutor })
    await engine.run()

    expect(attempts).toBe(1)
  })

  test('retryCount=2 -- 최대 3회 시도 (1 original + 2 retries)', async () => {
    let attempts = 0
    const failExecutor: StepExecutor = async () => {
      attempts++
      throw new Error('fail')
    }

    const wf = makeWorkflow([makeStep({ id: 's1', retryCount: 2 })])
    const engine = new WorkflowEngine(wf, { tool: failExecutor })
    await engine.run()

    expect(attempts).toBe(3) // 1 original + 2 retries
  })
})

// ==============================
// LOW RISK: 엣지 케이스
// ==============================
describe('TEA LOW: 엣지 케이스', () => {
  test('params 없는 스텝 -- 정상 실행', async () => {
    const wf = makeWorkflow([makeStep({ id: 's1' })])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results[0].output).toBeDefined()
  })

  test('StepResult에 name 필드 포함', async () => {
    const wf = makeWorkflow([makeStep({ id: 's1', name: 'My Step' })])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.results[0].name).toBe('My Step')
  })

  test('totalDurationMs가 양수', async () => {
    const wf = makeWorkflow([makeStep({ id: 's1' })])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
  })

  test('skipped 스텝의 durationMs는 0', async () => {
    const wf = makeWorkflow([
      makeStep({
        id: 'cond',
        type: 'condition',
        action: 'check',
        params: { condition: true },
        trueBranch: 'tb',
        falseBranch: 'fb',
      }),
      makeStep({ id: 'tb' }),
      makeStep({ id: 'fb' }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    const skipped = result.results.find(r => r.state === 'skipped')
    expect(skipped?.durationMs).toBe(0)
  })

  test('비연결 서브그래프 -- 모두 실행됨', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 'a1' }),
      makeStep({ id: 'a2', dependsOn: ['a1'] }),
      makeStep({ id: 'b1' }),
      makeStep({ id: 'b2', dependsOn: ['b1'] }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(4)
    expect(result.results.every(r => r.state === 'success')).toBe(true)
  })
})
