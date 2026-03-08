import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { ToolExecContext } from '../../lib/tool-handlers/types'

// Mock fetch globally
const mockFetch = mock(() => Promise.resolve(new Response('{}', { status: 200 })))
globalThis.fetch = mockFetch as unknown as typeof fetch

// Mock KIS auth
mock.module('../../lib/tool-handlers/builtins/kis-auth', () => ({
  getKisToken: mock(() => Promise.resolve('mock-token')),
  invalidateKisToken: mock(() => {}),
  kisHeaders: mock((_token: string, _appKey: string, _appSecret: string, trId: string) => ({
    authorization: 'Bearer mock-token',
    appkey: 'test-key',
    appsecret: 'test-secret',
    tr_id: trId,
    'Content-Type': 'application/json; charset=utf-8',
  })),
  KIS_BASE_URL: 'https://openapi.koreainvestment.com:9443',
  KIS_BASE_REAL: 'https://openapi.koreainvestment.com:9443',
  KIS_BASE_PAPER: 'https://openapivts.koreainvestment.com:29443',
  getKisBaseUrl: mock((mode: string) => mode === 'paper' ? 'https://openapivts.koreainvestment.com:29443' : 'https://openapi.koreainvestment.com:9443'),
  KIS_TR_IDS: {
    domestic: {
      real: { buy: 'TTTC0012U', sell: 'TTTC0011U', balance: 'TTTC8434R' },
      paper: { buy: 'VTTC0012U', sell: 'VTTC0011U', balance: 'VTTC8434R' },
    },
    overseas: {
      real: { buy: 'TTTT1002U', sell: 'TTTT1006U', balance: 'TTTS3012R', price: 'HHDFS00000300' },
      paper: { buy: 'VTTT1002U', sell: 'VTTT1006U', balance: 'VTTS3012R', price: 'HHDFS00000300' },
    },
    price: { domestic: 'FHKST01010100', domesticDaily: 'FHKST03010100', overseas: 'HHDFS00000300' },
  },
  EXCHANGE_CODES: {
    order: { NASDAQ: 'NASD', NYSE: 'NYSE', AMEX: 'AMEX', NASD: 'NASD' },
    price: { NASD: 'NAS', NYSE: 'NYS', AMEX: 'AMS', NASDAQ: 'NAS' },
  },
}))

// Mock kis-adapter
mock.module('../../services/kis-adapter', () => ({
  executeOrder: mock(() => Promise.resolve({
    success: true,
    orderId: 'ord-123',
    message: '매수 주문이 접수되었습니다.',
    side: '매수',
    ticker: '005930',
    quantity: 10,
    price: 70000,
    status: 'submitted',
  })),
  getBalance: mock(() => Promise.resolve({
    success: true,
    cash: 5000000,
    holdings: [{ ticker: '005930', name: '삼성전자', quantity: 100, avgPrice: 65000, currentPrice: 70000, evalProfit: 500000 }],
    totalEval: 12000000,
    mode: 'paper',
  })),
  syncOrderStatus: mock(() => Promise.resolve({ success: true, status: 'executed', message: '체결 완료' })),
  getOverseasPrice: mock(() => Promise.resolve({
    success: true,
    data: { symbol: 'AAPL', price: 190.5, change: 2.3, changeRate: 1.22 },
  })),
}))

function createCtx(overrides: Partial<ToolExecContext> = {}): ToolExecContext {
  return {
    companyId: 'comp-1',
    agentId: 'agent-1',
    sessionId: 'sess-1',
    departmentId: 'dept-1',
    userId: 'user-1',
    getCredentials: mock((provider: string) => {
      if (provider === 'kis') return Promise.resolve({ app_key: 'test-key', app_secret: 'test-secret', account_no: '12345678901' })
      if (provider === 'dart') return Promise.resolve({ api_key: 'dart-test-key' })
      throw new Error(`No credentials for ${provider}`)
    }),
    ...overrides,
  }
}

function createCtxNoCredentials(): ToolExecContext {
  return {
    companyId: 'comp-1',
    agentId: 'agent-1',
    sessionId: 'sess-1',
    departmentId: 'dept-1',
    userId: 'user-1',
    getCredentials: mock(() => { throw new Error('No credentials') }),
  }
}

