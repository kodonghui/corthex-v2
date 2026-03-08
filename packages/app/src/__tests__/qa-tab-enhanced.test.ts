import { describe, test, expect } from 'bun:test'

// === Enhanced QA Tab Tests (Story 8-5) ===
// Pure logic tests for new QA tab features — no DOM rendering

// --- Helper functions matching activity-log.tsx ---

function scorePercent(score: number | undefined, max: number | undefined): number {
  if (score == null || max == null || max === 0) return 0
  return Math.round((score / max) * 100)
}

function scoreColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreTextColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// --- Types matching activity-log.tsx ---

type RuleResult = {
  ruleId: string
  ruleName: string
  category: string
  severity: 'critical' | 'major' | 'minor'
  result: 'pass' | 'warn' | 'fail'
  score?: number
  message?: string
  skipped?: boolean
}

type HallucinationReport = {
  claims: Array<{
    claim: { type: string; value: string; context: string; position: number }
    matched: boolean
    verified: boolean
    toolSource?: string
    discrepancy?: string
    confidence: number
    severity: 'critical' | 'minor' | 'none'
  }>
  unsourcedClaims: Array<{ type: string; value: string; context: string }>
  verdict: 'clean' | 'warning' | 'critical'
  score: number
  details: string
  totalClaims: number
  verifiedClaims: number
  mismatchedClaims: number
  unsourcedCount: number
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  major: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  minor: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300',
}

const RESULT_STYLES: Record<string, string> = {
  pass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  fail: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const CATEGORY_LABELS: Record<string, string> = {
  completeness: '완전성',
  accuracy: '정확성',
  safety: '안전성',
}

const SECURITY_ACTION_LABELS: Record<string, string> = {
  'security.input.blocked': '입력 차단',
  'security.output.redacted': '출력 필터링',
  'security.injection.attempt': '인젝션 시도',
}

// === Tests ===

describe('QA Tab Enhanced - Score Visualization', () => {
  test('scorePercent calculates correct percentage', () => {
    expect(scorePercent(8, 10)).toBe(80)
    expect(scorePercent(5, 10)).toBe(50)
    expect(scorePercent(10, 10)).toBe(100)
    expect(scorePercent(0, 10)).toBe(0)
  })

  test('scorePercent handles edge cases', () => {
    expect(scorePercent(undefined, 10)).toBe(0)
    expect(scorePercent(5, undefined)).toBe(0)
    expect(scorePercent(5, 0)).toBe(0)
    expect(scorePercent(undefined, undefined)).toBe(0)
  })

  test('scorePercent rounds correctly', () => {
    expect(scorePercent(7, 9)).toBe(78)
    expect(scorePercent(1, 3)).toBe(33)
    expect(scorePercent(2, 3)).toBe(67)
  })

  test('scoreColor returns green for >= 80%', () => {
    expect(scoreColor(80)).toBe('bg-emerald-500')
    expect(scoreColor(100)).toBe('bg-emerald-500')
    expect(scoreColor(95)).toBe('bg-emerald-500')
  })

  test('scoreColor returns amber for 60-79%', () => {
    expect(scoreColor(60)).toBe('bg-amber-500')
    expect(scoreColor(79)).toBe('bg-amber-500')
    expect(scoreColor(70)).toBe('bg-amber-500')
  })

  test('scoreColor returns red for < 60%', () => {
    expect(scoreColor(59)).toBe('bg-red-500')
    expect(scoreColor(0)).toBe('bg-red-500')
    expect(scoreColor(30)).toBe('bg-red-500')
  })

  test('scoreTextColor matches scoreColor thresholds', () => {
    expect(scoreTextColor(80)).toContain('emerald')
    expect(scoreTextColor(60)).toContain('amber')
    expect(scoreTextColor(59)).toContain('red')
  })
})

describe('QA Tab Enhanced - Severity Styles', () => {
  test('all severity levels have styles', () => {
    expect(SEVERITY_STYLES.critical).toBeDefined()
    expect(SEVERITY_STYLES.major).toBeDefined()
    expect(SEVERITY_STYLES.minor).toBeDefined()
  })

  test('critical severity is red-themed', () => {
    expect(SEVERITY_STYLES.critical).toContain('red')
  })

  test('major severity is amber-themed', () => {
    expect(SEVERITY_STYLES.major).toContain('amber')
  })

  test('minor severity is neutral/zinc-themed', () => {
    expect(SEVERITY_STYLES.minor).toContain('zinc')
  })
})

describe('QA Tab Enhanced - Result Styles', () => {
  test('all result values have styles', () => {
    expect(RESULT_STYLES.pass).toBeDefined()
    expect(RESULT_STYLES.warn).toBeDefined()
    expect(RESULT_STYLES.fail).toBeDefined()
  })

  test('pass result is green', () => {
    expect(RESULT_STYLES.pass).toContain('emerald')
  })

  test('warn result is amber', () => {
    expect(RESULT_STYLES.warn).toContain('amber')
  })

  test('fail result is red', () => {
    expect(RESULT_STYLES.fail).toContain('red')
  })
})

describe('QA Tab Enhanced - Category Labels', () => {
  test('all inspection categories have Korean labels', () => {
    expect(CATEGORY_LABELS.completeness).toBe('완전성')
    expect(CATEGORY_LABELS.accuracy).toBe('정확성')
    expect(CATEGORY_LABELS.safety).toBe('안전성')
  })

  test('has exactly 3 categories', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(3)
  })
})

