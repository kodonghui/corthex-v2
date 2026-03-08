import { describe, expect, test } from 'bun:test'
import { z } from 'zod'

describe('Company Settings UI (Epic 9 Story 5)', () => {
  // === Task 1: Company Settings API ===
  describe('Task 1: Company PATCH settings support', () => {
    test('companiesRoute is exported from admin companies route', async () => {
      const mod = await import('../../routes/admin/companies')
      expect(mod.companiesRoute).toBeDefined()
      expect(typeof mod.companiesRoute.fetch).toBe('function')
    })

    test('companies route has PATCH endpoint', async () => {
      const routeFile = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(routeFile).toContain("companiesRoute.patch('/companies/:id'")
    })

    test('PATCH schema accepts settings field', async () => {
      const routeFile = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(routeFile).toContain('settings:')
      expect(routeFile).toContain('z.record(z.unknown()).optional()')
    })

    test('settings field in schema validates as optional record', () => {
      const updateSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        isActive: z.boolean().optional(),
        settings: z.record(z.unknown()).optional(),
      })

      // Valid with settings
      const withSettings = updateSchema.parse({ settings: { timezone: 'Asia/Seoul', defaultModel: 'claude-sonnet-4' } })
      expect(withSettings.settings).toEqual({ timezone: 'Asia/Seoul', defaultModel: 'claude-sonnet-4' })

      // Valid without settings
      const withoutSettings = updateSchema.parse({ name: 'New Name' })
      expect(withoutSettings.settings).toBeUndefined()

      // Valid with empty settings
      const emptySettings = updateSchema.parse({ settings: {} })
      expect(emptySettings.settings).toEqual({})

      // Valid with nested values
      const nested = updateSchema.parse({
        settings: {
          dashboardQuickActions: [{ label: 'Test', command: '/test' }],
          timezone: 'UTC',
        },
      })
      expect(nested.settings?.dashboardQuickActions).toBeDefined()
    })

    test('settings field allows various value types', () => {
      const schema = z.record(z.unknown())
      const result = schema.parse({
        stringVal: 'hello',
        numVal: 42,
        boolVal: true,
        arrayVal: [1, 2, 3],
        nestedObj: { a: 1 },
        nullVal: null,
      })
      expect(result.stringVal).toBe('hello')
      expect(result.numVal).toBe(42)
      expect(result.boolVal).toBe(true)
      expect(result.nullVal).toBeNull()
    })
  })

  // === Task 2: Settings Page ===
  describe('Task 2: Settings page file structure', () => {
    test('settings.tsx exists in admin pages', async () => {
      const file = Bun.file('packages/admin/src/pages/settings.tsx')
      expect(await file.exists()).toBe(true)
    })

    test('settings page exports SettingsPage component', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('export function SettingsPage()')
    })

    test('settings page uses useAdminStore for company selection', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('useAdminStore')
      expect(content).toContain('selectedCompanyId')
    })

    test('settings page uses useToastStore for notifications', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('useToastStore')
      expect(content).toContain('addToast')
    })

    test('settings page has company info section', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('CompanyInfoSection')
      expect(content).toContain('회사 기본 정보')
    })

    test('settings page has API key management section', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('ApiKeySection')
      expect(content).toContain('API 키 관리')
    })

    test('settings page has default settings section', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('DefaultSettingsSection')
      expect(content).toContain('기본 설정')
    })

    test('settings page fetches company detail', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('/admin/companies/')
      expect(content).toContain("queryKey: ['company-detail'")
    })

    test('settings page has save/cancel functionality', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('dirty')
      expect(content).toContain('취소')
      expect(content).toContain('저장')
    })

    test('settings page shows empty state when no company selected', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('회사를 선택하세요')
    })

    test('settings page handles loading state', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('isLoading')
      expect(content).toContain('Skeleton')
    })
  })

  // === Task 2 (AC2): Company Info Section ===
  describe('Task 2: Company Info Section details', () => {
    test('displays company name as editable input', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('회사명')
      expect(content).toContain('setName')
    })

    test('displays slug as read-only', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('Slug')
      expect(content).toContain('disabled')
    })

    test('displays creation date', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('생성일')
      expect(content).toContain('formatDate')
    })

    test('displays active status badge', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('상태')
      expect(content).toContain('활성')
      expect(content).toContain('비활성')
    })

    test('tracks dirty state for name changes', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('setDirty(v !== company.name)')
    })

    test('resets to original on cancel', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('setName(company.name)')
      expect(content).toContain('setDirty(false)')
    })

    test('calls PATCH on save', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('api.patch')
      expect(content).toContain('/admin/companies/')
    })
  })

  // === Task 3: API Key Management ===
  describe('Task 3: API Key Management UI', () => {
    test('fetches API keys for company', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("'/admin/api-keys'")
      expect(content).toContain("queryKey: ['company-api-keys'")
    })

    test('fetches provider schemas', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("'/admin/api-keys/providers'")
      expect(content).toContain("queryKey: ['api-key-providers'")
    })

    test('shows provider badges for each key', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('k.provider')
      expect(content).toContain('PROVIDER_LABELS')
    })

    test('has add API key form with provider selection', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('showAdd')
      expect(content).toContain('handleProviderChange')
      expect(content).toContain('서비스 제공자')
    })

    test('dynamically renders required fields based on provider', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('selectedProviderFields')
      expect(content).toContain('필수 필드')
      expect(content).toContain('type="password"')
    })

    test('supports API key deletion with confirm dialog', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('deleteTarget')
      expect(content).toContain('ConfirmDialog')
      expect(content).toContain('API 키 삭제')
      expect(content).toContain("variant=\"danger\"")
    })

    test('supports API key rotation', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('rotateTarget')
      expect(content).toContain('rotateMutation')
      expect(content).toContain('키 갱신')
      expect(content).toContain('api.put')
    })

    test('sends scope as company for company-level keys', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("scope: 'company'")
    })

    test('shows encryption note', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('AES-256-GCM')
    })

    test('shows scope badge for each key', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('회사 공용')
      expect(content).toContain('개인용')
    })

    test('shows empty state when no keys', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('등록된 API 키가 없습니다')
    })

    test('has loading skeleton', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('keysLoading')
    })
  })

  // === Task 4: Routing and Navigation ===
  describe('Task 4: Routing and Navigation', () => {
    test('App.tsx has /settings route', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      expect(content).toContain('path="settings"')
      expect(content).toContain('SettingsPage')
    })

    test('App.tsx lazy loads SettingsPage', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      expect(content).toContain("import('./pages/settings')")
    })

    test('sidebar has settings link at bottom', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(content).toContain('/settings')
      expect(content).toContain('회사 설정')
    })

    test('settings link is in the bottom section (after nav, before user info)', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      const navEnd = content.indexOf('</nav>')
      const settingsLink = content.indexOf("to=\"/settings\"")
      expect(settingsLink).toBeGreaterThan(navEnd)
    })

    test('settings link uses same NavLink styling as other nav items', async () => {
      const content = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      // Settings link uses NavLink with isActive styling
      const settingsSection = content.substring(content.indexOf("to=\"/settings\"") - 100)
      expect(settingsSection).toContain('NavLink')
      expect(settingsSection).toContain('isActive')
    })
  })

  // === Task 5: Tenant Isolation ===
  describe('Task 5: Tenant Isolation', () => {
    test('company detail query depends on selectedCompanyId', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('enabled: !!selectedCompanyId')
    })

    test('company query key includes selectedCompanyId for refetch on change', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("queryKey: ['company-detail', selectedCompanyId]")
    })

    test('API key query depends on companyId prop', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("queryKey: ['company-api-keys', companyId]")
    })

    test('shows empty state when no company is selected', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('!selectedCompanyId')
      expect(content).toContain('회사를 선택하세요')
    })

    test('update mutation uses selectedCompanyId', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('`/admin/companies/${selectedCompanyId}`')
    })

    test('invalidates company queries on save', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("invalidateQueries({ queryKey: ['company-detail'")
      expect(content).toContain("invalidateQueries({ queryKey: ['companies']")
    })
  })

  // === Acceptance Criteria Verification ===
  describe('Acceptance Criteria Cross-Check', () => {
    test('AC1: /admin/settings route exists with sidebar navigation', async () => {
      const appContent = await Bun.file('packages/admin/src/App.tsx').text()
      const sidebarContent = await Bun.file('packages/admin/src/components/sidebar.tsx').text()
      expect(appContent).toContain('path="settings"')
      expect(sidebarContent).toContain('/settings')
      expect(sidebarContent).toContain('회사 설정')
    })

    test('AC2: Company info section with name editing', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('회사 기본 정보')
      expect(content).toContain('회사명')
      expect(content).toContain('setName')
      expect(content).toContain('Slug')
      expect(content).toContain('생성일')
      expect(content).toContain('상태')
    })

    test('AC3: API key management with add/delete/rotate', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('API 키 관리')
      expect(content).toContain('addMutation')
      expect(content).toContain('deleteMutation')
      expect(content).toContain('rotateMutation')
      expect(content).toContain('PROVIDER_LABELS')
    })

    test('AC4: Default settings section', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('기본 설정')
      expect(content).toContain('타임존')
      expect(content).toContain('기본 LLM 모델')
    })

    test('AC5: Save/Cancel with dirty state tracking', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      // Verify dirty state is tracked
      expect(content).toContain('dirty')
      expect(content).toContain('setDirty')
      // Verify save button only shown when dirty
      expect(content).toContain('{dirty && (')
      // Verify cancel resets
      expect(content).toContain('handleCancel')
    })

    test('AC6: Tenant isolation via selectedCompanyId', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('selectedCompanyId')
      expect(content).toContain('enabled: !!selectedCompanyId')
      expect(content).toContain("queryKey: ['company-detail', selectedCompanyId]")
    })
  })

  // === UI Component Integration ===
  describe('UI Component Integration', () => {
    test('uses @corthex/ui components', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("from '@corthex/ui'")
      expect(content).toContain('Skeleton')
      expect(content).toContain('ConfirmDialog')
    })

    test('uses TanStack Query for data fetching', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('useQuery')
      expect(content).toContain('useMutation')
      expect(content).toContain('useQueryClient')
    })

    test('uses api client from lib/api', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("from '../lib/api'")
      expect(content).toContain('api.get')
      expect(content).toContain('api.patch')
      expect(content).toContain('api.post')
      expect(content).toContain('api.put')
      expect(content).toContain('api.delete')
    })

    test('shows success toast on save', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("type: 'success'")
      expect(content).toContain('설정이 저장되었습니다')
    })

    test('shows error toast on failure', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain("type: 'error'")
      expect(content).toContain('onError')
    })
  })

  // === Default Settings ===
  describe('Default Settings Section', () => {
    test('has timezone selector', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('타임존')
      expect(content).toContain('Asia/Seoul')
      expect(content).toContain('America/New_York')
      expect(content).toContain('UTC')
    })

    test('has default model selector', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('기본 LLM 모델')
      expect(content).toContain('claude-sonnet-4')
      expect(content).toContain('gpt-4o')
      expect(content).toContain('gemini-2.0-flash')
    })

    test('preserves existing settings on save', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('...currentSettings')
    })

    test('resets to company values on cancel', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('handleCancel')
      expect(content).toContain("setTimezone((s.timezone as string) || 'Asia/Seoul')")
    })

    test('syncs with company data on company change', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      // useEffect resets state when company changes
      expect(content).toContain('useEffect(() => {')
      expect(content).toContain('[company]')
    })
  })

  // === Provider Labels ===
  describe('Provider Labels', () => {
    test('has labels for all common providers', async () => {
      const content = await Bun.file('packages/admin/src/pages/settings.tsx').text()
      expect(content).toContain('PROVIDER_LABELS')
      expect(content).toContain("anthropic: 'Anthropic (Claude)'")
      expect(content).toContain("openai: 'OpenAI (GPT)'")
      expect(content).toContain("google_ai: 'Google AI (Gemini)'")
      expect(content).toContain("kis: 'KIS (한국투자증권)'")
      expect(content).toContain("telegram: 'Telegram'")
    })
  })
})
