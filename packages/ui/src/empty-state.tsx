import { cn } from './utils'

export type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'loading'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  variant?: EmptyStateVariant
}

const variantDefaults: Record<EmptyStateVariant, { iconColor: string }> = {
  'no-data': { iconColor: 'text-[#a3a08e]' },
  'no-results': { iconColor: 'text-[#6b705c]' },
  'error': { iconColor: 'text-[#c4622d]' },
  'loading': { iconColor: 'text-[#606C38]' },
}

export function EmptyState({ icon, title, description, action, variant = 'no-data', className, ...props }: EmptyStateProps) {
  const { iconColor } = variantDefaults[variant]
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)} {...props}>
      {icon && <div className={cn('mb-3', iconColor)}>{icon}</div>}
      <h3 className="text-sm font-medium text-[#1a1a1a]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[#6b705c]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
