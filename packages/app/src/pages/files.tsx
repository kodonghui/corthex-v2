// API Endpoints:
// GET    /workspace/files
// POST   /workspace/files  (multipart/form-data)
// DELETE /workspace/files/:id
// GET    /workspace/files/:id/download

import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog, toast } from '@corthex/ui'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'

type FileRecord = {
  id: string
  userId: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

type FileFilter = 'all' | 'images' | 'documents' | 'others'

function getFileIcon(mimeType: string): { emoji: string; bgColor: string; dotColor: string } {
  if (mimeType.includes('pdf')) return { emoji: 'PDF', bgColor: 'rgba(239,68,68,0.08)', dotColor: '#ef4444' }
  if (mimeType.startsWith('image/')) return { emoji: 'IMG', bgColor: 'rgba(59,130,246,0.08)', dotColor: '#3b82f6' }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return { emoji: 'XLS', bgColor: 'rgba(16,185,129,0.08)', dotColor: '#10b981' }
  if (mimeType.includes('video') || mimeType.includes('mp4')) return { emoji: 'VID', bgColor: 'rgba(139,92,246,0.08)', dotColor: '#8b5cf6' }
  if (mimeType.includes('word') || mimeType.includes('wordprocessing')) return { emoji: 'DOC', bgColor: 'rgba(59,130,246,0.08)', dotColor: '#3b82f6' }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) return { emoji: 'COD', bgColor: 'rgba(20,184,166,0.08)', dotColor: '#14b8a6' }
  if (mimeType.includes('markdown')) return { emoji: 'MD', bgColor: 'rgba(117,110,90,0.1)', dotColor: 'var(--color-corthex-text-secondary)' }
  return { emoji: 'FILE', bgColor: 'rgba(117,110,90,0.1)', dotColor: 'var(--color-corthex-text-secondary)' }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function filterFiles(files: FileRecord[], filter: FileFilter, search: string): FileRecord[] {
  let filtered = files
  if (filter === 'images') filtered = filtered.filter(f => f.mimeType.startsWith('image/'))
  else if (filter === 'documents') filtered = filtered.filter(f =>
    f.mimeType.includes('pdf') || f.mimeType.includes('word') ||
    f.mimeType.includes('sheet') || f.mimeType.includes('excel') || f.mimeType.includes('presentation'),
  )
  else if (filter === 'others') filtered = filtered.filter(f =>
    !f.mimeType.startsWith('image/') && !f.mimeType.includes('pdf') &&
    !f.mimeType.includes('word') && !f.mimeType.includes('sheet') &&
    !f.mimeType.includes('excel') && !f.mimeType.includes('presentation'),
  )
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q))
  }
  return filtered
}

const FILTER_OPTIONS: { value: FileFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'images', label: '이미지' },
  { value: 'documents', label: '문서' },
  { value: 'others', label: '기타' },
]

