// API Endpoints:
// GET    /workspace/knowledge/docs
// GET    /workspace/knowledge/docs/:id
// POST   /workspace/knowledge/docs
// PATCH  /workspace/knowledge/docs/:id
// DELETE /workspace/knowledge/docs/:id
// POST   /workspace/knowledge/docs/upload
// GET    /workspace/knowledge/docs/:id/download
// GET    /workspace/knowledge/docs/:id/similar
// GET    /workspace/knowledge/docs/:id/versions
// POST   /workspace/knowledge/docs/:id/versions/:versionId/restore
// GET    /workspace/knowledge/search
// GET    /workspace/knowledge/folders
// POST   /workspace/knowledge/folders
// PATCH  /workspace/knowledge/folders/:id
// DELETE /workspace/knowledge/folders/:id
// GET    /workspace/knowledge/tags
// GET    /workspace/knowledge/memories
// POST   /workspace/knowledge/memories
// PATCH  /workspace/knowledge/memories/:id
// DELETE /workspace/knowledge/memories/:id
// GET    /workspace/agents

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

type EmbeddingStatus = 'done' | 'pending' | 'none'

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
  embeddingStatus?: EmbeddingStatus
  embeddedAt?: string | null
  embeddingModel?: string | null
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

const oliveColor = '#606C38'
const sandBg = '#faf8f5'
const borderColor = '#e5e1d3'

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  markdown: 'bg-blue-100 text-blue-700',
  text: 'bg-gray-100 text-gray-600',
  html: 'bg-orange-100 text-orange-700',
  mermaid: 'bg-purple-100 text-purple-700',
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  markdown: 'markdown',
  text: '텍스트',
  html: 'HTML',
  mermaid: 'Mermaid',
}

const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  learning: 'bg-emerald-100 text-emerald-700',
  insight: 'bg-purple-100 text-purple-700',
  preference: 'bg-blue-100 text-blue-700',
  fact: 'bg-amber-100 text-amber-700',
}

const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  learning: '학습',
  insight: '인사이트',
  preference: '선호',
  fact: '사실',
}

// === Helpers ===

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
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
    <div className="h-screen overflow-hidden flex flex-col" data-testid="knowledge-page" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: sandBg }}>
      {/* Navigation Header */}
      <header className="h-16 bg-white flex items-center justify-between px-6 z-10" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: oliveColor }}>C</div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>CORTHEX <span style={{ color: oliveColor }}>v2</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </span>
            <input
              className="block w-full pl-10 pr-3 py-2 border rounded-xl text-sm"
              placeholder="Search Knowledge Library..."
              type="text"
              style={{ borderColor, backgroundColor: sandBg }}
            />
          </div>
          <button
            className="hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2"
            style={{ backgroundColor: oliveColor }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            New Document
          </button>
        </div>
      </header>

      {/* Tab content */}
      {activeTab === 'docs' ? (
        <DocsTab showFolderTree={showFolderTree} queryClient={queryClient} setShowFolderTree={setShowFolderTree} activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between bg-white" style={{ borderColor }}>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>CORTHEX Knowledge</h1>
            <div className="flex gap-0">
              <button onClick={() => setActiveTab('docs')} className="px-4 py-2 text-sm font-semibold tracking-wide transition-colors text-gray-400 hover:text-gray-800" data-testid="tab-docs">문서</button>
              <button onClick={() => setActiveTab('memories')} className="px-4 py-2 text-sm font-semibold tracking-wide transition-colors relative" style={{ color: oliveColor }} data-testid="tab-memories">
                에이전트 기억
                <span className="absolute -bottom-4 left-0 w-full h-0.5" style={{ backgroundColor: oliveColor }} />
              </button>
            </div>
          </div>
          <MemoriesTab queryClient={queryClient} />
        </div>
      )}

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t flex items-center justify-between px-4 text-[10px] text-gray-500 shrink-0 bg-white" style={{ backgroundColor: sandBg, borderColor }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            API Online
          </div>
          <span>Workspace: <span className="text-gray-700 font-medium">Global_Research_Alpha</span></span>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-widest">
          <span className="cursor-pointer" style={{ color: oliveColor }}>API Reference</span>
          <span className="cursor-pointer" style={{ color: oliveColor }}>Help Center</span>
          <span>v2.0.4-stable</span>
        </div>
      </footer>
    </div>
  )
}

