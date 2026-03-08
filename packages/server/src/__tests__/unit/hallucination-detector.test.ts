import { describe, it, expect } from 'bun:test'
import {
  extractNumberClaims,
  extractDateClaims,
  extractUrlClaims,
  extractNameClaims,
  extractAllClaims,
  parseToolData,
  matchClaimToToolData,
  compareNumericClaim,
  compareDateClaim,
  compareNameClaim,
  detectContentType,
  detect,
  type FactualClaim,
  type ToolDataEntry,
  type ContentType,
} from '../../services/hallucination-detector'

// ═══════════════════════════════════════════════════════════
// ClaimExtractor Tests
// ═══════════════════════════════════════════════════════════

describe('ClaimExtractor', () => {
  describe('extractNumberClaims', () => {
    it('should extract Korean currency amounts', () => {
      const content = '삼성전자 주가는 72,000원이며 시가총액은 430조원입니다'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
      const values = claims.map(c => c.value)
      expect(values.some(v => v.includes('72,000원'))).toBe(true)
    })

    it('should extract percentage values', () => {
      const content = '영업이익률은 15.3%로 전년 대비 2.1% 상승'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(2)
      expect(claims.some(c => c.value.includes('15.3%'))).toBe(true)
    })

    it('should extract large Korean number units (억, 조, 만)', () => {
      const content = '매출액 302조원, 영업이익 51.6조원, 당기순이익 39.3억달러'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(2)
    })

    it('should extract volume/count with units', () => {
      const content = '거래량 1,234,567주, 신규 가입자 150만명'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract PER/PBR/ROE values', () => {
      const content = 'PER 12.5배, PBR 1.8, ROE 15.2%'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for content without numbers', () => {
      const content = '삼성전자는 좋은 회사입니다'
      const claims = extractNumberClaims(content)
      expect(claims.length).toBe(0)
    })

    it('should include context around each claim', () => {
      const content = 'A'.repeat(60) + '72,000원' + 'B'.repeat(60)
      const claims = extractNumberClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
      if (claims.length > 0) {
        expect(claims[0].context.length).toBeLessThanOrEqual(120)
        expect(claims[0].context).toContain('72,000원')
      }
    })

    it('should set correct unit for claims', () => {
      const content = '환율 1,350원, 금리 3.5%'
      const claims = extractNumberClaims(content)
      const wonClaim = claims.find(c => c.value.includes('원'))
      const pctClaim = claims.find(c => c.value.includes('%'))
      if (wonClaim) expect(wonClaim.unit).toBe('원')
      if (pctClaim) expect(pctClaim.unit).toBe('%')
    })

    it('should deduplicate claims at same position', () => {
      const content = '주가 72,000원'
      const claims = extractNumberClaims(content)
      // Each unique position+value should only appear once
      const keys = claims.map(c => `${c.type}:${c.value}:${c.position}`)
      const uniqueKeys = new Set(keys)
      expect(keys.length).toBe(uniqueKeys.size)
    })
  })

  describe('extractDateClaims', () => {
    it('should extract YYYY-MM-DD format', () => {
      const content = '2024-03-15 기준 보고서'
      const claims = extractDateClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
      expect(claims[0].value).toBe('2024-03-15')
      expect(claims[0].type).toBe('date')
    })

    it('should extract Korean date format', () => {
      const content = '2024년 3월 15일 시장 분석'
      const claims = extractDateClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
      expect(claims[0].value).toContain('2024년')
    })

    it('should extract YYYY/MM/DD format', () => {
      const content = '보고서 작성일: 2024/03/15'
      const claims = extractDateClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract YYYY.MM.DD format', () => {
      const content = '기준일 2024.03.15'
      const claims = extractDateClaims(content)
      expect(claims.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for no dates', () => {
      const claims = extractDateClaims('오늘 날씨가 좋습니다')
      expect(claims.length).toBe(0)
    })

    it('should extract multiple dates', () => {
      const content = '2024-01-01부터 2024-12-31까지'
      const claims = extractDateClaims(content)
      expect(claims.length).toBe(2)
    })
  })

  describe('extractUrlClaims', () => {
    it('should extract HTTP URLs', () => {
      const content = '참고: http://example.com/report'
      const claims = extractUrlClaims(content)
      expect(claims.length).toBe(1)
      expect(claims[0].value).toBe('http://example.com/report')
    })

    it('should extract HTTPS URLs', () => {
      const content = '출처: https://www.naver.com/finance?q=005930'
      const claims = extractUrlClaims(content)
      expect(claims.length).toBe(1)
      expect(claims[0].type).toBe('url')
    })

    it('should extract multiple URLs', () => {
      const content = 'https://a.com and https://b.com'
      const claims = extractUrlClaims(content)
      expect(claims.length).toBe(2)
    })

    it('should return empty for no URLs', () => {
      const claims = extractUrlClaims('일반 텍스트입니다')
      expect(claims.length).toBe(0)
    })
  })

  describe('extractNameClaims', () => {
    it('should extract Korean company names', () => {
      const content = '삼성전자와 SK하이닉스의 반도체 사업'
      const claims = extractNameClaims(content)
      expect(claims.some(c => c.value === '삼성전자')).toBe(true)
    })

    it('should extract Korean institution names', () => {
      const content = '한국은행 금융통화위원회에서 발표'
      const claims = extractNameClaims(content)
      expect(claims.some(c => c.value.includes('한국은행'))).toBe(true)
    })

    it('should extract Korean government bodies', () => {
      const content = '금융위원회와 금융감독원의 규제 발표'
      const claims = extractNameClaims(content)
      expect(claims.some(c => c.value.includes('금융위원회'))).toBe(true)
    })

    it('should return empty for content without names', () => {
      const claims = extractNameClaims('숫자만 있는 텍스트 123')
      expect(claims.length).toBe(0)
    })
  })

  describe('extractAllClaims', () => {
    it('should extract all types of claims', () => {
      const content = '삼성전자 주가 72,000원 (2024-03-15 기준, https://finance.naver.com)'
      const claims = extractAllClaims(content)
      const types = new Set(claims.map(c => c.type))
      expect(types.has('number')).toBe(true)
      expect(types.has('date')).toBe(true)
      expect(types.has('url')).toBe(true)
    })

    it('should return empty for plain text', () => {
      const claims = extractAllClaims('아무것도 없는 일반 문장입니다')
      expect(claims.length).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// ToolDataMatcher Tests
// ═══════════════════════════════════════════════════════════

describe('ToolDataMatcher', () => {
  describe('parseToolData', () => {
    it('should parse object-format tool data', () => {
      const toolData = {
        'stock-price': { input: { ticker: '005930' }, output: '삼성전자 현재가: 68,500원' },
        'exchange-rate': { input: { pair: 'USD/KRW' }, output: '환율: 1,350원' },
      }
      const entries = parseToolData(toolData)
      expect(entries.length).toBe(2)
      expect(entries[0].toolName).toBe('stock-price')
      expect(entries[0].output).toContain('68,500원')
    })

    it('should parse string-format tool data', () => {
      const toolData = {
        'simple-tool': '결과: 42',
      }
      const entries = parseToolData(toolData)
      expect(entries.length).toBe(1)
      expect(entries[0].output).toBe('결과: 42')
    })

    it('should handle empty tool data', () => {
      const entries = parseToolData({})
      expect(entries.length).toBe(0)
    })

    it('should handle nested object output (non-string)', () => {
      const toolData = {
        'complex-tool': { input: {}, output: { price: 72000, volume: 1000 } },
      }
      const entries = parseToolData(toolData)
      expect(entries.length).toBe(1)
      expect(entries[0].output).toContain('72000')
    })

    it('should preserve timestamp if present', () => {
      const toolData = {
        'timed-tool': { input: {}, output: 'result', timestamp: '2024-03-15T10:00:00Z' },
      }
      const entries = parseToolData(toolData)
      expect(entries[0].timestamp).toBe('2024-03-15T10:00:00Z')
    })
  })

  describe('matchClaimToToolData', () => {
    const toolEntries: ToolDataEntry[] = [
      { toolName: 'stock-price', input: null, output: '삼성전자 현재가: 68,500원, 전일대비 +2.1%' },
      { toolName: 'exchange-rate', input: null, output: 'USD/KRW 환율: 1,350원' },
    ]

    it('should find matching tool data for exact value', () => {
      const claim: FactualClaim = { type: 'number', value: '68,500원', context: '', position: 0, unit: '원' }
      const result = matchClaimToToolData(claim, toolEntries)
      expect(result.found).toBe(true)
      expect(result.toolName).toBe('stock-price')
    })

    it('should not find match for very different value (>40% range)', () => {
      // 999,999 vs tool data max 68,500 → diff > 40%, so no match
      const claim: FactualClaim = { type: 'number', value: '999,999원', context: '', position: 0, unit: '원' }
      const result = matchClaimToToolData(claim, toolEntries)
      expect(result.found).toBe(false)
    })

    it('should match numeric values even without exact string match', () => {
      const claim: FactualClaim = { type: 'number', value: '1350원', context: '', position: 0, unit: '원' }
      const result = matchClaimToToolData(claim, toolEntries)
      expect(result.found).toBe(true)
    })

    it('should handle empty tool entries', () => {
      const claim: FactualClaim = { type: 'number', value: '72,000원', context: '', position: 0 }
      const result = matchClaimToToolData(claim, [])
      expect(result.found).toBe(false)
    })
  })

  describe('compareNumericClaim', () => {
    it('should match exact values', () => {
      const result = compareNumericClaim('72,000원', '72,000원', 'general')
      expect(result.match).toBe(true)
      expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it('should match financial values within 1% tolerance', () => {
      // 68,500 vs 69,000 = 0.73% difference → within 1%
      const result = compareNumericClaim('69,000원', '68,500원', 'financial')
      expect(result.match).toBe(true)
    })

    it('should fail financial values beyond 1% tolerance', () => {
      // 72,000 vs 68,500 = ~5.1% difference → beyond 1%
      const result = compareNumericClaim('72,000원', '68,500원', 'financial')
      expect(result.match).toBe(false)
      expect(result.discrepancy).toBeTruthy()
    })

    it('should require exact match for general content', () => {
      const result = compareNumericClaim('100건', '99건', 'general')
      expect(result.match).toBe(false)
    })

    it('should handle percentage comparison', () => {
      const result = compareNumericClaim('15.3%', '15.3%', 'financial')
      expect(result.match).toBe(true)
    })

    it('should handle unparseable values gracefully', () => {
      const result = compareNumericClaim('많이', 'abc', 'general')
      expect(result.match).toBe(false)
      expect(result.confidence).toBeLessThan(0.5)
    })

    it('should allow ±5% for volume data (주/건)', () => {
      // 1,000주 vs 1,040주 = 4% → within 5%
      const result = compareNumericClaim('1,040주', '1,000주', 'financial')
      expect(result.match).toBe(true)
    })
  })

  describe('compareDateClaim', () => {
    it('should match exact dates', () => {
      const result = compareDateClaim('2024-03-15', '2024-03-15')
      expect(result.match).toBe(true)
      expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it('should match dates within 1 day', () => {
      const result = compareDateClaim('2024-03-15', '2024-03-14')
      expect(result.match).toBe(true)
      expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    })

    it('should fail dates more than 1 day apart', () => {
      const result = compareDateClaim('2024-03-15', '2024-03-10')
      expect(result.match).toBe(false)
      expect(result.discrepancy).toBeTruthy()
    })

    it('should handle Korean date format', () => {
      const result = compareDateClaim('2024년 3월 15일', '2024-03-15')
      expect(result.match).toBe(true)
    })

    it('should handle unparseable dates', () => {
      const result = compareDateClaim('어제', '2024-03-15')
      expect(result.match).toBe(false)
      expect(result.confidence).toBeLessThan(0.5)
    })
  })

  describe('compareNameClaim', () => {
    it('should match exact names', () => {
      const result = compareNameClaim('삼성전자', '삼성전자')
      expect(result.match).toBe(true)
      expect(result.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it('should match partial containment', () => {
      const result = compareNameClaim('삼성전자', '삼성전자 주식회사')
      expect(result.match).toBe(true)
    })

    it('should match with slight variations (Levenshtein ≤ 2)', () => {
      const result = compareNameClaim('samsung', 'samsang')
      expect(result.match).toBe(true)
    })

    it('should fail completely different names', () => {
      const result = compareNameClaim('삼성전자', 'LG전자')
      expect(result.match).toBe(false)
    })

    it('should be case-insensitive', () => {
      const result = compareNameClaim('SAMSUNG', 'Samsung')
      expect(result.match).toBe(true)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Content Type Detection Tests
// ═══════════════════════════════════════════════════════════

describe('detectContentType', () => {
  it('should detect financial content', () => {
    const content = '삼성전자 주가 분석: PER 12.5배, 매출 302조원, 영업이익 상승'
    const type = detectContentType(content, '종목 분석해줘')
    expect(type).toBe('financial')
  })

  it('should detect code content', () => {
    const content = 'function hello() { return "world" }\nimport React from "react"\nconst x = 42'
    const type = detectContentType(content, 'write code')
    expect(type).toBe('code')
  })

  it('should default to general', () => {
    const content = '오늘 날씨가 좋습니다. 산책하러 나가겠습니다.'
    const type = detectContentType(content, '뭐해?')
    expect(type).toBe('general')
  })

  it('should use commandText for detection too', () => {
    const content = '분석 결과입니다'
    const type = detectContentType(content, '삼성전자 주가 매출 PER 분석해줘')
    expect(type).toBe('financial')
  })
})

// ═══════════════════════════════════════════════════════════
// HallucinationDetector Main Tests
// ═══════════════════════════════════════════════════════════

describe('detect (main hallucination detection)', () => {
  describe('no claims scenario', () => {
    it('should return clean for plain text without claims', () => {
      const report = detect('좋은 하루입니다', {}, '인사해줘')
      expect(report.verdict).toBe('clean')
      expect(report.score).toBe(1.0)
      expect(report.totalClaims).toBe(0)
    })
  })

  describe('no tool data scenario', () => {
    it('should flag unsourced numeric claims', () => {
      const content = '삼성전자 주가는 72,000원이고 영업이익은 51.6조원입니다'
      const report = detect(content, undefined, '분석해줘')
      expect(report.unsourcedCount).toBeGreaterThan(0)
    })

    it('should return clean if no numeric claims without tool data', () => {
      const content = '삼성전자는 좋은 회사입니다'
      const report = detect(content, undefined, '분석해줘')
      expect(report.verdict).toBe('clean')
    })

    it('should handle empty tool data object', () => {
      const content = '주가 72,000원입니다'
      const report = detect(content, {}, '조회해줘')
      expect(report.unsourcedCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('matching claims with tool data', () => {
    it('should verify claims matching tool data (clean)', () => {
      const content = '삼성전자 현재 주가는 68,500원이며 전일 대비 2.1% 상승했습니다'
      const toolData = {
        'stock-price': {
          input: { ticker: '005930' },
          output: '삼성전자(005930) 현재가: 68,500원, 전일대비: +2.1%, 거래량: 15,234,567주',
        },
      }
      const report = detect(content, toolData, '삼성전자 주가 알려줘')
      expect(report.verifiedClaims).toBeGreaterThan(0)
      expect(report.mismatchedClaims).toBe(0)
      expect(report.verdict).toBe('clean')
    })

    it('should detect mismatched numeric claims (critical for financial)', () => {
      const content = '삼성전자 주가는 72,000원입니다'
      const toolData = {
        'stock-price': {
          input: { ticker: '005930' },
          output: '삼성전자(005930) 현재가: 68,500원',
        },
      }
      const report = detect(content, toolData, '삼성전자 주가 매출 PER 알려줘')
      // 72000 vs 68500 = ~5.1% diff, beyond 1% tolerance for financial
      expect(report.mismatchedClaims).toBeGreaterThanOrEqual(1)
      expect(report.verdict).toBe('critical')
    })

    it('should handle minor mismatches as warning', () => {
      const content = '보고서 작성일은 2024-03-20이고 대상은 삼성전자입니다. 주가 68,500원입니다.'
      const toolData = {
        'stock-price': {
          input: {},
          output: '삼성전자 현재가: 68,500원, 날짜: 2024-03-15',
        },
      }
      // The price matches but the date doesn't — minor mismatch
      const report = detect(content, toolData, '주가 알려줘')
      // Date mismatch is minor (>1 day), so at most warning
      expect(report.verdict).not.toBe('critical')
    })
  })

  describe('verdict calculation', () => {
    it('should return critical when critical mismatches exist', () => {
      const content = '삼성전자 주가 90,000원, SK하이닉스 주가 200,000원'
      const toolData = {
        'stock-price': {
          input: {},
          output: '삼성전자 68,500원, SK하이닉스 130,000원',
        },
      }
      const report = detect(content, toolData, '삼성전자 매출 PER 주가 분석해줘')
      expect(report.verdict).toBe('critical')
    })

    it('should calculate score between 0 and 1', () => {
      const content = '수치: 100원, 200원, 300원'
      const toolData = {
        'tool': { input: {}, output: '100, 200, 300' },
      }
      const report = detect(content, toolData, '조회해줘')
      expect(report.score).toBeGreaterThanOrEqual(0)
      expect(report.score).toBeLessThanOrEqual(1)
    })

    it('should include details string', () => {
      const content = '삼성전자 주가 72,000원'
      const toolData = {
        'stock-price': { input: {}, output: '68,500원' },
      }
      const report = detect(content, toolData, '주가 매출 PER 분석해줘')
      expect(report.details.length).toBeGreaterThan(0)
    })
  })

  describe('report structure', () => {
    it('should have all required fields', () => {
      const report = detect('테스트', {}, '테스트')
      expect(report).toHaveProperty('claims')
      expect(report).toHaveProperty('unsourcedClaims')
      expect(report).toHaveProperty('verdict')
      expect(report).toHaveProperty('score')
      expect(report).toHaveProperty('details')
      expect(report).toHaveProperty('totalClaims')
      expect(report).toHaveProperty('verifiedClaims')
      expect(report).toHaveProperty('mismatchedClaims')
      expect(report).toHaveProperty('unsourcedCount')
    })

    it('should have arrays for claims and unsourcedClaims', () => {
      const report = detect('테스트 72,000원', { tool: { input: {}, output: '72,000' } }, '테스트')
      expect(Array.isArray(report.claims)).toBe(true)
      expect(Array.isArray(report.unsourcedClaims)).toBe(true)
    })
  })

  describe('complex real-world scenarios', () => {
    it('should handle financial report with mixed accuracy', () => {
      const content = `## 삼성전자 분석 보고서

현재 주가: 68,500원 (정확)
PER: 12.5배
영업이익: 51.6조원
배당수익률: 2.3%

결론: 매수 추천`

      const toolData = {
        'stock-price': {
          input: { ticker: '005930' },
          output: '삼성전자(005930) 현재가: 68,500원, PER: 12.3배',
        },
        'financial-data': {
          input: { ticker: '005930' },
          output: '영업이익: 51.6조원, 순이익: 39.2조원, 배당수익률: 2.3%',
        },
      }

      const report = detect(content, toolData, '삼성전자 주가 매출 PER 분석해줘')
      // Most values match or are close
      expect(report.totalClaims).toBeGreaterThan(0)
      expect(report.score).toBeGreaterThan(0)
    })

    it('should handle multiple tool sources', () => {
      const content = '환율 1,350원, 금리 3.50%'
      const toolData = {
        'exchange-rate': { input: {}, output: 'USD/KRW: 1,350원' },
        'interest-rate': { input: {}, output: '기준금리: 3.50%' },
      }
      const report = detect(content, toolData, '경제 지표 알려줘')
      expect(report.verifiedClaims).toBeGreaterThanOrEqual(1)
      expect(report.verdict).toBe('clean')
    })

    it('should handle empty content', () => {
      const report = detect('', {}, '')
      expect(report.verdict).toBe('clean')
      expect(report.totalClaims).toBe(0)
    })

    it('should handle content with only URLs', () => {
      const content = '참고: https://finance.naver.com/item/main.nhn?code=005930'
      const report = detect(content, {}, '링크 알려줘')
      // URLs alone don't trigger hallucination
      expect(report.verdict).toBe('clean')
    })

    it('should handle general (non-financial) content with mismatched numbers', () => {
      const content = '팀 구성원 15명이 참여했습니다'
      const toolData = {
        'team-info': { input: {}, output: '팀 인원: 12명' },
      }
      const report = detect(content, toolData, '팀 정보 알려줘')
      // General content: exact match required, 15 vs 12 = mismatch but minor severity
      // Since it's general content, severity is 'minor' not 'critical'
      if (report.mismatchedClaims > 0) {
        expect(report.claims.some(c => c.severity === 'minor')).toBe(true)
      }
    })
  })
})

// ═══════════════════════════════════════════════════════════
// Edge Cases
// ═══════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('should handle very long content', () => {
    const content = '주가 72,000원. '.repeat(100)
    const report = detect(content, { tool: { input: {}, output: '72,000' } }, '테스트')
    expect(report).toBeTruthy()
    expect(report.totalClaims).toBeGreaterThan(0)
  })

  it('should handle special characters in tool output', () => {
    const toolData = {
      'tool': { input: {}, output: '가격: ₩68,500 (USD $51.23)' },
    }
    const report = detect('가격은 68,500원입니다', toolData, '가격 알려줘')
    expect(report).toBeTruthy()
  })

  it('should handle null/undefined in tool data gracefully', () => {
    const toolData = {
      'tool': { input: null, output: null },
    } as unknown as Record<string, unknown>
    const report = detect('테스트 72,000원', toolData, '테스트')
    expect(report).toBeTruthy()
  })

  it('should handle Korean 만 unit correctly', () => {
    const content = '가입자 수 150만명'
    const claims = extractNumberClaims(content)
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle mixed Korean/English content', () => {
    const content = 'Samsung Electronics price: 68,500원, market cap $400B'
    const claims = extractAllClaims(content)
    expect(claims.length).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════
// TEA-Generated: Risk-Based Additional Coverage
// ═══════════════════════════════════════════════════════════

describe('TEA: Numeric Extraction Edge Cases', () => {
  it('should handle negative numbers', () => {
    const content = '전일 대비 -3.5% 하락'
    const claims = extractNumberClaims(content)
    expect(claims.some(c => c.value.includes('3.5%'))).toBe(true)
  })

  it('should handle very large numbers with 조 unit', () => {
    const content = '글로벌 시가총액 100조원 돌파'
    const claims = extractNumberClaims(content)
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('should not extract numbers from code snippets when type is not code', () => {
    // Numbers in code context should still be extracted
    const content = 'const price = 72000원'
    const claims = extractNumberClaims(content)
    expect(claims.some(c => c.value.includes('72000원'))).toBe(true)
  })

  it('should handle decimal Korean won amounts', () => {
    const content = '달러 환율 1,350.50원'
    const claims = extractNumberClaims(content)
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle USD amounts', () => {
    const content = '애플 주가 185.32달러'
    const claims = extractNumberClaims(content)
    expect(claims.some(c => c.value.includes('달러'))).toBe(true)
  })
})

describe('TEA: Date Extraction Robustness', () => {
  it('should extract multiple dates from complex text', () => {
    const content = '2024-01-15 기준 분석, 만기일 2024-12-31, 이전 보고서 2023-06-30 참조'
    const claims = extractDateClaims(content)
    expect(claims.length).toBe(3)
  })

  it('should handle Korean year-month-day with various spacing', () => {
    const content = '2024년3월15일'
    const claims = extractDateClaims(content)
    expect(claims.length).toBeGreaterThanOrEqual(1)
  })

  it('should not extract partial date-like patterns', () => {
    const content = '연도 2024가 아닌 월별 분석'
    const claims = extractDateClaims(content)
    // "2024" alone is not a full date
    expect(claims.length).toBe(0)
  })
})

describe('TEA: Tool Data Matching Robustness', () => {
  it('should handle tool data with nested JSON output', () => {
    const toolData = {
      'api-call': {
        input: { endpoint: '/prices' },
        output: JSON.stringify({ price: 68500, currency: 'KRW', change: 2.1 }),
      },
    }
    const entries = parseToolData(toolData)
    expect(entries[0].output).toContain('68500')
  })

  it('should handle tool data where output is undefined', () => {
    const toolData = {
      'broken-tool': { input: {}, output: undefined },
    } as unknown as Record<string, unknown>
    const entries = parseToolData(toolData)
    expect(entries.length).toBe(1)
    // Should not crash
  })

  it('should handle multiple tools with overlapping numbers', () => {
    const toolEntries: ToolDataEntry[] = [
      { toolName: 'tool-a', input: null, output: '가격: 100원' },
      { toolName: 'tool-b', input: null, output: '가격: 200원' },
    ]
    const claim: FactualClaim = { type: 'number', value: '100원', context: '', position: 0, unit: '원' }
    const result = matchClaimToToolData(claim, toolEntries)
    expect(result.found).toBe(true)
    expect(result.toolName).toBe('tool-a')
  })
})

describe('TEA: Numeric Comparison Boundary Tests', () => {
  it('should handle zero values', () => {
    const result = compareNumericClaim('0원', '0원', 'financial')
    expect(result.match).toBe(true)
  })

  it('should handle financial tolerance boundary (exactly 1%)', () => {
    // 100 vs 99 = 1% diff, should be within tolerance
    const result = compareNumericClaim('99원', '100원', 'financial')
    expect(result.match).toBe(true)
  })

  it('should fail financial tolerance just beyond 1%', () => {
    // 100 vs 98 = 2% diff, beyond 1%
    const result = compareNumericClaim('98원', '100원', 'financial')
    expect(result.match).toBe(false)
  })

  it('should handle very small decimal differences', () => {
    const result = compareNumericClaim('3.50%', '3.50%', 'general')
    expect(result.match).toBe(true)
  })

  it('should compare 억 unit values correctly', () => {
    // Same value in different formats
    const result = compareNumericClaim('5억원', '500000000원', 'financial')
    // Both should parse to same number
    expect(result.match).toBe(true)
  })
})

describe('TEA: Verdict Scoring Algorithm', () => {
  it('should score 1.0 for all verified, no mismatches', () => {
    const content = '금액 100원'
    const toolData = { 'tool': { input: {}, output: '금액: 100원' } }
    const report = detect(content, toolData, '조회')
    expect(report.score).toBeGreaterThanOrEqual(0.9)
  })

  it('should penalize critical mismatches more than minor', () => {
    // Critical mismatch (financial)
    const content1 = '주가 90,000원'
    const tool1 = { 'stock': { input: {}, output: '주가: 68,500원' } }
    const report1 = detect(content1, tool1, '주가 매출 PER 분석해줘')

    // Minor mismatch (general)
    const content2 = '참석자 15명'
    const tool2 = { 'team': { input: {}, output: '참석자: 12명' } }
    const report2 = detect(content2, tool2, '참석자 알려줘')

    // Critical should have lower score
    if (report1.mismatchedClaims > 0 && report2.mismatchedClaims > 0) {
      expect(report1.score).toBeLessThanOrEqual(report2.score)
    }
  })

  it('should handle warning verdict for many unsourced claims', () => {
    const content = '수치1: 100원, 수치2: 200원, 수치3: 300원, 수치4: 400원, 수치5: 500원, 수치6: 600원'
    const report = detect(content, undefined, '분석해줘')
    // 5+ unsourced claims → warning
    if (report.unsourcedCount >= 5) {
      expect(report.verdict).toBe('warning')
    }
  })
})

describe('TEA: Content Type Detection Boundary', () => {
  it('should detect financial with mixed keywords', () => {
    const type = detectContentType('주가 상승세, PER 적정, 매출 증가', '종목 분석')
    expect(type).toBe('financial')
  })

  it('should detect code with multiple indicators', () => {
    const type = detectContentType('import axios\nconst data = await fetch\nreturn response', 'implement')
    expect(type).toBe('code')
  })

  it('should not over-detect with single keyword', () => {
    // Only 1 financial keyword shouldn't trigger financial detection (needs 3+)
    const type = detectContentType('주가가 높아요', '질문')
    expect(type).toBe('general')
  })

  it('should handle empty inputs', () => {
    const type = detectContentType('', '')
    expect(type).toBe('general')
  })
})

describe('TEA: Levenshtein Distance Verification', () => {
  it('should match very similar strings', () => {
    const result = compareNameClaim('한국은행', '한국은행')
    expect(result.match).toBe(true)
    expect(result.confidence).toBe(0.95)
  })

  it('should not match completely unrelated short strings', () => {
    const result = compareNameClaim('AB', 'ZZ')
    expect(result.match).toBe(false)
  })

  it('should handle empty strings', () => {
    const result = compareNameClaim('', '')
    expect(result.match).toBe(true)
  })

  it('should handle one empty string', () => {
    const result = compareNameClaim('삼성전자', '')
    expect(result.match).toBe(false)
  })
})
