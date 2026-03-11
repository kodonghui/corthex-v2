import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, asc, count, ilike, or, isNull, sql, max } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeFolders, knowledgeDocs, docVersions, agentMemories, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { KNOWLEDGE_TEMPLATES } from '../../lib/knowledge-templates'
import { clearKnowledgeCache, getInjectionPreview } from '../../services/knowledge-injector'
import { consolidateMemories } from '../../services/memory-extractor'
import { triggerEmbedding } from '../../services/embedding-service'
import { semanticSearch } from '../../services/semantic-search'
import type { AppEnv } from '../../types'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export const knowledgeRoute = new Hono<AppEnv>()

knowledgeRoute.use('*', authMiddleware)

// Invalidate knowledge injection cache on any mutation
knowledgeRoute.use('*', async (c, next) => {
  await next()
  const method = c.req.method
  if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
    const tenant = c.get('tenant')
    if (tenant?.companyId) {
      clearKnowledgeCache(tenant.companyId)
    }
  }
})

// ── Zod Schemas ──

const createFolderSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
})

const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
})

const createDocSchema = z.object({
  folderId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
  content: z.string().optional(),
  contentType: z.enum(['markdown', 'text', 'html', 'mermaid']).default('markdown'),
  fileUrl: z.string().max(2000).optional(),
  tags: z.array(z.string().max(100)).max(20).default([]),
})

const updateDocSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  contentType: z.enum(['markdown', 'text', 'html', 'mermaid']).optional(),
  fileUrl: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  folderId: z.string().uuid().nullable().optional(),
})

const createMemorySchema = z.object({
  agentId: z.string().uuid(),
  memoryType: z.enum(['learning', 'insight', 'preference', 'fact']).default('learning'),
  key: z.string().min(1).max(200),
  content: z.string().min(1),
  context: z.string().max(5000).optional(),
  source: z.enum(['manual', 'auto', 'system']).default('manual'),
  confidence: z.number().int().min(0).max(100).default(50),
})

const updateMemorySchema = z.object({
  key: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  context: z.string().max(5000).nullable().optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  memoryType: z.enum(['learning', 'insight', 'preference', 'fact']).optional(),
})

// ══════════════════════════════════════════════════════════
// FOLDERS CRUD
// ══════════════════════════════════════════════════════════

// POST /folders — 폴더 생성
knowledgeRoute.post('/folders', zValidator('json', createFolderSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Validate parentId exists if provided
  if (body.parentId) {
    const parent = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, body.parentId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (parent.length === 0) throw new HTTPError(404, '상위 폴더를 찾을 수 없습니다')
  }

  const [folder] = await db.insert(knowledgeFolders).values({
    companyId: tenant.companyId,
    name: body.name,
    description: body.description,
    parentId: body.parentId || null,
    departmentId: body.departmentId || null,
    createdBy: tenant.userId,
  }).returning()

  return c.json({ data: folder })
})

// GET /folders — 폴더 목록 (트리 구조)
knowledgeRoute.get('/folders', async (c) => {
  const tenant = c.get('tenant')
  const departmentId = c.req.query('departmentId')

  const conditions = [
    eq(knowledgeFolders.companyId, tenant.companyId),
    eq(knowledgeFolders.isActive, true),
  ]
  if (departmentId) {
    conditions.push(eq(knowledgeFolders.departmentId, departmentId))
  }

  const folders = await db.select()
    .from(knowledgeFolders)
    .where(and(...conditions))
    .orderBy(asc(knowledgeFolders.name))

  // Build tree structure in-memory
  const folderMap = new Map<string, typeof folders[0] & { children: unknown[]; docCount?: number }>()
  const roots: (typeof folders[0] & { children: unknown[]; docCount?: number })[] = []

  for (const f of folders) {
    folderMap.set(f.id, { ...f, children: [] })
  }
  for (const f of folders) {
    const node = folderMap.get(f.id)!
    if (f.parentId && folderMap.has(f.parentId)) {
      folderMap.get(f.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return c.json({ data: roots })
})

// GET /folders/:id — 단일 폴더 (하위 폴더 + 문서 수)
knowledgeRoute.get('/folders/:id', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')

  const [folder] = await db.select()
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))
    .limit(1)

  if (!folder) throw new HTTPError(404, '폴더를 찾을 수 없습니다')

  // Get children count
  const [childrenResult] = await db.select({ count: count() })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.parentId, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))

  // Get doc count
  const [docResult] = await db.select({ count: count() })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.folderId, folderId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))

  return c.json({
    data: {
      ...folder,
      childrenCount: childrenResult.count,
      docCount: docResult.count,
    },
  })
})

