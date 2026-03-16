/**
 * Trading Page - Natural Organic Theme
 *
 * API Endpoints:
 *   (inherits from child components)
 *   - StockSidebar: GET /workspace/trading/watchlist
 *   - ChartPanel: GET /workspace/trading/chart/:symbol
 *   - ChatPanel: POST /workspace/trading/chat, GET /workspace/trading/chat/history
 *   - ComparisonPanel: GET /workspace/trading/compare
 */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ArrowUpRight, Bot, Send, Settings } from 'lucide-react'
import { StockSidebar } from '../components/strategy/stock-sidebar'
import { ChartPanel } from '../components/strategy/chart-panel'
import { ChatPanel } from '../components/strategy/chat-panel'
import { ComparisonPanel } from '../components/strategy/comparison-panel'

export function TradingPage() {
  const [mobileTab, setMobileTab] = useState<'chart' | 'chat'>('chart')
  const [searchParams] = useSearchParams()

  const isCompareMode = searchParams.has('compare')

  const CenterPanel = isCompareMode ? ComparisonPanel : ChartPanel

  return (
    <div data-testid="trading-page" className="h-[calc(100dvh-var(--header-h,56px))] flex flex-col overflow-hidden" style={{ backgroundColor: '#faf8f5' }}>
      {/* BEGIN: TopHeader */}
      <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="text-white p-2 rounded-lg" style={{ backgroundColor: '#5a7247' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#5a7247' }}>CORTHEX <span className="text-stone-400 font-medium">v2</span></h1>
          <nav className="ml-8 flex gap-6 text-sm font-medium text-stone-500">
            <a className="border-b-2 pb-5 pt-5" style={{ color: '#5a7247', borderColor: '#5a7247' }} href="#">Strategy Room</a>
            <a className="hover:text-stone-900 transition-colors py-5" href="#">Portfolio</a>
            <a className="hover:text-stone-900 transition-colors py-5" href="#">Analytics</a>
          </nav>
        </div>
        {/* Trading Mode Toggle */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="trading-mode">Live Trading</label>
          <button
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-stone-200"
            id="trading-mode"
          >
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" id="mode-indicator"></span>
          </button>
          <div className="hidden flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold animate-pulse" style={{ backgroundColor: 'rgba(196,98,45,0.1)', color: '#c4622d' }} id="trading-warning">
            PAPER TRADING ACTIVE
          </div>
        </div>
      </header>
      {/* END: TopHeader */}

      {/* BEGIN: MainDashboard */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* LEFT PANEL: Stock Watchlist */}
        <section className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-purpose="watchlist-panel">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center">
            <h2 className="font-bold text-stone-800">Watchlist</h2>
            <button className="text-stone-400 hover:text-stone-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" fillRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Watchlist Items */}
            <div className="divide-y divide-stone-50">
              {/* Row 1: NVIDIA */}
              <div className="p-4 hover:bg-stone-50 cursor-pointer transition-colors flex justify-between items-center border-l-4" style={{ borderLeftColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)' }}>
                <div>
                  <div className="font-bold">NVDA</div>
                  <div className="text-xs text-stone-400">NVIDIA Corp.</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold" style={{ color: '#10b981' }}>$894.52</div>
                  <div className="text-xs font-medium" style={{ color: '#10b981' }}>+2.45%</div>
                </div>
              </div>
              {/* Row 2: APPLE */}
              <div className="p-4 hover:bg-stone-50 cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold">AAPL</div>
                  <div className="text-xs text-stone-400">Apple Inc.</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold" style={{ color: '#ef4444' }}>$172.62</div>
                  <div className="text-xs font-medium" style={{ color: '#ef4444' }}>-0.82%</div>
                </div>
              </div>
              {/* Row 3: TESLA */}
              <div className="p-4 hover:bg-stone-50 cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold">TSLA</div>
                  <div className="text-xs text-stone-400">Tesla, Inc.</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold" style={{ color: '#ef4444' }}>$163.57</div>
                  <div className="text-xs font-medium" style={{ color: '#ef4444' }}>-1.24%</div>
                </div>
              </div>
              {/* Row 4: MICROSOFT */}
              <div className="p-4 hover:bg-stone-50 cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <div className="font-bold">MSFT</div>
                  <div className="text-xs text-stone-400">Microsoft Corp.</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold" style={{ color: '#10b981' }}>$415.28</div>
                  <div className="text-xs font-medium" style={{ color: '#10b981' }}>+0.15%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-stone-50 text-[10px] text-stone-400 uppercase tracking-widest text-center">
            Market Status: Open
          </div>
        </section>

        {/* MIDDLE PANEL: Chart and Position */}
        <section className="flex-1 flex flex-col gap-4" data-purpose="chart-panel">
          {/* Chart Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">NVDA / USD</span>
                <div className="flex bg-stone-100 rounded-lg p-1 text-xs">
                  <button className="px-2 py-1 bg-white rounded shadow-sm font-bold">1H</button>
                  <button className="px-2 py-1 hover:bg-stone-200 transition-colors">4H</button>
                  <button className="px-2 py-1 hover:bg-stone-200 transition-colors">1D</button>
                  <button className="px-2 py-1 hover:bg-stone-200 transition-colors">1W</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold text-white rounded-lg" style={{ backgroundColor: '#10b981' }}>BUY</button>
                <button className="px-3 py-1 text-xs font-bold text-white rounded-lg" style={{ backgroundColor: '#ef4444' }}>SELL</button>
              </div>
            </div>
            {/* Canvas Container for Strategy Chart */}
            <div className="flex-1 relative bg-white" id="chart-container">
              <canvas className="w-full h-full" id="strategyChart"></canvas>
              {/* Overlay Info */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="flex gap-4 text-[10px] font-mono text-stone-400">
                  <span>O: 889.20</span>
                  <span>H: 898.15</span>
                  <span>L: 885.30</span>
                  <span>C: 894.52</span>
                </div>
              </div>
            </div>
          </div>
          {/* Position Summary */}
          <div className="h-48 bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex flex-col">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Active Position: NVDA</h3>
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div className="bg-stone-50 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Size</span>
                <span className="text-lg font-mono font-bold">120 Shares</span>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Avg Entry</span>
                <span className="text-lg font-mono font-bold">$842.10</span>
              </div>
              <div className="bg-stone-50 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Market Value</span>
                <span className="text-lg font-mono font-bold">$107,342.40</span>
              </div>
              <div className="rounded-xl p-3 flex flex-col justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: '#10b981' }}>Total P&amp;L</span>
                <span className="text-lg font-mono font-bold" style={{ color: '#10b981' }}>+$6,290.40</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Strategy Chat */}
        <section className="w-96 flex flex-col bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-purpose="chat-panel">
          <div className="p-4 border-b border-stone-100 flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: '#5a7247' }}>CIO</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            </div>
            <div>
              <h2 className="font-bold text-stone-800 leading-none">Strategy Agent</h2>
              <span className="text-[10px] text-stone-400 font-medium">Quant Strategy Advisor</span>
            </div>
          </div>
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'rgba(250,248,245,0.3)' }}>
            {/* Message 1: Human */}
            <div className="flex flex-col items-end">
              <div className="text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%]" style={{ backgroundColor: '#5a7247' }}>
                What is the current technical outlook for NVDA?
              </div>
              <span className="text-[10px] text-stone-400 mt-1">10:42 AM</span>
            </div>
            {/* Message 2: Agent */}
            <div className="flex flex-col items-start">
              <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm">
                Analyzing market data for NVIDIA (NVDA)...
                {/* Tool Call Block */}
                <div className="mt-2 bg-stone-50 border border-stone-100 rounded-lg p-2 font-mono text-[11px] text-stone-500">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-stone-400 italic">Executing tool_call: fetch_ta_metrics</span>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }}></span>
                  </div>
                  <div>{'{ "symbol": "NVDA", "indicators": ["RSI", "MACD", "EMA200"] }'}</div>
                </div>
              </div>
            </div>
            {/* Message 3: Agent Response */}
            <div className="flex flex-col items-start">
              <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm">
                NVDA is showing strong bullish momentum. RSI is currently at 62 (neutral-high), and price is trading 12% above the 200-day EMA. I recommend maintaining the current long position with a trailing stop at $875.00.
              </div>
              <span className="text-[10px] text-stone-400 mt-1">10:43 AM</span>
            </div>
          </div>
          {/* Chat Input */}
          <div className="p-4 border-t border-stone-100 bg-white">
            <div className="relative">
              <textarea className="w-full bg-stone-100 border-none rounded-xl text-sm p-3 pr-12 focus:ring-1 focus:ring-stone-200 resize-none" placeholder="Ask about strategy..." rows={2}></textarea>
              <button className="absolute bottom-2 right-2 p-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#5a7247' }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* END: MainDashboard */}
    </div>
  )
}
