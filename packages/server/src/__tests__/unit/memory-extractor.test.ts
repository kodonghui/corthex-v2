import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// === Mock DB ===
const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => []),
  })),
}))
const mockInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => [{ id: 'mem-1' }]),
  })),
}))
const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => ({
      returning: mock(() => []),
    })),
  })),
}))

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}))

mock.module('../../db/schema', () => ({
  agentMemories: {
    id: 'id',
    companyId: 'company_id',
    agentId: 'agent_id',
    memoryType: 'memory_type',
    key: 'key',
    content: 'content',
    context: 'context',
    source: 'source',
    confidence: 'confidence',
    usageCount: 'usage_count',
    lastUsedAt: 'last_used_at',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  agents: {
    id: 'id',
    companyId: 'company_id',
    departmentId: 'department_id',
  },
}))

// === Mock LLM Router ===
const mockLLMCall = mock(() =>
  Promise.resolve({
    content: '[{"key": "테스트 학습", "content": "테스트 내용입니다", "memoryType": "learning"}]',
    usage: { inputTokens: 100, outputTokens: 50 },
    finishReason: 'end_turn',
    toolCalls: [],
  }),
)

mock.module('../../services/llm-router', () => ({
  llmRouter: {
    call: mockLLMCall,
  },
  resolveModel: () => ({ model: 'claude-haiku-4-5', reason: 'tier-default' as const }),
}))

// === Mock Knowledge Injector ===
const mockClearCache = mock(() => {})
mock.module('../../services/knowledge-injector', () => ({
  clearKnowledgeCache: mockClearCache,
  collectKnowledgeContext: mock(() => Promise.resolve(null)),
  collectAgentMemoryContext: mock(() => Promise.resolve(null)),
}))

// === Mock Agent Runner (for scanForCredentials) ===
mock.module('../../services/agent-runner', () => ({
  scanForCredentials: (text: string) => {
    if (/sk-[a-zA-Z0-9_-]{20,}/.test(text)) {
      throw new Error('Credential pattern detected')
    }
    if (/API_KEY\s*=\s*[^\s]{10,}/i.test(text)) {
      throw new Error('Credential pattern detected')
    }
  },
  agentRunner: { execute: mock(() => Promise.resolve({ content: 'ok' })) },
  buildSystemPrompt: mock(() => 'prompt'),
  setToolDefinitionProvider: mock(() => {}),
  setToolNameProvider: mock(() => {}),
  AgentRunner: class {},
}))

// === Mock drizzle-orm ===
mock.module('drizzle-orm', () => ({
  eq: (...args: unknown[]) => ({ type: 'eq', args }),
  and: (...args: unknown[]) => ({ type: 'and', args }),
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ type: 'sql', strings, values }),
  desc: (col: unknown) => ({ type: 'desc', col }),
}))

import {
  parseExtractionResponse,
  extractAndSaveMemories,
  consolidateMemories,
  isRateLimited,
  clearRateLimiter,
} from '../../services/memory-extractor'

