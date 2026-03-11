import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('엔진 에러 코드 레지스트리 (D3)', () => {
  test('모든 코드가 도메인 프리픽스로 시작', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes')
    const validPrefixes = ['AUTH_', 'AGENT_', 'SESSION_', 'HANDOFF_', 'TOOL_', 'RATE_', 'HOOK_', 'SERVER_', 'ORG_']

    for (const [key, value] of Object.entries(ERROR_CODES)) {
      const hasPrefix = validPrefixes.some(p => value.startsWith(p))
      expect(hasPrefix).toBe(true)
    }
  })

  test('값 중복 없음', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes')
    const values = Object.values(ERROR_CODES)
    expect(new Set(values).size).toBe(values.length)
  })

  test('as const — 키 13개 이상 존재', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes')
    expect(Object.keys(ERROR_CODES).length).toBeGreaterThanOrEqual(13)
  })

  test('ErrorCode 타입이 export됨', async () => {
    const mod = await import('../../lib/error-codes')
    expect(mod.ERROR_CODES).toBeDefined()
    // ErrorCode는 타입이므로 런타임 검증 불가 — ERROR_CODES의 존재로 대체
  })
})

describe('TEA P0: shared ERROR_CODES와 값 충돌 없음', () => {
  test('엔진 코드 값이 shared 한국어 메시지와 겹치지 않음', async () => {
    const { ERROR_CODES: engineCodes } = await import('../../lib/error-codes')
    const { ERROR_CODES: sharedCodes } = await import('@corthex/shared')
    const sharedValues = new Set(Object.values(sharedCodes))
    for (const value of Object.values(engineCodes)) {
      expect(sharedValues.has(value as string)).toBe(false)
    }
  })
})

describe('TEA P1: 모든 값이 UPPER_SNAKE_CASE', () => {
  test('값에 소문자/공백/특수문자 없음', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes')
    const upperSnakeRegex = /^[A-Z][A-Z0-9_]+$/
    for (const value of Object.values(ERROR_CODES)) {
      expect(upperSnakeRegex.test(value)).toBe(true)
    }
  })
})

describe('TEA P1: as const 소스 확인', () => {
  test('error-codes.ts에 as const 선언 포함', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../lib/error-codes.ts'), 'utf8'
    )
    expect(source).toContain('as const')
    expect(source).toContain('ErrorCode')
  })
})
