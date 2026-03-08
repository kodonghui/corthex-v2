import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, or, inArray, gte, lte, lt, sql } from 'drizzle-orm'
import { db } from '../../db'
import { strategyWatchlists, chatSessions, agents, strategyNotes, strategyBacktestResults, strategyNoteShares, users, strategyPortfolios, strategyOrders } from '../../db/schema'
import { broadcastToChannel } from '../../ws/channels'
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

// GET /api/workspace/strategy/notes?stockCode=005930 — 종목별 노트 목록 (내 메모 + 공유받은 메모)
strategyRoute.get(
  '/notes',
  zValidator('query', z.object({ stockCode: z.string().min(1).max(20) })),
  async (c) => {
    const tenant = c.get('tenant')
    const { stockCode } = c.req.valid('query')

    // 공유받은 노트 ID 서브쿼리
    const sharedNoteIds = db
      .select({ noteId: strategyNoteShares.noteId })
      .from(strategyNoteShares)
      .where(and(
        eq(strategyNoteShares.companyId, tenant.companyId),
        eq(strategyNoteShares.sharedWithUserId, tenant.userId),
      ))

    const result = await db
      .select({
        id: strategyNotes.id,
        stockCode: strategyNotes.stockCode,
        title: strategyNotes.title,
        content: strategyNotes.content,
        createdAt: strategyNotes.createdAt,
        updatedAt: strategyNotes.updatedAt,
        userId: strategyNotes.userId,
        ownerName: users.name,
      })
      .from(strategyNotes)
      .leftJoin(users, eq(strategyNotes.userId, users.id))
      .where(and(
        eq(strategyNotes.companyId, tenant.companyId),
        eq(strategyNotes.stockCode, stockCode),
        or(
          eq(strategyNotes.userId, tenant.userId),
          inArray(strategyNotes.id, sharedNoteIds),
        ),
      ))
      .orderBy(desc(strategyNotes.updatedAt))
      .limit(50)

    const data = result.map((r) => ({
      id: r.id,
      stockCode: r.stockCode,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isOwner: r.userId === tenant.userId,
      owner: r.userId !== tenant.userId ? { id: r.userId, name: r.ownerName } : undefined,
    }))

    return c.json({ data })
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

// PATCH /api/workspace/strategy/notes/:id — 노트 수정 (작성자 또는 공유 대상)
strategyRoute.patch(
  '/notes/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updateNoteSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    // 작성자인지 확인
    const [note] = await db
      .select({ userId: strategyNotes.userId })
      .from(strategyNotes)
      .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, tenant.companyId)))
      .limit(1)

    if (!note) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_020')

    const isOwner = note.userId === tenant.userId
    if (!isOwner) {
      // 공유 대상인지 확인
      const [share] = await db
        .select()
        .from(strategyNoteShares)
        .where(and(
          eq(strategyNoteShares.noteId, id),
          eq(strategyNoteShares.sharedWithUserId, tenant.userId),
        ))
        .limit(1)
      if (!share) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_020')
    }

    const [updated] = await db
      .update(strategyNotes)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, tenant.companyId)))
      .returning()

    // WebSocket 브로드캐스트
    broadcastToChannel(`strategy-notes::${id}`, { type: 'note-updated', noteId: id })

    return c.json({ data: updated })
  },
)

// DELETE /api/workspace/strategy/notes/:id — 노트 삭제 (작성자만)
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

    // 삭제 성공 후 브로드캐스트
    broadcastToChannel(`strategy-notes::${id}`, { type: 'note-deleted', noteId: id })

    return c.json({ data: { deleted: true } })
  },
)

// === 노트 공유 ===

const shareNoteSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(20),
})

