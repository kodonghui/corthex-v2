/**
 * Story 16.3: AES-256-GCM Credential Crypto Library tests (bun:test)
 *
 * AC1 — encrypt() output format: base64(iv):base64(ciphertext+authTag)
 * AC2 — decrypt() round-trip: exact plaintext recovered
 * AC3 — fail-fast: throws on missing/malformed CREDENTIAL_ENCRYPTION_KEY
 * AC4 — tamper detection: DOMException on corrupted ciphertext
 * AC5 — non-deterministic: same plaintext → different ciphertexts (random IV)
 */

import { describe, it, expect, beforeAll } from 'bun:test';

// Valid 64-char hex test key (32 bytes of 0xab)
const TEST_KEY = 'ab'.repeat(32);

// Set key BEFORE importing credential-crypto (module validates at import time)
process.env.CREDENTIAL_ENCRYPTION_KEY = TEST_KEY;

// Dynamic import after env is set
let encrypt: (p: string) => Promise<string>;
let decrypt: (s: string) => Promise<string>;
let _validateKeyHex: (hex: string | undefined) => void;

beforeAll(async () => {
  const mod = await import('../../lib/credential-crypto');
  encrypt = mod.encrypt;
  decrypt = mod.decrypt;
  _validateKeyHex = mod._validateKeyHex;
});

// ── AC3: fail-fast validation ─────────────────────────────────────────────────
describe('AC3: CREDENTIAL_ENCRYPTION_KEY fail-fast validation', () => {
  it('throws if key is undefined', () => {
    expect(() => _validateKeyHex(undefined)).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)',
    );
  });

  it('throws if key is empty string', () => {
    expect(() => _validateKeyHex('')).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)',
    );
  });

  it('throws if key is too short (< 64 chars)', () => {
    expect(() => _validateKeyHex('ab'.repeat(16))).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)',
    );
  });

  it('throws if key is too long (> 64 chars)', () => {
    expect(() => _validateKeyHex('ab'.repeat(33))).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)',
    );
  });

  it('does NOT throw for exactly 64-char hex string', () => {
    expect(() => _validateKeyHex('ab'.repeat(32))).not.toThrow();
  });
});

// ── AC1: output format ────────────────────────────────────────────────────────
describe('AC1: encrypt() output format', () => {
  it('returns a colon-separated string', async () => {
    const result = await encrypt('my-api-key-value');
    expect(result).toContain(':');
  });

  it('returns base64(iv):base64(ciphertext+authTag) with both parts non-empty', async () => {
    const result = await encrypt('my-api-key-value');
    const [ivPart, ciphertextPart] = result.split(':');
    expect(ivPart).toBeTruthy();
    expect(ciphertextPart).toBeTruthy();
    expect(ivPart!.length).toBeGreaterThan(0);
    expect(ciphertextPart!.length).toBeGreaterThan(0);
  });

  it('IV part decodes to exactly 12 bytes (96-bit IV)', async () => {
    const result = await encrypt('test-value');
    const [ivPart] = result.split(':');
    const iv = Buffer.from(ivPart!, 'base64');
    expect(iv.byteLength).toBe(12);
  });

  it('ciphertext part decodes to len(plaintext) + 16 bytes (authTag)', async () => {
    const plaintext = 'my-api-key-value'; // 16 chars = 16 bytes
    const result = await encrypt(plaintext);
    const [, ciphertextPart] = result.split(':');
    const ciphertext = Buffer.from(ciphertextPart!, 'base64');
    // AES-GCM: output = len(plaintext) + 16 (authTag)
    expect(ciphertext.byteLength).toBe(plaintext.length + 16);
  });

  it('output does NOT contain the original plaintext', async () => {
    const plaintext = 'super-secret-api-key-12345';
    const result = await encrypt(plaintext);
    expect(result).not.toContain(plaintext);
    // Also verify it's not present in base64 decode of either part
    expect(Buffer.from(result, 'base64').toString()).not.toContain(plaintext);
  });
});

// ── AC2: round-trip ───────────────────────────────────────────────────────────
describe('AC2: encrypt→decrypt round-trip', () => {
  it('recovers exact original plaintext', async () => {
    const plaintext = 'my-api-key-value';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles Korean characters (UTF-8)', async () => {
    const plaintext = '한국어 API 키 — 테스트';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles long credential values (512 chars)', async () => {
    const plaintext = 'x'.repeat(512);
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles empty string plaintext', async () => {
    const plaintext = '';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles special characters including colons', async () => {
    // Colon is also the separator — ensure split uses only first colon
    const plaintext = 'token:value:with:colons';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });
});

