/**
 * QA Verification Tests -- Story 3-4: AgentRunner
 *
 * Validates all 10 Acceptance Criteria from story spec.
 * Focus: AC-by-AC verification + edge cases
 */
import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequest,
  LLMProviderName,
  TaskRequest,
  ToolExecutor,
} from '@corthex/shared'

// Mock dependencies
const mockCall = mock<(request: LLMRequest, context: unknown) => Promise<LLMResponse>>()
const mockStream = mock<(request: LLMRequest, context: unknown) => AsyncGenerator<LLMStreamChunk>>()
const mockResolveModel = mock<(agent: { tier: string; modelName: string }) => { model: string; reason: string }>()
const mockResolveProvider = mock<(modelId: string) => LLMProviderName>()

mock.module('../../services/llm-router', () => ({
  llmRouter: { call: mockCall, stream: mockStream },
  resolveModel: mockResolveModel,
  resolveProvider: mockResolveProvider,
  LLMRouter: class {},
}))

mock.module('../../lib/cost-tracker', () => ({
  calculateCostMicro: mock(() => 2500),
  recordCost: mock(() => Promise.resolve()),
}))

mock.module('../../services/knowledge-injector', () => ({
  collectKnowledgeContext: mock(() => Promise.resolve(null)),
  collectAgentMemoryContext: mock(() => Promise.resolve(null)),
  clearKnowledgeCache: mock(() => {}),
  clearAllCache: mock(() => {}),
}))

mock.module('../../services/memory-extractor', () => ({
  extractAndSaveMemories: mock(() => Promise.resolve({ saved: 0, memories: [] })),
  consolidateMemories: mock(() => Promise.resolve({ merged: 0, remaining: 0 })),
  clearRateLimiter: mock(() => {}),
  isRateLimited: mock(() => false),
}))

import { AgentRunner, buildSystemPrompt, getToolDefinitions } from '../../services/agent-runner'
import type { AgentConfig } from '../../services/agent-runner'

function makeAgent(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    id: 'qa-agent',
    companyId: 'qa-company',
    name: 'QATestAgent',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    soul: 'You are a QA verification agent.',
    allowedTools: [],
    isActive: true,
    ...overrides,
  }
}

function makeContext() {
  return { companyId: 'qa-company', agentId: 'qa-agent', agentName: 'QATestAgent', source: 'delegation' as const }
}

function makeTask(overrides: Partial<TaskRequest> = {}): TaskRequest {
  return { messages: [{ role: 'user' as const, content: 'QA test' }], ...overrides }
}

function makeLLMResponse(overrides: Partial<LLMResponse> = {}): LLMResponse {
  return {
    content: 'QA response',
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 50 },
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    finishReason: 'stop',
    ...overrides,
  }
}

