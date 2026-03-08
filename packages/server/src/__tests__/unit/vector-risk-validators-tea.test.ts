import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === TEA-generated tests for Story 10-5 risk validators ===
// Covers: validatePositionSize, validateDailyLoss, validateDailyLimit, validateOrder

// === Mock setup ===

let mockSelectResult: unknown[] = []

const mockDbSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => mockSelectResult),
    })),
  })),
}))

// For validateDailyLimit which uses select().from().where() without limit
const mockDbSelectCount = mock(() => ({
  from: mock(() => ({
    where: mock(() => [{ count: 0 }]),
  })),
}))

mock.module('../../db', () => ({
  db: {
    select: (...args: unknown[]) => {
      // Route based on call pattern
      const result = mockDbSelect(...args)
      return result
    },
  },
}))

mock.module('../../db/schema', () => ({
  strategyOrders: {
    companyId: 'company_id',
    tradingMode: 'trading_mode',
    createdAt: 'created_at',
    userId: 'user_id',
    status: 'status',
    side: 'side',
    totalAmount: 'total_amount',
  },
  strategyPortfolios: {
    companyId: 'company_id',
    userId: 'user_id',
    tradingMode: 'trading_mode',
    totalValue: 'total_value',
  },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  and: (...args: unknown[]) => ({ and: args }),
  gte: (a: unknown, b: unknown) => ({ gte: [a, b] }),
  sql: Object.assign((strings: TemplateStringsArray, ...values: unknown[]) => strings.join(''), {
    raw: (s: string) => s,
  }),
}))

const mockIsKoreanMarketOpen = mock(() => true)
const mockIsUSMarketOpen = mock(() => true)

mock.module('../../services/kis-adapter', () => ({
  isKoreanMarketOpen: mockIsKoreanMarketOpen,
  isUSMarketOpen: mockIsUSMarketOpen,
  executeOrder: mock(() => Promise.resolve({ success: true, orderId: 'o1', kisOrderNo: 'K1' })),
}))

mock.module('../../services/delegation-tracker', () => ({
  delegationTracker: {
    vectorValidationStarted: mock(() => {}),
    vectorExecutionStarted: mock(() => {}),
    vectorExecutionCompleted: mock(() => {}),
  },
}))

mock.module('../../services/trading-settings', () => ({
  getTradingSettings: mock(() => Promise.resolve({
    executionMode: 'autonomous',
    riskProfile: 'balanced',
    customSettings: {},
    settingsHistory: [],
  })),
  getEffectiveValue: mock((key: string) => {
    const defaults: Record<string, number> = {
      minConfidence: 65,
      maxDailyTrades: 10,
      maxPositionPct: 20,
      maxDailyLossPct: 3,
    }
    return defaults[key] ?? 0
  }),
}))

import {
  validatePositionSize,
  validateDailyLoss,
  validateDailyLimit,
  validateOrder,
  validateConfidence,
  validateMarketHours,
} from '../../services/vector-executor'
import type { TradeProposal, TradingSettings } from '@corthex/shared'

