import { useEffect, useRef } from 'react'

const SLASH_COMMANDS = [
  { cmd: '/전체', args: '[메시지]', desc: '모든 팀장에게 동시에 명령', icon: '📡' },
  { cmd: '/순차', args: '[메시지]', desc: '팀장에게 순차적으로 릴레이 명령', icon: '🔗' },
  { cmd: '/도구점검', args: '', desc: '사용 가능한 도구 상태 확인', icon: '🔧' },
  { cmd: '/배치실행', args: '', desc: '대기 중인 배치 요청 실행', icon: '📦' },
  { cmd: '/배치상태', args: '', desc: '배치 처리 진행 상태 확인', icon: '📊' },
  { cmd: '/명령어', args: '', desc: '사용 가능한 모든 명령어 보기', icon: '📋' },
  { cmd: '/토론', args: '[주제]', desc: '팀장 2라운드 토론 시작', icon: '💬' },
  { cmd: '/심층토론', args: '[주제]', desc: '팀장 3라운드 심층 토론 시작', icon: '🧠' },
]

type Props = {
  query: string
  selectedIndex: number
  onSelect: (cmd: string) => void
  onClose: () => void
}

export function SlashPopup({ query, selectedIndex, onSelect, onClose }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = SLASH_COMMANDS.filter((c) =>
    c.cmd.toLowerCase().includes(query.toLowerCase()),
  )

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (filtered.length === 0) return null

  return (
    <div
      ref={listRef}
      className="absolute bottom-full mb-2 left-0 w-full max-w-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden z-50"
      role="listbox"
      aria-label="슬래시 명령어"
    >
      <div className="p-2 border-b border-zinc-100 dark:border-zinc-700">
        <p className="text-xs text-zinc-400 px-2">명령어</p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {filtered.map((cmd, idx) => (
          <button
            key={cmd.cmd}
            role="option"
            aria-selected={idx === selectedIndex}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
              idx === selectedIndex
                ? 'bg-indigo-50 dark:bg-indigo-900/30'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
            }`}
            onClick={() => onSelect(cmd.cmd)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <span className="text-lg flex-shrink-0">{cmd.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {cmd.cmd}
                </span>
                {cmd.args && (
                  <span className="text-xs text-zinc-400">{cmd.args}</span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {cmd.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { SLASH_COMMANDS }
