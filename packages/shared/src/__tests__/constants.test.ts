/**
 * constants.ts 유닛 테스트 — 에러 코드 구조 검증
 * 서버 없이 실행 가능: bun test src/__tests__/constants.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { ERROR_CODES } from '../constants'

describe('ERROR_CODES', () => {
  test('모든 에러 prefix가 존재', () => {
    const keys = Object.keys(ERROR_CODES)
    const prefixes = ['AUTH_', 'TENANT_', 'AGENT_', 'QUEUE_', 'SNS_', 'DASH_', 'TELEGRAM_', 'MSG_', 'NEXUS_']

    for (const prefix of prefixes) {
      const found = keys.some((k) => k.startsWith(prefix))
      expect(found).toBe(true)
    }
  })

  test('모든 값이 비어있지 않은 문자열', () => {
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  test('키 개수가 10개 이상', () => {
    expect(Object.keys(ERROR_CODES).length).toBeGreaterThanOrEqual(10)
  })

  test('키 중복 없음 (Object.keys 특성상 자동 보장, 형식 확인)', () => {
    const keys = Object.keys(ERROR_CODES)
    const uniqueKeys = new Set(keys)
    expect(keys.length).toBe(uniqueKeys.size)
  })
})
