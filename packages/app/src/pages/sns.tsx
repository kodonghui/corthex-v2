import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS = [
  { value: 'content', label: '콘텐츠' },
  { value: 'queue', label: '발행 큐' },
  { value: 'cardnews', label: '카드뉴스' },
  { value: 'stats', label: '통계' },
  { value: 'accounts', label: '계정 관리' },
]

// Stats summary for mobile bottom card
function MobileStatsSummary() {
  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', 7],
    queryFn: () => api.get<{ data: { total: number; byStatus: Array<{ status: string; count: number }>; byPlatform: Array<{ platform: string; total: number; published: number }> } }>('/workspace/sns/stats?days=7'),
  })

  const stats = statsData?.data
  if (!stats || stats.total === 0) return null

  const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0
  const totalLikes = 0 // computed from individual posts; use count as proxy
  const totalReach = 0

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-12 z-10 pointer-events-none">
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-4 pointer-events-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">이번 주</h3>
        <div className="flex justify-between items-center divide-x divide-slate-700">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">{publishedCount}</span>
            <span className="text-[10px] text-slate-400 mt-1">발행됨</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-cyan-400 font-mono tabular-nums">{stats.total}</span>
            <span className="text-[10px] text-slate-400 mt-1">총 콘텐츠</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-white font-mono">{stats.byPlatform.length}</span>
            <span className="text-[10px] text-slate-400 mt-1">플랫폼</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SnsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'content'

  const setTab = useCallback((t: string) => {
    setSearchParams({ tab: t }, { replace: true })
  }, [setSearchParams])

  const { data: accountsData } = useQuery({
    queryKey: ['sns-accounts'],
    queryFn: () => api.get<{ data: SnsAccount[] }>('/workspace/sns-accounts'),
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const accounts = accountsData?.data || []
  const agents = agentsData?.data || []

  return (
    <div data-testid="sns-page" className="h-full flex flex-col bg-slate-900 relative">
      {/* Header */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-700">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-50">SNS 통신국</h2>
      </div>

      {/* Tab Bar — horizontally scrollable on mobile */}
      <div className="flex gap-1 px-4 sm:px-6 border-b border-slate-700/50 pt-2 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.value}
            data-testid={`sns-tab-${item.value}`}
            onClick={() => setTab(item.value)}
            className={`border-b-2 text-sm px-3 sm:px-4 py-2.5 transition-colors whitespace-nowrap ${
              tab === item.value
                ? 'border-blue-500 text-blue-400 font-medium'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 sm:pb-4">
        {tab === 'content' && <ContentTab accounts={accounts} agents={agents} />}
        {tab === 'queue' && <QueueTab />}
        {tab === 'cardnews' && <CardNewsTab agents={agents} />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'accounts' && <AccountsTab accounts={accounts} />}
      </div>

      {/* Mobile Stats Summary — bottom card */}
      {tab === 'content' && <MobileStatsSummary />}
    </div>
  )
}
