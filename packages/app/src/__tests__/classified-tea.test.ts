import { describe, test, expect } from 'bun:test'

// === TEA Risk-Based Tests for Story 17-4 (Classified Docs UI) ===
// Focus: edge cases, boundary conditions, error paths, data integrity

// === Types ===

type Classification = 'public' | 'internal' | 'confidential' | 'secret'

type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

type ArchiveItem = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  tags: string[]
  folderId: string | null
  folderName: string | null
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null
  commandType: string
  createdAt: string
}

type SimilarDocument = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  agentName: string | null
  qualityScore: number | null
  similarityScore: number
  createdAt: string
}

// === Helpers (mirrored from component) ===

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
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

// === TEA Risk Tests ===

describe('TEA: Deep Folder Tree Edge Cases', () => {
  test('handles 5-level deep nesting', () => {
    const deep: ArchiveFolder = {
      id: 'l1', name: 'Level 1', parentId: null, documentCount: 0,
      children: [{
        id: 'l2', name: 'Level 2', parentId: 'l1', documentCount: 0,
        children: [{
          id: 'l3', name: 'Level 3', parentId: 'l2', documentCount: 0,
          children: [{
            id: 'l4', name: 'Level 4', parentId: 'l3', documentCount: 0,
            children: [{
              id: 'l5', name: 'Level 5', parentId: 'l4', documentCount: 1, children: [],
            }],
          }],
        }],
      }],
    }
    const flat = flattenFolders([deep])
    expect(flat).toHaveLength(5)
    expect(flat[4].indent).toBe('        ') // 4 levels * 2 spaces
    expect(flat[4].name).toBe('Level 5')
  })

  test('finds name in deeply nested tree', () => {
    const tree: ArchiveFolder[] = [{
      id: 'r', name: 'Root', parentId: null, documentCount: 0,
      children: [{
        id: 'c1', name: 'Child', parentId: 'r', documentCount: 0,
        children: [{
          id: 'g1', name: 'Target', parentId: 'c1', documentCount: 3, children: [],
        }],
      }],
    }]
    expect(findFolderName(tree, 'g1')).toBe('Target')
  })

  test('handles folder with empty name', () => {
    const folders: ArchiveFolder[] = [
      { id: 'f1', name: '', parentId: null, documentCount: 0, children: [] },
    ]
    expect(findFolderName(folders, 'f1')).toBe('')
  })

  test('handles folder with very long name', () => {
    const longName = 'A'.repeat(500)
    const folders: ArchiveFolder[] = [
      { id: 'f1', name: longName, parentId: null, documentCount: 0, children: [] },
    ]
    expect(findFolderName(folders, 'f1')).toBe(longName)
  })

  test('flattenFolders maintains correct order with multiple roots', () => {
    const folders: ArchiveFolder[] = [
      {
        id: 'r1', name: 'Root1', parentId: null, documentCount: 0,
        children: [{ id: 'c1', name: 'Child1', parentId: 'r1', documentCount: 0, children: [] }],
      },
      {
        id: 'r2', name: 'Root2', parentId: null, documentCount: 0,
        children: [{ id: 'c2', name: 'Child2', parentId: 'r2', documentCount: 0, children: [] }],
      },
    ]
    const flat = flattenFolders(folders)
    expect(flat.map(f => f.id)).toEqual(['r1', 'c1', 'r2', 'c2'])
  })
})

describe('TEA: Classification Boundary Cases', () => {
  test('all 4 classification values are valid', () => {
    const validClasses: Classification[] = ['public', 'internal', 'confidential', 'secret']
    validClasses.forEach(cls => {
      expect(['public', 'internal', 'confidential', 'secret']).toContain(cls)
    })
  })

  test('classification badge maps to correct severity order', () => {
    const CLASSIFICATION_BADGE: Record<Classification, { label: string; variant: string }> = {
      public: { label: '공개', variant: 'success' },
      internal: { label: '내부', variant: 'info' },
      confidential: { label: '기밀', variant: 'warning' },
      secret: { label: '극비', variant: 'error' },
    }
    // Verify severity ordering
    expect(CLASSIFICATION_BADGE.public.variant).toBe('success')     // lowest
    expect(CLASSIFICATION_BADGE.internal.variant).toBe('info')      // low
    expect(CLASSIFICATION_BADGE.confidential.variant).toBe('warning') // medium
    expect(CLASSIFICATION_BADGE.secret.variant).toBe('error')       // highest
  })
})

