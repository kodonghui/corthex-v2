import type { MiddlewareHandler } from 'hono'
import { isCeoOrAbove } from '@corthex/shared'
import type { AppEnv } from '../types'
import { HTTPError } from './error'

// 회사 관리자 전용 미들웨어 — CEO 이상 역할만 허용 (super_admin, company_admin, ceo)
// (adminOnly와 다름: adminOnly는 admin_users 테이블의 플랫폼 관리자)
export const companyAdminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (!isCeoOrAbove(tenant.role)) {
    throw new HTTPError(403, '회사 관리자 권한이 필요합니다', 'AUTH_004')
  }
  await next()
}
