import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Select, Textarea, Badge, StatusDot, ConfirmDialog } from '@corthex/ui'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'
import { toast } from 'sonner'

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

const TRIGGER_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  price: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격' },
  'price-above': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↑' },
  'price-below': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: '가격↓' },
  news: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '뉴스' },
  schedule: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: '일정' },
  'market-open': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장시작' },
  'market-close': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '장마감' },
  custom: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: '커스텀' },
}

const EVENT_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'info' | 'error' | 'success' | 'warning' }> = {
  detected: { label: '감지됨', variant: 'info' },
  executing: { label: '실행중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
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
      return `${ticker} ${value}${op}`
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
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return '방금'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const daysVal = Math.floor(hours / 24)
  return `${daysVal}일 전`
}

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

  // ── Data Queries ──

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

  // Events query: either for a selected trigger or for all (using first trigger)
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
    onError: () => {
      setDeleteTarget(null)
      toast.error('트리거 삭제에 실패했습니다')
    },
  })

  // ── WebSocket ──

  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)

  const wsHandler = useCallback((data: unknown) => {
    const event = data as { type: string; triggerId?: string; triggerName?: string; eventId?: string; error?: string; durationMs?: number; resultPreview?: string }

    if (event.type === 'argos-trigger-fired' && event.triggerId) {
      setHighlightedTrigger(event.triggerId)
      setTimeout(() => setHighlightedTrigger(null), 3000)
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.info(`트리거 발동: ${event.triggerName || '알 수 없음'}`)
    } else if (event.type === 'argos-execution-completed') {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.success(`실행 완료: ${event.triggerName || ''} (${((event.durationMs || 0) / 1000).toFixed(1)}초)`)
    } else if (event.type === 'argos-execution-failed') {
      queryClient.invalidateQueries({ queryKey: ['argos-triggers'] })
      queryClient.invalidateQueries({ queryKey: ['argos-events'] })
      queryClient.invalidateQueries({ queryKey: ['argos-status'] })
      toast.error(`실행 실패: ${event.triggerName || ''} — ${event.error || '알 수 없는 오류'}`)
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

  function closeModal() {
    setShowModal(false)
    setEditingTrigger(null)
  }

  function openCreate() {
    setEditingTrigger(null)
    setShowModal(true)
  }

  function openEdit(t: ArgosTrigger) {
    setEditingTrigger(t)
    setShowModal(true)
  }

  function selectTriggerForEvents(id: string) {
    setSelectedTriggerId(selectedTriggerId === id ? null : id)
    setEventPage(1)
    setExpandedEventId(null)
  }

  // ── Render ──

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">🔍 ARGOS</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            조건 기반 정보 자동 수집 — 놓치지 않겠습니다
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + 트리거 추가
        </button>
      </div>

      {/* Status Bar */}
      <StatusBar status={argosStatus} />

      {/* Trigger List */}
      {triggersLoading ? (
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : triggers.length === 0 ? (
        <EmptyState onAdd={openCreate} />
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

      {/* Event Log Table */}
      {triggers.length > 0 && (
        <EventLogSection
          events={events}
          isLoading={eventsLoading}
          pagination={eventsPagination}
          selectedTriggerId={selectedTriggerId}
          triggers={triggers}
          eventTab={eventTab}
          setEventTab={setEventTab}
          eventStatusFilter={eventStatusFilter}
          setEventStatusFilter={setEventStatusFilter}
          eventPage={eventPage}
          setEventPage={setEventPage}
          expandedEventId={expandedEventId}
          setExpandedEventId={setExpandedEventId}
        />
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <TriggerModal
          editing={editingTrigger}
          agents={agentList}
          onClose={closeModal}
          onSubmit={(data) => {
            if (editingTrigger) {
              updateTrigger.mutate({ id: editingTrigger.id, ...data })
            } else {
              createTrigger.mutate(data as { name?: string; agentId: string; instruction: string; triggerType: string; condition: Record<string, unknown>; cooldownMinutes?: number })
            }
          }}
          isPending={createTrigger.isPending || updateTrigger.isPending}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="트리거 삭제"
        description="이 ARGOS 트리거를 삭제하시겠습니까? 관련 이벤트 기록도 함께 삭제됩니다."
        onConfirm={() => deleteTarget && deleteTriggerMut.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ── Status Bar ──

function StatusBar({ status }: { status?: ArgosStatus }) {
  const cards = [
    {
      label: '데이터',
      value: status?.dataOk ? 'OK' : 'NG',
      ok: status?.dataOk ?? true,
      icon: '📡',
    },
    {
      label: 'AI',
      value: status?.aiOk ? 'OK' : 'NG',
      ok: status?.aiOk ?? true,
      icon: '🤖',
    },
    {
      label: '활성 트리거',
      value: String(status?.activeTriggersCount ?? 0),
      ok: true,
      icon: '🎯',
    },
    {
      label: '오늘 비용',
      value: `$${(status?.todayCost ?? 0).toFixed(4)}`,
      ok: true,
      icon: '💵',
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg px-4 py-3 border transition-colors ${
              card.label === '데이터' || card.label === 'AI'
                ? card.ok
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{card.icon}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</span>
            </div>
            <p className={`text-lg font-bold ${
              card.label === '데이터' || card.label === 'AI'
                ? card.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
      {status?.lastCheckAt && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 text-right">
          마지막 확인: {formatShortDate(status.lastCheckAt)}
        </p>
      )}
    </div>
  )
}

// ── Empty State ──

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 mt-6">
      <p className="text-5xl mb-4">🔭</p>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        설정된 감시 트리거가 없습니다
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        조건 기반으로 정보를 자동 수집하세요
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        + 트리거 추가
      </button>
    </div>
  )
}

// ── Trigger Card ──

function TriggerCard({
  trigger: t,
  isSelected,
  isHighlighted,
  onSelect,
  onEdit,
  onToggle,
  onDelete,
}: {
  trigger: ArgosTrigger
  isSelected: boolean
  isHighlighted: boolean
  onSelect: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const typeInfo = TRIGGER_TYPE_COLORS[t.triggerType] || TRIGGER_TYPE_COLORS.custom
  const conditionDesc = formatConditionKorean(t.triggerType, t.condition)

  return (
    <div
      className={`border rounded-lg px-4 py-3 transition-all cursor-pointer ${
        isHighlighted
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-300 dark:ring-indigo-700'
          : isSelected
            ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30'
            : t.isActive
              ? 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              : 'border-zinc-100 dark:border-zinc-900 opacity-60'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <StatusDot status={t.isActive ? 'online' : 'offline'} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {t.name || t.instruction.slice(0, 40)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeInfo.bg} ${typeInfo.text}`}>
              {typeInfo.label}
            </span>
            {t.agentName && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">{t.agentName}</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{conditionDesc}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{t.instruction}</p>
          <div className="flex gap-3 mt-1 text-[10px] font-mono text-zinc-400">
            <span>쿨다운: {t.cooldownMinutes}분</span>
            {t.lastTriggeredAt && (
              <span>마지막: {formatRelativeTime(t.lastTriggeredAt)}</span>
            )}
            {t.eventCount !== undefined && (
              <span>이벤트: {t.eventCount}건</span>
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
              t.isActive
                ? 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'
                : 'text-green-600 hover:text-green-700 dark:text-green-400'
            }`}
          >
            {t.isActive ? '중지' : '시작'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Event Log Section ──

function EventLogSection({
  events,
  isLoading,
  pagination,
  selectedTriggerId,
  triggers,
  eventTab,
  setEventTab,
  eventStatusFilter,
  setEventStatusFilter,
  eventPage,
  setEventPage,
  expandedEventId,
  setExpandedEventId,
}: {
  events: ArgosEvent[]
  isLoading: boolean
  pagination?: { page: number; totalPages: number; total: number }
  selectedTriggerId: string | null
  triggers: ArgosTrigger[]
  eventTab: 'all' | 'error'
  setEventTab: (tab: 'all' | 'error') => void
  eventStatusFilter: string
  setEventStatusFilter: (filter: string) => void
  eventPage: number
  setEventPage: (page: number) => void
  expandedEventId: string | null
  setExpandedEventId: (id: string | null) => void
}) {
  const selectedTriggerName = selectedTriggerId
    ? triggers.find(t => t.id === selectedTriggerId)?.name || '선택된 트리거'
    : null

  return (
    <div className="mt-8 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      {/* Header + Tabs */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">이벤트 로그</h3>
            {selectedTriggerName && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                — {selectedTriggerName}
              </span>
            )}
            {!selectedTriggerId && (
              <span className="text-xs text-zinc-400">트리거를 선택하세요</span>
            )}
          </div>
          {pagination && (
            <span className="text-[10px] text-zinc-400">{pagination.total}건</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1">
            {([['all', '활동 로그'], ['error', '오류 로그']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setEventTab(key); setEventPage(1) }}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  eventTab === key
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Status Filter (only in 'all' tab) */}
          {eventTab === 'all' && (
            <select
              value={eventStatusFilter}
              onChange={e => { setEventStatusFilter(e.target.value); setEventPage(1) }}
              className="text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-zinc-700 dark:text-zinc-300"
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
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {!selectedTriggerId ? (
          <div className="px-4 py-8 text-center text-xs text-zinc-400">
            위의 트리거 카드를 클릭하면 해당 트리거의 이벤트를 확인할 수 있습니다
          </div>
        ) : isLoading ? (
          <div className="px-4 py-8 text-center text-xs text-zinc-400">로딩 중...</div>
        ) : events.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-zinc-400">이벤트 기록이 없습니다</div>
        ) : (
          events.map(evt => {
            const cfg = EVENT_STATUS_CONFIG[evt.status] || { label: evt.status, variant: 'default' as const }
            const isExpanded = expandedEventId === evt.id
            return (
              <div key={evt.id}>
                <div
                  className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                >
                  <Badge variant={cfg.variant} className="shrink-0 text-[10px]">{cfg.label}</Badge>
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate flex-1">
                    {evt.eventType}
                  </span>
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {formatShortDate(evt.createdAt)}
                  </span>
                  {evt.durationMs != null && (
                    <span className="text-[10px] text-zinc-400 shrink-0">{(evt.durationMs / 1000).toFixed(1)}초</span>
                  )}
                  <span className="text-zinc-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && (
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                    {evt.eventData && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">이벤트 데이터</p>
                        <pre className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(evt.eventData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {evt.result && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase mb-1">실행 결과</p>
                        <pre className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                          {evt.result}
                        </pre>
                      </div>
                    )}
                    {evt.error && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase mb-1">오류</p>
                        <pre className="text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                          {evt.error}
                        </pre>
                      </div>
                    )}
                    {evt.processedAt && (
                      <p className="text-[10px] text-zinc-400">처리 시간: {formatShortDate(evt.processedAt)}</p>
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
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={() => setEventPage(Math.max(1, eventPage - 1))}
            disabled={eventPage <= 1}
            className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 px-2 py-1"
          >
            ← 이전
          </button>
          <span className="text-[10px] text-zinc-400">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setEventPage(Math.min(pagination.totalPages, eventPage + 1))}
            disabled={eventPage >= pagination.totalPages}
            className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 px-2 py-1"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Trigger Modal (Create/Edit) ──

function TriggerModal({
  editing,
  agents,
  onClose,
  onSubmit,
  isPending,
}: {
  editing: ArgosTrigger | null
  agents: Agent[]
  onClose: () => void
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

  // Condition fields (per triggerType)
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

  // Re-initialize when editing changes
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
      case 'price':
      case 'price-above':
      case 'price-below':
        return { ticker, market, operator, value: Number(priceValue) || 0 }
      case 'news': {
        const kw = keywords.split(',').map(k => k.trim()).filter(Boolean)
        return { keywords: kw, matchMode }
      }
      case 'schedule': {
        const cond: Record<string, unknown> = { intervalMinutes: Number(intervalMinutes) || 60 }
        if (activeHoursStart && activeHoursEnd) {
          cond.activeHours = { start: Number(activeHoursStart), end: Number(activeHoursEnd) }
        }
        if (activeDays.length > 0) cond.activeDays = activeDays
        return cond
      }
      case 'market-open':
      case 'market-close':
        return { market }
      case 'custom':
        return { field: customField, operator: customOperator, value: customValue, dataSource: customDataSource || undefined }
      default:
        return {}
    }
  }

  function isValid(): boolean {
    if (!agent || !instruction.trim()) return false
    switch (triggerType) {
      case 'price':
      case 'price-above':
      case 'price-below':
        return !!ticker && !!priceValue && !isNaN(Number(priceValue))
      case 'news':
        return keywords.split(',').filter(k => k.trim()).length > 0
      case 'schedule':
        return !!intervalMinutes && !isNaN(Number(intervalMinutes)) && Number(intervalMinutes) > 0
      case 'market-open':
      case 'market-close':
        return true
      case 'custom':
        return !!customField && !!customValue
      default:
        return false
    }
  }

  function handleSubmit() {
    if (!isValid()) return
    onSubmit({
      name: name.trim() || undefined,
      agentId: agent,
      instruction: instruction.trim(),
      triggerType,
      condition: buildCondition(),
      cooldownMinutes,
    })
  }

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {editing ? '트리거 수정' : 'ARGOS 트리거 추가'}
        </h3>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">트리거 이름 (선택)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 삼성전자 급등 감시"
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Trigger Type */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">트리거 유형</label>
          <div className="grid grid-cols-4 gap-1.5">
            {TRIGGER_TYPES.map(tt => {
              const colors = TRIGGER_TYPE_COLORS[tt.value] || TRIGGER_TYPE_COLORS.custom
              return (
                <button
                  key={tt.value}
                  type="button"
                  onClick={() => setTriggerType(tt.value)}
                  className={`px-2 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                    triggerType === tt.value
                      ? `${colors.bg} ${colors.text} ring-2 ring-indigo-300 dark:ring-indigo-700`
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Condition Form (dynamic per triggerType) */}
        <div className="space-y-3 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase">조건 설정</p>

          {/* Price conditions */}
          {(triggerType === 'price' || triggerType === 'price-above' || triggerType === 'price-below') && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">종목 코드</label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={e => setTicker(e.target.value)}
                    placeholder="005930"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">시장</label>
                  <select
                    value={market}
                    onChange={e => setMarket(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  >
                    <option value="KR">한국 (KR)</option>
                    <option value="US">미국 (US)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">조건</label>
                  <select
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  >
                    <option value="above">이상</option>
                    <option value="below">이하</option>
                    <option value="change_pct_above">% 이상 변동</option>
                    <option value="change_pct_below">% 이하 변동</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">값</label>
                  <input
                    type="number"
                    value={priceValue}
                    onChange={e => setPriceValue(e.target.value)}
                    placeholder="80000"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* News condition */}
          {triggerType === 'news' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">키워드 (쉼표 구분)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="삼성전자, 공시, 실적"
                  className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">매칭 모드</label>
                <div className="flex gap-3">
                  {([['any', '하나 이상 포함'], ['all', '모두 포함']] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="matchMode"
                        checked={matchMode === val}
                        onChange={() => setMatchMode(val)}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule condition */}
          {triggerType === 'schedule' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">수집 간격 (분)</label>
                <input
                  type="number"
                  value={intervalMinutes}
                  onChange={e => setIntervalMinutes(e.target.value)}
                  placeholder="60"
                  min="1"
                  className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">활성 시작 시간 (시, 선택)</label>
                  <input
                    type="number"
                    value={activeHoursStart}
                    onChange={e => setActiveHoursStart(e.target.value)}
                    placeholder="9"
                    min="0"
                    max="23"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">활성 종료 시간 (시, 선택)</label>
                  <input
                    type="number"
                    value={activeHoursEnd}
                    onChange={e => setActiveHoursEnd(e.target.value)}
                    placeholder="18"
                    min="0"
                    max="23"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">활성 요일 (선택)</label>
                <div className="flex gap-2">
                  {DAY_NAMES.map((dayName, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                      className={`w-8 h-8 rounded-full text-[10px] font-medium transition-colors ${
                        activeDays.includes(i)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market open/close */}
          {(triggerType === 'market-open' || triggerType === 'market-close') && (
            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">시장 선택</label>
              <select
                value={market}
                onChange={e => setMarket(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="KR">한국 (KR)</option>
                <option value="US">미국 (US)</option>
              </select>
            </div>
          )}

          {/* Custom condition */}
          {triggerType === 'custom' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">필드</label>
                  <input
                    type="text"
                    value={customField}
                    onChange={e => setCustomField(e.target.value)}
                    placeholder="예: temperature"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">연산자</label>
                  <select
                    value={customOperator}
                    onChange={e => setCustomOperator(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  >
                    <option value="eq">같음 (=)</option>
                    <option value="gt">초과 (&gt;)</option>
                    <option value="lt">미만 (&lt;)</option>
                    <option value="gte">이상 (&gt;=)</option>
                    <option value="lte">이하 (&lt;=)</option>
                    <option value="contains">포함</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">값</label>
                  <input
                    type="text"
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                    placeholder="임계값"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">데이터 소스 (선택)</label>
                  <input
                    type="text"
                    value={customDataSource}
                    onChange={e => setCustomDataSource(e.target.value)}
                    placeholder="API URL"
                    className="w-full px-2 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
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
          <label className="block text-xs font-medium text-zinc-500 mb-1">실행 지시</label>
          <Textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            placeholder="예: 해당 종목의 긴급 분석을 실행하고 보고서를 작성해줘"
            rows={3}
          />
        </div>

        {/* Cooldown */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">쿨다운 (분)</label>
          <input
            type="number"
            value={cooldownMinutes}
            onChange={e => setCooldownMinutes(Number(e.target.value) || 30)}
            min={1}
            max={1440}
            className="w-32 px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          />
          <p className="text-[10px] text-zinc-400 mt-1">같은 트리거가 다시 발동되기까지 대기 시간</p>
        </div>

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
            disabled={!isValid() || isPending}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? '처리 중...' : editing ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}
