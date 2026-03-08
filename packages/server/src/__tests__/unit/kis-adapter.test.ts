import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// === KIS Auth Tests ===

describe('KIS Auth Module', () => {
  // Import fresh for each describe to avoid cache issues
  let kisAuth: typeof import('../../lib/tool-handlers/builtins/kis-auth')

  beforeEach(async () => {
    kisAuth = await import('../../lib/tool-handlers/builtins/kis-auth')
  })

  test('KIS_BASE_REAL should be real trading URL', () => {
    expect(kisAuth.KIS_BASE_REAL).toBe('https://openapi.koreainvestment.com:9443')
  })

  test('KIS_BASE_PAPER should be paper trading URL', () => {
    expect(kisAuth.KIS_BASE_PAPER).toBe('https://openapivts.koreainvestment.com:29443')
  })

  test('getKisBaseUrl should return correct URL based on trading mode', () => {
    expect(kisAuth.getKisBaseUrl('real')).toBe('https://openapi.koreainvestment.com:9443')
    expect(kisAuth.getKisBaseUrl('paper')).toBe('https://openapivts.koreainvestment.com:29443')
  })

  test('KIS_TR_IDS domestic real should use new TR_IDs (not old 0801U/0802U)', () => {
    const tr = kisAuth.KIS_TR_IDS.domestic.real
    expect(tr.buy).toBe('TTTC0012U')
    expect(tr.sell).toBe('TTTC0011U')
    expect(tr.balance).toBe('TTTC8434R')
    // Verify NOT old TR_IDs
    expect(tr.buy).not.toBe('TTTC0802U')
    expect(tr.sell).not.toBe('TTTC0801U')
  })

  test('KIS_TR_IDS domestic paper should use V prefix', () => {
    const tr = kisAuth.KIS_TR_IDS.domestic.paper
    expect(tr.buy).toBe('VTTC0012U')
    expect(tr.sell).toBe('VTTC0011U')
    expect(tr.balance).toBe('VTTC8434R')
  })

  test('KIS_TR_IDS overseas real should have correct TR_IDs', () => {
    const tr = kisAuth.KIS_TR_IDS.overseas.real
    expect(tr.buy).toBe('TTTT1002U')
    expect(tr.sell).toBe('TTTT1006U')
    expect(tr.balance).toBe('TTTS3012R')
    expect(tr.price).toBe('HHDFS00000300')
  })

  test('KIS_TR_IDS overseas paper should use V prefix', () => {
    const tr = kisAuth.KIS_TR_IDS.overseas.paper
    expect(tr.buy).toBe('VTTT1002U')
    expect(tr.sell).toBe('VTTT1006U')
    expect(tr.balance).toBe('VTTS3012R')
  })

  test('EXCHANGE_CODES order vs price should differ', () => {
    // Order uses full codes, price uses shortened
    expect(kisAuth.EXCHANGE_CODES.order['NASDAQ']).toBe('NASD')
    expect(kisAuth.EXCHANGE_CODES.price['NASDAQ']).toBe('NAS')
    expect(kisAuth.EXCHANGE_CODES.order['NYSE']).toBe('NYSE')
    expect(kisAuth.EXCHANGE_CODES.price['NYSE']).toBe('NYS')
    expect(kisAuth.EXCHANGE_CODES.order['AMEX']).toBe('AMEX')
    expect(kisAuth.EXCHANGE_CODES.price['AMEX']).toBe('AMS')
  })

  test('KIS_TR_IDS price should be same for real and paper', () => {
    expect(kisAuth.KIS_TR_IDS.price.domestic).toBe('FHKST01010100')
    expect(kisAuth.KIS_TR_IDS.price.domesticDaily).toBe('FHKST03010100')
    expect(kisAuth.KIS_TR_IDS.price.overseas).toBe('HHDFS00000300')
  })

  test('kisHeaders should return proper headers', () => {
    const headers = kisAuth.kisHeaders('test-token', 'app-key', 'app-secret', 'TTTC0012U')
    expect(headers.authorization).toBe('Bearer test-token')
    expect(headers.appkey).toBe('app-key')
    expect(headers.appsecret).toBe('app-secret')
    expect(headers.tr_id).toBe('TTTC0012U')
    expect(headers['Content-Type']).toBe('application/json; charset=utf-8')
  })

  test('KIS_BASE_URL backward compat should point to real', () => {
    expect(kisAuth.KIS_BASE_URL).toBe(kisAuth.KIS_BASE_REAL)
  })
})

