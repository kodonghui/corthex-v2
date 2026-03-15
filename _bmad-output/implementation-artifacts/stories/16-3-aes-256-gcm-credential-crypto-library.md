# Story 16.3: AES-256-GCM Credential Crypto Library

Status: done

## Story

As a **Platform Engineer**,
I want `credential-crypto.ts` to provide `encrypt`/`decrypt` using AES-256-GCM with the `CREDENTIAL_ENCRYPTION_KEY` env var,
So that credentials are stored in ciphertext and the encryption format is consistent for all callers.

## Acceptance Criteria

**AC1 — encrypt() output format**
- Given: `CREDENTIAL_ENCRYPTION_KEY` is set to a valid 64-char hex string (32 bytes)
- When: `encrypt('my-api-key-value')` is called
- Then: returns a string in format `base64(iv):base64(ciphertext+authTag)` (colon-separated, both parts non-empty)
- And: returned string does NOT contain the original plaintext

**AC2 — decrypt() round-trip**
- Given: the ciphertext string returned by `encrypt()`
- When: `decrypt(ciphertextString)` is called
- Then: returns the exact original plaintext `'my-api-key-value'`

**AC3 — startup validation (fail-fast)**
- Given: `CREDENTIAL_ENCRYPTION_KEY` is NOT set (undefined or wrong length)
- When: the `credential-crypto.ts` module is imported
- Then: throws `Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)')` at import time
- And: server startup fails with clear error (not a silent undefined reference)

**AC4 — tamper detection**
- Given: a ciphertext string that has been tampered (one byte changed)
- When: `decrypt(tamperedString)` is called
- Then: throws a `DOMException` (AES-GCM authentication tag mismatch — Web Crypto integrity guarantee)

**AC5 — non-deterministic encryption (random IV)**
- Given: the same plaintext encrypted twice
- When: both ciphertexts are compared
- Then: they differ (random 96-bit IV ensures ciphertext is non-deterministic — prevents frequency analysis)

## Tasks / Subtasks

