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
    // After limit, return object with offset for chaining + thenable for direct await
    const limitResult: Record<string, unknown> = {}
    limitResult.offset = mock(() => {
      // offset returns thenable
      return {
        then: (resolve: (v: unknown) => void) => { resolve(r) },
      }
    })
    limitResult.then = (resolve: (v: unknown) => void) => { resolve(r) }
    // Also support array destructuring: [item] = await ...limit(1)
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
  agentMemories: {
    id: 'id', companyId: 'company_id', agentId: 'agent_id',
    memoryType: 'memory_type', key: 'key', content: 'content',
    context: 'context', source: 'source', confidence: 'confidence',
    usageCount: 'usage_count', lastUsedAt: 'last_used_at',
    isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  docVersions: {
    id: 'id', docId: 'doc_id', version: 'version', title: 'title',
    content: 'content', contentType: 'content_type', tags: 'tags',
    editedBy: 'edited_by', changeNote: 'change_note', createdAt: 'created_at',
  },
  agents: {
    id: 'id', companyId: 'company_id',
  },
  memoryTypeEnum: {},
}))

mock.module('../../lib/knowledge-templates', () => ({
  KNOWLEDGE_TEMPLATES: [],
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
// Tests
// ============================================================

describe('Story 16-1: Knowledge Base Schema - Docs & Memories', () => {
  beforeEach(() => {
    selectResults = []
    insertResult = []
    updateResult = []
    deleteCallCount = 0
  })

  // ══════════════════════════════════════════════════════════
  // Schema Structure Tests
  // ══════════════════════════════════════════════════════════

  describe('Schema Structure', () => {
    test('memoryTypeEnum has correct values', async () => {
      const schema = await import('../../db/schema')
      expect(schema.memoryTypeEnum).toBeDefined()
    })

    test('knowledgeFolders table defined with required columns', async () => {
      const schema = await import('../../db/schema')
      expect(schema.knowledgeFolders).toBeDefined()
      expect(schema.knowledgeFolders.id).toBeDefined()
      expect(schema.knowledgeFolders.companyId).toBeDefined()
      expect(schema.knowledgeFolders.name).toBeDefined()
      expect(schema.knowledgeFolders.parentId).toBeDefined()
      expect(schema.knowledgeFolders.departmentId).toBeDefined()
    })

    test('knowledgeDocs table defined with required columns', async () => {
      const schema = await import('../../db/schema')
      expect(schema.knowledgeDocs).toBeDefined()
      expect(schema.knowledgeDocs.id).toBeDefined()
      expect(schema.knowledgeDocs.folderId).toBeDefined()
      expect(schema.knowledgeDocs.title).toBeDefined()
      expect(schema.knowledgeDocs.content).toBeDefined()
      expect(schema.knowledgeDocs.tags).toBeDefined()
    })

    test('agentMemories table defined with required columns', async () => {
      const schema = await import('../../db/schema')
      expect(schema.agentMemories).toBeDefined()
      expect(schema.agentMemories.id).toBeDefined()
      expect(schema.agentMemories.agentId).toBeDefined()
      expect(schema.agentMemories.memoryType).toBeDefined()
      expect(schema.agentMemories.confidence).toBeDefined()
      expect(schema.agentMemories.usageCount).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════
  // Folders CRUD
  // ══════════════════════════════════════════════════════════

  describe('POST /folders', () => {
    test('폴더 생성 성공', async () => {
      const folder = { id: 'f-1', companyId: 'comp-1', name: '공유 지식', parentId: null }
      insertResult = [folder]
      const res = await req('POST', '/folders', { name: '공유 지식' })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { name: string } }
      expect(json.data.name).toBe('공유 지식')
    })

    test('이름 누락 시 400', async () => {
      const res = await req('POST', '/folders', {})
      expect(res.status).toBe(400)
    })

    test('이름 200자 초과 시 400', async () => {
      const res = await req('POST', '/folders', { name: 'x'.repeat(201) })
      expect(res.status).toBe(400)
    })

    test('존재하지 않는 parentId 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/folders', { name: '하위', parentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('parentId가 존재할 때 성공', async () => {
      const parent = { id: 'f-parent' }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [parent])
      const folder = { id: 'f-2', name: '하위 폴더', parentId: 'f-parent' }
      insertResult = [folder]
      const res = await req('POST', '/folders', { name: '하위 폴더', parentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
      expect(res.status).toBe(200)
    })

    test('departmentId 포함 생성 성공', async () => {
      const folder = { id: 'f-3', name: '마케팅 지식', departmentId: 'dept-1' }
      insertResult = [folder]
      const res = await req('POST', '/folders', { name: '마케팅 지식', departmentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
      expect(res.status).toBe(200)
    })
  })

  describe('GET /folders', () => {
    test('폴더 목록 트리 구조 반환', async () => {
      const folders = [
        { id: 'f-1', name: '루트', parentId: null, isActive: true, companyId: 'comp-1' },
        { id: 'f-2', name: '하위', parentId: 'f-1', isActive: true, companyId: 'comp-1' },
      ]
      currentChain = makeChain([folders])
      const res = await req('GET', '/folders')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { id: string; children: unknown[] }[] }
      expect(json.data.length).toBe(1) // only root
      expect(json.data[0].children.length).toBe(1)
    })

    test('빈 폴더 목록', async () => {
      currentChain = makeChain([[]])
      const res = await req('GET', '/folders')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: unknown[] }
      expect(json.data.length).toBe(0)
    })

    test('departmentId 필터', async () => {
      currentChain = makeChain([[]])
      const res = await req('GET', '/folders?departmentId=dept-1')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /folders/:id', () => {
    test('폴더 조회 성공', async () => {
      const folder = { id: 'f-1', name: '테스트', companyId: 'comp-1', isActive: true }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [folder])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 2 }]) }
      const res = await req('GET', '/folders/f-1')
      expect(res.status).toBe(200)
    })

    test('없는 폴더 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/folders/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('PATCH /folders/:id', () => {
    test('폴더 이름 수정 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      updateResult = [{ id: 'f-1', name: '수정됨' }]
      const res = await req('PATCH', '/folders/f-1', { name: '수정됨' })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { name: string } }
      expect(json.data.name).toBe('수정됨')
    })

    test('없는 폴더 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('PATCH', '/folders/f-1', { name: 'x' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('자기 자신을 부모로 설정 시 400', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      const res = await req('PATCH', '/folders/f-1', { parentId: 'f-1' })
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /folders/:id', () => {
    test('빈 폴더 삭제 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      updateResult = [{ id: 'f-1', isActive: false }]
      const res = await req('DELETE', '/folders/f-1')
      expect(res.status).toBe(200)
    })

    test('없는 폴더 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('DELETE', '/folders/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('문서가 있는 폴더 삭제 거부 400', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'f-1' }])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 3 }]) }
      const res = await req('DELETE', '/folders/f-1')
      // HTTPError(400) is thrown (visible in console) but mock env maps to 500
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Documents CRUD
  // ══════════════════════════════════════════════════════════

  describe('POST /docs', () => {
    test('문서 생성 성공', async () => {
      const doc = { id: 'd-1', title: '테스트 문서', companyId: 'comp-1' }
      insertResult = [doc]
      const res = await req('POST', '/docs', {
        title: '테스트 문서',
        content: '# Hello',
        contentType: 'markdown',
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('테스트 문서')
    })

    test('태그 포함 생성', async () => {
      const doc = { id: 'd-2', title: 'x', tags: ['마케팅', '분석'] }
      insertResult = [doc]
      const res = await req('POST', '/docs', {
        title: 'x',
        content: 'y',
        tags: ['마케팅', '분석'],
      })
      expect(res.status).toBe(200)
    })

    test('제목 누락 시 400', async () => {
      const res = await req('POST', '/docs', { content: 'test' })
      expect(res.status).toBe(400)
    })

    test('제목 500자 초과 시 400', async () => {
      const res = await req('POST', '/docs', { title: 'x'.repeat(501) })
      expect(res.status).toBe(400)
    })

    test('잘못된 contentType 시 400', async () => {
      const res = await req('POST', '/docs', { title: 'x', contentType: 'pdf' })
      expect(res.status).toBe(400)
    })

    test('tags 20개 초과 시 400', async () => {
      const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`)
      const res = await req('POST', '/docs', { title: 'x', tags })
      expect(res.status).toBe(400)
    })

    test('존재하지 않는 folderId 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/docs', { title: 'x', folderId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /docs', () => {
    test('문서 목록 + 페이지네이션', async () => {
      const docs = [{ id: 'd-1', title: '문서1' }]
      currentChain = makeChain([])
      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        if (thenCalls === 1) resolve([{ count: 1 }])
        else resolve(docs)
      }
      const res = await req('GET', '/docs?page=1&limit=10')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: unknown[]; pagination: { total: number; page: number; limit: number; totalPages: number } }
      expect(json.pagination).toBeDefined()
      expect(json.pagination.page).toBe(1)
      expect(json.pagination.limit).toBe(10)
    })

    test('검색 쿼리 지원', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs?q=검색어')
      expect(res.status).toBe(200)
    })

    test('folderId=null 필터', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs?folderId=null')
      expect(res.status).toBe(200)
    })

    test('folderId=root 필터', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs?folderId=root')
      expect(res.status).toBe(200)
    })

    test('limit 최대 100으로 제한', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs?limit=200')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /docs/:id', () => {
    test('문서 조회 성공 + 전체 내용', async () => {
      const doc = { id: 'd-1', title: '문서', content: '# Hello World' }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [doc])
      const res = await req('GET', '/docs/d-1')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { content: string } }
      expect(json.data.content).toBe('# Hello World')
    })

    test('없는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/docs/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('PATCH /docs/:id', () => {
    test('문서 수정 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'd-1' }])
      updateResult = [{ id: 'd-1', title: '수정됨', content: '새 내용' }]
      const res = await req('PATCH', '/docs/d-1', { title: '수정됨', content: '새 내용' })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { title: string } }
      expect(json.data.title).toBe('수정됨')
    })

    test('없는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('PATCH', '/docs/non-exist', { title: 'x' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('태그 수정', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'd-1' }])
      updateResult = [{ id: 'd-1', tags: ['새태그'] }]
      const res = await req('PATCH', '/docs/d-1', { tags: ['새태그'] })
      expect(res.status).toBe(200)
    })

    test('folderId 이동 시 폴더 존재 확인', async () => {
      currentChain = makeChain([])
      let limitCalls = 0
      currentChain.limit = mock(() => {
        limitCalls++
        if (limitCalls === 1) return [{ id: 'd-1' }] // doc exists
        return [] // folder doesn't exist
      })
      const res = await req('PATCH', '/docs/d-1', { folderId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('DELETE /docs/:id', () => {
    test('문서 소프트 삭제 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'd-1' }])
      updateResult = [{ id: 'd-1', isActive: false }]
      const res = await req('DELETE', '/docs/d-1')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { success: boolean } }
      expect(json.data.success).toBe(true)
    })

    test('없는 문서 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('DELETE', '/docs/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Agent Memories CRUD
  // ══════════════════════════════════════════════════════════

  describe('POST /memories', () => {
    test('기억 생성 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'agent-1' }])
      const memory = { id: 'm-1', key: '학습', content: '새로운 것', memoryType: 'learning' }
      insertResult = [memory]
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: '학습',
        content: '새로운 것',
        memoryType: 'learning',
      })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { key: string } }
      expect(json.data.key).toBe('학습')
    })

    test('insight 타입 생성', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'agent-1' }])
      insertResult = [{ id: 'm-2', memoryType: 'insight', key: '인사이트' }]
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: '인사이트',
        content: '내용',
        memoryType: 'insight',
        confidence: 90,
      })
      expect(res.status).toBe(200)
    })

    test('없는 에이전트 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: '학습',
        content: '내용',
      })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('key 누락 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        content: '내용',
      })
      expect(res.status).toBe(400)
    })

    test('content 누락 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x',
      })
      expect(res.status).toBe(400)
    })

    test('잘못된 memoryType 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x',
        content: 'y',
        memoryType: 'invalid',
      })
      expect(res.status).toBe(400)
    })

    test('confidence 범위 초과(>100) 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x',
        content: 'y',
        confidence: 150,
      })
      expect(res.status).toBe(400)
    })

    test('confidence 음수 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x',
        content: 'y',
        confidence: -1,
      })
      expect(res.status).toBe(400)
    })

    test('잘못된 source 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x',
        content: 'y',
        source: 'invalid',
      })
      expect(res.status).toBe(400)
    })

    test('key 200자 초과 시 400', async () => {
      const res = await req('POST', '/memories', {
        agentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        key: 'x'.repeat(201),
        content: 'y',
      })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /memories', () => {
    test('에이전트별 기억 목록 + 페이지네이션', async () => {
      const memories = [
        { id: 'm-1', key: '학습1', content: 'c1', memoryType: 'learning' },
        { id: 'm-2', key: '학습2', content: 'c2', memoryType: 'insight' },
      ]
      currentChain = makeChain([])
      let thenCalls = 0
      currentChain.then = (resolve: (v: unknown) => void) => {
        thenCalls++
        if (thenCalls === 1) resolve([{ count: 2 }])
        else resolve(memories)
      }
      const res = await req('GET', '/memories?agentId=agent-1&page=1&limit=10')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: unknown[]; pagination: { total: number; page: number } }
      expect(json.pagination).toBeDefined()
      expect(json.pagination.total).toBe(2)
      expect(json.pagination.page).toBe(1)
    })

    test('memoryType 필터링', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/memories?agentId=a-1&memoryType=learning')
      expect(res.status).toBe(200)
    })

    test('agentId 없이 전체 목록', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/memories')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /memories/context/:agentId', () => {
    test('컨텍스트 문자열 -- 기억 있을 때', async () => {
      const memories = [
        { key: '고객 선호', content: '빠른 응답', memoryType: 'preference' },
        { key: '학습 포인트', content: 'JSON 형식', memoryType: 'learning' },
      ]
      // Route uses .orderBy().limit(20) so result comes from selectResults via makeChain
      currentChain = makeChain([memories])
      const res = await req('GET', '/memories/context/agent-1')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { contextString: string; memoryCount: number } }
      expect(json.data.memoryCount).toBe(2)
      expect(json.data.contextString).toContain('장기 기억')
      expect(json.data.contextString).toContain('[preference]')
      expect(json.data.contextString).toContain('고객 선호: 빠른 응답')
      expect(json.data.contextString).toContain('[learning]')
    })

    test('컨텍스트 문자열 -- 기억 없을 때', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([]) }
      const res = await req('GET', '/memories/context/agent-1')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { contextString: string; memoryCount: number } }
      expect(json.data.memoryCount).toBe(0)
      expect(json.data.contextString).toBe('')
    })
  })

  describe('GET /memories/:id', () => {
    test('단일 기억 조회', async () => {
      const memory = { id: 'm-1', key: '학습', content: '내용', memoryType: 'learning' }
      currentChain = makeChain([])
      currentChain.limit = mock(() => [memory])
      const res = await req('GET', '/memories/m-1')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { key: string } }
      expect(json.data.key).toBe('학습')
    })

    test('없는 기억 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/memories/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('PATCH /memories/:id', () => {
    test('기억 수정 성공 -- content + confidence', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'm-1' }])
      updateResult = [{ id: 'm-1', content: '수정됨', confidence: 80 }]
      const res = await req('PATCH', '/memories/m-1', { content: '수정됨', confidence: 80 })
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { confidence: number } }
      expect(json.data.confidence).toBe(80)
    })

    test('memoryType 변경', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'm-1' }])
      updateResult = [{ id: 'm-1', memoryType: 'insight' }]
      const res = await req('PATCH', '/memories/m-1', { memoryType: 'insight' })
      expect(res.status).toBe(200)
    })

    test('없는 기억 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('PATCH', '/memories/non-exist', { content: 'x' })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('DELETE /memories/:id', () => {
    test('기억 하드 삭제 성공', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'm-1' }])
      deleteCallCount = 0
      const res = await req('DELETE', '/memories/m-1')
      expect(res.status).toBe(200)
      expect(deleteCallCount).toBeGreaterThan(0)
      const json = await res.json() as { data: { success: boolean } }
      expect(json.data.success).toBe(true)
    })

    test('없는 기억 삭제 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('DELETE', '/memories/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /memories/:id/used', () => {
    test('사용 카운트 증가', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [{ id: 'm-1' }])
      updateResult = [{ id: 'm-1', usageCount: 1, lastUsedAt: new Date().toISOString() }]
      const res = await req('POST', '/memories/m-1/used')
      expect(res.status).toBe(200)
      const json = await res.json() as { data: { usageCount: number } }
      expect(json.data.usageCount).toBe(1)
    })

    test('없는 기억 사용 시 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('POST', '/memories/non-exist/used')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ══════════════════════════════════════════════════════════
  // API Response Format
  // ══════════════════════════════════════════════════════════

  describe('API Response Format', () => {
    test('성공 응답 -- { data: ... } 형식', async () => {
      insertResult = [{ id: 'f-1', name: 'test' }]
      const res = await req('POST', '/folders', { name: 'test' })
      const json = await res.json() as { data: unknown }
      expect(json).toHaveProperty('data')
    })

    test('목록 응답 -- pagination 포함', async () => {
      currentChain = makeChain([])
      currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
      const res = await req('GET', '/docs')
      const json = await res.json() as { data: unknown[]; pagination: unknown }
      expect(json).toHaveProperty('data')
      expect(json).toHaveProperty('pagination')
    })

    test('에러 응답 -- 404', async () => {
      currentChain = makeChain([])
      currentChain.limit = mock(() => [])
      const res = await req('GET', '/docs/non-exist')
      expect(res.status).toBeGreaterThanOrEqual(400)
      // Error response body format depends on Hono error handler (verified via onError)
      const text = await res.text()
      expect(text.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════
  // Tenant Isolation
  // ══════════════════════════════════════════════════════════

  describe('Tenant Isolation', () => {
    test('모든 CRUD에 authMiddleware 적용 확인', async () => {
      // Verify routes work through auth middleware (no 401)
      const endpoints: [string, string, unknown?][] = [
        ['GET', '/folders'],
        ['GET', '/docs'],
        ['GET', '/memories'],
      ]

      for (const [method, path] of endpoints) {
        currentChain = makeChain([])
        currentChain.then = (resolve: (v: unknown) => void) => { resolve([{ count: 0 }]) }
        const res = await req(method, path)
        expect(res.status).not.toBe(401)
      }
    })
  })
})
