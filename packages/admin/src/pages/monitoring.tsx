import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type MonitoringData = {
  server: { status: string; uptime: number; version: { build: string; hash: string; runtime: string } }
  memory: { rss: number; heapUsed: number; heapTotal: number; usagePercent: number }
  db: { status: string; responseTimeMs: number }
  errors: { count24h: number; recent: { timestamp: string; message: string }[] }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return [d && `${d}일`, h && `${h}시간`, `${m}분`].filter(Boolean).join(' ')
}

function MemoryBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'ok'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {isOk ? '정상' : '오류'}
    </span>
  )
}

function MemoryBadge({ percent }: { percent: number }) {
  const classes = percent >= 90
    ? 'bg-red-500/20 text-red-400'
    : percent >= 80
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-emerald-500/20 text-emerald-400'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>{percent}%</span>
}

function ResponseTimeText({ ms }: { ms: number }) {
  const color = ms > 200 ? 'text-red-400' : ms >= 50 ? 'text-amber-400' : 'text-emerald-400'
  return <span className={`text-sm font-mono ${color}`}>{ms} ms</span>
}

export function MonitoringPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['monitoring'],
    queryFn: () => api.get<MonitoringData>('/admin/monitoring/status'),
    refetchInterval: 30_000,
  })

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6" data-testid="monitoring-page">
        <h1 className="text-2xl font-bold tracking-tight text-white">시스템 모니터링</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">모니터링 데이터를 불러올 수 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">{(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6" data-testid="monitoring-page">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">시스템 모니터링</h1>
          <button disabled className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium opacity-50">
            새로고침
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="loading-state">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const d = data

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6" data-testid="monitoring-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">시스템 모니터링</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          data-testid="refresh-btn"
        >
          <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isFetching ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Server Status Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl" data-testid="server-card">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">서버 상태</h3>
            <StatusBadge status={d.server.status} />
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">업타임</span>
              <span className="text-sm font-medium text-white">{formatUptime(d.server.uptime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">런타임</span>
              <span className="text-sm font-mono text-slate-300">{d.server.version.runtime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">빌드</span>
              <span className="text-sm font-mono text-slate-300">
                #{d.server.version.build}{d.server.version.hash && <> · <span className="text-slate-500">{d.server.version.hash}</span></>}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl" data-testid="memory-card">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">메모리</h3>
            <MemoryBadge percent={d.memory.usagePercent} />
          </div>
          <div className="px-5 py-4 space-y-4">
            <MemoryBar percent={d.memory.usagePercent} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">RSS</span>
              <span className="text-sm font-mono text-slate-300">{d.memory.rss} MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Heap</span>
              <span className="text-sm font-mono text-slate-300">{d.memory.heapUsed} / {d.memory.heapTotal} MB</span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl" data-testid="db-card">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">데이터베이스</h3>
            <StatusBadge status={d.db.status} />
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">응답 시간</span>
              <ResponseTimeText ms={d.db.responseTimeMs} />
            </div>
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl" data-testid="error-card">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">에러 (24시간)</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              d.errors.count24h > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {d.errors.count24h}건
            </span>
          </div>
          <div className="px-5 py-4">
            {d.errors.recent.length > 0 ? (
              <div className="space-y-2">
                {d.errors.recent.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap mt-0.5">
                      {new Date(e.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-xs text-red-400/80 leading-relaxed line-clamp-2">{e.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">에러 없음</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
