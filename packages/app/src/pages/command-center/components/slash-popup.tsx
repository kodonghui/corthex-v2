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

const ICON_COLORS: Record<string, string> = {
  chart: 'text-blue-400',
  document: 'text-amber-400',
  diagram: 'text-emerald-400',
  summary: 'text-violet-400',
  broadcast: 'text-cyan-400',
  chain: 'text-orange-400',
  tools: 'text-zinc-400',
  sketch: 'text-pink-400',
}

function CommandIcon({ type }: { type: string }) {
  const color = ICON_COLORS[type] || 'text-zinc-400'
  const icons: Record<string, React.ReactNode> = {
    chart: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <path d="M1.5 10l2.5-3.5 2 1.5 3.5-5 2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    document: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <rect x="2.5" y="1.5" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4.5 5h4M4.5 7h4M4.5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    diagram: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="4.5" y="8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 5v2h4v1M10 5v2H7" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    summary: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <path d="M2 3.5h9M2 6.5h5.5M2 9.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    broadcast: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.5 2.5a6 6 0 010 8M2.5 2.5a6 6 0 000 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    chain: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <path d="M5 6.5h3M2.5 6.5a2.5 2.5 0 012.5-2.5h1M10.5 6.5a2.5 2.5 0 01-2.5 2.5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    tools: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <path d="M8.5 1.5l3.5 3.5-5 5-3.5-3.5 5-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M1.5 11.5l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    sketch: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className={color}>
        <path d="M2.5 10.5l1.5-1.5 5-5 1.5 1.5-5 5-1.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M9 4l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  }
  return <>{icons[type] || icons.document}</>
}

export function SlashPopup({ query, selectedIndex, onSelect, onSelectPreset, onClose, presets = [] }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.toLowerCase()
  const filteredCommands = SLASH_COMMANDS.filter(
    (c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
  )
  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.command.toLowerCase().includes(q) ||
    (p.category && p.category.toLowerCase().includes(q)),
  )
  const totalCount = filteredCommands.length + filteredPresets.length

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
      role="listbox"
      aria-label="Quick commands"
      className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="max-h-72 overflow-y-auto">
        {/* Section header */}
        <div className="px-3 py-2 border-b border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Commands</p>
        </div>

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
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
                onClick={() => onSelect(cmd.cmd)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
                  <CommandIcon type={cmd.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">{cmd.cmd}</span>
                    {cmd.args && (
                      <span className="text-[10px] text-zinc-600 font-mono">{cmd.args}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{cmd.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredPresets.length > 0 && (
          <>
            <div className="px-3 py-2 border-t border-zinc-800">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Saved Templates</p>
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
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                    }`}
                    onClick={() => onSelectPreset?.(preset)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="w-7 h-7 rounded-md bg-amber-950/40 border border-amber-800/40 flex items-center justify-center flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-amber-400">
                        <path d="M5.5 1l1.2 2.8H9.5l-2.4 1.9.9 3-2.5-1.7-2.5 1.7.9-3L1.5 3.8h2.8z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-200 truncate">{preset.name}</span>
                        {preset.category && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 flex-shrink-0">
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
  const cmdCount = SLASH_COMMANDS.filter(
    (c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
  ).length
  const presetCount = presets.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.command.toLowerCase().includes(q) ||
    (p.category && p.category.toLowerCase().includes(q)),
  ).length
  return cmdCount + presetCount
}