// ── AC4: tamper detection ─────────────────────────────────────────────────────
describe('AC4: tamper detection — DOMException on corrupted ciphertext', () => {
  it('throws DOMException (or subclass) when ciphertext bytes are flipped (AC2)', async () => {
    const ciphertext = await encrypt('my-api-key-value');
    const [ivPart, ciphertextPart] = ciphertext.split(':');

    // Flip first byte of ciphertext (authTag region is last 16 bytes, but modifying any byte fails)
    const bytes = Buffer.from(ciphertextPart!, 'base64');
    bytes[0] ^= 0xff;
    const tampered = ivPart + ':' + bytes.toString('base64');

    // Web Crypto API throws DOMException on authTag mismatch (AC2 — "DOMException or subclass")
    await expect(decrypt(tampered)).rejects.toBeInstanceOf(DOMException);
  });

  it('throws DOMException (or subclass) when authTag bytes are corrupted (last 16 bytes)', async () => {
    const ciphertext = await encrypt('my-api-key-value');
    const [ivPart, ciphertextPart] = ciphertext.split(':');

    const bytes = Buffer.from(ciphertextPart!, 'base64');
    // Corrupt last byte (authTag region)
    bytes[bytes.length - 1] ^= 0x01;
    const tampered = ivPart + ':' + bytes.toString('base64');

    await expect(decrypt(tampered)).rejects.toBeInstanceOf(DOMException);
  });

  it('throws DOMException (or subclass) when IV is altered', async () => {
    const ciphertext = await encrypt('my-api-key-value');
    const [ivPart, ciphertextPart] = ciphertext.split(':');

    const iv = Buffer.from(ivPart!, 'base64');
    iv[0] ^= 0xff;
    const tampered = iv.toString('base64') + ':' + ciphertextPart;

    await expect(decrypt(tampered)).rejects.toBeInstanceOf(DOMException);
  });

  it('throws on missing colon separator (invalid format)', async () => {
    await expect(decrypt('notavalidciphertextformat')).rejects.toThrow(
      'invalid ciphertext format',
    );
  });
});

// ── AC5: non-deterministic (random IV) ───────────────────────────────────────
describe('AC5: non-deterministic encryption (random IV)', () => {
  it('encrypting same plaintext twice produces different ciphertexts', async () => {
    const plaintext = 'my-api-key-value';
    const ct1 = await encrypt(plaintext);
    const ct2 = await encrypt(plaintext);
    expect(ct1).not.toBe(ct2);
  });

  it('IV parts differ between two encryptions of same plaintext', async () => {
    const plaintext = 'test-value';
    const ct1 = await encrypt(plaintext);
    const ct2 = await encrypt(plaintext);
    const iv1 = ct1.split(':')[0];
    const iv2 = ct2.split(':')[0];
    expect(iv1).not.toBe(iv2);
  });

  it('encrypting 10 times yields 10 unique ciphertexts', async () => {
    const plaintext = 'repeated-value';
    const ciphertexts = await Promise.all(
      Array.from({ length: 10 }, () => encrypt(plaintext)),
    );
    const unique = new Set(ciphertexts);
    expect(unique.size).toBe(10);
  });
});

// ── E11: error-codes integration ──────────────────────────────────────────────
describe('E11: CREDENTIAL_TEMPLATE_UNRESOLVED error code exists', () => {
  it('ERROR_CODES contains CREDENTIAL_TEMPLATE_UNRESOLVED', async () => {
    const { ERROR_CODES } = await import('../../lib/error-codes');
    expect(ERROR_CODES.CREDENTIAL_TEMPLATE_UNRESOLVED).toBe('CREDENTIAL_TEMPLATE_UNRESOLVED');
  });
});

// ── TEA P0: Security — key must not leak in error messages (D23) ──────────────
describe('[TEA P0] D23 security — KEY must not appear in any error output', () => {
  it('_validateKeyHex error message does not include the key value', () => {
    const testKey = 'deadbeef'.repeat(8); // 64-char hex test key
    const shortKey = 'deadbeef'.repeat(4); // 32-char (too short)
    try {
      _validateKeyHex(shortKey);
      throw new Error('Expected _validateKeyHex to throw');
    } catch (err: unknown) {
      const msg = String(err);
      // Error message must not contain the short key value itself
      expect(msg).not.toContain(shortKey);
      // Should contain the diagnostic message only
      expect(msg).toContain('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes');
    }
    void testKey; // referenced but key value not in error
  });

  it('decrypt() error for invalid format does not include KEY buffer content', async () => {
    try {
      await decrypt('invalid-no-colon-format');
    } catch (err: unknown) {
      const msg = String(err);
      // The error should NOT contain the test key value 'abababab...'
      expect(msg).not.toContain(TEST_KEY);
      expect(msg).not.toContain(TEST_KEY.slice(0, 16)); // even a prefix
    }
  });
});

