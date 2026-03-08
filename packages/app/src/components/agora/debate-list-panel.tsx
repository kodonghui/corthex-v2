import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge, Button, EmptyState, Spinner, cn } from '@corthex/ui'
import { api } from '../../lib/api'
import type { Debate, DebateStatus } from '@corthex/shared'

type Props = {
  selectedId: string | null
  onSelect: (debate: Debate) => void
  onCreateNew: () => void
}

const STATUS_BADGE: Record<DebateStatus, { label: string; variant: 'default' | 'success' | 'error' | 'warning' }> = {
  pending: { label: '대기', variant: 'default' },
  'in-progress': { label: '진행중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
}

type StatusFilter = 'all' | DebateStatus

export function DebateListPanel({ selectedId, onSelect, onCreateNew }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['debates'],
    queryFn: () => api.get<{ data: Debate[] }>('/workspace/debates?limit=50'),
  })

  const debates = data?.data ?? []
  const filtered = filter === 'all' ? debates : debates.filter((d) => d.status === filter)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AGORA 토론</h2>
          <Button size="sm" onClick={onCreateNew}>+ 새 토론</Button>
        </div>
        {/* Filter */}
        <div className="flex gap-1">
          {(['all', 'in-progress', 'completed', 'failed'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full transition-colors',
                filter === f
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
              )}
            >
              {f === 'all' ? '전체' : STATUS_BADGE[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="진행된 토론이 없습니다"
            description="AGORA에서 에이전트 간 토론을 시작하세요"
            action={<Button size="sm" onClick={onCreateNew}>토론 시작</Button>}
          />
        )}

        {filtered.map((debate) => {
          const badgeInfo = STATUS_BADGE[debate.status]
          const isSelected = debate.id === selectedId
          return (
            <button
              key={debate.id}
              onClick={() => onSelect(debate)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition-colors',
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/50'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{debate.topic}</p>
                <Badge variant={badgeInfo.variant} className="shrink-0 text-[10px]">{badgeInfo.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span>{debate.debateType === 'deep-debate' ? '심층토론' : '토론'}</span>
                <span>·</span>
                <span>{debate.participants.length}명</span>
                <span>·</span>
                <span>{new Date(debate.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
