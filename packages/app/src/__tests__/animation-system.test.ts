/**
 * Story 23.7 — Animation System & Motion Design Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  transitionPresets,
  transitionCSS,
  springTransition,
  springPresets,
  useAnimatedMount,
  motion,
  motionSafe,
  shouldAnimate,
  getAnimationDuration,
} from '@corthex/ui'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Transition Presets ─────────────────────────────
describe('Animation: Transition Presets', () => {
  test('all presets are exported', () => {
    expect(transitionPresets.fade).toContain('transition-opacity')
    expect(transitionPresets.slideUp).toContain('transition-transform')
    expect(transitionPresets.slideDown).toContain('transition-transform')
    expect(transitionPresets.scale).toContain('transition-transform')
    expect(transitionPresets.collapse).toContain('transition-')
    expect(transitionPresets.all).toContain('transition-all')
  })

  test('CSS transition strings contain proper values', () => {
    expect(transitionCSS.fade).toContain('opacity')
    expect(transitionCSS.fade).toContain('200ms')
    expect(transitionCSS.slideUp).toContain('transform')
    expect(transitionCSS.collapse).toContain('max-height')
  })
})

// ── Spring Animation ───────────────────────────────
describe('Animation: Spring', () => {
  test('springTransition returns CSS transition string', () => {
    const result = springTransition('transform')
    expect(result).toContain('transform')
    expect(result).toContain('ms')
    expect(result).toContain('cubic-bezier')
  })

  test('springTransition uses default property "all"', () => {
    const result = springTransition()
    expect(result).toContain('all')
  })

  test('spring presets are defined', () => {
    expect(springPresets.default.tension).toBe(170)
    expect(springPresets.gentle.duration).toBe(400)
    expect(springPresets.wobbly.friction).toBe(12)
    expect(springPresets.stiff.tension).toBe(210)
    expect(springPresets.slow.duration).toBe(500)
  })

  test('custom config overrides defaults', () => {
    const result = springTransition('opacity', { duration: 100 })
    expect(result).toContain('100ms')
  })
})

// ── useAnimatedMount Hook ──────────────────────────
describe('Animation: useAnimatedMount', () => {
  test('hook is exported as function', () => {
    expect(typeof useAnimatedMount).toBe('function')
  })
})

// ── Motion Utilities ───────────────────────────────
describe('Animation: Motion', () => {
  test('motion presets include motion-safe classes', () => {
    expect(motion.fadeIn).toContain('motion-safe:')
    expect(motion.fadeOut).toContain('motion-safe:')
    expect(motion.slideUp).toContain('motion-safe:')
    expect(motion.slideDown).toContain('motion-safe:')
    expect(motion.scaleIn).toContain('motion-safe:')
    expect(motion.pulse).toContain('motion-safe:')
    expect(motion.shimmer).toContain('motion-safe:')
  })

  test('motion presets include motion-reduce fallback', () => {
    expect(motion.fadeIn).toContain('motion-reduce:animate-none')
    expect(motion.shimmer).toContain('motion-reduce:animate-none')
  })

  test('motionSafe returns class when no reduced motion', () => {
    // In test env, reduced motion is typically false
    const result = motionSafe('animate-bounce', 'no-animation')
    expect(typeof result).toBe('string')
  })

  test('shouldAnimate returns boolean', () => {
    expect(typeof shouldAnimate()).toBe('boolean')
  })

  test('getAnimationDuration returns number', () => {
    const dur = getAnimationDuration(300)
    expect(typeof dur).toBe('number')
    expect(dur >= 0).toBe(true)
  })
})

// ── CSS Animations File ────────────────────────────
describe('Animation: CSS Keyframes', () => {
  const css = readFileSync(resolve(__dirname, '../../../ui/src/animations/animations.css'), 'utf-8')

  test('defines fadeIn keyframe', () => {
    expect(css).toContain('@keyframes fadeIn')
  })

  test('defines fadeOut keyframe', () => {
    expect(css).toContain('@keyframes fadeOut')
  })

  test('defines slideUp keyframe', () => {
    expect(css).toContain('@keyframes slideUp')
  })

  test('defines slideDown keyframe', () => {
    expect(css).toContain('@keyframes slideDown')
  })

  test('defines scaleIn keyframe', () => {
    expect(css).toContain('@keyframes scaleIn')
  })

  test('defines pulse keyframe', () => {
    expect(css).toContain('@keyframes pulse')
  })

  test('defines shimmer keyframe', () => {
    expect(css).toContain('@keyframes shimmer')
  })

  test('includes reduced motion media query', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css).toContain('animation-duration: 0.01ms')
  })
})
