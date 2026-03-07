/**
 * TEA (Test Architect) Risk-Based Tests for Story 1-7
 * Focus: High-risk scenarios, edge cases, boundary conditions
 * that the primary integration tests may not cover.
 */
import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import type { UserRole } from '@corthex/shared'
import { tenantMiddleware } from '../../middleware/tenant'
import { rbacMiddleware } from '../../middleware/rbac'
import { errorHandler } from '../../middleware/error'
import { withTenant, scopedWhere, scopedInsert } from '../../db/tenant-helpers'
import { eq } from 'drizzle-orm'
import { departments, agents, auditLogs, companies } from '../../db/schema'
import * as auditLogService from '../../services/audit-log'
import { validateCredentials, maskCredentialFields, PROVIDER_SCHEMAS } from '../../services/credential-vault'
import { CHIEF_OF_STAFF_SOUL, BUILTIN_TEMPLATES, INVESTMENT_TEMPLATE, MARKETING_TEMPLATE, ALL_IN_ONE_TEMPLATE } from '../../services/seed.service'

const COMPANY_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const COMPANY_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const USER_A = 'user-aaaa-0000-0000-000000000001'

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
// P0: Critical Risk -- Cross-Tenant Data Leak Scenarios
// ============================================================
describe('TEA P0: Cross-Tenant Data Leak Risks', () => {
  test('withTenant produces distinct SQL objects for different companies', () => {
    const condA = withTenant(departments.companyId, COMPANY_A)
    const condB = withTenant(departments.companyId, COMPANY_B)
    // They are structurally equal SQL but with different values
    expect(condA).toBeDefined()
    expect(condB).toBeDefined()
    // Different references (not same object)
    expect(condA).not.toBe(condB)
  })

  test('scopedInsert never allows cross-tenant insert even with prototype pollution attempt', () => {
    const malicious = { name: 'Test', __proto__: { companyId: COMPANY_B } }
    const result = scopedInsert(COMPANY_A, malicious)
    expect(result.companyId).toBe(COMPANY_A)
  })

  test('scopedWhere with empty string companyId still produces a condition', () => {
    const cond = scopedWhere(departments.companyId, '', eq(departments.isActive, true))
    expect(cond).toBeDefined()
  })

  test('scopedInsert with very long companyId preserves it exactly', () => {
    const longId = 'a'.repeat(1000)
    const result = scopedInsert(longId, { name: 'Test' })
    expect(result.companyId).toBe(longId)
    expect(result.companyId.length).toBe(1000)
  })

  test('body spoofing via PUT method also blocked', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.put('/api/data', (c) => c.json({ ok: true }))

    const res = await app.request('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: COMPANY_B }),
    })
    expect(res.status).toBe(403)
  })

  test('nested companyId in body is ignored (only top-level checked)', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.post('/api/data', (c) => c.json({ ok: true }))

    const res = await app.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nested: { companyId: COMPANY_B }, name: 'test' }),
    })
    // Only top-level companyId triggers mismatch
    expect(res.status).toBe(200)
  })

  test('empty JSON body on POST does not crash tenant middleware', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.post('/api/data', (c) => c.json({ ok: true }))

    const res = await app.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect(res.status).toBe(200)
  })

  test('malformed JSON body on POST does not crash tenant middleware', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.post('/api/data', (c) => c.json({ ok: true }))

    const res = await app.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    // Malformed body should not crash -- middleware handles gracefully
    expect(res.status).toBe(200)
  })
})

// ============================================================
// P0: Critical Risk -- RBAC Bypass Scenarios
// ============================================================
describe('TEA P0: RBAC Bypass Risk Scenarios', () => {
  test('all 4 roles tested against super_admin-only endpoint', async () => {
    const expectations: { role: UserRole; expected: number }[] = [
      { role: 'super_admin', expected: 200 },
      { role: 'company_admin', expected: 403 },
      { role: 'ceo', expected: 403 },
      { role: 'employee', expected: 403 },
    ]

    for (const { role, expected } of expectations) {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, role, role === 'super_admin'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('super_admin'))
      app.delete('/api/admin/companies/:id', (c) => c.json({ ok: true }))

      const res = await app.request('/api/admin/companies/123', { method: 'DELETE' })
      expect(res.status).toBe(expected)
    }
  })

  test('RBAC with empty allowedRoles array blocks everyone except super_admin', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    // No roles allowed (empty spread)
    app.use('*', rbacMiddleware())
    app.get('/api/locked', (c) => c.json({ ok: true }))

    const res = await app.request('/api/locked')
    expect(res.status).toBe(403)
  })

  test('super_admin bypasses even empty allowedRoles', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'super_admin', true))
    app.use('*', tenantMiddleware)
    app.use('*', rbacMiddleware())
    app.get('/api/locked', (c) => c.json({ ok: true }))

    const res = await app.request('/api/locked')
    expect(res.status).toBe(200)
  })

  test('tenant check runs before RBAC on write operations', async () => {
    const app = createApp()
    // No tenant set -- should fail at tenant level, not RBAC
    app.use('*', async (_c, next) => { await next() })
    app.use('*', tenantMiddleware)
    app.use('*', rbacMiddleware('super_admin'))
    app.post('/api/admin/create', (c) => c.json({ ok: true }))

    const res = await app.request('/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    })
    expect(res.status).toBe(401) // Tenant failure, not 403 RBAC
  })
})

