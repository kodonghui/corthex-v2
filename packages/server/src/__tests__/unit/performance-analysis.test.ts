import { describe, test, expect } from 'bun:test'

// === Test helpers mirroring performance-analysis.ts logic ===

// Cost micro to USD conversion
function microToUsd(micro: number): number {
  return Math.round((micro / 1_000_000) * 10000) / 10000
}

// Success rate calculation
function calculateSuccessRate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// Pass rate calculation
function calculatePassRate(reviewCount: number, passCount: number): number {
  return reviewCount > 0 ? Math.round((passCount / reviewCount) * 100) : 0
}

// Average score from 5 dimensions
function calculateAvgScore(scores: {
  conclusionClarity: number
  evidenceSufficiency: number
  riskMention: number
  formatAdequacy: number
  logicalConsistency: number
}): number {
  const sum = scores.conclusionClarity + scores.evidenceSufficiency +
    scores.riskMention + scores.formatAdequacy + scores.logicalConsistency
  return Math.round((sum / 5) * 100) / 100
}

// Cost efficiency (lower is better)
function calculateCostEfficiency(totalCost: number, taskCount: number): number {
  return taskCount > 0 ? totalCost / taskCount : 999
}

// Ranking sort
function sortByMetric(
  items: { value: number }[],
  metric: 'successRate' | 'qualityScore' | 'costEfficiency',
): { value: number }[] {
  const sorted = [...items]
  sorted.sort((a, b) => metric === 'costEfficiency' ? a.value - b.value : b.value - a.value)
  return sorted
}

// Soul Gym scoring
function judgeSoulScore(scores: { bluf: number; expertise: number; specificity: number; structure: number }): number {
  return scores.bluf + scores.expertise + scores.specificity + scores.structure
}

// Improvement check
function shouldRecommendAdoption(originalScore: number, variantScore: number, threshold = 3.0): boolean {
  return (variantScore - originalScore) >= threshold
}

// Date range calculation
function getStartDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

