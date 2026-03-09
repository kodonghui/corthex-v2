import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Badge, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast } from '@corthex/ui'
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

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  markdown: 'bg-blue-500/20 text-blue-400',
  text: 'bg-slate-600/50 text-slate-300',
  html: 'bg-orange-500/20 text-orange-400',
  mermaid: 'bg-purple-500/20 text-purple-400',
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  markdown: 'markdown',
  text: '텍스트',
  html: 'HTML',
  mermaid: 'Mermaid',
}

const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  learning: 'bg-emerald-500/20 text-emerald-400',
  insight: 'bg-purple-500/20 text-purple-400',
  preference: 'bg-blue-500/20 text-blue-400',
  fact: 'bg-amber-500/20 text-amber-400',
}

const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  learning: '학습',
  insight: '인사이트',
  preference: '선호',
  fact: '사실',
}

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
  const [activeTab, setActiveTab] = useState<'docs' | 'memories'>('docs')
  const [showFolderTree, setShowFolderTree] = useState(true)

  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="knowledge-page">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFolderTree(!showFolderTree)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={showFolderTree ? '폴더 숨기기' : '폴더 보기'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-50">지식 베이스</h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'docs'
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-docs"
          >
            문서
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'memories'
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            data-testid="tab-memories"
          >
            에이전트 기억
          </button>
        </div>
      </div>

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
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | ''>('')
  const [detailDoc, setDetailDoc] = useState<KnowledgeDoc | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editDoc, setEditDoc] = useState<KnowledgeDoc | null>(null)
  const [showVersions, setShowVersions] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    if (selectedTag) params.set('tag', selectedTag)
    if (contentTypeFilter) params.set('contentType', contentTypeFilter)
    return params.toString()
  }, [page, debouncedSearch, selectedFolderId, selectedTag, contentTypeFilter])

  const docsQuery = useQuery({
    queryKey: ['knowledge-docs', page, debouncedSearch, selectedFolderId, selectedTag, contentTypeFilter],
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

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false)
    if (e.dataTransfer.files.length > 0) handleUploadFiles(e.dataTransfer.files)
  }, [handleUploadFiles])

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
      {/* Sidebar */}
      {showFolderTree && (
        <aside className="w-64 border-r border-slate-700 bg-slate-800/50 flex flex-col overflow-y-auto" data-testid="folder-sidebar">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => { setSelectedFolderId(id); setPage(1); setDetailDoc(null) }}
            queryClient={queryClient}
          />
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
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
            {/* Search + Filters Bar */}
            <div className="px-6 py-3 border-b border-slate-700/50 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  placeholder="문서 검색..."
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors"
                  data-testid="doc-search"
                />
              </div>
              <select
                value={contentTypeFilter}
                onChange={(e) => { setContentTypeFilter(e.target.value as ContentType | ''); setPage(1) }}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="">전체 유형</option>
                <option value="markdown">Markdown</option>
                <option value="text">텍스트</option>
                <option value="html">HTML</option>
                <option value="mermaid">Mermaid</option>
              </select>
              <input
                placeholder="태그 필터..."
                value={selectedTag || ''}
                onChange={(e) => { setSelectedTag(e.target.value || null); setPage(1) }}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-blue-500 w-32"
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                data-testid="create-doc-button"
              >
                <span>+</span> 문서 작성
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 text-sm border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? '업로드 중...' : '파일 업로드'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) handleUploadFiles(e.target.files); e.target.value = '' }}
              />
            </div>

            {/* Document list with drop zone */}
            <div
              className={`flex-1 overflow-auto p-6 relative transition-colors ${
                dragOver ? 'bg-blue-500/5' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Drag overlay */}
              {dragOver && (
                <div className="absolute inset-4 border-2 border-dashed border-blue-500/50 rounded-xl flex flex-col items-center justify-center bg-blue-500/10 z-10 pointer-events-none">
                  <span className="text-3xl mb-2">📁</span>
                  <span className="text-sm font-medium text-blue-300">파일을 놓으세요</span>
                </div>
              )}

              {docsQuery.isLoading ? (
                <SkeletonTable rows={8} />
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="docs-empty">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-slate-300 mb-2">이 폴더에 문서가 없습니다</h3>
                  <p className="text-sm text-slate-500 mb-4">문서를 만들어 지식을 정리해보세요</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >문서 만들기</button>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="doc-table">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">제목</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">유형</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">태그</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">수정일</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {items.map(doc => (
                        <tr
                          key={doc.id}
                          onClick={() => setDetailDoc(doc)}
                          className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                          data-testid={`doc-row-${doc.id}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm font-medium text-slate-100 truncate">{doc.title}</span>
                              {doc.fileUrl && (
                                <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CONTENT_TYPE_COLORS[doc.contentType]}`}>
                              {CONTENT_TYPE_LABELS[doc.contentType] || doc.contentType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {doc.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">{tag}</span>
                              ))}
                              {doc.tags.length > 3 && <span className="text-[10px] text-slate-500">+{doc.tags.length - 3}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-slate-400">{formatRelative(doc.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500">{total}건 중 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >이전</button>
                  <span className="text-xs text-slate-400">{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >다음</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

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

  useEffect(() => { if (creating) createRef.current?.focus() }, [creating])

  const handleSubmit = () => {
    if (newName.trim()) {
      createMutation.mutate({ name: newName.trim() })
    } else {
      setCreating(false)
    }
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">폴더</span>
        <button
          onClick={() => setCreating(true)}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="새 폴더"
          data-testid="add-folder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            selectedFolderId === null
              ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
          data-testid="folder-all"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="flex-1 truncate">전체 문서</span>
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
              className="w-full text-sm px-3 py-1.5 border border-blue-500 rounded-lg bg-slate-800 text-slate-50 outline-none"
              placeholder="폴더 이름"
            />
          </div>
        )}
      </div>
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
        <div style={{ paddingLeft: `${depth * 16 + 4}px` }} className="py-0.5">
          <input
            ref={editRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') { setEditing(false); setEditName(folder.name) }
            }}
            onBlur={handleRename}
            className="w-full text-sm px-3 py-1.5 border border-blue-500 rounded-lg bg-slate-800 text-slate-50 outline-none"
          />
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => onSelectFolder(folder.id)}
            onDoubleClick={() => { setEditing(true); setEditName(folder.name) }}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            className={`w-full text-left pr-8 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
              isSelected
                ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="truncate flex-1">{folder.name}</span>
            {folder.documentCount > 0 && (
              <span className="text-xs text-slate-500">{folder.documentCount}</span>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-200 px-1.5 py-1 text-xs rounded-lg hover:bg-slate-700 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[160px]">
                <button
                  onClick={() => { setEditing(true); setEditName(folder.name); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >이름 변경</button>
                <button
                  onClick={() => { setCreatingChild(true); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >하위 폴더 추가</button>
                <div className="border-t border-slate-700 my-1" />
                <button
                  onClick={() => { deleteMutation.mutate(); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >삭제</button>
              </div>
            </>
          )}
        </div>
      )}
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
      {creatingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }} className="py-0.5">
          <input
            ref={childRef}
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChild()
              if (e.key === 'Escape') { setCreatingChild(false); setChildName('') }
            }}
            onBlur={handleCreateChild}
            className="w-full text-sm px-3 py-1.5 border border-blue-500 rounded-lg bg-slate-800 text-slate-50 outline-none"
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
  const detailQuery = useQuery({
    queryKey: ['knowledge-doc-detail', doc.id],
    queryFn: () => api.get<{ data: KnowledgeDoc }>(`/workspace/knowledge/docs/${doc.id}`),
  })

  const fullDoc = detailQuery.data?.data ?? doc

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="doc-detail">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="flex-1 text-xl font-semibold text-slate-50 truncate">{fullDoc.title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => onShowVersions(fullDoc.id)} className="px-3 py-1.5 text-xs border border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">버전 이력</button>
          <button onClick={() => onEdit(fullDoc)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">편집</button>
          <button onClick={() => onDelete(fullDoc.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CONTENT_TYPE_COLORS[fullDoc.contentType]}`}>
          {CONTENT_TYPE_LABELS[fullDoc.contentType]}
        </span>
        {fullDoc.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] bg-slate-700 text-slate-300">{tag}</span>
        ))}
        <span className="text-xs text-slate-500">수정: {formatRelative(fullDoc.updatedAt)}</span>
      </div>

      {/* Content */}
      {fullDoc.content && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          {fullDoc.contentType === 'markdown' || fullDoc.contentType === 'mermaid' ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <MarkdownRenderer content={fullDoc.content} />
            </div>
          ) : fullDoc.contentType === 'html' ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <MarkdownRenderer content={fullDoc.content} />
            </div>
          ) : (
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{fullDoc.content}</pre>
          )}
        </div>
      )}

      {/* File attachment */}
      {fullDoc.fileUrl && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm text-slate-300">첨부 파일</span>
            </div>
            <a
              href={`/api/workspace/knowledge/docs/${fullDoc.id}/download`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >다운로드</a>
          </div>
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
    if (!title.trim()) { toast.error('제목을 입력하세요'); return }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (isEdit) {
      updateMutation.mutate({ title: title.trim(), contentType, content, folderId: folderId || null, tags })
    } else {
      createMutation.mutate({ title: title.trim(), contentType, content, folderId: folderId || undefined, tags })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '문서 편집' : '새 문서'} className="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">제목 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none"
            placeholder="문서 제목"
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">유형</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="markdown">마크다운</option>
              <option value="text">텍스트</option>
              <option value="html">HTML</option>
              <option value="mermaid">Mermaid</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">폴더</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="">폴더 없음</option>
              {flattenFolders(folders).map(f => (
                <option key={f.id} value={f.id}>{f.indent}{f.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">태그 (쉼표 구분)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500"
            placeholder="태그1, 태그2, ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 font-mono min-h-[256px] resize-y outline-none placeholder:text-slate-500"
            placeholder={contentType === 'markdown' ? '마크다운으로 작성...' : '내용을 입력하세요...'}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
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
        <div className="py-8 text-center text-sm text-slate-400">로딩 중...</div>
      ) : versions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">버전 이력이 없습니다</div>
      ) : (
        <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
          {versions.map(v => (
            <div key={v.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
              <div>
                <span className="text-sm text-slate-200">v{v.version}</span>
                <span className="text-xs text-slate-500 ml-2">{formatDate(v.createdAt)}{v.editedBy ? ` · ${v.editedBy}` : ''}</span>
                {v.changeNote && <p className="text-xs text-slate-400 mt-0.5">{v.changeNote}</p>}
              </div>
              <button
                onClick={() => restoreMutation.mutate(v.id)}
                disabled={restoreMutation.isPending}
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-lg border border-slate-600 hover:bg-blue-500/10 transition-colors"
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
  const [searchInput, setSearchInput] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editMemory, setEditMemory] = useState<AgentMemory | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  const filteredMemories = useMemo(() => {
    if (!searchInput) return memories
    const q = searchInput.toLowerCase()
    return memories.filter(m => m.key.toLowerCase().includes(q) || m.content.toLowerCase().includes(q))
  }, [memories, searchInput])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/knowledge/memories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] })
      toast.success('기억이 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="memories-tab">
      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-3 items-center">
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="">전체 에이전트</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MemoryType | '')}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="">전체 유형</option>
          <option value="learning">학습</option>
          <option value="insight">인사이트</option>
          <option value="preference">선호</option>
          <option value="fact">사실</option>
        </select>
        <input
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none w-40"
          placeholder="검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="flex-1" />
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          data-testid="add-memory"
        >+ 기억 추가</button>
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-auto p-6 space-y-3">
        {memoriesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-700/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="memories-empty">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-base font-medium text-slate-300 mb-2">에이전트 기억이 없습니다</h3>
            <p className="text-sm text-slate-500">에이전트가 작업하면서 자동으로 기억을 학습합니다</p>
          </div>
        ) : (
          filteredMemories.map(mem => (
            <div
              key={mem.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 hover:border-slate-600 transition-colors"
              data-testid={`memory-card-${mem.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">{mem.key}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${MEMORY_TYPE_COLORS[mem.memoryType]}`}>
                    {MEMORY_TYPE_LABELS[mem.memoryType]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditMemory(mem)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(mem.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{mem.content}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {mem.agentName && <span>에이전트: <span className="text-cyan-400">{mem.agentName}</span></span>}
                <span>출처: {mem.source || '자동'}</span>
                <span>사용 {mem.usageCount}회</span>
              </div>
              {/* Confidence bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-12">신뢰도</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mem.confidence >= 70 ? 'bg-emerald-500' : mem.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${mem.confidence}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${mem.confidence >= 70 ? 'text-emerald-400' : mem.confidence >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {mem.confidence}%
                </span>
              </div>
            </div>
          ))
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
    if (!key.trim() || !content.trim()) { toast.error('제목과 내용을 입력하세요'); return }
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
            <label className="block text-sm font-medium text-slate-300 mb-1">에이전트</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
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
            <label className="block text-sm font-medium text-slate-300 mb-1">유형</label>
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value as MemoryType)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"
            >
              <option value="learning">학습</option>
              <option value="insight">인사이트</option>
              <option value="preference">선호</option>
              <option value="fact">사실</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">신뢰도: {confidence}%</label>
            <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full h-9" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">제목</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500"
            placeholder="기억 제목"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-50 h-32 resize-y outline-none placeholder:text-slate-500"
            placeholder="학습 내용..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">취소</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >{isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}</button>
        </div>
      </div>
    </Modal>
  )
}
