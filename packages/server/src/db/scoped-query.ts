import { eq, or, sql, desc, and, isNotNull, asc, inArray, type SQL } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { db } from './index'
import { agents, departments, knowledgeDocs, agentTools, toolDefinitions, users, costRecords, presets, sketches, tierConfigs, semanticCache, agentReports } from './schema'
import { withTenant, scopedWhere, scopedInsert } from './tenant-helpers'
import { cosineDistance } from './pgvector'
import { toSql as pgvectorToSql } from 'pgvector'

type Agent = InferSelectModel<typeof agents>
type NewAgent = InferInsertModel<typeof agents>
type Preset = InferSelectModel<typeof presets>
type NewPreset = InferInsertModel<typeof presets>
type TierConfig = InferSelectModel<typeof tierConfigs>
type NewTierConfig = InferInsertModel<typeof tierConfigs>

/**
 * getDB(companyId) — 멀티테넌시 격리 래퍼 (Architecture D1, E3)
 *
 * 모든 비즈니스 로직은 이 함수를 통해서만 DB 접근.
 * db 직접 import는 마이그레이션, 시드, 시스템 쿼리에서만 허용.
 */
export function getDB(companyId: string) {
  if (!companyId) throw new Error('companyId required')

  return {
    // READ — companyId WHERE 자동 적용
    agents: () =>
      db.select().from(agents).where(withTenant(agents.companyId, companyId)),
    departments: () =>
      db.select().from(departments).where(withTenant(departments.companyId, companyId)),
    knowledgeDocs: () =>
      db.select().from(knowledgeDocs).where(withTenant(knowledgeDocs.companyId, companyId)),

    // READ — soul-renderer용 단건/관계 조회 (Story 2.3, E4)
    agentById: (id: string) =>
      db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))),
    agentsByReportTo: (agentId: string) =>
      db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.reportTo, agentId))),
    agentToolsWithDefs: (agentId: string) =>
      db.select({ name: toolDefinitions.name, description: toolDefinitions.description })
        .from(agentTools)
        .innerJoin(toolDefinitions, eq(agentTools.toolId, toolDefinitions.id))
        .where(scopedWhere(agentTools.companyId, companyId, eq(agentTools.agentId, agentId), eq(agentTools.isEnabled, true), eq(toolDefinitions.isActive, true))),
    agentToolsWithSchema: (agentId: string) =>
      db.select({ name: toolDefinitions.name, description: toolDefinitions.description, inputSchema: toolDefinitions.inputSchema })
        .from(agentTools)
        .innerJoin(toolDefinitions, eq(agentTools.toolId, toolDefinitions.id))
        .where(scopedWhere(agentTools.companyId, companyId, eq(agentTools.agentId, agentId), eq(agentTools.isEnabled, true), eq(toolDefinitions.isActive, true))),
    departmentById: (id: string) =>
      db.select().from(departments).where(scopedWhere(departments.companyId, companyId, eq(departments.id, id))),
    userById: (id: string) =>
      db.select().from(users).where(scopedWhere(users.companyId, companyId, eq(users.id, id))),

    // WRITE — companyId 자동 주입, 결과 반환
    insertAgent: (data: Omit<NewAgent, 'companyId'>) =>
      db.insert(agents).values(scopedInsert(companyId, data)).returning(),
    updateAgent: (id: string, data: Partial<Omit<Agent, 'id' | 'companyId'>>) =>
      db.update(agents).set(data).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),
    deleteAgent: (id: string) =>
      db.delete(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))).returning(),

    // WRITE — cost tracking (Story 3.5)
    insertCostRecord: (data: Omit<InferInsertModel<typeof costRecords>, 'companyId'>) =>
      db.insert(costRecords).values(scopedInsert(companyId, data)).returning(),

    // READ — presets (Story 5.6)
    presetsByUser: (userId: string) =>
      db.select().from(presets).where(
        scopedWhere(presets.companyId, companyId, eq(presets.isActive, true),
          or(eq(presets.userId, userId), eq(presets.isGlobal, true))!),
      ).orderBy(desc(presets.sortOrder), desc(presets.createdAt)),
    presetById: (id: string) =>
      db.select().from(presets).where(scopedWhere(presets.companyId, companyId, eq(presets.id, id))),
    presetByName: (name: string, userId: string) =>
      db.select().from(presets).where(
        scopedWhere(presets.companyId, companyId, eq(presets.name, name), eq(presets.userId, userId)),
      ),

    // WRITE — presets (Story 5.6)
    insertPreset: (data: Omit<NewPreset, 'companyId'>) =>
      db.insert(presets).values(scopedInsert(companyId, data)).returning(),
    updatePreset: (id: string, data: Partial<Omit<Preset, 'id' | 'companyId'>>) =>
      db.update(presets).set(data).where(scopedWhere(presets.companyId, companyId, eq(presets.id, id))).returning(),
    deletePreset: (id: string) =>
      db.delete(presets).where(scopedWhere(presets.companyId, companyId, eq(presets.id, id))).returning(),
    incrementPresetSortOrder: (id: string) =>
      db.update(presets).set({ sortOrder: sql`${presets.sortOrder} + 1`, updatedAt: new Date() })
        .where(scopedWhere(presets.companyId, companyId, eq(presets.id, id))),

    // READ — sketches (Story 11.2)
    sketches: () =>
      db.select().from(sketches).where(withTenant(sketches.companyId, companyId)).orderBy(desc(sketches.updatedAt)),
    sketchById: (id: string) =>
      db.select().from(sketches).where(scopedWhere(sketches.companyId, companyId, eq(sketches.id, id))),

    // WRITE — sketches (Story 11.2)
    updateSketch: (id: string, data: Partial<{ name: string; graphData: unknown; updatedAt: Date }>) =>
      db.update(sketches).set(data).where(scopedWhere(sketches.companyId, companyId, eq(sketches.id, id))).returning(),

    // READ — tier configs (Story 8.1)
    tierConfigs: () =>
      db.select().from(tierConfigs).where(withTenant(tierConfigs.companyId, companyId)).orderBy(tierConfigs.tierLevel),
    tierConfigByLevel: (level: number) =>
      db.select().from(tierConfigs).where(scopedWhere(tierConfigs.companyId, companyId, eq(tierConfigs.tierLevel, level))),

    // WRITE — tier configs (Story 8.1)
    insertTierConfig: (data: Omit<NewTierConfig, 'companyId'>) =>
      db.insert(tierConfigs).values(scopedInsert(companyId, data)).returning(),
    updateTierConfig: (id: string, data: Partial<Omit<TierConfig, 'id' | 'companyId'>>) =>
      db.update(tierConfigs).set(data).where(scopedWhere(tierConfigs.companyId, companyId, eq(tierConfigs.id, id))).returning(),
    deleteTierConfig: (id: string) =>
      db.delete(tierConfigs).where(scopedWhere(tierConfigs.companyId, companyId, eq(tierConfigs.id, id))).returning(),

    // READ — knowledge docs with embedding (Story 10.1)
    knowledgeDocsWithEmbedding: () =>
      db.select().from(knowledgeDocs).where(
        scopedWhere(knowledgeDocs.companyId, companyId, isNotNull(knowledgeDocs.embedding)),
      ),

    // READ — semantic cache lookup (Story 15.3, D19/D20)
    // Returns best match with cosine similarity >= threshold AND within TTL window
    findSemanticCache: async (embedding: number[], threshold: number): Promise<{ response: string; similarity: number } | null> => {
      const vectorStr = pgvectorToSql(embedding)
      const rows = await db.execute(sql`
        SELECT response, 1 - (query_embedding <=> ${vectorStr}::vector) AS similarity
        FROM semantic_cache
        WHERE company_id = ${companyId}::uuid
          AND 1 - (query_embedding <=> ${vectorStr}::vector) >= ${threshold}
          AND created_at > NOW() - ttl_hours * INTERVAL '1 hour'
        ORDER BY query_embedding <=> ${vectorStr}::vector
        LIMIT 1
      `)
      const row = (rows as unknown as { rows: { response: string; similarity: number }[] }).rows?.[0]
        ?? (rows as unknown as { response: string; similarity: number }[])[0]
        ?? null
      if (!row) return null
      return { response: row.response as string, similarity: Number(row.similarity) }
    },

    // WRITE — semantic cache insert (Story 15.3, D19/D20)
    insertSemanticCache: async (data: { queryText: string; queryEmbedding: number[]; response: string; ttlHours: number }): Promise<void> => {
      const vectorStr = pgvectorToSql(data.queryEmbedding)
      await db.execute(sql`
        INSERT INTO semantic_cache (company_id, query_text, query_embedding, response, ttl_hours)
        VALUES (${companyId}::uuid, ${data.queryText}, ${vectorStr}::vector, ${data.response}, ${data.ttlHours})
      `)
    },

    // READ — vector similarity search (Story 10.1, extended by 10.3/10.4 with folderId/folderIds filter)
    searchSimilarDocs: (queryEmbedding: number[], topK = 5, threshold = 0.8, folderId?: string | string[]) => {
      const dist = cosineDistance(knowledgeDocs.embedding, queryEmbedding)
      const conditions = [
        withTenant(knowledgeDocs.companyId, companyId),
        isNotNull(knowledgeDocs.embedding),
        eq(knowledgeDocs.isActive, true),
        sql`${dist} < ${threshold}`,
      ]
      if (folderId) {
        if (Array.isArray(folderId)) {
          if (folderId.length > 0) {
            conditions.push(inArray(knowledgeDocs.folderId, folderId))
          }
        } else {
          conditions.push(eq(knowledgeDocs.folderId, folderId))
        }
      }
      return db.select({
        id: knowledgeDocs.id,
        title: knowledgeDocs.title,
        content: knowledgeDocs.content,
        folderId: knowledgeDocs.folderId,
        tags: knowledgeDocs.tags,
        distance: dist.as('distance'),
      })
        .from(knowledgeDocs)
        .where(and(...conditions))
        .orderBy(asc(sql`${dist}`))
        .limit(topK)
    },

    // READ — reports list (Story 20.1, FR-RM3, D27)
    // Excludes content field for performance — use getReport() for full content
    listReports: (filter?: { type?: string }) => {
      const conditions: SQL[] = [eq(agentReports.companyId, companyId as any)]
      if (filter?.type) conditions.push(eq(agentReports.type, filter.type))
      return db.select({
        id: agentReports.id,
        title: agentReports.title,
        type: agentReports.type,
        tags: agentReports.tags,
        createdAt: agentReports.createdAt,
        agentId: agentReports.agentId,
      })
        .from(agentReports)
        .where(and(...conditions))
        .orderBy(desc(agentReports.createdAt))
    },

    // READ — single report with full content (Story 20.1, FR-RM4, D27)
    // Returns empty array if not found — caller handles empty result (Scenario 3)
    getReport: (id: string) =>
      db.select().from(agentReports).where(scopedWhere(agentReports.companyId, companyId, eq(agentReports.id, id))),

    // WRITE — insert new report (Story 20.1, FR-RM1, D27)
    // Returns [{id}] — report ID for distribution tracking (E15)
    insertReport: (data: { title: string; content: string; type?: string; runId: string; agentId?: string; tags?: string[] }) =>
      db.insert(agentReports).values({
        companyId: companyId as any,
        title: data.title,
        content: data.content,
        type: data.type ?? null,
        runId: data.runId,
        agentId: data.agentId ?? null,
        tags: data.tags ?? [],
      }).returning({ id: agentReports.id }),

    // WRITE — update distribution_results JSONB (Story 20.1, FR-RM2, E15)
    // Partial failure contract: channel results stored regardless of individual success/failure
    updateReportDistribution: (reportId: string, results: Record<string, string>) =>
      db.update(agentReports)
        .set({ distributionResults: results })
        .where(scopedWhere(agentReports.companyId, companyId, eq(agentReports.id, reportId)))
        .returning(),
  }
}
