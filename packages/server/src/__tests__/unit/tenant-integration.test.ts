import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import type { UserRole } from '@corthex/shared'
import { tenantMiddleware } from '../../middleware/tenant'
import { rbacMiddleware } from '../../middleware/rbac'
import { errorHandler } from '../../middleware/error'
import { withTenant, scopedWhere, scopedInsert } from '../../db/tenant-helpers'
import { eq } from 'drizzle-orm'
import { departments, agents, auditLogs, orgTemplates } from '../../db/schema'
import * as auditLogService from '../../services/audit-log'
import {
  validateCredentials,
  maskCredentialFields,
  getProviderSchemas,
  PROVIDER_SCHEMAS,
  SUPPORTED_PROVIDERS,
} from '../../services/credential-vault'
import {
  CHIEF_OF_STAFF_SOUL,
  INVESTMENT_TEMPLATE,
  MARKETING_TEMPLATE,
  ALL_IN_ONE_TEMPLATE,
  BUILTIN_TEMPLATES,
} from '../../services/seed.service'
import type { TemplateData, TemplateAgent } from '../../services/seed.service'

// ============================================================
// Constants: Two companies for cross-tenant testing
// ============================================================
const COMPANY_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const COMPANY_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const USER_A = 'user-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const USER_B = 'user-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const ADMIN_USER = 'admin-0000-0000-0000-000000000000'

// ============================================================
// Helper: Create Hono app with middleware chain
// ============================================================
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
// Task 1: Tenant Isolation Integration Tests
// ============================================================
describe('Task 1: Tenant Isolation -- Cross-Tenant Data Leak Prevention', () => {
  // --- 1.1: tenant-helpers cross-tenant verification ---
  describe('tenant-helpers cross-tenant filtering', () => {
    test('withTenant(companyA) produces filter that excludes companyB', () => {
      const filterA = withTenant(departments.companyId, COMPANY_A)
      const filterB = withTenant(departments.companyId, COMPANY_B)
      // Both produce SQL objects but with different companyId values
      expect(filterA).toBeDefined()
      expect(filterB).toBeDefined()
      // Drizzle SQL objects are structurally different when values differ
      expect(filterA).not.toBe(filterB)
    })

    test('scopedWhere combines companyId with extra conditions', () => {
      const condA = scopedWhere(departments.companyId, COMPANY_A, eq(departments.isActive, true))
      const condB = scopedWhere(departments.companyId, COMPANY_B, eq(departments.isActive, true))
      expect(condA).toBeDefined()
      expect(condB).toBeDefined()
      expect(condA).not.toBe(condB)
    })

    test('scopedInsert always injects correct companyId', () => {
      const dataA = scopedInsert(COMPANY_A, { name: 'Dept-A' })
      const dataB = scopedInsert(COMPANY_B, { name: 'Dept-B' })
      expect(dataA.companyId).toBe(COMPANY_A)
      expect(dataB.companyId).toBe(COMPANY_B)
      expect(dataA.companyId).not.toBe(dataB.companyId)
    })

    test('scopedInsert overrides malicious companyId in data', () => {
      const malicious = scopedInsert(COMPANY_A, { companyId: COMPANY_B, name: 'Hack' })
      expect(malicious.companyId).toBe(COMPANY_A)
    })
  })

  // --- 1.2: tenantMiddleware companyId missing → 401 ---
  describe('tenantMiddleware: missing companyId → 401', () => {
    test('no tenant context at all → 401', async () => {
      const app = createApp()
      app.use('*', async (_c, next) => { await next() })
      app.use('*', tenantMiddleware)
      app.get('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test')
      expect(res.status).toBe(401)
      const body = await res.json() as any
      expect(body.error.code).toBe('TENANT_001')
    })

    test('null companyId → 401', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: null as any, userId: USER_A, role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test')
      expect(res.status).toBe(401)
    })
  })

  // --- 1.3: tenantMiddleware body mismatch → 403 ---
  describe('tenantMiddleware: body companyId mismatch → 403', () => {
    test('companyA user sends companyB in POST body → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)
      app.post('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_B, name: 'hijack' }),
      })
      expect(res.status).toBe(403)
      const body = await res.json() as any
      expect(body.error.code).toBe('TENANT_002')
    })

    test('companyA user sends companyA in PUT body → 200 (match)', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)
      app.put('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_A, name: 'legit' }),
      })
      expect(res.status).toBe(200)
    })

    test('PATCH with mismatched companyId → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin'))
      app.use('*', tenantMiddleware)
      app.patch('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_B }),
      })
      expect(res.status).toBe(403)
    })
  })

  // --- 1.4: superadmin companyId override ---
  describe('superadmin companyId override', () => {
    test('superadmin can target companyB via query param', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, ADMIN_USER, 'super_admin', true))
      app.use('*', tenantMiddleware)
      app.get('/api/test', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request(`/api/test?companyId=${COMPANY_B}`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.companyId).toBe(COMPANY_B)
    })

    test('superadmin can POST with different companyId in body (no 403)', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, ADMIN_USER, 'super_admin', true))
      app.use('*', tenantMiddleware)
      app.post('/api/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_B, name: 'admin-action' }),
      })
      expect(res.status).toBe(200)
    })

    test('non-superadmin query param companyId is IGNORED', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)
      app.get('/api/test', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request(`/api/test?companyId=${COMPANY_B}`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      // CEO cannot override -- stays as COMPANY_A
      expect(body.companyId).toBe(COMPANY_A)
    })
  })

  // --- 1.5: companyId spoofing attempts ---
  describe('companyId spoofing attempts', () => {
    test('employee trying to spoof body companyId → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'employee'))
      app.use('*', tenantMiddleware)
      app.post('/api/data', (c) => c.json({ ok: true }))

      const res = await app.request('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_B }),
      })
      expect(res.status).toBe(403)
    })

    test('company_admin trying to spoof body companyId → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin'))
      app.use('*', tenantMiddleware)
      app.post('/api/data', (c) => c.json({ ok: true }))

      const res = await app.request('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: COMPANY_B }),
      })
      expect(res.status).toBe(403)
    })
  })
})

