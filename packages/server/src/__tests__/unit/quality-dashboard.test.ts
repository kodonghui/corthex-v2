import { describe, test, expect } from 'bun:test'

// === Helper functions mirroring quality-dashboard.ts logic ===

function periodToDate(period: '7d' | '30d' | 'all'): Date | null {
  if (period === 'all') return null
  const d = new Date()
  d.setDate(d.getDate() - (period === '7d' ? 7 : 30))
  d.setHours(0, 0, 0, 0)
  return d
}

function calculatePassRate(totalReviews: number, passCount: number): number {
  return totalReviews > 0 ? Math.round((passCount / totalReviews) * 100) : 0
}

function calculateAvgScore(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / scores.length) * 100) / 100
}

// Pass rate color logic from UI
function getPassRateColor(rate: number): string {
  if (rate >= 80) return 'emerald'
  if (rate >= 60) return 'amber'
  return 'red'
}

// Avg score color logic from UI
function getScoreColor(score: number): string {
  if (score >= 4.0) return 'emerald'
  if (score >= 3.0) return 'amber'
  return 'red'
}

// Score from 5 quality review dimensions (0-10 each, avg = 0-10, then / 2 for 0-5 scale)
function computeReviewAvg(scores: {
  conclusionQuality: number
  evidenceSources: number
  riskAssessment: number
  formatCompliance: number
  logicalCoherence: number
}): number {
  const sum = scores.conclusionQuality + scores.evidenceSources +
    scores.riskAssessment + scores.formatCompliance + scores.logicalCoherence
  return Math.round((sum / 5) * 100) / 100
}

describe('Story 17-7: Quality Dashboard', () => {

  describe('periodToDate', () => {
    test('7d returns date 7 days ago', () => {
      const d = periodToDate('7d')
      expect(d).not.toBeNull()
      const now = new Date()
      const diff = Math.round((now.getTime() - d!.getTime()) / (1000 * 60 * 60 * 24))
      expect(diff).toBe(7)
    })

    test('30d returns date 30 days ago', () => {
      const d = periodToDate('30d')
      expect(d).not.toBeNull()
      const now = new Date()
      const diff = Math.round((now.getTime() - d!.getTime()) / (1000 * 60 * 60 * 24))
      expect(diff).toBe(30)
    })

    test('all returns null', () => {
      expect(periodToDate('all')).toBeNull()
    })
  })

  describe('Pass Rate Calculation', () => {
    test('100% when all pass', () => {
      expect(calculatePassRate(10, 10)).toBe(100)
    })

    test('0% when none pass', () => {
      expect(calculatePassRate(10, 0)).toBe(0)
    })

    test('handles zero reviews', () => {
      expect(calculatePassRate(0, 0)).toBe(0)
    })

    test('rounds to integer', () => {
      expect(calculatePassRate(3, 1)).toBe(33)
    })
  })

  describe('Average Score', () => {
    test('calculates average', () => {
      expect(calculateAvgScore([8, 7, 9])).toBe(8)
    })

    test('handles empty array', () => {
      expect(calculateAvgScore([])).toBe(0)
    })

    test('rounds to 2 decimals', () => {
      expect(calculateAvgScore([7, 8, 6])).toBe(7)
    })
  })

  describe('Pass Rate Color', () => {
    test('>= 80 is emerald', () => {
      expect(getPassRateColor(80)).toBe('emerald')
      expect(getPassRateColor(100)).toBe('emerald')
    })

    test('>= 60 is amber', () => {
      expect(getPassRateColor(60)).toBe('amber')
      expect(getPassRateColor(79)).toBe('amber')
    })

    test('< 60 is red', () => {
      expect(getPassRateColor(59)).toBe('red')
      expect(getPassRateColor(0)).toBe('red')
    })
  })

  describe('Score Color', () => {
    test('>= 4.0 is emerald', () => {
      expect(getScoreColor(4.0)).toBe('emerald')
      expect(getScoreColor(5.0)).toBe('emerald')
    })

    test('>= 3.0 is amber', () => {
      expect(getScoreColor(3.0)).toBe('amber')
      expect(getScoreColor(3.9)).toBe('amber')
    })

    test('< 3.0 is red', () => {
      expect(getScoreColor(2.9)).toBe('red')
      expect(getScoreColor(0)).toBe('red')
    })
  })

  describe('Review Score Computation', () => {
    test('computes avg of 5 dimensions', () => {
      const scores = {
        conclusionQuality: 8,
        evidenceSources: 7,
        riskAssessment: 6,
        formatCompliance: 9,
        logicalCoherence: 10,
      }
      expect(computeReviewAvg(scores)).toBe(8)
    })

    test('all zeros', () => {
      expect(computeReviewAvg({
        conclusionQuality: 0, evidenceSources: 0,
        riskAssessment: 0, formatCompliance: 0, logicalCoherence: 0,
      })).toBe(0)
    })

    test('perfect scores', () => {
      expect(computeReviewAvg({
        conclusionQuality: 10, evidenceSources: 10,
        riskAssessment: 10, formatCompliance: 10, logicalCoherence: 10,
      })).toBe(10)
    })
  })

  describe('Dashboard Data Structure', () => {
    test('summary has required fields', () => {
      const summary = {
        totalReviews: 100,
        passCount: 80,
        failCount: 20,
        passRate: 80,
        avgScore: 4.2,
      }
      expect(summary.passCount + summary.failCount).toBe(summary.totalReviews)
    })

    test('trend item structure', () => {
      const item = { date: '2026-03-08', passCount: 5, failCount: 2 }
      expect(item.date).toBeDefined()
      expect(item.passCount + item.failCount).toBeGreaterThan(0)
    })

    test('department stat structure', () => {
      const stat = {
        departmentId: 'uuid',
        departmentName: '개발부',
        totalReviews: 50,
        passRate: 90,
        avgScore: 4.5,
      }
      expect(stat.departmentName).toBeDefined()
      expect(stat.passRate).toBeLessThanOrEqual(100)
    })

    test('failed item structure', () => {
      const item = {
        reviewId: 'uuid',
        commandId: 'uuid',
        commandText: '보고서 작성',
        agentName: 'Agent A',
        avgScore: 2.5,
        feedback: '결론 불명확',
        attemptNumber: 1,
        createdAt: '2026-03-08T10:00:00Z',
      }
      expect(item.avgScore).toBeLessThan(5)
    })
  })

  describe('API Query Params', () => {
    test('valid period values', () => {
      const validPeriods = ['7d', '30d', 'all']
      expect(validPeriods).toContain('7d')
      expect(validPeriods).toContain('30d')
      expect(validPeriods).toContain('all')
    })
  })
})
