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

function getFileIcon(mimeType: string): { icon: string; colorClass: string } {
  if (mimeType.startsWith('image/')) return { icon: '🖼', colorClass: 'text-blue-400' }
  if (mimeType.includes('pdf')) return { icon: '📄', colorClass: 'text-red-400' }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: '📊', colorClass: 'text-emerald-400' }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: '📑', colorClass: 'text-orange-400' }
  if (mimeType.includes('word') || mimeType.includes('wordprocessing')) return { icon: '📝', colorClass: 'text-blue-400' }
  if (mimeType.includes('json')) return { icon: '{ }', colorClass: 'text-amber-400' }
  if (mimeType.includes('zip')) return { icon: '📦', colorClass: 'text-purple-400' }
  if (mimeType.startsWith('text/')) return { icon: '📃', colorClass: 'text-slate-400' }
  return { icon: '📄', colorClass: 'text-slate-400' }
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

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
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
      className="h-full overflow-y-auto bg-slate-900"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="files-page"
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-40 bg-cyan-400/10 border-2 border-dashed border-cyan-400/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📂</span>
            </div>
            <p className="text-lg font-medium text-cyan-300">파일을 여기에 놓으세요</p>
            <p className="text-sm text-cyan-400/70">최대 50MB</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="files-header">
          <h1 className="text-lg sm:text-xl font-bold text-slate-50 tracking-tight">파일</h1>
          <div>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 rounded-xl p-2.5 sm:px-4 sm:py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              aria-label="파일 업로드"
              data-testid="upload-button"
            >
              <span className="text-sm">↑</span>
              <span className="hidden sm:inline">{isUploading ? '업로드 중...' : '파일 업로드'}</span>
            </button>
          </div>
        </div>

        {/* Search bar (full width on mobile) */}
        <div className="space-y-3" data-testid="files-filters">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="파일 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:max-w-xs bg-slate-800/50 border border-slate-700 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-all"
              data-testid="file-search"
            />
          </div>

          {/* Sort + View toggle */}
          <div className="flex justify-between items-center">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'name' | 'size')}
              className="bg-transparent border-none text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer p-0 focus:ring-0"
            >
              <option value="date">최근 생성일순</option>
              <option value="name">이름순</option>
              <option value="size">크기순</option>
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:bg-slate-800'}`}
                aria-label="리스트 보기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:bg-slate-800'}`}
                aria-label="그리드 보기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter === opt.value
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
                data-testid={`filter-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        {isLoading ? (
          <div className="space-y-2" data-testid="files-loading">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search || filter !== 'all' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="files-empty-search">
              <svg className="w-10 h-10 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 4h.01" />
              </svg>
              <h3 className="text-base font-medium text-slate-300 mb-2">검색 결과가 없습니다</h3>
              <p className="text-sm text-slate-500">필터를 변경하거나 검색어를 수정해보세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="files-empty">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                <span className="text-3xl">📂</span>
              </div>
              <h3 className="text-base font-medium text-slate-300 mb-2">파일이 없습니다</h3>
              <p className="text-sm text-slate-500 mb-4">파일을 업로드하면 여기에 표시됩니다</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                파일 업로드
              </button>
            </div>
          )
        ) : viewMode === 'list' ? (
          <div className="space-y-2 sm:space-y-1.5 pb-24 sm:pb-0" data-testid="files-list">
            {filtered.map(file => {
              const { icon, colorClass } = getFileIcon(file.mimeType)
              const bgColor = file.mimeType.includes('pdf') ? 'bg-red-500/10'
                : file.mimeType.includes('sheet') || file.mimeType.includes('excel') ? 'bg-emerald-500/10'
                : file.mimeType.startsWith('image/') ? 'bg-violet-500/10'
                : file.mimeType.includes('json') ? 'bg-amber-500/10'
                : file.mimeType.includes('word') ? 'bg-blue-500/10'
                : 'bg-slate-700/50'
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-cyan-400/30 transition-colors group cursor-pointer"
                  data-testid={`file-row-${file.id}`}
                >
                  {/* File Type Icon — larger on mobile */}
                  <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0 ${colorClass}`}>
                    <span className="text-xl sm:text-lg">{icon}</span>
                  </div>
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate group-hover:text-cyan-400 transition-colors">{file.filename}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  {/* Actions — visible on mobile, hover on desktop */}
                  <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <span className="font-mono text-xs text-slate-500 hidden sm:inline mr-2">{formatBytes(file.sizeBytes)}</span>
                    <a
                      href={`/api/workspace/files/${file.id}/download`}
                      download
                      className="p-2 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                      title="다운로드"
                      aria-label={`다운로드: ${file.filename}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    {file.userId === user?.id && (
                      <button
                        onClick={() => setDeleteTarget(file)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                        title="삭제"
                        aria-label={`삭제: ${file.filename}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-24 sm:pb-0" data-testid="files-grid">
            {filtered.map(file => {
              const { icon, colorClass } = getFileIcon(file.mimeType)
              const bgColor = file.mimeType.includes('pdf') ? 'bg-red-500/10'
                : file.mimeType.includes('sheet') || file.mimeType.includes('excel') ? 'bg-emerald-500/10'
                : file.mimeType.startsWith('image/') ? 'bg-violet-500/10'
                : file.mimeType.includes('json') ? 'bg-amber-500/10'
                : file.mimeType.includes('word') ? 'bg-blue-500/10'
                : 'bg-slate-700/50'
              return (
                <div
                  key={file.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-cyan-400/30 transition-colors cursor-pointer group"
                  data-testid={`file-grid-${file.id}`}
                >
                  <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center ${colorClass}`}>
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-100 truncate w-full text-center group-hover:text-cyan-400 transition-colors">{file.filename}</p>
                  <p className="text-[10px] font-mono text-slate-500">{formatBytes(file.sizeBytes)}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Storage bar (mobile fixed bottom) */}
        {files.length > 0 && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-20">
            <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-sm">☁</span>
                  <h3 className="text-xs font-bold text-slate-100">스토리지</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{formatBytes(totalSize)} / 1 GB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Desktop storage summary */}
        {files.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 px-1">
            <span className="text-xs text-slate-500">{files.length}개 파일</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">총 {formatBytes(totalSize)}</span>
            <div className="flex-1 max-w-[200px] h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${storagePercent}%` }} />
            </div>
            <span className="text-xs font-mono text-slate-500">{storagePercent}%</span>
          </div>
        )}
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
