import { eq, and, desc, gte, lte, count, ilike, or, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { activityLogs, orchestrationTasks, qualityReviews, toolCalls, agents, commands, auditLogs } from '../db/schema'
import { AUDIT_ACTIONS } from './audit-log'

// === Common pagination helpers ===

export type PaginationParams = { page: number; limit: number; offset: number }

export function parsePaginationParams(query: Record<string, string | undefined>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100)
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

export function parseDateFilter(startDate?: string, endDate?: string) {
  const conditions: any[] = []
  if (startDate) conditions.push({ type: 'gte', date: new Date(startDate) })
  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    conditions.push({ type: 'lte', date: end })
  }
  return conditions
}

function applyDateConditions(table: any, dateFilters: ReturnType<typeof parseDateFilter>) {
  const conditions: any[] = []
  for (const f of dateFilters) {
    if (f.type === 'gte') conditions.push(gte(table.createdAt, f.date))
    if (f.type === 'lte') conditions.push(lte(table.createdAt, f.date))
  }
  return conditions
}

type PaginatedResult<T> = { items: T[]; page: number; limit: number; total: number }

// === 1. Agent Activity (활동 탭) ===

type AgentActivityFilters = {
  agentId?: string
  departmentId?: string
  departmentIds?: string[]  // employee scope
  status?: string  // phase value
  startDate?: string
  endDate?: string
  search?: string
}

