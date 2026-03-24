/**
 * Story 23.3 — App Shell Redesign: Sidebar & Topbar Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sidebarSource = readFileSync(resolve(__dirname, '../components/sidebar.tsx'), 'utf-8')
const layoutSource = readFileSync(resolve(__dirname, '../components/layout.tsx'), 'utf-8')

// ── Sidebar Structure ───────────────────────────────
describe('App Shell: Sidebar Structure', () => {
  test('sidebar has olive background #283618', () => {
    expect(sidebarSource).toContain('#283618')
  })

  test('sidebar text uses cream/light green colors', () => {
    expect(sidebarSource).toContain('#a3c48a')
  })

  test('sidebar has CORTHEX brand text', () => {
    expect(sidebarSource).toContain('CORTHEX')
  })

  test('sidebar uses Lucide icons', () => {
    expect(sidebarSource).toContain('lucide-react')
    expect(sidebarSource).toContain('LayoutDashboard')
    expect(sidebarSource).toContain('MessageSquare')
    expect(sidebarSource).toContain('Bot')
    expect(sidebarSource).toContain('Settings')
  })

  test('sidebar has 4 nav sections', () => {
    const sectionMatches = sidebarSource.match(/label:\s*'(?:COMMAND|ORGANIZATION|TOOLS|SYSTEM)'/g)
    expect(sectionMatches).toBeDefined()
    expect(sectionMatches!.length).toBe(4)
  })
})

// ── Sidebar Nav Items ───────────────────────────────
describe('App Shell: Sidebar Nav Items', () => {
  const navItems = [
    '/dashboard', '/hub', '/nexus', '/chat',
    '/agents', '/departments', '/jobs', '/tiers', '/reports',
    '/settings',
  ]

  for (const path of navItems) {
    test(`nav item ${path} exists`, () => {
      expect(sidebarSource).toContain(`to: '${path}'`)
    })
  }
})

// ── Collapsible Sidebar ─────────────────────────────
describe('App Shell: Collapsible Sidebar', () => {
  test('sidebar accepts collapsed prop', () => {
    expect(sidebarSource).toContain('collapsed')
  })

  test('sidebar accepts onToggleCollapse prop', () => {
    expect(sidebarSource).toContain('onToggleCollapse')
  })

  test('collapsed state changes width', () => {
    expect(sidebarSource).toContain('w-16')
    expect(sidebarSource).toContain('w-[280px]')
  })

  test('collapse toggle uses ChevronsLeft/Right icons', () => {
    expect(sidebarSource).toContain('ChevronsLeft')
    expect(sidebarSource).toContain('ChevronsRight')
  })
})

// ── Layout Structure ────────────────────────────────
describe('App Shell: Layout Structure', () => {
  test('layout has bg-[#faf8f5] cream background', () => {
    expect(layoutSource).toContain('#faf8f5')
  })

  test('layout has desktop top bar with breadcrumbs', () => {
    expect(layoutSource).toContain('ChevronRight')
    expect(layoutSource).toContain('pageName')
  })

  test('layout has search placeholder with Ctrl+K', () => {
    expect(layoutSource).toContain('Ctrl')
    expect(layoutSource).toContain('Search...')
  })

  test('layout has notification bell', () => {
    expect(layoutSource).toContain('Bell')
    expect(layoutSource).toContain('notifications')
  })

  test('layout has mobile hamburger menu', () => {
    expect(layoutSource).toContain('Menu')
    expect(layoutSource).toContain('openSidebar')
  })

  test('layout has mobile sidebar overlay', () => {
    expect(layoutSource).toContain('aria-modal')
    expect(layoutSource).toContain('closeSidebar')
  })
})

// ── Sidebar collapse persistence ────────────────────
describe('App Shell: Collapse Persistence', () => {
  test('layout stores sidebar state in localStorage', () => {
    expect(layoutSource).toContain('corthex_sidebar_collapsed')
    expect(layoutSource).toContain('localStorage')
  })
})
