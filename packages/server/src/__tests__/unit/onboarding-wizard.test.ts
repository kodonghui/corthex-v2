import { describe, expect, test } from 'bun:test'

describe('Onboarding Wizard (Story 9-7)', () => {
  // === Task 1: Route & Entry Point ===
  describe('Task 1: Onboarding route and entry point', () => {
    test('onboarding page file exists', async () => {
      const file = Bun.file('packages/admin/src/pages/onboarding.tsx')
      expect(await file.exists()).toBe(true)
    })

    test('onboarding page exports OnboardingWizardPage component', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('export function OnboardingWizardPage()')
    })

    test('App.tsx registers /onboarding route', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      expect(content).toContain("path=\"onboarding\"")
      expect(content).toContain('OnboardingWizardPage')
    })

    test('App.tsx lazy imports onboarding page', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      expect(content).toContain("import('./pages/onboarding')")
    })

    test('Layout checks onboardingCompleted from company settings', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('onboardingCompleted')
    })

    test('Layout redirects to /onboarding when not completed', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain("navigate('/onboarding'")
    })

    test('Layout does not redirect when already on onboarding page', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('isOnboardingPage')
    })

    test('Layout fetches company detail using selectedCompanyId', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('company-detail')
      expect(content).toContain('selectedCompanyId')
    })
  })

  // === Task 2: Step 1 — Welcome ===
  describe('Task 2: Welcome step', () => {
    test('WelcomeStep component exists in onboarding page', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function WelcomeStep')
    })

    test('WelcomeStep shows welcome heading', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('CORTHEX에 오신 것을 환영합니다')
    })

    test('WelcomeStep displays company name', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // WelcomeStep receives company prop and displays name
      expect(content).toContain('company.name')
    })

    test('WelcomeStep has edit toggle for company name', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('setEditing(true)')
      expect(content).toContain('수정')
    })

    test('WelcomeStep calls PATCH company API for name edit', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("api.patch<{ data: Company }>(`/admin/companies/${company.id}`")
    })

    test('WelcomeStep shows company slug', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('company.slug')
    })
  })

  // === Task 3: Step 2 — Template Selection ===
  describe('Task 3: Template selection step', () => {
    test('TemplateStep component exists', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function TemplateStep')
    })

    test('TemplateStep fetches org templates', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('/admin/org-templates')
    })

    test('TemplateStep shows template cards', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('templates.map')
    })

    test('TemplateStep has blank org option', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('빈 조직으로 시작')
    })

    test('TemplateStep shows template preview with departments and agents', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('dept.agents.map')
      expect(content).toContain('TIER_LABELS')
    })

    test('TemplateStep calls apply API on template selection', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('/admin/org-templates/${templateId}/apply')
    })

    test('TemplateStep shows apply result (departments + agents created)', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('applyResult.departmentsCreated')
      expect(content).toContain('applyResult.agentsCreated')
    })

    test('TemplateStep invalidates related queries after apply', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("queryKey: ['org-chart']")
      expect(content).toContain("queryKey: ['departments']")
      expect(content).toContain("queryKey: ['agents']")
    })
  })

  // === Task 4: Step 3 — API Key Setup ===
  describe('Task 4: API key setup step', () => {
    test('ApiKeyStep component exists', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function ApiKeyStep')
    })

    test('ApiKeyStep shows OpenAI and Google AI providers', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("'openai'")
      expect(content).toContain("'google_ai'")
      expect(content).toContain('OpenAI (GPT)')
      expect(content).toContain('Google AI (Gemini)')
    })

    test('ApiKeyStep fetches provider schemas', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('/admin/api-keys/providers')
    })

    test('ApiKeyStep checks existing keys', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('existingProviders')
      expect(content).toContain('이미 등록된 키가 있습니다')
    })

    test('ApiKeyStep calls POST api-keys to save', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("api.post('/admin/api-keys'")
    })

    test('ApiKeyStep uses password type for key inputs', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('type="password"')
    })

    test('ApiKeyStep has skip option', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('나중에 설정하기')
    })
  })

  // === Task 5: Step 4 — Employee Invite ===
  describe('Task 5: Employee invite step', () => {
    test('InviteStep component exists', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function InviteStep')
    })

    test('InviteStep has username, name, email fields', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('form.username')
      expect(content).toContain('form.name')
      expect(content).toContain('form.email')
    })

    test('InviteStep calls POST employees API', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("api.post<{ data: { employee: { id: string }; initialPassword: string } }>('/admin/employees'")
    })

    test('InviteStep shows initial password after invite', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('initialPassword')
      expect(content).toContain('emp.initialPassword')
    })

    test('InviteStep has copy password button', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('navigator.clipboard.writeText')
      expect(content).toContain('복사')
    })

    test('InviteStep fetches departments for dropdown', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("'/admin/departments'")
      expect(content).toContain('departments.map')
    })

    test('InviteStep tracks invited list', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('invited.map')
      expect(content).toContain('setInvited')
    })

    test('InviteStep has skip option', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('건너뛰기')
    })
  })

  // === Task 6: Step 5 — Summary ===
  describe('Task 6: Summary step', () => {
    test('SummaryStep component exists', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function SummaryStep')
    })

    test('SummaryStep shows completion message', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('준비 완료')
    })

    test('SummaryStep displays company name', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('companyName')
    })

    test('SummaryStep displays template result', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('templateResult')
      expect(content).toContain('templateName')
    })

    test('SummaryStep displays API keys count', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('apiKeysCount')
    })

    test('SummaryStep displays invited employees count', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('invitedEmployees.length')
    })

    test('SummaryStep has "Start CORTHEX" button', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('CORTHEX 사용 시작하기')
    })

    test('SummaryStep saves onboardingCompleted flag via PATCH', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('onboardingCompleted: true')
    })

    test('SummaryStep preserves existing settings on save', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Must spread existing settings
      expect(content).toContain('...existingSettings')
    })

    test('SummaryStep navigates to dashboard on completion', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("navigate('/')")
    })
  })

  // === Task 7: Progress Bar + Step Indicator ===
  describe('Task 7: Progress bar and step navigation', () => {
    test('StepIndicator component exists', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function StepIndicator')
    })

    test('StepIndicator shows 5 steps', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("{ num: 1, label: '환영' }")
      expect(content).toContain("{ num: 2, label: '조직 템플릿' }")
      expect(content).toContain("{ num: 3, label: 'API 키' }")
      expect(content).toContain("{ num: 4, label: '직원 초대' }")
      expect(content).toContain("{ num: 5, label: '완료' }")
    })

    test('StepIndicator shows check mark for completed steps', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('completed.has(step.num)')
      expect(content).toContain('M5 13l4 4L19 7') // checkmark SVG path
    })

    test('FooterNav component handles prev/next/skip', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('function FooterNav')
      expect(content).toContain('onPrev')
      expect(content).toContain('onNext')
      expect(content).toContain('onSkip')
    })

    test('FooterNav hides prev button on step 1', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('step > 1')
    })

    test('Progress bar exists in wizard', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('bg-indigo-600 rounded-full transition-all')
      expect(content).toContain('currentStep / STEPS.length')
    })

    test('Wizard tracks completed steps state', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('completedSteps')
      expect(content).toContain('markComplete')
    })
  })

  // === Task 8: Integration & Edge Cases ===
  describe('Task 8: Integration and edge cases', () => {
    test('Wizard handles no selectedCompanyId', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('!selectedCompanyId')
      expect(content).toContain('사이드바에서 회사를 선택해주세요')
    })

    test('Wizard shows loading state', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('isLoading')
      expect(content).toContain('로딩 중...')
    })

    test('All steps use dark mode classes', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Check that dark: prefix is used throughout
      const darkCount = (content.match(/dark:/g) || []).length
      expect(darkCount).toBeGreaterThan(30)
    })

    test('Wizard uses addToast for success/error feedback', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("addToast({ type: 'success'")
      expect(content).toContain("addToast({ type: 'error'")
    })

    test('Wizard step data flows between steps', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Check state management for inter-step data
      expect(content).toContain('setCompanyName')
      expect(content).toContain('setTemplateResult')
      expect(content).toContain('setApiKeysCount')
      expect(content).toContain('setInvitedEmployees')
    })

    test('company PATCH endpoint exists in companies route', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain('.patch(')
      expect(content).toContain('settings')
    })

    test('companies schema has settings jsonb field', async () => {
      const content = await Bun.file('packages/server/src/db/schema.ts').text()
      expect(content).toContain("settings: jsonb('settings')")
    })

    test('Layout imports useNavigate and useLocation', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('useNavigate')
      expect(content).toContain('useLocation')
    })

    test('Layout imports useQuery for company fetch', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('useQuery')
      expect(content).toContain("import { api } from '../lib/api'")
    })

    test('Layout skips redirect when onboardingCompleted is true', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('onboardingCompleted !== true')
    })

    test('onboarding page uses existing API patterns consistently', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Uses same api util
      expect(content).toContain("import { api } from '../lib/api'")
      // Uses same store
      expect(content).toContain("import { useAdminStore } from '../stores/admin-store'")
      // Uses same toast
      expect(content).toContain("import { useToastStore } from '../stores/toast-store'")
    })

    test('onboarding page uses TanStack Query', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('useQuery')
      expect(content).toContain('useMutation')
      expect(content).toContain('useQueryClient')
    })

    test('onboarding page uses React Router navigation', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('useNavigate')
    })
  })

  // === AC Verification ===
  describe('Acceptance Criteria verification', () => {
    test('AC1: Onboarding display condition — checks onboardingCompleted in Layout', async () => {
      const layout = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(layout).toContain('onboardingCompleted')
      expect(layout).toContain("navigate('/onboarding'")
      // Doesn't redirect if already on onboarding
      expect(layout).toContain('isOnboardingPage')
    })

    test('AC2: Step 1 — Welcome + company info', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('CORTHEX에 오신 것을 환영합니다')
      expect(content).toContain('company.name')
      expect(content).toContain('company.slug')
      expect(content).toContain('setEditing')
    })

    test('AC3: Step 2 — Template selection with preview and apply', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('TemplateStep')
      expect(content).toContain('/admin/org-templates')
      expect(content).toContain('빈 조직으로 시작')
      expect(content).toContain('이 조직 사용하기')
    })

    test('AC4: Step 3 — API key setup (optional)', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('ApiKeyStep')
      expect(content).toContain('openai')
      expect(content).toContain('google_ai')
      expect(content).toContain('나중에 설정하기')
    })

    test('AC5: Step 4 — Employee invite (optional)', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('InviteStep')
      expect(content).toContain('/admin/employees')
      expect(content).toContain('initialPassword')
      expect(content).toContain('navigator.clipboard')
    })

    test('AC6: Step 5 — Summary + complete button', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('SummaryStep')
      expect(content).toContain('CORTHEX 사용 시작하기')
      expect(content).toContain('onboardingCompleted: true')
    })

    test('AC7: Progress bar + navigation', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('StepIndicator')
      expect(content).toContain('FooterNav')
      expect(content).toContain('← 이전')
      expect(content).toContain('건너뛰기')
    })
  })
})
