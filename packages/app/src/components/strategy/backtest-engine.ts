export type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Signal = {
  date: string
  type: 'buy' | 'sell'
  price: number
}

export type BacktestMetrics = {
  totalReturn: number
  tradeCount: number
  winRate: number
  maxDrawdown: number
}

export type BacktestResult = {
  signals: Signal[]
  metrics: BacktestMetrics
}

function sma(closes: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += closes[j]
      result.push(sum / period)
    }
  }
  return result
}

export function runMaCrossover(
  candles: Candle[],
  shortPeriod: number,
  longPeriod: number,
): BacktestResult {
  if (candles.length < longPeriod + 1) {
    return { signals: [], metrics: { totalReturn: 0, tradeCount: 0, winRate: 0, maxDrawdown: 0 } }
  }

  const closes = candles.map((c) => c.close)
  const shortMa = sma(closes, shortPeriod)
  const longMa = sma(closes, longPeriod)

  const signals: Signal[] = []
  let position: 'long' | null = null
  let entryPrice = 0

  for (let i = 1; i < candles.length; i++) {
    const prevShort = shortMa[i - 1]
    const prevLong = longMa[i - 1]
    const curShort = shortMa[i]
    const curLong = longMa[i]

    if (prevShort === null || prevLong === null || curShort === null || curLong === null) continue

    // Golden cross: short crosses above long → buy
    if (prevShort <= prevLong && curShort > curLong && position === null) {
      position = 'long'
      entryPrice = candles[i].close
      signals.push({ date: candles[i].time, type: 'buy', price: entryPrice })
    }
    // Dead cross: short crosses below long → sell
    else if (prevShort >= prevLong && curShort < curLong && position === 'long') {
      signals.push({ date: candles[i].time, type: 'sell', price: candles[i].close })
      position = null
    }
  }

  // Calculate metrics
  let totalReturn = 0
  let wins = 0
  let tradeCount = 0
  let peak = 1
  let maxDrawdown = 0
  let cumulative = 1

  for (let i = 0; i < signals.length - 1; i += 2) {
    const buy = signals[i]
    const sell = signals[i + 1]
    if (!sell) break

    const ret = (sell.price - buy.price) / buy.price
    totalReturn += ret
    tradeCount++
    if (ret > 0) wins++

    cumulative *= (1 + ret)
    if (cumulative > peak) peak = cumulative
    const drawdown = (peak - cumulative) / peak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }

  return {
    signals,
    metrics: {
      totalReturn: Math.round(totalReturn * 10000) / 100,
      tradeCount,
      winRate: tradeCount > 0 ? Math.round((wins / tradeCount) * 10000) / 100 : 0,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    },
  }
}
