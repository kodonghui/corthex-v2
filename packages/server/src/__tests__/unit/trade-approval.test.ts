import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === Mocks ===

const mockInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => [{ id: 'order-1' }]),
  })),
}))

const mockSelectResult = [{
  id: 'order-1',
  companyId: 'comp-1',
  userId: 'user-1',
  ticker: '005930',
  tickerName: '삼성전자',
  side: 'buy' as const,
  quantity: 10,
  price: 70000,
  totalAmount: 700000,
  orderType: 'limit' as const,
  tradingMode: 'paper' as const,
  status: 'pending_approval',
  reason: 'CIO 분석: PER 저평가',
  agentId: null,
  kisOrderNo: null,
  executedAt: null,
  createdAt: new Date(),
}]

const mockDbSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => mockSelectResult),
    })),
  })),
}))

const mockDbUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => ({
      returning: mock(() => [{ id: 'order-1' }]),
    })),
  })),
}))

mock.module('../../db', () => ({
  db: {
    select: mockDbSelect,
    insert: mockInsert,
    update: mockDbUpdate,
  },
}))

mock.module('../../db/schema', () => ({
  strategyOrders: {
    id: 'id',
    companyId: 'company_id',
    userId: 'user_id',
    status: 'status',
    ticker: 'ticker',
    tickerName: 'ticker_name',
    side: 'side',
    quantity: 'quantity',
    price: 'price',
    totalAmount: 'total_amount',
    orderType: 'order_type',
    tradingMode: 'trading_mode',
    reason: 'reason',
    kisOrderNo: 'kis_order_no',
    executedAt: 'executed_at',
    agentId: 'agent_id',
    createdAt: 'created_at',
  },
  companies: { id: 'id', settings: 'settings', updatedAt: 'updated_at' },
  strategyPortfolios: {
    companyId: 'company_id',
    userId: 'user_id',
    tradingMode: 'trading_mode',
    totalValue: 'total_value',
  },
}))

const mockExecuteOrder = mock(() => Promise.resolve({
  success: true,
  orderId: 'exec-1',
  kisOrderNo: 'KIS-001',
  message: 'OK',
}))

mock.module('../../services/kis-adapter', () => ({
  executeOrder: mockExecuteOrder,
  isKoreanMarketOpen: mock(() => true),
  isUSMarketOpen: mock(() => true),
}))

mock.module('../../services/delegation-tracker', () => ({
  delegationTracker: {
    vectorValidationStarted: mock(() => {}),
    vectorExecutionStarted: mock(() => {}),
    vectorExecutionCompleted: mock(() => {}),
  },
}))

const mockEmit = mock(() => {})
mock.module('../../lib/event-bus', () => ({
  eventBus: { emit: mockEmit },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  and: (...args: unknown[]) => ({ and: args }),
  inArray: (a: unknown, b: unknown) => ({ inArray: [a, b] }),
  gte: (a: unknown, b: unknown) => ({ gte: [a, b] }),
  sql: Object.assign((strings: TemplateStringsArray, ...values: unknown[]) => strings.join(''), {
    raw: (s: string) => s,
  }),
}))

// Mock vector-executor validateOrder (always passes by default)
const mockValidateOrder = mock(() => Promise.resolve({ valid: true }))
mock.module('../../services/vector-executor', () => ({
  validateOrder: mockValidateOrder,
}))

// Mock trading-settings getTradingSettings
mock.module('../../services/trading-settings', () => ({
  getTradingSettings: mock(() => Promise.resolve({
    executionMode: 'approval',
    riskProfile: 'balanced',
    customSettings: {},
    settingsHistory: [],
  })),
  getEffectiveValue: mock((key: string) => {
    const defaults: Record<string, number> = { minConfidence: 65 }
    return defaults[key] ?? 0
  }),
}))

import type { TradeProposal } from '@corthex/shared'

// We test the logic functions directly
describe('Trade Approval Service', () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockExecuteOrder.mockClear()
    mockEmit.mockClear()
    mockDbUpdate.mockClear()
  })

  describe('savePendingOrders', () => {
    test('should filter out low-confidence proposals', async () => {
      const { savePendingOrders } = await import('../../services/trade-approval')

      const proposals: TradeProposal[] = [
        { ticker: '005930', tickerName: '삼성전자', side: 'buy', quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR' },
        { ticker: '035720', tickerName: '카카오', side: 'buy', quantity: 5, price: 50000, reason: 'test', confidence: 0.4, market: 'KR' }, // below 0.6
      ]

      const result = await savePendingOrders({
        proposals,
        companyId: 'comp-1',
        userId: 'user-1',
        commandId: 'cmd-1',
        tradingMode: 'paper',
      })

      expect(result.length).toBe(1) // Only 1 passes confidence threshold
    })

    test('should emit WebSocket notification for pending orders', async () => {
      const { savePendingOrders } = await import('../../services/trade-approval')

      const proposals: TradeProposal[] = [
        { ticker: '005930', tickerName: '삼성전자', side: 'buy', quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR' },
      ]

      await savePendingOrders({
        proposals,
        companyId: 'comp-1',
        userId: 'user-1',
        commandId: 'cmd-1',
        tradingMode: 'paper',
      })

      expect(mockEmit).toHaveBeenCalled()
    })
  })

  describe('approveOrder', () => {
    test('should execute order via KIS when approved', async () => {
      const { approveOrder } = await import('../../services/trade-approval')

      const result = await approveOrder('order-1', 'comp-1', 'user-1')

      expect(result.action).toBe('approve')
      expect(result.orderId).toBe('order-1')
    })

    test('should handle KIS execution failure', async () => {
      mockExecuteOrder.mockImplementationOnce(() => Promise.resolve({
        success: false,
        message: 'Insufficient funds',
      }))

      const { approveOrder } = await import('../../services/trade-approval')
      const result = await approveOrder('order-1', 'comp-1', 'user-1')

      expect(result.success).toBe(false)
    })
  })

  describe('rejectOrder', () => {
    test('should set status to rejected', async () => {
      const { rejectOrder } = await import('../../services/trade-approval')
      const result = await rejectOrder('order-1', 'comp-1', 'CEO 판단')

      expect(result.action).toBe('reject')
      expect(result.orderId).toBe('order-1')
    })

    test('should handle missing order', async () => {
      // Override mock to return empty
      mockDbUpdate.mockImplementationOnce(() => ({
        set: mock(() => ({
          where: mock(() => ({
            returning: mock(() => []),
          })),
        })),
      }))

      const { rejectOrder } = await import('../../services/trade-approval')
      const result = await rejectOrder('nonexistent', 'comp-1')

      expect(result.success).toBe(false)
      expect(result.message).toContain('찾을 수 없습니다')
    })
  })

  describe('bulkApprove', () => {
    test('should process multiple orders', async () => {
      const { bulkApprove } = await import('../../services/trade-approval')
      const results = await bulkApprove(['order-1', 'order-2'], 'comp-1', 'user-1')

      expect(results.length).toBe(2)
      expect(results[0].action).toBe('approve')
    })
  })

  describe('bulkReject', () => {
    test('should reject multiple orders', async () => {
      const { bulkReject } = await import('../../services/trade-approval')
      const results = await bulkReject(['order-1', 'order-2'], 'comp-1', '시장 상황 변동')

      expect(results.length).toBe(2)
      expect(results[0].action).toBe('reject')
    })
  })
})
