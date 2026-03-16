/**
 * Admin Monitoring Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET /admin/monitoring/status
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type MonitoringData = {
  server: { status: string; uptime: number; version: { build: string; hash: string; runtime: string } }
  memory: { rss: number; heapUsed: number; heapTotal: number; usagePercent: number }
  db: { status: string; responseTimeMs: number }
  errors: { count24h: number; recent: { timestamp: string; message: string }[] }
}

/* Natural Organic colors */
const olive = '#5a7247'
const oliveBg = 'rgba(90,114,71,0.1)'
const terracotta = '#c4622d'
const cream = '#faf8f5'
const sand = '#e5e1d3'
const warmBrown = '#463e30'
const muted = '#9c8d66'
const lightMuted = '#b7aa88'

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ')
}

function MemoryBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? '#ef4444' : percent >= 80 ? terracotta : olive
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: sand }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'ok'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: isOk ? oliveBg : 'rgba(239,68,68,0.1)',
        color: isOk ? olive : '#ef4444',
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: isOk ? olive : '#ef4444' }}
      />
      {isOk ? 'Healthy' : 'Error'}
    </span>
  )
}

function MemoryBadge({ percent }: { percent: number }) {
  const color = percent >= 90 ? '#ef4444' : percent >= 80 ? terracotta : olive
  const bg = percent >= 90 ? 'rgba(239,68,68,0.1)' : percent >= 80 ? 'rgba(196,98,45,0.1)' : oliveBg
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color }}>
      {percent}%
    </span>
  )
}

function ResponseTimeText({ ms }: { ms: number }) {
  const color = ms > 200 ? '#ef4444' : ms >= 50 ? terracotta : olive
  return <span className="text-sm font-mono" style={{ color }}>{ms} ms</span>
}

export function MonitoringPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['monitoring'],
    queryFn: () => api.get<MonitoringData>('/admin/monitoring/status'),
    refetchInterval: 30_000,
  })

  if (isError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
        <div className="p-8 max-w-5xl mx-auto w-full" data-testid="monitoring-page">
          <h1 className="text-3xl font-black tracking-tight mb-6" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
            System Monitoring
          </h1>
          <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: sand }}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#ef4444' }}>error</span>
            </div>
            <p className="text-sm" style={{ color: '#ef4444' }}>Failed to load monitoring data.</p>
            <p className="text-xs mt-1" style={{ color: lightMuted }}>{(error as Error)?.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-bold transition-all"
              style={{ backgroundColor: olive }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
        <div className="p-8 max-w-5xl mx-auto w-full" data-testid="monitoring-page">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
              System Monitoring
            </h1>
            <button disabled className="px-6 py-2.5 rounded-xl text-white text-sm font-bold opacity-50" style={{ backgroundColor: olive }}>
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="loading-state">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border rounded-xl h-44 animate-pulse" style={{ borderColor: sand }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const d = data

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      <div className="p-8 max-w-5xl mx-auto w-full" data-testid="monitoring-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
              System Monitoring
            </h1>
            <p className="text-sm mt-1" style={{ color: muted }}>Real-time health status and diagnostics</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg disabled:opacity-50"
            style={{ backgroundColor: olive, boxShadow: '0 10px 15px -3px rgba(90,114,71,0.2)' }}
            data-testid="refresh-btn"
          >
            <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Status Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }} data-testid="server-card">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
                  <span className="material-symbols-outlined" style={{ color: olive }}>dns</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Server Status</h3>
              </div>
              <StatusBadge status={d.server.status} />
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>Uptime</span>
                <span className="text-sm font-bold" style={{ color: warmBrown }}>{formatUptime(d.server.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>Runtime</span>
                <span className="text-sm font-mono" style={{ color: lightMuted }}>{d.server.version.runtime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>Build</span>
                <span className="text-sm font-mono" style={{ color: lightMuted }}>
                  #{d.server.version.build}{d.server.version.hash && <> &middot; <span style={{ color: '#d1c9b2' }}>{d.server.version.hash}</span></>}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }} data-testid="memory-card">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
                  <span className="material-symbols-outlined" style={{ color: olive }}>memory</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Memory</h3>
              </div>
              <MemoryBadge percent={d.memory.usagePercent} />
            </div>
            <div className="px-6 py-5 space-y-4">
              <MemoryBar percent={d.memory.usagePercent} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>RSS</span>
                <span className="text-sm font-mono" style={{ color: lightMuted }}>{d.memory.rss} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>Heap</span>
                <span className="text-sm font-mono" style={{ color: lightMuted }}>{d.memory.heapUsed} / {d.memory.heapTotal} MB</span>
              </div>
            </div>
          </div>

          {/* Database Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }} data-testid="db-card">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
                  <span className="material-symbols-outlined" style={{ color: olive }}>database</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Database</h3>
              </div>
              <StatusBadge status={d.db.status} />
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: muted }}>Response Time</span>
                <ResponseTimeText ms={d.db.responseTimeMs} />
              </div>
              <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: sand }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(d.db.responseTimeMs / 3, 100)}%`,
                    backgroundColor: d.db.responseTimeMs > 200 ? '#ef4444' : d.db.responseTimeMs >= 50 ? terracotta : olive,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px]" style={{ color: lightMuted }}>
                <span>0ms</span>
                <span>300ms</span>
              </div>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }} data-testid="error-card">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: sand, backgroundColor: `${cream}80` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: d.errors.count24h > 0 ? 'rgba(239,68,68,0.1)' : oliveBg }}>
                  <span className="material-symbols-outlined" style={{ color: d.errors.count24h > 0 ? '#ef4444' : olive }}>
                    {d.errors.count24h > 0 ? 'warning' : 'check_circle'}
                  </span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Errors (24h)</h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: d.errors.count24h > 0 ? 'rgba(239,68,68,0.1)' : oliveBg,
                  color: d.errors.count24h > 0 ? '#ef4444' : olive,
                }}
              >
                {d.errors.count24h} events
              </span>
            </div>
            <div className="px-6 py-5">
              {d.errors.recent.length > 0 ? (
                <div className="space-y-2">
                  {d.errors.recent.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: `${sand}80` }}>
                      <span className="text-xs font-mono whitespace-nowrap mt-0.5" style={{ color: lightMuted }}>
                        {new Date(e.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#ef4444' }}>{e.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: oliveBg }}>
                    <svg className="w-5 h-5" style={{ color: olive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: olive }}>No errors</p>
                  <p className="text-xs mt-1" style={{ color: lightMuted }}>All systems operational</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center text-xs" style={{ color: lightMuted }}>
          <p>Auto-refresh every 30 seconds</p>
          <div className="flex gap-6">
            <span>System Status: <span style={{ color: olive }}>Healthy</span></span>
            <span>API v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
