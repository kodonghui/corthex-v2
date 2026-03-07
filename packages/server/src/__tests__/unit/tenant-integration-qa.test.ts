/**
 * QA Verification Tests for Story 1-7
 * Focus: Acceptance criteria coverage + additional user-scenario tests
 */
import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import type { UserRole } from '@corthex/shared'
import { tenantMiddleware } from '../../middleware/tenant'
import { rbacMiddleware } from '../../middleware/rbac'
import { errorHandler } from '../../middleware/error'
import { scopedInsert } from '../../db/tenant-helpers'

const COMPANY_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const COMPANY_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const USER_A = 'user-aaaa-0000-0000-000000000001'
const USER_B = 'user-bbbb-0000-0000-000000000002'
const ADMIN = 'admin-0000-0000-0000-000000000000'

function createApp() {
  const app = new Hono<AppEnv>()
  app.onError(errorHandler)
  return app
}

function setTenant(companyId: string, userId: string, role: UserRole, isAdminUser = false) {
  return async (c: any, next: () => Promise<void>) => {
    c.set('tenant', { companyId, userId, role, isAdminUser })
    await next()
  }
}

// ============================================================
// AC #1: Company A data never exposed to Company B
// ============================================================
describe('QA AC#1: Cross-Company Data Isolation', () => {
  test('Company A endpoint returns Company A context only', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.get('/api/data', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId, userId: t.userId })
    })

    const res = await app.request('/api/data')
    const body = await res.json() as any
    expect(body.companyId).toBe(COMPANY_A)
    expect(body.companyId).not.toBe(COMPANY_B)
  })

  test('Company B endpoint returns Company B context only', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_B, USER_B, 'ceo'))
    app.use('*', tenantMiddleware)
    app.get('/api/data', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request('/api/data')
    const body = await res.json() as any
    expect(body.companyId).toBe(COMPANY_B)
    expect(body.companyId).not.toBe(COMPANY_A)
  })

  test('scopedInsert guarantees company isolation for inserts', () => {
    const insertA = scopedInsert(COMPANY_A, { name: 'Dept-X' })
    const insertB = scopedInsert(COMPANY_B, { name: 'Dept-X' })
    // Same name but different companies
    expect(insertA.companyId).toBe(COMPANY_A)
    expect(insertB.companyId).toBe(COMPANY_B)
    expect(insertA.companyId).not.toBe(insertB.companyId)
  })
})

// ============================================================
// AC #2: CEO denied Admin-only API → 403
// ============================================================
describe('QA AC#2: CEO Cannot Access Admin APIs', () => {
  test('CEO accessing /api/admin/companies → 403', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.use('*', rbacMiddleware('super_admin', 'company_admin'))
    app.get('/api/admin/companies', (c) => c.json({ ok: true }))

    const res = await app.request('/api/admin/companies')
    expect(res.status).toBe(403)
  })

  test('CEO accessing /api/admin/settings → 403', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.use('*', rbacMiddleware('super_admin'))
    app.get('/api/admin/settings', (c) => c.json({ ok: true }))

    const res = await app.request('/api/admin/settings')
    expect(res.status).toBe(403)
  })

  test('company_admin CAN access admin endpoint', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin', true))
    app.use('*', tenantMiddleware)
    app.use('*', rbacMiddleware('super_admin', 'company_admin'))
    app.get('/api/admin/companies', (c) => c.json({ ok: true }))

    const res = await app.request('/api/admin/companies')
    expect(res.status).toBe(200)
  })
})

// ============================================================
// AC #3: companyId Spoofing Blocked
// ============================================================
describe('QA AC#3: companyId Spoofing Prevention', () => {
  test('POST with different companyId → 403', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.post('/api/departments', (c) => c.json({ ok: true }))

    const res = await app.request('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_B, name: 'Evil Dept' }),
    })
    expect(res.status).toBe(403)
  })

  test('CEO query param companyId override attempt is ignored', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.get('/api/agents', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request(`/api/agents?companyId=${COMPANY_B}`)
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.companyId).toBe(COMPANY_A) // NOT Company B
  })

  test('employee query param companyId override attempt is ignored', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'employee'))
    app.use('*', tenantMiddleware)
    app.get('/api/my-data', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request(`/api/my-data?companyId=${COMPANY_B}`)
    const body = await res.json() as any
    expect(body.companyId).toBe(COMPANY_A)
  })

  test('only super_admin can use query param companyId override', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, ADMIN, 'super_admin', true))
    app.use('*', tenantMiddleware)
    app.get('/api/admin/company-data', (c) => {
      const t = c.get('tenant')
      return c.json({ companyId: t.companyId })
    })

    const res = await app.request(`/api/admin/company-data?companyId=${COMPANY_B}`)
    const body = await res.json() as any
    expect(body.companyId).toBe(COMPANY_B) // Super admin CAN override
  })
})

// ============================================================
// AC #4: No Regressions (structural check)
// ============================================================
describe('QA AC#4: No Regressions -- Module Exports Intact', () => {
  test('tenantMiddleware is a function', () => {
    expect(typeof tenantMiddleware).toBe('function')
  })

  test('rbacMiddleware is a function', () => {
    expect(typeof rbacMiddleware).toBe('function')
  })

  test('scopedInsert is a function', () => {
    expect(typeof scopedInsert).toBe('function')
  })

  test('error handler returns proper JSON format', async () => {
    const app = createApp()
    app.use('*', async (_c, next) => { await next() })
    app.use('*', tenantMiddleware) // Will fail with no tenant
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(401)
    const body = await res.json() as any
    expect(body).toHaveProperty('error')
    expect(body.error).toHaveProperty('code')
    expect(body.error).toHaveProperty('message')
  })
})
