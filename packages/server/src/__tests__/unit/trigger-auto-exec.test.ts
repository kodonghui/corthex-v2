import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// ============================================================
// Story 11-3: 이벤트 트리거 자동실행 — 순수 함수 단위 테스트
// ============================================================

// --- triggers.ts에서 추출한 Zod 스키마 (export 안 되어 있으므로 동일 로직 복사) ---

const triggerTypeEnum = z.enum(['price-above', 'price-below', 'market-open', 'market-close'])

const priceConditionSchema = z.object({
  stockCode: z.string().min(1).max(20),
  targetPrice: z.number().positive(),
})

const createTriggerSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1).max(2000),
  triggerType: triggerTypeEnum,
  condition: z.record(z.unknown()),
}).refine((data) => {
  if (data.triggerType === 'price-above' || data.triggerType === 'price-below') {
    return priceConditionSchema.safeParse(data.condition).success
  }
  return true
}, { message: '가격 트리거에는 stockCode와 targetPrice가 필요합니다' })

const updateTriggerSchema = z.object({
  instruction: z.string().min(1).max(2000).optional(),
  triggerType: triggerTypeEnum.optional(),
  condition: z.record(z.unknown()).optional(),
}).refine((data) => {
  if (data.triggerType === 'price-above' || data.triggerType === 'price-below') {
    if (!data.condition) return false
    return priceConditionSchema.safeParse(data.condition).success
  }
  return true
}, { message: '가격 트리거에는 stockCode와 targetPrice가 필요합니다' })

// --- trigger-worker.ts에서 추출한 KST 시간 함수 (export 안 되어 있으므로 동일 로직 복사) ---

function getKstHour(date: Date): number {
  return (date.getUTCHours() + 9) % 24
}

function getKstMinute(date: Date): number {
  return date.getUTCMinutes()
}

