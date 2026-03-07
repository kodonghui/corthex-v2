import { describe, it, expect } from 'bun:test'
import type { ToolExecContext } from '../../../lib/tool-handlers/types'
import { sentimentAnalyzer } from '../../../lib/tool-handlers/builtins/sentiment-analyzer'
import { contractReviewer } from '../../../lib/tool-handlers/builtins/contract-reviewer'
import { trademarkSimilarity } from '../../../lib/tool-handlers/builtins/trademark-similarity'
import { codeQualityTool } from '../../../lib/tool-handlers/builtins/code-quality-tool'
import { uptimeMonitor } from '../../../lib/tool-handlers/builtins/uptime-monitor'

const mockCtx: ToolExecContext = {
  companyId: 'test-company',
  agentId: 'test-agent',
  sessionId: 'test-session',
  departmentId: null,
  userId: 'test-user',
  getCredentials: async () => ({ api_key: 'test-key' }),
}

const mockCtxNoCredentials: ToolExecContext = {
  ...mockCtx,
  getCredentials: async () => { throw new Error('No credentials') },
}

// ===== 1. sentimentAnalyzer =====
describe('sentimentAnalyzer', () => {
  it('detects positive sentiment', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '이 제품은 정말 최고입니다. 추천합니다!' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('긍정')
    expect(result.positiveCount).toBeGreaterThan(0)
  })

  it('detects negative sentiment', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '최악의 서비스. 실망입니다. 환불 요청합니다.' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('부정')
    expect(result.negativeCount).toBeGreaterThan(0)
  })

  it('detects neutral sentiment', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '오늘 날씨가 맑습니다.' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('중립')
    expect(result.score).toBe(0.5)
  })

  it('returns keywords found', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '정말 좋은 제품이고 추천합니다' }, mockCtx) as string)
    expect(result.keywords).toBeDefined()
    expect(result.keywords.length).toBeGreaterThan(0)
    expect(result.keywords.some((k: string) => k.startsWith('+'))).toBe(true)
  })

  it('handles batch analysis', () => {
    const result = JSON.parse(sentimentAnalyzer({
      action: 'batch',
      texts: ['최고의 품질', '최악의 서비스', '보통이네요'],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.results).toHaveLength(3)
    expect(result.averageScore).toBeDefined()
  })

  it('returns error for empty text', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for empty batch', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'batch', texts: [] }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== 2. contractReviewer =====
describe('contractReviewer', () => {
  const sampleContract = `
    제1조 (계약 목적) 본 계약은 소프트웨어 개발 용역에 관한 것입니다.
    제5조 (계약기간) 본 계약의 유효기간은 2026년 1월 1일부터 12월 31일까지로 한다.
    제7조 (해지) 당사자 일방이 계약을 위반한 경우 서면 통지 후 해지할 수 있다.
    제8조 (위약금) 계약 위반 시 계약 대금의 10%를 위약금으로 지급한다.
    제10조 (분쟁해결) 본 계약과 관련된 분쟁은 서울중앙지방법원을 관할 법원으로 한다.
    제11조 (기밀유지) 양 당사자는 계약 이행 과정에서 알게 된 정보를 비밀로 유지한다.
    제12조 (지적재산권) 개발 결과물의 저작권은 갑에게 귀속한다.
  `

  it('reviews contract and finds clauses', () => {
    const result = JSON.parse(contractReviewer({ action: 'review', text: sampleContract }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.foundClauses.length).toBeGreaterThan(0)
    expect(result.disclaimer).toBeDefined()
  })

  it('detects risk clause categories', () => {
    const result = JSON.parse(contractReviewer({ action: 'review', text: sampleContract }, mockCtx) as string)
    const categories = result.foundClauses.map((c: { category: string }) => c.category)
    expect(categories).toContain('해지/해제 조건')
    expect(categories).toContain('위약금/손해배상')
    expect(categories).toContain('분쟁해결')
  })

  it('identifies missing clauses in minimal contract', () => {
    const minimal = '제1조 (목적) 소프트웨어 개발 계약입니다.'
    const result = JSON.parse(contractReviewer({ action: 'review', text: minimal }, mockCtx) as string)
    expect(result.missingClauses.length).toBeGreaterThan(0)
  })

  it('returns checklist', () => {
    const result = JSON.parse(contractReviewer({ action: 'checklist' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.essentialClauses).toBeDefined()
    expect(result.essentialClauses.length).toBeGreaterThan(0)
  })

  it('returns error for empty text', () => {
    const result = JSON.parse(contractReviewer({ action: 'review', text: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', () => {
    const result = JSON.parse(contractReviewer({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== 3. trademarkSimilarity =====
describe('trademarkSimilarity', () => {
  it('compares two similar Korean brand names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '삼성', name2: '삼송' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.visualSimilarity).toBeGreaterThan(0.3)
    expect(result.phoneticSimilarity).toBeGreaterThan(0.3)
    expect(result.overallSimilarity).toBeDefined()
    expect(result.romanized1).toBe('samseong')
    expect(result.riskLevel).toBeDefined()
  })

  it('detects identical names as highly similar', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '카카오', name2: '카카오' }, mockCtx) as string)
    expect(result.overallSimilarity).toBe(1)
  })

  it('detects dissimilar names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '삼성', name2: '현대' }, mockCtx) as string)
    expect(result.overallSimilarity).toBeLessThan(0.5)
  })

  it('handles batch comparison', () => {
    const result = JSON.parse(trademarkSimilarity({
      action: 'batch',
      name: '삼성',
      candidates: ['삼송', '삼싱', '현대', '엘지'],
    }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.results).toHaveLength(4)
    expect(result.highestRisk).toBeDefined()
    // Results should be sorted by similarity descending
    expect(result.results[0].overallSimilarity).toBeGreaterThanOrEqual(result.results[3].overallSimilarity)
  })

  it('returns error for missing names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '삼성' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('handles English names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: 'Samsung', name2: 'Samsoong' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.overallSimilarity).toBeGreaterThan(0)
  })

  it('returns error for unknown action', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== 4. codeQualityTool =====
describe('codeQualityTool', () => {
  const sampleCode = `
import { something } from './module'
import { other } from './other'

// This is a comment
function calculateTotal(items: number[]): number {
  let total = 0
  for (const item of items) {
    if (item > 0) {
      total += item
    } else if (item < -100) {
      total -= Math.abs(item)
    }
  }
  return total
}

const processData = async (data: string) => {
  try {
    const parsed = JSON.parse(data)
    return parsed
  } catch {
    return null
  }
}
`

  it('analyzes code metrics and complexity', () => {
    const result = JSON.parse(codeQualityTool({ action: 'analyze', code: sampleCode }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.metrics.totalLines).toBeGreaterThan(10)
    expect(result.metrics.functionCount).toBeGreaterThanOrEqual(2)
    expect(result.metrics.importCount).toBe(2)
    expect(result.complexity.cyclomaticComplexity).toBeGreaterThan(1)
    expect(result.complexity.level).toBeDefined()
  })

  it('checks naming conventions', () => {
    const badCode = 'const my_var = 1;\nclass myClass {}\nconst x = 5;'
    const result = JSON.parse(codeQualityTool({ action: 'naming', code: badCode }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('returns metrics only', () => {
    const result = JSON.parse(codeQualityTool({ action: 'metrics', code: sampleCode }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.totalLines).toBeDefined()
    expect(result.estimatedReadingMinutes).toBeDefined()
  })

  it('runs all analyses', () => {
    const result = JSON.parse(codeQualityTool({ action: 'all', code: sampleCode }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.metrics).toBeDefined()
    expect(result.complexity).toBeDefined()
    expect(result.naming).toBeDefined()
  })

  it('returns error for empty code', () => {
    const result = JSON.parse(codeQualityTool({ action: 'analyze', code: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', () => {
    const result = JSON.parse(codeQualityTool({ action: 'unknown', code: 'x' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== 5. uptimeMonitor (sync validation tests only - skip actual network) =====
describe('uptimeMonitor', () => {
  it('returns error for empty URL', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'check', url: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for invalid URL', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'check', url: 'not-a-url' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for non-http URL', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'check', url: 'ftp://example.com' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for empty batch', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'batch', urls: [] }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('returns error for unknown action', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'unknown' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== 6. Handler registration =====
describe('domain tool handler registration', () => {
  it('all 12 new domain tools are registered', async () => {
    // Dynamic import to ensure all registrations happen
    const { registry } = await import('../../../lib/tool-handlers/index')
    const handlers = registry.list()

    const domainTools = [
      'sentiment_analyzer', 'company_analyzer', 'market_overview',
      'law_search', 'contract_reviewer', 'trademark_similarity',
      'patent_search', 'uptime_monitor', 'security_scanner',
      'code_quality', 'dns_lookup', 'ssl_checker',
    ]

    for (const tool of domainTools) {
      expect(handlers).toContain(tool)
    }
  })

  it('existing domain tools still registered', async () => {
    const { registry } = await import('../../../lib/tool-handlers/index')
    const handlers = registry.list()

    expect(handlers).toContain('get_stock_price')
    expect(handlers).toContain('search_news')
    expect(handlers).toContain('get_instagram_insights')
  })

  it('total handlers >= 47 (35 existing + 12 new)', async () => {
    const { registry } = await import('../../../lib/tool-handlers/index')
    expect(registry.list().length).toBeGreaterThanOrEqual(47)
  })
})
