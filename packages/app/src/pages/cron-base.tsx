import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'

// ── Types ──

type Agent = {
  id: string
  name: string
  role: string
  status: string
  isSecretary: boolean
}

type Schedule = {
  id: string
  name: string
  agentId: string
  agentName: string
  instruction: string
  cronExpression: string
  description: string
  nextRunAt: string | null
  lastRunAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type CronRun = {
  id: string
  cronJobId: string
  status: 'running' | 'success' | 'failed'
  commandText: string
  startedAt: string | null
  completedAt: string | null
  result: string | null
  error: string | null
  durationMs: number | null
  tokensUsed: number | null
  costMicro: number | null
  createdAt: string
}

// ── Constants ──

const CRON_PRESETS = [
  { label: '매일 오전 9시', value: '0 9 * * *', icon: '☀️' },
  { label: '매일 오후 6시', value: '0 18 * * *', icon: '🌆' },
  { label: '매일 밤 10시', value: '0 22 * * *', icon: '🌙' },
  { label: '평일 오전 9시', value: '0 9 * * 1-5', icon: '💼' },
  { label: '매시 정각', value: '0 * * * *', icon: '⏰' },
  { label: '주 1회 (월 09:00)', value: '0 9 * * 1', icon: '📅' },
]

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const RUN_STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  running: { label: '실행중', classes: 'bg-blue-500/15 text-blue-400 animate-pulse' },
  success: { label: '성공', classes: 'bg-emerald-500/15 text-emerald-400' },
  failed: { label: '실패', classes: 'bg-red-500/15 text-red-400' },
}

// ── Cron Description ──

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return expr

  const [minute, hour, , , dow] = parts
  const isSimpleNum = (v: string) => /^\d+$/.test(v)

  if (hour === '*' && minute === '0') return '매시 정각'
  if (hour === '*' && isSimpleNum(minute)) return `매시 ${minute.padStart(2, '0')}분`
  if (hour === '*') return `매시 (${minute})`
  if (!isSimpleNum(hour) || !isSimpleNum(minute)) return expr

  const timeStr = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  if (dow === '*' || dow === '0-6') return `매일 ${timeStr}`
  if (dow === '1-5') return `평일 ${timeStr}`

  const dayLabels = dow.split(',').map(d => DAY_NAMES[parseInt(d)] || d).join(', ')
  return `${dayLabels} ${timeStr}`
}

// ── Main Page ──

