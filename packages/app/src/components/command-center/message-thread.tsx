import { useRef, useEffect } from 'react'
import { cn } from '@corthex/ui'
import { QualityIndicator } from './quality-badge'
import { DelegationPipeline } from './delegation-pipeline'
import type { Message, Deliverable } from './types'

type DeliverableChipProps = {
  deliverable: Deliverable
  onClick: (d: Deliverable) => void
}

function DeliverableChip({ deliverable, onClick }: DeliverableChipProps) {
  const icons: Record<Deliverable['type'], string> = {
    report: 'file-text',
    file: 'file',
    link: 'external-link',
    code: 'code',
    data: 'database',
  }

  return (
    <button
      onClick={() => onClick(deliverable)}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
    >
      <span className="text-xs">[{deliverable.type}]</span>
      <span className="truncate max-w-[150px]">{deliverable.title}</span>
    </button>
  )
}

type MessageBubbleProps = {
  message: Message
  onDeliverableClick: (d: Deliverable) => void
}

function MessageBubble({ message, onDeliverableClick }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1 max-w-[85%]', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}>
      {/* Delegation pipeline for assistant */}
      {!isUser && message.delegationSteps && message.delegationSteps.length > 0 && (
        <DelegationPipeline steps={message.delegationSteps} className="mb-1" />
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md'
        )}
      >
        {message.content}
      </div>

      {/* Quality indicator for assistant */}
      {!isUser && (message.qualityGrade || message.cost !== undefined || message.durationMs !== undefined) && (
        <QualityIndicator
          grade={message.qualityGrade}
          cost={message.cost}
          durationMs={message.durationMs}
          className="mt-1"
        />
      )}

      {/* Deliverables */}
      {!isUser && message.deliverables && message.deliverables.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {message.deliverables.map(d => (
            <DeliverableChip key={d.id} deliverable={d} onClick={onDeliverableClick} />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-[10px] text-zinc-400 mt-0.5">
        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  )
}

type MessageThreadProps = {
  messages: Message[]
  isStreaming?: boolean
  streamingContent?: string
  onDeliverableClick: (d: Deliverable) => void
  className?: string
}

export function MessageThread({
  messages,
  isStreaming = false,
  streamingContent = '',
  onDeliverableClick,
  className,
}: MessageThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <div className="text-center text-zinc-400">
          <p className="text-3xl mb-2">[Command]</p>
          <p className="text-sm">새로운 지시를 입력하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex-1 overflow-y-auto px-4 py-4 space-y-4', className)}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} onDeliverableClick={onDeliverableClick} />
      ))}

      {/* Streaming message */}
      {isStreaming && streamingContent && (
        <div className="flex flex-col gap-1 max-w-[85%] mr-auto items-start">
          <div className="px-4 py-3 rounded-2xl rounded-bl-md text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
            {streamingContent}
            <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* Streaming indicator without content */}
      {isStreaming && !streamingContent && (
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs">처리 중...</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
