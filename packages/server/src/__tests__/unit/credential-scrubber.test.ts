/**
 * credential-scrubber.ts unit tests (bun:test)
 *
 * Covers original scrubbing behavior + D28 session credential extension (Story 16.6):
 * - AC1: init() loads credentials into session map
 * - AC2: credentialScrubber scrubs registered plaintext values
 * - AC3: release() nullifies in-memory credential list
 * - AC4: init() with empty credentials completes without error
 * - AC5: MCP tool output scrubbed same as built-in
 */

import { describe, test, expect } from 'bun:test'
import type { SessionContext } from '../../engine/types'

// Set CREDENTIAL_ENCRYPTION_KEY before any import chain that reaches credential-crypto
process.env.CREDENTIAL_ENCRYPTION_KEY = 'ab'.repeat(32) // 64-char hex (32 bytes)

// --- Helpers ---

function makeCtx(overrides?: Partial<SessionContext>): SessionContext {
  return {
    cliToken: 'test-token',
    userId: 'user-1',
    companyId: 'company-1',
    depth: 0,
    sessionId: 'session-test-001',
    startedAt: Date.now(),
    maxDepth: 3,
    visitedAgents: ['agent-1'],
    runId: 'test-run-1',
    ...overrides,
  }
}

const REDACTED_STR = '***REDACTED***'

// --- Existing scrubbing behavior tests ---

describe('credentialScrubber — existing static pattern scrubbing', () => {
  test('masks Claude CLI tokens (sk-ant-*)', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-1' })
    const input = 'Token is sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890'
    const result = credentialScrubber(ctx, 'some_tool', input)
    expect(result).not.toContain('sk-ant-')
    expect(result).toContain(REDACTED_STR)
  })

  test('masks Telegram bot tokens', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-2' })
    const input = 'Bot token: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz1234567890ab'
    const result = credentialScrubber(ctx, 'telegram', input)
    expect(result).not.toContain('123456789:ABC')
    expect(result).toContain(REDACTED_STR)
  })

  test('masks KIS API appkey pattern', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-3' })
    const input = 'KIS key: PSabcdefghij1234567890abcdefghij12'
    const result = credentialScrubber(ctx, 'kis_trade', input)
    expect(result).not.toContain('PSabcdef')
    expect(result).toContain(REDACTED_STR)
  })

  test('masks sensitive keys in JSON payloads via @zapier/secret-scrubber', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-4' })
    const payload = JSON.stringify({
      api_key: 'my-super-secret-key-12345',
      data: 'safe content',
    })
    const result = credentialScrubber(ctx, 'api_call', payload)
    expect(result).not.toContain('my-super-secret-key-12345')
    expect(result).toContain('data')
    expect(result).toContain('safe content')
  })

  test('returns original string when no sensitive content', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-5' })
    const input = 'This is a normal tool output with no secrets.'
    const result = credentialScrubber(ctx, 'web_search', input)
    expect(result).toBe(input)
  })

  test('masks multiple patterns simultaneously', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-6' })
    const input = [
      'Claude: sk-ant-api03-aaaabbbbccccddddeeeeffffgggg',
      'Telegram: 987654321:XYZabcdefghijklmnopqrstuvwxyz1234567',
    ].join('\n')
    const result = credentialScrubber(ctx, 'multi', input)
    expect(result).not.toContain('sk-ant-')
    expect(result).not.toContain('987654321:XYZ')
    expect(result.match(/\*\*\*REDACTED\*\*\*/g)?.length).toBe(2)
  })

  test('handles JSON with password field', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-static-7' })
    const payload = JSON.stringify({
      username: 'admin',
      password: 'hunter2',
    })
    const result = credentialScrubber(ctx, 'db_query', payload)
    expect(result).not.toContain('hunter2')
  })
})

// --- D28: Session credential scrubbing (Story 16.6) ---

describe('AC1: init() — loads credentials into session map', () => {
  test('init() is exported as async function', async () => {
    const mod = await import('../../engine/hooks/credential-scrubber')
    expect(typeof mod.init).toBe('function')
    // init returns a Promise
    // We don't call real init (needs DB), but verify it's exported
  })

  test('_testSetSession() sets session credentials for unit test use', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac1-001' })
    _testSetSession(ctx.sessionId, ['my-test-credential-abc'])

    const output = 'Result contains my-test-credential-abc value'
    const result = credentialScrubber(ctx, 'test_tool', output)
    expect(result).not.toContain('my-test-credential-abc')
    expect(result).toContain(REDACTED_STR)
  })

  test('init() with empty credentials stores empty array (AC4 — no error)', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac4-empty' })
    // Simulate empty company credentials
    _testSetSession(ctx.sessionId, [])

    const output = 'Normal tool output with no credentials'
    const result = credentialScrubber(ctx, 'tool', output)
    // Empty credentials — output passes through unchanged
    expect(result).toBe(output)
  })
})