export function CronBasePage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<Record<string, { progress: number; statusMessage: string }>>({})

  // ── Data ──

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['night-schedules'],
    queryFn: () => api.get<{ data: Schedule[] }>('/workspace/jobs/schedules'),
    refetchInterval: 30_000,
  })

  const agentList = agentsData?.data || []
  const schedules = schedulesData?.data || []

  // ── Mutations ──

  const createSchedule = useMutation({
    mutationFn: (body: { name: string; agentId: string; instruction: string; cronExpression?: string; frequency?: string; time?: string; days?: number[] }) =>
      api.post('/workspace/jobs/schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      closeModal()
    },
  })

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; instruction?: string; agentId?: string; cronExpression?: string; frequency?: string; time?: string; days?: number[] }) =>
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

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/jobs/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      setDeleteTarget(null)
    },
  })

  // ── WebSocket ──

  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; jobId?: string; progress?: number; statusMessage?: string; cronJobId?: string }
    if (event.type === 'job-progress' && event.jobId) {
      setJobProgress(prev => ({
        ...prev,
        [event.jobId!]: { progress: event.progress || 0, statusMessage: event.statusMessage || '' },
      }))
    } else if (event.type === 'job-completed' || event.type === 'job-failed') {
      if (event.jobId) setJobProgress(prev => { const next = { ...prev }; delete next[event.jobId!]; return next })
      queryClient.invalidateQueries({ queryKey: ['night-schedules'] })
      if (expandedSchedule) {
        queryClient.invalidateQueries({ queryKey: ['cron-runs', expandedSchedule] })
      }
    }
  }, [queryClient, expandedSchedule])

  useEffect(() => {
    if (!isConnected || !user) return
    subscribe('night-job', {})
    const channelKey = `night-job::${user.companyId}`
    addListener(channelKey, wsHandler)
    return () => removeListener(channelKey, wsHandler)
  }, [isConnected, user, subscribe, addListener, removeListener, wsHandler])

  // ── Helpers ──

  function closeModal() {
    setShowModal(false)
    setEditingSchedule(null)
  }

  function openCreate() {
    setEditingSchedule(null)
    setShowModal(true)
  }

  function openEdit(s: Schedule) {
    setEditingSchedule(s)
    setShowModal(true)
  }

  // ── Render ──

  return (
    <div data-testid="cron-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-corthex-text-primary">크론기지</h1>
        </div>
        <button
          data-testid="add-cron-btn"
          onClick={openCreate}
          className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          + 크론 추가
        </button>
      </div>

      {/* Schedule List */}
      {schedulesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-corthex-elevated border border-corthex-border rounded-xl animate-pulse h-28" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div data-testid="cron-empty-state" className="bg-corthex-elevated border border-dashed border-corthex-border rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-corthex-text-primary">설정된 크론 작업이 없습니다</p>
          <p className="text-xs text-corthex-text-secondary mt-1">정기적으로 에이전트가 수행할 작업을 추가해보세요</p>
          <button onClick={openCreate} className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent text-sm rounded-lg px-4 py-2 mt-4 transition-colors">크론 추가</button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              isExpanded={expandedSchedule === s.id}
              onToggleExpand={() => setExpandedSchedule(expandedSchedule === s.id ? null : s.id)}
              onEdit={() => openEdit(s)}
              onToggle={() => toggleSchedule.mutate(s.id)}
              onDelete={() => setDeleteTarget(s.id)}
              jobProgress={jobProgress}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <ScheduleModal
          editing={editingSchedule}
          agents={agentList}
          onClose={closeModal}
          onSubmit={(data) => {
            if (editingSchedule) {
              updateSchedule.mutate({ id: editingSchedule.id, ...data })
            } else {
              createSchedule.mutate(data as { name: string; agentId: string; instruction: string; cronExpression: string })
            }
          }}
          isPending={createSchedule.isPending || updateSchedule.isPending}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-corthex-surface border border-corthex-border rounded-xl p-5 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-corthex-text-primary">크론 삭제</h3>
            <p className="text-xs text-corthex-text-secondary mt-2">이 스케줄과 실행 기록이 모두 삭제됩니다. 계속하시겠습니까?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="text-xs text-corthex-text-secondary hover:text-corthex-text-primary px-3 py-1.5 rounded-lg">취소</button>
              <button onClick={() => deleteTarget && deleteScheduleMutation.mutate(deleteTarget)} className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Schedule Card ──

function ScheduleCard({
  schedule: s,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggle,
  onDelete,
  jobProgress,
}: {
  schedule: Schedule
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
  jobProgress: Record<string, { progress: number; statusMessage: string }>
}) {
  const cronDesc = s.description || describeCron(s.cronExpression)

  return (
    <div data-testid={`schedule-card-${s.id}`} className={`bg-corthex-elevated border border-corthex-border rounded-xl overflow-hidden transition-all hover:border-corthex-border-strong ${!s.isActive ? 'opacity-50' : ''}`}>
      <div className="px-4 py-4">
        {/* Row 1: Name + Agent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${s.isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-corthex-surface'}`} />
            <span className="text-sm font-semibold text-corthex-text-primary truncate max-w-[250px]">{s.name || s.instruction.slice(0, 40)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-corthex-text-secondary">Agent: {s.agentName}</span>
          </div>
        </div>

        {/* Row 2: Instruction */}
        <p className="text-xs text-corthex-text-secondary line-clamp-2 mt-2">{s.instruction}</p>

        {/* Row 3: Schedule info + Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-corthex-accent">{cronDesc}</span>
            <span className="text-[10px] text-corthex-text-secondary">
              다음: {s.nextRunAt && s.isActive ? formatRelativeTime(s.nextRunAt) : '—'}
            </span>
            <span className="text-[10px] text-corthex-text-secondary">
              마지막: {s.lastRunAt ? formatShortDate(s.lastRunAt) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit} className="text-xs text-corthex-text-secondary hover:text-corthex-text-primary px-2 py-1 rounded hover:bg-corthex-border/50 transition-colors">편집</button>
            <button onClick={onToggle} className={`text-xs px-2 py-1 rounded transition-colors ${s.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
              {s.isActive ? '중지' : '시작'}
            </button>
            <button onClick={onDelete} className="text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors">삭제</button>
            <button onClick={onToggleExpand} className="text-xs text-corthex-text-secondary hover:text-corthex-text-primary px-2 py-1">{isExpanded ? '▲' : '▼'}</button>
          </div>
        </div>
      </div>

      {/* Run History */}
      {isExpanded && <RunHistory scheduleId={s.id} jobProgress={jobProgress} />}
    </div>
  )
}

// ── Run History ──

function RunHistory({ scheduleId, jobProgress }: { scheduleId: string; jobProgress: Record<string, { progress: number; statusMessage: string }> }) {
  const [page, setPage] = useState(1)

  const { data: runsData, isLoading } = useQuery({
    queryKey: ['cron-runs', scheduleId, page],
    queryFn: () => api.get<{ data: CronRun[]; pagination: { page: number; totalPages: number; total: number } }>(
      `/workspace/jobs/schedules/${scheduleId}/runs?page=${page}&limit=10`
    ),
  })

  const runs = runsData?.data || []
  const pagination = runsData?.pagination

  return (
    <div className="border-t border-corthex-border bg-corthex-surface/30">
      {isLoading ? (
        <div className="py-6 text-center text-xs text-corthex-text-secondary">로딩 중...</div>
      ) : runs.length === 0 ? (
        <div className="py-6 text-center text-xs text-corthex-text-secondary">실행 기록이 없습니다</div>
      ) : (
        <>
          {runs.map(run => {
            const cfg = RUN_STATUS_CONFIG[run.status] || { label: run.status, classes: 'bg-corthex-surface/15 text-corthex-text-secondary' }
            const progress = jobProgress[run.id]
            return (
              <div key={run.id} className="px-4 py-2.5 border-b border-corthex-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                  <span className="text-[10px] text-corthex-text-secondary font-mono">{run.startedAt ? formatShortDate(run.startedAt) : '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  {run.durationMs !== null && run.status !== 'running' && (
                    <span className="text-[10px] text-corthex-text-secondary font-mono">{(run.durationMs / 1000).toFixed(1)}초</span>
                  )}
                  {run.tokensUsed !== null && (
                    <span className="text-[10px] text-corthex-text-secondary font-mono">{run.tokensUsed.toLocaleString()}토큰</span>
                  )}
                  {run.costMicro !== null && run.costMicro > 0 && (
                    <span className="text-[10px] text-corthex-text-secondary font-mono">${(run.costMicro / 1_000_000).toFixed(3)}</span>
                  )}
                </div>
                {run.status === 'running' && progress && (
                  <div className="w-full h-1 bg-corthex-elevated rounded-full mt-2">
                    <div className="h-full bg-corthex-accent rounded-full animate-pulse" style={{ width: `${Math.max(progress.progress, 33)}%` }} />
                  </div>
                )}
                {run.status === 'running' && !progress && (
                  <div className="w-full h-1 bg-corthex-elevated rounded-full mt-2">
                    <div className="h-full bg-corthex-accent rounded-full animate-pulse w-1/3" />
                  </div>
                )}
                {run.status === 'failed' && run.error && (
                  <span className="text-[10px] text-red-400 truncate max-w-full mt-1">{run.error.slice(0, 60)}</span>
                )}
                {run.status === 'success' && run.result && (
                  <span className="text-[10px] text-corthex-text-secondary truncate max-w-full mt-1">{run.result.slice(0, 60)}</span>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-[10px] text-corthex-text-secondary hover:text-corthex-text-primary disabled:opacity-30 px-2 py-1"
              >
                ← 이전
              </button>
              <span className="text-[10px] text-corthex-text-secondary font-mono">{pagination.page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="text-[10px] text-corthex-text-secondary hover:text-corthex-text-primary disabled:opacity-30 px-2 py-1"
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Schedule Modal ──

function ScheduleModal({
  editing,
  agents,
  onClose,
  onSubmit,
  isPending,
}: {
  editing: Schedule | null
  agents: Agent[]
  onClose: () => void
  onSubmit: (data: { name?: string; agentId?: string; instruction?: string; cronExpression?: string; frequency?: string; time?: string; days?: number[] }) => void
  isPending: boolean
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const [name, setName] = useState(editing?.name || '')
  const [agent, setAgent] = useState(editing?.agentId || '')
  const [instruction, setInstruction] = useState(editing?.instruction || '')
  const [mode, setMode] = useState<'preset' | 'custom' | 'legacy'>('preset')
  const [cronExpression, setCronExpression] = useState(editing?.cronExpression || '')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const [time, setTime] = useState('09:00')
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily')
  const [days, setDays] = useState<number[]>([])

  useEffect(() => {
    if (editing) {
      const preset = CRON_PRESETS.find(p => p.value === editing.cronExpression)
      if (preset) {
        setMode('preset')
        setSelectedPreset(preset.value)
        setCronExpression(preset.value)
      } else {
        setMode('custom')
        setCronExpression(editing.cronExpression)
      }
      const parts = editing.cronExpression.split(' ')
      if (parts.length === 5) {
        setTime(`${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`)
        const dow = parts[4]
        if (dow === '*') setFrequency('daily')
        else if (dow === '1-5') setFrequency('weekdays')
        else {
          setFrequency('custom')
          setDays(dow.split(',').map(Number))
        }
      }
    }
  }, [editing])

  function handlePresetSelect(value: string) {
    setSelectedPreset(value)
    setCronExpression(value)
  }

  function handleSubmit() {
    if (!agent || !instruction.trim() || !name.trim()) return
    if (mode === 'legacy') {
      onSubmit({ name: name.trim(), agentId: agent, instruction: instruction.trim(), frequency, time, days: frequency === 'custom' ? days : undefined })
      return
    }
    if (!cronExpression) return
    onSubmit({ name: name.trim(), agentId: agent, instruction: instruction.trim(), cronExpression })
  }

  const cronDescription = cronExpression ? describeCron(cronExpression) : ''
  const isValid = name.trim() && agent && instruction.trim() && (
    mode === 'legacy' ? (frequency !== 'custom' || days.length > 0) : !!cronExpression
  )

  const inputClasses = 'w-full bg-corthex-elevated border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent/30 text-sm text-corthex-text-primary rounded-lg px-3 py-2 outline-none transition-colors placeholder:text-corthex-text-disabled'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="cron-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-corthex-surface border border-corthex-border rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-corthex-border">
          <h3 className="text-lg font-semibold text-corthex-text-primary">{editing ? '크론 수정' : '크론 추가'}</h3>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-text-primary transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">스케줄 이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='예: 일일 시장 브리핑' className={inputClasses} />
          </div>

          {/* Agent */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">에이전트</label>
            <select value={agent} onChange={e => setAgent(e.target.value)} className={inputClasses}>
              <option value="">에이전트 선택...</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서실장)' : ''} — {a.role}</option>
              ))}
            </select>
          </div>

          {/* Instruction */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">작업 지시</label>
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder="에이전트에게 시킬 작업을 입력하세요"
              rows={3}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">실행 주기</label>

            {/* Tabs */}
            <div className="flex bg-corthex-surface/50 rounded-lg p-0.5 mb-3">
              {([['preset', '프리셋'], ['custom', '커스텀'], ['legacy', '시간 지정']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMode(val)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors flex-1 text-center ${
                    mode === val ? 'bg-corthex-elevated text-corthex-text-primary' : 'text-corthex-text-secondary hover:text-corthex-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Preset */}
            {mode === 'preset' && (
              <div className="grid grid-cols-3 gap-2">
                {CRON_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`text-xs px-3 py-2.5 rounded-lg border text-center transition-all ${
                      selectedPreset === preset.value
                        ? 'bg-corthex-accent/15 border-corthex-accent/40 text-corthex-accent'
                        : 'bg-corthex-elevated border-corthex-border text-corthex-text-secondary hover:border-corthex-border-strong'
                    }`}
                  >
                    <span className="text-lg block mb-1">{preset.icon}</span>
                    <span className="text-[11px] font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom */}
            {mode === 'custom' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={cronExpression}
                  onChange={e => { setCronExpression(e.target.value); setSelectedPreset(null) }}
                  placeholder="분 시 일 월 요일 (예: 0 9 * * 1-5)"
                  className={inputClasses}
                />
                {cronExpression && cronDescription !== cronExpression ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                    <p className="text-xs text-emerald-400">✓ {cronDescription}</p>
                  </div>
                ) : cronExpression ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <p className="text-xs text-red-400">✗ 유효하지 않은 표현식</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Legacy */}
            {mode === 'legacy' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">실행 시간</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">주기</label>
                  <div className="flex gap-3">
                    {([['daily', '매일'], ['weekdays', '평일'], ['custom', '특정 요일']] as const).map(([val, label]) => (
                      <label key={val} className="flex items-center gap-1.5 text-xs text-corthex-text-secondary cursor-pointer">
                        <input type="radio" name="frequency" checked={frequency === val} onChange={() => setFrequency(val)} className="accent-blue-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                {frequency === 'custom' && (
                  <div>
                    <div className="flex gap-2">
                      {DAY_NAMES.map((dayName, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                          className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                            days.includes(i) ? 'bg-corthex-accent/20 border-corthex-accent/40 text-corthex-accent' : 'border-corthex-border text-corthex-text-disabled'
                          }`}
                        >
                          {dayName}
                        </button>
                      ))}
                    </div>
                    {days.length === 0 && <p className="text-xs text-red-400 mt-1">실행할 요일을 1개 이상 선택하세요</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description Preview */}
          {mode !== 'legacy' && cronDescription && cronDescription !== cronExpression && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
              <p className="text-xs text-amber-400">📋 {cronDescription}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-corthex-border">
          <button onClick={onClose} className="text-sm text-corthex-text-secondary hover:text-corthex-text-primary px-4 py-2 rounded-lg hover:bg-corthex-elevated transition-colors">취소</button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="bg-corthex-accent hover:bg-corthex-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-corthex-text-on-accent text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {isPending ? '처리 중...' : editing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return '곧 실행'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 후`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 ${minutes % 60}분 후`
  const daysVal = Math.floor(hours / 24)
  return `${daysVal}일 후`
}