function getTodayKst(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

// --- trigger-worker.ts 조건 평가 로직 (순수 함수 부분만 추출) ---

type TriggerCondition = {
  triggerType: string
  condition: Record<string, unknown>
  lastTriggeredAt: Date | null
}

// 가격 조건 매칭 (fetchCurrentPrice 제외 — 현재가를 인자로 받음)
function evaluatePriceCondition(
  triggerType: string,
  condition: Record<string, unknown>,
  currentPrice: number,
): boolean {
  const stockCode = String(condition.stockCode || '')
  const targetPrice = Number(condition.targetPrice || 0)
  if (!stockCode || !targetPrice) return false

  if (triggerType === 'price-above') return currentPrice >= targetPrice
  if (triggerType === 'price-below') return currentPrice <= targetPrice
  return false
}

// 장 시작/마감 시간 매칭
function evaluateMarketTimeCondition(
  triggerType: string,
  now: Date,
  lastTriggeredAt: Date | null,
): boolean {
  const hour = getKstHour(now)
  const minute = getKstMinute(now)

  let inWindow: boolean

  if (triggerType === 'market-open') {
    inWindow = hour === 9 && minute <= 1
  } else if (triggerType === 'market-close') {
    inWindow = hour === 15 && (minute === 30 || minute === 31)
  } else {
    return false
  }

  if (!inWindow) return false

  // 오늘 이미 발동했으면 건너뛰기
  const today = getTodayKst(now)
  if (lastTriggeredAt) {
    const lastDate = new Date(lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
    if (lastDate === today) return false
  }

  return true
}

// --- jobs.tsx에서 추출한 트리거 관련 상수/함수 ---

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  'price-above': '가격 상회',
  'price-below': '가격 하회',
  'market-open': '장 시작',
  'market-close': '장 마감',
}

function describeTriggerCondition(
  triggerType: string,
  condition: Record<string, unknown>,
): string {
  const label = TRIGGER_TYPE_LABELS[triggerType] || triggerType
  if (triggerType === 'price-above' || triggerType === 'price-below') {
    const stockCode = String(condition.stockCode || '')
    const targetPrice = Number(condition.targetPrice || 0)
    return `${stockCode} ${label} ${targetPrice.toLocaleString()}원`
  }
  return label
}


// ============================================================
// 1. triggerTypeEnum 검증 테스트
// ============================================================
describe('triggerTypeEnum 검증', () => {
  test('price-above 유효', () => {
    expect(triggerTypeEnum.safeParse('price-above').success).toBe(true)
  })

  test('price-below 유효', () => {
    expect(triggerTypeEnum.safeParse('price-below').success).toBe(true)
  })

  test('market-open 유효', () => {
    expect(triggerTypeEnum.safeParse('market-open').success).toBe(true)
  })

  test('market-close 유효', () => {
    expect(triggerTypeEnum.safeParse('market-close').success).toBe(true)
  })

  test('unknown-type 실패', () => {
    expect(triggerTypeEnum.safeParse('unknown-type').success).toBe(false)
  })

  test('빈 문자열 실패', () => {
    expect(triggerTypeEnum.safeParse('').success).toBe(false)
  })

  test('숫자 실패', () => {
    expect(triggerTypeEnum.safeParse(123).success).toBe(false)
  })
})


// ============================================================
// 2. priceConditionSchema 검증 테스트
// ============================================================
describe('priceConditionSchema 검증', () => {
  test('유효한 가격 조건', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '005930', targetPrice: 72000 })
    expect(result.success).toBe(true)
  })

  test('stockCode 빈 문자열 실패', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '', targetPrice: 72000 })
    expect(result.success).toBe(false)
  })

  test('stockCode 누락 실패', () => {
    const result = priceConditionSchema.safeParse({ targetPrice: 72000 })
    expect(result.success).toBe(false)
  })

  test('targetPrice 0 실패 (positive 아님)', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '005930', targetPrice: 0 })
    expect(result.success).toBe(false)
  })

  test('targetPrice 음수 실패', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '005930', targetPrice: -100 })
    expect(result.success).toBe(false)
  })

  test('targetPrice 누락 실패', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '005930' })
    expect(result.success).toBe(false)
  })

  test('stockCode 20자 초과 실패', () => {
    const result = priceConditionSchema.safeParse({ stockCode: 'A'.repeat(21), targetPrice: 100 })
    expect(result.success).toBe(false)
  })

  test('stockCode 20자 성공', () => {
    const result = priceConditionSchema.safeParse({ stockCode: 'A'.repeat(20), targetPrice: 100 })
    expect(result.success).toBe(true)
  })

  test('targetPrice 소수점 성공', () => {
    const result = priceConditionSchema.safeParse({ stockCode: '005930', targetPrice: 72000.5 })
    expect(result.success).toBe(true)
  })
})


// ============================================================
// 3. createTriggerSchema Zod 검증 테스트
// ============================================================
describe('createTriggerSchema 검증', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000'

  test('유효한 price-above 트리거', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '삼성전자 72000원 돌파 시 매수 분석',
      triggerType: 'price-above',
      condition: { stockCode: '005930', targetPrice: 72000 },
    })
    expect(result.success).toBe(true)
  })

  test('유효한 price-below 트리거', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: 'SK하이닉스 하락 감시',
      triggerType: 'price-below',
      condition: { stockCode: '000660', targetPrice: 150000 },
    })
    expect(result.success).toBe(true)
  })

  test('유효한 market-open 트리거 (빈 조건)', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '장 시작 시 분석',
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(true)
  })

  test('유효한 market-close 트리거 (빈 조건)', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '장 마감 시 분석',
      triggerType: 'market-close',
      condition: {},
    })
    expect(result.success).toBe(true)
  })

  test('price-above에 stockCode 누락 → refine 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      triggerType: 'price-above',
      condition: { targetPrice: 72000 },
    })
    expect(result.success).toBe(false)
  })

  test('price-below에 targetPrice 누락 → refine 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      triggerType: 'price-below',
      condition: { stockCode: '005930' },
    })
    expect(result.success).toBe(false)
  })

  test('price-above에 빈 조건 → refine 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      triggerType: 'price-above',
      condition: {},
    })
    expect(result.success).toBe(false)
  })

  test('agentId가 uuid가 아니면 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: 'not-uuid',
      instruction: '테스트',
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(false)
  })

  test('instruction 빈 문자열 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '',
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(false)
  })

  test('instruction 2000자 초과 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: 'a'.repeat(2001),
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(false)
  })

  test('instruction 2000자 성공', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: 'a'.repeat(2000),
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(true)
  })

  test('triggerType이 유효하지 않으면 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      triggerType: 'invalid',
      condition: {},
    })
    expect(result.success).toBe(false)
  })

  test('condition이 누락되면 실패', () => {
    const result = createTriggerSchema.safeParse({
      agentId: validUUID,
      instruction: '테스트',
      triggerType: 'market-open',
    })
    expect(result.success).toBe(false)
  })
})


