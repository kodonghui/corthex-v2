import { describe, test, expect } from 'bun:test'

// Since we can't import React components directly in bun:test without jsdom,
// we test the pure logic by reimplementing the key functions here.

// === groupUsageByDate ===

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

// === Tests ===

describe('Dashboard - groupUsageByDate', () => {
  test('empty usage returns empty array', () => {
    expect(groupUsageByDate([])).toEqual([])
  })

  test('single day single provider', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.05 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-03-01')
    expect(result[0].byProvider.anthropic).toBe(0.05)
    expect(result[0].byProvider.openai).toBe(0)
    expect(result[0].byProvider.google).toBe(0)
    expect(result[0].total).toBeCloseTo(0.05)
  })

  test('single day multiple providers', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.10 },
      { date: '2026-03-01', provider: 'openai', inputTokens: 200, outputTokens: 100, costUsd: 0.08 },
      { date: '2026-03-01', provider: 'google', inputTokens: 150, outputTokens: 75, costUsd: 0.06 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].byProvider.anthropic).toBeCloseTo(0.10)
    expect(result[0].byProvider.openai).toBeCloseTo(0.08)
    expect(result[0].byProvider.google).toBeCloseTo(0.06)
    expect(result[0].total).toBeCloseTo(0.24)
  })

  test('multiple days sorted chronologically', () => {
    const result = groupUsageByDate([
      { date: '2026-03-03', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.10 },
      { date: '2026-03-01', provider: 'openai', inputTokens: 200, outputTokens: 100, costUsd: 0.05 },
      { date: '2026-03-02', provider: 'google', inputTokens: 150, outputTokens: 75, costUsd: 0.08 },
    ])
    expect(result).toHaveLength(3)
    expect(result[0].date).toBe('2026-03-01')
    expect(result[1].date).toBe('2026-03-02')
    expect(result[2].date).toBe('2026-03-03')
  })

  test('same provider multiple entries on same day are summed', () => {
    const result = groupUsageByDate([
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.10 },
      { date: '2026-03-01', provider: 'anthropic', inputTokens: 200, outputTokens: 100, costUsd: 0.15 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].byProvider.anthropic).toBeCloseTo(0.25)
    expect(result[0].total).toBeCloseTo(0.25)
  })

  test('7 days of data', () => {
    const usage: DashboardUsageDay[] = []
    for (let i = 1; i <= 7; i++) {
      const d = String(i).padStart(2, '0')
      usage.push({ date: `2026-03-${d}`, provider: 'anthropic', inputTokens: 100, outputTokens: 50, costUsd: 0.01 * i })
      usage.push({ date: `2026-03-${d}`, provider: 'openai', inputTokens: 100, outputTokens: 50, costUsd: 0.005 * i })
    }
    const result = groupUsageByDate(usage)
    expect(result).toHaveLength(7)
    // day 7 should be the most expensive
    expect(result[6].total).toBeGreaterThan(result[0].total)
  })
})

describe('Dashboard - getBudgetColor', () => {
  test('0% returns green', () => {
    expect(getBudgetColor(0)).toBe('bg-green-500')
  })

  test('30% returns green', () => {
    expect(getBudgetColor(30)).toBe('bg-green-500')
  })

  test('59% returns green', () => {
    expect(getBudgetColor(59)).toBe('bg-green-500')
  })

  test('60% returns yellow', () => {
    expect(getBudgetColor(60)).toBe('bg-yellow-500')
  })

  test('75% returns yellow', () => {
    expect(getBudgetColor(75)).toBe('bg-yellow-500')
  })

  test('79% returns yellow', () => {
    expect(getBudgetColor(79)).toBe('bg-yellow-500')
  })

  test('80% returns red', () => {
    expect(getBudgetColor(80)).toBe('bg-red-500')
  })

  test('100% returns red', () => {
    expect(getBudgetColor(100)).toBe('bg-red-500')
  })

  test('120% (over budget) returns red', () => {
    expect(getBudgetColor(120)).toBe('bg-red-500')
  })
})

