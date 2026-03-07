import { describe, it, expect, beforeEach, mock } from 'bun:test'

// --- Tool Catalog API Logic Tests ---

describe('Tool Catalog API Logic', () => {
  describe('catalog grouping', () => {
    it('groups tools by category', () => {
      const dbTools = [
        { name: 'Web Search', handler: 'search_web', category: 'common', isActive: true, description: 'Search web' },
        { name: 'Calculator', handler: 'calculate', category: 'common', isActive: true, description: 'Math calc' },
        { name: 'Stock Price', handler: 'get_stock_price', category: 'finance', isActive: true, description: 'Stock lookup' },
        { name: 'Law Search', handler: 'law_search', category: 'legal', isActive: true, description: 'Law search' },
      ]
      const registeredHandlers = new Set(['search_web', 'calculate', 'get_stock_price', 'law_search'])

      // Simulate catalog grouping logic
      const categoryMap = new Map<string, Array<{ name: string; description: string | null; category: string; registered: boolean }>>()

      for (const tool of dbTools) {
        if (!tool.isActive) continue
        const cat = tool.category || 'common'
        if (!categoryMap.has(cat)) categoryMap.set(cat, [])
        categoryMap.get(cat)!.push({
          name: tool.handler || tool.name,
          description: tool.description,
          category: cat,
          registered: tool.handler ? registeredHandlers.has(tool.handler) : false,
        })
      }

      expect(categoryMap.size).toBe(3)
      expect(categoryMap.get('common')!.length).toBe(2)
      expect(categoryMap.get('finance')!.length).toBe(1)
      expect(categoryMap.get('legal')!.length).toBe(1)
    })

    it('filters out inactive tools', () => {
      const dbTools = [
        { name: 'Active Tool', handler: 'active', category: 'common', isActive: true, description: 'Active' },
        { name: 'Inactive Tool', handler: 'inactive', category: 'common', isActive: false, description: 'Inactive' },
      ]

      const result: { name: string }[] = []
      for (const tool of dbTools) {
        if (!tool.isActive) continue
        result.push({ name: tool.handler || tool.name })
      }

      expect(result.length).toBe(1)
      expect(result[0].name).toBe('active')
    })

    it('uses handler name over tool name', () => {
      const tool = { name: 'My Tool', handler: 'my_tool_handler', category: 'common', isActive: true }
      const name = tool.handler || tool.name
      expect(name).toBe('my_tool_handler')
    })

    it('falls back to tool name when no handler', () => {
      const tool = { name: 'My Tool', handler: null, category: 'common', isActive: true }
      const name = tool.handler || tool.name
      expect(name).toBe('My Tool')
    })

    it('marks registered status correctly', () => {
      const registeredHandlers = new Set(['search_web', 'calculate'])

      expect(registeredHandlers.has('search_web')).toBe(true)
      expect(registeredHandlers.has('unknown_tool')).toBe(false)
    })

    it('defaults to common category when category is null', () => {
      const tool = { name: 'Tool', handler: 'tool', category: null, isActive: true }
      const cat = tool.category || 'common'
      expect(cat).toBe('common')
    })

    it('sorts categories in predefined order', () => {
      const categories = ['common', 'finance', 'legal', 'marketing', 'tech']
      const available = new Set(['tech', 'common', 'finance'])

      const sorted = categories.filter((c) => available.has(c))
      expect(sorted).toEqual(['common', 'finance', 'tech'])
    })

    it('sorts tools alphabetically within category', () => {
      const tools = [
        { name: 'z_tool', description: null, category: 'common', registered: true },
        { name: 'a_tool', description: null, category: 'common', registered: true },
        { name: 'm_tool', description: null, category: 'common', registered: true },
      ]

      const sorted = tools.sort((a, b) => a.name.localeCompare(b.name))
      expect(sorted.map((t) => t.name)).toEqual(['a_tool', 'm_tool', 'z_tool'])
    })
  })
})

// --- AllowedTools Update Logic Tests ---