// === Docs Tab ===

function DocsTab({ showFolderTree, queryClient, setShowFolderTree, activeTab, setActiveTab }: { showFolderTree: boolean; queryClient: ReturnType<typeof useQueryClient>; setShowFolderTree: (v: boolean) => void; activeTab: 'docs' | 'memories'; setActiveTab: (v: 'docs' | 'memories') => void }) {
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
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchInput, 300)
  const isSearchActive = debouncedSearch.trim().length > 0

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (selectedFolderId) params.set('folderId', selectedFolderId)
    if (selectedTag) params.set('tag', selectedTag)
    if (contentTypeFilter) params.set('contentType', contentTypeFilter)
    return params.toString()
  }, [page, debouncedSearch, selectedFolderId, selectedTag, contentTypeFilter])

  const searchQuery = useQuery({
    queryKey: ['knowledge-search', debouncedSearch, searchMode, selectedFolderId],
    queryFn: () => {
      const params = new URLSearchParams({ q: debouncedSearch, mode: searchMode, topK: '10' })
      if (selectedFolderId) params.set('folderId', selectedFolderId)
      return api.get<{ data: { docs: Array<KnowledgeDoc & { score: number | null; highlight: string }>; folders: unknown[]; searchMode: string } }>(`/workspace/knowledge/search?${params}`)
    },
    enabled: isSearchActive,
  })

  const docsQuery = useQuery({
    queryKey: ['knowledge-docs', page, debouncedSearch, selectedFolderId, selectedTag, contentTypeFilter],
    queryFn: () => api.get<{ data: KnowledgeDoc[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/workspace/knowledge/docs?${buildParams()}`),
    enabled: !isSearchActive,
  })

  const foldersQuery = useQuery({
    queryKey: ['knowledge-folders'],
    queryFn: () => api.get<{ data: KnowledgeFolder[] }>('/workspace/knowledge/folders'),
  })

  const tagsQuery = useQuery({
    queryKey: ['knowledge-tags'],
    queryFn: () => api.get<{ data: TagInfo[] }>('/workspace/knowledge/tags'),
  })

  const searchDocs = searchQuery.data?.data?.docs ?? []
  const listDocs = (Array.isArray(docsQuery.data?.data) ? docsQuery.data.data : []) as KnowledgeDoc[]
  const items = isSearchActive ? searchDocs : listDocs
  const total = isSearchActive ? searchDocs.length : (docsQuery.data?.pagination?.total ?? 0)
  const totalPages = isSearchActive ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE))
  const folders = foldersQuery.data?.data ?? []
  const resultSearchMode = isSearchActive ? (searchQuery.data?.data?.searchMode ?? null) : null

  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return
    setUploading(true)
    let successCount = 0; let errorCount = 0
    for (const file of fileArray) {
      try {
        const formData = new FormData(); formData.append('file', file)
        if (selectedFolderId) formData.append('folderId', selectedFolderId)
        await api.upload('/workspace/knowledge/docs/upload', formData)
        successCount++
      } catch { errorCount++ }
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar matching tabs */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0 bg-white" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFolderTree(!showFolderTree)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>CORTHEX Knowledge</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('docs')}
              className={`text-sm font-semibold tracking-wide transition-colors relative ${activeTab === 'docs' ? '' : 'text-gray-400 hover:text-gray-800'}`}
              style={activeTab === 'docs' ? { color: oliveColor } : undefined}
              data-testid="tab-docs"
            >
              문서
              {activeTab === 'docs' && <span className="absolute -bottom-4 left-0 w-full h-0.5" style={{ backgroundColor: oliveColor }} />}
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`text-sm font-semibold tracking-wide transition-colors ${activeTab === 'memories' ? '' : 'text-gray-400 hover:text-gray-800'}`}
              data-testid="tab-memories"
            >
              에이전트 기억
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl h-9 px-4 hover:opacity-90 transition-colors text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: oliveColor }}
            data-testid="create-doc-button"
          >
            <span className="text-lg leading-none">+</span>
            <span>새 문서</span>
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Library Tree */}
        {showFolderTree && (
          <aside className="w-64 flex-shrink-0 bg-white flex flex-col p-4 overflow-y-auto" style={{ borderRight: `1px solid ${borderColor}` }} data-testid="folder-sidebar">
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => { setSelectedFolderId(id); setPage(1); setDetailDoc(null) }}
              queryClient={queryClient}
            />
          </aside>
        )}

        {/* Center Panel: Document List */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ borderRight: `1px solid ${borderColor}`, backgroundColor: sandBg }}>
          {/* Center header */}
          <div className="p-4 bg-white/50 backdrop-blur-sm flex flex-col gap-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>Documents</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{total} Files</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['hybrid', 'semantic', 'keyword'] as const).map(mode => (
                <span
                  key={mode}
                  onClick={() => { setSearchMode(mode); setPage(1) }}
                  className="whitespace-nowrap bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-600 cursor-pointer transition-colors"
                  style={searchMode === mode ? { borderColor: oliveColor, borderWidth: '1px', borderStyle: 'solid', color: oliveColor } : { borderColor, borderWidth: '1px', borderStyle: 'solid' }}
                >
                  {mode === 'hybrid' ? '혼합' : mode === 'semantic' ? '의미' : '키워드'}
                </span>
              ))}
              <select
                value={contentTypeFilter}
                onChange={(e) => { setContentTypeFilter(e.target.value as ContentType | ''); setPage(1) }}
                className="bg-white border rounded-full px-3 py-1 text-xs text-gray-600 outline-none"
                style={{ borderColor }}
              >
                <option value="">전체 유형</option>
                <option value="markdown">Markdown</option>
                <option value="text">텍스트</option>
                <option value="html">HTML</option>
                <option value="mermaid">Mermaid</option>
              </select>
            </div>
            {/* Search field */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </span>
              <input
                className="block w-full pl-10 pr-3 py-2 border rounded-xl text-sm outline-none"
                placeholder="Search documents..."
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setPage(1) }}
                style={{ borderColor, backgroundColor: sandBg }}
                data-testid="doc-search"
              />
            </div>
          </div>

          {/* Search result label */}
          {isSearchActive && resultSearchMode && (
            <div className="px-5 py-1.5 text-xs text-gray-400" style={{ borderBottom: `1px solid ${borderColor}` }}>
              {resultSearchMode === 'semantic' ? '의미 검색 결과' : resultSearchMode === 'hybrid' ? '혼합 검색 결과' : '키워드 검색 결과'} ({total}건)
            </div>
          )}

          {/* Document list with drop zone */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 relative transition-colors ${dragOver ? 'bg-green-50' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {dragOver && (
              <div className="absolute inset-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center z-10 pointer-events-none" style={{ borderColor: oliveColor, backgroundColor: `${oliveColor}1a` }}>
                <span className="text-sm font-medium" style={{ color: oliveColor }}>파일을 놓으세요</span>
              </div>
            )}

            {(isSearchActive ? searchQuery.isLoading : docsQuery.isLoading) ? (
              <SkeletonTable rows={8} />
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="docs-empty">
                <h3 className="text-base font-medium text-gray-600 mb-2">이 폴더에 문서가 없습니다</h3>
                <p className="text-sm text-gray-400 mb-4">문서를 만들어 지식을 정리해보세요</p>
                <button onClick={() => setShowCreateModal(true)} className="text-white rounded-lg px-4 py-2 text-sm font-bold transition-colors" style={{ backgroundColor: oliveColor }}>문서 만들기</button>
              </div>
            ) : (
              items.map(doc => {
                const isActive = detailDoc?.id === doc.id
                return (
                  <div
                    key={doc.id}
                    onClick={() => setDetailDoc(doc)}
                    className={`bg-white p-4 rounded-2xl shadow-sm cursor-pointer transition-all ${
                      isActive ? 'ring-4' : 'border border-transparent hover:shadow-md'
                    }`}
                    style={isActive ? { borderColor: oliveColor, borderWidth: '2px', borderStyle: 'solid', ['--tw-ring-color' as string]: `${oliveColor}14` } : { borderColor: 'transparent' }}
                    data-testid={`doc-row-${doc.id}`}
                  >
                    <h4 className={`font-bold mb-1 ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>{doc.title}</h4>
                    <div className="flex gap-2 mb-2">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight rounded" style={{ backgroundColor: sandBg, color: oliveColor }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {doc.content && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{doc.content.slice(0, 150)}</p>
                    )}
                    {isSearchActive && 'highlight' in doc && typeof (doc as Record<string, unknown>).highlight === 'string' && (
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1">{(doc as Record<string, string>).highlight}</p>
                    )}
                    <div className="mt-3 text-[10px] text-gray-400 flex items-center justify-between">
                      <span>Edited {formatRelative(doc.updatedAt)}</span>
                      <span>By {doc.updatedBy || doc.createdBy || 'Unknown'}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="px-5 py-3 flex items-center justify-between bg-white" style={{ borderTop: `1px solid ${borderColor}` }}>
              <span className="text-xs text-gray-500">{total}건 중 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors" style={{ borderColor }}>이전</button>
                <span className="text-xs text-gray-400">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors" style={{ borderColor }}>다음</button>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel: Document Preview */}
        {detailDoc ? (
          <aside className="w-[500px] flex-shrink-0 bg-white flex flex-col overflow-hidden hidden lg:flex">
            <DocDetailView
              doc={detailDoc}
              folders={folders}
              onBack={() => setDetailDoc(null)}
              onEdit={(d) => { setEditDoc(d); setDetailDoc(null) }}
              onDelete={(id) => setDeleteConfirmId(id)}
              onShowVersions={(id) => setShowVersions(id)}
              queryClient={queryClient}
              onNavigateDoc={(docId) => {
                api.get<{ data: KnowledgeDoc }>(`/workspace/knowledge/docs/${docId}`)
                  .then(res => { if (res.data) setDetailDoc(res.data) })
              }}
            />
          </aside>
        ) : null}
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
      <VersionHistoryModal docId={showVersions} onClose={() => setShowVersions(null)} queryClient={queryClient} />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={() => { if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId); setDeleteConfirmId(null) }}
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

function FolderTree({ folders, selectedFolderId, onSelectFolder, queryClient }: {
  folders: KnowledgeFolder[]; selectedFolderId: string | null; onSelectFolder: (id: string | null) => void; queryClient: ReturnType<typeof useQueryClient>
}) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const createRef = useRef<HTMLInputElement>(null)

  const createMutation = useMutation({
    mutationFn: (data: { name: string; parentId?: string }) => api.post('/workspace/knowledge/folders', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); setCreating(false); setNewName(''); toast.success('폴더가 생성되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => { if (creating) createRef.current?.focus() }, [creating])

  const handleSubmit = () => { if (newName.trim()) createMutation.mutate({ name: newName.trim() }); else setCreating(false) }

  return (
    <div className="flex-1">
      <div className="mb-6">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</h3>
          <button onClick={() => setCreating(true)} className="text-gray-400 hover:text-gray-600 transition-colors" title="새 폴더" data-testid="add-folder">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          </button>
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectFolder(null)}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl w-full text-left transition-colors ${
              selectedFolderId === null ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={selectedFolderId === null ? { backgroundColor: oliveColor } : undefined}
            data-testid="folder-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            Knowledge Base
          </button>
          {folders.map(folder => (
            <FolderNode key={folder.id} folder={folder} depth={0} selectedFolderId={selectedFolderId} onSelectFolder={onSelectFolder} queryClient={queryClient} />
          ))}
        </nav>
      </div>

      {creating && (
        <div className="px-1 py-1">
          <input
            ref={createRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
            onBlur={handleSubmit}
            className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white text-gray-900 outline-none"
            style={{ borderColor: oliveColor }}
            placeholder="폴더 이름"
          />
        </div>
      )}
    </div>
  )
}

function FolderNode({ folder, depth, selectedFolderId, onSelectFolder, queryClient }: {
  folder: KnowledgeFolder; depth: number; selectedFolderId: string | null; onSelectFolder: (id: string | null) => void; queryClient: ReturnType<typeof useQueryClient>
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); setEditing(false); toast.success('이름이 변경되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workspace/knowledge/folders/${folder.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); onSelectFolder(null); toast.success('폴더가 삭제되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const createChildMutation = useMutation({
    mutationFn: (name: string) => api.post('/workspace/knowledge/folders', { name, parentId: folder.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); setCreatingChild(false); setChildName(''); toast.success('하위 폴더가 생성되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => { if (editing) editRef.current?.focus() }, [editing])
  useEffect(() => { if (creatingChild) childRef.current?.focus() }, [creatingChild])

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== folder.name) renameMutation.mutate(editName.trim())
    else { setEditing(false); setEditName(folder.name) }
  }

  const handleCreateChild = () => {
    if (childName.trim()) createChildMutation.mutate(childName.trim())
    else setCreatingChild(false)
  }

  const isSelected = selectedFolderId === folder.id

  return (
    <div>
      {editing ? (
        <div style={{ paddingLeft: `${depth * 16 + 4}px` }} className="py-0.5">
          <input ref={editRef} value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setEditing(false); setEditName(folder.name) } }} onBlur={handleRename} className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white text-gray-900 outline-none" style={{ borderColor: oliveColor }} />
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => onSelectFolder(folder.id)}
            onDoubleClick={() => { setEditing(true); setEditName(folder.name) }}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            className={`w-full text-left pr-8 py-2 text-sm rounded-xl transition-colors flex items-center gap-2 ${
              isSelected ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" style={{ color: isSelected ? 'white' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            <span className="truncate flex-1">{folder.name}</span>
            {folder.documentCount > 0 && <span className="text-xs" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>{folder.documentCount}</span>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 px-1.5 py-1 text-xs rounded-lg hover:bg-gray-100 transition-all">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px]">
                <button onClick={() => { setEditing(true); setEditName(folder.name); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">이름 변경</button>
                <button onClick={() => { setCreatingChild(true); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">하위 폴더 추가</button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { deleteMutation.mutate(); setShowMenu(false) }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50">삭제</button>
              </div>
            </>
          )}
        </div>
      )}
      {folder.children.map(child => (
        <FolderNode key={child.id} folder={child} depth={depth + 1} selectedFolderId={selectedFolderId} onSelectFolder={onSelectFolder} queryClient={queryClient} />
      ))}
      {creatingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }} className="py-0.5">
          <input ref={childRef} value={childName} onChange={(e) => setChildName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreateChild(); if (e.key === 'Escape') { setCreatingChild(false); setChildName('') } }} onBlur={handleCreateChild} className="w-full text-sm px-3 py-1.5 border rounded-lg bg-white text-gray-900 outline-none" style={{ borderColor: oliveColor }} placeholder="하위 폴더 이름" />
        </div>
      )}
    </div>
  )
}

// === Doc Detail View ===

function DocDetailView({ doc, folders, onBack, onEdit, onDelete, onShowVersions, queryClient, onNavigateDoc }: {
  doc: KnowledgeDoc; folders: KnowledgeFolder[]; onBack: () => void; onEdit: (doc: KnowledgeDoc) => void; onDelete: (id: string) => void; onShowVersions: (id: string) => void; queryClient: ReturnType<typeof useQueryClient>; onNavigateDoc?: (docId: string) => void
}) {
  const detailQuery = useQuery({
    queryKey: ['knowledge-doc-detail', doc.id],
    queryFn: () => api.get<{ data: KnowledgeDoc }>(`/workspace/knowledge/docs/${doc.id}`),
  })

  const similarQuery = useQuery({
    queryKey: ['knowledge-similar', doc.id],
    queryFn: () => api.get<{ data: Array<{ id: string; title: string; score: number }> }>(`/workspace/knowledge/docs/${doc.id}/similar`),
    staleTime: 60_000,
    enabled: !!doc.id,
  })

  const fullDoc = detailQuery.data?.data ?? doc

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="doc-detail">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-6 bg-white shrink-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-4">
          <button onClick={() => onEdit(fullDoc)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Edit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
          <button onClick={() => onDelete(fullDoc.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Delete">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <div className="h-4 w-px mx-1" style={{ backgroundColor: borderColor }}></div>
          <button onClick={() => onShowVersions(fullDoc.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors text-xs">버전</button>
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors text-xs ml-auto">닫기</button>
        </div>
        <div className="text-xs text-gray-400 italic">Auto-saved at {new Date(fullDoc.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto py-12 px-8">
          <span className="inline-block font-bold text-xs tracking-widest uppercase mb-4" style={{ color: oliveColor }}>Internal Documentation</span>
          <h1 className="font-bold text-4xl mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>{fullDoc.title}</h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {fullDoc.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight rounded" style={{ backgroundColor: sandBg, color: oliveColor }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          {fullDoc.content && (
            <div className="prose prose-sm max-w-none">
              {fullDoc.contentType === 'markdown' || fullDoc.contentType === 'mermaid' ? (
                <MarkdownRenderer content={fullDoc.content} />
              ) : fullDoc.contentType === 'html' ? (
                <MarkdownRenderer content={fullDoc.content} />
              ) : (
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{fullDoc.content}</pre>
              )}
            </div>
          )}

          {/* File attachment */}
          {fullDoc.fileUrl && (
            <div className="rounded-2xl p-6 mt-8" style={{ backgroundColor: sandBg, border: `1px solid ${borderColor}` }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">첨부 파일</span>
                <a href={`/api/workspace/knowledge/docs/${fullDoc.id}/download`} className="text-xs" style={{ color: oliveColor }}>다운로드</a>
              </div>
            </div>
          )}

          {/* Implementation Note callout */}
          {fullDoc.embeddingStatus === 'done' && (
            <div className="p-6 rounded-2xl my-8" style={{ backgroundColor: sandBg, border: `1px solid ${borderColor}` }}>
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: oliveColor }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" /></svg>
                Embedding Status
              </h4>
              <p className="text-sm text-gray-600 italic">
                벡터 DB에 동기화되었습니다. {fullDoc.embeddingModel && `모델: ${fullDoc.embeddingModel}`}
              </p>
            </div>
          )}

          {/* Similar documents */}
          {similarQuery.data?.data && similarQuery.data.data.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">유사 문서</h4>
              <div className="space-y-2">
                {similarQuery.data.data.map(sim => (
                  <div key={sim.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onNavigateDoc?.(sim.id)}>
                    <span className="text-sm text-gray-700 truncate">{sim.title}</span>
                    <Badge variant="info">{Math.round(sim.score * 100)}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// === Doc Modal (Create / Edit) ===

function DocModal({ isOpen, doc, folders, selectedFolderId, onClose, queryClient }: {
  isOpen: boolean; doc: KnowledgeDoc | null; folders: KnowledgeFolder[]; selectedFolderId: string | null; onClose: () => void; queryClient: ReturnType<typeof useQueryClient>
}) {
  const isEdit = !!doc
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<ContentType>('markdown')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (doc) { setTitle(doc.title); setContentType(doc.contentType); setContent(doc.content || ''); setFolderId(doc.folderId || ''); setTagsInput(doc.tags.join(', ')) }
    else { setTitle(''); setContentType('markdown'); setContent(''); setFolderId(selectedFolderId || ''); setTagsInput('') }
  }, [doc, selectedFolderId, isOpen])

  const createMutation = useMutation({
    mutationFn: (body: { title: string; contentType: string; content: string; folderId?: string; tags?: string[] }) => api.post('/workspace/knowledge/docs', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] }); queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] }); onClose(); toast.success('문서가 생성되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: (body: { title?: string; contentType?: string; content?: string; folderId?: string | null; tags?: string[] }) => api.patch(`/workspace/knowledge/docs/${doc!.id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] }); queryClient.invalidateQueries({ queryKey: ['knowledge-doc-detail', doc!.id] }); queryClient.invalidateQueries({ queryKey: ['knowledge-folders'] }); queryClient.invalidateQueries({ queryKey: ['knowledge-tags'] }); onClose(); toast.success('문서가 수정되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('제목을 입력하세요'); return }
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (isEdit) updateMutation.mutate({ title: title.trim(), contentType, content, folderId: folderId || null, tags })
    else createMutation.mutate({ title: title.trim(), contentType, content, folderId: folderId || undefined, tags })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '문서 편집' : '새 문서'} className="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">제목 *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none" placeholder="문서 제목" autoFocus />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">유형</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="markdown">마크다운</option>
              <option value="text">텍스트</option>
              <option value="html">HTML</option>
              <option value="mermaid">Mermaid</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">폴더</label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">폴더 없음</option>
              {flattenFolders(folders).map(f => (<option key={f.id} value={f.id}>{f.indent}{f.name}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">태그 (쉼표 구분)</label>
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400" placeholder="태그1, 태그2, ..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">내용</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono min-h-[256px] resize-y outline-none placeholder:text-gray-400" placeholder={contentType === 'markdown' ? '마크다운으로 작성...' : '내용을 입력하세요...'} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">취소</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" style={{ backgroundColor: oliveColor }}>
            {isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// === Version History Modal ===

function VersionHistoryModal({ docId, onClose, queryClient }: { docId: string | null; onClose: () => void; queryClient: ReturnType<typeof useQueryClient> }) {
  const versionsQuery = useQuery({
    queryKey: ['doc-versions', docId],
    queryFn: () => api.get<{ data: DocVersion[] }>(`/workspace/knowledge/docs/${docId}/versions`),
    enabled: !!docId,
  })

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => api.post(`/workspace/knowledge/docs/${docId}/versions/${versionId}/restore`, {}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-docs'] }); queryClient.invalidateQueries({ queryKey: ['knowledge-doc-detail', docId] }); queryClient.invalidateQueries({ queryKey: ['doc-versions', docId] }); onClose(); toast.success('버전이 복원되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const versions = versionsQuery.data?.data ?? []

  return (
    <Modal isOpen={!!docId} onClose={onClose} title="버전 이력">
      {versionsQuery.isLoading ? (
        <div className="py-8 text-center text-sm text-gray-400">로딩 중...</div>
      ) : versions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">버전 이력이 없습니다</div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {versions.map(v => (
            <div key={v.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <span className="text-sm text-gray-700">v{v.version}</span>
                <span className="text-xs text-gray-400 ml-2">{formatDate(v.createdAt)}{v.editedBy ? ` · ${v.editedBy}` : ''}</span>
                {v.changeNote && <p className="text-xs text-gray-400 mt-0.5">{v.changeNote}</p>}
              </div>
              <button onClick={() => restoreMutation.mutate(v.id)} disabled={restoreMutation.isPending} className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors" style={{ color: oliveColor }}>복원</button>
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] }); toast.success('기억이 삭제되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="memories-tab">
      <div className="px-6 py-3 flex flex-wrap gap-3 items-center bg-white" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
          <option value="">전체 에이전트</option>
          {agents.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MemoryType | '')} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
          <option value="">전체 유형</option>
          <option value="learning">학습</option>
          <option value="insight">인사이트</option>
          <option value="preference">선호</option>
          <option value="fact">사실</option>
        </select>
        <input className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none w-40" placeholder="검색..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <div className="flex-1" />
        <button onClick={() => setShowCreateModal(true)} className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors" style={{ backgroundColor: oliveColor }} data-testid="add-memory">+ 기억 추가</button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-3" style={{ backgroundColor: sandBg }}>
        {memoriesQuery.isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />))}</div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="memories-empty">
            <h3 className="text-base font-medium text-gray-600 mb-2">에이전트 기억이 없습니다</h3>
            <p className="text-sm text-gray-400">에이전트가 작업하면서 자동으로 기억을 학습합니다</p>
          </div>
        ) : (
          filteredMemories.map(mem => (
            <div key={mem.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 hover:shadow-sm transition-all" data-testid={`memory-card-${mem.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{mem.key}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${MEMORY_TYPE_COLORS[mem.memoryType]}`}>{MEMORY_TYPE_LABELS[mem.memoryType]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditMemory(mem)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => setDeleteConfirmId(mem.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{mem.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {mem.agentName && <span>에이전트: <span style={{ color: oliveColor }}>{mem.agentName}</span></span>}
                <span>출처: {mem.source || '자동'}</span>
                <span>사용 {mem.usageCount}회</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-12">신뢰도</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${mem.confidence >= 70 ? 'bg-emerald-500' : mem.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${mem.confidence}%` }} />
                </div>
                <span className={`text-[10px] font-medium ${mem.confidence >= 70 ? 'text-emerald-600' : mem.confidence >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{mem.confidence}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      <MemoryModal isOpen={showCreateModal || !!editMemory} memory={editMemory} agents={agents} onClose={() => { setShowCreateModal(false); setEditMemory(null) }} queryClient={queryClient} />
      <ConfirmDialog isOpen={!!deleteConfirmId} onConfirm={() => { if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId); setDeleteConfirmId(null) }} onCancel={() => setDeleteConfirmId(null)} title="기억 삭제" description="이 기억을 삭제하시겠습니까?" confirmText="삭제" cancelText="취소" />
    </div>
  )
}

// === Memory Modal ===

function MemoryModal({ isOpen, memory, agents, onClose, queryClient }: {
  isOpen: boolean; memory: AgentMemory | null; agents: Agent[]; onClose: () => void; queryClient: ReturnType<typeof useQueryClient>
}) {
  const isEdit = !!memory
  const [agentId, setAgentId] = useState('')
  const [memoryType, setMemoryType] = useState<MemoryType>('learning')
  const [key, setKey] = useState('')
  const [content, setContent] = useState('')
  const [confidence, setConfidence] = useState(80)

  useEffect(() => {
    if (memory) { setAgentId(memory.agentId); setMemoryType(memory.memoryType); setKey(memory.key); setContent(memory.content); setConfidence(memory.confidence) }
    else { setAgentId(agents[0]?.id || ''); setMemoryType('learning'); setKey(''); setContent(''); setConfidence(80) }
  }, [memory, agents, isOpen])

  const createMutation = useMutation({
    mutationFn: (body: { agentId: string; memoryType: string; key: string; content: string; confidence: number }) => api.post('/workspace/knowledge/memories', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] }); onClose(); toast.success('기억이 생성되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: (body: { memoryType?: string; key?: string; content?: string; confidence?: number }) => api.patch(`/workspace/knowledge/memories/${memory!.id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-memories'] }); onClose(); toast.success('기억이 수정되었습니다') },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!key.trim() || !content.trim()) { toast.error('제목과 내용을 입력하세요'); return }
    if (isEdit) updateMutation.mutate({ memoryType, key: key.trim(), content: content.trim(), confidence })
    else { if (!agentId) { toast.error('에이전트를 선택하세요'); return }; createMutation.mutate({ agentId, memoryType, key: key.trim(), content: content.trim(), confidence }) }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '기억 편집' : '새 기억'}>
      <div className="space-y-4">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">에이전트</label>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">에이전트 선택</option>
              {agents.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </select>
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">유형</label>
            <select value={memoryType} onChange={(e) => setMemoryType(e.target.value as MemoryType)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="learning">학습</option>
              <option value="insight">인사이트</option>
              <option value="preference">선호</option>
              <option value="fact">사실</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">신뢰도: {confidence}%</label>
            <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full h-9" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">제목</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400" placeholder="기억 제목" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">내용</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 h-32 resize-y outline-none placeholder:text-gray-400" placeholder="학습 내용..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">취소</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" style={{ backgroundColor: oliveColor }}>
            {isSubmitting ? '저장 중...' : isEdit ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
