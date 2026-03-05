import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createToken, authMiddleware } from '../middleware/auth'
import { HTTPError } from '../middleware/error'
import { logActivity } from '../lib/activity-logger'
import type { AppEnv } from '../types'

export const authRoute = new Hono<AppEnv>()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// POST /api/auth/login
authRoute.post('/auth/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json')

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (!user || !user.isActive) {
    throw new HTTPError(401, '아이디 또는 비밀번호가 올바르지 않습니다', 'AUTH_001')
  }

  // 비밀번호 검증 (bcrypt 대신 Bun.password 사용)
  const valid = await Bun.password.verify(password, user.passwordHash)
  if (!valid) {
    throw new HTTPError(401, '아이디 또는 비밀번호가 올바르지 않습니다', 'AUTH_001')
  }

  const token = await createToken({
    sub: user.id,
    companyId: user.companyId,
    role: user.role,
  })

  logActivity({
    companyId: user.companyId,
    type: 'login',
    phase: 'end',
    actorType: 'user',
    actorId: user.id,
    actorName: user.name,
    action: '로그인',
  })

  return c.json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    },
  })
})

// GET /api/auth/me — 현재 유저 정보 (인증 필요)
authRoute.get('/auth/me', authMiddleware, async (c) => {
  const tenant = c.get('tenant')
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      companyId: users.companyId,
    })
    .from(users)
    .where(eq(users.id, tenant.userId))
    .limit(1)

  if (!user) {
    throw new HTTPError(404, '유저를 찾을 수 없습니다', 'AUTH_001')
  }

  return c.json({ data: user })
})
