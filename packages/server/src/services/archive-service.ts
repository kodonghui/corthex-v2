import { eq, and, desc, asc, gte, lte, ilike, or, sql, count, isNull, ne } from 'drizzle-orm'
import { db } from '../db'
import { archiveItems, archiveFolders, commands, agents, departments, qualityReviews, orchestrationTasks } from '../db/schema'
import { parsePaginationParams, parseDateFilter } from './activity-log-service'
import type { PaginationParams } from './activity-log-service'

// === Types ===

type ArchiveFilters = {
  search?: string
  classification?: string
  departmentId?: string
  agentId?: string
  startDate?: string
  endDate?: string
  tags?: string[]
  folderId?: string | 'root'  // 'root' = items without folder
  includeDeleted?: boolean
  departmentIds?: string[]  // employee scope
  sortBy?: 'date' | 'classification' | 'qualityScore'
  sortOrder?: 'asc' | 'desc'
}

type CreateArchiveInput = {
  commandId: string
  title: string
  classification: 'public' | 'internal' | 'confidential' | 'secret'
  summary?: string
  tags?: string[]
  folderId?: string
}

type UpdateArchiveInput = {
  title?: string
  classification?: 'public' | 'internal' | 'confidential' | 'secret'
  summary?: string
  tags?: string[]
  folderId?: string | null
}

type PaginatedResult<T> = { items: T[]; page: number; limit: number; total: number }

// === Create ===

export async function createArchiveItem(
  companyId: string,
  userId: string,
  input: CreateArchiveInput,
) {
  // Check if already archived
  const existing = await db
    .select({ id: archiveItems.id })
    .from(archiveItems)
    .where(and(eq(archiveItems.companyId, companyId), eq(archiveItems.commandId, input.commandId)))
    .limit(1)

  if (existing.length > 0) {
    return { error: 'ALREADY_ARCHIVED' as const }
  }

  // Load source command with agent/department info + quality
  const cmdRows = await db
    .select({
      id: commands.id,
      type: commands.type,
      text: commands.text,
      result: commands.result,
      status: commands.status,
      targetAgentId: commands.targetAgentId,
      agentDepartmentId: agents.departmentId,
      metadata: commands.metadata,
    })
    .from(commands)
    .leftJoin(agents, eq(commands.targetAgentId, agents.id))
    .where(and(eq(commands.companyId, companyId), eq(commands.id, input.commandId)))
    .limit(1)

  if (cmdRows.length === 0) {
    return { error: 'COMMAND_NOT_FOUND' as const }
  }

  const cmd = cmdRows[0]
  if (cmd.status !== 'completed') {
    return { error: 'COMMAND_NOT_COMPLETED' as const }
  }

  // Get quality score for this command
  const qualityRows = await db
    .select({
      avgScore: sql<number>`
        AVG(
          (COALESCE((${qualityReviews.scores}->>'conclusionQuality')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'evidenceSources')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'riskAssessment')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'formatCompliance')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'logicalCoherence')::numeric, 0)) / 5.0
        )
      `.as('avg_score'),
    })
    .from(qualityReviews)
    .where(eq(qualityReviews.commandId, input.commandId))

  const qualityScore = qualityRows[0]?.avgScore ? Number(qualityRows[0].avgScore) : null

  // Validate folderId if provided
  if (input.folderId) {
    const folder = await db
      .select({ id: archiveFolders.id })
      .from(archiveFolders)
      .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.id, input.folderId)))
      .limit(1)
    if (folder.length === 0) {
      return { error: 'FOLDER_NOT_FOUND' as const }
    }
  }

  const [item] = await db
    .insert(archiveItems)
    .values({
      companyId,
      commandId: input.commandId,
      userId,
      title: input.title,
      classification: input.classification,
      content: cmd.result,
      summary: input.summary || null,
      tags: input.tags || [],
      folderId: input.folderId || null,
      qualityScore,
      agentId: cmd.targetAgentId,
      departmentId: cmd.agentDepartmentId,
      commandType: cmd.type,
      commandText: cmd.text,
      metadata: (cmd.metadata as Record<string, unknown>) || {},
    })
    .returning()

  return { data: item }
}

// === List ===

