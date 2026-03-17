import { useRef, useEffect, useCallback, useState } from 'react'
import { SpeechCard } from './speech-card'
import { ConsensusCard } from './consensus-card'
import type { Debate, DebateWsEvent, DebateTimelineEntry, DebateResult, DebateRound } from '@corthex/shared'
import { useAgoraWs } from '../../hooks/use-agora-ws'

type TimelineEntry =
  | { type: 'round-header'; roundNum: number; totalRounds: number }
  | { type: 'speech'; agentId: string; agentName: string; content: string; position: string; roundNum: number }
  | { type: 'round-end'; roundNum: number; speechCount: number }
  | { type: 'result'; result: DebateResult }
  | { type: 'error'; error: string }

function buildEntriesFromRounds(rounds: DebateRound[], totalRounds: number): TimelineEntry[] {
  const entries: TimelineEntry[] = []
  for (const round of rounds) {
    entries.push({ type: 'round-header', roundNum: round.roundNum, totalRounds })
    for (const speech of round.speeches) {
      entries.push({
        type: 'speech',
        agentId: speech.agentId,
        agentName: speech.agentName,
        content: speech.content,
        position: speech.position,
        roundNum: round.roundNum,
      })
    }
    entries.push({ type: 'round-end', roundNum: round.roundNum, speechCount: round.speeches.length })
  }
  return entries
}

function buildEntriesFromTimeline(timeline: DebateTimelineEntry[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []
  for (const ev of timeline) {
    switch (ev.event) {
      case 'round-started':
        entries.push({ type: 'round-header', roundNum: ev.roundNum, totalRounds: ev.totalRounds })
        break
      case 'speech-delivered':
        entries.push({
          type: 'speech',
          agentId: ev.speech.agentId,
          agentName: ev.speech.agentName,
          content: ev.speech.content,
          position: ev.speech.position,
          roundNum: ev.roundNum,
        })
        break
      case 'round-ended':
        entries.push({ type: 'round-end', roundNum: ev.roundNum, speechCount: ev.speechCount })
        break
      case 'debate-completed':
        entries.push({ type: 'result', result: ev.result })
        break
      case 'debate-failed':
        entries.push({ type: 'error', error: ev.error })
        break
    }
  }
  return entries
}

type Props = {
  debate: Debate
  timeline?: DebateTimelineEntry[]
}

export function DebateTimeline({ debate, timeline }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isUserScrolledUp = useRef(false)
  const [liveEntries, setLiveEntries] = useState<TimelineEntry[]>([])

  // Build initial entries from debate data or timeline
  const baseEntries = timeline
    ? buildEntriesFromTimeline(timeline)
    : buildEntriesFromRounds(debate.rounds, debate.maxRounds)

  // If debate has result, append it
  const staticEntries = debate.result
    ? [...baseEntries, { type: 'result' as const, result: debate.result }]
    : baseEntries

  const allEntries = [...staticEntries, ...liveEntries]

  // Auto-scroll to bottom on new entries
  const scrollToBottom = useCallback(() => {
    if (!isUserScrolledUp.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [allEntries.length, scrollToBottom])

  // Track user scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    isUserScrolledUp.current = !atBottom
  }, [])

  // WebSocket handler for live debates
  const handleWsEvent = useCallback((event: DebateWsEvent) => {
    switch (event.event) {
      case 'round-started':
        setLiveEntries((prev) => [
          ...prev,
          { type: 'round-header', roundNum: event.roundNum, totalRounds: event.totalRounds },
        ])
        break
      case 'speech-delivered':
        setLiveEntries((prev) => [
          ...prev,
          {
            type: 'speech',
            agentId: event.speech.agentId,
            agentName: event.speech.agentName,
            content: event.speech.content,
            position: event.speech.position,
            roundNum: event.roundNum,
          },
        ])
        break
      case 'round-ended':
        setLiveEntries((prev) => [
          ...prev,
          { type: 'round-end', roundNum: event.roundNum, speechCount: event.speechCount },
        ])
        break
      case 'debate-completed':
        setLiveEntries((prev) => [...prev, { type: 'result', result: event.result }])
        break
      case 'debate-failed':
        setLiveEntries((prev) => [...prev, { type: 'error', error: event.error }])
        break
    }
  }, [])

  const isLive = debate.status === 'in-progress'
  useAgoraWs(isLive ? debate.id : null, handleWsEvent)

  // Reset live entries when debate changes
  useEffect(() => {
    setLiveEntries([])
  }, [debate.id])

  if (allEntries.length === 0 && debate.status === 'pending') {
    return (
      <div className="flex-1 flex items-center justify-center text-stone-400">
        <div className="text-center space-y-2">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-[#5a7247] rounded-full animate-spin mx-auto" />
          <p className="text-xs">토론 시작 대기 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="debate-timeline" ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 pb-24 flex flex-col gap-6">
      {allEntries.map((entry, i) => {
        switch (entry.type) {
          case 'round-header':
            return (
              <div key={`rh-${i}`} data-testid={`round-header-${entry.roundNum}`} className="flex justify-center my-2">
                <span className="px-3 py-1 bg-[#5a7247]/10 text-[#5a7247] text-xs rounded-full font-mono">
                  Round {entry.roundNum} / {entry.totalRounds}
                </span>
              </div>
            )
          case 'speech':
            return (
              <SpeechCard
                key={`sp-${i}`}
                index={i}
                agentId={entry.agentId}
                agentName={entry.agentName}
                content={entry.content}
                position={entry.position}
                roundNum={entry.roundNum}
              />
            )
          case 'round-end':
            return (
              <div key={`re-${i}`} className="flex justify-center py-1">
                <span className="text-[10px] text-stone-400 font-mono">
                  Round {entry.roundNum} 완료 — {entry.speechCount}명 발언
                </span>
              </div>
            )
          case 'result':
            return <ConsensusCard key={`res-${i}`} result={entry.result} />
          case 'error':
            return (
              <div key={`err-${i}`} className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                토론 오류: {entry.error}
              </div>
            )
          default:
            return null
        }
      })}

      {isLive && allEntries.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2 text-stone-500">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-[#5a7247] rounded-full animate-spin mx-auto" />
            <p className="text-xs">토론 진행 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}
