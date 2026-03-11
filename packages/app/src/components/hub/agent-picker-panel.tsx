import { useState, useMemo } from 'react'

type AgentItem = {
  id: string
  name: string
  role: string
  tier: string
  status: string
  isSecretary: boolean
  departmentId: string | null
}

type DeptItem = {
  id: string
  name: string
}

type SessionItem = {
  id: string
  agentId: string
  lastMessageAt: string | null
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  online: 'bg-emerald-500',
  working: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-slate-600',
  inactive: 'bg-slate-600',
}

const statusLabels: Record<string, string> = {
  active: '활성',
  online: '온라인',
  working: '작업 중',
  error: '오류',
  offline: '오프라인',
  inactive: '비활성',
}

type DeptGroup = {
  deptId: string
  deptName: string
  agents: AgentItem[]
}

export function AgentPickerPanel({
  agents,
  departments,
  sessions,
  selectedAgentId,
  onAgentSelect,
}: {
  agents: AgentItem[]
  departments: DeptItem[]
  sessions: SessionItem[]
  selectedAgentId: string | null
  onAgentSelect: (agent: AgentItem) => void
}) {
  const [search, setSearch] = useState('')
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set())

  const deptMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of departments) map.set(d.id, d.name)
    return map
  }, [departments])

  // Build lastUsedAt map from sessions
  const lastUsedMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions) {
      const t = s.lastMessageAt ? new Date(s.lastMessageAt).getTime() : 0
      const existing = map.get(s.agentId) ?? 0
      if (t > existing) map.set(s.agentId, t)
    }
    return map
  }, [sessions])

  // Group agents by department, sort by lastUsedAt within each group
  const groups = useMemo(() => {
    const deptGroups = new Map<string, AgentItem[]>()
    const unassigned: AgentItem[] = []

    for (const a of agents) {
      if (a.departmentId) {
        const list = deptGroups.get(a.departmentId) ?? []
        list.push(a)
        deptGroups.set(a.departmentId, list)
      } else {
        unassigned.push(a)
      }
    }

    const sortAgents = (list: AgentItem[]) =>
      [...list].sort((a, b) => {
        const aTime = lastUsedMap.get(a.id) ?? 0
        const bTime = lastUsedMap.get(b.id) ?? 0
        if (aTime !== bTime) return bTime - aTime // most recent first
        return a.name.localeCompare(b.name, 'ko')
      })

    const result: DeptGroup[] = []
    for (const [deptId, agentList] of deptGroups) {
      result.push({
        deptId,
        deptName: deptMap.get(deptId) ?? '알 수 없는 부서',
        agents: sortAgents(agentList),
      })
    }
    // Sort departments by name
    result.sort((a, b) => a.deptName.localeCompare(b.deptName, 'ko'))

    if (unassigned.length > 0) {
      result.push({
        deptId: '__unassigned__',
        deptName: '미배정',
        agents: sortAgents(unassigned),
      })
    }

    return result
  }, [agents, deptMap, lastUsedMap])

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        agents: g.agents.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.role.toLowerCase().includes(q) ||
            g.deptName.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.agents.length > 0)
  }, [groups, search])

  const toggleDept = (deptId: string) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(deptId)) next.delete(deptId)
      else next.add(deptId)
      return next
    })
  }

  const totalAgents = agents.length
  const searchDisabled = totalAgents <= 3

  return (
    <div
      data-testid="agent-picker-panel"
      className="w-full md:w-72 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 h-full"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          에이전트 선택
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          대화할 에이전트를 선택하세요
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-2 shrink-0">
        <input
          data-testid="agent-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 역할, 부서 검색..."
          disabled={searchDisabled}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none placeholder-zinc-400 dark:placeholder-zinc-500 disabled:opacity-40 transition-colors"
        />
      </div>

      {/* Agent list grouped by department */}
      <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 py-6">
            {search ? '검색 결과가 없습니다' : '에이전트가 없습니다'}
          </p>
        ) : (
          filtered.map((group) => (
            <div key={group.deptId} data-testid={`dept-group-${group.deptId}`}>
              {/* Department header */}
              <button
                onClick={() => toggleDept(group.deptId)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <span>{group.deptName}</span>
                  <span className="text-[10px] font-normal text-zinc-400">
                    ({group.agents.length})
                  </span>
                </span>
                <span
                  className={`text-[10px] transition-transform ${
                    collapsedDepts.has(group.deptId) ? '-rotate-90' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* Agent cards */}
              {!collapsedDepts.has(group.deptId) &&
                group.agents.map((agent) => {
                  const isOffline =
                    agent.status === 'offline' || agent.status === 'inactive'
                  const isSelected = agent.id === selectedAgentId
                  const initial = agent.name.charAt(0)
                  const statusColor =
                    statusColors[agent.status] ?? 'bg-slate-600'
                  const statusLabel =
                    statusLabels[agent.status] ?? agent.status

                  return (
                    <button
                      key={agent.id}
                      data-testid={`agent-card-${agent.id}`}
                      onClick={() => !isOffline && onAgentSelect(agent)}
                      disabled={isOffline}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-l-2 border-indigo-600'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l-2 border-transparent'
                      } ${isOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {/* Avatar */}
                      <span className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300 shrink-0 relative">
                        {initial}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-50 dark:border-zinc-900 ${statusColor}`}
                          title={statusLabel}
                        />
                      </span>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">
                            {agent.name}
                          </span>
                          {agent.isSecretary && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 shrink-0">
                              비서
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {agent.role}
                        </p>
                      </div>
                    </button>
                  )
                })}
            </div>
          ))
        )}
      </div>

      {/* Footer: agent count */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
        <p className="text-[10px] text-zinc-400">
          {totalAgents}개 에이전트 · {departments.length}개 부서
        </p>
      </div>
    </div>
  )
}