// ── TEA P0: Concurrent access — shared module-level KEY ───────────────────────
describe('[TEA P0] Concurrent encrypt/decrypt with shared module KEY', () => {
  it('10 parallel encrypt calls produce 10 unique, independently decryptable values', async () => {
    const plaintext = 'concurrent-access-test';
    const results = await Promise.all(
      Array.from({ length: 10 }, () => encrypt(plaintext)),
    );

    // All ciphertexts unique (random IV)
    const unique = new Set(results);
    expect(unique.size).toBe(10);

    // All decrypt back to original plaintext
    const decrypted = await Promise.all(results.map((ct) => decrypt(ct)));
    for (const d of decrypted) {
      expect(d).toBe(plaintext);
    }
  });

  it('interleaved encrypt+decrypt calls produce correct results', async () => {
    const pairs = [
      'credential-alpha',
      'credential-beta',
      'credential-gamma',
    ];

    // Encrypt all in parallel
    const encrypted = await Promise.all(pairs.map((p) => encrypt(p)));

    // Decrypt in reverse order (interleaved with potential new encrypts)
    const [third, second, first] = await Promise.all([
      decrypt(encrypted[2]!),
      decrypt(encrypted[1]!),
      decrypt(encrypted[0]!),
    ]);

    expect(first).toBe('credential-alpha');
    expect(second).toBe('credential-beta');
    expect(third).toBe('credential-gamma');
  });
});

// ── TEA P1: Edge cases — stored string format variants ────────────────────────
describe('[TEA P1] decrypt() stored string format edge cases', () => {
  it('rejects empty string (no colon)', async () => {
    await expect(decrypt('')).rejects.toThrow('invalid ciphertext format');
  });

  it('rejects string with only colon (empty iv + empty ciphertext)', async () => {
    // ':' has a colon but empty parts — should throw on crypto operation
    await expect(decrypt(':')).rejects.toThrow();
  });

  it('handles stored strings with colons in base64 ciphertext part', async () => {
    // The split uses indexOf(':') — only splits on FIRST colon.
    // base64 chars are [A-Z a-z 0-9 + / =] — no colons in standard base64.
    // This test verifies the contract: first colon is the separator.
    const ct = await encrypt('test');
    const parts = ct.split(':');
    // Verify only 2 parts (IV + ciphertext — no extra colons in base64)
    expect(parts.length).toBe(2);
  });

  it('rejects truncated ciphertext (too short for authTag)', async () => {
    // authTag is 16 bytes — a 1-byte ciphertext cannot have a valid authTag
    const fakeCiphertext = Buffer.alloc(1).toString('base64');
    const fakeIv = Buffer.alloc(12).toString('base64');
    const tampered = fakeIv + ':' + fakeCiphertext;
    await expect(decrypt(tampered)).rejects.toThrow();
  });
});

// ── TEA P1: Very large credential values ──────────────────────────────────────
describe('[TEA P1] Large credential values', () => {
  it('encrypts and decrypts 10KB credential (long JWT, RSA private key)', async () => {
    const plaintext = 'x'.repeat(10_240); // 10KB
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
    // Verify ciphertext is larger than plaintext + IV header
    const ciphertextPart = ciphertext.split(':')[1]!;
    const bytes = Buffer.from(ciphertextPart, 'base64');
    expect(bytes.byteLength).toBe(plaintext.length + 16); // + authTag
  });
});

// ── Story 21.1: AC1 — Extended plaintext coverage (20+ unique strings) ────────
describe('[AC1] Extended plaintext coverage — 20+ unique test strings', () => {
  it('handles HTML/XSS special characters (double-quote, single-quote, lt, gt, amp)', async () => {
    const plaintext = '"\'<>&';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles exact story spec Korean phrase: 한글 테스트', async () => {
    const plaintext = '한글 테스트';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles multi-line text (newlines in credential value)', async () => {
    const plaintext = 'line1\nline2\nline3';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles exactly 1KB credential value', async () => {
    const plaintext = 'x'.repeat(1024); // exactly 1KB
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
    // AES-GCM output: len(plaintext) + 16 authTag bytes
    const bytes = Buffer.from(ciphertext.split(':')[1]!, 'base64');
    expect(bytes.byteLength).toBe(1024 + 16);
  });

  it('handles JWT-like token with dots and slashes', async () => {
    const plaintext = 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });

  it('handles emoji characters (UTF-8 multibyte: 🔑🔐🗝️)', async () => {
    const plaintext = '🔑🔐🗝️';
    const ciphertext = await encrypt(plaintext);
    const recovered = await decrypt(ciphertext);
    expect(recovered).toBe(plaintext);
  });
});
