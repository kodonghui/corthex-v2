/**
 * TEA (Test Architect) Risk-Based Test Expansion -- Story 3-4: AgentRunner
 *
 * Coverage gaps identified by TEA analysis:
 * - P0: Tool call duration tracking, multiple tools in single response
 * - P1: Edge cases in prompt building, tool iteration edge cases
 * - P2: Boundary conditions, concurrent execution
 */
import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test'
import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequest,
  LLMProviderName,
  TaskRequest,
  ToolExecutor,
  LLMToolDefinition,
} from '@corthex/shared'

// Mock llm-router
const mockCall = mock<(request: LLMRequest, context: unknown) => Promise<LLMResponse>>()
const mockStream = mock<(request: LLMRequest, context: unknown) => AsyncGenerator<LLMStreamChunk>>()
const mockResolveModel = mock<(agent: { tier: string; modelName: string }) => { model: string; reason: string }>()
const mockResolveProvider = mock<(modelId: string) => LLMProviderName>()

mock.module('../../services/llm-router', () => ({
  llmRouter: {
    call: mockCall,
    stream: mockStream,
  },
  resolveModel: mockResolveModel,
  resolveProvider: mockResolveProvider,
  LLMRouter: class {},
}))

mock.module('../../lib/cost-tracker', () => ({
  calculateCostMicro: mock(() => 1000),
  recordCost: mock(() => Promise.resolve()),
}))

import {
  AgentRunner,
  buildSystemPrompt,
  scanForCredentials,
  getToolDefinitions,
  setToolDefinitionProvider,
} from '../../services/agent-runner'
import type { AgentConfig } from '../../services/agent-runner'

// === Helpers ===

function makeAgent(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    id: 'agent-tea',
    companyId: 'company-tea',
    name: 'TEAAgent',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    soul: 'You are a test agent.',
    allowedTools: [],
    isActive: true,
    ...overrides,
  }
}

function makeContext() {
  return {
    companyId: 'company-tea',
    agentId: 'agent-tea',
    agentName: 'TEAAgent',
    source: 'delegation' as const,
  }
}

function makeTask(overrides: Partial<TaskRequest> = {}): TaskRequest {
  return {
    messages: [{ role: 'user' as const, content: 'Test message' }],
    ...overrides,
  }
}

function makeLLMResponse(overrides: Partial<LLMResponse> = {}): LLMResponse {
  return {
    content: 'Response',
    toolCalls: [],
    usage: { inputTokens: 50, outputTokens: 25 },
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    finishReason: 'stop',
    ...overrides,
  }
}

// === TEA Risk-Based Tests ===

