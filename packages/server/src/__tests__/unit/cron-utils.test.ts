import { describe, test, expect } from 'bun:test'
import { getNextCronDate } from '../../lib/cron-utils'

// 서버는 UTC에서 동작. 모든 테스트를 UTC 기준으로 작성.
// 참고: 2026-03-06 금요일 (UTC)

describe('getNextCronDate', () => {
  // 매일 22시 (0 22 * * *)
  test('매일 22시 — 현재 21시면 오늘 22시', () => {
    const after = new Date('2026-03-06T21:00:00Z')
    const next = getNextCronDate('0 22 * * *', after)
    expect(next.getUTCHours()).toBe(22)
    expect(next.getUTCMinutes()).toBe(0)
    expect(next.getUTCDate()).toBe(6)
  })

  test('매일 22시 — 현재 23시면 내일 22시', () => {
    const after = new Date('2026-03-06T23:00:00Z')
    const next = getNextCronDate('0 22 * * *', after)
    expect(next.getUTCHours()).toBe(22)
    expect(next.getUTCMinutes()).toBe(0)
    expect(next.getUTCDate()).toBe(7)
  })

  // 평일만 (0 22 * * 1-5)
  test('평일 22시 — 금요일 23시면 월요일 22시', () => {
    const after = new Date('2026-03-06T23:00:00Z') // 금요일 23시 UTC
    const next = getNextCronDate('0 22 * * 1-5', after)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(22)
    expect(next.getUTCDate()).toBe(9)
  })

  test('평일 22시 — 토요일이면 월요일 22시', () => {
    const after = new Date('2026-03-07T10:00:00Z') // 토요일
    const next = getNextCronDate('0 22 * * 1-5', after)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(22)
  })

  test('평일 22시 — 일요일이면 월요일 22시', () => {
    const after = new Date('2026-03-08T10:00:00Z') // 일요일
    const next = getNextCronDate('0 22 * * 1-5', after)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(22)
  })

  // 특정 요일 (0 9 * * 1,3,5) — 월/수/금 9시
  test('월수금 9시 — 월요일 10시면 수요일 9시', () => {
    const after = new Date('2026-03-09T10:00:00Z') // 월요일 10시
    const next = getNextCronDate('0 9 * * 1,3,5', after)
    expect(next.getUTCDay()).toBe(3) // 수요일
    expect(next.getUTCHours()).toBe(9)
    expect(next.getUTCDate()).toBe(11)
  })

  test('월수금 9시 — 금요일 10시면 다음주 월요일 9시', () => {
    const after = new Date('2026-03-13T10:00:00Z') // 금요일 10시
    const next = getNextCronDate('0 9 * * 1,3,5', after)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(9)
    expect(next.getUTCDate()).toBe(16)
  })

  // 매 시간 (0 * * * *)
  test('매 시간 정각 — 14:30이면 15:00', () => {
    const after = new Date('2026-03-06T14:30:00Z')
    const next = getNextCronDate('0 * * * *', after)
    expect(next.getUTCHours()).toBe(15)
    expect(next.getUTCMinutes()).toBe(0)
  })

  // 와일드카드 전체 (* * * * *) — 매분
  test('매분 — 다음 분', () => {
    const after = new Date('2026-03-06T14:30:00Z')
    const next = getNextCronDate('* * * * *', after)
    expect(next.getUTCMinutes()).toBe(31)
  })

  // 이미 정확한 시간인 경우 — 다음 발동
  test('정확히 22:00이면 다음날 22:00', () => {
    const after = new Date('2026-03-06T22:00:00Z')
    const next = getNextCronDate('0 22 * * *', after)
    expect(next.getUTCDate()).toBe(7)
    expect(next.getUTCHours()).toBe(22)
  })

  // 특정 일자 (0 9 15 * *) — 매월 15일 9시
  test('매월 15일 9시 — 3월 10일이면 3월 15일 9시', () => {
    const after = new Date('2026-03-10T10:00:00Z')
    const next = getNextCronDate('0 9 15 * *', after)
    expect(next.getUTCDate()).toBe(15)
    expect(next.getUTCHours()).toBe(9)
    expect(next.getUTCMonth()).toBe(2) // 3월 (0-indexed)
  })

  // 범위 시간 (0 9-17 * * *) — 매시간 9~17시
  test('9~17시 정각 — 현재 12:30이면 13:00', () => {
    const after = new Date('2026-03-06T12:30:00Z')
    const next = getNextCronDate('0 9-17 * * *', after)
    expect(next.getUTCHours()).toBe(13)
    expect(next.getUTCMinutes()).toBe(0)
  })

  test('9~17시 정각 — 현재 18시면 내일 9시', () => {
    const after = new Date('2026-03-06T18:00:00Z')
    const next = getNextCronDate('0 9-17 * * *', after)
    expect(next.getUTCDate()).toBe(7)
    expect(next.getUTCHours()).toBe(9)
  })
})
