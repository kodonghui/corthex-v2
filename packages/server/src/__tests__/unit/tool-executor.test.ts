/**
 * 도구 실행 엔진 유닛 테스트 — 타임아웃, duration 추적, 상태값, 핸들러 라우팅
 * 서버 없이 실행 가능: bun test src/__tests__/unit/tool-executor.test.ts
 */
import { describe, test, expect } from 'bun:test'

// =============================================
// 타임아웃 상수 (tool-executor.ts에서 추출)
// =============================================
const TOOL_TIMEOUT_MS = 30_000

describe('도구 타임아웃 설정', () => {
  test('타임아웃은 30초(30000ms)', () => {
    expect(TOOL_TIMEOUT_MS).toBe(30_000)
  })
})

// =============================================
// 타임아웃 판별 로직 (tool-executor.ts에서 추출)
// =============================================
function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && err.message === 'TOOL_TIMEOUT'
}

function getToolStatus(err: unknown): 'timeout' | 'error' {
  return isTimeoutError(err) ? 'timeout' : 'error'
}

function getErrorMessage(err: unknown): string {
  const isTimeout = isTimeoutError(err)
  if (isTimeout) return '도구 응답 시간이 초과되었습니다 (30초)'
  return err instanceof Error ? err.message : '도구 실행 실패'
}

describe('타임아웃 에러 판별', () => {
  test('TOOL_TIMEOUT 메시지 → timeout', () => {
    const err = new Error('TOOL_TIMEOUT')
    expect(isTimeoutError(err)).toBe(true)
    expect(getToolStatus(err)).toBe('timeout')
  })

  test('다른 에러 메시지 → error', () => {
    const err = new Error('네트워크 오류')
    expect(isTimeoutError(err)).toBe(false)
    expect(getToolStatus(err)).toBe('error')
  })

  test('Error가 아닌 객체 → error', () => {
    expect(isTimeoutError('string error')).toBe(false)
    expect(getToolStatus('string error')).toBe('error')
  })

  test('null → error', () => {
    expect(isTimeoutError(null)).toBe(false)
    expect(getToolStatus(null)).toBe('error')
  })
})

describe('에러 메시지 생성', () => {
  test('타임아웃 → 한국어 타임아웃 메시지', () => {
    const err = new Error('TOOL_TIMEOUT')
    expect(getErrorMessage(err)).toBe('도구 응답 시간이 초과되었습니다 (30초)')
  })

  test('일반 에러 → 에러 메시지 그대로', () => {
    const err = new Error('API 키가 유효하지 않습니다')
    expect(getErrorMessage(err)).toBe('API 키가 유효하지 않습니다')
  })

  test('비-Error 객체 → 기본 메시지', () => {
    expect(getErrorMessage('unknown')).toBe('도구 실행 실패')
    expect(getErrorMessage(42)).toBe('도구 실행 실패')
    expect(getErrorMessage(null)).toBe('도구 실행 실패')
  })
})

// =============================================
// 도구 상태 값 (status values)
// =============================================
describe('도구 호출 상태 값', () => {
  const validStatuses = ['success', 'error', 'timeout'] as const

  test('유효한 상태는 3가지: success, error, timeout', () => {
    expect(validStatuses).toContain('success')
    expect(validStatuses).toContain('error')
    expect(validStatuses).toContain('timeout')
    expect(validStatuses.length).toBe(3)
  })
})

// =============================================
// Duration 추적 로직 (tool-executor.ts에서 추출)
// =============================================
describe('duration 추적', () => {
  test('시작/종료 시간 차이로 duration 계산', () => {
    const startTime = 1000
    const endTime = 1500
    const durationMs = endTime - startTime
    expect(durationMs).toBe(500)
  })

  test('duration은 0 이상', () => {
    const startTime = Date.now()
    const endTime = Date.now()
    expect(endTime - startTime).toBeGreaterThanOrEqual(0)
  })
})

// =============================================
// MAX_TOOL_ROUNDS (ai.ts에서 추출)
// =============================================
const MAX_TOOL_ROUNDS = 5

describe('도구 루프 최대 반복 횟수', () => {
  test('MAX_TOOL_ROUNDS는 5', () => {
    expect(MAX_TOOL_ROUNDS).toBe(5)
  })

  test('라운드 카운터가 MAX_TOOL_ROUNDS에 도달하면 루프 종료', () => {
    let executedRounds = 0
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      executedRounds++
    }
    expect(executedRounds).toBe(5)
  })

  test('라운드 카운터가 MAX_TOOL_ROUNDS 미만이면 계속 실행', () => {
    const round = 3
    expect(round < MAX_TOOL_ROUNDS).toBe(true)
  })

  test('라운드 카운터가 MAX_TOOL_ROUNDS이면 실행 안 함', () => {
    const round = 5
    expect(round < MAX_TOOL_ROUNDS).toBe(false)
  })
})

