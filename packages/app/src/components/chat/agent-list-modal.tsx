import { useState, useMemo } from 'react'
import type { Agent } from './types'

const statusColors: Record<string, string> = {
  online: 'bg-emerald-500',
  working: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-slate-600',
}

const statusLabels: Record<string, string> = {
  online: '온라인',
  working: '작업 중',
  error: '오류',
  offline: '오프라인',
}

export function AgentListModal({
  agents,
  onSelect,
  onClose,
}: {
  agents: Agent[]
  onSelect: (agent: Agent) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    return [...agents].sort((a, b) => {
      // 비서 최상단
      if (a.isSecretary !== b.isSecretary) return a.isSecretary ? -1 : 1
      // 온라인 우선
      const statusOrder = { online: 0, working: 1, error: 2, offline: 3 }
      return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
    })
  }, [agents])

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted
    const q = search.toLowerCase()
    return sorted.filter(
      (a) => a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
    )
  }, [sorted, search])

  const searchDisabled = agents.length <= 3

  return (
    <div
      data-testid="agent-list-modal"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-stone-100 border border-stone-200 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <h3 className="text-lg font-semibold text-slate-50">에이전트 선택</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 검색 */}
        <div className="px-5 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 역할 검색..."
            disabled={searchDisabled}
            className="w-full bg-stone-200 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-slate-500 disabled:opacity-40 transition-colors"
          />
        </div>

        {/* 에이전트 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-6">검색 결과가 없습니다</p>
          ) : (
            filtered.map((agent) => {
              const isOffline = agent.status === 'offline'
              const initial = agent.name.charAt(0)

              return (
                <button
                  key={agent.id}
                  data-testid={`agent-item-${agent.id}`}
                  onClick={() => !isOffline && onSelect(agent)}
                  disabled={isOffline}
                  className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-stone-200/50 transition-colors ${
                    isOffline ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {/* 아바타 */}
                  <span className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600 shrink-0 relative">
                    {initial}
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-stone-200 ${statusColors[agent.status]}`} />
                  </span>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{agent.name}</span>
                      {agent.isSecretary && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">⭐ 비서</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate mt-0.5">{agent.role}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
