import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Badge, Input, SkeletonTable, EmptyState, Modal, ConfirmDialog, Tabs, toast } from '@corthex/ui'
import { MarkdownRenderer } from '../components/markdown-renderer'

// === Types ===

type ContentType = 'markdown' | 'text' | 'html' | 'mermaid'
type MemoryType = 'learning' | 'insight' | 'preference' | 'fact'

type KnowledgeFolder = {
  id: string
  name: string
  description: string | null
  parentId: string | null
  departmentId: string | null
  departmentName?: string | null
  children: KnowledgeFolder[]
  documentCount: number
}

type KnowledgeDoc = {
  id: string
  title: string
  content: string | null
  contentType: ContentType
  folderId: string | null
  folderName?: string | null
  tags: string[]
  fileUrl: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

type DocVersion = {
  id: string
  version: number
  title: string
  contentType: ContentType
  changeNote: string | null
  editedBy: string | null
  createdAt: string
}

type AgentMemory = {
  id: string
  agentId: string
  agentName?: string | null
  memoryType: MemoryType
  key: string
  content: string
  context: string | null
  source: string | null
  confidence: number
  usageCount: number
  lastUsedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type TagInfo = { tag: string; count: number }

type Agent = { id: string; name: string; departmentId: string | null }

// === Constants ===

const PAGE_SIZE = 20

const CONTENT_TYPE_BADGE: Record<ContentType, { label: string; variant: 'success' | 'info' | 'warning' | 'error' }> = {
  markdown: { label: 'MD', variant: 'info' },
  text: { label: 'TXT', variant: 'success' },
  html: { label: 'HTML', variant: 'warning' },
  mermaid: { label: 'Mermaid', variant: 'error' },
}

const MEMORY_TYPE_BADGE: Record<MemoryType, { label: string; variant: 'success' | 'info' | 'warning' | 'error' }> = {
  learning: { label: '학습', variant: 'info' },
  insight: { label: '인사이트', variant: 'success' },
  preference: { label: '선호', variant: 'warning' },
  fact: { label: '사실', variant: 'error' },
}

const TAB_ITEMS = [
  { value: 'docs', label: '문서' },
  { value: 'memories', label: '에이전트 기억' },
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

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  return formatDate(dateStr)
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function flattenFolders(folders: KnowledgeFolder[], depth = 0): { id: string; name: string; indent: string }[] {
  const result: { id: string; name: string; indent: string }[] = []
  for (const f of folders) {
    result.push({ id: f.id, name: f.name, indent: '\u00A0\u00A0'.repeat(depth) })
    result.push(...flattenFolders(f.children, depth + 1))
  }
  return result
}

function findFolderName(folders: KnowledgeFolder[], id: string): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name
    const found = findFolderName(f.children, id)
    if (found) return found
  }
  return null
}

// === Main Page ===

export function KnowledgePage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('docs')
  const [showFolderTree, setShowFolderTree] = useState(true)

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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">📚 정보국</h2>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={TAB_ITEMS} value={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === 'docs' ? (
        <DocsTab showFolderTree={showFolderTree} queryClient={queryClient} />
      ) : (
        <MemoriesTab queryClient={queryClient} />
      )}
    </div>
  )
}

// === Docs Tab ===

