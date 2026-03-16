import { useState } from 'react'
import { cn } from '@corthex/ui'

type SpeechCardProps = {
  agentName: string
  agentId: string
  content: string
  position: string
  roundNum: number
  index?: number
  isLive?: boolean
}

const AGENT_THEMES = [
  { avatar: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30', bubble: 'bg-slate-800 border-slate-700', bubbleRadius: 'rounded-2xl rounded-tl-sm' },
  { avatar: 'bg-violet-500/20 text-violet-400 border-violet-500/30', bubble: 'bg-violet-500/10 border-violet-500/20', bubbleRadius: 'rounded-2xl rounded-tr-sm' },
  { avatar: 'bg-amber-500/20 text-amber-400 border-amber-500/30', bubble: 'bg-amber-500/10 border-amber-500/20', bubbleRadius: 'rounded-2xl rounded-tr-sm' },
  { avatar: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bubble: 'bg-emerald-500/10 border-emerald-500/20', bubbleRadius: 'rounded-2xl rounded-tl-sm' },
  { avatar: 'bg-pink-500/20 text-pink-400 border-pink-500/30', bubble: 'bg-pink-500/10 border-pink-500/20', bubbleRadius: 'rounded-2xl rounded-tl-sm' },
  { avatar: 'bg-blue-500/20 text-blue-400 border-blue-500/30', bubble: 'bg-blue-500/10 border-blue-500/20', bubbleRadius: 'rounded-2xl rounded-tr-sm' },
  { avatar: 'bg-orange-500/20 text-orange-400 border-orange-500/30', bubble: 'bg-orange-500/10 border-orange-500/20', bubbleRadius: 'rounded-2xl rounded-tl-sm' },
  { avatar: 'bg-red-500/20 text-red-400 border-red-500/30', bubble: 'bg-red-500/10 border-red-500/20', bubbleRadius: 'rounded-2xl rounded-tr-sm' },
]

function getTheme(agentId: string) {
  let hash = 0
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0
  }
  return AGENT_THEMES[Math.abs(hash) % AGENT_THEMES.length]
}

const COLLAPSE_THRESHOLD = 200

export function SpeechCard({ agentName, agentId, content, position, roundNum, index, isLive }: SpeechCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > COLLAPSE_THRESHOLD
  const displayContent = isLong && !expanded ? content.slice(0, COLLAPSE_THRESHOLD) + '...' : content

  const theme = getTheme(agentId)
  // Alternate sides: even = left, odd = right
  const isRight = (index ?? 0) % 2 === 1

  return (
    <div
      data-testid={index !== undefined ? `speech-card-${index}` : undefined}
      className={cn(
        'flex items-start gap-4 max-w-[80%]',
        isRight && 'ml-auto flex-row-reverse',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'rounded-full w-10 h-10 shrink-0 flex items-center justify-center text-sm font-bold border',
          theme.avatar,
        )}
      >
        {agentName[0]}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1', isRight ? 'items-end' : 'items-start')}>
        <div className={cn('flex items-center gap-2', isRight && 'flex-row-reverse')}>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{agentName}</p>
          <span className="text-slate-600 text-[10px] font-mono">R{roundNum}</span>
          {position && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
              {position}
            </span>
          )}
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              발언 중
            </span>
          )}
        </div>
        <div className={cn(
          'text-sm font-normal leading-relaxed px-5 py-3 text-slate-100 border',
          theme.bubble,
          theme.bubbleRadius,
        )}>
          <span className="whitespace-pre-wrap">{displayContent}</span>
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {expanded ? '접기' : '더 보기'}
          </button>
        )}
      </div>
    </div>
  )
}
