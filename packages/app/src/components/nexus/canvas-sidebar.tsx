import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

interface SketchItem {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface CanvasSidebarProps {
  currentSketchId: string | null
  onLoad: (id: string) => void
  onNew: () => void
}

export function CanvasSidebar({ currentSketchId, onLoad, onNew }: CanvasSidebarProps) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: sketchesRes, isLoading } = useQuery({
    queryKey: ['sketches'],
    queryFn: () => api.get<{ data: SketchItem[] }>('/workspace/sketches'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sketches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
      setConfirmDelete(null)
    },
  })

  const sketches = sketchesRes?.data || []

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">저장된 캔버스</span>
        <button
          onClick={onNew}
          className="text-[10px] px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
        >
          + 새 캔버스
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-3 py-4 text-xs text-zinc-500 text-center">불러오는 중...</div>
        )}

        {!isLoading && sketches.length === 0 && (
          <div className="px-3 py-4 text-xs text-zinc-500 text-center">
            저장된 캔버스가 없어요.
            <br />
            캔버스를 그리고 저장해보세요.
          </div>
        )}

        {sketches.map((s) => (
          <div
            key={s.id}
            className={`group px-3 py-2 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
              s.id === currentSketchId ? 'bg-indigo-900/30 border-l-2 border-l-indigo-500' : ''
            }`}
            onClick={() => onLoad(s.id)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-200 truncate flex-1">{s.name}</span>
              {confirmDelete === s.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMutation.mutate(s.id)
                    }}
                    className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white rounded"
                  >
                    확인
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(null)
                    }}
                    className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmDelete(s.id)
                  }}
                  className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="삭제"
                >
                  ×
                </button>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {new Date(s.updatedAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
