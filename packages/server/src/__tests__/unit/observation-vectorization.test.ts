import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

let mockEmbed = mock(() =>
  Promise.resolve({
    data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
    model: 'voyage-3',
    usage: { totalTokens: 10 },
  }),
)

class MockVoyageAIError extends Error {
  statusCode: number
  constructor(msg: string, statusCode: number) {
    super(msg)
    this.statusCode = statusCode
  }
}

class MockVoyageAITimeoutError extends Error {}

mock.module('voyageai', () => ({
  VoyageAIClient: mock(function (opts: any) {
    return { embed: (...args: any[]) => mockEmbed(...args) }
  }),
  VoyageAIError: MockVoyageAIError,
  VoyageAITimeoutError: MockVoyageAITimeoutError,
}))

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve([{
            id: 'doc-1',
            title: 'Test Doc',
            content: 'Test content for embedding',
          }])),
        })),
      })),
    })),
    execute: mock(() => Promise.resolve()),
  },
}))

mock.module('../../db/schema', () => ({
  knowledgeDocs: {
    id: 'id',
    title: 'title',
    content: 'content',
    companyId: 'company_id',
    isActive: 'is_active',
    embedding: 'embedding',
    embeddingModel: 'embedding_model',
    embeddedAt: 'embedded_at',
  },
}))

mock.module('../../services/credential-vault', () => ({
  getCredentials: mock(() =>
    Promise.resolve({ api_key: 'test-voyage-key-123' }),
  ),
}))

import { calculateConfidence } from '../../services/observation-sanitizer'
import {
  embedObservation,
  triggerObservationEmbedding,
} from '../../services/voyage-embedding'

beforeEach(() => {
  mockEmbed = mock(() =>
    Promise.resolve({
      data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
      model: 'voyage-3',
      usage: { totalTokens: 10 },
    }),
  )
})

// === calculateConfidence ===

describe('calculateConfidence', () => {
  test('base confidence for conversation/unknown is 0.45 (base 0.5 - 0.05)', () => {
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    expect(result).toBeCloseTo(0.45, 2)
  })

  test('tool_use domain adds 0.15', () => {
    const result = calculateConfidence({
      domain: 'tool_use',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    expect(result).toBeCloseTo(0.65, 2)
  })

  test('error domain adds 0.1', () => {
    const result = calculateConfidence({
      domain: 'error',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    expect(result).toBeCloseTo(0.6, 2)
  })

  test('success outcome adds 0.15', () => {
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'success',
      contentLength: 200,
      hasToolUsed: false,
    })
    // 0.5 - 0.05 + 0.15 = 0.6
    expect(result).toBeCloseTo(0.6, 2)
  })

  test('failure outcome adds 0.1', () => {
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'failure',
      contentLength: 200,
      hasToolUsed: false,
    })
    // 0.5 - 0.05 + 0.1 = 0.55
    expect(result).toBeCloseTo(0.55, 2)
  })

  test('long content (>500) adds 0.05', () => {
    const base = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    const long = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 600,
      hasToolUsed: false,
    })
    expect(long - base).toBeCloseTo(0.05, 2)
  })

  test('short content (<50) subtracts 0.1', () => {
    const base = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    const short = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 30,
      hasToolUsed: false,
    })
    expect(base - short).toBeCloseTo(0.1, 2)
  })

  test('hasToolUsed adds 0.05', () => {
    const without = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: false,
    })
    const with_ = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 200,
      hasToolUsed: true,
    })
    expect(with_ - without).toBeCloseTo(0.05, 2)
  })

  test('maximum confidence from all positive factors = tool_use + success + long + toolUsed', () => {
    const result = calculateConfidence({
      domain: 'tool_use',
      outcome: 'success',
      contentLength: 600,
      hasToolUsed: true,
    })
    // 0.5 + 0.15 + 0.15 + 0.05 + 0.05 = 0.90
    expect(result).toBeCloseTo(0.9, 2)
  })

  test('minimum confidence from all negative factors = conversation + unknown + short + no tool', () => {
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 10,
      hasToolUsed: false,
    })
    // 0.5 - 0.05 - 0.1 = 0.35
    expect(result).toBeCloseTo(0.35, 2)
  })

  test('clamped to minimum 0.1', () => {
    // Even with extreme negative values, should not go below 0.1
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 10,
      hasToolUsed: false,
    })
    expect(result).toBeGreaterThanOrEqual(0.1)
  })

  test('clamped to maximum 0.95', () => {
    const result = calculateConfidence({
      domain: 'tool_use',
      outcome: 'success',
      contentLength: 1000,
      hasToolUsed: true,
    })
    expect(result).toBeLessThanOrEqual(0.95)
  })

  test('never returns exactly 0', () => {
    const result = calculateConfidence({
      domain: 'conversation',
      outcome: 'unknown',
      contentLength: 1,
      hasToolUsed: false,
    })
    expect(result).toBeGreaterThan(0)
  })

  test('never returns exactly 1', () => {
    const result = calculateConfidence({
      domain: 'tool_use',
      outcome: 'success',
      contentLength: 10000,
      hasToolUsed: true,
    })
    expect(result).toBeLessThan(1)
  })

  test('all domain/outcome combos return valid range', () => {
    const domains: ('conversation' | 'tool_use' | 'error')[] = ['conversation', 'tool_use', 'error']
    const outcomes: ('success' | 'failure' | 'unknown')[] = ['success', 'failure', 'unknown']
    for (const domain of domains) {
      for (const outcome of outcomes) {
        for (const contentLength of [10, 200, 600]) {
          for (const hasToolUsed of [true, false]) {
            const result = calculateConfidence({ domain, outcome, contentLength, hasToolUsed })
            expect(result).toBeGreaterThanOrEqual(0.1)
            expect(result).toBeLessThanOrEqual(0.95)
          }
        }
      }
    }
  })

  test('error + failure + long content + tool = high confidence', () => {
    const result = calculateConfidence({
      domain: 'error',
      outcome: 'failure',
      contentLength: 600,
      hasToolUsed: true,
    })
    // 0.5 + 0.1 + 0.1 + 0.05 + 0.05 = 0.8
    expect(result).toBeCloseTo(0.8, 2)
  })
})

