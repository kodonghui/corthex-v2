/**
 * Workspace SNS API 테스트 — 전체 워크플로우
 * draft → pending → approved/rejected → published
 * 서버 실행 필요: bun test src/__tests__/api/workspace-sns.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { api, createTestTokens } from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>
let snsId: string | null = null
let snsIdForReject: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()
})

afterAll(async () => {
  // 정리: draft 상태인 것만 삭제 가능
  // 테스트 중 상태 변경되므로 에러 무시
  if (snsId) await api(`/workspace/sns/${snsId}`, tokens.realCeoToken, { method: 'DELETE' }).catch(() => {})
  if (snsIdForReject) await api(`/workspace/sns/${snsIdForReject}`, tokens.realCeoToken, { method: 'DELETE' }).catch(() => {})
})

describe('SNS 워크플로우: 승인 경로', () => {
  test('1. POST /workspace/sns — 콘텐츠 생성 → 201 + draft', async () => {
    const res = await api('/workspace/sns', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        platform: 'instagram',
        title: '테스트 SNS ' + Date.now(),
        body: '테스트 본문 내용입니다.',
        hashtags: '#테스트 #자동화',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { data: { id: string; status: string } }
    expect(body.data.status).toBe('draft')
    snsId = body.data.id
  })

  test('2. GET /workspace/sns — 목록에 포함', async () => {
    const res = await api('/workspace/sns', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string }[] }
    const found = body.data.find((item) => item.id === snsId)
    expect(found).toBeDefined()
  })

  test('3. GET /workspace/sns/:id — 상세 조회', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}`, tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { id: string; title: string; body: string } }
    expect(body.data.id).toBe(snsId)
    expect(body.data.body).toBeDefined()
  })

  test('4. PUT /workspace/sns/:id — draft 수정 → 200', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ title: '수정된 제목' }),
    })
    expect(res.status).toBe(200)
  })

  test('5. POST /workspace/sns/:id/submit — 승인 요청 (draft → pending)', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}/submit`, tokens.realCeoToken, {
      method: 'POST',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string } }
    expect(body.data.status).toBe('pending')
  })

  test('6. PUT /workspace/sns/:id — pending 상태에서 수정 → 400', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ title: 'fail' }),
    })
    expect(res.status).toBe(400)
  })

  test('7. POST /workspace/sns/:id/approve — user(비admin) 승인 시도 → 403', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}/approve`, tokens.realCeoToken, {
      method: 'POST',
    })
    expect(res.status).toBe(403)
  })

  test('8. POST /workspace/sns/:id/approve — admin 승인 → approved', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}/approve`, tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string } }
    expect(body.data.status).toBe('approved')
  })

  test('9. POST /workspace/sns/:id/approve — 이미 승인 → 400', async () => {
    if (!snsId) return
    const res = await api(`/workspace/sns/${snsId}/approve`, tokens.realAdminToken, {
      method: 'POST',
    })
    expect(res.status).toBe(400)
  })
})

describe('SNS 워크플로우: 반려 경로', () => {
  test('1. 반려용 콘텐츠 생성 + 승인 요청', async () => {
    // 생성
    const createRes = await api('/workspace/sns', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        platform: 'tistory',
        title: '반려 테스트 ' + Date.now(),
        body: '반려될 콘텐츠',
      }),
    })
    const created = await createRes.json() as { data: { id: string } }
    snsIdForReject = created.data.id

    // 승인 요청
    await api(`/workspace/sns/${snsIdForReject}/submit`, tokens.realCeoToken, { method: 'POST' })
  })

  test('2. POST /workspace/sns/:id/reject — admin 반려 + 사유', async () => {
    if (!snsIdForReject) return
    const res = await api(`/workspace/sns/${snsIdForReject}/reject`, tokens.realAdminToken, {
      method: 'POST',
      body: JSON.stringify({ reason: '내용 보완 필요' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string; rejectReason: string } }
    expect(body.data.status).toBe('rejected')
    expect(body.data.rejectReason).toBe('내용 보완 필요')
  })

  test('3. PUT /workspace/sns/:id — rejected 상태에서 수정 가능 → draft로 복귀', async () => {
    if (!snsIdForReject) return
    const res = await api(`/workspace/sns/${snsIdForReject}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ title: '보완된 제목' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { status: string } }
    expect(body.data.status).toBe('draft')
  })
})

describe('SNS 검증', () => {
  test('POST /workspace/sns — platform 없음 → 400', async () => {
    const res = await api('/workspace/sns', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({ title: 'no platform', body: 'test' }),
    })
    expect(res.status).toBe(400)
  })

  test('DELETE /workspace/sns/:id — draft만 삭제 가능', async () => {
    // 새 draft 생성 후 삭제
    const createRes = await api('/workspace/sns', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        platform: 'instagram',
        title: '삭제용 ' + Date.now(),
        body: '삭제 테스트',
      }),
    })
    const created = await createRes.json() as { data: { id: string } }

    const res = await api(`/workspace/sns/${created.data.id}`, tokens.realCeoToken, {
      method: 'DELETE',
    })
    expect(res.status).toBe(200)
  })
})
