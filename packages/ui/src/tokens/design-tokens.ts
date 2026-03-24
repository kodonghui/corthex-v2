/**
 * CORTHEX Design Token System — Natural Organic Theme
 * Single source of truth for all design values.
 * Exported as both JS objects and CSS custom property generators.
 */

// ── Colors ──────────────────────────────────────────
export const colors = {
  brand: {
    cream: '#faf8f5',
    olive: '#283618',
    oliveLight: '#5a7247',
    oliveAccent: '#606C38',
    oliveHover: '#7a8f5a',
    sand: '#e5e1d3',
    sandDark: '#d4cfc4',
    elevated: '#f5f0e8',
    nexusBg: '#f0ebe0',
  },
  semantic: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#c4622d',
    info: '#60A5FA',
    handoff: '#A78BFA',
  },
  neutral: {
    0: '#ffffff',
    50: '#faf8f5',
    100: '#f5f0e8',
    200: '#e5e1d3',
    300: '#d4cfc4',
    400: '#a3a08e',
    500: '#6b705c',
    600: '#555a49',
    700: '#404437',
    800: '#2b2e25',
    900: '#1a1a1a',
    950: '#0f0f0c',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#6b705c',
    disabled: '#a3a08e',
    onAccent: '#ffffff',
  },
} as const

// ── Typography ──────────────────────────────────────
export const typography = {
  fontFamily: {
    body: "'Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.8125rem',   // 13px
    base: '0.875rem',  // 14px
    md: '1rem',        // 16px
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    '3xl': '2.5rem',   // 40px
    '4xl': '3rem',     // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const

// ── Spacing (4px base unit) ─────────────────────────
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// ── Borders ─────────────────────────────────────────
export const borders = {
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  width: {
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
} as const

// ── Shadows ─────────────────────────────────────────
export const shadows = {
  sm: '0px 1px 2px 0px rgb(0 0 0 / 0.05)',
  md: '0px 4px 6px -1px rgb(0 0 0 / 0.08)',
  lg: '0px 10px 15px -3px rgb(0 0 0 / 0.08)',
  xl: '0px 25px 50px -12px rgb(0 0 0 / 0.15)',
  glow: '0 0 20px rgba(96, 108, 56, 0.10)',
} as const

// ── Transitions ─────────────────────────────────────
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ── Layout ──────────────────────────────────────────
export const layout = {
  sidebarWidth: '280px',
  sidebarCollapsed: '64px',
  topbarHeight: '56px',
  contentMax: '1160px',
} as const

// ── All tokens combined ─────────────────────────────
export const tokens = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  layout,
} as const

// ── CSS Custom Properties generator ─────────────────
function flattenObj(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const propName = prefix ? `${prefix}-${key}` : key
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObj(value as Record<string, unknown>, propName))
    } else {
      result[propName] = String(value)
    }
  }
  return result
}

export function tokensToCssProperties(): Record<string, string> {
  return flattenObj({
    color: colors,
    font: typography.fontFamily,
    'font-size': typography.fontSize,
    spacing,
    radius: borders.radius,
    shadow: shadows,
    duration: transitions.duration,
  }, '--corthex')
}

export type DesignTokens = typeof tokens
