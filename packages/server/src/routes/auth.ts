import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users, adminUsers } from '../db/schema'
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
    logActivity({
      companyId: 'system',
      type: 'login',
      phase: 'error',
      actorType: 'system',
      action: `로그인 실패 (존재하지 않는 계정): ${username}`,
    })
    throw new HTTPError(401, '아이디 또는 비밀번호가 올바르지 않습니다', 'AUTH_001')
  }

  // 비밀번호 검증 (bcrypt 대신 Bun.password 사용)
  const valid = await Bun.password.verify(password, user.passwordHash)
  if (!valid) {
    logActivity({
      companyId: user.companyId,
      type: 'login',
      phase: 'error',
      actorType: 'user',
      actorId: user.id,
      actorName: user.name,
      action: '로그인 실패 (비밀번호 불일치)',
    })
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

// POST /api/auth/admin/login — 관리자 전용 로그인 (admin_users 테이블)
authRoute.post('/auth/admin/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json')

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1)

  if (!admin || !admin.isActive) {
    logActivity({
      companyId: 'system',
      type: 'login',
      phase: 'error',
      actorType: 'system',
      action: `관리자 로그인 실패 (존재하지 않는 계정): ${username}`,
    })
    throw new HTTPError(401, '아이디 또는 비밀번호가 올바르지 않습니다', 'AUTH_001')
  }

  const valid = await Bun.password.verify(password, admin.passwordHash)
  if (!valid) {
    logActivity({
      companyId: 'system',
      type: 'login',
      phase: 'error',
      actorType: 'system',
      actorId: admin.id,
      actorName: admin.name,
      action: '관리자 로그인 실패 (비밀번호 불일치)',
    })
    throw new HTTPError(401, '아이디 또는 비밀번호가 올바르지 않습니다', 'AUTH_001')
  }

  const token = await createToken({
    sub: admin.id,
    companyId: 'system',
    role: 'admin',
    type: 'admin',
  })

  return c.json({
    data: {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        role: admin.role,
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
