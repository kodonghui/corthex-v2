/**
 * 공통 에러 시나리오 테스트
 * 서버 실행 필요: bun test src/__tests__/api/error-scenarios.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, apiNoAuth, BASE, createTestTokens, makeExpiredToken,
  REAL_CEO_ID, REAL_COMPANY_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('Health 엔드포인트', () => {
  test('GET /health → 200', async () => {
    const res = await fetch(`${BASE}/health`)
    expect(res.status).toBe(200)
  })
})

describe('인증 에러', () => {
  test('만료 토큰 → 401 + AUTH_002', async () => {
    const expired = await makeExpiredToken(REAL_CEO_ID, REAL_COMPANY_ID)
    const res = await api('/workspace/agents', expired)
    expect(res.status).toBe(401)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('AUTH_002')
  })

  test('Authorization 헤더 없음 → 401', async () => {
    const res = await fetch(`${BASE}/workspace/agents`)
    expect(res.status).toBe(401)
  })

  test('Bearer 없이 토큰만 → 401', async () => {
    const res = await fetch(`${BASE}/workspace/agents`, {
      headers: { Authorization: tokens.realCeoToken },
    })
    expect(res.status).toBe(401)
  })
})

describe('에러 응답 형식', () => {
  test('에러 응답은 { error: { code, message } } 형식', async () => {
    const res = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'x', password: 'wrong' }),
    })
    expect(res.status).toBe(401)
    const body = await res.json() as { error: { code: string; message: string } }
    expect(body.error).toBeDefined()
    expect(typeof body.error.code).toBe('string')
    expect(typeof body.error.message).toBe('string')
  })
})

describe('Admin 권한 스팟체크', () => {
  test('user 역할로 /admin/agents → 403', async () => {
    const res = await api('/admin/agents', tokens.realCeoToken)
    expect(res.status).toBe(403)
  })

  test('user 역할로 /admin/users → 403', async () => {
    const res = await api('/admin/users', tokens.realCeoToken)
    expect(res.status).toBe(403)
  })

  test('user 역할로 /admin/departments → 403', async () => {
    const res = await api('/admin/departments', tokens.realCeoToken)
    expect(res.status).toBe(403)
  })

  test('admin 역할로 /admin/agents → 200', async () => {
    const res = await api('/admin/agents', tokens.realAdminToken)
    expect(res.status).toBe(200)
  })
})
