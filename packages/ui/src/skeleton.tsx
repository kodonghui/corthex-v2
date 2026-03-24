import { cn } from './utils'

export type SkeletonVariant = 'text' | 'avatar' | 'card' | 'table-row'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg bg-[#e5e1d3]/60',
        'animate-pulse motion-safe:animate-[shimmer_1.5s_ease-in-out_infinite]',
        'bg-gradient-to-r from-[#e5e1d3]/60 via-[#f5f0e8] to-[#e5e1d3]/60 bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}

/** Text skeleton — single line placeholder */
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/** Avatar skeleton — circular placeholder */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }
  return <Skeleton className={cn('rounded-full', sizeMap[size])} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#e5e1d3] bg-white p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}
