import { scrub, findSensitiveValues } from '@zapier/secret-scrubber'
import type { SessionContext } from '../types'

const REDACTED = '***REDACTED***'

const PATTERNS: RegExp[] = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,
  /\bPS[a-zA-Z0-9]{30,}/g,
  /\b\d{8,10}:[A-Za-z0-9_-]{35,}/g,
]

export function credentialScrubber(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): string {
  let result = toolOutput

  for (const pattern of PATTERNS) {
    result = result.replace(pattern, REDACTED)
  }

  try {
    const obj = JSON.parse(result)
    const secrets = findSensitiveValues(obj)
    if (secrets.length > 0) {
      result = JSON.stringify(scrub(obj, secrets))
    }
  } catch { /* non-JSON — regex-only scrubbing sufficient */ }

  return result
}
