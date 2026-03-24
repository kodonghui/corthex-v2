/**
 * Cost Recording System -- comprehensive tests
 * Story 3-5: models.yaml pricing + CostTracker + query helpers + LLM Router integration
 * bun test src/__tests__/unit/cost-recording.test.ts
 */
import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// === Mock DB before importing cost-tracker ===
const mockInsertValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockSelectGroupByOrderBy = mock(() => Promise.resolve([]))
const mockSelectGroupBy = mock(() => ({ orderBy: mockSelectGroupByOrderBy }))
const mockSelectWhereGroupBy = mock(() => mockSelectGroupBy)
const mockSelectWhere = mock(() => ({ groupBy: mockSelectWhereGroupBy }))
const mockInnerJoin2 = mock(() => ({ where: mockSelectWhere }))
const mockInnerJoin = mock(() => ({ innerJoin: mockInnerJoin2 }))
const mockSelectFrom = mock(() => ({
  where: mockSelectWhere,
  innerJoin: mockInnerJoin,
}))
const mockSelect = mock(() => ({ from: mockSelectFrom }))

mock.module('../../db', () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}))

// Mock models.yaml config
mock.module('../../config/models', () => ({
  getModelConfig: (modelId: string) => {
    const configs: Record<string, any> = {
      'claude-sonnet-4-6': { id: 'claude-sonnet-4-6', provider: 'anthropic', displayName: 'Claude Sonnet 4.6', inputPricePer1M: 3, outputPricePer1M: 15, maxTokens: 8192, supportsBatch: true },
      'claude-haiku-4-5': { id: 'claude-haiku-4-5', provider: 'anthropic', displayName: 'Claude Haiku 4.5', inputPricePer1M: 0.8, outputPricePer1M: 4, maxTokens: 8192, supportsBatch: true },
      'gpt-4.1': { id: 'gpt-4.1', provider: 'openai', displayName: 'GPT-4.1', inputPricePer1M: 2.5, outputPricePer1M: 10, maxTokens: 16384, supportsBatch: true },
      'gpt-4.1-mini': { id: 'gpt-4.1-mini', provider: 'openai', displayName: 'GPT-4.1 Mini', inputPricePer1M: 0.4, outputPricePer1M: 1.6, maxTokens: 16384, supportsBatch: true },
    }
    return configs[modelId] ?? undefined
  },
  loadModelsConfig: () => ({
    models: [
      { id: 'claude-sonnet-4-6', provider: 'anthropic', displayName: 'Claude Sonnet 4.6', inputPricePer1M: 3, outputPricePer1M: 15 },
      { id: 'claude-haiku-4-5', provider: 'anthropic', displayName: 'Claude Haiku 4.5', inputPricePer1M: 0.8, outputPricePer1M: 4 },
    ],
    fallbackOrder: ['anthropic', 'openai'],
    tierDefaults: { manager: 'claude-sonnet-4-6', specialist: 'claude-haiku-4-5', worker: 'claude-haiku-4-5' },
  }),
  getTierDefaultModel: (tier: string) => tier === 'manager' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5',
  getFallbackOrder: () => ['anthropic', 'openai'],
  getFallbackModels: () => [],
  resetModelsCache: () => {},
}))

import {
  calculateCostMicro,
  microToUsd,
  recordCost,
  getCostSummary,
  getAgentCostBreakdown,
  getDepartmentCostBreakdown,
  getModelCostBreakdown,
} from '../../lib/cost-tracker'
import type { RecordParams, CostSummary, CostBreakdown, DateRange } from '../../lib/cost-tracker'

// Helper
const testCompanyId = '11111111-1111-1111-1111-111111111111'
const testAgentId = '22222222-2222-2222-2222-222222222222'
const testRange: DateRange = {
  from: new Date('2026-03-01'),
  to: new Date('2026-03-31'),
}

beforeEach(() => {
  mockInsertValues.mockReset()
  mockInsert.mockReset()
  mockInsert.mockReturnValue({ values: mockInsertValues })
  mockInsertValues.mockResolvedValue(undefined)
  mockSelect.mockReset()
  mockSelectFrom.mockReset()
  mockSelectWhere.mockReset()
  mockSelectWhereGroupBy.mockReset()
  mockSelectGroupBy.mockReset()
  mockSelectGroupByOrderBy.mockReset()
})

