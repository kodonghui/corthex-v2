/**
 * Admin Tools & Agent-Tool 매핑 통합 테스트
 * 서버 실행 필요: bun test src/__tests__/api/admin-tools.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import {
  api, createTestTokens, REAL_COMPANY_ID, REAL_AGENT_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let createdToolId: string | null = null
let createdMappingId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

afterAll(async () => {
  if (createdMappingId) {
    await api(`/admin/agent-tools/${createdMappingId}`, tokens.realAdminToken, { method: 'DELETE' })
  }
  // tool은 hard delete API가 없으므로 남겨둠
})

// =============================================
// Tool Definitions
// =============================================
describe('Admin: 도구 정의 CRUD', () => {
  test('GET /admin/tools — 전체 목록 조회 → 200', async () => {
    const res = await api('/admin/tools', tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /admin/tools?companyId=xxx — 회사별 필터 → 200', async () => {
    const res = await api(`/admin/tools?companyId=${REAL_COMPANY_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
  })

  test('POST /admin/tools — 도구 생성 → 201', async () => {
    const res = await api('/admin/tools', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        name: '테스트도구_' + Date.now(),
        description: '자동 테스트 도구',
        scope: 'company',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; name: string; scope: string } }
    expect(body.data.id).toBeDefined()
    expect(body.data.scope).toBe('company')
    createdToolId = body.data.id
  })

  test('POST /admin/tools — 이름 없음 → 400', async () => {
    const res = await api('/admin/tools', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ scope: 'platform' }),
    })
    expect(res.status).toBe(400)
  })

  test('user 역할로 도구 목록 → 403', async () => {
    const res = await api('/admin/tools', tokens.realCeoToken)
    expect(res.status).toBe(403)
  })
})

// =============================================
// Agent-Tool Mapping
// =============================================
describe('Admin: 에이전트-도구 매핑', () => {
  test('GET /admin/agent-tools — agentId 없음 → 400', async () => {
    const res = await api('/admin/agent-tools', tokens.realAdminToken)
    expect(res.status).toBe(400)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('TOOL_001')
  })

  test('GET /admin/agent-tools?agentId=xxx — 목록 조회 → 200', async () => {
    const res = await api(`/admin/agent-tools?agentId=${REAL_AGENT_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('POST /admin/agent-tools — 도구 할당 → 201', async () => {
    if (!createdToolId) return
    const res = await api('/admin/agent-tools', tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        agentId: REAL_AGENT_ID,
        toolId: createdToolId,
        isEnabled: true,
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; isEnabled: boolean } }
    expect(body.data.id).toBeDefined()
    expect(body.data.isEnabled).toBe(true)
    createdMappingId = body.data.id
  })

  test('PATCH /admin/agent-tools/:id — 토글 off → 200', async () => {
    if (!createdMappingId) return
    const res = await api(`/admin/agent-tools/${createdMappingId}`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled: false }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { isEnabled: boolean } }
    expect(body.data.isEnabled).toBe(false)
  })

  test('PATCH /admin/agent-tools — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/agent-tools/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled: true }),
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('TOOL_002')
  })

  test('DELETE /admin/agent-tools/:id — 매핑 삭제 → 200', async () => {
    if (!createdMappingId) return
    const res = await api(`/admin/agent-tools/${createdMappingId}`, tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
    createdMappingId = null
  })

  test('DELETE /admin/agent-tools — 존재하지 않는 ID → 404', async () => {
    const res = await api('/admin/agent-tools/00000000-0000-0000-0000-000000000000', tokens.realAdminToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(404)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('TOOL_002')
  })
})