// =============================================
// Promise.race 타임아웃 패턴 테스트
// =============================================
describe('Promise.race 타임아웃 패턴', () => {
  test('빠른 작업이 타임아웃 전에 완료되면 결과 반환', async () => {
    const fastTask = Promise.resolve('완료')
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TOOL_TIMEOUT')), 1000),
    )
    const result = await Promise.race([fastTask, timeout])
    expect(result).toBe('완료')
  })

  test('작업이 타임아웃보다 느리면 TOOL_TIMEOUT 에러', async () => {
    const slowTask = new Promise((resolve) => setTimeout(resolve, 500))
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TOOL_TIMEOUT')), 50),
    )
    try {
      await Promise.race([slowTask, timeout])
      expect(true).toBe(false) // 여기 도달하면 안 됨
    } catch (err) {
      expect(isTimeoutError(err)).toBe(true)
    }
  })
})

// =============================================
// 핸들러 라우팅 로직 (tool-executor.ts에서 추출)
// =============================================
function handleCalculate(input: Record<string, unknown>): string {
  const expression = String(input.expression || '')
  if (!expression) return '수식이 비어있습니다.'

  if (!/^[\d\s+\-*/().,%^]+$/.test(expression)) {
    return '허용되지 않는 문자가 포함되어 있습니다.'
  }

  try {
    const sanitized = expression.replace(/\^/g, '**')
    const result = new Function(`return (${sanitized})`)()
    return JSON.stringify({ expression, result: Number(result) })
  } catch {
    return `계산 오류: '${expression}'을(를) 처리할 수 없습니다.`
  }
}

describe('calculate 핸들러', () => {
  test('덧셈: 1+2 = 3', () => {
    const result = JSON.parse(handleCalculate({ expression: '1+2' }))
    expect(result.result).toBe(3)
  })

  test('복합 연산: (10+5)*2 = 30', () => {
    const result = JSON.parse(handleCalculate({ expression: '(10+5)*2' }))
    expect(result.result).toBe(30)
  })

  test('거듭제곱: 2^3 = 8', () => {
    const result = JSON.parse(handleCalculate({ expression: '2^3' }))
    expect(result.result).toBe(8)
  })

  test('빈 수식 → 에러 메시지', () => {
    expect(handleCalculate({ expression: '' })).toBe('수식이 비어있습니다.')
    expect(handleCalculate({})).toBe('수식이 비어있습니다.')
  })

  test('위험한 문자열 차단', () => {
    expect(handleCalculate({ expression: 'process.exit()' })).toBe(
      '허용되지 않는 문자가 포함되어 있습니다.',
    )
  })

  test('알파벳 포함 수식 차단', () => {
    expect(handleCalculate({ expression: 'eval("1+1")' })).toBe(
      '허용되지 않는 문자가 포함되어 있습니다.',
    )
  })
})

// =============================================
// 현재 시간 핸들러 (tool-executor.ts에서 추출)
// =============================================
function handleGetCurrentTime(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return JSON.stringify({
    utc: now.toISOString(),
    kst: kst.toISOString().replace('T', ' ').slice(0, 19) + ' KST',
    date: kst.toISOString().slice(0, 10),
    dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][kst.getUTCDay()] + '요일',
  })
}

describe('get_current_time 핸들러', () => {
  test('JSON 형식 반환', () => {
    const result = JSON.parse(handleGetCurrentTime())
    expect(result).toHaveProperty('utc')
    expect(result).toHaveProperty('kst')
    expect(result).toHaveProperty('date')
    expect(result).toHaveProperty('dayOfWeek')
  })

  test('KST는 "KST" 접미사 포함', () => {
    const result = JSON.parse(handleGetCurrentTime())
    expect(result.kst).toMatch(/KST$/)
  })

  test('날짜 형식은 YYYY-MM-DD', () => {
    const result = JSON.parse(handleGetCurrentTime())
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('요일은 한국어 요일 형식', () => {
    const result = JSON.parse(handleGetCurrentTime())
    expect(result.dayOfWeek).toMatch(/^[일월화수목금토]요일$/)
  })
})

// =============================================
// 미구현 핸들러 기본 응답
// =============================================
function routeHandler(handler: string): string {
  switch (handler) {
    case 'get_current_time':
    case 'calculate':
    case 'search_department_knowledge':
    case 'get_company_info':
    case 'search_web':
      return 'handled'
    default:
      return `도구 '${handler}' 의 핸들러가 아직 구현되지 않았습니다.`
  }
}

describe('핸들러 라우팅 — 미구현 도구', () => {
  test('알려진 핸들러 → handled', () => {
    expect(routeHandler('get_current_time')).toBe('handled')
    expect(routeHandler('calculate')).toBe('handled')
    expect(routeHandler('search_web')).toBe('handled')
  })

  test('미구현 핸들러 → 안내 메시지', () => {
    expect(routeHandler('unknown_tool')).toBe(
      "도구 'unknown_tool' 의 핸들러가 아직 구현되지 않았습니다.",
    )
  })
})