describe('TEA: Vector Risk Validators', () => {
  beforeEach(() => {
    mockSelectResult = []
    mockDbSelect.mockClear()
  })

  // === validatePositionSize ===

  describe('validatePositionSize', () => {
    const buyProposal: TradeProposal = {
      ticker: '005930', tickerName: '삼성전자', side: 'buy',
      quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR',
    }

    test('should skip check for sell orders', async () => {
      const sellProposal = { ...buyProposal, side: 'sell' as const }
      const result = await validatePositionSize(sellProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should pass when no portfolio exists', async () => {
      mockSelectResult = [] // No portfolio found
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should pass when portfolio totalValue is 0', async () => {
      mockSelectResult = [{ totalValue: 0 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should pass when portfolio totalValue is negative', async () => {
      mockSelectResult = [{ totalValue: -100 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should pass when position size is within limit', async () => {
      // orderValue = 10 * 70000 = 700,000. portfolio = 10,000,000
      // positionPct = 7% < 20%
      mockSelectResult = [{ totalValue: 10_000_000 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should fail when position size exceeds limit', async () => {
      // orderValue = 10 * 70000 = 700,000. portfolio = 1,000,000
      // positionPct = 70% > 20%
      mockSelectResult = [{ totalValue: 1_000_000 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('종목 비중 초과')
      expect(result.reason).toContain('70.0%')
      expect(result.reason).toContain('20%')
    })

    test('should work at exact boundary', async () => {
      // orderValue = 10 * 70000 = 700,000. portfolio = 3,500,000
      // positionPct = 20% == 20% (not greater, should pass)
      mockSelectResult = [{ totalValue: 3_500_000 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(true)
    })

    test('should fail at just above boundary', async () => {
      // orderValue = 700,000. portfolio = 3,499,999
      // positionPct = 20.0000% > 20% (just barely above)
      mockSelectResult = [{ totalValue: 3_499_999 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 20)
      expect(result.valid).toBe(false)
    })

    test('should use conservative profile limit', async () => {
      // Conservative: maxPositionPct = 10%
      // orderValue = 700,000. portfolio = 5,000,000
      // positionPct = 14% > 10%
      mockSelectResult = [{ totalValue: 5_000_000 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 10)
      expect(result.valid).toBe(false)
    })

    test('should use aggressive profile limit', async () => {
      // Aggressive: maxPositionPct = 30%
      // orderValue = 700,000. portfolio = 5,000,000
      // positionPct = 14% < 30%
      mockSelectResult = [{ totalValue: 5_000_000 }]
      const result = await validatePositionSize(buyProposal, 'comp-1', 'user-1', 'paper', 30)
      expect(result.valid).toBe(true)
    })
  })

  // === validateDailyLoss ===

  describe('validateDailyLoss', () => {
    test('should pass when no portfolio exists', async () => {
      // First call returns sell sum, second call returns empty portfolio
      let callCount = 0
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++
            if (callCount === 1) return [{ totalSold: 0 }] // sell sum
            return { limit: mock(() => []) } // no portfolio
          }),
        })),
      }))

      const result = await validateDailyLoss('comp-1', 'user-1', 'paper', 3)
      expect(result.valid).toBe(true)
    })

    test('should pass when portfolio totalValue is 0', async () => {
      let callCount = 0
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++
            if (callCount === 1) return [{ totalSold: 0 }]
            return { limit: mock(() => [{ totalValue: 0 }]) }
          }),
        })),
      }))

      const result = await validateDailyLoss('comp-1', 'user-1', 'paper', 3)
      expect(result.valid).toBe(true)
    })

    test('should pass when daily sell activity is below threshold', async () => {
      let callCount = 0
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++
            if (callCount === 1) return [{ totalSold: 100000 }]
            return { limit: mock(() => [{ totalValue: 10_000_000 }]) }
          }),
        })),
      }))

      // dailySellPct = (100000/10000000)*100 = 1%, threshold = 3*10 = 30%
      const result = await validateDailyLoss('comp-1', 'user-1', 'paper', 3)
      expect(result.valid).toBe(true)
    })

    test('should fail when daily sell activity exceeds threshold', async () => {
      let callCount = 0
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => {
            callCount++
            if (callCount === 1) return [{ totalSold: 5_000_000 }]
            return { limit: mock(() => [{ totalValue: 10_000_000 }]) }
          }),
        })),
      }))

      // dailySellPct = (5000000/10000000)*100 = 50%, threshold = 3*10 = 30%
      const result = await validateDailyLoss('comp-1', 'user-1', 'paper', 3)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('손실 한도')
    })
  })

  // === validateDailyLimit ===

  describe('validateDailyLimit', () => {
    test('should pass when count is below limit', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 5 }]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper', 10)
      expect(result.valid).toBe(true)
    })

    test('should fail when count equals limit', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 10 }]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper', 10)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('일일 매매 한도 초과')
    })

    test('should fail when count exceeds limit', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 15 }]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper', 10)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('15/10')
    })

    test('should use fallback limit if not specified', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 19 }]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper')
      expect(result.valid).toBe(true) // default limit is 20
    })

    test('should handle null count result', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: null }]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper', 10)
      expect(result.valid).toBe(true) // null coalesces to 0
    })

    test('should handle missing result', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [undefined]),
        })),
      }))

      const result = await validateDailyLimit('comp-1', 'paper', 10)
      expect(result.valid).toBe(true) // undefined?.count coalesces to 0
    })
  })

  // === validateOrder (full chain) ===

  describe('validateOrder', () => {
    const validProposal: TradeProposal = {
      ticker: '005930', tickerName: '삼성전자', side: 'buy',
      quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR',
    }

    test('should pass basic validation without settings', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 0 }]),
        })),
      }))

      const result = await validateOrder(validProposal, 'comp-1', 'paper')
      expect(result.valid).toBe(true)
    })

    test('should fail on low confidence', async () => {
      const lowConfProposal = { ...validProposal, confidence: 0.3 }
      const result = await validateOrder(lowConfProposal, 'comp-1', 'paper')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('확신도')
    })

    test('should fail on zero quantity', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 0 }]),
        })),
      }))

      const zeroQtyProposal = { ...validProposal, quantity: 0 }
      const result = await validateOrder(zeroQtyProposal, 'comp-1', 'paper')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('수량')
    })

    test('should fail on negative quantity', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 0 }]),
        })),
      }))

      const negQtyProposal = { ...validProposal, quantity: -5 }
      const result = await validateOrder(negQtyProposal, 'comp-1', 'paper')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('수량')
    })

    test('should use dynamic confidence from settings', async () => {
      mockDbSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => [{ count: 0 }]),
        })),
      }))

      // Settings with minConfidence = 65 (0.65 after /100)
      const settings: TradingSettings = {
        executionMode: 'autonomous',
        riskProfile: 'balanced',
        customSettings: {},
        settingsHistory: [],
      }

      // confidence 0.6 < 0.65 threshold
      const borderlineProposal = { ...validProposal, confidence: 0.6 }
      const result = await validateOrder(borderlineProposal, 'comp-1', 'paper', settings)
      expect(result.valid).toBe(false)
    })

    test('should check market hours for real trading', async () => {
      mockIsKoreanMarketOpen.mockReturnValueOnce(false)

      const result = await validateOrder(validProposal, 'comp-1', 'real')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('시장 운영 시간')
    })
  })

  // === Edge cases: market hours ===

  describe('validateMarketHours edge cases', () => {
    test('should fail when KR market is closed for real trading', () => {
      mockIsKoreanMarketOpen.mockReturnValueOnce(false)
      const result = validateMarketHours('KR', 'real')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('한국 시장')
    })

    test('should fail when US market is closed for real trading', () => {
      mockIsUSMarketOpen.mockReturnValueOnce(false)
      const result = validateMarketHours('US', 'real')
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('미국 시장')
    })
  })
})
