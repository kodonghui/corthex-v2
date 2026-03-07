/**
 * Credential masker -- NFR12: 로그에 크리덴셜/API 키 노출 금지
 * Automatically masks sensitive data in tool invocation input/output logs.
 */

// Sensitive field names (case-insensitive matching)
const SENSITIVE_FIELDS = new Set([
  'password',
  'secret',
  'apikey',
  'api_key',
  'token',
  'authorization',
  'credential',
  'credentials',
  'access_token',
  'refresh_token',
  'private_key',
  'privatekey',
  'client_secret',
  'bot_token',
  'webhook_secret',
  'encryption_key',
  'passphrase',
])

// Regex patterns for inline credential detection in strings
const CREDENTIAL_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Anthropic API keys (must be before generic sk- pattern)
  { pattern: /sk-ant-[a-zA-Z0-9-]{20,}/g, replacement: 'sk-ant-***' },
  // OpenAI API keys
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, replacement: 'sk-***' },
  // Generic API key patterns (key-xxxx, token-xxxx)
  { pattern: /(?:key|token)-[a-zA-Z0-9]{16,}/gi, replacement: 'key-***' },
  // Bearer tokens
  { pattern: /Bearer\s+[a-zA-Z0-9._\-/+=]{20,}/g, replacement: 'Bearer ***' },
  // Basic auth
  { pattern: /Basic\s+[a-zA-Z0-9+/=]{10,}/g, replacement: 'Basic ***' },
  // AWS-style keys
  { pattern: /AKIA[A-Z0-9]{16}/g, replacement: 'AKIA***' },
  // Generic long hex/base64 secrets (32+ chars of hex-like patterns)
  { pattern: /(?<![a-zA-Z0-9])[a-f0-9]{32,}(?![a-zA-Z0-9])/gi, replacement: '***' },
]

function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_FIELDS.has(fieldName.toLowerCase().replace(/[-_]/g, '_'))
}

function maskString(value: string): string {
  if (value.length <= 4) return '***'
  return value.slice(0, 4) + '***'
}

function maskStringPatterns(value: string): string {
  let masked = value
  for (const { pattern, replacement } of CREDENTIAL_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0
    masked = masked.replace(pattern, replacement)
  }
  return masked
}

/**
 * Recursively mask sensitive data in an object/value.
 * - Detects sensitive field names and masks their values
 * - Detects inline credential patterns in string values
 */
export function maskCredentials(data: unknown): unknown {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    return maskStringPatterns(data)
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskCredentials(item))
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (isSensitiveField(key) && typeof value === 'string') {
        result[key] = maskString(value)
      } else {
        result[key] = maskCredentials(value)
      }
    }
    return result
  }

  // Primitives (number, boolean) pass through
  return data
}

/**
 * Mask credentials in a string value (typically tool output text).
 */
export function maskCredentialsInString(value: string): string {
  return maskStringPatterns(value)
}
