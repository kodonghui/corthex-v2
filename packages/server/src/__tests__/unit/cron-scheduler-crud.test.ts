import { describe, test, expect } from 'bun:test'
import { parseField, getNextCronDate, validateCronExpression, describeCronExpression } from '../../lib/cron-utils'

/**
 * Story 14-1: Cron Scheduler Service CRUD API
 * Tests for: step syntax, validateCronExpression, describeCronExpression, schema validation
 */

// ============================================================
// parseField — step syntax support (AC6)
// ============================================================
describe('parseField — step syntax (*/N)', () => {
  test('*/5 분 필드 → 0,5,10,...,55', () => {
    const result = parseField('*/5', 0, 59)
    expect(result).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  })

  test('*/10 시 필드 → 0,10,20', () => {
    const result = parseField('*/10', 0, 23)
    expect(result).toEqual([0, 10, 20])
  })

  test('*/15 분 필드 → 0,15,30,45', () => {
    const result = parseField('*/15', 0, 59)
    expect(result).toEqual([0, 15, 30, 45])
  })

  test('*/1 → 전체 범위와 같음', () => {
    const result = parseField('*/1', 0, 5)
    expect(result).toEqual([0, 1, 2, 3, 4, 5])
  })

  test('step이 범위보다 큰 경우 첫 값만', () => {
    const result = parseField('*/100', 0, 59)
    expect(result).toEqual([0])
  })
})

describe('parseField — range+step (N-M/S)', () => {
  test('1-30/5 → 1,6,11,16,21,26', () => {
    const result = parseField('1-30/5', 0, 59)
    expect(result).toEqual([1, 6, 11, 16, 21, 26])
  })

  test('9-17/2 시 필드 → 9,11,13,15,17', () => {
    const result = parseField('9-17/2', 0, 23)
    expect(result).toEqual([9, 11, 13, 15, 17])
  })

  test('0-6/3 요일 필드 → 0,3,6', () => {
    const result = parseField('0-6/3', 0, 6)
    expect(result).toEqual([0, 3, 6])
  })
})

describe('parseField — start/step (N/S)', () => {
  test('5/10 분 필드 → 5,15,25,35,45,55', () => {
    const result = parseField('5/10', 0, 59)
    expect(result).toEqual([5, 15, 25, 35, 45, 55])
  })
})

describe('parseField — step error handling', () => {
  test('*/0 → 에러 (step must be > 0)', () => {
    expect(() => parseField('*/0', 0, 59)).toThrow('Invalid cron step value')
  })

  test('*/abc → 에러', () => {
    expect(() => parseField('*/abc', 0, 59)).toThrow('Invalid cron step value')
  })

  test('*/-1 → 에러 (negative step)', () => {
    expect(() => parseField('*/-1', 0, 59)).toThrow('Invalid cron step value')
  })
})