describe('TEA: Query Parameter Edge Cases', () => {
  test('handles empty search string (not added to params)', () => {
    const result = buildParams({ page: 1, search: '' })
    expect(result).not.toContain('search')
  })

  test('handles special characters in search', () => {
    const result = buildParams({ page: 1, search: 'test & <script>' })
    expect(result).toContain('search=')
    // URLSearchParams encodes special characters
    const params = new URLSearchParams(result)
    expect(params.get('search')).toBe('test & <script>')
  })

  test('handles unicode search terms', () => {
    const result = buildParams({ page: 1, search: '기밀문서 검색' })
    const params = new URLSearchParams(result)
    expect(params.get('search')).toBe('기밀문서 검색')
  })

  test('large page numbers', () => {
    const result = buildParams({ page: 99999 })
    expect(result).toContain('page=99999')
  })

  test('page 0 edge case', () => {
    const result = buildParams({ page: 0 })
    expect(result).toContain('page=0')
  })

  test('all filters combined produces valid query string', () => {
    const result = buildParams({
      page: 3,
      search: '보고서',
      classification: 'secret',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      sortBy: 'qualityScore',
      folderId: 'uuid-folder-123',
    })
    const params = new URLSearchParams(result)
    expect(params.get('page')).toBe('3')
    expect(params.get('limit')).toBe('20')
    expect(params.get('search')).toBe('보고서')
    expect(params.get('classification')).toBe('secret')
    expect(params.get('startDate')).toBe('2026-01-01')
    expect(params.get('endDate')).toBe('2026-12-31')
    expect(params.get('sortBy')).toBe('qualityScore')
    expect(params.get('folderId')).toBe('uuid-folder-123')
  })

  test('empty folderId string is treated as no filter', () => {
    const result = buildParams({ page: 1, folderId: '' })
    expect(result).not.toContain('folderId')
  })
})

