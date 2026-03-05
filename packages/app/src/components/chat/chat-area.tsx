import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@corthex/ui'
import { api } from '../../lib/api'
import { useWsStore } from '../../stores/ws-store'
import { useChatStream } from '../../hooks/use-chat-stream'
import { ToolCallCard } from './tool-call-card'
import type { Agent, Message, Delegation, SavedToolCall } from './types'
import type { ToolCall } from '../../hooks/use-chat-stream'

const statusColors: Record<string, string> = {
  online: 'bg-green-400',
  working: 'bg-yellow-400 animate-pulse',
  error: 'bg-red-400',
  offline: 'bg-zinc-400',
}

export function ChatArea({
  agent,
  sessionId,
  onBack,
}: {
  agent: Agent | null
  sessionId: string | null
  onBack?: () => void
}) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [showDelegations, setShowDelegations] = useState(false)
  const [reconnectBanner, setReconnectBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevConnected = useRef(true)
  const prevScrollHeightRef = useRef(0)
  const { isConnected } = useWsStore()
  const { streamingText, isStreaming, toolCalls, error, startStream, stopStream, clearError } = useChatStream(sessionId)

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', sessionId],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.get<{ data: Message[]; hasMore: boolean }>(
        `/workspace/chat/sessions/${sessionId}/messages${pageParam ? `?before=${pageParam}` : ''}`,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.data[0]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!sessionId,
  })

  const { data: delegationsData } = useQuery({
    queryKey: ['delegations', sessionId],
    queryFn: () =>
      api.get<{ data: Delegation[] }>(`/workspace/chat/sessions/${sessionId}/delegations`),
    enabled: !!sessionId && !!agent?.isSecretary,
  })

  const { data: toolCallsData } = useQuery({
    queryKey: ['tool-calls', sessionId],
    queryFn: () =>
      api.get<{ data: SavedToolCall[] }>(`/workspace/chat/sessions/${sessionId}/tool-calls`),
    enabled: !!sessionId,
  })

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post<{ data: { userMessage: Message } }>(
        `/workspace/chat/sessions/${sessionId}/messages`,
        { content },
      ),
    onSuccess: () => {
      startStream()
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId] })
    },
  })

  const handleSend = () => {
    if (!input.trim() || !sessionId || sendMessage.isPending || isStreaming) return
    sendMessage.mutate(input.trim())
    setInput('')
  }

  const handleRetry = () => {
    clearError()
    // 마지막 유저 메시지 재전송
    const lastUserMsg = messages.filter((m) => m.sender === 'user').pop()
    if (lastUserMsg) {
      sendMessage.mutate(lastUserMsg.content)
    }
  }

  // 자동 스크롤 (새 메시지/스트리밍 시 하단으로)
  useEffect(() => {
    if (!isFetchingNextPage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesData, streamingText, isStreaming, isFetchingNextPage])

  // 이전 메시지 로드 시 스크롤 위치 유지
  useEffect(() => {
    if (!isFetchingNextPage && prevScrollHeightRef.current > 0) {
      const el = scrollContainerRef.current
      if (el) {
        const newScrollHeight = el.scrollHeight
        el.scrollTop = newScrollHeight - prevScrollHeightRef.current
      }
      prevScrollHeightRef.current = 0
    }
  }, [isFetchingNextPage])

  // 위로 스크롤 시 이전 메시지 로드
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < Math.max(100, el.clientHeight * 0.15)) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // 연결 상태 배너 + 재연결 시 누락 메시지 보충
  useEffect(() => {
    if (!prevConnected.current && isConnected) {
      setReconnectBanner(true)
      const timer = setTimeout(() => setReconnectBanner(false), 2000)
      // 재연결 시 활성 세션 데이터 새로고침
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['messages', sessionId] })
        queryClient.invalidateQueries({ queryKey: ['tool-calls', sessionId] })
      }
      prevConnected.current = isConnected
      return () => clearTimeout(timer)
    }
    prevConnected.current = isConnected
  }, [isConnected, sessionId, queryClient])

  const messages = useMemo(
    () => messagesData?.pages.flatMap((p) => p.data) || [],
    [messagesData],
  )
  const delegationList = delegationsData?.data || []
  const savedToolCalls = toolCallsData?.data || []

  // 에이전트 메시지별 도구 호출 매칭: 미리 계산된 맵 (O(n+m) 한 번)
  const toolCallsByMessage = useMemo(() => {
    const map = new Map<string, ToolCall[]>()
    if (savedToolCalls.length === 0 || messages.length === 0) return map

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (msg.sender !== 'agent') continue

      const msgTime = new Date(msg.createdAt).getTime()
      let prevTime = 0
      for (let j = i - 1; j >= 0; j--) {
        if (messages[j].sender === 'user') {
          prevTime = new Date(messages[j].createdAt).getTime()
          break
        }
      }

      const matched = savedToolCalls
        .filter((tc) => {
          const tcTime = new Date(tc.createdAt).getTime()
          return tcTime >= prevTime && tcTime <= msgTime
        })
        .map((tc) => ({
          toolId: tc.id,
          toolName: tc.toolName,
          status: 'done' as const,
          input: tc.input ? JSON.stringify(tc.input).slice(0, 200) : undefined,
          result: tc.output || undefined,
          durationMs: tc.durationMs != null ? tc.durationMs : undefined,
          error: (tc.status === 'error' || tc.status === 'timeout') ? true : undefined,
        }))

      if (matched.length > 0) map.set(msg.id, matched)
    }
    return map
  }, [messages, savedToolCalls])

  // EmptyState
  if (!agent || !sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-lg mb-1">에이전트와 첫 대화를 시작해보세요!</p>
          <p className="text-sm mb-4">좌측에서 &apos;새 대화&apos; 버튼을 눌러 에이전트를 선택하세요</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              새 대화 시작
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 연결 상태 배너 */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-300 text-center">
          ⚠️ 연결이 끊겼습니다. 재연결 중...
        </div>
      )}
      {reconnectBanner && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300 text-center">
          ⚡ 연결 복구됨
        </div>
      )}

      {/* 헤더 */}
      <div className="px-4 md:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 -ml-2 p-2 rounded-lg active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              ← 대화 목록
            </button>
          )}
          <span className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]}`} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{agent.name}</h3>
              {agent.isSecretary && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                  비서 오케스트레이터
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{agent.role}</p>
          </div>
        </div>
        {agent.isSecretary && delegationList.length > 0 && (
          <button
            onClick={() => setShowDelegations(!showDelegations)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showDelegations ? '채팅 보기' : `위임 내역 (${delegationList.length})`}
          </button>
        )}
      </div>

      {/* 위임 내역 패널 */}
      {showDelegations ? (
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3">
          <h4 className="text-sm font-medium text-zinc-500 mb-2">부서 위임 내역</h4>
          {delegationList.map((del) => (
            <div
              key={del.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{del.targetAgentName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    del.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : del.status === 'failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {del.status === 'completed' ? '완료' : del.status === 'failed' ? '실패' : '처리중'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">지시: {del.delegationPrompt}</p>
              {del.agentResponse && (
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-md p-3 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {del.agentResponse}
                </div>
              )}
              <p className="text-[10px] text-zinc-400 mt-2">
                {new Date(del.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {del.completedAt &&
                  ` → ${new Date(del.completedAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 메시지 목록 */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 [-webkit-overflow-scrolling:touch]"
          >
            {/* 이전 메시지 로딩 스피너 */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center py-1">
                <button
                  onClick={() => {
                    const el = scrollContainerRef.current
                    if (el) prevScrollHeightRef.current = el.scrollHeight
                    fetchNextPage()
                  }}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  이전 메시지 더 보기
                </button>
              </div>
            )}
            {messages.length === 0 && !isStreaming && (
              <div className="text-center text-zinc-400 text-sm mt-8">
                {agent.isSecretary ? (
                  <>
                    <p className="mb-1">{agent.name}에게 업무를 지시하세요</p>
                    <p className="text-xs">비서가 적절한 부서에 자동으로 위임합니다</p>
                  </>
                ) : (
                  <p>{agent.name}에게 메시지를 보내보세요</p>
                )}
              </div>
            )}

            {messages.map((msg) => {
              // 에이전트 메시지의 도구 호출 카드 (API 기반)
              const msgToolCalls = toolCallsByMessage.get(msg.id) || []
              // fallback: 구버전 메시지의 텍스트 기반 도구 요약
              const toolSplit = msg.content.split('\n\n---\n🔧 **도구 호출 내역:**\n')
              const mainContent = toolSplit[0]
              const toolContent = msgToolCalls.length === 0 ? (toolSplit[1] || null) : null

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.sender === 'agent' && (
                      <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 mb-1">
                        {agent.name}
                      </p>
                    )}
                    {msgToolCalls.length > 0 && msgToolCalls.map((tc) => (
                      <ToolCallCard key={tc.toolId} tool={tc} />
                    ))}
                    <p className="whitespace-pre-wrap">{mainContent}</p>
                    {toolContent && (
                      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 mb-1">
                          🔧 도구 호출
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
                          {toolContent}
                        </p>
                      </div>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-zinc-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* 스트리밍 메시지 */}
            {isStreaming && (streamingText || toolCalls.length > 0) && (
              <div className="flex justify-start">
                <div className="max-w-[80%] md:max-w-[70%] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed">
                  <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 mb-1">
                    {agent.name}
                  </p>
                  {toolCalls.map((tool) => (
                    <ToolCallCard key={tool.toolId} tool={tool} />
                  ))}
                  {streamingText && (
                    <p className="whitespace-pre-wrap">
                      {streamingText}
                      <span className="animate-pulse text-indigo-400">▌</span>
                    </p>
                  )}
                  {!streamingText && toolCalls.length > 0 && toolCalls.every(t => t.status === 'done') && (
                    <div className="flex gap-1 mt-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 스트리밍 시작 대기 (아직 토큰 없음) */}
            {isStreaming && !streamingText && toolCalls.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    {agent.isSecretary && (
                      <span className="text-xs text-zinc-400">부서 위임 중...</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 에러 표시 */}
            {error && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ {error}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="px-4 md:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-3">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  agent.isSecretary
                    ? `${agent.name}에게 업무 지시...`
                    : `${agent.name}에게 메시지...`
                }
                disabled={sendMessage.isPending || isStreaming}
                className="flex-1 px-4 py-2.5 rounded-xl"
              />
              {isStreaming ? (
                <button
                  onClick={stopStream}
                  className="px-5 py-3 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  ■ 중지
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    input.trim() && !sendMessage.isPending
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  전송
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