describe('QA Tab Enhanced - Security Alert Labels', () => {
  test('all security actions have labels', () => {
    expect(SECURITY_ACTION_LABELS['security.input.blocked']).toBe('입력 차단')
    expect(SECURITY_ACTION_LABELS['security.output.redacted']).toBe('출력 필터링')
    expect(SECURITY_ACTION_LABELS['security.injection.attempt']).toBe('인젝션 시도')
  })

  test('has exactly 3 security action types', () => {
    expect(Object.keys(SECURITY_ACTION_LABELS)).toHaveLength(3)
  })
})

describe('QA Tab Enhanced - Rule Results Grouping', () => {
  const sampleRules: RuleResult[] = [
    { ruleId: 'r1', ruleName: '최소 응답 길이', category: 'completeness', severity: 'major', result: 'pass', score: 1 },
    { ruleId: 'r2', ruleName: '출처 포함', category: 'completeness', severity: 'critical', result: 'fail', score: 0, message: '출처 없음' },
    { ruleId: 'r3', ruleName: '환각 탐지', category: 'accuracy', severity: 'critical', result: 'warn', score: 0.5 },
    { ruleId: 'r4', ruleName: '크리덴셜 유출', category: 'safety', severity: 'critical', result: 'pass', score: 1 },
    { ruleId: 'r5', ruleName: '인젝션 패턴', category: 'safety', severity: 'major', result: 'pass', score: 1 },
  ]

  test('groups rules by category', () => {
    const grouped = sampleRules.reduce<Record<string, RuleResult[]>>((acc, r) => {
      const cat = r.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(r)
      return acc
    }, {})

    expect(Object.keys(grouped)).toHaveLength(3)
    expect(grouped.completeness).toHaveLength(2)
    expect(grouped.accuracy).toHaveLength(1)
    expect(grouped.safety).toHaveLength(2)
  })

  test('maintains rule order within groups', () => {
    const grouped = sampleRules.reduce<Record<string, RuleResult[]>>((acc, r) => {
      const cat = r.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(r)
      return acc
    }, {})

    expect(grouped.completeness[0].ruleId).toBe('r1')
    expect(grouped.completeness[1].ruleId).toBe('r2')
  })

  test('handles unknown category as "other"', () => {
    const rules: RuleResult[] = [
      { ruleId: 'x1', ruleName: 'unknown', category: '', severity: 'minor', result: 'pass' },
    ]
    const grouped = rules.reduce<Record<string, RuleResult[]>>((acc, r) => {
      const cat = r.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(r)
      return acc
    }, {})
    expect(grouped.other).toHaveLength(1)
  })
})

