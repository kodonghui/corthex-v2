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
  {
    text: 'Analyze our Q3 sales data and create a presentation',
    label: 'Data analysis',
  },
  {
    text: 'Write a competitive landscape report for the AI agent market',
    label: 'Research report',
  },
  {
    text: 'Summarize the board meeting notes and extract action items',
    label: 'Summarize',
  },
]

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MANAGER: {
    bg: 'bg-violet-950/50',
    text: 'text-violet-300',
    border: 'border-violet-800/60',
  },
  CONTENT: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
  },
  ANALYST: {
    bg: 'bg-blue-950/50',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
  },
  DESIGNER: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
  },
}

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role]
  if (!c) {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wide bg-zinc-800 text-zinc-400">
        {role}
      </span>
    )
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      {role}
    </span>
  )
}

function QualityBadge({ passed, testId }: { passed: boolean; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm flex items-center gap-1 border ${
        passed
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
          : 'bg-red-950/60 text-red-400 border-red-800/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {passed ? 'PASS' : 'FAIL'}
    </span>
  )
}

function AgentAvatar({ name, role }: { name?: string; role?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'A'
  const c = role ? ROLE_COLORS[role] : undefined
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold border
        ${c ? `${c.bg} ${c.text} ${c.border}` : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
    >
      {initial}
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-corthex-accent/20 border border-corthex-accent/40 flex items-center justify-center flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-corthex-accent-dark">
        <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  return (
    <div
      data-testid="message-empty-state"
      className="flex-1 flex flex-col items-center justify-center p-6 gap-6"
    >
      {/* Wordmark */}
      <div className="text-center">
        <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest mb-2">Command Center</p>
        <h2 className="text-zinc-200 text-lg font-semibold">What shall we tackle today?</h2>
        <p className="text-zinc-500 text-sm mt-1">Use {'/'} for commands, {'@'} to address a specific agent</p>
      </div>

      {/* Example tiles */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        {EXAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd.text}
            data-testid="example-command"
            onClick={() => onExampleClick(cmd.text)}
            className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 transition-all text-left"
          >
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-zinc-500 group-hover:text-zinc-300">
                <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-0.5">{cmd.label}</p>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-snug transition-colors">{cmd.text}</p>
            </div>
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
        className="flex-1 p-4 space-y-4 overflow-hidden"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded" />
              <div className="h-10 bg-zinc-900 rounded-lg" />
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
        data-testid="message-list"
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
        onScroll={handleScroll}
      >
        {messages.map((msg) => {
          if (msg.role === 'user') {
            const isSelected = selectedCommandId === msg.commandId
            return (
              <div
                key={msg.id}
                data-testid="message-item-user"
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
                className={`group flex gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-corthex-accent/10 border border-corthex-accent/30'
                    : 'hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                <UserAvatar />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-zinc-300">You</span>
                    {msg.createdAt && (
                      <span className="text-[10px] text-zinc-600">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">{msg.text}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-corthex-accent-dark">
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            )
          }

          if (msg.role === 'agent') {
            const isSelected = selectedCommandId === msg.commandId
            return (
              <div
                key={msg.id}
                data-testid="message-item-agent"
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
                className={`group flex gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-corthex-accent/10 border border-corthex-accent/30'
                    : 'hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                <AgentAvatar name={msg.agentName} role={msg.agentRole} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-zinc-200">
                      @{msg.agentName || 'Agent'}
                    </span>
                    {msg.agentRole && <RoleBadge role={msg.agentRole} />}
                    {msg.quality && (
                      <QualityBadge
                        passed={msg.quality.passed}
                        testId="quality-badge"
                      />
                    )}
                    {msg.createdAt && (
                      <span className="text-[10px] text-zinc-600">{formatTime(msg.createdAt)}</span>
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
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {msg.text || (msg.result ? msg.result.slice(0, 150) + '…' : '')}
                    </p>
                  )}
                </div>
              </div>
            )
          }

          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center py-1">
                <div
                  data-testid="command-error"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-red-400 flex-shrink-0">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6 4v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
                  </svg>
                  <p className="text-xs text-red-400">{msg.text}</p>
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
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-zinc-400">
            <path d="M6 2v8M6 10l-3-3M6 10l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { EXAMPLE_COMMANDS }
