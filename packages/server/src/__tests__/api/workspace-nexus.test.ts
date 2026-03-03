/**
 * Workspace NEXUS API 테스트 — 조직도 + 레이아웃
 * 서버 실행 필요: bun test src/__tests__/api/workspace-nexus.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, createTestTokens, REAL_AGENT_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('NEXUS org-data', () => {
  test('GET /workspace/nexus/org-data → 200 + company + departments', async () => {
    const res = await api('/workspace/nexus/org-data', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { company: unknown; departments: unknown[] } }
    expect(body.data.company).toBeDefined()
    expect(Array.isArray(body.data.departments)).toBe(true)
  })

  test('GET /workspace/nexus/org-data — 가짜 회사 토큰 → 빈 데이터', async () => {
    const res = await api('/workspace/nexus/org-data', tokens.fakeUserToken)
    // 회사가 없으면 null 또는 에러
    expect([200, 404]).toContain(res.status)
  })
})

describe('NEXUS layout', () => {
  test('GET /workspace/nexus/layout → 200 (저장된 레이아웃 또는 null)', async () => {
    const res = await api('/workspace/nexus/layout', tokens.realCeoToken)
    expect(res.status).toBe(200)
  })

  test('PUT /workspace/nexus/layout — admin 저장 → 200/201', async () => {
    const res = await api('/workspace/nexus/layout', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({
        nodes: { 'node-1': { x: 100, y: 200 }, 'node-2': { x: 300, y: 400 } },
        viewport: { x: 0, y: 0, zoom: 1 },
      }),
    })
    expect([200, 201]).toContain(res.status)
  })

  test('PUT /workspace/nexus/layout — user(비admin) → 403', async () => {
    const res = await api('/workspace/nexus/layout', tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ nodes: {} }),
    })
    expect(res.status).toBe(403)
  })

  test('PUT /workspace/nexus/layout — 재저장(upsert) 작동 확인', async () => {
    const res = await api('/workspace/nexus/layout', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({
        nodes: { 'updated-node': { x: 500, y: 600 } },
      }),
    })
    expect([200, 201]).toContain(res.status)
  })
})

describe('NEXUS agent 부서 이동', () => {
  test('PATCH /workspace/nexus/agent/:id/department — admin → 200', async () => {
    const res = await api(`/workspace/nexus/agent/${REAL_AGENT_ID}/department`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ departmentId: null }),
    })
    expect(res.status).toBe(200)
  })

  test('PATCH /workspace/nexus/agent/:id/department — user → 403', async () => {
    const res = await api(`/workspace/nexus/agent/${REAL_AGENT_ID}/department`, tokens.realCeoToken, {
      method: 'PATCH',
      body: JSON.stringify({ departmentId: null }),
    })
    expect(res.status).toBe(403)
  })
})
