import { describe, expect, test, beforeEach } from 'bun:test'
import { Hono } from 'hono'
import { loginRateLimit, apiRateLimit } from '../../middleware/rate-limit'

describe('Rate Limiting', () => {
  test('loginRateLimit: 5회까지 허용, 6회째 429', async () => {
    const app = new Hono()
    app.use('/login', loginRateLimit)
    app.post('/login', (c) => c.json({ data: { token: 'ok' } }))

    // 5회 성공
    for (let i = 0; i < 5; i++) {
      const res = await app.request('/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': 'login-test-ip' },
      })
      expect(res.status).toBe(200)
    }

    // 6회째 → 429
    const res = await app.request('/login', {
      method: 'POST',
      headers: { 'x-forwarded-for': 'login-test-ip' },
    })
    expect(res.status).toBe(429)
    const body = await res.json() as any
    expect(body.error.code).toBe('AUTH_004')
  })

  test('apiRateLimit: 100회까지 허용, 101회째 429', async () => {
    const app = new Hono()
    app.use('/api/test', apiRateLimit)
    app.get('/api/test', (c) => c.json({ data: 'ok' }))

    // 100회 성공
    for (let i = 0; i < 100; i++) {
      const res = await app.request('/api/test', {
        headers: { 'x-forwarded-for': 'api-test-ip' },
      })
      expect(res.status).toBe(200)
    }

    // 101회째 → 429
    const res = await app.request('/api/test', {
      headers: { 'x-forwarded-for': 'api-test-ip' },
    })
    expect(res.status).toBe(429)
    const body = await res.json() as any
    expect(body.error.code).toBe('RATE_001')
  })

  test('다른 IP는 별도 카운트', async () => {
    const app = new Hono()
    app.use('/test', loginRateLimit) // 5/min 제한 사용
    app.get('/test', (c) => c.json({ data: 'ok' }))

    // IP-A: 5회 → 한도 도달
    for (let i = 0; i < 5; i++) {
      const res = await app.request('/test', { headers: { 'x-forwarded-for': 'ip-isolation-A' } })
      expect(res.status).toBe(200)
    }
    const resA = await app.request('/test', { headers: { 'x-forwarded-for': 'ip-isolation-A' } })
    expect(resA.status).toBe(429)

    // IP-B: 아직 카운트 0이므로 통과
    const resB = await app.request('/test', { headers: { 'x-forwarded-for': 'ip-isolation-B' } })
    expect(resB.status).toBe(200)
  })

  test('429 응답에 표준 에러 구조 포함', async () => {
    const app = new Hono()
    app.use('/test', loginRateLimit)
    app.get('/test', (c) => c.json({ data: 'ok' }))

    // loginRateLimit은 5/min이므로 5회 소진
    for (let i = 0; i < 5; i++) {
      await app.request('/test', { headers: { 'x-forwarded-for': 'error-struct-ip' } })
    }
    const res = await app.request('/test', { headers: { 'x-forwarded-for': 'error-struct-ip' } })
    expect(res.status).toBe(429)

    const body = await res.json() as any
    expect(body.error).toBeDefined()
    expect(body.error.code).toBe('AUTH_004')
    expect(body.error.message).toBe('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.')
  })
})
