import { db } from '../db'
import { toolCalls } from '../db/schema'
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'
import { maskCredentials, maskCredentialsInString } from '../lib/credential-masker'

// === Types ===

export interface RecordToolInvocationInput {
  companyId: string
  agentId?: string
  sessionId?: string
  toolId?: string
  toolName: string
  input?: unknown
  output?: string
  status: 'success' | 'error' | 'timeout'
  durationMs?: number
}

export interface ToolInvocationQueryOptions {
  companyId: string
  agentId?: string
  toolName?: string
  status?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

export interface ToolInvocationStats {
  toolName: string
  totalCalls: number
  successCount: number
  errorCount: number
  successRate: number
  avgDurationMs: number
}

// === Service Functions ===

/**
 * Record a tool invocation with automatic credential masking (NFR12).
 * This function is designed to be called fire-and-forget (no await needed).
 */
export function recordToolInvocation(data: RecordToolInvocationInput): void {
  const maskedInput = data.input ? maskCredentials(data.input) : null
  const maskedOutput = data.output ? maskCredentialsInString(data.output) : null

  db.insert(toolCalls)
    .values({
      companyId: data.companyId,
      agentId: data.agentId ?? null,
      sessionId: data.sessionId ?? null,
      toolId: data.toolId ?? null,
      toolName: data.toolName,
      input: maskedInput,
      output: maskedOutput,
      status: data.status,
      durationMs: data.durationMs ?? null,
    })
    .catch((err) => {
      console.error('[tool-invocation-log] Failed to record tool invocation:', err)
    })
}

/**
 * Query tool invocations with filters and pagination.
 */
export async function queryToolInvocations(options: ToolInvocationQueryOptions) {
  const { companyId, agentId, toolName, status, startDate, endDate } = options
  const page = options.page ?? 1
  const limit = Math.min(options.limit ?? 50, 100)
  const offset = (page - 1) * limit

  const conditions = [eq(toolCalls.companyId, companyId)]

  if (agentId) conditions.push(eq(toolCalls.agentId, agentId))
  if (toolName) conditions.push(eq(toolCalls.toolName, toolName))
  if (status) conditions.push(eq(toolCalls.status, status))
  if (startDate) conditions.push(gte(toolCalls.createdAt, startDate))
  if (endDate) conditions.push(lte(toolCalls.createdAt, endDate))

  const where = and(...conditions)

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(toolCalls)
      .where(where)
      .orderBy(desc(toolCalls.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(toolCalls)
      .where(where),
  ])

  return {
    data,
    meta: { page, limit, total },
  }
}

/**
 * Get tool invocation statistics (per-tool aggregation).
 */
export async function getToolInvocationStats(companyId: string, startDate?: Date, endDate?: Date) {
  const conditions = [eq(toolCalls.companyId, companyId)]
  if (startDate) conditions.push(gte(toolCalls.createdAt, startDate))
  if (endDate) conditions.push(lte(toolCalls.createdAt, endDate))

  const where = and(...conditions)

  const stats = await db
    .select({
      toolName: toolCalls.toolName,
      totalCalls: sql<number>`count(*)::int`,
      successCount: sql<number>`count(*) filter (where ${toolCalls.status} = 'success')::int`,
      errorCount: sql<number>`count(*) filter (where ${toolCalls.status} = 'error')::int`,
      avgDurationMs: sql<number>`coalesce(avg(${toolCalls.durationMs})::int, 0)`,
    })
    .from(toolCalls)
    .where(where)
    .groupBy(toolCalls.toolName)
    .orderBy(sql`count(*) desc`)

  return stats.map((row) => ({
    ...row,
    successRate: row.totalCalls > 0 ? Math.round((row.successCount / row.totalCalls) * 100) : 0,
  }))
}