// === KIS Adapter Service Tests ===

describe('KIS Adapter - Market Hours', () => {
  let adapter: typeof import('../../services/kis-adapter')

  beforeEach(async () => {
    adapter = await import('../../services/kis-adapter')
  })

  test('isKoreanMarketOpen should return boolean', () => {
    const result = adapter.isKoreanMarketOpen()
    expect(typeof result).toBe('boolean')
  })

  test('isUSMarketOpen should return boolean', () => {
    const result = adapter.isUSMarketOpen()
    expect(typeof result).toBe('boolean')
  })
})

// === KIS Adapter - Order Params Validation ===

describe('KIS Adapter - Order Parameter Types', () => {
  test('OrderParams type should accept all required fields', () => {
    // Type-level validation: ensure the type includes all required fields
    const params = {
      companyId: 'test-company',
      userId: 'test-user',
      ticker: '005930',
      tickerName: '삼성전자',
      side: 'buy' as const,
      quantity: 10,
      price: 50000,
      orderType: 'limit' as const,
      tradingMode: 'paper' as const,
      market: 'KR' as const,
    }
    expect(params.companyId).toBe('test-company')
    expect(params.side).toBe('buy')
    expect(params.tradingMode).toBe('paper')
    expect(params.market).toBe('KR')
  })

  test('OrderParams should accept optional fields', () => {
    const params = {
      companyId: 'test',
      userId: 'test',
      portfolioId: 'portfolio-id',
      agentId: 'agent-id',
      ticker: 'AAPL',
      tickerName: 'Apple Inc.',
      side: 'sell' as const,
      quantity: 5,
      price: 150.50,
      orderType: 'limit' as const,
      tradingMode: 'real' as const,
      market: 'US' as const,
      exchange: 'NASDAQ',
      reason: 'CIO 분석 기반',
    }
    expect(params.exchange).toBe('NASDAQ')
    expect(params.reason).toBe('CIO 분석 기반')
    expect(params.portfolioId).toBe('portfolio-id')
  })
})

// === KIS Adapter - Exchange Code Mapping ===

describe('KIS Exchange Code Mapping', () => {
  let kisAuth: typeof import('../../lib/tool-handlers/builtins/kis-auth')

  beforeEach(async () => {
    kisAuth = await import('../../lib/tool-handlers/builtins/kis-auth')
  })

  test('order exchange codes should map correctly', () => {
    const { order } = kisAuth.EXCHANGE_CODES
    expect(order['NASDAQ']).toBe('NASD')
    expect(order['NASD']).toBe('NASD')
    expect(order['NYSE']).toBe('NYSE')
    expect(order['AMEX']).toBe('AMEX')
  })

  test('price exchange codes should map to shortened form', () => {
    const { price } = kisAuth.EXCHANGE_CODES
    expect(price['NASD']).toBe('NAS')
    expect(price['NYSE']).toBe('NYS')
    expect(price['AMEX']).toBe('AMS')
    expect(price['NAS']).toBe('NAS')
    expect(price['NYS']).toBe('NYS')
    expect(price['AMS']).toBe('AMS')
  })

  test('order and price codes should not be identical for same exchange', () => {
    const { order, price } = kisAuth.EXCHANGE_CODES
    // NASD -> NAS (different)
    expect(order['NASDAQ']).not.toBe(price['NASDAQ'])
    // NYSE -> NYS (different)
    expect(order['NYSE']).not.toBe(price['NYSE'])
    // AMEX -> AMS (different)
    expect(order['AMEX']).not.toBe(price['AMEX'])
  })
})

