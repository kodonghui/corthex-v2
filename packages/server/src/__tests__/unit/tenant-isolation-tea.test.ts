/**
 * TEA (Test Architect) - Risk-Based Tests for Story 1-2: Tenant Isolation Middleware
 *
 * Risk Coverage:
 * - CRITICAL: companyId bypass via body/param manipulation
 * - CRITICAL: superadmin privilege escalation
 * - HIGH: Query helper edge cases
 * - MEDIUM: Content-type edge cases, empty bodies
 */
import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import { tenantMiddleware } from '../../middleware/tenant'
import { errorHandler } from '../../middleware/error'
import { withTenant, scopedWhere, scopedInsert } from '../../db/tenant-helpers'
import { eq } from 'drizzle-orm'
import { departments, agents, users } from '../../db/schema'

function createApp() {
  const app = new Hono<AppEnv>()
  app.onError(errorHandler)
  return app
}

// ============================================================
// CRITICAL: companyId bypass attack vectors
// ============================================================
describe('TEA: Tenant Bypass Attack Vectors', () => {
  test('PUT with mismatched companyId should return 403', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.put('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: 'comp-B', name: 'hijack' }),
    })
    expect(res.status).toBe(403)
  })

  test('PATCH with mismatched companyId should return 403', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.patch('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: 'comp-B' }),
    })
    expect(res.status).toBe(403)
  })

  test('DELETE should not check body companyId (no body)', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.delete('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', { method: 'DELETE' })
    expect(res.status).toBe(200)
  })

  test('company_admin (non-platform) should NOT be able to override companyId', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', {
        companyId: 'comp-A',
        userId: 'u1',
        role: 'company_admin' as const,
        isAdminUser: false,
      })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.get('/test', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request('/test?companyId=other-comp')
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // Should NOT be overridden -- company_admin is not platform admin
    expect(body.companyId).toBe('comp-A')
  })

  test('employee role should NOT override companyId via query', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'employee' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.get('/test', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request('/test?companyId=evil-comp')
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.companyId).toBe('comp-A')
  })
})

// ============================================================
// CRITICAL: Superadmin privilege boundary
// ============================================================
describe('TEA: Superadmin Privilege Boundary', () => {
  test('superadmin without query param should keep original companyId', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', {
        companyId: 'platform-comp',
        userId: 'sa1',
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

    const res = await app.request('/test')
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.companyId).toBe('platform-comp')
  })

  test('superadmin POST with body companyId different from JWT should NOT 403', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', {
        companyId: 'platform-comp',
        userId: 'sa1',
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
      body: JSON.stringify({ companyId: 'target-comp', name: 'admin-action' }),
    })
    expect(res.status).toBe(200)
  })
})

// ============================================================
// HIGH: Query helper edge cases
// ============================================================
describe('TEA: Query Helper Edge Cases', () => {
  test('withTenant works with different table companyId columns', () => {
    const deptCondition = withTenant(departments.companyId, 'c1')
    const agentCondition = withTenant(agents.companyId, 'c1')
    const userCondition = withTenant(users.companyId, 'c1')
    expect(deptCondition).toBeDefined()
    expect(agentCondition).toBeDefined()
    expect(userCondition).toBeDefined()
  })

  test('scopedWhere with zero additional conditions should still work', () => {
    const condition = scopedWhere(departments.companyId, 'c1')
    expect(condition).toBeDefined()
  })

  test('scopedInsert with empty data object', () => {
    const result = scopedInsert('c1', {})
    expect(result.companyId).toBe('c1')
    expect(Object.keys(result)).toHaveLength(1)
  })

  test('scopedInsert preserves all fields including nested objects', () => {
    const data = {
      name: 'Test',
      metadata: { key: 'value', nested: { deep: true } },
      tags: ['a', 'b'],
    }
    const result = scopedInsert('c1', data)
    expect(result.companyId).toBe('c1')
    expect(result.metadata).toEqual({ key: 'value', nested: { deep: true } })
    expect(result.tags).toEqual(['a', 'b'])
  })
})

// ============================================================
// MEDIUM: Content-type edge cases
// ============================================================
describe('TEA: Content-Type Edge Cases', () => {
  test('POST with application/json; charset=utf-8 should check body', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ companyId: 'comp-EVIL' }),
    })
    expect(res.status).toBe(403)
  })

  test('POST with no content-type header should pass (no body check)', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      body: '',
    })
    expect(res.status).toBe(200)
  })

  test('POST with multipart/form-data should not check body companyId', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))

    const formData = new FormData()
    formData.append('companyId', 'comp-EVIL')
    const res = await app.request('/test', {
      method: 'POST',
      body: formData,
    })
    expect(res.status).toBe(200)
  })

  test('POST with malformed JSON should not crash middleware', async () => {
    const app = createApp()
    app.use('*', async (c, next) => {
      c.set('tenant', { companyId: 'comp-A', userId: 'u1', role: 'ceo' as const })
      await next()
    })
    app.use('*', tenantMiddleware)
    app.post('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json!!!',
    })
    // Should not crash -- body parse error is caught and passed through
    expect(res.status).toBe(200)
  })
})