describe('AllowedTools Update Logic', () => {
  describe('diff calculation', () => {
    it('calculates added tools', () => {
      const before = ['search_web', 'calculate']
      const after = ['search_web', 'calculate', 'get_stock_price']

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added).toEqual(['get_stock_price'])
      expect(removed).toEqual([])
    })

    it('calculates removed tools', () => {
      const before = ['search_web', 'calculate', 'get_stock_price']
      const after = ['search_web']

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added).toEqual([])
      expect(removed).toEqual(['calculate', 'get_stock_price'])
    })

    it('calculates mixed changes', () => {
      const before = ['search_web', 'calculate']
      const after = ['search_web', 'get_stock_price', 'law_search']

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added).toEqual(['get_stock_price', 'law_search'])
      expect(removed).toEqual(['calculate'])
    })

    it('handles empty before', () => {
      const before: string[] = []
      const after = ['search_web', 'calculate']

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added).toEqual(['search_web', 'calculate'])
      expect(removed).toEqual([])
    })

    it('handles empty after', () => {
      const before = ['search_web', 'calculate']
      const after: string[] = []

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added).toEqual([])
      expect(removed).toEqual(['search_web', 'calculate'])
    })

    it('detects no changes', () => {
      const before = ['search_web', 'calculate']
      const after = ['search_web', 'calculate']

      const added = after.filter((t) => !before.includes(t))
      const removed = before.filter((t) => !after.includes(t))

      expect(added.length + removed.length).toBe(0)
    })
  })

  describe('category batch operations', () => {
    const categoryTools = ['get_stock_price', 'get_account_balance', 'place_stock_order']

    it('adds all tools in category', () => {
      const current = ['search_web', 'calculate']
      const newAllowed = [...new Set([...current, ...categoryTools])]

      expect(newAllowed).toContain('search_web')
      expect(newAllowed).toContain('calculate')
      expect(newAllowed).toContain('get_stock_price')
      expect(newAllowed).toContain('get_account_balance')
      expect(newAllowed).toContain('place_stock_order')
      expect(newAllowed.length).toBe(5)
    })

    it('removes all tools in category', () => {
      const current = ['search_web', 'get_stock_price', 'get_account_balance', 'calculate']
      const removeSet = new Set(categoryTools)
      const newAllowed = current.filter((t) => !removeSet.has(t))

      expect(newAllowed).toEqual(['search_web', 'calculate'])
    })

    it('deduplicates when adding existing tools', () => {
      const current = ['search_web', 'get_stock_price']
      const newAllowed = [...new Set([...current, ...categoryTools])]

      // get_stock_price should not be duplicated
      const stockCount = newAllowed.filter((t) => t === 'get_stock_price').length
      expect(stockCount).toBe(1)
      expect(newAllowed.length).toBe(4) // search_web + 3 finance tools
    })

    it('handles empty current tools', () => {
      const current: string[] = []
      const newAllowed = [...new Set([...current, ...categoryTools])]

      expect(newAllowed).toEqual(categoryTools)
    })

    it('handles removing from empty', () => {
      const current: string[] = []
      const removeSet = new Set(categoryTools)
      const newAllowed = current.filter((t) => !removeSet.has(t))

      expect(newAllowed).toEqual([])
    })
  })
})

// --- UI State Logic Tests ---

describe('Tool Permission Matrix UI Logic', () => {
  describe('toggle single tool', () => {
    it('adds tool when not present', () => {
      const current = ['search_web', 'calculate']
      const toolName = 'get_stock_price'
      const newTools = current.includes(toolName)
        ? current.filter((t) => t !== toolName)
        : [...current, toolName]

      expect(newTools).toEqual(['search_web', 'calculate', 'get_stock_price'])
    })

    it('removes tool when present', () => {
      const current = ['search_web', 'calculate']
      const toolName = 'calculate'
      const newTools = current.includes(toolName)
        ? current.filter((t) => t !== toolName)
        : [...current, toolName]

      expect(newTools).toEqual(['search_web'])
    })
  })

  describe('category toggle logic', () => {
    const catTools = ['tool_a', 'tool_b', 'tool_c']

    it('enables all when none enabled', () => {
      const current = ['other_tool']
      const allEnabled = catTools.every((t) => current.includes(t))
      expect(allEnabled).toBe(false)

      const newTools = [...new Set([...current, ...catTools])]
      expect(newTools).toEqual(['other_tool', 'tool_a', 'tool_b', 'tool_c'])
    })

    it('enables all when some enabled', () => {
      const current = ['tool_a', 'other_tool']
      const allEnabled = catTools.every((t) => current.includes(t))
      expect(allEnabled).toBe(false)

      const newTools = [...new Set([...current, ...catTools])]
      expect(newTools).toContain('tool_a')
      expect(newTools).toContain('tool_b')
      expect(newTools).toContain('tool_c')
      expect(newTools).toContain('other_tool')
    })

    it('disables all when all enabled', () => {
      const current = ['tool_a', 'tool_b', 'tool_c', 'other_tool']
      const allEnabled = catTools.every((t) => current.includes(t))
      expect(allEnabled).toBe(true)

      const removeSet = new Set(catTools)
      const newTools = current.filter((t) => !removeSet.has(t))
      expect(newTools).toEqual(['other_tool'])
    })
  })

  describe('change counting', () => {
    it('counts added and removed tools', () => {
      const original = ['search_web', 'calculate']
      const modified = ['search_web', 'get_stock_price', 'law_search']

      const added = modified.filter((t) => !original.includes(t))
      const removed = original.filter((t) => !modified.includes(t))
      const count = added.length + removed.length

      expect(count).toBe(3) // +get_stock_price, +law_search, -calculate
    })

    it('returns zero for no changes', () => {
      const original = ['search_web', 'calculate']
      const modified = ['search_web', 'calculate']

      const added = modified.filter((t) => !original.includes(t))
      const removed = original.filter((t) => !modified.includes(t))
      const count = added.length + removed.length

      expect(count).toBe(0)
    })
  })
})

