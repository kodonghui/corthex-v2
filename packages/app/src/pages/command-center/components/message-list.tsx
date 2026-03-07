import { useRef, useEffect, useState, useCallback } from 'react'
import { Badge } from '@corthex/ui'
import { MarkdownRenderer } from '../../../components/markdown-renderer'
import type { CommandMessage } from '../../../stores/command-store'

type Props = {
  messages: CommandMessage[]
  isLoading: boolean
  onReportClick: (commandId: string) => void
  onExampleClick?: (text: string) => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function shouldShowDateSeparator(current: string, prev: string | null): boolean {
  if (!prev) return true
  return new Date(current).toDateString() !== new Date(prev).toDateString()
}

const EXAMPLE_COMMANDS = [
  { text: '삼성전자 분석해줘', desc: '투자분석처에 자동 위임' },
  { text: '/전체 시장 전망 보고서', desc: '모든 팀장에게 동시 명령' },
  { text: '@CIO 포트폴리오 리밸런싱', desc: '특정 팀장에게 직접 지시' },
]

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
        <span className="text-3xl">🎖️</span>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        사령관실에 오신 것을 환영합니다
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
        명령을 입력하면 AI 조직이 자동으로 분석하고 보고합니다.
        @로 특정 팀장을 지정하거나 /로 특수 명령을 사용할 수 있습니다.
      </p>
      <div className="space-y-2 w-full max-w-sm">
        {EXAMPLE_COMMANDS.map((ex) => (
          <button
            key={ex.text}
            onClick={() => onExampleClick(ex.text)}
            className="w-full text-left p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ex.text}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{ex.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MessageList({ messages, isLoading, onReportClick, onExampleClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Show/hide scroll-to-bottom button
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
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" style={{ width: `${40 + Math.random() * 30}%` }} />
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
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
      onScroll={handleScroll}
    >
      {messages.map((msg, idx) => {
        const prevDate = idx > 0 ? messages[idx - 1].createdAt : null
        const showDate = shouldShowDateSeparator(msg.createdAt, prevDate)

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            )}

            {msg.role === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md">
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 text-right">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            )}

            {msg.role === 'agent' && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                      AI
                    </div>
                    {msg.agentName && (
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{msg.agentName}</span>
                    )}
                    {msg.quality && (
                      <Badge className={msg.quality.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        {msg.quality.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    {msg.result ? (
                      <button
                        onClick={() => msg.commandId && onReportClick(msg.commandId)}
                        className="text-left w-full"
                      >
                        <div className="line-clamp-4">
                          <MarkdownRenderer content={msg.result.slice(0, 500)} />
                        </div>
                        {msg.result.length > 500 && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">전체 보고서 보기 →</p>
                        )}
                      </button>
                    ) : (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">{formatTime(msg.createdAt)}</p>
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
        )
      })}

      <div ref={bottomRef} />

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-2 ml-auto mr-4 z-40 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          aria-label="맨 아래로 이동"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M8 13L3 8M8 13L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { EXAMPLE_COMMANDS }
