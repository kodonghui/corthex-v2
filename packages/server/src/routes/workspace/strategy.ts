import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { strategyWatchlists, chatSessions, agents } from '../../db/schema'
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
strategyRoute.delete('/watchlist/:id', zValidator('param', z.object({ id: z.string().uuid() })), async (c) => {
  const tenant = c.get('tenant')
  const { id } = c.req.valid('param')

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

// === 전략 채팅 ===

// GET /api/workspace/strategy/chat/session — 현재 전략 채팅 세션 조회 (가장 최근)
strategyRoute.get('/chat/session', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: chatSessions.id,
      agentId: chatSessions.agentId,
      agentName: agents.name,
      title: chatSessions.title,
      metadata: chatSessions.metadata,
      lastMessageAt: chatSessions.lastMessageAt,
    })
    .from(chatSessions)
    .innerJoin(agents, eq(chatSessions.agentId, agents.id))
    .where(and(
      eq(chatSessions.companyId, tenant.companyId),
      eq(chatSessions.userId, tenant.userId),
    ))
    .orderBy(desc(chatSessions.lastMessageAt))
    .limit(20)

  // 전략실 세션 찾기 (metadata.strategy === true 마커)
  const strategySession = result.find((s) => {
    const meta = s.metadata as { strategy?: boolean } | null
    return meta?.strategy === true
  })

  return c.json({ data: strategySession || null })
})

const createChatSchema = z.object({
  stockCode: z.string().max(20).optional(),
  stockName: z.string().max(100).optional(),
})

// POST /api/workspace/strategy/chat/sessions — 전략 채팅 세션 생성
strategyRoute.post('/chat/sessions', zValidator('json', createChatSchema), async (c) => {
  const tenant = c.get('tenant')
  const { stockCode, stockName } = c.req.valid('json')

  // 재무팀장 에이전트 자동 선택 (isSecretary=false, 최초 에이전트)
  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(
      eq(agents.companyId, tenant.companyId),
      eq(agents.isSecretary, false),
      eq(agents.isActive, true),
    ))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'STRATEGY_003')

  const metadata = { strategy: true as const, stockCode: stockCode || null, stockName: stockName || null }

  const [session] = await db
    .insert(chatSessions)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      agentId: agent.id,
      title: stockName ? `${stockName} 전략 분석` : '전략실 대화',
      metadata,
    })
    .returning()

  return c.json({ data: { ...session, agentName: agent.name } }, 201)
})

const updateContextSchema = z.object({
  stockCode: z.string().max(20),
  stockName: z.string().max(100).optional(),
})

// PATCH /api/workspace/strategy/chat/sessions/:id/context — 종목 컨텍스트 업데이트
strategyRoute.patch(
  '/chat/sessions/:id/context',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updateContextSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const { stockCode, stockName } = c.req.valid('json')

    const [updated] = await db
      .update(chatSessions)
      .set({ metadata: { strategy: true, stockCode, stockName } })
      .where(and(
        eq(chatSessions.id, id),
        eq(chatSessions.companyId, tenant.companyId),
        eq(chatSessions.userId, tenant.userId),
      ))
      .returning()

    if (!updated) throw new HTTPError(404, '세션을 찾을 수 없습니다', 'STRATEGY_004')

    return c.json({ data: updated })
  },
)
