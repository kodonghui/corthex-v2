import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

interface KnowledgeFolder {
  id: string
  name: string
  parentId: string | null
}

interface ExportKnowledgeDialogProps {
  sketchId: string
  sketchName: string
  onClose: () => void
}

export function ExportKnowledgeDialog({ sketchId, sketchName, onClose }: ExportKnowledgeDialogProps) {
  const [title, setTitle] = useState(sketchName)
  const [folderId, setFolderId] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: foldersRes } = useQuery({
    queryKey: ['knowledge-folders'],
    queryFn: () => api.get<{ data: KnowledgeFolder[] }>('/workspace/knowledge/folders'),
  })

  const exportMutation = useMutation({
    mutationFn: (data: { title: string; folderId?: string }) =>
      api.post(`/workspace/sketches/${sketchId}/export-knowledge`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-docs-mermaid'] })
      onClose()
    },
  })

  const folders = foldersRes?.data || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white border border-stone-200 rounded-lg p-5 w-96 max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-200 mb-4">지식 베이스에 다이어그램 저장</h3>

        <label className="block text-xs text-stone-500 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-1.5 bg-stone-100 border border-stone-200 rounded text-sm text-slate-200 mb-3 focus:outline-none focus:border-blue-500"
          placeholder="다이어그램 제목"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim()) {
              exportMutation.mutate({ title: title.trim(), folderId: folderId || undefined })
            }
          }}
        />

        <label className="block text-xs text-stone-500 mb-1">폴더</label>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="w-full px-3 py-1.5 bg-stone-100 border border-stone-200 rounded text-sm text-slate-200 mb-4 focus:outline-none focus:border-blue-500"
        >
          <option value="">루트 (폴더 없음)</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {exportMutation.isError && (
          <div className="text-xs text-red-400 mb-3">내보내기에 실패했습니다. 다시 시도해주세요.</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-stone-500 hover:text-slate-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => exportMutation.mutate({ title: title.trim(), folderId: folderId || undefined })}
            disabled={!title.trim() || exportMutation.isPending}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors"
          >
            {exportMutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
