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
      className="relative pl-6 border-l border-stone-200 pb-2"
    >
      {chain.length > 0 ? (
        chain.map((entry, i) => {
          const isLast = i === chain.length - 1
          const isDelegating = entry.status === 'delegating'
          const isCompleted = entry.status === 'completed'
          const isFailed = entry.status === 'failed'

          return (
            <div key={`${entry.toAgentId}-${i}`} className={`${isLast ? '' : 'mb-6'} relative`}>
              {/* Timeline dot */}
              <div className="absolute -left-[31px] bg-white p-1 rounded-full">
                <div
                  className={`size-3 rounded-full border-2 border-slate-900 ${
                    isDelegating
                      ? 'bg-[#5a7247] shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : isCompleted
                        ? 'bg-slate-600'
                        : isFailed
                          ? 'bg-red-500'
                          : 'bg-slate-600'
                  }`}
                />
              </div>
              {/* Agent info */}
              {i === 0 && (
                <div className="mb-6 relative">
                  <div className="absolute -left-[31px] bg-white p-1 rounded-full">
                    <div className="size-3 rounded-full bg-slate-600 border-2 border-slate-900" />
                  </div>
                  <p className="text-xs font-bold text-stone-600">{entry.fromAgent}</p>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">Completed</p>
                </div>
              )}
              <p className={`text-xs font-bold ${
                isDelegating ? 'text-slate-50' : isFailed ? 'text-red-400' : 'text-stone-400'
              }`}>
                {entry.toAgent}
              </p>
              <p className={`text-[10px] font-mono mt-0.5 ${
                isDelegating ? 'text-[#5a7247]' : isFailed ? 'text-red-400' : 'text-stone-400'
              }`}>
                {isDelegating ? 'Processing...' : isCompleted ? 'Completed' : 'Failed'}
              </p>
            </div>
          )
        })
      ) : processingAgent ? (
        <div className="relative">
          <div className="absolute -left-[31px] bg-white p-1 rounded-full">
            <div className="size-3 rounded-full bg-[#5a7247] border-2 border-slate-900 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </div>
          <p className="text-xs font-bold text-slate-50">{processingAgent}</p>
          <p className="text-[10px] text-[#5a7247] font-mono mt-0.5">Processing...</p>
        </div>
      ) : null}
    </div>
  )
}
