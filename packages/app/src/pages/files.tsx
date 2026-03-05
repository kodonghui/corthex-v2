import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button } from '@corthex/ui'
import { api } from '../lib/api'

type FileItem = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilesPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await api.get<{ data: FileItem[] }>('/workspace/files')
      return res.data
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      setUploading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/workspace/files/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) throw new Error('업로드 실패')
        return res.json()
      } finally {
        setUploading(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/files/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  })

  const handleDownload = (file: FileItem) => {
    const token = localStorage.getItem('token')
    const url = `/api/workspace/files/${file.id}/download`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.filename
        a.click()
        URL.revokeObjectURL(a.href)
      })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">파일 관리</h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadMutation.mutate(file)
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '업로드 중...' : '파일 업로드'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">불러오는 중...</div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center text-zinc-400">
          업로드된 파일이 없습니다
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-zinc-400">
                  {formatFileSize(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                  다운로드
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (confirm('이 파일을 삭제하시겠습니까?')) {
                      deleteMutation.mutate(file.id)
                    }
                  }}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
