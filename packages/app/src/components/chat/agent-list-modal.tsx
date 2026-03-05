import { useState, useMemo, useEffect } from 'react'
import type { Agent } from './types'

const statusColors: Record<string, string> = {
  online: 'bg-green-400',
  working: 'bg-yellow-400 animate-pulse',
  error: 'bg-red-400',
  offline: 'bg-zinc-400',
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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="text-sm font-semibold">에이전트 선택</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* 검색 */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="에이전트 검색..."
            disabled={searchDisabled}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 에이전트 목록 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-zinc-400 py-6">검색 결과가 없습니다</p>
          ) : (
            filtered.map((agent) => {
              const isOffline = agent.status === 'offline'
              const initial = agent.name.charAt(0)

              return (
                <button
                  key={agent.id}
                  onClick={() => !isOffline && onSelect(agent)}
                  disabled={isOffline}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isOffline
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
                  }`}
                >
                  {/* 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                    {initial}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {agent.isSecretary && <span className="text-xs">⭐</span>}
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors[agent.status]}`} />
                      <span className="text-[10px] text-zinc-400">{statusLabels[agent.status]}</span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{agent.role}</p>
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
