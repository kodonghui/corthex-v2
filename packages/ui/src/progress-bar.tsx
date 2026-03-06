import { cn } from './utils'

export interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700', className)} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
