import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test'
import type {
  LLMResponse,
  LLMStreamChunk,
  LLMRequest,
  LLMProviderName,
  TaskRequest,
  ToolExecutor,
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

// Mock knowledge-injector (auto-injection returns null by default in tests)
const mockCollectKnowledge = mock(() => Promise.resolve(null))
const mockCollectMemory = mock(() => Promise.resolve(null))

mock.module('../../services/knowledge-injector', () => ({
  collectKnowledgeContext: mockCollectKnowledge,
  collectAgentMemoryContext: mockCollectMemory,
  clearKnowledgeCache: mock(() => {}),
  clearAllCache: mock(() => {}),
}))

import {
  AgentRunner,
  buildSystemPrompt,
  scanForCredentials,
  getToolDefinitions,
  setToolDefinitionProvider,
} from '../../services/agent-runner'
import type { AgentConfig } from '../../services/agent-runner'

// === Test Helpers ===

function makeAgent(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    id: 'agent-1',
    companyId: 'company-1',
    name: 'TestAgent',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    soul: 'You are a financial analyst. Analyze data carefully.',
    allowedTools: [],
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
    messages: [{ role: 'user' as const, content: 'Analyze Samsung Electronics' }],
    ...overrides,
  }
}

function makeLLMResponse(overrides: Partial<LLMResponse> = {}): LLMResponse {
  return {
    content: 'Analysis complete.',
    toolCalls: [],
    usage: { inputTokens: 100, outputTokens: 50 },
    model: 'claude-haiku-4-5',
    provider: 'anthropic',
    finishReason: 'stop',
    ...overrides,
  }
}

// === Tests ===

