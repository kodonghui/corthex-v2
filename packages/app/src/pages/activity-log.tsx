// API Endpoints:
// GET /workspace/activity/agents?page=&limit=&search=&startDate=&endDate=
// GET /workspace/activity/delegations?page=&limit=&search=&startDate=&endDate=
// GET /workspace/activity/quality?page=&limit=&search=&startDate=&endDate=&conclusion=
// GET /workspace/activity/tools?page=&limit=&search=&startDate=&endDate=&toolName=
// GET /workspace/activity/security-alerts?page=&limit=&startDate=&endDate=

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, FileText, ArrowRight, CheckCircle, XCircle, AlertTriangle, Info, Download, RefreshCw } from 'lucide-react'
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
  { value: 'agents', label: 'Activity' },
  { value: 'delegations', label: 'Delegation' },
  { value: 'quality', label: 'QA Reviews' },
  { value: 'tools', label: 'Tools' },
]

const STATUS_BADGE: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string; borderColor: string }> = {
  completed: { label: 'Success', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  done: { label: 'Success', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  end: { label: 'Success', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  success: { label: 'Success', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  failed: { label: 'Critical', dotColor: '#dc2626', bgColor: 'rgba(220,38,38,0.08)', textColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' },
  error: { label: 'Critical', dotColor: '#dc2626', bgColor: 'rgba(220,38,38,0.08)', textColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' },
  working: { label: 'Info', dotColor: '#2563eb', bgColor: 'rgba(37,99,235,0.08)', textColor: '#2563eb', borderColor: 'rgba(37,99,235,0.2)' },
  start: { label: 'Info', dotColor: '#2563eb', bgColor: 'rgba(37,99,235,0.08)', textColor: '#2563eb', borderColor: 'rgba(37,99,235,0.2)' },
  running: { label: 'Info', dotColor: '#2563eb', bgColor: 'rgba(37,99,235,0.08)', textColor: '#2563eb', borderColor: 'rgba(37,99,235,0.2)' },
  pass: { label: 'PASS', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  fail: { label: 'FAIL', dotColor: '#dc2626', bgColor: 'rgba(220,38,38,0.08)', textColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' },
  warning: { label: 'Neutral', dotColor: '#b45309', bgColor: 'rgba(180,83,9,0.08)', textColor: '#b45309', borderColor: 'rgba(180,83,9,0.2)' },
  clean: { label: 'Clean', dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)' },
  critical: { label: 'Critical', dotColor: '#dc2626', bgColor: 'rgba(220,38,38,0.08)', textColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' },
}

const SCORE_LABELS: Record<string, string> = {
  conclusionQuality: '결론 품질',
  evidenceSources: '근거 출처',
  riskAssessment: '리스크 평가',
  formatCompliance: '형식 준수',
  logicalCoherence: '논리 일관성',
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(220,38,38,0.12)', text: '#dc2626' },
  major: { bg: 'rgba(180,83,9,0.12)', text: '#b45309' },
  minor: { bg: 'rgba(117,110,90,0.15)', text: 'var(--color-corthex-text-secondary)' },
}

const RESULT_STYLES: Record<string, { bg: string; text: string }> = {
  pass: { bg: 'rgba(77,124,15,0.12)', text: '#4d7c0f' },
  warn: { bg: 'rgba(180,83,9,0.12)', text: '#b45309' },
  fail: { bg: 'rgba(220,38,38,0.12)', text: '#dc2626' },
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
  if (pct >= 80) return '#4d7c0f'
  if (pct >= 60) return '#b45309'
  return '#dc2626'
}

// === Status Badge ===

function StatusBadgeEl({ status }: { status: string }) {
  const info = STATUS_BADGE[status] || { label: status, dotColor: 'var(--color-corthex-text-secondary)', bgColor: 'rgba(117,110,90,0.1)', textColor: 'var(--color-corthex-text-secondary)', borderColor: 'rgba(117,110,90,0.2)' }
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-tighter"
      style={{ backgroundColor: info.bgColor, color: info.textColor, border: `1px solid ${info.borderColor}` }}
    >
      {info.label}
    </span>
  )
}

// === Phase dot color mapping ===

function phaseDotColor(phase: string): string {
  if (['completed', 'done', 'end', 'success'].includes(phase)) return '#4d7c0f'
  if (['failed', 'error'].includes(phase)) return '#dc2626'
  if (['working', 'start', 'running'].includes(phase)) return '#2563eb'
  if (phase === 'warning') return '#b45309'
  return 'var(--color-corthex-text-secondary)'
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
    <div className="flex-1 flex flex-col bg-corthex-bg overflow-hidden" data-testid="activity-log-page">
      <main className="flex flex-col flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-corthex-text-primary tracking-tighter uppercase mb-1">Activity Log</h2>
                <p className="text-corthex-text-secondary font-medium">Real-time system event monitoring and audit trails.</p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button className="min-h-[44px] px-4 py-2 bg-corthex-elevated border border-corthex-border text-corthex-text-secondary text-sm font-semibold rounded flex items-center gap-2 hover:bg-corthex-surface transition-colors">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <div className="min-h-[44px] px-4 py-2 bg-corthex-accent text-white text-sm font-bold rounded flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <WsStatusIndicator />
                  Live Update
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-corthex-surface border border-corthex-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-corthex-text-secondary tracking-wider">Date Range</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
                  className="bg-corthex-bg border border-corthex-border px-3 py-2 rounded text-base sm:text-sm text-corthex-text-primary min-h-[44px]"
                />
                <span className="text-corthex-text-secondary text-xs hidden sm:inline">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
                  className="bg-corthex-bg border border-corthex-border px-3 py-2 rounded text-base sm:text-sm text-corthex-text-primary min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-corthex-text-secondary tracking-wider">Agent Selector</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-corthex-text-secondary" />
                <input
                  className="bg-corthex-bg border border-corthex-border pl-8 pr-3 py-2 rounded text-base sm:text-sm text-corthex-text-primary w-full sm:w-44 min-h-[44px]"
                  placeholder="All Agents"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                  data-testid="search-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-corthex-text-secondary tracking-wider">Action Type</label>
              <div className="flex p-1 bg-corthex-bg border border-corthex-border rounded">
                {TAB_ITEMS.map(item => (
                  <button
                    key={item.value}
                    onClick={() => setTab(item.value)}
                    className="min-h-[44px] px-4 py-1.5 rounded text-xs font-bold transition-colors"
                    style={tab === item.value
                      ? { backgroundColor: 'var(--color-corthex-surface)', color: 'var(--color-corthex-accent)' }
                      : { color: 'var(--color-corthex-text-secondary)' }
                    }
                    data-testid={`tab-${item.value}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'quality' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-corthex-text-secondary tracking-wider">Conclusion</label>
                <select
                  value={conclusionFilter}
                  onChange={(e) => { setConclusionFilter(e.target.value); setPage(1) }}
                  className="bg-corthex-bg border border-corthex-border px-3 py-2 rounded text-base sm:text-sm text-corthex-text-primary min-h-[44px]"
                  data-testid="conclusion-filter"
                >
                  <option value="">All</option>
                  <option value="pass">PASS</option>
                  <option value="fail">FAIL</option>
                </select>
              </div>
            )}

            {tab === 'tools' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-corthex-text-secondary tracking-wider">Tool Name</label>
                <input
                  placeholder="Filter by tool..."
                  value={toolNameFilter}
                  onChange={(e) => { setToolNameFilter(e.target.value); setPage(1) }}
                  className="bg-corthex-bg border border-corthex-border px-3 py-2 rounded text-base sm:text-sm text-corthex-text-primary min-h-[44px]"
                  data-testid="tool-name-filter"
                />
              </div>
            )}

            <div className="ml-auto">
              <button
                onClick={() => { setSearchInput(''); setStartDate(''); setEndDate(''); setToolNameFilter(''); setConclusionFilter(''); setPage(1) }}
                className="text-xs font-bold text-corthex-accent hover:opacity-70 underline underline-offset-4"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Security Alert Banner (QA tab only) */}
          {tab === 'quality' && alertCount24h > 0 && (
            <div
              className="mb-4 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
              style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}
              onClick={() => setShowSecurityAlerts(!showSecurityAlerts)}
              role="alert"
              data-testid="security-alert-banner"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#dc2626' }} />
                <span className="text-sm font-medium" style={{ color: '#dc2626' }}>
                  보안 알림: 최근 24시간 {alertCount24h}건 차단
                </span>
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: '#dc2626' }} />
            </div>
          )}

          {/* Security Alerts Detail */}
          {tab === 'quality' && showSecurityAlerts && securityQuery.data?.data?.items && (
            <div className="mb-4 p-3 rounded-lg bg-corthex-elevated border border-corthex-border" data-testid="security-alerts-detail">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-corthex-text-secondary border-b border-corthex-border">
                    <th className="text-left py-1 pr-2 font-medium">시간</th>
                    <th className="text-left py-1 pr-2 font-medium">유형</th>
                    <th className="text-left py-1 pr-2 font-medium">심각도</th>
                    <th className="text-left py-1 font-medium">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {securityQuery.data.data.items.slice(0, 10).map((alert) => {
                    const meta = alert.metadata as Record<string, unknown> | null
                    const sevStyle = SEVERITY_STYLES[(meta?.severity as string) || 'major'] || SEVERITY_STYLES.major
                    return (
                      <tr key={alert.id} className="border-b border-corthex-border">
                        <td className="py-1.5 pr-2 whitespace-nowrap font-mono text-corthex-text-secondary">{formatTime(alert.createdAt)}</td>
                        <td className="py-1.5 pr-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>
                            {SECURITY_ACTION_LABELS[alert.action] || alert.action}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: sevStyle.bg, color: sevStyle.text }}>
                            {(meta?.severity as string) || 'major'}
                          </span>
                        </td>
                        <td className="py-1.5 truncate max-w-[300px] text-corthex-text-secondary">
                          {(meta?.pattern as string) || (meta?.threatType as string) || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-corthex-surface border border-corthex-border rounded-lg overflow-hidden">
            {tab === 'agents' && (
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-corthex-border bg-corthex-elevated">
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest">Agent</th>
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest">Action Verb</th>
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest">Target Resource</th>
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-corthex-text-secondary uppercase tracking-widest text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-corthex-border" data-purpose="activity-timeline">
                  {activeQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-4 rounded animate-pulse bg-corthex-elevated" />
                        </td>
                      </tr>
                    ))
                  ) : !agentsQuery.data?.data?.items?.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center" data-testid="activity-empty">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-corthex-text-secondary opacity-50" />
                        <p className="text-sm text-corthex-text-secondary">데이터가 없습니다</p>
                      </td>
                    </tr>
                  ) : (
                    agentsQuery.data.data.items.map(item => (
                      <tr key={item.id} className="hover:bg-corthex-elevated transition-colors group" data-purpose="event-card">
                        <td className="px-6 py-4 font-mono text-xs text-corthex-text-secondary whitespace-nowrap">
                          {new Date(item.createdAt).toISOString().replace('T', ' ').slice(0, 23)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-corthex-elevated flex items-center justify-center text-[10px] font-bold text-corthex-accent border border-corthex-border">
                              {(item.agentName || 'S')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-corthex-text-primary">{item.agentName || 'System'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-corthex-accent tracking-wider uppercase">{item.action}</span>
                        </td>
                        <td className="px-6 py-4">
                          {item.detail && (
                            <span className="px-2 py-1 bg-corthex-elevated border border-corthex-border text-corthex-text-secondary text-[10px] font-mono rounded">
                              {String(item.detail).slice(0, 40)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadgeEl status={item.phase} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ArrowRight className="w-4 h-4 text-corthex-text-secondary group-hover:text-corthex-accent transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            )}

            {tab === 'delegations' && (
              <div className="p-6" data-purpose="activity-timeline">
                {activeQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-xl animate-pulse bg-corthex-elevated" />
                    ))}
                  </div>
                ) : !delegationsQuery.data?.data?.items?.length ? (
                  <div className="py-12 text-center" data-testid="activity-empty">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-corthex-text-secondary opacity-50" />
                    <p className="text-sm text-corthex-text-secondary">데이터가 없습니다</p>
                  </div>
                ) : (
                  <DelegationTimeline items={delegationsQuery.data.data.items} />
                )}
              </div>
            )}

            {tab === 'quality' && (
              <div className="p-6">
                {activeQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 rounded animate-pulse bg-corthex-elevated" />
                    ))}
                  </div>
                ) : !qualityQuery.data?.data?.items?.length ? (
                  <div className="py-12 text-center" data-testid="activity-empty">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-corthex-text-secondary opacity-50" />
                    <p className="text-sm text-corthex-text-secondary">데이터가 없습니다</p>
                  </div>
                ) : (
                  <QualityTable
                    items={qualityQuery.data.data.items}
                    expandedId={expandedQaId}
                    onToggle={(id) => setExpandedQaId(expandedQaId === id ? null : id)}
                  />
                )}
              </div>
            )}

            {tab === 'tools' && (
              <div className="p-6">
                {activeQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 rounded animate-pulse bg-corthex-elevated" />
                    ))}
                  </div>
                ) : !toolsQuery.data?.data?.items?.length ? (
                  <div className="py-12 text-center" data-testid="activity-empty">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-corthex-text-secondary opacity-50" />
                    <p className="text-sm text-corthex-text-secondary">데이터가 없습니다</p>
                  </div>
                ) : (
                  <ToolsTable items={toolsQuery.data.data.items} />
                )}
              </div>
            )}

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="px-6 py-4 border-t border-corthex-border flex items-center justify-between" data-purpose="list-pagination">
                <p className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} events
                </p>
                <div className="flex gap-2">
                  <button
                    className="w-8 h-8 min-h-[44px] min-w-[44px] rounded border border-corthex-border flex items-center justify-center text-corthex-text-secondary hover:text-corthex-accent transition-colors disabled:opacity-30"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </button>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 min-h-[44px] min-w-[44px] rounded border flex items-center justify-center text-xs font-bold transition-colors"
                      style={page === p
                        ? { borderColor: 'var(--color-corthex-accent)', backgroundColor: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-accent)' }
                        : { borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }
                      }
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="w-8 h-8 min-h-[44px] min-w-[44px] rounded border border-corthex-border flex items-center justify-center text-corthex-text-secondary hover:text-corthex-accent transition-colors disabled:opacity-30"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Insight Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-corthex-elevated flex items-center justify-center">
                <Info className="w-5 h-5 text-corthex-accent" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-corthex-text-secondary">Total Events</p>
                <p className="text-xl font-mono text-corthex-text-primary">{totalCount.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-corthex-text-secondary">Active Errors</p>
                <p className="text-xl font-mono" style={{ color: alertCount24h > 0 ? '#dc2626' : undefined }}>{alertCount24h}</p>
              </div>
            </div>
            <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-corthex-elevated flex items-center justify-center">
                <FileText className="w-5 h-5 text-corthex-text-secondary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-corthex-text-secondary">Log Retention</p>
                <p className="text-xl font-mono text-corthex-text-primary">90 Days</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// === Timeline View (Activity tab) ===

function TimelineView({ items }: { items: AgentActivity[] }) {
  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, AgentActivity[]> = {}
    for (const item of items) {
      const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    }
    return groups
  }, [items])

  return (
    <>
      {Object.entries(grouped).map(([date, dateItems]) => (
        <div key={date} className="relative" style={{ paddingLeft: '10px' }}>
          {/* Timeline line */}
          <div className="absolute" style={{ left: '19px', top: 0, bottom: 0, width: '1px', backgroundColor: 'var(--color-corthex-border)' }} />
          <h3 className="sticky top-0 py-2 text-xs font-bold uppercase tracking-widest mb-6 z-10" style={{ backgroundColor: 'var(--color-corthex-bg)', color: 'var(--color-corthex-text-secondary)' }}>
            {date}
          </h3>
          <div className="space-y-6">
            {dateItems.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4 pl-10" data-purpose="event-card">
                <div
                  className="absolute rounded-full z-20"
                  style={{
                    left: '16px', top: '4px', width: '8px', height: '8px',
                    backgroundColor: phaseDotColor(item.phase),
                    boxShadow: `0 0 0 4px #faf8f5`,
                  }}
                />
                <div
                  className="flex-1 bg-corthex-elevated border border-corthex-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadgeEl status={item.phase} />
                      <span className="text-xs font-medium font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                        {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>ID: {item.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>
                    {item.action}
                    {item.detail && (
                      <span style={{ color: 'var(--color-corthex-text-secondary)', fontWeight: 400 }}> - {item.detail}</span>
                    )}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    {item.agentName && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        {item.agentName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

// === Delegation Timeline ===

function DelegationTimeline({ items }: { items: Delegation[] }) {
  return (
    <div className="space-y-6">
      {items.map((item) => {
        const meta = item.metadata as Record<string, unknown> | null
        return (
          <div key={item.id} className="relative flex items-start gap-4 pl-10" data-purpose="event-card">
            <div
              className="absolute rounded-full z-20"
              style={{
                left: '16px', top: '4px', width: '8px', height: '8px',
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 0 4px #faf8f5',
              }}
            />
            <div
              className="flex-1 bg-corthex-elevated border border-corthex-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadgeEl status={item.status} />
                  <span className="text-xs font-medium font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>ID: {item.id.slice(0, 8)}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>
                Delegation from <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--color-corthex-border)' }}>{item.agentName || 'System'}</span>
                {' '}to {(meta?.toAgentName as string) || '-'}
              </p>
              {item.input && (
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                  {String(item.input).slice(0, 120)}
                </p>
              )}
              {item.durationMs != null && (
                <div className="mt-2 text-xs font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                  Duration: {formatDuration(item.durationMs)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// === Quality Table ===

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
          <tr className="text-xs border-b" style={{ color: 'var(--color-corthex-text-secondary)', borderColor: 'var(--color-corthex-border)' }}>
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
                  <div
                    className="flex items-center cursor-pointer transition-colors"
                    onClick={() => onToggle(item.id)}
                    aria-expanded={expandedId === item.id}
                    style={{ borderBottom: '1px solid #e5e1d3' }}
                  >
                    <div className="py-2.5 pr-3 text-xs whitespace-nowrap min-w-[90px] font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatTime(item.createdAt)}</div>
                    <div className="py-2.5 pr-3 text-xs truncate max-w-[200px] flex-1" style={{ color: 'var(--color-corthex-text-primary)' }}>{item.commandText || '-'}</div>
                    <div className="py-2.5 pr-3 min-w-[120px]">
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-corthex-border)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: scoreColor(pct) }}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>-</span>
                      )}
                    </div>
                    <div className="py-2.5 pr-3 min-w-[60px]"><StatusBadgeEl status={item.conclusion} /></div>
                    <div className="py-2.5 text-xs text-right min-w-[50px] font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>{item.attemptNumber > 1 ? item.attemptNumber - 1 : 0}</div>
                  </div>

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

// === Quality Detail Panel ===

function QualityDetailPanel({ scores, feedback }: { scores: MergedScores; feedback: string | null }) {
  const [detailTab, setDetailTab] = useState<'rules' | 'rubric' | 'hallucination' | 'legacy'>('rules')
  const hasRubric = scores.rubricScores && scores.rubricScores.length > 0
  const hasHallucination = scores.hallucinationReport != null

  return (
    <div className="border-b" style={{ backgroundColor: 'rgba(245,240,232,0.5)', borderColor: 'var(--color-corthex-border)' }} data-testid="qa-detail-panel">
      <div className="px-4 pt-2 flex gap-1 border-b" style={{ borderColor: 'var(--color-corthex-border)' }}>
        <DetailTabButton active={detailTab === 'rules'} onClick={() => setDetailTab('rules')}>
          규칙별 결과
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
          <p className="text-[11px] whitespace-pre-wrap border-t pt-2" style={{ color: 'var(--color-corthex-text-secondary)', borderColor: 'var(--color-corthex-border)' }}>
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
      className="px-3 py-1.5 text-[11px] font-medium rounded-t border-b-2 transition-colors"
      style={active
        ? { borderColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-primary)', backgroundColor: 'var(--color-corthex-elevated)' }
        : { borderColor: 'transparent', color: 'var(--color-corthex-text-secondary)' }
      }
    >
      {children}
    </button>
  )
}

// === Rule Results Panel ===

function RuleResultsPanel({ ruleResults }: { ruleResults: RuleResult[] }) {
  if (ruleResults.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>규칙별 검수 데이터가 없습니다.</p>
  }

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
          <h4 className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--color-corthex-text-secondary)' }}>
            {CATEGORY_LABELS[category] || category}
          </h4>
          <div className="space-y-1">
            {rules.map((rule) => {
              const sevStyle = SEVERITY_STYLES[rule.severity] || SEVERITY_STYLES.minor
              const resStyle = RESULT_STYLES[rule.result] || {}
              return (
                <div key={rule.ruleId} className="flex items-start gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(245,240,232,0.5)' }}>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0" style={{ backgroundColor: sevStyle.bg, color: sevStyle.text }}>
                    {rule.severity}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0" style={{ backgroundColor: resStyle.bg || 'transparent', color: resStyle.text || '#9c8d66' }}>
                    {rule.result === 'pass' ? 'PASS' : rule.result === 'warn' ? 'WARN' : 'FAIL'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>{rule.ruleName}</span>
                    {rule.message && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--color-corthex-text-secondary)' }}>{rule.message}</p>
                    )}
                  </div>
                  {rule.skipped && <span className="text-[10px] italic shrink-0" style={{ color: 'var(--color-corthex-text-secondary)' }}>건너뜀</span>}
                </div>
              )
            })}
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
        <div key={item.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(245,240,232,0.5)' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>{item.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>(가중치 {item.weight}%{item.critical ? ', 필수' : ''})</span>
            </div>
            {item.feedback && (
              <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--color-corthex-text-secondary)' }}>{item.feedback}</p>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: item.score >= 4 ? '#4d7c0f' : item.score >= 3 ? '#b45309' : '#dc2626' }}>
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
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadgeEl status={report.verdict} />
        <div className="flex gap-4 text-xs">
          <span style={{ color: 'var(--color-corthex-text-secondary)' }}>총 주장: <span className="font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>{report.totalClaims}</span></span>
          <span style={{ color: 'var(--color-corthex-text-secondary)' }}>검증: <span className="font-medium" style={{ color: '#10b981' }}>{report.verifiedClaims}</span></span>
          <span style={{ color: 'var(--color-corthex-text-secondary)' }}>불일치: <span className="font-medium" style={{ color: '#ef4444' }}>{report.mismatchedClaims}</span></span>
          <span style={{ color: 'var(--color-corthex-text-secondary)' }}>미확인: <span className="font-medium" style={{ color: '#f59e0b' }}>{report.unsourcedCount}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] w-16" style={{ color: 'var(--color-corthex-text-secondary)' }}>환각 점수</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-corthex-border)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.round(report.score * 100)}%`, backgroundColor: scoreColor(Math.round(report.score * 100)) }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: scoreColor(Math.round(report.score * 100)) }}>
          {Math.round(report.score * 100)}%
        </span>
      </div>

      {report.details && (
        <p className="text-[10px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>{report.details}</p>
      )}

      {report.claims.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-corthex-text-secondary)' }}>주장별 검증 결과</span>
            {report.claims.length > 5 && (
              <button onClick={() => setShowAll(!showAll)} className="text-[10px]" style={{ color: 'var(--color-corthex-text-primary)', textDecoration: 'underline' }}>
                {showAll ? '일부만 보기' : `전체 보기 (${report.claims.length})`}
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(showAll ? report.claims : report.claims.filter(c => !c.verified || c.severity !== 'none').slice(0, 5)).map((cv, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1 rounded-lg text-[10px]" style={{ backgroundColor: 'rgba(245,240,232,0.5)' }}>
                <span
                  className="shrink-0 mt-0.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: cv.verified ? '#10b981' : cv.severity === 'critical' ? '#ef4444' : '#f59e0b' }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>{cv.claim.value}</span>
                  <span className="ml-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>({cv.claim.type})</span>
                  {cv.toolSource && <span className="ml-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>via {cv.toolSource}</span>}
                  {cv.discrepancy && <p className="mt-0.5" style={{ color: '#ef4444' }}>{cv.discrepancy}</p>}
                </div>
                <span
                  className="shrink-0 px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: cv.verified ? 'rgba(16,185,129,0.15)' : cv.matched ? 'rgba(239,68,68,0.15)' : 'rgba(209,201,178,0.3)',
                    color: cv.verified ? '#10b981' : cv.matched ? '#ef4444' : '#9c8d66',
                  }}
                >
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

// === Legacy Scores Panel ===

function LegacyScoresPanel({ scores }: { scores: MergedScores }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Object.entries(SCORE_LABELS).map(([key, label]) => {
        const score = (scores as unknown as Record<string, number>)[key] ?? 0
        return (
          <div key={key} className="text-center">
            <p className="text-[10px] mb-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>{label}</p>
            <p className="text-sm font-bold" style={{ color: score >= 4 ? '#4d7c0f' : score >= 3 ? '#b45309' : '#dc2626' }}>
              {score}/5
            </p>
          </div>
        )
      })}
    </div>
  )
}

// === Tools Table ===

function ToolsTable({ items }: { items: ToolInvocation[] }) {
  return (
    <div className="overflow-x-auto" data-testid="tools-table">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-xs border-b" style={{ color: 'var(--color-corthex-text-secondary)', borderColor: 'var(--color-corthex-border)' }}>
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
            <tr key={item.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(229,225,211,0.5)' }}>
              <td className="py-2.5 pr-3 text-xs whitespace-nowrap font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium font-mono" style={{ color: 'var(--color-corthex-accent)' }}>{item.toolName}</td>
              <td className="py-2.5 pr-3 text-xs" style={{ color: 'var(--color-corthex-text-primary)' }}>{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs text-right font-mono" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatDuration(item.durationMs)}</td>
              <td className="py-2.5 pr-3"><StatusBadgeEl status={item.status} /></td>
              <td className="py-2.5 text-xs truncate max-w-[200px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>{item.input || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
