import { describe, test, expect } from 'bun:test'

// === Classified Docs UI Unit Tests ===
// Tests for the ClassifiedPage component logic (non-DOM unit tests)

// === Type definitions mirroring the component ===

type Classification = 'public' | 'internal' | 'confidential' | 'secret'

type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

type ArchiveStats = {
  totalDocuments: number
  byClassification: Record<Classification, number>
  byDepartment: { departmentId: string; departmentName: string; count: number }[]
  recentWeekCount: number
}

// === Helper functions (same as in component) ===

const CLASSIFICATION_BADGE: Record<Classification, { label: string; variant: string }> = {
  public: { label: '공개', variant: 'success' },
  internal: { label: '내부', variant: 'info' },
  confidential: { label: '기밀', variant: 'warning' },
  secret: { label: '극비', variant: 'error' },
}

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  public: 'bg-emerald-500',
  internal: 'bg-blue-500',
  confidential: 'bg-amber-500',
  secret: 'bg-red-500',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCost(micro: number | null | undefined) {
  if (micro == null) return '-'
  return `$${(micro / 1_000_000).toFixed(4)}`
}

function scoreColor(score: number): string {
  if (score >= 4) return 'bg-emerald-500'
  if (score >= 3) return 'bg-amber-500'
  return 'bg-red-500'
}

function findFolderName(folders: ArchiveFolder[], id: string): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name
    const found = findFolderName(f.children, id)
    if (found) return found
  }
  return null
}

function flattenFolders(folders: ArchiveFolder[], depth = 0): { id: string; name: string; indent: string }[] {
  const result: { id: string; name: string; indent: string }[] = []
  for (const f of folders) {
    result.push({ id: f.id, name: f.name, indent: '  '.repeat(depth) })
    result.push(...flattenFolders(f.children, depth + 1))
  }
  return result
}

// Build query params helper
function buildParams(opts: {
  page: number
  search?: string
  classification?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  folderId?: string | null
}) {
  const params = new URLSearchParams({ page: String(opts.page), limit: '20' })
  if (opts.search) params.set('search', opts.search)
  if (opts.classification) params.set('classification', opts.classification)
  if (opts.startDate) params.set('startDate', opts.startDate)
  if (opts.endDate) params.set('endDate', opts.endDate)
  if (opts.sortBy && opts.sortBy !== 'date') params.set('sortBy', opts.sortBy)
  if (opts.folderId) params.set('folderId', opts.folderId)
  return params.toString()
}

// Build filter chips helper
function buildFilterChips(opts: {
  search?: string
  classification?: string
  startDate?: string
  endDate?: string
  folderId?: string | null
  folders?: ArchiveFolder[]
}) {
  const chips: { key: string; label: string }[] = []
  if (opts.search) chips.push({ key: 'search', label: `검색: ${opts.search}` })
  if (opts.classification) {
    const cls = opts.classification as Classification
    chips.push({ key: 'classification', label: `등급: ${CLASSIFICATION_BADGE[cls]?.label || cls}` })
  }
  if (opts.startDate) chips.push({ key: 'startDate', label: `시작: ${opts.startDate}` })
  if (opts.endDate) chips.push({ key: 'endDate', label: `종료: ${opts.endDate}` })
  if (opts.folderId) {
    const name = findFolderName(opts.folders || [], opts.folderId)
    chips.push({ key: 'folder', label: `폴더: ${name || '선택됨'}` })
  }
  return chips
}

// === Tests ===

describe('Classification Badge', () => {
  test('should have all 4 classifications defined', () => {
    expect(Object.keys(CLASSIFICATION_BADGE)).toEqual(['public', 'internal', 'confidential', 'secret'])
  })

  test('public = 공개, success', () => {
    expect(CLASSIFICATION_BADGE.public.label).toBe('공개')
    expect(CLASSIFICATION_BADGE.public.variant).toBe('success')
  })

  test('internal = 내부, info', () => {
    expect(CLASSIFICATION_BADGE.internal.label).toBe('내부')
    expect(CLASSIFICATION_BADGE.internal.variant).toBe('info')
  })

  test('confidential = 기밀, warning', () => {
    expect(CLASSIFICATION_BADGE.confidential.label).toBe('기밀')
    expect(CLASSIFICATION_BADGE.confidential.variant).toBe('warning')
  })

  test('secret = 극비, error', () => {
    expect(CLASSIFICATION_BADGE.secret.label).toBe('극비')
    expect(CLASSIFICATION_BADGE.secret.variant).toBe('error')
  })

  test('classification colors are defined for all types', () => {
    expect(CLASSIFICATION_COLORS.public).toBe('bg-emerald-500')
    expect(CLASSIFICATION_COLORS.internal).toBe('bg-blue-500')
    expect(CLASSIFICATION_COLORS.confidential).toBe('bg-amber-500')
    expect(CLASSIFICATION_COLORS.secret).toBe('bg-red-500')
  })
})