describe('AgentRunner', () => {
  let runner: AgentRunner

  beforeEach(() => {
    runner = new AgentRunner()
    mockCall.mockReset()
    mockStream.mockReset()
    mockResolveModel.mockReset()
    mockResolveProvider.mockReset()
    mockCalculateCostMicro.mockReset()

    mockResolveModel.mockReturnValue({ model: 'claude-haiku-4-5', reason: 'tier-default' })
    mockResolveProvider.mockReturnValue('anthropic')
    mockCalculateCostMicro.mockReturnValue(500) // 500 microdollars
  })

  // === buildSystemPrompt tests ===

  describe('buildSystemPrompt', () => {
    it('assembles soul markdown into system prompt', () => {
      const agent = makeAgent({ soul: '# Expert Analyst\nYou analyze financial data.' })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('# Expert Analyst')
      expect(prompt).toContain('You analyze financial data.')
    })

    it('includes tool definitions summary when tools provided', () => {
      const agent = makeAgent()
      const toolDefs = [
        { name: 'web_search', description: 'Search the web', parameters: { type: 'object', properties: {} } },
        { name: 'calculator', description: 'Do math', parameters: { type: 'object', properties: {} } },
      ]
      const prompt = buildSystemPrompt(agent, toolDefs)
      expect(prompt).toContain('## Available Tools')
      expect(prompt).toContain('**web_search**: Search the web')
      expect(prompt).toContain('**calculator**: Do math')
      expect(prompt).toContain('2 tools')
    })

    it('uses default soul when agent soul is null', () => {
      const agent = makeAgent({ soul: null })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('helpful AI assistant')
    })

    it('uses default soul when agent soul is empty string', () => {
      const agent = makeAgent({ soul: '' })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('helpful AI assistant')
    })

    it('uses default soul when agent soul is whitespace only', () => {
      const agent = makeAgent({ soul: '   \n  ' })
      const prompt = buildSystemPrompt(agent)
      expect(prompt).toContain('helpful AI assistant')
    })

    it('throws on credential pattern: sk- API key', () => {
      const agent = makeAgent({ soul: 'Use this key: sk-proj-abc123XYZdef456789012345' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('throws on credential pattern: AIza Google key', () => {
      const agent = makeAgent({ soul: 'Google key: AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('throws on credential pattern: Bearer token', () => {
      const agent = makeAgent({ soul: 'Auth: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc123' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('throws on credential pattern: API_KEY=', () => {
      const agent = makeAgent({ soul: 'Config: API_KEY=supersecretkey123456' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('throws on credential pattern: SECRET=', () => {
      const agent = makeAgent({ soul: 'SECRET=mysecretvalue123456' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('throws on credential pattern: private key', () => {
      const agent = makeAgent({ soul: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----' })
      expect(() => buildSystemPrompt(agent)).toThrow('Credential pattern detected')
    })

    it('does not throw on normal text', () => {
      const agent = makeAgent({ soul: 'You are a skilled analyst. Follow best practices for security analysis.' })
      expect(() => buildSystemPrompt(agent)).not.toThrow()
    })
  })

  // === scanForCredentials tests ===

  describe('scanForCredentials', () => {
    it('throws for sk- patterns', () => {
      expect(() => scanForCredentials('key: sk-1234567890abcdefghij')).toThrow()
    })

    it('does not throw for safe text', () => {
      expect(() => scanForCredentials('This is a normal instruction with no secrets')).not.toThrow()
    })

    it('detects RSA private key header', () => {
      expect(() => scanForCredentials('-----BEGIN RSA PRIVATE KEY-----')).toThrow()
    })
  })

  // === getToolDefinitions tests ===

  describe('getToolDefinitions', () => {
    it('returns empty array for empty allowedTools', () => {
      expect(getToolDefinitions([])).toEqual([])
    })

    it('returns definitions for tool names using default provider', () => {
      const defs = getToolDefinitions(['web_search', 'calculator'])
      expect(defs).toHaveLength(2)
      expect(defs[0].name).toBe('web_search')
      expect(defs[1].name).toBe('calculator')
    })

    it('uses custom tool definition provider when set', () => {
      const customProvider = (tools: string[]) =>
        tools.map((name) => ({
          name,
          description: `Custom: ${name}`,
          parameters: { type: 'object', properties: { query: { type: 'string' } } },
        }))

      setToolDefinitionProvider(customProvider)
      const defs = getToolDefinitions(['custom_tool'])
      expect(defs[0].description).toBe('Custom: custom_tool')
      expect(defs[0].parameters).toHaveProperty('properties')

      // Reset to default
      setToolDefinitionProvider((tools) =>
        tools.map((n) => ({ name: n, description: `Tool: ${n}`, parameters: { type: 'object', properties: {} } })),
      )
    })
  })

  // === execute tests ===

  describe('execute', () => {
    it('returns TaskResponse for simple call with no tools', async () => {
      const agent = makeAgent()
      const task = makeTask()
      const response = makeLLMResponse()

      mockCall.mockResolvedValueOnce(response)

      const result = await runner.execute(agent, task, makeContext())

      expect(result.content).toBe('Analysis complete.')
      expect(result.toolCalls).toEqual([])
      expect(result.usage.inputTokens).toBe(100)
      expect(result.usage.outputTokens).toBe(50)
      expect(result.cost.model).toBe('claude-haiku-4-5')
      expect(result.cost.provider).toBe('anthropic')
      expect(result.cost.estimatedCostMicro).toBe(500)
      expect(result.finishReason).toBe('stop')
    })

    it('resolves model from agent tier', async () => {
      const agent = makeAgent({ tier: 'manager' })
      mockResolveModel.mockReturnValue({ model: 'claude-sonnet-4-6', reason: 'tier-default' })
      mockCall.mockResolvedValueOnce(makeLLMResponse({ model: 'claude-sonnet-4-6' }))

      await runner.execute(agent, makeTask(), makeContext())

      expect(mockResolveModel).toHaveBeenCalledWith({ tier: 'manager', modelName: 'claude-haiku-4-5' })
    })

    it('resolves model from manual override', async () => {
      const agent = makeAgent({ modelName: 'gpt-4.1' })
      mockResolveModel.mockReturnValue({ model: 'gpt-4.1', reason: 'manual-override' })
      mockCall.mockResolvedValueOnce(makeLLMResponse({ model: 'gpt-4.1' }))

      await runner.execute(agent, makeTask(), makeContext())

      expect(mockResolveModel).toHaveBeenCalledWith({ tier: 'specialist', modelName: 'gpt-4.1' })
    })

    it('handles single-round tool call loop', async () => {
      const agent = makeAgent({ allowedTools: ['web_search'] })
      const toolExecutor: ToolExecutor = mock(async (name, args) => ({
        result: 'Search result: Samsung stock is up 5%',
      }))

      // First call: LLM requests tool
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'web_search', arguments: { query: 'Samsung stock' } }],
          usage: { inputTokens: 100, outputTokens: 30 },
        }),
      )

      // Second call: LLM responds with final content
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'Samsung stock increased 5% today.',
          finishReason: 'stop',
          usage: { inputTokens: 200, outputTokens: 80 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.content).toBe('Samsung stock increased 5% today.')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].name).toBe('web_search')
      expect(result.toolCalls[0].result).toBe('Search result: Samsung stock is up 5%')
      expect(result.usage.inputTokens).toBe(300) // 100 + 200
      expect(result.usage.outputTokens).toBe(110) // 30 + 80
      expect(toolExecutor).toHaveBeenCalledWith('web_search', { query: 'Samsung stock' })
    })

    it('handles multi-round tool calls (2 rounds)', async () => {
      const agent = makeAgent({ allowedTools: ['web_search', 'calculator'] })
      const callCount = { n: 0 }
      const toolExecutor: ToolExecutor = async (name) => {
        if (name === 'web_search') return { result: 'Price: 70000' }
        return { result: '140000' }
      }

      // Round 1: web_search
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'web_search', arguments: { query: 'price' } }],
          usage: { inputTokens: 50, outputTokens: 20 },
        }),
      )

      // Round 2: calculator
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-2', name: 'calculator', arguments: { expr: '70000*2' } }],
          usage: { inputTokens: 80, outputTokens: 25 },
        }),
      )

      // Round 3: final response
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'The doubled price is 140000.',
          finishReason: 'stop',
          usage: { inputTokens: 100, outputTokens: 40 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.content).toBe('The doubled price is 140000.')
      expect(result.toolCalls).toHaveLength(2)
      expect(result.toolCalls[0].name).toBe('web_search')
      expect(result.toolCalls[1].name).toBe('calculator')
      expect(result.usage.inputTokens).toBe(230) // 50+80+100
      expect(result.usage.outputTokens).toBe(85) // 20+25+40
    })

    it('enforces max iterations (5) with warning', async () => {
      const agent = makeAgent({ allowedTools: ['repeat_tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      // Create 5 rounds of tool calls (should hit max)
      for (let i = 0; i < 5; i++) {
        mockCall.mockResolvedValueOnce(
          makeLLMResponse({
            content: `iteration ${i + 1}`,
            finishReason: 'tool_use',
            toolCalls: [{ id: `tc-${i}`, name: 'repeat_tool', arguments: {} }],
            usage: { inputTokens: 10, outputTokens: 5 },
          }),
        )
      }

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.finishReason).toBe('max_iterations')
      expect(result.content).toContain('Maximum tool iterations reached')
      expect(result.toolCalls).toHaveLength(5)
      expect(result.iterations).toBe(5)
    })

    it('respects custom maxToolIterations', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'ok' })

      // 2 rounds of tool calls (max is 2)
      for (let i = 0; i < 2; i++) {
        mockCall.mockResolvedValueOnce(
          makeLLMResponse({
            content: `iter ${i}`,
            finishReason: 'tool_use',
            toolCalls: [{ id: `tc-${i}`, name: 'tool', arguments: {} }],
            usage: { inputTokens: 10, outputTokens: 5 },
          }),
        )
      }

      const result = await runner.execute(
        agent,
        makeTask({ maxToolIterations: 2 }),
        makeContext(),
        toolExecutor,
      )

      expect(result.finishReason).toBe('max_iterations')
      expect(result.content).toContain('Maximum tool iterations reached')
    })

    it('catches tool execution errors and feeds them back to LLM', async () => {
      const agent = makeAgent({ allowedTools: ['failing_tool'] })
      const toolExecutor: ToolExecutor = async () => {
        throw new Error('Connection refused')
      }

      // LLM requests failing tool
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'failing_tool', arguments: {} }],
          usage: { inputTokens: 50, outputTokens: 20 },
        }),
      )

      // LLM responds after receiving error
      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'The tool failed. I cannot proceed with that operation.',
          finishReason: 'stop',
          usage: { inputTokens: 100, outputTokens: 40 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.content).toBe('The tool failed. I cannot proceed with that operation.')
      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls[0].error).toBe('Connection refused')

      // Verify error was fed back to LLM in messages
      const secondCallArgs = mockCall.mock.calls[1]
      const messages = secondCallArgs[0].messages
      const toolResultMsg = messages.find((m: any) => m.role === 'tool')
      expect(toolResultMsg?.content).toContain('Error: Connection refused')
    })

    it('handles tool executor returning error object', async () => {
      const agent = makeAgent({ allowedTools: ['bad_tool'] })
      const toolExecutor: ToolExecutor = async () => ({ error: 'Permission denied' })

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: '',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'bad_tool', arguments: {} }],
          usage: { inputTokens: 50, outputTokens: 20 },
        }),
      )

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'Permission was denied.',
          finishReason: 'stop',
          usage: { inputTokens: 80, outputTokens: 30 },
        }),
      )

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.toolCalls[0].error).toBe('Permission denied')
      expect(result.toolCalls[0].result).toBeUndefined()
    })

    it('propagates LLM errors', async () => {
      const agent = makeAgent()
      const llmError = Object.assign(new Error('Rate limit exceeded'), {
        provider: 'anthropic' as const,
        code: 'rate_limit' as const,
        retryable: true,
      })

      mockCall.mockRejectedValueOnce(llmError)

      await expect(runner.execute(agent, makeTask(), makeContext())).rejects.toThrow('Rate limit exceeded')
    })

    it('aggregates tokens and cost across iterations', async () => {
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
          content: 'Done',
          finishReason: 'stop',
          usage: { inputTokens: 200, outputTokens: 100 },
        }),
      )

      mockCalculateCostMicro.mockReturnValue(4500)

      const result = await runner.execute(agent, makeTask(), makeContext(), toolExecutor)

      expect(result.usage.inputTokens).toBe(300)
      expect(result.usage.outputTokens).toBe(150)
      expect(mockCalculateCostMicro).toHaveBeenCalledWith('claude-haiku-4-5', 300, 150)
    })

    it('passes system prompt to LLM router', async () => {
      const agent = makeAgent({ soul: '# Analyst\nBe precise.' })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), makeContext())

      const callArgs = mockCall.mock.calls[0][0]
      expect(callArgs.systemPrompt).toContain('# Analyst')
      expect(callArgs.systemPrompt).toContain('Be precise.')
    })

    it('includes additional context in system prompt', async () => {
      const agent = makeAgent()
      const task = makeTask({ context: 'Focus on Korean market data.' })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, task, makeContext())

      const callArgs = mockCall.mock.calls[0][0]
      expect(callArgs.systemPrompt).toContain('Additional Context')
      expect(callArgs.systemPrompt).toContain('Focus on Korean market data.')
    })

    it('throws if additional context contains credentials', async () => {
      const agent = makeAgent()
      const task = makeTask({ context: 'Use key: sk-abcdefghijklmnopqrstuvwxyz' })

      await expect(runner.execute(agent, task, makeContext())).rejects.toThrow('Credential pattern detected')
    })

    it('does not include tools in LLMRequest when allowedTools is empty', async () => {
      const agent = makeAgent({ allowedTools: [] })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), makeContext())

      const callArgs = mockCall.mock.calls[0][0]
      expect(callArgs.tools).toBeUndefined()
    })

    it('includes tool definitions in LLMRequest when allowedTools present', async () => {
      const agent = makeAgent({ allowedTools: ['web_search'] })
      mockCall.mockResolvedValueOnce(makeLLMResponse())

      await runner.execute(agent, makeTask(), makeContext())

      const callArgs = mockCall.mock.calls[0][0]
      expect(callArgs.tools).toBeDefined()
      expect(callArgs.tools).toHaveLength(1)
      expect(callArgs.tools![0].name).toBe('web_search')
    })

    it('returns without tool execution if no toolExecutor provided', async () => {
      const agent = makeAgent({ allowedTools: ['tool'] })

      mockCall.mockResolvedValueOnce(
        makeLLMResponse({
          content: 'I want to use a tool',
          finishReason: 'tool_use',
          toolCalls: [{ id: 'tc-1', name: 'tool', arguments: {} }],
        }),
      )

      // No toolExecutor -- should return immediately
      const result = await runner.execute(agent, makeTask(), makeContext())

      expect(result.content).toBe('I want to use a tool')
      expect(result.toolCalls).toEqual([])
      expect(mockCall).toHaveBeenCalledTimes(1)
    })
  })

  // === Statelessness tests ===

  describe('statelessness', () => {
    it('does not persist state between execute calls', async () => {
      const agent1 = makeAgent({ name: 'Agent1', soul: 'First agent soul' })
      const agent2 = makeAgent({ name: 'Agent2', soul: 'Second agent soul' })

      mockCall.mockResolvedValue(makeLLMResponse())

      await runner.execute(agent1, makeTask(), makeContext())
      await runner.execute(agent2, makeTask(), makeContext())

      // Verify each call used correct agent's prompt
      const firstCallPrompt = mockCall.mock.calls[0][0].systemPrompt
      const secondCallPrompt = mockCall.mock.calls[1][0].systemPrompt

      expect(firstCallPrompt).toContain('First agent soul')
      expect(secondCallPrompt).toContain('Second agent soul')
      expect(firstCallPrompt).not.toContain('Second agent soul')
      expect(secondCallPrompt).not.toContain('First agent soul')
    })
  })

  // === executeStream tests ===

  describe('executeStream', () => {
    it('yields text chunks in real-time', async () => {
      const agent = makeAgent()

      async function* mockStreamGen(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'text', content: 'Hello ' }
        yield { type: 'text', content: 'world!' }
        yield { type: 'done', usage: { inputTokens: 50, outputTokens: 20 } }
      }

      mockStream.mockReturnValueOnce(mockStreamGen())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext())) {
        chunks.push(chunk)
      }

      expect(chunks).toHaveLength(3)
      expect(chunks[0]).toEqual({ type: 'text', content: 'Hello ' })
      expect(chunks[1]).toEqual({ type: 'text', content: 'world!' })
      expect(chunks[2].type).toBe('done')
      expect(chunks[2].usage?.inputTokens).toBe(50)
    })

    it('handles tool calls during streaming', async () => {
      const agent = makeAgent({ allowedTools: ['search'] })
      const toolExecutor: ToolExecutor = async () => ({ result: 'Found data' })

      // First stream: includes tool call
      async function* firstStream(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'tool_call_start', toolCall: { id: 'tc-1', name: 'search', arguments: { q: 'test' } } }
        yield { type: 'done', usage: { inputTokens: 30, outputTokens: 10 } }
      }

      // Second stream: final response after tool execution
      async function* secondStream(): AsyncGenerator<LLMStreamChunk> {
        yield { type: 'text', content: 'Based on search results...' }
        yield { type: 'done', usage: { inputTokens: 60, outputTokens: 30 } }
      }

      mockStream.mockReturnValueOnce(firstStream())
      mockStream.mockReturnValueOnce(secondStream())

      const chunks: LLMStreamChunk[] = []
      for await (const chunk of runner.executeStream(agent, makeTask(), makeContext(), toolExecutor)) {
        chunks.push(chunk)
      }

      // Should have text chunks from second stream + done
      const textChunks = chunks.filter((c) => c.type === 'text')
      const doneChunks = chunks.filter((c) => c.type === 'done')

      expect(textChunks.length).toBeGreaterThanOrEqual(1)
      expect(textChunks.some((c) => c.content?.includes('Based on search results'))).toBe(true)
      expect(doneChunks).toHaveLength(1)
      expect(doneChunks[0].usage?.inputTokens).toBe(90) // 30 + 60
    })
  })
})