export async function getArchiveItems(
  companyId: string,
  filters: ArchiveFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<Record<string, unknown>>> {
  const conditions: ReturnType<typeof eq>[] = [eq(archiveItems.companyId, companyId)] as any[]

  // Soft delete filter
  if (!filters.includeDeleted) {
    conditions.push(isNull(archiveItems.deletedAt))
  }

  // Classification filter
  if (filters.classification) {
    conditions.push(eq(archiveItems.classification, filters.classification as any))
  }

  // Department filter
  if (filters.departmentId) {
    conditions.push(eq(archiveItems.departmentId, filters.departmentId))
  }

  // Agent filter
  if (filters.agentId) {
    conditions.push(eq(archiveItems.agentId, filters.agentId))
  }

  // Folder filter
  if (filters.folderId === 'root') {
    conditions.push(isNull(archiveItems.folderId))
  } else if (filters.folderId) {
    conditions.push(eq(archiveItems.folderId, filters.folderId))
  }

  // Date filters
  const dateFilters = parseDateFilter(filters.startDate, filters.endDate)
  for (const f of dateFilters) {
    if (f.type === 'gte') conditions.push(gte(archiveItems.createdAt, f.date))
    if (f.type === 'lte') conditions.push(lte(archiveItems.createdAt, f.date))
  }

  // Tag filter (any match)
  if (filters.tags && filters.tags.length > 0) {
    conditions.push(
      sql`${archiveItems.tags} ?| array[${sql.join(filters.tags.map(t => sql`${t}`), sql`, `)}]`,
    )
  }

  // Text search (title + summary + commandText)
  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(archiveItems.title, `%${escaped}%`),
        ilike(archiveItems.summary, `%${escaped}%`),
        ilike(archiveItems.commandText, `%${escaped}%`),
      )!,
    )
  }

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    conditions.push(
      or(
        sql`${archiveItems.departmentId} IN (${sql.join(filters.departmentIds.map(id => sql`${id}`), sql`, `)})`,
        isNull(archiveItems.departmentId),
      )!,
    )
  }

  const whereClause = and(...conditions)

  // Count
  const [totalResult] = await db
    .select({ count: count() })
    .from(archiveItems)
    .where(whereClause)

  // Sort
  const sortBy = filters.sortBy || 'date'
  const sortDir = filters.sortOrder === 'asc' ? asc : desc
  let orderExpr: any
  switch (sortBy) {
    case 'classification':
      orderExpr = sortDir(archiveItems.classification)
      break
    case 'qualityScore':
      orderExpr = sortDir(sql`COALESCE(${archiveItems.qualityScore}, 0)`)
      break
    case 'date':
    default:
      orderExpr = sortDir(archiveItems.createdAt)
      break
  }

  const items = await db
    .select({
      id: archiveItems.id,
      title: archiveItems.title,
      classification: archiveItems.classification,
      summary: archiveItems.summary,
      tags: archiveItems.tags,
      folderId: archiveItems.folderId,
      folderName: archiveFolders.name,
      agentId: archiveItems.agentId,
      agentName: agents.name,
      departmentId: archiveItems.departmentId,
      departmentName: departments.name,
      qualityScore: archiveItems.qualityScore,
      commandType: archiveItems.commandType,
      createdAt: archiveItems.createdAt,
      deletedAt: archiveItems.deletedAt,
    })
    .from(archiveItems)
    .leftJoin(archiveFolders, eq(archiveItems.folderId, archiveFolders.id))
    .leftJoin(agents, eq(archiveItems.agentId, agents.id))
    .leftJoin(departments, eq(archiveItems.departmentId, departments.id))
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(pagination.limit)
    .offset(pagination.offset)

  const mappedItems = items.map((item) => ({
    ...item,
    summary: item.summary ? item.summary.slice(0, 200) : null,
    qualityScore: item.qualityScore ? Number(item.qualityScore) : null,
  }))

  return {
    items: mappedItems,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === Detail ===

export async function getArchiveDetail(companyId: string, archiveId: string) {
  const items = await db
    .select({
      id: archiveItems.id,
      companyId: archiveItems.companyId,
      commandId: archiveItems.commandId,
      userId: archiveItems.userId,
      title: archiveItems.title,
      classification: archiveItems.classification,
      content: archiveItems.content,
      summary: archiveItems.summary,
      tags: archiveItems.tags,
      folderId: archiveItems.folderId,
      folderName: archiveFolders.name,
      agentId: archiveItems.agentId,
      agentName: agents.name,
      departmentId: archiveItems.departmentId,
      departmentName: departments.name,
      qualityScore: archiveItems.qualityScore,
      commandType: archiveItems.commandType,
      commandText: archiveItems.commandText,
      metadata: archiveItems.metadata,
      createdAt: archiveItems.createdAt,
      updatedAt: archiveItems.updatedAt,
      deletedAt: archiveItems.deletedAt,
    })
    .from(archiveItems)
    .leftJoin(archiveFolders, eq(archiveItems.folderId, archiveFolders.id))
    .leftJoin(agents, eq(archiveItems.agentId, agents.id))
    .leftJoin(departments, eq(archiveItems.departmentId, departments.id))
    .where(and(
      eq(archiveItems.companyId, companyId),
      eq(archiveItems.id, archiveId),
      isNull(archiveItems.deletedAt),
    ))
    .limit(1)

  if (items.length === 0) return null

  const item = items[0]

  // Load delegation chain from orchestration_tasks
  const delegationChain = await db
    .select({
      id: orchestrationTasks.id,
      agentId: orchestrationTasks.agentId,
      agentName: agents.name,
      type: orchestrationTasks.type,
      status: orchestrationTasks.status,
      input: orchestrationTasks.input,
      output: orchestrationTasks.output,
      durationMs: orchestrationTasks.durationMs,
      startedAt: orchestrationTasks.startedAt,
      completedAt: orchestrationTasks.completedAt,
    })
    .from(orchestrationTasks)
    .leftJoin(agents, eq(orchestrationTasks.agentId, agents.id))
    .where(eq(orchestrationTasks.commandId, item.commandId))
    .orderBy(asc(orchestrationTasks.createdAt))

  // Load quality review
  const reviews = await db
    .select()
    .from(qualityReviews)
    .where(eq(qualityReviews.commandId, item.commandId))
    .orderBy(desc(qualityReviews.createdAt))
    .limit(1)

  const qualityReview = reviews.length > 0 ? {
    id: reviews[0].id,
    conclusion: reviews[0].conclusion,
    scores: reviews[0].scores,
    feedback: reviews[0].feedback,
    attemptNumber: reviews[0].attemptNumber,
    createdAt: reviews[0].createdAt,
  } : null

  // Find similar documents
  const similarDocuments = await findSimilarDocuments(companyId, archiveId, item)

  return {
    ...item,
    qualityScore: item.qualityScore ? Number(item.qualityScore) : null,
    delegationChain,
    qualityReview,
    similarDocuments,
  }
}

// === Update ===

export async function updateArchiveItem(
  companyId: string,
  archiveId: string,
  input: UpdateArchiveInput,
) {
  // Validate folderId if provided
  if (input.folderId) {
    const folder = await db
      .select({ id: archiveFolders.id })
      .from(archiveFolders)
      .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.id, input.folderId)))
      .limit(1)
    if (folder.length === 0) {
      return { error: 'FOLDER_NOT_FOUND' as const }
    }
  }

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (input.title !== undefined) updateData.title = input.title
  if (input.classification !== undefined) updateData.classification = input.classification
  if (input.summary !== undefined) updateData.summary = input.summary
  if (input.tags !== undefined) updateData.tags = input.tags
  if (input.folderId !== undefined) updateData.folderId = input.folderId

  const [updated] = await db
    .update(archiveItems)
    .set(updateData)
    .where(and(
      eq(archiveItems.companyId, companyId),
      eq(archiveItems.id, archiveId),
      isNull(archiveItems.deletedAt),
    ))
    .returning()

  if (!updated) return { error: 'NOT_FOUND' as const }
  return { data: updated }
}

