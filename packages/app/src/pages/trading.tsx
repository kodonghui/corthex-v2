import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs } from '@corthex/ui'
import { StockSidebar } from '../components/strategy/stock-sidebar'
import { ChartPanel } from '../components/strategy/chart-panel'
import { ChatPanel } from '../components/strategy/chat-panel'
import { ComparisonPanel } from '../components/strategy/comparison-panel'

const mobileTabs = [
  { value: 'chart', label: '차트' },
  { value: 'chat', label: '채팅' },
]

export function TradingPage() {
  const [mobileTab, setMobileTab] = useState('chart')
  const [searchParams] = useSearchParams()

  const isCompareMode = useMemo(() => {
    const raw = searchParams.get('compare')
    if (!raw) return false
    return raw.split(',').filter(Boolean).length >= 2
  }, [searchParams])

  const CenterPanel = isCompareMode ? ComparisonPanel : ChartPanel

  return (
    <div className="h-[calc(100dvh-var(--header-h,56px))] flex flex-col">
      {/* 데스크탑: 3패널 그리드 */}
      <div className="hidden md:grid md:grid-cols-[240px_1fr_360px] flex-1 min-h-0">
        <StockSidebar className="border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden" />
        <CenterPanel />
        <ChatPanel />
      </div>

      {/* 모바일: 상단 종목 검색 + 탭 전환 */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 pt-3 pb-1">
          <StockSidebar className="max-h-[180px] overflow-y-auto" />
        </div>
        <Tabs items={mobileTabs} value={mobileTab} onChange={setMobileTab} className="px-4" />
        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'chart' ? <CenterPanel /> : <ChatPanel />}
        </div>
      </div>
    </div>
  )
}
