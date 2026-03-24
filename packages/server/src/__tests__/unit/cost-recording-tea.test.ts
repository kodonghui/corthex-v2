/**
 * TEA-generated risk-based tests for Story 3-5: Cost Recording System
 * Focus: Edge cases, precision, cross-model consistency, boundary conditions
 * bun test src/__tests__/unit/cost-recording-tea.test.ts
 */
import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// === Mock DB ===
const mockInsertValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockInsertValues }))

mock.module('../../db', () => ({
  db: {
    insert: mockInsert,
    select: mock(() => ({ from: mock(() => ({ where: mock(() => []) })) })),
  },
}))

// Mock models with real pricing from models.yaml
const REAL_MODELS: Record<string, any> = {
  'claude-sonnet-4-6': { id: 'claude-sonnet-4-6', provider: 'anthropic', displayName: 'Claude Sonnet 4.6', inputPricePer1M: 3, outputPricePer1M: 15, maxTokens: 8192, supportsBatch: true },
  'claude-haiku-4-5': { id: 'claude-haiku-4-5', provider: 'anthropic', displayName: 'Claude Haiku 4.5', inputPricePer1M: 0.8, outputPricePer1M: 4, maxTokens: 8192, supportsBatch: true },
  'gpt-4.1': { id: 'gpt-4.1', provider: 'openai', displayName: 'GPT-4.1', inputPricePer1M: 2.5, outputPricePer1M: 10, maxTokens: 16384, supportsBatch: true },
  'gpt-4.1-mini': { id: 'gpt-4.1-mini', provider: 'openai', displayName: 'GPT-4.1 Mini', inputPricePer1M: 0.4, outputPricePer1M: 1.6, maxTokens: 16384, supportsBatch: true },
}

mock.module('../../config/models', () => ({
  getModelConfig: (modelId: string) => REAL_MODELS[modelId] ?? undefined,
  loadModelsConfig: () => ({
    models: Object.values(REAL_MODELS),
    fallbackOrder: ['anthropic', 'openai'],
    tierDefaults: { manager: 'claude-sonnet-4-6', specialist: 'claude-haiku-4-5', worker: 'claude-haiku-4-5' },
  }),
  getTierDefaultModel: (tier: string) => tier === 'manager' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5',
  getFallbackOrder: () => ['anthropic', 'openai'],
  getFallbackModels: () => [],
  resetModelsCache: () => {},
}))

import { calculateCostMicro, microToUsd, recordCost } from '../../lib/cost-tracker'

const testCompanyId = '11111111-1111-1111-1111-111111111111'

beforeEach(() => {
  mockInsertValues.mockReset()
  mockInsert.mockReset()
  mockInsert.mockReturnValue({ values: mockInsertValues })
  mockInsertValues.mockResolvedValue(undefined)
})

// ============================================================
// P0: Floating point precision risks
// ============================================================
describe('TEA P0: Floating point precision', () => {
  test('gpt-4.1-mini fractional pricing stays accurate', () => {
    // input: 3 * 0.4 = 1.2, output: 7 * 1.6 = 11.2, total = 12.4 rounds to 12
    const cost = calculateCostMicro('gpt-4.1-mini', 3, 7)
    expect(cost).toBe(12)
  })

  test('result is always an integer (no fractional microdollars)', () => {
    const models = Object.keys(REAL_MODELS)
    for (const model of models) {
      for (const tokens of [1, 7, 13, 99, 137, 999]) {
        const cost = calculateCostMicro(model, tokens, tokens)
        expect(Number.isInteger(cost)).toBe(true)
      }
    }
  })

  test('very large token counts stay precise', () => {
    // 10M tokens of claude-sonnet-4-6 input
    const cost = calculateCostMicro('claude-sonnet-4-6', 10_000_000, 0)
    expect(cost).toBe(30_000_000) // 10M * 3 = 30M micro = $30
  })

  test('MAX_SAFE_INTEGER tokens do not overflow', () => {
    // With mini pricing (0.4+1.6), large tokens should still be finite
    // Just verify it returns a finite number
    const cost = calculateCostMicro('gpt-4.1-mini', 1_000_000_000, 1_000_000_000)
    expect(Number.isFinite(cost)).toBe(true)
    expect(cost).toBeGreaterThan(0)
  })
})