describe('QA: Story 3-4 Acceptance Criteria Verification', () => {
  let runner: AgentRunner

  beforeEach(() => {
    runner = new AgentRunner()
    mockCall.mockReset()
    mockStream.mockReset()
    mockResolveModel.mockReset()
    mockResolveProvider.mockReset()
    mockResolveModel.mockReturnValue({ model: 'claude-haiku-4-5', reason: 'tier-default' })
    mockResolveProvider.mockReturnValue('anthropic')
  })

  // AC1: buildSystemPrompt assembles soul + tools, no credentials
  describe('AC1: buildSystemPrompt', () => {
    it('assembles soul markdown into prompt', () => {
      const agent = makeAgent({ soul: '# Financial Analyst\nAnalyze markets.' })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('# Financial Analyst')
      expect(prompt).toContain('Analyze markets.')
    })

    it('includes tool definitions when provided', () => {
      const agent = makeAgent()
      const tools = [{ name: 'search', description: 'Web search', parameters: {} }]
      const prompt = buildSystemPrompt(agent, tools)
      expect(prompt).toContain('search')
      expect(prompt).toContain('Web search')
    })

    it('rejects prompts containing credentials (NFR11)', () => {
      const agent = makeAgent({ soul: 'Use key: sk-1234567890abcdefghijklmn' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern')
    })
  })

  // AC2: execute returns structured TaskResponse
  describe('AC2: execute returns TaskResponse', () => {
    it('returns all required fields in TaskResponse', async () => {
      const agent = makeAgent()
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      const result = await runner.execute(agent, makeTask(), makeContext())

      // Verify all TaskResponse fields exist
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('toolCalls')
      expect(result).toHaveProperty('usage')
      expect(result).toHaveProperty('cost')
      expect(result).toHaveProperty('finishReason')
      expect(result).toHaveProperty('iterations')

      // Verify nested structure
      expect(result.usage).toHaveProperty('inputTokens')
      expect(result.usage).toHaveProperty('outputTokens')
      expect(result.cost).toHaveProperty('model')
      expect(result.cost).toHaveProperty('provider')
      expect(result.cost).toHaveProperty('estimatedCostMicro')
    })
  })

  // AC3: Tool call loop -- LLM tool_use -> execute -> feed back -> repeat
  describe('AC3: Tool call loop', () => {
    it('detects tool_use, executes via callback, feeds result back to LLM', async () => {
      const agent = makeAgent({ allowedTools: ['calc'] })
      const toolExecutor: ToolExecutor = async (name, args) => ({
        result: `Result for ${name}: ${JSON.stringify(args)}`,
      })

      // Round 1: tool call
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'calc', arguments: { expr: '2+2' } }],
        }),
      )

      // Round 2: final response
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'The answer is 4.', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.content).toBe('The answer is 4.')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].name).toBe('calc')
      expect(result.toolCalls[0].result).toContain('Result for calc')

      // Verify tool result was fed back to LLM
      const secondCallMsgs = mockCall.mock.calls[1][0].messages
      expect(secondCallMsgs.some((m: any) => m.role === 'tool')).toBe(true)
    })
  })

  // AC4: Max tool iterations limit (5 default)
  describe('AC4: Max tool iterations', () => {
    it('stops after 5 iterations with warning', async () => {
      const agent = makeAgent({ allowedTools: ['loop'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      for (let i = 0; i < 5; i++) {
        mockCall.mockResolvedValueOnce(
          makeLLMResponse({
            finishReason: 'tool_use',
            toolCalls: [{ id: `tc-${i}`, name: 'loop', arguments: {} }],
          }),
        )
      }

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.finishReason).toBe('max_iterations')
      expect(result.content).toContain('Maximum tool iterations reached')
      expect(mockCall).toHaveBeenCalledTimes(5) // Not 6+
    })
  })

  // AC5: Credential protection (NFR11)
  describe('AC5: Credential protection', () => {
    const dangerousPatterns = [
      'sk-proj-ABCDEFGHIJ1234567890',
      'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0',
      '-----BEGIN PRIVATE KEY-----',
    ]

    for (const pattern of dangerousPatterns) {
      it(`rejects soul containing: ${pattern.substring(0, 20)}...`, () => {
        const agent = makeAgent({ soul: `System config: ${pattern}` })
        expect(() => buildSystemPrompt(agent)).toThrow()
      })
    }
  })

  // AC6: Cost tracking aggregation
  describe('AC6: Cost tracking', () => {
    it('aggregates tokens across multiple iterations', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'tool', arguments: {} }],
          usage: { inputTokens: 100, outputTokens: 50 },
        }),
      )
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'stop',
          usage: { inputTokens: 200, outputTokens: 100 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.usage.inputTokens).toBe(300)
      expect(result.usage.outputTokens).toBe(150)
      expect(result.cost.estimatedCostMicro).toBeDefined()
      expect(typeof result.cost.estimatedCostMicro).toBe('number')
    })
  })

  // AC7: Stateless execution
  describe('AC7: Stateless execution', () => {
    it('agent config from argument, not cached', async () => {
      mockCall.mockResolvedValue(makeLLMResponse())

      const agent1 = makeAgent({ soul: 'Soul A' })
      await runner.execute(agent1, makeTask(), makeContext())

      const agent2 = makeAgent({ soul: 'Soul B' })
      await runner.execute(agent2, makeTask(), makeContext())

      expect(mockCall.mock.calls[0][0].systemPrompt).toContain('Soul A')
      expect(mockCall.mock.calls[1][0].systemPrompt).toContain('Soul B')
      expect(mockCall.mock.calls[0][0].systemPrompt).not.toContain('Soul B')
    })
  })

  // AC8: Error handling
  describe('AC8: Error handling', () => {
    it('LLM errors propagate with context', async () => {
      const agent = makeAgent()
      const error = Object.assign(new Error('Service unavailable'), {
        provider: 'anthropic' as const,
        code: 'server_error' as const,
        retryable: true,
      })
      mockCall.mockRejectedValueOnce(error)

      try {
        await runner.execute(agent, makeTask(), makeContext())
        expect(true).toBe(false) // Should not reach
      } catch (e: any) {
        expect(e.message).toBe('Service unavailable')
        expect(e.provider).toBe('anthropic')
      }
    })

    it('tool execution errors fed back to LLM as error results', async () => {
      const agent = makeAgent({ allowedTools: ['fail'] })
      const toolExecutor: ToolExecutor = async () => {
        throw new Error('Network timeout')
      }

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'fail', arguments: {} }],
        }),
      )
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'Tool timed out.', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].error).toBe('Network timeout')
      // Verify error message was sent to LLM
      const toolMsg = mockCall.mock.calls[1][0].messages.find((m: any) => m.role === 'tool')
      expect(toolMsg?.content).toContain('Error: Network timeout')
    })
  })

  // AC9: Streaming support
  describe('AC9: Streaming support', () => {
    it('yields chunks via executeStream', async () => {
      const agent = makeAgent()

      async function* gen(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'text', content: 'Streaming ' }
        yield { type: 'text', content: 'works!' }
        yield { type: 'done', usage: { inputTokens: 40, outputTokens: 15 } }
      }
      mockStream.mockReturnValueOnce(gen())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext())) {
        chunks.push(chunk)
      }

      expect(chunks.filter((c) => c.type === 'text')).toHaveLength(2)
      expect(chunks.find((c) => c.type === 'done')).toBeDefined()
    })
  })

  // AC10: Context assembly
  describe('AC10: Context assembly', () => {
    it('system prompt follows format: Soul -> Tools -> Context', async () => {
      const agent = makeAgent({ soul: 'SOUL_SECTION', allowedTools: ['tool1'] })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(
        agent,
        makeTask({ context: 'CONTEXT_SECTION' }),
        makeContext(),
      )

      const prompt = mockCall.mock.calls[0][0].systemPrompt!
      const soulPos = prompt.indexOf('SOUL_SECTION')
      const toolsPos = prompt.indexOf('Available Tools')
      const contextPos = prompt.indexOf('CONTEXT_SECTION')

      expect(soulPos).toBeGreaterThanOrEqual(0)
      expect(toolsPos).toBeGreaterThan(soulPos)
      expect(contextPos).toBeGreaterThan(toolsPos)
    })
  })

  // Additional QA edge cases
  describe('QA Edge Cases', () => {
    it('getToolDefinitions returns empty for no tools', () => {
      expect(getToolDefinitions([])).toEqual([])
    })

    it('getToolDefinitions returns definitions for provided names', () => {
      const defs = getToolDefinitions(['a', 'b', 'c'])
      expect(defs).toHaveLength(3)
      expect(defs.map((d) => d.name)).toEqual(['a', 'b', 'c'])
    })

    it('execute with inactive agent still works (no status check in runner)', async () => {
      const agent = makeAgent({ isActive: false })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      const result = await runner.execute(agent, makeTask(), makeContext())
      expect(result.content).toBe('QA response')
    })

    it('handles LLM returning empty content string', async () => {
      const agent = makeAgent()
      mockCall.mockResolvedValueOnce(makeLLMResponse({ content: '' }))

      const result = await runner.execute(agent, makeTask(), makeContext())
      expect(result.content).toBe('')
    })

    it('passes resolved model to LLM request', async () => {
      const agent = makeAgent({ tier: 'manager' })
      mockResolveModel.mockReturnValue({ model: 'claude-sonnet-4-6', reason: 'tier-default' })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), makeContext())

      expect(mockCall.mock.calls[0][0].model).toBe('claude-sonnet-4-6')
    })
  })
})
