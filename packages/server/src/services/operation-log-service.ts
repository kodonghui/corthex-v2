import { eq, and, desc, asc, gte, lte, ilike, or, inArray, sql, count } from 'drizzle-orm'
import { db } from '../db'
import { commands, agents, qualityReviews, costRecords, orchestrationTasks, departments, bookmarks } from '../db/schema'
import { parsePaginationParams, parseDateFilter } from './activity-log-service'
import type { PaginationParams } from './activity-log-service'

// === Types ===

type OperationLogFilters = {
  search?: string
  startDate?: string
  endDate?: string
  targetAgentId?: string
  departmentId?: string
  departmentIds?: string[]  // employee scope
  type?: string
  status?: string
  minScore?: number
  maxScore?: number
  bookmarkedOnly?: boolean
  userId?: string  // for bookmark filter
  sortBy?: 'date' | 'qualityScore' | 'cost' | 'duration'
  sortOrder?: 'asc' | 'desc'
}

type OperationLogItem = {
  id: string
  companyId: string
  userId: string
  type: string
  text: string
  targetAgentId: string | null
  targetAgentName: string | null
  targetDepartmentId: string | null
  targetDepartmentName: string | null
  status: string
  result: string | null
  metadata: unknown
  createdAt: Date
  completedAt: Date | null
  qualityScore: number | null
  qualityConclusion: string | null
  totalCostMicro: number | null
  durationMs: number | null
  isBookmarked: boolean
  bookmarkId: string | null
  bookmarkNote: string | null
}

type PaginatedResult<T> = { items: T[]; page: number; limit: number; total: number }

// === Subquery builders ===

function buildQualitySubquery() {
  // Get latest quality review per command
  return db
    .select({
      commandId: qualityReviews.commandId,
      avgScore: sql<number>`
        AVG(
          (COALESCE((${qualityReviews.scores}->>'conclusionQuality')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'evidenceSources')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'riskAssessment')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'formatCompliance')::numeric, 0) +
           COALESCE((${qualityReviews.scores}->>'logicalCoherence')::numeric, 0)) / 5.0
        )
      `.as('avg_score'),
      conclusion: sql<string>`(array_agg(${qualityReviews.conclusion} ORDER BY ${qualityReviews.createdAt} DESC))[1]`.as('latest_conclusion'),
    })
    .from(qualityReviews)
    .groupBy(qualityReviews.commandId)
    .as('quality_sub')
}

function buildCostSubquery() {
  return db
    .select({
      // cost_records doesn't have a commandId, so we join via sessions/agents
      // Actually, cost_records has sessionId. Commands don't directly link to cost_records.
      // We'll use a simpler approach: aggregate cost per agent per time window
      agentId: costRecords.agentId,
      totalCost: sql<number>`SUM(${costRecords.costUsdMicro})`.as('total_cost'),
    })
    .from(costRecords)
    .groupBy(costRecords.agentId)
    .as('cost_sub')
}

function buildDurationSubquery() {
  return db
    .select({
      commandId: orchestrationTasks.commandId,
      totalDuration: sql<number>`SUM(COALESCE(${orchestrationTasks.durationMs}, 0))`.as('total_duration'),
    })
    .from(orchestrationTasks)
    .groupBy(orchestrationTasks.commandId)
    .as('duration_sub')
}

// === Main Query ===