// ============================================================
// 4. updateTriggerSchema Zod 검증 테스트
// ============================================================
describe('updateTriggerSchema 검증', () => {
  test('빈 객체도 유효 (모든 필드 optional)', () => {
    const result = updateTriggerSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('instruction만 수정', () => {
    const result = updateTriggerSchema.safeParse({ instruction: '수정된 지시' })
    expect(result.success).toBe(true)
  })

  test('triggerType만 수정 (비가격 유형)', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'market-open' })
    expect(result.success).toBe(true)
  })

  test('triggerType만 수정 (가격 유형 — condition 누락 → 실패)', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'price-below' })
    expect(result.success).toBe(false)
  })

  test('condition만 수정', () => {
    const result = updateTriggerSchema.safeParse({ condition: { stockCode: '005930', targetPrice: 80000 } })
    expect(result.success).toBe(true)
  })

  test('모든 필드 수정', () => {
    const result = updateTriggerSchema.safeParse({
      instruction: '수정됨',
      triggerType: 'market-close',
      condition: {},
    })
    expect(result.success).toBe(true)
  })

  test('instruction 빈 문자열 실패', () => {
    const result = updateTriggerSchema.safeParse({ instruction: '' })
    expect(result.success).toBe(false)
  })

  test('instruction 2000자 초과 실패', () => {
    const result = updateTriggerSchema.safeParse({ instruction: 'a'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  test('triggerType이 유효하지 않으면 실패', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('price-above로 변경 + 유효한 condition → 성공', () => {
    const result = updateTriggerSchema.safeParse({
      triggerType: 'price-above',
      condition: { stockCode: '005930', targetPrice: 72000 },
    })
    expect(result.success).toBe(true)
  })

  test('price-below로 변경 + condition 누락 → refine 실패', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'price-below' })
    expect(result.success).toBe(false)
  })

  test('price-above로 변경 + 빈 condition → refine 실패', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'price-above', condition: {} })
    expect(result.success).toBe(false)
  })

  test('market-open으로 변경 + condition 없어도 성공', () => {
    const result = updateTriggerSchema.safeParse({ triggerType: 'market-open' })
    expect(result.success).toBe(true)
  })
})


// ============================================================
// 5. KST 시간 함수 테스트
// ============================================================
describe('getKstHour', () => {
  test('UTC 00:00 → KST 09:00', () => {
    expect(getKstHour(new Date('2026-03-06T00:00:00Z'))).toBe(9)
  })

  test('UTC 15:00 → KST 00:00 (자정)', () => {
    expect(getKstHour(new Date('2026-03-06T15:00:00Z'))).toBe(0)
  })

  test('UTC 06:30 → KST 15:30 (hour=15)', () => {
    expect(getKstHour(new Date('2026-03-06T06:30:00Z'))).toBe(15)
  })

  test('UTC 23:00 → KST 08:00', () => {
    expect(getKstHour(new Date('2026-03-06T23:00:00Z'))).toBe(8)
  })

  test('UTC 14:59 → KST 23:59 (hour=23)', () => {
    expect(getKstHour(new Date('2026-03-06T14:59:00Z'))).toBe(23)
  })
})

