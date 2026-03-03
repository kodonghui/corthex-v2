import type { MiddlewareHandler } from 'hono'
import type { ApiError } from '@corthex/shared'

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (err) {
    console.error('❌ Unhandled error:', err)

    const status = err instanceof HTTPError ? err.status : 500
    const response: ApiError = {
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    }

    return c.json(response, status as any)
  }
}

export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}
