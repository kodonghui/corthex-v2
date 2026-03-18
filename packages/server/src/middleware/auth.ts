import { sign, verify } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { TenantContext, UserRole } from '@corthex/shared'
import { isAdminLevel } from '@corthex/shared'
import type { AppEnv } from '../types'
import { HTTPError } from './error'
import { db } from '../db'
import { users, companies, adminUsers } from '../db/schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

// 30-second TTL cache for user/company active status (avoids DB hit on every request)
const activeStatusCache = new Map<string, { active: boolean; companyActive?: boolean; expiresAt: number }>()
const CACHE_TTL_MS = 30_000

function getCachedStatus(userId: string): { active: boolean; companyActive?: boolean } | null {
  const entry = activeStatusCache.get(userId)
  if (!entry || Date.now() > entry.expiresAt) {
    activeStatusCache.delete(userId)
    return null
  }
  return entry
}

function setCachedStatus(userId: string, active: boolean, companyActive?: boolean) {
  activeStatusCache.set(userId, { active, companyActive, expiresAt: Date.now() + CACHE_TTL_MS })
  // Evict stale entries periodically (keep map bounded)
  if (activeStatusCache.size > 500) {
    const now = Date.now()
    for (const [k, v] of activeStatusCache) { if (now > v.expiresAt) activeStatusCache.delete(k) }
  }
}

/** Invalidate cache for a user (call on deactivation) */
export function invalidateActiveStatusCache(userId: string) { activeStatusCache.delete(userId) }

export type JwtPayload = {
  sub: string       // userId
  companyId: string
  role: UserRole
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
    
    // Check active status (cached 30s to avoid DB hit on every request)
    const cached = getCachedStatus(payload.sub)
    if (cached) {
      if (!cached.active) throw new HTTPError(401, '계정이 비활성화되었습니다', 'AUTH_005')
      if (cached.companyActive === false) throw new HTTPError(401, '팀(작업 공간)이 비활성화되었습니다', 'AUTH_006')
    } else {
      if (payload.type === 'admin') {
        // super_admin has companyId=null — query by id only
        const [admin] = await db.select({ isActive: adminUsers.isActive }).from(adminUsers).where(eq(adminUsers.id, payload.sub)).limit(1)
        const active = !!admin?.isActive
        setCachedStatus(payload.sub, active)
        if (!active) throw new HTTPError(401, '계정이 비활성화되었습니다', 'AUTH_005')
      } else {
        const [record] = await db
          .select({ userActive: users.isActive, companyActive: companies.isActive })
          .from(users)
          .innerJoin(companies, eq(users.companyId, companies.id))
          .where(eq(users.id, payload.sub))
          .limit(1)
        setCachedStatus(payload.sub, !!record?.userActive, record?.companyActive ?? false)
        if (!record?.userActive) throw new HTTPError(401, '계정이 비활성화되었습니다', 'AUTH_005')
        if (!record.companyActive) throw new HTTPError(401, '팀(작업 공간)이 비활성화되었습니다', 'AUTH_006')
      }
    }

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

// 관리자 전용 미들웨어 — admin_users JWT만 허용 (super_admin, company_admin)
export const adminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (!isAdminLevel(tenant.role) || !tenant.isAdminUser) {
    throw new HTTPError(403, '관리자 권한이 필요합니다', 'AUTH_003')
  }
  await next()
}