// === Soft Delete ===

export async function softDeleteArchiveItem(companyId: string, archiveId: string) {
  const [deleted] = await db
    .update(archiveItems)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(
      eq(archiveItems.companyId, companyId),
      eq(archiveItems.id, archiveId),
      isNull(archiveItems.deletedAt),
    ))
    .returning({ id: archiveItems.id })

  return deleted ? true : false
}

// === Similar Documents ===

export async function findSimilarDocuments(
  companyId: string,
  archiveId: string,
  source?: { agentId: string | null; departmentId: string | null; commandType: string | null; tags: string[] | unknown },
) {
  // Load source if not provided
  if (!source) {
    const rows = await db
      .select()
      .from(archiveItems)
      .where(and(eq(archiveItems.companyId, companyId), eq(archiveItems.id, archiveId)))
      .limit(1)
    if (rows.length === 0) return []
    source = rows[0]
  }

  // Get candidates: same company, not deleted, not self, limit to recent 100
  const candidates = await db
    .select({
      id: archiveItems.id,
      title: archiveItems.title,
      classification: archiveItems.classification,
      summary: archiveItems.summary,
      tags: archiveItems.tags,
      agentId: archiveItems.agentId,
      agentName: agents.name,
      departmentId: archiveItems.departmentId,
      commandType: archiveItems.commandType,
      qualityScore: archiveItems.qualityScore,
      createdAt: archiveItems.createdAt,
    })
    .from(archiveItems)
    .leftJoin(agents, eq(archiveItems.agentId, agents.id))
    .where(and(
      eq(archiveItems.companyId, companyId),
      ne(archiveItems.id, archiveId),
      isNull(archiveItems.deletedAt),
    ))
    .orderBy(desc(archiveItems.createdAt))
    .limit(100)

  // Calculate similarity scores
  const sourceTags: string[] = Array.isArray(source.tags) ? source.tags : []

  const scored = candidates.map((candidate) => {
    let score = 0
    // Same agent: +30
    if (source.agentId && source.agentId === candidate.agentId) score += 30
    // Same department: +25
    if (source.departmentId && source.departmentId === candidate.departmentId) score += 25
    // Same command type: +15
    if (source.commandType && source.commandType === candidate.commandType) score += 15
    // Tag overlap: 10 per common tag, max 30
    const candidateTags: string[] = Array.isArray(candidate.tags) ? candidate.tags : []
    const commonTags = sourceTags.filter((t: string) => candidateTags.includes(t))
    score += Math.min(commonTags.length * 10, 30)

    return {
      id: candidate.id,
      title: candidate.title,
      classification: candidate.classification,
      summary: candidate.summary ? candidate.summary.slice(0, 200) : null,
      agentName: candidate.agentName,
      qualityScore: candidate.qualityScore ? Number(candidate.qualityScore) : null,
      similarityScore: Math.min(score, 100),
      createdAt: candidate.createdAt,
    }
  })

  // Return top 5 with score > 0, sorted by similarity
  return scored
    .filter((s) => s.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5)
}

