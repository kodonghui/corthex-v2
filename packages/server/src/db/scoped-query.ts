import { eq, or, sql, desc, and, isNotNull, asc, inArray, type SQL } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { db } from './index'
import { agents, departments, knowledgeDocs, agentTools, toolDefinitions, users, costRecords, presets, sketches, tierConfigs, semanticCache, agentReports, toolCallEvents, mcpServerConfigs, agentMcpAccess, mcpLifecycleEvents, credentials, activityLogs } from './schema'
import { decrypt } from '../lib/credential-crypto'
import { withTenant, scopedWhere, scopedInsert } from './tenant-helpers'
import { cosineDistance } from './pgvector'
import { toSql as pgvectorToSql } from 'pgvector'

type Agent = InferSelectModel<typeof agents>
type NewAgent = InferInsertModel<typeof agents>
type Preset = InferSelectModel<typeof presets>
type NewPreset = InferInsertModel<typeof presets>
type TierConfig = InferSelectModel<typeof tierConfigs>
type NewTierConfig = InferInsertModel<typeof tierConfigs>
type NewToolCallEvent = InferInsertModel<typeof toolCallEvents>
type NewMcpServerConfig = InferInsertModel<typeof mcpServerConfigs>
type NewMcpLifecycleEvent = InferInsertModel<typeof mcpLifecycleEvents>

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

    // === Story 17.1b: Tool Call Events (D29, FR-SO2, E17 telemetry pattern) ===
    // E17 pattern: INSERT before logic → UPDATE in try/finally (captures durationMs, success, errorCode)
    // Write-only for engine — reads happen via admin route (not through getDB for now)

    // WRITE — insert telemetry row at tool call start, returns [{id}] for updateToolCallEvent
    insertToolCallEvent: (data: Omit<NewToolCallEvent, 'companyId' | 'id'>) =>
      db.insert(toolCallEvents).values({
        ...data,
        companyId: companyId as any,
      }).returning({ id: toolCallEvents.id }),

    // WRITE — update telemetry row at tool call completion (try/finally guarantees execution)
    updateToolCallEvent: (eventId: string, update: {
      completedAt?: Date
      success?: boolean
      errorCode?: string | null
      durationMs?: number
    }) =>
      db.update(toolCallEvents)
        .set(update)
        .where(and(eq(toolCallEvents.id, eventId), eq(toolCallEvents.companyId, companyId as any))),

    // === Story 18.1: MCP Server Configs (FR-MCP1~3, D25) ===

    // READ — list active MCP servers for this company (mcp-manager RESOLVE stage)
    listMcpServers: () =>
      db.select().from(mcpServerConfigs)
        .where(and(eq(mcpServerConfigs.companyId, companyId as any), eq(mcpServerConfigs.isActive, true))),

    // READ — single MCP server by id (admin route lookup + validation)
    getMcpServerById: (id: string) =>
      db.select().from(mcpServerConfigs)
        .where(and(eq(mcpServerConfigs.id, id), eq(mcpServerConfigs.companyId, companyId as any)))
        .limit(1),

    // READ — all MCP servers accessible to a specific agent (JOIN via agent_mcp_access)
    // C1 fix: double companyId check prevents cross-tenant access (D22)
    getMcpServersForAgent: (agentId: string) =>
      db.select({ mcp: mcpServerConfigs }).from(agentMcpAccess)
        .innerJoin(mcpServerConfigs, eq(agentMcpAccess.mcpServerId, mcpServerConfigs.id))
        .where(and(
          eq(agentMcpAccess.agentId, agentId),
          eq(mcpServerConfigs.companyId, companyId as any),  // cross-tenant isolation
          eq(mcpServerConfigs.isActive, true),
        )),

    // WRITE — insert new MCP server (admin CRUD, Story 18.6)
    insertMcpServer: (data: Omit<NewMcpServerConfig, 'companyId' | 'id' | 'createdAt' | 'updatedAt'>) =>
      db.insert(mcpServerConfigs).values({ ...data, companyId: companyId as any }).returning({ id: mcpServerConfigs.id }),

    // WRITE — update MCP server (admin CRUD, Story 18.6)
    updateMcpServer: (id: string, data: Partial<Pick<NewMcpServerConfig, 'displayName' | 'transport' | 'command' | 'args' | 'env' | 'isActive'>>) =>
      db.update(mcpServerConfigs)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(mcpServerConfigs.id, id), eq(mcpServerConfigs.companyId, companyId as any))),

    // === Story 18.1: Agent MCP Access Control (FR-MCP2, D22 default OFF) ===

    // WRITE — grant agent access to an MCP server (Admin explicit grant)
    grantMcpAccess: (agentId: string, mcpServerId: string) =>
      db.insert(agentMcpAccess).values({ agentId, mcpServerId }).onConflictDoNothing(),

    // WRITE — revoke agent access to an MCP server
    revokeMcpAccess: (agentId: string, mcpServerId: string) =>
      db.delete(agentMcpAccess)
        .where(and(eq(agentMcpAccess.agentId, agentId), eq(agentMcpAccess.mcpServerId, mcpServerId))),

    // === Story 18.1: MCP Lifecycle Events (FR-SO3, NFR-R3 zombie detection) ===

    // WRITE — log MCP lifecycle event (mcp-manager calls at each stage)
    insertMcpLifecycleEvent: (data: Omit<NewMcpLifecycleEvent, 'companyId' | 'id' | 'createdAt'>) =>
      db.insert(mcpLifecycleEvents).values({ ...data, companyId: companyId as any }),

    // READ — zombie process detection: sessions with spawn but no teardown after N seconds (NFR-R3)
    getActiveMcpSessions: (olderThanSeconds: number) =>
      db.select({ sessionId: mcpLifecycleEvents.sessionId, mcpServerId: mcpLifecycleEvents.mcpServerId })
        .from(mcpLifecycleEvents)
        .where(and(
          eq(mcpLifecycleEvents.companyId, companyId as any),
          eq(mcpLifecycleEvents.event, 'spawn'),
          sql`${mcpLifecycleEvents.createdAt} < NOW() - INTERVAL '${sql.raw(String(olderThanSeconds))} seconds'`,
        )),

    // === Story 16.4: Credential CRUD (D23, E11, FR-CM1~3, FR-CM6) ===

    // READ — list credentials for Admin UI (encryptedValue intentionally excluded — AC1, D28 security)
    listCredentials: () =>
      db.select({ id: credentials.id, keyName: credentials.keyName, updatedAt: credentials.updatedAt })
        .from(credentials)
        .where(eq(credentials.companyId, companyId))
        .orderBy(asc(credentials.keyName)),

    // READ — list all credentials with decrypted plaintext (D28 scrubber only — AC2)
    // Async: must await decrypt() for each row
    listCredentialsForScrubber: async () => {
      const rows = await db.select({
        keyName: credentials.keyName,
        encryptedValue: credentials.encryptedValue,
      }).from(credentials).where(eq(credentials.companyId, companyId))
      return Promise.all(rows.map(async (row) => ({
        keyName: row.keyName,
        plaintext: await decrypt(row.encryptedValue),
      })))
    },

    // READ — single credential by keyName for E11 RESOLVE stage (returns full row including encryptedValue)
    getCredential: (keyName: string) =>
      db.select().from(credentials)
        .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
        .limit(1),

    // WRITE — insert encrypted credential with audit trail (AC3)
    insertCredential: (data: { keyName: string; encryptedValue: string }, userId: string) =>
      db.insert(credentials).values({
        companyId,
        keyName: data.keyName,
        encryptedValue: data.encryptedValue,
        createdByUserId: userId,
        updatedByUserId: userId,
      }).returning(),

    // WRITE — update encryptedValue + refresh audit trail (AC5)
    updateCredential: (keyName: string, encryptedValue: string, userId: string) =>
      db.update(credentials)
        .set({ encryptedValue, updatedByUserId: userId, updatedAt: new Date() })
        .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
        .returning(),

    // WRITE — delete credential scoped by companyId + keyName (AC6)
    deleteCredential: (keyName: string) =>
      db.delete(credentials)
        .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
        .returning(),

    // WRITE — activity log insert (Story 27.1: tool-sanitizer audit trail)
    insertActivityLog: (data: {
      eventId: string
      type: 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'
      phase: 'start' | 'end' | 'error'
      actorType: string
      actorName?: string
      action: string
      detail?: string
      userId?: string
      agentId?: string
      metadata?: Record<string, unknown>
    }) =>
      db.insert(activityLogs).values({
        ...data,
        companyId: companyId as any,
      }),
  }
}