// PATCH /folders/:id — 폴더 수정
knowledgeRoute.patch('/folders/:id', zValidator('json', updateFolderSchema), async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db.select({ id: knowledgeFolders.id })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '폴더를 찾을 수 없습니다')

  // Prevent moving folder to be its own parent
  if (body.parentId === folderId) {
    throw new HTTPError(400, '폴더를 자기 자신의 하위 폴더로 이동할 수 없습니다')
  }

  // Circular reference detection
  if (body.parentId !== undefined && body.parentId !== null) {
    const circular = await hasCircularRef(folderId, body.parentId, tenant.companyId)
    if (circular) {
      throw new HTTPError(400, '순환 참조가 감지되었습니다. 하위 폴더를 상위로 이동할 수 없습니다')
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description
  if (body.parentId !== undefined) updateData.parentId = body.parentId
  if (body.departmentId !== undefined) updateData.departmentId = body.departmentId

  const [updated] = await db.update(knowledgeFolders)
    .set(updateData)
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: updated })
})

// DELETE /folders/:id — 폴더 소프트 삭제 (문서가 있으면 거부)
knowledgeRoute.delete('/folders/:id', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')

  const [existing] = await db.select({ id: knowledgeFolders.id })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '폴더를 찾을 수 없습니다')

  // Check for active docs
  const [docResult] = await db.select({ count: count() })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.folderId, folderId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))

  if (docResult.count > 0) {
    throw new HTTPError(400, `폴더에 문서 ${docResult.count}개가 있어 삭제할 수 없습니다. 문서를 먼저 이동하거나 삭제해주세요.`)
  }

  // Check for active child folders
  const [childResult] = await db.select({ count: count() })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.parentId, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))

  if (childResult.count > 0) {
    throw new HTTPError(400, `하위 폴더 ${childResult.count}개가 있어 삭제할 수 없습니다. 하위 폴더를 먼저 삭제해주세요.`)
  }

  await db.update(knowledgeFolders)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
    ))

  return c.json({ data: { success: true } })
})

// ══════════════════════════════════════════════════════════
// DOCUMENTS CRUD
// ══════════════════════════════════════════════════════════

// POST /docs — 문서 생성
knowledgeRoute.post('/docs', zValidator('json', createDocSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Validate folderId if provided
  if (body.folderId) {
    const [folder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, body.folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!folder) throw new HTTPError(404, '폴더를 찾을 수 없습니다')
  }

  const [doc] = await db.insert(knowledgeDocs).values({
    companyId: tenant.companyId,
    folderId: body.folderId || null,
    title: body.title,
    content: body.content,
    contentType: body.contentType,
    fileUrl: body.fileUrl,
    tags: body.tags,
    createdBy: tenant.userId,
  }).returning()

  // Async embedding generation (fire-and-forget, does not delay response)
  triggerEmbedding(doc.id, tenant.companyId)

  return c.json({ data: doc })
})

