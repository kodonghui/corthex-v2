import { describe, test, expect, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'

// === Mock Setup ===

const COMPANY_ID = 'test-company-id'
const USER_ID = 'test-user-id'
const COMMAND_ID = '00000000-0000-0000-0000-000000000010'
const BOOKMARK_ID = '00000000-0000-0000-0000-000000000020'

let mockGetOperationLogs: any
let mockGetOperationLogsForExport: any
let mockGetOperationDetail: any
let mockAddBookmark: any
let mockRemoveBookmark: any
let mockUpdateBookmarkNote: any
let mockListBookmarks: any

const { operationLogRoute } = await (async () => {
  const { mock } = await import('bun:test')

  // Mock auth middleware
  mock.module('../../middleware/auth', () => ({
    authMiddleware: async (c: any, next: any) => {
      c.set('tenant', {
        companyId: COMPANY_ID,
        userId: USER_ID,
        role: 'user',
        departmentIds: undefined,
      })
      await next()
    },
  }))

  // Mock department scope middleware
  mock.module('../../middleware/department-scope', () => ({
    departmentScopeMiddleware: async (_c: any, next: any) => await next(),
  }))

  // Mock activity-log-service (shared helpers)
  mock.module('../../services/activity-log-service', () => ({
    parsePaginationParams: (query: Record<string, string | undefined>) => {
      const page = Math.max(1, Number(query.page) || 1)
      const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
      const offset = (page - 1) * limit
      return { page, limit, offset }
    },
  }))

  // Mock operation-log-service
  mockGetOperationLogs = mock(() => Promise.resolve({ items: [], page: 1, limit: 20, total: 0 }))
  mockGetOperationLogsForExport = mock(() => Promise.resolve([]))
  mockGetOperationDetail = mock(() => Promise.resolve(null))

  mock.module('../../services/operation-log-service', () => ({
    getOperationLogs: (...args: any[]) => mockGetOperationLogs(...args),
    getOperationLogsForExport: (...args: any[]) => mockGetOperationLogsForExport(...args),
    getOperationDetail: (...args: any[]) => mockGetOperationDetail(...args),
  }))

  // Mock bookmark-service
  mockAddBookmark = mock(() => Promise.resolve({ id: BOOKMARK_ID }))
  mockRemoveBookmark = mock(() => Promise.resolve(true))
  mockUpdateBookmarkNote = mock(() => Promise.resolve(true))
  mockListBookmarks = mock(() => Promise.resolve({ items: [], page: 1, limit: 20, total: 0 }))

  mock.module('../../services/bookmark-service', () => ({
    addBookmark: (...args: any[]) => mockAddBookmark(...args),
    removeBookmark: (...args: any[]) => mockRemoveBookmark(...args),
    updateBookmarkNote: (...args: any[]) => mockUpdateBookmarkNote(...args),
    listBookmarks: (...args: any[]) => mockListBookmarks(...args),
  }))

  return import('../../routes/workspace/operation-log')
})()

// === Test App ===

const app = new Hono<AppEnv>()
app.route('/api/workspace', operationLogRoute)

// === Helpers ===

function resetMocks() {
  mockGetOperationLogs.mockImplementation(() =>
    Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
  )
  mockGetOperationLogsForExport.mockImplementation(() => Promise.resolve([]))
  mockGetOperationDetail.mockImplementation(() => Promise.resolve(null))
  mockAddBookmark.mockImplementation(() => Promise.resolve({ id: BOOKMARK_ID }))
  mockRemoveBookmark.mockImplementation(() => Promise.resolve(true))
  mockUpdateBookmarkNote.mockImplementation(() => Promise.resolve(true))
  mockListBookmarks.mockImplementation(() =>
    Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
  )
}

// === Tests ===

describe('Operation Log API', () => {
  beforeEach(() => resetMocks())

  // --- Route Structure ---

  describe('Route Structure', () => {
    test('GET /operation-log returns paginated results', async () => {
      mockGetOperationLogs.mockImplementation(() =>
        Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      )
      const res = await app.request('/api/workspace/operation-log')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('items')
      expect(body.data).toHaveProperty('page')
      expect(body.data).toHaveProperty('limit')
      expect(body.data).toHaveProperty('total')
    })

    test('GET /operation-log/export returns array', async () => {
      mockGetOperationLogsForExport.mockImplementation(() => Promise.resolve([]))
      const res = await app.request('/api/workspace/operation-log/export')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
    })

    test('GET /operation-log/:id returns detail', async () => {
      mockGetOperationDetail.mockImplementation(() =>
        Promise.resolve({
          id: COMMAND_ID, companyId: COMPANY_ID, userId: USER_ID, type: 'direct',
          text: 'test command', targetAgentId: null, targetAgentName: null,
          targetDepartmentId: null, targetDepartmentName: null, status: 'completed',
          result: 'test result', metadata: null, createdAt: new Date(), completedAt: new Date(),
          qualityScore: null, qualityConclusion: null, totalCostMicro: null, durationMs: null,
          isBookmarked: false, bookmarkId: null, bookmarkNote: null,
        })
      )
      const res = await app.request(`/api/workspace/operation-log/${COMMAND_ID}`)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(COMMAND_ID)
    })

    test('GET /operation-log/:id returns 404 if not found', async () => {
      mockGetOperationDetail.mockImplementation(() => Promise.resolve(null))
      const res = await app.request(`/api/workspace/operation-log/${COMMAND_ID}`)
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })

  // --- Pagination ---

  describe('Pagination', () => {
    test('defaults to page 1, limit 20', async () => {
      const res = await app.request('/api/workspace/operation-log')
      const body = await res.json()
      expect(body.data.page).toBe(1)
      expect(body.data.limit).toBe(20)
    })

    test('passes custom page and limit to service', async () => {
      mockGetOperationLogs.mockImplementation((_cid: string, _f: any, pag: any) =>
        Promise.resolve({ items: [], page: pag.page, limit: pag.limit, total: 50 })
      )
      const res = await app.request('/api/workspace/operation-log?page=3&limit=10')
      const body = await res.json()
      expect(body.data.page).toBe(3)
      expect(body.data.limit).toBe(10)
    })

    test('caps limit at 100', async () => {
      mockGetOperationLogs.mockImplementation((_cid: string, _f: any, pag: any) =>
        Promise.resolve({ items: [], page: pag.page, limit: pag.limit, total: 0 })
      )
      const res = await app.request('/api/workspace/operation-log?limit=500')
      const body = await res.json()
      expect(body.data.limit).toBe(100)
    })
  })

  // --- Filter passing ---

  describe('Filters', () => {
    test('passes search filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?search=hello')
      expect(capturedFilters.search).toBe('hello')
    })

    test('passes date range filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?startDate=2026-01-01&endDate=2026-12-31')
      expect(capturedFilters.startDate).toBe('2026-01-01')
      expect(capturedFilters.endDate).toBe('2026-12-31')
    })

    test('passes targetAgentId filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request(`/api/workspace/operation-log?targetAgentId=${COMMAND_ID}`)
      expect(capturedFilters.targetAgentId).toBe(COMMAND_ID)
    })

    test('passes departmentId filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request(`/api/workspace/operation-log?departmentId=${COMMAND_ID}`)
      expect(capturedFilters.departmentId).toBe(COMMAND_ID)
    })

    test('passes type filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?type=direct')
      expect(capturedFilters.type).toBe('direct')
    })

    test('passes status filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?status=completed')
      expect(capturedFilters.status).toBe('completed')
    })

    test('passes quality score range', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?minScore=3&maxScore=5')
      expect(capturedFilters.minScore).toBe(3)
      expect(capturedFilters.maxScore).toBe(5)
    })

    test('passes bookmarkedOnly filter', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?bookmarkedOnly=true')
      expect(capturedFilters.bookmarkedOnly).toBe(true)
    })

    test('passes userId from tenant', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log')
      expect(capturedFilters.userId).toBe(USER_ID)
    })

    test('passes companyId from tenant', async () => {
      let capturedCompanyId: string
      mockGetOperationLogs.mockImplementation((cid: string) => {
        capturedCompanyId = cid
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log')
      expect(capturedCompanyId!).toBe(COMPANY_ID)
    })
  })

  // --- Sort ---

  describe('Sort Options', () => {
    for (const sortBy of ['date', 'qualityScore', 'cost', 'duration']) {
      test(`passes sortBy=${sortBy}`, async () => {
        let capturedFilters: any
        mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
          capturedFilters = f
          return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
        })
        await app.request(`/api/workspace/operation-log?sortBy=${sortBy}`)
        expect(capturedFilters.sortBy).toBe(sortBy)
      })
    }

    test('passes sortOrder=asc', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log?sortOrder=asc')
      expect(capturedFilters.sortOrder).toBe('asc')
    })

    test('defaults sortBy to date', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log')
      expect(capturedFilters.sortBy).toBe('date')
    })

    test('defaults sortOrder to desc', async () => {
      let capturedFilters: any
      mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
        capturedFilters = f
        return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
      })
      await app.request('/api/workspace/operation-log')
      expect(capturedFilters.sortOrder).toBe('desc')
    })
  })

  // --- Command type filter ---

  describe('Command Type Filter', () => {
    const validTypes = ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork']
    for (const type of validTypes) {
      test(`type=${type} passed correctly`, async () => {
        let capturedFilters: any
        mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
          capturedFilters = f
          return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
        })
        await app.request(`/api/workspace/operation-log?type=${type}`)
        expect(capturedFilters.type).toBe(type)
      })
    }
  })

  // --- Status filter ---

  describe('Status Filter', () => {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled']
    for (const status of validStatuses) {
      test(`status=${status} passed correctly`, async () => {
        let capturedFilters: any
        mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
          capturedFilters = f
          return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
        })
        await app.request(`/api/workspace/operation-log?status=${status}`)
        expect(capturedFilters.status).toBe(status)
      })
    }
  })
})

