/**
 * Trading Page - Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   (inherits from child components)
 *   - StockSidebar: GET /workspace/trading/watchlist
 *   - ChartPanel: GET /workspace/trading/chart/:symbol
 *   - ChatPanel: POST /workspace/trading/chat, GET /workspace/trading/chat/history
 *   - ComparisonPanel: GET /workspace/trading/compare
 */
import { useState } from 'react'
import { toast } from '@corthex/ui'
import { useSearchParams } from 'react-router-dom'
import { BarChart3, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { StockSidebar } from '../components/strategy/stock-sidebar'
import { ChartPanel } from '../components/strategy/chart-panel'
import { ChatPanel } from '../components/strategy/chat-panel'
import { ComparisonPanel } from '../components/strategy/comparison-panel'

const TIMEFRAMES = ['1분', '5분', '15분', '1시간', '1일', '1주']

const TICKERS = [
  { symbol: 'BTC/USD', price: '$67,432.50', change: '+2.34%', positive: true },
  { symbol: 'ETH/USD', price: '$3,847.20', change: '+1.87%', positive: true },
  { symbol: 'SOL/USD', price: '$178.45', change: '-0.92%', positive: false },
  { symbol: 'AAPL', price: '$198.75', change: '+0.45%', positive: true },
  { symbol: 'NVDA', price: '$924.60', change: '+3.21%', positive: true },
  { symbol: 'TSLA', price: '$175.30', change: '-1.56%', positive: false },
  { symbol: 'AMZN', price: '$187.92', change: '+0.78%', positive: true },
  { symbol: 'GOOGL', price: '$156.40', change: '-0.23%', positive: false },
]

const PORTFOLIO = [
  { name: 'BTC', pct: 45, color: '#606C38' },
  { name: 'ETH', pct: 25, color: '#283618' },
  { name: 'SOL', pct: 10, color: '#6b705c' },
  { name: '현금 Cash', pct: 20, color: '#908a78' },
]

const CHART_TYPES = ['캔들 Candle', '라인 Line', '영역 Area']
const VOLUME_BARS = [30, 45, 25, 60, 80, 40, 55, 90, 70, 35, 50, 20]
const CANDLE_BARS = [45, 55, 40, 60, 75, 85, 65, 90, 95]

export function TradingPage() {
  const [mobileTab, setMobileTab] = useState<'chart' | 'chat'>('chart')
  const [searchParams] = useSearchParams()
  const [selectedTimeframe, setSelectedTimeframe] = useState('1시간')
  const [selectedChartType, setSelectedChartType] = useState('캔들 Candle')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')

  const isCompareMode = searchParams.has('compare')

  return (
    <div data-testid="trading-page" className="min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
      <div className="p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tighter text-corthex-text-primary">트레이딩 Trading</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-corthex-elevated rounded-full">
                <span className="w-2 h-2 bg-corthex-accent rounded-full animate-pulse" />
                <span className="text-xs font-medium text-corthex-text-secondary">시장 개장 Market Open</span>
              </div>
            </div>
            <p className="text-sm font-mono text-corthex-text-secondary opacity-70">TERMINAL_STABLE_V3.0.4 // SESSION_ACTIVE</p>
          </div>
          {/* Timeframe Selector */}
          <div className="flex items-center bg-corthex-elevated p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedTimeframe === tf
                    ? 'font-bold bg-corthex-accent text-white shadow-sm'
                    : 'font-medium text-corthex-text-secondary hover:bg-corthex-border'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </header>

        <main className="flex flex-col lg:flex-row gap-6">
          {/* LEFT PANEL: Tickers */}
          <section className="w-full lg:w-[350px] bg-corthex-elevated rounded-xl overflow-hidden shadow-sm flex flex-col border border-corthex-border">
            <div className="p-5 border-b border-corthex-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-secondary flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                시세 Tickers
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-corthex-text-secondary font-bold uppercase tracking-tighter bg-corthex-elevated/50">
                    <th className="px-5 py-3">종목 Symbol</th>
                    <th className="px-5 py-3 text-right">현재가 Price</th>
                    <th className="px-5 py-3 text-right">변동 Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-corthex-border/50 text-xs">
                  {TICKERS.map((t) => (
                    <tr key={t.symbol} className="hover:bg-corthex-elevated transition-colors cursor-pointer">
                      <td className="px-5 py-4 font-bold text-corthex-text-primary">{t.symbol}</td>
                      <td className="px-5 py-4 text-right font-mono">{t.price}</td>
                      <td className={`px-5 py-4 text-right font-mono ${t.positive ? 'text-corthex-accent' : 'text-red-600'}`}>{t.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CENTER PANEL: Chart */}
          <section className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-baseline gap-4">
                <h2 className="text-xl font-bold tracking-tight text-corthex-text-primary">BTC/USD 차트</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold">$67,432.50</span>
                  <span className="text-sm font-mono text-corthex-accent">+$1,543.20 (+2.34%)</span>
                </div>
              </div>
              <div className="flex bg-corthex-elevated rounded-lg p-0.5">
                {CHART_TYPES.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setSelectedChartType(ct)}
                    className={`px-3 py-1 text-xs transition-colors ${
                      selectedChartType === ct
                        ? 'font-bold bg-white rounded-md shadow-sm'
                        : 'font-medium text-corthex-text-secondary'
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-corthex-elevated rounded-xl flex-1 min-h-[450px] relative overflow-hidden border border-corthex-border">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #606C38 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full p-8 flex flex-col justify-end">
                  <div className="flex items-end justify-between h-2/3 w-full gap-2 opacity-60">
                    {CANDLE_BARS.map((h, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-sm ${i === 2 || i === 6 ? 'bg-red-600/40' : 'bg-corthex-accent/40'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* OHLC Badges */}
              <div className="absolute top-4 left-4 flex gap-4">
                {[
                  { label: 'O', value: '65,889.20' },
                  { label: 'H', value: '68,120.00' },
                  { label: 'L', value: '65,400.10' },
                  { label: 'C', value: '67,432.50' },
                ].map((d) => (
                  <div key={d.label} className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-mono shadow-sm border border-white">
                    {d.label}: {d.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Chart */}
            <div className="h-24 bg-corthex-elevated rounded-xl relative overflow-hidden p-2 flex items-end gap-1 border border-corthex-border">
              {VOLUME_BARS.map((h, i) => (
                <div key={i} className="flex-1 bg-corthex-text-secondary/20 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="w-full lg:w-[300px] flex flex-col gap-6">
            {/* Order Panel */}
            <div className="bg-corthex-elevated rounded-xl p-5 shadow-sm space-y-6 border border-corthex-border">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-secondary">주문 Order</h2>
                <Info className="w-4 h-4 text-corthex-text-secondary" />
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-corthex-elevated rounded-xl">
                <button
                  onClick={() => setOrderSide('buy')}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    orderSide === 'buy'
                      ? 'font-bold bg-corthex-accent text-white shadow-md'
                      : 'font-medium text-corthex-text-secondary hover:bg-corthex-border'
                  }`}
                >
                  매수 Buy
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    orderSide === 'sell'
                      ? 'font-bold bg-red-600 text-white shadow-md'
                      : 'font-medium text-corthex-text-secondary hover:bg-corthex-border'
                  }`}
                >
                  매도 Sell
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-corthex-text-secondary ml-1">수량 Amount</label>
                  <div className="relative">
                    <input
                      className="w-full bg-white border-b border-corthex-border focus:border-corthex-accent focus:ring-0 transition-all font-mono text-sm py-2.5 px-3 rounded-t-lg"
                      type="text"
                      defaultValue="0.10"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-corthex-text-secondary">BTC</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-corthex-text-secondary ml-1">가격 Price</label>
                  <div className="relative">
                    <input
                      className="w-full bg-white border-b border-corthex-border focus:border-corthex-accent focus:ring-0 transition-all font-mono text-sm py-2.5 px-3 rounded-t-lg"
                      type="text"
                      defaultValue="67,432.50"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-corthex-text-secondary">USD</span>
                  </div>
                </div>
              </div>
              <div className="py-4 border-t border-corthex-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-corthex-text-secondary">예상 비용 Estimated Cost</span>
                  <span className="font-mono font-bold">$6,743.25</span>
                </div>
                <button
                  onClick={() => toast.info('이 기능은 준비 중입니다')}
                  className="w-full bg-corthex-accent hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-corthex-accent/20"
                >
                  주문 실행 Execute
                </button>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-corthex-elevated rounded-xl p-5 shadow-sm space-y-5 border border-corthex-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-secondary">포트폴리오 Portfolio</h2>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-wider">Total Value</p>
                <h3 className="text-2xl font-mono font-black text-corthex-text-primary">$125,847.30</h3>
                <p className="text-xs font-mono text-corthex-accent font-medium">일간 손익 Daily P&L: +$2,341.50 (+1.89%)</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-corthex-border">
                {PORTFOLIO.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-medium">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold">{p.pct}%</span>
                    </div>
                    <div className="w-full bg-corthex-elevated h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-corthex-border flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-corthex-text-secondary uppercase tracking-[0.2em] gap-4">
          <div className="flex gap-6">
            <span>Latency: 14ms</span>
            <span>Server: Tokyo-AWS-01</span>
            <span>API Status: 200 OK</span>
          </div>
          <div>CORTHEX ARCHIVE // TRADING_ENGINE_ACTIVE</div>
        </footer>
      </div>
    </div>
  )
}
