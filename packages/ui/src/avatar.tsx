import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full overflow-hidden font-medium select-none transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

type AvatarProps = VariantProps<typeof avatarVariants> & {
  src?: string
  alt?: string
  name?: string
  className?: string
}

export function Avatar({ src, alt, name, size, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={cn(avatarVariants({ size }), 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', className)}>
      {src ? (
        <img src={src} alt={alt ?? name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
