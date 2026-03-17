import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { cliCredentials } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { encrypt as encryptCredential } from '../../lib/credential-crypto'
import Anthropic from '@anthropic-ai/sdk'
import { getDB } from '../../db/scoped-query'
import {
  SUPPORTED_PROVIDERS,
  listCredentials,
  storeCredentials,
  updateCredentials,
  deleteCredential,
  getProviderSchemas,
} from '../../services/credential-vault'

import type { AppEnv } from '../../types'

export const credentialsRoute = new Hono<AppEnv>()

credentialsRoute.use('*', authMiddleware, adminOnly)

// === CLI Credentials ===

const createCliSchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid(),
  label: z.string().min(1).max(100),
  token: z.string().min(1),
})

// GET /api/admin/cli-credentials?userId=xxx
credentialsRoute.get('/cli-credentials', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) throw new HTTPError(400, 'userId 파라미터가 필요합니다', 'CRED_001')

  const result = await db
    .select({
      id: cliCredentials.id,
      companyId: cliCredentials.companyId,
      userId: cliCredentials.userId,
      label: cliCredentials.label,
      isActive: cliCredentials.isActive,
      createdAt: cliCredentials.createdAt,
    })
    .from(cliCredentials)
    .where(eq(cliCredentials.userId, userId))

  return c.json({ data: result })
})

// POST /api/admin/cli-credentials
credentialsRoute.post('/cli-credentials', zValidator('json', createCliSchema), async (c) => {
  const { token, ...rest } = c.req.valid('json')

  // FR59: Validate token with minimal API call
  try {
    const anthropic = new Anthropic({ apiKey: token })
    await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    })
  } catch {
    throw new HTTPError(400, 'CLI 토큰이 유효하지 않습니다. 토큰을 확인해주세요.', 'CRED_003')
  }

  const encryptedToken = await encryptCredential(token)

  const [cred] = await db
    .insert(cliCredentials)
    .values({ ...rest, encryptedToken })
    .returning({
      id: cliCredentials.id,
      label: cliCredentials.label,
      isActive: cliCredentials.isActive,
      createdAt: cliCredentials.createdAt,
    })

  return c.json({ data: cred }, 201)
})

// DELETE /api/admin/cli-credentials/:id
credentialsRoute.delete('/cli-credentials/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const [cred] = await db
    .update(cliCredentials)
    .set({ isActive: false })
    .where(and(eq(cliCredentials.id, id), eq(cliCredentials.companyId, tenant.companyId)))
    .returning()
  if (!cred) throw new HTTPError(404, 'CLI 토큰을 찾을 수 없습니다', 'CRED_002')
  return c.json({ data: { message: '비활성화되었습니다' } })
})

// === API Keys ===

const createApiKeySchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  provider: z.enum(SUPPORTED_PROVIDERS),
  label: z.string().max(100).optional(),
  credentials: z.record(z.string()),
  scope: z.enum(['company', 'user']),
})

const updateApiKeySchema = z.object({
  credentials: z.record(z.string()),
})

// GET /api/admin/api-keys/providers — supported providers + required fields
credentialsRoute.get('/api-keys/providers', async (c) => {
  return c.json({ data: getProviderSchemas() })
})

// GET /api/admin/api-keys — list credentials by company (tenant-scoped, no decrypted values)
credentialsRoute.get('/api-keys', async (c) => {
  const tenant = c.get('tenant')
  const result = await listCredentials(tenant.companyId)
  return c.json({ data: result })
})

// POST /api/admin/api-keys — store new API key
credentialsRoute.post('/api-keys', zValidator('json', createApiKeySchema), async (c) => {
  const tenant = c.get('tenant')
  // tenant.userId is the admin user's ID from JWT
  const body = c.req.valid('json')

  const result = await storeCredentials({
    companyId: tenant.companyId,
    provider: body.provider,
    credentials: body.credentials,
    scope: body.scope,
    userId: body.userId ?? null,
    label: body.label ?? null,
    actorType: 'admin_user',
    actorId: tenant.userId,
  })

  return c.json({ data: result }, 201)
})

