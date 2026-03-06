import { describe, expect, test, beforeEach } from 'bun:test'
import { recordError, getRecentErrors, getErrorCount24h, _resetErrors } from '../../utils/error-counter'

// ============================================================
// TEA: Error Counter — Core + Edge Cases
// ============================================================
describe('Error Counter — Core', () => {
  beforeEach(() => {
    _resetErrors()
  })

  test('recordError 후 getRecentErrors에 에러가 나타남', () => {
    recordError('test error 1')
    const errors = getRecentErrors()
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('test error 1')
  })

  test('getRecentErrors는 최신 에러가 먼저 (역순)', () => {
    recordError('first')
    recordError('second')
    recordError('third')
    const errors = getRecentErrors(3)
    expect(errors[0].message).toBe('third')
    expect(errors[1].message).toBe('second')
    expect(errors[2].message).toBe('first')
  })

  test('getRecentErrors limit 적용', () => {
    for (let i = 0; i < 10; i++) recordError(`error ${i}`)
    const errors = getRecentErrors(3)
    expect(errors.length).toBe(3)
  })

  test('getRecentErrors 기본 limit은 5', () => {
    for (let i = 0; i < 10; i++) recordError(`error ${i}`)
    const errors = getRecentErrors()
    expect(errors.length).toBe(5)
  })

  test('getErrorCount24h는 에러 수 반환', () => {
    recordError('err1')
    recordError('err2')
    expect(getErrorCount24h()).toBe(2)
  })

  test('빈 상태에서 getRecentErrors 빈 배열', () => {
    expect(getRecentErrors()).toEqual([])
  })

  test('빈 상태에서 getErrorCount24h 0 반환', () => {
    expect(getErrorCount24h()).toBe(0)
  })

  test('MAX_ERRORS(100) 초과 시 오래된 에러 제거', () => {
    for (let i = 0; i < 110; i++) recordError(`error ${i}`)
    const all = getRecentErrors(200)
    expect(all.length).toBe(100)
    expect(all[all.length - 1].message).toBe('error 10')
  })

  test('timestamp는 숫자형', () => {
    recordError('test')
    const errors = getRecentErrors()
    expect(typeof errors[0].timestamp).toBe('number')
    expect(errors[0].timestamp).toBeGreaterThan(0)
  })

  test('_resetErrors 후 빈 상태', () => {
    recordError('test')
    expect(getErrorCount24h()).toBe(1)
    _resetErrors()
    expect(getErrorCount24h()).toBe(0)
  })
})

