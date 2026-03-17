import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from '@corthex/ui'
import { api } from '../../lib/api'
import { useWsStore } from '../../stores/ws-store'
import { useChatStream } from '../../hooks/use-chat-stream'
import { ToolCallCard } from './tool-call-card'
import { DebateResultCard } from '../agora/debate-result-card'
import { Bot, Paperclip, Send, MoreHorizontal, ArrowLeft, Square, Loader2 } from 'lucide-react'
import type { Agent, Message, Delegation, SavedToolCall, FileAttachment } from './types'
import type { ToolCall } from '../../hooks/use-chat-stream'
import type { Debate, DebateResult, DebateWsEvent, CreateDebateRequest } from '@corthex/shared'

/** Detect debate slash commands: /토론 [topic] or /심층토론 [topic] */
function parseDebateCommand(text: string): { debateType: 'debate' | 'deep-debate'; topic: string } | null {
  const trimmed = text.trim()
  if (trimmed.startsWith('/심층토론 ') || trimmed.startsWith('/심층토론\n')) {
    return { debateType: 'deep-debate', topic: trimmed.replace(/^\/심층토론\s*/, '').trim() }
  }
  if (trimmed.startsWith('/토론 ') || trimmed.startsWith('/토론\n')) {
    return { debateType: 'debate', topic: trimmed.replace(/^\/토론\s*/, '').trim() }
  }
  return null
}

type DebateResultEntry = {
  debateId: string
  topic: string
  result: DebateResult
  insertedAt: string
}

