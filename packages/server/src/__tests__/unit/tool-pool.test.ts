import { describe, it, expect, beforeEach } from 'bun:test'
import { z } from 'zod'
import { ToolPool, truncateResult } from '../../services/tool-pool'
import type { ToolRegistration } from '../../services/tool-pool'
import type { ToolContext, ToolCategory } from '@corthex/shared'

// === Helpers ===

const testContext: ToolContext = {
  companyId: 'company-1',
  agentId: 'agent-1',
  agentName: 'TestAgent',
}

function createTestTool(overrides: Partial<ToolRegistration> = {}): ToolRegistration {
  return {
    name: overrides.name ?? 'test_tool',
    description: overrides.description ?? 'A test tool',
    category: overrides.category ?? 'common',
    parameters: overrides.parameters ?? z.object({ query: z.string() }),
    execute: overrides.execute ?? (async (params) => ({ success: true, result: `Result for: ${(params as { query: string }).query}` })),
  }
}

// === Tests ===

describe('ToolPool', () => {
  let pool: ToolPool

  beforeEach(() => {
    pool = new ToolPool()
  })

  describe('register', () => {
    it('registers a tool and can retrieve it', () => {
      const tool = createTestTool()
      pool.register(tool)
      expect(pool.has('test_tool')).toBe(true)
      expect(pool.get('test_tool')).toEqual(tool)
    })

    it('throws on duplicate registration', () => {
      pool.register(createTestTool())
      expect(() => pool.register(createTestTool())).toThrow('Tool "test_tool" is already registered')
    })

    it('registers multiple tools with different names', () => {
      pool.register(createTestTool({ name: 'tool_a' }))
      pool.register(createTestTool({ name: 'tool_b' }))
      expect(pool.has('tool_a')).toBe(true)
      expect(pool.has('tool_b')).toBe(true)
    })
  })

  describe('list / listByCategory', () => {
    it('lists all registered tools', () => {
      pool.register(createTestTool({ name: 'a' }))
      pool.register(createTestTool({ name: 'b' }))
      expect(pool.list()).toHaveLength(2)
    })

    it('filters tools by category', () => {
      pool.register(createTestTool({ name: 'web', category: 'common' }))
      pool.register(createTestTool({ name: 'stock', category: 'finance' }))
      pool.register(createTestTool({ name: 'calc', category: 'common' }))
      expect(pool.listByCategory('common')).toHaveLength(2)
      expect(pool.listByCategory('finance')).toHaveLength(1)
      expect(pool.listByCategory('legal')).toHaveLength(0)
    })
  })

  describe('execute', () => {
    it('executes with valid params and returns result', async () => {
      pool.register(createTestTool())
      const result = await pool.execute('test_tool', { query: 'hello' }, testContext)
      expect(result).toEqual({ success: true, result: 'Result for: hello' })
    })

    it('returns error for invalid params (Zod validation)', async () => {
      pool.register(createTestTool({
        parameters: z.object({ query: z.string(), count: z.number() }),
      }))
      const result = await pool.execute('test_tool', { query: 'test' }, testContext)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid parameters')
        expect(result.error).toContain('count')
      }
    })

    it('returns error for unknown tool', async () => {
      const result = await pool.execute('nonexistent', {}, testContext)
      expect(result).toEqual({ success: false, error: 'Tool "nonexistent" not found' })
    })

    it('truncates results exceeding 4000 chars', async () => {
      const longResult = 'A'.repeat(5000)
      pool.register(createTestTool({
        execute: async () => ({ success: true, result: longResult }),
      }))
      const result = await pool.execute('test_tool', { query: 'x' }, testContext)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.result.length).toBeLessThanOrEqual(4000)
        expect(result.result).toContain('...[truncated, original: 5000 chars]')
      }
    })

    it('does not truncate results within 4000 chars', async () => {
      const shortResult = 'B'.repeat(3999)
      pool.register(createTestTool({
        execute: async () => ({ success: true, result: shortResult }),
      }))
      const result = await pool.execute('test_tool', { query: 'x' }, testContext)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.result).toBe(shortResult)
      }
    })

    it('catches execution errors and returns ToolResult error', async () => {
      pool.register(createTestTool({
        execute: async () => { throw new Error('Connection timeout') },
      }))
      const result = await pool.execute('test_tool', { query: 'x' }, testContext)
      expect(result).toEqual({ success: false, error: 'Connection timeout' })
    })

    it('handles non-Error throws', async () => {
      pool.register(createTestTool({
        execute: async () => { throw 'string error' },
      }))
      const result = await pool.execute('test_tool', { query: 'x' }, testContext)
      expect(result).toEqual({ success: false, error: 'string error' })
    })

    it('passes ToolContext to execute function', async () => {
      let receivedContext: ToolContext | undefined
      pool.register(createTestTool({
        execute: async (_params, ctx) => {
          receivedContext = ctx
          return { success: true, result: 'ok' }
        },
      }))
      await pool.execute('test_tool', { query: 'x' }, testContext)
      expect(receivedContext).toBeDefined()
      expect(receivedContext!.companyId).toBe(testContext.companyId)
      expect(receivedContext!.agentId).toBe(testContext.agentId)
      expect(receivedContext!.agentName).toBe(testContext.agentName)
    })

    it('validates complex Zod schemas', async () => {
      pool.register(createTestTool({
        parameters: z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(100).optional(),
          tags: z.array(z.string()).optional(),
        }),
        execute: async (params) => ({ success: true, result: JSON.stringify(params) }),
      }))

      // Valid
      const r1 = await pool.execute('test_tool', { query: 'test', limit: 10 }, testContext)
      expect(r1.success).toBe(true)

      // Invalid -- empty query
      const r2 = await pool.execute('test_tool', { query: '' }, testContext)
      expect(r2.success).toBe(false)

      // Invalid -- limit too high
      const r3 = await pool.execute('test_tool', { query: 'test', limit: 200 }, testContext)
      expect(r3.success).toBe(false)
    })
  })

  describe('getDefinitions', () => {
    it('returns LLMToolDefinition[] filtered by allowedTools', () => {
      pool.register(createTestTool({ name: 'tool_a', description: 'Tool A' }))
      pool.register(createTestTool({ name: 'tool_b', description: 'Tool B' }))
      pool.register(createTestTool({ name: 'tool_c', description: 'Tool C' }))

      const defs = pool.getDefinitions(['tool_a', 'tool_c'])
      expect(defs).toHaveLength(2)
      expect(defs[0].name).toBe('tool_a')
      expect(defs[1].name).toBe('tool_c')
      expect(defs[0].description).toBe('Tool A')
    })

    it('returns empty array for empty allowedTools', () => {
      pool.register(createTestTool())
      expect(pool.getDefinitions([])).toEqual([])
    })

    it('skips tools not in registry', () => {
      pool.register(createTestTool({ name: 'exists' }))
      const defs = pool.getDefinitions(['exists', 'nonexistent'])
      expect(defs).toHaveLength(1)
      expect(defs[0].name).toBe('exists')
    })

    it('converts Zod schema to JSON Schema format', () => {
      pool.register(createTestTool({
        name: 'typed_tool',
        parameters: z.object({
          query: z.string(),
          count: z.number().optional(),
        }),
      }))
      const [def] = pool.getDefinitions(['typed_tool'])
      expect(def.parameters).toBeDefined()
      const params = def.parameters as Record<string, unknown>
      expect(params.type).toBe('object')
      const props = params.properties as Record<string, unknown>
      expect(props.query).toBeDefined()
      expect(props.count).toBeDefined()
    })
  })

  describe('createExecutor', () => {
    it('blocks tools not in allowedTools', async () => {
      pool.register(createTestTool({ name: 'restricted' }))
      const executor = pool.createExecutor({
        allowedTools: ['other_tool'],
        id: 'agent-1',
        companyId: 'company-1',
        name: 'TestAgent',
      })
      const result = await executor('restricted', {})
      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error).toContain('Permission denied')
        expect(result.error).toContain('TestAgent')
      }
    })

    it('executes allowed tools successfully', async () => {
      pool.register(createTestTool({ name: 'allowed' }))
      const executor = pool.createExecutor({
        allowedTools: ['allowed'],
        id: 'agent-1',
        companyId: 'company-1',
        name: 'TestAgent',
      })
      const result = await executor('allowed', { query: 'test' })
      expect('result' in result).toBe(true)
      if ('result' in result) {
        expect(result.result).toBe('Result for: test')
      }
    })

    it('returns error for tool execution failure', async () => {
      pool.register(createTestTool({
        name: 'failing',
        execute: async () => ({ success: false, error: 'API down' }),
      }))
      const executor = pool.createExecutor({
        allowedTools: ['failing'],
        id: 'agent-1',
        companyId: 'company-1',
        name: 'TestAgent',
      })
      const result = await executor('failing', { query: 'x' })
      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error).toBe('API down')
      }
    })

    it('passes correct ToolContext from agent config', async () => {
      let capturedCtx: ToolContext | undefined
      pool.register(createTestTool({
        name: 'ctx_tool',
        execute: async (_p, ctx) => { capturedCtx = ctx; return { success: true, result: 'ok' } },
      }))
      const executor = pool.createExecutor({
        allowedTools: ['ctx_tool'],
        id: 'agent-42',
        companyId: 'company-99',
        name: 'MyAgent',
      })
      await executor('ctx_tool', { query: 'x' })
      expect(capturedCtx).toBeDefined()
      expect(capturedCtx!.companyId).toBe('company-99')
      expect(capturedCtx!.agentId).toBe('agent-42')
      expect(capturedCtx!.agentName).toBe('MyAgent')
    })
  })
})

describe('truncateResult', () => {
  it('returns short results unchanged', () => {
    expect(truncateResult('hello', 4000)).toBe('hello')
  })

  it('truncates long results with suffix', () => {
    const long = 'X'.repeat(5000)
    const result = truncateResult(long, 4000)
    expect(result.length).toBeLessThanOrEqual(4000)
    expect(result).toContain('...[truncated, original: 5000 chars]')
  })

  it('handles exactly max length', () => {
    const exact = 'Y'.repeat(4000)
    expect(truncateResult(exact, 4000)).toBe(exact)
  })
})
