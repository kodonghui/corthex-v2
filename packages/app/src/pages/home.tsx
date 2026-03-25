import { useAuthStore } from '../stores/auth-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

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

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  online: { dot: 'bg-emerald-400 animate-pulse', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: '활성' },
  working: { dot: 'bg-blue-400 animate-pulse', bg: 'bg-blue-500/10', text: 'text-blue-400', label: '작업중' },
  error: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400', label: '오류' },
  offline: { dot: 'bg-slate-500', bg: 'bg-slate-500/10', text: 'text-stone-400', label: '오프라인' },
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
    <div data-testid="home-page" className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-8">

        {/* ── Greeting Header ── */}
        <div data-testid="greeting-header" className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            안녕하세요, {user?.name}님
          </h1>
          <p className="text-sm text-stone-400 font-medium">{formatDate()}</p>
        </div>

        {/* ── Overnight Jobs Card ── */}
        {notifications && notifications.total > 0 && (
          <div
            data-testid="overnight-jobs-card"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/15 via-slate-800/80 to-slate-800/80 border border-violet-500/20 backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative px-6 py-5 border-b border-stone-200/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">밤사이 완료된 작업</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {notifications.completedCount}건 완료
                    </span>
                    {notifications.failedCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {notifications.failedCount}건 실패
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-testid="mark-all-read-btn"
                  onClick={() => readAll.mutate()}
                  className="text-xs text-stone-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-stone-200/60 transition-all border border-transparent hover:border-stone-300/50"
                >
                  모두 읽음
                </button>
                <button
                  data-testid="jobs-detail-btn"
                  onClick={() => navigate('/jobs')}
                  className="text-xs text-violet-400 hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-all border border-transparent hover:border-violet-500/20"
                >
                  자세히 →
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-700/30">
              {notifications.jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-stone-100/30 transition-colors">
                  {job.status === 'completed' ? (
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  ) : (
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center text-xs flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-200">{job.agentName}</span>
                    <span className="text-xs text-slate-600 mx-2">—</span>
                    <span className="text-xs text-stone-500 truncate">{job.instruction}</span>
                  </div>
                </div>
              ))}
              {notifications.total > 5 && (
                <div className="px-6 py-3 text-center">
                  <button onClick={() => navigate('/jobs')} className="text-xs text-stone-400 hover:text-violet-400 transition-colors font-medium">
                    +{notifications.total - 5}건 더 보기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── My Team ── */}
        <div data-testid="my-team-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-corthex-accent/80">내 팀</h2>
            {allAgents.length > 0 && (
              <span className="text-xs text-stone-400 font-mono">{allAgents.length}명</span>
            )}
          </div>
          {agentsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-stone-100/40 border border-stone-200/50 p-5 h-32">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/50 animate-pulse" />
                    <div className="h-3 w-16 bg-stone-200/50 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-24 bg-stone-200/30 animate-pulse rounded mt-3" />
                  <div className="h-5 w-12 bg-stone-200/20 animate-pulse rounded-full mt-3" />
                </div>
              ))}
            </div>
          ) : visibleAgents.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleAgents.map((a) => {
                  const isOffline = a.status === 'offline'
                  const isError = a.status === 'error'
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.offline

                  if (isOffline) {
                    return (
                      <div
                        key={a.id}
                        data-testid={`agent-card-${a.id}`}
                        className="rounded-2xl bg-stone-100/20 border border-stone-200/30 p-5 opacity-50"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-stone-200/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-stone-400 truncate">{a.name}</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{a.role}</p>
                        <span className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-xs bg-stone-200/30 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 오프라인
                        </span>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={a.id}
                      data-testid={`agent-card-${a.id}`}
                      onClick={() => navigate('/chat')}
                      className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all duration-300 ${
                        isError
                          ? 'bg-gradient-to-br from-red-600/10 via-slate-800/80 to-slate-800/80 border border-red-500/20 hover:border-red-500/40'
                          : 'bg-gradient-to-br from-cyan-600/10 via-slate-800/80 to-slate-800/80 border border-corthex-accent/15 hover:border-corthex-accent/30'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 transition-colors ${
                        isError ? 'bg-red-500/5 group-hover:bg-red-500/10' : 'bg-corthex-accent/5 group-hover:bg-corthex-accent/10'
                      }`} />
                      <div className="relative">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isError ? 'bg-red-500/20' : 'bg-corthex-accent/15'}`}>
                            <svg className={`w-4 h-4 ${isError ? 'text-red-400' : 'text-corthex-accent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-white truncate">{a.name}</span>
                          {a.isSecretary && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">COS</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 truncate">{a.role}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                          </span>
                          <span className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            채팅 →
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {overflowCount > 0 && (
                <div className="text-right">
                  <button onClick={() => navigate('/chat')} className="text-xs text-stone-400 hover:text-corthex-accent transition-colors font-medium">
                    +{overflowCount}명 더 보기 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-stone-100/30 border border-stone-200/40 p-12 text-center backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-sm text-stone-500 font-medium">아직 배정된 에이전트가 없습니다</p>
              <p className="text-xs text-slate-600 mt-1">관리자에게 문의하세요.</p>
            </div>
          )}
        </div>

        {/* ── Recent Notifications ── */}
        <RecentNotifications />

        {/* ── Quick Start ── */}
        <div data-testid="quick-start-section" className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">빠른 시작</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                path: '/chat',
                title: '채팅',
                description: '에이전트와 대화',
                color: 'blue',
                icon: (
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                ),
                gradient: 'from-blue-600/15',
                border: 'border-blue-500/15 hover:border-blue-500/30',
                decorBg: 'bg-blue-500/5 group-hover:bg-blue-500/10',
                iconBg: 'bg-blue-500/20',
              },
              {
                path: '/jobs',
                title: '야간 작업',
                description: '시켜놓고 퇴근',
                color: 'violet',
                icon: (
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ),
                gradient: 'from-violet-600/15',
                border: 'border-violet-500/15 hover:border-violet-500/30',
                decorBg: 'bg-violet-500/5 group-hover:bg-violet-500/10',
                iconBg: 'bg-violet-500/20',
              },
              {
                path: '/reports',
                title: '보고서',
                description: '업무 보고 확인',
                color: 'emerald',
                icon: (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
                gradient: 'from-emerald-600/15',
                border: 'border-emerald-500/15 hover:border-emerald-500/30',
                decorBg: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
                iconBg: 'bg-emerald-500/20',
              },
            ].map((item) => (
              <div
                key={item.path}
                data-testid={`quick-start-${item.path.slice(1)}`}
                onClick={() => navigate(item.path)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} via-slate-800/80 to-slate-800/80 border ${item.border} p-6 cursor-pointer group transition-all duration-300 hover:shadow-lg text-center`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 transition-colors ${item.decorBg}`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mx-auto mb-3`}>
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-stone-400 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
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
    <div data-testid="recent-notifications-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">최근 알림</h2>
        <button
          data-testid="notifications-view-all-btn"
          onClick={() => navigate('/notifications')}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          모두 보기 →
        </button>
      </div>
      <div className="rounded-2xl bg-stone-100/40 border border-stone-200/50 overflow-hidden backdrop-blur-sm">
        <div className="divide-y divide-slate-700/30">
          {items.map((n) => (
            <div
              key={n.id}
              className={`px-5 py-3.5 flex items-center gap-3 hover:bg-stone-100/40 transition-colors ${!n.isRead ? 'bg-blue-500/5' : ''}`}
            >
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-sm shadow-blue-500/50" />}
              <span className="text-sm flex-shrink-0">{NOTIF_ICON[n.type] || '\u{1F514}'}</span>
              <span className={`text-sm truncate flex-1 ${n.isRead ? 'text-stone-500' : 'text-white font-medium'}`}>
                {n.title}
              </span>
              <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                {new Date(n.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
