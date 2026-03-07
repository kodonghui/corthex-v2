import { agentRunner, type AgentConfig } from './agent-runner'
import { makeContext, toAgentConfig, createOrchTask, completeOrchTask } from './chief-of-staff'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { agents } from '../db/schema'
import { eq, and, ne } from 'drizzle-orm'
import type { ToolExecutor } from '@corthex/shared'

// === Types ===

export type SpecialistResult = {
  agentId: string
  agentName: string
  content: string
  status: 'fulfilled' | 'rejected'
  error?: string
  durationMs: number
}

export type ManagerDelegationResult = {
  managerAnalysis: string
  specialistResults: SpecialistResult[]
  summary: {
    totalSpecialists: number
    fulfilled: number
    rejected: number
  }
}

export type DelegateOptions = {
  manager: AgentConfig
  commandText: string
  companyId: string
  commandId: string
  parentTaskId?: string | null
  toolExecutor?: ToolExecutor
}

// === Constants ===

const SPECIALIST_TIMEOUT_MS = 60_000
const TOTAL_TIMEOUT_MS = 300_000 // NFR2: 5 minutes
const MAX_SPECIALISTS = 10 // NFR7

// === Timeout Helper ===

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

// === Core Functions ===

/**
 * Get active specialist agents under the same department as the manager.
 */
export async function getSpecialists(companyId: string, manager: AgentConfig): Promise<AgentConfig[]> {
  if (!(manager as AgentConfig & { departmentId?: string }).departmentId) return []

  const deptId = (manager as AgentConfig & { departmentId: string }).departmentId

  const rows = await db
    .select({
      id: agents.id,
      companyId: agents.companyId,
      name: agents.name,
      nameEn: agents.nameEn,
      tier: agents.tier,
      modelName: agents.modelName,
      soul: agents.soul,
      allowedTools: agents.allowedTools,
      isActive: agents.isActive,
    })
    .from(agents)
    .where(
      and(
        eq(agents.companyId, companyId),
        eq(agents.departmentId, deptId),
        eq(agents.tier, 'specialist'),
        eq(agents.isActive, true),
        ne(agents.id, manager.id),
      ),
    )

  return rows.slice(0, MAX_SPECIALISTS).map(toAgentConfig)
}

/**
 * Manager's own independent analysis (#007 "5th analyst" pattern from v1).
 */
export async function managerSelfAnalysis(
  manager: AgentConfig,
  commandText: string,
  companyId: string,
  toolExecutor?: ToolExecutor,
): Promise<string> {
  const selfAnalysisContext = `당신은 ${manager.name}입니다. 전문가들과 별개로 독자적 분석을 수행하세요.
반드시 도구(API)를 사용하여 실시간 데이터를 직접 조회하고 분석하세요.
전문가 결과는 무시하세요 — 당신만의 독립적 관점을 제시하세요.`

  const response = await agentRunner.execute(
    manager,
    {
      messages: [{ role: 'user', content: commandText }],
      context: selfAnalysisContext,
      maxToolIterations: 5,
    },
    makeContext(companyId, manager),
    toolExecutor,
  )

  return response.content
}

/**
 * Dispatch all specialists in parallel with individual timeouts.
 */
export async function dispatchSpecialists(
  specialists: AgentConfig[],
  commandText: string,
  managerAnalysisSummary: string,
  companyId: string,
  commandId: string,
  parentTaskId: string | null,
  toolExecutor?: ToolExecutor,
): Promise<SpecialistResult[]> {
  if (specialists.length === 0) return []

  const specContext = managerAnalysisSummary
    ? `## 원본 명령\n${commandText}\n\n## Manager 분석 요약 (참고용 — 독립적 관점으로 분석하세요)\n${managerAnalysisSummary.slice(0, 2000)}`
    : undefined

  const tasks = specialists.map(async (specialist): Promise<SpecialistResult> => {
    const startTime = Date.now()

    // Emit specialist dispatched event via DelegationTracker
    delegationTracker.specialistDispatched(companyId, commandId, specialist.id, specialist.name)

    // Create orchestration task record
    const orchTask = await createOrchTask({
      companyId,
      commandId,
      agentId: specialist.id,
      parentTaskId,
      type: 'execute',
      input: commandText,
    })

    try {
      const response = await withTimeout(
        agentRunner.execute(
          specialist,
          {
            messages: [{ role: 'user', content: commandText }],
            context: specContext,
            maxToolIterations: 5,
          },
          makeContext(companyId, specialist),
          toolExecutor,
        ),
        SPECIALIST_TIMEOUT_MS,
        specialist.name,
      )

      const durationMs = Date.now() - startTime
      await completeOrchTask(orchTask.id, response.content, 'completed', orchTask.startedAt)

      delegationTracker.specialistCompleted(companyId, commandId, specialist.id, specialist.name, durationMs)

      return {
        agentId: specialist.id,
        agentName: specialist.name,
        content: response.content,
        status: 'fulfilled',
        durationMs,
      }
    } catch (err) {
      const durationMs = Date.now() - startTime
      const errorMsg = err instanceof Error ? err.message : String(err)
      await completeOrchTask(orchTask.id, errorMsg, 'failed', orchTask.startedAt)

      delegationTracker.specialistFailed(companyId, commandId, specialist.id, specialist.name, errorMsg)

      return {
        agentId: specialist.id,
        agentName: specialist.name,
        content: '',
        status: 'rejected',
        error: errorMsg,
        durationMs,
      }
    }
  })

  const results = await Promise.allSettled(tasks)
  return results.map((r) => r.status === 'fulfilled' ? r.value : {
    agentId: 'unknown',
    agentName: 'unknown',
    content: '',
    status: 'rejected' as const,
    error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    durationMs: 0,
  })
}