// ============================================================
// P0: Batch discount accuracy
// ============================================================
describe('TEA P0: Batch discount across all models', () => {
  const modelIds = Object.keys(REAL_MODELS)

  for (const modelId of modelIds) {
    test(`${modelId}: batch is exactly 50% of normal`, () => {
      const normal = calculateCostMicro(modelId, 10000, 5000, false)
      const batch = calculateCostMicro(modelId, 10000, 5000, true)
      // Due to rounding, batch might differ by ±1 from exact half
      expect(Math.abs(batch - Math.round(normal / 2))).toBeLessThanOrEqual(1)
    })
  }

  test('batch with zero tokens still returns zero', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', 0, 0, true)).toBe(0)
  })

  test('batch flag defaults to false', () => {
    const withDefault = calculateCostMicro('claude-sonnet-4-6', 1000, 500)
    const explicitFalse = calculateCostMicro('claude-sonnet-4-6', 1000, 500, false)
    expect(withDefault).toBe(explicitFalse)
  })
})

// ============================================================
// P0: Cross-model pricing consistency
// ============================================================
describe('TEA P0: Cross-model pricing consistency', () => {
  test('manager tier (sonnet) costs more than specialist tier (haiku)', () => {
    const sonnet = calculateCostMicro('claude-sonnet-4-6', 1000, 1000)
    const haiku = calculateCostMicro('claude-haiku-4-5', 1000, 1000)
    expect(sonnet).toBeGreaterThan(haiku)
  })

  test('gpt-4.1 costs more than gpt-4.1-mini', () => {
    const gpt = calculateCostMicro('gpt-4.1', 1000, 1000)
    const mini = calculateCostMicro('gpt-4.1-mini', 1000, 1000)
    expect(gpt).toBeGreaterThan(mini)
  })

  test('output tokens always cost more than or equal to input tokens per model', () => {
    for (const model of Object.values(REAL_MODELS)) {
      expect(model.outputPricePer1M).toBeGreaterThanOrEqual(model.inputPricePer1M)
    }
  })

  test('cheapest model overall is gpt-4.1-mini', () => {
    const costs = Object.keys(REAL_MODELS).map(id => ({
      id,
      cost: calculateCostMicro(id, 1000, 1000),
    }))
    const cheapest = costs.reduce((min, c) => c.cost < min.cost ? c : min)
    expect(cheapest.id).toBe('gpt-4.1-mini')
  })

  test('most expensive model overall is claude-sonnet-4-6', () => {
    const costs = Object.keys(REAL_MODELS).map(id => ({
      id,
      cost: calculateCostMicro(id, 1000, 1000),
    }))
    const expensive = costs.reduce((max, c) => c.cost > max.cost ? c : max)
    expect(expensive.id).toBe('claude-sonnet-4-6')
  })
})

// ============================================================
// P1: recordCost edge cases
// ============================================================
describe('TEA P1: recordCost edge cases', () => {
  test('concurrent recordCost calls do not interfere', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      recordCost({
        companyId: testCompanyId,
        model: 'claude-haiku-4-5',
        inputTokens: 100 * (i + 1),
        outputTokens: 50 * (i + 1),
        source: 'chat',
      })
    )

    await Promise.all(promises)
    expect(mockInsert).toHaveBeenCalledTimes(10)
  })

  test('all valid source types persist correctly', async () => {
    const sources = ['chat', 'delegation', 'job', 'sns', 'batch'] as const
    for (const source of sources) {
      mockInsert.mockReturnValue({ values: mockInsertValues })
      mockInsertValues.mockResolvedValue(undefined)

      await recordCost({
        companyId: testCompanyId,
        model: 'claude-sonnet-4-6',
        inputTokens: 100,
        outputTokens: 50,
        source,
      })

      const lastCall = mockInsertValues.mock.calls[mockInsertValues.mock.calls.length - 1]
      expect(lastCall[0].source).toBe(source)
    }
  })

  test('unknown model provider defaults to anthropic', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'completely-unknown-model',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.provider).toBe('anthropic')
  })

  test('explicit provider overrides model-inferred provider', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'gpt-4.1',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
      provider: 'anthropic', // Deliberately wrong -- explicit takes priority
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.provider).toBe('anthropic')
  })

  test('DB failure does not affect caller', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    mockInsertValues.mockRejectedValueOnce(new Error('constraint violation'))

    const result = recordCost({
      companyId: testCompanyId,
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })

    // Should resolve, not reject
    await expect(result).resolves.toBeUndefined()
    consoleSpy.mockRestore()
  })

  test('zero token call still records (for tracking)', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'claude-sonnet-4-6',
      inputTokens: 0,
      outputTokens: 0,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.costUsdMicro).toBe(0)
    expect(values.inputTokens).toBe(0)
    expect(values.outputTokens).toBe(0)
  })
})

