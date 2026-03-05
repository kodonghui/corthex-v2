import { sign, verify } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { TenantContext } from '@corthex/shared'
import type { AppEnv } from '../types'
import { HTTPError } from './error'

const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

export type JwtPayload = {
  sub: string       // userId
  companyId: string
  role: 'admin' | 'user'
  type?: 'admin'    // admin_users 로그인 시에만 추가
  exp: number
}

// JWT 토큰 생성
export async function createToken(payload: Omit<JwtPayload, 'exp' | 'type'> & { type?: 'admin' }): Promise<string> {
  return sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, // 24시간
    JWT_SECRET,
  )
}

// JWT 인증 미들웨어
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPError(401, '인증 토큰이 필요합니다', 'AUTH_001')
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256') as JwtPayload
    // TenantContext를 요청에 주입
    const tenant: TenantContext = {
      companyId: payload.companyId,
      userId: payload.sub,
      role: payload.role,
      isAdminUser: payload.type === 'admin',
    }
    c.set('tenant', tenant)
    await next()
  } catch {
    throw new HTTPError(401, '토큰이 만료되었거나 유효하지 않습니다', 'AUTH_002')
  }
}

// 관리자 전용 미들웨어 — admin_users JWT만 허용 (type: 'admin')
export const adminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin' || !tenant.isAdminUser) {
    throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
  }
  await next()
}
