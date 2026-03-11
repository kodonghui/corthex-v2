import { agentRunner, type AgentConfig } from './agent-runner'
import {
  makeContext,
  toAgentConfig,
  createOrchTask,
  completeOrchTask,
  findSecretaryAgent,
  getActiveManagers,
  parseLLMJson,
} from '../lib/orchestration-helpers'
import { delegate as managerDelegate, formatDelegationResult } from './manager-delegate'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { commands } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { ToolExecutor } from '@corthex/shared'

// === Types ===

export type SequentialCommandOptions = {
  commandId: string
  commandText: string
  companyId: string
  userId: string
  toolExecutor?: ToolExecutor
}

export type SequentialCommandResult = {
  commandId: string
  content: string
  managerOrder: string[]
  stepCount: number
}

type OrderPlan = {
  order: string[]
  reason: string
}

type StepResult = {
  managerId: string
  managerName: string
  content: string
  error?: string
}

// === Constants ===

const PER_MANAGER_TIMEOUT_MS = 60_000
const MAX_TOTAL_TIMEOUT_MS = 600_000 // 10 minutes max
const MIN_MANAGERS = 2
const MAX_MANAGERS = 4

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

// === Order Planning Prompt (v1 pattern) ===

function buildOrderPrompt(
  commandText: string,
  managers: AgentConfig[],
): string {
  const mgrLines = managers.map(m => `- ${m.name} (id: ${m.id})`).join('\n')

  return `CEO 명령: ${commandText}

이 작업을 처리하기 위해 어떤 부서가 어떤 순서로 작업해야 하는지 결정하세요.

## 가용 Manager 목록
${mgrLines}

## 규칙
- 최소 ${MIN_MANAGERS}개, 최대 ${MAX_MANAGERS}개 Manager만 선택하세요
- 관련 없는 Manager는 제외하세요
- 순서: 기초 분석 -> 전문 분석 -> 종합 판단 순서로 배치

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"order": ["manager-id-1", "manager-id-2"], "reason": "이유"}`
}

// === Synthesis Prompt (v1 pattern) ===

function buildSequentialSynthesisPrompt(): string {
  return `당신은 비서실장입니다. 부서들이 순차적으로 작업한 결과를 종합하여 CEO에게 최종 보고서를 작성하세요.

## 반드시 아래 구조를 따를 것

### 핵심 결론
(순차 협업의 최종 결론을 1~2문장으로)

### 단계별 분석 연계
(각 단계가 이전 단계의 결과를 어떻게 발전시켰는지 요약)

### CEO 결재/결정 필요 사항
(CEO가 결정해야 할 구체적 사항. 없으면 '현재 결재 대기 사항 없음')

### 특이사항 / 리스크
(리스크 요소만 추출. 없으면 '특이사항 없음')

## 규칙
- 한국어로 작성
- 간결하게. CEO가 30초 안에 핵심을 파악할 수 있게
- 순차 협업의 연계 효과를 강조하세요`
}

// === Plan Manager Order ===

export async function planOrder(
  commandText: string,
  companyId: string,
  secretaryAgent: AgentConfig,
  managers: AgentConfig[],
): Promise<string[]> {
  const prompt = buildOrderPrompt(commandText, managers)

  try {
    const response = await agentRunner.execute(
      secretaryAgent,
      {
        messages: [{ role: 'user', content: prompt }],
        maxToolIterations: 0,
      },
      makeContext(companyId, secretaryAgent),
    )

    const parsed = parseLLMJson<OrderPlan>(response.content)
    if (parsed?.order && Array.isArray(parsed.order) && parsed.order.length >= MIN_MANAGERS) {
      // Validate IDs exist in managers list
      const validIds = new Set(managers.map(m => m.id))
      const validOrder = parsed.order.filter(id => validIds.has(id))
      if (validOrder.length >= MIN_MANAGERS) {
        return validOrder.slice(0, MAX_MANAGERS)
      }
    }
  } catch {
    // LLM failed — use default order
  }

  // Fallback: use all managers in order (up to MAX_MANAGERS)
  return managers.slice(0, MAX_MANAGERS).map(m => m.id)
}

// === Main Process Function ===

