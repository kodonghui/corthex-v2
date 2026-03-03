/**
 * Workspace 야간작업 API 테스트
 * 서버 실행 필요: bun test src/__tests__/api/workspace-jobs.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, createTestTokens, REAL_AGENT_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let createdJobId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('야간작업 큐', () => {
  test('POST /workspace/jobs — 작업 등록 → 201', async () => {
    const res = await api('/workspace/jobs', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        agentId: REAL_AGENT_ID,
        instruction: '테스트 야간 작업 ' + Date.now(),
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; status: string } }
    expect(body.data.status).toBe('queued')
    createdJobId = body.data.id
  })

  test('POST /workspace/jobs — 타사 에이전트 → 404', async () => {
    const res = await api('/workspace/jobs', tokens.fakeUserToken, {
      method: 'POST',
      body: JSON.stringify({
        agentId: REAL_AGENT_ID,
        instruction: '테스트',
      }),
    })
    expect(res.status).toBe(404)
  })

  test('GET /workspace/jobs — 목록 조회', async () => {
    const res = await api('/workspace/jobs', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /workspace/jobs/notifications — 알림 조회', async () => {
    const res = await api('/workspace/jobs/notifications', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { total: number } }
    expect(typeof body.data.total).toBe('number')
  })

  test('PUT /workspace/jobs/:id/read — 읽음 표시 → 200', async () => {
    if (!createdJobId) return
    const res = await api(`/workspace/jobs/${createdJobId}/read`, tokens.realCeoToken, {
      method: 'PUT',
    })
    expect(res.status).toBe(200)
  })

  test('PUT /workspace/jobs/read-all — 전체 읽음 → 200', async () => {
    const res = await api('/workspace/jobs/read-all', tokens.realCeoToken, {
      method: 'PUT',
    })
    expect(res.status).toBe(200)
  })

  test('DELETE /workspace/jobs/:id — 대기 중인 작업 취소 → 200', async () => {
    // 새로운 작업 등록 후 즉시 취소
    const createRes = await api('/workspace/jobs', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        agentId: REAL_AGENT_ID,
        instruction: '취소할 작업 ' + Date.now(),
      }),
    })
    const created = await createRes.json() as { data: { id: string } }

    const res = await api(`/workspace/jobs/${created.data.id}`, tokens.realCeoToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
  })
})