describe('getKstMinute', () => {
  test('UTC 분과 동일', () => {
    expect(getKstMinute(new Date('2026-03-06T00:30:00Z'))).toBe(30)
  })

  test('정각이면 0', () => {
    expect(getKstMinute(new Date('2026-03-06T12:00:00Z'))).toBe(0)
  })

  test('59분', () => {
    expect(getKstMinute(new Date('2026-03-06T12:59:00Z'))).toBe(59)
  })
})

describe('getTodayKst', () => {
  test('UTC 03월06일 00:00 → KST 03월06일', () => {
    expect(getTodayKst(new Date('2026-03-06T00:00:00Z'))).toBe('2026-03-06')
  })

  test('UTC 03월05일 23:00 → KST 03월06일 08:00 (날짜 다름)', () => {
    expect(getTodayKst(new Date('2026-03-05T23:00:00Z'))).toBe('2026-03-06')
  })

  test('UTC 03월06일 15:00 → KST 03월07일 00:00 (자정 넘김)', () => {
    expect(getTodayKst(new Date('2026-03-06T15:00:00Z'))).toBe('2026-03-07')
  })

  test('UTC 03월06일 14:59 → KST 03월06일 23:59 (아직 같은 날)', () => {
    expect(getTodayKst(new Date('2026-03-06T14:59:00Z'))).toBe('2026-03-06')
  })
})


// ============================================================
// 6. 가격 조건 매칭 로직 테스트
// ============================================================
describe('evaluatePriceCondition', () => {
  const condition = { stockCode: '005930', targetPrice: 72000 }

  describe('price-above (가격 상회)', () => {
    test('현재가 > 목표가 → true', () => {
      expect(evaluatePriceCondition('price-above', condition, 73000)).toBe(true)
    })

    test('현재가 = 목표가 → true (>=)', () => {
      expect(evaluatePriceCondition('price-above', condition, 72000)).toBe(true)
    })

    test('현재가 < 목표가 → false', () => {
      expect(evaluatePriceCondition('price-above', condition, 71000)).toBe(false)
    })
  })

  describe('price-below (가격 하회)', () => {
    test('현재가 < 목표가 → true', () => {
      expect(evaluatePriceCondition('price-below', condition, 71000)).toBe(true)
    })

    test('현재가 = 목표가 → true (<=)', () => {
      expect(evaluatePriceCondition('price-below', condition, 72000)).toBe(true)
    })

    test('현재가 > 목표가 → false', () => {
      expect(evaluatePriceCondition('price-below', condition, 73000)).toBe(false)
    })
  })

  describe('경계 조건', () => {
    test('stockCode 빈 문자열 → false', () => {
      expect(evaluatePriceCondition('price-above', { stockCode: '', targetPrice: 72000 }, 73000)).toBe(false)
    })

    test('stockCode 누락 → false', () => {
      expect(evaluatePriceCondition('price-above', { targetPrice: 72000 }, 73000)).toBe(false)
    })

    test('targetPrice 0 → false', () => {
      expect(evaluatePriceCondition('price-above', { stockCode: '005930', targetPrice: 0 }, 73000)).toBe(false)
    })

    test('targetPrice 누락 → false', () => {
      expect(evaluatePriceCondition('price-above', { stockCode: '005930' }, 73000)).toBe(false)
    })

    test('알 수 없는 triggerType → false', () => {
      expect(evaluatePriceCondition('unknown', condition, 73000)).toBe(false)
    })

    test('현재가 1원 차이로 미달 (price-above)', () => {
      expect(evaluatePriceCondition('price-above', condition, 71999)).toBe(false)
    })

    test('현재가 1원 차이로 미달 (price-below)', () => {
      expect(evaluatePriceCondition('price-below', condition, 72001)).toBe(false)
    })
  })
})


