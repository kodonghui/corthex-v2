import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import { Bot, User, Copy, Check, Clock } from 'lucide-react'

// ── Types ──

export interface StreamingMessageProps {
  type: 'user' | 'agent'
  content: string
  isStreaming?: boolean
  sender?: string
  avatarUrl?: string
  timestamp?: string | Date
  tokenCount?: number
}

// ── Code block with copy button ──

function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const language = className?.replace('language-', '') || ''

  const handleCopy = useCallback(() => {
    const text = codeRef.current?.textContent || ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-corthex-border" data-testid="code-block">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-corthex-elevated border-b border-corthex-border">
        <span className="text-[10px] font-mono font-medium text-corthex-text-secondary uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-corthex-text-secondary hover:bg-corthex-border transition-colors"
          title="Copy code"
          data-testid="copy-button"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-corthex-accent" />
              <span className="text-corthex-accent">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-3 bg-corthex-bg overflow-x-auto text-sm">
        <code ref={codeRef} className={`font-mono text-[13px] leading-relaxed text-corthex-accent-deep ${className || ''}`}>
          {children}
        </code>
      </pre>
    </div>
  )
}

// ── Streaming cursor ──

function StreamingCursor() {
  return (
    <span
      className="inline-block w-[2px] h-[1.1em] bg-corthex-accent ml-0.5 align-text-bottom animate-[cursor-blink_1s_step-end_infinite]"
      aria-hidden="true"
      data-testid="streaming-cursor"
    />
  )
}

// ── Main component ──

export function StreamingMessage({
  type,
  content,
  isStreaming = false,
  sender,
  avatarUrl,
  timestamp,
  tokenCount,
}: StreamingMessageProps) {
  const isAgent = type === 'agent'
  const displayName = sender || (isAgent ? 'Agent' : 'User')

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div
      className={`flex gap-3 ${isAgent ? 'items-start' : 'items-end flex-row-reverse'}`}
      data-testid="streaming-message"
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isAgent
            ? 'bg-corthex-accent/10 border border-corthex-accent/20'
            : 'bg-corthex-border border border-corthex-border-strong'
        } ${isAgent ? 'mt-6' : 'mb-6'}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-lg object-cover" />
        ) : isAgent ? (
          <Bot className="w-4 h-4 text-corthex-accent" />
        ) : (
          <User className="w-4 h-4 text-corthex-text-secondary" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col gap-1 ${isAgent ? 'items-start' : 'items-end'} max-w-[80%]`}>
        {/* Sender name */}
        <span className="text-xs font-medium text-corthex-text-secondary px-1">{displayName}</span>

        {/* Bubble */}
        <div
          className={`text-[15px] leading-relaxed rounded-2xl px-5 py-3.5 w-full shadow-sm ${
            isAgent
              ? 'rounded-bl-sm bg-corthex-elevated text-corthex-accent-deep border border-corthex-border/50'
              : 'rounded-br-sm bg-corthex-accent/10 text-corthex-accent-deep border border-corthex-accent/15'
          }`}
        >
          {isAgent && content ? (
            <div className="prose prose-sm max-w-none prose-headings:text-corthex-accent-deep prose-p:text-corthex-accent-deep prose-strong:text-corthex-accent-deep prose-code:text-corthex-accent prose-code:bg-corthex-bg prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-a:text-corthex-accent prose-a:underline-offset-2">
              <Markdown
                components={{
                  code: ({ className: cn, children, ...props }) => {
                    const isInline = !cn
                    if (isInline) {
                      return (
                        <code className="text-corthex-accent bg-corthex-bg px-1 py-0.5 rounded text-[13px] font-mono" {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <CodeBlock className={cn}>
                        {children}
                      </CodeBlock>
                    )
                  },
                  pre: ({ children }) => <>{children}</>,
                }}
              >
                {content}
              </Markdown>
              {isStreaming && <StreamingCursor />}
            </div>
          ) : (
            <span className="whitespace-pre-wrap break-words">
              {content}
              {isStreaming && <StreamingCursor />}
            </span>
          )}
        </div>

        {/* Footer: timestamp + token count */}
        {(formattedTime || tokenCount) && !isStreaming && (
          <div className="flex items-center gap-2 px-1 text-[10px] text-corthex-accent-hover">
            {formattedTime && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formattedTime}
              </span>
            )}
            {tokenCount !== undefined && (
              <span className="font-mono">{tokenCount.toLocaleString()} tokens</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
