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
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '총 예약', value: stats.byStatus.reduce((s, b) => s + b.count, 0), color: 'text-indigo-600' },
            { label: '오늘 발행', value: stats.todayCount, color: 'text-green-600' },
            { label: '실패', value: stats.failedCount, color: stats.failedCount > 0 ? 'text-red-600' : 'text-zinc-600' },
            { label: '다음 발행', value: stats.nextScheduled ? new Date(stats.nextScheduled).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-', color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Batch Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {['', 'scheduled', 'publishing', 'published', 'failed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-full border ${statusFilter === s ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-300' : 'border-zinc-300 dark:border-zinc-600 text-zinc-500'}`}>
              {s ? STATUS_LABELS[s] || s : '전체'}
            </button>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-zinc-500">{selectedIds.size}개 선택</span>
            <div className="flex gap-1 items-center">
              <input type="datetime-local" value={batchScheduleDate} onChange={(e) => setBatchScheduleDate(e.target.value)}
                className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800" />
              <button onClick={() => { if (batchScheduleDate) batchSchedule.mutate({ ids: [...selectedIds], scheduledAt: new Date(batchScheduleDate).toISOString() }) }}
                disabled={!batchScheduleDate || batchSchedule.isPending}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {batchSchedule.isPending ? '예약 중...' : '일괄 예약'}
              </button>
            </div>
            <button onClick={() => batchCancel.mutate([...selectedIds])} disabled={batchCancel.isPending}
              className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50">
              {batchCancel.isPending ? '취소 중...' : '일괄 취소'}
            </button>
          </div>
        )}
      </div>

      {/* Queue List */}
      {queue.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-sm">예약된 발행이 없습니다.</p>
          <p className="text-xs mt-1">콘텐츠 탭에서 예약 발행을 설정해보세요.</p>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2">
            <input type="checkbox" checked={selectedIds.size === queue.length && queue.length > 0}
              onChange={toggleAll} className="rounded border-zinc-300" />
            <span className="text-xs text-zinc-500">전체 선택</span>
          </div>

          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-zinc-300" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-zinc-500">{PLATFORM_LABELS[item.platform] || item.platform}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  {item.priority != null && item.priority > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      우선순위 {item.priority}
                    </span>
                  )}
                  {item.isCardNews && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">카드뉴스</span>
                  )}
                </div>
                <h4 className="text-sm font-medium truncate">{item.title}</h4>
              </div>
              <div className="text-right shrink-0">
                {item.scheduledAt && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {new Date(item.scheduledAt).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <p className="text-[10px] text-zinc-400">{item.creatorName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
