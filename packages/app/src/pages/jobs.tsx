import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'
import { Plus, Search, Clock, Bot, Newspaper, FileText, Database } from 'lucide-react'

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

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  queued: { label: '대기', className: 'bg-blue-900/30 text-blue-400 border-blue-800/50' },
  processing: { label: '처리중', className: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  completed: { label: '완료', className: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  failed: { label: '실패', className: 'bg-red-900/30 text-red-400 border-red-800/50' },
  blocked: { label: '대기(체인)', className: 'bg-slate-800 text-slate-400 border-slate-700' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const inputClass = 'w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400'
const selectClass = 'w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none'

export function JobsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('oneTime')
  const [showModal, setShowModal] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<Record<string, { progress: number; statusMessage: string }>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'job' | 'schedule' | 'trigger' | 'chain' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

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
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['night-jobs'],
    queryFn: () => api.get<{ data: NightJob[] }>('/workspace/jobs'),
    refetchInterval: 10_000,
  })

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['night-schedules'],
    queryFn: () => api.get<{ data: Schedule[] }>('/workspace/jobs/schedules'),
  })

  const { data: triggersData, isLoading: triggersLoading } = useQuery({
    queryKey: ['night-triggers'],
    queryFn: () => api.get<{ data: Trigger[] }>('/workspace/jobs/triggers'),
  })

  const queueJob = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; scheduledFor?: string }) =>
      api.post('/workspace/jobs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      closeModal()
      toast.success('작업이 등록되었습니다')
    },
  })

  const createSchedule = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; frequency: string; time: string; days?: number[] }) =>
      api.post('/workspace/jobs/schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      closeModal()
      toast.success('스케줄이 생성되었습니다')
    },
  })

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; frequency?: string; time?: string; days?: number[] }) =>
      api.patch(`/workspace/jobs/schedules/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      closeModal()
      toast.success('스케줄이 수정되었습니다')
    },
  })

  const toggleSchedule = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/schedules/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-schedules'] }),
  })

  const cancelJob = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      toast.success('작업이 취소되었습니다')
    },
  })

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      toast.success('스케줄이 삭제되었습니다')
    },
  })

  const createTrigger = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown> }) =>
      api.post('/workspace/jobs/triggers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-triggers'] })
      closeModal()
      toast.success('트리거가 생성되었습니다')
    },
  })

  const updateTrigger = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; triggerType?: string; condition?: Record<string, unknown> }) =>
      api.patch(`/workspace/jobs/triggers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-triggers'] })
      closeModal()
      toast.success('트리거가 수정되었습니다')
    },
  })

  const toggleTrigger = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/triggers/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-triggers'] }),
  })

  const deleteTrigger = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-triggers'] })
      toast.success('트리거가 삭제되었습니다')
    },
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
      toast.success('체인 작업이 등록되었습니다')
    },
  })

  const cancelChain = useMutation({
    mutationFn: (chainId: string) => api.delete(`/workspace/jobs/chain/${chainId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
      toast.success('체인이 취소되었습니다')
    },
  })

  // WebSocket 실시간 갱신
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; jobId?: string; progress?: number; statusMessage?: string }
    const jobId = event.jobId
    if (event.type === 'job-progress' && jobId) {
      setJobProgress(prev => {
        if (!prev[jobId]) queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
        return {
          ...prev,
          [jobId]: { progress: event.progress || 0, statusMessage: event.statusMessage || '' },
        }
      })
    } else if (event.type === 'job-completed' || event.type === 'job-failed') {
      if (jobId) setJobProgress(prev => { const next = { ...prev }; delete next[jobId]; return next })
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
  const allJobs = jobsData?.data || []
  const allSchedules = schedulesData?.data || []
  const allTriggers = triggersData?.data || []

  // Apply search + filters
  const sq = searchQuery.toLowerCase()
  const jobs = allJobs.filter(j => {
    if (sq && !j.instruction.toLowerCase().includes(sq) && !j.agentName.toLowerCase().includes(sq)) return false
    if (statusFilter && j.status !== statusFilter) return false
    if (typeFilter && typeFilter !== 'oneTime') return false
    return true
  })
  const schedules = allSchedules.filter(s => {
    if (sq && !s.instruction.toLowerCase().includes(sq) && !s.agentName.toLowerCase().includes(sq)) return false
    if (statusFilter) {
      const isActive = s.isActive
      if (statusFilter === 'queued' && !isActive) return false
      if (statusFilter === 'completed' && isActive) return false
      if (statusFilter === 'processing' || statusFilter === 'failed') return false
    }
    if (typeFilter && typeFilter !== 'schedule') return false
    return true
  })
  const triggers = allTriggers.filter(t => {
    if (sq && !t.instruction.toLowerCase().includes(sq) && !t.agentName.toLowerCase().includes(sq)) return false
    if (statusFilter && statusFilter !== (t.isActive ? 'queued' : 'completed')) return false
    if (typeFilter && typeFilter !== 'trigger') return false
    return true
  })

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
    setEditingTrigger(null)
    setChainSteps([])
  }

  function openEditSchedule(s: Schedule) {
    setEditingSchedule(s)
    setModalType('schedule')
    setModalAgent(s.agentId)
    setModalInstruction(s.instruction)
    const parts = s.cronExpression.split(' ')
    setModalTime(`${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`)
    const dow = parts[4]
    if (dow === '*') setModalFrequency('daily')
    else if (dow === '1-5') setModalFrequency('weekdays')
    else {
      setModalFrequency('custom')
      setModalDays(dow.split(',').map(Number))
    }
    setShowModal(true)
  }

  function openEditTrigger(t: Trigger) {
    setEditingTrigger(t)
    setModalType('trigger')
    setModalAgent(t.agentId)
    setModalInstruction(t.instruction)
    setModalTriggerType(t.triggerType)
    if (t.triggerType === 'price-above' || t.triggerType === 'price-below') {
      setModalStockCode(String(t.condition.stockCode || ''))
      setModalTargetPrice(String(t.condition.targetPrice || ''))
    }
    setShowModal(true)
  }

  function handleSubmit() {
    if (!modalAgent || !modalInstruction.trim()) return

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
      if (editingTrigger) {
        updateTrigger.mutate({
          id: editingTrigger.id,
          instruction: modalInstruction.trim(),
          triggerType: modalTriggerType,
          condition,
        })
      } else {
        createTrigger.mutate({
          agentId: modalAgent,
          instruction: modalInstruction.trim(),
          triggerType: modalTriggerType,
          condition,
        })
      }
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

  const isPending = queueJob.isPending || createSchedule.isPending || updateSchedule.isPending || createTrigger.isPending || updateTrigger.isPending || createChain.isPending

  const isTabLoading = activeTab === 'oneTime' ? jobsLoading : activeTab === 'schedule' ? schedulesLoading : triggersLoading

  return (
    <div className="h-full flex flex-col" data-testid="jobs-page">
      {/* Header */}
      <div className="w-full max-w-[1024px] mx-auto px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <h1 className="text-slate-50 text-3xl font-semibold tracking-tight">작업</h1>
          <button
            onClick={() => { setModalType(activeTab === 'trigger' ? 'trigger' : activeTab === 'schedule' ? 'schedule' : 'oneTime'); setShowModal(true) }}
            className="flex items-center justify-center rounded-lg h-10 px-5 bg-cyan-400 text-slate-900 hover:bg-cyan-400/90 transition-colors text-sm font-semibold tracking-wide"
            data-testid="create-job-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>작업 생성</span>
          </button>
        </div>
      </div>

      {/* Filters and Search -- Stitch style */}
      <div className="w-full max-w-[1024px] mx-auto px-8">
        <div className="flex flex-wrap items-center gap-4 py-4 mb-6 bg-slate-900/50 rounded-xl border border-slate-800 px-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center w-full h-10 rounded-lg bg-slate-900 border border-slate-700 focus-within:border-cyan-400 transition-colors overflow-hidden">
              <div className="flex items-center justify-center pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                className="w-full bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-400 focus:ring-0 px-3 h-full focus:outline-none"
                placeholder="작업 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="jobs-search"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              className="h-10 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 w-40 px-3"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="jobs-status-filter"
            >
              <option value="">상태: 전체</option>
              <option value="queued">대기</option>
              <option value="processing">처리중</option>
              <option value="completed">완료</option>
              <option value="failed">실패</option>
            </select>
            <select
              className="h-10 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 w-40 px-3"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              data-testid="jobs-type-filter"
            >
              <option value="">유형: 전체</option>
              <option value="oneTime">일회성</option>
              <option value="schedule">반복 스케줄</option>
              <option value="trigger">트리거</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-[1024px] mx-auto px-8">
        <div className="flex gap-8 border-b border-slate-800" data-testid="jobs-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
              data-testid={`jobs-tab-${tab.key}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1024px] mx-auto px-8 py-6">
          <div className="flex flex-col gap-3">
            {/* Loading */}
            {isTabLoading && (
              <div className="space-y-3" data-testid="jobs-loading">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-xl" />
                ))}
              </div>
            )}

            {/* One-time jobs tab */}
            {!isTabLoading && activeTab === 'oneTime' && (
              jobs.length === 0 ? (
                <div className="text-center py-16" data-testid="jobs-empty">
                  <p className="text-4xl mb-3">&#x1F319;</p>
                  <p className="text-sm text-slate-400">등록된 일회성 작업이 없습니다</p>
                </div>
              ) : (
                (() => {
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
                  for (const [, list] of chains) {
                    list.sort((a, b) => {
                      if (!a.parentJobId) return -1
                      if (!b.parentJobId) return 1
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    })
                  }

                  const renderJob = (job: NightJob, indent = false) => (
                    <div key={job.id} className={indent ? 'ml-6 border-l-2 border-slate-700 pl-3' : ''}>
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
                      {[...chains.entries()].map(([chainId, chainJobs]) => {
                        const completed = chainJobs.filter(j => j.status === 'completed').length
                        const hasActive = chainJobs.some(j => j.status === 'queued' || j.status === 'blocked')
                        return (
                          <div key={chainId} className="border border-cyan-400/30 rounded-xl p-3 space-y-2 mb-3" data-testid={`chain-group-${chainId}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-cyan-400">
                                체인 ({completed}/{chainJobs.length} 완료)
                              </span>
                              {hasActive && (
                                <button
                                  onClick={() => setDeleteTarget({ id: chainId, type: 'chain' })}
                                  className="text-xs text-red-400 hover:text-red-300"
                                >
                                  체인 취소
                                </button>
                              )}
                            </div>
                            {chainJobs.map((job, i) => renderJob(job, i > 0))}
                          </div>
                        )
                      })}
                      {singles.map(job => renderJob(job))}
                    </>
                  )
                })()
              )
            )}

            {/* Schedules tab */}
            {!isTabLoading && activeTab === 'schedule' && (
              schedules.length === 0 ? (
                <div className="text-center py-16" data-testid="schedules-empty">
                  <p className="text-4xl mb-3">&#x1F319;</p>
                  <p className="text-sm text-slate-400">등록된 반복 스케줄이 없습니다</p>
                </div>
              ) : (
                schedules.map(s => (
                  <div key={s.id} className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors" data-testid={`schedule-item-${s.id}`}>
                    <div className="flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 shrink-0 size-12">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <p className="text-slate-50 text-base font-medium truncate mb-1">{s.instruction}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {s.agentName}
                        </span>
                        <span className="text-slate-600">&#x2022;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.description}
                        </span>
                      </div>
                      {s.nextRunAt && (
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          다음: {new Date(s.nextRunAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        s.isActive
                          ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {s.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                      <button onClick={() => openEditSchedule(s)} className="text-xs text-slate-400 hover:text-slate-200">편집</button>
                      <button onClick={() => toggleSchedule.mutate(s.id)} className={`text-xs ${s.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                        {s.isActive ? '중지' : '시작'}
                      </button>
                      <button onClick={() => setDeleteTarget({ id: s.id, type: 'schedule' })} className="text-xs text-red-400 hover:text-red-300">삭제</button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Triggers tab */}
            {!isTabLoading && activeTab === 'trigger' && (
              triggers.length === 0 ? (
                <div className="text-center py-16" data-testid="triggers-empty">
                  <p className="text-4xl mb-3">&#x1F319;</p>
                  <p className="text-sm text-slate-400">등록된 이벤트 트리거가 없습니다</p>
                </div>
              ) : (
                triggers.map(t => (
                  <div key={t.id} className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors" data-testid={`trigger-item-${t.id}`}>
                    <div className="flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 shrink-0 size-12">
                      <Newspaper className="w-6 h-6" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <p className="text-slate-50 text-base font-medium truncate mb-1">{t.instruction}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {t.agentName}
                        </span>
                        <span className="text-slate-600">&#x2022;</span>
                        <span>
                          {TRIGGER_TYPE_LABELS[t.triggerType] || t.triggerType}
                          {(t.triggerType === 'price-above' || t.triggerType === 'price-below') && t.condition && (
                            <> · {String(t.condition.stockCode)} {t.triggerType === 'price-above' ? '\u2265' : '\u2264'} {Number(t.condition.targetPrice).toLocaleString()}원</>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-[10px] font-mono text-slate-500">
                        {t.lastTriggeredAt && (
                          <span>마지막 발동: {new Date(t.lastTriggeredAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {t.isActive && <span className="text-emerald-400">감시 중</span>}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        t.isActive
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {t.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                      <button onClick={() => openEditTrigger(t)} className="text-xs text-slate-400 hover:text-slate-200">편집</button>
                      <button onClick={() => toggleTrigger.mutate(t.id)} className={`text-xs ${t.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                        {t.isActive ? '중지' : '다시 감시'}
                      </button>
                      <button onClick={() => setDeleteTarget({ id: t.id, type: 'trigger' })} className="text-xs text-red-400 hover:text-red-300">삭제</button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => closeModal()}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()} data-testid="job-modal">
            <h3 className="text-lg font-bold text-slate-50">{editingSchedule ? '스케줄 수정' : editingTrigger ? '트리거 수정' : '작업 등록'}</h3>

            {/* Type selection (new only) */}
            {!editingSchedule && !editingTrigger && (
              <div className="flex gap-3 flex-wrap">
                {([['oneTime', '일회성'], ['schedule', '반복 스케줄'], ['trigger', '이벤트 트리거']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={modalType === val}
                      onChange={() => setModalType(val)}
                      className="accent-cyan-400"
                    />
                    <span className="text-sm text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Agent */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">담당 에이전트</label>
              <select
                value={modalAgent}
                onChange={e => setModalAgent(e.target.value)}
                className={selectClass}
                data-testid="agent-select"
              >
                <option value="">에이전트 선택...</option>
                {agentList.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.isSecretary ? '(비서)' : ''} — {a.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Instruction */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">작업 지시</label>
              <textarea
                value={modalInstruction}
                onChange={e => setModalInstruction(e.target.value)}
                placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘"
                rows={3}
                className={inputClass}
                data-testid="instruction-input"
              />
            </div>

            {/* One-time — scheduled time */}
            {modalType === 'oneTime' && chainSteps.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">실행 시간 (비워두면 즉시)</label>
                <input
                  type="datetime-local"
                  value={modalScheduledFor}
                  onChange={e => setModalScheduledFor(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Chain steps (one-time only) */}
            {modalType === 'oneTime' && (
              <div>
                {chainSteps.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium text-cyan-400">체인 후속 단계</p>
                    {chainSteps.map((step, i) => (
                      <div key={i} className="pl-4 border-l-2 border-cyan-400/50 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">단계 {i + 2}</span>
                          <button type="button" onClick={() => setChainSteps(prev => prev.filter((_, j) => j !== i))} className="text-[10px] text-red-400 hover:text-red-300">삭제</button>
                        </div>
                        <select
                          value={step.agentId}
                          onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, agentId: e.target.value } : s))}
                          className={selectClass}
                        >
                          <option value="">에이전트...</option>
                          {agentList.map(a => (
                            <option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서)' : ''}</option>
                          ))}
                        </select>
                        <textarea
                          value={step.instruction}
                          onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, instruction: e.target.value } : s))}
                          placeholder="이 단계의 지시..."
                          rows={2}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {chainSteps.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setChainSteps(prev => [...prev, { agentId: modalAgent || '', instruction: '' }])}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    + 체인 단계 추가 (순차 실행)
                  </button>
                )}
              </div>
            )}

            {/* Schedule fields */}
            {modalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">실행 시간</label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={e => setModalTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          checked={modalFrequency === val}
                          onChange={() => setModalFrequency(val)}
                          className="accent-cyan-400"
                        />
                        <span className="text-sm text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {modalFrequency === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">요일 선택</label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                            modalDays.includes(i)
                              ? 'bg-cyan-400 text-slate-900'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    {modalDays.length === 0 && (
                      <p className="text-xs text-red-400 mt-1">실행할 요일을 1개 이상 선택하세요</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Trigger fields */}
            {modalType === 'trigger' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">트리거 유형</label>
                  <select
                    value={modalTriggerType}
                    onChange={e => setModalTriggerType(e.target.value)}
                    className={selectClass}
                  >
                    <option value="price-above">가격 상회 (현재가 &ge; 목표가)</option>
                    <option value="price-below">가격 하회 (현재가 &le; 목표가)</option>
                    <option value="market-open">장 시작 (09:00)</option>
                    <option value="market-close">장 마감 (15:30)</option>
                  </select>
                </div>
                {(modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">종목 코드</label>
                      <input
                        type="text"
                        value={modalStockCode}
                        onChange={e => setModalStockCode(e.target.value)}
                        placeholder="005930"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">목표가 (원)</label>
                      <input
                        type="number"
                        value={modalTargetPrice}
                        onChange={e => setModalTargetPrice(e.target.value)}
                        placeholder="72000"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => closeModal()}
                className="flex-1 py-2.5 text-sm font-medium text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!modalAgent || !modalInstruction.trim() || (modalType === 'schedule' && modalFrequency === 'custom' && modalDays.length === 0) || (modalType === 'trigger' && (modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (!modalStockCode.trim() || !modalTargetPrice)) || isPending}
                className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                data-testid="submit-job-btn"
              >
                {isPending ? '처리 중...' : (editingSchedule || editingTrigger) ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 w-96" data-testid="delete-confirm-modal">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              {deleteTarget.type === 'chain' ? '체인 취소' : deleteTarget.type === 'schedule' ? '스케줄 삭제' : deleteTarget.type === 'trigger' ? '트리거 삭제' : '작업 취소'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {deleteTarget.type === 'chain' ? '이 체인의 대기 중인 작업을 모두 취소하시겠습니까?' : deleteTarget.type === 'schedule' ? '이 반복 스케줄을 삭제하시겠습니까?' : deleteTarget.type === 'trigger' ? '이 트리거를 삭제하시겠습니까?' : '이 작업을 취소하시겠습니까?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">취소</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">확인</button>
            </div>
          </div>
        </div>
      )}
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
  const cfg = STATUS_STYLES[job.status] || { label: job.status, className: 'bg-slate-800 text-slate-400 border-slate-700' }
  const isProcessing = job.status === 'processing'

  return (
    <div
      className={`flex items-center gap-4 bg-slate-900 p-4 rounded-xl border transition-all ${
        isProcessing
          ? 'border-amber-500/50 border-l-4'
          : !job.isRead && (job.status === 'completed' || job.status === 'failed')
            ? 'border-cyan-400/50'
            : 'border-slate-800 hover:border-slate-700'
      }`}
      data-testid={`job-card-${job.id}`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 shrink-0 size-12">
        <FileText className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center min-w-0 cursor-pointer" onClick={onToggle}>
        <p className="text-slate-50 text-base font-medium truncate mb-1">{job.instruction}</p>
        <div className="flex items-center gap-3 text-sm text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Bot className="w-4 h-4" />
            {job.agentName}
          </span>
          <span className="text-slate-600">&#x2022;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Progress bar for processing jobs */}
        {isProcessing && (
          <div className="mt-2">
            {progress ? (
              <div>
                <div className="bg-slate-700 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-cyan-400 rounded-full h-1.5 transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{progress.statusMessage}</p>
              </div>
            ) : (
              <div className="bg-amber-500/20 h-1 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-amber-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            {job.result && (
              <div className="mb-3">
                <p className="text-[10px] font-medium text-emerald-400 mb-1">결과</p>
                <div className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {job.result}
                </div>
              </div>
            )}
            {job.status === 'completed' && job.resultData && (
              <div className="flex gap-2 mb-3">
                {job.resultData.sessionId && (
                  <Link to={`/chat?session=${job.resultData.sessionId}`} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                    결과 보기
                  </Link>
                )}
                {job.resultData.reportId && (
                  <Link to={`/reports/${job.resultData.reportId}`} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                    보고서 보기
                  </Link>
                )}
              </div>
            )}
            {job.error && (
              <div className="mb-3">
                <p className="text-[10px] font-medium text-red-400 mb-1">오류</p>
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3">
                  {job.error}
                </p>
              </div>
            )}
            {job.retryCount > 0 && (
              <p className="text-[10px] text-slate-500">재시도: {job.retryCount}/{job.maxRetries}</p>
            )}
          </div>
        )}
      </div>

      {/* Status badge + actions */}
      <div className="shrink-0 flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
          {cfg.label.toUpperCase()}
        </span>
        {!job.isRead && (job.status === 'completed' || job.status === 'failed') && (
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
        )}
        {job.status === 'queued' && (
          <button
            onClick={e => { e.stopPropagation(); onCancel() }}
            className="text-xs text-red-400 hover:text-red-300"
          >
            취소
          </button>
        )}
      </div>
    </div>
  )
}
