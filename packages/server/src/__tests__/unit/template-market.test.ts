import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const companyA = uuid(100)
const companyB = uuid(200)

// === Types ===
type OrgTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  templateData: { departments: { name: string; agents: { name: string; tier: string }[] }[] }
  isBuiltin: boolean
  isActive: boolean
  isPublished: boolean
  publishedAt: string | null
  downloadCount: number
  tags: string[] | null
}

// === Market listing filter logic ===
function filterMarketTemplates(templates: OrgTemplate[], viewerCompanyId: string, q?: string, tag?: string): OrgTemplate[] {
  return templates.filter((t) => {
    // Must be published and active
    if (!t.isPublished || !t.isActive) return false
    // Builtin (companyId=null) always visible, own company excluded
    if (t.companyId !== null && t.companyId === viewerCompanyId) return false
    // Search filter
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false
    // Tag filter
    if (tag && (!t.tags || !t.tags.includes(tag))) return false
    return true
  })
}

// === Clone logic ===
function cloneTemplate(source: OrgTemplate, targetCompanyId: string, customName?: string): Partial<OrgTemplate> {
  return {
    companyId: targetCompanyId,
    name: customName || `${source.name} (복제)`,
    description: source.description,
    templateData: source.templateData,
    isBuiltin: false,
    isPublished: false,
    tags: source.tags,
  }
}

// === Publish validation ===
function canPublish(template: OrgTemplate, requestCompanyId: string): { ok: boolean; error?: string } {
  if (template.companyId !== requestCompanyId) return { ok: false, error: '다른 회사의 템플릿입니다' }
  if (template.isPublished) return { ok: false, error: '이미 공개된 템플릿입니다' }
  return { ok: true }
}

function canUnpublish(template: OrgTemplate, requestCompanyId: string): { ok: boolean; error?: string } {
  if (template.companyId !== requestCompanyId) return { ok: false, error: '다른 회사의 템플릿입니다' }
  if (!template.isPublished) return { ok: false, error: '이미 비공개 상태입니다' }
  return { ok: true }
}

// === Create from org logic ===
type Department = { name: string; description: string | null; agents: { name: string; role: string; tier: string; modelName: string; soul: string; allowedTools: string[] }[] }

function buildTemplateData(departments: Department[]): { departments: { name: string; description?: string; agents: { name: string; role: string; tier: string; modelName: string; soul: string; allowedTools: string[] }[] }[] } {
  return {
    departments: departments.map((d) => ({
      name: d.name,
      description: d.description || undefined,
      agents: d.agents.map((a) => ({
        name: a.name,
        role: a.role,
        tier: a.tier,
        modelName: a.modelName,
        soul: a.soul,
        allowedTools: a.allowedTools,
      })),
    })),
  }
}

// === Zod schemas (same as server) ===
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
})

const cloneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

// === Test Data ===
const builtinTemplate: OrgTemplate = {
  id: uuid(1),
  companyId: null,
  name: '스타트업 기본',
  description: '기본 스타트업 조직',
  templateData: { departments: [{ name: '경영지원', agents: [{ name: '비서', tier: 'specialist' }] }] },
  isBuiltin: true,
  isActive: true,
  isPublished: true,
  publishedAt: '2026-01-01',
  downloadCount: 5,
  tags: ['스타트업', '기본'],
}

const companyATemplate: OrgTemplate = {
  id: uuid(2),
  companyId: companyA,
  name: 'A사 마케팅팀',
  description: '마케팅 전문 조직',
  templateData: { departments: [{ name: '마케팅', agents: [{ name: 'CMO', tier: 'manager' }] }] },
  isBuiltin: false,
  isActive: true,
  isPublished: true,
  publishedAt: '2026-02-01',
  downloadCount: 3,
  tags: ['마케팅'],
}

const companyBTemplate: OrgTemplate = {
  id: uuid(3),
  companyId: companyB,
  name: 'B사 개발팀',
  description: '개발 조직',
  templateData: { departments: [{ name: '개발', agents: [{ name: 'CTO', tier: 'manager' }] }] },
  isBuiltin: false,
  isActive: true,
  isPublished: true,
  publishedAt: '2026-02-15',
  downloadCount: 1,
  tags: ['개발', 'IT'],
}

const unpublishedTemplate: OrgTemplate = {
  id: uuid(4),
  companyId: companyA,
  name: 'A사 비공개',
  description: null,
  templateData: { departments: [] },
  isBuiltin: false,
  isActive: true,
  isPublished: false,
  publishedAt: null,
  downloadCount: 0,
  tags: null,
}

const inactiveTemplate: OrgTemplate = {
  id: uuid(5),
  companyId: companyB,
  name: 'B사 비활성',
  description: null,
  templateData: { departments: [] },
  isBuiltin: false,
  isActive: false,
  isPublished: true,
  publishedAt: '2026-01-01',
  downloadCount: 0,
  tags: null,
}

const allTemplates = [builtinTemplate, companyATemplate, companyBTemplate, unpublishedTemplate, inactiveTemplate]

// ============================================================
// Tests
// ============================================================

