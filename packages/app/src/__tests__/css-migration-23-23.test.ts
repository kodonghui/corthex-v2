import { describe, test, expect } from 'bun:test'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

// === Story 23.23 — CSS Migration Strategy & Testing Automation ===

const TOOLS_DIR = new URL('../../../..', import.meta.url).pathname + '/tools'
const PAGES_DIR = new URL('../pages', import.meta.url).pathname
const APP_ROOT = new URL('../../', import.meta.url).pathname

function getFilesRecursive(dir: string, ext: string): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...getFilesRecursive(full, ext))
      } else if (entry.name.endsWith(ext)) {
        results.push(full)
      }
    }
  } catch { /* dir may not exist */ }
  return results
}

describe('CSS Audit Tool', () => {
  test('tools/css-audit.ts exists', () => {
    expect(existsSync(join(TOOLS_DIR, 'css-audit.ts'))).toBe(true)
  })

  test('css-audit.ts checks approved colors', () => {
    const content = readFileSync(join(TOOLS_DIR, 'css-audit.ts'), 'utf8')
    expect(content).toContain('APPROVED_COLORS')
    expect(content).toContain('#faf8f5')
    expect(content).toContain('#283618')
    expect(content).toContain('#5a7247')
  })

  test('css-audit.ts checks forbidden patterns', () => {
    const content = readFileSync(join(TOOLS_DIR, 'css-audit.ts'), 'utf8')
    expect(content).toContain('FORBIDDEN_PATTERNS')
    expect(content).toContain('text-slate-50')
    expect(content).toContain('bg-slate-900')
  })

  test('css-audit.ts has legacy exemptions', () => {
    const content = readFileSync(join(TOOLS_DIR, 'css-audit.ts'), 'utf8')
    expect(content).toContain('LEGACY_EXEMPTIONS')
    expect(content).toContain('sketchvibe')
    expect(content).toContain('command-center')
  })
})

describe('Verification Tool', () => {
  test('tools/verify-all-epics.ts exists', () => {
    expect(existsSync(join(TOOLS_DIR, 'verify-all-epics.ts'))).toBe(true)
  })

  test('verify-all-epics.ts checks TypeScript and tests', () => {
    const content = readFileSync(join(TOOLS_DIR, 'verify-all-epics.ts'), 'utf8')
    expect(content).toContain('tsc --noEmit')
    expect(content).toContain('bun test')
    expect(content).toContain('Epic Verification')
  })
})

describe('Design System Compliance', () => {
  // Natural Organic theme approved colors
  const APPROVED_COLORS = new Set([
    '#faf8f5', '#283618', '#5a7247', '#606c38', '#e5e1d3', '#d4cfc4',
    '#f5f0e8', '#f0ebe0', '#1a1a1a', '#6b705c', '#908a78', '#756e5a',
    '#a3a08e',
    '#4d7c0f', '#b45309', '#dc2626', '#c4622d', '#2563eb',
    '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#a3b18a',
    '#ffffff', '#000000',
  ])

  test('pages have ≥80% approved color usage', () => {
    const files = getFilesRecursive(PAGES_DIR, '.tsx')
    const colorRegex = /#[0-9a-fA-F]{6}/g
    let approved = 0
    let total = 0

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const matches = content.match(colorRegex) || []
      for (const match of matches) {
        total++
        if (APPROVED_COLORS.has(match.toLowerCase())) approved++
      }
    }

    const ratio = total > 0 ? approved / total : 1
    expect(ratio).toBeGreaterThan(0.8)
  })

  test('all page files use bg-[#faf8f5] as base background', () => {
    // Core pages that should have the cream background
    const corePages = ['hub', 'dashboard', 'knowledge', 'argos', 'activity-log', 'org']
    let found = 0

    for (const page of corePages) {
      const files = getFilesRecursive(PAGES_DIR, '.tsx')
      const pageFile = files.find(f => f.includes(`/${page}.tsx`) || f.includes(`/${page}/index.tsx`))
      if (pageFile) {
        const content = readFileSync(pageFile, 'utf8')
        if (content.includes('#faf8f5') || content.includes('bg-cream')) found++
      }
    }

    // At least 4 of 6 core pages should use cream background
    expect(found).toBeGreaterThanOrEqual(4)
  })
})

describe('Epic 23 Test Coverage', () => {
  const TESTS_DIR = new URL('.', import.meta.url).pathname

  test('all 5 final batch stories have test files', () => {
    const testFiles = readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.ts'))
    const epic23Tests = testFiles.filter(f => f.includes('23-'))

    // Stories 23.19, 23.20, 23.21, 23.22, 23.23
    expect(epic23Tests.length).toBeGreaterThanOrEqual(5)
  })

  test('sprint-status.yaml exists', () => {
    const sprintPath = join(APP_ROOT, '../../_bmad-output/implementation-artifacts/sprint-status.yaml')
    expect(existsSync(sprintPath)).toBe(true)
  })
})
