import { cn } from '@corthex/ui'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { DebateResult, ConsensusResult } from '@corthex/shared'

const CONSENSUS_STYLES: Record<ConsensusResult, { bg: string; border: string; iconColor: string; label: string }> = {
  consensus: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    label: '합의 도달',
  },
  dissent: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    label: '합의 실패 (이견)',
  },
  partial: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    label: '부분 합의',
  },
}

const CONSENSUS_ICONS: Record<ConsensusResult, typeof CheckCircle2> = {
  consensus: CheckCircle2,
  dissent: XCircle,
  partial: AlertTriangle,
}

export function ConsensusCard({ result }: { result: DebateResult }) {
  const style = CONSENSUS_STYLES[result.consensus]
  const Icon = CONSENSUS_ICONS[result.consensus]

  return (
    <div data-testid="consensus-card" className={cn('rounded-xl border p-4 space-y-3', style.bg, style.border)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className={cn('w-5 h-5', style.iconColor)} />
        <h3 className="text-sm font-bold text-slate-100">{style.label}</h3>
        <span className="text-[10px] text-slate-400 font-mono ml-auto">{result.roundCount}R</span>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>

      {/* Positions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">다수 의견</p>
          <p className="text-xs text-slate-400">{result.majorityPosition}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">소수 의견</p>
          <p className="text-xs text-slate-400">{result.minorityPosition}</p>
        </div>
      </div>

      {/* Key arguments */}
      {result.keyArguments.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">핵심 논점</p>
          <ul className="space-y-1">
            {result.keyArguments.map((arg, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                <span className="text-slate-500 shrink-0">•</span>
                <span>{arg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
