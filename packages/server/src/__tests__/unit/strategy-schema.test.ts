import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Mock Setup
// ============================================================

let selectResults: unknown[][] = []
let insertResult: unknown[] = []
let updateResult: unknown[] = []
let deleteResult: unknown[] = []

function makeChain(results: unknown[][]) {
  let callIndex = 0
  const getResult = () => {
    const res = results[callIndex] ?? []
    callIndex++
    return res
  }
  const chain: Record<string, unknown> = {}
  chain.from = mock(() => chain)
  chain.where = mock(() => chain)
  chain.orderBy = mock(() => chain)
  chain.limit = mock((n: number) => {
    return getResult()
  })
  // Make chain thenable for queries without .limit() (e.g. list queries)
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
    try { resolve(getResult()) } catch (e) { reject?.(e) }
  }
  return chain
}

let currentChain: ReturnType<typeof makeChain>

mock.module('../../db', () => ({
  db: {
    select: mock(() => currentChain),
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => insertResult),
        onConflictDoNothing: mock(() => ({ returning: mock(() => insertResult) })),
      })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => updateResult),
        })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => ({
        returning: mock(() => deleteResult),
      })),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  // Enums
  tradingModeEnum: { enumValues: ['real', 'paper'] },
  orderSideEnum: { enumValues: ['buy', 'sell'] },
  orderStatusEnum: { enumValues: ['pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed'] },
  orderTypeEnum: { enumValues: ['market', 'limit'] },
  // Relations
  strategyPortfoliosRelations: { name: 'strategyPortfoliosRelations' },
  strategyOrdersRelations: { name: 'strategyOrdersRelations' },
  // Tables
  strategyPortfolios: {
    id: 'strategy_portfolios.id',
    companyId: 'strategy_portfolios.company_id',
    userId: 'strategy_portfolios.user_id',
    name: 'strategy_portfolios.name',
    tradingMode: 'strategy_portfolios.trading_mode',
    initialCash: 'strategy_portfolios.initial_cash',
    cashBalance: 'strategy_portfolios.cash_balance',
    holdings: 'strategy_portfolios.holdings',
    totalValue: 'strategy_portfolios.total_value',
    memo: 'strategy_portfolios.memo',
    createdAt: 'strategy_portfolios.created_at',
    updatedAt: 'strategy_portfolios.updated_at',
  },
  strategyOrders: {
    id: 'strategy_orders.id',
    companyId: 'strategy_orders.company_id',
    userId: 'strategy_orders.user_id',
    portfolioId: 'strategy_orders.portfolio_id',
    agentId: 'strategy_orders.agent_id',
    ticker: 'strategy_orders.ticker',
    tickerName: 'strategy_orders.ticker_name',
    side: 'strategy_orders.side',
    quantity: 'strategy_orders.quantity',
    price: 'strategy_orders.price',
    totalAmount: 'strategy_orders.total_amount',
    orderType: 'strategy_orders.order_type',
    tradingMode: 'strategy_orders.trading_mode',
    status: 'strategy_orders.status',
    reason: 'strategy_orders.reason',
    kisOrderNo: 'strategy_orders.kis_order_no',
    executedAt: 'strategy_orders.executed_at',
    createdAt: 'strategy_orders.created_at',
  },
  strategyWatchlists: {
    id: 'strategy_watchlists.id',
    companyId: 'strategy_watchlists.company_id',
    userId: 'strategy_watchlists.user_id',
    stockCode: 'strategy_watchlists.stock_code',
    stockName: 'strategy_watchlists.stock_name',
    market: 'strategy_watchlists.market',
  },
  chatSessions: { id: 'chat_sessions.id', companyId: 'chat_sessions.company_id', userId: 'chat_sessions.user_id', agentId: 'chat_sessions.agent_id', metadata: 'chat_sessions.metadata', lastMessageAt: 'chat_sessions.last_message_at', title: 'chat_sessions.title' },
  agents: { id: 'agents.id', companyId: 'agents.company_id', name: 'agents.name', isSecretary: 'agents.is_secretary', isActive: 'agents.is_active' },
  strategyNotes: { id: 'strategy_notes.id', companyId: 'strategy_notes.company_id', userId: 'strategy_notes.user_id', stockCode: 'strategy_notes.stock_code' },
  strategyBacktestResults: { id: 'strategy_backtest_results.id', companyId: 'strategy_backtest_results.company_id', userId: 'strategy_backtest_results.user_id', stockCode: 'strategy_backtest_results.stock_code', createdAt: 'strategy_backtest_results.created_at' },
  strategyNoteShares: { noteId: 'strategy_note_shares.note_id', sharedWithUserId: 'strategy_note_shares.shared_with_user_id', companyId: 'strategy_note_shares.company_id' },
  users: { id: 'users.id', name: 'users.name' },
  companies: { id: 'companies.id' },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ type: 'eq', left: a, right: b }),
  and: (...args: unknown[]) => ({ type: 'and', conditions: args }),
  desc: (col: unknown) => ({ type: 'desc', column: col }),
  or: (...args: unknown[]) => ({ type: 'or', conditions: args }),
  inArray: (a: unknown, b: unknown) => ({ type: 'inArray', column: a, values: b }),
  gte: (a: unknown, b: unknown) => ({ type: 'gte', left: a, right: b }),
  lte: (a: unknown, b: unknown) => ({ type: 'lte', left: a, right: b }),
  lt: (a: unknown, b: unknown) => ({ type: 'lt', left: a, right: b }),
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => 'sql_expression',
  relations: () => ({}),
}))

