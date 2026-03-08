import { db } from '../../db'
import { toolCalls, workflowSuggestions } from '../../db/schema'
import { eq, and, gte } from 'drizzle-orm'
import type { WorkflowStep } from './engine'

// === Types ===

export type ToolSequence = {
  tools: string[]
  count: number
  avgGapMs: number
}

export type PatternResult = {
  patternsFound: number
  suggestionsCreated: number
  patterns: ToolSequence[]
}

// === Constants ===

const DEFAULT_LOOKBACK_DAYS = 30
const MIN_PATTERN_OCCURRENCES = 3
const SESSION_GAP_MS = 30 * 60 * 1000 // 30분 이내 연속 = 같은 세션
const MIN_SEQUENCE_LENGTH = 2
const MAX_SEQUENCE_LENGTH = 10

/**
 * 예측 워크플로우 패턴 분석기
 * tool_calls 테이블에서 반복 패턴을 감지하고 workflow_suggestions에 저장
 */
export class PatternAnalyzer {

  /**
   * 특정 회사+사용자의 도구 호출 패턴 분석
   * @param companyId 테넌트 ID
   * @param userId 분석 대상 사용자 (null이면 회사 전체)
   * @param lookbackDays 분석 기간 (기본 30일)
   */
  static async analyze(
    companyId: string,
    userId?: string,
    lookbackDays = DEFAULT_LOOKBACK_DAYS
  ): Promise<PatternResult> {
    const since = new Date()
    since.setDate(since.getDate() - lookbackDays)

    // 1. tool_calls에서 최근 데이터 조회 (시간순)
    const calls = await db
      .select({
        toolName: toolCalls.toolName,
        createdAt: toolCalls.createdAt,
        sessionId: toolCalls.sessionId,
      })
      .from(toolCalls)
      .where(and(
        eq(toolCalls.companyId, companyId),
        eq(toolCalls.status, 'success'),
        gte(toolCalls.createdAt, since),
      ))
      .orderBy(toolCalls.createdAt)

    if (calls.length < MIN_SEQUENCE_LENGTH * MIN_PATTERN_OCCURRENCES) {
      return { patternsFound: 0, suggestionsCreated: 0, patterns: [] }
    }

    // 2. 세션 단위로 그룹핑 (30분 갭 기준)
    const sessions = PatternAnalyzer.groupIntoSessions(calls)

    // 3. 시퀀스 패턴 탐지 (빈도 기반)
    const patterns = PatternAnalyzer.detectPatterns(sessions)

    // 4. 기존 제안과 중복 체크 후 저장
    let suggestionsCreated = 0
    for (const pattern of patterns) {
      const isDuplicate = await PatternAnalyzer.isDuplicateSuggestion(
        companyId, userId, pattern.tools
      )
      if (!isDuplicate) {
        await PatternAnalyzer.createSuggestion(companyId, userId, pattern)
        suggestionsCreated++
      }
    }

    return {
      patternsFound: patterns.length,
      suggestionsCreated,
      patterns,
    }
  }

  /** 도구 호출을 세션 단위로 그룹핑 */
  static groupIntoSessions(
    calls: { toolName: string; createdAt: Date; sessionId: string | null }[]
  ): string[][] {
    if (calls.length === 0) return []

    const sessions: string[][] = [[calls[0].toolName]]

    for (let i = 1; i < calls.length; i++) {
      const gap = calls[i].createdAt.getTime() - calls[i - 1].createdAt.getTime()
      const sameSession = calls[i].sessionId && calls[i].sessionId === calls[i - 1].sessionId

      if (sameSession || gap <= SESSION_GAP_MS) {
        sessions[sessions.length - 1].push(calls[i].toolName)
      } else {
        sessions.push([calls[i].toolName])
      }
    }

    return sessions
  }

  /** 세션들에서 반복 시퀀스 패턴 탐지 */
  static detectPatterns(sessions: string[][]): ToolSequence[] {
    const sequenceCounts = new Map<string, number>()

    // 각 세션에서 연속 도구 서브시퀀스 추출
    for (const session of sessions) {
      if (session.length < MIN_SEQUENCE_LENGTH) continue

      const seen = new Set<string>() // 같은 세션 내 중복 카운트 방지
      for (let len = MIN_SEQUENCE_LENGTH; len <= Math.min(session.length, MAX_SEQUENCE_LENGTH); len++) {
        for (let start = 0; start <= session.length - len; start++) {
          const subseq = session.slice(start, start + len)
          const key = subseq.join(' → ')
          if (!seen.has(key)) {
            seen.add(key)
            sequenceCounts.set(key, (sequenceCounts.get(key) ?? 0) + 1)
          }
        }
      }
    }

    // MIN_PATTERN_OCCURRENCES 이상 반복된 시퀀스 수집
    const candidates: ToolSequence[] = []
    for (const [key, count] of sequenceCounts) {
      if (count >= MIN_PATTERN_OCCURRENCES) {
        candidates.push({ tools: key.split(' → '), count, avgGapMs: 0 })
      }
    }

    // 더 긴 시퀀스에 포함되는 짧은 서브시퀀스 제거
    const patterns = candidates.filter(candidate => {
      const key = candidate.tools.join(' → ')
      return !candidates.some(other =>
        other.tools.length > candidate.tools.length &&
        other.tools.join(' → ').includes(key)
      )
    })

    // 빈도 내림차순 정렬
    patterns.sort((a, b) => b.count - a.count)
    return patterns
  }

  /** 중복 제안 체크 */
  private static async isDuplicateSuggestion(
    companyId: string,
    userId: string | undefined,
    tools: string[]
  ): Promise<boolean> {
    const conditions = [
      eq(workflowSuggestions.companyId, companyId),
      eq(workflowSuggestions.status, 'pending'),
    ]
    if (userId) {
      conditions.push(eq(workflowSuggestions.userId, userId))
    }

    const existing = await db.query.workflowSuggestions.findMany({
      where: and(...conditions),
    })

    const toolsKey = tools.join(' → ')
    return existing.some(s => {
      const steps = s.suggestedSteps as WorkflowStep[]
      const existingKey = steps.map(st => st.action).join(' → ')
      return existingKey === toolsKey
    })
  }

  /** 패턴 → suggestion 저장 */
  private static async createSuggestion(
    companyId: string,
    userId: string | undefined,
    pattern: ToolSequence
  ) {
    const steps: WorkflowStep[] = pattern.tools.map((toolName, idx) => ({
      id: crypto.randomUUID(),
      name: `Step ${idx + 1}: ${toolName}`,
      type: 'tool' as const,
      action: toolName,
    }))

    // dependsOn 체인 설정 (순차 실행: 각 스텝은 이전 스텝에 의존)
    for (let i = 1; i < steps.length; i++) {
      steps[i] = { ...steps[i], dependsOn: [steps[i - 1].id] }
    }

    const reason = `"${pattern.tools.join(' → ')}" 패턴이 최근 ${pattern.count}회 반복 감지되었습니다.`

    await db.insert(workflowSuggestions).values({
      companyId,
      userId: userId ?? companyId, // userId 없으면 companyId로 대체 (회사 전체 제안)
      reason,
      suggestedSteps: steps,
      status: 'pending',
    })
  }
}
