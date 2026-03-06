import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Select, Textarea, Badge, StatusDot, ConfirmDialog, ProgressBar } from '@corthex/ui'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'

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
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'blocked'
  result: string | null
  error: string | null
  retryCount: number
  maxRetries: number
  scheduledFor: string | null
  startedAt: string | null
  completedAt: string | null
  isRead: boolean
  resultData: { sessionId?: string; reportId?: string } | null
  parentJobId: string | null
  chainId: string | null
  createdAt: string
}

type Schedule = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  cronExpression: string
  description: string
  nextRunAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Trigger = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  triggerType: string
  condition: Record<string, unknown>
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  'price-above': '가격 상회',
  'price-below': '가격 하회',
  'market-open': '장 시작',
  'market-close': '장 마감',
}

type TabKey = 'oneTime' | 'schedule' | 'trigger'

const jobStatusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'error' | 'success' | 'warning' }> = {
  queued: { label: '대기', variant: 'info' },
  processing: { label: '처리중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
  blocked: { label: '대기(체인)', variant: 'default' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function JobsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('oneTime')
  const [showModal, setShowModal] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<Record<string, { progress: number; statusMessage: string }>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'job' | 'schedule' | 'trigger' | 'chain' } | null>(null)

  // 모달 상태
  const [modalType, setModalType] = useState<'oneTime' | 'schedule' | 'trigger'>('oneTime')
  const [chainSteps, setChainSteps] = useState<{ agentId: string; instruction: string }[]>([])
  const [modalTriggerType, setModalTriggerType] = useState('price-above')
  const [modalStockCode, setModalStockCode] = useState('')
  const [modalTargetPrice, setModalTargetPrice] = useState('')
  const [modalAgent, setModalAgent] = useState('')
  const [modalInstruction, setModalInstruction] = useState('')
  const [modalTime, setModalTime] = useState('22:00')
  const [modalFrequency, setModalFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily')
  const [modalDays, setModalDays] = useState<number[]>([])
  const [modalScheduledFor, setModalScheduledFor] = useState('')
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: jobsData } = useQuery({
    queryKey: ['night-jobs'],
    queryFn: () => api.get<{ data: NightJob[] }>('/workspace/jobs'),
    refetchInterval: 10_000,
  })

  const { data: schedulesData } = useQuery({
    queryKey: ['night-schedules'],
    queryFn: () => api.get<{ data: Schedule[] }>('/workspace/jobs/schedules'),
  })

  const { data: triggersData } = useQuery({
    queryKey: ['night-triggers'],
    queryFn: () => api.get<{ data: Trigger[] }>('/workspace/jobs/triggers'),
  })

  const queueJob = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; scheduledFor?: string }) =>
      api.post('/workspace/jobs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      closeModal()
    },
  })

  const createSchedule = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; frequency: string; time: string; days?: number[] }) =>
      api.post('/workspace/jobs/schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      closeModal()
    },
  })

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; frequency?: string; time?: string; days?: number[] }) =>
      api.patch(`/workspace/jobs/schedules/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      closeModal()
    },
  })

  const toggleSchedule = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/schedules/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-schedules'] }),
  })

  const cancelJob = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-jobs'] }),
  })

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-schedules'] }),
  })

  const createTrigger = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown> }) =>
      api.post('/workspace/jobs/triggers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-triggers'] })
      closeModal()
    },
  })

  const toggleTrigger = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/triggers/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-triggers'] }),
  })

  const deleteTrigger = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/triggers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-triggers'] }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/workspace/jobs/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-notifications'] })
    },
  })

  const createChain = useMutation({
    mutationFn: (body: { steps: { agentId: string; instruction: string }[] }) =>
      api.post('/workspace/jobs/chain', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      closeModal()
    },
  })

  const cancelChain = useMutation({
    mutationFn: (chainId: string) => api.delete(`/workspace/jobs/chain/${chainId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-jobs'] }),
  })

  // WebSocket 실시간 갱신
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; jobId?: string; progress?: number; statusMessage?: string }
    if (event.type === 'job-progress' && event.jobId) {
      setJobProgress(prev => {
        // 첫 progress 이벤트 시 query 갱신 (processing 상태 반영)
        if (!prev[event.jobId!]) queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
        return {
          ...prev,
          [event.jobId!]: { progress: event.progress || 0, statusMessage: event.statusMessage || '' },
        }
      })
    } else if (event.type === 'job-completed' || event.type === 'job-failed') {
      if (event.jobId) setJobProgress(prev => { const next = { ...prev }; delete next[event.jobId!]; return next })
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job-notifications'] })
    } else if (event.type === 'job-retrying' || event.type === 'job-queued' || event.type === 'chain-failed') {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
    }
  }, [queryClient])

  useEffect(() => {
    if (!isConnected || !user) return
    subscribe('night-job', {})
    const channelKey = `night-job::${user.companyId}`
    addListener(channelKey, wsHandler)
    return () => removeListener(channelKey, wsHandler)
  }, [isConnected, user, subscribe, addListener, removeListener, wsHandler])

  const agentList = agentsData?.data || []
  const jobs = jobsData?.data || []
  const schedules = schedulesData?.data || []
  const triggers = triggersData?.data || []

  function closeModal() {
    setShowModal(false)
    setModalAgent('')
    setModalInstruction('')
    setModalTime('22:00')
    setModalFrequency('daily')
    setModalDays([])
    setModalScheduledFor('')
    setModalTriggerType('price-above')
    setModalStockCode('')
    setModalTargetPrice('')
    setEditingSchedule(null)
    setChainSteps([])
  }

  function openEditSchedule(s: Schedule) {
    setEditingSchedule(s)
    setModalType('schedule')
    setModalAgent(s.agentId)
    setModalInstruction(s.instruction)
    // cron에서 시간 추출
    const parts = s.cronExpression.split(' ')
    setModalTime(`${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`)
    // 주기 추론
    const dow = parts[4]
    if (dow === '*') setModalFrequency('daily')
    else if (dow === '1-5') setModalFrequency('weekdays')
    else {
      setModalFrequency('custom')
      setModalDays(dow.split(',').map(Number))
    }
    setShowModal(true)
  }

  function handleSubmit() {
    if (!modalAgent || !modalInstruction.trim()) return

    // 체인 모드
    if (chainSteps.length > 0) {
      const allSteps = [{ agentId: modalAgent, instruction: modalInstruction.trim() }, ...chainSteps.filter(s => s.agentId && s.instruction.trim())]
      if (allSteps.length < 2) return
      createChain.mutate({ steps: allSteps })
      return
    }

    if (modalType === 'oneTime') {
      queueJob.mutate({
        agentId: modalAgent,
        instruction: modalInstruction.trim(),
        scheduledFor: modalScheduledFor ? new Date(modalScheduledFor).toISOString() : undefined,
      })
    } else if (modalType === 'trigger') {
      const isPriceTrigger = modalTriggerType === 'price-above' || modalTriggerType === 'price-below'
      if (isPriceTrigger && (!modalStockCode.trim() || !modalTargetPrice)) return
      const condition: Record<string, unknown> = isPriceTrigger
        ? { stockCode: modalStockCode.trim(), targetPrice: Number(modalTargetPrice) }
        : {}
      createTrigger.mutate({
        agentId: modalAgent,
        instruction: modalInstruction.trim(),
        triggerType: modalTriggerType,
        condition,
      })
    } else {
      if (modalFrequency === 'custom' && modalDays.length === 0) return
      const body = {
        agentId: modalAgent,
        instruction: modalInstruction.trim(),
        frequency: modalFrequency,
        time: modalTime,
        days: modalFrequency === 'custom' ? modalDays : undefined,
      }
      if (editingSchedule) {
        updateSchedule.mutate({ id: editingSchedule.id, ...body })
      } else {
        createSchedule.mutate(body)
      }
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    if (deleteTarget.type === 'chain') cancelChain.mutate(deleteTarget.id)
    else if (deleteTarget.type === 'job') cancelJob.mutate(deleteTarget.id)
    else if (deleteTarget.type === 'trigger') deleteTrigger.mutate(deleteTarget.id)
    else deleteSchedule.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  function toggleDay(day: number) {
    setModalDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'oneTime', label: '일회성', count: jobs.length },
    { key: 'schedule', label: '반복 스케줄', count: schedules.length },
    { key: 'trigger', label: '트리거', count: triggers.length },
  ]

  const isPending = queueJob.isPending || createSchedule.isPending || updateSchedule.isPending || createTrigger.isPending || createChain.isPending

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
          onClick={() => { setModalType(activeTab === 'trigger' ? 'trigger' : activeTab === 'schedule' ? 'schedule' : 'oneTime'); setShowModal(true) }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + 작업 등록
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-2xl space-y-3">
        {/* 일회성 탭 */}
        {activeTab === 'oneTime' && (
          jobs.length === 0 ? (
            <EmptyState text="등록된 일회성 작업이 없습니다" />
          ) : (
            (() => {
              // 체인 그룹 + 단독 작업 분리
              const chains = new Map<string, NightJob[]>()
              const singles: NightJob[] = []
              for (const job of jobs) {
                if (job.chainId) {
                  const list = chains.get(job.chainId) || []
                  list.push(job)
                  chains.set(job.chainId, list)
                } else {
                  singles.push(job)
                }
              }
              // 체인 내부 정렬: parentJobId 기반 순서
              for (const [, list] of chains) {
                list.sort((a, b) => {
                  if (!a.parentJobId) return -1
                  if (!b.parentJobId) return 1
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                })
              }

              const renderJob = (job: NightJob, indent = false) => (
                <div key={job.id} className={indent ? 'ml-6 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3' : ''}>
                  <JobCard
                    job={job}
                    progress={jobProgress[job.id]}
                    isExpanded={expandedJob === job.id}
                    onToggle={() => {
                      setExpandedJob(expandedJob === job.id ? null : job.id)
                      if (!job.isRead && (job.status === 'completed' || job.status === 'failed')) {
                        markRead.mutate(job.id)
                      }
                    }}
                    onCancel={() => setDeleteTarget({ id: job.id, type: 'job' })}
                  />
                </div>
              )

              return (
                <>
                  {/* 체인 그룹 */}
                  {[...chains.entries()].map(([chainId, chainJobs]) => {
                    const completed = chainJobs.filter(j => j.status === 'completed').length
                    const hasActive = chainJobs.some(j => j.status === 'queued' || j.status === 'blocked')
                    return (
                      <div key={chainId} className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            체인 ({completed}/{chainJobs.length} 완료)
                          </span>
                          {hasActive && (
                            <button
                              onClick={() => setDeleteTarget({ id: chainId, type: 'chain' })}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              체인 취소
                            </button>
                          )}
                        </div>
                        {chainJobs.map((job, i) => renderJob(job, i > 0))}
                      </div>
                    )
                  })}
                  {/* 단독 작업 */}
                  {singles.map(job => renderJob(job))}
                </>
              )
            })()
          )
        )}

        {/* 반복 스케줄 탭 */}
        {activeTab === 'schedule' && (
          schedules.length === 0 ? (
            <EmptyState text="등록된 반복 스케줄이 없습니다" />
          ) : (
            schedules.map(s => (
              <div key={s.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusDot status={s.isActive ? 'online' : 'offline'} />
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{s.description}</span>
                      <span className="text-xs text-zinc-400">{s.agentName}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{s.instruction}</p>
                    <div className="flex gap-3 mt-1.5 text-[10px] font-mono text-zinc-400">
                      {s.nextRunAt && (
                        <span>다음: {new Date(s.nextRunAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => openEditSchedule(s)}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => toggleSchedule.mutate(s.id)}
                      className={`text-xs ${s.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                    >
                      {s.isActive ? '중지' : '시작'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: s.id, type: 'schedule' })}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* 트리거 탭 */}
        {activeTab === 'trigger' && (
          triggers.length === 0 ? (
            <EmptyState text="등록된 이벤트 트리거가 없습니다" />
          ) : (
            triggers.map(t => (
              <div key={t.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusDot status={t.isActive ? 'online' : 'offline'} />
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {TRIGGER_TYPE_LABELS[t.triggerType] || t.triggerType}
                        {(t.triggerType === 'price-above' || t.triggerType === 'price-below') && t.condition && (
                          <> · {String(t.condition.stockCode)} {t.triggerType === 'price-above' ? '≥' : '≤'} {Number(t.condition.targetPrice).toLocaleString()}원</>
                        )}
                      </span>
                      <span className="text-xs text-zinc-400">{t.agentName}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{t.instruction}</p>
                    <div className="flex gap-3 mt-1.5 text-[10px] font-mono text-zinc-400">
                      {t.lastTriggeredAt && (
                        <span>마지막 발동: {new Date(t.lastTriggeredAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                      {t.isActive && <span>● 감시 중</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => toggleTrigger.mutate(t.id)}
                      className={`text-xs ${t.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}`}
                    >
                      {t.isActive ? '중지' : '다시 감시'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: t.id, type: 'trigger' })}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => closeModal()}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">{editingSchedule ? '스케줄 수정' : '작업 등록'}</h3>

            {/* 유형 선택 (신규만) */}
            {!editingSchedule && (
              <div className="flex gap-3 flex-wrap">
                {([['oneTime', '일회성'], ['schedule', '반복 스케줄'], ['trigger', '이벤트 트리거']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={modalType === val}
                      onChange={() => setModalType(val)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* 에이전트 */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
              <Select
                value={modalAgent}
                onChange={e => setModalAgent(e.target.value)}
                placeholder="에이전트 선택..."
                options={agentList.map(a => ({
                  value: a.id,
                  label: `${a.name} ${a.isSecretary ? '(비서)' : ''} — ${a.role}`,
                }))}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
              <Textarea
                value={modalInstruction}
                onChange={e => setModalInstruction(e.target.value)}
                placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘"
                rows={3}
              />
            </div>

            {/* 일회성 — 실행 시간 (선택) */}
            {modalType === 'oneTime' && chainSteps.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">실행 시간 (비워두면 즉시)</label>
                <input
                  type="datetime-local"
                  value={modalScheduledFor}
                  onChange={e => setModalScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            )}

            {/* 체인 단계 (일회성 전용) */}
            {modalType === 'oneTime' && (
              <div>
                {chainSteps.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium text-indigo-600">체인 후속 단계</p>
                    {chainSteps.map((step, i) => (
                      <div key={i} className="pl-4 border-l-2 border-indigo-300 dark:border-indigo-700 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400">단계 {i + 2}</span>
                          <button type="button" onClick={() => setChainSteps(prev => prev.filter((_, j) => j !== i))} className="text-[10px] text-red-500 hover:text-red-600">삭제</button>
                        </div>
                        <Select
                          value={step.agentId}
                          onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, agentId: e.target.value } : s))}
                          placeholder="에이전트..."
                          options={agentList.map(a => ({ value: a.id, label: `${a.name} ${a.isSecretary ? '(비서)' : ''}` }))}
                        />
                        <Textarea
                          value={step.instruction}
                          onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, instruction: e.target.value } : s))}
                          placeholder="이 단계의 지시..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {chainSteps.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setChainSteps(prev => [...prev, { agentId: modalAgent || '', instruction: '' }])}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    + 체인 단계 추가 (순차 실행)
                  </button>
                )}
              </div>
            )}

            {/* 반복 스케줄 필드 */}
            {modalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">실행 시간</label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={e => setModalTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          checked={modalFrequency === val}
                          onChange={() => setModalFrequency(val)}
                          className="accent-indigo-600"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {modalFrequency === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">요일 선택</label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                            modalDays.includes(i)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    {modalFrequency === 'custom' && modalDays.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">실행할 요일을 1개 이상 선택하세요</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* 트리거 필드 */}
            {modalType === 'trigger' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">트리거 유형</label>
                  <select
                    value={modalTriggerType}
                    onChange={e => setModalTriggerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  >
                    <option value="price-above">가격 상회 (현재가 ≥ 목표가)</option>
                    <option value="price-below">가격 하회 (현재가 ≤ 목표가)</option>
                    <option value="market-open">장 시작 (09:00)</option>
                    <option value="market-close">장 마감 (15:30)</option>
                  </select>
                </div>
                {(modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">종목 코드</label>
                      <input
                        type="text"
                        value={modalStockCode}
                        onChange={e => setModalStockCode(e.target.value)}
                        placeholder="005930"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">목표가 (원)</label>
                      <input
                        type="number"
                        value={modalTargetPrice}
                        onChange={e => setModalTargetPrice(e.target.value)}
                        placeholder="72000"
                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => closeModal()}
                className="flex-1 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!modalAgent || !modalInstruction.trim() || (modalType === 'schedule' && modalFrequency === 'custom' && modalDays.length === 0) || (modalType === 'trigger' && (modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (!modalStockCode.trim() || !modalTargetPrice)) || isPending}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? '처리 중...' : editingSchedule ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'chain' ? '체인 취소' : deleteTarget?.type === 'schedule' ? '스케줄 삭제' : deleteTarget?.type === 'trigger' ? '트리거 삭제' : '작업 취소'}
        description={deleteTarget?.type === 'chain' ? '이 체인의 대기 중인 작업을 모두 취소하시겠습니까?' : deleteTarget?.type === 'schedule' ? '이 반복 스케줄을 삭제하시겠습니까?' : deleteTarget?.type === 'trigger' ? '이 트리거를 삭제하시겠습니까?' : '이 작업을 취소하시겠습니까?'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-sm text-zinc-400">
      <p className="text-3xl mb-3">🌙</p>
      <p>{text}</p>
    </div>
  )
}

function JobCard({ job, progress, isExpanded, onToggle, onCancel }: {
  job: NightJob
  progress?: { progress: number; statusMessage: string }
  isExpanded: boolean
  onToggle: () => void
  onCancel: () => void
}) {
  const cfg = jobStatusConfig[job.status] || { label: job.status, variant: 'default' as const }
  const isProcessing = job.status === 'processing'

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isProcessing
        ? 'border-indigo-500 border-l-4'
        : !job.isRead && (job.status === 'completed' || job.status === 'failed')
          ? 'border-indigo-300 dark:border-indigo-700'
          : 'border-zinc-200 dark:border-zinc-800'
    }`}>
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            <span className="text-xs text-zinc-400">{job.agentName}</span>
            {!job.isRead && (job.status === 'completed' || job.status === 'failed') && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </div>
          <p className="text-sm font-medium truncate">{job.instruction}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {new Date(job.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {job.status === 'processing' && ' — 처리중...'}
            {job.completedAt && ` → ${new Date(job.completedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {job.status === 'queued' && (
            <button
              onClick={e => { e.stopPropagation(); onCancel() }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              취소
            </button>
          )}
          <span className="text-zinc-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {isProcessing && (
        <div className="px-4 pb-2">
          {progress ? (
            <div>
              <ProgressBar value={progress.progress} className="mb-1" />
              <p className="text-[10px] text-zinc-500">{progress.statusMessage}</p>
            </div>
          ) : (
            <div className="h-1 rounded-full bg-indigo-500/20 overflow-hidden">
              <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      )}
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
          {job.status === 'completed' && job.resultData && (
            <div className="flex gap-2 mb-3">
              {job.resultData.sessionId && (
                <Link to={`/chat?session=${job.resultData.sessionId}`} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  결과 보기
                </Link>
              )}
              {job.resultData.reportId && (
                <Link to={`/reports/${job.resultData.reportId}`} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                  보고서 보기
                </Link>
              )}
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
            <p className="text-[10px] text-zinc-400">재시도: {job.retryCount}/{job.maxRetries}</p>
          )}
        </div>
      )}
    </div>
  )
}
