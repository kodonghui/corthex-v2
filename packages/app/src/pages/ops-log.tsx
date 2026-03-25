// API Endpoints:
// GET  /workspace/operation-log?page=&limit=&search=&startDate=&endDate=&type=&status=&sortBy=&bookmarkedOnly=
// GET  /workspace/operation-log/:id
// POST /workspace/operation-log/bookmarks  { commandId }
// DELETE /workspace/operation-log/bookmarks/:id
// GET  /workspace/operation-log/export?search=&startDate=&endDate=&type=&status=&sortBy=

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
  completed: { dotColor: '#4d7c0f', bgColor: 'rgba(77,124,15,0.08)', textColor: '#4d7c0f', borderColor: 'rgba(77,124,15,0.2)', label: 'Success' },
  processing: { dotColor: '#2563eb', bgColor: 'rgba(37,99,235,0.08)', textColor: '#2563eb', borderColor: 'rgba(37,99,235,0.2)', label: 'Running' },
  pending: { dotColor: '#b45309', bgColor: 'rgba(180,83,9,0.08)', textColor: '#b45309', borderColor: 'rgba(180,83,9,0.2)', label: 'Pending' },
  failed: { dotColor: '#dc2626', bgColor: 'rgba(220,38,38,0.08)', textColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', label: 'Critical' },
  cancelled: { dotColor: 'var(--color-corthex-text-secondary)', bgColor: 'rgba(117,110,90,0.1)', textColor: 'var(--color-corthex-text-secondary)', borderColor: 'rgba(117,110,90,0.2)', label: 'Cancelled' },
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
  if (score >= 4) return '#4d7c0f'
  if (score >= 3) return '#b45309'
  return '#dc2626'
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
  const info = STATUS_BADGE_STYLES[status] || { dotColor: 'var(--color-corthex-text-secondary)', bgColor: 'rgba(117,110,90,0.1)', textColor: 'var(--color-corthex-text-secondary)', borderColor: 'rgba(117,110,90,0.2)', label: status }
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
  if (score == null) return <span className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>-</span>
  const pct = Math.round(score * 20)
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-corthex-border)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(score) }} />
      </div>
      <span className="text-[10px] w-6 text-right" style={{ color: 'var(--color-corthex-text-secondary)' }}>{score.toFixed(1)}</span>
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
    backgroundColor: 'var(--color-corthex-bg)',
    borderColor: '#908a78',
    color: 'var(--color-corthex-text-primary)',
  }

  return (
    <div
      data-testid="ops-log-page"
      className="font-sans min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-corthex-bg)', color: 'var(--color-corthex-text-primary)' }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 pb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-corthex-text-primary tracking-tighter">Operations Log</h2>
            <p className="text-corthex-text-secondary mt-1 max-w-2xl">Real-time execution records for the CORTHEX core processing unit and distributed resource network.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-corthex-surface border border-corthex-border p-3 rounded-lg min-w-[120px]">
              <p className="text-[10px] text-corthex-text-secondary uppercase tracking-tighter">Total Events</p>
              <p className="text-xl font-mono text-corthex-text-primary">{total.toLocaleString()}</p>
            </div>
            <div className="bg-corthex-surface border border-corthex-border p-3 rounded-lg min-w-[120px]">
              <p className="text-[10px] text-corthex-text-secondary uppercase tracking-tighter">Errors (24h)</p>
              <p className="text-xl font-mono" style={{ color: '#dc2626' }}>
                {String(items.filter(i => i.status === 'failed').length).padStart(2, '0')}
              </p>
            </div>
            <div className="bg-corthex-surface border border-corthex-border p-3 rounded-lg min-w-[120px]">
              <p className="text-[10px] text-corthex-text-secondary uppercase tracking-tighter">Avg Quality</p>
              <p className="text-xl font-mono text-corthex-accent">
                {items.filter(i => i.qualityScore != null).length > 0
                  ? (items.reduce((sum, i) => sum + (i.qualityScore ?? 0), 0) / items.filter(i => i.qualityScore != null).length).toFixed(1)
                  : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-corthex-border pb-4" data-testid="filters-row">
          <div className="flex gap-1 bg-corthex-surface p-1 rounded-lg border border-corthex-border overflow-x-auto">
            <button
              onClick={() => { setStatusFilter(''); setPage(1) }}
              className="min-h-[44px] px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={statusFilter === '' ? { backgroundColor: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-text-primary)' } : { color: 'var(--color-corthex-text-secondary)' }}
            >
              ALL
            </button>
            {Object.entries(STATUS_LABELS).slice(0, 4).map(([k, v]) => (
              <button
                key={k}
                onClick={() => { setStatusFilter(k); setPage(1) }}
                className="min-h-[44px] px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2"
                style={statusFilter === k ? { backgroundColor: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-text-primary)' } : { color: 'var(--color-corthex-text-secondary)' }}
                data-testid="bookmark-filter"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_BADGE_STYLES[k]?.dotColor || 'var(--color-corthex-text-secondary)' }} />
                {v.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <input
                placeholder="검색..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                className="min-h-[44px] py-1.5 px-3 border border-corthex-border rounded-lg text-base sm:text-xs text-corthex-text-primary bg-corthex-bg w-40"
                data-testid="search-input"
              />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                className="min-h-[44px] py-1.5 px-3 border border-corthex-border rounded-lg text-base sm:text-xs text-corthex-text-primary bg-corthex-bg"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {selectedIds.size === 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="min-h-[44px] text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                data-testid="compare-btn"
              >
                비교
              </button>
            )}
            <button
              onClick={handleExport}
              className="min-h-[44px] text-xs text-corthex-text-secondary flex items-center gap-2 border border-corthex-border px-3 py-1.5 rounded-lg hover:bg-corthex-surface transition-colors"
              data-testid="export-btn"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => { setBookmarkedOnly(!bookmarkedOnly); setPage(1) }}
              className="min-h-[44px] text-xs flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-colors"
              style={bookmarkedOnly
                ? { borderColor: 'rgba(180,83,9,0.3)', color: '#b45309', backgroundColor: 'rgba(180,83,9,0.05)' }
                : { borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }
              }
            >
              <Trash2 className="w-3.5 h-3.5" /> 북마크
            </button>
          </div>
        </div>

        {/* Filter chips */}
        {filterChips.length > 0 && (
          <div className="py-2 flex flex-wrap gap-1.5">
            {filterChips.map(chip => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full"
                style={{ backgroundColor: 'rgba(96,108,56,0.1)', color: 'var(--color-corthex-accent)' }}
              >
                {chip.label}
                <button onClick={chip.onRemove} className="ml-0.5 hover:opacity-70">&times;</button>
              </span>
            ))}
            <button
              onClick={() => { setSearchInput(''); setStartDate(''); setEndDate(''); setTypeFilter(''); setStatusFilter(''); setBookmarkedOnly(false); setPage(1) }}
              className="text-[11px] px-2 py-1 hover:opacity-70 text-corthex-text-secondary"
            >
              전체 초기화
            </button>
          </div>
        )}

        {/* Selection info */}
        {selectedIds.size > 0 && (
          <div className="py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(96,108,56,0.06)' }}>
            <span className="text-xs text-corthex-accent">
              {selectedIds.size}개 선택됨 {selectedIds.size < 2 && '(비교하려면 2개를 선택하세요)'}
            </span>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-corthex-accent hover:opacity-70">선택 해제</button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 mx-3 sm:mx-6 lg:mx-8 my-3 sm:my-4 bg-corthex-bg rounded-xl border border-corthex-border overflow-hidden flex flex-col" data-testid="ops-table">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-corthex-elevated border-b border-corthex-border z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest w-8">
                  <input type="checkbox" className="rounded accent-corthex-accent" />
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">Operation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">Agent / Target</th>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">Result</th>
                <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corthex-border">
              {listQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 rounded animate-pulse bg-corthex-elevated" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center" data-testid="ops-empty">
                    <p className="text-sm font-medium mb-2 text-corthex-text-secondary">보고된 작전이 없습니다</p>
                    <p className="text-xs mb-4 text-corthex-text-secondary">허브에서 명령을 내리면 작전일지가 기록됩니다.</p>
                    <button
                      onClick={() => navigate('/hub')}
                      className="px-4 py-2 text-sm text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                      style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                    >
              허브로 이동
                    </button>
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setDetailId(item.id)}
                    className="cursor-pointer border-b transition-colors hover:bg-corthex-elevated/30"
                    style={{ borderColor: 'var(--color-corthex-border)' }}
                    data-testid={`ops-row-${item.id}`}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        disabled={!selectedIds.has(item.id) && selectedIds.size >= 2}
                        className="w-3.5 h-3.5 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatTime(item.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm line-clamp-2 mb-1" style={{ color: 'var(--color-corthex-text-primary)' }}>{item.text}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--color-corthex-elevated)', color: 'var(--color-corthex-text-secondary)' }}>
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.targetAgentName && (
                        <code className="text-xs font-mono" style={{ color: 'var(--color-corthex-accent)' }}>{item.targetAgentName}</code>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatDuration(item.durationMs)}</span>
                        <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatCost(item.totalCostMicro)}</span>
                        {item.qualityScore != null && <div className="w-20"><QualityBar score={item.qualityScore} /></div>}
                        <button
                          className="text-sm hover:scale-110 transition-transform"
                          style={{ color: item.isBookmarked ? 'var(--color-corthex-accent)' : 'var(--color-corthex-text-secondary)' }}
                          onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(item, e) }}
                        >
                          {item.isBookmarked ? '★' : '☆'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="px-4 sm:px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-corthex-border)' }} data-testid="pagination">
          <span className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>{total.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="min-h-[44px] min-w-[44px] border rounded p-1.5 disabled:opacity-30 hover:opacity-70 transition-colors flex items-center justify-center"
              style={{ borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="min-h-[44px] min-w-[44px] border rounded p-1.5 disabled:opacity-30 hover:opacity-70 transition-colors flex items-center justify-center"
              style={{ borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
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
          <div className="relative bg-corthex-surface border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" style={{ borderColor: 'var(--color-corthex-border)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-corthex-text-primary)', fontFamily: "'Inter', sans-serif" }}>명령 리플레이</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-corthex-text-secondary)' }}>동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplayConfirm(null)}
                className="border rounded-lg px-4 py-2 text-sm hover:opacity-70 transition-colors"
                style={{ borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }}
              >
                취소
              </button>
              <button
                onClick={confirmReplay}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: 'var(--color-corthex-accent)' }}
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
        className="relative bg-corthex-surface border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto p-4 sm:p-6"
        style={{ borderColor: 'var(--color-corthex-border)' }}
        onClick={e => e.stopPropagation()}
        data-testid="detail-modal"
      >
        {isLoading || !detail ? (
          <div className="py-8 space-y-3">
            <div className="h-4 w-1/3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />
            <div className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />)}
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-corthex-text-primary)', fontFamily: "'Inter', sans-serif" }}>작전 상세</h3>
                <p className="text-[11px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatTime(detail.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCopy(detail.text)}
                  className="border rounded-lg px-3 py-1.5 text-xs hover:opacity-70"
                  style={{ borderColor: 'var(--color-corthex-border)', color: 'var(--color-corthex-text-secondary)' }}
                >
                  복사
                </button>
                <button
                  onClick={() => onReplay(detail.text)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-corthex-accent)' }}
                >
                  리플레이
                </button>
              </div>
            </div>

            {/* Command text */}
            <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: 'var(--color-corthex-bg)', border: '1px solid #e5e1d3' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>명령</p>
              <p className="text-sm" style={{ color: 'var(--color-corthex-text-primary)' }}>{detail.text}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <MetaCard label="유형" value={TYPE_LABELS[detail.type] || detail.type} />
              <MetaCard label="상태" value={STATUS_LABELS[detail.status] || detail.status} />
              <MetaCard label="에이전트" value={detail.targetAgentName || '-'} />
              <MetaCard label="소요시간" value={formatDuration(detail.durationMs)} />
            </div>

            {/* Quality */}
            {detail.qualityScore != null && (
              <div className="mb-4 border rounded-xl p-4" style={{ borderColor: 'var(--color-corthex-border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-corthex-text-secondary)' }}>품질 평가</p>
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
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-corthex-text-secondary)' }}>결과</p>
                <div className="border rounded-xl p-4 max-h-[300px] overflow-y-auto" style={{ borderColor: 'var(--color-corthex-border)' }}>
                  <MarkdownRenderer content={detail.result} />
                </div>
              </div>
            )}

            {/* Bookmark note */}
            {detail.isBookmarked && detail.bookmarkNote && (
              <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: 'rgba(196,98,45,0.06)', border: '1px solid rgba(196,98,45,0.2)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#b45309' }}>&#9733; 북마크 메모</p>
                <p className="text-xs" style={{ color: '#b45309' }}>{detail.bookmarkNote}</p>
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
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-corthex-bg)', border: '1px solid #e5e1d3' }}>
      <p className="text-[10px] mb-0.5" style={{ color: 'var(--color-corthex-text-secondary)' }}>{label}</p>
      <p className="text-xs font-medium" style={{ color: 'var(--color-corthex-text-primary)' }}>{value}</p>
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
        className="relative bg-corthex-surface border rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        style={{ borderColor: 'var(--color-corthex-border)' }}
        onClick={e => e.stopPropagation()}
        data-testid="compare-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-corthex-text-primary)', fontFamily: "'Inter', sans-serif" }}>A/B 비교</h3>
          <button onClick={onClose} className="hover:opacity-70" style={{ color: 'var(--color-corthex-text-secondary)' }}>&times;</button>
        </div>

        {/* Comparison bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <CompareBar label="품질 점수" valueA={a.qualityScore} valueB={b.qualityScore} format={(v) => v?.toFixed(1) || '-'} />
          <CompareBar label="소요시간" valueA={a.durationMs} valueB={b.durationMs} format={(v) => formatDuration(v)} />
          <CompareBar label="비용" valueA={a.totalCostMicro} valueB={b.totalCostMicro} format={(v) => formatCost(v)} />
        </div>

        {/* Side-by-side results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    <div className="border rounded-xl p-4" style={{ borderColor: 'var(--color-corthex-border)' }}>
      <p className="text-[10px] mb-2 text-center" style={{ color: 'var(--color-corthex-text-secondary)' }}>{label}</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold" style={{ color: 'var(--color-corthex-accent)' }}>{format(valueA)}</span>
        <span className="text-[10px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>vs</span>
        <span className="text-xs font-bold" style={{ color: '#b45309' }}>{format(valueB)}</span>
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
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--color-corthex-border)' }}>
      <div className="px-3 py-2 border-b" style={{ backgroundColor: 'var(--color-corthex-bg)', borderColor: 'var(--color-corthex-border)' }}>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-bold"
            style={label === 'A'
              ? { backgroundColor: 'rgba(96,108,56,0.1)', color: 'var(--color-corthex-accent)' }
              : { backgroundColor: 'rgba(180,83,9,0.1)', color: '#b45309' }
            }
          >
            {label}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-corthex-text-secondary)' }}>{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-corthex-text-primary)' }}>{item.text}</p>
      </div>
      <div className="p-3 max-h-[400px] overflow-y-auto">
        {detailQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />
          </div>
        ) : detail?.result ? (
          <MarkdownRenderer content={detail.result} />
        ) : (
          <p className="text-xs" style={{ color: 'var(--color-corthex-text-secondary)' }}>결과 없음</p>
        )}
      </div>
    </div>
  )
}
