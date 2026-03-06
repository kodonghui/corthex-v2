import { describe, test, expect } from 'bun:test'
import { z } from 'zod'
import { getNextCronDate } from '../../lib/cron-utils'

// ============================================================
// Story 11-2: 야간작업 CRUD UI — 순수 함수 단위 테스트
// ============================================================

// --- schedules.ts에서 추출한 순수 함수 (export 안 되어 있으므로 동일 로직 복사) ---

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

function describeCron(cron: string): string {
  const parts = cron.split(' ')
  const minute = parts[0]
  const hour = parts[1]
  const dow = parts[4]
  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  if (dow === '*') return `매일 ${time}`
  if (dow === '1-5') return `평일 ${time}`
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayList = dow.split(',').map(d => dayNames[parseInt(d, 10)] || d).join('·')
  return `${dayList} ${time}`
}

// --- jobs.tsx에서 추출한 순수 데이터/함수 ---

const jobStatusConfig: Record<string, { label: string; variant: string }> = {
  queued: { label: '대기', variant: 'info' },
  processing: { label: '처리중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
  blocked: { label: '대기(체인)', variant: 'default' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  'price-above': '가격 상회',
  'price-below': '가격 하회',
  'market-open': '장 시작',
  'market-close': '장 마감',
}

// cron에서 시간 + 주기 추출 (openEditSchedule 로직)
function parseCronForEdit(cronExpression: string) {
  const parts = cronExpression.split(' ')
  const time = `${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`
  const dow = parts[4]
  let frequency: 'daily' | 'weekdays' | 'custom'
  let days: number[] = []
  if (dow === '*') {
    frequency = 'daily'
  } else if (dow === '1-5') {
    frequency = 'weekdays'
  } else {
    frequency = 'custom'
    days = dow.split(',').map(Number)
  }
  return { time, frequency, days }
}

// --- Zod 스키마 (schedules.ts에서 복사) ---

const createScheduleSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  frequency: z.enum(['daily', 'weekdays', 'custom']),
  time: z.string().regex(/^\d{2}:\d{2}$/).refine((t) => {
    const [h, m] = t.split(':').map(Number)
    return h >= 0 && h <= 23 && m >= 0 && m <= 59
  }, '유효한 시간(00:00~23:59)을 입력하세요'),
  days: z.array(z.number().min(0).max(6)).optional(),
})

const updateScheduleSchema = z.object({
  instruction: z.string().min(1).max(2000).optional(),
  frequency: z.enum(['daily', 'weekdays', 'custom']).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).refine((t) => {
    const [h, m] = t.split(':').map(Number)
    return h >= 0 && h <= 23 && m >= 0 && m <= 59
  }, '유효한 시간(00:00~23:59)을 입력하세요').optional(),
  days: z.array(z.number().min(0).max(6)).optional(),
})

const queueJobSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
})

const chainJobSchema = z.object({
  steps: z.array(z.object({
    agentId: z.string().uuid(),
    instruction: z.string().min(1),
  })).min(2).max(5),
})


// ============================================================
// 1. buildCronExpression 테스트
// ============================================================
describe('buildCronExpression', () => {
  test('매일 22:00 → 0 22 * * *', () => {
    expect(buildCronExpression('daily', '22:00')).toBe('0 22 * * *')
  })

  test('매일 09:30 → 30 9 * * *', () => {
    expect(buildCronExpression('daily', '09:30')).toBe('30 9 * * *')
  })

  test('평일 08:00 → 0 8 * * 1-5', () => {
    expect(buildCronExpression('weekdays', '08:00')).toBe('0 8 * * 1-5')
  })

  test('특정 요일 월/수/금 09:00 → 0 9 * * 1,3,5', () => {
    expect(buildCronExpression('custom', '09:00', [1, 3, 5])).toBe('0 9 * * 1,3,5')
  })

  test('특정 요일 — 정렬됨 (5,1,3 → 1,3,5)', () => {
    expect(buildCronExpression('custom', '10:00', [5, 1, 3])).toBe('0 10 * * 1,3,5')
  })

  test('특정 요일 — 일요일(0) 포함', () => {
    expect(buildCronExpression('custom', '21:00', [0, 6])).toBe('0 21 * * 0,6')
  })

  test('custom에 days 없으면 에러', () => {
    expect(() => buildCronExpression('custom', '22:00')).toThrow('custom 주기에는 요일이 필요합니다')
  })

  test('custom에 빈 배열이면 에러', () => {
    expect(() => buildCronExpression('custom', '22:00', [])).toThrow('custom 주기에는 요일이 필요합니다')
  })

  test('지원하지 않는 주기면 에러', () => {
    expect(() => buildCronExpression('monthly', '22:00')).toThrow('지원하지 않는 주기: monthly')
  })

  test('자정 00:00 → 0 0 * * *', () => {
    expect(buildCronExpression('daily', '00:00')).toBe('0 0 * * *')
  })
})