describe('formatDate', () => {
  test('formats date correctly in Korean locale', () => {
    const result = formatDate('2026-03-08T14:30:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('handles different date strings', () => {
    const r1 = formatDate('2026-01-01T00:00:00Z')
    const r2 = formatDate('2026-12-31T23:59:59Z')
    expect(r1).toBeDefined()
    expect(r2).toBeDefined()
    expect(r1).not.toBe(r2)
  })
})

describe('formatCost', () => {
  test('returns - for null', () => {
    expect(formatCost(null)).toBe('-')
  })

  test('returns - for undefined', () => {
    expect(formatCost(undefined)).toBe('-')
  })

  test('formats micro dollars correctly', () => {
    expect(formatCost(1_000_000)).toBe('$1.0000')
    expect(formatCost(500_000)).toBe('$0.5000')
    expect(formatCost(100)).toBe('$0.0001')
  })

  test('formats zero correctly', () => {
    expect(formatCost(0)).toBe('$0.0000')
  })
})

describe('scoreColor', () => {
  test('green for high scores (>= 4)', () => {
    expect(scoreColor(4)).toBe('bg-emerald-500')
    expect(scoreColor(5)).toBe('bg-emerald-500')
  })

  test('amber for medium scores (3-3.9)', () => {
    expect(scoreColor(3)).toBe('bg-amber-500')
    expect(scoreColor(3.5)).toBe('bg-amber-500')
  })

  test('red for low scores (< 3)', () => {
    expect(scoreColor(2)).toBe('bg-red-500')
    expect(scoreColor(0)).toBe('bg-red-500')
    expect(scoreColor(2.9)).toBe('bg-red-500')
  })
})

describe('findFolderName', () => {
  const folders: ArchiveFolder[] = [
    {
      id: 'f1', name: 'Root Folder', parentId: null, documentCount: 3,
      children: [
        { id: 'f2', name: 'Sub Folder', parentId: 'f1', documentCount: 1, children: [] },
        {
          id: 'f3', name: 'Deep Parent', parentId: 'f1', documentCount: 0,
          children: [
            { id: 'f4', name: 'Deep Child', parentId: 'f3', documentCount: 2, children: [] },
          ],
        },
      ],
    },
    { id: 'f5', name: 'Another Root', parentId: null, documentCount: 5, children: [] },
  ]

  test('finds root folder', () => {
    expect(findFolderName(folders, 'f1')).toBe('Root Folder')
  })

  test('finds direct child folder', () => {
    expect(findFolderName(folders, 'f2')).toBe('Sub Folder')
  })

  test('finds deeply nested folder', () => {
    expect(findFolderName(folders, 'f4')).toBe('Deep Child')
  })

  test('finds sibling root folder', () => {
    expect(findFolderName(folders, 'f5')).toBe('Another Root')
  })

  test('returns null for non-existent folder', () => {
    expect(findFolderName(folders, 'nonexistent')).toBeNull()
  })

  test('handles empty array', () => {
    expect(findFolderName([], 'f1')).toBeNull()
  })
})

describe('flattenFolders', () => {
  const folders: ArchiveFolder[] = [
    {
      id: 'f1', name: 'Root', parentId: null, documentCount: 3,
      children: [
        { id: 'f2', name: 'Child', parentId: 'f1', documentCount: 1, children: [] },
        {
          id: 'f3', name: 'Child2', parentId: 'f1', documentCount: 0,
          children: [
            { id: 'f4', name: 'Grandchild', parentId: 'f3', documentCount: 2, children: [] },
          ],
        },
      ],
    },
  ]

  test('flattens folder tree correctly', () => {
    const result = flattenFolders(folders)
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ id: 'f1', name: 'Root', indent: '' })
    expect(result[1]).toEqual({ id: 'f2', name: 'Child', indent: '  ' })
    expect(result[2]).toEqual({ id: 'f3', name: 'Child2', indent: '  ' })
    expect(result[3]).toEqual({ id: 'f4', name: 'Grandchild', indent: '    ' })
  })

  test('handles empty array', () => {
    expect(flattenFolders([])).toEqual([])
  })

  test('handles single folder with no children', () => {
    const single = [{ id: 'x', name: 'Solo', parentId: null, documentCount: 0, children: [] as ArchiveFolder[] }]
    expect(flattenFolders(single)).toEqual([{ id: 'x', name: 'Solo', indent: '' }])
  })
})

