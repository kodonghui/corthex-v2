import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, max, asc, sql, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { sketches, sketchVersions, knowledgeDocs } from '../../db/schema'
import { canvasToMermaidCode } from '@corthex/shared'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { logActivity } from '../../lib/activity-logger'
import { parseMermaid } from '@corthex/shared'
import { interpretCanvasCommand } from '../../services/canvas-ai'
import { triggerEmbedding } from '../../services/voyage-embedding'
import { semanticSearch } from '../../services/semantic-search'
import type { AppEnv } from '../../types'

export const sketchesRoute = new Hono<AppEnv>()

sketchesRoute.use('*', authMiddleware)

// GET /api/workspace/sketches — 캔버스 목록
sketchesRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const list = await db
    .select({
      id: sketches.id,
      name: sketches.name,
      createdBy: sketches.createdBy,
      createdAt: sketches.createdAt,
      updatedAt: sketches.updatedAt,
    })
    .from(sketches)
    .where(eq(sketches.companyId, tenant.companyId))
    .orderBy(desc(sketches.updatedAt))

  return c.json({ data: list })
})

// GET /api/workspace/sketches/:id — 캔버스 상세
sketchesRoute.get('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [sketch] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  return c.json({ data: sketch })
})

// POST /api/workspace/sketches — 캔버스 생성
const createSketchSchema = z.object({
  name: z.string().min(1, '캔버스 이름을 입력하세요').max(200),
  graphData: z.object({
    nodes: z.array(z.any()).default([]),
    edges: z.array(z.any()).default([]),
  }).default({ nodes: [], edges: [] }),
})

sketchesRoute.post(
  '/',
  zValidator('json', createSketchSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    const [created] = await db
      .insert(sketches)
      .values({
        companyId: tenant.companyId,
        name: body.name,
        graphData: body.graphData,
        createdBy: tenant.userId,
      })
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `SketchVibe: 캔버스 생성 — ${body.name}`,
    })

    return c.json({ data: created }, 201)
  },
)

// PUT /api/workspace/sketches/:id — 캔버스 수정
const updateSketchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  graphData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }).optional(),
})

sketchesRoute.put(
  '/:id',
  zValidator('json', updateSketchSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const id = c.req.param('id')
    const body = c.req.valid('json')
    const autoSave = c.req.query('autoSave') === 'true'

    const [existing] = await db
      .select({ id: sketches.id, graphData: sketches.graphData })
      .from(sketches)
      .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
      .limit(1)

    if (!existing) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

    // Manual save: record previous version (skip for auto-save)
    if (!autoSave && body.graphData) {
      const prev = existing.graphData as { nodes?: unknown[]; edges?: unknown[] }
      if (prev?.nodes && Array.isArray(prev.nodes) && prev.nodes.length > 0) {
        // Get max version number
        const [maxRow] = await db
          .select({ maxVer: max(sketchVersions.version) })
          .from(sketchVersions)
          .where(eq(sketchVersions.sketchId, id))
        const nextVersion = ((maxRow?.maxVer as number | null) ?? 0) + 1

        await db.insert(sketchVersions).values({
          sketchId: id,
          version: nextVersion,
          graphData: existing.graphData,
        })

        // Prune: keep max 20 versions
        const [countRow] = await db
          .select({ cnt: sql<number>`count(*)::int` })
          .from(sketchVersions)
          .where(eq(sketchVersions.sketchId, id))
        if ((countRow?.cnt ?? 0) > 20) {
          const excess = (countRow?.cnt ?? 0) - 20
          const oldest = await db
            .select({ id: sketchVersions.id })
            .from(sketchVersions)
            .where(eq(sketchVersions.sketchId, id))
            .orderBy(asc(sketchVersions.version))
            .limit(excess)
          if (oldest.length > 0) {
            await db.delete(sketchVersions).where(inArray(sketchVersions.id, oldest.map(r => r.id)))
          }
        }
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updateData.name = body.name
    if (body.graphData !== undefined) updateData.graphData = body.graphData

    const [updated] = await db
      .update(sketches)
      .set(updateData)
      .where(eq(sketches.id, id))
      .returning()

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/sketches/:id — 캔버스 삭제
sketchesRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: sketches.id, name: sketches.name })
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  await db.delete(sketches).where(eq(sketches.id, id))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SketchVibe: 캔버스 삭제 — ${existing.name}`,
  })

  return c.json({ data: { deleted: true } })
})

// POST /api/workspace/sketches/import-mermaid — Mermaid 코드로 캔버스 생성
const importMermaidSchema = z.object({
  mermaid: z.string().min(1, 'Mermaid 코드를 입력하세요').max(50000, 'Mermaid 코드가 너무 깁니다 (최대 50,000자)'),
  name: z.string().min(1).max(200).optional(),
})

sketchesRoute.post(
  '/import-mermaid',
  zValidator('json', importMermaidSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    const result = parseMermaid(body.mermaid)

    if (result.error) {
      throw new HTTPError(400, result.error, 'MERMAID_001')
    }

    // Convert ParsedNode/ParsedEdge to graphData format
    const graphNodes = result.nodes.map((n, i) => ({
      id: n.id,
      type: n.nodeType,
      position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 150 },
      data: { label: n.label },
    }))

    const graphEdges = result.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'editable',
      data: { label: e.label },
    }))

    const graphData = { nodes: graphNodes, edges: graphEdges }
    const sketchName = body.name || `Mermaid Import ${new Date().toLocaleString('ko-KR')}`

    const [created] = await db
      .insert(sketches)
      .values({
        companyId: tenant.companyId,
        name: sketchName,
        graphData,
        createdBy: tenant.userId,
      })
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `SketchVibe: Mermaid 가져오기 — ${sketchName} (노드 ${result.nodes.length}개)`,
    })

    return c.json({
      data: created,
      meta: {
        nodesCount: result.nodes.length,
        edgesCount: result.edges.length,
        warnings: result.warnings,
      },
    }, 201)
  },
)

// POST /api/workspace/sketches/:id/duplicate — 캔버스 복제
sketchesRoute.post('/:id/duplicate', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [original] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!original) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  const [duplicated] = await db
    .insert(sketches)
    .values({
      companyId: tenant.companyId,
      name: `${original.name} (복사본)`.slice(0, 200),
      graphData: original.graphData,
      createdBy: tenant.userId,
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SketchVibe: 캔버스 복제 — ${original.name}`,
  })

  return c.json({ data: duplicated }, 201)
})

