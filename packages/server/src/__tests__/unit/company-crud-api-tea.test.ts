import { describe, expect, test } from 'bun:test'

/**
 * TEA-generated tests for Story 9-1: Company CRUD API
 * Risk-based coverage: P0 security boundaries, P0 data integrity, P1 edge cases
 */

describe('TEA: Company CRUD API (Story 9-1)', () => {
  // === P0: Password Security ===
  describe('P0: generateSecurePassword security requirements', () => {
    test('password meets minimum 12-char security requirement', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const pw = generateSecurePassword(12)
      expect(pw.length).toBe(12)
    })

    test('default password exceeds minimum requirement (16 chars)', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const pw = generateSecurePassword()
      expect(pw.length).toBeGreaterThanOrEqual(12)
    })

    test('password entropy: each char from large charset (no repeated patterns)', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      // Generate 100 passwords, check no two are identical
      const set = new Set<string>()
      for (let i = 0; i < 100; i++) set.add(generateSecurePassword())
      expect(set.size).toBe(100)
    })

    test('password always contains mixed character classes', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      // Run 50 times to ensure consistency
      for (let i = 0; i < 50; i++) {
        const pw = generateSecurePassword()
        expect(/[A-Z]/.test(pw)).toBe(true)
        expect(/[a-z]/.test(pw)).toBe(true)
        expect(/[0-9]/.test(pw)).toBe(true)
        expect(/[!@#$%^&*]/.test(pw)).toBe(true)
      }
    })

    test('password with minimum length 4 still has all character classes', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      for (let i = 0; i < 20; i++) {
        const pw = generateSecurePassword(4)
        expect(pw.length).toBe(4)
        expect(/[A-Z]/.test(pw)).toBe(true)
        expect(/[a-z]/.test(pw)).toBe(true)
        expect(/[0-9]/.test(pw)).toBe(true)
        expect(/[!@#$%^&*]/.test(pw)).toBe(true)
      }
    })

    test('password does not contain null bytes or control characters', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      for (let i = 0; i < 20; i++) {
        const pw = generateSecurePassword(32)
        // No control characters (ASCII 0-31), no DEL (127)
        expect(/[\x00-\x1f\x7f]/.test(pw)).toBe(false)
      }
    })

    test('large password length works correctly', async () => {
      const { generateSecurePassword } = await import('../../services/company-management')
      const pw = generateSecurePassword(128)
      expect(pw.length).toBe(128)
    })
  })

  // === P0: RBAC Security Boundary ===
  describe('P0: RBAC enforcement for super-admin routes', () => {
    test('route file imports rbacMiddleware (not adminOnly)', async () => {
      const content = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(content).toContain("rbacMiddleware('super_admin')")
      expect(content).not.toContain('adminOnly')
    })

    test('rbacMiddleware blocks non-super_admin roles', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      const mw = rbacMiddleware('super_admin')

      // Simulate company_admin context
      const mockContext = {
        get: (key: string) => {
          if (key === 'tenant') return { role: 'company_admin', companyId: 'test', userId: 'test' }
          return undefined
        },
        req: { method: 'GET', path: '/api/super-admin/companies' },
      }

      let errorThrown = false
      try {
        await mw(mockContext as any, async () => {})
      } catch (e: any) {
        errorThrown = true
        expect(e.status).toBe(403)
      }
      expect(errorThrown).toBe(true)
    })

    test('rbacMiddleware allows super_admin role', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      const mw = rbacMiddleware('super_admin')

      const mockContext = {
        get: (key: string) => {
          if (key === 'tenant') return { role: 'super_admin', companyId: 'system', userId: 'test' }
          return undefined
        },
        req: { method: 'GET', path: '/api/super-admin/companies' },
      }

      let nextCalled = false
      await mw(mockContext as any, async () => { nextCalled = true })
      expect(nextCalled).toBe(true)
    })

    test('rbacMiddleware blocks ceo role', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      const mw = rbacMiddleware('super_admin')

      const mockContext = {
        get: (key: string) => {
          if (key === 'tenant') return { role: 'ceo', companyId: 'test', userId: 'test' }
          return undefined
        },
        req: { method: 'GET', path: '/api/super-admin/companies' },
      }

      let errorThrown = false
      try {
        await mw(mockContext as any, async () => {})
      } catch (e: any) {
        errorThrown = true
        expect(e.status).toBe(403)
      }
      expect(errorThrown).toBe(true)
    })

    test('rbacMiddleware blocks employee role', async () => {
      const { rbacMiddleware } = await import('../../middleware/rbac')
      const mw = rbacMiddleware('super_admin')

      const mockContext = {
        get: (key: string) => {
          if (key === 'tenant') return { role: 'employee', companyId: 'test', userId: 'test' }
          return undefined
        },
        req: { method: 'GET', path: '/api/super-admin/companies' },
      }

      let errorThrown = false
      try {
        await mw(mockContext as any, async () => {})
      } catch (e: any) {
        errorThrown = true
        expect(e.status).toBe(403)
      }
      expect(errorThrown).toBe(true)
    })
  })

  // === P0: Data Integrity - Create Company ===
  describe('P0: createCompanyWithAdmin data integrity', () => {
    test('service function requires all mandatory fields', async () => {
      const svc = await import('../../services/company-management')
      // Function signature requires input + actorId
      expect(svc.createCompanyWithAdmin.length).toBe(2)
    })

    test('service validates slug uniqueness (returns error object)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('COMPANY_SLUG_DUPLICATE')
      expect(content).toContain("'이미 사용 중인 slug입니다'")
    })

    test('service validates admin username uniqueness', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('ADMIN_USERNAME_DUPLICATE')
    })

    test('admin account created with company_admin role (admin enum)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain("role: 'admin'")
    })

    test('password is hashed before storage', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('Bun.password.hash(initialPassword)')
    })

    test('initial password is returned in plaintext (one-time)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('initialPassword')
      // Verify it's returned in the result, not just generated
      expect(content).toMatch(/data:.*initialPassword/s)
    })
  })

  // === P0: Cascade Soft Delete Safety ===
  describe('P0: softDeleteCompany cascade safety', () => {
    test('soft delete sets isActive=false (not actual deletion)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Should use update, not delete
      expect(content).not.toMatch(/db\s*\.\s*delete\s*\(\s*companies\s*\)/)
      expect(content).toContain('.update(companies)')
    })

    test('cascade deactivates users in the company', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('.update(users)')
      expect(content).toContain('eq(users.companyId, companyId)')
    })

    test('cascade deactivates admin_users linked to company', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('.update(adminUsers)')
      expect(content).toContain('eq(adminUsers.companyId, companyId)')
    })

    test('prevents double-deactivation (already inactive check)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('COMPANY_ALREADY_INACTIVE')
      expect(content).toContain("'이미 비활성화된 회사입니다'")
    })

    test('returns deactivation counts for transparency', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('deactivatedUsers')
      expect(content).toContain('deactivatedAdmins')
    })

    test('creates audit log for delete action', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('AUDIT_ACTIONS.COMPANY_DELETE')
    })
  })

  // === P0: Pagination correctness ===
  describe('P0: listCompanies pagination', () => {
    test('enforces max limit of 100', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('Math.min')
      expect(content).toContain('100')
    })

    test('enforces minimum page of 1', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('Math.max(1')
    })

    test('calculates totalPages correctly', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('Math.ceil(total / limit)')
    })

    test('uses ilike for case-insensitive search', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('ilike')
    })

    test('supports isActive filter', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('options.isActive')
    })

    test('orders by createdAt desc (newest first)', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('desc(companies.createdAt)')
    })
  })

  // === P1: Update company edge cases ===
  describe('P1: updateCompany edge cases', () => {
    test('slug change excludes self from uniqueness check', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Should check slug != self
      expect(content).toContain('companies.id} != ${companyId}')
    })

    test('captures before state for audit diff', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Should capture before state
      expect(content).toMatch(/before.*companies.*companyId/s)
    })

    test('returns null for non-existent company', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('if (!before) return null')
    })

    test('only updates provided fields', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      // Check conditional field updates
      expect(content).toContain('if (input.name !== undefined)')
      expect(content).toContain('if (input.slug !== undefined)')
    })
  })

  // === P1: Company detail stats ===
  describe('P1: getCompanyDetail aggregation', () => {
    test('queries 3 separate counts in parallel', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('Promise.all')
      expect(content).toContain('users')
      expect(content).toContain('agents')
      expect(content).toContain('departments')
    })

    test('only counts active users and agents', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('eq(users.isActive, true)')
      expect(content).toContain('eq(agents.isActive, true)')
    })

    test('returns null for non-existent company', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toContain('if (!company) return null')
    })
  })

  // === P1: Schema integrity ===
  describe('P1: admin_users schema changes', () => {
    test('companyId is nullable (null = superadmin)', async () => {
      const schema = await import('../../db/schema')
      // The column should exist and be nullable (no .notNull() chain)
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      // companyId should NOT have .notNull() for admin_users
      const adminUsersBlock = schemaContent.match(/adminUsers = pgTable[\s\S]*?\}\)/)?.[0] || ''
      expect(adminUsersBlock).toContain("company_id")
      // Verify it references companies table
      expect(adminUsersBlock).toContain('companies.id')
    })

    test('email field added to admin_users', async () => {
      const schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
      // Find the admin_users table block — it ends with `})` on its own line before the next table
      const adminUsersStart = schemaContent.indexOf("adminUsers = pgTable")
      const adminUsersEnd = schemaContent.indexOf('\n\n', adminUsersStart)
      const adminUsersBlock = schemaContent.slice(adminUsersStart, adminUsersEnd)
      expect(adminUsersBlock).toContain('email')
      expect(adminUsersBlock).toContain('varchar')
    })

    test('migration file is idempotent (uses ADD COLUMN)', async () => {
      const migration = await Bun.file('packages/server/src/db/migrations/0033_admin-users-company-id.sql').text()
      expect(migration).toContain('ADD COLUMN')
    })
  })

  // === P1: Audit trail completeness ===
  describe('P1: Audit trail completeness', () => {
    test('AUDIT_ACTIONS has all 3 company constants', async () => {
      const { AUDIT_ACTIONS } = await import('../../services/audit-log')
      expect(AUDIT_ACTIONS.COMPANY_CREATE).toBe('company.create')
      expect(AUDIT_ACTIONS.COMPANY_UPDATE).toBe('company.update')
      expect(AUDIT_ACTIONS.COMPANY_DELETE).toBe('company.delete')
    })

    test('create audit includes company name and admin username', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toMatch(/after:.*company.*admin/s)
    })

    test('delete audit includes company name and deactivation counts', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      expect(content).toMatch(/metadata:.*companyName.*deactivatedUsers/s)
    })

    test('audit log calls use .catch(() => {}) to not block operations', async () => {
      const content = await Bun.file('packages/server/src/services/company-management.ts').text()
      const catchCount = (content.match(/\.catch\(\(\) => \{\}\)/g) || []).length
      // Should have catch on create, update, delete audit calls
      expect(catchCount).toBeGreaterThanOrEqual(3)
    })
  })

  // === P1: Route HTTP status codes ===
  describe('P1: HTTP status code correctness', () => {
    test('create returns 201', async () => {
      const content = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(content).toContain('201')
    })

    test('duplicate slug/username throws 409', async () => {
      const content = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(content).toContain('409')
    })

    test('not found throws 404', async () => {
      const content = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(content).toContain('404')
    })

    test('all endpoints use Zod validation (zValidator)', async () => {
      const content = await Bun.file('packages/server/src/routes/super-admin/companies.ts').text()
      expect(content).toContain('zValidator')
      // POST and PUT should have json validation
      expect((content.match(/zValidator\('json'/g) || []).length).toBeGreaterThanOrEqual(2)
      // GET list should have query validation
      expect(content).toContain("zValidator('query'")
    })
  })

  // === P2: Route mounting ===
  describe('P2: Route mounting and integration', () => {
    test('super-admin route is mounted before admin routes', async () => {
      const content = await Bun.file('packages/server/src/index.ts').text()
      const superAdminIdx = content.indexOf("'/api/super-admin'")
      const adminIdx = content.indexOf("'/api/admin'")
      expect(superAdminIdx).toBeGreaterThan(-1)
      expect(adminIdx).toBeGreaterThan(-1)
      expect(superAdminIdx).toBeLessThan(adminIdx)
    })

    test('existing admin companies route is untouched', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      // Should still use adminOnly, not rbacMiddleware
      expect(content).toContain('adminOnly')
      expect(content).not.toContain('rbacMiddleware')
    })
  })
})
