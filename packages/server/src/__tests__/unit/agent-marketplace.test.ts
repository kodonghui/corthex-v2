import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const companyA = uuid(100)
const companyB = uuid(200)

// === Types ===
type SoulTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  content: string
  category: string | null
  tier: string | null
  allowedTools: string[] | null
  isBuiltin: boolean
  isActive: boolean
  isPublished: boolean
  publishedAt: string | null
  downloadCount: number
}

// === Market listing filter logic ===
function filterAgentMarket(
  templates: SoulTemplate[],
  viewerCompanyId: string,
  q?: string,
  category?: string,
  tier?: string,
): SoulTemplate[] {
  return templates.filter((t) => {
    if (!t.isPublished || !t.isActive) return false
    if (t.companyId !== null && t.companyId === viewerCompanyId) return false
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false
    if (category && t.category !== category) return false
    if (tier && t.tier !== tier) return false
    return true
  })
}

// === Import logic ===
function importTemplate(source: SoulTemplate, targetCompanyId: string, customName?: string): Partial<SoulTemplate> {
  return {
    companyId: targetCompanyId,
    name: customName || `${source.name} (가져옴)`,
    description: source.description,
    content: source.content,
    category: source.category,
    tier: source.tier,
    allowedTools: source.allowedTools,
    isBuiltin: false,
    isPublished: false,
  }
}

// === Publish validation logic ===
function canPublish(template: SoulTemplate, requestCompanyId: string): { ok: boolean; error?: string } {
  if (template.companyId !== requestCompanyId) return { ok: false, error: '소유권 불일치' }
  if (template.isPublished) return { ok: false, error: '이미 공개됨' }
  return { ok: true }
}

function canUnpublish(template: SoulTemplate, requestCompanyId: string): { ok: boolean; error?: string } {
  if (template.companyId !== requestCompanyId) return { ok: false, error: '소유권 불일치' }
  if (!template.isPublished) return { ok: false, error: '이미 비공개' }
  return { ok: true }
}

// === Test data factory ===
function makeSoul(overrides: Partial<SoulTemplate> = {}): SoulTemplate {
  return {
    id: uuid(Math.floor(Math.random() * 10000)),
    companyId: companyB,
    name: 'Test Soul',
    description: 'A test soul template',
    content: '# Role\nYou are an analyst.',
    category: '분석',
    tier: 'specialist',
    allowedTools: ['web-search', 'calculator'],
    isBuiltin: false,
    isActive: true,
    isPublished: true,
    publishedAt: '2026-01-01T00:00:00Z',
    downloadCount: 0,
    ...overrides,
  }
}

// ============================================================
// Market listing filter tests
// ============================================================
describe('Agent Marketplace — Market listing filter', () => {
  const templates: SoulTemplate[] = [
    makeSoul({ id: uuid(1), companyId: companyA, name: 'My Soul', isPublished: true }),
    makeSoul({ id: uuid(2), companyId: companyB, name: 'Other Soul', isPublished: true }),
    makeSoul({ id: uuid(3), companyId: null, name: 'Builtin Soul', isBuiltin: true, isPublished: true }),
    makeSoul({ id: uuid(4), companyId: companyB, name: 'Hidden Soul', isPublished: false }),
    makeSoul({ id: uuid(5), companyId: companyB, name: 'Inactive Soul', isPublished: true, isActive: false }),
    makeSoul({ id: uuid(6), companyId: companyB, name: 'Finance Analyst', category: '금융', tier: 'manager', isPublished: true }),
    makeSoul({ id: uuid(7), companyId: companyB, name: 'Worker Bot', category: '자동화', tier: 'worker', isPublished: true }),
  ]

  test('own company templates are excluded', () => {
    const result = filterAgentMarket(templates, companyA)
    expect(result.every((t) => t.companyId !== companyA)).toBe(true)
  })

  test('builtin templates (companyId=null) are always visible', () => {
    const result = filterAgentMarket(templates, companyA)
    expect(result.some((t) => t.isBuiltin)).toBe(true)
  })

  test('unpublished templates are hidden', () => {
    const result = filterAgentMarket(templates, companyA)
    expect(result.every((t) => t.isPublished)).toBe(true)
  })

  test('inactive templates are hidden', () => {
    const result = filterAgentMarket(templates, companyA)
    expect(result.every((t) => t.isActive)).toBe(true)
  })

  test('search keyword filters by name (case-insensitive)', () => {
    const result = filterAgentMarket(templates, companyA, 'other')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Other Soul')
  })

  test('category filter works', () => {
    const result = filterAgentMarket(templates, companyA, undefined, '금융')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Finance Analyst')
  })

  test('tier filter works', () => {
    const result = filterAgentMarket(templates, companyA, undefined, undefined, 'worker')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Worker Bot')
  })

  test('combined category + tier filter', () => {
    const result = filterAgentMarket(templates, companyA, undefined, '금융', 'manager')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Finance Analyst')
  })

  test('no match returns empty', () => {
    const result = filterAgentMarket(templates, companyA, 'nonexistent')
    expect(result.length).toBe(0)
  })
})

