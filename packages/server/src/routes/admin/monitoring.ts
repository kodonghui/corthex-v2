import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../../db'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { getRecentErrors, getErrorCount24h } from '../../utils/error-counter'
import type { AppEnv } from '../../types'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const monitoringRoute = new Hono<AppEnv>()

monitoringRoute.use('*', authMiddleware, adminOnly)

// POST /api/admin/monitoring/run-recovery — Force run recovery migration SQL
monitoringRoute.post('/monitoring/run-recovery', async (c) => {
  const results: string[] = []
  try {
    const migPath = resolve(import.meta.dir, '../../db/migrations/0058_recovery-missing-tables.sql')
    const migSql = readFileSync(migPath, 'utf-8')
    // Split by statement-breakpoint and run each
    const statements = migSql.split('--> statement-breakpoint').map(s => s.replace(/--.*$/gm, '').trim()).filter(Boolean)
    for (const stmt of statements) {
      try {
        await db.execute(sql.raw(stmt))
        results.push(`OK: ${stmt.slice(0, 60)}...`)
      } catch (err) {
        results.push(`SKIP: ${(err as Error).message.slice(0, 80)} — ${stmt.slice(0, 40)}...`)
      }
    }
    return c.json({ success: true, data: { executed: results.length, results } })
  } catch (err) {
    return c.json({ success: false, error: { message: (err as Error).message } }, 500)
  }
})

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
