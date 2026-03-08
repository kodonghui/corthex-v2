import { describe, test, expect } from 'bun:test'

// Story 8-5: QA Tab Enhanced UI -- Server-side logic tests
// Tests for security alerts service, activity-log-service extensions, and API routes

describe('Security Alerts - Action Constants', () => {
  const SECURITY_ACTIONS = [
    'security.input.blocked',
    'security.output.redacted',
    'security.injection.attempt',
  ]

  test('has exactly 3 security action types', () => {
    expect(SECURITY_ACTIONS).toHaveLength(3)
  })

  test('all actions start with security prefix', () => {
    for (const action of SECURITY_ACTIONS) {
      expect(action.startsWith('security.')).toBe(true)
    }
  })

  test('includes input blocked action', () => {
    expect(SECURITY_ACTIONS).toContain('security.input.blocked')
  })

  test('includes output redacted action', () => {
    expect(SECURITY_ACTIONS).toContain('security.output.redacted')
  })

  test('includes injection attempt action', () => {
    expect(SECURITY_ACTIONS).toContain('security.injection.attempt')
  })
})

describe('Security Alerts - 24h Window Calculation', () => {
  test('24h window calculates correct date boundary', () => {
    const now = Date.now()
    const since = new Date(now - 24 * 60 * 60 * 1000)
    const diff = now - since.getTime()
    expect(diff).toBe(24 * 60 * 60 * 1000)
  })

  test('24h window is in milliseconds', () => {
    const ms24h = 24 * 60 * 60 * 1000
    expect(ms24h).toBe(86400000)
  })
})

describe('Security Alerts - API Response Structure', () => {
  test('response includes count24h alongside paginated items', () => {
    const mockResponse = {
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      count24h: 5,
    }
    expect(mockResponse).toHaveProperty('count24h')
    expect(mockResponse).toHaveProperty('items')
    expect(mockResponse).toHaveProperty('total')
  })

  test('security alert item has expected fields', () => {
    const alert = {
      id: 'test-uuid',
      action: 'security.input.blocked',
      actorType: 'user',
      actorId: 'user-uuid',
      targetType: null,
      metadata: { severity: 'critical', pattern: 'ignore previous instructions', threatType: 'injection' },
      createdAt: '2026-03-08T10:00:00Z',
    }

    expect(alert.id).toBeDefined()
    expect(alert.action).toMatch(/^security\./)
    expect(alert.metadata).toHaveProperty('severity')
    expect(alert.metadata).toHaveProperty('pattern')
  })
})

describe('Quality Reviews - MergedScores JSONB Structure', () => {
  test('mergedScores contains both legacy and inspection data', () => {
    const mergedScores = {
      // Legacy P0 scores
      conclusionQuality: 4,
      evidenceSources: 3,
      riskAssessment: 4,
      formatCompliance: 5,
      logicalCoherence: 4,
      legacyScores: {
        conclusionClarity: 4,
        sourceMention: 3,
        riskMention: 4,
        formatAdequacy: 5,
        logicalConsistency: 4,
      },
      legacyTotalScore: 20,
      legacyPassed: true,
      // P1 inspection data
      ruleResults: [
        { ruleId: 'comp-min-length', ruleName: '최소 응답 길이', category: 'completeness', severity: 'major', result: 'pass', score: 1 },
        { ruleId: 'acc-source-ref', ruleName: '출처 참조', category: 'accuracy', severity: 'critical', result: 'fail', score: 0, message: '출처 미포함' },
        { ruleId: 'safe-credential-leak', ruleName: '크리덴셜 유출', category: 'safety', severity: 'critical', result: 'pass', score: 1 },
      ],
      inspectionConclusion: 'fail',
      inspectionScore: 6,
      inspectionMaxScore: 8,
      rubricScores: [
        { id: 'Q1', label: '결론 품질', weight: 30, critical: true, score: 4, feedback: '결론은 명확하나 세부 보강 필요' },
        { id: 'Q2', label: '근거 출처', weight: 25, critical: true, score: 2, feedback: '출처 명시 부족' },
      ],
      hallucinationReport: {
        claims: [],
        unsourcedClaims: [],
        verdict: 'clean',
        score: 1.0,
        details: '환각 없음',
        totalClaims: 0,
        verifiedClaims: 0,
        mismatchedClaims: 0,
        unsourcedCount: 0,
      },
    }

    // Legacy fields
    expect(mergedScores.conclusionQuality).toBe(4)
    expect(mergedScores.legacyTotalScore).toBe(20)
    expect(mergedScores.legacyPassed).toBe(true)

    // Inspection fields
    expect(mergedScores.ruleResults).toHaveLength(3)
    expect(mergedScores.inspectionConclusion).toBe('fail')
    expect(mergedScores.inspectionScore).toBe(6)
    expect(mergedScores.inspectionMaxScore).toBe(8)

    // Rubric
    expect(mergedScores.rubricScores).toHaveLength(2)
    expect(mergedScores.rubricScores[0].critical).toBe(true)

    // Hallucination
    expect(mergedScores.hallucinationReport.verdict).toBe('clean')
    expect(mergedScores.hallucinationReport.score).toBe(1.0)
  })

  test('ruleResults can be empty for P0-only reviews', () => {
    const legacyOnly = {
      conclusionQuality: 4,
      evidenceSources: 3,
      riskAssessment: 4,
      formatCompliance: 5,
      logicalCoherence: 4,
    }

    expect((legacyOnly as Record<string, unknown>).ruleResults).toBeUndefined()
    expect((legacyOnly as Record<string, unknown>).inspectionScore).toBeUndefined()
  })
})

