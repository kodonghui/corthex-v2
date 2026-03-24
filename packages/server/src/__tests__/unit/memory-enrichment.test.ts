import { describe, test, expect, beforeEach, mock } from 'bun:test'

// === Mock all modules that would trigger credential-crypto import chain ===
// scoped-query.ts imports credential-crypto directly — must be fully mocked
const mockListAgentMemories = mock(() => Promise.resolve([] as any[]))
const mockSearchMemoriesBySimilarity = mock(() => Promise.resolve([] as any[]))

mock.module('../../db/scoped-query', () => ({
  getDB: () => ({
    listAgentMemories: mockListAgentMemories,
    searchMemoriesBySimilarity: mockSearchMemoriesBySimilarity,
  }),
}))

const mockSelect = mock((): any => ({
  from: mock((): any => ({
    where: mock((): any => ({
      limit: mock(() => []),
    })),
  })),
}))

mock.module('../../db', () => ({
  db: { select: mockSelect },
}))
mock.module('../../db/schema', () => ({
  agents: { id: 'id', companyId: 'company_id', personalityTraits: 'personality_traits' },
  agentMemories: {},
}))
mock.module('../../db/logger', () => ({
  createLogger: () => ({ warn: mock(() => {}), info: mock(() => {}) }),
}))

// Mock voyage-embedding to prevent credential-vault import chain
const mockGetEmbedding = mock(() => Promise.resolve(null as number[] | null))
mock.module('../../services/voyage-embedding', () => ({
  getEmbedding: mockGetEmbedding,
  EMBEDDING_MODEL: 'voyage-3',
  EMBEDDING_DIMENSIONS: 1024,
}))

// Mock credential-crypto to prevent fail-fast validation
mock.module('../../lib/credential-crypto', () => ({
  encrypt: mock((v: string) => v),
  decrypt: mock((v: string) => v),
  _validateKeyHex: mock(() => {}),
}))

// drizzle-orm — need real eq/and for soul-enricher
mock.module('drizzle-orm', () => ({
  eq: mock((...args: any[]) => args),
  and: mock((...args: any[]) => args),
  desc: mock((col: any) => col),
  sql: mock((strings: any, ...values: any[]) => ({ strings, values })),
}))

// Now import the module under test (mocks already registered)
const { getMemoryContext, searchRelevantMemories, enrich } = await import('../../services/soul-enricher')

