import { agentRunner, type AgentConfig } from './agent-runner'
import { delegationTracker } from './delegation-tracker'
import { delegate as managerDelegate } from './manager-delegate'
import { synthesize as managerSynthesize } from './manager-synthesis'
import { inspect, type InspectionResult, type RuleResult, type RubricScore } from './inspection-engine'
import { db } from '../db'
import { commands, agents, departments, orchestrationTasks, qualityReviews } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { LLMRouterContext } from './llm-router'
import type { ToolExecutor } from '@corthex/shared'

export function makeContext(companyId: string, agent: AgentConfig): LLMRouterContext {
  return { companyId, agentId: agent.id, agentName: agent.name, source: 'delegation' }
}

export function toAgentConfig(row: {
  id: string
  companyId: string
  name: string
  nameEn: string | null
  tier: string
  modelName: string | null
  soul: string | null
  [key: string]: unknown
  allowedTools: unknown
  isActive: boolean
}): AgentConfig {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    nameEn: row.nameEn,
    tier: row.tier as 'manager' | 'specialist' | 'worker',
    modelName: row.modelName ?? 'claude-sonnet-4-6',
    soul: row.soul,
    allowedTools: (row.allowedTools as string[]) ?? [],
    isActive: row.isActive,
  }
}

// === Types ===

export type ClassificationResult = {
  departmentId: string
  managerId: string
  confidence: number
  reasoning: string
}

export type QualityScores = {
  conclusionClarity: number
  evidenceSufficiency: number
  riskMention: number
  formatAdequacy: number
  logicalConsistency: number
}

export type QualityGateResult = {
  scores: QualityScores
  totalScore: number
  passed: boolean
  feedback: string | null
  inspection?: InspectionResult | null
}

export type ChiefOfStaffResult = {
  commandId: string
  content: string
  classification: ClassificationResult | null
  qualityGate: QualityGateResult | null
  attemptNumber: number
  warningFlag: boolean
  phases: string[]
}

export type ProcessOptions = {
  commandId: string
  commandText: string
  companyId: string
  userId: string
  targetAgentId?: string | null
  toolExecutor?: ToolExecutor
}

// === Constants ===

const QUALITY_PASS_THRESHOLD = 15
const MAX_REWORK_ATTEMPTS = 2

// === LLM Prompt Builders ===

function buildClassifyPrompt(
  deptList: Array<{ id: string; name: string; description: string | null }>,
  managerList: Array<{ id: string; name: string; role: string | null; departmentId: string | null }>,
): string {
  const deptLines = deptList.map(d => `- ${d.name} (id: ${d.id})${d.description ? `: ${d.description}` : ''}`).join('\n')
  const mgrLines = managerList.map(m => {
    const dept = deptList.find(d => d.id === m.departmentId)
    return `- ${m.name} (id: ${m.id}, 부서: ${dept?.name ?? '미배속'})${m.role ? ` - ${m.role}` : ''}`
  }).join('\n')

  return `당신은 CORTHEX의 비서실장입니다. CEO의 명령을 분석하여 가장 적합한 부서와 Manager를 결정하세요.

## 현재 조직 구조

### 부서 목록
${deptLines || '(부서 없음)'}

### Manager 목록
${mgrLines || '(Manager 없음)'}

## 지시사항
1. CEO 명령의 의도와 주제를 파악하세요
2. 가장 적합한 부서와 해당 부서의 Manager를 선택하세요
3. 확신도(confidence)를 0~1 사이 소수로 표시하세요 (0.5 미만이면 비서실장이 직접 처리)
4. 판단 근거를 한국어로 간결하게 설명하세요

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"departmentId": "uuid", "managerId": "uuid", "confidence": 0.85, "reasoning": "이유"}`
}

const QUALITY_GATE_PROMPT = `당신은 품질 검수관입니다. 에이전트의 결과물을 5가지 항목으로 평가하세요.

## 평가 항목 (각 1~5점)
1. **결론 명확성 (conclusionClarity)**: 핵심 결론이 명확하게 제시되어 있는가?
2. **근거 충분성 (evidenceSufficiency)**: 결론을 뒷받침하는 근거/데이터가 충분한가?
3. **리스크 언급 (riskMention)**: 잠재적 위험 요소나 한계점이 언급되어 있는가?
4. **형식 적절성 (formatAdequacy)**: 보고서 형식이 적절하고 읽기 쉬운가?
5. **논리 일관성 (logicalConsistency)**: 논리 흐름이 일관적이고 모순이 없는가?

## 판정 기준
- 합계 15점 이상: PASS
- 합계 15점 미만: FAIL (재작업 필요 시 구체적 피드백 제공)

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"scores": {"conclusionClarity": 4, "evidenceSufficiency": 3, "riskMention": 3, "formatAdequacy": 4, "logicalConsistency": 4}, "totalScore": 18, "passed": true, "feedback": null}`

