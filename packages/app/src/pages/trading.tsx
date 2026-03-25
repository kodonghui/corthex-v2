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
  { name: 'BTC', pct: 45, color: 'var(--color-corthex-accent)' },
  { name: 'ETH', pct: 25, color: 'var(--color-corthex-accent-deep)' },
  { name: 'SOL', pct: 10, color: 'var(--color-corthex-text-secondary)' },
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
    <div data-testid="trading-page" className="min-h-screen" style={{ backgroundColor: 'var(--color-corthex-bg)' }}>
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter text-corthex-text-primary">트레이딩 Trading</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-corthex-elevated rounded-full">
                <span className="w-2 h-2 bg-corthex-accent rounded-full animate-pulse" />
                <span className="text-xs font-medium text-corthex-text-secondary">시장 개장 Market Open</span>
              </div>
            </div>
            <p className="text-sm font-mono text-corthex-text-secondary opacity-70">TERMINAL_STABLE_V3.0.4 // SESSION_ACTIVE</p>
          </div>
          {/* Timeframe Selector */}
          <div className="flex items-center bg-corthex-elevated p-1 rounded-xl overflow-x-auto">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 md:px-4 py-1.5 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
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
          <section className="w-full lg:w-[350px] bg-corthex-elevated rounded-xl overflow-hidden shadow-sm flex flex-col border border-corthex-border order-2 lg:order-1">
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
          <section className="flex-1 flex flex-col gap-4 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-corthex-text-primary">BTC/USD 차트</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-mono font-bold">$67,432.50</span>
                  <span className="text-xs md:text-sm font-mono text-corthex-accent">+$1,543.20 (+2.34%)</span>
                </div>
              </div>
              <div className="flex bg-corthex-elevated rounded-lg p-0.5">
                {CHART_TYPES.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setSelectedChartType(ct)}
                    className={`px-3 py-1 text-xs transition-colors ${
                      selectedChartType === ct
                        ? 'font-bold bg-corthex-surface rounded-md shadow-sm'
                        : 'font-medium text-corthex-text-secondary'
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-corthex-elevated rounded-xl flex-1 min-h-[250px] md:min-h-[450px] relative overflow-hidden border border-corthex-border">
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
              <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-wrap gap-2 md:gap-4">
                {[
                  { label: 'O', value: '65,889.20' },
                  { label: 'H', value: '68,120.00' },
                  { label: 'L', value: '65,400.10' },
                  { label: 'C', value: '67,432.50' },
                ].map((d) => (
                  <div key={d.label} className="bg-corthex-surface/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-mono shadow-sm border border-white">
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
          <aside className="w-full lg:w-[300px] bg-corthex-elevated border border-corthex-border rounded-xl p-4 md:p-6 flex flex-col gap-6 overflow-y-auto order-3">
            {/* P&L Summary Card */}
            <div className="bg-corthex-surface border border-corthex-border rounded-xl p-5 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-mono text-corthex-text-disabled tracking-[0.2em] mb-4 uppercase">Financial Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-corthex-text-secondary font-mono">NET PROFIT</p>
                    <p className="text-3xl font-black font-mono text-corthex-accent">+12.42%</p>
                  </div>
                  <div className="pt-4 border-t border-corthex-border">
                    <p className="text-xs text-corthex-text-secondary font-mono">TOTAL EQUITY</p>
                    <p className="text-xl font-black font-mono text-corthex-text-primary">$125,847.30</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-corthex-text-secondary">주문 Order</h2>
                <Info className="w-4 h-4 text-corthex-text-secondary" />
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-corthex-bg rounded-lg">
                <button
                  onClick={() => setOrderSide('buy')}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    orderSide === 'buy'
                      ? 'font-bold bg-corthex-accent text-corthex-bg shadow-md'
                      : 'font-medium text-corthex-text-secondary hover:bg-corthex-border'
                  }`}
                >
                  매수 Buy
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    orderSide === 'sell'
                      ? 'font-bold bg-corthex-error text-white shadow-md'
                      : 'font-medium text-corthex-text-secondary hover:bg-corthex-border'
                  }`}
                >
                  매도 Sell
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-corthex-text-secondary mb-1 block">수량 Amount</label>
                  <div className="relative">
                    <input className="w-full bg-corthex-bg border border-corthex-border focus:border-corthex-accent focus:ring-0 transition-all font-mono text-sm py-2 px-3 rounded-lg text-corthex-text-primary" type="text" defaultValue="0.10" />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-corthex-text-secondary">BTC</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-corthex-text-secondary mb-1 block">가격 Price</label>
                  <div className="relative">
                    <input className="w-full bg-corthex-bg border border-corthex-border focus:border-corthex-accent focus:ring-0 transition-all font-mono text-sm py-2 px-3 rounded-lg text-corthex-text-primary" type="text" defaultValue="67,432.50" />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-corthex-text-secondary">USD</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-corthex-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-corthex-text-secondary">Estimated Cost</span>
                  <span className="font-mono font-bold text-corthex-text-primary text-sm">$6,743.25</span>
                </div>
                <button
                  onClick={() => toast.info('이 기능은 준비 중입니다')}
                  className="w-full bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-bg font-bold py-3 min-h-[48px] rounded-lg transition-all active:scale-95"
                >
                  주문 실행 Execute
                </button>
              </div>
            </div>

            {/* Active Strategies */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-secondary">Active Strategies</h3>
                <TrendingUp className="w-4 h-4 text-corthex-text-disabled" />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Alpha-7 Arbitrage', roi: '+22.4%', risk: 'LOW RISK', pct: 85 },
                  { name: 'Beta-V Momentum', roi: '+8.1%', risk: 'MID RISK', pct: 42 },
                  { name: 'Delta-2 Sentiment', roi: '-0.2%', risk: 'HIGH RISK', pct: 12 },
                ].map((s) => (
                  <div key={s.name} className="bg-corthex-bg border border-corthex-border rounded-lg p-3 hover:border-corthex-accent/50 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-corthex-text-primary font-mono">{s.name}</span>
                      <BarChart3 className="w-3 h-3 text-corthex-accent" />
                    </div>
                    <div className="w-full bg-corthex-elevated h-1 rounded-full overflow-hidden mb-2">
                      <div className="bg-corthex-accent h-full" style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-corthex-text-disabled">
                      <span>ROI: {s.roi}</span>
                      <span>{s.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Feed */}
            <div className="pt-4 border-t border-corthex-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-corthex-error animate-ping" />
                <h4 className="text-[10px] font-mono text-corthex-text-disabled uppercase tracking-widest">Global Signal Feed</h4>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-mono border-l-2 border-corthex-accent pl-3">
                  <p className="text-corthex-text-secondary">WHALE ALERT: 5,000 BTC transfer detected</p>
                  <p className="text-corthex-text-disabled">02m ago · SECTOR: MACRO</p>
                </div>
                <div className="text-[10px] font-mono border-l-2 border-corthex-border pl-3">
                  <p className="text-corthex-text-secondary">FED RESERVE: Rate maintenance confirmed</p>
                  <p className="text-corthex-text-disabled">14m ago · SECTOR: FIAT</p>
                </div>
              </div>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-corthex-border flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-corthex-text-secondary uppercase tracking-[0.2em] gap-4">
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
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
