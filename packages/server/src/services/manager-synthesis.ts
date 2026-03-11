/**
 * @deprecated This file is deprecated. Manager synthesis is now handled by Soul templates
 * (lib/soul-templates.ts) which include the 4-section report format directly in the Soul.
 * Utility functions have been moved to lib/orchestration-helpers.ts.
 * See: Story 5.5 — 기존 오케스트레이터 삭제
 */
import { agentRunner, type AgentConfig } from './agent-runner'
import { makeContext, createOrchTask, completeOrchTask } from '../lib/orchestration-helpers'
import { delegationTracker } from './delegation-tracker'
import { formatDelegationResult, type ManagerDelegationResult, type SpecialistResult } from './manager-delegate'
import type { ToolExecutor } from '@corthex/shared'

// === Types ===

export type SynthesizeOptions = {
  manager: AgentConfig
  delegationResult: ManagerDelegationResult
  commandText: string
  companyId: string
  commandId: string
  parentTaskId?: string | null
  toolExecutor?: ToolExecutor
}

// === Prompt Builder ===

/**
 * Build synthesis prompt following v1 pattern:
 * Manager combines own analysis + specialist results into a structured report.
 * v1 ref: /home/ubuntu/CORTHEX_HQ/web/agent_router.py:1630-1637
 */
export function buildSynthesisPrompt(
  managerName: string,
  commandText: string,
  managerAnalysis: string,
  specialistResults: SpecialistResult[],
): string {
  const specParts = specialistResults.map((spec) => {
    if (spec.status === 'fulfilled') {
      return `### ${spec.agentName}\n${spec.content}`
    }
    return `### ${spec.agentName} (분석 실패)\n오류: ${spec.error ?? '알 수 없는 오류'}`
  })

  const specSection = specParts.length > 0
    ? specParts.join('\n\n')
    : '(전문가 없음 — 팀장 단독 분석)'

  return `당신은 ${managerName}입니다.
아래 분석 결과(당신의 독자 분석 + 전문가)를 종합하여 최종 보고서를 작성하세요.
도구를 다시 사용할 필요 없습니다 — 결과를 취합만 하세요.

## 보고서 형식
반드시 아래 4개 섹션으로 구성하세요:

### 결론
핵심 결론을 명확하고 간결하게 제시하세요.

### 분석
상세 분석 내용을 정리하세요. 각 전문가의 관점을 통합하고 공통점과 차이점을 설명하세요.

### 리스크
잠재적 위험 요소, 한계점, 불확실성을 명시하세요.

### 추천
다음 단계 행동을 구체적으로 제안하세요.

---

## CEO 원본 명령
${commandText}

## 팀장 독자 분석
${managerAnalysis || '(분석 실패)'}

## 전문가 분석 결과
${specSection}`
}

// === Core Function ===

/**
 * Synthesize Manager's own analysis + specialist results into a structured report.
 * Uses AgentRunner LLM call (no tools) to produce a cohesive summary.
 * Falls back to formatDelegationResult() if synthesis LLM call fails.
 */
export async function synthesize(options: SynthesizeOptions): Promise<string> {
  const { manager, delegationResult, commandText, companyId, commandId, parentTaskId, toolExecutor } = options

  // Emit synthesis started event
  delegationTracker.synthesizing(companyId, commandId, manager.id, manager.name)

  // Create orchestration task record
  const orchTask = await createOrchTask({
    companyId,
    commandId,
    agentId: manager.id,
    parentTaskId: parentTaskId ?? null,
    type: 'synthesize',
    input: `synthesis of delegation result for command: ${commandText.slice(0, 200)}`,
  })

  const startTime = Date.now()

  try {
    const synthesisPrompt = buildSynthesisPrompt(
      manager.name,
      commandText,
      delegationResult.managerAnalysis,
      delegationResult.specialistResults,
    )

    const response = await agentRunner.execute(
      manager,
      {
        messages: [{ role: 'user', content: synthesisPrompt }],
        maxToolIterations: 0, // No tools needed — synthesis only
      },
      makeContext(companyId, manager),
      // No toolExecutor — synthesis is result aggregation only, no tool calls
    )

    const durationMs = Date.now() - startTime
    await completeOrchTask(orchTask.id, response.content, 'completed', orchTask.startedAt)

    delegationTracker.synthesisCompleted(companyId, commandId, manager.id, manager.name, durationMs)

    return response.content
  } catch (err) {
    const durationMs = Date.now() - startTime
    const errorMsg = err instanceof Error ? err.message : String(err)
    await completeOrchTask(orchTask.id, errorMsg, 'failed', orchTask.startedAt)

    delegationTracker.synthesisFailed(companyId, commandId, manager.id, manager.name, errorMsg)

    // Fallback: use simple text concatenation (formatDelegationResult)
    return formatDelegationResult(delegationResult, manager.name)
  }
}
