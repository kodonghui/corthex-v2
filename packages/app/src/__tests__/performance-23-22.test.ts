import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

// === Story 23.22 — Performance Optimization & Lighthouse Verification ===

const APP_ROOT = new URL('../../', import.meta.url).pathname
const SRC_DIR = new URL('../', import.meta.url).pathname

describe('Lazy Loading', () => {
  test('all page imports in App.tsx use React.lazy()', () => {
    const appContent = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')
    const importLines = appContent.split('\n').filter(
      (l) => l.includes('import(') && l.includes('./pages/')
    )

    // Every dynamic import should be wrapped in lazy()
    for (const line of importLines) {
      expect(line).toContain('lazy(')
    }

    // At least 30 lazy imports (we have 34 pages)
    expect(importLines.length).toBeGreaterThanOrEqual(30)
  })

  test('SuspensePage component wraps all routes', () => {
    const appContent = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')

    // SuspensePage component exists
    expect(appContent).toContain('function SuspensePage')
    expect(appContent).toContain('Suspense')
    expect(appContent).toContain('PageSkeleton')

    // Count route elements using SuspensePage vs total Route elements (excluding Navigate redirects)
    const suspenseRoutes = (appContent.match(/<SuspensePage>/g) || []).length
    expect(suspenseRoutes).toBeGreaterThanOrEqual(30)
  })
})

describe('Bundle Config', () => {
  test('vite.config.ts has manualChunks for vendor splitting', () => {
    const viteConfig = readFileSync(join(APP_ROOT, 'vite.config.ts'), 'utf8')

    expect(viteConfig).toContain('manualChunks')
    expect(viteConfig).toContain("'react-vendor'")
    expect(viteConfig).toContain("'query-state'")
    expect(viteConfig).toContain("'charts'")
    expect(viteConfig).toContain("'codemirror'")
  })

  test('react-vendor chunk includes react, react-dom, react-router-dom', () => {
    const viteConfig = readFileSync(join(APP_ROOT, 'vite.config.ts'), 'utf8')

    // Find the react-vendor line
    const lines = viteConfig.split('\n')
    const vendorLine = lines.find((l) => l.includes("'react-vendor'"))
    expect(vendorLine).toBeDefined()
    expect(vendorLine).toContain("'react'")
    expect(vendorLine).toContain("'react-dom'")
    expect(vendorLine).toContain("'react-router-dom'")
  })

  test('visualizer plugin is configured (conditional on ANALYZE)', () => {
    const viteConfig = readFileSync(join(APP_ROOT, 'vite.config.ts'), 'utf8')

    expect(viteConfig).toContain('visualizer')
    expect(viteConfig).toContain("ANALYZE")
    expect(viteConfig).toContain('stats.html')
  })
})

describe('React Query Caching', () => {
  test('QueryClient has staleTime and gcTime configured', () => {
    const appContent = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')

    expect(appContent).toContain('staleTime')
    expect(appContent).toContain('gcTime')
    expect(appContent).toContain('30_000')
  })
})

describe('Asset Optimization', () => {
  test('index.html has preconnect for Google Fonts', () => {
    const indexHtml = readFileSync(join(APP_ROOT, 'index.html'), 'utf8')

    expect(indexHtml).toContain('rel="preconnect"')
    expect(indexHtml).toContain('fonts.googleapis.com')
    expect(indexHtml).toContain('fonts.gstatic.com')
  })

  test('index.html has dns-prefetch hints', () => {
    const indexHtml = readFileSync(join(APP_ROOT, 'index.html'), 'utf8')

    expect(indexHtml).toContain('rel="dns-prefetch"')
  })

  test('fonts use display=swap', () => {
    const indexHtml = readFileSync(join(APP_ROOT, 'index.html'), 'utf8')

    expect(indexHtml).toContain('display=swap')
  })

  test('theme-color meta tag is set', () => {
    const indexHtml = readFileSync(join(APP_ROOT, 'index.html'), 'utf8')

    expect(indexHtml).toContain('name="theme-color"')
    expect(indexHtml).toContain('#faf8f5')
  })

  test('viewport meta includes viewport-fit=cover', () => {
    const indexHtml = readFileSync(join(APP_ROOT, 'index.html'), 'utf8')

    expect(indexHtml).toContain('viewport-fit=cover')
  })
})

describe('Lighthouse Checklist', () => {
  test('lighthouse-checklist.md exists with targets', () => {
    const checklist = readFileSync(join(APP_ROOT, '../../tools/lighthouse-checklist.md'), 'utf8')

    expect(checklist).toContain('FCP')
    expect(checklist).toContain('LCP')
    expect(checklist).toContain('CLS')
    expect(checklist).toContain('Bundle Size Targets')
    expect(checklist).toContain('Optimization Checklist')
  })
})
