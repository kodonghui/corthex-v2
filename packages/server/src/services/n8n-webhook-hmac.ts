import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Story 25.2: N8N-SEC-4 — Per-company HMAC Webhook Signature Verification
 *
 * When n8n sends webhook callbacks to CORTHEX, the request must include
 * an HMAC signature computed from the request body + company secret.
 * This prevents forged webhook payloads.
 *
 * Signature format: `sha256=<hex digest>`
 * Header: `x-n8n-signature`
 */

const SIGNATURE_HEADER = 'x-n8n-signature'
const ALGORITHM = 'sha256'

/**
 * Generate HMAC signature for a payload.
 * Used by n8n webhook node configuration to sign outgoing requests.
 */
export function generateHmacSignature(payload: string, secret: string): string {
  const hmac = createHmac(ALGORITHM, secret)
  hmac.update(payload)
  return `${ALGORITHM}=${hmac.digest('hex')}`
}

/**
 * Verify HMAC signature from an incoming webhook request.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @returns true if signature is valid
 */
export function verifyHmacSignature(
  payload: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature) return false

  const expected = generateHmacSignature(payload, secret)

  // Timing-safe comparison
  try {
    const sigBuf = Buffer.from(signature, 'utf-8')
    const expectedBuf = Buffer.from(expected, 'utf-8')

    if (sigBuf.length !== expectedBuf.length) return false

    return timingSafeEqual(sigBuf, expectedBuf)
  } catch {
    return false
  }
}

/**
 * Extract signature from request headers.
 */
export function getSignatureHeader(): string {
  return SIGNATURE_HEADER
}

/**
 * Generate a new webhook secret for a company.
 * Should be stored in company.settings (encrypted).
 */
export function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex')
}
