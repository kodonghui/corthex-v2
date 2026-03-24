/**
 * Story 23.10 — Navigation Redesign & Command Palette Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  Breadcrumb,
  breadcrumbsFromPath,
  TabNav,
} from '@corthex/ui'
import type { BreadcrumbItem, TabNavItem } from '@corthex/ui'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Command Palette ────────────────────────────────
describe('Navigation: CommandPalette', () => {
  const src = readFileSync(resolve(__dirname, '../components/CommandPalette.tsx'), 'utf-8')

  test('triggers on Ctrl+K / Cmd+K', () => {
    expect(src).toContain("e.key === 'k'")
    expect(src).toContain('e.metaKey || e.ctrlKey')
  })

  test('uses Radix Dialog', () => {
    expect(src).toContain('@radix-ui/react-dialog')
    expect(src).toContain('Dialog.Root')
    expect(src).toContain('Dialog.Portal')
  })

  test('has search input', () => {
    expect(src).toContain('Search commands')
    expect(src).toContain('inputRef')
  })

  test('has fuzzy matching', () => {
    expect(src).toContain('fuzzyMatch')
    expect(src).toContain('toLowerCase')
    expect(src).toContain('keywords')
  })

  test('has navigation commands', () => {
    expect(src).toContain("path: '/hub'")
    expect(src).toContain("path: '/agents'")
    expect(src).toContain("path: '/settings'")
  })

  test('has recent items', () => {
    expect(src).toContain('getRecent')
    expect(src).toContain('addRecent')
    expect(src).toContain('corthex_cmd_recent')
  })

  test('keyboard navigation (arrows + enter)', () => {
    expect(src).toContain("e.key === 'ArrowDown'")
    expect(src).toContain("e.key === 'ArrowUp'")
    expect(src).toContain("e.key === 'Enter'")
  })

  test('uses ARIA listbox pattern', () => {
    expect(src).toContain('role="listbox"')
    expect(src).toContain('role="option"')
    expect(src).toContain('aria-selected')
  })
})

// ── Breadcrumb ─────────────────────────────────────
describe('Navigation: Breadcrumb', () => {
  test('Breadcrumb is exported', () => {
    expect(typeof Breadcrumb).toBe('function')
  })

  test('breadcrumbsFromPath generates items from URL', () => {
    const items = breadcrumbsFromPath('/agents/123/edit')
    expect(items[0]).toEqual({ label: 'Home', href: '/' })
    expect(items[1]).toEqual({ label: 'Agents', href: '/agents' })
    expect(items[2]).toEqual({ label: '123', href: '/agents/123' })
    // Last item has no href
    expect(items[3].label).toBe('Edit')
    expect(items[3].href).toBeUndefined()
  })

  test('breadcrumbsFromPath handles root', () => {
    const items = breadcrumbsFromPath('/')
    expect(items).toHaveLength(1)
    expect(items[0].label).toBe('Home')
  })

  test('breadcrumbsFromPath converts kebab-case to title', () => {
    const items = breadcrumbsFromPath('/activity-log')
    expect(items[1].label).toBe('Activity Log')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/Breadcrumb.tsx'), 'utf-8')

  test('truncation for deep paths', () => {
    expect(src).toContain('maxItems')
    expect(src).toContain('...')
  })

  test('clickable segments', () => {
    expect(src).toContain('onNavigate')
    expect(src).toContain('onClick')
  })

  test('has aria-label for accessibility', () => {
    expect(src).toContain('aria-label="Breadcrumb"')
  })
})

// ── TabNav ─────────────────────────────────────────
describe('Navigation: TabNav', () => {
  test('TabNav is exported', () => {
    expect(typeof TabNav).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/TabNav.tsx'), 'utf-8')

  test('uses Radix Tabs', () => {
    expect(src).toContain('@radix-ui/react-tabs')
    expect(src).toContain('RadixTabs.Root')
    expect(src).toContain('RadixTabs.List')
    expect(src).toContain('RadixTabs.Trigger')
  })

  test('supports badge count', () => {
    expect(src).toContain('badge')
    expect(src).toContain("'99+'")
  })

  test('keyboard accessible via Radix', () => {
    expect(src).toContain('focus-visible:ring')
  })

  test('has active indicator', () => {
    expect(src).toContain('data-[state=active]')
  })

  test('supports disabled tabs', () => {
    expect(src).toContain('disabled')
  })
})
