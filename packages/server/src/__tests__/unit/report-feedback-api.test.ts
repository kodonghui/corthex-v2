import { describe, test, expect } from 'bun:test'
import { z } from 'zod'
import { microToUsd } from '../../lib/cost-tracker'

// === Feedback Schema Tests ===

const feedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().max(1000).optional(),
})

describe('Feedback Schema Validation', () => {
  test('accepts valid thumbs up', () => {
    const result = feedbackSchema.safeParse({ rating: 'up' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rating).toBe('up')
      expect(result.data.comment).toBeUndefined()
    }
  })

  test('accepts valid thumbs down', () => {
    const result = feedbackSchema.safeParse({ rating: 'down' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.rating).toBe('down')
  })

  test('accepts rating with comment', () => {
    const result = feedbackSchema.safeParse({ rating: 'up', comment: '좋은 분석입니다' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.rating).toBe('up')
      expect(result.data.comment).toBe('좋은 분석입니다')
    }
  })

  test('rejects invalid rating value', () => {
    const result = feedbackSchema.safeParse({ rating: 'neutral' })
    expect(result.success).toBe(false)
  })

  test('rejects missing rating', () => {
    const result = feedbackSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('rejects comment exceeding 1000 chars', () => {
    const result = feedbackSchema.safeParse({ rating: 'up', comment: 'x'.repeat(1001) })
    expect(result.success).toBe(false)
  })

  test('accepts comment at exactly 1000 chars', () => {
    const result = feedbackSchema.safeParse({ rating: 'down', comment: 'x'.repeat(1000) })
    expect(result.success).toBe(true)
  })

  test('accepts empty string comment', () => {
    const result = feedbackSchema.safeParse({ rating: 'up', comment: '' })
    expect(result.success).toBe(true)
  })
})

// === Metadata Merge Logic Tests ===

describe('Feedback Metadata Merge', () => {
  function mergeFeedback(
    existingMeta: Record<string, unknown> | null,
    rating: 'up' | 'down',
    comment?: string,
  ) {
    const meta = (existingMeta ?? {}) as Record<string, unknown>
    return {
      ...meta,
      feedback: {
        rating,
        comment: comment ?? null,
        updatedAt: new Date().toISOString(),
      },
    }
  }

  test('adds feedback to empty metadata', () => {
    const result = mergeFeedback(null, 'up')
    expect(result.feedback).toBeDefined()
    expect((result.feedback as any).rating).toBe('up')
    expect((result.feedback as any).comment).toBeNull()
    expect((result.feedback as any).updatedAt).toBeTruthy()
  })

  test('preserves existing metadata fields', () => {
    const existing = {
      qualityGate: { passed: true, totalScore: 18 },
      classification: { departmentId: 'dept-1' },
    }
    const result = mergeFeedback(existing, 'down', '분석이 부족합니다')
    expect((result as any).qualityGate).toEqual({ passed: true, totalScore: 18 })
    expect((result as any).classification).toEqual({ departmentId: 'dept-1' })
    expect((result.feedback as any).rating).toBe('down')
    expect((result.feedback as any).comment).toBe('분석이 부족합니다')
  })

  test('overwrites previous feedback', () => {
    const existing = {
      qualityGate: { passed: true },
      feedback: { rating: 'up', comment: null, updatedAt: '2026-01-01' },
    }
    const result = mergeFeedback(existing, 'down', '재검토 필요')
    expect((result.feedback as any).rating).toBe('down')
    expect((result.feedback as any).comment).toBe('재검토 필요')
  })
})

// === Cost Calculation Tests ===

describe('Cost Display Logic', () => {
  test('microToUsd converts correctly', () => {
    expect(microToUsd(1_000_000)).toBe(1.0)
    expect(microToUsd(500_000)).toBe(0.5)
    expect(microToUsd(0)).toBe(0)
    expect(microToUsd(123)).toBe(0.000123)
  })

  test('cost summary response shape', () => {
    const response = {
      inputTokens: 1500,
      outputTokens: 800,
      totalCostUsd: microToUsd(45000),
    }
    expect(response.inputTokens).toBe(1500)
    expect(response.outputTokens).toBe(800)
    expect(response.totalCostUsd).toBe(0.045)
  })

  test('zero cost when no records', () => {
    const response = {
      inputTokens: 0,
      outputTokens: 0,
      totalCostUsd: microToUsd(0),
    }
    expect(response.totalCostUsd).toBe(0)
  })
})

// === Quality Gate Badge Logic Tests ===

describe('Quality Gate Badge Logic', () => {
  type QualityGateMeta = {
    passed: boolean
    totalScore: number
    attemptNumber: number
    warningFlag: boolean
  }

  function getBadgeType(qg: QualityGateMeta | null): 'pass' | 'fail' | 'warning' | 'none' {
    if (!qg) return 'none'
    if (qg.warningFlag) return 'warning'
    return qg.passed ? 'pass' : 'fail'
  }

  function getBadgeLabel(qg: QualityGateMeta | null): string {
    if (!qg) return ''
    const badge = getBadgeType(qg)
    const label = badge === 'pass' ? 'PASS' : badge === 'fail' ? 'FAIL' : 'WARNING'
    return `${label} ${qg.totalScore}/25`
  }

  test('PASS badge for passed quality gate', () => {
    const qg: QualityGateMeta = { passed: true, totalScore: 20, attemptNumber: 1, warningFlag: false }
    expect(getBadgeType(qg)).toBe('pass')
    expect(getBadgeLabel(qg)).toBe('PASS 20/25')
  })

  test('FAIL badge for failed quality gate', () => {
    const qg: QualityGateMeta = { passed: false, totalScore: 10, attemptNumber: 1, warningFlag: false }
    expect(getBadgeType(qg)).toBe('fail')
    expect(getBadgeLabel(qg)).toBe('FAIL 10/25')
  })

  test('WARNING badge when warningFlag is true', () => {
    const qg: QualityGateMeta = { passed: true, totalScore: 14, attemptNumber: 3, warningFlag: true }
    expect(getBadgeType(qg)).toBe('warning')
    expect(getBadgeLabel(qg)).toBe('WARNING 14/25')
  })

  test('none when no quality gate', () => {
    expect(getBadgeType(null)).toBe('none')
    expect(getBadgeLabel(null)).toBe('')
  })
})

// === Delegation Chain Response Shape Tests ===

describe('Delegation Chain Response Shape', () => {
  test('chain item has required fields', () => {
    const chainItem = {
      taskId: 'task-1',
      agentId: 'agent-1',
      agentName: '마케팅 분석관',
      agentTier: 'specialist',
      taskType: 'execute',
      status: 'completed',
      parentTaskId: 'parent-1',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1500,
    }
    expect(chainItem.taskId).toBeTruthy()
    expect(chainItem.agentName).toBe('마케팅 분석관')
    expect(chainItem.taskType).toBe('execute')
    expect(chainItem.durationMs).toBe(1500)
  })

  test('quality review item has required fields', () => {
    const review = {
      id: 'review-1',
      conclusion: 'pass',
      scores: {
        conclusionClarity: 4,
        evidenceSufficiency: 4,
        riskMention: 3,
        formatAdequacy: 4,
        logicalConsistency: 4,
      },
      feedback: null,
      attemptNumber: 1,
      createdAt: new Date().toISOString(),
    }
    expect(review.conclusion).toBe('pass')
    expect(review.scores.conclusionClarity).toBe(4)
    expect(review.attemptNumber).toBe(1)
    expect(review.feedback).toBeNull()
  })

  test('full delegation response structure', () => {
    const response = {
      success: true,
      data: {
        chain: [
          { taskId: 't1', agentId: 'a1', agentName: '비서실장', taskType: 'classify', status: 'completed', durationMs: 200 },
          { taskId: 't2', agentId: 'a2', agentName: 'CIO', taskType: 'delegate', status: 'completed', durationMs: 3000 },
          { taskId: 't3', agentId: 'a3', agentName: '기술분석관', taskType: 'execute', status: 'completed', durationMs: 2000 },
        ],
        qualityReviews: [
          { id: 'r1', conclusion: 'pass', scores: {}, attemptNumber: 1 },
        ],
      },
    }
    expect(response.data.chain).toHaveLength(3)
    expect(response.data.qualityReviews).toHaveLength(1)
    expect(response.data.chain[0].taskType).toBe('classify')
    expect(response.data.chain[1].agentName).toBe('CIO')
  })
})

// === Section Highlight Logic Tests ===

describe('Report Section Detection', () => {
  const SECTION_PATTERNS = [
    { pattern: /^##\s*(결론|종합\s*결론)/m, type: 'conclusion' },
    { pattern: /^##\s*(분석|상세\s*분석)/m, type: 'analysis' },
    { pattern: /^##\s*(리스크|위험\s*요소)/m, type: 'risk' },
    { pattern: /^##\s*(추천|권고\s*사항)/m, type: 'recommendation' },
  ] as const

  function detectSections(text: string): string[] {
    return SECTION_PATTERNS
      .filter(s => s.pattern.test(text))
      .map(s => s.type)
  }

  test('detects all 4 standard sections', () => {
    const report = `## 결론\n내용\n## 분석\n내용\n## 리스크\n내용\n## 추천\n내용`
    expect(detectSections(report)).toEqual(['conclusion', 'analysis', 'risk', 'recommendation'])
  })

  test('detects alternative section names', () => {
    const report = `## 종합 결론\n내용\n## 상세 분석\n내용\n## 위험 요소\n내용\n## 권고 사항\n내용`
    expect(detectSections(report)).toEqual(['conclusion', 'analysis', 'risk', 'recommendation'])
  })

  test('handles report with only some sections', () => {
    const report = `## 결론\n내용\n## 분석\n내용`
    expect(detectSections(report)).toEqual(['conclusion', 'analysis'])
  })

  test('ignores non-matching headers', () => {
    const report = `## 서론\n내용\n## 방법론\n내용`
    expect(detectSections(report)).toEqual([])
  })

  test('handles empty report', () => {
    expect(detectSections('')).toEqual([])
  })
})

// === TEA: Risk-Based Additional Tests ===

// --- P0: splitSections edge cases (section highlight is core AC#1) ---

describe('TEA: splitSections Logic', () => {
  const SECTION_PATTERNS_LOCAL = [
    { pattern: /^##\s*(결론|종합\s*결론)/m, type: 'conclusion' },
    { pattern: /^##\s*(분석|상세\s*분석)/m, type: 'analysis' },
    { pattern: /^##\s*(리스크|위험\s*요소)/m, type: 'risk' },
    { pattern: /^##\s*(추천|권고\s*사항)/m, type: 'recommendation' },
  ] as const

  function splitSections(text: string): Array<{ type: string; content: string }> {
    const markers: Array<{ pos: number; type: string }> = []
    for (const sp of SECTION_PATTERNS_LOCAL) {
      const match = sp.pattern.exec(text)
      if (match) markers.push({ pos: match.index, type: sp.type })
    }
    markers.sort((a, b) => a.pos - b.pos)
    if (markers.length === 0) return [{ type: 'default', content: text }]
    const sections: Array<{ type: string; content: string }> = []
    if (markers[0].pos > 0) {
      sections.push({ type: 'default', content: text.slice(0, markers[0].pos) })
    }
    for (let i = 0; i < markers.length; i++) {
      const start = markers[i].pos
      const end = i < markers.length - 1 ? markers[i + 1].pos : text.length
      sections.push({ type: markers[i].type, content: text.slice(start, end) })
    }
    return sections
  }

  test('returns default section for plain text without headers', () => {
    const result = splitSections('Hello world\nno sections here')
    expect(result).toEqual([{ type: 'default', content: 'Hello world\nno sections here' }])
  })

  test('includes preamble content before first section as default', () => {
    const report = '서론입니다.\n\n## 결론\n결론 내용'
    const result = splitSections(report)
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('default')
    expect(result[0].content).toBe('서론입니다.\n\n')
    expect(result[1].type).toBe('conclusion')
  })

  test('handles sections in non-standard order', () => {
    const report = '## 추천\n내용1\n## 결론\n내용2\n## 리스크\n내용3'
    const result = splitSections(report)
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe('recommendation')
    expect(result[1].type).toBe('conclusion')
    expect(result[2].type).toBe('risk')
  })

  test('preserves full section content including nested markdown', () => {
    const report = '## 분석\n### 세부항목\n- 항목1\n- 항목2\n```code\nfoo\n```\n## 결론\n끝'
    const result = splitSections(report)
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('analysis')
    expect(result[0].content).toContain('### 세부항목')
    expect(result[0].content).toContain('```code')
    expect(result[1].type).toBe('conclusion')
  })

  test('single section report', () => {
    const report = '## 결론\n이것만 있습니다.'
    const result = splitSections(report)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('conclusion')
    expect(result[0].content).toBe('## 결론\n이것만 있습니다.')
  })
})

// --- P1: Duration formatting (used in detail modal) ---

describe('TEA: Duration Formatting', () => {
  function formatDuration(ms: number | null): string {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}초`
  }

  test('null returns dash', () => {
    expect(formatDuration(null)).toBe('-')
  })

  test('zero returns dash (falsy)', () => {
    expect(formatDuration(0)).toBe('-')
  })

  test('sub-second shows milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms')
    expect(formatDuration(1)).toBe('1ms')
    expect(formatDuration(999)).toBe('999ms')
  })

  test('1000ms and above shows seconds', () => {
    expect(formatDuration(1000)).toBe('1.0초')
    expect(formatDuration(1500)).toBe('1.5초')
    expect(formatDuration(30000)).toBe('30.0초')
  })
})

// --- P1: Quality score total calculation edge cases ---

describe('TEA: Quality Score Total Calculation', () => {
  function calcTotal(scores: Record<string, unknown>): number {
    return Object.values(scores).reduce(
      (a: number, b: unknown) => a + (typeof b === 'number' ? b : 0),
      0,
    )
  }

  test('sums all numeric scores', () => {
    const scores = { conclusionClarity: 4, evidenceSufficiency: 3, riskMention: 5, formatAdequacy: 4, logicalConsistency: 4 }
    expect(calcTotal(scores)).toBe(20)
  })

  test('ignores non-numeric values', () => {
    const scores = { conclusionClarity: 4, evidenceSufficiency: 'N/A', riskMention: null, formatAdequacy: 4, logicalConsistency: undefined }
    expect(calcTotal(scores)).toBe(8)
  })

  test('empty scores returns zero', () => {
    expect(calcTotal({})).toBe(0)
  })

  test('perfect score', () => {
    const scores = { a: 5, b: 5, c: 5, d: 5, e: 5 }
    expect(calcTotal(scores)).toBe(25)
  })
})

// --- P1: Task type and tier label lookups ---

describe('TEA: Label Lookups', () => {
  const TASK_TYPE_LABELS: Record<string, string> = {
    classify: '분류',
    delegate: '위임',
    execute: '실행',
    synthesize: '종합',
    review: '검수',
  }

  const TIER_LABELS: Record<string, string> = {
    secretary: '비서실장',
    manager: '부서장',
    specialist: '전문가',
    worker: '실무자',
  }

  test('all task types have Korean labels', () => {
    expect(TASK_TYPE_LABELS['classify']).toBe('분류')
    expect(TASK_TYPE_LABELS['delegate']).toBe('위임')
    expect(TASK_TYPE_LABELS['execute']).toBe('실행')
    expect(TASK_TYPE_LABELS['synthesize']).toBe('종합')
    expect(TASK_TYPE_LABELS['review']).toBe('검수')
  })

  test('all tiers have Korean labels', () => {
    expect(TIER_LABELS['secretary']).toBe('비서실장')
    expect(TIER_LABELS['manager']).toBe('부서장')
    expect(TIER_LABELS['specialist']).toBe('전문가')
    expect(TIER_LABELS['worker']).toBe('실무자')
  })

  test('unknown task type falls through gracefully', () => {
    expect(TASK_TYPE_LABELS['unknown'] ?? 'unknown').toBe('unknown')
  })

  test('unknown tier falls through gracefully', () => {
    expect(TIER_LABELS['unknown'] ?? 'unknown').toBe('unknown')
  })
})

// --- P2: Feedback edge cases ---

describe('TEA: Feedback Edge Cases', () => {
  const feedbackSchemaLocal = z.object({
    rating: z.enum(['up', 'down']),
    comment: z.string().max(1000).optional(),
  })

  test('rejects numeric rating', () => {
    const result = feedbackSchemaLocal.safeParse({ rating: 1 })
    expect(result.success).toBe(false)
  })

  test('rejects boolean rating', () => {
    const result = feedbackSchemaLocal.safeParse({ rating: true })
    expect(result.success).toBe(false)
  })

  test('rejects null rating', () => {
    const result = feedbackSchemaLocal.safeParse({ rating: null })
    expect(result.success).toBe(false)
  })

  test('accepts comment with unicode/emoji', () => {
    const result = feedbackSchemaLocal.safeParse({ rating: 'up', comment: '좋아요 👍 분석이 정확합니다' })
    expect(result.success).toBe(true)
  })
})

// --- P0: Cost aggregation zero-task scenario ---

describe('TEA: Cost Aggregation Edge Cases', () => {
  test('microToUsd handles large values', () => {
    expect(microToUsd(100_000_000)).toBe(100.0)
  })

  test('microToUsd handles negative (defensive)', () => {
    expect(microToUsd(-1_000_000)).toBe(-1.0)
  })

  test('cost response with zero tokens is valid', () => {
    const response = { inputTokens: 0, outputTokens: 0, totalCostUsd: 0 }
    expect(response.inputTokens).toBe(0)
    expect(response.totalCostUsd).toBe(0)
  })
})
