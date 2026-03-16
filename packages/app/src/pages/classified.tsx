import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'
import { MarkdownRenderer } from '../components/markdown-renderer'

// === Types ===

type Classification = 'public' | 'internal' | 'confidential' | 'secret'

type ArchiveItem = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  tags: string[]
  folderId: string | null
  folderName: string | null
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null
  commandType: string
  createdAt: string
}

type ArchiveDetail = ArchiveItem & {
  content: string | null
  commandId: string
  commandText: string
  delegationChain: { agentName: string; role: string; status: string }[]
  qualityReview: { score: number; conclusion: string; feedback: string } | null
  costRecords: { model: string; inputTokens: number; outputTokens: number; costMicro: number }[]
  similarDocuments: SimilarDocument[]
}

type SimilarDocument = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  agentName: string | null
  qualityScore: number | null
  similarityScore: number
  createdAt: string
}

type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

type ArchiveStats = {
  totalDocuments: number
  byClassification: Record<Classification, number>
  byDepartment: { departmentId: string; departmentName: string; count: number }[]
  recentWeekCount: number
}

type PaginatedResponse = {
  data: { items: ArchiveItem[]; page: number; limit: number; total: number }
}

// === Constants ===

const PAGE_SIZE = 20

const CLASSIFICATION_CONFIG: Record<Classification, { label: string; classes: string }> = {
  public: { label: '공개', classes: 'bg-emerald-500/15 text-emerald-400' },
  internal: { label: '내부', classes: 'bg-blue-500/15 text-blue-400' },
  confidential: { label: '기밀', classes: 'bg-amber-500/15 text-amber-400' },
  secret: { label: '극비', classes: 'bg-red-500/15 text-red-400' },
}

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  public: 'bg-emerald-500',
  internal: 'bg-blue-500',
  confidential: 'bg-amber-500',
  secret: 'bg-red-500',
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'date', label: '날짜순' },
  { value: 'classification', label: '등급순' },
  { value: 'qualityScore', label: '품질순' },
]

const inputClasses = 'bg-slate-900/50 border border-slate-600 focus:border-blue-500 text-slate-50 rounded-lg outline-none'

// === Helpers ===

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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

// === Main Page ===

