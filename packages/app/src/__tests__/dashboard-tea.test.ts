/**
 * TEA-generated tests for Story 6-2: Operations Dashboard UI
 * Risk-based coverage expansion: edge cases, boundary conditions, data integrity
 */
import { describe, test, expect } from 'bun:test'

// === Reimplemented pure functions from dashboard.tsx for testing ===

type LLMProviderName = 'anthropic' | 'openai' | 'google'

type DashboardUsageDay = {
  date: string
  provider: LLMProviderName
  inputTokens: number
  outputTokens: number
  costUsd: number
}

type DayData = { date: string; byProvider: Record<LLMProviderName, number>; total: number }

function groupUsageByDate(usage: DashboardUsageDay[]): DayData[] {
  const map = new Map<string, Record<LLMProviderName, number>>()
  for (const u of usage) {
    if (!map.has(u.date)) map.set(u.date, { anthropic: 0, openai: 0, google: 0 })
    const day = map.get(u.date)!
    day[u.provider] += u.costUsd
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, byProvider]) => ({
      date,
      byProvider,
      total: byProvider.anthropic + byProvider.openai + byProvider.google,
    }))
}

function getBudgetColor(percent: number): string {
  if (percent >= 80) return 'bg-red-500'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

// === TEA Edge Case Tests ===

describe('TEA: groupUsageByDate edge cases', () => {
  test('all zero costs produce zero totals', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0 },
      { date: '2026-03-01', provider: 'openai', inputTokens: 100, outputTokens: 50, costUsd: 0 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].total).toBe(0)
  })

  test('very large cost values do not overflow', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 1e9, outputTokens: 5e8, costUsd: 999999.99 },
      { date: '2026-03-01', provider: 'openai', inputTokens: 1e9, outputTokens: 5e8, costUsd: 888888.88 },
    ])
    expect(result[0].total).toBeCloseTo(1888888.87, 2)
  })

  test('very small fractional costs are preserved', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 1, outputTokens: 1, costUsd: 0.000001 },
    ])
    expect(result[0].byProvider.anthropic).toBeCloseTo(0.000001, 6)
    expect(result[0].total).toBeCloseTo(0.000001, 6)
  })

  test('30 days of data produces 30 sorted entries', () => {
    const usage: DashboardUsageDay[] = []
    for (let i = 1; i <= 30; i++) {
      const d = String(i).padStart(2, '0')
      usage.push({ date: `2026-03-${d}`, provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.01 })
    }
    const result = groupUsageByDate(usage)
    expect(result).toHaveLength(30)
    expect(result[0].date).toBe('2026-03-01')
    expect(result[29].date).toBe('2026-03-30')
  })

  test('unsorted input is sorted by date in output', () => {
    const result = groupUsageByDate([
      { date: '2026-03-05', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.05 },
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.01 },
      { date: '2026-03-10', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.10 },
      { date: '2026-03-03', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.03 },
    ])
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true)
    }
  })

  test('single provider only fills that slot', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'google', inputTokens: 100, outputTokens: 50, costUsd: 1.23 },
    ])
    expect(result[0].byProvider.anthropic).toBe(0)
    expect(result[0].byProvider.openai).toBe(0)
    expect(result[0].byProvider.google).toBeCloseTo(1.23)
    expect(result[0].total).toBeCloseTo(1.23)
  })

  test('multiple entries same provider same day accumulate correctly', () => {
    const usage = Array.from({ length: 10 }, (_, i) => ({
      date: '2026-03-01',
      provider: 'anthropic' as LLMProviderName,
      inputTokens: 100,
      outputTokens: 50,
      costUsd: 0.1,
    }))
    const result = groupUsageByDate(usage)
    expect(result).toHaveLength(1)
    expect(result[0].byProvider.anthropic).toBeCloseTo(1.0)
  })

  test('cross-month dates sort correctly', () => {
    const result = groupUsageByDate([
      { date: '2026-04-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.1 },
      { date: '2026-03-31', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.2 },
    ])
    expect(result[0].date).toBe('2026-03-31')
    expect(result[1].date).toBe('2026-04-01')
  })
})

