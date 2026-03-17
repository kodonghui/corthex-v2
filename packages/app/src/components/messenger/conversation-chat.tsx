import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useWsStore } from '../../stores/ws-store'
import { toast } from '@corthex/ui'

type MessageItem = {
  id: string
  conversationId: string
  senderId: string
  companyId: string
  content: string
  type: 'text' | 'system' | 'ai_report'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type MessagesResponse = {
  items: MessageItem[]
  nextCursor: string | null
  hasMore: boolean
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

// ai_report content JSON 파싱 헬퍼
export function parseAiReportContent(content: string): { reportId: string | null; title: string; summary: string } {
  try {
    const parsed = JSON.parse(content)
    return {
      reportId: parsed.reportId || null,
      title: parsed.title || '보고서',
      summary: parsed.summary || '',
    }
  } catch {
    return { reportId: null, title: '보고서', summary: content.slice(0, 200) }
  }
}

type Props = {
  conversationId: string
  conversationDetail: ConversationDetail | null
  currentUserId: string
  onBack: () => void
  onLeave: () => void
}

export function ConversationChat({ conversationId, conversationDetail, currentUserId, onBack, onLeave }: Props) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { addListener, removeListener } = useWsStore()
  const [inputText, setInputText] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSentRef = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 메시지 목록 (infinite query)
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '50' })
      if (pageParam) params.set('cursor', pageParam)
      const res = await api.get<ApiResponse<MessagesResponse>>(`/workspace/conversations/${conversationId}/messages?${params}`)
      return res.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

  // 모든 메시지를 역순으로 합치기 (서버는 DESC, UI는 ASC 필요)
  const allMessages = (messagesData?.pages ?? []).flatMap((page) => page.items).reverse()

  // 메시지 전송
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post<ApiResponse<MessageItem>>(`/workspace/conversations/${conversationId}/messages`, { content, type: 'text' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('메시지 전송 실패'),
  })

  // 메시지 삭제
  const deleteMessage = useMutation({
    mutationFn: (msgId: string) =>
      api.delete<ApiResponse<{ id: string }>>(`/workspace/conversations/${conversationId}/messages/${msgId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] })
    },
    onError: () => toast.error('메시지 삭제 실패'),
  })

  // 나가기
  const leaveConversation = useMutation({
    mutationFn: () =>
      api.delete<ApiResponse<{ userId: string }>>(`/workspace/conversations/${conversationId}/participants/me`),
    onSuccess: () => {
      toast.success('대화방에서 나왔습니다')
      onLeave()
    },
    onError: () => toast.error('나가기 실패'),
  })

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // 타이핑 이벤트 수신
  useEffect(() => {
    const channelKey = `conversation::${conversationId}`

    const handler = (data: unknown) => {
      const event = data as { type: string; userId?: string }
      if (event.type === 'typing' && event.userId && event.userId !== currentUserId) {
        setTypingUsers((prev) => new Set(prev).add(event.userId!))

        // 3초 후 자동 해제
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev)
            next.delete(event.userId!)
            return next
          })
        }, 3000)
      }
    }

    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [conversationId, currentUserId, addListener, removeListener])

  // 전송 핸들러
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text) return
    sendMessage.mutate(text)
    setInputText('')
    inputRef.current?.focus()
  }, [inputText, sendMessage])

  // 타이핑 이벤트 전송 (debounce 2초)
  const sendTypingEvent = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingSentRef.current < 2000) return
    lastTypingSentRef.current = now
    api.post(`/workspace/conversations/${conversationId}/typing`, {}).catch(() => {})
  }, [conversationId])

  // 입력 변경
  const handleInputChange = useCallback((value: string) => {
    setInputText(value)
    if (value.trim()) sendTypingEvent()
  }, [sendTypingEvent])

  // 위로 스크롤 시 이전 메시지 로드
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (el.scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // 대화방 이름
  const displayName = conversationDetail?.type === 'group'
    ? (conversationDetail.name || '그룹 대화')
    : (conversationDetail?.name || '1:1 대화')

  const participantCount = conversationDetail?.participants.length ?? 0

  return (
    <div className="flex-1 flex flex-col min-h-0" data-testid="conversation-chat">
      {/* 헤더 */}
      <div className="px-4 py-2.5 border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-stone-200 text-sm text-stone-500 shrink-0"
          >
            ←
          </button>
          <span className="font-medium text-sm text-slate-100 truncate">{displayName}</span>
          <span className="text-xs text-stone-400 shrink-0">{participantCount}명</span>
        </div>
        {conversationDetail?.type === 'group' && (
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10"
          >
            나가기
          </button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        data-testid="conversation-messages"
      >
        {isFetchingNextPage && (
          <div className="text-center py-2">
            <span className="text-xs text-stone-500">이전 메시지 로딩...</span>
          </div>
        )}
        {hasNextPage && !isFetchingNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="w-full text-center py-1 text-xs text-blue-400 hover:underline"
          >
            이전 메시지 더 보기
          </button>
        )}

        {allMessages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="bg-stone-100 text-stone-400 text-xs px-3 py-1 rounded-full inline">
                  {msg.content}
                </span>
              </div>
            )
          }

          const isMine = msg.senderId === currentUserId

          // ai_report 카드 렌더링
          if (msg.type === 'ai_report') {
            const reportData = parseAiReportContent(msg.content)
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] border border-blue-500/30 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => reportData.reportId && navigate(`/reports/${reportData.reportId}`)}
                  data-testid={`ai-report-card-${msg.id}`}
                >
                  <div className="bg-blue-600/10 px-3 py-2 border-b border-blue-500/20">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">📄</span>
                      <span className="text-xs font-medium text-blue-400">AI 보고서</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-white">
                    <p className="text-sm font-medium text-slate-100 truncate">{reportData.title}</p>
                    {reportData.summary && (
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">{reportData.summary}</p>
                    )}
                    <p className="text-[10px] text-blue-400 mt-1.5">전체 보기 →</p>
                  </div>
                  <div className={`px-3 py-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              <div className={`relative max-w-[75%] group`}>
                <div
                  className={`px-3 py-2 rounded-lg text-sm ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-stone-100 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-stone-400">
                    {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 삭제 버튼 (본인 메시지만) */}
                {isMine && hoveredMsgId === msg.id && (
                  <button
                    onClick={() => {
                      if (confirm('이 메시지를 삭제하시겠습니까?')) {
                        deleteMessage.mutate(msg.id)
                      }
                    }}
                    className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="삭제"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 타이핑 표시 */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-1 text-xs text-stone-400">
          입력 중...
        </div>
      )}

      {/* 입력 영역 */}
      <div className="px-4 py-3 border-t border-stone-200 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm resize-none max-h-32 overflow-y-auto"
            data-testid="conversation-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sendMessage.isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 shrink-0"
            data-testid="conversation-send-btn"
          >
            전송
          </button>
        </div>
      </div>

      {/* 나가기 확인 모달 */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 w-80 shadow-2xl">
            <h3 className="font-medium text-sm text-slate-50 mb-3">대화방 나가기</h3>
            <p className="text-xs text-stone-500 mb-4">이 그룹 대화방에서 나가시겠습니까?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 hover:bg-stone-200"
              >
                취소
              </button>
              <button
                onClick={() => {
                  leaveConversation.mutate()
                  setShowLeaveConfirm(false)
                }}
                disabled={leaveConversation.isPending}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
