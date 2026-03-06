import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../../db'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { getRecentErrors, getErrorCount24h } from '../../utils/error-counter'
import type { AppEnv } from '../../types'

export const monitoringRoute = new Hono<AppEnv>()

monitoringRoute.use('*', authMiddleware, adminOnly)

monitoringRoute.get('/monitoring/status', async (c) => {
  // 서버 정보
  const uptime = Math.floor(process.uptime())
  const runtime = typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`

  // 메모리 정보
  const mem = process.memoryUsage()
  const rss = Math.round(mem.rss / 1024 / 1024 * 10) / 10
  const heapUsed = Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10
  const heapTotal = Math.round(mem.heapTotal / 1024 / 1024 * 10) / 10
  const usagePercent = heapTotal > 0 ? Math.round(heapUsed / heapTotal * 1000) / 10 : 0

  // DB 상태
  let dbStatus = 'ok'
  let dbResponseTimeMs = 0
  try {
    const start = performance.now()
    await db.execute(sql`SELECT 1`)
    dbResponseTimeMs = Math.round(performance.now() - start)
  } catch {
    dbStatus = 'error'
  }

  // 에러 정보
  const count24h = getErrorCount24h()
  const recent = getRecentErrors(5).map((e) => ({
    timestamp: new Date(e.timestamp).toISOString(),
    message: e.message,
  }))

  return c.json({
    server: {
      status: 'ok',
      uptime,
      version: {
        build: process.env.BUILD_NUMBER || 'dev',
        hash: process.env.GITHUB_SHA?.slice(0, 7) || '',
        runtime,
      },
    },
    memory: { rss, heapUsed, heapTotal, usagePercent },
    db: { status: dbStatus, responseTimeMs: dbResponseTimeMs },
    errors: { count24h, recent },
  })
})