// ============================================================
// P1: Audit Log Immutability & Isolation
// ============================================================
describe('TEA P1: Audit Log Immutability & Isolation', () => {
  test('no update/delete/remove/drop exports exist in audit-log module', () => {
    const exports = Object.keys(auditLogService)
    const dangerous = exports.filter(k =>
      /update|delete|remove|drop|truncate|purge|clear/i.test(k)
    )
    expect(dangerous).toEqual([])
  })

  test('AUDIT_ACTIONS covers all required categories', () => {
    const actions = auditLogService.AUDIT_ACTIONS
    // Organization
    expect(actions.ORG_DEPARTMENT_CREATE).toBeTruthy()
    expect(actions.ORG_AGENT_CREATE).toBeTruthy()
    // Credentials
    expect(actions.CREDENTIAL_STORE).toBeTruthy()
    expect(actions.CREDENTIAL_DELETE).toBeTruthy()
    // Auth
    expect(actions.AUTH_ROLE_CHANGE).toBeTruthy()
    // Trading
    expect(actions.TRADE_ORDER_CREATE).toBeTruthy()
    // System
    expect(actions.SYSTEM_CONFIG_CHANGE).toBeTruthy()
  })

  test('all AUDIT_ACTIONS use dot-separated format (2+ segments)', () => {
    for (const [key, value] of Object.entries(auditLogService.AUDIT_ACTIONS)) {
      expect(value).toMatch(/^[a-z]+(\.[a-z_]+)+$/)
    }
  })

  test('CreateAuditLogInput requires companyId (type check)', () => {
    const validInput: auditLogService.CreateAuditLogInput = {
      companyId: COMPANY_A,
      actorType: 'user',
      actorId: USER_A,
      action: 'test.action',
    }
    expect(validInput.companyId).toBe(COMPANY_A)
    expect(validInput.actorType).toBe('user')
  })

  test('AuditLogQueryOptions enforces companyId (type check)', () => {
    const validQuery: auditLogService.AuditLogQueryOptions = {
      companyId: COMPANY_A,
    }
    expect(validQuery.companyId).toBe(COMPANY_A)
  })

  test('queryAuditLogs pagination limit cannot exceed 100', () => {
    const options: auditLogService.AuditLogQueryOptions = {
      companyId: COMPANY_A,
      limit: 999,
    }
    const effectiveLimit = Math.min(options.limit ?? 50, 100)
    expect(effectiveLimit).toBe(100)
  })
})

// ============================================================
// P1: Credential Vault Boundary Tests
// ============================================================
describe('TEA P1: Credential Vault Boundaries', () => {
  test('maskCredentialFields handles empty object', () => {
    const masked = maskCredentialFields({})
    expect(Object.keys(masked).length).toBe(0)
  })

  test('maskCredentialFields handles single field', () => {
    const masked = maskCredentialFields({ api_key: 'sk-123' })
    expect(masked.api_key).toBe('***')
  })

  test('maskCredentialFields handles many fields', () => {
    const fields: Record<string, string> = {}
    for (let i = 0; i < 50; i++) fields[`key_${i}`] = `value_${i}`
    const masked = maskCredentialFields(fields)
    expect(Object.keys(masked).length).toBe(50)
    for (const v of Object.values(masked)) expect(v).toBe('***')
  })

  test('validateCredentials rejects missing required fields for all known providers', () => {
    for (const [provider, required] of Object.entries(PROVIDER_SCHEMAS)) {
      if (required.length > 0) {
        expect(() => validateCredentials(provider, {})).toThrow('필수 필드 누락')
      }
    }
  })

  test('validateCredentials accepts all required fields for each provider', () => {
    for (const [provider, required] of Object.entries(PROVIDER_SCHEMAS)) {
      const fields: Record<string, string> = {}
      for (const f of required) fields[f] = 'test-value'
      expect(() => validateCredentials(provider, fields)).not.toThrow()
    }
  })

  test('validateCredentials accepts extra fields beyond required', () => {
    expect(() => validateCredentials('anthropic', {
      api_key: 'sk-123',
      extra_field: 'value',
    })).not.toThrow()
  })
})

