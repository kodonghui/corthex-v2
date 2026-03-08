import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test'
import {
  validateConfidence,
  validateMarketHours,
  formatCIOVectorResult,
  type OrderValidation,
} from '../../services/vector-executor'
import type { TradeProposal, VectorExecutionResult } from '@corthex/shared'

// === validateConfidence Tests ===

describe('VECTOR Executor', () => {
  describe('validateConfidence', () => {
    it('should pass for confidence >= 0.6', () => {
      expect(validateConfidence(0.6)).toEqual({ valid: true })
      expect(validateConfidence(0.85)).toEqual({ valid: true })
      expect(validateConfidence(1.0)).toEqual({ valid: true })
    })

    it('should fail for confidence < 0.6', () => {
      const result = validateConfidence(0.5)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('50%')
    })

    it('should fail for zero confidence', () => {
      expect(validateConfidence(0).valid).toBe(false)
    })

    it('should fail for negative confidence', () => {
      expect(validateConfidence(-0.1).valid).toBe(false)
    })
  })

  describe('validateMarketHours', () => {
    it('should always pass for paper trading mode', () => {
      expect(validateMarketHours('KR', 'paper')).toEqual({ valid: true })
      expect(validateMarketHours('US', 'paper')).toEqual({ valid: true })
    })

    // Market hours tests depend on actual time, so test the function exists and returns proper shape
    it('should return proper validation shape for real KR trading', () => {
      const result = validateMarketHours('KR', 'real')
      expect(result).toHaveProperty('valid')
      if (!result.valid) {
        expect(result).toHaveProperty('reason')
      }
    })

    it('should return proper validation shape for real US trading', () => {
      const result = validateMarketHours('US', 'real')
      expect(result).toHaveProperty('valid')
      if (!result.valid) {
        expect(result).toHaveProperty('reason')
      }
    })
  })

  describe('formatCIOVectorResult', () => {
    const analysisReport = '## CIO 분석 보고서\n삼성전자 매수 추천'

    it('should return analysis only when no vector result', () => {
      const result = formatCIOVectorResult(analysisReport, null)
      expect(result).toBe(analysisReport)
    })

    it('should return analysis only when zero proposals', () => {
      const vectorResult: VectorExecutionResult = {
        totalProposals: 0,
        executed: 0,
        skipped: 0,
        failed: 0,
        orders: [],
        totalDurationMs: 100,
      }
      const result = formatCIOVectorResult(analysisReport, vectorResult)
      expect(result).toBe(analysisReport)
    })

    it('should include vector execution summary', () => {
      const proposal: TradeProposal = {
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70000,
        reason: 'PER 저평가',
        confidence: 0.85,
        market: 'KR',
      }

      const vectorResult: VectorExecutionResult = {
        totalProposals: 2,
        executed: 1,
        skipped: 1,
        failed: 0,
        orders: [
          { proposal, status: 'executed', orderId: 'ord-1', kisOrderNo: 'KIS123' },
          { proposal: { ...proposal, confidence: 0.5 }, status: 'skipped', reason: '낮은 확신도' },
        ],
        totalDurationMs: 2500,
      }

      const result = formatCIOVectorResult(analysisReport, vectorResult)
      expect(result).toContain('VECTOR 매매 실행 결과')
      expect(result).toContain('총 제안: 2건')
      expect(result).toContain('실행 완료: 1건')
      expect(result).toContain('건너뜀: 1건')
      expect(result).toContain('삼성전자')
      expect(result).toContain('KIS123')
    })

    it('should show correct emojis for order statuses', () => {
      const proposal: TradeProposal = {
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70000,
        reason: 'test',
        confidence: 0.8,
        market: 'KR',
      }

      const vectorResult: VectorExecutionResult = {
        totalProposals: 3,
        executed: 1,
        skipped: 1,
        failed: 1,
        orders: [
          { proposal, status: 'executed', orderId: 'ord-1' },
          { proposal: { ...proposal, ticker: 'AAPL', tickerName: 'Apple' }, status: 'skipped', reason: '시장 시간 외' },
          { proposal: { ...proposal, ticker: 'TSLA', tickerName: 'Tesla' }, status: 'failed', reason: 'API 오류' },
        ],
        totalDurationMs: 1000,
      }

      const result = formatCIOVectorResult(analysisReport, vectorResult)
      expect(result).toContain('✅')
      expect(result).toContain('⏭️')
      expect(result).toContain('❌')
    })

    it('should show buy/sell in Korean', () => {
      const buyProposal: TradeProposal = {
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70000,
        reason: 'test',
        confidence: 0.8,
        market: 'KR',
      }
      const sellProposal: TradeProposal = {
        ticker: 'AAPL',
        tickerName: 'Apple',
        side: 'sell',
        quantity: 5,
        price: 180,
        reason: 'test',
        confidence: 0.8,
        market: 'US',
      }

      const vectorResult: VectorExecutionResult = {
        totalProposals: 2,
        executed: 2,
        skipped: 0,
        failed: 0,
        orders: [
          { proposal: buyProposal, status: 'executed' },
          { proposal: sellProposal, status: 'executed' },
        ],
        totalDurationMs: 1000,
      }

      const result = formatCIOVectorResult(analysisReport, vectorResult)
      expect(result).toContain('매수')
      expect(result).toContain('매도')
    })
  })
})