// ============================================================
// calculateCostMicro
// ============================================================
describe('calculateCostMicro', () => {
  test('claude-sonnet-4-6: 1000 input + 500 output = 10500 micro', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', 1000, 500)).toBe(10500)
  })

  test('claude-haiku-4-5: 1000 input + 500 output = 2800 micro', () => {
    expect(calculateCostMicro('claude-haiku-4-5', 1000, 500)).toBe(2800)
  })

  test('gpt-4.1: 1000 input + 500 output = 7500 micro', () => {
    expect(calculateCostMicro('gpt-4.1', 1000, 500)).toBe(7500)
  })

  test('gpt-4.1-mini: 1000 input + 500 output = 1200 micro', () => {
    // input: 1000 * 0.4 = 400, output: 500 * 1.6 = 800
    expect(calculateCostMicro('gpt-4.1-mini', 1000, 500)).toBe(1200)
  })

  test('unknown model uses DEFAULT_PRICING (sonnet-level: 3/15)', () => {
    expect(calculateCostMicro('unknown-model', 1000, 500)).toBe(10500)
  })

  test('zero tokens = zero cost', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', 0, 0)).toBe(0)
  })

  test('only input tokens', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', 1000, 0)).toBe(3000)
  })

  test('only output tokens', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', 0, 500)).toBe(7500)
  })

  test('negative tokens return 0', () => {
    expect(calculateCostMicro('claude-sonnet-4-6', -100, 500)).toBe(0)
    expect(calculateCostMicro('claude-sonnet-4-6', 100, -500)).toBe(0)
  })

  test('large token counts', () => {
    // 1M input + 1M output for sonnet
    // input: 1M * 3 = 3M micro, output: 1M * 15 = 15M micro
    expect(calculateCostMicro('claude-sonnet-4-6', 1_000_000, 1_000_000)).toBe(18_000_000)
  })

  test('batch mode applies 50% discount', () => {
    const normal = calculateCostMicro('claude-sonnet-4-6', 1000, 500, false)
    const batch = calculateCostMicro('claude-sonnet-4-6', 1000, 500, true)
    expect(normal).toBe(10500)
    expect(batch).toBe(5250) // 50% discount
  })

  test('batch discount applies to all models', () => {
    const normalHaiku = calculateCostMicro('claude-haiku-4-5', 1000, 500, false)
    const batchHaiku = calculateCostMicro('claude-haiku-4-5', 1000, 500, true)
    expect(batchHaiku).toBe(Math.round(normalHaiku / 2))
  })
})

// ============================================================
// microToUsd
// ============================================================
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

  test('10500 micro = $0.0105', () => {
    expect(microToUsd(10500)).toBe(0.0105)
  })
})

// ============================================================
// recordCost
// ============================================================
describe('recordCost', () => {
  test('inserts cost record with correct fields', async () => {
    await recordCost({
      companyId: testCompanyId,
      agentId: testAgentId,
      model: 'claude-sonnet-4-6',
      inputTokens: 1000,
      outputTokens: 500,
      source: 'chat',
      provider: 'anthropic',
    })

    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockInsertValues).toHaveBeenCalledTimes(1)
    const values = mockInsertValues.mock.calls[0][0]
    expect(values.companyId).toBe(testCompanyId)
    expect(values.agentId).toBe(testAgentId)
    expect(values.model).toBe('claude-sonnet-4-6')
    expect(values.inputTokens).toBe(1000)
    expect(values.outputTokens).toBe(500)
    expect(values.costUsdMicro).toBe(10500)
    expect(values.provider).toBe('anthropic')
    expect(values.source).toBe('chat')
    expect(values.isBatch).toBe(false)
  })

  test('isBatch flag persisted when true', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'claude-haiku-4-5',
      inputTokens: 1000,
      outputTokens: 500,
      source: 'batch',
      isBatch: true,
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.isBatch).toBe(true)
    expect(values.costUsdMicro).toBe(1400) // 50% discount on 2800
  })

  test('null agentId allowed (system calls)', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'delegation',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.agentId).toBeUndefined()
    expect(values.provider).toBe('anthropic') // resolved from model config
  })

  test('resolves provider from model config when not provided', async () => {
    await recordCost({
      companyId: testCompanyId,
      model: 'gpt-4.1',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.provider).toBe('openai')
  })

  test('fire-and-forget: DB error swallowed, not thrown', async () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
    mockInsertValues.mockRejectedValueOnce(new Error('DB connection lost'))

    // Should NOT throw
    await recordCost({
      companyId: testCompanyId,
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })

  test('sessionId passed when provided', async () => {
    const sessionId = '33333333-3333-3333-3333-333333333333'
    await recordCost({
      companyId: testCompanyId,
      agentId: testAgentId,
      sessionId,
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.sessionId).toBe(sessionId)
  })
})

// ============================================================
// getCostSummary
// ============================================================
describe('getCostSummary', () => {
  test('returns aggregated totals and by-date breakdown', async () => {
    // First call returns totals
    const totalsResult = [{ totalInputTokens: 5000, totalOutputTokens: 2000, totalCostMicro: 45000, recordCount: 10 }]
    // Second call returns by-date
    const byDateResult = [
      { date: '2026-03-01', costMicro: 20000, recordCount: 4 },
      { date: '2026-03-02', costMicro: 25000, recordCount: 6 },
    ]

    // Setup mock chain for first call (totals)
    let callCount = 0
    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => {
          callCount++
          if (callCount === 1) return totalsResult
          return { groupBy: mock(() => ({ orderBy: mock(() => byDateResult) })) }
        }),
      })),
    }))

    const result = await getCostSummary(testCompanyId, testRange)

    expect(result.totalInputTokens).toBe(5000)
    expect(result.totalOutputTokens).toBe(2000)
    expect(result.totalCostMicro).toBe(45000)
    expect(result.recordCount).toBe(10)
    expect(result.byDate).toHaveLength(2)
    expect(result.byDate[0].date).toBe('2026-03-01')
    expect(result.byDate[0].costMicro).toBe(20000)
  })

  test('returns zeros when no records found', async () => {
    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => {
          return [{ totalInputTokens: null, totalOutputTokens: null, totalCostMicro: null, recordCount: 0 }]
        }),
      })),
    }))

    // Override for byDate call
    let callCount = 0
    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock((conditions: any) => {
          callCount++
          if (callCount === 1) return [{ totalInputTokens: null, totalOutputTokens: null, totalCostMicro: null, recordCount: 0 }]
          return { groupBy: mock(() => ({ orderBy: mock(() => []) })) }
        }),
      })),
    }))

    const result = await getCostSummary(testCompanyId, testRange)

    expect(result.totalInputTokens).toBe(0)
    expect(result.totalOutputTokens).toBe(0)
    expect(result.totalCostMicro).toBe(0)
    expect(result.recordCount).toBe(0)
    expect(result.byDate).toHaveLength(0)
  })
})