// === Helper: Parse JSON from LLM response ===

export function parseLLMJson<T>(raw: string): T | null {
  // Strip markdown code blocks if present
  let cleaned = raw.trim()
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim()
  }
  // Try parsing raw if not a code block
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try extracting first { ... } or [ ... ] block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

// === Orchestration Task Recording ===

export async function createOrchTask(params: {
  companyId: string
  commandId: string
  agentId: string
  parentTaskId?: string | null
  type: string
  input: string
}) {
  const [task] = await db
    .insert(orchestrationTasks)
    .values({
      companyId: params.companyId,
      commandId: params.commandId,
      agentId: params.agentId,
      parentTaskId: params.parentTaskId ?? null,
      type: params.type,
      input: params.input,
      status: 'running',
      startedAt: new Date(),
    })
    .returning()
  return task
}

export async function completeOrchTask(taskId: string, output: string, status: 'completed' | 'failed', startedAt: Date | null) {
  await db
    .update(orchestrationTasks)
    .set({
      output,
      status,
      completedAt: new Date(),
      durationMs: startedAt ? Date.now() - startedAt.getTime() : 0,
    })
    .where(eq(orchestrationTasks.id, taskId))
}

// === Find Secretary Agent ===

export async function findSecretaryAgent(companyId: string): Promise<AgentConfig | null> {
  const [secretary] = await db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.companyId, companyId),
        eq(agents.isSystem, true),
        eq(agents.isSecretary, true),
        eq(agents.isActive, true),
      ),
    )
    .limit(1)

  if (!secretary) return null

  return toAgentConfig(secretary)
}

// === Get Active Managers ===

export async function getActiveManagers(companyId: string) {
  return db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      departmentId: agents.departmentId,
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
        eq(agents.tier, 'manager'),
        eq(agents.isActive, true),
        eq(agents.isSecretary, false),
      ),
    )
}

// === Get Active Departments ===

async function getActiveDepartments(companyId: string) {
  return db
    .select({
      id: departments.id,
      name: departments.name,
      description: departments.description,
    })
    .from(departments)
    .where(
      and(
        eq(departments.companyId, companyId),
        eq(departments.isActive, true),
      ),
    )
}

// === Core Functions ===

export async function classify(
  commandText: string,
  companyId: string,
  secretaryAgent: AgentConfig,
  toolExecutor?: ToolExecutor,
): Promise<ClassificationResult | null> {
  const deptList = await getActiveDepartments(companyId)
  const managerList = await getActiveManagers(companyId)

  if (managerList.length === 0) {
    return null // No managers to delegate to
  }

  const classifyPrompt = buildClassifyPrompt(deptList, managerList)

  const response = await agentRunner.execute(
    secretaryAgent,
    {
      messages: [{ role: 'user', content: commandText }],
      context: classifyPrompt,
      maxToolIterations: 0, // No tools needed for classification
    },
    makeContext(companyId, secretaryAgent),
    toolExecutor,
  )

  const parsed = parseLLMJson<ClassificationResult>(response.content)
  if (!parsed) return null

  // Validate referenced IDs exist
  const validManager = managerList.find(m => m.id === parsed.managerId)
  if (!validManager) {
    // Fallback: pick first manager
    const fallback = managerList[0]
    return {
      departmentId: fallback.departmentId ?? deptList[0]?.id ?? '',
      managerId: fallback.id,
      confidence: 0.3,
      reasoning: `분류 결과의 Manager ID가 유효하지 않아 ${fallback.name}에게 기본 위임합니다.`,
    }
  }

  return {
    departmentId: parsed.departmentId || validManager.departmentId || '',
    managerId: parsed.managerId,
    confidence: Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
    reasoning: parsed.reasoning || '분류 근거 없음',
  }
}

