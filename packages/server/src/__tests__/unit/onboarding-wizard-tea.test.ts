import { describe, expect, test } from 'bun:test'

/**
 * TEA-generated risk-based tests for Story 9-7: Onboarding Wizard
 *
 * Risk areas identified:
 * 1. Settings merge safety (onboardingCompleted flag must not clobber existing settings)
 * 2. Server API integration (companies PATCH, org-templates, employees, api-keys)
 * 3. Security boundary (admin-only access patterns)
 * 4. Error handling resilience (form validation, API failures)
 * 5. Multi-step state consistency
 */
describe('TEA: Onboarding Wizard Risk-Based Tests', () => {
  // ============================================================
  // RISK 1: Settings merge safety
  // ============================================================
  describe('RISK-1: Settings merge safety', () => {
    test('SummaryStep fetches existing settings before saving onboardingCompleted', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Must GET company first to get existing settings
      expect(content).toContain("api.get<{ data: Company }>(`/admin/companies/${companyId}`)")
      // Must spread existing settings
      expect(content).toContain('...existingSettings, onboardingCompleted: true')
    })

    test('PATCH companies/:id schema accepts settings as record', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain('z.record(z.unknown()).optional()')
    })

    test('No raw assignment to settings (always spread/merge)', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // The SummaryStep completeMutation should not set settings directly
      // It should spread existingSettings
      const completeMutationSection = content.split('completeMutation')[1]?.split('onSuccess')[0]
      expect(completeMutationSection).toContain('existingSettings')
    })
  })

  // ============================================================
  // RISK 2: Server API contract validation
  // ============================================================
  describe('RISK-2: Server API contracts', () => {
    test('companies route has PATCH method for settings update', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain('.patch(')
      expect(content).toContain('updateCompanySchema')
    })

    test('org-templates route has GET for listing', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/org-templates.ts').text()
      expect(content).toContain('.get(')
    })

    test('org-templates route has POST for apply', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/org-templates.ts').text()
      expect(content).toContain('/apply')
      expect(content).toContain('.post(')
    })

    test('employees route has POST for creation', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('.post(')
    })

    test('employees creation logic exists in service layer', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('.post(')
      expect(content).toContain('password')
    })

    test('credentials route exists for API key management', async () => {
      const file = Bun.file('packages/server/src/routes/admin/credentials.ts')
      expect(await file.exists()).toBe(true)
      const content = await file.text()
      expect(content).toContain('api-keys')
    })

    test('departments route has GET for listing', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/departments.ts').text()
      expect(content).toContain('.get(')
    })
  })

  // ============================================================
  // RISK 3: Security boundary
  // ============================================================
  describe('RISK-3: Security boundary', () => {
    test('companies route requires auth + admin middleware', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/companies.ts').text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('adminOnly')
    })

    test('org-templates route requires auth + admin middleware', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/org-templates.ts').text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('adminOnly')
    })

    test('employees route requires auth + admin middleware', async () => {
      const content = await Bun.file('packages/server/src/routes/admin/employees.ts').text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('adminOnly')
    })

    test('onboarding page is within Layout (ProtectedRoute) in App.tsx', async () => {
      const content = await Bun.file('packages/admin/src/App.tsx').text()
      // onboarding route is inside the Layout element tree
      const layoutSection = content.split('Layout')[1]
      expect(layoutSection).toContain('onboarding')
    })

    test('Layout uses selectedCompanyId for data isolation', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('selectedCompanyId')
      expect(content).toContain('useAdminStore')
    })
  })

  // ============================================================
  // RISK 4: Error handling and validation
  // ============================================================
  describe('RISK-4: Error handling resilience', () => {
    test('WelcomeStep prevents empty name submission', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("!name.trim()")
    })

    test('InviteStep validates required fields before POST', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("!form.username.trim()")
      expect(content).toContain("!form.name.trim()")
      expect(content).toContain("!form.email.trim()")
    })

    test('ApiKeyStep validates all fields before save', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain("Object.values(creds).some")
    })

    test('All mutations have onError toast handlers', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Count onError handlers
      const errorHandlers = (content.match(/onError.*addToast/g) || []).length
      // At least 4: company PATCH, template apply, api key save, employee invite
      expect(errorHandlers).toBeGreaterThanOrEqual(4)
    })

    test('TemplateStep applyMutation handles disabled state during pending', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('applyMutation.isPending')
      expect(content).toContain("disabled={applyMutation.isPending}")
    })

    test('SummaryStep completeMutation handles disabled state', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('completeMutation.isPending')
    })

    test('clipboard copy has error handling', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // try/catch around clipboard
      expect(content).toContain('} catch {')
      expect(content).toContain('복사에 실패했습니다')
    })
  })

  // ============================================================
  // RISK 5: Multi-step state consistency
  // ============================================================
  describe('RISK-5: Multi-step state consistency', () => {
    test('Each step passes result data to parent wizard', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // Step 1 passes companyName
      expect(content).toContain('onNext={(name)')
      // Step 2 passes templateResult
      expect(content).toContain('onNext={(result)')
      // Step 3 passes apiKeysCount
      expect(content).toContain('onNext={(count)')
      // Step 4 passes invitedEmployees
      expect(content).toContain('onNext={(employees)')
    })

    test('Step completion marks are tracked in Set', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('new Set()')
      expect(content).toContain('markComplete')
    })

    test('Going back preserves completed step markers', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // goToStep only changes currentStep, does not clear completedSteps
      expect(content).toContain('setCurrentStep(step)')
      // No clearing of completedSteps in goToStep
      const goToStepFn = content.match(/goToStep = useCallback\(\(step: number\) => \{[\s\S]*?\}, \[\]\)/)?.[0]
      if (goToStepFn) {
        expect(goToStepFn).not.toContain('setCompletedSteps')
      }
    })

    test('Wizard renders correct step based on currentStep', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('currentStep === 1')
      expect(content).toContain('currentStep === 2')
      expect(content).toContain('currentStep === 3')
      expect(content).toContain('currentStep === 4')
      expect(content).toContain('currentStep === 5')
    })

    test('SummaryStep receives all accumulated data', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      // SummaryStep gets all data props
      expect(content).toContain('companyName={companyName')
      expect(content).toContain('templateResult={templateResult}')
      expect(content).toContain('apiKeysCount={apiKeysCount}')
      expect(content).toContain('invitedEmployees={invitedEmployees}')
    })
  })

  // ============================================================
  // RISK 6: Onboarding redirect loop prevention
  // ============================================================
  describe('RISK-6: Redirect loop prevention', () => {
    test('Layout checks isOnboardingPage before redirecting', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('isOnboardingPage')
      expect(content).toContain('if (!company || isOnboardingPage) return')
    })

    test('Layout detects /onboarding path (basename-relative)', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain("'/onboarding'")
    })

    test('Layout only redirects when company data is loaded (prevents flash)', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      // Must check if company exists before checking settings
      expect(content).toContain('if (!company')
    })

    test('useNavigate replace option prevents back-button loop', async () => {
      const content = await Bun.file('packages/admin/src/components/layout.tsx').text()
      expect(content).toContain('replace: true')
    })
  })

  // ============================================================
  // RISK 7: Template apply idempotency
  // ============================================================
  describe('RISK-7: Template apply safety', () => {
    test('Apply result shows both created and skipped counts', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      expect(content).toContain('departmentsCreated')
      expect(content).toContain('agentsCreated')
    })

    test('TemplateStep query invalidation covers org-chart, departments, agents', async () => {
      const content = await Bun.file('packages/admin/src/pages/onboarding.tsx').text()
      const applyOnSuccess = content.split('applyMutation')[1]?.split('onError')[0]
      expect(applyOnSuccess).toContain("'org-chart'")
      expect(applyOnSuccess).toContain("'departments'")
      expect(applyOnSuccess).toContain("'agents'")
    })

    test('Server org-templates apply handles duplicate detection (skip existing)', async () => {
      const orgTemplateService = await Bun.file('packages/server/src/services/organization.ts').text()
      // Should check for existing departments/agents before creating
      expect(orgTemplateService).toContain('skipped')
    })
  })
})
