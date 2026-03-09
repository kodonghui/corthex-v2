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
  { text: 'Give instructions to your AI team (e.g., "Analyze our Q3 sales data and create a presentation")...', desc: '' },
]

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    MANAGER: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    CONTENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ANALYST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    DESIGNER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${styles[role] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
      {role}
    </span>
  )
}

function QualityBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
        passed
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {passed ? 'PASS' : 'FAIL'}
    </span>
  )
}

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  return (
    <div data-testid="message-empty-state" className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => onExampleClick(EXAMPLE_COMMANDS[0].text)}
          className="w-full text-left p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{EXAMPLE_COMMANDS[0].text}</p>
        </button>
      </div>
    </div>
  )
}

function AgentAvatar({ name, role }: { name?: string; role?: string }) {
  // Generate avatar based on role or name
  const avatarColors: Record<string, string> = {
    MANAGER: 'bg-violet-100 dark:bg-violet-900/30',
    CONTENT: 'bg-amber-100 dark:bg-amber-900/30',
    ANALYST: 'bg-blue-100 dark:bg-blue-900/30',
    DESIGNER: 'bg-emerald-100 dark:bg-emerald-900/30',
  }
  
  const initial = name?.charAt(0) || 'A'
  const bgColor = role ? avatarColors[role] || 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-100 dark:bg-zinc-800'
  
  return (
    <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{initial}</span>
    </div>
  )
}

export function MessageThread({ messages, isLoading, onReportClick, onExampleClick, selectedCommandId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // Auto-scroll to bottom on new messages
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
      <div data-testid="message-loading-skeleton" className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
              <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (messages.length === 0) {
    return <EmptyState onExampleClick={onExampleClick || (() => {})} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Message thread</h2>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="13" cy="8" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        data-testid="message-list"
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' && (
              <div
                data-testid="message-item-user"
                className={`flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedCommandId === msg.commandId
                    ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
              >
                <AgentAvatar name="User" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{msg.text}</p>
                </div>
              </div>
            )}

            {msg.role === 'agent' && (
              <div
                data-testid="message-item-agent"
                className={`flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedCommandId === msg.commandId
                    ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
              >
                <AgentAvatar name={msg.agentName} role={msg.agentRole} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      @{msg.agentName || 'Agent'}
                    </span>
                    {msg.agentRole && <RoleBadge role={msg.agentRole} />}
                    {msg.quality && <QualityBadge passed={msg.quality.passed} />}
                  </div>

                  {/* Sketch loading card */}
                  {msg.sketchLoading && <SketchLoadingCard />}

                  {/* Sketch preview card */}
                  {msg.sketchResult && !msg.sketchLoading && (
                    <ReactFlowProvider>
                      <SketchPreviewCard
                        mermaid={msg.sketchResult.mermaid}
                        description={msg.sketchResult.description}
                        commandId={msg.commandId || ''}
                      />
                    </ReactFlowProvider>
                  )}

                  {/* Regular message */}
                  {!msg.sketchResult && !msg.sketchLoading && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{msg.text || msg.result?.slice(0, 150) + '...'}</p>
                  )}
                </div>
              </div>
            )}

            {msg.role === 'system' && (
              <div className="flex justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{msg.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 z-40 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Scroll to bottom"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M7 12l-4-4M7 12l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { EXAMPLE_COMMANDS }
