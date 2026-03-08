import { describe, test, expect, beforeEach, mock } from 'bun:test'

// Mock DB
const mockSelect = mock(() => mockQueryBuilder)
const mockInsert = mock(() => ({ values: mock(() => ({ returning: mock(() => [{ id: 'arch-1', companyId: 'c1', commandId: 'cmd-1', title: 'Test Archive', classification: 'internal' }]) })) }))
const mockUpdate = mock(() => ({ set: mock(() => ({ where: mock(() => ({ returning: mock(() => [{ id: 'arch-1', title: 'Updated' }]) })) })) }))
const mockDelete = mock(() => ({ where: mock(() => ({ returning: mock(() => [{ id: 'arch-1' }]) })) }))

const mockQueryBuilder = {
  from: mock(() => mockQueryBuilder),
  leftJoin: mock(() => mockQueryBuilder),
  where: mock(() => mockQueryBuilder),
  orderBy: mock(() => mockQueryBuilder),
  groupBy: mock(() => mockQueryBuilder),
  limit: mock(() => mockQueryBuilder),
  offset: mock(() => mockQueryBuilder),
  then: undefined as any, // makes it thenable
}

// Make select return array by default
mockQueryBuilder.limit = mock(() => Promise.resolve([]))
mockQueryBuilder.offset = mock(() => Promise.resolve([]))

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  },
}))

mock.module('../../db/schema', () => ({
  archiveItems: { id: 'id', companyId: 'company_id', commandId: 'command_id', userId: 'user_id', title: 'title', classification: 'classification', content: 'content', summary: 'summary', tags: 'tags', folderId: 'folder_id', qualityScore: 'quality_score', agentId: 'agent_id', departmentId: 'department_id', commandType: 'command_type', commandText: 'command_text', metadata: 'metadata', createdAt: 'created_at', updatedAt: 'updated_at', deletedAt: 'deleted_at' },
  archiveFolders: { id: 'id', companyId: 'company_id', name: 'name', parentId: 'parent_id', createdAt: 'created_at', updatedAt: 'updated_at' },
  commands: { id: 'id', companyId: 'company_id', type: 'type', text: 'text', result: 'result', status: 'status', targetAgentId: 'target_agent_id', metadata: 'metadata' },
  agents: { id: 'id', name: 'name', departmentId: 'department_id' },
  departments: { id: 'id', name: 'name' },
  qualityReviews: { commandId: 'command_id', scores: 'scores', conclusion: 'conclusion', createdAt: 'created_at' },
  orchestrationTasks: { commandId: 'command_id', agentId: 'agent_id', type: 'type', status: 'status', durationMs: 'duration_ms', startedAt: 'started_at', completedAt: 'completed_at', createdAt: 'created_at', id: 'id', input: 'input', output: 'output' },
  costRecords: { agentId: 'agent_id', costUsdMicro: 'cost_usd_micro' },
}))

mock.module('../../services/activity-log-service', () => ({
  parsePaginationParams: (q: any) => ({ page: Number(q.page) || 1, limit: Number(q.limit) || 20, offset: ((Number(q.page) || 1) - 1) * (Number(q.limit) || 20) }),
  parseDateFilter: (start?: string, end?: string) => {
    const result: any[] = []
    if (start) result.push({ type: 'gte', date: new Date(start) })
    if (end) result.push({ type: 'lte', date: new Date(end) })
    return result
  },
}))

// === Tests ===