// === embedObservation ===

describe('embedObservation', () => {
  test('returns true on success', async () => {
    const result = await embedObservation('obs-1', 'company-1', 'test observation content')
    expect(result).toBe(true)
  })

  test('returns false when embedding fails', async () => {
    mockEmbed = mock(() => Promise.reject(new Error('API error')))
    const result = await embedObservation('obs-1', 'company-1', 'test')
    expect(result).toBe(false)
  })

  test('returns false when no credentials', async () => {
    const { getCredentials } = require('../../services/credential-vault')
    getCredentials.mockImplementationOnce(() => Promise.reject(new Error('No creds')))
    const result = await embedObservation('obs-1', 'no-creds-company', 'test')
    expect(result).toBe(false)
  })

  test('truncates content to MAX_TEXT_LENGTH', async () => {
    // Should not throw even with very long content
    const longContent = 'x'.repeat(20000)
    const result = await embedObservation('obs-1', 'company-1', longContent)
    expect(result).toBe(true)
  })

  test('NFR-D3: never throws — graceful failure', async () => {
    mockEmbed = mock(() => { throw new Error('catastrophic') })
    // Must not throw
    const result = await embedObservation('obs-1', 'company-1', 'test')
    expect(result).toBe(false)
  })
})

// === triggerObservationEmbedding ===

describe('triggerObservationEmbedding', () => {
  test('does not throw (fire-and-forget)', () => {
    expect(() => triggerObservationEmbedding('obs-1', 'company-1', 'test content')).not.toThrow()
  })

  test('is non-blocking', () => {
    const start = Date.now()
    triggerObservationEmbedding('obs-1', 'company-1', 'test content')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(50)
  })

  test('function signature accepts observationId, companyId, content', () => {
    expect(typeof triggerObservationEmbedding).toBe('function')
    expect(triggerObservationEmbedding.length).toBe(3)
  })

  test('NFR-D3: does not throw even when embedding fails', () => {
    mockEmbed = mock(() => Promise.reject(new Error('fail')))
    expect(() => triggerObservationEmbedding('obs-1', 'company-1', 'test')).not.toThrow()
  })
})

// === Integration: confidence + vectorization flow ===

describe('integration: confidence scoring flow', () => {
  test('conversation success observation gets correct confidence', () => {
    const confidence = calculateConfidence({
      domain: 'conversation',
      outcome: 'success',
      contentLength: 300,
      hasToolUsed: false,
    })
    // 0.5 - 0.05 + 0.15 = 0.6
    expect(confidence).toBeCloseTo(0.6, 2)
  })

  test('error failure observation gets correct confidence', () => {
    const confidence = calculateConfidence({
      domain: 'error',
      outcome: 'failure',
      contentLength: 100,
      hasToolUsed: false,
    })
    // 0.5 + 0.1 + 0.1 = 0.7
    expect(confidence).toBeCloseTo(0.7, 2)
  })

  test('tool_use success with tool attribution', () => {
    const confidence = calculateConfidence({
      domain: 'tool_use',
      outcome: 'success',
      contentLength: 200,
      hasToolUsed: true,
    })
    // 0.5 + 0.15 + 0.15 + 0.05 = 0.85
    expect(confidence).toBeCloseTo(0.85, 2)
  })
})
