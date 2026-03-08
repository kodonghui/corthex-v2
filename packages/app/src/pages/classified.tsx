import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Badge, Input, SkeletonTable, EmptyState, ConfirmDialog, toast } from '@corthex/ui'
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

const CLASSIFICATION_BADGE: Record<Classification, { label: string; variant: 'success' | 'info' | 'warning' | 'error' }> = {
  public: { label: '공개', variant: 'success' },
  internal: { label: '내부', variant: 'info' },
  confidential: { label: '기밀', variant: 'warning' },
  secret: { label: '극비', variant: 'error' },
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
      label: `등급: ${CLASSIFICATION_BADGE[classificationFilter as Classification]?.label || classificationFilter}`,
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFolderTree(!showFolderTree)}
            className="md:hidden px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {showFolderTree ? '폴더 숨기기' : '폴더 보기'}
          </button>
          <h2 className="text-lg font-semibold">기밀문서</h2>
        </div>
        {detailId && (
          <button
            onClick={() => setDetailId(null)}
            className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            목록으로
          </button>
        )}
      </div>

      {/* Main content: 2-panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Folder tree + Stats */}
        {showFolderTree && (
          <div className="w-56 lg:w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50">
            {/* Stats */}
            {stats && <StatsCard stats={stats} />}

            {/* Folder tree */}
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => { setSelectedFolderId(id); setPage(1); setDetailId(null) }}
              queryClient={queryClient}
            />
          </div>
        )}

        {/* Right panel: List or Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {detailId ? (
            <DocumentDetailView
              detail={detail}
              isLoading={detailQuery.isLoading}
              onBack={() => setDetailId(null)}
              onNavigate={(id) => setDetailId(id)}
              onDelete={(id) => setDeleteConfirmId(id)}
              queryClient={queryClient}
              folders={folders}
            />
          ) : (
            <>
              {/* Filters */}
              <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
                <Input
                  placeholder="검색..."
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                  className="text-xs h-8 w-40 md:w-48"
                />
                <select
                  value={classificationFilter}
                  onChange={(e) => { setClassificationFilter(e.target.value); setPage(1) }}
                  className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">전체 등급</option>
                  {(Object.entries(CLASSIFICATION_BADGE) as [Classification, { label: string }][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
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
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                      setSearchInput(''); setClassificationFilter(''); setStartDate(''); setEndDate('')
                      setSortBy('date'); setSelectedFolderId(null); setPage(1)
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-2 py-1"
                  >
                    전체 초기화
                  </button>
                </div>
              )}

              {/* Document list */}
              <div className="flex-1 overflow-auto px-4 md:px-6 py-3">
                {listQuery.isLoading ? (
                  <SkeletonTable rows={8} />
                ) : items.length === 0 ? (
                  <EmptyState
                    icon={<span className="text-3xl">🔒</span>}
                    title="아카이브된 문서가 없습니다"
                    description="사령관실에서 완료된 명령의 결과를 아카이브하면 기밀문서에 보관됩니다."
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
                    <table className="w-full text-sm min-w-[700px]">
                      <thead>
                        <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
                          <th className="text-left py-2 pr-3 font-medium">제목</th>
                          <th className="text-left py-2 pr-3 font-medium">등급</th>
                          <th className="text-left py-2 pr-3 font-medium">부서</th>
                          <th className="text-left py-2 pr-3 font-medium">에이전트</th>
                          <th className="text-left py-2 pr-3 font-medium">품질</th>
                          <th className="text-left py-2 pr-3 font-medium">태그</th>
                          <th className="text-left py-2 font-medium">날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr
                            key={item.id}
                            className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                            onClick={() => setDetailId(item.id)}
                          >
                            <td className="py-2.5 pr-3 text-xs truncate max-w-[200px]" title={item.title}>{item.title}</td>
                            <td className="py-2.5 pr-3">
                              <ClassificationBadge classification={item.classification} />
                            </td>
                            <td className="py-2.5 pr-3 text-xs text-zinc-600 dark:text-zinc-400">{item.departmentName || '-'}</td>
                            <td className="py-2.5 pr-3 text-xs text-zinc-600 dark:text-zinc-400">{item.agentName || '-'}</td>
                            <td className="py-2.5 pr-3">
                              <QualityBar score={item.qualityScore} />
                            </td>
                            <td className="py-2.5 pr-3">
                              <TagList tags={item.tags} max={2} />
                            </td>
                            <td className="py-2.5 text-xs text-zinc-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
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
            </>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => {
          if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId)
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title="문서 삭제"
        description="이 기밀문서를 삭제하시겠습니까? 삭제된 문서는 복원할 수 있습니다."
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  )
}

// === Stats Card ===

function StatsCard({ stats }: { stats: ArchiveStats }) {
  const total = stats.totalDocuments
  return (
    <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">전체 문서</span>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{total}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-zinc-500">최근 7일</span>
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">+{stats.recentWeekCount}</span>
      </div>
      {/* Classification distribution bar */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="flex h-2 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
            {(Object.entries(CLASSIFICATION_COLORS) as [Classification, string][]).map(([cls, color]) => {
              const count = stats.byClassification[cls] || 0
              const pct = (count / total) * 100
              return pct > 0 ? (
                <div key={cls} className={`${color}`} style={{ width: `${pct}%` }} title={`${CLASSIFICATION_BADGE[cls].label}: ${count}`} />
              ) : null
            })}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {(Object.entries(CLASSIFICATION_BADGE) as [Classification, { label: string }][]).map(([cls, info]) => {
              const count = stats.byClassification[cls] || 0
              return count > 0 ? (
                <span key={cls} className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${CLASSIFICATION_COLORS[cls]}`} />
                  {info.label} {count}
                </span>
              ) : null
            })}
          </div>
        </div>
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
    <div className="flex-1 px-2 py-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">폴더</span>
        <button
          onClick={() => setCreating(true)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm leading-none"
          title="새 폴더"
        >
          +
        </button>
      </div>

      {/* "All" option */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors mb-0.5 ${
          selectedFolderId === null
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
        <div className="px-1 py-1">
          <input
            ref={createInputRef}
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit()
              if (e.key === 'Escape') { setCreating(false); setNewFolderName('') }
            }}
            onBlur={handleCreateSubmit}
            className="w-full text-xs px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="폴더 이름"
          />
        </div>
      )}

      {/* Folder delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteFolderId}
        onConfirm={() => {
          if (deleteFolderId) deleteFolderMutation.mutate(deleteFolderId)
          setDeleteFolderId(null)
        }}
        onCancel={() => setDeleteFolderId(null)}
        title="폴더 삭제"
        description="이 폴더를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
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
        <div style={{ paddingLeft: `${depth * 12 + 4}px` }} className="py-0.5">
          <input
            ref={editInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') { setEditing(false); setEditName(folder.name) }
            }}
            onBlur={handleRenameSubmit}
            className="w-full text-xs px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => onSelectFolder(folder.id)}
            onDoubleClick={() => { setEditing(true); setEditName(folder.name) }}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className={`w-full text-left pr-8 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${
              isSelected
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="text-[10px]">📁</span>
            <span className="truncate flex-1">{folder.name}</span>
            {folder.documentCount > 0 && (
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">{folder.documentCount}</span>
            )}
          </button>
          {/* Context menu trigger */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-1 text-xs"
          >
            ⋮
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[100px]">
                <button
                  onClick={() => { setEditing(true); setEditName(folder.name); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  이름 변경
                </button>
                <button
                  onClick={() => { onRequestDelete(folder.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
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
    return <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">로딩 중...</div>
  }

  const totalCost = detail.costRecords.reduce((sum, r) => sum + r.costMicro, 0)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Detail main */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                className="text-sm font-semibold w-full px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            ) : (
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{detail.title}</h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              {editing ? (
                <select
                  value={editForm.classification}
                  onChange={(e) => setEditForm(f => ({ ...f, classification: e.target.value as Classification }))}
                  className="text-xs h-7 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  {(Object.entries(CLASSIFICATION_BADGE) as [Classification, { label: string }][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              ) : (
                <ClassificationBadge classification={detail.classification} />
              )}
              <span className="text-[11px] text-zinc-500">{formatDate(detail.createdAt)}</span>
              {detail.agentName && <span className="text-[11px] text-zinc-500">· {detail.agentName}</span>}
              {detail.departmentName && <span className="text-[11px] text-zinc-500">· {detail.departmentName}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">취소</button>
                <button onClick={handleSave} className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded hover:bg-indigo-700">저장</button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">편집</button>
                <button onClick={() => onDelete(detail.id)} className="px-2.5 py-1 text-[11px] border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">삭제</button>
              </>
            )}
          </div>
        </div>

        {/* Summary (editable) */}
        {editing ? (
          <div className="mb-4">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">요약</label>
            <textarea
              value={editForm.summary}
              onChange={(e) => setEditForm(f => ({ ...f, summary: e.target.value }))}
              className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 h-20 resize-none"
              placeholder="요약 입력..."
            />
          </div>
        ) : detail.summary ? (
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 mb-1">요약</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{detail.summary}</p>
          </div>
        ) : null}

        {/* Tags (editable) */}
        {editing ? (
          <div className="mb-4">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">태그 (쉼표 구분)</label>
            <input
              value={editForm.tags}
              onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              placeholder="태그1, 태그2, ..."
            />
          </div>
        ) : detail.tags.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1">
            {detail.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Folder (editable) */}
        {editing && (
          <div className="mb-4">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">폴더</label>
            <select
              value={editForm.folderId}
              onChange={(e) => setEditForm(f => ({ ...f, folderId: e.target.value }))}
              className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">폴더 없음</option>
              {flattenFolders(folders).map(f => (
                <option key={f.id} value={f.id}>{f.indent}{f.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Meta cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MetaCard label="품질 점수" value={detail.qualityScore != null ? detail.qualityScore.toFixed(1) : '-'} />
          <MetaCard label="비용" value={formatCost(totalCost)} />
          <MetaCard label="명령 유형" value={detail.commandType || '-'} />
        </div>

        {/* Quality review */}
        {detail.qualityReview && (
          <div className="mb-4 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 mb-2">품질 평가</p>
            <div className="flex items-center gap-3 mb-2">
              <QualityBar score={detail.qualityReview.score} />
              <Badge variant={detail.qualityReview.conclusion === 'pass' ? 'success' : 'error'}>
                {detail.qualityReview.conclusion === 'pass' ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
            {detail.qualityReview.feedback && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{detail.qualityReview.feedback}</p>
            )}
          </div>
        )}

        {/* Delegation chain */}
        {detail.delegationChain.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-zinc-500 mb-2">위임 체인</p>
            <div className="flex items-center gap-1 flex-wrap">
              {detail.delegationChain.map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-zinc-300 dark:text-zinc-600">→</span>}
                  <span className="text-[11px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
                    {step.agentName}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {detail.content && (
          <div className="mb-4">
            <p className="text-xs font-medium text-zinc-500 mb-2">보고서 내용</p>
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <MarkdownRenderer content={detail.content} />
            </div>
          </div>
        )}

        {/* Original command */}
        {detail.commandText && (
          <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 mb-1">원본 명령</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{detail.commandText}</p>
          </div>
        )}
      </div>

      {/* Similar documents sidebar */}
      {detail.similarDocuments.length > 0 && (
        <div className="w-56 lg:w-64 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">유사 문서</p>
          <div className="space-y-2">
            {detail.similarDocuments.map(doc => (
              <button
                key={doc.id}
                onClick={() => onNavigate(doc.id)}
                className="w-full text-left p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mb-1">{doc.title}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <ClassificationBadge classification={doc.classification} small />
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">{doc.similarityScore}%</span>
                </div>
                <p className="text-[10px] text-zinc-500">{formatDate(doc.createdAt)}</p>
                {doc.summary && (
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{doc.summary}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// === Sub-components ===

function ClassificationBadge({ classification, small }: { classification: Classification; small?: boolean }) {
  const info = CLASSIFICATION_BADGE[classification] || { label: classification, variant: 'default' as const }
  return <Badge variant={info.variant}>{small ? info.label[0] : info.label}</Badge>
}

function QualityBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-zinc-400">-</span>
  const pct = Math.round(score * 20)
  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-zinc-500 w-6 text-right">{score.toFixed(1)}</span>
    </div>
  )
}

function TagList({ tags, max }: { tags: string[]; max: number }) {
  if (tags.length === 0) return <span className="text-xs text-zinc-400">-</span>
  const shown = tags.slice(0, max)
  const rest = tags.length - max
  return (
    <div className="flex items-center gap-1">
      {shown.map(tag => (
        <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
          {tag}
        </span>
      ))}
      {rest > 0 && <span className="text-[9px] text-zinc-400">+{rest}</span>}
    </div>
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
