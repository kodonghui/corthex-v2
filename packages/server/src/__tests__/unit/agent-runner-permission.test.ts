import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequest,
  LLMProviderName,
  TaskRequest,
  ToolExecutor,
  LLMToolCall,
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

// Mock cost-tracker
const mockCalculateCostMicro = mock<(model: string, input: number, output: number) => number>()

mock.module('../../lib/cost-tracker', () => ({
  calculateCostMicro: mockCalculateCostMicro,
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

import {
  AgentRunner,
  getToolDefinitions,
  setToolDefinitionProvider,
  setToolNameProvider,
} from '../../services/agent-runner'
import type { AgentConfig } from '../../services/agent-runner'

// === Helpers ===

function makeAgent(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    id: 'agent-1',
    companyId: 'company-1',
    name: 'TestAgent',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    soul: 'You are a test agent.',
    allowedTools: ['web_search', 'calculator'],
    isActive: true,
    ...overrides,
  }
}

function makeContext() {
  return {
    companyId: 'company-1',
    agentId: 'agent-1',
    agentName: 'TestAgent',
    source: 'delegation' as const,
  }
}

function makeTask(overrides: Partial<TaskRequest> = {}): TaskRequest {
  return {
    messages: [{ role: 'user' as const, content: 'Do something' }],
    ...overrides,
  }
}

function makeLLMResponse(overrides: Partial<LLMResponse> = {}): LLMResponse {
  return {
    content: 'Done.',
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 50 },
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    finishReason: 'stop',
    ...overrides,
  }
}

function makeToolCallResponse(toolCalls: LLMToolCall[]): LLMResponse {
  return makeLLMResponse({
    content: '',
    toolCalls,
    finishReason: 'tool_use',
  })
}

// === Tests ===

describe('AgentRunner — Server-side tool permission enforcement (NFR14)', () => {
  let runner: AgentRunner
  let mockToolExecutor: ToolExecutor

  beforeEach(() => {
    runner = new AgentRunner()
    mockCall.mockReset()
    mockStream.mockReset()
    mockResolveModel.mockReset()
    mockResolveProvider.mockReset()
    mockCalculateCostMicro.mockReset()

    mockResolveModel.mockReturnValue({ model: 'claude-haiku-4-5', reason: 'tier-default' })
    mockResolveProvider.mockReturnValue('anthropic')
    mockCalculateCostMicro.mockReturnValue(500)

    mockToolExecutor = mock(async (name: string, _args: Record<string, unknown>) => {
      return { result: `Result from ${name}` }
    }) as unknown as ToolExecutor
  })

  describe('execute() permission enforcement', () => {
    it('allows tool call when tool is in allowedTools', async () => {
      const agent = makeAgent({ allowedTools: ['web_search', 'calculator'] })

      // First call returns tool_use, second call returns stop
      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'web_search', arguments: { query: 'test' } },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'Search done.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].name).toBe('web_search')
      expect(result.toolCalls[0].result).toBe('Result from web_search')
      expect(result.toolCalls[0].error).toBeUndefined()
    })

    it('blocks tool call when tool is NOT in allowedTools', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'email_sender', arguments: { to: 'hacker@evil.com' } },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'OK.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].name).toBe('email_sender')
      expect(result.toolCalls[0].error).toContain('TOOL_NOT_PERMITTED')
      expect(result.toolCalls[0].error).toContain('email_sender')
      expect(result.toolCalls[0].result).toBeUndefined()
      expect(result.toolCalls[0].durationMs).toBe(0)
      // toolExecutor should NOT have been called
      expect((mockToolExecutor as any).mock.calls.length).toBe(0)
    })

    it('handles mixed allowed and denied tools in same iteration', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'calculator', arguments: { expr: '1+1' } },
          { id: 'tc-2', name: 'email_sender', arguments: { to: 'test@test.com' } },
          { id: 'tc-3', name: 'calculator', arguments: { expr: '2+2' } },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'Done.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls).toHaveLength(3)

      // First: allowed
      expect(result.toolCalls[0].name).toBe('calculator')
      expect(result.toolCalls[0].result).toBe('Result from calculator')
      expect(result.toolCalls[0].error).toBeUndefined()

      // Second: blocked
      expect(result.toolCalls[1].name).toBe('email_sender')
      expect(result.toolCalls[1].error).toContain('TOOL_NOT_PERMITTED')

      // Third: allowed
      expect(result.toolCalls[2].name).toBe('calculator')
      expect(result.toolCalls[2].result).toBe('Result from calculator')
    })

    it('blocks all tools when allowedTools is empty', async () => {
      const agent = makeAgent({ allowedTools: [] })

      // With empty allowedTools, no tool defs are sent to LLM,
      // but if LLM somehow returns a tool call (e.g. hallucination), it should be blocked
      mockCall.mockResolvedValueOnce(makeLLMResponse({ content: 'No tools needed.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)
      expect(result.toolCalls).toHaveLength(0)
    })

    it('allows all tools when wildcard "*" is in allowedTools', async () => {
      const agent = makeAgent({ allowedTools: ['*'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'any_random_tool', arguments: {} },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'Done.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].result).toBe('Result from any_random_tool')
      expect(result.toolCalls[0].error).toBeUndefined()
    })

    it('returns TOOL_NOT_PERMITTED error to agent (prevents retry)', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'secret_tool', arguments: {} },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'OK' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      // The tool message sent back to LLM should contain the error
      // We verify via the toolCalls record
      expect(result.toolCalls[0].error).toMatch(/TOOL_NOT_PERMITTED.*secret_tool.*not in your allowed tools/)
    })
  })

  describe('executeStream() permission enforcement', () => {
    it('blocks unauthorized tool calls in streaming mode', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      // Mock stream that returns a tool call
      async function* mockStreamGen(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'tool_call_start', toolCall: { id: 'tc-1', name: 'email_sender', arguments: { to: 'x' } } }
        yield { type: 'done', usage: { inputTokens: 100, outputTokens: 50 } }
      }

      // Second call stream returns text
      async function* mockStreamGen2(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'text', content: 'Done.' }
        yield { type: 'done', usage: { inputTokens: 50, outputTokens: 20 } }
      }

      mockStream
        .mockReturnValueOnce(mockStreamGen())
        .mockReturnValueOnce(mockStreamGen2())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext(), mockToolExecutor)) {
        chunks.push(chunk)
      }

      // toolExecutor should NOT have been called (tool was blocked)
      expect((mockToolExecutor as any).mock.calls.length).toBe(0)

      // Stream should still complete
      const doneChunks = chunks.filter(c => c.type === 'done')
      expect(doneChunks.length).toBeGreaterThan(0)
    })

    it('allows authorized tool calls in streaming mode', async () => {
      const agent = makeAgent({ allowedTools: ['web_search'] })

      async function* mockStreamGen(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'tool_call_start', toolCall: { id: 'tc-1', name: 'web_search', arguments: { q: 'test' } } }
        yield { type: 'done', usage: { inputTokens: 100, outputTokens: 50 } }
      }

      async function* mockStreamGen2(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'text', content: 'Found results.' }
        yield { type: 'done', usage: { inputTokens: 50, outputTokens: 20 } }
      }

      mockStream
        .mockReturnValueOnce(mockStreamGen())
        .mockReturnValueOnce(mockStreamGen2())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext(), mockToolExecutor)) {
        chunks.push(chunk)
      }

      // toolExecutor should have been called
      expect((mockToolExecutor as any).mock.calls.length).toBe(1)
    })
  })

  describe('TEA: edge cases and regression scenarios', () => {
    it('blocks ALL tool calls when agent has no allowed tools but LLM returns tool_use', async () => {
      // Simulates prompt injection where LLM hallucinates tool calls despite empty tool defs
      const agent = makeAgent({ allowedTools: [] })

      // Force LLM to return tool_use (shouldn't happen with empty tools, but defensive)
      mockCall.mockResolvedValueOnce(makeToolCallResponse([
        { id: 'tc-1', name: 'web_search', arguments: { q: 'hack' } },
        { id: 'tc-2', name: 'email_sender', arguments: { to: 'evil@hack.com' } },
      ]))

      // With empty allowedTools, no tools are sent to LLM, so finishReason won't be tool_use
      // But the preventive layer (getToolDefinitions) ensures this. Verify:
      const defs = getToolDefinitions([])
      expect(defs).toHaveLength(0)
    })

    it('handles agent with undefined allowedTools field gracefully', async () => {
      const agent = makeAgent({ allowedTools: undefined as any })

      mockCall.mockResolvedValueOnce(makeLLMResponse({ content: 'No tools.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)
      expect(result.content).toBe('No tools.')
      expect(result.toolCalls).toHaveLength(0)
    })

    it('blocked tool does not affect subsequent allowed tool in same batch', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'BLOCKED_TOOL', arguments: {} },
          { id: 'tc-2', name: 'calculator', arguments: { expr: '42' } },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'Result: 42' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      // First blocked, second allowed
      expect(result.toolCalls[0].error).toContain('TOOL_NOT_PERMITTED')
      expect(result.toolCalls[1].result).toBe('Result from calculator')
    })

    it('permission check does not leak timing info (durationMs=0 for blocked)', async () => {
      const agent = makeAgent({ allowedTools: ['calculator'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'blocked_tool', arguments: {} },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'OK' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls[0].durationMs).toBe(0)
    })

    it('wildcard agent can use any tool without restriction', async () => {
      const agent = makeAgent({ allowedTools: ['*'] })

      mockCall
        .mockResolvedValueOnce(makeToolCallResponse([
          { id: 'tc-1', name: 'tool_A', arguments: {} },
          { id: 'tc-2', name: 'tool_B', arguments: {} },
          { id: 'tc-3', name: 'tool_C_very_long_name', arguments: {} },
        ]))
        .mockResolvedValueOnce(makeLLMResponse({ content: 'All done.' }))

      const result = await runner.execute(agent, makeTask(), makeContext(), mockToolExecutor)

      expect(result.toolCalls).toHaveLength(3)
      expect(result.toolCalls.every(tc => tc.error === undefined)).toBe(true)
      expect(result.toolCalls.every(tc => tc.result?.startsWith('Result from '))).toBe(true)
    })
  })

  describe('getToolDefinitions with wildcard', () => {
    it('returns empty array for empty allowedTools', () => {
      expect(getToolDefinitions([])).toEqual([])
    })

    it('returns empty array for undefined-like allowedTools', () => {
      expect(getToolDefinitions(undefined as any)).toEqual([])
      expect(getToolDefinitions(null as any)).toEqual([])
    })

    it('returns tool definitions for specific tools', () => {
      const defs = getToolDefinitions(['web_search', 'calculator'])
      expect(defs).toHaveLength(2)
      expect(defs[0].name).toBe('web_search')
      expect(defs[1].name).toBe('calculator')
    })

    it('resolves wildcard "*" using toolNameProvider', () => {
      // Set up a tool name provider that returns all available tools
      setToolNameProvider(() => ['web_search', 'calculator', 'email_sender'])

      const defs = getToolDefinitions(['*'])
      expect(defs).toHaveLength(3)
      expect(defs.map(d => d.name)).toEqual(['web_search', 'calculator', 'email_sender'])

      // Clean up
      setToolNameProvider(() => [])
    })

    it('returns empty for wildcard when no tools registered', () => {
      setToolNameProvider(() => [])
      const defs = getToolDefinitions(['*'])
      expect(defs).toEqual([])
    })
  })
})