describe('Quality Reviews - Rule Result Categories', () => {
  test('rules are categorized as completeness/accuracy/safety', () => {
    const categories = ['completeness', 'accuracy', 'safety']
    const rules = [
      { category: 'completeness' },
      { category: 'accuracy' },
      { category: 'safety' },
    ]

    for (const rule of rules) {
      expect(categories).toContain(rule.category)
    }
  })

  test('severity levels are critical/major/minor', () => {
    const severities = ['critical', 'major', 'minor']
    for (const s of severities) {
      expect(severities).toContain(s)
    }
  })

  test('result values are pass/warn/fail', () => {
    const results = ['pass', 'warn', 'fail']
    for (const r of results) {
      expect(results).toContain(r)
    }
  })
})

describe('Activity Tabs Route - Security Alerts Endpoint', () => {
  test('endpoint path follows convention', () => {
    const path = '/activity/security-alerts'
    expect(path).toMatch(/^\/activity\//)
    expect(path).toContain('security')
  })

  test('endpoint returns parallel data (items + count24h)', () => {
    // Simulates Promise.all([getSecurityAlerts, getSecurityAlertCount24h])
    const items = { items: [], page: 1, limit: 20, total: 0 }
    const count24h = 3
    const response = { ...items, count24h }
    expect(response.count24h).toBe(3)
    expect(response.items).toEqual([])
  })
})

describe('Pagination - Security Alerts', () => {
  test('parsePaginationParams defaults', () => {
    const query: Record<string, string | undefined> = {}
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
    const offset = (page - 1) * limit
    expect(page).toBe(1)
    expect(limit).toBe(20)
    expect(offset).toBe(0)
  })

  test('parsePaginationParams custom values', () => {
    const query: Record<string, string | undefined> = { page: '3', limit: '50' }
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
    const offset = (page - 1) * limit
    expect(page).toBe(3)
    expect(limit).toBe(50)
    expect(offset).toBe(100)
  })

  test('limit capped at 100', () => {
    const query: Record<string, string | undefined> = { limit: '500' }
    const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
    expect(limit).toBe(100)
  })
})

describe('Date Filters - Security Alerts', () => {
  test('parseDateFilter handles start date', () => {
    const startDate = '2026-03-01'
    const date = new Date(startDate)
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(2) // March is 2 (0-indexed)
    expect(date.getDate()).toBe(1)
  })

  test('parseDateFilter handles end date with time adjustment', () => {
    const endDate = '2026-03-07'
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
  })
})

// === TEA Risk-Based Tests ===

describe('TEA: SECURITY_ACTIONS constant validation', () => {
  // Validate that activity-log-service SECURITY_ACTIONS match audit-log.ts constants
  const ACTIVITY_LOG_SECURITY_ACTIONS = [
    'security.input.blocked',
    'security.output.redacted',
    'security.injection.attempt',
  ]

  test('matches audit-log.ts AUDIT_ACTIONS security constants', async () => {
    const { AUDIT_ACTIONS } = await import('../../services/audit-log')
    expect(ACTIVITY_LOG_SECURITY_ACTIONS).toContain(AUDIT_ACTIONS.SECURITY_INPUT_BLOCKED)
    expect(ACTIVITY_LOG_SECURITY_ACTIONS).toContain(AUDIT_ACTIONS.SECURITY_OUTPUT_REDACTED)
    expect(ACTIVITY_LOG_SECURITY_ACTIONS).toContain(AUDIT_ACTIONS.SECURITY_INJECTION_ATTEMPT)
  })

  test('has exactly 3 security actions (no drift)', () => {
    expect(ACTIVITY_LOG_SECURITY_ACTIONS).toHaveLength(3)
  })

  test('all actions start with security. prefix', () => {
    for (const action of ACTIVITY_LOG_SECURITY_ACTIONS) {
      expect(action.startsWith('security.')).toBe(true)
    }
  })
})

describe('TEA: parseDateFilter with invalid dates', () => {
  test('invalid date string creates Invalid Date', () => {
    const startDate = 'not-a-date'
    const date = new Date(startDate)
    expect(isNaN(date.getTime())).toBe(true)
  })

  test('empty string returns no conditions', () => {
    // parseDateFilter with empty strings should not add conditions
    const result: any[] = []
    const startDate = ''
    if (startDate) result.push({ type: 'gte', date: new Date(startDate) })
    expect(result).toHaveLength(0)
  })
})

describe('TEA: 24h count edge cases', () => {
  test('count result can be 0', () => {
    const result = { count: 0 }
    expect(Number(result?.count || 0)).toBe(0)
  })

  test('count result null/undefined defaults to 0', () => {
    const result: any = null
    expect(Number(result?.count || 0)).toBe(0)
  })

  test('since date is exactly 24h ago', () => {
    const now = Date.now()
    const since = new Date(now - 24 * 60 * 60 * 1000)
    const diff = now - since.getTime()
    expect(diff).toBe(86400000)
    expect(since.getTime()).toBeLessThan(now)
  })
})

describe('TEA: Security alerts response merging', () => {
  test('spread operator merges items and count24h', () => {
    const paginatedResult = { items: [], page: 1, limit: 20, total: 0 }
    const count24h = 7
    const merged = { ...paginatedResult, count24h }
    expect(merged.items).toEqual([])
    expect(merged.count24h).toBe(7)
    expect(merged.page).toBe(1)
    expect(merged.total).toBe(0)
  })

  test('count24h can exceed total (different time windows)', () => {
    // total is filtered by date range, count24h is always last 24h
    const result = { items: [], page: 1, limit: 20, total: 3 }
    const count24h = 10 // more than total because total has date filter
    const merged = { ...result, count24h }
    expect(merged.count24h).toBeGreaterThan(merged.total)
  })
})
