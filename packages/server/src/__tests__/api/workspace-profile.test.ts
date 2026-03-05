/**
 * Workspace Profile & API Keys 테스트 (Epic 3: Story 3-1, 3-4)
 * 서버 실행 필요: bun test src/__tests__/api/workspace-profile.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, apiNoAuth, createTestTokens, REAL_CEO_ID, REAL_COMPANY_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

// ==========================================
// Story 3-1: 유저 프로필 조회/수정
// ==========================================
describe('GET /workspace/profile', () => {
  test('유효한 토큰 → 200 + 프로필 반환', async () => {
    const res = await api('/workspace/profile', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string; companyId: string; name: string; role: string } }
    expect(body.data.id).toBe(REAL_CEO_ID)
    expect(body.data.companyId).toBe(REAL_COMPANY_ID)
    expect(typeof body.data.name).toBe('string')
    expect(typeof body.data.role).toBe('string')
  })

  test('토큰 없이 → 401', async () => {
    const res = await apiNoAuth('/workspace/profile')
    expect(res.status).toBe(401)
  })

  test('가짜 유저 토큰 → 404', async () => {
    const res = await api('/workspace/profile', tokens.fakeUserToken)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /workspace/profile', () => {
  test('이름 수정 → 200', async () => {
    const res = await api('/workspace/profile', tokens.realCeoToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'CEO 테스트' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { name: string } }
    expect(body.data.name).toBe('CEO 테스트')
  })

  test('빈 이름 → 400', async () => {
    const res = await api('/workspace/profile', tokens.realCeoToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: '' }),
    })
    expect(res.status).toBe(400)
  })

  test('잘못된 이메일 → 400', async () => {
    const res = await api('/workspace/profile', tokens.realCeoToken, {
      method: 'PATCH',
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    expect(res.status).toBe(400)
  })
})

// ==========================================
// Story 3-4: 개인 API Key 관리
// ==========================================
describe('GET /workspace/profile/api-keys', () => {
  test('API key 목록 조회 → 200 + 배열', async () => {
    const res = await api('/workspace/profile/api-keys', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('토큰 없이 → 401', async () => {
    const res = await apiNoAuth('/workspace/profile/api-keys')
    expect(res.status).toBe(401)
  })
})

describe('POST /workspace/profile/api-keys', () => {
  let createdKeyId: string | null = null

  test('notion API key 등록 → 201', async () => {
    const res = await api('/workspace/profile/api-keys', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        provider: 'notion',
        label: '테스트 노션 키',
        credentials: { api_key: 'test-notion-key-' + Date.now() },
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; provider: string; label: string } }
    expect(body.data.provider).toBe('notion')
    expect(body.data.label).toBe('테스트 노션 키')
    createdKeyId = body.data.id
  })

  test('KIS 필수 필드 누락 → 400', async () => {
    const res = await api('/workspace/profile/api-keys', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        provider: 'kis',
        credentials: { app_key: 'test' }, // app_secret, account_no 누락
      }),
    })
    expect(res.status).toBe(400)
  })

  test('지원하지 않는 provider → 400', async () => {
    const res = await api('/workspace/profile/api-keys', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        provider: 'unknown_provider',
        credentials: { key: 'value' },
      }),
    })
    expect(res.status).toBe(400)
  })

  test('email(SMTP) 전체 필드 등록 → 201', async () => {
    const res = await api('/workspace/profile/api-keys', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        provider: 'email',
        credentials: {
          host: 'smtp.test.com',
          port: '587',
          user: 'test@test.com',
          password: 'test-password',
          from: 'noreply@test.com',
        },
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; provider: string } }
    expect(body.data.provider).toBe('email')
    // cleanup
    await api(`/workspace/profile/api-keys/${body.data.id}`, tokens.realCeoToken, { method: 'DELETE' })
  })

  test('DELETE /workspace/profile/api-keys/:id — 등록된 키 삭제 → 200', async () => {
    if (!createdKeyId) return
    const res = await api(`/workspace/profile/api-keys/${createdKeyId}`, tokens.realCeoToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { deleted: boolean } }
    expect(body.data.deleted).toBe(true)
  })

  test('DELETE 없는 키 → 404', async () => {
    const res = await api('/workspace/profile/api-keys/00000000-0000-0000-0000-000000000000', tokens.realCeoToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
  })

  test('타사 유저가 내 키 삭제 시도 → 404', async () => {
    // 먼저 키 등록
    const createRes = await api('/workspace/profile/api-keys', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        provider: 'notion',
        credentials: { api_key: 'temp-key-' + Date.now() },
      }),
    })
    const created = await createRes.json() as { data: { id: string } }

    // 타사 유저로 삭제 시도
    const deleteRes = await api(`/workspace/profile/api-keys/${created.data.id}`, tokens.fakeUserToken, {
      method: 'DELETE',
    })
    expect(deleteRes.status).toBe(404)

    // cleanup
    await api(`/workspace/profile/api-keys/${created.data.id}`, tokens.realCeoToken, { method: 'DELETE' })
  })
})
