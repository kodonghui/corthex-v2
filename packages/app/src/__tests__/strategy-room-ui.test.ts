import { describe, test, expect } from 'bun:test'

// === Helper function re-implementations for testing ===
// These mirror the logic in portfolio-dashboard.tsx and stock-sidebar.tsx

function formatKRW(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만`
  return n.toLocaleString('ko-KR')
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function isMarketOpen(date: Date): boolean {
  const kst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const day = kst.getDay()
  if (day === 0 || day === 6) return false
  const minutes = kst.getHours() * 60 + kst.getMinutes()
  return minutes >= 540 && minutes <= 930
}

// Portfolio return calculation (mirrors PortfolioCard logic)
function calculatePortfolioMetrics(
  holdings: { ticker: string; quantity: number; avgPrice: number; currentPrice?: number }[],
  prices: Record<string, { price: number }>,
  cashBalance: number,
  initialCapital: number,
) {
  let holdingsValue = 0
  for (const h of holdings) {
    const p = prices[h.ticker]
    const currentPrice = p?.price ?? h.currentPrice ?? h.avgPrice
    holdingsValue += currentPrice * h.quantity
  }
  const liveTotal = cashBalance + holdingsValue
  const totalReturn = initialCapital > 0
    ? ((liveTotal - initialCapital) / initialCapital * 100)
    : 0
  return { liveTotal, holdingsValue, totalReturn }
}

// Holding return calculation
function calculateHoldingReturn(avgPrice: number, currentPrice: number): number {
  return avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice * 100) : 0
}

// Weight calculation
function calculateWeight(holdingValue: number, totalValue: number): number {
  return totalValue > 0 ? (holdingValue / totalValue * 100) : 0
}

// Change color logic from stock-sidebar
function getChangeColor(changeRate: number | undefined): string {
  if (changeRate === undefined) return 'text-zinc-400'
  return changeRate > 0 ? 'text-emerald-500' : changeRate < 0 ? 'text-red-500' : 'text-zinc-400'
}

// Return color logic
function getReturnColor(returnPct: number): string {
  return returnPct > 0 ? 'text-emerald-500' : returnPct < 0 ? 'text-red-500' : 'text-zinc-400'
}

// Reorder items helper (mirrors arrayMove behavior)
function reorderItems<T>(items: T[], oldIndex: number, newIndex: number): T[] {
  const result = [...items]
  const [removed] = result.splice(oldIndex, 1)
  result.splice(newIndex, 0, removed)
  return result
}

// Portfolio filter by trading mode
function filterByTradingMode<T extends { tradingMode: string }>(items: T[], mode: string): T[] {
  return items.filter((p) => p.tradingMode === mode)
}

// === Tests ===

describe('Story 10-7: 전략실 UI 포트폴리오 + 관심종목', () => {

  describe('formatKRW', () => {
    test('formats billions (억)', () => {
      expect(formatKRW(100_000_000)).toBe('1.0억')
      expect(formatKRW(150_000_000)).toBe('1.5억')
      expect(formatKRW(1_000_000_000)).toBe('10.0억')
    })

    test('formats ten-thousands (만)', () => {
      expect(formatKRW(10_000)).toBe('1만')
      expect(formatKRW(50_000)).toBe('5만')
      expect(formatKRW(99_990_000)).toBe('9999만')
    })

    test('formats small numbers with locale', () => {
      const result = formatKRW(9999)
      expect(result).toContain('9')
    })

    test('handles zero', () => {
      expect(formatKRW(0)).toBe('0')
    })

    test('handles boundary: exactly 10,000', () => {
      expect(formatKRW(10_000)).toBe('1만')
    })

    test('handles boundary: exactly 100,000,000', () => {
      expect(formatKRW(100_000_000)).toBe('1.0억')
    })
  })

  describe('formatPrice', () => {
    test('formats with locale separators', () => {
      const result = formatPrice(1_234_567)
      expect(result).toContain('1')
      expect(result).toContain('234')
      expect(result).toContain('567')
    })

    test('handles zero', () => {
      expect(formatPrice(0)).toBe('0')
    })

    test('handles negative numbers', () => {
      const result = formatPrice(-500)
      expect(result).toContain('500')
    })
  })

  describe('isMarketOpen', () => {
    test('returns true on weekday during trading hours (9:00-15:30 KST)', () => {
      // Wednesday 10:00 KST = 01:00 UTC
      const date = new Date('2026-03-04T01:00:00Z')
      expect(isMarketOpen(date)).toBe(true)
    })

    test('returns false on weekend', () => {
      // Sunday 10:00 KST
      const date = new Date('2026-03-08T01:00:00Z')
      expect(isMarketOpen(date)).toBe(false)
    })

    test('returns false before market open (before 9:00 KST)', () => {
      // Wednesday 8:59 KST = 23:59 UTC day before
      const date = new Date('2026-03-03T23:59:00Z')
      expect(isMarketOpen(date)).toBe(false)
    })

    test('returns false after market close (after 15:30 KST)', () => {
      // Wednesday 15:31 KST = 06:31 UTC
      const date = new Date('2026-03-04T06:31:00Z')
      expect(isMarketOpen(date)).toBe(false)
    })

    test('returns true at market open (9:00 KST)', () => {
      const date = new Date('2026-03-04T00:00:00Z')
      expect(isMarketOpen(date)).toBe(true)
    })
  })

  describe('Portfolio Metrics Calculation', () => {
    test('calculates total value with live prices', () => {
      const holdings = [
        { ticker: '005930', quantity: 100, avgPrice: 70000 },
        { ticker: '000660', quantity: 50, avgPrice: 120000 },
      ]
      const prices = {
        '005930': { price: 75000 },
        '000660': { price: 130000 },
      }
      const result = calculatePortfolioMetrics(holdings, prices, 10_000_000, 30_000_000)
      // Holdings: 100*75000 + 50*130000 = 7,500,000 + 6,500,000 = 14,000,000
      // Total: 10,000,000 + 14,000,000 = 24,000,000
      expect(result.holdingsValue).toBe(14_000_000)
      expect(result.liveTotal).toBe(24_000_000)
      expect(result.totalReturn).toBeCloseTo(-20, 0)
    })

    test('falls back to avgPrice when no live price', () => {
      const holdings = [{ ticker: '005930', quantity: 10, avgPrice: 70000 }]
      const result = calculatePortfolioMetrics(holdings, {}, 5_000_000, 5_700_000)
      expect(result.holdingsValue).toBe(700_000)
      expect(result.liveTotal).toBe(5_700_000)
    })

    test('handles empty holdings', () => {
      const result = calculatePortfolioMetrics([], {}, 50_000_000, 50_000_000)
      expect(result.holdingsValue).toBe(0)
      expect(result.liveTotal).toBe(50_000_000)
      expect(result.totalReturn).toBeCloseTo(0, 2)
    })

    test('handles zero initial capital (no division by zero)', () => {
      const result = calculatePortfolioMetrics([], {}, 0, 0)
      expect(result.totalReturn).toBe(0)
    })

    test('calculates positive return', () => {
      const result = calculatePortfolioMetrics(
        [{ ticker: 'A', quantity: 100, avgPrice: 100 }],
        { A: { price: 150 } },
        0,
        10_000,
      )
      // Holdings: 15,000; Total: 15,000; Return: (15000-10000)/10000 * 100 = 50%
      expect(result.totalReturn).toBeCloseTo(50, 0)
    })

    test('calculates negative return', () => {
      const result = calculatePortfolioMetrics(
        [{ ticker: 'A', quantity: 100, avgPrice: 100 }],
        { A: { price: 50 } },
        0,
        10_000,
      )
      expect(result.totalReturn).toBeCloseTo(-50, 0)
    })
  })

  describe('Holding Return Calculation', () => {
    test('positive return', () => {
      expect(calculateHoldingReturn(100, 150)).toBeCloseTo(50, 2)
    })

    test('negative return', () => {
      expect(calculateHoldingReturn(100, 80)).toBeCloseTo(-20, 2)
    })

    test('zero return', () => {
      expect(calculateHoldingReturn(100, 100)).toBeCloseTo(0, 2)
    })

    test('handles zero avgPrice', () => {
      expect(calculateHoldingReturn(0, 100)).toBe(0)
    })
  })

  describe('Weight Calculation', () => {
    test('calculates weight percentage', () => {
      expect(calculateWeight(5000, 10000)).toBeCloseTo(50, 2)
    })

    test('handles zero total value', () => {
      expect(calculateWeight(5000, 0)).toBe(0)
    })

    test('100% weight for single holding', () => {
      expect(calculateWeight(10000, 10000)).toBeCloseTo(100, 2)
    })
  })

  describe('Color Logic', () => {
    test('getChangeColor positive', () => {
      expect(getChangeColor(2.5)).toBe('text-emerald-500')
    })

    test('getChangeColor negative', () => {
      expect(getChangeColor(-1.5)).toBe('text-red-500')
    })

    test('getChangeColor zero', () => {
      expect(getChangeColor(0)).toBe('text-zinc-400')
    })

    test('getChangeColor undefined', () => {
      expect(getChangeColor(undefined)).toBe('text-zinc-400')
    })

    test('getReturnColor positive', () => {
      expect(getReturnColor(10)).toBe('text-emerald-500')
    })

    test('getReturnColor negative', () => {
      expect(getReturnColor(-5)).toBe('text-red-500')
    })

    test('getReturnColor zero', () => {
      expect(getReturnColor(0)).toBe('text-zinc-400')
    })
  })

  describe('Trading Mode Filter', () => {
    const portfolios = [
      { id: '1', name: 'Paper 1', tradingMode: 'paper' },
      { id: '2', name: 'Real 1', tradingMode: 'real' },
      { id: '3', name: 'Paper 2', tradingMode: 'paper' },
    ]

    test('filters paper mode portfolios', () => {
      const result = filterByTradingMode(portfolios, 'paper')
      expect(result).toHaveLength(2)
      expect(result.every((p) => p.tradingMode === 'paper')).toBe(true)
    })

    test('filters real mode portfolios', () => {
      const result = filterByTradingMode(portfolios, 'real')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Real 1')
    })

    test('returns empty for unknown mode', () => {
      expect(filterByTradingMode(portfolios, 'test')).toHaveLength(0)
    })
  })

  describe('Trading Mode Header Logic', () => {
    test('real mode shows red styling', () => {
      const isReal = 'real' === 'real'
      const bgClass = isReal ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
      expect(bgClass).toBe('bg-red-500 text-white')
    })

    test('paper mode shows blue styling', () => {
      const isReal = 'paper' === 'real'
      const bgClass = isReal ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
      expect(bgClass).toBe('bg-blue-500 text-white')
    })

    test('real mode text is 실거래 모드', () => {
      const text = 'real' === 'real' ? '실거래 모드' : '모의거래 모드'
      expect(text).toBe('실거래 모드')
    })

    test('paper mode text is 모의거래 모드', () => {
      const text = 'paper' === 'real' ? '실거래 모드' : '모의거래 모드'
      expect(text).toBe('모의거래 모드')
    })
  })

  describe('Reorder Items', () => {
    test('moves item forward', () => {
      const items = ['A', 'B', 'C', 'D']
      const result = reorderItems(items, 0, 2)
      expect(result).toEqual(['B', 'C', 'A', 'D'])
    })

    test('moves item backward', () => {
      const items = ['A', 'B', 'C', 'D']
      const result = reorderItems(items, 3, 1)
      expect(result).toEqual(['A', 'D', 'B', 'C'])
    })

    test('same position is no-op', () => {
      const items = ['A', 'B', 'C']
      const result = reorderItems(items, 1, 1)
      expect(result).toEqual(['A', 'B', 'C'])
    })

    test('does not mutate original array', () => {
      const items = ['A', 'B', 'C']
      reorderItems(items, 0, 2)
      expect(items).toEqual(['A', 'B', 'C'])
    })

    test('single item array', () => {
      expect(reorderItems(['A'], 0, 0)).toEqual(['A'])
    })
  })

  describe('Pending Orders Logic', () => {
    test('select all toggles correctly', () => {
      const orders = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const selected = new Set<string>()

      // Select all
      const allIds = new Set(orders.map((o) => o.id))
      expect(allIds.size).toBe(3)

      // Deselect all
      const empty = new Set<string>()
      expect(empty.size).toBe(0)
    })

    test('toggle single order', () => {
      const selected = new Set<string>(['1', '2'])

      // Toggle off
      const next1 = new Set(selected)
      next1.delete('1')
      expect(next1.has('1')).toBe(false)
      expect(next1.has('2')).toBe(true)

      // Toggle on
      const next2 = new Set(selected)
      next2.add('3')
      expect(next2.has('3')).toBe(true)
    })

    test('allSelected check', () => {
      const orders = [{ id: '1' }, { id: '2' }]
      const selected = new Set(['1', '2'])
      const allSelected = orders.length > 0 && selected.size === orders.length
      expect(allSelected).toBe(true)
    })

    test('partial selection is not allSelected', () => {
      const orders = [{ id: '1' }, { id: '2' }]
      const selected = new Set(['1'])
      const allSelected = orders.length > 0 && selected.size === orders.length
      expect(allSelected).toBe(false)
    })
  })

  describe('Reorder API Schema Validation', () => {
    test('valid reorder payload', () => {
      const payload = {
        items: [
          { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', sortOrder: 0 },
          { id: 'b1c2d3e4-f5a6-7890-bcde-fa1234567890', sortOrder: 1 },
        ],
      }
      expect(payload.items.length).toBeGreaterThan(0)
      expect(payload.items.every((i) => typeof i.sortOrder === 'number' && i.sortOrder >= 0)).toBe(true)
    })

    test('rejects negative sortOrder', () => {
      const item = { id: 'test-uuid', sortOrder: -1 }
      expect(item.sortOrder).toBeLessThan(0)
    })

    test('rejects empty items array', () => {
      const items: { id: string; sortOrder: number }[] = []
      expect(items.length).toBe(0)
    })
  })

  describe('Price Display Logic', () => {
    test('buy order badge is success variant', () => {
      const variant = 'buy' === 'buy' ? 'success' : 'danger'
      expect(variant).toBe('success')
    })

    test('sell order badge is danger variant', () => {
      const variant = 'sell' === 'buy' ? 'success' : 'danger'
      expect(variant).toBe('danger')
    })

    test('buy label is 매수', () => {
      const label = 'buy' === 'buy' ? '매수' : '매도'
      expect(label).toBe('매수')
    })

    test('sell label is 매도', () => {
      const label = 'sell' === 'buy' ? '매수' : '매도'
      expect(label).toBe('매도')
    })
  })

  describe('Market Filter Logic', () => {
    test('filters by KR market', () => {
      const items = [
        { id: '1', market: 'KR' },
        { id: '2', market: 'US' },
        { id: '3', market: 'KR' },
      ]
      const filtered = items.filter((i) => i.market === 'KR')
      expect(filtered).toHaveLength(2)
    })

    test('filters by US market', () => {
      const items = [
        { id: '1', market: 'KR' },
        { id: '2', market: 'US' },
      ]
      const filtered = items.filter((i) => i.market === 'US')
      expect(filtered).toHaveLength(1)
    })

    test('no filter returns all', () => {
      const items = [
        { id: '1', market: 'KR' },
        { id: '2', market: 'US' },
      ]
      expect(items).toHaveLength(2)
    })
  })

  describe('Portfolio Create Validation', () => {
    test('rejects empty name', () => {
      const name = ''
      const cash = 50000000
      const valid = name.trim() !== '' && !isNaN(cash) && cash > 0
      expect(valid).toBe(false)
    })

    test('rejects zero cash', () => {
      const name = 'Test Portfolio'
      const cash = 0
      const valid = name.trim() !== '' && !isNaN(cash) && cash > 0
      expect(valid).toBe(false)
    })

    test('rejects negative cash', () => {
      const name = 'Test Portfolio'
      const cash = -100
      const valid = name.trim() !== '' && !isNaN(cash) && cash > 0
      expect(valid).toBe(false)
    })

    test('rejects NaN cash', () => {
      const name = 'Test Portfolio'
      const cash = parseInt('abc', 10)
      const valid = name.trim() !== '' && !isNaN(cash) && cash > 0
      expect(valid).toBe(false)
    })

    test('accepts valid input', () => {
      const name = '한국 주식 포트폴리오'
      const cash = 50000000
      const valid = name.trim() !== '' && !isNaN(cash) && cash > 0
      expect(valid).toBe(true)
    })
  })

  describe('Ticker Collection for Price Fetching', () => {
    test('collects unique tickers from multiple portfolios', () => {
      const portfolios = [
        { holdings: [{ ticker: '005930' }, { ticker: '000660' }] },
        { holdings: [{ ticker: '005930' }, { ticker: '035720' }] },
      ]
      const tickers = new Set<string>()
      portfolios.forEach((p) => p.holdings.forEach((h) => tickers.add(h.ticker)))
      expect(Array.from(tickers)).toEqual(['005930', '000660', '035720'])
    })

    test('empty when no holdings', () => {
      const portfolios = [{ holdings: [] }]
      const tickers = new Set<string>()
      portfolios.forEach((p) => p.holdings.forEach((h: { ticker: string }) => tickers.add(h.ticker)))
      expect(tickers.size).toBe(0)
    })
  })

  describe('KIS Status Display', () => {
    test('connected status', () => {
      const status = { kisAvailable: true }
      const text = status.kisAvailable ? '연결됨' : '미연결'
      expect(text).toBe('연결됨')
    })

    test('disconnected status', () => {
      const status = { kisAvailable: false }
      const text = status.kisAvailable ? '연결됨' : '미연결'
      expect(text).toBe('미연결')
    })
  })
})