// GET /docs — 문서 목록 (필터 + 검색 + 페이지네이션)
knowledgeRoute.get('/docs', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.query('folderId')
  const contentTypeFilter = c.req.query('contentType')
  const q = c.req.query('q')
  const tagsParam = c.req.query('tags')
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20))
  const offset = (page - 1) * limit

  const conditions = [
    eq(knowledgeDocs.companyId, tenant.companyId),
    eq(knowledgeDocs.isActive, true),
  ]

  if (contentTypeFilter) {
    conditions.push(eq(knowledgeDocs.contentType, contentTypeFilter))
  }

  if (folderId === 'null' || folderId === 'root') {
    conditions.push(isNull(knowledgeDocs.folderId))
  } else if (folderId) {
    conditions.push(eq(knowledgeDocs.folderId, folderId))
  }

  if (q) {
    const searchPattern = `%${q}%`
    conditions.push(or(
      ilike(knowledgeDocs.title, searchPattern),
      ilike(knowledgeDocs.content, searchPattern),
    )!)
  }

  if (tagsParam) {
    const tags = tagsParam.split(',').map(t => t.trim()).filter(Boolean)
    if (tags.length > 0) {
      // Check if any of the provided tags match (parameterized, no sql.raw)
      const tagConditions = tags.map(t => sql`${knowledgeDocs.tags} @> ${JSON.stringify([t])}::jsonb`)
      conditions.push(or(...tagConditions)!)
    }
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db.select({ count: count() })
    .from(knowledgeDocs)
    .where(whereClause)

  const docs = await db.select()
    .from(knowledgeDocs)
    .where(whereClause)
    .orderBy(desc(knowledgeDocs.updatedAt))
    .limit(limit)
    .offset(offset)

  const total = totalResult.count
  return c.json({
    data: docs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

// GET /docs/:id — 단일 문서
knowledgeRoute.get('/docs/:id', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')

  const [doc] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!doc) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  return c.json({ data: doc })
})

// PATCH /docs/:id — 문서 수정 (+ 버전 스냅샷 자동 생성)
knowledgeRoute.patch('/docs/:id', zValidator('json', updateDocSchema), async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')
  const body = c.req.valid('json')

  // Load full current state for versioning
  const [existing] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  // Validate folderId if being changed
  if (body.folderId) {
    const [folder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, body.folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!folder) throw new HTTPError(404, '이동 대상 폴더를 찾을 수 없습니다')
  }

  // Create version snapshot of PREVIOUS state if title or content changed
  if (body.title !== undefined || body.content !== undefined) {
    const [maxVersion] = await db.select({ maxVer: max(docVersions.version) })
      .from(docVersions)
      .where(eq(docVersions.docId, docId))
    const nextVersion = (maxVersion?.maxVer ?? 0) + 1

    await db.insert(docVersions).values({
      docId,
      version: nextVersion,
      title: existing.title,
      content: existing.content,
      contentType: existing.contentType,
      tags: existing.tags as string[],
      editedBy: tenant.userId,
    })
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date(), updatedBy: tenant.userId }
  if (body.title !== undefined) updateData.title = body.title
  if (body.content !== undefined) updateData.content = body.content
  if (body.contentType !== undefined) updateData.contentType = body.contentType
  if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl
  if (body.tags !== undefined) updateData.tags = body.tags
  if (body.folderId !== undefined) updateData.folderId = body.folderId

  const [updated] = await db.update(knowledgeDocs)
    .set(updateData)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
    ))
    .returning()

  // Re-embed if content or title changed
  if (body.content !== undefined || body.title !== undefined) {
    triggerEmbedding(docId, tenant.companyId)
  }

  return c.json({ data: updated })
})

// DELETE /docs/:id — 문서 소프트 삭제
knowledgeRoute.delete('/docs/:id', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')

  const [existing] = await db.select({ id: knowledgeDocs.id })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  await db.update(knowledgeDocs)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
    ))

  return c.json({ data: { success: true } })
})

// ══════════════════════════════════════════════════════════
// FILE UPLOAD & DOWNLOAD
// ══════════════════════════════════════════════════════════

const UPLOAD_BASE = join(process.cwd(), 'uploads', 'knowledge')
const ALLOWED_EXTENSIONS = ['.md', '.txt', '.pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// POST /docs/upload — 파일 업로드
knowledgeRoute.post('/docs/upload', async (c) => {
  const tenant = c.get('tenant')
  const body = await c.req.parseBody()
  const file = body['file']
  const folderId = (body['folderId'] as string) || null
  const titleInput = body['title'] as string | undefined

  if (!file || !(file instanceof File)) {
    throw new HTTPError(400, '파일이 필요합니다')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HTTPError(400, '파일 크기는 10MB를 초과할 수 없습니다')
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new HTTPError(400, '허용된 파일 형식: .md, .txt, .pdf')
  }

  // Validate folderId if provided
  if (folderId) {
    const [folder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!folder) throw new HTTPError(404, '폴더를 찾을 수 없습니다')
  }

  const title = titleInput || file.name.replace(/\.[^/.]+$/, '')
  const contentType = ext === '.pdf' ? 'text' : ext === '.md' ? 'markdown' : 'text'

  // Read file content for text-based files
  let textContent: string | undefined
  const arrayBuffer = await file.arrayBuffer()
  if (ext === '.md' || ext === '.txt') {
    textContent = new TextDecoder().decode(arrayBuffer)
  }

  // Create doc record first to get ID
  const [doc] = await db.insert(knowledgeDocs).values({
    companyId: tenant.companyId,
    folderId,
    title,
    content: textContent,
    contentType,
    tags: [],
    createdBy: tenant.userId,
  }).returning()

  // Save file to disk
  const uploadDir = join(UPLOAD_BASE, tenant.companyId, doc.id)
  mkdirSync(uploadDir, { recursive: true })
  const filePath = join(uploadDir, file.name)
  await Bun.write(filePath, arrayBuffer)

  // Update doc with fileUrl
  const fileUrl = `/uploads/knowledge/${tenant.companyId}/${doc.id}/${file.name}`
  const [updated] = await db.update(knowledgeDocs)
    .set({ fileUrl })
    .where(eq(knowledgeDocs.id, doc.id))
    .returning()

  // Async embedding generation (fire-and-forget)
  triggerEmbedding(doc.id, tenant.companyId)

  return c.json({ data: { doc: updated, fileUrl } })
})

// GET /docs/:id/download — 파일 다운로드
knowledgeRoute.get('/docs/:id/download', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')

  const [doc] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!doc) throw new HTTPError(404, '문서를 찾을 수 없습니다')
  if (!doc.fileUrl) throw new HTTPError(404, '이 문서에는 첨부 파일이 없습니다')

  const filePath = join(process.cwd(), doc.fileUrl)
  if (!existsSync(filePath)) throw new HTTPError(404, '파일을 찾을 수 없습니다')

  const file = Bun.file(filePath)
  const fileName = doc.fileUrl.split('/').pop() || 'download'
  const ext = fileName.split('.').pop()?.toLowerCase()
  const contentTypeMap: Record<string, string> = {
    md: 'text/markdown',
    txt: 'text/plain',
    pdf: 'application/pdf',
  }

  return new Response(file, {
    headers: {
      'Content-Type': contentTypeMap[ext || ''] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  })
})

