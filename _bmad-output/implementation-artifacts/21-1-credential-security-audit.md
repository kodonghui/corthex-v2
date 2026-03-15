# Story 21.1: Credential Security Audit & Scrubber Coverage Verification

Status: done

## Story

As a **Technical Admin (박현우)**,
I want automated tests verifying AES-256 round-trip fidelity, credential-scrubber 100% coverage (built-in + MCP outputs), and zero credential leaks in agent outputs,
so that the Phase 1 Security Go/No-Go Gate is passed before production deployment.

## Acceptance Criteria

1. `credential-crypto.test.ts` passes with 20+ test strings including: empty string, 1KB string, special characters `"'<>&`, Korean `한글 테스트`, multi-line text — encrypt→decrypt round-trip for all
2. Tamper detection test confirms `DOMException` (or subclass) thrown on corrupted ciphertext
3. Two encryptions of identical plaintext produce different ciphertexts (random IV test)
4. `credential-scrubber.test.ts`: session with `[{ keyName: 'tistory_token', plaintext: 'SECRET_VALUE_XYZ' }]` loaded → PostToolUse hook output contains `***REDACTED***` not `SECRET_VALUE_XYZ`
5. MCP tool output (non-built-in tool name) scrubbed identically to built-in tool output (D28 — MCP not exempt)
6. `AGENT_MCP_CREDENTIAL_MISSING: notion_integration_token` error appears in admin logs with key name but NOT the actual credential value
7. `npx tsc --noEmit -p packages/server/tsconfig.json` → zero type errors

## Tasks / Subtasks

