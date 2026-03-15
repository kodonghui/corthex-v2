import { scrub, findSensitiveValues } from '@zapier/secret-scrubber'
import type { SessionContext } from '../types'
import { scrubCredentials, REDACTED } from '../../lib/credential-patterns'
import { getDB } from '../../db/scoped-query'

// D28: In-memory session credential map (sessionId → plaintext values[])
// Set to null on session release to free memory
const sessionCredentials = new Map<string, string[] | null>()

/**
 * D28: Load company credentials into memory for this session.
 * Called by agent-loop.ts at session start (Story 18.5 wires this call).
 * Completes before first tool call is processed (AC1).
 */
export async function init(ctx: SessionContext): Promise<void> {
  const credentials = await getDB(ctx.companyId).listCredentialsForScrubber()
  sessionCredentials.set(ctx.sessionId, credentials.map((c) => c.plaintext))
}

/**
 * D28: Release in-memory credential list for this session.
 * Called by agent-loop.ts in finally block (Story 18.5 wires this call).
 * Sets entry to null to free memory (AC3).
 */
export function release(sessionId: string): void {
  sessionCredentials.set(sessionId, null)
}

/**
 * D28 test helper — directly set session credentials without DB call.
 * Allows unit tests to bypass init() DB dependency.
 * NOT for production use.
 */
export function _testSetSession(sessionId: string, plaintexts: string[]): void {
  sessionCredentials.set(sessionId, plaintexts)
}

export function credentialScrubber(
  ctx: SessionContext,
  toolName: string,
  toolOutput: string,
): string {
  // Step 1: Static regex pattern scrubbing (existing behavior)
  let result = scrubCredentials(toolOutput)

  // Step 2: JSON-based secret scrubbing via @zapier/secret-scrubber (existing)
  try {
    const obj = JSON.parse(result)
    const secrets = findSensitiveValues(obj)
    if (secrets.length > 0) {
      result = JSON.stringify(scrub(obj, secrets))
    }
  } catch { /* non-JSON — regex-only scrubbing sufficient */ }

  // Step 3: D28 — session-specific registered credential scrubbing (AC2, AC5)
  const sessionCreds = sessionCredentials.get(ctx.sessionId) ?? []
  for (const plaintext of sessionCreds) {
    // Minimum length guard: skip very short values to prevent aggressive output corruption
    // (a 1-char credential like 'a' would replace every occurrence in any tool output)
    if (plaintext && plaintext.length >= 4 && result.includes(plaintext)) {
      result = result.split(plaintext).join(REDACTED)
      // Log scrubbing event — NO credential value in log (AC2 security rule)
      console.info(JSON.stringify({
        event: 'credential_scrubbed',
        toolName,
        sessionId: ctx.sessionId,
        timestamp: new Date().toISOString(),
      }))
    }
  }

  return result
}