// POST /api/workspace/sketches/:id/export-knowledge — 지식 베이스에 다이어그램 내보내기
const exportKnowledgeSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(500),
  folderId: z.string().uuid().optional(),
})

sketchesRoute.post(
  '/:id/export-knowledge',
  zValidator('json', exportKnowledgeSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const id = c.req.param('id')
    const body = c.req.valid('json')

    const [sketch] = await db
      .select()
      .from(sketches)
      .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
      .limit(1)

    if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

    const graphData = sketch.graphData as { nodes?: Array<{ id: string; type?: string; data?: { label?: string } }>; edges?: Array<{ source: string; target: string; data?: { label?: string } }> }
    const nodes = graphData?.nodes || []
    const edges = graphData?.edges || []

    if (nodes.length === 0) {
      throw new HTTPError(400, '빈 캔버스는 내보낼 수 없습니다', 'SKETCH_EXPORT_001')
    }

    const mermaidCode = canvasToMermaidCode(nodes, edges)

    const content = `\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n\n> SketchVibe에서 내보냄 — ${sketch.name} (${new Date().toLocaleString('ko-KR')})`

    const [doc] = await db
      .insert(knowledgeDocs)
      .values({
        companyId: tenant.companyId,
        title: body.title,
        content,
        contentType: 'mermaid',
        folderId: body.folderId || null,
        tags: ['sketchvibe', 'diagram'],
        createdBy: tenant.userId,
        updatedBy: tenant.userId,
      })
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'user',
      actorId: tenant.userId,
      action: `SketchVibe: 지식 베이스 내보내기 — ${body.title}`,
    })

    // Story 11.4: auto-embed + bidirectional link
    triggerEmbedding(doc.id, tenant.companyId)

    // Link knowledgeDoc → sketch
    await db
      .update(knowledgeDocs)
      .set({ linkedSketchId: id })
      .where(eq(knowledgeDocs.id, doc.id))

    // Link sketch → knowledgeDoc
    await db
      .update(sketches)
      .set({ knowledgeDocId: doc.id })
      .where(eq(sketches.id, id))

    return c.json({ data: { docId: doc.id, title: doc.title, folderId: doc.folderId, embeddingTriggered: true } }, 201)
  },
)

