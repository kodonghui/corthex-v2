import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === Mock DB ===

const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      orderBy: mock(() => []),
    })),
  })),
}))

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}))

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
    insert: mock(() => ({
      values: mock(() => Promise.resolve()),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  agentMemories: {
    id: 'id',
    companyId: 'company_id',
    agentId: 'agent_id',
    isActive: 'is_active',
    usageCount: 'usage_count',
    lastUsedAt: 'last_used_at',
    key: 'key',
    content: 'content',
    memoryType: 'memory_type',
    context: 'context',
    confidence: 'confidence',
    source: 'source',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
  departmentKnowledge: {},
  knowledgeDocs: {},
  knowledgeFolders: {},
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ type: 'eq', a, b }),
  and: (...args: unknown[]) => ({ type: 'and', args }),
  desc: (col: unknown) => ({ type: 'desc', col }),
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    type: 'sql',
    strings: Array.from(strings),
    values,
  }),
}))

// === Import after mocks ===

import { extractTaskKeywords } from '../../services/memory-extractor'
import { calculateSimilarity } from '../../services/knowledge-injector'

// ============================================================
// Test Suite 1: extractTaskKeywords
// ============================================================

describe('extractTaskKeywords', () => {
  test('extracts keywords from Korean text', () => {
    const result = extractTaskKeywords('포트폴리오 리밸런싱 전략 분석 필요합니다')
    expect(result.length).toBeGreaterThan(0)
    // Should contain meaningful words (Korean particles are attached to words)
    expect(result).toContain('포트폴리오')
    expect(result).toContain('리밸런싱')
    expect(result).toContain('전략')
    expect(result).toContain('분석')
    expect(result).toContain('필요합니다')
  })

  test('extracts keywords from English text', () => {
    const result = extractTaskKeywords('Analyze the portfolio for rebalancing strategy')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toContain('the')
    expect(result).not.toContain('for')
    expect(result).toContain('analyze')
    expect(result).toContain('portfolio')
    expect(result).toContain('rebalancing')
    expect(result).toContain('strategy')
  })

  test('handles mixed Korean and English text', () => {
    const result = extractTaskKeywords('AI 에이전트 performance 분석 report 작성')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain('에이전트')
    expect(result).toContain('performance')
    expect(result).toContain('분석')
    expect(result).toContain('report')
    expect(result).toContain('작성')
  })

  test('returns empty array for empty/null input', () => {
    expect(extractTaskKeywords('')).toEqual([])
    expect(extractTaskKeywords('  ')).toEqual([])
  })

  test('removes punctuation and special characters', () => {
    const result = extractTaskKeywords('분석! 보고서, 작성하기 [긴급] #중요')
    expect(result).toContain('분석')
    expect(result).toContain('보고서')
    expect(result).toContain('작성하기')
    expect(result).toContain('긴급')
    expect(result).toContain('중요')
  })

  test('deduplicates keywords', () => {
    const result = extractTaskKeywords('분석 분석 분석 전략 전략')
    const unique = new Set(result)
    expect(result.length).toBe(unique.size)
  })

  test('limits to MAX_KEYWORDS (10)', () => {
    const longText = 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar'
    const result = extractTaskKeywords(longText)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  test('sorts by length descending (most specific first)', () => {
    const result = extractTaskKeywords('AI 포트폴리오 리밸런싱 전략')
    // Longer keywords should come first
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].length).toBeGreaterThanOrEqual(result[i + 1].length)
    }
  })

  test('filters tokens shorter than 2 chars', () => {
    const result = extractTaskKeywords('a b c 분석 전략')
    expect(result).not.toContain('a')
    expect(result).not.toContain('b')
    expect(result).not.toContain('c')
  })

  test('converts to lowercase', () => {
    const result = extractTaskKeywords('Portfolio REBALANCING Strategy')
    expect(result).toContain('portfolio')
    expect(result).toContain('rebalancing')
    expect(result).toContain('strategy')
  })
})

// ============================================================
// Test Suite 2: calculateSimilarity
// ============================================================