- [x] Task 1: Create `packages/server/src/lib/credential-crypto.ts` (AC: #1, #2, #3, #4, #5)
  - [x] 1.1: Import-time key validation — read `CREDENTIAL_ENCRYPTION_KEY`, check length === 64 hex chars, throw on fail
  - [x] 1.2: `encrypt(plaintext: string): Promise<string>` — random 12-byte IV, AES-256-GCM via `crypto.subtle`, return `base64(iv):base64(ciphertext+authTag)`
  - [x] 1.3: `decrypt(stored: string): Promise<string>` — split on `:`, decode iv+ciphertext, AES-256-GCM decrypt, return plaintext
  - [x] 1.4: Ensure no key value appears in any log/error message

- [x] Task 2: Add `CREDENTIAL_TEMPLATE_UNRESOLVED` to `error-codes.ts` (AC: indirect — E11 pattern)
  - [x] 2.1: Add `CREDENTIAL_TEMPLATE_UNRESOLVED: 'CREDENTIAL_TEMPLATE_UNRESOLVED'` to ERROR_CODES in `packages/server/src/lib/error-codes.ts`

- [x] Task 3: Write unit tests in `packages/server/src/__tests__/unit/credential-crypto.test.ts` (AC: #1–#5)
  - [x] 3.1: AC1 — verify output format `base64:base64` with both parts non-empty
  - [x] 3.2: AC2 — round-trip encrypt→decrypt returns exact original plaintext
  - [x] 3.3: AC3 — mock env missing/wrong length → verify Error thrown at module load
  - [x] 3.4: AC4 — tamper 1 byte of ciphertext → verify DOMException thrown
  - [x] 3.5: AC5 — encrypt same plaintext twice → verify ciphertexts differ

- [x] Task 4: Verify `npx tsc --noEmit` passes (no type errors)

## Dev Notes

### Architecture Decision D23 — Implementation Blueprint

**File to create:** `packages/server/src/lib/credential-crypto.ts`

**Implementation must match this EXACT pattern (D23):**

```typescript
// packages/server/src/lib/credential-crypto.ts

const KEY_HEX = process.env.CREDENTIAL_ENCRYPTION_KEY;
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
}
const KEY = Buffer.from(KEY_HEX, 'hex');

// AES-256-GCM: base64(iv):base64(ciphertext+authTag)
export async function encrypt(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey,
    new TextEncoder().encode(plaintext));
  // Web Crypto AES-GCM appends 16-byte authTag to ciphertext automatically
  return Buffer.from(iv).toString('base64') + ':' + Buffer.from(ciphertext).toString('base64');
}

export async function decrypt(stored: string): Promise<string> {
  const [ivB64, ciphertextB64] = stored.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plaintext);
}
```

**Critical details:**
- `crypto.subtle` — Bun has built-in Web Crypto API (no `node:crypto` needed for AES-GCM)
- `Buffer.from(KEY_HEX, 'hex')` — converts 64-char hex string to 32-byte Uint8Array
- IV: 12 bytes (96 bits) — standard for AES-GCM (NIST SP 800-38D)
- authTag: 128 bits (16 bytes) — automatically appended by Web Crypto AES-GCM to ciphertext output
- Format: `base64(12-byte-iv):base64(ciphertext||16-byte-authTag)`
- **The KEY buffer must NEVER appear in logs or error messages** (D23 security requirement)

### E11 Credential Encryption Pattern — Mandatory

**caller pattern** (used by Stories 16.4, 16.5 and engine RESOLVE stage):
```typescript
// ✅ CORRECT — use credential-crypto.ts exclusively
import { encrypt, decrypt } from '@/lib/credential-crypto';

// Storing
const encryptedValue = await encrypt(plaintext);
await getDB(companyId).insertCredential({ keyName, encryptedValue }, userId);

// Retrieving (RESOLVE stage)
const row = await getDB(companyId).getCredential(keyName);
if (!row) throw new ToolError('CREDENTIAL_TEMPLATE_UNRESOLVED', `Credential '${keyName}' not found`);
const plaintext = await decrypt(row.encryptedValue);

// ❌ WRONG — never call crypto.subtle directly in business logic (format mismatch risk)
```

**Rule:** `encrypt()`/`decrypt()` used ONLY from `credential-crypto.ts`. No direct `crypto.subtle` calls in callers.

### error-codes.ts Extension (Task 2)

Add to `packages/server/src/lib/error-codes.ts`:
```typescript
// Credential errors (E11, D3 extension)
CREDENTIAL_TEMPLATE_UNRESOLVED: 'CREDENTIAL_TEMPLATE_UNRESOLVED',
```

This code is used by the RESOLVE stage (Stories 18.3–18.5) when a credential template `{{keyName}}` cannot be resolved.

### existing lib/crypto.ts — Do NOT Touch

There is already `packages/server/src/lib/crypto.ts` in the repo (legacy). The new file is `credential-crypto.ts` (different name). Check `lib/crypto.ts` to ensure no conflicts in exports, but do NOT modify it.

### Testing Pattern — bun:test + module mock for env

**CRITICAL:** Testing AC3 (fail-fast at import time) requires careful setup since the module throws at import. Use dynamic `import()` with a manipulated `process.env`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// For AC3 test — temporarily unset the env var
describe('AC3: fail-fast validation', () => {
  it('throws if CREDENTIAL_ENCRYPTION_KEY not set', async () => {
    const savedKey = process.env.CREDENTIAL_ENCRYPTION_KEY;
    delete process.env.CREDENTIAL_ENCRYPTION_KEY;

    try {
      // Use dynamic import or reimport with cleared module cache
      // Bun's module cache: may need a separate test file or workaround
      // Alternative: directly call the validation logic extracted to a testable function
    } finally {
      process.env.CREDENTIAL_ENCRYPTION_KEY = savedKey;
    }
  });
});
```

**Simpler AC3 approach:** Extract key validation to a pure function and test that function:
```typescript
// In credential-crypto.ts:
export function _validateKeyHex(hex: string | undefined): void {
  if (!hex || hex.length !== 64) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
}
// Then test _validateKeyHex directly without env manipulation
```

**For AC1–AC2, AC4–AC5:** Set `process.env.CREDENTIAL_ENCRYPTION_KEY` to a valid test key before importing:
```typescript
// Valid 64-char hex test key (32 bytes)
const TEST_KEY = 'a'.repeat(64); // simple test key: 32 bytes of 0xaa
```

**For AC4 (tamper detection):** Modify the base64-decoded ciphertext buffer by flipping one byte, then re-encode:
```typescript
const ciphertextBytes = Buffer.from(ciphertextB64, 'base64');
ciphertextBytes[0] ^= 0xff; // flip first byte
const tampered = ivB64 + ':' + ciphertextBytes.toString('base64');
await expect(decrypt(tampered)).rejects.toThrow(); // DOMException
```

### DB Schema Context (Story 16.2 — already done)

The `credentials` table `encrypted_value` column stores the output of `encrypt()`:
- Type: `text` (stores `base64(iv):base64(ciphertext+authTag)` string)
- Location: `packages/server/src/db/schema/credentials.ts`
- Unique constraint: `(company_id, key_name)` — one credential per key per company

### Project Structure Notes

```
packages/server/src/
├── lib/
│   ├── credential-crypto.ts   [NEW — this story]
│   ├── crypto.ts              [EXISTING — do not touch]
│   └── error-codes.ts         [MODIFY — add CREDENTIAL_TEMPLATE_UNRESOLVED]
└── __tests__/unit/
    └── credential-crypto.test.ts  [NEW — this story]
```

### Security Rules (D23)

1. `CREDENTIAL_ENCRYPTION_KEY` value MUST NEVER appear in logs, error messages, or stack traces
2. The `KEY` buffer (derived from env var) MUST NOT be exported from the module
3. In tests, use a synthetic test key (not a real key value from any environment)
4. `_validateKeyHex` helper (if extracted) — only for testability, mark with leading `_` to signal internal use

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#D23] — AES-256-GCM key management decision
- [Source: _bmad-output/planning-artifacts/architecture.md#E11] — Credential encryption/decryption pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#D28] — Scrubber coverage extension (Story 16.6)
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story-16.3] — User story + ACs
- [Source: packages/server/src/lib/error-codes.ts] — ERROR_CODES registry to extend
- [Source: packages/server/src/db/schema/credentials.ts] — encrypted_value column (Story 16.2)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- **tsc error**: `Buffer.from(hex, 'hex')` returns `Uint8Array<ArrayBufferLike>` — `crypto.subtle.importKey` expects `Uint8Array<ArrayBuffer>`. Fix: manual hex decode loop into `new Uint8Array(32)` which creates clean `ArrayBuffer`.

### Completion Notes List

- ✅ Task 1: `credential-crypto.ts` — AES-256-GCM encrypt/decrypt with fail-fast key validation. `_validateKeyHex` exported for testability. KEY is module-private, never logged.
- ✅ Task 2: `CREDENTIAL_TEMPLATE_UNRESOLVED` added to `error-codes.ts` for E11 RESOLVE stage callers.
- ✅ Task 3: 23 unit tests (bun:test) — all ACs covered: AC1 format, AC2 round-trip (UTF-8, long, empty, special chars), AC3 fail-fast (4 cases), AC4 tamper (3 cases), AC5 non-deterministic (3 cases).
- ✅ Task 4: `tsc --noEmit` exit 0.

### File List

- `packages/server/src/lib/credential-crypto.ts` — AES-256-GCM encrypt/decrypt module (NEW)
- `packages/server/src/lib/error-codes.ts` — Added CREDENTIAL_TEMPLATE_UNRESOLVED (MODIFIED)
- `packages/server/src/__tests__/unit/credential-crypto.test.ts` — 23 unit tests (NEW)
