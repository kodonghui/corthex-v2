/**
 * Standardized API error handling.
 * Parses { success: false, error: { code, message } } format.
 */

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface ParsedApiError {
  code: string
  message: string
  isApiError: true
}

/**
 * Parse an API error response into a friendly error object.
 */
export function parseApiError(error: unknown): ParsedApiError {
  // Standard API error shape
  if (isApiErrorResponse(error)) {
    return {
      code: error.error.code,
      message: error.error.message,
      isApiError: true,
    }
  }

  // Error instance
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
      isApiError: true,
    }
  }

  // String error
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
      isApiError: true,
    }
  }

  return {
    code: 'UNKNOWN',
    message: '알 수 없는 오류가 발생했습니다.',
    isApiError: true,
  }
}

/** Type guard for API error response */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  if (obj.success !== false) return false
  if (typeof obj.error !== 'object' || obj.error === null) return false
  const err = obj.error as Record<string, unknown>
  return typeof err.code === 'string' && typeof err.message === 'string'
}

/** Toast-friendly error message (truncated) */
export function toastErrorMessage(error: unknown, maxLength: number = 100): string {
  const parsed = parseApiError(error)
  const msg = parsed.message
  return msg.length > maxLength ? msg.slice(0, maxLength) + '...' : msg
}

/** Retry utility with exponential backoff */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Unreachable, but satisfies TypeScript
  throw new Error('Retry exhausted')
}