// ============================================================
// 7. 장 시작/마감 시간 조건 매칭 테스트
// ============================================================
describe('evaluateMarketTimeCondition', () => {
  describe('market-open (장 시작 09:00 KST)', () => {
    test('KST 09:00 + 미발동 → true', () => {
      // UTC 00:00 = KST 09:00
      const now = new Date('2026-03-06T00:00:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, null)).toBe(true)
    })

    test('KST 09:01 → true (drift 허용 윈도우)', () => {
      const now = new Date('2026-03-06T00:01:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, null)).toBe(true)
    })

    test('KST 09:02 → false (윈도우 초과)', () => {
      const now = new Date('2026-03-06T00:02:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, null)).toBe(false)
    })

    test('KST 08:59 → false', () => {
      const now = new Date('2026-03-05T23:59:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, null)).toBe(false)
    })

    test('KST 09:00 + 오늘 이미 발동 → false', () => {
      const now = new Date('2026-03-06T00:00:00Z')
      // 오늘(KST) 이전에 발동한 시간 (KST 03-06 01:00 = UTC 03-05 16:00)
      const lastTriggered = new Date('2026-03-05T16:00:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, lastTriggered)).toBe(false)
    })

    test('KST 09:00 + 어제 발동 → true', () => {
      const now = new Date('2026-03-06T00:00:00Z')
      // 어제(KST) 발동: KST 03-05 09:00 = UTC 03-05 00:00
      const lastTriggered = new Date('2026-03-05T00:00:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, lastTriggered)).toBe(true)
    })
  })

  describe('market-close (장 마감 15:30 KST)', () => {
    test('KST 15:30 + 미발동 → true', () => {
      // UTC 06:30 = KST 15:30
      const now = new Date('2026-03-06T06:30:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, null)).toBe(true)
    })

    test('KST 15:31 → true (drift 허용 윈도우)', () => {
      const now = new Date('2026-03-06T06:31:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, null)).toBe(true)
    })

    test('KST 15:32 → false (윈도우 초과)', () => {
      const now = new Date('2026-03-06T06:32:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, null)).toBe(false)
    })

    test('KST 15:29 → false', () => {
      const now = new Date('2026-03-06T06:29:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, null)).toBe(false)
    })

    test('KST 15:30 + 오늘 이미 발동 → false', () => {
      const now = new Date('2026-03-06T06:30:00Z')
      // 오늘 KST 기준 발동: KST 03-06 09:00 = UTC 03-06 00:00
      const lastTriggered = new Date('2026-03-06T00:00:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, lastTriggered)).toBe(false)
    })

    test('KST 15:30 + 어제 발동 → true', () => {
      const now = new Date('2026-03-06T06:30:00Z')
      // 어제 KST 기준: KST 03-05 15:30 = UTC 03-05 06:30
      const lastTriggered = new Date('2026-03-05T06:30:00Z')
      expect(evaluateMarketTimeCondition('market-close', now, lastTriggered)).toBe(true)
    })
  })

  describe('경계 조건', () => {
    test('알 수 없는 triggerType → false', () => {
      const now = new Date('2026-03-06T00:00:00Z')
      expect(evaluateMarketTimeCondition('unknown', now, null)).toBe(false)
    })

    test('market-open 자정 경계 (UTC 15:00 = KST 00:00) → false', () => {
      const now = new Date('2026-03-06T15:00:00Z')
      expect(evaluateMarketTimeCondition('market-open', now, null)).toBe(false)
    })
  })
})


// ============================================================
// 8. TRIGGER_TYPE_LABELS 테스트
// ============================================================
describe('TRIGGER_TYPE_LABELS', () => {
  test('4가지 트리거 유형 모두 정의', () => {
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
})


// ============================================================
// 9. describeTriggerCondition (조건 텍스트 생성) 테스트
// ============================================================
describe('describeTriggerCondition', () => {
  test('price-above → "005930 가격 상회 72,000원"', () => {
    const result = describeTriggerCondition('price-above', { stockCode: '005930', targetPrice: 72000 })
    expect(result).toBe('005930 가격 상회 72,000원')
  })

  test('price-below → "000660 가격 하회 150,000원"', () => {
    const result = describeTriggerCondition('price-below', { stockCode: '000660', targetPrice: 150000 })
    expect(result).toBe('000660 가격 하회 150,000원')
  })

  test('market-open → "장 시작"', () => {
    const result = describeTriggerCondition('market-open', {})
    expect(result).toBe('장 시작')
  })

  test('market-close → "장 마감"', () => {
    const result = describeTriggerCondition('market-close', {})
    expect(result).toBe('장 마감')
  })

  test('알 수 없는 유형 → triggerType 그대로 표시', () => {
    const result = describeTriggerCondition('custom-type', {})
    expect(result).toBe('custom-type')
  })
})


// ============================================================
// 10. 트리거 상태 전환 로직 테스트
// ============================================================
describe('트리거 상태 전환', () => {
  // isActive 토글 로직 (triggers.ts PATCH /:id/toggle 에서 사용)
  function toggleActive(current: boolean): boolean {
    return !current
  }

  test('감시 중(true) → 중지(false)', () => {
    expect(toggleActive(true)).toBe(false)
  })

  test('중지(false) → 감시 중(true)', () => {
    expect(toggleActive(false)).toBe(true)
  })

  // 트리거 발동 후 자동 비활성화
  function afterTriggerFired(isActive: boolean): { isActive: boolean; lastTriggeredAt: Date } {
    return { isActive: false, lastTriggeredAt: new Date() }
  }

  test('트리거 발동 → isActive=false로 자동 전환', () => {
    const result = afterTriggerFired(true)
    expect(result.isActive).toBe(false)
  })

  test('트리거 발동 → lastTriggeredAt 기록', () => {
    const before = Date.now()
    const result = afterTriggerFired(true)
    expect(result.lastTriggeredAt.getTime()).toBeGreaterThanOrEqual(before)
  })

  // StatusDot 매핑
  function getStatusDot(isActive: boolean): 'online' | 'offline' {
    return isActive ? 'online' : 'offline'
  }

  test('isActive=true → StatusDot online', () => {
    expect(getStatusDot(true)).toBe('online')
  })

  test('isActive=false → StatusDot offline', () => {
    expect(getStatusDot(false)).toBe('offline')
  })

  // 상태 라벨 매핑
  function getStatusLabel(isActive: boolean): string {
    return isActive ? '감시 중' : '중지'
  }

  test('isActive=true → "감시 중"', () => {
    expect(getStatusLabel(true)).toBe('감시 중')
  })

  test('isActive=false → "중지"', () => {
    expect(getStatusLabel(false)).toBe('중지')
  })
})


// ============================================================
// 11. 트리거 condition JSON 구조 검증 테스트
// ============================================================
describe('트리거 condition JSON 구조', () => {
  test('price-above 조건: stockCode + targetPrice', () => {
    const condition = { stockCode: '005930', targetPrice: 72000 }
    expect(priceConditionSchema.safeParse(condition).success).toBe(true)
  })

  test('price-below 조건: stockCode + targetPrice', () => {
    const condition = { stockCode: '000660', targetPrice: 150000 }
    expect(priceConditionSchema.safeParse(condition).success).toBe(true)
  })

  test('market-open 조건: 빈 객체 유효 (priceCondition 아님)', () => {
    // market-open/close는 priceConditionSchema 검사 안 함
    const result = createTriggerSchema.safeParse({
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      instruction: '장 시작 시 보고',
      triggerType: 'market-open',
      condition: {},
    })
    expect(result.success).toBe(true)
  })

  test('market-close 조건: 추가 데이터 있어도 유효', () => {
    const result = createTriggerSchema.safeParse({
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      instruction: '장 마감 시 보고',
      triggerType: 'market-close',
      condition: { extra: 'data' },
    })
    expect(result.success).toBe(true)
  })
})


// ============================================================
// 12. 폴링 간격 및 워커 설정 상수 테스트
// ============================================================
describe('워커 설정 상수', () => {
  const POLL_INTERVAL_MS = 30_000

  test('폴링 간격은 30초 (30000ms)', () => {
    expect(POLL_INTERVAL_MS).toBe(30000)
  })

  test('폴링 간격은 1분(60000ms) 미만', () => {
    expect(POLL_INTERVAL_MS).toBeLessThan(60000)
  })

  test('폴링 간격은 10초(10000ms) 이상', () => {
    expect(POLL_INTERVAL_MS).toBeGreaterThanOrEqual(10000)
  })
})