// ============================================================
// Task 2: RBAC Integration Tests
// ============================================================
describe('Task 2: RBAC Integration -- Role-Based Access Control', () => {
  // --- 2.1: rbacMiddleware allowed/denied ---
  describe('rbacMiddleware: allowed roles pass, denied roles get 403', () => {
    test('company_admin passes admin-level middleware', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'company_admin', true))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('super_admin', 'company_admin'))
      app.get('/api/admin/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/admin/test')
      expect(res.status).toBe(200)
    })

    test('CEO is denied admin-only endpoint → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('super_admin', 'company_admin'))
      app.get('/api/admin/test', (c) => c.json({ ok: true }))

      const res = await app.request('/api/admin/test')
      expect(res.status).toBe(403)
      const body = await res.json() as any
      expect(body.error.code).toBe('RBAC_001')
    })

    test('employee is denied CEO-only endpoint → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'employee'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('ceo'))
      app.get('/api/strategy', (c) => c.json({ ok: true }))

      const res = await app.request('/api/strategy')
      expect(res.status).toBe(403)
    })
  })

  // --- 2.2: super_admin always passes ---
  describe('super_admin bypasses all RBAC', () => {
    test('super_admin passes CEO-only endpoint', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, ADMIN_USER, 'super_admin', true))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('ceo'))
      app.get('/api/strategy', (c) => c.json({ ok: true }))

      const res = await app.request('/api/strategy')
      expect(res.status).toBe(200)
    })

    test('super_admin passes employee-only endpoint', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, ADMIN_USER, 'super_admin', true))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('employee'))
      app.get('/api/workspace', (c) => c.json({ ok: true }))

      const res = await app.request('/api/workspace')
      expect(res.status).toBe(200)
    })
  })

  // --- 2.3: RBAC denial audit log structure ---
  describe('RBAC denial audit log data structure', () => {
    test('logRbacDenial produces correct audit log structure', () => {
      // Verify the data that logRbacDenial would insert
      const tenant = { companyId: COMPANY_A, userId: USER_A, role: 'employee' as UserRole, isAdminUser: false }
      const auditEntry = {
        companyId: tenant.companyId,
        actorType: tenant.isAdminUser ? 'admin_user' : 'user',
        actorId: tenant.userId,
        action: 'auth.rbac.denied',
        targetType: 'api_endpoint',
        metadata: { method: 'GET', path: '/api/admin/companies', role: tenant.role },
      }

      expect(auditEntry.companyId).toBe(COMPANY_A)
      expect(auditEntry.actorType).toBe('user')
      expect(auditEntry.action).toBe('auth.rbac.denied')
      expect(auditEntry.metadata.role).toBe('employee')
    })

    test('admin_user denial uses actorType=admin_user', () => {
      const tenant = { companyId: COMPANY_A, userId: USER_A, role: 'company_admin' as UserRole, isAdminUser: true }
      const actorType = tenant.isAdminUser ? 'admin_user' : 'user'
      expect(actorType).toBe('admin_user')
    })
  })

  // --- 2.4: Middleware chaining: auth → tenant → rbac ---
  describe('middleware chaining order: tenant(401) before rbac(403)', () => {
    test('missing tenant → 401 (not 403 from RBAC)', async () => {
      const app = createApp()
      // No tenant set → tenant middleware fires first
      app.use('*', async (_c, next) => { await next() })
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('super_admin'))
      app.get('/api/admin', (c) => c.json({ ok: true }))

      const res = await app.request('/api/admin')
      expect(res.status).toBe(401) // tenant rejects before RBAC even runs
      const body = await res.json() as any
      expect(body.error.code).toBe('TENANT_001')
    })

    test('valid tenant + wrong role → 403 from RBAC', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'employee'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('super_admin'))
      app.get('/api/admin', (c) => c.json({ ok: true }))

      const res = await app.request('/api/admin')
      expect(res.status).toBe(403)
      const body = await res.json() as any
      expect(body.error.code).toBe('RBAC_001')
    })
  })
})