// POST /api/workspace/sketches/import-knowledge/:docId — 지식 문서에서 캔버스 생성 (Story 11.4)
sketchesRoute.post('/import-knowledge/:docId', async (c) => {
  const tenant = c.get('tenant')
  const docId = c.req.param('docId')

  const [doc] = await db
    .select({ id: knowledgeDocs.id, title: knowledgeDocs.title, content: knowledgeDocs.content, contentType: knowledgeDocs.contentType })
    .from(knowledgeDocs)
    .where(and(eq(knowledgeDocs.id, docId), eq(knowledgeDocs.companyId, tenant.companyId), eq(knowledgeDocs.isActive, true)))
    .limit(1)

  if (!doc) throw new HTTPError(404, '지식 문서를 찾을 수 없습니다', 'SKETCH_IMPORT_001')

  // Extract Mermaid code from content
  let mermaidCode = doc.content || ''
  const match = mermaidCode.match(/```mermaid\s*\n([\s\S]*?)```/)
  if (match) mermaidCode = match[1].trim()

  if (!mermaidCode) throw new HTTPError(400, '문서에서 Mermaid 코드를 찾을 수 없습니다', 'SKETCH_IMPORT_002')

  const result = parseMermaid(mermaidCode)
  if (result.error) throw new HTTPError(400, `Mermaid 파싱 실패: ${result.error}`, 'MERMAID_001')

  const graphNodes = result.nodes.map((n, i) => ({
    id: n.id,
    type: n.nodeType,
    position: { x: 100 + (i % 4) * 250, y: 100 + Math.floor(i / 4) * 150 },
    data: { label: n.label },
  }))

  const graphEdges = result.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'editable',
    data: { label: e.label },
  }))

  const graphData = { nodes: graphNodes, edges: graphEdges }

  const [created] = await db
    .insert(sketches)
    .values({
      companyId: tenant.companyId,
      name: `${doc.title} (지식에서 가져옴)`.slice(0, 200),
      graphData,
      knowledgeDocId: doc.id,
      createdBy: tenant.userId,
    })
    .returning()

  // Link back: knowledgeDoc → sketch
  await db
    .update(knowledgeDocs)
    .set({ linkedSketchId: created.id })
    .where(eq(knowledgeDocs.id, doc.id))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SketchVibe: 지식에서 가져오기 — ${doc.title}`,
  })

  return c.json({
    data: created,
    meta: { nodesCount: result.nodes.length, edgesCount: result.edges.length, sourceDocId: doc.id, warnings: result.warnings },
  }, 201)
})

// POST /api/workspace/sketches/:id/merge-knowledge/:docId — 지식 문서를 기존 캔버스에 병합 (Story 11.4)
sketchesRoute.post('/:id/merge-knowledge/:docId', async (c) => {
  const tenant = c.get('tenant')
  const sketchId = c.req.param('id')
  const docId = c.req.param('docId')

  const [sketch] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, sketchId), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  const [doc] = await db
    .select({ id: knowledgeDocs.id, title: knowledgeDocs.title, content: knowledgeDocs.content })
    .from(knowledgeDocs)
    .where(and(eq(knowledgeDocs.id, docId), eq(knowledgeDocs.companyId, tenant.companyId), eq(knowledgeDocs.isActive, true)))
    .limit(1)

  if (!doc) throw new HTTPError(404, '지식 문서를 찾을 수 없습니다', 'SKETCH_IMPORT_001')

  let mermaidCode = doc.content || ''
  const match = mermaidCode.match(/```mermaid\s*\n([\s\S]*?)```/)
  if (match) mermaidCode = match[1].trim()

  if (!mermaidCode) throw new HTTPError(400, '문서에서 Mermaid 코드를 찾을 수 없습니다', 'SKETCH_IMPORT_002')

  const result = parseMermaid(mermaidCode)
  if (result.error) throw new HTTPError(400, `Mermaid 파싱 실패: ${result.error}`, 'MERMAID_001')

  // Version backup before merge (Story 11.4 CR fix)
  const existingData = sketch.graphData as { nodes?: Array<{ id: string; position?: { x: number; y: number } }>; edges?: unknown[] }
  const existingNodes = existingData?.nodes || []
  const existingEdges = existingData?.edges || []

  if (existingNodes.length > 0) {
    const [maxRow] = await db
      .select({ maxVer: max(sketchVersions.version) })
      .from(sketchVersions)
      .where(eq(sketchVersions.sketchId, sketchId))
    const nextVersion = ((maxRow?.maxVer as number | null) ?? 0) + 1
    await db.insert(sketchVersions).values({
      sketchId,
      version: nextVersion,
      graphData: sketch.graphData,
    })
  }

  // Merge: add new nodes with offset to avoid overlap
  const maxY = existingNodes.reduce((m, n) => Math.max(m, n.position?.y ?? 0), 0)
  const offsetY = maxY + 200

  const existingIds = new Set(existingNodes.map(n => n.id))

  const newNodes = result.nodes.map((n, i) => {
    let nodeId = n.id
    if (existingIds.has(nodeId)) nodeId = `${nodeId}_merge_${Date.now()}`
    return {
      id: nodeId,
      type: n.nodeType,
      position: { x: 100 + (i % 4) * 250, y: offsetY + Math.floor(i / 4) * 150 },
      data: { label: n.label },
    }
  })

  // Map old IDs to potentially renamed IDs
  const idMap = new Map<string, string>()
  result.nodes.forEach((n, i) => { idMap.set(n.id, newNodes[i].id) })

  const newEdges = result.edges.map((e) => ({
    id: `merge-${Date.now()}-${e.id}`,
    source: idMap.get(e.source) || e.source,
    target: idMap.get(e.target) || e.target,
    type: 'editable',
    data: { label: e.label },
  }))

  const mergedGraphData = {
    nodes: [...existingNodes, ...newNodes],
    edges: [...existingEdges, ...newEdges],
  }

  const [updated] = await db
    .update(sketches)
    .set({ graphData: mergedGraphData, updatedAt: new Date() })
    .where(eq(sketches.id, sketchId))
    .returning()

  return c.json({
    data: updated,
    meta: { addedNodes: newNodes.length, addedEdges: newEdges.length, sourceDocId: doc.id },
  })
})

// GET /api/workspace/sketches/search-knowledge — 의미검색으로 관련 지식 찾기 (Story 11.4)
sketchesRoute.get('/search-knowledge', async (c) => {
  const tenant = c.get('tenant')
  const q = c.req.query('q')

  if (!q || q.trim().length === 0) {
    throw new HTTPError(400, '검색어를 입력하세요', 'SEARCH_001')
  }
  if (q.length > 500) {
    throw new HTTPError(400, '검색어는 500자 이하로 입력하세요', 'SEARCH_002')
  }

  // Semantic search (returns null on failure → fallback to keyword)
  const semanticResults = await semanticSearch(tenant.companyId, q, { topK: 10, threshold: 0.6 })

  if (semanticResults && semanticResults.length > 0) {
    // Mermaid docs first, then others
    const sorted = semanticResults.sort((a, b) => {
      const aMermaid = a.content?.includes('```mermaid') ? 1 : 0
      const bMermaid = b.content?.includes('```mermaid') ? 1 : 0
      if (aMermaid !== bMermaid) return bMermaid - aMermaid
      return b.score - a.score
    })

    return c.json({
      data: sorted.map(r => ({
        id: r.id,
        title: r.title,
        contentType: r.content?.includes('```mermaid') ? 'mermaid' : 'markdown',
        score: Math.round(r.score * 100) / 100,
        preview: r.content?.slice(0, 200) || null,
        folderId: r.folderId,
      })),
      meta: { mode: 'semantic', total: sorted.length },
    })
  }

  // Fallback: keyword search
  const searchPattern = `%${q}%`
  const keywordResults = await db
    .select({
      id: knowledgeDocs.id,
      title: knowledgeDocs.title,
      content: knowledgeDocs.content,
      contentType: knowledgeDocs.contentType,
      folderId: knowledgeDocs.folderId,
    })
    .from(knowledgeDocs)
    .where(and(
      eq(knowledgeDocs.companyId, tenant.companyId),
      eq(knowledgeDocs.isActive, true),
      sql`(${knowledgeDocs.title} ILIKE ${searchPattern} OR ${knowledgeDocs.content} ILIKE ${searchPattern})`,
    ))
    .orderBy(desc(knowledgeDocs.updatedAt))
    .limit(10)

  return c.json({
    data: keywordResults.map(r => ({
      id: r.id,
      title: r.title,
      contentType: r.contentType,
      score: null,
      preview: r.content?.slice(0, 200) || null,
      folderId: r.folderId,
    })),
    meta: { mode: 'keyword', total: keywordResults.length },
  })
})

