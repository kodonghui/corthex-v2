import pino from 'pino'

export interface Logger {
  info(obj: Record<string, unknown>, msg?: string): void
  warn(obj: Record<string, unknown>, msg?: string): void
  error(obj: Record<string, unknown>, msg?: string): void
  child(bindings: Record<string, unknown>): Logger
}

const rootLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
})

export function createLogger(): Logger {
  return rootLogger
}

export function createSessionLogger(ctx: {
  sessionId: string
  companyId: string
  agentId: string
}): Logger {
  return rootLogger.child(ctx)
}