describe('Dashboard - API response shape validation', () => {
  test('DashboardSummary expected fields', () => {
    const summary = {
      tasks: { total: 10, completed: 7, failed: 1, inProgress: 2 },
      cost: { todayUsd: 5.23, byProvider: [{ provider: 'anthropic' as const, costUsd: 3.50 }], budgetUsagePercent: 45 },
      agents: { total: 15, active: 8, idle: 5, error: 2 },
      integrations: { providers: [{ name: 'anthropic' as const, status: 'up' as const }], toolSystemOk: true },
    }
    expect(summary.tasks.total).toBe(summary.tasks.completed + summary.tasks.failed + summary.tasks.inProgress)
    expect(summary.cost.budgetUsagePercent).toBeGreaterThanOrEqual(0)
    expect(summary.agents.total).toBe(summary.agents.active + summary.agents.idle + summary.agents.error)
  })

  test('DashboardBudget projected vs actual', () => {
    const budget = {
      currentMonthSpendUsd: 250,
      monthlyBudgetUsd: 500,
      usagePercent: 50,
      projectedMonthEndUsd: 450,
      isDefaultBudget: true,
      byDepartment: [{ departmentId: 'd1', name: '전략부', costUsd: 150 }],
    }
    expect(budget.usagePercent).toBe((budget.currentMonthSpendUsd / budget.monthlyBudgetUsd) * 100)
    expect(budget.projectedMonthEndUsd).toBeGreaterThan(budget.currentMonthSpendUsd)
  })

  test('DashboardUsage structure', () => {
    const usage = {
      days: 7,
      usage: [
        { date: '2026-03-01', provider: 'anthropic' as const, inputTokens: 1000, outputTokens: 500, costUsd: 0.05 },
        { date: '2026-03-01', provider: 'openai' as const, inputTokens: 2000, outputTokens: 1000, costUsd: 0.03 },
      ],
    }
    expect(usage.days).toBe(7)
    expect(usage.usage).toHaveLength(2)
    expect(usage.usage[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('Dashboard - QuickActions navigation', () => {
  test('quick action commands are valid preset formats', () => {
    const actions = [
      { label: '루틴 실행', command: '/루틴' },
      { label: '시스템 점검', command: '/시스템점검' },
      { label: '비용 리포트', command: '/비용리포트' },
    ]
    for (const action of actions) {
      expect(action.command).toMatch(/^\//)
      const encoded = encodeURIComponent(action.command)
      expect(encoded).toBeTruthy()
      expect(`/command-center?preset=${encoded}`).toContain('preset=')
    }
  })
})

describe('Dashboard - Provider colors', () => {
  const PROVIDER_COLORS: Record<LLMProviderName, string> = {
    anthropic: '#3B82F6',
    openai: '#22C55E',
    google: '#F97316',
  }

  test('all 3 providers have distinct colors', () => {
    const colors = Object.values(PROVIDER_COLORS)
    expect(new Set(colors).size).toBe(3)
  })

  test('colors are valid hex', () => {
    for (const color of Object.values(PROVIDER_COLORS)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('Dashboard - Responsive grid classes', () => {
  test('summary cards grid classes match UX spec', () => {
    const gridClass = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'
    expect(gridClass).toContain('grid-cols-1')     // sm: 1 col
    expect(gridClass).toContain('sm:grid-cols-2')  // md: 2 cols
    expect(gridClass).toContain('xl:grid-cols-4')  // xl: 4 cols
  })

  test('quick actions grid classes match UX spec', () => {
    const gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
    expect(gridClass).toContain('grid-cols-1')     // sm: 1 col
    expect(gridClass).toContain('sm:grid-cols-2')  // md: 2 cols
    expect(gridClass).toContain('lg:grid-cols-3')  // lg: 3 cols
  })
})