// === Bookmark API ===

describe('Bookmark API', () => {
  beforeEach(() => resetMocks())

  describe('POST /operation-log/bookmarks', () => {
    test('requires commandId', async () => {
      const res = await app.request('/api/workspace/operation-log/bookmarks', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('INVALID_INPUT')
      expect(body.error.message).toContain('commandId')
    })

    test('returns 404 for non-existent command', async () => {
      mockAddBookmark.mockImplementation(() => Promise.resolve({ error: 'COMMAND_NOT_FOUND' }))
      const res = await app.request('/api/workspace/operation-log/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ commandId: COMMAND_ID }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })

    test('returns 409 for duplicate bookmark', async () => {
      mockAddBookmark.mockImplementation(() => Promise.resolve({ error: 'DUPLICATE' }))
      const res = await app.request('/api/workspace/operation-log/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ commandId: COMMAND_ID }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('DUPLICATE')
    })

    test('creates bookmark successfully', async () => {
      mockAddBookmark.mockImplementation(() => Promise.resolve({ id: BOOKMARK_ID }))
      const res = await app.request('/api/workspace/operation-log/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ commandId: COMMAND_ID, note: 'important' }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(BOOKMARK_ID)
    })

    test('passes correct args to addBookmark', async () => {
      let capturedArgs: any[]
      mockAddBookmark.mockImplementation((...args: any[]) => {
        capturedArgs = args
        return Promise.resolve({ id: BOOKMARK_ID })
      })
      await app.request('/api/workspace/operation-log/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ commandId: COMMAND_ID, note: 'test note' }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(capturedArgs![0]).toBe(COMPANY_ID)  // companyId
      expect(capturedArgs![1]).toBe(USER_ID)      // userId
      expect(capturedArgs![2]).toBe(COMMAND_ID)   // commandId
      expect(capturedArgs![3]).toBe('test note')  // note
    })
  })

  describe('GET /operation-log/bookmarks', () => {
    test('returns paginated bookmark list', async () => {
      mockListBookmarks.mockImplementation(() =>
        Promise.resolve({
          items: [{ id: BOOKMARK_ID, commandId: COMMAND_ID, note: 'test' }],
          page: 1, limit: 20, total: 1,
        })
      )
      const res = await app.request('/api/workspace/operation-log/bookmarks')
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('items')
      expect(body.data).toHaveProperty('total')
      expect(body.data).toHaveProperty('page')
      expect(body.data.total).toBe(1)
    })

    test('passes pagination params', async () => {
      let capturedPag: any
      mockListBookmarks.mockImplementation((_cid: string, _uid: string, pag: any) => {
        capturedPag = pag
        return Promise.resolve({ items: [], page: pag.page, limit: pag.limit, total: 0 })
      })
      const res = await app.request('/api/workspace/operation-log/bookmarks?page=2&limit=5')
      const body = await res.json()
      expect(body.data.page).toBe(2)
      expect(body.data.limit).toBe(5)
    })
  })

  describe('PATCH /operation-log/bookmarks/:id', () => {
    test('requires note field', async () => {
      const res = await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('INVALID_INPUT')
    })

    test('returns 404 for non-existent bookmark', async () => {
      mockUpdateBookmarkNote.mockImplementation(() => Promise.resolve(false))
      const res = await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: 'updated' }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(404)
    })

    test('updates note successfully', async () => {
      mockUpdateBookmarkNote.mockImplementation(() => Promise.resolve(true))
      const res = await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: 'updated note' }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(BOOKMARK_ID)
    })

    test('passes correct args to updateBookmarkNote', async () => {
      let capturedArgs: any[]
      mockUpdateBookmarkNote.mockImplementation((...args: any[]) => {
        capturedArgs = args
        return Promise.resolve(true)
      })
      await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: 'new note' }),
        headers: { 'Content-Type': 'application/json' },
      })
      expect(capturedArgs![0]).toBe(COMPANY_ID)
      expect(capturedArgs![1]).toBe(USER_ID)
      expect(capturedArgs![2]).toBe(BOOKMARK_ID)
      expect(capturedArgs![3]).toBe('new note')
    })
  })

  describe('DELETE /operation-log/bookmarks/:id', () => {
    test('returns 404 for non-existent bookmark', async () => {
      mockRemoveBookmark.mockImplementation(() => Promise.resolve(false))
      const res = await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'DELETE',
      })
      expect(res.status).toBe(404)
    })

    test('deletes bookmark successfully', async () => {
      mockRemoveBookmark.mockImplementation(() => Promise.resolve(true))
      const res = await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'DELETE',
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(BOOKMARK_ID)
    })

    test('passes correct args to removeBookmark', async () => {
      let capturedArgs: any[]
      mockRemoveBookmark.mockImplementation((...args: any[]) => {
        capturedArgs = args
        return Promise.resolve(true)
      })
      await app.request(`/api/workspace/operation-log/bookmarks/${BOOKMARK_ID}`, {
        method: 'DELETE',
      })
      expect(capturedArgs![0]).toBe(COMPANY_ID)
      expect(capturedArgs![1]).toBe(USER_ID)
      expect(capturedArgs![2]).toBe(BOOKMARK_ID)
    })
  })
})

