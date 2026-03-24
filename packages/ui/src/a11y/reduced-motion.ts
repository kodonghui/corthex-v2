/**
 * Reduced motion support for accessibility.
 * CSS utility and runtime detection for prefers-reduced-motion.
 */

/** CSS class to apply reduced-motion-aware transitions */
export const motionSafeClasses = {
  transition: 'motion-safe:transition-all motion-safe:duration-200',
  animate: 'motion-safe:animate-spin',
  none: 'motion-reduce:transition-none motion-reduce:animate-none',
} as const

/** Check if the user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Get transition duration based on user preference */
export function getTransitionDuration(normalMs: number): number {
  return prefersReducedMotion() ? 0 : normalMs
}

/**
 * CSS to include for reduced motion support:
 *
 * @media (prefers-reduced-motion: reduce) {
 *   *, *::before, *::after {
 *     animation-duration: 0.01ms !important;
 *     animation-iteration-count: 1 !important;
 *     transition-duration: 0.01ms !important;
 *     scroll-behavior: auto !important;
 *   }
 * }
 */
export const reducedMotionCSS = `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`
