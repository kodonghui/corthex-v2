import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'
import { HTTPError } from './error'

// 회사 관리자 전용 미들웨어 — users 테이블의 role='admin'만 허용
// (adminOnly와 다름: adminOnly는 admin_users 테이블의 플랫폼 관리자)
export const companyAdminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') {
    throw new HTTPError(403, '회사 관리자 권한이 필요합니다', 'AUTH_004')
  }
  await next()
}