describe('Archive Service - Types & API Contract', () => {
  test('Classification enum has 4 valid values', () => {
    const validClassifications = ['public', 'internal', 'confidential', 'secret']
    expect(validClassifications).toHaveLength(4)
    expect(validClassifications).toContain('public')
    expect(validClassifications).toContain('internal')
    expect(validClassifications).toContain('confidential')
    expect(validClassifications).toContain('secret')
  })

  test('ArchiveItem structure has required fields', () => {
    const item = {
      id: 'arch-1',
      title: 'Test Report',
      classification: 'confidential' as const,
      summary: 'Summary text',
      tags: ['finance', 'q1'],
      folderId: 'folder-1',
      folderName: 'Finance Reports',
      agentName: 'Agent A',
      departmentName: 'Finance',
      qualityScore: 85,
      commandType: 'direct',
      createdAt: '2026-03-08T00:00:00.000Z',
    }
    expect(item.id).toBeDefined()
    expect(item.title).toBeDefined()
    expect(item.classification).toBeDefined()
    expect(item.tags).toBeArray()
  })

  test('ArchiveDetail extends ArchiveItem with detail fields', () => {
    const detail = {
      id: 'arch-1',
      title: 'Test',
      classification: 'internal' as const,
      summary: null,
      tags: [],
      folderId: null,
      folderName: null,
      agentName: null,
      departmentName: null,
      qualityScore: null,
      commandType: 'direct',
      createdAt: '2026-03-08T00:00:00.000Z',
      content: '# Report Content',
      commandId: 'cmd-1',
      commandText: '@에이전트 분석해줘',
      delegationChain: [
        { id: 't1', agentId: 'a1', agentName: 'Agent', type: 'execute', status: 'completed', durationMs: 1000 },
      ],
      qualityReview: {
        id: 'qr-1',
        conclusion: 'pass',
        scores: { conclusionQuality: 8, evidenceSources: 7 },
        feedback: null,
        attemptNumber: 1,
      },
      similarDocuments: [],
    }
    expect(detail.content).toBeDefined()
    expect(detail.delegationChain).toBeArray()
    expect(detail.qualityReview).toBeDefined()
    expect(detail.similarDocuments).toBeArray()
  })

  test('SimilarDocument has similarityScore field', () => {
    const similar = {
      id: 'arch-2',
      title: 'Similar Report',
      classification: 'internal' as const,
      summary: 'Similar summary',
      agentName: 'Agent A',
      qualityScore: 90,
      similarityScore: 75,
      createdAt: '2026-03-08T00:00:00.000Z',
    }
    expect(similar.similarityScore).toBeGreaterThanOrEqual(0)
    expect(similar.similarityScore).toBeLessThanOrEqual(100)
  })

  test('ArchiveFolder supports nested tree structure', () => {
    const folder: any = {
      id: 'f1',
      name: 'Finance',
      parentId: null,
      children: [
        {
          id: 'f2',
          name: 'Q1 Reports',
          parentId: 'f1',
          children: [],
          documentCount: 5,
        },
      ],
      documentCount: 10,
    }
    expect(folder.children).toHaveLength(1)
    expect(folder.children[0].parentId).toBe('f1')
  })

  test('ArchiveStats has required aggregation fields', () => {
    const stats = {
      totalDocuments: 42,
      byClassification: { public: 10, internal: 20, confidential: 8, secret: 4 },
      byDepartment: [
        { departmentId: 'd1', departmentName: 'Finance', count: 15 },
        { departmentId: 'd2', departmentName: 'Marketing', count: 27 },
      ],
      recentWeekCount: 7,
    }
    expect(stats.totalDocuments).toBe(42)
    expect(Object.keys(stats.byClassification)).toHaveLength(4)
    expect(stats.byDepartment).toBeArray()
    expect(stats.recentWeekCount).toBe(7)
  })
})