// === Stats ===

export async function getArchiveStats(companyId: string) {
  // Total documents
  const [totalResult] = await db
    .select({ count: count() })
    .from(archiveItems)
    .where(and(eq(archiveItems.companyId, companyId), isNull(archiveItems.deletedAt)))

  const totalDocuments = Number(totalResult?.count || 0)

  // By classification
  const classificationRows = await db
    .select({
      classification: archiveItems.classification,
      count: count(),
    })
    .from(archiveItems)
    .where(and(eq(archiveItems.companyId, companyId), isNull(archiveItems.deletedAt)))
    .groupBy(archiveItems.classification)

  const byClassification: Record<string, number> = {
    public: 0,
    internal: 0,
    confidential: 0,
    secret: 0,
  }
  for (const row of classificationRows) {
    byClassification[row.classification] = Number(row.count)
  }

  // By department
  const departmentRows = await db
    .select({
      departmentId: archiveItems.departmentId,
      departmentName: departments.name,
      count: count(),
    })
    .from(archiveItems)
    .leftJoin(departments, eq(archiveItems.departmentId, departments.id))
    .where(and(
      eq(archiveItems.companyId, companyId),
      isNull(archiveItems.deletedAt),
      sql`${archiveItems.departmentId} IS NOT NULL`,
    ))
    .groupBy(archiveItems.departmentId, departments.name)

  const byDepartment = departmentRows.map((row) => ({
    departmentId: row.departmentId!,
    departmentName: row.departmentName || 'Unknown',
    count: Number(row.count),
  }))

  // Recent 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [recentResult] = await db
    .select({ count: count() })
    .from(archiveItems)
    .where(and(
      eq(archiveItems.companyId, companyId),
      isNull(archiveItems.deletedAt),
      gte(archiveItems.createdAt, sevenDaysAgo),
    ))

  return {
    totalDocuments,
    byClassification,
    byDepartment,
    recentWeekCount: Number(recentResult?.count || 0),
  }
}
