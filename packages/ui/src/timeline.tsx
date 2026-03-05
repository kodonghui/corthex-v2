import { cn } from './utils'
import type { ReactNode } from 'react'

export interface TimelineItem {
  id: string
  dotColor?: string
  content: ReactNode
}

export interface TimelineGroupProps {
  label: string
  items: TimelineItem[]
}

export function TimelineGroup({ label, items }: TimelineGroupProps) {
  return (
    <div className="mb-6">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 pl-8">
        {label}
      </div>
      <div className="relative">
        {/* 세로선 */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-700" />

        {items.map((item) => (
          <div key={item.id} className="relative flex gap-3 py-1.5 group">
            {/* 도트 */}
            <div
              className={cn(
                'w-[18px] h-[18px] rounded-full mt-1 z-10 border-2 border-white dark:border-zinc-900 flex-shrink-0',
                item.dotColor || 'bg-zinc-400',
              )}
            />
            {/* 카드 슬롯 */}
            <div className="flex-1 min-w-0">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