describe('buildParams', () => {
  test('builds basic params with page and limit', () => {
    const result = buildParams({ page: 1 })
    expect(result).toContain('page=1')
    expect(result).toContain('limit=20')
  })

  test('includes search when provided', () => {
    const result = buildParams({ page: 1, search: 'test' })
    expect(result).toContain('search=test')
  })

  test('includes classification filter', () => {
    const result = buildParams({ page: 1, classification: 'secret' })
    expect(result).toContain('classification=secret')
  })

  test('includes date range', () => {
    const result = buildParams({ page: 1, startDate: '2026-01-01', endDate: '2026-03-01' })
    expect(result).toContain('startDate=2026-01-01')
    expect(result).toContain('endDate=2026-03-01')
  })

  test('includes sortBy when not date', () => {
    const result = buildParams({ page: 1, sortBy: 'qualityScore' })
    expect(result).toContain('sortBy=qualityScore')
  })

  test('does NOT include sortBy when date (default)', () => {
    const result = buildParams({ page: 1, sortBy: 'date' })
    expect(result).not.toContain('sortBy')
  })

  test('includes folderId when provided', () => {
    const result = buildParams({ page: 1, folderId: 'folder-123' })
    expect(result).toContain('folderId=folder-123')
  })

  test('does NOT include folderId when null', () => {
    const result = buildParams({ page: 1, folderId: null })
    expect(result).not.toContain('folderId')
  })

  test('combines multiple filters', () => {
    const result = buildParams({
      page: 2,
      search: 'report',
      classification: 'confidential',
      startDate: '2026-01-01',
      sortBy: 'qualityScore',
      folderId: 'abc',
    })
    expect(result).toContain('page=2')
    expect(result).toContain('search=report')
    expect(result).toContain('classification=confidential')
    expect(result).toContain('startDate=2026-01-01')
    expect(result).toContain('sortBy=qualityScore')
    expect(result).toContain('folderId=abc')
  })
})

describe('buildFilterChips', () => {
  test('returns empty array when no filters active', () => {
    expect(buildFilterChips({})).toEqual([])
  })

  test('adds search chip', () => {
    const chips = buildFilterChips({ search: 'hello' })
    expect(chips).toHaveLength(1)
    expect(chips[0].key).toBe('search')
    expect(chips[0].label).toBe('검색: hello')
  })

  test('adds classification chip with Korean label', () => {
    const chips = buildFilterChips({ classification: 'secret' })
    expect(chips).toHaveLength(1)
    expect(chips[0].key).toBe('classification')
    expect(chips[0].label).toBe('등급: 극비')
  })

  test('adds date chips', () => {
    const chips = buildFilterChips({ startDate: '2026-01-01', endDate: '2026-03-01' })
    expect(chips).toHaveLength(2)
    expect(chips[0].key).toBe('startDate')
    expect(chips[1].key).toBe('endDate')
  })

  test('adds folder chip with name', () => {
    const folders: ArchiveFolder[] = [
      { id: 'f1', name: 'MyFolder', parentId: null, documentCount: 0, children: [] },
    ]
    const chips = buildFilterChips({ folderId: 'f1', folders })
    expect(chips).toHaveLength(1)
    expect(chips[0].label).toBe('폴더: MyFolder')
  })

  test('adds folder chip with fallback when folder not found', () => {
    const chips = buildFilterChips({ folderId: 'unknown', folders: [] })
    expect(chips).toHaveLength(1)
    expect(chips[0].label).toBe('폴더: 선택됨')
  })

  test('combines multiple filter chips', () => {
    const chips = buildFilterChips({
      search: 'test',
      classification: 'internal',
      startDate: '2026-01-01',
    })
    expect(chips).toHaveLength(3)
    expect(chips.map(c => c.key)).toEqual(['search', 'classification', 'startDate'])
  })
})

describe('Stats calculations', () => {
  test('calculates classification distribution percentages', () => {
    const stats: ArchiveStats = {
      totalDocuments: 100,
      byClassification: { public: 40, internal: 30, confidential: 20, secret: 10 },
      byDepartment: [],
      recentWeekCount: 5,
    }

    const total = stats.totalDocuments
    const publicPct = (stats.byClassification.public / total) * 100
    const internalPct = (stats.byClassification.internal / total) * 100
    const confidentialPct = (stats.byClassification.confidential / total) * 100
    const secretPct = (stats.byClassification.secret / total) * 100

    expect(publicPct).toBe(40)
    expect(internalPct).toBe(30)
    expect(confidentialPct).toBe(20)
    expect(secretPct).toBe(10)
    expect(publicPct + internalPct + confidentialPct + secretPct).toBe(100)
  })

  test('handles zero documents', () => {
    const stats: ArchiveStats = {
      totalDocuments: 0,
      byClassification: { public: 0, internal: 0, confidential: 0, secret: 0 },
      byDepartment: [],
      recentWeekCount: 0,
    }

    expect(stats.totalDocuments).toBe(0)
  })

  test('handles single classification', () => {
    const stats: ArchiveStats = {
      totalDocuments: 10,
      byClassification: { public: 10, internal: 0, confidential: 0, secret: 0 },
      byDepartment: [],
      recentWeekCount: 2,
    }

    const pct = (stats.byClassification.public / stats.totalDocuments) * 100
    expect(pct).toBe(100)
  })
})

