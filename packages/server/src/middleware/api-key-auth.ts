import type { MiddlewareHandler } from 'hono'
import { createHash } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { companyApiKeys } from '../db/schema'
import { HTTPError } from './error'
import type { AppEnv } from '../types'

// Per-key rate limiting store
const keyRateStore = new Map<string, { count: number; resetAt: number }>()

// 만료된 엔트리 정리 (5분마다)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of keyRateStore) {
    if (entry.resetAt < now) keyRateStore.delete(key)
  }
}, 5 * 60_000)

/**
 * API Key 인증 미들웨어
 * X-API-Key 헤더에서 키를 추출하고 SHA-256 해시로 DB 조회
 * TenantContext를 생성하여 기존 라우트와 동일한 테넌트 격리 제공
 */
export const apiKeyAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const apiKey = c.req.header('X-API-Key')
  if (!apiKey) {
    throw new HTTPError(401, 'API 키가 필요합니다 (X-API-Key 헤더)', 'API_001')
  }

  // SHA-256 해시로 DB 조회
  const keyHash = createHash('sha256').update(apiKey).digest('hex')
  const [record] = await db
    .select()
    .from(companyApiKeys)
    .where(and(eq(companyApiKeys.keyHash, keyHash), eq(companyApiKeys.isActive, true)))
    .limit(1)

  if (!record) {
    throw new HTTPError(401, '유효하지 않은 API 키입니다', 'API_002')
  }

  // 만료일 검증
  if (record.expiresAt && record.expiresAt < new Date()) {
    throw new HTTPError(401, '만료된 API 키입니다', 'API_003')
  }

  // Per-key rate limiting
  const scopes = record.scopes as string[]
  const limit = record.rateLimitPerMin
  const now = Date.now()
  const rateKey = record.id

  const entry = keyRateStore.get(rateKey)
  if (entry && entry.resetAt > now) {
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return c.json(
        { success: false, error: { code: 'API_004', message: 'API 요청 한도 초과', retryAfter } },
        429,
      )
    }
    entry.count++
  } else {
    keyRateStore.set(rateKey, { count: 1, resetAt: now + 60_000 })
  }

  // TenantContext 생성
  c.set('tenant', {
    companyId: record.companyId,
    userId: record.createdBy,
    role: 'user' as const,
    isAdminUser: false,
  })

  // 요청 스코프를 헤더에 저장 (라우트에서 참조 가능)
  c.header('X-API-Key-Scopes', scopes.join(','))
  c.header('X-API-Key-Id', record.id)

  // lastUsedAt 비동기 업데이트 (요청 블로킹 안 함)
  db.update(companyApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(companyApiKeys.id, record.id))
    .execute()
    .catch(() => {}) // 실패해도 요청에 영향 없음

  await next()
}