export function ClassifiedPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // View state
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showFolderTree, setShowFolderTree] = useState(true)

  // Filter state
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [classificationFilter, setClassificationFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  // Build query params
  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (classificationFilter) params.set('classification', classificationFilter)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (sortBy !== 'date') params.set('sortBy', sortBy)
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    return params.toString()
  }, [page, debouncedSearch, classificationFilter, startDate, endDate, sortBy, selectedFolderId])

  // Queries
  const listQuery = useQuery({
    queryKey: ['archive', page, debouncedSearch, classificationFilter, startDate, endDate, sortBy, selectedFolderId],
    queryFn: () => api.get<PaginatedResponse>(`/workspace/archive?${buildParams()}`),
  })

  const statsQuery = useQuery({
    queryKey: ['archive-stats'],
    queryFn: () => api.get<{ data: ArchiveStats }>('/workspace/archive/stats'),
  })

  const foldersQuery = useQuery({
    queryKey: ['archive-folders'],
    queryFn: () => api.get<{ data: ArchiveFolder[] }>('/workspace/archive/folders'),
  })

  const detailQuery = useQuery({
    queryKey: ['archive-detail', detailId],
    queryFn: () => api.get<{ data: ArchiveDetail }>(`/workspace/archive/${detailId}`),
    enabled: !!detailId,
  })

  const items = listQuery.data?.data?.items ?? []
  const total = listQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const stats = statsQuery.data?.data ?? null
  const folders = foldersQuery.data?.data ?? []
  const detail = detailQuery.data?.data ?? null

  // Filter chips
  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (debouncedSearch) chips.push({ key: 'search', label: `검색: ${debouncedSearch}`, onRemove: () => { setSearchInput(''); setPage(1) } })
    if (classificationFilter) chips.push({
      key: 'classification',
      label: `등급: ${CLASSIFICATION_CONFIG[classificationFilter as Classification]?.label || classificationFilter}`,
      onRemove: () => { setClassificationFilter(''); setPage(1) },
    })
    if (startDate) chips.push({ key: 'startDate', label: `시작: ${startDate}`, onRemove: () => { setStartDate(''); setPage(1) } })
    if (endDate) chips.push({ key: 'endDate', label: `종료: ${endDate}`, onRemove: () => { setEndDate(''); setPage(1) } })
    if (selectedFolderId) {
      const folderName = findFolderName(folders, selectedFolderId)
      chips.push({ key: 'folder', label: `폴더: ${folderName || '선택됨'}`, onRemove: () => { setSelectedFolderId(null); setPage(1) } })
    }
    return chips
  }, [debouncedSearch, classificationFilter, startDate, endDate, selectedFolderId, folders])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/archive/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive'] })
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] })
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      setDetailId(null)
      toast.success('문서가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  return (
    <div data-testid="classified-page" className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* No top header -- Stitch uses a full-height 3-panel layout */}

      {/* Security warning banner (mobile) */}
      <div className="md:hidden px-4 py-3 border-b border-slate-800">
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">⚠</span>
            <p className="text-red-400 text-sm font-bold uppercase tracking-wider">고도 보안 구역</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            이 구역의 데이터는 암호화되어 있으며, 모든 접근 시 보안 로그가 기록됩니다.
          </p>
        </div>
      </div>

      {/* Main 3-panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Library Tree (240px) */}
        {showFolderTree && (
          <>
            <div className="md:hidden fixed inset-0 bg-black/40 z-10" onClick={() => setShowFolderTree(false)} />
            <aside data-testid="folder-sidebar" className="fixed md:relative left-0 top-0 h-full z-20 w-[240px] flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-slate-50 text-sm font-semibold leading-tight">Library</h1>
                  <p className="text-slate-400 text-xs font-normal leading-tight">Archive System</p>
                </div>
              </div>
              {/* Stats */}
              {stats && <StatsCard stats={stats} />}
              <div className="flex-1 overflow-y-auto">
                <FolderTree
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={(id) => { setSelectedFolderId(id); setPage(1); setDetailId(null); setShowFolderTree(false) }}
                  queryClient={queryClient}
                />
              </div>
            </aside>
          </>
        )}

        {/* Center Panel: Archive List */}
        <section className="flex-1 min-w-[300px] border-r border-slate-800 flex flex-col bg-slate-950">
          {/* List header with filter + sort */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFolderTree(!showFolderTree)}
                className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h3 className="text-slate-50 font-semibold text-sm">{selectedFolderId ? (findFolderName(folders, selectedFolderId) || '폴더') : '전체 문서'} ({total})</h3>
            </div>
            <div className="flex gap-2">
              <select
                value={classificationFilter}
                onChange={(e) => { setClassificationFilter(e.target.value); setPage(1) }}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-1.5"
              >
                <option value="">전체 등급</option>
                {(Object.entries(CLASSIFICATION_CONFIG) as [Classification, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-md px-2 py-1.5"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div data-testid="filter-bar" className="px-4 py-2 border-b border-slate-800">
            <input
              placeholder="검색..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
              className="w-full text-xs px-3 py-1.5 bg-slate-900/50 border border-slate-800 focus:border-cyan-400 text-slate-50 rounded-lg outline-none"
            />
          </div>

          {/* Filter chips */}
          {filterChips.length > 0 && (
            <div data-testid="filter-chips" className="px-4 py-2 border-b border-slate-800/50 flex flex-wrap items-center gap-1.5">
              {filterChips.map(chip => (
                <span
                  key={chip.key}
                  className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] px-2.5 py-1 rounded-full"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="hover:text-blue-200 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  setSearchInput(''); setClassificationFilter(''); setStartDate(''); setEndDate('')
                  setSortBy('date'); setSelectedFolderId(null); setPage(1)
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 ml-2"
              >
                전체 초기화
              </button>
            </div>
          )}

          {/* Document list - Stitch card-style items */}
          <div className="flex-1 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="px-4 py-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-900/30 rounded animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div data-testid="classified-empty-state" className="flex-1 flex flex-col items-center justify-center py-16">
                <p className="text-3xl mb-3">🔒</p>
                <p className="text-sm font-medium text-slate-300">아카이브된 문서가 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">사령관실에서 완료된 명령의 결과를 아카이브하면 기밀문서에 보관됩니다.</p>
                <button
                  onClick={() => navigate('/command-center')}
                  className="mt-3 px-4 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-500"
                >
                  사령관실로 이동
                </button>
              </div>
            ) : (
              items.map(item => {
                const isActive = detailId === item.id
                const clsColor = item.classification === 'secret' ? 'bg-red-500' : item.classification === 'confidential' ? 'bg-amber-500' : item.classification === 'internal' ? 'bg-blue-500' : 'bg-slate-500'
                return (
                  <div
                    key={item.id}
                    data-testid={`doc-row-${item.id}`}
                    className={`flex gap-4 px-4 py-3 border-b border-slate-800 cursor-pointer transition-colors relative ${
                      isActive ? 'bg-slate-900 hover:bg-slate-900' : 'hover:bg-slate-900'
                    }`}
                    onClick={() => setDetailId(item.id)}
                  >
                    {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${clsColor}`} />}
                    <div className="flex items-start gap-4 w-full">
                      <div className="text-slate-50 flex items-center justify-center rounded-md bg-slate-800 shrink-0 size-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-slate-50 text-sm font-medium leading-normal truncate">{item.title}</p>
                          <ClassificationBadge classification={item.classification} />
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono tabular-nums text-slate-400">
                          <span>Accessed: {formatDate(item.createdAt)}</span>
                          {item.agentName && <span>{item.agentName}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div data-testid="pagination" className="px-4 py-3 border-t border-slate-800 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1"
              >
                ← 이전
              </button>
              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1"
              >
                다음 →
              </button>
            </div>
          )}
        </section>

        {/* Right Panel: Document Detail (400px) */}
        {detailId ? (
          <article className="w-[400px] flex-shrink-0 bg-slate-900 flex flex-col hidden lg:flex">
            <DocumentDetailView
              detail={detail}
              isLoading={detailQuery.isLoading}
              onBack={() => setDetailId(null)}
              onNavigate={(id) => setDetailId(id)}
              onDelete={(id) => setDeleteConfirmId(id)}
              queryClient={queryClient}
              folders={folders}
            />
          </article>
        ) : null}
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-50 mb-2">문서 삭제</h3>
            <p className="text-xs text-slate-400 mb-4">이 기밀문서를 삭제하시겠습니까? 삭제된 문서는 복원할 수 있습니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg border border-slate-600 hover:bg-slate-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId)
                  setDeleteConfirmId(null)
                }}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// === Stats Card ===

function StatsCard({ stats }: { stats: ArchiveStats }) {
  const total = stats.totalDocuments
  return (
    <div className="px-3 py-3 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">전체 문서</span>
        <span className="text-sm font-semibold text-slate-50">{total}</span>
      </div>
      <p className="text-[10px] text-slate-500 mt-0.5">최근 7일: {stats.recentWeekCount}건</p>

      {/* Classification distribution bar */}
      {total > 0 && (
        <>
          <div className="flex w-full h-2 rounded-full overflow-hidden mt-2 bg-slate-700">
            {(Object.entries(CLASSIFICATION_COLORS) as [Classification, string][]).map(([cls, color]) => {
              const count = stats.byClassification[cls] || 0
              const pct = (count / total) * 100
              return pct > 0 ? (
                <div key={cls} className={color} style={{ width: `${pct}%` }} title={`${CLASSIFICATION_CONFIG[cls].label}: ${count}`} />
              ) : null
            })}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {(Object.entries(CLASSIFICATION_CONFIG) as [Classification, { label: string }][]).map(([cls, info]) => {
              const count = stats.byClassification[cls] || 0
              return count > 0 ? (
                <span key={cls} className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${CLASSIFICATION_COLORS[cls]}`} />
                  {info.label} {count}
                </span>
              ) : null
            })}
          </div>
        </>
      )}
    </div>
  )
}