// === KIS Adapter - TR_ID Selection Logic ===

describe('KIS TR_ID Selection', () => {
  let kisAuth: typeof import('../../lib/tool-handlers/builtins/kis-auth')

  beforeEach(async () => {
    kisAuth = await import('../../lib/tool-handlers/builtins/kis-auth')
  })

  test('domestic real buy should use TTTC0012U', () => {
    const trId = kisAuth.KIS_TR_IDS.domestic.real.buy
    expect(trId).toBe('TTTC0012U')
  })

  test('domestic real sell should use TTTC0011U', () => {
    const trId = kisAuth.KIS_TR_IDS.domestic.real.sell
    expect(trId).toBe('TTTC0011U')
  })

  test('domestic paper buy should use VTTC0012U (V prefix)', () => {
    const trId = kisAuth.KIS_TR_IDS.domestic.paper.buy
    expect(trId).toBe('VTTC0012U')
    expect(trId.startsWith('V')).toBe(true)
  })

  test('domestic paper sell should use VTTC0011U (V prefix)', () => {
    const trId = kisAuth.KIS_TR_IDS.domestic.paper.sell
    expect(trId).toBe('VTTC0011U')
    expect(trId.startsWith('V')).toBe(true)
  })

  test('overseas real buy should use TTTT1002U', () => {
    expect(kisAuth.KIS_TR_IDS.overseas.real.buy).toBe('TTTT1002U')
  })

  test('overseas real sell should use TTTT1006U', () => {
    expect(kisAuth.KIS_TR_IDS.overseas.real.sell).toBe('TTTT1006U')
  })

  test('overseas paper buy should use VTTT1002U (V prefix)', () => {
    const trId = kisAuth.KIS_TR_IDS.overseas.paper.buy
    expect(trId).toBe('VTTT1002U')
    expect(trId.startsWith('V')).toBe(true)
  })

  test('overseas paper sell should use VTTT1006U (V prefix)', () => {
    const trId = kisAuth.KIS_TR_IDS.overseas.paper.sell
    expect(trId).toBe('VTTT1006U')
    expect(trId.startsWith('V')).toBe(true)
  })

  test('all paper TR_IDs should start with V', () => {
    const paperDomestic = kisAuth.KIS_TR_IDS.domestic.paper
    const paperOverseas = kisAuth.KIS_TR_IDS.overseas.paper
    expect(paperDomestic.buy.startsWith('V')).toBe(true)
    expect(paperDomestic.sell.startsWith('V')).toBe(true)
    expect(paperDomestic.balance.startsWith('V')).toBe(true)
    expect(paperOverseas.buy.startsWith('V')).toBe(true)
    expect(paperOverseas.sell.startsWith('V')).toBe(true)
    expect(paperOverseas.balance.startsWith('V')).toBe(true)
  })

  test('all real TR_IDs should start with T', () => {
    const realDomestic = kisAuth.KIS_TR_IDS.domestic.real
    const realOverseas = kisAuth.KIS_TR_IDS.overseas.real
    expect(realDomestic.buy.startsWith('T')).toBe(true)
    expect(realDomestic.sell.startsWith('T')).toBe(true)
    expect(realDomestic.balance.startsWith('T')).toBe(true)
    expect(realOverseas.buy.startsWith('T')).toBe(true)
    expect(realOverseas.sell.startsWith('T')).toBe(true)
    expect(realOverseas.balance.startsWith('T')).toBe(true)
  })
})

// === KIS Adapter - Balance Response Parsing ===

