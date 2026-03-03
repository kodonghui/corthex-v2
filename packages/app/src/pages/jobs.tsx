import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

type Agent = {
  id: string
  name: string
  role: string
  status: string
  isSecretary: boolean
}

type NightJob = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result: string | null
  error: string | null
  retryCount: number
  maxRetries: number
  scheduledFor: string
  startedAt: string | null
  completedAt: string | null
  isRead: boolean
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  queued: { label: '대기', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  processing: { label: '처리중', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  failed: { label: '실패', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

export function JobsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [instruction, setInstruction] = useState('')
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: jobsData } = useQuery({
    queryKey: ['night-jobs'],
    queryFn: () => api.get<{ data: NightJob[] }>('/workspace/jobs'),
    refetchInterval: 10_000,
  })

  const queueJob = useMutation({
    mutationFn: (body: { agentId: string; instruction: string }) =>
      api.post('/workspace/jobs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-notifications'] })
      setShowForm(false)
      setInstruction('')
      setSelectedAgent('')
    },
  })

  const cancelJob = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-jobs'] }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/workspace/jobs/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-notifications'] })
    },
  })

  const agentList = agentsData?.data || []
  const jobs = jobsData?.data || []

  const handleSubmit = () => {
    if (!selectedAgent || !instruction.trim()) return
    queueJob.mutate({ agentId: selectedAgent, instruction: instruction.trim() })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">야간 작업</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            시켜놓고 퇴근 — AI가 밤새 처리합니다
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? '취소' : '+ 새 작업 등록'}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 등록 폼 */}
        {showForm && (
          <div className="p-5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="">에이전트 선택...</option>
                {agentList.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.isSecretary ? '(비서)' : ''} — {agent.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘"
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedAgent || !instruction.trim() || queueJob.isPending}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {queueJob.isPending ? '등록 중...' : '야간 작업 등록'}
            </button>
          </div>
        )}

        {/* 작업 목록 */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-sm text-zinc-400">
              <p className="text-3xl mb-3">🌙</p>
              <p>등록된 야간 작업이 없습니다</p>
              <p className="text-xs mt-1">작업을 등록하면 AI가 백그라운드에서 처리합니다</p>
            </div>
          ) : (
            jobs.map((job) => {
              const cfg = statusConfig[job.status]
              const isExpanded = expandedJob === job.id

              return (
                <div
                  key={job.id}
                  className={`border rounded-lg overflow-hidden ${
                    !job.isRead && (job.status === 'completed' || job.status === 'failed')
                      ? 'border-indigo-300 dark:border-indigo-700'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* 헤더 */}
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    onClick={() => {
                      setExpandedJob(isExpanded ? null : job.id)
                      if (!job.isRead && (job.status === 'completed' || job.status === 'failed')) {
                        markRead.mutate(job.id)
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-zinc-400">{job.agentName}</span>
                        {!job.isRead && (job.status === 'completed' || job.status === 'failed') && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{job.instruction}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(job.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {job.status === 'processing' && ' — 처리중...'}
                        {job.completedAt && ` → ${new Date(job.completedAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {job.status === 'queued' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('이 작업을 취소하시겠습니까?')) {
                              cancelJob.mutate(job.id)
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          취소
                        </button>
                      )}
                      <span className="text-zinc-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* 상세 내용 */}
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      {job.result && (
                        <div className="mb-3">
                          <p className="text-[10px] font-medium text-green-600 dark:text-green-400 mb-1">결과</p>
                          <div className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-white dark:bg-zinc-800 rounded-md p-3 max-h-60 overflow-y-auto">
                            {job.result}
                          </div>
                        </div>
                      )}
                      {job.error && (
                        <div className="mb-3">
                          <p className="text-[10px] font-medium text-red-600 dark:text-red-400 mb-1">오류</p>
                          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-md p-3">
                            {job.error}
                          </p>
                        </div>
                      )}
                      {job.retryCount > 0 && (
                        <p className="text-[10px] text-zinc-400">
                          재시도: {job.retryCount}/{job.maxRetries}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
