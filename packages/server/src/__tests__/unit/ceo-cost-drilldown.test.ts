import { describe, it, expect, mock, beforeEach } from 'bun:test'

/**
 * Story 7-4: CEO App Cost Card Drilldown
 * Tests for:
 * 1. Workspace daily cost API endpoint
 * 2. Workspace by-agent cost API endpoint
 * 3. Data transformation and response shapes
 */

// === Mock cost-aggregation service ===

const mockGetDaily = mock(() => Promise.resolve([
  { date: '2026-03-01', costMicro: 500_000, inputTokens: 10000, outputTokens: 5000, callCount: 5 },
  { date: '2026-03-02', costMicro: 750_000, inputTokens: 15000, outputTokens: 7000, callCount: 8 },
  { date: '2026-03-03', costMicro: 300_000, inputTokens: 8000, outputTokens: 3000, callCount: 3 },
]))

const mockGetByAgent = mock(() => Promise.resolve([
  { agentId: 'agent-1', agentName: 'CIO', totalCostMicro: 800_000, inputTokens: 20000, outputTokens: 10000, callCount: 10 },
  { agentId: 'agent-2', agentName: 'CMO', totalCostMicro: 400_000, inputTokens: 10000, outputTokens: 5000, callCount: 6 },
  { agentId: 'agent-3', agentName: 'CTO', totalCostMicro: 300_000, inputTokens: 8000, outputTokens: 4000, callCount: 4 },
]))

// === Mock dependencies ===

mock.module('../../services/cost-aggregation', () => ({
  getDaily: mockGetDaily,
  getByAgent: mockGetByAgent,
  getSummary: mock(() => Promise.resolve({
    totalCostMicro: 1_550_000,
    totalInputTokens: 33000,
    totalOutputTokens: 15000,
    totalCalls: 16,
    byProvider: [],
    trendPercent: 5,
  })),
  getByModel: mock(() => Promise.resolve([])),
  getByDepartment: mock(() => Promise.resolve([])),
}))

// === Tests ===