export async function delegate(
  managerAgent: AgentConfig,
  commandText: string,
  companyId: string,
  context?: string,
  toolExecutor?: ToolExecutor,
): Promise<string> {
  const taskMessages = [
    { role: 'user' as const, content: commandText },
  ]

  const response = await agentRunner.execute(
    managerAgent,
    {
      messages: taskMessages,
      context: context ?? undefined,
      maxToolIterations: 5,
    },
    makeContext(companyId, managerAgent),
    toolExecutor,
  )

  return response.content
}

export async function qualityGate(
  result: string,
  commandText: string,
  companyId: string,
  commandId: string,
  secretaryAgent: AgentConfig,
  attemptNumber: number,
  departmentNameEn?: string,
  toolData?: Record<string, unknown>,
): Promise<QualityGateResult> {
  // === Phase A: Legacy LLM 5-item inspection ===
  const reviewInput = `## 원본 명령
${commandText}

## 에이전트 결과물
${result}`

  const response = await agentRunner.execute(
    secretaryAgent,
    {
      messages: [{ role: 'user', content: reviewInput }],
      context: QUALITY_GATE_PROMPT,
      maxToolIterations: 0,
    },
    makeContext(companyId, secretaryAgent),
  )

  const parsed = parseLLMJson<{
    scores: QualityScores
    totalScore: number
    passed: boolean
    feedback: string | null
  }>(response.content)

  const defaultScores: QualityScores = {
    conclusionClarity: 3,
    evidenceSufficiency: 3,
    riskMention: 3,
    formatAdequacy: 3,
    logicalConsistency: 3,
  }

  const scores = parsed?.scores ?? defaultScores
  const totalScore = scores.conclusionClarity + scores.evidenceSufficiency +
    scores.riskMention + scores.formatAdequacy + scores.logicalConsistency
  const legacyPassed = totalScore >= QUALITY_PASS_THRESHOLD
  const legacyFeedback = legacyPassed ? null : (parsed?.feedback ?? '품질 기준 미달. 결론을 명확히 하고, 근거를 보강하세요.')

  // === Phase B: YAML rule-based + LLM hybrid inspection (P1) ===
  let inspectionResult: InspectionResult | null = null
  try {
    inspectionResult = await inspect({
      content: result,
      commandText,
      companyId,
      commandId,
      agentId: secretaryAgent.id,
      departmentNameEn,
      toolData,
      attemptNumber,
    })
  } catch (err) {
    // InspectionEngine failure — don't block the quality gate
    console.error('[quality-gate] InspectionEngine error, proceeding with legacy only:', err instanceof Error ? err.message : err)
  }

  // === Phase C: Hybrid judgment ===
  // Both legacy AND inspection must pass for overall pass
  const inspectionPassed = !inspectionResult || inspectionResult.conclusion === 'pass'
  const passed = legacyPassed && inspectionPassed

  // Merge feedback
  let feedback: string | null = null
  const feedbacks: string[] = []
  if (legacyFeedback) feedbacks.push(legacyFeedback)
  if (inspectionResult?.feedback) feedbacks.push(inspectionResult.feedback)
  if (feedbacks.length > 0) feedback = feedbacks.join('\n\n---\n\n')

  // Save to quality_reviews with merged scores
  const mergedScores: Record<string, unknown> = {
    legacyScores: scores,
    legacyTotalScore: totalScore,
    legacyPassed,
  }
  if (inspectionResult) {
    mergedScores.ruleResults = inspectionResult.ruleResults
    mergedScores.inspectionConclusion = inspectionResult.conclusion
    mergedScores.inspectionScore = inspectionResult.totalScore
    mergedScores.inspectionMaxScore = inspectionResult.maxScore
    if (inspectionResult.rubricScores) {
      mergedScores.rubricScores = inspectionResult.rubricScores
    }
    if (inspectionResult.hallucinationReport) {
      mergedScores.hallucinationReport = inspectionResult.hallucinationReport
    }
  }

  const conclusion = passed ? 'pass' : (inspectionResult?.conclusion === 'warning' && legacyPassed ? 'warning' : 'fail')

  await db.insert(qualityReviews).values({
    companyId,
    commandId,
    reviewerAgentId: secretaryAgent.id,
    conclusion,
    scores: mergedScores,
    feedback,
    attemptNumber,
  })

  return { scores, totalScore, passed, feedback, inspection: inspectionResult }
}

