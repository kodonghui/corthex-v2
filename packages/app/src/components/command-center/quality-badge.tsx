import { cn } from '@corthex/ui'
import type { QualityGrade } from './types'

const gradeConfig: Record<QualityGrade, { bg: string; text: string; label: string }> = {
  S: { bg: 'bg-indigo-500', text: 'text-white', label: '최상' },
  A: { bg: 'bg-emerald-500', text: 'text-white', label: '우수' },
  B: { bg: 'bg-blue-500', text: 'text-white', label: '양호' },
  C: { bg: 'bg-amber-500', text: 'text-white', label: '보통' },
  F: { bg: 'bg-red-500', text: 'text-white', label: '미흡' },
}

type QualityBadgeProps = {
  grade: QualityGrade
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QualityBadge({ grade, showLabel = false, size = 'md', className }: QualityBadgeProps) {
  const config = gradeConfig[grade]
  
  const sizeStyles = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-5 h-5 text-[10px]',
    lg: 'w-6 h-6 text-xs',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'rounded font-bold flex items-center justify-center',
          config.bg,
          config.text,
          sizeStyles[size]
        )}
      >
        {grade}
      </span>
      {showLabel && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
          {config.label}
        </span>
      )}
    </div>
  )
}

type QualityIndicatorProps = {
  grade?: QualityGrade
  cost?: number
  durationMs?: number
  className?: string
}

export function QualityIndicator({ grade, cost, durationMs, className }: QualityIndicatorProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    const sec = Math.floor(ms / 1000)
    if (sec < 60) return `${sec}초`
    const min = Math.floor(sec / 60)
    const remainSec = sec % 60
    return remainSec > 0 ? `${min}분 ${remainSec}초` : `${min}분`
  }

  return (
    <div className={cn('flex items-center gap-3 text-[10px] text-zinc-400', className)}>
      {grade && <QualityBadge grade={grade} showLabel />}
      {cost !== undefined && (
        <span className="flex items-center gap-1">
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          비용: ${cost.toFixed(3)}
        </span>
      )}
      {durationMs !== undefined && (
        <span className="flex items-center gap-1">
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          {formatDuration(durationMs)}
        </span>
      )}
    </div>
  )
}
