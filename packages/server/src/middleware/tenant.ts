import type { MiddlewareHandler } from 'hono'
import type { TenantContext } from '@corthex/shared'

// 테넌트 격리 미들웨어 — 로그에 컨텍스트 기록
export const tenantMiddleware: MiddlewareHandler = async (c, next) => {
  const tenant = c.get('tenant') as TenantContext | undefined
  if (tenant) {
    // 모든 요청에 테넌트 정보 로깅
    console.log(`[TENANT] company=${tenant.companyId} user=${tenant.userId} role=${tenant.role}`)
  }
  await next()
}
