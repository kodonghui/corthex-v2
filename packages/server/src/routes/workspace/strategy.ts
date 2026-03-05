import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../db'
import { strategyWatchlists, chatSessions, agents, strategyNotes } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { getCredentials } from '../../services/credential-vault'
import { getKisToken, kisHeaders, KIS_BASE_URL } from '../../lib/tool-handlers/builtins/kis-auth'
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

// === 시세 조회 ===

// GET /api/workspace/strategy/prices?codes=005930,035420 — 실시간 시세
strategyRoute.get('/prices', zValidator('query', z.object({ codes: z.string().min(1) })), async (c) => {
  const tenant = c.get('tenant')
  const { codes } = c.req.valid('query')
  const codeList = codes.split(',').map((s) => s.trim()).filter((s) => /^[A-Za-z0-9]{1,20}$/.test(s)).slice(0, 20)
  if (codeList.length === 0) throw new HTTPError(400, '유효한 종목코드가 없습니다', 'STRATEGY_014')

  let creds: Record<string, string>
  try {
    creds = await getCredentials(tenant.companyId, 'kis', tenant.userId)
  } catch {
    throw new HTTPError(400, 'KIS API 키가 등록되지 않았습니다', 'STRATEGY_010')
  }

  const token = await getKisToken(creds.app_key, creds.app_secret)

  const fetchOne = async (code: string) => {
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: code,
    })
    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST01010100'),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { error: true }
    const data = await res.json() as { output?: Record<string, string>; rt_cd?: string }
    if (data.rt_cd !== '0') return { error: true }
    const o = data.output || {}
    return {
      name: o.hts_kor_isnm || code,
      price: Number(o.stck_prpr || 0),
      change: Number(o.prdy_vrss || 0),
      changeRate: Number(o.prdy_ctrt || 0),
      open: Number(o.stck_oprc || 0),
      high: Number(o.stck_hgpr || 0),
      low: Number(o.stck_lwpr || 0),
      volume: Number(o.acml_vol || 0),
    }
  }

  const settled = await Promise.allSettled(codeList.map((code) => fetchOne(code)))
  const results: Record<string, unknown> = {}
  codeList.forEach((code, i) => {
    const r = settled[i]
    results[code] = r.status === 'fulfilled' ? r.value : { error: true }
  })

  return c.json({ data: results })
})

// GET /api/workspace/strategy/chart-data?code=005930&count=60 — 일봉 차트 데이터
strategyRoute.get(
  '/chart-data',
  zValidator('query', z.object({
    code: z.string().min(1).max(20),
    count: z.coerce.number().int().min(1).max(200).default(60),
  })),
  async (c) => {
    const tenant = c.get('tenant')
    const { code, count } = c.req.valid('query')

    let creds: Record<string, string>
    try {
      creds = await getCredentials(tenant.companyId, 'kis', tenant.userId)
    } catch {
      throw new HTTPError(400, 'KIS API 키가 등록되지 않았습니다', 'STRATEGY_011')
    }

    const token = await getKisToken(creds.app_key, creds.app_secret)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Math.ceil(count * 1.6))

    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: code,
      FID_INPUT_DATE_1: fmt(startDate),
      FID_INPUT_DATE_2: fmt(endDate),
      FID_PERIOD_DIV_CODE: 'D',
      FID_ORG_ADJ_PRC: '0',
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST03010100'),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) throw new HTTPError(502, 'KIS 일봉 API 호출 실패', 'STRATEGY_012')

    const data = await res.json() as { output2?: Array<Record<string, string>>; rt_cd?: string }
    if (data.rt_cd !== '0') throw new HTTPError(502, 'KIS 일봉 데이터 오류', 'STRATEGY_013')

    const candles = (data.output2 || [])
      .filter((r) => r.stck_bsop_date && r.stck_oprc !== '0')
      .map((r) => ({
        time: `${r.stck_bsop_date.slice(0, 4)}-${r.stck_bsop_date.slice(4, 6)}-${r.stck_bsop_date.slice(6, 8)}`,
        open: Number(r.stck_oprc),
        high: Number(r.stck_hgpr),
        low: Number(r.stck_lwpr),
        close: Number(r.stck_clpr),
        volume: Number(r.acml_vol || 0),
      }))
      .reverse()
      .slice(-count)

    return c.json({ data: { candles } })
  },
)

// === 전략 노트 ===

// GET /api/workspace/strategy/notes?stockCode=005930 — 종목별 노트 목록
strategyRoute.get(
  '/notes',
  zValidator('query', z.object({ stockCode: z.string().min(1).max(20) })),
  async (c) => {
    const tenant = c.get('tenant')
    const { stockCode } = c.req.valid('query')

    const result = await db
      .select()
      .from(strategyNotes)
      .where(and(
        eq(strategyNotes.companyId, tenant.companyId),
        eq(strategyNotes.userId, tenant.userId),
        eq(strategyNotes.stockCode, stockCode),
      ))
      .orderBy(desc(strategyNotes.updatedAt))
      .limit(50)

    return c.json({ data: result })
  },
)

const createNoteSchema = z.object({
  stockCode: z.string().min(1).max(20),
  title: z.string().max(200).optional(),
  content: z.string().max(10_000).default(''),
})

// POST /api/workspace/strategy/notes — 노트 생성
strategyRoute.post('/notes', zValidator('json', createNoteSchema), async (c) => {
  const tenant = c.get('tenant')
  const { stockCode, title, content } = c.req.valid('json')

  const [note] = await db
    .insert(strategyNotes)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      stockCode,
      title: title || null,
      content,
    })
    .returning()

  return c.json({ data: note }, 201)
})

const updateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(10_000).optional(),
}).refine((d) => d.title !== undefined || d.content !== undefined, {
  message: '수정할 내용이 없습니다',
})

// PATCH /api/workspace/strategy/notes/:id — 노트 수정
strategyRoute.patch(
  '/notes/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updateNoteSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const [updated] = await db
      .update(strategyNotes)
      .set({ ...body, updatedAt: new Date() })
      .where(and(
        eq(strategyNotes.id, id),
        eq(strategyNotes.companyId, tenant.companyId),
        eq(strategyNotes.userId, tenant.userId),
      ))
      .returning()

    if (!updated) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_020')

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/strategy/notes/:id — 노트 삭제
strategyRoute.delete(
  '/notes/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [deleted] = await db
      .delete(strategyNotes)
      .where(and(
        eq(strategyNotes.id, id),
        eq(strategyNotes.companyId, tenant.companyId),
        eq(strategyNotes.userId, tenant.userId),
      ))
      .returning()

    if (!deleted) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_021')

    return c.json({ data: { deleted: true } })
  },
)
