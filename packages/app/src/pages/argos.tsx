import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'
import { toast } from 'sonner'
import { Activity, Bot, Target, DollarSign } from 'lucide-react'

// ── Types ──

type Agent = {
  id: string
  name: string
  role: string
  status: string
  isSecretary: boolean
}

type ArgosTrigger = {
  id: string
  companyId: string
  userId: string
  agentId: string
  agentName?: string
  name: string | null
  instruction: string
  triggerType: string
  condition: Record<string, unknown>
  cooldownMinutes: number
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
  eventCount?: number
  recentEvents?: ArgosEvent[]
}

type ArgosEvent = {
  id: string
  triggerId: string
  eventType: string
  eventData: Record<string, unknown> | null
  status: 'detected' | 'executing' | 'completed' | 'failed'
  commandId: string | null
  result: string | null
  error: string | null
  durationMs: number | null
  processedAt: string | null
  createdAt: string
}

type ArgosStatus = {
  dataOk: boolean
  aiOk: boolean
  activeTriggersCount: number
  todayCost: number
  lastCheckAt: string | null
}

// ── Constants ──

const TRIGGER_TYPES = [
  { value: 'price', label: '가격 감시' },
  { value: 'price-above', label: '가격 상한' },
  { value: 'price-below', label: '가격 하한' },
  { value: 'news', label: '뉴스 감시' },
  { value: 'schedule', label: '정기 수집' },
  { value: 'market-open', label: '장 시작' },
  { value: 'market-close', label: '장 마감' },
  { value: 'custom', label: '커스텀' },
]

const TRIGGER_TYPE_BADGE: Record<string, { classes: string; label: string }> = {
  price: { classes: 'bg-amber-500/15 text-amber-400', label: '가격' },
  'price-above': { classes: 'bg-amber-500/15 text-amber-400', label: '가격↑' },
  'price-below': { classes: 'bg-amber-500/15 text-amber-400', label: '가격↓' },
  news: { classes: 'bg-blue-500/15 text-blue-400', label: '뉴스' },
  schedule: { classes: 'bg-purple-500/15 text-purple-400', label: '일정' },
  'market-open': { classes: 'bg-emerald-500/15 text-emerald-400', label: '장시작' },
  'market-close': { classes: 'bg-emerald-500/15 text-emerald-400', label: '장마감' },
  custom: { classes: 'bg-corthex-surface/15 text-corthex-text-secondary', label: '커스텀' },
}

const EVENT_STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  detected: { label: '감지됨', classes: 'bg-corthex-surface/15 text-corthex-text-secondary' },
  executing: { label: '실행중', classes: 'bg-blue-500/15 text-blue-400 animate-pulse' },
  completed: { label: '완료', classes: 'bg-emerald-500/15 text-emerald-400' },
  failed: { label: '실패', classes: 'bg-red-500/15 text-red-400' },
}

const PRICE_OPERATORS: Record<string, string> = {
  above: '이상',
  below: '이하',
  change_pct_above: '% 이상 변동',
  change_pct_below: '% 이하 변동',
}

// ── Helpers ──

