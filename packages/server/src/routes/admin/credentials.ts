import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { cliCredentials } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { encrypt } from '../../lib/crypto'
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
  const encryptedToken = await encrypt(token)

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
