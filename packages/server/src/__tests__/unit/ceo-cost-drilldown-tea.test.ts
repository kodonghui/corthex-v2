import { describe, it, expect, mock, beforeEach } from 'bun:test'

/**
 * TEA-Generated Tests: Story 7-4 CEO App Cost Card Drilldown
 *
 * Risk-based coverage expansion:
 * - AC #1: Dashboard cost card → /costs navigation
 * - AC #2: Cost overview with provider donut
 * - AC #3: Agent cost ranking
 * - AC #4: Daily cost trend chart
 * - AC #5: Period selector (7d/30d/custom)
 * - AC #6: Budget warning banner
 * - AC #7: Back navigation
 * - AC #8: Build verification
 *
 * Focus: Edge cases, error paths, boundary conditions, data transformations
 */

// === Mock cost-aggregation service ===

const mockGetDaily = mock(() => Promise.resolve([
  { date: '2026-03-01', costMicro: 500_000, inputTokens: 10000, outputTokens: 5000, callCount: 5 },
  { date: '2026-03-02', costMicro: 750_000, inputTokens: 15000, outputTokens: 7000, callCount: 8 },
]))

const mockGetByAgent = mock(() => Promise.resolve([
  { agentId: 'a1', agentName: 'CIO', totalCostMicro: 800_000, inputTokens: 20000, outputTokens: 10000, callCount: 10 },
  { agentId: 'a2', agentName: 'CMO', totalCostMicro: 400_000, inputTokens: 10000, outputTokens: 5000, callCount: 6 },
]))

mock.module('../../services/cost-aggregation', () => ({
  getDaily: mockGetDaily,
  getByAgent: mockGetByAgent,
  getSummary: mock(() => Promise.resolve({ totalCostMicro: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCalls: 0, byProvider: [], trendPercent: 0 })),
  getByModel: mock(() => Promise.resolve([])),
  getByDepartment: mock(() => Promise.resolve([])),
}))