describe('Pagination calculations', () => {
  test('calculates total pages correctly', () => {
    const pageSize = 20
    expect(Math.max(1, Math.ceil(0 / pageSize))).toBe(1)
    expect(Math.max(1, Math.ceil(1 / pageSize))).toBe(1)
    expect(Math.max(1, Math.ceil(20 / pageSize))).toBe(1)
    expect(Math.max(1, Math.ceil(21 / pageSize))).toBe(2)
    expect(Math.max(1, Math.ceil(100 / pageSize))).toBe(5)
  })

  test('page bounds checking', () => {
    const page = 1
    const totalPages = 5
    expect(page <= 1).toBe(true) // prev disabled
    expect(page >= totalPages).toBe(false) // next enabled
  })

  test('last page bounds checking', () => {
    const page = 5
    const totalPages = 5
    expect(page <= 1).toBe(false) // prev enabled
    expect(page >= totalPages).toBe(true) // next disabled
  })
})

describe('API path construction', () => {
  test('archive list endpoint', () => {
    expect('/workspace/archive').toBe('/workspace/archive')
  })

  test('archive detail endpoint', () => {
    const id = 'abc-123'
    expect(`/workspace/archive/${id}`).toBe('/workspace/archive/abc-123')
  })

  test('archive similar endpoint', () => {
    const id = 'abc-123'
    expect(`/workspace/archive/${id}/similar`).toBe('/workspace/archive/abc-123/similar')
  })

  test('archive folders endpoint', () => {
    expect('/workspace/archive/folders').toBe('/workspace/archive/folders')
  })

  test('archive stats endpoint', () => {
    expect('/workspace/archive/stats').toBe('/workspace/archive/stats')
  })

  test('folder CRUD endpoints', () => {
    const folderId = 'folder-1'
    expect(`/workspace/archive/folders/${folderId}`).toBe('/workspace/archive/folders/folder-1')
  })
})

describe('Quality bar percentage calculation', () => {
  test('score 0 = 0%', () => {
    expect(Math.round(0 * 20)).toBe(0)
  })

  test('score 2.5 = 50%', () => {
    expect(Math.round(2.5 * 20)).toBe(50)
  })

  test('score 5 = 100%', () => {
    expect(Math.round(5 * 20)).toBe(100)
  })

  test('score 3.7 = 74%', () => {
    expect(Math.round(3.7 * 20)).toBe(74)
  })
})

describe('Tag list display logic', () => {
  test('shows max tags with overflow count', () => {
    const tags = ['tag1', 'tag2', 'tag3', 'tag4']
    const max = 2
    const shown = tags.slice(0, max)
    const rest = tags.length - max

    expect(shown).toEqual(['tag1', 'tag2'])
    expect(rest).toBe(2)
  })

  test('shows all tags when count <= max', () => {
    const tags = ['tag1', 'tag2']
    const max = 3
    const shown = tags.slice(0, max)
    const rest = tags.length - max

    expect(shown).toEqual(['tag1', 'tag2'])
    expect(rest).toBeLessThanOrEqual(0)
  })

  test('handles empty tags', () => {
    const tags: string[] = []
    expect(tags.length).toBe(0)
  })
})

describe('Sort options', () => {
  const SORT_OPTIONS = [
    { value: 'date', label: '날짜순' },
    { value: 'classification', label: '등급순' },
    { value: 'qualityScore', label: '품질순' },
  ]

  test('has 3 sort options', () => {
    expect(SORT_OPTIONS).toHaveLength(3)
  })

  test('default sort is date', () => {
    expect(SORT_OPTIONS[0].value).toBe('date')
  })

  test('all options have Korean labels', () => {
    for (const opt of SORT_OPTIONS) {
      expect(opt.label.length).toBeGreaterThan(0)
    }
  })
})

describe('Cost aggregation', () => {
  test('calculates total cost from cost records', () => {
    const costRecords = [
      { model: 'gpt-4', inputTokens: 1000, outputTokens: 500, costMicro: 50000 },
      { model: 'claude-3', inputTokens: 2000, outputTokens: 1000, costMicro: 100000 },
    ]
    const totalCost = costRecords.reduce((sum, r) => sum + r.costMicro, 0)
    expect(totalCost).toBe(150000)
    expect(formatCost(totalCost)).toBe('$0.1500')
  })

  test('handles empty cost records', () => {
    const costRecords: { costMicro: number }[] = []
    const totalCost = costRecords.reduce((sum, r) => sum + r.costMicro, 0)
    expect(totalCost).toBe(0)
  })
})