// ============================================================
// 2. describeCron 테스트
// ============================================================
describe('describeCron', () => {
  test('매일 22:00', () => {
    expect(describeCron('0 22 * * *')).toBe('매일 22:00')
  })

  test('매일 09:05 — 0패딩', () => {
    expect(describeCron('5 9 * * *')).toBe('매일 09:05')
  })

  test('평일 08:00', () => {
    expect(describeCron('0 8 * * 1-5')).toBe('평일 08:00')
  })

  test('특정 요일 월·수·금 09:00', () => {
    expect(describeCron('0 9 * * 1,3,5')).toBe('월·수·금 09:00')
  })

  test('특정 요일 일·토 21:00', () => {
    expect(describeCron('0 21 * * 0,6')).toBe('일·토 21:00')
  })

  test('자정 00:00', () => {
    expect(describeCron('0 0 * * *')).toBe('매일 00:00')
  })

  test('단일 요일 화요일 10:30', () => {
    expect(describeCron('30 10 * * 2')).toBe('화 10:30')
  })
})


// ============================================================
// 3. buildCronExpression ↔ describeCron 왕복 테스트
// ============================================================
describe('cron 왕복 (build → describe)', () => {
  test('daily 22:00 왕복', () => {
    const cron = buildCronExpression('daily', '22:00')
    expect(describeCron(cron)).toBe('매일 22:00')
  })

  test('weekdays 08:30 왕복', () => {
    const cron = buildCronExpression('weekdays', '08:30')
    expect(describeCron(cron)).toBe('평일 08:30')
  })

  test('custom 월·수·금 09:00 왕복', () => {
    const cron = buildCronExpression('custom', '09:00', [1, 3, 5])
    expect(describeCron(cron)).toBe('월·수·금 09:00')
  })
})


// ============================================================
// 4. parseCronForEdit 테스트 (openEditSchedule 로직)
// ============================================================
describe('parseCronForEdit (cron → 편집 폼 역변환)', () => {
  test('매일 22:00', () => {
    const result = parseCronForEdit('0 22 * * *')
    expect(result.time).toBe('22:00')
    expect(result.frequency).toBe('daily')
    expect(result.days).toEqual([])
  })

  test('평일 08:30', () => {
    const result = parseCronForEdit('30 8 * * 1-5')
    expect(result.time).toBe('08:30')
    expect(result.frequency).toBe('weekdays')
    expect(result.days).toEqual([])
  })

  test('특정 요일 1,3,5 09:00', () => {
    const result = parseCronForEdit('0 9 * * 1,3,5')
    expect(result.time).toBe('09:00')
    expect(result.frequency).toBe('custom')
    expect(result.days).toEqual([1, 3, 5])
  })

  test('단일 자릿수 시/분 패딩 (5 9 → 09:05)', () => {
    const result = parseCronForEdit('5 9 * * *')
    expect(result.time).toBe('09:05')
  })

  test('자정 00:00', () => {
    const result = parseCronForEdit('0 0 * * *')
    expect(result.time).toBe('00:00')
    expect(result.frequency).toBe('daily')
  })
})


// ============================================================
// 5. buildCronExpression → getNextCronDate 통합 테스트
// ============================================================
describe('buildCronExpression → getNextCronDate 통합', () => {
  test('매일 22:00 — 21시 기준이면 오늘 22시', () => {
    const cron = buildCronExpression('daily', '22:00')
    const after = new Date('2026-03-06T21:00:00Z')
    const next = getNextCronDate(cron, after)
    expect(next.getUTCHours()).toBe(22)
    expect(next.getUTCMinutes()).toBe(0)
    expect(next.getUTCDate()).toBe(6)
  })

  test('평일 09:00 — 금요일 10시 → 다음 월요일 09:00', () => {
    const cron = buildCronExpression('weekdays', '09:00')
    const after = new Date('2026-03-06T10:00:00Z') // 금요일
    const next = getNextCronDate(cron, after)
    expect(next.getUTCDay()).toBe(1) // 월요일
    expect(next.getUTCHours()).toBe(9)
  })

  test('custom 월/수/금 09:00 — 수요일 10시 → 금요일 09:00', () => {
    const cron = buildCronExpression('custom', '09:00', [1, 3, 5])
    const after = new Date('2026-03-04T10:00:00Z') // 수요일
    const next = getNextCronDate(cron, after)
    expect(next.getUTCDay()).toBe(5) // 금요일
    expect(next.getUTCHours()).toBe(9)
  })
})