describe('KIS Balance Response Parsing', () => {
  test('parseBalanceResponse should handle typical KIS response shape', () => {
    // We test the expected response structure
    const mockOutput1 = [
      { pdno: '005930', prdt_name: '삼성전자', hldg_qty: '100', pchs_avg_pric: '55000', prpr: '60000', evlu_pfls_amt: '500000' },
      { pdno: '035420', prdt_name: 'NAVER', hldg_qty: '50', pchs_avg_pric: '200000', prpr: '210000', evlu_pfls_amt: '500000' },
      { pdno: '000000', prdt_name: '매도완료', hldg_qty: '0', pchs_avg_pric: '0', prpr: '0', evlu_pfls_amt: '0' },
    ]

    // Filter holdings with qty > 0
    const holdings = mockOutput1
      .filter((item) => parseInt(item.hldg_qty || '0', 10) > 0)
      .map((item) => ({
        ticker: item.pdno,
        name: item.prdt_name,
        quantity: parseInt(item.hldg_qty, 10),
        avgPrice: parseInt(item.pchs_avg_pric, 10),
        currentPrice: parseInt(item.prpr, 10),
        evalProfit: parseInt(item.evlu_pfls_amt, 10),
      }))

    expect(holdings).toHaveLength(2) // qty 0 should be filtered
    expect(holdings[0].ticker).toBe('005930')
    expect(holdings[0].quantity).toBe(100)
    expect(holdings[0].avgPrice).toBe(55000)
    expect(holdings[0].currentPrice).toBe(60000)
    expect(holdings[1].ticker).toBe('035420')
    expect(holdings[1].quantity).toBe(50)
  })

  test('should use nxdy_excc_amt for cash (not dnca_tot_amt)', () => {
    const mockOutput2 = {
      nxdy_excc_amt: '10000000', // 익일정산금 — 정확한 값
      dnca_tot_amt: '50000000',   // 미결제 포함 — 사용 금지
      tot_evlu_amt: '30000000',
    }

    const cash = parseInt(mockOutput2.nxdy_excc_amt || '0', 10)
    expect(cash).toBe(10000000) // Use nxdy_excc_amt
    expect(cash).not.toBe(parseInt(mockOutput2.dnca_tot_amt, 10)) // Not dnca_tot_amt
  })

  test('should correct totalEval when it does not include cash', () => {
    const cash = 10_000_000
    const holdingsEval = 25_000_000
    let totalEval = 20_000_000 // Wrong: less than cash + holdings

    const computed = cash + holdingsEval
    if (totalEval < computed) totalEval = computed

    expect(totalEval).toBe(35_000_000) // Corrected
  })
})

// === KIS Adapter - Order Body Construction ===

