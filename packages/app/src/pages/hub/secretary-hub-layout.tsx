// API: GET /workspace/chat/sessions, POST /workspace/chat/sessions
// API: GET /workspace/chat/sessions/:id/messages
// API: POST /workspace/files (file upload)
// API: /api/workspace/hub/stream (SSE streaming)

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

// === Organic theme color constants ===
const C = {
  bgPrimary: 'var(--color-corthex-bg)',
  bgSecondary: '#f5f0eb',
  accentOlive: 'var(--color-corthex-accent)',
  accentOliveLight: '#869e71',
  textMain: '#2d2d2d',
  textMuted: '#6b7280',
  border: '#e5e1da',
}

const customStyles = `
body {
  background-color: ${C.bgPrimary};
  color: ${C.textMain};
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: ${C.border};
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: ${C.accentOlive};
}
.terminal-focus:focus-within {
  box-shadow: 0 0 0 2px rgba(90, 114, 71, 0.2);
}
.pulse-dot {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
`

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
          style={{ color: C.accentOlive, textDecoration: 'underline' }}
        >
          {linkText}
        </button>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.accentOlive, textDecoration: 'underline' }}>
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
  const [navSidebarOpen, setNavSidebarOpen] = useState(false)

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

  // Auto-scroll
  useEffect(() => {
    if (!isFetchingNextPage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, streamingText, streamState, isFetchingNextPage])

  // Scroll position preservation
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

  // Auto-expand textarea handler
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = target.scrollHeight + 'px'
  }

  return (
    <div data-testid="secretary-hub-layout" className="flex h-screen overflow-hidden" style={{ fontFamily: "'Pretendard', 'Inter', sans-serif" }}>
      <style>{customStyles}</style>

      {/* Mobile overlay for nav sidebar */}
      {navSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setNavSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar — hidden on mobile, slide-in drawer */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-20
          w-64 border-r flex flex-col
          transition-transform duration-200 lg:translate-x-0
          ${navSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ borderColor: C.border, backgroundColor: C.bgSecondary }}
        data-purpose="navigation-sidebar"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: C.accentOlive }}>
              <span className="font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>C</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.accentOlive }}>CORTHEX v2</h1>
          </div>
          <nav className="space-y-1">
            <span className="flex items-center gap-3 px-3 py-2 text-sm font-medium bg-corthex-surface rounded-lg shadow-sm" style={{ color: C.accentOlive }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Workspace Hub
            </span>
            <span className="flex items-center gap-3 px-3 py-2 text-sm font-medium" style={{ color: C.textMuted }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Active Tasks
            </span>
            <span className="flex items-center gap-3 px-3 py-2 text-sm font-medium" style={{ color: C.textMuted }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Agent Directory
            </span>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
              <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLvoxDUp6q2eRNbUDsCj-ndANioID3_YCLsCTPFMiHcUMC9aC0ASN-7PHnDbwKbpd3toeezs9XQXheQxMl329dBMSE-2WkPCFgKPES4hXswucglteXwbTYvNqqGQlprZb4Tegfv7MPxBH8QzHtxGHdt07CEV0z7buWLsbDW55twu4kwSbJPr__lzQdUhb4NDGWvFT69Dx-oYueYYcIJPn1WL_J_7i6ljDwqK4ulPJdKa0Pf24nWow7BzdctLmxAEdvntrcNqzRJQ" />
            </div>
            <div>
              <p className="text-sm font-semibold">CEO님</p>
              <p className="text-xs" style={{ color: C.textMuted }}>Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: C.bgPrimary }}>
        {/* Header */}
        <header className="h-14 lg:h-16 border-b px-4 lg:px-8 flex items-center justify-between z-10" style={{ borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              onClick={() => setNavSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </button>
            <h2 className="text-base lg:text-lg font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>Workspace Hub</h2>
            <span className="hidden sm:inline px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-full border" style={{ backgroundColor: C.bgSecondary, color: C.accentOlive, borderColor: C.border }}>v2.0.4-live</span>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot"></span>
              {isConnected ? 'System Online' : 'Reconnecting...'}
            </div>
            {/* Mobile: compact status dot only */}
            <span className="sm:hidden w-2 h-2 rounded-full bg-green-500 pulse-dot"></span>
            <button className="p-2 text-stone-400" style={{ ['--hover-color' as string]: C.accentOlive } as React.CSSProperties}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Interface */}
          <section className="flex-1 flex flex-col min-w-0" data-purpose="hub-chat-area">
            {/* SSE Streaming Message Area */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8"
              id="message-container"
              data-testid="hub-message-list"
              role="log"
              aria-live="polite"
            >
              {/* Loading older messages */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-stone-300 rounded-full animate-spin" style={{ borderTopColor: C.accentOlive }} />
                </div>
              )}

              {/* Conversation start */}
              {!hasNextPage && messages.length > 0 && !isFetchingNextPage && (
                <div className="flex items-center gap-3 py-3 px-2">
                  <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                  <span className="text-xs text-stone-400 shrink-0">대화 시작</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
                </div>
              )}

              {/* Empty state */}
              {messages.length === 0 && !isProcessing && (
                <div data-testid="hub-empty-state" className="flex flex-col h-full">
                  {/* Example: User message placeholder */}
                  <div className="flex gap-4 max-w-3xl">
                    <div className="w-8 h-8 rounded bg-stone-100 flex-shrink-0 flex items-center justify-center border border-stone-200">
                      <span className="text-xs font-bold">You</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-tight">You</p>
                      <div className="text-stone-500 italic">명령을 입력하여 대화를 시작하세요...</div>
                    </div>
                  </div>
                  {/* Example commands */}
                  <div className="flex-1 flex flex-col items-center justify-center px-6 mt-8">
                    <h2 className="text-lg font-bold text-stone-800 mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {secretary.name}에게 명령하세요
                    </h2>
                    <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
                      무엇이든 자연어로 명령하면 적절한 에이전트에게 위임하여 처리합니다.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {EXAMPLE_COMMANDS.map((cmd) => (
                        <button
                          key={cmd.text}
                          onClick={() => handleExampleClick(cmd.text)}
                          className="text-left px-4 py-3 rounded-lg border transition-all group"
                          style={{ backgroundColor: 'white', borderColor: C.border }}
                        >
                          <p className="text-sm text-stone-700 group-hover:text-stone-900">{cmd.text}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{cmd.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} data-testid={`msg-user-${msg.id}`} className="flex gap-4 max-w-3xl">
                      <div className="w-8 h-8 rounded bg-stone-100 flex-shrink-0 flex items-center justify-center border border-stone-200">
                        <span className="text-xs font-bold">You</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-tight">You</p>
                        <div className="text-stone-700">{renderTextWithLinks(msg.content, navigate)}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {msg.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={`/api/workspace/files/${att.id}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                                style={{ backgroundColor: `${C.accentOlive}10`, color: C.accentOlive, borderColor: `${C.accentOlive}30` }}
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

                // Agent Response
                return (
                  <div key={msg.id} data-testid={`msg-agent-${msg.id}`} className="flex gap-4 max-w-4xl">
                    <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center border shadow-sm" style={{ backgroundColor: C.accentOlive, borderColor: C.accentOlive }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight" style={{ color: C.accentOlive }}>{secretary.name}</p>
                      </div>
                      <div className="prose prose-stone prose-sm max-w-none text-stone-800 space-y-4">
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
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-colors"
                              style={{ backgroundColor: C.bgSecondary, borderColor: C.border, color: C.textMain }}
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
                <div data-testid="msg-streaming" className="flex gap-4 max-w-4xl">
                  <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center border shadow-sm" style={{ backgroundColor: C.accentOlive, borderColor: C.accentOlive }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <div className="space-y-4 flex-1">
                    <p className="text-xs font-bold uppercase tracking-tight" style={{ color: C.accentOlive }}>
                      {processingAgent || secretary.name} <span className="ml-2 font-normal lowercase text-stone-400 italic">processing via /stream...</span>
                    </p>
                    {streamingText && (
                      <div className="prose prose-stone prose-sm max-w-none text-stone-800">
                        <p className="whitespace-pre-wrap">
                          {renderTextWithLinks(streamingText, navigate)}
                          <span className="inline-block w-2 h-4 ml-1 animate-pulse align-middle" style={{ backgroundColor: C.accentOlive }} />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Waiting indicator */}
              {isProcessing && !streamingText && toolCalls.length === 0 && (
                <div data-testid="msg-streaming" className="flex gap-4 max-w-4xl">
                  <div className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center border shadow-sm" style={{ backgroundColor: C.accentOlive, borderColor: C.accentOlive }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-stone-400">
                        {streamState === 'accepted' && '명령 접수됨...'}
                        {streamState === 'processing' && (processingAgent ? `${processingAgent} 분석 중...` : '비서실장 분석 중...')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div data-testid="hub-error" className="flex items-center gap-2 px-4 py-2 rounded-lg mx-4 border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <span className="text-red-500 shrink-0">!</span>
                  <span className="text-sm text-red-600">{error}</span>
                  <button onClick={clearError} className="text-xs text-red-400 hover:text-red-600 ml-auto">닫기</button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Command Input (Terminal Style) */}
            <div className="p-3 lg:p-6 bg-transparent" data-purpose="terminal-input-container" data-testid="hub-input">
              {/* Pending attachments */}
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 max-w-4xl mx-auto">
                  {pendingAttachments.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs"
                      style={{ backgroundColor: C.bgSecondary, borderColor: C.border, color: C.textMain }}
                    >
                      <span>&#x1F4CE;</span>
                      <span className="max-w-[120px] truncate">{f.filename}</span>
                      <span style={{ color: C.textMuted }}>&middot; {formatBytes(f.sizeBytes)}</span>
                      <button
                        onClick={() => setPendingAttachments((prev) => prev.filter((a) => a.id !== f.id))}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="max-w-4xl mx-auto bg-corthex-surface border shadow-lg rounded-xl overflow-hidden terminal-focus transition-all" style={{ borderColor: C.border }}>
                <div className="flex items-center px-4 py-2 border-b" style={{ backgroundColor: C.bgSecondary, borderColor: C.border }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  </div>
                  <span className="ml-4 text-[10px] font-mono text-stone-400 tracking-widest uppercase">CORTHEX_TERMINAL_V2</span>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <span className="font-mono mt-1" style={{ color: C.accentOlive }}>&gt;</span>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                    />
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-stone-800 placeholder-stone-400 resize-none"
                      style={{ fontFamily: "'Pretendard', 'Inter', sans-serif" }}
                      data-testid="hub-message-input"
                      placeholder="Type @agent to mention or /command..."
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onInput={handleTextareaInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      disabled={isProcessing}
                      aria-label="메시지 입력"
                    />
                  </div>
                  {isProcessing ? (
                    <button
                      data-testid="hub-stop-btn"
                      onClick={stopStream}
                      className="px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                      style={{ backgroundColor: '#dc2626', color: 'white' }}
                      aria-label="스트리밍 중지"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      data-testid="hub-send-btn"
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="text-white px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-40"
                      style={{ backgroundColor: C.accentOlive }}
                      aria-label="메시지 전송"
                    >
                      Execute
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </button>
                  )}
                </div>
                <div className="px-4 py-1 border-t flex justify-between" style={{ backgroundColor: '#fafaf9', borderColor: C.border }}>
                  <div className="flex gap-4">
                    <span className="text-[10px] text-stone-400"><kbd className="bg-corthex-surface border px-1 rounded">@</kbd> Mention Agent</span>
                    <span className="text-[10px] text-stone-400"><kbd className="bg-corthex-surface border px-1 rounded">/</kbd> Command</span>
                  </div>
                  <span className="text-[10px] text-stone-400">API: /api/workspace/hub/stream</span>
                </div>
              </div>
            </div>
          </section>

          {/* Handoff Tracker Sidebar — hidden on mobile/tablet */}
          <aside className="hidden lg:flex w-72 border-l bg-corthex-surface flex-col" style={{ borderColor: C.border }} data-purpose="handoff-tracker">
            <div className="p-6 border-b" style={{ borderColor: C.border, backgroundColor: `${C.bgSecondary}4d` }}>
              <h3 className="font-bold text-stone-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>Process Delegation</h3>
              <p className="text-xs text-stone-500 mt-1">Real-time handoff chain</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative">
                {/* Connector Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-stone-100"></div>
                {/* Chain Steps from handoffChain */}
                <div className="space-y-8 relative">
                  {handoffChain.length > 0 ? (
                    <HandoffTracker chain={handoffChain} processingAgent={processingAgent} />
                  ) : (
                    <>
                      {/* Default display steps */}
                      {/* Step 1: Completed */}
                      <div className="flex items-start gap-4">
                        <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white" style={{ backgroundColor: C.accentOlive }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-800">System Secretary</h4>
                          <p className="text-[11px] text-stone-500">Task intake &amp; Intent Mapping</p>
                          <span className="text-[10px] font-mono text-stone-400">Waiting...</span>
                        </div>
                      </div>
                      {/* Step 2: Pending */}
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="relative z-10 w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center ring-4 ring-white">
                          <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-800">Agent</h4>
                          <p className="text-[11px] text-stone-500">Awaiting task...</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t" style={{ borderColor: C.border }}>
              <div className="p-3 rounded-lg text-[11px] text-stone-600 italic" style={{ backgroundColor: C.bgSecondary }}>
                {isProcessing
                  ? `"${processingAgent || secretary.name} is currently processing your request."`
                  : '"Ready for your next command."'
                }
              </div>
              {costUsd != null && (
                <div className="mt-3 text-xs text-stone-500">
                  Session cost: <span className="font-mono font-medium text-stone-700">${costUsd.toFixed(4)}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
