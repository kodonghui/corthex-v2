import { cn } from '../utils'

export interface StackLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const gapMap = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }
const paddingMap = { none: '', sm: 'p-2', md: 'p-4', lg: 'p-6' }
const maxWidthMap = { sm: 'max-w-xl', md: 'max-w-3xl', lg: 'max-w-5xl', xl: 'max-w-7xl', full: '' }

export function StackLayout({
  gap = 'md',
  padding = 'md',
  maxWidth = 'full',
  className,
  children,
  ...props
}: StackLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full mx-auto',
        gapMap[gap],
        paddingMap[padding],
        maxWidthMap[maxWidth],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
