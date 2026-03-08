import { describe, test, expect } from 'bun:test'
import { DAGSolver } from '../../lib/workflow/dag-solver'
import { ExecutionContext } from '../../lib/workflow/execution-context'
import { WorkflowEngine } from '../../lib/workflow/engine'
import type { WorkflowStep } from '../../services/workflow/engine'
import type { WorkflowLike, StepExecutor } from '../../lib/workflow/engine'

// === Helpers ===

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

function makeStep(overrides: Partial<WorkflowStep> & { id: string }): WorkflowStep {
  return { name: overrides.id, type: 'tool', action: 'test', ...overrides }
}

function makeWorkflow(steps: WorkflowStep[], overrides?: Partial<WorkflowLike>): WorkflowLike {
  return {
    id: 'wf-test',
    name: 'Test Workflow',
    companyId: 'comp-test',
    steps,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ==============================
// DAGSolver 테스트
// ==============================
describe('DAGSolver', () => {
  test('단일 스텝 -- 1레이어', () => {
    const steps = [makeStep({ id: '1' })]
    const tiers = DAGSolver.resolveTiers(steps)
    expect(tiers.length).toBe(1)
    expect(tiers[0].length).toBe(1)
  })

  test('독립 스텝 3개 -- 1레이어 병렬', () => {
    const steps = [makeStep({ id: '1' }), makeStep({ id: '2' }), makeStep({ id: '3' })]
    const tiers = DAGSolver.resolveTiers(steps)
    expect(tiers.length).toBe(1)
    expect(tiers[0].length).toBe(3)
  })

  test('순차 체인 A→B→C -- 3레이어', () => {
    const steps = [
      makeStep({ id: '1' }),
      makeStep({ id: '2', dependsOn: ['1'] }),
      makeStep({ id: '3', dependsOn: ['2'] }),
    ]
    const tiers = DAGSolver.resolveTiers(steps)
    expect(tiers.length).toBe(3)
    expect(tiers[0][0].id).toBe('1')
    expect(tiers[1][0].id).toBe('2')
    expect(tiers[2][0].id).toBe('3')
  })

  test('팬아웃+팬인 1→(2,3)→4 -- 3레이어', () => {
    const steps = [
      makeStep({ id: '1' }),
      makeStep({ id: '2', dependsOn: ['1'] }),
      makeStep({ id: '3', dependsOn: ['1'] }),
      makeStep({ id: '4', dependsOn: ['2', '3'] }),
    ]
    const tiers = DAGSolver.resolveTiers(steps)
    expect(tiers.length).toBe(3)
    expect(tiers[1].length).toBe(2) // 2, 3 병렬
  })

  test('순환 참조 -- Circular dependency 에러', () => {
    const steps = [
      makeStep({ id: '1', dependsOn: ['2'] }),
      makeStep({ id: '2', dependsOn: ['1'] }),
    ]
    expect(() => DAGSolver.resolveTiers(steps)).toThrow('Circular dependency')
  })

  test('자기 참조 -- Circular dependency 에러', () => {
    const steps = [makeStep({ id: '1', dependsOn: ['1'] })]
    expect(() => DAGSolver.resolveTiers(steps)).toThrow('Circular dependency')
  })
})

// ==============================
// ExecutionContext 테스트
// ==============================
describe('ExecutionContext', () => {
  test('단순 속성 치환', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('step1', { result: 'hello' })
    const resolved = ctx.resolveParams({ msg: '{{step1.result}}' })
    expect(resolved.msg).toBe('hello')
  })

  test('중첩 속성 치환', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('auth', { token: { value: 'xyz123' } })
    const resolved = ctx.resolveParams({
      headers: { Authorization: 'Bearer {{auth.token.value}}' },
    })
    expect(resolved.headers.Authorization).toBe('Bearer xyz123')
  })

  test('여러 템플릿 동시 치환', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('a', { x: '1' })
    ctx.setStepOutput('b', { y: '2' })
    const resolved = ctx.resolveParams({ combined: '{{a.x}}-{{b.y}}' })
    expect(resolved.combined).toBe('1-2')
  })

  test('전체 템플릿 -- 원래 타입 보존', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('s1', { count: 42 })
    const resolved = ctx.resolveParams({ val: '{{s1.count}}' })
    expect(resolved.val).toBe(42) // number 타입 보존
  })

  test('배열 내 템플릿 치환', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('s1', { items: ['a', 'b'] })
    const resolved = ctx.resolveParams({ list: '{{s1.items}}' })
    expect(resolved.list).toEqual(['a', 'b'])
  })

  test('존재하지 않는 스텝 참조 -- Strict Templating Error', () => {
    const ctx = new ExecutionContext()
    expect(() => ctx.resolveParams({ x: '{{missing.prop}}' })).toThrow('Strict Templating Error')
  })

  test('존재하지 않는 속성 참조 -- Strict Templating Error', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('s1', { a: 1 })
    expect(() => ctx.resolveParams({ x: '{{s1.b}}' })).toThrow('Strict Templating Error')
  })

  test('중첩 경로 중간이 null -- Strict Templating Error', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('s1', { a: null })
    expect(() => ctx.resolveParams({ x: '{{s1.a.b}}' })).toThrow('Strict Templating Error')
  })

  test('템플릿 없는 params -- 그대로 반환', () => {
    const ctx = new ExecutionContext()
    const params = { key: 'value', num: 42 }
    const resolved = ctx.resolveParams(params)
    expect(resolved).toEqual(params)
  })
})

