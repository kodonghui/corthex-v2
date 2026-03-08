import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { parseTradeProposals } from '../../services/cio-orchestrator'
import {
  validateConfidence,
  validateMarketHours,
  formatCIOVectorResult,
} from '../../services/vector-executor'
import type { TradeProposal, VectorExecutionResult, VectorOrderResult } from '@corthex/shared'

// === DelegationTracker CIO/VECTOR Event Types ===

describe('CIO+VECTOR Integration', () => {
  describe('CIO → VECTOR pipeline', () => {
    it('should parse CIO output and validate proposals for VECTOR execution', () => {
      // Step 1: CIO generates report with trade proposals
      const cioOutput = `# 투자 분석 보고서

## 결론
삼성전자와 Apple 매수 추천, Tesla 매도 추천

## 분석
전문가 분석에 따르면...

## 리스크
시장 변동성 주의

## 매매 제안

[TRADE_PROPOSALS]
[
  {"ticker": "005930", "tickerName": "삼성전자", "side": "buy", "quantity": 10, "price": 70000, "reason": "PER 저평가", "confidence": 0.85, "market": "KR"},
  {"ticker": "AAPL", "tickerName": "Apple", "side": "buy", "quantity": 5, "price": 180, "reason": "실적 호조", "confidence": 0.75, "market": "US"},
  {"ticker": "TSLA", "tickerName": "Tesla", "side": "sell", "quantity": 3, "price": 250, "reason": "과대평가", "confidence": 0.55, "market": "US"}
]
[/TRADE_PROPOSALS]`

      // Step 2: VECTOR parses proposals
      const proposals = parseTradeProposals(cioOutput)
      expect(proposals).toHaveLength(3)

      // Step 3: VECTOR validates each proposal
      // Samsung (0.85) should pass confidence check
      expect(validateConfidence(proposals[0].confidence).valid).toBe(true)
      // Apple (0.75) should pass confidence check
      expect(validateConfidence(proposals[1].confidence).valid).toBe(true)
      // Tesla (0.55) should FAIL confidence check — below 0.6 threshold
      expect(validateConfidence(proposals[2].confidence).valid).toBe(false)
    })

    it('should handle CIO output with no trade proposals gracefully', () => {
      const cioOutput = `# 투자 분석 보고서

## 결론
현재 시장 상황에서 적극적 매매는 비추천

## 분석
변동성이 너무 높음

[TRADE_PROPOSALS]
[]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(cioOutput)
      expect(proposals).toHaveLength(0)

      // No proposals → formatResult returns analysis only
      const result = formatCIOVectorResult(cioOutput, null)
      expect(result).toBe(cioOutput)
    })

    it('should handle CIO output without TRADE_PROPOSALS block', () => {
      const cioOutput = `# 분석 보고서
일반적인 분석만 수행함`

      const proposals = parseTradeProposals(cioOutput)
      expect(proposals).toHaveLength(0)
    })
  })

  describe('VECTOR result formatting', () => {
    it('should format mixed execution results correctly', () => {
      const baseProposal: TradeProposal = {
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70000,
        reason: 'test',
        confidence: 0.85,
        market: 'KR',
      }

      const vectorResult: VectorExecutionResult = {
        totalProposals: 3,
        executed: 1,
        skipped: 1,
        failed: 1,
        orders: [
          {
            proposal: baseProposal,
            status: 'executed',
            orderId: 'ord-123',
            kisOrderNo: 'KIS456',
          },
          {
            proposal: { ...baseProposal, ticker: 'AAPL', tickerName: 'Apple', confidence: 0.5 },
            status: 'skipped',
            reason: '확신도 50% — 최소 60% 필요',
          },
          {
            proposal: { ...baseProposal, ticker: 'TSLA', tickerName: 'Tesla' },
            status: 'failed',
            reason: 'KIS API 오류',
          },
        ],
        totalDurationMs: 3200,
      }

      const formatted = formatCIOVectorResult('## CIO 분석', vectorResult)

      // Check structure
      expect(formatted).toContain('## CIO 분석')
      expect(formatted).toContain('VECTOR 매매 실행 결과')
      expect(formatted).toContain('3.2초')

      // Check order details
      expect(formatted).toContain('삼성전자')
      expect(formatted).toContain('Apple')
      expect(formatted).toContain('Tesla')
      expect(formatted).toContain('KIS456')
    })
  })

  describe('Paper vs Real trading validation', () => {
    it('paper trading should always pass market hours', () => {
      expect(validateMarketHours('KR', 'paper').valid).toBe(true)
      expect(validateMarketHours('US', 'paper').valid).toBe(true)
    })
  })

  describe('TradeProposal edge cases', () => {
    it('should handle proposals with missing optional fields', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals).toHaveLength(1)
      expect(proposals[0].tickerName).toBe('005930')
      expect(proposals[0].quantity).toBe(0)
      expect(proposals[0].price).toBe(0)
      expect(proposals[0].reason).toBe('')
      expect(proposals[0].confidence).toBe(0)
      expect(proposals[0].market).toBe('KR')
    })

    it('should handle multiple TRADE_PROPOSALS blocks (use first)', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "first", "confidence": 0.8, "market": "KR"}]
[/TRADE_PROPOSALS]
Some text
[TRADE_PROPOSALS]
[{"ticker": "AAPL", "side": "sell", "quantity": 5, "price": 180, "reason": "second", "confidence": 0.7, "market": "US"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      // Should match first block
      expect(proposals).toHaveLength(1)
      expect(proposals[0].ticker).toBe('005930')
    })

    it('should handle proposals with whitespace in block markers', () => {
      const content = `[TRADE_PROPOSALS]

  [
    {"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "test", "confidence": 0.85, "market": "KR"}
  ]

[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals).toHaveLength(1)
    })
  })
})
