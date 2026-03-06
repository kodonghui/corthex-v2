import { describe, test, expect } from 'bun:test'
import { getNextCronDate } from '../../lib/cron-utils'

/**
 * Story 11-1 TEA: cron-utils 확장 테스트
 * 기존 cron-utils.test.ts (13개)에서 커버하지 않는 영역을 보완합니다.
 */

describe('getNextCronDate — 에러 처리', () => {
  test('필드 수가 5개 미만이면 에러', () => {
    expect(() => getNextCronDate('0 22 * *')).toThrow('Invalid cron expression')
  })

  test('필드 수가 5개 초과이면 에러', () => {
    expect(() => getNextCronDate('0 22 * * * *')).toThrow('Invalid cron expression')
  })

  test('숫자가 아닌 값이면 에러', () => {
    expect(() => getNextCronDate('abc 22 * * *')).toThrow('Invalid cron field value')
  })

  test('범위 필드에 숫자가 아닌 값이면 에러', () => {
    expect(() => getNextCronDate('0 a-b * * *')).toThrow('Invalid cron field value')
  })
})

describe('getNextCronDate — 월 필터링', () => {
  test('특정 월 (0 9 1 6 *) — 3월이면 6월 1일 9시', () => {
    const after = new Date('2026-03-10T10:00:00Z')
    const next = getNextCronDate('0 9 1 6 *', after)
    expect(next.getUTCMonth()).toBe(5) // 6월 (0-indexed)
    expect(next.getUTCDate()).toBe(1)
    expect(next.getUTCHours()).toBe(9)
  })

  test('월 목록 (0 9 1 3,6,9 *) — 3월 2일이면 6월 1일 9시', () => {
    const after = new Date('2026-03-02T10:00:00Z')
    const next = getNextCronDate('0 9 1 3,6,9 *', after)
    // 3월 1일은 이미 지남, 다음은 6월 1일
    expect(next.getUTCMonth()).toBe(5) // 6월
    expect(next.getUTCDate()).toBe(1)
  })
})

describe('getNextCronDate — 경계값', () => {
  test('연도 경계 — 12월 31일 23시이면 내년 1월 1일 0시 (매일 0시)', () => {
    const after = new Date('2026-12-31T23:30:00Z')
    const next = getNextCronDate('0 0 * * *', after)
    expect(next.getUTCFullYear()).toBe(2027)
    expect(next.getUTCMonth()).toBe(0) // 1월
    expect(next.getUTCDate()).toBe(1)
    expect(next.getUTCHours()).toBe(0)
  })

  test('월 경계 — 3월 31일 23시이면 4월 1일 (매일 9시)', () => {
    const after = new Date('2026-03-31T23:00:00Z')
    const next = getNextCronDate('0 9 * * *', after)
    expect(next.getUTCMonth()).toBe(3) // 4월
    expect(next.getUTCDate()).toBe(1)
    expect(next.getUTCHours()).toBe(9)
  })

  test('2월 28일 — 비윤년 2월 28일이면 3월 1일 (매일 9시)', () => {
    const after = new Date('2027-02-28T23:00:00Z') // 2027 비윤년
    const next = getNextCronDate('0 9 * * *', after)
    expect(next.getUTCMonth()).toBe(2) // 3월
    expect(next.getUTCDate()).toBe(1)
  })
})

describe('getNextCronDate — dayOfMonth + dayOfWeek 동시 설정 (OR)', () => {
  // cron 표준: dayOfMonth과 dayOfWeek 모두 *가 아닌 경우 OR 조건
  test('15일 또는 월요일 (0 9 15 * 1) — 3월 6일(금) 이후', () => {
    const after = new Date('2026-03-06T10:00:00Z') // 금요일
    const next = getNextCronDate('0 9 15 * 1', after)
    // 3월 9일 월요일 vs 3월 15일 → 월요일이 먼저
    expect(next.getUTCDate()).toBe(9)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(9)
  })
})

describe('getNextCronDate — 분 필드 변형', () => {
  test('30분 간격 (0,30 * * * *) — 14:10이면 14:30', () => {
    const after = new Date('2026-03-06T14:10:00Z')
    const next = getNextCronDate('0,30 * * * *', after)
    expect(next.getUTCHours()).toBe(14)
    expect(next.getUTCMinutes()).toBe(30)
  })

  test('30분 간격 (0,30 * * * *) — 14:45이면 15:00', () => {
    const after = new Date('2026-03-06T14:45:00Z')
    const next = getNextCronDate('0,30 * * * *', after)
    expect(next.getUTCHours()).toBe(15)
    expect(next.getUTCMinutes()).toBe(0)
  })

  test('분 범위 (15-20 9 * * *) — 9:10이면 9:15', () => {
    const after = new Date('2026-03-06T09:10:00Z')
    const next = getNextCronDate('15-20 9 * * *', after)
    expect(next.getUTCHours()).toBe(9)
    expect(next.getUTCMinutes()).toBe(15)
  })
})

describe('getNextCronDate — 연속 호출 (nextRunAt 갱신 시뮬레이션)', () => {
  test('매일 22시를 3일 연속 계산', () => {
    const first = getNextCronDate('0 22 * * *', new Date('2026-03-06T21:00:00Z'))
    expect(first.getUTCDate()).toBe(6)

    const second = getNextCronDate('0 22 * * *', first)
    expect(second.getUTCDate()).toBe(7)

    const third = getNextCronDate('0 22 * * *', second)
    expect(third.getUTCDate()).toBe(8)
  })

  test('평일 22시를 금→월→화 연속 계산', () => {
    // 금요일 22시 → 다음은 월요일 22시
    const fri = new Date('2026-03-06T22:00:00Z') // 금
    const mon = getNextCronDate('0 22 * * 1-5', fri)
    expect(mon.getUTCDay()).toBe(1) // 월
    expect(mon.getUTCDate()).toBe(9)

    const tue = getNextCronDate('0 22 * * 1-5', mon)
    expect(tue.getUTCDay()).toBe(2) // 화
    expect(tue.getUTCDate()).toBe(10)
  })
})

describe('getNextCronDate — after 미전달 시 기본값', () => {
  test('after 없이 호출하면 현재 시간 이후의 값 반환', () => {
    const now = new Date()
    const next = getNextCronDate('0 0 * * *') // 매일 자정
    expect(next.getTime()).toBeGreaterThan(now.getTime())
  })
})