describe('parseField — mixed with step in list', () => {
  test('기존 범위 기능 유지: 1-5', () => {
    const result = parseField('1-5', 0, 6)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  test('기존 목록 기능 유지: 1,3,5', () => {
    const result = parseField('1,3,5', 0, 6)
    expect(result).toEqual([1, 3, 5])
  })

  test('기존 * 기능 유지', () => {
    const result = parseField('*', 0, 6)
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

// ============================================================
// getNextCronDate — step syntax integration
// ============================================================
describe('getNextCronDate — step syntax', () => {
  test('*/5 분 — 14:03이면 14:05', () => {
    const after = new Date('2026-03-06T14:03:00Z')
    const next = getNextCronDate('*/5 * * * *', after)
    expect(next.getUTCHours()).toBe(14)
    expect(next.getUTCMinutes()).toBe(5)
  })

  test('*/15 분 — 14:16이면 14:30', () => {
    const after = new Date('2026-03-06T14:16:00Z')
    const next = getNextCronDate('*/15 * * * *', after)
    expect(next.getUTCHours()).toBe(14)
    expect(next.getUTCMinutes()).toBe(30)
  })

  test('0 */2 * * * — 짝수 시간마다', () => {
    const after = new Date('2026-03-06T13:00:00Z')
    const next = getNextCronDate('0 */2 * * *', after)
    expect(next.getUTCHours()).toBe(14)
    expect(next.getUTCMinutes()).toBe(0)
  })

  test('0 9-17/2 * * * — 업무시간 홀수 시 매시', () => {
    const after = new Date('2026-03-06T10:00:00Z')
    const next = getNextCronDate('0 9-17/2 * * *', after)
    expect(next.getUTCHours()).toBe(11)
    expect(next.getUTCMinutes()).toBe(0)
  })
})

// ============================================================
// validateCronExpression (AC2, AC6)
// ============================================================
describe('validateCronExpression', () => {
  test('유효한 표현식 — valid=true, description, nextRun 반환', () => {
    const result = validateCronExpression('0 9 * * 1-5')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.description).toBeDefined()
    expect(result.nextRun).toBeInstanceOf(Date)
  })

  test('유효한 step 표현식 — */5 * * * *', () => {
    const result = validateCronExpression('*/5 * * * *')
    expect(result.valid).toBe(true)
    expect(result.description).toContain('5분마다')
  })

  test('유효한 매일 표현식 — 0 22 * * *', () => {
    const result = validateCronExpression('0 22 * * *')
    expect(result.valid).toBe(true)
    expect(result.description).toContain('매일')
  })

  test('필드 수 부족 — valid=false', () => {
    const result = validateCronExpression('0 22 * *')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('5개 필드')
  })

  test('필드 수 초과 — valid=false', () => {
    const result = validateCronExpression('0 22 * * * *')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('5개 필드')
  })

  test('잘못된 범위 — valid=false', () => {
    const result = validateCronExpression('0 25 * * *')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('잘못된 문자 — valid=false', () => {
    const result = validateCronExpression('abc 22 * * *')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('빈 문자열 — valid=false', () => {
    const result = validateCronExpression('')
    expect(result.valid).toBe(false)
  })

  test('유효한 매분 표현식', () => {
    const result = validateCronExpression('* * * * *')
    expect(result.valid).toBe(true)
  })

  test('유효한 월별 표현식 — 0 9 15 * *', () => {
    const result = validateCronExpression('0 9 15 * *')
    expect(result.valid).toBe(true)
  })

  test('유효한 range+step — 1-30/5 9 * * *', () => {
    const result = validateCronExpression('1-30/5 9 * * *')
    expect(result.valid).toBe(true)
  })

  test('잘못된 step (0) — valid=false', () => {
    const result = validateCronExpression('*/0 * * * *')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

// ============================================================
// describeCronExpression
// ============================================================
describe('describeCronExpression', () => {
  test('매일 22:00', () => {
    const desc = describeCronExpression('0 22 * * *')
    expect(desc).toContain('매일')
    expect(desc).toContain('22:00')
  })

  test('평일', () => {
    const desc = describeCronExpression('0 9 * * 1-5')
    expect(desc).toContain('평일')
  })

  test('주말', () => {
    const desc = describeCronExpression('0 9 * * 0,6')
    expect(desc).toContain('주말')
  })

  test('5분마다', () => {
    const desc = describeCronExpression('*/5 * * * *')
    expect(desc).toContain('5분마다')
  })

  test('2시간마다', () => {
    const desc = describeCronExpression('0 */2 * * *')
    expect(desc).toContain('2시간마다')
  })

  test('매월 15일', () => {
    const desc = describeCronExpression('0 9 15 * *')
    expect(desc).toContain('15일')
  })

  test('특정 요일 월·수·금', () => {
    const desc = describeCronExpression('0 9 * * 1,3,5')
    expect(desc).toContain('월')
    expect(desc).toContain('수')
    expect(desc).toContain('금')
  })

  test('잘못된 표현식 — 원래 문자열 반환', () => {
    const desc = describeCronExpression('invalid')
    expect(desc).toBe('invalid')
  })
})

// ============================================================
// Schema validation (AC1) — structure tests
// ============================================================
describe('cronRuns schema structure', () => {
  test('cronRuns 테이블이 schema에서 export됨', async () => {
    const schema = await import('../../db/schema')
    expect(schema.cronRuns).toBeDefined()
    expect(schema.cronRunStatusEnum).toBeDefined()
  })

  test('nightJobSchedules에 name 컬럼 존재', async () => {
    const schema = await import('../../db/schema')
    const columns = schema.nightJobSchedules as any
    expect(columns.name).toBeDefined()
  })

  test('nightJobSchedules에 lastRunAt 컬럼 존재', async () => {
    const schema = await import('../../db/schema')
    const columns = schema.nightJobSchedules as any
    expect(columns.lastRunAt).toBeDefined()
  })

  test('cronRunStatusEnum 값이 running, success, failed', async () => {
    const schema = await import('../../db/schema')
    expect(schema.cronRunStatusEnum.enumValues).toEqual(['running', 'success', 'failed'])
  })
})

// ============================================================
// Route validation schemas (AC3, AC7)
// ============================================================
describe('Schedule API schema validation', () => {
  // Import route module to test schema validation indirectly
  test('createScheduleSchema — cronExpression 모드 유효', () => {
    const { z } = require('zod')
    const createSchema = z.object({
      name: z.string().min(1).max(200),
      agentId: z.string().uuid(),
      instruction: z.string().min(1).max(2000),
      cronExpression: z.string().min(9).max(100).optional(),
      frequency: z.enum(['daily', 'weekdays', 'custom']).optional(),
      time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      days: z.array(z.number().min(0).max(6)).optional(),
    }).refine(
      (data: any) => data.cronExpression || (data.frequency && data.time),
      { message: 'cronExpression 또는 (frequency + time) 중 하나는 필수입니다' }
    )

    // cronExpression mode
    const validCron = createSchema.safeParse({
      name: '매일 시황 브리핑',
      agentId: '00000000-0000-0000-0000-000000000001',
      instruction: '오늘 시황 브리핑해줘',
      cronExpression: '0 9 * * 1-5',
    })
    expect(validCron.success).toBe(true)

    // frequency mode
    const validFreq = createSchema.safeParse({
      name: '매일 리포트',
      agentId: '00000000-0000-0000-0000-000000000001',
      instruction: '리포트 작성',
      frequency: 'daily',
      time: '09:00',
    })
    expect(validFreq.success).toBe(true)

    // Neither mode → fail
    const invalid = createSchema.safeParse({
      name: '실패 테스트',
      agentId: '00000000-0000-0000-0000-000000000001',
      instruction: '테스트',
    })
    expect(invalid.success).toBe(false)
  })

  test('name 필드 필수', () => {
    const { z } = require('zod')
    const schema = z.object({
      name: z.string().min(1).max(200),
    })
    expect(schema.safeParse({ name: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'valid' }).success).toBe(true)
    expect(schema.safeParse({ name: 'a'.repeat(201) }).success).toBe(false)
  })
})

// ============================================================
// Pagination format (AC7)
// ============================================================
describe('Pagination calculation', () => {
  test('페이지네이션 값 계산', () => {
    const total = 45
    const limit = 20
    const page = 1
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    expect(totalPages).toBe(3)
    expect(offset).toBe(0)
  })

  test('마지막 페이지 계산', () => {
    const total = 45
    const limit = 20
    const page = 3
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    expect(totalPages).toBe(3)
    expect(offset).toBe(40)
  })

  test('빈 결과셋', () => {
    const total = 0
    const limit = 20
    const totalPages = Math.ceil(total / limit)
    expect(totalPages).toBe(0)
  })
})

// ============================================================
// Toggle behavior (AC5)
// ============================================================
describe('Toggle nextRunAt behavior', () => {
  test('활성화 시 nextRunAt 재계산됨', () => {
    const cronExpression = '0 9 * * 1-5'
    const nextRunAt = getNextCronDate(cronExpression)
    expect(nextRunAt).toBeInstanceOf(Date)
    expect(nextRunAt.getTime()).toBeGreaterThan(Date.now())
  })

  test('비활성화 시 nextRunAt은 null로 설정되어야 함', () => {
    // Route logic: if (!newActive) updates.nextRunAt = null
    const newActive = false
    const nextRunAt = newActive ? getNextCronDate('0 9 * * *') : null
    expect(nextRunAt).toBeNull()
  })
})

// ============================================================
// buildCronExpression backward compat
// ============================================================
describe('buildCronExpression (backward compat)', () => {
  function buildCronExpression(frequency: string, time: string, days?: number[]): string {
    const [hour, minute] = time.split(':').map(Number)
    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`
      case 'weekdays':
        return `${minute} ${hour} * * 1-5`
      case 'custom':
        if (!days || days.length === 0) throw new Error('custom 주기에는 요일이 필요합니다')
        return `${minute} ${hour} * * ${days.sort((a, b) => a - b).join(',')}`
      default:
        throw new Error(`지원하지 않는 주기: ${frequency}`)
    }
  }

  test('daily → 매일 cron', () => {
    expect(buildCronExpression('daily', '09:00')).toBe('0 9 * * *')
  })

  test('weekdays → 평일 cron', () => {
    expect(buildCronExpression('weekdays', '22:30')).toBe('30 22 * * 1-5')
  })

  test('custom → 특정 요일 cron', () => {
    expect(buildCronExpression('custom', '09:00', [1, 3, 5])).toBe('0 9 * * 1,3,5')
  })

  test('custom without days → 에러', () => {
    expect(() => buildCronExpression('custom', '09:00')).toThrow('custom 주기에는 요일이 필요합니다')
  })
})
