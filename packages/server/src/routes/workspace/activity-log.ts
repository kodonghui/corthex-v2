import { Hono } from 'hono'
import { eq, and, desc, gte, sql, count } from 'drizzle-orm'
import { db } from '../../db'
import { activityLogs } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { TenantContext } from '@corthex/shared'

export const activityLogRoute = new Hono()

activityLogRoute.use('*', authMiddleware)

// GET /api/workspace/activity-log — 활동 로그 목록
activityLogRoute.get('/activity-log', async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const type = c.req.query('type')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0

  const conditions = [eq(activityLogs.companyId, tenant.companyId)]

  if (type) {
    conditions.push(eq(activityLogs.type, type as any))
  }

  const dateFrom = c.req.query('from')
  if (dateFrom) {
    conditions.push(gte(activityLogs.createdAt, new Date(dateFrom)))
  }

  const result = await db
    .select({
      id: activityLogs.id,
      type: activityLogs.type,
      actorType: activityLogs.actorType,
      actorId: activityLogs.actorId,
      actorName: activityLogs.actorName,
      action: activityLogs.action,
      detail: activityLogs.detail,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(and(...conditions))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ data: result })
})

// GET /api/workspace/activity-log/summary — 오늘/이번주 요약 통계
activityLogRoute.get('/activity-log/summary', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  // 오늘 타입별 카운트
  const todayCounts = await db
    .select({
      type: activityLogs.type,
      count: count(),
    })
    .from(activityLogs)
    .where(and(
      eq(activityLogs.companyId, tenant.companyId),
      gte(activityLogs.createdAt, today),
    ))
    .groupBy(activityLogs.type)

  // 이번주 타입별 카운트
  const weekCounts = await db
    .select({
      type: activityLogs.type,
      count: count(),
    })
    .from(activityLogs)
    .where(and(
      eq(activityLogs.companyId, tenant.companyId),
      gte(activityLogs.createdAt, weekAgo),
    ))
    .groupBy(activityLogs.type)

  return c.json({
    data: {
      today: todayCounts,
      week: weekCounts,
    },
  })
})