export function FilesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)
  const [filter, setFilter] = useState<FileFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => api.get<{ data: FileRecord[] }>('/workspace/files'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('파일이 삭제되었습니다')
      setDeleteTarget(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.upload('/workspace/files', formData)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('파일이 업로드되었습니다')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setIsUploading(false)
    }
  }

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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.upload('/workspace/files', formData)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('파일이 업로드되었습니다')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setIsUploading(false)
    }
  }, [queryClient])

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')

  const files = data?.data || []
  const filtered = filterFiles(files, filter, search).sort((a, b) => {
    if (sortBy === 'name') return a.filename.localeCompare(b.filename)
    if (sortBy === 'size') return b.sizeBytes - a.sizeBytes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0)
  const STORAGE_LIMIT = 1_073_741_824 // 1GB
  const storagePercent = Math.min(100, Math.round((totalSize / STORAGE_LIMIT) * 100))

  return (
    <div
      className="min-h-screen bg-corthex-bg text-corthex-text-primary"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="files-page"
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-corthex-accent/5 border-2 border-dashed border-corthex-accent/40">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-corthex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            <p className="text-lg font-bold mb-1 text-corthex-text-primary">Drop files to secure</p>
            <p className="text-sm text-corthex-text-secondary">Files will be encrypted on upload</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3" data-testid="files-header">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-corthex-text-primary tracking-tight mb-1 uppercase">
              {user?.name ? `${user.name}'s Drive` : 'Project Drive'}
            </h2>
            <p className="text-corthex-text-secondary text-sm">Quantum-resistant encrypted storage. Restricted access protocol active.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] w-full sm:w-auto bg-corthex-surface border border-corthex-accent/30 text-corthex-accent rounded text-xs font-bold hover:bg-corthex-accent hover:text-corthex-bg transition-all disabled:opacity-50"
              aria-label="파일 업로드"
              data-testid="upload-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>

        {/* Toolbar: filters + search + sort + view */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto" data-testid="files-filters">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors min-h-[44px] whitespace-nowrap ${
                  filter === opt.value
                    ? 'bg-corthex-accent text-corthex-bg border-corthex-accent'
                    : 'bg-corthex-elevated text-corthex-text-secondary border-corthex-border hover:border-corthex-accent/50'
                }`}
                data-testid={`filter-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" /></svg>
              <input
                className="bg-corthex-elevated border border-corthex-border text-corthex-text-primary text-base sm:text-xs py-2 pl-9 pr-4 rounded w-full sm:w-56 focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent transition-all placeholder:text-corthex-text-disabled"
                placeholder="Search encrypted files..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="file-search"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="bg-transparent border-none text-xs font-semibold text-corthex-accent cursor-pointer focus:ring-0"
            >
              <option value="date">Date Modified</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
            </select>
            <div className="flex items-center gap-1 bg-corthex-elevated rounded p-1 border border-corthex-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-corthex-border text-corthex-accent' : 'text-corthex-text-disabled hover:text-corthex-text-secondary'}`}
                aria-label="그리드 보기"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-corthex-border text-corthex-accent' : 'text-corthex-text-disabled hover:text-corthex-text-secondary'}`}
                aria-label="리스트 보기"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* File Grid / List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="files-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-corthex-elevated border border-corthex-border rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search || filter !== 'all' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="files-empty-search">
              <svg className="w-10 h-10 mb-4 text-corthex-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" /></svg>
              <h3 className="text-base font-medium mb-2 text-corthex-text-secondary">No results found</h3>
              <p className="text-sm text-corthex-text-disabled">Try adjusting filters or search query</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="files-empty">
              {/* Dropzone CTA */}
              <div
                className="group border-2 border-dashed border-corthex-border rounded flex flex-col items-center justify-center p-12 w-full max-w-md hover:border-corthex-accent transition-colors cursor-pointer bg-corthex-elevated/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-8 h-8 text-corthex-text-disabled group-hover:text-corthex-accent mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                <p className="text-[10px] font-bold text-corthex-text-disabled group-hover:text-corthex-accent uppercase tracking-widest">Drop files to secure</p>
              </div>
            </div>
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="files-grid">
            {filtered.map(file => {
              const { emoji, bgColor, dotColor } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="group relative bg-corthex-elevated border border-corthex-border p-5 hover:border-corthex-accent/50 transition-all"
                  data-testid={`file-grid-${file.id}`}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/api/workspace/files/${file.id}/download`}
                      download
                      className="p-1 text-corthex-text-secondary hover:text-corthex-accent transition-colors"
                      title="다운로드"
                      aria-label={`다운로드: ${file.filename}`}
                      onClick={e => e.stopPropagation()}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                    </a>
                    {file.userId === user?.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(file) }}
                        className="p-1 text-corthex-text-secondary hover:text-corthex-error transition-colors"
                        title="삭제"
                        aria-label={`삭제: ${file.filename}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </button>
                    )}
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-black font-mono mb-1" style={{ color: dotColor }}>{emoji}</div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-corthex-text-primary group-hover:text-corthex-accent transition-colors truncate">{file.filename}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">{formatBytes(file.sizeBytes)}</span>
                      <span className="text-[10px] font-mono text-corthex-text-disabled">{new Date(file.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Dropzone card */}
            <div
              className="group border-2 border-dashed border-corthex-border flex flex-col items-center justify-center p-8 hover:border-corthex-accent transition-colors cursor-pointer bg-corthex-elevated/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-7 h-7 text-corthex-text-disabled group-hover:text-corthex-accent text-3xl mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              <p className="text-[10px] font-bold text-corthex-text-disabled group-hover:text-corthex-accent uppercase tracking-widest">Drop files to secure</p>
            </div>
          </div>
        ) : (
          <div className="border border-corthex-border overflow-hidden" data-testid="files-list">
            {filtered.map((file, idx) => {
              const { emoji, bgColor, dotColor } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className={`flex items-center gap-4 px-5 py-4 group hover:bg-corthex-elevated/50 transition-colors ${idx > 0 ? 'border-t border-corthex-border/50' : ''}`}
                  data-testid={`file-row-${file.id}`}
                >
                  <div className="text-2xl font-mono font-black shrink-0" style={{ color: dotColor }}>{emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-corthex-text-primary group-hover:text-corthex-accent transition-colors">{file.filename}</p>
                    <p className="text-[10px] font-mono text-corthex-text-disabled uppercase">{formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/api/workspace/files/${file.id}/download`}
                      download
                      className="p-1.5 text-corthex-text-secondary hover:text-corthex-accent transition-colors"
                      title="다운로드"
                      aria-label={`다운로드: ${file.filename}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                    </a>
                    {file.userId === user?.id && (
                      <button
                        onClick={() => setDeleteTarget(file)}
                        className="p-1.5 text-corthex-text-secondary hover:text-corthex-error transition-colors"
                        title="삭제"
                        aria-label={`삭제: ${file.filename}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Storage summary / Bottom context bar */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-corthex-border flex flex-wrap gap-4 sm:gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Files</span>
            <span className="text-sm font-bold text-corthex-accent font-mono">{files.length}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Total Size</span>
            <span className="text-sm font-bold text-corthex-text-primary">{formatBytes(totalSize)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Storage</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-corthex-border rounded-full overflow-hidden">
                <div className="bg-corthex-accent h-full" style={{ width: `${storagePercent}%` }} />
              </div>
              <span className="text-sm font-bold text-corthex-text-primary font-mono">{storagePercent}%</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">Encryption</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-corthex-success animate-pulse" />
              <span className="text-sm font-bold text-corthex-text-primary">AES-256 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        title="파일을 삭제하시겠습니까?"
        description={deleteTarget ? `"${deleteTarget.filename}" 파일이 삭제됩니다.` : ''}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  )
}
