import { describe, test, expect } from 'bun:test'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

// === Story 23.21 — Subframe-to-Radix Migration & Hardcoded Color Cleanup ===

const UI_DIR = new URL('../ui', import.meta.url).pathname
const PAGES_DIR = new URL('../pages', import.meta.url).pathname
const COMPONENTS_DIR = new URL('../components', import.meta.url).pathname

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

describe('Subframe Migration', () => {
  test('no @subframe/core import statements remain in ui/ directory', () => {
    const files = getFilesRecursive(UI_DIR, '.tsx').concat(getFilesRecursive(UI_DIR, '.ts'))
    const violators: string[] = []

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      // Check for actual import statements, not comments
      const lines = content.split('\n')
      for (const line of lines) {
        if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue
        if (line.includes('from "@subframe/core"') || line.includes("from '@subframe/core'")) {
          violators.push(file.replace(UI_DIR, 'ui/'))
          break
        }
      }
    }

    expect(violators).toEqual([])
  })

  test('no @subframe imports in main app pages', () => {
    const files = getFilesRecursive(PAGES_DIR, '.tsx')

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      expect(content).not.toContain('@subframe')
    }
  })

  test('no @subframe imports in main app components', () => {
    const files = getFilesRecursive(COMPONENTS_DIR, '.tsx')

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      expect(content).not.toContain('@subframe')
    }
  })

  test('subframe-shim.ts provides necessary utilities', () => {
    const shimContent = readFileSync(join(UI_DIR, 'subframe-shim.ts'), 'utf8')

    expect(shimContent).toContain('IconWrapper')
    expect(shimContent).toContain('FeatherCheck')
    expect(shimContent).toContain('FeatherChevronDown')
    expect(shimContent).toContain('createTwClassNames')
    expect(shimContent).toContain('FullScreenDialog')
  })

  test('utils.ts no longer imports @subframe/core', () => {
    const utilsContent = readFileSync(join(UI_DIR, 'utils.ts'), 'utf8')

    // Should not import @subframe/core
    const importLines = utilsContent.split('\n').filter(l => !l.startsWith('//') && l.includes('import'))
    for (const line of importLines) {
      expect(line).not.toContain('@subframe/core')
    }

    // Should export twClassNames
    expect(utilsContent).toContain('twClassNames')
  })

  test('legacy ui/ directory is excluded from TypeScript compilation', () => {
    const tsconfigContent = readFileSync(join(UI_DIR, '../../tsconfig.json'), 'utf8')
    const tsconfig = JSON.parse(tsconfigContent)
    expect(tsconfig.exclude).toContain('src/ui')
  })
})

describe('Hardcoded Color Cleanup', () => {
  // Natural Organic theme approved colors
  const APPROVED_COLORS = new Set([
    '#faf8f5', '#283618', '#5a7247', '#606c38', '#e5e1d3', '#d4cfc4',
    '#f5f0e8', '#f0ebe0', '#1a1a1a', '#6b705c', '#908a78', '#756e5a',
    '#a3a08e', // disabled text
    '#4d7c0f', '#b45309', '#dc2626', '#c4622d', '#2563eb',
    '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#a3b18a',
    '#ffffff', '#000000',
  ])

  test('page files use mostly approved theme colors', () => {
    const files = getFilesRecursive(PAGES_DIR, '.tsx')
    const colorRegex = /#[0-9a-fA-F]{6}/g
    let approvedCount = 0
    let totalCount = 0

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const matches = content.match(colorRegex) || []
      for (const match of matches) {
        totalCount++
        if (APPROVED_COLORS.has(match.toLowerCase())) {
          approvedCount++
        }
      }
    }

    // At least 80% of colors should be from the approved theme palette
    const ratio = totalCount > 0 ? approvedCount / totalCount : 1
    expect(ratio).toBeGreaterThan(0.8)
  })

  test('no Tailwind stone/slate dark-mode colors in page files', () => {
    const files = getFilesRecursive(PAGES_DIR, '.tsx')
    const darkModePatterns = [
      /text-slate-50\b/,
      /text-slate-100\b/,
      /text-slate-200\b/,
      /bg-slate-900\b/,
      /bg-slate-800\b/,
    ]

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const filename = file.replace(PAGES_DIR, '')
      for (const pattern of darkModePatterns) {
        if (pattern.test(content)) {
          // Allow in sketchvibe (dark canvas) and legacy pages (redirect to canonical paths)
          const isLegacy = filename.includes('sketchvibe') || filename.includes('command-center') || filename.includes('cron-base') || filename.includes('home.') || filename.includes('session-sidebar')
          if (!isLegacy) {
            expect(`${filename} contains ${pattern.source}`).toBe('no dark-mode colors')
          }
        }
      }
    }
  })
})
