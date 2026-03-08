import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Tabs } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS: TabItem[] = [
  { value: 'content', label: '콘텐츠', shortLabel: '콘텐츠' },
  { value: 'queue', label: '발행 큐', shortLabel: '큐' },
  { value: 'cardnews', label: '카드뉴스', shortLabel: '카드' },
  { value: 'stats', label: '통계', shortLabel: '통계' },
  { value: 'accounts', label: '계정 관리', shortLabel: '계정' },
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
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-3">SNS 통신국</h2>
        <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} />
      </div>

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