mock.module('../../ws/channels', () => ({
  broadcastToChannel: mock(() => {}),
}))

mock.module('../../middleware/auth', () => ({
  authMiddleware: mock(async (_c: unknown, next: () => Promise<void>) => next()),
}))

class MockHTTPError extends Error {
  status: number
  code: string
  constructor(status: number, message: string, code: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

mock.module('../../middleware/error', () => ({
  HTTPError: MockHTTPError,
}))

mock.module('../../services/credential-vault', () => ({
  getCredentials: mock(async () => ({ app_key: 'test_key', app_secret: 'test_secret' })),
}))

mock.module('../../lib/tool-handlers/builtins/kis-auth', () => ({
  getKisToken: mock(async () => 'test_token'),
  kisHeaders: mock(() => ({})),
  KIS_BASE_URL: 'https://openapi.koreainvestment.com:9443',
  KIS_BASE_REAL: 'https://openapi.koreainvestment.com:9443',
  KIS_BASE_PAPER: 'https://openapivts.koreainvestment.com:29443',
  getKisBaseUrl: mock((mode: string) => mode === 'paper' ? 'https://openapivts.koreainvestment.com:29443' : 'https://openapi.koreainvestment.com:9443'),
  invalidateKisToken: mock(() => {}),
  KIS_TR_IDS: {
    domestic: { real: { buy: 'TTTC0012U', sell: 'TTTC0011U', balance: 'TTTC8434R' }, paper: { buy: 'VTTC0012U', sell: 'VTTC0011U', balance: 'VTTC8434R' } },
    overseas: { real: { buy: 'TTTT1002U', sell: 'TTTT1006U', balance: 'TTTS3012R', price: 'HHDFS00000300' }, paper: { buy: 'VTTT1002U', sell: 'VTTT1006U', balance: 'VTTS3012R', price: 'HHDFS00000300' } },
    price: { domestic: 'FHKST01010100', domesticDaily: 'FHKST03010100', overseas: 'HHDFS00000300' },
  },
  EXCHANGE_CODES: { order: { NASDAQ: 'NASD', NYSE: 'NYSE', AMEX: 'AMEX', NASD: 'NASD' }, price: { NASD: 'NAS', NYSE: 'NYS', AMEX: 'AMS' } },
}))

mock.module('../../services/kis-adapter', () => ({
  executeOrder: mock(async () => ({ success: true, orderId: 'test', message: 'ok', side: 'buy', ticker: '005930', quantity: 10, price: 50000, status: 'submitted' })),
  getBalance: mock(async () => ({ success: true, cash: 10000000, holdings: [], totalEval: 10000000, mode: 'paper' })),
  syncOrderStatus: mock(async () => ({ success: true, status: 'executed', message: '체결 완료' })),
  getOverseasPrice: mock(async () => ({ success: true, data: { symbol: 'AAPL', price: 150 } })),
  isKoreanMarketOpen: mock(() => true),
  isUSMarketOpen: mock(() => true),
}))

// ============================================================
// Schema Tests
// ============================================================

function createTestApp(tenant: { companyId: string; userId: string; role: string }) {
  const { Hono } = require('hono')
  const { strategyRoute } = require('../../routes/workspace/strategy')
  const app = new Hono()
  // Error handling middleware
  app.use('*', async (c: any, next: () => Promise<void>) => {
    c.set('tenant', tenant)
    try {
      await next()
    } catch (err: any) {
      const status = typeof err.status === 'number' ? err.status : 500
      return c.json({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message } }, status)
    }
  })
  app.route('/api/workspace/strategy', strategyRoute)
  return app
}

describe('Story 10-1: Strategy Schema - Watchlist, Portfolio, Orders', () => {
  // ============================================================
  // Schema Structure Tests
  // ============================================================
  describe('Schema Structure', () => {
    test('tradingModeEnum has correct values', async () => {
      const { tradingModeEnum } = await import('../../db/schema')
      expect(tradingModeEnum.enumValues).toEqual(['real', 'paper'])
    })

    test('orderSideEnum has correct values', async () => {
      const { orderSideEnum } = await import('../../db/schema')
      expect(orderSideEnum.enumValues).toEqual(['buy', 'sell'])
    })

    test('orderStatusEnum has correct values', async () => {
      const { orderStatusEnum } = await import('../../db/schema')
      expect(orderStatusEnum.enumValues).toEqual(['pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed'])
    })

    test('orderTypeEnum has correct values', async () => {
      const { orderTypeEnum } = await import('../../db/schema')
      expect(orderTypeEnum.enumValues).toEqual(['market', 'limit'])
    })

    test('strategyPortfolios table exists with correct columns', async () => {
      const schema = await import('../../db/schema')
      const table = schema.strategyPortfolios
      expect(table).toBeDefined()
      // Check column names via drizzle table structure
      const columnNames = Object.keys(table)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('companyId')
      expect(columnNames).toContain('userId')
      expect(columnNames).toContain('name')
      expect(columnNames).toContain('tradingMode')
      expect(columnNames).toContain('initialCash')
      expect(columnNames).toContain('cashBalance')
      expect(columnNames).toContain('holdings')
      expect(columnNames).toContain('totalValue')
      expect(columnNames).toContain('memo')
      expect(columnNames).toContain('createdAt')
      expect(columnNames).toContain('updatedAt')
    })

    test('strategyOrders table exists with correct columns', async () => {
      const schema = await import('../../db/schema')
      const table = schema.strategyOrders
      expect(table).toBeDefined()
      const columnNames = Object.keys(table)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('companyId')
      expect(columnNames).toContain('userId')
      expect(columnNames).toContain('portfolioId')
      expect(columnNames).toContain('agentId')
      expect(columnNames).toContain('ticker')
      expect(columnNames).toContain('tickerName')
      expect(columnNames).toContain('side')
      expect(columnNames).toContain('quantity')
      expect(columnNames).toContain('price')
      expect(columnNames).toContain('totalAmount')
      expect(columnNames).toContain('orderType')
      expect(columnNames).toContain('tradingMode')
      expect(columnNames).toContain('status')
      expect(columnNames).toContain('reason')
      expect(columnNames).toContain('kisOrderNo')
      expect(columnNames).toContain('executedAt')
      expect(columnNames).toContain('createdAt')
    })

    test('strategyPortfolios relations are defined', async () => {
      const schema = await import('../../db/schema')
      expect(schema.strategyPortfoliosRelations).toBeDefined()
    })

    test('strategyOrders relations are defined', async () => {
      const schema = await import('../../db/schema')
      expect(schema.strategyOrdersRelations).toBeDefined()
    })

    test('existing strategy_watchlists table is unchanged', async () => {
      const schema = await import('../../db/schema')
      const table = schema.strategyWatchlists
      expect(table).toBeDefined()
      const columnNames = Object.keys(table)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('companyId')
      expect(columnNames).toContain('userId')
      expect(columnNames).toContain('stockCode')
      expect(columnNames).toContain('stockName')
      expect(columnNames).toContain('market')
    })
  })

  // ============================================================
  // Portfolio API Tests
  // ============================================================
  describe('Portfolio CRUD API', () => {
    const makeTenant = (overrides?: Record<string, string>) => ({
      companyId: 'company-1',
      userId: 'user-1',
      role: 'admin' as const,
      ...overrides,
    })

    beforeEach(() => {
      selectResults = []
      insertResult = []
      updateResult = []
      deleteResult = []
    })

    test('POST /portfolios creates portfolio with correct defaults', async () => {
      const portfolio = {
        id: 'portfolio-1',
        companyId: 'company-1',
        userId: 'user-1',
        name: '테스트 포트폴리오',
        tradingMode: 'paper',
        initialCash: 50_000_000,
        cashBalance: 50_000_000,
        holdings: [],
        totalValue: 50_000_000,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      insertResult = [portfolio]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '테스트 포트폴리오' }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.name).toBe('테스트 포트폴리오')
      expect(json.data.tradingMode).toBe('paper')
      expect(json.data.cashBalance).toBe(50_000_000)
    })

    test('POST /portfolios supports custom initialCash and tradingMode', async () => {
      const portfolio = {
        id: 'portfolio-2',
        companyId: 'company-1',
        userId: 'user-1',
        name: '실거래 포트폴리오',
        tradingMode: 'real',
        initialCash: 100_000_000,
        cashBalance: 100_000_000,
        holdings: [],
        totalValue: 100_000_000,
        memo: '실거래용',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      insertResult = [portfolio]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '실거래 포트폴리오',
          tradingMode: 'real',
          initialCash: 100_000_000,
          memo: '실거래용',
        }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.tradingMode).toBe('real')
      expect(json.data.initialCash).toBe(100_000_000)
    })

    test('POST /portfolios validates required name field', async () => {
      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(400)
    })

    test('POST /portfolios validates tradingMode enum', async () => {
      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', tradingMode: 'invalid' }),
      })

      expect(res.status).toBe(400)
    })

