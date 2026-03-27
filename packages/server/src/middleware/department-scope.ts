import { eq, and } from 'drizzle-orm'
import type { MiddlewareHandler } from 'hono'
import { db } from '../db'
import { employeeDepartments } from '../db/schema'
import type { AppEnv } from '../types'

/**
 * Department scope middleware for employee users.
 * - employee role: queries assigned departments and injects departmentIds
 * - ceo/admin roles: bypass (departmentIds stays undefined = all access)
 * Must be applied AFTER authMiddleware.
 */
export const departmentScopeMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')

  // CEO/admin bypass — see everything
  if (tenant.role !== 'employee') {
    await next()
    return
  }

  // Employee: query assigned departments
  const assignments = await db
    .select({ departmentId: employeeDepartments.departmentId })
    .from(employeeDepartments)
    .where(and(eq(employeeDepartments.userId, tenant.userId), eq(employeeDepartments.companyId, tenant.companyId)))

  const deptIds = assignments.map(a => a.departmentId)

  // If no departments assigned, grant full access (same as CEO) to avoid empty results
  if (deptIds.length === 0) {
    await next()
    return
  }

  // Inject into tenant context
  c.set('tenant', { ...tenant, departmentIds: deptIds })

  await next()
}
