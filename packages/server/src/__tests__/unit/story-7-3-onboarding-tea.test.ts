import { describe, expect, test } from 'bun:test'

/**
 * TEA: Story 7.3 조직 템플릿 + 온보딩 — Risk-Based Tests
 *
 * Risk areas:
 * R1: Auth register template→fallback flow (HIGH)
 * R2: Settings merge safety in onboarding service (HIGH)
 * R3: Error propagation paths (MEDIUM)
 * R4: Route security boundary — auth+tenant, NOT adminOnly (MEDIUM)
 * R5: Zod validation on select-template (LOW)
 * R6: Frontend redirect loop prevention (MEDIUM)
 * R7: Cross-module TenantActor export dependency (LOW)
 */
describe('TEA: Story 7.3 Onboarding Risk-Based Tests', () => {
  // ============================================================
  // R1: Auth register template→fallback flow (HIGH)
  // ============================================================
  describe('R1: Auth register template→fallback flow', () => {
    test('register creates tenant with isAdminUser=false', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('isAdminUser: false')
    })

    test('register tries applyDefaultTemplate BEFORE deployOrganization', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const applyIdx = content.indexOf('applyDefaultTemplate(tenant)')
      const deployIdx = content.indexOf('deployOrganization(company.id, user.id)')
      expect(applyIdx).toBeGreaterThan(-1)
      expect(deployIdx).toBeGreaterThan(-1)
      expect(applyIdx).toBeLessThan(deployIdx)
    })

    test('register uses templateResult null check for fallback', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('if (templateResult)')
      // else branch should call deployOrganization
      const templateBlock = content.substring(
        content.indexOf('if (templateResult)'),
        content.indexOf('const token = await createToken'),
      )
      expect(templateBlock).toContain('deployOrganization')
    })

    test('orgSummary includes template name when template succeeds', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('templateResult.templateName')
      expect(content).toContain('templateResult.departmentsCreated')
      expect(content).toContain('templateResult.agentsCreated')
    })

    test('orgSummary includes fallback marker when template fails', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('fallback')
    })

    test('register includes orgSummary in activity log', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('orgSummary')
      expect(content).toContain('logActivity')
    })

    test('register creates 비서실장 system agent after org creation', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("import { seedSystemAgent } from '../services/seed.service'")
      expect(content).toContain('seedSystemAgent(company.id, user.id)')
    })

    test('비서실장 creation comes AFTER template/fallback org creation', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      const orgIdx = content.indexOf('orgSummary =')
      const secretaryIdx = content.indexOf('seedSystemAgent(company.id, user.id)')
      expect(orgIdx).toBeGreaterThan(-1)
      expect(secretaryIdx).toBeGreaterThan(-1)
      expect(secretaryIdx).toBeGreaterThan(orgIdx)
    })
  })

  // ============================================================
  // R2: Settings merge safety (HIGH)
  // ============================================================
  describe('R2: Settings merge safety', () => {
    test('getOnboardingStatus reads from companies.settings with safe fallback', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      // Must handle null/undefined settings
      expect(content).toContain('company?.settings ?? {}')
    })

    test('selectOnboardingTemplate reads current settings before update', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      // The function must read existing settings first
      const fn = content.substring(
        content.indexOf('async function selectOnboardingTemplate'),
        content.indexOf('async function completeOnboarding'),
      )
      expect(fn).toContain('.select({ settings: companies.settings })')
      expect(fn).toContain('currentSettings')
    })

    test('selectOnboardingTemplate spreads existing settings when adding templateId', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('...currentSettings, selectedTemplateId: templateId')
    })

    test('completeOnboarding reads current settings before update', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const fn = content.substring(
        content.indexOf('async function completeOnboarding'),
      )
      expect(fn).toContain('.select({ settings: companies.settings })')
      expect(fn).toContain('currentSettings')
    })

    test('completeOnboarding spreads existing settings when setting completed flag', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('...currentSettings, onboardingCompleted: true')
    })

    test('both selectOnboardingTemplate and completeOnboarding set updatedAt', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const selectFn = content.substring(
        content.indexOf('async function selectOnboardingTemplate'),
        content.indexOf('async function completeOnboarding'),
      )
      const completeFn = content.substring(
        content.indexOf('async function completeOnboarding'),
      )
      expect(selectFn).toContain('updatedAt: new Date()')
      expect(completeFn).toContain('updatedAt: new Date()')
    })
  })

  // ============================================================
  // R3: Error propagation paths (MEDIUM)
  // ============================================================
  describe('R3: Error propagation paths', () => {
    test('applyDefaultTemplate returns null on applyTemplate error', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const fn = content.substring(
        content.indexOf('async function applyDefaultTemplate'),
        content.indexOf('async function getOnboardingStatus'),
      )
      // Must check 'error' in result and return null
      expect(fn).toContain("'error' in result")
      expect(fn).toContain('return null')
    })

    test('applyDefaultTemplate logs error on failure', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('console.error')
      expect(content).toContain('[onboarding] applyDefaultTemplate failed')
    })

    test('selectOnboardingTemplate propagates applyTemplate error', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const fn = content.substring(
        content.indexOf('async function selectOnboardingTemplate'),
        content.indexOf('async function completeOnboarding'),
      )
      // Must check error and return it
      expect(fn).toContain("'error' in result")
      expect(fn).toContain('return result')
    })

    test('selectOnboardingTemplate does NOT update settings on error', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const fn = content.substring(
        content.indexOf('async function selectOnboardingTemplate'),
        content.indexOf('async function completeOnboarding'),
      )
      // The error check must come before the settings update
      const errorCheckIdx = fn.indexOf("'error' in result")
      const settingsUpdateIdx = fn.indexOf('selectedTemplateId')
      expect(errorCheckIdx).toBeLessThan(settingsUpdateIdx)
    })

    test('onboarding route throws HTTPError on selectOnboardingTemplate error', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("'error' in result")
      expect(content).toContain('throw new HTTPError(result.error.status, result.error.message, result.error.code)')
    })
  })

  // ============================================================
  // R4: Route security boundary (MEDIUM)
  // ============================================================
  describe('R4: Route security boundary', () => {
    test('onboarding route uses authMiddleware (not public)', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("import { authMiddleware } from '../middleware/auth'")
      expect(content).toContain('authMiddleware')
    })

    test('onboarding route uses tenantMiddleware for company isolation', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("import { tenantMiddleware } from '../middleware/tenant'")
      expect(content).toContain('tenantMiddleware')
    })

    test('onboarding route does NOT import or use adminOnly middleware', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      // adminOnly should not be in import statement
      expect(content).not.toContain("import { authMiddleware, adminOnly }")
      // adminOnly should not be in use() call
      expect(content).not.toContain('adminOnly)')
    })

    test('all 4 endpoints read tenant from context', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      // Count c.get('tenant') calls — should be 4 (one per endpoint)
      const tenantCalls = (content.match(/c\.get\('tenant'\)/g) || []).length
      expect(tenantCalls).toBe(4)
    })

    test('onboarding route registered at /api prefix in server index', async () => {
      const content = await Bun.file('packages/server/src/index.ts').text()
      expect(content).toContain("app.route('/api', onboardingRoute)")
    })
  })

  // ============================================================
  // R5: Zod validation on select-template (LOW)
  // ============================================================
  describe('R5: Zod validation', () => {
    test('select-template requires templateId as UUID string', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('templateId: z.string().uuid()')
    })

    test('select-template uses json body validator', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("zValidator('json', selectTemplateSchema)")
    })

    test('complete endpoint requires no body (POST with no schema)', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      // The complete endpoint should not have zValidator
      const completeEndpoint = content.substring(content.indexOf("'/onboarding/complete'"))
      expect(completeEndpoint).not.toContain("zValidator('json'")
    })

    test('select-template returns 201 on success', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('201')
    })
  })

  // ============================================================
  // R6: Frontend redirect loop prevention (MEDIUM)
  // ============================================================
  describe('R6: Frontend redirect & state management', () => {
    test('onboarding page checks status on mount', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain("queryKey: ['onboarding-status']")
      expect(content).toContain('/onboarding/status')
    })

    test('onboarding page redirects to / if already completed', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('completed')
      expect(content).toContain("navigate('/', { replace: true })")
    })

    test('templates query is disabled when onboarding already completed', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('enabled: statusData?.data?.completed !== true')
    })

    test('step state starts at 1', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('useState(1)')
    })

    test('applyMutation advances to step 2 on success', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('setStep(2)')
    })

    test('completeMutation navigates to /command-center on success', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain("navigate('/command-center', { replace: true })")
    })

    test('CliGuideStep skip also advances to step 3', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('onSkip={() => setStep(3)')
    })
  })

  // ============================================================
  // R7: Cross-module TenantActor dependency (LOW)
  // ============================================================
  describe('R7: TenantActor export dependency', () => {
    test('organization.ts exports TenantActor type', async () => {
      const content = await Bun.file('packages/server/src/services/organization.ts').text()
      expect(content).toContain('export interface TenantActor')
    })

    test('onboarding.ts imports TenantActor from organization', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain("import { applyTemplate, type TemplateApplySummary, type TenantActor } from './organization'")
    })

    test('auth.ts does not need TenantActor import (constructs inline)', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).not.toContain('TenantActor')
      // Instead constructs tenant object inline
      expect(content).toContain('const tenant = {')
    })
  })

  // ============================================================
  // R8: Response format compliance
  // ============================================================
  describe('R8: API response format compliance', () => {
    test('GET /onboarding/status returns { success: true, data }', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      // First GET endpoint
      const statusEndpoint = content.substring(
        content.indexOf("'/onboarding/status'"),
        content.indexOf("'/onboarding/templates'"),
      )
      expect(statusEndpoint).toContain('success: true')
    })

    test('GET /onboarding/templates returns { success: true, data }', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      const templatesEndpoint = content.substring(
        content.indexOf("'/onboarding/templates'"),
        content.indexOf("'/onboarding/select-template'"),
      )
      expect(templatesEndpoint).toContain('success: true')
    })

    test('POST /onboarding/complete returns Korean confirmation message', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('온보딩이 완료되었습니다')
    })
  })

  // ============================================================
  // R9: Template preference logic
  // ============================================================
  describe('R9: Template preference logic in applyDefaultTemplate', () => {
    test('queries only builtin + active + global (companyId IS NULL) templates', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('eq(orgTemplates.isBuiltin, true)')
      expect(content).toContain('eq(orgTemplates.isActive, true)')
      expect(content).toContain('isNull(orgTemplates.companyId)')
    })

    test('prefers template with 기본 in name, falls back to first', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain("builtinTemplates.find((t) => t.name.includes('기본')) || builtinTemplates[0]")
    })

    test('returns result.data (TemplateApplySummary) on success', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      const fn = content.substring(
        content.indexOf('async function applyDefaultTemplate'),
        content.indexOf('async function getOnboardingStatus'),
      )
      expect(fn).toContain('return result.data')
    })
  })

  // ============================================================
  // R10: App.tsx route integration
  // ============================================================
  describe('R10: App.tsx route integration', () => {
    test('App.tsx imports OnboardingPage lazily', async () => {
      const content = await Bun.file('packages/app/src/App.tsx').text()
      expect(content).toContain("import('./pages/onboarding')")
    })

    test('App.tsx has /onboarding route path', async () => {
      const content = await Bun.file('packages/app/src/App.tsx').text()
      expect(content).toContain('path="/onboarding"')
    })

    test('server index.ts imports onboardingRoute', async () => {
      const content = await Bun.file('packages/server/src/index.ts').text()
      expect(content).toContain("import { onboardingRoute } from './routes/onboarding'")
    })
  })
})
