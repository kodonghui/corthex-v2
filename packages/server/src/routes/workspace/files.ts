import { Hono } from 'hono'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { files } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import { saveFile, getFilePath } from '../../lib/file-storage'
import { validateMagicBytes, sanitizeFilename } from '../../lib/upload-security'
import type { AppEnv } from '../../types'

export const filesRoute = new Hono<AppEnv>()

filesRoute.use('*', authMiddleware)

const MAX_FILE_SIZE = 52_428_800 // 50MB

const ALLOWED_MIME_PREFIXES = ['image/', 'text/']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/json',
  'application/zip',
]

function isAllowedMimeType(mimeType: string): boolean {
  // SVGs can contain <script> tags — XSS vector (NFR-S12)
  if (mimeType === 'image/svg+xml') return false
  if (ALLOWED_MIME_PREFIXES.some(p => mimeType.startsWith(p))) return true
  return ALLOWED_MIME_TYPES.includes(mimeType)
}

// POST /api/workspace/files — 파일 업로드
filesRoute.post('/', async (c) => {
  const tenant = c.get('tenant')

  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    throw new HTTPError(400, '파일이 필요합니다', 'FILE_001')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HTTPError(400, '파일 크기는 50MB 이하만 허용됩니다', 'FILE_002')
  }

  if (!isAllowedMimeType(file.type)) {
    throw new HTTPError(400, '허용되지 않는 파일 형식입니다', 'FILE_003')
  }

  const buffer = await file.arrayBuffer()

  // Validate magic bytes match declared MIME type (NFR-S12)
  if (!validateMagicBytes(buffer, file.type)) {
    throw new HTTPError(400, '파일 내용이 선언된 형식과 일치하지 않습니다', 'FILE_004')
  }

  const { storagePath } = await saveFile(buffer, file.name, tenant.companyId)

  const [saved] = await db
    .insert(files)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      filename: sanitizeFilename(file.name),
      mimeType: file.type,
      sizeBytes: file.size,
      storagePath,
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `파일 업로드: ${file.name}`,
  })

  return c.json({
    data: {
      id: saved.id,
      filename: saved.filename,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      createdAt: saved.createdAt,
    },
  }, 201)
})

// GET /api/workspace/files — 내 회사 파일 목록
filesRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: files.id,
      userId: files.userId,
      filename: files.filename,
      mimeType: files.mimeType,
      sizeBytes: files.sizeBytes,
      createdAt: files.createdAt,
    })
    .from(files)
    .where(and(eq(files.companyId, tenant.companyId), eq(files.isActive, true)))
    .orderBy(desc(files.createdAt))
    .limit(50)

  return c.json({ data: result })
})

// GET /api/workspace/files/:id/download — 파일 다운로드
filesRoute.get('/:id/download', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.companyId, tenant.companyId), eq(files.isActive, true)))
    .limit(1)

  if (!file) throw new HTTPError(404, '파일을 찾을 수 없습니다', 'FILE_004')

  const filePath = getFilePath(file.storagePath)
  const fileHandle = Bun.file(filePath)

  if (!await fileHandle.exists()) {
    throw new HTTPError(404, '파일이 저장소에서 삭제되었습니다', 'FILE_005')
  }

  const encodedFilename = encodeURIComponent(file.filename)

  return new Response(fileHandle.stream(), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': String(file.sizeBytes),
    },
  })
})

// DELETE /api/workspace/files/:id — 파일 소프트 삭제
filesRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [file] = await db
    .select({ id: files.id, userId: files.userId, filename: files.filename })
    .from(files)
    .where(and(eq(files.id, id), eq(files.companyId, tenant.companyId), eq(files.isActive, true)))
    .limit(1)

  if (!file) throw new HTTPError(404, '파일을 찾을 수 없습니다', 'FILE_004')
  if (file.userId !== tenant.userId) {
    throw new HTTPError(403, '본인이 업로드한 파일만 삭제할 수 있습니다', 'FILE_006')
  }

  await db
    .update(files)
    .set({ isActive: false })
    .where(eq(files.id, id))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `파일 삭제: ${file.filename}`,
  })

  return c.json({ data: { deleted: true } })
})
