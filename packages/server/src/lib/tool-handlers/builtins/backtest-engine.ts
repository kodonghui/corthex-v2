import type { ToolHandler } from '../types'
import { getKisToken, kisHeaders, KIS_BASE_URL, KIS_TR_IDS } from './kis-auth'

type OHLCV = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type Trade = {
  date: string
  action: 'buy' | 'sell'
  price: number
  quantity: number
  value: number
}

type BacktestResult = {
  strategy: string
  initialCapital: number
  finalCapital: number
  totalReturn: number
  mdd: number
  winRate: number
  tradeCount: number
  trades: Trade[]
}

type StrategyFn = (prices: OHLCV[], index: number) => 'buy' | 'sell' | 'hold'

// === Strategy Implementations ===

function goldenCrossSignal(prices: OHLCV[], index: number): 'buy' | 'sell' | 'hold' {
  if (index < 20) return 'hold' // Need at least 20 days for MA20

  const sma5 = sma(prices, index, 5)
  const sma20 = sma(prices, index, 20)
  const prevSma5 = sma(prices, index - 1, 5)
  const prevSma20 = sma(prices, index - 1, 20)

  // Golden cross: SMA5 crosses above SMA20
  if (prevSma5 <= prevSma20 && sma5 > sma20) return 'buy'
  // Death cross: SMA5 crosses below SMA20
  if (prevSma5 >= prevSma20 && sma5 < sma20) return 'sell'
  return 'hold'
}

function rsiSignal(prices: OHLCV[], index: number): 'buy' | 'sell' | 'hold' {
  if (index < 15) return 'hold' // Need 14 days for RSI

  const rsiValue = calculateRSI(prices, index, 14)
  if (rsiValue <= 30) return 'buy'
  if (rsiValue >= 70) return 'sell'
  return 'hold'
}

function macdSignal(prices: OHLCV[], index: number): 'buy' | 'sell' | 'hold' {
  if (index < 35) return 'hold' // Need enough data for EMA26 + signal(9)

  const macdLine = emaValue(prices, index, 12) - emaValue(prices, index, 26)
  const prevMacdLine = emaValue(prices, index - 1, 12) - emaValue(prices, index - 1, 26)

  // Calculate signal line (EMA9 of MACD)
  const macdHistory: number[] = []
  for (let i = Math.max(0, index - 25); i <= index; i++) {
    if (i >= 26) {
      macdHistory.push(emaValue(prices, i, 12) - emaValue(prices, i, 26))
    }
  }

  if (macdHistory.length < 9) return 'hold'

  const signal = emaOfValues(macdHistory, 9)
  const prevMacdHistory = macdHistory.slice(0, -1)
  const prevSignal = prevMacdHistory.length >= 9 ? emaOfValues(prevMacdHistory, 9) : signal

  // MACD crosses above signal line → buy
  if (prevMacdLine <= prevSignal && macdLine > signal) return 'buy'
  // MACD crosses below signal line → sell
  if (prevMacdLine >= prevSignal && macdLine < signal) return 'sell'
  return 'hold'
}

// === Helper Functions ===

function sma(prices: OHLCV[], endIndex: number, period: number): number {
  let sum = 0
  const start = endIndex - period + 1
  for (let i = start; i <= endIndex; i++) {
    sum += prices[i].close
  }
  return sum / period
}

function calculateRSI(prices: OHLCV[], endIndex: number, period: number): number {
  let avgGain = 0
  let avgLoss = 0

  // Initial average
  for (let i = endIndex - period + 1; i <= endIndex; i++) {
    const change = prices[i].close - prices[i - 1].close
    if (change > 0) avgGain += change
    else avgLoss += Math.abs(change)
  }
  avgGain /= period
  avgLoss /= period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function emaValue(prices: OHLCV[], endIndex: number, period: number): number {
  const multiplier = 2 / (period + 1)
  // Start with SMA
  let value = 0
  const start = Math.max(0, endIndex - period * 3) // Use enough data
  for (let i = start; i < start + period && i <= endIndex; i++) {
    value += prices[i].close
  }
  value /= period

  // Apply EMA smoothing
  for (let i = start + period; i <= endIndex; i++) {
    value = (prices[i].close - value) * multiplier + value
  }
  return value
}

function emaOfValues(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] || 0
  const multiplier = 2 / (period + 1)
  let ema = 0
  for (let i = 0; i < period; i++) ema += values[i]
  ema /= period
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema
  }
  return ema
}

