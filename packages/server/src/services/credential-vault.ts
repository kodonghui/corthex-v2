import { encrypt, decrypt } from '../lib/crypto'
import { db } from '../db'
import { apiKeys } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { HTTPError } from '../middleware/error'
import { ERROR_CODES } from '@corthex/shared'

// Provider별 필수 필드 정의
export const PROVIDER_SCHEMAS: Record<string, string[]> = {
  kis: ['app_key', 'app_secret', 'account_no'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  email: ['host', 'port', 'user', 'password', 'from'],
  instagram: ['access_token', 'page_id'],
  serper: ['api_key'],
  notion: ['api_key'],
  google_calendar: ['api_key'],
  tts: ['api_key'],
  openai: ['api_key'],
}

// 필수 필드 유효성 검사
export function validateCredentials(
  provider: string,
  fields: Record<string, string>,
): void {
  const required = PROVIDER_SCHEMAS[provider]
  if (!required) return // 알려지지 않은 provider는 스키마 검증 스킵
  const missing = required.filter((f) => !fields[f])
  if (missing.length > 0) {
    throw new HTTPError(400, `필수 필드 누락: ${missing.join(', ')}`, 'TOOL_001')
  }
}

// 각 필드 개별 암호화 → JSONB 반환
export async function encryptCredentials(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const encrypted: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    encrypted[key] = await encrypt(value)
  }
  return encrypted
}

// 각 필드 개별 복호화 → 원본 맵 반환
export async function decryptCredentials(
  encryptedObj: Record<string, string>,
): Promise<Record<string, string>> {
  const decrypted: Record<string, string> = {}
  for (const [key, value] of Object.entries(encryptedObj)) {
    decrypted[key] = await decrypt(value)
  }
  return decrypted
}

// 우선순위 조회: user scope > company scope > TOOL_001
export async function getCredentials(
  companyId: string,
  provider: string,
  userId?: string,
): Promise<Record<string, string>> {
  // 1. 유저 개인 key 조회
  if (userId) {
    const [userKey] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.companyId, companyId),
          eq(apiKeys.userId, userId),
          eq(apiKeys.provider, provider),
          eq(apiKeys.scope, 'user'),
        ),
      )
      .limit(1)
    if (userKey) return decryptCredentials(userKey.credentials as Record<string, string>)
  }

  // 2. 회사 공용 key 조회
  const [companyKey] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.companyId, companyId),
        eq(apiKeys.provider, provider),
        eq(apiKeys.scope, 'company'),
      ),
    )
    .limit(1)
  if (companyKey) return decryptCredentials(companyKey.credentials as Record<string, string>)

  // 3. 없으면 에러
  throw new HTTPError(400, ERROR_CODES.TOOL_001, 'TOOL_001')
}
