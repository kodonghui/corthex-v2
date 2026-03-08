import type { ToolHandler } from '../types'
import { executeOrder } from '../../../services/kis-adapter'

export const placeStockOrder: ToolHandler = async (input, ctx) => {
  const stockCode = String(input.stockCode || '')
  const side = String(input.side || '')
  const quantity = Number(input.quantity || 0)
  const price = Number(input.price || 0)
  const tradingMode = (String(input.tradingMode || 'paper')) as 'real' | 'paper'
  const market = (String(input.market || 'KR')) as 'KR' | 'US'
  const exchange = String(input.exchange || '')
  const tickerName = String(input.tickerName || stockCode)

  if (!stockCode || !side || !quantity) {
    return JSON.stringify({
      success: false,
      message: '종목코드(stockCode), 매수/매도(side: buy/sell), 수량(quantity)은 필수입니다.',
    })
  }

  if (side !== 'buy' && side !== 'sell') {
    return JSON.stringify({ success: false, message: 'side는 "buy" 또는 "sell"이어야 합니다.' })
  }

  if (price < 0) {
    return JSON.stringify({ success: false, message: '가격(price)은 0 이상이어야 합니다.' })
  }

  const result = await executeOrder({
    companyId: ctx.companyId,
    userId: ctx.userId,
    ticker: stockCode,
    tickerName,
    side: side as 'buy' | 'sell',
    quantity,
    price,
    orderType: price > 0 ? 'limit' : 'market',
    tradingMode,
    market,
    exchange: exchange || undefined,
    reason: String(input.reason || ''),
    portfolioId: String(input.portfolioId || '') || undefined,
    agentId: ctx.agentId,
  })

  return JSON.stringify(result)
}
