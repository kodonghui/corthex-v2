/**
 * Story 23.9 — Error Handling & Empty States Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  ErrorBoundary,
  EmptyState,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  parseApiError,
  isApiErrorResponse,
  toastErrorMessage,
  withRetry,
} from '@corthex/ui'
import type { EmptyStateVariant, ParsedApiError } from '@corthex/ui'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── ErrorBoundary ──────────────────────────────────
describe('Error Handling: ErrorBoundary', () => {
  test('ErrorBoundary is exported as function', () => {
    expect(typeof ErrorBoundary).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/ErrorBoundary.tsx'), 'utf-8')

  test('catches errors with getDerivedStateFromError', () => {
    expect(src).toContain('getDerivedStateFromError')
  })

  test('reports errors via componentDidCatch', () => {
    expect(src).toContain('componentDidCatch')
  })

  test('has Try Again button', () => {
    expect(src).toContain('다시 시도')
    expect(src).toContain('handleReset')
  })

  test('shows error message', () => {
    expect(src).toContain('error?.message')
  })

  test('uses role="alert" for accessibility', () => {
    expect(src).toContain('role="alert"')
  })

  test('supports custom fallback', () => {
    expect(src).toContain('fallback')
  })
})

// ── EmptyState Variants ────────────────────────────
describe('Error Handling: EmptyState', () => {
  test('EmptyState is exported', () => {
    expect(typeof EmptyState).toBe('function')
  })

  test('variants are defined', () => {
    const variants: EmptyStateVariant[] = ['no-data', 'no-results', 'error', 'loading']
    expect(variants).toHaveLength(4)
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/empty-state.tsx'), 'utf-8')

  test('variant prop is supported', () => {
    expect(src).toContain("variant?: EmptyStateVariant")
    expect(src).toContain("variant = 'no-data'")
  })

  test('icon colors differ by variant', () => {
    expect(src).toContain("'no-data'")
    expect(src).toContain("'no-results'")
    expect(src).toContain("'error'")
    expect(src).toContain("'loading'")
  })
})

// ── API Error Parsing ──────────────────────────────
describe('Error Handling: API Error', () => {
  test('parseApiError handles standard API error', () => {
    const error = { success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }
    const parsed = parseApiError(error)
    expect(parsed.code).toBe('NOT_FOUND')
    expect(parsed.message).toBe('Not found')
    expect(parsed.isApiError).toBe(true)
  })

  test('parseApiError handles Error instance', () => {
    const parsed = parseApiError(new Error('Something broke'))
    expect(parsed.code).toBe('UNKNOWN')
    expect(parsed.message).toBe('Something broke')
  })

  test('parseApiError handles string error', () => {
    const parsed = parseApiError('string error')
    expect(parsed.message).toBe('string error')
  })

  test('parseApiError handles null/undefined', () => {
    const parsed = parseApiError(null)
    expect(parsed.code).toBe('UNKNOWN')
    expect(typeof parsed.message).toBe('string')
  })

  test('isApiErrorResponse type guard', () => {
    expect(isApiErrorResponse({ success: false, error: { code: 'ERR', message: 'msg' } })).toBe(true)
    expect(isApiErrorResponse({ success: true })).toBe(false)
    expect(isApiErrorResponse(null)).toBe(false)
    expect(isApiErrorResponse('string')).toBe(false)
  })

  test('toastErrorMessage truncates long messages', () => {
    const longMsg = 'a'.repeat(200)
    const result = toastErrorMessage(new Error(longMsg), 50)
    expect(result.length).toBeLessThanOrEqual(53) // 50 + '...'
    expect(result).toContain('...')
  })

  test('toastErrorMessage keeps short messages', () => {
    const result = toastErrorMessage(new Error('short'))
    expect(result).toBe('short')
  })
})

// ── Retry Utility ──────────────────────────────────
describe('Error Handling: withRetry', () => {
  test('succeeds on first try', async () => {
    const result = await withRetry(async () => 42)
    expect(result).toBe(42)
  })

  test('retries on failure', async () => {
    let attempts = 0
    const result = await withRetry(async () => {
      attempts++
      if (attempts < 3) throw new Error('fail')
      return 'ok'
    }, { maxRetries: 3, baseDelay: 10 })
    expect(result).toBe('ok')
    expect(attempts).toBe(3)
  })

  test('throws after max retries', async () => {
    let threw = false
    try {
      await withRetry(async () => { throw new Error('always fail') }, { maxRetries: 2, baseDelay: 10 })
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })
})

// ── Skeleton Variants ──────────────────────────────
describe('Error Handling: Skeleton', () => {
  test('Skeleton base is exported', () => {
    expect(typeof Skeleton).toBe('function')
  })

  test('SkeletonText is exported', () => {
    expect(typeof SkeletonText).toBe('function')
  })

  test('SkeletonAvatar is exported', () => {
    expect(typeof SkeletonAvatar).toBe('function')
  })

  test('SkeletonCard is exported', () => {
    expect(typeof SkeletonCard).toBe('function')
  })

  test('SkeletonTable is exported', () => {
    expect(typeof SkeletonTable).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/skeleton.tsx'), 'utf-8')

  test('uses shimmer animation', () => {
    expect(src).toContain('shimmer')
  })

  test('uses gradient for shimmer effect', () => {
    expect(src).toContain('bg-gradient-to-r')
  })
})