describe('Story 28.6: Memory Enrichment', () => {
  beforeEach(() => {
    mockListAgentMemories.mockReset()
    mockListAgentMemories.mockResolvedValue([])
    mockSearchMemoriesBySimilarity.mockReset()
    mockSearchMemoriesBySimilarity.mockResolvedValue([])
    mockGetEmbedding.mockReset()
    mockGetEmbedding.mockResolvedValue(null)
    mockSelect.mockReset()
    mockSelect.mockReturnValue({
      from: mock((): any => ({
        where: mock((): any => ({
          limit: mock(() => []),
        })),
      })),
    })
  })

  describe('getMemoryContext', () => {
    test('returns empty string when no memories exist', async () => {
      mockListAgentMemories.mockResolvedValue([])
      const result = await getMemoryContext('company-1', 'agent-1')
      expect(result).toBe('')
    })

    test('returns formatted memory block with agent_memories tags', async () => {
      mockListAgentMemories.mockResolvedValue([
        { content: 'User prefers Korean', confidence: 90 },
        { content: 'API timeout is 30s', confidence: 70 },
      ])
      const result = await getMemoryContext('company-1', 'agent-1')
      expect(result).toContain('<agent_memories>')
      expect(result).toContain('</agent_memories>')
      expect(result).toContain('User prefers Korean (confidence: 90%)')
      expect(result).toContain('API timeout is 30s (confidence: 70%)')
    })

    test('orders memories by confidence DESC', async () => {
      mockListAgentMemories.mockResolvedValue([
        { content: 'Low confidence', confidence: 30 },
        { content: 'High confidence', confidence: 95 },
        { content: 'Medium confidence', confidence: 60 },
      ])
      const result = await getMemoryContext('company-1', 'agent-1')
      const lines = result.split('\n').filter(l => l.startsWith('- '))
      expect(lines[0]).toContain('High confidence')
      expect(lines[1]).toContain('Medium confidence')
      expect(lines[2]).toContain('Low confidence')
    })

    test('limits to max 10 memories', async () => {
      const manyMemories = Array.from({ length: 15 }, (_, i) => ({
        content: `Memory ${i}`,
        confidence: 50 + i,
      }))
      mockListAgentMemories.mockResolvedValue(manyMemories)
      const result = await getMemoryContext('company-1', 'agent-1')
      const lines = result.split('\n').filter(l => l.startsWith('- '))
      expect(lines.length).toBe(10)
    })

    test('includes header text about accumulated memories', async () => {
      mockListAgentMemories.mockResolvedValue([
        { content: 'Test memory', confidence: 80 },
      ])
      const result = await getMemoryContext('company-1', 'agent-1')
      expect(result).toContain('accumulated memories and learnings from past interactions')
    })

    test('handles null confidence gracefully', async () => {
      mockListAgentMemories.mockResolvedValue([
        { content: 'No confidence', confidence: null },
        { content: 'Has confidence', confidence: 80 },
      ])
      const result = await getMemoryContext('company-1', 'agent-1')
      const lines = result.split('\n').filter(l => l.startsWith('- '))
      // confidence=80 should come first (null treated as 0)
      expect(lines[0]).toContain('Has confidence')
      expect(lines[1]).toContain('No confidence')
    })
  })

  describe('searchRelevantMemories', () => {
    test('returns empty string when embedding fails (no API key)', async () => {
      mockGetEmbedding.mockResolvedValue(null)
      const result = await searchRelevantMemories('company-1', 'agent-1', 'hello')
      expect(result).toBe('')
    })

    test('returns empty string when no similar memories found', async () => {
      mockGetEmbedding.mockResolvedValue(new Array(1024).fill(0.1))
      mockSearchMemoriesBySimilarity.mockResolvedValue([])
      const result = await searchRelevantMemories('company-1', 'agent-1', 'hello')
      expect(result).toBe('')
    })

    test('returns formatted results with relevance percentages', async () => {
      mockGetEmbedding.mockResolvedValue(new Array(1024).fill(0.1))
      mockSearchMemoriesBySimilarity.mockResolvedValue([
        { content: 'User likes charts', similarity: 0.92 },
        { content: 'Prefers dark mode', similarity: 0.85 },
      ])
      const result = await searchRelevantMemories('company-1', 'agent-1', 'show me data')
      expect(result).toContain('User likes charts (relevance: 92%)')
      expect(result).toContain('Prefers dark mode (relevance: 85%)')
    })

    test('uses default limit of 5', async () => {
      mockGetEmbedding.mockResolvedValue(new Array(1024).fill(0.1))
      mockSearchMemoriesBySimilarity.mockResolvedValue([])
      await searchRelevantMemories('company-1', 'agent-1', 'test')
      expect(mockSearchMemoriesBySimilarity).toHaveBeenCalledWith(
        'agent-1', expect.any(Array), 5, 0.3,
      )
    })

    test('respects custom limit', async () => {
      mockGetEmbedding.mockResolvedValue(new Array(1024).fill(0.1))
      mockSearchMemoriesBySimilarity.mockResolvedValue([])
      await searchRelevantMemories('company-1', 'agent-1', 'test', 3)
      expect(mockSearchMemoriesBySimilarity).toHaveBeenCalledWith(
        'agent-1', expect.any(Array), 3, 0.3,
      )
    })
  })

  describe('enrich — memory integration', () => {
    test('returns memoryContext field in result', async () => {
      mockSelect.mockReturnValue({
        from: mock((): any => ({
          where: mock((): any => ({
            limit: mock(() => [{ personalityTraits: null }]),
          })),
        })),
      })
      mockListAgentMemories.mockResolvedValue([])
      const result = await enrich('agent-1', 'company-1')
      expect(result).toHaveProperty('memoryContext')
      expect(typeof result.memoryContext).toBe('string')
    })

    test('memoryContext contains agent_memories when memories exist', async () => {
      mockSelect.mockReturnValue({
        from: mock((): any => ({
          where: mock((): any => ({
            limit: mock(() => [{ personalityTraits: null }]),
          })),
        })),
      })
      mockListAgentMemories.mockResolvedValue([
        { content: 'Important learning', confidence: 85 },
      ])
      const result = await enrich('agent-1', 'company-1')
      expect(result.memoryContext).toContain('<agent_memories>')
      expect(result.memoryContext).toContain('Important learning')
    })

    test('memoryContext is empty string when memory DB error occurs', async () => {
      mockSelect.mockReturnValue({
        from: mock((): any => ({
          where: mock((): any => ({
            limit: mock(() => [{ personalityTraits: null }]),
          })),
        })),
      })
      mockListAgentMemories.mockRejectedValue(new Error('DB down'))
      const result = await enrich('agent-1', 'company-1')
      expect(result.memoryContext).toBe('')
    })

    test('AR60: memory enrichment does not affect PER-1 personality sanitization', async () => {
      mockSelect.mockReturnValue({
        from: mock((): any => ({
          where: mock((): any => ({
            limit: mock(() => [{
              personalityTraits: { openness: 75, conscientiousness: 80 },
            }]),
          })),
        })),
      })
      mockListAgentMemories.mockResolvedValue([
        { content: 'Memory item', confidence: 90 },
      ])
      const result = await enrich('agent-1', 'company-1')
      // Personality vars should be unaffected by memory
      expect(result.personalityVars.personality_openness).toBe('75')
      expect(result.personalityVars.personality_conscientiousness).toBe('80')
      // Memory context should be separate
      expect(result.memoryContext).toContain('Memory item')
    })

    test('empty result includes memoryContext field on top-level error', async () => {
      mockSelect.mockImplementation((): any => { throw new Error('DB error') })
      const result = await enrich('agent-1', 'company-1')
      expect(result.memoryContext).toBe('')
      expect(result.personalityVars).toEqual({})
      expect(result.memoryVars).toEqual({})
    })
  })
})
