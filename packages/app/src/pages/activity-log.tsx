import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useActivityWs } from '../hooks/use-activity-ws'
import { WsStatusIndicator } from '../components/ws-status-indicator'

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

type RuleResult = {
  ruleId: string
  ruleName: string
  category: string
  severity: 'critical' | 'major' | 'minor'
  result: 'pass' | 'warn' | 'fail'
  score?: number
  message?: string
  skipped?: boolean
}

type RubricScore = {
  id: string
  label: string
  weight: number
  critical: boolean
  score: number
  feedback: string
}

type ClaimVerification = {
  claim: { type: string; value: string; context: string; position: number; unit?: string }
  matched: boolean
  verified: boolean
  toolSource?: string
  discrepancy?: string
  confidence: number
  severity: 'critical' | 'minor' | 'none'
}

type HallucinationReport = {
  claims: ClaimVerification[]
  unsourcedClaims: Array<{ type: string; value: string; context: string }>
  verdict: 'clean' | 'warning' | 'critical'
  score: number
  details: string
  totalClaims: number
  verifiedClaims: number
  mismatchedClaims: number
  unsourcedCount: number
}

type MergedScores = {
  conclusionQuality: number
  evidenceSources: number
  riskAssessment: number
  formatCompliance: number
  logicalCoherence: number
  ruleResults?: RuleResult[]
  inspectionConclusion?: 'pass' | 'fail' | 'warning'
  inspectionScore?: number
  inspectionMaxScore?: number
  rubricScores?: RubricScore[]
  hallucinationReport?: HallucinationReport
}

type QualityReview = {
  id: string
  commandId: string | null
  taskId: string | null
  reviewerAgentId: string | null
  reviewerAgentName: string | null
  conclusion: 'pass' | 'fail'
  scores: MergedScores | null
  feedback: string | null
  attemptNumber: number
  commandText: string | null
  createdAt: string
}

