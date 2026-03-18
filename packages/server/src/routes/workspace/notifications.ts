import { Hono } from 'hono'
import { eq, and, desc, count } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../../db'
import { notifications, companies, notificationPreferences } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

const notificationPrefsSchema = z.object({
  inApp: z.boolean().optional(),
  email: z.boolean().optional(),
  settings: z.record(z.unknown()).nullable().optional(),
})

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

// GET /api/workspace/notifications/email-configured — SMTP 설정 여부
notificationsRoute.get('/notifications/email-configured', async (c) => {
  const tenant = c.get('tenant')

  const [company] = await db
    .select({ smtpConfig: companies.smtpConfig })
    .from(companies)
    .where(eq(companies.id, tenant.companyId))
    .limit(1)

  return c.json({ data: { configured: !!company?.smtpConfig } })
})

// GET /api/workspace/notification-prefs — 알림 설정 조회
notificationsRoute.get('/notification-prefs', async (c) => {
  const tenant = c.get('tenant')

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(and(
      eq(notificationPreferences.userId, tenant.userId),
      eq(notificationPreferences.companyId, tenant.companyId),
    ))
    .limit(1)

  // 기본값 반환
  return c.json({
    data: prefs ?? {
      inApp: true,
      email: false,
      push: false,
      settings: null,
    },
  })
})

// PUT /api/workspace/notification-prefs — 알림 설정 업데이트 (upsert)
notificationsRoute.put('/notification-prefs', zValidator('json', notificationPrefsSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const values: Record<string, unknown> = { updatedAt: new Date() }
  if (body.inApp !== undefined) values.inApp = body.inApp
  if (body.email !== undefined) values.email = body.email
  if (body.settings !== undefined) values.settings = body.settings

  // Atomic upsert: INSERT ON CONFLICT UPDATE
  await db
    .insert(notificationPreferences)
    .values({
      userId: tenant.userId,
      companyId: tenant.companyId,
      inApp: body.inApp ?? true,
      email: body.email ?? false,
      settings: body.settings ?? null,
    })
    .onConflictDoUpdate({
      target: [notificationPreferences.userId, notificationPreferences.companyId],
      set: values,
    })

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
