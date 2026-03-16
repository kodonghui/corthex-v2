// API Endpoints:
// GET  /workspace/operation-log?page=&limit=&search=&startDate=&endDate=&type=&status=&sortBy=&bookmarkedOnly=
// GET  /workspace/operation-log/:id
// POST /workspace/operation-log/bookmarks  { commandId }
// DELETE /workspace/operation-log/bookmarks/:id
// GET  /workspace/operation-log/export?search=&startDate=&endDate=&type=&status=&sortBy=

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import { MarkdownRenderer } from '../components/markdown-renderer'

// === Types ===

type OperationLogItem = {
  id: string
  text: string
  type: string
  status: string
  targetAgentName: string | null
  targetDepartmentName: string | null
  qualityScore: number | null
  qualityConclusion: string | null
  totalCostMicro: number | null
  durationMs: number | null
  isBookmarked: boolean
  bookmarkId: string | null
  bookmarkNote: string | null
  result: string | null
  createdAt: string
  completedAt: string | null
}

type PaginatedResponse = {
  data: { items: OperationLogItem[]; page: number; limit: number; total: number }
}

type DetailResponse = {
  data: OperationLogItem
}

type ExportResponse = {
  data: Record<string, unknown>[]
}

type BookmarkResponse = {
  data: { id: string }
}

// === Constants ===

const PAGE_SIZE = 20

const TYPE_LABELS: Record<string, string> = {
  direct: '직접',
  mention: '멘션',
  slash: '슬래시',
  preset: '프리셋',
  batch: '배치',
  all: '전체',
  sequential: '순차',
  deepwork: '심화',
}

const STATUS_LABELS: Record<string, string> = {
  completed: '완료',
  processing: '진행중',
  pending: '대기',
  failed: '실패',
  cancelled: '취소',
}

const STATUS_BADGE_STYLES: Record<string, { dotColor: string; bgColor: string; textColor: string; borderColor: string; label: string }> = {
  completed: { dotColor: '#10b981', bgColor: 'rgba(16,185,129,0.08)', textColor: '#10b981', borderColor: 'rgba(16,185,129,0.2)', label: 'Success' },
  processing: { dotColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)', textColor: '#3b82f6', borderColor: 'rgba(59,130,246,0.2)', label: 'Running' },
  pending: { dotColor: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', textColor: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)', label: 'Pending' },
  failed: { dotColor: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', textColor: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', label: 'Critical' },
  cancelled: { dotColor: '#d1c9b2', bgColor: 'rgba(209,201,178,0.1)', textColor: '#9c8d66', borderColor: 'rgba(209,201,178,0.3)', label: 'Cancelled' },
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'date', label: '날짜순' },
  { value: 'qualityScore', label: '품질순' },
  { value: 'cost', label: '비용순' },
  { value: 'duration', label: '소요시간순' },
]

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

function formatCost(micro: number | null | undefined) {
  if (micro == null) return '-'
  return `$${(micro / 1_000_000).toFixed(4)}`
}

