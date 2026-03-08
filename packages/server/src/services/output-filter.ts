/**
 * Output Filter Service -- FR55: 에이전트 출력에서 크리덴셜 패턴 필터링
 * credential-masker.ts 패턴을 확장하여 [REDACTED]로 치환
 * - API keys, tokens, passwords, connection strings, private keys
 * - .env 파일 패턴
 * - 감사용 redaction 메타데이터 반환
 */

// === Types ===

export interface FilterResult {
  filtered: string
  redactedCount: number
  redactedTypes: string[]
}

// === Credential Patterns for Output Filtering ===

interface OutputPattern {
  regex: RegExp
  type: string
  replacement: string
}

const OUTPUT_PATTERNS: OutputPattern[] = [
  // Anthropic API keys
  { regex: /sk-ant-[a-zA-Z0-9-]{20,}/g, type: 'anthropic_key', replacement: '[REDACTED:API_KEY]' },
  // OpenAI API keys
  { regex: /sk-[a-zA-Z0-9]{20,}/g, type: 'openai_key', replacement: '[REDACTED:API_KEY]' },
  // Google AI keys
  { regex: /AIza[a-zA-Z0-9_-]{30,}/g, type: 'google_key', replacement: '[REDACTED:API_KEY]' },
  // AWS keys
  { regex: /AKIA[A-Z0-9]{16}/g, type: 'aws_key', replacement: '[REDACTED:API_KEY]' },
  // Bearer tokens
  { regex: /Bearer\s+[a-zA-Z0-9._\-/+=]{20,}/g, type: 'bearer_token', replacement: 'Bearer [REDACTED]' },
  // Basic auth
  { regex: /Basic\s+[a-zA-Z0-9+/=]{10,}/g, type: 'basic_auth', replacement: 'Basic [REDACTED]' },
  // Connection strings
  { regex: /(?:postgres|postgresql|mysql|mongodb|redis|amqp):\/\/[^\s"'`]+/gi, type: 'connection_string', replacement: '[REDACTED:CONNECTION_STRING]' },
  // Password patterns
  { regex: /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{8,}["']?/gi, type: 'password', replacement: '[REDACTED:PASSWORD]' },
  // Secret patterns
  { regex: /(?:secret|api_?key|access_?key|auth_?token)\s*[:=]\s*["']?[^\s"']{10,}["']?/gi, type: 'secret', replacement: '[REDACTED:SECRET]' },
  // Private keys
  { regex: /-----BEGIN\s+(?:RSA\s+)?(?:PRIVATE|EC)\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?(?:PRIVATE|EC)\s+KEY-----/g, type: 'private_key', replacement: '[REDACTED:PRIVATE_KEY]' },
  // .env patterns (KEY=value on line boundaries)
  { regex: /^(?:DATABASE_URL|ENCRYPTION_KEY|JWT_SECRET|API_KEY|SECRET_KEY|PRIVATE_KEY|ACCESS_TOKEN)\s*=\s*.+$/gm, type: 'env_variable', replacement: '[REDACTED:ENV_VAR]' },
  // Generic token patterns (key-xxxx, token-xxxx)
  { regex: /(?:key|token)-[a-zA-Z0-9]{16,}/gi, type: 'generic_token', replacement: '[REDACTED:TOKEN]' },
]

// === Core Functions ===

/**
 * Filter output text by replacing credential patterns with [REDACTED].
 * Returns filtered text + metadata about what was redacted.
 */
export function filterOutput(text: string): FilterResult {
  let filtered = text
  const redactedTypes = new Set<string>()
  let redactedCount = 0

  for (const pattern of OUTPUT_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.regex.lastIndex = 0
    const matches = filtered.match(pattern.regex)
    if (matches) {
      redactedCount += matches.length
      redactedTypes.add(pattern.type)
      pattern.regex.lastIndex = 0
      filtered = filtered.replace(pattern.regex, pattern.replacement)
    }
  }

  return {
    filtered,
    redactedCount,
    redactedTypes: [...redactedTypes],
  }
}

/**
 * Quick check: does the text contain any credential patterns?
 */
export function hasCredentialPatterns(text: string): boolean {
  for (const pattern of OUTPUT_PATTERNS) {
    pattern.regex.lastIndex = 0
    if (pattern.regex.test(text)) return true
  }
  return false
}
