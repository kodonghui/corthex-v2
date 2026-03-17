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
import { Plus, Moon, Repeat, Target, Trash2, MoreVertical } from 'lucide-react'
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
  queued: { label: '대기', dotClass: 'bg-slate-400', textClass: 'text-slate-500' },
  processing: { label: '진행 중', dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse', textClass: 'text-blue-600' },
  completed: { label: '완료', dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', textClass: 'text-emerald-600' },
  failed: { label: '실패', dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', textClass: 'text-red-600' },
  blocked: { label: '대기(체인)', dotClass: 'bg-slate-400', textClass: 'text-slate-500' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const inputClass = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent'
const selectClass = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 appearance-none'

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

  const oliveGreen = '#6b705c'
  const emeraldAccent = '#3a5a40'
  const sage = '#a3b18a'

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" data-testid="jobs-page" style={{ fontFamily: "'Public Sans', sans-serif", backgroundColor: '#f8f6f6' }}>

        {/* Tabs Navigation */}
        <div className="px-8 mt-2">
          <div className="flex border-b gap-8" style={{ borderColor: `${oliveGreen}1a` }} data-testid="jobs-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 pb-4 px-1 group transition-all ${
                  activeTab === tab.key ? 'font-bold' : 'border-transparent'
                }`}
                style={activeTab === tab.key ? { borderColor: oliveGreen, color: oliveGreen } : { borderColor: 'transparent' }}
                data-testid={`jobs-tab-${tab.key}`}
              >
                <span className="text-sm font-semibold flex items-center gap-2" style={{ color: activeTab === tab.key ? oliveGreen : undefined }}>
                  {tab.icon} {tab.label}
                  {tab.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 font-mono">{tab.count}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-8">
          {/* Table Section */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${oliveGreen}1a` }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: `${oliveGreen}0d` }}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">에이전트명</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">명령 내용</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">상태</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">실행 시간</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: `${oliveGreen}0d` }}>
                {isTabLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400" data-testid="jobs-loading">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: oliveGreen, borderTopColor: 'transparent' }} />
                      </div>
                    </td>
                  </tr>
                )}

                {/* One-time jobs tab */}
                {!isTabLoading && activeTab === 'oneTime' && jobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center" data-testid="jobs-empty">
                      <p className="text-sm text-slate-400">등록된 일회성 작업이 없습니다</p>
                    </td>
                  </tr>
                )}

                {!isTabLoading && activeTab === 'oneTime' && jobs.map(job => {
                  const status = STATUS_STYLES[job.status] || { label: job.status, dotClass: 'bg-slate-400', textClass: 'text-slate-500' }
                  return (
                    <tr
                      key={job.id}
                      className="transition-colors cursor-pointer"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${oliveGreen}0d`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => {
                        setExpandedJob(expandedJob === job.id ? null : job.id)
                        if (!job.isRead && (job.status === 'completed' || job.status === 'failed')) markRead.mutate(job.id)
                      }}
                      data-testid={`job-card-${job.id}`}
                    >
                      <td className="px-6 py-5 font-semibold text-sm">{job.agentName}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {job.instruction}
                        {expandedJob === job.id && job.result && (
                          <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">{job.result}</div>
                        )}
                        {expandedJob === job.id && job.error && (
                          <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg p-3">{job.error}</div>
                        )}
                        {expandedJob === job.id && job.status === 'completed' && job.resultData && (
                          <div className="mt-2 flex gap-2">
                            {job.resultData.sessionId && <Link to={`/chat?session=${job.resultData.sessionId}`} className="text-xs font-medium" style={{ color: oliveGreen }}>결과 보기</Link>}
                            {job.resultData.reportId && <Link to={`/reports/${job.resultData.reportId}`} className="text-xs font-medium" style={{ color: oliveGreen }}>보고서 보기</Link>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${status.dotClass}`}></span>
                          <span className={`text-xs font-bold ${status.textClass}`}>{status.label}</span>
                        </div>
                        {job.status === 'processing' && jobProgress[job.id] && (
                          <div className="mt-1">
                            <div className="bg-slate-200 rounded-full h-1">
                              <div className="rounded-full h-1 transition-all" style={{ width: `${jobProgress[job.id].progress}%`, backgroundColor: oliveGreen }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {job.completedAt ? new Date(job.completedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) :
                         job.scheduledFor ? `Scheduled for ${new Date(job.scheduledFor).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` :
                         new Date(job.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {job.status === 'queued' && (
                          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: job.id, type: 'job' }) }} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        )}
                        <button className="text-slate-400 transition-colors ml-1" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  )
                })}

                {/* Schedules tab */}
                {!isTabLoading && activeTab === 'schedule' && schedules.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center" data-testid="schedules-empty"><p className="text-sm text-slate-400">등록된 반복 스케줄이 없습니다</p></td></tr>
                )}
                {!isTabLoading && activeTab === 'schedule' && schedules.map(s => (
                  <tr key={s.id} className="transition-colors" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${oliveGreen}0d`)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')} data-testid={`schedule-item-${s.id}`}>
                    <td className="px-6 py-5 font-semibold text-sm">{s.agentName}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{s.instruction}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{s.description}{s.nextRunAt && ` (다음: ${new Date(s.nextRunAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`}</td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                      <button onClick={() => openEditSchedule(s)} className="text-xs text-slate-400 hover:text-slate-600">편집</button>
                      <button onClick={() => toggleSchedule.mutate(s.id)} className={`text-xs ${s.isActive ? 'text-amber-500' : 'text-emerald-500'}`}>{s.isActive ? '중지' : '시작'}</button>
                      <button onClick={() => setDeleteTarget({ id: s.id, type: 'schedule' })} className="text-xs text-red-400 hover:text-red-500">삭제</button>
                    </td>
                  </tr>
                ))}

                {/* Triggers tab */}
                {!isTabLoading && activeTab === 'trigger' && triggers.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center" data-testid="triggers-empty"><p className="text-sm text-slate-400">등록된 이벤트 트리거가 없습니다</p></td></tr>
                )}
                {!isTabLoading && activeTab === 'trigger' && triggers.map(t => (
                  <tr key={t.id} className="transition-colors" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${oliveGreen}0d`)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')} data-testid={`trigger-item-${t.id}`}>
                    <td className="px-6 py-5 font-semibold text-sm">{t.agentName}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{t.instruction}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {t.isActive ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {TRIGGER_TYPE_LABELS[t.triggerType] || t.triggerType}
                      {t.lastTriggeredAt && ` (마지막: ${new Date(t.lastTriggeredAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`}
                    </td>
                    <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                      <button onClick={() => openEditTrigger(t)} className="text-xs text-slate-400 hover:text-slate-600">편집</button>
                      <button onClick={() => toggleTrigger.mutate(t.id)} className={`text-xs ${t.isActive ? 'text-amber-500' : 'text-emerald-500'}`}>{t.isActive ? '중지' : '다시 감시'}</button>
                      <button onClick={() => setDeleteTarget({ id: t.id, type: 'trigger' })} className="text-xs text-red-400 hover:text-red-500">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Floating Action Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => { setModalType(activeTab === 'trigger' ? 'trigger' : activeTab === 'schedule' ? 'schedule' : 'oneTime'); setShowModal(true) }}
              className="flex items-center gap-3 px-6 py-4 text-white rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all group"
              style={{ backgroundColor: oliveGreen, boxShadow: `0 10px 15px -3px ${oliveGreen}33` }}
              data-testid="create-job-btn"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">새로운 작업 생성</span>
            </button>
          </div>

          {/* Stats Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-2xl" style={{ backgroundColor: `${emeraldAccent}0d`, borderColor: `${emeraldAccent}33` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: emeraldAccent }}>오늘 완료된 작업</p>
              <p className="text-3xl font-bold" style={{ color: emeraldAccent }}>{jobs.filter(j => j.status === 'completed').length}</p>
            </div>
            <div className="p-6 border rounded-2xl" style={{ backgroundColor: `${oliveGreen}0d`, borderColor: `${oliveGreen}33` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: oliveGreen }}>실행 중인 에이전트</p>
              <p className="text-3xl font-bold" style={{ color: oliveGreen }}>{jobs.filter(j => j.status === 'processing').length}</p>
            </div>
            <div className="p-6 border rounded-2xl" style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">오류 알림</p>
              <p className="text-3xl font-bold text-red-500">{jobs.filter(j => j.status === 'failed').length}</p>
            </div>
          </div>
        </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => closeModal()}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()} data-testid="job-modal">
            <h3 className="text-lg font-bold text-slate-900">{editingSchedule ? '스케줄 수정' : editingTrigger ? '트리거 수정' : '작업 등록'}</h3>

            {!editingSchedule && !editingTrigger && (
              <div className="flex gap-3 flex-wrap">
                {([['oneTime', '일회성'], ['schedule', '반복 스케줄'], ['trigger', '이벤트 트리거']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jobType" checked={modalType === val} onChange={() => setModalType(val)} style={{ accentColor: oliveGreen }} />
                    <span className="text-sm text-slate-600">{label}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">담당 에이전트</label>
              <select value={modalAgent} onChange={e => setModalAgent(e.target.value)} className={selectClass} style={{ ['--tw-ring-color' as string]: oliveGreen }} data-testid="agent-select">
                <option value="">에이전트 선택...</option>
                {agentList.map(a => (<option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서)' : ''} — {a.role}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">작업 지시</label>
              <textarea value={modalInstruction} onChange={e => setModalInstruction(e.target.value)} placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘" rows={3} className={inputClass} style={{ ['--tw-ring-color' as string]: oliveGreen }} data-testid="instruction-input" />
            </div>

            {modalType === 'oneTime' && chainSteps.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">실행 시간 (비워두면 즉시)</label>
                <input type="datetime-local" value={modalScheduledFor} onChange={e => setModalScheduledFor(e.target.value)} className={inputClass} style={{ ['--tw-ring-color' as string]: oliveGreen }} />
              </div>
            )}

            {modalType === 'oneTime' && (
              <div>
                {chainSteps.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium" style={{ color: oliveGreen }}>체인 후속 단계</p>
                    {chainSteps.map((step, i) => (
                      <div key={i} className="pl-4 border-l-2 space-y-2" style={{ borderColor: `${oliveGreen}80` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">단계 {i + 2}</span>
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
                  <button type="button" onClick={() => setChainSteps(prev => [...prev, { agentId: modalAgent || '', instruction: '' }])} className="text-xs" style={{ color: oliveGreen }}>
                    + 체인 단계 추가 (순차 실행)
                  </button>
                )}
              </div>
            )}

            {modalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">실행 시간</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="frequency" checked={modalFrequency === val} onChange={() => setModalFrequency(val)} style={{ accentColor: oliveGreen }} />
                        <span className="text-sm text-slate-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {modalFrequency === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">요일 선택</label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button key={i} type="button" onClick={() => toggleDay(i)} className="w-9 h-9 rounded-full text-xs font-medium transition-colors" style={modalDays.includes(i) ? { backgroundColor: oliveGreen, color: 'white' } : { backgroundColor: '#f1f5f9', color: '#64748b' }}>
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
                  <label className="block text-xs font-medium text-slate-500 mb-1">트리거 유형</label>
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
                      <label className="block text-xs font-medium text-slate-500 mb-1">종목 코드</label>
                      <input type="text" value={modalStockCode} onChange={e => setModalStockCode(e.target.value)} placeholder="005930" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">목표가 (원)</label>
                      <input type="number" value={modalTargetPrice} onChange={e => setModalTargetPrice(e.target.value)} placeholder="72000" className={inputClass} />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => closeModal()} className="flex-1 py-2.5 text-sm font-medium text-slate-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">취소</button>
              <button
                onClick={handleSubmit}
                disabled={!modalAgent || !modalInstruction.trim() || isPending}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                style={{ backgroundColor: oliveGreen }}
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-96" data-testid="delete-confirm-modal">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              {deleteTarget.type === 'chain' ? '체인 취소' : deleteTarget.type === 'schedule' ? '스케줄 삭제' : deleteTarget.type === 'trigger' ? '트리거 삭제' : '작업 취소'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {deleteTarget.type === 'chain' ? '이 체인의 대기 중인 작업을 모두 취소하시겠습니까?' : deleteTarget.type === 'schedule' ? '이 반복 스케줄을 삭제하시겠습니까?' : deleteTarget.type === 'trigger' ? '이 트리거를 삭제하시겠습니까?' : '이 작업을 취소하시겠습니까?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
