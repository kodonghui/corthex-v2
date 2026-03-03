/**
 * Auth API 테스트
 * 서버 실행 필요: bun test src/__tests__/api/auth.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, apiNoAuth, BASE, REAL_CEO_ID, REAL_COMPANY_ID,
  makeToken, makeExpiredToken, createTestTokens,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('POST /auth/login', () => {
  test('빈 body → 400 (zod 검증 실패)', async () => {
    const res = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })

  test('존재하지 않는 유저 → 401', async () => {
    const res = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nonexistent_user_xyz', password: 'wrong' }),
    })
    expect(res.status).toBe(401)
  })

  test('잘못된 비밀번호 → 401 + AUTH_001', async () => {
    // 시드 CEO username = "ceo" (가정)
    const res = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'ceo', password: 'definitely-wrong-password' }),
    })
    expect(res.status).toBe(401)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('AUTH_001')
  })
})

describe('GET /auth/me', () => {
  test('유효한 토큰 → 200 + 유저 정보', async () => {
    const res = await api('/auth/me', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string; companyId: string; role: string } }
    expect(body.data.id).toBe(REAL_CEO_ID)
    expect(body.data.companyId).toBe(REAL_COMPANY_ID)
  })

  test('토큰 없이 → 401', async () => {
    const res = await apiNoAuth('/auth/me')
    expect(res.status).toBe(401)
  })

  test('만료된 토큰 → 401', async () => {
    const expired = await makeExpiredToken(REAL_CEO_ID, REAL_COMPANY_ID)
    const res = await api('/auth/me', expired)
    expect(res.status).toBe(401)
  })

  test('잘못된 토큰 → 401', async () => {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    })
    expect(res.status).toBe(401)
  })

  test('가짜 유저 토큰 → 404 (DB에 없음)', async () => {
    const res = await api('/auth/me', tokens.fakeUserToken)
    expect(res.status).toBe(404)
  })
})