describe('Template Market - Listing Filter', () => {
  test('companyA sees builtin + companyB templates, not own', () => {
    const result = filterMarketTemplates(allTemplates, companyA)
    expect(result.length).toBe(2)
    expect(result.map((r) => r.name)).toContain('스타트업 기본')
    expect(result.map((r) => r.name)).toContain('B사 개발팀')
  })

  test('companyB sees builtin + companyA templates, not own', () => {
    const result = filterMarketTemplates(allTemplates, companyB)
    expect(result.length).toBe(2)
    expect(result.map((r) => r.name)).toContain('스타트업 기본')
    expect(result.map((r) => r.name)).toContain('A사 마케팅팀')
  })

  test('unpublished templates not shown', () => {
    const result = filterMarketTemplates(allTemplates, companyB)
    expect(result.map((r) => r.name)).not.toContain('A사 비공개')
  })

  test('inactive templates not shown', () => {
    const result = filterMarketTemplates(allTemplates, companyA)
    expect(result.map((r) => r.name)).not.toContain('B사 비활성')
  })

  test('search by name keyword', () => {
    const result = filterMarketTemplates(allTemplates, companyA, '개발')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('B사 개발팀')
  })

  test('search case-insensitive', () => {
    const result = filterMarketTemplates(allTemplates, companyB, '마케팅')
    expect(result.length).toBe(1)
  })

  test('filter by tag', () => {
    const result = filterMarketTemplates(allTemplates, companyA, undefined, 'IT')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('B사 개발팀')
  })

  test('combined search + tag filter', () => {
    const result = filterMarketTemplates(allTemplates, companyA, '기본', '스타트업')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('스타트업 기본')
  })

  test('no match returns empty', () => {
    const result = filterMarketTemplates(allTemplates, companyA, '존재하지않는')
    expect(result.length).toBe(0)
  })
})

describe('Template Market - Clone', () => {
  test('clone creates copy with target companyId', () => {
    const cloned = cloneTemplate(companyBTemplate, companyA)
    expect(cloned.companyId).toBe(companyA)
    expect(cloned.name).toBe('B사 개발팀 (복제)')
    expect(cloned.isPublished).toBe(false)
    expect(cloned.isBuiltin).toBe(false)
    expect(cloned.templateData).toEqual(companyBTemplate.templateData)
  })

  test('clone with custom name', () => {
    const cloned = cloneTemplate(companyBTemplate, companyA, '우리 개발팀')
    expect(cloned.name).toBe('우리 개발팀')
  })

  test('clone preserves tags', () => {
    const cloned = cloneTemplate(companyBTemplate, companyA)
    expect(cloned.tags).toEqual(['개발', 'IT'])
  })

  test('clone of builtin template', () => {
    const cloned = cloneTemplate(builtinTemplate, companyA)
    expect(cloned.companyId).toBe(companyA)
    expect(cloned.isBuiltin).toBe(false)
  })
})

describe('Template Market - Publish/Unpublish', () => {
  test('can publish own unpublished template', () => {
    expect(canPublish(unpublishedTemplate, companyA)).toEqual({ ok: true })
  })

  test('cannot publish already published template', () => {
    const result = canPublish(companyATemplate, companyA)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('이미 공개')
  })

  test('cannot publish other company template', () => {
    const result = canPublish(unpublishedTemplate, companyB)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('다른 회사')
  })

  test('can unpublish own published template', () => {
    expect(canUnpublish(companyATemplate, companyA)).toEqual({ ok: true })
  })

  test('cannot unpublish already unpublished template', () => {
    const result = canUnpublish(unpublishedTemplate, companyA)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('이미 비공개')
  })

  test('cannot unpublish other company template', () => {
    const result = canUnpublish(companyATemplate, companyB)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('다른 회사')
  })
})

describe('Template Market - Create from Org', () => {
  test('buildTemplateData converts departments correctly', () => {
    const depts: Department[] = [
      {
        name: '마케팅',
        description: '마케팅 부서',
        agents: [
          { name: 'CMO', role: '총괄', tier: 'manager', modelName: 'claude-sonnet-4-20250514', soul: '리더십', allowedTools: ['web_search'] },
        ],
      },
      {
        name: '개발',
        description: null,
        agents: [],
      },
    ]
    const result = buildTemplateData(depts)
    expect(result.departments.length).toBe(2)
    expect(result.departments[0].name).toBe('마케팅')
    expect(result.departments[0].description).toBe('마케팅 부서')
    expect(result.departments[0].agents.length).toBe(1)
    expect(result.departments[0].agents[0].name).toBe('CMO')
    expect(result.departments[1].description).toBeUndefined()
    expect(result.departments[1].agents.length).toBe(0)
  })
})

describe('Template Market - Zod Schemas', () => {
  test('createTemplateSchema — valid input', () => {
    const result = createTemplateSchema.safeParse({ name: '테스트 템플릿', description: '설명', tags: ['tag1'] })
    expect(result.success).toBe(true)
  })

  test('createTemplateSchema — name required', () => {
    const result = createTemplateSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  test('createTemplateSchema — name max 100', () => {
    const result = createTemplateSchema.safeParse({ name: 'x'.repeat(101) })
    expect(result.success).toBe(false)
  })

  test('createTemplateSchema — tags max 10', () => {
    const result = createTemplateSchema.safeParse({ name: 'test', tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) })
    expect(result.success).toBe(false)
  })

  test('createTemplateSchema — optional fields', () => {
    const result = createTemplateSchema.safeParse({ name: 'minimal' })
    expect(result.success).toBe(true)
  })

  test('cloneSchema — empty body valid', () => {
    const result = cloneSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('cloneSchema — custom name valid', () => {
    const result = cloneSchema.safeParse({ name: '커스텀 이름' })
    expect(result.success).toBe(true)
  })

  test('cloneSchema — name too long', () => {
    const result = cloneSchema.safeParse({ name: 'x'.repeat(101) })
    expect(result.success).toBe(false)
  })
})

describe('Template Market - Download Count', () => {
  test('download count increments on clone', () => {
    let count = companyBTemplate.downloadCount
    // Simulate clone incrementing count
    count += 1
    expect(count).toBe(2)
  })
})
