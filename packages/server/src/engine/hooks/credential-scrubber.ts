import { scrub, findSensitiveValues } from '@zapier/secret-scrubber'
import type { SessionContext } from '../types'
import { scrubCredentials } from '../../lib/credential-patterns'

export function credentialScrubber(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): string {
  let result = scrubCredentials(toolOutput)

  try {
    const obj = JSON.parse(result)
    const secrets = findSensitiveValues(obj)
    if (secrets.length > 0) {
      result = JSON.stringify(scrub(obj, secrets))
    }
  } catch { /* non-JSON — regex-only scrubbing sufficient */ }

  return result
}
