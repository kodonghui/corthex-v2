import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'

export const usersRoute = new Hono()

usersRoute.use('*', authMiddleware, adminOnly)

const createUserSchema = z.object({
  companyId: z.string().uuid(),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).default('user'),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})

// GET /api/admin/users?companyId=xxx — 직원 목록 (회사별)
usersRoute.get('/users', async (c) => {
  const companyId = c.req.query('companyId')
  const query = db
    .select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)

  const result = companyId
    ? await query.where(eq(users.companyId, companyId))
    : await query

  return c.json({ data: result })
})

// GET /api/admin/users/:id — 직원 상세
usersRoute.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  const [user] = await db
    .select({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!user) throw new HTTPError(404, '직원을 찾을 수 없습니다', 'USER_001')
  return c.json({ data: user })
})

// POST /api/admin/users — 직원 생성 (ID/PW 발급)
usersRoute.post('/users', zValidator('json', createUserSchema), async (c) => {
  const { password, ...rest } = c.req.valid('json')

  // 중복 username 체크
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, rest.username))
    .limit(1)
  if (existing) throw new HTTPError(409, '이미 존재하는 아이디입니다', 'USER_002')

  const passwordHash = await Bun.password.hash(password)

  const [user] = await db
    .insert(users)
    .values({ ...rest, passwordHash })
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  return c.json({ data: user }, 201)
})

// PATCH /api/admin/users/:id — 직원 수정
usersRoute.patch('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = c.req.param('id')
  const { password, ...rest } = c.req.valid('json')

  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() }
  if (password) {
    updateData.passwordHash = await Bun.password.hash(password)
  }

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

  if (!user) throw new HTTPError(404, '직원을 찾을 수 없습니다', 'USER_001')
  return c.json({ data: user })
})

// DELETE /api/admin/users/:id — 직원 비활성화
usersRoute.delete('/users/:id', async (c) => {
  const id = c.req.param('id')
  const [user] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()

  if (!user) throw new HTTPError(404, '직원을 찾을 수 없습니다', 'USER_001')
  return c.json({ data: { message: '비활성화되었습니다' } })
})
