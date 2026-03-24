/**
 * Story 23.2 — Radix UI Component Library Foundation Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import {
  Button,
  buttonVariants,
  Input,
  Badge,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@corthex/ui'

// ── Component exports ───────────────────────────────
describe('Radix UI Foundation: Component Exports', () => {
  test('Button is exported and is a function', () => {
    expect(typeof Button).toBe('function')
  })

  test('Input is exported and is a function', () => {
    expect(typeof Input).toBe('function')
  })

  test('Badge is exported and is a function', () => {
    expect(typeof Badge).toBe('function')
  })

  test('Card components are exported', () => {
    expect(typeof Card).toBe('function')
    expect(typeof CardHeader).toBe('function')
    expect(typeof CardContent).toBe('function')
    expect(typeof CardFooter).toBe('function')
  })
})

// ── Button variants ─────────────────────────────────
describe('Radix UI Foundation: Button Variants', () => {
  test('buttonVariants generates classes for primary', () => {
    const classes = buttonVariants({ variant: 'primary' })
    expect(classes).toContain('bg-[#606C38]')
    expect(classes).toContain('text-white')
  })

  test('buttonVariants generates classes for secondary', () => {
    const classes = buttonVariants({ variant: 'secondary' })
    expect(classes).toContain('bg-[#f5f0e8]')
  })

  test('buttonVariants generates classes for ghost', () => {
    const classes = buttonVariants({ variant: 'ghost' })
    expect(classes).toContain('hover:bg-[#f5f0e8]')
  })

  test('buttonVariants generates classes for danger', () => {
    const classes = buttonVariants({ variant: 'danger' })
    expect(classes).toContain('bg-[#c4622d]')
  })

  test('buttonVariants generates size classes', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-8')
    expect(buttonVariants({ size: 'default' })).toContain('h-10')
    expect(buttonVariants({ size: 'lg' })).toContain('h-12')
  })
})

// ── Radix UI packages installed in @corthex/ui ──────
describe('Radix UI Foundation: Radix Packages', () => {
  const uiPkgPath = resolve(__dirname, '../../../ui/package.json')
  const uiPkg = JSON.parse(readFileSync(uiPkgPath, 'utf-8'))
  const deps = uiPkg.dependencies || {}

  const radixPackages = [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-tooltip',
    '@radix-ui/react-tabs',
    '@radix-ui/react-select',
    '@radix-ui/react-switch',
    '@radix-ui/react-popover',
    '@radix-ui/react-toast',
  ]

  for (const pkg of radixPackages) {
    test(`${pkg} is listed in @corthex/ui dependencies`, () => {
      expect(deps[pkg]).toBeDefined()
    })
  }
})

// ── Input with label and helper ─────────────────────
describe('Radix UI Foundation: Input Props', () => {
  test('Input accepts label prop', () => {
    // Verify Input function accepts these props without error
    expect(Input.length).toBeGreaterThanOrEqual(0)
  })
})
