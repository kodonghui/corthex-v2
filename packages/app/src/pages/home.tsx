import { useAuthStore } from '../stores/auth-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { StatusDot } from '@corthex/ui'

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

const NOTIF_ICON: Record<string, string> = {
  chat_complete: '\u{1F514}',
  delegation_complete: '\u{1F916}',
  tool_error: '\u{26A0}\u{FE0F}',
  job_complete: '\u{2705}',
  job_error: '\u{274C}',
  system: '\u{2699}\u{FE0F}',
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
    <div data-testid="home-page" className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Greeting Header */}
      <div className="space-y-1" data-testid="greeting-header">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          안녕하세요, {user?.name}님 👋
        </h1>
        <p className="text-sm text-slate-400">{formatDate()}</p>
      </div>

      {/* Overnight Jobs Card */}
      {notifications && notifications.total > 0 && (
        <div data-testid="overnight-jobs-card" className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">밤사이 완료된 작업</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">✓ {notifications.completedCount}건</span>
                {notifications.failedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">✕ {notifications.failedCount}건</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid="mark-all-read-btn"
                onClick={() => readAll.mutate()}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
              >
                모두 읽음
              </button>
              <button
                data-testid="jobs-detail-btn"
                onClick={() => navigate('/jobs')}
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
              >
                자세히 →
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-700/50">
            {notifications.jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="px-5 py-3 flex items-start gap-3">
                {job.status === 'completed' ? (
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
                ) : (
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">✕</span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-300">{job.agentName}</span>
                  <span className="text-xs text-slate-500 mx-1.5">—</span>
                  <span className="text-xs text-slate-400 truncate">{job.instruction}</span>
                </div>
              </div>
            ))}
            {notifications.total > 5 && (
              <div className="px-5 py-2 text-center">
                <button onClick={() => navigate('/jobs')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">+{notifications.total - 5}건 더...</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Team */}
      <div className="space-y-3" data-testid="my-team-section">
        <h2 className="text-sm font-semibold text-slate-200">내 팀</h2>
        {agentsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : visibleAgents.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleAgents.map((a) => {
                const isOffline = a.status === 'offline'
                const isError = a.status === 'error'
                if (isOffline) {
                  return (
                    <div
                      key={a.id}
                      data-testid={`agent-card-${a.id}`}
                      className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <StatusDot status="offline" />
                        <span className="text-sm font-medium text-slate-400 truncate">{a.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{a.role}</p>
                      <p className="text-xs text-slate-600 mt-2">오프라인</p>
                    </div>
                  )
                }
                return (
                  <div
                    key={a.id}
                    data-testid={`agent-card-${a.id}`}
                    onClick={() => navigate('/chat')}
                    className={`bg-slate-800/50 border rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-colors group cursor-pointer ${
                      isError ? 'border-red-500/30' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <StatusDot status={a.status} />
                      <span className="text-sm font-medium text-white truncate">{a.name}</span>
                      {a.isSecretary && <span className="text-xs">⭐</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{a.role}</p>
                    {isError ? (
                      <p className="text-xs text-red-400 mt-2">오류 발생</p>
                    ) : (
                      <p className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">채팅 →</p>
                    )}
                  </div>
                )
              })}
            </div>
            {overflowCount > 0 && (
              <div className="text-right">
                <span className="text-xs text-slate-500">+{overflowCount}명 더 보기</span>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400">아직 배정된 에이전트가 없습니다</p>
            <p className="text-xs text-slate-500 mt-1">관리자에게 문의하세요.</p>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      <RecentNotifications />

      {/* Quick Start */}
      <div className="space-y-3" data-testid="quick-start-section">
        <h2 className="text-sm font-semibold text-slate-200">빠른 시작</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { path: '/chat', icon: '💬', title: '채팅', description: '에이전트와 대화' },
            { path: '/jobs', icon: '🌙', title: '야간 작업', description: '시켜놓고 퇴근' },
            { path: '/reports', icon: '📄', title: '보고서', description: '업무 보고 확인' },
          ].map((item) => (
            <div
              key={item.path}
              data-testid={`quick-start-${item.path.slice(1)}`}
              onClick={() => navigate(item.path)}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-colors text-center cursor-pointer"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="text-sm font-medium text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type RecentNotif = {
  id: string
  type: string
  title: string
  isRead: boolean
  createdAt: string
}

function RecentNotifications() {
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => api.get<{ data: RecentNotif[] }>('/workspace/notifications?limit=5'),
    refetchInterval: 300_000,
  })

  const items = data?.data ?? []
  if (items.length === 0) return null

  return (
    <div data-testid="recent-notifications-section" className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">최근 알림</h3>
        <button
          data-testid="notifications-view-all-btn"
          onClick={() => navigate('/notifications')}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          모두 보기 →
        </button>
      </div>
      <div className="divide-y divide-slate-700/30">
        {items.map((n) => (
          <div key={n.id} className={`px-5 py-3 flex items-center gap-3 ${!n.isRead ? 'bg-blue-500/5' : ''}`}>
            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
            <span className="text-sm flex-shrink-0">{NOTIF_ICON[n.type] || '🔔'}</span>
            <span className={`text-sm truncate flex-1 ${n.isRead ? 'text-slate-400' : 'text-white font-medium'}`}>
              {n.title}
            </span>
            <span className="text-xs text-slate-500 font-mono flex-shrink-0">
              {new Date(n.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
