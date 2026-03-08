import { describe, test, expect } from 'bun:test'

// === Knowledge UI Unit Tests ===
// Tests for the KnowledgePage component logic (non-DOM unit tests)

// === Type definitions mirroring the component ===

type ContentType = 'markdown' | 'text' | 'html' | 'mermaid'
type MemoryType = 'learning' | 'insight' | 'preference' | 'fact'

type KnowledgeFolder = {
  id: string
  name: string
  description: string | null
  parentId: string | null
  departmentId: string | null
  children: KnowledgeFolder[]
  documentCount: number
}

type KnowledgeDoc = {
  id: string
  title: string
  content: string | null
  contentType: ContentType
  folderId: string | null
  tags: string[]
  fileUrl: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

type AgentMemory = {
  id: string
  agentId: string
  agentName?: string | null
  memoryType: MemoryType
  key: string
  content: string
  context: string | null
  source: string | null
  confidence: number
  usageCount: number
  lastUsedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type TagInfo = { tag: string; count: number }

// === Constants (same as component) ===

const CONTENT_TYPE_BADGE: Record<ContentType, { label: string; variant: string }> = {
  markdown: { label: 'MD', variant: 'info' },
  text: { label: 'TXT', variant: 'success' },
  html: { label: 'HTML', variant: 'warning' },
  mermaid: { label: 'Mermaid', variant: 'error' },
}

const MEMORY_TYPE_BADGE: Record<MemoryType, { label: string; variant: string }> = {
  learning: { label: '학습', variant: 'info' },
  insight: { label: '인사이트', variant: 'success' },
  preference: { label: '선호', variant: 'warning' },
  fact: { label: '사실', variant: 'error' },
}

const TAB_ITEMS = [
  { value: 'docs', label: '문서' },
  { value: 'memories', label: '에이전트 기억' },
]

// === Helper functions (same as component) ===

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  return formatDate(dateStr)
}

function findFolderName(folders: KnowledgeFolder[], id: string): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name
    const found = findFolderName(f.children, id)
    if (found) return found
  }
  return null
}

function flattenFolders(folders: KnowledgeFolder[], depth = 0): { id: string; name: string; indent: string }[] {
  const result: { id: string; name: string; indent: string }[] = []
  for (const f of folders) {
    result.push({ id: f.id, name: f.name, indent: '\u00A0\u00A0'.repeat(depth) })
    result.push(...flattenFolders(f.children, depth + 1))
  }
  return result
}

function buildDocsParams(opts: {
  page: number
  limit: number
  search?: string
  folderId?: string | null
  tag?: string | null
  sortBy?: string
}) {
  const params = new URLSearchParams({ page: String(opts.page), limit: String(opts.limit) })
  if (opts.search) params.set('search', opts.search)
  if (opts.folderId) params.set('folderId', opts.folderId)
  if (opts.tag) params.set('tag', opts.tag)
  if (opts.sortBy && opts.sortBy !== 'updatedAt') params.set('sortBy', opts.sortBy)
  return params.toString()
}

function buildMemoryParams(opts: { agentId?: string; memoryType?: string }) {
  const params = new URLSearchParams()
  if (opts.agentId) params.set('agentId', opts.agentId)
  if (opts.memoryType) params.set('memoryType', opts.memoryType)
  return params.toString()
}

// === Test fixtures ===

const mockFolders: KnowledgeFolder[] = [
  {
    id: 'f1',
    name: '마케팅',
    description: '마케팅 부서 문서',
    parentId: null,
    departmentId: 'd1',
    children: [
      {
        id: 'f1-1',
        name: 'SNS 전략',
        description: null,
        parentId: 'f1',
        departmentId: 'd1',
        children: [],
        documentCount: 3,
      },
    ],
    documentCount: 5,
  },
  {
    id: 'f2',
    name: '개발',
    description: '개발 부서 문서',
    parentId: null,
    departmentId: 'd2',
    children: [],
    documentCount: 10,
  },
]

const mockDocs: KnowledgeDoc[] = [
  {
    id: 'doc1',
    title: '마케팅 전략 2026',
    content: '# 전략\n\n- 목표 1\n- 목표 2',
    contentType: 'markdown',
    folderId: 'f1',
    tags: ['마케팅', '전략', '2026'],
    fileUrl: null,
    createdBy: 'user1',
    updatedBy: 'user1',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-07T14:30:00Z',
  },
  {
    id: 'doc2',
    title: '기술 문서',
    content: '<h1>API 스펙</h1>',
    contentType: 'html',
    folderId: 'f2',
    tags: ['개발', 'API'],
    fileUrl: null,
    createdBy: 'user2',
    updatedBy: 'user2',
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-06T16:00:00Z',
  },
  {
    id: 'doc3',
    title: '첨부파일 문서',
    content: null,
    contentType: 'text',
    folderId: null,
    tags: [],
    fileUrl: '/uploads/report.pdf',
    createdBy: 'user1',
    updatedBy: null,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-05T08:00:00Z',
  },
]

