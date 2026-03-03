/**
 * Admin CRUD 통합 테스트 — 부서, 에이전트, 유저
 * 서버 실행 필요: bun test src/__tests__/api/admin-crud.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import {
  api, createTestTokens, REAL_COMPANY_ID, REAL_AGENT_ID, REAL_CEO_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

// 생성한 리소스 ID (정리용)
let createdDeptId: string | null = null
let createdAgentId: string | null = null
let createdUserId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

afterAll(async () => {
  // 생성한 리소스 정리
  if (createdAgentId) {
    await api(`/admin/agents/${createdAgentId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
  if (createdUserId) {
    await api(`/admin/users/${createdUserId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
  if (createdDeptId) {
    await api(`/admin/departments/${createdDeptId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
})

// =============================================
// 부서 CRUD
// =============================================
describe('Admin: 부서 CRUD', () => {
  test('POST /admin/departments — 부서 생성 → 201', async () => {
    const res = await api('/admin/departments', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        name: '테스트부서_' + Date.now(),
        description: '자동 테스트용 부서',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; name: string } }
    expect(body.data.id).toBeDefined()
    createdDeptId = body.data.id
  })

  test('GET /admin/departments — 목록 조회', async () => {
    const res = await api('/admin/departments', tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('PATCH /admin/departments/:id — 이름 수정 → 200', async () => {
    if (!createdDeptId) return
    const res = await api(`/admin/departments/${createdDeptId}`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: '수정된부서' }),
    })
    expect(res.status).toBe(200)
  })

  test('PATCH /admin/departments — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/departments/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'x' }),
    })
    expect(res.status).toBe(404)
  })

  test('POST /admin/departments — 이름 없음 → 400', async () => {
    const res = await api('/admin/departments', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ companyId: REAL_COMPANY_ID }),
    })
    expect(res.status).toBe(400)
  })

  test('user 역할로 부서 생성 → 403', async () => {
    const res = await api('/admin/departments', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({ companyId: REAL_COMPANY_ID, name: 'fail' }),
    })
    expect(res.status).toBe(403)
  })
})

// =============================================
// 에이전트 CRUD
// =============================================
describe('Admin: 에이전트 CRUD', () => {
  test('GET /admin/agents — 목록 조회', async () => {
    const res = await api('/admin/agents', tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /admin/agents/:id — 상세 조회', async () => {
    const res = await api(`/admin/agents/${REAL_AGENT_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_AGENT_ID)
  })

  test('POST /admin/agents — 에이전트 생성 → 201', async () => {
    const res = await api('/admin/agents', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        userId: REAL_CEO_ID,
        name: '테스트에이전트_' + Date.now(),
        role: '테스트 역할',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBeDefined()
    createdAgentId = body.data.id
  })

  test('PATCH /admin/agents/:id — 이름 수정 → 200', async () => {
    if (!createdAgentId) return
    const res = await api(`/admin/agents/${createdAgentId}`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: '수정된에이전트' }),
    })
    expect(res.status).toBe(200)
  })

  test('GET /admin/agents/:id — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/agents/00000000-0000-0000-0000-000000000000', tokens.realAdminToken)
    expect(res.status).toBe(404)
  })

  test('POST /admin/agents — 이름 없음 → 400', async () => {
    const res = await api('/admin/agents', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ companyId: REAL_COMPANY_ID, userId: REAL_CEO_ID }),
    })
    expect(res.status).toBe(400)
  })
})

// =============================================
// 유저 CRUD
// =============================================
describe('Admin: 유저 CRUD', () => {
  const testUsername = 'test_user_' + Date.now()

  test('GET /admin/users — 목록 조회', async () => {
    const res = await api('/admin/users', tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /admin/users/:id — 상세 조회', async () => {
    const res = await api(`/admin/users/${REAL_CEO_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_CEO_ID)
  })

  test('POST /admin/users — 유저 생성 → 201', async () => {
    const res = await api('/admin/users', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        username: testUsername,
        password: 'test123456',
        name: '테스트유저',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBeDefined()
    createdUserId = body.data.id
  })

  test('POST /admin/users — 중복 username → 409', async () => {
    const res = await api('/admin/users', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        username: testUsername,
        password: 'test123456',
        name: '중복유저',
      }),
    })
    expect(res.status).toBe(409)
  })

  test('PATCH /admin/users/:id — 이름 수정 → 200', async () => {
    if (!createdUserId) return
    const res = await api(`/admin/users/${createdUserId}`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: '수정된유저' }),
    })
    expect(res.status).toBe(200)
  })

  test('POST /admin/users — 비밀번호 너무 짧음 → 400', async () => {
    const res = await api('/admin/users', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        username: 'short_pw_test',
        password: '12',
        name: 'x',
      }),
    })
    expect(res.status).toBe(400)
  })
})
