import { Hono } from 'hono'
import { eq, and, desc, gte, lt, sql, count, or, ilike, inArray } from 'drizzle-orm'
import { db } from '../../db'
import { activityLogs, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import type { AppEnv } from '../../types'

export const activityLogRoute = new Hono<AppEnv>()

activityLogRoute.use('*', authMiddleware)
activityLogRoute.use('*', departmentScopeMiddleware)

// GET /api/workspace/activity-log — 활동 로그 목록 (cursor 페이지네이션 + 검색)
activityLogRoute.get('/activity-log', async (c) => {
  const tenant = c.get('tenant')
  const type = c.req.query('type')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const cursor = c.req.query('cursor') // ISO date string
  const search = c.req.query('search')?.trim()

  // Employee department scoping: get scoped agent IDs
  if (tenant.departmentIds && tenant.departmentIds.length === 0) {
    return c.json({ data: [], nextCursor: null })
  }

  let scopedActorIds: string[] | undefined
  if (tenant.departmentIds) {
    const scopedAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.companyId, tenant.companyId), inArray(agents.departmentId, tenant.departmentIds)))
    scopedActorIds = [...scopedAgents.map(a => a.id), tenant.userId]
  }

  const conditions = [eq(activityLogs.companyId, tenant.companyId)]

  if (scopedActorIds) {
    conditions.push(inArray(activityLogs.actorId, scopedActorIds))
  }

  if (type) {
    conditions.push(eq(activityLogs.type, type as any))
  }

  if (cursor) {
    conditions.push(lt(activityLogs.createdAt, new Date(cursor)))
  }

  const dateFrom = c.req.query('from')
  if (dateFrom) {
    conditions.push(gte(activityLogs.createdAt, new Date(dateFrom)))
  }

  if (search) {
    const escaped = search.replace(/[%_\\]/g, '\\$&')
    conditions.push(
      or(
        ilike(activityLogs.action, `%${escaped}%`),
        ilike(activityLogs.detail, `%${escaped}%`),
      )!,
    )
  }

  const result = await db
    .select({
      id: activityLogs.id,
      eventId: activityLogs.eventId,
      type: activityLogs.type,
      phase: activityLogs.phase,
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
    .limit(limit + 1) // +1 for hasMore check

  const hasMore = result.length > limit
  const data = hasMore ? result.slice(0, limit) : result
  const nextCursor = hasMore && data.length > 0
    ? data[data.length - 1].createdAt.toISOString()
    : null

  return c.json({ data, nextCursor })
})

// GET /api/workspace/activity-log/summary — 오늘/이번주 요약 통계
activityLogRoute.get('/activity-log/summary', async (c) => {
  const tenant = c.get('tenant')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  // Employee department scoping
  if (tenant.departmentIds && tenant.departmentIds.length === 0) {
    return c.json({ data: { today: [], week: [] } })
  }

  let scopedActorIds: string[] | undefined
  if (tenant.departmentIds) {
    const scopedAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.companyId, tenant.companyId), inArray(agents.departmentId, tenant.departmentIds)))
    scopedActorIds = [...scopedAgents.map(a => a.id), tenant.userId]
  }

  const todayConditions = [
    eq(activityLogs.companyId, tenant.companyId),
    gte(activityLogs.createdAt, today),
  ]
  const weekConditions = [
    eq(activityLogs.companyId, tenant.companyId),
    gte(activityLogs.createdAt, weekAgo),
  ]

  if (scopedActorIds) {
    todayConditions.push(inArray(activityLogs.actorId, scopedActorIds))
    weekConditions.push(inArray(activityLogs.actorId, scopedActorIds))
  }

  // 오늘 타입별 카운트
  const todayCounts = await db
    .select({
      type: activityLogs.type,
      count: count(),
    })
    .from(activityLogs)
    .where(and(...todayConditions))
    .groupBy(activityLogs.type)

  // 이번주 타입별 카운트
  const weekCounts = await db
    .select({
      type: activityLogs.type,
      count: count(),
    })
    .from(activityLogs)
    .where(and(...weekConditions))
    .groupBy(activityLogs.type)

  return c.json({
    data: {
      today: todayCounts,
      week: weekCounts,
    },
  })
})