// ══════════════════════════════════════════════════════════
// DOCUMENT VERSIONING
// ══════════════════════════════════════════════════════════

// GET /docs/:id/versions — 문서 버전 이력
knowledgeRoute.get('/docs/:id/versions', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20))
  const offset = (page - 1) * limit

  // Verify doc belongs to tenant
  const [doc] = await db.select({ id: knowledgeDocs.id })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!doc) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  const [totalResult] = await db.select({ count: count() })
    .from(docVersions)
    .where(eq(docVersions.docId, docId))

  const versions = await db.select()
    .from(docVersions)
    .where(eq(docVersions.docId, docId))
    .orderBy(desc(docVersions.version))
    .limit(limit)
    .offset(offset)

  const total = totalResult.count
  return c.json({
    data: versions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

// POST /docs/:id/versions/:versionId/restore — 문서 버전 복원
knowledgeRoute.post('/docs/:id/versions/:versionId/restore', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')
  const versionId = c.req.param('versionId')

  // Load current doc for snapshot
  const [currentDoc] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!currentDoc) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  // Find the version to restore
  const [version] = await db.select()
    .from(docVersions)
    .where(and(
      eq(docVersions.id, versionId),
      eq(docVersions.docId, docId),
    ))
    .limit(1)

  if (!version) throw new HTTPError(404, '해당 버전을 찾을 수 없습니다')

  // Snapshot current state before restoring
  const [maxVersion] = await db.select({ maxVer: max(docVersions.version) })
    .from(docVersions)
    .where(eq(docVersions.docId, docId))
  const nextVersion = (maxVersion?.maxVer ?? 0) + 1

  await db.insert(docVersions).values({
    docId,
    version: nextVersion,
    title: currentDoc.title,
    content: currentDoc.content,
    contentType: currentDoc.contentType,
    tags: currentDoc.tags as string[],
    editedBy: tenant.userId,
    changeNote: `버전 ${version.version} 복원 전 자동 스냅샷`,
  })

  // Restore doc to version state
  const [restored] = await db.update(knowledgeDocs)
    .set({
      title: version.title,
      content: version.content,
      contentType: version.contentType,
      tags: version.tags,
      updatedBy: tenant.userId,
      updatedAt: new Date(),
    })
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: restored })
})

// ══════════════════════════════════════════════════════════
// ADVANCED FOLDER OPERATIONS
// ══════════════════════════════════════════════════════════

// Helper: circular reference detection
async function hasCircularRef(folderId: string, targetParentId: string | null, companyId: string): Promise<boolean> {
  if (!targetParentId) return false
  let current: string | null = targetParentId
  const visited = new Set<string>()
  while (current) {
    if (current === folderId) return true
    if (visited.has(current)) return false // already visited, no circular ref to folderId
    visited.add(current)
    const [parent] = await db.select({ parentId: knowledgeFolders.parentId })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, current),
        eq(knowledgeFolders.companyId, companyId),
      ))
      .limit(1)
    current = parent?.parentId ?? null
  }
  return false
}

const moveDocsSchema = z.object({
  docIds: z.array(z.string().uuid()).min(1).max(100),
  targetFolderId: z.string().uuid().nullable(),
})

