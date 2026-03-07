import { eq, and, type SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'

/**
 * Tenant isolation query helpers for Drizzle ORM.
 * All DB queries on tenant-scoped tables MUST use these helpers
 * to enforce companyId WHERE clause (FR42, NFR10).
 */

/** Returns an eq condition for companyId filtering on SELECT/UPDATE/DELETE */
export function withTenant<T extends PgColumn>(
  companyIdColumn: T,
  companyId: string,
): SQL {
  return eq(companyIdColumn, companyId)
}

/**
 * Combines a tenant filter with additional conditions using AND.
 * Usage: scopedWhere(table.companyId, companyId, eq(table.status, 'active'))
 */
export function scopedWhere<T extends PgColumn>(
  companyIdColumn: T,
  companyId: string,
  ...conditions: SQL[]
): SQL {
  return and(eq(companyIdColumn, companyId), ...conditions)!
}

/**
 * Injects companyId into an INSERT data object.
 * Usage: scopedInsert(companyId, { name: 'foo', ... })
 * Returns: { companyId: '...', name: 'foo', ... }
 */
export function scopedInsert<T extends Record<string, unknown>>(
  companyId: string,
  data: T,
): T & { companyId: string } {
  return { ...data, companyId }
}