// ============================================================
// 6. jobStatusConfig 테스트
// ============================================================
describe('jobStatusConfig', () => {
  test('모든 상태가 정의되어 있다', () => {
    const statuses = ['queued', 'processing', 'completed', 'failed', 'blocked']
    for (const s of statuses) {
      expect(jobStatusConfig[s]).toBeDefined()
      expect(jobStatusConfig[s].label).toBeTruthy()
      expect(jobStatusConfig[s].variant).toBeTruthy()
    }
  })

  test('queued → 대기, info', () => {
    expect(jobStatusConfig.queued).toEqual({ label: '대기', variant: 'info' })
  })

  test('processing → 처리중, warning', () => {
    expect(jobStatusConfig.processing).toEqual({ label: '처리중', variant: 'warning' })
  })

  test('completed → 완료, success', () => {
    expect(jobStatusConfig.completed).toEqual({ label: '완료', variant: 'success' })
  })

  test('failed → 실패, error', () => {
    expect(jobStatusConfig.failed).toEqual({ label: '실패', variant: 'error' })
  })

  test('blocked → 대기(체인), default', () => {
    expect(jobStatusConfig.blocked).toEqual({ label: '대기(체인)', variant: 'default' })
  })
})


// ============================================================
// 7. DAY_NAMES 테스트
// ============================================================
describe('DAY_NAMES', () => {
  test('7일 배열', () => {
    expect(DAY_NAMES).toHaveLength(7)
  })

  test('일=0, 월=1, ..., 토=6', () => {
    expect(DAY_NAMES[0]).toBe('일')
    expect(DAY_NAMES[1]).toBe('월')
    expect(DAY_NAMES[2]).toBe('화')
    expect(DAY_NAMES[3]).toBe('수')
    expect(DAY_NAMES[4]).toBe('목')
    expect(DAY_NAMES[5]).toBe('금')
    expect(DAY_NAMES[6]).toBe('토')
  })
})


// ============================================================
// 8. TRIGGER_TYPE_LABELS 테스트
// ============================================================
describe('TRIGGER_TYPE_LABELS', () => {
  test('4가지 트리거 유형 정의', () => {
    expect(Object.keys(TRIGGER_TYPE_LABELS)).toHaveLength(4)
  })

  test('price-above → 가격 상회', () => {
    expect(TRIGGER_TYPE_LABELS['price-above']).toBe('가격 상회')
  })

  test('price-below → 가격 하회', () => {
    expect(TRIGGER_TYPE_LABELS['price-below']).toBe('가격 하회')
  })

  test('market-open → 장 시작', () => {
    expect(TRIGGER_TYPE_LABELS['market-open']).toBe('장 시작')
  })

  test('market-close → 장 마감', () => {
    expect(TRIGGER_TYPE_LABELS['market-close']).toBe('장 마감')
  })

  test('미정의 트리거 유형은 undefined', () => {
    expect(TRIGGER_TYPE_LABELS['unknown']).toBeUndefined()
  })
})


