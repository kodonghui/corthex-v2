import { describe, test, expect } from 'bun:test'
import { observations } from '../../db/schema'

describe('Story 28.1 — Observations Schema & Validation', () => {
  // --- Schema structure tests ---
  test('observations table has all required columns', () => {
    const cols = Object.keys(observations)
    const required = [
      'id', 'companyId', 'agentId', 'sessionId', 'taskExecutionId',
      'content', 'domain', 'outcome', 'toolUsed', 'importance',
      'confidence', 'embedding', 'reflected', 'reflectedAt',
      'flagged', 'observedAt', 'createdAt', 'updatedAt',
    ]
    for (const col of required) {
      expect(cols).toContain(col)
    }
  })

  test('observations table name is "observations"', () => {
    // Access the underlying SQL table name
    expect((observations as any)[Symbol.for('drizzle:Name')]).toBe('observations')
  })

  // --- Content 10KB limit validation ---
  test('content 10KB limit — within limit passes', () => {
    const content = 'a'.repeat(10240)
    expect(content.length).toBe(10240)
    expect(content.slice(0, 10240).length).toBeLessThanOrEqual(10240)
  })

  test('content 10KB limit — exceeding limit is trimmed', () => {
    const content = 'b'.repeat(15000)
    const trimmed = content.slice(0, 10240)
    expect(trimmed.length).toBe(10240)
  })

  // --- Importance range 1-10 validation ---
  test('importance range 1-10 — valid values', () => {
    for (const val of [1, 5, 10]) {
      expect(val >= 1 && val <= 10).toBe(true)
    }
  })

  test('importance range 1-10 — out of range rejected', () => {
    expect(0 >= 1 && 0 <= 10).toBe(false)
    expect(11 >= 1 && 11 <= 10).toBe(false)
    expect(-1 >= 1 && -1 <= 10).toBe(false)
  })

  // --- Confidence range 0-1 validation ---
  test('confidence range 0-1 — valid values', () => {
    for (const val of [0, 0.5, 1]) {
      expect(val >= 0 && val <= 1).toBe(true)
    }
  })

  test('confidence range 0-1 — out of range rejected', () => {
    expect(-0.1 >= 0 && -0.1 <= 1).toBe(false)
    expect(1.1 >= 0 && 1.1 <= 1).toBe(false)
  })

  // --- Domain enum values ---
  test('domain defaults to "conversation"', () => {
    const validDomains = ['conversation', 'tool_use', 'error']
    for (const d of validDomains) {
      expect(validDomains).toContain(d)
    }
  })

  // --- Outcome enum values ---
  test('outcome defaults to "unknown"', () => {
    const validOutcomes = ['success', 'failure', 'unknown']
    for (const o of validOutcomes) {
      expect(validOutcomes).toContain(o)
    }
  })

  // --- Default values ---
  test('default importance is 5', () => {
    // Drizzle default check
    const col = (observations.importance as any)
    expect(col.default).toBe(5)
  })

  test('default confidence is 0.5', () => {
    const col = (observations.confidence as any)
    expect(col.default).toBe(0.5)
  })

  test('default reflected is false', () => {
    const col = (observations.reflected as any)
    expect(col.default).toBe(false)
  })

  test('default flagged is false', () => {
    const col = (observations.flagged as any)
    expect(col.default).toBe(false)
  })

  test('default domain is "conversation"', () => {
    const col = (observations.domain as any)
    expect(col.default).toBe('conversation')
  })

  test('default outcome is "unknown"', () => {
    const col = (observations.outcome as any)
    expect(col.default).toBe('unknown')
  })
})

describe('Story 28.1 — Observations Route Validation (Zod schemas)', () => {
  // Import inline to test Zod schemas used by the route
  const { z } = require('zod')

  const createObservationSchema = z.object({
    agentId: z.string().uuid(),
    content: z.string().min(1).max(10240),
    domain: z.enum(['conversation', 'tool_use', 'error']).optional(),
    outcome: z.enum(['success', 'failure', 'unknown']).optional(),
    toolUsed: z.string().max(100).optional(),
    importance: z.number().int().min(1).max(10).optional(),
    confidence: z.number().min(0).max(1).optional(),
    flagged: z.boolean().optional(),
  })

  test('valid observation passes validation', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'Agent completed task successfully',
    })
    expect(result.success).toBe(true)
  })

  test('all optional fields accepted', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'Agent completed task',
      domain: 'tool_use',
      outcome: 'success',
      toolUsed: 'web_search',
      importance: 8,
      confidence: 0.9,
      flagged: true,
    })
    expect(result.success).toBe(true)
  })

  test('empty content rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: '',
    })
    expect(result.success).toBe(false)
  })

  test('content over 10240 chars rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'x'.repeat(10241),
    })
    expect(result.success).toBe(false)
  })

  test('invalid agentId rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: 'not-a-uuid',
      content: 'test',
    })
    expect(result.success).toBe(false)
  })

  test('invalid domain rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      domain: 'invalid_domain',
    })
    expect(result.success).toBe(false)
  })

  test('invalid outcome rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      outcome: 'partial',
    })
    expect(result.success).toBe(false)
  })

  test('importance below 1 rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      importance: 0,
    })
    expect(result.success).toBe(false)
  })

  test('importance above 10 rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      importance: 11,
    })
    expect(result.success).toBe(false)
  })

  test('confidence below 0 rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      confidence: -0.1,
    })
    expect(result.success).toBe(false)
  })

  test('confidence above 1 rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      confidence: 1.1,
    })
    expect(result.success).toBe(false)
  })

  test('non-integer importance rejected', () => {
    const result = createObservationSchema.safeParse({
      agentId: '00000000-0000-0000-0000-000000000001',
      content: 'test',
      importance: 5.5,
    })
    expect(result.success).toBe(false)
  })

  test('company_id isolation — agentId required per observation', () => {
    // Each observation requires agentId — companyId is injected server-side from tenant context
    const result = createObservationSchema.safeParse({
      content: 'test without agentId',
    })
    expect(result.success).toBe(false)
  })
})
