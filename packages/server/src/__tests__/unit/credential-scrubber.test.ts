import { describe, test, expect } from 'bun:test'
import type { SessionContext } from '../../engine/types'
import { credentialScrubber } from '../../engine/hooks/credential-scrubber'

// --- Helpers ---

function makeCtx(): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 0,
    sessionId: 'session-1',
    startedAt: Date.now(),
    maxDepth: 3,
    visitedAgents: ['agent-1'],
  }
}

const ctx = makeCtx()
const REDACTED = '***REDACTED***'

// --- Tests ---

describe('credentialScrubber', () => {
  test('masks Claude CLI tokens (sk-ant-*)', () => {
    const input = 'Token is sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890'
    const result = credentialScrubber(ctx, 'some_tool', input)
    expect(result).not.toContain('sk-ant-')
    expect(result).toContain(REDACTED)
  })

  test('masks Telegram bot tokens', () => {
    const input = 'Bot token: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz1234567890ab'
    const result = credentialScrubber(ctx, 'telegram', input)
    expect(result).not.toContain('123456789:ABC')
    expect(result).toContain(REDACTED)
  })

  test('masks KIS API appkey pattern', () => {
    const input = 'KIS key: PSabcdefghij1234567890abcdefghij12'
    const result = credentialScrubber(ctx, 'kis_trade', input)
    expect(result).not.toContain('PSabcdef')
    expect(result).toContain(REDACTED)
  })

  test('masks sensitive keys in JSON payloads via @zapier/secret-scrubber', () => {
    const payload = JSON.stringify({
      api_key: 'my-super-secret-key-12345',
      data: 'safe content',
    })
    const result = credentialScrubber(ctx, 'api_call', payload)
    expect(result).not.toContain('my-super-secret-key-12345')
    expect(result).toContain('data')
    expect(result).toContain('safe content')
  })

  test('returns original string when no sensitive content', () => {
    const input = 'This is a normal tool output with no secrets.'
    const result = credentialScrubber(ctx, 'web_search', input)
    expect(result).toBe(input)
  })

  test('masks multiple patterns simultaneously', () => {
    const input = [
      'Claude: sk-ant-api03-aaaabbbbccccddddeeeeffffgggg',
      'Telegram: 987654321:XYZabcdefghijklmnopqrstuvwxyz1234567',
    ].join('\n')
    const result = credentialScrubber(ctx, 'multi', input)
    expect(result).not.toContain('sk-ant-')
    expect(result).not.toContain('987654321:XYZ')
    expect(result.match(/\*\*\*REDACTED\*\*\*/g)?.length).toBe(2)
  })

  test('handles JSON with password field', () => {
    const payload = JSON.stringify({
      username: 'admin',
      password: 'hunter2',
    })
    const result = credentialScrubber(ctx, 'db_query', payload)
    expect(result).not.toContain('hunter2')
  })
})

// --- TEA P0: Source Code Introspection ---

describe('TEA P0: credential-scrubber source introspection', () => {
  const fs = require('fs')
  const src = fs.readFileSync(
    require('path').resolve(__dirname, '../../engine/hooks/credential-scrubber.ts'),
    'utf-8',
  )

  test('uses @zapier/secret-scrubber imports', () => {
    expect(src).toContain("from '@zapier/secret-scrubber'")
    expect(src).toContain('findSensitiveValues')
    expect(src).toContain('scrub')
  })

  test('is synchronous function (no async/await)', () => {
    expect(src).not.toContain('async function')
    expect(src).not.toContain('await ')
  })

  test('uses ***REDACTED*** masking format', () => {
    expect(src).toContain("'***REDACTED***'")
  })

  test('cliToken is never accessed (no token leakage)', () => {
    expect(src).not.toContain('ctx.cliToken')
  })
})
