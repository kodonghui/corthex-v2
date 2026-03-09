import { cn } from './utils'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md'
}

export function Toggle({ checked, onChange, disabled, label, size = 'md' }: ToggleProps) {
  const trackSize = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]'
  const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const thumbTranslate = size === 'sm' ? 'translate-x-[14px]' : 'translate-x-[18px]'

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200',
          trackSize,
          checked
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-zinc-300 dark:bg-zinc-600',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200',
            thumbSize,
            'mt-[2px] ml-[2px]',
            checked ? thumbTranslate : 'translate-x-0',
          )}
        />
      </button>
      {label && <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>}
    </label>
  )
}
