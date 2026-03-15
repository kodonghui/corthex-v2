# Story 16.6: Credential-Scrubber D28 Extension

Status: done

## Story

As a **Platform Engineer**,
I want `credential-scrubber.ts` extended with a session-start `init(ctx)` method that loads all company credentials as plaintext for scanning, covering both built-in and MCP tool outputs,
So that no registered API key value ever appears in agent outputs (100% coverage, NFR-S2).

## Acceptance Criteria

**AC1 — init(ctx) loads credentials and stores in session map**
- Given: `credential-scrubber.ts` has a new exported `async function init(ctx: SessionContext): Promise<void>`
- When: `agent-loop.ts` (Story 18.5) calls `await scrubber.init(ctx)` at session start
- Then: calls `getDB(ctx.companyId).listCredentialsForScrubber()` and stores plaintext values in a module-level `Map<string, string[] | null>` keyed by `ctx.sessionId`
- And: init completes before the first tool call is processed

**AC2 — credentialScrubber scrubs registered plaintext values**
- Given: a session with `tistory_access_token = 'secret-oauth-abc123'` registered, and `init(ctx)` has been called
- When: a tool (built-in or MCP) returns output containing `'secret-oauth-abc123'`
- Then: `credentialScrubber(ctx, toolName, output)` replaces the value with `REDACTED` (`***REDACTED***`) in the returned string
- And: logs `{ event: 'credential_scrubbed', toolName, sessionId, timestamp }` at INFO level via `console.info(JSON.stringify({...}))` — NO credential value in log

**AC3 — release(sessionId) nullifies in-memory credential list**
- Given: a session ends (agent-loop.ts finally block via Story 18.5)
- When: `scrubber.release(ctx.sessionId)` is called
- Then: the in-memory plaintext credential list for this sessionId is set to `null` (memory released)

**AC4 — Empty credentials: init completes without error**
- Given: a company with 0 registered credentials
- When: `scrubber.init(ctx)` is called
- Then: completes without error (empty array stored — no scrubbing needed, tool outputs pass through)

**AC5 — MCP tool output is NOT exempt from scrubbing**
- Given: a MCP tool returns output echoing a registered credential value
- When: `credentialScrubber(ctx, mcpToolName, output)` is called
- Then: the credential is scrubbed — MCP output is subject to the same scrubbing logic as built-in tools

## Tasks / Subtasks

