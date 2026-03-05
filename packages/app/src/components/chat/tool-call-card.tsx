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
    ? 'border-red-300 dark:border-red-700'
    : 'border-zinc-200 dark:border-zinc-700'

  return (
    <div className={`border ${borderColor} rounded-lg p-3 my-2`}>
      <button
        onClick={() => !isRunning && setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs"
        disabled={isRunning}
      >
        <span className="flex items-center gap-2">
          <span className={isRunning ? 'animate-pulse' : ''}>{icon}</span>
          <span className="font-medium">{tool.toolName}</span>
          {label && (
            <span className={`${isRunning ? 'text-zinc-400 animate-pulse' : isError ? 'text-red-500' : 'text-zinc-400'}`}>
              {label}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {!isRunning && tool.durationMs != null && (
            <span className="text-zinc-400">({formatDuration(tool.durationMs)})</span>
          )}
          {!isRunning && (
            <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
          )}
        </span>
      </button>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-1">
          {tool.input && (
            <div>
              <p className="text-[10px] font-medium text-zinc-400 mb-0.5">📥 요청</p>
              <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap break-all">
                {tool.input.length > 300 ? tool.input.slice(0, 300) + '...' : tool.input}
              </pre>
            </div>
          )}
          {tool.result && (
            <div>
              <p className="text-[10px] font-medium text-zinc-400 mb-0.5">{isError ? '📤 오류' : '📤 결과'}</p>
              <pre className={`text-[11px] whitespace-pre-wrap break-all ${isError ? 'text-red-500 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {tool.result.length > 300 ? tool.result.slice(0, 300) + '...' : tool.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