// POST /folders/:id/move — 문서 일괄 이동
knowledgeRoute.post('/folders/:id/move', zValidator('json', moveDocsSchema), async (c) => {
  const tenant = c.get('tenant')
  const sourceFolderId = c.req.param('id')
  const body = c.req.valid('json')

  // Verify source folder exists (use 'root' for root-level docs)
  if (sourceFolderId !== 'root') {
    const [sourceFolder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, sourceFolderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!sourceFolder) throw new HTTPError(404, '원본 폴더를 찾을 수 없습니다')
  }

  // Verify target folder exists if not null
  if (body.targetFolderId) {
    const [targetFolder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, body.targetFolderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!targetFolder) throw new HTTPError(404, '대상 폴더를 찾을 수 없습니다')
  }

  // Move docs
  let movedCount = 0
  for (const docId of body.docIds) {
    const result = await db.update(knowledgeDocs)
      .set({ folderId: body.targetFolderId, updatedAt: new Date(), updatedBy: tenant.userId })
      .where(and(
        eq(knowledgeDocs.id, docId),
        eq(knowledgeDocs.companyId, tenant.companyId),
        eq(knowledgeDocs.isActive, true),
      ))
      .returning()
    if (result.length > 0) movedCount++
  }

  return c.json({ data: { movedCount, targetFolderId: body.targetFolderId } })
})

const bulkDeleteFoldersSchema = z.object({
  folderIds: z.array(z.string().uuid()).min(1).max(100),
})

// POST /folders/bulk-delete — 빈 폴더 일괄 소프트 삭제
knowledgeRoute.post('/folders/bulk-delete', zValidator('json', bulkDeleteFoldersSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  let deletedCount = 0
  const errors: string[] = []

  for (const folderId of body.folderIds) {
    // Check folder exists
    const [folder] = await db.select({ id: knowledgeFolders.id, name: knowledgeFolders.name })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)

    if (!folder) continue

    // Check for active docs
    const [docResult] = await db.select({ count: count() })
      .from(knowledgeDocs)
      .where(and(
        eq(knowledgeDocs.folderId, folderId),
        eq(knowledgeDocs.companyId, tenant.companyId),
        eq(knowledgeDocs.isActive, true),
      ))

    if (docResult.count > 0) {
      errors.push(`${folder.name}: 문서 ${docResult.count}개 포함`)
      continue
    }

    // Check for active child folders
    const [childResult] = await db.select({ count: count() })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.parentId, folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))

    if (childResult.count > 0) {
      errors.push(`${folder.name}: 하위 폴더 ${childResult.count}개 포함`)
      continue
    }

    await db.update(knowledgeFolders)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(knowledgeFolders.id, folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
      ))
    deletedCount++
  }

  return c.json({ data: { deletedCount, errors } })
})

// GET /folders/:id/stats — 폴더 통계
knowledgeRoute.get('/folders/:id/stats', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.param('id')

  const [folder] = await db.select({ id: knowledgeFolders.id })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.id, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))
    .limit(1)

  if (!folder) throw new HTTPError(404, '폴더를 찾을 수 없습니다')

  const [docStats] = await db.select({
    totalDocs: count(),
    lastUpdated: max(knowledgeDocs.updatedAt),
  })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.folderId, folderId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))

  const [childCount] = await db.select({ count: count() })
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.parentId, folderId),
      eq(knowledgeFolders.companyId, tenant.companyId),
      eq(knowledgeFolders.isActive, true),
    ))

  return c.json({
    data: {
      totalDocs: docStats.totalDocs,
      childFolders: childCount.count,
      lastUpdated: docStats.lastUpdated,
    },
  })
})

// ══════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES
// ══════════════════════════════════════════════════════════

// GET /templates — 문서 템플릿 목록
knowledgeRoute.get('/templates', async (_c) => {
  return _c.json({
    data: KNOWLEDGE_TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      contentType: t.contentType,
      defaultTags: t.defaultTags,
    })),
  })
})

const fromTemplateSchema = z.object({
  templateId: z.string().min(1),
  folderId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(500),
})

// POST /docs/from-template — 템플릿에서 문서 생성
knowledgeRoute.post('/docs/from-template', zValidator('json', fromTemplateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const template = KNOWLEDGE_TEMPLATES.find(t => t.id === body.templateId)
  if (!template) throw new HTTPError(404, '템플릿을 찾을 수 없습니다')

  // Validate folderId if provided
  if (body.folderId) {
    const [folder] = await db.select({ id: knowledgeFolders.id })
      .from(knowledgeFolders)
      .where(and(
        eq(knowledgeFolders.id, body.folderId),
        eq(knowledgeFolders.companyId, tenant.companyId),
        eq(knowledgeFolders.isActive, true),
      ))
      .limit(1)
    if (!folder) throw new HTTPError(404, '폴더를 찾을 수 없습니다')
  }

  // Replace {{date}} placeholder in template content
  const content = template.defaultContent.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0])

  const [doc] = await db.insert(knowledgeDocs).values({
    companyId: tenant.companyId,
    folderId: body.folderId || null,
    title: body.title,
    content,
    contentType: template.contentType,
    tags: template.defaultTags,
    createdBy: tenant.userId,
  }).returning()

  return c.json({ data: doc })
})

