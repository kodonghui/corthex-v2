/**
 * CSS transition presets using design tokens.
 * Each preset returns a Tailwind-compatible class string.
 */

export const transitionPresets = {
  /** Fade in/out opacity */
  fade: 'transition-opacity duration-200 ease-out',
  /** Slide from bottom */
  slideUp: 'transition-transform duration-200 ease-out',
  /** Slide from top */
  slideDown: 'transition-transform duration-200 ease-out',
  /** Scale from 95% to 100% */
  scale: 'transition-transform duration-150 ease-out',
  /** Collapse height (for accordions) */
  collapse: 'transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden',
  /** All properties (general purpose) */
  all: 'transition-all duration-200 ease-out',
} as const

/** CSS transition strings for inline style usage */
export const transitionCSS = {
  fade: 'opacity 200ms cubic-bezier(0, 0, 0.2, 1)',
  slideUp: 'transform 200ms cubic-bezier(0, 0, 0.2, 1)',
  slideDown: 'transform 200ms cubic-bezier(0, 0, 0.2, 1)',
  scale: 'transform 150ms cubic-bezier(0, 0, 0.2, 1)',
  collapse: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  all: 'all 200ms cubic-bezier(0, 0, 0.2, 1)',
} as const

export type TransitionPreset = keyof typeof transitionPresets
