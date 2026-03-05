import { useAuthStore } from '../stores/auth-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Badge, StatusDot, Skeleton } from '@corthex/ui'

type Agent = { id: string; name: string; role: string; status: string; isSecretary: boolean }
type JobNotification = {
  id: string
  agentName: string
  instruction: string
  status: 'completed' | 'failed'
  result: string | null
  error: string | null
  completedAt: string | null
}
type NotificationsResponse = {
  total: number
  completedCount: number
  failedCount: number
  jobs: JobNotification[]
}

const STATUS_ORDER: Record<string, number> = { online: 0, working: 1, error: 2, offline: 3 }
const MAX_AGENTS = 8

function sortAgents(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    if (a.isSecretary !== b.isSecretary) return a.isSecretary ? -1 : 1
    const statusDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
    if (statusDiff !== 0) return statusDiff
    return a.name.localeCompare(b.name, 'ko')
  })
}

function formatDate(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: notifData } = useQuery({
    queryKey: ['job-notifications'],
    queryFn: () => api.get<{ data: NotificationsResponse }>('/workspace/jobs/notifications'),
    refetchInterval: 30_000,
  })

  const readAll = useMutation({
    mutationFn: () => api.put('/workspace/jobs/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
    },
  })

  const allAgents = agentsData?.data || []
  const sorted = sortAgents(allAgents)
  const visibleAgents = sorted.slice(0, MAX_AGENTS)
  const overflowCount = sorted.length - MAX_AGENTS
  const notifications = notifData?.data

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      {/* 인사 헤더 */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          안녕하세요, {user?.name}님 👋
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">{formatDate()}</p>
      </div>

      {/* 야간 작업 알림 */}
      {notifications && notifications.total > 0 && (
        <Card className="mb-6 border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/30">
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🌙</span>
                <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  밤새 완료된 작업: {notifications.total}건
                </h3>
                {notifications.completedCount > 0 && (
                  <Badge variant="success">{notifications.completedCount} 성공</Badge>
                )}
                {notifications.failedCount > 0 && (
                  <Badge variant="error">{notifications.failedCount} 실패</Badge>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => readAll.mutate()}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  모두 읽음
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  자세히 →
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {notifications.jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center gap-2 text-xs py-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    job.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{job.agentName}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 truncate">{job.instruction}</span>
                </div>
              ))}
              {notifications.total > 5 && (
                <p className="text-[10px] text-zinc-400 pt-1">+{notifications.total - 5}건 더...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 내 팀 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">내 팀</h2>
        {agentsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : visibleAgents.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleAgents.map((a) => {
                const isOffline = a.status === 'offline'
                return (
                  <Card
                    key={a.id}
                    className={`transition-colors ${
                      isOffline
                        ? 'opacity-60'
                        : 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                    onClick={isOffline ? undefined : () => navigate('/chat')}
                  >
                    <CardContent>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusDot status={a.status} />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.name}</span>
                        {a.isSecretary && <span className="text-xs" title="비서">⭐</span>}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{a.role}</p>
                      {!isOffline && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">채팅 →</span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {overflowCount > 0 && (
              <p className="text-xs text-zinc-400 mt-2 text-center">
                +{overflowCount}명 더 보기
              </p>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-zinc-500">아직 배정된 에이전트가 없습니다</p>
              <p className="text-xs text-zinc-400 mt-1">관리자에게 에이전트 배정을 요청하세요</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 빠른 시작 */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">빠른 시작</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/chat', icon: '💬', label: '채팅', desc: '에이전트와 대화' },
            { to: '/jobs', icon: '🌙', label: '야간 작업', desc: '시켜놓고 퇴근' },
            { to: '/reports', icon: '📄', label: '보고서', desc: '업무 보고 확인' },
          ].map((item) => (
            <div
              key={item.to}
              className="px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
              onClick={() => navigate(item.to)}
            >
              <span className="text-lg">{item.icon}</span>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
