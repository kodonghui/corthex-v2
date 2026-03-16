import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useHubStream } from '../../hooks/use-hub-stream'
import { useWsStore } from '../../stores/ws-store'
import { HandoffTracker } from './handoff-tracker'
import { SessionSidebar } from './session-sidebar'
import { Copy, MoreVertical } from 'lucide-react'

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
          className="text-cyan-400 underline hover:text-cyan-300"
        >
          {linkText}
        </button>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
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
    <div data-testid="secretary-hub-layout" className="flex h-full bg-slate-950">
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

      {/* Main Content Grid — Stitch 12-col layout */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden min-w-0">

        {/* Left Panel: Terminal Interface (8 cols) */}
        <section className="lg:col-span-8 flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden h-full">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-3">
              <button
                data-testid="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors lg:hidden"
                aria-label="대화 목록 열기"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div className="flex flex-col">
                <h1 className="text-slate-50 text-xl font-bold leading-tight">Terminal Interface</h1>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mt-1">
                  AI Agent Interaction Terminal // Session ID: {effectiveSessionId ? effectiveSessionId.slice(0, 8).toUpperCase() : '----'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {learnedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {learnedCount}개 학습됨
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
              <button
                className="p-2 text-slate-400 hover:text-slate-50 rounded-md hover:bg-slate-800 transition-colors"
                aria-label="터미널 복사"
                onClick={() => {
                  const text = messages.map((m) => `${m.sender === 'user' ? 'User' : secretary.name}: ${m.content}`).join('\n')
                  navigator.clipboard.writeText(text)
                }}
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-slate-50 rounded-md hover:bg-slate-800 transition-colors"
                aria-label="더보기"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
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

          {/* Terminal Output Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            data-testid="hub-message-list"
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-mono text-sm bg-slate-950 [-webkit-overflow-scrolling:touch]"
          >
            {/* Loading older messages */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            )}
            {/* Conversation start marker */}
            {!hasNextPage && messages.length > 0 && !isFetchingNextPage && (
              <div className="flex items-center gap-3 py-3 px-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-500 shrink-0">대화 시작</span>
                <div className="flex-1 h-px bg-slate-800" />
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

            {/* System init message */}
            {messages.length === 0 && !isProcessing && (
              <div data-testid="hub-empty-state" className="flex flex-col h-full">
                {/* System message */}
                <div className="flex gap-4 mb-6">
                  <div className="size-8 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
                    <svg className="w-[18px] h-[18px] text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-slate-400">System initialized. Connected to {secretary.name}. Waiting for input...</p>
                  </div>
                </div>
                {/* Example commands */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <h2 className="text-lg font-bold text-slate-50 mb-2 font-sans">
                    {secretary.name}에게 명령하세요
                  </h2>
                  <p className="text-sm text-slate-400 mb-6 text-center max-w-md font-sans">
                    무엇이든 자연어로 명령하면 적절한 에이전트에게 위임하여 처리합니다.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {EXAMPLE_COMMANDS.map((cmd) => (
                      <button
                        key={cmd.text}
                        onClick={() => handleExampleClick(cmd.text)}
                        className="text-left px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:border-cyan-400/30 hover:bg-slate-800 transition-all group font-sans"
                      >
                        <p className="text-sm text-slate-200 group-hover:text-slate-50">{cmd.text}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cmd.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                // User Command — Stitch style
                return (
                  <div key={msg.id} data-testid={`msg-user-${msg.id}`} className="flex gap-4">
                    <div className="size-8 rounded-md bg-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/30">
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div className="flex-1 flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-3">
                        <p className="text-slate-50 font-bold font-sans text-sm">User</p>
                        <p className="text-slate-400 text-xs font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-slate-200">{renderTextWithLinks(msg.content, navigate)}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={`/api/workspace/files/${att.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-400/10 text-xs text-cyan-300 border border-cyan-400/20"
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
                    </div>
                  </div>
                )
              }

              // Agent Response — Stitch style
              return (
                <div key={msg.id} data-testid={`msg-agent-${msg.id}`} className="flex gap-4">
                  <div className="size-8 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <div className="flex-1 flex flex-col gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <p className="text-slate-50 font-bold font-sans text-sm">{secretary.name}</p>
                      <p className="text-slate-400 text-xs font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                    {/* Streaming output style content block */}
                    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 leading-relaxed text-slate-300">
                      <p className="whitespace-pre-wrap">{renderTextWithLinks(msg.content, navigate)}</p>
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={`/api/workspace/files/${att.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
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
                  </div>
                </div>
              )
            })}

            {/* Streaming message */}
            {isProcessing && (streamingText || toolCalls.length > 0) && (
              <div data-testid="msg-streaming" className="flex gap-4">
                <div className="size-8 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <div className="flex-1 flex flex-col gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <p className="text-slate-50 font-bold font-sans text-sm">{secretary.name}</p>
                    <p className="text-slate-400 text-xs font-mono">Processing...</p>
                  </div>
                  {/* Tool Call Cards — Stitch collapsible style */}
                  {toolCalls.map((tool) => (
                    <details
                      key={tool.toolId}
                      className="flex flex-col rounded-lg border border-slate-700/50 bg-slate-800/50 group overflow-hidden"
                      open={tool.status === 'running'}
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-6 px-4 py-3 hover:bg-slate-800/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <svg className="w-[18px] h-[18px] text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.96m-5.1 5.11H20.58" />
                          </svg>
                          <p className="text-slate-300 text-xs font-mono font-medium">
                            Tool Call: <span className="text-cyan-400">{tool.toolName}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {tool.status === 'running' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/10 text-cyan-400 uppercase tracking-wider animate-pulse">
                              Running
                            </span>
                          ) : tool.error ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-400 uppercase tracking-wider">
                              Error
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/30 text-emerald-400 uppercase tracking-wider">
                              Success{tool.durationMs != null ? ` (${(tool.durationMs / 1000).toFixed(1)}s)` : ''}
                            </span>
                          )}
                          <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </summary>
                      {tool.progressText && (
                        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                          <pre className="text-[11px] text-slate-400 overflow-x-auto"><code>{tool.progressText}</code></pre>
                        </div>
                      )}
                    </details>
                  ))}
                  {/* Streaming text output */}
                  {streamingText && (
                    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 leading-relaxed text-slate-300">
                      <p className="whitespace-pre-wrap">
                        {renderTextWithLinks(streamingText, navigate)}
                        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
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
              <div data-testid="msg-streaming" className="flex gap-4">
                <div className="size-8 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-400 font-sans">
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

          {/* Input Area — Stitch style */}
          <div data-testid="hub-input" className="p-4 border-t border-slate-800 bg-slate-900">
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
            <div className="flex w-full items-center rounded-lg border border-slate-700 bg-slate-800 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all p-1">
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
                className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-md hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="파일 첨부"
              >
                {isUploading ? (
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin inline-block" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                )}
              </button>
              <svg className="w-5 h-5 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                data-testid="hub-message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type a command or ask a question..."
                disabled={isProcessing}
                aria-label="메시지 입력"
                className="w-full flex-1 bg-transparent border-none focus:ring-0 text-slate-50 text-sm font-mono placeholder:text-slate-400 px-3 py-2 outline-none"
                type="text"
              />
              {isProcessing ? (
                <button
                  data-testid="hub-stop-btn"
                  onClick={stopStream}
                  className="flex items-center justify-center p-2 text-red-400 hover:text-red-300 transition-colors rounded-md hover:bg-slate-700 mr-1"
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
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-md hover:bg-slate-700 mr-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="메시지 전송"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              )}
            </div>
            {/* Quick command buttons */}
            <div className="flex gap-2 mt-2 px-1">
              <button
                onClick={() => setInput('/help')}
                className="text-xs font-mono text-slate-500 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors"
              >
                /help
              </button>
              <button
                onClick={() => setInput('/clear')}
                className="text-xs font-mono text-slate-500 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors"
              >
                /clear
              </button>
              <button
                onClick={() => setInput('/agents')}
                className="text-xs font-mono text-slate-500 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors"
              >
                /agents
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel: Tracker Cards (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto h-full pr-2 pb-4 hidden lg:flex">
          {/* Active Agent Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Active Agent</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isProcessing ? 'Running' : 'Ready'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-50">{secretary.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Role: {secretary.role}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Status</span>
                <span className="text-slate-300 font-mono">
                  {isProcessing ? 'Processing' : 'Idle'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-cyan-400 h-1.5 rounded-full transition-all" style={{ width: isProcessing ? '60%' : '0%' }} />
              </div>
            </div>
          </div>

          {/* Handoff Chain Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-50 uppercase tracking-wider mb-4">Handoff Chain</h3>
            <HandoffTracker chain={handoffChain} processingAgent={processingAgent} />
            {handoffChain.length === 0 && !processingAgent && (
              <p className="text-xs text-slate-500 font-mono">No active handoffs</p>
            )}
          </div>

          {/* Session Cost Card */}
          {costUsd != null && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-50 uppercase tracking-wider mb-3">Session Cost</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold font-mono text-slate-50 tabular-nums">${costUsd.toFixed(2)}</span>
                <span className="text-xs text-slate-400 mb-1">/ $5.00 limit</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min((costUsd / 5) * 100, 100)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Tokens (In)</span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {messages.reduce((sum, m) => sum + (m.sender === 'user' ? m.content.length : 0), 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tokens (Out)</span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {messages.reduce((sum, m) => sum + (m.sender === 'agent' ? m.content.length : 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Messages count */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-0 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Session Info</h3>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <svg className="w-[18px] h-[18px] text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-slate-50">Messages</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono tabular-nums">{messages.length} messages in session</p>
                    </div>
                  </div>
                </div>
              </div>
              {learnedCount > 0 && (
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <svg className="w-[18px] h-[18px] text-cyan-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-slate-50">Knowledge Learned</p>
                        <p className="text-xs text-slate-400 mt-1 font-mono tabular-nums">{learnedCount} items learned</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 animate-pulse">ACTIVE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
