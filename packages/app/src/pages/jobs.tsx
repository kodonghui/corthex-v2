// API Endpoints:
// GET    /workspace/agents
// GET    /workspace/jobs
// POST   /workspace/jobs
// DELETE /workspace/jobs/:id
// PUT    /workspace/jobs/:id/read
// GET    /workspace/jobs/schedules
// POST   /workspace/jobs/schedules
// PATCH  /workspace/jobs/schedules/:id
// PATCH  /workspace/jobs/schedules/:id/toggle
// DELETE /workspace/jobs/schedules/:id
// GET    /workspace/jobs/triggers
// POST   /workspace/jobs/triggers
// PATCH  /workspace/jobs/triggers/:id
// PATCH  /workspace/jobs/triggers/:id/toggle
// DELETE /workspace/jobs/triggers/:id
// POST   /workspace/jobs/chain
// DELETE /workspace/jobs/chain/:chainId

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import { Plus, Moon, Repeat, Target, Trash2, MoreVertical, Search, Calendar, Filter } from 'lucide-react'
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

const STATUS_STYLES: Record<string, { label: string; dotClass: string; textClass: string }> = {
  queued: { label: '대기', dotClass: 'bg-slate-400', textClass: 'text-stone-400' },
  processing: { label: '진행 중', dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse', textClass: 'text-blue-600' },
  completed: { label: '완료', dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', textClass: 'text-emerald-600' },
  failed: { label: '실패', dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', textClass: 'text-red-600' },
  blocked: { label: '대기(체인)', dotClass: 'bg-slate-400', textClass: 'text-stone-400' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const inputClass = 'w-full bg-white border border-[#e5e1d3] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#908a78] focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38]'
const selectClass = 'w-full bg-white border border-[#e5e1d3] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] appearance-none'

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

  // Modal state
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-jobs'] }); closeModal(); toast.success('작업이 등록되었습니다') },
  })

  const createSchedule = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; frequency: string; time: string; days?: number[] }) =>
      api.post('/workspace/jobs/schedules', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-schedules'] }); closeModal(); toast.success('스케줄이 생성되었습니다') },
  })

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; frequency?: string; time?: string; days?: number[] }) =>
      api.patch(`/workspace/jobs/schedules/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-schedules'] }); closeModal(); toast.success('스케줄이 수정되었습니다') },
  })

  const toggleSchedule = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/schedules/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-schedules'] }),
  })

  const cancelJob = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-jobs'] }); toast.success('작업이 취소되었습니다') },
  })

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/schedules/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-schedules'] }); toast.success('스케줄이 삭제되었습니다') },
  })

  const createTrigger = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown> }) =>
      api.post('/workspace/jobs/triggers', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-triggers'] }); closeModal(); toast.success('트리거가 생성되었습니다') },
  })

  const updateTrigger = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; triggerType?: string; condition?: Record<string, unknown> }) =>
      api.patch(`/workspace/jobs/triggers/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-triggers'] }); closeModal(); toast.success('트리거가 수정되었습니다') },
  })

  const toggleTrigger = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/jobs/triggers/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['night-triggers'] }),
  })

  const deleteTrigger = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/triggers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-triggers'] }); toast.success('트리거가 삭제되었습니다') },
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/workspace/jobs/${id}/read`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-jobs'] }); queryClient.invalidateQueries({ queryKey: ['job-notifications'] }) },
  })

  const createChain = useMutation({
    mutationFn: (body: { steps: { agentId: string; instruction: string }[] }) =>
      api.post('/workspace/jobs/chain', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-jobs'] }); closeModal(); toast.success('체인 작업이 등록되었습니다') },
  })

  const cancelChain = useMutation({
    mutationFn: (chainId: string) => api.delete(`/workspace/jobs/chain/${chainId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['night-jobs'] }); toast.success('체인이 취소되었습니다') },
  })

  // WebSocket real-time updates
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; jobId?: string; progress?: number; statusMessage?: string }
    const jobId = event.jobId
    if (event.type === 'job-progress' && jobId) {
      setJobProgress(prev => {
        if (!prev[jobId]) queryClient.invalidateQueries({ queryKey: ['night-jobs'] })
        return { ...prev, [jobId]: { progress: event.progress || 0, statusMessage: event.statusMessage || '' } }
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
    setModalAgent(''); setModalInstruction(''); setModalTime('22:00'); setModalFrequency('daily'); setModalDays([])
    setModalScheduledFor(''); setModalTriggerType('price-above'); setModalStockCode(''); setModalTargetPrice('')
    setEditingSchedule(null); setEditingTrigger(null); setChainSteps([])
  }

  function openEditSchedule(s: Schedule) {
    setEditingSchedule(s); setModalType('schedule'); setModalAgent(s.agentId); setModalInstruction(s.instruction)
    const parts = s.cronExpression.split(' ')
    setModalTime(`${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`)
    const dow = parts[4]
    if (dow === '*') setModalFrequency('daily')
    else if (dow === '1-5') setModalFrequency('weekdays')
    else { setModalFrequency('custom'); setModalDays(dow.split(',').map(Number)) }
    setShowModal(true)
  }

  function openEditTrigger(t: Trigger) {
    setEditingTrigger(t); setModalType('trigger'); setModalAgent(t.agentId); setModalInstruction(t.instruction)
    setModalTriggerType(t.triggerType)
    if (t.triggerType === 'price-above' || t.triggerType === 'price-below') {
      setModalStockCode(String(t.condition.stockCode || '')); setModalTargetPrice(String(t.condition.targetPrice || ''))
    }
    setShowModal(true)
  }

  function handleSubmit() {
    if (!modalAgent || !modalInstruction.trim()) return
    if (chainSteps.length > 0) {
      const allSteps = [{ agentId: modalAgent, instruction: modalInstruction.trim() }, ...chainSteps.filter(s => s.agentId && s.instruction.trim())]
      if (allSteps.length < 2) return
      createChain.mutate({ steps: allSteps }); return
    }
    if (modalType === 'oneTime') {
      queueJob.mutate({ agentId: modalAgent, instruction: modalInstruction.trim(), scheduledFor: modalScheduledFor ? new Date(modalScheduledFor).toISOString() : undefined })
    } else if (modalType === 'trigger') {
      const isPriceTrigger = modalTriggerType === 'price-above' || modalTriggerType === 'price-below'
      if (isPriceTrigger && (!modalStockCode.trim() || !modalTargetPrice)) return
      const condition: Record<string, unknown> = isPriceTrigger ? { stockCode: modalStockCode.trim(), targetPrice: Number(modalTargetPrice) } : {}
      if (editingTrigger) updateTrigger.mutate({ id: editingTrigger.id, instruction: modalInstruction.trim(), triggerType: modalTriggerType, condition })
      else createTrigger.mutate({ agentId: modalAgent, instruction: modalInstruction.trim(), triggerType: modalTriggerType, condition })
    } else {
      if (modalFrequency === 'custom' && modalDays.length === 0) return
      const body = { agentId: modalAgent, instruction: modalInstruction.trim(), frequency: modalFrequency, time: modalTime, days: modalFrequency === 'custom' ? modalDays : undefined }
      if (editingSchedule) updateSchedule.mutate({ id: editingSchedule.id, ...body })
      else createSchedule.mutate(body)
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

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'oneTime', label: '야간 작업', icon: <Moon className="w-4 h-4" />, count: jobs.length },
    { key: 'schedule', label: '반복 스케줄', icon: <Repeat className="w-4 h-4" />, count: schedules.length },
    { key: 'trigger', label: 'ARGOS 트리거', icon: <Target className="w-4 h-4" />, count: triggers.length },
  ]

  const isPending = queueJob.isPending || createSchedule.isPending || updateSchedule.isPending || createTrigger.isPending || updateTrigger.isPending || createChain.isPending
  const isTabLoading = activeTab === 'oneTime' ? jobsLoading : activeTab === 'schedule' ? schedulesLoading : triggersLoading

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#faf8f5] text-[#1a1a1a]" data-testid="jobs-page">

        {/* Header Section */}
        <header className="px-8 pt-8 pb-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-[#1a1a1a]">
                작업 관리 <span className="text-[#606C38] opacity-90">Jobs</span>
              </h1>
              <p className="text-[#6b705c] text-lg">에이전트 작업을 모니터링하고 관리합니다</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#908a78] group-focus-within:text-[#606C38] transition-colors" />
                <input
                  className="pl-12 pr-4 py-3 bg-white border border-[#e5e1d3] rounded-xl focus:ring-2 focus:ring-[#606C38]/20 focus:border-[#606C38] outline-none min-w-[300px] text-sm transition-all shadow-sm"
                  placeholder="작업 이름 또는 에이전트 검색..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => { setModalType(activeTab === 'trigger' ? 'trigger' : activeTab === 'schedule' ? 'schedule' : 'oneTime'); setShowModal(true) }}
                className="flex items-center gap-2 px-5 py-3 bg-[#606C38] text-white rounded-xl hover:bg-[#4e5a2b] transition-colors text-sm font-semibold"
                data-testid="create-job-btn"
              >
                <Plus className="w-5 h-5" />
                <span>작업 생성</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="px-8">
          <div className="relative flex border-b border-[#e5e1d3]/30 mb-8 overflow-x-auto" data-testid="jobs-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'font-bold text-[#606C38] border-b-2 border-[#606C38]'
                    : 'text-[#6b705c] hover:text-[#606C38]'
                }`}
                data-testid={`jobs-tab-${tab.key}`}
              >
                {tab.icon} {tab.label}
                {tab.count > 0 && (
                  <span className="font-mono text-[10px] ml-1 opacity-70">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards List */}
        <div className="px-8 pb-8 space-y-4">
          {isTabLoading && (
            <div className="flex justify-center py-12" data-testid="jobs-loading">
              <div className="h-6 w-6 border-2 border-[#606C38] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* One-time jobs tab */}
          {!isTabLoading && activeTab === 'oneTime' && jobs.length === 0 && (
            <div className="text-center py-16" data-testid="jobs-empty">
              <p className="text-sm text-[#6b705c]">등록된 일회성 작업이 없습니다</p>
            </div>
          )}

          {!isTabLoading && activeTab === 'oneTime' && jobs.map(job => {
            const status = STATUS_STYLES[job.status] || { label: job.status, dotClass: 'bg-[#908a78]', textClass: 'text-[#6b705c]' }
            const progress = jobProgress[job.id]
            return (
              <div
                key={job.id}
                className="bg-[#f5f0e8] border border-[#e5e1d3] rounded-xl p-5 flex flex-wrap lg:flex-nowrap items-center justify-between transition-all hover:bg-[#ece8e0] cursor-pointer"
                onClick={() => {
                  setExpandedJob(expandedJob === job.id ? null : job.id)
                  if (!job.isRead && (job.status === 'completed' || job.status === 'failed')) markRead.mutate(job.id)
                }}
                data-testid={`job-card-${job.id}`}
              >
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="w-10 h-10 rounded-full bg-[#606C38]/10 flex items-center justify-center border border-[#606C38]/20">
                    {activeTab === 'oneTime' ? <Moon className="w-5 h-5 text-[#606C38]" /> : <Repeat className="w-5 h-5 text-[#606C38]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a]">{job.agentName}</h3>
                    <p className="text-xs text-[#6b705c] mt-0.5 line-clamp-1 max-w-[300px]">{job.instruction}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 px-8">
                  <span className={`rounded-full px-4 py-1 text-[10px] font-black tracking-wider uppercase ${
                    job.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    job.status === 'failed' ? 'bg-red-100 text-red-700' :
                    job.status === 'blocked' ? 'bg-amber-100 text-amber-700' :
                    'bg-[#f0ebe0] text-[#6b705c]'
                  }`}>{status.label}</span>
                  {job.status === 'processing' && progress && (
                    <div className="flex items-center gap-3">
                      <div className="bg-[#e5e1d3] h-2 rounded-full w-48 overflow-hidden">
                        <div className="bg-[#606C38] h-full rounded-full transition-all" style={{ width: `${progress.progress}%` }} />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#606C38]">{progress.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-12 text-right">
                  <div className="font-mono">
                    <p className="text-[11px] font-medium text-[#6b705c]">
                      {job.completedAt ? new Date(job.completedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) :
                       job.scheduledFor ? `예약: ${new Date(job.scheduledFor).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` :
                       new Date(job.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[9px] text-[#908a78] uppercase tracking-tighter">TIMESTAMP</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {job.status === 'queued' && (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: job.id, type: 'job' }) }} className="p-1.5 text-[#6b705c] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    )}
                    <button className="p-1.5 text-[#6b705c] transition-colors" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Expanded job detail inline */}
          {activeTab === 'oneTime' && expandedJob && jobs.find(j => j.id === expandedJob) && (() => {
            const job = jobs.find(j => j.id === expandedJob)!
            return (job.result || job.error || (job.status === 'completed' && job.resultData)) ? (
              <div className="bg-white border border-[#e5e1d3] rounded-xl p-5 -mt-2 ml-14">
                {job.result && <div className="text-xs text-[#6b705c] bg-[#f5f0e8] rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">{job.result}</div>}
                {job.error && <div className="text-xs text-[#dc2626] bg-red-50 rounded-lg p-3">{job.error}</div>}
                {job.status === 'completed' && job.resultData && (
                  <div className="mt-2 flex gap-2">
                    {job.resultData.sessionId && <Link to={`/chat?session=${job.resultData.sessionId}`} className="text-xs font-medium text-[#606C38] hover:underline">결과 보기</Link>}
                    {job.resultData.reportId && <Link to={`/reports/${job.resultData.reportId}`} className="text-xs font-medium text-[#606C38] hover:underline">보고서 보기</Link>}
                  </div>
                )}
              </div>
            ) : null
          })()}

          {/* Schedules tab */}
          {!isTabLoading && activeTab === 'schedule' && schedules.length === 0 && (
            <div className="text-center py-16" data-testid="schedules-empty"><p className="text-sm text-[#6b705c]">등록된 반복 스케줄이 없습니다</p></div>
          )}
          {!isTabLoading && activeTab === 'schedule' && schedules.map(s => (
            <div key={s.id} className="bg-[#f5f0e8] border border-[#e5e1d3] rounded-xl p-5 flex flex-wrap lg:flex-nowrap items-center justify-between transition-all hover:bg-[#ece8e0]" data-testid={`schedule-item-${s.id}`}>
              <div className="flex items-center gap-4 min-w-[280px]">
                <div className="w-10 h-10 rounded-full bg-[#606C38]/10 flex items-center justify-center border border-[#606C38]/20"><Repeat className="w-5 h-5 text-[#606C38]" /></div>
                <div>
                  <h3 className="font-bold text-[#1a1a1a]">{s.agentName}</h3>
                  <p className="text-xs text-[#6b705c] mt-0.5 line-clamp-1 max-w-[300px]">{s.instruction}</p>
                </div>
              </div>
              <div className="px-8">
                <span className={`rounded-full px-4 py-1 text-[10px] font-black tracking-wider uppercase ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-[#f0ebe0] text-[#6b705c]'}`}>
                  {s.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="font-mono text-right">
                <p className="text-[11px] font-medium text-[#6b705c]">{s.description}</p>
                {s.nextRunAt && <p className="text-[9px] text-[#908a78]">다음: {new Date(s.nextRunAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => openEditSchedule(s)} className="text-xs text-[#6b705c] hover:text-[#606C38] transition-colors">편집</button>
                <button onClick={() => toggleSchedule.mutate(s.id)} className={`text-xs ${s.isActive ? 'text-[#b45309]' : 'text-[#4d7c0f]'}`}>{s.isActive ? '중지' : '시작'}</button>
                <button onClick={() => setDeleteTarget({ id: s.id, type: 'schedule' })} className="text-xs text-[#dc2626] hover:text-red-700">삭제</button>
              </div>
            </div>
          ))}

          {/* Triggers tab */}
          {!isTabLoading && activeTab === 'trigger' && triggers.length === 0 && (
            <div className="text-center py-16" data-testid="triggers-empty"><p className="text-sm text-[#6b705c]">등록된 이벤트 트리거가 없습니다</p></div>
          )}
          {!isTabLoading && activeTab === 'trigger' && triggers.map(t => (
            <div key={t.id} className="bg-[#f5f0e8] border border-[#e5e1d3] rounded-xl p-5 flex flex-wrap lg:flex-nowrap items-center justify-between transition-all hover:bg-[#ece8e0]" data-testid={`trigger-item-${t.id}`}>
              <div className="flex items-center gap-4 min-w-[280px]">
                <div className="w-10 h-10 rounded-full bg-[#606C38]/10 flex items-center justify-center border border-[#606C38]/20"><Target className="w-5 h-5 text-[#606C38]" /></div>
                <div>
                  <h3 className="font-bold text-[#1a1a1a]">{t.agentName}</h3>
                  <p className="text-xs text-[#6b705c] mt-0.5 line-clamp-1 max-w-[300px]">{t.instruction}</p>
                </div>
              </div>
              <div className="px-8">
                <span className={`rounded-full px-4 py-1 text-[10px] font-black tracking-wider uppercase ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-[#f0ebe0] text-[#6b705c]'}`}>
                  {t.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="font-mono text-right">
                <p className="text-[11px] font-medium text-[#6b705c]">{TRIGGER_TYPE_LABELS[t.triggerType] || t.triggerType}</p>
                {t.lastTriggeredAt && <p className="text-[9px] text-[#908a78]">마지막: {new Date(t.lastTriggeredAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => openEditTrigger(t)} className="text-xs text-[#6b705c] hover:text-[#606C38] transition-colors">편집</button>
                <button onClick={() => toggleTrigger.mutate(t.id)} className={`text-xs ${t.isActive ? 'text-[#b45309]' : 'text-[#4d7c0f]'}`}>{t.isActive ? '중지' : '다시 감시'}</button>
                <button onClick={() => setDeleteTarget({ id: t.id, type: 'trigger' })} className="text-xs text-[#dc2626] hover:text-red-700">삭제</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="fixed bottom-8 left-[280px] right-8 max-w-[1440px] mx-auto z-40 pointer-events-none">
          <div className="bg-[#f0ebe0]/90 backdrop-blur-xl border border-[#e5e1d3]/30 rounded-2xl shadow-2xl p-2 flex flex-wrap md:flex-nowrap gap-2 items-stretch pointer-events-auto">
            <div className="bg-white p-4 rounded-xl flex-1 min-w-[150px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#908a78] uppercase tracking-widest">완료된 작업</span>
              <p className="font-mono text-2xl font-black text-[#606C38] mt-1">{jobs.filter(j => j.status === 'completed').length}건</p>
            </div>
            <div className="bg-white p-4 rounded-xl flex-1 min-w-[150px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#908a78] uppercase tracking-widest">실행 중</span>
              <p className="font-mono text-2xl font-black text-[#606C38] mt-1">{jobs.filter(j => j.status === 'processing').length}건</p>
            </div>
            <div className="bg-white p-4 rounded-xl flex-1 min-w-[150px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#908a78] uppercase tracking-widest">활성 스케줄</span>
              <p className="font-mono text-2xl font-black text-[#606C38] mt-1">{schedules.filter(s => s.isActive).length}건</p>
            </div>
            <div className="bg-[#606C38] p-4 rounded-xl flex-1 min-w-[150px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">오류 알림</span>
              <p className="font-mono text-2xl font-black text-white mt-1">{jobs.filter(j => j.status === 'failed').length}건</p>
            </div>
          </div>
        </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => closeModal()}>
          <div className="bg-white border border-[#e5e1d3] rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()} data-testid="job-modal">
            <h3 className="text-lg font-bold text-[#1a1a1a]">{editingSchedule ? '스케줄 수정' : editingTrigger ? '트리거 수정' : '작업 등록'}</h3>

            {!editingSchedule && !editingTrigger && (
              <div className="flex gap-3 flex-wrap">
                {([['oneTime', '일회성'], ['schedule', '반복 스케줄'], ['trigger', '이벤트 트리거']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jobType" checked={modalType === val} onChange={() => setModalType(val)} style={{ accentColor: '#606C38' }} />
                    <span className="text-sm text-[#6b705c]">{label}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#6b705c] mb-1">담당 에이전트</label>
              <select value={modalAgent} onChange={e => setModalAgent(e.target.value)} className={selectClass} style={{ ['--tw-ring-color' as string]: '#606C38' }} data-testid="agent-select">
                <option value="">에이전트 선택...</option>
                {agentList.map(a => (<option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서)' : ''} — {a.role}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b705c] mb-1">작업 지시</label>
              <textarea value={modalInstruction} onChange={e => setModalInstruction(e.target.value)} placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘" rows={3} className={inputClass} style={{ ['--tw-ring-color' as string]: '#606C38' }} data-testid="instruction-input" />
            </div>

            {modalType === 'oneTime' && chainSteps.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-[#6b705c] mb-1">실행 시간 (비워두면 즉시)</label>
                <input type="datetime-local" value={modalScheduledFor} onChange={e => setModalScheduledFor(e.target.value)} className={inputClass} style={{ ['--tw-ring-color' as string]: '#606C38' }} />
              </div>
            )}

            {modalType === 'oneTime' && (
              <div>
                {chainSteps.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium" style={{ color: '#606C38' }}>체인 후속 단계</p>
                    {chainSteps.map((step, i) => (
                      <div key={i} className="pl-4 border-l-2 space-y-2" style={{ borderColor: '#606C3880' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400">단계 {i + 2}</span>
                          <button type="button" onClick={() => setChainSteps(prev => prev.filter((_, j) => j !== i))} className="text-[10px] text-red-400">삭제</button>
                        </div>
                        <select value={step.agentId} onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, agentId: e.target.value } : s))} className={selectClass}>
                          <option value="">에이전트...</option>
                          {agentList.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
                        </select>
                        <textarea value={step.instruction} onChange={e => setChainSteps(prev => prev.map((s, j) => j === i ? { ...s, instruction: e.target.value } : s))} placeholder="이 단계의 지시..." rows={2} className={inputClass} />
                      </div>
                    ))}
                  </div>
                )}
                {chainSteps.length < 4 && (
                  <button type="button" onClick={() => setChainSteps(prev => [...prev, { agentId: modalAgent || '', instruction: '' }])} className="text-xs" style={{ color: '#606C38' }}>
                    + 체인 단계 추가 (순차 실행)
                  </button>
                )}
              </div>
            )}

            {modalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#6b705c] mb-1">실행 시간</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="frequency" checked={modalFrequency === val} onChange={() => setModalFrequency(val)} style={{ accentColor: '#606C38' }} />
                        <span className="text-sm text-[#6b705c]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {modalFrequency === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-2">요일 선택</label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button key={i} type="button" onClick={() => toggleDay(i)} className="w-9 h-9 rounded-full text-xs font-medium transition-colors" style={modalDays.includes(i) ? { backgroundColor: '#606C38', color: 'white' } : { backgroundColor: '#f5f0e8', color: '#6b705c' }}>
                          {name}
                        </button>
                      ))}
                    </div>
                    {modalDays.length === 0 && <p className="text-xs text-red-400 mt-1">실행할 요일을 1개 이상 선택하세요</p>}
                  </div>
                )}
              </>
            )}

            {modalType === 'trigger' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#6b705c] mb-1">트리거 유형</label>
                  <select value={modalTriggerType} onChange={e => setModalTriggerType(e.target.value)} className={selectClass}>
                    <option value="price-above">가격 상회</option>
                    <option value="price-below">가격 하회</option>
                    <option value="market-open">장 시작 (09:00)</option>
                    <option value="market-close">장 마감 (15:30)</option>
                  </select>
                </div>
                {(modalTriggerType === 'price-above' || modalTriggerType === 'price-below') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6b705c] mb-1">종목 코드</label>
                      <input type="text" value={modalStockCode} onChange={e => setModalStockCode(e.target.value)} placeholder="005930" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6b705c] mb-1">목표가 (원)</label>
                      <input type="number" value={modalTargetPrice} onChange={e => setModalTargetPrice(e.target.value)} placeholder="72000" className={inputClass} />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => closeModal()} className="flex-1 py-2.5 text-sm font-medium text-[#6b705c] border border-[#e5e1d3] rounded-lg hover:bg-[#f5f0e8] transition-colors">취소</button>
              <button
                onClick={handleSubmit}
                disabled={!modalAgent || !modalInstruction.trim() || isPending}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#606C38' }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-[#e5e1d3] rounded-2xl shadow-2xl p-6 w-96" data-testid="delete-confirm-modal">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">
              {deleteTarget.type === 'chain' ? '체인 취소' : deleteTarget.type === 'schedule' ? '스케줄 삭제' : deleteTarget.type === 'trigger' ? '트리거 삭제' : '작업 취소'}
            </h3>
            <p className="text-xs text-[#6b705c] mb-4">
              {deleteTarget.type === 'chain' ? '이 체인의 대기 중인 작업을 모두 취소하시겠습니까?' : deleteTarget.type === 'schedule' ? '이 반복 스케줄을 삭제하시겠습니까?' : deleteTarget.type === 'trigger' ? '이 트리거를 삭제하시겠습니까?' : '이 작업을 취소하시겠습니까?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="border border-[#e5e1d3] rounded-lg px-4 py-2 text-sm text-[#6b705c] hover:bg-[#f5f0e8] transition-colors">취소</button>
              <button onClick={handleDelete} className="bg-[#dc2626] hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