// PUT /api/admin/api-keys/:id — update/rotate credentials
credentialsRoute.put('/api-keys/:id', zValidator('json', updateApiKeySchema), async (c) => {
  const tenant = c.get('tenant')
  // tenant.userId is the admin user's ID from JWT
  const id = c.req.param('id')
  const { credentials: newCreds } = c.req.valid('json')

  await updateCredentials(
    id,
    tenant.companyId,
    newCreds,
    'admin_user',
    tenant.userId,
  )

  return c.json({ data: { message: '크리덴셜이 갱신되었습니다' } })
})

// DELETE /api/admin/api-keys/:id — delete with audit logging
credentialsRoute.delete('/api-keys/:id', async (c) => {
  const tenant = c.get('tenant')
  // tenant.userId is the admin user's ID from JWT
  const id = c.req.param('id')

  await deleteCredential(
    id,
    tenant.companyId,
    'admin_user',
    tenant.userId,
  )

  return c.json({ data: { message: '삭제되었습니다' } })
})

// === Story 16.5: Tool Credential CRUD (D23, E11, FR-CM1~4, FR-CM6) ===

const credentialWriteSchema = z.object({
  keyName: z.string().min(1).max(255),
  value: z.string().min(1),
})

const credentialUpdateSchema = z.object({
  value: z.string().min(1),
})

export function isDuplicateKeyError(err: unknown): boolean {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>
    if (e.code === '23505') return true
    if (e.cause && typeof e.cause === 'object') {
      return (e.cause as Record<string, unknown>).code === '23505'
    }
  }
  return false
}

// GET /api/admin/credentials — masked list (AC2)
credentialsRoute.get('/credentials', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const rows = await getDB(tenant.companyId).listCredentials()
  return c.json({ success: true, data: rows })
})

// POST /api/admin/credentials — register new credential (AC1, AC5)
credentialsRoute.post('/credentials', tenantMiddleware, zValidator('json', credentialWriteSchema), async (c) => {
  const tenant = c.get('tenant')
  const { keyName, value } = c.req.valid('json')
  const encryptedValue = await encryptCredential(value)

  try {
    const [row] = await getDB(tenant.companyId).insertCredential(
      { keyName, encryptedValue },
      tenant.userId,
    )
    return c.json({ success: true, data: { id: row!.id, keyName: row!.keyName, updatedAt: row!.updatedAt } }, 201)
  } catch (err: unknown) {
    if (isDuplicateKeyError(err)) {
      return c.json({ success: false, error: { code: 'CREDENTIAL_DUPLICATE_KEY', message: 'Key name already exists' } }, 409)
    }
    throw err
  }
})

// PUT /api/admin/credentials/:keyName — update credential (AC3)
credentialsRoute.put('/credentials/:keyName', tenantMiddleware, zValidator('json', credentialUpdateSchema), async (c) => {
  const tenant = c.get('tenant')
  const keyName = c.req.param('keyName')
  const { value } = c.req.valid('json')
  const encryptedValue = await encryptCredential(value)

  const rows = await getDB(tenant.companyId).updateCredential(keyName, encryptedValue, tenant.userId)
  if (rows.length === 0) {
    return c.json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' } }, 404)
  }
  return c.json({ success: true, data: { keyName: rows[0]!.keyName, updatedAt: rows[0]!.updatedAt } })
})

// DELETE /api/admin/credentials/:keyName — audit log then delete (AC4)
credentialsRoute.delete('/credentials/:keyName', tenantMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const keyName = c.req.param('keyName')

  // AC4: Audit log BEFORE delete
  console.info(JSON.stringify({
    event: 'credential_deleted',
    keyName,
    companyId: tenant.companyId,
    userId: tenant.userId,
    timestamp: new Date().toISOString(),
  }))

  const rows = await getDB(tenant.companyId).deleteCredential(keyName)
  if (rows.length === 0) {
    return c.json({ success: false, error: { code: 'CREDENTIAL_NOT_FOUND', message: 'Credential not found' } }, 404)
  }
  return c.json({ success: true })
})
