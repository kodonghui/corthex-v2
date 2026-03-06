import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import webpush from 'web-push'
import { db } from '../../db'
import { pushSubscriptions } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import type { AppEnv } from '../../types'

// VAPID keys — generate once, store in env
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@corthex-hq.com'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

export const pushRoute = new Hono<AppEnv>()

pushRoute.use('*', authMiddleware)

// GET /push/vapid-key — 공개키 반환
pushRoute.get('/vapid-key', (c) => {
  return c.json({ data: VAPID_PUBLIC })
})

// POST /push/subscribe — 구독 등록
const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

pushRoute.post('/subscribe', zValidator('json', subscribeSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Upsert: endpoint가 이미 존재하면 업데이트
  await db
    .insert(pushSubscriptions)
    .values({
      userId: tenant.userId,
      companyId: tenant.companyId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: tenant.userId,
        companyId: tenant.companyId,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
    })

  return c.json({ success: true })
})

// DELETE /push/subscribe — 구독 해제
pushRoute.delete('/subscribe', async (c) => {
  const tenant = c.get('tenant')

  await db
    .delete(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, tenant.userId),
      eq(pushSubscriptions.companyId, tenant.companyId),
    ))

  return c.json({ success: true })
})

/**
 * 특정 유저에게 Web Push 발송
 * 메신저/알림 등에서 호출
 */
export async function sendPushToUser(
  userId: string,
  companyId: string,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.companyId, companyId),
    ))

  const message = JSON.stringify(payload)

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message,
      )
    } catch (err: unknown) {
      // 410 Gone or 404 — subscription expired, remove it
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const statusCode = (err as { statusCode: number }).statusCode
        if (statusCode === 410 || statusCode === 404) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id))
        }
      }
    }
  }
}
