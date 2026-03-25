import { useRef, useEffect, useState, useCallback, memo, lazy, Suspense } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { SketchLoadingCard } from './sketch-preview-card'
import type { CommandMessage } from '../../../stores/command-store'

const LazySketchPreviewCard = lazy(() =>
  import('./sketch-preview-card').then((mod) => ({ default: mod.SketchPreviewCard }))
)

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
  { text: '오늘 주요 뉴스 브리핑해줘', label: '뉴스 브리핑', icon: 'news', color: 'blue' },
  { text: '마케팅 전략 보고서 작성해줘', label: '보고서 작성', icon: 'report', color: 'amber' },
  { text: '이번 달 SNS 성과 분석해줘', label: '성과 분석', icon: 'chart', color: 'emerald' },
] as const

const EXAMPLE_ICON_COLORS: Record<string, { iconBg: string; iconText: string; hoverBg: string }> = {
  blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', hoverBg: 'group-hover:bg-blue-500/20' },
  amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', hoverBg: 'group-hover:bg-amber-500/20' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', hoverBg: 'group-hover:bg-emerald-500/20' },
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  MANAGER: { bg: 'bg-violet-950', text: 'text-violet-300', border: 'border-violet-800', gradient: 'from-violet-600/20' },
  CONTENT: { bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-800', gradient: 'from-amber-600/20' },
  ANALYST: { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800', gradient: 'from-blue-600/20' },
  DESIGNER: { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-800', gradient: 'from-emerald-600/20' },
}

const AgentAvatar = memo(function AgentAvatar({ name, role }: { name?: string; role?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || 'A'
  const c = role ? ROLE_COLORS[role] : undefined
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border
        ${c ? `${c.bg} ${c.text} ${c.border}` : 'bg-corthex-elevated text-corthex-text-secondary border-corthex-border'}`}
      aria-label={`Agent ${name || 'unknown'}`}
    >
      {initial}
    </div>
  )
})

const UserAvatar = memo(function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-xl bg-corthex-accent flex items-center justify-center shrink-0" aria-label="User">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
        <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  )
})

const EmptyState = memo(function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      {/* Gradient icon container */}
      <div className="w-16 h-16 rounded-2xl bg-corthex-elevated border border-corthex-border flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-corthex-text-primary mb-1">아직 명령이 없습니다</p>
      <p className="text-xs text-corthex-text-secondary mb-5">아래 예시를 클릭하거나 직접 명령을 입력하세요</p>

      {/* Example command cards */}
      <div className="grid grid-cols-1 gap-2.5 w-full max-w-xs">
        {EXAMPLE_COMMANDS.map((cmd) => {
          const colors = EXAMPLE_ICON_COLORS[cmd.color]
          return (
            <button
              key={cmd.text}
              data-testid="example-command"
              onClick={() => onExampleClick(cmd.text)}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-corthex-elevated border border-corthex-border hover:border-corthex-accent/30 hover:bg-corthex-elevated text-left transition-all duration-200 group cursor-pointer focus-visible:ring-2 focus-visible:ring-corthex-accent/50 focus-visible:outline-none"
            >
              <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center shrink-0 ${colors.hoverBg} transition-colors`}>
                <svg className={`w-4 h-4 ${colors.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-corthex-text-secondary group-hover:text-corthex-accent transition-colors">{cmd.label}</p>
                <p className="text-xs text-corthex-text-secondary mt-0.5 truncate">{cmd.text}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-corthex-text-secondary group-hover:text-corthex-accent transition-colors shrink-0" fill="none" viewBox="0 0 12 12">
                <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
})

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
        aria-busy={true}
        className="space-y-4 px-4 py-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-corthex-elevated animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="bg-corthex-elevated animate-pulse rounded h-3 w-24" />
              <div className="bg-corthex-border/30 animate-pulse rounded h-3 w-full" />
              <div className="bg-corthex-border/30 animate-pulse rounded h-3 w-3/4" />
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
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-corthex-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-corthex-accent/80">대화 기록</span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-corthex-accent/10 text-corthex-accent border border-corthex-accent/20">
            {messages.length}
          </span>
        </div>
      </div>

      {/* Scroll area */}
      <div
        data-testid="message-thread"
        ref={containerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
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
                className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 transition-all duration-200 hover:bg-corthex-elevated/50 ${
                  isSelected ? 'ring-1 ring-corthex-accent/40 bg-corthex-accent/5' : ''
                }`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' && msg.commandId) onReportClick(msg.commandId) }}
              >
                <UserAvatar />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">You</span>
                    {msg.createdAt && (
                      <span className="text-xs text-corthex-text-secondary font-mono">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-corthex-text-secondary mt-1">{msg.text}</p>
                </div>
                {isSelected && (
                  <div className="shrink-0 mt-1">
                    <svg className="w-4 h-4 text-corthex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
                data-testid={`msg-agent-${msg.commandId || msg.id}`}
                onClick={() => msg.commandId && onReportClick(msg.commandId)}
                className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 transition-all duration-200 hover:bg-corthex-elevated/50 ${
                  isSelected ? 'ring-1 ring-corthex-accent/40 bg-corthex-accent/5' : ''
                }`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' && msg.commandId) onReportClick(msg.commandId) }}
              >
                <AgentAvatar name={msg.agentName} role={msg.agentRole} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {msg.agentName || 'Agent'}
                    </span>
                    {msg.agentRole && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-corthex-elevated text-corthex-text-secondary border border-corthex-border/40">
                        {msg.agentRole}
                      </span>
                    )}
                    {msg.quality && (
                      <span
                        data-testid={`quality-badge-${msg.commandId}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
                          msg.quality.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${msg.quality.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {msg.quality.passed ? 'PASS' : 'FAIL'}{msg.quality.score != null ? ` ${msg.quality.score}` : ''}
                      </span>
                    )}
                    {msg.createdAt && (
                      <span className="text-xs text-corthex-text-secondary font-mono">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>

                  {msg.sketchLoading && <SketchLoadingCard />}

                  {msg.sketchResult && !msg.sketchLoading && (
                    <ReactFlowProvider>
                      <Suspense fallback={<SketchLoadingCard />}>
                        <LazySketchPreviewCard
                          mermaid={msg.sketchResult.mermaid}
                          description={msg.sketchResult.description}
                          commandId={msg.commandId || ''}
                        />
                      </Suspense>
                    </ReactFlowProvider>
                  )}

                  {!msg.sketchResult && !msg.sketchLoading && (
                    <p className="text-sm text-corthex-text-secondary mt-1.5 leading-relaxed">
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
                <div className="bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-2.5 flex items-center gap-2.5 backdrop-blur-sm">
                  <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-red-400">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M8 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <circle cx="8" cy="11" r="0.5" fill="currentColor" />
                    </svg>
                  </div>
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
          className="absolute bottom-4 right-4 bg-corthex-elevated hover:bg-corthex-border text-corthex-text-secondary rounded-xl p-2.5 shadow-lg border border-corthex-border hover:border-corthex-border-strong transition-all z-10 cursor-pointer"
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