export async function getAgentActivity(
  companyId: string,
  filters: AgentActivityFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<any>> {
  const conditions = [eq(activityLogs.companyId, companyId)]
  const dateConditions = applyDateConditions(activityLogs, parseDateFilter(filters.startDate, filters.endDate))
  conditions.push(...dateConditions)

  if (filters.agentId) conditions.push(eq(activityLogs.agentId, filters.agentId))
  if (filters.status) conditions.push(eq(activityLogs.phase, filters.status as any))
  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(activityLogs.action, `%${escaped}%`),
        ilike(activityLogs.detail, `%${escaped}%`),
        ilike(activityLogs.actorName, `%${escaped}%`),
      )!,
    )
  }

  // departmentId filter via agents join
  if (filters.departmentId) {
    conditions.push(eq(agents.departmentId, filters.departmentId))
  }

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    conditions.push(inArray(agents.departmentId, filters.departmentIds))
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(activityLogs)
    .leftJoin(agents, eq(activityLogs.agentId, agents.id))
    .where(whereClause)

  const items = await db
    .select({
      id: activityLogs.id,
      eventId: activityLogs.eventId,
      type: activityLogs.type,
      phase: activityLogs.phase,
      actorType: activityLogs.actorType,
      actorId: activityLogs.actorId,
      actorName: activityLogs.actorName,
      agentId: activityLogs.agentId,
      agentName: agents.name,
      departmentId: agents.departmentId,
      action: activityLogs.action,
      detail: activityLogs.detail,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .leftJoin(agents, eq(activityLogs.agentId, agents.id))
    .where(whereClause)
    .orderBy(desc(activityLogs.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === 2. Delegations (통신 탭) ===

type DelegationFilters = {
  departmentId?: string
  departmentIds?: string[]  // employee scope
  startDate?: string
  endDate?: string
  search?: string
}

export async function getDelegations(
  companyId: string,
  filters: DelegationFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<any>> {
  const conditions = [eq(orchestrationTasks.companyId, companyId)]
  const dateConditions = applyDateConditions(orchestrationTasks, parseDateFilter(filters.startDate, filters.endDate))
  conditions.push(...dateConditions)

  if (filters.departmentId) {
    conditions.push(eq(agents.departmentId, filters.departmentId))
  }

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    conditions.push(inArray(agents.departmentId, filters.departmentIds))
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(orchestrationTasks.input, `%${escaped}%`),
        ilike(orchestrationTasks.output, `%${escaped}%`),
        ilike(agents.name, `%${escaped}%`),
      )!,
    )
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(orchestrationTasks)
    .leftJoin(agents, eq(orchestrationTasks.agentId, agents.id))
    .where(whereClause)

  const items = await db
    .select({
      id: orchestrationTasks.id,
      commandId: orchestrationTasks.commandId,
      agentId: orchestrationTasks.agentId,
      agentName: agents.name,
      agentDepartmentId: agents.departmentId,
      parentTaskId: orchestrationTasks.parentTaskId,
      type: orchestrationTasks.type,
      input: orchestrationTasks.input,
      output: orchestrationTasks.output,
      status: orchestrationTasks.status,
      startedAt: orchestrationTasks.startedAt,
      completedAt: orchestrationTasks.completedAt,
      durationMs: orchestrationTasks.durationMs,
      metadata: orchestrationTasks.metadata,
      createdAt: orchestrationTasks.createdAt,
    })
    .from(orchestrationTasks)
    .leftJoin(agents, eq(orchestrationTasks.agentId, agents.id))
    .where(whereClause)
    .orderBy(desc(orchestrationTasks.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === 3. Quality Reviews (QA 탭) ===

type QualityFilters = {
  conclusion?: 'pass' | 'fail'
  reviewerAgentId?: string
  departmentIds?: string[]  // employee scope
  startDate?: string
  endDate?: string
  search?: string
}

export async function getQualityReviews(
  companyId: string,
  filters: QualityFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<any>> {
  const conditions = [eq(qualityReviews.companyId, companyId)]
  const dateConditions = applyDateConditions(qualityReviews, parseDateFilter(filters.startDate, filters.endDate))
  conditions.push(...dateConditions)

  if (filters.conclusion) conditions.push(eq(qualityReviews.conclusion, filters.conclusion))
  if (filters.reviewerAgentId) conditions.push(eq(qualityReviews.reviewerAgentId, filters.reviewerAgentId))

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    conditions.push(inArray(agents.departmentId, filters.departmentIds))
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(qualityReviews.feedback, `%${escaped}%`),
        ilike(commands.text, `%${escaped}%`),
        ilike(agents.name, `%${escaped}%`),
      )!,
    )
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(qualityReviews)
    .leftJoin(commands, eq(qualityReviews.commandId, commands.id))
    .leftJoin(agents, eq(qualityReviews.reviewerAgentId, agents.id))
    .where(whereClause)

  const items = await db
    .select({
      id: qualityReviews.id,
      commandId: qualityReviews.commandId,
      commandText: commands.text,
      taskId: qualityReviews.taskId,
      reviewerAgentId: qualityReviews.reviewerAgentId,
      reviewerAgentName: agents.name,
      conclusion: qualityReviews.conclusion,
      scores: qualityReviews.scores,
      feedback: qualityReviews.feedback,
      attemptNumber: qualityReviews.attemptNumber,
      createdAt: qualityReviews.createdAt,
    })
    .from(qualityReviews)
    .leftJoin(commands, eq(qualityReviews.commandId, commands.id))
    .leftJoin(agents, eq(qualityReviews.reviewerAgentId, agents.id))
    .where(whereClause)
    .orderBy(desc(qualityReviews.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === 4. Tool Invocations (도구 탭) ===

type ToolFilters = {
  toolName?: string
  agentId?: string
  departmentIds?: string[]  // employee scope
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}

export async function getToolInvocations(
  companyId: string,
  filters: ToolFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<any>> {
  const conditions = [eq(toolCalls.companyId, companyId)]
  const dateConditions = applyDateConditions(toolCalls, parseDateFilter(filters.startDate, filters.endDate))
  conditions.push(...dateConditions)

  if (filters.toolName) conditions.push(eq(toolCalls.toolName, filters.toolName))
  if (filters.agentId) conditions.push(eq(toolCalls.agentId, filters.agentId))
  if (filters.status) conditions.push(eq(toolCalls.status, filters.status))

  // Employee department scope
  if (filters.departmentIds) {
    if (filters.departmentIds.length === 0) {
      return { items: [], page: pagination.page, limit: pagination.limit, total: 0 }
    }
    conditions.push(inArray(agents.departmentId, filters.departmentIds))
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(toolCalls.toolName, `%${escaped}%`),
        ilike(toolCalls.output, `%${escaped}%`),
        ilike(agents.name, `%${escaped}%`),
      )!,
    )
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(toolCalls)
    .leftJoin(agents, eq(toolCalls.agentId, agents.id))
    .where(whereClause)

  const items = await db
    .select({
      id: toolCalls.id,
      toolName: toolCalls.toolName,
      agentId: toolCalls.agentId,
      agentName: agents.name,
      input: toolCalls.input,
      output: toolCalls.output,
      status: toolCalls.status,
      durationMs: toolCalls.durationMs,
      createdAt: toolCalls.createdAt,
    })
    .from(toolCalls)
    .leftJoin(agents, eq(toolCalls.agentId, agents.id))
    .where(whereClause)
    .orderBy(desc(toolCalls.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  // Truncate input/output for summary
  const truncatedItems = items.map((item) => ({
    ...item,
    inputSummary: item.input ? JSON.stringify(item.input).slice(0, 200) : null,
    outputSummary: item.output ? item.output.slice(0, 200) : null,
    input: undefined,
    output: undefined,
  }))

  return {
    items: truncatedItems,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

// === 5. Security Alerts (보안 알림) ===

const SECURITY_ACTIONS = [
  AUDIT_ACTIONS.SECURITY_INPUT_BLOCKED,
  AUDIT_ACTIONS.SECURITY_OUTPUT_REDACTED,
  AUDIT_ACTIONS.SECURITY_INJECTION_ATTEMPT,
]

type SecurityAlertFilters = {
  startDate?: string
  endDate?: string
}

type SecurityAlertItem = {
  id: string
  action: string
  actorType: string
  actorId: string
  targetType: string | null
  metadata: unknown
  createdAt: Date
}

export async function getSecurityAlerts(
  companyId: string,
  filters: SecurityAlertFilters,
  pagination: PaginationParams,
): Promise<PaginatedResult<SecurityAlertItem>> {
  const conditions = [
    eq(auditLogs.companyId, companyId),
    inArray(auditLogs.action, SECURITY_ACTIONS),
  ]
  const dateConditions = applyDateConditions(auditLogs, parseDateFilter(filters.startDate, filters.endDate))
  conditions.push(...dateConditions)

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(whereClause)

  const items = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      actorType: auditLogs.actorType,
      actorId: auditLogs.actorId,
      targetType: auditLogs.targetType,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}

export async function getSecurityAlertCount24h(companyId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(and(
      eq(auditLogs.companyId, companyId),
      inArray(auditLogs.action, SECURITY_ACTIONS),
      gte(auditLogs.createdAt, since),
    ))
  return Number(result?.count || 0)
}
