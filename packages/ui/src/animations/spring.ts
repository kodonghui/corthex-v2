/**
 * Simple spring animation helper for React state transitions.
 * Uses CSS transitions with spring-like easing curves.
 */

export type SpringConfig = {
  /** Tension (higher = snappier), default 170 */
  tension?: number
  /** Friction (higher = less bouncy), default 26 */
  friction?: number
  /** Duration override in ms, default auto-calculated */
  duration?: number
}

const defaultConfig: Required<SpringConfig> = {
  tension: 170,
  friction: 26,
  duration: 300,
}

/**
 * Generate a CSS cubic-bezier approximation of a spring curve.
 * Returns a CSS transition string.
 */
export function springTransition(
  property: string = 'all',
  config: SpringConfig = {},
): string {
  const { tension, friction, duration } = { ...defaultConfig, ...config }
  // Approximate spring as cubic-bezier based on tension/friction ratio
  const dampingRatio = friction / (2 * Math.sqrt(tension))
  const p1 = Math.max(0, Math.min(1, 0.5 - dampingRatio * 0.3))
  const p2 = Math.max(0, Math.min(1, 0.5 + dampingRatio * 0.3))
  return `${property} ${duration}ms cubic-bezier(${p1.toFixed(3)}, 0, ${p2.toFixed(3)}, 1)`
}

/** Preset spring configs */
export const springPresets = {
  /** Default — balanced animation */
  default: { tension: 170, friction: 26 },
  /** Gentle — slow and smooth */
  gentle: { tension: 120, friction: 14, duration: 400 },
  /** Wobbly — bouncy feel */
  wobbly: { tension: 180, friction: 12, duration: 350 },
  /** Stiff — snappy, minimal overshoot */
  stiff: { tension: 210, friction: 20, duration: 200 },
  /** Slow — deliberate, for page transitions */
  slow: { tension: 100, friction: 30, duration: 500 },
} as const satisfies Record<string, SpringConfig>

export type SpringPreset = keyof typeof springPresets
