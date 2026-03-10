import { useRef, useEffect, useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { SketchPreviewCard, SketchLoadingCard } from './sketch-preview-card'
import type { CommandMessage } from '../../../stores/command-store'

type Props = {
  messages: CommandMessage[]
  isLoading: boolean
  onReportClick: (commandId: string) => void
  onExampleClick?: (text: string) => void
  selectedCommandId: string | null
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const EXAMPLE_COMMANDS = [
  { text: '오늘 주요 뉴스 브리핑해줘', label: '뉴스 브리핑' },
  { text: '마케팅 전략 보고서 작성해줘', label: '보고서 작성' },
  { text: '이번 달 SNS 성과 분석해줘', label: '성과 분석' },
]

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MANAGER: { bg: 'bg-violet-950', text: 'text-violet-300', border: 'border-violet-800' },
  CONTENT: { bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800' },
  ANALYST: { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800' },
  DESIGNER: { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-800' },
}

function AgentAvatar({ name, role }: { name?: string; role?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'A'
  const c = role ? ROLE_COLORS[role] : undefined
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border
        ${c ? `${c.bg} ${c.text} ${c.border}` : 'bg-slate-800 text-slate-300 border-slate-700'}`}
    >
      {initial}
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-slate-700 mb-4">
        <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 18l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium text-slate-400 mb-2">아직 명령이 없습니다</p>
      <div className="space-y-1.5">
        {EXAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd.text}
            data-testid="example-command"
            onClick={() => onExampleClick(cmd.text)}
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors block"
          >
            "{cmd.text}"
          </button>
        ))}
      </div>
    </div>
  )
}

export function MessageThread({
  messages,
  isLoading,
  onReportClick,
  onExampleClick,
  selectedCommandId,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 100)
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        data-testid="message-loading-skeleton"
        className="space-y-3 px-4 py-3"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-slate-800 animate-pulse rounded h-4 w-24" />
              <div className="bg-slate-800 animate-pulse rounded h-4 w-full" />
              <div className="bg-slate-800 animate-pulse rounded h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return <EmptyState onExampleClick={onExampleClick || (() => {})} />
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Scroll area */}
      <div
        data-testid="message-thread"
        ref={containerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        onScroll={handleScroll}
      >
        {messages.map((msg) => {
          if (msg.role === 'user') {
            const isSelected = selectedCommandId === msg.commandId
            return (
              <div
                key={msg.id}
                data-testid={`msg-user-${msg.commandId || msg.id}`}
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
                className={`flex items-start gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 transition-colors ${
                  isSelected ? 'ring-1 ring-blue-500/50 bg-slate-800/30' : ''
                }`}
              >
                <UserAvatar />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">You</span>
                    {msg.createdAt && (
                      <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">{msg.text}</p>
                </div>
              </div>
            )
          }

          if (msg.role === 'agent') {
            const isSelected = selectedCommandId === msg.commandId
            return (
              <div
                key={msg.id}
                data-testid={`msg-agent-${msg.commandId || msg.id}`}
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
                className={`flex items-start gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 transition-colors ${
                  isSelected ? 'ring-1 ring-blue-500/50 bg-slate-800/30' : ''
                }`}
              >
                <AgentAvatar name={msg.agentName} role={msg.agentRole} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">
                      {msg.agentName || 'Agent'}
                    </span>
                    {msg.agentRole && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        {msg.agentRole}
                      </span>
                    )}
                    {msg.quality && (
                      <span
                        data-testid={`quality-badge-${msg.commandId}`}
                        className={`text-xs px-1.5 py-0.5 rounded border ${
                          msg.quality.passed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {msg.quality.passed ? 'PASS' : 'FAIL'}{msg.quality.score != null ? ` ${msg.quality.score}` : ''}
                      </span>
                    )}
                    {msg.createdAt && (
                      <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>

                  {msg.sketchLoading && <SketchLoadingCard />}

                  {msg.sketchResult && !msg.sketchLoading && (
                    <ReactFlowProvider>
                      <SketchPreviewCard
                        mermaid={msg.sketchResult.mermaid}
                        description={msg.sketchResult.description}
                        commandId={msg.commandId || ''}
                      />
                    </ReactFlowProvider>
                  )}

                  {!msg.sketchResult && !msg.sketchLoading && (
                    <p className="text-sm text-slate-300 mt-1">
                      {msg.text || (msg.result ? msg.result.slice(0, 150) + '…' : '')}
                    </p>
                  )}
                </div>
              </div>
            )
          }

          if (msg.role === 'system') {
            return (
              <div key={msg.id} data-testid={`msg-system-${msg.commandId || msg.id}`} className="flex items-center justify-center py-2">
                <div className="bg-red-950/50 border border-red-900/50 rounded-lg px-4 py-2 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-400 shrink-0">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M8 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="8" cy="11" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="text-sm text-red-300">{msg.text}</span>
                </div>
              </div>
            )
          }

          return null
        })}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          data-testid="scroll-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="absolute bottom-20 right-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full p-2 shadow-lg transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M8 13l-4-4M8 13l4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { EXAMPLE_COMMANDS }