// ============================================================
// 9. createScheduleSchema Zod 검증 테스트
// ============================================================
describe('createScheduleSchema 검증', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'

  test('유효한 daily 스케줄', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '매일 보고서 생성',
      frequency: 'daily',
      time: '22:00',
    })
    expect(result.success).toBe(true)
  })

  test('유효한 custom 스케줄 (요일 포함)', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '특정 요일 작업',
      frequency: 'custom',
      time: '09:00',
      days: [1, 3, 5],
    })
    expect(result.success).toBe(true)
  })

  test('agentId가 uuid가 아니면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: 'not-a-uuid',
      instruction: '테스트',
      frequency: 'daily',
      time: '22:00',
    })
    expect(result.success).toBe(false)
  })

  test('instruction이 빈 문자열이면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '',
      frequency: 'daily',
      time: '22:00',
    })
    expect(result.success).toBe(false)
  })

  test('instruction이 2000자 초과이면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: 'a'.repeat(2001),
      frequency: 'daily',
      time: '22:00',
    })
    expect(result.success).toBe(false)
  })

  test('frequency가 invalid면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'monthly',
      time: '22:00',
    })
    expect(result.success).toBe(false)
  })

  test('time 형식이 HH:MM이 아니면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'daily',
      time: '9:00',
    })
    expect(result.success).toBe(false)
  })

  test('time 형식 22:00은 통과', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'daily',
      time: '22:00',
    })
    expect(result.success).toBe(true)
  })

  test('days에 7 이상이면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'custom',
      time: '22:00',
      days: [1, 7],
    })
    expect(result.success).toBe(false)
  })

  test('days에 음수이면 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'custom',
      time: '22:00',
      days: [-1, 3],
    })
    expect(result.success).toBe(false)
  })

  test('time 25:00은 실패 (시 범위 초과)', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'daily',
      time: '25:00',
    })
    expect(result.success).toBe(false)
  })

  test('time 12:61은 실패 (분 범위 초과)', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'daily',
      time: '12:61',
    })
    expect(result.success).toBe(false)
  })

  test('time 99:99은 실패', () => {
    const result = createScheduleSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      frequency: 'daily',
      time: '99:99',
    })
    expect(result.success).toBe(false)
  })
})


