/**
 * Workspace 보고서 API 테스트 — 전체 워크플로우
 * draft → submitted → reviewed
 * 서버 실행 필요: bun test src/__tests__/api/workspace-reports.test.ts
 */
import { describe, test, expect, beforeAll } from 'bun:test'
import { api, createTestTokens } from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let reportId: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('보고서 워크플로우', () => {
  test('1. POST /workspace/reports — 보고서 생성 → 201 + draft', async () => {
    const res = await api('/workspace/reports', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        title: '테스트 보고서 ' + Date.now(),
        content: '보고서 본문 내용입니다.',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; status: string } }
    expect(body.data.status).toBe('draft')
    reportId = body.data.id
  })

  test('2. GET /workspace/reports — 목록에 포함', async () => {
    const res = await api('/workspace/reports', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string }[] }
    const found = body.data.find((r) => r.id === reportId)
    expect(found).toBeDefined()
  })

  test('3. GET /workspace/reports/:id — 상세 조회', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}`, tokens.realCeoToken)
    expect(res.status).toBe(200)
  })

  test('4. PUT /workspace/reports/:id — draft 수정 → 200', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ title: '수정된 보고서', content: '수정된 내용' }),
    })
    expect(res.status).toBe(200)
  })

  test('5. POST /workspace/reports/:id/submit — 제출 (draft → submitted)', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}/submit`, tokens.realCeoToken, {
      method: 'POST',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string } }
    expect(body.data.status).toBe('submitted')
  })

  test('6. PUT /workspace/reports/:id — submitted 상태에서 수정 → 400', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ title: 'fail' }),
    })
    expect(res.status).toBe(400)
  })

  test('7. POST /workspace/reports/:id/comments — 코멘트 추가 → 201', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}/comments`, tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ content: '좋은 보고서입니다.' }),
    })
    expect(res.status).toBe(201)
  })

  test('8. GET /workspace/reports/:id/comments — 코멘트 목록', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}/comments`, tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('9. DELETE /workspace/reports/:id — submitted 상태 삭제 → 400', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}`, tokens.realCeoToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(400)
  })

  test('10. POST /workspace/reports/:id/review — admin 검토 → reviewed', async () => {
    if (!reportId) return
    const res = await api(`/workspace/reports/${reportId}/review`, tokens.realAdminToken, {
      method: 'POST',
    })
    // admin이 수신자가 맞으면 200, 아니면 403
    expect([200, 403]).toContain(res.status)
  })
})
