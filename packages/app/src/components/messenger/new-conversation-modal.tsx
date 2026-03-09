import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from '@corthex/ui'

type CompanyUser = {
  id: string
  name: string
  role: string
}

type ApiResponse<T> = { success: boolean; data: T }
type ApiDataResponse<T> = { data: T }

type Props = {
  onClose: () => void
  onCreated: (conversationId: string) => void
}

export function NewConversationModal({ onClose, onCreated }: Props) {
  const [mode, setMode] = useState<'direct' | 'group'>('direct')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 회사 내 사용자 목록
  const { data: usersData } = useQuery({
    queryKey: ['messenger-users'],
    queryFn: () => api.get<ApiDataResponse<CompanyUser[]>>('/workspace/messenger/users'),
  })

  const users = usersData?.data ?? []

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const q = searchQuery.toLowerCase()
    return users.filter((u) => u.name.toLowerCase().includes(q))
  }, [users, searchQuery])

  // 대화 생성
  const createConversation = useMutation({
    mutationFn: (body: { type: 'direct' | 'group'; participantIds: string[]; name?: string }) =>
      api.post<ApiResponse<{ id: string }>>('/workspace/conversations', body),
    onSuccess: (res) => {
      onCreated(res.data.id)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '대화 생성 실패')
    },
  })

  const toggleUser = (userId: string) => {
    if (mode === 'direct') {
      setSelectedUsers([userId])
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      )
    }
  }

  const handleCreate = () => {
    if (selectedUsers.length === 0) return

    if (mode === 'direct') {
      createConversation.mutate({
        type: 'direct',
        participantIds: selectedUsers,
      })
    } else {
      if (selectedUsers.length < 1) return
      createConversation.mutate({
        type: 'group',
        participantIds: selectedUsers,
        name: groupName.trim() || undefined,
      })
    }
  }

  const canCreate = mode === 'direct' ? selectedUsers.length === 1 : selectedUsers.length >= 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} data-testid="new-conversation-modal">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-96 max-h-[80vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-medium text-sm text-slate-50">새 대화</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
        </div>

        {/* 모드 선택 */}
        <div className="px-4 pt-3 flex gap-2">
          <button
            onClick={() => { setMode('direct'); setSelectedUsers([]) }}
            className={`px-3 py-1 text-xs rounded-full border ${
              mode === 'direct'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-600 hover:bg-slate-700'
            }`}
          >
            1:1 대화
          </button>
          <button
            onClick={() => { setMode('group'); setSelectedUsers([]) }}
            className={`px-3 py-1 text-xs rounded-full border ${
              mode === 'group'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-600 hover:bg-slate-700'
            }`}
          >
            그룹 대화
          </button>
        </div>

        {/* 그룹명 (그룹 모드) */}
        {mode === 'group' && (
          <div className="px-4 pt-2">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름 (선택)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg text-sm"
            />
          </div>
        )}

        {/* 선택된 사용자 */}
        {selectedUsers.length > 0 && (
          <div className="px-4 pt-2 flex flex-wrap gap-1">
            {selectedUsers.map((uid) => {
              const u = users.find((u) => u.id === uid)
              return (
                <span
                  key={uid}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/10 text-blue-400 text-xs rounded-full"
                >
                  {u?.name || '...'}
                  <button onClick={() => toggleUser(uid)} className="text-blue-400 hover:text-blue-300">✕</button>
                </span>
              )
            })}
          </div>
        )}

        {/* 검색 */}
        <div className="px-4 pt-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름으로 검색..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg text-sm"
            autoFocus
          />
        </div>

        {/* 사용자 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 min-h-0 max-h-60">
          {filteredUsers.map((u) => {
            const isSelected = selectedUsers.includes(u.id)
            return (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'hover:bg-slate-700'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
                  {u.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-slate-100">{u.name}</p>
                  <p className="text-[10px] text-slate-500">{u.role}</p>
                </div>
                {isSelected && <span className="text-blue-400 text-sm">✓</span>}
              </button>
            )
          })}
          {filteredUsers.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">사용자를 찾을 수 없습니다</p>
          )}
        </div>

        {/* 하단 */}
        <div className="px-4 py-3 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 hover:bg-slate-700"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || createConversation.isPending}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {createConversation.isPending ? '생성 중...' : '대화 시작'}
          </button>
        </div>
      </div>
    </div>
  )
}