// ============================================================
// 10. updateScheduleSchema Zod 검증 테스트
// ============================================================
describe('updateScheduleSchema 검증', () => {
  test('빈 객체도 유효 (모든 필드 optional)', () => {
    const result = updateScheduleSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('instruction만 수정', () => {
    const result = updateScheduleSchema.safeParse({ instruction: '수정된 지시' })
    expect(result.success).toBe(true)
  })

  test('frequency만 수정', () => {
    const result = updateScheduleSchema.safeParse({ frequency: 'weekdays' })
    expect(result.success).toBe(true)
  })

  test('time만 수정', () => {
    const result = updateScheduleSchema.safeParse({ time: '23:30' })
    expect(result.success).toBe(true)
  })

  test('instruction 빈 문자열 실패', () => {
    const result = updateScheduleSchema.safeParse({ instruction: '' })
    expect(result.success).toBe(false)
  })
})


// ============================================================
// 11. queueJobSchema Zod 검증 테스트
// ============================================================
describe('queueJobSchema 검증', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'

  test('유효한 즉시 실행 작업', () => {
    const result = queueJobSchema.safeParse({
      agentId: validUUID,
      instruction: '보고서 작성해줘',
    })
    expect(result.success).toBe(true)
  })

  test('유효한 예약 실행 작업', () => {
    const result = queueJobSchema.safeParse({
      agentId: validUUID,
      instruction: '보고서 작성해줘',
      scheduledFor: '2026-03-06T22:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  test('scheduledFor가 datetime 형식이 아니면 실패', () => {
    const result = queueJobSchema.safeParse({
      agentId: validUUID,
      instruction: '보고서 작성해줘',
      scheduledFor: '2026-03-06',
    })
    expect(result.success).toBe(false)
  })

  test('instruction 누락이면 실패', () => {
    const result = queueJobSchema.safeParse({
      agentId: validUUID,
    })
    expect(result.success).toBe(false)
  })

  test('agentId 누락이면 실패', () => {
    const result = queueJobSchema.safeParse({
      instruction: '보고서 작성해줘',
    })
    expect(result.success).toBe(false)
  })
})


// ============================================================
// 12. chainJobSchema Zod 검증 테스트
// ============================================================
describe('chainJobSchema 검증', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'
  const validUUID2 = '660e8400-e29b-41d4-a716-446655440000'

  test('유효한 2단계 체인', () => {
    const result = chainJobSchema.safeParse({
      steps: [
        { agentId: validUUID, instruction: '1단계' },
        { agentId: validUUID2, instruction: '2단계' },
      ],
    })
    expect(result.success).toBe(true)
  })

  test('1단계만 있으면 실패 (최소 2)', () => {
    const result = chainJobSchema.safeParse({
      steps: [
        { agentId: validUUID, instruction: '1단계' },
      ],
    })
    expect(result.success).toBe(false)
  })

  test('6단계 이상이면 실패 (최대 5)', () => {
    const result = chainJobSchema.safeParse({
      steps: Array.from({ length: 6 }, (_, i) => ({
        agentId: validUUID,
        instruction: `단계 ${i + 1}`,
      })),
    })
    expect(result.success).toBe(false)
  })

  test('5단계는 유효', () => {
    const result = chainJobSchema.safeParse({
      steps: Array.from({ length: 5 }, (_, i) => ({
        agentId: validUUID,
        instruction: `단계 ${i + 1}`,
      })),
    })
    expect(result.success).toBe(true)
  })

  test('step에 instruction 빈 문자열이면 실패', () => {
    const result = chainJobSchema.safeParse({
      steps: [
        { agentId: validUUID, instruction: '' },
        { agentId: validUUID2, instruction: '2단계' },
      ],
    })
    expect(result.success).toBe(false)
  })

  test('step에 agentId가 uuid가 아니면 실패', () => {
    const result = chainJobSchema.safeParse({
      steps: [
        { agentId: 'bad', instruction: '1단계' },
        { agentId: validUUID2, instruction: '2단계' },
      ],
    })
    expect(result.success).toBe(false)
  })
})


// ============================================================
// 13. UI 폼 검증 로직 테스트 (handleSubmit 조건)
// ============================================================
describe('UI 폼 검증 로직', () => {
  // handleSubmit 함수의 검증 조건을 순수 함수로 추출하여 테스트
  function isSubmitDisabled(opts: {
    modalAgent: string
    modalInstruction: string
    modalType: 'oneTime' | 'schedule' | 'trigger'
    modalFrequency: string
    modalDays: number[]
    modalTriggerType: string
    modalStockCode: string
    modalTargetPrice: string
    isPending: boolean
  }): boolean {
    const { modalAgent, modalInstruction, modalType, modalFrequency, modalDays, modalTriggerType, modalStockCode, modalTargetPrice, isPending } = opts
    return (
      !modalAgent ||
      !modalInstruction.trim() ||
      (modalType === 'schedule' && modalFrequency === 'custom' && modalDays.length === 0) ||
      (modalType === 'trigger' && (modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (!modalStockCode.trim() || !modalTargetPrice)) ||
      isPending
    )
  }

  const baseOpts = {
    modalAgent: '550e8400-e29b-41d4-a716-446655440000',
    modalInstruction: '보고서 작성',
    modalType: 'oneTime' as const,
    modalFrequency: 'daily',
    modalDays: [] as number[],
    modalTriggerType: 'price-above',
    modalStockCode: '',
    modalTargetPrice: '',
    isPending: false,
  }

  test('유효한 일회성 → 활성화', () => {
    expect(isSubmitDisabled(baseOpts)).toBe(false)
  })

  test('에이전트 미선택 → 비활성화', () => {
    expect(isSubmitDisabled({ ...baseOpts, modalAgent: '' })).toBe(true)
  })

  test('지시 비어있음 → 비활성화', () => {
    expect(isSubmitDisabled({ ...baseOpts, modalInstruction: '' })).toBe(true)
  })

  test('지시 공백만 → 비활성화', () => {
    expect(isSubmitDisabled({ ...baseOpts, modalInstruction: '   ' })).toBe(true)
  })

  test('반복 custom에 요일 없음 → 비활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'schedule',
      modalFrequency: 'custom',
      modalDays: [],
    })).toBe(true)
  })

  test('반복 custom에 요일 있음 → 활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'schedule',
      modalFrequency: 'custom',
      modalDays: [1, 3],
    })).toBe(false)
  })

  test('반복 daily → 요일 없어도 활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'schedule',
      modalFrequency: 'daily',
      modalDays: [],
    })).toBe(false)
  })

  test('트리거 price-above에 종목코드 없으면 비활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'trigger',
      modalTriggerType: 'price-above',
      modalStockCode: '',
      modalTargetPrice: '72000',
    })).toBe(true)
  })

  test('트리거 price-below에 목표가 없으면 비활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'trigger',
      modalTriggerType: 'price-below',
      modalStockCode: '005930',
      modalTargetPrice: '',
    })).toBe(true)
  })

  test('트리거 price-above에 종목+목표가 모두 있으면 활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'trigger',
      modalTriggerType: 'price-above',
      modalStockCode: '005930',
      modalTargetPrice: '72000',
    })).toBe(false)
  })

  test('트리거 market-open은 종목/목표가 없어도 활성화', () => {
    expect(isSubmitDisabled({
      ...baseOpts,
      modalType: 'trigger',
      modalTriggerType: 'market-open',
      modalStockCode: '',
      modalTargetPrice: '',
    })).toBe(false)
  })

  test('isPending이면 비활성화', () => {
    expect(isSubmitDisabled({ ...baseOpts, isPending: true })).toBe(true)
  })
})


