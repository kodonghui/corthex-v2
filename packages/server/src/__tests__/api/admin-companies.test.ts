/**
 * Admin Companies CRUD 통합 테스트
 * 서버 실행 필요: bun test src/__tests__/api/admin-companies.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { api, createTestTokens, REAL_COMPANY_ID } from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let createdCompanyId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

afterAll(async () => {
  if (createdCompanyId) {
    // 직원이 없으므로 삭제 가능
    await api(`/admin/companies/${createdCompanyId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
})

describe('Admin: 회사 CRUD', () => {
  const testSlug = 'test-co-' + Date.now()

  test('GET /admin/companies — 목록 조회 → 200', async () => {
    const res = await api('/admin/companies', tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /admin/companies/:id — 상세 조회 → 200', async () => {
    const res = await api(`/admin/companies/${REAL_COMPANY_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_COMPANY_ID)
  })

  test('GET /admin/companies/:id — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/companies/00000000-0000-0000-0000-000000000000', tokens.realAdminToken)
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('COMPANY_001')
  })

  test('POST /admin/companies — 회사 생성 → 201', async () => {
    const res = await api('/admin/companies', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ name: '테스트회사', slug: testSlug }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; name: string; slug: string } }
    expect(body.data.id).toBeDefined()
    expect(body.data.name).toBe('테스트회사')
    expect(body.data.slug).toBe(testSlug)
    createdCompanyId = body.data.id
  })

  test('POST /admin/companies — slug 형식 오류 (대문자) → 400', async () => {
    const res = await api('/admin/companies', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ name: 'Fail', slug: 'INVALID_SLUG' }),
    })
    expect(res.status).toBe(400)
  })

  test('POST /admin/companies — 이름 없음 → 400', async () => {
    const res = await api('/admin/companies', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ slug: 'valid-slug' }),
    })
    expect(res.status).toBe(400)
  })

  test('PATCH /admin/companies/:id — 이름 수정 → 200', async () => {
    if (!createdCompanyId) return
    const res = await api(`/admin/companies/${createdCompanyId}`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: '수정된회사' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { name: string } }
    expect(body.data.name).toBe('수정된회사')
  })

  test('PATCH /admin/companies — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/companies/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'x' }),
    })
    expect(res.status).toBe(404)
  })

  test('DELETE /admin/companies/:id — 직원 있는 회사 삭제 → 409', async () => {
    // REAL_COMPANY_ID에는 직원이 있으므로 삭제 불가
    const res = await api(`/admin/companies/${REAL_COMPANY_ID}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(409)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('COMPANY_002')
  })

  test('DELETE /admin/companies/:id — 직원 없는 회사 삭제 → 200', async () => {
    if (!createdCompanyId) return
    const res = await api(`/admin/companies/${createdCompanyId}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    createdCompanyId = null // 이미 삭제됨
  })

  test('user 역할로 회사 목록 → 403', async () => {
    const res = await api('/admin/companies', tokens.realCeoToken)
    expect(res.status).toBe(403)
  })
})
