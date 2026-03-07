import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { apiKeys } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { validateCredentials, encryptCredentials, SUPPORTED_PROVIDERS } from '../../services/credential-vault'

import type { AppEnv } from '../../types'

export const workspaceCredentialsRoute = new Hono<AppEnv>()

workspaceCredentialsRoute.use('*', authMiddleware)

const createApiKeySchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS),
  label: z.string().max(100).optional(),
  credentials: z.record(z.string()),
  scope: z.enum(['company', 'user']),
})

const updateApiKeySchema = z.object({
  label: z.string().max(100).optional(),
  credentials: z.record(z.string()).optional(),
})

// GET /api/workspace/credentials — list API keys for current company
workspaceCredentialsRoute.get('/credentials', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      scope: apiKeys.scope,
      userId: apiKeys.userId,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.companyId, tenant.companyId))

  return c.json({ data: result })
})

// POST /api/workspace/credentials — create API key (auto-set companyId)
workspaceCredentialsRoute.post('/credentials', zValidator('json', createApiKeySchema), async (c) => {
  const tenant = c.get('tenant')
  const { credentials: rawCredentials, ...rest } = c.req.valid('json')

  validateCredentials(rest.provider, rawCredentials)
  const encryptedCredentials = await encryptCredentials(rawCredentials)

  const userId = rest.scope === 'user' ? tenant.userId : null

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      companyId: tenant.companyId,
      userId,
      ...rest,
      credentials: encryptedCredentials,
    })
    .returning({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      scope: apiKeys.scope,
      createdAt: apiKeys.createdAt,
    })

  return c.json({ data: apiKey }, 201)
})

// PUT /api/workspace/credentials/:id — update credential
workspaceCredentialsRoute.put('/credentials/:id', zValidator('json', updateApiKeySchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // Verify key belongs to this company (select only needed fields)
  const [existing] = await db
    .select({ id: apiKeys.id, provider: apiKeys.provider })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'CRED_003')

  const updates: Record<string, unknown> = {}
  if (body.label !== undefined) updates.label = body.label
  if (body.credentials && Object.keys(body.credentials).length > 0) {
    validateCredentials(existing.provider, body.credentials)
    updates.credentials = await encryptCredentials(body.credentials)
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ data: { message: '변경사항이 없습니다' } })
  }

  const [updated] = await db
    .update(apiKeys)
    .set(updates)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, tenant.companyId)))
    .returning({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      scope: apiKeys.scope,
      createdAt: apiKeys.createdAt,
    })

  return c.json({ data: updated })
})

// DELETE /api/workspace/credentials/:id — delete API key
workspaceCredentialsRoute.delete('/credentials/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [key] = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, tenant.companyId)))
    .returning()

  if (!key) throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'CRED_003')
  return c.json({ data: { message: '삭제되었습니다' } })
})
