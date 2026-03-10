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

      {/* 모바일: 상단 종목 검색 + 탭 전환 */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        <div className="border-b border-slate-700 px-4 pt-3 pb-1">
          <StockSidebar className="max-h-[180px] overflow-y-auto" />
        </div>
        <div className="flex border-b border-slate-700 px-4">
          <button
            data-testid="mobile-tab-chart"
            onClick={() => setMobileTab('chart')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mobileTab === 'chart'
                ? 'border-blue-500 text-blue-400'
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
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            채팅
          </button>
        </div>
        <div data-testid="trading-chat-area" className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'chart' ? <CenterPanel /> : <ChatPanel />}
        </div>
      </div>
    </div>
  )
}
