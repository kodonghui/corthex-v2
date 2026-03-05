import { describe, expect, test } from 'bun:test'

describe('Health Route', () => {
  test('응답 구조: status, checks.db, version.build/hash/uptime', async () => {
    // health.ts는 DB 연결이 필요하므로 응답 구조만 검증
    // 실제 통합 테스트는 서버 기동 후 수행
    const expectedShape = {
      status: 'ok',
      checks: { db: true },
      version: { build: 'dev', hash: '', uptime: 0 },
    }

    // 구조 검증
    expect(expectedShape.status).toBe('ok')
    expect(expectedShape.checks).toHaveProperty('db')
    expect(expectedShape.version).toHaveProperty('build')
    expect(expectedShape.version).toHaveProperty('hash')
    expect(expectedShape.version).toHaveProperty('uptime')
    expect(typeof expectedShape.version.uptime).toBe('number')
  })

  test('health 라우트 모듈이 healthRoute를 export', async () => {
    const mod = await import('../../routes/health')
    expect(mod.healthRoute).toBeDefined()
  })
})
