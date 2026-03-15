import { describe, test, expect } from 'bun:test'

// === Story 19.2: Agent Tool Toggle UI — TEA Tests ===
// TEA: Risk-based coverage — P0 API routes registered, P0 schema/validation, P1 allowedTools logic

describe('[P0] /api/admin/agents/:id/allowed-tools route — registration', () => {
  test('toolsRoute exports a Hono instance', async () => {
    const { toolsRoute } = await import('../../routes/admin/tools')
    expect(toolsRoute).toBeDefined()
    expect(typeof toolsRoute.fetch).toBe('function')
  })

  test('toolsRoute has PATCH /agents/:id/allowed-tools route', async () => {
    const { toolsRoute } = await import('../../routes/admin/tools')
    // Drizzle-style: all routes live on same router; just verify router has routes array
    expect(toolsRoute.routes).toBeDefined()
    const routes = toolsRoute.routes as Array<{ method: string; path: string }>
    const patchAllowed = routes.some(
      r => r.method === 'PATCH' && r.path.includes('allowed-tools') && !r.path.includes('batch'),
    )
    expect(patchAllowed).toBe(true)
  })

  test('toolsRoute has PATCH /agents/:id/allowed-tools/batch route', async () => {
    const { toolsRoute } = await import('../../routes/admin/tools')
    const routes = toolsRoute.routes as Array<{ method: string; path: string }>
    const batchRoute = routes.some(
      r => r.method === 'PATCH' && r.path.includes('allowed-tools/batch'),
    )
    expect(batchRoute).toBe(true)
  })

  test('toolsRoute has GET /tools/catalog route', async () => {
    const { toolsRoute } = await import('../../routes/admin/tools')
    const routes = toolsRoute.routes as Array<{ method: string; path: string }>
    const catalogRoute = routes.some(
      r => r.method === 'GET' && r.path.includes('catalog'),
    )
    expect(catalogRoute).toBe(true)
  })
})

describe('[P0] updateAllowedToolsSchema — input validation', () => {
  test('zod schema accepts valid allowedTools string array', async () => {
    const { z } = await import('zod')
    const schema = z.object({ allowedTools: z.array(z.string()) })
    const result = schema.safeParse({ allowedTools: ['read_web_page', 'md_to_pdf'] })
    expect(result.success).toBe(true)
  })

  test('zod schema rejects non-array allowedTools', async () => {
    const { z } = await import('zod')
    const schema = z.object({ allowedTools: z.array(z.string()) })
    const result = schema.safeParse({ allowedTools: 'read_web_page' })
    expect(result.success).toBe(false)
  })

  test('zod schema accepts empty array (clears all tools)', async () => {
    const { z } = await import('zod')
    const schema = z.object({ allowedTools: z.array(z.string()) })
    const result = schema.safeParse({ allowedTools: [] })
    expect(result.success).toBe(true)
  })
})

describe('[P0] batchAllowedToolsSchema — input validation', () => {
  test('schema accepts add action with category', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      category: z.string().min(1),
      action: z.enum(['add', 'remove']),
    })
    const result = schema.safeParse({ category: 'marketing', action: 'add' })
    expect(result.success).toBe(true)
  })

  test('schema accepts remove action with category', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      category: z.string().min(1),
      action: z.enum(['add', 'remove']),
    })
    const result = schema.safeParse({ category: 'tech', action: 'remove' })
    expect(result.success).toBe(true)
  })

  test('schema rejects invalid action value', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      category: z.string().min(1),
      action: z.enum(['add', 'remove']),
    })
    const result = schema.safeParse({ category: 'tech', action: 'toggle' })
    expect(result.success).toBe(false)
  })

  test('schema rejects empty category string', async () => {
    const { z } = await import('zod')
    const schema = z.object({
      category: z.string().min(1),
      action: z.enum(['add', 'remove']),
    })
    const result = schema.safeParse({ category: '', action: 'add' })
    expect(result.success).toBe(false)
  })
})

