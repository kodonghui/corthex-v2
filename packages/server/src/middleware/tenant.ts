import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'
import { HTTPError } from './error'

/**
 * Tenant isolation middleware (FR42, NFR10).
 * 1. Validates that tenant context (companyId) exists on authenticated routes
 * 2. Checks POST/PUT/PATCH body: if body contains companyId, it must match JWT's companyId
 * 3. Superadmin can override companyId via query parameter
 */
export const tenantMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const tenant = c.get('tenant')

  // companyId must be present on authenticated routes
  if (!tenant || !tenant.companyId) {
    throw new HTTPError(401, '테넌트 정보가 없습니다. 인증이 필요합니다.', 'TENANT_001')
  }

  // Superadmin override: allow targeting a specific company via ?companyId=
  if (tenant.role === 'super_admin') {
    const queryCompanyId = c.req.query('companyId')
    if (queryCompanyId) {
      // Platform admin can operate on behalf of any company
      c.set('tenant', { ...tenant, companyId: queryCompanyId })
    }
  }

  // Body companyId mismatch check for write operations
  const method = c.req.method
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const contentType = c.req.header('content-type') || ''
      if (contentType.includes('application/json')) {
        const body = await c.req.json()
        const currentTenant = c.get('tenant')
        if (body && typeof body === 'object' && 'companyId' in body) {
          if (body.companyId !== currentTenant.companyId) {
            // Superadmin is already resolved above, so this catches real mismatches
            if (tenant.role !== 'super_admin') {
              throw new HTTPError(403, 'companyId가 일치하지 않습니다.', 'TENANT_002')
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof HTTPError) throw err
      // Body parse failure is not a tenant error -- let downstream handle it
    }
  }

  // After override resolution, check if companyId is a valid UUID.
  // Admin JWT has companyId='system' which is NOT a UUID — if no company
  // was selected (no ?companyId= override), return empty data for GETs
  // and 400 for writes instead of letting "system" reach DB UUID columns.
  const resolvedTenant = c.get('tenant')
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRe.test(resolvedTenant.companyId)) {
    if (method === 'GET') {
      return c.json({ success: true, data: [] })
    }
    throw new HTTPError(400, '회사를 먼저 선택해주세요.', 'TENANT_003')
  }

  await next()
}