// === Backtest Engine ===

function runBacktest(prices: OHLCV[], strategyName: string, strategyFn: StrategyFn, initialCapital: number): BacktestResult {
  let cash = initialCapital
  let shares = 0
  let peakValue = initialCapital
  let maxDrawdown = 0
  const trades: Trade[] = []
  let wins = 0

  for (let i = 0; i < prices.length; i++) {
    const signal = strategyFn(prices, i)
    const price = prices[i].close

    if (signal === 'buy' && shares === 0 && cash > price) {
      const qty = Math.floor(cash / price)
      if (qty > 0) {
        shares = qty
        cash -= qty * price
        trades.push({ date: prices[i].date, action: 'buy', price, quantity: qty, value: qty * price })
      }
    } else if (signal === 'sell' && shares > 0) {
      const sellValue = shares * price
      cash += sellValue
      // Check if this was a winning trade
      const lastBuy = trades.filter((t) => t.action === 'buy').pop()
      if (lastBuy && price > lastBuy.price) wins++
      trades.push({ date: prices[i].date, action: 'sell', price, quantity: shares, value: sellValue })
      shares = 0
    }

    // Track MDD
    const currentValue = cash + shares * price
    if (currentValue > peakValue) peakValue = currentValue
    const drawdown = peakValue > 0 ? ((peakValue - currentValue) / peakValue) * 100 : 0
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }

  // Liquidate at end if holding
  const lastPrice = prices[prices.length - 1]?.close || 0
  const finalCapital = cash + shares * lastPrice

  const sellTrades = trades.filter((t) => t.action === 'sell').length
  const winRate = sellTrades > 0 ? (wins / sellTrades) * 100 : 0
  const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100

  return {
    strategy: strategyName,
    initialCapital,
    finalCapital: Math.round(finalCapital),
    totalReturn: Math.round(totalReturn * 100) / 100,
    mdd: Math.round(maxDrawdown * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    tradeCount: trades.length,
    trades: trades.slice(-20), // Last 20 trades only
  }
}

function runBuyAndHold(prices: OHLCV[], initialCapital: number): BacktestResult {
  if (prices.length === 0) {
    return {
      strategy: 'buy_and_hold',
      initialCapital, finalCapital: initialCapital, totalReturn: 0,
      mdd: 0, winRate: 0, tradeCount: 0, trades: [],
    }
  }

  const firstPrice = prices[0].close
  const lastPrice = prices[prices.length - 1].close
  const shares = Math.floor(initialCapital / firstPrice)
  const cashLeft = initialCapital - shares * firstPrice
  const finalCapital = cashLeft + shares * lastPrice
  const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100

  // Calculate MDD for buy and hold
  let peakValue = initialCapital
  let maxDrawdown = 0
  for (const p of prices) {
    const value = cashLeft + shares * p.close
    if (value > peakValue) peakValue = value
    const dd = peakValue > 0 ? ((peakValue - value) / peakValue) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  return {
    strategy: 'buy_and_hold',
    initialCapital,
    finalCapital: Math.round(finalCapital),
    totalReturn: Math.round(totalReturn * 100) / 100,
    mdd: Math.round(maxDrawdown * 100) / 100,
    winRate: lastPrice > firstPrice ? 100 : 0,
    tradeCount: 2,
    trades: [
      { date: prices[0].date, action: 'buy', price: firstPrice, quantity: shares, value: shares * firstPrice },
      { date: prices[prices.length - 1].date, action: 'sell', price: lastPrice, quantity: shares, value: shares * lastPrice },
    ],
  }
}

const STRATEGIES: Record<string, { name: string; fn: StrategyFn }> = {
  golden_cross: { name: 'Golden Cross (SMA5/SMA20)', fn: goldenCrossSignal },
  rsi: { name: 'RSI (14, 30/70)', fn: rsiSignal },
  macd: { name: 'MACD (12/26/9)', fn: macdSignal },
}

// === Fetch chart data ===

async function fetchChartData(
  stockCode: string,
  startDate: string,
  endDate: string,
  creds: Record<string, string>,
): Promise<OHLCV[]> {
  const token = await getKisToken(creds.app_key, creds.app_secret)

  const params = new URLSearchParams({
    FID_COND_MRKT_DIV_CODE: 'J',
    FID_INPUT_ISCD: stockCode,
    FID_INPUT_DATE_1: startDate.replace(/-/g, ''),
    FID_INPUT_DATE_2: endDate.replace(/-/g, ''),
    FID_PERIOD_DIV_CODE: 'D',
    FID_ORG_ADJ_PRC: '0',
  })

  const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${params}`, {
    headers: kisHeaders(token, creds.app_key, creds.app_secret, KIS_TR_IDS.price.domesticDaily),
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`KIS API 오류: ${res.status}`)

  const data = (await res.json()) as { output2?: Array<Record<string, string>>; rt_cd?: string; msg1?: string }
  if (data.rt_cd !== '0') throw new Error(`KIS 오류: ${data.msg1}`)

  return (data.output2 || [])
    .map((item) => ({
      date: item.stck_bsop_date || '',
      open: Number(item.stck_oprc || 0),
      high: Number(item.stck_hgpr || 0),
      low: Number(item.stck_lwpr || 0),
      close: Number(item.stck_clpr || 0),
      volume: Number(item.acml_vol || 0),
    }))
    .filter((item) => item.date && item.close > 0)
    .reverse() // KIS returns newest first
}

// === Tool Handler ===

export const backtestEngine: ToolHandler = async (input, ctx) => {
  const action = String(input.action || 'backtest')

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('kis')
  } catch {
    return JSON.stringify({ success: false, message: 'KIS API 키가 등록되지 않았습니다. 차트 데이터 조회에 필요합니다.' })
  }

  try {
    if (action === 'backtest') {
      const stockCode = String(input.stockCode || '')
      const strategy = String(input.strategy || 'golden_cross')
      const initialCapital = Number(input.initialCapital || 10_000_000) // Default 1천만원

      if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다.' })

      if (strategy !== 'buy_and_hold' && !STRATEGIES[strategy]) {
        return JSON.stringify({
          success: false,
          message: `알 수 없는 전략: ${strategy}. golden_cross, rsi, macd, buy_and_hold를 사용하세요.`,
        })
      }

      const days = Number(input.days || 200)
      const endDate = formatDate(new Date())
      const startDate = formatDate(daysAgo(days))

      const prices = await fetchChartData(stockCode, startDate, endDate, creds)
      if (prices.length < 30) {
        return JSON.stringify({ success: false, message: `데이터 부족: ${prices.length}일 (최소 30일 필요)` })
      }

      let result: BacktestResult
      if (strategy === 'buy_and_hold') {
        result = runBuyAndHold(prices, initialCapital)
      } else {
        result = runBacktest(prices, strategy, STRATEGIES[strategy].fn, initialCapital)
      }

      return JSON.stringify({
        success: true,
        action: 'backtest',
        stockCode,
        period: `${prices[0].date} ~ ${prices[prices.length - 1].date}`,
        dataPoints: prices.length,
        result,
      })
    }

    if (action === 'compare') {
      const stockCode = String(input.stockCode || '')
      if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다.' })

      const initialCapital = Number(input.initialCapital || 10_000_000)
      const days = Number(input.days || 200)
      const endDate = formatDate(new Date())
      const startDate = formatDate(daysAgo(days))

      const prices = await fetchChartData(stockCode, startDate, endDate, creds)
      if (prices.length < 30) {
        return JSON.stringify({ success: false, message: `데이터 부족: ${prices.length}일 (최소 30일 필요)` })
      }

      // Run all strategies
      const results: BacktestResult[] = []
      for (const [key, strat] of Object.entries(STRATEGIES)) {
        results.push(runBacktest(prices, key, strat.fn, initialCapital))
      }
      results.push(runBuyAndHold(prices, initialCapital))

      // Sort by total return descending
      results.sort((a, b) => b.totalReturn - a.totalReturn)

      return JSON.stringify({
        success: true,
        action: 'compare',
        stockCode,
        period: `${prices[0].date} ~ ${prices[prices.length - 1].date}`,
        dataPoints: prices.length,
        initialCapital,
        comparison: results.map((r) => ({
          strategy: r.strategy,
          finalCapital: r.finalCapital,
          totalReturn: `${r.totalReturn}%`,
          mdd: `${r.mdd}%`,
          winRate: `${r.winRate}%`,
          tradeCount: r.tradeCount,
        })),
        bestStrategy: results[0].strategy,
      })
    }

    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. backtest, compare를 사용하세요.` })
  } catch (err) {
    return JSON.stringify({ success: false, message: `백테스트 실행 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}` })
  }
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
