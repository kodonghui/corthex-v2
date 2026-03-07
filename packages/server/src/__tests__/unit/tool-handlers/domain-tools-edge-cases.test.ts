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

// ===== sentimentAnalyzer edge cases =====
describe('sentimentAnalyzer edge cases', () => {
  it('handles mixed sentiment text', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '추천하지만 비싸서 실망' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(['긍정', '부정', '중립']).toContain(result.label)
  })

  it('handles very long text', () => {
    const longText = '좋은 '.repeat(1000) + '나쁜 '.repeat(500)
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: longText }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('긍정')
  })

  it('handles text with only special characters', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '!@#$%^&*()_+' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('중립')
  })

  it('handles single positive word', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '최고' }, mockCtx) as string)
    expect(result.label).toBe('긍정')
    expect(result.score).toBe(1)
  })

  it('handles single negative word', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: '최악' }, mockCtx) as string)
    expect(result.label).toBe('부정')
    expect(result.score).toBe(0)
  })

  it('batch with single item', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'batch', texts: ['최고'] }, mockCtx) as string)
    expect(result.count).toBe(1)
    expect(result.results[0].label).toBe('긍정')
  })

  it('handles non-string input gracefully', () => {
    const result = JSON.parse(sentimentAnalyzer({ action: 'analyze', text: 12345 }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('중립')
  })

  it('handles missing action defaults to analyze', () => {
    const result = JSON.parse(sentimentAnalyzer({ text: '최고의 서비스' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.label).toBe('긍정')
  })
})

// ===== contractReviewer edge cases =====
describe('contractReviewer edge cases', () => {
  it('handles contract with all risk clauses', () => {
    const fullContract = `
      해지 조건이 있고 위약금 규정과 분쟁해결 조항,
      면책 조항, 기밀유지 의무, 지적재산권 조항,
      계약기간 명시, 대금 지급 조건, 양도 금지, 통지 의무가 있습니다.
    `
    const result = JSON.parse(contractReviewer({ action: 'review', text: fullContract }, mockCtx) as string)
    expect(result.foundClauses.length).toBeGreaterThanOrEqual(8)
  })

  it('handles very short contract text', () => {
    const result = JSON.parse(contractReviewer({ action: 'review', text: '계약' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.missingClauses.length).toBeGreaterThan(0)
  })

  it('handles contract with high-risk clauses only', () => {
    const riskyContract = '해지 가능, 위약금 50%, 소송 관할'
    const result = JSON.parse(contractReviewer({ action: 'review', text: riskyContract }, mockCtx) as string)
    const highRisk = result.foundClauses.filter((c: { risk: string }) => c.risk === 'high')
    expect(highRisk.length).toBeGreaterThan(0)
  })

  it('provides excerpts for found clauses', () => {
    const result = JSON.parse(contractReviewer({ action: 'review', text: '본 계약의 해지는 서면 통지 후 가능하다' }, mockCtx) as string)
    const found = result.foundClauses[0]
    expect(found.excerpt).toBeDefined()
    expect(found.excerpt.length).toBeGreaterThan(0)
  })
})

// ===== trademarkSimilarity edge cases =====
describe('trademarkSimilarity edge cases', () => {
  it('handles empty string comparison', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '', name2: '' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('handles mixed Korean-English names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '삼성Galaxy', name2: '삼성갤럭시' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.overallSimilarity).toBeGreaterThan(0)
  })

  it('handles single character names', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '가', name2: '나' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.overallSimilarity).toBeLessThan(1)
  })

  it('handles jongsung consonants correctly', () => {
    // 삼 = ㅅ+ㅏ+ㅁ (jong=ㅁ), 삿 = ㅅ+ㅏ+ㅅ (jong=ㅅ)
    const result = JSON.parse(trademarkSimilarity({ action: 'check', name1: '삼', name2: '삿' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.phoneticSimilarity).toBeGreaterThan(0.3)
  })

  it('batch with empty candidates returns error', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'batch', name: '삼성', candidates: [] }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('batch without name returns error', () => {
    const result = JSON.parse(trademarkSimilarity({ action: 'batch', candidates: ['현대'] }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})

// ===== codeQualityTool edge cases =====
describe('codeQualityTool edge cases', () => {
  it('handles code with no functions', () => {
    const result = JSON.parse(codeQualityTool({ action: 'analyze', code: 'const x = 1\nconst y = 2' }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.metrics.functionCount).toBe(0)
  })

  it('handles code with deep nesting', () => {
    const deepCode = `
      function f() {
        if (true) {
          for (let i = 0; i < 10; i++) {
            while (true) {
              if (x) {
                switch (y) {
                  case 1: break
                }
              }
            }
          }
        }
      }
    `
    const result = JSON.parse(codeQualityTool({ action: 'analyze', code: deepCode }, mockCtx) as string)
    expect(result.complexity.maxNestingDepth).toBeGreaterThanOrEqual(5)
    expect(result.complexity.cyclomaticComplexity).toBeGreaterThan(5)
  })

  it('handles code with good naming', () => {
    const goodCode = 'const userName = "test"\nclass UserService {}\nfunction getUserById() {}'
    const result = JSON.parse(codeQualityTool({ action: 'naming', code: goodCode }, mockCtx) as string)
    expect(result.issueCount).toBe(0)
  })

  it('detects long lines', () => {
    const longLineCode = 'const x = ' + 'a'.repeat(120)
    const result = JSON.parse(codeQualityTool({ action: 'naming', code: longLineCode }, mockCtx) as string)
    expect(result.issues.some((i: string) => i.includes('120자'))).toBe(true)
  })

  it('handles comment-only code', () => {
    const commentCode = '// line 1\n// line 2\n// line 3'
    const result = JSON.parse(codeQualityTool({ action: 'metrics', code: commentCode }, mockCtx) as string)
    expect(result.commentLines).toBe(3)
    expect(result.codeLines).toBe(0)
  })
})

// ===== uptimeMonitor edge cases =====
describe('uptimeMonitor edge cases', () => {
  it('rejects javascript: protocol', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'check', url: 'javascript:alert(1)' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })

  it('handles batch with invalid URLs', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'batch', urls: ['not-a-url', '://bad'] }, mockCtx) as string)
    expect(result.success).toBe(true)
    expect(result.results).toHaveLength(2)
    expect(result.results.every((r: { status: string }) => r.status === 'ERROR' || r.status === 'DOWN')).toBe(true)
  })

  it('handles batch missing urls parameter', async () => {
    const result = JSON.parse(await uptimeMonitor({ action: 'batch' }, mockCtx) as string)
    expect(result.success).toBe(false)
  })
})
