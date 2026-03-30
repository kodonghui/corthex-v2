import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

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
      const msg = err instanceof Error ? err.message : '공유 실패'
      if (msg.includes('참여자')) {
        toast.error('대화방 참여자가 아닙니다. 목록을 새로고침합니다.')
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      } else {
        toast.error(msg)
      }
    },
  })

  const handleShare = () => {
    if (!selectedConvId) return
    shareReport.mutate(selectedConvId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} data-testid="share-conversation-modal">
      <div className="bg-corthex-surface border border-corthex-border rounded-2xl w-96 max-h-[70vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-corthex-border flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm text-corthex-text-secondary">메신저로 공유</h3>
            <p className="text-xs text-corthex-text-disabled mt-0.5 truncate">{reportTitle}</p>
          </div>
          <button onClick={onClose} className="text-corthex-text-disabled hover:text-corthex-text-secondary text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-0 max-h-80">
          {conversations.length === 0 && (
            <p className="text-xs text-corthex-text-disabled text-center py-8">대화방이 없습니다</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-0.5 ${
                selectedConvId === conv.id
                  ? 'bg-corthex-accent/10 text-corthex-accent'
                  : 'hover:bg-corthex-elevated'
              }`}
            >
              <span className="text-lg">{conv.type === 'group' ? '👥' : '💬'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-corthex-text-primary">
                  {conv.type === 'group' ? (conv.name || '그룹 대화') : (conv.name || '1:1 대화')}
                </p>
                <p className="text-[10px] text-corthex-text-disabled">{conv.participantCount}명</p>
              </div>
              {selectedConvId === conv.id && <span className="text-corthex-accent text-sm">✓</span>}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-corthex-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-corthex-border hover:bg-corthex-elevated"
          >
            취소
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedConvId || shareReport.isPending}
            className="px-3 py-1.5 text-xs rounded-lg bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-50"
          >
            {shareReport.isPending ? '공유 중...' : '공유'}
          </button>
        </div>
      </div>
    </div>
  )
}
