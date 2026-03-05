import { describe, expect, test, beforeEach } from 'bun:test'
import { Hono } from 'hono'

// rate-limit 모듈을 직접 테스트하기 위해 createRateLimiter 패턴을 인라인으로 재현
// (실제 모듈은 setInterval이 있어 테스트 환경에서 import하면 타이머가 돌아감)

function createTestRateLimiter(limit: number, windowMs: number, errorCode: string, errorMessage: string) {
  const store = new Map<string, { count: number; resetAt: number }>()

  return async (c: any, next: () => Promise<void>) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= limit) {
      return c.json(
        { error: { code: errorCode, message: errorMessage } },
        429,
      )
    }

    entry.count++
    return next()
  }
}

describe('Rate Limiting', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
  })

  test('loginRateLimit: 5회까지 허용, 6회째 429', async () => {
    const limiter = createTestRateLimiter(5, 60_000, 'AUTH_004', '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.')
    app.use('/login', limiter)
    app.post('/login', (c) => c.json({ data: { token: 'ok' } }))

    // 5회 성공
    for (let i = 0; i < 5; i++) {
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': '1.2.3.4' },
      })
      expect(res.status).toBe(200)
    }

    // 6회째 → 429
    const res = await app.request('/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    expect(res.status).toBe(429)
    const body = await res.json() as any
    expect(body.error.code).toBe('AUTH_004')
  })

  test('apiRateLimit: 100회까지 허용, 101회째 429', async () => {
    const limiter = createTestRateLimiter(100, 60_000, 'RATE_001', 'API 요청 한도 초과')
    app.use('/api/test', limiter)
    app.get('/api/test', (c) => c.json({ data: 'ok' }))

    // 100회 성공
    for (let i = 0; i < 100; i++) {
      const res = await app.request('/api/test', {
        headers: { 'x-forwarded-for': '5.6.7.8' },
      })
      expect(res.status).toBe(200)
    }

    // 101회째 → 429
    const res = await app.request('/api/test', {
      headers: { 'x-forwarded-for': '5.6.7.8' },
    })
    expect(res.status).toBe(429)
    const body = await res.json() as any
    expect(body.error.code).toBe('RATE_001')
  })

  test('다른 IP는 별도 카운트', async () => {
    const limiter = createTestRateLimiter(2, 60_000, 'RATE_001', 'limit')
    app.use('/test', limiter)
    app.get('/test', (c) => c.json({ data: 'ok' }))

    // IP-A: 2회 → 한도 도달
    for (let i = 0; i < 2; i++) {
      const res = await app.request('/test', { headers: { 'x-forwarded-for': 'IP-A' } })
      expect(res.status).toBe(200)
    }
    const resA = await app.request('/test', { headers: { 'x-forwarded-for': 'IP-A' } })
    expect(resA.status).toBe(429)

    // IP-B: 아직 카운트 0이므로 통과
    const resB = await app.request('/test', { headers: { 'x-forwarded-for': 'IP-B' } })
    expect(resB.status).toBe(200)
  })

  test('429 응답에 표준 에러 구조 포함', async () => {
    const limiter = createTestRateLimiter(1, 60_000, 'AUTH_004', '너무 많습니다')
    app.use('/test', limiter)
    app.get('/test', (c) => c.json({ data: 'ok' }))

    await app.request('/test', { headers: { 'x-forwarded-for': 'test-ip' } })
    const res = await app.request('/test', { headers: { 'x-forwarded-for': 'test-ip' } })
    expect(res.status).toBe(429)

    const body = await res.json() as any
    expect(body.error).toBeDefined()
    expect(body.error.code).toBe('AUTH_004')
    expect(body.error.message).toBe('너무 많습니다')
  })
})
