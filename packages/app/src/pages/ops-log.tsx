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

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400',
  processing: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-amber-500/20 text-amber-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-slate-700 text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  completed: '완료',
  processing: '진행중',
  pending: '대기',
  failed: '실패',
  cancelled: '취소',
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
  if (score >= 4) return 'bg-emerald-500'
  if (score >= 3) return 'bg-amber-500'
  return 'bg-red-500'
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
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      toast.success('명령이 복사되었습니다')
    }
  }, [])

  const selectInputClass = 'bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm'

  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="ops-log-page">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-50">작전일지</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size === 2 && (
            <button
              onClick={() => setCompareOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
              data-testid="compare-btn"
            >
              비교
            </button>
          )}
          <button
            onClick={handleExport}
            className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
            data-testid="export-btn"
          >
            내보내기
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-2 items-center" data-testid="filters-row">
        <input
          placeholder="검색..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-1.5 text-sm w-48"
          data-testid="search-input"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className={selectInputClass}
        />
        <span className="text-sm text-slate-500">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className={selectInputClass}
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className={selectInputClass}
        >
          <option value="">전체 유형</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className={selectInputClass}
        >
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
          className={selectInputClass}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setBookmarkedOnly(!bookmarkedOnly); setPage(1) }}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            bookmarkedOnly
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
              : 'border-slate-600 text-slate-400 hover:bg-slate-800'
          }`}
          data-testid="bookmark-filter"
        >
          ★ 북마크
        </button>
      </div>

      {/* Filter chips */}
      {filterChips.length > 0 && (
        <div className="px-6 py-2 border-b border-slate-700/30 flex flex-wrap gap-1.5">
          {filterChips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-blue-500/10 text-blue-400 rounded-full"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="text-blue-300 hover:text-blue-200 ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setSearchInput(''); setStartDate(''); setEndDate('')
              setTypeFilter(''); setStatusFilter(''); setBookmarkedOnly(false)
              setPage(1)
            }}
            className="text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1"
          >
            전체 초기화
          </button>
        </div>
      )}

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-2 bg-blue-600/10 border-b border-blue-500/20 flex items-center justify-between">
          <span className="text-xs text-blue-400">
            {selectedIds.size}개 선택됨 {selectedIds.size < 2 && '(비교하려면 2개를 선택하세요)'}
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            선택 해제
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-3" data-testid="ops-table">
        {listQuery.isLoading ? (
          <div className="space-y-3" data-testid="ops-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" data-testid="ops-empty">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm text-slate-400">보고된 작전이 없습니다</p>
            <p className="text-xs text-slate-500 mt-1">사령관실에서 명령을 내리면 작전일지가 기록됩니다.</p>
            <button
              onClick={() => navigate('/command-center')}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm"
            >
              사령관실로 이동
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700 font-medium">
                  <th className="text-left py-2 pr-2 w-8">
                    <span className="sr-only">선택</span>
                  </th>
                  <th className="text-left py-2 pr-3">시간</th>
                  <th className="text-left py-2 pr-3">명령</th>
                  <th className="text-left py-2 pr-3">유형</th>
                  <th className="text-left py-2 pr-3">상태</th>
                  <th className="text-left py-2 pr-3">에이전트</th>
                  <th className="text-left py-2 pr-3">품질</th>
                  <th className="text-right py-2 pr-3">소요시간</th>
                  <th className="text-center py-2 w-8">★</th>
                  <th className="text-center py-2 w-8">
                    <span className="sr-only">메뉴</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setDetailId(item.id)}
                    data-testid={`ops-row-${item.id}`}
                  >
                    <td className="py-2.5 pr-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        disabled={!selectedIds.has(item.id) && selectedIds.size >= 2}
                        className="w-3.5 h-3.5 rounded border-slate-600 accent-blue-500"
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-300 truncate max-w-[200px]" title={item.text}>{item.text}</td>
                    <td className="py-2.5 pr-3">
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">{TYPE_LABELS[item.type] || item.type}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-400">{item.targetAgentName || '-'}</td>
                    <td className="py-2.5 pr-3">
                      <QualityBar score={item.qualityScore} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-right text-slate-500">{formatDuration(item.durationMs)}</td>
                    <td className="py-2.5 text-center" onClick={e => handleBookmarkToggle(item, e)}>
                      <button className={`text-sm hover:scale-110 transition-transform ${item.isBookmarked ? 'text-amber-400' : 'text-slate-500'}`}>
                        {item.isBookmarked ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="py-2.5 text-center" onClick={e => e.stopPropagation()}>
                      <RowMenu
                        onReplay={() => handleReplay(item.text)}
                        onCopy={() => handleCopy(item.text)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between" data-testid="pagination">
          <span className="text-xs text-slate-500">{total.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 disabled:opacity-30 hover:bg-slate-800"
            >
              이전
            </button>
            <span className="text-xs text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 disabled:opacity-30 hover:bg-slate-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">명령 리플레이</h3>
            <p className="text-xs text-slate-400 mb-4">동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplayConfirm(null)}
                className="border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                취소
              </button>
              <button
                onClick={confirmReplay}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
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

// === Sub-components ===

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-700 text-slate-400'
  const label = STATUS_LABELS[status] || status
  return <span className={`text-xs px-2 py-0.5 rounded ${colorClass}`}>{label}</span>
}

function QualityBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-slate-500">-</span>
  const pct = Math.round(score * 20) // 0-5 scale -> 0-100%
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-6 text-right">{score.toFixed(1)}</span>
    </div>
  )
}

function RowMenu({ onReplay, onCopy }: { onReplay: () => void; onCopy: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-slate-500 hover:text-slate-300 px-1"
      >
        ⋮
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 min-w-[100px]">
            <button
              onClick={() => { onReplay(); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              리플레이
            </button>
            <button
              onClick={() => { onCopy(); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              복사
            </button>
          </div>
        </>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
        data-testid="detail-modal"
      >
        {isLoading || !detail ? (
          <div className="py-8 space-y-3">
            <div className="h-4 w-1/3 bg-slate-700 animate-pulse rounded" />
            <div className="h-20 bg-slate-700 animate-pulse rounded-xl" />
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-700 animate-pulse rounded-lg" />)}
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">작전 상세</h3>
                <p className="text-[11px] text-slate-500">{formatTime(detail.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCopy(detail.text)}
                  className="border border-slate-600 text-slate-400 rounded-lg px-3 py-1.5 text-xs hover:bg-slate-700"
                >
                  복사
                </button>
                <button
                  onClick={() => onReplay(detail.text)}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs"
                >
                  리플레이
                </button>
              </div>
            </div>

            {/* Command text */}
            <div className="mb-4 bg-slate-900/70 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">명령</p>
              <p className="text-sm text-slate-200">{detail.text}</p>
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
              <div className="mb-4 border border-slate-700 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-2">품질 평가</p>
                <div className="flex items-center gap-3">
                  <QualityBar score={detail.qualityScore} />
                  {detail.qualityConclusion && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      detail.qualityConclusion === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {detail.qualityConclusion === 'pass' ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {detail.result && (
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">결과</p>
                <div className="border border-slate-700 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                  <MarkdownRenderer content={detail.result} />
                </div>
              </div>
            )}

            {/* Bookmark note */}
            {detail.isBookmarked && detail.bookmarkNote && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-xs font-medium text-amber-400 mb-1">★ 북마크 메모</p>
                <p className="text-xs text-amber-300">{detail.bookmarkNote}</p>
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
    <div className="bg-slate-900/70 rounded-lg p-3">
      <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
      <p className="text-xs font-medium text-slate-300">{value}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
        data-testid="compare-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">A/B 비교</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
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
    <div className="border border-slate-700 rounded-xl p-4">
      <p className="text-[10px] text-slate-500 mb-2 text-center">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-blue-400">{format(valueA)}</span>
        <span className="text-[10px] text-slate-500">vs</span>
        <span className="text-xs font-bold text-emerald-400">{format(valueB)}</span>
      </div>
    </div>
  )
}

function ComparePanel({ item, label }: { item: OperationLogItem; label: string }) {
  // Fetch full detail for result
  const detailQuery = useQuery({
    queryKey: ['operation-log-detail', item.id],
    queryFn: () => api.get<DetailResponse>(`/workspace/operation-log/${item.id}`),
  })

  const detail = detailQuery.data?.data

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-900/70 px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded ${
            label === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>{label}</span>
          <span className="text-[11px] text-slate-500">{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-300 mt-1 truncate">{item.text}</p>
      </div>
      <div className="p-3 max-h-[400px] overflow-y-auto">
        {detailQuery.isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-slate-700 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-slate-700 animate-pulse rounded" />
          </div>
        ) : detail?.result ? (
          <MarkdownRenderer content={detail.result} />
        ) : (
          <p className="text-xs text-slate-500">결과 없음</p>
        )}
      </div>
    </div>
  )
}
