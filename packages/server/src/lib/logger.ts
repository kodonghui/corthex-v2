const isProd = process.env.NODE_ENV === 'production'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  if (isProd) {
    // 운영: JSON 포맷
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }))
  } else {
    // 개발: 컬러 텍스트 포맷
    const time = new Date().toTimeString().slice(0, 8)
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m',
    }
    const reset = '\x1b[0m'
    const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    console.log(`${colors[level]}[${time}] ${level.toUpperCase()}${reset} ${message}${metaStr}`)
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
}