// === Response Format ===

describe('Response Format Compliance', () => {
  beforeEach(() => resetMocks())

  test('success response follows { success: true, data } pattern', async () => {
    const res = await app.request('/api/workspace/operation-log')
    const body = await res.json()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('data')
  })

  test('error response follows { success: false, error: { code, message } } pattern', async () => {
    const res = await app.request('/api/workspace/operation-log/bookmarks', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const body = await res.json()
    expect(body).toHaveProperty('success', false)
    expect(body.error).toHaveProperty('code')
    expect(body.error).toHaveProperty('message')
  })

  test('bookmark 409 response has correct format', async () => {
    mockAddBookmark.mockImplementation(() => Promise.resolve({ error: 'DUPLICATE' }))
    const res = await app.request('/api/workspace/operation-log/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ commandId: COMMAND_ID }),
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('DUPLICATE')
  })
})

// === SQL Injection Prevention ===

describe('SQL Injection Prevention', () => {
  beforeEach(() => resetMocks())

  test('search with special chars passes to service (service handles escaping)', async () => {
    let capturedSearch: string
    mockGetOperationLogs.mockImplementation((_cid: string, f: any) => {
      capturedSearch = f.search
      return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
    })
    await app.request(`/api/workspace/operation-log?search=${encodeURIComponent("'; DROP TABLE commands; --")}`)
    expect(capturedSearch!).toBe("'; DROP TABLE commands; --")
  })
})

// === Export ===

describe('Export Data', () => {
  beforeEach(() => resetMocks())

  test('export route calls getOperationLogsForExport', async () => {
    const mockData = [
      { id: COMMAND_ID, type: 'direct', text: 'test', status: 'completed', createdAt: '2026-01-01' },
    ]
    mockGetOperationLogsForExport.mockImplementation(() => Promise.resolve(mockData))
    const res = await app.request('/api/workspace/operation-log/export')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual(mockData)
  })

  test('export passes same filters as list', async () => {
    let capturedFilters: any
    mockGetOperationLogsForExport.mockImplementation((_cid: string, f: any) => {
      capturedFilters = f
      return Promise.resolve([])
    })
    await app.request('/api/workspace/operation-log/export?search=test&type=direct&status=completed')
    expect(capturedFilters.search).toBe('test')
    expect(capturedFilters.type).toBe('direct')
    expect(capturedFilters.status).toBe('completed')
  })
})

// === Migration File ===

describe('Migration File', () => {
  const fs = require('fs')
  const path = require('path')
  const migrationPath = path.join(__dirname, '../../db/migrations/0037_bookmarks-table.sql')

  test('migration file exists', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
  })

  test('contains CREATE TABLE bookmarks', () => {
    const content = fs.readFileSync(migrationPath, 'utf8')
    expect(content).toContain('CREATE TABLE bookmarks')
  })

  test('contains all required columns', () => {
    const content = fs.readFileSync(migrationPath, 'utf8')
    expect(content).toContain('company_id')
    expect(content).toContain('user_id')
    expect(content).toContain('command_id')
    expect(content).toContain('note')
    expect(content).toContain('created_at')
    expect(content).toContain('updated_at')
  })

  test('contains unique constraint', () => {
    const content = fs.readFileSync(migrationPath, 'utf8')
    expect(content).toContain('UNIQUE')
    expect(content).toContain('bookmarks_company_user_command_uniq')
  })

  test('contains company-user index', () => {
    const content = fs.readFileSync(migrationPath, 'utf8')
    expect(content).toContain('bookmarks_company_user_idx')
  })

  test('has foreign key references', () => {
    const content = fs.readFileSync(migrationPath, 'utf8')
    expect(content).toContain('REFERENCES companies(id)')
    expect(content).toContain('REFERENCES users(id)')
    expect(content).toContain('REFERENCES commands(id)')
  })
})

// === Route Registration ===

describe('Route Registration', () => {
  test('operationLogRoute is a valid Hono instance', () => {
    expect(operationLogRoute).toBeDefined()
    expect(operationLogRoute).toBeInstanceOf(Hono)
  })
})

// === Tenant Isolation ===

describe('Tenant Isolation', () => {
  beforeEach(() => resetMocks())

  test('companyId from tenant is passed to all service calls', async () => {
    let capturedCompanyId: string
    mockGetOperationLogs.mockImplementation((cid: string) => {
      capturedCompanyId = cid
      return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
    })
    await app.request('/api/workspace/operation-log')
    expect(capturedCompanyId!).toBe(COMPANY_ID)
  })

  test('userId from tenant is passed to bookmark operations', async () => {
    let capturedUserId: string
    mockListBookmarks.mockImplementation((_cid: string, uid: string) => {
      capturedUserId = uid
      return Promise.resolve({ items: [], page: 1, limit: 20, total: 0 })
    })
    await app.request('/api/workspace/operation-log/bookmarks')
    expect(capturedUserId!).toBe(USER_ID)
  })
})
