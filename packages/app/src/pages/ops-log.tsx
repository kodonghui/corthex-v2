import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Badge, Input, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast } from '@corthex/ui'
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

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'error' | 'info' | 'warning' | 'default' }> = {
  completed: { label: '완료', variant: 'success' },
  processing: { label: '진행중', variant: 'info' },
  pending: { label: '대기', variant: 'warning' },
  failed: { label: '실패', variant: 'error' },
  cancelled: { label: '취소', variant: 'default' },
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
    if (statusFilter) chips.push({ key: 'status', label: `상태: ${STATUS_BADGE[statusFilter]?.label || statusFilter}`, onRemove: () => { setStatusFilter(''); setPage(1) } })
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">작전일지</h2>
        <div className="flex items-center gap-2">
          {selectedIds.size === 2 && (
            <button
              onClick={() => setCompareOpen(true)}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              비교
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            내보내기
          </button>
        </div>
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
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="">전체 유형</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="">전체 상태</option>
          {Object.entries(STATUS_BADGE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setBookmarkedOnly(!bookmarkedOnly); setPage(1) }}
          className={`text-xs h-8 px-3 rounded border transition-colors ${
            bookmarkedOnly
              ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          ★ 북마크
        </button>
      </div>

      {/* Filter chips */}
      {filterChips.length > 0 && (
        <div className="px-4 md:px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
          {filterChips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 ml-0.5"
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
            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-2 py-1"
          >
            전체 초기화
          </button>
        </div>
      )}

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div className="px-4 md:px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
          <span className="text-xs text-indigo-600 dark:text-indigo-400">
            {selectedIds.size}개 선택됨 {selectedIds.size < 2 && '(비교하려면 2개를 선택하세요)'}
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            선택 해제
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 md:px-6 py-3">
        {listQuery.isLoading ? (
          <SkeletonTable rows={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">📋</span>}
            title="보고된 작전이 없습니다"
            description="사령관실에서 명령을 내리면 작전일지가 기록됩니다."
            action={
              <button
                onClick={() => navigate('/command-center')}
                className="mt-2 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                사령관실로 이동
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
                  <th className="text-left py-2 pr-2 font-medium w-8">
                    <span className="sr-only">선택</span>
                  </th>
                  <th className="text-left py-2 pr-3 font-medium">시간</th>
                  <th className="text-left py-2 pr-3 font-medium">명령</th>
                  <th className="text-left py-2 pr-3 font-medium">유형</th>
                  <th className="text-left py-2 pr-3 font-medium">상태</th>
                  <th className="text-left py-2 pr-3 font-medium">에이전트</th>
                  <th className="text-left py-2 pr-3 font-medium">품질</th>
                  <th className="text-right py-2 pr-3 font-medium">소요시간</th>
                  <th className="text-center py-2 font-medium w-8">★</th>
                  <th className="text-center py-2 font-medium w-8">
                    <span className="sr-only">메뉴</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                    onClick={() => setDetailId(item.id)}
                  >
                    <td className="py-2.5 pr-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        disabled={!selectedIds.has(item.id) && selectedIds.size >= 2}
                        className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-zinc-500 whitespace-nowrap">{formatTime(item.createdAt)}</td>
                    <td className="py-2.5 pr-3 text-xs truncate max-w-[200px]" title={item.text}>{item.text}</td>
                    <td className="py-2.5 pr-3">
                      <Badge variant="default">{TYPE_LABELS[item.type] || item.type}</Badge>
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs">{item.targetAgentName || '-'}</td>
                    <td className="py-2.5 pr-3">
                      <QualityBar score={item.qualityScore} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-right text-zinc-500">{formatDuration(item.durationMs)}</td>
                    <td className="py-2.5 text-center" onClick={e => handleBookmarkToggle(item, e)}>
                      <button className="text-sm hover:scale-110 transition-transform">
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
        <div className="px-4 md:px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{total.toLocaleString()}건</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              이전
            </button>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
      <ConfirmDialog
        isOpen={!!replayConfirm}
        onConfirm={confirmReplay}
        onCancel={() => setReplayConfirm(null)}
        title="명령 리플레이"
        description="동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다."
        confirmText="실행"
        cancelText="취소"
      />
    </div>
  )
}

// === Sub-components ===

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_BADGE[status] || { label: status, variant: 'default' as const }
  return <Badge variant={info.variant}>{info.label}</Badge>
}

function QualityBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-zinc-400">-</span>
  const pct = Math.round(score * 20) // 0-5 scale -> 0-100%
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-zinc-500 w-6 text-right">{score.toFixed(1)}</span>
    </div>
  )
}

function RowMenu({ onReplay, onCopy }: { onReplay: () => void; onCopy: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-1"
      >
        ⋮
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[100px]">
            <button
              onClick={() => { onReplay(); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              리플레이
            </button>
            <button
              onClick={() => { onCopy(); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[85vh] overflow-y-auto">
      {isLoading || !detail ? (
        <div className="py-8 text-center text-sm text-zinc-400">로딩 중...</div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">작전 상세</h3>
              <p className="text-[11px] text-zinc-500">{formatTime(detail.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCopy(detail.text)}
                className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                복사
              </button>
              <button
                onClick={() => onReplay(detail.text)}
                className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                리플레이
              </button>
            </div>
          </div>

          {/* Command text */}
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 mb-1">명령</p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{detail.text}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <MetaCard label="유형" value={TYPE_LABELS[detail.type] || detail.type} />
            <MetaCard label="상태" value={STATUS_BADGE[detail.status]?.label || detail.status} />
            <MetaCard label="에이전트" value={detail.targetAgentName || '-'} />
            <MetaCard label="소요시간" value={formatDuration(detail.durationMs)} />
          </div>

          {/* Quality */}
          {detail.qualityScore != null && (
            <div className="mb-4 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <p className="text-xs font-medium text-zinc-500 mb-2">품질 평가</p>
              <div className="flex items-center gap-3">
                <QualityBar score={detail.qualityScore} />
                {detail.qualityConclusion && (
                  <Badge variant={detail.qualityConclusion === 'pass' ? 'success' : 'error'}>
                    {detail.qualityConclusion === 'pass' ? 'PASS' : 'FAIL'}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {detail.result && (
            <div className="mb-4">
              <p className="text-xs font-medium text-zinc-500 mb-2">결과</p>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                <MarkdownRenderer content={detail.result} />
              </div>
            </div>
          )}

          {/* Bookmark note */}
          {detail.isBookmarked && detail.bookmarkNote && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">★ 북마크 메모</p>
              <p className="text-xs text-amber-600 dark:text-amber-300">{detail.bookmarkNote}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded">
      <p className="text-[10px] text-zinc-400 mb-0.5">{label}</p>
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{value}</p>
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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">A/B 비교</h3>

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
    </Modal>
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
    <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
      <p className="text-[10px] text-zinc-400 mb-2 text-center">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{format(valueA)}</span>
        <span className="text-[10px] text-zinc-400">vs</span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{format(valueB)}</span>
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
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Badge variant={label === 'A' ? 'info' : 'success'}>{label}</Badge>
          <span className="text-[11px] text-zinc-500">{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 truncate">{item.text}</p>
      </div>
      <div className="p-3 max-h-[400px] overflow-y-auto">
        {detailQuery.isLoading ? (
          <p className="text-xs text-zinc-400">로딩 중...</p>
        ) : detail?.result ? (
          <MarkdownRenderer content={detail.result} />
        ) : (
          <p className="text-xs text-zinc-400">결과 없음</p>
        )}
      </div>
    </div>
  )
}