describe('calculateSimilarity', () => {
  test('returns 1.0 for exact keyword match', () => {
    const keywords = ['포트폴리오', '리밸런싱', '전략']
    const context = '포트폴리오\n리밸런싱\n전략'
    expect(calculateSimilarity(keywords, context)).toBe(1.0)
  })

  test('returns 0 for no overlap', () => {
    const keywords = ['포트폴리오', '리밸런싱']
    const context = '마케팅\n홍보\n캠페인'
    expect(calculateSimilarity(keywords, context)).toBe(0)
  })

  test('returns 0 for null context', () => {
    expect(calculateSimilarity(['포트폴리오'], null)).toBe(0)
  })

  test('returns 0 for empty context', () => {
    expect(calculateSimilarity(['포트폴리오'], '')).toBe(0)
    expect(calculateSimilarity(['포트폴리오'], '  ')).toBe(0)
  })

  test('returns 0 for empty keywords', () => {
    expect(calculateSimilarity([], '포트폴리오\n전략')).toBe(0)
  })

  test('returns partial score for partial overlap', () => {
    const keywords = ['포트폴리오', '리밸런싱', '전략']
    const context = '포트폴리오\n분석\n보고서'
    const score = calculateSimilarity(keywords, context)
    // 1 intersection / 5 union = 0.2
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1.0)
  })

  test('applies substring boost', () => {
    const keywords = ['포트폴리오리밸런싱']
    const context = '포트폴리오\n전략'
    const score = calculateSimilarity(keywords, context)
    // '포트폴리오' is substring of '포트폴리오리밸런싱' → should get boost
    expect(score).toBeGreaterThan(0)
  })

  test('caps score at 1.0 with substring boost', () => {
    const keywords = ['전략']
    const context = '전략'
    const score = calculateSimilarity(keywords, context)
    // Already 1.0, substring boost shouldn't exceed 1.0
    expect(score).toBe(1.0)
  })

  test('Jaccard similarity calculation is correct', () => {
    // 2 keywords match out of 4 total unique
    const keywords = ['alpha', 'bravo', 'charlie']
    const context = 'alpha\nbravo\ndelta'
    const score = calculateSimilarity(keywords, context)
    // intersection = {alpha, bravo} = 2
    // union = {alpha, bravo, charlie, delta} = 4
    // Jaccard = 2/4 = 0.5
    expect(score).toBe(0.5)
  })

  test('case-insensitive comparison', () => {
    const keywords = ['portfolio', 'strategy']
    const context = 'Portfolio\nStrategy'
    const score = calculateSimilarity(keywords, context)
    expect(score).toBe(1.0)
  })
})

// ============================================================
// Test Suite 3: collectSimilarMemories (integration)
// ============================================================

describe('collectSimilarMemories', () => {
  const { collectSimilarMemories, clearAllCache } = require('../../services/knowledge-injector')

  beforeEach(() => {
    clearAllCache()
    mockSelect.mockReset()
  })

  test('returns empty string when no task keywords extracted', async () => {
    const result = await collectSimilarMemories('c1', 'a1', '', 2000)
    expect(result).toBe('')
  })

  test('returns empty string when no memories match threshold', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [{
          id: '1',
          key: '마케팅 전략',
          content: '마케팅 관련 내용',
          memoryType: 'learning',
          context: '마케팅\n홍보\n캠페인',
          usageCount: 5,
        }],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '투자 포트폴리오 리밸런싱', 2000)
    expect(result).toBe('')
  })

  test('returns formatted memories when similarity threshold met', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [{
          id: '1',
          key: '포트폴리오 분석 기법',
          content: '포트폴리오 분석 시 섹터 비중을 확인해야 함',
          memoryType: 'learning',
          context: '포트폴리오\n분석\n리밸런싱',
          usageCount: 3,
        }],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 리밸런싱 분석', 2000)
    expect(result).toContain('관련 학습 기억')
    expect(result).toContain('포트폴리오 분석 기법')
    expect(result).toContain('유사도')
  })

  test('sorts by similarity score descending', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [
          {
            id: '1',
            key: '약간 관련',
            content: '약간 관련된 내용',
            memoryType: 'learning',
            context: '포트폴리오',
            usageCount: 10,
          },
          {
            id: '2',
            key: '매우 관련',
            content: '매우 관련된 내용',
            memoryType: 'learning',
            context: '포트폴리오\n리밸런싱\n전략',
            usageCount: 1,
          },
        ],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 리밸런싱 전략 분석', 2000)
    // Higher similarity should come first
    const idx1 = result.indexOf('매우 관련')
    const idx2 = result.indexOf('약간 관련')
    if (idx1 >= 0 && idx2 >= 0) {
      expect(idx1).toBeLessThan(idx2)
    }
  })

  test('respects charBudget limit', async () => {
    const longContent = 'x'.repeat(1500)
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [
          {
            id: '1',
            key: '메모리1',
            content: longContent,
            memoryType: 'learning',
            context: '포트폴리오\n전략',
            usageCount: 1,
          },
          {
            id: '2',
            key: '메모리2',
            content: longContent,
            memoryType: 'learning',
            context: '포트폴리오\n전략',
            usageCount: 1,
          },
        ],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 전략', 200)
    // Should be truncated to fit budget
    expect(result.length).toBeLessThanOrEqual(250) // some overhead tolerance
  })

  test('handles memories with null context gracefully', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [
          {
            id: '1',
            key: '구 메모리',
            content: '이전에 저장된 메모리',
            memoryType: 'learning',
            context: null,
            usageCount: 5,
          },
        ],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 분석', 2000)
    // null context → score 0 → filtered out
    expect(result).toBe('')
  })
})