// ==========================================
// kr_stock tests
// ==========================================
describe('kr_stock tool', () => {
  let krStock: (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>

  beforeEach(async () => {
    mockFetch.mockReset()
    const mod = await import('../../lib/tool-handlers/builtins/kr-stock')
    krStock = mod.krStock
  })

  describe('action=price', () => {
    it('returns stock price data', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output: {
          stck_prpr: '70000', prdy_vrss: '1000', prdy_ctrt: '1.45',
          acml_vol: '15000000', stck_oprc: '69500', stck_hgpr: '70500',
          stck_lwpr: '69000', stck_sdpr: '69000', hts_kor_isnm: '삼성전자',
          hts_avls: '418000000',
        },
      }))))

      const result = JSON.parse(await krStock({ action: 'price', stockCode: '005930' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.currentPrice).toBe(70000)
      expect(result.name).toBe('삼성전자')
      expect(result.volume).toBe(15000000)
      expect(result.change).toBe(1000)
    })

    it('fails without stockCode', async () => {
      const result = JSON.parse(await krStock({ action: 'price' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('종목코드')
    })

    it('fails without credentials', async () => {
      const result = JSON.parse(await krStock({ action: 'price', stockCode: '005930' }, createCtxNoCredentials()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('KIS')
    })
  })

  describe('action=chart', () => {
    it('returns OHLCV chart data', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: [
          { stck_bsop_date: '20260305', stck_oprc: '69000', stck_hgpr: '70000', stck_lwpr: '68500', stck_clpr: '69500', acml_vol: '12000000' },
          { stck_bsop_date: '20260304', stck_oprc: '68000', stck_hgpr: '69500', stck_lwpr: '67800', stck_clpr: '69000', acml_vol: '11000000' },
        ],
      }))))

      const result = JSON.parse(await krStock({ action: 'chart', stockCode: '005930', days: 30 }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.action).toBe('chart')
      expect(result.data.length).toBe(2)
      expect(result.data[0].close).toBe(69000) // reversed: oldest first
    })
  })

  describe('action=indices', () => {
    it('returns KOSPI and KOSDAQ indices', async () => {
      mockFetch.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output: {
          bstp_nmix_prpr: '2550.12', bstp_nmix_prdy_vrss: '15.34',
          bstp_nmix_prdy_ctrt: '0.60', acml_vol: '500000000',
        },
      }))))

      const result = JSON.parse(await krStock({ action: 'indices' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.indices.length).toBe(2)
      expect(result.indices[0].name).toBe('KOSPI')
      expect(result.indices[0].value).toBe(2550.12)
    })

    it('returns single index when specified', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output: { bstp_nmix_prpr: '800.55' },
      }))))

      const result = JSON.parse(await krStock({ action: 'indices', indexCode: 'kosdaq' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.indices.length).toBe(1)
      expect(result.indices[0].name).toBe('KOSDAQ')
    })
  })

  it('rejects unknown action', async () => {
    const result = JSON.parse(await krStock({ action: 'unknown' }, createCtx()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('알 수 없는 action')
  })
})

// ==========================================
// dart_api tests
// ==========================================
describe('dart_api tool', () => {
  let dartApi: (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>

  beforeEach(async () => {
    mockFetch.mockReset()
    const mod = await import('../../lib/tool-handlers/builtins/dart-api')
    dartApi = mod.dartApi
  })

  describe('action=financial', () => {
    it('returns financial statements', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        status: '000',
        list: [
          { account_nm: '매출액', thstrm_amount: '302,231,477,000,000', frmtrm_amount: '258,935,042,000,000', sj_nm: '손익계산서' },
          { account_nm: '영업이익', thstrm_amount: '36,360,000,000,000', frmtrm_amount: '6,685,000,000,000', sj_nm: '손익계산서' },
        ],
      }))))

      const result = JSON.parse(await dartApi({ action: 'financial', corpCode: '00126380' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.financials.length).toBe(2)
      expect(result.financials[0].accountName).toBe('매출액')
      expect(result.financials[0].currentAmount).toBe(302231477000000)
    })

    it('fails without corpCode', async () => {
      const result = JSON.parse(await dartApi({ action: 'financial' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('기업코드')
    })
  })

  describe('action=company', () => {
    it('returns company info', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        status: '000',
        corp_code: '00126380',
        corp_name: '삼성전자',
        ceo_nm: '한종희',
        adres: '경기도 수원시',
        hm_url: 'www.samsung.com',
      }))))

      const result = JSON.parse(await dartApi({ action: 'company', corpCode: '00126380' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.corpName).toBe('삼성전자')
      expect(result.ceo).toBe('한종희')
    })
  })

  describe('action=disclosure', () => {
    it('returns disclosure list', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        status: '000',
        list: [
          { corp_name: '삼성전자', report_nm: '사업보고서', rcept_dt: '20260315', flr_nm: '삼성전자', rcept_no: '20260315000123' },
        ],
      }))))

      const result = JSON.parse(await dartApi({ action: 'disclosure', corpCode: '00126380' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.disclosures.length).toBe(1)
      expect(result.disclosures[0].reportName).toBe('사업보고서')
    })
  })

  it('fails without DART credentials', async () => {
    const result = JSON.parse(await dartApi({ action: 'financial', corpCode: '00126380' }, createCtxNoCredentials()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('DART')
  })

  it('rejects unknown action', async () => {
    const result = JSON.parse(await dartApi({ action: 'unknown' }, createCtx()))
    expect(result.success).toBe(false)
  })

  it('handles DART API error status', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
      status: '013',
      message: '조회된 데이터가 없습니다.',
    }))))

    const result = JSON.parse(await dartApi({ action: 'financial', corpCode: '99999999' }, createCtx()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('조회된 데이터가 없습니다')
  })
})

