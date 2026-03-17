/**
 * Story 6.4: Session sidebar — 이전 대화 세션 목록
 *
 * 세션 목록 표시, 선택, 생성, 삭제 기능
 * 기존 API 활용: GET/POST/DELETE /api/workspace/chat/sessions
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

type Session = {
  id: string
  agentId: string
  title: string | null
  lastMessageAt: string | null
  createdAt: string
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export function SessionSidebar({
  secretaryId,
  activeSessionId,
  onSelectSession,
  isOpen,
  onClose,
}: {
  secretaryId: string
  activeSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
  isOpen: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  const sessions = (sessionsData?.data || []).filter(
    (s) => s.agentId === secretaryId,
  )

  const createSession = useMutation({
    mutationFn: () =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId: secretaryId }),
    onSuccess: (res) => {
      onSelectSession(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const deleteSession = useMutation({
    mutationFn: (sessionId: string) =>
      api.delete(`/workspace/chat/sessions/${sessionId}`),
    onSuccess: (_res, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      if (activeSessionId === deletedId) {
        onSelectSession(null)
      }
      setDeleteTarget(null)
    },
  })

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        data-testid="session-sidebar"
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-0
          w-64 bg-white border-r border-stone-200 flex flex-col
          transition-transform duration-200 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <h2 className="text-sm font-semibold text-stone-600">대화 기록</h2>
          <button
            data-testid="new-session-btn"
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
          >
            + 새 대화
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-stone-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-stone-400">
              대화 기록이 없습니다
            </div>
          )}

          {sessions.map((session) => (
            <div
              key={session.id}
              data-testid={`session-item-${session.id}`}
              className={`group flex items-center justify-between px-4 py-3 cursor-pointer border-b border-stone-200/50 transition-colors ${
                activeSessionId === session.id
                  ? 'bg-stone-200/50 border-l-2 border-l-blue-500'
                  : 'hover:bg-stone-100/50'
              }`}
              onClick={() => {
                onSelectSession(session.id)
                onClose()
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">
                  {session.title || '새 대화'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {formatRelativeTime(session.lastMessageAt || session.createdAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(session.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-400 transition-all shrink-0"
                aria-label="대화 삭제"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-stone-100 rounded-xl border border-stone-200 p-6 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-2">대화 삭제</h3>
            <p className="text-xs text-stone-500 mb-4">
              이 대화의 모든 메시지가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 text-xs rounded-lg bg-stone-200 text-stone-600 hover:bg-slate-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteSession.mutate(deleteTarget)}
                disabled={deleteSession.isPending}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
