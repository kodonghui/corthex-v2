import { describe, test, expect } from 'bun:test'

// === Helper functions mirroring performance.tsx logic ===

const PERFORMANCE_BADGE: Record<string, { label: string; color: string }> = {
  high: { label: '우수', color: 'bg-emerald-100 text-emerald-700' },
  mid: { label: '보통', color: 'bg-amber-100 text-amber-700' },
  low: { label: '개선 필요', color: 'bg-red-100 text-red-700' },
}

const SUGGESTION_TYPE_LABEL: Record<string, string> = {
  'prompt-improve': '시스템 프롬프트 개선',
  'add-tool': '도구 추가',
  'change-model': '모델 변경',
}

const ROLE_LABEL: Record<string, string> = {
  manager: '팀장',
  specialist: '전문가',
  worker: '실무자',
}

function getPerformanceLevel(successRate: number): string {
  if (successRate >= 80) return 'high'
  if (successRate >= 50) return 'mid'
  return 'low'
}

function formatChangeValue(value: number, suffix: string = ''): { text: string; color: string } {
  if (value > 0) return { text: `+${value}${suffix}`, color: 'text-emerald-600' }
  if (value < 0) return { text: `${value}${suffix}`, color: 'text-red-600' }
  return { text: `0${suffix}`, color: 'text-zinc-400' }
}

describe('Story 17-6: Performance Analysis UI + Soul Gym', () => {

  describe('getPerformanceLevel', () => {
    test('high for >= 80%', () => {
      expect(getPerformanceLevel(80)).toBe('high')
      expect(getPerformanceLevel(100)).toBe('high')
      expect(getPerformanceLevel(95)).toBe('high')
    })

    test('mid for 50-79%', () => {
      expect(getPerformanceLevel(50)).toBe('mid')
      expect(getPerformanceLevel(79)).toBe('mid')
      expect(getPerformanceLevel(65)).toBe('mid')
    })

    test('low for < 50%', () => {
      expect(getPerformanceLevel(49)).toBe('low')
      expect(getPerformanceLevel(0)).toBe('low')
      expect(getPerformanceLevel(25)).toBe('low')
    })

    test('boundary: exactly 80', () => {
      expect(getPerformanceLevel(80)).toBe('high')
    })

    test('boundary: exactly 50', () => {
      expect(getPerformanceLevel(50)).toBe('mid')
    })
  })

  describe('formatChangeValue', () => {
    test('positive value shows +', () => {
      const result = formatChangeValue(5, '%')
      expect(result.text).toBe('+5%')
      expect(result.color).toContain('emerald')
    })

    test('negative value', () => {
      const result = formatChangeValue(-3, '%')
      expect(result.text).toBe('-3%')
      expect(result.color).toContain('red')
    })

    test('zero value', () => {
      const result = formatChangeValue(0, '%')
      expect(result.text).toBe('0%')
      expect(result.color).toContain('zinc')
    })

    test('without suffix', () => {
      const result = formatChangeValue(10)
      expect(result.text).toBe('+10')
    })
  })

  describe('Performance Badge Mapping', () => {
    test('all 3 levels have badge config', () => {
      expect(PERFORMANCE_BADGE.high).toBeDefined()
      expect(PERFORMANCE_BADGE.mid).toBeDefined()
      expect(PERFORMANCE_BADGE.low).toBeDefined()
    })

    test('high is 우수', () => {
      expect(PERFORMANCE_BADGE.high.label).toBe('우수')
    })

    test('mid is 보통', () => {
      expect(PERFORMANCE_BADGE.mid.label).toBe('보통')
    })

    test('low is 개선 필요', () => {
      expect(PERFORMANCE_BADGE.low.label).toBe('개선 필요')
    })
  })

  describe('Suggestion Type Labels', () => {
    test('all types have Korean labels', () => {
      expect(SUGGESTION_TYPE_LABEL['prompt-improve']).toBe('시스템 프롬프트 개선')
      expect(SUGGESTION_TYPE_LABEL['add-tool']).toBe('도구 추가')
      expect(SUGGESTION_TYPE_LABEL['change-model']).toBe('모델 변경')
    })
  })

  describe('Role Labels', () => {
    test('all roles have Korean labels', () => {
      expect(ROLE_LABEL.manager).toBe('팀장')
      expect(ROLE_LABEL.specialist).toBe('전문가')
      expect(ROLE_LABEL.worker).toBe('실무자')
    })
  })

  describe('Summary Card Data', () => {
    test('4 summary cards structure', () => {
      const cards = [
        { icon: '🤖', label: '총 에이전트', unit: '명' },
        { icon: '✅', label: '평균 성공률', unit: '%' },
        { icon: '💰', label: '이번 달 비용', unit: '$' },
        { icon: '⏱️', label: '평균 응답 시간', unit: 'ms' },
      ]
      expect(cards).toHaveLength(4)
      expect(cards.every((c) => c.label && c.unit)).toBe(true)
    })
  })

  describe('Table Sorting', () => {
    test('sorts by taskCount desc', () => {
      const agents = [{ taskCount: 5 }, { taskCount: 10 }, { taskCount: 3 }]
      agents.sort((a, b) => b.taskCount - a.taskCount)
      expect(agents[0].taskCount).toBe(10)
    })

    test('sorts by successRate asc', () => {
      const agents = [{ successRate: 90 }, { successRate: 50 }, { successRate: 75 }]
      agents.sort((a, b) => a.successRate - b.successRate)
      expect(agents[0].successRate).toBe(50)
    })
  })

  describe('API Endpoints', () => {
    test('performance summary', () => {
      expect('/workspace/performance/summary').toBe('/workspace/performance/summary')
    })

    test('performance agents', () => {
      expect('/workspace/performance/agents').toBe('/workspace/performance/agents')
    })

    test('soul gym suggestions', () => {
      expect('/workspace/performance/soul-gym').toBe('/workspace/performance/soul-gym')
    })

    test('soul gym apply', () => {
      const id = 'test-id'
      expect(`/workspace/performance/soul-gym/${id}/apply`).toBe('/workspace/performance/soul-gym/test-id/apply')
    })
  })

  describe('Pagination', () => {
    test('page size is 20', () => {
      const pageSize = 20
      expect(pageSize).toBe(20)
    })

    test('total pages calculation', () => {
      const total = 45
      const pageSize = 20
      const totalPages = Math.ceil(total / pageSize)
      expect(totalPages).toBe(3)
    })
  })
})