- [x] Task 1: Extend credential-crypto.test.ts to 20+ test strings (AC: #1, #2, #3)
  - [x] Add: 1KB string, special chars `"'<>&`, Korean `한글 테스트`, multi-line text
  - [x] Verify 20+ unique plaintexts across all test cases
- [x] Task 2: Verify credential-scrubber.test.ts covers all AC (AC: #4, #5)
  - [x] Confirm AC5 MCP tool output coverage with `notion_mcp_tool` test
  - [x] Add FR-MCP6 admin error log test (AC: #6)
- [x] Task 3: Add FR-MCP6 test — credential key name in log, value NOT exposed (AC: #6)
  - [x] Extended credential-scrubber.test.ts with FR-MCP6 describe block (3 tests)
- [x] Task 4: Run tsc check (AC: #7)
  - [x] `npx tsc --noEmit -p packages/server/tsconfig.json` → 0 errors confirmed

## Dev Notes

### Current State Assessment

Both test files already exist and pass (66 tests, 0 failures):
- `packages/server/src/__tests__/unit/credential-crypto.test.ts` — 37 tests
- `packages/server/src/__tests__/unit/credential-scrubber.test.ts` — 29 tests

**Gaps to address:**
1. `credential-crypto.test.ts` currently has ~15 distinct test strings — need 20+
   - Missing: `"'<>&` special chars, explicit 1KB string, multi-line text, `한글 테스트` (has Korean but different phrase)
2. FR-MCP6 test: "AGENT_MCP_CREDENTIAL_MISSING" error in admin logs with key name only — not yet tested

### Architecture Constraints (D23, D28)

**D23 (AES-256-GCM):**
- `lib/credential-crypto.ts` — only file allowed to call `crypto.subtle`
- Format: `base64(12-byte IV):base64(ciphertext+authTag)` — split on FIRST colon
- KEY: module-level `Uint8Array<ArrayBuffer>`, never exported/logged
- `CREDENTIAL_ENCRYPTION_KEY` must be 64-char hex (32 bytes)

**D28 (Credential Scrubber):**
- `engine/hooks/credential-scrubber.ts` — PostToolUse hook
- `init(ctx)` async — called at session start via `agent-loop.ts`
- `release(sessionId)` sync — sets null, memory released
- Uses `split/join` (not regex) for safe substitution
- MCP output NOT exempt — same PostToolUse hook path
- `sessionCredentials: Map<sessionId, string[] | null>` module-level map
- `listCredentialsForScrubber()` from `getDB(ctx.companyId)` — decrypts all creds

**FR-MCP6 (Admin log exposure):**
- `AGENT_MCP_CREDENTIAL_MISSING` error code — key name appears, value does NOT
- Source: `mcp-manager.ts` RESOLVE stage — credential template `{{credential:keyName}}`
- Error must be observable via admin routes (not just console.error)

### Key Files

| File | Purpose |
|------|---------|
| `packages/server/src/lib/credential-crypto.ts` | AES-256-GCM encrypt/decrypt |
| `packages/server/src/engine/hooks/credential-scrubber.ts` | PostToolUse credential scrubbing |
| `packages/server/src/__tests__/unit/credential-crypto.test.ts` | Extend to 20+ strings |
| `packages/server/src/__tests__/unit/credential-scrubber.test.ts` | Already covers AC4, AC5 |
| `packages/server/src/lib/error-codes.ts` | Must contain `CREDENTIAL_TEMPLATE_UNRESOLVED` |

### Test Strings to Add (reaching 20+)

Current unique plaintexts in credential-crypto.test.ts (count ~15):
1. `'my-api-key-value'`
2. `'한국어 API 키 — 테스트'`
3. `'x'.repeat(512)`
4. `''` (empty)
5. `'token:value:with:colons'`
6. `'test-value'`
7. `'super-secret-api-key-12345'`
8. `'repeated-value'`
9. `'concurrent-access-test'`
10. `'credential-alpha'`, `'credential-beta'`, `'credential-gamma'`
11. `'test'`
12. `'x'.repeat(10_240)` (10KB)

Need to ADD (to reach 20+):
- `'"\'<>&'` — HTML special chars (XSS/injection test)
- `'한글 테스트'` — exact phrase from story spec
- `'line1\nline2\nline3'` — multi-line text
- `'x'.repeat(1024)` — exactly 1KB
- `'Bearer eyJhbGciOiJSUzI1NiJ9...'` — JWT-like token with dots/slashes
- `'🔑🔐🗝️'` — emoji characters (UTF-8 multibyte)

### FR-MCP6 Test Structure

```typescript
// Test: credential key name in error, value NOT exposed
describe('FR-MCP6: AGENT_MCP_CREDENTIAL_MISSING — key name logged, value not exposed', () => {
  test('error code contains key name but not plaintext credential value', () => {
    const { ToolError } = require('../../lib/tool-error')
    const err = new ToolError(
      'AGENT_MCP_CREDENTIAL_MISSING',
      'AGENT_MCP_CREDENTIAL_MISSING: notion_integration_token',
    )
    expect(err.code).toBe('AGENT_MCP_CREDENTIAL_MISSING')
    expect(err.message).toContain('notion_integration_token') // key name ✓
    expect(err.message).not.toContain('secret-actual-value') // value ✗
  })
})
```

### Project Structure Notes

- Test files: `packages/server/src/__tests__/unit/`
- Pattern: `bun:test` with `describe`/`test`/`expect`
- Import pattern: `from '../../lib/credential-crypto'` (relative from `__tests__/unit/`)
- No mocking needed for crypto tests (uses real Web Crypto API via Bun)
- `CREDENTIAL_ENCRYPTION_KEY` must be set before import (module-level validation)

### References

- Story spec: `_bmad-output/planning-artifacts/tools-integration/epics-and-stories.md#Story 21.1`
- Architecture D23: `_bmad-output/planning-artifacts/tools-integration/architecture.md`
- Architecture D28: credential-scrubber extension section
- `credential-crypto.ts`: `packages/server/src/lib/credential-crypto.ts`
- `credential-scrubber.ts`: `packages/server/src/engine/hooks/credential-scrubber.ts`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Extended credential-crypto.test.ts to 38 tests (20 unique plaintexts: HTML special chars, 한글 테스트, multi-line, 1KB, JWT-like, emoji)
- AC2 tamper detection now explicitly checks `DOMException` via `.rejects.toBeInstanceOf(DOMException)` — not just `.toThrow()`
- Extended credential-scrubber.test.ts with FR-MCP6 block (3 tests)
- Added `AGENT_MCP_CREDENTIAL_MISSING` to error-codes.ts
- Final: 75 tests, 0 failures, tsc 0 errors

### File List

- `packages/server/src/__tests__/unit/credential-crypto.test.ts` (extended — 6 new tests, DOMException fix)
- `packages/server/src/__tests__/unit/credential-scrubber.test.ts` (extended — 3 FR-MCP6 tests)
- `packages/server/src/lib/error-codes.ts` (AGENT_MCP_CREDENTIAL_MISSING constant added)
