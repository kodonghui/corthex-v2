import { cn } from './utils'

export interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  icon?: string
  count?: number
}

export function FilterChip({ label, active, onClick, icon, count }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors',
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700',
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {count != null && <span className="ml-1 opacity-80">({count})</span>}
    </button>
  )
}