// POST /api/workspace/strategy/notes/:id/share — 노트 공유
strategyRoute.post(
  '/notes/:id/share',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', shareNoteSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const { userIds } = c.req.valid('json')

    // 작성자 확인
    const [note] = await db
      .select({ userId: strategyNotes.userId })
      .from(strategyNotes)
      .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, tenant.companyId)))
      .limit(1)

    if (!note) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_051')
    if (note.userId !== tenant.userId) throw new HTTPError(403, '작성자만 공유할 수 있습니다', 'STRATEGY_050')

    // 자기 자신 제외
    const targets = userIds.filter((uid) => uid !== tenant.userId)
    if (targets.length === 0) return c.json({ data: { shared: 0 } })

    // ON CONFLICT DO NOTHING 패턴 (이미 공유된 사용자 무시)
    await db
      .insert(strategyNoteShares)
      .values(targets.map((uid) => ({
        noteId: id,
        sharedWithUserId: uid,
        companyId: tenant.companyId,
      })))
      .onConflictDoNothing({ target: [strategyNoteShares.noteId, strategyNoteShares.sharedWithUserId] })

    // 공유 대상에게 notifications 채널로 알림
    for (const uid of targets) {
      broadcastToChannel(`notifications::${uid}`, { type: 'note-shared', noteId: id })
    }

    return c.json({ data: { shared: targets.length } }, 201)
  },
)

// DELETE /api/workspace/strategy/notes/:id/share/:userId — 공유 해제
strategyRoute.delete(
  '/notes/:id/share/:userId',
  zValidator('param', z.object({ id: z.string().uuid(), userId: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id, userId } = c.req.valid('param')

    // 작성자 확인
    const [note] = await db
      .select({ userId: strategyNotes.userId })
      .from(strategyNotes)
      .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, tenant.companyId)))
      .limit(1)

    if (!note) throw new HTTPError(404, '노트를 찾을 수 없습니다', 'STRATEGY_052')
    if (note.userId !== tenant.userId) throw new HTTPError(403, '작성자만 공유를 해제할 수 있습니다', 'STRATEGY_050')

    const [removed] = await db
      .delete(strategyNoteShares)
      .where(and(
        eq(strategyNoteShares.noteId, id),
        eq(strategyNoteShares.sharedWithUserId, userId),
      ))
      .returning()

    if (!removed) throw new HTTPError(404, '공유 대상을 찾을 수 없습니다', 'STRATEGY_052')

    // 해제된 사용자에게 알림
    broadcastToChannel(`notifications::${userId}`, { type: 'note-unshared', noteId: id })

    return c.json({ data: { deleted: true } })
  },
)

// GET /api/workspace/strategy/notes/:id/shares — 공유 대상 목록
strategyRoute.get(
  '/notes/:id/shares',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const result = await db
      .select({
        userId: strategyNoteShares.sharedWithUserId,
        userName: users.name,
        createdAt: strategyNoteShares.createdAt,
      })
      .from(strategyNoteShares)
      .innerJoin(users, eq(strategyNoteShares.sharedWithUserId, users.id))
      .where(and(
        eq(strategyNoteShares.noteId, id),
        eq(strategyNoteShares.companyId, tenant.companyId),
      ))

    return c.json({ data: result })
  },
)

// === 데이터 내보내기 ===

const exportSchema = z.object({
  type: z.enum(['watchlist', 'notes', 'chart']),
  format: z.enum(['csv', 'md']),
  stockCode: z.string().max(20).optional(),
  count: z.coerce.number().int().min(1).max(200).default(60),
}).refine(
  (d) => d.type === 'watchlist' || (d.stockCode && /^[A-Za-z0-9]{1,20}$/.test(d.stockCode)),
  { message: '종목코드가 필요합니다', path: ['stockCode'] },
)

const BOM = '\uFEFF'