- [x] Task 1: Extend `packages/server/src/engine/hooks/credential-scrubber.ts` (AC: #1–#5)
  - [x] 1.1: Add `import { getDB } from '../../db/scoped-query'` and `import { REDACTED } from '../../lib/credential-patterns'`
  - [x] 1.2: Add module-level `const sessionCredentials = new Map<string, string[] | null>()`
  - [x] 1.3: Export `async function init(ctx: SessionContext): Promise<void>` — calls `listCredentialsForScrubber()` and stores plaintext values
  - [x] 1.4: Export `function release(sessionId: string): void` — sets `sessionCredentials.set(sessionId, null)`
  - [x] 1.5: Modify `credentialScrubber()` — add Step 3 (D28): scan session credentials, replace matches with `REDACTED`, log `credential_scrubbed` event

- [x] Task 2: Update tests in `packages/server/src/__tests__/unit/credential-scrubber.test.ts` (AC: #1–#5)
  - [x] 2.1: Update source-introspection tests that will break after D28 changes (see Dev Notes — CRITICAL)
  - [x] 2.2: AC1 — init() stores plaintext values in session map
  - [x] 2.3: AC2 — credentialScrubber scrubs registered session credential
  - [x] 2.4: AC3 — release() sets session entry to null
  - [x] 2.5: AC4 — init() with empty company credentials completes without error
  - [x] 2.6: AC5 — MCP tool output scrubbed same as built-in tool output

- [x] Task 3: Verify `npx tsc --noEmit` passes

## Dev Notes

### Architecture Decision — D28

**Design**: Module-level `Map<string, string[] | null>` stores session credentials by sessionId. This allows:
- Multiple concurrent sessions (each has independent credential list)
- Synchronous read in `credentialScrubber()` (no async needed in hot path)
- Explicit memory release via `release()` (prevents accumulation)

```typescript
// Module-level session state (D28)
const sessionCredentials = new Map<string, string[] | null>()
```

### Full Implementation Blueprint

```typescript
import { scrub, findSensitiveValues } from '@zapier/secret-scrubber'
import type { SessionContext } from '../types'
import { scrubCredentials, REDACTED } from '../../lib/credential-patterns'
import { getDB } from '../../db/scoped-query'

// D28: In-memory session credential map (sessionId → plaintext values[])
const sessionCredentials = new Map<string, string[] | null>()

/**
 * D28: Load company credentials into memory for this session.
 * Called by agent-loop.ts at session start (Story 18.5 wires this).
 */
export async function init(ctx: SessionContext): Promise<void> {
  const credentials = await getDB(ctx.companyId).listCredentialsForScrubber()
  sessionCredentials.set(ctx.sessionId, credentials.map((c) => c.plaintext))
}

/**
 * D28: Release in-memory credential list for this session.
 * Called by agent-loop.ts in finally block (Story 18.5 wires this).
 */
export function release(sessionId: string): void {
  sessionCredentials.set(sessionId, null)
}

export function credentialScrubber(
  ctx: SessionContext,
  toolName: string,
  toolOutput: string,
): string {
  // Step 1: Static regex pattern scrubbing (existing behavior)
  let result = scrubCredentials(toolOutput)

  // Step 2: JSON-based secret scrubbing via @zapier/secret-scrubber (existing)
  try {
    const obj = JSON.parse(result)
    const secrets = findSensitiveValues(obj)
    if (secrets.length > 0) {
      result = JSON.stringify(scrub(obj, secrets))
    }
  } catch { /* non-JSON — regex-only scrubbing sufficient */ }

  // Step 3: D28 — session-specific registered credential scrubbing
  const sessionCreds = sessionCredentials.get(ctx.sessionId) ?? []
  for (const plaintext of sessionCreds) {
    if (plaintext && result.includes(plaintext)) {
      result = result.split(plaintext).join(REDACTED)
      // Log scrubbing event — NO credential value in log (AC2 security rule)
      console.info(JSON.stringify({
        event: 'credential_scrubbed',
        toolName,
        sessionId: ctx.sessionId,
        timestamp: new Date().toISOString(),
      }))
    }
  }

  return result
}
```

### CRITICAL: Existing Tests That Will Break After D28 Changes

The existing source-introspection tests in `credential-scrubber.test.ts` will FAIL after this story's changes:

**Test 1** — `'is synchronous function (no async/await)'`:
```typescript
test('is synchronous function (no async/await)', () => {
  expect(src).not.toContain('async function')  // ← BREAKS: init() is async
  expect(src).not.toContain('await ')           // ← BREAKS: init() uses await
})
```
**Fix**: Change test to verify `credentialScrubber` (the hook function itself) is sync, but `init` is async:
```typescript
test('credentialScrubber hook is synchronous (no async); init() is async (D28)', () => {
  expect(src).toContain('export async function init')  // D28: init is async
  expect(src).not.toContain('export async function credentialScrubber') // hook stays sync
})
```

**Test 2** — `'uses ***REDACTED*** masking format'`:
```typescript
test('uses ***REDACTED*** masking format', () => {
  expect(src).toContain("'***REDACTED***'")  // ← BREAKS: after D28 we use REDACTED constant
})
```
**Fix**: After D28, `REDACTED` is imported from `credential-patterns.ts` and used directly (not as a string literal). Update to:
```typescript
test('uses REDACTED constant from credential-patterns (not hardcoded string)', () => {
  expect(src).toContain("import { scrubCredentials, REDACTED } from '../../lib/credential-patterns'")
})
```

### Scrubbing Logic — `result.split(plaintext).join(REDACTED)`

Using `split/join` instead of `String.replace()` avoids regex special character escaping issues with credential values that may contain regex metacharacters like `.`, `*`, `$`, etc.

### Logging Pattern (AC2)

```typescript
console.info(JSON.stringify({
  event: 'credential_scrubbed',
  toolName,
  sessionId: ctx.sessionId,
  timestamp: new Date().toISOString(),
}))
// NEVER log: plaintext value, keyName, companyId
```

### Agent-Loop.ts Wiring (NOT in this story)

This story implements `init()` and `release()` only. The actual calls in `agent-loop.ts` are Story 18.5's responsibility:
- `await scrubber.init(ctx)` — at session start (before first tool call)
- `scrubber.release(ctx.sessionId)` — in finally block (session teardown)

### Testing Pattern (bun:test — logic simulation + real crypto)

```typescript
process.env.CREDENTIAL_ENCRYPTION_KEY = 'ab'.repeat(32) // Set before imports

// AC1: init() test
test('init() stores plaintext credentials in session map', async () => {
  const { init, credentialScrubber } = await import('../../engine/hooks/credential-scrubber')
  // Use real encrypt/decrypt via credential-crypto
  // Mock getDB via module-level sessionCredentials injection pattern
})

// AC2: scrubbing test
test('credentialScrubber scrubs session-registered credential', async () => {
  // After init(), the registered value should be scrubbed
  const toolOutput = 'The access token is secret-oauth-abc123 and it works'
  const result = credentialScrubber(ctx, 'tistory_tool', toolOutput)
  expect(result).not.toContain('secret-oauth-abc123')
  expect(result).toContain('***REDACTED***')
})
```

**Testing challenge**: `init()` calls `getDB(companyId).listCredentialsForScrubber()` which requires a real DB connection. Since tests are unit tests (no real DB), use the same approach as other unit tests in this codebase: **simulate via direct sessionCredentials map manipulation** by exposing a test helper or by bypassing init() and directly invoking the session state.

**Recommended approach**: Export a test-only helper `_testSetSession(sessionId, plaintexts)` that directly sets the session map. This avoids DB dependency in unit tests while still testing the scrubbing behavior:

```typescript
// Export for testing only — allows unit tests to bypass init() DB call
export function _testSetSession(sessionId: string, plaintexts: string[]): void {
  sessionCredentials.set(sessionId, plaintexts)
}
```

### Import Note — CREDENTIAL_ENCRYPTION_KEY

```typescript
// Set BEFORE importing anything that imports credential-crypto
process.env.CREDENTIAL_ENCRYPTION_KEY = 'ab'.repeat(32) // 64-char hex
```

### Project Structure Notes

```
packages/server/src/
├── engine/hooks/
│   └── credential-scrubber.ts   [MODIFY — add init(), release(), _testSetSession(), D28 Step 3]
└── __tests__/unit/
    └── credential-scrubber.test.ts  [MODIFY — update broken tests, add D28 tests]
```

### Dependencies Satisfied by Prior Stories

- `getDB(companyId).listCredentialsForScrubber()` → Story 16.4 (DONE)
- `CREDENTIAL_ENCRYPTION_KEY` env var → Story 16.3 (DONE)
- `scrubCredentials`, `REDACTED` from `credential-patterns.ts` → Already exists

### References

- [Source: _bmad-output/planning-artifacts/tools-integration/epics-and-stories.md#Story-16.6]
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D28] — D28 session-start credentials load
- [Source: _bmad-output/planning-artifacts/tools-integration/architecture.md#D4] — Hook pipeline order
- [Source: packages/server/src/engine/hooks/credential-scrubber.ts] — existing file to modify
- [Source: packages/server/src/lib/credential-patterns.ts] — REDACTED constant + scrubCredentials
- [Source: packages/server/src/db/scoped-query.ts] — listCredentialsForScrubber() (Story 16.4)
- [Source: packages/server/src/engine/types.ts] — SessionContext interface

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: Extended credential-scrubber.ts with init(), release(), _testSetSession() (D28). Step 3 session-credential scanning added to credentialScrubber().
- ✅ Task 2: Rewrote credential-scrubber.test.ts — fixed 2 breaking source-introspection tests, added AC1-AC5 D28 tests. 29 pass, 0 fail.
- ✅ Task 3: npx tsc --noEmit exit 0.
- ✅ TEA: 5 additional risk-based tests added (P0 empty-string guard, P0 audit log security, P1 release isolation, P1 substring ordering). 34 total, all passing.
- ✅ Code Review: MEDIUM fix applied — added minimum length guard (≥4 chars) in Step 3 loop to prevent short-credential output corruption. LOW fix — removed unused `beforeEach` import from test file. 34 pass, 0 fail, tsc clean.

### File List

- `packages/server/src/engine/hooks/credential-scrubber.ts` — D28 extension: init(), release(), _testSetSession(), Step 3 scrubbing (MODIFIED)
- `packages/server/src/__tests__/unit/credential-scrubber.test.ts` — Complete rewrite: 29 tests covering AC1-AC5 + existing static-pattern tests (MODIFIED)
- `_bmad-output/implementation-artifacts/stories/16-6-credential-scrubber-d28-extension.md` — story file (MODIFIED)