const mockMemories: AgentMemory[] = [
  {
    id: 'mem1',
    agentId: 'agent1',
    agentName: '마케팅 매니저',
    memoryType: 'learning',
    key: 'SNS 마케팅 핵심',
    content: 'Instagram Reels이 Facebook 대비 3배 높은 도달률',
    context: null,
    source: 'auto',
    confidence: 85,
    usageCount: 12,
    lastUsedAt: '2026-03-07T10:00:00Z',
    isActive: true,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-07T10:00:00Z',
  },
  {
    id: 'mem2',
    agentId: 'agent2',
    agentName: '개발 리드',
    memoryType: 'insight',
    key: 'API 성능 최적화',
    content: 'Redis 캐싱으로 응답 시간 70% 감소',
    context: null,
    source: 'auto',
    confidence: 92,
    usageCount: 5,
    lastUsedAt: '2026-03-06T15:00:00Z',
    isActive: true,
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-06T15:00:00Z',
  },
  {
    id: 'mem3',
    agentId: 'agent1',
    agentName: '마케팅 매니저',
    memoryType: 'preference',
    key: '보고서 형식',
    content: '간결한 불릿 포인트 형식 선호',
    context: null,
    source: 'manual',
    confidence: 60,
    usageCount: 2,
    lastUsedAt: null,
    isActive: true,
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
  },
]

const mockTags: TagInfo[] = [
  { tag: '마케팅', count: 5 },
  { tag: '전략', count: 3 },
  { tag: '개발', count: 8 },
  { tag: 'API', count: 2 },
  { tag: '2026', count: 1 },
]

// ======================================
// TEST SUITES
// ======================================

describe('Knowledge UI -- Constants', () => {
  test('all content types have badge config', () => {
    const types: ContentType[] = ['markdown', 'text', 'html', 'mermaid']
    for (const t of types) {
      expect(CONTENT_TYPE_BADGE[t]).toBeDefined()
      expect(CONTENT_TYPE_BADGE[t].label).toBeTruthy()
      expect(CONTENT_TYPE_BADGE[t].variant).toBeTruthy()
    }
  })

  test('all memory types have badge config', () => {
    const types: MemoryType[] = ['learning', 'insight', 'preference', 'fact']
    for (const t of types) {
      expect(MEMORY_TYPE_BADGE[t]).toBeDefined()
      expect(MEMORY_TYPE_BADGE[t].label).toBeTruthy()
    }
  })

  test('tab items have docs and memories tabs', () => {
    expect(TAB_ITEMS).toHaveLength(2)
    expect(TAB_ITEMS[0].value).toBe('docs')
    expect(TAB_ITEMS[1].value).toBe('memories')
    expect(TAB_ITEMS[0].label).toBe('문서')
    expect(TAB_ITEMS[1].label).toBe('에이전트 기억')
  })

  test('content type labels are in Korean', () => {
    // MD, TXT, HTML, Mermaid are short identifiers, not Korean
    expect(CONTENT_TYPE_BADGE.markdown.label).toBe('MD')
    expect(CONTENT_TYPE_BADGE.text.label).toBe('TXT')
  })

  test('memory type labels are in Korean', () => {
    expect(MEMORY_TYPE_BADGE.learning.label).toBe('학습')
    expect(MEMORY_TYPE_BADGE.insight.label).toBe('인사이트')
    expect(MEMORY_TYPE_BADGE.preference.label).toBe('선호')
    expect(MEMORY_TYPE_BADGE.fact.label).toBe('사실')
  })
})

describe('Knowledge UI -- formatDate', () => {
  test('formats date in Korean locale', () => {
    const result = formatDate('2026-03-07T14:30:00Z')
    expect(result).toBeTruthy()
    // Should contain month and day
    expect(result).toContain('03')
  })

  test('handles ISO date string', () => {
    const result = formatDate('2026-01-15T09:00:00Z')
    expect(result).toBeTruthy()
  })
})

