import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-[#f5f0e8] text-[#6b705c] ring-[#e5e1d3]',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        error: 'bg-red-50 text-[#c4622d] ring-[#c4622d]/20',
        info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        brand: 'bg-[#606C38]/10 text-[#606C38] ring-[#606C38]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
