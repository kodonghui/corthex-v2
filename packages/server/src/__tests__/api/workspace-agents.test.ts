/**
 * Workspace 에이전트 API 테스트
 * 서버 실행 필요: bun test src/__tests__/api/workspace-agents.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, createTestTokens, REAL_AGENT_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('GET /workspace/agents', () => {
  test('자사 에이전트 목록 조회 → 200', async () => {
    const res = await api('/workspace/agents', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string }[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('가짜 회사 토큰 → 빈 배열', async () => {
    const res = await api('/workspace/agents', tokens.fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })
})

describe('GET /workspace/agents/:id', () => {
  test('자사 에이전트 상세 조회 → 200 + soul 포함', async () => {
    const res = await api(`/workspace/agents/${REAL_AGENT_ID}`, tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string; soul: string | null } }
    expect(body.data.id).toBe(REAL_AGENT_ID)
  })

  test('타사 에이전트 조회 → 404', async () => {
    const res = await api(`/workspace/agents/${REAL_AGENT_ID}`, tokens.fakeUserToken)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /workspace/agents/:id/soul', () => {
  test('admin으로 soul 업데이트 → 200', async () => {
    const res = await api(`/workspace/agents/${REAL_AGENT_ID}/soul`, tokens.realAdminToken, {
      method: 'PATCH',
      body: JSON.stringify({ soul: '테스트 소울 업데이트 ' + Date.now() }),
    })
    expect(res.status).toBe(200)
  })
})
