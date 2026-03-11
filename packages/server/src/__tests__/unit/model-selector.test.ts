import { describe, test, expect } from 'bun:test'
import { selectModel } from '../../engine/model-selector'

describe('model-selector (E6)', () => {
  test('manager → claude-sonnet-4-6', () => {
    expect(selectModel('manager')).toBe('claude-sonnet-4-6')
  })

  test('specialist → claude-sonnet-4-6', () => {
    expect(selectModel('specialist')).toBe('claude-sonnet-4-6')
  })

  test('worker → claude-haiku-4-5', () => {
    expect(selectModel('worker')).toBe('claude-haiku-4-5')
  })

  test('unknown tier → claude-haiku-4-5 (default)', () => {
    expect(selectModel('executive')).toBe('claude-haiku-4-5')
  })

  test('empty string tier → claude-haiku-4-5 (default)', () => {
    expect(selectModel('')).toBe('claude-haiku-4-5')
  })

  // === TEA Risk-Based Tests ===

  test('TEA P1: all returned models are valid Claude model IDs', () => {
    const validModels = ['claude-sonnet-4-6', 'claude-haiku-4-5']
    for (const tier of ['manager', 'specialist', 'worker', '', 'unknown']) {
      expect(validModels).toContain(selectModel(tier))
    }
  })

  test('TEA P1: case-sensitive — uppercase tier returns default', () => {
    expect(selectModel('Manager')).toBe('claude-haiku-4-5')
    expect(selectModel('WORKER')).toBe('claude-haiku-4-5')
  })

  test('TEA P2: returns string type, not undefined or null', () => {
    const result = selectModel('nonexistent')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