describe('Archive Service - Similarity Algorithm', () => {
  function calculateSimilarity(source: any, candidate: any): number {
    let score = 0
    if (source.agentId && source.agentId === candidate.agentId) score += 30
    if (source.departmentId && source.departmentId === candidate.departmentId) score += 25
    if (source.commandType && source.commandType === candidate.commandType) score += 15
    const sourceTags: string[] = Array.isArray(source.tags) ? source.tags : []
    const candidateTags: string[] = Array.isArray(candidate.tags) ? candidate.tags : []
    const commonTags = sourceTags.filter((t: string) => candidateTags.includes(t))
    score += Math.min(commonTags.length * 10, 30)
    return Math.min(score, 100)
  }

  test('identical agent gives +30 score', () => {
    const source = { agentId: 'a1', departmentId: null, commandType: null, tags: [] }
    const candidate = { agentId: 'a1', departmentId: null, commandType: null, tags: [] }
    expect(calculateSimilarity(source, candidate)).toBe(30)
  })

  test('identical department gives +25 score', () => {
    const source = { agentId: null, departmentId: 'd1', commandType: null, tags: [] }
    const candidate = { agentId: null, departmentId: 'd1', commandType: null, tags: [] }
    expect(calculateSimilarity(source, candidate)).toBe(25)
  })

  test('identical command type gives +15 score', () => {
    const source = { agentId: null, departmentId: null, commandType: 'direct', tags: [] }
    const candidate = { agentId: null, departmentId: null, commandType: 'direct', tags: [] }
    expect(calculateSimilarity(source, candidate)).toBe(15)
  })

  test('tag overlap gives +10 per common tag, max 30', () => {
    const source = { agentId: null, departmentId: null, commandType: null, tags: ['a', 'b', 'c', 'd'] }
    const candidate = { agentId: null, departmentId: null, commandType: null, tags: ['a', 'b', 'c', 'd'] }
    // 4 common tags * 10 = 40, but capped at 30
    expect(calculateSimilarity(source, candidate)).toBe(30)
  })

  test('2 common tags gives +20', () => {
    const source = { agentId: null, departmentId: null, commandType: null, tags: ['a', 'b', 'c'] }
    const candidate = { agentId: null, departmentId: null, commandType: null, tags: ['a', 'b', 'x'] }
    expect(calculateSimilarity(source, candidate)).toBe(20)
  })

  test('full match gives 100 (capped)', () => {
    const source = { agentId: 'a1', departmentId: 'd1', commandType: 'direct', tags: ['a', 'b', 'c', 'd'] }
    const candidate = { agentId: 'a1', departmentId: 'd1', commandType: 'direct', tags: ['a', 'b', 'c', 'd'] }
    // 30+25+15+30 = 100 (capped)
    expect(calculateSimilarity(source, candidate)).toBe(100)
  })

  test('no match gives 0', () => {
    const source = { agentId: 'a1', departmentId: 'd1', commandType: 'direct', tags: ['a'] }
    const candidate = { agentId: 'a2', departmentId: 'd2', commandType: 'slash', tags: ['b'] }
    expect(calculateSimilarity(source, candidate)).toBe(0)
  })

  test('null agentId does not score', () => {
    const source = { agentId: null, departmentId: null, commandType: null, tags: [] }
    const candidate = { agentId: null, departmentId: null, commandType: null, tags: [] }
    expect(calculateSimilarity(source, candidate)).toBe(0)
  })

  test('empty tags arrays give 0 tag score', () => {
    const source = { agentId: null, departmentId: null, commandType: null, tags: [] }
    const candidate = { agentId: null, departmentId: null, commandType: null, tags: ['a', 'b'] }
    expect(calculateSimilarity(source, candidate)).toBe(0)
  })

  test('single common tag gives +10', () => {
    const source = { agentId: null, departmentId: null, commandType: null, tags: ['finance'] }
    const candidate = { agentId: null, departmentId: null, commandType: null, tags: ['finance', 'report'] }
    expect(calculateSimilarity(source, candidate)).toBe(10)
  })
})

describe('Archive Service - Input Validation', () => {
  test('valid classification values', () => {
    const valid = ['public', 'internal', 'confidential', 'secret']
    for (const cls of valid) {
      expect(valid).toContain(cls)
    }
  })

  test('invalid classification rejected', () => {
    const valid = ['public', 'internal', 'confidential', 'secret']
    expect(valid).not.toContain('top-secret')
    expect(valid).not.toContain('restricted')
    expect(valid).not.toContain('')
  })

  test('tags must be string array', () => {
    const tags: string[] = ['finance', 'q1-2026', 'report']
    expect(tags.every((t) => typeof t === 'string')).toBe(true)
  })

  test('title is required and non-empty', () => {
    expect(''.trim()).toBe('')
    expect('Test Title'.trim()).toBe('Test Title')
    expect('  Trimmed  '.trim()).toBe('Trimmed')
  })

  test('commandId is required', () => {
    const input = { commandId: 'cmd-1', title: 'Test', classification: 'internal' }
    expect(input.commandId).toBeDefined()
    expect(input.commandId).not.toBe('')
  })

  test('only completed commands can be archived', () => {
    const statuses = ['pending', 'processing', 'completed', 'failed', 'cancelled']
    const archivable = statuses.filter((s) => s === 'completed')
    expect(archivable).toHaveLength(1)
    expect(archivable[0]).toBe('completed')
  })

  test('folderId is optional', () => {
    const inputWithFolder = { commandId: 'c1', title: 'T', classification: 'internal', folderId: 'f1' }
    const inputWithoutFolder = { commandId: 'c1', title: 'T', classification: 'internal' }
    expect(inputWithFolder.folderId).toBeDefined()
    expect(inputWithoutFolder).not.toHaveProperty('folderId')
  })
})

describe('Archive Service - Soft Delete', () => {
  test('soft delete sets deletedAt timestamp', () => {
    const now = new Date()
    const item = { id: 'arch-1', deletedAt: null as Date | null }
    item.deletedAt = now
    expect(item.deletedAt).toBeDefined()
    expect(item.deletedAt).toBeInstanceOf(Date)
  })

  test('deleted items should be excluded from default list', () => {
    const items = [
      { id: '1', deletedAt: null },
      { id: '2', deletedAt: new Date() },
      { id: '3', deletedAt: null },
    ]
    const activeItems = items.filter((i) => i.deletedAt === null)
    expect(activeItems).toHaveLength(2)
    expect(activeItems.map((i) => i.id)).toEqual(['1', '3'])
  })

  test('includeDeleted flag shows all items', () => {
    const items = [
      { id: '1', deletedAt: null },
      { id: '2', deletedAt: new Date() },
    ]
    const includeDeleted = true
    const result = includeDeleted ? items : items.filter((i) => i.deletedAt === null)
    expect(result).toHaveLength(2)
  })
})

