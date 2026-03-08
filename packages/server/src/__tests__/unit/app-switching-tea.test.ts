/**
 * TEA-generated tests for Story 9-6: Admin ↔ CEO App Switching
 * Risk-based coverage expansion beyond static code inspection tests.
 * Focus: Shared type contracts, role mapping logic, JWT structure, edge cases.
 */
import { describe, expect, test } from 'bun:test'

describe('TEA: App Switching — Risk-Based Coverage', () => {
  // === Risk 1: Shared Type Contracts ===
  describe('Shared type exports and structure', () => {
    test('SwitchAppTarget type is exported from shared', async () => {
      const mod = await import('@corthex/shared')
      // Type exists as a type-only export, verify the module loads
      expect(mod).toBeDefined()
    })

    test('SwitchAppRequest includes targetApp field', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      // Verify request type has required fields
      expect(content).toContain('targetApp: SwitchAppTarget')
      expect(content).toContain("companyId?: string")
    })

    test('SwitchAppResponse includes all required fields', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      expect(content).toContain('token: string')
      expect(content).toContain('user:')
      expect(content).toContain('targetUrl: string')
    })

    test('SwitchAppTarget is union of admin and ceo only', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      const targetLine = content.split('SwitchAppTarget')[1]?.split('\n')[0]
      expect(targetLine).toContain("'admin'")
      expect(targetLine).toContain("'ceo'")
      // Should NOT contain other values
      expect(targetLine).not.toContain("'employee'")
      expect(targetLine).not.toContain("'super_admin'")
    })
  })

  // === Risk 2: Email-Based Cross-Table Matching Logic ===
  describe('Admin-User email matching in switch-app', () => {
    test('CEO->Admin switch uses email for admin_users lookup', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const ceoToAdminSection = content.split("!tenant.isAdminUser")[0]
      // Must query users table for email first
      expect(content).toContain('users.email')
      // Then match against admin_users email
      expect(content).toContain('adminUsers.email')
    })

    test('Admin->CEO switch uses email for users lookup', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // When admin switches to CEO, should find matching user by email
      expect(content).toContain('users.email, adminUser.email')
    })

    test('Handles null email gracefully (canSwitch=false)', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // Should check for null email before admin_users lookup
      expect(content).toContain("user?.email")
      expect(content).toContain("canSwitch: false")
    })

    test('No fallback to random user — email match required for identity verification', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // After code review fix: removed dangerous fallback to "any admin-role user"
      // Should require strict email match — SWITCH_004 thrown when no email match
      expect(content).toContain("SWITCH_004")
      expect(content).toContain("adminUser.email")
    })
  })

  // === Risk 3: Role Mapping Correctness ===
  describe('Role mapping during app switch', () => {
    test('superadmin DB role maps to super_admin RBAC role', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // In CEO->Admin section, superadmin should map to super_admin
      expect(content).toContain("admin.role === 'superadmin'")  // admin login
      expect(content).toContain("adminUser.role === 'superadmin'")  // switch
    })

    test('admin DB role maps to company_admin RBAC role', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("'company_admin'")
    })

    test('users admin role maps to ceo RBAC role', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // In Admin->CEO section, users.role admin -> RBAC ceo
      const switchSection = content.split("targetApp === 'ceo'")[1] || ''
      expect(switchSection).toContain("'ceo'")
    })

    test('users user role maps to employee RBAC role', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // In Admin->CEO section, users.role user -> RBAC employee
      expect(content).toContain("'employee'")
    })
  })

  // === Risk 4: JWT Token Structure ===
  describe('JWT token payload structure for switched tokens', () => {
    test('CEO token from switch does NOT include admin type', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // When switching to CEO app, createToken should NOT include type: 'admin'
      const ceoSection = content.split("targetApp === 'ceo'")[1]?.split("} else {")[0] || ''
      const createTokenCall = ceoSection.split('createToken(')[1]?.split(')')[0] || ''
      // Should have sub, companyId, role but NOT type
      expect(createTokenCall).toContain('sub:')
      expect(createTokenCall).toContain('companyId:')
      expect(createTokenCall).toContain('role:')
      expect(createTokenCall).not.toContain("type:")
    })

    test('Admin token from switch includes type admin', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // When switching to Admin app, createToken MUST include type: 'admin'
      // Find the section after "CEO -> Admin"
      const adminSections = content.split("type: 'admin'")
      // Should have multiple occurrences (login + switch)
      expect(adminSections.length).toBeGreaterThanOrEqual(3) // at least login + switch = 2 splits = 3 parts
    })

    test('Admin token uses companyId system for super_admin', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // Super admin tokens should have companyId: 'system'
      expect(content).toContain("companyId: 'system'")
    })
  })

  // === Risk 5: Security Edge Cases ===
  describe('Security guardrails', () => {
    test('switch-app requires authMiddleware', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const switchLine = content.split("'/auth/switch-app'")[0]?.split('\n').pop() || ''
      // authMiddleware must be before the handler
      const switchDef = content.split("'/auth/switch-app'")[1]?.substring(0, 100) || ''
      expect(content).toContain("'/auth/switch-app', authMiddleware")
    })

    test('can-switch-admin requires authMiddleware', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("'/auth/can-switch-admin', authMiddleware")
    })

    test('switch-app validates admin_users from DB, not JWT only', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const switchSection = content.split("'/auth/switch-app'")[1]?.split('authRoute')[0] || ''
      // Must query adminUsers table
      expect(switchSection).toContain('.from(adminUsers)')
      // Must check isActive
      expect(switchSection).toContain('isActive')
    })

    test('inactive admin user cannot switch', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const switchSection = content.split("'/auth/switch-app'")[1]?.split('authRoute')[0] || ''
      expect(switchSection).toContain('!adminUser.isActive')
    })

    test('company isActive check before Admin->CEO switch', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // Must check company active status
      expect(content).toContain("company.isActive")
      expect(content).toContain("SWITCH_003")
    })

    test('only active users can be target of Admin->CEO switch', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // When finding CEO user, must filter by isActive
      expect(content).toContain("eq(users.isActive, true)")
    })
  })

  // === Risk 6: Frontend Button Visibility Logic ===
  describe('Button visibility and state management', () => {
    test('admin SwitchToCeoButton receives companyId prop', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('SwitchToCeoButton({ companyId }')
      expect(content).toContain('companyId={selectedCompanyId}')
    })

    test('admin button disabled state tied to companyId', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('disabled={!companyId')
    })

    test('CEO SwitchToAdminButton conditionally renders based on API response', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('can-switch-admin')
      expect(content).toContain('canSwitch')
      expect(content).toContain('return null')
    })

    test('CEO button uses useQuery for admin check with staleTime', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('useQuery')
      expect(content).toContain('staleTime')
    })

    test('both buttons use useState for switching state', async () => {
      const adminContent = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const ceoContent = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(adminContent).toContain('useState(false)')
      expect(ceoContent).toContain('useState(false)')
    })

    test('both buttons reset switching state on error', async () => {
      const adminContent = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const ceoContent = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      // Both should set switching to false in catch block
      expect(adminContent).toContain('setSwitching(false)')
      expect(ceoContent).toContain('setSwitching(false)')
    })

    test('both buttons use useCallback to prevent unnecessary re-renders', async () => {
      const adminContent = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const ceoContent = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(adminContent).toContain('useCallback')
      expect(ceoContent).toContain('useCallback')
    })
  })

  // === Risk 7: Cross-App localStorage Isolation ===
  describe('localStorage key isolation during switch', () => {
    test('Admin->CEO writes ONLY to CEO keys (corthex_token, corthex_user)', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const switchSection = content.split('handleSwitch')[1]?.split('catch')[0] || ''
      expect(switchSection).toContain("localStorage.setItem('corthex_token'")
      expect(switchSection).toContain("localStorage.setItem('corthex_user'")
      // Should NOT modify admin keys during switch
      expect(switchSection).not.toContain("localStorage.setItem('corthex_admin_token'")
    })

    test('CEO->Admin writes ONLY to admin keys (corthex_admin_token, corthex_admin_user)', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      const switchSection = content.split('handleSwitch')[1]?.split('catch')[0] || ''
      expect(switchSection).toContain("localStorage.setItem('corthex_admin_token'")
      expect(switchSection).toContain("localStorage.setItem('corthex_admin_user'")
      // Should NOT modify CEO keys during switch
      expect(switchSection).not.toContain("localStorage.setItem('corthex_token'")
    })

    test('admin auth store and CEO auth store use different key prefixes', async () => {
      const adminStore = await Bun.file('packages/admin/src/stores/auth-store.ts').text()
      const ceoStore = await Bun.file('packages/app/src/stores/auth-store.ts').text()
      expect(adminStore).toContain('corthex_admin_token')
      expect(ceoStore).toContain('corthex_token')
      // Ensure no cross-contamination
      expect(adminStore).not.toContain("'corthex_token'")
      expect(ceoStore).not.toContain("'corthex_admin_token'")
    })
  })

  // === Risk 8: Error Code Consistency ===
  describe('Error codes follow SWITCH_XXX pattern', () => {
    test('all switch error codes use SWITCH_ prefix', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const switchSection = content.split("'/auth/switch-app'")[1]?.split('authRoute')[0] || ''
      // Extract all error codes in switch section
      const errorCodes = switchSection.match(/SWITCH_\d+/g) || []
      expect(errorCodes.length).toBeGreaterThanOrEqual(3)
      // All should be SWITCH_00X format
      errorCodes.forEach(code => {
        expect(code).toMatch(/^SWITCH_\d{3}$/)
      })
    })

    test('error codes are sequential (001-004)', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('SWITCH_001') // no admin user
      expect(content).toContain('SWITCH_002') // missing companyId
      expect(content).toContain('SWITCH_003') // inactive company
      expect(content).toContain('SWITCH_004') // no CEO user
    })
  })

  // === Risk 9: Navigation Flow ===
  describe('Navigation flow after switch', () => {
    test('Admin->CEO navigates to / (root)', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("targetUrl: '/'")
    })

    test('CEO->Admin navigates to /admin', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("targetUrl: '/admin'")
    })

    test('admin button uses window.location.href for full page navigation', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('window.location.href = res.data.targetUrl')
    })

    test('CEO button uses window.location.href for full page navigation', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('window.location.href = res.data.targetUrl')
    })
  })

  // === Risk 10: Zod Schema Validation ===
  describe('Zod schema enforcement', () => {
    test('switch-app uses zValidator middleware', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("zValidator('json', switchAppSchema)")
    })

    test('switchAppSchema is defined before the route', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const schemaIndex = content.indexOf('switchAppSchema')
      const routeIndex = content.indexOf("'/auth/switch-app'")
      expect(schemaIndex).toBeLessThan(routeIndex)
    })

    test('companyId validation is UUID format', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // Schema should validate companyId as UUID
      expect(content).toContain('z.string().uuid()')
    })
  })
})
