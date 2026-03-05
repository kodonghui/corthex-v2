import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { cliCredentials, apiKeys } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { encrypt } from '../../lib/crypto'
import { validateCredentials, encryptCredentials } from '../../services/credential-vault'

export const credentialsRoute = new Hono()

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

// POST /api/admin/cli-credentials — CLI 토큰 등록 (AES-256 암호화)
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

// DELETE /api/admin/cli-credentials/:id — 비활성화
credentialsRoute.delete('/cli-credentials/:id', async (c) => {
  const id = c.req.param('id')
  const [cred] = await db
    .update(cliCredentials)
    .set({ isActive: false })
    .where(eq(cliCredentials.id, id))
    .returning()
  if (!cred) throw new HTTPError(404, 'CLI 토큰을 찾을 수 없습니다', 'CRED_002')
  return c.json({ data: { message: '비활성화되었습니다' } })
})

// === API Keys ===

const createApiKeySchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  provider: z.enum(['kis', 'notion', 'email', 'telegram', 'serper', 'instagram']),
  label: z.string().max(100).optional(),
  credentials: z.record(z.string()),  // { field: value } — 각 value는 서버에서 AES-256-GCM 암호화
  scope: z.enum(['company', 'user']),
})

// GET /api/admin/api-keys?userId=xxx
credentialsRoute.get('/api-keys', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) throw new HTTPError(400, 'userId 파라미터가 필요합니다', 'CRED_001')

  const result = await db
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
    .where(eq(apiKeys.userId, userId))

  return c.json({ data: result })
})

// POST /api/admin/api-keys — API key 등록 (각 필드 AES-256-GCM 개별 암호화)
credentialsRoute.post('/api-keys', zValidator('json', createApiKeySchema), async (c) => {
  const { credentials: rawCredentials, ...rest } = c.req.valid('json')

  validateCredentials(rest.provider, rawCredentials)
  const encryptedCredentials = await encryptCredentials(rawCredentials)

  const [apiKey] = await db
    .insert(apiKeys)
    .values({ ...rest, credentials: encryptedCredentials })
    .returning({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      scope: apiKeys.scope,
      createdAt: apiKeys.createdAt,
    })

  return c.json({ data: apiKey }, 201)
})

// DELETE /api/admin/api-keys/:id
credentialsRoute.delete('/api-keys/:id', async (c) => {
  const id = c.req.param('id')
  const [key] = await db.delete(apiKeys).where(eq(apiKeys.id, id)).returning()
  if (!key) throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'CRED_003')
  return c.json({ data: { message: '삭제되었습니다' } })
})
