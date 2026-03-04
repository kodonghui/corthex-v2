import { cn } from './utils'

const statusStyles: Record<string, string> = {
  online: 'bg-emerald-500',
  working: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-zinc-300 dark:bg-zinc-600',
}

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  size?: 'sm' | 'md'
}

export function StatusDot({ status, size = 'sm', className, ...props }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        statusStyles[status] || statusStyles.offline,
        className,
      )}
      title={status}
      {...props}
    />
  )
}