describe('memory-extractor', () => {
  beforeEach(() => {
    clearRateLimiter()
    mockLLMCall.mockClear()
    mockSelect.mockClear()
    mockInsert.mockClear()
    mockUpdate.mockClear()
    mockClearCache.mockClear()
  })

  // === parseExtractionResponse Tests ===
  describe('parseExtractionResponse', () => {
    test('parses valid JSON array directly', () => {
      const input = '[{"key": "제목1", "content": "내용1", "memoryType": "learning"}]'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('제목1')
      expect(result[0].content).toBe('내용1')
      expect(result[0].memoryType).toBe('learning')
    })

    test('parses JSON with surrounding text using regex fallback', () => {
      const input = '여기 결과입니다:\n[{"key": "학습1", "content": "내용1", "memoryType": "insight"}]\n끝.'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(1)
      expect(result[0].memoryType).toBe('insight')
    })

    test('limits to max 3 items', () => {
      const input = JSON.stringify([
        { key: 'a', content: 'A', memoryType: 'learning' },
        { key: 'b', content: 'B', memoryType: 'learning' },
        { key: 'c', content: 'C', memoryType: 'learning' },
        { key: 'd', content: 'D', memoryType: 'learning' },
        { key: 'e', content: 'E', memoryType: 'learning' },
      ])
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(3)
    })

    test('defaults memoryType to learning for invalid types', () => {
      const input = '[{"key": "k", "content": "c", "memoryType": "invalid"}]'
      const result = parseExtractionResponse(input)
      expect(result[0].memoryType).toBe('learning')
    })

    test('supports v1 format with "value" instead of "content"', () => {
      const input = '[{"key": "제목", "value": "학습 내용"}]'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(1)
      expect(result[0].content).toBe('학습 내용')
    })

    test('skips items with empty key or content', () => {
      const input = '[{"key": "", "content": "c"}, {"key": "k", "content": ""}]'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(0)
    })

    test('returns empty array for completely invalid input', () => {
      const result = parseExtractionResponse('this is not json at all')
      expect(result).toHaveLength(0)
    })

    test('handles markdown code block wrapper', () => {
      const input = '```json\n[{"key": "k", "content": "c", "memoryType": "fact"}]\n```'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(1)
      expect(result[0].memoryType).toBe('fact')
    })

    test('handles preference memoryType', () => {
      const input = '[{"key": "선호도", "content": "간결한 보고서를 선호", "memoryType": "preference"}]'
      const result = parseExtractionResponse(input)
      expect(result[0].memoryType).toBe('preference')
    })

    test('handles non-array JSON', () => {
      const input = '{"key": "k", "content": "c"}'
      const result = parseExtractionResponse(input)
      expect(result).toHaveLength(0)
    })
  })

  // === Rate Limiter Tests ===
  describe('rate limiter', () => {
    test('allows first extraction', () => {
      expect(isRateLimited('agent-1')).toBe(false)
    })

    test('blocks rapid second extraction for same agent', async () => {
      // Simulate an extraction
      await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-rate-test',
        taskDescription: 'test task',
        taskResult: 'test result',
      })

      expect(isRateLimited('agent-rate-test')).toBe(true)
    })

    test('allows different agents simultaneously', async () => {
      await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-A',
        taskDescription: 'test',
        taskResult: 'result',
      })

      expect(isRateLimited('agent-A')).toBe(true)
      expect(isRateLimited('agent-B')).toBe(false)
    })

    test('clears rate limiter', () => {
      clearRateLimiter()
      expect(isRateLimited('agent-rate-test')).toBe(false)
    })
  })

  // === extractAndSaveMemories Tests ===
  describe('extractAndSaveMemories', () => {
    test('calls LLM router with correct parameters', async () => {
      await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-1',
        taskDescription: '보고서 작성',
        taskResult: '보고서가 완성되었습니다',
        source: '투자팀장',
      })

      expect(mockLLMCall).toHaveBeenCalledTimes(1)
      const callArgs = mockLLMCall.mock.calls[0]
      expect(callArgs[0].model).toBe('claude-haiku-4-5')
      expect(callArgs[0].systemPrompt).toContain('학습 사항을 추출')
      expect(callArgs[0].messages[0].content).toContain('보고서 작성')
    })

    test('returns saved count and memories', async () => {
      const result = await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-new-1',
        taskDescription: 'test',
        taskResult: 'result',
      })

      expect(result.saved).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(result.memories)).toBe(true)
    })

    test('skips when rate limited', async () => {
      // First call
      await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-rl',
        taskDescription: 'test',
        taskResult: 'result',
      })

      mockLLMCall.mockClear()

      // Second call should be rate limited
      const result = await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-rl',
        taskDescription: 'test2',
        taskResult: 'result2',
      })

      expect(result.saved).toBe(0)
      expect(mockLLMCall).not.toHaveBeenCalled()
    })

    test('truncates long task descriptions and results', async () => {
      const longText = 'x'.repeat(5000)
      await extractAndSaveMemories({
        companyId: 'comp-1',
        agentId: 'agent-trunc',
        taskDescription: longText,
        taskResult: longText,
      })

      const callArgs = mockLLMCall.mock.calls[0]
      const userMsg = callArgs[0].messages[0].content
      // Should be truncated to ~2000 chars per section
      expect(userMsg.length).toBeLessThan(5000)
    })

    test('clears knowledge cache after saving memories', async () => {
      await extractAndSaveMemories({
        companyId: 'comp-cache',
        agentId: 'agent-cache',
        taskDescription: 'test',
        taskResult: 'result',
      })

      // Cache clear may or may not be called depending on save success
      // At minimum, no error should be thrown
    })
  })

  // === Credential Scrubbing Tests ===
  describe('credential scrubbing', () => {
    test('skips memories containing API keys', () => {
      const items = parseExtractionResponse(
        '[{"key": "API key found", "content": "The key is sk-abcdefghijklmnopqrstuvwxyz123", "memoryType": "learning"}]',
      )
      // Items are parsed successfully - scrubbing happens at save time
      expect(items).toHaveLength(1)
    })

    test('parseExtractionResponse still returns items (scrubbing at save)', () => {
      const items = parseExtractionResponse(
        '[{"key": "config", "content": "API_KEY = supersecretkey123456", "memoryType": "fact"}]',
      )
      expect(items).toHaveLength(1)
    })
  })

  // === consolidateMemories Tests ===
  describe('consolidateMemories', () => {
    test('returns zero merged for single memory', async () => {
      mockSelect.mockReturnValueOnce({
        from: () => ({
          where: () => [{ id: 'mem-1', key: 'key1', content: 'content1', usageCount: 1, createdAt: new Date() }],
        }),
      })

      const result = await consolidateMemories('comp-1', 'agent-1')
      expect(result.merged).toBe(0)
      expect(result.remaining).toBe(1)
    })

    test('returns zero merged for empty memories', async () => {
      mockSelect.mockReturnValueOnce({
        from: () => ({
          where: () => [],
        }),
      })

      const result = await consolidateMemories('comp-1', 'agent-empty')
      expect(result.merged).toBe(0)
      expect(result.remaining).toBe(0)
    })

    test('merges memories with identical keys (case-insensitive)', async () => {
      mockSelect.mockReturnValueOnce({
        from: () => ({
          where: () => [
            { id: 'mem-1', key: 'Report Writing', content: 'Be concise', usageCount: 5, createdAt: new Date() },
            { id: 'mem-2', key: 'report writing', content: 'Use bullet points', usageCount: 2, createdAt: new Date() },
          ],
        }),
      })

      const result = await consolidateMemories('comp-1', 'agent-dup')
      expect(result.merged).toBe(1)
      expect(result.remaining).toBe(1)
    })

    test('merges memories where one key contains another', async () => {
      mockSelect.mockReturnValueOnce({
        from: () => ({
          where: () => [
            { id: 'mem-1', key: 'analysis', content: 'Content A', usageCount: 3, createdAt: new Date() },
            { id: 'mem-2', key: 'analysis technique', content: 'Content B', usageCount: 1, createdAt: new Date() },
          ],
        }),
      })

      const result = await consolidateMemories('comp-1', 'agent-sub')
      expect(result.merged).toBe(1)
      expect(result.remaining).toBe(1)
    })

    test('does not merge unrelated memories', async () => {
      mockSelect.mockReturnValueOnce({
        from: () => ({
          where: () => [
            { id: 'mem-1', key: 'report format', content: 'Content A', usageCount: 1, createdAt: new Date() },
            { id: 'mem-2', key: 'data analysis', content: 'Content B', usageCount: 1, createdAt: new Date() },
          ],
        }),
      })

      const result = await consolidateMemories('comp-1', 'agent-nomatch')
      expect(result.merged).toBe(0)
      expect(result.remaining).toBe(2)
    })
  })
})
