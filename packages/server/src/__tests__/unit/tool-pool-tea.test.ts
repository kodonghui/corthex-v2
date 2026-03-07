/**
 * TEA (Test Architect) generated tests for ToolPool
 * Risk-based coverage expansion -- edge cases, boundaries, integration
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { z } from 'zod'
import { ToolPool, truncateResult } from '../../services/tool-pool'
import type { ToolRegistration } from '../../services/tool-pool'
import type { ToolContext } from '@corthex/shared'

const ctx: ToolContext = { companyId: 'c1', agentId: 'a1', agentName: 'Agent1' }

function mkTool(name: string, overrides: Partial<ToolRegistration> = {}): ToolRegistration {
  return {
    name,
    description: `Tool ${name}`,
    category: 'common',
    parameters: z.object({ input: z.string() }),
    execute: async (p) => ({ success: true, result: `done:${(p as { input: string }).input}` }),
    ...overrides,
  }
}

describe('TEA: ToolPool edge cases', () => {
  let pool: ToolPool

  beforeEach(() => { pool = new ToolPool() })

  // --- get() edge cases ---
  it('get() returns undefined for non-existent tool', () => {
    expect(pool.get('nope')).toBeUndefined()
  })

  it('has() returns false for non-existent tool', () => {
    expect(pool.has('nope')).toBe(false)
  })

  // --- list() on empty pool ---
  it('list() returns empty array when no tools registered', () => {
    expect(pool.list()).toEqual([])
  })

  it('listByCategory() returns empty array when no tools registered', () => {
    expect(pool.listByCategory('finance')).toEqual([])
  })

  // --- Empty Zod schema ---
  it('execute with empty object schema accepts empty params', async () => {
    pool.register(mkTool('empty_schema', {
      parameters: z.object({}),
      execute: async () => ({ success: true, result: 'ok' }),
    }))
    const r = await pool.execute('empty_schema', {}, ctx)
    expect(r).toEqual({ success: true, result: 'ok' })
  })

  it('execute with z.any() schema accepts anything', async () => {
    pool.register(mkTool('any_schema', {
      parameters: z.any(),
      execute: async (p) => ({ success: true, result: JSON.stringify(p) }),
    }))
    const r = await pool.execute('any_schema', { foo: 123, bar: [1, 2] }, ctx)
    expect(r.success).toBe(true)
  })

  // --- Nested Zod validation errors ---
  it('reports nested Zod validation paths', async () => {
    pool.register(mkTool('nested', {
      parameters: z.object({
        config: z.object({
          timeout: z.number().min(1),
        }),
      }),
    }))
    const r = await pool.execute('nested', { config: { timeout: 0 } }, ctx)
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error).toContain('config.timeout')
    }
  })

  // --- Tool returning success:false ---
  it('execute propagates tool-returned errors without wrapping', async () => {
    pool.register(mkTool('failing', {
      execute: async () => ({ success: false, error: 'API rate limited' }),
    }))
    const r = await pool.execute('failing', { input: 'x' }, ctx)
    expect(r).toEqual({ success: false, error: 'API rate limited' })
  })

  // --- createExecutor with empty allowedTools ---
  it('createExecutor with empty allowedTools blocks all tools', async () => {
    pool.register(mkTool('tool_a'))
    const exec = pool.createExecutor({ allowedTools: [], id: 'a1', companyId: 'c1', name: 'A' })
    const r = await exec('tool_a', { input: 'x' })
    expect('error' in r).toBe(true)
  })

  // --- createExecutor delegates execute error path ---
  it('createExecutor returns error when tool not found in pool', async () => {
    const exec = pool.createExecutor({ allowedTools: ['ghost'], id: 'a1', companyId: 'c1', name: 'A' })
    const r = await exec('ghost', {})
    expect('error' in r).toBe(true)
    if ('error' in r) {
      expect(r.error).toContain('not found')
    }
  })

  // --- Multiple categories ---
  it('listByCategory returns correct tools across all categories', () => {
    pool.register(mkTool('t1', { category: 'common' }))
    pool.register(mkTool('t2', { category: 'finance' }))
    pool.register(mkTool('t3', { category: 'legal' }))
    pool.register(mkTool('t4', { category: 'marketing' }))
    pool.register(mkTool('t5', { category: 'tech' }))

    expect(pool.listByCategory('common')).toHaveLength(1)
    expect(pool.listByCategory('finance')).toHaveLength(1)
    expect(pool.listByCategory('legal')).toHaveLength(1)
    expect(pool.listByCategory('marketing')).toHaveLength(1)
    expect(pool.listByCategory('tech')).toHaveLength(1)
    expect(pool.list()).toHaveLength(5)
  })

  // --- getDefinitions edge cases ---
  it('getDefinitions returns empty for null-ish input', () => {
    pool.register(mkTool('x'))
    expect(pool.getDefinitions(null as unknown as string[])).toEqual([])
    expect(pool.getDefinitions(undefined as unknown as string[])).toEqual([])
  })

  it('getDefinitions preserves order of allowedTools', () => {
    pool.register(mkTool('c'))
    pool.register(mkTool('a'))
    pool.register(mkTool('b'))
    const defs = pool.getDefinitions(['b', 'a', 'c'])
    expect(defs.map(d => d.name)).toEqual(['b', 'a', 'c'])
  })

  it('getDefinitions includes description from tool', () => {
    pool.register(mkTool('desc_tool', { description: 'Does something special' }))
    const [def] = pool.getDefinitions(['desc_tool'])
    expect(def.description).toBe('Does something special')
  })

  // --- Async tool execution ---
  it('handles async tool that takes time', async () => {
    pool.register(mkTool('slow', {
      execute: async () => {
        await new Promise(r => setTimeout(r, 10))
        return { success: true, result: 'delayed' }
      },
    }))
    const r = await pool.execute('slow', { input: 'x' }, ctx)
    expect(r).toEqual({ success: true, result: 'delayed' })
  })

  // --- Tool that rejects with non-Error ---
  it('handles tool rejecting with undefined', async () => {
    pool.register(mkTool('undef_err', {
      execute: async () => { throw undefined },
    }))
    const r = await pool.execute('undef_err', { input: 'x' }, ctx)
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error).toBe('undefined')
    }
  })
})

describe('TEA: truncateResult boundary conditions', () => {
  it('result at exactly 4000 chars is NOT truncated', () => {
    const s = 'A'.repeat(4000)
    expect(truncateResult(s, 4000)).toBe(s)
    expect(truncateResult(s, 4000).length).toBe(4000)
  })

  it('result at 4001 chars IS truncated', () => {
    const s = 'A'.repeat(4001)
    const r = truncateResult(s, 4000)
    expect(r.length).toBeLessThanOrEqual(4000)
    expect(r).toContain('...[truncated, original: 4001 chars]')
  })

  it('result at 3999 chars is NOT truncated', () => {
    const s = 'B'.repeat(3999)
    expect(truncateResult(s, 4000)).toBe(s)
  })

  it('empty string is not truncated', () => {
    expect(truncateResult('', 4000)).toBe('')
  })

  it('single char is not truncated', () => {
    expect(truncateResult('x', 4000)).toBe('x')
  })

  it('truncation suffix contains original length', () => {
    const s = 'C'.repeat(10000)
    const r = truncateResult(s, 4000)
    expect(r).toContain('original: 10000 chars')
  })

  it('custom maxLength works correctly', () => {
    const s = 'D'.repeat(200)
    const r = truncateResult(s, 100)
    expect(r.length).toBeLessThanOrEqual(100)
    expect(r).toContain('...[truncated')
  })
})

describe('TEA: ToolPool + AgentRunner integration pattern', () => {
  it('createExecutor returns ToolExecutor-compatible function', async () => {
    const pool = new ToolPool()
    pool.register(mkTool('search', {
      parameters: z.object({ query: z.string(), limit: z.number().optional() }),
      execute: async (p) => ({ success: true, result: `Found results for: ${(p as { query: string }).query}` }),
    }))

    const executor = pool.createExecutor({
      allowedTools: ['search'],
      id: 'agent-1',
      companyId: 'company-1',
      name: 'SearchAgent',
    })

    // Verify function signature matches ToolExecutor
    const result = await executor('search', { query: 'test', limit: 10 })
    expect('result' in result).toBe(true)
    if ('result' in result) {
      expect(result.result).toContain('Found results for: test')
    }
  })

  it('executor validates params via Zod before execution', async () => {
    const pool = new ToolPool()
    pool.register(mkTool('strict', {
      parameters: z.object({ required_field: z.string() }),
      execute: async () => ({ success: true, result: 'should not reach' }),
    }))

    const executor = pool.createExecutor({
      allowedTools: ['strict'],
      id: 'a1', companyId: 'c1', name: 'A',
    })

    // Missing required field
    const r = await executor('strict', {})
    expect('error' in r).toBe(true)
    if ('error' in r) {
      expect(r.error).toContain('Invalid parameters')
    }
  })

  it('multiple sequential tool executions maintain state isolation', async () => {
    const pool = new ToolPool()
    let callCount = 0
    pool.register(mkTool('counter', {
      execute: async () => {
        callCount++
        return { success: true, result: `call #${callCount}` }
      },
    }))

    const exec = pool.createExecutor({ allowedTools: ['counter'], id: 'a1', companyId: 'c1', name: 'A' })
    const r1 = await exec('counter', { input: 'x' })
    const r2 = await exec('counter', { input: 'y' })

    if ('result' in r1) expect(r1.result).toBe('call #1')
    if ('result' in r2) expect(r2.result).toBe('call #2')
  })
})