// === Main Process Pipeline ===

export async function process(options: ProcessOptions): Promise<ChiefOfStaffResult> {
  const {
    commandId,
    commandText,
    companyId,
    targetAgentId,
    toolExecutor,
  } = options

  const phases: string[] = []

  // Start tracking + update command status
  delegationTracker.startCommand(companyId, commandId)
  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  // Find secretary agent
  const secretaryAgent = await findSecretaryAgent(companyId)
  if (!secretaryAgent) {
    await updateCommandFailed(commandId, companyId, '비서실장 에이전트를 찾을 수 없습니다')
    delegationTracker.failed(companyId, commandId, '비서실장 에이전트 없음')
    return {
      commandId,
      content: '비서실장 에이전트를 찾을 수 없습니다',
      classification: null,
      qualityGate: null,
      attemptNumber: 0,
      warningFlag: false,
      phases: ['failed'],
    }
  }

  // === Phase 1: Classify ===
  let classification: ClassificationResult | null = null
  let managerAgent: AgentConfig | null = null

  if (targetAgentId) {
    // Skip classification for @mention commands — delegate directly
    delegationTracker.classified(companyId, commandId, { departmentId: '', managerId: targetAgentId!, confidence: 1, reasoning: '직접 지정' })
    phases.push('direct-delegate')

    const [target] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, targetAgentId), eq(agents.companyId, companyId), eq(agents.isActive, true)))
      .limit(1)

    if (target) {
      managerAgent = toAgentConfig(target)
    }
  } else {
    // Auto-classify
    delegationTracker.classify(companyId, commandId)
    phases.push('classify')

    const classifyTask = await createOrchTask({
      companyId,
      commandId,
      agentId: secretaryAgent.id,
      type: 'classify',
      input: commandText,
    })

    try {
      classification = await classify(commandText, companyId, secretaryAgent, toolExecutor)

      if (!classification || classification.confidence < 0.5) {
        // Low confidence — secretary handles directly
        await completeOrchTask(classifyTask.id, JSON.stringify(classification), 'completed', classifyTask.startedAt)
        delegationTracker.classified(companyId, commandId, classification ?? { departmentId: '', managerId: secretaryAgent.id, confidence: 0, reasoning: '분류 불가' })
        phases.push('secretary-direct')

        managerAgent = secretaryAgent
        classification = classification ?? {
          departmentId: '',
          managerId: secretaryAgent.id,
          confidence: 0,
          reasoning: '분류 불가 — 비서실장 직접 처리',
        }
      } else {
        await completeOrchTask(classifyTask.id, JSON.stringify(classification), 'completed', classifyTask.startedAt)
        delegationTracker.classified(companyId, commandId, classification)

        // Load the target manager
        const [targetManager] = await db
          .select()
          .from(agents)
          .where(and(eq(agents.id, classification.managerId), eq(agents.companyId, companyId)))
          .limit(1)

        if (targetManager) {
          managerAgent = toAgentConfig(targetManager)
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      await completeOrchTask(classifyTask.id, errorMsg, 'failed', classifyTask.startedAt)

      // Fallback to secretary
      managerAgent = secretaryAgent
      classification = {
        departmentId: '',
        managerId: secretaryAgent.id,
        confidence: 0,
        reasoning: `분류 실패: ${errorMsg} — 비서실장 직접 처리`,
      }
      phases.push('classify-fallback')
    }
  }

  if (!managerAgent) {
    await updateCommandFailed(commandId, companyId, '위임할 에이전트를 찾을 수 없습니다')
    delegationTracker.failed(companyId, commandId, '위임 대상 없음')
    return {
      commandId,
      content: '위임할 에이전트를 찾을 수 없습니다',
      classification,
      qualityGate: null,
      attemptNumber: 0,
      warningFlag: false,
      phases: [...phases, 'failed'],
    }
  }

  // === Phase 2: Delegate (Manager self-analysis + parallel specialist execution) ===
  // Note: managerDelegate() internally calls delegationTracker.managerStarted()
  phases.push('delegate')

  let managerResult: string
  try {
    const delegationResult = await managerDelegate({
      manager: managerAgent,
      commandText,
      companyId,
      commandId,
      parentTaskId: null,
      toolExecutor,
    })

    // === Phase 2b: Synthesize (LLM combines results into structured report) ===
    phases.push('synthesize')
    managerResult = await managerSynthesize({
      manager: managerAgent,
      delegationResult,
      commandText,
      companyId,
      commandId,
      parentTaskId: null,
      toolExecutor,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await updateCommandFailed(commandId, companyId, `Manager 실행 실패: ${errorMsg}`)
    delegationTracker.failed(companyId, commandId, `Manager 실행 실패: ${errorMsg}`)
    return {
      commandId,
      content: `Manager 실행 실패: ${errorMsg}`,
      classification,
      qualityGate: null,
      attemptNumber: 1,
      warningFlag: false,
      phases: [...phases, 'failed'],
    }
  }

  // === Phase 3: Quality Gate + Rework Loop ===
  delegationTracker.qualityChecking(companyId, commandId)
  phases.push('review')

  let currentResult = managerResult
  let lastQualityResult: QualityGateResult | null = null
  let warningFlag = false
  let attemptNumber = 1

  for (let attempt = 1; attempt <= MAX_REWORK_ATTEMPTS + 1; attempt++) {
    attemptNumber = attempt

    // Resolve department name for rubric evaluation
    let deptNameEn: string | undefined
    if (classification?.departmentId) {
      try {
        const [dept] = await db.select({ nameEn: departments.nameEn }).from(departments)
          .where(and(eq(departments.id, classification.departmentId), eq(departments.companyId, companyId)))
          .limit(1)
        deptNameEn = dept?.nameEn ?? undefined
      } catch { /* ignore — rubric will use default */ }
    }

    try {
      lastQualityResult = await qualityGate(
        currentResult,
        commandText,
        companyId,
        commandId,
        secretaryAgent,
        attempt,
        deptNameEn,
      )
    } catch (err) {
      // Quality gate LLM failure — pass with warning
      lastQualityResult = {
        scores: { conclusionClarity: 3, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 3 },
        totalScore: 15,
        passed: true,
        feedback: null,
      }
      warningFlag = true
      phases.push('review-error')
      break
    }

    if (lastQualityResult.passed) {
      delegationTracker.qualityPassed(companyId, commandId, lastQualityResult.scores as unknown as Record<string, number>, lastQualityResult.totalScore)
      break
    }

    // FAIL
    delegationTracker.qualityFailed(companyId, commandId, lastQualityResult.scores as unknown as Record<string, number>, lastQualityResult.totalScore, lastQualityResult.feedback ?? '')

    // Check if we can rework
    if (attempt > MAX_REWORK_ATTEMPTS) {
      // Max reworks exceeded — pass with warning
      warningFlag = true
      phases.push('max-rework-exceeded')
      break
    }

    // Rework
    delegationTracker.reworking(companyId, commandId, attempt, MAX_REWORK_ATTEMPTS)
    phases.push(`rework-${attempt}`)

    const reworkContext = `## 재작업 지시 (시도 ${attempt + 1}/${MAX_REWORK_ATTEMPTS + 1})

이전 결과가 품질 검수에서 탈락했습니다. 아래 피드백을 반영하여 개선하세요.

### 품질 검수 피드백
${lastQualityResult.feedback}

### 이전 결과
${currentResult}`

    try {
      currentResult = await delegate(managerAgent, commandText, companyId, reworkContext, toolExecutor)
    } catch {
      // Rework failed — use previous result with warning
      warningFlag = true
      phases.push('rework-failed')
      break
    }
  }

  // === Phase 4: Complete ===
  delegationTracker.completed(companyId, commandId)
  phases.push('completed')

  const qualityGateSummary = lastQualityResult ? {
    passed: lastQualityResult.passed,
    totalScore: lastQualityResult.totalScore,
    attemptNumber,
    warningFlag,
  } : null

  // Update command with result
  await db.update(commands)
    .set({
      status: 'completed',
      result: currentResult,
      metadata: {
        qualityGate: qualityGateSummary,
        classification: classification ? {
          departmentId: classification.departmentId,
          managerId: classification.managerId,
          confidence: classification.confidence,
        } : null,
      },
      completedAt: new Date(),
    })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  return {
    commandId,
    content: currentResult,
    classification,
    qualityGate: lastQualityResult,
    attemptNumber,
    warningFlag,
    phases,
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
