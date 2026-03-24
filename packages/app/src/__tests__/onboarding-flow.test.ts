/**
 * Story 23.12 — Onboarding Flow Redesign Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── OnboardingWizard ───────────────────────────────
describe('Onboarding: Wizard', () => {
  const src = readFileSync(resolve(__dirname, '../components/onboarding/OnboardingWizard.tsx'), 'utf-8')

  test('has 5 steps', () => {
    expect(src).toContain("id: 1, title: '회사 설정'")
    expect(src).toContain("id: 2, title: '부서 생성'")
    expect(src).toContain("id: 3, title: '에이전트 생성'")
    expect(src).toContain("id: 4, title: 'API 설정'")
    expect(src).toContain("id: 5, title: '시작하기'")
  })

  test('Step 1: Company setup (name, logo)', () => {
    expect(src).toContain('companyName')
    expect(src).toContain('companyLogo')
    expect(src).toContain('회사 정보를 입력')
  })

  test('Step 2: Department creation', () => {
    expect(src).toContain('departmentName')
    expect(src).toContain('departmentDescription')
    expect(src).toContain('첫 부서를 만들어')
  })

  test('Step 3: Agent creation', () => {
    expect(src).toContain('agentName')
    expect(src).toContain('agentRole')
    expect(src).toContain('agentModel')
    expect(src).toContain('첫 AI 에이전트')
  })

  test('Step 4: API key configuration', () => {
    expect(src).toContain('apiProvider')
    expect(src).toContain('apiKey')
    expect(src).toContain('API 키를 설정')
  })

  test('Step 5: Welcome / completion', () => {
    expect(src).toContain('모든 준비가 완료')
    expect(src).toContain('PartyPopper')
  })

  test('has progress indicator', () => {
    expect(src).toContain('StepProgress')
    expect(src).toContain('currentStep')
  })

  test('navigation: next and back buttons', () => {
    expect(src).toContain('handleNext')
    expect(src).toContain('handleBack')
    expect(src).toContain('이전')
    expect(src).toContain('다음')
  })

  test('step validation (canProceed)', () => {
    expect(src).toContain('canProceed')
    expect(src).toContain("data.companyName.trim().length > 0")
    expect(src).toContain("data.departmentName.trim().length > 0")
    expect(src).toContain("data.agentName.trim().length > 0")
  })

  test('completes via API', () => {
    expect(src).toContain("'/onboarding/complete'")
    expect(src).toContain('completeMutation')
  })

  test('navigates to hub on completion', () => {
    expect(src).toContain("navigate('/hub'")
  })

  test('has model selection with Claude models', () => {
    expect(src).toContain('claude-sonnet-4-6')
    expect(src).toContain('claude-haiku-4-5')
    expect(src).toContain('claude-opus-4-6')
  })

  test('uses Lucide icons', () => {
    expect(src).toContain('lucide-react')
    expect(src).toContain('Building2')
    expect(src).toContain('Users')
    expect(src).toContain('Bot')
    expect(src).toContain('Key')
  })

  test('uses data-testid for testing', () => {
    expect(src).toContain('data-testid="onboarding-wizard"')
  })
})

// ── WelcomeScreen ──────────────────────────────────
describe('Onboarding: WelcomeScreen', () => {
  const src = readFileSync(resolve(__dirname, '../components/onboarding/WelcomeScreen.tsx'), 'utf-8')

  test('shows welcome message', () => {
    expect(src).toContain('환영합니다')
  })

  test('has Get Started button', () => {
    expect(src).toContain('시작하기')
    expect(src).toContain('onGetStarted')
  })

  test('uses Natural Organic theme colors', () => {
    expect(src).toContain('#faf8f5')
    expect(src).toContain('#606C38')
  })

  test('uses Lucide icons', () => {
    expect(src).toContain('Sprout')
    expect(src).toContain('ArrowRight')
  })
})

// ── OnboardingPage (state detection) ───────────────
describe('Onboarding: Page Detection', () => {
  const src = readFileSync(resolve(__dirname, '../pages/onboarding.tsx'), 'utf-8')

  test('checks onboarding status', () => {
    expect(src).toContain("queryKey: ['onboarding-status']")
    expect(src).toContain("'/onboarding/status'")
  })

  test('redirects if has agents', () => {
    expect(src).toContain('hasAgents')
    expect(src).toContain("navigate('/hub'")
  })

  test('shows WelcomeScreen first', () => {
    expect(src).toContain('WelcomeScreen')
    expect(src).toContain('showWizard')
  })

  test('shows OnboardingWizard after Get Started', () => {
    expect(src).toContain('OnboardingWizard')
    expect(src).toContain('setShowWizard(true)')
  })
})

// ── Existing onboarding components ─────────────────
describe('Onboarding: Existing Components', () => {
  test('StepIndicator exists', () => {
    const src = readFileSync(resolve(__dirname, '../components/onboarding/step-indicator.tsx'), 'utf-8')
    expect(src).toContain('StepIndicator')
    expect(src).toContain('currentStep')
    expect(src).toContain('totalSteps')
  })

  test('TemplateCard exists', () => {
    const src = readFileSync(resolve(__dirname, '../components/onboarding/template-card.tsx'), 'utf-8')
    expect(src).toContain('TemplateCard')
    expect(src).toContain('features')
  })
})
