/**
 * Epic 5 QA: 작전일지 start/end 이벤트 매칭 로직 검증
 * ops-log.tsx에서 사용되는 mergedLogs 알고리즘을 추출하여 테스트
 * bun test src/__tests__/unit/activity-log-merge.test.ts
 */
import { describe, test, expect } from 'bun:test'

type ActivityLog = {
  id: string
  eventId: string
  type: string
  phase: string
  action: string
  createdAt: string
}

type MergedLog = ActivityLog & {
  endLog?: ActivityLog
  durationMs?: number
}

/**
 * ops-log.tsx의 mergedLogs 로직을 추출한 순수 함수
 */
function mergeLogs(allLogs: ActivityLog[]): MergedLog[] {
  const endByEvent = new Map<string, ActivityLog>()
  const merged = new Set<string>()

  for (const log of allLogs) {
    if ((log.phase === 'end' || log.phase === 'error') && log.eventId) {
      endByEvent.set(log.eventId, log)
    }
  }

  const result: MergedLog[] = []

  for (const log of allLogs) {
    if (merged.has(log.id)) continue

    if (log.phase === 'start' && log.eventId) {
      const endLog = endByEvent.get(log.eventId)
      if (endLog) {
        const diff = new Date(endLog.createdAt).getTime() - new Date(log.createdAt).getTime()
        if (diff < 3000) {
          merged.add(endLog.id)
          result.push({ ...log, endLog, durationMs: diff })
          continue
        }
      }
    }

    result.push(log)
  }

  return result
}

function makeLog(id: string, eventId: string, phase: string, createdAt: string): ActivityLog {
  return { id, eventId, type: 'tool_call', phase, action: 'test', createdAt }
}

describe('start/end 이벤트 매칭', () => {
  test('간격 < 3초인 start/end 쌍은 하나로 합침', () => {
    const logs = [
      makeLog('1', 'evt-1', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-1', 'end', '2026-03-05T10:00:02.000Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(1)
    expect(result[0].endLog).toBeDefined()
    expect(result[0].durationMs).toBe(2000)
  })

  test('간격 >= 3초인 start/end 쌍은 별도 카드', () => {
    const logs = [
      makeLog('1', 'evt-2', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-2', 'end', '2026-03-05T10:00:05.000Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(2)
    expect(result[0].endLog).toBeUndefined()
  })

  test('eventId 없는 로그는 합치지 않음', () => {
    const logs = [
      makeLog('1', '', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', '', 'end', '2026-03-05T10:00:01.000Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(2)
  })

  test('error phase도 end로 취급하여 매칭', () => {
    const logs = [
      makeLog('1', 'evt-3', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-3', 'error', '2026-03-05T10:00:01.500Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(1)
    expect(result[0].endLog?.phase).toBe('error')
    expect(result[0].durationMs).toBe(1500)
  })

  test('여러 이벤트 쌍 동시 처리', () => {
    const logs = [
      makeLog('1', 'evt-a', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-b', 'start', '2026-03-05T10:00:01.000Z'),
      makeLog('3', 'evt-a', 'end', '2026-03-05T10:00:01.500Z'),
      makeLog('4', 'evt-b', 'end', '2026-03-05T10:00:02.000Z'),
    ]
    const result = mergeLogs(logs)
    // evt-a: 1.5초 → 합침, evt-b: 1초 → 합침
    expect(result).toHaveLength(2)
    expect(result[0].durationMs).toBe(1500) // evt-a
    expect(result[1].durationMs).toBe(1000) // evt-b
  })

  test('end 없는 start는 그대로 유지 (진행 중)', () => {
    const logs = [
      makeLog('1', 'evt-x', 'start', '2026-03-05T10:00:00.000Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(1)
    expect(result[0].endLog).toBeUndefined()
    expect(result[0].durationMs).toBeUndefined()
  })

  test('정확히 3초 경계값 → 별도 카드 (3000ms는 합치지 않음)', () => {
    const logs = [
      makeLog('1', 'evt-edge', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-edge', 'end', '2026-03-05T10:00:03.000Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(2) // 3000ms >= 3000 → 별도
  })

  test('2999ms 경계값 → 합침', () => {
    const logs = [
      makeLog('1', 'evt-edge2', 'start', '2026-03-05T10:00:00.000Z'),
      makeLog('2', 'evt-edge2', 'end', '2026-03-05T10:00:02.999Z'),
    ]
    const result = mergeLogs(logs)
    expect(result).toHaveLength(1)
    expect(result[0].durationMs).toBe(2999)
  })
})

describe('날짜 그룹 함수', () => {
  function getDateGroup(dateStr: string): string {
    const d = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const logDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (logDate.getTime() === today.getTime()) return '오늘'
    if (logDate.getTime() === yesterday.getTime()) return '어제'
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  test('오늘 날짜 → "오늘"', () => {
    const now = new Date().toISOString()
    expect(getDateGroup(now)).toBe('오늘')
  })

  test('어제 날짜 → "어제"', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(getDateGroup(yesterday)).toBe('어제')
  })

  test('이틀 전 → 날짜 형식', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000)
    const result = getDateGroup(twoDaysAgo.toISOString())
    expect(result).not.toBe('오늘')
    expect(result).not.toBe('어제')
    // 한국어 날짜 형식 (예: "3월 3일")
    expect(result).toContain('월')
  })
})

describe('필터 URL 동기화 로직', () => {
  test('빈 필터 → 빈 Set', () => {
    const param: string | null = null
    const filters = param ? new Set(param.split(',')) : new Set<string>()
    expect(filters.size).toBe(0)
  })

  test('단일 필터 → Set에 1개', () => {
    const param = 'chat'
    const filters = new Set(param.split(','))
    expect(filters.size).toBe(1)
    expect(filters.has('chat')).toBe(true)
  })

  test('복수 필터 → Set에 N개', () => {
    const param = 'chat,delegation,tool_call'
    const filters = new Set(param.split(','))
    expect(filters.size).toBe(3)
    expect(filters.has('delegation')).toBe(true)
  })

  test('토글로 필터 추가/제거', () => {
    const filters = new Set(['chat', 'delegation'])

    // 추가
    const next1 = new Set(filters)
    next1.add('error')
    expect(next1.size).toBe(3)

    // 제거
    const next2 = new Set(filters)
    next2.delete('chat')
    expect(next2.size).toBe(1)
    expect(next2.has('delegation')).toBe(true)
  })

  test('Set → URL 파라미터 변환', () => {
    const filters = new Set(['chat', 'tool_call'])
    const param = Array.from(filters).join(',')
    expect(param).toContain('chat')
    expect(param).toContain('tool_call')
  })
})
