import type { TenantContext } from '@corthex/shared'

// Hono 앱 환경 타입 — Variables에 tenant 추가
export type AppEnv = {
  Variables: {
    tenant: TenantContext
  }
}
