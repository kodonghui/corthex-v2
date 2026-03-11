import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useHubStream } from '../../hooks/use-hub-stream'
import { useWsStore } from '../../stores/ws-store'
import { HandoffTracker } from './handoff-tracker'
import { SessionSidebar } from './session-sidebar'

type Agent = {
  id: string
  name: string
  nameEn: string | null
  role: string
  tier: string
  isSecretary: boolean
  isActive: boolean
  status: string
  departmentId: string | null
}

type Message = {
  id: string
  sender: 'user' | 'agent'
  content: string
  createdAt: string
  attachmentIds?: string[]
  attachments?: FileAttachment[]
}

type FileAttachment = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
}

type Session = {
  id: string
  agentId: string
  title: string | null
  lastMessageAt: string | null
}

/** Markdown link renderer: [text](url) to clickable elements */
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
          className="text-blue-400 underline hover:text-blue-300"
        >
          {linkText}
        </button>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
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

const EXAMPLE_COMMANDS = [
  { text: '오늘 뉴스 브리핑해줘', desc: '최신 뉴스 요약' },
  { text: '/tools 사용 가능한 도구 목록', desc: '도구 확인' },
  { text: '@CMO 이번 주 마케팅 보고서', desc: '@멘션으로 직접 지시' },
  { text: '경쟁사 분석 보고서 작성해줘', desc: '심층 분석' },
]