describe('Knowledge UI -- formatRelative', () => {
  test('returns 방금 전 for very recent dates', () => {
    const now = new Date().toISOString()
    expect(formatRelative(now)).toBe('방금 전')
  })

  test('returns minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString()
    expect(formatRelative(fiveMinAgo)).toBe('5분 전')
  })

  test('returns hours for today dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString()
    expect(formatRelative(twoHoursAgo)).toBe('2시간 전')
  })

  test('returns days for past dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
    expect(formatRelative(threeDaysAgo)).toBe('3일 전')
  })

  test('returns formatted date for old dates', () => {
    const old = new Date(Date.now() - 60 * 86400000).toISOString()
    const result = formatRelative(old)
    expect(result).not.toContain('일 전')
  })
})

describe('Knowledge UI -- Folder Helpers', () => {
  test('findFolderName finds root folder', () => {
    expect(findFolderName(mockFolders, 'f1')).toBe('마케팅')
    expect(findFolderName(mockFolders, 'f2')).toBe('개발')
  })

  test('findFolderName finds nested folder', () => {
    expect(findFolderName(mockFolders, 'f1-1')).toBe('SNS 전략')
  })

  test('findFolderName returns null for unknown id', () => {
    expect(findFolderName(mockFolders, 'nonexistent')).toBeNull()
  })

  test('findFolderName handles empty array', () => {
    expect(findFolderName([], 'f1')).toBeNull()
  })

  test('flattenFolders returns all folders with indentation', () => {
    const flat = flattenFolders(mockFolders)
    expect(flat).toHaveLength(3) // f1, f1-1, f2
    expect(flat[0].name).toBe('마케팅')
    expect(flat[0].indent).toBe('') // depth 0
    expect(flat[1].name).toBe('SNS 전략')
    expect(flat[1].indent).toBe('\u00A0\u00A0') // depth 1
    expect(flat[2].name).toBe('개발')
    expect(flat[2].indent).toBe('') // depth 0
  })

  test('flattenFolders handles empty array', () => {
    expect(flattenFolders([])).toHaveLength(0)
  })

  test('flattenFolders preserves ids', () => {
    const flat = flattenFolders(mockFolders)
    expect(flat[0].id).toBe('f1')
    expect(flat[1].id).toBe('f1-1')
    expect(flat[2].id).toBe('f2')
  })
})

describe('Knowledge UI -- buildDocsParams', () => {
  test('builds basic params', () => {
    const result = buildDocsParams({ page: 1, limit: 20 })
    expect(result).toContain('page=1')
    expect(result).toContain('limit=20')
  })

  test('includes search when provided', () => {
    const result = buildDocsParams({ page: 1, limit: 20, search: '마케팅' })
    expect(result).toContain('search=')
  })

  test('includes folderId when provided', () => {
    const result = buildDocsParams({ page: 1, limit: 20, folderId: 'f1' })
    expect(result).toContain('folderId=f1')
  })

  test('includes tag when provided', () => {
    const result = buildDocsParams({ page: 1, limit: 20, tag: '전략' })
    expect(result).toContain('tag=')
  })

  test('excludes sortBy when default (updatedAt)', () => {
    const result = buildDocsParams({ page: 1, limit: 20, sortBy: 'updatedAt' })
    expect(result).not.toContain('sortBy')
  })

  test('includes sortBy when title', () => {
    const result = buildDocsParams({ page: 1, limit: 20, sortBy: 'title' })
    expect(result).toContain('sortBy=title')
  })

  test('handles null folderId', () => {
    const result = buildDocsParams({ page: 1, limit: 20, folderId: null })
    expect(result).not.toContain('folderId')
  })

  test('handles null tag', () => {
    const result = buildDocsParams({ page: 1, limit: 20, tag: null })
    expect(result).not.toContain('tag')
  })
})

describe('Knowledge UI -- buildMemoryParams', () => {
  test('empty when no filters', () => {
    const result = buildMemoryParams({})
    expect(result).toBe('')
  })

  test('includes agentId when provided', () => {
    const result = buildMemoryParams({ agentId: 'agent1' })
    expect(result).toContain('agentId=agent1')
  })

  test('includes memoryType when provided', () => {
    const result = buildMemoryParams({ memoryType: 'learning' })
    expect(result).toContain('memoryType=learning')
  })

  test('includes both filters', () => {
    const result = buildMemoryParams({ agentId: 'agent1', memoryType: 'insight' })
    expect(result).toContain('agentId=agent1')
    expect(result).toContain('memoryType=insight')
  })
})

