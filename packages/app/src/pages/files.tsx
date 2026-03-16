import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfirmDialog, toast } from '@corthex/ui'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Search, Upload, MoreVertical, Download, Trash2, CloudUpload, FileText, Image, Table2, Film, FileCode, FileSpreadsheet, File, LayoutGrid, LayoutList } from 'lucide-react'

type FileRecord = {
  id: string
  userId: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

type FileFilter = 'all' | 'images' | 'documents' | 'others'

function getFileIcon(mimeType: string): { icon: React.ReactNode; bgClass: string; colorClass: string } {
  if (mimeType.includes('pdf')) return { icon: <FileText className="w-6 h-6" />, bgClass: 'bg-red-500/10', colorClass: 'text-red-500' }
  if (mimeType.startsWith('image/')) return { icon: <Image className="w-6 h-6" />, bgClass: 'bg-blue-500/10', colorClass: 'text-blue-500' }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return { icon: <Table2 className="w-6 h-6" />, bgClass: 'bg-green-500/10', colorClass: 'text-green-500' }
  if (mimeType.includes('video') || mimeType.includes('mp4')) return { icon: <Film className="w-6 h-6" />, bgClass: 'bg-purple-500/10', colorClass: 'text-purple-500' }
  if (mimeType.includes('word') || mimeType.includes('wordprocessing')) return { icon: <FileText className="w-6 h-6" />, bgClass: 'bg-blue-400/10', colorClass: 'text-blue-400' }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) return { icon: <FileCode className="w-6 h-6" />, bgClass: 'bg-teal-500/10', colorClass: 'text-teal-500' }
  if (mimeType.includes('markdown')) return { icon: <FileSpreadsheet className="w-6 h-6" />, bgClass: 'bg-slate-500/10', colorClass: 'text-slate-400' }
  return { icon: <File className="w-6 h-6" />, bgClass: 'bg-slate-500/10', colorClass: 'text-slate-400' }
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
      className="h-full overflow-y-auto bg-[#0f172a]"
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
            <CloudUpload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-50 mb-1">Drag and drop files here</p>
            <p className="text-sm text-slate-400">or click to browse from your computer</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-6">
        {/* Page Title */}
        <div className="flex items-center justify-between" data-testid="files-header">
          <h1 className="text-[32px] font-bold leading-tight text-slate-50">Files (파일)</h1>
          <div>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex cursor-pointer items-center justify-center rounded bg-cyan-400 text-slate-900 text-sm font-bold h-9 px-5 hover:bg-cyan-400/90 transition-colors disabled:opacity-50"
              aria-label="파일 업로드"
              data-testid="upload-button"
            >
              <Upload className="w-[18px] h-[18px] mr-2" />
              {isUploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2" data-testid="files-filters">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex h-8 items-center justify-center rounded px-4 text-sm font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-800 border border-slate-600 text-slate-100 hover:border-cyan-400/50'
              }`}
              data-testid={`filter-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <label className="flex items-center w-full h-12 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-shadow">
            <Search className="w-5 h-5 text-slate-400 ml-4" />
            <input
              className="w-full bg-transparent border-none text-sm px-3 focus:outline-none focus:ring-0 placeholder-slate-500 text-slate-50"
              placeholder="Search files, formats, or uploaders..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="file-search"
            />
          </label>
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
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:bg-slate-800'}`}
              aria-label="그리드 보기"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 p-12 hover:border-cyan-400/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload className="w-10 h-10 text-slate-500" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-50 mb-1">Drag and drop files here</p>
            <p className="text-sm text-slate-400">or click to browse from your computer</p>
          </div>
        </div>

        {/* File List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="files-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 border border-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search || filter !== 'all' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="files-empty-search">
              <Search className="w-10 h-10 text-slate-600 mb-4" />
              <h3 className="text-base font-medium text-slate-300 mb-2">검색 결과가 없습니다</h3>
              <p className="text-sm text-slate-500">필터를 변경하거나 검색어를 수정해보세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="files-empty">
              <CloudUpload className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-base font-medium text-slate-300 mb-2">파일이 없습니다</h3>
              <p className="text-sm text-slate-500 mb-4">파일을 업로드하면 여기에 표시됩니다</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 rounded-lg px-4 py-2 text-sm font-bold transition-colors"
              >
                파일 업로드
              </button>
            </div>
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="files-grid">
            {filtered.map(file => {
              const { icon, bgClass, colorClass } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex flex-col rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-cyan-400/50 transition-colors group cursor-pointer relative overflow-hidden"
                  data-testid={`file-grid-${file.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-10 rounded ${bgClass} ${colorClass} flex items-center justify-center`}>
                      {icon}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/api/workspace/files/${file.id}/download`}
                        download
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        title="다운로드"
                        aria-label={`다운로드: ${file.filename}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {file.userId === user?.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(file) }}
                          className="p-1 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                          title="삭제"
                          aria-label={`삭제: ${file.filename}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate mb-1 text-slate-50" title={file.filename}>{file.filename}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2">
                    <span className="font-mono tabular-nums">{formatBytes(file.sizeBytes)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2" data-testid="files-list">
            {filtered.map(file => {
              const { icon, bgClass, colorClass } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800 hover:border-cyan-400/30 transition-colors group cursor-pointer"
                  data-testid={`file-row-${file.id}`}
                >
                  <div className={`w-10 h-10 rounded ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-50 truncate group-hover:text-cyan-400 transition-colors">{file.filename}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">{formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/api/workspace/files/${file.id}/download`}
                      download
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="다운로드"
                      aria-label={`다운로드: ${file.filename}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {file.userId === user?.id && (
                      <button
                        onClick={() => setDeleteTarget(file)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                        title="삭제"
                        aria-label={`삭제: ${file.filename}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Storage summary */}
        {files.length > 0 && (
          <div className="flex items-center gap-4 px-1">
            <span className="text-xs text-slate-500">{files.length}개 파일</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">총 {formatBytes(totalSize)}</span>
            <div className="flex-1 max-w-[200px] h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${storagePercent}%` }} />
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">{storagePercent}%</span>
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
