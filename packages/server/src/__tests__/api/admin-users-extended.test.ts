/**
 * Admin Users 확장 테스트 — 비밀번호 초기화, 세션 종료
 * 서버 실행 필요: bun test src/__tests__/api/admin-users-extended.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import {
  api, apiNoAuth, createTestTokens, REAL_COMPANY_ID, REAL_CEO_ID,
  FAKE_COMPANY_ID, FAKE_USER_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let testUserId: string | null = null
const testUsername = 'ext_test_' + Date.now()

beforeAll(async () => {
  tokens = await createTestTokens()

  // 테스트 유저 생성
  const res = await api('/admin/users', tokens.realAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      companyId: REAL_COMPANY_ID,
      username: testUsername,
      password: 'original123',
      name: '확장테스트유저',
    }),
  })
  if (res.status === 201) {
    const body = await res.json() as { data: { id: string } }
    testUserId = body.data.id
  }
})

afterAll(async () => {
  if (testUserId) {
    await api(`/admin/users/${testUserId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
})

describe('Admin: 비밀번호 초기화', () => {
  test('POST /admin/users/:id/reset-password — 임시 비밀번호 발급 → 200', async () => {
    if (!testUserId) return
    const res = await api(`/admin/users/${testUserId}/reset-password`, tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { tempPassword: string } }
    expect(body.data.tempPassword).toBeDefined()
    expect(body.data.tempPassword.length).toBe(8)
    // 혼동 문자 미포함
    expect(body.data.tempPassword).not.toMatch(/[0OlI1]/)
  })

  test('초기화 후 새 비밀번호로 로그인 가능', async () => {
    if (!testUserId) return
    // 비밀번호 초기화
    const resetRes = await api(`/admin/users/${testUserId}/reset-password`, tokens.realAdminToken, {
      method: 'POST',
    })
    const { data: { tempPassword } } = await resetRes.json() as { data: { tempPassword: string } }

    // 새 비밀번호로 로그인
    const loginRes = await apiNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: testUsername, password: tempPassword }),
    })
    expect(loginRes.status).toBe(200)
    const loginBody = await loginRes.json() as { data: { token: string } }
    expect(loginBody.data.token).toBeDefined()
  })

  test('존재하지 않는 유저 비밀번호 초기화 → 404', async () => {
    const res = await api('/admin/users/00000000-0000-0000-0000-000000000000/reset-password', tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('USER_001')
  })
})

describe('Admin: 세션 종료', () => {
  test('POST /admin/users/:id/terminate-session — 세션 종료 → 200', async () => {
    if (!testUserId) return
    const res = await api(`/admin/users/${testUserId}/terminate-session`, tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { message: string } }
    expect(body.data.message).toContain('종료')
  })

  test('존재하지 않는 유저 세션 종료 → 404', async () => {
    const res = await api('/admin/users/00000000-0000-0000-0000-000000000000/terminate-session', tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('USER_001')
  })

  test('user 역할로 세션 종료 → 403', async () => {
    if (!testUserId) return
    const res = await api(`/admin/users/${testUserId}/terminate-session`, tokens.realCeoToken, {
      method: 'POST',
    })
    expect(res.status).toBe(403)
  })
})

describe('Admin: 유저 삭제 보호 (soft delete)', () => {
  test('DELETE /admin/users/:id — soft delete → isActive=false', async () => {
    if (!testUserId) return
    const res = await api(`/admin/users/${testUserId}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)

    // 삭제 후 조회하면 isActive=false
    const detailRes = await api(`/admin/users/${testUserId}`, tokens.realAdminToken)
    expect(detailRes.status).toBe(200)
    const body = await detailRes.json() as { data: { isActive: boolean } }
    expect(body.data.isActive).toBe(false)
    testUserId = null // afterAll에서 중복 삭제 방지
  })
})
