/**
 * Admin Monitoring Page — Stitch Design
 *
 * API Endpoints:
 *   GET /admin/monitoring/status
 */
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Server, Cpu, Database, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react'
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
  return [d && `${d}d`, h && `${h}h`, `${m}m`].filter(Boolean).join(' ')
}

function MemoryBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? 'var(--color-corthex-error)' : percent >= 80 ? 'var(--color-corthex-warning)' : 'var(--color-corthex-accent)'
  return (
    <div className="w-full h-1 bg-corthex-elevated overflow-hidden">
      <div className="h-full transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'ok'
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 ${isOk ? 'bg-corthex-success' : 'bg-corthex-error'}`} />
      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: isOk ? 'var(--color-corthex-success)' : 'var(--color-corthex-error)' }}>
        {isOk ? 'Online' : 'Error'}
      </span>
    </div>
  )
}

export function MonitoringPage() {
  const { data: rawData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['monitoring'],
    queryFn: () => api.get<MonitoringData>('/admin/monitoring/status'),
    refetchInterval: 30_000,
  })

  const data = rawData && rawData.server ? rawData : undefined

  if (isError) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-corthex-bg min-h-screen" data-testid="monitoring-page">
        <div className="bg-corthex-surface border border-corthex-border p-6 md:p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--color-corthex-error)' }} />
          <p className="text-sm font-mono" style={{ color: 'var(--color-corthex-error)' }}>Failed to load monitoring data.</p>
          <p className="text-xs mt-1 text-corthex-text-secondary">{(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 text-sm font-mono uppercase tracking-widest min-h-[44px]"
            style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-corthex-bg min-h-screen" data-testid="monitoring-page">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-testid="loading-state">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-corthex-surface border border-corthex-border h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="sm:col-span-1 md:col-span-4 bg-corthex-surface border border-corthex-border h-48 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const d = data
  const memPct = d.memory.usagePercent

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-corthex-bg min-h-screen relative" data-testid="monitoring-page">

      {/* HEADER METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Server Status */}
        <div className="bg-corthex-surface border border-corthex-border p-4 flex flex-col justify-between h-24" data-testid="server-card">
          <span className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Server_Status</span>
          <div className="flex items-end justify-between">
            <StatusBadge status={d.server.status} />
            <Server className="w-4 h-4" style={{ color: 'var(--color-corthex-accent)' }} />
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-corthex-surface border border-corthex-border p-4 flex flex-col justify-between h-24">
          <span className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">System_Uptime</span>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-corthex-text-primary">{formatUptime(d.server.uptime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-corthex-accent animate-pulse" />
              <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--color-corthex-accent)' }}>Stable</span>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-corthex-surface border border-corthex-border p-4 flex flex-col justify-between h-24" data-testid="error-card">
          <span className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">Errors_24h</span>
          <div className="flex items-end justify-between">
            <span className="font-mono text-3xl font-bold text-corthex-text-primary">{d.errors.count24h}</span>
            {d.errors.count24h > 0
              ? <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-corthex-error)' }} />
              : <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-corthex-success)' }} />
            }
          </div>
        </div>

        {/* DB Status */}
        <div className="bg-corthex-surface border-l-4 border-corthex-border p-4 flex flex-col justify-between h-24"
          style={{ borderLeftColor: 'var(--color-corthex-accent)' }} data-testid="db-card">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-corthex-accent)' }}>Database_Protocol</span>
          <div className="flex items-end justify-between">
            <StatusBadge status={d.db.status} />
            <Database className="w-4 h-4" style={{ color: 'var(--color-corthex-accent)' }} />
          </div>
        </div>
      </div>

      {/* MAIN BENTO GRID */}
      <div className="grid grid-cols-12 gap-6">

        {/* MEMORY USAGE GAUGE */}
        <div className="col-span-12 md:col-span-4 bg-corthex-surface border border-corthex-border p-6 relative group overflow-hidden" data-testid="memory-card">
          <div className="flex justify-between items-start mb-8">
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-corthex-text-primary">
              <span className="w-1 h-3" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
              Memory Allocation
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-24 overflow-hidden">
              <div className="absolute inset-0 border-[12px] border-corthex-elevated rounded-t-full" />
              <div
                className="absolute inset-0 border-[12px] rounded-t-full origin-bottom transition-transform duration-1000"
                style={{
                  borderColor: 'var(--color-corthex-accent)',
                  transform: `rotate(${(memPct / 100) * 180 - 90}deg)`,
                  clipPath: 'inset(0 50% 0 0)',
                }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="font-mono text-3xl font-black text-corthex-text-primary">{memPct}%</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled">RAM In Use</span>
              </div>
            </div>
            <div className="w-full mt-8 grid grid-cols-2 gap-2">
              <div className="bg-corthex-bg p-2">
                <p className="font-mono text-[8px] text-corthex-text-disabled uppercase">Heap Used</p>
                <p className="font-mono text-xs text-corthex-text-primary">{d.memory.heapUsed} MB</p>
              </div>
              <div className="bg-corthex-bg p-2">
                <p className="font-mono text-[8px] text-corthex-text-disabled uppercase">Heap Total</p>
                <p className="font-mono text-xs text-corthex-text-primary">{d.memory.heapTotal} MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* RSS GAUGE */}
        <div className="col-span-12 md:col-span-4 bg-corthex-surface border border-corthex-border p-6 relative group">
          <div className="flex justify-between items-start mb-8">
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-corthex-text-primary">
              <span className="w-1 h-3" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
              Process Memory
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-24 overflow-hidden">
              <div className="absolute inset-0 border-[12px] border-corthex-elevated rounded-t-full" />
              <div
                className="absolute inset-0 border-[12px] rounded-t-full origin-bottom transition-transform duration-1000"
                style={{
                  borderColor: 'var(--color-corthex-accent)',
                  transform: `rotate(${Math.min((d.memory.rss / 512) * 180 - 90, 90)}deg)`,
                  clipPath: 'inset(0 50% 0 0)',
                }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="font-mono text-3xl font-black text-corthex-text-primary">{d.memory.rss}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled">MB RSS</span>
              </div>
            </div>
            <div className="w-full mt-8 grid grid-cols-2 gap-2">
              <div className="bg-corthex-bg p-2">
                <p className="font-mono text-[8px] text-corthex-text-disabled uppercase">Runtime</p>
                <p className="font-mono text-xs text-corthex-text-primary">{d.server.version.runtime}</p>
              </div>
              <div className="bg-corthex-bg p-2">
                <p className="font-mono text-[8px] text-corthex-text-disabled uppercase">Build</p>
                <p className="font-mono text-xs text-corthex-text-primary">#{d.server.version.build}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LOG FEED */}
        <div className="col-span-12 md:col-span-4 bg-corthex-bg border border-corthex-border p-6"
          style={{ borderLeftColor: 'var(--color-corthex-accent)', borderLeftWidth: '1px' }}>
          <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-corthex-accent)' }}>
            Live Sys-Log
          </h3>
          <div className="space-y-3 font-mono text-[10px]">
            {d.errors.recent.length > 0 ? d.errors.recent.map((e, i) => (
              <div key={i} className="flex gap-3 text-corthex-text-secondary border-b border-corthex-border pb-2">
                <span style={{ color: 'var(--color-corthex-accent)' }}>
                  [{new Date(e.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span style={{ color: 'var(--color-corthex-error)' }}>{e.message}</span>
              </div>
            )) : (
              <div className="flex gap-3 text-corthex-text-secondary border-b border-corthex-border pb-2">
                <span style={{ color: 'var(--color-corthex-accent)' }}>[SYS]</span>
                <span style={{ color: 'var(--color-corthex-success)' }}>ALL_SYSTEMS_NOMINAL</span>
              </div>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="refresh-btn"
            className="mt-4 w-full py-2 min-h-[44px] bg-corthex-elevated hover:bg-corthex-border transition-colors text-[9px] uppercase tracking-tighter font-mono flex items-center justify-center gap-2 text-corthex-text-secondary disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* DB LATENCY */}
        <div className="col-span-12 md:col-span-8 bg-corthex-surface border border-corthex-border p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-corthex-text-primary">
              <span className="w-1 h-3" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
              DB Response Latency (ms)
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
                <span className="font-mono text-[9px] uppercase text-corthex-text-secondary">Current</span>
              </div>
            </div>
          </div>
          <div className="h-48 w-full flex items-end gap-[2px]">
            <div className="flex-grow flex items-end justify-between h-full relative">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,100 L0,80 L40,70 L80,90 L120,40 L160,60 L200,30 L240,50 L280,20 L320,40 L360,30 L400,50 L400,100 Z"
                  fill="url(#gradMon)" fillOpacity="0.3" />
                <path d="M0,80 L40,70 L80,90 L120,40 L160,60 L200,30 L240,50 L280,20 L320,40 L360,30 L400,50"
                  fill="none" stroke="var(--color-corthex-accent)" strokeWidth="2" />
                <defs>
                  <linearGradient id="gradMon" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--color-corthex-accent)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'var(--color-corthex-accent)', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                {[0,1,2,3].map(i => <div key={i} className="w-full h-px bg-corthex-text-primary" />)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between font-mono text-[9px] text-corthex-text-disabled uppercase">
            <span>-30s</span><span>-24s</span><span>-18s</span><span>-12s</span><span>-6s</span><span>Now</span>
          </div>
          <div className="mt-2 text-right font-mono text-xs" style={{ color: d.db.responseTimeMs > 200 ? 'var(--color-corthex-error)' : d.db.responseTimeMs >= 50 ? 'var(--color-corthex-warning)' : 'var(--color-corthex-success)' }}>
            Current: {d.db.responseTimeMs}ms
          </div>
        </div>

        {/* NETWORK IO */}
        <div className="col-span-12 md:col-span-4 bg-corthex-surface border border-corthex-border p-6">
          <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 text-corthex-text-primary">
            <span className="w-1 h-3" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
            Memory Breakdown
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[9px] uppercase text-corthex-text-secondary">Heap Used</span>
                <span className="font-mono text-xs text-corthex-text-primary">{d.memory.heapUsed} MB</span>
              </div>
              <MemoryBar percent={Math.round((d.memory.heapUsed / d.memory.heapTotal) * 100)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[9px] uppercase text-corthex-text-secondary">RSS</span>
                <span className="font-mono text-xs text-corthex-text-primary">{d.memory.rss} MB</span>
              </div>
              <MemoryBar percent={Math.min(Math.round((d.memory.rss / 1024) * 100), 100)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[9px] uppercase text-corthex-text-secondary">DB Latency</span>
                <span className="font-mono text-xs" style={{ color: d.db.responseTimeMs > 200 ? 'var(--color-corthex-error)' : 'var(--color-corthex-success)' }}>
                  {d.db.responseTimeMs}ms
                </span>
              </div>
              <MemoryBar percent={Math.min(d.db.responseTimeMs / 3, 100)} />
            </div>
          </div>
        </div>

        {/* SUB-TELEMETRY CARDS */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1">
            <span className="font-mono text-[8px] uppercase text-corthex-text-disabled">Heap_Used</span>
            <span className="font-mono text-lg text-corthex-text-primary" style={{ color: 'var(--color-corthex-accent)' }}>{d.memory.heapUsed}<span className="text-[10px]">MB</span></span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1">
            <span className="font-mono text-[8px] uppercase text-corthex-text-disabled">Heap_Total</span>
            <span className="font-mono text-lg text-corthex-text-primary">{d.memory.heapTotal}<span className="text-[10px]">MB</span></span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1">
            <span className="font-mono text-[8px] uppercase text-corthex-text-disabled">RSS</span>
            <span className="font-mono text-lg text-corthex-text-primary">{d.memory.rss}<span className="text-[10px]">MB</span></span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1">
            <span className="font-mono text-[8px] uppercase text-corthex-text-disabled">DB_Latency</span>
            <span className="font-mono text-lg text-corthex-text-primary">{d.db.responseTimeMs}<span className="text-[10px]">ms</span></span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1">
            <span className="font-mono text-[8px] uppercase text-corthex-text-disabled">Build</span>
            <span className="font-mono text-lg text-corthex-text-primary">#{d.server.version.build}</span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-3 flex flex-col gap-1"
            style={{ borderColor: d.errors.count24h > 0 ? 'var(--color-corthex-error)' : 'var(--color-corthex-accent)' }}>
            <span className="font-mono text-[8px] uppercase" style={{ color: d.errors.count24h > 0 ? 'var(--color-corthex-error)' : 'var(--color-corthex-accent)' }}>System_Health</span>
            <span className="font-mono text-lg uppercase" style={{ color: d.errors.count24h > 0 ? 'var(--color-corthex-error)' : 'var(--color-corthex-accent)' }}>
              {d.errors.count24h > 0 ? 'Warning' : 'Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* DECORATIVE FOOTER */}
      <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-20 pointer-events-none">
        <div className="flex flex-wrap gap-4 sm:gap-12 font-mono text-[9px] uppercase text-corthex-text-disabled">
          <span>Runtime: {d.server.version.runtime}</span>
          <span>Hash: {d.server.version.hash || 'N/A'}</span>
          <span>Auto-refresh: 30s</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-1 bg-corthex-elevated relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/4 animate-pulse" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
          </div>
          <span className="font-mono text-[9px] text-corthex-text-disabled">ENCRYPTED_LINK_ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
