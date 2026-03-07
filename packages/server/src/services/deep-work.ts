import { agentRunner, type AgentConfig } from './agent-runner'
import { eventBus } from '../lib/event-bus'
import { db } from '../db'
import { commands } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { LLMRouterContext } from './llm-router'
import type { ToolExecutor } from '@corthex/shared'

// === Types ===

export type DeepWorkPhase = 'plan' | 'collect' | 'analyze' | 'draft' | 'finalize'

export type DeepWorkPhaseResult = {
  name: DeepWorkPhase
  status: 'completed' | 'timeout' | 'error'
  output: string
  durationMs: number
  toolCalls: number
}

export type DeepWorkResult = {
  phases: DeepWorkPhaseResult[]
  finalReport: string
  totalDurationMs: number
}

export type DeepWorkOptions = {
  commandId: string
  companyId: string
  phaseTimeoutMs?: number              // default 60_000
  totalTimeoutMs?: number              // default 300_000
  maxToolIterationsPerPhase?: number   // default 10
}

// === Constants ===

const DEFAULT_PHASE_TIMEOUT_MS = 60_000
const DEFAULT_TOTAL_TIMEOUT_MS = 300_000
const DEFAULT_MAX_TOOL_ITERATIONS_PER_PHASE = 10

const PHASES: DeepWorkPhase[] = ['plan', 'collect', 'analyze', 'draft', 'finalize']

const PHASE_PROGRESS: Record<DeepWorkPhase, number> = {
  plan: 0,
  collect: 20,
  analyze: 40,
  draft: 60,
  finalize: 80,
}

// === Phase-specific system prompt suffixes ===

const PHASE_PROMPTS: Record<DeepWorkPhase, string> = {
  plan: [
    '## DeepWork Phase: PLAN',
    '주어진 업무를 분석하여 데이터 수집, 분석, 초안 작성, 최종 완성까지의 실행 계획을 세우세요.',
    '각 단계에서 어떤 데이터를 수집하고, 어떤 분석을 수행하고, 어떤 결과물을 만들지 구체적으로 계획하세요.',
    '도구를 사용해야 한다면 어떤 도구를 사용할지도 계획에 포함하세요.',
  ].join('\n'),

  collect: [
    '## DeepWork Phase: COLLECT',
    '계획에 따라 필요한 데이터를 수집하세요.',
    '사용 가능한 도구를 적극 활용하여 정보를 수집하세요.',
    '수집한 데이터를 정리하여 다음 분석 단계에서 활용할 수 있도록 구조화하세요.',
  ].join('\n'),

  analyze: [
    '## DeepWork Phase: ANALYZE',
    '수집된 데이터에서 핵심 인사이트와 패턴을 도출하세요.',
    '데이터 간의 관계, 트렌드, 이상 징후를 분석하세요.',
    '분석 결과를 근거와 함께 명확하게 정리하세요.',
  ].join('\n'),

  draft: [
    '## DeepWork Phase: DRAFT',
    '분석 결과를 바탕으로 보고서 초안을 작성하세요.',
    '핵심 발견사항, 분석 내용, 권장 사항을 포함하세요.',
    '마크다운 형식으로 체계적으로 구성하세요.',
  ].join('\n'),

  finalize: [
    '## DeepWork Phase: FINALIZE',
    '초안을 검토하고 최종 보고서를 완성하세요.',
    '논리적 일관성, 근거의 충분성, 결론의 타당성을 확인하세요.',
    '최종 보고서를 마크다운 형식으로 깔끔하게 정리하세요.',
  ].join('\n'),
}

// === Helper: timeout wrapper ===

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`TIMEOUT: ${label} exceeded ${ms}ms`)), ms)
    promise
      .then((v) => { clearTimeout(timer); resolve(v) })
      .catch((e) => { clearTimeout(timer); reject(e) })
  })
}

// === DeepWorkService ===

