import { agentRunner, type AgentConfig } from './agent-runner'
import {
  makeContext,
  toAgentConfig,
  createOrchTask,
  completeOrchTask,
  findSecretaryAgent,
  getActiveManagers,
} from './chief-of-staff'
import { delegate as managerDelegate, formatDelegationResult } from './manager-delegate'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { commands } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { ToolExecutor } from '@corthex/shared'

// === Types ===

export type AllCommandOptions = {
  commandId: string
  commandText: string
  companyId: string
  userId: string
  toolExecutor?: ToolExecutor
}

export type AllCommandResult = {
  commandId: string
  content: string
  managerCount: number
  successCount: number
  failedCount: number
}

// === Constants ===

const ALL_TIMEOUT_MS = 300_000 // NFR2: 5 minutes

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

// === Synthesis Prompt (v1 pattern) ===

function buildSynthesisPrompt(commandText: string): string {
  return `당신은 비서실장입니다. 모든 부서 팀장의 보고를 검토하고, CEO에게 종합 보고서를 작성하세요.

## 반드시 아래 구조를 따를 것

### 핵심 요약
(전체 상황을 1~2문장으로 요약)

### 부서별 한줄 요약
| 부서 | 핵심 내용 | 상태 |
|------|----------|------|
(각 팀장별 1줄)

### CEO 결재/결정 필요 사항
(각 팀장 보고서에서 CEO가 결정해야 할 것만 추출. 체크리스트 형태)
- [ ] 부서명: 결정 사항 -- 배경 설명
(결재할 것이 없으면 '현재 결재 대기 사항 없음')

### 특이사항 / 리스크
(각 보고서에서 리스크 요소만 추출. 없으면 '특이사항 없음')

## 규칙
- 한국어로 작성
- 간결하게. CEO가 30초 안에 핵심을 파악할 수 있게
- 중요한 숫자/데이터는 반드시 포함
- 팀장 보고서를 그대로 복사하지 말고, 핵심만 추출하여 재구성`
}

// === Main Process Function ===

export async function processAll(options: AllCommandOptions): Promise<AllCommandResult> {
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
    return { commandId, content: '비서실장 에이전트를 찾을 수 없습니다', managerCount: 0, successCount: 0, failedCount: 0 }
  }

  // Get all active managers
  const managerRows = await getActiveManagers(companyId)
  if (managerRows.length === 0) {
    await updateCommandFailed(commandId, companyId, '활성 Manager가 없습니다')
    delegationTracker.failed(companyId, commandId, '활성 Manager 없음')
    return { commandId, content: '활성 Manager가 없습니다', managerCount: 0, successCount: 0, failedCount: 0 }
  }

  const managers = managerRows.map(toAgentConfig)

  // Dispatch to ALL managers in parallel (reusing managerDelegate from 5-3)
  const managerTasks = managers.map(async (manager) => {
    delegationTracker.managerStarted(companyId, commandId, manager.id, manager.name)
    try {
      const result = await managerDelegate({
        manager,
        commandText,
        companyId,
        commandId,
        parentTaskId: null,
        toolExecutor,
      })
      return { manager, result, error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      return { manager, result: null, error: errorMsg }
    }
  })

  // Use Promise.allSettled to never lose completed results, then enforce total timeout
  let settled: Array<{ manager: AgentConfig; result: Awaited<ReturnType<typeof managerDelegate>> | null; error: string | null }>
  try {
    settled = await withTimeout(
      Promise.all(managerTasks),
      ALL_TIMEOUT_MS,
      'all-command-total',
    )
  } catch {
    // Timeout — still collect whatever already resolved
    settled = await Promise.all(
      managerTasks.map(p => p.catch(() => null)),
    ).then(results => results.filter((r): r is NonNullable<typeof r> => r != null))
  }

  // Collect results
  const managerReports: string[] = []
  let successCount = 0
  let failedCount = 0

  for (const entry of settled) {
    if (entry.result && !entry.error) {
      const formatted = formatDelegationResult(entry.result, entry.manager.name)
      managerReports.push(formatted)
      successCount++
    } else {
      managerReports.push(`## ${entry.manager.name} (실패)\n오류: ${entry.error ?? '알 수 없는 오류'}`)
      failedCount++
    }
  }

  // If no results at all (total timeout), report failure
  if (settled.length === 0) {
    const errorMsg = '전체 명령 타임아웃: 모든 Manager 응답 시간 초과'
    await updateCommandFailed(commandId, companyId, errorMsg)
    delegationTracker.failed(companyId, commandId, errorMsg)
    return { commandId, content: errorMsg, managerCount: managers.length, successCount: 0, failedCount: managers.length }
  }

  // Synthesize final report (secretary agent)
  delegationTracker.synthesizing(companyId, commandId, secretaryAgent.id, secretaryAgent.name)

  const synthesisInput = `CEO 원본 명령: ${commandText}\n\n## 부서 팀장 보고서\n\n${managerReports.join('\n\n---\n\n')}`
  const synthesisContext = buildSynthesisPrompt(commandText)

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
    finalContent = synthResponse.content
    await completeOrchTask(synthTask.id, finalContent, 'completed', synthTask.startedAt)
  } catch (err) {
    // Synthesis failed — use raw reports
    finalContent = `## 전체 명령 결과 (종합 실패)\n\n${managerReports.join('\n\n---\n\n')}`
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
        type: 'all',
        managerCount: managers.length,
        successCount,
        failedCount,
      },
      completedAt: new Date(),
    })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  return {
    commandId,
    content: finalContent,
    managerCount: managers.length,
    successCount,
    failedCount,
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
