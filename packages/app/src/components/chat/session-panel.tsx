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
  sessionId,
  onRename,
  onDelete,
  onClose,
}: {
  sessionId: string
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
      data-testid={`session-menu-${sessionId}`}
      className="absolute right-0 top-8 z-20 bg-stone-100 border border-stone-200 rounded-lg shadow-xl py-1 w-36"
    >
      <button
        onClick={onRename}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200"
      >
        ✏️ 이름 변경
      </button>
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-stone-200"
      >
        🗑️ 삭제
      </button>
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
    <div data-testid="session-panel" className="w-72 flex flex-col border-r border-stone-200 bg-corthex-surface shrink-0 h-full">
      {/* 새 대화 버튼 */}
      <div className="px-3 py-3 border-b border-stone-200 shrink-0">
        <button
          data-testid="new-chat-btn"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          + 새 대화
        </button>
      </div>

      {/* 세션 목록 */}
      <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {groups.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-6">대화 내역이 없습니다</p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              {/* 그룹 헤더 */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium uppercase tracking-wider text-stone-400 hover:bg-stone-100/50 transition-colors"
              >
                <span>{group.label}</span>
                <span className={`text-[10px] transition-transform ${collapsedGroups.has(group.label) ? 'rotate-180' : ''}`}>▾</span>
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
                        data-testid={`session-${session.id}`}
                        onClick={() => onSessionSelect(session.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-stone-100 transition-colors group ${
                          isSelected ? 'bg-stone-100' : ''
                        }`}
                      >
                        {/* 에이전트 이니셜 */}
                        <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                          {initial}
                        </span>
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
                              className="w-full bg-stone-200 border border-blue-500 rounded px-2 py-0.5 text-sm text-white outline-none"
                            />
                          ) : (
                            <p className="text-sm text-corthex-text-disabled truncate">{session.title}</p>
                          )}
                          <p className="text-xs text-stone-400">{time}</p>
                        </div>
                      </button>

                      {/* ··· 메뉴 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuSessionId(menuSessionId === session.id ? null : session.id)
                        }}
                        className="absolute right-1 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-stone-400 hover:text-stone-600 text-xs p-2 transition-opacity"
                      >
                        ···
                      </button>

                      {menuSessionId === session.id && (
                        <SessionMenu
                          sessionId={session.id}
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
        <div data-testid="delete-dialog" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-5 max-w-sm mx-4">
            <h4 className="text-sm font-semibold text-corthex-text-primary mb-2">대화 삭제</h4>
            <p className="text-xs text-stone-500 mb-4">이 대화를 삭제하면 모든 메시지, 도구 호출, 위임이 함께 삭제됩니다.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 text-sm rounded-lg text-stone-500 hover:bg-stone-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (deleteTargetId) onDeleteSession(deleteTargetId)
                  setDeleteTargetId(null)
                }}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
