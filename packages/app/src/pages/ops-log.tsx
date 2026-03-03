import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type ActivityLog = {
  id: string
  type: string
  actorType: string
  actorId: string | null
  actorName: string | null
  action: string
  detail: string | null
  metadata: unknown
  createdAt: string
}

type Summary = {
  today: { type: string; count: number }[]
  week: { type: string; count: number }[]
}

const TYPE_LABELS: Record<string, string> = {
  chat: '채팅',
  delegation: '위임',
  tool_call: '도구호출',
  job: '야간작업',
  sns: 'SNS',
  error: '오류',
  system: '시스템',
  login: '로그인',
}

const TYPE_COLORS: Record<string, string> = {
  chat: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  delegation: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  tool_call: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  job: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  sns: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  system: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  login: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

const ACTOR_EMOJI: Record<string, string> = {
  user: '👤',
  agent: '🤖',
  system: '⚙️',
}

export function OpsLogPage() {
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data: logsData } = useQuery({
    queryKey: ['activity-log', typeFilter],
    queryFn: () => {
      const params = typeFilter ? `?type=${typeFilter}&limit=100` : '?limit=100'
      return api.get<{ data: ActivityLog[] }>(`/workspace/activity-log${params}`)
    },
  })

  const { data: summaryData } = useQuery({
    queryKey: ['activity-log-summary'],
    queryFn: () => api.get<{ data: Summary }>('/workspace/activity-log/summary'),
  })

  const logs = logsData?.data || []
  const summary = summaryData?.data

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">작전일지</h2>
      </div>

      <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1">
        {/* 요약 */}
        {summary && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-zinc-500 mb-2">오늘</h3>
              <div className="flex flex-wrap gap-2">
                {summary.today.length === 0 && <span className="text-xs text-zinc-400">활동 없음</span>}
                {summary.today.map((s) => (
                  <span key={s.type} className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[s.type]}`}>
                    {TYPE_LABELS[s.type]} {s.count}건
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-zinc-500 mb-2">이번주</h3>
              <div className="flex flex-wrap gap-2">
                {summary.week.length === 0 && <span className="text-xs text-zinc-400">활동 없음</span>}
                {summary.week.map((s) => (
                  <span key={s.type} className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[s.type]}`}>
                    {TYPE_LABELS[s.type]} {s.count}건
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter('')}
            className={`text-xs px-2 py-1 rounded ${!typeFilter ? 'bg-zinc-200 dark:bg-zinc-700' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            전체
          </button>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`text-xs px-2 py-1 rounded ${typeFilter === key ? 'bg-zinc-200 dark:bg-zinc-700' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 타임라인 */}
        <div className="space-y-2">
          {logs.length === 0 && <p className="text-sm text-zinc-500">활동 로그가 없습니다.</p>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <span className="text-lg">{ACTOR_EMOJI[log.actorType]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[log.type]}`}>
                    {TYPE_LABELS[log.type]}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {log.actorName || (log.actorType === 'system' ? '시스템' : '알 수 없음')}
                  </span>
                </div>
                <p className="text-sm font-medium">{log.action}</p>
                {log.detail && <p className="text-xs text-zinc-500 truncate">{log.detail}</p>}
              </div>
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