// === Folder Tree ===

function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  queryClient,
}: {
  folders: ArchiveFolder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [creating, setCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const createInputRef = useRef<HTMLInputElement>(null)
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)

  const createFolderMutation = useMutation({
    mutationFn: (data: { name: string; parentId?: string }) =>
      api.post('/workspace/archive/folders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      setCreating(false)
      setNewFolderName('')
      toast.success('폴더가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/archive/folders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      onSelectFolder(null)
      toast.success('폴더가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => {
    if (creating) createInputRef.current?.focus()
  }, [creating])

  const handleCreateSubmit = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate({ name: newFolderName.trim() })
    } else {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400">폴더</span>
        <button
          onClick={() => setCreating(true)}
          className="text-slate-500 hover:text-slate-300 text-xs"
          title="새 폴더"
        >
          +
        </button>
      </div>

      {/* "All" option */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors ${
          selectedFolderId === null
            ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
        }`}
      >
        전체
      </button>

      {/* Folder nodes */}
      {folders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onRequestDelete={(id) => setDeleteFolderId(id)}
          queryClient={queryClient}
        />
      ))}

      {/* New folder input */}
      {creating && (
        <div className="px-3 py-1.5">
          <input
            ref={createInputRef}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit()
              if (e.key === 'Escape') { setCreating(false); setNewFolderName('') }
            }}
            onBlur={handleCreateSubmit}
            className={`w-full text-xs px-2 py-1 ${inputClasses}`}
            placeholder="새 폴더"
          />
        </div>
      )}

      {/* Folder delete confirm */}
      {deleteFolderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteFolderId(null)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-50 mb-2">폴더 삭제</h3>
            <p className="text-xs text-slate-400 mb-4">이 폴더를 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteFolderId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg border border-slate-600 hover:bg-slate-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (deleteFolderId) deleteFolderMutation.mutate(deleteFolderId)
                  setDeleteFolderId(null)
                }}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FolderNode({
  folder,
  depth,
  selectedFolderId,
  onSelectFolder,
  onRequestDelete,
  queryClient,
}: {
  folder: ArchiveFolder
  depth: number
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onRequestDelete: (id: string) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const renameMutation = useMutation({
    mutationFn: (name: string) => api.patch(`/workspace/archive/folders/${folder.id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      setEditing(false)
      toast.success('이름이 변경되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => {
    if (editing) editInputRef.current?.focus()
  }, [editing])

  const handleRenameSubmit = () => {
    if (editName.trim() && editName.trim() !== folder.name) {
      renameMutation.mutate(editName.trim())
    } else {
      setEditing(false)
      setEditName(folder.name)
    }
  }

  const isSelected = selectedFolderId === folder.id

  return (
    <div>
      {editing ? (
        <div style={{ paddingLeft: `${depth * 12 + 12}px` }} className="py-0.5 pr-3">
          <input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') { setEditing(false); setEditName(folder.name) }
            }}
            onBlur={handleRenameSubmit}
            className="bg-slate-800 border border-slate-600 text-xs px-1.5 py-0.5 rounded w-full outline-none text-slate-50"
          />
        </div>
      ) : (
        <div className="relative group">
          <div
            onClick={() => onSelectFolder(folder.id)}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
            className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-500">📁</span>
              <span className="truncate max-w-[120px]">{folder.name}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
              {folder.documentCount > 0 && (
                <span className="text-[10px] text-slate-600">{folder.documentCount}</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
                className="text-slate-600 hover:text-slate-400 px-1"
              >
                ⋮
              </button>
            </div>
          </div>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[100px]">
                <button
                  onClick={() => { setEditing(true); setEditName(folder.name); setShowMenu(false) }}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-slate-700/50 text-slate-300"
                >
                  이름 변경
                </button>
                <button
                  onClick={() => { onRequestDelete(folder.id); setShowMenu(false) }}
                  className="w-full text-left text-xs px-3 py-1.5 hover:bg-slate-700/50 text-red-400"
                >
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {/* Children */}
      {folder.children.map(child => (
        <FolderNode
          key={child.id}
          folder={child}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onRequestDelete={onRequestDelete}
          queryClient={queryClient}
        />
      ))}
    </div>
  )
}

// === Document Detail View ===

function DocumentDetailView({
  detail,
  isLoading,
  onBack,
  onNavigate,
  onDelete,
  queryClient,
  folders,
}: {
  detail: ArchiveDetail | null
  isLoading: boolean
  onBack: () => void
  onNavigate: (id: string) => void
  onDelete: (id: string) => void
  queryClient: ReturnType<typeof useQueryClient>
  folders: ArchiveFolder[]
}) {
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<{
    title: string
    classification: Classification
    summary: string
    tags: string
    folderId: string
  }>({ title: '', classification: 'internal', summary: '', tags: '', folderId: '' })

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string; classification?: string; summary?: string; tags?: string[]; folderId?: string | null }) =>
      api.patch(`/workspace/archive/${detail!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive'] })
      queryClient.invalidateQueries({ queryKey: ['archive-detail', detail!.id] })
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] })
      queryClient.invalidateQueries({ queryKey: ['archive-folders'] })
      setEditing(false)
      toast.success('문서가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const startEditing = useCallback(() => {
    if (!detail) return
    setEditForm({
      title: detail.title,
      classification: detail.classification,
      summary: detail.summary || '',
      tags: detail.tags.join(', '),
      folderId: detail.folderId || '',
    })
    setEditing(true)
  }, [detail])

  const handleSave = useCallback(() => {
    const tags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    updateMutation.mutate({
      title: editForm.title,
      classification: editForm.classification,
      summary: editForm.summary || undefined,
      tags,
      folderId: editForm.folderId || null,
    })
  }, [editForm, updateMutation])

  if (isLoading || !detail) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const totalCost = detail.costRecords.reduce((sum, r) => sum + r.costMicro, 0)

  return (
    <div data-testid="document-detail" className="flex-1 flex overflow-hidden">
      {/* Detail main */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                className={`text-sm font-semibold w-full px-3 py-1.5 ${inputClasses}`}
              />
            ) : (
              <h3 className="text-sm font-semibold text-slate-50">{detail.title}</h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              {editing ? (
                <select
                  value={editForm.classification}
                  onChange={(e) => setEditForm(f => ({ ...f, classification: e.target.value as Classification }))}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
                >
                  {(Object.entries(CLASSIFICATION_CONFIG) as [Classification, { label: string }][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              ) : (
                <ClassificationBadge classification={detail.classification} />
              )}
              <span className="text-[10px] text-slate-500 font-mono">{formatDate(detail.createdAt)}</span>
              {detail.agentName && <span className="text-[10px] text-slate-400">· {detail.agentName}</span>}
              {detail.departmentName && <span className="text-[10px] text-slate-400">· {detail.departmentName}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="text-xs text-slate-400 px-2 py-1 rounded hover:bg-slate-700/50">취소</button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg">저장</button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700/50">편집</button>
                <button onClick={() => onDelete(detail.id)} className="text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded">삭제</button>
              </>
            )}
          </div>
        </div>

        {/* Summary (editable) */}
        {editing ? (
          <div>
            <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1 block">요약</label>
            <textarea
              value={editForm.summary}
              onChange={(e) => setEditForm(f => ({ ...f, summary: e.target.value }))}
              className={`w-full text-xs p-3 h-20 resize-none ${inputClasses}`}
              placeholder="요약 입력..."
            />
          </div>
        ) : detail.summary ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-300">{detail.summary}</p>
          </div>
        ) : null}

        {/* Tags (editable) */}
        {editing ? (
          <div>
            <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1 block">태그 (쉼표 구분)</label>
            <input
              value={editForm.tags}
              onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value }))}
              className={`w-full text-xs px-3 py-2 ${inputClasses}`}
              placeholder="태그1, 태그2, ..."
            />
          </div>
        ) : detail.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {detail.tags.map(tag => (
              <span key={tag} className="bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Folder (editable) */}
        {editing && (
          <div>
            <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1 block">폴더</label>
            <select
              value={editForm.folderId}
              onChange={(e) => setEditForm(f => ({ ...f, folderId: e.target.value }))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
            >
              <option value="">폴더 없음</option>
              {flattenFolders(folders).map(f => (
                <option key={f.id} value={f.id}>{f.indent}{f.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Meta cards */}
        <div className="grid grid-cols-3 gap-3">
          <MetaCard label="품질 점수" value={detail.qualityScore != null ? detail.qualityScore.toFixed(1) : '-'} />
          <MetaCard label="비용" value={formatCost(totalCost)} />
          <MetaCard label="명령 유형" value={detail.commandType || '-'} />
        </div>

        {/* Quality review */}
        {detail.qualityReview && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">품질 리뷰</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                detail.qualityReview.conclusion === 'pass'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              }`}>
                {detail.qualityReview.conclusion === 'pass' ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">점수: {detail.qualityReview.score}/5</p>
            {detail.qualityReview.feedback && (
              <p className="text-xs text-slate-300 mt-2">{detail.qualityReview.feedback}</p>
            )}
          </div>
        )}

        {/* Delegation chain */}
        {detail.delegationChain.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-300 mb-2">위임 체인</p>
            <div className="flex items-center flex-wrap gap-1">
              {detail.delegationChain.map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-600">→</span>}
                  <span className="text-[10px] bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                    {step.agentName}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {detail.content && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-[500px] overflow-y-auto">
            <MarkdownRenderer content={detail.content} />
          </div>
        )}

        {/* Original command */}
        {detail.commandText && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 font-medium mb-1">원본 명령</p>
            <p className="text-xs text-slate-300 font-mono">{detail.commandText}</p>
          </div>
        )}
      </div>

      {/* Similar documents sidebar */}
      {detail.similarDocuments.length > 0 && (
        <div data-testid="similar-docs-sidebar" className="w-56 lg:w-64 border-l border-slate-700 bg-slate-900/80 overflow-y-auto flex-shrink-0">
          <div className="px-3 py-3 border-b border-slate-700">
            <span className="text-xs font-medium text-slate-400">유사 문서</span>
          </div>
          {detail.similarDocuments.map(doc => (
            <div
              key={doc.id}
              onClick={() => onNavigate(doc.id)}
              className="px-3 py-2.5 border-b border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <p className="text-xs font-medium text-slate-200 truncate">{doc.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <ClassificationBadge classification={doc.classification} small />
                <span className="text-[10px] font-mono text-cyan-400">{doc.similarityScore}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(doc.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// === Sub-components ===

function ClassificationBadge({ classification, small }: { classification: Classification; small?: boolean }) {
  const borderMap: Record<Classification, string> = {
    secret: 'bg-red-500/20 text-red-400 border border-red-500/30',
    confidential: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
    internal: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    public: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  }
  const labelMap: Record<Classification, string> = {
    secret: '1급 기밀',
    confidential: '2급 기밀',
    internal: '3급 기밀',
    public: '공개',
  }
  const cls = borderMap[classification] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
  const label = small ? (CLASSIFICATION_CONFIG[classification]?.label?.[0] || classification[0]) : (labelMap[classification] || classification)
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  )
}

function QualityBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-[10px] text-slate-500">-</span>
  const pct = Math.round(score * 20)
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400">{score.toFixed(1)}/5</span>
    </div>
  )
}

function TagList({ tags, max }: { tags: string[]; max: number }) {
  if (tags.length === 0) return <span className="text-[10px] text-slate-500">-</span>
  const shown = tags.slice(0, max)
  const rest = tags.length - max
  return (
    <div className="flex items-center gap-1">
      {shown.map(tag => (
        <span key={tag} className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
          {tag}
        </span>
      ))}
      {rest > 0 && <span className="text-[10px] text-slate-500">+{rest}</span>}
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-50 mt-1">{value}</p>
    </div>
  )
}

// === Utility ===

function findFolderName(folders: ArchiveFolder[], id: string): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name
    const found = findFolderName(f.children, id)
    if (found) return found
  }
  return null
}

function flattenFolders(folders: ArchiveFolder[], depth = 0): { id: string; name: string; indent: string }[] {
  const result: { id: string; name: string; indent: string }[] = []
  for (const f of folders) {
    result.push({ id: f.id, name: f.name, indent: '  '.repeat(depth) })
    result.push(...flattenFolders(f.children, depth + 1))
  }
  return result
}
