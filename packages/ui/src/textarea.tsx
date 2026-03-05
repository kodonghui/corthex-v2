import { useEffect, useRef } from 'react'
import { cn } from './utils'

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  error?: boolean
  maxRows?: number
}

export function Textarea({ className, error, maxRows, rows = 3, onChange, value, ...props }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const maxHeight = maxRows ? maxRows * 24 : undefined
    const newHeight = maxHeight ? Math.min(el.scrollHeight, maxHeight) : el.scrollHeight
    el.style.height = `${newHeight}px`
  }, [value, maxRows])

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={onChange}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200 resize-none',
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
