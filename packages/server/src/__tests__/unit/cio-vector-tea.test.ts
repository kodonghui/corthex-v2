import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { parseTradeProposals } from '../../services/cio-orchestrator'
import {
  validateConfidence,
  validateMarketHours,
  formatCIOVectorResult,
} from '../../services/vector-executor'
import type { TradeProposal, VectorExecutionResult, VectorOrderResult } from '@corthex/shared'

// === TEA: Risk-Based Test Coverage for CIO+VECTOR ===
// Priority: P0 (Critical Path) + P1 (Edge Cases)

describe('TEA P0: parseTradeProposals - boundary cases', () => {
  it('should handle very large proposal arrays', () => {
    const proposals = Array.from({ length: 50 }, (_, i) => ({
      ticker: `00${i}`,
      tickerName: `Stock ${i}`,
      side: i % 2 === 0 ? 'buy' : 'sell',
      quantity: i + 1,
      price: 1000 * (i + 1),
      reason: `Reason ${i}`,
      confidence: 0.5 + (i % 5) * 0.1,
      market: i % 3 === 0 ? 'US' : 'KR',
    }))

    const content = `[TRADE_PROPOSALS]\n${JSON.stringify(proposals)}\n[/TRADE_PROPOSALS]`
    const parsed = parseTradeProposals(content)
    expect(parsed).toHaveLength(50)
  })

  it('should handle proposals with unicode characters', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "tickerName": "삼성전자 주식회사", "side": "buy", "quantity": 1, "price": 70000, "reason": "PER 저평가 + 기술적 반등 🚀", "confidence": 0.8, "market": "KR"}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals).toHaveLength(1)
    expect(proposals[0].tickerName).toBe('삼성전자 주식회사')
    expect(proposals[0].reason).toContain('🚀')
  })

  it('should handle proposals with extra fields (forward compat)', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "test", "confidence": 0.8, "market": "KR", "urgency": "high", "sector": "tech", "targetPrice": 80000}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals).toHaveLength(1)
    expect(proposals[0].ticker).toBe('005930')
    // Extra fields should be silently ignored
  })

  it('should handle nested JSON in reason field', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "분석: {\\"pe\\": 12, \\"pb\\": 1.5}", "confidence": 0.8, "market": "KR"}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals).toHaveLength(1)
  })

  it('should handle float quantity and price', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "AAPL", "side": "buy", "quantity": 1.5, "price": 180.50, "reason": "test", "confidence": 0.8, "market": "US"}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals[0].quantity).toBe(1.5)
    expect(proposals[0].price).toBe(180.50)
  })
})

describe('TEA P0: validateConfidence edge cases', () => {
  it('should handle exactly 0.6 (boundary)', () => {
    expect(validateConfidence(0.6).valid).toBe(true)
  })

  it('should handle 0.59999 (just below boundary)', () => {
    expect(validateConfidence(0.59999).valid).toBe(false)
  })

  it('should handle NaN', () => {
    expect(validateConfidence(NaN).valid).toBe(false)
  })

  it('should handle Infinity', () => {
    expect(validateConfidence(Infinity).valid).toBe(false)
  })
})

describe('TEA P0: validateMarketHours edge cases', () => {
  it('should handle unknown market with paper mode', () => {
    // Paper mode always passes regardless of market
    expect(validateMarketHours('KR', 'paper').valid).toBe(true)
    expect(validateMarketHours('US', 'paper').valid).toBe(true)
  })
})

describe('TEA P1: formatCIOVectorResult edge cases', () => {
  it('should handle empty analysis report with vector results', () => {
    const vectorResult: VectorExecutionResult = {
      totalProposals: 1,
      executed: 1,
      skipped: 0,
      failed: 0,
      orders: [{
        proposal: {
          ticker: '005930', tickerName: '삼성전자', side: 'buy',
          quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR',
        },
        status: 'executed',
        orderId: 'ord-1',
      }],
      totalDurationMs: 500,
    }

    const result = formatCIOVectorResult('', vectorResult)
    expect(result).toContain('VECTOR 매매 실행 결과')
  })

  it('should handle very long analysis report', () => {
    const longReport = 'A'.repeat(10000)
    const result = formatCIOVectorResult(longReport, null)
    expect(result).toBe(longReport)
    expect(result.length).toBe(10000)
  })

  it('should handle all-failed execution', () => {
    const proposal: TradeProposal = {
      ticker: '005930', tickerName: '삼성전자', side: 'buy',
      quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR',
    }

    const vectorResult: VectorExecutionResult = {
      totalProposals: 3,
      executed: 0,
      skipped: 0,
      failed: 3,
      orders: [
        { proposal, status: 'failed', reason: 'API Error 1' },
        { proposal: { ...proposal, ticker: 'AAPL' }, status: 'failed', reason: 'API Error 2' },
        { proposal: { ...proposal, ticker: 'TSLA' }, status: 'failed', reason: 'API Error 3' },
      ],
      totalDurationMs: 1000,
    }

    const result = formatCIOVectorResult('## Report', vectorResult)
    expect(result).toContain('실행 완료: 0건')
    expect(result).toContain('실패: 3건')
  })

  it('should handle all-skipped execution', () => {
    const proposal: TradeProposal = {
      ticker: '005930', tickerName: '삼성전자', side: 'buy',
      quantity: 10, price: 70000, reason: 'test', confidence: 0.4, market: 'KR',
    }

    const vectorResult: VectorExecutionResult = {
      totalProposals: 2,
      executed: 0,
      skipped: 2,
      failed: 0,
      orders: [
        { proposal, status: 'skipped', reason: '낮은 확신도' },
        { proposal: { ...proposal, ticker: 'AAPL' }, status: 'skipped', reason: '시장 시간 외' },
      ],
      totalDurationMs: 100,
    }

    const result = formatCIOVectorResult('## Report', vectorResult)
    expect(result).toContain('건너뜀: 2건')
    expect(result).toContain('실행 완료: 0건')
  })

  it('should handle zero duration', () => {
    const vectorResult: VectorExecutionResult = {
      totalProposals: 1,
      executed: 1,
      skipped: 0,
      failed: 0,
      orders: [{
        proposal: {
          ticker: '005930', tickerName: '삼성전자', side: 'buy',
          quantity: 10, price: 70000, reason: 'test', confidence: 0.8, market: 'KR',
        },
        status: 'executed',
      }],
      totalDurationMs: 0,
    }

    const result = formatCIOVectorResult('Report', vectorResult)
    expect(result).toContain('0.0초')
  })
})

