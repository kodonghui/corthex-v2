import { useState, useMemo, useRef, useEffect } from 'react'
import type { Agent, Session } from './types'

type DateGroup = {
  label: string
  sessions: Session[]
}

function groupSessionsByDate(sessions: Session[]): DateGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  // 월요일 기준 이번 주 시작 (getDay: 0=일, 1=월 → 월요일=1이면 0일 전, 일요일=0이면 6일 전)
  const daysSinceMonday = (now.getDay() + 6) % 7
  const weekStart = new Date(today.getTime() - daysSinceMonday * 86400000)

  const groups: DateGroup[] = [
    { label: '오늘', sessions: [] },
    { label: '어제', sessions: [] },
    { label: '이번 주', sessions: [] },
    { label: '이전', sessions: [] },
  ]

  for (const s of sessions) {
    const d = new Date(s.lastMessageAt || s.createdAt)
    if (d >= today) groups[0].sessions.push(s)
    else if (d >= yesterday) groups[1].sessions.push(s)
    else if (d >= weekStart) groups[2].sessions.push(s)
    else groups[3].sessions.push(s)
  }

  return groups.filter((g) => g.sessions.length > 0)
}

function SessionMenu({
  onRename,
  onDelete,
  onClose,
}: {
  onRename: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px]"
    >
      <button
        onClick={onRename}
        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700"
      >
        이름 변경
      </button>
      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      >
        삭제
      </button>
    </div>
  )
}

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-2">대화 삭제</h3>
        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
          이 대화를 삭제하시겠어요? 삭제된 대화는 복구할 수 없습니다. 에이전트의 기억은 유지됩니다.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

export function SessionPanel({
  sessions,
  agents,
  selectedSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
  onDeleteSession,
}: {
  sessions: Session[]
  agents: Agent[]
  selectedSessionId: string | null
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onRenameSession: (sessionId: string, title: string) => void
  onDeleteSession: (sessionId: string) => void
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [menuSessionId, setMenuSessionId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const groups = useMemo(() => groupSessionsByDate(sessions), [sessions])

  const agentMap = useMemo(() => {
    const map: Record<string, Agent> = {}
    for (const a of agents) map[a.id] = a
    return map
  }, [agents])

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const startRename = (session: Session) => {
    setRenamingId(session.id)
    setRenameValue(session.title)
    setMenuSessionId(null)
  }

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameSession(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }

  return (
    <div className="flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800">
      {/* 새 대화 버튼 */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNewChat}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          + 새 대화
        </button>
      </div>

      {/* 세션 목록 */}
      <div className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-6">대화 내역이 없습니다</p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-2">
              {/* 그룹 헤더 */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 w-full"
              >
                <span className="text-[10px]">{collapsedGroups.has(group.label) ? '▸' : '▾'}</span>
                {group.label}
              </button>

              {/* 세션 아이템 */}
              {!collapsedGroups.has(group.label) &&
                group.sessions.map((session) => {
                  const agent = agentMap[session.agentId]
                  const initial = agent?.name?.charAt(0) || '?'
                  const time = session.lastMessageAt
                    ? new Date(session.lastMessageAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''
                  const isSelected = session.id === selectedSessionId
                  const isRenaming = session.id === renamingId

                  return (
                    <div key={session.id} className="relative group">
                      <button
                        onClick={() => onSessionSelect(session.id)}
                        className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {/* 에이전트 이니셜 */}
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isRenaming ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename()
                                if (e.key === 'Escape') setRenamingId(null)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-xs px-1 py-0.5 rounded border border-indigo-400 bg-white dark:bg-zinc-800 focus:outline-none"
                            />
                          ) : (
                            <p className="text-xs truncate max-w-[160px]">{session.title}</p>
                          )}
                          <p className="text-[10px] text-zinc-400">{time}</p>
                        </div>
                      </button>

                      {/* ··· 메뉴 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuSessionId(menuSessionId === session.id ? null : session.id)
                        }}
                        className="absolute right-1 top-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs px-1"
                      >
                        ···
                      </button>

                      {menuSessionId === session.id && (
                        <SessionMenu
                          onRename={() => startRename(session)}
                          onDelete={() => {
                            setDeleteTargetId(session.id)
                            setMenuSessionId(null)
                          }}
                          onClose={() => setMenuSessionId(null)}
                        />
                      )}
                    </div>
                  )
                })}
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {deleteTargetId && (
        <DeleteConfirmDialog
          onConfirm={() => {
            onDeleteSession(deleteTargetId)
            setDeleteTargetId(null)
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}
