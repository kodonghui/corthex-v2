import { cn } from '../utils'

export interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const gapMap = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }
const paddingMap = { none: '', sm: 'p-2', md: 'p-4', lg: 'p-6' }

export function DashboardLayout({
  gap = 'md',
  padding = 'md',
  className,
  children,
  ...props
}: DashboardLayoutProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        '[&>*]:min-h-0',
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

export interface DashboardWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3
  rowSpan?: 1 | 2
}

const colSpanMap = {
  1: '',
  2: 'md:col-span-2',
  3: 'md:col-span-2 xl:col-span-3',
}

const rowSpanMap = {
  1: '',
  2: 'row-span-2',
}

export function DashboardWidget({
  span = 1,
  rowSpan = 1,
  className,
  children,
  ...props
}: DashboardWidgetProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-[#e5e1d3]/60 shadow-sm overflow-hidden',
        colSpanMap[span],
        rowSpanMap[rowSpan],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