/**
 * Full Manager delegation pipeline:
 * 1. Manager self-analysis (#007 5th analyst)
 * 2. Parallel specialist dispatch
 * 3. Collect + format results
 */
export async function delegate(options: DelegateOptions): Promise<ManagerDelegationResult> {
  const { manager, commandText, companyId, commandId, parentTaskId, toolExecutor } = options

  // Emit manager started event
  delegationTracker.managerStarted(companyId, commandId, manager.id, manager.name)

  // Get specialists under this manager's department
  const specialists = await getSpecialists(companyId, manager)

  // Create manager self-analysis orchestration task
  const mgrTask = await createOrchTask({
    companyId,
    commandId,
    agentId: manager.id,
    parentTaskId: parentTaskId ?? null,
    type: 'execute',
    input: commandText,
  })

  let managerAnalysis: string

  if (specialists.length === 0) {
    // No specialists — Manager handles alone (v1 pattern)
    try {
      managerAnalysis = await withTimeout(
        managerSelfAnalysis(manager, commandText, companyId, toolExecutor),
        TOTAL_TIMEOUT_MS,
        'manager-solo',
      )
      await completeOrchTask(mgrTask.id, managerAnalysis, 'completed', mgrTask.startedAt)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      await completeOrchTask(mgrTask.id, errorMsg, 'failed', mgrTask.startedAt)
      managerAnalysis = `Manager 분석 실패: ${errorMsg}`
    }

    return {
      managerAnalysis,
      specialistResults: [],
      summary: { totalSpecialists: 0, fulfilled: 0, rejected: 0 },
    }
  }

  // Manager self-analysis + Specialist parallel dispatch simultaneously (v1 pattern)
  const [mgrResult, specResults] = await Promise.allSettled([
    withTimeout(
      managerSelfAnalysis(manager, commandText, companyId, toolExecutor),
      SPECIALIST_TIMEOUT_MS,
      'manager-self',
    ),
    withTimeout(
      dispatchSpecialists(specialists, commandText, '', companyId, commandId, parentTaskId ?? null, toolExecutor),
      TOTAL_TIMEOUT_MS,
      'specialists-total',
    ),
  ])

  // Collect manager result
  if (mgrResult.status === 'fulfilled') {
    managerAnalysis = mgrResult.value
    await completeOrchTask(mgrTask.id, managerAnalysis, 'completed', mgrTask.startedAt)
  } else {
    const errorMsg = mgrResult.reason instanceof Error ? mgrResult.reason.message : String(mgrResult.reason)
    managerAnalysis = `Manager 분석 실패: ${errorMsg}`
    await completeOrchTask(mgrTask.id, errorMsg, 'failed', mgrTask.startedAt)
  }

  // Collect specialist results
  const specialistResults: SpecialistResult[] = specResults.status === 'fulfilled'
    ? specResults.value
    : []

  const fulfilled = specialistResults.filter((r) => r.status === 'fulfilled').length
  const rejected = specialistResults.filter((r) => r.status === 'rejected').length

  return {
    managerAnalysis,
    specialistResults,
    summary: {
      totalSpecialists: specialists.length,
      fulfilled,
      rejected,
    },
  }
}

/**
 * Format ManagerDelegationResult into a combined text for quality gate.
 */
export function formatDelegationResult(result: ManagerDelegationResult, managerName: string): string {
  const parts: string[] = []

  parts.push(`## ${managerName} 독자 분석 (5번째 분석가)`)
  parts.push(result.managerAnalysis)

  if (result.specialistResults.length > 0) {
    parts.push('')
    parts.push(`## Specialist 분석 결과 (${result.summary.fulfilled}/${result.summary.totalSpecialists} 성공)`)

    for (const spec of result.specialistResults) {
      if (spec.status === 'fulfilled') {
        parts.push('')
        parts.push(`### ${spec.agentName}`)
        parts.push(spec.content)
      } else {
        parts.push('')
        parts.push(`### ${spec.agentName} (실패)`)
        parts.push(`오류: ${spec.error ?? '알 수 없는 오류'}`)
      }
    }
  }

  return parts.join('\n')
}
