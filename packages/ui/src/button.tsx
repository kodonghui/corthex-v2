import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#606C38] text-white hover:bg-[#7a8f5a] focus-visible:ring-[#606C38]',
        primary: 'bg-[#606C38] text-white hover:bg-[#7a8f5a] focus-visible:ring-[#606C38]',
        secondary: 'bg-[#f5f0e8] text-[#283618] border border-[#e5e1d3] hover:bg-[#e5e1d3] focus-visible:ring-[#606C38]',
        ghost: 'text-[#6b705c] hover:bg-[#f5f0e8] hover:text-[#283618]',
        danger: 'bg-[#c4622d] text-white hover:bg-[#b5571f] focus-visible:ring-[#c4622d]',
        outline: 'border border-[#e5e1d3] bg-transparent text-[#283618] hover:bg-[#f5f0e8] focus-visible:ring-[#606C38]',
        destructive: 'bg-[#c4622d] text-white hover:bg-[#b5571f] focus-visible:ring-[#c4622d]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { buttonVariants }
