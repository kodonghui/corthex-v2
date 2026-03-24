/**
 * TabNav — Horizontal tab bar using Radix Tabs.
 * Badge count support per tab, keyboard accessible.
 */
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '../utils'

export interface TabNavItem {
  value: string
  label: string
  /** Badge count (shown as small pill) */
  badge?: number
  disabled?: boolean
}

export interface TabNavProps {
  items: TabNavItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TabNav({ items, value, onChange, className }: TabNavProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onChange} className={className}>
      <RadixTabs.List
        className="flex border-b border-[#e5e1d3] overflow-x-auto"
        aria-label="Navigation tabs"
      >
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              'outline-none focus-visible:ring-2 focus-visible:ring-[#606C38]/40 focus-visible:ring-offset-0',
              'data-[state=active]:text-[#283618]',
              'data-[state=inactive]:text-[#6b705c] data-[state=inactive]:hover:text-[#283618]',
              'disabled:text-[#a3a08e] disabled:cursor-default',
            )}
          >
            <span className="flex items-center gap-2">
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-[#606C38] text-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            {/* Active indicator line */}
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#606C38] scale-x-0 data-[state=active]:scale-x-100 transition-transform" />
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  )
}
