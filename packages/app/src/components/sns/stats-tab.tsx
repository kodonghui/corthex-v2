import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { SnsStats } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS } from './sns-types'

export function StatsTab() {
  const [statsDays, setStatsDays] = useState(30)

  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', statsDays],
    queryFn: () => api.get<{ data: SnsStats }>(`/workspace/sns/stats?days=${statsDays}`),
  })

  const stats = statsData?.data
  if (!stats) return <div className="text-sm text-zinc-500 py-4">로딩 중...</div>
  if (stats.total === 0) return <div className="text-sm text-zinc-500 py-8 text-center">아직 SNS 콘텐츠가 없습니다.</div>

  const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0
  const failedCount = stats.byStatus.find((s) => s.status === 'failed')?.count ?? 0
  const pendingCount = stats.byStatus.filter((s) => ['pending', 'approved', 'scheduled'].includes(s.status)).reduce((sum, s) => sum + s.count, 0)
  const successRate = publishedCount + failedCount > 0 ? Math.round((publishedCount / (publishedCount + failedCount)) * 100) : 0
  const maxDaily = Math.max(...stats.dailyTrend.map((d) => d.count), 1)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setStatsDays(d)}
            className={`px-3 py-1 text-sm rounded ${statsDays === d ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700'}`}>
            {d}일
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '총 콘텐츠', value: stats.total },
          { label: '발행 완료', value: publishedCount },
          { label: '성공률', value: `${successRate}%` },
          { label: '대기 중', value: pendingCount },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">상태별 분포</h3>
        <div className="space-y-2">
          {stats.byStatus.map((s) => (
            <div key={s.status} className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full w-20 text-center ${STATUS_COLORS[s.status] || ''}`}>{STATUS_LABELS[s.status] || s.status}</span>
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-4">
                <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${(s.count / stats.total) * 100}%` }} />
              </div>
              <span className="text-sm font-medium w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">플랫폼별 분포</h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.byPlatform.map((p) => (
            <div key={p.platform} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
              <p className="text-xs text-zinc-500">{p.platform}</p>
              <p className="text-xl font-bold mt-1">{p.total}</p>
              <p className="text-xs text-green-600 dark:text-green-400">발행 {p.published}건</p>
            </div>
          ))}
        </div>
      </section>

      {stats.dailyTrend.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">일별 생성 추이</h3>
          <div className="space-y-1">
            {stats.dailyTrend.map((d) => (
              <div key={d.date} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-24">{d.date}</span>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded h-3">
                  <div className="bg-indigo-500 h-3 rounded" style={{ width: `${(d.count / maxDaily) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