function scoreColor(score: number): string {
  if (score >= 4) return '#10b981'
  if (score >= 3) return '#f59e0b'
  return '#ef4444'
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? '')
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(',')),
  ]
  const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// === Status Badge ===

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_BADGE_STYLES[status] || { dotColor: '#d1c9b2', bgColor: 'rgba(209,201,178,0.1)', textColor: '#9c8d66', borderColor: 'rgba(209,201,178,0.3)', label: status }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-tighter"
      style={{ backgroundColor: info.bgColor, color: info.textColor, border: `1px solid ${info.borderColor}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.dotColor }} />
      {info.label}
    </span>
  )
}

// === Quality Bar ===

function QualityBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs" style={{ color: '#9c8d66' }}>-</span>
  const pct = Math.round(score * 20)
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e8e4d9' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(score) }} />
      </div>
      <span className="text-[10px] w-6 text-right" style={{ color: '#9c8d66' }}>{score.toFixed(1)}</span>
    </div>
  )
}

// === Main Page ===

export function OpsLogPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State: filters
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  // State: modals
  const [detailId, setDetailId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [compareOpen, setCompareOpen] = useState(false)
  const [replayConfirm, setReplayConfirm] = useState<{ text: string } | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  // Build query params
  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (sortBy !== 'date') params.set('sortBy', sortBy)
    if (bookmarkedOnly) params.set('bookmarkedOnly', 'true')
    return params.toString()
  }, [page, debouncedSearch, startDate, endDate, typeFilter, statusFilter, sortBy, bookmarkedOnly])

  // Main list query
  const listQuery = useQuery({
    queryKey: ['operation-log', page, debouncedSearch, startDate, endDate, typeFilter, statusFilter, sortBy, bookmarkedOnly],
    queryFn: () => api.get<PaginatedResponse>(`/workspace/operation-log?${buildParams()}`),
  })

  // Detail query
  const detailQuery = useQuery({
    queryKey: ['operation-log-detail', detailId],
    queryFn: () => api.get<DetailResponse>(`/workspace/operation-log/${detailId}`),
    enabled: !!detailId,
  })

  // Bookmark add mutation
  const addBookmark = useMutation({
    mutationFn: (commandId: string) =>
      api.post<BookmarkResponse>('/workspace/operation-log/bookmarks', { commandId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-log'] })
      toast.success('북마크에 추가했습니다')
    },
  })

  // Bookmark remove mutation
  const removeBookmark = useMutation({
    mutationFn: (bookmarkId: string) =>
      api.delete<BookmarkResponse>(`/workspace/operation-log/bookmarks/${bookmarkId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation-log'] })
      toast.success('북마크를 제거했습니다')
    },
  })

  const items = listQuery.data?.data?.items ?? []
  const total = listQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Filter chips
  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (debouncedSearch) chips.push({ key: 'search', label: `검색: ${debouncedSearch}`, onRemove: () => { setSearchInput(''); setPage(1) } })
    if (startDate) chips.push({ key: 'startDate', label: `시작: ${startDate}`, onRemove: () => { setStartDate(''); setPage(1) } })
    if (endDate) chips.push({ key: 'endDate', label: `종료: ${endDate}`, onRemove: () => { setEndDate(''); setPage(1) } })
    if (typeFilter) chips.push({ key: 'type', label: `유형: ${TYPE_LABELS[typeFilter] || typeFilter}`, onRemove: () => { setTypeFilter(''); setPage(1) } })
    if (statusFilter) chips.push({ key: 'status', label: `상태: ${STATUS_LABELS[statusFilter] || statusFilter}`, onRemove: () => { setStatusFilter(''); setPage(1) } })
    if (bookmarkedOnly) chips.push({ key: 'bookmark', label: '북마크만', onRemove: () => { setBookmarkedOnly(false); setPage(1) } })
    return chips
  }, [debouncedSearch, startDate, endDate, typeFilter, statusFilter, bookmarkedOnly])

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 2) {
        next.add(id)
      }
      return next
    })
  }, [])

  // Selected items for comparison
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(item.id))
  }, [items, selectedIds])

  // CSV export
  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (sortBy !== 'date') params.set('sortBy', sortBy)
      const res = await api.get<ExportResponse>(`/workspace/operation-log/export?${params}`)
      if (res.data && res.data.length > 0) {
        downloadCsv(res.data, `작전일지_${new Date().toISOString().slice(0, 10)}.csv`)
        toast.success(`${res.data.length}건을 내보냈습니다`)
      } else {
        toast.error('내보낼 데이터가 없습니다')
      }
    } catch {
      toast.error('내보내기에 실패했습니다')
    }
  }, [debouncedSearch, startDate, endDate, typeFilter, statusFilter, sortBy])

  // Replay handler
  const handleReplay = useCallback((text: string) => {
    setReplayConfirm({ text })
  }, [])

  const confirmReplay = useCallback(() => {
    if (!replayConfirm) return
    const encoded = encodeURIComponent(replayConfirm.text)
    setReplayConfirm(null)
    setDetailId(null)
    navigate(`/command-center?replay=${encoded}`)
  }, [replayConfirm, navigate])

  // Bookmark toggle
  const handleBookmarkToggle = useCallback((item: OperationLogItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.isBookmarked && item.bookmarkId) {
      removeBookmark.mutate(item.bookmarkId)
    } else {
      addBookmark.mutate(item.id)
    }
  }, [addBookmark, removeBookmark])

  // Copy command text
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('명령이 복사되었습니다')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success('명령이 복사되었습니다')
    }
  }, [])

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#fcfbf9',
    borderColor: '#e8e4d9',
    color: '#463e30',
  }

  return (
    <div
      data-testid="ops-log-page"
      className="font-sans min-h-screen flex flex-col"
      style={{ backgroundColor: '#fcfbf9', color: '#463e30', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <header className="border-b px-8 py-6" style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>Ops Log</h1>
            <p className="text-sm mt-1" style={{ color: '#9c8d66' }}>Operation history and performance tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size === 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="px-4 py-2 text-sm font-bold rounded transition-colors"
                style={{ backgroundColor: '#e57373', color: '#ffffff' }}
                data-testid="compare-btn"
              >
                비교
              </button>
            )}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium transition-colors"
              style={{ backgroundColor: '#f2f0e9', borderColor: '#e8e4d9', color: '#6a5d43' }}
              data-testid="export-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              내보내기
            </button>
          </div>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <div className="px-8 pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9c8d66' }}>Daily Operations</p>
            <p className="text-3xl font-bold font-mono tabular-nums" style={{ color: '#463e30' }}>{total}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9c8d66' }}>Avg Quality Score</p>
            <p className="text-3xl font-bold font-mono tabular-nums" style={{ color: '#e57373' }}>
              {items.length > 0
                ? (items.reduce((sum, i) => sum + (i.qualityScore ?? 0), 0) / items.filter(i => i.qualityScore != null).length || 0).toFixed(1)
                : '-'}
              <span className="text-xl" style={{ color: '#9c8d66' }}>/5</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9c8d66' }}>Total Op Cost</p>
            <p className="text-3xl font-bold font-mono tabular-nums" style={{ color: '#463e30' }}>
              {items.length > 0
                ? formatCost(items.reduce((sum, i) => sum + (i.totalCostMicro ?? 0), 0))
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-8 py-3 border-b flex flex-wrap gap-2 items-center" style={{ borderColor: '#e8e4d9' }} data-testid="filters-row">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b7aa88' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" /></svg>
          <input
            placeholder="검색..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
            className="pl-10 pr-4 py-2 border rounded text-sm w-48 transition-all focus:ring-1"
            style={{ ...inputStyle, outline: 'none' }}
            data-testid="search-input"
          />
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className="py-2 px-3 border rounded text-sm"
          style={inputStyle}
        />
        <span className="text-sm" style={{ color: '#9c8d66' }}>~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className="py-2 px-3 border rounded text-sm"
          style={inputStyle}
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="py-2 px-3 border rounded text-sm"
          style={inputStyle}
        >
          <option value="">전체 유형</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="py-2 px-3 border rounded text-sm"
          style={inputStyle}
        >
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
          className="py-2 px-3 border rounded text-sm"
          style={inputStyle}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setBookmarkedOnly(!bookmarkedOnly); setPage(1) }}
          className="text-sm px-3 py-2 rounded border transition-colors"
          style={bookmarkedOnly
            ? { backgroundColor: 'rgba(196,98,45,0.1)', borderColor: 'rgba(196,98,45,0.3)', color: '#e07a5f' }
            : { backgroundColor: 'transparent', borderColor: '#e8e4d9', color: '#9c8d66' }
          }
          data-testid="bookmark-filter"
        >
          &#9733; 북마크
        </button>
      </div>

      {/* Filter chips */}
      {filterChips.length > 0 && (
        <div className="px-8 py-2 border-b flex flex-wrap gap-1.5" style={{ borderColor: '#e8e4d950' }}>
          {filterChips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full"
              style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#e57373' }}
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-0.5 hover:opacity-70"
                style={{ color: '#e57373' }}
              >
                &times;
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setSearchInput(''); setStartDate(''); setEndDate('')
              setTypeFilter(''); setStatusFilter(''); setBookmarkedOnly(false)
              setPage(1)
            }}
            className="text-[11px] px-2 py-1 hover:opacity-70"
            style={{ color: '#9c8d66' }}
          >
            전체 초기화
          </button>
        </div>
      )}

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div className="px-8 py-2 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(90,114,71,0.06)', borderColor: 'rgba(90,114,71,0.15)' }}>
          <span className="text-xs" style={{ color: '#e57373' }}>
            {selectedIds.size}개 선택됨 {selectedIds.size < 2 && '(비교하려면 2개를 선택하세요)'}
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs hover:opacity-70"
            style={{ color: '#e57373' }}
          >
            선택 해제
          </button>
        </div>
      )}

      {/* Main Content: Timeline / Table */}
      <section className="flex-1 overflow-auto p-8" data-testid="ops-table">
        {listQuery.isLoading ? (
          <div className="max-w-5xl mx-auto space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" data-testid="ops-empty">
            <p className="text-sm font-medium mb-2" style={{ color: '#9c8d66' }}>보고된 작전이 없습니다</p>
            <p className="text-xs mb-4" style={{ color: '#b7aa88' }}>허브에서 명령을 내리면 작전일지가 기록됩니다.</p>
            <button
              onClick={() => navigate('/hub')}
              className="px-4 py-2 text-sm text-white rounded-lg font-medium hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#e57373' }}
            >
              허브로 이동
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Timeline list */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px" style={{ backgroundColor: '#e8e4d9' }} />

              <div className="space-y-4">
                {items.map(item => {
                  const statusInfo = STATUS_BADGE_STYLES[item.status] || STATUS_BADGE_STYLES.cancelled
                  return (
                    <article
                      key={item.id}
                      onClick={() => setDetailId(item.id)}
                      className="relative flex gap-4 pl-12 cursor-pointer group"
                      data-testid={`ops-row-${item.id}`}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute left-3.5 top-6 w-3 h-3 rounded-full border-4"
                        style={{ backgroundColor: statusInfo.dotColor, borderColor: '#fcfbf9' }}
                      />

                      <div
                        className="flex-1 bg-white p-5 rounded-2xl border transition-all group-hover:border-l-4"
                        style={{
                          borderColor: '#e8e4d9',
                          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                          borderLeftColor: selectedIds.has(item.id) ? '#e57373' : undefined,
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {/* Checkbox for comparison */}
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
                              disabled={!selectedIds.has(item.id) && selectedIds.size >= 2}
                              className="w-3.5 h-3.5 rounded accent-[#e57373]"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <StatusBadge status={item.status} />
                            <span className="text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider" style={{ backgroundColor: '#f2f0e9', color: '#6a5d43' }}>
                              {TYPE_LABELS[item.type] || item.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono tabular-nums" style={{ color: '#9c8d66' }}>{formatTime(item.createdAt)}</span>
                            <button
                              className="text-sm hover:scale-110 transition-transform"
                              style={{ color: item.isBookmarked ? '#e07a5f' : '#d1c9b2' }}
                              onClick={(e) => handleBookmarkToggle(item, e)}
                            >
                              {item.isBookmarked ? '\u2605' : '\u2606'}
                            </button>
                          </div>
                        </div>

                        {item.targetAgentName && (
                          <p className="text-xs font-medium mb-1" style={{ color: '#e57373' }}>{item.targetAgentName}</p>
                        )}
                        <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: '#463e30' }}>{item.text}</p>

                        <div className="flex items-center gap-4">
                          <span className="font-mono tabular-nums text-xs" style={{ color: '#9c8d66' }}>{formatDuration(item.durationMs)}</span>
                          <span className="font-mono tabular-nums text-xs" style={{ color: '#9c8d66' }}>{formatCost(item.totalCostMicro)}</span>
                          {item.qualityScore != null && (
                            <div className="flex-1 max-w-[100px]">
                              <QualityBar score={item.qualityScore} />
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pagination */}
      {total > 0 && (
        <div className="px-8 py-3 border-t flex items-center justify-between" style={{ borderColor: '#e8e4d9', backgroundColor: '#ffffff' }} data-testid="pagination">
          <span className="text-xs" style={{ color: '#9c8d66' }}>{total.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="border rounded px-3 py-1.5 text-xs disabled:opacity-30 hover:opacity-70 transition-colors"
              style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
            >
              이전
            </button>
            <span className="text-xs" style={{ color: '#9c8d66' }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border rounded px-3 py-1.5 text-xs disabled:opacity-30 hover:opacity-70 transition-colors"
              style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        detail={detailQuery.data?.data ?? null}
        isLoading={detailQuery.isLoading}
        onReplay={handleReplay}
        onCopy={handleCopy}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        items={selectedItems}
      />

      {/* Replay Confirm */}
      {replayConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReplayConfirm(null)} />
          <div className="relative bg-white border rounded-2xl shadow-2xl p-6 w-96" style={{ borderColor: '#e8e4d9' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#463e30', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>명령 리플레이</h3>
            <p className="text-xs mb-4" style={{ color: '#9c8d66' }}>동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplayConfirm(null)}
                className="border rounded-lg px-4 py-2 text-sm hover:opacity-70 transition-colors"
                style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
              >
                취소
              </button>
              <button
                onClick={confirmReplay}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#e57373' }}
              >
                실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// === Detail Modal ===

function DetailModal({
  isOpen,
  onClose,
  detail,
  isLoading,
  onReplay,
  onCopy,
}: {
  isOpen: boolean
  onClose: () => void
  detail: OperationLogItem | null
  isLoading: boolean
  onReplay: (text: string) => void
  onCopy: (text: string) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
        style={{ borderColor: '#e8e4d9' }}
        onClick={e => e.stopPropagation()}
        data-testid="detail-modal"
      >
        {isLoading || !detail ? (
          <div className="py-8 space-y-3">
            <div className="h-4 w-1/3 rounded animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />
            <div className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />)}
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#463e30', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>작전 상세</h3>
                <p className="text-[11px]" style={{ color: '#9c8d66' }}>{formatTime(detail.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCopy(detail.text)}
                  className="border rounded-lg px-3 py-1.5 text-xs hover:opacity-70"
                  style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
                >
                  복사
                </button>
                <button
                  onClick={() => onReplay(detail.text)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white hover:opacity-90"
                  style={{ backgroundColor: '#e57373' }}
                >
                  리플레이
                </button>
              </div>
            </div>

            {/* Command text */}
            <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: '#fcfbf9', border: '1px solid #e8e4d9' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#9c8d66' }}>명령</p>
              <p className="text-sm" style={{ color: '#463e30' }}>{detail.text}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <MetaCard label="유형" value={TYPE_LABELS[detail.type] || detail.type} />
              <MetaCard label="상태" value={STATUS_LABELS[detail.status] || detail.status} />
              <MetaCard label="에이전트" value={detail.targetAgentName || '-'} />
              <MetaCard label="소요시간" value={formatDuration(detail.durationMs)} />
            </div>

            {/* Quality */}
            {detail.qualityScore != null && (
              <div className="mb-4 border rounded-xl p-4" style={{ borderColor: '#e8e4d9' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#9c8d66' }}>품질 평가</p>
                <div className="flex items-center gap-3">
                  <QualityBar score={detail.qualityScore} />
                  {detail.qualityConclusion && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold uppercase"
                      style={detail.qualityConclusion === 'pass'
                        ? { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }
                        : { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                      }
                    >
                      {detail.qualityConclusion === 'pass' ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {detail.result && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-2" style={{ color: '#9c8d66' }}>결과</p>
                <div className="border rounded-xl p-4 max-h-[300px] overflow-y-auto" style={{ borderColor: '#e8e4d9' }}>
                  <MarkdownRenderer content={detail.result} />
                </div>
              </div>
            )}

            {/* Bookmark note */}
            {detail.isBookmarked && detail.bookmarkNote && (
              <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: 'rgba(196,98,45,0.06)', border: '1px solid rgba(196,98,45,0.2)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#e07a5f' }}>&#9733; 북마크 메모</p>
                <p className="text-xs" style={{ color: '#e07a5f' }}>{detail.bookmarkNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: '#fcfbf9', border: '1px solid #e8e4d9' }}>
      <p className="text-[10px] mb-0.5" style={{ color: '#9c8d66' }}>{label}</p>
      <p className="text-xs font-medium" style={{ color: '#463e30' }}>{value}</p>
    </div>
  )
}

// === Compare Modal ===

function CompareModal({
  isOpen,
  onClose,
  items,
}: {
  isOpen: boolean
  onClose: () => void
  items: OperationLogItem[]
}) {
  if (!isOpen || items.length < 2) return null

  const [a, b] = items

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        style={{ borderColor: '#e8e4d9' }}
        onClick={e => e.stopPropagation()}
        data-testid="compare-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: '#463e30', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>A/B 비교</h3>
          <button onClick={onClose} className="hover:opacity-70" style={{ color: '#9c8d66' }}>&times;</button>
        </div>

        {/* Comparison bars */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CompareBar label="품질 점수" valueA={a.qualityScore} valueB={b.qualityScore} format={(v) => v?.toFixed(1) || '-'} />
          <CompareBar label="소요시간" valueA={a.durationMs} valueB={b.durationMs} format={(v) => formatDuration(v)} />
          <CompareBar label="비용" valueA={a.totalCostMicro} valueB={b.totalCostMicro} format={(v) => formatCost(v)} />
        </div>

        {/* Side-by-side results */}
        <div className="grid grid-cols-2 gap-4">
          <ComparePanel item={a} label="A" />
          <ComparePanel item={b} label="B" />
        </div>
      </div>
    </div>
  )
}

function CompareBar({
  label,
  valueA,
  valueB,
  format,
}: {
  label: string
  valueA: number | null
  valueB: number | null
  format: (v: number | null) => string
}) {
  return (
    <div className="border rounded-xl p-4" style={{ borderColor: '#e8e4d9' }}>
      <p className="text-[10px] mb-2 text-center" style={{ color: '#9c8d66' }}>{label}</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold" style={{ color: '#e57373' }}>{format(valueA)}</span>
        <span className="text-[10px]" style={{ color: '#9c8d66' }}>vs</span>
        <span className="text-xs font-bold" style={{ color: '#e07a5f' }}>{format(valueB)}</span>
      </div>
    </div>
  )
}

function ComparePanel({ item, label }: { item: OperationLogItem; label: string }) {
  const detailQuery = useQuery({
    queryKey: ['operation-log-detail', item.id],
    queryFn: () => api.get<DetailResponse>(`/workspace/operation-log/${item.id}`),
  })

  const detail = detailQuery.data?.data

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: '#e8e4d9' }}>
      <div className="px-3 py-2 border-b" style={{ backgroundColor: '#fcfbf9', borderColor: '#e8e4d9' }}>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold"
            style={label === 'A'
              ? { backgroundColor: 'rgba(90,114,71,0.1)', color: '#e57373' }
              : { backgroundColor: 'rgba(196,98,45,0.1)', color: '#e07a5f' }
            }
          >
            {label}
          </span>
          <span className="text-[11px]" style={{ color: '#9c8d66' }}>{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-xs mt-1 truncate" style={{ color: '#463e30' }}>{item.text}</p>
      </div>
      <div className="p-3 max-h-[400px] overflow-y-auto">
        {detailQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: '#f2f0e9' }} />
          </div>
        ) : detail?.result ? (
          <MarkdownRenderer content={detail.result} />
        ) : (
          <p className="text-xs" style={{ color: '#9c8d66' }}>결과 없음</p>
        )}
      </div>
    </div>
  )
}