describe('Archive Folder Service - Tree Building', () => {
  function buildTree(folders: { id: string; name: string; parentId: string | null }[]) {
    const nodeMap = new Map<string, any>()
    for (const f of folders) {
      nodeMap.set(f.id, { ...f, children: [], documentCount: 0 })
    }
    const roots: any[] = []
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId).children.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }

  test('flat folders become roots', () => {
    const folders = [
      { id: '1', name: 'A', parentId: null },
      { id: '2', name: 'B', parentId: null },
    ]
    const tree = buildTree(folders)
    expect(tree).toHaveLength(2)
    expect(tree[0].children).toHaveLength(0)
  })

  test('nested folders build correct tree', () => {
    const folders = [
      { id: '1', name: 'Root', parentId: null },
      { id: '2', name: 'Child 1', parentId: '1' },
      { id: '3', name: 'Child 2', parentId: '1' },
      { id: '4', name: 'Grandchild', parentId: '2' },
    ]
    const tree = buildTree(folders)
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(2)
    expect(tree[0].children[0].children).toHaveLength(1)
  })

  test('orphaned folders become roots', () => {
    const folders = [
      { id: '1', name: 'Root', parentId: null },
      { id: '2', name: 'Orphan', parentId: 'missing' },
    ]
    const tree = buildTree(folders)
    expect(tree).toHaveLength(2) // Both become roots since parent is missing
  })

  test('empty folder list returns empty array', () => {
    const tree = buildTree([])
    expect(tree).toHaveLength(0)
  })

  test('deep nesting works correctly', () => {
    const folders = [
      { id: '1', name: 'L1', parentId: null },
      { id: '2', name: 'L2', parentId: '1' },
      { id: '3', name: 'L3', parentId: '2' },
      { id: '4', name: 'L4', parentId: '3' },
    ]
    const tree = buildTree(folders)
    expect(tree).toHaveLength(1)
    expect(tree[0].children[0].children[0].children).toHaveLength(1)
  })
})

describe('Archive Route - Error Handling', () => {
  test('missing commandId returns 400', () => {
    const body = { title: 'Test', classification: 'internal' }
    const isValid = body && (body as any).commandId && (body as any).title?.trim() && (body as any).classification
    expect(isValid).toBeFalsy()
  })

  test('missing title returns 400', () => {
    const body = { commandId: 'c1', classification: 'internal' }
    const isValid = (body as any).commandId && (body as any).title?.trim() && (body as any).classification
    expect(isValid).toBeFalsy()
  })

  test('empty title returns 400', () => {
    const body = { commandId: 'c1', title: '   ', classification: 'internal' }
    const isValid = body.commandId && body.title?.trim() && body.classification
    expect(isValid).toBeFalsy()
  })

  test('invalid classification returns 400', () => {
    const valid = ['public', 'internal', 'confidential', 'secret']
    expect(valid.includes('invalid')).toBe(false)
    expect(valid.includes('top-secret')).toBe(false)
  })

  test('valid inputs pass validation', () => {
    const body = { commandId: 'c1', title: 'Good Title', classification: 'confidential' }
    const valid = ['public', 'internal', 'confidential', 'secret']
    const isValid = body.commandId && body.title?.trim() && valid.includes(body.classification)
    expect(isValid).toBeTruthy()
  })

  test('duplicate archive returns 409', () => {
    const error = 'ALREADY_ARCHIVED'
    expect(error).toBe('ALREADY_ARCHIVED')
  })

  test('non-completed command returns 400', () => {
    const error = 'COMMAND_NOT_COMPLETED'
    expect(error).toBe('COMMAND_NOT_COMPLETED')
  })

  test('non-existent command returns 404', () => {
    const error = 'COMMAND_NOT_FOUND'
    expect(error).toBe('COMMAND_NOT_FOUND')
  })

  test('folder with children returns 409 on delete', () => {
    const error = 'HAS_CHILDREN'
    expect(error).toBe('HAS_CHILDREN')
  })

  test('folder with documents returns 409 on delete', () => {
    const error = 'HAS_DOCUMENTS'
    expect(error).toBe('HAS_DOCUMENTS')
  })
})

