import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
    <div data-testid="trading-page" className="h-[calc(100dvh-var(--header-h,56px))] flex flex-col bg-slate-900">
      {/* 데스크탑: 3패널 그리드 */}
      <div className="hidden md:grid md:grid-cols-[240px_1fr_360px] flex-1 min-h-0">
        <StockSidebar className="border-r border-slate-700 flex flex-col overflow-hidden" />
        <CenterPanel />
        <ChatPanel />
      </div>

      {/* 모바일: 포트폴리오 카드 + 활성 거래 + 봇 상태 + 탭 전환 */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {/* 포트폴리오 카드 with sparkline */}
        <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-cyan-400/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">총 자산 가치</p>
                <h1 className="text-2xl font-mono font-bold tracking-tight text-white">$12,450.00</h1>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md text-xs font-medium">
                <span className="text-[10px]">▲</span>
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

        {/* 활성 거래 리스트 */}
        <div className="px-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-100">활성 거래</h3>
            <button className="text-xs text-cyan-400 font-medium">모두 보기</button>
          </div>
        </div>

        {/* 종목 검색 (축소) */}
        <div className="border-b border-slate-700 px-4 pt-2 pb-1">
          <StockSidebar className="max-h-[140px] overflow-y-auto" />
        </div>

        {/* 탭: 차트/채팅 */}
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

        {/* AI 봇 상태 */}
        <div className="mx-4 my-3 rounded-xl border border-cyan-400/20 bg-slate-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-sm">🤖</span>
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
          <div className="flex flex-col gap-1 bg-slate-900 rounded-lg p-2">
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
