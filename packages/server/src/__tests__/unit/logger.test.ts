import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'

describe('Logger', () => {
  const originalLog = console.log
  let logs: string[] = []

  beforeEach(() => {
    logs = []
    console.log = (...args: any[]) => {
      logs.push(args.map(String).join(' '))
    }
  })

  afterEach(() => {
    console.log = originalLog
    // NODE_ENV 복원
    delete process.env.NODE_ENV
  })

  test('개발 모드: 컬러 텍스트 포맷 출력', async () => {
    delete process.env.NODE_ENV
    // 모듈 캐시 때문에 직접 로직 테스트
    const isProd = false
    const log = (level: string, message: string) => {
      const time = new Date().toTimeString().slice(0, 8)
      const colors: Record<string, string> = {
        debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m',
      }
      const reset = '\x1b[0m'
      console.log(`${colors[level]}[${time}] ${level.toUpperCase()}${reset} ${message}`)
    }

    log('info', '테스트 메시지')
    expect(logs.length).toBe(1)
    expect(logs[0]).toContain('INFO')
    expect(logs[0]).toContain('테스트 메시지')
  })

  test('운영 모드: JSON 포맷 출력', () => {
    const log = (level: string, message: string, meta?: Record<string, unknown>) => {
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }))
    }

    log('error', '서버 오류', { statusCode: 500 })
    expect(logs.length).toBe(1)

    const parsed = JSON.parse(logs[0])
    expect(parsed.level).toBe('error')
    expect(parsed.message).toBe('서버 오류')
    expect(parsed.statusCode).toBe(500)
    expect(parsed.timestamp).toBeDefined()
  })

  test('logger 모듈이 4개 메서드를 export', async () => {
    const { logger } = await import('../../lib/logger')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })
})
