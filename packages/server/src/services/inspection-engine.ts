import {
  type QualityRule,
  type QualityRulesConfig,
  type Severity,
  type Rubric,
  type PassCriteria,
} from '../config/quality-rules-schema'
import {
  getActiveRules,
  getRulesForCompany,
  getPassCriteria,
  getRubricForDepartment,
} from './quality-rules'
import { llmRouter } from './llm-router'
import type { LLMRouterContext } from './llm-router'

// Local JSON parser to avoid circular dependency with chief-of-staff.ts
function parseLLMJson<T>(raw: string): T | null {
  let cleaned = raw.trim()
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) cleaned = codeBlockMatch[1].trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]) as T } catch { return null }
    }
    return null
  }
}

// === Types ===

export type InspectionInput = {
  content: string
  commandText: string
  companyId: string
  commandId: string
  agentId: string
  departmentNameEn?: string
  toolData?: Record<string, unknown>
  attemptNumber: number
}

export type RuleResult = {
  ruleId: string
  ruleName: string
  category: string
  severity: Severity
  result: 'pass' | 'warn' | 'fail'
  score?: number
  message?: string
  skipped?: boolean
}

export type RubricScore = {
  id: string
  label: string
  weight: number
  critical: boolean
  score: number
  feedback: string
}

export type InspectionResult = {
  conclusion: 'pass' | 'fail' | 'warning'
  ruleResults: RuleResult[]
  totalScore: number
  maxScore: number
  feedback: string | null
  rubricScores?: RubricScore[]
}

// === Rule-based evaluators (deterministic) ===

function computeField(content: string, field: string): number {
  switch (field) {
    case 'responseLength':
      return content.length
    case 'sourceCount': {
      const sourcePatterns = [/출처:/g, /참고:/g, /Source:/g, /Reference:/g, /에 따르면/g, /에 의하면/g]
      return sourcePatterns.reduce((count, pat) => count + (content.match(pat)?.length ?? 0), 0)
    }
    case 'lineCount':
      return content.split('\n').length
    case 'wordCount':
      return content.split(/\s+/).filter(Boolean).length
    default:
      return 0
  }
}

function compareValues(actual: number, operator: string, expected: number): boolean {
  switch (operator) {
    case '>=': return actual >= expected
    case '<=': return actual <= expected
    case '>': return actual > expected
    case '<': return actual < expected
    case '==': return actual === expected
    case '!=': return actual !== expected
    default: return false
  }
}

export function evaluateThreshold(
  content: string,
  params: { field: string; operator: string; value: number },
): boolean {
  const actual = computeField(content, params.field)
  return compareValues(actual, params.operator, params.value)
}

export function evaluateKeyword(
  content: string,
  params: { keywords: string[]; minMatches: number; mode?: string },
): boolean {
  const lowerContent = content.toLowerCase()
  const matchCount = params.keywords.filter(kw => lowerContent.includes(kw.toLowerCase())).length

  if (params.mode === 'absence') {
    // absence mode: PASS if no keywords found, FAIL if any found
    return matchCount === 0
  }

  // presence mode (default): PASS if enough keywords found
  return matchCount >= params.minMatches
}

export function evaluateRegex(
  content: string,
  params: { patterns: string[]; minMatches: number; multiline?: boolean },
): boolean {
  const flags = params.multiline ? 'gm' : 'g'
  let totalMatches = 0

  for (const pattern of params.patterns) {
    try {
      const regex = new RegExp(pattern, flags)
      const matches = content.match(regex)
      totalMatches += matches?.length ?? 0
    } catch {
      // Invalid regex pattern — skip
      continue
    }
  }

  return totalMatches >= params.minMatches
}

/**
 * Evaluate a single rule against content (rule-based only, no LLM).
 * Returns null for llm-check rules (handled separately).
 */