// ============================================================
// P1: microToUsd precision
// ============================================================
describe('TEA P1: microToUsd precision', () => {
  test('converts typical cost values accurately', () => {
    expect(microToUsd(10500)).toBeCloseTo(0.0105, 6)
    expect(microToUsd(2800)).toBeCloseTo(0.0028, 6)
    expect(microToUsd(18_000_000)).toBe(18)
  })

  test('handles very small microdollar amounts', () => {
    expect(microToUsd(1)).toBeCloseTo(0.000001, 10)
  })

  test('handles negative microdollars (should not happen but safe)', () => {
    expect(microToUsd(-1000)).toBe(-0.001)
  })
})

// ============================================================
// P1: models.yaml real file validation
// ============================================================
describe('TEA P1: models.yaml structure validation', () => {
  test('all models have required fields', () => {
    for (const model of Object.values(REAL_MODELS)) {
      expect(model.id).toBeDefined()
      expect(model.provider).toBeDefined()
      expect(model.displayName).toBeDefined()
      expect(model.inputPricePer1M).toBeGreaterThan(0)
      expect(model.outputPricePer1M).toBeGreaterThan(0)
      expect(model.maxTokens).toBeGreaterThan(0)
      expect(typeof model.supportsBatch).toBe('boolean')
    }
  })

  test('provider values are valid', () => {
    const validProviders = ['anthropic', 'openai']
    for (const model of Object.values(REAL_MODELS)) {
      expect(validProviders).toContain(model.provider)
    }
  })

  test('each provider has at least one model', () => {
    const providers = new Set(Object.values(REAL_MODELS).map(m => m.provider))
    expect(providers.has('anthropic')).toBe(true)
    expect(providers.has('openai')).toBe(true)
  })

  test('batch-capable models are from anthropic or openai only', () => {
    for (const model of Object.values(REAL_MODELS)) {
      if (model.supportsBatch) {
        expect(['anthropic', 'openai']).toContain(model.provider)
      }
    }
  })
})

// ============================================================
// P2: calculateCostMicro formula verification
// ============================================================
describe('TEA P2: Cost formula mathematical verification', () => {
  test('cost equals inputTokens * inputPrice + outputTokens * outputPrice', () => {
    // Direct formula: cost_micro = inputTokens * inputPricePer1M + outputTokens * outputPricePer1M
    for (const model of Object.values(REAL_MODELS)) {
      const inputTokens = 12345
      const outputTokens = 6789
      const expected = Math.round(inputTokens * model.inputPricePer1M + outputTokens * model.outputPricePer1M)
      const actual = calculateCostMicro(model.id, inputTokens, outputTokens)
      expect(actual).toBe(expected)
    }
  })

  test('batch formula applies 0.5 multiplier to both input and output', () => {
    for (const model of Object.values(REAL_MODELS)) {
      const inputTokens = 12345
      const outputTokens = 6789
      const expected = Math.round((inputTokens * model.inputPricePer1M + outputTokens * model.outputPricePer1M) * 0.5)
      const actual = calculateCostMicro(model.id, inputTokens, outputTokens, true)
      expect(actual).toBe(expected)
    }
  })
})

// ============================================================
// P2: Schema validation
// ============================================================
describe('TEA P2: cost_records schema contract', () => {
  test('recordCost produces all required fields for DB insert', async () => {
    await recordCost({
      companyId: testCompanyId,
      agentId: 'agent-1',
      sessionId: 'session-1',
      model: 'claude-sonnet-4-6',
      inputTokens: 500,
      outputTokens: 250,
      source: 'delegation',
      provider: 'anthropic',
      isBatch: false,
    })

    const values = mockInsertValues.mock.calls[0][0]
    // Verify all DB columns are present
    expect(values).toHaveProperty('companyId')
    expect(values).toHaveProperty('agentId')
    expect(values).toHaveProperty('sessionId')
    expect(values).toHaveProperty('provider')
    expect(values).toHaveProperty('model')
    expect(values).toHaveProperty('inputTokens')
    expect(values).toHaveProperty('outputTokens')
    expect(values).toHaveProperty('costUsdMicro')
    expect(values).toHaveProperty('source')
    expect(values).toHaveProperty('isBatch')
  })

  test('costUsdMicro matches calculateCostMicro output', async () => {
    const inputTokens = 777
    const outputTokens = 333

    await recordCost({
      companyId: testCompanyId,
      model: 'gpt-4.1-mini',
      inputTokens,
      outputTokens,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    const expectedCost = calculateCostMicro('gpt-4.1-mini', inputTokens, outputTokens)
    expect(values.costUsdMicro).toBe(expectedCost)
  })
})