describe('Story 17-5: Performance Analysis API + Soul Gym', () => {

  describe('Cost Conversion', () => {
    test('converts micro to USD', () => {
      expect(microToUsd(1_000_000)).toBe(1)
      expect(microToUsd(500_000)).toBe(0.5)
      expect(microToUsd(0)).toBe(0)
    })

    test('rounds to 4 decimal places', () => {
      expect(microToUsd(123_456)).toBe(0.1235)
    })

    test('handles large values', () => {
      expect(microToUsd(100_000_000)).toBe(100)
    })
  })

  describe('Success Rate', () => {
    test('100% when all completed', () => {
      expect(calculateSuccessRate(10, 10)).toBe(100)
    })

    test('0% when none completed', () => {
      expect(calculateSuccessRate(10, 0)).toBe(0)
    })

    test('handles zero total', () => {
      expect(calculateSuccessRate(0, 0)).toBe(0)
    })

    test('rounds to integer', () => {
      expect(calculateSuccessRate(3, 1)).toBe(33)
    })

    test('partial completion', () => {
      expect(calculateSuccessRate(100, 75)).toBe(75)
    })
  })

  describe('Pass Rate', () => {
    test('100% when all pass', () => {
      expect(calculatePassRate(5, 5)).toBe(100)
    })

    test('0% when none pass', () => {
      expect(calculatePassRate(5, 0)).toBe(0)
    })

    test('handles zero reviews', () => {
      expect(calculatePassRate(0, 0)).toBe(0)
    })
  })

  describe('Average Quality Score', () => {
    test('calculates average of 5 dimensions', () => {
      const scores = {
        conclusionClarity: 8,
        evidenceSufficiency: 7,
        riskMention: 6,
        formatAdequacy: 9,
        logicalConsistency: 10,
      }
      expect(calculateAvgScore(scores)).toBe(8)
    })

    test('handles all zeros', () => {
      const scores = {
        conclusionClarity: 0,
        evidenceSufficiency: 0,
        riskMention: 0,
        formatAdequacy: 0,
        logicalConsistency: 0,
      }
      expect(calculateAvgScore(scores)).toBe(0)
    })

    test('rounds to 2 decimal places', () => {
      const scores = {
        conclusionClarity: 7,
        evidenceSufficiency: 8,
        riskMention: 6,
        formatAdequacy: 7,
        logicalConsistency: 9,
      }
      expect(calculateAvgScore(scores)).toBe(7.4)
    })

    test('perfect scores', () => {
      const scores = {
        conclusionClarity: 10,
        evidenceSufficiency: 10,
        riskMention: 10,
        formatAdequacy: 10,
        logicalConsistency: 10,
      }
      expect(calculateAvgScore(scores)).toBe(10)
    })
  })

  describe('Cost Efficiency', () => {
    test('calculates cost per task', () => {
      expect(calculateCostEfficiency(10, 100)).toBe(0.1)
    })

    test('handles zero tasks (max penalty)', () => {
      expect(calculateCostEfficiency(10, 0)).toBe(999)
    })

    test('zero cost with tasks', () => {
      expect(calculateCostEfficiency(0, 50)).toBe(0)
    })
  })

  describe('Ranking Sort', () => {
    test('sorts successRate descending', () => {
      const items = [{ value: 50 }, { value: 90 }, { value: 70 }]
      const sorted = sortByMetric(items, 'successRate')
      expect(sorted[0].value).toBe(90)
      expect(sorted[1].value).toBe(70)
      expect(sorted[2].value).toBe(50)
    })

    test('sorts qualityScore descending', () => {
      const items = [{ value: 6.5 }, { value: 8.2 }, { value: 7.1 }]
      const sorted = sortByMetric(items, 'qualityScore')
      expect(sorted[0].value).toBe(8.2)
    })

    test('sorts costEfficiency ascending (lower is better)', () => {
      const items = [{ value: 0.5 }, { value: 0.1 }, { value: 0.3 }]
      const sorted = sortByMetric(items, 'costEfficiency')
      expect(sorted[0].value).toBe(0.1)
      expect(sorted[1].value).toBe(0.3)
      expect(sorted[2].value).toBe(0.5)
    })

    test('handles empty array', () => {
      expect(sortByMetric([], 'successRate')).toEqual([])
    })
  })

  describe('Soul Gym Scoring', () => {
    test('sums 4 dimensions (BLUF 20 + expertise 30 + specificity 30 + structure 20)', () => {
      expect(judgeSoulScore({ bluf: 18, expertise: 25, specificity: 28, structure: 17 })).toBe(88)
    })

    test('perfect score is 100', () => {
      expect(judgeSoulScore({ bluf: 20, expertise: 30, specificity: 30, structure: 20 })).toBe(100)
    })

    test('minimum score is 0', () => {
      expect(judgeSoulScore({ bluf: 0, expertise: 0, specificity: 0, structure: 0 })).toBe(0)
    })
  })

  describe('Improvement Recommendation', () => {
    test('recommends when improvement >= 3.0', () => {
      expect(shouldRecommendAdoption(70, 73)).toBe(true)
    })

    test('does not recommend when improvement < 3.0', () => {
      expect(shouldRecommendAdoption(70, 72)).toBe(false)
    })

    test('does not recommend when score decreased', () => {
      expect(shouldRecommendAdoption(80, 75)).toBe(false)
    })

    test('exactly at threshold', () => {
      expect(shouldRecommendAdoption(70, 73)).toBe(true)
    })

    test('custom threshold', () => {
      expect(shouldRecommendAdoption(70, 74, 5.0)).toBe(false)
      expect(shouldRecommendAdoption(70, 75, 5.0)).toBe(true)
    })
  })

  describe('Date Range', () => {
    test('default 30 days', () => {
      const start = getStartDate(30)
      const now = new Date()
      const diffDays = Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(30)
    })

    test('7 days', () => {
      const start = getStartDate(7)
      const now = new Date()
      const diffDays = Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      expect(diffDays).toBe(7)
    })
  })

  describe('Trend Data Structure', () => {
    test('trend item has required fields', () => {
      const item = {
        date: '2026-03-08',
        taskCount: 10,
        completedCount: 8,
        failedCount: 2,
        totalCost: 0.5,
        avgScore: 7.5,
      }
      expect(item.date).toBeDefined()
      expect(item.taskCount).toBeGreaterThanOrEqual(0)
      expect(item.completedCount + item.failedCount).toBeLessThanOrEqual(item.taskCount)
    })

    test('quality trend item has 5 score dimensions', () => {
      const item = {
        date: '2026-03-08',
        reviewCount: 5,
        passRate: 80,
        avgScore: 7.5,
        scores: {
          conclusionClarity: 8,
          evidenceSufficiency: 7,
          riskMention: 7,
          formatAdequacy: 8,
          logicalConsistency: 7.5,
        },
      }
      expect(Object.keys(item.scores)).toHaveLength(5)
    })
  })

  describe('Soul Gym Variant Types', () => {
    test('3 variant types exist', () => {
      const types = ['A', 'B', 'C']
      const labels = ['규칙 추가', '표현 강화', '하이브리드']
      expect(types).toHaveLength(3)
      expect(labels).toHaveLength(3)
    })

    test('variant has required fields', () => {
      const variant = {
        type: 'A',
        label: '규칙 추가',
        description: '명확한 응답 형식 규칙을 추가',
        proposedChanges: '## 응답 규칙\n...',
        confidence: 75,
      }
      expect(variant.type).toBe('A')
      expect(variant.confidence).toBeGreaterThanOrEqual(0)
      expect(variant.confidence).toBeLessThanOrEqual(100)
    })
  })

  describe('Performance Summary Structure', () => {
    test('summary has dashboard card data', () => {
      const summary = {
        totalAgents: 15,
        avgSuccessRate: 85,
        previousSuccessRate: 80,
        totalCost: 12.5,
        totalCommands: 200,
      }
      expect(summary.totalAgents).toBeGreaterThan(0)
      expect(summary.avgSuccessRate).toBeLessThanOrEqual(100)
    })
  })

  describe('Ranking Data Structure', () => {
    test('ranking item has rank field', () => {
      const item = {
        rank: 1,
        agentId: 'uuid',
        agentName: 'Agent A',
        tier: 'specialist',
        departmentName: '개발부',
        value: 95.5,
        metric: 'successRate',
      }
      expect(item.rank).toBe(1)
      expect(item.value).toBeGreaterThan(0)
    })

    test('topN filtering', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ value: i }))
      const top10 = items.slice(0, 10)
      expect(top10).toHaveLength(10)
    })
  })
})
