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
      const deptName = deptMap.get(agent.departmentId) || 'Other'
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
      className="w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
      role="listbox"
      aria-label="Agent mention"
    >
      <div className="max-h-72 overflow-y-auto">
        {/* Header */}
        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Agents</p>
        </div>

        {/* Grouped agents by department */}
        {[...grouped.entries()].map(([deptName, agentsInDept]) => (
          <div key={deptName} className="py-1">
            {/* Department header with inline agent names */}
            <div className="px-3 py-1.5">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{deptName}:</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                {agentsInDept.map((a, i) => (
                  <span key={a.id}>
                    <button
                      role="option"
                      aria-selected={flatIdx + i === selectedIndex}
                      className={`inline-flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                        flatIdx + i === selectedIndex ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}
                      onClick={() => onSelect(a)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      @{a.name}
                    </button>
                    {i < agentsInDept.length - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
            {/* Update flatIdx after processing this group */}
            {(() => { flatIdx += agentsInDept.length; return null })()}
          </div>
        ))}
      </div>
    </div>
  )
}
