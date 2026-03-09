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
  ACTIVE: 'bg-emerald-400',
  IDLE: 'bg-zinc-600',
  BUSY: 'bg-amber-400',
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
      aria-label="Agent mention"
      className="w-72 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="max-h-64 overflow-y-auto">
        {/* Header */}
        <div className="px-3 py-2 border-b border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Agents</p>
        </div>

        {[...grouped.entries()].map(([deptName, agentsInDept]) => {
          const groupStartIdx = flatIdx
          flatIdx += agentsInDept.length

          return (
            <div key={deptName} className="py-1">
              {/* Dept label */}
              <div className="px-3 py-1">
                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide">{deptName}</span>
              </div>
              {/* Agent rows */}
              {agentsInDept.map((agent, i) => {
                const idx = groupStartIdx + i
                const isSelected = idx === selectedIndex
                const dot = STATUS_DOT[agent.status] || 'bg-zinc-700'
                return (
                  <button
                    key={agent.id}
                    data-testid="mention-agent-item"
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800/60'
                    }`}
                    onClick={() => onSelect(agent)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-400 flex-shrink-0">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Name */}
                    <span className={`text-sm flex-1 ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      @{agent.name}
                    </span>
                    {/* Tier badge */}
                    {agent.tier && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 flex-shrink-0">
                        {agent.tier}
                      </span>
                    )}
                    {/* Status dot */}
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