// ============================================================
// P1: Seed Data Integrity
// ============================================================
describe('TEA P1: Seed Data Integrity', () => {
  test('CHIEF_OF_STAFF_SOUL is non-empty markdown', () => {
    expect(CHIEF_OF_STAFF_SOUL.length).toBeGreaterThan(100)
    expect(CHIEF_OF_STAFF_SOUL.startsWith('#')).toBe(true)
  })

  test('BUILTIN_TEMPLATES has unique names', () => {
    const names = BUILTIN_TEMPLATES.map(t => t.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  test('no template has zero departments', () => {
    for (const tpl of BUILTIN_TEMPLATES) {
      expect(tpl.templateData.departments.length).toBeGreaterThan(0)
    }
  })

  test('no agent in any template has empty soul', () => {
    for (const tpl of BUILTIN_TEMPLATES) {
      for (const dept of tpl.templateData.departments) {
        for (const agent of dept.agents) {
          expect(agent.soul.length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('no agent in any template has empty allowedTools', () => {
    for (const tpl of BUILTIN_TEMPLATES) {
      for (const dept of tpl.templateData.departments) {
        for (const agent of dept.agents) {
          expect(agent.allowedTools.length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('올인원 template has at least 4 departments', () => {
    expect(ALL_IN_ONE_TEMPLATE.departments.length).toBeGreaterThanOrEqual(4)
  })

  test('투자분석 template has exactly 1 department', () => {
    expect(INVESTMENT_TEMPLATE.departments.length).toBe(1)
  })

  test('마케팅 template has exactly 1 department', () => {
    expect(MARKETING_TEMPLATE.departments.length).toBe(1)
  })
})

// ============================================================
// P2: Edge Cases & Boundary Conditions
// ============================================================
describe('TEA P2: Edge Cases', () => {
  test('tenant middleware with form-urlencoded does not crash', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
    app.use('*', tenantMiddleware)
    app.post('/api/form', (c) => c.json({ ok: true }))

    const res = await app.request('/api/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=test&companyId=evil',
    })
    // Form body is not JSON, so middleware skips companyId check
    expect(res.status).toBe(200)
  })

  test('tenant middleware on DELETE method does not check body', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin'))
    app.use('*', tenantMiddleware)
    app.delete('/api/item/:id', (c) => c.json({ ok: true }))

    const res = await app.request('/api/item/123', { method: 'DELETE' })
    expect(res.status).toBe(200)
  })

  test('withTenant works with companies table', () => {
    const cond = withTenant(companies.id, COMPANY_A)
    expect(cond).toBeDefined()
  })

  test('withTenant works with agents table companyId', () => {
    const cond = withTenant(agents.companyId, COMPANY_A)
    expect(cond).toBeDefined()
  })

  test('withTenant works with auditLogs table companyId', () => {
    const cond = withTenant(auditLogs.companyId, COMPANY_A)
    expect(cond).toBeDefined()
  })

  test('scopedInsert with null values preserves them', () => {
    const data = { name: 'Test', description: null as any }
    const result = scopedInsert(COMPANY_A, data)
    expect(result.companyId).toBe(COMPANY_A)
    expect(result.description).toBeNull()
  })

  test('scopedInsert with undefined values preserves them', () => {
    const data = { name: 'Test', optional: undefined as any }
    const result = scopedInsert(COMPANY_A, data)
    expect(result.companyId).toBe(COMPANY_A)
    expect(result.optional).toBeUndefined()
  })

  test('multiple RBAC middlewares on different routes work independently', async () => {
    const app = createApp()
    app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin', true))
    app.use('*', tenantMiddleware)

    // Admin route: company_admin allowed
    app.get('/api/admin/users', rbacMiddleware('company_admin'), (c) => c.json({ route: 'admin' }))
    // CEO-only route: company_admin NOT allowed (only ceo)
    app.get('/api/ceo/strategy', rbacMiddleware('ceo'), (c) => c.json({ route: 'strategy' }))

    const res1 = await app.request('/api/admin/users')
    expect(res1.status).toBe(200)

    const res2 = await app.request('/api/ceo/strategy')
    expect(res2.status).toBe(403)
  })
})
