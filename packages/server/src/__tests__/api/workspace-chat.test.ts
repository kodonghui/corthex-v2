/**
 * Workspace 채팅 API 테스트
 * 서버 실행 필요: bun test src/__tests__/api/workspace-chat.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import {
  api, createTestTokens, REAL_AGENT_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let createdSessionId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('채팅 세션', () => {
  test('POST /workspace/chat/sessions — 세션 생성 → 201', async () => {
    const res = await api('/workspace/chat/sessions', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({ agentId: REAL_AGENT_ID, title: '테스트 세션' }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string } }
    expect(body.data.id).toBeDefined()
    createdSessionId = body.data.id
  })

  test('POST /workspace/chat/sessions — 타사 에이전트 → 404', async () => {
    const res = await api('/workspace/chat/sessions', tokens.fakeUserToken, {
      method: 'POST',
      body: JSON.stringify({ agentId: REAL_AGENT_ID }),
    })
    expect(res.status).toBe(404)
  })

  test('GET /workspace/chat/sessions — 세션 목록 조회', async () => {
    const res = await api('/workspace/chat/sessions', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /workspace/chat/sessions/:id/messages — 메시지 목록 조회', async () => {
    if (!createdSessionId) return
    const res = await api(`/workspace/chat/sessions/${createdSessionId}/messages`, tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /workspace/chat/sessions — 타사 토큰 → 빈 배열', async () => {
    const res = await api('/workspace/chat/sessions', tokens.fakeUserToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  test('POST /workspace/chat/sessions — agentId 없음 → 400', async () => {
    const res = await api('/workspace/chat/sessions', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })
})
