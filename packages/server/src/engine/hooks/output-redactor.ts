import type { SessionContext } from '../types'

const REDACTED = '[REDACTED]'

// Korean PII patterns — domain-specific (credential-scrubber handles API keys/tokens)
const PII_PATTERNS: RegExp[] = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\b0\d{1,2}[-.]?\d{3,4}[-.]?\d{4}\b/g,
  /\b\d{6}-\d{7}\b/g,
  /\b\d{3,4}-\d{2,4}-\d{4,6}\b/g,
]

// TODO: Phase 2+ — load company-specific patterns from DB via getDB(ctx.companyId)

export function outputRedactor(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): string {
  let result = toolOutput
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, REDACTED)
  }
  return result
}
