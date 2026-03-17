import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, ConfirmDialog, toast } from '@corthex/ui'
import { MarkdownRenderer } from '../markdown-renderer'
import { useWsStore } from '../../stores/ws-store'
import { useAuthStore } from '../../stores/auth-store'

type Note = {
  id: string
  stockCode: string
  title: string | null
  content: string
  createdAt: string
  updatedAt: string
  isOwner: boolean
  owner?: { id: string; name: string | null }
}

type ShareTarget = {
  userId: string
  userName: string | null
  createdAt: string
}

type CompanyUser = {
  id: string
  name: string | null
  email: string
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
  const [shareTarget, setShareTarget] = useState<string | null>(null)

  const { subscribe, addListener, removeListener } = useWsStore()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: notesRes } = useQuery({
    queryKey: ['strategy-notes', stockCode],
    queryFn: () => api.get<{ data: Note[] }>(`/workspace/strategy/notes?stockCode=${encodeURIComponent(stockCode!)}`),
    enabled: !!stockCode,
  })
  const notes = notesRes?.data || []

  // WebSocket: 메모 업데이트 수신 시 쿼리 무효화
  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type?: string }
    if (msg?.type === 'note-updated' || msg?.type === 'note-deleted') {
      queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
    }
  }, [queryClient, stockCode])

  useEffect(() => {
    if (!notes.length) return
    const noteIds = notes.map((n) => n.id)
    // 구독 + 리스너 등록
    noteIds.forEach((id) => {
      subscribe('strategy-notes', { id })
      addListener(`strategy-notes::${id}`, handleWsMessage)
    })
    return () => {
      noteIds.forEach((id) => {
        removeListener(`strategy-notes::${id}`, handleWsMessage)
      })
    }
  }, [notes.map((n) => n.id).join(','), subscribe, addListener, removeListener, handleWsMessage])

  // 공유 대상 목록
  const { data: sharesRes } = useQuery({
    queryKey: ['strategy-note-shares', shareTarget],
    queryFn: () => api.get<{ data: ShareTarget[] }>(`/workspace/strategy/notes/${shareTarget}/shares`),
    enabled: !!shareTarget,
  })
  const currentShares = sharesRes?.data || []

  // 회사 사용자 목록
  const { data: usersRes } = useQuery({
    queryKey: ['company-users'],
    queryFn: () => api.get<{ data: CompanyUser[] }>('/workspace/users'),
    enabled: !!shareTarget,
  })
  const companyUsers = usersRes?.data || []

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

  const shareMutation = useMutation({
    mutationFn: ({ noteId, userIds }: { noteId: string; userIds: string[] }) =>
      api.post(`/workspace/strategy/notes/${noteId}/share`, { userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-note-shares', shareTarget] })
      toast.success('공유되었습니다')
    },
    onError: () => toast.error('공유에 실패했습니다'),
  })

  const unshareMutation = useMutation({
    mutationFn: ({ noteId, userId }: { noteId: string; userId: string }) =>
      api.delete(`/workspace/strategy/notes/${noteId}/share/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-note-shares', shareTarget] })
      queryClient.invalidateQueries({ queryKey: ['strategy-notes', stockCode] })
      toast.success('공유가 해제되었습니다')
    },
    onError: () => toast.error('공유 해제에 실패했습니다'),
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

  const sharedUserIds = new Set(currentShares.map((s) => s.userId))

  const toggleShare = (userId: string) => {
    if (!shareTarget) return
    if (sharedUserIds.has(userId)) {
      unshareMutation.mutate({ noteId: shareTarget, userId })
    } else {
      shareMutation.mutate({ noteId: shareTarget, userIds: [userId] })
    }
  }

  const isEditing = isCreating || editingId !== null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700">
          메모 ({notes.length})
        </h3>
        {!isEditing && !shareTarget && (
          <Button size="sm" variant="ghost" onClick={startCreate}>+ 새 메모</Button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-4 sm:static sm:inset-auto sm:z-auto sm:bg-transparent sm:sm:p-0">
          <div className="border border-zinc-200 rounded-lg p-3 space-y-2 flex-1 flex flex-col sm:flex-none">
            <input
              type="text"
              placeholder="제목 (선택)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-sm bg-transparent border-b border-zinc-200 pb-1 outline-none placeholder:text-zinc-400"
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

      {/* 공유 관리 패널 */}
      {shareTarget && (
        <div className="border border-zinc-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">공유 대상 관리</span>
            <button
              onClick={() => setShareTarget(null)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              닫기
            </button>
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {companyUsers.length === 0 && (
              <p className="text-xs text-zinc-400">사용자 목록을 불러오는 중...</p>
            )}
            {companyUsers.filter((u) => u.id !== currentUserId).map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-50 cursor-pointer text-sm min-h-[32px]"
              >
                <input
                  type="checkbox"
                  checked={sharedUserIds.has(user.id)}
                  onChange={() => toggleShare(user.id)}
                  disabled={shareMutation.isPending || unshareMutation.isPending}
                  className="rounded border-zinc-300"
                />
                <span className="text-zinc-700">{user.name || user.email}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 && !isEditing && !shareTarget && (
        <p className="text-xs text-zinc-400 py-2">아직 메모가 없습니다</p>
      )}

      {notes.map((note) => (
        <div
          key={note.id}
          className="border border-zinc-200 rounded-lg p-3 group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {note.title && (
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {note.title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-zinc-400">
                  {new Date(note.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {!note.isOwner && note.owner && (
                  <span className="text-xs text-blue-500">
                    {note.owner.name || '알 수 없음'} 공유
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="sm" variant="ghost" onClick={() => startEdit(note)}>편집</Button>
              {note.isOwner && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setShareTarget(note.id)}>공유</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(note.id)}>삭제</Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 text-sm prose prose-sm max-w-none line-clamp-4">
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
