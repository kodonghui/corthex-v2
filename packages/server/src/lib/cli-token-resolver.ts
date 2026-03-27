/**
 * cli-token-resolver.ts — Resolve CLI token for agent execution
 *
 * Priority chain:
 *   1. User's active CLI credential from DB (decrypted)
 *   2. process.env.ANTHROPIC_API_KEY (dev/test fallback)
 *   3. Throw error
 *
 * Supports dual-decrypt: credential-crypto (D23) first, legacy crypto fallback.
 */

import { db } from '../db'
import { cliCredentials } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { decrypt as decryptD23 } from './credential-crypto'
import { decrypt as decryptLegacy } from './crypto'

export async function resolveCliToken(userId: string, companyId: string): Promise<string> {
  const [cred] = await db
    .select({ encryptedToken: cliCredentials.encryptedToken })
    .from(cliCredentials)
    .where(
      and(
        eq(cliCredentials.userId, userId),
        eq(cliCredentials.companyId, companyId),
        eq(cliCredentials.isActive, true),
      ),
    )
    .limit(1)

  if (cred) {
    // D23 format uses colon separator (base64:base64), legacy is plain base64
    try {
      return await decryptD23(cred.encryptedToken)
    } catch {
      return await decryptLegacy(cred.encryptedToken)
    }
  }

  // Fallback: server-level env var
  const envKey = process.env.ANTHROPIC_API_KEY
  if (envKey) {
    return envKey
  }

  throw new Error('API 키가 설정되지 않았습니다. .env에 ANTHROPIC_API_KEY를 설정하거나 관리자 패널에서 CLI 크레덴셜을 등록하세요.')
}