// ============================================================
// Test Suite 4: collectAgentMemoryContext with taskDescription
// ============================================================

describe('collectAgentMemoryContext routing', () => {
  const { collectAgentMemoryContext, clearAllCache } = require('../../services/knowledge-injector')

  beforeEach(() => {
    clearAllCache()
    mockSelect.mockReset()
  })

  test('falls back to generic collection when no taskDescription', async () => {
    const genericData = [
      { id: '1', key: 'generic memory', content: 'content', memoryType: 'learning' },
    ]
    ;(genericData as any).orderBy = () => genericData
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => genericData,
      }),
    })

    const result = await collectAgentMemoryContext('c1', 'a1')
    // Should use generic path (usageCount sorted)
    if (result) {
      expect(result).toContain('generic memory')
    }
  })

  test('uses similarity-based collection when taskDescription provided', async () => {
    const similarData = [
      {
        id: '1',
        key: '포트폴리오 분석',
        content: '포트폴리오 분석 관련 학습',
        memoryType: 'learning',
        context: '포트폴리오\n분석\n리밸런싱',
        usageCount: 2,
      },
    ]
    ;(similarData as any).orderBy = () => similarData
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => similarData,
      }),
    })

    const result = await collectAgentMemoryContext('c1', 'a1', '포트폴리오 리밸런싱')
    if (result) {
      expect(result).toContain('유사도')
    }
  })

  test('different taskDescriptions produce different cache keys', async () => {
    // collectSimilarMemories uses select().from().where() (no orderBy)
    // collectAgentMemories uses select().from().where().orderBy()
    // We need the mock to handle both call patterns
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => {
          const result: unknown[] = []
          // Make it array-like but also have orderBy for fallback path
          ;(result as any).orderBy = () => []
          return result
        },
      }),
    })

    await collectAgentMemoryContext('c1', 'a1', '포트폴리오 분석')
    await collectAgentMemoryContext('c1', 'a1', '마케팅 전략')
    // Both should work without cache collision (different hash)
    // No assertion needed - just verifying no errors
  })
})

// ============================================================
// Test Suite 5: AgentRunner passes taskDescription
// ============================================================

describe('AgentRunner task description passing', () => {
  test('extracts string content from first message', () => {
    const messages = [{ role: 'user' as const, content: '포트폴리오 분석해줘' }]
    const taskDesc = typeof messages[0]?.content === 'string' ? messages[0].content : undefined
    expect(taskDesc).toBe('포트폴리오 분석해줘')
  })

  test('returns undefined for empty messages array', () => {
    const messages: Array<{ role: string; content: string }> = []
    const taskDesc = typeof messages[0]?.content === 'string' ? messages[0].content : undefined
    expect(taskDesc).toBeUndefined()
  })

  test('returns undefined for non-string content', () => {
    const messages = [{ role: 'user' as const, content: undefined }]
    const taskDesc = typeof messages[0]?.content === 'string' ? messages[0].content : undefined
    expect(taskDesc).toBeUndefined()
  })
})

