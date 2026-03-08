import type { WorkflowStep } from '../../services/workflow/engine'
import { DAGSolver } from './dag-solver'
import { ExecutionContext } from './execution-context'

// === Types ===

export type StepResult = {
  id: string
  name: string
  state: 'success' | 'failed' | 'skipped'
  output?: Record<string, unknown>
  error?: string
  durationMs: number
}

export type WorkflowRunResult = {
  success: boolean
  results: StepResult[]
  totalDurationMs: number
}

export type StepExecutor = (
  step: WorkflowStep,
  context: ExecutionContext
) => Promise<Record<string, unknown>>

// === Default Stub Executors ===

const defaultToolExecutor: StepExecutor = async (step) => {
  return { status: 'success', requestedParams: step.params ?? {} }
}

const defaultLlmExecutor: StepExecutor = async (step) => {
  return { status: 'success', completion: `LLM result for ${step.action}` }
}

const defaultConditionExecutor: StepExecutor = async (step, context) => {
  // condition은 action 필드의 값을 평가하여 truthy/falsy 반환
  // 실제 구현에서는 LLM이나 룰 엔진으로 평가할 수 있음
  // 기본: params.condition 값 또는 true
  const conditionValue = step.params?.condition ?? true
  return { result: Boolean(conditionValue) }
}

// === WorkflowEngine ===

export type WorkflowLike = {
  id: string
  name: string
  companyId: string
  steps: WorkflowStep[]
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export class WorkflowEngine {
  private workflow: WorkflowLike
  private context: ExecutionContext
  private executors: Record<string, StepExecutor>

  constructor(
    workflow: WorkflowLike,
    executors?: Partial<Record<string, StepExecutor>>
  ) {
    this.workflow = workflow
    this.context = new ExecutionContext()
    this.executors = {
      tool: executors?.tool ?? defaultToolExecutor,
      llm: executors?.llm ?? defaultLlmExecutor,
      condition: executors?.condition ?? defaultConditionExecutor,
    }
  }

  async run(): Promise<WorkflowRunResult> {
    const startTime = performance.now()
    const results: StepResult[] = []
    const skippedSteps = new Set<string>()

    // DAG 레이어 분류
    const tiers = DAGSolver.resolveTiers(this.workflow.steps)

    for (const tier of tiers) {
      // condition 스텝을 먼저 실행하여 분기를 결정한 뒤 나머지 병렬 실행
      const conditionSteps = tier.filter(s => s.type === 'condition')
      const otherSteps = tier.filter(s => s.type !== 'condition')

      // 1) condition 스텝 먼저 실행
      for (const condStep of conditionSteps) {
        const condResult = await this.executeStep(condStep, skippedSteps)
        results.push(condResult)

        if (condResult.state === 'failed') {
          return {
            success: false,
            results,
            totalDurationMs: Math.round(performance.now() - startTime),
          }
        }

        // 분기 처리
        if (condResult.output) {
          const boolResult = (condResult.output as { result?: boolean }).result
          if (boolResult) {
            if (condStep.falseBranch) skippedSteps.add(condStep.falseBranch)
          } else {
            if (condStep.trueBranch) skippedSteps.add(condStep.trueBranch)
          }
        }
      }

      // 2) 나머지 스텝 병렬 실행 (condition 분기 결과 반영)
      if (otherSteps.length > 0) {
        const tierResults = await Promise.all(
          otherSteps.map(step => this.executeStep(step, skippedSteps))
        )

        for (const result of tierResults) {
          results.push(result)

          if (result.state === 'failed') {
            return {
              success: false,
              results,
              totalDurationMs: Math.round(performance.now() - startTime),
            }
          }
        }
      }
    }

    return {
      success: true,
      results,
      totalDurationMs: Math.round(performance.now() - startTime),
    }
  }

  private async executeStep(
    step: WorkflowStep,
    skippedSteps: Set<string>
  ): Promise<StepResult> {
    const stepStart = performance.now()

    // 스킵된 스텝 처리
    if (skippedSteps.has(step.id)) {
      return {
        id: step.id,
        name: step.name ?? step.id,
        state: 'skipped',
        durationMs: 0,
      }
    }

    // params에 템플릿이 있으면 치환
    let resolvedParams = step.params
    if (step.params) {
      try {
        resolvedParams = this.context.resolveParams(step.params)
      } catch (e) {
        return {
          id: step.id,
          name: step.name ?? step.id,
          state: 'failed',
          error: e instanceof Error ? e.message : String(e),
          durationMs: Math.round(performance.now() - stepStart),
        }
      }
    }

    const resolvedStep = { ...step, params: resolvedParams }
    const executor = this.executors[step.type]
    if (!executor) {
      return {
        id: step.id,
        name: step.name ?? step.id,
        state: 'failed',
        error: `Unknown step type: ${step.type}`,
        durationMs: Math.round(performance.now() - stepStart),
      }
    }

    // retry with exponential backoff
    const maxRetries = step.retryCount ?? 0
    const timeout = step.timeout ?? 30000

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        // 지수 백오프: 2^(attempt-1) 초
        const waitMs = Math.pow(2, attempt - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, waitMs))
      }

      try {
        const output = await this.withTimeout(
          executor(resolvedStep, this.context),
          timeout,
          step.id
        )

        // 성공: 컨텍스트에 결과 저장
        this.context.setStepOutput(step.id, output)

        return {
          id: step.id,
          name: step.name ?? step.id,
          state: 'success',
          output,
          durationMs: Math.round(performance.now() - stepStart),
        }
      } catch (e) {
        // 마지막 시도에서도 실패
        if (attempt === maxRetries) {
          return {
            id: step.id,
            name: step.name ?? step.id,
            state: 'failed',
            error: e instanceof Error ? e.message : String(e),
            durationMs: Math.round(performance.now() - stepStart),
          }
        }
        // 재시도 계속
      }
    }

    // 여기에 도달할 일은 없지만 타입 안전을 위해
    return {
      id: step.id,
      name: step.name ?? step.id,
      state: 'failed',
      error: 'Unexpected execution path',
      durationMs: Math.round(performance.now() - stepStart),
    }
  }

  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    stepId: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Step "${stepId}" timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
      promise
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(err => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }
}