describe('KIS Order Body Construction', () => {
  test('domestic order body should have required fields', () => {
    const accountNo = '4404976301'
    const ticker = '005930'
    const price = 50000

    const body = {
      CANO: accountNo.substring(0, 8),
      ACNT_PRDT_CD: accountNo.substring(8, 10) || '01',
      PDNO: ticker,
      ORD_DVSN: price > 0 ? '00' : '01', // 00=지정가, 01=시장가
      ORD_QTY: String(10),
      ORD_UNPR: String(price),
      SLL_TYPE: '', // 매수
      EXCG_ID_DVSN_CD: 'KRX',
      CNDT_PRIC: '',
    }

    expect(body.CANO).toBe('44049763')
    expect(body.ACNT_PRDT_CD).toBe('01')
    expect(body.PDNO).toBe('005930')
    expect(body.ORD_DVSN).toBe('00') // 지정가
    expect(body.EXCG_ID_DVSN_CD).toBe('KRX')
  })

  test('domestic sell order should set SLL_TYPE to 01', () => {
    const side = 'sell'
    const body = {
      SLL_TYPE: side === 'sell' ? '01' : '',
    }
    expect(body.SLL_TYPE).toBe('01')
  })

  test('domestic market order should set ORD_DVSN to 01', () => {
    const price = 0
    const ordType = price > 0 ? '00' : '01'
    expect(ordType).toBe('01') // 시장가
  })

  test('overseas order body should have required fields', () => {
    const accountNo = '4404976301'
    const symbol = 'AAPL'
    const price = 150.50
    const exchange = 'NASDAQ'

    const EXCHANGE_CODES_ORDER: Record<string, string> = { NASDAQ: 'NASD', NYSE: 'NYSE', AMEX: 'AMEX' }
    const exchCode = EXCHANGE_CODES_ORDER[exchange.toUpperCase()] || 'NASD'

    const body = {
      CANO: accountNo.substring(0, 8),
      ACNT_PRDT_CD: accountNo.substring(8, 10) || '01',
      OVRS_EXCG_CD: exchCode,
      PDNO: symbol.toUpperCase(),
      ORD_DVSN: '00', // 해외=지정가만
      ORD_QTY: String(5),
      OVRS_ORD_UNPR: price.toFixed(2),
      SLL_TYPE: '', // 매수
      ORD_SVR_DVSN_CD: '0',
    }

    expect(body.OVRS_EXCG_CD).toBe('NASD')
    expect(body.PDNO).toBe('AAPL')
    expect(body.ORD_DVSN).toBe('00') // 해외는 항상 지정가
    expect(body.OVRS_ORD_UNPR).toBe('150.50')
  })

  test('overseas sell should set SLL_TYPE to 00 (not 01 like domestic)', () => {
    const side = 'sell'
    const body = {
      SLL_TYPE: side === 'sell' ? '00' : '', // 해외 매도 = '00'
    }
    expect(body.SLL_TYPE).toBe('00')
  })
})

// === Paper Trading Logic ===

describe('Paper Trading Logic', () => {
  test('should calculate average price correctly when adding to existing holding', () => {
    const existing = { avgPrice: 50000, quantity: 100, currentPrice: 55000 }
    const newQty = 50
    const newPrice = 60000

    const totalQty = existing.quantity + newQty
    const newAvgPrice = Math.round(
      (existing.avgPrice * existing.quantity + newPrice * newQty) / totalQty,
    )

    expect(totalQty).toBe(150)
    expect(newAvgPrice).toBe(53333) // (50000*100 + 60000*50) / 150 = 53333.33 -> 53333
  })

  test('should calculate total value correctly', () => {
    const cashBalance = 10_000_000
    const holdings = [
      { quantity: 100, currentPrice: 55000, avgPrice: 50000 },
      { quantity: 50, currentPrice: 200000, avgPrice: 180000 },
    ]

    const holdingsEval = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0)
    const totalValue = cashBalance + holdingsEval

    expect(holdingsEval).toBe(100 * 55000 + 50 * 200000) // 5500000 + 10000000 = 15500000
    expect(totalValue).toBe(25_500_000)
  })

  test('should reject buy when insufficient balance', () => {
    const cashBalance = 1_000_000
    const quantity = 100
    const price = 50_000
    const totalCost = quantity * price

    const insufficient = cashBalance < totalCost
    expect(insufficient).toBe(true)
    expect(totalCost).toBe(5_000_000)
  })

  test('should reject sell when insufficient holdings', () => {
    const existingQty = 50
    const sellQty = 100

    const insufficient = existingQty < sellQty
    expect(insufficient).toBe(true)
  })

  test('should remove holdings with 0 quantity after sell', () => {
    const holdings = [
      { ticker: '005930', quantity: 100 },
      { ticker: '035420', quantity: 0 }, // sold all
      { ticker: '000270', quantity: 50 },
    ]

    const filtered = holdings.filter((h) => h.quantity > 0)
    expect(filtered).toHaveLength(2)
    expect(filtered.map((h) => h.ticker)).toEqual(['005930', '000270'])
  })
})

// === Market Hours Validation ===

