import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Plus, Filter, Camera, Briefcase, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { api } from '../lib/api'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS = [
  { value: 'content', label: '콘텐츠' },
  { value: 'queue', label: '발행 대기' },
  { value: 'cardnews', label: '카드뉴스' },
  { value: 'stats', label: '통계' },
  { value: 'accounts', label: '계정' },
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

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-12 z-10 pointer-events-none">
      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-4 pointer-events-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">이번 주</h3>
        <div className="flex justify-between items-center divide-x divide-slate-800">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-slate-50 font-mono tabular-nums">{publishedCount}</span>
            <span className="text-[10px] text-slate-400 mt-1">발행됨</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-cyan-400 font-mono tabular-nums">{stats.total}</span>
            <span className="text-[10px] text-slate-400 mt-1">총 콘텐츠</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-slate-50 font-mono tabular-nums">{stats.byPlatform.length}</span>
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
    <div data-testid="sns-page" className="h-full flex flex-col bg-slate-950 relative">
      {/* Header + Title */}
      <div className="px-6 sm:px-10 pt-6 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-slate-50 tracking-tight text-3xl font-bold leading-tight">SNS 관리</h1>
            <p className="text-slate-400 text-sm font-medium leading-normal">콘텐츠 생성, 예약 및 다중 플랫폼 통계 분석을 관리하세요.</p>
          </div>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-cyan-400 text-slate-950 text-sm font-bold leading-normal transition-opacity hover:opacity-90">
            <Plus className="w-[18px] h-[18px] mr-2" />
            <span className="truncate">콘텐츠 생성</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="mb-6">
          <div className="flex border-b border-slate-800 gap-8 overflow-x-auto no-scrollbar">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.value}
                data-testid={`sns-tab-${item.value}`}
                onClick={() => setTab(item.value)}
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 px-1 whitespace-nowrap transition-colors ${
                  tab === item.value
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <p className={`text-sm leading-normal ${tab === item.value ? 'font-bold' : 'font-medium'}`}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Platform filter chips */}
        {tab === 'content' && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-800 px-4 text-slate-50 text-sm font-bold leading-normal border border-slate-700">전체</button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-slate-400 hover:bg-slate-800/50 text-sm font-medium leading-normal border border-slate-800 transition-colors">
              <Camera className="w-3.5 h-3.5" />
              Instagram
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-slate-400 hover:bg-slate-800/50 text-sm font-medium leading-normal border border-slate-800 transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
              LinkedIn
            </button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-slate-400 hover:bg-slate-800/50 text-sm font-medium leading-normal border border-slate-800 transition-colors">Twitter</button>
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent px-4 text-slate-400 hover:bg-slate-800/50 text-sm font-medium leading-normal border border-slate-800 transition-colors ml-auto">
              <Filter className="w-[18px] h-[18px]" />
              필터
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-4 pb-28 sm:pb-4">
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