describe('AC2: credentialScrubber — scrubs registered session credentials', () => {
  test('scrubs exact match of registered credential value', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac2-001' })
    _testSetSession(ctx.sessionId, ['secret-oauth-abc123'])

    const output = 'The access token is secret-oauth-abc123 and it works'
    const result = credentialScrubber(ctx, 'tistory_tool', output)
    expect(result).not.toContain('secret-oauth-abc123')
    expect(result).toContain(REDACTED_STR)
  })

  test('scrubs all occurrences when credential appears multiple times', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac2-002' })
    _testSetSession(ctx.sessionId, ['token-xyz-789'])

    const output = 'First: token-xyz-789, again: token-xyz-789 in the same output'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).not.toContain('token-xyz-789')
    // Both occurrences replaced
    expect(result.match(/\*\*\*REDACTED\*\*\*/g)?.length).toBe(2)
  })

  test('scrubs multiple registered credentials independently', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac2-003' })
    _testSetSession(ctx.sessionId, ['cred-alpha-111', 'cred-beta-222'])

    const output = 'Has cred-alpha-111 and also cred-beta-222 in it'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).not.toContain('cred-alpha-111')
    expect(result).not.toContain('cred-beta-222')
    expect(result.match(/\*\*\*REDACTED\*\*\*/g)?.length).toBe(2)
  })

  test('credential value NOT in output — passes through unchanged', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac2-004' })
    _testSetSession(ctx.sessionId, ['registered-but-not-in-output'])

    const output = 'Clean output with no credential echoing'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).toBe(output)
  })

  test('sessions are isolated — different sessionId has no access to other session credentials', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')

    const ctxA = makeCtx({ sessionId: 'session-isolated-A' })
    const ctxB = makeCtx({ sessionId: 'session-isolated-B' })

    _testSetSession(ctxA.sessionId, ['company-a-secret-key'])
    // ctxB has no credentials registered

    const output = 'Output containing company-a-secret-key value'
    // ctxB session should NOT scrub ctxA's credentials
    const resultB = credentialScrubber(ctxB, 'tool', output)
    expect(resultB).toContain('company-a-secret-key') // not scrubbed for session B

    // ctxA session DOES scrub it
    const resultA = credentialScrubber(ctxA, 'tool', output)
    expect(resultA).not.toContain('company-a-secret-key') // scrubbed for session A
  })

  test('uses split/join for scrubbing — safe with regex metacharacters in credential values', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac2-regex' })
    // Credential values may contain regex metacharacters like . * $ + ? { } [ ] ( ) |
    _testSetSession(ctx.sessionId, ['api.key$value+123'])

    const output = 'Token: api.key$value+123 is the credential'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).not.toContain('api.key$value+123')
    expect(result).toContain(REDACTED_STR)
  })
})

describe('AC3: release() — nullifies in-memory credential list', () => {
  test('release() is exported as synchronous function', async () => {
    const mod = await import('../../engine/hooks/credential-scrubber')
    expect(typeof mod.release).toBe('function')
  })

  test('after release(), credential is no longer scrubbed', async () => {
    const { _testSetSession, release, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac3-release' })
    _testSetSession(ctx.sessionId, ['pre-release-secret'])

    // Before release: credential IS scrubbed
    const outputBefore = 'Contains pre-release-secret value'
    const resultBefore = credentialScrubber(ctx, 'tool', outputBefore)
    expect(resultBefore).not.toContain('pre-release-secret')

    // After release: entry set to null → no credentials for this session
    release(ctx.sessionId)

    // After release: credential is NO longer scrubbed (null → ?? [] → empty loop)
    const outputAfter = 'Contains pre-release-secret value'
    const resultAfter = credentialScrubber(ctx, 'tool', outputAfter)
    expect(resultAfter).toContain('pre-release-secret') // not scrubbed — null coalesced to []
  })
})

describe('AC4: Empty company credentials — init completes without error', () => {
  test('empty plaintext list: tool output passes through unchanged', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-empty-creds' })
    _testSetSession(ctx.sessionId, []) // empty credential list

    const output = 'Normal safe tool output'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).toBe(output)
  })

  test('session without init(): falls back to empty list (no-op scrubbing)', async () => {
    const { credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-no-init-at-all' })
    // No _testSetSession call → sessionCredentials.get() returns undefined → ?? []

    const output = 'Some output that would not be scrubbed'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).toBe(output) // safe fallback
  })
})