// ══════════════════════════════════════════════════════════
// TAG MANAGEMENT
// ══════════════════════════════════════════════════════════

// GET /tags — 모든 태그 + 사용 횟수
knowledgeRoute.get('/tags', async (c) => {
  const tenant = c.get('tenant')

  const docs = await db.select({ tags: knowledgeDocs.tags })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))

  // Aggregate tag counts
  const tagCounts = new Map<string, number>()
  for (const doc of docs) {
    const tags = doc.tags as string[] | null
    if (tags) {
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
  }

  const sortedTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)

  return c.json({ data: sortedTags })
})

const modifyTagsSchema = z.object({
  tags: z.array(z.string().max(100)).min(1).max(20),
})

// POST /docs/:id/tags — 태그 추가
knowledgeRoute.post('/docs/:id/tags', zValidator('json', modifyTagsSchema), async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')
  const body = c.req.valid('json')

  const [doc] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!doc) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  const existingTags = (doc.tags as string[]) || []
  const mergedTags = [...new Set([...existingTags, ...body.tags])].slice(0, 20)

  const [updated] = await db.update(knowledgeDocs)
    .set({ tags: mergedTags, updatedAt: new Date(), updatedBy: tenant.userId })
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: updated })
})

// DELETE /docs/:id/tags — 태그 제거
knowledgeRoute.delete('/docs/:id/tags', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')

  // Parse body manually for DELETE with body
  const body = await c.req.json<{ tags: string[] }>()
  if (!body.tags || !Array.isArray(body.tags) || body.tags.length === 0) {
    throw new HTTPError(400, '제거할 태그 목록이 필요합니다')
  }

  const [doc] = await db.select()
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
    ))
    .limit(1)

  if (!doc) throw new HTTPError(404, '문서를 찾을 수 없습니다')

  const existingTags = (doc.tags as string[]) || []
  const removedSet = new Set(body.tags)
  const filteredTags = existingTags.filter(t => !removedSet.has(t))

  const [updated] = await db.update(knowledgeDocs)
    .set({ tags: filteredTags, updatedAt: new Date(), updatedBy: tenant.userId })
    .where(and(
      eq(knowledgeDocs.id, docId),
      eq(knowledgeDocs.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: updated })
})

// ══════════════════════════════════════════════════════════
// UNIFIED SEARCH
// ══════════════════════════════════════════════════════════

