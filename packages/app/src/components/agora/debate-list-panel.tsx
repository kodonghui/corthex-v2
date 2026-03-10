import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@corthex/ui'
import { api } from '../../lib/api'
import type { Debate, DebateStatus } from '@corthex/shared'

type Props = {
  selectedId: string | null
  onSelect: (debate: Debate) => void
  onCreateNew: () => void
}

const STATUS_BADGE: Record<DebateStatus, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-slate-500/20 text-slate-400' },
  'in-progress': { label: '진행중', className: 'bg-amber-500/20 text-amber-400' },
  completed: { label: '완료', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: '실패', className: 'bg-red-500/20 text-red-400' },
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
      <div className="shrink-0 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-100">AGORA 토론</h2>
          <button
            data-testid="debate-create-btn"
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-3 py-1.5 transition-colors"
          >
            + 새 토론
          </button>
        </div>
        {/* Filter */}
        <div className="flex gap-1">
          {(['all', 'in-progress', 'completed', 'failed'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              data-testid={FILTER_TESTIDS[f]}
              onClick={() => setFilter(f)}
              className={cn(
                'text-[10px] px-2 py-1 rounded-full transition-colors',
                filter === f
                  ? 'bg-blue-900/50 text-blue-300'
                  : 'text-slate-400 hover:text-slate-300',
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
            <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <p className="text-sm text-slate-400 mb-2">진행된 토론이 없습니다</p>
            <p className="text-xs text-slate-500 mb-3">AGORA에서 에이전트 간 토론을 시작하세요</p>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-3 py-1.5 transition-colors"
            >
              토론 시작
            </button>
          </div>
        )}

        {filtered.map((debate) => {
          const badgeInfo = STATUS_BADGE[debate.status]
          const isSelected = debate.id === selectedId
          return (
            <button
              key={debate.id}
              data-testid={`debate-item-${debate.id}`}
              onClick={() => onSelect(debate)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-slate-800 transition-colors',
                isSelected
                  ? 'bg-blue-950/50'
                  : 'hover:bg-slate-800/50',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-slate-100 line-clamp-1">{debate.topic}</p>
                <span className={cn('shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium', badgeInfo.className)}>
                  {badgeInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