// ============================================================
// getAgentCostBreakdown
// ============================================================
describe('getAgentCostBreakdown', () => {
  test('returns per-model breakdown for agent', async () => {
    const rows = [
      { model: 'claude-sonnet-4-6', inputTokens: 3000, outputTokens: 1000, costMicro: 24000, recordCount: 5 },
      { model: 'claude-haiku-4-5', inputTokens: 2000, outputTokens: 1000, costMicro: 5600, recordCount: 8 },
    ]

    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => ({
          groupBy: mock(() => rows),
        })),
      })),
    }))

    const result = await getAgentCostBreakdown(testCompanyId, testAgentId, testRange)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].key).toBe('claude-sonnet-4-6')
    expect(result.items[0].label).toBe('Claude Sonnet 4.6')
    expect(result.items[0].costMicro).toBe(24000)
    expect(result.items[1].key).toBe('claude-haiku-4-5')
    expect(result.items[1].label).toBe('Claude Haiku 4.5')
    expect(result.total.costMicro).toBe(29600)
    expect(result.total.inputTokens).toBe(5000)
    expect(result.total.outputTokens).toBe(2000)
  })

  test('returns empty breakdown when no records', async () => {
    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => ({
          groupBy: mock(() => []),
        })),
      })),
    }))

    const result = await getAgentCostBreakdown(testCompanyId, testAgentId, testRange)

    expect(result.items).toHaveLength(0)
    expect(result.total.costMicro).toBe(0)
  })
})

// ============================================================
// getDepartmentCostBreakdown
// ============================================================
describe('getDepartmentCostBreakdown', () => {
  test('returns per-department breakdown with joins', async () => {
    const rows = [
      { departmentId: 'dept-1', departmentName: '전략부', inputTokens: 5000, outputTokens: 2000, costMicro: 40000, recordCount: 15 },
      { departmentId: 'dept-2', departmentName: '마케팅부', inputTokens: 3000, outputTokens: 1500, costMicro: 25000, recordCount: 10 },
    ]

    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        innerJoin: mock(() => ({
          innerJoin: mock(() => ({
            where: mock(() => ({
              groupBy: mock(() => rows),
            })),
          })),
        })),
      })),
    }))

    const result = await getDepartmentCostBreakdown(testCompanyId, testRange)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].key).toBe('dept-1')
    expect(result.items[0].label).toBe('전략부')
    expect(result.items[0].costMicro).toBe(40000)
    expect(result.total.costMicro).toBe(65000)
    expect(result.total.inputTokens).toBe(8000)
  })
})

