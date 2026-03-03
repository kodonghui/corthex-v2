import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { users, apiKeys, toolCalls, chatSessions } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { encrypt } from '../../lib/crypto'
import type { TenantContext } from '@corthex/shared'

export const profileRoute = new Hono()

profileRoute.use('*', authMiddleware)

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  password: z.string().min(6).optional(),
})

const registerApiKeySchema = z.object({
  provider: z.enum(['kis', 'notion', 'email', 'telegram']),
  label: z.string().max(100).optional(),
  key: z.string().min(1),
})

// GET /api/workspace/profile — 내 프로필
profileRoute.get('/profile', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const [user] = await db
    .select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, tenant.userId))
    .limit(1)

  if (!user) throw new HTTPError(404, '유저를 찾을 수 없습니다', 'PROFILE_001')
  return c.json({ data: user })
})

// PATCH /api/workspace/profile — 내 프로필 수정
profileRoute.patch('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const { password, ...rest } = c.req.valid('json')

  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() }
  if (password) {
    updateData.passwordHash = await Bun.password.hash(password)
  }

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, tenant.userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  return c.json({ data: user })
})

// GET /api/workspace/profile/api-keys — 내 API key 목록 (값은 숨김)
profileRoute.get('/profile/api-keys', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const result = await db
    .select({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, tenant.userId))

  return c.json({ data: result })
})

// POST /api/workspace/profile/api-keys — 내 API key 등록
profileRoute.post('/profile/api-keys', zValidator('json', registerApiKeySchema), async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const { key, ...rest } = c.req.valid('json')
  const encryptedKey = await encrypt(key)

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      ...rest,
      encryptedKey,
    })
    .returning({
      id: apiKeys.id,
      provider: apiKeys.provider,
      label: apiKeys.label,
      createdAt: apiKeys.createdAt,
    })

  return c.json({ data: apiKey }, 201)
})

// DELETE /api/workspace/profile/api-keys/:id — 내 API key 삭제
profileRoute.delete('/profile/api-keys/:id', async (c) => {
  const tenant = c.get('tenant') as TenantContext
  const id = c.req.param('id')

  const [key] = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, tenant.userId)))
    .returning()

  if (!key) throw new HTTPError(404, 'API key를 찾을 수 없습니다', 'PROFILE_002')
  return c.json({ data: { deleted: true } })
})

// GET /api/workspace/profile/tool-calls — 내 도구 호출 내역 (최근 50건)
profileRoute.get('/profile/tool-calls', async (c) => {
  const tenant = c.get('tenant') as TenantContext

  const result = await db
    .select({
      id: toolCalls.id,
      toolName: toolCalls.toolName,
      input: toolCalls.input,
      output: toolCalls.output,
      status: toolCalls.status,
      createdAt: toolCalls.createdAt,
    })
    .from(toolCalls)
    .innerJoin(chatSessions, eq(toolCalls.sessionId, chatSessions.id))
    .where(and(eq(toolCalls.companyId, tenant.companyId), eq(chatSessions.userId, tenant.userId)))
    .orderBy(desc(toolCalls.createdAt))
    .limit(50)

  return c.json({ data: result })
})
