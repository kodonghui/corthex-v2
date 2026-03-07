import { db } from '../db'
import { auditLogs } from '../db/schema'
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'

// === Audit Action Constants ===
export const AUDIT_ACTIONS = {
  // Organization
  ORG_DEPARTMENT_CREATE: 'org.department.create',
  ORG_DEPARTMENT_UPDATE: 'org.department.update',
  ORG_DEPARTMENT_DELETE: 'org.department.delete',
  ORG_AGENT_CREATE: 'org.agent.create',
  ORG_AGENT_UPDATE: 'org.agent.update',
  ORG_AGENT_DELETE: 'org.agent.delete',
  ORG_AGENT_DEACTIVATE: 'org.agent.deactivate',
  ORG_CASCADE_ANALYZE: 'org.cascade.analyze',
  ORG_CASCADE_EXECUTE: 'org.cascade.execute',
  ORG_TEMPLATE_APPLY: 'org.template.apply',
  // Credentials
  CREDENTIAL_STORE: 'credential.store',
  CREDENTIAL_ACCESS: 'credential.access',
  CREDENTIAL_DELETE: 'credential.delete',
  // Auth & Permissions
  AUTH_ROLE_CHANGE: 'auth.role.change',
  AUTH_LOGIN_FAIL: 'auth.login.fail',
  // Trading
  TRADE_ORDER_CREATE: 'trade.order.create',
  TRADE_ORDER_EXECUTE: 'trade.order.execute',
  TRADE_ORDER_CANCEL: 'trade.order.cancel',
  // LLM
  LLM_FALLBACK: 'llm.fallback',
  // System
  SYSTEM_CONFIG_CHANGE: 'system.config.change',
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]

export type ActorType = 'admin_user' | 'user' | 'agent' | 'system'

export interface CreateAuditLogInput {
  companyId: string
  actorType: ActorType
  actorId: string
  action: string
  targetType?: string
  targetId?: string
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}

export interface AuditLogQueryOptions {
  companyId: string
  action?: string
  targetType?: string
  targetId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

/**
 * Insert an audit log record. This is the ONLY write operation — no update/delete exists.
 * Returns the created audit log with its ID.
 */
export async function createAuditLog(input: CreateAuditLogInput) {
  const [record] = await db
    .insert(auditLogs)
    .values({
      companyId: input.companyId,
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? null,
    })
    .returning()

  return record
}

/**
 * Query audit logs with filters and pagination. READ ONLY.
 */
export async function queryAuditLogs(options: AuditLogQueryOptions) {
  const { companyId, action, targetType, targetId, startDate, endDate } = options
  const page = options.page ?? 1
  const limit = Math.min(options.limit ?? 50, 100)
  const offset = (page - 1) * limit

  const conditions = [eq(auditLogs.companyId, companyId)]

  if (action) conditions.push(eq(auditLogs.action, action))
  if (targetType) conditions.push(eq(auditLogs.targetType, targetType))
  if (targetId) conditions.push(eq(auditLogs.targetId, targetId))
  if (startDate) conditions.push(gte(auditLogs.createdAt, startDate))
  if (endDate) conditions.push(lte(auditLogs.createdAt, endDate))

  const where = and(...conditions)

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(where),
  ])

  return {
    data,
    meta: { page, limit, total },
  }
}

/**
 * Helper to wrap a business operation with automatic audit logging.
 * If the operation succeeds, the audit log is created.
 * If the operation fails, no audit log is written (exception propagates).
 * Returns { result, auditLogId }.
 */
export async function withAuditLog<T>(
  auditInput: CreateAuditLogInput,
  operation: () => Promise<T>,
): Promise<{ result: T; auditLogId: string }> {
  const result = await operation()
  const auditRecord = await createAuditLog(auditInput)
  return { result, auditLogId: auditRecord.id }
}