// ============================================================
// 14. 탭 카운트 계산 테스트
// ============================================================
describe('탭 카운트 계산', () => {
  type TabKey = 'oneTime' | 'schedule' | 'trigger'

  function buildTabs(jobsLen: number, schedulesLen: number, triggersLen: number) {
    return [
      { key: 'oneTime' as TabKey, label: '일회성', count: jobsLen },
      { key: 'schedule' as TabKey, label: '반복 스케줄', count: schedulesLen },
      { key: 'trigger' as TabKey, label: '트리거', count: triggersLen },
    ]
  }

  test('모든 탭 0건', () => {
    const tabs = buildTabs(0, 0, 0)
    expect(tabs.every(t => t.count === 0)).toBe(true)
  })

  test('일회성 3건, 스케줄 2건, 트리거 1건', () => {
    const tabs = buildTabs(3, 2, 1)
    expect(tabs[0].count).toBe(3)
    expect(tabs[1].count).toBe(2)
    expect(tabs[2].count).toBe(1)
  })

  test('라벨 확인', () => {
    const tabs = buildTabs(0, 0, 0)
    expect(tabs[0].label).toBe('일회성')
    expect(tabs[1].label).toBe('반복 스케줄')
    expect(tabs[2].label).toBe('트리거')
  })
})


// ============================================================
// 15. 체인 그룹화 로직 테스트
// ============================================================
describe('체인 그룹화 로직', () => {
  type SimpleJob = { id: string; chainId: string | null; parentJobId: string | null; createdAt: string }

  function groupJobs(jobs: SimpleJob[]) {
    const chains = new Map<string, SimpleJob[]>()
    const singles: SimpleJob[] = []
    for (const job of jobs) {
      if (job.chainId) {
        const list = chains.get(job.chainId) || []
        list.push(job)
        chains.set(job.chainId, list)
      } else {
        singles.push(job)
      }
    }
    // 체인 내부 정렬
    for (const [, list] of chains) {
      list.sort((a, b) => {
        if (!a.parentJobId) return -1
        if (!b.parentJobId) return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }
    return { chains, singles }
  }

  test('체인 없으면 모두 singles', () => {
    const jobs: SimpleJob[] = [
      { id: '1', chainId: null, parentJobId: null, createdAt: '2026-03-06T00:00:00Z' },
      { id: '2', chainId: null, parentJobId: null, createdAt: '2026-03-06T01:00:00Z' },
    ]
    const { chains, singles } = groupJobs(jobs)
    expect(chains.size).toBe(0)
    expect(singles).toHaveLength(2)
  })

  test('체인 그룹이 올바르게 분리됨', () => {
    const jobs: SimpleJob[] = [
      { id: '1', chainId: 'chain-a', parentJobId: null, createdAt: '2026-03-06T00:00:00Z' },
      { id: '2', chainId: 'chain-a', parentJobId: '1', createdAt: '2026-03-06T00:01:00Z' },
      { id: '3', chainId: null, parentJobId: null, createdAt: '2026-03-06T00:02:00Z' },
    ]
    const { chains, singles } = groupJobs(jobs)
    expect(chains.size).toBe(1)
    expect(chains.get('chain-a')!).toHaveLength(2)
    expect(singles).toHaveLength(1)
  })

  test('체인 내부 첫 번째 작업(parentJobId=null)이 맨 앞', () => {
    const jobs: SimpleJob[] = [
      { id: '2', chainId: 'chain-a', parentJobId: '1', createdAt: '2026-03-06T00:01:00Z' },
      { id: '1', chainId: 'chain-a', parentJobId: null, createdAt: '2026-03-06T00:00:00Z' },
      { id: '3', chainId: 'chain-a', parentJobId: '2', createdAt: '2026-03-06T00:02:00Z' },
    ]
    const { chains } = groupJobs(jobs)
    const chainList = chains.get('chain-a')!
    expect(chainList[0].id).toBe('1')
    expect(chainList[1].id).toBe('2')
    expect(chainList[2].id).toBe('3')
  })

  test('여러 체인 그룹', () => {
    const jobs: SimpleJob[] = [
      { id: '1', chainId: 'chain-a', parentJobId: null, createdAt: '2026-03-06T00:00:00Z' },
      { id: '2', chainId: 'chain-b', parentJobId: null, createdAt: '2026-03-06T00:01:00Z' },
      { id: '3', chainId: 'chain-a', parentJobId: '1', createdAt: '2026-03-06T00:02:00Z' },
    ]
    const { chains, singles } = groupJobs(jobs)
    expect(chains.size).toBe(2)
    expect(singles).toHaveLength(0)
  })
})