export function evaluateRuleBasedCheck(rule: QualityRule, content: string): RuleResult | null {
  const { condition, action } = rule
  const baseResult = {
    ruleId: rule.id,
    ruleName: rule.name,
    category: rule.category,
    severity: rule.severity,
  }

  const params = condition.params as Record<string, unknown>

  switch (condition.type) {
    case 'threshold': {
      const passed = evaluateThreshold(content, params as { field: string; operator: string; value: number })
      return {
        ...baseResult,
        result: passed ? (action.onPass as 'pass' | 'warn' | 'fail') : (action.onFail as 'pass' | 'warn' | 'fail'),
        score: passed ? 1 : 0,
        message: passed ? undefined : action.failMessage,
      }
    }

    case 'keyword': {
      const passed = evaluateKeyword(content, params as { keywords: string[]; minMatches: number; mode?: string })
      return {
        ...baseResult,
        result: passed ? (action.onPass as 'pass' | 'warn' | 'fail') : (action.onFail as 'pass' | 'warn' | 'fail'),
        score: passed ? 1 : 0,
        message: passed ? undefined : action.failMessage,
      }
    }

    case 'regex': {
      const passed = evaluateRegex(content, params as { patterns: string[]; minMatches: number; multiline?: boolean })
      // For safety regex rules, the logic is inverted: if regex matches (detects bad content), it FAILs
      // The YAML already handles this: onPass=pass (no match), onFail=fail (match found)
      // evaluateRegex returns true if matches >= minMatches
      // For safety rules: match found → bad → should fail
      // The action mapping: if evaluateRegex returns true (matches found), that means the pattern was detected
      // For safety: patterns detected = bad = should map to onFail
      const detected = passed // true means patterns were found
      return {
        ...baseResult,
        result: detected ? (action.onFail as 'pass' | 'warn' | 'fail') : (action.onPass as 'pass' | 'warn' | 'fail'),
        score: detected ? 0 : 1,
        message: detected ? action.failMessage : undefined,
      }
    }

    case 'llm-check':
      return null // Handled by evaluateLLMCheck

    default:
      return {
        ...baseResult,
        result: 'warn',
        score: 0.5,
        message: `Unknown condition type: ${condition.type}`,
        skipped: true,
      }
  }
}

// === LLM-based evaluators ===

const INSPECTION_SYSTEM_PROMPT = `당신은 CORTHEX의 품질 검수 AI입니다. 에이전트 결과물을 평가하고 반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.`

export async function evaluateLLMCheck(
  rule: QualityRule,
  content: string,
  commandText: string,
  context: LLMRouterContext,
  toolData?: Record<string, unknown>,
): Promise<RuleResult> {
  const baseResult = {
    ruleId: rule.id,
    ruleName: rule.name,
    category: rule.category,
    severity: rule.severity,
  }

  const params = rule.condition.params as { prompt: string; requireToolData?: boolean; checkPatterns?: string[] }

  // Skip if requireToolData but no toolData provided
  if (params.requireToolData && (!toolData || Object.keys(toolData).length === 0)) {
    return {
      ...baseResult,
      result: 'warn',
      score: 0.5,
      message: '도구 실행 데이터가 없어 이 검수를 건너뜁니다',
      skipped: true,
    }
  }

  try {
    let userPrompt = `## 검수 규칙
${rule.description}

## 검수 지시
${params.prompt}

## 원본 명령
${commandText}

## 에이전트 결과물
${content}`

    if (toolData && Object.keys(toolData).length > 0) {
      userPrompt += `

## 도구 실행 데이터
${JSON.stringify(toolData, null, 2)}`
    }

    if (params.checkPatterns && params.checkPatterns.length > 0) {
      userPrompt += `

## 주의할 패턴
${params.checkPatterns.map(p => `- ${p}`).join('\n')}`
    }

    userPrompt += `

반드시 아래 JSON 형식으로만 응답하세요:
{"passed": true/false, "score": 1-5, "feedback": "상세 사유"}`

    const response = await llmRouter.call({
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: INSPECTION_SYSTEM_PROMPT,
      maxTokens: 500,
      temperature: 0.1,
    }, context)

    const parsed = parseLLMJson<{ passed: boolean; score: number; feedback: string }>(response.content)

    if (!parsed) {
      return {
        ...baseResult,
        result: 'warn',
        score: 0.5,
        message: 'LLM 응답을 파싱할 수 없어 검수를 건너뜁니다',
        skipped: true,
      }
    }

    const normalizedScore = Math.max(0, Math.min(1, (parsed.score ?? 3) / 5))

    return {
      ...baseResult,
      result: parsed.passed
        ? (rule.action.onPass as 'pass' | 'warn' | 'fail')
        : (rule.action.onFail as 'pass' | 'warn' | 'fail'),
      score: normalizedScore,
      message: parsed.passed ? undefined : (parsed.feedback ?? rule.action.failMessage),
    }
  } catch (err) {
    // LLM failure — graceful degradation
    return {
      ...baseResult,
      result: 'warn',
      score: 0.5,
      message: `LLM 검수 실패: ${err instanceof Error ? err.message : String(err)}`,
      skipped: true,
    }
  }
}

