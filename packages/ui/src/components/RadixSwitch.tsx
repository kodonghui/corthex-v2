/**
 * RadixSwitch — Radix UI Switch with label.
 */
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../utils'

export interface RadixSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function RadixSwitch({
  checked,
  onCheckedChange,
  disabled,
  label,
  size = 'md',
  className,
}: RadixSwitchProps) {
  const trackSize = size === 'sm' ? 'w-8 h-[18px]' : 'w-10 h-[22px]'
  const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const thumbTranslate = size === 'sm' ? 'data-[state=checked]:translate-x-[14px]' : 'data-[state=checked]:translate-x-[18px]'

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606C38]/40 focus-visible:ring-offset-2',
          trackSize,
          'data-[state=checked]:bg-[#606C38] data-[state=unchecked]:bg-[#d4cfc4]',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200',
            thumbSize,
            'mt-[2px] ml-[2px] translate-x-0',
            thumbTranslate,
          )}
        />
      </SwitchPrimitive.Root>
      {label && <span className="text-sm text-[#1a1a1a]">{label}</span>}
    </label>
  )
}
