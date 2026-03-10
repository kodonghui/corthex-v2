import { useEffect, useRef, useMemo } from 'react'

type Agent = {
  id: string
  name: string
  tier: string
  departmentId: string
  status: string
}

type Props = {
  query: string
  selectedIndex: number
  agents: Agent[]
  deptMap: Map<string, string>
  onSelect: (agent: Agent) => void
  onClose: () => void
}

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-emerald-500',
  IDLE: 'bg-zinc-500',
  BUSY: 'bg-amber-500',
}

const TIER_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  manager: { bg: 'bg-purple-500/20', text: 'text-purple-300', label: '매니저' },
  specialist: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: '전문가' },
}

export function MentionPopup({ query, selectedIndex, agents, deptMap, onSelect, onClose }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query) return agents
    const q = query.toLowerCase()
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (deptMap.get(a.departmentId) || '').toLowerCase().includes(q),
    )
  }, [agents, deptMap, query])

  const grouped = useMemo(() => {
    const groups = new Map<string, Agent[]>()
    for (const agent of filtered) {
      const deptName = deptMap.get(agent.departmentId) || 'Other'
      if (!groups.has(deptName)) groups.set(deptName, [])
      groups.get(deptName)!.push(agent)
    }
    return groups
  }, [filtered, deptMap])

  const flatList = useMemo(() => {
    const result: Agent[] = []
    for (const agentsInGroup of grouped.values()) result.push(...agentsInGroup)
    return result
  }, [grouped])

  useEffect(() => {
    const el = listRef.current?.querySelectorAll('[role="option"]')[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (flatList.length === 0) return null

  let flatIdx = 0

  return (
    <div
      data-testid="mention-popup"
      ref={listRef}
      role="listbox"
      aria-label="에이전트 멘션"
      className="w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
    >
      {/* Search */}
      <input
        className="w-full px-3 py-2 text-sm bg-transparent text-white border-b border-slate-700 outline-none placeholder-slate-500"
        placeholder="에이전트 검색..."
        value={query}
        readOnly
      />

      {[...grouped.entries()].map(([deptName, agentsInDept]) => {
        const groupStartIdx = flatIdx
        flatIdx += agentsInDept.length

        return (
          <div key={deptName}>
            {/* Dept label */}
            <p className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-800/50 sticky top-0">{deptName}</p>
            {/* Agent rows */}
            {agentsInDept.map((agent, i) => {
              const idx = groupStartIdx + i
              const isSelected = idx === selectedIndex
              const dot = STATUS_DOT[agent.status] || 'bg-slate-600'
              const tierLower = agent.tier?.toLowerCase()
              const tierInfo = TIER_BADGE[tierLower]
              return (
                <button
                  key={agent.id}
                  data-testid={`mention-agent-${agent.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                    isSelected ? 'bg-slate-700' : ''
                  }`}
                  onClick={() => onSelect(agent)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {/* Avatar */}
                  <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Name */}
                  <span className="text-sm text-slate-200 flex-1 text-left">{agent.name}</span>
                  {/* Tier badge */}
                  {tierInfo && (
                    <span className={`text-xs px-1 py-0.5 rounded ${tierInfo.bg} ${tierInfo.text}`}>
                      {tierInfo.label}
                    </span>
                  )}
                  {/* Status dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}>
                    <span className="sr-only">{agent.status === 'ACTIVE' ? '활성 상태' : agent.status === 'BUSY' ? '작업 중' : '대기 상태'}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
