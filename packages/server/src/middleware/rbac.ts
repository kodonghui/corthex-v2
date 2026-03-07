import type { MiddlewareHandler } from 'hono'
import type { UserRole } from '@corthex/shared'
import type { AppEnv } from '../types'
import { HTTPError } from './error'
import { db } from '../db'
import { auditLogs } from '../db/schema'

/**
 * RBAC Middleware Factory (FR48)
 * 미들웨어 체이닝 순서: auth -> tenant -> rbac
 *
 * Usage: rbacMiddleware('super_admin', 'company_admin')
 */
export function rbacMiddleware(...allowedRoles: UserRole[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const tenant = c.get('tenant')

    // Super Admin은 모든 엔드포인트 접근 가능
    if (tenant.role === 'super_admin') {
      await next()
      return
    }

    if (!allowedRoles.includes(tenant.role)) {
      // 감사 로그 기록 (비동기, 응답 차단하지 않음)
      logRbacDenial(tenant, c.req.method, c.req.path).catch(() => {})

      throw new HTTPError(403, '접근 권한이 없습니다', 'RBAC_001')
    }

    await next()
  }
}

/**
 * RBAC 거부 감사 로그 기록
 */
async function logRbacDenial(
  tenant: { companyId: string; userId: string; role: UserRole; isAdminUser?: boolean },
  method: string,
  path: string,
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      companyId: tenant.companyId,
      actorType: tenant.isAdminUser ? 'admin_user' : 'user',
      actorId: tenant.userId,
      action: 'auth.rbac.denied',
      targetType: 'api_endpoint',
      metadata: { method, path, role: tenant.role },
    })
  } catch (err) {
    // 감사 로그 실패가 요청을 차단하지 않도록
    console.error('[RBAC] audit log insert failed:', err)
  }
}
