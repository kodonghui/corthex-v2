/**
 * TEA-generated tests for Story 7-3: Cost Dashboard UI (Admin A6)
 * Risk-based coverage: microToUsd conversion, sorting logic, date range defaults, chart calculations, budget form validation
 */
import { describe, test, expect } from 'bun:test'

// === Reimplemented pure functions from costs.tsx for testing ===

function microToUsd(micro: number): string {
  return (micro / 1_000_000).toFixed(2)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function defaultDates() {
  const today = new Date()
  const ago = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  return {
    start: ago.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  }
}

type SortConfig = { field: string; dir: 'asc' | 'desc' }

function toggleSort(prev: SortConfig, field: string): SortConfig {
  return {
    field,
    dir: prev.field === field && prev.dir === 'desc' ? 'asc' : 'desc',
  }
}

function sortItems<T extends Record<string, unknown>>(items: T[], sort: SortConfig): T[] {
  return [...items].sort((a, b) => {
    const v = sort.dir === 'asc' ? 1 : -1
    const af = a[sort.field]
    const bf = b[sort.field]
    if (typeof af === 'string' && typeof bf === 'string') return af.localeCompare(bf) * v
    return (((af as number) ?? 0) - ((bf as number) ?? 0)) * v
  })
}

function calcBarHeight(costMicro: number, maxCost: number): number {
  const pct = (costMicro / maxCost) * 100
  return Math.max(pct, 1)
}

function calcUsagePercent(currentSpendMicro: number, monthlyBudgetMicro: number): number {
  if (monthlyBudgetMicro <= 0) return 0
  return Math.min((currentSpendMicro / monthlyBudgetMicro) * 100, 100)
}

// === TEA Tests ===

describe('TEA: microToUsd conversion', () => {
  test('zero microdollars returns "0.00"', () => {
    expect(microToUsd(0)).toBe('0.00')
  })

  test('1 million microdollars = $1.00', () => {
    expect(microToUsd(1_000_000)).toBe('1.00')
  })

  test('500 microdollars = $0.00 (rounds down)', () => {
    expect(microToUsd(500)).toBe('0.00')
  })

  test('5000 microdollars = $0.01 (rounds up)', () => {
    expect(microToUsd(5000)).toBe('0.01')
  })

  test('very large value: $999.99', () => {
    expect(microToUsd(999_990_000)).toBe('999.99')
  })

  test('negative microdollars returns negative USD', () => {
    expect(microToUsd(-1_000_000)).toBe('-1.00')
  })

  test('fractional microdollars: 1 micro = $0.00', () => {
    expect(microToUsd(1)).toBe('0.00')
  })

  test('precise conversion: 123456789 micro = $123.46', () => {
    expect(microToUsd(123_456_789)).toBe('123.46')
  })
})

describe('TEA: formatNumber', () => {
  test('small number stays as-is', () => {
    expect(formatNumber(42)).toBe('42')
  })

  test('zero returns "0"', () => {
    expect(formatNumber(0)).toBe('0')
  })

  test('999 stays as-is', () => {
    expect(formatNumber(999)).toBe('999')
  })

  test('1000 becomes "1.0K"', () => {
    expect(formatNumber(1000)).toBe('1.0K')
  })

  test('1500 becomes "1.5K"', () => {
    expect(formatNumber(1500)).toBe('1.5K')
  })

  test('999999 becomes "1000.0K"', () => {
    expect(formatNumber(999999)).toBe('1000.0K')
  })

  test('1000000 becomes "1.0M"', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M')
  })

  test('2500000 becomes "2.5M"', () => {
    expect(formatNumber(2_500_000)).toBe('2.5M')
  })
})