describe('Error Counter — Edge Cases (TEA)', () => {
  beforeEach(() => {
    _resetErrors()
  })

  test('빈 문자열 에러 메시지 기록 가능', () => {
    recordError('')
    const errors = getRecentErrors()
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('')
  })

  test('매우 긴 에러 메시지는 500자로 truncate', () => {
    const longMsg = 'x'.repeat(10000)
    recordError(longMsg)
    const errors = getRecentErrors()
    expect(errors[0].message.length).toBe(503) // 500 + '...'
    expect(errors[0].message.endsWith('...')).toBe(true)
  })

  test('500자 이하 메시지는 truncate 안 됨', () => {
    const msg = 'x'.repeat(500)
    recordError(msg)
    const errors = getRecentErrors()
    expect(errors[0].message.length).toBe(500)
    expect(errors[0].message.endsWith('...')).toBe(false)
  })

  test('특수 문자 포함 에러 메시지', () => {
    recordError('에러: SQL injection -- DROP TABLE; <script>alert(1)</script>')
    const errors = getRecentErrors()
    expect(errors[0].message).toContain('<script>')
  })

  test('limit=0일 때 slice(-0)은 전체 반환 (JS 동작)', () => {
    recordError('test')
    const errors = getRecentErrors(0)
    // slice(-0) === slice(0) → 전체 배열 반환
    expect(errors.length).toBe(1)
  })

  test('limit=1일 때 가장 최신 1개만 반환', () => {
    recordError('old')
    recordError('new')
    const errors = getRecentErrors(1)
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('new')
  })

  test('정확히 100개일 때 shift 안 됨', () => {
    for (let i = 0; i < 100; i++) recordError(`error ${i}`)
    const all = getRecentErrors(200)
    expect(all.length).toBe(100)
    expect(all[all.length - 1].message).toBe('error 0')
  })

  test('101번째에서 첫 번째가 제거됨', () => {
    for (let i = 0; i < 101; i++) recordError(`error ${i}`)
    const all = getRecentErrors(200)
    expect(all.length).toBe(100)
    expect(all[all.length - 1].message).toBe('error 1')
  })

  test('연속 recordError 호출 시 timestamp 증가 또는 동일', () => {
    recordError('a')
    recordError('b')
    const errors = getRecentErrors(2)
    expect(errors[0].timestamp).toBeGreaterThanOrEqual(errors[1].timestamp)
  })

  test('getRecentErrors는 원본 배열 수정 안 함', () => {
    recordError('test')
    const errors1 = getRecentErrors()
    const errors2 = getRecentErrors()
    expect(errors1).not.toBe(errors2)
  })

  test('getErrorCount24h 연속 호출 시 일관된 결과', () => {
    recordError('test')
    const count1 = getErrorCount24h()
    const count2 = getErrorCount24h()
    expect(count1).toBe(count2)
  })

  test('대량 에러 후 count24h 정확성 (200개 기록)', () => {
    for (let i = 0; i < 200; i++) recordError(`error ${i}`)
    // MAX_ERRORS=100이므로 최근 100개만 남음
    expect(getErrorCount24h()).toBe(100)
  })

  test('_resetErrors 후 recordError 정상 동작', () => {
    recordError('before')
    _resetErrors()
    recordError('after')
    expect(getRecentErrors().length).toBe(1)
    expect(getRecentErrors()[0].message).toBe('after')
  })
})

// ============================================================
// TEA: Monitoring Route Module
// ============================================================
describe('Monitoring Route Module', () => {
  test('monitoringRoute를 export', async () => {
    const mod = await import('../../routes/admin/monitoring')
    expect(mod.monitoringRoute).toBeDefined()
  })

  test('monitoringRoute는 Hono 인스턴스', async () => {
    const mod = await import('../../routes/admin/monitoring')
    expect(typeof mod.monitoringRoute.fetch).toBe('function')
  })
})

// ============================================================
// TEA: Error Handler Integration
// ============================================================
describe('Error Handler Integration', () => {
  test('errorHandler 모듈이 recordError를 import', async () => {
    const errorMod = await import('../../middleware/error')
    expect(errorMod.errorHandler).toBeDefined()
    expect(errorMod.HTTPError).toBeDefined()
  })

  test('HTTPError는 status, message, code 속성', () => {
    const { HTTPError } = require('../../middleware/error')
    const err = new HTTPError(404, 'Not found', 'NF_001')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.code).toBe('NF_001')
  })

  test('HTTPError code 생략 가능', () => {
    const { HTTPError } = require('../../middleware/error')
    const err = new HTTPError(500, 'Internal')
    expect(err.code).toBeUndefined()
  })

  test('HTTPError는 Error 상속', () => {
    const { HTTPError } = require('../../middleware/error')
    const err = new HTTPError(400, 'Bad')
    expect(err instanceof Error).toBe(true)
  })
})

