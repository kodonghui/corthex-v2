import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { SnsStats } from './sns-types'
import { STATUS_LABELS, STATUS_COLORS, PLATFORM_LABELS } from './sns-types'

export function StatsTab() {
  const [statsDays, setStatsDays] = useState(30)

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['sns-stats', statsDays],
    queryFn: () => api.get<{ data: SnsStats }>(`/workspace/sns/stats?days=${statsDays}`),
  })

  const stats = statsData?.data

  // Loading skeleton
  if (isLoading) {
    return (
      <div data-testid="sns-stats-loading" className="space-y-6 max-w-4xl">
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <div key={d} className="h-8 w-12 bg-stone-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-stone-100/50 border border-stone-200 rounded-xl p-4">
              <div className="h-8 w-16 bg-stone-200 animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-20 bg-stone-200 animate-pulse rounded mx-auto" />
            </div>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-3/4 bg-stone-200 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (!stats) return null
  if (stats.total === 0) {
    return (
      <div data-testid="sns-stats-empty" className="text-center py-16">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm text-stone-500">아직 SNS 콘텐츠가 없습니다</p>
      </div>
    )
  }

  const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0
  const failedCount = stats.byStatus.find((s) => s.status === 'failed')?.count ?? 0
  const pendingCount = stats.byStatus.filter((s) => ['pending', 'approved', 'scheduled'].includes(s.status)).reduce((sum, s) => sum + s.count, 0)
  const successRate = publishedCount + failedCount > 0 ? Math.round((publishedCount / (publishedCount + failedCount)) * 100) : 0
  const maxDaily = Math.max(...stats.dailyTrend.map((d) => d.count), 1)

  return (
    <div data-testid="sns-stats-tab" className="space-y-6 max-w-4xl">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} onClick={() => setStatsDays(d)}
            className={`px-3 py-1.5 text-sm rounded-lg ${statsDays === d ? 'bg-blue-600/20 text-blue-400' : 'text-stone-500 hover:text-stone-600'}`}>
            {d}일
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '총 콘텐츠', value: stats.total },
          { label: '발행 완료', value: publishedCount },
          { label: '성공률', value: `${successRate}%` },
          { label: '대기 중', value: pendingCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-stone-100/50 border border-stone-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-corthex-text-secondary">{value}</p>
            <p className="text-xs text-stone-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <section>
        <h3 className="text-sm font-semibold text-stone-500 mb-3">상태별 분포</h3>
        <div className="space-y-2">
          {stats.byStatus.map((s) => (
            <div key={s.status} className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full w-20 text-center ${STATUS_COLORS[s.status] || ''}`}>{STATUS_LABELS[s.status] || s.status}</span>
              <div className="flex-1 bg-stone-200 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full transition-all" style={{ width: `${(s.count / stats.total) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-stone-600 w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Distribution */}
      <section>
        <h3 className="text-sm font-semibold text-stone-500 mb-3">플랫폼별 분포</h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.byPlatform.map((p) => (
            <div key={p.platform} className="bg-stone-100/50 border border-stone-200 rounded-xl p-4 text-center">
              <p className="text-xs text-stone-500">{PLATFORM_LABELS[p.platform] || p.platform}</p>
              <p className="text-xl font-bold text-corthex-text-secondary mt-1">{p.total}</p>
              <p className="text-xs text-emerald-400">발행 {p.published}건</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Trend */}
      {stats.dailyTrend.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-stone-500 mb-3">일별 생성 추이</h3>
          <div className="space-y-1">
            {stats.dailyTrend.map((d) => (
              <div key={d.date} className="flex items-center gap-2">
                <span className="text-xs text-stone-400 w-24">{d.date}</span>
                <div className="flex-1 bg-stone-200 rounded h-3">
                  <div className="bg-blue-500 h-3 rounded transition-all" style={{ width: `${(d.count / maxDaily) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-stone-600 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