// GET /search — 통합 검색 (keyword / semantic / hybrid 모드)
knowledgeRoute.get('/search', async (c) => {
  const tenant = c.get('tenant')
  const q = c.req.query('q')
  const rawMode = c.req.query('mode') || 'hybrid'
  const mode: 'keyword' | 'semantic' | 'hybrid' = ['keyword', 'semantic', 'hybrid'].includes(rawMode) ? rawMode as 'keyword' | 'semantic' | 'hybrid' : 'hybrid'
  const topK = Math.min(20, Math.max(1, Number(c.req.query('topK')) || 5))
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20))
  const folderId = c.req.query('folderId') || undefined
  const offset = (page - 1) * limit

  if (!q || q.trim().length === 0) {
    throw new HTTPError(400, '검색어가 필요합니다')
  }

  // Helper: generate highlight from content
  const generateHighlight = (content: string | null, query: string): string => {
    if (!content) return ''
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const matchIndex = lowerContent.indexOf(lowerQuery)
    if (matchIndex >= 0) {
      const start = Math.max(0, matchIndex - 50)
      const end = Math.min(content.length, matchIndex + query.length + 50)
      return (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')
    }
    // For semantic results, show first 150 chars as context
    return content.length > 150 ? content.slice(0, 150) + '...' : content
  }

  // Helper: keyword (LIKE) search
  const keywordSearch = async () => {
    const searchPattern = `%${q}%`
    const docConditions = and(
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
      or(
        ilike(knowledgeDocs.title, searchPattern),
        ilike(knowledgeDocs.content, searchPattern),
      ),
      folderId ? eq(knowledgeDocs.folderId, folderId) : undefined,
    )

    const [docTotal] = await db.select({ count: count() })
      .from(knowledgeDocs)
      .where(docConditions)

    const docs = await db.select()
      .from(knowledgeDocs)
      .where(docConditions)
      .orderBy(desc(knowledgeDocs.updatedAt))
      .limit(limit)
      .offset(offset)

    return {
      docs: docs.map(doc => ({
        ...doc,
        score: null as number | null,
        highlight: generateHighlight(doc.content, q),
      })),
      total: docTotal.count,
    }
  }

  // Semantic search mode
  if (mode === 'semantic') {
    const semanticResults = await semanticSearch(tenant.companyId, q, { topK, folderId })

    if (!semanticResults) {
      // Fallback to keyword search when semantic search fails
      const kwResult = await keywordSearch()
      const folders = await searchFolders(tenant.companyId, q)
      return c.json({
        data: { docs: kwResult.docs, folders, searchMode: 'keyword' as const },
        pagination: { page, limit, total: kwResult.total, totalPages: Math.ceil(kwResult.total / limit) },
      })
    }

    const folders = await searchFolders(tenant.companyId, q)
    return c.json({
      data: {
        docs: semanticResults.map(r => ({
          ...r,
          highlight: generateHighlight(r.content, q),
        })),
        folders,
        searchMode: 'semantic' as const,
      },
      pagination: { page: 1, limit: topK, total: semanticResults.length, totalPages: 1 },
    })
  }

  // Keyword search mode
  if (mode === 'keyword') {
    const kwResult = await keywordSearch()
    const folders = await searchFolders(tenant.companyId, q)
    return c.json({
      data: { docs: kwResult.docs, folders, searchMode: 'keyword' as const },
      pagination: { page, limit, total: kwResult.total, totalPages: Math.ceil(kwResult.total / limit) },
    })
  }

  // Hybrid mode (default): semantic first, supplement with keyword if needed
  let searchMode: 'hybrid' | 'keyword' = 'hybrid'
  let hybridDocs: Array<{
    id: string
    title: string
    content: string | null
    folderId: string | null
    tags: string[] | null
    score: number | null
    highlight: string
    [key: string]: unknown
  }> = []

  const semanticResults = await semanticSearch(tenant.companyId, q, { topK, folderId })

  if (semanticResults && semanticResults.length > 0) {
    hybridDocs = semanticResults.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      folderId: r.folderId,
      tags: r.tags,
      score: r.score,
      highlight: generateHighlight(r.content, q),
    }))
  }

  // Supplement with keyword search if semantic results < topK (or failed entirely)
  if (!semanticResults || semanticResults.length < topK) {
    searchMode = semanticResults ? 'hybrid' : 'keyword'
    const kwResult = await keywordSearch()
    const semanticIds = new Set(hybridDocs.map(d => d.id))
    const supplementDocs = kwResult.docs
      .filter(d => !semanticIds.has(d.id))
      .slice(0, topK - hybridDocs.length)

    hybridDocs = [...hybridDocs, ...supplementDocs]
  }

  const folders = await searchFolders(tenant.companyId, q)
  return c.json({
    data: { docs: hybridDocs, folders, searchMode },
    pagination: { page: 1, limit: topK, total: hybridDocs.length, totalPages: 1 },
  })
})

// Helper: search folders by name/description
async function searchFolders(companyId: string, q: string) {
  const searchPattern = `%${q}%`
  return db.select()
    .from(knowledgeFolders)
    .where(and(
      eq(knowledgeFolders.companyId, companyId),
      eq(knowledgeFolders.isActive, true),
      or(
        ilike(knowledgeFolders.name, searchPattern),
        ilike(knowledgeFolders.description, searchPattern),
      ),
    ))
    .orderBy(asc(knowledgeFolders.name))
    .limit(20)
}

// ══════════════════════════════════════════════════════════
// AGENT MEMORIES CRUD
// ══════════════════════════════════════════════════════════

