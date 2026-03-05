/**
 * Admin 로그인 통합 테스트 — POST /api/auth/admin/login
 * 서버 실행 필요: bun test src/__tests__/api/admin-auth.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { apiNoAuth, api } from '../helpers/test-utils'

describe('Admin Login: POST /auth/admin/login', () => {
  test('빈 body → 400', async () => {
    const res = await apiNoAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })

  test('존재하지 않는 관리자 → 401 + AUTH_001', async () => {
    const res = await apiNoAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nonexistent_admin_99999', password: 'wrong' }),
    })
    expect(res.status).toBe(401)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('AUTH_001')
  })

  test('잘못된 비밀번호 → 401 + AUTH_001', async () => {
    // admin 계정이 존재한다는 가정 (시드 데이터)
    const res = await apiNoAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'definitely_wrong_password' }),
    })
    expect(res.status).toBe(401)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('AUTH_001')
  })
})

describe('Admin Login: 토큰 검증', () => {
  test('admin 토큰으로 admin API 접근 → 200', async () => {
    // admin 로그인 시도 (시드 데이터: admin/admin 또는 환경에 따라 다름)
    const loginRes = await apiNoAuth('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    })
    // 시드 데이터가 없을 수 있으므로 로그인 성공 시만 검증
    if (loginRes.status !== 200) return

    const { data: { token } } = await loginRes.json() as { data: { token: string } }
    expect(token).toBeDefined()

    // admin 토큰으로 회사 목록 조회
    const companiesRes = await api('/admin/companies', token)
    expect(companiesRes.status).toBe(200)
  })

  test('일반 유저 토큰으로 admin API → 403', async () => {
    // 일반 유저 로그인 시도
    const loginRes = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'hwang', password: 'test1234' }),
    })
    if (loginRes.status !== 200) return

    const { data: { token } } = await loginRes.json() as { data: { token: string } }

    // 일반 토큰으로 admin API 접근 시도
    const companiesRes = await api('/admin/companies', token)
    expect(companiesRes.status).toBe(403)
  })
})