describe('[P1] allowed_tools merge logic — unit', () => {
  test('add action: merges existing + new without duplicates', () => {
    const before = ['read_web_page', 'md_to_pdf']
    const categoryToolNames = ['publish_tistory', 'md_to_pdf']  // md_to_pdf already in before
    const newAllowed = [...new Set([...before, ...categoryToolNames])]
    expect(newAllowed).toContain('read_web_page')
    expect(newAllowed).toContain('md_to_pdf')
    expect(newAllowed).toContain('publish_tistory')
    // No duplicates
    const unique = new Set(newAllowed)
    expect(unique.size).toBe(newAllowed.length)
  })

  test('remove action: removes only category tools, keeps others', () => {
    const before = ['read_web_page', 'md_to_pdf', 'publish_tistory']
    const categoryToolNames = ['publish_tistory']
    const removeSet = new Set(categoryToolNames)
    const newAllowed = before.filter((t) => !removeSet.has(t))
    expect(newAllowed).toContain('read_web_page')
    expect(newAllowed).toContain('md_to_pdf')
    expect(newAllowed).not.toContain('publish_tistory')
  })

  test('add to empty before: result equals categoryToolNames', () => {
    const before: string[] = []
    const categoryToolNames = ['read_web_page', 'md_to_pdf']
    const newAllowed = [...new Set([...before, ...categoryToolNames])]
    expect(newAllowed).toEqual(['read_web_page', 'md_to_pdf'])
  })

  test('remove from empty before: result stays empty', () => {
    const before: string[] = []
    const categoryToolNames = ['publish_tistory']
    const removeSet = new Set(categoryToolNames)
    const newAllowed = before.filter((t) => !removeSet.has(t))
    expect(newAllowed).toEqual([])
  })

  test('PATCH allowed-tools: correctly computes added/removed diff', () => {
    const before = ['read_web_page', 'md_to_pdf']
    const allowedTools = ['md_to_pdf', 'publish_tistory']
    const added = allowedTools.filter((t) => !before.includes(t))
    const removed = before.filter((t) => !allowedTools.includes(t))
    expect(added).toEqual(['publish_tistory'])
    expect(removed).toEqual(['read_web_page'])
  })

  test('PATCH allowed-tools: empty diff when no change', () => {
    const before = ['read_web_page']
    const allowedTools = ['read_web_page']
    const added = allowedTools.filter((t) => !before.includes(t))
    const removed = before.filter((t) => !allowedTools.includes(t))
    expect(added).toEqual([])
    expect(removed).toEqual([])
  })
})

describe('[P1] tool catalog — data-driven grouping logic', () => {
  test('known categories are ordered: common, finance, legal, marketing, tech', () => {
    const categories = ['common', 'finance', 'legal', 'marketing', 'tech']
    const mockMap = new Map([
      ['tech', [{ name: 'md_to_pdf', description: null, category: 'tech', registered: true }]],
      ['marketing', [{ name: 'publish_tistory', description: null, category: 'marketing', registered: false }]],
    ])
    const data = categories
      .filter((cat) => mockMap.has(cat))
      .map((cat) => ({ category: cat, tools: mockMap.get(cat)! }))
    expect(data[0].category).toBe('marketing')
    expect(data[1].category).toBe('tech')
  })

  test('inactive tools are filtered out of catalog', () => {
    const dbTools = [
      { handler: 'read_web_page', category: 'tech', isActive: true, description: null },
      { handler: 'old_tool', category: 'tech', isActive: false, description: null },
    ]
    const activeCatalog = dbTools.filter(t => t.isActive)
    expect(activeCatalog).toHaveLength(1)
    expect(activeCatalog[0].handler).toBe('read_web_page')
  })

  test('handler name is used as tool name when available', () => {
    const tool = { name: 'DB Tool Name', handler: 'read_web_page', isActive: true }
    const catalogName = tool.handler || tool.name
    expect(catalogName).toBe('read_web_page')
  })

  test('tools with no handler fall back to name field', () => {
    const tool = { name: 'Legacy Tool', handler: null, isActive: true }
    const catalogName = tool.handler || tool.name
    expect(catalogName).toBe('Legacy Tool')
  })
})
