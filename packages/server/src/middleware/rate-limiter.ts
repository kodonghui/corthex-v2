import type { MiddlewareHandler } from 'hono'
import { ERROR_CODES } from '../lib/error-codes'

const MAX_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '20', 10)
const activeSessions = new Map<string, number>()

export function acquireSession(sessionId: string): boolean {
  if (activeSessions.size >= MAX_SESSIONS && !activeSessions.has(sessionId)) {
    return false
  }
  activeSessions.set(sessionId, Date.now())
  return true
}

export function releaseSession(sessionId: string): void {
  activeSessions.delete(sessionId)
}

export function getActiveSessionCount(): number {
  return activeSessions.size
}

export const sessionLimiter = (): MiddlewareHandler => {
  return async (c, next) => {
    const sessionId = c.req.header('x-session-id')
    if (sessionId && !acquireSession(sessionId)) {
      return c.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.SESSION_LIMIT_EXCEEDED,
            message: `Concurrent session limit (${MAX_SESSIONS}) exceeded`,
          },
        },
        429,
      )
    }
    return next()
  }
}