export async function getOperationLogs(
  companyId: string,
  filters: OperationLogFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<OperationLogItem>> {
  const conditions: any[] = [eq(commands.companyId, companyId)]

  // Date filters
  const dateFilters = parseDateFilter(filters.startDate, filters.endDate)
  for (const f of dateFilters) {
    if (f.type === 'gte') conditions.push(gte(commands.createdAt, f.date))
    if (f.type === 'lte') conditions.push(lte(commands.createdAt, f.date))
  }

  // Agent filter
  if (filters.targetAgentId) {
    conditions.push(eq(commands.targetAgentId, filters.targetAgentId))
  }

  // Department filter (via agent join)
  if (filters.departmentId) {
    conditions.push(eq(agents.departmentId, filters.departmentId))
  }

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    // Include commands targeting agents in those departments, OR commands by the user with no agent
    conditions.push(
      or(
        inArray(agents.departmentId, filters.departmentIds),
        sql`${commands.targetAgentId} IS NULL`,
      )!,
    )
  }

  // Type filter
  if (filters.type) {
    conditions.push(eq(commands.type, filters.type as any))
  }

  // Status filter
  if (filters.status) {
    conditions.push(eq(commands.status, filters.status))
  }

  // Text search
  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(commands.text, `%${escaped}%`),
        ilike(commands.result, `%${escaped}%`),
        ilike(agents.name, `%${escaped}%`),
      )!,
    )
  }

  // Build subqueries
  const qualitySub = buildQualitySubquery()
  const durationSub = buildDurationSubquery()

  // Quality score range filter (applied after join)
  if (filters.minScore !== undefined) {
    conditions.push(gte(qualitySub.avgScore, filters.minScore))
  }
  if (filters.maxScore !== undefined) {
    conditions.push(lte(qualitySub.avgScore, filters.maxScore))
  }

  // Bookmark filter
  if (filters.bookmarkedOnly && filters.userId) {
    conditions.push(sql`${bookmarks.id} IS NOT NULL`)
  }

  const whereClause = and(...conditions)

  // Build base query with joins
  const baseQuery = db
    .select({
      id: commands.id,
      companyId: commands.companyId,
      userId: commands.userId,
      type: commands.type,
      text: commands.text,
      targetAgentId: commands.targetAgentId,
      targetAgentName: agents.name,
      targetDepartmentId: agents.departmentId,
      targetDepartmentName: departments.name,
      status: commands.status,
      result: commands.result,
      metadata: commands.metadata,
      createdAt: commands.createdAt,
      completedAt: commands.completedAt,
      qualityScore: qualitySub.avgScore,
      qualityConclusion: qualitySub.conclusion,
      durationMs: durationSub.totalDuration,
      bookmarkId: bookmarks.id,
      bookmarkNote: bookmarks.note,
    })
    .from(commands)
    .leftJoin(agents, eq(commands.targetAgentId, agents.id))
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .leftJoin(qualitySub, eq(commands.id, qualitySub.commandId))
    .leftJoin(durationSub, eq(commands.id, durationSub.commandId))
    .leftJoin(
      bookmarks,
      and(
        eq(commands.id, bookmarks.commandId),
        eq(bookmarks.companyId, companyId),
        filters.userId ? eq(bookmarks.userId, filters.userId) : sql`1=1`,
      ),
    )

  // Count query
  const [totalResult] = await db
    .select({ count: count() })
    .from(commands)
    .leftJoin(agents, eq(commands.targetAgentId, agents.id))
    .leftJoin(qualitySub, eq(commands.id, qualitySub.commandId))
    .leftJoin(
      bookmarks,
      and(
        eq(commands.id, bookmarks.commandId),
        eq(bookmarks.companyId, companyId),
        filters.userId ? eq(bookmarks.userId, filters.userId) : sql`1=1`,
      ),
    )
    .where(whereClause)

  // Sort
  const sortBy = filters.sortBy || 'date'
  const sortDir = filters.sortOrder === 'asc' ? asc : desc
  let orderExpr: any
  switch (sortBy) {
    case 'qualityScore':
      orderExpr = sortDir(sql`COALESCE(${qualitySub.avgScore}, 0)`)
      break
    case 'cost':
      // Cost sort: we don't have direct cost link, sort by completedAt as proxy
      orderExpr = sortDir(commands.completedAt)
      break
    case 'duration':
      orderExpr = sortDir(sql`COALESCE(${durationSub.totalDuration}, 0)`)
      break
    case 'date':
    default:
      orderExpr = sortDir(commands.createdAt)
      break
  }

  const items = await baseQuery
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(pagination.limit)
    .offset(pagination.offset)

  // Map to response type
  const mappedItems: OperationLogItem[] = items.map((item) => ({
    id: item.id,
    companyId: item.companyId,
    userId: item.userId,
    type: item.type,
    text: item.text,
    targetAgentId: item.targetAgentId,
    targetAgentName: item.targetAgentName,
    targetDepartmentId: item.targetDepartmentId,
    targetDepartmentName: item.targetDepartmentName,
    status: item.status,
    result: item.result ? item.result.slice(0, 500) : null,  // truncate for list
    metadata: item.metadata,
    createdAt: item.createdAt,
    completedAt: item.completedAt,
    qualityScore: item.qualityScore ? Number(item.qualityScore) : null,
    qualityConclusion: item.qualityConclusion,
    totalCostMicro: null,  // Computed separately if needed
    durationMs: item.durationMs ? Number(item.durationMs) : null,
    isBookmarked: item.bookmarkId !== null,
    bookmarkId: item.bookmarkId,
    bookmarkNote: item.bookmarkNote,
  }))

  return {
    items: mappedItems,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === Export for CSV ===

export async function getOperationLogsForExport(
  companyId: string,
  filters: OperationLogFilters,
): Promise<any[]> {
  const exportPagination = { page: 1, limit: 1000, offset: 0 }
  const result = await getOperationLogs(companyId, filters, exportPagination)

  return result.items.map((item) => ({
    id: item.id,
    type: item.type,
    text: item.text,
    targetAgentName: item.targetAgentName || '',
    targetDepartmentName: item.targetDepartmentName || '',
    status: item.status,
    qualityScore: item.qualityScore ?? '',
    qualityConclusion: item.qualityConclusion || '',
    durationMs: item.durationMs ?? '',
    createdAt: item.createdAt.toISOString(),
    completedAt: item.completedAt?.toISOString() || '',
    isBookmarked: item.isBookmarked,
  }))
}

// === Single operation detail ===

export async function getOperationDetail(
  companyId: string,
  commandId: string,
  userId?: string,
): Promise<OperationLogItem | null> {
  const qualitySub = buildQualitySubquery()
  const durationSub = buildDurationSubquery()

  const items = await db
    .select({
      id: commands.id,
      companyId: commands.companyId,
      userId: commands.userId,
      type: commands.type,
      text: commands.text,
      targetAgentId: commands.targetAgentId,
      targetAgentName: agents.name,
      targetDepartmentId: agents.departmentId,
      targetDepartmentName: departments.name,
      status: commands.status,
      result: commands.result,
      metadata: commands.metadata,
      createdAt: commands.createdAt,
      completedAt: commands.completedAt,
      qualityScore: qualitySub.avgScore,
      qualityConclusion: qualitySub.conclusion,
      durationMs: durationSub.totalDuration,
      bookmarkId: bookmarks.id,
      bookmarkNote: bookmarks.note,
    })
    .from(commands)
    .leftJoin(agents, eq(commands.targetAgentId, agents.id))
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .leftJoin(qualitySub, eq(commands.id, qualitySub.commandId))
    .leftJoin(durationSub, eq(commands.id, durationSub.commandId))
    .leftJoin(
      bookmarks,
      and(
        eq(commands.id, bookmarks.commandId),
        eq(bookmarks.companyId, companyId),
        userId ? eq(bookmarks.userId, userId) : sql`1=0`,
      ),
    )
    .where(and(eq(commands.companyId, companyId), eq(commands.id, commandId)))
    .limit(1)

  if (items.length === 0) return null

  const item = items[0]
  return {
    id: item.id,
    companyId: item.companyId,
    userId: item.userId,
    type: item.type,
    text: item.text,
    targetAgentId: item.targetAgentId,
    targetAgentName: item.targetAgentName,
    targetDepartmentId: item.targetDepartmentId,
    targetDepartmentName: item.targetDepartmentName,
    status: item.status,
    result: item.result,  // full result for detail view
    metadata: item.metadata,
    createdAt: item.createdAt,
    completedAt: item.completedAt,
    qualityScore: item.qualityScore ? Number(item.qualityScore) : null,
    qualityConclusion: item.qualityConclusion,
    totalCostMicro: null,
    durationMs: item.durationMs ? Number(item.durationMs) : null,
    isBookmarked: item.bookmarkId !== null,
    bookmarkId: item.bookmarkId,
    bookmarkNote: item.bookmarkNote,
  }
}
