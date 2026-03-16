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
  if (mimeType.includes('markdown')) return { emoji: 'MD', bgColor: 'rgba(209,201,178,0.1)', dotColor: '#9c8d66' }
  return { emoji: 'FILE', bgColor: 'rgba(209,201,178,0.1)', dotColor: '#9c8d66' }
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
      className="min-h-screen font-sans"
      style={{ backgroundColor: '#fcfbf9', color: '#463e30', fontFamily: "'Inter', sans-serif" }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="files-page"
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(90,114,71,0.06)', border: '2px dashed rgba(90,114,71,0.4)' }}>
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#9c8d66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            <p className="text-lg font-bold mb-1" style={{ color: '#463e30' }}>Drag and drop files here</p>
            <p className="text-sm" style={{ color: '#9c8d66' }}>or click to browse from your computer</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-6">
        {/* Page Title */}
        <div className="flex items-center justify-between" data-testid="files-header">
          <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>Files</h1>
          <div>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex cursor-pointer items-center justify-center rounded-xl text-sm font-bold h-9 px-5 transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#e57373', color: '#ffffff' }}
              aria-label="파일 업로드"
              data-testid="upload-button"
            >
              <svg className="w-[18px] h-[18px] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
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
              className="flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors"
              style={filter === opt.value
                ? { backgroundColor: '#e57373', color: '#ffffff' }
                : { backgroundColor: '#f2f0e9', color: '#6a5d43', border: '1px solid #e8e4d9' }
              }
              data-testid={`filter-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <label
            className="flex items-center w-full h-12 bg-white border rounded-xl overflow-hidden transition-shadow"
            style={{ borderColor: '#e8e4d9' }}
          >
            <svg className="w-5 h-5 ml-4" style={{ color: '#b7aa88' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" /></svg>
            <input
              className="w-full bg-transparent border-none text-sm px-3 focus:outline-none focus:ring-0 placeholder:text-stone-400"
              style={{ color: '#463e30' }}
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
            className="bg-transparent border-none text-sm font-medium transition-colors cursor-pointer p-0 focus:ring-0"
            style={{ color: '#6a5d43' }}
          >
            <option value="date">최근 생성일순</option>
            <option value="name">이름순</option>
            <option value="size">크기순</option>
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 rounded-lg transition-colors"
              style={viewMode === 'list'
                ? { color: '#e57373', backgroundColor: 'rgba(90,114,71,0.1)' }
                : { color: '#9c8d66' }
              }
              aria-label="리스트 보기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 rounded-lg transition-colors"
              style={viewMode === 'grid'
                ? { color: '#e57373', backgroundColor: 'rgba(90,114,71,0.1)' }
                : { color: '#9c8d66' }
              }
              aria-label="그리드 보기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors"
          style={{ borderColor: '#e8e4d9', backgroundColor: 'rgba(242,240,233,0.5)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-10 h-10" style={{ color: '#9c8d66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <div className="text-center">
            <p className="text-lg font-bold mb-1" style={{ color: '#463e30' }}>Drag and drop files here</p>
            <p className="text-sm" style={{ color: '#9c8d66' }}>or click to browse from your computer</p>
          </div>
        </div>

        {/* File List / Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="files-loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: '#f2f0e9', border: '1px solid #e8e4d9' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search || filter !== 'all' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="files-empty-search">
              <svg className="w-10 h-10 mb-4" style={{ color: '#d1c9b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2" /></svg>
              <h3 className="text-base font-medium mb-2" style={{ color: '#6a5d43' }}>검색 결과가 없습니다</h3>
              <p className="text-sm" style={{ color: '#9c8d66' }}>필터를 변경하거나 검색어를 수정해보세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="files-empty">
              <svg className="w-16 h-16 mb-4" style={{ color: '#d1c9b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              <h3 className="text-base font-medium mb-2" style={{ color: '#6a5d43' }}>파일이 없습니다</h3>
              <p className="text-sm mb-4" style={{ color: '#9c8d66' }}>파일을 업로드하면 여기에 표시됩니다</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-colors hover:opacity-90"
                style={{ backgroundColor: '#e57373', color: '#ffffff' }}
              >
                파일 업로드
              </button>
            </div>
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="files-grid">
            {filtered.map(file => {
              const { emoji, bgColor, dotColor } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex flex-col rounded-2xl border bg-white p-4 transition-all group cursor-pointer relative overflow-hidden"
                  style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}
                  data-testid={`file-grid-${file.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: bgColor, color: dotColor }}
                    >
                      {emoji}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/api/workspace/files/${file.id}/download`}
                        download
                        className="p-1 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: '#9c8d66' }}
                        title="다운로드"
                        aria-label={`다운로드: ${file.filename}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </a>
                      {file.userId === user?.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(file) }}
                          className="p-1 rounded-lg transition-colors hover:opacity-70"
                          style={{ color: '#ef4444' }}
                          title="삭제"
                          aria-label={`삭제: ${file.filename}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate mb-1" style={{ color: '#463e30' }} title={file.filename}>{file.filename}</h3>
                  <div className="flex items-center justify-between text-xs mt-auto pt-2" style={{ color: '#9c8d66' }}>
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
              const { emoji, bgColor, dotColor } = getFileIcon(file.mimeType)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border bg-white transition-all group cursor-pointer"
                  style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}
                  data-testid={`file-row-${file.id}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: bgColor, color: dotColor }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate transition-colors" style={{ color: '#463e30' }}>{file.filename}</p>
                    <p className="text-xs mt-0.5 font-mono tabular-nums" style={{ color: '#9c8d66' }}>{formatBytes(file.sizeBytes)} &middot; {new Date(file.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`/api/workspace/files/${file.id}/download`}
                      download
                      className="p-2 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: '#9c8d66' }}
                      title="다운로드"
                      aria-label={`다운로드: ${file.filename}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                    </a>
                    {file.userId === user?.id && (
                      <button
                        onClick={() => setDeleteTarget(file)}
                        className="p-2 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: '#ef4444' }}
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

        {/* Storage summary */}
        {files.length > 0 && (
          <div className="flex items-center gap-4 px-1">
            <span className="text-xs" style={{ color: '#9c8d66' }}>{files.length}개 파일</span>
            <span className="text-xs" style={{ color: '#9c8d66' }}>&middot;</span>
            <span className="text-xs" style={{ color: '#9c8d66' }}>총 {formatBytes(totalSize)}</span>
            <div className="flex-1 max-w-[200px] h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e8e4d9' }}>
              <div className="h-full rounded-full" style={{ width: `${storagePercent}%`, backgroundColor: '#e57373' }} />
            </div>
            <span className="text-xs font-mono tabular-nums" style={{ color: '#9c8d66' }}>{storagePercent}%</span>
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
