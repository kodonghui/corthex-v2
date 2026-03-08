import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from '@corthex/ui'

type ConversationListItem = {
  id: string
  type: 'direct' | 'group'
  name: string | null
  lastMessage: { content: string; senderId: string; createdAt: string } | null
  participantCount: number
}

type ApiResponse<T> = { success: boolean; data: T }

type Props = {
  reportId: string
  reportTitle: string
  onClose: () => void
  onShared?: () => void
}

export function ShareToConversationModal({ reportId, reportTitle, onClose, onShared }: Props) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)

  const { data: convListData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<ApiResponse<ConversationListItem[]>>('/workspace/conversations'),
  })

  const conversations = convListData?.data ?? []

  const shareReport = useMutation({
    mutationFn: (convId: string) =>
      api.post<ApiResponse<unknown>>(`/workspace/conversations/${convId}/share-report`, { reportId }),
    onSuccess: () => {
      toast.success('보고서가 공유되었습니다')
      onShared?.()
      onClose()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '공유 실패')
    },
  })

  const handleShare = () => {
    if (!selectedConvId) return
    shareReport.mutate(selectedConvId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-96 max-h-[70vh] shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">메신저로 공유</h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{reportTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-0 max-h-80">
          {conversations.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-8">대화방이 없습니다</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 mb-0.5 ${
                selectedConvId === conv.id
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-lg">{conv.type === 'group' ? '👥' : '💬'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {conv.type === 'group' ? (conv.name || '그룹 대화') : (conv.name || '1:1 대화')}
                </p>
                <p className="text-[10px] text-zinc-400">{conv.participantCount}명</p>
              </div>
              {selectedConvId === conv.id && <span className="text-indigo-600 text-sm">✓</span>}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-md border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedConvId || shareReport.isPending}
            className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {shareReport.isPending ? '공유 중...' : '공유'}
          </button>
        </div>
      </div>
    </div>
  )
}
