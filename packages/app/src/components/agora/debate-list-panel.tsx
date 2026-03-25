import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@corthex/ui'
import { api } from '../../lib/api'
import { MessageCircle, History, Plus } from 'lucide-react'
import type { Debate, DebateStatus } from '@corthex/shared'

type Props = {
  selectedId: string | null
  onSelect: (debate: Debate) => void
  onCreateNew: () => void
}

const STATUS_BADGE: Record<DebateStatus, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-slate-500/20 text-stone-500' },
  'in-progress': { label: '진행중', className: 'bg-amber-500/20 text-amber-400' },
  completed: { label: '완료', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: '실패', className: 'bg-red-500/20 text-red-400' },
}

const STATUS_DOT: Record<DebateStatus, string> = {
  pending: 'bg-slate-500',
  'in-progress': 'bg-emerald-500',
  completed: 'bg-slate-500',
  failed: 'bg-red-500',
}

const FILTER_LABELS: Record<string, string> = {
  all: '전체',
  'in-progress': '진행중',
  completed: '완료',
  failed: '실패',
}

const FILTER_TESTIDS: Record<string, string> = {
  all: 'debate-filter-all',
  'in-progress': 'debate-filter-in-progress',
  completed: 'debate-filter-completed',
  failed: 'debate-filter-failed',
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
    <div data-testid="debate-list-panel" className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-corthex-accent/10">
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Debates</h3>
      </div>

      {/* Filter */}
      <div className="shrink-0 px-4 py-2 border-b border-corthex-accent/10">
        <div className="flex gap-1">
          {(['all', 'in-progress', 'completed', 'failed'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              data-testid={FILTER_TESTIDS[f]}
              onClick={() => setFilter(f)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full transition-colors',
                filter === f
                  ? 'bg-corthex-accent/10 text-corthex-accent'
                  : 'text-stone-500 hover:text-stone-600',
              )}
            >
              {FILTER_LABELS[f] ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-corthex-accent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <p className="text-sm text-stone-500 mb-2">진행된 토론이 없습니다</p>
            <p className="text-xs text-stone-400 mb-3">AGORA에서 에이전트 간 토론을 시작하세요</p>
            <button
              onClick={onCreateNew}
              className="bg-corthex-accent/20 hover:bg-corthex-accent/30 text-corthex-accent text-sm rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              토론 시작
            </button>
          </div>
        )}

        {filtered.map((debate) => {
          const isSelected = debate.id === selectedId
          const isActive = debate.status === 'in-progress'
          const dotColor = STATUS_DOT[debate.status] ?? 'bg-slate-500'
          return (
            <button
              key={debate.id}
              data-testid={`debate-item-${debate.id}`}
              onClick={() => onSelect(debate)}
              className={cn(
                'w-full flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between cursor-pointer transition-colors border-l-4',
                isSelected
                  ? 'bg-corthex-accent/10 border-corthex-accent'
                  : 'hover:bg-corthex-accent/5 border-transparent',
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  'flex items-center justify-center rounded shrink-0 w-10 h-10',
                  isActive
                    ? 'bg-corthex-accent/20 text-corthex-accent'
                    : 'bg-stone-100 text-stone-500',
                )}>
                  {isActive ? <MessageCircle className="w-5 h-5" /> : <History className="w-5 h-5" />}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className={cn(
                    'text-sm font-medium leading-normal line-clamp-1',
                    isSelected ? 'text-corthex-text-primary' : 'text-stone-600',
                  )}>
                    {debate.topic}
                  </p>
                  <p className="text-stone-400 text-xs font-normal leading-normal line-clamp-1">
                    {debate.participants.length} participants
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex w-5 h-5 items-center justify-center">
                <div className={cn('w-2 h-2 rounded-full', dotColor)} />
              </div>
            </button>
          )
        })}
      </div>

      {/* New Debate Button */}
      <div className="mt-auto p-4 border-t border-corthex-accent/10">
        <button
          data-testid="debate-create-btn"
          onClick={onCreateNew}
          className="w-full py-2 px-4 rounded-lg bg-corthex-accent/20 text-corthex-accent hover:bg-corthex-accent/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Debate
        </button>
      </div>
    </div>
  )
}
