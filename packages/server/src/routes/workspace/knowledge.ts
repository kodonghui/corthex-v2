import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, asc, count, ilike, or, isNull, sql } from 'drizzle-orm'
import { db } from '../../db'
import { knowledgeFolders, knowledgeDocs, agentMemories, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const knowledgeRoute = new Hono<AppEnv>()

knowledgeRoute.use('*', authMiddleware)

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
  contentType: z.enum(['markdown', 'text', 'html']).default('markdown'),
  fileUrl: z.string().max(2000).optional(),
  tags: z.array(z.string().max(100)).max(20).default([]),
})

const updateDocSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().optional(),
  contentType: z.enum(['markdown', 'text', 'html']).optional(),
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

  return c.json({ data: doc })
})

// GET /docs — 문서 목록 (필터 + 검색 + 페이지네이션)
knowledgeRoute.get('/docs', async (c) => {
  const tenant = c.get('tenant')
  const folderId = c.req.query('folderId')
  const q = c.req.query('q')
  const tagsParam = c.req.query('tags')
  const page = Math.max(1, Number(c.req.query('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20))
  const offset = (page - 1) * limit

  const conditions = [
    eq(knowledgeDocs.companyId, tenant.companyId),
    eq(knowledgeDocs.isActive, true),
  ]

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

// PATCH /docs/:id — 문서 수정
knowledgeRoute.patch('/docs/:id', zValidator('json', updateDocSchema), async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db.select({ id: knowledgeDocs.id })
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
