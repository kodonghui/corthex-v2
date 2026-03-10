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

  const files = data?.data || []
  const filtered = filterFiles(files, filter, search)
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0)

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
        <div className="fixed inset-0 z-40 bg-blue-500/10 border-2 border-dashed border-blue-500/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📂</span>
            </div>
            <p className="text-lg font-medium text-blue-300">파일을 여기에 놓으세요</p>
            <p className="text-sm text-blue-400/70">최대 50MB</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="files-header">
          <h1 className="text-xl font-semibold text-slate-50">파일 관리</h1>
          <div>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              aria-label="파일 업로드"
              data-testid="upload-button"
            >
              <span className="text-sm">↑</span>
              {isUploading ? '업로드 중...' : '파일 업로드'}
            </button>
          </div>
        </div>

        {/* Storage summary */}
        {files.length > 0 && (
          <div className="flex items-center gap-4 px-1">
            <span className="text-xs text-slate-500">{files.length}개 파일</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">총 {formatBytes(totalSize)}</span>
          </div>
        )}

        {/* Search + Filter Chips */}
        <div className="space-y-3" data-testid="files-filters">
          {/* Search */}
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="파일명 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors"
              data-testid="file-search"
            />
          </div>
          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-slate-200'
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
        ) : (
          <div className="space-y-1.5" data-testid="files-list">
            {filtered.map(file => {
              const { icon, colorClass } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-colors group"
                  data-testid={`file-row-${file.id}`}
                >
                  {/* File Type Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0 ${colorClass}`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{file.filename}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
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
