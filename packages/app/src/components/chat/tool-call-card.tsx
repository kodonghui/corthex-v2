import { useState } from 'react'
import type { ToolCall } from '../../hooks/use-chat-stream'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}초`
}

export function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const isRunning = tool.status === 'running'
  const isError = tool.error || (tool.status === 'done' && tool.result?.startsWith('[오류]'))
  const isTimeout = tool.result?.includes('시간이 초과')

  const icon = isRunning ? '⏳' : isTimeout ? '⏱' : isError ? '❌' : '✅'
  const label = isRunning
    ? '실행 중...'
    : isTimeout
      ? '시간 초과'
      : isError
        ? '실패'
        : null

  const borderColor = isError || isTimeout
    ? 'border-red-900/50'
    : 'border-stone-200/50'

  return (
    <div data-testid={`tool-call-${tool.toolId}`} className={`bg-corthex-surface/50 border ${borderColor} rounded-lg p-2.5 mt-2`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${isRunning ? 'animate-pulse' : ''}`}>{icon}</span>
        <span className="text-xs font-mono text-stone-600">{tool.toolName}</span>
        {label && (
          <span className={`text-xs ${isRunning ? 'text-stone-400 animate-pulse' : isError ? 'text-red-400' : 'text-stone-400'}`}>
            {label}
          </span>
        )}
        {!isRunning && tool.durationMs != null && (
          <span className="text-xs text-corthex-text-secondary ml-auto">{formatDuration(tool.durationMs)}</span>
        )}
      </div>
      {!isRunning && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-stone-400 hover:text-stone-600 mt-1 transition-colors"
        >
          {expanded ? '접기' : '상세 보기'}
        </button>
      )}
      {isRunning && tool.progressText && (
        <p className="text-xs text-stone-400 mt-1 line-clamp-2 font-mono">{tool.progressText.length > 500 ? tool.progressText.slice(-500) : tool.progressText}</p>
      )}
      {expanded && (
        <div className="mt-2 space-y-2">
          {tool.input && (
            <pre className="text-xs text-stone-400 bg-corthex-surface rounded p-2 max-h-20 overflow-y-auto font-mono">
              {tool.input.length > 300 ? tool.input.slice(0, 300) + '...' : tool.input}
            </pre>
          )}
          {tool.result && (
            <pre className={`text-xs bg-corthex-surface rounded p-2 max-h-20 overflow-y-auto font-mono ${isError ? 'text-red-400' : 'text-stone-500'}`}>
              {tool.result.length > 300 ? tool.result.slice(0, 300) + '...' : tool.result}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