describe('QA Tab Enhanced - Hallucination Report Logic', () => {
  const sampleReport: HallucinationReport = {
    claims: [
      { claim: { type: 'number', value: '72,000원', context: '현재가 72,000원', position: 10 }, matched: true, verified: true, toolSource: 'stock_price', confidence: 0.95, severity: 'none' },
      { claim: { type: 'number', value: '15.3%', context: 'ROE 15.3%', position: 50 }, matched: true, verified: false, toolSource: 'financial_data', discrepancy: '실제 ROE는 12.1%', confidence: 0.9, severity: 'critical' },
      { claim: { type: 'date', value: '2025-12-31', context: '결산일 2025-12-31', position: 100 }, matched: false, verified: false, confidence: 0.3, severity: 'minor' },
    ],
    unsourcedClaims: [
      { type: 'statistic', value: '시장 점유율 35%', context: '시장 점유율 35%로 1위' },
    ],
    verdict: 'warning',
    score: 0.67,
    details: '3건 중 1건 검증, 1건 불일치, 1건 미확인',
    totalClaims: 3,
    verifiedClaims: 1,
    mismatchedClaims: 1,
    unsourcedCount: 1,
  }

  test('report totals add up', () => {
    expect(sampleReport.verifiedClaims + sampleReport.mismatchedClaims + sampleReport.unsourcedCount)
      .toBe(sampleReport.totalClaims)
  })

  test('verdict reflects severity', () => {
    expect(['clean', 'warning', 'critical']).toContain(sampleReport.verdict)
  })

  test('score is between 0 and 1', () => {
    expect(sampleReport.score).toBeGreaterThanOrEqual(0)
    expect(sampleReport.score).toBeLessThanOrEqual(1)
  })

  test('scorePercent works with hallucination score', () => {
    const pct = Math.round(sampleReport.score * 100)
    expect(pct).toBe(67)
  })

  test('filter unverified claims for default view', () => {
    const unverified = sampleReport.claims.filter(c => !c.verified || c.severity !== 'none')
    expect(unverified).toHaveLength(2) // mismatched + unsourced
  })

  test('claim verification status mapping', () => {
    const cv = sampleReport.claims[0]
    const status = cv.verified ? '검증' : cv.matched ? '불일치' : '미확인'
    expect(status).toBe('검증')

    const cv2 = sampleReport.claims[1]
    const status2 = cv2.verified ? '검증' : cv2.matched ? '불일치' : '미확인'
    expect(status2).toBe('불일치')

    const cv3 = sampleReport.claims[2]
    const status3 = cv3.verified ? '검증' : cv3.matched ? '불일치' : '미확인'
    expect(status3).toBe('미확인')
  })
})

describe('QA Tab Enhanced - MergedScores Structure', () => {
  test('mergedScores contains legacy + inspection data', () => {
    const scores = {
      // Legacy
      conclusionQuality: 4,
      evidenceSources: 3,
      riskAssessment: 4,
      formatCompliance: 5,
      logicalCoherence: 4,
      // Inspection
      ruleResults: [
        { ruleId: 'r1', ruleName: 'test', category: 'completeness', severity: 'major' as const, result: 'pass' as const },
      ],
      inspectionConclusion: 'pass' as const,
      inspectionScore: 8,
      inspectionMaxScore: 10,
    }

    expect(scores.conclusionQuality).toBe(4)
    expect(scores.ruleResults).toHaveLength(1)
    expect(scores.inspectionScore).toBe(8)
    expect(scores.inspectionMaxScore).toBe(10)
    expect(scorePercent(scores.inspectionScore, scores.inspectionMaxScore)).toBe(80)
  })

  test('handles scores without inspection data (P0 legacy)', () => {
    const scores = {
      conclusionQuality: 4,
      evidenceSources: 3,
      riskAssessment: 4,
      formatCompliance: 5,
      logicalCoherence: 4,
    }

    const hasInspection = 'inspectionScore' in scores
    expect(hasInspection).toBe(false)

    const legacyTotal = scores.conclusionQuality + scores.evidenceSources +
      scores.riskAssessment + scores.formatCompliance + scores.logicalCoherence
    expect(legacyTotal).toBe(20)
  })
})

describe('QA Tab Enhanced - Filter Logic', () => {
  test('conclusion filter values', () => {
    const validFilters = ['', 'pass', 'fail']
    expect(validFilters).toContain('')
    expect(validFilters).toContain('pass')
    expect(validFilters).toContain('fail')
  })

  test('empty conclusion means no filter (all)', () => {
    const filter = ''
    const params = new URLSearchParams({ page: '1', limit: '20' })
    if (filter) params.set('conclusion', filter)
    expect(params.get('conclusion')).toBeNull()
  })

  test('pass filter is sent as query param', () => {
    const filter = 'pass'
    const params = new URLSearchParams({ page: '1', limit: '20' })
    if (filter) params.set('conclusion', filter)
    expect(params.get('conclusion')).toBe('pass')
  })
})