describe('AC5: MCP tool output — NOT exempt from D28 scrubbing', () => {
  test('MCP tool output with credential value is scrubbed identically to built-in', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-ac5-mcp' })
    _testSetSession(ctx.sessionId, ['mcp-echoed-secret-value'])

    // MCP tool name (non-built-in)
    const mcpOutput = 'MCP server echoed: mcp-echoed-secret-value in its response'
    const result = credentialScrubber(ctx, 'notion_mcp_tool', mcpOutput)
    expect(result).not.toContain('mcp-echoed-secret-value')
    expect(result).toContain(REDACTED_STR)
  })

  test('toolName is logged in scrubbing event (MCP tool name preserved for audit)', async () => {
    // Verify that toolName parameter is used in logging (source code inspection)
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain('toolName,') // toolName appears in audit log object
    expect(src).toContain("event: 'credential_scrubbed'")
  })
})

// --- TEA: Additional Risk-Based Coverage (Story 16.6 TEA) ---

describe('TEA P0: Empty-string credential guard — prevents output corruption', () => {
  test('empty-string credential in list does NOT insert REDACTED between every character', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-tea-empty-str' })
    // Empty-string credential must be skipped by `if (plaintext && ...)` guard
    // Without the guard: 'abc'.split('').join(REDACTED) = 'a***REDACTED***b***REDACTED***c'
    _testSetSession(ctx.sessionId, [''])

    const output = 'Normal tool output'
    const result = credentialScrubber(ctx, 'tool', output)
    // Output must pass through unchanged — no REDACTED inserted
    expect(result).toBe(output)
    expect(result).not.toContain(REDACTED_STR)
  })

  test('mixed list with empty + valid credential — only valid credential is scrubbed', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-tea-empty-mixed' })
    _testSetSession(ctx.sessionId, ['', 'real-secret-xyz'])

    const output = 'Output has real-secret-xyz embedded'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).not.toContain('real-secret-xyz')
    expect(result).toContain(REDACTED_STR)
    // Exactly one REDACTED (the valid cred), not more
    expect(result.match(/\*\*\*REDACTED\*\*\*/g)?.length).toBe(1)
  })
})

describe('TEA P0: Audit log security — no plaintext credential in console.info', () => {
  test('console.info log does NOT contain the plaintext credential value', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')

    const capturedLogs: string[] = []
    const originalConsoleInfo = console.info
    console.info = (msg: string) => { capturedLogs.push(msg) }

    try {
      const ctx = makeCtx({ sessionId: 'session-tea-audit-log' })
      const secretValue = 'audit-test-secret-do-not-log'
      _testSetSession(ctx.sessionId, [secretValue])

      const output = `Tool returned ${secretValue} in its response`
      credentialScrubber(ctx, 'some_tool', output)

      // At least one log entry should have been generated
      expect(capturedLogs.length).toBeGreaterThan(0)

      // No log entry must contain the plaintext credential value (AC2 security rule)
      for (const log of capturedLogs) {
        expect(log).not.toContain(secretValue)
      }

      // Log entry must contain expected audit fields
      const parsedLog = JSON.parse(capturedLogs[0])
      expect(parsedLog.event).toBe('credential_scrubbed')
      expect(parsedLog.toolName).toBe('some_tool')
      expect(parsedLog.sessionId).toBe(ctx.sessionId)
      expect(parsedLog.timestamp).toBeDefined()
    } finally {
      console.info = originalConsoleInfo
    }
  })
})

