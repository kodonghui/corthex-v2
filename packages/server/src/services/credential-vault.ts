import { encrypt, decrypt } from '../lib/crypto'
import { db } from '../db'
import { apiKeys } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { HTTPError } from '../middleware/error'
import { ERROR_CODES } from '@corthex/shared'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'

// Provider별 필수 필드 정의
export const PROVIDER_SCHEMAS: Record<string, string[]> = {
  anthropic: ['api_key'],
  openai: ['api_key'],
  google_ai: ['api_key'],
  voyage_ai: ['api_key'],
  kis: ['app_key', 'app_secret', 'account_no'],
  smtp: ['host', 'port', 'user', 'password', 'from'],
  email: ['host', 'port', 'user', 'password', 'from'],
  telegram: ['bot_token', 'chat_id'],
  instagram: ['access_token', 'page_id'],
  serper: ['api_key'],
  notion: ['api_key'],
  google_calendar: ['api_key'],
  tts: ['api_key'],
}

// All supported provider names (used for Zod enum validation)
export const SUPPORTED_PROVIDERS = Object.keys(PROVIDER_SCHEMAS) as [string, ...string[]]

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

// === Phase 1 Extensions (Story 1-5) ===

export interface CredentialSummary {
  id: string
  companyId: string
  userId: string | null
  provider: string
  label: string | null
  scope: string
  createdAt: Date
}

export interface StoreCredentialInput {
  companyId: string
  provider: string
  credentials: Record<string, string>
  scope: 'company' | 'user'
  userId?: string | null
  label?: string | null
  actorType?: 'admin_user' | 'user' | 'agent' | 'system'
  actorId?: string
}

// Mask all credential field values with '***' for audit logging (NFR12)
export function maskCredentialFields(fields: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {}
  for (const key of Object.keys(fields)) {
    masked[key] = '***'
  }
  return masked
}

// Returns provider schemas with required fields (deep copy to prevent mutation)
export function getProviderSchemas(): Record<string, string[]> {
  const copy: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(PROVIDER_SCHEMAS)) {
    copy[key] = [...value]
  }
  return copy
}

// List all credentials for a company (metadata only, no decrypted values)
export async function listCredentials(companyId: string): Promise<CredentialSummary[]> {
  const results = await db
    .select({
      id: apiKeys.id,
      companyId: apiKeys.companyId,
      userId: apiKeys.userId,
      provider: apiKeys.provider,
      label: apiKeys.label,
      scope: apiKeys.scope,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.companyId, companyId))

  return results
}

// Store new credentials with validation, encryption, and audit logging
export async function storeCredentials(input: StoreCredentialInput): Promise<{ id: string }> {
  validateCredentials(input.provider, input.credentials)
  const encryptedCreds = await encryptCredentials(input.credentials)

  const [record] = await db
    .insert(apiKeys)
    .values({
      companyId: input.companyId,
      userId: input.userId ?? null,
      provider: input.provider,
      label: input.label ?? null,
      credentials: encryptedCreds,
      scope: input.scope,
    })
    .returning()

  await createAuditLog({
    companyId: input.companyId,
    actorType: input.actorType ?? 'system',
    actorId: input.actorId ?? 'system',
    action: AUDIT_ACTIONS.CREDENTIAL_STORE,
    targetType: 'api_key',
    targetId: record.id,
    before: null,
    after: maskCredentialFields(input.credentials),
    metadata: { provider: input.provider, scope: input.scope },
  })

  return { id: record.id }
}

// Update/rotate credentials with validation, re-encryption, and audit logging
export async function updateCredentials(
  id: string,
  companyId: string,
  newFields: Record<string, string>,
  actorType: 'admin_user' | 'user' | 'agent' | 'system' = 'system',
  actorId: string = 'system',
): Promise<void> {
  // Fetch existing to get provider for validation + before snapshot
  const [existing] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))
    .limit(1)

  if (!existing) {
    throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'CRED_004')
  }

  validateCredentials(existing.provider, newFields)
  const encryptedCreds = await encryptCredentials(newFields)

  await db
    .update(apiKeys)
    .set({ credentials: encryptedCreds })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))

  const oldFieldKeys = Object.keys(existing.credentials as Record<string, string>)
  const maskedBefore: Record<string, string> = {}
  for (const k of oldFieldKeys) maskedBefore[k] = '***'

  await createAuditLog({
    companyId,
    actorType,
    actorId,
    action: AUDIT_ACTIONS.CREDENTIAL_STORE,
    targetType: 'api_key',
    targetId: id,
    before: maskedBefore,
    after: maskCredentialFields(newFields),
    metadata: { provider: existing.provider, scope: existing.scope, operation: 'rotation' },
  })
}

// Delete credentials with tenant check and audit logging
export async function deleteCredential(
  id: string,
  companyId: string,
  actorType: 'admin_user' | 'user' | 'agent' | 'system' = 'system',
  actorId: string = 'system',
): Promise<void> {
  const [existing] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))
    .limit(1)

  if (!existing) {
    throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'CRED_003')
  }

  await db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))

  const oldFieldKeys = Object.keys(existing.credentials as Record<string, string>)
  const maskedBefore: Record<string, string> = {}
  for (const k of oldFieldKeys) maskedBefore[k] = '***'

  await createAuditLog({
    companyId,
    actorType,
    actorId,
    action: AUDIT_ACTIONS.CREDENTIAL_DELETE,
    targetType: 'api_key',
    targetId: id,
    before: maskedBefore,
    after: null,
    metadata: { provider: existing.provider, scope: existing.scope },
  })
}