function formatConditionKorean(triggerType: string, condition: Record<string, unknown>): string {
  switch (triggerType) {
    case 'price':
    case 'price-above':
    case 'price-below': {
      const ticker = (condition.ticker || condition.stockCode || '?') as string
      const value = (condition.value ?? condition.targetPrice ?? '?') as number
      const op = PRICE_OPERATORS[(condition.operator || triggerType.replace('price-', '')) as string] || ''
      return `${ticker} ${typeof value === 'number' ? value.toLocaleString() : value} ${op}`
    }
    case 'news': {
      const keywords = (condition.keywords || []) as string[]
      const matchMode = condition.matchMode === 'all' ? '모두 포함' : '하나 이상'
      return keywords.length ? `키워드: ${keywords.join(', ')} (${matchMode})` : '키워드 미설정'
    }
    case 'schedule': {
      const interval = (condition.intervalMinutes || 60) as number
      return `${interval}분 간격`
    }
    case 'market-open':
      return `장 시작 (${(condition.market as string) || 'KR'})`
    case 'market-close':
      return `장 마감 (${(condition.market as string) || 'KR'})`
    case 'custom': {
      const field = (condition.field || '?') as string
      const operator = (condition.operator || '?') as string
      const value = condition.value ?? '?'
      return `${field} ${operator} ${value}`
    }
    default:
      return JSON.stringify(condition)
  }
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return '방금'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

const inputClasses = 'w-full bg-corthex-surface border border-corthex-border focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent/30 text-sm text-corthex-text-primary rounded-lg px-3 py-2 outline-none transition-colors placeholder:text-corthex-text-secondary'

// ── Main Page ──

export function ArgosPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<ArgosTrigger | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [selectedTriggerId, setSelectedTriggerId] = useState<string | null>(null)
  const [eventTab, setEventTab] = useState<'all' | 'error'>('all')
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('')
  const [eventPage, setEventPage] = useState(1)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [highlightedTrigger, setHighlightedTrigger] = useState<string | null>(null)

  // ── Data ──

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: statusData } = useQuery({
    queryKey: ['argos-status'],
    queryFn: () => api.get<{ data: ArgosStatus }>('/workspace/argos/status'),
    refetchInterval: 30_000,
  })

  const { data: triggersData, isLoading: triggersLoading } = useQuery({
    queryKey: ['argos-triggers'],
    queryFn: () => api.get<{ data: ArgosTrigger[] }>('/workspace/argos/triggers'),
  })

  const eventsTriggerId = selectedTriggerId
  const eventsStatusParam = eventTab === 'error' ? 'failed' : (eventStatusFilter || undefined)

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['argos-events', eventsTriggerId, eventsStatusParam, eventPage],
    queryFn: () => {
      if (!eventsTriggerId) return Promise.resolve({ data: [] as ArgosEvent[], pagination: { page: 1, totalPages: 1, total: 0 } })
      const params = new URLSearchParams({ page: String(eventPage), limit: '10' })
      if (eventsStatusParam) params.set('status', eventsStatusParam)
      return api.get<{ data: ArgosEvent[]; pagination: { page: number; totalPages: number; total: number } }>(
        `/workspace/argos/triggers/${eventsTriggerId}/events?${params}`
      )
    },
    enabled: !!eventsTriggerId,
  })

  const agentList = agentsData?.data || []
  const argosStatus = statusData?.data
  const triggers = triggersData?.data || []
  const events = eventsData?.data || []
  const eventsPagination = eventsData?.pagination

  // ── Mutations ──

  const createTrigger = useMutation({
    mutationFn: (body: { name?: string; agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown>; cooldownMinutes?: number }) =>
      api.post('/workspace/argos/triggers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      closeModal()
      toast.success('트리거가 생성되었습니다')
    },
    onError: () => toast.error('트리거 생성에 실패했습니다'),
  })

  const updateTrigger = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; agentId?: string; instruction?: string; triggerType?: string; condition?: Record<string, unknown>; cooldownMinutes?: number }) =>
      api.patch(`/workspace/argos/triggers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      closeModal()
      toast.success('트리거가 수정되었습니다')
    },
    onError: () => toast.error('트리거 수정에 실패했습니다'),
  })

  const toggleTrigger = useMutation({
    mutationFn: (id: string) => api.patch(`/workspace/argos/triggers/${id}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
    },
    onError: () => toast.error('트리거 상태 변경에 실패했습니다'),
  })

  const deleteTriggerMut = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/argos/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      if (selectedTriggerId === deleteTarget) setSelectedTriggerId(null)
      setDeleteTarget(null)
      toast.success('트리거가 삭제되었습니다')
    },
    onError: () => { setDeleteTarget(null); toast.error('트리거 삭제에 실패했습니다') },
  })

  // ── WebSocket ──

  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; triggerId?: string; triggerName?: string; eventId?: string; error?: string; durationMs?: number }
    if (event.type === 'argos-trigger-fired' && event.triggerId) {
      setHighlightedTrigger(event.triggerId)
      setTimeout(() => setHighlightedTrigger(null), 3000)
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.info(`🎯 ${event.triggerName || '알 수 없음'} 트리거 발동`)
    } else if (event.type === 'argos-execution-completed') {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.success(`✅ ${event.triggerName || ''} 완료 (${((event.durationMs || 0) / 1000).toFixed(1)}초)`)
    } else if (event.type === 'argos-execution-failed') {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.error(`❌ ${event.triggerName || ''} 실패`)
    }
  }, [queryClient])

  useEffect(() => {
    if (!isConnected || !user) return
    subscribe('argos', {})
    const channelKey = `argos::${user.companyId}`
    addListener(channelKey, wsHandler)
    return () => removeListener(channelKey, wsHandler)
  }, [isConnected, user, subscribe, addListener, removeListener, wsHandler])

  // ── Helpers ──

  function closeModal() { setShowModal(false); setEditingTrigger(null) }
  function openCreate() { setEditingTrigger(null); setShowModal(true) }
  function openEdit(t: ArgosTrigger) { setEditingTrigger(t); setShowModal(true) }
  function selectTriggerForEvents(id: string) { setSelectedTriggerId(selectedTriggerId === id ? null : id); setEventPage(1); setExpandedEventId(null) }

  // ── Render ──

  return (
    <div data-testid="argos-page" className="flex-1 bg-corthex-bg p-4 sm:p-6 lg:p-8 max-w-5xl overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-corthex-accent-deep">ARGOS</h1>
          <p className="text-sm text-corthex-text-secondary mt-1">조건 기반 정보 자동 수집 — 놓치지 않겠습니다</p>
        </div>
        <button data-testid="add-trigger-btn" onClick={openCreate} className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent text-sm font-medium rounded-lg px-4 py-2 min-h-[44px] transition-colors">
          + 트리거 추가
        </button>
      </div>

      {/* Status Bar */}
      <StatusBar status={argosStatus} />

      {/* Trigger List */}
      {triggersLoading ? (
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-corthex-elevated/60 border border-corthex-border/50 rounded-xl p-4 animate-pulse h-28" />
          ))}
        </div>
      ) : triggers.length === 0 ? (
        <div data-testid="argos-empty-state" className="bg-corthex-elevated/60 border border-dashed border-corthex-border rounded-xl p-12 text-center mt-6">
          <p className="text-4xl mb-3">🔭</p>
          <p className="text-sm font-medium text-corthex-text-secondary">설정된 감시 트리거가 없습니다</p>
          <p className="text-xs text-corthex-text-secondary mt-1">트리거를 추가하면 조건 충족 시 자동으로 에이전트가 작업합니다</p>
          <button onClick={openCreate} className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent text-sm rounded-lg px-4 py-2 min-h-[44px] mt-4 transition-colors">트리거 추가</button>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {triggers.map(t => (
            <TriggerCard
              key={t.id}
              trigger={t}
              isSelected={selectedTriggerId === t.id}
              isHighlighted={highlightedTrigger === t.id}
              onSelect={() => selectTriggerForEvents(t.id)}
              onEdit={() => openEdit(t)}
              onToggle={() => toggleTrigger.mutate(t.id)}
              onDelete={() => setDeleteTarget(t.id)}
            />
          ))}
        </div>
      )}

      {/* Event Log */}
      {triggers.length > 0 && (
        <EventLogSection
          events={events} isLoading={eventsLoading} pagination={eventsPagination}
          selectedTriggerId={selectedTriggerId} triggers={triggers}
          eventTab={eventTab} setEventTab={setEventTab}
          eventStatusFilter={eventStatusFilter} setEventStatusFilter={setEventStatusFilter}
          eventPage={eventPage} setEventPage={setEventPage}
          expandedEventId={expandedEventId} setExpandedEventId={setExpandedEventId}
        />
      )}

      {/* Modal */}
      {showModal && (
        <TriggerModal
          editing={editingTrigger} agents={agentList} onClose={closeModal}
          onSubmit={(data) => {
            if (editingTrigger) updateTrigger.mutate({ id: editingTrigger.id, ...data })
            else createTrigger.mutate(data as { name?: string; agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown>; cooldownMinutes?: number })
          }}
          isPending={createTrigger.isPending || updateTrigger.isPending}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-corthex-surface border border-corthex-border rounded-xl p-5 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-corthex-accent-deep">트리거 삭제</h3>
            <p className="text-xs text-corthex-text-secondary mt-2">이 트리거와 관련된 이벤트 기록이 모두 삭제됩니다. 계속하시겠습니까?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleteTarget(null)} className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep px-3 py-1.5 min-h-[44px] rounded-lg">취소</button>
              <button onClick={() => deleteTarget && deleteTriggerMut.mutate(deleteTarget)} className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 min-h-[44px] rounded-lg">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Status Bar ──

function StatusBar({ status }: { status?: ArgosStatus }) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Data */}
        <div className={`rounded-xl p-3 border ${status?.dataOk !== false ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20 animate-pulse'}`}>
          <Activity className={`w-5 h-5 ${status?.dataOk !== false ? 'text-emerald-400' : 'text-red-400'}`} />
          <p className="text-xs text-corthex-text-secondary font-medium mt-1">데이터</p>
          <p className={`text-lg font-bold ${status?.dataOk !== false ? 'text-emerald-400' : 'text-red-400'}`}>{status?.dataOk !== false ? 'OK' : 'NG'}</p>
        </div>
        {/* AI */}
        <div className={`rounded-xl p-3 border ${status?.aiOk !== false ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20 animate-pulse'}`}>
          <Bot className={`w-5 h-5 ${status?.aiOk !== false ? 'text-emerald-400' : 'text-red-400'}`} />
          <p className="text-xs text-corthex-text-secondary font-medium mt-1">AI</p>
          <p className={`text-lg font-bold ${status?.aiOk !== false ? 'text-emerald-400' : 'text-red-400'}`}>{status?.aiOk !== false ? 'OK' : 'NG'}</p>
        </div>
        {/* Active Triggers */}
        <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-3">
          <Target className="w-5 h-5 text-corthex-accent" />
          <p className="text-xs text-corthex-text-secondary font-medium mt-1">활성 트리거</p>
          <p className="text-lg font-bold text-corthex-text-primary">{status?.activeTriggersCount ?? 0}</p>
        </div>
        {/* Cost */}
        <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-3">
          <DollarSign className="w-5 h-5 text-corthex-accent" />
          <p className="text-xs text-corthex-text-secondary font-medium mt-1">오늘 비용</p>
          <p className="text-lg font-bold text-corthex-text-primary">${(status?.todayCost ?? 0).toFixed(2)}</p>
        </div>
      </div>
      {status?.lastCheckAt && (
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-corthex-text-secondary font-mono">마지막 확인: {new Date(status.lastCheckAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      )}
    </div>
  )
}

