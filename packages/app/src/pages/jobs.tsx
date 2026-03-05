import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Select, Textarea, Input, Tabs, ConfirmDialog, Badge, toast } from '@corthex/ui'

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
  resultData: { reportId?: string } | null
  isRead: boolean
  createdAt: string
}

type Schedule = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  cronExpression: string
  nextRunAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  queued: { label: '대기', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  processing: { label: '처리중', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  failed: { label: '실패', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

type Trigger = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  triggerType: 'price-above' | 'price-below' | 'market-open' | 'market-close'
  condition: { symbol?: string; targetPrice?: number }
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}

const triggerTypeLabels: Record<string, string> = {
  'price-above': '주가 이상',
  'price-below': '주가 이하',
  'market-open': '장 시작',
  'market-close': '장 마감',
}

const TABS = [
  { value: 'jobs', label: '작업' },
  { value: 'schedules', label: '스케줄' },
  { value: 'triggers', label: '트리거' },
]

export function JobsPage() {
  const [activeTab, setActiveTab] = useState('jobs')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">야간 작업</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          시켜놓고 퇴근 — AI가 밤새 처리합니다
        </p>
      </div>

      <Tabs items={TABS} value={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'jobs' && <JobsTab />}
      {activeTab === 'schedules' && <SchedulesTab />}
      {activeTab === 'triggers' && <TriggersTab />}
    </div>
  )
}

/* ─── 작업 탭 (기존) ─── */
function JobsTab() {
  const navigate = useNavigate()
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
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? '취소' : '+ 새 작업 등록'}
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              placeholder="에이전트 선택..."
              options={agentList.map((agent) => ({
                value: agent.id,
                label: `${agent.name} ${agent.isSecretary ? '(비서)' : ''} — ${agent.role}`,
              }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="예: 이번 달 마케팅 채널별 성과를 분석해서 보고서로 정리해줘"
              rows={3}
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
                    {job.resultData?.reportId && (
                      <button
                        onClick={() => navigate('/reports')}
                        className="mb-3 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700"
                      >
                        보고서 보기
                      </button>
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
  )
}

/* ─── 스케줄 탭 (신규) ─── */
function SchedulesTab() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [instruction, setInstruction] = useState('')
  const [cronExpression, setCronExpression] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState('')
  const [editCron, setEditCron] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: schedulesData } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => api.get<{ data: Schedule[] }>('/workspace/schedules'),
  })

  const createSchedule = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; cronExpression: string }) =>
      api.post('/workspace/schedules', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setShowForm(false)
      setSelectedAgent('')
      setInstruction('')
      setCronExpression('')
      toast.success('스케줄 등록 완료')
    },
    onError: (err: any) => {
      toast.error(err?.code === 'SCHEDULE_001' ? '유효하지 않은 cron 식입니다' : '스케줄 등록 실패')
    },
  })

  const updateSchedule = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; cronExpression?: string; isActive?: boolean }) =>
      api.patch(`/workspace/schedules/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setEditingId(null)
      toast.success('스케줄 수정 완료')
    },
    onError: (err: any) => {
      toast.error(err?.code === 'SCHEDULE_001' ? '유효하지 않은 cron 식입니다' : '스케줄 수정 실패')
    },
  })

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setDeleteTarget(null)
      toast.success('스케줄 삭제 완료')
    },
  })

  const agentList = agentsData?.data || []
  const schedules = schedulesData?.data || []

  const handleCreate = () => {
    if (!selectedAgent || !instruction.trim() || !cronExpression.trim()) return
    createSchedule.mutate({
      agentId: selectedAgent,
      instruction: instruction.trim(),
      cronExpression: cronExpression.trim(),
    })
  }

  const handleToggle = (schedule: Schedule) => {
    updateSchedule.mutate({ id: schedule.id, isActive: !schedule.isActive })
  }

  const startEdit = (schedule: Schedule) => {
    setEditingId(schedule.id)
    setEditInstruction(schedule.instruction)
    setEditCron(schedule.cronExpression)
  }

  const handleSaveEdit = (id: string) => {
    updateSchedule.mutate({ id, instruction: editInstruction.trim(), cronExpression: editCron.trim() })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? '취소' : '+ 새 스케줄'}
        </button>
      </div>

      {/* 생성 폼 */}
      {showForm && (
        <div className="p-5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              placeholder="에이전트 선택..."
              options={agentList.map((agent) => ({
                value: agent.id,
                label: `${agent.name} ${agent.isSecretary ? '(비서)' : ''} — ${agent.role}`,
              }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="예: 매일 아침 뉴스 요약 보고서를 작성해줘"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">반복 주기 (cron)</label>
            <Input
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="0 2 * * *"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              분 시 일 월 요일 | 예: 0 2 * * * = 매일 02:00 · 프리셋: @daily @weekly @hourly
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedAgent || !instruction.trim() || !cronExpression.trim() || createSchedule.isPending}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createSchedule.isPending ? '등록 중...' : '스케줄 등록'}
          </button>
        </div>
      )}

      {/* 스케줄 목록 */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-400">
            <p className="text-3xl mb-3">⏰</p>
            <p>등록된 스케줄이 없습니다</p>
            <p className="text-xs mt-1">반복 스케줄을 등록하면 자동으로 야간 작업이 생성됩니다</p>
          </div>
        ) : (
          schedules.map((schedule) => {
            const isEditing = editingId === schedule.id

            return (
              <div
                key={schedule.id}
                className="border rounded-lg overflow-hidden border-zinc-200 dark:border-zinc-800"
              >
                <div className="px-4 py-3">
                  {isEditing ? (
                    /* 편집 모드 */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">작업 지시</label>
                        <Textarea
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">cron 식</label>
                        <Input
                          value={editCron}
                          onChange={(e) => setEditCron(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(schedule.id)}
                          disabled={updateSchedule.isPending}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-zinc-500 hover:text-zinc-700 text-xs"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 보기 모드 */
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={schedule.isActive ? 'success' : 'default'}>
                            {schedule.isActive ? '활성' : '비활성'}
                          </Badge>
                          <span className="text-xs text-zinc-400">{schedule.agentName}</span>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {schedule.cronExpression}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{schedule.instruction}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          다음 실행: {schedule.nextRunAt
                            ? new Date(schedule.nextRunAt).toLocaleString('ko-KR', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <button
                          onClick={() => handleToggle(schedule)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            schedule.isActive ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              schedule.isActive ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => startEdit(schedule)}
                          className="text-xs text-zinc-400 hover:text-indigo-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(schedule.id)}
                          className="text-xs text-zinc-400 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteSchedule.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="스케줄 삭제"
        description="이 스케줄을 삭제하시겠습니까? 연결된 대기 중 작업도 함께 삭제됩니다."
        variant="danger"
      />
    </div>
  )
}

/* ─── 트리거 탭 (신규) ─── */
function TriggersTab() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [instruction, setInstruction] = useState('')
  const [triggerType, setTriggerType] = useState<string>('market-open')
  const [symbol, setSymbol] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState('')
  const [editTriggerType, setEditTriggerType] = useState('')
  const [editSymbol, setEditSymbol] = useState('')
  const [editTargetPrice, setEditTargetPrice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: triggersData } = useQuery({
    queryKey: ['triggers'],
    queryFn: () => api.get<{ data: Trigger[] }>('/workspace/triggers'),
  })

  const createTrigger = useMutation({
    mutationFn: (body: { agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown> }) =>
      api.post('/workspace/triggers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] })
      setShowForm(false)
      setSelectedAgent('')
      setInstruction('')
      setTriggerType('market-open')
      setSymbol('')
      setTargetPrice('')
      toast.success('트리거 등록 완료')
    },
    onError: () => toast.error('트리거 등록 실패'),
  })

  const updateTrigger = useMutation({
    mutationFn: ({ id, ...body }: { id: string; instruction?: string; triggerType?: string; condition?: Record<string, unknown>; isActive?: boolean }) =>
      api.patch(`/workspace/triggers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] })
      setEditingId(null)
      toast.success('트리거 수정 완료')
    },
    onError: () => toast.error('트리거 수정 실패'),
  })

  const deleteTrigger = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] })
      setDeleteTarget(null)
      toast.success('트리거 삭제 완료')
    },
  })

  const agentList = agentsData?.data || []
  const triggers = triggersData?.data || []
  const isPriceTrigger = triggerType === 'price-above' || triggerType === 'price-below'
  const isEditPriceTrigger = editTriggerType === 'price-above' || editTriggerType === 'price-below'

  const handleCreate = () => {
    if (!selectedAgent || !instruction.trim()) return
    const condition: Record<string, unknown> = {}
    if (isPriceTrigger) {
      if (!symbol.trim() || !targetPrice) return
      condition.symbol = symbol.trim()
      condition.targetPrice = Number(targetPrice)
    }
    createTrigger.mutate({
      agentId: selectedAgent,
      instruction: instruction.trim(),
      triggerType,
      condition,
    })
  }

  const handleRewatch = (trigger: Trigger) => {
    updateTrigger.mutate({ id: trigger.id, isActive: true })
  }

  const startEdit = (trigger: Trigger) => {
    setEditingId(trigger.id)
    setEditInstruction(trigger.instruction)
    setEditTriggerType(trigger.triggerType)
    setEditSymbol(trigger.condition?.symbol || '')
    setEditTargetPrice(String(trigger.condition?.targetPrice || ''))
  }

  const handleSaveEdit = (id: string) => {
    const condition: Record<string, unknown> = {}
    if (isEditPriceTrigger) {
      condition.symbol = editSymbol.trim()
      condition.targetPrice = Number(editTargetPrice)
    }
    updateTrigger.mutate({
      id,
      instruction: editInstruction.trim(),
      triggerType: editTriggerType,
      condition,
    })
  }

  const triggerTypeOptions = [
    { value: 'price-above', label: '주가 이상 도달' },
    { value: 'price-below', label: '주가 이하 하락' },
    { value: 'market-open', label: '장 시작 (09:00)' },
    { value: 'market-close', label: '장 마감 (15:30)' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? '취소' : '+ 새 트리거'}
        </button>
      </div>

      {/* 생성 폼 */}
      {showForm && (
        <div className="p-5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">담당 에이전트</label>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              placeholder="에이전트 선택..."
              options={agentList.map((agent) => ({
                value: agent.id,
                label: `${agent.name} ${agent.isSecretary ? '(비서)' : ''} — ${agent.role}`,
              }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">작업 지시</label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="예: 삼성전자 목표가 도달 시 매도 분석 보고서 작성"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">트리거 유형</label>
            <Select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              options={triggerTypeOptions}
            />
          </div>
          {isPriceTrigger && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">종목코드</label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="005930"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">목표가 (원)</label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="70000"
                />
              </div>
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={!selectedAgent || !instruction.trim() || (isPriceTrigger && (!symbol.trim() || !targetPrice)) || createTrigger.isPending}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createTrigger.isPending ? '등록 중...' : '트리거 등록'}
          </button>
        </div>
      )}

      {/* 트리거 목록 */}
      <div className="space-y-3">
        {triggers.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-400">
            <p className="text-3xl mb-3">🎯</p>
            <p>등록된 트리거가 없습니다</p>
            <p className="text-xs mt-1">조건을 설정하면 충족 시 자동으로 작업이 실행됩니다</p>
          </div>
        ) : (
          triggers.map((trigger) => {
            const isEditing = editingId === trigger.id

            return (
              <div
                key={trigger.id}
                className="border rounded-lg overflow-hidden border-zinc-200 dark:border-zinc-800"
              >
                <div className="px-4 py-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">작업 지시</label>
                        <Textarea
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1">트리거 유형</label>
                        <Select
                          value={editTriggerType}
                          onChange={(e) => setEditTriggerType(e.target.value)}
                          options={triggerTypeOptions}
                        />
                      </div>
                      {isEditPriceTrigger && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-medium text-zinc-500 mb-1">종목코드</label>
                            <Input value={editSymbol} onChange={(e) => setEditSymbol(e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-zinc-500 mb-1">목표가</label>
                            <Input type="number" value={editTargetPrice} onChange={(e) => setEditTargetPrice(e.target.value)} />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(trigger.id)}
                          disabled={updateTrigger.isPending}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-zinc-500 hover:text-zinc-700 text-xs"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={trigger.isActive ? 'success' : 'default'}>
                            {trigger.isActive ? '감시 중' : '중지'}
                          </Badge>
                          <span className="text-xs text-zinc-400">{trigger.agentName}</span>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {triggerTypeLabels[trigger.triggerType] || trigger.triggerType}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{trigger.instruction}</p>
                        {(trigger.triggerType === 'price-above' || trigger.triggerType === 'price-below') && trigger.condition && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {trigger.condition.symbol} {trigger.triggerType === 'price-above' ? '≥' : '≤'} {trigger.condition.targetPrice?.toLocaleString()}원
                          </p>
                        )}
                        {trigger.lastTriggeredAt && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            마지막 발동: {new Date(trigger.lastTriggeredAt).toLocaleString('ko-KR', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        {!trigger.isActive && (
                          <button
                            onClick={() => handleRewatch(trigger)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            다시 감시
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(trigger)}
                          className="text-xs text-zinc-400 hover:text-indigo-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(trigger.id)}
                          className="text-xs text-zinc-400 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteTrigger.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="트리거 삭제"
        description="이 트리거를 삭제하시겠습니까? 연결된 대기 중 작업도 함께 삭제됩니다."
        variant="danger"
      />
    </div>
  )
}