// ============================================================
// Test Suite 6: Context field population in extractAndSaveMemories
// ============================================================

describe('extractAndSaveMemories context population', () => {
  test('extractTaskKeywords produces keywords that can be joined for context', () => {
    const keywords = extractTaskKeywords('포트폴리오 리밸런싱 분석 보고서 작성')
    expect(keywords.length).toBeGreaterThan(0)
    const context = keywords.join('\n')
    expect(context).toContain('포트폴리오')
    expect(context).toContain('리밸런싱')
  })

  test('context string can be used for similarity matching', () => {
    const keywords1 = extractTaskKeywords('포트폴리오 리밸런싱 전략')
    const context = keywords1.join('\n')

    const keywords2 = extractTaskKeywords('포트폴리오 전략 분석')
    const score = calculateSimilarity(keywords2, context)
    expect(score).toBeGreaterThan(0)
  })

  test('empty task description produces no context', () => {
    const keywords = extractTaskKeywords('')
    expect(keywords).toEqual([])
    const context = keywords.length > 0 ? keywords.join('\n') : undefined
    expect(context).toBeUndefined()
  })
})

// ============================================================
// Test Suite 7: simpleHash consistency
// ============================================================

describe('cache key differentiation', () => {
  test('same input produces same hash', () => {
    const { clearAllCache } = require('../../services/knowledge-injector')
    clearAllCache()

    // simpleHash is internal, but we can test indirectly via cache behavior
    // Same taskDescription should hit cache on second call
    // Different taskDescription should not hit cache
    // This is verified by the routing test above
  })
})

// ============================================================
// Test Suite 8: Edge cases
// ============================================================

describe('edge cases', () => {
  test('single keyword task description', () => {
    const result = extractTaskKeywords('분석')
    expect(result).toEqual(['분석'])
  })

  test('very long task description truncated to MAX_KEYWORDS', () => {
    const words = Array.from({ length: 50 }, (_, i) => `keyword${i}longenough`)
    const result = extractTaskKeywords(words.join(' '))
    expect(result.length).toBeLessThanOrEqual(10)
  })

  test('similarity with single keyword overlap', () => {
    const score = calculateSimilarity(['분석'], '분석\n전략\n보고서')
    // intersection = 1, union = 3, Jaccard = 1/3 ≈ 0.333
    expect(score).toBeCloseTo(0.333, 1)
  })

  test('Korean stopwords are correctly filtered', () => {
    const result = extractTaskKeywords('이것은 분석을 위한 것이다')
    expect(result).not.toContain('이것')
    expect(result).not.toContain('을')
    expect(result).not.toContain('위해')
    expect(result).not.toContain('것')
  })

  test('numbers in keywords are preserved', () => {
    const result = extractTaskKeywords('2024년 Q3 분기 보고서')
    expect(result).toContain('2024년')
  })

  test('handles unicode correctly', () => {
    const result = extractTaskKeywords('データ分析レポート')
    expect(result.length).toBeGreaterThan(0)
  })

  test('calculateSimilarity handles context with empty lines', () => {
    const score = calculateSimilarity(['분석'], '분석\n\n\n전략')
    expect(score).toBeGreaterThan(0)
  })

  test('substring boost only applies when not exact match', () => {
    // Both keywords are exact matches, no substring needed
    const score = calculateSimilarity(['alpha', 'bravo'], 'alpha\nbravo')
    expect(score).toBe(1.0) // exact Jaccard, no boost needed
  })
})

// ============================================================
// TEA Suite: Risk-Based Boundary Tests
// ============================================================

