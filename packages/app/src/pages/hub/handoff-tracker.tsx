import type { HandoffEntry } from '../../hooks/use-hub-stream'

export function HandoffTracker({
  chain,
  processingAgent,
}: {
  chain: HandoffEntry[]
  processingAgent: string | null
}) {
  if (chain.length === 0 && !processingAgent) return null

  return (
    <div
      data-testid="handoff-tracker"
      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/60 border-b border-slate-700/50"
    >
      <span className="text-xs text-slate-500 shrink-0 mr-1">위임:</span>
      <div className="flex items-center gap-1 flex-wrap">
        {chain.length > 0 ? (
          chain.map((entry, i) => (
            <span key={`${entry.toAgentId}-${i}`} className="flex items-center gap-1">
              {i === 0 && (
                <span className="text-xs font-medium text-slate-300">
                  {entry.fromAgent}
                </span>
              )}
              <svg
                className="w-3 h-3 text-slate-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
                  entry.status === 'delegating'
                    ? 'text-blue-400 bg-blue-500/10'
                    : entry.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-red-400 bg-red-500/10'
                }`}
              >
                {entry.status === 'delegating' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
                {entry.status === 'completed' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                {entry.status === 'failed' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
                {entry.toAgent}
              </span>
            </span>
          ))
        ) : processingAgent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {processingAgent} 분석 중...
          </span>
        ) : null}
      </div>
    </div>
  )
}
