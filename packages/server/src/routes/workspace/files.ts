import { Hono } from 'hono'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { files } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'
import { join } from 'path'
import { mkdir, unlink } from 'fs/promises'

export const filesRoute = new Hono<AppEnv>()
filesRoute.use('*', authMiddleware)

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// GET /api/workspace/files — 내 회사 파일 목록
filesRoute.get('/files', async (c) => {
  const tenant = c.get('tenant')
  const result = await db
    .select()
    .from(files)
    .where(and(eq(files.companyId, tenant.companyId), eq(files.isActive, true)))
    .orderBy(desc(files.createdAt))
  return c.json({ data: result })
})

// POST /api/workspace/files/upload — 파일 업로드
filesRoute.post('/files/upload', async (c) => {
  const tenant = c.get('tenant')
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    throw new HTTPError(400, '파일이 필요합니다', 'FILE_001')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HTTPError(400, '파일 크기는 10MB를 초과할 수 없습니다', 'FILE_002')
  }

  // 저장 디렉토리 생성
  const companyDir = join(UPLOAD_DIR, tenant.companyId)
  await mkdir(companyDir, { recursive: true })

  // 고유 파일명 생성
  const ext = file.name.split('.').pop() || ''
  const storageName = `${crypto.randomUUID()}.${ext}`
  const storagePath = join(companyDir, storageName)

  // 파일 저장
  const buffer = await file.arrayBuffer()
  await Bun.write(storagePath, buffer)

  // DB 기록
  const [saved] = await db.insert(files).values({
    companyId: tenant.companyId,
    userId: tenant.userId,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    storagePath,
  }).returning()

  return c.json({ data: saved }, 201)
})

// GET /api/workspace/files/:id/download — 파일 다운로드
filesRoute.get('/files/:id/download', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.companyId, tenant.companyId), eq(files.isActive, true)))
    .limit(1)

  if (!file) throw new HTTPError(404, '파일을 찾을 수 없습니다', 'FILE_003')

  const fileData = Bun.file(file.storagePath)
  if (!await fileData.exists()) {
    throw new HTTPError(404, '파일이 서버에서 삭제되었습니다', 'FILE_004')
  }

  return new Response(fileData.stream(), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
      'Content-Length': String(file.sizeBytes),
    },
  })
})

// DELETE /api/workspace/files/:id — 파일 삭제 (소프트)
filesRoute.delete('/files/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [file] = await db
    .select()
    .from(files)
    .where(and(eq(files.id, id), eq(files.companyId, tenant.companyId)))
    .limit(1)

  if (!file) throw new HTTPError(404, '파일을 찾을 수 없습니다', 'FILE_003')

  // 소프트 삭제
  await db.update(files).set({ isActive: false }).where(eq(files.id, id))

  // 실제 파일도 삭제 시도
  try { await unlink(file.storagePath) } catch {}

  return c.json({ data: { message: '삭제되었습니다' } })
})
