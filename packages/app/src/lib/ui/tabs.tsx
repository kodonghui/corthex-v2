import { cn } from './utils'

export type TabItem = {
  value: string
  label: string
  shortLabel?: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0', className)}>
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 min-w-max">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => !item.disabled && onChange(item.value)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors min-w-[80px] text-center snap-start',
              value === item.value
                ? 'text-indigo-600 dark:text-indigo-400'
                : item.disabled
                  ? 'text-zinc-300 dark:text-zinc-600 cursor-default'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
            )}
          >
            {item.shortLabel ? (
              <>
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.shortLabel}</span>
              </>
            ) : (
              item.label
            )}
            {item.disabled && (
              <span className="ml-1 text-[10px] text-zinc-400 dark:text-zinc-600">...</span>
            )}
            {value === item.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
