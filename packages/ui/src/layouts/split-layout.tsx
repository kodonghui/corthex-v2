import { cn } from '../utils'

export interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sideWidth?: string
  gap?: 'none' | 'sm' | 'md' | 'lg'
  reverse?: boolean
}

const gapMap = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }

export function SplitLayout({
  sideWidth = '320px',
  gap = 'md',
  reverse = false,
  className,
  children,
  ...props
}: SplitLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row w-full h-full min-h-0',
        reverse && 'md:flex-row-reverse',
        gapMap[gap],
        className,
      )}
      style={{ '--split-side-width': sideWidth } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

export function SplitLayoutSide({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'w-full md:w-[var(--split-side-width)] md:shrink-0 overflow-auto',
        className,
      )}
      {...props}
    />
  )
}

export function SplitLayoutMain({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 min-w-0 overflow-auto', className)}
      {...props}
    />
  )
}
