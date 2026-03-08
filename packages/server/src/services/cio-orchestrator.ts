// CIO 3-Phase Orchestration Service
// Implements v1 CIO Manager pattern:
//   Phase 1: 시황/종목/기술 전문가 병렬 분석
//   Phase 2: 리스크 전문가 순차 분석 (Phase 1 결과 기반)
//   Phase 3: CIO 종합 보고서 + Trade Proposals

import { agentRunner, type AgentConfig } from './agent-runner'
import { makeContext, createOrchTask, completeOrchTask } from './chief-of-staff'
import { getSpecialists, dispatchSpecialists, type SpecialistResult } from './manager-delegate'
import { delegationTracker } from './delegation-tracker'
import { db } from '../db'
import { agents } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { CIOOrchestrationResult, CIOPhase, TradeProposal, ToolExecutor } from '@corthex/shared'

// === Types ===

export type CIOOrchestrateOptions = {
  manager: AgentConfig
  commandText: string
  companyId: string
  commandId: string
  parentTaskId?: string | null
  toolExecutor?: ToolExecutor
}

// === Constants ===

const PHASE_TIMEOUT_MS = 120_000 // 2 min per phase

// Risk specialist keywords for identification
const RISK_KEYWORDS = ['리스크', 'risk', '위험', '위험관리', 'risk_management']

// === Prompt Builders ===

function buildRiskAnalysisPrompt(parallelResults: SpecialistResult[], commandText: string): string {
  const resultTexts = parallelResults
    .filter(r => r.status === 'fulfilled')
    .map(r => `### ${r.agentName}\n${r.content}`)
    .join('\n\n')

  return `당신은 리스크관리 전문가입니다. 아래 분석 결과를 기반으로 투자 리스크를 평가하세요.

## CEO 원본 명령
${commandText}

## 전문가 분석 결과
${resultTexts || '(분석 결과 없음)'}

## 지시사항
1. 각 전문가의 분석에서 잠재적 리스크를 식별하세요
2. 시장 리스크, 유동성 리스크, 신용 리스크를 평가하세요
3. 각 종목별 리스크 등급(높음/중간/낮음)을 부여하세요
4. 종합 리스크 평가와 제한 사항을 제시하세요`
}

function buildCIOSynthesisPrompt(
  managerName: string,
  commandText: string,
  parallelResults: SpecialistResult[],
  riskAnalysis: string,
): string {
  const specParts = parallelResults.map(spec => {
    if (spec.status === 'fulfilled') {
      return `### ${spec.agentName}\n${spec.content}`
    }
    return `### ${spec.agentName} (분석 실패)\n오류: ${spec.error ?? '알 수 없는 오류'}`
  })

  return `당신은 ${managerName}(금융분석팀장, CIO)입니다.
아래 전문가 분석 + 리스크 평가를 종합하여 최종 투자 보고서를 작성하세요.

## 보고서 형식
반드시 아래 섹션으로 구성하세요:

### 결론
핵심 투자 결론을 명확하게 제시하세요.

### 분석
각 전문가의 관점을 통합하고 공통점과 차이점을 설명하세요.

### 리스크
리스크관리 전문가의 평가를 반영하여 위험 요소를 명시하세요.

### 추천
다음 단계 행동을 구체적으로 제안하세요.

### 매매 제안
종합 보고서 끝에 반드시 아래 형식의 매매 제안을 포함하세요:

[TRADE_PROPOSALS]
[
  {
    "ticker": "005930",
    "tickerName": "삼성전자",
    "side": "buy",
    "quantity": 10,
    "price": 70000,
    "reason": "PER 저평가 + 기술적 반등 신호",
    "confidence": 0.82,
    "market": "KR"
  }
]
[/TRADE_PROPOSALS]

confidence 기준:
- 0.8+: 강력 추천
- 0.6~0.8: 일반 추천
- 0.6 미만: 참고용 (실행 불가)
매매 제안이 없으면 빈 배열 []을 넣으세요.

---

## CEO 원본 명령
${commandText}

## 전문가 분석 결과
${specParts.join('\n\n') || '(전문가 없음)'}

## 리스크관리 전문가 평가
${riskAnalysis || '(리스크 평가 없음)'}`
}

// === Helper Functions ===

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms)
    promise.then(
      val => { clearTimeout(timer); resolve(val) },
      err => { clearTimeout(timer); reject(err) },
    )
  })
}

/**
 * Identify risk specialist among a list of specialists.
 * Check agent name/role for risk-related keywords.
 */
function findRiskSpecialist(specialists: AgentConfig[]): AgentConfig | null {
  for (const spec of specialists) {
    const nameLower = (spec.name + ' ' + (spec.nameEn ?? '')).toLowerCase()
    if (RISK_KEYWORDS.some(kw => nameLower.includes(kw))) {
      return spec
    }
  }
  return null
}

/**
 * Parse trade proposals from CIO synthesis result.
 */
export function parseTradeProposals(content: string): TradeProposal[] {
  const match = content.match(/\[TRADE_PROPOSALS\]\s*([\s\S]*?)\s*\[\/TRADE_PROPOSALS\]/)
  if (!match) return []

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((p: Record<string, unknown>) =>
        p && typeof p.ticker === 'string' && typeof p.side === 'string',
      )
      .map((p: Record<string, unknown>) => ({
        ticker: String(p.ticker),
        tickerName: String(p.tickerName ?? p.ticker),
        side: (p.side === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell',
        quantity: Math.max(0, Number(p.quantity) || 0),
        price: Math.max(0, Number(p.price) || 0),
        reason: String(p.reason ?? ''),
        confidence: Math.max(0, Math.min(1, Number(p.confidence) || 0)),
        market: (p.market === 'US' ? 'US' : 'KR') as 'KR' | 'US',
      }))
  } catch {
    return []
  }
}

