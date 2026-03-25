import { useState } from 'react'
import { ChevronDown, ChevronRight, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { HandoffEntry } from '../../hooks/use-hub-stream'

// ── Status styling ──

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof Clock; label: string }> = {
  delegating: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Loader2, label: 'In Progress' },
  pending: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Pending' },
  completed: { color: 'text-corthex-accent', bg: 'bg-corthex-accent/5', border: 'border-corthex-accent/20', icon: CheckCircle2, label: 'Completed' },
  failed: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, label: 'Failed' },
}

const STATUS_DOT_COLORS: Record<string, string> = {
  delegating: 'bg-blue-500',
  pending: 'bg-amber-500',
  completed: 'bg-corthex-accent',
  failed: 'bg-red-500',
}

function formatDuration(ms?: number): string {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  const secs = (ms / 1000).toFixed(1)
  return `${secs}s`
}

// ── Timeline Entry ──

function HandoffTimelineEntry({
  entry,
  index,
  isLast,
}: {
  entry: HandoffEntry
  index: number
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-slate-400'
  const StatusIcon = status.icon
  const isAnimated = entry.status === 'delegating'

  return (
    <div className="relative" data-testid="handoff-entry">
      {/* Timeline connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-[28px] bottom-0 w-0.5 bg-corthex-border" />
      )}

      <div className="flex gap-3">
        {/* Timeline dot */}
        <div className="relative flex-shrink-0 mt-1.5">
          <div className={`w-[22px] h-[22px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${dotColor} ${isAnimated ? 'animate-pulse' : ''}`}>
            {isAnimated && (
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 mb-4 rounded-xl border ${status.border} ${status.bg} transition-all`}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-corthex-accent-deep">
                <span className="truncate max-w-[120px]">{entry.fromAgent}</span>
                <ArrowRight className="w-3.5 h-3.5 text-corthex-text-secondary flex-shrink-0" />
                <span className="truncate max-w-[120px]">{entry.toAgent}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color} ${status.bg} border ${status.border}`}>
                <StatusIcon className={`w-3 h-3 ${isAnimated ? 'animate-spin' : ''}`} />
                {status.label}
              </span>
              {expanded ? <ChevronDown className="w-4 h-4 text-corthex-text-secondary" /> : <ChevronRight className="w-4 h-4 text-corthex-text-secondary" />}
            </div>
          </button>

          {expanded && (
            <div className="px-4 pb-3 border-t border-corthex-border/50">
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div>
                  <span className="text-corthex-text-secondary font-medium">From</span>
                  <p className="text-corthex-accent-deep font-semibold mt-0.5">{entry.fromAgent}</p>
                </div>
                <div>
                  <span className="text-corthex-text-secondary font-medium">To</span>
                  <p className="text-corthex-accent-deep font-semibold mt-0.5">{entry.toAgent}</p>
                </div>
                <div>
                  <span className="text-corthex-text-secondary font-medium">Duration</span>
                  <p className="text-corthex-accent-deep font-mono mt-0.5">{formatDuration(entry.durationMs)}</p>
                </div>
                {entry.depth !== undefined && (
                  <div>
                    <span className="text-corthex-text-secondary font-medium">Depth</span>
                    <p className="text-corthex-accent-deep font-mono mt-0.5">Level {entry.depth}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──

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
      className="relative py-2"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-corthex-accent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-corthex-text-secondary">
          Handoff Timeline
        </span>
        {chain.some(e => e.status === 'delegating') && (
          <span className="ml-auto text-[10px] text-blue-600 font-medium flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Live
          </span>
        )}
      </div>

      {/* Timeline entries */}
      {chain.length > 0 ? (
        chain.map((entry, i) => (
          <HandoffTimelineEntry
            key={`${entry.toAgentId}-${i}`}
            entry={entry}
            index={i}
            isLast={i === chain.length - 1 && !processingAgent}
          />
        ))
      ) : null}

      {/* Currently processing agent (no chain yet) */}
      {processingAgent && chain.every(e => e.toAgent !== processingAgent) && (
        <div className="relative">
          <div className="flex gap-3">
            <div className="relative flex-shrink-0 mt-1.5">
              <div className="w-[22px] h-[22px] rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-blue-500 animate-pulse">
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
              </div>
            </div>
            <div className="flex-1 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-corthex-accent-deep">{processingAgent}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
