import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createHash, randomBytes } from 'crypto'
import { db } from '../../db'
import { companyApiKeys } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { createAuditLog, AUDIT_ACTIONS } from '../../services/audit-log'
import type { AppEnv } from '../../types'

export const publicApiKeysRoute = new Hono<AppEnv>()

publicApiKeysRoute.use('*', authMiddleware, adminOnly)

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(['read', 'write', 'execute'])).min(1).default(['read']),
  expiresAt: z.string().datetime().nullable().optional(),
  rateLimitPerMin: z.number().int().min(1).max(10000).default(60),
})

// Helper: generate API key
function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `cxk_live_${randomBytes(32).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 16) + '...'
  return { rawKey, keyHash, keyPrefix }
}

// GET /api/admin/public-api-keys — 회사별 API 키 목록
publicApiKeysRoute.get('/public-api-keys', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')

  const keys = await db
    .select({
      id: companyApiKeys.id,
      name: companyApiKeys.name,
      keyPrefix: companyApiKeys.keyPrefix,
      lastUsedAt: companyApiKeys.lastUsedAt,
      expiresAt: companyApiKeys.expiresAt,
      isActive: companyApiKeys.isActive,
      scopes: companyApiKeys.scopes,
      rateLimitPerMin: companyApiKeys.rateLimitPerMin,
      createdAt: companyApiKeys.createdAt,
    })
    .from(companyApiKeys)
    .where(eq(companyApiKeys.companyId, tenant.companyId))

  return c.json({ success: true, data: keys })
})

// POST /api/admin/public-api-keys — API 키 생성
publicApiKeysRoute.post('/public-api-keys', tenantMiddleware, zValidator('json', createKeySchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const { rawKey, keyHash, keyPrefix } = generateApiKey()

  const [created] = await db
    .insert(companyApiKeys)
    .values({
      companyId: tenant.companyId,
      name: body.name,
      keyPrefix,
      keyHash,
      scopes: body.scopes,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      rateLimitPerMin: body.rateLimitPerMin,
      createdBy: tenant.userId,
    })
    .returning({
      id: companyApiKeys.id,
      name: companyApiKeys.name,
      keyPrefix: companyApiKeys.keyPrefix,
      scopes: companyApiKeys.scopes,
      expiresAt: companyApiKeys.expiresAt,
      rateLimitPerMin: companyApiKeys.rateLimitPerMin,
      createdAt: companyApiKeys.createdAt,
    })

  await createAuditLog({
    companyId: tenant.companyId,
    actorType: 'admin_user',
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.API_KEY_CREATE,
    targetType: 'company_api_key',
    targetId: created.id,
    after: { name: body.name, scopes: body.scopes },
  })

  // rawKey는 이 응답에서만 1회 반환 — 이후 조회 불가
  return c.json({ success: true, data: { ...created, rawKey } }, 201)
})

// DELETE /api/admin/public-api-keys/:id — 비활성화 (soft delete)
publicApiKeysRoute.delete('/public-api-keys/:id', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [key] = await db
    .update(companyApiKeys)
    .set({ isActive: false })
    .where(and(eq(companyApiKeys.id, id), eq(companyApiKeys.companyId, tenant.companyId)))
    .returning({ id: companyApiKeys.id, name: companyApiKeys.name })

  if (!key) throw new HTTPError(404, 'API 키를 찾을 수 없습니다', 'PAK_001')

  await createAuditLog({
    companyId: tenant.companyId,
    actorType: 'admin_user',
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.API_KEY_DELETE,
    targetType: 'company_api_key',
    targetId: id,
    metadata: { name: key.name },
  })

  return c.json({ success: true, data: { message: 'API 키가 비활성화되었습니다' } })
})

// POST /api/admin/public-api-keys/:id/rotate — 키 로테이션
publicApiKeysRoute.post('/public-api-keys/:id/rotate', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // 기존 키 조회
  const [existing] = await db
    .select()
    .from(companyApiKeys)
    .where(and(eq(companyApiKeys.id, id), eq(companyApiKeys.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'API 키를 찾을 수 없습니다', 'PAK_002')
  if (!existing.isActive) throw new HTTPError(400, '비활성화된 키는 로테이션할 수 없습니다', 'PAK_003')

  // 기존 키 비활성화 + 새 키 생성 (트랜잭션)
  const { rawKey, keyHash, keyPrefix } = generateApiKey()

  const [newKey] = await db.transaction(async (tx) => {
    // 기존 키 비활성화
    await tx
      .update(companyApiKeys)
      .set({ isActive: false })
      .where(eq(companyApiKeys.id, id))

    // 새 키 생성 (기존 설정 유지)
    return tx
      .insert(companyApiKeys)
      .values({
        companyId: tenant.companyId,
        name: existing.name,
        keyPrefix,
        keyHash,
        scopes: existing.scopes,
        expiresAt: existing.expiresAt,
        rateLimitPerMin: existing.rateLimitPerMin,
        createdBy: tenant.userId,
      })
      .returning({
        id: companyApiKeys.id,
        name: companyApiKeys.name,
        keyPrefix: companyApiKeys.keyPrefix,
        scopes: companyApiKeys.scopes,
        expiresAt: companyApiKeys.expiresAt,
        rateLimitPerMin: companyApiKeys.rateLimitPerMin,
        createdAt: companyApiKeys.createdAt,
      })
  })

  await createAuditLog({
    companyId: tenant.companyId,
    actorType: 'admin_user',
    actorId: tenant.userId,
    action: AUDIT_ACTIONS.API_KEY_ROTATE,
    targetType: 'company_api_key',
    targetId: id,
    metadata: { oldKeyId: id, newKeyId: newKey.id, name: existing.name },
  })

  return c.json({ success: true, data: { ...newKey, rawKey } }, 201)
})