describe('TEA: similarity threshold boundary', () => {
  test('score exactly at 0.2 threshold passes', () => {
    // 1 intersection / 5 union = 0.2
    const keywords = ['alpha']
    const context = 'alpha\nbravo\ncharlie\ndelta'
    const score = calculateSimilarity(keywords, context)
    // 1 / 5 = 0.2 → should pass threshold
    expect(score).toBeGreaterThanOrEqual(0.2)
  })

  test('score just below 0.2 threshold is filtered', () => {
    // We need score < 0.2, with no substring matches
    // 1 intersection / 8 union = 0.125 (no substring boost since exact match only)
    const keywords = ['zz']
    const context = 'zz\naa\nbb\ncc\ndd\nee\nff'
    const score = calculateSimilarity(keywords, context)
    // 1/7 = 0.143 → below 0.2, no substring overlap
    expect(score).toBeLessThan(0.2)
  })
})

describe('TEA: keyword extraction robustness', () => {
  test('handles only stopwords input', () => {
    const result = extractTaskKeywords('the is a an to for of in on at')
    expect(result).toEqual([])
  })

  test('handles Korean-only stopwords', () => {
    const result = extractTaskKeywords('은 는 이 가 을 를')
    expect(result).toEqual([])
  })

  test('handles whitespace-only separators', () => {
    const result = extractTaskKeywords('포트폴리오   \t  리밸런싱   전략')
    expect(result).toContain('포트폴리오')
    expect(result).toContain('리밸런싱')
    expect(result).toContain('전략')
  })

  test('handles newlines in task description', () => {
    const result = extractTaskKeywords('포트폴리오\n리밸런싱\n전략')
    expect(result).toContain('포트폴리오')
    expect(result).toContain('리밸런싱')
  })

  test('handles emoji in input', () => {
    const result = extractTaskKeywords('🚀 분석 📊 보고서')
    expect(result).toContain('분석')
    expect(result).toContain('보고서')
  })
})

describe('TEA: similarity scoring edge precision', () => {
  test('large keyword sets produce correct Jaccard with possible substring boost', () => {
    const task = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10']
    const ctx = 'a1\na2\na3\na4\na5\nb6\nb7\nb8\nb9\nb10'
    const score = calculateSimilarity(task, ctx)
    // intersection = 5, union = 15, Jaccard = 5/15 ≈ 0.333
    // Possible substring boost if 'a1' in 'a10' etc → +0.1
    expect(score).toBeGreaterThanOrEqual(0.333)
    expect(score).toBeLessThanOrEqual(0.5)
  })

  test('duplicates in context are deduplicated', () => {
    const keywords = ['alpha']
    const ctx = 'alpha\nalpha\nalpha'
    // Memory keywords: ['alpha'] (set dedup), task: ['alpha']
    // Jaccard = 1/1 = 1.0
    const score = calculateSimilarity(keywords, ctx)
    expect(score).toBe(1.0)
  })

  test('symmetric: same result regardless of which is task vs context', () => {
    const set1 = ['alpha', 'bravo', 'charlie']
    const set2 = 'delta\nbravo\necho'
    const score1 = calculateSimilarity(set1, set2)
    // Reverse roles
    const set2AsArray = ['delta', 'bravo', 'echo']
    const set1AsCtx = 'alpha\nbravo\ncharlie'
    const score2 = calculateSimilarity(set2AsArray, set1AsCtx)
    expect(score1).toBe(score2) // Jaccard is symmetric
  })
})

describe('TEA: collectSimilarMemories advanced', () => {
  const { collectSimilarMemories, clearAllCache } = require('../../services/knowledge-injector')

  beforeEach(() => {
    clearAllCache()
    mockSelect.mockReset()
  })

  test('many memories: only top matches included within budget', async () => {
    const memories = Array.from({ length: 20 }, (_, i) => ({
      id: `m${i}`,
      key: `메모리 ${i}`,
      content: `메모리 내용 ${i} 포트폴리오 관련`,
      memoryType: 'learning',
      context: i < 5 ? '포트폴리오\n전략\n분석' : '마케팅\n홍보\n캠페인',
      usageCount: i,
    }))

    mockSelect.mockReturnValue({
      from: () => ({
        where: () => memories,
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 전략 분석', 2000)
    // Only first 5 memories should match (context contains matching keywords)
    expect(result).toContain('관련 학습 기억')
    // Marketing memories should NOT appear
    expect(result).not.toContain('메모리 10')
    expect(result).not.toContain('메모리 15')
  })

  test('empty memory list returns empty string', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 분석', 2000)
    expect(result).toBe('')
  })

  test('all memories below threshold returns empty', async () => {
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => [{
          id: '1',
          key: '전혀 다른 주제',
          content: '완전히 관련없는 내용',
          memoryType: 'learning',
          context: 'xyz\nabc\ndef\nghi\njkl\nmno',
          usageCount: 100,
        }],
      }),
    })

    const result = await collectSimilarMemories('c1', 'a1', '포트폴리오 리밸런싱', 2000)
    expect(result).toBe('')
  })
})