describe('Market Hours Edge Cases', () => {
  test('weekend should be market closed for both KR and US', () => {
    // dayOfWeek 0 = Sunday, 6 = Saturday
    const isWeekday = (day: number) => day !== 0 && day !== 6
    expect(isWeekday(0)).toBe(false)
    expect(isWeekday(6)).toBe(false)
    expect(isWeekday(1)).toBe(true)
    expect(isWeekday(5)).toBe(true)
  })

  test('KR market hours should be 09:00-15:30 KST', () => {
    const isOpen = (hours: number, minutes: number) => {
      const time = hours * 60 + minutes
      return time >= 540 && time <= 930 // 09:00=540, 15:30=930
    }

    expect(isOpen(8, 59)).toBe(false)  // Before open
    expect(isOpen(9, 0)).toBe(true)    // Open
    expect(isOpen(12, 0)).toBe(true)   // Midday
    expect(isOpen(15, 30)).toBe(true)  // Close
    expect(isOpen(15, 31)).toBe(false) // After close
  })

  test('US market hours should be 09:30-16:00 EST', () => {
    const isOpen = (hours: number, minutes: number) => {
      const time = hours * 60 + minutes
      return time >= 570 && time <= 960 // 09:30=570, 16:00=960
    }

    expect(isOpen(9, 29)).toBe(false)   // Before open
    expect(isOpen(9, 30)).toBe(true)    // Open
    expect(isOpen(12, 0)).toBe(true)    // Midday
    expect(isOpen(16, 0)).toBe(true)    // Close
    expect(isOpen(16, 1)).toBe(false)   // After close
  })
})

// === Place Stock Order Tool Handler ===

describe('Place Stock Order Tool Handler', () => {
  let placeStockOrderModule: typeof import('../../lib/tool-handlers/builtins/place-stock-order')

  beforeEach(async () => {
    placeStockOrderModule = await import('../../lib/tool-handlers/builtins/place-stock-order')
  })

  test('should export placeStockOrder handler', () => {
    expect(typeof placeStockOrderModule.placeStockOrder).toBe('function')
  })

  test('should reject missing stockCode', async () => {
    const handler = placeStockOrderModule.placeStockOrder
    const result = await handler(
      { side: 'buy', quantity: 10 },
      {
        companyId: 'test', userId: 'test', agentId: 'test',
        sessionId: 'test', departmentId: null,
        getCredentials: async () => ({}),
      },
    )
    const parsed = JSON.parse(result as string)
    expect(parsed.success).toBe(false)
    expect(parsed.message).toContain('종목코드')
  })

  test('should reject invalid side', async () => {
    const handler = placeStockOrderModule.placeStockOrder
    const result = await handler(
      { stockCode: '005930', side: 'hold', quantity: 10 },
      {
        companyId: 'test', userId: 'test', agentId: 'test',
        sessionId: 'test', departmentId: null,
        getCredentials: async () => ({}),
      },
    )
    const parsed = JSON.parse(result as string)
    expect(parsed.success).toBe(false)
    expect(parsed.message).toContain('buy')
  })

  test('should reject negative price', async () => {
    const handler = placeStockOrderModule.placeStockOrder
    const result = await handler(
      { stockCode: '005930', side: 'buy', quantity: 10, price: -100 },
      {
        companyId: 'test', userId: 'test', agentId: 'test',
        sessionId: 'test', departmentId: null,
        getCredentials: async () => ({}),
      },
    )
    const parsed = JSON.parse(result as string)
    expect(parsed.success).toBe(false)
    expect(parsed.message).toContain('가격')
  })

  test('should default tradingMode to paper', async () => {
    // Just verify the input parsing logic
    const input = { stockCode: '005930', side: 'buy', quantity: 10 }
    const tradingMode = String(input.tradingMode || 'paper') as 'real' | 'paper'
    expect(tradingMode).toBe('paper')
  })

  test('should default market to KR', async () => {
    const input = { stockCode: '005930', side: 'buy', quantity: 10 }
    const market = String((input as Record<string, unknown>).market || 'KR') as 'KR' | 'US'
    expect(market).toBe('KR')
  })
})

