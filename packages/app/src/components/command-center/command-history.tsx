import { useMemo, useState } from 'react'
import { cn, Badge } from '@corthex/ui'
import type { Command, CommandStatus, QualityGrade } from './types'

const statusConfig: Record<CommandStatus, { label: string; color: string }> = {
  queued: { label: '대기', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  processing: { label: '처리중', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  completed: { label: '완료', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  failed: { label: '실패', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  cancelled: { label: '취소', color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500' },
}

const gradeColors: Record<QualityGrade, string> = {
  S: 'bg-indigo-500 text-white',
  A: 'bg-emerald-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-amber-500 text-white',
  F: 'bg-red-500 text-white',
}

type DateGroup = {
  label: string
  commands: Command[]
}

function groupCommandsByDate(commands: Command[]): DateGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekStart = new Date(today.getTime() - ((now.getDay() + 6) % 7) * 86400000)

  const groups: DateGroup[] = [
    { label: '오늘', commands: [] },
    { label: '어제', commands: [] },
    { label: '이번 주', commands: [] },
    { label: '이전', commands: [] },
  ]

  for (const cmd of commands) {
    const d = new Date(cmd.createdAt)
    if (d >= today) groups[0].commands.push(cmd)
    else if (d >= yesterday) groups[1].commands.push(cmd)
    else if (d >= weekStart) groups[2].commands.push(cmd)
    else groups[3].commands.push(cmd)
  }

  return groups.filter(g => g.commands.length > 0)
}

type CommandHistoryProps = {
  commands: Command[]
  selectedCommandId: string | null
  onSelectCommand: (id: string) => void
  onNewCommand: () => void
  className?: string
}

export function CommandHistory({
  commands,
  selectedCommandId,
  onSelectCommand,
  onNewCommand,
  className,
}: CommandHistoryProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const groups = useMemo(() => groupCommandsByDate(commands), [commands])

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={cn('flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800', className)}>
      {/* Header with new command button */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onNewCommand}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          + 새 지시
        </button>
      </div>

      {/* Command list */}
      <div className="flex-1 overflow-y-auto p-2 [-webkit-overflow-scrolling:touch]">
        {groups.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-6">지시 내역이 없습니다</p>
        ) : (
          groups.map(group => (
            <div key={group.label} className="mb-2">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 w-full"
              >
                <span className="text-[10px]">{collapsedGroups.has(group.label) ? '>' : 'v'}</span>
                {group.label}
                <span className="ml-auto text-zinc-300 dark:text-zinc-600">{group.commands.length}</span>
              </button>

              {/* Command items */}
              {!collapsedGroups.has(group.label) &&
                group.commands.map(cmd => {
                  const isSelected = cmd.id === selectedCommandId
                  const config = statusConfig[cmd.status]

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => onSelectCommand(cmd.id)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors',
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950 ring-1 ring-indigo-200 dark:ring-indigo-800'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {/* Title row */}
                      <div className="flex items-start gap-2 mb-1">
                        <p className={cn('text-sm flex-1 line-clamp-2', isSelected && 'font-medium')}>
                          {cmd.title}
                        </p>
                        {cmd.qualityGrade && (
                          <span className={cn('shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center', gradeColors[cmd.qualityGrade])}>
                            {cmd.qualityGrade}
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className={cn('px-1.5 py-0.5 rounded-full', config.color)}>
                          {config.label}
                        </span>
                        {cmd.assignedAgentName && (
                          <span className="truncate">{cmd.assignedAgentName}</span>
                        )}
                        <span className="ml-auto">{formatTime(cmd.createdAt)}</span>
                      </div>

                      {/* Cost */}
                      {cmd.totalCost !== undefined && (
                        <p className="text-[10px] text-zinc-400 mt-1">
                          비용: ${cmd.totalCost.toFixed(2)}
                        </p>
                      )}
                    </button>
                  )
                })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