// --- Audit Log Integration Tests ---

describe('Audit Log for Tool Permission Changes', () => {
  it('creates correct audit log structure for individual update', () => {
    const before = ['search_web', 'calculate']
    const after = ['search_web', 'calculate', 'get_stock_price']
    const added = after.filter((t) => !before.includes(t))
    const removed = before.filter((t) => !after.includes(t))

    const auditPayload = {
      companyId: 'company-123',
      actorType: 'admin_user' as const,
      actorId: 'user-123',
      action: 'agent.allowedTools.update',
      targetType: 'agent',
      targetId: 'agent-456',
      before: { allowedTools: before },
      after: { allowedTools: after },
      metadata: { added, removed },
    }

    expect(auditPayload.action).toBe('agent.allowedTools.update')
    expect(auditPayload.metadata.added).toEqual(['get_stock_price'])
    expect(auditPayload.metadata.removed).toEqual([])
    expect(auditPayload.targetType).toBe('agent')
  })

  it('creates correct audit log structure for batch update', () => {
    const before = ['search_web']
    const after = ['search_web', 'get_stock_price', 'get_account_balance']
    const added = after.filter((t) => !before.includes(t))
    const removed = before.filter((t) => !after.includes(t))

    const auditPayload = {
      companyId: 'company-123',
      actorType: 'admin_user' as const,
      actorId: 'user-123',
      action: 'agent.allowedTools.batch',
      targetType: 'agent',
      targetId: 'agent-456',
      before: { allowedTools: before },
      after: { allowedTools: after },
      metadata: { category: 'finance', batchAction: 'add', added, removed },
    }

    expect(auditPayload.action).toBe('agent.allowedTools.batch')
    expect(auditPayload.metadata.category).toBe('finance')
    expect(auditPayload.metadata.batchAction).toBe('add')
    expect(auditPayload.metadata.added).toEqual(['get_stock_price', 'get_account_balance'])
  })

  it('skips audit log when no actual changes', () => {
    const before = ['search_web', 'calculate']
    const after = ['search_web', 'calculate']
    const added = after.filter((t) => !before.includes(t))
    const removed = before.filter((t) => !after.includes(t))

    const shouldLog = added.length > 0 || removed.length > 0
    expect(shouldLog).toBe(false)
  })
})

// --- Zod Schema Validation Tests ---

describe('API Schema Validation', () => {
  const { z } = require('zod')

  const updateAllowedToolsSchema = z.object({
    allowedTools: z.array(z.string()),
  })

  const batchAllowedToolsSchema = z.object({
    category: z.string().min(1),
    action: z.enum(['add', 'remove']),
  })

  describe('updateAllowedToolsSchema', () => {
    it('accepts valid allowedTools array', () => {
      const result = updateAllowedToolsSchema.safeParse({ allowedTools: ['search_web', 'calculate'] })
      expect(result.success).toBe(true)
    })

    it('accepts empty array', () => {
      const result = updateAllowedToolsSchema.safeParse({ allowedTools: [] })
      expect(result.success).toBe(true)
    })

    it('rejects missing allowedTools', () => {
      const result = updateAllowedToolsSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects non-string array items', () => {
      const result = updateAllowedToolsSchema.safeParse({ allowedTools: [123, true] })
      expect(result.success).toBe(false)
    })
  })

  describe('batchAllowedToolsSchema', () => {
    it('accepts valid add action', () => {
      const result = batchAllowedToolsSchema.safeParse({ category: 'finance', action: 'add' })
      expect(result.success).toBe(true)
    })

    it('accepts valid remove action', () => {
      const result = batchAllowedToolsSchema.safeParse({ category: 'common', action: 'remove' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid action', () => {
      const result = batchAllowedToolsSchema.safeParse({ category: 'finance', action: 'toggle' })
      expect(result.success).toBe(false)
    })

    it('rejects empty category', () => {
      const result = batchAllowedToolsSchema.safeParse({ category: '', action: 'add' })
      expect(result.success).toBe(false)
    })

    it('rejects missing fields', () => {
      expect(batchAllowedToolsSchema.safeParse({}).success).toBe(false)
      expect(batchAllowedToolsSchema.safeParse({ category: 'finance' }).success).toBe(false)
      expect(batchAllowedToolsSchema.safeParse({ action: 'add' }).success).toBe(false)
    })
  })
})
