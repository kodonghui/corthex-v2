import { describe, test, expect } from 'bun:test'
import type { SessionContext } from '../../engine/types'
import { outputRedactor } from '../../engine/hooks/output-redactor'

const ctx: SessionContext = {
  cliToken: 'test-token',
  userId: 'user-1',
  companyId: 'company-1',
  depth: 0,
  sessionId: 'session-1',
  startedAt: Date.now(),
  maxDepth: 3,
  visitedAgents: ['agent-1'],
  runId: 'run-test-1',
}

const REDACTED = '[REDACTED]'

describe('outputRedactor', () => {
  test('masks email addresses', () => {
    const input = 'Contact user@example.com for details'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('user@example.com')
    expect(result).toContain(REDACTED)
  })

  test('masks Korean phone numbers (mobile)', () => {
    const input = 'Phone: 010-1234-5678'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('010-1234-5678')
    expect(result).toContain(REDACTED)
  })

  test('masks Korean phone numbers (landline)', () => {
    const input = 'Office: 02-123-4567'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('02-123-4567')
    expect(result).toContain(REDACTED)
  })

  test('masks Korean resident ID (주민번호)', () => {
    const input = 'ID: 900101-1234567'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('900101-1234567')
    expect(result).toContain(REDACTED)
  })

  test('masks bank account numbers', () => {
    const input = 'Account: 110-123-456789'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('110-123-456789')
    expect(result).toContain(REDACTED)
  })

  test('returns original string when no PII found', () => {
    const input = 'This is a normal output with no personal info.'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).toBe(input)
  })

  test('masks multiple PII patterns simultaneously', () => {
    const input = 'Email: admin@corp.co.kr, Phone: 010-9999-8888, ID: 850315-2345678'
    const result = outputRedactor(ctx, 'tool', input)
    expect(result).not.toContain('admin@corp.co.kr')
    expect(result).not.toContain('010-9999-8888')
    expect(result).not.toContain('850315-2345678')
    expect(result.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(3)
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: output-redactor source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/output-redactor.ts'),
    'utf-8',
  )

  test('is synchronous function (no async/await)', () => {
    expect(src).not.toContain('async function')
    expect(src).not.toContain('await ')
  })

  test('does not import getDB (Phase 1 — no DB access)', () => {
    expect(src).not.toContain("from '../../db/scoped-query'")
  })

  test('uses [REDACTED] masking (distinct from credential-scrubber)', () => {
    expect(src).toContain("'[REDACTED]'")
    expect(src).not.toContain("'***REDACTED***'")
  })

  test('has TODO for company-specific patterns', () => {
    expect(src).toContain('TODO')
    expect(src).toContain('Phase 2')
  })
})
