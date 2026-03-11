import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('세션 Rate Limiter (NFR-SC1)', () => {
  test('세션 제한 미만에서 acquireSession 성공', async () => {
    const { acquireSession, releaseSession } = await import('../../middleware/rate-limiter')
    const result = acquireSession('test-session-1')
    expect(result).toBe(true)
    releaseSession('test-session-1')
  })

  test('같은 세션 ID는 중복 acquire 허용', async () => {
    const { acquireSession, releaseSession } = await import('../../middleware/rate-limiter')
    acquireSession('test-dup-1')
    const result = acquireSession('test-dup-1')
    expect(result).toBe(true)
    releaseSession('test-dup-1')
  })

  test('releaseSession 후 카운트 감소', async () => {
    const { acquireSession, releaseSession, getActiveSessionCount } = await import('../../middleware/rate-limiter')
    const before = getActiveSessionCount()
    acquireSession('test-release-1')
    expect(getActiveSessionCount()).toBe(before + 1)
    releaseSession('test-release-1')
    expect(getActiveSessionCount()).toBe(before)
  })

  test('getActiveSessionCount() 정확한 카운트 반환', async () => {
    const { acquireSession, releaseSession, getActiveSessionCount } = await import('../../middleware/rate-limiter')
    const base = getActiveSessionCount()
    acquireSession('test-count-a')
    acquireSession('test-count-b')
    expect(getActiveSessionCount()).toBe(base + 2)
    releaseSession('test-count-a')
    releaseSession('test-count-b')
  })

  test('sessionLimiter 미들웨어가 export됨', async () => {
    const { sessionLimiter } = await import('../../middleware/rate-limiter')
    expect(typeof sessionLimiter).toBe('function')
  })
})

describe('TEA P0: 세션 제한 초과 시 거부', () => {
  test('MAX 도달 후 새 세션 acquire 실패', async () => {
    const { acquireSession, releaseSession, getActiveSessionCount } = await import('../../middleware/rate-limiter')
    const base = getActiveSessionCount()
    // MAX_CONCURRENT_SESSIONS 기본값 20 — base부터 20까지 채우기
    const ids: string[] = []
    for (let i = 0; i < 20 - base; i++) {
      const id = `tea-limit-${i}`
      ids.push(id)
      acquireSession(id)
    }
    // 21번째 세션은 거부
    const result = acquireSession('tea-overflow')
    expect(result).toBe(false)
    // 정리
    for (const id of ids) releaseSession(id)
    releaseSession('tea-overflow')
  })
})

describe('TEA P1: ERROR_CODES 연동', () => {
  test('SESSION_LIMIT_EXCEEDED 코드 사용', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../middleware/rate-limiter.ts'), 'utf8'
    )
    expect(source).toContain('ERROR_CODES.SESSION_LIMIT_EXCEEDED')
    expect(source).toContain("import { ERROR_CODES } from '../lib/error-codes'")
  })
})

describe('TEA P1: 환경변수 설정 소스 확인', () => {
  test('MAX_CONCURRENT_SESSIONS 환경변수 + 기본값 20', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../middleware/rate-limiter.ts'), 'utf8'
    )
    expect(source).toContain('MAX_CONCURRENT_SESSIONS')
    expect(source).toContain("'20'")
  })
})
