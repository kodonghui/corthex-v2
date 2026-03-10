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
    : 'border-slate-700/50'

  return (
    <div data-testid={`tool-call-${tool.toolId}`} className={`bg-slate-900/50 border ${borderColor} rounded-lg p-2.5 mt-2`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${isRunning ? 'animate-pulse' : ''}`}>{icon}</span>
        <span className="text-xs font-mono text-slate-300">{tool.toolName}</span>
        {label && (
          <span className={`text-xs ${isRunning ? 'text-slate-500 animate-pulse' : isError ? 'text-red-400' : 'text-slate-500'}`}>
            {label}
          </span>
        )}
        {!isRunning && tool.durationMs != null && (
          <span className="text-xs text-slate-600 ml-auto">{formatDuration(tool.durationMs)}</span>
        )}
      </div>
      {!isRunning && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors"
        >
          {expanded ? '접기' : '상세 보기'}
        </button>
      )}
      {isRunning && tool.progressText && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono">{tool.progressText.length > 500 ? tool.progressText.slice(-500) : tool.progressText}</p>
      )}
      {expanded && (
        <div className="mt-2 space-y-2">
          {tool.input && (
            <pre className="text-xs text-slate-500 bg-slate-900 rounded p-2 max-h-20 overflow-y-auto font-mono">
              {tool.input.length > 300 ? tool.input.slice(0, 300) + '...' : tool.input}
            </pre>
          )}
          {tool.result && (
            <pre className={`text-xs bg-slate-900 rounded p-2 max-h-20 overflow-y-auto font-mono ${isError ? 'text-red-400' : 'text-slate-400'}`}>
              {tool.result.length > 300 ? tool.result.slice(0, 300) + '...' : tool.result}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