export async function processSequential(options: SequentialCommandOptions): Promise<SequentialCommandResult> {
  const { commandId, commandText, companyId, toolExecutor } = options

  // Start tracking
  delegationTracker.startCommand(companyId, commandId)
  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  // Find secretary agent
  const secretaryAgent = await findSecretaryAgent(companyId)
  if (!secretaryAgent) {
    await updateCommandFailed(commandId, companyId, '비서실장 에이전트를 찾을 수 없습니다')
    delegationTracker.failed(companyId, commandId, '비서실장 에이전트 없음')
    return { commandId, content: '비서실장 에이전트를 찾을 수 없습니다', managerOrder: [], stepCount: 0 }
  }

  // Get all active managers
  const managerRows = await getActiveManagers(companyId)
  if (managerRows.length === 0) {
    await updateCommandFailed(commandId, companyId, '활성 Manager가 없습니다')
    delegationTracker.failed(companyId, commandId, '활성 Manager 없음')
    return { commandId, content: '활성 Manager가 없습니다', managerOrder: [], stepCount: 0 }
  }

  const allManagers = managerRows.map((r) => toAgentConfig(r as unknown as Parameters<typeof toAgentConfig>[0]))

  // Step 1: Plan order (secretary LLM decides)
  const orderedIds = await planOrder(commandText, companyId, secretaryAgent, allManagers)
  const orderedManagers = orderedIds
    .map(id => allManagers.find(m => m.id === id))
    .filter((m): m is AgentConfig => m != null)

  if (orderedManagers.length === 0) {
    await updateCommandFailed(commandId, companyId, '순차 실행할 Manager를 결정할 수 없습니다')
    delegationTracker.failed(companyId, commandId, '순차 순서 결정 실패')
    return { commandId, content: '순차 실행할 Manager를 결정할 수 없습니다', managerOrder: [], stepCount: 0 }
  }

  // Calculate total timeout
  const totalTimeout = Math.min(orderedManagers.length * PER_MANAGER_TIMEOUT_MS, MAX_TOTAL_TIMEOUT_MS)

  // Step 2: Sequential execution
  const stepResults: StepResult[] = []
  const managerNames: string[] = []
  const startTime = Date.now()

  for (let i = 0; i < orderedManagers.length; i++) {
    const manager = orderedManagers[i]
    const stepLabel = `[${i + 1}/${orderedManagers.length}]`
    managerNames.push(manager.name)

    // Check total timeout
    if (Date.now() - startTime > totalTimeout) {
      stepResults.push({
        managerId: manager.id,
        managerName: manager.name,
        content: '',
        error: '전체 타임아웃 초과',
      })
      continue
    }

    // Emit delegation event
    delegationTracker.managerStarted(companyId, commandId, manager.id, manager.name)

    // Build input: original command + all previous results as context
    let agentInput = commandText
    if (stepResults.length > 0) {
      const prevResultsText = stepResults
        .filter(r => !r.error)
        .map(r => `[${r.managerName}의 작업 결과]\n${r.content.slice(0, 2000)}`)
        .join('\n\n')

      if (prevResultsText) {
        agentInput = `${commandText}\n\n## 이전 단계 작업 결과 (참고하여 작업하세요)\n${prevResultsText}`
      }
    }

    try {
      const result = await withTimeout(
        managerDelegate({
          manager,
          commandText: agentInput,
          companyId,
          commandId,
          parentTaskId: null,
          toolExecutor,
        }),
        PER_MANAGER_TIMEOUT_MS,
        `sequential-${stepLabel}`,
      )

      const formatted = formatDelegationResult(result, manager.name)
      stepResults.push({
        managerId: manager.id,
        managerName: manager.name,
        content: formatted,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      stepResults.push({
        managerId: manager.id,
        managerName: manager.name,
        content: '',
        error: errorMsg,
      })
    }
  }

  // Step 3: Synthesis (secretary agent)
  const orderNames = managerNames.join(' -> ')
  delegationTracker.synthesizing(companyId, commandId, secretaryAgent.id, secretaryAgent.name)

  const chainSummary = stepResults
    .map((r, i) => {
      if (r.error) {
        return `### ${i + 1}단계: ${r.managerName} (실패)\n오류: ${r.error}`
      }
      return `### ${i + 1}단계: ${r.managerName}\n${r.content}`
    })
    .join('\n\n---\n\n')

  const synthesisInput = `CEO 명령: ${commandText}\n\n아래는 ${stepResults.length}개 부서가 순차적으로 작업한 결과입니다.\n이전 단계의 결과를 다음 단계가 참고하여 작업했습니다.\n\n${chainSummary}\n\n위 순차 협업 결과를 종합하여 CEO에게 간결한 최종 보고서를 작성하세요.`
  const synthesisContext = buildSequentialSynthesisPrompt()

  const synthTask = await createOrchTask({
    companyId,
    commandId,
    agentId: secretaryAgent.id,
    type: 'synthesize',
    input: commandText,
  })

  let finalContent: string
  try {
    const synthResponse = await agentRunner.execute(
      secretaryAgent,
      {
        messages: [{ role: 'user', content: synthesisInput }],
        context: synthesisContext,
        maxToolIterations: 0,
      },
      makeContext(companyId, secretaryAgent),
    )

    const chiefContent = synthResponse.content
    await completeOrchTask(synthTask.id, chiefContent, 'completed', synthTask.startedAt)

    finalContent = `순차 협업 보고 (${orderNames})\n\n${chiefContent}`
  } catch (err) {
    // Synthesis failed — use raw chain summary
    finalContent = `순차 협업 결과 (종합 실패)\n\n작업 순서: ${orderNames}\n\n${chainSummary}`
    const errorMsg = err instanceof Error ? err.message : String(err)
    await completeOrchTask(synthTask.id, errorMsg, 'failed', synthTask.startedAt)
  }

  // Update command with result
  delegationTracker.completed(companyId, commandId)
  await db.update(commands)
    .set({
      status: 'completed',
      result: finalContent,
      metadata: {
        type: 'sequential',
        managerOrder: managerNames,
        stepCount: stepResults.length,
        successCount: stepResults.filter(r => !r.error).length,
      },
      completedAt: new Date(),
    })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  return {
    commandId,
    content: finalContent,
    managerOrder: managerNames,
    stepCount: stepResults.length,
  }
}

// === Helper ===

async function updateCommandFailed(commandId: string, companyId: string, errorMessage: string) {
  await db.update(commands)
    .set({
      status: 'failed',
      result: errorMessage,
      completedAt: new Date(),
    })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
}
