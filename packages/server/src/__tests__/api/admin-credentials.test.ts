/**
 * Admin Credentials 통합 테스트 — CLI 토큰 + API 키
 * 서버 실행 필요: bun test src/__tests__/api/admin-credentials.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import {
  api, createTestTokens, REAL_COMPANY_ID, REAL_CEO_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let createdCliId: string | null = null
let createdApiKeyId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

afterAll(async () => {
  if (createdCliId) {
    await api(`/admin/cli-credentials/${createdCliId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
  if (createdApiKeyId) {
    await api(`/admin/api-keys/${createdApiKeyId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
})

// =============================================
// CLI Credentials
// =============================================
describe('Admin: CLI 토큰 CRUD', () => {
  test('GET /admin/cli-credentials — userId 없음 → 400', async () => {
    const res = await api('/admin/cli-credentials', tokens.realAdminToken)
    expect(res.status).toBe(400)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('CRED_001')
  })

  test('GET /admin/cli-credentials?userId=xxx — 목록 조회 → 200', async () => {
    const res = await api(`/admin/cli-credentials?userId=${REAL_CEO_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('POST /admin/cli-credentials — 토큰 등록 → 201', async () => {
    const res = await api('/admin/cli-credentials', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        userId: REAL_CEO_ID,
        label: '테스트CLI_' + Date.now(),
        token: 'sk-test-token-value-12345',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; label: string } }
    expect(body.data.id).toBeDefined()
    expect(body.data.label).toContain('테스트CLI')
    createdCliId = body.data.id
  })

  test('POST /admin/cli-credentials — 토큰 값이 응답에 포함되지 않음', async () => {
    if (!createdCliId) return
    const res = await api(`/admin/cli-credentials?userId=${REAL_CEO_ID}`, tokens.realAdminToken)
    const body = await res.json() as { data: Array<Record<string, unknown>> }
    const found = body.data.find((c) => c.id === createdCliId)
    expect(found).toBeDefined()
    expect(found!.encryptedToken).toBeUndefined()
    expect((found as Record<string, unknown>).token).toBeUndefined()
  })

  test('DELETE /admin/cli-credentials/:id — 비활성화 → 200', async () => {
    if (!createdCliId) return
    const res = await api(`/admin/cli-credentials/${createdCliId}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    createdCliId = null
  })

  test('DELETE /admin/cli-credentials — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/cli-credentials/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('CRED_002')
  })

  test('user 역할로 CLI 토큰 조회 → 403', async () => {
    const res = await api(`/admin/cli-credentials?userId=${REAL_CEO_ID}`, tokens.realCeoToken)
    expect(res.status).toBe(403)
  })
})

// =============================================
// API Keys
// =============================================
describe('Admin: API 키 CRUD', () => {
  test('GET /admin/api-keys — userId 없음 → 400', async () => {
    const res = await api('/admin/api-keys', tokens.realAdminToken)
    expect(res.status).toBe(400)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('CRED_001')
  })

  test('GET /admin/api-keys?userId=xxx — 목록 조회 → 200', async () => {
    const res = await api(`/admin/api-keys?userId=${REAL_CEO_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('POST /admin/api-keys — Serper 키 등록 → 201', async () => {
    const res = await api('/admin/api-keys', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        userId: REAL_CEO_ID,
        provider: 'serper',
        label: '테스트Serper_' + Date.now(),
        credentials: { apiKey: 'test-serper-key-12345' },
        scope: 'company',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; provider: string } }
    expect(body.data.id).toBeDefined()
    expect(body.data.provider).toBe('serper')
    createdApiKeyId = body.data.id
  })

  test('POST /admin/api-keys — 자격증명이 응답에 포함되지 않음', async () => {
    if (!createdApiKeyId) return
    const res = await api(`/admin/api-keys?userId=${REAL_CEO_ID}`, tokens.realAdminToken)
    const body = await res.json() as { data: Array<Record<string, unknown>> }
    const found = body.data.find((k) => k.id === createdApiKeyId)
    expect(found).toBeDefined()
    expect(found!.credentials).toBeUndefined()
  })

  test('POST /admin/api-keys — 잘못된 provider → 400', async () => {
    const res = await api('/admin/api-keys', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        userId: REAL_CEO_ID,
        provider: 'invalid_provider',
        credentials: { key: 'value' },
        scope: 'company',
      }),
    })
    expect(res.status).toBe(400)
  })

  test('DELETE /admin/api-keys/:id — 삭제 → 200', async () => {
    if (!createdApiKeyId) return
    const res = await api(`/admin/api-keys/${createdApiKeyId}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    createdApiKeyId = null
  })

  test('DELETE /admin/api-keys — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/api-keys/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('CRED_003')
  })
})