function csvSafe(val: string): string {
  let s = val.replace(/"/g, '""')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s}"`
}

// GET /api/workspace/strategy/export — 전략 데이터 내보내기
strategyRoute.get('/export', zValidator('query', exportSchema), async (c) => {
  const tenant = c.get('tenant')
  const { type, format, stockCode, count } = c.req.valid('query')
  const today = new Date().toISOString().slice(0, 10)

  // --- 관심종목 CSV ---
  if (type === 'watchlist') {
    const rows = await db
      .select()
      .from(strategyWatchlists)
      .where(and(eq(strategyWatchlists.companyId, tenant.companyId), eq(strategyWatchlists.userId, tenant.userId)))

    const csv = BOM + '종목코드,종목명,시장\n' + rows.map((r) =>
      `${csvSafe(r.stockCode)},${csvSafe(r.stockName)},${csvSafe(r.market)}`,
    ).join('\n')

    const filename = `watchlist-${today}.csv`
    c.header('Content-Type', 'text/csv; charset=utf-8')
    c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    return c.body(csv)
  }

  // --- 메모 내보내기 ---
  if (type === 'notes') {
    const notes = await db
      .select()
      .from(strategyNotes)
      .where(and(
        eq(strategyNotes.companyId, tenant.companyId),
        eq(strategyNotes.userId, tenant.userId),
        eq(strategyNotes.stockCode, stockCode!),
      ))
      .orderBy(desc(strategyNotes.updatedAt))
      .limit(50)

    if (format === 'md') {
      const md = `# ${stockCode} 전략 메모\n\n` + notes.map((n) => {
        const date = new Date(n.updatedAt).toLocaleDateString('ko-KR')
        return `## ${n.title || '무제'}\n\n> ${date}\n\n${n.content}`
      }).join('\n\n---\n\n')

      const filename = `notes-${stockCode}-${today}.md`
      c.header('Content-Type', 'text/markdown; charset=utf-8')
      c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
      return c.body(md)
    }

    // notes CSV
    const csv = BOM + '종목코드,제목,내용,수정일\n' + notes.map((n) => {
      const content = n.content.replace(/\n/g, ' ')
      return `${csvSafe(stockCode!)},${csvSafe(n.title || '')},${csvSafe(content)},${csvSafe(new Date(n.updatedAt).toLocaleDateString('ko-KR'))}`
    }).join('\n')

    const filename = `notes-${stockCode}-${today}.csv`
    c.header('Content-Type', 'text/csv; charset=utf-8')
    c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    return c.body(csv)
  }

  // --- 차트 데이터 CSV ---
  if (type === 'chart') {
    let creds: Record<string, string>
    try {
      creds = await getCredentials(tenant.companyId, 'kis', tenant.userId)
    } catch {
      throw new HTTPError(400, 'KIS API 키가 등록되지 않았습니다', 'STRATEGY_030')
    }

    const token = await getKisToken(creds.app_key, creds.app_secret)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Math.ceil(count * 1.6))
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: stockCode!,
      FID_INPUT_DATE_1: fmt(startDate),
      FID_INPUT_DATE_2: fmt(endDate),
      FID_PERIOD_DIV_CODE: 'D',
      FID_ORG_ADJ_PRC: '0',
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST03010100'),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) throw new HTTPError(502, 'KIS 일봉 API 호출 실패', 'STRATEGY_031')

    const data = await res.json() as { output2?: Array<Record<string, string>>; rt_cd?: string }
    if (data.rt_cd !== '0') throw new HTTPError(502, 'KIS 일봉 데이터 오류', 'STRATEGY_032')

    const candles = (data.output2 || [])
      .filter((r) => r.stck_bsop_date && r.stck_oprc !== '0')
      .map((r) => ({
        time: `${r.stck_bsop_date.slice(0, 4)}-${r.stck_bsop_date.slice(4, 6)}-${r.stck_bsop_date.slice(6, 8)}`,
        open: r.stck_oprc,
        high: r.stck_hgpr,
        low: r.stck_lwpr,
        close: r.stck_clpr,
        volume: r.acml_vol || '0',
      }))
      .reverse()
      .slice(-count)

    const csv = BOM + '날짜,시가,고가,저가,종가,거래량\n' + candles.map((row) =>
      `${row.time},${row.open},${row.high},${row.low},${row.close},${row.volume}`,
    ).join('\n')

    const filename = `chart-${stockCode}-${count}d-${today}.csv`
    c.header('Content-Type', 'text/csv; charset=utf-8')
    c.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    return c.body(csv)
  }

  throw new HTTPError(400, '지원하지 않는 내보내기 유형입니다', 'STRATEGY_033')
})

// === 백테스트 결과 ===

const backtestCreateSchema = z.object({
  stockCode: z.string().min(1).max(20).regex(/^[A-Za-z0-9]{1,20}$/),
  strategyType: z.string().min(1).max(50),
  strategyParams: z.record(z.unknown()),
  signals: z.array(z.object({
    date: z.string(),
    type: z.enum(['buy', 'sell']),
    price: z.number(),
  })),
  metrics: z.object({
    totalReturn: z.number(),
    tradeCount: z.number(),
    winRate: z.number(),
    maxDrawdown: z.number(),
  }),
  dataRange: z.string().max(50).optional(),
})

