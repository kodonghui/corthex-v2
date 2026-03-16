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
    <div data-testid="trading-page" className="h-[calc(100dvh-var(--header-h,56px))] flex flex-col bg-slate-950 overflow-hidden">
      {/* Desktop: 3-panel layout matching Stitch */}
      <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Watchlist (280px) */}
        <aside className="w-[280px] flex-none border-r border-slate-700 bg-slate-900 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
              <input
                className="w-full bg-slate-950 border border-slate-700 rounded text-sm py-1.5 pl-9 pr-3 focus:outline-none focus:border-cyan-400 text-slate-100 placeholder-slate-400 transition-colors"
                placeholder="Search markets..."
                type="text"
              />
            </div>
          </div>
          <div className="flex-1 py-2">
            <StockSidebar className="flex flex-col" />
          </div>
        </aside>

        {/* Center Panel: Chart & Trades */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
          <CenterPanel />
        </section>

        {/* Right Panel: AI Trading Assistant (360px) */}
        <aside className="w-[360px] flex-none border-l border-slate-700 bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-cyan-400 w-5 h-5" />
              <h2 className="font-bold text-sm text-slate-50">CORTHEX AI Analyst</h2>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <ChatPanel />
        </aside>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {/* Portfolio card with sparkline */}
        <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-cyan-400/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">총 자산 가치</p>
                <h1 className="text-2xl font-mono font-bold tracking-tight text-white">$12,450.00</h1>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-xs font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>2.45%</span>
              </div>
            </div>
            {/* Sparkline SVG */}
            <div className="h-12 w-full rounded-lg bg-gradient-to-t from-cyan-400/10 to-transparent relative overflow-hidden">
              <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 40 L0 30 L10 25 L20 35 L30 15 L40 20 L50 10 L60 15 L70 5 L80 10 L90 2 L100 8 L100 40 Z" fill="rgb(34 211 238 / 0.15)" />
                <path d="M0 30 L10 25 L20 35 L30 15 L40 20 L50 10 L60 15 L70 5 L80 10 L90 2 L100 8" fill="none" stroke="rgb(34 211 238)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active trades */}
        <div className="px-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-100">활성 거래</h3>
            <button className="text-xs text-cyan-400 font-medium">모두 보기</button>
          </div>
        </div>

        {/* Stock search (collapsed) */}
        <div className="border-b border-slate-700 px-4 pt-2 pb-1">
          <StockSidebar className="max-h-[140px] overflow-y-auto" />
        </div>

        {/* Tab: Chart/Chat */}
        <div className="flex border-b border-slate-700 px-4">
          <button
            data-testid="mobile-tab-chart"
            onClick={() => setMobileTab('chart')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mobileTab === 'chart'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            차트
          </button>
          <button
            data-testid="mobile-tab-chat"
            onClick={() => setMobileTab('chat')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mobileTab === 'chat'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            채팅
          </button>
        </div>
        <div data-testid="trading-chat-area" className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'chart' ? <CenterPanel /> : <ChatPanel />}
        </div>

        {/* AI bot status */}
        <div className="mx-4 my-3 rounded-xl border border-cyan-400/20 bg-slate-900 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="text-cyan-400 w-4 h-4" />
              <h3 className="text-xs font-bold text-slate-100">AI Bot Status</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-medium text-emerald-400">Active</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 bg-slate-950 rounded-lg p-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Strategy</span>
              <span className="font-medium text-slate-200">DCA + Momentum</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
