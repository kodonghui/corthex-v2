import { useState } from 'react'
import { cn } from '@corthex/ui'

type SpeechCardProps = {
  agentName: string
  agentId: string
  content: string
  position: string
  roundNum: number
  isLive?: boolean
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-red-500/20 text-red-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-pink-500/20 text-pink-400',
  'bg-orange-500/20 text-orange-400',
]

function getAvatarColor(agentId: string): string {
  let hash = 0
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const COLLAPSE_THRESHOLD = 200

export function SpeechCard({ agentName, agentId, content, position, roundNum, isLive }: SpeechCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > COLLAPSE_THRESHOLD
  const displayContent = isLong && !expanded ? content.slice(0, COLLAPSE_THRESHOLD) + '...' : content

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
          getAvatarColor(agentId),
        )}
      >
        {agentName[0]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{agentName}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">R{roundNum}</span>
          {position && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 dark:text-indigo-300">
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
        <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {displayContent}
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            {expanded ? '접기' : '더 보기'}
          </button>
        )}
      </div>
    </div>
  )
}
