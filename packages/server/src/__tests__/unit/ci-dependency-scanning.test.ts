import { describe, test, expect } from 'bun:test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Story 22.5: CI Dependency Scanning & Quality Baselines tests
 * Tests CI workflow audit steps, Dependabot config, and baseline documents.
 */

const ROOT_DIR = join(__dirname, '../../../../..')
const GITHUB_DIR = join(ROOT_DIR, '.github')
const TEST_ARTIFACTS = join(ROOT_DIR, '_bmad-output/test-artifacts')

describe('Story 22.5: CI Dependency Scanning & Quality Baselines', () => {
  describe('Task 1: bun audit in CI workflows', () => {
    test('ci.yml contains security audit step', () => {
      const ci = readFileSync(join(GITHUB_DIR, 'workflows/ci.yml'), 'utf-8')
      expect(ci).toContain('Security audit')
      expect(ci).toContain('bun audit')
    })

    test('deploy.yml contains security audit step', () => {
      const deploy = readFileSync(join(GITHUB_DIR, 'workflows/deploy.yml'), 'utf-8')
      expect(deploy).toContain('Security audit')
      expect(deploy).toContain('bun audit')
    })

    test('audit step uses allowlist filtering', () => {
      const ci = readFileSync(join(GITHUB_DIR, 'workflows/ci.yml'), 'utf-8')
      expect(ci).toContain('grep -vFf')
    })

    test('audit step fails on critical/high only', () => {
      const ci = readFileSync(join(GITHUB_DIR, 'workflows/ci.yml'), 'utf-8')
      expect(ci).toContain("grep -E '^\\s*(critical|high):'")
    })

    test('audit step emits ::error:: annotations', () => {
      const ci = readFileSync(join(GITHUB_DIR, 'workflows/ci.yml'), 'utf-8')
      expect(ci).toContain('::error::')
    })

    test('audit step placed after install, before build', () => {
      const ci = readFileSync(join(GITHUB_DIR, 'workflows/ci.yml'), 'utf-8')
      const installIdx = ci.indexOf('Install dependencies')
      const auditIdx = ci.indexOf('Security audit')
      const buildIdx = ci.indexOf('Build all packages')
      expect(auditIdx).toBeGreaterThan(installIdx)
      expect(buildIdx).toBeGreaterThan(auditIdx)
    })
  })

  describe('Task 1.3: Audit allowlist', () => {
    test('audit-allowlist.txt exists', () => {
      expect(existsSync(join(GITHUB_DIR, 'audit-allowlist.txt'))).toBe(true)
    })

    test('allowlist contains fast-xml-parser GHSA IDs', () => {
      const allowlist = readFileSync(join(GITHUB_DIR, 'audit-allowlist.txt'), 'utf-8')
      expect(allowlist).toContain('GHSA-m7jm-9gc2-mpf2')
      expect(allowlist).toContain('GHSA-jmr7-xgp7-cmfj')
      expect(allowlist).toContain('GHSA-8gc5-j5rx-235r')
    })

    test('allowlist has review date header', () => {
      const allowlist = readFileSync(join(GITHUB_DIR, 'audit-allowlist.txt'), 'utf-8')
      expect(allowlist).toContain('Reviewed: 2026-03-24')
      expect(allowlist).toContain('Next review:')
    })
  })

  describe('Task 2: Dependabot configuration', () => {
    test('dependabot.yml exists', () => {
      expect(existsSync(join(GITHUB_DIR, 'dependabot.yml'))).toBe(true)
    })

    test('uses npm ecosystem', () => {
      const config = readFileSync(join(GITHUB_DIR, 'dependabot.yml'), 'utf-8')
      expect(config).toContain('package-ecosystem: "npm"')
    })

    test('weekly schedule on Monday', () => {
      const config = readFileSync(join(GITHUB_DIR, 'dependabot.yml'), 'utf-8')
      expect(config).toContain('interval: "weekly"')
      expect(config).toContain('day: "monday"')
    })

    test('has dependencies and security labels', () => {
      const config = readFileSync(join(GITHUB_DIR, 'dependabot.yml'), 'utf-8')
      expect(config).toContain('"dependencies"')
      expect(config).toContain('"security"')
    })

    test('open-pull-requests-limit set', () => {
      const config = readFileSync(join(GITHUB_DIR, 'dependabot.yml'), 'utf-8')
      expect(config).toContain('open-pull-requests-limit: 10')
    })

    test('directory is root', () => {
      const config = readFileSync(join(GITHUB_DIR, 'dependabot.yml'), 'utf-8')
      expect(config).toContain('directory: "/"')
    })
  })

  describe('Task 3: Quality baseline document (NFR-O4)', () => {
    test('quality-baseline.md exists', () => {
      expect(existsSync(join(TEST_ARTIFACTS, 'quality-baseline.md'))).toBe(true)
    })

    test('contains 10 prompts', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'quality-baseline.md'), 'utf-8')
      for (let i = 1; i <= 10; i++) {
        expect(doc).toContain(`Prompt ${i}:`)
      }
    })

    test('each prompt has Input, API, Expected behavior, Success criteria', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'quality-baseline.md'), 'utf-8')
      const promptSections = doc.split('## Prompt').slice(1)
      expect(promptSections.length).toBe(10)
      for (const section of promptSections) {
        expect(section).toContain('**Input**')
        expect(section).toContain('**API**')
        expect(section).toContain('**Expected behavior**')
        expect(section).toContain('**Success criteria**')
      }
    })

    test('contains A/B comparison methodology', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'quality-baseline.md'), 'utf-8')
      expect(doc).toContain('A/B')
      expect(doc).toContain('blind')
    })

    test('covers key domains', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'quality-baseline.md'), 'utf-8')
      const domains = ['Chat', 'Knowledge', 'Agent Routing', 'Department', 'SNS', 'Notification', 'Dashboard', 'File', 'Job', 'Settings']
      for (const domain of domains) {
        expect(doc).toContain(domain)
      }
    })
  })

  describe('Task 4: Routing scenarios document (NFR-O5)', () => {
    test('routing-scenarios.md exists', () => {
      expect(existsSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'))).toBe(true)
    })

    test('contains 10 scenarios', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'), 'utf-8')
      for (let i = 1; i <= 10; i++) {
        expect(doc).toContain(`Scenario ${i}:`)
      }
    })

    test('covers all NFR-O5 categories', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'), 'utf-8')
      const categories = [
        'Direct Department', 'Ambiguous', 'Cross-Department', 'Out-of-Scope',
        'Follow-up', 'Multi-step', 'Bilingual', 'Abbreviation', 'Typo', 'Concurrent',
      ]
      for (const cat of categories) {
        expect(doc).toContain(cat)
      }
    })

    test('each scenario has Input, Expected routing, Rationale', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'), 'utf-8')
      const scenarios = doc.split('## Scenario').slice(1)
      expect(scenarios.length).toBe(10)
      for (const scenario of scenarios) {
        expect(scenario).toContain('**Input')
        expect(scenario).toContain('**Expected routing**')
        expect(scenario).toContain('**Rationale**')
      }
    })

    test('pass threshold is 8/10+', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'), 'utf-8')
      expect(doc).toContain('8/10+')
      expect(doc).toContain('PASS')
    })

    test('scoring rubric includes partial credit for ambiguous', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'routing-scenarios.md'), 'utf-8')
      expect(doc).toContain('0.5')
      expect(doc).toContain('clarification')
    })
  })
})
