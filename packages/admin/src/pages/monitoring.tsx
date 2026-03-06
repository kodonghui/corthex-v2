import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Badge, Skeleton } from '@corthex/ui'

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
    <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}

export function MonitoringPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['monitoring'],
    queryFn: () => api.get<MonitoringData>('/admin/monitoring/status'),
    refetchInterval: 30_000,
  })

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">시스템 모니터링</h1>
        <Card><CardContent>
          <p className="text-sm text-red-500 text-center py-8">서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        </CardContent></Card>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const d = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">시스템 모니터링</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {isFetching ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 서버 상태 */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">서버 상태</h2>
              <Badge variant={d.server.status === 'ok' ? 'success' : 'error'}>{d.server.status}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">업타임</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatUptime(d.server.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">런타임</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.server.version.runtime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">빌드</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">#{d.server.version.build}{d.server.version.hash && ` · ${d.server.version.hash}`}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 메모리 */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">메모리</h2>
              <span className="text-xs font-medium text-zinc-500">{d.memory.usagePercent}%</span>
            </div>
            <MemoryBar percent={d.memory.usagePercent} />
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">RSS</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.memory.rss} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">힙 사용량</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.memory.heapUsed} / {d.memory.heapTotal} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DB 상태 */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">데이터베이스</h2>
              <Badge variant={d.db.status === 'ok' ? 'success' : 'error'}>{d.db.status}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">응답 시간</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{d.db.responseTimeMs} ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 에러 요약 */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">에러 (24시간)</h2>
              <Badge variant={d.errors.count24h > 0 ? 'error' : 'success'}>{d.errors.count24h}건</Badge>
            </div>
            {d.errors.recent.length > 0 ? (
              <div className="space-y-2">
                {d.errors.recent.map((e, i) => (
                  <div key={i} className="text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0">
                    <p className="text-zinc-500 font-mono">{new Date(e.timestamp).toLocaleString('ko-KR')}</p>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 truncate">{e.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-4">에러 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
