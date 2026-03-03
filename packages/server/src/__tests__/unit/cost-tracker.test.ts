/**
 * cost-tracker.ts 유닛 테스트 — 비용 계산 로직
 * 서버 없이 실행 가능: bun test src/__tests__/unit/cost-tracker.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { calculateCostMicro, microToUsd } from '../../lib/cost-tracker'

describe('microToUsd', () => {
  test('1,000,000 micro = $1.00', () => {
    expect(microToUsd(1_000_000)).toBe(1)
  })

  test('0 micro = $0', () => {
    expect(microToUsd(0)).toBe(0)
  })

  test('3,500 micro = $0.0035', () => {
    expect(microToUsd(3_500)).toBe(0.0035)
  })
})

describe('calculateCostMicro', () => {
  test('sonnet-4: 1000 input + 500 output', () => {
    // input: (1000/1M) * 3 * 1M = 3000 micro
    // output: (500/1M) * 15 * 1M = 7500 micro
    // total: 10500 micro
    const cost = calculateCostMicro('claude-sonnet-4-20250514', 1000, 500)
    expect(cost).toBe(10500)
  })

  test('haiku-4.5: 1000 input + 500 output', () => {
    // input: (1000/1M) * 0.8 * 1M = 800 micro
    // output: (500/1M) * 4 * 1M = 2000 micro
    // total: 2800 micro
    const cost = calculateCostMicro('claude-haiku-4-5-20251001', 1000, 500)
    expect(cost).toBe(2800)
  })

  test('opus-4: 1000 input + 500 output', () => {
    // input: (1000/1M) * 15 * 1M = 15000 micro
    // output: (500/1M) * 75 * 1M = 37500 micro
    // total: 52500 micro
    const cost = calculateCostMicro('claude-opus-4-20250515', 1000, 500)
    expect(cost).toBe(52500)
  })

  test('unknown 모델은 기본 가격(sonnet) 적용', () => {
    const cost = calculateCostMicro('unknown-model', 1000, 500)
    expect(cost).toBe(10500) // default = sonnet pricing
  })

  test('0 토큰이면 0 비용', () => {
    const cost = calculateCostMicro('claude-sonnet-4-20250514', 0, 0)
    expect(cost).toBe(0)
  })
})