describe('TEA: AgentRunner Risk-Based Coverage', () => {
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

  // === P0: Multiple tool calls in single LLM response ===

  describe('P0: Multiple tool calls in single response', () => {
    it('executes all tool calls from a single LLM response', async () => {
      const agent = makeAgent({ allowedTools: ['search', 'calculate'] })
      const executedTools: string[] = []
      const toolExecutor: ToolExecutor = async (name) => {
        executedTools.push(name)
        return { result: `${name} result` }
      }

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [
            { id: 'tc-1', name: 'search', arguments: { q: 'data' } },
            { id: 'tc-2', name: 'calculate', arguments: { expr: '1+1' } },
            { id: 'tc-3', name: 'search', arguments: { q: 'more data' } },
          ],
          usage: { inputTokens: 100, outputTokens: 50 },
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'All tools executed successfully.',
          finishReason: 'stop',
          usage: { inputTokens: 200, outputTokens: 80 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(executedTools).toEqual(['search', 'calculate', 'search'])
      expect(result.toolCalls).toHaveLength(3)
      expect(result.toolCalls[0].result).toBe('search result')
      expect(result.toolCalls[1].result).toBe('calculate result')
      expect(result.toolCalls[2].result).toBe('search result')
    })

    it('handles mixed success/failure in multiple tool calls', async () => {
      const agent = makeAgent({ allowedTools: ['good', 'bad'] })
      const toolExecutor: ToolExecutor = async (name) => {
        if (name === 'bad') throw new Error('Tool crashed')
        return { result: 'ok' }
      }

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [
            { id: 'tc-1', name: 'good', arguments: {} },
            { id: 'tc-2', name: 'bad', arguments: {} },
          ],
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'One tool failed.', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].result).toBe('ok')
      expect(result.toolCalls[0].error).toBeUndefined()
      expect(result.toolCalls[1].error).toBe('Tool crashed')
      expect(result.toolCalls[1].result).toBeUndefined()
    })
  })

  // === P0: Tool call duration tracking ===

  describe('P0: Tool call duration tracking', () => {
    it('records duration for each tool call', async () => {
      const agent = makeAgent({ allowedTools: ['slow_tool'] })
      const toolExecutor: ToolExecutor = async () => {
        // Simulate some work
        await new Promise((r) => setTimeout(r, 10))
        return { result: 'done' }
      }

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'slow_tool', arguments: {} }],
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'Done', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].durationMs).toBeGreaterThanOrEqual(0)
      expect(typeof result.toolCalls[0].durationMs).toBe('number')
    })

    it('records duration even when tool throws', async () => {
      const agent = makeAgent({ allowedTools: ['crash'] })
      const toolExecutor: ToolExecutor = async () => {
        await new Promise((r) => setTimeout(r, 5))
        throw new Error('Boom')
      }

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'crash', arguments: {} }],
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'Recovered', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].durationMs).toBeGreaterThanOrEqual(0)
      expect(result.toolCalls[0].error).toBe('Boom')
    })
  })

  // === P1: Edge cases in prompt building ===

  describe('P1: Prompt building edge cases', () => {
    it('handles very long soul markdown without truncation', () => {
      const longSoul = 'A'.repeat(50_000)
      const agent = makeAgent({ soul: longSoul })
      const prompt = buildSystemPrompt(agent)
      expect(prompt.length).toBeGreaterThanOrEqual(50_000)
      expect(prompt).toContain(longSoul)
    })

    it('handles soul with special characters and unicode', () => {
      const agent = makeAgent({
        soul: '🤖 에이전트입니다. <script>alert(1)</script> & "quotes" \'apostrophes\'',
      })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('에이전트입니다')
      expect(prompt).toContain('<script>')
    })

    it('does not add tools section when toolDefs is empty array', () => {
      const agent = makeAgent()
      const prompt = buildSystemPrompt(agent, [])
      expect(prompt).not.toContain('Available Tools')
    })

    it('handles tools with complex parameter schemas', () => {
      const agent = makeAgent()
      const toolDefs: LLMToolDefinition[] = [
        {
          name: 'complex_tool',
          description: 'A tool with nested params',
          parameters: {
            type: 'object',
            properties: {
              nested: { type: 'object', properties: { deep: { type: 'string' } } },
              array: { type: 'array', items: { type: 'number' } },
            },
            required: ['nested'],
          },
        },
      ]
      const prompt = buildSystemPrompt(agent, toolDefs)
      expect(prompt).toContain('complex_tool')
      expect(prompt).toContain('A tool with nested params')
    })
  })

  // === P1: Credential scrubbing edge cases ===

  describe('P1: Credential scrubbing edge cases', () => {
    it('does not false-positive on short sk- strings', () => {
      // sk- followed by less than 20 chars should not trigger
      expect(() => scanForCredentials('Use sk-short key')).not.toThrow()
    })

    it('catches credential in deeply nested context', () => {
      const text = `
        Normal text here.
        More normal text.
        Hidden: sk-proj-abcdefghijklmnopqrstuvwxyz123456
        End of text.
      `
      expect(() => scanForCredentials(text)).toThrow('Credential pattern detected')
    })

    it('catches multiple credential types in same text', () => {
      const text = 'Key1: sk-abcdefghijklmnopqrstuvwxyz and AIzaSyBabcdefghijklmnopqrstuvwxyz0123456789'
      expect(() => scanForCredentials(text)).toThrow()
    })
  })

  // === P1: Tool iteration edge cases ===

  describe('P1: Tool iteration edge cases', () => {
    it('handles LLM returning tool_use but empty toolCalls array', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      // finishReason is tool_use but no actual tool calls
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'I tried but no tools needed.',
          finishReason: 'tool_use',
          toolCalls: [],
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      // Should return immediately since no actual tool calls
      expect(result.content).toBe('I tried but no tools needed.')
      expect(result.toolCalls).toEqual([])
      expect(mockCall).toHaveBeenCalledTimes(1)
    })

    it('handles max_tokens finish reason (no tool call loop)', async () => {
      const agent = makeAgent()

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'Truncated respon...',
          finishReason: 'max_tokens',
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext())

      expect(result.finishReason).toBe('max_tokens')
      expect(result.content).toBe('Truncated respon...')
    })

    it('handles tool executor returning error object (not throw)', async () => {
      const agent = makeAgent({ allowedTools: ['api_call'] })
      const toolExecutor: ToolExecutor = async () => ({ error: 'API returned 503' })

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'api_call', arguments: {} }],
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({ content: 'API is down.', finishReason: 'stop' }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].error).toBe('API returned 503')

      // Check error was fed back to LLM
      const secondCallMsgs = mockCall.mock.calls[1][0].messages
      const toolMsg = secondCallMsgs.find((m: any) => m.role === 'tool')
      expect(toolMsg?.content).toContain('Error: API returned 503')
    })
  })

  // === P1: Context injection ===

  describe('P1: Context injection', () => {
    it('appends context to system prompt with separator', async () => {
      const agent = makeAgent({ soul: 'Base soul.' })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(
        agent,
        makeTask({ context: 'Department: Finance\nFocus: Q4 data' }),
        makeContext(),
      )

      const prompt = mockCall.mock.calls[0][0].systemPrompt
      expect(prompt).toContain('Base soul.')
      expect(prompt).toContain('Additional Context')
      expect(prompt).toContain('Department: Finance')
      expect(prompt).toContain('Focus: Q4 data')
    })

    it('context comes after soul and tools sections', async () => {
      const agent = makeAgent({ soul: 'Base soul.', allowedTools: ['tool1'] })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(
        agent,
        makeTask({ context: 'Extra context here' }),
        makeContext(),
      )

      const prompt = mockCall.mock.calls[0][0].systemPrompt!
      const soulIdx = prompt.indexOf('Base soul.')
      const toolIdx = prompt.indexOf('Available Tools')
      const contextIdx = prompt.indexOf('Additional Context')

      expect(soulIdx).toBeLessThan(toolIdx)
      expect(toolIdx).toBeLessThan(contextIdx)
    })
  })

  // === P2: Boundary conditions ===

  describe('P2: Boundary conditions', () => {
    it('handles empty messages array', async () => {
      const agent = makeAgent()
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      const result = await runner.execute(agent, makeTask({ messages: [] }), makeContext())

      expect(result.content).toBe('Response')
      const callArgs = mockCall.mock.calls[0][0]
      expect(callArgs.messages).toEqual([])
    })

    it('handles agent with nameEn set', async () => {
      const agent = makeAgent({ nameEn: 'Test Agent EN' })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      const result = await runner.execute(agent, makeTask(), makeContext())
      expect(result.content).toBe('Response')
    })

    it('maxToolIterations of 1 means only one tool round', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'Need tool',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'tool', arguments: {} }],
        }),
      )

      const result = await runner.execute(
        agent,
        makeTask({ maxToolIterations: 1 }),
        makeContext(),
        toolExecutor,
      )

      expect(result.finishReason).toBe('max_iterations')
      expect(result.content).toContain('Maximum tool iterations reached')
      expect(mockCall).toHaveBeenCalledTimes(1)
    })

    it('correctly counts iterations in response', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      // 2 iterations
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'tool', arguments: {} }],
          usage: { inputTokens: 10, outputTokens: 5 },
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'Done after tool',
          finishReason: 'stop',
          usage: { inputTokens: 20, outputTokens: 10 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.finishReason).toBe('stop')
      // iterations reflects tool rounds
      expect(result.iterations).toBeGreaterThanOrEqual(1)
    })
  })

  // === P2: Streaming edge cases ===

  describe('P2: Streaming edge cases', () => {
    it('handles stream with only done chunk (empty response)', async () => {
      const agent = makeAgent()

      async function* emptyStream(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'done', usage: { inputTokens: 10, outputTokens: 0 } }
      }

      mockStream.mockReturnValueOnce(emptyStream())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext())) {
        chunks.push(chunk)
      }

      const doneChunks = chunks.filter((c) => c.type === 'done')
      expect(doneChunks).toHaveLength(1)
    })

    it('handles stream with many small text chunks', async () => {
      const agent = makeAgent()

      async function* manyChunks(): AsyncGenerator<LLMStreamChunk> {
        for (let i = 0; i < 100; i++) {
          yield { type: 'text', content: `chunk${i} ` }
        }
        yield { type: 'done', usage: { inputTokens: 500, outputTokens: 200 } }
      }

      mockStream.mockReturnValueOnce(manyChunks())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext())) {
        chunks.push(chunk)
      }

      const textChunks = chunks.filter((c) => c.type === 'text')
      expect(textChunks).toHaveLength(100)
      expect(textChunks[0].content).toBe('chunk0 ')
      expect(textChunks[99].content).toBe('chunk99 ')
    })

    it('stream without tool executor skips tool execution', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })

      async function* toolStream(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'tool_call_start', toolCall: { id: 'tc-1', name: 'tool', arguments: {} } }
        yield { type: 'done', usage: { inputTokens: 30, outputTokens: 10 } }
      }

      mockStream.mockReturnValueOnce(toolStream())

      const chunks: LLMStreamChunk[] = []
      // No toolExecutor provided
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext())) {
        chunks.push(chunk)
      }

      // Should end with done chunk without executing tools
      const doneChunks = chunks.filter((c) => c.type === 'done')
      expect(doneChunks).toHaveLength(1)
    })
  })

  // === P2: Concurrent execution safety ===

  describe('P2: Concurrent execution safety', () => {
    it('handles parallel execute calls independently', async () => {
      const agent1 = makeAgent({ name: 'Parallel1', soul: 'Soul1' })
      const agent2 = makeAgent({ name: 'Parallel2', soul: 'Soul2' })

      mockCall.mockImplementation(async (req: LLMRequest) => {
        // Simulate async delay
        await new Promise((r) => setTimeout(r, 5))
        return makeLLMResponse({
          content: req.systemPrompt?.includes('Soul1') ? 'Response1' : 'Response2',
        })
      })

      const [result1, result2] = await Promise.all([
        runner.execute(agent1, makeTask(), makeContext()),
        runner.execute(agent2, makeTask(), makeContext()),
      ])

      expect(result1.content).toBe('Response1')
      expect(result2.content).toBe('Response2')
    })
  })

  // === P1: Tool definitions provider injection ===

  describe('P1: Tool definition provider', () => {
    afterEach(() => {
      // Reset to default
      setToolDefinitionProvider((tools) =>
        tools.map((n) => ({
          name: n,
          description: `Tool: ${n}`,
          parameters: { type: 'object', properties: {} },
        })),
      )
    })

    it('custom provider is used for tool definitions in LLM request', async () => {
      setToolDefinitionProvider((tools) =>
        tools.map((n) => ({
          name: n,
          description: `Custom ${n} description`,
          parameters: {
            type: 'object',
            properties: { input: { type: 'string', description: 'The input' } },
          },
        })),
      )

      const agent = makeAgent({ allowedTools: ['my_tool'] })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), makeContext())

      const toolsInRequest = mockCall.mock.calls[0][0].tools
      expect(toolsInRequest).toHaveLength(1)
      expect(toolsInRequest![0].description).toBe('Custom my_tool description')
      expect(toolsInRequest![0].parameters).toHaveProperty('properties')
    })
  })

  // === P1: LLMRouterContext pass-through ===

  describe('P1: LLMRouterContext pass-through', () => {
    it('passes correct context to llmRouter.call', async () => {
      const agent = makeAgent()
      const context = {
        companyId: 'comp-123',
        agentId: 'agent-456',
        agentName: 'SpecialAgent',
        sessionId: 'session-789',
        source: 'chat' as const,
      }

      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), context)

      const passedContext = mockCall.mock.calls[0][1]
      expect(passedContext).toEqual(context)
    })
  })
})