// ==========================================
// sec_edgar tests
// ==========================================
describe('sec_edgar tool', () => {
  let secEdgar: (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>
  let resetTickerCache: () => void

  beforeEach(async () => {
    mockFetch.mockReset()
    const mod = await import('../../lib/tool-handlers/builtins/sec-edgar')
    secEdgar = mod.secEdgar
    resetTickerCache = mod.resetTickerCache
    resetTickerCache()
  })

  describe('action=filings', () => {
    it('returns SEC filings', async () => {
      // First call: company_tickers.json
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
        '1': { cik_str: 789019, ticker: 'MSFT', title: 'Microsoft Corp' },
      }))))
      // Second call: CIK submissions
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        recent: {
          form: ['10-K', '10-Q', '8-K', '4'],
          filingDate: ['2026-02-01', '2025-11-01', '2025-10-15', '2025-09-20'],
          reportDate: ['2025-12-31', '2025-09-30', '', ''],
          accessionNumber: ['0000320193-26-000001', '0000320193-25-000002', '0000320193-25-000003', '0000320193-25-000004'],
          primaryDocument: ['aapl-10k.htm', 'aapl-10q.htm', 'aapl-8k.htm', 'form4.htm'],
          primaryDocDescription: ['Annual Report', 'Quarterly Report', 'Current Report', 'Form 4'],
        },
      }))))

      const result = JSON.parse(await secEdgar({ action: 'filings', ticker: 'AAPL', count: 3 }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.ticker).toBe('AAPL')
      expect(result.cik).toBe(320193)
      expect(result.filings.length).toBe(3)
      expect(result.filings[0].formType).toBe('10-K')
    })

    it('filters by formType', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
      }))))
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        recent: {
          form: ['10-K', '10-Q', '8-K', '10-K'],
          filingDate: ['2026-02-01', '2025-11-01', '2025-10-15', '2025-02-01'],
          reportDate: ['', '', '', ''],
          accessionNumber: ['acc1', 'acc2', 'acc3', 'acc4'],
          primaryDocument: ['d1.htm', 'd2.htm', 'd3.htm', 'd4.htm'],
          primaryDocDescription: ['', '', '', ''],
        },
      }))))

      const result = JSON.parse(await secEdgar({ action: 'filings', ticker: 'AAPL', formType: '10-K' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.filings.length).toBe(2)
      expect(result.filings.every((f: { formType: string }) => f.formType === '10-K')).toBe(true)
    })

    it('fails without ticker', async () => {
      const result = JSON.parse(await secEdgar({ action: 'filings' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('티커')
    })
  })

  describe('action=insider', () => {
    it('returns insider filings (Form 4)', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
      }))))
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        recent: {
          form: ['10-K', '4', '4/A', '8-K', '4'],
          filingDate: ['2026-02-01', '2026-01-15', '2026-01-10', '2025-12-20', '2025-12-15'],
          accessionNumber: ['acc1', 'acc2', 'acc3', 'acc4', 'acc5'],
          primaryDocument: ['d1.htm', 'd2.xml', 'd3.xml', 'd4.htm', 'd5.xml'],
          primaryDocDescription: ['', 'Form 4', 'Form 4/A', '', 'Form 4'],
        },
      }))))

      const result = JSON.parse(await secEdgar({ action: 'insider', ticker: 'AAPL' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.insiderFilings.length).toBe(3)
      expect(result.insiderFilings.every((f: { formType: string }) => f.formType === '4' || f.formType === '4/A')).toBe(true)
    })
  })

  describe('action=company', () => {
    it('returns company info', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
      }))))
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        name: 'Apple Inc.',
        cik: 320193,
        entityType: 'operating',
        sic: '3571',
        sicDescription: 'ELECTRONIC COMPUTERS',
        stateOfIncorporation: 'CA',
        fiscalYearEnd: '0930',
        exchanges: ['Nasdaq'],
        tickers: ['AAPL'],
        ein: '942404110',
        category: 'Large accelerated filer',
        addresses: { mailing: { phone: '408-996-1010' } },
      }))))

      const result = JSON.parse(await secEdgar({ action: 'company', ticker: 'AAPL' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.name).toBe('Apple Inc.')
      expect(result.cik).toBe(320193)
      expect(result.sic).toBe('3571')
    })
  })

  it('handles unknown ticker', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
      '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
    }))))

    const result = JSON.parse(await secEdgar({ action: 'filings', ticker: 'ZZZZZ' }, createCtx()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('CIK')
  })

  it('rejects unknown action', async () => {
    const result = JSON.parse(await secEdgar({ action: 'unknown' }, createCtx()))
    expect(result.success).toBe(false)
  })
})

