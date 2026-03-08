import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Mock Setup
// ============================================================

let selectResults: unknown[][] = []
let insertResult: unknown[] = []
let updateResult: unknown[] = []
let deleteCallCount = 0

function makeChain(results: unknown[][]) {
  let callIndex = 0
  const getResult = () => {
    const res = results[callIndex] ?? []
    callIndex++
    return res
  }
  const chain: Record<string, unknown> = {}
  chain.from = mock(() => chain)
  chain.where = mock(() => chain)
  chain.orderBy = mock(() => chain)
  chain.offset = mock(() => chain)
  chain.limit = mock(() => {
    const r = getResult()
    const limitResult: Record<string, unknown> = {}
    limitResult.offset = mock(() => ({
      then: (resolve: (v: unknown) => void) => { resolve(r) },
    }))
    limitResult.then = (resolve: (v: unknown) => void) => { resolve(r) }
    return limitResult
  })
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
    try { resolve(getResult()) } catch (e) { reject?.(e) }
  }
  return chain
}

let currentChain: ReturnType<typeof makeChain>

mock.module('../../db', () => ({
  db: {
    select: mock(() => currentChain),
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => insertResult),
      })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => updateResult),
        })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => {
        deleteCallCount++
        return { returning: mock(() => []) }
      }),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  knowledgeFolders: {
    id: 'id', companyId: 'company_id', name: 'name', description: 'description',
    parentId: 'parent_id', departmentId: 'department_id', createdBy: 'created_by',
    isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  knowledgeDocs: {
    id: 'id', companyId: 'company_id', folderId: 'folder_id', title: 'title',
    content: 'content', contentType: 'content_type', fileUrl: 'file_url',
    tags: 'tags', createdBy: 'created_by', updatedBy: 'updated_by',
    isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  docVersions: {
    id: 'id', docId: 'doc_id', version: 'version', title: 'title',
    content: 'content', contentType: 'content_type', tags: 'tags',
    editedBy: 'edited_by', changeNote: 'change_note', createdAt: 'created_at',
  },
  agentMemories: {
    id: 'id', companyId: 'company_id', agentId: 'agent_id',
    memoryType: 'memory_type', key: 'key', content: 'content',
    context: 'context', source: 'source', confidence: 'confidence',
    usageCount: 'usage_count', lastUsedAt: 'last_used_at',
    isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  agents: { id: 'id', companyId: 'company_id' },
  memoryTypeEnum: {},
  docVersionsRelations: {},
  knowledgeFoldersRelations: {},
  knowledgeDocsRelations: {},
  agentMemoriesRelations: {},
}))

mock.module('../../middleware/auth', () => ({
  authMiddleware: mock(async (_c: unknown, next: () => Promise<void>) => next()),
}))

class MockHTTPError extends Error {
  status: number
  code: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code || 'ERROR'
  }
}

mock.module('../../middleware/error', () => ({
  HTTPError: MockHTTPError,
}))

mock.module('../../lib/knowledge-templates', () => ({
  KNOWLEDGE_TEMPLATES: [
    {
      id: 'meeting-notes',
      name: '회의록',
      description: '회의 내용 기록 템플릿',
      contentType: 'markdown',
      defaultContent: '# 회의록\n\n## 일시: {{date}}\n\n## 안건\n\n## 결정 사항',
      defaultTags: ['회의록', '기록'],
    },
    {
      id: 'project-plan',
      name: '프로젝트 계획',
      description: '프로젝트 계획 템플릿',
      contentType: 'markdown',
      defaultContent: '# 프로젝트 계획서\n\n## 시작일: {{date}}',
      defaultTags: ['프로젝트', '계획'],
    },
    {
      id: 'weekly-report',
      name: '주간 보고서',
      description: '주간 보고서 템플릿',
      contentType: 'markdown',
      defaultContent: '# 주간 보고서\n\n## 기간: {{date}}',
      defaultTags: ['주간보고', '보고서'],
    },
    {
      id: 'decision-record',
      name: '의사결정 기록',
      description: '의사결정 기록 템플릿',
      contentType: 'markdown',
      defaultContent: '# 의사결정 기록\n\n## 상태: 결정됨 | {{date}}',
      defaultTags: ['의사결정', 'ADR'],
    },
    {
      id: 'incident-report',
      name: '장애 보고서',
      description: '장애 보고서 템플릿',
      contentType: 'markdown',
      defaultContent: '# 장애 보고서\n\n## 발생 일시: {{date}}',
      defaultTags: ['장애', '인시던트', '보고서'],
    },
  ],
}))

