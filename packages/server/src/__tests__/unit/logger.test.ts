import { describe, test, expect } from 'bun:test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('구조화 로거 어댑터 (D9)', () => {
  test('createLogger() 반환 객체에 info, warn, error, child 메서드 존재', async () => {
    const { createLogger } = await import('../../db/logger')
    const log = createLogger()

    expect(typeof log.info).toBe('function')
    expect(typeof log.warn).toBe('function')
    expect(typeof log.error).toBe('function')
    expect(typeof log.child).toBe('function')
  })

  test('createSessionLogger() child logger에 컨텍스트 바인딩', async () => {
    const { createSessionLogger } = await import('../../db/logger')
    const sessionLog = createSessionLogger({
      sessionId: 'sess-test-123',
      companyId: 'comp-test-456',
      agentId: 'agent-test-789',
    })

    // child logger도 동일한 인터페이스
    expect(typeof sessionLog.info).toBe('function')
    expect(typeof sessionLog.warn).toBe('function')
    expect(typeof sessionLog.error).toBe('function')
    expect(typeof sessionLog.child).toBe('function')
  })

  test('Logger 인터페이스가 export됨 — pino 구현 세부사항 미노출', async () => {
    const mod = await import('../../db/logger')
    expect(mod.createLogger).toBeDefined()
    expect(mod.createSessionLogger).toBeDefined()
    // rootLogger는 내부 전용 — 외부에 노출되지 않아야 함
    expect((mod as Record<string, unknown>).rootLogger).toBeUndefined()
  })
})

describe('TEA P1: LOG_LEVEL 환경변수 지원', () => {
  test('logger.ts에 LOG_LEVEL 환경변수 설정 포함', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../db/logger.ts'), 'utf8'
    )
    expect(source).toContain("process.env.LOG_LEVEL")
    expect(source).toContain("'info'")
  })
})

describe('TEA P0: 레거시 lib/logger.ts 삭제 확인', () => {
  test('lib/logger.ts가 존재하지 않음 (dead code 제거)', () => {
    const deadPath = join(import.meta.dir, '../../lib/logger.ts')
    expect(existsSync(deadPath)).toBe(false)
  })
})

describe('TEA P1: pino ISO 타임스탬프 설정', () => {
  test('logger.ts에 isoTime 타임스탬프 설정 포함', () => {
    const source = readFileSync(
      join(import.meta.dir, '../../db/logger.ts'), 'utf8'
    )
    expect(source).toContain('isoTime')
    expect(source).toContain('pino.stdTimeFunctions')
  })
})
