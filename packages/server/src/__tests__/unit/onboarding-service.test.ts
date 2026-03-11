import { describe, expect, test } from 'bun:test'

/**
 * Story 7.3: 조직 템플릿 + 온보딩
 * Tests for onboarding service, routes, and registration flow changes.
 */

describe('Story 7.3: Onboarding Service & Routes', () => {
  // === Task 1: Register → applyTemplate 전환 ===
  describe('Task 1: Register uses template-based org creation', () => {
    test('auth.ts imports applyDefaultTemplate from onboarding service', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain("import { applyDefaultTemplate } from '../services/onboarding'")
    })

    test('auth.ts register calls applyDefaultTemplate', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('applyDefaultTemplate(tenant)')
    })

    test('auth.ts register has fallback to deployOrganization', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('deployOrganization(company.id, user.id)')
      // Should still import deployOrganization for fallback
      expect(content).toContain("import { deployOrganization } from '../services/agent-org-deployer'")
    })

    test('auth.ts register template result is logged', async () => {
      const content = await Bun.file('packages/server/src/routes/auth.ts').text()
      expect(content).toContain('templateResult')
      expect(content).toContain('orgSummary')
    })
  })

  // === Task 2: Onboarding Service ===
  describe('Task 2: Onboarding service functions', () => {
    test('onboarding.ts exports applyDefaultTemplate', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('export async function applyDefaultTemplate')
    })

    test('applyDefaultTemplate prefers template with 기본 in name', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain("t.name.includes('기본')")
    })

    test('applyDefaultTemplate returns null when no builtin templates', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('return null')
    })

    test('onboarding.ts exports getOnboardingStatus', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('export async function getOnboardingStatus')
    })

    test('getOnboardingStatus reads onboardingCompleted from companies.settings', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('onboardingCompleted')
      expect(content).toContain('companies.settings')
    })

    test('onboarding.ts exports selectOnboardingTemplate', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('export async function selectOnboardingTemplate')
    })

    test('selectOnboardingTemplate records selection in company settings', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('selectedTemplateId')
    })

    test('onboarding.ts exports completeOnboarding', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('export async function completeOnboarding')
    })

    test('completeOnboarding sets onboardingCompleted = true', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain('onboardingCompleted: true')
    })

    test('onboarding.ts uses applyTemplate from organization service', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).toContain("import { applyTemplate")
      expect(content).toContain("from './organization'")
    })
  })

  // === Task 2: Onboarding Routes ===
  describe('Task 2: Onboarding API routes', () => {
    test('onboarding route file exists', async () => {
      const file = Bun.file('packages/server/src/routes/onboarding.ts')
      expect(await file.exists()).toBe(true)
    })

    test('onboarding route uses authMiddleware only (no adminOnly import)', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('tenantMiddleware')
      // Should not import adminOnly from auth middleware
      expect(content).not.toContain('import { authMiddleware, adminOnly }')
    })

    test('onboarding route exports onboardingRoute', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('export const onboardingRoute')
    })

    test('GET /onboarding/status endpoint exists', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("'/onboarding/status'")
      expect(content).toContain('.get(')
    })

    test('GET /onboarding/templates endpoint exists', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("'/onboarding/templates'")
    })

    test('POST /onboarding/select-template endpoint exists', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("'/onboarding/select-template'")
      expect(content).toContain('templateId')
    })

    test('POST /onboarding/complete endpoint exists', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("'/onboarding/complete'")
    })

    test('select-template uses zod validation', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain("zValidator('json'")
      expect(content).toContain('z.string().uuid()')
    })

    test('routes return success: true format', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('success: true')
    })

    test('onboarding route registered in server index', async () => {
      const content = await Bun.file('packages/server/src/index.ts').text()
      expect(content).toContain("import { onboardingRoute } from './routes/onboarding'")
      expect(content).toContain("app.route('/api', onboardingRoute)")
    })
  })

  // === Task 3: Frontend ===
  describe('Task 3: Onboarding frontend', () => {
    test('onboarding page file exists in app', async () => {
      const file = Bun.file('packages/app/src/pages/onboarding.tsx')
      expect(await file.exists()).toBe(true)
    })

    test('onboarding page exports OnboardingPage', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('export function OnboardingPage')
    })

    test('onboarding page has 3 steps: template selection, CLI guide, completion', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('TemplateStep')
      expect(content).toContain('CliGuideStep')
      expect(content).toContain('CompleteStep')
    })

    test('onboarding page calls /onboarding/status API', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('/onboarding/status')
    })

    test('onboarding page calls /onboarding/templates API', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('/onboarding/templates')
    })

    test('onboarding page calls /onboarding/select-template API', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('/onboarding/select-template')
    })

    test('onboarding page calls /onboarding/complete API', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('/onboarding/complete')
    })

    test('onboarding page has template preview modal', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('aria-modal')
      expect(content).toContain('previewId')
    })

    test('CLI guide step has installation instructions', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('npm install -g @anthropic-ai/claude-code')
      expect(content).toContain('claude auth login')
    })

    test('CLI guide step has skip button', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('나중에 설정')
      expect(content).toContain('onSkip')
    })

    test('completion step navigates to command-center', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('/command-center')
    })

    test('App.tsx has /onboarding route', async () => {
      const content = await Bun.file('packages/app/src/App.tsx').text()
      expect(content).toContain('path="/onboarding"')
      expect(content).toContain('OnboardingPage')
    })

    test('App.tsx lazy imports OnboardingPage', async () => {
      const content = await Bun.file('packages/app/src/App.tsx').text()
      expect(content).toContain("import('./pages/onboarding')")
    })

    test('onboarding page redirects if already completed', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('completed')
      expect(content).toContain("navigate('/'")
    })

    test('onboarding progress bar shows 3 steps', async () => {
      const content = await Bun.file('packages/app/src/pages/onboarding.tsx').text()
      expect(content).toContain('조직 선택')
      expect(content).toContain('CLI 설정')
      expect(content).toContain('완료')
    })
  })

  // === Cross-cutting concerns ===
  describe('Architecture compliance', () => {
    test('onboarding service does not import from engine/', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      expect(content).not.toContain("from '../engine/")
    })

    test('onboarding route does not import from engine/', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).not.toContain("from '../engine/")
      expect(content).not.toContain("from '../../engine/")
    })

    test('onboarding service uses standard error return pattern', async () => {
      const content = await Bun.file('packages/server/src/services/onboarding.ts').text()
      // Should propagate error from applyTemplate, not throw
      expect(content).toContain("'error' in result")
    })

    test('onboarding route uses HTTPError for error responses', async () => {
      const content = await Bun.file('packages/server/src/routes/onboarding.ts').text()
      expect(content).toContain('HTTPError')
    })
  })
})