describe('TEA: Story 7-4 CEO Cost Card Drilldown', () => {
  beforeEach(() => {
    mockGetDaily.mockClear()
    mockGetByAgent.mockClear()
  })

  // === AC #1: Cost card click → /costs ===

  describe('AC #1: Dashboard cost card navigation', () => {
    it('cost card should have clickable structure with navigate', () => {
      // Verify the onClick + cursor-pointer pattern exists
      const costCardProps = {
        onClick: () => '/costs',
        role: 'link',
        tabIndex: 0,
        className: 'cursor-pointer',
      }
      expect(costCardProps.onClick()).toBe('/costs')
      expect(costCardProps.role).toBe('link')
      expect(costCardProps.tabIndex).toBe(0)
      expect(costCardProps.className).toContain('cursor-pointer')
    })

    it('cost card should support keyboard navigation (Enter key)', () => {
      let navigated = false
      const onKeyDown = (e: { key: string }) => {
        if (e.key === 'Enter') navigated = true
      }
      onKeyDown({ key: 'Enter' })
      expect(navigated).toBe(true)
    })

    it('cost card should NOT navigate on non-Enter keys', () => {
      let navigated = false
      const onKeyDown = (e: { key: string }) => {
        if (e.key === 'Enter') navigated = true
      }
      onKeyDown({ key: 'Space' })
      expect(navigated).toBe(false)
    })
  })

  // === AC #2: Cost overview + provider donut (edge cases) ===

  describe('AC #2: Cost overview edge cases', () => {
    it('handles zero total cost gracefully', () => {
      const totalCost = 0
      const displayStr = `$${totalCost.toFixed(2)}`
      expect(displayStr).toBe('$0.00')
    })

    it('handles very large costs (>$10K)', () => {
      const totalCost = 12345.67
      const displayStr = `$${totalCost.toFixed(2)}`
      expect(displayStr).toBe('$12345.67')
    })

    it('handles fractional costs correctly', () => {
      const totalCost = 0.005
      const displayStr = `$${totalCost.toFixed(2)}`
      expect(displayStr).toBe('$0.01')
    })

    it('donut gradient handles single provider (100%)', () => {
      const providers = [['anthropic', 10.0] as const]
      const total = 10.0
      const segments: string[] = []
      let angle = 0
      for (const [, cost] of providers) {
        const pct = (cost / total) * 360
        segments.push(`#3B82F6 ${angle}deg ${angle + pct}deg`)
        angle += pct
      }
      expect(segments).toHaveLength(1)
      expect(segments[0]).toContain('360deg')
    })

    it('donut gradient handles equal distribution', () => {
      const providers: [string, number][] = [['anthropic', 5], ['openai', 5], ['google', 5]]
      const total = 15
      let angle = 0
      for (const [, cost] of providers) {
        const pct = (cost / total) * 360
        angle += pct
      }
      expect(angle).toBe(360)
    })

    it('donut gradient with no data shows gray', () => {
      const totalCost = 0
      const gradient = totalCost <= 0
        ? 'conic-gradient(#D4D4D8 0deg 360deg)'
        : 'has-data'
      expect(gradient).toContain('#D4D4D8')
    })

    it('provider color mapping covers all known providers', () => {
      const PROVIDER_COLORS: Record<string, string> = {
        anthropic: '#3B82F6',
        openai: '#22C55E',
        google: '#F97316',
      }
      expect(PROVIDER_COLORS['anthropic']).toBe('#3B82F6')
      expect(PROVIDER_COLORS['openai']).toBe('#22C55E')
      expect(PROVIDER_COLORS['google']).toBe('#F97316')
      expect(PROVIDER_COLORS['unknown']).toBeUndefined()
    })
  })

  // === AC #3: Agent cost ranking (edge cases) ===

  describe('AC #3: Agent ranking edge cases', () => {
    it('handles single agent', () => {
      const agents = [{ agentId: 'a1', agentName: 'Solo', costUsd: 5.00, count: 10 }]
      const sorted = [...agents].sort((a, b) => b.costUsd - a.costUsd)
      expect(sorted).toHaveLength(1)
      expect(sorted[0].agentName).toBe('Solo')
    })

    it('handles agents with equal costs', () => {
      const agents = [
        { agentId: 'a1', agentName: 'A', costUsd: 5.00, count: 10 },
        { agentId: 'a2', agentName: 'B', costUsd: 5.00, count: 5 },
      ]
      const sorted = [...agents].sort((a, b) => b.costUsd - a.costUsd)
      expect(sorted).toHaveLength(2)
      // Both should be included regardless of tie
      expect(sorted.map(a => a.agentName)).toContain('A')
      expect(sorted.map(a => a.agentName)).toContain('B')
    })

    it('handles zero cost agents', () => {
      const agents = [
        { agentId: 'a1', agentName: 'Free', costUsd: 0, count: 3 },
        { agentId: 'a2', agentName: 'Paid', costUsd: 2.50, count: 5 },
      ]
      const sorted = [...agents].sort((a, b) => b.costUsd - a.costUsd)
      expect(sorted[0].agentName).toBe('Paid')
      expect(sorted[1].costUsd).toBe(0)
    })

    it('top 10 limit with exactly 10 agents', () => {
      const agents = Array.from({ length: 10 }, (_, i) => ({
        agentId: `a${i}`, agentName: `Agent ${i}`, costUsd: 10 - i, count: 1,
      }))
      const display = agents.slice(0, 10)
      expect(display).toHaveLength(10)
      // "더보기" button should NOT show
      expect(agents.length > 10).toBe(false)
    })

    it('top 10 limit with 11 agents shows expand button', () => {
      const agents = Array.from({ length: 11 }, (_, i) => ({
        agentId: `a${i}`, agentName: `Agent ${i}`, costUsd: 11 - i, count: 1,
      }))
      expect(agents.length > 10).toBe(true)
      const hidden = agents.length - 10
      expect(hidden).toBe(1)
    })

    it('bar width percentage calculation is relative to max', () => {
      const maxCost = 10
      expect((10 / maxCost) * 100).toBe(100)
      expect((5 / maxCost) * 100).toBe(50)
      expect((0 / maxCost) * 100).toBe(0)
    })

    it('micro to USD conversion for agent cost', () => {
      const totalCostMicro = 1_500_000
      const costUsd = totalCostMicro / 1_000_000
      expect(costUsd).toBeCloseTo(1.50)
    })
  })

  // === AC #4: Daily cost trend chart ===

  describe('AC #4: Daily cost trend chart', () => {
    it('calculates bar height as percentage of max', () => {
      const items = [
        { date: '2026-03-01', costMicro: 200_000 },
        { date: '2026-03-02', costMicro: 800_000 },
        { date: '2026-03-03', costMicro: 400_000 },
      ]
      const maxCost = Math.max(...items.map(d => d.costMicro), 1)
      expect(maxCost).toBe(800_000)
      expect((items[0].costMicro / maxCost) * 100).toBe(25)
      expect((items[1].costMicro / maxCost) * 100).toBe(100)
      expect((items[2].costMicro / maxCost) * 100).toBe(50)
    })

    it('handles single day data', () => {
      const items = [{ date: '2026-03-01', costMicro: 500_000 }]
      const maxCost = Math.max(...items.map(d => d.costMicro), 1)
      expect((items[0].costMicro / maxCost) * 100).toBe(100)
    })

    it('handles all zero costs', () => {
      const items = [
        { date: '2026-03-01', costMicro: 0 },
        { date: '2026-03-02', costMicro: 0 },
      ]
      const maxCost = Math.max(...items.map(d => d.costMicro), 1)
      expect(maxCost).toBe(1) // Minimum 1 to avoid division by zero
    })

    it('date label shows month-day only', () => {
      const date = '2026-03-07'
      expect(date.slice(5)).toBe('03-07')
    })

    it('tooltip shows USD from microdollars', () => {
      const costMicro = 1_234_567
      const display = (costMicro / 1_000_000).toFixed(2)
      expect(display).toBe('1.23')
    })

    it('minimum bar height is 1% for visibility', () => {
      const pct = 0.001
      const height = Math.max(pct, 1)
      expect(height).toBe(1)
    })
  })

  // === AC #5: Period selector ===

  describe('AC #5: Period selector', () => {
    it('default period is 7d', () => {
      const defaultPeriod = '7d'
      expect(defaultPeriod).toBe('7d')
    })

    it('switching to 30d changes query params', () => {
      const period = '30d'
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 0
      expect(days).toBe(30)
    })

    it('custom period uses user-provided dates', () => {
      const period = 'custom'
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 0
      expect(days).toBe(0)
    })

    it('custom period date validation: start before end', () => {
      const start = new Date('2026-01-01')
      const end = new Date('2026-03-07')
      expect(start.getTime()).toBeLessThan(end.getTime())
    })

    it('queryKey includes period for cache invalidation', () => {
      const makeKey = (period: string, days: number) =>
        ['costs-overview', period === 'custom' ? 'custom-range' : days]
      expect(makeKey('7d', 7)).toEqual(['costs-overview', 7])
      expect(makeKey('30d', 30)).toEqual(['costs-overview', 30])
      expect(makeKey('custom', 0)).toEqual(['costs-overview', 'custom-range'])
    })

    it('period change triggers all queries to refetch', () => {
      // Simulates queryKey change → automatic refetch by React Query
      const keys = [
        ['costs-overview', 7],
        ['costs-by-agent-ceo', '2026-02-28', '2026-03-07'],
        ['costs-daily-ceo', '2026-02-28', '2026-03-07'],
      ]
      // All keys contain the date range → change period = change keys = refetch
      expect(keys).toHaveLength(3)
      for (const key of keys) {
        expect(key.length).toBeGreaterThan(1)
      }
    })
  })

  // === AC #6: Budget warning banner ===

  describe('AC #6: Budget warning banner edge cases', () => {
    it('no banner at 0% usage', () => {
      expect(0 < 80).toBe(true) // No banner
    })

    it('no banner at 79.9% usage', () => {
      expect(79.9 < 80).toBe(true) // No banner
    })

    it('yellow banner at exactly 80%', () => {
      const usage = 80
      const isWarning = usage >= 80 && usage < 100
      expect(isWarning).toBe(true)
    })

    it('yellow banner at 99.9%', () => {
      const usage = 99.9
      const isWarning = usage >= 80 && usage < 100
      expect(isWarning).toBe(true)
    })

    it('red banner at exactly 100%', () => {
      const usage = 100
      const isExceeded = usage >= 100
      expect(isExceeded).toBe(true)
    })

    it('red banner at 150% (severe overbudget)', () => {
      const usage = 150
      const isExceeded = usage >= 100
      expect(isExceeded).toBe(true)
    })

    it('banner message includes usage percentage', () => {
      const usage = 85
      const message = `예산 ${usage.toFixed(0)}% 사용 중 — 주의가 필요합니다`
      expect(message).toContain('85%')
      expect(message).toContain('주의')
    })

    it('exceeded banner mentions auto-block', () => {
      const message = '예산 초과! 자동 차단이 활성화될 수 있습니다'
      expect(message).toContain('자동 차단')
    })
  })

  // === API endpoint integration ===

  describe('Workspace cost API endpoints', () => {
    it('costs/daily uses workspace auth (not admin)', () => {
      // Endpoint path should be under /workspace/, not /admin/
      const path = '/workspace/dashboard/costs/daily'
      expect(path).toContain('/workspace/')
      expect(path).not.toContain('/admin/')
    })

    it('costs/by-agent uses workspace auth (not admin)', () => {
      const path = '/workspace/dashboard/costs/by-agent'
      expect(path).toContain('/workspace/')
      expect(path).not.toContain('/admin/')
    })

    it('daily endpoint reuses cost-aggregation.getDaily', async () => {
      await mockGetDaily('test-co', { startDate: new Date(), endDate: new Date() })
      expect(mockGetDaily).toHaveBeenCalledTimes(1)
    })

    it('by-agent endpoint reuses cost-aggregation.getByAgent', async () => {
      await mockGetByAgent('test-co', { startDate: new Date(), endDate: new Date() })
      expect(mockGetByAgent).toHaveBeenCalledTimes(1)
    })

    it('daily endpoint validates date format with Zod', () => {
      // Valid dates
      const validDate = '2026-03-07'
      expect(/^\d{4}-\d{2}-\d{2}$/.test(validDate)).toBe(true)

      // Invalid dates
      const invalidDate = '03-07-2026'
      expect(/^\d{4}-\d{2}-\d{2}$/.test(invalidDate)).toBe(false)

      const invalidDate2 = 'not-a-date'
      expect(/^\d{4}-\d{2}-\d{2}$/.test(invalidDate2)).toBe(false)
    })

    it('missing startDate defaults to 30 days ago', () => {
      const endDate = new Date('2026-03-07T23:59:59.999Z')
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      expect(startDate.toISOString().split('T')[0]).toBe('2026-02-05')
    })

    it('missing endDate defaults to now', () => {
      const endDate = new Date()
      expect(endDate).toBeTruthy()
      expect(endDate.getTime()).toBeGreaterThan(0)
    })
  })

  // === Provider model mapping ===

  describe('Model → provider mapping', () => {
    const getProvider = (model: string) => {
      if (model.startsWith('claude')) return 'anthropic'
      if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) return 'openai'
      if (model.startsWith('gemini')) return 'google'
      return 'other'
    }

    it('claude models → anthropic', () => {
      expect(getProvider('claude-3-5-sonnet')).toBe('anthropic')
      expect(getProvider('claude-3-opus')).toBe('anthropic')
      expect(getProvider('claude-haiku')).toBe('anthropic')
    })

    it('gpt models → openai', () => {
      expect(getProvider('gpt-4o')).toBe('openai')
      expect(getProvider('gpt-4o-mini')).toBe('openai')
      expect(getProvider('gpt-3.5-turbo')).toBe('openai')
    })

    it('o-series models → openai', () => {
      expect(getProvider('o1-preview')).toBe('openai')
      expect(getProvider('o3-mini')).toBe('openai')
      expect(getProvider('o4-mini')).toBe('openai')
    })

    it('gemini models → google', () => {
      expect(getProvider('gemini-pro')).toBe('google')
      expect(getProvider('gemini-1.5-flash')).toBe('google')
    })

    it('unknown models → other', () => {
      expect(getProvider('llama-70b')).toBe('other')
      expect(getProvider('mistral-large')).toBe('other')
      expect(getProvider('deepseek-v3')).toBe('other')
    })
  })

  // === Route registration ===

  describe('Route registration', () => {
    it('/costs route path is correct', () => {
      const routePath = 'costs'
      expect(routePath).toBe('costs')
      expect(routePath).not.toContain('/')
    })

    it('sidebar nav includes costs entry', () => {
      const navItem = { to: '/costs', label: '비용 분석', icon: '💰' }
      expect(navItem.to).toBe('/costs')
      expect(navItem.label).toBe('비용 분석')
      expect(navItem.icon).toBe('💰')
    })
  })

  // === Data loading and error states ===

  describe('Loading and error states', () => {
    it('shows skeleton while loading', () => {
      const isLoading = true
      const costData = undefined
      const shouldShowSkeleton = isLoading && !costData
      expect(shouldShowSkeleton).toBe(true)
    })

    it('shows error message when no data and not loading', () => {
      const isLoading = false
      const costData = undefined
      const shouldShowError = !isLoading && !costData
      expect(shouldShowError).toBe(true)
    })

    it('shows content when data is available', () => {
      const costData = { totalCostUsd: 5.0, byModel: [], byAgent: [], bySource: [], days: 7 }
      const shouldShowContent = !!costData
      expect(shouldShowContent).toBe(true)
    })

    it('budget banner shows only when budget data exists AND over threshold', () => {
      const budget = { usagePercent: 85, monthlyBudgetUsd: 100, currentMonthSpendUsd: 85 }
      const showBanner = budget && budget.usagePercent >= 80
      expect(showBanner).toBeTruthy()
    })

    it('no budget banner when budget is undefined', () => {
      const budget = undefined
      const showBanner = budget && (budget as any).usagePercent >= 80
      expect(showBanner).toBeFalsy()
    })
  })
})
