import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Select, Textarea, Badge, StatusDot, ConfirmDialog, ProgressBar } from '@corthex/ui'
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

// ── Cron Presets ──

const CRON_PRESETS = [
  { label: '매일 오전 9시', value: '0 9 * * *', icon: '☀️' },
  { label: '매일 오후 6시', value: '0 18 * * *', icon: '🌆' },
  { label: '매일 밤 10시', value: '0 22 * * *', icon: '🌙' },
  { label: '평일 오전 9시', value: '0 9 * * 1-5', icon: '💼' },
  { label: '매시 정각', value: '0 * * * *', icon: '⏰' },
  { label: '주 1회 (월 09:00)', value: '0 9 * * 1', icon: '📅' },
]

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const runStatusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'error' | 'success' | 'warning' }> = {
  running: { label: '실행중', variant: 'warning' },
  success: { label: '성공', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
}

// ── Client-side cron description (lightweight, matches server describeCronExpression) ──

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return expr

  const [minute, hour, , , dow] = parts

  // Handle step/range expressions -- fall back to raw display
  const isSimpleNum = (v: string) => /^\d+$/.test(v)

  if (hour === '*' && minute === '0') return '매시 정각'
  if (hour === '*' && isSimpleNum(minute)) return `매시 ${minute.padStart(2, '0')}분`
  if (hour === '*') return `매시 (${minute})` // e.g. */5

  if (!isSimpleNum(hour) || !isSimpleNum(minute)) return expr // complex expression

  const minuteStr = minute.padStart(2, '0')
  const hourStr = hour.padStart(2, '0')
  const timeStr = `${hourStr}:${minuteStr}`

  if (dow === '*') return `매일 ${timeStr}`
  if (dow === '1-5') return `평일 ${timeStr}`
  if (dow === '0-6') return `매일 ${timeStr}`

  // Specific days
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

  // ── Data Queries ──

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['night-schedules'],
    queryFn: () => api.get<{ data: Schedule[] }>('/workspace/jobs/schedules'),
    refetchInterval: 30_000, // 30s polling for nextRunAt
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

  const deleteSchedule = useMutation({
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
      // Also refresh runs if expanded
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
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">⏰ 크론기지</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            반복 작업을 자동화하는 기지 — 시스템이 나 대신 깨어 있습니다
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          + 크론 추가
        </button>
      </div>

      {/* Schedule List */}
      {schedulesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState onAdd={openCreate} />
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
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="스케줄 삭제"
        description="이 반복 스케줄을 삭제하시겠습니까? 실행 기록도 함께 삭제됩니다."
        onConfirm={() => deleteTarget && deleteSchedule.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ── Empty State ──

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">⏰</p>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        예약된 작전이 없습니다
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        반복 작업을 크론으로 자동화하세요
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
      >
        + 크론 추가
      </button>
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
    <div className={`border rounded-lg overflow-hidden transition-colors ${
      s.isActive
        ? 'border-zinc-200 dark:border-zinc-800'
        : 'border-zinc-100 dark:border-zinc-900 opacity-60'
    }`}>
      {/* Main row */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={onToggleExpand}
      >
        <StatusDot status={s.isActive ? 'online' : 'offline'} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {s.name || s.instruction.slice(0, 40)}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">{s.agentName}</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{s.instruction}</p>
          <div className="flex gap-3 mt-1 text-[10px] font-mono text-zinc-400">
            <span className="text-amber-600 dark:text-amber-400 font-medium">{cronDesc}</span>
            {s.nextRunAt && s.isActive && (
              <span>다음: {formatRelativeTime(s.nextRunAt)}</span>
            )}
            {s.lastRunAt && (
              <span>마지막: {formatShortDate(s.lastRunAt)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors px-2 py-1"
          >
            편집
          </button>
          <button
            onClick={onToggle}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              s.isActive
                ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                : 'text-green-600 hover:text-green-700 dark:text-green-400'
            }`}
          >
            {s.isActive ? '중지' : '시작'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1"
          >
            삭제
          </button>
          <span className="text-zinc-400 text-xs ml-1">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded: Execution History */}
      {isExpanded && (
        <RunHistory scheduleId={s.id} jobProgress={jobProgress} />
      )}
    </div>
  )
}

// ── Run History (expanded panel) ──

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
    <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          실행 기록 {pagination ? `(${pagination.total}건)` : ''}
        </p>

        {isLoading ? (
          <div className="py-4 text-center text-xs text-zinc-400">로딩 중...</div>
        ) : runs.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-400">아직 실행 기록이 없습니다</div>
        ) : (
          <div className="space-y-1.5">
            {runs.map(run => {
              const cfg = runStatusConfig[run.status] || { label: run.status, variant: 'default' as const }
              const progress = jobProgress[run.id]
              return (
                <div key={run.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Badge variant={cfg.variant} className="shrink-0 text-[10px]">{cfg.label}</Badge>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
                    {run.startedAt ? formatShortDate(run.startedAt) : '-'}
                  </span>
                  {run.durationMs !== null && run.status !== 'running' && (
                    <span className="text-[10px] text-zinc-400">{(run.durationMs / 1000).toFixed(1)}초</span>
                  )}
                  {run.tokensUsed !== null && (
                    <span className="text-[10px] text-zinc-400">{run.tokensUsed.toLocaleString()}tk</span>
                  )}
                  {run.costMicro !== null && run.costMicro > 0 && (
                    <span className="text-[10px] text-zinc-400">${(run.costMicro / 1_000_000).toFixed(4)}</span>
                  )}
                  {run.status === 'running' && progress && (
                    <div className="flex-1 max-w-32">
                      <ProgressBar value={progress.progress} />
                    </div>
                  )}
                  {run.status === 'running' && !progress && (
                    <span className="text-[10px] text-amber-500 animate-pulse">실행중...</span>
                  )}
                  {run.status === 'failed' && run.error && (
                    <span className="text-[10px] text-red-500 truncate flex-1" title={run.error}>
                      {run.error.slice(0, 60)}
                    </span>
                  )}
                  {run.status === 'success' && run.result && (
                    <span className="text-[10px] text-green-600 dark:text-green-400 truncate flex-1">
                      {run.result.slice(0, 60)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 px-2 py-1"
            >
              ← 이전
            </button>
            <span className="text-[10px] text-zinc-400">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 px-2 py-1"
            >
              다음 →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Schedule Modal (Create/Edit) ──

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

  // Legacy mode state
  const [time, setTime] = useState('09:00')
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily')
  const [days, setDays] = useState<number[]>([])

  // Initialize from editing schedule
  useEffect(() => {
    if (editing) {
      // Check if it matches a preset
      const preset = CRON_PRESETS.find(p => p.value === editing.cronExpression)
      if (preset) {
        setMode('preset')
        setSelectedPreset(preset.value)
        setCronExpression(preset.value)
      } else {
        setMode('custom')
        setCronExpression(editing.cronExpression)
      }

      // Also parse for legacy mode fields
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

    let finalCron = cronExpression
    if (mode === 'legacy') {
      // Build from frequency/time/days
      onSubmit({
        name: name.trim(),
        agentId: agent,
        instruction: instruction.trim(),
        frequency,
        time,
        days: frequency === 'custom' ? days : undefined,
      })
      return
    }

    if (!finalCron) return
    onSubmit({
      name: name.trim(),
      agentId: agent,
      instruction: instruction.trim(),
      cronExpression: finalCron,
    })
  }

  const cronDescription = cronExpression ? describeCron(cronExpression) : ''
  const isValid = name.trim() && agent && instruction.trim() && (
    mode === 'legacy'
      ? (frequency !== 'custom' || days.length > 0)
      : !!cronExpression
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {editing ? '스케줄 수정' : '크론 스케줄 추가'}
        </h3>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">스케줄 이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 매일 아침 시황 브리핑"
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Agent */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
          <Select
            value={agent}
            onChange={e => setAgent(e.target.value)}
            placeholder="에이전트 선택..."
            options={agents.map(a => ({
              value: a.id,
              label: `${a.name} ${a.isSecretary ? '(비서실장)' : ''} — ${a.role}`,
            }))}
          />
        </div>

        {/* Instruction */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
          <Textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            placeholder="예: 오늘 시황 브리핑을 작성해서 보고해줘"
            rows={3}
          />
        </div>

        {/* Mode Tabs */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">실행 주기</label>
          <div className="flex gap-1 mb-3">
            {([['preset', '프리셋'], ['custom', '직접 입력'], ['legacy', '간편 설정']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMode(val)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  mode === val
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Preset Mode */}
          {mode === 'preset' && (
            <div className="grid grid-cols-2 gap-2">
              {CRON_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    selectedPreset === preset.value
                      ? 'bg-amber-100 border-2 border-amber-500 text-amber-800 dark:bg-amber-900 dark:border-amber-400 dark:text-amber-200'
                      : 'bg-zinc-50 border border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 hover:border-amber-300 dark:hover:border-amber-600'
                  }`}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Custom Mode */}
          {mode === 'custom' && (
            <div className="space-y-2">
              <input
                type="text"
                value={cronExpression}
                onChange={e => { setCronExpression(e.target.value); setSelectedPreset(null) }}
                placeholder="분 시 일 월 요일  (예: 0 9 * * 1-5)"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
              {cronExpression && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  → {describeCron(cronExpression)}
                </p>
              )}
              <p className="text-[10px] text-zinc-400">
                형식: 분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-6, 0=일)
              </p>
            </div>
          )}

          {/* Legacy Mode (simple frequency/time picker) */}
          {mode === 'legacy' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">실행 시간</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
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
                        checked={frequency === val}
                        onChange={() => setFrequency(val)}
                        className="accent-amber-600"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {frequency === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">요일 선택</label>
                  <div className="flex gap-2">
                    {DAY_NAMES.map((dayName, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                        className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                          days.includes(i)
                            ? 'bg-amber-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {dayName}
                      </button>
                    ))}
                  </div>
                  {frequency === 'custom' && days.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">실행할 요일을 1개 이상 선택하세요</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cron description summary */}
        {mode !== 'legacy' && cronDescription && (
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">실행 주기:</span> {cronDescription}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex-1 py-2.5 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
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
