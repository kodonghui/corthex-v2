// Legacy Subframe utility — replaced with plain implementation
// This file is part of the legacy ui/ directory (unused by main app, which uses @corthex/ui)

type ClassValue = string | boolean | undefined | null | Record<string, boolean>

function resolveClass(v: ClassValue): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    return Object.entries(v).filter(([, val]) => val).map(([key]) => key).join(' ')
  }
  return ''
}

export function twClassNames(...args: ClassValue[]): string {
  return args.map(resolveClass).filter(Boolean).join(' ')
}