// GET /api/workspace/strategy/backtest-results?stockCode=005930
strategyRoute.get(
  '/backtest-results',
  zValidator('query', z.object({ stockCode: z.string().min(1).max(20) })),
  async (c) => {
    const tenant = c.get('tenant')
    const { stockCode } = c.req.valid('query')

    const results = await db
      .select()
      .from(strategyBacktestResults)
      .where(and(
        eq(strategyBacktestResults.companyId, tenant.companyId),
        eq(strategyBacktestResults.userId, tenant.userId),
        eq(strategyBacktestResults.stockCode, stockCode),
      ))
      .orderBy(desc(strategyBacktestResults.createdAt))
      .limit(20)

    return c.json({ data: results })
  },
)

// POST /api/workspace/strategy/backtest-results
strategyRoute.post('/backtest-results', zValidator('json', backtestCreateSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const [result] = await db
    .insert(strategyBacktestResults)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      stockCode: body.stockCode,
      strategyType: body.strategyType,
      strategyParams: body.strategyParams,
      signals: body.signals,
      metrics: body.metrics,
      dataRange: body.dataRange || null,
    })
    .returning()

  return c.json({ data: result }, 201)
})

// DELETE /api/workspace/strategy/backtest-results/:id
strategyRoute.delete(
  '/backtest-results/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [deleted] = await db
      .delete(strategyBacktestResults)
      .where(and(
        eq(strategyBacktestResults.id, id),
        eq(strategyBacktestResults.companyId, tenant.companyId),
        eq(strategyBacktestResults.userId, tenant.userId),
      ))
      .returning()

    if (!deleted) throw new HTTPError(404, '백테스트 결과를 찾을 수 없습니다', 'STRATEGY_041')

    return c.json({ data: { deleted: true } })
  },
)

// ======================================
// === 포트폴리오 CRUD (E10-S1 Task 4) ===
// ======================================

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  tradingMode: z.enum(['real', 'paper']).default('paper'),
  initialCash: z.number().int().min(0).default(50_000_000),
  memo: z.string().max(500).optional(),
})

// GET /api/workspace/strategy/portfolios — 포트폴리오 목록
strategyRoute.get(
  '/portfolios',
  zValidator('query', z.object({ tradingMode: z.enum(['real', 'paper']).optional() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { tradingMode } = c.req.valid('query')

    const conditions = [
      eq(strategyPortfolios.companyId, tenant.companyId),
      eq(strategyPortfolios.userId, tenant.userId),
    ]
    if (tradingMode) conditions.push(eq(strategyPortfolios.tradingMode, tradingMode))

    const result = await db
      .select()
      .from(strategyPortfolios)
      .where(and(...conditions))
      .orderBy(desc(strategyPortfolios.updatedAt))

    return c.json({ data: result })
  },
)

// POST /api/workspace/strategy/portfolios — 포트폴리오 생성
strategyRoute.post('/portfolios', zValidator('json', createPortfolioSchema), async (c) => {
  const tenant = c.get('tenant')
  const { name, tradingMode, initialCash, memo } = c.req.valid('json')

  const [portfolio] = await db
    .insert(strategyPortfolios)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      name,
      tradingMode,
      initialCash,
      cashBalance: initialCash,
      totalValue: initialCash,
      memo: memo || null,
    })
    .returning()

  return c.json({ data: portfolio }, 201)
})

// GET /api/workspace/strategy/portfolios/:id — 포트폴리오 단건 조회
strategyRoute.get(
  '/portfolios/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [portfolio] = await db
      .select()
      .from(strategyPortfolios)
      .where(and(
        eq(strategyPortfolios.id, id),
        eq(strategyPortfolios.companyId, tenant.companyId),
        eq(strategyPortfolios.userId, tenant.userId),
      ))
      .limit(1)

    if (!portfolio) throw new HTTPError(404, '포트폴리오를 찾을 수 없습니다', 'STRATEGY_100')

    return c.json({ data: portfolio })
  },
)

