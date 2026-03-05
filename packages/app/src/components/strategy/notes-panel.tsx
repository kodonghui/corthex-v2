import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, ConfirmDialog, toast } from '@corthex/ui'
import { MarkdownRenderer } from '../markdown-renderer'

type Note = {
  id: string
  stockCode: string
  title: string | null
  content: string
  createdAt: string
  updatedAt: string
}

export function NotesPanel() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const stockCode = searchParams.get('stock')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: notesRes } = useQuery({
    queryKey: ['strategy-notes', stockCode],
    queryFn: () => api.get<{ data: Note[] }>(`/workspace/strategy/notes?stockCode=${encodeURIComponent(stockCode!)}`),
    enabled: !!stockCode,
  })
  const notes = notesRes?.data || []

  const createNote = useMutation({
    mutationFn: (body: { stockCode: string; title?: string; content: string }) =>
      api.post('/workspace/strategy/notes', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
      setIsCreating(false)
      setEditContent('')
      setEditTitle('')
    },
    onError: () => toast.error('메모 저장에 실패했습니다'),
  })

  const updateNote = useMutation({
    mutationFn: ({ id, ...body }: { id: string; title?: string; content?: string }) =>
      api.patch(`/workspace/strategy/notes/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
      setEditingId(null)
    },
    onError: () => toast.error('메모 수정에 실패했습니다'),
  })

  const deleteNote = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/strategy/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('메모 삭제에 실패했습니다'),
  })

  if (!stockCode) return null

  const startEdit = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title || '')
    setEditContent(note.content)
    setIsCreating(false)
  }

  const startCreate = () => {
    setIsCreating(true)
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleSave = () => {
    if (isCreating) {
      createNote.mutate({ stockCode, title: editTitle || undefined, content: editContent })
    } else if (editingId) {
      updateNote.mutate({ id: editingId, title: editTitle || undefined, content: editContent })
    }
  }

  const isEditing = isCreating || editingId !== null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          메모 ({notes.length})
        </h3>
        {!isEditing && (
          <Button size="sm" variant="ghost" onClick={startCreate}>+ 새 메모</Button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col p-4 sm:static sm:inset-auto sm:z-auto sm:bg-transparent sm:dark:bg-transparent sm:p-0">
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 space-y-2 flex-1 flex flex-col sm:flex-none">
            <input
              type="text"
              placeholder="제목 (선택)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm bg-transparent border-b border-zinc-200 dark:border-zinc-700 pb-1 outline-none placeholder:text-zinc-400"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="마크다운으로 메모를 작성하세요..."
              rows={4}
              className="w-full text-sm bg-transparent resize-none outline-none placeholder:text-zinc-400 flex-1 sm:flex-none"
            />
            <div className="flex gap-2 justify-end shrink-0">
              <Button size="sm" variant="ghost" onClick={() => { setIsCreating(false); setEditingId(null) }}>
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!editContent.trim() || createNote.isPending || updateNote.isPending}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 && !isEditing && (
        <p className="text-xs text-zinc-400 py-2">아직 메모가 없습니다</p>
      )}

      {notes.map((note) => (
        <div
          key={note.id}
          className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {note.title && (
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {note.title}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-0.5">
                {new Date(note.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="sm" variant="ghost" onClick={() => startEdit(note)}>편집</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(note.id)}>삭제</Button>
            </div>
          </div>
          <div className="mt-2 text-sm prose prose-sm dark:prose-invert max-w-none line-clamp-4">
            <MarkdownRenderer content={note.content} />
          </div>
        </div>
      ))}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onConfirm={() => { if (deleteTarget) deleteNote.mutate(deleteTarget) }}
        onCancel={() => setDeleteTarget(null)}
        title="메모 삭제"
        description="이 메모를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </div>
  )
}
