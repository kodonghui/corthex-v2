import { useAuthStore } from '../stores/auth-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

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

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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

  const notifications = notifData?.data

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">
        안녕하세요 {user?.name}님
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        오늘도 좋은 하루 되세요.
      </p>

      {/* 야간 작업 알림 */}
      {notifications && notifications.total > 0 && (
        <div className="mb-8 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              밤새 완료된 작업: {notifications.total}건
            </h3>
            <div className="flex gap-2">
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
                상세 보기
              </button>
            </div>
          </div>

          {notifications.completedCount > 0 && (
            <p className="text-xs text-green-700 dark:text-green-300 mb-1">
              성공: {notifications.completedCount}건
            </p>
          )}
          {notifications.failedCount > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">
              실패: {notifications.failedCount}건
            </p>
          )}

          <div className="mt-3 space-y-2">
            {notifications.jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-2 text-xs"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  job.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">{job.agentName}</span>
                <span className="text-zinc-500 dark:text-zinc-400 truncate">{job.instruction}</span>
              </div>
            ))}
            {notifications.total > 5 && (
              <p className="text-[10px] text-zinc-400">+{notifications.total - 5}건 더...</p>
            )}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {(!notifications || notifications.total === 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            onClick={() => navigate('/chat')}
          >
            <p className="text-sm text-zinc-500">채팅</p>
            <p className="text-xs text-zinc-400 mt-1">에이전트와 대화를 시작하세요</p>
          </div>
          <div
            className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            onClick={() => navigate('/jobs')}
          >
            <p className="text-sm text-zinc-500">야간 작업</p>
            <p className="text-xs text-zinc-400 mt-1">시켜놓고 퇴근하세요</p>
          </div>
          <div
            className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            onClick={() => navigate('/reports')}
          >
            <p className="text-sm text-zinc-500">보고서</p>
            <p className="text-xs text-zinc-400 mt-1">업무 보고를 확인하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}
