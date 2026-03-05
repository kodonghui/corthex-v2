import { Hono } from 'hono'
import { eq, and, desc, count } from 'drizzle-orm'
import { db } from '../../db'
import { notifications } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

export const notificationsRoute = new Hono<AppEnv>()

notificationsRoute.use('*', authMiddleware)

// GET /api/workspace/notifications — 알림 목록
notificationsRoute.get('/notifications', async (c) => {
  const tenant = c.get('tenant')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
  const offset = Number(c.req.query('offset')) || 0
  const filter = c.req.query('filter') // 'unread'

  const conditions = [
    eq(notifications.companyId, tenant.companyId),
    eq(notifications.userId, tenant.userId),
  ]

  if (filter === 'unread') {
    conditions.push(eq(notifications.isRead, false))
  }

  const result = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      actionUrl: notifications.actionUrl,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ data: result })
})

// GET /api/workspace/notifications/count — 미읽음 건수
notificationsRoute.get('/notifications/count', async (c) => {
  const tenant = c.get('tenant')

  const [result] = await db
    .select({ unread: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.companyId, tenant.companyId),
        eq(notifications.userId, tenant.userId),
        eq(notifications.isRead, false),
      ),
    )

  return c.json({ data: { unread: result?.unread ?? 0 } })
})

// PATCH /api/workspace/notifications/:id/read — 개별 읽음 처리
notificationsRoute.patch('/notifications/:id/read', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, tenant.userId),
        eq(notifications.companyId, tenant.companyId),
      ),
    )

  return c.json({ data: { success: true } })
})

// POST /api/workspace/notifications/read-all — 전체 읽음 처리
notificationsRoute.post('/notifications/read-all', async (c) => {
  const tenant = c.get('tenant')

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, tenant.userId),
        eq(notifications.companyId, tenant.companyId),
        eq(notifications.isRead, false),
      ),
    )

  return c.json({ data: { success: true } })
})