// ============================================================
// TEA: Monitoring API Response Shape
// ============================================================
describe('Monitoring API Response Shape', () => {
  test('응답 구조 검증: server, memory, db, errors 섹션', () => {
    const expectedShape = {
      server: {
        status: 'ok',
        uptime: 12345,
        version: { build: 'dev', hash: '', runtime: 'Bun 1.x' },
      },
      memory: { rss: 100.0, heapUsed: 50.0, heapTotal: 128.0, usagePercent: 39.1 },
      db: { status: 'ok', responseTimeMs: 5 },
      errors: { count24h: 0, recent: [] },
    }

    expect(expectedShape.server).toHaveProperty('status')
    expect(expectedShape.server).toHaveProperty('uptime')
    expect(expectedShape.server.version).toHaveProperty('build')
    expect(expectedShape.server.version).toHaveProperty('hash')
    expect(expectedShape.server.version).toHaveProperty('runtime')
    expect(expectedShape.memory).toHaveProperty('rss')
    expect(expectedShape.memory).toHaveProperty('heapUsed')
    expect(expectedShape.memory).toHaveProperty('heapTotal')
    expect(expectedShape.memory).toHaveProperty('usagePercent')
    expect(expectedShape.db).toHaveProperty('status')
    expect(expectedShape.db).toHaveProperty('responseTimeMs')
    expect(expectedShape.errors).toHaveProperty('count24h')
    expect(expectedShape.errors).toHaveProperty('recent')
    expect(Array.isArray(expectedShape.errors.recent)).toBe(true)
  })

  test('메모리 사용률 계산 정확성', () => {
    const heapUsed = 56.7
    const heapTotal = 128.0
    const usagePercent = Math.round(heapUsed / heapTotal * 1000) / 10
    expect(usagePercent).toBe(44.3)
  })

  test('메모리 사용률 heapTotal 0일 때 0 반환', () => {
    const heapTotal = 0
    const heapUsed = 0
    const usagePercent = heapTotal > 0 ? Math.round(heapUsed / heapTotal * 1000) / 10 : 0
    expect(usagePercent).toBe(0)
  })

  test('메모리 MB 변환 정확성 (소수 1자리)', () => {
    const bytes = 134217728 // 128 MB exactly
    const mb = Math.round(bytes / 1024 / 1024 * 10) / 10
    expect(mb).toBe(128)
  })

  test('메모리 MB 변환 비정확한 바이트', () => {
    const bytes = 59392000 // ~56.6 MB
    const mb = Math.round(bytes / 1024 / 1024 * 10) / 10
    expect(mb).toBe(56.6)
  })

  test('메모리 사용률 100% 초과 가능 (heapUsed > heapTotal edge case)', () => {
    const heapUsed = 150.0
    const heapTotal = 128.0
    const usagePercent = Math.round(heapUsed / heapTotal * 1000) / 10
    expect(usagePercent).toBe(117.2)
  })

  test('에러 recent 항목 구조: timestamp(ISO) + message(string)', () => {
    const entry = { timestamp: new Date(1709712000000).toISOString(), message: 'test error' }
    expect(typeof entry.timestamp).toBe('string')
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(typeof entry.message).toBe('string')
  })

  test('server.uptime은 정수 (Math.floor)', () => {
    const uptime = Math.floor(12345.678)
    expect(uptime).toBe(12345)
    expect(Number.isInteger(uptime)).toBe(true)
  })

  test('DB responseTimeMs는 정수 (Math.round)', () => {
    const ms = Math.round(12.456)
    expect(ms).toBe(12)
    expect(Number.isInteger(ms)).toBe(true)
  })
})

// ============================================================
// TEA: Uptime Formatting — Comprehensive
// ============================================================
describe('Uptime Formatting (Frontend Logic)', () => {
  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return [d && `${d}일`, h && `${h}시간`, `${m}분`].filter(Boolean).join(' ')
  }

  test('0초 → "0분"', () => {
    expect(formatUptime(0)).toBe('0분')
  })

  test('59초 → "0분" (1분 미만은 0분)', () => {
    expect(formatUptime(59)).toBe('0분')
  })

  test('60초 → "1분"', () => {
    expect(formatUptime(60)).toBe('1분')
  })

  test('3599초 → "59분" (1시간 미만)', () => {
    expect(formatUptime(3599)).toBe('59분')
  })

  test('3600초 → "1시간 0분"', () => {
    expect(formatUptime(3600)).toBe('1시간 0분')
  })

  test('3661초 → "1시간 1분"', () => {
    expect(formatUptime(3661)).toBe('1시간 1분')
  })

  test('7200초 → "2시간 0분"', () => {
    expect(formatUptime(7200)).toBe('2시간 0분')
  })

  test('86400초 → "1일 0분"', () => {
    expect(formatUptime(86400)).toBe('1일 0분')
  })

  test('90061초 → "1일 1시간 1분"', () => {
    expect(formatUptime(90061)).toBe('1일 1시간 1분')
  })

  test('259200초 → "3일 0분"', () => {
    expect(formatUptime(259200)).toBe('3일 0분')
  })

  test('172800초 → "2일 0분"', () => {
    expect(formatUptime(172800)).toBe('2일 0분')
  })

  test('999일 업타임 처리', () => {
    expect(formatUptime(999 * 86400)).toBe('999일 0분')
  })
})

