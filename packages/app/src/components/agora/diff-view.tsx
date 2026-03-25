import { useMemo } from 'react'
import { cn } from '@corthex/ui'
import type { Debate, DebateRound } from '@corthex/shared'

const POSITION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  support: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '찬성' },
  oppose: { bg: 'bg-red-500/20', text: 'text-red-400', label: '반대' },
  neutral: { bg: 'bg-slate-500/20', text: 'text-stone-500', label: '중립' },
  'conditional-support': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '조건부 찬성' },
  'conditional-oppose': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '조건부 반대' },
}

function getPositionStyle(position: string) {
  return POSITION_COLORS[position] ?? { bg: 'bg-slate-500/20', text: 'text-stone-500', label: position }
}

type AgentPositionTrack = {
  agentId: string
  agentName: string
  positions: { roundNum: number; position: string }[]
}

function buildPositionTracks(rounds: DebateRound[]): AgentPositionTrack[] {
  const trackMap = new Map<string, AgentPositionTrack>()

  for (const round of rounds) {
    for (const speech of round.speeches) {
      let track = trackMap.get(speech.agentId)
      if (!track) {
        track = { agentId: speech.agentId, agentName: speech.agentName, positions: [] }
        trackMap.set(speech.agentId, track)
      }
      track.positions.push({ roundNum: round.roundNum, position: speech.position })
    }
  }

  return Array.from(trackMap.values())
}

type PositionDistribution = {
  roundNum: number
  counts: Record<string, number>
  total: number
}

function buildDistribution(rounds: DebateRound[]): PositionDistribution[] {
  return rounds.map((round) => {
    const counts: Record<string, number> = {}
    for (const speech of round.speeches) {
      counts[speech.position] = (counts[speech.position] || 0) + 1
    }
    return { roundNum: round.roundNum, counts, total: round.speeches.length }
  })
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-red-500/20 text-red-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-corthex-accent/20 text-corthex-accent',
  'bg-pink-500/20 text-pink-400',
  'bg-orange-500/20 text-orange-400',
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function DiffView({ debate }: { debate: Debate }) {
  const tracks = useMemo(() => buildPositionTracks(debate.rounds), [debate.rounds])
  const distributions = useMemo(() => buildDistribution(debate.rounds), [debate.rounds])

  if (debate.rounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-stone-500 text-sm">
        토론 데이터가 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Position Change Tracking per Agent */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
          에이전트별 포지션 변화
        </h4>
        <div className="space-y-3">
          {tracks.map((track) => {
            const changed = track.positions.length > 1 &&
              track.positions.some((p, i) => i > 0 && p.position !== track.positions[i - 1].position)
            return (
              <div key={track.agentId} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', getAvatarColor(track.agentId))}>
                    {track.agentName[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-100">{track.agentName}</span>
                  {changed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">변화</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {track.positions.map((pos, idx) => {
                    const style = getPositionStyle(pos.position)
                    const prevChanged = idx > 0 && pos.position !== track.positions[idx - 1].position
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        {idx > 0 && (
                          <span className={cn('text-xs', prevChanged ? 'text-amber-400' : 'text-stone-500')}>
                            →
                          </span>
                        )}
                        <div className={cn('px-2 py-1 rounded-md text-[10px] font-medium', style.bg, style.text,
                          prevChanged && 'ring-1 ring-amber-400/50'
                        )}>
                          R{pos.roundNum}: {style.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2: Position Distribution per Round */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
          라운드별 합의 수렴
        </h4>
        <div className="space-y-2">
          {distributions.map((dist) => (
            <div key={dist.roundNum} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400">Round {dist.roundNum}</span>
                <span className="text-[10px] text-stone-500">{dist.total}명</span>
              </div>
              {/* Stacked bar */}
              <div className="flex h-5 rounded-md overflow-hidden">
                {Object.entries(dist.counts).map(([position, count]) => {
                  const style = getPositionStyle(position)
                  const pct = (count / dist.total) * 100
                  return (
                    <div
                      key={position}
                      className={cn('flex items-center justify-center text-[9px] font-medium', style.bg, style.text)}
                      style={{ width: `${pct}%` }}
                      title={`${style.label}: ${count}명 (${Math.round(pct)}%)`}
                    >
                      {pct >= 20 && `${style.label} ${count}`}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Key Arguments Evolution (if result available) */}
      {debate.result && debate.result.keyArguments.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
            핵심 논점
          </h4>
          <div className="space-y-1.5">
            {debate.result.keyArguments.map((arg, i) => (
              <div key={i} className="flex gap-2 text-xs text-stone-500">
                <span className="text-blue-400 shrink-0 font-mono">{i + 1}.</span>
                <span>{arg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Summary Diff (original topic vs final result) */}
      {debate.result && (
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-3">
            토론 전후 비교
          </h4>
          <div className="space-y-2">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[10px] font-semibold text-red-400 mb-1">토론 주제 (Before)</p>
              <p className="text-xs text-stone-500">{debate.topic}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-[10px] font-semibold text-emerald-400 mb-1">합의 결과 (After)</p>
              <p className="text-xs text-stone-500">{debate.result.summary}</p>
              {debate.result.majorityPosition && (
                <p className="text-[10px] text-stone-400 mt-1.5">다수: {debate.result.majorityPosition}</p>
              )}
              {debate.result.minorityPosition && (
                <p className="text-[10px] text-stone-400">소수: {debate.result.minorityPosition}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
