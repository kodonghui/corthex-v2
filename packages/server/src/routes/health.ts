import { Hono } from 'hono'
import { db } from '../db'
import { sql } from 'drizzle-orm'

export const healthRoute = new Hono()

healthRoute.get('/health', async (c) => {
  let dbOk = false
  try {
    await db.execute(sql`SELECT 1`)
    dbOk = true
  } catch { /* db not available */ }

  return c.json({
    status: 'ok',
    checks: { db: dbOk },
    version: {
      build: process.env.BUILD_NUMBER || 'dev',
      hash: process.env.GITHUB_SHA?.slice(0, 7) || '',
      uptime: Math.floor(process.uptime()),
    },
  })
})
