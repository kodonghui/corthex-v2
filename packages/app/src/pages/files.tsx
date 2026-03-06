import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input, FilterChip, EmptyState, ConfirmDialog, Skeleton, toast } from '@corthex/ui'
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

function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙'
  if (mimeType.includes('word') || mimeType.includes('wordprocessing')) return '📘'
  if (mimeType.includes('json')) return '{}'
  if (mimeType.includes('zip')) return '🗂️'
  if (mimeType.startsWith('text/')) return '📝'
  return '📄'
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
    f.mimeType.includes('sheet') || f.mimeType.includes('presentation'),
  )
  else if (filter === 'others') filtered = filtered.filter(f =>
    !f.mimeType.startsWith('image/') && !f.mimeType.includes('pdf') &&
    !f.mimeType.includes('word') && !f.mimeType.includes('sheet') &&
    !f.mimeType.includes('presentation'),
  )
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q))
  }
  return filtered
}

export function FilesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore(s => s.user)
  const [filter, setFilter] = useState<FileFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null)
  const [isUploading, setIsUploading] = useState(false)
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
      setDeleteTarget(null)
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

  const files = data?.data || []
  const filtered = filterFiles(files, filter, search)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">파일 관리</h1>
        <div>
          <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? '업로드 중...' : '파일 업로드'}
          </button>
        </div>
      </div>

      {/* 검색 + 필터 */}
      <div className="space-y-3">
        <Input
          type="text"
          placeholder="파일명 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <FilterChip label="전체" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterChip label="이미지" active={filter === 'images'} onClick={() => setFilter('images')} />
          <FilterChip label="문서" active={filter === 'documents'} onClick={() => setFilter('documents')} />
          <FilterChip label="기타" active={filter === 'others'} onClick={() => setFilter('others')} />
        </div>
      </div>

      {/* 파일 목록 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📁"
          title={search || filter !== 'all' ? '검색 결과가 없습니다' : '파일이 없습니다'}
          description={search || filter !== 'all' ? '필터를 변경하거나 검색어를 수정해보세요' : '파일을 업로드하면 여기에 표시됩니다'}
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-lg w-8 text-center shrink-0">{getMimeIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/api/workspace/files/${file.id}/download`}
                  download
                  className="p-2 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  title="다운로드"
                >
                  ⬇️
                </a>
                {file.userId === user?.id && (
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="p-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    title="삭제"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
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
