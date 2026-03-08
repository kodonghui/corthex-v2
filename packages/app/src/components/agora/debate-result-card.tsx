import { useNavigate } from 'react-router-dom'
import { cn } from '@corthex/ui'
import type { DebateResult, ConsensusResult } from '@corthex/shared'

const CONSENSUS_STYLES: Record<ConsensusResult, { bg: string; border: string; badge: string; label: string }> = {
  consensus: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-400',
    label: '합의 도달',
  },
  dissent: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400',
    label: '합의 실패',
  },
  partial: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-400',
    label: '부분 합의',
  },
}

type DebateResultCardProps = {
  debateId: string
  topic: string
  result: DebateResult
}

export function DebateResultCard({ debateId, topic, result }: DebateResultCardProps) {
  const navigate = useNavigate()
  const style = CONSENSUS_STYLES[result.consensus]

  return (
    <div className={cn('rounded-xl border p-3 space-y-2', style.bg, style.border)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" >
          🗣️ 토론 완료
        </span>
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', style.badge)}>
          {style.label}
        </span>
      </div>

      {/* Topic */}
      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{topic}</p>

      {/* Summary */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{result.summary}</p>

      {/* Key Arguments (max 3) */}
      {result.keyArguments.length > 0 && (
        <ul className="space-y-0.5">
          {result.keyArguments.slice(0, 3).map((arg, i) => (
            <li key={i} className="text-[10px] text-zinc-500 flex gap-1.5">
              <span className="shrink-0">•</span>
              <span className="line-clamp-1">{arg}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Action */}
      <button
        onClick={() => navigate(`/agora?debateId=${debateId}`)}
        className="text-[10px] text-indigo-500 hover:text-indigo-400 transition-colors"
      >
        AGORA에서 보기 →
      </button>
    </div>
  )
}