/** 텍스트 내 마크다운 링크 [text](url)를 클릭 가능한 요소로 변환 */
function renderTextWithLinks(
  text: string,
  onNavigate: (path: string) => void,
): React.ReactNode {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const linkText = match[1]
    const href = match[2]
    parts.push(
      href.startsWith('/') ? (
        <button
          key={key++}
          onClick={() => onNavigate(href)}
          className="text-[#5a7247] underline hover:text-[#869e71]"
        >
          {linkText}
        </button>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-[#5a7247] underline hover:text-[#869e71]">
          {linkText}
        </a>
      ),
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

const statusColors: Record<string, string> = {
  online: 'bg-emerald-500',
  working: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-slate-600',
}

const statusLabels: Record<string, string> = {
  online: '온라인',
  working: '작업중',
  error: '오류',
  offline: '오프라인',
}

export function ChatArea({
  agent,
  sessionId,
  onBack,
  canvasContext,
}: {
  agent: Agent | null
  sessionId: string | null
  onBack?: () => void
  canvasContext?: string
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [showDelegations, setShowDelegations] = useState(false)
  const [reconnectBanner, setReconnectBanner] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevConnected = useRef(true)
  const prevScrollHeightRef = useRef(0)
  const { isConnected } = useWsStore()
  const { streamingText, isStreaming, toolCalls, error, delegationStatus, delegationStatuses, delegationChain, startStream, stopStream, clearError } = useChatStream(sessionId)
  const [isCancelling, setIsCancelling] = useState(false)
  const [chainExpanded, setChainExpanded] = useState(false)
  const [debateResults, setDebateResults] = useState<DebateResultEntry[]>([])
  const [debateNotice, setDebateNotice] = useState<string | null>(null)

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
    mutationFn: (payload: { content: string; attachmentIds?: string[] }) =>
      api.post<{ data: { userMessage: Message } }>(
        `/workspace/chat/sessions/${sessionId}/messages`,
        payload,
      ),
    onSuccess: () => {
      startStream()
      setPendingAttachments([])
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId] })
    },
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // reset input
    if (pendingAttachments.length >= 5) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.upload<{ data: FileAttachment }>('/workspace/files', formData)
      setPendingAttachments(prev => [...prev, res.data])
    } catch (err) {
      console.error('[파일 업로드 실패]', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sendMessage.isPending || isStreaming) return

    // Check for debate commands
    const debateCmd = parseDebateCommand(input.trim())
    if (debateCmd && debateCmd.topic) {
      setInput('')
      setDebateNotice(`토론이 시작됩니다. AGORA로 이동합니다...`)
      try {
        // Create debate with available agents
        const agentsRes = await api.get<{ data: { id: string }[] }>('/workspace/agents')
        const agentIds = agentsRes.data.slice(0, 5).map((a) => a.id)
        if (agentIds.length < 2) {
          toast.error('토론에 참여할 에이전트가 부족합니다 (최소 2명)')
          setDebateNotice(null)
          return
        }
        const createRes = await api.post<{ data: Debate }>('/workspace/debates', {
          topic: debateCmd.topic,
          debateType: debateCmd.debateType,
          participantAgentIds: agentIds,
        } satisfies CreateDebateRequest)
        const debateId = createRes.data.id
        await api.post(`/workspace/debates/${debateId}/start`, {})
        // Navigate to AGORA
        setTimeout(() => {
          setDebateNotice(null)
          navigate('/agora', { state: { debateId, fromChat: true } })
        }, 1000)
      } catch {
        toast.error('토론 시작에 실패했습니다')
        setDebateNotice(null)
      }
      return
    }

    const content = canvasContext
      ? `${canvasContext}\n\n---\n${input.trim()}`
      : input.trim()
    const payload: { content: string; attachmentIds?: string[] } = { content }
    if (pendingAttachments.length > 0) {
      payload.attachmentIds = pendingAttachments.map(f => f.id)
    }
    sendMessage.mutate(payload)
    setInput('')
  }

  // FR66: Cancel active agent task via API
  const handleCancel = useCallback(async () => {
    if (!sessionId || isCancelling) return
    setIsCancelling(true)
    try {
      await api.post(`/workspace/chat/sessions/${sessionId}/cancel`, {})
      toast.info('작업이 중단되었습니다')
    } catch {
      toast.warning('서버 중단 실패, 로컬 스트림만 중지됨')
      stopStream()
    } finally {
      setIsCancelling(false)
    }
  }, [sessionId, isCancelling, stopStream])

  const handleRetry = () => {
    clearError()
    // 마지막 유저 메시지 재전송
    const lastUserMsg = messages.filter((m) => m.sender === 'user').pop()
    if (lastUserMsg) {
      sendMessage.mutate({
        content: lastUserMsg.content,
        attachmentIds: lastUserMsg.attachmentIds?.length ? lastUserMsg.attachmentIds : undefined,
      })
    }
  }

  // 체인 해제 시 펼침 상태 초기화
  useEffect(() => {
    if (!delegationChain) setChainExpanded(false)
  }, [delegationChain])

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

  // Listen for debate-completed events on the global debate channel
  useEffect(() => {
    if (!isConnected) return
    const channelKey = 'debate::global'
    const handler = (data: unknown) => {
      const event = data as DebateWsEvent
      if (event.event === 'debate-completed') {
        // Fetch debate details to get topic
        api.get<{ data: Debate }>(`/workspace/debates/${event.debateId}`).then((res) => {
          const debate = res.data
          if (debate.result) {
            setDebateResults((prev) => [
              ...prev,
              {
                debateId: debate.id,
                topic: debate.topic,
                result: debate.result!,
                insertedAt: new Date().toISOString(),
              },
            ])
          }
        }).catch(() => {
          // Ignore fetch errors
        })
      }
    }
    const { addListener, removeListener } = useWsStore.getState()
    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [isConnected])

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
      <div data-testid="chat-empty" className="flex-1 flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="bg-[#5a7247]/20 flex items-center justify-center rounded-full w-16 h-16 mb-4 border border-[#5a7247]/30">
          <Bot className="w-8 h-8 text-[#5a7247]" />
        </div>
        <p className="text-sm font-medium text-stone-500">에이전트와 대화를 시작하세요</p>
        <p className="text-xs text-stone-400 mt-1">무엇이든 질문해보세요</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 text-sm bg-[#5a7247] text-slate-950 rounded-lg font-medium hover:bg-[#869e71] transition-colors"
          >
            새 대화 시작
          </button>
        )}
      </div>
    )
  }

  return (
    <div data-testid="chat-area" className="flex-1 flex flex-col min-w-0">
      {/* 연결 상태 배너 */}
      {!isConnected && (
        <div data-testid="connection-banner" className="flex items-center gap-2 px-6 py-2 bg-amber-950/50 border-b border-amber-900/50 text-amber-300 text-xs">
          연결이 끊어졌습니다. 재연결 중...
        </div>
      )}
      {reconnectBanner && (
        <div data-testid="connection-banner" className="flex items-center gap-2 px-6 py-2 bg-emerald-950/50 border-b border-emerald-900/50 text-emerald-300 text-xs">
          다시 연결되었습니다
        </div>
      )}

      {/* 헤더 -- Stitch style */}
      <header data-testid="chat-header" className="flex items-center justify-between whitespace-nowrap border-b border-solid border-stone-200 px-6 py-4 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              data-testid="mobile-back-btn"
              onClick={onBack}
              className="md:hidden flex items-center justify-center rounded-xl size-10 text-stone-500 hover:text-slate-200 hover:bg-stone-100 transition-colors mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            {/* Status Dot */}
            <div className={`size-2.5 rounded-full ${statusColors[agent.status]} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
            <h2 className="text-white text-lg font-semibold leading-tight tracking-tight">{agent.name}</h2>
            {agent.isSecretary && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                비서
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-2">
          {/* Delegation status subtitle */}
          <div className="hidden md:flex items-center text-xs text-stone-400 mr-2">
            {(() => {
              if (delegationChain && delegationChain.length >= 3) {
                if (chainExpanded) {
                  return (
                    <button onClick={() => setChainExpanded(false)} className="text-[#5a7247] hover:underline">
                      {delegationChain.join(' -> ')}
                    </button>
                  )
                }
                return (
                  <button onClick={() => setChainExpanded(true)} className="text-[#5a7247] animate-pulse hover:underline">
                    {delegationChain.length - 1}단계 위임 중
                  </button>
                )
              }
              if (delegationChain && delegationChain.length === 2) {
                return <span className="text-[#5a7247] animate-pulse">{delegationChain[1]}에게 위임 중...</span>
              }
              const entries = Object.values(delegationStatuses)
              const total = entries.length
              const completed = entries.filter(s => s.status !== 'delegating').length
              const delegating = entries.filter(s => s.status === 'delegating')
              if (total > 1 && completed < total) {
                return <span className="text-[#5a7247] animate-pulse">{total}개 부서 위임 중 ({completed}/{total})</span>
              }
              if (total > 1 && completed === total) {
                return <span className="text-emerald-400">{total}개 부서 위임 완료</span>
              }
              if (delegating.length === 1) {
                return <span className="text-[#5a7247] animate-pulse">{delegating[0].targetAgentName}에게 위임 중...</span>
              }
              return <span>{statusLabels[agent.status] || agent.role}</span>
            })()}
          </div>
          {agent.isSecretary && delegationList.length > 0 && (
            <button
              data-testid="delegation-toggle"
              onClick={() => setShowDelegations(!showDelegations)}
              className={`flex items-center justify-center rounded-xl size-10 transition-colors ${
                showDelegations
                  ? 'text-[#5a7247] bg-[#5a7247]/10'
                  : 'text-stone-500 hover:text-slate-200 hover:bg-stone-100'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* 위임 내역 패널 */}
      {showDelegations ? (
        <div data-testid="delegation-panel" className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {delegationList.map((del) => (
            <div
              key={del.id}
              className="bg-stone-100 border border-stone-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">{del.targetAgentName}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    del.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : del.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : del.status === 'processing'
                          ? 'bg-[#5a7247]/20 text-[#5a7247]'
                          : 'bg-slate-600 text-stone-500'
                  }`}
                >
                  {del.status === 'completed' ? '완료' : del.status === 'failed' ? '실패' : del.status === 'processing' ? '처리중' : '대기'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mb-2 line-clamp-2">{del.delegationPrompt}</p>
              {del.agentResponse && (
                <p className="text-xs text-stone-600 line-clamp-3">{del.agentResponse}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-mono">
                <span>생성: {new Date(del.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                {del.completedAt && (
                  <span>완료: {new Date(del.completedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 메시지 목록 -- Stitch chat area style */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            data-testid="message-list"
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [-webkit-overflow-scrolling:touch]"
          >
            {/* 이전 메시지 로딩 스피너 */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 text-[#5a7247] animate-spin" />
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center py-1">
                <button
                  data-testid="load-more-btn"
                  onClick={() => {
                    const el = scrollContainerRef.current
                    if (el) prevScrollHeightRef.current = el.scrollHeight
                    fetchNextPage()
                  }}
                  className="flex items-center justify-center w-full py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors font-mono"
                >
                  이전 메시지 더 보기
                </button>
              </div>
            )}

            {/* Date separator */}
            {messages.length > 0 && (
              <div className="flex justify-center">
                <span className="text-xs font-mono text-stone-400 px-3 py-1 bg-stone-100/50 rounded-full">TODAY</span>
              </div>
            )}

            {messages.length === 0 && !isStreaming && (
              <div data-testid="chat-empty" className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="bg-[#5a7247]/20 flex items-center justify-center rounded-full w-12 h-12 mb-3 border border-[#5a7247]/30">
                  <Bot className="w-6 h-6 text-[#5a7247]" />
                </div>
                <p className="text-sm font-medium text-stone-500">
                  {agent.name}과(와) 대화를 시작하세요
                </p>
                <p className="text-xs text-stone-400 mt-1">무엇이든 질문해보세요</p>
              </div>
            )}

            {messages.map((msg) => {
              // 에이전트 메시지의 도구 호출 카드 (API 기반)
              const msgToolCalls = toolCallsByMessage.get(msg.id) || []
              // fallback: 구버전 메시지의 텍스트 기반 도구 요약
              const toolSplit = msg.content.split('\n\n---\n🔧 **도구 호출 내역:**\n')
              const mainContent = toolSplit[0]
              const toolContent = msgToolCalls.length === 0 ? (toolSplit[1] || null) : null

              if (msg.sender === 'user') {
                return (
                  <div
                    key={msg.id}
                    data-testid={`msg-user-${msg.id}`}
                    className="flex items-end gap-3 justify-end group"
                  >
                    <div className="flex flex-col gap-1 items-end max-w-[80%]">
                      <p className="text-stone-500 text-xs font-medium px-2">User</p>
                      <div className="text-[15px] font-normal leading-relaxed rounded-2xl rounded-br-sm px-5 py-3.5 bg-[#5a7247]/10 text-[#5a7247]">
                        <p className="whitespace-pre-wrap">{renderTextWithLinks(mainContent, navigate)}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.attachments.map(att => (
                              <a
                                key={att.id}
                                data-testid={`attachment-${att.id}`}
                                href={`/api/workspace/files/${att.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#5a7247]/20 text-xs text-[#869e71]"
                              >
                                {att.mimeType.startsWith('image/') ? (
                                  <img
                                    src={`/api/workspace/files/${att.id}/download`}
                                    alt={att.filename}
                                    className="w-16 h-16 object-cover rounded"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Paperclip className="w-3 h-3" />
                                )}
                                <span className="truncate max-w-[150px]">{att.filename}</span>
                                <span>· {formatBytes(att.sizeBytes)}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 px-2 font-mono tabular-nums">
                        {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              }

              // Agent message -- Stitch style
              return (
                <div
                  key={msg.id}
                  data-testid={`msg-agent-${msg.id}`}
                  className="flex items-start gap-3 group"
                >
                  {/* Avatar */}
                  <div className="bg-[#5a7247]/20 flex items-center justify-center aspect-square rounded-full w-8 h-8 shrink-0 mt-6 border border-[#5a7247]/30">
                    <Bot className="w-4 h-4 text-[#5a7247]" />
                  </div>
                  <div className="flex flex-col gap-1 items-start max-w-[80%] w-full">
                    <p className="text-stone-500 text-xs font-medium px-2">{agent.name}</p>
                    {/* Tool calls */}
                    {msgToolCalls.length > 0 && (
                      <div className="flex flex-col gap-1 mb-1 px-2">
                        {msgToolCalls.map((tc) => (
                          <ToolCallCard key={tc.toolId} tool={tc} />
                        ))}
                      </div>
                    )}
                    {/* Message Bubble */}
                    <div className="text-[15px] font-normal leading-relaxed rounded-2xl rounded-bl-sm px-5 py-3.5 bg-stone-100 text-slate-200 w-full shadow-sm">
                      <p className="whitespace-pre-wrap">{renderTextWithLinks(mainContent, navigate)}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.attachments.map(att => (
                            <a
                              key={att.id}
                              data-testid={`attachment-${att.id}`}
                              href={`/api/workspace/files/${att.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200 hover:bg-slate-600 text-xs text-stone-600 transition-colors"
                            >
                              {att.mimeType.startsWith('image/') ? (
                                <img
                                  src={`/api/workspace/files/${att.id}/download`}
                                  alt={att.filename}
                                  className="w-16 h-16 object-cover rounded"
                                  loading="lazy"
                                />
                              ) : (
                                <Paperclip className="w-3 h-3" />
                              )}
                              <span className="truncate max-w-[150px]">{att.filename}</span>
                              <span>· {formatBytes(att.sizeBytes)}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {toolContent && (
                        <div className="mt-3 pt-3 border-t border-stone-200">
                          <p className="text-[10px] font-medium text-[#5a7247] mb-1 font-mono">도구 호출</p>
                          <p className="text-[11px] text-stone-500 whitespace-pre-wrap font-mono">{toolContent}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 px-2 font-mono tabular-nums">
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
              <div data-testid="msg-streaming" className="flex items-start gap-3">
                <div className="bg-[#5a7247]/20 flex items-center justify-center aspect-square rounded-full w-8 h-8 shrink-0 mt-6 border border-[#5a7247]/30">
                  <Bot className="w-4 h-4 text-[#5a7247]" />
                </div>
                <div className="flex flex-col gap-1 items-start max-w-[80%] w-full">
                  <p className="text-stone-500 text-xs font-medium px-2">{agent.name}</p>
                  {toolCalls.length > 0 && (
                    <div className="flex flex-col gap-1 mb-1 px-2">
                      {toolCalls.map((tool) => (
                        <ToolCallCard key={tool.toolId} tool={tool} />
                      ))}
                    </div>
                  )}
                  {streamingText && (
                    <div className="text-[15px] font-normal leading-relaxed rounded-2xl rounded-bl-sm px-5 py-3.5 bg-stone-100 text-slate-200 w-full shadow-sm">
                      <p className="whitespace-pre-wrap">
                        {renderTextWithLinks(streamingText, navigate)}
                        <span className="inline-block w-2 h-4 bg-[#5a7247] ml-1 align-middle animate-[blink_1s_step-end_infinite]" />
                      </p>
                    </div>
                  )}
                  {!streamingText && toolCalls.length > 0 && toolCalls.every(t => t.status === 'done') && (
                    <div className="flex items-center gap-1 py-1 px-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 스트리밍 시작 대기 (아직 토큰 없음) */}
            {isStreaming && !streamingText && toolCalls.length === 0 && (
              <div data-testid="msg-streaming" className="flex items-start gap-3">
                <div className="bg-[#5a7247]/20 flex items-center justify-center aspect-square rounded-full w-8 h-8 shrink-0 mt-6 border border-[#5a7247]/30">
                  <Bot className="w-4 h-4 text-[#5a7247]" />
                </div>
                <div className="flex flex-col gap-1 items-start max-w-[80%]">
                  <p className="text-stone-500 text-xs font-medium px-2">{agent.name}</p>
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <Loader2 className="w-3.5 h-3.5 text-stone-500 animate-spin" />
                    <span className="text-xs font-mono text-stone-500">
                      {(() => {
                        if (delegationChain && delegationChain.length >= 2) {
                          return `${delegationChain.join(' -> ')}`
                        }
                        const entries = Object.values(delegationStatuses)
                        const total = entries.length
                        const completed = entries.filter(s => s.status !== 'delegating').length
                        if (total > 1) return `${total}개 부서 위임 중 (${completed}/${total} 완료)`
                        if (delegationStatus?.targetAgentName) return `${delegationStatus.targetAgentName}에게 위임 중...`
                        return agent.isSecretary ? '부서 위임 분석 중...' : '응답 생성 중...'
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Delegation status inline */}
            {isStreaming && delegationStatus && !delegationChain && (
              <div data-testid="delegation-status" className="flex items-center gap-2 px-3 py-1.5 bg-stone-100/50 rounded-full border border-stone-200/50 text-xs text-stone-500 font-mono mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a7247] animate-pulse" />
                {delegationStatus.targetAgentName}에게 위임 중...
              </div>
            )}

            {/* 에러 표시 */}
            {error && (
              <div className="flex items-center gap-2 px-5 py-3 bg-red-950/30 border border-red-900/30 rounded-2xl">
                <span className="text-red-400 shrink-0 text-sm">!</span>
                <span className="text-sm text-red-300">{error}</span>
                <button
                  onClick={handleRetry}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto font-medium"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* Debate notice */}
            {debateNotice && (
              <div className="flex justify-center">
                <div className="bg-[#5a7247]/10 border border-[#5a7247]/20 rounded-full px-4 py-2 text-xs text-[#5a7247] animate-pulse font-mono">
                  {debateNotice}
                </div>
              </div>
            )}

            {/* Debate result cards */}
            {debateResults.map((dr) => (
              <div key={dr.debateId} className="flex justify-start">
                <div className="max-w-[75%]">
                  <DebateResultCard
                    debateId={dr.debateId}
                    topic={dr.topic}
                    result={dr.result}
                  />
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 -- Stitch style */}
          <div data-testid="chat-input" className="p-4 bg-[#111827] border-t border-stone-200 shrink-0">
            {/* 첨부 파일 미리보기 */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pendingAttachments.map(f => (
                  <span key={f.id} data-testid={`attachment-${f.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-600">
                    <Paperclip className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{f.filename}</span>
                    <span className="text-stone-400">· {formatBytes(f.sizeBytes)}</span>
                    <button
                      onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== f.id))}
                      className="text-stone-400 hover:text-red-400 transition-colors"
                    >x</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 bg-[#1E293B] rounded-2xl p-2 border border-stone-200/50 shadow-inner focus-within:ring-1 focus-within:ring-[#5a7247]/50 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileUpload}
              />
              <button
                data-testid="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || isUploading || pendingAttachments.length >= 5}
                className="flex items-center justify-center p-2.5 text-stone-500 hover:text-stone-600 rounded-xl hover:bg-stone-200 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="파일 첨부"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1 max-h-32 min-h-[44px] flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={
                    agent.isSecretary
                      ? `Message ${agent.name}...`
                      : `Message ${agent.name}...`
                  }
                  disabled={sendMessage.isPending || isStreaming}
                  aria-label="메시지 입력"
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none text-[15px] text-slate-200 placeholder:text-stone-400 py-3 px-2 h-full block font-display disabled:opacity-40"
                  rows={1}
                />
              </div>
              {isStreaming ? (
                <button
                  data-testid="cancel-btn"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center justify-center bg-red-500 text-white rounded-full w-10 h-10 shrink-0 hover:bg-red-400 transition-colors shadow-sm disabled:opacity-60"
                  aria-label="작업 중단"
                >
                  {isCancelling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <button
                  data-testid="chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                  className="flex items-center justify-center bg-[#5a7247] text-slate-950 rounded-full w-10 h-10 shrink-0 hover:bg-[#869e71] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="메시지 전송"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              )}
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-stone-400 font-mono">CORTHEX AI can make mistakes. Consider verifying important information.</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
