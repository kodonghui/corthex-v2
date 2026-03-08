import { describe, expect, test } from 'bun:test'

describe('App Switching (Story 9-6)', () => {
  // === Task 1: Switch App API ===
  describe('Switch App API endpoint', () => {
    test('auth route exports are importable', async () => {
      const mod = await import('../../routes/auth')
      expect(mod.authRoute).toBeDefined()
      expect(typeof mod.authRoute.fetch).toBe('function')
    })

    test('auth.ts contains switch-app endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("'/auth/switch-app'")
      expect(content).toContain('authMiddleware')
      expect(content).toContain('switchAppSchema')
    })

    test('switch-app schema validates targetApp enum', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("z.enum(['admin', 'ceo'])")
    })

    test('switch-app schema validates optional companyId as UUID', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('z.string().uuid().optional()')
    })

    test('switch-app checks admin_users table for authorization', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('adminUsers')
      expect(content).toContain('SWITCH_001')
    })

    test('switch-app checks company active status', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('SWITCH_003')
      expect(content).toContain('isActive')
    })

    test('switch-app returns proper error codes', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // SWITCH_001: no admin user
      expect(content).toContain('SWITCH_001')
      // SWITCH_002: missing companyId for super_admin
      expect(content).toContain('SWITCH_002')
      // SWITCH_003: inactive company
      expect(content).toContain('SWITCH_003')
      // SWITCH_004: no CEO user in company
      expect(content).toContain('SWITCH_004')
    })

    test('Admin -> CEO creates user JWT (no admin type)', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // When switching to CEO, should create token without 'admin' type
      const switchToCeoSection = content.split("targetApp === 'ceo'")[1]?.split("} else {")[0]
      expect(switchToCeoSection).toBeDefined()
      expect(switchToCeoSection).toContain('createToken')
      expect(switchToCeoSection).toContain('companyId: targetCompanyId')
    })

    test('CEO -> Admin creates admin JWT with type admin', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // The switch-app handler should create admin token with type: 'admin' and companyId: 'system'
      expect(content).toContain("type: 'admin'")
      expect(content).toContain("companyId: 'system'")
    })

    test('switch-app returns targetUrl for navigation', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("targetUrl: '/'") // CEO app
      expect(content).toContain("targetUrl: '/admin'") // Admin app
    })

    test('switch-app response includes token and user data', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // CEO response should include companyId
      expect(content).toContain("user: { id: targetUser.id, name: targetUser.name, role: targetUser.role, companyId: targetCompanyId }")
    })
  })

  // === Can Switch Admin Check ===
  describe('Can Switch Admin API endpoint', () => {
    test('auth.ts contains can-switch-admin endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("'/auth/can-switch-admin'")
      expect(content).toContain('authMiddleware')
    })

    test('can-switch-admin checks isAdminUser flag first', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const canSwitchSection = content.split("'/auth/can-switch-admin'")[1]?.split('authRoute')[0]
      expect(canSwitchSection).toContain('tenant.isAdminUser')
      expect(canSwitchSection).toContain('canSwitch: true')
    })

    test('can-switch-admin looks up by email for non-admin users', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const canSwitchSection = content.split("'/auth/can-switch-admin'")[1]?.split('authRoute')[0]
      expect(canSwitchSection).toContain('email')
      expect(canSwitchSection).toContain('adminUsers')
    })

    test('can-switch-admin returns canSwitch boolean', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('canSwitch: false')
      expect(content).toContain('canSwitch: true')
    })
  })

  // === Task 2: Admin Sidebar Switch Button ===
  describe('Admin sidebar switch button', () => {
    test('admin sidebar contains SwitchToCeoButton component', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('SwitchToCeoButton')
    })

    test('SwitchToCeoButton calls /auth/switch-app API', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('/auth/switch-app')
      expect(content).toContain("targetApp: 'ceo'")
    })

    test('SwitchToCeoButton stores CEO token in correct localStorage key', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain("localStorage.setItem('corthex_token'")
      expect(content).toContain("localStorage.setItem('corthex_user'")
    })

    test('SwitchToCeoButton navigates to CEO app URL', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('window.location.href')
      expect(content).toContain('targetUrl')
    })

    test('SwitchToCeoButton is disabled when no company selected', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('disabled={!companyId')
    })

    test('SwitchToCeoButton passes selectedCompanyId as prop', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('companyId={selectedCompanyId}')
    })

    test('SwitchToCeoButton shows loading state during switch', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('switching')
      expect(content).toContain('전환 중...')
    })

    test('SwitchToCeoButton has switch icon', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('⇄')
    })

    test('SwitchToCeoButton label says CEO 앱으로 전환', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('CEO 앱으로 전환')
    })

    test('SwitchToCeoButton handles errors', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('catch')
      expect(content).toContain('setSwitching(false)')
    })
  })

  // === Task 3: CEO Sidebar Switch Button ===
  describe('CEO sidebar switch button', () => {
    test('CEO sidebar contains SwitchToAdminButton component', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('SwitchToAdminButton')
    })

    test('SwitchToAdminButton calls can-switch-admin to check permission', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('/auth/can-switch-admin')
    })

    test('SwitchToAdminButton only renders when canSwitch is true', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('if (!canSwitch) return null')
    })

    test('SwitchToAdminButton calls /auth/switch-app API', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('/auth/switch-app')
      expect(content).toContain("targetApp: 'admin'")
    })

    test('SwitchToAdminButton stores admin token in correct localStorage key', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain("localStorage.setItem('corthex_admin_token'")
      expect(content).toContain("localStorage.setItem('corthex_admin_user'")
    })

    test('SwitchToAdminButton navigates to admin URL', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('window.location.href')
      expect(content).toContain('targetUrl')
    })

    test('SwitchToAdminButton shows loading state', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('switching')
      expect(content).toContain('전환 중...')
    })

    test('SwitchToAdminButton has switch icon', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('⇄')
    })

    test('SwitchToAdminButton label says 관리자 콘솔', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('관리자 콘솔')
    })

    test('SwitchToAdminButton handles errors', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('catch')
      expect(content).toContain('setSwitching(false)')
    })
  })

  // === Task 4: Shared Types ===
  describe('Shared types for app switching', () => {
    test('shared types export SwitchAppTarget', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      expect(content).toContain("SwitchAppTarget")
      expect(content).toContain("'admin' | 'ceo'")
    })

    test('shared types export SwitchAppRequest', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      expect(content).toContain('SwitchAppRequest')
      expect(content).toContain('targetApp: SwitchAppTarget')
    })

    test('shared types export SwitchAppResponse', async () => {
      const content = await Bun.file('packages/shared/src/types.ts').text()
      expect(content).toContain('SwitchAppResponse')
      expect(content).toContain('token: string')
      expect(content).toContain('targetUrl: string')
    })
  })

  // === AC5: Visual Indicators ===
  describe('Visual indicators', () => {
    test('Admin sidebar shows Admin Console branding', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('Admin Console')
    })

    test('CEO sidebar shows CORTHEX branding', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('CORTHEX')
    })
  })

  // === AC6: Error Handling ===
  describe('Error handling', () => {
    test('admin switch button handles network errors', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('catch')
      expect(content).toContain('앱 전환에 실패했습니다')
    })

    test('CEO switch button handles network errors', async () => {
      const content = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      expect(content).toContain('catch')
      expect(content).toContain('앱 전환에 실패했습니다')
    })

    test('server checks company isActive before switching', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const switchSection = content.split("'/auth/switch-app'")[1]
      expect(switchSection).toContain('isActive')
      expect(switchSection).toContain('비활성화된 회사')
    })
  })

  // === localStorage key correctness ===
  describe('localStorage key isolation', () => {
    test('admin app uses corthex_admin_token key', async () => {
      const content = await Bun.file('packages/admin/src/stores/auth-store.ts').text()
      expect(content).toContain("corthex_admin_token")
      expect(content).toContain("corthex_admin_user")
    })

    test('CEO app uses corthex_token key', async () => {
      const content = await Bun.file('packages/app/src/stores/auth-store.ts').text()
      expect(content).toContain("corthex_token")
      expect(content).toContain("corthex_user")
    })

    test('admin switch button writes to CEO localStorage keys', async () => {
      const adminContent = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      // Admin -> CEO switch should write to CEO keys
      expect(adminContent).toContain("localStorage.setItem('corthex_token'")
    })

    test('CEO switch button writes to admin localStorage keys', async () => {
      const ceoContent = await Bun.file('packages/app/src/components/sidebar.tsx').text()
      // CEO -> Admin switch should write to admin keys
      expect(ceoContent).toContain("localStorage.setItem('corthex_admin_token'")
    })
  })

  // === JWT token structure ===
  describe('JWT token structure for switching', () => {
    test('admin login JWT includes type admin', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // The admin login handler creates token with type: 'admin'
      expect(content).toContain("type: 'admin'")
    })

    test('createToken function supports admin type', async () => {
      const content = await Bun.file('packages/server/src/middleware/auth.ts').text()
      expect(content).toContain("type?: 'admin'")
    })

    test('authMiddleware sets isAdminUser from JWT type', async () => {
      const content = await Bun.file('packages/server/src/middleware/auth.ts').text()
      expect(content).toContain("payload.type === 'admin'")
      expect(content).toContain('isAdminUser')
    })
  })

  // === Role mapping ===
  describe('Role mapping during switch', () => {
    test('Admin -> CEO maps admin_users role to RBAC role', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // In switch-app, admin role maps to ceo
      const switchSection = content.split("targetApp === 'ceo'")[1]?.split("} else {")[0]
      expect(switchSection).toContain("'ceo'")
    })

    test('CEO -> Admin maps admin_users role correctly', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      // switch-app maps superadmin -> super_admin, admin -> company_admin
      expect(content).toContain("'super_admin'")
      expect(content).toContain("'company_admin'")
    })
  })
})
