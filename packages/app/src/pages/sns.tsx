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
    <div data-testid="sns-page" className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-slate-700">
        <h2 className="text-xl font-semibold text-slate-50">SNS 통신국</h2>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 px-6 border-b border-slate-700/50 pt-2">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.value}
            data-testid={`sns-tab-${item.value}`}
            onClick={() => setTab(item.value)}
            className={`border-b-2 text-sm px-4 py-2.5 transition-colors ${
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
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tab === 'content' && <ContentTab accounts={accounts} agents={agents} />}
        {tab === 'queue' && <QueueTab />}
        {tab === 'cardnews' && <CardNewsTab agents={agents} />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'accounts' && <AccountsTab accounts={accounts} />}
      </div>
    </div>
  )
}
