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

  // Group by department
  const grouped = useMemo(() => {
    const groups = new Map<string, Agent[]>()
    for (const agent of filtered) {
      const deptName = deptMap.get(agent.departmentId) || '기타'
      if (!groups.has(deptName)) groups.set(deptName, [])
      groups.get(deptName)!.push(agent)
    }
    return groups
  }, [filtered, deptMap])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const result: Agent[] = []
    for (const agents of grouped.values()) {
      result.push(...agents)
    }
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
      className="absolute bottom-full mb-2 left-0 w-full max-w-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50"
      role="listbox"
      aria-label="에이전트 멘션"
    >
      <div className="p-2 border-b border-zinc-100 dark:border-zinc-700">
        <p className="text-xs text-zinc-400 px-2">에이전트 지정</p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {[...grouped.entries()].map(([deptName, agentsInDept]) => (
          <div key={deptName}>
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
              {deptName}
            </p>
            {agentsInDept.map((agent) => {
              const thisIdx = flatIdx++
              return (
                <button
                  key={agent.id}
                  data-testid="mention-agent-item"
                  role="option"
                  aria-selected={thisIdx === selectedIndex}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    thisIdx === selectedIndex
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                  onClick={() => onSelect(agent)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {agent.name}
                    </span>
                    <span className="ml-2 text-xs text-zinc-400">{agent.tier}</span>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