type SecurityAlert = {
  id: string
  action: string
  actorType: string
  actorId: string
  targetType: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

type SecurityAlertsData = {
  data: { items: SecurityAlert[]; page: number; limit: number; total: number; count24h: number }
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

const TAB_ITEMS = [
  { value: 'agents', label: '활동' },
  { value: 'delegations', label: '통신' },
  { value: 'quality', label: 'QA' },
  { value: 'tools', label: '도구' },
]

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  completed: { label: '완료', classes: 'bg-emerald-500/20 text-emerald-400' },
  done: { label: '완료', classes: 'bg-emerald-500/20 text-emerald-400' },
  end: { label: '완료', classes: 'bg-emerald-500/20 text-emerald-400' },
  success: { label: '성공', classes: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: '실패', classes: 'bg-red-500/20 text-red-400' },
  error: { label: '오류', classes: 'bg-red-500/20 text-red-400' },
  working: { label: '진행중', classes: 'bg-blue-500/20 text-blue-400' },
  start: { label: '진행중', classes: 'bg-blue-500/20 text-blue-400' },
  running: { label: '진행중', classes: 'bg-blue-500/20 text-blue-400' },
  pass: { label: 'PASS', classes: 'bg-emerald-500/20 text-emerald-400' },
  fail: { label: 'FAIL', classes: 'bg-red-500/20 text-red-400' },
  warning: { label: '경고', classes: 'bg-amber-500/20 text-amber-400' },
  clean: { label: '정상', classes: 'bg-emerald-500/20 text-emerald-400' },
  critical: { label: '위험', classes: 'bg-red-500/20 text-red-400' },
}

const SCORE_LABELS: Record<string, string> = {
  conclusionQuality: '결론 품질',
  evidenceSources: '근거 출처',
  riskAssessment: '리스크 평가',
  formatCompliance: '형식 준수',
  logicalCoherence: '논리 일관성',
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  major: 'bg-amber-500/20 text-amber-400',
  minor: 'bg-slate-600/50 text-slate-400',
}

const RESULT_STYLES: Record<string, string> = {
  pass: 'bg-emerald-500/20 text-emerald-400',
  warn: 'bg-amber-500/20 text-amber-400',
  fail: 'bg-red-500/20 text-red-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  completeness: '완전성',
  accuracy: '정확성',
  safety: '안전성',
}

const SECURITY_ACTION_LABELS: Record<string, string> = {
  'security.input.blocked': '입력 차단',
  'security.output.redacted': '출력 필터링',
  'security.injection.attempt': '인젝션 시도',
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

function scorePercent(score: number | undefined, max: number | undefined): number {
  if (score == null || max == null || max === 0) return 0
  return Math.round((score / max) * 100)
}

function scoreColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreTextColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 60) return 'text-amber-400'
  return 'text-red-400'
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
  const [conclusionFilter, setConclusionFilter] = useState('')
  const [showSecurityAlerts, setShowSecurityAlerts] = useState(false)

  // WebSocket real-time updates
  useActivityWs(tab)

  const debouncedSearch = useDebounce(searchInput, 300)

  const setTab = useCallback((t: string) => {
    setSearchParams({ tab: t }, { replace: true })
    setPage(1)
    setSearchInput('')
    setToolNameFilter('')
    setExpandedQaId(null)
    setConclusionFilter('')
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
    queryKey: ['activity-quality', page, debouncedSearch, startDate, endDate, conclusionFilter],
    queryFn: () => api.get<PaginatedData<QualityReview>>(`/workspace/activity/quality?${buildParams({ conclusion: conclusionFilter })}`),
    enabled: tab === 'quality',
  })

  const toolsQuery = useQuery({
    queryKey: ['activity-tools', page, debouncedSearch, startDate, endDate, toolNameFilter],
    queryFn: () => api.get<PaginatedData<ToolInvocation>>(`/workspace/activity/tools?${buildParams({ toolName: toolNameFilter })}`),
    enabled: tab === 'tools',
  })

  const securityQuery = useQuery({
    queryKey: ['security-alerts', startDate, endDate],
    queryFn: () => api.get<SecurityAlertsData>(`/workspace/activity/security-alerts?${buildParams()}`),
    enabled: tab === 'quality',
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
  const alertCount24h = securityQuery.data?.data?.count24h ?? 0

  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="activity-log-page">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-slate-700 flex items-center justify-between" data-testid="activity-header">
        <h2 className="text-lg font-semibold text-slate-50">통신로그</h2>
        <WsStatusIndicator />
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6 border-b border-slate-700" data-testid="activity-tabs">
        <div className="flex gap-0" role="tablist">
          {TAB_ITEMS.map(item => (
            <button
              key={item.value}
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === item.value
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              data-testid={`tab-${item.value}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Security Alert Banner (QA tab only) */}
      {tab === 'quality' && alertCount24h > 0 && (
        <div
          className="mx-4 md:mx-6 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl cursor-pointer flex items-center justify-between hover:bg-red-500/15 transition-colors"
          onClick={() => setShowSecurityAlerts(!showSecurityAlerts)}
          role="alert"
          data-testid="security-alert-banner"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-400 text-sm font-medium">
              보안 알림: 최근 24시간 {alertCount24h}건 차단
            </span>
          </div>
          <span className="text-xs text-red-500">{showSecurityAlerts ? '접기' : '상세 보기'}</span>
        </div>
      )}

      {/* Security Alerts Detail (collapsible) */}
      {tab === 'quality' && showSecurityAlerts && securityQuery.data?.data?.items && (
        <div className="mx-4 md:mx-6 mb-2 p-3 bg-red-500/5 border border-red-500/20 rounded-b-xl" data-testid="security-alerts-detail">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-red-500/20">
                <th className="text-left py-1 pr-2 font-medium">시간</th>
                <th className="text-left py-1 pr-2 font-medium">유형</th>
                <th className="text-left py-1 pr-2 font-medium">심각도</th>
                <th className="text-left py-1 font-medium">상세</th>
              </tr>
            </thead>
            <tbody>
              {securityQuery.data.data.items.slice(0, 10).map((alert) => {
                const meta = alert.metadata as Record<string, unknown> | null
                return (
                  <tr key={alert.id} className="border-b border-red-500/10">
                    <td className="py-1.5 pr-2 text-slate-500 whitespace-nowrap">{formatTime(alert.createdAt)}</td>
                    <td className="py-1.5 pr-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400">
                        {SECURITY_ACTION_LABELS[alert.action] || alert.action}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEVERITY_STYLES[(meta?.severity as string) || 'major']}`}>
                        {(meta?.severity as string) || 'major'}
                      </span>
                    </td>
                    <td className="py-1.5 text-slate-400 truncate max-w-[300px]">
                      {(meta?.pattern as string) || (meta?.threatType as string) || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 md:px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-2 items-center" data-testid="activity-filters">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="검색..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
            className="bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 outline-none w-40 md:w-48 transition-colors"
            data-testid="search-input"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none focus:border-blue-500"
          data-testid="date-start"
        />
        <span className="text-xs text-slate-500">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none focus:border-blue-500"
          data-testid="date-end"
        />
        {tab === 'tools' && (
          <div className="relative">
            <input
              placeholder="도구명 필터..."
              value={toolNameFilter}
              onChange={(e) => { setToolNameFilter(e.target.value); setPage(1) }}
              className="bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 outline-none w-32 md:w-40 transition-colors"
              data-testid="tool-name-filter"
            />
          </div>
        )}
        {tab === 'quality' && (
          <select
            value={conclusionFilter}
            onChange={(e) => { setConclusionFilter(e.target.value); setPage(1) }}
            className="text-xs h-8 px-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-300 outline-none focus:border-blue-500"
            data-testid="conclusion-filter"
          >
            <option value="">전체 판정</option>
            <option value="pass">PASS</option>
            <option value="fail">FAIL</option>
          </select>
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-4 md:px-6 py-3" data-testid="activity-content">
        {activeQuery.isLoading ? (
          <div className="space-y-2" data-testid="activity-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        ) : !activeQuery.data?.data?.items?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="activity-empty">
            <svg className="w-10 h-10 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-base font-medium text-slate-300 mb-2">데이터가 없습니다</h3>
            <p className="text-sm text-slate-500">선택한 기간에 해당하는 기록이 없습니다</p>
          </div>
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
        <div className="px-4 md:px-6 py-3 border-t border-slate-700 flex items-center justify-between" data-testid="activity-pagination">
          <span className="text-xs text-slate-500">{totalCount.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-700 transition-colors"
            >
              이전
            </button>
            <span className="text-xs text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-700 transition-colors"
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
  const info = STATUS_BADGE[status] || { label: status, classes: 'bg-slate-600/50 text-slate-400' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${info.classes}`}>
      {info.label}
    </span>
  )
}

function AgentsTable({ items }: { items: AgentActivity[] }) {
  return (
    <div className="overflow-x-auto" data-testid="agents-table">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-700">
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
            <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium text-slate-200">{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs text-slate-300 truncate max-w-[200px]">{item.action}</td>
              <td className="py-2.5 pr-3"><StatusBadge status={item.phase} /></td>
              <td className="py-2.5 pr-3 text-xs text-right text-slate-500">
                {formatDuration((item.metadata as Record<string, unknown>)?.durationMs as number | undefined)}
              </td>
              <td className="py-2.5 text-xs text-right text-slate-500">{formatTokens(item.metadata)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DelegationsTable({ items }: { items: Delegation[] }) {
  return (
    <div className="overflow-x-auto" data-testid="delegations-table">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-700">
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
              <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
                <td className="py-2.5 pr-3 text-xs">
                  <span className="font-medium text-slate-200">{item.agentName || '시스템'}</span>
                  <span className="text-slate-500 mx-1">→</span>
                  <span className="font-medium text-cyan-400">{(meta?.toAgentName as string) || '-'}</span>
                </td>
                <td className="py-2.5 pr-3 text-xs text-slate-300 truncate max-w-[240px]">
                  {item.input ? String(item.input).slice(0, 80) : '-'}
                </td>
                <td className="py-2.5 pr-3 text-xs text-right text-slate-500">
                  {cost != null ? `$${Number(cost).toFixed(4)}` : '-'}
                </td>
                <td className="py-2.5 text-xs text-right text-slate-500">
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

// === Enhanced Quality Table ===

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
    <div className="overflow-x-auto" data-testid="quality-table">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-700">
            <th className="text-left py-2 pr-3 font-medium">시간</th>
            <th className="text-left py-2 pr-3 font-medium">명령</th>
            <th className="text-left py-2 pr-3 font-medium">검수 점수</th>
            <th className="text-left py-2 pr-3 font-medium">판정</th>
            <th className="text-right py-2 font-medium">재작업</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const scores = item.scores
            const hasInspection = scores?.inspectionScore != null
            const pct = hasInspection
              ? scorePercent(scores!.inspectionScore!, scores!.inspectionMaxScore!)
              : null

            return (
              <tr key={item.id} className="group">
                <td colSpan={5} className="p-0">
                  {/* Row header */}
                  <div
                    className="flex items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => onToggle(item.id)}
                    aria-expanded={expandedId === item.id}
                  >
                    <div className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap pl-0 min-w-[90px]">{formatTime(item.createdAt)}</div>
                    <div className="py-2.5 pr-3 text-xs text-slate-300 truncate max-w-[200px] flex-1">{item.commandText || '-'}</div>
                    <div className="py-2.5 pr-3 min-w-[120px]">
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreColor(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${scoreTextColor(pct)}`}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </div>
                    <div className="py-2.5 pr-3 min-w-[60px]"><StatusBadge status={item.conclusion} /></div>
                    <div className="py-2.5 text-xs text-right min-w-[50px] text-slate-400">{item.attemptNumber > 1 ? item.attemptNumber - 1 : 0}</div>
                  </div>

                  {/* Expanded detail panel */}
                  {expandedId === item.id && scores && (
                    <QualityDetailPanel scores={scores} feedback={item.feedback} />
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

// === Quality Detail Panel (expanded view) ===

function QualityDetailPanel({ scores, feedback }: { scores: MergedScores; feedback: string | null }) {
  const [detailTab, setDetailTab] = useState<'rules' | 'rubric' | 'hallucination' | 'legacy'>('rules')
  const hasRules = scores.ruleResults && scores.ruleResults.length > 0
  const hasRubric = scores.rubricScores && scores.rubricScores.length > 0
  const hasHallucination = scores.hallucinationReport != null

  return (
    <div className="bg-slate-800/30 border-b border-slate-700" data-testid="qa-detail-panel">
      {/* Sub-tabs */}
      <div className="px-4 pt-2 flex gap-1 border-b border-slate-700">
        <DetailTabButton active={detailTab === 'rules'} onClick={() => setDetailTab('rules')}>
          규칙별 결과 {hasRules ? `(${scores.ruleResults!.length})` : ''}
        </DetailTabButton>
        {hasRubric && (
          <DetailTabButton active={detailTab === 'rubric'} onClick={() => setDetailTab('rubric')}>
            루브릭
          </DetailTabButton>
        )}
        {hasHallucination && (
          <DetailTabButton active={detailTab === 'hallucination'} onClick={() => setDetailTab('hallucination')}>
            환각 보고서
          </DetailTabButton>
        )}
        <DetailTabButton active={detailTab === 'legacy'} onClick={() => setDetailTab('legacy')}>
          기존 점수
        </DetailTabButton>
      </div>

      <div className="px-4 py-3">
        {detailTab === 'rules' && <RuleResultsPanel ruleResults={scores.ruleResults || []} />}
        {detailTab === 'rubric' && hasRubric && <RubricPanel rubricScores={scores.rubricScores!} />}
        {detailTab === 'hallucination' && hasHallucination && <HallucinationPanel report={scores.hallucinationReport!} />}
        {detailTab === 'legacy' && <LegacyScoresPanel scores={scores} />}
      </div>

      {feedback && (
        <div className="px-4 pb-3">
          <p className="text-[11px] text-slate-400 whitespace-pre-wrap border-t border-slate-700 pt-2">
            {feedback}
          </p>
        </div>
      )}
    </div>
  )
}

function DetailTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] font-medium rounded-t border-b-2 transition-colors ${
        active
          ? 'border-blue-500 text-blue-400 bg-slate-800'
          : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

// === Rule Results Panel ===

function RuleResultsPanel({ ruleResults }: { ruleResults: RuleResult[] }) {
  if (ruleResults.length === 0) {
    return <p className="text-xs text-slate-500">규칙별 검수 데이터가 없습니다.</p>
  }

  // Group by category
  const grouped = ruleResults.reduce<Record<string, RuleResult[]>>((acc, r) => {
    const cat = r.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([category, rules]) => (
        <div key={category}>
          <h4 className="text-[11px] font-semibold text-slate-300 mb-1.5">
            {CATEGORY_LABELS[category] || category}
          </h4>
          <div className="space-y-1">
            {rules.map((rule) => (
              <div key={rule.ruleId} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-slate-900/50">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${SEVERITY_STYLES[rule.severity] || SEVERITY_STYLES.minor}`}>
                  {rule.severity}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${RESULT_STYLES[rule.result] || ''}`}>
                  {rule.result === 'pass' ? 'PASS' : rule.result === 'warn' ? 'WARN' : 'FAIL'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-300">{rule.ruleName}</span>
                  {rule.message && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{rule.message}</p>
                  )}
                </div>
                {rule.skipped && <span className="text-[10px] text-slate-500 italic shrink-0">건너뜀</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// === Rubric Panel ===

function RubricPanel({ rubricScores }: { rubricScores: RubricScore[] }) {
  return (
    <div className="space-y-2">
      {rubricScores.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-900/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">{item.label}</span>
              <span className="text-[10px] text-slate-500">(가중치 {item.weight}%{item.critical ? ', 필수' : ''})</span>
            </div>
            {item.feedback && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.feedback}</p>
            )}
          </div>
          <span className={`text-sm font-bold ${item.score >= 4 ? 'text-emerald-400' : item.score >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
            {item.score}/5
          </span>
        </div>
      ))}
    </div>
  )
}

// === Hallucination Report Panel ===

function HallucinationPanel({ report }: { report: HallucinationReport }) {
  const [showAll, setShowAll] = useState(false)

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={report.verdict} />
        <div className="flex gap-4 text-xs">
          <span className="text-slate-500">총 주장: <span className="font-medium text-slate-200">{report.totalClaims}</span></span>
          <span className="text-slate-500">검증: <span className="font-medium text-emerald-400">{report.verifiedClaims}</span></span>
          <span className="text-slate-500">불일치: <span className="font-medium text-red-400">{report.mismatchedClaims}</span></span>
          <span className="text-slate-500">미확인: <span className="font-medium text-amber-400">{report.unsourcedCount}</span></span>
        </div>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 w-16">환각 점수</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${scoreColor(Math.round(report.score * 100))}`}
            style={{ width: `${Math.round(report.score * 100)}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${scoreTextColor(Math.round(report.score * 100))}`}>
          {Math.round(report.score * 100)}%
        </span>
      </div>

      {/* Details */}
      {report.details && (
        <p className="text-[10px] text-slate-400">{report.details}</p>
      )}

      {/* Claims list */}
      {report.claims.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500">주장별 검증 결과</span>
            {report.claims.length > 5 && (
              <button onClick={() => setShowAll(!showAll)} className="text-[10px] text-blue-400 hover:underline">
                {showAll ? '일부만 보기' : `전체 보기 (${report.claims.length})`}
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(showAll ? report.claims : report.claims.filter(c => !c.verified || c.severity !== 'none').slice(0, 5)).map((cv, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1 rounded-lg bg-slate-900/50 text-[10px]">
                <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                  cv.verified ? 'bg-emerald-500' : cv.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-300 font-medium">{cv.claim.value}</span>
                  <span className="text-slate-500 ml-1">({cv.claim.type})</span>
                  {cv.toolSource && <span className="text-blue-400 ml-1">via {cv.toolSource}</span>}
                  {cv.discrepancy && <p className="text-red-400 mt-0.5">{cv.discrepancy}</p>}
                </div>
                <span className={`shrink-0 px-1 py-0.5 rounded ${
                  cv.verified ? 'bg-emerald-500/20 text-emerald-400'
                  : cv.matched ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-600/50 text-slate-400'
                }`}>
                  {cv.verified ? '검증' : cv.matched ? '불일치' : '미확인'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// === Legacy Scores Panel (existing 5-criteria) ===

function LegacyScoresPanel({ scores }: { scores: MergedScores }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Object.entries(SCORE_LABELS).map(([key, label]) => {
        const score = (scores as unknown as Record<string, number>)[key] ?? 0
        return (
          <div key={key} className="text-center">
            <p className="text-[10px] text-slate-500 mb-1">{label}</p>
            <p className={`text-sm font-bold ${score >= 4 ? 'text-emerald-400' : score >= 3 ? 'text-amber-400' : 'text-red-400'}`}>
              {score}/5
            </p>
          </div>
        )
      })}
    </div>
  )
}

function ToolsTable({ items }: { items: ToolInvocation[] }) {
  return (
    <div className="overflow-x-auto" data-testid="tools-table">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-700">
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
            <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium font-mono text-cyan-400">{item.toolName}</td>
              <td className="py-2.5 pr-3 text-xs text-slate-300">{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs text-right text-slate-500">{formatDuration(item.durationMs)}</td>
              <td className="py-2.5 pr-3"><StatusBadge status={item.status} /></td>
              <td className="py-2.5 text-xs truncate max-w-[200px] text-slate-500">{item.input || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
