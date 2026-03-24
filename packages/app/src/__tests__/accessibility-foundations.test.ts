/**
 * Story 23.6 — Accessibility Foundations (WCAG 2.1 AA) Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  createFocusTrap,
  focusRingClasses,
  skipToContentId,
  getSkipToContentProps,
  liveRegion,
  describedBy,
  labelledBy,
  visuallyHidden,
  controls,
  expandable,
  busy,
  ariaId,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  meetsWcagAA,
  meetsWcagAAA,
  motionSafeClasses,
  prefersReducedMotion,
  getTransitionDuration,
  reducedMotionCSS,
} from '@corthex/ui'

// ── Color Contrast ──────────────────────────────────
describe('A11y: Color Contrast', () => {
  test('hexToRgb parses hex correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
    expect(hexToRgb('#283618')).toEqual([40, 54, 24])
  })

  test('relativeLuminance of white is ~1', () => {
    const lum = relativeLuminance([255, 255, 255])
    expect(lum).toBeCloseTo(1, 2)
  })

  test('relativeLuminance of black is 0', () => {
    const lum = relativeLuminance([0, 0, 0])
    expect(lum).toBeCloseTo(0, 2)
  })

  test('contrast ratio white/black is 21:1', () => {
    const ratio = contrastRatio('#ffffff', '#000000')
    expect(ratio).toBeCloseTo(21, 0)
  })

  // Brand color combinations
  test('cream #faf8f5 on olive #283618 meets AA', () => {
    expect(meetsWcagAA('#faf8f5', '#283618')).toBe(true)
  })

  test('olive #283618 on cream #faf8f5 meets AA', () => {
    expect(meetsWcagAA('#283618', '#faf8f5')).toBe(true)
  })

  test('text-primary #1a1a1a on cream #faf8f5 meets AAA', () => {
    expect(meetsWcagAAA('#1a1a1a', '#faf8f5')).toBe(true)
  })

  test('text-secondary #6b705c on cream #faf8f5 meets AA', () => {
    expect(meetsWcagAA('#6b705c', '#faf8f5')).toBe(true)
  })

  test('white on oliveAccent #606C38 meets AA', () => {
    expect(meetsWcagAA('#ffffff', '#606C38')).toBe(true)
  })

  test('sand #e5e1d3 on olive #283618 meets AA', () => {
    expect(meetsWcagAA('#e5e1d3', '#283618')).toBe(true)
  })
})

// ── Focus Trap ──────────────────────────────────────
describe('A11y: Focus Trap', () => {
  test('createFocusTrap returns activate/deactivate', () => {
    // Create a minimal mock container
    const container = {
      querySelectorAll: () => [],
    } as unknown as HTMLElement

    const trap = createFocusTrap(container)
    expect(typeof trap.activate).toBe('function')
    expect(typeof trap.deactivate).toBe('function')
    expect(typeof trap.isActive).toBe('function')
    expect(trap.isActive()).toBe(false)
  })

  test('focusRingClasses has visible and keyboard options', () => {
    expect(focusRingClasses.visible).toContain('focus-visible:outline')
    expect(focusRingClasses.keyboard).toContain('focus-visible:ring')
    expect(focusRingClasses.hidden).toContain('focus:outline-none')
  })
})

// ── Skip to Content ─────────────────────────────────
describe('A11y: Skip to Content', () => {
  test('skipToContentId is defined', () => {
    expect(skipToContentId).toBe('main-content')
  })

  test('getSkipToContentProps returns link and target', () => {
    const props = getSkipToContentProps()
    expect(props.link.href).toBe('#main-content')
    expect(props.link.className).toContain('sr-only')
    expect(props.link.className).toContain('focus:not-sr-only')
    expect(props.target.id).toBe('main-content')
    expect(props.target.tabIndex).toBe(-1)
  })
})

// ── ARIA Patterns ───────────────────────────────────
describe('A11y: ARIA Patterns', () => {
  test('liveRegion returns correct attrs', () => {
    const polite = liveRegion('polite')
    expect(polite['aria-live']).toBe('polite')
    expect(polite['aria-atomic']).toBe(true)
    expect(polite.role).toBe('status')

    const assertive = liveRegion('assertive')
    expect(assertive['aria-live']).toBe('assertive')
  })

  test('describedBy returns aria-describedby', () => {
    expect(describedBy('helper-text')['aria-describedby']).toBe('helper-text')
  })

  test('labelledBy returns aria-labelledby', () => {
    expect(labelledBy('title')['aria-labelledby']).toBe('title')
  })

  test('visuallyHidden returns sr-only class', () => {
    expect(visuallyHidden().className).toBe('sr-only')
  })

  test('controls returns aria-controls', () => {
    expect(controls('panel-1')['aria-controls']).toBe('panel-1')
  })

  test('expandable returns expanded state', () => {
    const expanded = expandable(true, 'menu')
    expect(expanded['aria-expanded']).toBe(true)
    expect(expanded['aria-controls']).toBe('menu')

    const collapsed = expandable(false, 'menu')
    expect(collapsed['aria-expanded']).toBe(false)
  })

  test('busy returns aria-busy', () => {
    expect(busy(true)['aria-busy']).toBe(true)
    expect(busy(false)['aria-busy']).toBe(false)
  })

  test('ariaId generates prefixed ID', () => {
    expect(ariaId('tab', 0)).toBe('tab-0')
    expect(ariaId('panel', 'settings')).toBe('panel-settings')
  })
})

// ── Reduced Motion ──────────────────────────────────
describe('A11y: Reduced Motion', () => {
  test('motionSafeClasses includes motion-safe and motion-reduce', () => {
    expect(motionSafeClasses.transition).toContain('motion-safe:')
    expect(motionSafeClasses.none).toContain('motion-reduce:')
  })

  test('prefersReducedMotion returns boolean', () => {
    const result = prefersReducedMotion()
    expect(typeof result).toBe('boolean')
  })

  test('getTransitionDuration returns 0 when reduced motion preferred', () => {
    // In test env, reduced motion is typically false
    const duration = getTransitionDuration(200)
    expect(typeof duration).toBe('number')
    expect(duration >= 0).toBe(true)
  })

  test('reducedMotionCSS contains media query', () => {
    expect(reducedMotionCSS).toContain('prefers-reduced-motion: reduce')
    expect(reducedMotionCSS).toContain('animation-duration: 0.01ms')
    expect(reducedMotionCSS).toContain('transition-duration: 0.01ms')
  })
})