// ==========================================
// backtest_engine tests
// ==========================================
describe('backtest_engine tool', () => {
  let backtestEngine: (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>

  beforeEach(async () => {
    mockFetch.mockReset()
    const mod = await import('../../lib/tool-handlers/builtins/backtest-engine')
    backtestEngine = mod.backtestEngine
  })

  function mockChartData(days: number = 100) {
    const data: Array<Record<string, string>> = []
    const basePrice = 50000
    for (let i = days; i >= 1; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
      // Create some price movement for strategy signals
      const noise = Math.sin(i / 5) * 3000 + Math.sin(i / 20) * 5000
      const close = Math.round(basePrice + noise)
      data.push({
        stck_bsop_date: dateStr,
        stck_oprc: String(close - 200),
        stck_hgpr: String(close + 500),
        stck_lwpr: String(close - 500),
        stck_clpr: String(close),
        acml_vol: '10000000',
      })
    }
    return data
  }

  describe('action=backtest', () => {
    it('runs golden_cross strategy', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'golden_cross',
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.result.strategy).toBe('golden_cross')
      expect(result.result.initialCapital).toBe(10_000_000)
      expect(typeof result.result.finalCapital).toBe('number')
      expect(typeof result.result.totalReturn).toBe('number')
      expect(typeof result.result.mdd).toBe('number')
      expect(typeof result.result.winRate).toBe('number')
    })

    it('runs rsi strategy', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'rsi',
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.result.strategy).toBe('rsi')
    })

    it('runs macd strategy', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'macd',
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.result.strategy).toBe('macd')
    })

    it('runs buy_and_hold strategy', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'buy_and_hold',
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.result.strategy).toBe('buy_and_hold')
      expect(result.result.tradeCount).toBe(2) // buy + sell
    })

    it('accepts custom initial capital', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'golden_cross', initialCapital: 50_000_000,
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.result.initialCapital).toBe(50_000_000)
    })

    it('fails without stockCode', async () => {
      const result = JSON.parse(await backtestEngine({ action: 'backtest', strategy: 'rsi' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('종목코드')
    })

    it('rejects unknown strategy', async () => {
      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'unknown_strat',
      }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('알 수 없는 전략')
    })

    it('fails with insufficient data', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(10), // Only 10 days
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'backtest', stockCode: '005930', strategy: 'golden_cross',
      }, createCtx()))

      expect(result.success).toBe(false)
      expect(result.message).toContain('데이터 부족')
    })
  })

  describe('action=compare', () => {
    it('compares all strategies', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({
        rt_cd: '0',
        output2: mockChartData(100),
      }))))

      const result = JSON.parse(await backtestEngine({
        action: 'compare', stockCode: '005930',
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.comparison.length).toBe(4) // golden_cross, rsi, macd, buy_and_hold
      expect(result.bestStrategy).toBeDefined()
      // Should be sorted by return
      for (let i = 0; i < result.comparison.length - 1; i++) {
        expect(parseFloat(result.comparison[i].totalReturn)).toBeGreaterThanOrEqual(
          parseFloat(result.comparison[i + 1].totalReturn),
        )
      }
    })
  })

  it('fails without credentials', async () => {
    const result = JSON.parse(await backtestEngine({ action: 'backtest', stockCode: '005930' }, createCtxNoCredentials()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('KIS')
  })

  it('rejects unknown action', async () => {
    const result = JSON.parse(await backtestEngine({ action: 'unknown' }, createCtx()))
    expect(result.success).toBe(false)
  })
})