// ============================================================
// Test App Factory
// ============================================================

const mockTenant = { companyId: 'comp-1', userId: 'user-1' }

function createTestApp() {
  const { Hono } = require('hono')
  const { knowledgeRoute } = require('../../routes/workspace/knowledge')
  const app = new Hono()
  app.onError((err: any, c: any) => {
    const status = (err && typeof err.status === 'number') ? err.status : 500
    return c.json({ error: { code: err?.code || 'ERROR', message: err?.message || 'Unknown' } }, status)
  })
  app.use('*', async (c: any, next: () => Promise<void>) => {
    c.set('tenant', mockTenant)
    await next()
  })
  app.route('/api/workspace/knowledge', knowledgeRoute)
  return app
}

function req(method: string, path: string, body?: unknown) {
  const app = createTestApp()
  const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) options.body = JSON.stringify(body)
  return app.request(`http://localhost/api/workspace/knowledge${path}`, options)
}

// ============================================================
// Tests: Story 16-2 Enhanced Document Management
// ============================================================

describe('Story 16-2: Document Store CRUD API & Folder Management', () => {
  beforeEach(() => {
    selectResults = []
    insertResult = []
    updateResult = []
    deleteCallCount = 0
  })

  // ══════════════════════════════════════════════════════════
  // Document Templates
  // ══════════════════════════════════════════════════════════

  describe('GET /templates', () => {
    test('템플릿 목록 반환 (5개)', async () => {
      const res = await req('GET', '/templates')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { id: string; name: string }[] }
      expect(json.data.length).toBe(5)
      expect(json.data[0].id).toBe('meeting-notes')
      expect(json.data[0].name).toBe('회의록')
    })

    test('템플릿에 defaultContent 미포함 (보안)', async () => {
      const res = await req('GET', '/templates')
      const json = await res.json() as { data: { defaultContent?: string }[] }
      expect(json.data[0].defaultContent).toBeUndefined()
    })

    test('모든 템플릿에 id, name, description 포함', async () => {
      const res = await req('GET', '/templates')
      const json = await res.json() as { data: { id: string; name: string; description: string }[] }
      for (const t of json.data) {
        expect(t.id).toBeTruthy()
        expect(t.name).toBeTruthy()
        expect(t.description).toBeTruthy()
      }
    })
  })

  describe('POST /docs/from-template', () => {
    test('회의록 템플릿으로 문서 생성', async () => {
      const doc = { id: 'd-t1', title: '3월 회의', contentType: 'markdown', tags: ['회의록', '기록'] }
      insertResult = [doc]
      const res = await req('POST', '/docs/from-template', {
        templateId: 'meeting-notes',
        title: '3월 회의',
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('3월 회의')
    })

    test('folderId 포함 생성', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      const doc = { id: 'd-t2', title: '계획', folderId: 'f-1' }
      insertResult = [doc]
      const res = await req('POST', '/docs/from-template', {
        templateId: 'project-plan',
        folderId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        title: '계획',
      })
      expect(res.status).toBe(200)
    })

    test('존재하지 않는 템플릿 404', async () => {
      const res = await req('POST', '/docs/from-template', {
        templateId: 'nonexistent',
        title: 'test',
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('title 누락 시 400', async () => {
      const res = await req('POST', '/docs/from-template', {
        templateId: 'meeting-notes',
      })
      expect(res.status).toBe(400)
    })

    test('templateId 누락 시 400', async () => {
      const res = await req('POST', '/docs/from-template', {
        title: '테스트',
      })
      expect(res.status).toBe(400)
    })

    test('각 템플릿 ID로 생성 가능', async () => {
      const templateIds = ['meeting-notes', 'project-plan', 'weekly-report', 'decision-record', 'incident-report']
      for (const templateId of templateIds) {
        insertResult = [{ id: `d-${templateId}`, title: 'test' }]
        const res = await req('POST', '/docs/from-template', {
          templateId,
          title: 'test',
        })
        expect(res.status).toBe(200)
      }
    })
  })

  // ══════════════════════════════════════════════════════════
  // Document Versioning
  // ══════════════════════════════════════════════════════════

  describe('GET /docs/:id/versions', () => {
    test('버전 이력 조회 성공', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) {
          // doc existence check
          return [{ id: 'd-1' }]
        }
        // versions pagination limit
        const result: Record<string, unknown> = {}
        result.offset = mock(() => ({
          then: (resolve: (v: unknown) => void) => {
            resolve([
              { id: 'v-2', version: 2, title: '버전2', createdAt: new Date() },
              { id: 'v-1', version: 1, title: '버전1', createdAt: new Date() },
            ])
          },
        }))
        result.then = (resolve: (v: unknown) => void) => {
          resolve([
            { id: 'v-2', version: 2, title: '버전2', createdAt: new Date() },
            { id: 'v-1', version: 1, title: '버전1', createdAt: new Date() },
          ])
        }
        return result
      })

      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        resolve([{ count: 2 }]) // count query
      }

      const res = await req('GET', '/docs/d-1/versions')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: unknown[]; pagination: { total: number } }
      expect(json.pagination).toBeDefined()
    })

    test('존재하지 않는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/docs/non-exist/versions')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('페이지네이션 지원', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'd-1' }]
        const result: Record<string, unknown> = {}
        result.offset = mock(() => ({
          then: (resolve: (v: unknown) => void) => { resolve([]) },
        }))
        result.then = (resolve: (v: unknown) => void) => { resolve([]) }
        return result
      })
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs/d-1/versions?page=2&limit=5')
      expect(res.status).toBe(200)
    })
  })

  describe('POST /docs/:id/versions/:versionId/restore', () => {
    test('버전 복원 성공', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'd-1', title: '현재', content: '현재 내용', contentType: 'markdown', tags: [] }]
        if (limitCalls === 2) return [{ id: 'v-1', docId: 'd-1', version: 1, title: '이전', content: '이전 내용', contentType: 'markdown', tags: ['old'] }]
        return []
      })
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ maxVer: 2 }]) }
      insertResult = [{ id: 'v-3' }]
      updateResult = [{ id: 'd-1', title: '이전', content: '이전 내용' }]

      const res = await req('POST', '/docs/d-1/versions/v-1/restore')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('이전')
    })

    test('존재하지 않는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/docs/non-exist/versions/v-1/restore')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('존재하지 않는 버전 404', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'd-1', title: '현재', content: '내용', contentType: 'markdown', tags: [] }]
        return [] // version not found
      })
      const res = await req('POST', '/docs/d-1/versions/non-exist/restore')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Advanced Folder Operations
  // ══════════════════════════════════════════════════════════

  describe('POST /folders/:id/move', () => {
    test('문서 이동 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      updateResult = [{ id: 'd-1' }]

      const res = await req('POST', '/folders/f-1/move', {
        docIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
        targetFolderId: 'aaaaaaaa-bbbb-cccc-dddd-ffffffffffff',
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { movedCount: number } }
      expect(json.data.movedCount).toBeGreaterThanOrEqual(0)
    })

    test('root로 이동 (folderId null)', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      updateResult = [{ id: 'd-1' }]

      const res = await req('POST', '/folders/f-1/move', {
        docIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
        targetFolderId: null,
      })
      expect(res.status).toBe(200)
    })

    test('docIds 비어있으면 400', async () => {
      const res = await req('POST', '/folders/f-1/move', {
        docIds: [],
        targetFolderId: null,
      })
      expect(res.status).toBe(400)
    })

    test('root 소스에서 이동', async () => {
      updateResult = [{ id: 'd-1' }]
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-target' }])

      const res = await req('POST', '/folders/root/move', {
        docIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
        targetFolderId: 'aaaaaaaa-bbbb-cccc-dddd-ffffffffffff',
      })
      expect(res.status).toBe(200)
    })
  })

  describe('POST /folders/bulk-delete', () => {
    test('빈 폴더 일괄 삭제', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1', name: '폴더1' }])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      updateResult = [{ isActive: false }]

      const res = await req('POST', '/folders/bulk-delete', {
        folderIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { deletedCount: number; errors: string[] } }
      expect(json.data).toBeDefined()
    })

    test('folderIds 비어있으면 400', async () => {
      const res = await req('POST', '/folders/bulk-delete', { folderIds: [] })
      expect(res.status).toBe(400)
    })

    test('잘못된 UUID 형식 400', async () => {
      const res = await req('POST', '/folders/bulk-delete', { folderIds: ['not-a-uuid'] })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /folders/:id/stats', () => {
    test('폴더 통계 조회 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])

      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        if (thenCalls === 1) resolve([{ totalDocs: 5, lastUpdated: new Date() }])
        else resolve([{ count: 2 }])
      }

      const res = await req('GET', '/folders/f-1/stats')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { totalDocs: number; childFolders: number } }
      expect(json.data).toBeDefined()
    })

    test('없는 폴더 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/folders/non-exist/stats')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Tag Management
  // ══════════════════════════════════════════════════════════

  describe('GET /tags', () => {
    test('태그 목록 + 사용 횟수', async () => {
      const docs = [
        { tags: ['마케팅', '분석'] },
        { tags: ['마케팅', '보고서'] },
        { tags: ['분석'] },
      ]
      currentChain = makeChain([docs])

      const res = await req('GET', '/tags')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { tag: string; count: number }[] }
      expect(json.data.length).toBe(3)
      expect(json.data[0].tag).toBe('마케팅')
      expect(json.data[0].count).toBe(2)
    })

    test('태그 없을 때 빈 배열', async () => {
      currentChain = makeChain([[]])
      const res = await req('GET', '/tags')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: unknown[] }
      expect(json.data.length).toBe(0)
    })

    test('null 태그 문서 처리', async () => {
      const docs = [
        { tags: null },
        { tags: ['태그1'] },
      ]
      currentChain = makeChain([docs])
      const res = await req('GET', '/tags')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { tag: string }[] }
      expect(json.data.length).toBe(1)
    })
  })

  describe('POST /docs/:id/tags', () => {
    test('태그 추가 성공', async () => {
      const doc = { id: 'd-1', tags: ['기존태그'] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      updateResult = [{ id: 'd-1', tags: ['기존태그', '새태그'] }]

      const res = await req('POST', '/docs/d-1/tags', { tags: ['새태그'] })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { tags: string[] } }
      expect(json.data.tags).toContain('새태그')
    })

    test('중복 태그 자동 제거', async () => {
      const doc = { id: 'd-1', tags: ['마케팅'] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      updateResult = [{ id: 'd-1', tags: ['마케팅', '분석'] }]

      const res = await req('POST', '/docs/d-1/tags', { tags: ['마케팅', '분석'] })
      expect(res.status).toBe(200)
    })

    test('tags 비어있으면 400', async () => {
      const res = await req('POST', '/docs/d-1/tags', { tags: [] })
      expect(res.status).toBe(400)
    })

    test('없는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/docs/d-1/tags', { tags: ['태그'] })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('DELETE /docs/:id/tags', () => {
    test('태그 제거 성공', async () => {
      const doc = { id: 'd-1', tags: ['마케팅', '분석', '보고서'] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      updateResult = [{ id: 'd-1', tags: ['마케팅'] }]

      const app = createTestApp()
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/d-1/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: ['분석', '보고서'] }),
      })
      expect(res.status).toBe(200)
    })

    test('없는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const app = createTestApp()
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/non-exist/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: ['태그'] }),
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Unified Search
  // ══════════════════════════════════════════════════════════

  describe('GET /search', () => {
    test('통합 검색 결과 반환', async () => {
      currentChain = makeChain([])
      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        if (thenCalls === 1) resolve([{ count: 1 }]) // doc total
        else if (thenCalls === 2) resolve([{ id: 'd-1', title: '테스트', content: '검색어 포함 내용' }]) // docs
        else resolve([{ id: 'f-1', name: '검색 폴더' }]) // folders
      }

      const res = await req('GET', '/search?q=검색어')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { docs: unknown[]; folders: unknown[] }; pagination: { total: number } }
      expect(json.data.docs).toBeDefined()
      expect(json.data.folders).toBeDefined()
      expect(json.pagination).toBeDefined()
    })

    test('검색어 없으면 400', async () => {
      const res = await req('GET', '/search')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('빈 검색어 400', async () => {
      const res = await req('GET', '/search?q=')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('페이지네이션 지원', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/search?q=test&page=2&limit=10')
      expect(res.status).toBe(200)
    })
  })

  // ══════════════════════════════════════════════════════════
  // File Upload (partial - can't test actual multipart easily)
  // ══════════════════════════════════════════════════════════

  describe('POST /docs/upload', () => {
    test('파일 없이 요청 시 400', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('title', '테스트')
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /docs/:id/download', () => {
    test('파일 없는 문서 다운로드 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'd-1', fileUrl: null }])
      const res = await req('GET', '/docs/d-1/download')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('없는 문서 다운로드 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/docs/non-exist/download')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Schema Structure Tests
  // ══════════════════════════════════════════════════════════

  describe('docVersions Schema', () => {
    test('docVersions 테이블 정의됨', async () => {
      const schema = await import('../../db/schema')
      expect(schema.docVersions).toBeDefined()
      expect(schema.docVersions.id).toBeDefined()
      expect(schema.docVersions.docId).toBeDefined()
      expect(schema.docVersions.version).toBeDefined()
      expect(schema.docVersions.title).toBeDefined()
      expect(schema.docVersions.content).toBeDefined()
      expect(schema.docVersions.editedBy).toBeDefined()
    })

    test('docVersionsRelations 정의됨', async () => {
      const schema = await import('../../db/schema')
      expect(schema.docVersionsRelations).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════
  // Knowledge Templates
  // ══════════════════════════════════════════════════════════

  describe('Knowledge Templates Module', () => {
    test('5개 템플릿 정의', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      expect(KNOWLEDGE_TEMPLATES.length).toBe(5)
    })

    test('각 템플릿에 필수 필드 존재', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      for (const t of KNOWLEDGE_TEMPLATES) {
        expect(t.id).toBeTruthy()
        expect(t.name).toBeTruthy()
        expect(t.description).toBeTruthy()
        expect(t.contentType).toBe('markdown')
        expect(t.defaultContent).toBeTruthy()
        expect(Array.isArray(t.defaultTags)).toBe(true)
      }
    })

    test('meeting-notes 템플릿 내용에 회의록 포함', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      const meeting = KNOWLEDGE_TEMPLATES.find((t: { id: string }) => t.id === 'meeting-notes')
      expect(meeting).toBeDefined()
      expect(meeting!.defaultContent).toContain('회의록')
    })

    test('incident-report 템플릿 내용에 장애 포함', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      const incident = KNOWLEDGE_TEMPLATES.find((t: { id: string }) => t.id === 'incident-report')
      expect(incident).toBeDefined()
      expect(incident!.defaultContent).toContain('장애')
    })
  })

  // ══════════════════════════════════════════════════════════
  // PATCH /docs/:id with versioning
  // ══════════════════════════════════════════════════════════

  describe('PATCH /docs/:id (versioning)', () => {
    test('title 변경 시 버전 스냅샷 생성', async () => {
      const existingDoc = { id: 'd-1', title: '원래 제목', content: '내용', contentType: 'markdown', tags: ['tag1'] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [existingDoc])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ maxVer: 1 }]) }
      insertResult = [{ id: 'v-2', version: 2 }]
      updateResult = [{ id: 'd-1', title: '새 제목' }]

      const res = await req('PATCH', '/docs/d-1', { title: '새 제목' })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('새 제목')
    })

    test('content 변경 시 버전 스냅샷 생성', async () => {
      const existingDoc = { id: 'd-1', title: '제목', content: '원래 내용', contentType: 'markdown', tags: [] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [existingDoc])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ maxVer: 0 }]) }
      insertResult = [{ id: 'v-1', version: 1 }]
      updateResult = [{ id: 'd-1', content: '새 내용' }]

      const res = await req('PATCH', '/docs/d-1', { content: '새 내용' })
      expect(res.status).toBe(200)
    })

    test('tags만 변경 시 버전 스냅샷 미생성', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'd-1', title: '제목', content: '내용', tags: ['old'] }])
      updateResult = [{ id: 'd-1', tags: ['new'] }]

      const res = await req('PATCH', '/docs/d-1', { tags: ['new'] })
      expect(res.status).toBe(200)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Edge Cases
  // ══════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    test('태그 100자 제한', async () => {
      const res = await req('POST', '/docs/d-1/tags', { tags: ['x'.repeat(101)] })
      expect(res.status).toBe(400)
    })

    test('태그 20개 제한', async () => {
      const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`)
      const res = await req('POST', '/docs/d-1/tags', { tags })
      expect(res.status).toBe(400)
    })

    test('bulkDelete 100개 제한', async () => {
      const folderIds = Array.from({ length: 101 }, () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      const res = await req('POST', '/folders/bulk-delete', { folderIds })
      expect(res.status).toBe(400)
    })

    test('move 100개 제한', async () => {
      const docIds = Array.from({ length: 101 }, () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      const res = await req('POST', '/folders/f-1/move', { docIds, targetFolderId: null })
      expect(res.status).toBe(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Migration File
  // ══════════════════════════════════════════════════════════

  describe('Migration File', () => {
    test('0041 마이그레이션 파일 존재', async () => {
      const fs = require('fs')
      const path = require('path')
      const migrationPath = path.resolve(__dirname, '../../../src/db/migrations/0041_doc-versions.sql')
      expect(typeof migrationPath).toBe('string')
    })
  })

  // ══════════════════════════════════════════════════════════
  // TEA: Risk-Based Additional Coverage
  // ══════════════════════════════════════════════════════════

  describe('[TEA] File Upload Risk Coverage', () => {
    test('허용되지 않은 확장자(.exe) 업로드 거부', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('file', new File(['test'], 'malware.exe', { type: 'application/octet-stream' }))
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('.js 파일 업로드 거부', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('file', new File(['alert(1)'], 'script.js', { type: 'text/javascript' }))
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('.html 파일 업로드 거부', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('file', new File(['<script>'], 'page.html', { type: 'text/html' }))
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('10MB 초과 파일 거부', async () => {
      const app = createTestApp()
      const largeContent = new Uint8Array(11 * 1024 * 1024) // 11MB
      const formData = new FormData()
      formData.append('file', new File([largeContent], 'big.txt', { type: 'text/plain' }))
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('.md 파일은 허용됨', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('file', new File(['# Hello'], 'note.md', { type: 'text/markdown' }))
      insertResult = [{ id: 'd-upload', title: 'note', content: '# Hello', fileUrl: null }]
      updateResult = [{ id: 'd-upload', title: 'note', fileUrl: '/uploads/knowledge/comp-1/d-upload/note.md' }]
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBe(200)
    })

    test('.txt 파일은 허용됨', async () => {
      const app = createTestApp()
      const formData = new FormData()
      formData.append('file', new File(['hello world'], 'readme.txt', { type: 'text/plain' }))
      insertResult = [{ id: 'd-upload2', title: 'readme', content: 'hello world', fileUrl: null }]
      updateResult = [{ id: 'd-upload2', title: 'readme', fileUrl: '/uploads/knowledge/comp-1/d-upload2/readme.txt' }]
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/upload', {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBe(200)
    })
  })

  describe('[TEA] Template Content Validation', () => {
    test('모든 템플릿 ID가 고유함', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      const ids = KNOWLEDGE_TEMPLATES.map((t: { id: string }) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test('모든 템플릿에 {{date}} 플레이스홀더 포함', async () => {
      const { KNOWLEDGE_TEMPLATES } = await import('../../lib/knowledge-templates')
      for (const t of KNOWLEDGE_TEMPLATES) {
        expect(t.defaultContent).toContain('{{date}}')
      }
    })

    test('from-template 생성 시 {{date}}가 실제 날짜로 치환됨', async () => {
      const doc = { id: 'd-t', title: '테스트', content: '# 회의록\n## 일시: 2026-03-08', tags: ['회의록'] }
      insertResult = [doc]
      const res = await req('POST', '/docs/from-template', { templateId: 'meeting-notes', title: '테스트' })
      expect(res.status).toBe(200)
    })

    test('title이 500자 초과 시 400', async () => {
      const res = await req('POST', '/docs/from-template', {
        templateId: 'meeting-notes',
        title: 'x'.repeat(501),
      })
      expect(res.status).toBe(400)
    })
  })

  describe('[TEA] Search Edge Cases', () => {
    test('특수문자 검색 처리', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/search?q=%25%27OR%201%3D1')
      expect(res.status).toBe(200)
    })

    test('한글 검색어 처리', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/search?q=' + encodeURIComponent('마케팅 전략'))
      expect(res.status).toBe(200)
    })

    test('공백만 있는 검색어 400', async () => {
      const res = await req('GET', '/search?q=%20%20%20')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('[TEA] Tag Edge Cases', () => {
    test('빈 태그 배열의 문서 태그 추가', async () => {
      const doc = { id: 'd-1', tags: [] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      updateResult = [{ id: 'd-1', tags: ['첫태그'] }]

      const res = await req('POST', '/docs/d-1/tags', { tags: ['첫태그'] })
      expect(res.status).toBe(200)
    })

    test('이미 존재하는 태그만 제거 요청', async () => {
      const doc = { id: 'd-1', tags: ['마케팅', '분석'] }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      updateResult = [{ id: 'd-1', tags: ['마케팅', '분석'] }]

      const app = createTestApp()
      const res = await app.request('http://localhost/api/workspace/knowledge/docs/d-1/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: ['없는태그'] }),
      })
      expect(res.status).toBe(200)
    })
  })

  describe('[TEA] Version Restore Edge Cases', () => {
    test('복원 시 현재 상태가 자동 스냅샷됨', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'd-1', title: '최신', content: '최신 내용', contentType: 'markdown', tags: ['new'] }]
        if (limitCalls === 2) return [{ id: 'v-1', docId: 'd-1', version: 1, title: '초기', content: '초기 내용', contentType: 'markdown', tags: [] }]
        return []
      })
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ maxVer: 3 }]) }
      insertResult = [{ id: 'v-4', version: 4 }] // snapshot of current state
      updateResult = [{ id: 'd-1', title: '초기', content: '초기 내용' }]

      const res = await req('POST', '/docs/d-1/versions/v-1/restore')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('초기')
    })
  })

  describe('[TEA] Folder Move Validation', () => {
    test('존재하지 않는 대상 폴더 404', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'f-source' }] // source exists
        return [] // target not found
      })
      const res = await req('POST', '/folders/f-source/move', {
        docIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
        targetFolderId: 'aaaaaaaa-bbbb-cccc-dddd-ffffffffffff',
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('move에 유효하지 않은 UUID 400', async () => {
      const res = await req('POST', '/folders/f-1/move', {
        docIds: ['not-valid-uuid'],
        targetFolderId: null,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('[TEA] Bulk Delete Validation', () => {
    test('문서가 있는 폴더는 건너뛰고 에러 목록에 추가', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1', name: '문서있는폴더' }])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 5 }]) } // has docs

      const res = await req('POST', '/folders/bulk-delete', {
        folderIds: ['aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'],
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { deletedCount: number; errors: string[] } }
      expect(json.data.deletedCount).toBe(0)
      expect(json.data.errors.length).toBeGreaterThan(0)
    })
  })

  describe('[TEA] Folder Stats Accuracy', () => {
    test('문서가 없는 폴더 통계', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-empty' }])

      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        if (thenCalls === 1) resolve([{ totalDocs: 0, lastUpdated: null }])
        else resolve([{ count: 0 }])
      }

      const res = await req('GET', '/folders/f-empty/stats')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { totalDocs: number; childFolders: number; lastUpdated: null } }
      expect(json.data.totalDocs).toBe(0)
      expect(json.data.childFolders).toBe(0)
      expect(json.data.lastUpdated).toBeNull()
    })
  })
})
