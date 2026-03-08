import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'
import { parseTradeProposals } from '../../services/cio-orchestrator'

// === parseTradeProposals Tests ===

describe('CIO Orchestrator', () => {
  describe('parseTradeProposals', () => {
    it('should parse valid trade proposals from CIO output', () => {
      const content = `## 분석 보고서

종합 분석 결과입니다.

[TRADE_PROPOSALS]
[
  {
    "ticker": "005930",
    "tickerName": "삼성전자",
    "side": "buy",
    "quantity": 10,
    "price": 70000,
    "reason": "PER 저평가",
    "confidence": 0.85,
    "market": "KR"
  },
  {
    "ticker": "AAPL",
    "tickerName": "Apple Inc",
    "side": "sell",
    "quantity": 5,
    "price": 180,
    "reason": "과매수 구간",
    "confidence": 0.72,
    "market": "US"
  }
]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals).toHaveLength(2)

      expect(proposals[0].ticker).toBe('005930')
      expect(proposals[0].tickerName).toBe('삼성전자')
      expect(proposals[0].side).toBe('buy')
      expect(proposals[0].quantity).toBe(10)
      expect(proposals[0].price).toBe(70000)
      expect(proposals[0].confidence).toBe(0.85)
      expect(proposals[0].market).toBe('KR')

      expect(proposals[1].ticker).toBe('AAPL')
      expect(proposals[1].side).toBe('sell')
      expect(proposals[1].market).toBe('US')
    })

    it('should return empty array when no TRADE_PROPOSALS block', () => {
      const content = '## 분석 보고서\n투자 분석 결과입니다.'
      expect(parseTradeProposals(content)).toEqual([])
    })

    it('should return empty array for empty proposal list', () => {
      const content = '[TRADE_PROPOSALS]\n[]\n[/TRADE_PROPOSALS]'
      expect(parseTradeProposals(content)).toEqual([])
    })

    it('should return empty array for invalid JSON', () => {
      const content = '[TRADE_PROPOSALS]\n{invalid json}\n[/TRADE_PROPOSALS]'
      expect(parseTradeProposals(content)).toEqual([])
    })

    it('should filter out proposals without required fields', () => {
      const content = `[TRADE_PROPOSALS]
[
  {"ticker": "005930", "side": "buy", "quantity": 10, "price": 70000, "reason": "test", "confidence": 0.8, "market": "KR"},
  {"quantity": 5, "price": 100},
  {"ticker": "TSLA", "side": "sell", "quantity": 3, "price": 200, "reason": "test2", "confidence": 0.9, "market": "US"}
]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals).toHaveLength(2)
      expect(proposals[0].ticker).toBe('005930')
      expect(proposals[1].ticker).toBe('TSLA')
    })

    it('should clamp confidence to 0~1 range', () => {
      const content = `[TRADE_PROPOSALS]
[
  {"ticker": "005930", "side": "buy", "quantity": 1, "price": 100, "reason": "", "confidence": 1.5, "market": "KR"},
  {"ticker": "AAPL", "side": "sell", "quantity": 1, "price": 100, "reason": "", "confidence": -0.2, "market": "US"}
]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals[0].confidence).toBe(1)
      expect(proposals[1].confidence).toBe(0)
    })

    it('should default invalid side to buy', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "hold", "quantity": 1, "price": 100, "reason": "", "confidence": 0.7, "market": "KR"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals[0].side).toBe('buy')
    })

    it('should default invalid market to KR', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": 1, "price": 100, "reason": "", "confidence": 0.7, "market": "JP"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals[0].market).toBe('KR')
    })

    it('should handle quantity as 0 for invalid values', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": -5, "price": 100, "reason": "", "confidence": 0.7, "market": "KR"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals[0].quantity).toBe(0)
    })

    it('should handle tickerName fallback to ticker', () => {
      const content = `[TRADE_PROPOSALS]
[{"ticker": "005930", "side": "buy", "quantity": 1, "price": 100, "reason": "", "confidence": 0.7, "market": "KR"}]
[/TRADE_PROPOSALS]`

      const proposals = parseTradeProposals(content)
      expect(proposals[0].tickerName).toBe('005930')
    })

    it('should handle multiline content before and after proposals', () => {
      const content = `# 투자 분석 보고서

## 결론
삼성전자 매수 추천합니다.

## 분석
상세 분석 내용...

[TRADE_PROPOSALS]
[{"ticker": "005930", "tickerName": "삼성전자", "side": "buy", "quantity": 10, "price": 70000, "reason": "PER 저평가", "confidence": 0.85, "market": "KR"}]
[/TRADE_PROPOSALS]

## 리스크
시장 변동성 주의...`

      const proposals = parseTradeProposals(content)
      expect(proposals).toHaveLength(1)
      expect(proposals[0].ticker).toBe('005930')
    })

    it('should return empty for non-array JSON', () => {
      const content = `[TRADE_PROPOSALS]
{"ticker": "005930"}
[/TRADE_PROPOSALS]`
      expect(parseTradeProposals(content)).toEqual([])
    })
  })
})