export async function evaluateRubric(
  content: string,
  commandText: string,
  rubric: Rubric,
  context: LLMRouterContext,
): Promise<RubricScore[]> {
  const scoringDesc = rubric.scoring
    .map(s => {
      const criteriaLines = Object.entries(s.criteria).map(([k, v]) => `    ${k}점: ${v}`).join('\n')
      return `- ${s.id} ${s.label} (가중치 ${s.weight}%${s.critical ? ', 필수' : ''})\n${criteriaLines}`
    })
    .join('\n')

  const userPrompt = `## 검수 기준: ${rubric.name}

## 평가 항목
${scoringDesc}

## 원본 명령
${commandText}

## 에이전트 결과물
${content}

각 항목별 1-5 점수를 JSON 배열로만 응답하세요:
[{"id": "Q1", "score": 3, "feedback": "사유"}, ...]`

  try {
    const response = await llmRouter.call({
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: INSPECTION_SYSTEM_PROMPT,
      maxTokens: 800,
      temperature: 0.1,
    }, context)

    const parsed = parseLLMJson<Array<{ id: string; score: number; feedback: string }>>(response.content)

    if (!parsed || !Array.isArray(parsed)) {
      // Return default scores on parse failure
      return rubric.scoring.map(s => ({
        id: s.id,
        label: s.label,
        weight: s.weight,
        critical: s.critical,
        score: 3,
        feedback: 'LLM 응답 파싱 실패 — 기본 점수 적용',
      }))
    }

    return rubric.scoring.map(s => {
      const llmScore = parsed.find(p => p.id === s.id)
      return {
        id: s.id,
        label: s.label,
        weight: s.weight,
        critical: s.critical,
        score: Math.max(1, Math.min(5, llmScore?.score ?? 3)),
        feedback: llmScore?.feedback ?? '',
      }
    })
  } catch {
    // LLM failure — return default scores
    return rubric.scoring.map(s => ({
      id: s.id,
      label: s.label,
      weight: s.weight,
      critical: s.critical,
      score: 3,
      feedback: 'LLM 호출 실패 — 기본 점수 적용',
    }))
  }
}

// === Aggregate judgment ===

function applyPassCriteria(ruleResults: RuleResult[], criteria: PassCriteria): 'pass' | 'fail' | 'warning' {
  const failCount = ruleResults.filter(r => r.result === 'fail' && !r.skipped).length
  const warnCount = ruleResults.filter(r => r.result === 'warn' && !r.skipped).length
  const criticalFails = ruleResults.filter(r => r.result === 'fail' && r.severity === 'critical' && !r.skipped)

  // allCriticalMustPass: any critical fail → overall fail
  if (criteria.allCriticalMustPass && criticalFails.length > 0) {
    return 'fail'
  }

  // maxFailCount: too many fails → overall fail
  if (failCount > criteria.maxFailCount) {
    return 'fail'
  }

  // maxWarnCount: too many warnings → overall warning (not fail, but flagged)
  if (warnCount > criteria.maxWarnCount) {
    return 'warning'
  }

  return 'pass'
}

function buildFeedback(ruleResults: RuleResult[]): string | null {
  const issues = ruleResults
    .filter(r => (r.result === 'fail' || r.result === 'warn') && !r.skipped && r.message)
    .map(r => {
      const prefix = r.result === 'fail' ? '❌' : '⚠️'
      return `${prefix} [${r.severity}] ${r.ruleName}: ${r.message}`
    })

  return issues.length > 0 ? issues.join('\n') : null
}

// === Main inspection function ===

export async function inspect(input: InspectionInput): Promise<InspectionResult> {
  const { content, commandText, companyId, agentId, departmentNameEn, toolData } = input

  // Load rules (with company overrides)
  const config = await getRulesForCompany(companyId)
  const activeRules = config.rules.filter(r => r.enabled)
  const passCriteria = config.passCriteria

  const llmContext: LLMRouterContext = {
    companyId,
    agentId,
    agentName: 'inspection-engine',
    source: 'delegation',
  }

  // Phase 1: Rule-based checks (fast, deterministic)
  const ruleBasedResults: RuleResult[] = []
  const llmCheckRules: QualityRule[] = []

  for (const rule of activeRules) {
    if (rule.condition.type === 'llm-check') {
      llmCheckRules.push(rule)
      continue
    }
    const result = evaluateRuleBasedCheck(rule, content)
    if (result) {
      ruleBasedResults.push(result)
    }
  }

  // Phase 2: LLM-based checks (slower, probabilistic)
  const llmResults: RuleResult[] = []
  for (const rule of llmCheckRules) {
    const result = await evaluateLLMCheck(rule, content, commandText, llmContext, toolData)
    llmResults.push(result)
  }

  // Phase 3: Rubric evaluation (if department specified)
  let rubricScores: RubricScore[] | undefined
  if (departmentNameEn) {
    const rubric = getRubricForDepartment(departmentNameEn)
    rubricScores = await evaluateRubric(content, commandText, rubric, llmContext)
  }

  // Combine all results
  const allResults = [...ruleBasedResults, ...llmResults]

  // Calculate scores
  const nonSkipped = allResults.filter(r => !r.skipped)
  const totalScore = nonSkipped.reduce((sum, r) => sum + (r.score ?? 0), 0)
  const maxScore = nonSkipped.length

  // Apply pass criteria
  const conclusion = applyPassCriteria(allResults, passCriteria)

  // Build feedback
  const feedback = buildFeedback(allResults)

  return {
    conclusion,
    ruleResults: allResults,
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore,
    feedback,
    rubricScores,
  }
}
