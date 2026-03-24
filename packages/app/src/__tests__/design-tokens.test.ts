/**
 * Story 23.1 — Design Token System Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  layout,
  tokens,
  tokensToCssProperties,
} from '@corthex/ui'

// ── Token structure ─────────────────────────────────
describe('Design Tokens: Structure', () => {
  test('tokens object contains all categories', () => {
    expect(tokens.colors).toBeDefined()
    expect(tokens.typography).toBeDefined()
    expect(tokens.spacing).toBeDefined()
    expect(tokens.borders).toBeDefined()
    expect(tokens.shadows).toBeDefined()
    expect(tokens.transitions).toBeDefined()
    expect(tokens.layout).toBeDefined()
  })

  test('colors has brand, semantic, neutral, text groups', () => {
    expect(colors.brand).toBeDefined()
    expect(colors.semantic).toBeDefined()
    expect(colors.neutral).toBeDefined()
    expect(colors.text).toBeDefined()
  })
})

// ── Brand colors ────────────────────────────────────
describe('Design Tokens: Brand Colors', () => {
  test('cream color is defined', () => {
    expect(colors.brand.cream).toBe('#faf8f5')
  })

  test('olive colors are defined', () => {
    expect(colors.brand.olive).toBe('#283618')
    expect(colors.brand.oliveLight).toBe('#5a7247')
    expect(colors.brand.oliveAccent).toBe('#606C38')
  })

  test('sand color is defined', () => {
    expect(colors.brand.sand).toBe('#e5e1d3')
  })
})

// ── Semantic colors ─────────────────────────────────
describe('Design Tokens: Semantic Colors', () => {
  test('all semantic colors are valid hex', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    expect(colors.semantic.success).toMatch(hexRegex)
    expect(colors.semantic.warning).toMatch(hexRegex)
    expect(colors.semantic.error).toMatch(hexRegex)
    expect(colors.semantic.info).toMatch(hexRegex)
    expect(colors.semantic.handoff).toMatch(hexRegex)
  })
})

// ── Neutral scale ───────────────────────────────────
describe('Design Tokens: Neutral Scale', () => {
  test('neutral scale has all expected stops', () => {
    const stops = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    for (const stop of stops) {
      expect((colors.neutral as Record<number, string>)[stop]).toBeDefined()
    }
  })

  test('all neutral values are valid hex', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    for (const value of Object.values(colors.neutral)) {
      expect(value).toMatch(hexRegex)
    }
  })
})

// ── Typography ──────────────────────────────────────
describe('Design Tokens: Typography', () => {
  test('font families include Inter and JetBrains Mono', () => {
    expect(typography.fontFamily.body).toContain('Inter')
    expect(typography.fontFamily.mono).toContain('JetBrains Mono')
  })

  test('font size scale from xs to 4xl', () => {
    const sizes = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const
    for (const size of sizes) {
      expect(typography.fontSize[size]).toBeDefined()
      expect(typography.fontSize[size]).toMatch(/rem$/)
    }
  })
})

// ── Spacing ─────────────────────────────────────────
describe('Design Tokens: Spacing', () => {
  test('base unit is 4px', () => {
    expect(spacing[1]).toBe('4px')
  })

  test('spacing values are valid px strings', () => {
    for (const value of Object.values(spacing)) {
      expect(value).toMatch(/^\d+px$/)
    }
  })
})

// ── Borders ─────────────────────────────────────────
describe('Design Tokens: Borders', () => {
  test('radius scale is defined', () => {
    expect(borders.radius.sm).toBe('4px')
    expect(borders.radius.md).toBe('8px')
    expect(borders.radius.lg).toBe('12px')
    expect(borders.radius.full).toBe('9999px')
  })

  test('border widths are defined', () => {
    expect(borders.width.thin).toBe('1px')
    expect(borders.width.medium).toBe('2px')
  })
})

// ── Shadows ─────────────────────────────────────────
describe('Design Tokens: Shadows', () => {
  test('all shadow levels are defined', () => {
    expect(shadows.sm).toBeDefined()
    expect(shadows.md).toBeDefined()
    expect(shadows.lg).toBeDefined()
    expect(shadows.xl).toBeDefined()
  })
})

// ── Transitions ─────────────────────────────────────
describe('Design Tokens: Transitions', () => {
  test('duration values', () => {
    expect(transitions.duration.fast).toBe('150ms')
    expect(transitions.duration.normal).toBe('200ms')
    expect(transitions.duration.slow).toBe('300ms')
  })
})

// ── Layout ──────────────────────────────────────────
describe('Design Tokens: Layout', () => {
  test('layout constants are defined', () => {
    expect(layout.sidebarWidth).toBe('280px')
    expect(layout.topbarHeight).toBe('56px')
  })
})

// ── CSS Custom Properties ───────────────────────────
describe('Design Tokens: CSS Properties', () => {
  test('tokensToCssProperties returns flat object', () => {
    const props = tokensToCssProperties()
    expect(typeof props).toBe('object')
    // Should include color tokens
    expect(props['--corthex-color-brand-cream']).toBe('#faf8f5')
    expect(props['--corthex-color-brand-olive']).toBe('#283618')
    // Should include spacing
    expect(props['--corthex-spacing-1']).toBe('4px')
  })
})
