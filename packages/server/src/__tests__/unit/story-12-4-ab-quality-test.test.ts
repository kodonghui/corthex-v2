/**
 * Story 12.4: A/B 품질 테스트 프레임워크 — Unit Tests
 *
 * Tests: prompt set validation, comparison logic, snapshot format, mock SDK integration
 */

import { describe, test, expect } from 'bun:test'
import { AB_PROMPTS, AB_CATEGORIES, type ABPrompt } from '../fixtures/ab-prompts'
import {
  loadV1Snapshots,
  calculateDelta,
  compareResults,
  generateSummary,
  generateDryRunV2Snapshots,
  type ABSnapshot,
  type ABComparisonResult,
} from '../../../scripts/ab-quality-test'
import { join } from 'path'

// ─── Task 4.2: Prompt Set Validation ────────────────────────

describe('AB Prompts — Set Validation', () => {
  test('should have exactly 10 prompts', () => {
    expect(AB_PROMPTS).toHaveLength(10)
  })

  test('each prompt has required fields', () => {
    for (const p of AB_PROMPTS) {
      expect(p.id).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.prompt).toBeTruthy()
      expect(p.expectedBehavior).toBeTruthy()
      expect(typeof p.id).toBe('string')
      expect(typeof p.category).toBe('string')
      expect(typeof p.prompt).toBe('string')
      expect(typeof p.expectedBehavior).toBe('string')
    }
  })

  test('each category has exactly 2 prompts', () => {
    for (const cat of AB_CATEGORIES) {
      const count = AB_PROMPTS.filter(p => p.category === cat).length
      expect(count).toBe(2)
    }
  })

  test('all prompt IDs are unique', () => {
    const ids = AB_PROMPTS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('prompt IDs follow naming convention (category-NN)', () => {
    for (const p of AB_PROMPTS) {
      expect(p.id).toMatch(/^[a-z]+-\d{2}$/)
    }
  })

  test('covers all 5 categories', () => {
    const categories = new Set(AB_PROMPTS.map(p => p.category))
    expect(categories.size).toBe(5)
    for (const cat of AB_CATEGORIES) {
      expect(categories.has(cat)).toBe(true)
    }
  })
})

// ─── Task 4.3: Comparison Logic ─────────────────────────────

describe('AB Comparison — Delta Calculation', () => {
  const v1: ABSnapshot = {
    promptId: 'test-01',
    model: 'gpt-4',
    response: 'Hello world', // 11 chars
    tokenCount: 100,
    durationMs: 1000,
    toolCallCount: 2,
    handoffDepth: 1,
  }

  const v2: ABSnapshot = {
    promptId: 'test-01',
    model: 'claude-sonnet-4-6',
    response: 'Hello world, from v2!', // 21 chars
    tokenCount: 120,
    durationMs: 800,
    toolCallCount: 3,
    handoffDepth: 2,
  }

  test('calculates response length ratio correctly', () => {
    const delta = calculateDelta(v1, v2)
    expect(delta.responseLengthRatio).toBe(Math.round((21 / 11) * 100) / 100)
  })

  test('calculates tool call diff correctly', () => {
    const delta = calculateDelta(v1, v2)
    expect(delta.toolCallDiff).toBe(1) // 3 - 2
  })

  test('calculates handoff depth diff correctly', () => {
    const delta = calculateDelta(v1, v2)
    expect(delta.handoffDepthDiff).toBe(1) // 2 - 1
  })

  test('completeness score defaults to 0', () => {
    const delta = calculateDelta(v1, v2)
    expect(delta.completenessScore).toBe(0)
  })

  test('handles empty v1 response (division by zero protection)', () => {
    const emptyV1: ABSnapshot = { ...v1, response: '' }
    const delta = calculateDelta(emptyV1, v2)
    // empty string length = 0, protected by || 1
    expect(delta.responseLengthRatio).toBe(21)
  })

  test('handles identical responses', () => {
    const delta = calculateDelta(v1, { ...v1, model: 'claude-sonnet-4-6' })
    expect(delta.responseLengthRatio).toBe(1)
    expect(delta.toolCallDiff).toBe(0)
    expect(delta.handoffDepthDiff).toBe(0)
  })
})

describe('AB Comparison — compareResults', () => {
  const prompts: ABPrompt[] = [
    { id: 'test-01', category: 'coding', prompt: 'test', expectedBehavior: 'test' },
    { id: 'test-02', category: 'analysis', prompt: 'test', expectedBehavior: 'test' },
  ]

  const v1Snapshots: ABSnapshot[] = [
    { promptId: 'test-01', model: 'gpt-4', response: 'v1 response', tokenCount: 50, durationMs: 1000, toolCallCount: 0, handoffDepth: 0 },
    { promptId: 'test-02', model: 'gpt-4', response: 'v1 analysis', tokenCount: 80, durationMs: 1500, toolCallCount: 1, handoffDepth: 0 },
  ]

  const v2Snapshots: ABSnapshot[] = [
    { promptId: 'test-01', model: 'claude-sonnet-4-6', response: 'v2 response longer', tokenCount: 60, durationMs: 900, toolCallCount: 0, handoffDepth: 0 },
    { promptId: 'test-02', model: 'claude-sonnet-4-6', response: 'v2 detailed analysis', tokenCount: 100, durationMs: 1200, toolCallCount: 2, handoffDepth: 1 },
  ]

  test('returns results for matching prompts only', () => {
    const results = compareResults(v1Snapshots, v2Snapshots, prompts)
    expect(results).toHaveLength(2)
  })

  test('skips prompts without v1 snapshot', () => {
    const extraPrompts = [...prompts, { id: 'missing-01', category: 'creative' as const, prompt: 'x', expectedBehavior: 'x' }]
    const results = compareResults(v1Snapshots, v2Snapshots, extraPrompts)
    expect(results).toHaveLength(2) // missing-01 skipped
  })

  test('each result has correct structure', () => {
    const results = compareResults(v1Snapshots, v2Snapshots, prompts)
    for (const r of results) {
      expect(r.promptId).toBeTruthy()
      expect(r.category).toBeTruthy()
      expect(r.v1).toBeDefined()
      expect(r.v2).toBeDefined()
      expect(r.delta).toBeDefined()
      expect(typeof r.delta.responseLengthRatio).toBe('number')
      expect(typeof r.delta.toolCallDiff).toBe('number')
      expect(typeof r.delta.handoffDepthDiff).toBe('number')
      expect(typeof r.delta.completenessScore).toBe('number')
    }
  })
})

describe('AB Comparison — generateSummary', () => {
  test('computes averages correctly', () => {
    const results: ABComparisonResult[] = [
      {
        promptId: 'a', category: 'coding',
        v1: { promptId: 'a', model: 'm', response: 'x', tokenCount: 0, durationMs: 0, toolCallCount: 0, handoffDepth: 0 },
        v2: { promptId: 'a', model: 'm', response: 'x', tokenCount: 0, durationMs: 0, toolCallCount: 0, handoffDepth: 0 },
        delta: { responseLengthRatio: 1.5, toolCallDiff: 2, handoffDepthDiff: 1, completenessScore: 8 },
      },
      {
        promptId: 'b', category: 'analysis',
        v1: { promptId: 'b', model: 'm', response: 'x', tokenCount: 0, durationMs: 0, toolCallCount: 0, handoffDepth: 0 },
        v2: { promptId: 'b', model: 'm', response: 'x', tokenCount: 0, durationMs: 0, toolCallCount: 0, handoffDepth: 0 },
        delta: { responseLengthRatio: 0.5, toolCallDiff: 0, handoffDepthDiff: -1, completenessScore: 6 },
      },
    ]
    const summary = generateSummary(results)
    expect(summary.avgResponseLengthRatio).toBe(1)
    expect(summary.avgToolCallDiff).toBe(1)
    expect(summary.avgHandoffDepthDiff).toBe(0)
    expect(summary.avgCompletenessScore).toBe(7)
  })

  test('handles empty results', () => {
    const summary = generateSummary([])
    expect(summary.avgResponseLengthRatio).toBe(0)
    expect(summary.avgToolCallDiff).toBe(0)
    expect(summary.avgHandoffDepthDiff).toBe(0)
    expect(summary.avgCompletenessScore).toBe(0)
  })
})

// ─── Task 4.4: Snapshot Format Validation ───────────────────

describe('AB Snapshots — v1 Baseline Format', () => {
  const snapshotPath = join(__dirname, '../fixtures/ab-snapshots/v1-baseline.json')

  test('v1-baseline.json loads successfully', () => {
    const snapshots = loadV1Snapshots(snapshotPath)
    expect(snapshots).toBeArray()
    expect(snapshots.length).toBeGreaterThan(0)
  })

  test('each snapshot has all required fields', () => {
    const snapshots = loadV1Snapshots(snapshotPath)
    for (const s of snapshots) {
      expect(typeof s.promptId).toBe('string')
      expect(typeof s.model).toBe('string')
      expect(typeof s.response).toBe('string')
      expect(typeof s.tokenCount).toBe('number')
      expect(typeof s.durationMs).toBe('number')
      expect(typeof s.toolCallCount).toBe('number')
      expect(typeof s.handoffDepth).toBe('number')
    }
  })

  test('snapshots cover all 10 prompts', () => {
    const snapshots = loadV1Snapshots(snapshotPath)
    expect(snapshots).toHaveLength(10)
    const promptIds = snapshots.map(s => s.promptId)
    for (const p of AB_PROMPTS) {
      expect(promptIds).toContain(p.id)
    }
  })
})

// ─── Task 4.5: Mock v2 Generation ───────────────────────────

describe('AB Dry Run — Mock v2 Generation', () => {
  test('generates one snapshot per prompt', () => {
    const v2 = generateDryRunV2Snapshots(AB_PROMPTS)
    expect(v2).toHaveLength(AB_PROMPTS.length)
  })

  test('each mock snapshot has valid fields', () => {
    const v2 = generateDryRunV2Snapshots(AB_PROMPTS)
    for (const s of v2) {
      expect(typeof s.promptId).toBe('string')
      expect(typeof s.model).toBe('string')
      expect(typeof s.response).toBe('string')
      expect(s.response.length).toBeGreaterThan(0)
      expect(typeof s.tokenCount).toBe('number')
      expect(s.tokenCount).toBeGreaterThan(0)
      expect(typeof s.durationMs).toBe('number')
      expect(s.durationMs).toBeGreaterThan(0)
    }
  })

  test('dry run full pipeline produces valid report', () => {
    const snapshotPath = join(__dirname, '../fixtures/ab-snapshots/v1-baseline.json')
    const v1 = loadV1Snapshots(snapshotPath)
    const v2 = generateDryRunV2Snapshots(AB_PROMPTS)
    const results = compareResults(v1, v2, AB_PROMPTS)
    const summary = generateSummary(results)

    expect(results).toHaveLength(10)
    expect(summary.avgResponseLengthRatio).toBeGreaterThan(0)
  })
})
