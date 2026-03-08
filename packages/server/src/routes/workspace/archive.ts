import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import { parsePaginationParams } from '../../services/activity-log-service'
import {
  createArchiveItem,
  getArchiveItems,
  getArchiveDetail,
  updateArchiveItem,
  softDeleteArchiveItem,
  findSimilarDocuments,
  getArchiveStats,
} from '../../services/archive-service'
import {
  listArchiveFolders,
  createArchiveFolder,
  renameArchiveFolder,
  deleteArchiveFolder,
} from '../../services/archive-folder-service'
import type { AppEnv } from '../../types'

export const archiveRoute = new Hono<AppEnv>()

archiveRoute.use('*', authMiddleware)
archiveRoute.use('*', departmentScopeMiddleware)

// === Folder routes (MUST be before /:id) ===

// GET /archive/folders — 폴더 목록 (트리)
archiveRoute.get('/folders', async (c) => {
  const tenant = c.get('tenant')
  const folders = await listArchiveFolders(tenant.companyId)
  return c.json({ success: true, data: folders })
})

// POST /archive/folders — 폴더 생성
archiveRoute.post('/folders', async (c) => {
  const tenant = c.get('tenant')
  const body = await c.req.json<{ name: string; parentId?: string }>()

  if (!body.name?.trim()) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '폴더 이름은 필수입니다' } }, 400)
  }

  const result = await createArchiveFolder(tenant.companyId, body.name.trim(), body.parentId)

  if ('error' in result) {
    if (result.error === 'PARENT_NOT_FOUND') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: '상위 폴더를 찾을 수 없습니다' } }, 404)
    }
  }

  return c.json({ success: true, data: result.data }, 201)
})

// PATCH /archive/folders/:id — 폴더 이름 변경
archiveRoute.patch('/folders/:id', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')
  const body = await c.req.json<{ name: string }>()

  if (!body.name?.trim()) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '폴더 이름은 필수입니다' } }, 400)
  }

  const result = await renameArchiveFolder(tenant.companyId, folderId, body.name.trim())

  if ('error' in result) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 폴더를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: result.data })
})

// DELETE /archive/folders/:id — 빈 폴더만 삭제
archiveRoute.delete('/folders/:id', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')

  const result = await deleteArchiveFolder(tenant.companyId, folderId)

  if ('error' in result) {
    if (result.error === 'HAS_CHILDREN' || result.error === 'HAS_DOCUMENTS') {
      return c.json({ success: false, error: { code: 'CONFLICT', message: '폴더에 하위 항목이 있어 삭제할 수 없습니다' } }, 409)
    }
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 폴더를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: result.data })
})

// === Stats route ===

// GET /archive/stats — 통계
archiveRoute.get('/stats', async (c) => {
  const tenant = c.get('tenant')
  const stats = await getArchiveStats(tenant.companyId)
  return c.json({ success: true, data: stats })
})

// === Archive item routes ===

// GET /archive — 목록
archiveRoute.get('/', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const tags = query.tags ? query.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined

  const result = await getArchiveItems(tenant.companyId, {
    search: query.search?.trim(),
    classification: query.classification,
    departmentId: query.departmentId,
    agentId: query.agentId,
    startDate: query.startDate,
    endDate: query.endDate,
    tags,
    folderId: query.folderId,
    includeDeleted: query.includeDeleted === 'true',
    departmentIds: tenant.departmentIds,
    sortBy: (query.sortBy as any) || 'date',
    sortOrder: (query.sortOrder as any) || 'desc',
  }, pagination)

  return c.json({ success: true, data: result })
})

// POST /archive — 아카이브 생성
archiveRoute.post('/', async (c) => {
  const tenant = c.get('tenant')
  const body = await c.req.json<{
    commandId: string
    title: string
    classification: string
    summary?: string
    tags?: string[]
    folderId?: string
  }>()

  if (!body.commandId || !body.title?.trim() || !body.classification) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: 'commandId, title, classification은 필수입니다' } }, 400)
  }

  const validClassifications = ['public', 'internal', 'confidential', 'secret']
  if (!validClassifications.includes(body.classification)) {
    return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '유효하지 않은 등급입니다' } }, 400)
  }

  const result = await createArchiveItem(tenant.companyId, tenant.userId, {
    commandId: body.commandId,
    title: body.title.trim(),
    classification: body.classification as any,
    summary: body.summary?.trim(),
    tags: body.tags,
    folderId: body.folderId,
  })

  if ('error' in result) {
    if (result.error === 'ALREADY_ARCHIVED') {
      return c.json({ success: false, error: { code: 'CONFLICT', message: '이미 아카이브된 명령입니다' } }, 409)
    }
    if (result.error === 'COMMAND_NOT_FOUND') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 명령을 찾을 수 없습니다' } }, 404)
    }
    if (result.error === 'COMMAND_NOT_COMPLETED') {
      return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '완료된 명령만 아카이브할 수 있습니다' } }, 400)
    }
    if (result.error === 'FOLDER_NOT_FOUND') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 폴더를 찾을 수 없습니다' } }, 404)
    }
  }

  return c.json({ success: true, data: (result as { data: unknown }).data }, 201)
})

// GET /archive/:id/similar — 유사 문서
archiveRoute.get('/:id/similar', async (c) => {
  const tenant = c.get('tenant')
  const archiveId = c.req.param('id')

  const similar = await findSimilarDocuments(tenant.companyId, archiveId)
  return c.json({ success: true, data: similar })
})

// GET /archive/:id — 상세
archiveRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const archiveId = c.req.param('id')

  const detail = await getArchiveDetail(tenant.companyId, archiveId)
  if (!detail) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 기밀문서를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: detail })
})

// PATCH /archive/:id — 수정
archiveRoute.patch('/:id', async (c) => {
  const tenant = c.get('tenant')
  const archiveId = c.req.param('id')
  const body = await c.req.json<{
    title?: string
    classification?: string
    summary?: string
    tags?: string[]
    folderId?: string | null
  }>()

  if (body.classification) {
    const validClassifications = ['public', 'internal', 'confidential', 'secret']
    if (!validClassifications.includes(body.classification)) {
      return c.json({ success: false, error: { code: 'INVALID_INPUT', message: '유효하지 않은 등급입니다' } }, 400)
    }
  }

  const result = await updateArchiveItem(tenant.companyId, archiveId, {
    title: body.title?.trim(),
    classification: body.classification as any,
    summary: body.summary,
    tags: body.tags,
    folderId: body.folderId,
  })

  if ('error' in result) {
    if (result.error === 'FOLDER_NOT_FOUND') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 폴더를 찾을 수 없습니다' } }, 404)
    }
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 기밀문서를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: result.data })
})

// DELETE /archive/:id — soft delete
archiveRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const archiveId = c.req.param('id')

  const deleted = await softDeleteArchiveItem(tenant.companyId, archiveId)
  if (!deleted) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: '해당 기밀문서를 찾을 수 없습니다' } }, 404)
  }

  return c.json({ success: true, data: { id: archiveId } })
})