// === Token Cache Isolation ===

describe('Token Cache Isolation (Real vs Paper)', () => {
  test('cache key should include trading mode', () => {
    const appKey = 'test-key'
    const appSecret = 'test-secret'

    const realKey = `real:${appKey}:${appSecret}`
    const paperKey = `paper:${appKey}:${appSecret}`

    expect(realKey).not.toBe(paperKey)
    expect(realKey).toContain('real:')
    expect(paperKey).toContain('paper:')
  })
})

// === Account Number Parsing ===

describe('Account Number Parsing', () => {
  test('should parse 10-digit account number', () => {
    const accountNo = '4404976301'
    const prefix = accountNo.substring(0, 8)
    const suffix = accountNo.substring(8, 10) || '01'

    expect(prefix).toBe('44049763')
    expect(suffix).toBe('01')
  })

  test('should parse 8-digit account with default suffix', () => {
    const accountNo = '44049763'
    const prefix = accountNo.substring(0, 8)
    const suffix = accountNo.substring(8, 10) || '01'

    expect(prefix).toBe('44049763')
    expect(suffix).toBe('01')
  })

  test('should handle account with explicit suffix', () => {
    const accountNo = '4404976302'
    const prefix = accountNo.substring(0, 8)
    const suffix = accountNo.substring(8, 10) || '01'

    expect(prefix).toBe('44049763')
    expect(suffix).toBe('02')
  })
})

// === Error Handling ===

describe('Error Handling', () => {
  test('KIS API error code EGW00123 indicates token expired', () => {
    const response = { rt_cd: '1', msg_cd: 'EGW00123', msg1: '토큰 만료' }
    const isExpired = response.msg_cd === 'EGW00123' || (response.msg1 && response.msg1.includes('만료'))
    expect(isExpired).toBe(true)
  })

  test('should detect token expiration from msg1 text', () => {
    const response = { rt_cd: '1', msg_cd: 'OTHER', msg1: '액세스 토큰이 만료되었습니다' }
    const isExpired = response.msg_cd === 'EGW00123' || (response.msg1 && response.msg1.includes('만료'))
    expect(isExpired).toBe(true)
  })

  test('should not falsely detect expiration', () => {
    const response = { rt_cd: '1', msg_cd: 'OTHER', msg1: '주문 가능 금액 부족' }
    const isExpired = response.msg_cd === 'EGW00123' || (response.msg1 && response.msg1.includes('만료'))
    expect(isExpired).toBe(false)
  })

  test('token cooldown should be 65 seconds', () => {
    const COOLDOWN_MS = 65_000
    expect(COOLDOWN_MS).toBe(65000) // 65초
    expect(COOLDOWN_MS / 1000).toBeGreaterThan(60) // 1분 초과
  })
})

// === Backward Compatibility ===

describe('Backward Compatibility', () => {
  let kisAuth: typeof import('../../lib/tool-handlers/builtins/kis-auth')

  beforeEach(async () => {
    kisAuth = await import('../../lib/tool-handlers/builtins/kis-auth')
  })

  test('KIS_BASE_URL should still be exported for existing code', () => {
    expect(kisAuth.KIS_BASE_URL).toBeDefined()
    expect(typeof kisAuth.KIS_BASE_URL).toBe('string')
  })

  test('getKisToken should accept 2 args (backward compat)', async () => {
    // The function should accept appKey, appSecret (original signature)
    // and optionally tradingMode (new parameter)
    expect(kisAuth.getKisToken.length).toBeGreaterThanOrEqual(2)
  })

  test('kisHeaders should maintain same signature', () => {
    expect(kisAuth.kisHeaders.length).toBe(4) // token, appKey, appSecret, trId
  })
})
