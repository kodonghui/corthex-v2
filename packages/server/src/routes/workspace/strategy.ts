import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { strategyWatchlists } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const strategyRoute = new Hono<AppEnv>()

strategyRoute.use('*', authMiddleware)

const addWatchlistSchema = z.object({
  stockCode: z.string().min(1).max(20),
  stockName: z.string().min(1).max(100),
  market: z.string().max(10).default('KOSPI'),
})

// GET /api/workspace/strategy/watchlist — 관심 종목 목록
strategyRoute.get('/watchlist', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select()
    .from(strategyWatchlists)
    .where(and(eq(strategyWatchlists.companyId, tenant.companyId), eq(strategyWatchlists.userId, tenant.userId)))

  return c.json({ data: result })
})

// POST /api/workspace/strategy/watchlist — 종목 추가
strategyRoute.post('/watchlist', zValidator('json', addWatchlistSchema), async (c) => {
  const tenant = c.get('tenant')
  const { stockCode, stockName, market } = c.req.valid('json')

  const [item] = await db
    .insert(strategyWatchlists)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      stockCode,
      stockName,
      market,
    })
    .onConflictDoNothing()
    .returning()

  if (!item) throw new HTTPError(409, '이미 추가된 종목입니다', 'STRATEGY_001')

  return c.json({ data: item }, 201)
})

// DELETE /api/workspace/strategy/watchlist/:id — 종목 삭제
strategyRoute.delete('/watchlist/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [deleted] = await db
    .delete(strategyWatchlists)
    .where(and(
      eq(strategyWatchlists.id, id),
      eq(strategyWatchlists.companyId, tenant.companyId),
      eq(strategyWatchlists.userId, tenant.userId),
    ))
    .returning()

  if (!deleted) throw new HTTPError(404, '종목을 찾을 수 없습니다', 'STRATEGY_002')

  return c.json({ data: { deleted: true } })
})