// === Core Orchestration ===

/**
 * CIO 3-Phase Investment Analysis Orchestration.
 * Follows v1 CIOManagerAgent pattern:
 *   Phase 1: Parallel specialist analysis (market, stock, technical)
 *   Phase 2: Sequential risk analysis with Phase 1 results
 *   Phase 3: CIO synthesis with trade proposals
 */
export async function orchestrateCIO(options: CIOOrchestrateOptions): Promise<CIOOrchestrationResult> {
  const { manager, commandText, companyId, commandId, parentTaskId, toolExecutor } = options

  const totalStart = Date.now()
  const phaseResults: CIOOrchestrationResult['phases'] = []

  // Get all specialists under CIO's department
  const allSpecialists = await getSpecialists(companyId, manager)

  // Separate risk specialist from parallel analysts
  const riskSpecialist = findRiskSpecialist(allSpecialists)
  const parallelSpecialists = riskSpecialist
    ? allSpecialists.filter(s => s.id !== riskSpecialist.id)
    : allSpecialists

  // === Phase 1: Parallel specialist analysis ===
  const phase1Start = Date.now()
  delegationTracker.cioPhaseStarted(companyId, commandId, 1, manager.id, manager.name)

  let parallelResults: SpecialistResult[] = []
  try {
    parallelResults = await withTimeout(
      dispatchSpecialists(
        parallelSpecialists,
        commandText,
        '', // No prior analysis
        companyId,
        commandId,
        parentTaskId ?? null,
        toolExecutor,
      ),
      PHASE_TIMEOUT_MS,
      'cio-phase1',
    )
  } catch (err) {
    // Phase 1 failure — continue with empty results
    console.error('[cio-orchestrator] Phase 1 error:', err instanceof Error ? err.message : err)
  }

  const phase1Duration = Date.now() - phase1Start
  phaseResults.push({ phase: 1 as CIOPhase, durationMs: phase1Duration, agentCount: parallelSpecialists.length })
  delegationTracker.cioPhaseCompleted(companyId, commandId, 1, manager.id, manager.name, phase1Duration)

  // === Phase 2: Sequential risk analysis ===
  const phase2Start = Date.now()
  delegationTracker.cioPhaseStarted(companyId, commandId, 2, manager.id, manager.name)

  let riskAnalysis = ''
  if (riskSpecialist) {
    const riskTask = await createOrchTask({
      companyId,
      commandId,
      agentId: riskSpecialist.id,
      parentTaskId: parentTaskId ?? null,
      type: 'execute',
      input: 'CIO Phase 2: 리스크 분석',
    })

    try {
      const riskPrompt = buildRiskAnalysisPrompt(parallelResults, commandText)
      const riskResponse = await withTimeout(
        agentRunner.execute(
          riskSpecialist,
          {
            messages: [{ role: 'user', content: riskPrompt }],
            maxToolIterations: 3,
          },
          makeContext(companyId, riskSpecialist),
          toolExecutor,
        ),
        PHASE_TIMEOUT_MS,
        'cio-phase2-risk',
      )
      riskAnalysis = riskResponse.content
      await completeOrchTask(riskTask.id, riskAnalysis, 'completed', riskTask.startedAt)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      riskAnalysis = `리스크 분석 실패: ${errorMsg}`
      await completeOrchTask(riskTask.id, errorMsg, 'failed', riskTask.startedAt)
    }
  } else {
    // No dedicated risk specialist — Phase 2 is minimal
    riskAnalysis = '(리스크관리 전문가 미배속 — CIO가 직접 리스크 평가)'
  }

  const phase2Duration = Date.now() - phase2Start
  phaseResults.push({ phase: 2 as CIOPhase, durationMs: phase2Duration, agentCount: riskSpecialist ? 1 : 0 })
  delegationTracker.cioPhaseCompleted(companyId, commandId, 2, manager.id, manager.name, phase2Duration)

  // === Phase 3: CIO synthesis + trade proposals ===
  const phase3Start = Date.now()
  delegationTracker.cioPhaseStarted(companyId, commandId, 3, manager.id, manager.name)

  const synthTask = await createOrchTask({
    companyId,
    commandId,
    agentId: manager.id,
    parentTaskId: parentTaskId ?? null,
    type: 'synthesize',
    input: 'CIO Phase 3: 종합 + 매매 제안',
  })

  let analysisReport = ''
  let tradeProposals: TradeProposal[] = []

  try {
    const synthesisPrompt = buildCIOSynthesisPrompt(
      manager.name,
      commandText,
      parallelResults,
      riskAnalysis,
    )

    const synthResponse = await withTimeout(
      agentRunner.execute(
        manager,
        {
          messages: [{ role: 'user', content: synthesisPrompt }],
          maxToolIterations: 0, // Synthesis only
        },
        makeContext(companyId, manager),
      ),
      PHASE_TIMEOUT_MS,
      'cio-phase3-synthesis',
    )

    analysisReport = synthResponse.content
    tradeProposals = parseTradeProposals(analysisReport)
    await completeOrchTask(synthTask.id, analysisReport, 'completed', synthTask.startedAt)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    analysisReport = `CIO 종합 실패: ${errorMsg}`
    await completeOrchTask(synthTask.id, errorMsg, 'failed', synthTask.startedAt)
  }

  const phase3Duration = Date.now() - phase3Start
  phaseResults.push({ phase: 3 as CIOPhase, durationMs: phase3Duration, agentCount: 1 })
  delegationTracker.cioPhaseCompleted(companyId, commandId, 3, manager.id, manager.name, phase3Duration)

  return {
    analysisReport,
    tradeProposals,
    phases: phaseResults,
    totalDurationMs: Date.now() - totalStart,
  }
}