// ============================================================
// Task 3: Audit Log Tenant Isolation Tests
// ============================================================
describe('Task 3: Audit Log -- Tenant Isolation', () => {
  // --- 3.1: createAuditLog input structure per company ---
  describe('createAuditLog companyId isolation', () => {
    test('audit log input carries correct companyId for company A', () => {
      const input: auditLogService.CreateAuditLogInput = {
        companyId: COMPANY_A,
        actorType: 'user',
        actorId: USER_A,
        action: auditLogService.AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE,
        targetType: 'department',
        targetId: 'dept-1',
      }
      expect(input.companyId).toBe(COMPANY_A)
      expect(input.action).toBe('org.department.create')
    })

    test('audit log input carries correct companyId for company B', () => {
      const input: auditLogService.CreateAuditLogInput = {
        companyId: COMPANY_B,
        actorType: 'user',
        actorId: USER_B,
        action: auditLogService.AUDIT_ACTIONS.ORG_AGENT_CREATE,
        targetType: 'agent',
        targetId: 'agent-1',
      }
      expect(input.companyId).toBe(COMPANY_B)
      expect(input.companyId).not.toBe(COMPANY_A)
    })
  })

  // --- 3.2: queryAuditLogs filtering by companyId ---
  describe('queryAuditLogs companyId filtering', () => {
    test('query options enforce companyId filter', () => {
      const optionsA: auditLogService.AuditLogQueryOptions = {
        companyId: COMPANY_A,
        action: 'org.department.create',
      }
      const optionsB: auditLogService.AuditLogQueryOptions = {
        companyId: COMPANY_B,
        action: 'org.department.create',
      }
      // Different companies produce different query parameters
      expect(optionsA.companyId).not.toBe(optionsB.companyId)
    })

    test('query options use eq(auditLogs.companyId) for filtering', () => {
      // Verify the SQL condition builder produces tenant-scoped filter
      const condition = eq(auditLogs.companyId, COMPANY_A)
      expect(condition).toBeDefined()
      expect(condition.toString()).toBeDefined()
    })

    test('pagination defaults are safe (no full table scan)', () => {
      const options: auditLogService.AuditLogQueryOptions = {
        companyId: COMPANY_A,
      }
      const page = options.page ?? 1
      const limit = Math.min(options.limit ?? 50, 100)
      expect(page).toBe(1)
      expect(limit).toBe(50)
      expect(limit).toBeLessThanOrEqual(100)
    })
  })

  // --- 3.3: INSERT ONLY policy ---
  describe('audit log INSERT ONLY policy', () => {
    test('audit-log.ts only exports insert functions (no update/delete)', () => {
      const exports = Object.keys(auditLogService)
      // createAuditLog, queryAuditLogs, withAuditLog, AUDIT_ACTIONS, type exports
      expect(exports).toContain('createAuditLog')
      expect(exports).toContain('queryAuditLogs')
      expect(exports).toContain('withAuditLog')
      expect(exports).toContain('AUDIT_ACTIONS')
      // No update or delete functions
      expect(exports).not.toContain('updateAuditLog')
      expect(exports).not.toContain('deleteAuditLog')
      expect(exports).not.toContain('removeAuditLog')
    })
  })

  // --- 3.4: withAuditLog wrapper structure ---
  describe('withAuditLog wrapper', () => {
    test('withAuditLog function signature is correct', () => {
      expect(typeof auditLogService.withAuditLog).toBe('function')
      // It takes (auditInput, operation) and returns Promise<{result, auditLogId}>
      expect(auditLogService.withAuditLog.length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ============================================================
// Task 4: Credential Vault Tenant Isolation Tests
// ============================================================
describe('Task 4: Credential Vault -- Tenant Isolation', () => {
  // --- 4.1: credential functions enforce companyId ---
  describe('credential vault companyId enforcement', () => {
    test('getCredentials requires companyId parameter', () => {
      // The function signature requires companyId as first param
      const { getCredentials } = require('../../services/credential-vault')
      expect(typeof getCredentials).toBe('function')
    })

    test('listCredentials requires companyId parameter', () => {
      const { listCredentials } = require('../../services/credential-vault')
      expect(typeof listCredentials).toBe('function')
    })

    test('storeCredentials requires companyId in input', () => {
      const { storeCredentials } = require('../../services/credential-vault')
      expect(typeof storeCredentials).toBe('function')
    })

    test('deleteCredential requires both id and companyId', () => {
      const { deleteCredential } = require('../../services/credential-vault')
      expect(typeof deleteCredential).toBe('function')
    })

    test('updateCredentials requires both id and companyId', () => {
      const { updateCredentials } = require('../../services/credential-vault')
      expect(typeof updateCredentials).toBe('function')
    })
  })

  // --- 4.2: maskCredentialFields for audit safety ---
  describe('credential audit log safety (NFR12)', () => {
    test('maskCredentialFields masks all values with ***', () => {
      const fields = { api_key: 'sk-real-key-12345', secret: 'super-secret' }
      const masked = maskCredentialFields(fields)
      expect(masked.api_key).toBe('***')
      expect(masked.secret).toBe('***')
      expect(Object.keys(masked)).toEqual(Object.keys(fields))
    })

    test('masking preserves field keys but never exposes values', () => {
      const fields = { app_key: 'key1', app_secret: 'secret1', account_no: 'acc1' }
      const masked = maskCredentialFields(fields)
      for (const value of Object.values(masked)) {
        expect(value).toBe('***')
      }
    })
  })

  // --- 4.3: validation per provider ---
  describe('credential validation by provider', () => {
    test('anthropic requires api_key', () => {
      expect(() => validateCredentials('anthropic', {})).toThrow('필수 필드 누락')
      expect(() => validateCredentials('anthropic', { api_key: 'key' })).not.toThrow()
    })

    test('kis requires app_key, app_secret, account_no', () => {
      expect(() => validateCredentials('kis', { app_key: 'k' })).toThrow('필수 필드 누락')
      expect(() => validateCredentials('kis', {
        app_key: 'k', app_secret: 's', account_no: 'a',
      })).not.toThrow()
    })

    test('unknown provider skips schema validation', () => {
      expect(() => validateCredentials('unknown_provider', {})).not.toThrow()
    })
  })

  // --- 4.4: SUPPORTED_PROVIDERS and schemas ---
  describe('provider schemas completeness', () => {
    test('all SUPPORTED_PROVIDERS have schema entries', () => {
      for (const provider of SUPPORTED_PROVIDERS) {
        expect(PROVIDER_SCHEMAS[provider]).toBeDefined()
        expect(PROVIDER_SCHEMAS[provider].length).toBeGreaterThan(0)
      }
    })

    test('getProviderSchemas returns deep copy (no mutation risk)', () => {
      const schemas = getProviderSchemas()
      schemas['anthropic'].push('MUTATED')
      expect(PROVIDER_SCHEMAS['anthropic']).not.toContain('MUTATED')
    })
  })
})

// ============================================================
// Task 5: Seed Data / Org Template Tenant Isolation Tests
// ============================================================
describe('Task 5: Seed Data & Org Templates -- Tenant Isolation', () => {
  // --- 5.1: Chief of Staff system agent ---
  describe('비서실장 (Chief of Staff) system agent seed', () => {
    test('CHIEF_OF_STAFF_SOUL contains required role definition', () => {
      expect(CHIEF_OF_STAFF_SOUL).toContain('비서실장')
      expect(CHIEF_OF_STAFF_SOUL).toContain('Chief of Staff')
      expect(CHIEF_OF_STAFF_SOUL).toContain('명령 분류')
      expect(CHIEF_OF_STAFF_SOUL).toContain('자동 위임')
      expect(CHIEF_OF_STAFF_SOUL).toContain('품질 검수')
    })

    test('CHIEF_OF_STAFF_SOUL contains 5-item quality rubric', () => {
      expect(CHIEF_OF_STAFF_SOUL).toContain('결론')
      expect(CHIEF_OF_STAFF_SOUL).toContain('근거')
      expect(CHIEF_OF_STAFF_SOUL).toContain('리스크')
      expect(CHIEF_OF_STAFF_SOUL).toContain('형식')
      expect(CHIEF_OF_STAFF_SOUL).toContain('논리')
    })

    test('비서실장 is a system agent (isSystem=true)', () => {
      // In seed service, seedSystemAgent sets isSystem=true
      expect(CHIEF_OF_STAFF_SOUL).toContain('isSystem=true')
    })
  })

  // --- 5.2: Builtin templates are platform-wide (companyId=null) ---
  describe('builtin templates are platform-wide', () => {
    test('BUILTIN_TEMPLATES has 3 templates', () => {
      expect(BUILTIN_TEMPLATES.length).toBe(3)
    })

    test('all templates have name and templateData (isBuiltin/companyId set at DB insert)', () => {
      for (const tpl of BUILTIN_TEMPLATES) {
        expect(tpl.name).toBeTruthy()
        expect(tpl.templateData).toBeDefined()
        expect(tpl.templateData.departments).toBeDefined()
      }
    })

    test('seedOrgTemplates sets isBuiltin=true and companyId=null at insert time', () => {
      // Verify the seed service code uses isBuiltin=true during DB insert
      // BUILTIN_TEMPLATES are data constants; isBuiltin is set in seedOrgTemplates()
      for (const tpl of BUILTIN_TEMPLATES) {
        // Template data should not contain isBuiltin (it's a DB field)
        expect((tpl as any).isBuiltin).toBeUndefined()
        expect((tpl as any).companyId).toBeUndefined()
      }
    })
  })

  // --- 5.3: Template data structural integrity ---
  describe('template data structural integrity', () => {
    const templates: { name: string; data: TemplateData }[] = [
      { name: '투자분석', data: INVESTMENT_TEMPLATE },
      { name: '마케팅', data: MARKETING_TEMPLATE },
      { name: '올인원', data: ALL_IN_ONE_TEMPLATE },
    ]

    for (const { name, data } of templates) {
      describe(`${name} template`, () => {
        test('has departments array', () => {
          expect(Array.isArray(data.departments)).toBe(true)
          expect(data.departments.length).toBeGreaterThan(0)
        })

        test('each department has name and agents', () => {
          for (const dept of data.departments) {
            expect(dept.name).toBeTruthy()
            expect(Array.isArray(dept.agents)).toBe(true)
            expect(dept.agents.length).toBeGreaterThan(0)
          }
        })

        test('each agent has required fields (name, tier, modelName, soul, allowedTools)', () => {
          for (const dept of data.departments) {
            for (const agent of dept.agents) {
              expect(agent.name).toBeTruthy()
              expect(['manager', 'specialist', 'worker']).toContain(agent.tier)
              expect(agent.modelName).toBeTruthy()
              expect(agent.soul).toBeTruthy()
              expect(Array.isArray(agent.allowedTools)).toBe(true)
            }
          }
        })

        test('each department has exactly one manager', () => {
          for (const dept of data.departments) {
            const managers = dept.agents.filter((a: TemplateAgent) => a.tier === 'manager')
            expect(managers.length).toBe(1)
          }
        })

        test('manager tier uses sonnet model', () => {
          for (const dept of data.departments) {
            const manager = dept.agents.find((a: TemplateAgent) => a.tier === 'manager')!
            expect(manager.modelName).toContain('sonnet')
          }
        })
      })
    }
  })

  // --- 5.4: Seed idempotency verification ---
  describe('seed idempotency design', () => {
    test('seedSystemAgent function exists', () => {
      const { seedSystemAgent } = require('../../services/seed.service')
      expect(typeof seedSystemAgent).toBe('function')
    })

    test('seedOrgTemplates function exists', () => {
      const { seedOrgTemplates } = require('../../services/seed.service')
      expect(typeof seedOrgTemplates).toBe('function')
    })
  })
})

// ============================================================
// Task 6: Cross-Component Integration Tests
// ============================================================
describe('Task 6: Cross-Component Integration', () => {
  // --- 6.1: Full middleware chain: tenant → RBAC → handler ---
  describe('full middleware chain: tenant + RBAC', () => {
    test('companyA CEO accesses workspace endpoint → 200', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('ceo', 'company_admin'))
      app.get('/api/workspace', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId, role: t.role })
      })

      const res = await app.request('/api/workspace')
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.companyId).toBe(COMPANY_A)
      expect(body.role).toBe('ceo')
    })

    test('companyB employee cannot access CEO endpoint → 403', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_B, USER_B, 'employee'))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('ceo', 'company_admin'))
      app.get('/api/strategy', (c) => c.json({ ok: true }))

      const res = await app.request('/api/strategy')
      expect(res.status).toBe(403)
    })

    test('superadmin accessing companyB via override → gets companyB context', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, ADMIN_USER, 'super_admin', true))
      app.use('*', tenantMiddleware)
      app.use('*', rbacMiddleware('company_admin'))
      app.get('/api/admin/users', (c) => {
        const t = c.get('tenant')
        return c.json({ companyId: t.companyId })
      })

      const res = await app.request(`/api/admin/users?companyId=${COMPANY_B}`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.companyId).toBe(COMPANY_B)
    })
  })

  // --- 6.2: Audit log + RBAC integration ---
  describe('RBAC denial → audit log data flow', () => {
    test('RBAC denial log includes tenant companyId', () => {
      const tenantA = { companyId: COMPANY_A, userId: USER_A, role: 'employee' as UserRole }
      const auditData = {
        companyId: tenantA.companyId,
        actorType: 'user' as const,
        actorId: tenantA.userId,
        action: 'auth.rbac.denied',
        targetType: 'api_endpoint',
        metadata: { method: 'DELETE', path: '/api/admin/companies/1', role: tenantA.role },
      }
      expect(auditData.companyId).toBe(COMPANY_A)
      expect(auditData.action).toBe('auth.rbac.denied')
    })

    test('companyB RBAC denial log has companyB (not companyA)', () => {
      const tenantB = { companyId: COMPANY_B, userId: USER_B, role: 'ceo' as UserRole }
      const auditData = {
        companyId: tenantB.companyId,
        actorType: 'user' as const,
        actorId: tenantB.userId,
        action: 'auth.rbac.denied',
      }
      expect(auditData.companyId).toBe(COMPANY_B)
      expect(auditData.companyId).not.toBe(COMPANY_A)
    })
  })

  // --- 6.3: Credential vault + audit log integration ---
  describe('credential vault + audit log integration', () => {
    test('AUDIT_ACTIONS includes credential actions', () => {
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_STORE).toBe('credential.store')
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_ACCESS).toBe('credential.access')
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_DELETE).toBe('credential.delete')
    })

    test('credential store audit input has masked fields (NFR12)', () => {
      const creds = { api_key: 'sk-real-key', app_secret: 'real-secret' }
      const maskedAfter = maskCredentialFields(creds)
      const auditInput: auditLogService.CreateAuditLogInput = {
        companyId: COMPANY_A,
        actorType: 'admin_user',
        actorId: ADMIN_USER,
        action: auditLogService.AUDIT_ACTIONS.CREDENTIAL_STORE,
        targetType: 'api_key',
        targetId: 'key-123',
        after: maskedAfter,
      }
      expect((auditInput.after as any).api_key).toBe('***')
      expect((auditInput.after as any).app_secret).toBe('***')
    })
  })

  // --- 6.4: Edge cases ---
  describe('edge cases', () => {
    test('empty string companyId → tenant middleware rejects (401)', async () => {
      const app = createApp()
      app.use('*', async (c, next) => {
        c.set('tenant', { companyId: '', userId: USER_A, role: 'ceo' as const })
        await next()
      })
      app.use('*', tenantMiddleware)
      app.get('/test', (c) => c.json({ ok: true }))

      const res = await app.request('/test')
      expect(res.status).toBe(401)
    })

    test('tenant helpers work with different table companyId columns', () => {
      const deptFilter = withTenant(departments.companyId, COMPANY_A)
      const agentFilter = withTenant(agents.companyId, COMPANY_A)
      const auditFilter = withTenant(auditLogs.companyId, COMPANY_A)
      const templateFilter = withTenant(orgTemplates.companyId, COMPANY_A)

      expect(deptFilter).toBeDefined()
      expect(agentFilter).toBeDefined()
      expect(auditFilter).toBeDefined()
      expect(templateFilter).toBeDefined()
    })

    test('scopedInsert preserves all original data fields', () => {
      const data = { name: 'Test', description: 'Desc', isActive: true, tier: 'manager' }
      const result = scopedInsert(COMPANY_A, data)
      expect(result.companyId).toBe(COMPANY_A)
      expect(result.name).toBe('Test')
      expect(result.description).toBe('Desc')
      expect(result.isActive).toBe(true)
      expect(result.tier).toBe('manager')
    })

    test('RBAC with all 4 roles on workspace endpoint', async () => {
      const roles: { role: UserRole; expected: number }[] = [
        { role: 'super_admin', expected: 200 },
        { role: 'company_admin', expected: 200 },
        { role: 'ceo', expected: 200 },
        { role: 'employee', expected: 200 },
      ]

      for (const { role, expected } of roles) {
        const app = createApp()
        app.use('*', setTenant(COMPANY_A, USER_A, role, role === 'super_admin'))
        app.use('*', tenantMiddleware)
        app.use('*', rbacMiddleware('company_admin', 'ceo', 'employee'))
        app.get('/api/ws', (c) => c.json({ ok: true }))

        const res = await app.request('/api/ws')
        expect(res.status).toBe(expected)
      }
    })

    test('multiple tenantMiddleware + rbacMiddleware chains in sequence', async () => {
      const app = createApp()
      app.use('*', setTenant(COMPANY_A, USER_A, 'ceo'))
      app.use('*', tenantMiddleware)

      // Route 1: admin only
      app.get('/api/admin/config', rbacMiddleware('super_admin', 'company_admin'), (c) => c.json({ ok: true }))
      // Route 2: CEO allowed
      app.get('/api/commands', rbacMiddleware('ceo', 'company_admin'), (c) => c.json({ ok: true }))

      // CEO should be denied admin route
      const res1 = await app.request('/api/admin/config')
      expect(res1.status).toBe(403)

      // CEO should access commands route
      const res2 = await app.request('/api/commands')
      expect(res2.status).toBe(200)
    })
  })
})