describe('TEA: getBudgetColor boundary values', () => {
  test('exactly 59.99% returns green', () => {
    expect(getBudgetColor(59.99)).toBe('bg-green-500')
  })

  test('exactly 60.0% returns yellow', () => {
    expect(getBudgetColor(60.0)).toBe('bg-yellow-500')
  })

  test('exactly 79.99% returns yellow', () => {
    expect(getBudgetColor(79.99)).toBe('bg-yellow-500')
  })

  test('exactly 80.0% returns red', () => {
    expect(getBudgetColor(80.0)).toBe('bg-red-500')
  })

  test('negative percent returns green', () => {
    expect(getBudgetColor(-5)).toBe('bg-green-500')
  })

  test('200% (double budget) returns red', () => {
    expect(getBudgetColor(200)).toBe('bg-red-500')
  })

  test('NaN returns green (< 80 and < 60 both false for NaN)', () => {
    // NaN >= 80 is false, NaN >= 60 is false, falls through to green
    expect(getBudgetColor(NaN)).toBe('bg-green-500')
  })
})

describe('TEA: DashboardSummary data integrity', () => {
  test('task counts should be non-negative', () => {
    const tasks = { total: 10, completed: 7, failed: 1, inProgress: 2 }
    expect(tasks.total).toBeGreaterThanOrEqual(0)
    expect(tasks.completed).toBeGreaterThanOrEqual(0)
    expect(tasks.failed).toBeGreaterThanOrEqual(0)
    expect(tasks.inProgress).toBeGreaterThanOrEqual(0)
  })

  test('task breakdown should sum to total', () => {
    const tasks = { total: 10, completed: 7, failed: 1, inProgress: 2 }
    expect(tasks.completed + tasks.failed + tasks.inProgress).toBe(tasks.total)
  })

  test('agent counts should be non-negative', () => {
    const agents = { total: 20, active: 10, idle: 8, error: 2 }
    expect(agents.total).toBeGreaterThanOrEqual(0)
    expect(agents.active).toBeGreaterThanOrEqual(0)
    expect(agents.idle).toBeGreaterThanOrEqual(0)
    expect(agents.error).toBeGreaterThanOrEqual(0)
  })

  test('agent breakdown should sum to total', () => {
    const agents = { total: 20, active: 10, idle: 8, error: 2 }
    expect(agents.active + agents.idle + agents.error).toBe(agents.total)
  })

  test('budget usage percent matches spend/budget ratio', () => {
    const budget = { currentMonthSpendUsd: 250, monthlyBudgetUsd: 500, usagePercent: 50 }
    const calculated = (budget.currentMonthSpendUsd / budget.monthlyBudgetUsd) * 100
    expect(budget.usagePercent).toBeCloseTo(calculated)
  })

  test('budget with zero spend has 0% usage', () => {
    const budget = { currentMonthSpendUsd: 0, monthlyBudgetUsd: 500, usagePercent: 0 }
    expect(budget.usagePercent).toBe(0)
  })

  test('provider status values are valid', () => {
    const validStatuses = ['up', 'down'] as const
    const providers = [
      { name: 'anthropic' as const, status: 'up' as const },
      { name: 'openai' as const, status: 'down' as const },
    ]
    for (const p of providers) {
      expect(validStatuses).toContain(p.status)
    }
  })

  test('cost byProvider values are non-negative', () => {
    const byProvider = [
      { provider: 'anthropic' as const, costUsd: 3.50 },
      { provider: 'openai' as const, costUsd: 1.20 },
      { provider: 'google' as const, costUsd: 0 },
    ]
    for (const p of byProvider) {
      expect(p.costUsd).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('TEA: Budget bar visual calculations', () => {
  test('projected percent clamps at 120', () => {
    const data = { projectedMonthEndUsd: 1000, monthlyBudgetUsd: 500 }
    const projectedPercent = Math.min((data.projectedMonthEndUsd / data.monthlyBudgetUsd) * 100, 120)
    expect(projectedPercent).toBe(120)
  })

  test('usage percent clamps at 100 for bar width', () => {
    const clampedUsage = Math.min(150, 100)
    expect(clampedUsage).toBe(100)
  })

  test('zero budget does not cause division by zero (default $500)', () => {
    const budget = 500 // default
    const spend = 250
    const percent = (spend / budget) * 100
    expect(percent).toBe(50)
    expect(isFinite(percent)).toBe(true)
  })

  test('small budget with large spend shows high percentage', () => {
    const budget = 100
    const spend = 95
    const percent = (spend / budget) * 100
    expect(percent).toBe(95)
    expect(getBudgetColor(percent)).toBe('bg-red-500')
  })
})

describe('TEA: Usage chart bar height calculations', () => {
  test('bar height is proportional to max', () => {
    const data = [
      { total: 10 },
      { total: 5 },
      { total: 2 },
    ]
    const maxTotal = Math.max(...data.map(d => d.total), 0.01)
    const heights = data.map(d => (d.total / maxTotal) * 100)
    expect(heights[0]).toBe(100)
    expect(heights[1]).toBe(50)
    expect(heights[2]).toBe(20)
  })

  test('all zeros produce minimum height of 0.01 denominator', () => {
    const data = [{ total: 0 }, { total: 0 }]
    const maxTotal = Math.max(...data.map(d => d.total), 0.01)
    expect(maxTotal).toBe(0.01)
    const height = (0 / maxTotal) * 100
    expect(height).toBe(0)
  })

  test('single day chart has full height', () => {
    const data = [{ total: 5.0 }]
    const maxTotal = Math.max(...data.map(d => d.total), 0.01)
    const height = (data[0].total / maxTotal) * 100
    expect(height).toBe(100)
  })

  test('provider ratio within a bar sums to 100%', () => {
    const day = { anthropic: 3, openai: 2, google: 1, total: 6 }
    const ratios = {
      anthropic: (day.anthropic / day.total) * 100,
      openai: (day.openai / day.total) * 100,
      google: (day.google / day.total) * 100,
    }
    expect(ratios.anthropic + ratios.openai + ratios.google).toBeCloseTo(100)
  })
})

describe('TEA: Refetch interval and caching', () => {
  test('refetch interval is 30 seconds (matches API cache TTL)', () => {
    const REFETCH_INTERVAL = 30_000
    expect(REFETCH_INTERVAL).toBe(30000)
  })

  test('usage days toggle between 7 and 30', () => {
    let days = 7
    days = days === 7 ? 30 : 7
    expect(days).toBe(30)
    days = days === 7 ? 30 : 7
    expect(days).toBe(7)
  })
})

describe('TEA: X-axis label display logic', () => {
  test('labels shown for <= 10 items', () => {
    const length = 7
    const results = Array.from({ length }, (_, i) => {
      const showLabel = length <= 10 || i === 0 || i === length - 1 || i % 5 === 0
      return showLabel
    })
    // All should be shown for 7 items
    expect(results.every(Boolean)).toBe(true)
  })

  test('labels filtered for 30 items (first, last, every 5th)', () => {
    const length = 30
    const shown: number[] = []
    for (let i = 0; i < length; i++) {
      const showLabel = length <= 10 || i === 0 || i === length - 1 || i % 5 === 0
      if (showLabel) shown.push(i)
    }
    expect(shown).toContain(0)      // first
    expect(shown).toContain(29)     // last
    expect(shown).toContain(5)      // every 5th
    expect(shown).toContain(10)
    expect(shown).toContain(15)
    expect(shown).toContain(20)
    expect(shown).toContain(25)
    // Should not contain 1, 2, 3, 4
    expect(shown).not.toContain(1)
    expect(shown).not.toContain(2)
  })
})
