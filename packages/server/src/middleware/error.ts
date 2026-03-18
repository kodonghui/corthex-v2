import type { ErrorHandler } from 'hono'
import type { ApiError } from '@corthex/shared'
import { recordError } from '../utils/error-counter'

export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('❌ Error:', err.message)

  const status = err instanceof HTTPError ? err.status : 500
  if (status >= 500) {
    recordError(err instanceof Error ? err.message : 'Unknown error')
  }

  const response: ApiError = {
    error: {
      code: err instanceof HTTPError ? (err.code ?? 'ERROR') : 'INTERNAL_ERROR',
      message: err instanceof HTTPError
        ? err.message
        : '서버 내부 오류가 발생했습니다',
    },
  }

  return c.json(response, status as any)
}
