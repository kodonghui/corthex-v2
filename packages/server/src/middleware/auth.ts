import { sign, verify } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { TenantContext } from '@corthex/shared'
import { HTTPError } from './error'

const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

export type JwtPayload = {
  sub: string       // userId
  companyId: string
  role: 'admin' | 'user'
  exp: number
}

// JWT 토큰 생성
export async function createToken(payload: Omit<JwtPayload, 'exp'>): Promise<string> {
  return sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, // 24시간
    JWT_SECRET,
  )
}

// JWT 인증 미들웨어
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPError(401, '인증 토큰이 필요합니다', 'AUTH_001')
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, JWT_SECRET) as JwtPayload
    // TenantContext를 요청에 주입
    const tenant: TenantContext = {
      companyId: payload.companyId,
      userId: payload.sub,
      role: payload.role,
    }
    c.set('tenant', tenant)
    await next()
  } catch {
    throw new HTTPError(401, '토큰이 만료되었거나 유효하지 않습니다', 'AUTH_002')
  }
}

// 관리자 전용 미들웨어
export const adminOnly: MiddlewareHandler = async (c, next) => {
  const tenant = c.get('tenant') as TenantContext
  if (tenant.role !== 'admin') {
    throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
  }
  await next()
}