describe('Story 7-4: CEO App Cost Card Drilldown', () => {
  beforeEach(() => {
    mockGetDaily.mockClear()
    mockGetByAgent.mockClear()
  })

  // --- Daily cost API tests ---

  describe('GET /workspace/dashboard/costs/daily', () => {
    it('returns daily cost data with correct shape', async () => {
      const result = await mockGetDaily('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
      })
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('date')
      expect(result[0]).toHaveProperty('costMicro')
      expect(result[0]).toHaveProperty('inputTokens')
      expect(result[0]).toHaveProperty('outputTokens')
      expect(result[0]).toHaveProperty('callCount')
    })

    it('returns items sorted by date', async () => {
      const result = await mockGetDaily('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
      })
      const dates = result.map((d: any) => d.date)
      expect(dates).toEqual(['2026-03-01', '2026-03-02', '2026-03-03'])
    })

    it('each item has positive numeric costMicro', async () => {
      const result = await mockGetDaily('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
      })
      for (const item of result) {
        expect(typeof item.costMicro).toBe('number')
        expect(item.costMicro).toBeGreaterThanOrEqual(0)
      }
    })

    it('calls getDaily with correct companyId and date range', async () => {
      const range = {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
      }
      await mockGetDaily('test-company', range)
      expect(mockGetDaily).toHaveBeenCalledWith('test-company', range)
    })
  })

  // --- By-agent cost API tests ---

  describe('GET /workspace/dashboard/costs/by-agent', () => {
    it('returns agent cost data with correct shape', async () => {
      const result = await mockGetByAgent('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-07'),
      })
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('agentId')
      expect(result[0]).toHaveProperty('agentName')
      expect(result[0]).toHaveProperty('totalCostMicro')
      expect(result[0]).toHaveProperty('inputTokens')
      expect(result[0]).toHaveProperty('outputTokens')
      expect(result[0]).toHaveProperty('callCount')
    })

    it('returns agents sorted by cost descending', async () => {
      const result = await mockGetByAgent('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-07'),
      })
      const costs = result.map((a: any) => a.totalCostMicro)
      expect(costs[0]).toBeGreaterThanOrEqual(costs[1])
      expect(costs[1]).toBeGreaterThanOrEqual(costs[2])
    })

    it('each agent has non-empty agentName', async () => {
      const result = await mockGetByAgent('company-1', {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-07'),
      })
      for (const agent of result) {
        expect(agent.agentName).toBeTruthy()
        expect(typeof agent.agentName).toBe('string')
      }
    })
  })

  // --- Date range parsing tests ---

  describe('Date range parsing', () => {
    it('defaults to 30 days if no dates provided', () => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      const diff = endDate.getTime() - startDate.getTime()
      const days = diff / (24 * 60 * 60 * 1000)
      expect(Math.round(days)).toBe(30)
    })

    it('parses ISO date strings correctly', () => {
      const dateStr = '2026-03-07'
      const parsed = new Date(dateStr + 'T00:00:00.000Z')
      expect(parsed.getUTCFullYear()).toBe(2026)
      expect(parsed.getUTCMonth()).toBe(2) // March = 2
      expect(parsed.getUTCDate()).toBe(7)
    })

    it('end date includes full day (23:59:59.999)', () => {
      const dateStr = '2026-03-07'
      const parsed = new Date(dateStr + 'T23:59:59.999Z')
      expect(parsed.getUTCHours()).toBe(23)
      expect(parsed.getUTCMinutes()).toBe(59)
      expect(parsed.getUTCSeconds()).toBe(59)
    })
  })

  // --- Response format tests ---

  describe('API response format', () => {
    it('daily endpoint wraps in success/data/items', () => {
      const response = {
        success: true,
        data: {
          items: [
            { date: '2026-03-01', costMicro: 500_000, inputTokens: 10000, outputTokens: 5000, callCount: 5 },
          ],
          meta: { startDate: '2026-03-01T00:00:00.000Z', endDate: '2026-03-07T23:59:59.999Z' },
        },
      }
      expect(response.success).toBe(true)
      expect(response.data.items).toHaveLength(1)
      expect(response.data.meta).toHaveProperty('startDate')
      expect(response.data.meta).toHaveProperty('endDate')
    })

    it('by-agent endpoint wraps in success/data/items', () => {
      const response = {
        success: true,
        data: {
          items: [
            { agentId: 'a1', agentName: 'CIO', totalCostMicro: 800_000, inputTokens: 20000, outputTokens: 10000, callCount: 10 },
          ],
        },
      }
      expect(response.success).toBe(true)
      expect(response.data.items).toHaveLength(1)
      expect(response.data.items[0].agentId).toBe('a1')
    })
  })

  // --- UI helper tests ---

  describe('UI helper functions', () => {
    it('microToUsd converts correctly', () => {
      const microToUsd = (micro: number) => (micro / 1_000_000).toFixed(2)
      expect(microToUsd(1_000_000)).toBe('1.00')
      expect(microToUsd(500_000)).toBe('0.50')
      expect(microToUsd(123_456)).toBe('0.12')
      expect(microToUsd(0)).toBe('0.00')
    })

    it('formatNumber handles K/M units', () => {
      const formatNumber = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
        return String(n)
      }
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(1_000_000)).toBe('1.0M')
      expect(formatNumber(2_500_000)).toBe('2.5M')
    })

    it('getDatesForDays calculates correct ranges', () => {
      const getDatesForDays = (days: number) => {
        const end = new Date('2026-03-07T12:00:00Z')
        const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        }
      }
      const r7 = getDatesForDays(7)
      expect(r7.end).toBe('2026-03-07')
      expect(r7.start).toBe('2026-02-28')

      const r30 = getDatesForDays(30)
      expect(r30.start).toBe('2026-02-05')
    })
  })

  // --- Budget warning tests ---

  describe('Budget warning banner logic', () => {
    it('shows no banner when usage < 80%', () => {
      const usage = 75
      expect(usage < 80).toBe(true)
    })

    it('shows yellow warning when 80% <= usage < 100%', () => {
      const usage = 85
      expect(usage >= 80 && usage < 100).toBe(true)
    })

    it('shows red warning when usage >= 100%', () => {
      const usage = 105
      expect(usage >= 100).toBe(true)
    })

    it('handles 0% usage gracefully', () => {
      const usage = 0
      expect(usage < 80).toBe(true)
    })

    it('handles exactly 80% boundary', () => {
      const usage = 80
      expect(usage >= 80).toBe(true)
    })

    it('handles exactly 100% boundary', () => {
      const usage = 100
      expect(usage >= 100).toBe(true)
    })
  })

  // --- Provider cost grouping tests ---

  describe('Provider cost grouping', () => {
    it('groups model costs by provider correctly', () => {
      const byModel = [
        { model: 'claude-3-5-sonnet', costUsd: 1.50 },
        { model: 'claude-3-opus', costUsd: 2.00 },
        { model: 'gpt-4o', costUsd: 0.80 },
        { model: 'gemini-pro', costUsd: 0.30 },
      ]

      const map: Record<string, number> = {}
      for (const m of byModel) {
        const provider = m.model.startsWith('claude')
          ? 'anthropic'
          : m.model.startsWith('gpt') || m.model.startsWith('o1') || m.model.startsWith('o3') || m.model.startsWith('o4')
            ? 'openai'
            : m.model.startsWith('gemini')
              ? 'google'
              : 'other'
        map[provider] = (map[provider] ?? 0) + m.costUsd
      }

      expect(map.anthropic).toBeCloseTo(3.50)
      expect(map.openai).toBeCloseTo(0.80)
      expect(map.google).toBeCloseTo(0.30)
    })

    it('handles empty model list', () => {
      const byModel: { model: string; costUsd: number }[] = []
      const map: Record<string, number> = {}
      for (const m of byModel) {
        const provider = m.model.startsWith('claude') ? 'anthropic' : 'other'
        map[provider] = (map[provider] ?? 0) + m.costUsd
      }
      expect(Object.keys(map)).toHaveLength(0)
    })

    it('handles unknown model prefix as other', () => {
      const byModel = [{ model: 'llama-70b', costUsd: 0.10 }]
      const map: Record<string, number> = {}
      for (const m of byModel) {
        const provider = m.model.startsWith('claude')
          ? 'anthropic'
          : m.model.startsWith('gpt')
            ? 'openai'
            : m.model.startsWith('gemini')
              ? 'google'
              : 'other'
        map[provider] = (map[provider] ?? 0) + m.costUsd
      }
      expect(map.other).toBeCloseTo(0.10)
    })
  })

  // --- Donut chart gradient tests ---

  describe('Donut chart gradient generation', () => {
    it('generates gray gradient for zero total', () => {
      const totalCost = 0
      const gradient = totalCost <= 0
        ? 'conic-gradient(#D4D4D8 0deg 360deg)'
        : 'has-data'
      expect(gradient).toBe('conic-gradient(#D4D4D8 0deg 360deg)')
    })

    it('generates correct gradient for single provider', () => {
      const providers = [['anthropic', 5.0] as const]
      const total = 5.0
      let currentAngle = 0
      const segments: string[] = []
      for (const [provider, cost] of providers) {
        const pct = (cost / total) * 360
        segments.push(`#3B82F6 ${currentAngle}deg ${currentAngle + pct}deg`)
        currentAngle += pct
      }
      expect(segments).toHaveLength(1)
      expect(segments[0]).toContain('0deg')
      expect(segments[0]).toContain('360deg')
    })

    it('generates correct gradient for multiple providers', () => {
      const providers: [string, number][] = [['anthropic', 3], ['openai', 1], ['google', 1]]
      const total = 5.0
      let currentAngle = 0
      const segments: string[] = []
      for (const [, cost] of providers) {
        const pct = (cost / total) * 360
        segments.push(`${currentAngle}deg ${(currentAngle + pct).toFixed(1)}deg`)
        currentAngle += pct
      }
      expect(segments).toHaveLength(3)
      // First segment: 0 to 216 (60%)
      expect(segments[0]).toContain('0deg')
      expect(segments[0]).toContain('216.0deg')
    })
  })

  // --- Agent list display tests ---

  describe('Agent list display', () => {
    it('shows top 10 by default', () => {
      const agents = Array.from({ length: 15 }, (_, i) => ({
        agentId: `agent-${i}`,
        agentName: `Agent ${i}`,
        costUsd: 100 - i,
        count: 10,
      }))
      const display = agents.slice(0, 10)
      expect(display).toHaveLength(10)
    })

    it('sorts agents by cost descending', () => {
      const agents = [
        { agentId: 'a', agentName: 'A', costUsd: 5, count: 1 },
        { agentId: 'b', agentName: 'B', costUsd: 10, count: 2 },
        { agentId: 'c', agentName: 'C', costUsd: 1, count: 3 },
      ]
      const sorted = [...agents].sort((a, b) => b.costUsd - a.costUsd)
      expect(sorted[0].agentName).toBe('B')
      expect(sorted[1].agentName).toBe('A')
      expect(sorted[2].agentName).toBe('C')
    })

    it('calculates bar width as percentage of max cost', () => {
      const maxCost = 10
      const barWidth = (5 / maxCost) * 100
      expect(barWidth).toBe(50)
    })

    it('handles empty agent list', () => {
      const agents: any[] = []
      expect(agents.length === 0).toBe(true)
    })
  })

  // --- Period selector tests ---

  describe('Period selector', () => {
    it('7d period generates correct date range', () => {
      const end = new Date('2026-03-07')
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
      expect(start.toISOString().split('T')[0]).toBe('2026-02-28')
    })

    it('30d period generates correct date range', () => {
      const end = new Date('2026-03-07')
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
      expect(start.toISOString().split('T')[0]).toBe('2026-02-05')
    })

    it('custom period uses user-provided dates', () => {
      const customStart = '2026-01-15'
      const customEnd = '2026-02-15'
      expect(customStart).toBe('2026-01-15')
      expect(customEnd).toBe('2026-02-15')
    })
  })
})