export class DeepWorkService {
  async execute(
    agent: AgentConfig,
    commandText: string,
    options: DeepWorkOptions,
    context: LLMRouterContext,
    toolExecutor?: ToolExecutor,
  ): Promise<DeepWorkResult> {
    const phaseTimeoutMs = options.phaseTimeoutMs ?? DEFAULT_PHASE_TIMEOUT_MS
    const totalTimeoutMs = options.totalTimeoutMs ?? DEFAULT_TOTAL_TIMEOUT_MS
    const maxToolIter = options.maxToolIterationsPerPhase ?? DEFAULT_MAX_TOOL_ITERATIONS_PER_PHASE

    const totalStart = Date.now()
    const phases: DeepWorkPhaseResult[] = []
    let accumulatedContext = ''

    for (const phase of PHASES) {
      const elapsed = Date.now() - totalStart
      const remaining = totalTimeoutMs - elapsed

      // Total timeout check
      if (remaining <= 0) {
        // Mark remaining phases as timeout
        for (const p of PHASES.slice(PHASES.indexOf(phase))) {
          phases.push({ name: p, status: 'timeout', output: '', durationMs: 0, toolCalls: 0 })
        }
        break
      }

      // Emit phase start event
      eventBus.emit('deepwork-phase', {
        type: 'deepwork-phase',
        phase,
        progress: PHASE_PROGRESS[phase],
        commandId: options.commandId,
        companyId: options.companyId,
      })

      const phaseStart = Date.now()
      const effectiveTimeout = Math.min(phaseTimeoutMs, remaining)

      try {
        const phaseResult = await withTimeout(
          this.executePhase(agent, commandText, phase, accumulatedContext, maxToolIter, context, toolExecutor),
          effectiveTimeout,
          `Phase ${phase}`,
        )

        const durationMs = Date.now() - phaseStart
        phases.push({
          name: phase,
          status: 'completed',
          output: phaseResult.content,
          durationMs,
          toolCalls: phaseResult.toolCalls.length,
        })

        // Accumulate context for next phase
        accumulatedContext += `\n\n### ${phase.toUpperCase()} 결과\n${phaseResult.content}`
      } catch (err) {
        const durationMs = Date.now() - phaseStart
        const isTimeout = err instanceof Error && err.message.startsWith('TIMEOUT:')

        phases.push({
          name: phase,
          status: isTimeout ? 'timeout' : 'error',
          output: err instanceof Error ? err.message : String(err),
          durationMs,
          toolCalls: 0,
        })

        // On timeout or error: mark remaining phases as timeout and break
        if (isTimeout) {
          for (const p of PHASES.slice(PHASES.indexOf(phase) + 1)) {
            phases.push({ name: p, status: 'timeout', output: '', durationMs: 0, toolCalls: 0 })
          }
          break
        }
        // On non-timeout error: continue to next phase (graceful degradation)
      }
    }

    const totalDurationMs = Date.now() - totalStart

    // Emit completion event
    eventBus.emit('deepwork-phase', {
      type: 'deepwork-phase',
      phase: 'done',
      progress: 100,
      commandId: options.commandId,
      companyId: options.companyId,
    })

    // Build final report from completed phases
    const finalReport = this.buildFinalReport(phases)

    const result: DeepWorkResult = { phases, finalReport, totalDurationMs }

    // Save to DB
    await this.saveResult(options.commandId, options.companyId, result)

    return result
  }

  private async executePhase(
    agent: AgentConfig,
    commandText: string,
    phase: DeepWorkPhase,
    accumulatedContext: string,
    maxToolIterations: number,
    context: LLMRouterContext,
    toolExecutor?: ToolExecutor,
  ) {
    const phasePrompt = PHASE_PROMPTS[phase]

    const userContent = accumulatedContext
      ? `## 원래 업무\n${commandText}\n\n## 이전 단계 결과\n${accumulatedContext}\n\n${phasePrompt}`
      : `## 업무\n${commandText}\n\n${phasePrompt}`

    return agentRunner.execute(
      agent,
      {
        messages: [{ role: 'user', content: userContent }],
        context: phasePrompt,
        maxToolIterations,
      },
      context,
      toolExecutor,
    )
  }

  private buildFinalReport(phases: DeepWorkPhaseResult[]): string {
    // Use finalize phase output if available
    const finalizePhase = phases.find((p) => p.name === 'finalize' && p.status === 'completed')
    if (finalizePhase) return finalizePhase.output

    // Fallback: use draft phase output
    const draftPhase = phases.find((p) => p.name === 'draft' && p.status === 'completed')
    if (draftPhase) return draftPhase.output

    // Fallback: concatenate all completed phase outputs
    const completedOutputs = phases
      .filter((p) => p.status === 'completed' && p.output)
      .map((p) => `### ${p.name.toUpperCase()}\n${p.output}`)

    if (completedOutputs.length > 0) {
      return `# DeepWork Report (Partial)\n\n${completedOutputs.join('\n\n')}`
    }

    return '# DeepWork Report\n\n분석을 완료하지 못했습니다. 타임아웃이 발생했습니다.'
  }

  private async saveResult(commandId: string, companyId: string, result: DeepWorkResult): Promise<void> {
    await db
      .update(commands)
      .set({
        status: 'completed',
        result: result.finalReport,
        metadata: {
          deepwork: {
            phases: result.phases,
            totalDurationMs: result.totalDurationMs,
          },
        },
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

// Singleton
export const deepWorkService = new DeepWorkService()