// POST /memories — 에이전트 기억 생성
knowledgeRoute.post('/memories', zValidator('json', createMemorySchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Validate agent exists
  const [agent] = await db.select({ id: agents.id })
    .from(agents)
    .where(and(
      eq(agents.id, body.agentId),
      eq(agents.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다')

  const [memory] = await db.insert(agentMemories).values({
    companyId: tenant.companyId,
    agentId: body.agentId,
    memoryType: body.memoryType,
    key: body.key,
    content: body.content,
    context: body.context,
    source: body.source,
    confidence: body.confidence,
  }).returning()

  return c.json({ data: memory })
})

// GET /memories — 에이전트 기억 목록
knowledgeRoute.get('/memories', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.query('agentId')
  const memoryType = c.req.query('memoryType') as 'learning' | 'insight' | 'preference' | 'fact' | undefined
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50))
  const offset = (page - 1) * limit

  const conditions = [
    eq(agentMemories.companyId, tenant.companyId),
    eq(agentMemories.isActive, true),
  ]

  if (agentId) {
    conditions.push(eq(agentMemories.agentId, agentId))
  }

  if (memoryType && ['learning', 'insight', 'preference', 'fact'].includes(memoryType)) {
    conditions.push(eq(agentMemories.memoryType, memoryType))
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db.select({ count: count() })
    .from(agentMemories)
    .where(whereClause)

  const memories = await db.select()
    .from(agentMemories)
    .where(whereClause)
    .orderBy(desc(agentMemories.usageCount), desc(agentMemories.confidence), desc(agentMemories.createdAt))
    .limit(limit)
    .offset(offset)

  const total = totalResult.count
  return c.json({
    data: memories,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

// GET /memories/context/:agentId — 프롬프트 주입용 컨텍스트 문자열
knowledgeRoute.get('/memories/context/:agentId', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')

  const memories = await db.select({
    key: agentMemories.key,
    content: agentMemories.content,
    memoryType: agentMemories.memoryType,
  })
    .from(agentMemories)
    .where(and(
      eq(agentMemories.companyId, tenant.companyId),
      eq(agentMemories.agentId, agentId),
      eq(agentMemories.isActive, true),
    ))
    .orderBy(desc(agentMemories.usageCount), desc(agentMemories.confidence))
    .limit(20)

  if (memories.length === 0) {
    return c.json({ data: { contextString: '', memoryCount: 0 } })
  }

  const lines = memories.map(m => `- [${m.memoryType}] ${m.key}: ${m.content}`)
  const contextString = `\n\n---\n## 장기 기억 (이전 작업에서 학습한 내용)\n${lines.join('\n')}\n---\n`

  return c.json({ data: { contextString, memoryCount: memories.length } })
})

// GET /memories/:id — 단일 기억
knowledgeRoute.get('/memories/:id', async (c) => {
  const tenant = c.get('tenant')
  const memoryId = c.req.param('id')

  const [memory] = await db.select()
    .from(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
      eq(agentMemories.isActive, true),
    ))
    .limit(1)

  if (!memory) throw new HTTPError(404, '기억을 찾을 수 없습니다')

  return c.json({ data: memory })
})

// PATCH /memories/:id — 기억 수정
knowledgeRoute.patch('/memories/:id', zValidator('json', updateMemorySchema), async (c) => {
  const tenant = c.get('tenant')
  const memoryId = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db.select({ id: agentMemories.id })
    .from(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
      eq(agentMemories.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '기억을 찾을 수 없습니다')

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.key !== undefined) updateData.key = body.key
  if (body.content !== undefined) updateData.content = body.content
  if (body.context !== undefined) updateData.context = body.context
  if (body.confidence !== undefined) updateData.confidence = body.confidence
  if (body.memoryType !== undefined) updateData.memoryType = body.memoryType

  const [updated] = await db.update(agentMemories)
    .set(updateData)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: updated })
})

// DELETE /memories/:id — 기억 삭제 (hard delete)
knowledgeRoute.delete('/memories/:id', async (c) => {
  const tenant = c.get('tenant')
  const memoryId = c.req.param('id')

  const [existing] = await db.select({ id: agentMemories.id })
    .from(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '기억을 찾을 수 없습니다')

  await db.delete(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
    ))

  return c.json({ data: { success: true } })
})

// POST /memories/:id/used — 사용 기록 (usageCount + lastUsedAt)
knowledgeRoute.post('/memories/:id/used', async (c) => {
  const tenant = c.get('tenant')
  const memoryId = c.req.param('id')

  const [existing] = await db.select({ id: agentMemories.id })
    .from(agentMemories)
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
      eq(agentMemories.isActive, true),
    ))
    .limit(1)

  if (!existing) throw new HTTPError(404, '기억을 찾을 수 없습니다')

  const [updated] = await db.update(agentMemories)
    .set({
      usageCount: sql`${agentMemories.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(agentMemories.id, memoryId),
      eq(agentMemories.companyId, tenant.companyId),
    ))
    .returning()

  return c.json({ data: updated })
})

// ── Injection Preview ──

knowledgeRoute.get('/injection-preview/:agentId', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')

  // Fetch agent to get departmentId
  const [agent] = await db
    .select({ id: agents.id, departmentId: agents.departmentId })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) {
    throw new HTTPError(404, '에이전트를 찾을 수 없습니다')
  }

  const preview = await getInjectionPreview(tenant.companyId, agentId, agent.departmentId)
  return c.json({ data: preview })
})

// POST /memories/consolidate/:agentId — 유사 기억 병합
knowledgeRoute.post('/memories/consolidate/:agentId', async (c) => {
  const tenant = c.get('tenant')
  const agentId = c.req.param('agentId')

  // Validate agent exists
  const [agent] = await db.select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다')

  const result = await consolidateMemories(tenant.companyId, agentId)
  return c.json({ data: result })
})