describe('QA Tab Enhanced - Security Alerts API', () => {
  test('security alerts endpoint path', () => {
    const endpoint = '/workspace/activity/security-alerts'
    expect(endpoint).toBe('/workspace/activity/security-alerts')
  })

  test('security alert count24h is separate from items', () => {
    const mockResponse = {
      items: [{ id: '1', action: 'security.input.blocked' }],
      page: 1,
      limit: 20,
      total: 1,
      count24h: 3,
    }
    expect(mockResponse.count24h).toBe(3)
    expect(mockResponse.items).toHaveLength(1)
  })

  test('alert banner shows when count24h > 0', () => {
    const count24h = 5
    const showBanner = count24h > 0
    expect(showBanner).toBe(true)
  })

  test('alert banner hides when count24h is 0', () => {
    const count24h = 0
    const showBanner = count24h > 0
    expect(showBanner).toBe(false)
  })
})

describe('QA Tab Enhanced - Detail Tab Logic', () => {
  test('default detail tab is rules', () => {
    const defaultTab = 'rules'
    expect(defaultTab).toBe('rules')
  })

  test('rubric tab shows only when rubricScores exist', () => {
    const hasRubric = true
    const availableTabs = ['rules', ...(hasRubric ? ['rubric'] : []), 'legacy']
    expect(availableTabs).toContain('rubric')
  })

  test('hallucination tab shows only when report exists', () => {
    const hasHallucination = false
    const availableTabs = ['rules', ...(hasHallucination ? ['hallucination'] : []), 'legacy']
    expect(availableTabs).not.toContain('hallucination')
  })

  test('legacy tab is always available', () => {
    const availableTabs = ['rules', 'legacy']
    expect(availableTabs).toContain('legacy')
  })
})

describe('QA Tab Enhanced - Status Badge Extensions', () => {
  const STATUS_BADGE: Record<string, { label: string; variant: string }> = {
    pass: { label: 'PASS', variant: 'success' },
    fail: { label: 'FAIL', variant: 'error' },
    warning: { label: '경고', variant: 'warning' },
    clean: { label: '정상', variant: 'success' },
    critical: { label: '위험', variant: 'error' },
  }

  test('warning verdict maps to warning badge', () => {
    expect(STATUS_BADGE.warning).toEqual({ label: '경고', variant: 'warning' })
  })

  test('clean verdict maps to success badge', () => {
    expect(STATUS_BADGE.clean).toEqual({ label: '정상', variant: 'success' })
  })

  test('critical verdict maps to error badge', () => {
    expect(STATUS_BADGE.critical).toEqual({ label: '위험', variant: 'error' })
  })
})

describe('QA Tab Enhanced - Rubric Score Display', () => {
  test('rubric score color thresholds', () => {
    const colorFor = (score: number) =>
      score >= 4 ? 'emerald' : score >= 3 ? 'amber' : 'red'

    expect(colorFor(5)).toBe('emerald')
    expect(colorFor(4)).toBe('emerald')
    expect(colorFor(3)).toBe('amber')
    expect(colorFor(2)).toBe('red')
    expect(colorFor(1)).toBe('red')
  })

  test('rubric displays weight and critical flag', () => {
    const rubric = { id: 'Q1', label: '결론 품질', weight: 30, critical: true, score: 4, feedback: '적절' }
    const display = `${rubric.label} (가중치 ${rubric.weight}%${rubric.critical ? ', 필수' : ''})`
    expect(display).toBe('결론 품질 (가중치 30%, 필수)')
  })

  test('non-critical rubric omits flag', () => {
    const rubric = { id: 'Q2', label: '형식', weight: 10, critical: false, score: 3, feedback: '' }
    const display = `${rubric.label} (가중치 ${rubric.weight}%${rubric.critical ? ', 필수' : ''})`
    expect(display).toBe('형식 (가중치 10%)')
  })
})

// === TEA Risk-Based Tests (Gap Coverage) ===

describe('TEA: Score edge cases - negative and overflow', () => {
  test('scorePercent with negative score returns 0 or negative', () => {
    // Negative score should produce a result (no crash)
    const result = scorePercent(-5, 10)
    expect(typeof result).toBe('number')
    expect(result).toBe(-50) // Math.round(-5/10 * 100)
  })

  test('scorePercent with score > max returns > 100', () => {
    const result = scorePercent(15, 10)
    expect(result).toBe(150)
  })

  test('scoreColor handles 0%', () => {
    expect(scoreColor(0)).toBe('bg-red-500')
  })

  test('scoreColor handles exactly 80 boundary', () => {
    expect(scoreColor(80)).toBe('bg-emerald-500')
    expect(scoreColor(79)).toBe('bg-amber-500')
  })

  test('scoreColor handles exactly 60 boundary', () => {
    expect(scoreColor(60)).toBe('bg-amber-500')
    expect(scoreColor(59)).toBe('bg-red-500')
  })

  test('scoreColor handles 100%', () => {
    expect(scoreColor(100)).toBe('bg-emerald-500')
  })

  test('scoreTextColor handles boundary values', () => {
    expect(scoreTextColor(0)).toContain('red')
    expect(scoreTextColor(100)).toContain('emerald')
  })
})

