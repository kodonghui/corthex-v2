/**
 * CREDENTIAL_PATTERNS — shared regex patterns for credential scrubbing.
 *
 * Used by:
 *   - engine/hooks/credential-scrubber.ts (PostToolUse hook)
 *   - engine/semantic-cache.ts (saveToSemanticCache callee-side scrubbing — D20)
 *
 * DO NOT copy this list — import from here.
 * Copying causes pattern drift → NFR-CACHE-S3 violation (credentials stored in semantic_cache).
 */

export const REDACTED = '***REDACTED***'

export const CREDENTIAL_PATTERNS: RegExp[] = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,
  /\bPS[a-zA-Z0-9]{30,}/g,
  /\b\d{8,10}:[A-Za-z0-9_-]{35,}/g,
]

/**
 * Apply CREDENTIAL_PATTERNS to a string, replacing matches with REDACTED.
 */
export function scrubCredentials(text: string): string {
  let result = text
  for (const pattern of CREDENTIAL_PATTERNS) {
    result = result.replace(pattern, REDACTED)
  }
  return result
}