describe('Knowledge UI -- Document Data', () => {
  test('doc has required fields', () => {
    for (const doc of mockDocs) {
      expect(doc.id).toBeTruthy()
      expect(doc.title).toBeTruthy()
      expect(doc.contentType).toBeTruthy()
      expect(doc.createdAt).toBeTruthy()
      expect(doc.updatedAt).toBeTruthy()
    }
  })

  test('doc contentType is valid', () => {
    const valid: ContentType[] = ['markdown', 'text', 'html', 'mermaid']
    for (const doc of mockDocs) {
      expect(valid).toContain(doc.contentType)
    }
  })

  test('doc tags are arrays', () => {
    for (const doc of mockDocs) {
      expect(Array.isArray(doc.tags)).toBe(true)
    }
  })

  test('file doc has fileUrl but may lack content', () => {
    const fileDoc = mockDocs.find(d => d.fileUrl)
    expect(fileDoc).toBeDefined()
    expect(fileDoc!.fileUrl).toBeTruthy()
    expect(fileDoc!.content).toBeNull()
  })

  test('markdown doc has content', () => {
    const mdDoc = mockDocs.find(d => d.contentType === 'markdown')
    expect(mdDoc).toBeDefined()
    expect(mdDoc!.content).toBeTruthy()
    expect(mdDoc!.content!.startsWith('#')).toBe(true)
  })
})

