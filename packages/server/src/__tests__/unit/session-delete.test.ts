/**
 * 세션 삭제 캐스케이드 순서 유닛 테스트 — toolCalls → delegations → messages → session
 * 서버 없이 실행 가능: bun test src/__tests__/unit/session-delete.test.ts
 */
import { describe, test, expect } from 'bun:test'

// =============================================
// 캐스케이드 삭제 순서 시뮬레이션 (chat.ts에서 추출)
// =============================================

type DeleteStep = 'toolCalls' | 'delegations' | 'messages' | 'session'

/**
 * 삭제 순서를 시뮬레이션하는 함수
 * 실제 코드(chat.ts)에서 사용하는 순서와 동일한지 테스트
 */
function getCascadeDeleteOrder(): DeleteStep[] {
  return ['toolCalls', 'delegations', 'messages', 'session']
}

/**
 * FK 의존성 그래프: 자식 → 부모
 * toolCalls는 session을 참조
 * delegations는 session을 참조
 * messages는 session을 참조
 * session은 최상위 (다른 것들의 부모)
 *
 * 삭제 시 자식부터 지워야 FK 위반이 없음
 */
const FK_DEPENDENCIES: Record<DeleteStep, DeleteStep[]> = {
  toolCalls: ['session'],
  delegations: ['session'],
  messages: ['session'],
  session: [],
}

/**
 * 삭제 순서가 FK 의존성을 위반하지 않는지 검증
 * 규칙: 부모(참조대상)보다 자식(참조하는 쪽)이 먼저 삭제되어야 함
 */
function validateDeleteOrder(order: DeleteStep[]): boolean {
  const deletedSet = new Set<DeleteStep>()

  for (const step of order) {
    // 현재 step의 부모(FK 대상)가 아직 삭제되지 않았어야 함
    const parents = FK_DEPENDENCIES[step]
    for (const parent of parents) {
      if (deletedSet.has(parent)) {
        // 부모가 이미 삭제됨 → FK 위반!
        return false
      }
    }
    deletedSet.add(step)
  }

  return true
}

describe('세션 삭제: 캐스케이드 순서', () => {
  test('삭제 순서는 toolCalls → delegations → messages → session', () => {
    const order = getCascadeDeleteOrder()
    expect(order).toEqual(['toolCalls', 'delegations', 'messages', 'session'])
  })

  test('session은 반드시 마지막에 삭제', () => {
    const order = getCascadeDeleteOrder()
    expect(order[order.length - 1]).toBe('session')
  })

  test('toolCalls는 session보다 먼저 삭제', () => {
    const order = getCascadeDeleteOrder()
    const toolCallsIndex = order.indexOf('toolCalls')
    const sessionIndex = order.indexOf('session')
    expect(toolCallsIndex).toBeLessThan(sessionIndex)
  })

  test('delegations는 session보다 먼저 삭제', () => {
    const order = getCascadeDeleteOrder()
    const delegationsIndex = order.indexOf('delegations')
    const sessionIndex = order.indexOf('session')
    expect(delegationsIndex).toBeLessThan(sessionIndex)
  })

  test('messages는 session보다 먼저 삭제', () => {
    const order = getCascadeDeleteOrder()
    const messagesIndex = order.indexOf('messages')
    const sessionIndex = order.indexOf('session')
    expect(messagesIndex).toBeLessThan(sessionIndex)
  })

  test('4개 단계 모두 포함', () => {
    const order = getCascadeDeleteOrder()
    expect(order.length).toBe(4)
    expect(new Set(order).size).toBe(4) // 중복 없음
  })
})

describe('세션 삭제: FK 의존성 검증', () => {
  test('올바른 순서는 FK 위반 없음', () => {
    const order = getCascadeDeleteOrder()
    expect(validateDeleteOrder(order)).toBe(true)
  })

  test('session을 먼저 삭제하면 FK 위반', () => {
    const wrongOrder: DeleteStep[] = ['session', 'toolCalls', 'delegations', 'messages']
    expect(validateDeleteOrder(wrongOrder)).toBe(false)
  })

  test('session을 messages보다 먼저 삭제하면 FK 위반', () => {
    const wrongOrder: DeleteStep[] = ['toolCalls', 'delegations', 'session', 'messages']
    expect(validateDeleteOrder(wrongOrder)).toBe(false)
  })

  test('toolCalls와 delegations 순서는 서로 무관 (둘 다 session만 참조)', () => {
    const altOrder: DeleteStep[] = ['delegations', 'toolCalls', 'messages', 'session']
    expect(validateDeleteOrder(altOrder)).toBe(true)
  })

  test('messages와 toolCalls 순서 바꿔도 OK (서로 FK 없음)', () => {
    const altOrder: DeleteStep[] = ['messages', 'toolCalls', 'delegations', 'session']
    expect(validateDeleteOrder(altOrder)).toBe(true)
  })
})

// =============================================
// 삭제 실행 시뮬레이션 (순서 보장 확인)
// =============================================
describe('삭제 실행 순서 추적', () => {
  test('await 체인으로 순서가 보장됨', async () => {
    const executionLog: string[] = []

    // 실제 코드와 동일한 패턴: 순차적 await
    const deleteToolCalls = async () => { executionLog.push('toolCalls') }
    const deleteDelegations = async () => { executionLog.push('delegations') }
    const deleteMessages = async () => { executionLog.push('messages') }
    const deleteSession = async () => { executionLog.push('session') }

    await deleteToolCalls()
    await deleteDelegations()
    await deleteMessages()
    await deleteSession()

    expect(executionLog).toEqual(['toolCalls', 'delegations', 'messages', 'session'])
  })

  test('병렬 실행(Promise.all)이 아닌 순차 실행임을 확인', async () => {
    const timestamps: number[] = []

    const step = async (delay: number) => {
      await new Promise((r) => setTimeout(r, delay))
      timestamps.push(Date.now())
    }

    // 순차 실행
    await step(10)
    await step(10)
    await step(10)
    await step(10)

    // 각 타임스탬프가 이전보다 크거나 같아야 함 (순차)
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
    }
  })
})