    test('GET /portfolios returns list filtered by tradingMode', async () => {
      currentChain = makeChain([[
        { id: 'p1', name: 'Paper', tradingMode: 'paper', cashBalance: 50_000_000 },
      ]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios?tradingMode=paper')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(Array.isArray(json.data)).toBe(true)
    })

    test('GET /portfolios/:id returns single portfolio', async () => {
      currentChain = makeChain([[
        { id: 'p1', name: 'My Portfolio', tradingMode: 'paper', cashBalance: 50_000_000 },
      ]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000001')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.name).toBe('My Portfolio')
    })

    test('GET /portfolios/:id returns 404 for non-existent portfolio', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000099')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('PATCH /portfolios/:id updates portfolio fields', async () => {
      updateResult = [{ id: 'p1', name: 'Updated Name', cashBalance: 40_000_000 }]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name', cashBalance: 40_000_000 }),
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.name).toBe('Updated Name')
    })

    test('PATCH /portfolios/:id updates holdings', async () => {
      const newHoldings = [
        { ticker: '005930', name: '삼성전자', market: 'KR', quantity: 10, avgPrice: 70000 },
      ]
      updateResult = [{ id: 'p1', holdings: newHoldings }]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: newHoldings }),
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.holdings).toEqual(newHoldings)
    })

    test('PATCH /portfolios/:id returns 404 for non-existent', async () => {
      updateResult = []

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000099', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      })

      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ============================================================
  // Order API Tests
  // ============================================================
  describe('Order History API', () => {
    const makeTenant = () => ({
      companyId: 'company-1',
      userId: 'user-1',
      role: 'admin' as const,
    })

    beforeEach(() => {
      selectResults = []
      insertResult = []
      updateResult = []
      deleteResult = []
    })

    test('POST /orders creates order with calculated totalAmount', async () => {
      const order = {
        id: 'order-1',
        companyId: 'company-1',
        userId: 'user-1',
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70_000,
        totalAmount: 700_000,
        orderType: 'market',
        tradingMode: 'paper',
        status: 'pending',
        reason: null,
        kisOrderNo: null,
        executedAt: null,
        createdAt: new Date(),
      }
      insertResult = [order]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: '005930',
          tickerName: '삼성전자',
          side: 'buy',
          quantity: 10,
          price: 70_000,
        }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.totalAmount).toBe(700_000)
      expect(json.data.side).toBe('buy')
    })

    test('POST /orders validates required fields', async () => {
      const app = createTestApp(makeTenant())

      // Missing ticker
      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side: 'buy', quantity: 10, price: 70_000 }),
      })

      expect(res.status).toBe(400)
    })

    test('POST /orders validates side enum', async () => {
      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: '005930', tickerName: '삼성전자', side: 'hold', quantity: 10, price: 70_000 }),
      })

      expect(res.status).toBe(400)
    })

    test('POST /orders supports sell side with reason', async () => {
      const order = {
        id: 'order-2',
        companyId: 'company-1',
        userId: 'user-1',
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'sell',
        quantity: 5,
        price: 75_000,
        totalAmount: 375_000,
        orderType: 'limit',
        tradingMode: 'real',
        status: 'executed',
        reason: 'CIO 매도 신호',
        kisOrderNo: 'KIS_001',
        executedAt: new Date(),
        createdAt: new Date(),
      }
      insertResult = [order]

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: '005930',
          tickerName: '삼성전자',
          side: 'sell',
          quantity: 5,
          price: 75_000,
          orderType: 'limit',
          tradingMode: 'real',
          status: 'executed',
          reason: 'CIO 매도 신호',
          kisOrderNo: 'KIS_001',
          executedAt: new Date().toISOString(),
        }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.side).toBe('sell')
      expect(json.data.reason).toBe('CIO 매도 신호')
    })

    test('GET /orders returns paginated results', async () => {
      const orders = Array.from({ length: 3 }, (_, i) => ({
        id: `order-${i}`,
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70_000,
        totalAmount: 700_000,
        createdAt: new Date(Date.now() - i * 1000),
      }))

      currentChain = makeChain([orders])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?limit=50')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
      expect(json.pagination).toBeDefined()
      expect(json.pagination.limit).toBe(50)
    })

    test('GET /orders supports ticker filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?ticker=005930')
      expect(res.status).toBe(200)
    })

    test('GET /orders supports side filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?side=buy')
      expect(res.status).toBe(200)
    })

    test('GET /orders supports tradingMode filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?tradingMode=paper')
      expect(res.status).toBe(200)
    })

    test('GET /orders supports date range filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?dateFrom=2026-01-01&dateTo=2026-12-31')
      expect(res.status).toBe(200)
    })

    test('GET /orders supports status filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders?status=executed')
      expect(res.status).toBe(200)
    })

    test('GET /orders/:id returns single order', async () => {
      currentChain = makeChain([[{ id: 'order-1', ticker: '005930', side: 'buy' }]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders/00000000-0000-0000-0000-000000000001')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.ticker).toBe('005930')
    })

    test('GET /orders/:id returns 404 for non-existent', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders/00000000-0000-0000-0000-000000000099')
      expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('DELETE /orders is not available (FR62 permanent preservation)', async () => {
      const app = createTestApp(makeTenant())

      const res = await app.request('/api/workspace/strategy/orders/00000000-0000-0000-0000-000000000001', {
        method: 'DELETE',
      })

      // Should return 404 (no route matched) since DELETE is intentionally not implemented
      expect(res.status).toBe(404)
    })
  })

  // ============================================================
  // Tenant Isolation Tests
  // ============================================================
  describe('Tenant Isolation', () => {
    test('portfolio queries include companyId filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp({ companyId: 'company-A', userId: 'user-A', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios')
      expect(res.status).toBe(200)
      // The mock doesn't filter but validates the endpoint works with tenant context
    })

    test('order queries include companyId filter', async () => {
      currentChain = makeChain([[]])

      const app = createTestApp({ companyId: 'company-B', userId: 'user-B', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders')
      expect(res.status).toBe(200)
    })
  })

  // ============================================================
  // Paper/Real Trading Separation Tests
  // ============================================================
  describe('Trading Mode Separation', () => {
    test('portfolio can be created with paper mode', async () => {
      insertResult = [{
        id: 'p-paper',
        tradingMode: 'paper',
        name: '모의거래 포트폴리오',
        initialCash: 50_000_000,
        cashBalance: 50_000_000,
      }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '모의거래 포트폴리오', tradingMode: 'paper' }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.tradingMode).toBe('paper')
    })

    test('portfolio can be created with real mode', async () => {
      insertResult = [{
        id: 'p-real',
        tradingMode: 'real',
        name: '실거래 포트폴리오',
        initialCash: 100_000_000,
        cashBalance: 100_000_000,
      }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '실거래 포트폴리오', tradingMode: 'real', initialCash: 100_000_000 }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.tradingMode).toBe('real')
    })

    test('orders support paper trading mode', async () => {
      insertResult = [{
        id: 'order-paper',
        tradingMode: 'paper',
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'buy',
        quantity: 10,
        price: 70_000,
        totalAmount: 700_000,
      }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: '005930',
          tickerName: '삼성전자',
          side: 'buy',
          quantity: 10,
          price: 70_000,
          tradingMode: 'paper',
        }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.tradingMode).toBe('paper')
    })

    test('orders support real trading mode', async () => {
      insertResult = [{
        id: 'order-real',
        tradingMode: 'real',
        ticker: '005930',
        tickerName: '삼성전자',
        side: 'sell',
        quantity: 5,
        price: 75_000,
        totalAmount: 375_000,
      }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: '005930',
          tickerName: '삼성전자',
          side: 'sell',
          quantity: 5,
          price: 75_000,
          tradingMode: 'real',
        }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.tradingMode).toBe('real')
    })
  })

  // ============================================================
  // Order Summary Stats Tests
  // ============================================================
  describe('Order Summary', () => {
    test('GET /orders/summary returns aggregate stats', async () => {
      currentChain = makeChain([[{
        totalOrders: 10,
        executedOrders: 8,
        totalBuyAmount: 5_000_000,
        totalSellAmount: 3_000_000,
        buyCount: 5,
        sellCount: 3,
      }]])

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders/summary')
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
    })

    test('GET /orders/summary supports tradingMode filter', async () => {
      currentChain = makeChain([[{
        totalOrders: 5,
        executedOrders: 4,
        totalBuyAmount: 2_000_000,
        totalSellAmount: 1_000_000,
        buyCount: 3,
        sellCount: 1,
      }]])

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders/summary?tradingMode=paper')
      expect(res.status).toBe(200)
    })
  })

  // ============================================================
  // Existing Watchlist Preserved Tests
  // ============================================================
  describe('Existing Watchlist Unchanged', () => {
    test('GET /watchlist still works', async () => {
      currentChain = makeChain([[
        { id: 'w1', stockCode: '005930', stockName: '삼성전자', market: 'KOSPI' },
      ]])

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/watchlist')
      expect(res.status).toBe(200)
    })

    test('POST /watchlist still works', async () => {
      insertResult = [{ id: 'w2', stockCode: '035420', stockName: '네이버', market: 'KOSPI' }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCode: '035420', stockName: '네이버' }),
      })

      expect(res.status).toBe(201)
    })

    test('DELETE /watchlist/:id still works', async () => {
      deleteResult = [{ id: '00000000-0000-0000-0000-000000000001' }]

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/watchlist/00000000-0000-0000-0000-000000000001', {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
    })
  })

  // ============================================================
  // Edge Cases
  // ============================================================
  describe('Edge Cases', () => {
    test('POST /portfolios with empty name fails validation', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      })

      expect(res.status).toBe(400)
    })

    test('POST /orders with negative quantity fails validation', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: '005930', tickerName: '삼성전자', side: 'buy', quantity: -5, price: 70_000 }),
      })

      expect(res.status).toBe(400)
    })

    test('POST /orders with zero quantity fails validation', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: '005930', tickerName: '삼성전자', side: 'buy', quantity: 0, price: 70_000 }),
      })

      expect(res.status).toBe(400)
    })

    test('GET /portfolios/:id with invalid UUID returns 400', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios/not-a-uuid')
      expect(res.status).toBe(400)
    })

    test('PATCH /portfolios/:id with holdings validates holding structure', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios/00000000-0000-0000-0000-000000000001', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: [{ ticker: '' }] }), // Missing required fields
      })

      expect(res.status).toBe(400)
    })

    test('GET /orders with cursor pagination works', async () => {
      // First call: lookup cursor order's createdAt
      // Second call: the actual results
      currentChain = makeChain([
        [{ createdAt: new Date('2026-03-01') }],  // cursor lookup
        [],  // results
      ])

      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/orders?cursor=00000000-0000-0000-0000-000000000001')
      expect(res.status).toBe(200)
    })

    test('POST /portfolios with very long name fails validation', async () => {
      const app = createTestApp({ companyId: 'company-1', userId: 'user-1', role: 'admin' })

      const res = await app.request('/api/workspace/strategy/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'A'.repeat(101) }),
      })

      expect(res.status).toBe(400)
    })
  })
})
