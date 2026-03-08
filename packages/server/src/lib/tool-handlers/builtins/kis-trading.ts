import type { ToolHandler } from '../types'
import { executeOrder, getBalance, syncOrderStatus, getOverseasPrice } from '../../../services/kis-adapter'

export const kisTrading: ToolHandler = async (input, ctx) => {
  const action = String(input.action || '')
  if (!action) {
    return JSON.stringify({
      success: false,
      message: 'action이 필요합니다. buy, sell, balance, overseas_price, order_status를 사용하세요.',
    })
  }

  try {
    if (action === 'buy' || action === 'sell') {
      const stockCode = String(input.stockCode || '')
      const quantity = Number(input.quantity || 0)
      const price = Number(input.price || 0)
      const tradingMode = (String(input.tradingMode || 'paper')) as 'real' | 'paper'
      const market = (String(input.market || 'KR')) as 'KR' | 'US'
      const exchange = String(input.exchange || '')
      const tickerName = String(input.tickerName || stockCode)
      const portfolioId = String(input.portfolioId || '') || undefined
      const reason = String(input.reason || '')

      if (!stockCode) return JSON.stringify({ success: false, message: '종목코드(stockCode)가 필요합니다.' })
      if (!quantity || quantity <= 0) return JSON.stringify({ success: false, message: '수량(quantity)은 1 이상이어야 합니다.' })
      if (price < 0) return JSON.stringify({ success: false, message: '가격(price)은 0 이상이어야 합니다.' })

      const result = await executeOrder({
        companyId: ctx.companyId,
        userId: ctx.userId,
        ticker: stockCode,
        tickerName,
        side: action as 'buy' | 'sell',
        quantity,
        price,
        orderType: price > 0 ? 'limit' : 'market',
        tradingMode,
        market,
        exchange: exchange || undefined,
        reason,
        portfolioId,
        agentId: ctx.agentId,
      })

      return JSON.stringify(result)
    }

    if (action === 'balance') {
      const tradingMode = (String(input.tradingMode || 'paper')) as 'real' | 'paper'
      const result = await getBalance(ctx.companyId, ctx.userId, tradingMode)
      return JSON.stringify(result)
    }

    if (action === 'overseas_price') {
      const symbol = String(input.symbol || '').toUpperCase()
      if (!symbol) return JSON.stringify({ success: false, message: '심볼(symbol)이 필요합니다. (예: AAPL)' })

      const exchange = String(input.exchange || 'NASD')
      const result = await getOverseasPrice(ctx.companyId, ctx.userId, symbol, exchange)
      return JSON.stringify(result)
    }

    if (action === 'order_status') {
      const orderId = String(input.orderId || '')
      if (!orderId) return JSON.stringify({ success: false, message: '주문ID(orderId)가 필요합니다.' })

      const result = await syncOrderStatus(ctx.companyId, ctx.userId, orderId)
      return JSON.stringify(result)
    }

    return JSON.stringify({
      success: false,
      message: `알 수 없는 action: ${action}. buy, sell, balance, overseas_price, order_status를 사용하세요.`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `KIS 거래 도구 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
