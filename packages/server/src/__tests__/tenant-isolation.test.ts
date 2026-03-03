/**
 * E9: 멀티테넌트 격리 테스트
 *
 * 검증 항목:
 * 1. 다른 회사의 데이터에 접근 불가 (companyId 격리)
 * 2. 다른 유저의 데이터에 접근 불가 (userId 격리)
 * 3. Admin이라도 타 회사 데이터 접근 불가
 * 4. 인증 없이 접근 불가
 *
 * 사용법: 서버 실행 후 `bun test src/__tests__/tenant-isolation.test.ts`
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import { sign } from 'hono/jwt'

const BASE = 'http://localhost:3000/api'
const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

// --- 실제 데이터 (Neon DB seed 기준) ---
const REAL_COMPANY_ID = '6ee92cb0-5065-4e48-8149-38f30ad8913e'
const REAL_CEO_ID = '36137766-d4c2-4d30-ae87-313341d735a1'
const REAL_ADMIN_ID = '25235750-3dfe-472a-aadd-1d0310929467'
const REAL_AGENT_ID = 'c3f0e96d-e227-4b44-a723-91f06527e982' // H-비서

// --- 가짜 회사 (존재하지 않는 companyId) ---
const FAKE_COMPANY_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const FAKE_USER_ID = '11111111-2222-3333-4444-555555555555'

// JWT 토큰 생성 헬퍼
async function makeToken(sub: string, companyId: string, role: 'admin' | 'user' = 'user') {
  return sign({ sub, companyId, role, exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET)
}

// fetch 헬퍼
function api(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

let realCeoToken: string
let realAdminToken: string
let fakeUserToken: string
let fakeAdminToken: string

beforeAll(async () => {
  realCeoToken = await makeToken(REAL_CEO_ID, REAL_COMPANY_ID, 'user')
  realAdminToken = await makeToken(REAL_ADMIN_ID, REAL_COMPANY_ID, 'admin')
  fakeUserToken = await makeToken(FAKE_USER_ID, FAKE_COMPANY_ID, 'user')
  fakeAdminToken = await makeToken(FAKE_USER_ID, FAKE_COMPANY_ID, 'admin')
})

// =============================================
// 1. 인증 없이 접근 불가
// =============================================
describe('인증 없이 접근 불가', () => {
  test('토큰 없이 workspace API 호출 시 401', async () => {
    const res = await fetch(`${BASE}/workspace/agents`)
    expect(res.status).toBe(401)
  })

  test('잘못된 토큰으로 호출 시 401', async () => {
    const res = await fetch(`${BASE}/workspace/agents`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    })
    expect(res.status).toBe(401)
  })

  test('토큰 없이 admin API 호출 시 401', async () => {
    const res = await fetch(`${BASE}/admin/agents`)
    expect(res.status).toBe(401)
  })
})

// =============================================
// 2. Workspace API — companyId 격리
// =============================================
describe('Workspace: 가짜 회사 토큰으로 접근 시 빈 데이터', () => {
  test('GET /workspace/agents — 빈 배열', async () => {
    const res = await api('/workspace/agents', fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  test('GET /workspace/agents/:id — 404', async () => {
    const res = await api(`/workspace/agents/${REAL_AGENT_ID}`, fakeUserToken)
    expect(res.status).toBe(404)
  })

  test('GET /workspace/chat/sessions — 빈 배열', async () => {
    const res = await api('/workspace/chat/sessions', fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  test('GET /workspace/reports — 빈 배열', async () => {
    const res = await api('/workspace/reports', fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  test('GET /workspace/jobs — 빈 배열', async () => {
    const res = await api('/workspace/jobs', fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  test('GET /workspace/jobs/notifications — total 0', async () => {
    const res = await api('/workspace/jobs/notifications', fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { total: number } }
    expect(body.data.total).toBe(0)
  })
})

// =============================================
// 3. Workspace: 가짜 회사로 데이터 생성 시도
// =============================================
describe('Workspace: 가짜 회사로 데이터 생성 차단', () => {
  test('POST /workspace/chat/sessions — 타사 에이전트로 세션 생성 시 404', async () => {
    const res = await api('/workspace/chat/sessions', fakeUserToken, {
      method: 'POST',
      body: JSON.stringify({ agentId: REAL_AGENT_ID }),
    })
    expect(res.status).toBe(404)
  })

  test('POST /workspace/jobs — 타사 에이전트로 작업 등록 시 404', async () => {
    const res = await api('/workspace/jobs', fakeUserToken, {
      method: 'POST',
      body: JSON.stringify({ agentId: REAL_AGENT_ID, instruction: '테스트' }),
    })
    expect(res.status).toBe(404)
  })
})

// =============================================
// 4. Admin API — companyId 격리
// =============================================
describe('Admin: 가짜 회사 admin으로 타사 데이터 접근 불가', () => {
  test('GET /admin/agents/:id — 타사 에이전트 조회 시 404', async () => {
    const res = await api(`/admin/agents/${REAL_AGENT_ID}`, fakeAdminToken)
    expect(res.status).toBe(404)
  })

  test('GET /admin/users/:id — 타사 유저 조회 시 404', async () => {
    const res = await api(`/admin/users/${REAL_CEO_ID}`, fakeAdminToken)
    expect(res.status).toBe(404)
  })

  test('PATCH /admin/agents/:id — 타사 에이전트 수정 시 404', async () => {
    const res = await api(`/admin/agents/${REAL_AGENT_ID}`, fakeAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'HACKED' }),
    })
    expect(res.status).toBe(404)
  })

  test('PATCH /admin/users/:id — 타사 유저 수정 시 404', async () => {
    const res = await api(`/admin/users/${REAL_CEO_ID}`, fakeAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ name: 'HACKED' }),
    })
    expect(res.status).toBe(404)
  })

  test('DELETE /admin/agents/:id — 타사 에이전트 삭제 시 404', async () => {
    const res = await api(`/admin/agents/${REAL_AGENT_ID}`, fakeAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
  })

  test('DELETE /admin/users/:id — 타사 유저 삭제 시 404', async () => {
    const res = await api(`/admin/users/${REAL_CEO_ID}`, fakeAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
  })
})

// =============================================
// 5. Admin 권한 없이 admin API 접근 불가
// =============================================
describe('Admin: 일반 유저는 admin API 접근 불가', () => {
  test('GET /admin/agents — user 역할로 호출 시 403', async () => {
    const res = await api('/admin/agents', realCeoToken) // CEO는 role='user'
    expect(res.status).toBe(403)
  })

  test('GET /admin/users — user 역할로 호출 시 403', async () => {
    const res = await api('/admin/users', realCeoToken)
    expect(res.status).toBe(403)
  })
})

// =============================================
// 6. 정상 접근 확인 (양성 테스트)
// =============================================
describe('정상 접근: 올바른 토큰으로 데이터 조회', () => {
  test('GET /workspace/agents — 실제 CEO 토큰으로 에이전트 목록 조회', async () => {
    const res = await api('/workspace/agents', realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /workspace/agents/:id — 실제 에이전트 상세 조회', async () => {
    const res = await api(`/workspace/agents/${REAL_AGENT_ID}`, realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_AGENT_ID)
  })

  test('GET /admin/agents — 실제 admin 토큰으로 에이전트 조회', async () => {
    const res = await api('/admin/agents', realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /admin/agents/:id — 실제 admin으로 같은 회사 에이전트 조회', async () => {
    const res = await api(`/admin/agents/${REAL_AGENT_ID}`, realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_AGENT_ID)
  })

  test('GET /admin/users/:id — 실제 admin으로 같은 회사 유저 조회', async () => {
    const res = await api(`/admin/users/${REAL_CEO_ID}`, realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBe(REAL_CEO_ID)
  })
})
