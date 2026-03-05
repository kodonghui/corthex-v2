/**
 * Admin Report Lines 통합 테스트 — 보고 라인 벌크 업서트 + 순환 감지
 * 서버 실행 필요: bun test src/__tests__/api/admin-report-lines.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import {
  api, createTestTokens, REAL_COMPANY_ID, REAL_CEO_ID,
} from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

// 테스트용 유저 2명 생성 (보고 라인 설정용)
let userA: string | null = null
let userB: string | null = null

beforeAll(async () => {
  tokens = await createTestTokens()

  // 보고 라인 테스트에 필요한 유저 2명 생성
  const resA = await api('/admin/users', tokens.realAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      companyId: REAL_COMPANY_ID,
      username: 'rpt_test_a_' + Date.now(),
      password: 'test123456',
      name: '보고테스트A',
    }),
  })
  if (resA.status === 201) {
    const body = await resA.json() as { data: { id: string } }
    userA = body.data.id
  }

  const resB = await api('/admin/users', tokens.realAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      companyId: REAL_COMPANY_ID,
      username: 'rpt_test_b_' + Date.now(),
      password: 'test123456',
      name: '보고테스트B',
    }),
  })
  if (resB.status === 201) {
    const body = await resB.json() as { data: { id: string } }
    userB = body.data.id
  }
})

afterAll(async () => {
  // 보고 라인 정리 (빈 배열로 업서트)
  await api('/admin/report-lines', tokens.realAdminToken, {
    method: 'PUT',
    body: JSON.stringify({ companyId: REAL_COMPANY_ID, lines: [] }),
  })
  // 테스트 유저 정리
  if (userA) await api(`/admin/users/${userA}`, tokens.realAdminToken, { method: 'DELETE' })
  if (userB) await api(`/admin/users/${userB}`, tokens.realAdminToken, { method: 'DELETE' })
})

describe('Admin: 보고 라인', () => {
  test('GET /admin/report-lines — companyId 없음 → 400', async () => {
    const res = await api('/admin/report-lines', tokens.realAdminToken)
    expect(res.status).toBe(400)
  })

  test('GET /admin/report-lines?companyId=xxx → 200', async () => {
    const res = await api(`/admin/report-lines?companyId=${REAL_COMPANY_ID}`, tokens.realAdminToken)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('PUT /admin/report-lines — 정상 보고 라인 저장 → 200', async () => {
    if (!userA || !userB) return
    const res = await api('/admin/report-lines', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        lines: [
          { userId: userA, reportsToUserId: REAL_CEO_ID },
          { userId: userB, reportsToUserId: REAL_CEO_ID },
        ],
      }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBe(2)
  })

  test('PUT /admin/report-lines — 자기 참조 → 400 + REPORT_LINE_002', async () => {
    if (!userA) return
    const res = await api('/admin/report-lines', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        lines: [{ userId: userA, reportsToUserId: userA }],
      }),
    })
    expect(res.status).toBe(400)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('REPORT_LINE_002')
  })

  test('PUT /admin/report-lines — 순환 참조 (A→B→A) → 400 + REPORT_LINE_003', async () => {
    if (!userA || !userB) return
    const res = await api('/admin/report-lines', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({
        companyId: REAL_COMPANY_ID,
        lines: [
          { userId: userA, reportsToUserId: userB },
          { userId: userB, reportsToUserId: userA },
        ],
      }),
    })
    expect(res.status).toBe(400)
    const body = await res.json() as { error: { code: string } }
    expect(body.error.code).toBe('REPORT_LINE_003')
  })

  test('PUT /admin/report-lines — 빈 배열 (전체 삭제) → 200', async () => {
    const res = await api('/admin/report-lines', tokens.realAdminToken, {
      method: 'PUT',
      body: JSON.stringify({ companyId: REAL_COMPANY_ID, lines: [] }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { data: unknown[] }
    expect(body.data.length).toBe(0)
  })

  test('user 역할로 보고 라인 조회 → 403', async () => {
    const res = await api(`/admin/report-lines?companyId=${REAL_COMPANY_ID}`, tokens.realCeoToken)
    expect(res.status).toBe(403)
  })
})
