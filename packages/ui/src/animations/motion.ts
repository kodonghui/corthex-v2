/**
 * Motion utilities that respect prefers-reduced-motion.
 * Wraps animation classes with motion-safe/motion-reduce variants.
 */
import { prefersReducedMotion } from '../a11y/reduced-motion'

/**
 * Returns the animation class only if user hasn't requested reduced motion.
 * Falls back to instant transition otherwise.
 */
export function motionSafe(animationClass: string, fallback: string = ''): string {
  return prefersReducedMotion() ? fallback : animationClass
}

/** Motion-safe wrapper for Tailwind classes */
export const motion = {
  /** Fade in animation */
  fadeIn: 'motion-safe:animate-[fadeIn_200ms_ease-out] motion-reduce:animate-none',
  /** Fade out animation */
  fadeOut: 'motion-safe:animate-[fadeOut_150ms_ease-in] motion-reduce:animate-none',
  /** Slide up animation */
  slideUp: 'motion-safe:animate-[slideUp_200ms_ease-out] motion-reduce:animate-none',
  /** Slide down animation */
  slideDown: 'motion-safe:animate-[slideDown_200ms_ease-out] motion-reduce:animate-none',
  /** Scale in animation */
  scaleIn: 'motion-safe:animate-[scaleIn_150ms_ease-out] motion-reduce:animate-none',
  /** Pulse animation */
  pulse: 'motion-safe:animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none',
  /** Shimmer loading animation */
  shimmer: 'motion-safe:animate-[shimmer_1.5s_ease-in-out_infinite] motion-reduce:animate-none',
} as const

/** Check if animations should be enabled */
export function shouldAnimate(): boolean {
  return !prefersReducedMotion()
}

/** Get animation duration, returns 0 if reduced motion */
export function getAnimationDuration(ms: number): number {
  return prefersReducedMotion() ? 0 : ms
}
