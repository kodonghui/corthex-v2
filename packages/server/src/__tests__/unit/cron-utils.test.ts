import { describe, expect, test } from 'bun:test'
import { parseCron, getNextRunAt } from '../../lib/cron-utils'

describe('parseCron', () => {
  test('유효한 5필드 cron 식 → true', () => {
    expect(parseCron('0 2 * * *')).toBe(true)    // 매일 02:00
    expect(parseCron('30 9 * * 1')).toBe(true)    // 매주 월요일 09:30
    expect(parseCron('*/5 * * * *')).toBe(true)   // 5분마다
    expect(parseCron('0 0 1 * *')).toBe(true)     // 매월 1일 00:00
  })

  test('프리셋 지원 → true', () => {
    expect(parseCron('@daily')).toBe(true)
    expect(parseCron('@weekly')).toBe(true)
    expect(parseCron('@hourly')).toBe(true)
  })

  test('유효하지 않은 cron 식 → false', () => {
    expect(parseCron('invalid')).toBe(false)
    expect(parseCron('')).toBe(false)
    expect(parseCron('60 * * * *')).toBe(false)   // 분: 0-59
    expect(parseCron('abc def ghi')).toBe(false)   // 의미없는 문자열
  })
})

describe('getNextRunAt', () => {
  test('다음 실행 시간 반환 → Date 객체', () => {
    const from = new Date('2026-03-05T00:00:00Z')
    const next = getNextRunAt('0 2 * * *', from)
    expect(next).toBeInstanceOf(Date)
    expect(next!.getUTCHours()).toBe(2)
    expect(next!.getUTCMinutes()).toBe(0)
  })

  test('from 없으면 현재 시간 기준', () => {
    const next = getNextRunAt('0 2 * * *')
    expect(next).toBeInstanceOf(Date)
    expect(next!.getTime()).toBeGreaterThan(Date.now())
  })

  test('유효하지 않은 cron → null', () => {
    expect(getNextRunAt('invalid')).toBeNull()
    expect(getNextRunAt('')).toBeNull()
  })

  test('@daily 프리셋 → 다음 날 00:00', () => {
    const from = new Date('2026-03-05T12:00:00Z')
    const next = getNextRunAt('@daily', from)
    expect(next).toBeInstanceOf(Date)
    expect(next!.getTime()).toBeGreaterThan(from.getTime())
  })
})
