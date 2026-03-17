import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth-store'
import { useWsStore } from '../../stores/ws-store'
import { toast } from '@corthex/ui'
import { ConversationsPanel } from './conversations-panel'
import { ConversationChat } from './conversation-chat'
import { NewConversationModal } from './new-conversation-modal'

type ConversationListItem = {
  id: string
  type: 'direct' | 'group'
  name: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastMessage: { content: string; senderId: string; createdAt: string } | null
  unreadCount: number
  participantCount: number
}

type ConversationDetail = {
  id: string
  type: 'direct' | 'group'
  name: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  participants: Array<{ userId: string; companyId: string; joinedAt: string; lastReadAt: string | null; userName?: string }>
}

type ApiResponse<T> = { success: boolean; data: T }

export function ConversationsView() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showChat, setShowChat] = useState(false)


  // 대화방 목록
  const { data: convListData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<ApiResponse<ConversationListItem[]>>('/workspace/conversations'),
    refetchInterval: 30000,
  })

  const conversations = convListData?.data ?? []

  // 선택된 대화방 상세
  const { data: convDetailData } = useQuery({
    queryKey: ['conversation-detail', selectedConvId],
    queryFn: () => api.get<ApiResponse<ConversationDetail>>(`/workspace/conversations/${selectedConvId}`),
    enabled: !!selectedConvId,
  })

  const conversationDetail = convDetailData?.data ?? null

  // 읽음 처리
  const markAsRead = useMutation({
    mutationFn: (convId: string) => api.post<ApiResponse<{ conversationId: string }>>(`/workspace/conversations/${convId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // 대화방 선택
  const handleSelectConversation = useCallback((convId: string) => {
    setSelectedConvId(convId)
    setShowChat(true)
    markAsRead.mutate(convId)
  }, [markAsRead])

  // WebSocket 구독 — 선택된 대화방
  useEffect(() => {
    if (!selectedConvId || !isConnected) return

    subscribe('conversation', { id: selectedConvId })

    const channelKey = `conversation::${selectedConvId}`

    const handler = (data: unknown) => {
      const event = data as { type: string; message?: unknown; messageId?: string; userId?: string }

      if (event.type === 'new-message') {
        // 메시지 캐시 업데이트
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConvId] })
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      } else if (event.type === 'message-deleted') {
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConvId] })
      } else if (event.type === 'participant-added' || event.type === 'participant-left') {
        queryClient.invalidateQueries({ queryKey: ['conversation-detail', selectedConvId] })
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConvId] })
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    }

    addListener(channelKey, handler)

    return () => {
      removeListener(channelKey, handler)
    }
  }, [selectedConvId, isConnected, subscribe, addListener, removeListener, queryClient])

  // 대화 생성 후 콜백
  const handleConversationCreated = useCallback((convId: string) => {
    setShowNewModal(false)
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    handleSelectConversation(convId)
  }, [queryClient, handleSelectConversation])

  // 나가기 후 콜백
  const handleLeaveConversation = useCallback(() => {
    setSelectedConvId(null)
    setShowChat(false)
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }, [queryClient])

  return (
    <div className="flex flex-1 min-h-0" data-testid="conversations-view">
      {/* 좌측: 대화 목록 */}
      <div className={`w-full md:w-72 border-r border-stone-200 flex flex-col ${showChat ? 'hidden md:flex' : ''}`}>
        <div className="p-2 border-b border-stone-200">
          <button
            onClick={() => setShowNewModal(true)}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg"
            data-testid="new-conversation-btn"
          >
            + 새 대화
          </button>
        </div>
        <ConversationsPanel
          conversations={conversations}
          selectedId={selectedConvId}
          currentUserId={user?.id ?? ''}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* 우측: 채팅 영역 */}
      <div className={`flex-1 flex flex-col min-w-0 ${showChat ? '' : 'hidden md:flex'}`}>
        {!selectedConvId ? (
          <div className="flex-1 flex items-center justify-center text-stone-500 text-sm">
            대화를 선택하세요
          </div>
        ) : (
          <ConversationChat
            conversationId={selectedConvId}
            conversationDetail={conversationDetail}
            currentUserId={user?.id ?? ''}
            onBack={() => setShowChat(false)}
            onLeave={handleLeaveConversation}
          />
        )}
      </div>

      {/* 새 대화 모달 */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  )
}