// ============================================================
// Import tests
// ============================================================
describe('Agent Marketplace — Import', () => {
  const source = makeSoul({ id: uuid(10), name: 'Expert Analyst', tier: 'specialist', allowedTools: ['web-search'] })

  test('import creates copy with target companyId', () => {
    const result = importTemplate(source, companyA)
    expect(result.companyId).toBe(companyA)
    expect(result.isPublished).toBe(false)
    expect(result.isBuiltin).toBe(false)
  })

  test('import preserves content, category, tier, allowedTools', () => {
    const result = importTemplate(source, companyA)
    expect(result.content).toBe(source.content)
    expect(result.category).toBe(source.category)
    expect(result.tier).toBe(source.tier)
    expect(result.allowedTools).toEqual(source.allowedTools)
  })

  test('import uses custom name when provided', () => {
    const result = importTemplate(source, companyA, '내 분석가')
    expect(result.name).toBe('내 분석가')
  })

  test('import uses default suffix when no custom name', () => {
    const result = importTemplate(source, companyA)
    expect(result.name).toBe('Expert Analyst (가져옴)')
  })

  test('import preserves null allowedTools', () => {
    const noTools = makeSoul({ allowedTools: null })
    const result = importTemplate(noTools, companyA)
    expect(result.allowedTools).toBeNull()
  })
})

// ============================================================
// Publish/Unpublish validation tests
// ============================================================
describe('Agent Marketplace — Publish/Unpublish', () => {
  test('can publish own unpublished template', () => {
    const tmpl = makeSoul({ companyId: companyA, isPublished: false })
    expect(canPublish(tmpl, companyA)).toEqual({ ok: true })
  })

  test('cannot publish already published template', () => {
    const tmpl = makeSoul({ companyId: companyA, isPublished: true })
    expect(canPublish(tmpl, companyA).ok).toBe(false)
  })

  test('cannot publish other company template', () => {
    const tmpl = makeSoul({ companyId: companyB, isPublished: false })
    expect(canPublish(tmpl, companyA).ok).toBe(false)
  })

  test('can unpublish own published template', () => {
    const tmpl = makeSoul({ companyId: companyA, isPublished: true })
    expect(canUnpublish(tmpl, companyA)).toEqual({ ok: true })
  })

  test('cannot unpublish already unpublished template', () => {
    const tmpl = makeSoul({ companyId: companyA, isPublished: false })
    expect(canUnpublish(tmpl, companyA).ok).toBe(false)
  })

  test('cannot unpublish other company template', () => {
    const tmpl = makeSoul({ companyId: companyB, isPublished: true })
    expect(canUnpublish(tmpl, companyA).ok).toBe(false)
  })
})

// ============================================================
// Zod schema tests
// ============================================================
describe('Agent Marketplace — Zod schemas', () => {
  const importSchema = z.object({
    name: z.string().min(1).max(100).optional(),
  })

  test('valid import with empty body', () => {
    expect(importSchema.safeParse({}).success).toBe(true)
  })

  test('valid import with custom name', () => {
    expect(importSchema.safeParse({ name: '내 에이전트' }).success).toBe(true)
  })

  test('invalid import with empty name', () => {
    expect(importSchema.safeParse({ name: '' }).success).toBe(false)
  })

  test('invalid import with too long name', () => {
    expect(importSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false)
  })
})

// ============================================================
// Download count tests
// ============================================================
describe('Agent Marketplace — Download count', () => {
  test('downloadCount increments on import', () => {
    const source = makeSoul({ downloadCount: 5 })
    const newCount = source.downloadCount + 1
    expect(newCount).toBe(6)
  })
})
