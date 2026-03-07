import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useActivityWs } from '../hooks/use-activity-ws'
import { WsStatusIndicator } from '../components/ws-status-indicator'
import { Tabs, Badge, Input, SkeletonTable, EmptyState } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'

// === Types (matching server response) ===

type PaginatedData<T> = {
  data: { items: T[]; page: number; limit: number; total: number }
}

type AgentActivity = {
  id: string
  agentId: string | null
  agentName: string | null
  type: string
  action: string
  detail: string | null
  phase: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

type Delegation = {
  id: string
  commandId: string | null
  agentId: string | null
  agentName: string | null
  parentTaskId: string | null
  type: string
  input: string | null
  output: string | null
  status: string
  durationMs: number | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

type QualityReview = {
  id: string
  commandId: string | null
  taskId: string | null
  reviewerAgentId: string | null
  reviewerAgentName: string | null
  conclusion: 'pass' | 'fail'
  scores: {
    conclusionQuality: number
    evidenceSources: number
    riskAssessment: number
    formatCompliance: number
    logicalCoherence: number
  } | null
  feedback: string | null
  attemptNumber: number
  commandText: string | null
  createdAt: string
}

type ToolInvocation = {
  id: string
  agentId: string | null
  agentName: string | null
  toolName: string
  input: string | null
  output: string | null
  status: string
  durationMs: number | null
  createdAt: string
}

// === Constants ===

const TAB_ITEMS: TabItem[] = [
  { value: 'agents', label: '활동' },
  { value: 'delegations', label: '통신' },
  { value: 'quality', label: 'QA' },
  { value: 'tools', label: '도구' },
]

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'error' | 'info' | 'warning' | 'default' }> = {
  completed: { label: '완료', variant: 'success' },
  done: { label: '완료', variant: 'success' },
  end: { label: '완료', variant: 'success' },
  success: { label: '성공', variant: 'success' },
  failed: { label: '실패', variant: 'error' },
  error: { label: '오류', variant: 'error' },
  working: { label: '진행중', variant: 'info' },
  start: { label: '진행중', variant: 'info' },
  running: { label: '진행중', variant: 'info' },
  pass: { label: 'PASS', variant: 'success' },
  fail: { label: 'FAIL', variant: 'error' },
}

const SCORE_LABELS: Record<string, string> = {
  conclusionQuality: '결론 품질',
  evidenceSources: '근거 출처',
  riskAssessment: '리스크 평가',
  formatCompliance: '형식 준수',
  logicalCoherence: '논리 일관성',
}

const PAGE_SIZE = 20

// === Helpers ===

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(ms: number | null | undefined) {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTokens(metadata: Record<string, unknown> | null) {
  if (!metadata) return '-'
  const usage = metadata.tokenUsage as { inputTokens?: number; outputTokens?: number } | undefined
  if (!usage) return '-'
  const total = (usage.inputTokens || 0) + (usage.outputTokens || 0)
  return total > 0 ? total.toLocaleString() : '-'
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// === Main Page ===

export function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'agents'
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [toolNameFilter, setToolNameFilter] = useState('')
  const [expandedQaId, setExpandedQaId] = useState<string | null>(null)

  // Reset page when filters change
  // WebSocket real-time updates
  useActivityWs(tab)

  const debouncedSearch = useDebounce(searchInput, 300)

  const setTab = useCallback((t: string) => {
    setSearchParams({ tab: t }, { replace: true })
    setPage(1)
    setSearchInput('')
    setToolNameFilter('')
    setExpandedQaId(null)
  }, [setSearchParams])

  // Build query params
  const buildParams = useCallback((extra?: Record<string, string>) => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v) params.set(k, v)
      }
    }
    return params.toString()
  }, [page, debouncedSearch, startDate, endDate])

  // Queries
  const agentsQuery = useQuery({
    queryKey: ['activity-agents', page, debouncedSearch, startDate, endDate],
    queryFn: () => api.get<PaginatedData<AgentActivity>>(`/workspace/activity/agents?${buildParams()}`),
    enabled: tab === 'agents',
  })

  const delegationsQuery = useQuery({
    queryKey: ['activity-delegations', page, debouncedSearch, startDate, endDate],
    queryFn: () => api.get<PaginatedData<Delegation>>(`/workspace/activity/delegations?${buildParams()}`),
    enabled: tab === 'delegations',
  })

  const qualityQuery = useQuery({
    queryKey: ['activity-quality', page, debouncedSearch, startDate, endDate],
    queryFn: () => api.get<PaginatedData<QualityReview>>(`/workspace/activity/quality?${buildParams()}`),
    enabled: tab === 'quality',
  })

  const toolsQuery = useQuery({
    queryKey: ['activity-tools', page, debouncedSearch, startDate, endDate, toolNameFilter],
    queryFn: () => api.get<PaginatedData<ToolInvocation>>(`/workspace/activity/tools?${buildParams({ toolName: toolNameFilter })}`),
    enabled: tab === 'tools',
  })

  const activeQuery = tab === 'agents' ? agentsQuery
    : tab === 'delegations' ? delegationsQuery
    : tab === 'quality' ? qualityQuery
    : toolsQuery

  const totalPages = useMemo(() => {
    const total = activeQuery.data?.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [activeQuery.data])

  const totalCount = activeQuery.data?.data?.total ?? 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">통신로그</h2>
        <WsStatusIndicator />
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6">
        <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} />
      </div>

      {/* Filters */}
      <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
        <Input
          placeholder="검색..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
          className="text-xs h-8 w-40 md:w-48"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        />
        <span className="text-xs text-zinc-400">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        />
        {tab === 'tools' && (
          <Input
            placeholder="도구명 필터..."
            value={toolNameFilter}
            onChange={(e) => { setToolNameFilter(e.target.value); setPage(1) }}
            className="text-xs h-8 w-32 md:w-40"
          />
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 py-3">
        {activeQuery.isLoading ? (
          <SkeletonTable rows={8} />
        ) : !activeQuery.data?.data?.items?.length ? (
          <EmptyState
            icon={<span className="text-3xl">📋</span>}
            title="데이터가 없습니다"
            description="선택한 기간에 해당하는 기록이 없습니다."
          />
        ) : (
          <>
            {tab === 'agents' && <AgentsTable items={agentsQuery.data!.data.items} />}
            {tab === 'delegations' && <DelegationsTable items={delegationsQuery.data!.data.items} />}
            {tab === 'quality' && (
              <QualityTable
                items={qualityQuery.data!.data.items}
                expandedId={expandedQaId}
                onToggle={(id) => setExpandedQaId(expandedQaId === id ? null : id)}
              />
            )}
            {tab === 'tools' && <ToolsTable items={toolsQuery.data!.data.items} />}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="px-4 md:px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{totalCount.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              이전
            </button>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// === Tab Tables ===

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_BADGE[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant}>{info.label}</Badge>
}

function AgentsTable({ items }: { items: AgentActivity[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
            <th className="text-left py-2 pr-3 font-medium">시간</th>
            <th className="text-left py-2 pr-3 font-medium">에이전트</th>
            <th className="text-left py-2 pr-3 font-medium">명령</th>
            <th className="text-left py-2 pr-3 font-medium">상태</th>
            <th className="text-right py-2 pr-3 font-medium">소요시간</th>
            <th className="text-right py-2 font-medium">토큰</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium">{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs truncate max-w-[200px]">{item.action}</td>
              <td className="py-2.5 pr-3"><StatusBadge status={item.phase} /></td>
              <td className="py-2.5 pr-3 text-xs text-right text-zinc-500">
                {formatDuration((item.metadata as Record<string, unknown>)?.durationMs as number | undefined)}
              </td>
              <td className="py-2.5 text-xs text-right text-zinc-500">{formatTokens(item.metadata)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DelegationsTable({ items }: { items: Delegation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
            <th className="text-left py-2 pr-3 font-medium">시간</th>
            <th className="text-left py-2 pr-3 font-medium">발신 → 수신</th>
            <th className="text-left py-2 pr-3 font-medium">명령 요약</th>
            <th className="text-right py-2 pr-3 font-medium">비용</th>
            <th className="text-right py-2 font-medium">토큰</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const meta = item.metadata as Record<string, unknown> | null
            const cost = meta?.costUsd as number | undefined
            const tokens = meta?.totalTokens as number | undefined
            return (
              <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
                <td className="py-2.5 pr-3 text-xs">
                  <span className="font-medium">{item.agentName || '시스템'}</span>
                  <span className="text-zinc-400 mx-1">→</span>
                  <span className="font-medium">{(meta?.toAgentName as string) || '-'}</span>
                </td>
                <td className="py-2.5 pr-3 text-xs truncate max-w-[240px]">
                  {item.input ? String(item.input).slice(0, 80) : '-'}
                </td>
                <td className="py-2.5 pr-3 text-xs text-right text-zinc-500">
                  {cost != null ? `$${Number(cost).toFixed(4)}` : '-'}
                </td>
                <td className="py-2.5 text-xs text-right text-zinc-500">
                  {tokens != null ? Number(tokens).toLocaleString() : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function QualityTable({
  items,
  expandedId,
  onToggle,
}: {
  items: QualityReview[]
  expandedId: string | null
  onToggle: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
            <th className="text-left py-2 pr-3 font-medium">시간</th>
            <th className="text-left py-2 pr-3 font-medium">명령</th>
            <th className="text-right py-2 pr-3 font-medium">총점</th>
            <th className="text-left py-2 pr-3 font-medium">판정</th>
            <th className="text-right py-2 font-medium">재작업</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const totalScore = item.scores
              ? Object.values(item.scores).reduce((a, b) => a + b, 0)
              : null
            return (
              <tr key={item.id} className="group">
                <td colSpan={5} className="p-0">
                  <div
                    className="flex items-center border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                    onClick={() => onToggle(item.id)}
                  >
                    <div className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap pl-0 min-w-[90px]">{formatTime(item.createdAt)}</div>
                    <div className="py-2.5 pr-3 text-xs truncate max-w-[200px] flex-1">{item.commandText || '-'}</div>
                    <div className="py-2.5 pr-3 text-xs text-right min-w-[50px]">
                      {totalScore != null ? `${totalScore}/25` : '-'}
                    </div>
                    <div className="py-2.5 pr-3 min-w-[60px]"><StatusBadge status={item.conclusion} /></div>
                    <div className="py-2.5 text-xs text-right min-w-[50px]">{item.attemptNumber > 1 ? item.attemptNumber - 1 : 0}</div>
                  </div>

                  {/* Expanded: 5-criteria scores */}
                  {expandedId === item.id && item.scores && (
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="grid grid-cols-5 gap-3">
                        {Object.entries(SCORE_LABELS).map(([key, label]) => {
                          const score = (item.scores as Record<string, number>)?.[key] ?? 0
                          return (
                            <div key={key} className="text-center">
                              <p className="text-[10px] text-zinc-500 mb-1">{label}</p>
                              <p className={`text-sm font-bold ${score >= 4 ? 'text-emerald-600 dark:text-emerald-400' : score >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                {score}/5
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      {item.feedback && (
                        <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{item.feedback}</p>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ToolsTable({ items }: { items: ToolInvocation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
            <th className="text-left py-2 pr-3 font-medium">시간</th>
            <th className="text-left py-2 pr-3 font-medium">도구명</th>
            <th className="text-left py-2 pr-3 font-medium">에이전트</th>
            <th className="text-right py-2 pr-3 font-medium">소요시간</th>
            <th className="text-left py-2 pr-3 font-medium">상태</th>
            <th className="text-left py-2 font-medium">Input 요약</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium font-mono">{item.toolName}</td>
              <td className="py-2.5 pr-3 text-xs">{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs text-right text-zinc-500">{formatDuration(item.durationMs)}</td>
              <td className="py-2.5 pr-3"><StatusBadge status={item.status} /></td>
              <td className="py-2.5 text-xs truncate max-w-[200px] text-zinc-500">{item.input || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
