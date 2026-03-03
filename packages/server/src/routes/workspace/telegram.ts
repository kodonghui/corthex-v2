import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { telegramConfigs } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { encrypt, decrypt } from '../../lib/crypto'
import { logActivity } from '../../lib/activity-logger'
import type { TenantContext } from '@corthex/shared'

export const telegramRoute = new Hono()

telegramRoute.use('*', authMiddleware)

const configSchema = z.object({
  botToken: z.string().min(1),
  ceoChatId: z.string().optional(),
})

// GET /api/workspace/telegram/config — 설정 조회
telegramRoute.get('/telegram/config', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const [config] = await db
    .select({
      id: telegramConfigs.id,
      isActive: telegramConfigs.isActive,
      ceoChatId: telegramConfigs.ceoChatId,
      lastPollAt: telegramConfigs.lastPollAt,
      createdAt: telegramConfigs.createdAt,
    })
    .from(telegramConfigs)
    .where(eq(telegramConfigs.companyId, tenant.companyId))
    .limit(1)

  if (!config) {
    return c.json({ data: null })
  }

  return c.json({ data: { ...config, hasToken: true } })
})

// POST /api/workspace/telegram/config — 봇 토큰 등록/업데이트
telegramRoute.post('/telegram/config', zValidator('json', configSchema), async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const { botToken, ceoChatId } = c.req.valid('json')

  // 봇 토큰 유효성 검증 (getMe)
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const data = await res.json() as any
    if (!data.ok) throw new Error('Invalid token')
  } catch {
    throw new HTTPError(400, '봇 토큰이 유효하지 않습니다', 'TELEGRAM_002')
  }

  const encryptedToken = encrypt(botToken)

  // upsert
  const [existing] = await db
    .select({ id: telegramConfigs.id })
    .from(telegramConfigs)
    .where(eq(telegramConfigs.companyId, tenant.companyId))
    .limit(1)

  if (existing) {
    await db
      .update(telegramConfigs)
      .set({
        botToken: encryptedToken,
        ceoChatId: ceoChatId || undefined,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(telegramConfigs.id, existing.id))
  } else {
    await db
      .insert(telegramConfigs)
      .values({
        companyId: tenant.companyId,
        botToken: encryptedToken,
        ceoChatId,
        isActive: true,
      })
  }

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    actorType: 'user',
    actorId: tenant.userId,
    action: '텔레그램 봇 설정 등록',
  })

  return c.json({ data: { success: true } })
})

// POST /api/workspace/telegram/test — 테스트 메시지 전송
telegramRoute.post('/telegram/test', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const [config] = await db
    .select()
    .from(telegramConfigs)
    .where(and(eq(telegramConfigs.companyId, tenant.companyId), eq(telegramConfigs.isActive, true)))
    .limit(1)

  if (!config) throw new HTTPError(404, '텔레그램 설정을 찾을 수 없습니다', 'TELEGRAM_001')
  if (!config.ceoChatId) throw new HTTPError(400, 'CEO 채팅 ID가 설정되지 않았습니다', 'TELEGRAM_001')

  const botToken = decrypt(config.botToken)

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.ceoChatId,
        text: '🤖 CORTHEX v2 텔레그램 연동 테스트 성공!',
      }),
    })
    const data = await res.json() as any
    if (!data.ok) throw new Error(data.description || '전송 실패')
  } catch (err) {
    throw new HTTPError(500, `테스트 메시지 전송 실패: ${err instanceof Error ? err.message : ''}`, 'TELEGRAM_002')
  }

  return c.json({ data: { success: true } })
})

// DELETE /api/workspace/telegram/config — 연결 해제
telegramRoute.delete('/telegram/config', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  await db
    .update(telegramConfigs)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(telegramConfigs.companyId, tenant.companyId))

  logActivity({
    companyId: tenant.companyId,
    type: 'system',
    actorType: 'user',
    actorId: tenant.userId,
    action: '텔레그램 봇 연결 해제',
  })

  return c.json({ data: { success: true } })
})
