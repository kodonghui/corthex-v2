import { useEffect, useRef } from 'react'

const SLASH_COMMANDS = [
  { cmd: 'Analyze Data', args: '', desc: 'Analyze your data with AI', icon: 'chart' },
  { cmd: 'Create Report', args: '', desc: 'Generate a comprehensive report', icon: 'document' },
  { cmd: 'Generate Diagram', args: '', desc: 'Create visual diagrams', icon: 'diagram' },
  { cmd: 'Summarize', args: '', desc: 'Summarize content or documents', icon: 'summary' },
  { cmd: '/전체', args: '[메시지]', desc: '모든 팀장에게 동시에 명령', icon: 'broadcast' },
  { cmd: '/순차', args: '[메시지]', desc: '팀장에게 순차적으로 릴레이 명령', icon: 'chain' },
  { cmd: '/도구점검', args: '', desc: '사용 가능한 도구 상태 확인', icon: 'tools' },
  { cmd: '/스케치', args: '[설명]', desc: 'AI로 다이어그램 생성', icon: 'sketch' },
]

export type PresetItem = {
  id: string
  name: string
  command: string
  description: string | null
  category: string | null
}

type Props = {
  query: string
  selectedIndex: number
  onSelect: (cmd: string) => void
  onSelectPreset?: (preset: PresetItem) => void
  onClose: () => void
  presets?: PresetItem[]
}

function CommandIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    chart: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-500">
        <path d="M2 12l3-4 3 2 4-6 2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    document: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-500">
        <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    diagram: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-500">
        <rect x="2" y="2" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="10" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 6v2h4v2M12 6v2H8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    summary: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-violet-500">
        <path d="M3 4h10M3 8h6M3 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    broadcast: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cyan-500">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 4a6 6 0 010 8M4 4a6 6 0 000 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    chain: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-orange-500">
        <path d="M6 8h4M3 8a3 3 0 013-3h1M13 8a3 3 0 01-3 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tools: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-500">
        <path d="M10 2l4 4-6 6-4-4 6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 14l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sketch: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-pink-500">
        <path d="M3 13l2-2 6-6 2 2-6 6-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  }
  return icons[type] || icons.document
}

export function SlashPopup({ query, selectedIndex, onSelect, onSelectPreset, onClose, presets = [] }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.toLowerCase()
  const filteredCommands = SLASH_COMMANDS.filter((c) =>
    c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
  )
  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.command.toLowerCase().includes(q) ||
    (p.category && p.category.toLowerCase().includes(q)),
  )

  const totalCount = filteredCommands.length + filteredPresets.length

  // Scroll selected item into view
  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const items = container.querySelectorAll('[role="option"]')
    const el = items[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (totalCount === 0) return null

  return (
    <div
      data-testid="slash-popup"
      ref={listRef}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
      role="listbox"
      aria-label="Quick commands"
    >
      <div className="max-h-80 overflow-y-auto">
        {/* Header */}
        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Quick Command</p>
        </div>

        {/* Commands section */}
        {filteredCommands.length > 0 && (
          <div className="py-1">
            {filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.cmd}
                data-testid="slash-command-item"
                role="option"
                aria-selected={idx === selectedIndex}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                }`}
                onClick={() => onSelect(cmd.cmd)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <CommandIcon type={cmd.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {cmd.cmd}
                  </span>
                  {cmd.args && (
                    <span className="ml-2 text-xs text-zinc-400">{cmd.args}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Presets section */}
        {filteredPresets.length > 0 && (
          <>
            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saved Templates</p>
            </div>
            <div className="py-1">
              {filteredPresets.map((preset, idx) => {
                const globalIdx = filteredCommands.length + idx
                return (
                  <button
                    key={preset.id}
                    role="option"
                    aria-selected={globalIdx === selectedIndex}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      globalIdx === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                    }`}
                    onClick={() => onSelectPreset?.(preset)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-amber-500">
                        <path d="M7 1l1.5 3.5H12l-3 2.5 1 4L7 8.5 3.5 11l1-4-3-2.5h3.5L7 1z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {preset.name}
                        </span>
                        {preset.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                            {preset.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { SLASH_COMMANDS }

export function getFilteredCount(query: string, presets: PresetItem[] = []): number {
  const q = query.toLowerCase()
  const cmdCount = SLASH_COMMANDS.filter((c) => 
    c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  ).length
  const presetCount = presets.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.command.toLowerCase().includes(q) ||
    (p.category && p.category.toLowerCase().includes(q)),
  ).length
  return cmdCount + presetCount
}