describe('TEA: defaultDates', () => {
  test('end date is today', () => {
    const d = defaultDates()
    const today = new Date().toISOString().split('T')[0]
    expect(d.end).toBe(today)
  })

  test('start date is 30 days before end', () => {
    const d = defaultDates()
    const start = new Date(d.start)
    const end = new Date(d.end)
    const diff = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    expect(diff).toBe(30)
  })

  test('dates are in YYYY-MM-DD format', () => {
    const d = defaultDates()
    expect(d.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(d.end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('TEA: toggleSort', () => {
  test('clicking new field defaults to desc', () => {
    const result = toggleSort({ field: 'cost', dir: 'desc' }, 'name')
    expect(result).toEqual({ field: 'name', dir: 'desc' })
  })

  test('clicking same field in desc toggles to asc', () => {
    const result = toggleSort({ field: 'cost', dir: 'desc' }, 'cost')
    expect(result).toEqual({ field: 'cost', dir: 'asc' })
  })

  test('clicking same field in asc toggles to desc', () => {
    const result = toggleSort({ field: 'cost', dir: 'asc' }, 'cost')
    expect(result).toEqual({ field: 'cost', dir: 'desc' })
  })
})

describe('TEA: sortItems', () => {
  const items = [
    { name: 'Agent A', totalCostMicro: 500, callCount: 10 },
    { name: 'Agent B', totalCostMicro: 1000, callCount: 5 },
    { name: 'Agent C', totalCostMicro: 200, callCount: 20 },
  ]

  test('sort by cost desc', () => {
    const sorted = sortItems(items, { field: 'totalCostMicro', dir: 'desc' })
    expect(sorted[0].name).toBe('Agent B')
    expect(sorted[1].name).toBe('Agent A')
    expect(sorted[2].name).toBe('Agent C')
  })

  test('sort by cost asc', () => {
    const sorted = sortItems(items, { field: 'totalCostMicro', dir: 'asc' })
    expect(sorted[0].name).toBe('Agent C')
    expect(sorted[2].name).toBe('Agent B')
  })

  test('sort by callCount desc', () => {
    const sorted = sortItems(items, { field: 'callCount', dir: 'desc' })
    expect(sorted[0].name).toBe('Agent C')
    expect(sorted[0].callCount).toBe(20)
  })

  test('empty array returns empty', () => {
    const sorted = sortItems([], { field: 'cost', dir: 'desc' })
    expect(sorted).toEqual([])
  })

  test('single item returns same', () => {
    const sorted = sortItems([items[0]], { field: 'totalCostMicro', dir: 'desc' })
    expect(sorted).toHaveLength(1)
    expect(sorted[0].name).toBe('Agent A')
  })

  test('does not mutate original array', () => {
    const original = [...items]
    sortItems(items, { field: 'totalCostMicro', dir: 'asc' })
    expect(items).toEqual(original)
  })

  test('sort by missing field treats as 0', () => {
    const sorted = sortItems(items, { field: 'nonexistent', dir: 'desc' })
    expect(sorted).toHaveLength(3)
  })

  test('sort by string field uses localeCompare', () => {
    const sorted = sortItems(items, { field: 'name', dir: 'asc' })
    expect(sorted[0].name).toBe('Agent A')
    expect(sorted[1].name).toBe('Agent B')
    expect(sorted[2].name).toBe('Agent C')
  })

  test('sort by string field desc', () => {
    const sorted = sortItems(items, { field: 'name', dir: 'desc' })
    expect(sorted[0].name).toBe('Agent C')
    expect(sorted[2].name).toBe('Agent A')
  })
})

describe('TEA: calcBarHeight', () => {
  test('max cost bar = 100%', () => {
    expect(calcBarHeight(1000, 1000)).toBe(100)
  })

  test('half of max = 50%', () => {
    expect(calcBarHeight(500, 1000)).toBe(50)
  })

  test('zero cost gets minimum 1%', () => {
    expect(calcBarHeight(0, 1000)).toBe(1)
  })

  test('very small cost gets minimum 1%', () => {
    expect(calcBarHeight(1, 1000000)).toBe(1)
  })

  test('cost equal to max is exactly 100%', () => {
    expect(calcBarHeight(5000000, 5000000)).toBe(100)
  })

  test('quarter of max = 25%', () => {
    expect(calcBarHeight(250, 1000)).toBe(25)
  })
})

describe('TEA: calcUsagePercent', () => {
  test('zero budget returns 0%', () => {
    expect(calcUsagePercent(500000, 0)).toBe(0)
  })

  test('negative budget returns 0%', () => {
    expect(calcUsagePercent(500000, -100)).toBe(0)
  })

  test('50% usage', () => {
    expect(calcUsagePercent(500000, 1000000)).toBe(50)
  })

  test('100% usage (exact budget)', () => {
    expect(calcUsagePercent(1000000, 1000000)).toBe(100)
  })

  test('over budget caps at 100%', () => {
    expect(calcUsagePercent(1500000, 1000000)).toBe(100)
  })

  test('zero spend = 0%', () => {
    expect(calcUsagePercent(0, 1000000)).toBe(0)
  })

  test('very small spend = near 0%', () => {
    const result = calcUsagePercent(1, 1000000)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })
})

describe('TEA: trend percent color logic', () => {
  function trendColor(trend: number): string {
    if (trend > 0) return 'text-red-500'
    if (trend < 0) return 'text-emerald-500'
    return 'text-zinc-500'
  }

  test('positive trend = red', () => {
    expect(trendColor(15.5)).toBe('text-red-500')
  })

  test('negative trend = green', () => {
    expect(trendColor(-10)).toBe('text-emerald-500')
  })

  test('zero trend = gray', () => {
    expect(trendColor(0)).toBe('text-zinc-500')
  })

  test('very small positive = red', () => {
    expect(trendColor(0.1)).toBe('text-red-500')
  })

  test('very small negative = green', () => {
    expect(trendColor(-0.1)).toBe('text-emerald-500')
  })
})

describe('TEA: provider extraction from summary', () => {
  function extractProviderCost(byProvider: { provider: string; costMicro: number }[], target: string): number {
    return byProvider.find(p => p.provider === target)?.costMicro ?? 0
  }

  test('find anthropic cost', () => {
    const providers = [
      { provider: 'anthropic', costMicro: 500000 },
      { provider: 'openai', costMicro: 300000 },
    ]
    expect(extractProviderCost(providers, 'anthropic')).toBe(500000)
  })

  test('missing provider returns 0', () => {
    const providers = [{ provider: 'anthropic', costMicro: 500000 }]
    expect(extractProviderCost(providers, 'google')).toBe(0)
  })

  test('empty array returns 0', () => {
    expect(extractProviderCost([], 'anthropic')).toBe(0)
  })
})

describe('TEA: budget form validation logic', () => {
  function validateBudgetForm(form: { monthlyBudget: string; dailyBudget: string; warningThreshold: string }): string | null {
    const monthly = Number(form.monthlyBudget)
    const daily = Number(form.dailyBudget)
    const threshold = Number(form.warningThreshold)
    if (isNaN(monthly) || isNaN(daily) || isNaN(threshold)) return 'invalid_number'
    if (threshold < 0 || threshold > 100) return 'threshold_out_of_range'
    return null
  }

  test('valid form returns null', () => {
    expect(validateBudgetForm({ monthlyBudget: '500', dailyBudget: '50', warningThreshold: '80' })).toBeNull()
  })

  test('non-numeric monthly budget', () => {
    expect(validateBudgetForm({ monthlyBudget: 'abc', dailyBudget: '50', warningThreshold: '80' })).toBe('invalid_number')
  })

  test('empty string converts to 0 (valid - Number("") === 0)', () => {
    expect(validateBudgetForm({ monthlyBudget: '', dailyBudget: '50', warningThreshold: '80' })).toBeNull()
  })

  test('threshold > 100', () => {
    expect(validateBudgetForm({ monthlyBudget: '500', dailyBudget: '50', warningThreshold: '101' })).toBe('threshold_out_of_range')
  })

  test('threshold < 0', () => {
    expect(validateBudgetForm({ monthlyBudget: '500', dailyBudget: '50', warningThreshold: '-1' })).toBe('threshold_out_of_range')
  })

  test('threshold = 0 is valid', () => {
    expect(validateBudgetForm({ monthlyBudget: '500', dailyBudget: '50', warningThreshold: '0' })).toBeNull()
  })

  test('threshold = 100 is valid', () => {
    expect(validateBudgetForm({ monthlyBudget: '500', dailyBudget: '50', warningThreshold: '100' })).toBeNull()
  })

  test('zero budgets are valid (unlimited)', () => {
    expect(validateBudgetForm({ monthlyBudget: '0', dailyBudget: '0', warningThreshold: '80' })).toBeNull()
  })
})

describe('TEA: daily chart date label formatting', () => {
  function formatDateLabel(dateStr: string): string {
    return dateStr.slice(5) // "2026-03-15" -> "03-15"
  }

  test('formats date correctly', () => {
    expect(formatDateLabel('2026-03-15')).toBe('03-15')
  })

  test('January date', () => {
    expect(formatDateLabel('2026-01-01')).toBe('01-01')
  })

  test('December date', () => {
    expect(formatDateLabel('2026-12-31')).toBe('12-31')
  })
})

describe('TEA: chart period start date calculation', () => {
  function calcChartStart(endDate: string, days: number): string {
    const d = new Date(endDate)
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  test('7 days back from 2026-03-07', () => {
    expect(calcChartStart('2026-03-07', 7)).toBe('2026-02-28')
  })

  test('30 days back from 2026-03-07', () => {
    expect(calcChartStart('2026-03-07', 30)).toBe('2026-02-05')
  })

  test('crossing year boundary', () => {
    expect(calcChartStart('2026-01-05', 30)).toBe('2025-12-06')
  })
})
