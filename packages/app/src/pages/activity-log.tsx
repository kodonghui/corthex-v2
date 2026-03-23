// API Endpoints:
// GET /workspace/activity/agents?page=&limit=&search=&startDate=&endDate=
// GET /workspace/activity/delegations?page=&limit=&search=&startDate=&endDate=
// GET /workspace/activity/quality?page=&limit=&search=&startDate=&endDate=&conclusion=
// GET /workspace/activity/tools?page=&limit=&search=&startDate=&endDate=&toolName=
// GET /workspace/activity/security-alerts?page=&limit=&startDate=&endDate=

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, FileText, ArrowRight, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
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
  minor: { bg: 'rgba(117,110,90,0.15)', text: '#756e5a' },
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
  const info = STATUS_BADGE[status] || { label: status, dotColor: '#d1c9b2', bgColor: 'rgba(209,201,178,0.1)', textColor: '#9c8d66', borderColor: 'rgba(209,201,178,0.3)' }
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
  return '#756e5a'
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf8f5', color: '#1a1a1a', fontFamily: "'Inter', sans-serif" }}>
      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Header Section */}
        <header className="border-b px-8 py-6" style={{ backgroundColor: '#ffffff', borderColor: '#e5e1d3' }} data-purpose="page-header">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold" style={{ color: '#1a1a1a' }}>Activity Log</h1>
              <p className="text-sm mt-1" style={{ color: '#6b705c' }}>Audit trail for workspace events and operations.</p>
            </div>
            <div className="flex items-center gap-3">
              <WsStatusIndicator />
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4" style={{ color: '#756e5a' }} />
                </span>
                <input
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-[#606C38] w-64 transition-all"
                  style={{ backgroundColor: '#faf8f5', borderColor: '#908a78', color: '#1a1a1a' }}
                  placeholder="Search events..."
                  type="text"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                  data-testid="search-input"
                />
              </div>
              {tab === 'tools' && (
                <input
                  placeholder="Tool name filter..."
                  value={toolNameFilter}
                  onChange={(e) => { setToolNameFilter(e.target.value); setPage(1) }}
                  className="py-2 px-3 border rounded-lg text-sm w-40 transition-colors focus:ring-1 focus:ring-[#606C38]"
                  style={{ backgroundColor: '#faf8f5', borderColor: '#908a78', color: '#1a1a1a' }}
                  data-testid="tool-name-filter"
                />
              )}
              {tab === 'quality' && (
                <select
                  value={conclusionFilter}
                  onChange={(e) => { setConclusionFilter(e.target.value); setPage(1) }}
                  className="py-2 px-3 border rounded-lg text-sm"
                  style={{ backgroundColor: '#faf8f5', borderColor: '#908a78', color: '#1a1a1a' }}
                  data-testid="conclusion-filter"
                >
                  <option value="">All</option>
                  <option value="pass">PASS</option>
                  <option value="fail">FAIL</option>
                </select>
              )}
              <button
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-[#f0ebe0]"
                style={{ backgroundColor: '#f5f0e8', borderColor: '#e5e1d3', color: '#6b705c' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Filters
              </button>
              <button className="p-2 rounded-lg transition-colors hover:bg-[#4e5a2b]" style={{ backgroundColor: '#606C38', color: '#ffffff' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
            </div>
          </div>
          {/* Navigation Tabs */}
          <div className="flex border-b mt-8 gap-8" style={{ borderColor: '#e5e1d3' }} data-purpose="content-tabs">
            {TAB_ITEMS.map(item => (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className="pb-3 text-sm transition-colors"
                style={tab === item.value
                  ? { fontWeight: 600, borderBottom: '2px solid #606C38', color: '#1a1a1a' }
                  : { fontWeight: 500, color: '#6b705c', borderBottom: '2px solid transparent' }
                }
                data-testid={`tab-${item.value}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Security Alert Banner (QA tab only) */}
        {tab === 'quality' && alertCount24h > 0 && (
          <div
            className="mx-8 mt-4 px-4 py-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
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
            <span className="text-xs" style={{ color: '#dc2626' }}>{showSecurityAlerts ? '접기' : '상세 보기'}</span>
          </div>
        )}

        {/* Security Alerts Detail */}
        {tab === 'quality' && showSecurityAlerts && securityQuery.data?.data?.items && (
          <div className="mx-8 mb-4 p-3 rounded-b-lg" style={{ backgroundColor: 'rgba(220,38,38,0.03)', border: '1px solid rgba(220,38,38,0.15)' }} data-testid="security-alerts-detail">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: '#6b705c', borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
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
                    <tr key={alert.id} style={{ borderBottom: '1px solid rgba(220,38,38,0.08)' }}>
                      <td className="py-1.5 pr-2 whitespace-nowrap font-mono" style={{ color: '#756e5a' }}>{formatTime(alert.createdAt)}</td>
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
                      <td className="py-1.5 truncate max-w-[300px]" style={{ color: '#756e5a' }}>
                        {(meta?.pattern as string) || (meta?.threatType as string) || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity Content */}
        <section className="flex-1 overflow-y-auto p-8" data-purpose="activity-timeline">
          {activeQuery.isLoading ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#f5f0e8' }} />
              ))}
            </div>
          ) : !activeQuery.data?.data?.items?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="activity-empty">
              <FileText className="w-10 h-10 mb-4" style={{ color: '#756e5a' }} />
              <h3 className="text-base font-medium mb-2" style={{ color: '#1a1a1a' }}>데이터가 없습니다</h3>
              <p className="text-sm" style={{ color: '#6b705c' }}>선택한 기간에 해당하는 기록이 없습니다</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-12">
              {tab === 'agents' && (
                <TimelineView items={agentsQuery.data!.data.items} />
              )}

              {tab === 'delegations' && (
                <DelegationTimeline items={delegationsQuery.data!.data.items} />
              )}

              {tab === 'quality' && (
                <QualityTable
                  items={qualityQuery.data!.data.items}
                  expandedId={expandedQaId}
                  onToggle={(id) => setExpandedQaId(expandedQaId === id ? null : id)}
                />
              )}

              {tab === 'tools' && <ToolsTable items={toolsQuery.data!.data.items} />}
            </div>
          )}
        </section>

        {/* Footer Pagination */}
        {totalCount > 0 && (
          <footer className="border-t px-8 py-3 flex items-center justify-between" style={{ backgroundColor: '#f5f0e8', borderColor: '#e5e1d3' }} data-purpose="list-pagination">
            <span className="text-xs font-medium" style={{ color: '#6b705c' }}>
              Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} activities
            </span>
            <div className="flex gap-1">
              <button
                className="p-1 rounded disabled:opacity-30"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ color: '#6b705c' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-6 h-6 flex items-center justify-center text-xs font-medium rounded transition-colors"
                  style={page === p
                    ? { backgroundColor: '#606C38', color: '#ffffff', fontWeight: 700 }
                    : { color: '#6b705c' }
                  }
                >
                  {p}
                </button>
              ))}
              <button
                className="p-1 rounded disabled:opacity-30"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ color: '#6b705c' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
            </div>
          </footer>
        )}
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
          <div className="absolute" style={{ left: '19px', top: 0, bottom: 0, width: '1px', backgroundColor: '#e5e1d3' }} />
          <h3 className="sticky top-0 py-2 text-xs font-bold uppercase tracking-widest mb-6 z-10" style={{ backgroundColor: '#faf8f5', color: '#756e5a' }}>
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
                  className="flex-1 bg-[#f5f0e8] border border-[#e5e1d3] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusBadgeEl status={item.phase} />
                      <span className="text-xs font-medium font-mono" style={{ color: '#756e5a' }}>
                        {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: '#756e5a' }}>ID: {item.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                    {item.action}
                    {item.detail && (
                      <span style={{ color: '#6b705c', fontWeight: 400 }}> - {item.detail}</span>
                    )}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: '#6b705c' }}>
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
              className="flex-1 bg-[#f5f0e8] border border-[#e5e1d3] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadgeEl status={item.status} />
                  <span className="text-xs font-medium font-mono" style={{ color: '#756e5a' }}>
                    {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#756e5a' }}>ID: {item.id.slice(0, 8)}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                Delegation from <span style={{ textDecoration: 'underline', textDecorationColor: '#e5e1d3' }}>{item.agentName || 'System'}</span>
                {' '}to {(meta?.toAgentName as string) || '-'}
              </p>
              {item.input && (
                <p className="mt-2 text-xs leading-relaxed" style={{ color: '#6b705c' }}>
                  {String(item.input).slice(0, 120)}
                </p>
              )}
              {item.durationMs != null && (
                <div className="mt-2 text-xs font-mono" style={{ color: '#6b705c' }}>
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
          <tr className="text-xs border-b" style={{ color: '#6b705c', borderColor: '#e5e1d3' }}>
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
                    <div className="py-2.5 pr-3 text-xs whitespace-nowrap min-w-[90px] font-mono" style={{ color: '#756e5a' }}>{formatTime(item.createdAt)}</div>
                    <div className="py-2.5 pr-3 text-xs truncate max-w-[200px] flex-1" style={{ color: '#1a1a1a' }}>{item.commandText || '-'}</div>
                    <div className="py-2.5 pr-3 min-w-[120px]">
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e1d3' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: scoreColor(pct) }}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#756e5a' }}>-</span>
                      )}
                    </div>
                    <div className="py-2.5 pr-3 min-w-[60px]"><StatusBadgeEl status={item.conclusion} /></div>
                    <div className="py-2.5 text-xs text-right min-w-[50px] font-mono" style={{ color: '#6b705c' }}>{item.attemptNumber > 1 ? item.attemptNumber - 1 : 0}</div>
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
    <div className="border-b" style={{ backgroundColor: 'rgba(245,240,232,0.5)', borderColor: '#e5e1d3' }} data-testid="qa-detail-panel">
      <div className="px-4 pt-2 flex gap-1 border-b" style={{ borderColor: '#e5e1d3' }}>
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
          <p className="text-[11px] whitespace-pre-wrap border-t pt-2" style={{ color: '#6b705c', borderColor: '#e5e1d3' }}>
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
        ? { borderColor: '#606C38', color: '#1a1a1a', backgroundColor: '#f5f0e8' }
        : { borderColor: 'transparent', color: '#6b705c' }
      }
    >
      {children}
    </button>
  )
}

// === Rule Results Panel ===

function RuleResultsPanel({ ruleResults }: { ruleResults: RuleResult[] }) {
  if (ruleResults.length === 0) {
    return <p className="text-xs" style={{ color: '#6b705c' }}>규칙별 검수 데이터가 없습니다.</p>
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
          <h4 className="text-[11px] font-semibold mb-1.5" style={{ color: '#6b705c' }}>
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
                    <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{rule.ruleName}</span>
                    {rule.message && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: '#6b705c' }}>{rule.message}</p>
                    )}
                  </div>
                  {rule.skipped && <span className="text-[10px] italic shrink-0" style={{ color: '#6b705c' }}>건너뜀</span>}
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
              <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{item.label}</span>
              <span className="text-[10px]" style={{ color: '#6b705c' }}>(가중치 {item.weight}%{item.critical ? ', 필수' : ''})</span>
            </div>
            {item.feedback && (
              <p className="text-[10px] mt-0.5 truncate" style={{ color: '#6b705c' }}>{item.feedback}</p>
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
          <span style={{ color: '#6b705c' }}>총 주장: <span className="font-medium" style={{ color: '#1a1a1a' }}>{report.totalClaims}</span></span>
          <span style={{ color: '#6b705c' }}>검증: <span className="font-medium" style={{ color: '#10b981' }}>{report.verifiedClaims}</span></span>
          <span style={{ color: '#6b705c' }}>불일치: <span className="font-medium" style={{ color: '#ef4444' }}>{report.mismatchedClaims}</span></span>
          <span style={{ color: '#6b705c' }}>미확인: <span className="font-medium" style={{ color: '#f59e0b' }}>{report.unsourcedCount}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] w-16" style={{ color: '#6b705c' }}>환각 점수</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e1d3' }}>
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
        <p className="text-[10px]" style={{ color: '#6b705c' }}>{report.details}</p>
      )}

      {report.claims.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium" style={{ color: '#6b705c' }}>주장별 검증 결과</span>
            {report.claims.length > 5 && (
              <button onClick={() => setShowAll(!showAll)} className="text-[10px]" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
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
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{cv.claim.value}</span>
                  <span className="ml-1" style={{ color: '#6b705c' }}>({cv.claim.type})</span>
                  {cv.toolSource && <span className="ml-1" style={{ color: '#6b705c' }}>via {cv.toolSource}</span>}
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
            <p className="text-[10px] mb-1" style={{ color: '#6b705c' }}>{label}</p>
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
          <tr className="text-xs border-b" style={{ color: '#6b705c', borderColor: '#e5e1d3' }}>
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
              <td className="py-2.5 pr-3 text-xs whitespace-nowrap font-mono" style={{ color: '#756e5a' }}>{formatTime(item.createdAt)}</td>
              <td className="py-2.5 pr-3 text-xs font-medium font-mono" style={{ color: '#606C38' }}>{item.toolName}</td>
              <td className="py-2.5 pr-3 text-xs" style={{ color: '#1a1a1a' }}>{item.agentName || '-'}</td>
              <td className="py-2.5 pr-3 text-xs text-right font-mono" style={{ color: '#756e5a' }}>{formatDuration(item.durationMs)}</td>
              <td className="py-2.5 pr-3"><StatusBadgeEl status={item.status} /></td>
              <td className="py-2.5 text-xs truncate max-w-[200px]" style={{ color: '#6b705c' }}>{item.input || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
