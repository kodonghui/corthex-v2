import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { users, companies, adminUsers, invitations } from '../db/schema'
import { createToken, authMiddleware } from '../middleware/auth'
import { HTTPError } from '../middleware/error'
import { logActivity } from '../lib/activity-logger'
import type { AppEnv } from '../types'

export const authRoute = new Hono<AppEnv>()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const registerSchema = z.object({
  companyName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug는 소문자, 숫자, 하이픈만 가능'),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

// POST /api/auth/register — 회사 + 관리자 계정 동시 생성 (셀프 등록)
authRoute.post('/auth/register', zValidator('json', registerSchema), async (c) => {
  const { companyName, slug, username, password, name, email } = c.req.valid('json')

  // slug 중복 체크
  const [existingCompany] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1)
  if (existingCompany) {
    throw new HTTPError(409, '이미 사용 중인 slug입니다', 'REG_001')
  }

  // username 중복 체크
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  if (existingUser) {
    throw new HTTPError(409, '이미 존재하는 아이디입니다', 'REG_002')
  }

  // 회사 생성
  const [company] = await db
    .insert(companies)
    .values({ name: companyName, slug })
    .returning()

  // 관리자 유저 생성 (회사 소속)
  const passwordHash = await Bun.password.hash(password)
  const [user] = await db
    .insert(users)
    .values({
      companyId: company.id,
      username,
      passwordHash,
      name,
      email,
      role: 'admin',
    })
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  // JWT 발급
  const token = await createToken({
    sub: user.id,
    companyId: company.id,
    role: 'admin',
  })

  logActivity({
    companyId: company.id,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: user.id,
    actorName: user.name,
    action: `회사 등록: ${companyName} (${slug})`,
  })

  return c.json({
    data: {
      token,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    },
  }, 201)
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

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
})

// GET /api/auth/invite-info/:token — 초대 정보 조회 (공개)
authRoute.get('/auth/invite-info/:token', async (c) => {
  const token = c.req.param('token')

  const [invitation] = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      companyId: invitations.companyId,
    })
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!invitation) {
    throw new HTTPError(404, '초대를 찾을 수 없습니다', 'INVITE_001')
  }

  if (invitation.status !== 'pending') {
    throw new HTTPError(410, '이미 처리된 초대입니다', 'INVITE_004')
  }

  if (invitation.expiresAt < new Date()) {
    throw new HTTPError(410, '만료된 초대입니다', 'INVITE_003')
  }

  // 회사 이름 조회
  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, invitation.companyId))
    .limit(1)

  return c.json({
    data: {
      email: invitation.email,
      role: invitation.role,
      companyName: company?.name || '',
    },
  })
})

// POST /api/auth/accept-invite — 초대 수락 + 계정 생성 (공개)
authRoute.post('/auth/accept-invite', zValidator('json', acceptInviteSchema), async (c) => {
  const { token, username, password, name } = c.req.valid('json')

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!invitation) {
    throw new HTTPError(404, '초대를 찾을 수 없습니다', 'INVITE_001')
  }

  if (invitation.status !== 'pending') {
    throw new HTTPError(410, '이미 처리된 초대입니다', 'INVITE_004')
  }

  if (invitation.expiresAt < new Date()) {
    // 만료 상태 업데이트
    await db
      .update(invitations)
      .set({ status: 'expired' })
      .where(eq(invitations.id, invitation.id))
    throw new HTTPError(410, '만료된 초대입니다', 'INVITE_003')
  }

  // username 중복 체크
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  if (existingUser) {
    throw new HTTPError(409, '이미 존재하는 아이디입니다', 'REG_002')
  }

  // 회사 활성 상태 체크
  const [company] = await db
    .select({ isActive: companies.isActive })
    .from(companies)
    .where(eq(companies.id, invitation.companyId))
    .limit(1)
  if (!company || !company.isActive) {
    throw new HTTPError(410, '비활성화된 회사입니다', 'INVITE_006')
  }

  // 같은 회사에 같은 이메일로 이미 가입된 유저 체크
  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.companyId, invitation.companyId), eq(users.email, invitation.email)))
    .limit(1)
  if (existingEmail) {
    throw new HTTPError(409, '이미 가입된 이메일입니다', 'INVITE_005')
  }

  // 유저 생성
  const passwordHash = await Bun.password.hash(password)
  const [user] = await db
    .insert(users)
    .values({
      companyId: invitation.companyId,
      username,
      passwordHash,
      name,
      email: invitation.email,
      role: invitation.role,
    })
    .returning({
      id: users.id,
      companyId: users.companyId,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
    })

  // 초대 상태 업데이트
  await db
    .update(invitations)
    .set({ status: 'accepted', acceptedAt: new Date() })
    .where(eq(invitations.id, invitation.id))

  // JWT 발급
  const jwtToken = await createToken({
    sub: user.id,
    companyId: invitation.companyId,
    role: user.role,
  })

  logActivity({
    companyId: invitation.companyId,
    type: 'system',
    phase: 'end',
    actorType: 'user',
    actorId: user.id,
    actorName: user.name,
    action: `초대 수락: ${invitation.email}`,
  })

  return c.json({
    data: {
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    },
  }, 201)
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