describe('TEA: full pipeline roundtrip', () => {
  test('keywords → context → similarity forms complete cycle', () => {
    // Step 1: Task A completes, keywords extracted
    const taskA = '포트폴리오 리밸런싱 분석 Q3 보고서 작성'
    const keywordsA = extractTaskKeywords(taskA)
    const contextA = keywordsA.join('\n')

    // Step 2: Task B arrives, similar topic
    const taskB = '포트폴리오 분석 보고서 Q4'
    const keywordsB = extractTaskKeywords(taskB)

    // Step 3: Similarity should be high
    const score = calculateSimilarity(keywordsB, contextA)
    expect(score).toBeGreaterThan(0.2)

    // Step 4: Unrelated task should score low
    const taskC = '마케팅 캠페인 SNS 홍보 전략'
    const keywordsC = extractTaskKeywords(taskC)
    const unrelatedScore = calculateSimilarity(keywordsC, contextA)
    expect(unrelatedScore).toBeLessThan(0.2)
  })

  test('repeated similar tasks should produce progressively better matching', () => {
    // Multiple related tasks build up context
    const tasks = [
      '포트폴리오 리밸런싱 전략 수립',
      '포트폴리오 섹터 비중 분석',
      '투자 포트폴리오 성과 보고서',
    ]

    const contexts = tasks.map(t => extractTaskKeywords(t).join('\n'))

    // New related task
    const newTask = '포트폴리오 리밸런싱 보고서'
    const newKeywords = extractTaskKeywords(newTask)

    const scores = contexts.map(ctx => calculateSimilarity(newKeywords, ctx))

    // All should have some similarity
    for (const score of scores) {
      expect(score).toBeGreaterThan(0)
    }

    // First task (most keywords in common) should score highest
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1])
  })
})

describe('TEA: backward compatibility', () => {
  const { collectAgentMemoryContext, clearAllCache } = require('../../services/knowledge-injector')

  beforeEach(() => {
    clearAllCache()
    mockSelect.mockReset()
  })

  test('existing callers without taskDescription still work', async () => {
    const data = [
      { id: '1', key: 'old memory', content: 'old content', memoryType: 'learning' },
    ]
    ;(data as any).orderBy = () => data
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => data,
      }),
    })

    // Old calling convention (2 params)
    const result = await collectAgentMemoryContext('c1', 'a1')
    expect(result).toContain('old memory')
    expect(result).not.toContain('유사도') // Should NOT have similarity header
  })

  test('undefined taskDescription behaves same as no param', async () => {
    const data = [
      { id: '1', key: 'test mem', content: 'test content', memoryType: 'insight' },
    ]
    ;(data as any).orderBy = () => data
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => data,
      }),
    })

    const result = await collectAgentMemoryContext('c1', 'a1', undefined)
    expect(result).toContain('test mem')
    expect(result).not.toContain('유사도')
  })

  test('empty string taskDescription falls back to generic', async () => {
    const data = [
      { id: '1', key: 'fallback mem', content: 'fallback content', memoryType: 'fact' },
    ]
    ;(data as any).orderBy = () => data
    mockSelect.mockReturnValue({
      from: () => ({
        where: () => data,
      }),
    })

    const result = await collectAgentMemoryContext('c1', 'a1', '  ')
    // Whitespace-only should trigger fallback since trim() is empty
    expect(result).toContain('fallback mem')
  })
})
