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

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import {
  Plus, Moon, Repeat, Target, Trash2, MoreVertical, Search,
  Download, ChevronRight, FilterX,
} from 'lucide-react'
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
  queued: { label: '대기', dotClass: 'bg-corthex-text-secondary', textClass: 'text-corthex-text-secondary' },
  processing: { label: '진행 중', dotClass: 'bg-corthex-info shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse', textClass: 'text-corthex-info' },
  completed: { label: '완료', dotClass: 'bg-corthex-accent shadow-[0_0_8px_var(--color-corthex-accent-muted)]', textClass: 'text-corthex-accent' },
  failed: { label: '실패', dotClass: 'bg-corthex-error shadow-[0_0_8px_rgba(239,68,68,0.5)]', textClass: 'text-corthex-error' },
  blocked: { label: '대기(체인)', dotClass: 'bg-corthex-text-secondary', textClass: 'text-corthex-text-secondary' },
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const inputClass = 'w-full bg-corthex-surface border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary placeholder:text-corthex-text-secondary focus:outline-none focus:ring-2 focus:ring-corthex-accent/20 focus:border-corthex-accent'
const selectClass = 'w-full bg-corthex-surface border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:outline-none focus:ring-2 focus:ring-corthex-accent/20 focus:border-corthex-accent appearance-none'

function getDuration(job: NightJob): string {
  if (!job.startedAt) return '--:--'
  const end = job.completedAt ? new Date(job.completedAt) : new Date()
  const ms = end.getTime() - new Date(job.startedAt).getTime()
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
}

function shortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function getStatusBadge(status: string): { bg: string; color: string; border: string; dot: string } {
  switch (status) {
    case 'processing': return { bg: 'var(--color-corthex-info-muted, rgba(59,130,246,0.1))', color: 'var(--color-corthex-info)', border: 'var(--color-corthex-info-muted, rgba(59,130,246,0.25))', dot: 'var(--color-corthex-info)' }
    case 'completed':  return { bg: 'var(--color-corthex-success-muted, rgba(34,197,94,0.1))', color: 'var(--color-corthex-success)', border: 'var(--color-corthex-success-muted, rgba(34,197,94,0.25))', dot: 'var(--color-corthex-success)' }
    case 'failed':     return { bg: 'var(--color-corthex-error-muted, rgba(239,68,68,0.1))', color: 'var(--color-corthex-error)', border: 'var(--color-corthex-error-muted, rgba(239,68,68,0.25))', dot: 'var(--color-corthex-error)' }
    case 'blocked':    return { bg: 'var(--color-corthex-warning-muted, rgba(245,158,11,0.1))', color: 'var(--color-corthex-warning)', border: 'var(--color-corthex-warning-muted, rgba(245,158,11,0.25))', dot: 'var(--color-corthex-warning)' }
    default:           return { bg: 'var(--color-corthex-accent-muted)', color: 'var(--color-corthex-text-secondary)', border: 'var(--color-corthex-accent-muted)', dot: 'var(--color-corthex-text-disabled)' }
  }
}

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
  const [agentFilter, setAgentFilter] = useState('')

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
    if (agentFilter && j.agentId !== agentFilter) return false
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
      const body = { name: modalInstruction.trim().slice(0, 50) || 'Schedule', agentId: modalAgent, instruction: modalInstruction.trim(), frequency: modalFrequency, time: modalTime, days: modalFrequency === 'custom' ? modalDays : undefined }
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

  // ─── Render ──────────────────────────────────────────────────────────────────

  const thStyle: React.CSSProperties = {
    padding: '12px 20px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-corthex-text-secondary)',
    background: 'var(--color-corthex-elevated)',
    borderBottom: '1px solid var(--color-corthex-border)',
    whiteSpace: 'nowrap',
  }
  const tdStyle: React.CSSProperties = {
    padding: '14px 20px',
    fontSize: '13px',
    color: 'var(--color-corthex-text-primary)',
    borderBottom: '1px solid var(--color-corthex-border)',
    verticalAlign: 'middle',
  }

  const totalCount = activeTab === 'oneTime' ? jobs.length : activeTab === 'schedule' ? schedules.length : triggers.length

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: 'var(--color-corthex-bg)', color: 'var(--color-corthex-text-primary)' }}
      data-testid="jobs-page"
    >

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-1.5 text-xs mb-2" style={{ color: 'var(--color-corthex-text-secondary)' }}>
            <span className="hover:opacity-70 cursor-pointer" style={{ color: 'var(--color-corthex-accent)' }}>System</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--color-corthex-text-primary)' }}>Jobs Manager</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--color-corthex-text-primary)' }}>
            Jobs Manager{' '}
            <span className="font-mono text-lg ml-2" style={{ color: 'var(--color-corthex-accent)' }}>
              [{String(totalCount).padStart(2, '0')}]
            </span>
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: 'var(--color-corthex-elevated)',
              border: '1px solid var(--color-corthex-border)',
              color: 'var(--color-corthex-text-primary)',
            }}
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
          <button
            onClick={() => { setModalType(activeTab === 'trigger' ? 'trigger' : activeTab === 'schedule' ? 'schedule' : 'oneTime'); setShowModal(true) }}
            className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded text-sm font-black transition-all active:scale-95"
            style={{
              background: 'var(--color-corthex-accent)',
              color: 'white',
              boxShadow: '0 0 15px color-mix(in srgb, var(--color-corthex-accent) 30%, transparent)',
            }}
            data-testid="create-job-btn"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: '완료된 작업', value: allJobs.filter(j => j.status === 'completed').length },
          { label: '실행 중', value: allJobs.filter(j => j.status === 'processing').length },
          { label: '활성 스케줄', value: allSchedules.filter(s => s.isActive).length },
          { label: '오류 알림', value: allJobs.filter(j => j.status === 'failed').length, accent: true },
        ].map(card => (
          <div
            key={card.label}
            className="p-4 rounded-lg"
            style={{
              background: card.accent ? 'color-mix(in srgb, var(--color-corthex-accent) 8%, transparent)' : 'var(--color-corthex-elevated)',
              border: `1px solid ${card.accent ? 'color-mix(in srgb, var(--color-corthex-accent) 25%, transparent)' : 'var(--color-corthex-border)'}`,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>
              {card.label}
            </p>
            <p className="text-2xl font-mono font-bold" style={{ color: card.accent ? 'var(--color-corthex-accent)' : 'var(--color-corthex-text-primary)' }}>
              {String(card.value).padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8" style={{ borderBottom: '1px solid var(--color-corthex-border)' }}>
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" data-testid="jobs-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="min-h-[44px] flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab.key ? 'var(--color-corthex-accent)' : 'var(--color-corthex-text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--color-corthex-accent)' : '2px solid transparent',
                fontWeight: activeTab === tab.key ? 700 : 400,
              }}
              data-testid={`jobs-tab-${tab.key}`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className="font-mono text-[10px] opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3 sm:gap-4"
        style={{
          background: 'color-mix(in srgb, var(--color-corthex-elevated) 60%, transparent)',
          borderBottom: '1px solid var(--color-corthex-border)',
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-corthex-text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Job ID, 제목, 에이전트 검색..."
            className="w-full pl-10 pr-4 py-2 rounded text-base sm:text-sm outline-none transition-all min-h-[44px]"
            style={{
              background: 'color-mix(in srgb, var(--color-corthex-bg) 60%, transparent)',
              border: '1px solid var(--color-corthex-border)',
              color: 'var(--color-corthex-text-primary)',
            }}
          />
        </div>

        {/* Agent filter */}
        {agentList.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-corthex-text-secondary)' }}>Agent</label>
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="min-h-[44px] rounded px-3 py-2 text-base sm:text-xs outline-none"
              style={{
                background: 'var(--color-corthex-elevated)',
                border: '1px solid var(--color-corthex-border)',
                color: 'var(--color-corthex-text-primary)',
              }}
            >
              <option value="">All Agents</option>
              {agentList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-corthex-text-secondary)' }}>Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded px-3 py-2 text-base sm:text-xs outline-none"
            style={{
              background: 'var(--color-corthex-elevated)',
              border: '1px solid var(--color-corthex-border)',
              color: 'var(--color-corthex-text-primary)',
            }}
          >
            <option value="">All Status</option>
            <option value="queued">대기</option>
            <option value="processing">진행 중</option>
            <option value="completed">완료</option>
            <option value="failed">실패</option>
          </select>
        </div>

        {/* Clear filters */}
        {(searchQuery || statusFilter || agentFilter) && (
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter(''); setAgentFilter('') }}
            className="p-2 rounded transition-opacity hover:opacity-70"
            style={{
              background: 'var(--color-corthex-elevated)',
              border: '1px solid var(--color-corthex-border)',
              color: 'var(--color-corthex-text-secondary)',
            }}
          >
            <FilterX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Table Content ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">

        {/* Loading */}
        {isTabLoading && (
          <div className="flex justify-center py-16" data-testid="jobs-loading">
            <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-corthex-accent)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* ── One-time Jobs Table ──────────────────────────────────────── */}
        {!isTabLoading && activeTab === 'oneTime' && (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-16" data-testid="jobs-empty">
                <Moon className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: 'var(--color-corthex-text-secondary)' }}>등록된 일회성 작업이 없습니다</p>
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--color-corthex-border)', background: 'var(--color-corthex-surface)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th style={thStyle} className="hidden sm:table-cell">ID</th>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Assigned Agent</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle} className="hidden md:table-cell">Created</th>
                        <th style={thStyle} className="hidden lg:table-cell">Duration</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => {
                        const badge = getStatusBadge(job.status)
                        const statusLabel = STATUS_STYLES[job.status]?.label || job.status
                        const progress = jobProgress[job.id]
                        const isExpanded = expandedJob === job.id
                        const createdLabel = job.completedAt
                          ? new Date(job.completedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : job.scheduledFor
                          ? `예약: ${new Date(job.scheduledFor).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                          : new Date(job.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        return (
                          <Fragment key={job.id}>
                            <tr
                              className="cursor-pointer transition-colors"
                              style={{ background: isExpanded ? 'color-mix(in srgb, var(--color-corthex-accent) 4%, transparent)' : 'transparent' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--color-corthex-elevated) 60%, transparent)')}
                              onMouseLeave={e => (e.currentTarget.style.background = isExpanded ? 'color-mix(in srgb, var(--color-corthex-accent) 4%, transparent)' : 'transparent')}
                              onClick={() => {
                                setExpandedJob(isExpanded ? null : job.id)
                                if (!job.isRead && (job.status === 'completed' || job.status === 'failed')) markRead.mutate(job.id)
                              }}
                              data-testid={`job-card-${job.id}`}
                            >
                              {/* ID */}
                              <td style={tdStyle} className="hidden sm:table-cell">
                                <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-corthex-accent)' }}>
                                  {shortId(job.id)}
                                </span>
                              </td>

                              {/* Title */}
                              <td style={tdStyle}>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold" style={{ color: 'var(--color-corthex-text-primary)' }}>
                                    {job.instruction.length > 45 ? job.instruction.slice(0, 45) + '…' : job.instruction}
                                  </span>
                                  {job.chainId && (
                                    <span className="text-[10px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                                      Chain Job
                                    </span>
                                  )}
                                  {job.retryCount > 0 && (
                                    <span className="text-[10px]" style={{ color: '#fbbf24' }}>
                                      재시도 {job.retryCount}/{job.maxRetries}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Agent */}
                              <td style={tdStyle}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                    style={{
                                      background: 'color-mix(in srgb, var(--color-corthex-accent) 15%, transparent)',
                                      border: '1px solid color-mix(in srgb, var(--color-corthex-accent) 25%, transparent)',
                                      color: 'var(--color-corthex-accent)',
                                    }}
                                  >
                                    {job.agentName.slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="text-xs" style={{ color: 'var(--color-corthex-text-primary)' }}>{job.agentName}</span>
                                </div>
                              </td>

                              {/* Status */}
                              <td style={tdStyle}>
                                <div className="flex flex-col gap-1.5">
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
                                    style={{
                                      background: badge.bg,
                                      color: badge.color,
                                      border: `1px solid ${badge.border}`,
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{
                                        background: badge.dot,
                                        animation: job.status === 'processing' ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : undefined,
                                      }}
                                    />
                                    {statusLabel}
                                  </span>
                                  {job.status === 'processing' && progress && (
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ background: 'var(--color-corthex-border)', width: '80px' }}
                                      >
                                        <div
                                          className="h-full rounded-full transition-all"
                                          style={{ width: `${progress.progress}%`, background: 'var(--color-corthex-accent)' }}
                                        />
                                      </div>
                                      <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--color-corthex-accent)' }}>
                                        {progress.progress}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Created */}
                              <td style={tdStyle} className="hidden md:table-cell">
                                <span className="font-mono text-[11px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                                  {createdLabel}
                                </span>
                              </td>

                              {/* Duration */}
                              <td style={tdStyle} className="hidden lg:table-cell">
                                <span className="text-xs" style={{ color: 'var(--color-corthex-text-primary)' }}>
                                  {getDuration(job)}
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                  {job.status === 'queued' && (
                                    <button
                                      onClick={() => setDeleteTarget({ id: job.id, type: 'job' })}
                                      className="p-1.5 rounded transition-opacity hover:opacity-100 opacity-40"
                                      style={{ color: '#f87171' }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  {job.chainId && job.status === 'queued' && (
                                    <button
                                      onClick={() => setDeleteTarget({ id: job.chainId!, type: 'chain' })}
                                      className="px-2 py-1 rounded text-[10px] font-medium transition-opacity hover:opacity-80"
                                      style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                                    >
                                      체인취소
                                    </button>
                                  )}
                                  <button
                                    className="p-1.5 rounded transition-opacity hover:opacity-80 opacity-40"
                                    style={{ color: 'var(--color-corthex-text-secondary)' }}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Detail Row */}
                            {isExpanded && (job.result || job.error || (job.status === 'completed' && job.resultData)) && (
                              <tr style={{ background: 'color-mix(in srgb, var(--color-corthex-accent) 3%, transparent)' }}>
                                <td colSpan={7} style={{ padding: '0 20px 16px 20px', borderBottom: '1px solid var(--color-corthex-border)' }}>
                                  <div className="pl-4" style={{ borderLeft: '2px solid var(--color-corthex-accent)' }}>
                                    {job.result && (
                                      <div
                                        className="text-xs rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap"
                                        style={{ background: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-text-secondary)' }}
                                      >
                                        {job.result}
                                      </div>
                                    )}
                                    {job.error && (
                                      <div
                                        className="text-xs rounded-lg p-3"
                                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                                      >
                                        {job.error}
                                      </div>
                                    )}
                                    {job.status === 'completed' && job.resultData && (
                                      <div className="mt-2 flex gap-3">
                                        {job.resultData.sessionId && (
                                          <Link to={`/chat?session=${job.resultData.sessionId}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--color-corthex-accent)' }}>
                                            결과 보기 →
                                          </Link>
                                        )}
                                        {job.resultData.reportId && (
                                          <Link to={`/reports/${job.resultData.reportId}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--color-corthex-accent)' }}>
                                            보고서 보기 →
                                          </Link>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{
                    background: 'var(--color-corthex-elevated)',
                    borderTop: '1px solid var(--color-corthex-border)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    Showing {jobs.length} of {allJobs.length} records
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Schedules Table ──────────────────────────────────────────── */}
        {!isTabLoading && activeTab === 'schedule' && (
          <>
            {schedules.length === 0 ? (
              <div className="text-center py-16" data-testid="schedules-empty">
                <Repeat className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: 'var(--color-corthex-text-secondary)' }}>등록된 반복 스케줄이 없습니다</p>
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--color-corthex-border)', background: 'var(--color-corthex-surface)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th style={thStyle}>Agent</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Schedule</th>
                        <th style={thStyle}>Next Run</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map(s => {
                        const activeBadge = getStatusBadge(s.isActive ? 'completed' : 'queued')
                        return (
                          <tr
                            key={s.id}
                            className="transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--color-corthex-elevated) 60%, transparent)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            data-testid={`schedule-item-${s.id}`}
                          >
                            <td style={tdStyle}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                  style={{
                                    background: 'color-mix(in srgb, var(--color-corthex-accent) 15%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--color-corthex-accent) 25%, transparent)',
                                    color: 'var(--color-corthex-accent)',
                                  }}
                                >
                                  {s.agentName.slice(0, 1).toUpperCase()}
                                </div>
                                <span className="text-xs">{s.agentName}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <span className="text-sm" style={{ color: 'var(--color-corthex-text-primary)' }}>
                                {s.instruction.length > 40 ? s.instruction.slice(0, 40) + '…' : s.instruction}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span className="font-mono text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                                {s.description || s.cronExpression}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span className="font-mono text-[11px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                                {s.nextRunAt
                                  ? new Date(s.nextRunAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : '--'}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: activeBadge.bg, color: activeBadge.color, border: `1px solid ${activeBadge.border}` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activeBadge.dot }} />
                                {s.isActive ? 'ACTIVE' : 'PAUSED'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditSchedule(s)}
                                  className="text-xs hover:opacity-80 transition-opacity"
                                  style={{ color: 'var(--color-corthex-text-secondary)' }}
                                >
                                  편집
                                </button>
                                <button
                                  onClick={() => toggleSchedule.mutate(s.id)}
                                  className="text-xs font-medium hover:opacity-80 transition-opacity"
                                  style={{ color: s.isActive ? '#fbbf24' : 'var(--color-corthex-accent)' }}
                                >
                                  {s.isActive ? '중지' : '시작'}
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ id: s.id, type: 'schedule' })}
                                  className="text-xs hover:opacity-80 transition-opacity"
                                  style={{ color: '#f87171' }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  className="px-5 py-3"
                  style={{ background: 'var(--color-corthex-elevated)', borderTop: '1px solid var(--color-corthex-border)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    {schedules.length} schedules
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Triggers Table ───────────────────────────────────────────── */}
        {!isTabLoading && activeTab === 'trigger' && (
          <>
            {triggers.length === 0 ? (
              <div className="text-center py-16" data-testid="triggers-empty">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: 'var(--color-corthex-text-secondary)' }}>등록된 이벤트 트리거가 없습니다</p>
              </div>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--color-corthex-border)', background: 'var(--color-corthex-surface)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th style={thStyle}>Agent</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Trigger Type</th>
                        <th style={thStyle}>Last Triggered</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {triggers.map(t => {
                        const activeBadge = getStatusBadge(t.isActive ? 'completed' : 'queued')
                        return (
                          <tr
                            key={t.id}
                            className="transition-colors"
                            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--color-corthex-elevated) 60%, transparent)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            data-testid={`trigger-item-${t.id}`}
                          >
                            <td style={tdStyle}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                  style={{
                                    background: 'color-mix(in srgb, var(--color-corthex-accent) 15%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--color-corthex-accent) 25%, transparent)',
                                    color: 'var(--color-corthex-accent)',
                                  }}
                                >
                                  {t.agentName.slice(0, 1).toUpperCase()}
                                </div>
                                <span className="text-xs">{t.agentName}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <span className="text-sm" style={{ color: 'var(--color-corthex-text-primary)' }}>
                                {t.instruction.length > 40 ? t.instruction.slice(0, 40) + '…' : t.instruction}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span
                                className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide"
                                style={{
                                  background: 'color-mix(in srgb, var(--color-corthex-accent) 8%, transparent)',
                                  color: 'var(--color-corthex-accent)',
                                  border: '1px solid color-mix(in srgb, var(--color-corthex-accent) 20%, transparent)',
                                }}
                              >
                                {TRIGGER_TYPE_LABELS[t.triggerType] || t.triggerType}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span className="font-mono text-[11px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                                {t.lastTriggeredAt
                                  ? new Date(t.lastTriggeredAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : '없음'}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
                                style={{ background: activeBadge.bg, color: activeBadge.color, border: `1px solid ${activeBadge.border}` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activeBadge.dot }} />
                                {t.isActive ? 'WATCHING' : 'PAUSED'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditTrigger(t)}
                                  className="text-xs hover:opacity-80 transition-opacity"
                                  style={{ color: 'var(--color-corthex-text-secondary)' }}
                                >
                                  편집
                                </button>
                                <button
                                  onClick={() => toggleTrigger.mutate(t.id)}
                                  className="text-xs font-medium hover:opacity-80 transition-opacity"
                                  style={{ color: t.isActive ? '#fbbf24' : 'var(--color-corthex-accent)' }}
                                >
                                  {t.isActive ? '중지' : '다시 감시'}
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ id: t.id, type: 'trigger' })}
                                  className="text-xs hover:opacity-80 transition-opacity"
                                  style={{ color: '#f87171' }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  className="px-5 py-3"
                  style={{ background: 'var(--color-corthex-elevated)', borderTop: '1px solid var(--color-corthex-border)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    {triggers.length} triggers
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create/Edit Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => closeModal()}>
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 space-y-4" onClick={e => e.stopPropagation()} data-testid="job-modal">
            <h3 className="text-lg font-bold text-corthex-text-primary">{editingSchedule ? '스케줄 수정' : editingTrigger ? '트리거 수정' : '작업 등록'}</h3>

            {!editingSchedule && !editingTrigger && (
              <div className="flex gap-3 flex-wrap">
                {([['oneTime', '일회성'], ['schedule', '반복 스케줄'], ['trigger', '이벤트 트리거']] as const).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jobType" checked={modalType === val} onChange={() => setModalType(val)} style={{ accentColor: 'var(--color-corthex-accent)' }} />
                    <span className="text-sm text-corthex-text-secondary">{label}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-corthex-text-secondary mb-1">담당 에이전트</label>
              <select value={modalAgent} onChange={e => setModalAgent(e.target.value)} className={selectClass} style={{ ['--tw-ring-color' as string]: 'var(--color-corthex-accent)' }} data-testid="agent-select">
                <option value="">에이전트 선택...</option>
                {agentList.map(a => (<option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서)' : ''} — {a.role}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-corthex-text-secondary mb-1">작업 지시</label>
              <textarea value={modalInstruction} onChange={e => setModalInstruction(e.target.value)} placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘" rows={3} className={inputClass} style={{ ['--tw-ring-color' as string]: 'var(--color-corthex-accent)' }} data-testid="instruction-input" />
            </div>

            {modalType === 'oneTime' && chainSteps.length === 0 && (
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1">실행 시간 (비워두면 즉시)</label>
                <input type="datetime-local" value={modalScheduledFor} onChange={e => setModalScheduledFor(e.target.value)} className={inputClass} style={{ ['--tw-ring-color' as string]: 'var(--color-corthex-accent)' }} />
              </div>
            )}

            {modalType === 'oneTime' && (
              <div>
                {chainSteps.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <p className="text-xs font-medium" style={{ color: 'var(--color-corthex-accent)' }}>체인 후속 단계</p>
                    {chainSteps.map((step, i) => (
                      <div key={i} className="pl-4 border-l-2 space-y-2" style={{ borderColor: 'var(--color-corthex-accent-muted)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-corthex-text-secondary">단계 {i + 2}</span>
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
                  <button type="button" onClick={() => setChainSteps(prev => [...prev, { agentId: modalAgent || '', instruction: '' }])} className="text-xs" style={{ color: 'var(--color-corthex-accent)' }}>
                    + 체인 단계 추가 (순차 실행)
                  </button>
                )}
              </div>
            )}

            {modalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-corthex-text-secondary mb-1">실행 시간</label>
                  <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-corthex-text-secondary mb-2">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="frequency" checked={modalFrequency === val} onChange={() => setModalFrequency(val)} style={{ accentColor: 'var(--color-corthex-accent)' }} />
                        <span className="text-sm text-corthex-text-secondary">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {modalFrequency === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-corthex-text-secondary mb-2">요일 선택</label>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((name, i) => (
                        <button key={i} type="button" onClick={() => toggleDay(i)} className="w-9 h-9 rounded-full text-xs font-medium transition-colors" style={modalDays.includes(i) ? { backgroundColor: 'var(--color-corthex-accent)', color: 'white' } : { backgroundColor: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-text-secondary)' }}>
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
                  <label className="block text-xs font-medium text-corthex-text-secondary mb-1">트리거 유형</label>
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
                      <label className="block text-xs font-medium text-corthex-text-secondary mb-1">종목 코드</label>
                      <input type="text" value={modalStockCode} onChange={e => setModalStockCode(e.target.value)} placeholder="005930" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-corthex-text-secondary mb-1">목표가 (원)</label>
                      <input type="number" value={modalTargetPrice} onChange={e => setModalTargetPrice(e.target.value)} placeholder="72000" className={inputClass} />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => closeModal()} className="flex-1 py-2.5 text-sm font-medium text-corthex-text-secondary border border-corthex-border rounded-lg hover:bg-corthex-elevated transition-colors">취소</button>
              <button
                onClick={handleSubmit}
                disabled={!modalAgent || !modalInstruction.trim() || isPending}
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                data-testid="submit-job-btn"
              >
                {isPending ? '처리 중...' : (editingSchedule || editingTrigger) ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl p-6 w-96" data-testid="delete-confirm-modal">
            <h3 className="text-sm font-semibold text-corthex-text-primary mb-2">
              {deleteTarget.type === 'chain' ? '체인 취소' : deleteTarget.type === 'schedule' ? '스케줄 삭제' : deleteTarget.type === 'trigger' ? '트리거 삭제' : '작업 취소'}
            </h3>
            <p className="text-xs text-corthex-text-secondary mb-4">
              {deleteTarget.type === 'chain' ? '이 체인의 대기 중인 작업을 모두 취소하시겠습니까?' : deleteTarget.type === 'schedule' ? '이 반복 스케줄을 삭제하시겠습니까?' : deleteTarget.type === 'trigger' ? '이 트리거를 삭제하시겠습니까?' : '이 작업을 취소하시겠습니까?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="border border-corthex-border rounded-lg px-4 py-2 text-sm text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">취소</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
