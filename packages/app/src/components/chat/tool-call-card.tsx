import { useState } from 'react'
import type { ToolCall } from '../../hooks/use-chat-stream'

export function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const isRunning = tool.status === 'running'

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 my-2">
      <button
        onClick={() => !isRunning && setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs"
        disabled={isRunning}
      >
        <span className="flex items-center gap-2">
          {isRunning ? (
            <span className="animate-pulse">⏳</span>
          ) : (
            <span>✅</span>
          )}
          <span className="font-medium">{tool.toolName}</span>
          {isRunning && <span className="text-zinc-400 animate-pulse">실행 중...</span>}
        </span>
        {!isRunning && (
          <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
        )}
      </button>
      {expanded && tool.result && (
        <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <pre className="text-[11px] text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap break-all">
            {tool.result.length > 300 ? tool.result.slice(0, 300) + '...' : tool.result}
          </pre>
        </div>
      )}
    </div>
  )
}
