/**
 * Story 23.5 — Responsive Layout Types Implementation Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  StackLayout,
  SplitLayout,
  SplitLayoutSide,
  SplitLayoutMain,
  GridLayout,
  DashboardLayout,
  DashboardWidget,
} from '@corthex/ui'

// ── Layout exports ──────────────────────────────────
describe('Responsive Layouts: Exports', () => {
  test('StackLayout is exported', () => {
    expect(typeof StackLayout).toBe('function')
  })

  test('SplitLayout components are exported', () => {
    expect(typeof SplitLayout).toBe('function')
    expect(typeof SplitLayoutSide).toBe('function')
    expect(typeof SplitLayoutMain).toBe('function')
  })

  test('GridLayout is exported', () => {
    expect(typeof GridLayout).toBe('function')
  })

  test('DashboardLayout components are exported', () => {
    expect(typeof DashboardLayout).toBe('function')
    expect(typeof DashboardWidget).toBe('function')
  })
})

// ── Layout source validation ────────────────────────
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Responsive Layouts: StackLayout', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/layouts/stack-layout.tsx'), 'utf-8')

  test('supports gap prop', () => {
    expect(src).toContain("gap?: 'none' | 'sm' | 'md' | 'lg'")
  })

  test('supports padding prop', () => {
    expect(src).toContain("padding?: 'none' | 'sm' | 'md' | 'lg'")
  })

  test('supports maxWidth prop', () => {
    expect(src).toContain("maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'")
  })

  test('renders as flex column', () => {
    expect(src).toContain('flex flex-col')
  })
})

describe('Responsive Layouts: SplitLayout', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/layouts/split-layout.tsx'), 'utf-8')

  test('collapses to column on mobile', () => {
    expect(src).toContain('flex-col md:flex-row')
  })

  test('side panel has configurable width', () => {
    expect(src).toContain('--split-side-width')
  })
})

describe('Responsive Layouts: GridLayout', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/layouts/grid-layout.tsx'), 'utf-8')

  test('supports 1-4 columns', () => {
    expect(src).toContain("columns?: 1 | 2 | 3 | 4")
  })

  test('responsive grid columns', () => {
    expect(src).toContain('grid-cols-1')
    expect(src).toContain('sm:grid-cols-2')
    expect(src).toContain('lg:grid-cols-3')
  })
})

describe('Responsive Layouts: DashboardLayout', () => {
  const src = readFileSync(resolve(__dirname, '../../../ui/src/layouts/dashboard-layout.tsx'), 'utf-8')

  test('responsive widget grid', () => {
    expect(src).toContain('grid-cols-1 md:grid-cols-2 xl:grid-cols-3')
  })

  test('widget supports col span', () => {
    expect(src).toContain("span?: 1 | 2 | 3")
    expect(src).toContain('md:col-span-2')
  })

  test('widget supports row span', () => {
    expect(src).toContain("rowSpan?: 1 | 2")
    expect(src).toContain('row-span-2')
  })
})