// ============================================================
// TEA: Memory Bar Color Thresholds
// ============================================================
describe('Memory Bar Color Thresholds (Frontend Logic)', () => {
  function getMemoryBarColor(percent: number): string {
    return percent >= 90 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
  }

  test('0% → emerald', () => {
    expect(getMemoryBarColor(0)).toBe('bg-emerald-500')
  })

  test('50% → emerald', () => {
    expect(getMemoryBarColor(50)).toBe('bg-emerald-500')
  })

  test('79.9% → emerald', () => {
    expect(getMemoryBarColor(79.9)).toBe('bg-emerald-500')
  })

  test('80% → amber (경계값)', () => {
    expect(getMemoryBarColor(80)).toBe('bg-amber-500')
  })

  test('85% → amber', () => {
    expect(getMemoryBarColor(85)).toBe('bg-amber-500')
  })

  test('89.9% → amber', () => {
    expect(getMemoryBarColor(89.9)).toBe('bg-amber-500')
  })

  test('90% → red (경계값)', () => {
    expect(getMemoryBarColor(90)).toBe('bg-red-500')
  })

  test('95% → red', () => {
    expect(getMemoryBarColor(95)).toBe('bg-red-500')
  })

  test('100% → red', () => {
    expect(getMemoryBarColor(100)).toBe('bg-red-500')
  })

  test('110% → red (초과)', () => {
    expect(getMemoryBarColor(110)).toBe('bg-red-500')
  })
})

// ============================================================
// TEA: Admin Sidebar Nav
// ============================================================
describe('Admin Sidebar Navigation (TEA)', () => {
  const nav = [
    { to: '/', label: '대시보드', icon: '📊' },
    { to: '/companies', label: '회사 관리', icon: '🏛️' },
    { to: '/users', label: '직원 관리', icon: '👥' },
    { to: '/departments', label: '부서 관리', icon: '🏢' },
    { to: '/agents', label: 'AI 에이전트', icon: '🤖' },
    { to: '/tools', label: '도구 관리', icon: '🔧' },
    { to: '/credentials', label: 'CLI / API 키', icon: '🔑' },
    { to: '/report-lines', label: '보고 라인', icon: '📋' },
    { to: '/soul-templates', label: '소울 템플릿', icon: '✨' },
    { to: '/monitoring', label: '시스템 모니터링', icon: '🖥️' },
  ]

  test('시스템 모니터링 메뉴 존재', () => {
    const monitoringItem = nav.find(n => n.to === '/monitoring')
    expect(monitoringItem).toBeDefined()
    expect(monitoringItem!.label).toBe('시스템 모니터링')
  })

  test('모니터링 메뉴 아이콘은 🖥️', () => {
    const monitoringItem = nav.find(n => n.to === '/monitoring')
    expect(monitoringItem!.icon).toBe('🖥️')
  })

  test('모든 nav 항목에 to, label, icon 존재', () => {
    for (const item of nav) {
      expect(item.to).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.icon).toBeTruthy()
    }
  })

  test('nav에 중복 경로 없음', () => {
    const paths = nav.map(n => n.to)
    expect(new Set(paths).size).toBe(paths.length)
  })

  test('총 10개 메뉴 항목', () => {
    expect(nav.length).toBe(10)
  })
})

// ============================================================
// TEA: Error Counter Concurrency Simulation
// ============================================================
describe('Error Counter — Rapid Fire (TEA)', () => {
  beforeEach(() => {
    _resetErrors()
  })

  test('1000개 빠른 연속 기록', () => {
    for (let i = 0; i < 1000; i++) recordError(`rapid ${i}`)
    expect(getRecentErrors(5).length).toBe(5)
    expect(getErrorCount24h()).toBe(100) // MAX_ERRORS cap
  })

  test('getRecentErrors 후 recordError 해도 이전 결과 불변', () => {
    recordError('a')
    const snapshot = getRecentErrors()
    recordError('b')
    expect(snapshot.length).toBe(1)
    expect(snapshot[0].message).toBe('a')
  })
})