// ── Trigger Card ──

function TriggerCard({ trigger: t, isSelected, isHighlighted, onSelect, onEdit, onToggle, onDelete }: {
  trigger: ArgosTrigger; isSelected: boolean; isHighlighted: boolean
  onSelect: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  const typeBadge = TRIGGER_TYPE_BADGE[t.triggerType] || TRIGGER_TYPE_BADGE.custom
  const conditionDesc = formatConditionKorean(t.triggerType, t.condition)

  return (
    <div
      data-testid={`trigger-card-${t.id}`}
      onClick={onSelect}
      className={`bg-corthex-elevated border rounded-xl p-4 cursor-pointer transition-all ${
        isHighlighted ? 'border-corthex-accent/50 ring-2 ring-corthex-accent/30 bg-corthex-accent/5'
        : isSelected ? 'bg-corthex-accent/5 border-corthex-accent/30 ring-1 ring-corthex-accent/20'
        : t.isActive ? 'border-corthex-border hover:border-corthex-border-strong hover:bg-corthex-elevated/70'
        : 'border-corthex-border opacity-50'
      }`}
    >
      {/* Row 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${t.isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-corthex-surface'}`} />
          <span className="text-sm font-semibold text-corthex-text-primary truncate max-w-[160px] sm:max-w-[200px]">{t.name || t.instruction.slice(0, 40)}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge.classes}`}>{typeBadge.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {t.agentName && <span className="text-xs text-corthex-text-secondary">{t.agentName}</span>}
        </div>
      </div>

      {/* Row 2: Condition */}
      <p className="text-xs text-corthex-text-secondary mt-2">{conditionDesc}</p>

      {/* Row 3: Instruction */}
      <p className="text-xs text-corthex-text-secondary truncate max-w-full mt-1">{t.instruction}</p>

      {/* Row 4: Meta + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-[10px] text-corthex-text-secondary font-mono">쿨다운 {t.cooldownMinutes}분</span>
          {t.lastTriggeredAt && <span className="text-[10px] text-corthex-text-secondary">마지막: {formatRelativeTime(t.lastTriggeredAt)}</span>}
          {t.eventCount !== undefined && <span className="text-[10px] text-corthex-text-secondary">이벤트 {t.eventCount}건</span>}
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep px-2 py-1 min-h-[44px] rounded hover:bg-corthex-border/50 transition-colors">편집</button>
          <button onClick={onToggle} className={`text-xs px-2 py-1 min-h-[44px] rounded transition-colors ${t.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
            {t.isActive ? '중지' : '시작'}
          </button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 min-h-[44px] rounded transition-colors">삭제</button>
        </div>
      </div>
    </div>
  )
}

// ── Event Log Section ──

function EventLogSection({ events, isLoading, pagination, selectedTriggerId, triggers, eventTab, setEventTab, eventStatusFilter, setEventStatusFilter, eventPage, setEventPage, expandedEventId, setExpandedEventId }: {
  events: ArgosEvent[]; isLoading: boolean; pagination?: { page: number; totalPages: number; total: number }
  selectedTriggerId: string | null; triggers: ArgosTrigger[]
  eventTab: 'all' | 'error'; setEventTab: (t: 'all' | 'error') => void
  eventStatusFilter: string; setEventStatusFilter: (f: string) => void
  eventPage: number; setEventPage: (p: number) => void
  expandedEventId: string | null; setExpandedEventId: (id: string | null) => void
}) {
  const selectedTriggerName = selectedTriggerId ? triggers.find(t => t.id === selectedTriggerId)?.name || '선택된 트리거' : null

  return (
    <div data-testid="event-log-section" className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-corthex-text-primary">이벤트 로그</h3>
          {selectedTriggerName && <span className="text-xs text-corthex-accent">— {selectedTriggerName}</span>}
          {pagination && <span className="text-[10px] text-corthex-text-secondary bg-corthex-elevated px-1.5 py-0.5 rounded">{pagination.total}건</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-corthex-elevated rounded-lg p-0.5">
            {([['all', '전체'], ['error', '오류']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setEventTab(key); setEventPage(1) }}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${eventTab === key ? 'bg-corthex-border text-corthex-text-primary' : 'text-corthex-text-secondary hover:text-corthex-text-secondary'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {eventTab === 'all' && (
            <select
              value={eventStatusFilter}
              onChange={e => { setEventStatusFilter(e.target.value); setEventPage(1) }}
              className="bg-corthex-elevated border border-corthex-border text-xs text-corthex-text-secondary rounded-lg px-2 py-1.5"
            >
              <option value="">전체 상태</option>
              <option value="detected">감지됨</option>
              <option value="executing">실행중</option>
              <option value="completed">완료</option>
              <option value="failed">실패</option>
            </select>
          )}
        </div>
      </div>

      {/* Event Rows */}
      <div className="mt-3">
        {!selectedTriggerId ? (
          <p className="text-xs text-corthex-text-secondary text-center py-8">위의 트리거 카드를 클릭하면 이벤트 기록이 표시됩니다</p>
        ) : isLoading ? (
          <p className="text-xs text-corthex-text-secondary text-center py-8">로딩 중...</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-corthex-text-secondary text-center py-8">이벤트 기록이 없습니다</p>
        ) : (
          events.map(evt => {
            const cfg = EVENT_STATUS_BADGE[evt.status] || { label: evt.status, classes: 'bg-corthex-surface/15 text-corthex-text-secondary' }
            const isExpanded = expandedEventId === evt.id
            return (
              <div key={evt.id}>
                <div
                  className="bg-corthex-elevated/60 border-b border-corthex-border/50 px-3 py-2.5 cursor-pointer hover:bg-corthex-elevated transition-colors flex items-center justify-between"
                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                    <span className="text-xs text-corthex-text-secondary">{evt.eventType}</span>
                    <span className="text-[10px] text-corthex-text-secondary font-mono">{formatShortDate(evt.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {evt.durationMs != null && <span className="text-[10px] text-corthex-text-secondary font-mono">{(evt.durationMs / 1000).toFixed(1)}초</span>}
                    <span className="text-corthex-text-secondary text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="bg-corthex-elevated/60 border-b border-corthex-border/50 px-4 py-3 space-y-2">
                    {evt.eventData && (
                      <div>
                        <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">이벤트 데이터</p>
                        <pre className="text-xs text-corthex-text-secondary font-mono bg-corthex-surface/50 rounded p-2 mt-0.5 break-all">{JSON.stringify(evt.eventData, null, 2)}</pre>
                      </div>
                    )}
                    {evt.result && (
                      <div>
                        <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">실행 결과</p>
                        <pre className="text-xs text-corthex-text-secondary font-mono bg-corthex-surface/50 rounded p-2 mt-0.5 break-all">{evt.result}</pre>
                      </div>
                    )}
                    {evt.error && (
                      <div>
                        <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">오류 메시지</p>
                        <pre className="text-xs text-red-400 font-mono bg-corthex-surface/50 rounded p-2 mt-0.5 break-all">{evt.error}</pre>
                      </div>
                    )}
                    {evt.processedAt && (
                      <div>
                        <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">처리 시각</p>
                        <p className="text-xs text-corthex-text-secondary font-mono mt-0.5">{formatShortDate(evt.processedAt)}</p>
                      </div>
                    )}
                    {evt.commandId && (
                      <div>
                        <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">연결 명령</p>
                        <p className="text-xs text-corthex-text-secondary font-mono mt-0.5">{evt.commandId}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button onClick={() => setEventPage(Math.max(1, eventPage - 1))} disabled={eventPage <= 1} className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1">← 이전</button>
          <span className="text-xs text-corthex-text-secondary">{pagination.page} / {pagination.totalPages}</span>
          <button onClick={() => setEventPage(Math.min(pagination.totalPages, eventPage + 1))} disabled={eventPage >= pagination.totalPages} className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1">다음 →</button>
        </div>
      )}
    </div>
  )
}

// ── Trigger Modal ──

function TriggerModal({ editing, agents, onClose, onSubmit, isPending }: {
  editing: ArgosTrigger | null; agents: Agent[]; onClose: () => void
  onSubmit: (data: { name?: string; agentId?: string; instruction?: string; triggerType?: string; condition?: Record<string, unknown>; cooldownMinutes?: number }) => void
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
  const [triggerType, setTriggerType] = useState(editing?.triggerType || 'price')
  const [cooldownMinutes, setCooldownMinutes] = useState(editing?.cooldownMinutes ?? 30)

  const initCondition = editing?.condition || {}
  const [ticker, setTicker] = useState((initCondition.ticker || initCondition.stockCode || '') as string)
  const [market, setMarket] = useState((initCondition.market || 'KR') as string)
  const [operator, setOperator] = useState((initCondition.operator || 'above') as string)
  const [priceValue, setPriceValue] = useState(String(initCondition.value ?? initCondition.targetPrice ?? ''))
  const [keywords, setKeywords] = useState(((initCondition.keywords || []) as string[]).join(', '))
  const [matchMode, setMatchMode] = useState((initCondition.matchMode || 'any') as string)
  const [intervalMinutes, setIntervalMinutes] = useState(String(initCondition.intervalMinutes ?? 60))
  const [activeHoursStart, setActiveHoursStart] = useState(String((initCondition.activeHours as Record<string, number> | undefined)?.start ?? ''))
  const [activeHoursEnd, setActiveHoursEnd] = useState(String((initCondition.activeHours as Record<string, number> | undefined)?.end ?? ''))
  const [activeDays, setActiveDays] = useState((initCondition.activeDays || []) as number[])
  const [customField, setCustomField] = useState((initCondition.field || '') as string)
  const [customOperator, setCustomOperator] = useState((initCondition.operator || 'eq') as string)
  const [customValue, setCustomValue] = useState(String(initCondition.value ?? ''))
  const [customDataSource, setCustomDataSource] = useState((initCondition.dataSource || '') as string)

  useEffect(() => {
    if (editing) {
      const c = editing.condition || {}
      setTriggerType(editing.triggerType)
      setTicker((c.ticker || c.stockCode || '') as string)
      setMarket((c.market || 'KR') as string)
      setOperator((c.operator || 'above') as string)
      setPriceValue(String(c.value ?? c.targetPrice ?? ''))
      setKeywords(((c.keywords || []) as string[]).join(', '))
      setMatchMode((c.matchMode || 'any') as string)
      setIntervalMinutes(String(c.intervalMinutes ?? 60))
      const hours = c.activeHours as Record<string, number> | undefined
      setActiveHoursStart(String(hours?.start ?? ''))
      setActiveHoursEnd(String(hours?.end ?? ''))
      setActiveDays((c.activeDays || []) as number[])
      setCustomField((c.field || '') as string)
      setCustomOperator((c.operator || 'eq') as string)
      setCustomValue(String(c.value ?? ''))
      setCustomDataSource((c.dataSource || '') as string)
    }
  }, [editing])

  function buildCondition(): Record<string, unknown> {
    switch (triggerType) {
      case 'price': case 'price-above': case 'price-below':
        return { ticker, market, operator, value: Number(priceValue) || 0 }
      case 'news': return { keywords: keywords.split(',').map(k => k.trim()).filter(Boolean), matchMode }
      case 'schedule': {
        const cond: Record<string, unknown> = { intervalMinutes: Number(intervalMinutes) || 60 }
        if (activeHoursStart && activeHoursEnd) cond.activeHours = { start: Number(activeHoursStart), end: Number(activeHoursEnd) }
        if (activeDays.length > 0) cond.activeDays = activeDays
        return cond
      }
      case 'market-open': case 'market-close': return { market }
      case 'custom': return { field: customField, operator: customOperator, value: customValue, dataSource: customDataSource || undefined }
      default: return {}
    }
  }

  function isValid(): boolean {
    if (!agent || !instruction.trim()) return false
    switch (triggerType) {
      case 'price': case 'price-above': case 'price-below': return !!ticker && !!priceValue && !isNaN(Number(priceValue))
      case 'news': return keywords.split(',').filter(k => k.trim()).length > 0
      case 'schedule': return !!intervalMinutes && !isNaN(Number(intervalMinutes)) && Number(intervalMinutes) > 0
      case 'market-open': case 'market-close': return true
      case 'custom': return !!customField && !!customValue
      default: return false
    }
  }

  function handleSubmit() {
    if (!isValid()) return
    onSubmit({ name: name.trim() || undefined, agentId: agent, instruction: instruction.trim(), triggerType, condition: buildCondition(), cooldownMinutes })
  }

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="trigger-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-corthex-elevated border border-corthex-border rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-corthex-border">
          <h3 className="text-lg font-semibold text-corthex-text-primary">{editing ? '트리거 수정' : 'ARGOS 트리거 추가'}</h3>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-accent-deep transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">트리거 이름 (선택)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="예: 삼성전자 급등 감시" className={inputClasses} />
          </div>

          {/* Trigger Type */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">트리거 유형</label>
            <div className="grid grid-cols-4 gap-2">
              {TRIGGER_TYPES.map(tt => (
                <button
                  key={tt.value}
                  type="button"
                  onClick={() => setTriggerType(tt.value)}
                  className={`text-[11px] font-medium px-2 py-2 rounded-lg border transition-all text-center ${
                    triggerType === tt.value ? 'bg-corthex-accent/15 border-corthex-accent/40 text-corthex-accent' : 'bg-corthex-elevated border-corthex-border text-corthex-text-secondary hover:border-corthex-border-strong'
                  }`}
                >
                  {tt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Fields */}
          <div className="space-y-3">
            {(triggerType === 'price' || triggerType === 'price-above' || triggerType === 'price-below') && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">종목코드</label>
                    <input type="text" value={ticker} onChange={e => setTicker(e.target.value)} placeholder="종목코드 (예: 삼성전자)" className={inputClasses} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">시장</label>
                    <select value={market} onChange={e => setMarket(e.target.value)} className={inputClasses}>
                      <option value="KR">KR</option><option value="US">US</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">조건</label>
                    <select value={operator} onChange={e => setOperator(e.target.value)} className={inputClasses}>
                      <option value="above">이상</option><option value="below">이하</option>
                      <option value="change_pct_above">% 변동(상승)</option><option value="change_pct_below">% 변동(하락)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">값</label>
                    <input type="number" value={priceValue} onChange={e => setPriceValue(e.target.value)} className={inputClasses} />
                  </div>
                </div>
              </>
            )}

            {triggerType === 'news' && (
              <>
                <div>
                  <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">키워드</label>
                  <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="키워드1, 키워드2, ..." className={inputClasses} />
                </div>
                <div className="flex gap-3">
                  {([['any', '하나 이상 매치'], ['all', '모두 포함']] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 text-xs text-corthex-text-secondary cursor-pointer">
                      <input type="radio" name="matchMode" checked={matchMode === val} onChange={() => setMatchMode(val)} className="accent-blue-500" />
                      {label}
                    </label>
                  ))}
                </div>
              </>
            )}

            {triggerType === 'schedule' && (
              <>
                <div>
                  <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">수집 간격 (분)</label>
                  <input type="number" value={intervalMinutes} onChange={e => setIntervalMinutes(e.target.value)} min="1" className={inputClasses} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">시작 시간 (선택)</label>
                    <input type="number" value={activeHoursStart} onChange={e => setActiveHoursStart(e.target.value)} min="0" max="23" className={inputClasses} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">종료 시간 (선택)</label>
                    <input type="number" value={activeHoursEnd} onChange={e => setActiveHoursEnd(e.target.value)} min="0" max="23" className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">활성 요일 (선택)</label>
                  <div className="flex gap-2">
                    {DAY_NAMES.map((d, i) => (
                      <button key={i} type="button" onClick={() => setActiveDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                        className={`w-8 h-8 text-xs rounded-lg border transition-all ${activeDays.includes(i) ? 'bg-corthex-accent/20 border-corthex-accent/40 text-corthex-accent' : 'border-corthex-border text-corthex-text-secondary'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(triggerType === 'market-open' || triggerType === 'market-close') && (
              <div>
                <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">시장</label>
                <select value={market} onChange={e => setMarket(e.target.value)} className={inputClasses}>
                  <option value="KR">KR</option><option value="US">US</option>
                </select>
              </div>
            )}

            {triggerType === 'custom' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">필드</label>
                    <input type="text" value={customField} onChange={e => setCustomField(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">연산자</label>
                    <select value={customOperator} onChange={e => setCustomOperator(e.target.value)} className={inputClasses}>
                      <option value="gte">이상</option><option value="lte">이하</option><option value="eq">같음</option>
                      <option value="contains">포함</option><option value="excludes">제외</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">값</label>
                    <input type="text" value={customValue} onChange={e => setCustomValue(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">데이터 소스 (선택)</label>
                    <input type="text" value={customDataSource} onChange={e => setCustomDataSource(e.target.value)} className={inputClasses} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Agent */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">담당 에이전트</label>
            <select value={agent} onChange={e => setAgent(e.target.value)} className={inputClasses}>
              <option value="">에이전트 선택...</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.isSecretary ? '(비서실장)' : ''} · {a.role}</option>
              ))}
            </select>
          </div>

          {/* Instruction */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">실행 지시</label>
            <textarea value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="조건 충족 시 에이전트에게 시킬 작업" rows={3} className={`${inputClasses} resize-none`} />
          </div>

          {/* Cooldown */}
          <div>
            <label className="text-xs font-medium text-corthex-text-secondary mb-1.5 block">쿨다운 (분)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={cooldownMinutes} onChange={e => setCooldownMinutes(Number(e.target.value) || 30)} min={1} max={1440} className={`${inputClasses} w-20`} />
              <span className="text-xs text-corthex-text-secondary">분</span>
            </div>
            <p className="text-[10px] text-corthex-text-secondary mt-1">트리거 발동 후 재발동까지 대기 시간</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-corthex-border">
          <button onClick={onClose} className="text-sm text-corthex-text-secondary hover:text-corthex-accent-deep px-4 py-2 rounded-lg hover:bg-corthex-border/50 transition-colors">취소</button>
          <button onClick={handleSubmit} disabled={!isValid() || isPending} className="bg-corthex-accent hover:bg-corthex-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-corthex-text-on-accent text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            {isPending ? '처리 중...' : editing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}
