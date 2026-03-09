import { cn } from '@corthex/ui'

type ScrollToBottomProps = {
  onClick: () => void
  visible: boolean
  className?: string
}

export function ScrollToBottom({ onClick, visible, className }: ScrollToBottomProps) {
  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-6 z-10 p-3 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200',
        'animate-in fade-in slide-in-from-bottom-2',
        className
      )}
      aria-label="맨 아래로 스크롤"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  )
}