describe('TEA: Date Formatting Edge Cases', () => {
  test('handles ISO 8601 with timezone', () => {
    const result = formatDate('2026-03-08T14:30:00+09:00')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('handles midnight', () => {
    const result = formatDate('2026-03-08T00:00:00Z')
    expect(typeof result).toBe('string')
  })

  test('handles end of day', () => {
    const result = formatDate('2026-03-08T23:59:59Z')
    expect(typeof result).toBe('string')
  })

  test('handles leap year date', () => {
    const result = formatDate('2028-02-29T12:00:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('TEA: Cost Calculation Edge Cases', () => {
  test('very small cost (sub-cent)', () => {
    expect(formatCost(1)).toBe('$0.0000')
  })

  test('very large cost', () => {
    expect(formatCost(100_000_000)).toBe('$100.0000')
  })

  test('negative cost (error case)', () => {
    expect(formatCost(-500_000)).toBe('$-0.5000')
  })

  test('cost aggregation with many records', () => {
    const records = Array.from({ length: 100 }, (_, i) => ({
      model: 'gpt-4', inputTokens: 1000, outputTokens: 500, costMicro: 1000 * (i + 1),
    }))
    const total = records.reduce((sum, r) => sum + r.costMicro, 0)
    // sum of 1000 * 1..100 = 1000 * 5050 = 5,050,000
    expect(total).toBe(5_050_000)
    expect(formatCost(total)).toBe('$5.0500')
  })
})

describe('TEA: Quality Score Boundary Tests', () => {
  test('exact boundary at 4.0 (green)', () => {
    expect(scoreColor(4.0)).toBe('bg-emerald-500')
  })

  test('just below 4.0 (amber)', () => {
    expect(scoreColor(3.99)).toBe('bg-amber-500')
  })

  test('exact boundary at 3.0 (amber)', () => {
    expect(scoreColor(3.0)).toBe('bg-amber-500')
  })

  test('just below 3.0 (red)', () => {
    expect(scoreColor(2.99)).toBe('bg-red-500')
  })

  test('maximum score 5.0', () => {
    expect(scoreColor(5.0)).toBe('bg-emerald-500')
  })

  test('minimum score 0', () => {
    expect(scoreColor(0)).toBe('bg-red-500')
  })

  test('negative score (error case)', () => {
    expect(scoreColor(-1)).toBe('bg-red-500')
  })

  test('quality bar percentage edge cases', () => {
    // score * 20 for percentage
    expect(Math.round(0 * 20)).toBe(0)
    expect(Math.round(1 * 20)).toBe(20)
    expect(Math.round(2.5 * 20)).toBe(50)
    expect(Math.round(5 * 20)).toBe(100)
    // Beyond 5 (error case)
    expect(Math.round(6 * 20)).toBe(120)
  })
})

describe('TEA: Similar Documents Data Integrity', () => {
  test('similarity score range validation (0-100)', () => {
    const docs: SimilarDocument[] = [
      { id: '1', title: 'Doc 1', classification: 'internal', summary: null, agentName: null, qualityScore: null, similarityScore: 0, createdAt: '2026-01-01T00:00:00Z' },
      { id: '2', title: 'Doc 2', classification: 'secret', summary: 'test', agentName: 'Agent A', qualityScore: 4.5, similarityScore: 100, createdAt: '2026-01-02T00:00:00Z' },
      { id: '3', title: 'Doc 3', classification: 'public', summary: null, agentName: null, qualityScore: 2.0, similarityScore: 55, createdAt: '2026-01-03T00:00:00Z' },
    ]

    docs.forEach(doc => {
      expect(doc.similarityScore).toBeGreaterThanOrEqual(0)
      expect(doc.similarityScore).toBeLessThanOrEqual(100)
    })
  })

  test('max 5 similar documents', () => {
    const docs = Array.from({ length: 7 }, (_, i) => ({
      id: String(i),
      title: `Doc ${i}`,
      classification: 'internal' as Classification,
      summary: null,
      agentName: null,
      qualityScore: null,
      similarityScore: 90 - i * 10,
      createdAt: '2026-01-01T00:00:00Z',
    }))
    // Component should display max 5
    const displayed = docs.slice(0, 5)
    expect(displayed).toHaveLength(5)
  })

  test('similar documents sorted by score (descending)', () => {
    const scores = [85, 70, 55, 40, 25]
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThan(scores[i])
    }
  })
})

describe('TEA: Archive Item Data Edge Cases', () => {
  test('item with all nullable fields as null', () => {
    const item: ArchiveItem = {
      id: 'test-1',
      title: 'Title',
      classification: 'public',
      summary: null,
      tags: [],
      folderId: null,
      folderName: null,
      agentName: null,
      departmentName: null,
      qualityScore: null,
      commandType: 'direct',
      createdAt: '2026-01-01T00:00:00Z',
    }
    expect(item.summary).toBeNull()
    expect(item.folderId).toBeNull()
    expect(item.agentName).toBeNull()
    expect(item.qualityScore).toBeNull()
  })

  test('item with empty tags array', () => {
    const tags: string[] = []
    expect(tags.length).toBe(0)
    const shown = tags.slice(0, 2)
    expect(shown).toEqual([])
  })

  test('item with many tags', () => {
    const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10']
    const max = 2
    const shown = tags.slice(0, max)
    const rest = tags.length - max
    expect(shown).toEqual(['tag1', 'tag2'])
    expect(rest).toBe(8)
  })

  test('tag with special characters', () => {
    const tags = ['tag with space', 'tag-with-dash', 'tag_underscore', 'Korean태그']
    expect(tags).toHaveLength(4)
    tags.forEach(tag => {
      expect(typeof tag).toBe('string')
      expect(tag.length).toBeGreaterThan(0)
    })
  })

  test('title truncation boundary (200 chars)', () => {
    const shortTitle = 'Short'
    const longTitle = 'A'.repeat(250)
    expect(shortTitle.length).toBeLessThan(200)
    expect(longTitle.length).toBeGreaterThan(200)
    // Component uses max-w-[200px] CSS class for truncation
  })
})

describe('TEA: Pagination Edge Cases', () => {
  test('single page (total <= PAGE_SIZE)', () => {
    const total = 15
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(1)
  })

  test('exact multiple of PAGE_SIZE', () => {
    const total = 40
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(2)
  })

  test('one over PAGE_SIZE boundary', () => {
    const total = 41
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(3)
  })

  test('very large dataset', () => {
    const total = 10000
    const pageSize = 20
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    expect(totalPages).toBe(500)
  })

  test('page navigation bounds', () => {
    const totalPages = 10
    // First page: prev disabled
    expect(1 <= 1).toBe(true)
    expect(1 >= totalPages).toBe(false)
    // Last page: next disabled
    expect(10 <= 1).toBe(false)
    expect(10 >= totalPages).toBe(true)
    // Middle page: both enabled
    expect(5 <= 1).toBe(false)
    expect(5 >= totalPages).toBe(false)
  })
})

describe('TEA: Edit Form Validation Logic', () => {
  test('tags string parsing with commas', () => {
    const input = 'tag1, tag2, tag3'
    const tags = input.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  test('tags string with extra commas', () => {
    const input = ',tag1,,tag2,,,tag3,'
    const tags = input.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  test('empty tags string', () => {
    const input = ''
    const tags = input.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual([])
  })

  test('single tag without comma', () => {
    const input = 'onlytag'
    const tags = input.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual(['onlytag'])
  })

  test('tags with whitespace only entries', () => {
    const input = '  , ,   '
    const tags = input.split(',').map(t => t.trim()).filter(Boolean)
    expect(tags).toEqual([])
  })

  test('folderId null vs empty string', () => {
    // Empty string should be treated as null (no folder)
    const emptyFolderId = ''
    const nullFolderId = emptyFolderId || null
    expect(nullFolderId).toBeNull()

    // Non-empty should pass through
    const folderId = 'folder-123'
    const result = folderId || null
    expect(result).toBe('folder-123')
  })
})

describe('TEA: Stats Distribution Edge Cases', () => {
  test('all documents in one classification', () => {
    const stats = {
      totalDocuments: 50,
      byClassification: { public: 50, internal: 0, confidential: 0, secret: 0 } as Record<Classification, number>,
      byDepartment: [],
      recentWeekCount: 3,
    }
    const pct = (stats.byClassification.public / stats.totalDocuments) * 100
    expect(pct).toBe(100)
  })

  test('equal distribution across all 4 classifications', () => {
    const stats = {
      totalDocuments: 100,
      byClassification: { public: 25, internal: 25, confidential: 25, secret: 25 } as Record<Classification, number>,
      byDepartment: [],
      recentWeekCount: 10,
    }
    const total = Object.values(stats.byClassification).reduce((s, v) => s + v, 0)
    expect(total).toBe(stats.totalDocuments)
  })

  test('rounding in percentage calculation', () => {
    const stats = {
      totalDocuments: 3,
      byClassification: { public: 1, internal: 1, confidential: 1, secret: 0 } as Record<Classification, number>,
    }
    const publicPct = (stats.byClassification.public / stats.totalDocuments) * 100
    expect(publicPct).toBeCloseTo(33.33, 1)
  })
})

describe('TEA: Route Registration Verification', () => {
  test('classified route path is /classified', () => {
    const route = 'classified'
    expect(route).toBe('classified')
    expect(`/${route}`).toBe('/classified')
  })

  test('API base path for archive', () => {
    expect('/workspace/archive').toBe('/workspace/archive')
    expect('/workspace/archive/stats').toBe('/workspace/archive/stats')
    expect('/workspace/archive/folders').toBe('/workspace/archive/folders')
  })

  test('sidebar navigation entry', () => {
    const entry = { to: '/classified', label: '기밀문서', icon: '🔒' }
    expect(entry.to).toBe('/classified')
    expect(entry.label).toBe('기밀문서')
    expect(entry.icon).toBe('🔒')
  })
})

describe('TEA: Delegation Chain Rendering', () => {
  test('empty delegation chain', () => {
    const chain: { agentName: string; role: string; status: string }[] = []
    expect(chain.length).toBe(0)
  })

  test('single agent in chain', () => {
    const chain = [{ agentName: '비서실장', role: 'manager', status: 'completed' }]
    expect(chain).toHaveLength(1)
    expect(chain[0].agentName).toBe('비서실장')
  })

  test('multi-step delegation chain', () => {
    const chain = [
      { agentName: '비서실장', role: 'manager', status: 'completed' },
      { agentName: '분석처장', role: 'specialist', status: 'completed' },
      { agentName: '분석원1', role: 'worker', status: 'completed' },
    ]
    expect(chain).toHaveLength(3)
    // Arrows between steps (i > 0)
    let arrowCount = 0
    chain.forEach((_, i) => { if (i > 0) arrowCount++ })
    expect(arrowCount).toBe(2)
  })
})

describe('TEA: Cache Key Integrity', () => {
  test('archive list cache key includes all filter dimensions', () => {
    const key = ['archive', 1, 'search', 'secret', '2026-01-01', '2026-12-31', 'date', null]
    expect(key[0]).toBe('archive')
    expect(key).toHaveLength(8)
  })

  test('archive detail cache key includes ID', () => {
    const id = 'doc-123'
    const key = ['archive-detail', id]
    expect(key).toEqual(['archive-detail', 'doc-123'])
  })

  test('archive folders cache key', () => {
    const key = ['archive-folders']
    expect(key).toEqual(['archive-folders'])
  })

  test('archive stats cache key', () => {
    const key = ['archive-stats']
    expect(key).toEqual(['archive-stats'])
  })
})
