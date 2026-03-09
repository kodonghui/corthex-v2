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

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '방금'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
  if (diff < 86400000) return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('ko-KR', { weekday: 'short' })
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function getConversationDisplayName(conv: ConversationListItem, currentUserId: string): string {
  if (conv.type === 'group') return conv.name || '그룹 대화'
  return conv.name || '1:1 대화'
}

function getConversationAvatar(conv: ConversationListItem): string {
  return conv.type === 'group' ? '👥' : '💬'
}

type Props = {
  conversations: ConversationListItem[]
  selectedId: string | null
  currentUserId: string
  onSelect: (id: string) => void
}

export function ConversationsPanel({ conversations, selectedId, currentUserId, onSelect }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4" data-testid="conversations-empty">
        <p className="text-xs text-slate-400 text-center">대화가 없습니다.<br />새 대화를 시작해보세요.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" data-testid="conversations-list">
      {conversations.map((conv) => {
        const displayName = getConversationDisplayName(conv, currentUserId)
        const avatar = getConversationAvatar(conv)

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            data-testid={`conversation-item-${conv.id}`}
            className={`w-full text-left px-3 py-2.5 text-sm border-b border-slate-800 transition-colors ${
              selectedId === conv.id
                ? 'bg-blue-600/10 text-blue-400'
                : 'hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg shrink-0">{avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-medium truncate ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 ml-1 shrink-0">
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                    {conv.lastMessage && (
                      <span className="text-[10px] text-slate-500">{formatTime(conv.lastMessage.createdAt)}</span>
                    )}
                  </div>
                </div>
                {conv.lastMessage ? (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage.content}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">메시지 없음</p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// 순수 로직 export (테스트용)
export { getConversationDisplayName, getConversationAvatar, formatTime }