function DocsTab({ showFolderTree, queryClient }: { showFolderTree: boolean; queryClient: ReturnType<typeof useQueryClient> }) {
  // State
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title'>('updatedAt')
  const [detailDoc, setDetailDoc] = useState<KnowledgeDoc | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null)
  const [showVersions, setShowVersions] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  // Build query params
  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    if (selectedTag) params.set('tag', selectedTag)
    if (sortBy === 'title') params.set('sortBy', 'title')
    return params.toString()
  }, [page, debouncedSearch, selectedFolderId, selectedTag, sortBy])

  // Queries
  const docsQuery = useQuery({
    queryKey: ['knowledge-docs', page, debouncedSearch, selectedFolderId, selectedTag, sortBy],
    queryFn: () => api.get<{ data: { items: KnowledgeDoc[]; page: number; limit: number; total: number } }>(`/workspace/knowledge/docs?${buildParams()}`),
  })

  const foldersQuery = useQuery({
    queryKey: ['knowledge-folders'],
    queryFn: () => api.get<{ data: KnowledgeFolder[] }>('/workspace/knowledge/folders'),
  })

  const tagsQuery = useQuery({
    queryKey: ['knowledge-tags'],
    queryFn: () => api.get<{ data: TagInfo[] }>('/workspace/knowledge/tags'),
  })

  const items = docsQuery.data?.data?.items ?? []
  const total = docsQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const folders = foldersQuery.data?.data ?? []
  const tags = tagsQuery.data?.data ?? []

  // Filter chips
  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    if (debouncedSearch) chips.push({ key: 'search', label: `검색: ${debouncedSearch}`, onRemove: () => { setSearchInput(''); setPage(1) } })
    if (selectedFolderId) {
      const name = findFolderName(folders, selectedFolderId)
      chips.push({ key: 'folder', label: `폴더: ${name || '선택됨'}`, onRemove: () => { setSelectedFolderId(null); setPage(1) } })
    }
    if (selectedTag) chips.push({ key: 'tag', label: `태그: ${selectedTag}`, onRemove: () => { setSelectedTag(null); setPage(1) } })
    return chips
  }, [debouncedSearch, selectedFolderId, selectedTag, folders])

  // Upload handler
  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return
    setUploading(true)
    let successCount = 0
    let errorCount = 0
    for (const file of fileArray) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (selectedFolderId) formData.append('folderId', selectedFolderId)
        await api.upload('/workspace/knowledge/docs/upload', formData)
        successCount++
      } catch {
        errorCount++
      }
    }
    setUploading(false)
    if (successCount > 0) {
      toast.success(`${successCount}개 파일 업로드 완료`)
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] })
    }
    if (errorCount > 0) toast.error(`${errorCount}개 파일 업로드 실패`)
  }, [selectedFolderId, queryClient])

  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files)
    }
  }, [handleUploadFiles])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/knowledge/docs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] })
      setDetailDoc(null)
      toast.success('문서가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Folder tree */}
      {showFolderTree && (
        <div className="w-56 lg:w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => { setSelectedFolderId(id); setPage(1); setDetailDoc(null) }}
            queryClient={queryClient}
          />
        </div>
      )}

      {/* Right: List or detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {detailDoc ? (
          <DocDetailView
            doc={detailDoc}
            folders={folders}
            onBack={() => setDetailDoc(null)}
            onEdit={(d) => { setEditDoc(d); setDetailDoc(null) }}
            onDelete={(id) => setDeleteConfirmId(id)}
            onShowVersions={(id) => setShowVersions(id)}
            queryClient={queryClient}
          />
        ) : (
          <>
            {/* Toolbar */}
            <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
              <Input
                placeholder="검색..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                className="text-xs h-8 w-40 md:w-48"
              />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as 'updatedAt' | 'title'); setPage(1) }}
                className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              >
                <option value="updatedAt">최신순</option>
                <option value="title">이름순</option>
              </select>
              <div className="flex-1" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {uploading ? '업로드 중...' : '📎 파일 업로드'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) handleUploadFiles(e.target.files); e.target.value = '' }}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + 새 문서
              </button>
            </div>

            {/* Tags bar */}
            {tags.length > 0 && (
              <div className="px-4 md:px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                {tags.slice(0, 15).map(t => (
                  <button
                    key={t.tag}
                    onClick={() => { setSelectedTag(selectedTag === t.tag ? null : t.tag); setPage(1) }}
                    className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                      selectedTag === t.tag
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t.tag} <span className="opacity-60">{t.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Filter chips */}
            {filterChips.length > 0 && (
              <div className="px-4 md:px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                {filterChips.map(chip => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                  >
                    {chip.label}
                    <button onClick={chip.onRemove} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 ml-0.5">×</button>
                  </span>
                ))}
                <button
                  onClick={() => { setSearchInput(''); setSelectedFolderId(null); setSelectedTag(null); setPage(1) }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-2 py-1"
                >
                  전체 초기화
                </button>
              </div>
            )}

            {/* Document list with drop zone */}
            <div
              className={`flex-1 overflow-auto px-4 md:px-6 py-3 relative transition-colors ${
                dragOver ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Drag overlay */}
              {dragOver && (
                <div className="absolute inset-4 border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-xl flex flex-col items-center justify-center bg-indigo-50/80 dark:bg-indigo-950/80 z-10 pointer-events-none">
                  <span className="text-3xl mb-2">📁</span>
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">파일을 놓으세요</span>
                  <span className="text-xs text-indigo-500">여러 파일을 동시에 업로드할 수 있습니다</span>
                </div>
              )}

              {docsQuery.isLoading ? (
                <SkeletonTable rows={8} />
              ) : items.length === 0 ? (
                <EmptyState
                  icon={<span className="text-3xl">📚</span>}
                  title="문서가 없습니다"
                  description="새 문서를 작성하거나 파일을 드래그하여 업로드하세요."
                  action={
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-2 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      새 문서 작성
                    </button>
                  }
                />
              ) : (
                <div className="space-y-1">
                  {items.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setDetailDoc(doc)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <span className="text-base">
                        {doc.fileUrl ? '📎' : doc.contentType === 'mermaid' ? '📊' : '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={CONTENT_TYPE_BADGE[doc.contentType]?.variant || 'info'}>
                            {CONTENT_TYPE_BADGE[doc.contentType]?.label || doc.contentType}
                          </Badge>
                          {doc.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && <span className="text-[9px] text-zinc-400">+{doc.tags.length - 2}</span>}
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400 whitespace-nowrap">{formatRelative(doc.updatedAt)}</span>
                    </div>
                  ))}
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
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">{page} / {totalPages}</span>
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

      {/* Create/Edit Modal */}
      <DocModal
        isOpen={showCreateModal || !!editDoc}
        doc={editDoc}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onClose={() => { setShowCreateModal(false); setEditDoc(null) }}
        queryClient={queryClient}
      />

      {/* Version history modal */}
      <VersionHistoryModal
        docId={showVersions}
        onClose={() => setShowVersions(null)}
        queryClient={queryClient}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => {
          if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId)
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title="문서 삭제"
        description="이 문서를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  )
}

// === Folder Tree ===

function FolderTree({
  folders, selectedFolderId, onSelectFolder, queryClient,
}: {
  folders: KnowledgeFolder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const createRef = useRef<HTMLInputElement>(null)

  const createMutation = useMutation({
    mutationFn: (data: { name: string; parentId?: string }) =>
      api.post('/workspace/knowledge/folders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      setCreating(false)
      setNewName('')
      toast.success('폴더가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => {
    if (creating) createRef.current?.focus()
  }, [creating])

  const handleSubmit = () => {
    if (newName.trim()) {
      createMutation.mutate({ name: newName.trim() })
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
        >+</button>
      </div>

      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors mb-0.5 ${
          selectedFolderId === null
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        전체 문서
      </button>

      {folders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          queryClient={queryClient}
        />
      ))}

      {creating && (
        <div className="px-1 py-1">
          <input
            ref={createRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') { setCreating(false); setNewName('') }
            }}
            onBlur={handleSubmit}
            className="w-full text-xs px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="폴더 이름"
          />
        </div>
      )}
    </div>
  )
}

function FolderNode({
  folder, depth, selectedFolderId, onSelectFolder, queryClient,
}: {
  folder: KnowledgeFolder
  depth: number
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  const [creatingChild, setCreatingChild] = useState(false)
  const [childName, setChildName] = useState('')
  const editRef = useRef<HTMLInputElement>(null)
  const childRef = useRef<HTMLInputElement>(null)

  const renameMutation = useMutation({
    mutationFn: (name: string) => api.patch(`/workspace/knowledge/folders/${folder.id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      setEditing(false)
      toast.success('이름이 변경되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workspace/knowledge/folders/${folder.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      onSelectFolder(null)
      toast.success('폴더가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const createChildMutation = useMutation({
    mutationFn: (name: string) => api.post('/workspace/knowledge/folders', { name, parentId: folder.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      setCreatingChild(false)
      setChildName('')
      toast.success('하위 폴더가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => { if (editing) editRef.current?.focus() }, [editing])
  useEffect(() => { if (creatingChild) childRef.current?.focus() }, [creatingChild])

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== folder.name) {
      renameMutation.mutate(editName.trim())
    } else {
      setEditing(false)
      setEditName(folder.name)
    }
  }

  const handleCreateChild = () => {
    if (childName.trim()) {
      createChildMutation.mutate(childName.trim())
    } else {
      setCreatingChild(false)
    }
  }

  const isSelected = selectedFolderId === folder.id

  return (
    <div>
      {editing ? (
        <div style={{ paddingLeft: `${depth * 12 + 4}px` }} className="py-0.5">
          <input
            ref={editRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setEditing(false); setEditName(folder.name) }
            }}
            onBlur={handleRename}
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
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-1 text-xs"
          >⋮</button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                <button
                  onClick={() => { setCreatingChild(true); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >하위 폴더</button>
                <button
                  onClick={() => { setEditing(true); setEditName(folder.name); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >이름 변경</button>
                <button
                  onClick={() => { deleteMutation.mutate(); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400"
                >삭제</button>
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
          queryClient={queryClient}
        />
      ))}
      {/* Create child folder input */}
      {creatingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 12 + 4}px` }} className="py-0.5">
          <input
            ref={childRef}
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChild()
              if (e.key === 'Escape') { setCreatingChild(false); setChildName('') }
            }}
            onBlur={handleCreateChild}
            className="w-full text-xs px-2 py-1 border border-indigo-300 dark:border-indigo-700 rounded bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="하위 폴더 이름"
          />
        </div>
      )}
    </div>
  )
}

// === Doc Detail View ===

function DocDetailView({
  doc, folders, onBack, onEdit, onDelete, onShowVersions, queryClient,
}: {
  doc: KnowledgeDoc
  folders: KnowledgeFolder[]
  onBack: () => void
  onEdit: (doc: KnowledgeDoc) => void
  onDelete: (id: string) => void
  onShowVersions: (id: string) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  // Fetch full doc detail
  const detailQuery = useQuery({
    queryKey: ['knowledge-doc-detail', doc.id],
    queryFn: () => api.get<{ data: KnowledgeDoc }>(`/workspace/knowledge/docs/${doc.id}`),
  })

  const fullDoc = detailQuery.data?.data ?? doc

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={onBack} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">← 목록</button>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{fullDoc.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CONTENT_TYPE_BADGE[fullDoc.contentType]?.variant || 'info'}>
              {CONTENT_TYPE_BADGE[fullDoc.contentType]?.label || fullDoc.contentType}
            </Badge>
            {fullDoc.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">{tag}</span>
            ))}
            <span className="text-[11px] text-zinc-500">수정: {formatRelative(fullDoc.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <button onClick={() => onShowVersions(fullDoc.id)} className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">버전 이력</button>
          <button onClick={() => onEdit(fullDoc)} className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">편집</button>
          {fullDoc.fileUrl && (
            <a
              href={`/api/workspace/knowledge/docs/${fullDoc.id}/download`}
              className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >다운로드</a>
          )}
          <button onClick={() => onDelete(fullDoc.id)} className="px-2.5 py-1 text-[11px] border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">삭제</button>
        </div>
      </div>

      {/* Content */}
      {fullDoc.content && (
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
          {fullDoc.contentType === 'markdown' || fullDoc.contentType === 'mermaid' ? (
            <MarkdownRenderer content={fullDoc.content} />
          ) : fullDoc.contentType === 'html' ? (
            <div className="prose dark:prose-invert max-w-none text-sm">
              <MarkdownRenderer content={fullDoc.content} />
            </div>
          ) : (
            <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">{fullDoc.content}</pre>
          )}
        </div>
      )}

      {/* File info */}
      {fullDoc.fileUrl && !fullDoc.content && (
        <div className="p-6 text-center border border-zinc-100 dark:border-zinc-800 rounded-lg">
          <span className="text-3xl">📎</span>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">첨부 파일</p>
          <a
            href={`/api/workspace/knowledge/docs/${fullDoc.id}/download`}
            className="mt-2 inline-block px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >다운로드</a>
        </div>
      )}
    </div>
  )
}

// === Doc Modal (Create / Edit) ===

function DocModal({
  isOpen, doc, folders, selectedFolderId, onClose, queryClient,
}: {
  isOpen: boolean
  doc: KnowledgeDoc | null
  folders: KnowledgeFolder[]
  selectedFolderId: string | null
  onClose: () => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const isEdit = !!doc
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<ContentType>('markdown')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (doc) {
      setTitle(doc.title)
      setContentType(doc.contentType)
      setContent(doc.content || '')
      setFolderId(doc.folderId || '')
      setTagsInput(doc.tags.join(', '))
    } else {
      setTitle('')
      setContentType('markdown')
      setContent('')
      setFolderId(selectedFolderId || '')
      setTagsInput('')
    }
  }, [doc, selectedFolderId, isOpen])

  const createMutation = useMutation({
    mutationFn: (body: { title: string; contentType: string; content: string; folderId?: string; tags?: string[] }) =>
      api.post('/workspace/knowledge/docs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] })
      onClose()
      toast.success('문서가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: (body: { title?: string; contentType?: string; content?: string; folderId?: string | null; tags?: string[] }) =>
      api.patch(`/workspace/knowledge/docs/${doc!.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-doc-detail', doc!.id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] })
      onClose()
      toast.success('문서가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('제목을 입력하세요')
      return
    }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (isEdit) {
      updateMutation.mutate({
        title: title.trim(),
        contentType,
        content,
        folderId: folderId || null,
        tags,
      })
    } else {
      createMutation.mutate({
        title: title.trim(),
        contentType,
        content,
        folderId: folderId || undefined,
        tags,
      })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '문서 편집' : '새 문서'} className="max-w-2xl">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="문서 제목"
            autoFocus
          />
        </div>

        {/* Type + Folder row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">유형</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full text-xs h-9 px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="markdown">마크다운</option>
              <option value="text">텍스트</option>
              <option value="html">HTML</option>
              <option value="mermaid">Mermaid</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">폴더</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full text-xs h-9 px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">폴더 없음</option>
              {flattenFolders(folders).map(f => (
                <option key={f.id} value={f.id}>{f.indent}{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">태그 (쉼표 구분)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            placeholder="태그1, 태그2, ..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono h-64 resize-y"
            placeholder={contentType === 'markdown' ? '마크다운으로 작성...' : '내용을 입력하세요...'}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >취소</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >{isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}</button>
        </div>
      </div>
    </Modal>
  )
}

// === Version History Modal ===

function VersionHistoryModal({
  docId, onClose, queryClient,
}: {
  docId: string | null
  onClose: () => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const versionsQuery = useQuery({
    queryKey: ['doc-versions', docId],
    queryFn: () => api.get<{ data: DocVersion[] }>(`/workspace/knowledge/docs/${docId}/versions`),
    enabled: !!docId,
  })

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) =>
      api.post(`/workspace/knowledge/docs/${docId}/versions/${versionId}/restore`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-doc-detail', docId] })
      queryClient.invalidateQueries({ queryKey: ['doc-versions', docId] })
      onClose()
      toast.success('버전이 복원되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const versions = versionsQuery.data?.data ?? []

  return (
    <Modal isOpen={!!docId} onClose={onClose} title="버전 이력">
      {versionsQuery.isLoading ? (
        <div className="py-8 text-center text-sm text-zinc-400">로딩 중...</div>
      ) : versions.length === 0 ? (
        <div className="py-8 text-center text-sm text-zinc-400">버전 이력이 없습니다</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {versions.map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">v{v.version} - {v.title}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{formatDate(v.createdAt)}{v.changeNote ? ` · ${v.changeNote}` : ''}</p>
              </div>
              <button
                onClick={() => restoreMutation.mutate(v.id)}
                disabled={restoreMutation.isPending}
                className="px-2.5 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >복원</button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// === Memories Tab ===

function MemoriesTab({ queryClient }: { queryClient: ReturnType<typeof useQueryClient> }) {
  const [agentFilter, setAgentFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<MemoryType | ''>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editMemory, setEditMemory] = useState<AgentMemory | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Queries
  const buildParams = useCallback(() => {
    const params = new URLSearchParams()
    if (agentFilter) params.set('agentId', agentFilter)
    if (typeFilter) params.set('memoryType', typeFilter)
    return params.toString()
  }, [agentFilter, typeFilter])

  const memoriesQuery = useQuery({
    queryKey: ['knowledge-memories', agentFilter, typeFilter],
    queryFn: () => api.get<{ data: AgentMemory[] }>(`/workspace/knowledge/memories?${buildParams()}`),
  })

  const agentsQuery = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
    staleTime: 5 * 60 * 1000,
  })

  const memories = memoriesQuery.data?.data ?? []
  const agents = agentsQuery.data?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/knowledge/memories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] })
      toast.success('기억이 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center">
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="">전체 에이전트</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MemoryType | '')}
          className="text-xs h-8 px-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
        >
          <option value="">전체 유형</option>
          {(Object.entries(MEMORY_TYPE_BADGE) as [MemoryType, { label: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >+ 새 기억</button>
      </div>

      {/* Memory type chips */}
      <div className="px-4 md:px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 flex gap-1.5">
        {(Object.entries(MEMORY_TYPE_BADGE) as [MemoryType, { label: string }][]).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setTypeFilter(typeFilter === k ? '' : k)}
            className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
              typeFilter === k
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >{v.label}</button>
        ))}
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-auto px-4 md:px-6 py-3">
        {memoriesQuery.isLoading ? (
          <SkeletonTable rows={6} />
        ) : memories.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">🧠</span>}
            title="에이전트 기억이 없습니다"
            description="에이전트가 작업을 수행하면 자동으로 학습 기억이 생성됩니다."
          />
        ) : (
          <div className="space-y-2">
            {memories.map(mem => (
              <div key={mem.id} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{mem.key}</span>
                    <Badge variant={MEMORY_TYPE_BADGE[mem.memoryType]?.variant || 'info'}>
                      {MEMORY_TYPE_BADGE[mem.memoryType]?.label || mem.memoryType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditMemory(mem)}
                      className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >편집</button>
                    <button
                      onClick={() => setDeleteConfirmId(mem.id)}
                      className="px-2 py-0.5 text-[10px] text-red-400 hover:text-red-600"
                    >삭제</button>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">{mem.content}</p>
                <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                  {mem.agentName && <span>에이전트: {mem.agentName}</span>}
                  <span>신뢰도: {mem.confidence}%</span>
                  <span>사용: {mem.usageCount}회</span>
                  {mem.source && <span>출처: {mem.source}</span>}
                  <span>{formatRelative(mem.updatedAt)}</span>
                </div>
                {/* Confidence bar */}
                <div className="mt-2 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mem.confidence >= 70 ? 'bg-emerald-500' : mem.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${mem.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Memory Create/Edit Modal */}
      <MemoryModal
        isOpen={showCreateModal || !!editMemory}
        memory={editMemory}
        agents={agents}
        onClose={() => { setShowCreateModal(false); setEditMemory(null) }}
        queryClient={queryClient}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => {
          if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId)
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title="기억 삭제"
        description="이 기억을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  )
}

// === Memory Modal ===

function MemoryModal({
  isOpen, memory, agents, onClose, queryClient,
}: {
  isOpen: boolean
  memory: AgentMemory | null
  agents: Agent[]
  onClose: () => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const isEdit = !!memory
  const [agentId, setAgentId] = useState('')
  const [memoryType, setMemoryType] = useState<MemoryType>('learning')
  const [key, setKey] = useState('')
  const [content, setContent] = useState('')
  const [confidence, setConfidence] = useState(80)

  useEffect(() => {
    if (memory) {
      setAgentId(memory.agentId)
      setMemoryType(memory.memoryType)
      setKey(memory.key)
      setContent(memory.content)
      setConfidence(memory.confidence)
    } else {
      setAgentId(agents[0]?.id || '')
      setMemoryType('learning')
      setKey('')
      setContent('')
      setConfidence(80)
    }
  }, [memory, agents, isOpen])

  const createMutation = useMutation({
    mutationFn: (body: { agentId: string; memoryType: string; key: string; content: string; confidence: number }) =>
      api.post('/workspace/knowledge/memories', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] })
      onClose()
      toast.success('기억이 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: (body: { memoryType?: string; key?: string; content?: string; confidence?: number }) =>
      api.patch(`/workspace/knowledge/memories/${memory!.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] })
      onClose()
      toast.success('기억이 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!key.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력하세요')
      return
    }
    if (isEdit) {
      updateMutation.mutate({ memoryType, key: key.trim(), content: content.trim(), confidence })
    } else {
      if (!agentId) { toast.error('에이전트를 선택하세요'); return }
      createMutation.mutate({ agentId, memoryType, key: key.trim(), content: content.trim(), confidence })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '기억 편집' : '새 기억'}>
      <div className="space-y-4">
        {!isEdit && (
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">에이전트</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full text-xs h-9 px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">에이전트 선택</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">유형</label>
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value as MemoryType)}
              className="w-full text-xs h-9 px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              {(Object.entries(MEMORY_TYPE_BADGE) as [MemoryType, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">신뢰도: {confidence}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full h-9"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">제목</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            placeholder="기억 제목"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 h-32 resize-y"
            placeholder="학습 내용..."
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">취소</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >{isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}</button>
        </div>
      </div>
    </Modal>
  )
}