// ============================================================
// getModelCostBreakdown
// ============================================================
describe('getModelCostBreakdown', () => {
  test('returns per-model breakdown for company', async () => {
    const rows = [
      { model: 'claude-sonnet-4-6', inputTokens: 10000, outputTokens: 5000, costMicro: 105000, recordCount: 20 },
      { model: 'gpt-4.1', inputTokens: 5000, outputTokens: 2000, costMicro: 32500, recordCount: 10 },
    ]

    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => ({
          groupBy: mock(() => rows),
        })),
      })),
    }))

    const result = await getModelCostBreakdown(testCompanyId, testRange)

    expect(result.items).toHaveLength(2)
    expect(result.items[0].key).toBe('claude-sonnet-4-6')
    expect(result.items[0].label).toBe('Claude Sonnet 4.6')
    expect(result.items[1].key).toBe('gpt-4.1')
    expect(result.items[1].label).toBe('GPT-4.1')
    expect(result.total.costMicro).toBe(137500)
  })

  test('unknown model key shows raw model ID as label', async () => {
    const rows = [
      { model: 'some-new-model', inputTokens: 1000, outputTokens: 500, costMicro: 5000, recordCount: 2 },
    ]

    mockSelect.mockImplementation(() => ({
      from: mock(() => ({
        where: mock(() => ({
          groupBy: mock(() => rows),
        })),
      })),
    }))

    const result = await getModelCostBreakdown(testCompanyId, testRange)

    expect(result.items[0].label).toBe('some-new-model') // Falls back to raw model ID
  })
})

// ============================================================
// models.yaml pricing validation
// ============================================================
describe('models.yaml pricing', () => {
  test('all 4 models return correct input pricing', () => {
    const expected: Record<string, number> = {
      'claude-sonnet-4-6': 3,
      'claude-haiku-4-5': 0.8,
      'gpt-4.1': 2.5,
      'gpt-4.1-mini': 0.4,
    }

    for (const [modelId, expectedPrice] of Object.entries(expected)) {
      const cost = calculateCostMicro(modelId, 1_000_000, 0)
      expect(cost).toBe(expectedPrice * 1_000_000)
    }
  })

  test('all 4 models return correct output pricing', () => {
    const expected: Record<string, number> = {
      'claude-sonnet-4-6': 15,
      'claude-haiku-4-5': 4,
      'gpt-4.1': 10,
      'gpt-4.1-mini': 1.6,
    }

    for (const [modelId, expectedPrice] of Object.entries(expected)) {
      const cost = calculateCostMicro(modelId, 0, 1_000_000)
      expect(cost).toBe(expectedPrice * 1_000_000)
    }
  })

  test('unknown model returns undefined from getModelConfig (triggers fallback)', () => {
    const { getModelConfig } = require('../../config/models')
    expect(getModelConfig('nonexistent-model-xyz')).toBeUndefined()
  })
})

// ============================================================
// LLM Router integration (validates recordCost is called correctly)
// ============================================================
describe('LLM Router integration', () => {
  test('recordCost accepts all source types including batch', async () => {
    const sources: Array<'chat' | 'delegation' | 'job' | 'sns' | 'batch'> = ['chat', 'delegation', 'job', 'sns', 'batch']

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
    }

    expect(mockInsert).toHaveBeenCalledTimes(5)
  })

  test('fallback scenario records cost for actual provider used', async () => {
    // Simulate: original model was Claude, but fallback used GPT
    await recordCost({
      companyId: testCompanyId,
      provider: 'openai', // Actual provider after fallback
      model: 'gpt-4.1',  // Actual model after fallback
      inputTokens: 500,
      outputTokens: 200,
      source: 'chat',
    })

    const values = mockInsertValues.mock.calls[0][0]
    expect(values.provider).toBe('openai') // Records actual, not original
    expect(values.model).toBe('gpt-4.1')
    expect(values.costUsdMicro).toBe(calculateCostMicro('gpt-4.1', 500, 200))
  })
})

// ============================================================
// Type exports
// ============================================================
describe('type exports', () => {
  test('RecordParams type is exported', () => {
    const params: RecordParams = {
      companyId: testCompanyId,
      model: 'claude-sonnet-4-6',
      inputTokens: 100,
      outputTokens: 50,
      source: 'chat',
    }
    expect(params).toBeDefined()
  })

  test('CostSummary type structure', () => {
    const summary: CostSummary = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostMicro: 0,
      recordCount: 0,
      byDate: [],
    }
    expect(summary.byDate).toBeArray()
  })

  test('CostBreakdown type structure', () => {
    const breakdown: CostBreakdown = {
      items: [],
      total: { inputTokens: 0, outputTokens: 0, costMicro: 0 },
    }
    expect(breakdown.items).toBeArray()
  })
})