describe('TEA P1: Trade proposal parsing robustness', () => {
  it('should handle proposals with null values', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": null, "price": null, "reason": null, "confidence": null, "market": null}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals).toHaveLength(1)
    expect(proposals[0].quantity).toBe(0)
    expect(proposals[0].price).toBe(0)
    expect(proposals[0].confidence).toBe(0)
    expect(proposals[0].market).toBe('KR') // default
  })

  it('should handle proposals with string numbers', () => {
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": "10", "price": "70000", "reason": "test", "confidence": "0.85", "market": "KR"}]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals[0].quantity).toBe(10)
    expect(proposals[0].price).toBe(70000)
    expect(proposals[0].confidence).toBe(0.85)
  })

  it('should handle malformed proposal entries mixed with valid ones', () => {
    const content = `[TRADE_PROPOSALS]
[
  {"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "valid", "confidence": 0.8, "market": "KR"},
  null,
  42,
  "invalid",
  {"ticker": "AAPL", "side": "sell", "quantity": 5, "price": 180, "reason": "also valid", "confidence": 0.7, "market": "US"}
]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    expect(proposals).toHaveLength(2) // Only valid objects with ticker+side
  })

  it('should handle TRADE_PROPOSALS with trailing comma in JSON', () => {
    // Note: JSON with trailing commas is technically invalid,
    // but we should verify the parser handles it gracefully (returns empty)
    const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy",},]
[/TRADE_PROPOSALS]`

    const proposals = parseTradeProposals(content)
    // JSON.parse will fail on trailing comma, returns empty
    expect(proposals).toEqual([])
  })
})

describe('TEA P0: DelegationEventType coverage', () => {
  it('should import DelegationTracker with new CIO/VECTOR event types', async () => {
    const { DelegationTracker } = await import('../../services/delegation-tracker')
    const tracker = new DelegationTracker()

    // Verify new methods exist
    expect(typeof tracker.cioPhaseStarted).toBe('function')
    expect(typeof tracker.cioPhaseCompleted).toBe('function')
    expect(typeof tracker.vectorValidationStarted).toBe('function')
    expect(typeof tracker.vectorExecutionStarted).toBe('function')
    expect(typeof tracker.vectorExecutionCompleted).toBe('function')
  })
})

describe('TEA P0: CIO Orchestrator module exports', () => {
  it('should export orchestrateCIO function', async () => {
    const mod = await import('../../services/cio-orchestrator')
    expect(typeof mod.orchestrateCIO).toBe('function')
    expect(typeof mod.parseTradeProposals).toBe('function')
  })
})

describe('TEA P0: VECTOR Executor module exports', () => {
  it('should export all required functions', async () => {
    const mod = await import('../../services/vector-executor')
    expect(typeof mod.executeProposals).toBe('function')
    expect(typeof mod.validateOrder).toBe('function')
    expect(typeof mod.validateConfidence).toBe('function')
    expect(typeof mod.validateMarketHours).toBe('function')
    expect(typeof mod.validateDailyLimit).toBe('function')
    expect(typeof mod.formatCIOVectorResult).toBe('function')
  })
})

describe('TEA P0: Chief-of-Staff integration', () => {
  it('should export isInvestmentDepartment function', async () => {
    const mod = await import('../../services/chief-of-staff')
    expect(typeof mod.isInvestmentDepartment).toBe('function')
  })
})

describe('TEA P0: Shared types', () => {
  it('should export CIO/VECTOR types', async () => {
    // Verify types compile correctly by importing them
    const types = await import('@corthex/shared')
    // Type-level check — these are type exports so we verify the module loads
    expect(types).toBeDefined()
  })
})