const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  cashBalance: z.number().int().min(0).optional(),
  holdings: z.array(z.object({
    ticker: z.string().min(1).max(20),
    name: z.string().min(1).max(100),
    market: z.string().max(10).default('KR'),
    quantity: z.number().int().min(0),
    avgPrice: z.number().min(0),
    currentPrice: z.number().min(0).optional(),
  })).optional(),
  totalValue: z.number().int().min(0).optional(),
  memo: z.string().max(500).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: '수정할 내용이 없습니다' })

// PATCH /api/workspace/strategy/portfolios/:id — 포트폴리오 수정
strategyRoute.patch(
  '/portfolios/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('json', updatePortfolioSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updateData.name = body.name
    if (body.cashBalance !== undefined) updateData.cashBalance = body.cashBalance
    if (body.holdings !== undefined) updateData.holdings = body.holdings
    if (body.totalValue !== undefined) updateData.totalValue = body.totalValue
    if (body.memo !== undefined) updateData.memo = body.memo

    const [updated] = await db
      .update(strategyPortfolios)
      .set(updateData)
      .where(and(
        eq(strategyPortfolios.id, id),
        eq(strategyPortfolios.companyId, tenant.companyId),
        eq(strategyPortfolios.userId, tenant.userId),
      ))
      .returning()

    if (!updated) throw new HTTPError(404, '포트폴리오를 찾을 수 없습니다', 'STRATEGY_101')

    return c.json({ data: updated })
  },
)

// ===============================================
// === 매매 주문 이력 API (E10-S1 Task 5, FR62) ===
// ===============================================

const createOrderSchema = z.object({
  portfolioId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  ticker: z.string().min(1).max(20),
  tickerName: z.string().min(1).max(100),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  orderType: z.enum(['market', 'limit']).default('market'),
  tradingMode: z.enum(['real', 'paper']).default('paper'),
  status: z.enum(['pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed']).default('pending'),
  reason: z.string().max(500).optional(),
  kisOrderNo: z.string().max(50).optional(),
  executedAt: z.string().datetime().optional(),
})

// GET /api/workspace/strategy/orders — 주문 이력 (cursor 페이지네이션 + 필터)
strategyRoute.get(
  '/orders',
  zValidator('query', z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    ticker: z.string().max(20).optional(),
    side: z.enum(['buy', 'sell']).optional(),
    status: z.enum(['pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed']).optional(),
    tradingMode: z.enum(['real', 'paper']).optional(),
  })),
  async (c) => {
    const tenant = c.get('tenant')
    const { cursor, limit, dateFrom, dateTo, ticker, side, status, tradingMode } = c.req.valid('query')

    const conditions = [
      eq(strategyOrders.companyId, tenant.companyId),
      eq(strategyOrders.userId, tenant.userId),
    ]

    if (ticker) conditions.push(eq(strategyOrders.ticker, ticker))
    if (side) conditions.push(eq(strategyOrders.side, side))
    if (status) conditions.push(eq(strategyOrders.status, status))
    if (tradingMode) conditions.push(eq(strategyOrders.tradingMode, tradingMode))
    if (dateFrom) conditions.push(gte(strategyOrders.createdAt, new Date(dateFrom)))
    if (dateTo) conditions.push(lte(strategyOrders.createdAt, new Date(dateTo)))

    // Cursor-based pagination: fetch items created before the cursor item
    if (cursor) {
      const [cursorOrder] = await db
        .select({ createdAt: strategyOrders.createdAt })
        .from(strategyOrders)
        .where(eq(strategyOrders.id, cursor))
        .limit(1)

      if (cursorOrder) {
        conditions.push(lt(strategyOrders.createdAt, cursorOrder.createdAt))
      }
    }

    const result = await db
      .select()
      .from(strategyOrders)
      .where(and(...conditions))
      .orderBy(desc(strategyOrders.createdAt))
      .limit(limit + 1) // fetch one extra to detect hasMore

    const hasMore = result.length > limit
    const items = hasMore ? result.slice(0, limit) : result
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return c.json({ data: items, pagination: { hasMore, nextCursor, limit } })
  },
)