// ==============================
// WorkflowEngine 테스트
// ==============================
describe('WorkflowEngine', () => {
  test('단일 tool 스텝 실행 -- 성공', async () => {
    const wf = makeWorkflow([makeStep({ id: 's1', type: 'tool', action: 'fetch' })])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(1)
    expect(result.results[0].state).toBe('success')
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
  })

  test('병렬 스텝 2개 + 의존 스텝 1개 -- 성공', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 'a', type: 'tool', action: 'fetch' }),
      makeStep({ id: 'b', type: 'tool', action: 'fetch' }),
      makeStep({ id: 'c', type: 'tool', action: 'merge', dependsOn: ['a', 'b'] }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(3)
    expect(result.results.every(r => r.state === 'success')).toBe(true)
  })

  test('컨텍스트 전달 -- 이전 스텝 출력을 params로 참조', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'fetch', params: { query: 'users' } }),
      makeStep({
        id: 's2',
        type: 'tool',
        action: 'process',
        dependsOn: ['s1'],
        params: { input: '{{s1.requestedParams.query}}' },
      }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    // s2의 output에 치환된 params가 반영됨
    const s2 = result.results.find(r => r.id === 's2')
    expect(s2?.state).toBe('success')
    expect((s2?.output as any)?.requestedParams?.input).toBe('users')
  })

  test('스텝 실행 실패 -- fail-fast', async () => {
    const failExecutor: StepExecutor = async () => {
      throw new Error('Intentional failure')
    }

    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'fail' }),
      makeStep({ id: 's2', type: 'tool', action: 'ok', dependsOn: ['s1'] }),
    ])
    const engine = new WorkflowEngine(wf, { tool: failExecutor })
    const result = await engine.run()

    expect(result.success).toBe(false)
    expect(result.results.length).toBe(1) // s2는 실행되지 않음
    expect(result.results[0].state).toBe('failed')
    expect(result.results[0].error).toContain('Intentional failure')
  })

  test('condition 스텝 -- trueBranch 실행, falseBranch 스킵', async () => {
    const wf = makeWorkflow([
      makeStep({
        id: 'cond',
        type: 'condition',
        action: 'check',
        params: { condition: true },
        trueBranch: uuid(2),
        falseBranch: uuid(3),
      }),
      makeStep({ id: uuid(2), type: 'tool', action: 'true_path' }),
      makeStep({ id: uuid(3), type: 'tool', action: 'false_path' }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    const trueStep = result.results.find(r => r.id === uuid(2))
    const falseStep = result.results.find(r => r.id === uuid(3))
    expect(trueStep?.state).toBe('success')
    expect(falseStep?.state).toBe('skipped')
  })

  test('condition 스텝 -- false일 때 falseBranch 실행', async () => {
    const wf = makeWorkflow([
      makeStep({
        id: 'cond',
        type: 'condition',
        action: 'check',
        params: { condition: false },
        trueBranch: uuid(2),
        falseBranch: uuid(3),
      }),
      makeStep({ id: uuid(2), type: 'tool', action: 'true_path' }),
      makeStep({ id: uuid(3), type: 'tool', action: 'false_path' }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    const trueStep = result.results.find(r => r.id === uuid(2))
    const falseStep = result.results.find(r => r.id === uuid(3))
    expect(trueStep?.state).toBe('skipped')
    expect(falseStep?.state).toBe('success')
  })

  test('llm 스텝 실행 -- 기본 stub', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'llm', action: 'summarize' }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect((result.results[0].output as any)?.completion).toContain('LLM result')
  })

  test('커스텀 executor 주입', async () => {
    const customTool: StepExecutor = async (step) => {
      return { custom: true, action: step.action }
    }

    const wf = makeWorkflow([makeStep({ id: 's1', type: 'tool', action: 'custom' })])
    const engine = new WorkflowEngine(wf, { tool: customTool })
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect((result.results[0].output as any)?.custom).toBe(true)
  })

  test('타임아웃 -- 스텝이 timeout 초과 시 실패', async () => {
    const slowExecutor: StepExecutor = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { done: true }
    }

    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'slow', timeout: 100 }),
    ])
    const engine = new WorkflowEngine(wf, { tool: slowExecutor })
    const result = await engine.run()

    expect(result.success).toBe(false)
    expect(result.results[0].state).toBe('failed')
    expect(result.results[0].error).toContain('timed out')
  })

  test('재시도 -- 2번 실패 후 3번째 성공', async () => {
    let attempts = 0
    const flakyExecutor: StepExecutor = async () => {
      attempts++
      if (attempts < 3) throw new Error(`Attempt ${attempts} failed`)
      return { success: true }
    }

    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'flaky', retryCount: 2 }),
    ])
    const engine = new WorkflowEngine(wf, { tool: flakyExecutor })
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(attempts).toBe(3)
  })

  test('재시도 횟수 초과 -- 최종 실패', async () => {
    const alwaysFailExecutor: StepExecutor = async () => {
      throw new Error('Always fails')
    }

    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'fail', retryCount: 1 }),
    ])
    const engine = new WorkflowEngine(wf, { tool: alwaysFailExecutor })
    const result = await engine.run()

    expect(result.success).toBe(false)
    expect(result.results[0].error).toContain('Always fails')
  })

  test('Strict Templating 실패 -- 존재하지 않는 컨텍스트 참조', async () => {
    const wf = makeWorkflow([
      makeStep({ id: 's1', type: 'tool', action: 'fetch' }),
      makeStep({
        id: 's2',
        type: 'tool',
        action: 'process',
        dependsOn: ['s1'],
        params: { input: '{{s1.nonExistentProp}}' },
      }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(false)
    const s2 = result.results.find(r => r.id === 's2')
    expect(s2?.state).toBe('failed')
    expect(s2?.error).toContain('Strict Templating Error')
  })

  test('빈 워크플로우 -- 성공 (결과 없음)', async () => {
    const wf = makeWorkflow([])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(0)
  })

  test('복잡한 DAG -- 다이아몬드 패턴', async () => {
    // A → B, A → C, B → D, C → D
    const wf = makeWorkflow([
      makeStep({ id: 'A' }),
      makeStep({ id: 'B', dependsOn: ['A'] }),
      makeStep({ id: 'C', dependsOn: ['A'] }),
      makeStep({ id: 'D', dependsOn: ['B', 'C'] }),
    ])
    const engine = new WorkflowEngine(wf)
    const result = await engine.run()

    expect(result.success).toBe(true)
    expect(result.results.length).toBe(4)
    expect(result.results.every(r => r.state === 'success')).toBe(true)
  })
})
