import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import { parsePaginationParams } from '../../services/activity-log-service'
import { getOperationLogs, getOperationLogsForExport, getOperationDetail } from '../../services/operation-log-service'
import { addBookmark, removeBookmark, updateBookmarkNote, listBookmarks } from '../../services/bookmark-service'
import type { AppEnv } from '../../types'

export const operationLogRoute = new Hono<AppEnv>()

operationLogRoute.use('*', authMiddleware)
operationLogRoute.use('*', departmentScopeMiddleware)

// GET /operation-log — 작전일지 목록 (검색/필터/정렬/페이지네이션)
operationLogRoute.get('/operation-log', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await getOperationLogs(tenant.companyId, {
    search: query.search?.trim(),
    startDate: query.startDate,
    endDate: query.endDate,
    targetAgentId: query.targetAgentId,
    departmentId: query.departmentId,
    departmentIds: tenant.departmentIds,
    type: query.type,
    status: query.status,
    minScore: query.minScore ? Number(query.minScore) : undefined,
    maxScore: query.maxScore ? Number(query.maxScore) : undefined,
    bookmarkedOnly: query.bookmarkedOnly === 'true',
    userId: tenant.userId,
    sortBy: (query.sortBy as any) || 'date',
    sortOrder: (query.sortOrder as any) || 'desc',
  }, pagination)

  return c.json({ success: true, data: result })
})

// GET /operation-log/export — CSV 내보내기용 데이터
operationLogRoute.get('/operation-log/export', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()

  const items = await getOperationLogsForExport(tenant.companyId, {
    search: query.search?.trim(),
    startDate: query.startDate,
    endDate: query.endDate,
    targetAgentId: query.targetAgentId,
    departmentId: query.departmentId,
    departmentIds: tenant.departmentIds,
    type: query.type,
    status: query.status,
    minScore: query.minScore ? Number(query.minScore) : undefined,
    maxScore: query.maxScore ? Number(query.maxScore) : undefined,
    userId: tenant.userId,
    sortBy: (query.sortBy as any) || 'date',
    sortOrder: (query.sortOrder as any) || 'desc',
  })

  return c.json({ success: true, data: items })
})

// === Bookmark routes (MUST be before :id to prevent route conflict) ===

// GET /operation-log/bookmarks — 북마크 목록
operationLogRoute.get('/operation-log/bookmarks', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await listBookmarks(tenant.companyId, tenant.userId, pagination)

  return c.json({ success: true, data: result })
})

// POST /operation-log/bookmarks — 북마크 추가
operationLogRoute.post('/operation-log/bookmarks', async (c) => {
  const tenant = c.get('tenant')
  const body = await c.req.json<{ commandId: string; note?: string }>()

  if (!body.commandId) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: 'commandId는 필수입니다' } }, 400)
  }

  const result = await addBookmark(tenant.companyId, tenant.userId, body.commandId, body.note)

  if ('error' in result) {
    if (result.error === 'DUPLICATE') {
      return c.json({ success: false, error: { code: 'DUPLICATE', message: '이미 북마크된 명령입니다' } }, 409)
    }
    if (result.error === 'COMMAND_NOT_FOUND') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 명령을 찾을 수 없습니다' } }, 404)
    }
  }

  return c.json({ success: true, data: result }, 201)
})

// PATCH /operation-log/bookmarks/:id — 북마크 노트 수정
operationLogRoute.patch('/operation-log/bookmarks/:id', async (c) => {
  const tenant = c.get('tenant')
  const bookmarkId = c.req.param('id')
  const body = await c.req.json<{ note: string }>()

  if (body.note === undefined) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: 'note 필드는 필수입니다' } }, 400)
  }

  const updated = await updateBookmarkNote(tenant.companyId, tenant.userId, bookmarkId, body.note)

  if (!updated) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 북마크를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: { id: bookmarkId } })
})

// DELETE /operation-log/bookmarks/:id — 북마크 삭제
operationLogRoute.delete('/operation-log/bookmarks/:id', async (c) => {
  const tenant = c.get('tenant')
  const bookmarkId = c.req.param('id')

  const deleted = await removeBookmark(tenant.companyId, tenant.userId, bookmarkId)

  if (!deleted) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 북마크를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: { id: bookmarkId } })
})

// GET /operation-log/:id — 작전일지 상세 (MUST be after /bookmarks routes)
operationLogRoute.get('/operation-log/:id', async (c) => {
  const tenant = c.get('tenant')
  const commandId = c.req.param('id')

  const item = await getOperationDetail(tenant.companyId, commandId, tenant.userId)
  if (!item) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 명령을 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: item })
})