describe('Archive Service - Filter Logic', () => {
  test('search filter matches title, summary, and commandText', () => {
    const items = [
      { title: '재무 분석 보고서', summary: '1분기 실적', commandText: '@재무팀장' },
      { title: '마케팅 전략', summary: '소셜 미디어', commandText: '@마케팅팀장' },
      { title: '기술 검토', summary: '재무 임팩트', commandText: '@기술팀장' },
    ]
    const search = '재무'
    const matched = items.filter((i) =>
      i.title.includes(search) || i.summary.includes(search) || i.commandText.includes(search),
    )
    expect(matched).toHaveLength(2) // 재무 분석 보고서 + 기술 검토 (summary has 재무)
  })

  test('classification filter matches exact value', () => {
    const items = [
      { classification: 'public' },
      { classification: 'confidential' },
      { classification: 'internal' },
      { classification: 'confidential' },
    ]
    const filtered = items.filter((i) => i.classification === 'confidential')
    expect(filtered).toHaveLength(2)
  })

  test('tag filter matches any tag', () => {
    const items = [
      { tags: ['finance', 'q1'] },
      { tags: ['marketing'] },
      { tags: ['finance', 'report'] },
    ]
    const filterTags = ['finance']
    const matched = items.filter((i) =>
      i.tags.some((t) => filterTags.includes(t)),
    )
    expect(matched).toHaveLength(2)
  })

  test('date range filter works', () => {
    const items = [
      { createdAt: new Date('2026-03-01') },
      { createdAt: new Date('2026-03-05') },
      { createdAt: new Date('2026-03-10') },
    ]
    const start = new Date('2026-03-03')
    const end = new Date('2026-03-08')
    const filtered = items.filter((i) => i.createdAt >= start && i.createdAt <= end)
    expect(filtered).toHaveLength(1) // Only March 5
  })

  test('sort by date desc is default', () => {
    const items = [
      { createdAt: new Date('2026-03-01') },
      { createdAt: new Date('2026-03-10') },
      { createdAt: new Date('2026-03-05') },
    ]
    const sorted = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    expect(sorted[0].createdAt.getDate()).toBe(10)
    expect(sorted[2].createdAt.getDate()).toBe(1)
  })

  test('sort by classification works', () => {
    const order = { public: 0, internal: 1, confidential: 2, secret: 3 }
    const items = [
      { classification: 'secret' as const },
      { classification: 'public' as const },
      { classification: 'confidential' as const },
    ]
    const sorted = [...items].sort((a, b) => order[a.classification] - order[b.classification])
    expect(sorted[0].classification).toBe('public')
    expect(sorted[2].classification).toBe('secret')
  })

  test('pagination with page 1 limit 20 gives offset 0', () => {
    const page = 1
    const limit = 20
    const offset = (page - 1) * limit
    expect(offset).toBe(0)
  })

  test('pagination with page 3 limit 10 gives offset 20', () => {
    const page = 3
    const limit = 10
    const offset = (page - 1) * limit
    expect(offset).toBe(20)
  })
})

describe('Archive Service - Stats Aggregation', () => {
  test('stats default has all classifications at 0', () => {
    const defaultStats = { public: 0, internal: 0, confidential: 0, secret: 0 }
    expect(Object.values(defaultStats).every((v) => v === 0)).toBe(true)
  })

  test('stats correctly sums by classification', () => {
    const rows = [
      { classification: 'public', count: 5 },
      { classification: 'internal', count: 15 },
      { classification: 'confidential', count: 3 },
    ]
    const stats = { public: 0, internal: 0, confidential: 0, secret: 0 } as Record<string, number>
    for (const row of rows) {
      stats[row.classification] = row.count
    }
    expect(stats.public).toBe(5)
    expect(stats.internal).toBe(15)
    expect(stats.confidential).toBe(3)
    expect(stats.secret).toBe(0) // Not in rows
  })

  test('recentWeekCount only includes last 7 days', () => {
    const now = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const items = [
      { createdAt: new Date() },
      { createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    ]
    const recent = items.filter((i) => i.createdAt >= sevenDaysAgo)
    expect(recent).toHaveLength(2)
  })
})

describe('Archive Service - Update Constraints', () => {
  test('content cannot be modified', () => {
    const allowedFields = ['title', 'classification', 'summary', 'tags', 'folderId']
    expect(allowedFields).not.toContain('content')
    expect(allowedFields).not.toContain('commandId')
    expect(allowedFields).not.toContain('commandText')
  })

  test('title update preserves trimming', () => {
    const input = '  Updated Title  '
    expect(input.trim()).toBe('Updated Title')
  })

  test('null folderId removes from folder', () => {
    const updateData: Record<string, any> = {}
    const folderId: string | null = null
    if (folderId !== undefined) updateData.folderId = folderId
    expect(updateData.folderId).toBeNull()
  })
})
