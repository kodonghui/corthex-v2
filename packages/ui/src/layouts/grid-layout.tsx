import { cn } from '../utils'

export interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
  gap?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const gapMap = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }
const paddingMap = { none: '', sm: 'p-2', md: 'p-4', lg: 'p-6' }
const colMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function GridLayout({
  columns = 3,
  gap = 'md',
  padding = 'md',
  className,
  children,
  ...props
}: GridLayoutProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        colMap[columns],
        gapMap[gap],
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
