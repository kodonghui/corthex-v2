import { cn } from './utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  helperText?: string
}

export function Input({ className, error, label, helperText, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const input = (
    <input
      id={inputId}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1a1a1a] transition-all duration-200',
        'placeholder:text-[#a3a08e]',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-[#c4622d] focus:ring-[#c4622d]/40'
          : 'border-[#e5e1d3] focus:ring-[#606C38]/40 focus:border-[#606C38]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      aria-invalid={error || undefined}
      aria-describedby={helperText && inputId ? `${inputId}-helper` : undefined}
      {...props}
    />
  )

  if (!label && !helperText) return input

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#1a1a1a]">
          {label}
        </label>
      )}
      {input}
      {helperText && (
        <p
          id={inputId ? `${inputId}-helper` : undefined}
          className={cn('text-xs', error ? 'text-[#c4622d]' : 'text-[#6b705c]')}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