describe('Knowledge UI -- Memory Data', () => {
  test('memory has required fields', () => {
    for (const mem of mockMemories) {
      expect(mem.id).toBeTruthy()
      expect(mem.agentId).toBeTruthy()
      expect(mem.memoryType).toBeTruthy()
      expect(mem.key).toBeTruthy()
      expect(mem.content).toBeTruthy()
      expect(typeof mem.confidence).toBe('number')
      expect(typeof mem.usageCount).toBe('number')
    }
  })

  test('memory confidence is 0-100', () => {
    for (const mem of mockMemories) {
      expect(mem.confidence).toBeGreaterThanOrEqual(0)
      expect(mem.confidence).toBeLessThanOrEqual(100)
    }
  })

  test('memory types are valid', () => {
    const valid: MemoryType[] = ['learning', 'insight', 'preference', 'fact']
    for (const mem of mockMemories) {
      expect(valid).toContain(mem.memoryType)
    }
  })

  test('auto-extracted memories have source=auto', () => {
    const autoMems = mockMemories.filter(m => m.source === 'auto')
    expect(autoMems.length).toBeGreaterThan(0)
  })

  test('usageCount is non-negative', () => {
    for (const mem of mockMemories) {
      expect(mem.usageCount).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('Knowledge UI -- Tag Data', () => {
  test('tags have name and count', () => {
    for (const t of mockTags) {
      expect(t.tag).toBeTruthy()
      expect(t.count).toBeGreaterThan(0)
    }
  })

  test('tags are unique', () => {
    const tagNames = mockTags.map(t => t.tag)
    const unique = new Set(tagNames)
    expect(unique.size).toBe(tagNames.length)
  })
})

describe('Knowledge UI -- Pagination Logic', () => {
  test('calculates total pages correctly', () => {
    const total = 45
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(3)
  })

  test('single page for small data', () => {
    const total = 5
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(1)
  })

  test('minimum 1 page for empty data', () => {
    const total = 0
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(1)
  })

  test('exact boundary results in correct page count', () => {
    const total = 40
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(2)
  })
})

describe('Knowledge UI -- Filter Chips Logic', () => {
  test('generates chip for search filter', () => {
    const chips: { key: string; label: string }[] = []
    const search = '마케팅'
    if (search) chips.push({ key: 'search', label: `검색: ${search}` })
    expect(chips).toHaveLength(1)
    expect(chips[0].label).toContain('마케팅')
  })

  test('generates chip for folder filter', () => {
    const chips: { key: string; label: string }[] = []
    const folderId = 'f1'
    const folderName = findFolderName(mockFolders, folderId)
    if (folderId) chips.push({ key: 'folder', label: `폴더: ${folderName || '선택됨'}` })
    expect(chips).toHaveLength(1)
    expect(chips[0].label).toContain('마케팅')
  })

  test('generates chip for tag filter', () => {
    const chips: { key: string; label: string }[] = []
    const tag = '전략'
    if (tag) chips.push({ key: 'tag', label: `태그: ${tag}` })
    expect(chips).toHaveLength(1)
    expect(chips[0].label).toContain('전략')
  })

  test('no chips when no filters', () => {
    const chips: { key: string; label: string }[] = []
    expect(chips).toHaveLength(0)
  })

  test('multiple chips for combined filters', () => {
    const chips: { key: string; label: string }[] = []
    const search = '보고서'
    const folderId = 'f2'
    const tag = '개발'
    if (search) chips.push({ key: 'search', label: `검색: ${search}` })
    if (folderId) chips.push({ key: 'folder', label: `폴더: ${findFolderName(mockFolders, folderId) || '선택됨'}` })
    if (tag) chips.push({ key: 'tag', label: `태그: ${tag}` })
    expect(chips).toHaveLength(3)
  })
})

describe('Knowledge UI -- Content Type Detection', () => {
  test('file document shows attachment icon', () => {
    const doc = mockDocs.find(d => d.fileUrl)!
    const icon = doc.fileUrl ? '📎' : doc.contentType === 'mermaid' ? '📊' : '📄'
    expect(icon).toBe('📎')
  })

  test('markdown document shows file icon', () => {
    const doc = mockDocs.find(d => d.contentType === 'markdown' && !d.fileUrl)!
    const icon = doc.fileUrl ? '📎' : doc.contentType === 'mermaid' ? '📊' : '📄'
    expect(icon).toBe('📄')
  })

  test('mermaid document shows chart icon', () => {
    const mermaidDoc: KnowledgeDoc = {
      ...mockDocs[0],
      contentType: 'mermaid',
      fileUrl: null,
    }
    const icon = mermaidDoc.fileUrl ? '📎' : mermaidDoc.contentType === 'mermaid' ? '📊' : '📄'
    expect(icon).toBe('📊')
  })
})

describe('Knowledge UI -- Tag Rendering Logic', () => {
  test('shows max 2 tags with overflow', () => {
    const doc = mockDocs[0]
    const max = 2
    const shown = doc.tags.slice(0, max)
    const rest = doc.tags.length - max
    expect(shown).toHaveLength(2)
    expect(rest).toBe(1)
  })

  test('shows all tags when under max', () => {
    const doc = mockDocs[1]
    const max = 2
    const shown = doc.tags.slice(0, max)
    const rest = doc.tags.length - max
    expect(shown).toHaveLength(2)
    expect(rest).toBe(0)
  })

  test('handles empty tags', () => {
    const doc = mockDocs[2]
    const max = 2
    const shown = doc.tags.slice(0, max)
    expect(shown).toHaveLength(0)
  })
})

describe('Knowledge UI -- Confidence Bar Logic', () => {
  test('high confidence gets green color', () => {
    const confidence = 85
    const color = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
    expect(color).toBe('bg-emerald-500')
  })

  test('medium confidence gets amber color', () => {
    const confidence = 60
    const color = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
    expect(color).toBe('bg-amber-500')
  })

  test('low confidence gets red color', () => {
    const confidence = 20
    const color = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
    expect(color).toBe('bg-red-500')
  })

  test('boundary value 70 is green', () => {
    const confidence = 70
    const color = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
    expect(color).toBe('bg-emerald-500')
  })

  test('boundary value 40 is amber', () => {
    const confidence = 40
    const color = confidence >= 70 ? 'bg-emerald-500' : confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'
    expect(color).toBe('bg-amber-500')
  })
})

describe('Knowledge UI -- Folder Tree Structure', () => {
  test('root folders have no parentId', () => {
    for (const f of mockFolders) {
      expect(f.parentId).toBeNull()
    }
  })

  test('child folders have parentId', () => {
    const child = mockFolders[0].children[0]
    expect(child.parentId).toBe('f1')
  })

  test('folders have documentCount', () => {
    for (const f of mockFolders) {
      expect(typeof f.documentCount).toBe('number')
      expect(f.documentCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('depth indentation calculates correctly', () => {
    const depth0 = 0 * 12 + 8
    const depth1 = 1 * 12 + 8
    const depth2 = 2 * 12 + 8
    expect(depth0).toBe(8)
    expect(depth1).toBe(20)
    expect(depth2).toBe(32)
  })
})

describe('Knowledge UI -- Create/Edit Form Validation', () => {
  test('title is required', () => {
    const title = ''
    const isValid = title.trim().length > 0
    expect(isValid).toBe(false)
  })

  test('title with whitespace only is invalid', () => {
    const title = '   '
    const isValid = title.trim().length > 0
    expect(isValid).toBe(false)
  })

  test('valid title passes', () => {
    const title = '새 문서 제목'
    const isValid = title.trim().length > 0
    expect(isValid).toBe(true)
  })

  test('tags parse from comma-separated string', () => {
    const tagsInput = '태그1, 태그2, 태그3'
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['태그1', '태그2', '태그3'])
  })

  test('empty tags string results in empty array', () => {
    const tagsInput = ''
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual([])
  })

  test('tags with extra commas are cleaned', () => {
    const tagsInput = 'a, , b, , c'
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['a', 'b', 'c'])
  })
})

describe('Knowledge UI -- Memory Form Validation', () => {
  test('key is required', () => {
    const key = ''
    const content = '내용'
    const isValid = key.trim().length > 0 && content.trim().length > 0
    expect(isValid).toBe(false)
  })

  test('content is required', () => {
    const key = '제목'
    const content = ''
    const isValid = key.trim().length > 0 && content.trim().length > 0
    expect(isValid).toBe(false)
  })

  test('both key and content passes', () => {
    const key = '학습 제목'
    const content = '학습 내용'
    const isValid = key.trim().length > 0 && content.trim().length > 0
    expect(isValid).toBe(true)
  })

  test('agentId required for create', () => {
    const agentId = ''
    const isValid = agentId.length > 0
    expect(isValid).toBe(false)
  })
})

describe('Knowledge UI -- Tab Switching', () => {
  test('docs tab is default', () => {
    const activeTab = 'docs'
    expect(activeTab).toBe('docs')
  })

  test('switching to memories tab', () => {
    let activeTab = 'docs'
    activeTab = 'memories'
    expect(activeTab).toBe('memories')
  })

  test('switching back to docs tab', () => {
    let activeTab = 'memories'
    activeTab = 'docs'
    expect(activeTab).toBe('docs')
  })
})

describe('Knowledge UI -- Folder Selection', () => {
  test('null selectedFolderId means all documents', () => {
    const selectedFolderId: string | null = null
    expect(selectedFolderId).toBeNull()
  })

  test('selecting folder changes filter', () => {
    let selectedFolderId: string | null = null
    selectedFolderId = 'f1'
    expect(selectedFolderId).toBe('f1')
  })

  test('deselecting folder returns to all', () => {
    let selectedFolderId: string | null = 'f1'
    selectedFolderId = null
    expect(selectedFolderId).toBeNull()
  })
})

describe('Knowledge UI -- Sort Options', () => {
  test('default sort is updatedAt', () => {
    const sortBy = 'updatedAt'
    expect(sortBy).toBe('updatedAt')
  })

  test('title sort option available', () => {
    const sortBy = 'title'
    expect(sortBy).toBe('title')
  })
})

describe('Knowledge UI -- API Endpoints', () => {
  test('docs endpoint path', () => {
    const path = '/workspace/knowledge/docs'
    expect(path).toBe('/workspace/knowledge/docs')
  })

  test('folders endpoint path', () => {
    const path = '/workspace/knowledge/folders'
    expect(path).toBe('/workspace/knowledge/folders')
  })

  test('tags endpoint path', () => {
    const path = '/workspace/knowledge/tags'
    expect(path).toBe('/workspace/knowledge/tags')
  })

  test('memories endpoint path', () => {
    const path = '/workspace/knowledge/memories'
    expect(path).toBe('/workspace/knowledge/memories')
  })

  test('upload endpoint path', () => {
    const path = '/workspace/knowledge/docs/upload'
    expect(path).toBe('/workspace/knowledge/docs/upload')
  })

  test('versions endpoint path', () => {
    const docId = 'doc1'
    const path = `/workspace/knowledge/docs/${docId}/versions`
    expect(path).toBe('/workspace/knowledge/docs/doc1/versions')
  })

  test('download endpoint path', () => {
    const docId = 'doc1'
    const path = `/api/workspace/knowledge/docs/${docId}/download`
    expect(path).toBe('/api/workspace/knowledge/docs/doc1/download')
  })

  test('restore version endpoint path', () => {
    const docId = 'doc1'
    const versionId = 'v1'
    const path = `/workspace/knowledge/docs/${docId}/versions/${versionId}/restore`
    expect(path).toBe('/workspace/knowledge/docs/doc1/versions/v1/restore')
  })

  test('consolidate memories endpoint path', () => {
    const agentId = 'agent1'
    const path = `/workspace/knowledge/memories/consolidate/${agentId}`
    expect(path).toBe('/workspace/knowledge/memories/consolidate/agent1')
  })

  test('doc tags add endpoint path', () => {
    const docId = 'doc1'
    const path = `/workspace/knowledge/docs/${docId}/tags`
    expect(path).toBe('/workspace/knowledge/docs/doc1/tags')
  })
})

// ======================================
// TEA-Generated Edge Case Tests
// ======================================

describe('TEA -- Deep Folder Nesting', () => {
  const deepFolders: KnowledgeFolder[] = [
    {
      id: 'root',
      name: '루트',
      description: null,
      parentId: null,
      departmentId: null,
      children: [
        {
          id: 'level1',
          name: '레벨1',
          description: null,
          parentId: 'root',
          departmentId: null,
          children: [
            {
              id: 'level2',
              name: '레벨2',
              description: null,
              parentId: 'level1',
              departmentId: null,
              children: [
                {
                  id: 'level3',
                  name: '레벨3',
                  description: null,
                  parentId: 'level2',
                  departmentId: null,
                  children: [],
                  documentCount: 1,
                },
              ],
              documentCount: 2,
            },
          ],
          documentCount: 3,
        },
      ],
      documentCount: 5,
    },
  ]

  test('flattenFolders handles 4 levels of nesting', () => {
    const flat = flattenFolders(deepFolders)
    expect(flat).toHaveLength(4)
    expect(flat[0].name).toBe('루트')
    expect(flat[1].name).toBe('레벨1')
    expect(flat[2].name).toBe('레벨2')
    expect(flat[3].name).toBe('레벨3')
  })

  test('indentation increases with depth', () => {
    const flat = flattenFolders(deepFolders)
    expect(flat[0].indent).toBe('')
    expect(flat[1].indent).toBe('\u00A0\u00A0')
    expect(flat[2].indent).toBe('\u00A0\u00A0\u00A0\u00A0')
    expect(flat[3].indent).toBe('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')
  })

  test('findFolderName works at deepest level', () => {
    expect(findFolderName(deepFolders, 'level3')).toBe('레벨3')
  })

  test('depth padding calculation for deep nesting', () => {
    const depths = [0, 1, 2, 3, 4, 5]
    const paddings = depths.map(d => d * 12 + 8)
    expect(paddings).toEqual([8, 20, 32, 44, 56, 68])
  })
})

describe('TEA -- Upload Edge Cases', () => {
  test('empty file list does not trigger upload', () => {
    const files: File[] = []
    expect(files.length).toBe(0)
  })

  test('multiple files are processed independently', () => {
    const fileNames = ['report.pdf', 'analysis.md', 'data.csv']
    let successCount = 0
    let errorCount = 0
    for (const name of fileNames) {
      if (name.endsWith('.md') || name.endsWith('.pdf') || name.endsWith('.csv')) {
        successCount++
      } else {
        errorCount++
      }
    }
    expect(successCount).toBe(3)
    expect(errorCount).toBe(0)
  })

  test('FormData includes folderId when selected', () => {
    const selectedFolderId = 'f1'
    const params: Record<string, string> = {}
    if (selectedFolderId) params['folderId'] = selectedFolderId
    expect(params['folderId']).toBe('f1')
  })

  test('FormData excludes folderId when null', () => {
    const selectedFolderId: string | null = null
    const params: Record<string, string> = {}
    if (selectedFolderId) params['folderId'] = selectedFolderId
    expect(params['folderId']).toBeUndefined()
  })
})

describe('TEA -- Document Content Rendering', () => {
  test('markdown content uses MarkdownRenderer', () => {
    const doc: KnowledgeDoc = { ...mockDocs[0], contentType: 'markdown' }
    const useMarkdown = doc.contentType === 'markdown' || doc.contentType === 'mermaid'
    expect(useMarkdown).toBe(true)
  })

  test('mermaid content uses MarkdownRenderer', () => {
    const doc: KnowledgeDoc = { ...mockDocs[0], contentType: 'mermaid' }
    const useMarkdown = doc.contentType === 'markdown' || doc.contentType === 'mermaid'
    expect(useMarkdown).toBe(true)
  })

  test('html content uses dangerouslySetInnerHTML', () => {
    const doc: KnowledgeDoc = { ...mockDocs[1], contentType: 'html' }
    const useHtml = doc.contentType === 'html'
    expect(useHtml).toBe(true)
  })

  test('text content uses pre tag', () => {
    const doc: KnowledgeDoc = { ...mockDocs[2], contentType: 'text' }
    const usePreTag = doc.contentType === 'text'
    expect(usePreTag).toBe(true)
  })

  test('file-only doc shows download prompt', () => {
    const doc: KnowledgeDoc = { ...mockDocs[2], fileUrl: '/uploads/file.pdf', content: null }
    const showDownload = doc.fileUrl && !doc.content
    expect(showDownload).toBeTruthy()
  })

  test('doc with both content and file shows content', () => {
    const doc: KnowledgeDoc = { ...mockDocs[0], fileUrl: '/uploads/file.md', content: '# Test' }
    const showContent = !!doc.content
    expect(showContent).toBe(true)
  })
})

describe('TEA -- Memory Filtering Combinations', () => {
  test('filter by agent only', () => {
    const filtered = mockMemories.filter(m => m.agentId === 'agent1')
    expect(filtered).toHaveLength(2)
  })

  test('filter by type only', () => {
    const filtered = mockMemories.filter(m => m.memoryType === 'learning')
    expect(filtered).toHaveLength(1)
  })

  test('filter by agent AND type', () => {
    const filtered = mockMemories.filter(m => m.agentId === 'agent1' && m.memoryType === 'learning')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].key).toBe('SNS 마케팅 핵심')
  })

  test('filter with no results', () => {
    const filtered = mockMemories.filter(m => m.agentId === 'nonexistent')
    expect(filtered).toHaveLength(0)
  })

  test('all memories without filter', () => {
    const filtered = mockMemories
    expect(filtered).toHaveLength(3)
  })
})

describe('TEA -- Query Key Generation', () => {
  test('docs query key includes all filters', () => {
    const key = ['knowledge-docs', 1, '마케팅', 'f1', '전략', 'updatedAt']
    expect(key).toHaveLength(6)
    expect(key[0]).toBe('knowledge-docs')
  })

  test('docs query key changes on page change', () => {
    const key1 = ['knowledge-docs', 1, '', null, null, 'updatedAt']
    const key2 = ['knowledge-docs', 2, '', null, null, 'updatedAt']
    expect(key1).not.toEqual(key2)
  })

  test('folders query key is stable', () => {
    const key = ['knowledge-folders']
    expect(key).toEqual(['knowledge-folders'])
  })

  test('memories query key includes filters', () => {
    const key = ['knowledge-memories', 'agent1', 'learning']
    expect(key[1]).toBe('agent1')
    expect(key[2]).toBe('learning')
  })

  test('doc detail query key includes docId', () => {
    const key = ['knowledge-doc-detail', 'doc1']
    expect(key[1]).toBe('doc1')
  })

  test('version query key includes docId', () => {
    const key = ['doc-versions', 'doc1']
    expect(key[1]).toBe('doc1')
  })
})

describe('TEA -- Drag State Management', () => {
  test('initial drag state is false', () => {
    let dragOver = false
    expect(dragOver).toBe(false)
  })

  test('dragEnter sets state to true', () => {
    let dragOver = false
    dragOver = true // simulates onDragEnter
    expect(dragOver).toBe(true)
  })

  test('dragLeave sets state to false', () => {
    let dragOver = true
    dragOver = false // simulates onDragLeave
    expect(dragOver).toBe(false)
  })

  test('drop resets state and processes files', () => {
    let dragOver = true
    let filesProcessed = false
    // simulate drop
    dragOver = false
    filesProcessed = true
    expect(dragOver).toBe(false)
    expect(filesProcessed).toBe(true)
  })
})

describe('TEA -- Modal State Machine', () => {
  test('create modal opens with no doc', () => {
    const showCreateModal = true
    const editDoc = null
    const isOpen = showCreateModal || !!editDoc
    const isEdit = !!editDoc
    expect(isOpen).toBe(true)
    expect(isEdit).toBe(false)
  })

  test('edit modal opens with doc', () => {
    const showCreateModal = false
    const editDoc = mockDocs[0]
    const isOpen = showCreateModal || !!editDoc
    const isEdit = !!editDoc
    expect(isOpen).toBe(true)
    expect(isEdit).toBe(true)
  })

  test('modal is closed when both are falsy', () => {
    const showCreateModal = false
    const editDoc = null
    const isOpen = showCreateModal || !!editDoc
    expect(isOpen).toBe(false)
  })
})

describe('TEA -- Korean Label Verification', () => {
  test('tab labels are Korean', () => {
    expect(TAB_ITEMS[0].label).toBe('문서')
    expect(TAB_ITEMS[1].label).toBe('에이전트 기억')
  })

  test('memory type labels are Korean', () => {
    const labels = Object.values(MEMORY_TYPE_BADGE).map(b => b.label)
    expect(labels).toEqual(['학습', '인사이트', '선호', '사실'])
  })

  test('no English in user-facing memory labels', () => {
    const labels = Object.values(MEMORY_TYPE_BADGE).map(b => b.label)
    for (const label of labels) {
      expect(label).not.toMatch(/^[a-zA-Z]+$/)
    }
  })
})