// GET /api/workspace/sketches/:id/versions — 스케치 버전 히스토리
sketchesRoute.get('/:id/versions', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // Verify sketch belongs to this tenant
  const [sketch] = await db
    .select({ id: sketches.id })
    .from(sketches)
    .where(and(eq(sketches.id, id), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  const versions = await db
    .select({
      id: sketchVersions.id,
      version: sketchVersions.version,
      graphData: sketchVersions.graphData,
      createdAt: sketchVersions.createdAt,
    })
    .from(sketchVersions)
    .where(eq(sketchVersions.sketchId, id))
    .orderBy(desc(sketchVersions.version))

  const data = versions.map((v) => {
    const gd = v.graphData as { nodes?: unknown[]; edges?: unknown[] }
    return {
      id: v.id,
      version: v.version,
      createdAt: v.createdAt,
      nodeCount: Array.isArray(gd?.nodes) ? gd.nodes.length : 0,
      edgeCount: Array.isArray(gd?.edges) ? gd.edges.length : 0,
    }
  })

  return c.json({ data })
})

// POST /api/workspace/sketches/:id/versions/:versionId/restore — 특정 버전으로 복원
sketchesRoute.post('/:id/versions/:versionId/restore', async (c) => {
  const tenant = c.get('tenant')
  const sketchId = c.req.param('id')
  const versionId = c.req.param('versionId')

  // Verify sketch belongs to this tenant
  const [sketch] = await db
    .select()
    .from(sketches)
    .where(and(eq(sketches.id, sketchId), eq(sketches.companyId, tenant.companyId)))
    .limit(1)

  if (!sketch) throw new HTTPError(404, '캔버스를 찾을 수 없습니다', 'SKETCH_001')

  // Find the target version
  const [targetVersion] = await db
    .select()
    .from(sketchVersions)
    .where(and(eq(sketchVersions.id, versionId), eq(sketchVersions.sketchId, sketchId)))
    .limit(1)

  if (!targetVersion) throw new HTTPError(404, '버전을 찾을 수 없습니다', 'SKETCH_VER_001')

  // Backup current state as new version before restoring
  const currentGraphData = sketch.graphData as { nodes?: unknown[]; edges?: unknown[] }
  if (currentGraphData?.nodes && Array.isArray(currentGraphData.nodes) && currentGraphData.nodes.length > 0) {
    const [maxRow] = await db
      .select({ maxVer: max(sketchVersions.version) })
      .from(sketchVersions)
      .where(eq(sketchVersions.sketchId, sketchId))
    const nextVersion = ((maxRow?.maxVer as number | null) ?? 0) + 1

    await db.insert(sketchVersions).values({
      sketchId,
      version: nextVersion,
      graphData: sketch.graphData,
    })
  }

  // Restore target version's graphData
  const [updated] = await db
    .update(sketches)
    .set({ graphData: targetVersion.graphData, updatedAt: new Date() })
    .where(eq(sketches.id, sketchId))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SketchVibe: 버전 복원 — v${targetVersion.version}`,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/sketches/ai-command — AI 캔버스 명령
const aiCommandSchema = z.object({
  sketchId: z.string().optional(),
  command: z.string().min(1, '명령을 입력하세요').max(2000, '명령이 너무 깁니다 (최대 2,000자)'),
  graphData: z.object({
    nodes: z.array(z.any()).default([]),
    edges: z.array(z.any()).default([]),
  }),
})

sketchesRoute.post(
  '/ai-command',
  zValidator('json', aiCommandSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const body = c.req.valid('json')

    try {
      const result = await interpretCanvasCommand({
        command: body.command,
        graphData: body.graphData,
        companyId: tenant.companyId,
        userId: tenant.userId,
        sketchId: body.sketchId,
      })

      logActivity({
        companyId: tenant.companyId,
        type: 'system',
        phase: 'end',
        actorType: 'user',
        actorId: tenant.userId,
        action: `SketchVibe AI: ${body.command.slice(0, 60)}`,
      })

      return c.json({
        data: {
          commandId: result.commandId,
          mermaid: result.mermaid,
          description: result.description,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 명령 처리에 실패했습니다'
      throw new HTTPError(500, message, 'SKETCH_AI_001')
    }
  },
)
