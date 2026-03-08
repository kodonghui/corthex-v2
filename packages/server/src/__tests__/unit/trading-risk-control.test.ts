import { describe, test, expect, mock } from 'bun:test'

// === Mock DB ===
const mockSelectResult: unknown[] = []

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => mockSelectResult),
        })),
      })),
    })),
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
    isActive: 'is_active',
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

mock.module('../../services/kis-adapter', () => ({
  isKoreanMarketOpen: mock(() => true),
  isUSMarketOpen: mock(() => true),
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
  validateMarketHours,
  validateConfidence,
} from '../../services/vector-executor'
import type { TradeProposal, TradingSettings } from '@corthex/shared'

describe('Vector Executor Risk Control', () => {
  describe('validateMarketHours', () => {
    test('paper trading always passes', () => {
      const result = validateMarketHours('KR', 'paper')
      expect(result.valid).toBe(true)
    })

    test('real trading checks KR market hours', () => {
      const result = validateMarketHours('KR', 'real')
      expect(result.valid).toBe(true) // mocked isKoreanMarketOpen returns true
    })

    test('real trading checks US market hours', () => {
      const result = validateMarketHours('US', 'real')
      expect(result.valid).toBe(true) // mocked isUSMarketOpen returns true
    })
  })

  describe('validateConfidence', () => {
    test('should pass when confidence >= minimum', () => {
      expect(validateConfidence(0.8, 0.6).valid).toBe(true)
      expect(validateConfidence(0.65, 0.65).valid).toBe(true)
      expect(validateConfidence(1.0, 0.5).valid).toBe(true)
    })

    test('should fail when confidence < minimum', () => {
      const result = validateConfidence(0.5, 0.6)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('확신도')
    })

    test('should use dynamic minimum from risk profile', () => {
      // Conservative: minConfidence = 75%
      expect(validateConfidence(0.7, 0.75).valid).toBe(false)
      expect(validateConfidence(0.8, 0.75).valid).toBe(true)

      // Aggressive: minConfidence = 55%
      expect(validateConfidence(0.5, 0.55).valid).toBe(false)
      expect(validateConfidence(0.6, 0.55).valid).toBe(true)
    })

    test('should handle NaN confidence', () => {
      const result = validateConfidence(NaN, 0.6)
      expect(result.valid).toBe(false)
    })

    test('should handle Infinity confidence', () => {
      const result = validateConfidence(Infinity, 0.6)
      expect(result.valid).toBe(false)
    })

    test('should handle negative confidence', () => {
      const result = validateConfidence(-0.5, 0.6)
      expect(result.valid).toBe(false)
    })

    test('should use default fallback if no minimum specified', () => {
      expect(validateConfidence(0.65).valid).toBe(true) // default 0.6
      expect(validateConfidence(0.55).valid).toBe(false)
    })
  })

  describe('formatCIOVectorResult', () => {
    test('should format pending approval message', async () => {
      const { formatCIOVectorResult } = await import('../../services/vector-executor')

      const result = formatCIOVectorResult('분석 결과', null, true, 3)
      expect(result).toContain('승인 대기')
      expect(result).toContain('3건')
    })

    test('should format standard execution result', async () => {
      const { formatCIOVectorResult } = await import('../../services/vector-executor')

      const vectorResult = {
        totalProposals: 2,
        executed: 1,
        skipped: 1,
        failed: 0,
        orders: [
          {
            proposal: { ticker: '005930', tickerName: '삼성전자', side: 'buy' as const, quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR' as const },
            status: 'executed' as const,
            orderId: 'o1',
            kisOrderNo: 'K1',
          },
          {
            proposal: { ticker: '035720', tickerName: '카카오', side: 'sell' as const, quantity: 5, price: 50000, reason: 'test', confidence: 0.7, market: 'KR' as const },
            status: 'skipped' as const,
            reason: '한도 초과',
          },
        ],
        totalDurationMs: 1500,
      }

      const result = formatCIOVectorResult('분석 결과', vectorResult)
      expect(result).toContain('VECTOR 매매 실행 결과')
      expect(result).toContain('실행 완료: 1건')
      expect(result).toContain('건너뜀: 1건')
      expect(result).toContain('삼성전자')
      expect(result).toContain('K1') // KIS order number
    })

    test('should return analysis only when no proposals', async () => {
      const { formatCIOVectorResult } = await import('../../services/vector-executor')

      const result = formatCIOVectorResult('분석 결과', null)
      expect(result).toBe('분석 결과')
    })
  })
})
