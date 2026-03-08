/**
 * Telegram Webhook 수신 라우트 (공개 엔드포인트)
 *
 * Telegram 서버가 직접 호출하므로 인증 미들웨어 없음.
 * X-Telegram-Bot-Api-Secret-Token 헤더로 검증.
 */

import { Hono } from 'hono'
import { db } from '../db'
import { telegramConfigs } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { handleUpdate, type TelegramUpdate } from '../services/telegram-bot'

export const telegramWebhookRoute = new Hono()

// POST /api/telegram/webhook/:companyId — Telegram Update 수신
telegramWebhookRoute.post('/webhook/:companyId', async (c) => {
  const companyId = c.req.param('companyId')

  // Always return 200 quickly to Telegram (they retry on non-200)
  // Validation and processing happen but errors are caught internally

  // Load config
  const [config] = await db
    .select()
    .from(telegramConfigs)
    .where(and(eq(telegramConfigs.companyId, companyId), eq(telegramConfigs.isActive, true)))
    .limit(1)

  if (!config) {
    // Return 200 anyway to stop Telegram retries for deactivated bots
    return c.json({ ok: true })
  }

  // Verify secret token
  const secretHeader = c.req.header('x-telegram-bot-api-secret-token')
  if (config.webhookSecret && secretHeader !== config.webhookSecret) {
    console.warn(`[TelegramWebhook] Invalid secret for company ${companyId}`)
    return c.json({ ok: true }) // 200 to prevent retries
  }

  // Parse update
  let update: TelegramUpdate
  try {
    update = await c.req.json<TelegramUpdate>()
  } catch {
    return c.json({ ok: true })
  }

  // Process in background — don't block the webhook response
  handleUpdate(update, config).catch(err => {
    console.error(`[TelegramWebhook] handleUpdate failed for company ${companyId}:`, err)
  })

  return c.json({ ok: true })
})