describe('TEA: Empty data arrays - frontend crash prevention', () => {
  test('empty ruleResults groups to empty object', () => {
    const rules: RuleResult[] = []
    const grouped = rules.reduce<Record<string, RuleResult[]>>((acc, r) => {
      const cat = r.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(r)
      return acc
    }, {})
    expect(Object.keys(grouped)).toHaveLength(0)
  })

  test('empty claims array in hallucination report', () => {
    const report: HallucinationReport = {
      claims: [],
      unsourcedClaims: [],
      verdict: 'clean',
      score: 1.0,
      details: '주장 없음',
      totalClaims: 0,
      verifiedClaims: 0,
      mismatchedClaims: 0,
      unsourcedCount: 0,
    }
    expect(report.claims).toHaveLength(0)
    expect(report.verdict).toBe('clean')
    expect(report.score).toBe(1.0)
    const unverified = report.claims.filter(c => !c.verified || c.severity !== 'none')
    expect(unverified).toHaveLength(0)
  })

  test('rubricScores can be undefined (P0-only review)', () => {
    const scores: Record<string, unknown> = { conclusionQuality: 4 }
    const rubrics = (scores.rubricScores as unknown[]) || []
    expect(rubrics).toHaveLength(0)
  })

  test('ruleResults can be undefined (P0-only review)', () => {
    const scores: Record<string, unknown> = { conclusionQuality: 4 }
    const rules = (scores.ruleResults as unknown[]) || []
    expect(rules).toHaveLength(0)
  })
})

describe('TEA: Security alert metadata structure', () => {
  test('alert with full metadata', () => {
    const alert = {
      id: 'uuid-1',
      action: 'security.input.blocked',
      actorType: 'user',
      actorId: 'user-1',
      targetType: null,
      metadata: {
        severity: 'critical',
        pattern: 'ignore previous instructions',
        threatType: 'injection',
        input: 'some blocked text',
      },
      createdAt: '2026-03-08T10:00:00Z',
    }
    expect(alert.metadata.severity).toBe('critical')
    expect(alert.metadata.pattern).toBeDefined()
    expect(alert.metadata.threatType).toBeDefined()
  })

  test('alert with minimal metadata (no pattern)', () => {
    const alert = {
      id: 'uuid-2',
      action: 'security.output.redacted',
      actorType: 'system',
      actorId: 'agent-1',
      targetType: null,
      metadata: { severity: 'high' },
      createdAt: '2026-03-08T11:00:00Z',
    }
    expect(alert.metadata.severity).toBeDefined()
    expect((alert.metadata as Record<string, unknown>).pattern).toBeUndefined()
  })

  test('alert with null metadata', () => {
    const alert = {
      id: 'uuid-3',
      action: 'security.injection.attempt',
      metadata: null,
    }
    const severity = alert.metadata?.severity ?? 'unknown'
    expect(severity).toBe('unknown')
  })
})

describe('TEA: Security action labels coverage', () => {
  test('all 3 actions map to Korean labels', () => {
    const actions = Object.keys(SECURITY_ACTION_LABELS)
    expect(actions).toHaveLength(3)
    for (const action of actions) {
      expect(SECURITY_ACTION_LABELS[action].length).toBeGreaterThan(0)
    }
  })

  test('unknown action returns undefined from labels map', () => {
    expect(SECURITY_ACTION_LABELS['unknown.action']).toBeUndefined()
  })
})

describe('TEA: Conclusion filter integration', () => {
  test('conclusion filter with pass builds correct params', () => {
    const params = new URLSearchParams()
    const conclusion = 'pass'
    if (conclusion) params.set('conclusion', conclusion)
    params.set('page', '1')
    params.set('limit', '20')
    expect(params.toString()).toContain('conclusion=pass')
  })

  test('conclusion filter with fail builds correct params', () => {
    const params = new URLSearchParams()
    const conclusion = 'fail'
    if (conclusion) params.set('conclusion', conclusion)
    expect(params.get('conclusion')).toBe('fail')
  })

  test('empty conclusion filter omits param', () => {
    const params = new URLSearchParams()
    const conclusion = ''
    if (conclusion) params.set('conclusion', conclusion)
    expect(params.has('conclusion')).toBe(false)
  })
})
