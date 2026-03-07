/**
 * cost-tracker.ts unit tests -- cost calculation logic
 * Now uses models.yaml for pricing instead of hardcoded values
 * bun test src/__tests__/unit/cost-tracker.test.ts
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
  test('claude-sonnet-4-6: 1000 input + 500 output', () => {
    // input: (1000/1M) * 3 * 1M = 3000 micro
    // output: (500/1M) * 15 * 1M = 7500 micro
    // total: 10500 micro
    const cost = calculateCostMicro('claude-sonnet-4-6', 1000, 500)
    expect(cost).toBe(10500)
  })

  test('claude-haiku-4-5: 1000 input + 500 output', () => {
    // input: (1000/1M) * 0.8 * 1M = 800 micro
    // output: (500/1M) * 4 * 1M = 2000 micro
    // total: 2800 micro
    const cost = calculateCostMicro('claude-haiku-4-5', 1000, 500)
    expect(cost).toBe(2800)
  })

  test('gpt-4.1: 1000 input + 500 output', () => {
    // input: (1000/1M) * 2.5 * 1M = 2500 micro
    // output: (500/1M) * 10 * 1M = 5000 micro
    // total: 7500 micro
    const cost = calculateCostMicro('gpt-4.1', 1000, 500)
    expect(cost).toBe(7500)
  })

  test('unknown model uses default pricing (sonnet-level)', () => {
    const cost = calculateCostMicro('unknown-model', 1000, 500)
    expect(cost).toBe(10500) // default = sonnet pricing: 3/15
  })

  test('0 tokens = 0 cost', () => {
    const cost = calculateCostMicro('claude-sonnet-4-6', 0, 0)
    expect(cost).toBe(0)
  })
})
