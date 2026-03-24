import type { MiddlewareHandler } from 'hono'

const createRateLimiter = (limit: number, windowMs: number, errorCode: string, errorMessage: string): MiddlewareHandler => {
  const store = new Map<string, { count: number; resetAt: number }>()

  // 만료된 엔트리 정리 (5분마다)
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60_000)

  return async (c, next) => {
    const ip = c.req.header('cf-connecting-ip')
      || c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return c.json(
        { error: { code: errorCode, message: errorMessage, retryAfter } },
        429,
      )
    }

    entry.count++
    return next()
  }
}

/** 로그인 엔드포인트: 분당 5회 */
export const loginRateLimit = createRateLimiter(
  5, 60_000,
  'AUTH_004', '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
)

/** 일반 API: 분당 100회 */
export const apiRateLimit = createRateLimiter(
  100, 60_000,
  'RATE_001', 'API 요청 한도 초과',
)

/** CLI 토큰 등록: 분당 10회 (NFR-S13) */
export const cliRateLimit = createRateLimiter(
  10, 60_000,
  'CRED_RATE', 'CLI 인증 요청 한도 초과',
)
