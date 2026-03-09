import { cn } from './utils'

export type SelectOption = {
  value: string
  label: string
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
  placeholder?: string
  error?: boolean
}

export function Select({ className, options, placeholder, error, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-all duration-200 appearance-none',
        'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'dark:bg-zinc-800 dark:text-zinc-100',
        error
          ? 'border-red-300 focus:ring-red-500/40 dark:border-red-700'
          : 'border-zinc-300 focus:ring-indigo-500/40 dark:border-zinc-700',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
