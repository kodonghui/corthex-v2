import { cn } from './utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200',
        'placeholder:text-zinc-400',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500',
        error
          ? 'border-red-300 focus:ring-red-500/40 dark:border-red-700'
          : 'border-zinc-300 focus:ring-indigo-500/40 dark:border-zinc-700',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