// ==========================================
// kis_trading tests
// ==========================================
describe('kis_trading tool', () => {
  let kisTrading: (input: Record<string, unknown>, ctx: ToolExecContext) => Promise<string>

  beforeEach(async () => {
    const mod = await import('../../lib/tool-handlers/builtins/kis-trading')
    kisTrading = mod.kisTrading
  })

  describe('action=buy', () => {
    it('executes buy order via kis-adapter', async () => {
      const result = JSON.parse(await kisTrading({
        action: 'buy', stockCode: '005930', quantity: 10, price: 70000,
      }, createCtx()))

      expect(result.success).toBe(true)
      expect(result.message).toContain('매수')
    })

    it('fails without stockCode', async () => {
      const result = JSON.parse(await kisTrading({ action: 'buy', quantity: 10, price: 70000 }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('종목코드')
    })

    it('fails without quantity', async () => {
      const result = JSON.parse(await kisTrading({ action: 'buy', stockCode: '005930', price: 70000 }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('수량')
    })

    it('rejects negative price', async () => {
      const result = JSON.parse(await kisTrading({
        action: 'buy', stockCode: '005930', quantity: 10, price: -100,
      }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('가격')
    })
  })

  describe('action=sell', () => {
    it('executes sell order', async () => {
      const result = JSON.parse(await kisTrading({
        action: 'sell', stockCode: '005930', quantity: 10, price: 70000,
      }, createCtx()))

      expect(result.success).toBe(true)
    })
  })

  describe('action=balance', () => {
    it('returns account balance', async () => {
      const result = JSON.parse(await kisTrading({ action: 'balance' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.cash).toBe(5000000)
      expect(result.holdings.length).toBe(1)
    })

    it('accepts tradingMode parameter', async () => {
      const result = JSON.parse(await kisTrading({ action: 'balance', tradingMode: 'real' }, createCtx()))
      expect(result.success).toBe(true)
    })
  })

  describe('action=overseas_price', () => {
    it('returns overseas stock price', async () => {
      const result = JSON.parse(await kisTrading({ action: 'overseas_price', symbol: 'AAPL' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.data.symbol).toBe('AAPL')
    })

    it('fails without symbol', async () => {
      const result = JSON.parse(await kisTrading({ action: 'overseas_price' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('심볼')
    })
  })

  describe('action=order_status', () => {
    it('returns order status', async () => {
      const result = JSON.parse(await kisTrading({ action: 'order_status', orderId: 'ord-123' }, createCtx()))
      expect(result.success).toBe(true)
      expect(result.status).toBe('executed')
    })

    it('fails without orderId', async () => {
      const result = JSON.parse(await kisTrading({ action: 'order_status' }, createCtx()))
      expect(result.success).toBe(false)
      expect(result.message).toContain('주문ID')
    })
  })

  it('fails without action', async () => {
    const result = JSON.parse(await kisTrading({}, createCtx()))
    expect(result.success).toBe(false)
    expect(result.message).toContain('action')
  })

  it('rejects unknown action', async () => {
    const result = JSON.parse(await kisTrading({ action: 'unknown' }, createCtx()))
    expect(result.success).toBe(false)
  })
})

// ==========================================
// ToolPool registration test
// ==========================================
describe('ToolPool registration', () => {
  it('registers all 5 finance tools', async () => {
    // Import registry (which triggers all registrations)
    const { registry } = await import('../../lib/tool-handlers/index')

    expect(registry.get('kr_stock')).toBeDefined()
    expect(registry.get('dart_api')).toBeDefined()
    expect(registry.get('sec_edgar')).toBeDefined()
    expect(registry.get('backtest_engine')).toBeDefined()
    expect(registry.get('kis_trading')).toBeDefined()
  })

  it('does not conflict with existing tools', async () => {
    const { registry } = await import('../../lib/tool-handlers/index')

    // Existing tools should still be registered
    expect(registry.get('get_stock_price')).toBeDefined()
    expect(registry.get('place_stock_order')).toBeDefined()
    expect(registry.get('get_account_balance')).toBeDefined()
    expect(registry.get('company_analyzer')).toBeDefined()
    expect(registry.get('market_overview')).toBeDefined()

    // New tools should be different from existing ones
    expect(registry.get('kr_stock')).not.toBe(registry.get('get_stock_price'))
    expect(registry.get('kis_trading')).not.toBe(registry.get('place_stock_order'))
    expect(registry.get('dart_api')).not.toBe(registry.get('company_analyzer'))
  })
})
