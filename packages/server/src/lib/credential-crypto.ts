/**
 * credential-crypto.ts — AES-256-GCM credential encryption/decryption (D23, E11)
 *
 * USAGE:
 *   import { encrypt, decrypt } from '@/lib/credential-crypto';
 *   const stored = await encrypt(plaintext);   // base64(iv):base64(ciphertext+authTag)
 *   const plain  = await decrypt(stored);
 *
 * SECURITY RULES (D23):
 *   - Only this module may call crypto.subtle for credential encryption
 *   - The KEY buffer is never exported or logged
 *   - CREDENTIAL_ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes = 256 bits)
 *   - Server startup fails immediately if key is missing or malformed (fail-fast)
 *
 * FORMAT: base64(12-byte IV) + ':' + base64(ciphertext || 16-byte authTag)
 *   - Web Crypto AES-GCM appends the 128-bit authTag to ciphertext automatically
 *   - authTag provides tamper detection (DOMException on mismatch)
 *
 * Phase 4: this module is the sole migration point for KMS integration (D23 rationale)
 */

// ── Fail-fast key validation (AC3) ────────────────────────────────────────────
// Exported for unit-testability only — callers must NOT call this directly.
export function _validateKeyHex(hex: string | undefined): void {
  if (!hex || hex.length !== 64) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
}

_validateKeyHex(process.env.CREDENTIAL_ENCRYPTION_KEY);

// KEY is a module-level constant — never exported, never logged.
// Manually decoded from hex to avoid Buffer<SharedArrayBuffer> TypeScript issues with crypto.subtle.
// The hex string is used only for derivation and then immediately discarded (not referenced elsewhere).
const KEY: Uint8Array<ArrayBuffer> = (() => {
  const hex = process.env.CREDENTIAL_ENCRYPTION_KEY as string;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
})();

// ── encrypt ────────────────────────────────────────────────────────────────────
/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns: `base64(iv):base64(ciphertext+authTag)`
 *
 * Each call generates a fresh random 12-byte IV — ciphertext is non-deterministic (AC5).
 */
export async function encrypt(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV (NIST SP 800-38D)
  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext),
  );
  // ciphertext includes 16-byte authTag appended automatically by Web Crypto AES-GCM
  return Buffer.from(iv).toString('base64') + ':' + Buffer.from(ciphertext).toString('base64');
}

// ── decrypt ────────────────────────────────────────────────────────────────────
/**
 * Decrypts AES-256-GCM ciphertext.
 * Expects format: `base64(iv):base64(ciphertext+authTag)`
 *
 * Throws DOMException if authTag mismatch (tampered data) — AC4.
 */
export async function decrypt(stored: string): Promise<string> {
  const colonIdx = stored.indexOf(':');
  if (colonIdx === -1) {
    throw new Error('credential-crypto: invalid ciphertext format (missing colon separator)');
  }
  const ivB64 = stored.slice(0, colonIdx);
  const ciphertextB64 = stored.slice(colonIdx + 1);

  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plaintext);
}
