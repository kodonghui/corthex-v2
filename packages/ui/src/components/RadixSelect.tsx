/**
 * RadixSelect — Radix UI Select with Natural Organic styling.
 */
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '../utils'

export interface RadixSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadixSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: RadixSelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
}

export function RadixSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled,
  error,
  className,
}: RadixSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex items-center justify-between w-full rounded-lg border px-3 py-2 text-sm transition-all',
          'bg-white text-[#1a1a1a] outline-none',
          'focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-[#c4622d] focus:ring-[#c4622d]/40'
            : 'border-[#e5e1d3] focus:ring-[#606C38]/40 focus:border-[#606C38]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[placeholder]:text-[#a3a08e]',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ml-2">
          <svg className="w-4 h-4 text-[#6b705c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 overflow-hidden rounded-lg border border-[#e5e1d3] bg-white shadow-lg animate-[scaleIn_150ms_ease-out]"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  'relative flex items-center rounded-md px-3 py-2 text-sm cursor-pointer select-none outline-none',
                  'text-[#1a1a1a] data-[highlighted]:bg-[#f5f0e8] data-[highlighted]:text-[#283618]',
                  'data-[disabled]:text-[#a3a08e] data-[disabled]:pointer-events-none',
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
