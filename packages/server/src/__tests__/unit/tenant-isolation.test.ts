import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import { tenantMiddleware } from '../../middleware/tenant'
import { errorHandler } from '../../middleware/error'
import { withTenant, scopedWhere, scopedInsert } from '../../db/tenant-helpers'
import { eq } from 'drizzle-orm'
import { departments } from '../../db/schema'

// ============================================================
// Task 2: Drizzle tenant query helpers
// ============================================================
describe('Tenant Query Helpers (tenant-helpers.ts)', () => {
  // Task 4.1: withTenant 헬퍼 테스트
  describe('withTenant', () => {
    test('should return a SQL condition for companyId filtering', () => {
      const condition = withTenant(departments.companyId, 'company-123')
      expect(condition).toBeDefined()
      // The result should be a Drizzle SQL object (eq condition)
      expect(condition.toString()).toBeDefined()
    })

    test('should produce same result as eq() with companyId', () => {
      const companyId = 'test-company-uuid'
      const helperResult = withTenant(departments.companyId, companyId)
      const directResult = eq(departments.companyId, companyId)
      // Both should produce equivalent SQL
      expect(helperResult.toString()).toEqual(directResult.toString())
    })
  })

  // Task 4.5: scopedInsert companyId 자동 주입 테스트
  describe('scopedInsert', () => {
    test('should inject companyId into data object', () => {
      const data = { name: 'Test Dept', description: 'desc' }
      const result = scopedInsert('company-456', data)
      expect(result.companyId).toBe('company-456')
      expect(result.name).toBe('Test Dept')
      expect(result.description).toBe('desc')
    })

    test('should override existing companyId in data', () => {
      const data = { companyId: 'wrong-id', name: 'Test' }
      const result = scopedInsert('correct-id', data)
      expect(result.companyId).toBe('correct-id')
    })

    test('should not mutate original data object', () => {
      const data = { name: 'Original' }
      const result = scopedInsert('company-789', data)
      expect(result.companyId).toBe('company-789')
      expect((data as any).companyId).toBeUndefined()
    })
  })

  describe('scopedWhere', () => {
    test('should combine companyId filter with additional conditions', () => {
      const condition = scopedWhere(
        departments.companyId,
        'company-123',
        eq(departments.isActive, true),
      )
      expect(condition).toBeDefined()
      expect(condition.toString()).toBeDefined()
    })

    test('should work with multiple additional conditions', () => {
      const condition = scopedWhere(
        departments.companyId,
        'company-123',
        eq(departments.isActive, true),
        eq(departments.name, 'HR'),
      )
      expect(condition).toBeDefined()
    })
  })
})

// ============================================================
// Task 1: tenantMiddleware
// ============================================================
describe('Tenant Middleware (tenant.ts)', () => {
  function createApp() {
    const app = new Hono<AppEnv>()
    app.onError(errorHandler)
    return app
  }

  // Task 4.3: companyId 누락 401 테스트
  describe('companyId missing -> 401', () => {
    test('should return 401 when tenant context is missing', async () => {
      const app = createApp()
      // Simulate: authMiddleware did NOT set tenant (no JWT)
      app.use('*', async (c, next) => {
        // Don't set tenant at all
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test')
      expect(res.status).toBe(401)
      const body = await res.json() as any
      expect(body.error.code).toBe('TENANT_001')
    })

    test('should return 401 when companyId is empty string', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: '', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test')
      expect(res.status).toBe(401)
    })
  })

  describe('valid tenant passes through', () => {
    test('should pass when valid tenant context exists', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request('/test')
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.companyId).toBe('comp-1')
    })
  })

  // Task 4.2: body companyId 불일치 403 테스트
  describe('body companyId mismatch -> 403', () => {
    test('should return 403 when POST body companyId differs from JWT', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.post('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'comp-DIFFERENT', name: 'hack' }),
      })
      expect(res.status).toBe(403)
      const body = await res.json() as any
      expect(body.error.code).toBe('TENANT_002')
    })

    test('should pass when POST body companyId matches JWT', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.post('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'comp-1', name: 'legit' }),
      })
      expect(res.status).toBe(200)
    })

    test('should pass when POST body has no companyId field', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.post('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'no-company-field' }),
      })
      expect(res.status).toBe(200)
    })

    test('should pass GET requests without body check', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test')
      expect(res.status).toBe(200)
    })
  })

  // Task 4.4: superadmin 우회 테스트
  describe('superadmin override', () => {
    test('should allow superadmin to override companyId via query param', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', {
          companyId: 'admin-comp',
          userId: 'admin-1',
          role: 'super_admin' as const,
          isAdminUser: true,
        })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request('/test?companyId=target-comp')
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.companyId).toBe('target-comp')
    })

    test('should not allow regular user to override companyId via query param', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request('/test?companyId=hacker-comp')
      expect(res.status).toBe(200)
      const body = await res.json() as any
      // Should stay as original, not the hacker's companyId
      expect(body.companyId).toBe('comp-1')
    })

    test('superadmin should be able to POST with different companyId in body', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', {
          companyId: 'admin-comp',
          userId: 'admin-1',
          role: 'super_admin' as const,
          isAdminUser: true,
        })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.post('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: 'other-company', name: 'admin action' }),
      })
      // Superadmin body mismatch should NOT trigger 403
      expect(res.status).toBe(200)
    })
  })

  describe('non-JSON body handling', () => {
    test('should pass when POST has non-JSON content type', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: 'comp-1', userId: 'u1', role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.post('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'plain text body',
      })
      expect(res.status).toBe(200)
    })
  })
})
