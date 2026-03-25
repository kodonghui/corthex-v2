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

const ICON_BG: Record<string, string> = {
  chart: 'bg-blue-500/20 text-blue-400',
  document: 'bg-amber-500/20 text-amber-400',
  diagram: 'bg-emerald-500/20 text-emerald-400',
  summary: 'bg-violet-500/20 text-violet-400',
  broadcast: 'bg-corthex-accent/20 text-corthex-accent',
  chain: 'bg-orange-500/20 text-orange-400',
  tools: 'bg-corthex-surface/20 text-corthex-text-secondary',
  sketch: 'bg-pink-500/20 text-pink-400',
}

function CommandIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    chart: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <path d="M1.5 10l2.5-3.5 2 1.5 3.5-5 2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    document: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <rect x="2.5" y="1.5" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <path d="M4.5 5h4M4.5 7h4M4.5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    diagram: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="4.5" y="8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 5v2h4v1M10 5v2H7" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    summary: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <path d="M2 3.5h9M2 6.5h5.5M2 9.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    broadcast: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.5 2.5a6 6 0 010 8M2.5 2.5a6 6 0 000 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    chain: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <path d="M5 6.5h3M2.5 6.5a2.5 2.5 0 012.5-2.5h1M10.5 6.5a2.5 2.5 0 01-2.5 2.5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    tools: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <path d="M8.5 1.5l3.5 3.5-5 5-3.5-3.5 5-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M1.5 11.5l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    sketch: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-current">
        <path d="M2.5 10.5l1.5-1.5 5-5 1.5 1.5-5 5-1.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M9 4l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  }
  return <>{icons[type] || icons.tools}</>
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
      aria-label="슬래시 명령"
      className="w-72 bg-corthex-surface border border-corthex-border rounded-xl shadow-2xl overflow-hidden z-50"
    >
      <div className="max-h-72 overflow-y-auto">
        {/* Search */}
        <input
          className="w-full px-3 py-2 text-sm bg-transparent text-corthex-text-primary border-b border-corthex-border outline-none placeholder:text-corthex-text-disabled"
          placeholder="명령어 검색..."
          value={query}
          readOnly
        />

        {/* Built-in commands section */}
        {filteredCommands.length > 0 && (
          <>
            <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-corthex-text-secondary">기본 명령어</p>
            {filteredCommands.map((cmd, idx) => {
              const bg = ICON_BG[cmd.icon] || 'bg-corthex-surface/20 text-corthex-text-secondary'
              return (
                <button
                  key={cmd.cmd}
                  data-testid={`slash-item-${idx}`}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-corthex-text-secondary hover:bg-corthex-elevated transition-colors ${
                    idx === selectedIndex ? 'bg-corthex-elevated' : ''
                  }`}
                  onClick={() => onSelect(cmd.cmd)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${bg}`}>
                    <CommandIcon type={cmd.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-corthex-text-disabled">{cmd.cmd}</span>
                    {cmd.args && <span className="text-xs text-corthex-text-secondary ml-1">{cmd.args}</span>}
                    <p className="text-xs text-corthex-text-secondary">{cmd.desc}</p>
                  </div>
                </button>
              )
            })}
          </>
        )}

        {/* Preset section */}
        {filteredPresets.length > 0 && (
          <>
            <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-corthex-text-secondary border-t border-corthex-border">저장된 프리셋</p>
            {filteredPresets.map((preset, idx) => {
              const globalIdx = filteredCommands.length + idx
              return (
                <button
                  key={preset.id}
                  data-testid={`slash-item-${globalIdx}`}
                  role="option"
                  aria-selected={globalIdx === selectedIndex}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-corthex-text-secondary hover:bg-corthex-elevated transition-colors ${
                    globalIdx === selectedIndex ? 'bg-corthex-elevated' : ''
                  }`}
                  onClick={() => onSelectPreset?.(preset)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1l1.2 2.8H9.5l-2.4 1.9.9 3-2.5-1.7-2.5 1.7.9-3L1.5 3.8h2.8z" fill="currentColor" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-corthex-text-disabled truncate">{preset.name}</span>
                      {preset.category && (
                        <span className="text-xs px-1 py-0.5 rounded bg-corthex-elevated text-corthex-text-secondary">{preset.category}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
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