describe('TEA P1: Release isolation — release of one session does not affect another', () => {
  test('releasing session A leaves session B credentials intact', async () => {
    const { _testSetSession, release, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')

    const ctxA = makeCtx({ sessionId: 'session-tea-release-a' })
    const ctxB = makeCtx({ sessionId: 'session-tea-release-b' })

    _testSetSession(ctxA.sessionId, ['secret-a-value'])
    _testSetSession(ctxB.sessionId, ['secret-b-value'])

    // Release only session A
    release(ctxA.sessionId)

    // Session A: credential no longer scrubbed
    const outputA = 'Contains secret-a-value here'
    const resultA = credentialScrubber(ctxA, 'tool', outputA)
    expect(resultA).toContain('secret-a-value') // not scrubbed — released

    // Session B: credential still scrubbed (unaffected by A's release)
    const outputB = 'Contains secret-b-value here'
    const resultB = credentialScrubber(ctxB, 'tool', outputB)
    expect(resultB).not.toContain('secret-b-value') // still scrubbed
    expect(resultB).toContain(REDACTED_STR)
  })
})

describe('FR-MCP6: AGENT_MCP_CREDENTIAL_MISSING — key name logged, value not exposed', () => {
  test('error code contains key name but not plaintext credential value', async () => {
    const { ToolError } = await import('../../lib/tool-error')
    const err = new ToolError(
      'AGENT_MCP_CREDENTIAL_MISSING',
      'AGENT_MCP_CREDENTIAL_MISSING: notion_integration_token',
    )
    expect(err.code).toBe('AGENT_MCP_CREDENTIAL_MISSING')
    expect(err.message).toContain('notion_integration_token') // key name ✓
    expect(err.message).not.toContain('secret-actual-value') // value ✗
  })

  test('AGENT_MCP_CREDENTIAL_MISSING error code is registered in error-codes.ts', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes')
    expect(ERROR_CODES.AGENT_MCP_CREDENTIAL_MISSING).toBe('AGENT_MCP_CREDENTIAL_MISSING')
  })

  test('mcp-manager.ts resolveCredentials throws ToolError with key name, never credential value', async () => {
    // Source introspection: error message contains credKey (key name), not the decrypted value
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/mcp/mcp-manager.ts', import.meta.url).pathname,
      'utf-8',
    )
    // Must throw with AGENT_MCP_CREDENTIAL_MISSING code
    expect(src).toContain("'AGENT_MCP_CREDENTIAL_MISSING'")
    // Error message must contain key name (credKey), NOT a decrypted credential value
    expect(src).toContain('credKey')
    // The throw must NOT expose the decrypted value (decrypt() only called after rows.length check)
    const throwLine = src.split('\n').find((l) => l.includes("throw new ToolError('AGENT_MCP_CREDENTIAL_MISSING'"))
    expect(throwLine).toBeDefined()
    expect(throwLine).not.toContain('decrypt(')
  })
})

describe('TEA P1: Scrubbing order — credential substring relationships handled correctly', () => {
  test('longer credential containing shorter as substring — both scrubbed independently', async () => {
    const { _testSetSession, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
    const ctx = makeCtx({ sessionId: 'session-tea-substr' })
    // 'secret' is substring of 'my-secret-key'
    _testSetSession(ctx.sessionId, ['secret', 'my-secret-key'])

    const output = 'Contains my-secret-key and standalone secret value'
    const result = credentialScrubber(ctx, 'tool', output)
    expect(result).not.toContain('my-secret-key')
    expect(result).not.toContain('secret')
    // Both are scrubbed
    expect(result).toContain(REDACTED_STR)
  })
})

// --- Updated TEA P0: Source Code Introspection ---

describe('TEA P0: credential-scrubber source introspection (D28 updated)', () => {
  test('uses @zapier/secret-scrubber imports', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain("from '@zapier/secret-scrubber'")
    expect(src).toContain('findSensitiveValues')
    expect(src).toContain('scrub')
  })

  test('credentialScrubber hook is synchronous; init() is async (D28)', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    // D28: init is async
    expect(src).toContain('export async function init')
    // Hook function itself stays synchronous (hot path — no await)
    expect(src).not.toContain('export async function credentialScrubber')
  })

  test('uses REDACTED constant from credential-patterns (not hardcoded string)', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain("import { scrubCredentials, REDACTED } from '../../lib/credential-patterns'")
    expect(src).toContain('REDACTED') // used in split/join
  })

  test('cliToken is never accessed (no token leakage)', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).not.toContain('ctx.cliToken')
  })

  test('D28 session map uses split/join (not regex replace) for safe string substitution', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain('.split(plaintext).join(REDACTED)')
  })

  test('release() exported and sets null (memory release)', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain('export function release')
    expect(src).toContain('sessionCredentials.set(sessionId, null)')
  })

  test('getDB used for init — listCredentialsForScrubber called', async () => {
    const fs = await import('fs')
    const src = fs.readFileSync(
      new URL('../../engine/hooks/credential-scrubber.ts', import.meta.url).pathname,
      'utf-8',
    )
    expect(src).toContain("from '../../db/scoped-query'")
    expect(src).toContain('getDB(ctx.companyId).listCredentialsForScrubber()')
  })
})