// POST /api/workspace/strategy/orders — 주문 기록 생성
strategyRoute.post('/orders', zValidator('json', createOrderSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  // Validate portfolioId belongs to same tenant (tenant isolation)
  if (body.portfolioId) {
    const [portfolio] = await db
      .select({ id: strategyPortfolios.id })
      .from(strategyPortfolios)
      .where(and(
        eq(strategyPortfolios.id, body.portfolioId),
        eq(strategyPortfolios.companyId, tenant.companyId),
        eq(strategyPortfolios.userId, tenant.userId),
      ))
      .limit(1)
    if (!portfolio) throw new HTTPError(404, '포트폴리오를 찾을 수 없습니다', 'STRATEGY_111')
  }

  // Validate agentId belongs to same company (tenant isolation)
  if (body.agentId) {
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(
        eq(agents.id, body.agentId),
        eq(agents.companyId, tenant.companyId),
      ))
      .limit(1)
    if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'STRATEGY_112')
  }

  const totalAmount = body.quantity * body.price

  const [order] = await db
    .insert(strategyOrders)
    .values({
      companyId: tenant.companyId,
      userId: tenant.userId,
      portfolioId: body.portfolioId || null,
      agentId: body.agentId || null,
      ticker: body.ticker,
      tickerName: body.tickerName,
      side: body.side,
      quantity: body.quantity,
      price: body.price,
      totalAmount,
      orderType: body.orderType,
      tradingMode: body.tradingMode,
      status: body.status,
      reason: body.reason || null,
      kisOrderNo: body.kisOrderNo || null,
      executedAt: body.executedAt ? new Date(body.executedAt) : null,
    })
    .returning()

  return c.json({ data: order }, 201)
})

// GET /api/workspace/strategy/orders/summary — 주문 요약 통계 (must be before :id route)
strategyRoute.get(
  '/orders/summary',
  zValidator('query', z.object({
    tradingMode: z.enum(['real', 'paper']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })),
  async (c) => {
    const tenant = c.get('tenant')
    const { tradingMode, dateFrom, dateTo } = c.req.valid('query')

    const conditions = [
      eq(strategyOrders.companyId, tenant.companyId),
      eq(strategyOrders.userId, tenant.userId),
    ]
    if (tradingMode) conditions.push(eq(strategyOrders.tradingMode, tradingMode))
    if (dateFrom) conditions.push(gte(strategyOrders.createdAt, new Date(dateFrom)))
    if (dateTo) conditions.push(lte(strategyOrders.createdAt, new Date(dateTo)))

    const result = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        executedOrders: sql<number>`count(*) filter (where ${strategyOrders.status} = 'executed')::int`,
        totalBuyAmount: sql<number>`coalesce(sum(case when ${strategyOrders.side} = 'buy' and ${strategyOrders.status} = 'executed' then ${strategyOrders.totalAmount} else 0 end), 0)::int`,
        totalSellAmount: sql<number>`coalesce(sum(case when ${strategyOrders.side} = 'sell' and ${strategyOrders.status} = 'executed' then ${strategyOrders.totalAmount} else 0 end), 0)::int`,
        buyCount: sql<number>`count(*) filter (where ${strategyOrders.side} = 'buy' and ${strategyOrders.status} = 'executed')::int`,
        sellCount: sql<number>`count(*) filter (where ${strategyOrders.side} = 'sell' and ${strategyOrders.status} = 'executed')::int`,
      })
      .from(strategyOrders)
      .where(and(...conditions))

    return c.json({ data: result[0] || { totalOrders: 0, executedOrders: 0, totalBuyAmount: 0, totalSellAmount: 0, buyCount: 0, sellCount: 0 } })
  },
)

// GET /api/workspace/strategy/orders/:id — 주문 단건 조회
strategyRoute.get(
  '/orders/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const tenant = c.get('tenant')
    const { id } = c.req.valid('param')

    const [order] = await db
      .select()
      .from(strategyOrders)
      .where(and(
        eq(strategyOrders.id, id),
        eq(strategyOrders.companyId, tenant.companyId),
        eq(strategyOrders.userId, tenant.userId),
      ))
      .limit(1)

    if (!order) throw new HTTPError(404, '주문을 찾을 수 없습니다', 'STRATEGY_110')

    return c.json({ data: order })
  },
)

// NOTE: DELETE endpoint intentionally omitted — FR62 requires permanent order preservation