export function SecretaryHubLayout({ secretary }: { secretary: Agent }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef(0)
  const { isConnected } = useWsStore()
  const [reconnectBanner, setReconnectBanner] = useState(false)
  const prevConnected = useRef(true)

  const {
    streamState,
    streamingText,
    processingAgent,
    handoffChain,
    toolCalls,
    error,
    costUsd,
    learnedCount,
    sessionId: streamSessionId,
    sendMessage: hubSendMessage,
    stopStream,
    clearError,
    reset,
  } = useHubStream()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Find or create a session with the secretary
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  const sessions = sessionsData?.data || []
  const secretarySession = sessions.find((s) => s.agentId === secretary.id) || null
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // Auto-select or create session
  const createSession = useMutation({
    mutationFn: (agentId: string) =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId }),
    onSuccess: (res) => {
      setActiveSessionId(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  useEffect(() => {
    if (secretarySession) {
      setActiveSessionId(secretarySession.id)
    } else if (!createSession.isPending && sessions.length >= 0 && !activeSessionId) {
      // Create session on first load if none exists
      createSession.mutate(secretary.id)
    }
  }, [secretarySession, secretary.id, sessions.length, activeSessionId, createSession])

  // Use streamSessionId if returned from SSE response
  const effectiveSessionId = streamSessionId || activeSessionId

  // Load message history
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', effectiveSessionId],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.get<{ data: Message[]; hasMore: boolean }>(
        `/workspace/chat/sessions/${effectiveSessionId}/messages${pageParam ? `?before=${pageParam}` : ''}`,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.data[0]?.id : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!effectiveSessionId,
  })

  const messages = messagesData?.pages.flatMap((p) => p.data) || []

  // Auto-scroll to bottom on new messages / streaming
  useEffect(() => {
    if (!isFetchingNextPage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, streamingText, streamState, isFetchingNextPage])

  // Scroll position preservation on loading older messages
  useEffect(() => {
    if (!isFetchingNextPage && prevScrollHeightRef.current > 0) {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
      }
      prevScrollHeightRef.current = 0
    }
  }, [isFetchingNextPage])

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < Math.max(100, el.clientHeight * 0.15)) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Connection banner
  useEffect(() => {
    if (!prevConnected.current && isConnected) {
      setReconnectBanner(true)
      const timer = setTimeout(() => setReconnectBanner(false), 2000)
      if (effectiveSessionId) {
        queryClient.invalidateQueries({ queryKey: ['messages', effectiveSessionId] })
      }
      prevConnected.current = isConnected
      return () => clearTimeout(timer)
    }
    prevConnected.current = isConnected
  }, [isConnected, effectiveSessionId, queryClient])

  // When streaming completes, refetch messages
  useEffect(() => {
    if (streamState === 'done' && effectiveSessionId) {
      queryClient.invalidateQueries({ queryKey: ['messages', effectiveSessionId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      reset()
    }
  }, [streamState, effectiveSessionId, queryClient, reset])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (pendingAttachments.length >= 5) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.upload<{ data: FileAttachment }>('/workspace/files', formData)
      setPendingAttachments((prev) => [...prev, res.data])
    } catch (err) {
      console.error('[File upload failed]', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || streamState === 'streaming' || streamState === 'processing' || streamState === 'accepted') return

    setInput('')
    // For file attachments, include attachment context in message
    let message = trimmed
    if (pendingAttachments.length > 0) {
      const fileNames = pendingAttachments.map((f) => f.filename).join(', ')
      message = `[첨부: ${fileNames}]\n${trimmed}`
      setPendingAttachments([])
    }

    await hubSendMessage(message, effectiveSessionId)
  }

  const handleExampleClick = (text: string) => {
    setInput(text)
  }

  const isProcessing = streamState === 'accepted' || streamState === 'processing' || streamState === 'streaming'

  return (
    <div data-testid="secretary-hub-layout" className="flex h-full">
      {/* Session sidebar */}
      <SessionSidebar
        secretaryId={secretary.id}
        activeSessionId={effectiveSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id)
          if (id) {
            queryClient.invalidateQueries({ queryKey: ['messages', id] })
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 min-w-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              data-testid="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors lg:hidden"
              aria-label="대화 목록 열기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {secretary.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{secretary.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  비서
                </span>
              </div>
              <p className="text-xs text-slate-500">
                모든 명령을 접수하고 적절한 에이전트에게 위임합니다
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {learnedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {learnedCount}개 학습됨
              </span>
            )}
            {costUsd != null && (
              <span className="text-xs text-slate-500">
                ${costUsd.toFixed(4)}
              </span>
            )}
            <span
              data-testid="ws-status-pill"
              className={`hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              {isConnected ? '실시간 연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection banners */}
      {!isConnected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/50 border-b border-amber-900/50 text-amber-300 text-xs">
          연결이 끊어졌습니다. 재연결 중...
        </div>
      )}
      {reconnectBanner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/50 text-emerald-300 text-xs">
          다시 연결되었습니다
        </div>
      )}

      {/* Handoff tracker */}
      <HandoffTracker chain={handoffChain} processingAgent={processingAgent} />

      {/* Message area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        data-testid="hub-message-list"
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-3 space-y-4 [-webkit-overflow-scrolling:touch]"
      >
        {/* Loading older messages */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {/* 대화 시작 마커 (모든 기록 로드 완료) */}
        {!hasNextPage && messages.length > 0 && !isFetchingNextPage && (
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-xs text-slate-500 shrink-0">대화 시작</span>
            <div className="flex-1 h-px bg-slate-700/50" />
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
              className="flex items-center justify-center w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              이전 메시지 더 보기
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isProcessing && (
          <div data-testid="hub-empty-state" className="flex flex-col items-center justify-center h-full px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-blue-500/20">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {secretary.name}에게 명령하세요
            </h2>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
              무엇이든 자연어로 명령하면 적절한 에이전트에게 위임하여 처리합니다.
              슬래시 명령어(/tools, /batch)나 @멘션(@CMO)도 지원합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {EXAMPLE_COMMANDS.map((cmd) => (
                <button
                  key={cmd.text}
                  onClick={() => handleExampleClick(cmd.text)}
                  className="text-left px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800 transition-all group"
                >
                  <p className="text-sm text-slate-200 group-hover:text-white">{cmd.text}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cmd.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} data-testid={`msg-user-${msg.id}`} className="flex justify-end">
                <div className="max-w-[75%] bg-blue-600 rounded-2xl rounded-br-md px-4 py-2.5">
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {renderTextWithLinks(msg.content, navigate)}
                  </p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={`/api/workspace/files/${att.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/30 text-xs text-blue-100"
                        >
                          {att.mimeType.startsWith('image/') ? (
                            <img src={`/api/workspace/files/${att.id}/download`} alt={att.filename} className="w-16 h-16 object-cover rounded" loading="lazy" />
                          ) : (
                            <span>&#x1F4CE;</span>
                          )}
                          <span className="truncate max-w-[150px]">{att.filename}</span>
                          <span>&middot; {formatBytes(att.sizeBytes)}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-blue-200/70 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          }

          // Agent message
          return (
            <div key={msg.id} data-testid={`msg-agent-${msg.id}`} className="flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0 border border-blue-500/20">
                {secretary.name.charAt(0)}
              </span>
              <div className="max-w-[75%] bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-2.5">
                <p className="text-xs font-medium text-slate-400 mb-1">{secretary.name}</p>
                <div className="text-sm text-slate-200 prose prose-sm prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{renderTextWithLinks(msg.content, navigate)}</p>
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={`/api/workspace/files/${att.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition-colors"
                      >
                        {att.mimeType.startsWith('image/') ? (
                          <img src={`/api/workspace/files/${att.id}/download`} alt={att.filename} className="w-16 h-16 object-cover rounded" loading="lazy" />
                        ) : (
                          <span>&#x1F4CE;</span>
                        )}
                        <span className="truncate max-w-[150px]">{att.filename}</span>
                        <span>&middot; {formatBytes(att.sizeBytes)}</span>
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}

        {/* Streaming message */}
        {isProcessing && (streamingText || toolCalls.length > 0) && (
          <div data-testid="msg-streaming" className="flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0 border border-blue-500/20">
              {secretary.name.charAt(0)}
            </span>
            <div className="max-w-[75%] bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed">
              <p className="text-xs font-medium text-slate-400 mb-1">{secretary.name}</p>
              {toolCalls.map((tool) => (
                <div
                  key={tool.toolId}
                  className={`flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg text-xs ${
                    tool.status === 'running'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : tool.error
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                  }`}
                >
                  {tool.status === 'running' ? (
                    <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : tool.error ? (
                    <span className="text-red-400 shrink-0">x</span>
                  ) : (
                    <span className="text-emerald-400 shrink-0">ok</span>
                  )}
                  <span className="font-mono truncate">{tool.toolName}</span>
                  {tool.progressText && <span className="text-slate-500 truncate">{tool.progressText}</span>}
                  {tool.durationMs != null && <span className="text-slate-600 ml-auto shrink-0">{(tool.durationMs / 1000).toFixed(1)}s</span>}
                </div>
              ))}
              {streamingText && (
                <div className="text-sm text-slate-200 prose prose-sm prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">
                    {renderTextWithLinks(streamingText, navigate)}
                    <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5" />
                  </p>
                </div>
              )}
              {!streamingText && toolCalls.length > 0 && toolCalls.every((t) => t.status === 'done') && (
                <div className="flex items-center gap-1 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waiting for response */}
        {isProcessing && !streamingText && toolCalls.length === 0 && (
          <div data-testid="msg-streaming" className="flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0 border border-blue-500/20">
              {secretary.name.charAt(0)}
            </span>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-400">
                  {streamState === 'accepted' && '명령 접수됨...'}
                  {streamState === 'processing' && (processingAgent ? `${processingAgent} 분석 중...` : '비서실장 분석 중...')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div data-testid="hub-error" className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/30 rounded-lg mx-4">
            <span className="text-red-400 shrink-0">!</span>
            <span className="text-sm text-red-300">{error}</span>
            <button
              onClick={clearError}
              className="text-xs text-red-400 hover:text-red-300 ml-auto"
            >
              닫기
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div data-testid="hub-input" className="shrink-0 border-t border-slate-700 bg-slate-900 px-4 py-3">
        {/* Pending attachments */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pendingAttachments.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
              >
                <span>&#x1F4CE;</span>
                <span className="max-w-[120px] truncate">{f.filename}</span>
                <span className="text-slate-500">&middot; {formatBytes(f.sizeBytes)}</span>
                <button
                  onClick={() => setPendingAttachments((prev) => prev.filter((a) => a.id !== f.id))}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileUpload}
          />
          <button
            data-testid="hub-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isUploading || pendingAttachments.length >= 5}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="파일 첨부"
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin inline-block" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            )}
          </button>
          <textarea
            data-testid="hub-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`${secretary.name}에게 업무 지시... (Shift+Enter: 줄바꿈)`}
            disabled={isProcessing}
            aria-label="메시지 입력"
            className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none resize-none min-h-[44px] max-h-[120px] transition-colors disabled:opacity-40"
            rows={1}
          />
          {isProcessing ? (
            <button
              data-testid="hub-stop-btn"
              onClick={stopStream}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shrink-0"
              aria-label="스트리밍 중지"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              data-testid="hub-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
              aria-label="메시지 전송"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
