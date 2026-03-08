import { describe, test, expect, beforeAll } from 'bun:test'
import { api, createTestTokens } from '../helpers/test-utils'

let tokens: Awaited<ReturnType<typeof createTestTokens>>

beforeAll(async () => {
  tokens = await createTestTokens()
})

describe('Workflow CRUD API (Story 18-1)', () => {
  let createdWorkflowId: string
  const validSteps = [{ id: crypto.randomUUID(), type: 'tool', action: 'real_web_search' }]

  test('POST /workspace/workflows - 정상 생성 (201)', async () => {
    const res = await api('/workspace/workflows', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Workflow',
        description: 'Testing 18-1',
        steps: validSteps
      })
    })
    expect(res.status).toBe(201)
    const body: any = await res.json()
    expect(body.data.id).toBeDefined()
    createdWorkflowId = body.data.id
  })

  test('GET /workspace/workflows - 목록 조회 (생성된 항목 포함)', async () => {
    const res = await api('/workspace/workflows', tokens.realCeoToken)
    expect(res.status).toBe(200)
    const body: any = await res.json()
    const found = body.data.find((w: any) => w.id === createdWorkflowId)
    expect(found).toBeDefined()
    expect(found.name).toBe('Test Workflow')
  })

  // 엣지 케이스 1: 다른 회사의 워크플로우에 접근 (테넌트 격리)
  test('Negative: 타사(Fake) 테넌트가 다른 회사의 워크플로우 단건 조회/수정/삭제 시 404 반환', async () => {
    const getRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.fakeUserToken)
    expect(getRes.status).toBe(404)

    const putRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.fakeUserToken, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacked' })
    })
    expect(putRes.status).toBe(404) // Or 403, but our logic returns 404 if not found in same company

    const delRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.fakeUserToken, {
      method: 'DELETE'
    })
    expect(delRes.status).toBe(404)
  })

  test('Negative: 일반 직원(employee)이 생성/수정/삭제 시 403 반환', async () => {
    const postRes = await api('/workspace/workflows', tokens.realEmployeeToken, {
      method: 'POST',
      body: JSON.stringify({ name: 'Employee WF', steps: validSteps })
    })
    expect(postRes.status).toBe(403)

    const putRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.realEmployeeToken, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Employee Update' })
    })
    expect(putRes.status).toBe(403)
  })

  // 엣지 케이스 2: 스텝 수 20개 초과
  test('Negative: 단계가 20개를 초과하는 경우 400 에러 및 유효성 검사 메시지 반환', async () => {
    const tooManySteps = Array.from({ length: 21 }, () => ({
      id: crypto.randomUUID(), type: 'tool', action: 'real_web_search'
    }))

    const res = await api('/workspace/workflows', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Too many steps',
        steps: tooManySteps
      })
    })
    expect(res.status).toBe(400)
    const body: any = await res.json()
    expect(body.error).toBeDefined()
    // Zod validator error structure indicates issues in 'steps' array length
  })

  // 엣지 케이스 3: 필수 필드 누락
  test('Negative: 스텝 배열에 필수 필드(type, action) 누락 시 Zod 400 에러 포맷 검증', async () => {
    const res = await api('/workspace/workflows', tokens.realCeoToken, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Step WF',
        steps: [{ id: crypto.randomUUID() }] // type, action missing
      })
    })
    expect(res.status).toBe(400)
    const body: any = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBeDefined()
  })

  // 엣지 케이스 4: 존재하지 않는 UUID 조회/수정/삭제
  test('Negative: 존재하지 않는 UUID로 PUT/DELETE 요청 시 404 반환', async () => {
    const fakeUuid = crypto.randomUUID()
    const putRes = await api(`/workspace/workflows/${fakeUuid}`, tokens.realCeoToken, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Doesn\'t Exist' })
    })
    expect(putRes.status).toBe(404)

    const delRes = await api(`/workspace/workflows/${fakeUuid}`, tokens.realCeoToken, {
      method: 'DELETE'
    })
    expect(delRes.status).toBe(404)
  })

  // 엣지 케이스 5: Soft delete 확인
  test('Soft-delete 기능 검증: 삭제 요청 후 목록 조회 시 노출되지 않음', async () => {
    // 삭제 요청
    const delRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.realCeoToken, {
      method: 'DELETE'
    })
    expect(delRes.status).toBe(200)

    // 단건 조회 시 404 반환
    const getRes = await api(`/workspace/workflows/${createdWorkflowId}`, tokens.realCeoToken)
    expect(getRes.status).toBe(404)

    // 목록 조회 시 제외됨
    const listRes = await api('/workspace/workflows', tokens.realCeoToken)
    const body: any = await listRes.json()
    const found = body.data.find((w: any) => w.id === createdWorkflowId)
    expect(found).toBeUndefined()
  })

  // 실행 엔드포인트 검증 (Story 18-2)
  describe('POST /workspace/workflows/:id/execute', () => {
    let activeWorkflowId: string

    beforeAll(async () => {
      // 실행 테스트를 위한 새 워크플로우 생성
      const res = await api('/workspace/workflows', tokens.realCeoToken, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Execution Test Workflow',
          description: 'Testing Execute 18-2',
          steps: [
            { id: 'step_1', type: 'tool', action: 'get_current_time' },
            { id: 'step_2', type: 'tool', action: 'real_web_search', dependsOn: ['step_1'] }
          ]
        })
      })
      const body: any = await res.json()
      activeWorkflowId = body.data.id
    })

    test('정상 워크플로우 실행 요청 시 200 반환 (Execution Record 생성)', async () => {
      const res = await api(`/workspace/workflows/${activeWorkflowId}/execute`, tokens.realCeoToken, {
        method: 'POST'
      })
      expect(res.status).toBe(200)
      const body: any = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.id).toBeDefined()
      expect(body.data.status).toBe('running')
    })

    test('Negative: 권한 없는 사용자(employee)가 실행 요청 시 403 반환', async () => {
      const res = await api(`/workspace/workflows/${activeWorkflowId}/execute`, tokens.realEmployeeToken, {
        method: 'POST'
      })
      expect(res.status).toBe(403)
    })

    test('Negative: 타사(Fake) 테넌트가 실행 요청 시 404 반환', async () => {
      const res = await api(`/workspace/workflows/${activeWorkflowId}/execute`, tokens.fakeAdminToken, {
        method: 'POST'
      })
      expect(res.status).toBe(404)
    })

    test('Negative: 존재하지 않는 워크플로우 실행 요청 시 404 반환', async () => {
      const fakeUuid = crypto.randomUUID()
      const res = await api(`/workspace/workflows/${fakeUuid}/execute`, tokens.realCeoToken, {
        method: 'POST'
      })
      expect(res.status).toBe(404)
    })
  })
})
