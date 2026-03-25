import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { SnsContent, QueueStats } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS } from './sns-types'

export function QueueTab() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchScheduleDate, setBatchScheduleDate] = useState('')

  const { data: queueData } = useQuery({
    queryKey: ['sns-queue', statusFilter],
    queryFn: () => api.get<{ data: SnsContent[] }>(`/workspace/sns/queue${statusFilter ? `?status=${statusFilter}` : ''}`),
  })

  const { data: queueStatsData } = useQuery({
    queryKey: ['sns-queue-stats'],
    queryFn: () => api.get<{ data: QueueStats }>('/workspace/sns/queue/stats'),
  })

  const batchSchedule = useMutation({
    mutationFn: ({ ids, scheduledAt }: { ids: string[]; scheduledAt: string }) =>
      api.post('/workspace/sns/batch-schedule', { ids, scheduledAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns-queue'] })
      queryClient.invalidateQueries({ queryKey: ['sns-queue-stats'] })
      setSelectedIds(new Set())
      setBatchScheduleDate('')
    },
  })

  const batchCancel = useMutation({
    mutationFn: (ids: string[]) => api.post('/workspace/sns/batch-cancel', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sns-queue'] })
      queryClient.invalidateQueries({ queryKey: ['sns-queue-stats'] })
      setSelectedIds(new Set())
    },
  })

  const queue = queueData?.data || []
  const stats = queueStatsData?.data

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === queue.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(queue.map((q) => q.id)))
  }

  return (
    <div data-testid="sns-queue-tab" className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '총 예약', value: stats.byStatus.reduce((s, b) => s + b.count, 0), color: 'text-blue-400' },
            { label: '오늘 발행', value: stats.todayCount, color: 'text-emerald-400' },
            { label: '실패', value: stats.failedCount, color: stats.failedCount > 0 ? 'text-red-400' : 'text-stone-500' },
            { label: '다음 발행', value: stats.nextScheduled ? new Date(stats.nextScheduled).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-', color: 'text-corthex-accent' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-100/50 border border-stone-200 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-stone-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Chips & Batch Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '', label: '전체' },
            { value: 'scheduled', label: '예약됨' },
            { value: 'publishing', label: '발행 중' },
            { value: 'published', label: '발행 완료' },
            { value: 'failed', label: '발행 실패' },
          ].map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                statusFilter === s.value
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
                  : 'border-stone-300 text-stone-500 hover:border-slate-500'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-stone-500">{selectedIds.size}개 선택</span>
            <div className="flex gap-1 items-center">
              <input type="datetime-local" value={batchScheduleDate} onChange={(e) => setBatchScheduleDate(e.target.value)}
                className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-600" />
              <button onClick={() => { if (batchScheduleDate) batchSchedule.mutate({ ids: [...selectedIds], scheduledAt: new Date(batchScheduleDate).toISOString() }) }}
                disabled={!batchScheduleDate || batchSchedule.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg px-3 py-1.5 disabled:opacity-50">
                {batchSchedule.isPending ? '예약 중...' : '일괄 예약'}
              </button>
            </div>
            <button onClick={() => batchCancel.mutate([...selectedIds])} disabled={batchCancel.isPending}
              className="border border-red-500/50 text-red-400 text-xs rounded-lg px-3 py-1.5 disabled:opacity-50">
              {batchCancel.isPending ? '취소 중...' : '일괄 취소'}
            </button>
          </div>
        )}
      </div>

      {/* Queue List */}
      {queue.length === 0 && (
        <div data-testid="sns-queue-empty" className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-stone-500">예약된 발행이 없습니다</p>
          <p className="text-xs text-stone-400">콘텐츠 탭에서 예약 발행을 설정해보세요.</p>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2">
            <input type="checkbox" checked={selectedIds.size === queue.length && queue.length > 0}
              onChange={toggleAll} className="rounded border-stone-300 accent-blue-500" />
            <span className="text-xs text-stone-400">전체 선택</span>
          </div>

          {queue.map((item) => (
            <div key={item.id} data-testid={`sns-queue-item-${item.id}`}
              className="bg-stone-100/50 border border-stone-200 rounded-xl p-4 flex items-center gap-3 hover:border-stone-300">
              <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-stone-300 accent-blue-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-stone-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  {item.priority != null && item.priority > 0 && (
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded">우선순위 {item.priority}</span>
                  )}
                  {item.isCardNews && (
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded">카드뉴스</span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-corthex-text-primary truncate">{item.title}</h4>
              </div>
              <div className="text-right shrink-0">
                {item.scheduledAt && (
                  <p className="text-xs text-corthex-accent">
                    {new Date(item.scheduledAt).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <p className="text-[10px] text-stone-400">{item.creatorName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
